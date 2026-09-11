import { describe, expect, it } from "vitest";
import {
  feedsGrowth,
  isLifeStage,
  lifeStageLabel,
  readLifeStage,
} from "./life-stage";

/**
 * Real sentences, off real packs. Every wording below is one a maker in this
 * catalog actually prints — the phrasings differ enough between Hill's, Royal
 * Canin, Purina, Blue Buffalo and the boutique makers that a parser tuned to
 * one of them reads the others wrong.
 */

describe("readLifeStage", () => {
  it("tells no sentence apart from a sentence that says nothing", () => {
    // Nobody has read the pack, versus the pack has been read and is silent.
    // Every screen downstream needs the difference.
    expect(readLifeStage(null)).toBeNull();
    expect(readLifeStage(undefined)).toBeNull();
    expect(readLifeStage("   ")).toBeNull();
    expect(readLifeStage("Made in the USA.")?.stage).toBe("unknown");
  });

  it("reads growth", () => {
    expect(
      readLifeStage(
        "Formulated to meet the nutritional levels established by the AAFCO Cat Food Nutrient Profiles for growth."
      )?.stage
    ).toBe("growth");
    expect(
      readLifeStage(
        "Animal feeding tests using AAFCO procedures substantiate that BLUE Baby BLUE Kitten provides complete and balanced nutrition for growth."
      )?.stage
    ).toBe("growth");
  });

  it("reads maintenance", () => {
    expect(
      readLifeStage(
        "Hill's Science Diet Adult is formulated to meet the nutritional levels established by the AAFCO Cat Food Nutrient Profiles for maintenance."
      )?.stage
    ).toBe("maintenance");
    expect(
      readLifeStage(
        "Animal feeding tests using AAFCO procedures substantiate that this product provides complete and balanced nutrition for maintenance of adult dogs."
      )?.stage
    ).toBe("maintenance");
  });

  it("reads all life stages", () => {
    expect(
      readLifeStage(
        "ZIWI Peak is formulated to meet the nutritional levels established by the AAFCO Dog Food Nutrient Profiles for all life stages."
      )?.stage
    ).toBe("all");
  });

  it("lets the broader declaration win over the word inside it", () => {
    // The failure this prevents: "all life stages, including growth of large
    // size dogs" holds the word "growth" and is not a growth food.
    const r = readLifeStage(
      "Formulated to meet the nutritional levels established by the AAFCO Dog Food Nutrient Profiles for all life stages, including growth of large size dogs (70 lbs or more as an adult)."
    );
    expect(r?.stage).toBe("all");
    expect(r?.largeBreedGrowth).toBe("included");
  });

  it("keeps the exclusion that inverts the same sentence", () => {
    // One word apart from the test above, and the opposite advice for anyone
    // holding a Labrador puppy.
    const r = readLifeStage(
      "Formulated to meet the nutritional levels established by the AAFCO Dog Food Nutrient Profiles for all life stages except for growth of large size dogs (70 lbs or more as an adult)."
    );
    expect(r?.stage).toBe("all");
    expect(r?.largeBreedGrowth).toBe("excluded");
  });

  it("does not let a stray 'except' elsewhere flip an inclusion", () => {
    const r = readLifeStage(
      "Complete and balanced for all life stages, including growth of large size dogs (70 lbs or more as an adult). Contains no by-products except where noted."
    );
    expect(r?.largeBreedGrowth).toBe("included");
  });

  it("knows a sentence that declares the product is not a diet", () => {
    // Blue Buffalo's toppers, verbatim from the research ledger.
    const r = readLifeStage(
      "Intended for intermittent or supplemental feeding only; feed daily along with a complete and balanced diet."
    );
    expect(r?.stage).toBe("supplemental");
    // "supplemental" is an answer, not a parse failure — and it carries no
    // large-breed clause, because it carries no life stage at all.
    expect(r?.largeBreedGrowth).toBeNull();
  });

  it("reads growth and reproduction as growth", () => {
    // AAFCO's growth profile covers gestation and lactation, so the pair is one
    // declaration rather than two.
    expect(
      readLifeStage(
        "Formulated to meet the nutritional levels established by the AAFCO Cat Food Nutrient Profiles for growth and reproduction."
      )?.stage
    ).toBe("growth");
  });

  it("reads reproduction on its own", () => {
    expect(
      readLifeStage(
        "Provides complete and balanced nutrition for gestation and lactation."
      )?.stage
    ).toBe("reproduction");
  });

  it("is unbothered by case, punctuation and OCR spacing", () => {
    expect(
      readLifeStage("FORMULATED TO MEET...AAFCO...PROFILES FOR   MAINTENANCE .")?.stage
    ).toBe("maintenance");
  });

  it("says unknown rather than guessing at a sentence it cannot read", () => {
    expect(
      readLifeStage("Meets the nutritional levels established by the AAFCO profiles.")?.stage
    ).toBe("unknown");
  });
});

describe("what the app does with it", () => {
  it("knows which stages a growing animal may be fed", () => {
    expect(feedsGrowth("growth")).toBe(true);
    expect(feedsGrowth("all")).toBe(true);
    expect(feedsGrowth("maintenance")).toBe(false);
    expect(feedsGrowth("unknown")).toBe(false);
    expect(feedsGrowth(null)).toBe(false);
  });

  it("says nothing where there is nothing to say", () => {
    expect(lifeStageLabel("unknown")).toBeNull();
    expect(lifeStageLabel(null)).toBeNull();
    expect(lifeStageLabel("supplemental")).toBeNull();
  });

  it("names the animal the reader actually has", () => {
    expect(lifeStageLabel("growth", "cat")).toMatch(/kittens/);
    expect(lifeStageLabel("growth", "dog")).toMatch(/puppies/);
    expect(lifeStageLabel("maintenance", "cat")).toMatch(/adult cats/);
  });

  it("guards the column against anything else", () => {
    expect(isLifeStage("growth")).toBe(true);
    expect(isLifeStage("kitten")).toBe(false);
    expect(isLifeStage(null)).toBe(false);
    expect(isLifeStage(7)).toBe(false);
  });
});
