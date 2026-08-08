import { describe, expect, it } from "vitest";
import {
  adaptiveThreshold,
  binarizeRgba,
  toGrayscale,
  windowRadius,
} from "./binarize";

/**
 * The claim this file has to hold up: a barcode printed in a colour barely
 * separable from its background, lit unevenly, comes out readable — and a
 * single global cut-off could not have done it.
 */

const W = 128;
const H = 12;

/** Bar widths across the frame, in pixels — narrow and wide, as a real code. */
const BARS = [3, 2, 5, 2, 3, 7, 2, 4, 2, 6, 3, 2, 4, 3, 5, 2];

/** True where ink should be, by x. The pattern tiles across the whole frame, so
 *  the brightness gradient below falls across the CODE and not past the end of
 *  it — which is the situation that defeats a single cut-off. */
const BAR_AT: boolean[] = (() => {
  const at: boolean[] = [];
  let i = 0;
  while (at.length < W) {
    for (let n = 0; n < BARS[i % BARS.length] && at.length < W; n++) {
      at.push(i % 2 === 0);
    }
    i++;
  }
  return at;
})();

function isBar(x: number): boolean {
  return BAR_AT[x] ?? false;
}

/**
 * Silver on peach under a shop light: the ink is only ~18 levels darker than
 * the background, and the whole frame falls from bright at the left to dim at
 * the right. This is the picture the old reader gave up on.
 */
function faintGradientBarcode(): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const background = 200 - (x / W) * 120; // 200 → 80
      const v = isBar(x) ? background - 18 : background;
      const p = (y * W + x) * 4;
      // Warm background, cool ink — a peach pack with silver print.
      rgba[p] = v + (isBar(x) ? 0 : 14);
      rgba[p + 1] = v;
      rgba[p + 2] = v - (isBar(x) ? 0 : 10);
      rgba[p + 3] = 255;
    }
  }
  return rgba;
}

/** Read the middle row back as a bar/no-bar pattern. */
function rowPattern(binary: Uint8ClampedArray): boolean[] {
  const y = Math.floor(H / 2);
  return Array.from({ length: W }, (_, x) => binary[y * W + x] === 0);
}

function wrongPixels(pattern: boolean[]): number {
  let wrong = 0;
  for (let x = 0; x < W; x++) {
    // Skip the pixel either side of every edge: a threshold is entitled to be
    // undecided exactly where the ink starts.
    if (isBar(x) !== isBar(x - 1) || isBar(x) !== isBar(x + 1)) continue;
    if (pattern[x] !== isBar(x)) wrong++;
  }
  return wrong;
}

describe("toGrayscale", () => {
  it("uses Rec. 601 luma, not a flat average", () => {
    const rgba = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
    ]);
    const gray = toGrayscale(rgba);
    expect(Math.round(gray[0])).toBe(76); // red
    expect(Math.round(gray[1])).toBe(150); // green
    expect(Math.round(gray[2])).toBe(29); // blue
    expect(Math.round(gray[3])).toBe(255); // white
  });

  it("writes into a supplied buffer when given one", () => {
    const out = new Uint8ClampedArray(1);
    const rgba = new Uint8ClampedArray([10, 10, 10, 255]);
    expect(toGrayscale(rgba, out)).toBe(out);
    expect(out[0]).toBe(10);
  });
});

describe("adaptiveThreshold", () => {
  it("recovers a faint barcode across a brightness gradient", () => {
    const gray = toGrayscale(faintGradientBarcode());
    const binary = adaptiveThreshold(gray, W, H);
    // Allow a couple of stragglers; the pattern itself must be there.
    expect(wrongPixels(rowPattern(binary))).toBeLessThanOrEqual(2);
  });

  // The reason the threshold is local. If a single cut-off could read this
  // frame as well, the extra work wouldn't be worth doing — so measure the best
  // one there is, chosen with hindsight the real thing never gets, and check
  // that the local threshold still beats it by a wide margin.
  it("beats the best global cut-off there is", () => {
    const gray = toGrayscale(faintGradientBarcode());
    let bestGlobal = Infinity;
    for (let t = 0; t <= 255; t++) {
      const flat = new Uint8ClampedArray(W * H);
      for (let i = 0; i < gray.length; i++) flat[i] = gray[i] < t ? 0 : 255;
      bestGlobal = Math.min(bestGlobal, wrongPixels(rowPattern(flat)));
    }
    const local = wrongPixels(rowPattern(adaptiveThreshold(gray, W, H)));
    expect(bestGlobal).toBeGreaterThan(10);
    expect(local * 4).toBeLessThan(bestGlobal);
  });

  it("leaves a flat area flat instead of turning it into noise", () => {
    const gray = new Uint8ClampedArray(W * H).fill(150);
    const binary = adaptiveThreshold(gray, W, H);
    expect(Array.from(binary).every((v) => v === 255)).toBe(true);
  });

  it("handles an empty frame without throwing", () => {
    expect(adaptiveThreshold(new Uint8ClampedArray(0), 0, 0)).toHaveLength(0);
  });

  it("emits only pure black and pure white", () => {
    const gray = toGrayscale(faintGradientBarcode());
    const values = new Set(adaptiveThreshold(gray, W, H));
    expect([...values].sort()).toEqual([0, 255]);
  });
});

describe("windowRadius", () => {
  it("scales with the frame but never collapses", () => {
    expect(windowRadius(640)).toBe(80);
    expect(windowRadius(16)).toBe(3); // floor, not 1
    expect(windowRadius(0)).toBe(3);
  });
});

describe("binarizeRgba", () => {
  it("rewrites the frame in place as opaque black and white", () => {
    const rgba = faintGradientBarcode();
    binarizeRgba(rgba, W, H);
    for (let p = 0; p < rgba.length; p += 4) {
      expect(rgba[p] === 0 || rgba[p] === 255).toBe(true);
      // Grey means colour survived somewhere it shouldn't have.
      expect(rgba[p + 1]).toBe(rgba[p]);
      expect(rgba[p + 2]).toBe(rgba[p]);
      expect(rgba[p + 3]).toBe(255);
    }
  });
});
