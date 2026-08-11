import { describe, expect, it } from "vitest";
import {
  detectNutritionRole,
  isNutritionRole,
  judgeAsDiet,
  roleLabel,
} from "./nutrition-role";

describe("detectNutritionRole", () => {
  // The AAFCO sentence is the whole point. A maker printing it has answered the
  // question outright, and nothing a range name suggests can outrank it.
  it("reads the AAFCO statement first", () => {
    expect(
      detectNutritionRole({
        claims: ["For intermittent or supplemental feeding only"],
        parts: ["Fancy Feast", "Broths", "Chicken"],
      })
    ).toBe("complementary");
    expect(
      detectNutritionRole({
        claims: ["Complete & Balanced Nutrition for Adult Cats"],
        parts: ["Purina Friskies", "Shreds", "With Salmon in Sauce"],
      })
    ).toBe("complete");
  });

  // The bug I nearly shipped. Cesar's "Loaf & Topper in Sauce" is complete and
  // balanced dog food — the topper is the garnish ON the loaf. Filing it as a
  // garnish would excuse a real dinner from the standard it should be held to,
  // which is the exact error this module exists to prevent.
  it("does not read Cesar's Loaf & Topper as a topper", () => {
    expect(
      detectNutritionRole({
        claims: ["Complete & Balanced"],
        parts: ["Cesar", "Loaf & Topper in Sauce", "Filet Mignon Flavor with Bacon"],
      })
    ).toBe("complete");
    // And with no claims read at all, it stays unknown rather than guessing.
    expect(
      detectNutritionRole({
        parts: ["Cesar", "Loaf & Topper in Sauce", "Filet Mignon Flavor"],
      })
    ).toBe("unknown");
  });

  it("knows the ranges that are snacks", () => {
    expect(detectNutritionRole({ parts: ["Temptations", "Classic", "Tasty Chicken"] })).toBe("treat");
    expect(detectNutritionRole({ parts: ["Greenies", "Dental Treats"] })).toBe("treat");
    expect(detectNutritionRole({ parts: ["Purina Friskies", "Party Mix", "Beachside Crunch"] })).toBe("treat");
    expect(detectNutritionRole({ parts: ["Milk-Bone", "MaroSnacks"] })).toBe("treat");
  });

  it("knows the ranges that go on top of a meal", () => {
    expect(detectNutritionRole({ parts: ["Stella & Chewy's", "Meal Mixers", "Chicken"] })).toBe("topper");
    expect(detectNutritionRole({ parts: ["Wellness", "Bowl Boosters", "Bare Chicken"] })).toBe("topper");
    expect(detectNutritionRole({ parts: ["Purina Friskies", "Lil' Soups", "With Chicken"] })).toBe("topper");
    expect(detectNutritionRole({ parts: ["Hartz", "Delectables", "Squeeze Up", "Tuna"] })).toBe("topper");
  });

  it("reads a treat word wherever it is printed", () => {
    expect(detectNutritionRole({ claims: ["Crunchy Treats for Cats"] })).toBe("treat");
    expect(detectNutritionRole({ parts: ["Zuke's", "Mini Naturals", "Training Reward"] })).toBe("treat");
  });

  // Everyday dinners. Not one of these may come back as anything but a meal or
  // unknown — a false "treat" would tell somebody their cat's food is fine
  // because it was never meant to be food.
  it("leaves ordinary meals alone", () => {
    for (const parts of [
      ["Purina Friskies", "Shreds", "With Salmon in Sauce"],
      ["Blue Buffalo", "Life Protection Formula", "Chicken & Brown Rice"],
      ["Hill's Science Diet", "Adult", "Perfect Digestion Chicken"],
      ["Open Farm", "RawMix", "Prairie Chicken"],
      ["Instinct", "Raw Boost", "Original Chicken"],
      ["Wellness", "CORE Digestive Health", "Turkey Pâté"],
      ["Tiki Cat", "After Dark", "Chicken & Quail Egg"],
    ]) {
      expect({ parts, role: detectNutritionRole({ parts }) }).toEqual({
        parts,
        role: "unknown",
      });
    }
  });

  // "Chewy" is a retailer and part of a brand name; "chew" is a treat. The word
  // boundary is what keeps Stella & Chewy's out of the treat bucket.
  it("does not read Stella & Chewy's as a chew", () => {
    expect(detectNutritionRole({ parts: ["Stella & Chewy's", "Raw Coated Kibble", "Chicken"] })).toBe("unknown");
  });

  it("recognises a supplement", () => {
    expect(detectNutritionRole({ claims: ["Nutritional supplement for dogs"] })).toBe("supplement");
  });

  it("says unknown when there is nothing to go on", () => {
    expect(detectNutritionRole({})).toBe("unknown");
    expect(detectNutritionRole({ claims: [], parts: [] })).toBe("unknown");
    expect(detectNutritionRole({ parts: [null, undefined, "  "] })).toBe("unknown");
  });
});

describe("judgeAsDiet", () => {
  // The safe direction, and the reason the change can only improve a report:
  // the everyday standard still applies everywhere it applied before, and is
  // withdrawn only where the pack says it should be.
  it("keeps the everyday standard for meals and for anything unidentified", () => {
    expect(judgeAsDiet("complete")).toBe(true);
    expect(judgeAsDiet("unknown")).toBe(true);
  });

  it("withdraws it only where the pack said this isn't dinner", () => {
    expect(judgeAsDiet("treat")).toBe(false);
    expect(judgeAsDiet("topper")).toBe(false);
    expect(judgeAsDiet("complementary")).toBe(false);
    expect(judgeAsDiet("supplement")).toBe(false);
  });
});

describe("isNutritionRole / roleLabel", () => {
  it("accepts its own vocabulary and nothing else", () => {
    expect(isNutritionRole("treat")).toBe(true);
    expect(isNutritionRole("dinner")).toBe(false);
    expect(isNutritionRole(null)).toBe(false);
  });

  it("writes each role the way a person would say it", () => {
    expect(roleLabel("complementary")).toBe("complementary food");
    expect(roleLabel("treat")).toBe("treat");
    expect(roleLabel("unknown")).toBe("");
  });
});
