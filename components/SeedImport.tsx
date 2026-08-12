"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { verdictLabel, type ImportVerdict } from "@/lib/known-import";

/**
 * Put the seeded formulas into the catalog, and say what it will do first.
 *
 * ── Why it previews ───────────────────────────────────────────────────────
 *
 * Because the interesting answer is usually "most of these are already there".
 * A button that just runs and reports a number afterwards makes you guess
 * whether it did anything you wanted; one that says "22 to write, 3 already
 * identical, 2 conflicts" before you press it is a decision rather than a leap.
 *
 * ── Conflicts are shown, never resolved here ──────────────────────────────
 *
 * A barcode already holding a different composition from a source of equal
 * standing is left alone and named. One barcode really does carry two formulas
 * over time, and the fix is a person looking at it — not a checkbox.
 */

interface Preview {
  total: number;
  counts: Record<ImportVerdict, number>;
  products?: { code: string; name: string; verdict: ImportVerdict }[];
  error?: string;
  message?: string;
}

interface Result {
  ok?: boolean;
  written?: number;
  reportsCleared?: number;
  counts?: Record<ImportVerdict, number>;
  conflicts?: { code: string; name: string }[];
  flagged?: { code: string; note: string | null }[];
  error?: string;
  message?: string;
}

export function SeedImport({ adminToken }: { adminToken: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/known-products/import", {
        headers: { "x-admin-token": adminToken },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as Preview;
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Couldn't check the catalog.");
        return;
      }
      setPreview(data);
    } catch {
      setError("Couldn't check the catalog — check your connection.");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/known-products/import", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as Result;
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Couldn't write to the catalog.");
        return;
      }
      setResult(data);
      void load();
    } catch {
      setError("Couldn't write to the catalog — check your connection.");
    } finally {
      setRunning(false);
    }
  }, [running, adminToken, load]);

  /**
   * Throw away the stored reports for these products so they rebuild.
   *
   * A report is generated once from the stored ingredients and then served to
   * everyone — so it keeps its original wording after the catalog learns
   * something it was written without. Clearing loses nothing: the ingredients
   * stay, and the next reader waits a few seconds for one written against what
   * we hold now. Nobody opens it, nothing is spent.
   */
  const clearReports = useCallback(async () => {
    if (clearing) return;
    setClearing(true);
    setError(null);
    setCleared(null);
    try {
      const res = await fetch("/api/known-products/reports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        products?: number;
        cleared?: number;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Couldn't clear the reports.");
        return;
      }
      setCleared(
        data.cleared === 0
          ? "None were stored — nothing to rebuild."
          : `${data.cleared} report${data.cleared === 1 ? "" : "s"} cleared. They rebuild when somebody opens the product.`
      );
    } catch {
      setError("Couldn't clear the reports — check your connection.");
    } finally {
      setClearing(false);
    }
  }, [clearing, adminToken]);

  const toWrite = preview?.counts?.write ?? 0;

  return (
    <section className="card flex flex-col gap-3 p-4">
      <div>
        <h2 className="text-[14px] font-semibold text-ink">Seeded formulas</h2>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
          Fancy Feast and Friskies compositions from manufacturer records. Filed
          as community readings — a photograph of the real pack still wins.
        </p>
      </div>

      {loading && !preview ? (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 className="animate-spin" size={15} aria-hidden="true" />
          Checking the catalog…
        </p>
      ) : preview ? (
        <ul className="flex flex-col gap-1 text-[12.5px] text-muted">
          {(
            ["write", "identical", "ours-is-better", "conflict"] as ImportVerdict[]
          ).map((verdict) => {
            const n = preview.counts?.[verdict] ?? 0;
            if (n === 0) return null;
            return (
              <li key={verdict} className="flex items-center gap-2">
                <span
                  className={`w-6 text-right font-semibold tabular-nums ${
                    verdict === "write"
                      ? "text-sage-600"
                      : verdict === "conflict"
                        ? "text-amber"
                        : "text-faint"
                  }`}
                >
                  {n}
                </span>
                <span>{verdictLabel(verdict)}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error && <p className="text-[12.5px] text-risk-high">{error}</p>}

      {result && (
        <div className="rounded-input bg-sage-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-sage-700">
            <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            {result.written} written
            {result.reportsCleared ? `, ${result.reportsCleared} stale reports cleared` : ""}
          </p>
          {result.flagged && result.flagged.length > 0 && (
            <p className="mt-1 text-[11px] leading-snug text-muted">
              {result.flagged.length} of them have older records under the same
              barcode — the current formula was written.
            </p>
          )}
        </div>
      )}

      {preview?.counts?.conflict ? (
        <div className="rounded-input bg-amber-soft px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
            <AlertTriangle size={13} strokeWidth={2.2} aria-hidden="true" />
            {preview.counts.conflict} left alone
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            The catalog holds a different composition for these, from a reading
            of equal standing. One barcode can carry two formulas over time, so
            they need a person rather than an overwrite.
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {preview.products
              ?.filter((p) => p.verdict === "conflict")
              .map((p) => (
                <li key={p.code} className="text-[11px] text-muted">
                  <span className="font-mono">{p.code}</span> · {p.name}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={run}
        disabled={running || loading || toWrite === 0}
        className="btn-secondary"
      >
        {running ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <Download size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
        {toWrite === 0 ? "Nothing to write" : `Write ${toWrite} to the catalog`}
      </button>

      {/* Separate from the write, because it is a separate decision: the
          catalog can be right while the report served for it was written
          before the catalog knew what it knows now. */}
      <button onClick={clearReports} disabled={clearing} className="btn-ghost">
        {clearing ? (
          <Loader2 className="animate-spin" size={15} aria-hidden="true" />
        ) : (
          <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" />
        )}
        Rebuild their reports
      </button>
      {cleared && (
        <p className="-mt-1 text-[11.5px] leading-snug text-muted">{cleared}</p>
      )}
    </section>
  );
}
