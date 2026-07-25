/**
 * Is this stored text a real composition?
 *
 * Guards against a stub — an empty read, or a placeholder the model emitted
 * because it couldn't see the list — WITHOUT rejecting the many products whose
 * ingredient list is genuinely one short item: "Black Tea", "Water", "Salt",
 * "Honey", "Olive Oil". An earlier 12-character floor treated those as
 * unreadable and refused to store them, which is exactly backwards: a
 * single-ingredient label is the easiest kind to trust.
 *
 * Length alone can't tell a stub from a short truth, so the check is: some real
 * content, and not one of the placeholder strings that mean "nothing here".
 */

/** Values that mean "no list", however the model phrased it. */
const PLACEHOLDERS = new Set([
  "n/a",
  "na",
  "none",
  "no ingredients",
  "not listed",
  "not visible",
  "unknown",
  "unreadable",
  "-",
  "--",
  ".",
  "...",
  "?",
]);

/** Shortest plausible ingredient name ("egg", "oat", "rye", "tea"). */
export const MIN_INGREDIENTS_LENGTH = 3;

export function normalizeIngredients(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function isUsableIngredients(raw: string | null | undefined): boolean {
  const text = normalizeIngredients(raw ?? "");
  if (text.length < MIN_INGREDIENTS_LENGTH) return false;
  if (PLACEHOLDERS.has(text.toLowerCase())) return false;
  // A run of punctuation isn't a composition.
  if (!/[a-z0-9]/i.test(text)) return false;
  return true;
}
