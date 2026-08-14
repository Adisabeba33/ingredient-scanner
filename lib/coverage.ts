import { brandIdentity, seededIdentities, type BrandIdentity } from "./brand-key";
import { alignedFold, deaccent } from "./fold";
import { knownItems, type KnownItem } from "./known-products";

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
 *   · the individual products we have been told exist and have never scanned,
 *     by name and with the barcode to look for — data/known-products.ts
 *
 * That last one is a partial catalogue, not a complete one: it covers the
 * recipes somebody has actually gone and found, and says nothing about the rest.
 * So this is a map with the edges left blank rather than a map with invented
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
 * Three, and no more, because a shop is read at arm's length with one thumb:
 * done, half-done, and not started. Anything finer would not get read at all.
 */
export type ProductState =
  /** We have its composition. Done. */
  | "filled"
  /** Photographed in a shop; the back of the pack still to type. */
  | "photo"
  /**
   * We know it exists and have never touched it — from data/known-products.ts.
   *
   * The state the page could not honestly show before. An untouched range used
   * to be a dashed outline with nothing inside it, because we had no idea what
   * was in a range; now the ones we know about are named, and carry the barcode
   * you will meet on the shelf.
   */
  | "known";

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

/**
 * One barcode of one recipe — a single package on a shelf.
 *
 * ── Why the packages are listed and not just counted ──────────────────────
 *
 * A recipe used to be one barcode, so a product and a package were the same
 * thing and the page never had to tell them apart. Dry food broke that: Friskies
 * Seafood Sensations is one recipe in five bags, from 3.15 lb to 30 lb, each
 * with its own code.
 *
 * The page showed that as `×5`, which answers "how many" and not the question
 * somebody in an aisle is actually holding: *which* ones. Standing in front of
 * five bags with a note saying five exist and one is done is no better than no
 * note. So each package is named by its size and carries its own state.
 */
export interface CoveragePack {
  /** Canonical GTIN-14 — the catalog key. */
  code: string;
  /** As printed under the bars, which is what you read off a shelf. */
  printed: string;
  /** "3 oz", "16 lb". Null when nothing we hold knows this code's size. */
  size: string | null;
  /** Have we met this exact package, or only its recipe? */
  scanned: boolean;
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
  /**
   * Barcodes we believe this recipe is sold under but have not scanned, as
   * printed. On a `known` item these are the numbers to look for; on a done one
   * they are pack sizes still to do.
   */
  toFind?: string[];
  /**
   * Every package of this recipe, smallest first, scanned or not.
   *
   * A superset of `codes` and `toFind` and the one to render from: those two
   * answer "what is done" and "what is left" separately, which is the right
   * shape for a count and the wrong shape for a shelf.
   */
  packs: CoveragePack[];
}

/** Wet, dry, or we were never told. */
export type CoverageForm = "wet" | "dry" | "unknown";

/** One range within a brand. */
export interface CoverageLine {
  name: string;
  /** Whether the seed file expected this range, or the shelf produced it. */
  seeded: boolean;
  items: CoverageItem[];
  /**
   * The food forms present, in a fixed order — wet, dry, then unknown.
   *
   * Nearly every range is entirely one or the other, so this is usually one
   * entry and can be shown once on the heading instead of on every product. A
   * range with two is the case worth marking per product, and the page decides
   * that from the length of this.
   */
  forms: CoverageForm[];
  filled: number;
  photo: number;
  /** Named products in this range that nobody has scanned. */
  known: number;
}

export interface CoverageBrand extends BrandIdentity {
  /** Ranges with their products. `lines`, inherited, is the seeded names only. */
  ranges: CoverageLine[];
  /** Products with a composition. */
  filled: number;
  /** Products photographed but still needing the back of the pack. */
  photo: number;
  /** Named products we know exist and have never touched. */
  known: number;
  /** Seeded ranges with nothing under them at all. */
  emptyRanges: number;
}

/**
 * Is this row cat or dog food?
 *
 * The page is about pet food and nothing else. The catalog is not: a barcode
 * looked up through Open Food Facts lands with `mode: "human"` and one through
 * Open Beauty Facts with `"cosmetics"`, so a can of Red Bull somebody scanned
 * once sits in the same table as the Friskies. On a page whose entire job is
 * "what pet food is left to do", a drinks brand is not a small blemish — it is
 * a row of work that doesn't exist, in a list you are trying to trust.
 *
 * A row with no mode at all counts as pet. That is the convention the rest of
 * the tool already follows (`/api/catalog` reads a missing mode as pet), and it
 * is the safe direction here: the tool was pet-only when those rows were
 * written, so dropping them would hide real work, while keeping them can at
 * worst show one stray product under a brand marked new.
 */
