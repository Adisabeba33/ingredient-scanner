import { describe, it, expect, vi } from "vitest";
import { readCameraLight, setTorch } from "./camera";

/**
 * There is no camera in a test runner, and there is no camera on the machine
 * this was written on either — so the devices are built here. That is the point:
 * what varies between phones is exactly what this code has to survive, and the
 * awkward ones (a browser that answers nothing, a device that accepts the
 * constraint and ignores it) are the ones a real camera would never show you on
 * demand.
 */
function fakeStream(track: unknown): MediaStream {
  return { getVideoTracks: () => (track ? [track] : []) } as unknown as MediaStream;
}

/** An Android-ish camera: reports what it can do, and does it. */
function capableTrack(overrides: Record<string, unknown> = {}) {
  const settings: Record<string, unknown> = { torch: false, exposureCompensation: 0 };
  return {
    getCapabilities: () => ({
      torch: true,
      exposureCompensation: { min: -3, max: 3, step: 0.5 },
      ...overrides,
    }),
    getSettings: () => settings,
    applyConstraints: vi.fn(async (c: Record<string, unknown>) => {
      if (typeof c.torch === "boolean") settings.torch = c.torch;
    }),
  };
}

describe("readCameraLight", () => {
  it("reads a lamp and an exposure range off a camera that has both", () => {
    const light = readCameraLight(fakeStream(capableTrack()));
    expect(light.known).toBe(true);
    expect(light.torch).toBe(true);
    expect(light.exposure).toEqual({
      key: "exposureCompensation",
      min: -3,
      max: 3,
      step: 0.5,
      value: 0,
    });
  });

  it("accepts the spec's spelling of torch as well as the shipped one", () => {
    // The spec says a sequence of booleans; browsers shipped a plain boolean.
    const asSequence = readCameraLight(fakeStream(capableTrack({ torch: [false, true] })));
    expect(asSequence.torch).toBe(true);
  });

  it("says no lamp when the device offers one it can't turn on", () => {
    expect(readCameraLight(fakeStream(capableTrack({ torch: [false] }))).torch).toBe(false);
    expect(readCameraLight(fakeStream(capableTrack({ torch: false }))).torch).toBe(false);
  });

  it("tells a silent browser apart from a lampless one", () => {
    // iOS WebKit exposes almost no capabilities. "known: false" is the
    // difference between "this phone has no lamp" and "this browser won't say",
    // and the second is worth trying anyway.
    const silent = readCameraLight(fakeStream({ getSettings: () => ({}) }));
    expect(silent).toEqual({ torch: false, known: false, exposure: null });

    const throws = readCameraLight(
      fakeStream({
        getCapabilities: () => {
          throw new Error("not implemented");
        },
      })
    );
    expect(throws.known).toBe(false);
  });

  it("falls back to brightness when there's no exposure compensation", () => {
    const track = capableTrack({
      exposureCompensation: undefined,
      brightness: { min: 0, max: 255, step: 1 },
    });
    expect(readCameraLight(fakeStream(track)).exposure?.key).toBe("brightness");
  });

  it("ignores a range that isn't one", () => {
    for (const bad of [
      { min: 0, max: 0 },
      { min: 3, max: -3 },
      { min: "dark", max: "bright" },
      {},
    ]) {
      const track = capableTrack({ exposureCompensation: bad, brightness: undefined });
      expect(readCameraLight(fakeStream(track)).exposure).toBeNull();
    }
  });

  it("starts the slider where the camera already is", () => {
    const track = capableTrack();
    track.getSettings = () => ({ exposureCompensation: 1.5 });
    expect(readCameraLight(fakeStream(track)).exposure?.value).toBe(1.5);
  });

  it("starts mid-range when the camera won't say where it is", () => {
    const track = capableTrack();
    track.getSettings = () => ({});
    expect(readCameraLight(fakeStream(track)).exposure?.value).toBe(0);
  });

  it("invents a step when the device gives none", () => {
    const track = capableTrack({ exposureCompensation: { min: -2, max: 2 } });
    expect(readCameraLight(fakeStream(track)).exposure?.step).toBeGreaterThan(0);
  });

  it("survives a stream with no video in it", () => {
    expect(readCameraLight(fakeStream(null)).known).toBe(false);
  });
});

describe("setTorch", () => {
  it("turns the lamp on", async () => {
    const track = capableTrack();
    expect(await setTorch(fakeStream(track), true)).toBe(true);
    expect(track.getSettings().torch).toBe(true);
  });

  it("tries the other spelling when the first is refused", async () => {
    // Chrome wanted torch inside `advanced` for years; others take it plain.
    const settings: Record<string, unknown> = { torch: false };
    const track = {
      getCapabilities: () => ({ torch: true }),
      getSettings: () => settings,
      applyConstraints: vi.fn(async (c: Record<string, unknown>) => {
        if (!Array.isArray(c.advanced)) throw new Error("OverconstrainedError");
        settings.torch = (c.advanced[0] as { torch: boolean }).torch;
      }),
    };
    expect(await setTorch(fakeStream(track), true)).toBe(true);
    expect(track.applyConstraints).toHaveBeenCalledTimes(2);
  });

  it("does not claim success for a device that accepts and ignores", async () => {
    // This is the one that matters: an `advanced` constraint a device ignores
    // still resolves. Believing the promise would light a lamp on screen and
    // leave the aisle dark.
    const track = {
      getCapabilities: () => ({ torch: true }),
      getSettings: () => ({ torch: false }),
      applyConstraints: vi.fn(async () => {}),
    };
    expect(await setTorch(fakeStream(track), true)).toBe(false);
  });

  it("believes a device that won't report the setting back", async () => {
    // No `torch` in the settings means no opinion, not a failure — refusing
    // here would hide the lamp on a browser where it works.
    const track = {
      getCapabilities: () => ({ torch: true }),
      getSettings: () => ({}),
      applyConstraints: vi.fn(async () => {}),
    };
    expect(await setTorch(fakeStream(track), true)).toBe(true);
  });

  it("reports failure when every spelling is refused", async () => {
    const track = {
      getCapabilities: () => ({}),
      getSettings: () => ({}),
      applyConstraints: vi.fn(async () => {
        throw new Error("OverconstrainedError");
      }),
    };
    expect(await setTorch(fakeStream(track), true)).toBe(false);
  });
});
