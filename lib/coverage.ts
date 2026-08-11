import { brandIdentity, seededIdentities, type BrandIdentity } from "./brand-key";
import { alignedFold, deaccent } from "./fold";

/**
 * What we have scanned, arranged the way a shelf is arranged.
 *
 * ── What this answers ─────────────────────────────────────────────────────
 *
 * "Have I already done this one?" After two hundred products in a shop, that
 * question stops having an answer you can hold in your head, and the cost of
 * getting it wrong is a whole capture repeated — or, worse, skipped because it
 * FELT familiar. So it is answered visually: brand, then range, then what is
 * under each range and what state it is in.
 *
 * ── What it honestly cannot answer ────────────────────────────────────────
 *
 * "What is missing?" — not fully. We have no source that knows a brand's whole
 * catalogue, so nothing can say "Fancy Feast has ninety-four flavours and you
 * have twelve". What it CAN say, and does:
 *
 *   · a seeded brand with nothing under it at all — a whole shelf untouched
 *   · a seeded RANGE with nothing under it — Gravy Lovers done, Medleys not
 *   · a range that came off the shelf and was never in the seed list
 *
 * That is a map with the edges left blank rather than a map with invented
 * coastlines, and the blanks fill in as the shop teaches us.
 *
 * ── Pure ──────────────────────────────────────────────────────────────────
 *
 * Nothing here reads a database. The route hands it rows; this decides what
 * they mean. That is what makes the grouping rules testable, and they are the
 * part that is easy to get subtly wrong.
 */

/**
 * How far along one product is.
 *
 * Two states, not three, because there are only two answers that change what
 * you do in a shop: it is done, or it still needs the back of the pack. A row
 * that has never been seen has no product to have a state.
 */
export type ProductState = "filled" | "photo";

/** Where a product is sitting right now. */
export type ProductPlace = "catalog" | "worklist";

/** One row, from either table, flattened to what the grouping needs. */
export interface CoverageSource {
  code: string;
  brands: string | null;
  productName: string | null;
  /** Express rows read the range off the front; catalog rows have it merged in. */
  productLine?: string | null;
  variant?: string | null;
  species?: string | null;
  foodForm?: string | null;
  /** Who supplied a catalog row: our capture, or an open database. */
  origin?: string | null;
  state: ProductState;
  place: ProductPlace;
}

/** One product on a brand's page. Pack sizes of one recipe are merged. */
export interface CoverageItem {
  /** What to call it — the name with the range taken off the front. */
  label: string;
  /** Every barcode carrying this label. More than one means pack sizes. */
  codes: string[];
  state: ProductState;
  place: ProductPlace;
  species: string | null;
  foodForm: string | null;
  origin: string | null;
}

/** One range within a brand. */
export interface CoverageLine {
  name: string;
  /** Whether the seed file expected this range, or the shelf produced it. */
  seeded: boolean;
  items: CoverageItem[];
  filled: number;
  photo: number;
}

export interface CoverageBrand extends BrandIdentity {
  /** Ranges with their products. `lines`, inherited, is the seeded names only. */
  ranges: CoverageLine[];
  /** Products with a composition. */
  filled: number;
  /** Products photographed but still needing the back of the pack. */
  photo: number;
  /** Seeded ranges with nothing under them at all. */
  emptyRanges: number;
}

/** The catch-all range, for a product whose name matched nothing seeded. */
export const OTHER_RANGE = "Other";

/** The bucket for a product whose brand never read. */
export const NO_BRAND = "(no brand)";