export function countsAsPet(mode: string | null | undefined): boolean {
  const value = (mode ?? "").trim().toLowerCase();
  return value === "" || value === "pet";
}

/**
 * A pack size as a number of ounces, for putting sizes in order.
 *
 * Sorting the strings does not work and is not nearly wrong enough to notice:
 * "12 lb" sorts before "3.15 lb", and "16 oz" before "3 lb", so a row of bags
 * reads big-small-big and looks like nothing in particular. Ordering them by
 * what they weigh is the whole reason a row of sizes is legible at a glance —
 * it turns five pills into a scale.
 *
 * Returns null for anything it cannot read, and those sort last rather than
 * being guessed at zero, which would put every unparsed size in front.
 */
export function packWeightOz(size: string | null | undefined): number | null {
  const text = (size ?? "").trim().toLowerCase();
  const found = /^([\d.]+)\s*(oz|lb|lbs|g|kg)\b/.exec(text);
  if (!found) return null;
  const value = Number(found[1]);
  if (!Number.isFinite(value)) return null;
  switch (found[2]) {
    case "lb":
    case "lbs":
      return value * 16;
    case "kg":
      return value * 35.274;
    case "g":
      return value * 0.035274;
    default:
      return value;
  }
}

function bySize(a: CoveragePack, b: CoveragePack): number {
  const aw = packWeightOz(a.size);
  const bw = packWeightOz(b.size);
  if (aw === null && bw === null) return a.printed.localeCompare(b.printed);
  if (aw === null) return 1;
  if (bw === null) return -1;
  return aw - bw || a.printed.localeCompare(b.printed);
}

const FORM_ORDER: CoverageForm[] = ["wet", "dry", "unknown"];

