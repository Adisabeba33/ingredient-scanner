import type { ScanMode } from "./barcode";
import type { LabelCategory } from "./extract";

/**
 * Which mode a captured product is actually filed under.
 *
 * The operator picks pet/human/cosmetics before shooting, and the picker is
 * sticky — so an afternoon of pet food followed by one cereal box files the
 * cereal as pet food. Every field that follows keys off that mode: a human
 * product would carry a species, a Guaranteed Analysis panel, a dry/wet
 * verdict. Until now the only cure was deleting the row and shooting it again.
 *
 * So the pack decides instead of the picker. The model reads the label anyway
 * (lib/extract.ts) and says what kind of product it is; when it can tell, that
 * is what the row is filed as, and the picker becomes what it always should
 * have been — a default for when the photos genuinely don't say.
 *
 * This is deliberately not clever. It answers one question with one rule, and
 * whatever it decides can be changed by hand afterwards, in the queue or in the
 * catalog — the model is a good reader, not an authority.
 */
const MODES: ScanMode[] = ["human", "pet", "cosmetics"];

/** Guard for a mode arriving from a request body or a stored row. Lives here
 *  rather than in lib/barcode.ts, which is kept byte-comparable with the
 *  consumer app's copy and must not grow scanner-only helpers. */
export function isScanMode(x: unknown): x is ScanMode {
  return typeof x === "string" && MODES.includes(x as ScanMode);
}

export interface ModeVerdict {
  /** What the row is filed as. */
  mode: ScanMode;
  /** True when the pack settled it, false when the operator's pick stood. */
  fromLabel: boolean;
  /** The operator's pick, kept so the UI can say it was overruled. */
  picked: ScanMode;
}

export function resolveCaptureMode(
  picked: ScanMode,
  detected: LabelCategory
): ModeVerdict {
  if (detected === "unknown") {
    return { mode: picked, fromLabel: false, picked };
  }
  return { mode: detected, fromLabel: true, picked };
}

/** True when the pack overruled the operator — the one case worth reporting. */
export function wasReclassified(v: ModeVerdict): boolean {
  return v.fromLabel && v.mode !== v.picked;
}
