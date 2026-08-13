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

/** Batch 005 — Fancy Feast Kitten, Petites and Flaked. */
const VERIFIED_005 = "2026-08-12";

/** Batch 006 — Fancy Feast Gems and Friskies Farm Favorites. */
const VERIFIED_006 = "2026-08-12";

/** Batch 007 — Friskies Ocean Favorites, Wild Favorites and two Shreds. */
const VERIFIED_007 = "2026-08-13";

/** Batch 008 — the Fancy Feast Medleys range. */
const VERIFIED_008 = "2026-08-13";

/** Batch 009 — the Fancy Feast Gourmet Naturals range. */
const VERIFIED_009 = "2026-08-13";

/** Batch 010 — four more Medleys, Fully Load\u2019d and Glaz\u2019d & Infuz\u2019d. */
const VERIFIED_010 = "2026-08-13";

/** Batch 011 — the rest of the Fancy Feast Medleys range. */
const VERIFIED_011 = "2026-08-13";

/** Batch 012 — Gravy Lovers, Marinated Morsels and Sliced. */
const VERIFIED_012 = "2026-08-13";

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

/**
 * The same twelve in the same order as `V`, printed without the vitamin
 * letters — "Thiamine Mononitrate" rather than "Thiamine Mononitrate (Vitamin
 * B-1)". Every Petites deck in batch 005 is written this way.
 *
 * Copied rather than harmonised. Adding the glosses because the sibling ranges
 * carry them would be putting words on a label that may not have them, and the
 * whole value of this file is that it does not do that. If a photograph of a
 * real tub later shows the letters, the photograph wins — which is what
 * `community` ranking is for.
 */
const V_PLAIN =
  "Vitamins [Thiamine Mononitrate, Vitamin E Supplement, Niacin, Calcium Pantothenate, Vitamin A Supplement, Menadione Sodium Bisulfite Complex, Pyridoxine Hydrochloride, Riboflavin Supplement, Vitamin B-12 Supplement, Biotin, Folic Acid, Vitamin D-3 Supplement]";

/**
 * The Gems ordering: E first, then B3 and B1, with A and K late.
 *
 * ── Why these read differently from the source document ───────────────────
 *
 * Batch 006 arrived written in a third notation: "KCl", "B3 niacin", "B6
 * pyridoxine HCl", "Vitamin K menadione sodium bisulfite complex". None of
 * those is label text. A US pet food label has to name its ingredients by their
 * AAFCO definitions — "Potassium Chloride", "Niacin", "Pyridoxine
 * Hydrochloride" — and no deck prints a chemical formula or a leading vitamin
 * number. That is the source compressing, not the pack.
 *
 * So the abbreviations are expanded back to the terms they abbreviate, which is
 * undoing the source's shorthand rather than editing a label. What is NOT done
 * is the other direction: the parenthetical glosses the other ranges carry —
 * "Niacin (Vitamin B-3)" — are not added here, because whether this deck prints
 * them is exactly what the shorthand destroyed, and guessing would be writing
 * the label rather than copying it.
 */
const V_GEMS =
  "Vitamins [Vitamin E Supplement, Niacin, Thiamine Mononitrate, Calcium Pantothenate, Riboflavin Supplement, Pyridoxine Hydrochloride, Folic Acid, Vitamin A Supplement, Menadione Sodium Bisulfite Complex, Biotin, Vitamin B-12 Supplement, Vitamin D-3 Supplement]";

/**
 * The Medleys ordering, which is `V`'s order in a shorter notation.
 *
 * Two things differ from every other deck in this file and both are copied
 * rather than reconciled: the B vitamins are glossed "(B1)" instead of
 * "(Vitamin B-1)", and biotin and folic acid carry no gloss at all while
 * menadione keeps its full "(Vitamin K)".
 *
 * That inconsistency is the evidence. A source compressing uniformly would
 * have shortened the K too; one that shortened some and not others is much
 * more likely to be reporting what the deck prints. So this is neither
 * expanded to match the ranges that write "(Vitamin B-1)" nor stripped to bare
 * names — both would be tidying a label into a house style it does not have.
 */
const V_MEDLEYS =
  "Vitamins [Thiamine Mononitrate (B1), Vitamin E Supplement, Niacin (B3), Calcium Pantothenate (B5), Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Pyridoxine Hydrochloride (B6), Riboflavin Supplement (B2), Vitamin B-12 Supplement, Biotin, Folic Acid, Vitamin D-3 Supplement]";

/**
 * `V_PATE`'s order in the short notation — a tenth block, and the last one
 * anybody should be surprised by.
 *
 * Thiamine, E, niacin, pantothenate, B6, B2, B12, biotin, A, folic acid,
 * menadione, D-3: exactly the Friskies Pâté ordering. What differs is how it is
 * written. These decks gloss with bare letters, "(B1)" and "(B7)", where the
 * pâtés write "(Vitamin B-1)" and "(Vitamin B-7)" — and unlike `V_MEDLEYS`,
 * which drops the gloss from biotin and folic acid entirely, these keep it on
 * both.
 *
 * Ten constants for one vitamin premix looks absurd until you notice that no
 * two of them are the same document. Each is an ordering, a notation, or both,
 * observed on a deck. Merging any pair would make the file tidier and make it
 * describe a label nobody printed.
 */
const V_PATE_SHORT =
  "Vitamins [Thiamine Mononitrate (B1), Vitamin E Supplement, Niacin (B3), Calcium Pantothenate (B5), Pyridoxine Hydrochloride (B6), Riboflavin Supplement (B2), Vitamin B-12 Supplement, Biotin (B7), Vitamin A Supplement, Folic Acid (B9), Menadione Sodium Bisulfite Complex (Vitamin K), Vitamin D-3 Supplement]";

