"use client";

/**
 * The stored ingredient text, shown so it can actually be read and checked.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * This tool's entire job is getting that text into the catalog correctly, and
 * until now there was nowhere in it you could see the text in full. The
 * duplicate dialog showed the first 120 characters — about one line — with an
 * ellipsis. The catalog list put it in a 96-pixel box: six lines of an
 * ingredient statement that usually runs to twenty, technically scrollable, but
 * a small scrolling box inside a scrolling list is a thing a thumb cannot
 * reliably catch. So it read as simply cut off, with no way down.
 *
 * Being unable to read what is stored means being unable to answer the only
 * question that matters at that moment: does this need re-shooting?
 *
 * ── How it behaves ────────────────────────────────────────────────────────
 *
 * Collapsed to a few lines, because a list of products each showing a full
 * composition is unreadable. Tapping opens it to its whole height — no inner
 * scroll, so the page scrolls and the thumb does the one thing it is good at.
 * Short text never gets a control it doesn't need.
 *
 * Copy is there because checking a transcription against the packet in your
 * hand is easiest somewhere else — paste it where you can search it.
 */

import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

/** Lines shown before it folds. Enough to tell what a product is. */
const COLLAPSED_LINES = 3;

/**
 * Below this there is nothing to fold — a control that opens two lines into two
 * lines is noise, and noise on every row of a list is worse than the fold.
 */
const WORTH_FOLDING = 140;

export function StoredIngredients({
  text,
  emptyNote,
  className = "",
}: {
  text: string | null | undefined;
  /** Shown instead when nothing is stored — the caller knows what to suggest. */
  emptyNote?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const value = (text ?? "").trim();

  if (!value) {
    return (
      <p
        className={`rounded-input bg-amber-soft px-2 py-1.5 text-[11px] font-medium leading-snug text-ink ${className}`}
      >
        {emptyNote ?? "Nothing stored."}
      </p>
    );
  }

  const foldable = value.length > WORTH_FOLDING;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Refused, or an insecure origin. Selecting the text by hand still works,
      // and it is open on screen — saying nothing is better than an alert about
      // a clipboard.
    }
  }

  return (
    <div className={className}>
      <p
        // No inner scrollbar in either state. Collapsed it clamps; open it runs
        // to full height and the PAGE scrolls, which is the gesture that works.
        className="whitespace-pre-wrap break-words rounded-input bg-surface/70 px-2 py-1.5 text-[11px] leading-snug text-muted"
        style={
          open || !foldable
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: COLLAPSED_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {value}
      </p>

      <div className="mt-1 flex items-center gap-3">
        {foldable && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-600 transition active:scale-95"
          >
            {open ? "Show less" : `Show all ${value.length} characters`}
            <ChevronDown
              size={12}
              strokeWidth={2}
              aria-hidden="true"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition active:scale-95"
        >
          {copied ? (
            <Check size={12} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <Copy size={12} strokeWidth={2} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
