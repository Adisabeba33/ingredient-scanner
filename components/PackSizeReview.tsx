"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Loader2 } from "lucide-react";

/**
 * Pack sizes the catalog already holds but never knew were related.
 *
 * `composition_key` arrived with migration 0020, so every product catalogued
 * before it has none — and the detector in /api/process, which compares each
 * new capture against the fingerprinted catalog, is blind to all of them. Until
 * the old rows are fingerprinted, the whole feature only works on products
 * captured from that day forward.
 *
 * Two steps, in order, and the order is not optional: fill in the fingerprints,
 * then look at what they revealed.
 *
 * ── Why the groups are confirmed one at a time ────────────────────────────
 *
 * The same reason a capture asks rather than merging: one brand's Adult and
 * Senior recipes can carry a word-for-word identical ingredient list and differ
 * only in the guaranteed analysis, which is not in this text. Confirming in
 * bulk would turn one plausible mistake into a hundred at once — so each group
 * is shown with its codes, its names and its weights, and somebody says yes.
 */

interface Member {
  code: string;
  productName: string | null;
  brands: string | null;
  netWeightG: number | null;
  recipeId: string | null;
}

interface Group {
  compositionKey: string;
  members: Member[];
}

export function PackSizeReview({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [awaiting, setAwaiting] = useState(0);
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  /**
   * True once a run has walked the whole catalog and stopped writing.
   *
   * Whatever `awaiting` still reports after that is rows whose composition is
   * too thin to fingerprint — "Water" is shared by hundreds of unrelated
   * products, so it deliberately gets no key. They will never reach zero, and
   * a banner that goes on asking for another run would be asking for nothing.
   */
  const [exhausted, setExhausted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pack-sizes", {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) {
        setGroups([]);
        return;
      }
      const data = (await res.json()) as {
        groups?: Group[];
        awaitingBackfill?: number;
      };
      setGroups(data.groups ?? []);
      setAwaiting(data.awaitingBackfill ?? 0);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  /**
   * Walk the catalog in batches until nothing is left to fingerprint.
   *
   * Looped here rather than server-side so a slow catalog can't run past a
   * platform timeout, and so progress is visible while it happens.
   */
  const backfill = useCallback(async () => {
    if (backfilling) return;
    setBackfilling(true);
    setNote(null);
    let written = 0;
    try {
      for (let pass = 0; pass < 200; pass++) {
        const res = await fetch("/api/pack-sizes", {
          method: "POST",
          headers: { "x-admin-token": adminToken },
        });
        if (!res.ok) {
          setNote("The backfill stopped early — run it again.");
          break;
        }
        const data = (await res.json()) as {
          written?: number;
          remaining?: number;
          done?: boolean;
        };
        written += data.written ?? 0;
        setAwaiting(data.remaining ?? 0);
        setNote(`Fingerprinted ${written} so far…`);
        if (data.done) {
          setExhausted(true);
          break;
        }
      }
      setNote(`Fingerprinted ${written} products.`);
      await load();
    } catch {
      setNote("Network error — nothing was lost, run it again.");
    } finally {
      setBackfilling(false);
    }
  }, [adminToken, backfilling, load]);

  const link = useCallback(
    async (group: Group) => {
      if (busy) return;
      setBusy(group.compositionKey);
      setNote(null);
      try {
        const res = await fetch("/api/link-group", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ codes: group.members.map((m) => m.code) }),
        });
        if (!res.ok) {
          setNote("Couldn't link that group.");
          return;
        }
        setGroups((g) =>
          g ? g.filter((x) => x.compositionKey !== group.compositionKey) : g
        );
        setNote(`Linked ${group.members.length} codes as one recipe.`);
      } catch {
        setNote("Network error — nothing changed.");
      } finally {
        setBusy(null);
      }
    },
    [adminToken, busy]
  );

  const dismiss = useCallback((group: Group) => {
    // Nothing is written: these are separate products and the catalog already
    // says so by leaving them ungrouped. Hiding it locally is the whole action.
    setGroups((g) =>
      g ? g.filter((x) => x.compositionKey !== group.compositionKey) : g
    );
  }, []);

  const count = groups?.length ?? 0;

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Boxes size={16} strokeWidth={1.8} aria-hidden="true" />
          Pack sizes
          {count > 0 && (
            <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[12px] font-semibold text-ink">
              {count}
            </span>
          )}
        </span>
        <span className="text-[12px] font-medium text-faint">
          {open ? "Hide" : count > 0 ? "Review" : "Open"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          {awaiting > 0 && !exhausted && (
            <div className="rounded-input bg-amber-soft px-3 py-2 text-[12px] leading-snug text-ink">
              <span className="font-semibold">
                {awaiting} products have no fingerprint yet.
              </span>{" "}
              They were catalogued before this existed, so a new capture of one
              of their pack sizes cannot recognise them. The groups below are
              only what the rest of the catalog has revealed.
              <button
                type="button"
                onClick={backfill}
                disabled={backfilling}
                className="mt-2 flex items-center gap-1.5 rounded-full bg-green-primary px-3 py-1 text-[12px] font-medium text-white disabled:opacity-50"
              >
                {backfilling && (
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                )}
                {backfilling ? "Fingerprinting…" : "Fingerprint them"}
              </button>
            </div>
          )}

          {awaiting > 0 && exhausted && (
            <div className="text-[11.5px] leading-snug text-faint">
              {awaiting} products still carry no fingerprint, and never will:
              their ingredient list is too short to identify a recipe by. Running
              it again would do nothing.
            </div>
          )}

          {note && <div className="text-[12px] text-muted">{note}</div>}

          {loading && <div className="text-[12px] text-muted">Loading…</div>}

          {!loading && count === 0 && (
            <div className="text-[12px] text-muted">
              {awaiting > 0 && !exhausted
                ? "Nothing found yet — fingerprint the rest first."
                : "No unlinked pack sizes. Every product carrying a shared composition has been decided."}
            </div>
          )}

          {groups?.map((group) => (
            <div
              key={group.compositionKey}
              className="rounded-input border border-border-strong p-3"
            >
              <div className="text-[12px] font-semibold text-ink">
                {group.members[0]?.brands ? `${group.members[0].brands} · ` : ""}
                {group.members[0]?.productName ?? "Unnamed product"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {group.members.length} codes carry this exact list
              </div>

              <ul className="mt-2 flex flex-col gap-1">
                {group.members.map((m) => (
                  <li
                    key={m.code}
                    className="flex items-baseline gap-2 text-[11.5px] text-ink"
                  >
                    <span className="font-mono">{m.code}</span>
                    <span className="text-muted">
                      {m.netWeightG ? `${m.netWeightG} g` : "weight unknown"}
                    </span>
                    {m.productName && m.productName !== group.members[0]?.productName && (
                      <span className="text-faint">· {m.productName}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => link(group)}
                  disabled={busy !== null}
                  className="rounded-full bg-green-primary px-3 py-1 text-[11px] font-medium text-white disabled:opacity-50"
                >
                  {busy === group.compositionKey ? "Linking…" : "One recipe"}
                </button>
                <button
                  type="button"
                  onClick={() => dismiss(group)}
                  disabled={busy !== null}
                  className="rounded-full border border-border-strong px-3 py-1 text-[11px] font-medium text-ink disabled:opacity-50"
                >
                  Different products
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
