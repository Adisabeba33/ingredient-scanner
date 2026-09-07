import { foldWords } from "./fold";

/**
 * Is this a therapeutic diet — one a vet puts an animal on?
 *
 * ── Why this is a correctness problem, not a catalog field ────────────────
 *
 * The report judges a pet food by one standard: is there real named meat near
 * the top, or is it bulked out with grain and by-product? That is the right
 * question for a food somebody feeds their healthy cat every day.
 *
 * It is the wrong question, backwards, for a renal diet. A Hill's k/d is
 * DELIBERATELY low in protein and phosphorus, because protein is what a failing
 * kidney cannot process. Measured against "more named meat is better" it looks
 * like a cynically cheap food, and the report says so — about a product a vet
 * prescribed to keep an animal alive. The same holds for a hydrolysed
 * elimination diet, whose protein is deliberately broken past recognition, and
 * for a satiety formula whose fibre load is the point.
 *
 * So the flag exists to tell the report to stop applying the everyday standard.
 * It does not mean "good" or "bad" — it means "this was formulated against a
 * clinical target, and judging it as an everyday food is a category error".
 *
 * ── Only unambiguous evidence ─────────────────────────────────────────────
 *
 * Everything here is a phrase that a manufacturer only ever prints on a
 * vet-channel product. Notably absent: health words like "urinary", "digestive"
 * or "weight" on their own. Pro Plan sells Urinary Tract Health in a
 * supermarket, Science Diet sells Perfect Weight off a shelf, and flagging
 * those would push ordinary retail foods out of the ordinary standard — which
 * is the same error in the other direction.
 */

/** Printed only on a vet-channel product, by any maker. */
const VET_PHRASES = [
  "prescription diet",
  "veterinary diet",
  "veterinary diets",
  "veterinary exclusive",
  "vet diet",
  "vet diets",
  "veterinary formula",
  "veterinary care nutrition",
  // Royal Canin's dog vet channel. The cat one says "Veterinary Diet" and is
  // already matched above; the dog bags print this phrase instead, and the
  // product names under it ("Canine Gastrointestinal", "Renal Support A")
  // carry no vet word of their own — the range name is the whole evidence.
  "veterinary health nutrition",
  "vet life",
  "vet essentials",
  "therapeutic diet",
  "veterinarian prescribed",
  "use only as directed by your veterinarian",
];

/**
 * Brands where EVERY product is vet-channel, so there is no phrase to find.
 *
 * The phrase list above works because most makers sell a retail line and a vet
 * line and have to print the difference on the pack. A brand that sells only
 * therapeutic diets prints nothing, because there is nothing to distinguish it
 * from — the vet is the distribution.
 *
 * TheraDiet is the case that made this exist. Rayne Nutrition sells it through
 * veterinarians only; the Low Fat Kangaroo bag is 1% fat by minimum, formulated
 * against a clinical target the way a renal diet is. Nothing in "TheraDiet Low
 * Fat Kangaroo-MAINT Chunky Stew" matches a phrase above — "TheraDiet" folds to
 * one word, so not even "therapeutic diet" reaches it — and the everyday
 * standard would mark it down for exactly the thing a vet prescribed it for.
 *
 * The bar for adding a brand here is that the WHOLE brand is vet-channel. A
 * maker with one vet range and a supermarket line goes in the phrase list, on
 * the range, or nothing retail gets judged as retail again.
 */
const VET_BRANDS = ["theradiet"];

/**
 * Hill's letter codes — c/d, k/d, z/d and the rest of the family.
 *
 * Brand-scoped on purpose. Folded to words, "n/d" is "n d", and so is Farmina's
 * retail range N&D — which is sold in pet shops to healthy animals. Matching
 * these codes on any brand would file every bag of Farmina as a prescription
 * diet, and a two-letter token is far too small to spend that risk on.
 */
const HILLS_CODES = [
  "a d", "b d", "c d", "d d", "g d", "i d", "j d", "k d", "l d", "m d",
  "n d", "r d", "s d", "t d", "u d", "w d", "y d", "z d",
];

function hasPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`).test(haystack);
}

/**
 * Does this product come from the veterinary channel?
 *
 * Takes whatever text a row has — brand, range, product name, variant. Any one
 * of them carrying the evidence is enough, since which field the phrase lands
 * in depends on how the pack was read rather than on what the product is.
 */
export function isVeterinaryDiet(
  ...parts: (string | null | undefined)[]
): boolean {
  const text = foldWords(parts.filter(Boolean).join(" "));
  if (!text) return false;
  if (VET_PHRASES.some((phrase) => hasPhrase(text, phrase))) return true;
  // The brands that are vet-channel end to end and print no phrase saying so.
  if (VET_BRANDS.some((brand) => hasPhrase(text, brand))) return true;
  // The codes, only under the brand that uses them.
  if (hasPhrase(text, "hills") || hasPhrase(text, "hill s")) {
    return HILLS_CODES.some((code) => hasPhrase(text, code));
  }
  return false;
}
