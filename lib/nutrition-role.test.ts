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

  // A range name that only means "supplemental" under one maker, and the two
  // makers it must not mean it for. Reveal's Limited Ingredient tins print the
  // AAFCO supplemental sentence and PetSmart files them under toppers; Merrick
  // sells complete dog food as "Limited Ingredient Diet" and is in this catalog
  // today. Unscoped, one match would have declared both of them supplemental.
  it("reads Limited Ingredient as supplemental only under Reveal", () => {
    expect(
      detectNutritionRole({ parts: ["Reveal", "Limited Ingredient", "Fish in Broth Tins"] })
    ).toBe("complementary");
    expect(
      detectNutritionRole({
        parts: ["Merrick", "Limited Ingredient Diet Grain Free", "Real Chicken"],
      })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Natural Balance", "L.I.D. Limited Ingredient Diets", "Duck"] })
    ).toBe("unknown");
    // And the other half of the same brand is a real dinner. Reveal sells
    // Entrées and Limited Ingredient in the SAME 2.47 oz tin; only one of them
    // is a diet, and nothing but the range name separates them.
    expect(
      detectNutritionRole({ parts: ["Reveal", "Entrées", "Chicken Breast Paté Recipe"] })
    ).toBe("unknown");
  });

  // Cesar sells a complete loaf and a meal complement side by side in the same
  // tray format. Only the range name separates them, and only under Cesar.
  it("reads Greenies Smart Topper as a topper, not a treat", () => {
    expect(
      detectNutritionRole({ parts: ["Greenies", "Smart Topper", "Chicken Recipe"] })
    ).toBe("topper");
    expect(
      detectNutritionRole({ parts: ["Greenies", "Dental Treats", "Original Regular"] })
    ).toBe("treat");
  });

  it("reads Sheba Meaty Tender Sticks as a treat", () => {
    expect(
      detectNutritionRole({ parts: ["Sheba", "Meaty Tender Sticks", "Chicken Flavor"] })
    ).toBe("treat");
  });

  it("reads Temptations dinners as dinner and the treats as treats", () => {
    expect(
      detectNutritionRole({ parts: ["Temptations", "Classic", "Tasty Chicken Flavor"] })
    ).toBe("treat");
    expect(
      detectNutritionRole({ parts: ["Temptations", "Paté in Gravy", "Tasty Chicken Flavor"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Temptations", null, "Seafood Medley Flavor Dry Cat Food"] })
    ).toBe("unknown");
  });

  it("reads Simply Crafted as a complement only under Cesar", () => {
    expect(
      detectNutritionRole({ parts: ["Cesar", "Simply Crafted", "Chicken, Carrots & Green Beans"] })
    ).toBe("complementary");
    expect(
      detectNutritionRole({ parts: ["Cesar", "Classic Loaf in Sauce", "Filet Mignon"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Some Brand", "Simply Crafted", "Chicken"] })
    ).toBe("unknown");
  });

  // Instinct's topper pouches print the supplemental-feeding sentence; its
  // Limited Ingredient Diet kibble and Original cans are complete, and the
  // topper's range is the kibble's range plus "Toppers" in the variant.
  it("reads Instinct's toppers as complements and its dinners as dinners", () => {
    expect(
      detectNutritionRole({ parts: ["Instinct", "Healthy Cravings", "Real Beef"] })
    ).toBe("complementary");
    expect(
      detectNutritionRole({ parts: ["Instinct", "Limited Ingredient Diet", "Toppers Rabbit"] })
    ).toBe("complementary");
    expect(
      detectNutritionRole({ parts: ["Instinct", "Limited Ingredient Diet", "Rabbit"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Instinct", "Original", "Real Chicken"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Some Brand", "Healthy Cravings", "Chicken"] })
    ).toBe("unknown");
  });

  // RawBoost+ Mixers print "intended for intermittent or supplemental feeding
  // only" — all but Multivitamin, which prints an AAFCO maintenance sentence
  // although it is sold as a mixer. The printed statement decides.
  it("reads Instinct's RawBoost+ toppers as complements, and Multivitamin as its pack declares", () => {
    for (const variant of [
      "Digestive Health",
      "Skin & Coat Health",
      "Chicken",
      "Cage-Free Chicken",
      "Grass-Fed Beef",
      "Gut Health",
      "Tranquility",
      "Mobility Support",
    ]) {
      expect({
        variant,
        role: detectNutritionRole({ parts: ["Instinct", "RawBoost+ Mixers", variant] }),
      }).toEqual({ variant, role: "complementary" });
    }
    expect(
      detectNutritionRole({ parts: ["Instinct", "RawBoost+ Shakers", "Gut Health"] })
    ).toBe("complementary");
    expect(
      detectNutritionRole({ parts: ["Instinct", "RawBoost+ Frozen Mixers", "Skin & Coat Health"] })
    ).toBe("complementary");
    // Complete for adult maintenance by its own pack: judged as dinner.
    expect(
      detectNutritionRole({ parts: ["Instinct", "RawBoost+ Mixers", "Multivitamin"] })
    ).toBe("unknown");
    // The complete raw ranges and the RawBoost+ kibble stay dinner.
    expect(
      detectNutritionRole({ parts: ["Instinct", "FreshRaw", "Meals Cage-Free Chicken Recipe"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Instinct", "FreshDried", "Raw Meals Cage-Free Chicken Recipe"] })
    ).toBe("unknown");
    expect(
      detectNutritionRole({ parts: ["Instinct", "RawBoost+ Kibble", "Real Chicken"] })
    ).toBe("unknown");
  });

  // Two snack ranges whose names carry no snack word. A bone broth is 95%
  // water: judged as dinner it is the worst food ever measured, about a pouch
  // nobody was ever going to feed as dinner. "Whole Loin" loses the word
  // "Treat" that Reveal's full product name carries, because the fish becomes
  // the variant.
  // Mars prints "Cat Meal Complement" on the front where the AAFCO sentence is
  // in the small print, so a photographed front may carry only this one. Tight
  // enough not to catch a complete food that calls itself the perfect
  // complement to a meal — the Cesar trap, in the next test down.
  it("reads a meal complement as complementary", () => {
    expect(
      detectNutritionRole({
        claims: ["Cat Meal Complement"],
        parts: ["Sheba", "Selections", "Chicken Recipe"],
      })
    ).toBe("complementary");
    // And from the seed, which carries no claims at all.
    expect(
      detectNutritionRole({ parts: ["Sheba", "Selections Filets in Broth", "Chicken Recipe"] })
    ).toBe("complementary");
    // The rest of the brand is dinner and must stay dinner.
    expect(detectNutritionRole({ parts: ["Sheba", "Perfect Portions", "Roasted Chicken"] })).toBe(
      "unknown"
    );
  });

  it("reads Reveal's snack ranges as snacks", () => {
    expect(
      detectNutritionRole({ parts: ["Reveal", "Bone Broth", "Chicken Bone Broth with Chicken Breast"] })
    ).toBe("treat");
    expect(detectNutritionRole({ parts: ["Reveal", "Whole Loin", "Salmon"] })).toBe("treat");
    // Sheba's, named in its brief in advance as the thing that would go wrong
    // on that brand. Forty dried sticks, and not one of the words this
    // detector looks for.
    expect(
      detectNutritionRole({ parts: ["Sheba", "Meaty Tender Sticks", "Salmon, Tuna & Chicken"] })
    ).toBe("treat");
  });

  // Wellness was briefed before a barcode of it was researched, and its brief
  // §4 named this in advance: "Soft Puppy Bites" is in the seed's own `lines`
  // for the brand, so with no entry here a bag of training treats is judged as
  // a puppy's whole diet. The maker's pages print "intended for intermittent or
  // supplemental feeding only" on both ranges.
  it("reads Wellness's snack ranges as snacks", () => {
    for (const parts of [
      ["Wellness", "Soft Puppy Bites", "Lamb & Salmon"],
      ["Wellness", "Wellness Puppy Bites", "Lamb & Salmon"],
      ["Wellness", "Kittles", "Chicken & Cranberry"],
      ["Wellness", "Rewarding Life", "Chicken & Turkey"],
    ]) {
      expect({ parts, role: detectNutritionRole({ parts }) }).toEqual({ parts, role: "treat" });
    }
  });

  // The Wellness ranges as the seed now stores them (batches 057–062 and 067,
  // from research-data-center tasks #143–#148 and #150), brand, range and variant
  // exactly as the import route passes them. No entry in this module was added
  // for them: the Bowl Boosters ranges print "a complementary food intended to
  // be fed with a complete and balanced dog food diet" or "intermittent or
  // supplemental feeding only" and read `topper` through "bowl boosters";
  // Puppy Bites reads `treat` only because the brand comes first — "Wellness" +
  // "Puppy Bites" is the printed "Wellness Puppy Bites" the list holds, and bare
  // "puppy bites" is deliberately not in it; Kittles is in KNOWN_TREAT_LINES
  // and Lickable Treats carries the word. Pinned so that no route can quietly
  // stop working, and so the dinners beside them stay dinners.
  it("reads the seeded Wellness toppers and treats as not dinner, and its dinners as dinners", () => {
    for (const [parts, role] of [
      [["Wellness", "Bowl Boosters Simply Shreds", "Chicken, Beef & Carrots"], "topper"],
      [["Wellness", "Bowl Boosters Tender Toppers", "Turkey & Chicken"], "topper"],
      [["Wellness", "Puppy Bites", "Soft Lamb & Salmon"], "treat"],
      [["Wellness", "Kittles", "Tuna & Cranberry"], "treat"],
      [["Wellness", "Lickable Treats", "Chicken"], "treat"],
      [["Wellness", "CORE Mini Meals", "Chunky Chicken"], "unknown"],
      [["Wellness", "Complete Health Petite Entrées", "Shredded Medley Roasted Chicken, Duck, Peas & Carrots"], "unknown"],
      [["Wellness", "CORE Hearty Cuts", "Chicken & Turkey"], "unknown"],
      [["Wellness", "CORE 95%", "Chicken & Broccoli"], "unknown"],
      [["Wellness", "CORE+", "Original Turkey & Chicken Recipe"], "unknown"],
      [["Wellness", "Complete Health", "Grained Senior Chicken Barley"], "unknown"],
      [["Wellness", "CORE Tiny Tasters", "Chicken Recipe"], "unknown"],
      [["Wellness", "CORE Signature Selects", "Shredded Chicken & Turkey in Sauce"], "unknown"],
    ] as const) {
      expect({ parts, role: detectNutritionRole({ parts: [...parts] }) }).toEqual({ parts, role });
    }
  });

  // And the guess this list refuses to make. "Bites" is a word complete foods
  // use — Hill's sells Puppy Small Bites — so only the maker's two printed
  // spellings are listed, never bare "puppy bites".
  it("does not read every puppy food with 'bites' in it as a snack", () => {
    expect(
      detectNutritionRole({
        parts: ["Hill's Science Diet", "Puppy", "Chicken Meal & Barley Recipe Small Bites"],
      })
    ).not.toBe("treat");
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

  // Ziwi Peak sells single dried organs to chew beside complete air-dried
  // DIETS, and the two shelves are one word apart: "Original Air-Dried" is
  // dinner, "Air-Dried Chews" is a trachea. A lamb trachea is 81% protein on
  // a dry-matter basis, so reading it as a diet does not just mislabel it —
  // it hands a snack the best score in the catalog.
  it("tells Ziwi's chews from Ziwi's air-dried dinners", () => {
    const ziwi = (line: string, variant: string) =>
      detectNutritionRole({ parts: ["Ziwi Peak", line, variant] });
    expect(ziwi("Air-Dried Chews", "Lamb Green Tripe Dog Chews")).toBe("treat");
    expect(ziwi("Air-Dried Chews", "Venison Shank Dog Chew — Full")).toBe("treat");
    expect(ziwi("Good Dog Rewards", "Beef Recipe")).toBe("treat");
    // The complete foods, which must NOT be excused from the everyday standard.
    expect(ziwi("Original Air-Dried", "Mackerel & Lamb Recipe")).not.toBe("treat");
    expect(ziwi("Provenance Air-Dried", "East Cape Recipe")).not.toBe("treat");
    expect(ziwi("Steam & Dried", "Beef with Pumpkin Recipe")).not.toBe("treat");
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
