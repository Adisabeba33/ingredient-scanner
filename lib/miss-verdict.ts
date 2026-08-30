import { canonicalBarcode } from "./barcode";
import { isValidGtin, underGs1Prefix } from "./known-products";
import { GS1_PREFIXES } from "../data/gs1-prefixes";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_MULTIPACKS } from "../data/known-multipacks";
import { WRONG_BARCODES } from "../data/wrong-barcodes";

/**
 * "I scanned it in a shop and it said add a barcode. Do we have it or not?"
 *
 * ── The gap this closes ───────────────────────────────────────────────────
 *
 * Every failed lookup already writes a row: `barcode_cache` gets `found =
 * false` and `hits` counts every later person who walked away with nothing.
 * That has been true since the catalog existed. What has never been true is
 * that anybody could SEE it. `/api/coverage` skips those rows outright — one
 * line, `if (row.found === false) continue;` — because the coverage page is
 * about what we hold, and a miss is not that.
 *
 * So the most useful list in the database was the one nothing printed: the
 * products shoppers actually reached for, in the order they reached for them.
 *
 * ── Why a miss needs a VERDICT rather than just a listing ─────────────────
 *
 * Because "we don't have it" and "we have it and never wrote it" look
 * identical from a shop aisle, and they need opposite work. The seed lives in
 * git; the catalog is a database; nothing moves between them until somebody
 * presses "Write N to the catalog". A range seeded last week and not yet
 * imported reads to a shopper exactly like a range nobody has researched — and
 * one of those is fixed by a button press and the other by a week of work.
 *
 * Everything here is answered from files, without asking the network anything.
 */

export type MissVerdict =
  /**
   * We hold this barcode AND a composition for it. The catalog does not,
   * which means the import has not been run since it was seeded. One press.
   */
  | "seeded-not-imported"
  /**
   * Seeded as identity only — a barcode to go and find, with no ingredient
   * list yet. Working as intended; it is on the shopping list already.
   */
  | "seeded-no-formula"
  /**
   * A box. If the app said "not found" rather than "that's the case, scan a
   * tin", the multipack row has not been written yet either.
   */
  | "known-multipack"
  /** data/wrong-barcodes.ts already says what this is — a case, or a twin. */
  | "known-wrong-barcode"
  /**
   * A maker we seed, a code we do not hold. The honest answer, and the one
   * that makes this list a research queue rather than a bug report.
   */
  | "absent-known-maker"
  /** Not a maker we have ever seeded. */
  | "absent-unknown-maker"
  /**
   * The digits do not form a real barcode. Almost always a misread rather
   * than a product — worth separating so it does not pad the queue.
   */
  | "not-a-barcode";

export interface MissClassification {
  verdict: MissVerdict;
  /** Whose GS1 prefix it sits under, where we know. */
  maker: string | null;
  /** What we hold under this code, where we hold anything. */
  seededAs: string | null;
  /** What `data/wrong-barcodes.ts` says it is, and what to scan instead. */
  insteadOf: string | null;
  insteadUse: string | null;
}

/** Built once: the seed is a module, not a query. */
const seededByCode = new Map<string, { name: string; hasFormula: boolean }>();
for (const product of KNOWN_PRODUCTS) {
  for (const pkg of product.packages) {
    seededByCode.set(canonicalBarcode(pkg.upc), {
      name: `${product.brand} ${product.line} ${product.variant} — ${pkg.size}`,
      hasFormula: !!KNOWN_FORMULAS[pkg.upc],
    });
  }
}

const boxByCode = new Map<string, string>();
for (const box of KNOWN_MULTIPACKS) {
  boxByCode.set(
    canonicalBarcode(box.upc),
    `${box.brand} ${box.line} ${box.variant} — ${box.size}`
  );
}

const wrongByCode = new Map<string, { is: string; insteadUse: string | null }>();
for (const wrong of WRONG_BARCODES) {
  wrongByCode.set(canonicalBarcode(wrong.code), {
    is: wrong.is,
    insteadUse: wrong.insteadUse ?? null,
  });
}

