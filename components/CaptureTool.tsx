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
} from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { PhotoCapture } from "@/components/PhotoCapture";
import { canonicalBarcode } from "@/lib/barcode";
import {
  addProduct,
  countProducts,
  deleteProduct,
  listProducts,
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
  | { kind: "photo"; slot: "brand" | "ingredients" | "nutrition" }
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
};

export function CaptureTool({ adminToken }: { adminToken: string }) {
  const [mode, setMode] = useState<CaptureMode>("pet");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [captured, setCaptured] = useState(0);
  const [captureNutrition, setCaptureNutrition] = useState(false);

  // Processing state.
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [outcomes, setOutcomes] = useState<ProcessOutcome[] | null>(null);

  const flashRef = useRef(false);

  const refreshCount = useCallback(() => {
    countProducts()
      .then(setCaptured)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // ── Barcode ────────────────────────────────────────────────────────────────
  const onBarcode = useCallback((code: string) => {
    beep();
    setDraft((d) => {
      const key = canonicalBarcode(code);
      if (d.barcodes.some((b) => canonicalBarcode(b) === key)) return d; // dedupe
      return { ...d, barcodes: [...d.barcodes, code] };
    });
    setOverlay(null);
  }, []);

  const removeBarcode = useCallback((code: string) => {
    setDraft((d) => ({ ...d, barcodes: d.barcodes.filter((b) => b !== code) }));
  }, []);

  // ── Photos ──────────────────────────────────────────────────────────────────
  const onPhoto = useCallback(
    (slot: "brand" | "ingredients" | "nutrition", dataUrl: string) => {
      setDraft((d) => ({ ...d, photos: { ...d.photos, [slot]: dataUrl } }));
      setOverlay(null);
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
      setCaptured((n) => n + 1);
      setOutcomes(null);
    } finally {
      flashRef.current = false;
    }
  }, [canFinish, draft, mode]);

  const skip = useCallback(() => setDraft(EMPTY_DRAFT), []);

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
      results.push(outcome);
      setProgress({ done: i + 1, total: items.length });
    }

    setOutcomes(results);
    setProgress(null);
    setProcessing(false);
    refreshCount();
  }, [processing, adminToken, refreshCount]);

  const succeeded = outcomes?.filter((o) => o.ok).length ?? 0;
  const failed = outcomes?.filter((o) => !o.ok) ?? [];

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

      {/* Current product card */}
      <section className="card flex flex-col gap-4 p-4">
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
          onCapture={(url) => onPhoto(overlay.slot, url)}
          onCancel={() => setOverlay(null)}
        />
      )}
    </main>
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
