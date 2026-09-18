import { describe, it, expect } from "vitest";
import {
  NO_ANALYSIS,
  hasAnyFigure,
  readGuaranteedAnalysis,
  readStoredAnalysis,
} from "./guaranteed-analysis";

/** The panel off a Fancy Feast can, as photographed. */
const REAL = {
  crude_protein_min: 11,
  crude_fat_min: 2,
  crude_fiber_max: 1.5,
  moisture_max: 80,
  ash_max: 2.7,
  taurine_min: 0.05,
  kcal_per_kg: 843,
  kcal_per_serving: 71,
  serving_name: "can",
};

describe("readGuaranteedAnalysis", () => {
  it("reads a real panel through unchanged", () => {
    expect(readGuaranteedAnalysis(REAL)).toEqual({
      crudeProteinMin: 11,
      crudeFatMin: 2,
      crudeFiberMax: 1.5,
      moistureMax: 80,
      ashMax: 2.7,
      taurineMin: 0.05,
      kcalPerKg: 843,
      kcalPerServing: 71,
      servingName: "can",
    });
  });

  it("reads a dry-food panel too", () => {
    const dry = readGuaranteedAnalysis({
      crude_protein_min: 30,
      crude_fat_min: 15,
      crude_fiber_max: 4,
      moisture_max: 12,
      ash_max: 8,
      kcal_per_kg: 3800,
      kcal_per_serving: 400,
      serving_name: "cup",
    });
    expect(dry.crudeProteinMin).toBe(30);
    expect(dry.moistureMax).toBe(12);
    expect(dry.servingName).toBe("cup");
  });

  it("has nothing to say about a missing panel", () => {
    for (const nothing of [null, undefined, "", 0, [], "n/a"]) {
      expect(readGuaranteedAnalysis(nothing)).toEqual(NO_ANALYSIS);
    }
  });

  it("drops a percentage that isn't one", () => {
    const out = readGuaranteedAnalysis({
      ...REAL,
      crude_protein_min: 110,
      crude_fat_min: -2,
      crude_fiber_max: "1.5",
      ash_max: NaN,
    });
    expect(out.crudeProteinMin).toBeNull();
    expect(out.crudeFatMin).toBeNull();
    expect(out.crudeFiberMax).toBeNull();
    expect(out.ashMax).toBeNull();
    // The ones that were readable survive.
    expect(out.moistureMax).toBe(80);
  });

  it("throws out a panel whose figures can't all be true", () => {
    // These are disjoint parts of the same 100 g. Over 100 means a misread,
    // and one wrong figure means the reading of the panel is not to be trusted
    // — a plausible wrong number is worse than a missing one.
    const impossible = readGuaranteedAnalysis({
      ...REAL,
      crude_protein_min: 40,
      moisture_max: 80,
      crude_fat_min: 20,
    });
    expect(impossible.crudeProteinMin).toBeNull();
    expect(impossible.moistureMax).toBeNull();
    expect(impossible.crudeFatMin).toBeNull();
    expect(impossible.ashMax).toBeNull();
  });

  it("keeps the calories when the percentages contradict each other", () => {
    // Calories are measured on a different axis and printed separately; they
    // are not implicated by percentages that don't add up.
    const out = readGuaranteedAnalysis({
      ...REAL,
      crude_protein_min: 60,
      moisture_max: 80,
    });
    expect(out.crudeProteinMin).toBeNull();
    expect(out.kcalPerKg).toBe(843);
    expect(out.kcalPerServing).toBe(71);
  });

  it("accepts a panel that exactly fills the hundred", () => {
    const out = readGuaranteedAnalysis({
      crude_protein_min: 10,
      crude_fat_min: 5,
      crude_fiber_max: 2,
      moisture_max: 80,
      ash_max: 3,
    });
    expect(out.moistureMax).toBe(80);
  });

  it("refuses calories that can't be per kilogram", () => {
    // 71 in the per-kilogram field is the per-can figure in the wrong place.
    expect(readGuaranteedAnalysis({ ...REAL, kcal_per_kg: 71 }).kcalPerKg).toBeNull();
    expect(readGuaranteedAnalysis({ ...REAL, kcal_per_kg: 84300 }).kcalPerKg).toBeNull();
  });

  it("won't keep a serving figure with nothing to call the serving", () => {
    // "71 kcal per what?" is not a fact.
    const out = readGuaranteedAnalysis({ ...REAL, serving_name: null });
    expect(out.kcalPerServing).toBeNull();
    expect(out.servingName).toBeNull();
  });

  it("won't accept a sentence as the serving's name", () => {
    const out = readGuaranteedAnalysis({
      ...REAL,
      serving_name: "one 3 oz can as fed to an adult cat",
    });
    expect(out.servingName).toBeNull();
    expect(out.kcalPerServing).toBeNull();
  });

  it("normalises the serving's name", () => {
    expect(readGuaranteedAnalysis({ ...REAL, serving_name: "  Can " }).servingName).toBe("can");
  });

  it("keeps taurine, which is small but not zero", () => {
    expect(readGuaranteedAnalysis(REAL).taurineMin).toBe(0.05);
  });
});

