"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Barcode,
  Search,
  X,
} from "lucide-react";
import {
  buildCoverage,
  coverageTotals,
  OTHER_RANGE,
  sortBrands,
  type CoverageBrand,
  type CoverageSort,
  type CoverageSource,
} from "@/lib/coverage";
import { brandKey, brandMatchesQuery } from "@/lib/brand-key";

/**
 * What has been scanned, arranged by brand, so a shop trip stops repeating
 * itself.
 *
 * ── The problem on the floor ──────────────────────────────────────────────
 *
 * After two hundred products, "have I done this one?" has no answer you can
 * hold in your head. Getting it wrong costs a whole capture — or, worse, skips
 * a product because it felt familiar. So the answer is made visual: search a
 * brand, open it, see its ranges and what is under each.
 *
 * ── Three states, not five ────────────────────────────────────────────────
 *
 * Green: done, it has a composition. Amber: photographed, the back of the pack
 * still to type. Dashed outline with a barcode: we have been told it exists and
 * nobody has scanned it — go and find THIS one. Read at arm's length with one
 * thumb, in a shop, so anything finer than three would not be read at all.
 *
 * ── Two more things a shelf is arranged by ────────────────────────────────
 *
 * Both arrived with dry food, and neither had to be said while the catalog was
 * all canned:
 *
 * **Wet or dry.** An aisle is divided by this before anything else — bags on
 * one side, tins on the other — and a range name does not say which side you
 * are on. Fancy Feast Kitten is both. Shown once on the range heading where a
 * range is all one form, and on each product where it is not.
 *
 * **Which packages.** A recipe is not a barcode any more: Friskies Seafood
 * Sensations is one recipe in five bags. Each is a pill showing its size,
 * smallest first, filled where that exact bag has been scanned and outlined
 * where only the recipe has. This replaced a `×5` that answered how many
 * existed to somebody standing in front of the five needing to know which —
 * and that hid the four unscanned sizes completely, because one scanned size
 * marks the recipe done.
 *
 * ── Honest about its own edges ────────────────────────────────────────────
 *
 * The brand and range list is seeded from what a model knew, and the named
 * products from a batch somebody went and collected — neither is a complete
 * catalogue, and nothing we can reach knows how many flavours Fancy Feast really
 * has. So an empty range means "the seed list expected this and we have
 * nothing", and a dashed product means "we were told about this one", never
 * "this is all that is left". Brands and ranges that came off a shelf and were
 * never seeded are marked as such, which is the list correcting itself.
 */

interface Payload {
  rows?: CoverageSource[];
  truncated?: boolean;
  missingColumns?: boolean;
  worklistUnavailable?: string | null;
  error?: string;
  message?: string;
}

type SpeciesFilter = "all" | "cat" | "dog";

const SORTS: { value: CoverageSort; label: string }[] = [
  { value: "name", label: "A–Z" },
  { value: "gaps", label: "Gaps first" },
  { value: "most", label: "Most done" },
];

const SPECIES: { value: SpeciesFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
];

/** One row of the brand list: a brand on its own, or a family gathered. */
type ListEntry =
  | { kind: "brand"; brand: CoverageBrand }
  | { kind: "family"; name: string; members: CoverageBrand[] };

/**
 * Gather brands sharing a house name under one card.
 *
 * The family sits at its first member's sorted position and the members keep
 * their order, so sorting still means what it says. A card whose own NAME is a
 * family name joins too — that is the unseeded "Hill's" card a capture creates
 * when a front says only "Hill's", for a barcode the seed does not hold; it
 * belongs with its family, not beside it.
 */
function foldFamilies(list: CoverageBrand[]): ListEntry[] {
  const familyByKey = new Map<string, string>();
  for (const b of list) {
    if (b.family) familyByKey.set(brandKey(b.family), b.family);
  }
  const familyOf = (b: CoverageBrand): string | null =>
    b.family ?? familyByKey.get(brandKey(b.name)) ?? null;

  const grouped = new Map<string, CoverageBrand[]>();
  const out: ListEntry[] = [];
  for (const b of list) {
    const family = familyOf(b);
    if (!family) {
      out.push({ kind: "brand", brand: b });
      continue;
    }
    const members = grouped.get(family);
    if (members) {
      members.push(b);
      continue;
    }
    const fresh = [b];
    grouped.set(family, fresh);
    out.push({ kind: "family", name: family, members: fresh });
  }
  return out;
}

