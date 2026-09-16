import { describe, expect, it } from "vitest";
import {
  brandChoices,
  brandFit,
  brandWalkTsv,
  researchQueue,
  searchBrandChoices,
  summariseBrandWalk,
} from "./brand-walk";
import { brandKey } from "./brand-key";
import type { MissVerdict } from "./miss-verdict";
import type { ScanOutcome, TestScan } from "./scan-test";

const scan = (
  code: string,
  outcome: ScanOutcome,
  over: Partial<TestScan> = {}
): TestScan => ({
  code,
  outcome,
  name: null,
  answeredBrand: null,
  source: null,
  miss: null,
  at: 0,
  times: 1,
  ...over,
});

const missed = (code: string, verdict: MissVerdict, over: Partial<TestScan> = {}) =>
  scan(code, "not-found", {
    miss: {
      verdict,
      maker: null,
      seededAs: null,
      insteadOf: null,
      insteadUse: null,
    },
    ...over,
  });

describe("brandChoices", () => {
  it("offers every seeded brand, including the ones we hold nothing for", () => {
    const choices = brandChoices();
    expect(choices.length).toBeGreaterThan(100);
    // The whole point of the picker: a brand at zero is an untouched section,
    // and it is the one most worth walking. A list built from the catalog
    // could never name it.
    expect(choices.some((c) => c.seededProducts === 0)).toBe(true);
    expect(choices.some((c) => c.seededProducts > 0)).toBe(true);
  });

  it("counts the products and barcodes we already hold under a brand", () => {
    const fancy = brandChoices().find((c) => c.key === brandKey("Fancy Feast"));
    expect(fancy).toBeDefined();
    expect(fancy!.seededProducts).toBeGreaterThan(0);
    // Several pack sizes per recipe, so codes can only outnumber products.
    expect(fancy!.seededCodes).toBeGreaterThanOrEqual(fancy!.seededProducts);
  });

  it("is sorted by name, so a thumb can find a brand without searching", () => {
    const names = brandChoices().map((c) => c.name);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });
});

describe("searchBrandChoices", () => {
  const choices = brandChoices();

  it("finds a brand by its own name", () => {
    const hits = searchBrandChoices(choices, "fancy");
    expect(hits.some((c) => c.name === "Fancy Feast")).toBe(true);
  });

  it("finds a brand by its parent company, which is never on the shelf strip", () => {
    const hits = searchBrandChoices(choices, "purina");
    expect(hits.some((c) => c.name === "Fancy Feast")).toBe(true);
  });

  it("an empty query is every brand rather than none", () => {
    expect(searchBrandChoices(choices, "").length).toBe(choices.length);
  });
});

describe("brandFit", () => {
  const fancy = brandKey("Fancy Feast");

  it("folds spellings before comparing, so the pack and the picker agree", () => {
    // What a model reading a tin writes, against what the picker holds.
    expect(brandFit(fancy, "Purina Fancy Feast")).toBe("match");
    expect(brandFit(fancy, "FANCY FEAST")).toBe("match");
  });

  it("catches the stray tin — a can of something else on this shelf", () => {
    expect(brandFit(fancy, "Friskies")).toBe("different");
  });

  it("says nothing when nothing named a brand, which is most misses", () => {
    // The ordinary case, and the reason the operator's choice is worth
    // recording: for a code nobody holds there is no brand anywhere.
    expect(brandFit(fancy, null)).toBe("unnamed");
    expect(brandFit(fancy, "")).toBe("unnamed");
    expect(brandFit("", "Fancy Feast")).toBe("unnamed");
  });
});

