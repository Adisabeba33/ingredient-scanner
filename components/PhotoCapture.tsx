"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Crop,
  ImageUp,
  Check,
  Flashlight,
  Sun,
} from "lucide-react";
import {
  WHOLE_IMAGE,
  cropImage,
  decodeImageFile,
  snapshotFrame,
  type FramePreset,
  type NormalizedRect,
} from "@/lib/image";
import {
  applyContinuousCamera,
  readCameraLight,
  setExposure,
  setTorch,
  type CameraLight,
} from "@/lib/camera";
import { burstSharpest } from "@/lib/sharpness";
import { CropFrame } from "@/components/CropFrame";
import {
  LAMP_RADIUS,
  SHUTTER_RADIUS,
  lampSpot,
  shutterPlacement,
} from "@/lib/shutter-position";

/**
 * Framed photo capture with an ADJUSTABLE frame. The user drags the rectangle
 * to move it and drags the corners to resize it (bigger/smaller, squarer/wider)
 * so the ingredient list is framed exactly, then taps the shutter. We crop to
 * that rectangle and compress per preset (`brand` = hard, `ingredients` =
 * moderate). Snap quick — verification happens later at "Process all" (spec §5).
 *
 * The shot keeps the WHOLE frame, not the crop, so the rectangle can be moved
 * again on the review screen: framing in an aisle is a line or two out often
 * enough that "re-shoot it" was the wrong answer. See lib/image.ts.
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

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

/** How tall the photo may stand on the adjust screen, leaving room for the buttons. */
const ADJUST_MAX_VH = 58;

/**
 * Which part of the camera's frame the viewfinder is actually showing.
 *
 * The video is drawn object-cover: it fills the box and the overflow is cut
 * off, so on a portrait screen most of a landscape sensor frame is off the
 * sides. Keeping this region rather than the whole frame does two things — the
 * adjust screen shows the picture that was actually aimed, and the on-screen
 * rectangle needs no conversion at all, because the kept frame and the
 * viewfinder are then the same box.
 */
