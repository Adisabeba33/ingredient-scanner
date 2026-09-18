"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { verdictLabel, type ImportVerdict } from "@/lib/known-import";
import { seedButtonLabel } from "@/lib/seed-button-label";

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

interface PreviewProduct {
  code: string;
  name: string;
  verdict: ImportVerdict;
  /** Whether the row we are leaving alone already carries a panel. */
  heldPanel?: boolean | null;
  /** Whether it holds an ingredient list at all. */
  heldComposition?: boolean | null;
  /** Both lists, sent only where somebody has to choose between them. */
  heldIngredients?: string | null;
  seededIngredients?: string | null;
}

/**
 * The boxes, counted apart from the formulas.
 *
 * Deliberately not folded into `counts`: a multipack row asserts that a code
 * names NO food, and adding it to the same tally would make "write 41 to the
 * catalog" mean two opposite things at once.
 */
interface BoxCounts {
  total?: number;
  write?: number;
  identical?: number;
  conflict?: number;
  /** Boxes read with no inner code proven. Marked anyway — see below. */
  withoutMembers?: number;
  written?: number;
  error?: string;
}

interface Preview {
  /** Products the import can act on — the ones that have a formula. */
  total: number;
  /** Every seeded product, formula or not. */
  seeded?: number;
  counts: Record<ImportVerdict, number>;
  products?: PreviewProduct[];
  boxes?: BoxCounts;
  error?: string;
  message?: string;
}

interface Result {
  ok?: boolean;
  written?: number;
  reportsCleared?: number;
  counts?: Record<ImportVerdict, number>;
  boxes?: BoxCounts;
  /** Photographed rows that took the seeded guaranteed analysis and nothing else. */
  panelsFilled?: number;
  /** Rows the update did not reach — errored, or matched nothing. */
  panelsFailed?: number;
  panelError?: string | null;
  conflicts?: { code: string; name: string }[];
  flagged?: { code: string; note: string | null }[];
  error?: string;
  message?: string;
}

/**
 * The two lists, and the button under them.
 *
 * ── Why a comparison and not just a button ────────────────────────────────
 *
 * Because "the catalog holds a different composition" is not a decision
 * anybody can make from that sentence. One of the two lists is a photograph
 * that may have been a poor read, and the other is a manufacturer's record
 * that may be a generation out of date, and which is which changes per row.
 * Showing one and hiding the other would be asking for a signature on a
 * document nobody may read.
 *
 * Collapsed by default: ten of these open at once is a wall of ingredients,
 * and the operator is working through them one at a time anyway.
 */
