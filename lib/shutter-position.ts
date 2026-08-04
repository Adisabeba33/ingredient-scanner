/**
 * Where to put the shutter, given where the frame is.
 *
 * PURE, so the awkward cases can be checked without a camera.
 *
 * ── Why the shutter moves at all ──────────────────────────────────────────
 *
 * It used to be pinned to the bottom centre. You frame the ingredients with a
 * thumb somewhere in the middle of the screen, get it sharp, and then have to
 * travel to the corner of the phone and press — which moves the phone, sends
 * autofocus hunting, and smears the shot. Then you do it again.
 *
 * Keeping the button near the frame means the thumb is already there: lift,
 * tap. It does not remove the shake (see `sharpness.ts` for that half) but it
 * removes the journey, and the journey is what costs the seconds.
 *
 * ── The rules ─────────────────────────────────────────────────────────────
 *
 * Below the frame when there is room, above it when there isn't, and never
 * over the frame itself — whatever is being framed is the one thing that must
 * stay visible while aiming. Everything is in fractions of the camera box, so
 * this doesn't need to know a single pixel.
 *
 * ── The one thing that is not a fraction of one dimension ─────────────────
 *
 * The button is a circle sized from the box's WIDTH. Its half-HEIGHT is
 * therefore a different fraction of the box, by exactly the aspect ratio, and
 * on a phone held upright that is a factor of two. Measuring the vertical
 * clearance in width-fractions makes the button believe it needs twice the room
 * it does, so it decides it doesn't fit, flips above, decides that doesn't fit
 * either, and gives up — leaving the fixed button behind for precisely the
 * frame people use most. Hence `aspect`.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ShutterSpot {
  /** Centre of the button, as fractions of the camera box. */
  cx: number;
  cy: number;
  /** Which side of the frame it ended up on — the caller may want to know. */
  side: "below" | "above";
  /**
   * Whether it stands clear of the frame. A frame filling the screen leaves
   * nowhere to put it without covering the label, which would defeat the aiming
   * this exists to help; the caller falls back to the fixed bottom shutter.
   */
  clear: boolean;
}

/**
 * Half the button's width, as a fraction of the box's width.
 *
 * A shutter is a big target on purpose — it is pressed while holding a phone in
 * one hand and a tin in the other — so the number is generous.
 */
export const SHUTTER_RADIUS = 0.115;

/** Breathing room between button and frame, as a fraction of the box's height. */
const GAP = 0.03;

/** Keep the whole button on screen, with a little to spare. */
const MARGIN = 0.02;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** A portrait phone, for the moment before the camera box has been measured. */
const ASSUMED_ASPECT = 0.5;

/**
 * @param frame  the framing rectangle, in fractions of the camera box
 * @param aspect the camera box's width ÷ height
 */
export function shutterPlacement(frame: Rect, aspect: number): ShutterSpot {
  const rx = SHUTTER_RADIUS;
  const ry =
    SHUTTER_RADIUS *
    (Number.isFinite(aspect) && aspect > 0 ? aspect : ASSUMED_ASPECT);

  const lowest = 1 - ry - MARGIN;
  const highest = ry + MARGIN;

  const below = frame.y + frame.h + GAP + ry;
  const fitsBelow = below <= lowest;

  const cy = clamp(fitsBelow ? below : frame.y - GAP - ry, highest, lowest);
  // Horizontally on the frame's centre: that is where the hand already is,
  // and it keeps the button off the corner handles.
  const cx = clamp(frame.x + frame.w / 2, rx + MARGIN, 1 - rx - MARGIN);

  return {
    cx,
    cy,
    side: fitsBelow ? "below" : "above",
    clear:
      cx + rx <= frame.x ||
      cx - rx >= frame.x + frame.w ||
      cy + ry <= frame.y ||
      cy - ry >= frame.y + frame.h,
  };
}
