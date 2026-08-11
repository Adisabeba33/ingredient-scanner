/**
 * Client-side crop + compress for captured photos.
 *
 * Photos are temporary (they live only in the pending queue until their text
 * is extracted), so compression is about PHONE STORAGE and UPLOAD SPEED on weak
 * wifi — not database size. Two presets (spec §5):
 *
 *   - "brand"       — a narrow horizontal band; big letters survive hard
 *                     compression, so we crop tight and squeeze.
 *   - "ingredients" — a taller, near-square region; the text is small and long,
 *                     so we compress only moderately to stay OCR-readable.
 *
 * `cropRect` describes the on-screen framing rectangle as fractions of the
 * video frame (0–1), so we can crop exactly what the user lined up regardless
 * of the device resolution.
 *
 * ── Why the whole frame is kept, not just the crop ────────────────────────
 *
 * A shot is taken standing in an aisle holding a tin, and the framing is often
 * a line or two out: the box caught the storage advice below the ingredients,
 * or clipped the last line. Cropping at capture time makes that unfixable —
 * the pixels above and below the box no longer exist, so the only remedy is to
 * photograph the whole thing again.
 *
 * So capture keeps the FULL frame and treats the rectangle as a decision that
 * can be revisited: `snapshotFrame` stores the picture, `cropImage` applies a
 * rectangle to it, and applying a different rectangle afterwards costs one more
 * draw. Nothing is discarded until the photo is accepted.
 */

export type FramePreset = "brand" | "ingredients" | "express";

export interface NormalizedRect {
  x: number; // 0–1 from left
  y: number; // 0–1 from top
  w: number; // 0–1
  h: number; // 0–1
}

interface PresetConfig {
  maxWidth: number;
  quality: number;
}

const PRESETS: Record<FramePreset, PresetConfig> = {
  // Hard compression — the name is a few big words.
  brand: { maxWidth: 1000, quality: 0.6 },
  // Moderate — the ingredient list is small and must stay legible for Claude.
  ingredients: { maxWidth: 1600, quality: 0.82 },
  // Express Mode's front-of-pack shot, and NOT the `brand` preset despite
  // photographing the same face of the same box. That one is tuned for "a few
  // big words" — a brand and a product name, set large. Express asks the model
  // for the net weight too, which is the smallest print on a pack and the first
  // thing to dissolve under compression. This copy is the one the model reads;
  // a much smaller one is derived from it for storage (EXPRESS_STORED).
  express: { maxWidth: 1600, quality: 0.82 },
};

/**
 * The copy that gets kept.
 *
 * Read at 1600 (above), stored at 900. The stored picture only has to let a
 * person at a desk recognise the pack and read its variant off the front —
 * everything the model needed the detail for has already been read by then.
 * Around 70 KB a product, so a few thousand of them is a rounding error.
 */
export const EXPRESS_STORED = { maxWidth: 900, quality: 0.62 };

/**
 * Re-encode a data URL smaller. Used to derive the stored copy from the one
 * the model just read, so the phone never encodes the same photograph twice
 * from scratch and the good copy is never uploaded.
 */
export async function shrinkDataUrl(
  dataUrl: string,
  { maxWidth, quality }: { maxWidth: number; quality: number }
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Couldn't read that photo."));
    el.src = dataUrl;
  });
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't prepare that photo.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/** The rectangle that keeps everything — an uploaded image starts here. */
export const WHOLE_IMAGE: NormalizedRect = { x: 0, y: 0, w: 1, h: 1 };

/**
 * Ceiling on the kept frame's longest side.
 *
 * This is held in memory as raw pixels while a photo is being reviewed, so it
 * needs a bound: a 4K frame is 33 MB of canvas, and phones with 4K cameras are
 * not the phones with memory to spare. At 2560 the crop still lands well above
 * what either preset asks for, so the cap costs nothing that reaches the OCR.
 */
