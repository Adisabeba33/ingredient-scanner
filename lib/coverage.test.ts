import { describe, expect, it } from "vitest";
import {
  buildCoverage,
  countsAsPet,
  coverageTotals,
  NO_BRAND,
  OTHER_RANGE,
  sortBrands,
  splitRange,
  type CoverageSource,
} from "./coverage";

function source(over: Partial<CoverageSource> = {}): CoverageSource {
  return {
    code: "00040000000000",
    brands: "Purina Friskies",
    productName: null,
    state: "filled",
    place: "catalog",
    ...over,
  };
}

function brand(rows: CoverageSource[], name: string) {
  // No seeded products by default: the existing tests are about grouping what
  // was scanned, and letting 27 real ones in would change every count.
  return buildCoverage(rows, []).find((b) => b.name === name);
}

describe("countsAsPet", () => {
  it("keeps cat and dog food", () => {
    expect(countsAsPet("pet")).toBe(true);
    expect(countsAsPet("PET")).toBe(true);
    expect(countsAsPet(" pet ")).toBe(true);
  });

  // The actual complaint: a can of Red Bull, looked up once through Open Food
  // Facts, stored with mode "human", showing on a page about pet food. And a
  // shampoo from Open Beauty Facts behind it.
  it("drops human food and cosmetics", () => {
    expect(countsAsPet("human")).toBe(false);
    expect(countsAsPet("cosmetics")).toBe(false);
  });

  // Rows written before the column existed are ours, from a tool that only did
  // pet food. Dropping them would hide real work.
  it("treats a row with no mode as pet", () => {
    expect(countsAsPet(null)).toBe(true);
    expect(countsAsPet(undefined)).toBe(true);
    expect(countsAsPet("")).toBe(true);
    expect(countsAsPet("   ")).toBe(true);
  });

  // A mode nobody has invented yet is not pet food until somebody says it is.
  it("says no to anything it doesn't recognise", () => {
    expect(countsAsPet("beverages")).toBe(false);
  });
});

describe("splitRange", () => {
  // The can from the Express experiment. "Shreds" is the heading a shelf is
  // arranged by; "With Salmon in Sauce" is the flavour under it.
  it("takes the range off the front of the name", () => {
    expect(splitRange("Shreds With Salmon in Sauce", ["Shreds", "Pâté"])).toEqual({
      range: "Shreds",
      rest: "With Salmon in Sauce",
    });
  });

  it("finds a range in the middle of a name", () => {
    expect(splitRange("Blue Wilderness Chicken Recipe", ["Wilderness"])).toEqual({
      range: "Wilderness",
      rest: "Blue Chicken Recipe",
    });
  });

  // A brand with both "Grain Free" and "Grain Free Naturals" must file a
  // Naturals bag under the longer one, or the specific range shows as
  // untouched forever while its products pile up next door.
  it("prefers the longest range when two match", () => {
    expect(
      splitRange("Grain Free Naturals Chicken", ["Grain Free", "Grain Free Naturals"])
    ).toEqual({ range: "Grain Free Naturals", rest: "Chicken" });
  });

  it("matches whole words, not fragments", () => {
    // "Gold" must not swallow a Golden Retriever formula.
    expect(splitRange("Golden Retriever Formula", ["Gold"])).toEqual({
      range: null,
      rest: "Golden Retriever Formula",
    });
  });

  // The range is printed with an apostrophe, read without one, and typed with
  // a hyphen. All three are the same shelf.
  it("ignores how the range is punctuated", () => {
    for (const written of ["Lil' Soups Chicken", "Lil Soups Chicken", "Lil-Soups Chicken"]) {
      expect(splitRange(written, ["Lil' Soups"]).range).toBe("Lil' Soups");
    }
  });

  // Friskies prints "Pâté"; a model that dropped the accent writes "Pate".
  // Both are the same shelf, and the tin keeps its own spelling on screen.
  it("matches across an accent, in both directions", () => {
    expect(splitRange("Pate With Turkey", ["Pâté"])).toEqual({
      range: "Pâté",
      rest: "With Turkey",
    });
    expect(splitRange("Pâté With Turkey", ["Pate"])).toEqual({
      range: "Pate",
      rest: "With Turkey",
    });
  });

  it("handles a veterinary code as a range", () => {
    expect(splitRange("c/d Multicare Chicken", ["c/d", "i/d"])).toEqual({
      range: "c/d",
      rest: "Multicare Chicken",
    });
    // And doesn't find it inside an ordinary word.
    expect(splitRange("Chicken Dinner", ["c/d"]).range).toBeNull();
  });

  it("leaves a name alone when nothing matches", () => {
    expect(splitRange("Chicken & Brown Rice", ["Shreds"])).toEqual({
      range: null,
      rest: "Chicken & Brown Rice",
    });
  });

  it("says nothing about an empty name", () => {
    expect(splitRange(null, ["Shreds"])).toEqual({ range: null, rest: "" });
  });

  // A pack whose whole name IS the range leaves no flavour behind, and the
  // caller has to be able to see that rather than getting a stray separator.
  it("returns an empty remainder rather than punctuation", () => {
    expect(splitRange("Shreds", ["Shreds"])).toEqual({ range: "Shreds", rest: "" });
    expect(splitRange("— Shreds —", ["Shreds"]).rest).toBe("");
  });
});

