"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, GitCompare, Check, X, Users } from "lucide-react";
import { ConfirmDestructive, isUnlocked } from "@/components/ConfirmDestructive";

/**
 * Corrections users have reported against the verified catalog.
 *
 * A shopper's photo can never change a verified entry on its own — it lands
 * here as a proposal, pre-screened so only plausible reformulations arrive.
 * This is where a human decides, and approving is the only route from that photo
 * to the catalog.
 *
 * Both decisions are shown side by side deliberately: the point is to read what
 * actually differs, not to trust the summary.
 */

interface Pending {
  id: string;
  code: string;
  mode: string | null;
  current_text: string | null;
  proposed_text: string;
  product_name: string | null;
  verdict: string | null;
  verdict_note: string | null;
  reports: number;
  created_at: string;
}

export function CorrectionsReview({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Pending[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<Pending | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/corrections", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const data = (await res.json()) as { pending?: Pending[] };
      setRows(data.pending ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = useCallback(
    async (row: Pending, action: "approve" | "reject") => {
      if (busy) return;
      setBusy(row.id);
      setNote(null);
      try {
        const res = await fetch("/api/corrections", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ id: row.id, action }),
        });
        if (!res.ok) {
          setNote(`Couldn't ${action} that one.`);
          return;
        }
        setRows((r) => (r ? r.filter((x) => x.id !== row.id) : r));
        setNote(
          action === "approve"
            ? `Applied to ${row.code}. Its report was cleared so it rebuilds.`
            : `Rejected — ${row.code} is unchanged.`
        );
      } catch {
        setNote("Network error — nothing changed.");
      } finally {
        setBusy(null);
      }
    },
    [adminToken, busy]
  );

  // Approving rewrites what everyone sees, so it goes behind the password.
  // Rejecting changes nothing, so it doesn't.
  const requestApprove = useCallback(
    (row: Pending) => {
      if (isUnlocked()) {
        void decide(row, "approve");
        return;
      }
      setPendingApproval(row);
    },
    [decide]
  );

  const count = rows?.length ?? 0;

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <GitCompare size={16} strokeWidth={1.8} aria-hidden="true" />
          Reported corrections
          {count > 0 && (
            <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[12px] font-semibold text-ink">
              {count}
            </span>
          )}
        </span>
        <span className="text-[12px] font-medium text-faint">
          {open ? "Hide" : count > 0 ? "Review" : "None"}
        </span>
      </button>

      {open && (
        <>
          <p className="-mt-1 text-[12px] leading-relaxed text-muted">
            Users reported these against the catalog. Nothing has changed yet —
            approving is the only way a reported reading reaches a product.
          </p>

          {note && (
            <p className="rounded-input bg-surfaceSoft px-3 py-2 text-[12px] text-ink">
              {note}
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-2 py-4 text-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span className="text-[13px]">Loading…</span>
            </div>
          )}

          {!loading && count === 0 && (
            <p className="text-[12px] text-muted">
              Nothing reported. Readings that match what we hold, or that were
              too unclear to compare, never get here.
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {(rows ?? []).map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 rounded-input bg-surfaceSoft p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {row.product_name || "Unnamed product"}
                    </div>
                    <div className="font-mono text-[11px] text-faint">
                      {row.code}
                    </div>
                  </div>
                  {row.reports > 1 && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-soft px-2 py-1 text-[11px] font-semibold text-ink"
                      title="Reported by more than one person"
                    >
                      <Users size={12} strokeWidth={1.8} aria-hidden="true" />
                      {row.reports}
                    </span>
                  )}
                </div>

                {row.verdict_note && (
                  <p className="rounded bg-surface/70 px-2 py-1.5 text-[11px] leading-snug text-muted">
                    {row.verdict_note}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-faint">
                      In the catalog
                    </div>
                    <p className="mt-0.5 max-h-24 overflow-y-auto rounded bg-surface/70 px-2 py-1.5 text-[11px] leading-snug text-muted">
                      {row.current_text || "(nothing stored)"}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-faint">
                      Reported
                    </div>
                    <p className="mt-0.5 max-h-24 overflow-y-auto rounded bg-amber-soft px-2 py-1.5 text-[11px] leading-snug text-ink">
                      {row.proposed_text}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => decide(row, "reject")}
                    disabled={busy === row.id}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-input border border-lineStrong bg-surface text-[13px] font-medium text-ink transition active:scale-[0.98] disabled:opacity-40"
                  >
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    onClick={() => requestApprove(row)}
                    disabled={busy === row.id}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-input bg-sage-500 text-[13px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
                  >
                    {busy === row.id ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        <Check size={14} strokeWidth={2} aria-hidden="true" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {pendingApproval && (
        <ConfirmDestructive
          title="Apply this correction?"
          body={`The stored ingredients for ${pendingApproval.code} will be replaced by the reported reading, and its report cleared so the analysis rebuilds.`}
          confirmLabel="Apply"
          tone="normal"
          onConfirm={() => {
            const row = pendingApproval;
            setPendingApproval(null);
            void decide(row, "approve");
          }}
          onCancel={() => setPendingApproval(null)}
        />
      )}
    </section>
  );
}
