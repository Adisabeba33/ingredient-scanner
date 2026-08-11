import { describe, expect, it } from "vitest";
import { alignedFold, deaccent } from "./fold";

describe("deaccent", () => {
  // The words this actually has to survive: a Friskies range, a Canadian
  // brand, and the company that owns half the shelf.
  it("takes accents off the letters they sit on", () => {
    expect(deaccent("Pâté")).toBe("Pate");
    expect(deaccent("Boréal")).toBe("Boreal");
    expect(deaccent("Nestlé Purina")).toBe("Nestle Purina");
  });

  it("leaves case and punctuation alone — that's somebody else's job", () => {
    expect(deaccent("Lil' Soups")).toBe("Lil' Soups");
    expect(deaccent("PÂTÉ")).toBe("PATE");
  });

  it("does nothing to text that has no accents", () => {
    expect(deaccent("Chicken & Brown Rice")).toBe("Chicken & Brown Rice");
    expect(deaccent("")).toBe("");
  });

  it("folds text that arrives already decomposed", () => {
    // "Pa" + combining circumflex + "te" + combining acute — how some sources
    // send it, and indistinguishable from the composed form on screen.
    expect(deaccent("Pa\u0302te\u0301")).toBe("Pate");
  });
});

describe("alignedFold", () => {
  // The contract the caller depends on: a position found in `folded` names the
  // same characters in `source`. Slice the wrong string and you cut a name in
  // half without anything throwing.
  it("keeps the folded copy aligned with the source", () => {
    const { source, folded } = alignedFold("Pâté Turkey Feast");
    expect(folded).toBe("Pate Turkey Feast");
    expect(folded.length).toBe(source.length);
    const at = folded.indexOf("Turkey");
    expect(source.slice(at, at + 6)).toBe("Turkey");
  });

  it("normalises the source, so decomposed input still lines up", () => {
    const { source, folded } = alignedFold("Pa\u0302te\u0301 Turkey");
    // Composed again \u2014 one character each for \u00e2 and \u00e9 \u2014 so the fold lines up.
    expect(source).toBe("P\u00e2t\u00e9 Turkey");
    expect(folded).toBe("Pate Turkey");
    expect(folded.length).toBe(source.length);
  });

  it("is a no-op on plain text", () => {
    const { source, folded } = alignedFold("Shreds With Salmon");
    expect(source).toBe("Shreds With Salmon");
    expect(folded).toBe(source);
  });
});
