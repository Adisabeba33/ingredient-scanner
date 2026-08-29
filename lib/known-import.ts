import { sourceRank } from "./barcode";
import { normalizeComposition } from "./composition-text";

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
  force = false,
  /**
   * The composition we are offering, for the case the fingerprint cannot
   * settle. Optional so every existing caller keeps working; passing it is
   * what lets an unfingerprintable row be recognised as already ours.
   */
  incomingText?: string | null
): ImportVerdict {
  if (!existing) return "write";
  if (existing.source === "verified") return "ours-is-better";

  const hasComposition = !!(existing.ingredients_text ?? "").trim();
  // A row holding a name and no ingredients is not a product — it is a shadow
  // over the open databases, and filling it in is the whole point.
  if (!hasComposition) return "write";

  // Both fingerprinted and equal — the same recipe, already stored.
  if (incomingKey && existing.composition_key === incomingKey) return "identical";

  // Neither could be fingerprinted, so compare the lists themselves.
  //
  // A fingerprint is a cheap way to ask "same recipe?", and it declines to
  // answer for a composition under five ingredients — which is not a defect
  // but a fact about short lists. Ziwi Peak's chews are exactly that: a lamb
  // trachea's whole ingredient list is "Lamb Trachea". Without this the
  // importer wrote those eight rows and then, on every later run, reported
  // them as conflicts against themselves — a permanent false alarm, and the
  // kind that teaches an operator to stop reading the conflict count.
  if (
    !incomingKey &&
    incomingText != null &&
    normalizeComposition(existing.ingredients_text) ===
      normalizeComposition(incomingText)
  ) {
    return "identical";
  }

  // A worse-sourced list. Replacing it is what the ranking is for.
  if (sourceRank(existing.source) < sourceRank(INCOMING_SOURCE)) return "write";

  // Equal standing, different composition. Still includes a stored list too
  // thin to fingerprint whose TEXT differs from ours — that is a real
  // disagreement about a short list, and it wants a person.
  return force ? "write" : "conflict";
}

/**
 * The same decision for a BOX, which is a different question.
 *
 * A multipack row asserts an absence — this code names no food — so there is no
 * composition to compare and the three interesting states are: it is not marked
 * yet, it is marked and we have nothing to add, or something else is under the
 * code.
 *
 * ── Why it refuses a stored reading whatever its source ───────────────────
 *
 * `app/api/multipack/route.ts` already answers this for an operator standing in
 * a shop with the box in their hands, and it refuses on `found &&
 * ingredients_text` without asking who wrote it. This agrees with it on
 * purpose. The two paths write the same row into the same column for the same
 * reason, and the day they disagree is the day marking a box by hand and
 * marking it from the seed stop meaning the same thing.
 *
 * The refusal is also the right answer on its own terms. A code holding a real
 * ingredient list is either genuinely a product — in which case calling it a
 * box would make the capture route bounce every future scan of it, and nobody
 * would be able to see why — or somebody photographed the back of the carton,
 * which is the mistake this whole mechanism exists to prevent and which
 * deserves a correction rather than a silent overwrite.
 *
 * ── Why re-marking an already-marked box is a `write` and not `identical` ──
 *
 * Coming back to add member codes once the tins have been read is the normal
 * second visit. `identical` is reserved for the case where there is genuinely
 * nothing to add: already marked, and offering no member the row does not
 * already hold.
 */
export interface ExistingBoxRow {
  found: boolean | null;
  reason: string | null;
  ingredients_text: string | null;
  contains: string[] | null;
}

export function multipackVerdict(
  existing: ExistingBoxRow | null | undefined,
  /** The members we are offering, canonicalised by the caller. */
  incoming: string[]
): ImportVerdict {
  if (!existing) return "write";

  if (existing.reason === "multipack") {
    const held = new Set(existing.contains ?? []);
    return incoming.some((code) => !held.has(code)) ? "write" : "identical";
  }

  // Somebody's reading is under this code. Never walked over — see above.
  if (existing.found && (existing.ingredients_text ?? "").trim()) return "conflict";

  // A row with no composition is a shadow over the open databases, which is
  // the state marking the box is meant to end.
  return "write";
}

/** Human wording for the summary the operator reads. */
export function verdictLabel(verdict: ImportVerdict): string {
  if (verdict === "write") return "to write";
  if (verdict === "identical") return "already identical";
  if (verdict === "ours-is-better") return "ours is better — skipped";
  return "conflict — left alone";
}
