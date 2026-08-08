/**
 * Holding still, for a hand that won't.
 *
 * ── What was asked for, and what actually helps ───────────────────────────
 *
 * The request was a button that freezes the picture for a few seconds so the
 * shake stops mattering. Freezing the picture alone would not have helped: the
 * decoder does not read the screen, so a frozen preview over a live decode
 * changes nothing, and a genuinely frozen frame means re-reading the same
 * smeared image until the timer runs out — worse than before.
 *
 * What does help is the same idea one step further in. While the button is
 * held, every frame is scored for sharpness and only the sharpest so far is
 * kept. That frame is frozen on screen, so the hand can relax and you can see
 * what was actually caught, and the held seconds are spent reading THAT one
 * frame several different ways instead of reading fifty mediocre ones once
 * each. A blurred frame is not worth a decode; a sharp one is worth four.
 *
 * ── The four readings ─────────────────────────────────────────────────────
 *
 * As photographed, then hard contrast, then both of those inverted. Inversion
 * is not padding: a code printed light-on-dark — foil, a black pack — is
 * invisible to a reader that assumes dark bars, and it finds nothing rather
 * than finding it backwards.
 *
 * One thing the caller must get right: sharpness is scored on the APERTURE, not
 * the whole picture. A phone pointed at a shelf has most of the shelf in frame,
 * and a crisp shelf behind a smeared barcode would win every comparison.
 */

/** How long a hold runs before it gives up and hands the camera back. */
export const STEADY_MAX_MS = 6000;

/** How often a frame is scored while holding. Roughly ten looks a second. */
export const STEADY_TICK_MS = 90;

/**
 * The readings tried on a kept frame, in order. Each is a transform of the same
 * pixels — cheap next to grabbing another frame, and each answers a different
 * reason the code might not have read.
 */
export type Reading = "raw" | "contrast" | "raw-inverted" | "contrast-inverted";

export const READINGS: Reading[] = [
  "raw",
  "contrast",
  "raw-inverted",
  "contrast-inverted",
];

export function needsContrast(reading: Reading): boolean {
  return reading === "contrast" || reading === "contrast-inverted";
}

export function needsInvert(reading: Reading): boolean {
  return reading === "raw-inverted" || reading === "contrast-inverted";
}

/**
 * Whether a newly scored frame should replace the one being held.
 *
 * Strictly better, not merely as good: on a still subject the score wanders by
 * a hair from frame to frame, and swapping the kept frame for a statistically
 * identical one would restart the readings for nothing.
 */
export function shouldKeep(score: number, best: number): boolean {
  return score > best;
}
