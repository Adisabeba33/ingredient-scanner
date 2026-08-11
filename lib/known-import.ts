import { sourceRank } from "./barcode";

/**
 * What to do with a seeded formula when the catalog already holds the barcode.
 *
 * Pure, because this is the part that can quietly destroy work. The rule the
 * source document leads with is the right one — never silently overwrite a
 * formula — and it deserves to be readable and testable in one place rather
 * than spread through a route.
 */

export type ImportVerdict =
  /** Nothing there, or only an open-database row. Write it. */
  | "write"
  /** Byte-for-byte the composition we already hold. Nothing to do. */
  | "identical"
  /**
   * OUR OWN capture is there. Leave it alone.
   *
   * A verified row came from somebody photographing the actual pack. This came
   * from a retailer record. The photograph wins, always — that is what the
   * source ranking has meant since the catalog existed.
   */
  | "ours-is-better"
  /**
   * The barcode is held with a DIFFERENT composition, by a source of EQUAL
   * standing. Not an error, and not a licence to overwrite: one barcode
   * carrying two formulas is exactly the case the document warns about, and it
   * is real — Friskies Pâté Ocean Whitefish & Tuna has gone from 11% protein to
   * 9% under one UPC. Overwriting silently is how the evidence disappears.
   */
  | "conflict";

/**
 * What these rows are written as. See the import route for why not "verified".
 *
 * It matters here because the rank decides who may replace whom, and that
 * question is already settled in this codebase: verified (a photograph of the
 * pack) > community (a person's reading) > the open databases. Replacing an
 * Open Food Facts list with a better-sourced one is that ranking doing its job,
 * not an overwrite to be afraid of. The "never overwrite" rule is about EQUALS
 * — two community readings that disagree are two formulas, and picking one by
 * arrival order is how the other stops existing.
 */
const INCOMING_SOURCE = "community";

export interface ExistingRow {
  source: string | null;
  /** sha256 of brand + normalised composition. Null when too thin to fingerprint. */
  composition_key: string | null;
  ingredients_text: string | null;
}

/**
 * Decide, for one barcode.
 *
 * `force` turns a conflict into a write and nothing else: it never overrides
 * "ours is better", because no amount of insistence makes a retailer listing
 * more authoritative than a photograph of the tin.
 */
export function importVerdict(
  existing: ExistingRow | null | undefined,
  incomingKey: string | null,
  force = false
): ImportVerdict {
  if (!existing) return "write";
  if (existing.source === "verified") return "ours-is-better";

  const hasComposition = !!(existing.ingredients_text ?? "").trim();
  // A row holding a name and no ingredients is not a product — it is a shadow
  // over the open databases, and filling it in is the whole point.
  if (!hasComposition) return "write";

  // Both fingerprinted and equal — the same recipe, already stored.
  if (incomingKey && existing.composition_key === incomingKey) return "identical";

  // A worse-sourced list. Replacing it is what the ranking is for.
  if (sourceRank(existing.source) < sourceRank(INCOMING_SOURCE)) return "write";

  // Equal standing, different composition. Includes a stored list too thin to
  // fingerprint, which is still a list somebody put there.
  return force ? "write" : "conflict";
}

/** Human wording for the summary the operator reads. */
export function verdictLabel(verdict: ImportVerdict): string {
  if (verdict === "write") return "to write";
  if (verdict === "identical") return "already identical";
  if (verdict === "ours-is-better") return "ours is better — skipped";
  return "conflict — left alone";
}
