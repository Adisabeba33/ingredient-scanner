"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScanLine,
  Plus,
  Camera,
  Check,
  Trash2,
  Loader2,
  CloudUpload,
  Barcode,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PhotoCapture } from "@/components/PhotoCapture";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { DuplicateProductDialog } from "@/components/DuplicateProductDialog";
import { canonicalBarcode } from "@/lib/barcode";
import {
  addProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type CaptureMode,
  type PendingProduct,
} from "@/lib/queue";

/**
 * The in-store capture tool (spec §5) + the "Process all" pass (spec §6).
 *
 * Speed first: at the shelf you only SCAN and SNAP. Scan one or more pack-size
 * barcodes, snap the brand and ingredients photos, tap Done — the product drops
 * into the offline queue and you're immediately ready for the next one. No
 * typing, no waiting, no in-store verification.
 *
 * Later, on good wifi, "Process all" sends each queued product's photos to
 * Claude vision, writes one verified row per barcode into the shared catalog,
 * deletes the photos, and reports which ones didn't read so you re-shoot only
 * those.
 */

type Overlay =
  | { kind: "barcode" }
  // `productId` retargets the capture at an ALREADY QUEUED product (re-shoot a
  // bad photo) instead of the product being captured right now.
  | {
      kind: "photo";
      slot: "brand" | "ingredients" | "nutrition";
      productId?: string;
    }
  | null;

interface Draft {
  barcodes: string[];
  photos: { brand?: string; ingredients?: string; nutrition?: string };
}

const EMPTY_DRAFT: Draft = { barcodes: [], photos: {} };

const MODE_LABELS: Record<CaptureMode, string> = {
  pet: "Pet food",
  human: "Human food",
  cosmetics: "Cosmetics",
};

type QueueFilter = "ingredients" | "brand" | null;

/**
 * Failures that mean the INGREDIENTS photo needs re-shooting, as opposed to a
 * transient network/server problem where the same photo would work on a retry.
 */
const INGREDIENT_FAILURES = new Set([
  "unreadable-ingredients",
  "wrong-language",
  "no-ingredients-photo",
]);

function needsIngredientsRedo(p: PendingProduct): boolean {
  return !!p.lastError && INGREDIENT_FAILURES.has(p.lastError.reason);
}

/** The brand photo is optional, but without it a product lands with no name. */
function needsBrandPhoto(p: PendingProduct): boolean {
  return !p.photos.brand;
}

interface ProcessOutcome {
  id: string;
  barcodes: string[];
  ok: boolean;
  productName: string | null;
  reason?: string;
  /** Extra detail from the server (e.g. the Anthropic error text) for debugging. */
  message?: string;
}

/** Short confirmation beep on a successful barcode read (spec §5: beep + green frame). */
function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {
    /* audio not available — the green frame is still shown */
  }
}

const REASON_LABEL: Record<string, string> = {
  "unreadable-ingredients": "Ingredients photo unreadable — re-shoot",
  "wrong-language": "Not the English list — re-shoot the English column",
  "no-ingredients-photo": "No ingredients photo",
  "no-valid-barcode": "No valid barcode",
  llm_error: "Reader error — retry",
  write_failed: "Database write failed",
  network: "Offline / network error — will retry",
  unauthorized: "Admin token rejected",
  extractor_not_configured: "ANTHROPIC_API_KEY not set on the server",
  store_not_configured: "Supabase not configured on the server",
  admin_not_configured: "ADMIN_TOKEN not set on the server",
  invalid_body: "Bad request",
  http_413: "Photos too large for one request",
  http_500: "Server error — check Vercel logs",
  http_502: "Reader/upstream error — retry",
  http_504: "Timed out — retry",
  crash: "Server crashed — see detail below",
};

