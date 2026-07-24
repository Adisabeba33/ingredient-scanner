"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Move } from "lucide-react";
import {
  captureFrame,
  type FramePreset,
  type NormalizedRect,
} from "@/lib/image";

/**
 * Framed photo capture with an ADJUSTABLE frame. The user drags the rectangle
 * to move it and drags the corners to resize it (bigger/smaller, squarer/wider)
 * so the ingredient list is framed exactly, then taps the shutter. We crop to
 * that rectangle and compress per preset (`brand` = hard, `ingredients` =
 * moderate). Snap quick — verification happens later at "Process all" (spec §5).
 *
 * No network here: the frame is cropped + compressed on-device and handed back
 * as a JPEG data URL for the offline queue.
 */

// Starting frame as fractions of the on-screen camera box (0–1). The user then
// drags/resizes from here. The video is object-cover, so the rectangle is
// inverted to source-frame coordinates at capture time (see coverRectToFrame).
const START_RECT: Record<FramePreset, NormalizedRect> = {
  brand: { x: 0.07, y: 0.4, w: 0.86, h: 0.18 },
  ingredients: { x: 0.08, y: 0.16, w: 0.84, h: 0.64 },
};

// Don't let the frame collapse to nothing.
const MIN_W = 0.14;
const MIN_H = 0.08;

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * Map an on-screen (container-fraction) rectangle to source-frame fractions,
 * inverting the object-cover scaling so we crop exactly what the user framed.
 */
function coverRectToFrame(
  video: HTMLVideoElement,
  overlay: NormalizedRect
): NormalizedRect {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cw = video.clientWidth || vw;
  const ch = video.clientHeight || vh;
  if (!vw || !vh || !cw || !ch) return overlay;

  const scale = Math.max(cw / vw, ch / vh);
  const visibleSrcW = cw / scale;
  const visibleSrcH = ch / scale;
  const offsetX = (vw - visibleSrcW) / 2;
  const offsetY = (vh - visibleSrcH) / 2;

  return {
    x: (offsetX + overlay.x * visibleSrcW) / vw,
    y: (offsetY + overlay.y * visibleSrcH) / vh,
    w: (overlay.w * visibleSrcW) / vw,
    h: (overlay.h * visibleSrcH) / vh,
  };
}

type Phase =
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "review"; dataUrl: string }
  | { kind: "error"; message: string };

// Which edges a corner handle controls.
const CORNERS: { id: string; left: boolean; top: boolean }[] = [
  { id: "tl", left: true, top: true },
  { id: "tr", left: false, top: true },
  { id: "bl", left: true, top: false },
  { id: "br", left: false, top: false },
];

interface DragState {
  mode: "move" | "resize";
  corner?: { left: boolean; top: boolean };
  startFx: number;
  startFy: number;
  startRect: NormalizedRect;
}

