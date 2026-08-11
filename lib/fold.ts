/**
 * Strip accents, as accents.
 *
 * ── Why this is its own module ────────────────────────────────────────────
 *
 * Every "reduce this text to something comparable" helper here does the same
 * two things: fold the accents, then throw away punctuation. The order matters
 * and getting it wrong is silent. A fold that runs `[^a-z0-9] → " "` FIRST
 * treats the accent as punctuation and turns "pâté" into "p t" — which will
 * never match anything, will never throw, and will simply make a dictionary
 * entry dead. That exact bug shipped once in `food-form.ts`, where the
 * accented spelling of pâté was in the word list and could not be reached.
 *
 * So the fold lives in one place, and anything that compares names calls it
 * before it starts deleting characters.
 *
 * ── Not `normalizeBrand` ──────────────────────────────────────────────────
 *
 * `composition-key.ts` has its own brand fold WITHOUT this step, and it stays
 * that way: it feeds a sha256 that is already stored in `composition_key` on
 * live rows and shared verbatim with the consumer app. Changing what it folds
 * would silently stop matching every fingerprint written before the change.
 */

/** Unicode combining marks — what an accent actually is once text is decomposed. */
const COMBINING = /[\u0300-\u036f]/g;

/** "Pâté" → "Pate", "Boréal" → "Boreal", "Nestlé" → "Nestle". Case is left alone. */
export function deaccent(text: string): string {
  return text.normalize("NFD").replace(COMBINING, "");
}

/**
 * A folded copy that can be searched on behalf of the original.
 *
 * For the case where a match has to be found in the folded text and then cut
 * out of the REAL text — matching "Pate" against a name printed "Pâté" and
 * keeping the rest of the name exactly as it was written.
 *
 * That only works while the two strings have the same characters in the same
 * positions. Almost all Latin text folds one-for-one, but a few sequences
 * decompose into marks with no precomposed form, and there the positions would
 * shift and the caller would cut the wrong characters out of somebody's
 * product name. So when the lengths disagree, `folded` is simply `source` and
 * the accents have to be typed exactly — a much smaller failure than a name
 * sliced in the wrong place.
 *
 * Callers slice `source`, never their own input: `source` is NFC-normalised
 * and may differ from what was passed in.
 */
export function alignedFold(text: string): { source: string; folded: string } {
  const source = text.normalize("NFC");
  const folded = deaccent(source);
  return { source, folded: folded.length === source.length ? folded : source };
}

/**
 * Text reduced to its words: accents folded, case dropped, everything that
 * isn't a letter or a digit turned into a single space.
 *
 * "Blue-Buffalo Co." → "blue buffalo co". "Nestlé Purina" → "nestle purina".
 *
 * ── Why this is not `normalizeBrand` ──────────────────────────────────────
 *
 * `composition-key.ts` has a fold that does the same job minus the accents,
 * and it deliberately stays where it is: that file is shared verbatim with the
 * consumer app and it imports `node:crypto`, so importing it here would drag
 * a Node built-in into a browser bundle — which is exactly how this function
 * came to exist. The two are independent by design. Nothing ever compares a
 * brand grouping key against a composition fingerprint, so they are allowed to
 * disagree, and on accents they already do, on purpose.
 */
export function foldWords(text: string | null | undefined): string {
  return deaccent(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
