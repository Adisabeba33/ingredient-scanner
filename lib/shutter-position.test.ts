import { describe, it, expect } from "vitest";
import {
  LAMP_RADIUS,
  SHUTTER_RADIUS,
  lampSpot,
  shutterPlacement,
  type Rect,
} from "./shutter-position";

/** A phone held upright: 390 × 724 of camera box. */
const PORTRAIT = 390 / 724;
/** The same phone on its side, to catch anything that assumes one shape. */
const LANDSCAPE = 724 / 390;

const onScreen = (spot: { cx: number; cy: number }, aspect: number) => {
  const ry = SHUTTER_RADIUS * aspect;
  return (
    spot.cx - SHUTTER_RADIUS >= -0.001 &&
    spot.cx + SHUTTER_RADIUS <= 1.001 &&
    spot.cy - ry >= -0.001 &&
    spot.cy + ry <= 1.001
  );
};

describe("shutterPlacement", () => {
  it("sits just under a frame near the top", () => {
    const frame: Rect = { x: 0.1, y: 0.1, w: 0.8, h: 0.3 };
    const spot = shutterPlacement(frame, PORTRAIT);
    expect(spot.side).toBe("below");
    expect(spot.clear).toBe(true);
    expect(spot.cy).toBeGreaterThan(frame.y + frame.h);
    // On the frame's centre line, which is where the hand already is.
    expect(spot.cx).toBeCloseTo(0.5, 2);
  });

  it("goes above a frame that reaches the bottom", () => {
    // Otherwise the button would hang off the edge of the phone.
    const frame: Rect = { x: 0.1, y: 0.55, w: 0.8, h: 0.44 };
    const spot = shutterPlacement(frame, PORTRAIT);
    expect(spot.side).toBe("above");
    expect(spot.cy).toBeLessThan(frame.y);
  });

  it("follows the frame sideways", () => {
    const left = shutterPlacement({ x: 0.05, y: 0.2, w: 0.3, h: 0.2 }, PORTRAIT);
    const right = shutterPlacement({ x: 0.62, y: 0.2, w: 0.3, h: 0.2 }, PORTRAIT);
    expect(left.cx).toBeLessThan(right.cx);
  });

  it("never lets the button off the screen", () => {
    const awkward: Rect[] = [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 0, y: 0, w: 0.2, h: 0.1 },
      { x: 0.8, y: 0.9, w: 0.2, h: 0.1 },
      { x: 0.9, y: 0.02, w: 0.1, h: 0.05 },
      { x: -0.2, y: -0.2, w: 0.3, h: 0.3 },
      { x: 0.45, y: 0.45, w: 0.1, h: 0.1 },
    ];
    for (const aspect of [PORTRAIT, LANDSCAPE, 1]) {
      for (const frame of awkward) {
        expect(onScreen(shutterPlacement(frame, aspect), aspect)).toBe(true);
      }
    }
  });

  it("stays off the label whenever it says it is clear", () => {
    // What is being framed is the one thing that must remain visible while
    // aiming, so `clear` has to mean it.
    for (const aspect of [PORTRAIT, LANDSCAPE, 1]) {
      for (let y = 0; y <= 0.8; y += 0.05) {
        for (let h = 0.1; h + y <= 1; h += 0.15) {
          const frame: Rect = { x: 0.08, y, w: 0.84, h };
          const spot = shutterPlacement(frame, aspect);
          if (!spot.clear) continue;
          const ry = SHUTTER_RADIUS * aspect;
          const overlaps =
            spot.cx + SHUTTER_RADIUS > frame.x &&
            spot.cx - SHUTTER_RADIUS < frame.x + frame.w &&
            spot.cy + ry > frame.y &&
            spot.cy - ry < frame.y + frame.h;
          expect(overlaps).toBe(false);
        }
      }
    }
  });

  it("reports the case with nowhere clear to stand", () => {
    const full: Rect = { x: 0, y: 0, w: 1, h: 1 };
    expect(shutterPlacement(full, PORTRAIT).clear).toBe(false);
  });

  it("fits below the frame this tool actually opens with", () => {
    // The ingredients preset covers most of an upright screen. Measuring the
    // button's height in width-fractions made it give up here and fall back to
    // the fixed shutter — which is the one frame the change had to help.
    const opening: Rect = { x: 0.08, y: 0.16, w: 0.84, h: 0.64 };
    const spot = shutterPlacement(opening, PORTRAIT);
    expect(spot.side).toBe("below");
    expect(spot.clear).toBe(true);
  });

  it("still gives up when a frame really does fill the height", () => {
    const tall: Rect = { x: 0.08, y: 0.02, w: 0.84, h: 0.96 };
    expect(shutterPlacement(tall, PORTRAIT).clear).toBe(false);
  });

  it("needs more vertical room on a wide screen than a tall one", () => {
    // Same frame, same button: on a landscape box the circle is a much bigger
    // slice of the height, so what fits upright need not fit on its side.
    const frame: Rect = { x: 0.1, y: 0.16, w: 0.8, h: 0.64 };
    expect(shutterPlacement(frame, PORTRAIT).clear).toBe(true);
    expect(shutterPlacement(frame, LANDSCAPE).clear).toBe(false);
  });

  it("falls back to a portrait guess when the box hasn't been measured", () => {
    const frame: Rect = { x: 0.1, y: 0.1, w: 0.8, h: 0.3 };
    for (const bad of [0, NaN, Infinity, -1]) {
      expect(shutterPlacement(frame, bad).clear).toBe(true);
    }
  });
});

describe("lampSpot", () => {
  const shutter = { cx: 0.5, cy: 0.7, side: "below" as const, clear: true };

  it("sits on the shutter's line, to its left", () => {
    const lamp = lampSpot(shutter);
    expect(lamp.cy).toBe(shutter.cy);
    expect(lamp.cx).toBeLessThan(shutter.cx);
  });

  it("doesn't touch the shutter", () => {
    const lamp = lampSpot(shutter);
    expect(lamp.cx + LAMP_RADIUS).toBeLessThan(shutter.cx - SHUTTER_RADIUS);
  });

  it("stays on screen even when the shutter is pinned to the left edge", () => {
    // A frame dragged into the left corner pushes the shutter as far left as it
    // can go; the lamp must not follow it off the phone.
    const pinned = { cx: SHUTTER_RADIUS + 0.02, cy: 0.5, side: "below" as const, clear: true };
    expect(lampSpot(pinned).cx - LAMP_RADIUS).toBeGreaterThanOrEqual(-0.001);
  });

  it("travels with the shutter", () => {
    const low = lampSpot({ ...shutter, cy: 0.2 });
    const high = lampSpot({ ...shutter, cy: 0.8 });
    expect(low.cy).toBeLessThan(high.cy);
    const left = lampSpot({ ...shutter, cx: 0.3 });
    const right = lampSpot({ ...shutter, cx: 0.7 });
    expect(left.cx).toBeLessThan(right.cx);
  });
});
