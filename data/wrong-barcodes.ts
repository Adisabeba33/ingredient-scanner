/**
 * Barcodes that are real, valid, in circulation — and belong to something other
 * than the single tin somebody is about to file them against.
 *
 * ── Why this is a data file and not a comment ─────────────────────────────
 *
 * Every code here passes its own UPC-A check digit and appears in real retail
 * listings. Nothing about the number says it is wrong. A comment beside one
 * product does not stop the same code being used beside a different product six
 * batches later, by somebody who never read that comment.
 *
 * So it lives here, where three things read it: the test that refuses to file
 * any of them as a package, `scripts/check-batch.mjs` which warns before a
 * batch is typed in at all, and docs/CATALOG-CONFLICTS.md which explains each
 * one to a person.
 *
 * ── Two kinds, and the second is the dangerous one ────────────────────────
 *
 * A CASE code attached to a single tin gives the right ingredients under the
 * wrong barcode. Somebody scanning the real can gets nothing; somebody scanning
 * the case gets a product. Annoying, findable.
 *
 * A SIBLING code — a different product sharing a flavour name — gives the WRONG
 * INGREDIENTS under a plausible barcode, and nothing on the page looks odd.
 * Fancy Feast sells a White Meat Chicken Primavera in a silky broth and another
 * as a paté. Different textures, different formulas, adjacent names.
 *
 * ── A code can leave this list ────────────────────────────────────────────
 *
 * `050000962648` sat here for three batches as "the Primavera Paté, do not file
 * it against the broth version". It was right about what the code was and wrong
 * about what to do with it: the paté is a real product, and when its deck
 * arrived it was seeded like any other. What survives is the warning that the
 * two are different tins — which is now enforced by both existing, rather than
 * by one being forbidden.
 */

export interface WrongBarcode {
  /** The code that is not what it looks like. */
  code: string;
  /** What it actually identifies. */
  is: string;
  /** The code for the single unit somebody probably wanted. */
  insteadUse: string;
  /**
   * False when the source called it a candidate rather than a confirmed case.
   * Kept off the single tin either way — an unconfirmed case code is still not
   * evidence that it IS the tin.
   */
  confirmed: boolean;
}

export const WRONG_BARCODES: WrongBarcode[] = [
  {
    code: "050000504299",
    is: "case of Fancy Feast Petites Tender Beef tubs",
    insteadUse: "050000002603",
    confirmed: true,
  },
  {
    code: "050000503650",
    is: "case of Friskies Ocean Favorites Tuna pâté",
    insteadUse: "050000503636",
    confirmed: true,
  },
  {
    code: "050000579938",
    is: "24-can case of Friskies Shreds Turkey & Giblets",
    insteadUse: "050000579921",
    confirmed: true,
  },
  {
    code: "050000574537",
    is: "appears in Fancy Feast Medleys Turkey Primavera multipack listings",
    insteadUse: "050000574520",
    confirmed: false,
  },
  {
    code: "050000962617",
    is: "appears in Medleys Chicken Florentine Paté multipack listings",
    insteadUse: "050000962600",
    confirmed: false,
  },
  {
    code: "050000962655",
    is: "appears in Medleys Chicken Primavera Paté multipack listings",
    insteadUse: "050000962648",
    confirmed: false,
  },
  {
    code: "050000503292",
    is: "appears in 24-can listings for Medleys Wild Alaskan Salmon Velouté",
    insteadUse: "050000503285",
    confirmed: false,
  },
];

/**
 * Products that share a flavour name and are NOT each other.
 *
 * Both are seeded; the hazard is filing one's deck against the other's code.
 * Unlike the list above these are not codes to avoid — they are codes to keep
 * apart, which is a different instruction and needs a different shape.
 */
export const CONFUSABLE_PAIRS: { a: string; b: string; why: string }[] = [
  {
    a: "050000574582",
    b: "050000962648",
    why: "Fancy Feast Medleys White Meat Chicken Primavera exists twice: a silky broth with tender pieces, and a paté. Same flavour name, different texture, different formula.",
  },
];
