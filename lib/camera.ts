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
  const track = stream.getVideoTracks()[0];
  if (!track || typeof track.getCapabilities !== "function") return;

  let caps: Record<string, unknown>;
  try {
    caps = track.getCapabilities() as unknown as Record<string, unknown>;
  } catch {
    return;
  }

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
