/**
 * What is actually in the seeded products that have a composition.
 *
 * ── Why this is a separate file from known-products.ts ────────────────────
 *
 * Because a product and its formula change on different clocks, and the source
 * document is right about why that matters: a maker can keep the same barcode
 * on the same tin and reformulate what is inside it. Friskies Pâté Ocean
 * Whitefish & Tuna is the example — older records show 11% minimum protein,
 * current ones 9%, under one UPC. Identity lives next door; this is the
 * composition, dated.
 *
 * ── Copied, not tidied ────────────────────────────────────────────────────
 *
 * `ingredients` is the list VERBATIM: same words, same order, same brackets.
 * The order is the data — American labels are printed by descending weight, so
 * moving one item rewrites what the product is. Nothing is normalised, expanded
 * or "cleaned up" here.
 *
 * In particular nothing is ADDED. Fancy Feast Ocean Whitefish & Tuna guarantees
 * 0.05% taurine and does not list taurine among its ingredients; writing it in
 * because the guarantee mentions it would be inventing a line on a label.
 *
 * ── The analysis is guarantees, not measurements ──────────────────────────
 *
 * Protein, fat and taurine are MINIMA; fibre, moisture and ash are MAXIMA,
 * exactly as printed. Nothing derived from them is exact, and nothing here is
 * converted to a dry-matter basis — that conversion belongs where it can be
 * labelled as an estimate, not baked into stored data.
 *
 * ── What this is NOT ──────────────────────────────────────────────────────
 *
 * A photograph of a pack. These lists come from manufacturer and retailer
 * records, so they go into the catalog as `community` — better than an open
 * database, and outranked by our own capture the moment somebody photographs
 * the real tin. See app/api/known-products/import/route.ts.
 *
 * ── Not every seeded product is in here ───────────────────────────────────
 *
 * data/known-products.ts holds more products than this file holds formulas, on
 * purpose. A source that summarised its ingredient blocks ("mineral premix
 * [potassium, zinc]") is not a list we can store as one, so those products are
 * seeded as identity — a barcode to go and find — and wait. The import route
 * steps over a product with no entry here.
 */

import type { GuaranteedAnalysis } from "@/lib/guaranteed-analysis";

export interface KnownFormula {
  /** The list as printed. Order preserved; nothing added, nothing removed. */
  ingredients: string;
  /** The panel as printed. Minima and maxima, never converted. */
  analysis: GuaranteedAnalysis;
  /** When the formula was last checked against a manufacturer record. */
  verifiedAt: string;
  /**
   * Set when older records for this same barcode show a DIFFERENT formula.
   *
   * Not a warning about this row — it is the current one. It is a note that the
   * product has been reformulated under a stable barcode, which is exactly the
   * case where overwriting silently would destroy the evidence.
   */
  conflict?: string;
}

const VERIFIED = "2026-08-11";

/** Batch 004 — read off Purina label decks rather than retailer listings. */
const VERIFIED_004 = "2026-08-12";

/**
 * The six guarantees every one of these packs prints.
 *
 * Calories are optional because most sources omit the statement — `withCalories`
 * adds it where the label deck supplied one. Null is the honest answer for the
 * rest: a missing calorie line is not a zero.
 */
function ga(
  crudeProteinMin: number,
  crudeFatMin: number,
  crudeFiberMax: number,
  moistureMax: number,
  ashMax: number,
  /**
   * Null where the deck states no taurine guarantee.
   *
   * Not the same as zero, and not the same as "no taurine in the food". Fancy
   * Feast Delights With Cheddar carries taurine in its ingredient list and
   * guarantees nothing about how much — cat food is required to contain it
   * whether or not the panel states a figure. Writing 0.05 here because its
   * siblings print 0.05 would be putting a number on a label that has none.
   */
  taurineMin: number | null
): GuaranteedAnalysis {
  return {
    crudeProteinMin,
    crudeFatMin,
    crudeFiberMax,
    moistureMax,
    ashMax,
    taurineMin,
    kcalPerKg: null,
    kcalPerServing: null,
    servingName: null,
  };
}