export function CaptureTool({ adminToken }: { adminToken: string }) {
  const [mode, setMode] = useState<CaptureMode>("pet");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [overlay, setOverlay] = useState<Overlay>(null);
  // The pending queue itself (not just its size), so it can be reviewed,
  // re-shot and pruned before processing.
  const [queue, setQueue] = useState<PendingProduct[]>([]);
  const captured = queue.length;
  const [captureNutrition, setCaptureNutrition] = useState(false);
  // Set when a just-scanned code is already ours (in the catalog) or already in
  // this device's pending queue — so 5 people don't re-capture the same product.
  const [dupWarning, setDupWarning] = useState<{
    code: string;
    name: string | null;
    where: "catalog" | "queue";
    /** What's stored right now — makes a wrong-language row obvious. */
    preview?: string | null;
  } | null>(null);
  // A scanned code that the SHARED catalog already holds — asked about in a
  // dialog, since it means someone else's work is about to be overwritten.
  const [duplicate, setDuplicate] = useState<{
    code: string;
    name: string | null;
    preview: string | null;
  } | null>(null);

  // Processing state.
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [outcomes, setOutcomes] = useState<ProcessOutcome[] | null>(null);

  const flashRef = useRef(false);
  const captureCardRef = useRef<HTMLElement>(null);
  // Confirmation line after withdrawing a row from the shared catalog.
  const [catalogNote, setCatalogNote] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>(null);

  const refreshQueue = useCallback(() => {
    listProducts()
      .then(setQueue)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // ── Barcode ────────────────────────────────────────────────────────────────
  const onBarcode = useCallback(
    async (code: string) => {
      beep();
      setOverlay(null);
      setDupWarning(null);
      const key = canonicalBarcode(code);

      // 1) Local, instant, offline: already in THIS device's pending queue?
      try {
        const pending = await listProducts();
        const inQueue = pending.some((p) =>
          p.barcodes.some((b) => canonicalBarcode(b) === key)
        );
        if (inQueue) {
          setDupWarning({ code, name: null, where: "queue" });
          return; // don't add — it's already captured here
        }
      } catch {
        /* IndexedDB unavailable — fall through and let capture proceed */
      }

      // Add it now so capture works even with no signal.
      setDraft((d) =>
        d.barcodes.some((b) => canonicalBarcode(b) === key)
          ? d
          : { ...d, barcodes: [...d.barcodes, code] }
      );

      // 2) Shared catalog (best-effort, needs network): already verified?
      try {
        const res = await fetch("/api/check-barcode", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) return; // offline / error → keep it, don't block capture
        const data = (await res.json()) as {
          verified?: boolean;
          productName?: string | null;
          ingredientsPreview?: string | null;
        };
        if (data.verified) {
          // Someone already captured this — most likely another person working
          // the same shelves. Stop the scan and ask, rather than quietly
          // letting a second capture overwrite the first.
          setDraft((d) => ({
            ...d,
            barcodes: d.barcodes.filter((b) => canonicalBarcode(b) !== key),
          }));
          setDuplicate({
            code,
            name: data.productName ?? null,
            preview: data.ingredientsPreview ?? null,
          });
        }
      } catch {
        /* offline — keep the code, dedupe happens later on write anyway */
      }
    },
    [adminToken]
  );

  const removeBarcode = useCallback((code: string) => {
    setDraft((d) => ({ ...d, barcodes: d.barcodes.filter((b) => b !== code) }));
  }, []);

  // ── Photos ──────────────────────────────────────────────────────────────────
  const onPhoto = useCallback(
    async (
      slot: "brand" | "ingredients" | "nutrition",
      dataUrl: string,
      productId?: string
    ) => {
      setOverlay(null);
      // Re-shooting a photo on an already-queued product.
      if (productId) {
        const item = queue.find((p) => p.id === productId);
        if (!item) return;
        await updateProduct(productId, {
          photos: { ...item.photos, [slot]: dataUrl },
          // The capture just changed, so the previous failure no longer
          // describes it — clear it rather than leave a stale warning.
          lastError: undefined,
        });
        refreshQueue();
        return;
      }
      setDraft((d) => ({ ...d, photos: { ...d.photos, [slot]: dataUrl } }));
    },
    [queue, refreshQueue]
  );

  const removeQueued = useCallback(
    async (id: string) => {
      await deleteProduct(id);
      refreshQueue();
    },
    [refreshQueue]
  );

  /**
   * Re-shoot a product that's already in the catalog. Loads its barcode into the
   * capture card so the next photos are read fresh by the model; processing
   * upserts on that code, so the new reading replaces the stored row. This is
   * the fix for a misread the photos can correct — a brand that came back
   * "Veruva" instead of "Weruva" — without hunting for the physical barcode.
   */
  const recaptureFromCatalog = useCallback(
    (code: string, productName: string | null) => {
      setDraft({ barcodes: [code], photos: {} });
      setDupWarning(null);
      setOutcomes(null);
      setCatalogNote(
        `Re-shooting ${productName || code}. Take the photos below, then Process all — it replaces the stored row.`
      );
      captureCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    []
  );

  // ── Done / Skip ──────────────────────────────────────────────────────────────
  const canFinish = draft.barcodes.length > 0 && !!draft.photos.ingredients;

  const finish = useCallback(async () => {
    if (!canFinish || flashRef.current) return;
    flashRef.current = true;
    try {
      await addProduct({ barcodes: draft.barcodes, mode, photos: draft.photos });
      setDraft(EMPTY_DRAFT);
      refreshQueue();
      setOutcomes(null);
      setDupWarning(null);
    } finally {
      flashRef.current = false;
    }
  }, [canFinish, draft, mode, refreshQueue]);

  const skip = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setDupWarning(null);
  }, []);

  // ── Process all ──────────────────────────────────────────────────────────────
  const processAll = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    setOutcomes(null);
    let items: PendingProduct[] = [];
    try {
      items = await listProducts();
    } catch {
      setProcessing(false);
      return;
    }
    setProgress({ done: 0, total: items.length });
    const results: ProcessOutcome[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let outcome: ProcessOutcome;
      try {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({
            barcodes: item.barcodes,
            mode: item.mode,
            photos: {
              brand: item.photos.brand ?? null,
              ingredients: item.photos.ingredients ?? null,
            },
          }),
        });
        // Read as text first so a non-JSON error page (413/500/504 from the
        // platform) still yields something useful instead of a blank "unknown".
        const text = await res.text();
        let data: {
          ok?: boolean;
          reason?: string;
          error?: string;
          message?: string;
          product_name?: string | null;
          language?: string;
        } = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          /* non-JSON body — keep the raw text as the message below */
        }
        if (res.ok && data.ok) {
          await deleteProduct(item.id); // photos gone once the text is stored
          outcome = {
            id: item.id,
            barcodes: item.barcodes,
            ok: true,
            productName: data.product_name ?? null,
          };
        } else {
          const reason =
            data.reason ?? data.error ?? `http_${res.status}`;
          const message =
            data.message ??
            // Naming the language read makes a wrong-column shot self-evident.
            (reason === "wrong-language" && data.language
              ? `Read as ${data.language}.`
              : undefined) ??
            (!data.reason && !data.error && text
              ? text.replace(/\s+/g, " ").slice(0, 160)
              : undefined);
          outcome = {
            id: item.id,
            barcodes: item.barcodes,
            ok: false,
            productName: data.product_name ?? null,
            reason,
            message,
          };
        }
      } catch {
        // Offline / network — keep the item queued for a later retry.
        outcome = {
          id: item.id,
          barcodes: item.barcodes,
          ok: false,
          productName: null,
          reason: "network",
        };
      }
      // Remember the failure on the product itself. The summary below is lost
      // on reload; this isn't, so tomorrow you still know what needs re-shooting.
      if (!outcome.ok) {
        try {
          await updateProduct(item.id, {
            lastError: {
              reason: outcome.reason ?? "unknown",
              message: outcome.message,
              at: Date.now(),
            },
          });
        } catch {
          /* the outcome list still shows it for this run */
        }
      }
      results.push(outcome);
      setProgress({ done: i + 1, total: items.length });
    }

    setOutcomes(results);
    setProgress(null);
    setProcessing(false);
    refreshQueue();
  }, [processing, adminToken, refreshQueue]);

  const succeeded = outcomes?.filter((o) => o.ok).length ?? 0;
  const failed = outcomes?.filter((o) => !o.ok) ?? [];

  const failedIngredients = queue.filter(needsIngredientsRedo).length;
  const missingBrand = queue.filter(needsBrandPhoto).length;
  const visibleQueue =
    queueFilter === "ingredients"
      ? queue.filter(needsIngredientsRedo)
      : queueFilter === "brand"
        ? queue.filter(needsBrandPhoto)
        : queue;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-5 px-4 pb-[calc(env(safe-area-inset-bottom)_+_7rem)] pt-[calc(env(safe-area-inset-top)_+_1.25rem)]">
      {/* Header + counter */}
      <header className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <Barcode size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h1 className="text-[17px] font-semibold text-ink">Catalog Scanner</h1>
        </div>
        <div className="rounded-full bg-sage-500 px-4 py-1.5 text-[13px] font-semibold text-white">
          Captured: {captured}
        </div>
      </header>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(Object.keys(MODE_LABELS) as CaptureMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`h-9 flex-1 rounded-input text-[13px] font-medium transition ${
              mode === m
                ? "bg-ink text-white"
                : "border border-line bg-surface text-muted"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Duplicate warning — this code is already ours / already queued here. */}
      {dupWarning && (
        <div className="flex items-start gap-2 rounded-input border border-amber bg-amber-soft px-3 py-3">
          <AlertTriangle
            size={16}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-amber"
            aria-hidden="true"
          />
          {/* Only the local case reaches this now — a code already sitting in
              YOUR queue. A code the shared catalog holds opens the dialog
              instead, since that one affects other people's work. */}
          <div className="min-w-0 flex-1 text-[13px] leading-snug text-ink">
            <span className="font-semibold">Already in your queue</span>
            <span className="mt-0.5 block text-[12px] text-muted">
              <span className="font-mono">{dupWarning.code}</span> · you captured
              this one already — scan a different product.
            </span>
          </div>
          <button
            onClick={() => setDupWarning(null)}
            aria-label="Dismiss"
            className="shrink-0 text-faint"
          >
            <X size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      )}

      {catalogNote && (
        <div className="flex items-start justify-between gap-2 rounded-input bg-surfaceSoft px-3 py-2 text-[12px] leading-snug text-ink">
          <span>{catalogNote}</span>
          <button
            onClick={() => setCatalogNote(null)}
            aria-label="Dismiss"
            className="shrink-0 text-faint"
          >
            <X size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Current product card */}
      <section ref={captureCardRef} className="card flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink">Current product</h2>
          {(draft.barcodes.length > 0 ||
            draft.photos.ingredients ||
            draft.photos.brand) && (
            <button
              onClick={skip}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-faint"
            >
              <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
              Skip
            </button>
          )}
        </div>

        {/* Barcodes */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium uppercase tracking-wide text-faint">
            Barcodes ({draft.barcodes.length})
          </p>
          {draft.barcodes.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {draft.barcodes.map((code) => (
                <li
                  key={code}
                  className="flex items-center justify-between rounded-input bg-surfaceSoft px-3 py-2"
                >
                  <span className="font-mono text-[14px] text-ink">{code}</span>
                  <button
                    onClick={() => removeBarcode(code)}
                    aria-label={`Remove ${code}`}
                    className="text-faint"
                  >
                    <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setOverlay({ kind: "barcode" })}
            className="btn-secondary"
          >
            {draft.barcodes.length === 0 ? (
              <>
                <ScanLine size={18} strokeWidth={1.8} aria-hidden="true" />
                Scan barcode
              </>
            ) : (
              <>
                <Plus size={18} strokeWidth={1.8} aria-hidden="true" />
                Add another barcode
              </>
            )}
          </button>
        </div>

        {/* Photos */}
        <div className="grid grid-cols-2 gap-2">
          <PhotoSlot
            label="Brand / name"
            done={!!draft.photos.brand}
            onClick={() => setOverlay({ kind: "photo", slot: "brand" })}
          />
          <PhotoSlot
            label="Ingredients"
            required
            done={!!draft.photos.ingredients}
            onClick={() => setOverlay({ kind: "photo", slot: "ingredients" })}
          />
        </div>

        {captureNutrition && (
          <PhotoSlot
            label="Nutrition panel (optional)"
            done={!!draft.photos.nutrition}
            onClick={() => setOverlay({ kind: "photo", slot: "nutrition" })}
          />
        )}
        <button
          onClick={() => setCaptureNutrition((v) => !v)}
          className="self-start text-[12px] font-medium text-faint"
        >
          {captureNutrition ? "− Hide nutrition photo" : "+ Add nutrition photo"}
        </button>

        {/* Done */}
        <button onClick={finish} disabled={!canFinish} className="btn-primary">
          <Check size={18} strokeWidth={2} aria-hidden="true" />
          Done
        </button>
        {!canFinish && (
          <p className="-mt-2 text-center text-[12px] text-faint">
            Need at least one barcode and the ingredients photo.
          </p>
        )}
      </section>

      {/* Captured queue — review, re-shoot a bad photo, or drop a product. */}
      {queue.length > 0 && (
        <section className="card flex flex-col gap-3 p-4">
          <h2 className="text-[14px] font-semibold text-ink">
            Captured ({queue.length})
          </h2>
          <p className="-mt-1 text-[12px] leading-relaxed text-muted">
            Tap a photo to re-shoot or re-upload it. Nothing is sent until you
            process the queue.
          </p>

          {/* What still needs attention here. Failures survive a reload, so a
              product that didn't go through stays findable. */}
          {(failedIngredients > 0 || missingBrand > 0) && (
            <div className="flex flex-wrap gap-2">
              <QueueChip
                label="All"
                count={queue.length}
                active={queueFilter === null}
                onClick={() => setQueueFilter(null)}
              />
              {failedIngredients > 0 && (
                <QueueChip
                  label="Ingredients failed"
                  count={failedIngredients}
                  warn
                  active={queueFilter === "ingredients"}
                  onClick={() =>
                    setQueueFilter((f) =>
                      f === "ingredients" ? null : "ingredients"
                    )
                  }
                />
              )}
              {missingBrand > 0 && (
                <QueueChip
                  label="No brand photo"
                  count={missingBrand}
                  warn
                  active={queueFilter === "brand"}
                  onClick={() =>
                    setQueueFilter((f) => (f === "brand" ? null : "brand"))
                  }
                />
              )}
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {visibleQueue.map((item, i) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-input bg-surfaceSoft p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-ink">
                      #{i + 1} · {MODE_LABELS[item.mode]}
                    </div>
                    <div className="mt-0.5 font-mono text-[12px] leading-snug text-muted">
                      {item.barcodes.join(", ")}
                    </div>
                  </div>
                  <button
                    onClick={() => removeQueued(item.id)}
                    aria-label={`Delete captured product ${i + 1}`}
                    className="shrink-0 rounded-full p-1.5 text-faint transition active:scale-95"
                  >
                    <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                {/* Why the last run rejected it — persisted, so it's still here
                    after a reload. Tap the photo below to redo it. */}
                {item.lastError && (
                  <div className="flex items-start gap-1.5 rounded bg-amber-soft px-2 py-1.5">
                    <AlertTriangle
                      size={13}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-amber"
                      aria-hidden="true"
                    />
                    <span className="text-[11px] leading-snug text-ink">
                      {REASON_LABEL[item.lastError.reason] ??
                        item.lastError.reason}
                      {item.lastError.message ? ` · ${item.lastError.message}` : ""}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <QueueThumb
                    label="Brand"
                    src={item.photos.brand}
                    onClick={() =>
                      setOverlay({
                        kind: "photo",
                        slot: "brand",
                        productId: item.id,
                      })
                    }
                  />
                  <QueueThumb
                    label="Ingredients"
                    src={item.photos.ingredients}
                    onClick={() =>
                      setOverlay({
                        kind: "photo",
                        slot: "ingredients",
                        productId: item.id,
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Process all */}
      <section className="card flex flex-col gap-3 p-4">
        <h2 className="text-[14px] font-semibold text-ink">Process queue</h2>
        <p className="text-[13px] leading-relaxed text-muted">
          Run this on good wifi. Reads each queued product with Claude vision,
          writes verified ingredients to the shared catalog, then deletes the
          photos. Failures are listed so you re-shoot only those.
        </p>
        <button
          onClick={processAll}
          disabled={processing || captured === 0}
          className="btn-secondary"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              Processing{progress ? ` ${progress.done}/${progress.total}` : "…"}
            </>
          ) : (
            <>
              <CloudUpload size={18} strokeWidth={1.8} aria-hidden="true" />
              Process all ({captured})
            </>
          )}
        </button>

        {outcomes && (
          <div className="flex flex-col gap-2 rounded-input bg-surfaceSoft p-3">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-sage-600">
              <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />
              {succeeded} written{failed.length > 0 ? `, ${failed.length} to re-shoot` : ""}
            </div>
            {failed.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {failed.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-start gap-2 rounded-input bg-amber-soft px-3 py-2"
                  >
                    <AlertTriangle
                      size={14}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-amber"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 text-[12px] leading-snug text-ink">
                      <span className="font-mono">{f.barcodes[0]}</span>
                      {f.productName ? ` · ${f.productName}` : ""}
                      <span className="block text-[11px] text-muted">
                        {REASON_LABEL[f.reason ?? ""] ?? f.reason}
                      </span>
                      {f.message && (
                        <span className="mt-0.5 block break-words text-[11px] text-faint">
                          {f.message}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Overlays */}
      {overlay?.kind === "barcode" && (
        <BarcodeScanner onDetected={onBarcode} onCancel={() => setOverlay(null)} />
      )}
      {overlay?.kind === "photo" && (
        <PhotoCapture
          preset={overlay.slot === "brand" ? "brand" : "ingredients"}
          title={
            overlay.slot === "brand"
              ? "Brand / name"
              : overlay.slot === "ingredients"
                ? "Ingredients"
                : "Nutrition panel"
          }
          hint={
            overlay.slot === "brand"
              ? "Fill the band with the full name incl. the variant."
              : overlay.slot === "ingredients"
                ? "Fit the whole ingredient list in the frame. Quick & rough is fine."
                : "Frame the guaranteed analysis / nutrition panel."
          }
          onCapture={(url) => onPhoto(overlay.slot, url, overlay.productId)}
          onCancel={() => setOverlay(null)}
        />
      )}

      {duplicate && (
        <DuplicateProductDialog
          code={duplicate.code}
          productName={duplicate.name}
          preview={duplicate.preview}
          adminToken={adminToken}
          onSkip={() => setDuplicate(null)}
          onRecapture={() => {
            const d = duplicate;
            setDuplicate(null);
            recaptureFromCatalog(d.code, d.name);
          }}
          onSaved={(message) => {
            setDuplicate(null);
            setCatalogNote(message);
          }}
        />
      )}

      {/* What's actually in the shared catalog — inspect and fix. */}
      <CatalogBrowser
        adminToken={adminToken}
        onRecapture={recaptureFromCatalog}
      />

      {/* Version — confirm a redeploy actually landed. */}
      <footer className="mt-auto pt-2 text-center text-[11px] text-faint">
        {process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}
        {process.env.NEXT_PUBLIC_BUILD_DATE
          ? ` · ${process.env.NEXT_PUBLIC_BUILD_DATE}`
          : ""}
      </footer>
    </main>
  );
}

/** A tappable count that narrows the queue to the captures needing work. */
function QueueChip({
  label,
  count,
  active,
  warn,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  warn?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition active:scale-[0.98] ${
        active
          ? "border-ink bg-ink text-white"
          : warn
            ? "border-amber bg-amber-soft text-ink"
            : "border-line bg-surface text-muted"
      }`}
    >
      {label}
      <span className={active ? "opacity-80" : "font-semibold"}>{count}</span>
    </button>
  );
}

