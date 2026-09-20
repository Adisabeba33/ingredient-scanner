"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Loader2,
  ScanLine,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { missLabel, printedForm } from "@/lib/miss-verdict";
import {
  FLASH_FAILED,
  FLASH_MS,
  buzz,
  flashFor,
  type FlashKind,
  type ScanFlash,
} from "@/lib/scan-flash";
import type { MissClassification } from "@/lib/miss-verdict";
import {
  addScan,
  isHit,
  outcomeLabel,
  summarise,
  toTsv,
  OUTCOME_ORDER,
  type ScanOutcome,
  type TestScan,
} from "@/lib/scan-test";
import {
  brandChoices,
  brandFit,
  brandWalkTsv,
  researchQueue,
  searchBrandChoices,
  summariseBrandWalk,
  type BrandChoice,
} from "@/lib/brand-walk";

/**
 * Test Mode — the aisle walk, and the brand walk.
 *
 * ── What this screen is for ───────────────────────────────────────────────
 *
 * Standing in a dog-food aisle, scanning everything on the shelf, and finding
 * out what fraction of it the app can actually answer. That number exists
 * nowhere else: the coverage page counts what we chose to research and the
 * miss list counts what shoppers happened to scan, and neither is a sample of
 * a shelf.
 *
 * ── Two walks, because they answer different questions ────────────────────
 *
 * **Whole aisle** is the measurement. Scan everything in front of you, get the
 * hit rate. It is the gate on the release and it must stay unbiased, which is
 * why it takes whatever the shelf hands it in whatever order.
 *
 * **One brand** is the opposite errand. You tell the tool which shelf strip
 * you are standing at, walk that brand end to end, and come home with the list
 * of ITS barcodes that are not in our catalog. That list is the input a
 * research brief needs (`docs/SEEDING-A-BATCH.md` works one brand at a time)
 * and until now nothing could produce it: an aisle's misses are scattered
 * across every maker in it, and a miss carries no brand of its own.
 *
 * The reasoning behind the second — above all why the OPERATOR naming the
 * brand is evidence rather than a guess, and why a brand walk accumulates
 * across shops while an aisle walk does not — is in `lib/brand-walk.ts`.
 *
 * ── Why it deliberately does not show the product ─────────────────────────
 *
 * The other two desks are for capturing. This one is for measuring, and a
 * screen that showed the ingredient list would quietly turn into the other
 * two: you would stop on the interesting ones, photograph a couple, lose the
 * thread, and come home with eleven scans and no number.
 *
 * So a scan says one thing — answered, or not — in letters big enough to read
 * at arm's length with a can in the other hand, and the next scan starts
 * immediately. The detail is all kept; it is just underneath, for afterwards.
 *
 * ── And why the runs live in the browser ──────────────────────────────────
 *
 * An aisle run is one person's walk down one aisle, and it is finished when
 * they leave the shop. Putting it in the shared database would mean two people
 * testing two shops on the same afternoon average into one meaningless
 * number. The codes themselves are not lost either way: asking the consumer
 * app is what a shopper's phone does, so a miss lands in `barcode_cache` and
 * turns up in the miss list below, counted alongside the real ones.
 *
 * Brand walks live there too, one per brand, and are NOT cleared between
 * visits — see the note in `lib/brand-walk.ts` on why the union across shops
 * is the honest answer for a brand and a mixture for an aisle.
 */

const STORAGE_KEY = "catalog-scanner.test-run";
/** One accumulating walk per brand, keyed by the coverage page's brand key. */
const WALKS_KEY = "catalog-scanner.brand-walks";
/**
 * Which walk was open, and which brand.
 *
 * Remembered because the phone locks in the shop and the screen is reopened
 * one-handed by somebody holding a tin. Coming back to "whole aisle" after
 * every lock would have them re-pick the brand a dozen times per walk, and
 * the scans made before they noticed would land in the wrong list.
 */
const MODE_KEY = "catalog-scanner.test-mode";
const BRAND_KEY = "catalog-scanner.test-brand";

type WalkMode = "aisle" | "brand";

interface ProbeResponse {
  code?: string;
  outcome?: ScanOutcome;
  name?: string | null;
  brands?: string | null;
  source?: string | null;
  searches?: number | null;
  miss?: MissClassification | null;
  error?: string;
  message?: string;
  /** Which app was asked. Shown on failure — see the error box below. */
  askedAt?: string | null;
}