function visibleRegion(video: HTMLVideoElement): NormalizedRect {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cw = video.clientWidth || vw;
  const ch = video.clientHeight || vh;
  if (!vw || !vh || !cw || !ch) return WHOLE_IMAGE;

  const scale = Math.max(cw / vw, ch / vh);
  const w = cw / scale / vw;
  const h = ch / scale / vh;
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/** What "Retake" should do: reopen the camera, or the file picker. */
type Origin = "camera" | "upload";

type Phase =
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "review"; dataUrl: string; from: Origin }
  // The kept frame, shown whole, with the crop rectangle back on top of it.
  | { kind: "adjust"; fullUrl: string; w: number; h: number; from: Origin }
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });

  /**
   * The camera box's width ÷ height. The shutter is a circle sized from the
   * width, so where it fits vertically depends on the shape of the box —
   * measured rather than assumed, because a phone can be turned on its side.
   */
  const [aspect, setAspect] = useState(0);
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) setAspect(w / h);
    });
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  // The frame being aimed, in on-screen fractions of the camera box.
  const [rect, setRect] = useState<NormalizedRect>(START_RECT[preset]);

  /**
   * The whole photograph, held as pixels between the shutter and "Use photo".
   * Everything shown on the review and adjust screens is cut from this, which is
   * what makes the crop a decision rather than a commitment.
   */
  const frameRef = useRef<HTMLCanvasElement | null>(null);
  const keptFrame = useCallback(() => {
    if (!frameRef.current) frameRef.current = document.createElement("canvas");
    return frameRef.current;
  }, []);

  // The crop that produced what's on the review screen, in SOURCE fractions of
  // the kept frame — and the one being dragged on the adjust screen.
  const [cropRect, setCropRect] = useState<NormalizedRect>(WHOLE_IMAGE);
  const [adjustRect, setAdjustRect] = useState<NormalizedRect>(WHOLE_IMAGE);

  // ── The lamp ────────────────────────────────────────────────────────────────
  /**
   * A shelf in a shop is darker than it looks and an ingredient list is 6pt
   * print, so the phone's lamp is often the difference between a readable shot
   * and a third attempt.
   *
   * The web gives NO control over how bright the lamp burns — `torch` is a
   * boolean and there is no dimmer in the spec. What a torch does need dimming
   * for is the blown-out white patch it puts on a glossy pack, and that is the
   * camera's exposure, which some devices do expose as a real range. So: a
   * switch for the lamp, and a slider for how bright the picture comes out.
   */
  const [light, setLight] = useState<CameraLight>({
    torch: false,
    known: false,
    exposure: null,
  });
  const [torchOn, setTorchOn] = useState(false);
  const [exposure, setExposureAt] = useState<number | null>(null);
  // Set once the device has actually refused, so a button that cannot work
  // stops pretending it might.
  const [noLamp, setNoLamp] = useState(false);

  // The camera restarts on every retake, and `start` must not be rebuilt each
  // time the lamp is switched, so the switch's position is read from here.
  const torchRef = useRef(false);

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
        void applyContinuousCamera(stream); // settle to sharp faster

        const found = readCameraLight(stream);
        setLight(found);
        setExposureAt(found.exposure ? found.exposure.value : null);
        // The lamp stays on across a retake: it is switched on for an aisle,
        // not for a shot, and stopping the stream puts it out every time.
        if (torchRef.current) void setTorch(stream, true);

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
      observerRef.current?.disconnect();
      // Hand the backing store back on the way out — several megabytes that
      // nothing will ask for again.
      const frame = frameRef.current;
      if (frame) {
        frame.width = 0;
        frame.height = 0;
      }
    };
  }, [start, stop]);

  // ── Capture / review ────────────────────────────────────────────────────────
  const [bursting, setBursting] = useState(false);

  // Where the travelling shutter goes — null when the frame leaves nowhere
  // clear for it, in which case the fixed bottom button is used instead.
  const floating = useMemo(() => {
    const spot = shutterPlacement(rect, aspect);
    return spot.clear ? spot : null;
  }, [rect, aspect]);

  const lamp = useMemo(() => (floating ? lampSpot(floating) : null), [floating]);

  /**
   * Offer the switch when the device says it has a lamp — and also when it says
   * nothing at all, because several browsers (WebKit above all) report no
   * capabilities whatsoever while still having a lamp behind them. Trying and
   * being refused is a real answer; hiding the button would leave the question
   * open forever.
   */
  const showLamp = (light.torch || !light.known) && !noLamp;

  const toggleTorch = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !torchRef.current;
    if (!(await setTorch(stream, next))) {
      setNoLamp(true);
      return;
    }
    torchRef.current = next;
    setTorchOn(next);
  }, []);

  const moveExposure = useCallback(
    (value: number) => {
      setExposureAt(value);
      const stream = streamRef.current;
      if (stream && light.exposure) void setExposure(stream, light.exposure.key, value);
    },
    [light.exposure]
  );

  /**
   * Take the shot — as a short burst, keeping the sharpest.
   *
   * Pressing a button on a hand-held phone moves it: autofocus starts hunting,
   * the label smears, and the shot is wasted. Moving the shutter nearer the
   * finger shortens the reach but cannot fix that, because the shake comes from
   * the press itself. The wobble damps out in a couple of tenths of a second,
   * so a few frames are taken across that window and the sharpest is kept.
   *
   * The camera keeps running through the burst — stopping it would freeze the
   * preview on the first frame, which is the one most likely to be the blurred
   * one.
   */
  const snap = useCallback(async () => {
    const video = videoRef.current;
    if (!video || bursting) return;
    setBursting(true);
    try {
      const frame = keptFrame();
      const region = visibleRegion(video);
      await burstSharpest(video, () => snapshotFrame(video, frame, region));
      // The kept frame IS the viewfinder box, so the rectangle drawn on screen
      // is already in its coordinates — nothing to convert.
      const dataUrl = cropImage(frame, rect, preset);
      stop();
      setCropRect(rect);
      setPhase({ kind: "review", dataUrl, from: "camera" });
    } catch {
      // Frame wasn't ready — let them try again.
    } finally {
      setBursting(false);
    }
  }, [preset, rect, stop, bursting, keptFrame]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  // An escape hatch for when the label just won't photograph well (glare, tiny
  // print, curved bag): pick a screenshot or a shot of a monitor instead. It
  // goes through the same crop and the same review, so an upload can be trimmed
  // exactly like a capture — it simply starts out keeping everything.
  const pickFile = useCallback(() => fileRef.current?.click(), []);

  const onFilePicked = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // let the same file be picked again
      if (!file) return;
      try {
        const frame = keptFrame();
        await decodeImageFile(file, frame);
        const dataUrl = cropImage(frame, WHOLE_IMAGE, preset);
        stop();
        setCropRect(WHOLE_IMAGE);
        setPhase({ kind: "review", dataUrl, from: "upload" });
      } catch (err) {
        setPhase({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't read that image. Try a JPEG or PNG.",
        });
      }
    },
    [preset, stop, keptFrame]
  );

  const retake = useCallback(() => {
    if (phase.kind === "review" && phase.from === "upload") {
      pickFile();
      return;
    }
    setPhase({ kind: "starting" });
    start();
  }, [phase, pickFile, start]);

  // ── Adjust ──────────────────────────────────────────────────────────────────
  /** Show the whole photo with the crop back on top of it, ready to be moved. */
  const beginAdjust = useCallback(() => {
    if (phase.kind !== "review") return;
    const frame = frameRef.current;
    if (!frame?.width || !frame.height) return;
    setAdjustRect(cropRect);
    setPhase({
      kind: "adjust",
      // Encoded here rather than at capture time: most shots are never adjusted,
      // and this is a full-frame JPEG nobody would otherwise pay for.
      fullUrl: frame.toDataURL("image/jpeg", 0.85),
      w: frame.width,
      h: frame.height,
      from: phase.from,
    });
  }, [phase, cropRect]);

  /** Re-cut from the kept frame. Nothing was lost, so this can happen again. */
  const recrop = useCallback(
    (next: NormalizedRect) => {
      if (phase.kind !== "adjust") return;
      const frame = frameRef.current;
      if (!frame) return;
      try {
        const dataUrl = cropImage(frame, next, preset);
        setCropRect(next);
        setPhase({ kind: "review", dataUrl, from: phase.from });
      } catch {
        // Nothing to cut from — the review screen we came from is still valid.
      }
    },
    [phase, preset]
  );

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
      {/* Hidden picker shared by every "Upload" affordance below. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFilePicked}
        className="hidden"
      />

      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)_+_1.25rem)] text-white">
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
          {/* Camera blocked/unsupported is exactly when uploading matters most. */}
          <button
            onClick={pickFile}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-ink transition hover:bg-white/90"
          >
            <ImageUp size={16} strokeWidth={1.8} aria-hidden="true" />
            Upload an image
          </button>
          <button
            onClick={close}
            className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-[14px] font-medium text-white transition hover:bg-white/10"
          >
            Go back
          </button>
        </div>
      ) : phase.kind === "adjust" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5">
          {/* The wrapper is capped so the photo's own height decides the box —
              that keeps the rectangle exactly over the picture, which is the
              one thing this screen has to get right. */}
          <CropFrame
            rect={adjustRect}
            onChange={setAdjustRect}
            className="w-full ring-1 ring-white/15"
            style={{ maxWidth: `calc(${ADJUST_MAX_VH}vh * ${phase.w} / ${phase.h})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={phase.fullUrl} alt="The whole shot, before cropping" className="block w-full" />
          </CropFrame>

          <p className="max-w-[340px] text-center text-[13px] leading-snug text-white/70">
            Everything outside the box is dropped. Drag it, pull the corners.
          </p>

          <div className="flex w-full max-w-[420px] items-center gap-3">
            <button
              onClick={() => recrop(cropRect)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-input border border-white/25 bg-white/10 text-[15px] font-medium text-white transition active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => recrop(adjustRect)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-input bg-sage-500 text-[15px] font-semibold text-white shadow-button transition active:scale-[0.98]"
            >
              <Check size={16} strokeWidth={2} aria-hidden="true" />
              Crop
            </button>
          </div>
        </div>
      ) : phase.kind === "review" ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={phase.dataUrl}
            alt="Captured photo preview"
            className="max-h-[60vh] w-auto max-w-full rounded-2xl border border-white/20 object-contain"
          />
          <div className="flex w-full max-w-[420px] items-center gap-2">
            <button
              onClick={retake}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-input border border-white/25 bg-white/10 text-[14px] font-medium text-white transition active:scale-[0.98]"
            >
              <RefreshCw size={15} strokeWidth={1.8} aria-hidden="true" />
              Retake
            </button>
            <button
              onClick={beginAdjust}
              className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-input border border-white/25 bg-white/10 text-[14px] font-medium text-white transition active:scale-[0.98]"
            >
              <Crop size={15} strokeWidth={1.8} aria-hidden="true" />
              Adjust
            </button>
            <button
              onClick={accept}
              className="inline-flex h-12 flex-[1.3] items-center justify-center gap-1.5 rounded-input bg-sage-500 text-[14px] font-semibold text-white shadow-button transition active:scale-[0.98]"
            >
              Use photo
            </button>
          </div>
        </div>
      ) : (
        <CropFrame
          rect={rect}
          onChange={setRect}
          className="flex-1 overflow-hidden"
        >
          <video
            ref={attachVideo}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Hint */}
          <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex flex-col items-center gap-2 px-6">
            <p className="max-w-[340px] rounded-full bg-black/40 px-4 py-2 text-center text-[13px] font-medium text-white/90">
              {hint} · Drag the box, pull the corners to fit.
            </p>
            {/* Said out loud rather than by a button quietly disappearing: the
                answer to "does the lamp work on this phone" is worth having. */}
            {noLamp && (
              <p className="max-w-[340px] rounded-full bg-black/50 px-4 py-2 text-center text-[12px] font-medium text-amber">
                This browser won&rsquo;t let the page switch the lamp.
              </p>
            )}
          </div>

          {/* The shutter, which travels with the frame.
              It used to be pinned to the bottom corner, so lining up the label
              and then reaching down to press moved the phone — autofocus went
              hunting and the shot smeared. Keeping it beside the frame means
              the thumb is already there: lift, tap. Falls back to the fixed
              position when the frame fills the screen and there is nowhere
              clear to stand. */}
          {floating && lamp ? (
            <>
              <button
                onClick={() => void snap()}
                disabled={phase.kind !== "ready" || bursting}
                aria-label="Take photo"
                className="absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white/80 bg-white/20 shadow-lg backdrop-blur-[2px] transition active:scale-95 disabled:opacity-40"
                style={{
                  left: `${floating.cx * 100}%`,
                  top: `${floating.cy * 100}%`,
                  width: `${SHUTTER_RADIUS * 2 * 100}%`,
                  aspectRatio: "1 / 1",
                }}
              >
                <span
                  className={`h-[72%] w-[72%] rounded-full bg-white transition-opacity ${
                    bursting ? "animate-pulse opacity-70" : ""
                  }`}
                />
              </button>

              {/* The lamp rides alongside, so switching it on doesn't cost the
                  journey the shutter no longer costs. */}
              {showLamp && (
                <button
                  onClick={() => void toggleTorch()}
                  disabled={phase.kind !== "ready"}
                  aria-label={torchOn ? "Switch the lamp off" : "Switch the lamp on"}
                  aria-pressed={torchOn}
                  className={`absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 backdrop-blur-[2px] transition active:scale-95 disabled:opacity-40 ${
                    torchOn
                      ? "border-amber bg-amber text-ink"
                      : "border-white/50 bg-black/35 text-white"
                  }`}
                  style={{
                    left: `${lamp.cx * 100}%`,
                    top: `${lamp.cy * 100}%`,
                    width: `${LAMP_RADIUS * 2 * 100}%`,
                    aspectRatio: "1 / 1",
                  }}
                >
                  <Flashlight size={20} strokeWidth={1.9} aria-hidden="true" />
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center pb-[calc(env(safe-area-inset-bottom)_+_2.5rem)]">
              {/* The shutter stays dead centre; the lamp hangs off its left,
                  rather than the pair sharing the middle between them. */}
              <div className="relative">
                {showLamp && (
                  <button
                    onClick={() => void toggleTorch()}
                    disabled={phase.kind !== "ready"}
                    aria-label={torchOn ? "Switch the lamp off" : "Switch the lamp on"}
                    aria-pressed={torchOn}
                    className={`absolute right-full top-1/2 mr-5 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 transition active:scale-95 disabled:opacity-40 ${
                      torchOn
                        ? "border-amber bg-amber text-ink"
                        : "border-white/50 bg-black/35 text-white"
                    }`}
                  >
                    <Flashlight size={20} strokeWidth={1.9} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={() => void snap()}
                  disabled={phase.kind !== "ready" || bursting}
                  aria-label="Take photo"
                  className="inline-flex h-[74px] w-[74px] items-center justify-center rounded-full border-[5px] border-white/80 bg-white/20 transition active:scale-95 disabled:opacity-40"
                >
                  <span
                    className={`h-14 w-14 rounded-full bg-white ${
                      bursting ? "animate-pulse opacity-70" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* How bright the picture comes out — NOT how hard the lamp burns,
              which the web does not expose. It earns its place all the same:
              a torch on a glossy pack leaves a white patch across the print,
              and this is the control that takes it off. Only shown while the
              lamp is on, and only where the device offers a real range.
              Deliberately a hairline: it sits over the picture, so it covers
              as close to nothing as a draggable control can. */}
          {torchOn && light.exposure && exposure !== null && (
            <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 px-7 pb-[calc(env(safe-area-inset-bottom)_+_0.85rem)]">
              <Sun size={14} strokeWidth={1.8} className="shrink-0 text-white/70" aria-hidden="true" />
              <input
                type="range"
                aria-label="Picture brightness"
                min={light.exposure.min}
                max={light.exposure.max}
                step={light.exposure.step}
                value={exposure}
                onChange={(e) => moveExposure(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-amber"
              />
              <Sun size={20} strokeWidth={1.8} className="shrink-0 text-white/90" aria-hidden="true" />
            </div>
          )}

          {/* Upload stays in the corner: it is the escape hatch, reached once
              in a while and deliberately, so it has no reason to follow a
              thumb that is busy aiming. */}
          <div className="absolute bottom-0 right-0 z-30 pb-[calc(env(safe-area-inset-bottom)_+_2.5rem)] pr-8">
            <button
              onClick={pickFile}
              aria-label="Upload an image instead"
              className="inline-flex flex-col items-center gap-1 text-white/85 transition active:scale-95"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <ImageUp size={20} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="text-[11px] font-medium">Upload</span>
            </button>
          </div>
        </CropFrame>
      )}
    </div>
  );
}
