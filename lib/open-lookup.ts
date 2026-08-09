import { isUsableIngredients } from "./ingredients-text";

/**
 * Asking the open databases what they already know about a barcode.
 *
 * ── What this is for, which is not what it looks like ─────────────────────
 *
 * The obvious use — "fill our catalog in from Open Food Facts" — is the one
 * thing it must NOT be used for. The consumer app already falls back to the
 * open databases by itself when we hold nothing, so copying their answer into
 * our table adds no answer that wasn't already being given. What it would add
 * is harm: a frozen snapshot of somebody else's record, sitting at a higher
 * trust rank than the live one, blocking the fresher version from ever being
 * fetched again. Our catalog exists precisely because those lists are often
 * truncated or wrong; importing them wholesale would defeat it.
 *
 * What the answer is genuinely worth is a decision, taken in the shop, in two
 * seconds, before any photographs: is this product worth capturing at all?
 *
 *   - Nobody has it            → capture it. This is where our work counts.
 *   - Has it, list looks whole → the app can already answer this one. Move on,
 *                                unless the list looks wrong against the pack.
 *   - Has it, list is thin     → capture it. A stub is what we're here to fix.
 *
 * An afternoon spent photographing products the databases already describe
 * properly is an afternoon that bought nothing.
 */

/** The three open databases, in the order a product is likely to be in them. */
export const OPEN_SOURCES = [
  "openfoodfacts",
  "openpetfoodfacts",
  "openbeautyfacts",
] as const;

export type OpenSource = (typeof OPEN_SOURCES)[number];

export const OPEN_SOURCE_HOST: Record<OpenSource, string> = {
  openfoodfacts: "world.openfoodfacts.org",
  openpetfoodfacts: "world.openpetfoodfacts.org",
  openbeautyfacts: "world.openbeautyfacts.org",
};

export interface OpenHit {
  source: OpenSource;
  productName: string | null;
  brands: string | null;
  ingredientsText: string | null;
}

/**
 * The one hit worth showing, out of up to three.
 *
 * A product lives in one of these databases, but a barcode can turn up in two —
 * a cat treat listed in both the food and the pet-food set, say, one of them a
 * bare stub. Ranked by what is actually there: a usable ingredient list first,
 * because that is the only field that decides anything, then a name, then
 * whatever answered at all.
 */
export function pickOpenHit(hits: OpenHit[]): OpenHit | null {
  const withList = hits.filter((h) => isUsableIngredients(h.ingredientsText ?? ""));
  if (withList.length > 0) return byPriority(withList);
  const named = hits.filter((h) => (h.productName ?? "").trim().length > 0);
  if (named.length > 0) return byPriority(named);
  return hits.length > 0 ? byPriority(hits) : null;
}

function byPriority(hits: OpenHit[]): OpenHit {
  const order = (h: OpenHit) => OPEN_SOURCES.indexOf(h.source);
  return [...hits].sort((a, b) => order(a) - order(b))[0];
}

/**
 * How many things a comma-separated list names. The cheap check on a stub: a
 * kibble lists thirty to forty, so a stored list of four is a placeholder
 * somebody typed, not a composition.
 */
export function countItems(text: string | null): number {
  if (!text) return 0;
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/**
 * Below this, a list is a stub rather than a composition. Deliberately low —
 * a few real products genuinely list three or four things ("Water, Chicken,
 * Salt") and calling those incomplete would send somebody back to a shelf for
 * nothing. The number only has to catch "Chicken." standing in for a label.
 */
export const THIN_LIST_ITEMS = 3;

export type OpenVerdict = "nothing" | "thin" | "complete";

export interface OpenAssessment {
  verdict: OpenVerdict;
  /** True when capturing this product is the useful thing to do next. */
  worthCapturing: boolean;
  items: number;
  hasName: boolean;
}

export function assessOpenHit(hit: OpenHit | null): OpenAssessment {
  const items = countItems(hit?.ingredientsText ?? null);
  const hasName = (hit?.productName ?? "").trim().length > 0;
  const usable = isUsableIngredients(hit?.ingredientsText ?? "");
  if (!hit || !usable) {
    return { verdict: "nothing", worthCapturing: true, items, hasName };
  }
  if (items <= THIN_LIST_ITEMS) {
    return { verdict: "thin", worthCapturing: true, items, hasName };
  }
  return { verdict: "complete", worthCapturing: false, items, hasName };
}
