/**
 * The text half of a composition fingerprint — no crypto, so it may be
 * imported from anywhere.
 *
 * Split out of lib/composition-key.ts when lib/known-import.ts needed
 * `normalizeComposition` to compare two short ingredient lists. That module is
 * pulled into the browser by components/SeedImport.tsx, and composition-key
 * imports `node:crypto` to hash — so the import compiled, typechecked, passed
 * every test, and broke the production BUILD with an unhandled "node:" scheme.
 *
 * Copying the function here instead of moving it was the other option and the
 * worse one: two definitions of "what counts as the same ingredient list" is
 * exactly the drift that has already been fixed three times in this codebase.
 * One definition, no crypto, imported by both.
 */

/**
 * Reduce an ingredient list to its content.
 *
 * Everything that is formatting rather than substance goes: case, punctuation,
 * bracketing, the percentages some regions print and others don't. What
 * survives is the sequence of words, which is what two readings of the same
 * pack agree on.
 *
 * The ORDER is kept. Ingredient lists are printed by descending weight, so a
 * list with the same words in a different order is a different recipe — and
 * sorting them would call those two the same.
 */
export function normalizeComposition(text: string | null | undefined): string {
  return (text ?? "")
    .toLowerCase()
    // Percentages are printed on European packs and omitted on American ones
    // for the same recipe; keeping them would split one food in two.
    .replace(/\d+([.,]\d+)?\s*%/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** How many separate items the list names — commas, semicolons, bracketed groups. */
export function countIngredients(text: string | null | undefined): number {
  const raw = (text ?? "").trim();
  if (!raw) return 0;
  return raw
    .split(/[,;]|\band\b|\bи\b/i)
    .map((s) => s.replace(/[^\p{L}\p{N}]+/gu, " ").trim())
    .filter((s) => s.length > 1).length;
}

/**
 * The fingerprint, or null when this composition is too thin to ask about.
 *
 * Brand is part of it on purpose: two different makers can and do ship
 * identical short lists (a bag of oats is a bag of oats), and proposing to
 * merge them would be wrong every time.
 */