const SNAPSHOT_MAX = 2560;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * A fractional rectangle in whole source pixels, guaranteed to lie inside the
 * source. A rectangle dragged to the very edge can round a pixel outside it,
 * and drawImage pads that with black — which reads as a badly taken photo.
 */
function pixelRect(rect: NormalizedRect, sw: number, sh: number) {
  const sx = clamp(Math.round(rect.x * sw), 0, sw - 1);
  const sy = clamp(Math.round(rect.y * sh), 0, sh - 1);
  return {
    sx,
    sy,
    sw: clamp(Math.round(rect.w * sw), 1, sw - sx),
    sh: clamp(Math.round(rect.h * sh), 1, sh - sy),
  };
}

function draw(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  src: { sx: number; sy: number; sw: number; sh: number },
  dw: number,
  dh: number
): void {
  canvas.width = Math.max(1, Math.round(dw));
  canvas.height = Math.max(1, Math.round(dh));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, src.sx, src.sy, src.sw, src.sh, 0, 0, canvas.width, canvas.height);
}

/**
 * Keep `region` of `video`'s current frame in `canvas`. No encoding and no
 * crop — this is the picture the rectangle will be applied to, possibly more
 * than once.
 *
 * `region` is there because a phone's sensor frame is not what the viewfinder
 * showed: the video is drawn object-cover, so on a portrait screen most of a
 * landscape frame is off the sides. Keeping the sensor frame would put a
 * picture on the adjust screen that nobody ever aimed, with the label a narrow
 * column in the middle of it — the wrong thing to hand someone who is checking
 * whether a line of small print got clipped.
 */
export function snapshotFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  region: NormalizedRect = WHOLE_IMAGE
): void {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) throw new Error("Camera frame not ready yet.");

  const src = pixelRect(region, vw, vh);
  const scale = Math.min(1, SNAPSHOT_MAX / Math.max(src.sw, src.sh));
  draw(canvas, video, src, src.sw * scale, src.sh * scale);
}

/**
 * Crop a kept frame to `rect` and return a compressed JPEG data URL.
 * Runs entirely on the device; nothing leaves the phone here.
 */
export function cropImage(
  source: HTMLCanvasElement,
  rect: NormalizedRect,
  preset: FramePreset
): string {
  if (!source.width || !source.height) throw new Error("There's no photo to crop.");

  const src = pixelRect(rect, source.width, source.height);
  const { maxWidth, quality } = PRESETS[preset];
  const scale = src.sw > maxWidth ? maxWidth / src.sw : 1;

  const canvas = document.createElement("canvas");
  draw(canvas, source, src, src.sw * scale, src.sh * scale);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Decode a picked file, honouring EXIF orientation so a portrait phone photo
 * isn't drawn sideways. `createImageBitmap` does this natively; the <img>
 * fallback covers browsers without it (which apply orientation themselves).
 */
async function loadImage(file: File): Promise<CanvasImageSource & {
  width: number;
  height: number;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.src = url;
    });
  } finally {
    // Revoke on the next tick so the decode has definitely finished.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/**
 * Keep a file the user picked (a screenshot, a photo of a monitor, a shot from
 * the gallery) in `canvas`, so it goes through exactly the same crop and
 * compression as a capture. An upload starts at WHOLE_IMAGE — it is assumed to
 * be framed already — but it can be trimmed afterwards like anything else.
 */
export async function decodeImageFile(
  file: File,
  canvas: HTMLCanvasElement
): Promise<void> {
  const source = await loadImage(file);
  try {
    const sw = source.width;
    const sh = source.height;
    if (!sw || !sh) throw new Error("That image looks empty.");
    const scale = Math.min(1, SNAPSHOT_MAX / Math.max(sw, sh));
    draw(canvas, source, { sx: 0, sy: 0, sw, sh }, sw * scale, sh * scale);
  } finally {
    if ("close" in source && typeof source.close === "function") source.close();
  }
}

/** Rough byte size of a data URL (for the "how heavy is the queue" hint). */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return 0;
  const b64 = dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}
