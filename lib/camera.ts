/**
 * What the camera will let us change: focus, the lamp, the exposure.
 *
 * Everything here is best-effort and capability-gated. Phones and browsers
 * differ wildly in what they expose — iOS WebKit exposes almost none of it —
 * so nothing is assumed, everything is asked for and checked.
 */

/**
 * Nudge a camera stream toward "settles to sharp fast".
 *
 * By default browsers give the rear camera single-shot autofocus, so a close-up
 * label sits blurry for a beat before it snaps into focus — the slow moment when
 * you're trying to aim-and-shoot quickly. Where the device exposes it, we switch
 * focus / exposure / white-balance to CONTINUOUS so the preview keeps hunting and
 * locks onto the label much sooner.
 *
 * Best-effort and non-blocking: capabilities vary wildly across phones/browsers
 * (iOS WebKit exposes almost none), so anything unsupported is silently skipped
 * and the default auto behaviour stays.
 */
export async function applyContinuousCamera(stream: MediaStream): Promise<void> {
  const track = videoTrack(stream);
  if (!track) return;
  const caps = capabilities(track);
  if (!caps) return;

  const wants: [string, string][] = [
    ["focusMode", "continuous"],
    ["exposureMode", "continuous"],
    ["whiteBalanceMode", "continuous"],
  ];

  const advanced: Record<string, string>[] = [];
  for (const [key, value] of wants) {
    const supported = caps[key];
    if (Array.isArray(supported) && supported.includes(value)) {
      advanced.push({ [key]: value });
    }
  }
  if (advanced.length === 0) return;

  try {
    await track.applyConstraints({ advanced } as MediaTrackConstraints);
  } catch {
    /* device rejected the constraints — keep default auto behaviour */
  }
}

// ── The lamp, and how bright the picture comes out ───────────────────────────

/**
 * A numeric camera control with a real range, for the slider to drive.
 *
 * `exposureCompensation` is the one that matters. It is NOT the lamp's power —
 * the web has no such thing — it is how bright the camera decides the picture
 * should be. On a glossy pack under a torch that is the control you actually
 * want: turning it down kills the blown-out white patch sitting on the print.
 */
export interface ExposureRange {
  key: "exposureCompensation" | "brightness";
  min: number;
  max: number;
  step: number;
  value: number;
}

export interface CameraLight {
  /** The device says it can switch its lamp on. */
  torch: boolean;
  /**
   * Whether the device told us anything at all. False on browsers that expose
   * no capabilities, where "no torch" means "no answer" rather than "no lamp" —
   * worth trying anyway, and worth saying so when it fails.
   */
  known: boolean;
  exposure: ExposureRange | null;
}

const NOTHING: CameraLight = { torch: false, known: false, exposure: null };

function videoTrack(stream: MediaStream): MediaStreamTrack | null {
  try {
    return stream.getVideoTracks()[0] ?? null;
  } catch {
    return null;
  }
}

function capabilities(track: MediaStreamTrack): Record<string, unknown> | null {
  if (typeof track.getCapabilities !== "function") return null;
  try {
    return track.getCapabilities() as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

function settingsOf(track: MediaStreamTrack): Record<string, unknown> {
  if (typeof track.getSettings !== "function") return {};
  try {
    return track.getSettings() as unknown as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** The spec says a sequence of booleans; browsers have shipped a plain one. */
function torchCapable(caps: Record<string, unknown>): boolean {
  const torch = caps.torch;
  return torch === true || (Array.isArray(torch) && torch.includes(true));
}

function rangeOf(
  caps: Record<string, unknown>,
  settings: Record<string, unknown>,
  key: ExposureRange["key"]
): ExposureRange | null {
  const range = caps[key] as { min?: unknown; max?: unknown; step?: unknown } | undefined;
  if (!range || typeof range.min !== "number" || typeof range.max !== "number") return null;
  if (!(range.max > range.min)) return null;

  const step =
    typeof range.step === "number" && range.step > 0
      ? range.step
      : (range.max - range.min) / 20;
  const current = settings[key];

  return {
    key,
    min: range.min,
    max: range.max,
    step,
    // Start where the camera already is, so touching the slider doesn't jump
    // the picture before it has been asked to.
    value:
      typeof current === "number" && current >= range.min && current <= range.max
        ? current
        : (range.min + range.max) / 2,
  };
}

/** What this particular camera, on this particular browser, will let us do. */
export function readCameraLight(stream: MediaStream): CameraLight {
  const track = videoTrack(stream);
  if (!track) return NOTHING;
  const caps = capabilities(track);
  if (!caps) return NOTHING;
  const settings = settingsOf(track);

  return {
    known: true,
    torch: torchCapable(caps),
    exposure:
      rangeOf(caps, settings, "exposureCompensation") ??
      rangeOf(caps, settings, "brightness"),
  };
}

/**
 * Switch the lamp. Returns whether it actually happened.
 *
 * Two spellings are tried because browsers disagree about which one turns a
 * torch on, and the result is read back from the track rather than taken from
 * the promise: an `advanced` constraint that a device ignores still resolves
 * successfully, which would let this report a light that isn't lit.
 */
export async function setTorch(stream: MediaStream, on: boolean): Promise<boolean> {
  const track = videoTrack(stream);
  if (!track) return false;

  for (const constraints of [{ torch: on }, { advanced: [{ torch: on }] }]) {
    try {
      await track.applyConstraints(constraints as MediaTrackConstraints);
      const applied = settingsOf(track).torch;
      if (typeof applied !== "boolean" || applied === on) return true;
    } catch {
      /* wrong spelling for this browser, or it simply refuses — try the other */
    }
  }
  return false;
}

/** Move a numeric control. Best-effort: a device that ignores it changes nothing. */
export async function setExposure(
  stream: MediaStream,
  key: ExposureRange["key"],
  value: number
): Promise<void> {
  const track = videoTrack(stream);
  if (!track) return;
  try {
    await track.applyConstraints({
      advanced: [{ [key]: value }],
    } as MediaTrackConstraints);
  } catch {
    /* out of range or unsupported — the picture simply stays as it was */
  }
}