/**
 * The calorie statement printed beside the panel.
 *
 * Worth having rather than deriving: energy cannot be calculated from the
 * guarantees, because they are minima and maxima rather than the real figures,
 * and the carbohydrate that carries the rest of the energy is never printed at
 * all. A stated 863 kcal/kg is a fact; anything we computed would be a guess
 * wearing a number's clothes.
 *
 * It also checks itself. A 3 oz can is 85 g, and 863 kcal/kg × 0.085 kg = 73.4
 * against a printed 73 — the two halves of the statement agreeing is a sign the
 * figures came off a real deck rather than out of somebody's head.
 */
function withCalories(
  analysis: GuaranteedAnalysis,
  kcalPerKg: number,
  kcalPerServing: number,
  servingName = "can"
): GuaranteedAnalysis {
  return { ...analysis, kcalPerKg, kcalPerServing, servingName };
}

/** The vitamin block, identical across most of the Purina range. */
const V =
  "Vitamins [Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Folic Acid (Vitamin B-9), Vitamin D-3 Supplement]";

/** The Friskies Pâté ordering, which differs — B-6 and B-2 come before A. */
const V_PATE =
  "Vitamins [Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Vitamin A Supplement, Folic Acid (Vitamin B-9), Menadione Sodium Bisulfite Complex (Vitamin K), Vitamin D-3 Supplement]";

/** And the two that lead with Vitamin E. */
const V_E_FIRST =
  "Vitamins [Vitamin E Supplement, Thiamine Mononitrate (Vitamin B-1), Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Vitamin A Supplement, Folic Acid (Vitamin B-9), Menadione Sodium Bisulfite Complex (Vitamin K), Vitamin D-3 Supplement]";

const V_E_FIRST_A_MID =
  "Vitamins [Vitamin E Supplement, Thiamine Mononitrate (Vitamin B-1), Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Folic Acid (Vitamin B-9), Vitamin D-3 Supplement]";

/** Savory Centers leads with niacin, and puts A near the end. */
const V_NIACIN_FIRST =
  "Vitamins [Niacin (Vitamin B-3), Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Calcium Pantothenate (Vitamin B-5), Riboflavin Supplement (Vitamin B-2), Pyridoxine Hydrochloride (Vitamin B-6), Menadione Sodium Bisulfite Complex (Vitamin K), Folic Acid (Vitamin B-9), Vitamin A Supplement, Biotin (Vitamin B-7), Vitamin B-12 Supplement, Vitamin D-3 Supplement]";

/**
 * Prime Filets Salmon & Beef, whose deck closes the vitamin bracket BEFORE
 * menadione and then lists it on its own.
 *
 * The source flagged this and asked that it not be tidied on import, and it is
 * right to: a bracket is a group the label drew, and moving an item into one it
 * was printed outside of is editing the label to look like its siblings.
 */
const V_NO_K =
  "Vitamins [Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Vitamin A Supplement, Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Folic Acid (Vitamin B-9), Vitamin D-3 Supplement], Menadione Sodium Bisulfite Complex (Vitamin K)";

