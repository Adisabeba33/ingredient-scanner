"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine, X, Keyboard } from "lucide-react";
import { applyContinuousCamera } from "@/lib/camera";

/**
 * Live "point the camera at a barcode and it reads" scanner, covering every
 * browser:
 *
 *   - Where the native BarcodeDetector exists (Chromium — Android Chrome/Edge,
 *     desktop Chrome) we use it: instant, zero download.
 *   - Everywhere else (all iOS browsers — they're WebKit under the hood by
 *     Apple's rule, so even iOS Chrome lacks it — plus Firefox) we lazily load
 *     ZXing and decode with that. The library is imported only when the scanner
 *     opens, so it never touches the initial bundle.
 *
 * If the device exposes no camera API at all, the overlay hands the user back
 * to the photo scanner (the existing OCR path) instead of failing.
 *
 * It only reads the number; resolving that to an ingredient list is the
 * caller's job (`lib/barcode.ts` → `/api/barcode`).
 *
 * Reliability: we ask for a high-resolution rear stream (small/low-res frames
 * are the main reason a barcode "won't read"), give live frame feedback (the
 * frame turns green the instant a code is seen), and after a while surface a
 * "type it instead" escape hatch so the user is never stuck staring at a code
 * that won't decode.
 */

// Minimal typing for BarcodeDetector — not in lib.dom yet.
interface DetectedBarcode {
  rawValue: string;
  format: string;
}
interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
}

function getDetectorCtor(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
      .BarcodeDetector ?? null
  );
}

function hasCamera(): boolean {
  return (
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  );
}

// A high-resolution rear camera. More pixels on the barcode = far more reliable
// decoding; the barcode filling a small low-res frame is the usual culprit when
// "it just won't read".
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

// The 1-D retail formats that carry a food/cosmetic/pet product code.
const NATIVE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

// After this long with nothing decoded, offer the "type it by hand" way out.
const STRUGGLE_AFTER_MS = 12000;

/** Retail barcodes are 8 (EAN-8), 12 (UPC-A), or 13 (EAN-13) digits. */
function acceptCode(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "");
  return digits.length === 8 || digits.length === 12 || digits.length === 13
    ? digits
    : null;
}

type Phase =
  | { kind: "starting" }
  | { kind: "scanning" }
  | { kind: "locked" } // a code is in view and decoding
  | { kind: "unsupported" }
  | { kind: "error"; message: string };

