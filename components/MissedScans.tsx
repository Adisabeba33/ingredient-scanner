"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { missLabel, MISS_ORDER, type MissVerdict } from "@/lib/miss-verdict";

/**
 * The products people reached for and did not get.
 *
 * ── Why this is worth a panel and not a report you run ────────────────────
 *
 * Because the answer it gives changes what you do next, and nothing else on
 * the desk can give it. "Not found" in a shop has four different causes and
 * they look identical from the aisle:
 *
 *   - we hold it and never wrote it to the catalog  → one button, here
 *   - it is a case code                             → already known, ignore
 *   - it is seeded with no ingredients yet          → already on the list
 *   - we genuinely do not have it                   → research
 *
 * Sorted so the free work is at the top. A product we already hold a
 * composition for and never imported is the one case where a shopper was
 * failed by nothing but a button not being pressed.
 */

interface Miss {
  code: string;
  searches: number;
  name: string | null;
  brands: string | null;
  verdict: MissVerdict;
  maker: string | null;
  seededAs: string | null;
  insteadOf: string | null;
  insteadUse: string | null;
}

interface Report {
  total: number;
  truncated?: boolean;
  verdicts: Record<MissVerdict, number>;
  searchesByVerdict: Record<MissVerdict, number>;
  ordering?: string;
  misses: Miss[];
  error?: string;
  message?: string;
}

/** Enough to see the shape of each bucket without scrolling for a minute. */
const SHOWN_PER_VERDICT = 12;

const TONE: Record<MissVerdict, string> = {
  "seeded-not-imported": "text-sage-700",
  "known-multipack": "text-muted",
  "seeded-no-formula": "text-muted",
  "absent-known-maker": "text-ink",
  "absent-unknown-maker": "text-muted",
  "known-wrong-barcode": "text-faint",
  "not-a-barcode": "text-faint",
};

export function MissedScans({ adminToken }: { adminToken: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/misses", {
        headers: { "x-admin-token": adminToken },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as Report;
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Couldn't read the misses.");
        return;
      }
      setReport(data);
    } catch {
      setError("Couldn't read the misses — check your connection.");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Search size={14} strokeWidth={2} aria-hidden="true" />
            Looked for, not found
          </h2>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
            Every failed scan has always been recorded — a row with no product
            and a counter for everyone who tried. This is that list, with what
            we hold checked against each code.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-ghost shrink-0"
          aria-label="Reload"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={15} aria-hidden="true" />
          ) : (
            <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && <p className="text-[12.5px] text-risk-high">{error}</p>}

      {loading && !report ? (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 className="animate-spin" size={15} aria-hidden="true" />
          Reading the misses…
        </p>
      ) : report ? (
        report.total === 0 ? (
          <p className="text-[12.5px] text-muted">
            Nothing has come back empty. Either the catalog is answering
            everything asked of it, or nobody has scanned yet.
          </p>
        ) : (
          <>
            <p className="text-[11.5px] text-faint">
              {report.total} codes
              {report.truncated ? " (capped — the most-searched are kept)" : ""}
              {report.ordering ? ` · ${report.ordering}` : ""}
            </p>
            {MISS_ORDER.filter((v) => (report.verdicts[v] ?? 0) > 0).map((verdict) => {
              const rows = report.misses.filter((m) => m.verdict === verdict);
              return (
                <div key={verdict} className="flex flex-col gap-1">
                  <p className={`text-[12px] font-semibold ${TONE[verdict]}`}>
                    {rows.length} {missLabel(verdict)}
                    {/* Barcodes and shoppers are different numbers, and the
                        second is the one that says how much this matters. */}
                    {report.searchesByVerdict[verdict] > rows.length
                      ? ` · ${report.searchesByVerdict[verdict]} scans`
                      : ""}
                  </p>
                  {verdict === "seeded-not-imported" && (
                    <p className="text-[11px] leading-snug text-muted">
                      These need no research at all. We hold the composition —
                      press <span className="font-semibold">Write to the catalog</span>{" "}
                      on the seeded formulas panel and every one of them starts
                      answering.
                    </p>
                  )}
                  <ul className="flex flex-col gap-0.5">
                    {rows.slice(0, SHOWN_PER_VERDICT).map((m) => (
                      <li key={m.code} className="text-[11px] leading-snug text-muted">
                        <span className="font-mono">{m.code}</span>
                        {m.searches > 1 && (
                          <span className="ml-1 tabular-nums text-faint">
                            ×{m.searches}
                          </span>
                        )}
                        {m.seededAs ? (
                          <> · {m.seededAs}</>
                        ) : m.insteadOf ? (
                          <>
                            {" "}
                            · {m.insteadOf}
                            {m.insteadUse && (
                              <>
                                {" "}
                                — scan <span className="font-mono">{m.insteadUse}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {(m.brands || m.name) && (
                              <> · {[m.brands, m.name].filter(Boolean).join(" ")}</>
                            )}
                            {m.maker && !m.brands && !m.name && <> · {m.maker}</>}
                          </>
                        )}
                      </li>
                    ))}
                    {rows.length > SHOWN_PER_VERDICT && (
                      <li className="text-[11px] text-faint">
                        … and {rows.length - SHOWN_PER_VERDICT} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </>
        )
      ) : null}
    </section>
  );
}
