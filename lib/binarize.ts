/**
 * Turn a camera frame into black and white — properly, so a decoder can read it.
 *
 * The case this exists for: a barcode printed silver on light peach, glossy.
 * The bars and the background sit at nearly the same brightness, one end of the
 * code catches the shop light and the other doesn't, and every reader gives up.
 *
 * Two things are worth saying about the approach.
 *
 * A CSS filter would not have helped. `filter: grayscale(1) contrast(3)` on the
 * <video> changes what the screen paints and nothing else — BarcodeDetector and
 * ZXing read the element's own pixels, which are untouched. The frame has to be
 * drawn to a canvas and altered there, and THAT canvas handed to the decoder.
 *
 * And a global threshold would not have helped either. Pick one cut-off for the
 * whole frame and the lit end goes solid white while the shaded end goes solid
 * black; the bars survive in neither. So the threshold is LOCAL: each pixel is
 * compared against the neighbourhood around it, from integral images so the
 * window size costs nothing and it can run on every frame of a phone camera.
 * Uneven light stops mattering, because "darker than its surroundings" is as
 * true in glare as it is in shade.
 */

/**
 * Rec. 601 luma, the standard weighting for perceived brightness. Silver ink on
 * a warm background is exactly the case where naive (r+g+b)/3 loses the most:
 * it gives the peach's red channel a third of the vote, when the eye — and the
 * bar's edge — barely see it.
 */
export function toGrayscale(
  rgba: Uint8ClampedArray,
  out?: Uint8ClampedArray
): Uint8ClampedArray {
  const n = rgba.length / 4;
  const gray = out ?? new Uint8ClampedArray(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    gray[i] = (rgba[p] * 299 + rgba[p + 1] * 587 + rgba[p + 2] * 114) / 1000;
  }
  return gray;
}

/**
 * Window radius for a frame of this width.
 *
 * The window has to be comfortably wider than the widest bar and narrower than
 * the whole code. Too small is the failure that bites: a window that fits
 * inside a thick bar averages mostly bar, so the bar's own middle looks light
 * against itself and the code comes back hollow. Too large and it degenerates
 * into the global threshold this exists to avoid.
 *
 * A retail barcode is 95 modules wide and its widest bar is 4 of them, so a
 * window of a quarter of the frame — radius width/8 — spans about 24 modules:
 * six times the widest bar, and still a quarter of the code.
 */
export function windowRadius(width: number): number {
  return Math.max(3, Math.round(width / 8));
}

/**
 * Local threshold. Returns 0 (dark) or 255 (light) per pixel.
 *
 * The rule is two lines long, and both matter:
 *
 *   if the neighbourhood is flat, there is no ink in it — call it light;
 *   otherwise ink is whatever is darker than its own neighbourhood.
 *
 * The second line means the cut-off sits at the local mean exactly, with no
 * offset. That is deliberate and was arrived at the hard way: the usual trick
 * of demanding a pixel be some PERCENTAGE below the mean fails precisely on the
 * labels this is for. Silver on peach separates by about 18 levels, and half of
 * that gap is all a bar has to spare from the mean; asking for 6% of a mean of
 * 195 wants twelve, and the bright end of the code dissolves. Percentages scale
 * with brightness; faint ink does not.
 *
 * Flat regions are then handled by the first line rather than by biasing the
 * threshold — `minContrast` is the local standard deviation below which a
 * neighbourhood is declared empty. Without it, the quiet zone beside a code
 * would binarise its own sensor noise into speckle, which reads as bars.
 * Both stats come from the same two integral images, so it stays one pass.
 */
export function adaptiveThreshold(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  options: { radius?: number; minContrast?: number } = {}
): Uint8ClampedArray {
  const radius = options.radius ?? windowRadius(width);
  const minContrast = options.minContrast ?? 6;
  const out = new Uint8ClampedArray(width * height);
  if (width === 0 || height === 0) return out;

  // Integral images of the values and of their squares: sum[y][x] totals every
  // pixel above and left of (x, y), so any rectangle's mean and variance are
  // four lookups regardless of the window size. One extra row and column of
  // zeros so the lookup needs no edge cases; Float64 because a large frame of
  // squared 255s overflows 32 bits comfortably.
  const stride = width + 1;
  const sum = new Float64Array(stride * (height + 1));
  const sumSq = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    let rowSumSq = 0;
    for (let x = 0; x < width; x++) {
      const v = gray[y * width + x];
      rowSum += v;
      rowSumSq += v * v;
      sum[(y + 1) * stride + (x + 1)] = sum[y * stride + (x + 1)] + rowSum;
      sumSq[(y + 1) * stride + (x + 1)] = sumSq[y * stride + (x + 1)] + rowSumSq;
    }
  }

  const minVariance = minContrast * minContrast;
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const a = (y1 + 1) * stride + (x1 + 1);
      const b = y0 * stride + (x1 + 1);
      const c = (y1 + 1) * stride + x0;
      const d = y0 * stride + x0;
      const total = sum[a] - sum[b] - sum[c] + sum[d];
      const totalSq = sumSq[a] - sumSq[b] - sumSq[c] + sumSq[d];
      const mean = total / area;
      const variance = totalSq / area - mean * mean;
      out[y * width + x] =
        variance >= minVariance && gray[y * width + x] < mean ? 0 : 255;
    }
  }
  return out;
}

/** Paint a binary mask back over an RGBA buffer, in place. */
export function writeBinary(
  binary: Uint8ClampedArray,
  rgba: Uint8ClampedArray
): void {
  for (let i = 0, p = 0; i < binary.length; i++, p += 4) {
    const v = binary[i];
    rgba[p] = v;
    rgba[p + 1] = v;
    rgba[p + 2] = v;
    rgba[p + 3] = 255;
  }
}

/**
 * The whole operation on one RGBA buffer, in place: colour frame in, black and
 * white out. What the decoder gets and what the screen shows are then the same
 * pixels, which is the point — if the bars still merge, you can see that they do
 * and move the phone, instead of wondering why nothing reads.
 */
export function binarizeRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { radius?: number; minContrast?: number }
): void {
  const gray = toGrayscale(rgba);
  const binary = adaptiveThreshold(gray, width, height, options);
  writeBinary(binary, rgba);
}
