import { describe, expect, it } from "vitest";
import {
  brandIdentity,
  brandKey,
  brandMatchesQuery,
  matchSeedBrand,
  seededIdentities,
} from "./brand-key";
import { US_PET_BRANDS } from "../data/us-pet-brands";

describe("brandKey", () => {
  // The whole reason this module exists. Four spellings of one maker on one
  // shelf, and a page that shows four brands says "you haven't done Friskies"
  // about a brand you have done thirty of.
  it("folds every spelling of one brand into one key", () => {
    const keys = new Set(
      [
        "Friskies",
        "friskies",
        "PURINA FRISKIES",
        "Purina Friskies",
        "Purina Friskies Cat Food",
        "Friskies®",
      ].map(brandKey)
    );
    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe("friskies");
  });

  it("keeps the parent company off a brand that has its own name", () => {
    // "purina fancy feast" contains "purina", but "fancy feast" is two words
    // and more specific — this is the rule that survives a model printing the
    // parent company onto everything it reads.
    expect(brandKey("Purina Fancy Feast")).toBe(brandKey("Fancy Feast"));
    expect(brandKey("Purina Fancy Feast")).not.toBe(brandKey("Purina"));
  });

  it("still files a bare Purina under Purina", () => {
    expect(brandKey("Purina")).toBe("purina");
    expect(brandKey("Nestlé Purina")).toBe("purina");
  });

  // Purina ONE and Pro Plan both start with the parent name and both are real
  // brands in their own right — the exact match has to win before containment
  // ever gets a chance.
  it("tells the Purina family apart", () => {
    const one = brandKey("Purina ONE");
    const pro = brandKey("Purina Pro Plan");
    const chow = brandKey("Purina Dog Chow");
    expect(new Set([one, pro, chow, brandKey("Purina")]).size).toBe(4);
    expect(brandKey("Pro Plan")).toBe(pro);
    expect(brandKey("PRO PLAN SAVOR")).toBe(pro);
  });

  it("reads the punctuation people actually write", () => {
    expect(brandKey("Hill's Science Diet")).toBe(brandKey("Hills Science Diet"));
    expect(brandKey("Kibbles 'n Bits")).toBe(brandKey("Kibbles n Bits"));
    expect(brandKey("Blue-Buffalo Co.")).toBe(brandKey("Blue Buffalo"));
  });

  // The accent has to come off as an accent. A fold that deletes it as
  // punctuation leaves "nestl", which matches nothing and can't be typed.
  it("folds accents rather than deleting them", () => {
    expect(brandKey("Nestlé Purina")).toBe(brandKey("Nestle Purina"));
    expect(brandKey("Boréal")).toBe(brandKey("Boreal"));
    expect(brandKey("Boréal")).toBe("boreal");
  });

  // Open Food Facts stores several brands in one comma-separated field. The
  // fold turns the commas into spaces, so the specific brand still wins over
  // the house name sitting next to it.
  it("survives an Open Food Facts brand list", () => {
    expect(brandKey("purina,friskies")).toBe(brandKey("Friskies"));
  });

  // The dangerous fold. These are two different companies and an edit-distance
  // match would merge them, which is exactly why there isn't one.
  it("never merges two brands that merely read alike", () => {
    expect(brandKey("Nature's Recipe")).not.toBe(brandKey("Nature's Variety"));
    expect(brandKey("Nature's Logic")).not.toBe(brandKey("Nature's Recipe"));
  });

  it("gives a brand nobody seeded its own key rather than dropping it", () => {
    const id = brandIdentity("Kozy Kitten Supreme");
    expect(id).not.toBeNull();
    expect(id!.seeded).toBe(false);
    expect(id!.owner).toBeNull();
    // Spelled as it was written, not as it was normalised.
    expect(id!.name).toBe("Kozy Kitten Supreme");
    expect(id!.key).toBe("kozy kitten supreme");
  });

  it("has no key for a product with no brand at all", () => {
    expect(brandIdentity(null)).toBeNull();
    expect(brandIdentity("   ")).toBeNull();
    expect(brandKey("")).toBe("");
  });

  it("carries the owner and the ranges through from the seed", () => {
    const id = brandIdentity("PURINA FRISKIES")!;
    expect(id.owner).toBe("Nestlé Purina");
    expect(id.species).toBe("cat");
    expect(id.lines).toContain("Shreds");
  });
});

