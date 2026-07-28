"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert, Camera } from "lucide-react";

/**
 * What happens when someone scans a barcode the catalog already holds.
 *
 * With several people capturing at once this is the common case, not the rare
 * one: the second person to reach a shelf shouldn't silently re-capture what the
 * first already did. So the scan stops here and asks — edit the existing entry,
 * or skip it and scan something else.
 *
 * Editing is gated on the admin password, because it overwrites a record other
 * people's scans already rely on. Skipping isn't gated: declining to change
 * anything needs no permission.
 */

interface Row {
  code: string;
  productName: string | null;
  brands: string | null;
  ingredientsText: string | null;
}

type Phase =
  | { kind: "ask" }
  | { kind: "auth" }
  | { kind: "loading" }
  | { kind: "edit"; row: Row }
  | { kind: "error"; message: string };

export function DuplicateProductDialog({
  code,
  productName,
  preview,
  adminToken,
  onSkip,
  onRecapture,
  onSaved,
}: {
  code: string;
  productName: string | null;
  preview: string | null;
  /** Only used to load the row once the password has been re-entered. */
  adminToken: string;
  /** "No" — drop this code and go back to scanning. */
  onSkip: () => void;
  /** Re-shoot the photos instead of typing corrections. */
  onRecapture: () => void;
  onSaved: (message: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "ask" });
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brands, setBrands] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load the full stored row — the scan check only carries a truncated preview,
  // and editing needs the whole composition.
  const loadRow = useCallback(async () => {
    setPhase({ kind: "loading" });
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ q: code }),
      });
      if (!res.ok) {
        setPhase({ kind: "error", message: "Couldn't load this product." });
        return;
      }
      const data = (await res.json()) as { results?: Row[] };
      const row =
        data.results?.find((r) => r.code === code) ?? data.results?.[0] ?? null;
      if (!row) {
        setPhase({ kind: "error", message: "This product is no longer stored." });
        return;
      }
      setName(row.productName ?? "");
      setBrands(row.brands ?? "");
      setText(row.ingredientsText ?? "");
      setPhase({ kind: "edit", row });
    } catch {
      setPhase({ kind: "error", message: "Network error — try again." });
    }
  }, [adminToken, code]);

  const submitPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const token = password.trim();
      if (!token || checking) return;
      setChecking(true);
      setAuthError(null);
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "x-admin-token": token },
        });
        if (res.ok) {
          void loadRow();
          return;
        }
        setAuthError(
          res.status === 401
            ? "That password wasn't accepted."
            : "Couldn't verify right now."
        );
      } catch {
        setAuthError("Couldn't verify — check your connection.");
      } finally {
        setChecking(false);
      }
    },
    [password, checking, loadRow]
  );

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/catalog/update", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          code,
          productName: name,
          brands,
          ingredientsText: text,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setSaveError(data.message ?? data.error ?? "Couldn't save.");
        return;
      }
      onSaved(`Updated ${code}.`);
    } catch {
      setSaveError("Network error — nothing was saved.");
    } finally {
      setSaving(false);
    }
  }, [saving, adminToken, code, name, brands, text, onSaved]);

  // Escape always means "no".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[88dvh] w-full max-w-[440px] overflow-y-auto rounded-card bg-surface p-5 shadow-card">
        {phase.kind === "ask" && (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber">
                <AlertTriangle size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-ink">
                  This barcode is already in the catalog
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  <span className="font-mono">{code}</span>
                  {productName ? ` · ${productName}` : ""} was captured already —
                  someone may have just done it. Do you want to edit it?
                </p>
                {preview && (
                  <p className="mt-2 rounded-input bg-surfaceSoft px-3 py-2 text-[11px] leading-snug text-muted">
                    Stored now: “{preview}…”
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={onSkip}
                className="h-11 flex-1 rounded-input border border-lineStrong bg-surface text-[14px] font-medium text-ink transition active:scale-[0.98]"
              >
                No — scan another
              </button>
              <button
                onClick={() => setPhase({ kind: "auth" })}
                className="h-11 flex-1 rounded-input bg-sage-500 text-[14px] font-semibold text-white transition active:scale-[0.98]"
              >
                Yes, edit
              </button>
            </div>
            <button
              onClick={onRecapture}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-input text-[13px] font-medium text-muted transition active:scale-[0.98]"
            >
              <Camera size={15} strokeWidth={1.8} aria-hidden="true" />
              Or re-shoot the photos
            </button>
          </>
        )}

        {phase.kind === "auth" && (
          <form onSubmit={submitPassword}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber">
                <ShieldAlert size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-ink">
                  Enter the admin password
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Editing replaces what everyone sees for this product.
                </p>
              </div>
            </div>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder="Admin password"
              aria-label="Admin password"
              className="mt-4 h-12 w-full rounded-input border border-lineStrong bg-surface px-4 text-[15px] text-ink outline-none focus:border-sage-400"
            />
            {authError && (
              <p className="mt-2 text-[12px] text-risk-high">{authError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onSkip}
                className="h-11 flex-1 rounded-input border border-lineStrong bg-surface text-[14px] font-medium text-ink transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password.trim() || checking}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-input bg-sage-500 text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
              >
                {checking ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  "Unlock"
                )}
              </button>
            </div>
          </form>
        )}

        {phase.kind === "loading" && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted">
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            <span className="text-[13px]">Loading the stored product…</span>
          </div>
        )}

        {phase.kind === "error" && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] text-risk-high">{phase.message}</p>
            <button
              onClick={onSkip}
              className="h-11 rounded-input border border-lineStrong bg-surface text-[14px] font-medium text-ink"
            >
              Close
            </button>
          </div>
        )}

        {phase.kind === "edit" && (
          <>
            <h3 className="text-[15px] font-semibold text-ink">Edit product</h3>
            <p className="mt-1 font-mono text-[12px] text-faint">{code}</p>
            <div className="mt-4 flex flex-col gap-2">
              <input
                value={brands}
                onChange={(e) => setBrands(e.target.value)}
                placeholder="Brand"
                aria-label="Brand"
                className="h-11 w-full rounded-input border border-lineStrong bg-surface px-3 text-[14px] text-ink outline-none focus:border-sage-400"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                aria-label="Product name"
                className="h-11 w-full rounded-input border border-lineStrong bg-surface px-3 text-[14px] text-ink outline-none focus:border-sage-400"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Ingredients, exactly as printed"
                aria-label="Ingredients"
                className="w-full rounded-input border border-lineStrong bg-surface px-3 py-2 text-[12px] leading-snug text-ink outline-none focus:border-sage-400"
              />
              <p className="text-[11px] leading-snug text-faint">
                Type it as printed — don&apos;t translate or tidy it up. Saving
                clears the stored report so it rebuilds from this.
              </p>
            </div>
            {saveError && (
              <p className="mt-2 text-[12px] text-risk-high">{saveError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={onSkip}
                className="h-11 flex-1 rounded-input border border-lineStrong bg-surface text-[14px] font-medium text-ink transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-input bg-sage-500 text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