describe("hasAnyFigure", () => {
  it("is false for an empty panel", () => {
    expect(hasAnyFigure(NO_ANALYSIS)).toBe(false);
    expect(hasAnyFigure(readGuaranteedAnalysis(null))).toBe(false);
  });

  it("is true when a single figure was read", () => {
    expect(hasAnyFigure(readGuaranteedAnalysis({ moisture_max: 78 }))).toBe(true);
  });
});

// ── The stored shape, and the bug that made this file necessary ───────────
//
// Two readers, two shapes, and for a while one of them was used on the other's
// data. `readGuaranteedAnalysis` parses what the MODEL returns — snake_case,
// because that is what lib/extract.ts asks for. What gets STORED in
// `barcode_cache.guaranteed_analysis` is the PARSED result: camelCase
// `GuaranteedAnalysis`, written by app/api/process/route.ts and by the seed
// importer.
//
// The seed importer read the stored column with the snake_case parser. It
// found none of its keys, returned NO_ANALYSIS, and so reported "no analysis
// panel — worth re-shooting" for every photographed row in the catalog whether
// it had a panel or not. When the panel-fill pass was added on top, it wrote a
// panel and then read it back as absent, and offered the same four rows on
// every press forever.
describe("readStoredAnalysis", () => {
  /** What app/api/process/route.ts actually puts in the column. */
  const STORED = {
    crudeProteinMin: 11,
    crudeFatMin: 2,
    crudeFiberMax: 1.5,
    moistureMax: 80,
    ashMax: 2.7,
    taurineMin: 0.05,
    kcalPerKg: 900,
    kcalPerServing: 78,
    servingName: "can",
  };

  it("reads a panel the scanner wrote", () => {
    const back = readStoredAnalysis(STORED);
    expect(back).not.toBeNull();
    expect(back?.crudeProteinMin).toBe(11);
    expect(back?.moistureMax).toBe(80);
    expect(back?.kcalPerServing).toBe(78);
    expect(back?.servingName).toBe("can");
  });

  // The regression, stated as the round trip it is: write what the app writes,
  // read it with the reader the app reads with, and get a panel back. Anything
  // that breaks this silently empties the catalog's panels.
  it("round-trips what readGuaranteedAnalysis produced", () => {
    const parsed = readGuaranteedAnalysis(REAL);
    const back = readStoredAnalysis(JSON.parse(JSON.stringify(parsed)));
    expect(back).toEqual(parsed);
  });

  // The two readers are NOT interchangeable, and this says so in the direction
  // the mistake was actually made.
  it("is not the same as the model-output reader", () => {
    expect(hasAnyFigure(readGuaranteedAnalysis(STORED))).toBe(false);
    expect(readStoredAnalysis(STORED)).not.toBeNull();
    // And the mirror: the model's shape is not the stored shape either.
    expect(readStoredAnalysis(REAL)).toBeNull();
  });

  it("says null for a row that holds no figure at all", () => {
    expect(readStoredAnalysis(null)).toBeNull();
    expect(readStoredAnalysis({})).toBeNull();
    expect(readStoredAnalysis([])).toBeNull();
    expect(readStoredAnalysis("11% protein")).toBeNull();
    expect(readStoredAnalysis({ ...NO_ANALYSIS })).toBeNull();
    // Nulls with a serving name are still nothing: a name for a serving whose
    // calories are absent is not a figure.
    expect(readStoredAnalysis({ ...NO_ANALYSIS, servingName: "can" })).toBeNull();
  });

  it("keeps a panel that prints only extras", () => {
    // Hill's prints no ash and no taurine on anything, so a deck reduced to
    // omega-6 and calcium is a real shape rather than a hypothetical one.
    const back = readStoredAnalysis({
      ...NO_ANALYSIS,
      extras: [{ nutrient: "Calcium", basis: "min", value: 0.3, unit: "%" }],
    });
    expect(back?.extras).toHaveLength(1);
  });

  it("drops a half-formed extra and keeps the rest", () => {
    const back = readStoredAnalysis({
      ...STORED,
      extras: [
        { nutrient: "Calcium", basis: "min", value: 0.3, unit: "%" },
        { nutrient: "", basis: "min", value: 1, unit: "%" },
        { nutrient: "Vitamin E", basis: "sideways", value: 1, unit: "IU/kg" },
        { nutrient: "Omega-6", basis: "min", value: "lots", unit: "%" },
      ],
    });
    expect(back?.extras?.map((e) => e.nutrient)).toEqual(["Calcium"]);
  });

  it("drops anything that is not a finite, non-negative number", () => {
    const back = readStoredAnalysis({ ...STORED, crudeFatMin: -2, ashMax: "2.7" });
    expect(back?.crudeFatMin).toBeNull();
    expect(back?.ashMax).toBeNull();
    expect(back?.crudeProteinMin).toBe(11);
  });
});