export function BrandCoverage({ adminToken }: { adminToken: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // "Most done" rather than A–Z, because a page that opens on 9Lives, A Pup
  // Above and Acana — three brands with nothing under them — looks like a phone
  // book. Opening on your own work orients you; A–Z is one tap away when you
  // are hunting a specific name, and the search box is faster than either.
  const [sort, setSort] = useState<CoverageSort>("most");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [openFamily, setOpenFamily] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coverage", {
        headers: { "x-admin-token": adminToken },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as Payload;
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Couldn't read the catalog.");
        setPayload(null);
        return;
      }
      setPayload(data);
    } catch {
      setError("Couldn't read the catalog — check your connection.");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load]);

  // Grouping the whole catalog is not free, and it does not depend on the
  // search box — so it happens once per load rather than once per keystroke.
  const brands = useMemo(
    () => buildCoverage(payload?.rows ?? []),
    [payload?.rows]
  );
  const totals = useMemo(() => coverageTotals(brands), [brands]);

  const visible = useMemo(() => {
    const matching = brands.filter((b) => {
      if (species !== "all" && b.species && b.species !== "both" && b.species !== species) {
        return false;
      }
      // A brand off the shelf has no species on it. Hiding it behind an aisle
      // filter would hide exactly the products the seed list didn't predict.
      return brandMatchesQuery(b, query);
    });
    return sortBrands(matching, sort);
  }, [brands, query, sort, species]);
  const entries = useMemo(() => foldFamilies(visible), [visible]);

  const current = openBrand
    ? brands.find((b) => b.key === openBrand) ?? null
    : null;

  if (current) {
    return (
      <BrandPage brand={current} onBack={() => setOpenBrand(null)} />
    );
  }

  if (openFamily) {
    // From ALL brands, not the filtered list: a family opened from a search
    // result should show its whole shelf, not the slice that matched.
    const members = foldFamilies(brands).find(
      (e): e is Extract<ListEntry, { kind: "family" }> =>
        e.kind === "family" && e.name === openFamily
    );
    if (members) {
      return (
        <FamilyPage
          name={openFamily}
          members={members.members}
          onBack={() => setOpenFamily(null)}
        />
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)_+_2rem)] pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="btn-ghost -ml-4 shrink-0">
          <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
          Scanner
        </Link>
        <button
          onClick={() => void load()}
          className="btn-ghost -mr-4 shrink-0"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
          ) : (
            <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
          )}
          Refresh
        </button>
      </header>

      <div>
        <h1 className="text-[20px] font-semibold text-ink">Brand coverage</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          {totals.started} of {totals.brands} brands started · {totals.filled}{" "}
          done · {totals.photo} awaiting ingredients
          {totals.known > 0 ? ` · ${totals.known} named to find` : ""}
        </p>
        {/* Said rather than assumed. The catalog also holds human food and
            cosmetics, and somebody counting brands here should know why their
            total doesn't match the catalog's. */}
        <p className="mt-0.5 text-[11.5px] text-faint">
          Cat and dog food only — human food and cosmetics aren&apos;t counted.
        </p>
      </div>

      {/* Search first, because in a shop it is the only control that matters:
          you are standing in front of a brand and you need it now. */}
      <label className="relative block">
        <Search
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Not type="search": WebKit adds its own clear button and the field
          // ends up with two crosses side by side.
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="Brand, company or range…"
          aria-label="Search brands"
          className="h-12 w-full rounded-input border border-lineStrong bg-surface pl-11 pr-10 text-[16px] text-ink outline-none focus:border-sage-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-faint"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </label>

      {/* Both controls kept small and close: they matter, but not as much as
          seeing brands, and every pixel here is a row you can't see. */}
      <div className="-mt-1 flex flex-col gap-1.5">
        <Segmented
          options={SPECIES}
          value={species}
          onChange={setSpecies}
          label="Aisle"
        />
        <Segmented options={SORTS} value={sort} onChange={setSort} label="Order" />
      </div>

      {error && (
        <p className="rounded-input bg-amber-soft px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      )}
      {payload?.worklistUnavailable && (
        <p className="rounded-input bg-amber-soft px-4 py-3 text-[12.5px] leading-relaxed text-ink">
          Express captures aren&apos;t counted:{" "}
          {payload.worklistUnavailable}. Run{" "}
          <code>supabase/express_capture.sql</code> to include them.
        </p>
      )}
      {payload?.truncated && (
        <p className="rounded-input bg-amber-soft px-4 py-3 text-[12.5px] leading-relaxed text-ink">
          The catalog is bigger than this page reads in one go, so brands near
          the bottom may look emptier than they are.
        </p>
      )}

      {loading && !payload ? (
        <p className="flex items-center gap-2 py-8 text-[14px] text-muted">
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
          Reading the catalog…
        </p>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-muted">
          No brand matches “{query}”. Scan it and it will appear here on its own.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((entry) =>
            entry.kind === "brand" ? (
              <li key={entry.brand.key || "no-brand"}>
                <BrandRow
                  brand={entry.brand}
                  onOpen={() => setOpenBrand(entry.brand.key)}
                />
              </li>
            ) : (
              <li key={`family:${entry.name}`}>
                <FamilyRow
                  name={entry.name}
                  members={entry.members}
                  onOpen={() => setOpenFamily(entry.name)}
                />
              </li>
            )
          )}
        </ul>
      )}
    </main>
  );
}

