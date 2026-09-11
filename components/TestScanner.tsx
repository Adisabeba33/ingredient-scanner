"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ClipboardCopy,
  Loader2,
  ScanLine,
  Trash2,
  X,
} from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { missLabel, printedForm } from "@/lib/miss-verdict";
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

/**
 * Test Mode — the aisle walk.
 *
 * ── What this screen is for ───────────────────────────────────────────────
 *
 * Standing in a dog-food aisle, scanning everything on the shelf, and finding
 * out what fraction of it the app can actually answer. That number exists
 * nowhere else: the coverage page counts what we chose to research and the
 * miss list counts what shoppers happened to scan, and neither is a sample of
 * a shelf.
 *
 * ── Why it deliberately does not show the product ─────────────────────────
 *
 * The other two modes are for capturing. This one is for measuring, and a
 * screen that showed the ingredient list would quietly turn into the other
 * two: you would stop on the interesting ones, photograph a couple, lose the
 * thread, and come home with eleven scans and no number.
 *
 * So a scan says one thing — answered, or not — in letters big enough to read
 * at arm's length with a can in the other hand, and the next scan starts
 * immediately. The detail is all kept; it is just underneath, for afterwards.
 *
 * ── And why the run lives in the browser ──────────────────────────────────
 *
 * A run is one person's walk down one aisle, and it is finished when they
 * leave the shop. Putting it in the shared database would mean two people
 * testing two shops on the same afternoon average into one meaningless
 * number. The codes themselves are not lost either way: asking the consumer
 * app is what a shopper's phone does, so a miss lands in `barcode_cache` and
 * turns up in the miss list below, counted alongside the real ones.
 */

const STORAGE_KEY = "catalog-scanner.test-run";

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

export function TestScanner({ adminToken }: { adminToken: string }) {
  const [run, setRun] = useState<TestScan[]>([]);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<TestScan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  /** Set once the stored run has been read, so an empty first render cannot save over it. */
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRun(JSON.parse(raw) as TestScan[]);
    } catch {
      // A corrupt or unreadable store is an empty run, not a broken screen.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
    } catch {
      // Out of quota or private mode. The run still works for this session.
    }
  }, [run]);

  const summary = useMemo(() => summarise(run), [run]);

  const probe = useCallback(
    async (code: string) => {
      setBusy(true);
      setError(null);
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
          setError(
            data.message
              ? `${data.error ?? "Lookup failed"} — ${data.message}`
              : (data.error ?? "Lookup failed.")
          );
          return;
        }
        const scan: Omit<TestScan, "times"> = {
          code: data.code ?? code,
          outcome: data.outcome ?? "not-found",
          name: data.name ?? data.brands ?? null,
          source: data.source ?? null,
          miss: data.miss ?? null,
          at: Date.now(),
        };
        setRun((prev) => {
          const next = addScan(prev, scan);
          setLast(next[0]);
          return next;
        });
      } catch {
        setError("Couldn't reach the desk — check your connection.");
      } finally {
        setBusy(false);
      }
    },
    [adminToken]
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
      await navigator.clipboard.writeText(toTsv(run));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't reach the clipboard.");
    }
  }, [run]);

  const misses = useMemo(() => run.filter((s) => !isHit(s.outcome)), [run]);

  return (
    <section className="flex flex-col gap-3">
      {/* The number the whole mode exists to produce. */}
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-ink">Shelf test</h2>
          <span className="text-[12px] text-muted">
            {summary.total === 0
              ? "nothing scanned yet"
              : `${summary.total} product${summary.total === 1 ? "" : "s"}`}
            {summary.reads > summary.total ? ` · ${summary.reads} reads` : ""}
          </span>
        </div>

        <div className="flex items-end gap-5">
          <div>
            <div className="text-[40px] font-semibold leading-none text-ink tabular-nums">
              {summary.hitRate === null ? "—" : `${summary.hitRate}%`}
            </div>
            <div className="mt-1 text-[11.5px] text-muted">
              answered ({summary.hits} of {summary.total})
            </div>
          </div>
          {/* The second number, and the reason there are two. A hit rate
              carried by somebody else's database is one outage from zero. */}
          <div>
            <div className="text-[24px] font-semibold leading-none text-sage-700 tabular-nums">
              {summary.ourRate === null ? "—" : `${summary.ourRate}%`}
            </div>
            <div className="mt-1 text-[11.5px] text-muted">from our catalog</div>
          </div>
        </div>

        {summary.total > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2 text-[11.5px]">
            {OUTCOME_ORDER.filter((o) => summary.byOutcome[o] > 0).map((o) => (
              <span key={o} className={TONE[o].text}>
                <span className="font-semibold tabular-nums">
                  {summary.byOutcome[o]}
                </span>{" "}
                {outcomeLabel(o)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The reader, and the answer. */}
      {scanning ? (
        <BarcodeScanner
          key={readerKey}
          onDetected={onDetected}
          onCancel={() => setScanning(false)}
        />
      ) : (
        <button
          onClick={() => {
            setScanning(true);
            setError(null);
          }}
          className="flex h-12 items-center justify-center gap-2 rounded-input bg-ink text-[14px] font-medium text-white"
        >
          <ScanLine size={16} strokeWidth={2} aria-hidden="true" />
          Scan a shelf
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
              Missed — {misses.length} of {summary.total}
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
                  setRun([]);
                  setLast(null);
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
                {confirmClear ? "Clear the run?" : "Clear"}
              </button>
            </div>
          </div>

          {misses.length === 0 ? (
            <p className="text-[12.5px] text-muted">
              Everything scanned came back answered.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {misses.map((m) => (
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
