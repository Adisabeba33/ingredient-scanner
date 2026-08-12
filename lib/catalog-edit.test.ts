import { describe, expect, it } from "vitest";
import { editPromotes, sourceAfterEdit, sourceLabel } from "./catalog-edit";
import { SOURCE_RANK, sourceRank } from "./barcode";

describe("sourceAfterEdit", () => {
  // The whole point. A correction left labelled as the database's own would be
  // overwritten by the next scan of that barcode, because the consumer app
  // treats an open-database row as replaceable by a fresh open-database result.
  it("lifts an open-database row above the database it came from", () => {
    for (const open of [
      "openfoodfacts",
      "openpetfoodfacts",
      "openbeautyfacts",
    ]) {
      const after = sourceAfterEdit(open);
      expect(sourceRank(after)).toBeGreaterThan(sourceRank(open));
    }
  });

  it("does not claim we photographed the label", () => {
    expect(sourceAfterEdit("openfoodfacts")).toBe("community");
    expect(sourceRank("community")).toBeLessThan(SOURCE_RANK.verified);
  });

  it("leaves our own capture alone — an edit to it is still ours", () => {
    expect(sourceAfterEdit("verified")).toBe("verified");
    expect(editPromotes("verified")).toBe(false);
  });

  it("treats a row with no source recorded as one to claim", () => {
    expect(sourceAfterEdit(null)).toBe("community");
  });

  it("is stable: editing a corrected row twice changes nothing", () => {
    expect(sourceAfterEdit(sourceAfterEdit("openfoodfacts"))).toBe("community");
    expect(editPromotes("community")).toBe(false);
  });
});

describe("editPromotes", () => {
  it("is true exactly when saving would relabel the row", () => {
    expect(editPromotes("openfoodfacts")).toBe(true);
    expect(editPromotes(null)).toBe(true);
    expect(editPromotes("community")).toBe(false);
    expect(editPromotes("verified")).toBe(false);
  });
});

describe("sourceLabel", () => {
  it("names each source in words a person would use", () => {
    expect(sourceLabel("verified")).toBe("Our capture");
    // Says what it is rather than how it got here: `community` now covers a
    // consumer-app reading, a hand correction AND a formula from a manufacturer
    // record, and the only part that matters is that nobody photographed it.
    expect(sourceLabel("community")).toBe("Not photographed");
    expect(sourceLabel("openfoodfacts")).toBe("Open Food Facts");
  });

  it("never returns an empty badge for something unexpected", () => {
    expect(sourceLabel("something-new")).toBeTruthy();
    expect(sourceLabel(null)).toBeTruthy();
  });
});
