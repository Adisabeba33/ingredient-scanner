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
 */

export type FramePreset = "brand" | "ingredients";

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
};

/**
 * Crop `video`'s current frame to `rect` and return a compressed JPEG data URL.
 * Runs entirely on the device; nothing leaves the phone here.
 */
export function captureFrame(
  video: HTMLVideoElement,
  rect: NormalizedRect,
  preset: FramePreset
): string {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) throw new Error("Camera frame not ready yet.");

  const sx = Math.round(rect.x * vw);
  const sy = Math.round(rect.y * vh);
  const sw = Math.max(1, Math.round(rect.w * vw));
  const sh = Math.max(1, Math.round(rect.h * vh));

  const { maxWidth, quality } = PRESETS[preset];
  const scale = sw > maxWidth ? maxWidth / sw : 1;
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);

  return canvas.toDataURL("image/jpeg", quality);
}

/** Rough byte size of a data URL (for the "how heavy is the queue" hint). */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return 0;
  const b64 = dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}
