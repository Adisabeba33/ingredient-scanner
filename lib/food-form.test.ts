import { describe, expect, it } from "vitest";
import {
  analysisBasis,
  detectFormFromName,
  detectFormFromText,
  formFromMoisture,
  formLabel,
  guessFoodForm,
  isFoodForm,
} from "./food-form";

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

/**
 * Frozen raw and freeze-dried — the owner's decision of 8 October 2026.
 *
 * The value says what the pack IS; `analysisBasis` says how its list is READ.
 * The consumer app (Ingredients.help tests/food-form-raw.test.ts) proves its
 * reports are unchanged for the four older forms; this side proves the module
 * itself and that no reader starts guessing the new values.
 */
describe("frozen raw and freeze-dried", () => {
  it("are forms, spelt as the catalog spells them", () => {
    expect(isFoodForm("frozen-raw")).toBe(true);
    expect(isFoodForm("freeze-dried")).toBe(true);
    // The ledger's spelling (research/AGENTS.md §9) is mapped by the seeding
    // pass, never written to the catalog as it stands.
    expect(isFoodForm("frozen_raw")).toBe(false);
    expect(isFoodForm("freeze_dried")).toBe(false);
    expect(formLabel("frozen-raw")).toBe("frozen raw food");
    expect(formLabel("freeze-dried")).toBe("freeze-dried food");
  });

  it("are read on the basis their water puts them on", () => {
    expect(analysisBasis("frozen-raw")).toBe("wet");
    expect(analysisBasis("freeze-dried")).toBe("dry");
    for (const form of ["dry", "wet", "semi-moist", "unknown"] as const) {
      expect(analysisBasis(form)).toBe(form);
    }
  });

  it("are never guessed from a name, a list or a moisture figure", () => {
    // A raw-coated kibble says "freeze-dried" too, and moisture cannot tell a
    // frozen patty from a can — so every reader answers as it did before.
    expect(detectFormFromName("FreshDried Raw Meals Cage-Free Chicken Recipe")).toBe("unknown");
    expect(detectFormFromName("Freeze-Dried Raw Chicken")).toBe("unknown");
    expect(detectFormFromName("FreshRaw Bites Grass-Fed Beef Recipe")).toBe("unknown");
    expect(detectFormFromName("Raw Boost Kibble")).toBe("dry");
    expect(guessFoodForm("Chicken, Chicken Liver", "Frozen Raw Patties")).toBe("unknown");
    expect(detectFormFromText("Chicken, Freeze-Dried Chicken Liver")).toBe("unknown");
    expect(formFromMoisture(6)).toBe("dry");
    expect(formFromMoisture(72)).toBe("wet");
  });
});
