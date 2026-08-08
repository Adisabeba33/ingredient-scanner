"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine, X, Keyboard, Contrast, Crosshair } from "lucide-react";
import { applyContinuousCamera } from "@/lib/camera";
import { apertureCrop } from "@/lib/aperture-crop";
import { binarizeRgba, invertRgba } from "@/lib/binarize";
import { gradientEnergy } from "@/lib/sharpness";
import {
  READINGS,
  STEADY_MAX_MS,
  STEADY_TICK_MS,
  needsContrast,
  needsInvert,
  shouldKeep,
} from "@/lib/steady";

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

/** How often a frame is put through the lens. Ten looks a second is more than a
 *  hand holding a pack against a rectangle can use, and it keeps the phone from
 *  spending a whole core on image processing. */
const LENS_INTERVAL_MS = 90;

function sizeCanvas(canvas: HTMLCanvasElement, w: number, h: number): void {
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

/** Copy one canvas onto another, matching its size first. */
function paintInto(target: HTMLCanvasElement, source: HTMLCanvasElement): void {
  const ctx = target.getContext("2d");
  if (!ctx) return;
  sizeCanvas(target, source.width, source.height);
  ctx.drawImage(source, 0, 0);
}

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
  // The hard-contrast lens. `hard` drives the button, `hardRef` is what the
  // decode loop reads — the loop is started once and must not be torn down and
  // rebuilt (losing the camera) every time the lens is switched.
  const [hard, setHard] = useState(false);
  const hardRef = useRef(false);
  const toggleHard = useCallback(() => {
    setHard((v) => {
      hardRef.current = !v;
      return !v;
    });
  }, []);
  /** Off-screen frame the lens is applied to, and what the decoder is then given. */
  const workRef = useRef<HTMLCanvasElement | null>(null);
  // Holding still. `held` keeps the sharpest untouched crop of the hold; each
  // reading is rendered from it into `work`, so the kept frame survives being
  // read four different ways.
  const [steady, setSteady] = useState(false);
  const steadyRef = useRef(false);
  const heldRef = useRef<HTMLCanvasElement | null>(null);
  /** On-screen copy, so you see exactly the picture the decoder is working from. */
  const viewRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lensTimerRef = useRef<number | null>(null);
  const zxingStopRef = useRef<(() => void) | null>(null);
  /** The ZXing reader, kept so the lens can hand it a canvas (iOS / Firefox). */
  const readerRef = useRef<{
    decodeFromCanvas: (c: HTMLCanvasElement) => { getText(): string };
  } | null>(null);
  /** The native detector, same reason — whichever exists, a canvas can be read. */
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const [struggling, setStruggling] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (lensTimerRef.current != null) {
      clearTimeout(lensTimerRef.current);
      lensTimerRef.current = null;
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
      // A short buzz, for the hand that is holding the pack rather than looking
      // at the screen. Android only — iOS Safari has no Vibration API at all,
      // so this is a bonus where it exists and silence where it doesn't.
      try {
        navigator.vibrate?.(25);
      } catch {
        /* not supported, or blocked without a gesture */
      }
      // Flash the frame green so the read feels confirmed, then hand back.
      setPhase({ kind: "locked" });
      stop();
      setTimeout(() => onDetected(digits), 180);
    },
    [stop, onDetected]
  );

  /**
   * Apply the lens to the current frame and return the canvas holding it, or
   * null when there's nothing to work with yet.
   *
   * Only the aiming rectangle is processed, at full sensor resolution. That is
   * both the cheap option (a fraction of the pixels, so it can run on a live
   * camera) and the good one — downscaling the whole frame would throw away the
   * very resolution that decides whether a marginal barcode reads.
   *
   * The same pixels are then painted on screen. It has to be the same ones: if
   * you are shown a cleaned-up picture the decoder never saw, a code that still
   * won't read looks like a bug in the reader rather than a hint to move.
   */
  const lens = useCallback((video: HTMLVideoElement): HTMLCanvasElement | null => {
    const frame = { width: video.videoWidth, height: video.videoHeight };
    if (!frame.width || !frame.height) return null;
    const box = video.getBoundingClientRect();
    const view = viewRef.current;
    if (!view) return null;
    const aperture = view.getBoundingClientRect();
    const crop = apertureCrop(frame, box, aperture);
    if (crop.sw < 2 || crop.sh < 2) return null;

    const work = (workRef.current ??= document.createElement("canvas"));
    const w = Math.round(crop.sw);
    const h = Math.round(crop.sh);
    if (work.width !== w || work.height !== h) {
      work.width = w;
      work.height = h;
    }
    const ctx = work.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
    const image = ctx.getImageData(0, 0, w, h);
    binarizeRgba(image.data, w, h);
    ctx.putImageData(image, 0, 0);

    // Show it. The on-screen canvas is CSS-sized to the aperture, so its own
    // pixel buffer only has to be big enough to look sharp. Not while a hold is
    // running, though: that has frozen a chosen frame there, and a live repaint
    // over the top would undo the one thing the hold is for.
    if (!steadyRef.current) paintInto(view, work);
    return work;
  }, []);

  /**
   * Read one canvas with whatever decoder this browser has. Chromium's native
   * detector where it exists, ZXing where it doesn't — the callers below don't
   * care which, they only need a canvas read.
   */
  const decodeCanvas = useCallback(
    async (canvas: HTMLCanvasElement): Promise<string | null> => {
      const detector = detectorRef.current;
      if (detector) {
        try {
          for (const b of await detector.detect(canvas)) {
            const code = acceptCode(b.rawValue);
            if (code) return code;
          }
        } catch {
          /* transient — try the other reader if there is one */
        }
      }
      const reader = readerRef.current;
      if (reader) {
        try {
          return acceptCode(reader.decodeFromCanvas(canvas).getText());
        } catch {
          /* nothing in this frame */
        }
      }
      return null;
    },
    []
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
      detectorRef.current = detector;
      const tick = async () => {
        if (cancelled || doneRef.current) return;
        const video = videoRef.current;
        // With the lens on, the decoder is handed the processed crop instead of
        // the raw video — the whole point, since a filter the decoder can't see
        // would only change the picture on screen.
        const source =
          video && hardRef.current ? lens(video) : (video ?? null);
        if (video && video.readyState >= 2 && source) {
          try {
            const found = await detector.detect(source);
            for (const b of found) {
              const code = acceptCode(b.rawValue);
              if (code) return succeed(code);
            }
          } catch {
            /* transient decode error — keep scanning */
          }
        }
        // Raw video decoding is cheap enough for every frame. Processing one is
        // not, and doesn't need to be: ten looks a second is far more than a
        // hand holding a pack against a rectangle can use.
        if (hardRef.current) {
          rafRef.current = null;
          lensTimerRef.current = window.setTimeout(() => void tick(), LENS_INTERVAL_MS);
        } else {
          rafRef.current = requestAnimationFrame(() => void tick());
        }
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
        readerRef.current = reader;
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
    // `lens` is a useCallback with no dependencies, so listing it here can't
    // restart the camera; it is named only so the closure can never go stale.
  }, [stop, succeed, fail, lens]);

  /**
   * The lens on the ZXing path (iOS, Firefox — no BarcodeDetector there).
   *
   * ZXing is bound to the <video> element and decodes the raw picture; it has
   * no way to be told "read this canvas instead" mid-stream. So rather than
   * tear that down and risk losing the camera on the platform with the fussiest
   * camera rules, this runs alongside it and offers the processed crop as a
   * second opinion. Both call succeed(), which only fires once. The cost is one
   * extra decode attempt every tenth of a second, and only while the lens is on.
   */
  useEffect(() => {
    if (!hard) return;
    let stopped = false;
    let timer: number | null = null;
    const look = () => {
      if (stopped || doneRef.current) return;
      const video = videoRef.current;
      const reader = readerRef.current;
      if (reader && video && video.readyState >= 2) {
        const canvas = lens(video);
        if (canvas) {
          try {
            const code = acceptCode(reader.decodeFromCanvas(canvas).getText());
            if (code) return succeed(code);
          } catch {
            /* nothing in this frame — normal, keep looking */
          }
        }
      }
      timer = window.setTimeout(look, LENS_INTERVAL_MS);
    };
    look();
    return () => {
      stopped = true;
      if (timer != null) clearTimeout(timer);
    };
  }, [hard, lens, succeed]);

  /**
   * Hold still. See lib/steady.ts for why this keeps the sharpest frame and
   * reads it four ways, rather than freezing the picture as asked — freezing
   * the picture alone would change nothing the decoder can see.
   */
  useEffect(() => {
    if (!steady) return;
    let stopped = false;
    let timer: number | null = null;
    let best = -Infinity;
    let reading = 0;
    const startedAt = performance.now();
    const held = (heldRef.current ??= document.createElement("canvas"));
    const work = (workRef.current ??= document.createElement("canvas"));

    const tick = async () => {
      if (stopped || doneRef.current) return;
      const video = videoRef.current;
      const view = viewRef.current;
      if (video && view && video.readyState >= 2 && video.videoWidth) {
        const crop = apertureCrop(
          { width: video.videoWidth, height: video.videoHeight },
          video.getBoundingClientRect(),
          view.getBoundingClientRect()
        );
        const w = Math.round(crop.sw);
        const h = Math.round(crop.sh);
        if (w > 1 && h > 1) {
          sizeCanvas(work, w, h);
          const ctx = work.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
            // Scored on the APERTURE. A phone pointed at a shelf has most of
            // the shelf in frame, and a crisp shelf behind a smeared barcode
            // would win every comparison.
            const frame = ctx.getImageData(0, 0, w, h);
            const score = gradientEnergy(frame.data, w, h);
            if (shouldKeep(score, best)) {
              best = score;
              paintInto(held, work);
              paintInto(view, held); // the picture freezes here
              reading = 0; // a better frame deserves the readings from the top
            }

            if (best > -Infinity) {
              const how = READINGS[reading % READINGS.length];
              reading++;
              paintInto(work, held);
              if (needsContrast(how) || needsInvert(how)) {
                const wctx = work.getContext("2d", { willReadFrequently: true });
                if (wctx) {
                  const image = wctx.getImageData(0, 0, held.width, held.height);
                  if (needsContrast(how)) {
                    binarizeRgba(image.data, held.width, held.height);
                  }
                  if (needsInvert(how)) invertRgba(image.data);
                  wctx.putImageData(image, 0, 0);
                }
              }
              const code = await decodeCanvas(work);
              if (code) return succeed(code);
            }
          }
        }
      }
      if (performance.now() - startedAt > STEADY_MAX_MS) {
        setSteady(false);
        steadyRef.current = false;
        return;
      }
      timer = window.setTimeout(() => void tick(), STEADY_TICK_MS);
    };
    void tick();
    return () => {
      stopped = true;
      if (timer != null) clearTimeout(timer);
    };
  }, [steady, decodeCanvas, succeed]);

  const holdSteady = useCallback(() => {
    steadyRef.current = true;
    setSteady(true);
  }, []);

  const releaseSteady = useCallback(() => {
    steadyRef.current = false;
    setSteady(false);
  }, []);

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
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {/* The lens. Always mounted — the decode loop measures this
                    element to work out which sensor pixels sit behind the
                    rectangle — but only painted, and only visible, when on. */}
                <canvas
                  ref={viewRef}
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
                  style={{ opacity: hard ? 1 : 0 }}
                />
                {/* moving scan line while hunting */}
                {!locked && phase.kind === "scanning" && (
                  <div
                    className="absolute inset-x-2 h-0.5 animate-[scanline_1.6s_ease-in-out_infinite]"
                    style={{ background: frameColor, top: 8 }}
                  />
                )}
              </div>
            </div>
            <p
              className="text-[13px] font-medium transition-colors"
              style={{ color: locked ? "#4ADE80" : "rgba(255,255,255,0.85)" }}
            >
              {phase.kind === "starting"
                ? "Starting camera…"
                : locked
                  ? "Got it — reading…"
                  : hard
                    ? "Hard contrast on — this is what the reader sees"
                    : "Line the barcode up inside the frame"}
            </p>

            {/* The way in for a code the camera can see but not read: silver on
                a pale pack, glossy, a shop light across one end of it. This
                doesn't brighten the picture — it decides, for every pixel,
                whether it is darker than its own surroundings, which is the one
                question a barcode's bars always answer the same way. */}
            {phase.kind === "scanning" && !locked && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={toggleHard}
                  aria-pressed={hard}
                  className={`pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition ${
                    hard
                      ? "bg-white text-ink"
                      : "border border-white/30 text-white/85 hover:bg-white/10"
                  }`}
                >
                  <Contrast size={15} strokeWidth={1.8} aria-hidden="true" />
                  {hard ? "Hard contrast on" : "Won't read? Hard contrast"}
                </button>

                {/* Press and hold. Not a shutter: it keeps the sharpest frame
                    of the hold, freezes THAT on screen so the hand can stop
                    trying, and spends the seconds reading it four ways. */}
                <button
                  onPointerDown={holdSteady}
                  onPointerUp={releaseSteady}
                  onPointerLeave={releaseSteady}
                  onPointerCancel={releaseSteady}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-pressed={steady}
                  className={`pointer-events-auto inline-flex h-9 touch-none select-none items-center gap-2 rounded-full px-4 text-[13px] font-medium transition ${
                    steady
                      ? "bg-white text-ink"
                      : "border border-white/30 text-white/85 hover:bg-white/10"
                  }`}
                >
                  <Crosshair size={15} strokeWidth={1.8} aria-hidden="true" />
                  {steady ? "Holding — keep it in frame" : "Hold to steady"}
                </button>
              </div>
            )}
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
