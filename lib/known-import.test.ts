import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { importVerdict, verdictLabel, type ExistingRow } from "./known-import";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { CONFUSABLE_PAIRS, WRONG_BARCODES } from "../data/wrong-barcodes";
import { compositionKey } from "./composition-key";
import { hasAnyFigure } from "./guaranteed-analysis";

function row(over: Partial<ExistingRow> = {}): ExistingRow {
  return {
    source: "openfoodfacts",
    composition_key: "aaa",
    ingredients_text: "Chicken, Chicken Broth, Liver, Fish, Salt",
    ...over,
  };
}

describe("importVerdict", () => {
  it("writes when nothing is there", () => {
    expect(importVerdict(null, "bbb")).toBe("write");
    expect(importVerdict(undefined, "bbb")).toBe("write");
  });

  // The whole reason the barcodes waited for a composition: a row that holds a
  // name and no ingredients is not a product, it is a shadow over the open
  // databases. Filling it in is the point.
  it("writes over a row that has no composition", () => {
    expect(importVerdict(row({ ingredients_text: null }), "bbb")).toBe("write");
    expect(importVerdict(row({ ingredients_text: "   " }), "bbb")).toBe("write");
  });

  // The ranking doing its job. Replacing an Open Food Facts list with a
  // better-sourced one is not the overwrite the rule is about — blocking it
  // would make the import useless for exactly the products OFF holds badly.
  it("replaces a worse-sourced list", () => {
    expect(importVerdict(row(), "bbb")).toBe("write");
    expect(importVerdict(row({ source: "openpetfoodfacts" }), "bbb")).toBe("write");
    expect(importVerdict(row({ source: null }), "bbb")).toBe("write");
  });

  // And the rule IS about equals: two community readings that disagree are two
  // formulas, and picking one by arrival order is how the other stops existing.
  it("will not silently replace another reading of equal standing", () => {
    expect(importVerdict(row({ source: "community", composition_key: "zzz" }), "bbb")).toBe(
      "conflict"
    );
  });

  it("does nothing when the composition is already ours", () => {
    expect(importVerdict(row({ composition_key: "bbb" }), "bbb")).toBe("identical");
  });

  // A photograph of the actual tin beats a retailer record, always. That is
  // what the source ranking has meant since the catalog existed.
  it("never touches our own capture", () => {
    expect(importVerdict(row({ source: "verified" }), "bbb")).toBe("ours-is-better");
    // Not even when told to force it: no amount of insistence makes a listing
    // more authoritative than the pack.
    expect(importVerdict(row({ source: "verified" }), "bbb", true)).toBe(
      "ours-is-better"
    );
  });

  // The case the source document leads with, and it is real: one barcode has
  // carried 11% protein and 9% protein at different times. Overwriting destroys
  // the only evidence that happened.
  it("reports a different composition rather than walking over it", () => {
    expect(
      importVerdict(row({ source: "community", composition_key: "zzz" }), "bbb")
    ).toBe("conflict");
  });

  it("writes a conflict only when explicitly forced", () => {
    expect(
      importVerdict(row({ source: "community", composition_key: "zzz" }), "bbb", true)
    ).toBe("write");
  });

  // A stored list too thin to fingerprint is still a list somebody stored.
  it("treats an unfingerprintable stored composition as a conflict", () => {
    expect(
      importVerdict(
        row({
          source: "community",
          composition_key: null,
          ingredients_text: "Water, Beef",
        }),
        "bbb"
      )
    ).toBe("conflict");
  });

  it("has wording for every verdict", () => {
    for (const v of ["write", "identical", "ours-is-better", "conflict"] as const) {
      expect(verdictLabel(v).length).toBeGreaterThan(0);
    }
  });
});

