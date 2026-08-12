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
  taurineMin: number
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
};