/** Loud, and readable at arm's length. Colour carries the same answer as the word. */
const TONE: Record<ScanOutcome, { box: string; text: string }> = {
  ours: { box: "border-sage-500 bg-sage-100", text: "text-sage-700" },
  open: { box: "border-line bg-surface", text: "text-ink" },
  multipack: { box: "border-line bg-surface", text: "text-muted" },
  "no-ingredients": { box: "border-amber bg-amber-soft", text: "text-amber" },
  "not-found": { box: "border-lineStrong bg-surface", text: "text-muted" },
};

/** The one word that goes on the big card. */
const HEADLINE: Record<ScanOutcome, string> = {
  ours: "IN THE CATALOG",
  open: "ANSWERED — not by us",
  multipack: "VARIETY PACK",
  "no-ingredients": "HALF-WRITTEN",
  "not-found": "NOT IN THE DATABASE",
};

const FLASH_TONE: Record<FlashKind, { box: string; text: string }> = {
  ok: { box: "bg-sage-600/90", text: "text-white" },
  odd: { box: "bg-amber/90", text: "text-white" },
  none: { box: "bg-ink/85", text: "text-white" },
};

const FLASH_ICON: Record<FlashKind, typeof Check> = {
  ok: Check,
  odd: AlertTriangle,
  none: SearchX,
};

/**
 * One second of "yes, that landed" over the camera.
 *
 * Also covers the wait before it. A lookup takes a moment, and a moment of
 * nothing is exactly the silence this overlay exists to end — so the spinner
 * sits in the same place, at the same size, and the answer replaces it rather
 * than arriving somewhere new.
 *
 */
