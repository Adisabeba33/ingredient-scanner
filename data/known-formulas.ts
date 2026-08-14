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

/** Promoted from research/deep-research-barcodes.json, batch 013. */
const VERIFIED_013 = "2026-08-13";

/** Promoted from the research ledger, batch 014. */
const VERIFIED_014 = "2026-08-13";
const VERIFIED_015 = "2026-08-14";
const VERIFIED_016 = "2026-08-14";
const VERIFIED_017 = "2026-08-14";
const VERIFIED_018 = "2026-08-14";

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
  /**
   * Null where the deck states no CRUDE fibre maximum.
   *
   * Friskies Party Pack'd prints a Dietary Fiber maximum instead, which is a
   * different measurement — dietary fibre counts soluble fractions that the
   * crude method burns off, and its 12.5% is not comparable to the 2-3% crude
   * figure beside it on every other bag. Copying it into this field would put
   * a number here that reads five times worse than the food is.
   */
  crudeFiberMax: number | null,
  moistureMax: number,
  /**
   * Null where the deck states no ash guarantee.
   *
   * Every Purina deck prints one, so this was `number` for fourteen batches.
   * No Hill's deck prints one at all — not on any of the twenty in batch 015 —
   * and that is a real difference between the two makers rather than a gap in
   * the research.
   *
   * The cost is visible to the reader and worth knowing: carbohydrate is
   * derived by difference and needs all five figures, so a Hill's product shows
   * no carbohydrate row. The consumer app already refuses to guess it. Writing
   * a plausible ash here to make the row appear would be inventing the one
   * figure the calculation rests on.
   */
  ashMax: number | null,
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
  /**
   * Null where the deck prints only a per-serving figure.
   *
   * Two Hill's decks in batch 016 do this. It would be easy to back one out —
   * 173 kcal/can ÷ 0.156 kg is about 1109 — and wrong: the division amplifies
   * the label's own rounding into a figure precise to four digits that nobody
   * printed, and every dry-matter comparison drawn from it would carry that
   * invention silently.
   */
  kcalPerKg: number | null,
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

/**
 * A twelfth: `V_PLAIN`'s bare names, except that menadione keeps its
 * "(Vitamin K)".
 *
 * One entry different out of twelve, which is exactly the margin these
 * constants exist to protect. Found by `scripts/match-vitamins.mjs` — the
 * hand-written comparison it replaced named `V_MEDLEYS` at five differences,
 * because a regex had silently swallowed `V_PLAIN` and compared against eleven
 * constants while reporting twelve.
 */
const V_PLAIN_K =
  "Vitamins [Thiamine Mononitrate, Vitamin E Supplement, Niacin, Calcium Pantothenate, Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Pyridoxine Hydrochloride, Riboflavin Supplement, Vitamin B-12 Supplement, Biotin, Folic Acid, Vitamin D-3 Supplement]";

/**
 * A thirteenth: the Fish & Shrimp ordering, and the only one that opens E,
 * niacin, A before reaching thiamine.
 *
 * Eight of twelve entries away from its nearest neighbour, which is the widest
 * gap any new block has had — this is a genuinely different sequence rather
 * than a notation difference. Found with `scripts/match-vitamins.mjs`.
 *
 * The deck it comes from is unusual all through: seven ingredients before the
 * vitamins, no potassium chloride at all, and iron as ferric pyrophosphate
 * rather than the ferrous sulfate every other deck here uses.
 */