/**
 * An eleventh block: `V`'s order in the short notation, with every gloss kept.
 *
 * The closest existing constant is `V_MEDLEYS`, and it differs in exactly two
 * of twelve entries — biotin and folic acid, which Medleys prints bare and
 * these decks print as "(B7)" and "(B9)". Reusing it would have silently
 * stripped two glosses off ten labels, which is the whole failure mode these
 * constants exist to prevent. Checked against all ten before adding this one.
 */
const V_SHORT =
  "Vitamins [Thiamine Mononitrate (B1), Vitamin E Supplement, Niacin (B3), Calcium Pantothenate (B5), Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Pyridoxine Hydrochloride (B6), Riboflavin Supplement (B2), Vitamin B-12 Supplement, Biotin (B7), Folic Acid (B9), Vitamin D-3 Supplement]";

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

  // ── Fancy Feast · Kitten ───────────────────────────────────────────────
  //
  // Both decks also guarantee Calcium (min) 0.3%. `GuaranteedAnalysis` has no
  // calcium field — no pack in the first eighty stated one — so that figure is
  // NOT stored, and it is written here rather than dropped silently. Adding the
  // field means changing the type in this repo and in the consumer app
  // together, since the consumer drops keys it does not know when it reads the
  // stored panel back. Worth doing; not worth doing inside a data commit.
  "050000575008": {
    ingredients: `Turkey, Meat By-Products, Liver, Poultry Broth, Fish, Milk, Dried Egg Product, Artificial And Natural Flavorings, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, ${V_E_FIRST_A_MID}, Taurine, Salt.`,
    // 0.07% taurine, not the 0.05% every adult pack in this file states.
    analysis: withCalories(ga(11.0, 5.0, 1.5, 78.0, 3.5, 0.07), 1087, 92),
    verifiedAt: VERIFIED_005,
    conflict:
      "Target still exposes an older ingredient field for this barcode containing Added Color. The current Purina deck D662122 has none. Also guarantees Calcium (min) 0.3%, which is not stored.",
  },
  "050000574988": {
    ingredients: `Ocean Whitefish, Meat By-Products, Liver, Fish Broth, Chicken, Milk, Dried Egg Product, Artificial And Natural Flavorings, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, ${V_E_FIRST_A_MID}, Taurine, Salt.`,
    analysis: withCalories(ga(11.5, 4.0, 1.5, 78.0, 3.5, 0.07), 1067, 90),
    verifiedAt: VERIFIED_005,
    conflict:
      "Target's ingredient text for this barcode is OCR-corrupted; Purina deck D662022 is the master. Also guarantees Calcium (min) 0.3%, which is not stored.",
  },

  // ── Fancy Feast · Petites ──────────────────────────────────────────────
  //
  // Calories are per SERVING here, and a serving is half a tub. "47 kcal a
  // serving" on a 2.8 oz package is not a small can — it is one of two 1.4 oz
  // halves, and the arithmetic only checks out against the half.
  "050000002597": {
    ingredients: `Chicken Broth, Chicken, Wheat Gluten, Liver, Rice, Meat By-Products, Modified Corn Starch, Glycine, Salt, Soy Protein Concentrate, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.65, 0.05), 800, 32, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000002504": {
    ingredients: `Salmon Broth, Salmon, Wheat Gluten, Liver, Meat By-Products, Chicken, Modified Corn Starch, Spinach, Glycine, Salt, Tricalcium Phosphate, Soy Protein Concentrate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.75, 0.05), 785, 31, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000002528": {
    ingredients: `Fish Broth, Ocean Whitefish, Wheat Gluten, Tomatoes, Meat By-Products, Liver, Modified Corn Starch, Chicken, Corn Oil, Glycine, Salt, Soy Protein Concentrate, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.65, 0.05), 781, 31, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000002610": {
    ingredients: `Turkey Broth, Turkey, Wheat Gluten, Liver, Sweet Potatoes, Meat By-Products, Modified Corn Starch, Glycine, Salt, Soy Protein Concentrate, Natural Flavor, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.65, 0.05), 773, 30, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000002603": {
    ingredients: `Beef Broth, Beef, Wheat Gluten, Liver, Meat By-Products, Carrots, Modified Corn Starch, Glycine, Salt, Soy Protein Concentrate, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.5, 0.05), 783, 31, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000002580": {
    ingredients: `Chicken, Chicken Broth, Meat By-Products, Liver, Fish, Artificial And Natural Flavorings, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Choline Chloride, Taurine, Salt, ${V_PLAIN}.`,
    analysis: withCalories(ga(10.0, 5.0, 1.5, 78.0, 3.25, 0.05), 1193, 47, "serving"),
    verifiedAt: VERIFIED_005,
  },
  "050000001590": {
    ingredients: `Ocean Whitefish, Fish, Meat By-Products, Liver, Fish Broth, Tuna, Artificial And Natural Flavorings, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, ${V_PLAIN}, Salt.`,
    analysis: withCalories(ga(12.0, 2.0, 1.5, 78.0, 3.65, 0.05), 1063, 42, "serving"),
    verifiedAt: VERIFIED_005,
  },

  // ── Fancy Feast · Flaked ───────────────────────────────────────────────
  //
  // 74% moisture and 14% protein — the driest and the highest-protein panel in
  // the file. Both are ordinary for a flaked fish pack and neither trips the
  // as-fed sanity check, which is the point of having one.
  "050000426249": {
    ingredients: `Fish Broth, Tuna, Mackerel, Chicken, Wheat Gluten, Fish, Liver, Meat By-Products, Soy Flour, Glycine, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Xanthan Gum, Salt, Carrageenan, Choline Chloride, Taurine, ${V_E_FIRST_A_MID}.`,
    analysis: withCalories(ga(14.0, 3.5, 1.5, 74.0, 3.5, 0.05), 1161, 98),
    verifiedAt: VERIFIED_005,
  },

  // ── Fancy Feast · Gems ─────────────────────────────────────────────────
  //
  // Calories are per GEM — one of the two 2 oz mousses in the 4 oz box — and
  // every one of the six checks out against 2 oz rather than against 4.
  //
  // Note "Meat By-Product" singular on five of the six and plural on the
  // Turkey. Copied as each deck writes it; a difference that small is either
  // real or a typo in the source, and flattening it would destroy the evidence
  // either way.
  "050000544073": {
    ingredients: `Chicken Broth, Chicken, Meat By-Product, Liver, Beef, Modified Tapioca Starch, Glycine, Sodium Tripolyphosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Carrageenan, Taurine, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 849, 48, "gem"),
    verifiedAt: VERIFIED_006,
  },
  "050000544035": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Product, Modified Tapioca Starch, Glycine, Sodium Tripolyphosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Carrageenan, Taurine, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 881, 50, "gem"),
    verifiedAt: VERIFIED_006,
  },
  "050000544059": {
    ingredients: `Chicken Broth, Chicken, Meat By-Product, Liver, Salmon, Modified Tapioca Starch, Glycine, Sodium Tripolyphosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Carrageenan, Taurine, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 861, 49, "gem"),
    verifiedAt: VERIFIED_006,
  },
  "050000544097": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Product, Tuna, Modified Tapioca Starch, Glycine, Sodium Tripolyphosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Carrageenan, Taurine, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 849, 48, "gem"),
    verifiedAt: VERIFIED_006,
    conflict:
      "Target's ingredient field for this barcode is truncated mid-vitamin and carries a different formula code. Purina deck A638422 is the master.",
  },
  "050000589968": {
    // Taurine before carrageenan on this one and the Ocean Fish, after it on
    // the other four. Same eighteen ingredients, two orderings.
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Products, Turkey, Modified Tapioca Starch, Glycine, Natural Flavors, Sodium Tripolyphosphate, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Taurine, Carrageenan, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 930, 52, "gem"),
    verifiedAt: VERIFIED_006,
    conflict:
      "Target's title for this barcode says 4.9 oz/2pk against Purina's 4 oz box of two. The calorie statement settles it: at 930 kcal/kg a 2.45 oz gem would be 64.6 kcal and the deck prints 52, which is a 2 oz gem. Stored as 4 oz.",
  },
  "050000593019": {
    ingredients: `Chicken Broth, Chicken, Liver, Meat By-Product, Ocean Fish, Modified Tapioca Starch, Glycine, Sodium Tripolyphosphate, Natural Flavors, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Iron Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate], Locust Bean Gum, Guar Gum, Caramel Color, Taurine, Carrageenan, Methyl Cellulose, L-Ascorbic Acid, ${V_GEMS}, Choline Chloride.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 83.0, 3.0, 0.05), 912, 51, "gem"),
    verifiedAt: VERIFIED_006,
  },

  // ── Friskies · Farm Favorites ──────────────────────────────────────────
  //
  // The vegetables are real entries in the deck, high enough up to matter:
  // carrots fifth on the chicken pâté, spinach sixth on the salmon one. Same
  // vitamin ordering as the rest of the Purina range, in the plain notation.
  "050000501335": {
    ingredients: `Meat By-Products, Water, Poultry By-Products, Chicken, Carrots, Ocean Fish, Rice, Artificial And Natural Flavors, Guar Gum, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Carrageenan, Taurine, ${V_PLAIN}, Salt.`,
    analysis: withCalories(ga(8.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1220, 190),
    verifiedAt: VERIFIED_006,
  },
  "050000501359": {
    ingredients: `Meat By-Products, Chicken, Water, Poultry By-Products, Salmon, Spinach, Rice, Artificial And Natural Flavors, Guar Gum, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Carrageenan, Taurine, ${V_PLAIN}, Salt.`,
    analysis: withCalories(ga(8.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1228, 191),
    verifiedAt: VERIFIED_006,
  },
  "050000501397": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Turkey, Carrots, Soy Flour, Modified Corn Starch, Natural And Artificial Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V_PLAIN}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 79.0, 2.5, 0.05), 966, 151),
    verifiedAt: VERIFIED_006,
  },
  "050000501373": {
    ingredients: `Water, Meat By-Products, Chicken, Wheat Gluten, Soy Flour, Whitefish, Modified Corn Starch, Spinach, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V_PLAIN}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 79.0, 2.5, 0.05), 971, 151),
    verifiedAt: VERIFIED_006,
  },

  // ── Friskies · Ocean Favorites ─────────────────────────────────────────
  "050000503667": {
    ingredients: `Meat By-Products, Water, Chicken, Poultry By-Products, Salmon, Brown Rice, Peas, Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Carrageenan, Taurine, ${V}, Salt.`,
    analysis: withCalories(ga(8.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1180, 183),
    verifiedAt: VERIFIED_007,
    conflict: "Purina's own HTML page shows a different list for this barcode: “Poultry By-Product Meal” where deck B632321 says “Poultry By-Products”, and “Peas (Dried)” where it says “Peas”. By-product meal is rendered and dried rather than fresh, so these are two different formulas, not two spellings. The deck is stored; the pages are not merged. Worth a physical re-read.",
  },
  "050000503636": {
    ingredients: `Meat By-Products, Water, Chicken, Poultry By-Products, Tuna, Brown Rice, Peas, Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Carrageenan, Taurine, ${V}, Salt.`,
    analysis: withCalories(ga(8.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1168, 182),
    verifiedAt: VERIFIED_007,
    conflict: "Purina's own HTML page shows a different list for this barcode: “Poultry By-Product Meal” where deck B632321 says “Poultry By-Products”, and “Peas (Dried)” where it says “Peas”. By-product meal is rendered and dried rather than fresh, so these are two different formulas, not two spellings. The deck is stored; the pages are not merged. Worth a physical re-read.",
  },
  "050000503612": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Modified Corn Starch, Tuna, Crab, Brown Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 79.0, 2.5, 0.05), 965, 150),
    verifiedAt: VERIFIED_007,
  },
  "050000503681": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Modified Corn Starch, Salmon, Shrimp, Brown Rice, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 79.0, 2.5, 0.05), 967, 150),
    verifiedAt: VERIFIED_007,
    conflict:
      "Purina's product page now lists this can as 5.4 oz where retailers still show 5.5 oz. Deck A632019's own calorie statement belongs to the larger can: 967 kcal/kg x 5.5 oz is 150.8 against a printed 150, while 5.4 oz gives 148.0. Stored as 5.5 oz so the record does not contradict itself. A downsizing in progress, and worth a physical re-read.",
  },

  // ── Friskies · Wild Favorites ──────────────────────────────────────────
  //
  // Four decks that differ only in the named fish and vegetable, and in where
  // those two sit. Cod and Sardines put the vegetable AFTER the corn starch;
  // Tuna and Haddock put it before. Copied as each deck orders it.
  "050000543274": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Cod, Modified Corn Starch, Kale, Fish, Artificial And Natural Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 78.0, 2.5, 0.05), 981, 152),
    verifiedAt: VERIFIED_007,
  },
  "050000543311": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Tuna, Sweet Potatoes, Modified Corn Starch, Fish, Artificial And Natural Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 78.0, 2.5, 0.05), 977, 152),
    verifiedAt: VERIFIED_007,
  },
  "050000543250": {
    // Haddock stays. Purina's own HTML renderer currently drops it between the
    // soy flour and the sweet potatoes; the linked deck A633720 has it, and a
    // missing ingredient is not a formatting difference — it is the named fish
    // of the product disappearing from its own list.
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Haddock, Sweet Potatoes, Modified Corn Starch, Fish, Artificial And Natural Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 78.0, 2.5, 0.05), 982, 153),
    verifiedAt: VERIFIED_007,
    conflict:
      "Purina's HTML ingredient renderer currently omits Haddock between Soy Flour and Sweet Potatoes. Deck A633720 lists it, and the product is named after it. Stored with Haddock; worth a physical re-read.",
  },
  "050000543298": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Soy Flour, Sardines, Modified Corn Starch, Kale, Fish, Artificial And Natural Flavors, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.5, 1.0, 78.0, 2.5, 0.05), 981, 152),
    verifiedAt: VERIFIED_007,
  },

  // ── Friskies · Shreds (continued) ──────────────────────────────────────
  "050000579907": {
    // Deck F612722 is an all-life-stages formula — AAFCO growth of kittens AND
    // maintenance of adult cats. Nothing here can hold that yet; see the note
    // beside this product in data/known-products.ts.
    ingredients: `Water, Meat By-Products, Turkey, Wheat Gluten, Chicken, Modified Corn Starch, Soy Flour, Ocean Whitefish, Sardines, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05), 837, 130),
    verifiedAt: VERIFIED_007,
  },
  "050000579921": {
    ingredients: `Water, Turkey, Meat By-Products, Wheat Gluten, Chicken, Modified Corn Starch, Soy Flour, Poultry Giblets, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(9.0, 2.5, 1.0, 82.0, 2.5, 0.05), 824, 128),
    verifiedAt: VERIFIED_007,
    conflict:
      "Older retailer copies of this list carry Added Color. The current deck G612622 has no artificial colours and no artificial preservatives.",
  },

  // ── Fancy Feast · Medleys · Florentine ─────────────────────────────────
  //
  // All four carry Added Color, and two of them Red 3, against a Purina page
  // that says no artificial colors. Kept: see each conflict note. This is the
  // one kind of disagreement where deleting is the dangerous direction, since
  // an artificial colour removed in error is a warning the reader never sees.
  "050000570188": {
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Meat By-Products, Liver, Turkey, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Added Color, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 3.0, 0.05), 877, 74),
    verifiedAt: VERIFIED_008,
    conflict: "Deck E670022 lists Added Color, and Purina's current product page for this barcode says no artificial colors. Both cannot describe the same tin. The deck is stored as it reads — deleting a colour because marketing copy disagrees would hide the one thing a reader would want to know if the deck is the current one — and this needs a physical can to settle. A reader holding the new formula can say so with the mismatch button.",
  },
  "050000570348": {
    ingredients: `Poultry Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Added Color, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 3.0, 0.05), 859, 73),
    verifiedAt: VERIFIED_008,
    conflict: "Deck E670322 lists Added Color, and Purina's current product page for this barcode says no artificial colors. Both cannot describe the same tin. The deck is stored as it reads — deleting a colour because marketing copy disagrees would hide the one thing a reader would want to know if the deck is the current one — and this needs a physical can to settle. A reader holding the new formula can say so with the mismatch button.",
  },
  "050000572199": {
    // Red 3 sits AFTER the vitamin block here and BEFORE it on the salmon.
    // Two decks, two orderings, copied as each prints it.
    ingredients: `Fish Broth, Tuna, Wheat Gluten, Meat By-Products, Liver, Chicken, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Added Color, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, ${V_MEDLEYS}, Red 3.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 3.0, 0.05), 828, 70),
    verifiedAt: VERIFIED_008,
    conflict: "Deck F670222 lists Added Color and Red 3, and Purina's current product page for this barcode says no artificial colors. Both cannot describe the same tin. The deck is stored as it reads — deleting a colour because marketing copy disagrees would hide the one thing a reader would want to know if the deck is the current one — and this needs a physical can to settle. A reader holding the new formula can say so with the mismatch button.",
  },
  "050000570492": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Meat By-Products, Liver, Chicken, Modified Corn Starch, Spinach, Soy Flour, Glycine, Added Color, Natural Flavor, Salt, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, Red 3, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(11.0, 1.5, 1.5, 80.0, 3.0, 0.05), 855, 72),
    verifiedAt: VERIFIED_008,
    conflict: "Deck E670122 lists Added Color and Red 3, and Purina's current product page for this barcode says no artificial colors. Both cannot describe the same tin. The deck is stored as it reads — deleting a colour because marketing copy disagrees would hide the one thing a reader would want to know if the deck is the current one — and this needs a physical can to settle. A reader holding the new formula can say so with the mismatch button.",
  },

  // ── Fancy Feast · Medleys · Tuscany ────────────────────────────────────
  //
  // No colours on any of these three, and no disagreement about them.
  // Dicalcium phosphate on the chicken where its two siblings use tricalcium —
  // a different salt, not a spelling, and copied as printed.
  "050000573660": {
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Long Grain Rice, Meat By-Products, Liver, Modified Corn Starch, Spinach, Turkey, Soy Flour, Glycine, Salt, Dicalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(9.0, 1.5, 1.5, 82.0, 3.5, 0.05), 760, 64),
    verifiedAt: VERIFIED_008,
  },
  "050000573646": {
    ingredients: `Poultry Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Long Grain Rice, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Corn Oil, Tricalcium Phosphate, Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 837, 71),
    verifiedAt: VERIFIED_008,
  },
  "050000573622": {
    ingredients: `Fish Broth, Tuna, Wheat Gluten, Long Grain Rice, Chicken, Meat By-Products, Liver, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Corn Oil, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Choline Chloride, Taurine, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 767, 65),
    verifiedAt: VERIFIED_008,
  },

  // ── Fancy Feast · Medleys · Primavera ──────────────────────────────────
  "050000574582": {
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Meat By-Products, Liver, Tomatoes, Carrots, Turkey, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 791, 67),
    verifiedAt: VERIFIED_008,
  },
  "050000574605": {
    ingredients: `Fish Broth, Tuna, Wheat Gluten, Tomatoes, Chicken, Carrots, Meat By-Products, Liver, Modified Corn Starch, Spinach, Soy Flour, Glycine, Corn Oil, Salt, Natural Flavor, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 788, 67),
    verifiedAt: VERIFIED_008,
  },
  "050000574520": {
    ingredients: `Poultry Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Tomatoes, Carrots, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Natural Flavor, Corn Oil, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Choline Chloride, Taurine, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 795, 67),
    verifiedAt: VERIFIED_008,
  },

  // ── Fancy Feast · Gourmet Naturals ─────────────────────────────────────
  //
  // Short lists by the standards of this file — the range sells itself on that
  // — and the two in-gravy recipes are the ones that pick up xanthan gum and
  // carrageenan, exactly as `impliesThickener` would predict.
  "050000502585": {
    // Kitten. 0.07% taurine like the other two kitten decks, and a calcium
    // minimum of 0.3% that is again NOT stored: `GuaranteedAnalysis` has no
    // calcium field, and adding one means changing the type here and in the
    // consumer app together, since the consumer drops keys it does not know
    // when it reads a stored panel back. Third pack to state one.
    ingredients: `Salmon, Chicken, Liver, Fish Broth, Fish, Milk, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Choline Chloride, Taurine, ${V_E_FIRST_A_MID}, Salt.`,
    analysis: withCalories(ga(11.0, 5.0, 1.5, 78.0, 3.5, 0.07), 1143, 97),
    verifiedAt: VERIFIED_009,
    conflict: "Also guarantees Calcium (min) 0.3%, which is not stored — there is no field for it yet.",
  },
  "050000172108": {
    ingredients: `Salmon, Chicken, Liver, Fish Broth, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(10.0, 5.0, 1.5, 78.0, 3.5, 0.05), 1145, 97),
    verifiedAt: VERIFIED_009,
  },
  "050000172832": {
    ingredients: `Chicken Broth, Chicken, Liver, Wheat Gluten, Natural Flavors, Turkey, Canola Oil, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Xanthan Gum, Salt, Carrageenan, Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 82.0, 2.5, 0.05), 779, 66),
    verifiedAt: VERIFIED_009,
  },
  "050000172146": {
    ingredients: `Beef, Meat Broth, Liver, Chicken, Fish, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(9.0, 5.0, 1.5, 78.0, 3.5, 0.05), 1168, 99),
    verifiedAt: VERIFIED_009,
  },
  "050000172085": {
    ingredients: `Chicken, Chicken Broth, Liver, Turkey, Fish, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Choline Chloride, Taurine, ${V}, Salt.`,
    analysis: withCalories(ga(9.0, 5.0, 1.5, 78.0, 3.8, 0.05), 1134, 96),
    verifiedAt: VERIFIED_009,
  },
  "050000172122": {
    ingredients: `Trout, Chicken, Fish Broth, Liver, Tuna, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(10.0, 5.0, 1.5, 78.0, 3.5, 0.05), 1171, 99),
    verifiedAt: VERIFIED_009,
  },
  "050000172887": {
    ingredients: `Meat Broth, Beef, Wheat Gluten, Liver, Natural Flavors, Turkey, Fish, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Xanthan Gum, Carrageenan, Salt, Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 82.0, 2.8, 0.05), 744, 63),
    verifiedAt: VERIFIED_009,
  },
  "050000172856": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Liver, Chicken, Shrimp, Natural Flavors, Canola Oil, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Xanthan Gum, Salt, Carrageenan, Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 82.0, 2.5, 0.05), 777, 66),
    verifiedAt: VERIFIED_009,
  },
  "050000502677": {
    ingredients: `Ocean Whitefish, Chicken, Liver, Fish Broth, Natural Flavors, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Guar Gum, Choline Chloride, Taurine, ${V}, Salt.`,
    analysis: withCalories(ga(10.0, 5.0, 1.5, 78.0, 3.5, 0.05), 1157, 98),
    verifiedAt: VERIFIED_009,
  },
  "050000502622": {
    // Vegetable Oil stays. Purina's HTML list for this barcode does not show
    // it and deck B653921 does; everything else about the two sequences lines
    // up. An oil is a real ingredient with a real place in the order, so this
    // is a reformulation or a rendering fault, not a spelling.
    ingredients: `Chicken Broth, Chicken, Liver, Wheat Gluten, Beef, Natural Flavors, Vegetable Oil, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Xanthan Gum, Carrageenan, Taurine, Choline Chloride, ${V}, Salt.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 82.0, 2.5, 0.05), 784, 66),
    verifiedAt: VERIFIED_009,
    conflict:
      "Deck B653921 lists Vegetable Oil where Purina's current HTML list for this barcode does not. The rest of the sequence agrees, so this is one ingredient added or removed rather than two different lists. The deck is stored; worth a physical re-read.",
  },

  // ── Fancy Feast · Medleys (continued) ──────────────────────────────────
  //
  // Milanese and Carne Asada both print 811 kcal/kg on the same 3 oz can and
  // then state 69 and 68 kcal/can. 811 x 85.05 g is 68.97, so Purina rounded
  // one and truncated the other. Both are copied as printed: a figure on a
  // label is a fact about that label even when its sibling disagrees.
  "050000659951": {
    ingredients: `Beef Broth, Beef, Wheat Gluten, Liver, Tomatoes, Meat By-Products, Pasta, Modified Corn Starch, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.5, 0.05), 813, 69),
    verifiedAt: VERIFIED_010,
  },
  "050000660018": {
    // Whole Milk, eleventh. The only Medleys deck that carries dairy.
    ingredients: `Beef And Pork Broth, Beef, Liver, Wheat Gluten, Potatoes, Meat By-Products, Carrots, Modified Corn Starch, Pork, Soy Flour, Whole Milk, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.5, 0.05), 811, 69),
    verifiedAt: VERIFIED_010,
  },
  "050000191024": {
    // Pork, from the first ingredient down. Target files this as "Barbacoa
    // Beef Flavor"; there is no beef anywhere in the deck.
    ingredients: `Pork Broth, Pork, Wheat Gluten, Liver, Meat By-Products, Rice, Tomatoes, Carrots, Modified Corn Starch, Soy Flour, Salt, Glycine, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 820, 69),
    verifiedAt: VERIFIED_010,
    conflict:
      "Target's metadata calls this barcode \u201cBarbacoa Beef Flavor\u201d. Deck A648523 and Purina's own description say Pork Barbacoa, and the list leads with pork broth and pork with no beef anywhere in it. Stored as pork. Not a formula disagreement — a retailer naming the wrong animal, which matters to somebody avoiding one.",
  },
  "050000186341": {
    ingredients: `Beef Broth, Beef, Wheat Gluten, Liver, Meat By-Products, Potatoes, Carrots, Modified Corn Starch, Soy Flour, Salt, Glycine, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.0, 0.05), 811, 68),
    verifiedAt: VERIFIED_010,
  },

  // ── Friskies · Fully Load'd ────────────────────────────────────────────
  //
  // The named flavour is eighth on all three, after water, chicken, wheat
  // gluten, meat by-products, liver, soy flour and modified corn starch. The
  // first seven are identical across the range; what makes a Fully Load'd tin
  // tuna rather than salmon is one line eight positions down.
  "050000239726": {
    ingredients: `Water, Chicken, Wheat Gluten, Meat By-Products, Liver, Soy Flour, Modified Corn Starch, Carrots, Tomatoes, Spinach, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 958, 149),
    verifiedAt: VERIFIED_010,
  },
  "050000236091": {
    ingredients: `Water, Chicken, Wheat Gluten, Meat By-Products, Liver, Soy Flour, Modified Corn Starch, Tuna, Rice, Spinach, Tomatoes, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 958, 149),
    verifiedAt: VERIFIED_010,
    conflict:
      "Some retailer copies of this list omit Wheat Gluten near the front. Deck A508025 has it third, and third is a lot of the tin. Stored with it.",
  },
  "050000241200": {
    ingredients: `Water, Chicken, Wheat Gluten, Meat By-Products, Liver, Soy Flour, Modified Corn Starch, Salmon, Wild Rice, Carrots, Spinach, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Choline Chloride, Taurine, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.5, 1.0, 79.0, 2.5, 0.05), 937, 146),
    verifiedAt: VERIFIED_010,
    conflict:
      "Two calorie statements for this barcode: deck A507925 says 937 kcal/kg and 146 kcal/can, older Purina and retailer pages say 958 and 149. Both pairs check out against a 5.5 oz can (146.1 and 149.4), so this is a reformulation rather than a typo — the same pattern as Country Style Dinner. The deck's figures are stored.",
  },

  // ── Friskies · Glaz'd & Infuz'd ────────────────────────────────────────
  //
  // Caramel Color on all three, and two gums — xanthan and locust bean. The
  // crab and the shrimp share a deck almost exactly: the same eighteen
  // entries in the same order, differing only in which shellfish sits eighth.
  "050000351428": {
    ingredients: `Water, Chicken, Meat By-Products, Wheat Gluten, Carrots, Soy Flour, Spinach, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Xanthan Gum, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Caramel Color, Locust Bean Gum, Taurine, Choline Chloride, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.5, 0.05), 831, 129),
    verifiedAt: VERIFIED_010,
  },
  "050000348053": {
    ingredients: `Water, Meat By-Products, Chicken, Tomatoes, Wheat Gluten, Carrots, Soy Flour, Crab, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Xanthan Gum, Caramel Color, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Locust Bean Gum, Taurine, Choline Chloride, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.5, 0.05), 815, 127),
    verifiedAt: VERIFIED_010,
  },
  "050000342143": {
    ingredients: `Water, Meat By-Products, Chicken, Tomatoes, Wheat Gluten, Carrots, Soy Flour, Shrimp, Modified Corn Starch, Artificial And Natural Flavors, Tricalcium Phosphate, Xanthan Gum, Caramel Color, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Locust Bean Gum, Taurine, Choline Chloride, Salt, ${V_PATE_SHORT}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 2.5, 0.05), 822, 128),
    verifiedAt: VERIFIED_010,
  },

  // ── Fancy Feast · Medleys · Shredded Fare ──────────────────────────────
  //
  // 14% minimum protein on all four — the highest in the file, and still well
  // inside the as-fed sanity check, which is what that check is for.
  "050000570515": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Meat By-Products, Liver, Modified Corn Starch, Chicken, Spinach, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(14.0, 2.0, 1.5, 78.0, 3.0, 0.05), 1018, 86),
    verifiedAt: VERIFIED_011,
  },
  "050000570195": {
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Meat By-Products, Liver, Modified Corn Starch, Turkey, Spinach, Soy Flour, Glycine, Salt, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Tricalcium Phosphate, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(14.0, 2.0, 1.5, 78.0, 3.0, 0.05), 1035, 88),
    verifiedAt: VERIFIED_011,
  },
  "050000570386": {
    ingredients: `Poultry Broth, Turkey, Wheat Gluten, Meat By-Products, Liver, Modified Corn Starch, Spinach, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(14.0, 2.0, 1.5, 78.0, 3.0, 0.05), 1022, 86),
    verifiedAt: VERIFIED_011,
  },
  "050000570584": {
    ingredients: `Fish Broth, Tuna, Wheat Gluten, Meat By-Products, Liver, Modified Corn Starch, Chicken, Spinach, Soy Flour, Glycine, Tricalcium Phosphate, Salt, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(14.0, 1.5, 1.5, 78.0, 3.0, 0.05), 978, 83),
    verifiedAt: VERIFIED_011,
  },

  // ── Fancy Feast · Medleys · Paté ───────────────────────────────────────
  "050000962600": {
    ingredients: `Chicken, Chicken Broth, Meat By-Products, Liver, Ocean Whitefish, Cheese, Spinach, Artificial And Natural Flavors, Sodium Caseinate, Vegetable Oil, Modified Vegetable Starch, Corn Starch, Guar Gum, Salt, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Dried Whey, Tricalcium Phosphate, Choline Chloride, Taurine, Non-Fat Milk, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.5, 5.0, 1.5, 78.0, 3.0, 0.05), 1135, 96),
    verifiedAt: VERIFIED_011,
    conflict:
      "Deck C670521 says \u201cVegetable Oil\u201d; Purina's current online presentation may name the oil more specifically. The deck's wording is stored — a more specific name is a different ingredient claim, and inventing one to match a webpage would be writing the label.",
  },
  "050000962648": {
    // The PATÉ. Its silky-broth namesake is 050000574582 and the two lists are
    // nothing alike: that one leads with poultry broth and carries wheat
    // gluten, this one leads with chicken and carries none.
    ingredients: `Chicken, Meat By-Products, Liver, Chicken Broth, Fish, Tomatoes, Carrots, Spinach, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Choline Chloride, Salt, Taurine, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 5.0, 1.5, 78.0, 3.0, 0.05), 1119, 95),
    verifiedAt: VERIFIED_011,
  },
  "050000962662": {
    ingredients: `Salmon, Meat By-Products, Liver, Turkey, Fish Broth, Fish, Tomatoes, Carrots, Spinach, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Salt, Taurine, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.5, 4.0, 1.5, 78.0, 3.0, 0.05), 1037, 88),
    verifiedAt: VERIFIED_011,
  },

  // ── Fancy Feast · Medleys · French sauces ──────────────────────────────
  //
  // Added Color on all three and Red 3 on two of them, stated by the deck
  // without a webpage contradicting it — so unlike the four Florentines these
  // carry no conflict note. They are simply coloured foods, which is a fact the
  // report should say and a reason somebody might put the tin back.
  "050000503285": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Carrots, Liver, Meat By-Products, Chicken, Ocean Whitefish, Modified Corn Starch, Spinach, Glycine, Added Color, Salt, Corn Oil, Milk, Soy Protein Concentrate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, Red 3, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 3.5, 0.05), 746, 63),
    verifiedAt: VERIFIED_011,
  },
  "050000503339": {
    // Red 3 AFTER the vitamin block here and before it on the salmon above —
    // the same split the Florentine decks show. Copied as each prints it.
    ingredients: `Fish Broth, Ocean Whitefish, Wheat Gluten, Carrots, Liver, Meat By-Products, Chicken, Modified Corn Starch, Spinach, Glycine, Corn Oil, Salt, Cheese, Added Color, Milk, Soy Protein Concentrate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Taurine, Choline Chloride, ${V_MEDLEYS}, Red 3.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 3.5, 0.05), 723, 61),
    verifiedAt: VERIFIED_011,
  },
  "050000503315": {
    // Added Color, no Red 3. The one of the three that does not name its dye.
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Carrots, Liver, Meat By-Products, Turkey, Modified Corn Starch, Spinach, Glycine, Salt, Added Color, Soy Protein Concentrate, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Choline Chloride, Taurine, ${V_MEDLEYS}.`,
    analysis: withCalories(ga(10.0, 2.0, 1.5, 82.0, 3.5, 0.05), 768, 65),
    verifiedAt: VERIFIED_011,
  },

  // ── Fancy Feast · Gravy Lovers (continued) ─────────────────────────────
  //
  // "Corn Starch-Modified" here, where most of the file says "Modified Corn
  // Starch". Same thing, the range's own word order, copied.
  "050000292639": {
    ingredients: `Chicken And Beef Broth, Chicken, Wheat Gluten, Liver, Meat By-Products, Beef, Corn Starch-Modified, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05), 795, 67),
    verifiedAt: VERIFIED_012,
    conflict:
      "Purina's current web presentation splits this into \u201cChicken Broth\u201d and \u201cBeef Broth\u201d where deck C702522 says \u201cChicken and Beef Broth\u201d, and writes the mineral block differently. The deck is stored. One combined broth and two separate ones are not the same claim about what is in the tin.",
  },
  "050000292615": {
    // Chicken Hearts and Chicken Liver as named organs, ahead of the generic
    // meat by-products. That ordering is the product.
    ingredients: `Chicken Broth, Chicken, Wheat Gluten, Chicken Hearts, Chicken Liver, Corn Starch-Modified, Meat By-Products, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05), 792, 67),
    verifiedAt: VERIFIED_012,
    conflict: "Purina's current web presentation of this barcode differs from deck C702622 in small ways, including how the mineral block is written. The deck is stored. Recorded rather than ignored because \u201csmall\u201d is a judgement, and the next person to compare the two should know somebody already did.",
  },
  "050000292592": {
    ingredients: `Fish Broth, Salmon, Wheat Gluten, Meat By-Products, Liver, Chicken, Corn Starch-Modified, Sole, Soy Flour, Glycine, Salt, Tricalcium Phosphate, Vegetable Oil, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(9.0, 2.0, 1.5, 82.0, 3.0, 0.05), 770, 65),
    verifiedAt: VERIFIED_012,
    conflict:
      "Purina's current web display and deck D702722 name two ingredients differently: \u201cVegetable Glycerin\u201d against \u201cVegetable Oil\u201d, and \u201cMagnesium Sulfate\u201d against \u201cMagnesium Proteinate\u201d. Neither pair is a spelling — glycerin is a humectant and oil is a fat, and a proteinate is a chelated mineral where a sulfate is not. The deck is stored.",
  },

  // ── Fancy Feast · Marinated Morsels ────────────────────────────────────
  //
  // Added Color on all five, Red 3 named on two, and no source contradicting
  // any of it — so no conflict notes. Three of the five write their mineral
  // block with copper before manganese, which is a fourth mineral ordering.
  "050000259007": {
    ingredients: `Poultry Broth, Chicken, Liver, Wheat Gluten, Turkey, Meat By-Products, Corn Starch-Modified, Artificial And Natural Flavors, Added Color, Soy Flour, Salt, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 3.0, 0.05), 944, 80),
    verifiedAt: VERIFIED_012,
  },
  "050000235100": {
    ingredients: `Meat Broth, Meat By-Products, Beef, Wheat Gluten, Fish, Corn Starch-Modified, Artificial And Natural Flavors, Soy Flour, Added Color, Salt, Tricalcium Phosphate, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.7, 0.05), 962, 82),
    verifiedAt: VERIFIED_012,
  },
  "050000513338": {
    // 0.07% taurine on an all-life-stages deck, not a kitten one. The higher
    // guarantee is not exclusively a kitten thing, which is worth knowing
    // before anybody reads 0.07 as a life stage.
    ingredients: `Fish Broth, Meat By-Products, Salmon, Wheat Gluten, Chicken, Corn Starch-Modified, Artificial And Natural Flavors, Added Color, Soy Flour, Tricalcium Phosphate, Salt, Taurine, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide], Red 3, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 3.0, 0.07), 924, 79),
    verifiedAt: VERIFIED_012,
  },
  "050000397983": {
    // Red 3 after the vitamin block; the salmon above puts it before. Copied.
    ingredients: `Fish Broth, Tuna, Meat By-Products, Wheat Gluten, Chicken, Corn Starch-Modified, Artificial And Natural Flavors, Added Color, Soy Flour, Tricalcium Phosphate, Salt, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}, Red 3.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 3.0, 0.05), 899, 76),
    verifiedAt: VERIFIED_012,
  },
  "050000405398": {
    ingredients: `Poultry Broth, Turkey, Liver, Wheat Gluten, Meat By-Products, Corn Starch-Modified, Artificial And Natural Flavors, Soy Flour, Added Color, Tricalcium Phosphate, Salt, Minerals [Potassium Chloride, Magnesium Sulfate, Zinc Sulfate, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.7, 0.05), 955, 81),
    verifiedAt: VERIFIED_012,
  },

  // ── Fancy Feast · Sliced ───────────────────────────────────────────────
  "050000434640": {
    // "Chicken Livers" plural AND a generic "Liver" on the same deck, in that
    // order. Two entries, not one written twice.
    ingredients: `Poultry Broth, Chicken, Wheat Gluten, Chicken Hearts, Chicken Livers, Liver, Soy Flour, Meat By-Products, Corn Starch-Modified, Salt, Glycine, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.7, 0.05), 960, 81),
    verifiedAt: VERIFIED_012,
    conflict: "Purina's current web presentation of this barcode differs from deck E700322 in small ways, including how the mineral block is written. The deck is stored. Recorded rather than ignored because \u201csmall\u201d is a judgement, and the next person to compare the two should know somebody already did.",
  },
  "050000426348": {
    ingredients: `Meat Broth, Beef, Liver, Wheat Gluten, Meat By-Products, Corn Starch-Modified, Fish, Poultry, Soy Flour, Soy Protein Concentrate, Artificial And Natural Flavors, Salt, Added Color, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V_SHORT}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.5, 0.05), 933, 79),
    verifiedAt: VERIFIED_012,
  },
};
