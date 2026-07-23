"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";

/**
 * Admin gate for the whole tool. The token is kept in localStorage and verified
 * against `/api/admin/verify` on load; children only render once it checks out.
 * Every real write re-checks the token server-side, so this is just the UX gate.
 */

const STORAGE_KEY = "catalog-scanner:admin-token";

type State =
  | { kind: "checking" }
  | { kind: "locked"; error?: string }
  | { kind: "not-configured" }
  | { kind: "unlocked"; token: string };

async function verify(token: string): Promise<"ok" | "bad" | "not-configured"> {
  try {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "x-admin-token": token },
    });
    if (res.ok) return "ok";
    if (res.status === 501) return "not-configured";
    return "bad";
  } catch {
    return "bad";
  }
}

export function AdminGate({
  children,
}: {
  children: (token: string) => React.ReactNode;
}) {
  const [state, setState] = useState<State>({ kind: "checking" });
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored =
      typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setState({ kind: "locked" });
      return;
    }
    verify(stored).then((r) => {
      if (r === "ok") setState({ kind: "unlocked", token: stored });
      else if (r === "not-configured") setState({ kind: "not-configured" });
      else {
        localStorage.removeItem(STORAGE_KEY);
        setState({ kind: "locked" });
      }
    });
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const token = input.trim();
      if (!token || submitting) return;
      setSubmitting(true);
      const r = await verify(token);
      setSubmitting(false);
      if (r === "ok") {
        localStorage.setItem(STORAGE_KEY, token);
        setState({ kind: "unlocked", token });
      } else if (r === "not-configured") {
        setState({ kind: "not-configured" });
      } else {
        setState({ kind: "locked", error: "That token wasn't accepted." });
      }
    },
    [input, submitting]
  );

  if (state.kind === "unlocked") return <>{children(state.token)}</>;

  if (state.kind === "checking") {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center text-muted">
        <Loader2 className="animate-spin" size={22} aria-hidden="true" />
      </main>
    );
  }

  if (state.kind === "not-configured") {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-[15px] font-semibold text-risk-high">
          Server not configured
        </p>
        <p className="max-w-[320px] text-[14px] leading-relaxed text-muted">
          <code>ADMIN_TOKEN</code> isn&apos;t set on the server. Set it (plus the
          Supabase and Anthropic keys) in the deployment environment, then
          reload.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-600">
          <Lock size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="text-[20px] font-semibold text-ink">Catalog Scanner</h1>
        <p className="max-w-[300px] text-[14px] leading-relaxed text-muted">
          Admin-only capture tool. Enter the admin token to start seeding the
          shared catalog.
        </p>
      </div>
      <form onSubmit={submit} className="flex w-full flex-col gap-3">
        <input
          type="password"
          inputMode="text"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Admin token"
          className="h-14 w-full rounded-input border border-lineStrong bg-surface px-5 text-[16px] text-ink outline-none focus:border-sage-400"
        />
        {state.error && (
          <p className="text-[13px] text-risk-high">{state.error}</p>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            "Unlock"
          )}
        </button>
      </form>
    </main>
  );
}
