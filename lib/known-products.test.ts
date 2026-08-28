import { describe, expect, it } from "vitest";
import {
  gtinCheckDigit,
  isValidGtin,
  isValidUpcA,
  knownItems,
  lookupKnown,
  upcCheckDigit,
} from "./known-products";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { buildCoverage } from "./coverage";
import { brandKey } from "./brand-key";
import { US_PET_BRANDS } from "../data/us-pet-brands";
import { GS1_PREFIXES } from "../data/gs1-prefixes";
import { isPresentation, isTexture } from "./presentation";

describe("upcCheckDigit", () => {
  // Worth pinning against numbers read off real tins rather than only against
  // itself: the algorithm is easy to write backwards (the ×3 goes on the ODD
  // positions), and a backwards one still returns a plausible digit.
  it("computes the digit a real UPC-A carries", () => {
    expect(upcCheckDigit("050000429943")).toBe(3);
    expect(upcCheckDigit("050000572014")).toBe(4);
  });

  it("catches a mistyped digit", () => {
    expect(isValidUpcA("050000429943")).toBe(true);
    // One digit wrong. This is always caught — the whole purpose of the digit.
    expect(isValidUpcA("050000529943")).toBe(false);
  });

  it("catches most swapped pairs, and is honest about the ones it can't", () => {
    // 050000429943 with the 4 and 2 swapped.
    expect(isValidUpcA("050000249943")).toBe(false);
    // …but a swap of two ADJACENT digits differing by exactly 5 is invisible to
    // a mod-10 check, by arithmetic rather than by oversight: 3a+b and 3b+a
    // differ by 2(a−b), which is ≡0 mod 10 when |a−b| is 5. Here that is the 4
    // and the 9 at the end. Worth knowing rather than assuming the digit proves
    // a number correct — it proves a number is not obviously wrong.
    expect(isValidUpcA("050000429493")).toBe(true);
  });

  it("wants exactly twelve digits", () => {
    expect(isValidUpcA("05000042994")).toBe(false);
    expect(isValidUpcA("0050000429943")).toBe(false);
    expect(isValidUpcA("")).toBe(false);
  });
});

describe("gtinCheckDigit / isValidGtin", () => {
  // Pinned against real packs at two lengths, because the point of the general
  // function is that ONE rule serves both — and a rule written for twelve
  // digits still returns a plausible digit for thirteen.
  it("agrees with the UPC-A rule on American packs", () => {
    expect(gtinCheckDigit("05000042994")).toBe(3);
    expect(isValidGtin("050000429943")).toBe(true);
    expect(isValidGtin("050000529943")).toBe(false);
  });

  it("validates the EAN-13 Ziwi Peak actually prints", () => {
    // Read off New Zealand bags: air-dried cat recipes, 400 g and 1 kg.
    expect(isValidGtin("9421016594177")).toBe(true);
    expect(isValidGtin("9421016595792")).toBe(true);
    // One digit wrong in the middle.
    expect(isValidGtin("9421016594977")).toBe(false);
  });

  it("accepts a UPC-A written in its 13- and 14-digit forms", () => {
    // The same code, zero-padded. This is what canonicalBarcode stores, and a
    // validator that refused it would call our own database keys malformed.
    expect(isValidGtin("0050000429943")).toBe(true);
    expect(isValidGtin("00050000429943")).toBe(true);
  });

  it("refuses a length no retail barcode comes in", () => {
    expect(isValidGtin("05000042994")).toBe(false); // 11
    expect(isValidGtin("94210165941770")).toBe(false); // 14 digits, wrong digit
    expect(isValidGtin("")).toBe(false);
  });
});

