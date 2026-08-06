"use client";

import { useCallback, useState } from "react";
import { Boxes, ScanLine, X } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";

/**
 * Recording a variety pack: the code on the carton, and the codes inside it.
 *
 * A box of three recipes is four barcodes, and only three of them name
 * something anybody eats. The fourth is on the carton and has no ingredient
 * list — not a missing one, an impossible one.
 *
 * ── Why the box needs marking at all ──────────────────────────────────────
 *
 * Leaving it unknown is not the safe option. In the app an unknown code opens
 * the discovery screen — photograph the ingredients and this product exists —
 * and the person does that, photographing the back of the box, where every
 * recipe is printed one after another. The text that comes back parses like a
 * composition, fingerprints like one and scores like one, and belongs to no
 * product. Nothing downstream catches it, because by every measurable property
 * it IS an ingredient list.
 *
 * ── Why the members are worth the extra scans ─────────────────────────────
 *
 * With them the app stops refusing and starts answering: three recipes, tap the
 * one you're about to open. The operator is holding the box with all four codes
 * on it, so reading them is one pass — and members do NOT have to be in the
 * catalog yet. A member nobody has captured shows in the app as unread, to the
 * one person who is holding that tin.
 *
 * Scanning is offered before typing because the codes are right there, and
 * twelve digits typed on a phone in a shop is where the mistakes come from.
 */

type Target = "box" | "member";

type Result =
  | { kind: "ok"; code: string; already: boolean; members: number }
  | { kind: "refused"; message: string };

export function MultipackMark({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState<Target | null>(null);
  const [box, setBox] = useState("");
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const addMember = useCallback(
    (code: string) => {
      const clean = code.trim();
      if (!clean) return;
      setMembers((m) => (m.includes(clean) || clean === box.trim() ? m : [...m, clean]));
    },
    [box]
  );

  const reset = useCallback(() => {
    setBox("");
    setName("");
    setMembers([]);
  }, []);

  const save = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/multipack", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          code: box,
          productName: name || null,
          contains: members,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        already?: boolean;
        contains?: string[];
        productName?: string | null;
        reason?: string;
      };
      if (res.ok && data.ok) {
        setResult({
          kind: "ok",
          code: data.code ?? box,
          already: data.already === true,
          members: data.contains?.length ?? 0,
        });
        reset();
        return;
      }
      setResult({
        kind: "refused",
        message:
          data.reason === "holds-a-reading"
            ? `That code already holds a stored ingredient list${
                data.productName ? ` (${data.productName})` : ""
              }. If the list is wrong that's a correction — this would erase it.`
            : data.reason === "invalid-code"
              ? "That isn't a barcode."
              : data.reason === "load-failed"
                ? "Couldn't read what's under that code — nothing was written."
                : "Couldn't mark that code.",
      });
    } catch {
      setResult({ kind: "refused", message: "Network error — nothing changed." });
    } finally {
      setBusy(false);
    }
  }, [adminToken, box, busy, members, name, reset]);

  const unmark = useCallback(
    async (code: string) => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/multipack", {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code }),
        });
        setResult({
          kind: "refused",
          message: res.ok
            ? `${code} is an ordinary unknown code again.`
            : "Couldn't undo that.",
        });
      } catch {
        setResult({ kind: "refused", message: "Network error — nothing changed." });
      } finally {
        setBusy(false);
      }
    },
    [adminToken, busy]
  );

  return (
    <section className="card flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Boxes size={16} strokeWidth={1.8} aria-hidden="true" />
          Variety pack
        </span>
        <span className="text-[12px] font-medium text-faint">
          {open ? "Hide" : "Open"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] leading-snug text-muted">
            Scan the carton, then each tin inside. The carton has no ingredient
            list of its own — marking it stops the app asking anyone to
            photograph one, and the tins become a list they can choose from.
          </p>

          {scanning ? (
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-medium text-ink">
                {scanning === "box" ? "Scanning the carton" : "Scanning a tin"}
              </div>
              <BarcodeScanner
                onDetected={(detected) => {
                  if (scanning === "box") setBox(detected);
                  else addMember(detected);
                  // Members come in threes and fours; staying open would make
                  // the next tin a single tap, but a scanner that won't close
                  // is worse than one extra tap. Close, and let them reopen.
                  setScanning(null);
                }}
                onCancel={() => setScanning(null)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    value={box}
                    onChange={(e) => setBox(e.target.value)}
                    inputMode="numeric"
                    placeholder="Carton barcode"
                    className="flex-1 rounded-input border border-lineStrong bg-surface px-3 py-2 font-mono text-[13px] text-ink placeholder:font-sans placeholder:text-faint"
                  />
                  <button
                    type="button"
                    onClick={() => setScanning("box")}
                    className="rounded-full bg-sage-500 px-3 py-2 text-[12px] font-medium text-white"
                  >
                    <ScanLine size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Box name (optional)"
                  className="rounded-input border border-lineStrong bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-[12px] font-medium text-ink">
                  Inside {members.length > 0 && `(${members.length})`}
                </div>
                {members.map((m) => (
                  <div
                    key={m}
                    className="flex items-center justify-between gap-2 rounded-input border border-lineStrong px-3 py-1.5"
                  >
                    <span className="font-mono text-[12px] text-ink">{m}</span>
                    <button
                      type="button"
                      onClick={() => setMembers((list) => list.filter((x) => x !== m))}
                      aria-label={`Remove ${m}`}
                      className="text-faint"
                    >
                      <X size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setScanning("member")}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-lineStrong bg-surface px-3 py-1.5 text-[12px] font-medium text-ink"
                >
                  <ScanLine size={13} strokeWidth={1.8} aria-hidden="true" />
                  Scan a tin
                </button>
              </div>

              <button
                type="button"
                onClick={() => void save()}
                disabled={busy || box.trim().length < 6}
                className="rounded-full bg-sage-500 px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                {busy
                  ? "Saving…"
                  : members.length > 0
                    ? `Save box and ${members.length} inside`
                    : "Mark as a variety pack"}
              </button>

              {members.length === 0 && box.trim().length >= 6 && (
                // Saying so rather than blocking: a marked box with no members
                // already does the important half of the job, and the operator
                // may not have the tins in front of them.
                <p className="text-[11.5px] leading-snug text-faint">
                  With no tins recorded the app will say it&apos;s a box and ask
                  for the item inside. Add them and it can offer the recipes.
                </p>
              )}
            </>
          )}

          {result?.kind === "ok" && (
            <div className="rounded-input bg-sage-50 px-3 py-2 text-[12px] leading-snug text-ink">
              <span className="font-mono">{result.code}</span>{" "}
              {result.already ? "updated" : "marked"} as a variety pack
              {result.members > 0
                ? ` holding ${result.members} recipe${result.members === 1 ? "" : "s"}.`
                : ". No tins recorded yet."}
              <button
                type="button"
                onClick={() => void unmark(result.code)}
                disabled={busy}
                className="mt-2 block rounded-full border border-lineStrong bg-surface px-3 py-1 text-[11px] font-medium text-ink disabled:opacity-50"
              >
                {busy ? "Undoing…" : "That was a mistake — undo"}
              </button>
            </div>
          )}

          {result?.kind === "refused" && (
            <div className="rounded-input bg-amber-soft px-3 py-2 text-[12px] leading-snug text-ink">
              {result.message}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
