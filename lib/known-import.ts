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

/**
 * ── Identity-only packages ───────────────────────────────────────────────
 *
 * A seeded package with NO formula: we know the barcode, the brand, the range
 * and the flavour, and nothing about what is in the tin. The owner decided on
 * 8 October 2026 that these go into the catalog too, so the consumer app can
 * name the product when it is scanned, say its composition is still being
 * confirmed, and ask for a photograph of the label.
 *
 * ── Why `found: false` ────────────────────────────────────────────────────
 *
 * Because that is what the shared table already says about a code it can name
 * and cannot read. `reason = 'no-ingredients'` is a MISS reason (migration
 * 0005: "not-found | no-ingredients (miss only)"), and the consumer app's
 * lookup writes exactly this shape when an open database has a name and no
 * list. Everything downstream gates on `found`: the app's `isServableRow`, its
 * `holdsReading` (so a contribution OPENS the code rather than replacing a
 * reading — and still earns the discovery), its product page, pet catalog and
 * brand pages, and this tool's coverage page, which keeps the code on the list
 * of barcodes to go and find instead of calling it "photographed". A
 * `found: true` row with no list would be the one shape every one of those has
 * to special-case.
 *
 * What makes the row ours rather than a lookup miss is `source: 'community'` —
 * no other writer puts a source on a `found: false` row — and that is what the
 * consumer app reads to keep it from being overwritten by a poorer miss.
 */
export type IdentityVerdict =
  /** Nothing under the code. Inserted, and only if still nothing is there. */
  | "write"
  /**
   * A row that holds nothing anybody read: a lookup miss (perhaps with an
   * open database's name for the product), or our own earlier identity row
   * that the seed has since corrected. Updated in place, guarded so it can
   * only land on a row that is still empty.
   */
  | "replace"
  /** Our identity row, saying exactly what the seed says. Nothing to do. */
  | "identical"
  /**
   * Anything else — a reading, a product row of any source, a box, our own
   * photograph. An identity row asserts LESS than any of them, so it never
   * replaces one. The seed keeps the code on the coverage page either way.
   */
  | "held";

/** The columns `identityVerdict` needs from the stored row. */
export interface ExistingIdentityRow {
  found: boolean | null;
  source: string | null;
  reason: string | null;
  ingredients_text: string | null;
  mode?: string | null;
  product_name?: string | null;
  brands?: string | null;
  species?: string | null;
  food_form?: string | null;
}

/** What the seed knows about one identity-only package. */
export interface IdentityFields {
  productName: string;
  brands: string;
  species: string;
  /** The seed's own value, passed through untouched — see lib/food-form.ts. */
  foodForm: string;
}

/**
 * Is this one of OUR identity rows — a code we name and cannot yet read?
 *
 * `found` is optional so a caller that already filtered on it (the misses
 * list selects `found = false`) need not select it again; only an explicit
 * `true` disqualifies.
 */
export function isIdentityRow(row: {
  found?: boolean | null;
  source?: string | null;
  reason?: string | null;
  ingredients_text?: string | null;
} | null | undefined): boolean {
  if (!row || row.found === true) return false;
  if (row.reason !== "no-ingredients") return false;
  if ((row.ingredients_text ?? "").trim()) return false;
  return sourceRank(row.source) >= sourceRank(INCOMING_SOURCE);
}

/**
 * Decide, for one identity-only package.
 *
 * Narrower than `importVerdict` on purpose: a formula may replace a worse
 * READING, because it is a better one. An identity row is not a reading at
 * all, so the only things it may land on are rows that hold none.
 */
export function identityVerdict(
  existing: ExistingIdentityRow | null | undefined,
  incoming: IdentityFields
): IdentityVerdict {
  if (!existing) return "write";
  // A box. Its row is a decision somebody made about the code; see
  // multipackVerdict. (No seeded package shares a box's code — a test says
  // so — but the rule should not depend on that.)
  if (existing.reason === "multipack") return "held";
  // A product row, whoever wrote it — including our own photograph of a pack
  // whose list is still to be typed, which is found and verified.
  if (existing.found === true) return "held";
  // Any text at all under the code is somebody's, even on a miss row.
  if ((existing.ingredients_text ?? "").trim()) return "held";

  const rank = sourceRank(existing.source);
  // Our own photograph, or anything else ranked above us.
  if (rank > sourceRank(INCOMING_SOURCE)) return "held";
  if (rank === sourceRank(INCOMING_SOURCE)) {
    // A community row that is not an identity row is not ours to reshape.
    if (!isIdentityRow(existing)) return "held";
    return sameIdentity(existing, incoming) ? "identical" : "replace";
  }
  // A lookup miss: no reader, nothing read. Naming it is strictly more.
  return "replace";
}

function sameIdentity(existing: ExistingIdentityRow, incoming: IdentityFields): boolean {
  return (
    existing.mode === "pet" &&
    (existing.product_name ?? "") === incoming.productName &&
    (existing.brands ?? "") === incoming.brands &&
    (existing.species ?? "") === incoming.species &&
    (existing.food_form ?? "") === incoming.foodForm
  );
}

/** Human wording for the identity summary the operator reads. */
export function identityLabel(verdict: IdentityVerdict): string {
  if (verdict === "write") return "new";
  if (verdict === "replace") return "over an empty lookup row";
  if (verdict === "identical") return "already written";
  return "left alone — a reading or a product is there";
}

/**
 * An identity row nobody has scanned yet — not a miss anybody suffered.
 *
 * The misses list reads every `found = false` row as "somebody looked for this
 * and went away with nothing". An identity row written by the import is
 * `found = false` too, and hundreds of them nobody has ever reached for would
 * bury the ones people did. The consumer app stamps `last_hit_at` each time it
 * answers a scan from one, so a row with that stamp is a real, wanted product
 * whose label is still to read — exactly what the list is for — and a row
 * without it is only the seed, which the coverage page already shows.
 *
 * `hitColumns` is false on a catalog too old to have `last_hit_at`; then there
 * is no way to tell, and the identity rows are left to the coverage page.
 */
export function isUnscannedIdentityRow(
  row: Parameters<typeof isIdentityRow>[0] & { last_hit_at?: string | null },
  hitColumns: boolean
): boolean {
  if (!isIdentityRow(row)) return false;
  return !hitColumns || !row?.last_hit_at;
}