function Compare({
  product,
  open,
  onToggle,
  onAdopt,
  busy,
}: {
  product: PreviewProduct;
  open: boolean;
  onToggle: () => void;
  onAdopt: () => void;
  busy: boolean;
}) {
  if (!product.seededIngredients) return null;
  return (
    <div className="mt-1">
      <button
        onClick={onToggle}
        className="text-[10.5px] font-semibold text-sage-700 underline underline-offset-2"
      >
        {open ? "Hide the two lists" : "Compare the two lists"}
      </button>
      {open && (
        <div className="mt-1.5 flex flex-col gap-2 rounded-input bg-surface px-2.5 py-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">
              What the catalog holds
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink">
              {product.heldIngredients?.trim() || "— nothing —"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">
              The seeded formula
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink">
              {product.seededIngredients}
            </p>
          </div>
          <button
            onClick={onAdopt}
            disabled={busy}
            className="btn-secondary self-start text-[11px]"
          >
            {busy ? (
              <Loader2 className="animate-spin" size={13} aria-hidden="true" />
            ) : null}
            Use the seeded formula for this one
          </button>
          {/* Said here rather than in a tooltip, because it is the part the
              operator is actually agreeing to. */}
          <p className="text-[10px] leading-snug text-faint">
            Replaces the composition, the panel and the fingerprint on this one
            barcode, and relabels the row &ldquo;not photographed&rdquo; —
            because once the text is a manufacturer&apos;s, nobody has
            photographed it. Your picture stays on the row.
          </p>
        </div>
      )}
    </div>
  );
}

export function SeedImport({ adminToken }: { adminToken: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [adopting, setAdopting] = useState<string | null>(null);
  const [adopted, setAdopted] = useState<string | null>(null);

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

  const adopt = useCallback(
    async (code: string) => {
      setAdopting(code);
      setError(null);
      setAdopted(null);
      try {
        const res = await fetch("/api/known-products/import", {
          method: "POST",
          headers: { "content-type": "application/json", "x-admin-token": adminToken },
          body: JSON.stringify({ adopt: [code] }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          adopted?: number;
          adoptError?: string | null;
          message?: string;
          error?: string;
        };
        if (!res.ok || data.adopted !== 1) {
          setError(data.adoptError ?? data.message ?? data.error ?? "Couldn't replace it.");
          return;
        }
        setAdopted(code);
        setOpen(null);
        await load();
      } catch {
        setError("Couldn't replace it — check your connection.");
      } finally {
        setAdopting(null);
      }
    },
    [adminToken, load]
  );

  const toWrite = preview?.counts?.write ?? 0;
  // The button is one press that does two things, so it must not read
  // "Nothing to write" while 85 cartons are still open to the discovery
  // screen. Counted together for the label only; the panels above keep them
  // apart, because they are opposite claims about a barcode.
  const boxesToMark = preview?.boxes?.write ?? 0;
  // Our own photographs that never caught a panel, and can take the seeded one
  // because the two ingredient lists agree. Counted into the button for the
  // same reason as the boxes: it is work this press will do, and a button that
  // says "Nothing to write" while sixteen reports stay thin is lying.
  const panelsToFill = preview?.counts?.["panel-only"] ?? 0;
  const anythingToDo = toWrite + boxesToMark + panelsToFill;
  const ours = (preview?.products ?? []).filter(
    (p) => p.verdict === "ours-is-better"
  );
  const panelOnly = (preview?.products ?? []).filter(
    (p) => p.verdict === "panel-only"
  );

  return (
    <section className="card flex flex-col gap-3 p-4">
      <div>
        <h2 className="text-[14px] font-semibold text-ink">Seeded formulas</h2>
        <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
          Compositions from manufacturer records. Filed as community readings —
          a photograph of the real pack still wins.
        </p>
        {/* Not every seeded product has a composition. The ones without appear
            on the coverage page with a barcode to look for, and stay out of the
            catalog until a real ingredient list arrives — an entry there
            without one would read to the consumer app as a recent miss. */}
        {preview?.seeded && preview.seeded > preview.total ? (
          <p className="mt-1 text-[11px] leading-snug text-faint">
            {preview.total} of {preview.seeded} seeded products have a
            composition. The other {preview.seeded - preview.total} are on the
            coverage page as barcodes to find.
          </p>
        ) : null}
      </div>

      {loading && !preview ? (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 className="animate-spin" size={15} aria-hidden="true" />
          Checking the catalog…
        </p>
      ) : preview ? (
        <ul className="flex flex-col gap-1 text-[12.5px] text-muted">
          {(
            [
              "write",
              "panel-only",
              "identical",
              "ours-is-better",
              "conflict",
            ] as ImportVerdict[]
          ).map((verdict) => {
            const n = preview.counts?.[verdict] ?? 0;
            if (n === 0) return null;
            return (
              <li key={verdict} className="flex items-center gap-2">
                <span
                  // `min-w`, not `w`. A fixed 24px column was sized when the
                  // biggest count was two digits; at 1350 the number overflows
                  // its own box, eats the gap and prints as "1350already
                  // identical", and every row below it sits at a different
                  // indent. Tabular numerals keep the column aligned; the
                  // minimum keeps small counts from drifting left.
                  className={`min-w-[2.5rem] shrink-0 text-right font-semibold tabular-nums ${
                    verdict === "write" || verdict === "panel-only"
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

      {/* The boxes, said separately because they are the opposite claim: not
          "here is what is in this product" but "this code is not a product".
          Shown even when there is nothing to write, because the interesting
          answer is usually "all 85 are already marked" and a panel that
          disappears when it succeeds makes you wonder whether it ran. */}
      {preview?.boxes && !preview.boxes.error && (preview.boxes.total ?? 0) > 0 ? (
        <div className="rounded-input bg-surfaceSoft px-3 py-2.5">
          <p className="text-[12px] font-semibold text-ink">
            {preview.boxes.total} variety packs and cases
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            {preview.boxes.write ? `${preview.boxes.write} to mark, ` : ""}
            {preview.boxes.identical ?? 0} already marked
            {preview.boxes.conflict
              ? `, ${preview.boxes.conflict} holding a reading and left alone`
              : ""}
            . A box has no ingredient list of its own — marking it stops the app
            inviting somebody to photograph the back of the carton, where every
            member&apos;s list is printed one after another.
          </p>
          {preview.boxes.withoutMembers ? (
            <p className="mt-1 text-[11px] leading-snug text-faint">
              {preview.boxes.withoutMembers} of them name no inner barcode yet.
              They are still marked — the mark is what stops the bad capture —
              and the members can be added on a later pass.
            </p>
          ) : null}
        </div>
      ) : null}
      {preview?.boxes?.error ? (
        <p className="text-[11.5px] leading-snug text-amber">
          Couldn&apos;t check the variety packs: {preview.boxes.error}. If this
          says the <span className="font-mono">contains</span> column is
          missing, the catalog predates migration 0022.
        </p>
      ) : null}

      {error && <p className="text-[12.5px] text-risk-high">{error}</p>}
      {adopted && (
        <p className="text-[12px] text-sage-700">
          <span className="font-mono">{adopted}</span> now holds the seeded
          formula, and its stored reports were dropped.
        </p>
      )}

      {result && (
        <div className="rounded-input bg-sage-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-sage-700">
            <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            {result.written} written
            {result.panelsFilled ? `, ${result.panelsFilled} panels filled in` : ""}
            {result.boxes?.written ? `, ${result.boxes.written} boxes marked` : ""}
            {result.reportsCleared ? `, ${result.reportsCleared} stale reports cleared` : ""}
          </p>
          {result.boxes?.error && (
            <p className="mt-1 text-[11px] leading-snug text-amber">
              The variety packs were not marked: {result.boxes.error}
            </p>
          )}
          {/* Said out loud, because a panel that did not get written looks
              exactly like one that did until the next press offers it again. */}
          {result.panelsFailed ? (
            <p className="mt-1 text-[11px] leading-snug text-amber">
              {result.panelsFailed} panel{result.panelsFailed === 1 ? "" : "s"}{" "}
              could not be written
              {result.panelError ? `: ${result.panelError}` : ""}. If they are
              still offered above after a refresh, the row is not being reached
              — that is a bug, not a re-shoot.
            </p>
          ) : null}
          {result.flagged && result.flagged.length > 0 && (
            <p className="mt-1 text-[11px] leading-snug text-muted">
              {result.flagged.length} of them have older records under the same
              barcode — the current formula was written.
            </p>
          )}
        </div>
      )}

      {/* The ones this press can actually improve. Separate from the block
          below because the answer is different: nothing about them needs a
          person or a second trip to the shop. */}
      {panelOnly.length > 0 && (
        <div className="rounded-input bg-sage-50 px-3 py-2.5">
          <p className="text-[12px] font-semibold text-ink">
            {panelOnly.length} photographed with no analysis panel — fillable
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Your photograph caught the ingredients and not the panel, and the
            seeded list is the same recipe letter for letter — so the figures
            belong to this food. Only the panel is written. The ingredients,
            the source and everything else you shot are untouched.
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {panelOnly.map((p) => (
              <li key={p.code} className="text-[11px] leading-snug text-muted">
                <span className="font-mono">{p.code}</span> · {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Our own captures, named. The count alone leaves you wondering WHICH
          two the import stepped around — and there is something to do about
          them: a row we photographed before the scanner read guaranteed
          analysis keeps a row without one, so its report is thinner than the
          rest of the batch and the tin is worth re-shooting. */}
      {ours.length > 0 && (
        <div className="rounded-input bg-surfaceSoft px-3 py-2.5">
          <p className="text-[12px] font-semibold text-ink">
            {ours.length} already photographed — left alone
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Your own capture outranks a manufacturer record, so these keep what
            you shot. They do NOT get the seeded formula.
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {ours.map((p) => (
              <li key={p.code} className="text-[11px] leading-snug text-muted">
                <span className="font-mono">{p.code}</span> · {p.name}
                {p.heldPanel === false && (
                  // The ones the fill above could NOT reach. A capture that
                  // read nothing needs the pack. A capture whose list differs
                  // needs a person to look at both lists, which is what the
                  // button does — so it says compare, not re-shoot.
                  <span className="ml-1 rounded-full bg-amber-soft px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                    {p.heldComposition === false
                      ? "nothing was read off this pack — re-shoot it"
                      : "no panel, and the list differs"}
                  </span>
                )}
                <Compare
                  product={p}
                  open={open === p.code}
                  onToggle={() => setOpen(open === p.code ? null : p.code)}
                  onAdopt={() => adopt(p.code)}
                  busy={adopting === p.code}
                />
              </li>
            ))}
          </ul>
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
                  <Compare
                    product={p}
                    open={open === p.code}
                    onToggle={() => setOpen(open === p.code ? null : p.code)}
                    onAdopt={() => adopt(p.code)}
                    busy={adopting === p.code}
                  />
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={run}
        disabled={running || loading || anythingToDo === 0}
        className="btn-secondary"
      >
        {running ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <Download size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
        {seedButtonLabel({ toWrite, boxesToMark, panelsToFill })}
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