/**
 * A queued product's photo. Shows the actual shot so a bad one (blurry, glare,
 * cut off) is obvious at a glance; tapping re-opens capture for that slot.
 */
function QueueThumb({
  label,
  src,
  onClick,
}: {
  label: string;
  src?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative h-20 flex-1 overflow-hidden rounded-input border border-line bg-surface transition active:scale-[0.98]"
      aria-label={`Replace the ${label.toLowerCase()} photo`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${label} photo`} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[12px] text-faint">
          No {label.toLowerCase()}
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-ink/60 px-2 py-1 text-[11px] font-medium text-white">
        {label} · tap to redo
      </span>
    </button>
  );
}

function PhotoSlot({
  label,
  done,
  required,
  onClick,
}: {
  label: string;
  done: boolean;
  required?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[68px] flex-col items-center justify-center gap-1 rounded-input border text-[12px] font-medium transition active:scale-[0.98] ${
        done
          ? "border-sage-400 bg-sage-50 text-sage-600"
          : "border-line bg-surface text-muted"
      }`}
    >
      {done ? (
        <Check size={18} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Camera size={18} strokeWidth={1.8} aria-hidden="true" />
      )}
      <span>
        {label}
        {required && !done ? " *" : ""}
      </span>
    </button>
  );
}