describe("buildCoverage", () => {
  it("lists every seeded brand, including the ones with nothing scanned", () => {
    const brands = buildCoverage([], []);
    const fancy = brands.find((b) => b.name === "Fancy Feast");
    expect(fancy).toBeDefined();
    expect(fancy!.filled).toBe(0);
    expect(fancy!.photo).toBe(0);
    // Its ranges are all still shown — that IS the "go and find this" list.
    expect(fancy!.emptyRanges).toBeGreaterThan(0);
    expect(fancy!.ranges.every((r) => r.items.length === 0)).toBe(true);
  });

  it("gathers four spellings of a brand into one row", () => {
    const brands = buildCoverage(
      [
        source({ code: "1", brands: "Friskies", productName: "Shreds Salmon" }),
        source({ code: "2", brands: "PURINA FRISKIES", productName: "Shreds Chicken" }),
        source({ code: "3", brands: "purina,friskies", productName: "Pâté Turkey" }),
        source({ code: "4", brands: "Purina Friskies®", productName: "Party Mix Beachside" }),
      ],
      []
    );
    const friskies = brands.filter((b) => b.name === "Friskies");
    expect(friskies).toHaveLength(1);
    expect(friskies[0].filled).toBe(4);
  });

  it("files products under the range printed on the pack", () => {
    const friskies = brand(
      [
        source({ code: "1", productName: "Shreds With Salmon in Sauce" }),
        source({ code: "2", productName: "Shreds With Chicken in Gravy" }),
        source({ code: "3", productName: "Party Mix Beachside Crunch" }),
      ],
      "Friskies"
    )!;
    const shreds = friskies.ranges.find((r) => r.name === "Shreds")!;
    expect(shreds.items.map((i) => i.label)).toEqual([
      "With Chicken in Gravy",
      "With Salmon in Sauce",
    ]);
    expect(friskies.ranges.find((r) => r.name === "Party Mix")!.items).toHaveLength(1);
  });

  // A range the seed file never knew is not an error — it is the shelf
  // correcting a list written from memory, and it has to show.
  //
  // The name here is deliberately invented. This test used to use "Farm
  // Favorites", which was unseeded when it was written and is a real Friskies
  // range that has since been seeded — at which point the test was checking
  // that a KNOWN range lands in "Other", which is the opposite of its point. A
  // range nobody will ever ship keeps it testing what it says it tests.
  it("keeps a range that isn't in the seed list, marked", () => {
    const friskies = brand(
      [source({ productName: "Midnight Harbour Selection With Chicken" })],
      "Friskies"
    )!;
    const other = friskies.ranges.find((r) => r.items.length > 0)!;
    expect(other.name).toBe(OTHER_RANGE);
    expect(other.seeded).toBe(false);
    expect(friskies.filled).toBe(1);
  });

  it("uses the range an express row read off the front", () => {
    const friskies = brand(
      [
        source({
          state: "photo",
          place: "worklist",
          productLine: "Prime Filets",
          variant: "With Beef in Gravy",
          productName: null,
        }),
      ],
      "Friskies"
    )!;
    const range = friskies.ranges.find((r) => r.name === "Prime Filets")!;
    expect(range.items[0].label).toBe("With Beef in Gravy");
    expect(friskies.photo).toBe(1);
    expect(friskies.filled).toBe(0);
  });

  // Three bag sizes of one recipe are three barcodes and one product. Listing
  // them three times is exactly the "which of these have I done" confusion the
  // page exists to remove.
  it("merges pack sizes of one recipe into one entry", () => {
    const friskies = brand(
      [
        source({ code: "1", productName: "Shreds With Salmon in Sauce" }),
        source({ code: "2", productName: "Shreds with salmon in sauce" }),
        source({ code: "3", productName: "Shreds  With  Salmon  In  Sauce" }),
      ],
      "Friskies"
    )!;
    const shreds = friskies.ranges.find((r) => r.name === "Shreds")!;
    expect(shreds.items).toHaveLength(1);
    expect(shreds.items[0].codes).toEqual(["1", "2", "3"]);
    expect(friskies.filled).toBe(1);
  });

  it("merges two spellings of one flavour", () => {
    const friskies = brand(
      [
        source({ code: "1", productName: "Pâté Turkey & Giblets Dinner" }),
        source({ code: "2", productName: "Pate Turkey and Giblets Dinner" }),
      ],
      "Friskies"
    )!;
    const pate = friskies.ranges.find((r) => r.items.length > 0)!;
    expect(pate.name).toBe("Pâté");
    expect(pate.items).toHaveLength(1);
    expect(pate.items[0].codes).toEqual(["1", "2"]);
  });

  it("counts a recipe as done when any of its sizes has a composition", () => {
    const friskies = brand(
      [
        source({ code: "1", productName: "Shreds Salmon", state: "photo", place: "worklist" }),
        source({ code: "2", productName: "Shreds Salmon", state: "filled" }),
      ],
      "Friskies"
    )!;
    const shreds = friskies.ranges.find((r) => r.name === "Shreds")!;
    expect(shreds.items[0].state).toBe("filled");
    expect(friskies.filled).toBe(1);
    expect(friskies.photo).toBe(0);
  });

  // Both tables holding one code means a finish half-landed. The catalog row is
  // the one with the ingredient list, so it wins.
  it("prefers the catalog row when a code is in both tables", () => {
    const friskies = brand(
      [
        source({ code: "1", productName: "Shreds Salmon", state: "photo", place: "worklist" }),
        source({ code: "1", productName: "Shreds Salmon", state: "filled", place: "catalog" }),
      ],
      "Friskies"
    )!;
    expect(friskies.filled).toBe(1);
    expect(friskies.photo).toBe(0);
  });

  it("puts a product with no readable brand in its own bucket", () => {
    const brands = buildCoverage(
      [source({ brands: null, productName: "Chicken Dinner" })],
      []
    );
    const orphan = brands.find((b) => b.name === NO_BRAND)!;
    expect(orphan.filled).toBe(1);
  });

  it("labels a product by its barcode when nothing else read", () => {
    const orphan = buildCoverage(
      [source({ code: "99", brands: null, productName: null })],
      []
    ).find((b) => b.name === NO_BRAND)!;
    expect(orphan.ranges[0].items[0].label).toBe("99");
  });

  it("marks a brand that came off the shelf rather than the seed list", () => {
    const found = buildCoverage(
      [source({ brands: "Kozy Kitten Supreme", productName: "Tuna" })],
      []
    ).find((b) => b.name === "Kozy Kitten Supreme")!;
    expect(found.seeded).toBe(false);
    expect(found.filled).toBe(1);
  });

  it("counts only seeded ranges that are still empty", () => {
    const friskies = brand([source({ productName: "Shreds Salmon" })], "Friskies")!;
    const seeded = friskies.lines.length;
    expect(friskies.emptyRanges).toBe(seeded - 1);
  });
});

