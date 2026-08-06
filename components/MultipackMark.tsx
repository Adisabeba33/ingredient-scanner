"use client";

import { useCallback, useState } from "react";
import { Boxes, ScanLine } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";

/**
 * Marking the code on the outside of a variety pack.
 *
 * A box of three recipes is four barcodes, and only three of them name
 * something anybody eats. The fourth is on the carton, and it has no ingredient
 * list — not a missing one, an impossible one.
 *
 * ── Why this is worth a control of its own ────────────────────────────────
 *
 * Leaving the box code out of the catalog is not the safe option. In the app an
 * unknown code opens the discovery screen — photograph the ingredients and this
 * product exists — and the person does that, photographing the back of the box,
 * where every recipe is printed one after another. The text that comes back
 * parses like a composition, fingerprints like one and scores like one, and
 * belongs to no product. There is no test downstream that catches it, because
 * by every measurable property it IS an ingredient list.
 *
 * So somebody holding the box says so once, and the app stops asking.
 *
 * The name is optional and worth typing: it lets the app say "Ninja Cat Variety
 * Pack holds several recipes" instead of reciting a barcode to somebody who is
 * looking straight at the box.
 */

type Result =
  | { kind: "ok"; code: string; already: boolean; productName: string | null }
  | { kind: "refused"; message: string };

export function MultipackMark({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = useCallback(
    async (barcode: string) => {
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
          body: JSON.stringify({ code: barcode, productName: name || null }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          code?: string;
          already?: boolean;
          productName?: string | null;
          reason?: string;
        };
        if (res.ok && data.ok) {
          setResult({
            kind: "ok",
            code: data.code ?? barcode,
            already: data.already === true,
            productName: data.productName ?? null,
          });
          setCode("");
          setName("");
          return;
        }
        setResult({
          kind: "refused",
          message:
            data.reason === "holds-a-reading"
              ? `That code already holds a stored ingredient list${
                  data.productName ? ` (${data.productName})` : ""
                }. If the list is wrong, that's a correction — this would erase it.`
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
    },
    [adminToken, busy, name]
  );

  const unmark = useCallback(
    async (barcode: string) => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/multipack", {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({ code: barcode }),
        });
        setResult(
          res.ok
            ? { kind: "refused", message: `${barcode} is an ordinary unknown code again.` }
            : { kind: "refused", message: "Couldn't undo that." }
        );
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
            The code on the outside of a box of several recipes. It has no
            ingredient list of its own, and marking it stops the app asking
            somebody to photograph one — the back of such a box reads as one
            enormous composition that belongs to no product.
          </p>

          {scanning ? (
            <BarcodeScanner
              onDetected={(detected) => {
                setScanning(false);
                setCode(detected);
                void submit(detected);
              }}
              onCancel={() => setScanning(false)}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setScanning(true)}
                disabled={busy}
                className="flex items-center justify-center gap-1.5 rounded-full bg-sage-500 px-3 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                <ScanLine size={14} strokeWidth={1.8} aria-hidden="true" />
                Scan the box
              </button>

              <div className="flex flex-col gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Box name (optional)"
                  className="rounded-input border border-lineStrong bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint"
                />
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    placeholder="…or type the code"
                    className="flex-1 rounded-input border border-lineStrong bg-surface px-3 py-2 font-mono text-[13px] text-ink placeholder:font-sans placeholder:text-faint"
                  />
                  <button
                    type="button"
                    onClick={() => void submit(code)}
                    disabled={busy || code.trim().length < 6}
                    className="rounded-full bg-sage-500 px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
                  >
                    {busy ? "Marking…" : "Mark"}
                  </button>
                </div>
              </div>
            </>
          )}

          {result?.kind === "ok" && (
            <div className="rounded-input bg-sage-50 px-3 py-2 text-[12px] leading-snug text-ink">
              <span className="font-mono">{result.code}</span>{" "}
              {result.already ? "was already marked" : "marked"} as a variety
              pack{result.productName ? ` — ${result.productName}` : ""}. The app
              will send people to the item inside.
              {/* Scanning the tin instead of the carton is an easy slip, and a
                  product wrongly called a box is one the capture route now
                  refuses to write. Without a way back that mistake is silent
                  and permanent. */}
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
