import { describe, expect, it } from "vitest";
import { detectFormFromName } from "./food-form";

/**
 * Accented labels.
 *
 * `normalize` used to strip diacritics as if they were punctuation, so "pâté"
 * became "p t " and matched nothing — while the word list had carried the
 * accented spelling all along, as an entry that could never fire. Every Fancy
 * Feast, Sheba or Weruva pack printing "Pâté" went through with an unknown
 * form, which is precisely the case the list exists for.
 */
describe("accents", () => {
  it("reads pâté the same as pate", () => {
    expect(detectFormFromName("Pâté")).toBe("wet");
    expect(detectFormFromName("pate")).toBe("wet");
    expect(detectFormFromName("Classic Pâté Chicken Feast")).toBe("wet");
  });

  it("reads an accented purée", () => {
    expect(detectFormFromName("Hydrating Purée")).toBe("wet");
  });

  it("still reads the plain spellings", () => {
    expect(detectFormFromName("Crunchy Kibble")).toBe("dry");
    expect(detectFormFromName("Shreds in Sauce")).toBe("wet");
  });
});
