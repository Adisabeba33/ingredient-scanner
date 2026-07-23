"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";
import {
  captureFrame,
  type FramePreset,
  type NormalizedRect,
} from "@/lib/image";

/**
 * Framed photo capture. The user lines the label up inside a rectangle and
 * taps once; we crop to exactly that rectangle and compress per preset
 * (`brand` = narrow band, hard squeeze; `ingredients` = tall region, moderate).
 * Snap quick and rough — verification happens later at "Process all" (spec §5).
 *
 * No network here: the frame is cropped + compressed on-device and handed back
 * as a JPEG data URL for the offline queue.
 */

// The framing rectangle as fractions of the on-screen camera box (0–1). The
// video is object-cover, so these are inverted to source-frame coordinates at
// capture time (see coverRectToFrame).
const OVERLAY: Record<FramePreset, NormalizedRect> = {
  // Narrow horizontal band — the big brand/name letters.
  brand: { x: 0.07, y: 0.4, w: 0.86, h: 0.18 },
  // Taller, near-square — the small, long ingredient list.
  ingredients: { x: 0.08, y: 0.16, w: 0.84, h: 0.64 },
};

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

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
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });

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

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const frameRect = coverRectToFrame(video, OVERLAY[preset]);
      const dataUrl = captureFrame(video, frameRect, preset);
      stop();
      setPhase({ kind: "review", dataUrl });
    } catch {
      // Frame wasn't ready — let them try again.
    }
  }, [preset, stop]);

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

  const overlay = OVERLAY[preset];

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
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Framing rectangle at the preset proportions. */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="absolute rounded-2xl border-[3px] border-amber shadow-[0_0_0_100vmax_rgba(20,26,20,0.55)]"
              style={{
                left: `${overlay.x * 100}%`,
                top: `${overlay.y * 100}%`,
                width: `${overlay.w * 100}%`,
                height: `${overlay.h * 100}%`,
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center px-6">
            <p className="max-w-[320px] rounded-full bg-black/40 px-4 py-2 text-center text-[13px] font-medium text-white/90">
              {hint}
            </p>
          </div>
          {/* Shutter. */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-10">
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
