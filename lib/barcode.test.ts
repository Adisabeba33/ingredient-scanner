import { describe, expect, it } from "vitest";
import { sanitizeBarcode, canonicalBarcode, sourceRank } from "./barcode";

/**
 * These MUST behave identically to ingredients.help's `lib/barcode.ts`, or a
 * row the scanner writes won't be found when the app looks it up. If either
 * repo changes the rules, both test suites should move together.
 */

describe("sanitizeBarcode", () => {
  it("keeps digits only and accepts real lengths", () => {
    expect(sanitizeBarcode("0 12345 67890 5")).toBe("012345678905"); // 12 → UPC-A
    expect(sanitizeBarcode("4006381333931")).toBe("4006381333931"); // 13
    expect(sanitizeBarcode("96385074")).toBe("96385074"); // 8
    expect(sanitizeBarcode("00012345678905")).toBe("00012345678905"); // 14
  });

  it("rejects anything that isn't 8/12/13/14 digits", () => {
    expect(sanitizeBarcode("12345")).toBeNull();
    expect(sanitizeBarcode("")).toBeNull();
    expect(sanitizeBarcode("not-a-code")).toBeNull();
    expect(sanitizeBarcode("123456789012345")).toBeNull(); // 15
  });
});

describe("canonicalBarcode", () => {
  it("collapses UPC-A / EAN-13 / GTIN-14 to one 14-digit key", () => {
    const upcA = canonicalBarcode("012345678905"); // 12
    const ean13 = canonicalBarcode("0012345678905"); // 13, same digits +0
    const gtin14 = canonicalBarcode("00012345678905"); // 14
    expect(upcA).toBe("00012345678905");
    expect(ean13).toBe("00012345678905");
    expect(gtin14).toBe("00012345678905");
    expect(upcA).toBe(ean13);
    expect(ean13).toBe(gtin14);
  });

  it("leaves EAN-8 as-is (a genuinely different, shorter code)", () => {
    expect(canonicalBarcode("96385074")).toBe("96385074");
  });
});

describe("sourceRank", () => {
  it("ranks verified above community above the open databases", () => {
    expect(sourceRank("verified")).toBe(3);
    expect(sourceRank("community")).toBe(2);
    expect(sourceRank("openpetfoodfacts")).toBe(1);
    expect(sourceRank("mystery")).toBe(0);
    expect(sourceRank(null)).toBe(0);
  });
});
