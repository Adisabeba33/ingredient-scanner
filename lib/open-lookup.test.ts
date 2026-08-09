import { describe, expect, it } from "vitest";
import {
  assessOpenHit,
  countItems,
  pickOpenHit,
  type OpenHit,
} from "./open-lookup";

const LIST =
  "Chicken, Brown Rice, Barley, Oatmeal, Chicken Meal, Peas, Flaxseed, Salt";

function hit(over: Partial<OpenHit> = {}): OpenHit {
  return {
    source: "openfoodfacts",
    productName: "Something",
    brands: "A Brand",
    ingredientsText: LIST,
    ...over,
  };
}

describe("pickOpenHit", () => {
  it("returns nothing when no database answered", () => {
    expect(pickOpenHit([])).toBeNull();
  });

  // The case this exists for: a barcode listed in two databases, one of them a
  // bare stub. The list is the only field that decides anything.
  it("prefers the hit that actually has a composition", () => {
    const stub = hit({ source: "openfoodfacts", ingredientsText: null });
    const real = hit({ source: "openpetfoodfacts" });
    expect(pickOpenHit([stub, real])?.source).toBe("openpetfoodfacts");
  });

  it("falls back to a named hit when nobody has a list", () => {
    const nameless = hit({
      source: "openfoodfacts",
      productName: null,
      ingredientsText: null,
    });
    const named = hit({
      source: "openbeautyfacts",
      productName: "Shampoo",
      ingredientsText: null,
    });
    expect(pickOpenHit([nameless, named])?.source).toBe("openbeautyfacts");
  });

  it("still returns something when every hit is empty", () => {
    const empty = hit({ productName: null, brands: null, ingredientsText: null });
    expect(pickOpenHit([empty])).not.toBeNull();
  });

  it("breaks a tie by database order, not by arrival", () => {
    const pet = hit({ source: "openpetfoodfacts" });
    const food = hit({ source: "openfoodfacts" });
    expect(pickOpenHit([pet, food])?.source).toBe("openfoodfacts");
  });
});

describe("countItems", () => {
  it("counts comma-separated items and ignores the gaps", () => {
    expect(countItems("Water, Chicken , , Salt")).toBe(3);
    expect(countItems("")).toBe(0);
    expect(countItems(null)).toBe(0);
  });
});

describe("assessOpenHit", () => {
  // The verdict that saves an afternoon: somebody already describes this
  // product properly, so the app can answer it without us.
  it("says a complete list is not worth capturing", () => {
    const a = assessOpenHit(hit());
    expect(a.verdict).toBe("complete");
    expect(a.worthCapturing).toBe(false);
    expect(a.items).toBe(8);
    expect(a.hasName).toBe(true);
  });

  it("says nothing at all is worth capturing", () => {
    expect(assessOpenHit(null).worthCapturing).toBe(true);
    expect(assessOpenHit(null).verdict).toBe("nothing");
    expect(assessOpenHit(hit({ ingredientsText: null })).verdict).toBe("nothing");
  });

  // A stub standing in for a label is exactly what this catalog is for.
  it("says a stub is worth capturing", () => {
    const a = assessOpenHit(hit({ ingredientsText: "Chicken, Water" }));
    expect(a.verdict).toBe("thin");
    expect(a.worthCapturing).toBe(true);
  });

  // But a genuinely short list is a real composition, and sending somebody back
  // to a shelf for it would be the false positive that makes the check useless.
  it("does not call a genuinely short list a stub", () => {
    const a = assessOpenHit(
      hit({ ingredientsText: "Water, Chicken, Salt, Rosemary Extract" })
    );
    expect(a.verdict).toBe("complete");
  });

  it("reports a missing name even when the list is fine", () => {
    const a = assessOpenHit(hit({ productName: null }));
    expect(a.hasName).toBe(false);
    // Still not worth a capture: the name is a keystroke, the list is the work.
    expect(a.worthCapturing).toBe(false);
  });
});