function asForm(value: string | null | undefined): CoverageForm {
  const text = (value ?? "").trim().toLowerCase();
  return text === "wet" || text === "dry" ? text : "unknown";
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
 * Is one label the other with extra words on the END?
 *
 * The catalog calls a tin "Turkey Feast", because that is what the operator
 * typed; the seed list calls it "Turkey Feast in Roasted Turkey Flavor Gravy",
 * because that is the retailer's full name. Requiring an exact match listed the
 * same product twice — once done, once still to find — which is the confusion
 * this whole page exists to remove.
 *
 * A PREFIX, and nothing looser. The first attempt allowed the shorter label
 * anywhere inside the longer one, and a screenshot caught what that costs:
 * Fancy Feast's "Chicken Feast" sits at the end of "Tender Beef & Chicken
 * Feast", so one scanned pâté quietly absorbed two flavours nobody had
 * scanned — two products vanished from the list of things to go and find,
 * which is worse than showing one of them twice.
 *
 * Anchored at the front, that cannot happen: a maker's extra words go on the
 * end ("… in Roasted Turkey Flavor Gravy"), while the words that tell two
 * flavours apart go at the front ("Tender Beef &…").
 *
 * Two words minimum, because a one-word label like "Chicken" starts half a
 * shelf.
 */
function labelPrefix(a: string, b: string): boolean {
  const aWords = a.split(" ").filter(Boolean);
  const bWords = b.split(" ").filter(Boolean);
  const [shortWords, longWords] =
    aWords.length <= bWords.length ? [aWords, bWords] : [bWords, aWords];
  if (shortWords.length < 2) return false;
  return shortWords.every((word, i) => longWords[i] === word);
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
export function buildCoverage(
  rows: CoverageSource[],
  known: KnownItem[] = knownItems()
): CoverageBrand[] {
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

  // What we know about individual packages, by barcode. The seed is the only
  // thing that holds a size — a catalog row has a code and a name and never a
  // net weight — so a scanned code that was never seeded shows no size, which
  // is the honest answer rather than a blank that looks like a small pack.
  const packInfo = new Map<string, { printed: string; size: string | null }>();
  for (const item of known) {
    item.codes.forEach((code, i) => {
      packInfo.set(code, {
        printed: item.printedCodes[i] ?? code,
        size: item.sizes[i] ?? null,
      });
    });
  }
  const packFor = (code: string, scanned: boolean): CoveragePack => ({
    code,
    printed: packInfo.get(code)?.printed ?? code,
    size: packInfo.get(code)?.size ?? null,
    scanned,
  });

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
      if (!existing.codes.includes(row.code)) {
        existing.codes.push(row.code);
        existing.packs.push(packFor(row.code, true));
      }
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
        packs: [packFor(row.code, true)],
      });
    }
  }

  // ── The products we have been told exist ─────────────────────────────────
  //
  // Merged in AFTER everything scanned, through the same label key, so a recipe
  // already in the catalog is not listed twice under two spellings. When it is
  // already there, the seeded entry contributes only the barcodes we have not
  // met — which is how a 3 oz can done and a 5.5 oz can not done stays visible
  // as one recipe with one number left to find, rather than two products.
  //
  // These never overwrite a state. A scanned product's answer came from the
  // pack; a seeded one came from a retailer listing, and the pack wins.
  const seenCodes = new Set<string>();
  for (const row of byCode.values()) seenCodes.add(row.code);

  for (const item of known) {
    const identity = brandIdentity(item.brand);
    if (!identity) continue;
    const draft = draftFor(identity);
    let items = draft.ranges.get(item.line);
    if (!items) {
      items = new Map();
      draft.ranges.set(item.line, items);
    }
    const key = labelKey(item.variant);
    const unseen = item.codes
      .map((code, i) => ({ code, printed: item.printedCodes[i] }))
      .filter(({ code }) => !seenCodes.has(code));
    // Exact first, then the same recipe under a shorter name. Scoped to one
    // range of one brand AND anchored at the front — see labelPrefix for what
    // a looser rule cost.
    let existing = items.get(key);
    if (!existing) {
      for (const [otherKey, candidate] of items) {
        if (candidate.state === "known") continue;
        if (labelPrefix(key, otherKey)) {
          existing = candidate;
          break;
        }
      }
    }
    if (existing) {
      // Already done, or on the worklist. Only the pack sizes we haven't met
      // are worth saying anything about.
      if (unseen.length > 0) {
        existing.toFind = [
          ...(existing.toFind ?? []),
          ...unseen.map((u) => u.printed),
        ];
        // The sizes we have NOT met, beside the ones we have. This is the row
        // that answers "which bags are left" instead of "how many".
        for (const { code } of unseen) {
          if (!existing.packs.some((p) => p.code === code)) {
            existing.packs.push(packFor(code, false));
          }
        }
      }
      continue;
    }
    // Every code of it is unscanned, so the recipe itself is untouched.
    items.set(key, {
      label: item.variant,
      codes: item.codes,
      state: "known",
      place: "catalog",
      species: item.species,
      foodForm: item.foodForm,
      origin: "seed",
      toFind: item.printedCodes,
      packs: item.codes.map((code) => packFor(code, false)),
    });
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
    let knownLeft = 0;
    let emptyRanges = 0;
    for (const name of order) {
      const items = [...(draft.ranges.get(name)?.values() ?? [])].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      // Smallest bag first, inside every product. Done here rather than at the
      // push sites so it holds however a product was assembled — scanned rows
      // first, seeded ones merged in after, or only one of the two.
      for (const item of items) item.packs.sort(bySize);
      const seeded = seededRanges.includes(name);
      if (items.length === 0) {
        // A seeded range with nothing in it is worth showing — it is the
        // "go and find this" row. An empty catch-all is not.
        if (seeded) {
          emptyRanges += 1;
          ranges.push({
            name,
            seeded,
            items,
            forms: [],
            filled: 0,
            photo: 0,
            known: 0,
          });
        }
        continue;
      }
      const rangeFilled = items.filter((i) => i.state === "filled").length;
      const rangeKnown = items.filter((i) => i.state === "known").length;
      const rangePhoto = items.length - rangeFilled - rangeKnown;
      filled += rangeFilled;
      photo += rangePhoto;
      knownLeft += rangeKnown;
      const present = new Set(items.map((i) => asForm(i.foodForm)));
      ranges.push({
        name,
        seeded,
        items,
        forms: FORM_ORDER.filter((f) => present.has(f)),
        filled: rangeFilled,
        photo: rangePhoto,
        known: rangeKnown,
      });
    }

    brands.push({
      ...draft.identity,
      ranges,
      filled,
      photo,
      known: knownLeft,
      emptyRanges,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name));
}

/** The numbers above the list, so the shape of the work is visible at a glance. */
export function coverageTotals(brands: CoverageBrand[]) {
  let filled = 0;
  let photo = 0;
  let known = 0;
  let started = 0;
  for (const brand of brands) {
    filled += brand.filled;
    photo += brand.photo;
    known += brand.known;
    // A brand with only named-but-unscanned products has NOT been started —
    // knowing what is on a shelf is not the same as having been to it.
    if (brand.filled + brand.photo > 0) started += 1;
  }
  return { brands: brands.length, started, filled, photo, known };
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
  // Gaps first, and a brand with named products waiting is a BIGGER gap than an
  // empty one: you know exactly what to pick up there. Ties fall back to how
  // little has been done.
  return copy.sort(
    (a, b) =>
      b.known - a.known ||
      a.filled + a.photo - (b.filled + b.photo) ||
      a.name.localeCompare(b.name)
  );
}
