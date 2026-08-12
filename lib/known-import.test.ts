import { describe, expect, it } from "vitest";
import { importVerdict, verdictLabel, type ExistingRow } from "./known-import";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_PRODUCTS } from "../data/known-products";
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
      // Taurine is a fraction of a percent on every cat food that adds it.
      expect({ upc, ok: (a.taurineMin ?? 0) > 0 && (a.taurineMin ?? 0) < 1 }).toEqual({
        upc,
        ok: true,
      });
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

  it("keeps the note where the source flagged an older formula", () => {
    // 11% protein historically, 9% now, under one barcode.
    expect(KNOWN_FORMULAS["050000424948"].conflict).toBeTruthy();
    expect(KNOWN_FORMULAS["050000423347"].conflict).toBeTruthy();
    // And no note where the source raised none.
    expect(KNOWN_FORMULAS["050000429943"].conflict).toBeUndefined();
  });
});