export function BarcodeScanner({
  onDetected,
  onCancel,
}: {
  onDetected: (code: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const zxingStopRef = useRef<(() => void) | null>(null);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const [struggling, setStruggling] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (zxingStopRef.current) {
      try {
        zxingStopRef.current();
      } catch {
        /* already stopped */
      }
      zxingStopRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const succeed = useCallback(
    (digits: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      // Flash the frame green so the read feels confirmed, then hand back.
      setPhase({ kind: "locked" });
      stop();
      setTimeout(() => onDetected(digits), 180);
    },
    [stop, onDetected]
  );

  const fail = useCallback((err: unknown) => {
    const name = err instanceof DOMException ? err.name : "";
    setPhase({
      kind: "error",
      message:
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera access was blocked. Allow the camera, or use the photo scanner below."
          : "Couldn't start the camera. Try the photo scanner below.",
    });
  }, []);

  // Surface the manual-entry hint if nothing has decoded for a while.
  useEffect(() => {
    if (phase.kind !== "scanning") return;
    const t = setTimeout(() => setStruggling(true), STRUGGLE_AFTER_MS);
    return () => clearTimeout(t);
  }, [phase.kind]);

  useEffect(() => {
    if (!hasCamera()) {
      setPhase({ kind: "unsupported" });
      return;
    }

    let cancelled = false;
    const Ctor = getDetectorCtor();

    // ── Native BarcodeDetector path (Chromium) ──────────────────────────────
    if (Ctor) {
      const detector = new Ctor({ formats: NATIVE_FORMATS });
      const tick = async () => {
        if (cancelled || doneRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          try {
            const found = await detector.detect(video);
            for (const b of found) {
              const code = acceptCode(b.rawValue);
              if (code) return succeed(code);
            }
          } catch {
            /* transient decode error — keep scanning */
          }
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };

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
          void applyContinuousCamera(stream); // settle to sharp faster
          setPhase({ kind: "scanning" });
          rafRef.current = requestAnimationFrame(() => void tick());
        })
        .catch((err: unknown) => {
          if (!cancelled) fail(err);
        });

      return () => {
        cancelled = true;
        stop();
      };
    }

    // ── ZXing fallback path (iOS / Firefox) ─────────────────────────────────
    import("@zxing/browser")
      .then(({ BrowserMultiFormatReader }) => {
        if (cancelled || !videoRef.current) return;
        const reader = new BrowserMultiFormatReader();
        return reader.decodeFromConstraints(
          { video: VIDEO_CONSTRAINTS, audio: false },
          videoRef.current,
          (result, _err, controls) => {
            zxingStopRef.current = () => controls.stop();
            if (cancelled || doneRef.current) return;
            if (result) {
              const code = acceptCode(result.getText());
              if (code) succeed(code);
            }
          }
        );
      })
      .then((controls) => {
        if (cancelled) {
          controls?.stop();
          return;
        }
        if (controls) zxingStopRef.current = () => controls.stop();
        setPhase({ kind: "scanning" });
      })
      .catch((err: unknown) => {
        if (!cancelled) fail(err);
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, [stop, succeed, fail]);

  const close = useCallback(() => {
    stop();
    onCancel();
  }, [stop, onCancel]);

  const fallback = phase.kind === "unsupported" || phase.kind === "error";
  const locked = phase.kind === "locked";
  // Frame colour: amber while hunting, green the instant a code is read.
  const frameColor = locked ? "#4ADE80" : "#F4B740";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)_+_1.25rem)] text-white">
        <div className="inline-flex items-center gap-2 text-[13px] font-medium">
          <ScanLine size={18} strokeWidth={1.8} aria-hidden="true" />
          Scan a barcode
        </div>
        <button
          onClick={close}
          aria-label="Close barcode scanner"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {fallback ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <p className="max-w-[320px] text-[15px] leading-relaxed text-white/85">
            {phase.kind === "unsupported"
              ? "This device doesn't expose a camera to the browser. Use the photo scanner instead — it reads the ingredient list directly."
              : phase.message}
          </p>
          <button
            onClick={close}
            className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[14px] font-semibold text-ink transition hover:bg-white/90"
          >
            Use the photo scanner
          </button>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Framing overlay — the aperture glows green the moment a code reads. */}
          <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4">
            <div
              className="h-32 w-72 max-w-[80vw] rounded-2xl border-[3px] shadow-[0_0_0_100vmax_rgba(20,26,20,0.55)] transition-colors duration-200"
              style={{ borderColor: frameColor }}
            >
              {/* moving scan line while hunting */}
              {!locked && phase.kind === "scanning" && (
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <div
                    className="absolute inset-x-2 h-0.5 animate-[scanline_1.6s_ease-in-out_infinite]"
                    style={{ background: frameColor, top: 8 }}
                  />
                </div>
              )}
            </div>
            <p
              className="text-[13px] font-medium transition-colors"
              style={{ color: locked ? "#4ADE80" : "rgba(255,255,255,0.85)" }}
            >
              {phase.kind === "starting"
                ? "Starting camera…"
                : locked
                  ? "Got it — reading…"
                  : "Line the barcode up inside the frame"}
            </p>
          </div>

          {/* After a struggle, offer the reliable way in. */}
          {struggling && !locked && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-ink/95 to-transparent px-6 pb-8 pt-12 text-center">
              <p className="max-w-[320px] text-[13px] leading-relaxed text-white/80">
                Struggling to read it? Fill the frame with the barcode in good
                light — or just type the number underneath it.
              </p>
              <button
                onClick={close}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-ink transition hover:bg-white/90"
              >
                <Keyboard size={16} strokeWidth={1.8} aria-hidden="true" />
                Type the number instead
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          50% { transform: translateY(104px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
