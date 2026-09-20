import type { ScanOutcome } from "./scan-test";
import type { BrandFit } from "./brand-walk";

/**
 * What the camera shows for a second after a scan.
 *
 * ── Why the answer has to be ON the camera ────────────────────────────────
 *
 * Test Mode re-arms the reader after every code, because an aisle walk is
 * thirty tins and a screen that needs reopening after each one is a screen
 * nobody finishes. The verdict card was already being written — it just sat
 * BELOW the camera view, which on a phone is below the fold. So the operator's
 * experience of a working scanner was: point, nothing happens, point again,
 * nothing happens, and the answers all appear at the end when the reader is
 * closed. Eleven correct reads looked exactly like eleven failures.
 *
 * The fix is not more information. It is the same answer, for a moment, where
 * the eye already is.
 *
 * ── Three shapes, not five ────────────────────────────────────────────────
 *
 * The card below spells out all five outcomes, and should: afterwards, sitting
 * down, the difference between "half-written" and "not in the database" is the
 * difference between two jobs. In the aisle, at arm's length, with a tin in
 * one hand, the question is only ever "did that land, and do I need to do
 * something about it?" So the flash has three shapes — got it, got something
 * odd, got nothing — and the card keeps the detail.
 *
 * ── And a buzz, because the eye is on the shelf ───────────────────────────
 *
 * The phone is held at the tin, not at the face. One short pulse means carry
 * on; two means look at the screen. `navigator.vibrate` is absent on iOS
 * Safari and the caller treats that as nothing happening — the flash is the
 * signal that must work, the buzz is the one that helps when it can.
 */
export type FlashKind = "ok" | "odd" | "none";

export interface ScanFlash {
  kind: FlashKind;
  /** Two or three words, readable at arm's length. */
  headline: string;
  /** Vibration pattern in milliseconds, for `navigator.vibrate`. */
  vibrate: number[];
}

/**
 * How long the flash stays up, in milliseconds.
 *
 * Long enough to register without looking straight at it, short enough that
 * the next tin is not waiting on it. The reader re-arms underneath while this
 * is showing, so the flash never costs a scan — it only covers one.
 */
export const FLASH_MS = 1100;

const OK: Record<string, true> = { ours: true, open: true, multipack: true };

export function flashFor(outcome: ScanOutcome, fit: BrandFit = "unnamed"): ScanFlash {
  // The stray outranks the outcome, and it is the only case in this whole
  // screen that has to be acted on while the tin is still in the hand: a can
  // of another brand on this shelf goes back, and once it is scanned and put
  // down nobody can tell which one it was. So a perfectly catalogued tin on
  // the wrong shelf flashes odd, not ok.
  if (fit === "different") {
    return { kind: "odd", headline: "ANOTHER BRAND", vibrate: [40, 90, 40] };
  }
  if (outcome === "ours") {
    return { kind: "ok", headline: "IN THE CATALOG", vibrate: [35] };
  }
  if (OK[outcome]) {
    // Answered, but not by us. Nothing to do in the aisle — it is already a
    // row in the run — so it buzzes like a hit and reads differently.
    return { kind: "ok", headline: "ANSWERED", vibrate: [35] };
  }
  if (outcome === "not-found") {
    return { kind: "none", headline: "NOT FOUND", vibrate: [40, 90, 40] };
  }
  // `no-ingredients`: a row exists and says nothing useful. Worth knowing in
  // the aisle because this is the one a photograph fixes on the spot.
  return { kind: "odd", headline: "HALF-WRITTEN", vibrate: [40, 90, 40] };
}

/**
 * The lookup itself failed, which is not an outcome and must not read as one.
 *
 * Nothing is recorded on a failure — a run that counted an unreachable app as
 * a miss would be worse than no run at all — so without this the operator
 * scans, the reader re-arms, and the tin simply never appears in the run. That
 * is the one silence worse than the one this whole file is about.
 */
export const FLASH_FAILED: ScanFlash = {
  kind: "odd",
  headline: "NO ANSWER",
  vibrate: [40, 90, 40, 90, 40],
};

/** Ask the phone to buzz, where the phone has one. */
export function buzz(pattern: number[]): void {
  try {
    // Absent on iOS Safari, and refused in some embedded browsers. Either way
    // there is nothing to fall back to and nothing to report — the flash is
    // the signal, this is the bonus.
    navigator.vibrate?.(pattern);
  } catch {
    /* no haptics here */
  }
}
