import { foldWords } from "./fold";
// Relative, not "@/": the tests run under vitest, which has no path aliases —
// the same reason every other module in lib/ imports its neighbours this way.
import { US_PET_BRANDS, type SeedBrand } from "../data/us-pet-brands";

/**
 * One brand, however it was written.
 *
 * ── The problem ───────────────────────────────────────────────────────────
 *
 * The same maker reaches us spelled four ways. A model reading the front of a
 * tin writes "Purina Friskies", because that is what is printed. Open Food
 * Facts holds "Friskies", or "friskies,purina", or "PURINA". Somebody typing
 * at a desk writes "Purina Friskies Cat Food". A coverage page that groups by
 * the raw string shows four brands with a quarter of the products each — which
 * is worse than no page at all, because it says "you haven't done Friskies"
 * about a brand you have done thirty of.
 *
 * So every brand string is reduced to a KEY, and everything sharing a key is
 * one row on the shelf.
 *
 * ── How a key is chosen ───────────────────────────────────────────────────
 *
 * 1. Normalise: accents fold to their plain letters, then case, punctuation and
 *    spacing go. "Blue-Buffalo Co." → "blue buffalo co", "Nestlé" → "nestle".
 * 2. Exact match against a seeded brand's name or one of its aliases. This is
 *    where "purina pro plan" lands on Pro Plan rather than on Purina.
 * 3. Failing that, the LONGEST seeded name that appears inside it as whole
 *    words. "purina friskies cat food" contains both "purina" (one word) and
 *    "friskies" (one word) — a tie broken by length, and in the awkward cases
 *    by specificity: "purina fancy feast" contains "fancy feast" (two words),
 *    which beats "purina" outright. This is the rule that survives the model
 *    prefixing the parent company onto everything.
 * 4. No seeded brand at all: the normalised string is its own key, and the
 *    brand exists from that moment as a brand nobody seeded. That is the point
 *    — the shelf is allowed to teach us brands the list never knew.
 *
 * ── What it deliberately does not do ──────────────────────────────────────
 *
 * Fuzzy matching. An edit-distance match would fold "Nature's Recipe" into
 * "Nature's Variety" — two different companies — and the operator would have no
 * way of seeing it had happened. Everything here is exact or whole-word
 * containment, so a wrong fold can only come from a wrong alias in the seed
 * file, where it can be read and fixed.
 */

/**
 * The fold every key here is built on.
 *
 * Accents come off as accents rather than as punctuation — a fold that skips
 * that step turns "Nestlé" into "nestl", so typing "nestle" finds nothing and
 * "Boréal" never meets its own alias. See lib/fold.ts for why this does not
 * reuse the composition fingerprint's fold: that one imports `node:crypto` and
 * this module runs in the browser.
 */
const foldName = foldWords;

/** A brand as the coverage page knows it. */
export interface BrandIdentity {
  /** Stable grouping key. Normalised, so safe as an object key or a URL slug. */
  key: string;
  /** How to write it on screen. */
  name: string;
  /** Parent company, when it came from the seed list. */
  owner: string | null;
  species: "cat" | "dog" | "both" | null;
  /** Ranges we expect this brand to have. Empty for a brand off the shelf. */
  lines: string[];
  /** Whether this brand was in the seed file, or arrived from a scan. */
  seeded: boolean;
  /** The shelf-family, where several brands share a house name ("Hill's"). */
  family: string | null;
}

/** The key a seeded brand is filed under: its own normalised name. */
export function seedKey(brand: SeedBrand): string {
  return foldName(brand.name);
}

interface Index {
  /** Every exact spelling — names and aliases — pointing at a seed. */
  exact: Map<string, SeedBrand>;
  /**
   * The same spellings, sorted so the most specific is tried first. Sorting
   * once here is what keeps `brandKey` cheap enough to call per catalog row.
   */
  contained: { text: string; words: number; brand: SeedBrand }[];
  byKey: Map<string, SeedBrand>;
}