describe("data/known-products.ts", () => {
  // The check that has to run in a test rather than in an aisle. A number that
  // fails this is definitely wrong, and finding that out in a shop costs a trip.
  it("every barcode passes its GTIN check digit", () => {
    // `isValidGtin`, not `isValidUpcA`: the seed held only American packs
    // until Ziwi Peak, whose New Zealand bags carry EAN-13. The check-digit
    // rule is the same at every length — see lib/known-products.ts.
    const bad = KNOWN_PRODUCTS.flatMap((p) =>
      p.packages
        .filter((pkg) => !isValidGtin(pkg.upc))
        .map((pkg) => `${p.brand} ${p.line} ${p.variant} — ${pkg.upc}`)
    );
    expect(bad).toEqual([]);
  });

  // Length is a fact about the maker's country, not about correctness — but a
  // code of some OTHER length is a mistyped digit, and that is worth catching
  // separately from the checksum, which a wrong-length code cannot even reach.
  it("holds only real barcode lengths", () => {
    const odd = KNOWN_PRODUCTS.flatMap((p) =>
      p.packages
        .filter((pkg) => ![8, 12, 13, 14].includes(pkg.upc.length))
        .map((pkg) => `${p.variant} — ${pkg.upc} (${pkg.upc.length} digits)`)
    );
    expect(odd).toEqual([]);
  });

  // A code under a prefix belonging to nobody we seed is either a typo or a
  // product filed under the wrong brand — both worth catching.
  //
  // Against data/gs1-prefixes.ts rather than a literal "050000", which is what
  // this was until the seed held a second maker. See that file for why the
  // list is data — scripts/check-batch.mjs asks the same question, and the two
  // drifting apart is how a check stops meaning anything.
  it("every barcode sits under a maker's GS1 prefix", () => {
    const known = GS1_PREFIXES.map((g) => g.prefix);
    const wrong = KNOWN_PRODUCTS.flatMap((p) =>
      p.packages
        .filter((pkg) => !known.some((prefix) => pkg.upc.startsWith(prefix)))
        .map((pkg) => `${p.variant} — ${pkg.upc}`)
    );
    expect(wrong).toEqual([]);
  });

  // The same number on two products means one of them is wrong, and whichever
  // is scanned second silently wins the lookup.
  it("has no barcode twice", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const p of KNOWN_PRODUCTS) {
      for (const pkg of p.packages) {
        const already = seen.get(pkg.upc);
        if (already) clashes.push(`${pkg.upc}: ${already} / ${p.variant}`);
        else seen.set(pkg.upc, p.variant);
      }
    }
    expect(clashes).toEqual([]);
  });

  // A single tin, never a 24-pack case. Giving a case's code to one can is the
  // mistake the source document warns about.
  it("holds individual units only", () => {
    for (const p of KNOWN_PRODUCTS) {
      for (const pkg of p.packages) {
        expect(pkg.scope).toBe("individual_unit");
      }
    }
  });

  it("uses the controlled texture and presentation vocabularies", () => {
    for (const p of KNOWN_PRODUCTS) {
      expect({ v: p.variant, t: isTexture(p.texture) }).toEqual({
        v: p.variant,
        t: true,
      });
      expect({ v: p.variant, p: isPresentation(p.presentation) }).toEqual({
        v: p.variant,
        p: true,
      });
    }
  });

  // A product filed under a brand the coverage page doesn't know would appear
  // as its own "new" brand rather than under Friskies, which defeats the point.
  it("names brands the seed list already has", () => {
    const seeded = new Set(US_PET_BRANDS.map((b) => brandKey(b.name)));
    for (const p of KNOWN_PRODUCTS) {
      expect({ brand: p.brand, seeded: seeded.has(brandKey(p.brand)) }).toEqual({
        brand: p.brand,
        seeded: true,
      });
    }
  });

  // Same for the range: one that isn't in the brand's `lines` lands under
  // "Other", where a whole shelf of Classic Pâté would be invisible as a shelf.
  it("names ranges the brand's seed entry already has", () => {
    const bad: string[] = [];
    for (const p of KNOWN_PRODUCTS) {
      const seed = US_PET_BRANDS.find((b) => brandKey(b.name) === brandKey(p.brand));
      if (!seed?.lines?.includes(p.line)) bad.push(`${p.brand} — ${p.line}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("lookupKnown", () => {
  // The point of the index: the scanner meets a 12-digit read, the catalog
  // stores 14, and both have to find the same tin.
  it("finds a product however many leading zeros the scanner reported", () => {
    for (const written of ["050000429943", "0050000429943", "00050000429943"]) {
      expect(lookupKnown(written)?.variant).toBe("Chicken Feast");
    }
  });

  it("knows what it doesn't know", () => {
    expect(lookupKnown("012345678905")).toBeNull();
    expect(lookupKnown("")).toBeNull();
    expect(lookupKnown(null)).toBeNull();
  });

  it("carries the reading the shelf would otherwise have to supply", () => {
    const shreds = lookupKnown("050000572014")!;
    expect(shreds.brand).toBe("Friskies");
    expect(shreds.line).toBe("Shreds");
    expect(shreds.texture).toBe("shredded");
    // The whole reason texture and presentation are two columns.
    expect(shreds.presentation).toBe("in_sauce");
    expect(shreds.proteins).toEqual(["salmon"]);
  });
});

describe("buildCoverage with the seeded products", () => {
  const item = knownItems()[0];

  it("names what is left to find instead of an empty outline", () => {
    const fancy = buildCoverage([]).find((b) => b.name === "Fancy Feast")!;
    const classic = fancy.ranges.find((r) => r.name === "Classic Pâté")!;
    expect(classic.items.length).toBeGreaterThan(0);
    expect(classic.items.every((i) => i.state === "known")).toBe(true);
    expect(classic.known).toBe(classic.items.length);
    // With the barcode to look for, which is the part that saves a trip.
    expect(classic.items[0].toFind?.[0]).toMatch(/^\d{12}$/);
  });

  // Knowing what is on a shelf is not the same as having been to it.
  it("does not count a brand as started for products nobody has scanned", () => {
    const fancy = buildCoverage([]).find((b) => b.name === "Fancy Feast")!;
    expect(fancy.filled).toBe(0);
    expect(fancy.photo).toBe(0);
    expect(fancy.known).toBeGreaterThan(0);
  });

  // The merge that matters: a recipe already in the catalog must not appear a
  // second time as something still to find.
  it("does not list a product we have already done", () => {
    const scanned = buildCoverage([
      {
        code: item.codes[0],
        brands: item.brand,
        productName: `${item.line} ${item.variant}`,
        state: "filled",
        place: "catalog",
      },
    ]).find((b) => b.name === item.brand)!;
    const range = scanned.ranges.find((r) => r.name === item.line)!;
    const matches = range.items.filter((i) => i.label === item.variant);
    expect(matches).toHaveLength(1);
    expect(matches[0].state).toBe("filled");
    expect(scanned.filled).toBe(1);
  });

  // A pack size we haven't met is worth saying, but as a note on a product
  // already done — not as a second product.
  it("keeps an unscanned pack size as a note, not a duplicate", () => {
    const covered = buildCoverage(
      [
        {
          code: "00099999999999",
          brands: "Friskies",
          productName: "Shreds With Salmon in Sauce",
          state: "filled",
          place: "catalog",
        },
      ],
      [
        {
          brand: "Friskies",
          line: "Shreds",
          variant: "With Salmon in Sauce",
          species: "cat",
          texture: "shredded",
          presentation: "in_sauce",
          foodForm: "wet",
          proteins: ["salmon"],
          codes: ["00050000572014"],
          printedCodes: ["050000572014"],
          sizes: ["5.5 oz"],
        },
      ]
    ).find((b) => b.name === "Friskies")!;
    const shreds = covered.ranges.find((r) => r.name === "Shreds")!;
    expect(shreds.items).toHaveLength(1);
    expect(shreds.items[0].state).toBe("filled");
    expect(shreds.items[0].toFind).toEqual(["050000572014"]);
  });

  // What the screenshot caught. The catalog holds "Turkey Feast" because that
  // is what somebody typed; the seed list holds the retailer's full name. Exact
  // matching listed them as two products — one done, one to find — which is the
  // confusion the page exists to remove.
  it("recognises a recipe the catalog named more briefly", () => {
    const fancy = buildCoverage(
      [
        {
          code: "00099999999999",
          brands: "Fancy Feast",
          productName: "Gravy Lovers Turkey Feast",
          state: "filled",
          place: "catalog",
        },
      ],
      [
        {
          brand: "Fancy Feast",
          line: "Gravy Lovers",
          variant: "Turkey Feast in Roasted Turkey Flavor Gravy",
          species: "cat",
          texture: "chunks",
          presentation: "in_gravy",
          foodForm: "wet",
          proteins: ["turkey"],
          codes: ["00050000580040"],
          printedCodes: ["050000580040"],
          sizes: ["3 oz"],
        },
      ]
    ).find((b) => b.name === "Fancy Feast")!;
    const gravy = fancy.ranges.find((r) => r.name === "Gravy Lovers")!;
    expect(gravy.items).toHaveLength(1);
    expect(gravy.items[0].state).toBe("filled");
    expect(gravy.items[0].toFind).toEqual(["050000580040"]);
  });

  // The safety on that merge, and the reason it is anchored at the FRONT. A
  // screenshot caught the looser version: "Chicken Feast" sits at the end of
  // "Tender Beef & Chicken Feast", so one scanned pâté absorbed two flavours
  // nobody had scanned and they vanished from the list of things to find —
  // worse than showing one product twice.
  it("does not let a scanned flavour swallow the ones it merely ends with", () => {
    const fancy = buildCoverage([
      {
        code: "00099999999999",
        brands: "Fancy Feast",
        productName: "Classic Pâté Chicken Feast",
        state: "filled",
        place: "catalog",
      },
    ]).find((b) => b.name === "Fancy Feast")!;
    const classic = fancy.ranges.find((r) => r.name === "Classic Pâté")!;
    const labels = classic.items.map((i) => i.label);
    expect(labels).toContain("Tender Beef & Chicken Feast");
    expect(labels).toContain("Tender Liver & Chicken Feast");
    expect(classic.filled).toBe(1);
    // Every seeded Classic Pâté except the one that was scanned.
    expect(classic.known).toBe(9);
  });

  // The three that sit side by side on a real Fancy Feast shelf.
  it("keeps three real flavours apart", () => {
    const scanned = [
      "Tender Beef Feast",
      "Tender Beef & Chicken Feast",
      "Tender Beef & Liver Feast",
    ];
    const fancy = buildCoverage(
      scanned.map((name, i) => ({
        code: `0009999999999${i}`,
        brands: "Fancy Feast",
        productName: `Classic Pâté ${name}`,
        state: "filled" as const,
        place: "catalog" as const,
      }))
    ).find((b) => b.name === "Fancy Feast")!;
    expect(fancy.ranges.find((r) => r.name === "Classic Pâté")!.filled).toBe(3);
  });

  // A one-word label sits inside half a shelf, so it must never merge on
  // containment alone.
  it("does not merge on a single word", () => {
    const fancy = buildCoverage(
      [
        {
          code: "00099999999999",
          brands: "Fancy Feast",
          productName: "Gravy Lovers Turkey",
          state: "filled",
          place: "catalog",
        },
      ],
      [
        {
          brand: "Fancy Feast",
          line: "Gravy Lovers",
          variant: "Turkey Feast in Roasted Turkey Flavor Gravy",
          species: "cat",
          texture: "chunks",
          presentation: "in_gravy",
          foodForm: "wet",
          proteins: ["turkey"],
          codes: ["00050000580040"],
          printedCodes: ["050000580040"],
          sizes: ["3 oz"],
        },
      ]
    ).find((b) => b.name === "Fancy Feast")!;
    expect(fancy.ranges.find((r) => r.name === "Gravy Lovers")!.items).toHaveLength(2);
  });

  // The seeded answer must never talk over the pack. A retailer listing can
  // pair a right barcode with a wrong flavour; the tin in your hand cannot.
  it("never overwrites what a real scan established", () => {
    const scanned = buildCoverage([
      {
        code: item.codes[0],
        brands: item.brand,
        productName: `${item.line} ${item.variant}`,
        state: "photo",
        place: "worklist",
      },
    ]).find((b) => b.name === item.brand)!;
    const range = scanned.ranges.find((r) => r.name === item.line)!;
    expect(range.items.find((i) => i.label === item.variant)!.state).toBe("photo");
  });
});