const V_FLAKED_FISH =
  "Vitamins [Vitamin E Supplement, Niacin, Vitamin A Supplement, Thiamine Mononitrate, Calcium Pantothenate, Pyridoxine Hydrochloride, Riboflavin Supplement, Biotin, Vitamin B-12 Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Folic Acid, Vitamin D-3 Supplement]";

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

  // ── Fancy Feast · Creamy Delights ──────────────────────────────────────
  //
  // Both decks run their minerals and vitamins INLINE rather than bracketed,
  // interleaved with everything else — potassium chloride between taurine and
  // magnesium sulfate, potassium iodide last of all, after Vitamin D-3. Copied
  // in that order. Grouping them into brackets to match the rest of the file
  // would be rewriting the label into a house style it does not use.
  "050000168248": {
    ingredients:
      "Poultry Broth, Chicken, Liver, Wheat Gluten, Meat By-Products, Corn Starch-Modified, Milk, Artificial And Natural Flavors, Salt, Added Color, Tricalcium Phosphate, Soy Protein Concentrate, Potassium Chloride, Taurine, Magnesium Sulfate, Mono And Dicalcium Phosphate, Choline Chloride, Thiamine Mononitrate, Vitamin E Supplement, Zinc Sulfate, Ferrous Sulfate, Niacin, Calcium Pantothenate, Vitamin A Supplement, Copper Sulfate, Menadione Sodium Bisulfite Complex (Vitamin K), Manganese Sulfate, Pyridoxine Hydrochloride, Riboflavin Supplement, Vitamin B-12 Supplement, Biotin, Folic Acid, Vitamin D-3 Supplement, Potassium Iodide.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 3.0, 0.05), 951, 81),
    verifiedAt: VERIFIED_013,
  },
  "050000168262": {
    ingredients:
      "Fish Broth, Tuna, Wheat Gluten, Liver, Chicken, Meat By-Products, Corn Starch-Modified, Milk, Artificial And Natural Flavors, Salt, Tricalcium Phosphate, Added Color, Soy Protein Concentrate, Potassium Chloride, Taurine, Choline Chloride, Magnesium Sulfate, Mono And Dicalcium Phosphate, Red 3, Thiamine Mononitrate, Vitamin E Supplement, Zinc Sulfate, Ferrous Sulfate, Niacin, Calcium Pantothenate, Vitamin A Supplement, Menadione Sodium Bisulfite Complex (Vitamin K), Copper Sulfate, Manganese Sulfate, Pyridoxine Hydrochloride, Riboflavin Supplement, Vitamin B-12 Supplement, Biotin, Folic Acid, Vitamin D-3 Supplement, Potassium Iodide.",
    analysis: withCalories(ga(11.0, 2.0, 1.5, 80.0, 3.0, 0.05), 915, 78),
    verifiedAt: VERIFIED_013,
  },

  // ── Friskies · Indoor ──────────────────────────────────────────────────
  //
  // Powdered Cellulose sixth or seventh on all four — an insoluble fibre added
  // for hairball control, and the reason these panels guarantee 2.4 to 2.75%
  // maximum fibre where the rest of the file runs 1 to 1.5. That is the range
  // doing what it says rather than a filler nobody mentioned.
  //
  // Three of the four supersede an older deck; see each note.
  "050000574001": {
    // DL-Methionine, and the only deck in the file to carry it. Also the lowest
    // protein guarantee here at 7% — an indoor formula, deliberately leaner.
    ingredients: `Water, Chicken, Liver, Meat By-Products, Rice, Powdered Cellulose, Spinach, Rice Flour, Artificial And Natural Flavors, Tricalcium Phosphate, Guar Gum, Added Color, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Carrageenan, Salt, Taurine, Choline Chloride, DL-Methionine, ${V_PLAIN_K}.`,
    analysis: withCalories(ga(7.0, 3.0, 2.4, 78.0, 3.3, 0.05), 950, 148),
    verifiedAt: VERIFIED_013,
  },
  "050000573950": {
    ingredients: `Water, Chicken, Wheat Gluten, Meat By-Products, Liver, Rice, Powdered Cellulose, Corn Starch-Modified, Turkey, Spinach, Artificial And Natural Flavors, Soy Flour, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(9.0, 2.0, 2.75, 78.0, 2.5, 0.05), 896, 139),
    verifiedAt: VERIFIED_013,
    conflict: "Purina's own earlier deck H608118 is a superseded formula for this barcode: added color and xanthan gum, 2.3% maximum fibre, and 887 kcal/kg against the current 896. The September 2024 deck I608123 that Purina's live page now links is stored here. Two dated decks from one maker are a sequence rather than a contradiction — rule 1 in docs/CATALOG-CONFLICTS.md — so this needs no physical pack.",
  },
  "050000574100": {
    ingredients: `Water, Ocean Fish, Chicken, Wheat Gluten, Rice, Meat By-Products, Liver, Powdered Cellulose, Corn Starch-Modified, Spinach, Artificial And Natural Flavors, Soy Flour, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V_PATE}.`,
    analysis: withCalories(ga(9.0, 2.0, 2.7, 78.0, 2.5, 0.05), 848, 132),
    verifiedAt: VERIFIED_013,
    conflict: "Purina's own earlier deck I608718 is a superseded formula for this barcode: added color and Red 3, 2.3% maximum fibre, and 850 kcal/kg against the current 848. The September 2024 deck J608723 that Purina's live page now links is stored here. Two dated decks from one maker are a sequence rather than a contradiction — rule 1 in docs/CATALOG-CONFLICTS.md — so this needs no physical pack.",
  },
  "050000574124": {
    ingredients: `Water, Ocean Whitefish, Wheat Gluten, Poultry, Rice, Powdered Cellulose, Corn Starch-Modified, Meat By-Products, Liver, Spinach, Artificial And Natural Flavors, Soy Flour, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V_PATE}.`,
    analysis: withCalories(ga(9.0, 2.0, 2.6, 78.0, 2.5, 0.05), 853, 133),
    verifiedAt: VERIFIED_013,
    conflict: "Purina's own earlier deck I608318 is a superseded formula for this barcode: added color and Red 3, spinach placed before the meat by-products and liver, and 2.2% maximum fibre. The September 2024 deck J608323 that Purina's live page now links is stored here. Two dated decks from one maker are a sequence rather than a contradiction — rule 1 in docs/CATALOG-CONFLICTS.md — so this needs no physical pack.",
  },

  // ── Friskies · Extra Gravy (continued) ─────────────────────────────────
  "050000293339": {
    ingredients: `Water, Poultry, Liver, Meat By-Products, Wheat Gluten, Salmon, Soy Flour, Corn Starch-Modified, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(9.0, 2.5, 1.0, 82.0, 3.0, 0.05), 815, 127),
    verifiedAt: VERIFIED_013,
  },
  "050000293292": {
    ingredients: `Water, Chicken, Liver, Meat By-Products, Wheat Gluten, Turkey, Soy Flour, Corn Starch-Modified, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Salt, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(9.0, 2.5, 1.0, 82.0, 3.0, 0.05), 818, 127),
    verifiedAt: VERIFIED_013,
    conflict: "Purina's own earlier deck B626618 is a superseded formula for this barcode: a list beginning Water, Liver, Meat By-Products, Chicken, plus poultry and added color, at 822 kcal/kg against the current 818. The September 2024 deck C626622 that Purina's live page now links is stored here. Two dated decks from one maker are a sequence rather than a contradiction — rule 1 in docs/CATALOG-CONFLICTS.md — so this needs no physical pack.",
  },
  "050000293353": {
    ingredients: `Water, Turkey, Liver, Meat By-Products, Wheat Gluten, Chicken, Soy Flour, Corn Starch-Modified, Artificial And Natural Flavors, Tricalcium Phosphate, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(9.0, 2.5, 1.0, 82.0, 3.0, 0.05), 808, 125),
    verifiedAt: VERIFIED_013,
    conflict:
      "Target's live page still shows an older panel for this barcode carrying added color and mono/dicalcium phosphate. Purina's live page says no artificial colours and links deck C626822, which has neither; the deck is stored. A retailer's copy against the maker's current deck — rule 1 — so no pack is needed.",
  },

  // ── Friskies · Tasty Treasures (continued) ─────────────────────────────
  "050000582334": {
    ingredients: `Water, Liver, Meat By-Products, Poultry By-Products, Fish, Turkey, Chicken, Rice, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Tricalcium Phosphate, Carrageenan, Salt, Taurine, Choline Chloride, ${V_PATE}.`,
    analysis: withCalories(ga(10.0, 5.0, 1.0, 78.0, 3.5, 0.05), 1046, 163),
    verifiedAt: VERIFIED_013,
    conflict:
      "Purina's site routes deck B627823 from a differently named Tasty Treasures page. The deck itself is unambiguous — \u201cWith Turkey and Chicken\u201d — and a Kroger single-can page independently matches that identity and the paté format. Stored on the deck's own wording. A navigation fault on a website is not evidence about a tin.",
  },

  // ── Fancy Feast · Flaked (continued) ───────────────────────────────────
  //
  // 14% minimum protein at 74% moisture on three of the four — the densest wet
  // panels in the file. Nothing wrong with them; flaked fish in broth simply
  // carries less water than a pâté.
  "050000427949": {
    ingredients: `Poultry Broth, Fish, Chicken, Tuna, Wheat Gluten, Liver, Meat By-Products, Turkey, Soy Flour, Glycine, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Tricalcium Phosphate, Xanthan Gum, Salt, Choline Chloride, Carrageenan, Taurine, ${V}.`,
    analysis: withCalories(ga(14.0, 3.5, 1.5, 74.0, 3.5, 0.05), 1210, 102),
    verifiedAt: VERIFIED_014,
    conflict:
      "Target's label data prints 78% maximum moisture where the current Purina-linked deck D690021 prints 74%. Four points of water is not a rounding — it moves every dry-matter figure the app derives — so the deck is stored and the difference is named.",
  },
  "050000428748": {
    // The shortest deck in the seed. No potassium chloride anywhere, and the
    // iron is ferric pyrophosphate rather than ferrous sulfate: a different
    // salt, copied as printed.
    ingredients: `Ocean Fish, Fish Broth, Shrimp, Vegetable Oil, Tricalcium Phosphate, Guar Gum, Choline Chloride, ${V_FLAKED_FISH}, Minerals [Ferric Pyrophosphate, Zinc Sulfate, Copper Sulfate, Manganese Sulfate, Potassium Iodide].`,
    analysis: withCalories(ga(15.0, 2.0, 1.5, 78.0, 3.0, 0.05), 985, 83),
    verifiedAt: VERIFIED_014,
    conflict:
      "Purina's live ingredient widget says \u201cvegetable glycerin\u201d where the official PDF it links — deck D690120 — and Target's panel for the same deck both say \u201cvegetable oil\u201d. Glycerin is a humectant and oil is a fat. The linked deck is stored. The same widget-versus-deck fault appeared on Gravy Lovers Salmon & Sole, so it is Purina's renderer rather than one bad page.",
  },
  "050000428847": {
    ingredients: `Fish Broth, Fish, Trout, Wheat Gluten, Chicken, Liver, Meat By-Products, Soy Flour, Glycine, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Xanthan Gum, Salt, Choline Chloride, Carrageenan, Taurine, ${V}.`,
    analysis: withCalories(ga(14.0, 4.0, 1.5, 74.0, 3.5, 0.05), 1249, 106),
    verifiedAt: VERIFIED_014,
  },
  "050000001248": {
    ingredients: `Fish Broth, Tuna, Fish, Chicken, Wheat Gluten, Liver, Meat By-Products, Soy Flour, Glycine, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Natural Flavor, Xanthan Gum, Salt, Tricalcium Phosphate, Carrageenan, Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(14.0, 3.5, 1.5, 74.0, 3.25, 0.05), 1197, 101),
    verifiedAt: VERIFIED_014,
    conflict:
      "Target's panel is a superseded formula for this barcode carrying soy protein concentrate, artificial flavor, added color and sodium nitrite, at 78% moisture and 3.5% ash. Purina's current page links deck D690521, which has none of those and prints 74% and 3.25%. The deck is stored. Sodium nitrite is worth naming: it is a curing salt, and its removal is the sort of change a reader would want to know had happened.",
  },

  // ── Fancy Feast · Chunky ───────────────────────────────────────────────
  "050000426942": {
    ingredients: `Chicken Broth, Chicken, Meat By-Products, Liver, Fish, Wheat Gluten, Turkey, Soy Flour, Glycine, Natural Flavor, Minerals [Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Sodium Tripolyphosphate, Tricalcium Phosphate, Guar Gum, Taurine, Carrageenan, Locust Bean Gum, Choline Chloride, Salt, ${V}.`,
    analysis: withCalories(ga(11.0, 4.0, 1.5, 78.0, 3.5, 0.05), 1106, 94),
    verifiedAt: VERIFIED_014,
    conflict:
      "Target's panel is a superseded formula for this barcode with soy protein concentrate and added color. Purina's current page links deck E665022, which drops both and instead carries glycine and magnesium proteinate. The deck is stored.",
  },

  // ── Fancy Feast · Sliced (continued) ───────────────────────────────────
  //
  // Two decks that differ in one entry and one word order: the turkey names
  // chicken sixth where the chicken names none at all.
  "050000032648": {
    ingredients: `Poultry Broth, Chicken, Liver, Wheat Gluten, Meat By-Products, Soy Flour, Corn Starch-Modified, Salt, Glycine, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.7, 0.05), 919, 78),
    verifiedAt: VERIFIED_014,
    conflict:
      "Target's panel is a superseded formula for this barcode listing turkey, soy protein concentrate, artificial flavor and added color. Purina's current page links deck D700222, which has none of them and adds glycine. The deck is stored.",
  },
  "050000426447": {
    ingredients: `Poultry Broth, Turkey, Liver, Wheat Gluten, Meat By-Products, Chicken, Soy Flour, Corn Starch-Modified, Salt, Glycine, Tricalcium Phosphate, Natural Flavor, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, ${V}.`,
    analysis: withCalories(ga(11.0, 2.0, 1.5, 78.0, 2.7, 0.05), 917, 78),
    verifiedAt: VERIFIED_014,
  },

  // ── Fancy Feast · Senior 7+ ────────────────────────────────────────────
  //
  // 0.07% taurine on both — the kitten figure, not the 0.05 the adult ranges
  // state. Second time a higher taurine guarantee has turned up outside a
  // kitten food, so it really is not a life-stage marker.
  "050000503827": {
    ingredients: `Chicken, Fish, Meat By-Products, Liver, Chicken Broth, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V_E_FIRST_A_MID}.`,
    analysis: withCalories(ga(11.0, 5.0, 1.5, 78.0, 3.25, 0.07), 1128, 95),
    verifiedAt: VERIFIED_014,
    conflict: "Also guarantees a minimum Vitamin E of 40 IU/kg, which is not stored: `GuaranteedAnalysis` holds six percentages and has no room for a figure in IU/kg. Same shape as the kitten calcium minimum — see docs/CATALOG-CONFLICTS.md section D — and the same fix, since the consumer app drops keys it does not recognise when it reads a panel back.",
  },
  "050000503841": {
    ingredients: `Beef, Fish, Meat By-Products, Liver, Beef Broth, Chicken, Artificial And Natural Flavors, Guar Gum, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V_E_FIRST_A_MID}.`,
    analysis: withCalories(ga(11.5, 5.0, 1.5, 78.0, 3.25, 0.07), 1082, 91),
    verifiedAt: VERIFIED_014,
    conflict: "Also guarantees a minimum Vitamin E of 40 IU/kg, which is not stored: `GuaranteedAnalysis` holds six percentages and has no room for a figure in IU/kg. Same shape as the kitten calcium minimum — see docs/CATALOG-CONFLICTS.md section D — and the same fix, since the consumer app drops keys it does not recognise when it reads a panel back.",
  },

  // ── Friskies · Indoor (continued) ──────────────────────────────────────
  "050000574070": {
    ingredients: `Water, Turkey, Wheat Gluten, Meat By-Products, Rice, Liver, Chicken, Powdered Cellulose, Corn Starch-Modified, Spinach, Artificial And Natural Flavors, Soy Flour, Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide], Taurine, Choline Chloride, Salt, ${V_PATE}.`,
    analysis: withCalories(ga(9.0, 2.0, 2.75, 78.0, 2.5, 0.05), 886, 138),
    verifiedAt: VERIFIED_014,
    conflict:
      "Purina's live widget and Target's panel both still show added color and 2.3% maximum fibre. Purina's live page links September 2024 deck I608623, which omits the colour and prints 2.75%. The deck is stored. Fourth Friskies Indoor product to supersede a coloured formula from the same reformulation.",
  },

  // ══ Batch 015 · Hill's ═══════════════════════════════════════════════════
  //
  // No vitamin constants for any of these, and that is deliberate. Purina
  // reuses about thirteen premix blocks across a hundred and sixty products,
  // which is what makes a named constant worth having. Hill's prints SIXTEEN
  // distinct vitamin orderings across these twenty cans — barely two products
  // share one. A constant used once is a variable holding a string, and
  // sixteen of them would make the near-identical blocks harder to compare
  // rather than easier, which is the opposite of the point.
  //
  // So these are written out. If a later Hill's batch shows real reuse, the
  // constants can be extracted then, from evidence rather than from habit.

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  "052742068473": {
    ingredients: `Water, Beef, Turkey, Pork Liver, Cracked Pearled Barley, Potatoes, Corn Flour, Corn Protein Meal, Egg Product, Powdered Cellulose, Natural Flavor, Chicken Fat, Calcium Sulfate, Iodized Salt, Potassium Chloride, Dicalcium Phosphate, Egg Whites, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Ascorbic Acid (source of Vitamin C), Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Vitamin A Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Locust Bean Gum, Carrageenan, Taurine, Fish Oil, Guar Gum, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(9.0, 5.5, 3.5, 78.0, null, null), 1062, 87),
    verifiedAt: VERIFIED_015,
  },
  "052742453408": {
    ingredients: `Water, Chicken, Turkey Giblets, Pork By-Products, Pork Liver, Corn Starch, Powdered Cellulose, Wheat Flour, Soybean Meal, Corn Protein Meal, Chicken Fat, Chicken Liver Flavor, Natural Flavor, Hydrolyzed Chicken Flavor, Dicalcium Phosphate, Guar Gum, Fish Oil, Potassium Chloride, Brewers Dried Yeast, Locust Bean Gum, Carrageenan, Choline Chloride, Iodized Salt, Taurine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin D3 Supplement, Folic Acid), Calcium Sulfate, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), DL-Methionine, Potassium Citrate.`,
    analysis: withCalories(ga(8.5, 4.5, 2.0, 78.0, null, null), 1164, 182),
    verifiedAt: VERIFIED_015,
    conflict:
      "Chewy's live panel carries an older ingredient sequence that omits Hydrolyzed Chicken Flavor, and states 181 kcal/can. Hill's current page and back label give the complete sequence and 182. The label is stored.",
  },
  "052742177007": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Hydrolyzed Chicken Flavor, Egg Whites, Soybean Oil, Dicalcium Phosphate, Potassium Chloride, Fish Oil, Choline Chloride, Guar Gum, Calcium Carbonate, Iodized Salt, L-Lysine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Calcium Chloride, Caramel color, minerals (Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.8, 2.5, 1.5, 82.0, null, null), 1028, 160),
    verifiedAt: VERIFIED_015,
  },
  "052742661001": {
    ingredients: `Water, Pork Liver, Pork By-Products, Chicken, Wheat Flour, Whole Grain Corn, Corn Starch, Powdered Cellulose, Chicken Fat, Calcium Sulfate, Chicken Liver Flavor, Fish Oil, Guar Gum, Brewers Dried Yeast, Natural Flavor, Locust Bean Gum, Carrageenan, Dicalcium Phosphate, DL-Methionine, Potassium Chloride, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Iodized Salt, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 3.5, 2.5, 78.0, null, null), 1004, 157),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's own page text prints 156 kcal/can where its own back-label image prints 157, on the same 1004 kcal/kg. The label is stored, because 1004 x 0.156 kg = 156.6, which rounds to 157. Four Hill's products in this batch disagree with themselves this way and the label wins the arithmetic every time â see docs/CATALOG-CONFLICTS.md B13.",
  },
  "052742453606": {
    ingredients: `Water, Pork Liver, Salmon, Pork By-Products, Whole Grain Corn, Corn Protein Meal, Corn Starch, Chicken Fat, Powdered Cellulose, Chicken Liver Flavor, Calcium Sulfate, Natural Flavor, Guar Gum, Locust Bean Gum, Brewers Dried Yeast, Potassium Chloride, Iodized Salt, Choline Chloride, Taurine, Carrageenan, Oat Bran, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Dicalcium Phosphate, Fructooligosaccharides (FOS), L-Lysine, Magnesium Oxide, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 3.5, 2.0, 78.0, null, null), 1101, 172),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's own page text prints 171 kcal/can where its own back-label image prints 172, on the same 1101 kcal/kg. The label is stored: 1101 x 0.156 kg = 171.8. See B13.",
  },
  "052742661308": {
    ingredients: `Water, Turkey, Turkey Giblets, Pork Liver, Salmon, Rice, Pork By-Products, Corn Starch, Chicken Fat, Powdered Cellulose, Wheat Flour, Corn Protein Meal, Chicken, Chicken Liver Flavor, Natural Flavor, Guar Gum, Dicalcium Phosphate, Locust Bean Gum, Brewers Dried Yeast, Choline Chloride, Potassium Chloride, Carrageenan, Calcium Carbonate, Calcium Sulfate, Taurine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Folic Acid, Vitamin D3 Supplement), Iodized Salt, DL-Methionine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(7.3, 5.5, 2.5, 78.0, null, null), 1268, 198),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Science Diet · Adult Hairball Control ─────────────────────────────────────
  "052742453101": {
    ingredients: `Water, Pork Liver, Tuna, Pork By-Products, Powdered Cellulose, Chicken Fat, Wheat Flour, Corn Starch, Soybean Oil, Whole Grain Corn, Chicken Liver Flavor, Natural Flavor, Calcium Sulfate, Dicalcium Phosphate, Guar Gum, Locust Bean Gum, Brewers Dried Yeast, Calcium Carbonate, Choline Chloride, Potassium Chloride, Carrageenan, DL-Methionine, Iodized Salt, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Folic Acid), L-Carnitine, Taurine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 4.5, 4.0, 78.0, null, null), 1153, 180),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Science Diet · Adult Indoor ─────────────────────────────────────
  "052742610900": {
    ingredients: `Water, Chicken, Turkey Giblets, Pork By-Products, Pork Liver, Powdered Cellulose, Corn Starch, Wheat Flour, Soybean Meal, Corn Protein Meal, Chicken Fat, Soybean Oil, Chicken Liver Flavor, Natural Flavor, Dicalcium Phosphate, Guar Gum, Potassium Chloride, Brewers Dried Yeast, Iodized Salt, Choline Chloride, Locust Bean Gum, Carrageenan, Taurine, Calcium Carbonate, Calcium Sulfate, DL-Methionine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 5.0, 4.0, 78.0, null, null), 1136, 177),
    verifiedAt: VERIFIED_015,
  },
  "052742611105": {
    ingredients: `Water, Tuna, Pork By-Products, Pork Liver, Wheat Flour, Powdered Cellulose, Corn Starch, Chicken Fat, Natural Flavor, Soybean Oil, Egg Whites, Dicalcium Phosphate, Calcium Sulfate, Guar Gum, Locust Bean Gum, Iodized Salt, Fish Oil, Potassium Chloride, Carrageenan, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid), Choline Chloride, Fructooligosaccharides (FOS), Potassium Citrate, L-Tryptophan, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 2.0, 4.5, 78.0, null, null), 983, 153),
    verifiedAt: VERIFIED_015,
    conflict:
      "A standalone guaranteed-analysis graphic still linked in Hill's own gallery shows 3.5% minimum fat and 2.0% maximum fibre. The current code-6111 can-back label, whose ingredient deck matches the live page, prints 2.0% fat and 4.5% fibre. The label is stored. This one is not a rounding: the two figures swap places, which is what a stale graphic looks like rather than a typo.",
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  "052742617404": {
    ingredients: `Water, Turkey, Turkey Giblets, Pork Liver, Salmon, Pork By-Products, Soy Protein Isolate, Corn Protein Meal, Egg Product, Corn Starch, Chicken Liver Flavor, Chicken Fat, Whole Grain Corn, Oat Fiber, Dicalcium Phosphate, Chicken, Natural Flavor, Ground Pecan Shells, Potassium Chloride, Guar Gum, Brewers Dried Yeast, Calcium Carbonate, Flaxseed, Dried Beet Pulp, Locust Bean Gum, Dried Citrus Pulp, Calcium Sulfate, Choline Chloride, Iodized Salt, Carrageenan, Fish Oil, Fructooligosaccharides (FOS), Pressed Cranberries, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Vitamin A Supplement, Riboflavin Supplement, Folic Acid, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin D3 Supplement), L-Lysine, Taurine, Magnesium Oxide, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(9.5, 5.5, 2.0, 78.0, null, null), 1271, 198),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's HTML ingredient renderer collapses whitespace inside several names â it prints “SoyProtein Isolate” and “ChickenLiver Flavor”. The back-label image separates the words, and the label transcription is stored rather than inheriting a rendering defect. A missing space is not a spelling the maker chose.",
  },
  "052742617305": {
    ingredients: `Chicken Broth, Pork Liver, Salmon, Pork By-Products, Chicken Fat, Egg Product, Soybean Meal, Corn Starch, Soy Protein Isolate, Wheat Flour, Dicalcium Phosphate, Chicken Liver Flavor, Hydrolyzed Chicken Flavor, Natural Flavor, Calcium Sulfate, Ground Pecan Shells, Brewers Dried Yeast, Guar Gum, Oat Fiber, Flaxseed, Dried Beet Pulp, Potassium Chloride, Dried Citrus Pulp, Locust Bean Gum, Fructooligosaccharides (FOS), Iodized Salt, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Carrageenan, Choline Chloride, Taurine, Pressed Cranberries, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Magnesium Oxide.`,
    analysis: withCalories(ga(11.0, 5.5, 2.0, 78.0, null, null), 1360, 212),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Science Diet · Adult 7+ ─────────────────────────────────────
  "052742740003": {
    ingredients: `Water, Pork Liver, Beef, Pork By-Products, Wheat Flour, Corn Starch, Powdered Cellulose, Rice, Corn Gluten Meal, Soybean Oil, Chicken Liver Flavor, Calcium Carbonate, Natural Flavor, Carrageenan, Guar Gum, Locust Bean Gum, Fish Oil, Brewers Dried Yeast, Calcium Sulfate, Dicalcium Phosphate, Potassium Chloride, DL-Methionine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Iodized Salt, Choline Chloride, Taurine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 3.5, 3.5, 78.0, null, null), 1021, 159),
    verifiedAt: VERIFIED_015,
  },
  "052742177908": {
    ingredients: `Water, Tuna, Chicken, Pork Liver, Wheat Flour, Dextrose, Modified Rice Starch, Oat Fiber, Wheat Gluten, Pork Plasma, Soybean Oil, Glycine, Potassium Chloride, Dicalcium Phosphate, Calcium Carbonate, Natural Flavor, Guar Gum, Fish Oil, Choline Chloride, Cysteine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin D3 Supplement, Folic Acid), minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Taurine, Iodized Salt, DL-Methionine, L-Carnitine, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 2.5, 1.5, 82.0, null, null), 940, 147),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's page prints 146 kcal/can where the can-back label prints 147, on the same 940 kcal/kg. The label is stored: 940 x 0.156 kg = 146.6. See B13.",
  },
  "052742454108": {
    ingredients: `Water, Chicken, Pork By-Products, Pork Liver, Wheat Flour, Rice, Corn Starch, Chicken Liver Flavor, Soybean Oil, Guar Gum, Calcium Sulfate, Dicalcium Phosphate, Potassium Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Biotin), Calcium Carbonate, Powdered Cellulose, Calcium Chloride, Taurine, Iodized Salt, Choline Chloride, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Magnesium Oxide.`,
    analysis: withCalories(ga(7.0, 3.5, 1.0, 78.0, null, null), 1072, 167),
    verifiedAt: VERIFIED_015,
  },
  "052742177601": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Egg Whites, Hydrolyzed Chicken Flavor, Soybean Oil, Dicalcium Phosphate, Potassium Chloride, Choline Chloride, Guar Gum, Fish Oil, Calcium Carbonate, L-Lysine, Salt, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Iodized Salt, Taurine, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), L-Carnitine, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 2.5, 1.5, 82.0, null, null), 1076, 168),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's page prints 167 kcal/can where the can-back label prints 168, on the same 1076 kcal/kg. The label is stored: 1076 x 0.156 kg = 167.9. See B13.",
  },

  // ── Hill's Prescription Diet · r/d ─────────────────────────────────────
  "052742945408": {
    ingredients: `Water, Pork Liver, Pork By-Products, Powdered Cellulose, Chicken, Brewers Rice, Corn Gluten Meal, Corn Starch, Calcium Sulfate, Soybean Oil, Dicalcium Phosphate, Guar Gum, Potassium Chloride, Choline Chloride, DL-Methionine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Iodized Salt, Calcium Carbonate, Taurine, Chicken Liver Flavor, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(6.5, 1.0, 6.0, 78.0, null, null), 779, 122),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Prescription Diet · y/d ─────────────────────────────────────
  "052742149608": {
    ingredients: `Water, Pork Liver, Pork By-Products, Chicken, Corn Flour, Rice, Chicken Fat, Chicken Liver Flavor, Powdered Cellulose, Calcium Carbonate, Fish Oil, Natural Flavor, L-Lysine, Potassium Chloride, DL-Methionine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Biotin), Guar Gum, Taurine, Choline Chloride, Salt, Cysteine, Dicalcium Phosphate, L-Carnitine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate), Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 5.5, 2.5, 78.0, null, null), 1242, 194),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Prescription Diet · z/d ─────────────────────────────────────
  "052742523804": {
    ingredients: `Hydrolyzed Chicken Liver, Water, Corn Starch, Coconut Oil, Ground Pecan Shells, Calcium Carbonate, Fish Oil, Powdered Cellulose, Dicalcium Phosphate, Flaxseed, Dried Beet Pulp, Potassium Chloride, Dried Citrus Pulp, Choline Chloride, Cysteine, Iodized Salt, Potassium Citrate, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin D3 Supplement, Folic Acid), DL-Methionine, Soybean Oil, Pressed Cranberries, Calcium Sulfate, Taurine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 2.5, 1.5, 78.0, null, null), 1108, 173),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Prescription Diet · c/d Multicare ─────────────────────────────────────
  "052742623801": {
    ingredients: `Pork By-Products, Water, Pork Liver, Brewers Rice, Chicken, Corn Starch, Chicken Fat, Soybean Meal, Chicken Liver Flavor, Fish Oil, Hydrolyzed Chicken Flavor, Calcium Sulfate, Guar Gum, Brewers Dried Yeast, Choline Chloride, Calcium Chloride, DL-Methionine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Pyridoxine Hydrochloride, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Folic Acid, Vitamin D3 Supplement), Iodized Salt, Taurine, Potassium Citrate, Potassium Chloride, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.5, 3.5, 2.5, 78.0, null, null), 1118, 174),
    verifiedAt: VERIFIED_015,
  },

  // ── Hill's Prescription Diet · i/d ─────────────────────────────────────
  "052742462806": {
    ingredients: `Water, Pork Liver, Chicken, Rice, Potato Protein, Flaxseed, Fish Oil, Calcium Sulfate, Chicken Fat, Chicken Liver Flavor, Hydrolyzed Chicken Flavor, Ground Pecan Shells, Guar Gum, Potassium Chloride, Dicalcium Phosphate, Dried Beet Pulp, Dried Citrus Pulp, Iodized Salt, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Choline Chloride, Taurine, Pressed Cranberries, DL-Methionine, Magnesium Oxide, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.2, 4.0, 4.0, 78.0, null, null), 1100, 172),
    verifiedAt: VERIFIED_015,
    conflict:
      "Hill's page prints 171 kcal/can where the PET NUTRITION FACTS panel prints 172, on the same 1100 kcal/kg. The label is stored: 1100 x 0.156 kg = 171.6. See B13.",
  },

  // ══ Batch 016 · Hill's, continued ════════════════════════════════════════
  //
  // Two of these print a per-can calorie figure and NO kcal/kg. Stored as null
  // rather than divided out of the can figure — see the note on `withCalories`.

  // ── Hill's Prescription Diet · c/d Multicare ─────────────────────────────────────
  "052742623900": {
    ingredients: `Pork By-Products, Water, Pork Liver, Tuna, Brewers Rice, Chicken Fat, Corn Starch, Powdered Cellulose, Corn Protein Meal, Soybean Oil, Chicken Liver Flavor, Fish Oil, Hydrolyzed Chicken Flavor, Calcium Sulfate, Guar Gum, Brewers Dried Yeast, Calcium Carbonate, Choline Chloride, Dicalcium Phosphate, Potassium Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement), DL-Methionine, Taurine, Potassium Citrate, Iodized Salt, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 3.5, 2.0, 78.0, null, null), 1140, 178),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Prescription Diet · c/d Multicare Stress ─────────────────────────────────────
  "052742068138": {
    ingredients: `Pork By-Products, Water, Pork Liver, Chicken, Brewers Rice, Corn Starch, Chicken Fat, Chicken Liver Flavor, Corn Gluten Meal, Hydrolyzed Chicken Flavor, Fish Oil, Calcium Sulfate, Guar Gum, Brewers Dried Yeast, Choline Chloride, Calcium Carbonate, Taurine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Pyridoxine Hydrochloride, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Folic Acid, Vitamin D3 Supplement), Potassium Citrate, Iodized Salt, Potassium Chloride, Dried Hydrolyzed Casein, L-Tryptophan, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.5, 3.5, 2.5, 78.0, null, null), 1114, 174),
    verifiedAt: VERIFIED_016,
    conflict:
      "Hill's live page text lists Brewers Rice before Chicken and calls the corn ingredient Corn Protein Meal. The current official back label and flat ingredient graphic linked from that page both list Chicken before Brewers Rice and Corn Gluten Meal; the current package ingredient deck is stored.",
  },

  // ── Hill's Prescription Diet · i/d ─────────────────────────────────────
  "052742078205": {
    ingredients: `Water, Pork Liver, Chicken, Rice, Flaxseed, Potato Protein, Fish Oil, Egg Whites, Chicken Fat, Ground Pecan Shells, Calcium Sulfate, Chicken Liver Flavor, Hydrolyzed Chicken Flavor, Guar Gum, Dicalcium Phosphate, Potassium Chloride, Dried Beet Pulp, Iodized Salt, Dried Citrus Pulp, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Taurine, Pressed Cranberries, DL-Methionine, Choline Chloride, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Magnesium Oxide, Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 4.0, 4.0, 78.0, null, null), null, 173),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Prescription Diet · k/d + z/d ─────────────────────────────────────
  "052742086620": {
    ingredients: `Hydrolyzed Chicken Liver, Water, Corn Starch, Oat Fiber, Soybean Oil, Fish Oil, Calcium Carbonate, Potassium Citrate, Coconut Oil, Oat Bran, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Folic Acid, Vitamin D3 Supplement), Betaine, DL-Methionine, Powdered Cellulose, Fructooligosaccharides (FOS), Iodized Salt, Taurine, Calcium Chloride, Choline Chloride, L-Arginine, Cysteine, Magnesium Oxide, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(5.5, 4.0, 6.5, 78.0, null, null), null, 187),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Prescription Diet · m/d GlucoSupport ─────────────────────────────────────
  "052742428109": {
    ingredients: `Pork Liver, Pork By-Products, Water, Chicken Fat, Corn Starch, Potato Protein, Calcium Sulfate, Powdered Cellulose, Natural Flavor, Guar Gum, Fish Oil, Iodized Salt, Potassium Chloride, Locust Bean Gum, Taurine, Carrageenan, DL-Methionine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin D3 Supplement, Folic Acid), Choline Chloride, L-Carnitine, L-Lysine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(10.5, 4.0, 3.0, 78.0, null, null), 1106, 173),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Prescription Diet · w/d Multi-Benefit ─────────────────────────────────────
  "052742945507": {
    ingredients: `Water, Pork Liver, Pork By-Products, Chicken, Powdered Cellulose, Wheat Flour, Corn Starch, Calcium Sulfate, Chicken Liver Flavor, Soybean Oil, Guar Gum, Locust Bean Gum, DL-Methionine, Potassium Chloride, Carrageenan, Choline Chloride, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Vitamin D3 Supplement, Riboflavin Supplement, Folic Acid), Taurine, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 2.0, 5.0, 78.0, null, null), 821, 128),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Science Diet · Adult 7+ Senior Vitality ─────────────────────────────────────
  "052742011974": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Rice, Rice Starch, Wheat Gluten, Spinach, Hydrolyzed Chicken Flavor, Soybean Oil, Potassium Alginate, Powdered Cellulose, Calcium Chloride, Fish Oil, Natural Flavor, Dried Tomato Pomace, Choline Chloride, Monosodium Phosphate, Guar Gum, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Dicalcium Phosphate, Calcium Lactate, Calcium Gluconate, Taurine, Broccoli, Potassium Citrate, Sodium Tripolyphosphate, L-Carnitine, Magnesium Oxide, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 2.5, 2.0, 85.0, null, null), 829, 68),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  "052742007199": {
    ingredients: `Chicken Broth, Salmon, Pork Liver, Carrots, Chicken, Wheat Gluten, Spinach, Rice, Rice Starch, Chicken Fat, Chicken Liver Flavor, Powdered Cellulose, Soybean Oil, Potassium Alginate, Fish Oil, Natural Flavor, Calcium Chloride, L-Lysine, Choline Chloride, Taurine, Guar Gum, Dicalcium Phosphate, Monosodium Phosphate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Calcium Lactate, Calcium Gluconate, Potassium Chloride, Sodium Tripolyphosphate, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Magnesium Oxide.`,
    analysis: withCalories(ga(5.0, 3.0, 2.0, 85.0, null, null), 999, 79),
    verifiedAt: VERIFIED_016,
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  "052742075556": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Powdered Cellulose, Spinach, Wheat Gluten, Rice Starch, Chicken Fat, Hydrolyzed Chicken Flavor, Rice, Dried Beet Pulp, Potassium Alginate, Soybean Oil, Fish Oil, Calcium Chloride, Potassium Citrate, Dicalcium Phosphate, Choline Chloride, Calcium Sulfate, Sodium Tripolyphosphate, Taurine, Guar Gum, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement), Iodized Salt, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Calcium Carbonate.`,
    analysis: withCalories(ga(4.5, 2.5, 4.0, 84.0, null, null), 815, 67),
    verifiedAt: VERIFIED_016,
  },
  "052742075877": {
    ingredients: `Chicken Broth, Pork Liver, Turkey, Carrots, Wheat Gluten, Powdered Cellulose, Rice Starch, Spinach, Chicken Fat, Hydrolyzed Chicken Flavor, Rice, Dried Beet Pulp, Potassium Alginate, Fish Oil, Calcium Chloride, Potassium Citrate, Dicalcium Phosphate, Sodium Tripolyphosphate, Calcium Sulfate, Taurine, Guar Gum, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement), Iodized Salt, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Calcium Carbonate.`,
    analysis: withCalories(ga(4.9, 2.8, 4.0, 84.0, null, null), 856, 70),
    verifiedAt: VERIFIED_016,
  },

  // ══ Batch 017 · Dry food and treats ══════════════════════════════════════
  //
  // Calorie statements here are per CUP and per PIECE, never per package —
  // `withCalories` takes the serving name for that reason. It also means rule
  // 4 is unavailable on this batch: a cup is a volume, so kcal/kg x pack weight
  // has nothing to check against. The arithmetic witness that settled three
  // disputes in the wet batches simply does not testify about a bag.

  // ── Fancy Feast · Gourmet Dry ─────────────────────────────────────
  "050000462896": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, chicken, turkey, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], fish oil, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3966, 520, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and artificial colors. Purina's current product page links October 2024 deck G650024, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000463008": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, chicken, turkey, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], fish oil, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3966, 520, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and artificial colors. Purina's current product page links October 2024 deck G650024, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000463114": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, chicken, turkey, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], fish oil, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3966, 520, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and artificial colors. Purina's current product page links October 2024 deck G650024, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000576227": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, chicken, turkey, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], fish oil, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3966, 520, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and artificial colors. Purina's current product page links October 2024 deck G650024, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000572908": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, fish, shrimp, calcium carbonate, dried yeast, phosphoric acid, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], natural filet mignon flavor, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3914, 513, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose a legacy colored formula with corn gluten meal and Yellow/Red dyes. Purina's current product page links October 2024 deck G650124, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000572830": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, fish, shrimp, calcium carbonate, dried yeast, phosphoric acid, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], natural filet mignon flavor, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3914, 513, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose a legacy colored formula with corn gluten meal and Yellow/Red dyes. Purina's current product page links October 2024 deck G650124, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000572854": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, fish, shrimp, calcium carbonate, dried yeast, phosphoric acid, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], natural filet mignon flavor, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3914, 513, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose a legacy colored formula with corn gluten meal and Yellow/Red dyes. Purina's current product page links October 2024 deck G650124, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000576241": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, fish, shrimp, calcium carbonate, dried yeast, phosphoric acid, salt, potassium chloride, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], natural filet mignon flavor, DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3914, 513, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose a legacy colored formula with corn gluten meal and Yellow/Red dyes. Purina's current product page links October 2024 deck G650124, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000467150": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, ocean fish, salmon, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, dried spinach, parsley flakes, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3961, 519, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and Blue/Yellow/Red dyes. Purina's current product page links October 2024 deck G650224, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000463916": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, ocean fish, salmon, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, dried spinach, parsley flakes, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3961, 519, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and Blue/Yellow/Red dyes. Purina's current product page links October 2024 deck G650224, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },
  "050000580743": {
    ingredients: `Rice, poultry by-product meal, corn protein meal, beef fat preserved with mixed-tocopherols, whole grain corn, soybean meal, natural flavor, ocean fish, salmon, dried yeast, phosphoric acid, calcium carbonate, salt, potassium chloride, choline chloride, dried spinach, parsley flakes, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(34.0, 17.0, 3.0, 10.0, null, null), 3961, 519, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the legacy colored formula with corn gluten meal and Blue/Yellow/Red dyes. Purina's current product page links October 2024 deck G650224, which uses corn protein meal and prints no artificial colors; the current official deck is stored here.",
  },

  // ── Fancy Feast · Kitten ─────────────────────────────────────
  "050000660681": {
    ingredients: `Poultry by-product meal, rice, corn protein meal, animal fat preserved with mixed-tocopherols, whole grain corn, soybean meal, chicken, turkey, liver flavor, phosphoric acid, dried yeast, calcium carbonate, salt, natural flavor, potassium chloride, fish oil, dried whole milk, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, VITAMINS [Vitamin E supplement, thiamine mononitrate (Vitamin B-1), niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(35.0, 17.0, 3.0, 10.0, null, 0.12), 3970, 457, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the prior A512722 formula with chicken by-product meal, corn gluten meal, beef fat, and a different vitamin order. Purina's current product page links deck B512723, which is stored here.",
  },
  "050000660667": {
    ingredients: `Poultry by-product meal, rice, corn protein meal, animal fat preserved with mixed-tocopherols, whole grain corn, soybean meal, chicken, turkey, liver flavor, phosphoric acid, dried yeast, calcium carbonate, salt, natural flavor, potassium chloride, fish oil, dried whole milk, choline chloride, glycine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, VITAMINS [Vitamin E supplement, thiamine mononitrate (Vitamin B-1), niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], taurine.`,
    analysis: withCalories(ga(35.0, 17.0, 3.0, 10.0, null, 0.12), 3970, 457, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Some retailer panels still expose the prior A512722 formula with chicken by-product meal, corn gluten meal, beef fat, and a different vitamin order. Purina's current product page links deck B512723, which is stored here.",
  },

  // ── Friskies · Seafood Sensations ─────────────────────────────────────
  "050000015474": {
    ingredients: `Ground yellow corn, corn protein meal, poultry by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, choline chloride, dehydrated seaweed meal, salmon meal, shrimp meal, tuna meal, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Blue 2, Yellow 5.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3631, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present several ingredients in a different sequence than the linked label deck. The current official deck K600323 and Target label panel agree on the stored complete order.",
  },
  "050000575770": {
    ingredients: `Ground yellow corn, corn protein meal, poultry by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, choline chloride, dehydrated seaweed meal, salmon meal, shrimp meal, tuna meal, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Blue 2, Yellow 5.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3631, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present several ingredients in a different sequence than the linked label deck. The current official deck K600323 and Target label panel agree on the stored complete order.",
  },
  "050000168866": {
    ingredients: `Ground yellow corn, corn protein meal, poultry by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, choline chloride, dehydrated seaweed meal, salmon meal, shrimp meal, tuna meal, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Blue 2, Yellow 5.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3631, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present several ingredients in a different sequence than the linked label deck. The current official deck K600323 and Target label panel agree on the stored complete order. The 17.6 lb retailer panel exposes a legacy Seafood Sensations formula with crab meal and a different ingredient order. Purina's current page still lists the 17.6 lb size and links current deck K600323, which is used for the stored formula.",
  },
  "050000290833": {
    ingredients: `Ground yellow corn, corn protein meal, poultry by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, choline chloride, dehydrated seaweed meal, salmon meal, shrimp meal, tuna meal, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Blue 2, Yellow 5.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3631, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present several ingredients in a different sequence than the linked label deck. The current official deck K600323 and Target label panel agree on the stored complete order. ShopRite's ingredient panel reflects an older Seafood Sensations generation. The current linked Purina deck K600323 is used for the stored ingredient order and analysis.",
  },
  "050000963584": {
    ingredients: `Ground yellow corn, corn protein meal, poultry by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, choline chloride, dehydrated seaweed meal, salmon meal, shrimp meal, tuna meal, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Blue 2, Yellow 5.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3631, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present several ingredients in a different sequence than the linked label deck. The current official deck K600323 and Target label panel agree on the stored complete order.",
  },

  // ── Friskies · Surfin' & Turfin' Favorites ─────────────────────────────────────
  "050000100347": {
    ingredients: `Ground yellow corn, chicken by-product meal, soybean meal, corn protein meal, beef fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, salmon meal, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, taurine, DL-Methionine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], natural filet mignon flavor, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3573, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present phosphoric acid and calcium carbonate in a different sequence than the linked label deck. The current official deck N600123 and Target label panel agree on the stored complete order.",
  },
  "050000576692": {
    ingredients: `Ground yellow corn, chicken by-product meal, soybean meal, corn protein meal, beef fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, salmon meal, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, taurine, DL-Methionine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], natural filet mignon flavor, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3573, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present phosphoric acid and calcium carbonate in a different sequence than the linked label deck. The current official deck N600123 and Target label panel agree on the stored complete order.",
  },
  "050000294701": {
    ingredients: `Ground yellow corn, chicken by-product meal, soybean meal, corn protein meal, beef fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, salmon meal, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, taurine, DL-Methionine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], natural filet mignon flavor, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3573, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present phosphoric acid and calcium carbonate in a different sequence than the linked label deck. The current official deck N600123 and Target label panel agree on the stored complete order.",
  },
  "050000290215": {
    ingredients: `Ground yellow corn, chicken by-product meal, soybean meal, corn protein meal, beef fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, ocean fish meal, phosphoric acid, salt, calcium carbonate, salmon meal, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, taurine, DL-Methionine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], natural filet mignon flavor, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3573, 392, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles currently present phosphoric acid and calcium carbonate in a different sequence than the linked label deck. The current official deck N600123 and Target label panel agree on the stored complete order.",
  },

  // ── Friskies · Gravy Swirlers ─────────────────────────────────────
  "050000168583": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed tocopherols, wheat flour, meat and bone meal, animal liver flavor, fish meal, phosphoric acid, calcium carbonate, salmon meal, artificial and natural flavors, dried chicken flavored gravy, salt, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, 3.0, 12.0, null, 0.12), 3635, 405, "cup"),
    verifiedAt: VERIFIED_017,
  },
  "050000168620": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed tocopherols, wheat flour, meat and bone meal, animal liver flavor, fish meal, phosphoric acid, calcium carbonate, salmon meal, artificial and natural flavors, dried chicken flavored gravy, salt, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, 3.0, 12.0, null, 0.12), 3635, 405, "cup"),
    verifiedAt: VERIFIED_017,
  },
  "050000172559": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed tocopherols, wheat flour, meat and bone meal, animal liver flavor, fish meal, phosphoric acid, calcium carbonate, salmon meal, artificial and natural flavors, dried chicken flavored gravy, salt, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, 3.0, 12.0, null, 0.12), 3635, 405, "cup"),
    verifiedAt: VERIFIED_017,
  },
  "050000504121": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed tocopherols, wheat flour, meat and bone meal, animal liver flavor, fish meal, phosphoric acid, calcium carbonate, salmon meal, artificial and natural flavors, dried chicken flavored gravy, salt, choline chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, 3.0, 12.0, null, 0.12), 3635, 405, "cup"),
    verifiedAt: VERIFIED_017,
  },

  // ── Friskies · Tender & Crunchy Combo ─────────────────────────────────────
  "050000084500": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, ground wheat, soybean meal, beef fat preserved with mixed tocopherols, meat and bone meal, glycerin, animal liver flavor, chicken, phosphoric acid, natural flavor, turkey by-product meal, calcium carbonate, salt, choline chloride, dried carrots, dried green beans, potassium chloride, taurine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid, biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], Yellow 6, DL-Methionine, L-Lysine monohydrochloride, L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3595, 375, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles and retailer panels labeled I600424 show an older formula/order. The product page now links October 2025 deck J600425, whose complete ingredient order and analysis are stored. Purina's current HTML size selector says 3.5 lb for the smaller bag, while current Rakuten, Petco, Kroger, Chewy, and Walmart listings identify UPC 050000084500 as 3.15 lb. The exact sellable-unit size is stored as 3.15 lb and the manufacturer-page disagreement is retained.",
  },
  "050000575787": {
    ingredients: `Ground yellow corn, corn protein meal, chicken by-product meal, ground wheat, soybean meal, beef fat preserved with mixed tocopherols, meat and bone meal, glycerin, animal liver flavor, chicken, phosphoric acid, natural flavor, turkey by-product meal, calcium carbonate, salt, choline chloride, dried carrots, dried green beans, potassium chloride, taurine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid, biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], Yellow 6, DL-Methionine, L-Lysine monohydrochloride, L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 11.0, 3.0, 12.0, null, 0.12), 3595, 375, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles and retailer panels labeled I600424 show an older formula/order. The product page now links October 2025 deck J600425, whose complete ingredient order and analysis are stored.",
  },

  // ── Friskies · Indoor Delights ─────────────────────────────────────
  "050000051472": {
    ingredients: `Whole grain corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, salmon meal, powdered cellulose, meat and bone meal, soybean hulls, liver flavor, phosphoric acid, calcium carbonate, malted barley extract, salt, choline chloride, dried cheese powder, dried peas, dried carrots, potassium chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Yellow 6, Yellow 5, Red 40, Blue 2.`,
    analysis: withCalories(ga(30.0, 9.0, 5.0, 12.0, null, 0.12), 3410, 368, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's current HTML ingredient tiles show a materially different order/composition and 3382 kcal/kg / 365 kcal/cup, while the linked official deck J600224 prints 3410 kcal/kg / 368 kcal/cup. The stronger linked deck is used for every stored formula field and the disagreement is retained.",
  },
  "050000376407": {
    ingredients: `Whole grain corn, corn protein meal, chicken by-product meal, soybean meal, animal fat preserved with mixed-tocopherols, salmon meal, powdered cellulose, meat and bone meal, soybean hulls, liver flavor, phosphoric acid, calcium carbonate, malted barley extract, salt, choline chloride, dried cheese powder, dried peas, dried carrots, potassium chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Yellow 6, Yellow 5, Red 40, Blue 2.`,
    analysis: withCalories(ga(30.0, 9.0, 5.0, 12.0, null, 0.12), 3410, 368, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's current HTML ingredient tiles show a materially different order/composition and 3382 kcal/kg / 365 kcal/cup, while the linked official deck J600224 prints 3410 kcal/kg / 368 kcal/cup. The stronger linked deck is used for every stored formula field and the disagreement is retained.",
  },

  // ── Friskies · Land & Sea Adventures ─────────────────────────────────────
  "050000259373": {
    ingredients: `Whole grain corn, corn protein meal, chicken by-product meal, soybean meal, beef fat preserved with mixed-tocopherols, meat and bone meal, liver flavor, fish meal, calcium carbonate, phosphoric acid, salt, choline chloride, potassium chloride, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], DL-Methionine, taurine, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, 3.5, 12.0, null, 0.12), 3568, 404, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's current HTML ingredient tiles omit corn protein meal near the start and flatten the premix blocks, while the current page links deck A508223 and a current retailer label panel matches the deck's stored complete order. The linked official deck is used for every formula field.",
  },

  // ── Friskies · Party Pack'd ─────────────────────────────────────
  "050000618958": {
    ingredients: `Whole grain corn, chicken by-product meal, corn protein meal, soybean meal, whole grain wheat, animal fat preserved with mixed tocopherols, liver flavor, phosphoric acid, calcium carbonate, turkey by-product meal, salt, sodium bisulfate, choline chloride, DL-Methionine, taurine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, L-Lysine monohydrochloride, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, null, 12.0, null, 0.12), null, 423, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Target classifies both bags as “All Ages,” while current official deck A508325 states “Complete Adult Cat Food” and AAFCO maintenance of adult cats. The official adult-maintenance statement is stored.",
  },
  "050000619832": {
    ingredients: `Whole grain corn, chicken by-product meal, corn protein meal, soybean meal, whole grain wheat, animal fat preserved with mixed tocopherols, liver flavor, phosphoric acid, calcium carbonate, turkey by-product meal, salt, sodium bisulfate, choline chloride, DL-Methionine, taurine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], potassium chloride, VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), thiamine mononitrate (Vitamin B-1), calcium pantothenate (Vitamin B-5), riboflavin supplement (Vitamin B-2), Vitamin A supplement, pyridoxine hydrochloride (Vitamin B-6), Vitamin B-12 supplement, folic acid (Vitamin B-9), biotin (Vitamin B-7), Vitamin D-3 supplement, menadione sodium bisulfite complex (Vitamin K)], L-Tryptophan, L-Lysine monohydrochloride, Red 40, Yellow 5, Blue 2.`,
    analysis: withCalories(ga(30.0, 12.0, null, 12.0, null, 0.12), null, 423, "cup"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Target classifies both bags as “All Ages,” while current official deck A508325 states “Complete Adult Cat Food” and AAFCO maintenance of adult cats. The official adult-maintenance statement is stored.",
  },

  // ── Friskies · Party Mix ─────────────────────────────────────
  "050000238910": {
    ingredients: `Chicken, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, brewers dried yeast, natural and artificial flavors, cassava root flour, turkey by-product meal, phosphoric acid, calcium carbonate, potassium chloride, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate (Vitamin C), VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid, Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4080, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles abbreviate or alter a few printed terms (for example “Dried Yeast” and tile-casing/order), while the linked official deck I619223 supplies the complete declaration. The deck version appropriate to the package format is stored.",
  },
  "050000575848": {
    ingredients: `Chicken, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, brewers dried yeast, natural and artificial flavors, cassava root flour, turkey by-product meal, phosphoric acid, calcium carbonate, potassium chloride, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate (Vitamin C), VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid, Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4080, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles abbreviate or alter a few printed terms (for example “Dried Yeast” and tile-casing/order), while the linked official deck I619223 supplies the complete declaration. The deck version appropriate to the package format is stored.",
  },
  "050000963089": {
    ingredients: `Chicken, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, brewers dried yeast, natural and artificial flavors, cassava root flour, turkey by-product meal, phosphoric acid, calcium carbonate, potassium chloride, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate, VITAMINS [Vitamin E supplement, niacin, Vitamin A supplement, calcium pantothenate, thiamine mononitrate, riboflavin supplement, Vitamin B-12 supplement, pyridoxine hydrochloride, folic acid, Vitamin D-3 supplement, biotin, menadione sodium bisulfite complex], MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4080, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles abbreviate or alter a few printed terms (for example “Dried Yeast” and tile-casing/order), while the linked official deck I619223 supplies the complete declaration. The deck version appropriate to the package format is stored.",
  },
  "050000500413": {
    ingredients: `Chicken, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, brewers dried yeast, natural and artificial flavors, cassava root flour, turkey by-product meal, phosphoric acid, calcium carbonate, potassium chloride, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate, VITAMINS [Vitamin E supplement, niacin, Vitamin A supplement, calcium pantothenate, thiamine mononitrate, riboflavin supplement, Vitamin B-12 supplement, pyridoxine hydrochloride, folic acid, Vitamin D-3 supplement, biotin, menadione sodium bisulfite complex], MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4080, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Purina's HTML ingredient tiles abbreviate or alter a few printed terms (for example “Dried Yeast” and tile-casing/order), while the linked official deck I619223 supplies the complete declaration. The deck version appropriate to the package format is stored.",
  },
  "050000574438": {
    ingredients: `Ocean whitefish, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, natural and artificial flavors, cassava root flour, phosphoric acid, calcium carbonate, potassium chloride, brewers dried yeast, shrimp meal, crab meal, tuna meal, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate (Vitamin C), MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4011, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Several retailer panels expose an older or flattened Beachside declaration (including corn gluten meal or ungrouped premixes). Purina's current page links deck I619023; its package-format-specific declaration is stored.",
  },
  "050000576999": {
    ingredients: `Ocean whitefish, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, natural and artificial flavors, cassava root flour, phosphoric acid, calcium carbonate, potassium chloride, brewers dried yeast, shrimp meal, crab meal, tuna meal, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate (Vitamin C), MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4011, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Several retailer panels expose an older or flattened Beachside declaration (including corn gluten meal or ungrouped premixes). Purina's current page links deck I619023; its package-format-specific declaration is stored.",
  },
  "050000963102": {
    ingredients: `Ocean whitefish, chicken meal, brewers rice, chicken by-product meal, animal fat preserved with mixed-tocopherols, pea starch, barley, corn protein meal, liver flavor, natural and artificial flavors, cassava root flour, phosphoric acid, calcium carbonate, potassium chloride, brewers dried yeast, shrimp meal, crab meal, tuna meal, choline chloride, salt, taurine, L-ascorbyl-2-polyphosphate, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin, Vitamin A supplement, calcium pantothenate, thiamine mononitrate, riboflavin supplement, Vitamin B-12 supplement, pyridoxine hydrochloride, folic acid, Vitamin D-3 supplement, biotin, menadione sodium bisulfite complex], Yellow 5, citric acid, Yellow 6, Red 40, Blue 2, BHA (a preservative), BHT (a preservative).`,
    analysis: withCalories(ga(29.0, 15.0, 4.0, 8.0, null, null), 4011, 1.3, "piece"),
    verifiedAt: VERIFIED_017,
    conflict:
      "Several retailer panels expose an older or flattened Beachside declaration (including corn gluten meal or ungrouped premixes). Purina's current page links deck I619023; its package-format-specific declaration is stored.",
  },

  // ══ Batch 018 · Hill's, wet pouches and dry bags ═════════════════════════
  //
  // The first Hill's dry food: 8% moisture, 28.5-30.5% protein, calories per
  // CUP. Same as the Purina bags in batch 017 — no pack-weight arithmetic is
  // available on any of them.
  //
  // Still no ash and no taurine on anything Hill's prints, wet or dry.

  // ── Hill's Science Diet · Adult 7+ Senior Vitality ─────────────────────────────────────
  "052742011998": {
    ingredients: `Chicken Broth, Tuna, Chicken, Turkey Giblets, Pork Liver, Carrots, Rice, Rice Starch, Pea Protein, Wheat Gluten, Soybean Oil, Spinach, Potassium Alginate, Chicken Liver Flavor, L-Lysine, Calcium Chloride, Dried Beet Pulp, Powdered Cellulose, Choline Chloride, Fish Oil, Dried Tomato Pomace, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Sodium Tripolyphosphate, Guar Gum, Dicalcium Phosphate, Calcium Lactate, Calcium Gluconate, Potassium Citrate, DL-Methionine, Broccoli, Taurine, L-Carnitine, Magnesium Oxide, minerals (Zinc Oxide, Ferrous Sulfate, Manganous Oxide, Calcium Iodate), Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(6.5, 2.5, 2.0, 85.0, null, null), 836, 69, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult 7+ ─────────────────────────────────────
  "052742032269": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Egg Whites, Hydrolyzed Chicken Flavor, Soybean Oil, Dicalcium Phosphate, Potassium Chloride, Choline Chloride, Fish Oil, Guar Gum, L-Lysine, Calcium Carbonate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Iodized Salt, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Salt, L-Carnitine, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(6.5, 3.0, 3.0, 82.0, null, null), 968, 77, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742032283": {
    ingredients: `Water, Tuna, Chicken, Pork Liver, Dextrose, Wheat Flour, Modified Rice Starch, Oat Fiber, Wheat Gluten, Pork Plasma, Soybean Oil, Glycine, Calcium Carbonate, Natural Flavor, Fish Oil, Dicalcium Phosphate, Guar Gum, Potassium Chloride, Choline Chloride, Cysteine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin D3 Supplement, Folic Acid), minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Taurine, Iodized Salt, DL-Methionine, L-Carnitine, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 2.2, 3.0, 82.0, null, null), 903, 72, "pouch"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  "052742177502": {
    ingredients: `Water, Ocean Fish, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Soybean Oil, Egg Whites, Dicalcium Phosphate, Glycine, Potassium Chloride, Fish Oil, Natural Flavor, Guar Gum, Choline Chloride, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Ascorbic Acid (source of Vitamin C), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid, Vitamin D3 Supplement), Taurine, Iodized Salt, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.8, 2.5, 1.5, 82.0, null, null), 1060, 165, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742177205": {
    ingredients: `Water, Tuna, Chicken, Pork Liver, Wheat Flour, Dextrose, Modified Rice Starch, Oat Hulls, Wheat Gluten, Pork Plasma, Soybean Oil, Glycine, Calcium Carbonate, Natural Flavor, Guar Gum, Fish Oil, Choline Chloride, Potassium Chloride, Cysteine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin D3 Supplement, Folic Acid), Calcium Chloride, Taurine, Dicalcium Phosphate, Iodized Salt, DL-Methionine, minerals (Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 2.5, 1.5, 82.0, null, null), 1040, 162, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  "052742022086": {
    ingredients: `Salmon, Yellow Peas, Potato Starch, Chicken Fat, Potato Protein, Chicken, Chicken Meal, Potatoes, Pea Protein, Chicken Liver Flavor, Dried Beet Pulp, Soybean Oil, Lactic Acid, Calcium Sulfate, Potassium Chloride, Choline Chloride, Iodized Salt, L-Lysine, Fructooligosaccharides (FOS), DL-Methionine, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Riboflavin Supplement, Biotin, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Folic Acid, Vitamin D3 Supplement), minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(29.5, 19.0, 3.0, 8.0, null, null), 4095, 511, "cup"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  "052742007137": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Rice, Spinach, Rice Starch, Wheat Gluten, Chicken Liver Flavor, Powdered Cellulose, Chicken Fat, Potassium Alginate, Calcium Chloride, L-Lysine, Iodized Salt, Dicalcium Phosphate, Guar Gum, Soybean Oil, Taurine, Calcium Lactate, Calcium Gluconate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Choline Chloride, Sodium Tripolyphosphate, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(5.5, 3.0, 2.0, 85.0, null, null), 837, 66, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Indoor ─────────────────────────────────────
  "052742068398": {
    ingredients: `Chicken Broth, Pork Liver, Salmon, Tuna, Carrots, Powdered Cellulose, Wheat Gluten, Spinach, Rice Starch, Rice, Soybean Oil, Chicken Fat, Hydrolyzed Chicken Flavor, Calcium Chloride, Potassium Alginate, Fish Oil, Monosodium Phosphate, Guar Gum, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid), Sodium Tripolyphosphate, Choline Chloride, Calcium Lactate, Calcium Gluconate, Taurine, DL-Methionine, Potassium Chloride, Potassium Citrate, Iodized Salt, Magnesium Oxide, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(6.0, 1.5, 4.0, 83.0, null, null), 792, 124, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742075815": {
    ingredients: `Chicken Broth, Pork Liver, Salmon, Tuna, Carrots, Powdered Cellulose, Wheat Gluten, Spinach, Rice Starch, Rice, Soybean Oil, Chicken Fat, Hydrolyzed Chicken Flavor, Potassium Alginate, Calcium Chloride, Fish Oil, Monosodium Phosphate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Guar Gum, Choline Chloride, Calcium Lactate, Calcium Gluconate, Taurine, Sodium Tripolyphosphate, DL-Methionine, Potassium Chloride, Iodized Salt, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Magnesium Oxide, Potassium Citrate, Beta-Carotene.`,
    analysis: withCalories(ga(6.0, 1.5, 4.0, 82.0, null, null), 798, 64, "pouch"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Perfect Digestion ─────────────────────────────────────
  "052742038346": {
    ingredients: `Chicken, Cracked Pearled Barley, Corn Protein Meal, Chicken Fat, Chicken Meal, Whole Grain Oats, Whole Grain Corn, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, Choline Chloride, Soybean Oil, Iodized Salt, L-Lysine, Fish Oil, Pressed Cranberries, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Biotin, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, Pumpkin, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), DL-Methionine, Calcium Carbonate, Dicalcium Phosphate, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 14.5, 4.0, 8.0, null, null), 3848, 469, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742038339": {
    ingredients: `Chicken, Cracked Pearled Barley, Corn Protein Meal, Chicken Fat, Chicken Meal, Whole Grain Oats, Whole Grain Corn, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, Choline Chloride, Soybean Oil, Iodized Salt, L-Lysine, Fish Oil, Pressed Cranberries, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Biotin, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, Pumpkin, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), DL-Methionine, Calcium Carbonate, Dicalcium Phosphate, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 14.5, 4.0, 8.0, null, null), 3848, 469, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742038315": {
    ingredients: `Chicken, Cracked Pearled Barley, Corn Protein Meal, Chicken Fat, Chicken Meal, Whole Grain Oats, Whole Grain Corn, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, Choline Chloride, Soybean Oil, Iodized Salt, L-Lysine, Fish Oil, Pressed Cranberries, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Biotin, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, Pumpkin, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), DL-Methionine, Calcium Carbonate, Dicalcium Phosphate, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 14.5, 4.0, 8.0, null, null), 3848, 469, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742041605": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Rice, Rice Starch, Potato Protein, Spinach, Chicken Fat, Hydrolyzed Chicken Flavor, Potassium Alginate, Ground Pecan Shells, Calcium Chloride, Dicalcium Phosphate, Flaxseed, Dried Beet Pulp, Calcium Sulfate, Dried Citrus Pulp, Sodium Tripolyphosphate, Pumpkin, Guar Gum, Oat Fiber, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid, Vitamin D3 Supplement), L-Lysine, Taurine, Pressed Cranberries, Magnesium Oxide, minerals (Zinc Oxide, Manganous Oxide, Calcium Iodate, Sodium Selenite), Calcium Carbonate.`,
    analysis: withCalories(ga(5.0, 1.8, 1.5, 85.0, null, null), 758, 62, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742041476": {
    ingredients: `Salmon, Brown Rice, Corn Protein Meal, Whole Grain Oats, Potato Protein, Chicken Meal, Whole Grain Corn, Chicken Fat, Egg Product, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, L-Lysine, Soybean Oil, Choline Chloride, Iodized Salt, Pressed Cranberries, Pumpkin, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Calcium Carbonate, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 15.0, 4.0, 8.0, null, null), 3875, 472, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742041469": {
    ingredients: `Salmon, Brown Rice, Corn Protein Meal, Whole Grain Oats, Potato Protein, Chicken Meal, Whole Grain Corn, Chicken Fat, Egg Product, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, L-Lysine, Soybean Oil, Choline Chloride, Iodized Salt, Pressed Cranberries, Pumpkin, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Calcium Carbonate, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 15.0, 4.0, 8.0, null, null), 3875, 472, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742041544": {
    ingredients: `Salmon, Brown Rice, Corn Protein Meal, Whole Grain Oats, Potato Protein, Chicken Meal, Whole Grain Corn, Chicken Fat, Egg Product, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Calcium Sulfate, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, L-Lysine, Soybean Oil, Choline Chloride, Iodized Salt, Pressed Cranberries, Pumpkin, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Calcium Carbonate, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 15.0, 4.0, 8.0, null, null), 3875, 472, "cup"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Perfect Weight ─────────────────────────────────────
  "052742076546": {
    ingredients: `Chicken Broth, Pork Liver, Carrots, Salmon, Wheat Gluten, Chicken, Powdered Cellulose, Spinach, Rice Starch, Rice, Tuna, Dried Tomato Pomace, Flaxseed, Hydrolyzed Chicken Flavor, Coconut Oil, Potassium Alginate, Calcium Chloride, Dicalcium Phosphate, Natural Flavor, Calcium Lactate, Calcium Gluconate, Monosodium Phosphate, Guar Gum, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Menadione Sodium Bisulfite Complex (source of Vitamin K), Riboflavin Supplement, Biotin, Folic Acid), Taurine, Leucine, Sodium Tripolyphosphate, Iodized Salt, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(6.5, 1.5, 4.0, 81.0, null, null), 817, 65, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742068435": {
    ingredients: `Chicken Broth, Pork Liver, Carrots, Salmon, Wheat Gluten, Powdered Cellulose, Chicken, Spinach, Rice Starch, Rice, Tuna, Dried Tomato Pomace, Flaxseed, Hydrolyzed Chicken Flavor, Coconut Oil, Potassium Alginate, Calcium Chloride, Dicalcium Phosphate, Natural Flavor, Calcium Lactate, Calcium Gluconate, Monosodium Phosphate, Guar Gum, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate,L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement,Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride,Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex(source of Vitamin K), Folic Acid), Taurine, Leucine, Sodium Tripolyphosphate, Iodized Salt, L-Carnitine, minerals (Zinc Oxide,Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(6.5, 1.2, 4.0, 82.0, null, null), 816, 67, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742068459": {
    ingredients: `Chicken Broth, Pork Liver, Carrots, Turkey, Rice, Spinach, Wheat Gluten, Rice Starch, Powdered Cellulose, Natural Flavor, Dried Tomato Pomace, Flaxseed, Coconut Oil, Potassium Alginate, Calcium Chloride, Dicalcium Phosphate, Choline Chloride, Guar Gum, Calcium Lactate, Calcium Gluconate, Taurine, Monosodium Phosphate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement), Sodium Tripolyphosphate, Leucine, L-Carnitine, Iodized Salt, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(6.5, 1.0, 4.0, 82.0, null, null), 791, 65, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742076539": {
    ingredients: `Chicken Broth, Pork Liver, Carrots, Chicken, Spinach, Wheat Gluten, Rice Starch, Powdered Cellulose, Rice, Flaxseed, Dried Tomato Pomace, Hydrolyzed Chicken Flavor, Coconut Oil, Potassium Alginate, Calcium Chloride, Dicalcium Phosphate, Natural Flavor, Calcium Lactate, Calcium Gluconate, Guar Gum, Choline Chloride, Monosodium Phosphate, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin D3 Supplement, Folic Acid), Taurine, Iodized Salt, Leucine, Sodium Tripolyphosphate, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(6.5, 1.0, 4.0, 82.0, null, null), 759, 61, "pouch"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  "052742046365": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Brown Rice, Beef, Egg Whites, Spinach, Oat Fiber, Flaxseed, Dried Beet Pulp, Pork Plasma, Fish Oil, Green Peas, Hydrolyzed Chicken Flavor, Calcium Carbonate, Dicalcium Phosphate, Potassium Chloride, Fructooligosaccharides (FOS), Guar Gum, Choline Chloride, Taurine, Salt, Carrageenan, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Hydrochloride, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Riboflavin Supplement, Folic Acid, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin B12 Supplement, Vitamin D3 Supplement), minerals (Ferrous Sulfate, Zinc Oxide, Copper Proteinate, Manganese Sulfate, Potassium Iodide), Sodium Pyrophosphate, Disodium Phosphate, Sodium Hexametaphosphate, L-Carnitine.`,
    analysis: withCalories(ga(6.0, 2.5, 3.0, 84.0, null, null), 888, 70, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742010243": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Green Peas, Potatoes, Egg Whites, Spinach, Potato Protein, Soybean Oil, Flaxseed Meal, Calcium Chloride, Calcium Sulfate, Dicalcium Phosphate, L-Lysine, Fish Oil, Fructooligosaccharides (FOS), vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Ascorbic Acid (source of Vitamin C), Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Iodized Salt, Taurine, DL-Methionine, Choline Chloride, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(4.0, 2.3, 1.5, 78.0, null, null), 1073, 88, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742068411": {
    ingredients: `Water, Pork By-Products, Duck, Pork Liver, Turkey, Carrots, Whole Grain Corn, Green Peas, Green Beans, Potato Protein, Potato Starch, Chicken Fat, Natural Flavor, Powdered Cellulose, Calcium Sulfate, Dicalcium Phosphate, Choline Chloride, Iodized Salt, Fructooligosaccharides (FOS), Potassium Chloride, Fish Oil, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin A Supplement, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Calcium Carbonate, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 3.5, 2.0, 78.0, null, null), 1055, 86, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742059167": {
    ingredients: `Pollock Meal, Cracked Pearled Barley, Whole Grain Sorghum, Corn Starch, Potato Starch, Chicken Fat, Egg Product, Pea Protein, Soybean Oil, Chicken Liver Flavor, Coconut Oil, Lactic Acid, Calcium Sulfate, Oat Fiber, Potassium Chloride, L-Lysine, Fructooligosaccharides (FOS), Choline Chloride, Calcium Carbonate, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Folic Acid, Vitamin D3 Supplement), DL-Methionine, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(28.5, 19.0, 3.0, 8.0, null, null), 4126, 526, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742059150": {
    ingredients: `Pollock Meal, Cracked Pearled Barley, Whole Grain Sorghum, Corn Starch, Potato Starch, Chicken Fat, Egg Product, Pea Protein, Soybean Oil, Chicken Liver Flavor, Coconut Oil, Lactic Acid, Calcium Sulfate, Oat Fiber, Potassium Chloride, L-Lysine, Fructooligosaccharides (FOS), Choline Chloride, Calcium Carbonate, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Folic Acid, Vitamin D3 Supplement), DL-Methionine, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(28.5, 19.0, 3.0, 8.0, null, null), 4126, 526, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742046341": {
    ingredients: `Chicken Broth, Pork Liver, Salmon, Chicken, Carrots, Brown Rice, Tuna, Egg Whites, Spinach, Oat Fiber, Flaxseed, Dried Beet Pulp, Pork Plasma, Powdered Cellulose, Soybean Oil, Green Peas, Hydrolyzed Chicken Flavor, Calcium Carbonate, Fructooligosaccharides (FOS), Guar Gum, Potassium Chloride, Choline Chloride, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Proteinate, Manganese Sulfate, Potassium Iodide), Carrageenan, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Hydrochloride, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Riboflavin Supplement, Folic Acid, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin B12 Supplement, Vitamin D3 Supplement), Sodium Pyrophosphate, Disodium Phosphate, Sodium Hexametaphosphate, L-Carnitine, Salt.`,
    analysis: withCalories(ga(5.0, 2.0, 3.0, 85.0, null, null), 765, 60, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742070261": {
    ingredients: `Chicken Broth, Turkey, Salmon, Carrots, Chicken, Green Peas, Pork Liver, Potato Starch, Spinach, Egg Whites, Flaxseed Meal, Natural Flavor, Chicken Fat, L-Lysine, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Fructooligosaccharides (FOS), Potassium Chloride, Calcium Chloride, Taurine, Iodized Salt, minerals (Ferrous Sulfate, Zinc Oxide, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(6.5, 3.0, 1.5, 78.0, null, null), 1079, 88, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742010267": {
    ingredients: `Chicken Broth, Tuna, Chicken, Turkey, Carrots, Green Peas, Potatoes, Egg Whites, Soybean Oil, Spinach, L-Lysine, Choline Chloride, Fish Oil, Calcium Chloride, Dicalcium Phosphate, Fructooligosaccharides (FOS), vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Vitamin A Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin, Vitamin D3 Supplement), Calcium Sulfate, Iodized Salt, DL-Methionine, Taurine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 4.0, 1.5, 78.0, null, null), 1107, 91, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  "052742032207": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Egg Whites, Hydrolyzed Chicken Flavor, Soybean Oil, Dicalcium Phosphate, Potassium Chloride, Choline Chloride, Fish Oil, Calcium Carbonate, Guar Gum, Iodized Salt, L-Lysine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Calcium Chloride, minerals (Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 2.8, 3.0, 82.0, null, null), 1021, 82, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742032245": {
    ingredients: `Water, Ocean Fish, Chicken, Pork Liver, Wheat Flour, Wheat Gluten, Dextrose, Modified Rice Starch, Oat Fiber, Egg Whites, Soybean Oil, Glycine, Dicalcium Phosphate, Natural Flavor, Fish Oil, Potassium Chloride, Choline Chloride, Guar Gum, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Ascorbic Acid (source of Vitamin C), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid, Vitamin D3 Supplement), Taurine, Iodized Salt, Salt, Thiamine Mononitrate, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.5, 2.0, 3.0, 82.0, null, null), 921, 74, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742032221": {
    ingredients: `Water, Tuna, Chicken, Pork Liver, Dextrose, Wheat Flour, Modified Rice Starch, Oat Fiber, Wheat Gluten, Pork Plasma, Soybean Oil, Glycine, Calcium Carbonate, Natural Flavor, Fish Oil, Guar Gum, Potassium Chloride, Choline Chloride, Cysteine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Vitamin D3 Supplement, Folic Acid), minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Dicalcium Phosphate, Taurine, Iodized Salt, DL-Methionine, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 2.5, 3.0, 82.0, null, null), 934, 75, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742453804": {
    ingredients: `Water, Turkey, Turkey Giblets, Pork Liver, Salmon, Pork By-Products, Corn Starch, Chicken Fat, Powdered Cellulose, Rice, Wheat Flour, Corn Protein Meal, Chicken, Chicken Liver Flavor, Natural Flavor, Soybean Meal, Guar Gum, Dicalcium Phosphate, Locust Bean Gum, Brewers Dried Yeast, Choline Chloride, Caramel color, Potassium Chloride, Carrageenan, Calcium Carbonate, Taurine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Folic Acid, Vitamin D3 Supplement), Iodized Salt, Calcium Sulfate, DL-Methionine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Magnesium Oxide.`,
    analysis: withCalories(ga(7.0, 5.0, 2.0, 78.0, null, null), 1263, 197, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  "052742075891": {
    ingredients: `Chicken Broth, Pork Liver, Carrots, Salmon, Wheat Gluten, Chicken Fat, Powdered Cellulose, Rice Starch, Spinach, Rice, Hydrolyzed Chicken Flavor, Dried Beet Pulp, Potassium Alginate, Potassium Citrate, Calcium Chloride, Dicalcium Phosphate, Fish Oil, Calcium Sulfate, Guar Gum, Taurine, Choline Chloride, Sodium Tripolyphosphate, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Ascorbic Acid (source of Vitamin C), Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin A Supplement, Folic Acid, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin D3 Supplement), Iodized Salt, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Calcium Carbonate, Beta-Carotene.`,
    analysis: withCalories(ga(5.0, 2.3, 4.0, 84.0, null, null), 856, 70, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742075853": {
    ingredients: `Chicken Broth, Pork Liver, Chicken, Carrots, Tuna, Chicken Fat, Powdered Cellulose, Rice Starch, Wheat Gluten, Spinach, Rice, Hydrolyzed Chicken Flavor, Dried Beet Pulp, Potassium Alginate, Potassium Citrate, Calcium Chloride, Fish Oil, Dicalcium Phosphate, Calcium Sulfate, Guar Gum, Choline Chloride, Monosodium Phosphate, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Ascorbic Acid (source of Vitamin C), Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin A Supplement, Folic Acid, Menadione Sodium Bisulfite Complex (source of Vitamin K), Vitamin D3 Supplement), Taurine, Iodized Salt, Sodium Tripolyphosphate, DL-Methionine, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Calcium Carbonate, Beta-Carotene.`,
    analysis: withCalories(ga(5.3, 2.7, 4.0, 84.0, null, null), 859, 70, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  "052742086446": {
    ingredients: `Salmon, Brown Rice, Brewers Rice, Pea Protein, Corn Protein Meal, Chicken, Chicken Fat, Cracked Pearled Barley, Egg Product, Chicken Liver Flavor, Calcium Sulfate, Lactic Acid, Potassium Chloride, L-Lysine, Calcium Carbonate, Fructooligosaccharides (FOS), Choline Chloride, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Iodized Salt, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.0, 17.0, 1.5, 8.0, null, null), 4030, 514, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742086484": {
    ingredients: `Salmon, Brown Rice, Brewers Rice, Pea Protein, Corn Protein Meal, Chicken, Chicken Fat, Cracked Pearled Barley, Egg Product, Chicken Liver Flavor, Calcium Sulfate, Lactic Acid, Potassium Chloride, L-Lysine, Calcium Carbonate, Fructooligosaccharides (FOS), Choline Chloride, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Iodized Salt, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.0, 17.0, 1.5, 8.0, null, null), 4030, 514, "cup"),
    verifiedAt: VERIFIED_018,
  },
  "052742086408": {
    ingredients: `Salmon, Brown Rice, Brewers Rice, Pea Protein, Corn Protein Meal, Chicken, Chicken Fat, Cracked Pearled Barley, Egg Product, Chicken Liver Flavor, Calcium Sulfate, Lactic Acid, Potassium Chloride, L-Lysine, Calcium Carbonate, Fructooligosaccharides (FOS), Choline Chloride, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Biotin, Riboflavin Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Taurine, DL-Methionine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Iodized Salt, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.0, 17.0, 1.5, 8.0, null, null), 4030, 514, "cup"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  "052742075839": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Wheat Gluten, Rice Starch, Spinach, Rice, Chicken Fat, Natural Flavor, Potassium Alginate, Calcium Chloride, Ground Pecan Shells, Monosodium Phosphate, Dicalcium Phosphate, Flaxseed, Dried Beet Pulp, Powdered Cellulose, Dried Citrus Pulp, Calcium Lactate, Calcium Gluconate, Guar Gum, Fish Oil, Fructooligosaccharides (FOS), Choline Chloride, Potassium Citrate, Taurine, Pressed Cranberries, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Folic Acid, Vitamin D3 Supplement), Oat Fiber, Sodium Tripolyphosphate, Magnesium Oxide, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Beta-Carotene.`,
    analysis: withCalories(ga(6.0, 3.0, 1.5, 82.0, null, null), 927, 74, "pouch"),
    verifiedAt: VERIFIED_018,
  },
  "052742176901": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Soy Protein Isolate, Wheat Gluten, Modified Rice Starch, Dicalcium Phosphate, Egg Whites, Hydrolyzed Chicken Flavor, Oat Fiber, Fish Oil, Potassium Chloride, Choline Chloride, Soybean Oil, Guar Gum, Calcium Carbonate, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Iodized Salt, Magnesium Oxide, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 82.0, null, null), 1133, 177, "can"),
    verifiedAt: VERIFIED_018,
    conflict:
      "The official page calorie text says 1095 kcal/kg and 170 kcal/can, while the current official back-label image for SKU 1769 prints 1133 kcal/kg and 177 kcal/can; the label values are stored because the same image carries the current ingredient deck and SKU.",
  },

  // ── Hill's Science Diet · Kitten Healthy Cuisine ─────────────────────────────────────
  "052742007175": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Wheat Gluten, Rice Starch, Spinach, Rice, Chicken Fat, Natural Flavor, Calcium Chloride, Potassium Alginate, Ground Pecan Shells, Monosodium Phosphate, Dicalcium Phosphate, Flaxseed, Dried Beet Pulp, Calcium Lactate, Calcium Gluconate, Powdered Cellulose, Dried Citrus Pulp, Guar Gum, Fish Oil, Fructooligosaccharides (FOS), Choline Chloride, Potassium Citrate, Taurine, Pressed Cranberries, vitamins (Vitamin E Supplement, Ascorbic Acid (source of Vitamin C), L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Folic Acid, Vitamin D3 Supplement), Oat Fiber, Sodium Tripolyphosphate, Magnesium Oxide, minerals (Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganese Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), Thiamine Hydrochloride, Beta-Carotene.`,
    analysis: withCalories(ga(6.5, 2.5, 2.0, 85.0, null, null), 898, 71, "can"),
    verifiedAt: VERIFIED_018,
    conflict:
      "The official page calorie text rounds the unit value to 70 kcal/can, while the current official back-label image for SKU 10447 prints 71 kcal/can at the same 898 kcal/kg; the printed label value is stored.",
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  "052742660004": {
    ingredients: `Water, Pork Liver, Pork By-Products, Chicken, Chicken Fat, Egg Product, Corn Starch, Soybean Meal, Corn Protein Meal, Pork Protein Isolate, Chicken Liver Flavor, Dicalcium Phosphate, Ground Pecan Shells, Calcium Carbonate, Brewers Dried Yeast, Guar Gum, Natural Flavor, Potassium Chloride, Powdered Cellulose, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, Iodized Salt, Calcium Sulfate, Fructooligosaccharides (FOS), Locust Bean Gum, Fish Oil, L-Lysine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Pressed Cranberries, Taurine, Carrageenan, Oat Fiber, Magnesium Oxide, Sodium Tripolyphosphate, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(10.5, 5.5, 1.5, 78.0, null, null), 1270, 198, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Kitten Sensitive Stomach & Skin ─────────────────────────────────────
  "052742069463": {
    ingredients: `Chicken Broth, Salmon, Carrots, Turkey, Pork Liver, Spinach, Rice Starch, Rice, Potato Protein, Rice Protein Concentrate, Chicken Liver Flavor, Egg Yolks, Natural Flavor, Potassium Alginate, Chicken Fat, Soybean Oil, Calcium Chloride, Dicalcium Phosphate, Calcium Sulfate, Monosodium Phosphate, Fructooligosaccharides (FOS), Guar Gum, Fish Oil, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid), Iodized Salt, Potassium Citrate, Sodium Tripolyphosphate, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Magnesium Oxide, Potassium Chloride, Calcium Carbonate.`,
    analysis: withCalories(ga(4.0, 1.7, 2.0, 86.5, null, null), 687, 54, "can"),
    verifiedAt: VERIFIED_018,
  },
  "052742076553": {
    ingredients: `Chicken Broth, Salmon, Carrots, Turkey, Pork Liver, Spinach, Rice Starch, Rice, Potato Protein, Rice Protein Concentrate, Chicken Liver Flavor, Egg Yolks, Natural Flavor, Potassium Alginate, Chicken Fat, Soybean Oil, Calcium Chloride, Dicalcium Phosphate, Calcium Sulfate, Monosodium Phosphate, Fructooligosaccharides (FOS), Guar Gum, Fish Oil, Taurine, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Thiamine Mononitrate, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid), Iodized Salt, Potassium Citrate, Sodium Tripolyphosphate, Magnesium Oxide, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganese Sulfate, Calcium Iodate), Potassium Chloride, Calcium Carbonate.`,
    analysis: withCalories(ga(4.0, 1.5, 1.0, 86.5, null, null), 692, 55, "pouch"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult 7+ Healthy Cuisine ─────────────────────────────────────
  "052742007151": {
    ingredients: `Chicken Broth, Chicken, Pork Liver, Carrots, Rice, Wheat Gluten,Spinach, Rice Starch, Hydrolyzed Chicken Flavor, Powdered Cellulose,Potassium Alginate, Chicken Fat, Calcium Chloride, vitamins (Vitamin ESupplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Calcium Pantothenate, Vitamin B12Supplement, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement,Folic Acid, Vitamin D3 Supplement), Choline Chloride, Dicalcium Phosphate, Guar Gum, Soybean Oil, Calcium Lactate, Calcium Gluconate,Sodium Tripolyphosphate, Taurine, Potassium Citrate, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(6.0, 1.6, 2.0, 85.0, null, null), 808, 64, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult 7+ Perfect Digestion ─────────────────────────────────────
  "052742041483": {
    ingredients: `Chicken, Cracked Pearled Barley, Corn Protein Meal, Chicken Fat, Whole Grain Oats, Brown Rice, Whole Grain Corn, Chicken Meal, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, L-Lysine, Soybean Oil, Choline Chloride, Calcium Sulfate, Iodized Salt, Fish Oil, Calcium Carbonate, Pressed Cranberries, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Pumpkin, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), L-Carnitine, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 14.5, 4.0, 8.0, null, null), 3848, 469, "cup"),
    verifiedAt: VERIFIED_018,
    conflict:
      "The GA graphic embedded on the exact Adult 7+ product page omits '7+' in its formula heading, but the page metadata, item name, ingredient statement, back-bag image, sizes, and SKUs identify the Adult 7+ product; the numeric panel is used only within that exact page context.",
  },
  "052742041568": {
    ingredients: `Chicken, Cracked Pearled Barley, Corn Protein Meal, Chicken Fat, Whole Grain Oats, Brown Rice, Whole Grain Corn, Chicken Meal, Chicken Liver Flavor, Ground Pecan Shells, Lactic Acid, Potassium Chloride, Flaxseed, Dried Beet Pulp, Dried Citrus Pulp, L-Lysine, Soybean Oil, Choline Chloride, Calcium Sulfate, Iodized Salt, Fish Oil, Calcium Carbonate, Pressed Cranberries, vitamins (Vitamin E Supplement, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Thiamine Mononitrate, Vitamin A Supplement, Calcium Pantothenate, Pyridoxine Hydrochloride, Biotin, Riboflavin Supplement, Vitamin B12 Supplement, Folic Acid, Vitamin D3 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K)), Pumpkin, Taurine, minerals (Ferrous Sulfate, Zinc Oxide, Copper Sulfate, Manganous Oxide, Calcium Iodate, Sodium Selenite), L-Carnitine, Mixed Tocopherols for freshness, Natural Flavors, Beta-Carotene.`,
    analysis: withCalories(ga(30.5, 14.5, 4.0, 8.0, null, null), 3848, 469, "cup"),
    verifiedAt: VERIFIED_018,
    conflict:
      "The GA graphic embedded on the exact Adult 7+ product page omits '7+' in its formula heading, but the page metadata, item name, ingredient statement, back-bag image, sizes, and SKUs identify the Adult 7+ product; the numeric panel is used only within that exact page context.",
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  "052742007090": {
    ingredients: `Chicken Broth, Tuna, Pork Liver, Carrots, Chicken, Spinach, Rice, Rice Starch, Chicken Fat, Wheat Gluten, Hydrolyzed Chicken Flavor, Powdered Cellulose, Soybean Oil, Potassium Alginate, Calcium Chloride, Fish Oil, Dicalcium Phosphate, L-Lysine, Calcium Lactate, Calcium Gluconate, Guar Gum, Sodium Tripolyphosphate, Choline Chloride, Natural Flavor, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Niacin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Folic Acid, Biotin), Monosodium Phosphate, Taurine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate).`,
    analysis: withCalories(ga(5.5, 2.5, 2.0, 85.0, null, null), 899, 71, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  "052742034669": {
    ingredients: `Water, Chicken, Pork Liver, Wheat Flour, Modified Rice Starch, Wheat Gluten, Soy Protein Isolate, Dicalcium Phosphate, Egg Whites, Oat Fiber, Hydrolyzed Chicken Flavor, Fish Oil, Potassium Chloride, Choline Chloride, Soybean Oil, Calcium Carbonate, Guar Gum, minerals (Calcium Chloride, Zinc Oxide, Ferrous Sulfate, Copper Sulfate, Manganous Oxide, Calcium Iodate), Salt, Iodized Salt, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Taurine, Magnesium Oxide, Caramel color, Beta-Carotene.`,
    analysis: withCalories(ga(8.0, 3.0, 1.5, 82.0, null, null), 901, 71, "pouch"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult 11+ Healthy Cuisine ─────────────────────────────────────
  "052742007113": {
    ingredients: `Chicken Broth, Tuna, Chicken, Pork Liver, Carrots, Rice, Beef, Spinach, Rice Starch, Wheat Gluten, Soybean Oil, Chicken Liver Flavor, Potassium Alginate, Powdered Cellulose, Chicken Fat, Fish Oil, Calcium Chloride, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, L-Ascorbyl-2-Polyphosphate (source of Vitamin C), Ascorbic Acid (source of Vitamin C), Niacin Supplement, Vitamin A Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Riboflavin Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Biotin, Folic Acid, Vitamin D3 Supplement), Guar Gum, L-Lysine, Dicalcium Phosphate, Calcium Lactate, Calcium Gluconate, Taurine, Sodium Tripolyphosphate, Monosodium Phosphate, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(5.5, 2.5, 2.0, 85.0, null, null), 835, 66, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Hairball Control ─────────────────────────────────────
  "052742452609": {
    ingredients: `Water, Chicken, Turkey Giblets, Pork By-Products, Pork Liver, Powdered Cellulose, Corn Starch, Corn Protein Meal, Wheat Flour, Chicken Fat, Soybean Oil, Dicalcium Phosphate, Chicken Liver Flavor, Natural Flavor, Brewers Dried Yeast, Guar Gum, Potassium Chloride, Iodized Salt, Choline Chloride, Locust Bean Gum, Carrageenan, Taurine, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Ascorbic Acid (source of Vitamin C), Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Vitamin D3 Supplement, Folic Acid), Calcium Carbonate, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Calcium Sulfate, DL-Methionine, Magnesium Oxide, Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 4.0, 5.5, 78.0, null, null), 1147, 179, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  "052742661209": {
    ingredients: `Water, Tuna, Pork By-Products, Pork Liver, Wheat Flour, Chicken Fat, Whole Grain Corn, Corn Starch, Powdered Cellulose, Soybean Oil, Chicken Liver Flavor, Calcium Sulfate, Natural Flavor, Dicalcium Phosphate, Guar Gum, Locust Bean Gum, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Niacin Supplement, Pyridoxine Hydrochloride, Calcium Pantothenate, Vitamin B12 Supplement, Menadione Sodium Bisulfite Complex (source of Vitamin K), Riboflavin Supplement, Biotin, Folic Acid), Brewers Dried Yeast, Choline Chloride, Potassium Chloride, Carrageenan, Iodized Salt, DL-Methionine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Taurine.`,
    analysis: withCalories(ga(8.0, 4.0, 3.0, 78.0, null, null), 1171, 183, "can"),
    verifiedAt: VERIFIED_018,
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  "052742010229": {
    ingredients: `Water, Chicken, Turkey Giblets, Pork By-Products, Pork Liver, Powdered Cellulose, Corn Starch, Rice, Soybean Meal, Dried Beet Pulp, Chicken Liver Flavor, Natural Flavor, Fish Meal, Guar Gum, Brewers Dried Yeast, L-Tryptophan, Monosodium Phosphate, Potassium Citrate, Calcium Carbonate, Fish Oil, Choline Chloride, vitamins (Vitamin E Supplement, Thiamine Mononitrate, Pyridoxine Hydrochloride, Niacin Supplement, Calcium Pantothenate, Vitamin B12 Supplement, Riboflavin Supplement, Biotin, Menadione Sodium Bisulfite Complex (source of Vitamin K), Folic Acid, Vitamin D3 Supplement), L-Lysine, Taurine, L-Carnitine, minerals (Zinc Oxide, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Calcium Iodate), Beta-Carotene.`,
    analysis: withCalories(ga(7.0, 3.5, 4.0, 78.0, null, null), 1019, 159, "can"),
    verifiedAt: VERIFIED_018,
  },
};