describe("coverageTotals", () => {
  it("counts brands, started brands and both kinds of product", () => {
    const totals = coverageTotals(
      buildCoverage(
        [
          source({ code: "1", productName: "Shreds Salmon" }),
          source({
            code: "2",
            brands: "Pedigree",
            productName: "Choice Cuts Beef",
            state: "photo",
            place: "worklist",
          }),
        ],
        []
      )
    );
    expect(totals.filled).toBe(1);
    expect(totals.photo).toBe(1);
    expect(totals.started).toBe(2);
    expect(totals.brands).toBeGreaterThan(2);
  });
});

describe("sortBrands", () => {
  const brands = buildCoverage(
    [
      source({ code: "1", productName: "Shreds Salmon" }),
      source({ code: "2", productName: "Shreds Chicken" }),
      source({ code: "3", brands: "Pedigree", productName: "Choice Cuts Beef" }),
    ],
    []
  );

  it("puts untouched brands first when the question is what to do next", () => {
    const first = sortBrands(brands, "gaps")[0];
    expect(first.filled + first.photo).toBe(0);
  });

  it("puts the busiest brand first when the question is where the work went", () => {
    expect(sortBrands(brands, "most")[0].name).toBe("Friskies");
  });

  it("sorts by name without moving anything else around", () => {
    const names = sortBrands(brands, "name").map((b) => b.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("doesn't mutate what it was given", () => {
    const before = brands.map((b) => b.name);
    sortBrands(brands, "most");
    expect(brands.map((b) => b.name)).toEqual(before);
  });
});