function buildIndex(brands: SeedBrand[]): Index {
  const exact = new Map<string, SeedBrand>();
  const contained: Index["contained"] = [];
  const byKey = new Map<string, SeedBrand>();
  for (const brand of brands) {
    byKey.set(seedKey(brand), brand);
    for (const spelling of [brand.name, ...(brand.aliases ?? [])]) {
      const text = foldName(spelling);
      if (!text) continue;
      // First writing wins, so a name is never shadowed by another brand's
      // alias — an alias collision is a mistake in the seed file, and this
      // makes it show up as one brand swallowing another rather than silently
      // reversing depending on array order.
      if (!exact.has(text)) exact.set(text, brand);
      contained.push({ text, words: text.split(" ").length, brand });
    }
  }
  // Most words first, then longest — "fancy feast" before "purina", and
  // "purina one" before "purina".
  contained.sort((a, b) => b.words - a.words || b.text.length - a.text.length);
  return { exact, contained, byKey };
}

const INDEX = buildIndex(US_PET_BRANDS);

/** Does `needle` appear in `haystack` as whole words? Both already normalised. */
function containsWords(haystack: string, needle: string): boolean {
  if (haystack === needle) return true;
  const at = ` ${haystack} `.indexOf(` ${needle} `);
  return at !== -1;
}

/**
 * The seeded brand a raw string belongs to, or null when nothing matches.
 *
 * Exported so the tests can state the two rules separately from the identity
 * they produce.
 */
export function matchSeedBrand(raw: string | null | undefined): SeedBrand | null {
  const text = foldName(raw);
  if (!text) return null;
  const exact = INDEX.exact.get(text);
  if (exact) return exact;
  for (const candidate of INDEX.contained) {
    if (containsWords(text, candidate.text)) return candidate.brand;
  }
  return null;
}

/**
 * Everything the coverage page needs about a brand string.
 *
 * Returns null only for an empty string — a product with no brand at all,
 * which belongs in its own "no brand" bucket rather than being forced under
 * somebody's name.
 */
export function brandIdentity(
  raw: string | null | undefined
): BrandIdentity | null {
  const text = foldName(raw);
  if (!text) return null;
  const seed = matchSeedBrand(text);
  if (seed) {
    return {
      key: seedKey(seed),
      name: seed.name,
      owner: seed.owner,
      species: seed.species,
      lines: seed.lines ?? [],
      seeded: true,
      family: seed.family ?? null,
    };
  }
  return {
    key: text,
    // Shown as it was typed rather than as it was normalised: "Ol' Roy" reads
    // better than "ol roy", and an unseeded brand's only source of spelling is
    // whoever wrote it.
    name: (raw ?? "").trim(),
    owner: null,
    species: null,
    lines: [],
    seeded: false,
    family: null,
  };
}

/** Just the grouping key. */
export function brandKey(raw: string | null | undefined): string {
  return brandIdentity(raw)?.key ?? "";
}

/** Every seeded brand as an identity, for the brands nothing has been scanned under. */
export function seededIdentities(): BrandIdentity[] {
  return US_PET_BRANDS.map((brand) => ({
    key: seedKey(brand),
    name: brand.name,
    owner: brand.owner,
    species: brand.species,
    lines: brand.lines ?? [],
    seeded: true,
    family: brand.family ?? null,
  }));
}

/**
 * Does this brand match what somebody typed into the search box?
 *
 * Searching in a shop means one thumb and a half-remembered name, so it
 * matches the brand, its parent company AND its aliases — typing "purina"
 * should reach Fancy Feast, and typing "smucker" should reach the brands Post
 * bought from them even though nothing on the shelf says either word.
 */
export function brandMatchesQuery(
  brand: Pick<BrandIdentity, "key" | "name" | "owner">,
  query: string
): boolean {
  const q = foldName(query);
  if (!q) return true;
  const seed = INDEX.byKey.get(brand.key);
  const haystacks = [
    foldName(brand.name),
    brand.key,
    foldName(brand.owner),
    ...(seed?.aliases ?? []).map((text) => foldName(text)),
    ...(seed?.lines ?? []).map((text) => foldName(text)),
  ];
  return haystacks.some((h) => h.includes(q));
}
