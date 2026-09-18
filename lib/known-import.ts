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
  | "conflict"
  /**
   * Our own capture is there, it holds the SAME recipe, and it has no
   * guaranteed analysis. The seeded panel fills that gap and nothing else.
   *
   * ── Why this is not an overwrite ──────────────────────────────────────
   *
   * Because there is nothing under it. "Ours is better" is a statement about
   * two readings of the same thing, and a photograph that never caught the
   * panel is not a reading of the panel — it is an absence, and this codebase's
   * rule about absences is that they are never treated as data. The
   * alternative is what the catalog actually did: sixteen products
   * photographed before the scanner read panels kept rows with no figures at
   * all, and their reports were poorer than the ones beside them, forever,
   * with nothing on any screen explaining why.
   *
   * ── Why it demands the same recipe ────────────────────────────────────
   *
   * A panel belongs to a formula, not to a barcode. If the photographed list
   * and the seeded list differ, then either the pack was reformulated or one
   * of the two readings is wrong — and in both cases lending the seeded
   * figures to the photographed ingredients would staple one product's
   * numbers onto another product's composition. That is worse than an empty
   * panel, because an empty panel is visibly empty. So this verdict requires
   * the compositions to match, by fingerprint or, for a list too short to
   * fingerprint, letter for letter.
   *
   * The ingredients, the source and the composition key are never touched.
   * The photograph still wins everything it actually captured.
   */
  | "panel-only";

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
  /**
   * Whether the stored row carries any guaranteed-analysis figure at all.
   *
   * Optional so every existing caller keeps working, and `undefined` is read
   * as "not asked" rather than as "no panel" — a caller that does not select
   * the column must not thereby make every photographed row eligible for a
   * panel write.
   */
  hasPanel?: boolean | null;
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

  const hasComposition = !!(existing.ingredients_text ?? "").trim();

  // Is this the same recipe we are offering?
  //
  // Both fingerprinted and equal is the ordinary answer. The second form is
  // for a list too short to fingerprint: `compositionKey` declines to answer
  // for a composition under five ingredients, which is not a defect but a fact
  // about short lists. Ziwi Peak's chews are exactly that — a lamb trachea's
  // whole ingredient list is "Lamb Trachea". Without this the importer wrote
  // those eight rows and then, on every later run, reported them as conflicts
  // against themselves: a permanent false alarm, and the kind that teaches an
  // operator to stop reading the conflict count.
  const sameRecipe =
    hasComposition &&
    ((incomingKey != null && existing.composition_key === incomingKey) ||
      (!incomingKey &&
        incomingText != null &&
        normalizeComposition(existing.ingredients_text) ===
          normalizeComposition(incomingText)));

  // Our own photograph. It keeps everything it captured — but a panel it never
  // captured is an absence, not a reading, and the seed can fill it when the
  // two lists agree that this is one recipe. See "panel-only" above.
  if (existing.source === "verified") {
    return hasComposition && sameRecipe && existing.hasPanel === false
      ? "panel-only"
      : "ours-is-better";
  }

  // A row holding a name and no ingredients is not a product — it is a shadow
  // over the open databases, and filling it in is the whole point.
  if (!hasComposition) return "write";

  if (sameRecipe) return "identical";

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

/**
 * Rows where the two compositions disagree and only a person can settle it.
 *
 * A `conflict` is the obvious one: two readings of equal standing, and the
 * whole reason this module refuses to pick. The other is our own photograph
 * with NO panel and a list that does not match the seed. The panel fill cannot
 * help that row — the seeded figures might belong to the other formula — and
 * for a long time the only thing the screen could say about it was "re-shoot
 * the tin", about a tin the operator may have photographed a year ago and no
 * longer owns.
 *
 * Being unable to decide automatically is not the same as there being nothing
 * to decide. This names the rows worth putting in front of somebody, with both
 * lists, and it is deliberately narrow: nothing that is already identical,
 * already written, or waiting to be written appears here, so the adoption
 * endpoint can refuse every code this does not return true for.
 */
export function needsADecision(d: {
  verdict: ImportVerdict;
  heldPanel: boolean | null;
}): boolean {
  if (d.verdict === "conflict") return true;
  return d.verdict === "ours-is-better" && d.heldPanel === false;
}

/** Human wording for the summary the operator reads. */
export function verdictLabel(verdict: ImportVerdict): string {
  if (verdict === "write") return "to write";
  if (verdict === "identical") return "already identical";
  if (verdict === "ours-is-better") return "ours is better — skipped";
  if (verdict === "panel-only") return "our photo kept, panel filled in";
  return "conflict — left alone";
}
