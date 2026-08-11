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
import { brandMatchesQuery } from "@/lib/brand-key";

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
 * still to type. Empty: nothing, go and find it. Read at arm's length with one
 * thumb, in a shop, so anything finer than three would not be read at all.
 *
 * ── Honest about its own edges ────────────────────────────────────────────
 *
 * The brand and range list is seeded from what a model knew, and cannot be a
 * complete catalogue — nothing we can reach knows how many flavours Fancy Feast
 * really has. So an empty range means "the seed list expected this and we have
 * nothing", not "this is all that is left". Brands and ranges that came off a
 * shelf and were never seeded are marked as such, which is the list correcting
 * itself.
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

  const current = openBrand
    ? brands.find((b) => b.key === openBrand) ?? null
    : null;

  if (current) {
    return (
      <BrandPage brand={current} onBack={() => setOpenBrand(null)} />
    );
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
          {visible.map((brand) => (
            <li key={brand.key || "no-brand"}>
              <BrandRow brand={brand} onOpen={() => setOpenBrand(brand.key)} />
            </li>
          ))}
        </ul>
      )}
    </main>
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
        {total === 0 && <span className="text-faint">—</span>}
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

/** One brand, opened: its ranges and what sits under each. */
function BrandPage({
  brand,
  onBack,
}: {
  brand: CoverageBrand;
  onBack: () => void;
}) {
  const withItems = brand.ranges.filter((r) => r.items.length > 0);
  const empty = brand.ranges.filter((r) => r.items.length === 0);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)_+_2rem)] pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      <button onClick={onBack} className="btn-ghost -ml-4 self-start">
        <ArrowLeft size={17} strokeWidth={1.8} aria-hidden="true" />
        All brands
      </button>

      <div>
        <h1 className="text-[20px] font-semibold text-ink">{brand.name}</h1>
        <p className="mt-1 text-[13px] text-muted">
          {brand.owner ? `${brand.owner} · ` : ""}
          {brand.filled} done
          {brand.photo > 0 ? ` · ${brand.photo} awaiting ingredients` : ""}
        </p>
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
              <span className="text-[11.5px] font-normal text-faint">
                {range.filled > 0 && `${range.filled} done`}
                {range.filled > 0 && range.photo > 0 && " · "}
                {range.photo > 0 && `${range.photo} to finish`}
              </span>
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {range.items.map((item) => (
                <li key={item.codes[0]}>
                  <span
                    title={item.codes.join(", ")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${
                      item.state === "filled"
                        ? "bg-sage-100 text-sage-700"
                        : "bg-amber-soft text-ink"
                    }`}
                  >
                    {item.state === "filled" ? (
                      <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                    ) : (
                      <Clock size={12} strokeWidth={2.5} aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                    {/* Several barcodes under one recipe: pack sizes. Worth
                        showing — it is the difference between "I did the small
                        bag" and "I did all three". */}
                    {item.codes.length > 1 && (
                      <span className="text-[10px] font-semibold opacity-70">
                        ×{item.codes.length}
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
    </main>
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
