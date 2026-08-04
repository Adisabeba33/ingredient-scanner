import { describe, it, expect } from "vitest";
import {
  compositionKey,
  countIngredients,
  normalizeBrand,
  normalizeComposition,
} from "./composition-key";

/**
 * The fingerprint that notices a food arriving under a second barcode.
 *
 * Its whole job is to be right about "worth asking" — it never merges anything
 * on its own. So the tests come in two halves: the same recipe read twice must
 * produce one key however it was typed, and two different recipes must never
 * produce the same one.
 */

const BLUE_BUFFALO =
  "Deboned Chicken, Chicken Meal, Brown Rice, Barley, Oatmeal, Peas, " +
  "Menhaden Fish Meal, Flaxseed, Natural Flavor, Salt";

describe("normalizeBrand", () => {
  it("ignores case and punctuation", () => {
    expect(normalizeBrand("Blue Buffalo")).toBe(normalizeBrand("BLUE BUFFALO"));
    expect(normalizeBrand("Blue-Buffalo")).toBe(normalizeBrand("Blue Buffalo"));
    expect(normalizeBrand("  Blue  Buffalo  ")).toBe("blue buffalo");
  });

  it("treats absent and empty alike", () => {
    expect(normalizeBrand(null)).toBe("");
    expect(normalizeBrand(undefined)).toBe("");
    expect(normalizeBrand("   ")).toBe("");
  });
});

describe("normalizeComposition", () => {
  it("survives a different hand typing the same list", () => {
    const a = "Deboned Chicken, Chicken Meal, Brown Rice.";
    const b = "deboned chicken; chicken meal; brown rice";
    expect(normalizeComposition(a)).toBe(normalizeComposition(b));
  });

  it("drops the percentages one region prints and another doesn't", () => {
    // The same recipe, an EU pack and a US pack.
    const eu = "Chicken (26%), Rice (20%), Peas (4.5%)";
    const us = "Chicken, Rice, Peas";
    expect(normalizeComposition(eu)).toBe(normalizeComposition(us));
  });

  it("keeps the order, because the order is the recipe", () => {
    // Lists are printed by descending weight. Same words, different order, is
    // a genuinely different food — sorting them would call these one.
    const chickenFirst = "Chicken, Rice, Peas";
    const riceFirst = "Rice, Chicken, Peas";
    expect(normalizeComposition(chickenFirst)).not.toBe(
      normalizeComposition(riceFirst)
    );
  });
});

describe("countIngredients", () => {
  it("counts what a list actually names", () => {
    expect(countIngredients("Chicken, Rice, Peas, Salt")).toBe(4);
  });

  it("counts across semicolons and the word 'and'", () => {
    expect(countIngredients("Chicken; Rice; Peas and Salt")).toBe(4);
  });

  it("is zero for nothing", () => {
    expect(countIngredients("")).toBe(0);
    expect(countIngredients(null)).toBe(0);
  });
});

describe("compositionKey — the same recipe under two barcodes", () => {
  it("gives one key to two readings of one pack", () => {
    const small = compositionKey("Blue Buffalo", BLUE_BUFFALO);
    const large = compositionKey(
      "BLUE BUFFALO",
      BLUE_BUFFALO.toUpperCase().replace(/, /g, ",  ") + "."
    );
    expect(small).not.toBeNull();
    expect(small).toBe(large);
  });

  it("gives one key across an EU and a US printing", () => {
    const us = compositionKey("Acme", "Chicken, Brown Rice, Barley, Peas, Salt");
    const eu = compositionKey(
      "Acme",
      "Chicken (30%), Brown Rice (25%), Barley (10%), Peas (5%), Salt"
    );
    expect(us).toBe(eu);
  });
});

describe("compositionKey — things that must NOT match", () => {
  it("separates two makers shipping the same list", () => {
    // A bag of oats is a bag of oats, and proposing to merge two brands'
    // would be wrong every time.
    const a = compositionKey("Brand A", BLUE_BUFFALO);
    const b = compositionKey("Brand B", BLUE_BUFFALO);
    expect(a).not.toBe(b);
  });

  it("separates a branded row from an unbranded one", () => {
    const named = compositionKey("Blue Buffalo", BLUE_BUFFALO);
    const anonymous = compositionKey(null, BLUE_BUFFALO);
    expect(named).not.toBe(anonymous);
    // The unbranded one still gets a key — plenty of real rows have no brand.
    expect(anonymous).not.toBeNull();
  });

  it("separates recipes that differ by one ingredient", () => {
    const chicken = compositionKey("Acme", "Chicken, Brown Rice, Barley, Peas, Salt");
    const turkey = compositionKey("Acme", "Turkey, Brown Rice, Barley, Peas, Salt");
    expect(chicken).not.toBe(turkey);
  });

  it("separates recipes that differ only in order", () => {
    const a = compositionKey("Acme", "Chicken, Brown Rice, Barley, Peas, Salt");
    const b = compositionKey("Acme", "Brown Rice, Chicken, Barley, Peas, Salt");
    expect(a).not.toBe(b);
  });
});

describe("compositionKey — too thin to ask about", () => {
  it("refuses a one-word list", () => {
    // Shared by hundreds of unrelated products; a key would propose a merge on
    // every one of them.
    expect(compositionKey("Acme", "Water")).toBeNull();
    expect(compositionKey("Acme", "Beef")).toBeNull();
  });

  it("refuses a list with too few ingredients, however long the words", () => {
    // Forty-six characters and only two things named. Length alone is not
    // specificity, which is why the count floor exists separately.
    expect(
      compositionKey("Acme", "Hydrolysed vegetable protein concentrate, water")
    ).toBeNull();
  });

  it("refuses a list generic enough to describe half a category", () => {
    // Four ingredients, and it is most soft drinks ever made. A key here would
    // propose merging products that share a recipe for sugar water.
    expect(compositionKey("Acme", "Water, Sugar, Citric Acid, Salt")).toBeNull();
  });

  it("refuses a list with enough commas but no substance", () => {
    expect(compositionKey("Acme", "a, b, c, d, e")).toBeNull();
  });

  it("refuses nothing at all", () => {
    expect(compositionKey("Acme", "")).toBeNull();
    expect(compositionKey("Acme", null)).toBeNull();
    expect(compositionKey(null, undefined)).toBeNull();
  });

  it("accepts a real short list that clears both floors", () => {
    const key = compositionKey("Acme", "Chicken, Brown Rice, Barley, Peas, Salt");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});
