import { describe, it, expect } from "vitest";
import { gradientEnergy, isSharper } from "./sharpness";

/** An RGBA buffer from a grey-level function, so tests can draw their own. */
function grey(
  width: number,
  height: number,
  at: (x: number, y: number) => number
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = at(x, y);
      const i = (y * width + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return data;
}

const W = 32;
const H = 32;

describe("gradientEnergy", () => {
  it("is zero on a flat field", () => {
    expect(gradientEnergy(grey(W, H, () => 128), W, H)).toBe(0);
  });

  it("scores a hard edge above a smeared one", () => {
    // This is the whole job: blur spreads one step across many pixels, and the
    // squared differences collapse when it does.
    const sharp = grey(W, H, (x) => (x < W / 2 ? 0 : 255));
    const blurred = grey(W, H, (x) => {
      const t = (x - (W / 2 - 6)) / 12;
      return Math.round(255 * Math.min(1, Math.max(0, t)));
    });
    expect(gradientEnergy(sharp, W, H)).toBeGreaterThan(
      gradientEnergy(blurred, W, H)
    );
  });

  it("ranks progressive blur monotonically", () => {
    const score = (spread: number) =>
      gradientEnergy(
        grey(W, H, (x) => {
          const t = (x - (W / 2 - spread / 2)) / spread;
          return Math.round(255 * Math.min(1, Math.max(0, t)));
        }),
        W,
        H
      );
    const scores = [2, 6, 12, 24].map(score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1]);
    }
  });

  it("sees a smear in either direction", () => {
    // A phone shaken sideways smears vertical strokes and leaves horizontal
    // ones alone. Text has both, so both are measured.
    const vertical = grey(W, H, (x) => (x < W / 2 ? 0 : 255));
    const horizontal = grey(W, H, (_x, y) => (y < H / 2 ? 0 : 255));
    expect(gradientEnergy(vertical, W, H)).toBeGreaterThan(0);
    expect(gradientEnergy(horizontal, W, H)).toBeGreaterThan(0);
  });

  it("has a sane answer for something too small to measure", () => {
    expect(gradientEnergy(grey(1, 1, () => 200), 1, 1)).toBe(0);
    expect(gradientEnergy(new Uint8ClampedArray(0), 0, 0)).toBe(0);
  });
});

describe("isSharper", () => {
  it("keeps a frame that beats the best so far", () => {
    expect(isSharper(90, 10)).toBe(true);
  });

  it("drops one that doesn't", () => {
    expect(isSharper(40, 90)).toBe(false);
  });

  it("leaves the earlier frame standing on a tie", () => {
    // Nothing moved, so the first is the moment the person actually chose.
    expect(isSharper(50, 50)).toBe(false);
  });

  it("keeps the first frame even when it scored nothing", () => {
    // getImageData refused — the burst has no ranking, but a photograph still
    // has to come out of it.
    expect(isSharper(0, -Infinity)).toBe(true);
  });

  it("walks a burst down to a single winner", () => {
    // The loop in burstSharpest, in miniature: the last keep is the winner.
    const scores = [12, 40, 31, 40];
    let best = -Infinity;
    const kept: number[] = [];
    for (const s of scores) {
      if (!isSharper(s, best)) continue;
      best = s;
      kept.push(s);
    }
    expect(kept).toEqual([12, 40]); // two draws, not four
    expect(kept[kept.length - 1]).toBe(Math.max(...scores));
  });
});
