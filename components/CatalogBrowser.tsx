"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2, Trash2, Database } from "lucide-react";
import {
  ConfirmDestructive,
  isUnlocked,
} from "@/components/ConfirmDestructive";

/**
 * See what's actually stored in the shared catalog, and remove a bad row.
 *
 * Capture is otherwise write-only: when a product reads wrong in the consumer
 * app you can't tell whether your correction landed, went to a different
 * barcode, or never ran. Showing the stored ingredient text — the real bytes,
 * fetched fresh, no HTTP cache in the way — turns that guesswork into a fact,
 * and the bin removes the row so it can be captured cleanly again.
 */

interface CatalogRow {
  code: string;
  productName: string | null;
  brands: string | null;
  mode: string | null;
  ingredientsText: string | null;
}

const DEBOUNCE_MS = 300;

export function CatalogBrowser({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const seqRef = useRef(0);

  const load = useCallback(
    async (q: string) => {
      setLoading(true);
      const seq = ++seqRef.current;
      try {
        const res = await fetch("/api/catalog", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ q }),
        });
        if (seq !== seqRef.current) return;
        if (!res.ok) {
          setRows([]);
          return;
        }
        const data = (await res.json()) as {
          results?: CatalogRow[];
          totalCodes?: number;
        };
        setRows(data.results ?? []);
        if (typeof data.totalCodes === "number") setTotal(data.totalCodes);
      } catch {
        if (seq === seqRef.current) setRows([]);
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    },
    [adminToken]
  );

  // Show the catalog size straight away, without opening the panel.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/catalog", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ countOnly: true }),
        });
        if (!alive || !res.ok) return;
        const data = (await res.json()) as { totalCodes?: number };
        if (typeof data.totalCodes === "number") setTotal(data.totalCodes);
      } catch {
        /* offline — the counter just stays blank */
      }
    })();
    return () => {
      alive = false;
    };
  }, [adminToken]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [open, query, load]);

  // Deleting is irreversible, so it goes through a password prompt unless one
  // was entered in the last few minutes (see ConfirmDestructive).
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const remove = useCallback(
    async (code: string) => {
      if (busyCode) return;
      setBusyCode(code);
      setNote(null);
      try {
        const res = await fetch("/api/delete-barcode", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          deleted?: boolean;
        };
        if (res.ok && data.deleted) {
          setRows((r) => (r ? r.filter((x) => x.code !== code) : r));
          setTotal((t) => (t === null ? t : Math.max(0, t - 1)));
          setNote(`Deleted ${code}. Capture it again to re-add it.`);
        } else {
          setNote(`Couldn't delete ${code}.`);
        }
      } catch {
        setNote("Couldn't delete — check your connection.");
      } finally {
        setBusyCode(null);
      }
    },
    [adminToken, busyCode]
  );

  const requestRemove = useCallback(
    (code: string) => {
      // Recent password entry keeps a short window open, so cleaning up several
      // rows doesn't mean re-typing it for each one.
      if (isUnlocked()) {
        void remove(code);
        return;
      }
      setPendingDelete(code);
    },
    [remove]
  );

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Database size={16} strokeWidth={1.8} aria-hidden="true" />
          Catalog
          {total !== null && (
            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[12px] font-semibold text-sage-600">
              {total}
            </span>
          )}
        </span>
        <span className="text-[12px] font-medium text-faint">
          {open ? "Hide" : "Browse / fix"}
        </span>
      </button>

      {open && (
        <>
          <p className="-mt-1 text-[12px] leading-relaxed text-muted">
            {total !== null && (
              <>
                <span className="font-medium text-ink">
                  {total} barcode{total === 1 ? "" : "s"} seeded
                </span>{" "}
                — one recipe can hold several (6/15/30 lb).{" "}
              </>
            )}
            What&apos;s actually stored right now. Check a product here before
            assuming a fix didn&apos;t work — this reads the database directly.
          </p>

          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="Brand, name, or barcode digits"
              aria-label="Search the catalog"
              className="h-11 w-full rounded-input border border-line bg-surface pl-9 pr-9 text-[14px] text-ink outline-none focus:border-sage-400"
            />
            {loading && (
              <Loader2
                size={15}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-faint"
              />
            )}
          </div>

          {note && (
            <p className="rounded-input bg-surfaceSoft px-3 py-2 text-[12px] text-ink">
              {note}
            </p>
          )}

          {rows !== null && rows.length === 0 && !loading && (
            <p className="text-[12px] text-muted">Nothing matches that.</p>
          )}

          {rows !== null && rows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li
                  key={row.code}
                  className="flex flex-col gap-1.5 rounded-input bg-surfaceSoft p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-ink">
                        {row.productName || "Unnamed product"}
                      </div>
                      <div className="truncate text-[12px] text-muted">
                        {row.brands || "—"}
                      </div>
                      <div className="font-mono text-[11px] text-faint">
                        {row.code}
                      </div>
                    </div>
                    <button
                      onClick={() => requestRemove(row.code)}
                      disabled={busyCode === row.code}
                      aria-label={`Delete ${row.code} from the catalog`}
                      className="shrink-0 rounded-full p-1.5 text-risk-high transition active:scale-95 disabled:opacity-40"
                    >
                      {busyCode === row.code ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p className="max-h-24 overflow-y-auto rounded bg-surface/70 px-2 py-1.5 text-[11px] leading-snug text-muted">
                    {row.ingredientsText || "(no ingredients stored)"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {pendingDelete && (
        <ConfirmDestructive
          title="Delete from the catalog?"
          body={`${pendingDelete} will be removed from the shared catalog, along with its cached report. This can't be undone — the product has to be captured again.`}
          confirmLabel="Delete"
          onConfirm={() => {
            const code = pendingDelete;
            setPendingDelete(null);
            void remove(code);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