function ScanFlashOverlay({
  flash,
  busy,
}: {
  flash: ScanFlash | null;
  busy: boolean;
}) {
  if (!flash && !busy) return null;
  const tone = flash ? FLASH_TONE[flash.kind] : { box: "bg-ink/70", text: "text-white" };
  const Icon = flash ? FLASH_ICON[flash.kind] : Loader2;
  return (
    <div
      // z-[60] clears the reader's z-50. `pointer-events-none` throughout:
      // the camera underneath is live and its close button must stay reachable
      // — the next tin cannot be waiting for anything to be dismissed.
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
      // Announced rather than only drawn: the same second of feedback, for
      // somebody who is not watching the screen at all.
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex flex-col items-center gap-2 rounded-2xl px-6 py-5 ${tone.box}`}
      >
        <Icon
          size={44}
          strokeWidth={2.5}
          className={`${tone.text} ${flash ? "" : "animate-spin"}`}
          aria-hidden="true"
        />
        <span className={`text-[15px] font-semibold tracking-wide ${tone.text}`}>
          {flash ? flash.headline : "CHECKING"}
        </span>
      </div>
    </div>
  );
}

export function TestScanner({ adminToken }: { adminToken: string }) {
  const [mode, setMode] = useState<WalkMode>("aisle");
  const [aisleRun, setAisleRun] = useState<TestScan[]>([]);
  const [walks, setWalks] = useState<Record<string, TestScan[]>>({});
  const [brand, setBrand] = useState<BrandChoice | null>(null);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");

  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<TestScan | null>(null);
  const [error, setError] = useState<string | null>(null);
  /**
   * The address the desk tried, kept beside the error.
   *
   * A lookup failure has two completely different causes that read the same
   * from a shop aisle — the shopper's app is down, or this scanner was never
   * told where it lives — and the address separates them at a glance. Without
   * it the only honest next step is to walk out and open a laptop.
   */
  const [errorAt, setErrorAt] = useState<string | null>(null);
  /**
   * The answer, on the camera, for a moment.
   *
   * Kept apart from `last` because they answer different questions and live
   * different lengths of time: `last` is the card below, which stays until the
   * next scan and spells out the detail, and this is the second of feedback
   * that tells a hand holding a tin to move on. See lib/scan-flash.ts.
   */
  const [flash, setFlash] = useState<ScanFlash | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  /** Set once the stored runs have been read, so an empty first render cannot save over them. */
  const loaded = useRef(false);

  const choices = useMemo(() => brandChoices(), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAisleRun(JSON.parse(raw) as TestScan[]);
    } catch {
      // A corrupt or unreadable store is an empty run, not a broken screen.
    }
    try {
      const raw = localStorage.getItem(WALKS_KEY);
      if (raw) setWalks(JSON.parse(raw) as Record<string, TestScan[]>);
    } catch {
      // Same: a brand walk that cannot be read starts again, it does not throw.
    }
    try {
      const storedMode = localStorage.getItem(MODE_KEY);
      if (storedMode === "brand" || storedMode === "aisle") setMode(storedMode);
      const storedBrand = localStorage.getItem(BRAND_KEY);
      if (storedBrand) {
        // Matched against the seed rather than trusted: a brand can leave the
        // seed file between visits, and a walk attributed to a brand this
        // build no longer knows would file barcodes under a name nothing can
        // look up.
        setBrand(brandChoices().find((c) => c.key === storedBrand) ?? null);
      }
    } catch {
      // No stored preference is the default preference.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aisleRun));
    } catch {
      // Out of quota or private mode. The run still works for this session.
    }
  }, [aisleRun]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(WALKS_KEY, JSON.stringify(walks));
    } catch {
      // As above — the walk survives the session even if it cannot be stored.
    }
  }, [walks]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(MODE_KEY, mode);
      if (brand) localStorage.setItem(BRAND_KEY, brand.key);
      else localStorage.removeItem(BRAND_KEY);
    } catch {
      // Losing the preference costs one tap, so it is not worth a message.
    }
  }, [mode, brand]);

  /** The walk being added to and displayed. */
  const run = useMemo(() => {
    if (mode === "brand") return brand ? (walks[brand.key] ?? []) : [];
    return aisleRun;
  }, [mode, brand, walks, aisleRun]);

  const aisleSummary = useMemo(() => summarise(run), [run]);
  const brandSummary = useMemo(
    () => (brand ? summariseBrandWalk(run, brand.key) : null),
    [run, brand]
  );
  const queue = useMemo(() => researchQueue(run), [run]);
  const misses = useMemo(() => run.filter((s) => !isHit(s.outcome)), [run]);

  /** Where a scan lands. The only thing the two walks do differently. */
  /** Put an answer on the camera, and take it down again. */
  const showFlash = useCallback((next: ScanFlash) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(next);
    buzz(next.vibrate);
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  }, []);

  // A flash outliving the screen would fire setState on nothing.
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  const record = useCallback(
    (scan: Omit<TestScan, "times">) => {
      showFlash(
        flashFor(
          scan.outcome,
          brand ? brandFit(brand.key, scan.answeredBrand) : "unnamed"
        )
      );
      if (mode === "brand") {
        if (!brand) return;
        setWalks((prev) => {
          const next = addScan(prev[brand.key] ?? [], scan);
          setLast(next[0]);
          return { ...prev, [brand.key]: next };
        });
        return;
      }
      setAisleRun((prev) => {
        const next = addScan(prev, scan);
        setLast(next[0]);
        return next;
      });
    },
    [mode, brand, showFlash]
  );

  const probe = useCallback(
    async (code: string) => {
      setBusy(true);
      setError(null);
      setErrorAt(null);
      try {
        const res = await fetch("/api/scan-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code }),
        });
        const data = (await res.json().catch(() => ({}))) as ProbeResponse;
        if (!res.ok) {
          // Nothing is recorded on a failure. A run that counted an
          // unreachable app as a miss would be worse than no run at all.
          setError(data.message ?? data.error ?? "Lookup failed.");
          setErrorAt(data.askedAt ?? null);
          showFlash(FLASH_FAILED);
          return;
        }
        record({
          code: data.code ?? code,
          outcome: data.outcome ?? "not-found",
          name: data.name ?? data.brands ?? null,
          // Kept apart from the display name: it is the only thing a stray
          // tin can be caught with. See lib/brand-walk.ts.
          answeredBrand: data.brands ?? null,
          source: data.source ?? null,
          miss: data.miss ?? null,
          at: Date.now(),
        });
      } catch {
        setError("Couldn't reach the desk — check your connection.");
        showFlash(FLASH_FAILED);
      } finally {
        setBusy(false);
      }
    },
    [adminToken, record, showFlash]
  );

  /**
   * Re-arm the reader after every scan.
   *
   * `BarcodeScanner` is built for capture: it locks on, stops the camera and
   * hands the code back once, because the next thing in that flow is
   * photographing the pack. Here the next thing is the next can — an aisle walk
   * is thirty of them — and a screen that needed reopening after each one is a
   * screen nobody finishes, which would leave the hit rate measured over
   * whatever fraction of the shelf somebody had patience for.
   *
   * Bumping a key remounts it, which restarts the camera from scratch. Done
   * after the answer comes back rather than immediately, so the camera is not
   * re-reading the can still in front of it while the lookup is in flight. A
   * double read would be harmless anyway — `addScan` folds it into one product
   * — but the flash of a verdict is what tells the hand to move on.
   */
  const [readerKey, setReaderKey] = useState(0);
  const onDetected = useCallback(
    (code: string) => {
      void probe(code).finally(() => setReaderKey((k) => k + 1));
    },
    [probe]
  );

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        mode === "brand" && brand ? brandWalkTsv(brand.name, run) : toTsv(run)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't reach the clipboard.");
    }
  }, [run, mode, brand]);

  const clearRun = useCallback(() => {
    if (mode === "brand") {
      if (!brand) return;
      setWalks((prev) => {
        const next = { ...prev };
        delete next[brand.key];
        return next;
      });
    } else {
      setAisleRun([]);
    }
    setLast(null);
  }, [mode, brand]);

  const filtered = useMemo(
    () => searchBrandChoices(choices, query).slice(0, 40),
    [choices, query]
  );

  /** The stray guard: the app named a brand, and it is not the one we are at. */
  const lastFit = brand && last ? brandFit(brand.key, last.answeredBrand) : "unnamed";

  return (
    <section className="flex flex-col gap-3">
      {/* Which walk. Two words each, because this is read one-handed. */}
      <div className="flex gap-2">
        {(
          [
            ["aisle", "Whole aisle"],
            ["brand", "One brand"],
          ] as [WalkMode, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setMode(value);
              setLast(null);
              setError(null);
              setErrorAt(null);
              setScanning(false);
              if (value === "brand" && !brand) setPicking(true);
            }}
            className={`h-10 flex-1 rounded-input border text-[13px] font-medium ${
              mode === value
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* The brand, and the picker for it. */}
      {mode === "brand" && (
        <div className="card flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">
              {brand ? brand.name : "Which shelf are you at?"}
            </h2>
            {brand && (
              <button
                onClick={() => {
                  setPicking((p) => !p);
                  setQuery("");
                }}
                className="text-[12px] text-muted underline decoration-line underline-offset-2"
              >
                {picking ? "close" : "change"}
              </button>
            )}
          </div>

          {brand && !picking && (
            <p className="text-[11.5px] leading-snug text-muted">
              {brand.owner ? `${brand.owner} · ` : ""}
              {brand.seededProducts === 0
                ? "nothing seeded under this brand yet — every code you scan is new"
                : `${brand.seededProducts} recipes seeded, ${brand.seededCodes} barcodes`}
            </p>
          )}

          {(picking || !brand) && (
            <>
              <div className="flex items-center gap-2 rounded-input border border-line bg-surface px-3">
                <Search size={14} strokeWidth={1.8} className="text-faint" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Brand, or the company that owns it"
                  className="h-10 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
                />
              </div>
              <ul className="flex max-h-72 flex-col divide-y divide-line overflow-y-auto">
                {filtered.map((choice) => (
                  <li key={choice.key}>
                    <button
                      onClick={() => {
                        setBrand(choice);
                        setPicking(false);
                        setQuery("");
                        setLast(null);
                      }}
                      className="flex w-full items-baseline justify-between gap-3 py-2 text-left"
                    >
                      <span className="text-[13.5px] text-ink">
                        {choice.name}
                        {choice.owner && (
                          <span className="ml-1.5 text-[11.5px] text-faint">
                            {choice.owner}
                          </span>
                        )}
                      </span>
                      {/* Which shelf is worth the walk, answered before it. */}
                      <span
                        className={`shrink-0 text-[11.5px] tabular-nums ${
                          choice.seededProducts === 0 ? "text-amber" : "text-muted"
                        }`}
                      >
                        {choice.seededProducts === 0
                          ? "untouched"
                          : `${choice.seededProducts} seeded`}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="py-2 text-[12.5px] text-muted">
                    No brand by that name in the seed. Walk it under the closest
                    one, or add it to <code>data/us-pet-brands.ts</code>.
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}

      {/* The number each walk exists to produce — and they are different numbers. */}
      {(mode === "aisle" || brand) && (
        <div className="card flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">
              {mode === "brand" ? "This brand's shelf" : "Shelf test"}
            </h2>
            <span className="text-[12px] text-muted">
              {aisleSummary.total === 0
                ? "nothing scanned yet"
                : `${aisleSummary.total} product${aisleSummary.total === 1 ? "" : "s"}`}
              {aisleSummary.reads > aisleSummary.total
                ? ` · ${aisleSummary.reads} reads`
                : ""}
            </span>
          </div>

          {mode === "brand" && brandSummary ? (
            // A brand walk is not run to produce a percentage. It is run to
            // come home with a list, so the list is the big number.
            <div className="flex items-end gap-5">
              <div>
                <div className="text-[40px] font-semibold leading-none text-ink tabular-nums">
                  {brandSummary.toFind}
                </div>
                <div className="mt-1 text-[11.5px] text-muted">
                  to find ({brandSummary.total} scanned)
                </div>
              </div>
              <div>
                <div className="text-[24px] font-semibold leading-none text-sage-700 tabular-nums">
                  {brandSummary.ourRate === null ? "—" : `${brandSummary.ourRate}%`}
                </div>
                <div className="mt-1 text-[11.5px] text-muted">from our catalog</div>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-5">
              <div>
                <div className="text-[40px] font-semibold leading-none text-ink tabular-nums">
                  {aisleSummary.hitRate === null ? "—" : `${aisleSummary.hitRate}%`}
                </div>
                <div className="mt-1 text-[11.5px] text-muted">
                  answered ({aisleSummary.hits} of {aisleSummary.total})
                </div>
              </div>
              {/* The second number, and the reason there are two. A hit rate
                  carried by somebody else's database is one outage from zero. */}
              <div>
                <div className="text-[24px] font-semibold leading-none text-sage-700 tabular-nums">
                  {aisleSummary.ourRate === null ? "—" : `${aisleSummary.ourRate}%`}
                </div>
                <div className="mt-1 text-[11.5px] text-muted">from our catalog</div>
              </div>
            </div>
          )}

          {aisleSummary.total > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-[11.5px]">
              {OUTCOME_ORDER.filter((o) => aisleSummary.byOutcome[o] > 0).map((o) => (
                <span key={o} className={TONE[o].text}>
                  <span className="font-semibold tabular-nums">
                    {aisleSummary.byOutcome[o]}
                  </span>{" "}
                  {outcomeLabel(o)}
                </span>
              ))}
            </div>
          )}

          {brandSummary && brandSummary.strays > 0 && (
            <p className="text-[11.5px] leading-snug text-amber">
              {brandSummary.strays} scanned here came back as another brand —
              tins in the wrong place, or the wrong shelf. They are marked in
              the list and in the export.
            </p>
          )}

          {mode === "brand" && (
            <p className="border-t border-line pt-2 text-[11.5px] leading-snug text-muted">
              This walk keeps adding up across shops and visits — a brand&apos;s
              barcodes are spread over several of them.
            </p>
          )}
        </div>
      )}

      {/* The reader, and the answer. */}
      {mode === "brand" && !brand ? (
        <p className="rounded-input border border-line bg-surface px-3 py-2.5 text-[12.5px] text-muted">
          Pick the brand you are standing at first — it is what the codes get
          filed under, and nothing else can tell afterwards.
        </p>
      ) : scanning ? (
        // The reader is `fixed inset-0 z-50` — a full-screen camera, not a box
        // in this column. That is the whole reason the verdict was invisible:
        // the card below it in the DOM is behind it on the glass. So the flash
        // is fixed too, one layer up, and rendered as a SIBLING rather than
        // wrapped around the reader — a wrapper would have done nothing, since
        // a fixed child does not position against it.
        <>
          <BarcodeScanner
            key={readerKey}
            onDetected={onDetected}
            onCancel={() => setScanning(false)}
          />
          <ScanFlashOverlay flash={flash} busy={busy} />
        </>
      ) : (
        <button
          onClick={() => {
            setScanning(true);
            setError(null);
            setErrorAt(null);
          }}
          className="flex h-12 items-center justify-center gap-2 rounded-input bg-ink text-[14px] font-medium text-white"
        >
          <ScanLine size={16} strokeWidth={2} aria-hidden="true" />
          {mode === "brand" && brand ? `Scan ${brand.name}` : "Scan a shelf"}
        </button>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 text-[13px] text-muted">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          asking the app…
        </div>
      )}

      {error && (
        <div className="rounded-input border border-amber bg-amber-soft px-3 py-2.5 text-[12.5px] leading-snug text-ink">
          {error}
          {errorAt && (
            <span className="mt-1 block break-all font-mono text-[11px] text-muted">
              asked: {errorAt}
            </span>
          )}
          <span className="mt-0.5 block text-[11.5px] text-muted">
            Nothing was added to the run.
          </span>
        </div>
      )}

      {/* One scan, one answer, big. No product detail on purpose — see the note
          at the top of this file. */}
      {last && !busy && (
        <div
          className={`rounded-input border px-4 py-4 text-center ${TONE[last.outcome].box}`}
        >
          <div className={`text-[20px] font-semibold ${TONE[last.outcome].text}`}>
            {HEADLINE[last.outcome]}
          </div>
          <div className="mt-1 font-mono text-[12px] text-muted">
            {printedForm(last.code)}
            {last.times > 1 ? ` · scanned ${last.times}×` : ""}
          </div>
          {/* Said at the moment it can still be acted on: the tin is in the
              hand, and putting it back is the fix. */}
          {lastFit === "different" && (
            <div className="mt-1.5 text-[12px] font-medium leading-snug text-amber">
              That is {last.answeredBrand} — not {brand?.name}. A tin in the
              wrong place?
            </div>
          )}
          {last.miss && (
            <div className="mt-1.5 text-[12px] leading-snug text-muted">
              {missLabel(last.miss.verdict)}
              {last.miss.maker ? ` · ${last.miss.maker}` : ""}
            </div>
          )}
        </div>
      )}

      {/* Afterwards: what was missed, and what each one would take to fix. */}
      {run.length > 0 && (
        <div className="card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13.5px] font-semibold text-ink">
              {mode === "brand"
                ? `To find — ${queue.length}`
                : `Missed — ${misses.length} of ${aisleSummary.total}`}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 rounded-input border border-line px-2.5 py-1.5 text-[12px] text-muted"
              >
                {copied ? (
                  <Check size={13} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <ClipboardCopy size={13} strokeWidth={1.8} aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy run"}
              </button>
              <button
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    setTimeout(() => setConfirmClear(false), 4000);
                    return;
                  }
                  clearRun();
                  setConfirmClear(false);
                }}
                className={`flex items-center gap-1.5 rounded-input border px-2.5 py-1.5 text-[12px] ${
                  confirmClear
                    ? "border-amber bg-amber-soft text-amber"
                    : "border-line text-muted"
                }`}
              >
                {confirmClear ? (
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
                )}
                {confirmClear
                  ? mode === "brand"
                    ? `Clear ${brand?.name}?`
                    : "Clear the run?"
                  : "Clear"}
              </button>
            </div>
          </div>

          {(mode === "brand" ? queue : misses).length === 0 ? (
            <p className="text-[12.5px] text-muted">
              Everything scanned came back answered.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {(mode === "brand" ? queue : misses).map((m) => (
                <li key={m.code} className="py-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[12.5px] text-ink">
                      {printedForm(m.code)}
                    </span>
                    <span className={`text-[11.5px] ${TONE[m.outcome].text}`}>
                      {outcomeLabel(m.outcome)}
                    </span>
                  </div>
                  {/* The verdict is the actionable half: one of these buckets
                      is a button press on this very desk. */}
                  {m.miss && (
                    <div className="mt-0.5 text-[11.5px] leading-snug text-muted">
                      {missLabel(m.miss.verdict)}
                      {m.miss.seededAs ? ` · ${m.miss.seededAs}` : ""}
                      {!m.miss.seededAs && m.miss.maker ? ` · ${m.miss.maker}` : ""}
                      {m.miss.insteadUse
                        ? ` · scan ${printedForm(m.miss.insteadUse)} instead`
                        : ""}
                    </div>
                  )}
                  {brand && brandFit(brand.key, m.answeredBrand) === "different" && (
                    <div className="mt-0.5 text-[11.5px] leading-snug text-amber">
                      the app calls this {m.answeredBrand}
                    </div>
                  )}
                  {m.name && (
                    <div className="mt-0.5 text-[11.5px] text-faint">{m.name}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
