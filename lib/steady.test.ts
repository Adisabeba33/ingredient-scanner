import { describe, expect, it } from "vitest";
import {
  READINGS,
  STEADY_MAX_MS,
  STEADY_TICK_MS,
  needsContrast,
  needsInvert,
  shouldKeep,
} from "./steady";
import { binarizeRgba, invertRgba } from "./binarize";

describe("shouldKeep", () => {
  it("keeps the first frame of a hold, whatever it scores", () => {
    expect(shouldKeep(0, -Infinity)).toBe(true);
  });

  it("swaps only for a strictly sharper frame", () => {
    expect(shouldKeep(11, 10)).toBe(true);
    expect(shouldKeep(9, 10)).toBe(false);
  });

  // On a still subject the score wanders by a hair between frames. Swapping for
  // an identical one would restart the readings for nothing.
  it("does not swap for an equal score", () => {
    expect(shouldKeep(10, 10)).toBe(false);
  });
});

describe("READINGS", () => {
  it("covers both polarities, with and without contrast", () => {
    expect(READINGS).toHaveLength(4);
    expect(new Set(READINGS).size).toBe(4);
    expect(READINGS.filter(needsContrast)).toHaveLength(2);
    expect(READINGS.filter(needsInvert)).toHaveLength(2);
  });

  it("tries the frame as photographed first", () => {
    expect(READINGS[0]).toBe("raw");
    expect(needsContrast("raw")).toBe(false);
    expect(needsInvert("raw")).toBe(false);
  });

  it("has one reading that does both", () => {
    expect(
      READINGS.filter((r) => needsContrast(r) && needsInvert(r))
    ).toEqual(["contrast-inverted"]);
  });

  // A hold has to get through the readings several times over. Four at ten a
  // second inside six seconds leaves room for the kept frame to be replaced.
  it("fits several times over into one hold", () => {
    expect((STEADY_MAX_MS / STEADY_TICK_MS) / READINGS.length).toBeGreaterThan(
      10
    );
  });
});

describe("invertRgba", () => {
  it("turns a binarised frame into its negative", () => {
    const rgba = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    invertRgba(rgba);
    expect(Array.from(rgba)).toEqual([255, 255, 255, 255, 0, 0, 0, 255]);
  });

  it("leaves alpha alone, so an inverted frame is still opaque", () => {
    const rgba = new Uint8ClampedArray([10, 20, 30, 128]);
    invertRgba(rgba);
    expect(rgba[3]).toBe(128);
  });

  it("is its own undo", () => {
    const original = new Uint8ClampedArray([3, 200, 71, 255, 0, 0, 0, 255]);
    const copy = original.slice();
    invertRgba(copy);
    invertRgba(copy);
    expect(Array.from(copy)).toEqual(Array.from(original));
  });

  // The reason it exists: a light-on-dark code, binarised, comes out as bars a
  // decoder would reject; inverted, it is an ordinary barcode.
  it("recovers a light-on-dark code as a dark-on-light one", () => {
    const w = 64;
    const h = 4;
    const rgba = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const light = x % 8 < 3; // light bars on a dark ground
        const v = light ? 210 : 40;
        const p = (y * w + x) * 4;
        rgba[p] = rgba[p + 1] = rgba[p + 2] = v;
        rgba[p + 3] = 255;
      }
    }
    binarizeRgba(rgba, w, h);
    // Binarised, the BARS are the white ones — backwards for a decoder.
    const barPixel = (x: number) => rgba[(1 * w + x) * 4];
    expect(barPixel(1)).toBe(255);
    invertRgba(rgba);
    expect(barPixel(1)).toBe(0);
  });
});