function makerOf(code: string): string | null {
  return GS1_PREFIXES.find((g) => underGs1Prefix(code, g.prefix))?.maker ?? null;
}

/**
 * Classify one code somebody looked for and did not get.
 *
 * `printed` is the code as scanned; it is canonicalised here, so a row stored
 * as a GTIN-14 and a seed entry written as a UPC-A meet correctly.
 */
export function classifyMiss(printed: string): MissClassification {
  const digits = printed.replace(/\D+/g, "");
  const key = canonicalBarcode(digits);
  const maker = makerOf(digits);

  const base = { maker, seededAs: null, insteadOf: null, insteadUse: null };

  // Asked FIRST, before "do we hold it": a code whose check digit fails is a
  // misread of some other code, and reporting it as an absent product would
  // put a phantom at the top of the research queue every time a camera
  // stumbles in bad light.
  if (!isValidGtin(digits)) return { ...base, verdict: "not-a-barcode" };

  const wrong = wrongByCode.get(key);
  if (wrong) {
    return {
      ...base,
      verdict: "known-wrong-barcode",
      insteadOf: wrong.is,
      insteadUse: wrong.insteadUse,
    };
  }

  const box = boxByCode.get(key);
  if (box) return { ...base, verdict: "known-multipack", seededAs: box };

  const seeded = seededByCode.get(key);
  if (seeded) {
    return {
      ...base,
      verdict: seeded.hasFormula ? "seeded-not-imported" : "seeded-no-formula",
      seededAs: seeded.name,
    };
  }

  return {
    ...base,
    verdict: maker ? "absent-known-maker" : "absent-unknown-maker",
  };
}

/**
 * The code as it is printed under the bars, undone from its storage form.
 *
 * The catalog keys everything as a GTIN-14 — `canonicalBarcode` pads — so a
 * Fancy Feast tin is stored "00050000577989" and reads that way on any screen
 * that prints the key. That is right for a database and wrong for a person:
 * "050000577989" is what is on the tin, what a retailer search box wants, and
 * what a research brief has to say. Two leading zeros are enough to make a
 * pasted code find nothing.
 *
 * Only a 14-digit key is unpadded, and never below twelve digits, because
 * UPC-A is twelve and EAN-13 is thirteen — an EAN-8 stored as eight is already
 * printed form and must be left alone.
 */
export function printedForm(code: string): string {
  const digits = code.replace(/\D+/g, "");
  if (digits.length !== 14) return digits;
  const bare = digits.replace(/^0+/, "");
  return bare.length < 12 ? bare.padStart(12, "0") : bare;
}

/** Human wording, for the desk. */
export function missLabel(verdict: MissVerdict): string {
  if (verdict === "seeded-not-imported") return "we hold it — not written to the catalog";
  if (verdict === "seeded-no-formula") return "seeded as a barcode to find, no ingredients yet";
  if (verdict === "known-multipack") return "a variety pack — mark it, don't capture it";
  if (verdict === "known-wrong-barcode") return "a case or a twin — see data/wrong-barcodes.ts";
  if (verdict === "absent-known-maker") return "genuinely absent — maker we seed";
  if (verdict === "absent-unknown-maker") return "genuinely absent — maker we've never seeded";
  return "not a valid barcode — probably a misread";
}

/**
 * What to do about them, in the order it is worth doing.
 *
 * The point of the ordering is that the first bucket is free. If shoppers are
 * missing products we already hold a composition for, no research is needed at
 * all — the work is one button on the desk, and until somebody looks at this
 * list nobody has any way to know.
 */
export const MISS_ORDER: MissVerdict[] = [
  "seeded-not-imported",
  "known-multipack",
  "seeded-no-formula",
  "absent-known-maker",
  "absent-unknown-maker",
  "known-wrong-barcode",
  "not-a-barcode",
];
