import { describe, expect, it } from "vitest";
import { classifyMiss, missLabel, MISS_ORDER, printedForm, type MissVerdict } from "./miss-verdict";
import { canonicalBarcode } from "./barcode";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_MULTIPACKS } from "../data/known-multipacks";
import { WRONG_BARCODES } from "../data/wrong-barcodes";

/**
 * The verdicts are the whole value of this list, so they are the whole test.
 *
 * A wrong verdict here is worse than no list: "genuinely absent" about a
 * product we hold sends somebody to research a thing already sitting in the
 * seed, and "we hold it" about one we do not sends them to press a button that
 * does nothing and conclude the desk is broken.
 */
describe("classifyMiss", () => {
  const seededWithFormula = KNOWN_PRODUCTS.flatMap((p) => p.packages)
    .map((pkg) => pkg.upc)
    .find((upc) => KNOWN_FORMULAS[upc])!;

  it("recognises a barcode we hold a composition for", () => {
    const v = classifyMiss(seededWithFormula);
    expect(v.verdict).toBe("seeded-not-imported");
    expect(v.seededAs).toBeTruthy();
  });

  // The case that made this file exist: the seed is git, the catalog is a
  // database, and a shopper cannot tell "never researched" from "researched
  // and never imported".
  it("reads a code the same however it was stored", () => {
    // Stored as a GTIN-14, seeded as a UPC-A. The canonical key is what makes
    // these one code, and a listing that missed it would report a product we
    // hold as absent.
    expect(classifyMiss(`00${seededWithFormula}`).verdict).toBe("seeded-not-imported");
    expect(classifyMiss(` ${seededWithFormula} `).verdict).toBe("seeded-not-imported");
  });

  it("names a box as a box", () => {
    const box = KNOWN_MULTIPACKS[0];
    const v = classifyMiss(box.upc);
    expect(v.verdict).toBe("known-multipack");
    expect(v.seededAs).toContain(box.line);
  });

  it("carries what a wrong barcode really is, and what to scan instead", () => {
    const wrong = WRONG_BARCODES[0];
    const v = classifyMiss(wrong.code);
    expect(v.verdict).toBe("known-wrong-barcode");
    expect(v.insteadOf).toBe(wrong.is);
    expect(v.insteadUse).toBe(wrong.insteadUse);
  });

  // A case code is on the wrong-barcodes list precisely so nobody files it as
  // a tin, so it must not be reported as a research lead either.
  it("prefers the wrong-barcode answer over anything else", () => {
    const wrong = WRONG_BARCODES[0];
    expect(MISS_ORDER.indexOf(classifyMiss(wrong.code).verdict)).toBeGreaterThan(
      MISS_ORDER.indexOf("absent-known-maker")
    );
  });

  it("says whose a code is when we do not hold it", () => {
    // Purina's prefix, a code the seed has never held.
    const v = classifyMiss("050000000012");
    expect(v.verdict).toBe("absent-known-maker");
    expect(v.maker).toContain("Purina");
  });

  it("separates a maker we have never seeded", () => {
    // Valid EAN-13 under a prefix belonging to nobody in data/gs1-prefixes.ts.
    const v = classifyMiss("4006381333931");
    expect(v.verdict).toBe("absent-unknown-maker");
    expect(v.maker).toBeNull();
  });

  // A camera misreading a digit must not put a phantom product at the top of
  // the research queue — which is what a listing without this would do every
  // time somebody scanned in bad light.
  it("calls a broken check digit a misread rather than a product", () => {
    expect(classifyMiss("050000429944").verdict).toBe("not-a-barcode");
    expect(classifyMiss("12345").verdict).toBe("not-a-barcode");
    expect(classifyMiss("").verdict).toBe("not-a-barcode");
  });

  // The ordering is the panel's argument: the free work first.
  it("puts the work that needs no research first", () => {
    expect(MISS_ORDER[0]).toBe("seeded-not-imported");
    expect(new Set(MISS_ORDER).size).toBe(MISS_ORDER.length);
  });

  it("has wording for every verdict", () => {
    for (const v of MISS_ORDER) expect(missLabel(v as MissVerdict).length).toBeGreaterThan(0);
  });

  // Every seeded barcode must classify as something we hold. If one ever reads
  // as absent, the canonicalisation on one of the two sides has drifted, and
  // the list would quietly send somebody to re-research the catalog.
  it("never calls a seeded barcode absent", () => {
    const wrong = new Set(WRONG_BARCODES.map((w) => w.code));
    const misfiled = KNOWN_PRODUCTS.flatMap((p) => p.packages)
      .filter((pkg) => !wrong.has(pkg.upc))
      .filter((pkg) => !classifyMiss(pkg.upc).verdict.startsWith("seeded"))
      .map((pkg) => pkg.upc);
    expect(misfiled).toEqual([]);
  });

  it("never calls a known box absent", () => {
    const misfiled = KNOWN_MULTIPACKS.filter(
      (b) => classifyMiss(b.upc).verdict !== "known-multipack"
    ).map((b) => b.upc);
    expect(misfiled).toEqual([]);
  });
});

describe("printedForm", () => {
  // The reason this exists: the catalog keys a UPC-A as a GTIN-14, and the
  // desk was printing the key. "00050000577989" pasted into a retailer search
  // finds nothing; "050000577989" finds the tin.
  it("undoes the storage padding on a UPC-A", () => {
    expect(printedForm("00050000577989")).toBe("050000577989");
    expect(printedForm("00050000429943")).toBe("050000429943");
  });

  // An EAN-13's own leading digit is data, not padding. Stripping to twelve
  // would destroy a New Zealand country code.
  it("keeps an EAN-13 at thirteen digits", () => {
    expect(printedForm("09421016592050")).toBe("9421016592050");
  });

  // A packaging indicator is not padding either — it is what makes a case a
  // different code from the tin inside it.
  it("keeps a case's indicator digit", () => {
    expect(printedForm("10818336013673")).toBe("10818336013673");
  });

  // Anything not stored as fourteen digits is already printed form.
  it("leaves a short code alone", () => {
    expect(printedForm("63003444")).toBe("63003444");
    expect(printedForm("050000577989")).toBe("050000577989");
  });

  // Every seeded barcode must round-trip: pad it the way the catalog does,
  // unpad it the way the desk does, and get back what is on the pack.
  it("round-trips every barcode in the seed", () => {
    const wrong = KNOWN_PRODUCTS.flatMap((p) => p.packages)
      .filter((pkg) => printedForm(canonicalBarcode(pkg.upc)) !== pkg.upc)
      .map((pkg) => pkg.upc);
    expect(wrong).toEqual([]);
  });

  it("round-trips every box", () => {
    const wrong = KNOWN_MULTIPACKS.filter(
      (b) => printedForm(canonicalBarcode(b.upc)) !== b.upc
    ).map((b) => b.upc);
    expect(wrong).toEqual([]);
  });
});