describe("data/known-formulas.ts", () => {
  const upcs = KNOWN_PRODUCTS.flatMap((p) => p.packages.map((pkg) => pkg.upc));

  // A formula is OPTIONAL. Batch 002 arrived with its ingredient lists
  // paraphrased rather than copied — "mineral premix [potassium, zinc, iron]"
  // where the tin prints "Minerals [Potassium Chloride, Zinc Sulfate, Ferrous
  // Sulfate]" — and measured on one list written both ways that costs the
  // report half of what it can read. So those products are seeded as identity
  // only: they show on the coverage page with a barcode to look for, and the
  // import steps over them until verbatim text arrives.
  it("seeds identity with or without a formula", () => {
    const withFormula = upcs.filter((u) => KNOWN_FORMULAS[u]);
    expect(withFormula.length).toBeGreaterThan(0);
    expect(withFormula.length).toBeLessThanOrEqual(upcs.length);
  });

  it("has no formula for a barcode nothing sells", () => {
    const orphans = Object.keys(KNOWN_FORMULAS).filter((u) => !upcs.includes(u));
    expect(orphans).toEqual([]);
  });

  // A composition that can't be fingerprinted can't be compared against a later
  // capture, which is how a duplicate gets in unnoticed.
  it("every composition is long enough to fingerprint", () => {
    const thin = Object.entries(KNOWN_FORMULAS)
      .filter(([, f]) => compositionKey("Purina", f.ingredients) === null)
      .map(([upc]) => upc);
    expect(thin).toEqual([]);
  });

  // Two products with the same fingerprint would be flagged as one recipe. It
  // happens legitimately, but not among 27 different flavours — here it means a
  // list was pasted twice.
  it("no two products share a composition", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [upc, formula] of Object.entries(KNOWN_FORMULAS)) {
      const key = compositionKey("Purina", formula.ingredients);
      if (!key) continue;
      const already = seen.get(key);
      if (already) dupes.push(`${already} / ${upc}`);
      else seen.set(key, upc);
    }
    expect(dupes).toEqual([]);
  });

  it("every panel carries real figures", () => {
    for (const [upc, formula] of Object.entries(KNOWN_FORMULAS)) {
      expect({ upc, any: hasAnyFigure(formula.analysis) }).toEqual({
        upc,
        any: true,
      });
    }
  });

  // Guarantees, as printed. A moisture above 90 or a protein above 50 in a
  // canned food means somebody typed a dry-matter figure into a wet-basis
  // panel, which would make every comparison against it wrong.
  it("reads as an as-fed panel, not a dry-matter one", () => {
    for (const [upc, f] of Object.entries(KNOWN_FORMULAS)) {
      const a = f.analysis;
      expect({ upc, ok: (a.moistureMax ?? 0) >= 60 && (a.moistureMax ?? 0) <= 90 }).toEqual({
        upc,
        ok: true,
      });
      expect({ upc, ok: (a.crudeProteinMin ?? 0) > 0 && (a.crudeProteinMin ?? 0) <= 20 }).toEqual({
        upc,
        ok: true,
      });
      // Taurine is a fraction of a percent on every cat food that STATES it —
      // and plenty of decks state nothing. Fancy Feast Delights With Cheddar
      // carries taurine in its ingredient list and guarantees no figure for it,
      // which is null here rather than zero. The check is on the figure when
      // there is one, not on there being one.
      if (a.taurineMin !== null) {
        expect({ upc, ok: a.taurineMin > 0 && a.taurineMin < 1 }).toEqual({
          upc,
          ok: true,
        });
      }
    }
  });

  // The order IS the data — American labels print by descending weight — so a
  // list that lost its order would silently misrepresent every product.
  it("keeps the first ingredient the source gave", () => {
    expect(KNOWN_FORMULAS["050000429943"].ingredients.startsWith("Chicken,")).toBe(true);
    // Gravy Lovers lead with broth; Shreds with water. That difference is what
    // the report reads.
    expect(KNOWN_FORMULAS["050000578450"].ingredients.startsWith("Chicken Broth,")).toBe(true);
    expect(
      KNOWN_FORMULAS["050000572014"].ingredients.startsWith("Water Sufficient for Processing,")
    ).toBe(true);
  });

  // The source called this one out explicitly: taurine is guaranteed and is not
  // in the list, and writing it in because the panel mentions it would be
  // inventing a line on a label.
  it("does not add taurine to the list that omits it", () => {
    const whitefish = KNOWN_FORMULAS["050000429646"];
    expect(whitefish.analysis.taurineMin).toBe(0.05);
    expect(/\bTaurine\b/.test(whitefish.ingredients)).toBe(false);
  });

  // The other half of the taurine rule, stated as data rather than as a
  // convention: a null is a deck that says nothing, and it must not drift into
  // a 0.05 copied off a sibling because the sibling looked similar.
  it("leaves taurine unstated where the deck states none", () => {
    const cheddar = [
      "050000579310",
      "050000579334",
      "050000579358",
      "050000579280",
    ];
    for (const upc of cheddar) {
      expect({ upc, taurine: KNOWN_FORMULAS[upc].analysis.taurineMin }).toEqual({
        upc,
        taurine: null,
      });
      // And it IS in the food — the list says so. The panel simply doesn't
      // quantify it, which is the distinction null exists to hold.
      expect(/\bTaurine\b/.test(KNOWN_FORMULAS[upc].ingredients)).toBe(true);
    }
  });

  // A bracket is a group the LABEL drew. Prime Filets Salmon & Beef closes its
  // vitamin bracket before menadione and lists it on its own afterwards, and
  // the source asked that it not be tidied on import. Pinned, because the
  // temptation to make one deck look like its eleven siblings is exactly the
  // sort of edit that gets made in passing and never noticed.
  it("leaves Vitamin K outside the bracket the deck put it outside of", () => {
    const list = KNOWN_FORMULAS["050000100422"].ingredients;
    const close = list.indexOf("Vitamin D-3 Supplement]");
    const k = list.indexOf("Menadione");
    expect(close).toBeGreaterThan(-1);
    expect(k).toBeGreaterThan(close);
  });

  // A Petites tub is 2.8 oz and holds two 1.4 oz servings under one barcode.
  // Its calorie statement is per SERVING, and reading "47 kcal" as the whole
  // package understates the tub by half — which is the sort of error that looks
  // like a diet plan rather than like a bug.
  it("keeps the Petites calorie statement per serving, not per package", () => {
    const petites = [
      "050000002597",
      "050000002504",
      "050000002528",
      "050000002610",
      "050000002603",
      "050000002580",
      "050000001590",
    ];
    for (const upc of petites) {
      const a = KNOWN_FORMULAS[upc].analysis;
      expect({ upc, serving: a.servingName }).toEqual({ upc, serving: "serving" });
      // And the two halves of the statement agree on a 1.4 oz half.
      const grams = 1.4 * 28.3495;
      const calc = ((a.kcalPerKg ?? 0) * grams) / 1000;
      expect({ upc, close: Math.abs(calc - (a.kcalPerServing ?? 0)) < 1.2 }).toEqual({
        upc,
        close: true,
      });
    }
  });

  // A case of tubs carries its own valid UPC — 050000504299 passes its check
  // digit exactly as the single tub does — and it circulates on pack listings.
  // Nothing about the number itself says it is the wrong object, which is why
  // this is a test and not a comment.
  it("never files a case or sibling code against a single package", () => {
    const upcs = new Set(
      KNOWN_PRODUCTS.flatMap((p) => p.packages.map((k) => k.upc))
    );
    // The list moved out of this test and into data/wrong-barcodes.ts, so
    // scripts/check-batch.mjs can warn about a code BEFORE anybody types the
    // batch in. It found the gap itself: 050000962648 was on the list, the
    // checker said "ok", and the list was somewhere only a test could see it.
    for (const w of WRONG_BARCODES) {
      expect({ code: w.code, is: w.is, filed: upcs.has(w.code) }).toEqual({
        code: w.code,
        is: w.is,
        filed: false,
      });
    }
  });

  // The other shape: not a code to avoid, two codes to keep apart. Both are
  // real products with real decks, and the hazard is filing one's ingredients
  // against the other's barcode — which nothing on the page would make look odd.
  it("keeps confusable products apart, with both of them present", () => {
    for (const pair of CONFUSABLE_PAIRS) {
      const a = KNOWN_FORMULAS[pair.a];
      const b = KNOWN_FORMULAS[pair.b];
      expect({ pair: `${pair.a}/${pair.b}`, both: !!a && !!b }).toEqual({
        pair: `${pair.a}/${pair.b}`,
        both: true,
      });
      // Different products means different lists. Identical text under two
      // codes would mean one deck was pasted against both.
      expect(a.ingredients).not.toEqual(b.ingredients);
    }
  });

  // Kitten food guarantees more taurine than adult food does, and the figure
  // must not be flattened to the 0.05 that the other hundred-odd packs state.
  //
  // Written against `lifeStage` rather than against a list of barcodes, so it
  // covers whatever arrives next — and so it is a cross-check rather than a
  // restatement: the field is set from the front of the pack and the taurine
  // comes off the panel, two independent readings that have to agree. A kitten
  // tin at 0.05 means one of the two was copied from an adult sibling.
  it("keeps the kitten taurine guarantee at what the deck says", () => {
    const kittens = KNOWN_PRODUCTS.filter((p) => p.lifeStage === "kitten");
    expect(kittens.length).toBeGreaterThan(0);
    for (const upc of kittens.flatMap((p) => p.packages.map((k) => k.upc))) {
      expect({ upc, taurine: KNOWN_FORMULAS[upc]?.analysis.taurineMin }).toEqual({
        upc,
        taurine: 0.07,
      });
    }
  });

  // The field says what a deck said, never what a name suggests. "Kitten" in a
  // product's own words is the one place it may be inferred from — that is the
  // range name on the front — and everywhere else it has to come from an AAFCO
  // statement somebody actually read.
  it("claims a life stage only where one was stated", () => {
    const stated = KNOWN_PRODUCTS.filter((p) => p.lifeStage !== undefined);
    for (const p of stated) {
      expect({
        name: `${p.line} ${p.variant}`,
        ok: ["kitten", "adult", "all"].includes(p.lifeStage as string),
      }).toEqual({ name: `${p.line} ${p.variant}`, ok: true });
    }
    // And the two that are neither plain adult nor plain kitten are still here:
    // an all-life-stages Shreds, and a kitten paté inside an adult range.
    expect(KNOWN_PRODUCTS.some((p) => p.lifeStage === "all")).toBe(true);
    expect(
      KNOWN_PRODUCTS.some(
        (p) => p.lifeStage === "kitten" && p.line !== "Kitten"
      )
    ).toBe(true);
  });

  // A Gems box holds two 2 oz mousses and the deck states calories per GEM.
  // Same trap as the Petites tub, one size up: read "48 kcal" as the box and
  // you have halved it.
  it("keeps the Gems calorie statement per gem, not per box", () => {
    const gems = [
      "050000544073",
      "050000544035",
      "050000544059",
      "050000544097",
      "050000589968",
      "050000593019",
    ];
    for (const upc of gems) {
      const a = KNOWN_FORMULAS[upc].analysis;
      expect({ upc, serving: a.servingName }).toEqual({ upc, serving: "gem" });
      const calc = ((a.kcalPerKg ?? 0) * 2 * 28.3495) / 1000;
      expect({ upc, close: Math.abs(calc - (a.kcalPerServing ?? 0)) < 1.2 }).toEqual({
        upc,
        close: true,
      });
    }
  });

  // Batch 006 arrived written as "KCl" and "B3 niacin". Neither is label text —
  // a US label names ingredients by their AAFCO definitions — so the shorthand
  // was expanded back on the way in. If it ever leaks through, the composition
  // stops matching its own siblings and the report loses tokens it can read.
  it("carries no source shorthand in a stored composition", () => {
    for (const [upc, f] of Object.entries(KNOWN_FORMULAS)) {
      expect({ upc, shorthand: /\bKCl\b|\bB\d\s|\bHCl\b/.test(f.ingredients) }).toEqual({
        upc,
        shorthand: false,
      });
    }
  });

  // The promise made when docs/CATALOG-CONFLICTS.md was written: a new
  // disagreement gets recorded there at the same time as the data, not
  // afterwards. A promise kept by memory is kept until the day it is busy.
  //
  // The one-sentence `conflict` note is what a person sees in the import panel;
  // the document is where the reasoning lives, and reasoning that exists only
  // in a commit message is reasoning nobody will find in November.
  it("has every conflict written down in docs/CATALOG-CONFLICTS.md", () => {
    const doc = readFileSync("docs/CATALOG-CONFLICTS.md", "utf8");
    const undocumented = Object.entries(KNOWN_FORMULAS)
      .filter(([upc, f]) => f.conflict && !doc.includes(upc))
      .map(([upc]) => upc);
    expect(undocumented).toEqual([]);
  });

  it("keeps the note where the source flagged an older formula", () => {
    // 11% protein historically, 9% now, under one barcode.
    expect(KNOWN_FORMULAS["050000424948"].conflict).toBeTruthy();
    expect(KNOWN_FORMULAS["050000423347"].conflict).toBeTruthy();
    // And no note where the source raised none.
    expect(KNOWN_FORMULAS["050000429943"].conflict).toBeUndefined();
  });
});
