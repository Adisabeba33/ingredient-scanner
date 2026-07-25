import { describe, expect, it } from "vitest";
import { isUsableIngredients } from "./ingredients-text";

/**
 * A tea whose entire ingredient list is "Black Tea" was rejected as unreadable
 * by an earlier 12-character floor — the photo was fine, the list was just
 * short. Single-ingredient products are common and are the easiest kind to
 * trust, so length must not be the test.
 */
describe("isUsableIngredients", () => {
  const real = [
    "Black Tea",
    "Water",
    "Salt",
    "Honey",
    "Olive Oil",
    "Tea",
    "Deboned Chicken, Chicken Meal, Brown Rice, Oatmeal, Barley",
  ];
  for (const text of real) {
    it(`accepts "${text}"`, () => {
      expect(isUsableIngredients(text)).toBe(true);
    });
  }

  const stubs = [
    "",
    "   ",
    "-",
    "...",
    "?",
    "N/A",
    "n/a",
    "none",
    "None",
    "unknown",
    "not visible",
    "no ingredients",
  ];
  for (const text of stubs) {
    it(`rejects the stub ${JSON.stringify(text)}`, () => {
      expect(isUsableIngredients(text)).toBe(false);
    });
  }

  it("rejects null and undefined", () => {
    expect(isUsableIngredients(null)).toBe(false);
    expect(isUsableIngredients(undefined)).toBe(false);
  });
});
