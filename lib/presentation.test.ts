import { describe, expect, it } from "vitest";
import {
  impliesThickener,
  isPresentation,
  isTexture,
  normalizePresentation,
  normalizeTexture,
  presentationLabel,
  textureLabel,
} from "./presentation";

describe("normalizeTexture", () => {
  // The canonical example: three facts in one printed phrase, and only one of
  // them is the texture.
  it("reads the cut, not what it is sitting in", () => {
    expect(normalizeTexture("Flaked Salmon in Gravy")).toBe("flaked");
    expect(normalizeTexture("Shreds With Salmon in Sauce")).toBe("shredded");
    expect(normalizeTexture("Classic Loaf in Sauce")).toBe("loaf");
  });

  // Gravy is never an answer here. Answering "gravy" to "what texture?" is the
  // conflation the module exists to undo.
  it("never answers with a presentation", () => {
    expect(normalizeTexture("in gravy")).toBe("unknown");
    expect(normalizeTexture("in sauce")).toBe("unknown");
    expect(normalizeTexture("silky broth")).toBe("unknown");
  });

  it("folds the spellings of one texture into one", () => {
    for (const written of ["Pâté", "Pate", "PATE", "pâté"]) {
      expect(normalizeTexture(written)).toBe("pate");
    }
    for (const written of ["Shreds", "Shredded", "shred"]) {
      expect(normalizeTexture(written)).toBe("shredded");
    }
  });

  // Pedigree sells CHOICE CUTS IN GRAVY and CHOPPED GROUND DINNER as separate
  // ranges. Mapping both to "cuts" and "ground" would merge two shelves.
  it("keeps the specific compound ahead of its own last word", () => {
    expect(normalizeTexture("Chopped Ground Dinner Beef")).toBe("chopped_ground");
    expect(normalizeTexture("Choice Cuts in Gravy Beef")).toBe("choice_cuts");
    expect(normalizeTexture("Tender Cuts in Gravy")).toBe("cuts");
    expect(normalizeTexture("Freeze Dried Raw Chicken")).toBe("freeze_dried");
  });

  it("reads several fields as one piece of text", () => {
    expect(normalizeTexture(null, "Prime Filets", "With Beef")).toBe("filets");
  });

  it("says unknown rather than guessing", () => {
    expect(normalizeTexture("Chicken & Brown Rice")).toBe("unknown");
    expect(normalizeTexture(null, undefined, "")).toBe("unknown");
  });

  it("matches whole words", () => {
    // "cuts" must not fire inside "biscuits", and "raw" must not fire inside
    // "strawberry".
    expect(normalizeTexture("Strawberry Yogurt Drops")).toBe("unknown");
  });
});

describe("normalizePresentation", () => {
  it("reads what it is suspended in", () => {
    expect(normalizePresentation("Flaked Salmon in Gravy")).toBe("in_gravy");
    expect(normalizePresentation("Shreds With Salmon in Sauce")).toBe("in_sauce");
    expect(normalizePresentation("Chicken in Broth")).toBe("in_broth");
  });

  // Friskies sells "Extra Gravy" as its own range alongside ordinary gravy
  // products. Collapsing them loses a real distinction on the shelf.
  it("keeps extra gravy apart from gravy", () => {
    expect(normalizePresentation("Extra Gravy Chunky Chicken")).toBe("extra_gravy");
    expect(normalizePresentation("Chunky Chicken in Gravy")).toBe("in_gravy");
  });

  it("never answers with a texture", () => {
    expect(normalizePresentation("Pâté")).toBe("unknown");
    expect(normalizePresentation("Shreds")).toBe("unknown");
  });

  it("says unknown when the pack doesn't say", () => {
    expect(normalizePresentation("Chicken & Brown Rice")).toBe("unknown");
    expect(normalizePresentation("")).toBe("unknown");
  });
});

describe("isTexture / isPresentation", () => {
  it("accepts its own vocabulary and nothing else", () => {
    expect(isTexture("pate")).toBe(true);
    expect(isTexture("in_gravy")).toBe(false);
    expect(isPresentation("in_gravy")).toBe(true);
    expect(isPresentation("pate")).toBe(false);
    expect(isTexture(null)).toBe(false);
    expect(isPresentation(7)).toBe(false);
  });
});

describe("labels", () => {
  it("writes the stored value the way a person would say it", () => {
    expect(textureLabel("chopped_ground")).toBe("chopped ground");
    expect(presentationLabel("in_gravy")).toBe("in gravy");
    expect(presentationLabel("extra_gravy")).toBe("extra gravy");
    expect(presentationLabel("plain")).toBe("plain");
  });

  it("says nothing for an unknown", () => {
    expect(textureLabel("unknown")).toBe("");
    expect(presentationLabel("unknown")).toBe("");
  });
});

describe("impliesThickener", () => {
  // Not an excuse for the additive — a reason it is there. "This has
  // carrageenan in it" and "this has carrageenan in it, as every gravy does"
  // are different sentences to read.
  it("knows which presentations are thickened", () => {
    expect(impliesThickener("in_gravy")).toBe(true);
    expect(impliesThickener("extra_gravy")).toBe(true);
    expect(impliesThickener("in_sauce")).toBe(true);
    expect(impliesThickener("in_jelly")).toBe(true);
  });

  it("knows which are not", () => {
    expect(impliesThickener("in_broth")).toBe(false);
    expect(impliesThickener("in_water")).toBe(false);
    expect(impliesThickener("plain")).toBe(false);
    expect(impliesThickener("unknown")).toBe(false);
  });
});