/**
 * A family's row: the house name once, the members' work summed.
 *
 * Same anatomy as BrandRow so the list reads as one list — the only tell is
 * the member count where a brand row shows its owner.
 */
function FamilyRow({
  name,
  members,
  onOpen,
}: {
  name: string;
  members: CoverageBrand[];
  onOpen: () => void;
}) {
  const filled = members.reduce((n, b) => n + b.filled, 0);
  const photo = members.reduce((n, b) => n + b.photo, 0);
  const known = members.reduce((n, b) => n + b.known, 0);
  const owner = members.find((b) => b.owner)?.owner ?? null;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-input border border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-semibold ${
            filled + photo === 0 ? "text-muted" : "text-ink"
          }`}
        >
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-faint">
          {owner ? `${owner} · ` : ""}
          {members.length} brands
        </span>
      </span>
      <Progress filled={filled} photo={photo} />
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold tabular-nums">
        {filled > 0 && <span className="text-sage-600">{filled}</span>}
        {photo > 0 && <span className="text-amber">{photo}</span>}
        {known > 0 && <span className="text-faint">+{known}</span>}
        {filled + photo === 0 && known === 0 && (
          <span className="text-faint">—</span>
        )}
      </span>
      <ChevronRight
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0 text-faint"
      />
    </button>
  );
}

/** A row per brand: name, who owns it, and how far along it is. */
function BrandRow({
  brand,
  onOpen,
}: {
  brand: CoverageBrand;
  onOpen: () => void;
}) {
  const total = brand.filled + brand.photo;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-input border border-line bg-surface px-4 py-3 text-left transition active:scale-[0.99]"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          {/* Untouched brands sit back a shade. With most of a 171-brand list
              empty, giving them all full contrast buries the handful that
              actually have work in them. */}
          <span
            className={`truncate text-[15px] font-semibold ${
              total === 0 ? "text-muted" : "text-ink"
            }`}
          >
            {brand.name}
          </span>
          {!brand.seeded && (
            <span
              title="Found on a shelf — not in the seeded list"
              className="shrink-0 rounded-full bg-sage-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-sage-600"
            >
              new
            </span>
          )}
        </span>
        {brand.owner && (
          <span className="mt-0.5 block truncate text-[11.5px] text-faint">
            {brand.owner}
          </span>
        )}
      </span>
      <Progress filled={brand.filled} photo={brand.photo} />
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold tabular-nums">
        {brand.filled > 0 && (
          <span className="text-sage-600">{brand.filled}</span>
        )}
        {brand.photo > 0 && <span className="text-amber">{brand.photo}</span>}
        {/* Named and never touched. Grey rather than a warning colour: it is
            not a problem, it is a shopping list. */}
        {brand.known > 0 && <span className="text-faint">+{brand.known}</span>}
        {total === 0 && brand.known === 0 && (
          <span className="text-faint">—</span>
        )}
      </span>
      <ChevronRight
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0 text-faint"
      />
    </button>
  );
}

/**
 * A bar with no denominator, because there isn't an honest one.
 *
 * We cannot know how many products a brand really has, so this shows the SHAPE
 * of what has been done — how much is finished against how much is waiting —
 * and grows against the busiest brand on screen rather than pretending to be a
 * percentage of a catalogue nobody can count.
 */
function Progress({ filled, photo }: { filled: number; photo: number }) {
  const total = filled + photo;
  if (total === 0) {
    return (
      <span
        aria-hidden="true"
        className="h-1.5 w-14 shrink-0 rounded-full bg-line"
      />
    );
  }
  const filledPct = Math.round((filled / total) * 100);
  return (
    <span
      aria-hidden="true"
      className="flex h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-line"
    >
      <span className="bg-sage-500" style={{ width: `${filledPct}%` }} />
      <span className="bg-amber" style={{ width: `${100 - filledPct}%` }} />
    </span>
  );
}

/**
 * Wet or dry, said once and the same way everywhere.
 *
 * ── Why this is worth its own mark ────────────────────────────────────────
 *
 * The catalog was entirely canned food until batch 017, so the page never had
 * to say — everything on it was wet, and a badge saying so on every product
 * would have been noise. It is not true any more, and an aisle is arranged by
 * this before it is arranged by anything else: the bags are on one side and the
 * tins on the other, and a range name does not tell you which side you are
 * standing on. "Fancy Feast Kitten" is both.
 *
 * Two colours rather than two words alone, because the point is to be read
 * without being read — blue for wet, tan for dry, consistently, so a block of
 * one form is recognisable as a block before any word in it is.
 *
 * Neither colour is one the states use. Green means done, amber means
 * photographed and a dashed outline means untouched, and those three are the
 * page's primary signal; a form badge borrowing any of them would make a wet
 * product look half-finished. `amber-soft` in particular is deliberately
 * avoided here even though tan is the obvious colour for kibble.
 */
const FORM_STYLE: Record<string, { label: string; className: string }> = {
  wet: { label: "wet", className: "bg-sky-50 text-sky-700" },
  dry: { label: "dry", className: "bg-orange-50 text-orange-700" },
};

function FormBadge({ form, title }: { form: string; title?: string }) {
  const style = FORM_STYLE[form];
  // An unknown form gets nothing at all. A third badge reading "unknown" would
  // put a label on every row the catalog was never told about, which is a lot
  // of ink spent saying nothing.
  if (!style) return null;
  return (
    <span
      title={title}
      className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}

/** One brand, opened: its ranges and what sits under each. */
function BrandPage({
  brand,
  onBack,
}: {
  brand: CoverageBrand;
  onBack: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)_+_2rem)] pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      <button onClick={onBack} className="btn-ghost -ml-4 self-start">
        <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
        All brands
      </button>
      <BrandDetail brand={brand} heading="page" />
    </main>
  );
}

/**
 * One shelf-family on one screen: every brand sharing the house name, stacked.
 *
 * Hill's is why this exists. Science Diet and Prescription Diet stay separate
 * brands — that is how a shopper reads them, and merging their identities
 * would churn every stored composition key — but three cards all beginning
 * "Hill's" read as clutter, and the operator asked for one place, arranged
 * inside the way Fancy Feast is arranged by range. This is that place: the
 * grouping is display-only, and nothing about any product's identity moves.
 */
function FamilyPage({
  name,
  members,
  onBack,
}: {
  name: string;
  members: CoverageBrand[];
  onBack: () => void;
}) {
  const filled = members.reduce((n, b) => n + b.filled, 0);
  const photo = members.reduce((n, b) => n + b.photo, 0);
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)_+_2rem)] pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      <button onClick={onBack} className="btn-ghost -ml-4 self-start">
        <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
        All brands
      </button>
      <div>
        <h1 className="text-[20px] font-semibold text-ink">{name}</h1>
        <p className="mt-1 text-[13px] text-muted">
          {members[0]?.owner ? `${members[0].owner} · ` : ""}
          {members.length} brands · {filled} done
          {photo > 0 ? ` · ${photo} awaiting ingredients` : ""}
        </p>
      </div>
      {members.map((b) => (
        <section
          key={b.key || b.name}
          className="flex flex-col gap-4 border-t border-line pt-4"
        >
          <BrandDetail brand={b} heading="section" />
        </section>
      ))}
    </main>
  );
}

/** A brand's header, ranges and leftovers — the body both pages share. */
function BrandDetail({
  brand,
  heading,
}: {
  brand: CoverageBrand;
  heading: "page" | "section";
}) {
  const Heading = heading === "page" ? "h1" : "h2";
  const withItems = brand.ranges.filter((r) => r.items.length > 0);
  const empty = brand.ranges.filter((r) => r.items.length === 0);

  // Counted in PACKAGES, not products, because that is what is on a shelf and
  // what a barcode is: one recipe in five bags is five things to scan. The
  // per-product counts above stay as they are — they answer "how many recipes
  // do we hold", which is a different question and still the right one there.
  const packTotals = withItems
    .flatMap((r) => r.items)
    .reduce(
      (acc, item) => {
        const form = item.foodForm === "wet" || item.foodForm === "dry" ? item.foodForm : null;
        for (const pack of item.packs) {
          if (form) acc[form] = (acc[form] ?? 0) + 1;
          if (pack.scanned) acc.done += 1;
          acc.total += 1;
        }
        return acc;
      },
      { wet: 0, dry: 0, done: 0, total: 0 } as Record<string, number>
    );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading
          className={
            heading === "page"
              ? "text-[20px] font-semibold text-ink"
              : "text-[17px] font-semibold text-ink"
          }
        >
          {brand.name}
        </Heading>
        <p className="mt-1 text-[13px] text-muted">
          {brand.owner ? `${brand.owner} · ` : ""}
          {brand.filled} done
          {brand.photo > 0 ? ` · ${brand.photo} awaiting ingredients` : ""}
        </p>
        {(packTotals.wet > 0 || packTotals.dry > 0) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-faint">
            {packTotals.wet > 0 && (
              <span className="inline-flex items-center gap-1">
                <FormBadge form="wet" />
                {packTotals.wet}
              </span>
            )}
            {packTotals.dry > 0 && (
              <span className="inline-flex items-center gap-1">
                <FormBadge form="dry" />
                {packTotals.dry}
              </span>
            )}
            {/* Packages, spelt out, because the number is bigger than the
                product count above it and the difference is the whole point of
                the size pills below. */}
            <span>
              · {packTotals.done} of {packTotals.total} packages scanned
            </span>
          </p>
        )}
      </div>

      {withItems.length === 0 && (
        <p className="rounded-input bg-surfaceSoft px-4 py-3 text-[13px] leading-relaxed text-muted">
          Nothing scanned under {brand.name} yet.
          {empty.length > 0
            ? " The ranges below are what to look for on the shelf."
            : ""}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {withItems.map((range) => (
          <section key={range.name} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <span>{range.name}</span>
              {/* "Other" is the catch-all, not a range somebody discovered —
                  badging it as new would be calling every unmatched name a
                  find. */}
              {!range.seeded && range.name !== OTHER_RANGE && (
                <span
                  title="Came off a shelf — not in the seeded list"
                  className="rounded-full bg-sage-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-sage-600"
                >
                  new
                </span>
              )}
              {/* On the heading, because a range is nearly always all one form
                  — badging every product in a wet range would say the same
                  thing forty times. When a range holds both, the badge appears
                  on the products instead; see below. */}
              {range.forms.map((form) => (
                <FormBadge key={form} form={form} />
              ))}
              <span className="text-[11.5px] font-normal text-faint">
                {[
                  range.filled > 0 ? `${range.filled} done` : null,
                  range.photo > 0 ? `${range.photo} to finish` : null,
                  range.known > 0 ? `${range.known} to find` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {range.items.map((item) => (
                <li key={item.codes[0]}>
                  <span
                    // The barcode on the chip itself for a product still to
                    // find: it is the one thing you can match against a shelf
                    // without reading a word.
                    title={
                      item.state === "known"
                        ? `Not scanned — look for ${item.toFind?.join(", ")}`
                        : item.codes.join(", ")
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${
                      item.state === "filled"
                        ? "bg-sage-100 text-sage-700"
                        : item.state === "photo"
                          ? "bg-amber-soft text-ink"
                          : "border border-dashed border-lineStrong text-muted"
                    }`}
                  >
                    {item.state === "filled" ? (
                      <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                    ) : item.state === "photo" ? (
                      <Clock size={12} strokeWidth={2.5} aria-hidden="true" />
                    ) : (
                      <Barcode size={12} strokeWidth={2} aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                    {/* Only where the range holds both forms. Everywhere else
                        the heading has already said it once. */}
                    {range.forms.length > 1 && (
                      <FormBadge form={item.foodForm ?? ""} />
                    )}
                    {/* ── The packages ────────────────────────────────────
                        One pill per barcode, smallest bag first, filled where
                        we have that exact package and outlined where we have
                        only the recipe.

                        This replaced `×5`. The count answered "how many exist"
                        while somebody stood in front of the five bags needing
                        to know WHICH — and with the recipe marked done, the
                        four unscanned sizes were invisible. Shown only when a
                        recipe really has several packages: on the hundred and
                        ninety single-can products it would be a size printed
                        beside every name, saying nothing. */}
                    {item.packs.length > 1 &&
                      item.packs.map((pack) => (
                        <span
                          key={pack.code}
                          title={`${pack.printed}${pack.size ? ` · ${pack.size}` : ""} — ${
                            pack.scanned ? "scanned" : "not scanned"
                          }`}
                          className={`rounded-full px-1.5 py-px text-[10px] font-medium leading-[1.4] ${
                            pack.scanned
                              ? "bg-ink/10 text-ink"
                              : "border border-dashed border-current opacity-55"
                          }`}
                        >
                          {pack.size ?? pack.printed.slice(-4)}
                        </span>
                      ))}
                    {/* A single-package product still to find keeps its
                        barcode on the chip: it is the one thing you can match
                        against a shelf without reading a word. */}
                    {item.state === "known" &&
                      item.packs.length === 1 &&
                      item.toFind?.[0] && (
                        <span className="font-mono text-[10px] tracking-tight opacity-70">
                          {item.toFind[0]}
                        </span>
                      )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {empty.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-line pt-4">
          <h2 className="text-[13px] font-semibold text-ink">
            Nothing scanned yet
          </h2>
          <p className="text-[11.5px] leading-relaxed text-faint">
            Ranges this brand is expected to have. The list was written from
            memory, so it is neither complete nor guaranteed current — a range
            that no longer exists will simply sit here forever.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {empty.map((range) => (
              <li key={range.name}>
                <span className="inline-flex rounded-full border border-dashed border-lineStrong px-2.5 py-1 text-[12px] text-muted">
                  {range.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** A row of mutually exclusive choices, sized for a thumb. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-1 gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`h-8 flex-1 rounded-input text-[12.5px] font-medium transition ${
            value === option.value
              ? "bg-ink text-white"
              : "border border-line bg-surface text-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
