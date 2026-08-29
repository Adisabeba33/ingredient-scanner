import { canonicalBarcode } from "./barcode";
import { KNOWN_PRODUCTS, type KnownProduct } from "../data/known-products";

/**
 * The seeded product list, indexed the two ways it gets used.
 *
 * By BARCODE, so a scan in a shop can name the tin before any photograph is
 * taken or any model is called — and so the coverage page can tell "we have
 * done this one" from "we know it exists".
 *
 * And FLATTENED, one entry per recipe, so the coverage page can list what is
 * left to find inside a range instead of showing an empty dashed outline.
 *
 * Nothing here is written to the catalog. See data/known-products.ts for why
 * that would make the products worse rather than better.
 */

/** One recipe, with every barcode it is sold under. */
export interface KnownItem {
  brand: string;
  line: string;
  variant: string;
  species: "cat" | "dog";
  texture: string;
  presentation: string;
  foodForm: string;
  proteins: string[];
  /** Canonical (GTIN-14) keys — what the catalog stores and looks up under. */
  codes: string[];
  /** As printed under the bars, for showing to a person. */
  printedCodes: string[];
  /** "3 oz", "5.5 oz" — parallel to `codes`. */
  sizes: string[];
}

/**
 * The UPC-A check digit.
 *
 * Worth having in the code rather than only in a note: it is the one property
 * of a barcode that can be checked without a shop, a network or a shelf, and a
 * transposed pair of digits — the likeliest way a hand-copied number goes wrong
 * — fails it nine times in ten. The test over data/known-products.ts runs this
 * against every row, so a bad number is caught here and not in an aisle.
 */
export function upcCheckDigit(code: string): number {
  const digits = code.replace(/\D+/g, "").slice(0, 11);
  let total = 0;
  for (let i = 0; i < digits.length; i += 1) {
    total += Number(digits[i]) * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (total % 10)) % 10;
}

/** Is this a well-formed 12-digit UPC-A? */
export function isValidUpcA(code: string): boolean {
  const digits = code.replace(/\D+/g, "");
  if (digits.length !== 12) return false;
  return Number(digits[11]) === upcCheckDigit(digits);
}

/**
 * The check digit of any GTIN — EAN-8, UPC-A, EAN-13 or GTIN-14.
 *
 * ONE rule covers all four lengths: weight the digits 3,1,3,1… from the right
 * of the body, and the check digit is what takes the total to the next
 * multiple of ten. `upcCheckDigit` above is that rule with the length written
 * into it, which was fine while every product in the seed was American.
 *
 * Ziwi Peak is not. It is a New Zealand maker and its packs carry EAN-13
 * (9421016…), so the twelve-digit assumption stopped being a property of
 * barcodes and became a property of the shelf we happened to have shopped.
 * Everything that guards the seed now asks THIS question instead, and the
 * function above stays exactly as narrow as its name claims.
 */
export function gtinCheckDigit(body: string): number {
  const digits = body.replace(/\D+/g, "");
  let total = 0;
  for (let i = 0; i < digits.length; i += 1) {
    // From the RIGHT, so the alternation lands correctly at any length.
    const fromRight = digits.length - 1 - i;
    total += Number(digits[i]) * (fromRight % 2 === 0 ? 3 : 1);
  }
  return (10 - (total % 10)) % 10;
}

/** The lengths a real retail barcode comes in. */
const GTIN_LENGTHS = new Set([8, 12, 13, 14]);

/** Is this a well-formed barcode of any GTIN length? */
export function isValidGtin(code: string): boolean {
  const digits = code.replace(/\D+/g, "");
  if (!GTIN_LENGTHS.has(digits.length)) return false;
  return (
    Number(digits[digits.length - 1]) ===
    gtinCheckDigit(digits.slice(0, digits.length - 1))
  );
}

/**
 * The part of a barcode the GS1 company prefix is read from.
 *
 * A GTIN-14 whose first digit is 1–8 is not a different company's code — it is
 * a PACKAGING LEVEL of the code beneath it. "10818336014311" is the inner pack
 * of "0818336014311" and "20818336014311" is the case, and all three belong to
 * the same maker. Matching a prefix against the raw digits reads that indicator
 * as part of the company's number and answers "belongs to no maker we have
 * seeded" about a barcode printed by a maker we just seeded a hundred products
 * from.
 *
 * So both askers — `scripts/check-batch.mjs` and the test below — normalise
 * first: pad to fourteen, drop the indicator, and compare on the thirteen
 * digits that are left. A UPC-A's six-digit prefix then sits one zero in
 * ("0818336…"), which is why the match allows a leading zero rather than
 * demanding the caller write the padding into `data/gs1-prefixes.ts`. An
 * EAN-13's prefix starts at the front and matches directly.
 */
export function gs1Body(code: string): string {
  return code.replace(/\D+/g, "").padStart(14, "0").slice(1);
}

/** Does this barcode sit under `prefix`, whatever packaging level it is? */
export function underGs1Prefix(code: string, prefix: string): boolean {
  const body = gs1Body(code);
  return body.startsWith(prefix) || body.startsWith(`0${prefix}`);
}

function toItem(product: KnownProduct): KnownItem {
  return {
    brand: product.brand,
    line: product.line,
    variant: product.variant,
    species: product.species,
    texture: product.texture,
    presentation: product.presentation,
    foodForm: product.foodForm,
    proteins: product.proteins,
    codes: product.packages.map((p) => canonicalBarcode(p.upc)),
    printedCodes: product.packages.map((p) => p.upc),
    sizes: product.packages.map((p) => p.size),
  };
}

const ITEMS: KnownItem[] = KNOWN_PRODUCTS.map(toItem);

const BY_CODE = new Map<string, KnownItem>();
for (const item of ITEMS) {
  for (const code of item.codes) BY_CODE.set(code, item);
}

/** Every seeded recipe. */
export function knownItems(): KnownItem[] {
  return ITEMS;
}

/**
 * What we believe this barcode is, before anybody photographs it.
 *
 * A LEAD, not a fact. The source is retailer listings, which can pair a right
 * UPC with a wrong flavour, so this names a product on screen and pre-fills a
 * form — it never writes itself into the catalog. The pack in the operator's
 * hand settles what the product actually is.
 */
export function lookupKnown(code: string | null | undefined): KnownItem | null {
  if (!code) return null;
  return BY_CODE.get(canonicalBarcode(code)) ?? null;
}

/** How many seeded products there are, for a line of copy. */
export function knownCount(): number {
  return ITEMS.length;
}