export function PhotoCapture({
  preset,
  title,
  hint,
  onCapture,
  onCancel,
}: {
  preset: FramePreset;
  title: string;
  hint: string;
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const [rect, setRect] = useState<NormalizedRect>(START_RECT[preset]);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setPhase({
        kind: "error",
        message: "This device doesn't expose a camera to the browser.",
      });
      return;
    }
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false })
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        void video.play().catch(() => {});
        setPhase({ kind: "ready" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        setPhase({
          kind: "error",
          message:
            name === "NotAllowedError" || name === "SecurityError"
              ? "Camera access was blocked. Allow the camera and try again."
              : "Couldn't start the camera.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = start();
    return () => {
      cleanup?.();
      stop();
    };
  }, [start, stop]);

  // ── Drag / resize the frame (pointer events cover touch + mouse) ────────────
  const pointerFraction = useCallback((clientX: number, clientY: number) => {
    const area = areaRef.current;
    if (!area) return { fx: 0, fy: 0 };
    const b = area.getBoundingClientRect();
    return {
      fx: b.width ? (clientX - b.left) / b.width : 0,
      fy: b.height ? (clientY - b.top) / b.height : 0,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      const dfx = fx - d.startFx;
      const dfy = fy - d.startFy;
      const s = d.startRect;

      if (d.mode === "move") {
        setRect({
          ...s,
          x: clamp(s.x + dfx, 0, 1 - s.w),
          y: clamp(s.y + dfy, 0, 1 - s.h),
        });
        return;
      }
      // resize from a corner
      const c = d.corner!;
      let { x, y, w, h } = s;
      if (c.left) {
        x = clamp(s.x + dfx, 0, s.x + s.w - MIN_W);
        w = s.w - (x - s.x);
      } else {
        w = clamp(s.w + dfx, MIN_W, 1 - s.x);
      }
      if (c.top) {
        y = clamp(s.y + dfy, 0, s.y + s.h - MIN_H);
        h = s.h - (y - s.y);
      } else {
        h = clamp(s.h + dfy, MIN_H, 1 - s.y);
      }
      setRect({ x, y, w, h });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [pointerFraction]);

  const beginMove = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      dragRef.current = {
        mode: "move",
        startFx: fx,
        startFy: fy,
        startRect: rect,
      };
    },
    [pointerFraction, rect]
  );

  const beginResize = useCallback(
    (e: React.PointerEvent, corner: { left: boolean; top: boolean }) => {
      e.stopPropagation();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      dragRef.current = {
        mode: "resize",
        corner,
        startFx: fx,
        startFy: fy,
        startRect: rect,
      };
    },
    [pointerFraction, rect]
  );

  // ── Capture / review ────────────────────────────────────────────────────────
  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const frameRect = coverRectToFrame(video, rect);
      const dataUrl = captureFrame(video, frameRect, preset);
      stop();
      setPhase({ kind: "review", dataUrl });
    } catch {
      // Frame wasn't ready — let them try again.
    }
  }, [preset, rect, stop]);

  const retake = useCallback(() => {
    setPhase({ kind: "starting" });
    start();
  }, [start]);

  const accept = useCallback(() => {
    if (phase.kind !== "review") return;
    onCapture(phase.dataUrl);
  }, [phase, onCapture]);

  const close = useCallback(() => {
    stop();
    onCancel();
  }, [stop, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 pt-5 text-white">
        <div className="inline-flex items-center gap-2 text-[13px] font-medium">
          <Camera size={18} strokeWidth={1.8} aria-hidden="true" />
          {title}
        </div>
        <button
          onClick={close}
          aria-label="Close camera"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {phase.kind === "error" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <p className="max-w-[320px] text-[15px] leading-relaxed text-white/85">
            {phase.message}
          </p>
          <button
            onClick={close}
            className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[14px] font-semibold text-ink transition hover:bg-white/90"
          >
            Go back
          </button>
        </div>
      ) : phase.kind === "review" ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={phase.dataUrl}
            alt="Captured photo preview"
            className="max-h-[60vh] w-auto max-w-full rounded-2xl border border-white/20 object-contain"
          />
          <div className="flex w-full max-w-[420px] items-center gap-3">
            <button
              onClick={retake}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-input border border-white/25 bg-white/10 text-[15px] font-medium text-white transition active:scale-[0.98]"
            >
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
              Retake
            </button>
            <button
              onClick={accept}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-input bg-sage-500 text-[15px] font-semibold text-white shadow-button transition active:scale-[0.98]"
            >
              Use photo
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={areaRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden"
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark mask outside the frame (four bands, so the frame stays clear). */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="absolute inset-x-0 top-0 bg-ink/55"
              style={{ height: `${rect.y * 100}%` }}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-ink/55"
              style={{ height: `${(1 - rect.y - rect.h) * 100}%` }}
            />
            <div
              className="absolute left-0 bg-ink/55"
              style={{
                top: `${rect.y * 100}%`,
                height: `${rect.h * 100}%`,
                width: `${rect.x * 100}%`,
              }}
            />
            <div
              className="absolute right-0 bg-ink/55"
              style={{
                top: `${rect.y * 100}%`,
                height: `${rect.h * 100}%`,
                width: `${(1 - rect.x - rect.w) * 100}%`,
              }}
            />
          </div>

          {/* The adjustable frame — drag the body to move, corners to resize. */}
          <div
            onPointerDown={beginMove}
            className="absolute z-20 touch-none rounded-2xl border-[3px] border-amber"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.w * 100}%`,
              height: `${rect.h * 100}%`,
            }}
          >
            {/* move affordance */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Move
                size={22}
                strokeWidth={1.6}
                className="text-white/70"
                aria-hidden="true"
              />
            </div>
            {/* corner handles */}
            {CORNERS.map((c) => (
              <button
                key={c.id}
                aria-label={`Resize ${c.id}`}
                onPointerDown={(e) =>
                  beginResize(e, { left: c.left, top: c.top })
                }
                className="absolute h-10 w-10 touch-none"
                style={{
                  left: c.left ? -20 : undefined,
                  right: c.left ? undefined : -20,
                  top: c.top ? -20 : undefined,
                  bottom: c.top ? undefined : -20,
                }}
              >
                <span
                  className={`absolute h-6 w-6 rounded-full border-[3px] border-amber bg-ink/60 ${
                    c.left ? "left-2" : "right-2"
                  } ${c.top ? "top-2" : "bottom-2"}`}
                />
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-6">
            <p className="max-w-[340px] rounded-full bg-black/40 px-4 py-2 text-center text-[13px] font-medium text-white/90">
              {hint} · Drag the box, pull the corners to fit.
            </p>
          </div>

          {/* Shutter */}
          <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pb-10">
            <button
              onClick={snap}
              disabled={phase.kind !== "ready"}
              aria-label="Take photo"
              className="inline-flex h-[74px] w-[74px] items-center justify-center rounded-full border-[5px] border-white/80 bg-white/20 transition active:scale-95 disabled:opacity-40"
            >
              <span className="h-14 w-14 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