describe("researchQueue", () => {
  it("drops misreads and codes we have already ruled on", () => {
    const queue = researchQueue([
      missed("1", "not-a-barcode"),
      missed("2", "known-wrong-barcode"),
      missed("3", "absent-known-maker"),
    ]);
    expect(queue.map((s) => s.code)).toEqual(["3"]);
  });

  it("keeps hits out of the list entirely", () => {
    const queue = researchQueue([
      scan("1", "ours"),
      scan("2", "open"),
      scan("3", "multipack"),
      missed("4", "absent-known-maker"),
    ]);
    expect(queue.map((s) => s.code)).toEqual(["4"]);
  });

  it("puts the one-button-press cases before the ones needing a shop", () => {
    const queue = researchQueue([
      missed("far", "absent-unknown-maker"),
      missed("press", "seeded-not-imported"),
      missed("near", "absent-known-maker"),
    ]);
    expect(queue.map((s) => s.code)).toEqual(["press", "near", "far"]);
  });

  it("a half-written row counts, and is not a hit", () => {
    // The worst kind of miss: from the aisle it is indistinguishable from a
    // code nobody has, and it means somebody already touched this product.
    const queue = researchQueue([
      scan("1", "no-ingredients", {
        miss: {
          verdict: "absent-known-maker",
          maker: null,
          seededAs: null,
          insteadOf: null,
          insteadUse: null,
        },
      }),
    ]);
    expect(queue).toHaveLength(1);
  });
});

describe("summariseBrandWalk", () => {
  const fancy = brandKey("Fancy Feast");

  it("leads with what there is to find, and still counts both rates", () => {
    const walk = [
      scan("1", "ours", { answeredBrand: "Fancy Feast" }),
      scan("2", "open", { answeredBrand: "Purina Fancy Feast" }),
      missed("3", "absent-known-maker"),
      missed("4", "absent-known-maker"),
    ];
    const summary = summariseBrandWalk(walk, fancy);
    expect(summary.total).toBe(4);
    expect(summary.toFind).toBe(2);
    expect(summary.hitRate).toBe(50);
    expect(summary.ourRate).toBe(25);
  });

  it("counts strays separately rather than quietly filing them under this brand", () => {
    const walk = [
      scan("1", "ours", { answeredBrand: "Fancy Feast" }),
      scan("2", "ours", { answeredBrand: "Friskies" }),
      missed("3", "absent-known-maker"),
    ];
    expect(summariseBrandWalk(walk, fancy).strays).toBe(1);
  });

  it("a miss is never a stray — nothing named a brand to disagree with", () => {
    expect(
      summariseBrandWalk([missed("1", "absent-unknown-maker")], fancy).strays
    ).toBe(0);
  });
});

describe("brandWalkTsv", () => {
  it("carries the operator's observation, which nothing else can recover", () => {
    const tsv = brandWalkTsv("Fancy Feast", [missed("041789001871", "absent-known-maker")]);
    const [header, row] = tsv.split("\n");
    expect(header).toContain("brand (observed on the shelf)");
    expect(row.split("\t")[1]).toBe("Fancy Feast");
  });

  it("prints barcodes in the form a retailer's search box wants", () => {
    // Canonical GTIN-14 in the store, printed UPC-A on the way out: two
    // leading zeros are the difference between finding it and finding nothing.
    const tsv = brandWalkTsv("Fancy Feast", [missed("00041789001871", "absent-known-maker")]);
    expect(tsv.split("\n")[1].split("\t")[0]).toBe("041789001871");
  });

  it("marks a disagreement loudly and an absence quietly", () => {
    const tsv = brandWalkTsv("Fancy Feast", [
      scan("1", "ours", { answeredBrand: "Friskies", at: 1 }),
      scan("2", "ours", { answeredBrand: "Fancy Feast", at: 2 }),
      missed("3", "absent-known-maker", { at: 3 }),
    ]);
    const agrees = tsv.split("\n").slice(1).map((r) => r.split("\t")[4]);
    expect(agrees).toEqual(["NO", "yes", ""]);
  });

  it("orders rows as they were scanned, so a walk reads back as a walk", () => {
    // Stored newest-first by `addScan`; a brief wants them in the order the
    // shelf was walked.
    const tsv = brandWalkTsv("Fancy Feast", [
      missed("00050000577996", "absent-known-maker", { at: 20 }),
      missed("00041789001871", "absent-known-maker", { at: 10 }),
    ]);
    expect(tsv.split("\n").slice(1).map((r) => r.split("\t")[0])).toEqual([
      "041789001871",
      "050000577996",
    ]);
  });
});
