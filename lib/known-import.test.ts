import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { importVerdict, verdictLabel, type ExistingRow } from "./known-import";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { isVeterinaryDiet } from "./vet-diet";
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
  //
  // Compared across PRODUCTS, not across barcodes, which is not the same thing
  // any more. Batch 017 seeded dry food, and a bag of Friskies is sold in five
  // sizes under five barcodes with one recipe — so the same fingerprint under
  // several codes became the normal case rather than the symptom.
  //
  // Keyed on brand + line + variant, because that is what "one product" means
  // on a shelf. Two DIFFERENT products with one fingerprint is still the paste
  // error, and still caught.
  it("no two products share a composition", () => {
    // The one pair allowed to share, because the shelf really does: Royal
    // Canin prints ONE recipe for Medium and Large Dental Care. They are
    // different products — kibble size, and the panels prove independent
    // manufacture (3712 vs 3705 kcal/kg, 260 vs 304 kcal/cup) — not a
    // copy-paste, which is what this test exists to catch.
    const ALLOWED_SHARED = new Set([
      "Royal Canin Canine Care Nutrition Large Dental Care / Royal Canin Canine Care Nutrition Medium Dental Care",
    ]);
    const productOf = new Map<string, string>();
    for (const p of KNOWN_PRODUCTS) {
      for (const pkg of p.packages) {
        productOf.set(pkg.upc, `${p.brand} ${p.line} ${p.variant}`);
      }
    }
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [upc, formula] of Object.entries(KNOWN_FORMULAS)) {
      const key = compositionKey("Purina", formula.ingredients);
      if (!key) continue;
      const name = productOf.get(upc) ?? upc;
      const already = seen.get(key);
      if (already && already !== name) {
        const pair = [already, name].sort().join(" / ");
        if (!ALLOWED_SHARED.has(pair)) dupes.push(pair);
      } else if (!already) seen.set(key, name);
    }
    expect(dupes).toEqual([]);
  });

  // Every pack size of one product must carry the SAME RECIPE — the sibling of
  // the test above, and the reason that one could be relaxed safely.
  //
  // A 3 lb bag and a 16 lb bag of one recipe are one formula printed twice. If
  // the ingredients disagree, either two products have been merged under one
  // name or one size's list came from a different source, and both are worth
  // stopping: the barcodes are interchangeable to a reader, so whichever they
  // happen to scan decides what they are told.
  //
  // ── Why the glosses are stripped before comparing ─────────────────────
  //
  // Purina prints Party Mix in a foil pouch and a screw-top canister, and the
  // two decks differ — not in ingredients, in PARENTHESES. The pouch says
  // "niacin (Vitamin B-3)" and "L-ascorbyl-2-polyphosphate (Vitamin C)"; the
  // canister says "niacin" and "L-ascorbyl-2-polyphosphate". Same substances,
  // same order, same count. The source says outright that the declaration is
  // package-format-specific.
  //
  // Both are stored as printed, because §4's rule is copy, do not tidy, and
  // deciding which gloss is "the real one" would be writing a label. What the
  // test asks is the question that matters — is this the same food — so it
  // removes the parentheticals from both sides first. That direction is safe:
  // stripping only ever makes two lists MORE alike, so a pass here can be a
  // notation difference, but a failure is always a real one.
  it("gives every size of one product the same recipe", () => {
    // Parentheticals out, then down to the bare word sequence — punctuation and
    // spacing collapsed together, so that removing "(Vitamin B-3)" does not
    // leave a space before the comma and count as a difference.
    const recipe = (text: string) =>
      text
        .replace(/\([^()]*\)/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    const bad: string[] = [];
    for (const p of KNOWN_PRODUCTS) {
      const seen = new Set(
        p.packages
          .map((pkg) => KNOWN_FORMULAS[pkg.upc])
          .filter(Boolean)
          .map((f) => recipe(f.ingredients))
      );
      if (seen.size > 1) bad.push(`${p.brand} ${p.line} ${p.variant}`);
    }
    expect(bad).toEqual([]);
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
  //
  // ── Why the bounds depend on the food form ─────────────────────────────
  //
  // This was one pair of bounds — moisture 60–90, protein ≤20 — for sixteen
  // batches, and they were right about every one of them, because every product
  // was wet. They are not a rule about as-fed panels. They are a rule about
  // as-fed panels ON CANNED FOOD.
  //
  // A bag of kibble is ~10–12% moisture and 30–35% protein AS FED. Those are
  // the printed figures, not dry-matter ones. Under the old bounds every dry
  // product in batch 017 looked exactly like the mistake this test hunts —
  // which is the trap: the check would have been loudest precisely where it was
  // wrong, and the obvious way to quiet it is to "fix" correct data.
  //
  // So the bounds are per form. The check still does its real job in both: a
  // dry-matter figure in a wet panel reads as low moisture and high protein,
  // and in a DRY panel it reads as moisture near zero — dry matter of a 10%
  // moisture food is 90% of it, so its dry-matter protein is only about a
  // ninth higher than as-fed, and the floor on moisture is what catches it.
  const BOUNDS = {
    wet: { moisture: [60, 90], protein: [0, 20] },
    dry: { moisture: [5, 20], protein: [0, 50] },
  } as const;
  const formOf = new Map<string, "wet" | "dry">();
  for (const p of KNOWN_PRODUCTS) {
    for (const pkg of p.packages) formOf.set(pkg.upc, p.foodForm);
  }

  it("reads as an as-fed panel, not a dry-matter one", () => {
    for (const [upc, f] of Object.entries(KNOWN_FORMULAS)) {
      const a = f.analysis;
      const b = BOUNDS[formOf.get(upc) ?? "wet"];
      const m = a.moistureMax ?? 0;
      const pr = a.crudeProteinMin ?? 0;
      expect({ upc, ok: m >= b.moisture[0] && m <= b.moisture[1] }).toEqual({
        upc,
        ok: true,
      });
      expect({ upc, ok: pr > b.protein[0] && pr <= b.protein[1] }).toEqual({
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
  //
  // Scoped to decks that STATE a figure, which is not a weakening: the mistake
  // being caught is a kitten tin carrying 0.05, and that is still caught. What
  // changed is that stating nothing became possible — Hill's prints no taurine
  // guarantee on any of its twenty cans, kitten ones included, so requiring a
  // figure would have been requiring Purina's label habits of another maker.
  //
  // A null here means the panel is silent, which the report already treats as
  // its own signal. Writing 0.07 into it to satisfy this test would put a
  // number on a label that has none — the same error `ga`'s taurine note
  // describes, in the direction that looks like diligence.
  //
  // Scoped to WET food, and this is the second bound in this file that turned
  // out to be about canned food rather than about cat food. 0.07% is a figure
  // in a tin that is 78% water. Dry food states 0.12% as fed, and states it on
  // adult bags as well as kitten ones — every dry product in batch 017 that
  // guarantees taurine at all guarantees 0.12, whatever it is fed to.
  //
  // So on dry food this comparison has no signal in it: matching the adult
  // figure is not evidence of anything, because the adult figure IS the kitten
  // figure. A test that cannot fail on a class of input should say so rather
  // than pass and be counted.
  it("keeps the kitten taurine guarantee at what the deck says", () => {
    const kittens = KNOWN_PRODUCTS.filter(
      (p) => p.lifeStage === "kitten" && p.foodForm === "wet"
    );
    expect(kittens.length).toBeGreaterThan(0);
    const stated = kittens
      .flatMap((p) => p.packages.map((k) => k.upc))
      .filter((upc) => KNOWN_FORMULAS[upc]?.analysis.taurineMin !== null);
    expect(stated.length).toBeGreaterThan(0);
    for (const upc of stated) {
      expect({ upc, taurine: KNOWN_FORMULAS[upc]?.analysis.taurineMin }).toEqual({
        upc,
        taurine: 0.07,
      });
    }
  });

  // The field says what a deck said, never what a name suggests. A range name
  // on the front of the pack — "Kitten", "Senior 7+" — is the one place it may
  // be inferred from, and everywhere else it has to come from an AAFCO
  // statement somebody actually read.
  it("claims a life stage only where one was stated", () => {
    const stated = KNOWN_PRODUCTS.filter((p) => p.lifeStage !== undefined);
    for (const p of stated) {
      expect({
        name: `${p.line} ${p.variant}`,
        // `puppy` joined with the first dog foods (Royal Canin, batch 019).
        ok: ["kitten", "puppy", "adult", "senior", "all"].includes(
          p.lifeStage as string
        ),
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

  // `senior` is the one value with no AAFCO wording behind it: AAFCO recognises
  // growth, maintenance and all-life-stages, and nothing else. A Senior 7+ tin
  // states maintenance on its panel and "7+" on its front, so the field is
  // recording the range, not the nutritional claim.
  //
  // That is fine as long as it stays tied to a range that prints an age. Set
  // `senior` on a tin whose front does not say so and the field has quietly
  // become a guess about an animal's age — which is not a thing any deck says.
  //
  // ── Why this matches a marker and not a range name ────────────────────
  //
  // It was written as `line === "Senior 7+"` when Fancy Feast was the only
  // senior range we held, and that was too narrow by one batch: Hill's calls
  // the same shelf "Adult 7+". Pinning to a maker's chosen wording would have
  // made every other maker's senior food unfileable, which is not the rule —
  // the rule is that an age is printed. So the marker is what is matched, and
  // "7+" and "Senior" are both markers. `\b7\s*\+` rather than "7+" so that a
  // range which writes it "7 +" still passes and one that happens to contain a
  // 7 in another position does not.
  it("sets senior only where the range prints an age", () => {
    const seniors = KNOWN_PRODUCTS.filter((p) => p.lifeStage === "senior");
    expect(seniors.length).toBeGreaterThan(0);
    for (const p of seniors) {
      // Matched against line AND variant: Fancy Feast prints the age in the
      // range name ("Senior 7+"), Royal Canin prints it in the product name
      // inside an ageless range — "Indoor 7+" and "Aging 12+" sit in "Feline
      // Health Nutrition". "Mature" joined the markers with Royal Canin too:
      // "Mature Adult in Gel" is that pack's whole front-of-tin age claim.
      const printsAge = /\bsenior\b|\bmature\b|\bag(e)?ing\b|\b\d+\s*\+/i.test(
        `${p.line} ${p.variant}`
      );
      expect({ name: `${p.line} ${p.variant}`, printsAge }).toEqual({
        name: `${p.line} ${p.variant}`,
        printsAge: true,
      });
    }
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
  // The import route asks `isVeterinaryDiet` for every seeded product and
  // writes the answer to `requires_vet`, which the consumer report reads to
  // decide whether to judge the food by the everyday standard.
  //
  // Two ways that goes wrong, and this test is about both:
  //
  //   - A therapeutic diet read as an everyday food. The report then asks "is
  //     there real named meat near the top" about a renal or hydrolysed diet,
  //     whose whole design is to not have that — and says so, about a food a
  //     vet prescribed. `requires_vet` was hardcoded `false` here for fourteen
  //     batches, which was harmless only because every product was Purina and
  //     none was therapeutic.
  //   - An everyday food read as a therapeutic one, which drops the standard
  //     for a supermarket product nobody prescribed. Science Diet is sold off
  //     a shelf and must NOT trip this; Prescription Diet must.
  //
  // Written against the seed rather than against invented strings, because the
  // question is whether the detector fires on the names we actually store.
  it("recognises every prescription product and no retail one", () => {
    const vet = KNOWN_PRODUCTS.filter((p) =>
      isVeterinaryDiet(p.brand, p.line, p.variant)
    );
    // Every vet-channel product we hold, and nothing else. Two shapes of
    // evidence: Hill's puts it in the BRAND ("Prescription Diet"), Royal
    // Canin in the LINE ("Veterinary Diet" for cats, "Veterinary Health
    // Nutrition" for dogs) under one retail brand name.
    const RC_VET_LINES = new Set(["Veterinary Diet", "Veterinary Health Nutrition"]);
    expect(vet.map((p) => `${p.brand} ${p.line}`).sort()).toEqual(
      KNOWN_PRODUCTS.filter(
        (p) => p.brand.includes("Prescription Diet") || RC_VET_LINES.has(p.line)
      )
        .map((p) => `${p.brand} ${p.line}`)
        .sort()
    );
    expect(vet.length).toBeGreaterThan(0);
    // Named explicitly: the shelf ranges that share a maker with a vet channel.
    for (const p of KNOWN_PRODUCTS.filter((p) => p.brand === "Hill's Science Diet")) {
      expect({
        name: `${p.line} ${p.variant}`,
        vet: isVeterinaryDiet(p.brand, p.line, p.variant),
      }).toEqual({ name: `${p.line} ${p.variant}`, vet: false });
    }
    for (const p of KNOWN_PRODUCTS.filter(
      (p) => p.brand === "Royal Canin" && !RC_VET_LINES.has(p.line)
    )) {
      expect({
        name: `${p.line} ${p.variant}`,
        vet: isVeterinaryDiet(p.brand, p.line, p.variant),
      }).toEqual({ name: `${p.line} ${p.variant}`, vet: false });
    }
  });

  // Section D of docs/CATALOG-CONFLICTS.md tracked four guarantees the model
  // could not hold, over four batches, and each entry named the products. The
  // `extras` list closed all four. This pins the ones the doc named, so that
  // "unstorable" cannot quietly become "not stored" again.
  it("stores the guarantees section D spent four batches unable to hold", () => {
    const extrasOf = (upc: string) =>
      Object.fromEntries(
        (KNOWN_FORMULAS[upc]?.analysis.extras ?? []).map((e) => [
          e.nutrient,
          `${e.value} ${e.unit} ${e.basis}`,
        ])
      );
    // D1 — the three kitten calcium minima, open since batch 009.
    for (const upc of ["050000575008", "050000574988", "050000502585"]) {
      expect({ upc, calcium: extrasOf(upc)["Calcium"] }).toEqual({
        upc,
        calcium: "0.3 % min",
      });
    }
    // D3 — vitamin E in IU/kg, a unit the named fields cannot express.
    for (const upc of ["050000503827", "050000503841"]) {
      expect({ upc, e: extrasOf(upc)["Vitamin E"] }).toEqual({
        upc,
        e: "40 IU/kg min",
      });
    }
    // D5 — a fibre MINIMUM, on the hairball formula that is bought for it.
    expect(extrasOf("052742453101")["Crude Fiber"]).toBe("2 % min");
    // D8 — the omega pair, on a Sensitive Stomach & Skin deck, which is a range
    // sold for exactly the thing these two figures are about.
    const omega = extrasOf("052742010243");
    expect(omega["Omega-6 Fatty Acids"]).toBeTruthy();
    expect(omega["Omega-3 Fatty Acids"]).toBeTruthy();
  });

  // A unit that is not a percentage is the whole reason this is a list rather
  // than more named fields, so at least one has to survive in the seed.
  it("keeps a guarantee whose unit is not a percentage", () => {
    const units = new Set(
      Object.values(KNOWN_FORMULAS).flatMap((f) =>
        (f.analysis.extras ?? []).map((e) => e.unit)
      )
    );
    expect(units.has("%")).toBe(true);
    expect(units.has("IU/kg")).toBe(true);
  });

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