function escapeRegex(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A matcher for a range name, tolerant of how it is punctuated.
 *
 * The range is written "Lil' Soups" on the tin, "Lil Soups" by a model that
 * dropped the apostrophe, and "lil-soups" by whoever typed it in a hurry. So
 * the words are what matter and everything between them is "some punctuation",
 * which is also what makes "c/d" match "c d" and "c-d".
 *
 * Accents are folded on BOTH sides by the caller, so "Pâté" on the tin reaches
 * a range written "Pate" and the other way round.
 *
 * Word boundaries at both ends on purpose: "Gold" must not match inside
 * "Golden Retriever Formula".
 */
function rangeMatcher(range: string): RegExp | null {
  const words = deaccent(range)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(escapeRegex);
  if (words.length === 0) return null;
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])(${words.join("[^\\p{L}\\p{N}]+")})(?![\\p{L}\\p{N}])`,
    "iu"
  );
}

function trimEdges(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").trim();
}

/**
 * Split a product name into the range it belongs to and what is left.
 *
 * "Shreds With Salmon in Sauce" against Friskies' ranges gives
 * `{ range: "Shreds", rest: "With Salmon in Sauce" }` — a heading and a
 * flavour, which is how the packs are arranged on the shelf.
 *
 * The longest match wins, measured in words first. A brand with both "Grain
 * Free" and "Grain Free Naturals" must file a Naturals bag under the longer of
 * the two, or the more specific range never gets any products and reads as
 * untouched.
 */
export function splitRange(
  productName: string | null | undefined,
  ranges: string[]
): { range: string | null; rest: string } {
  // Search the accent-folded copy, cut from the real one — so a tin printed
  // "Pâté" files under a range written "Pate" and still shows its own spelling.
  const { source: name, folded } = alignedFold((productName ?? "").trim());
  if (!name) return { range: null, rest: "" };

  let best: { range: string; start: number; end: number; words: number } | null =
    null;
  for (const range of ranges) {
    const matcher = rangeMatcher(range);
    if (!matcher) continue;
    const found = matcher.exec(folded);
    if (!found) continue;
    const words = range.split(/[^\p{L}\p{N}]+/u).filter(Boolean).length;
    if (best && (words < best.words || (words === best.words && range.length <= best.range.length))) {
      continue;
    }
    const start = found.index + found[1].length;
    best = { range, start, end: start + found[2].length, words };
  }
  if (!best) return { range: null, rest: name };

  const rest = trimEdges(
    `${name.slice(0, best.start)} ${name.slice(best.end)}`.replace(/\s+/g, " ")
  );
  return { range: best.range, rest };
}

/**
 * Pack sizes of one recipe carry the same label; this is what "the same" means.
 *
 * Accents fold first, or "Pâté" collapses to "p t" and never meets "Pate". And
 * the ampersand goes with the word it stands for: one pack prints "Turkey &
 * Giblets" and the record somebody else wrote says "Turkey and Giblets", and
 * listing those as two products is exactly the double-scanning this page is for.
 */
function labelKey(label: string): string {
  const key = deaccent(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // A label that was nothing but connectors would key as empty and drag every
  // other empty-keyed product in with it. Keep it distinct instead.
  return key || label.toLowerCase().trim();
}

/**
 * Rows from both tables, grouped into brands and ranges.
 *
 * Every seeded brand appears whether or not anything was scanned under it —
 * that is the whole point, a brand with nothing is the most useful row on the
 * page. Brands that arrived from the shelf and were never seeded appear too,
 * marked, so a list I wrote from memory never silently hides a real product.
 */
export function buildCoverage(rows: CoverageSource[]): CoverageBrand[] {
  // A code can legitimately be in both tables for a moment — a finish that
  // wrote the catalog row and failed to clear the worklist. The catalog wins:
  // it is the one with a composition in it.
  const byCode = new Map<string, CoverageSource>();
  for (const row of rows) {
    const seen = byCode.get(row.code);
    if (!seen || (seen.state === "photo" && row.state === "filled")) {
      byCode.set(row.code, row);
    }
  }

  interface Draft {
    identity: BrandIdentity;
    /** Range name (or OTHER_RANGE) → label key → item. */
    ranges: Map<string, Map<string, CoverageItem>>;
  }
  const drafts = new Map<string, Draft>();

  const draftFor = (identity: BrandIdentity): Draft => {
    const existing = drafts.get(identity.key);
    if (existing) return existing;
    const draft: Draft = { identity, ranges: new Map() };
    drafts.set(identity.key, draft);
    return draft;
  };

  // Seeded brands first, so they exist even with nothing under them, and so a
  // brand's display name comes from the seed rather than from whichever
  // spelling happened to be scanned first.
  for (const identity of seededIdentities()) draftFor(identity);

  for (const row of byCode.values()) {
    const identity =
      brandIdentity(row.brands) ??
      // A real product with an unread brand. Its own bucket rather than
      // silently dropped: a row here means "go and look at this one".
      {
        key: "",
        name: NO_BRAND,
        owner: null,
        species: null,
        lines: [],
        seeded: false,
      };
    const draft = draftFor(identity);

    // An express row already knows its range — the model read it off the front
    // as a separate field, which beats guessing it back out of a joined name.
    // A catalog row has range, name and flavour merged into one string, so it
    // gets matched against what the brand is expected to have.
    const fromName = splitRange(
      row.productName,
      identity.lines
    );
    const range = row.productLine?.trim() || fromName.range || OTHER_RANGE;
    const label =
      (row.productLine?.trim()
        ? [row.productName, row.variant].filter(Boolean).join(" ").trim()
        : fromName.rest) ||
      row.variant?.trim() ||
      row.productName?.trim() ||
      row.code;

    let items = draft.ranges.get(range);
    if (!items) {
      items = new Map();
      draft.ranges.set(range, items);
    }
    const key = labelKey(label);
    const existing = items.get(key);
    if (existing) {
      // Another pack size of something already listed.
      if (!existing.codes.includes(row.code)) existing.codes.push(row.code);
      // One size finished is enough to know the recipe: the composition is the
      // same text on every bag, and the worklist row for the other size will
      // be finished from it.
      if (row.state === "filled") {
        existing.state = "filled";
        existing.place = "catalog";
      }
      existing.species ??= row.species ?? null;
      existing.foodForm ??= row.foodForm ?? null;
    } else {
      items.set(key, {
        label,
        codes: [row.code],
        state: row.state,
        place: row.place,
        species: row.species ?? null,
        foodForm: row.foodForm ?? null,
        origin: row.origin ?? null,
      });
    }
  }

  const brands: CoverageBrand[] = [];
  for (const draft of drafts.values()) {
    // Seeded ranges in the order the seed file lists them — that is roughly
    // how a shelf is laid out, and a stable order means the page doesn't
    // reshuffle itself between two visits to the same brand.
    const seededRanges = draft.identity.lines;
    const discovered = [...draft.ranges.keys()]
      .filter((r) => r !== OTHER_RANGE && !seededRanges.includes(r))
      .sort((a, b) => a.localeCompare(b));
    const order = [...seededRanges, ...discovered, OTHER_RANGE];

    const ranges: CoverageLine[] = [];
    let filled = 0;
    let photo = 0;
    let emptyRanges = 0;
    for (const name of order) {
      const items = [...(draft.ranges.get(name)?.values() ?? [])].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      const seeded = seededRanges.includes(name);
      if (items.length === 0) {
        // A seeded range with nothing in it is worth showing — it is the
        // "go and find this" row. An empty catch-all is not.
        if (seeded) {
          emptyRanges += 1;
          ranges.push({ name, seeded, items, filled: 0, photo: 0 });
        }
        continue;
      }
      const rangeFilled = items.filter((i) => i.state === "filled").length;
      const rangePhoto = items.length - rangeFilled;
      filled += rangeFilled;
      photo += rangePhoto;
      ranges.push({ name, seeded, items, filled: rangeFilled, photo: rangePhoto });
    }

    brands.push({
      ...draft.identity,
      ranges,
      filled,
      photo,
      emptyRanges,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name));
}

/** The numbers above the list, so the shape of the work is visible at a glance. */
export function coverageTotals(brands: CoverageBrand[]) {
  let filled = 0;
  let photo = 0;
  let started = 0;
  for (const brand of brands) {
    filled += brand.filled;
    photo += brand.photo;
    if (brand.filled + brand.photo > 0) started += 1;
  }
  return { brands: brands.length, started, filled, photo };
}

export type CoverageSort = "name" | "gaps" | "most";

/**
 * The three orders worth having.
 *
 * `name` to find a brand you are standing in front of; `gaps` to decide what to
 * do next, untouched brands first; `most` to see where the work has actually
 * gone. Brands with nothing sink to the bottom under `most` rather than
 * disappearing — a page that hides them stops showing what is missing.
 */
export function sortBrands(
  brands: CoverageBrand[],
  sort: CoverageSort
): CoverageBrand[] {
  const copy = [...brands];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "most") {
    return copy.sort(
      (a, b) =>
        b.filled + b.photo - (a.filled + a.photo) || a.name.localeCompare(b.name)
    );
  }
  return copy.sort(
    (a, b) => a.filled + a.photo - (b.filled + b.photo) || a.name.localeCompare(b.name)
  );
}
