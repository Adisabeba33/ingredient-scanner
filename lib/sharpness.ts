/**
 * Picking the sharpest frame out of several, so a shaky hand stops costing
 * re-shoots.
 *
 * ── The problem, as reported from the floor ───────────────────────────────
 *
 * You line the frame up on the ingredients, the picture is sharp, and then you
 * have to move your thumb to the shutter and press. Pressing moves the phone.
 * Autofocus starts hunting, the label smears, and the shot is wasted — so you
 * do it again, and the two seconds of framing become fifteen.
 *
 * Putting the shutter nearer the finger shortens the journey but does not fix
 * this: any tap on a hand-held phone shakes it. What does fix it is not taking
 * one frame at the instant of the tap.
 *
 * ── What this does instead ────────────────────────────────────────────────
 *
 * A tap starts a short burst. The wobble from a press damps out in two or three
 * tenths of a second, so a frame taken a moment later is usually sharper than
 * the one taken on contact — and the burst is scored, not averaged, so the
 * sharpest is kept and the rest are dropped.
 *
 * ── How sharpness is measured ─────────────────────────────────────────────
 *
 * Gradient energy: the mean squared difference between neighbouring pixels,
 * in grey, on a small sample of the frame. Blur is exactly the loss of those
 * differences — a smeared edge spreads its step across many pixels instead of
 * one — so the number falls when the picture smears and rises when it snaps
 * back into focus.
 *
 * It is deliberately crude. The figure means nothing on its own and is never
 * shown to anybody; it only has to rank frames taken seconds apart, of the same
 * subject, under the same light. For that it is reliable and it costs a
 * downscaled draw per frame.
 */

/**
 * The sample the score is computed on.
 *
 * Small on purpose: sharpness is a property of edges, and the edges survive
 * downscaling well enough to rank frames. A full-resolution score would cost
 * milliseconds per frame for an answer that doesn't change.
 */
const SAMPLE_W = 160;
const SAMPLE_H = 120;

/**
 * Gradient energy of an RGBA sample. Higher is sharper. Pure — the whole point
 * of splitting it out is that it can be tested without a camera.
 *
 * Compares each pixel with its right and lower neighbour. Both directions
 * matter: a phone shaken sideways smears vertical strokes and leaves horizontal
 * ones alone, and text is full of both.
 */
export function gradientEnergy(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  if (width < 2 || height < 2) return 0;

  let total = 0;
  let count = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      // Rec. 601 luma, integer-weighted — colour is irrelevant to focus, and
      // the green channel carries most of the detail a sensor resolves.
      const here = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      const right =
        (data[i + 4] * 299 + data[i + 5] * 587 + data[i + 6] * 114) / 1000;
      const belowIndex = i + width * 4;
      const below =
        (data[belowIndex] * 299 +
          data[belowIndex + 1] * 587 +
          data[belowIndex + 2] * 114) /
        1000;

      const dx = here - right;
      const dy = here - below;
      total += dx * dx + dy * dy;
      count += 2;
    }
  }
  return count === 0 ? 0 : total / count;
}

/**
 * Is this frame worth keeping over the best so far?
 *
 * Strictly greater, so a tie leaves the earlier frame standing: when nothing
 * moved, the first one is the moment the person actually chose, and there is no
 * reason to prefer a later frame that is merely equal.
 *
 * Starting from -Infinity, the first frame of a burst always passes — even when
 * it scored zero because the browser refused to read it. A burst that cannot be
 * ranked must still produce a photograph.
 */
export function isSharper(score: number, best: number): boolean {
  return score > best;
}

/**
 * Score one video frame as it stands. Returns 0 when the frame isn't readable —
 * a score that loses to any real frame, which is the right way for this to fail.
 */
export function scoreVideoFrame(video: HTMLVideoElement): number {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return 0;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.drawImage(video, 0, 0, vw, vh, 0, 0, SAMPLE_W, SAMPLE_H);
    const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
    return gradientEnergy(data, SAMPLE_W, SAMPLE_H);
  } catch {
    // A tainted canvas or a browser that refuses getImageData. Falling back to
    // "no opinion" costs the burst its ranking, not the photograph.
    return 0;
  }
}

/**
 * How many frames a burst takes, and how far apart.
 *
 * Four frames over about a third of a second: long enough to outlast the wobble
 * from a press, short enough that nobody notices a delay or moves the pack.
 * Each frame is one downscaled draw, so the whole burst is cheap.
 */
export const BURST_FRAMES = 4;
export const BURST_GAP_MS = 90;

/**
 * Run a short burst, calling `keep` on every frame that beats every frame
 * before it.
 *
 * Nothing is buffered here. The obvious shape — take four pictures, score them,
 * throw three away — costs four full-resolution frames of memory and four JPEG
 * encodes for one photograph, on the device least able to afford either. Keeping
 * as it goes costs one scoring draw per frame plus however many keeps actually
 * improve on their predecessor, which is usually one or two.
 *
 * `keep` is expected to overwrite whatever the previous keep wrote; the last
 * call to run is the winner.
 */
export async function burstSharpest(
  video: HTMLVideoElement,
  keep: () => void,
  options: { frames?: number; gapMs?: number } = {}
): Promise<void> {
  const frames = Math.max(1, options.frames ?? BURST_FRAMES);
  const gap = Math.max(0, options.gapMs ?? BURST_GAP_MS);

  let best = -Infinity;
  for (let i = 0; i < frames; i++) {
    if (i > 0) await wait(gap);
    // Scored BEFORE the keep, so the number describes the same instant the
    // keep is about to take rather than one draw later.
    const score = scoreVideoFrame(video);
    if (!isSharper(score, best)) continue;
    best = score;
    keep();
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