/** Keyed by the UPC exactly as printed under the bars. */
export const KNOWN_FORMULAS: Record<string, KnownFormula> = {
  // ── Fancy Feast · Classic Pâté ─────────────────────────────────────────
  "050000429943": {
    ingredients: `Chicken, Chicken Broth, Meat By-Products, Liver, Fish, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, ${V}, Salt.`,
    analysis: ga(10.0, 5.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429042": {
    ingredients: `Chicken, Chicken Broth, Liver, Meat By-Products, Fish, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}, Salt.`,
    analysis: ga(10.0, 5.0, 1.5, 78.0, 3.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429844": {
    ingredients: `Turkey, Meat By-Products, Liver, Turkey Broth, Fish, Poultry Giblets, Artificial And Natural Flavors, Guar Gum, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Taurine, ${V}.`,
    analysis: ga(11.0, 5.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429141": {
    ingredients: `Beef, Beef Broth, Liver, Meat By-Products, Chicken, Artificial And Natural Flavors, Guar Gum, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Choline Chloride, Taurine, ${V}.`,
    analysis: ga(10.0, 5.0, 1.5, 78.0, 3.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429745": {
    ingredients: `Beef, Beef Broth, Meat By-Products, Liver, Chicken, Artificial And Natural Flavors, Guar Gum, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Choline Chloride, Taurine, ${V}.`,
    analysis: ga(10.5, 6.0, 1.5, 78.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429547": {
    ingredients: `Beef, Beef Broth, Meat By-Products, Liver, Fish, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Tricalcium Phosphate, Taurine, Salt, ${V}.`,
    analysis: ga(11.0, 4.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429646": {
    // Taurine is guaranteed at 0.05% and is NOT in the list. It stays out —
    // writing it in because the panel mentions it would be inventing a line.
    ingredients: `Ocean Whitefish, Meat By-Products, Liver, Fish, Fish Broth, Tuna, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide], Tricalcium Phosphate, Salt, ${V}.`,
    analysis: ga(12.0, 2.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000429448": {
    ingredients: `Salmon, Meat By-Products, Liver, Fish Broth, Fish, Poultry, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Taurine, Salt, ${V}.`,
    analysis: ga(11.0, 4.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000103867": {
    ingredients: `Salmon, Meat By-Products, Liver, Fish Broth, Turkey, Fish, Shrimp, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, ${V}, Salt.`,
    analysis: ga(11.0, 4.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000428946": {
    ingredients: `Cod, Fish, Meat By-Products, Liver, Fish Broth, Sole, Shrimp, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, ${V}, Salt.`,
    analysis: ga(12.0, 2.0, 1.5, 78.0, 3.25, 0.05),
    verifiedAt: VERIFIED,
  },

  // ── Fancy Feast · Gravy Lovers ─────────────────────────────────────────
  //
  // Broth leads every one of these, and wheat gluten sits third or fourth. That
  // is what a gravy product is, and it is why `food_form: wet` matters to the
  // report: read with dry-food instincts this order looks damning.
  "050000578450": {
    ingredients: `Chicken Broth, Chicken, Wheat Gluten, Meat By-Products, Liver, Fish, Corn Starch-Modified, Soy Flour, Glycine, Salt, Natural Flavor, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000578474": {
    ingredients: `Beef Broth, Beef, Wheat Gluten, Meat By-Products, Liver, Fish, Corn Starch-Modified, Chicken, Soy Flour, Glycine, Salt, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000578436": {
    ingredients: `Fish Broth, Ocean Whitefish, Wheat Gluten, Chicken, Meat By-Products, Liver, Corn Starch-Modified, Tuna, Soy Flour, Glycine, Salt, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Vegetable Glycerin, Taurine, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000578412": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Meat By-Products, Liver, Chicken, Corn Starch-Modified, Soy Flour, Glycine, Salt, Vegetable Glycerin, Tricalcium Phosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000580040": {
    ingredients: `Turkey Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Chicken, Corn Starch-Modified, Soy Flour, Glycine, Salt, Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
  },


  // ── Fancy Feast · Grilled ──────────────────────────────────────────────
  //
  // Batch 003, from Purina's own label decks — the first source here to carry
  // the calorie statement, and the first whose ingredient blocks arrived
  // written out rather than summarised as "mineral premix [potassium, zinc]".
  //
  // It also corrected itself: the earlier normalised pass gave Grilled Beef and
  // Grilled Turkey 2.0% minimum fat where the deck says 1.5%. That correction
  // cost nothing to apply because those panels were never stored — the products
  // were seeded as identity only, precisely because the source was a paraphrase.
  //
  // Case follows this file rather than the source's mixed capitals: it is
  // typography, not data, and `composition_key` folds it away in any case. The
  // words and their ORDER are what was copied.
  "050000040803": {
    ingredients: `Chicken Broth, Chicken, Wheat Gluten, Meat By-Products, Liver, Fish, Corn Starch-Modified, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 2.7, 0.05), 863, 73),
    verifiedAt: VERIFIED,
  },
  "050000040704": {
    ingredients: `Beef Broth, Beef, Wheat Gluten, Meat By-Products, Liver, Fish, Corn Starch-Modified, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 2.7, 0.05), 833, 70),
    verifiedAt: VERIFIED,
  },
  "050000040605": {
    ingredients: `Turkey Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Fish, Corn Starch-Modified, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 2.7, 0.05), 833, 70),
    verifiedAt: VERIFIED,
  },
  // Note the order here differs from its three siblings: the minerals come
  // BEFORE the natural flavor, and the block carries magnesium proteinate. Both
  // were in the source and both are kept — a list tidied to match its
  // neighbours is a list that no longer describes its own tin.
  "050000503896": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Chicken, Meat By-Products, Liver, Corn Starch-Modified, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 2.7, 0.05), 850, 72),
    verifiedAt: VERIFIED,
  },


  // ── The nine that came with the premix collapsed ───────────────────────
  //
  // These say "Mineral Premix" and "Vitamin Premix" where the tin spells the
  // blocks out. Kept as given rather than reconstructed: the elements could be
  // recovered from an earlier pass and the salt forms from Purina's other decks,
  // but assembling a list from two sources and storing it as one label's text is
  // writing a label rather than copying one.
  //
  // Taken anyway, and the reason is worth recording because it reverses an
  // earlier call. Measured, the collapse costs Potassium Chloride and Riboflavin
  // from the additives and 23 vitamin and mineral names from the foods — all of
  // it PREMIX. Everything the report actually judges a food on is here verbatim
  // and in order: water or broth, the meat, wheat gluten, meat by-products, soy
  // flour, modified corn starch, the flavours. Counting tokens made the loss look
  // like half the label; looking at which tokens shows it is the tail.
  //
  // What it does cost, honestly: `composition_key` is built from the words, so a
  // later photograph of the real tin — which WILL carry the expanded blocks —
  // won't match its own seeded row, and the duplicate detector stays quiet. That
  // fails safe (it declines to merge rather than merging wrongly) and is the
  // price of having these products readable at all today.

  // Fancy Feast · Grilled, completing the range.
  "050000572168": {
    ingredients:
      "Fish Broth, Ocean Fish, Wheat Gluten, Meat By-Products, Liver, Chicken, Modified Corn Starch, Soy Flour, Corn Oil, Shrimp, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Mineral Premix, Choline Chloride, Taurine, Vitamin Premix.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 2.7, 0.05), 843, 71),
    verifiedAt: VERIFIED,
  },
  "050000102167": {
    ingredients:
      "Chicken Broth, Chicken, Liver, Wheat Gluten, Meat By-Products, Beef, Modified Corn Starch, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Mineral Premix, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 2.5, 0.05), 835, 71),
    verifiedAt: VERIFIED,
  },
  "050000102068": {
    ingredients:
      "Fish Broth, Salmon, Wheat Gluten, Liver, Meat By-Products, Chicken, Modified Corn Starch, Shrimp, Soy Flour, Glycine, Tricalcium Phosphate, Salt, Corn Oil, Natural Flavor, Mineral Premix, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 3.0, 0.05), 847, 72),
    verifiedAt: VERIFIED,
  },
  // "Liver & Chicken Broth" as one ingredient is unusual — a broth is normally
  // named for one animal. Flagged when the identity arrived and kept as the
  // source has it twice now, so it stands rather than being quietly rewritten.
  "050000100866": {
    ingredients:
      "Liver & Chicken Broth, Liver, Chicken, Wheat Gluten, Meat By-Products, Modified Corn Starch, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Mineral Premix, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 2.7, 0.05), 868, 73),
    verifiedAt: VERIFIED,
  },

  // ── Friskies · Prime Filets ────────────────────────────────────────────
  //
  // Water first on all four, where the Fancy Feast ranges lead with a broth.
  // That is a real difference between the two shelves and the report reads it.
  "050000170180": {
    ingredients:
      "Water, Chicken, Wheat Gluten, Liver, Meat By-Products, Soy Flour, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Mineral Premix, Taurine, Salt, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(10.0, 2.0, 1.0, 82.0, 2.8, 0.05), 810, 126),
    verifiedAt: VERIFIED,
  },
  "050000225224": {
    ingredients:
      "Water, Turkey, Wheat Gluten, Liver, Meat By-Products, Chicken, Soy Flour, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Mineral Premix, Salt, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(10.0, 2.0, 1.0, 82.0, 2.8, 0.05), 794, 123),
    verifiedAt: VERIFIED,
  },
  "050000100446": {
    ingredients:
      "Water, Chicken, Liver, Wheat Gluten, Meat By-Products, Soy Flour, Tuna, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Mineral Premix, Salt, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(10.0, 2.0, 1.0, 82.0, 2.8, 0.05), 803, 125),
    verifiedAt: VERIFIED,
    conflict:
      "Deck H611023 is the current formula. Older retailer records for this barcode carry an earlier one.",
  },
  // The clearest reformulation in the batch, and the kind worth keeping a note
  // of: the previous deck carried Added Color and Red 3. This one carries
  // neither. A shopper reading an older listing is reading about a product that
  // is no longer in the tin.
  "050000170166": {
    ingredients:
      "Water, Wheat Gluten, Chicken, Liver, Meat By-Products, Ocean Whitefish, Soy Flour, Tuna, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Mineral Premix, Taurine, Choline Chloride, Salt, Vitamin Premix.",
    analysis: withCalories(ga(10.0, 2.0, 1.0, 82.0, 2.8, 0.05), 796, 124),
    verifiedAt: VERIFIED,
    conflict:
      "Deck H611423 is current. The previous formula (G611419) contained Added Color and Red 3 and ran at 766 kcal/kg; this one has neither.",
  },

  // ── Friskies · Tasty Treasures ─────────────────────────────────────────
  "050000577965": {
    ingredients:
      "Water, Chicken, Liver, Wheat Gluten, Meat By-Products, Soy Flour, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Mineral Premix, Salt, Taurine, Choline Chloride, Vitamin Premix.",
    analysis: withCalories(ga(10.0, 2.0, 1.0, 80.0, 3.0, 0.05), 863, 134),
    verifiedAt: VERIFIED,
    conflict:
      "Deck B627723 is current. The previous formula (A627719) contained Added Color and Red 3 at 137 kcal/can. This barcode is the chicken-and-liver variety, NOT Chicken & Cheese.",
  },

  // ── Friskies · Shreds ──────────────────────────────────────────────────
  "050000572014": {
    ingredients: `Water Sufficient for Processing, Poultry, Meat By-Products, Salmon, Wheat Gluten, Corn Starch-Modified, Soy Flour, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Choline Chloride, Taurine, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000571987": {
    ingredients: `Water Sufficient for Processing, Chicken, Liver, Wheat Gluten, Turkey, Meat By-Products, Corn Starch-Modified, Soy Flour, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Choline Chloride, Taurine, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000103645": {
    ingredients: `Water Sufficient for Processing, Liver, Chicken, Beef, Wheat Gluten, Turkey, Fish, Corn Starch-Modified, Soy Flour, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000103683": {
    ingredients: `Water Sufficient for Processing, Chicken, Wheat Gluten, Liver, Meat By-Products, Ocean Whitefish, Corn Starch-Modified, Soy Flour, Tuna, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: ga(9.0, 2.0, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000445691": {
    ingredients: `Water Sufficient for Processing, Chicken, Wheat Gluten, Meat By-Products, Liver, Turkey, Corn Starch-Modified, Soy Flour, Salmon, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
  },
  "050000412204": {
    ingredients: `Water Sufficient for Processing, Meat By-Products, Turkey, Wheat Gluten, Chicken, Corn Starch-Modified, Soy Flour, Cheese, Artificial And Natural Flavors, Sodium Caseinate, Medium Chain Triglyceride Vegetable Oil (MCTs), Tricalcium Phosphate, Corn Starch, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Taurine, Dried Whey, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05),
    verifiedAt: VERIFIED,
    conflict:
      "Some retailer copies still carry an older list with generic 'Vegetable Oil' and 'Non-Fat Milk' in place of the MCT oil and dried whey above.",
  },

  // ── Friskies · Pâté ────────────────────────────────────────────────────
  //
  // Carrageenan in all five, and by-products leading four of them. Worth
  // knowing that the range differs from Shreds this sharply — same brand, same
  // shelf, a different kind of product underneath.
  "050000421848": {
    ingredients: `Meat By-Products, Water Sufficient for Processing, Poultry By-Product, Turkey, Poultry Giblets, Fish, Rice, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Salt, Tricalcium Phosphate, Carrageenan, Taurine, Choline Chloride, ${V_PATE}.`,
    analysis: ga(9.0, 5.0, 1.0, 78.0, 3.3, 0.05),
    verifiedAt: VERIFIED,
    conflict: "Older records exist for this barcode under a different formula.",
  },
  "050000420445": {
    // Printed without the bracketed groups on this one — minerals and vitamins
    // run inline. Copied as printed rather than regrouped to match its siblings.
    ingredients:
      "Water Sufficient for Processing, Poultry By-Product, Meat By-Products, Liver, Fish, Chicken, Rice, Artificial And Natural Flavors, Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide, Guar Gum, Salt, Tricalcium Phosphate, Carrageenan, Choline Chloride, Taurine, Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Vitamin A Supplement, Folic Acid (Vitamin B-9), Menadione Sodium Bisulfite Complex (Vitamin K), Vitamin D-3 Supplement.",
    analysis: ga(9.0, 5.0, 1.0, 78.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
    conflict:
      "Older retailer records show a different protein guarantee for this barcode. Current record is 9% minimum.",
  },
  "050000421541": {
    ingredients: `Meat By-Products, Water Sufficient for Processing, Poultry By-Product, Liver, Chicken, Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Salt, Carrageenan, Choline Chloride, Taurine, ${V_PATE}.`,
    analysis: ga(9.0, 5.0, 1.0, 78.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
    conflict: "Older records exist for this barcode under a different formula.",
  },
  "050000423347": {
    ingredients: `Water Sufficient for Processing, Salmon, Poultry By-Product, Meat By-Products, Liver, Fish, Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], ${V_E_FIRST}, Carrageenan, Choline Chloride, Taurine, Salt.`,
    analysis: ga(9.0, 5.0, 1.0, 78.0, 3.3, 0.05),
    verifiedAt: VERIFIED,
    conflict:
      "Older records for this barcode show 10% minimum protein and a formula containing artificial colours. The two are different formulas, not one record to reconcile.",
  },
  "050000424948": {
    ingredients: `Ocean Whitefish, Poultry By-Product, Meat By-Products, Liver, Water Sufficient for Processing, Fish, Tuna, Rice, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], ${V_E_FIRST_A_MID}, Carrageenan, Choline Chloride, Taurine, Salt.`,
    analysis: ga(9.0, 4.0, 1.0, 78.0, 3.5, 0.05),
    verifiedAt: VERIFIED,
    conflict:
      "Older records for this barcode show 11% minimum protein against the current 9%. One barcode, two formulas — the reason a formula cannot be keyed on a UPC alone.",
  },

  // ── Friskies · Extra Gravy ─────────────────────────────────────────────
  "050000293315": {
    ingredients: `Water Sufficient for Processing, Liver, Meat By-Products, Beef, Wheat Gluten, Poultry, Soy Flour, Corn Starch-Modified, Artificial And Natural Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: ga(9.0, 2.5, 1.0, 82.0, 3.0, 0.05),
    verifiedAt: VERIFIED,
    conflict:
      "Older copies of this list include 'Added Color'. The current record carries no artificial colours.",
  },

  // ── Fancy Feast · Delights With Cheddar ────────────────────────────────
  //
  // The first four packs in this file whose deck states NO taurine guarantee.
  // Taurine is in the ingredient list of all four and the panel says nothing
  // about how much; `ga` takes null for exactly this, and null reads as "not
  // stated" everywhere downstream rather than as zero.
  "050000579310": {
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Liver, Meat By-Products, Vegetable Starch-Modified, Cheese (Source Of Cheddar Cheese), Soy Flour, Salt, Glycine, Sodium Caseinate, Vegetable Oil, Natural Flavor, Tricalcium Phosphate, Corn Starch, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Dried Whey, Taurine, Choline Chloride, Non-Fat Milk, ${V}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 80.0, 3.0, null), 860, 73),
    verifiedAt: VERIFIED_004,
  },
  "050000579334": {
    ingredients: `Poultry Broth, Turkey, Wheat Gluten, Liver, Meat By-Products, Vegetable Starch-Modified, Cheese (Source Of Cheddar Cheese), Soy Flour, Salt, Glycine, Sodium Caseinate, Vegetable Oil, Natural Flavor, Tricalcium Phosphate, Corn Starch, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Dried Whey, Taurine, Choline Chloride, Non-Fat Milk, ${V}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 80.0, 3.0, null), 857, 72),
    verifiedAt: VERIFIED_004,
  },
  "050000579358": {
    ingredients: `Fish Broth, Whitefish, Wheat Gluten, Liver, Meat By-Products, Vegetable Starch-Modified, Chicken, Cheese (Source Of Cheddar Cheese), Soy Flour, Salt, Glycine, Sodium Caseinate, Vegetable Oil, Natural Flavor, Tricalcium Phosphate, Corn Starch, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Dried Whey, Taurine, Choline Chloride, Non-Fat Milk, ${V}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 80.0, 3.0, null), 842, 71),
    verifiedAt: VERIFIED_004,
  },
  "050000579280": {
    ingredients: `Fish Broth, Tuna, Wheat Gluten, Liver, Meat By-Products, Chicken, Vegetable Starch-Modified, Cheese (Source Of Cheddar Cheese), Soy Flour, Glycine, Sodium Caseinate, Salt, Vegetable Oil, Tricalcium Phosphate, Natural Flavor, Corn Starch, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Dried Whey, Taurine, Choline Chloride, Non-Fat Milk, ${V}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 80.0, 3.0, null), 856, 72),
    verifiedAt: VERIFIED_004,
  },

  // ── Fancy Feast · Savory Centers ───────────────────────────────────────
  //
  // Methionine after the vitamin block on all four, which is where the deck
  // puts it. Iron Sulfate rather than Ferrous Sulfate, and Calcium Iodate
  // rather than Potassium Iodide: the same elements under the names this range
  // prints, copied rather than harmonised with its siblings.
  "050000172733": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Products, Fish, Glycine, Locust Bean Gum, Guar Gum, Sodium Tripolyphosphate, Minerals [Potassium Chloride, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate, Magnesium Sulfate], Natural Flavors, Pork Bone Meal, Taurine, Choline Chloride, ${V_NIACIN_FIRST}, Methionine.`,
    analysis: withCalories(ga(9.0, 5.5, 1.5, 82.0, 3.0, 0.05), 1039, 88),
    verifiedAt: VERIFIED_004,
  },
  "050000172757": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Products, Salmon, Glycine, Locust Bean Gum, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate, Magnesium Sulfate], Sodium Tripolyphosphate, Natural Flavors, Taurine, Choline Chloride, Pork Bone Meal, ${V_NIACIN_FIRST}, Methionine.`,
    analysis: withCalories(ga(9.0, 5.5, 1.5, 82.0, 3.0, 0.05), 1060, 90),
    verifiedAt: VERIFIED_004,
  },
  "050000172771": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Products, Tuna, Glycine, Locust Bean Gum, Guar Gum, Sodium Tripolyphosphate, Minerals [Potassium Chloride, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate, Magnesium Sulfate], Natural Flavors, Taurine, Choline Chloride, Pork Bone Meal, ${V_NIACIN_FIRST}, Methionine.`,
    analysis: withCalories(ga(9.0, 5.0, 1.5, 82.0, 3.0, 0.05), 1007, 85),
    verifiedAt: VERIFIED_004,
  },
  "050000172801": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Products, Fish, Glycine, Beef, Locust Bean Gum, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate, Magnesium Sulfate], Sodium Tripolyphosphate, Natural Flavors, Taurine, Choline Chloride, Pork Bone Meal, ${V_NIACIN_FIRST}, Methionine.`,
    analysis: withCalories(ga(9.0, 5.5, 1.5, 82.0, 3.0, 0.05), 1067, 90),
    verifiedAt: VERIFIED_004,
  },

  // ── Friskies · Meaty Bits ──────────────────────────────────────────────
  "050000423149": {
    ingredients: `Water, Meat By-Products, Beef, Wheat Gluten, Chicken, Fish, Soy Flour, Modified Corn Starch, Natural And Artificial Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 961, 149),
    verifiedAt: VERIFIED_004,
    conflict:
      "Target still lists an older formula for this barcode: 11% minimum protein, turkey among the meats, and Added Color. The current deck has none of those. One barcode, two formulas.",
  },

  // ── Friskies · Meaty Bits (continued) ──────────────────────────────────
  "050000420544": {
    ingredients: `Water, Poultry, Liver, Wheat Gluten, Meat By-Products, Soy Flour, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 969, 151),
    verifiedAt: VERIFIED_004,
  },
  "050000421947": {
    ingredients: `Water, Chicken, Liver, Wheat Gluten, Meat By-Products, Turkey, Soy Flour, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 965, 150),
    verifiedAt: VERIFIED_004,
    conflict:
      "Older retailer records show 11% minimum protein for this barcode. Current formula data for G610022 is 10%.",
  },

  // ── Friskies · Pâté (continued) ────────────────────────────────────────
  "050000423644": {
    ingredients: `Poultry, Water, Meat By-Products, Liver, Poultry By-Products, Fish, Rice, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Carrageenan, Choline Chloride, Taurine, ${V_PATE}, Salt.`,
    analysis: withCalories(ga(9.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1124, 175),
    verifiedAt: VERIFIED_004,
  },
  "050000424443": {
    ingredients: `Meat By-Products, Poultry By-Products, Water, Chicken, Liver, Tuna, Rice, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Tricalcium Phosphate, Carrageenan, Taurine, Choline Chloride, Salt, ${V_PATE}.`,
    analysis: withCalories(ga(9.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1132, 176),
    verifiedAt: VERIFIED_004,
  },
  "050000425044": {
    // Named after the sea and led by meat by-products, with fish third. The
    // list is what it is; the name is on the front of the tin.
    ingredients: `Meat By-Products, Water, Fish, Chicken, Poultry By-Products, Rice, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Guar Gum, Carrageenan, Choline Chloride, Taurine, Salt, ${V}.`,
    analysis: withCalories(ga(9.0, 4.0, 1.0, 78.0, 3.5, 0.05), 1141, 177),
    verifiedAt: VERIFIED_004,
  },
  "050000425648": {
    ingredients: `Meat By-Products, Water, Fish, Poultry By-Products, Chicken, Rice, Artificial And Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Guar Gum, Carrageenan, Salt, Choline Chloride, Taurine, ${V_PATE}.`,
    analysis: withCalories(ga(9.0, 4.0, 1.0, 78.0, 3.5, 0.05), 1151, 179),
    verifiedAt: VERIFIED_004,
  },
  "050000423248": {
    ingredients: `Meat By-Products, Water, Chicken, Fish, Poultry By-Products, Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Carrageenan, Choline Chloride, Taurine, ${V_PATE}, Salt.`,
    // The label deck's figure. Purina's own product page has shown 1093 kcal/kg
    // and 170 kcal/can for the same code — see the note below.
    analysis: withCalories(ga(9.0, 5.0, 1.0, 78.0, 3.0, 0.05), 1151, 179),
    verifiedAt: VERIFIED_004,
    conflict:
      "Two calorie statements exist for this barcode: label deck J605224 says 1151 kcal/kg and 179 kcal/can, Purina's product page has shown 1093 and 170. Both pairs are internally consistent for a 5.5 oz can, so this is two formulas rather than one typo. The deck's figure is stored. Worth re-reading off a physical can.",
  },

  // ── Friskies · Prime Filets (continued) ────────────────────────────────
  "050000100422": {
    ingredients: `Water, Salmon, Wheat Gluten, Liver, Meat By-Products, Beef, Soy Flour, Poultry, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V_NO_K}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.0, 82.0, 2.8, 0.05), 805, 125),
    verifiedAt: VERIFIED_004,
  },

  // ── Friskies · Tasty Treasures (continued) ─────────────────────────────
  //
  // Scallop flavour is a separate entry near the end of both decks, after the
  // artificial and natural flavors that already appear higher up. Kept where
  // it is printed.
  "050000577972": {
    ingredients: `Water, Meat By-Products, Chicken, Wheat Gluten, Soy Flour, Modified Corn Starch, Ocean Fish, Tuna, Artificial And Natural Flavors, Sodium Caseinate, Tricalcium Phosphate, Vegetable Oil, Vegetable Starch-Modified, Corn Starch, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Dried Whey, Sodium Phosphate, Taurine, Choline Chloride, Scallop Flavor, Non-Fat Milk, ${V_PATE}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.0, 80.0, 3.0, 0.05), 877, 136),
    verifiedAt: VERIFIED_004,
  },
  "050000577958": {
    ingredients: `Water, Meat By-Products, Wheat Gluten, Chicken, Soy Flour, Modified Corn Starch, Tuna, Artificial And Natural Flavors, Sodium Caseinate, Tricalcium Phosphate, Vegetable Oil, Vegetable Starch-Modified, Corn Starch, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Salt, Dried Whey, Sodium Phosphate, Taurine, Choline Chloride, Scallop Flavor, Non-Fat Milk, ${V_PATE}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.0, 80.0, 3.0, 0.05), 867, 135),
    verifiedAt: VERIFIED_004,
  },

  // ── Friskies · Extra Gravy (continued) ─────────────────────────────────
  "050000168781": {
    ingredients: `Meat By-Products, Water, Poultry By-Products, Chicken, Tuna, Artificial And Natural Flavors, Carrageenan, Calcium Sulfate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, ${V_E_FIRST_A_MID}, Taurine, Salt, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 5.0, 1.0, 82.0, 3.5, 0.05), 1003, 156),
    verifiedAt: VERIFIED_004,
  },
};
