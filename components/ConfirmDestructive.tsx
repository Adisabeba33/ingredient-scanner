"use client";

import { useCallback, useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Re-authentication gate for irreversible catalog changes.
 *
 * The admin token is kept in localStorage so capture stays fast, which means an
 * unlocked phone is a live session: deleting a row would otherwise be one tap.
 * Destructive actions therefore ask for the password again and verify it
 * server-side before running.
 *
 * Scope, honestly: this defends against someone using a session they didn't
 * open (a borrowed or unattended phone). It does NOT defend against a leaked
 * ADMIN_TOKEN — anyone holding the token can call the API directly, so the
 * protections that matter at scale are recoverable deletes and an audit trail,
 * not a second prompt.
 *
 * After a successful confirmation the gate stays open briefly, so cleaning up
 * several rows doesn't mean typing the password over and over.
 */

const GRACE_MS = 5 * 60 * 1000;

// Module scope on purpose: the grace window dies with the page, so a reload
// (or a new tab) always re-asks.
let unlockedUntil = 0;

export function isUnlocked(): boolean {
  return Date.now() < unlockedUntil;
}

export function clearUnlock(): void {
  unlockedUntil = 0;
}

export function ConfirmDestructive({
  title,
  body,
  confirmLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  /** "danger" for deletes; "normal" for edits, which are recoverable. */
  tone?: "danger" | "normal";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (checking) return;
      const token = value.trim();
      if (!token) return;
      setChecking(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "x-admin-token": token },
        });
        if (res.ok) {
          unlockedUntil = Date.now() + GRACE_MS;
          onConfirm();
          return;
        }
        setError(
          res.status === 401
            ? "That password wasn't accepted."
            : "Couldn't verify right now."
        );
      } catch {
        setError("Couldn't verify — check your connection.");
      } finally {
        setChecking(false);
      }
    },
    [value, checking, onConfirm]
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-[420px] rounded-card bg-surface p-5 shadow-card"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber">
            <ShieldAlert size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
          </div>
        </div>

        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Admin password"
          aria-label="Admin password"
          className="mt-4 h-12 w-full rounded-input border border-lineStrong bg-surface px-4 text-[15px] text-ink outline-none focus:border-sage-400"
        />
        {error && <p className="mt-2 text-[12px] text-risk-high">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-input border border-lineStrong bg-surface text-[14px] font-medium text-ink transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!value.trim() || checking}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-input text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 ${
              tone === "danger" ? "bg-risk-high" : "bg-sage-500"
            }`}
          >
            {checking ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