describe("matchSeedBrand", () => {
  it("returns nothing for a brand off the shelf", () => {
    expect(matchSeedBrand("Kozy Kitten Supreme")).toBeNull();
  });

  it("matches whole words only", () => {
    // "Halo" is a seeded brand; "Halogen Pet Co" is not it.
    expect(matchSeedBrand("Halogen Pet Co")).toBeNull();
  });
});

// ── A brand whose name is an ordinary English word ────────────────────────
//
// Whole-word containment is the right rule for "Purina Friskies Cat Food" and
// the wrong one for a brand called Wellness, because the word turns up in other
// makers' claim lines. `leadingWordOnly` in the seed is the answer, and these
// are the strings it was written against — every "not this brand" case below is
// a real product or a real piece of pack copy, not an invented one.
describe("a brand named after an ordinary word", () => {
  it("still folds every way the brand itself is written", () => {
    for (const written of [
      "Wellness",
      "WELLNESS",
      "WELLNESS CORE",
      "Wellness Complete Health",
      "Wellness Complete Health Kittles",
      "wellness natural pet food",
    ]) {
      expect({ written, key: brandKey(written) }).toEqual({ written, key: "wellness" });
    }
  });

  it("does not swallow another maker's product that prints the word", () => {
    // Dr. Bill's Pet Nutrition sells a "Digestive Wellness" family; Now Fresh
    // uses it as a category; Purina ONE +Plus Digestive Health carries it as
    // benefit copy. A model reading a front of pack can lift any of them.
    for (const written of [
      "Digestive Wellness",
      "Dental Wellness Chews",
      "Dr. Bill's Digestive Wellness",
    ]) {
      expect({ written, seed: matchSeedBrand(written)?.name ?? null }).toEqual({
        written,
        seed: null,
      });
    }
  });

  it("leaves a longer seeded name in the same string alone", () => {
    // The containment order already handles these — the point is that the new
    // rule does not break them by bailing out early.
    expect(brandKey("Now Fresh Digestive Wellness")).toBe("now fresh");
    expect(brandKey("Purina Pro Plan Wellness Formula")).toBe("pro plan");
  });

  it("keeps the flag off every other seeded brand", () => {
    // If this grows, each addition needs its own evidence in the seed file.
    const flagged = US_PET_BRANDS.filter((b) => b.leadingWordOnly).map((b) => b.name);
    expect(flagged).toEqual(["Wellness"]);
    // And the ordinary rule still holds for a one-word name that is not flagged.
    expect(brandKey("Purina Friskies Cat Food")).toBe("friskies");
  });
});

describe("seededIdentities", () => {
  const all = seededIdentities();

  it("gives every seeded brand a unique key", () => {
    const keys = all.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  // A seed whose own name folds into a DIFFERENT seed would make that brand
  // unreachable — every scan of it would land on its neighbour, and the page
  // would show one row where there are two. Cheap to check, silent to miss.
  it("has no brand that swallows another", () => {
    for (const brand of all) {
      expect({ name: brand.name, key: brandKey(brand.name) }).toEqual({
        name: brand.name,
        key: brand.key,
      });
    }
  });

  it("has no range listed twice within a brand", () => {
    for (const brand of all) {
      expect(new Set(brand.lines).size).toBe(brand.lines.length);
    }
  });
});

describe("brandMatchesQuery", () => {
  const fancy = { key: "fancy feast", name: "Fancy Feast", owner: "Nestlé Purina" };

  it("finds a brand by the start of its name", () => {
    expect(brandMatchesQuery(fancy, "fan")).toBe(true);
    expect(brandMatchesQuery(fancy, "Fancy Fe")).toBe(true);
  });

  // Standing in an aisle, "purina" is what you remember about half of it.
  it("finds a brand by its parent company", () => {
    expect(brandMatchesQuery(fancy, "purina")).toBe(true);
    expect(brandMatchesQuery(fancy, "nestle")).toBe(true);
  });

  it("finds a brand by one of its ranges", () => {
    expect(brandMatchesQuery(fancy, "gravy lovers")).toBe(true);
  });

  it("ignores case and punctuation", () => {
    expect(
      brandMatchesQuery(
        { key: "hills science diet", name: "Hill's Science Diet", owner: "Hill's (Colgate)" },
        "hills"
      )
    ).toBe(true);
  });

  it("says no when it means no", () => {
    expect(brandMatchesQuery(fancy, "pedigree")).toBe(false);
  });

  it("matches everything on an empty query", () => {
    expect(brandMatchesQuery(fancy, "")).toBe(true);
    expect(brandMatchesQuery(fancy, "   ")).toBe(true);
  });
});
