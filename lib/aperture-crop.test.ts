import { describe, expect, it } from "vitest";
import { apertureCrop } from "./aperture-crop";

describe("apertureCrop", () => {
  // The real case: a landscape sensor frame in a portrait phone preview. The
  // scale is set by the HEIGHT (that's what object-cover means here), and the
  // sides of the frame are off-screen entirely.
  it("undoes object-cover on a portrait phone", () => {
    const crop = apertureCrop(
      { width: 1920, height: 1080 },
      { width: 390, height: 700 },
      { width: 288, height: 128 }
    );
    const scale = 700 / 1080; // height-driven, ≈0.648
    expect(crop.sw).toBeCloseTo(288 / scale, 3);
    expect(crop.sh).toBeCloseTo(128 / scale, 3);
    // Centred: as much frame left of the crop as right of it.
    expect(crop.sx).toBeCloseTo((1920 - crop.sw) / 2, 3);
    expect(crop.sy).toBeCloseTo((1080 - crop.sh) / 2, 3);
  });

  it("is driven by whichever side has to stretch further", () => {
    // A very wide box: now the WIDTH decides the scale.
    const crop = apertureCrop(
      { width: 1000, height: 1000 },
      { width: 800, height: 200 },
      { width: 400, height: 100 }
    );
    expect(crop.sw).toBeCloseTo(400 / 0.8, 3);
    expect(crop.sh).toBeCloseTo(100 / 0.8, 3);
  });

  it("never asks for pixels outside the frame", () => {
    const crop = apertureCrop(
      { width: 640, height: 480 },
      { width: 400, height: 300 },
      { width: 4000, height: 4000 } // an aperture larger than the whole preview
    );
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(0);
    expect(crop.sw).toBe(640);
    expect(crop.sh).toBe(480);
  });

  it("falls back to the whole frame before the camera reports a size", () => {
    expect(
      apertureCrop({ width: 0, height: 0 }, { width: 390, height: 700 }, { width: 288, height: 128 })
    ).toEqual({ sx: 0, sy: 0, sw: 0, sh: 0 });
    expect(
      apertureCrop({ width: 640, height: 480 }, { width: 0, height: 0 }, { width: 288, height: 128 })
    ).toEqual({ sx: 0, sy: 0, sw: 640, sh: 480 });
  });

  it("keeps the crop's shape matching the aperture's", () => {
    const crop = apertureCrop(
      { width: 1920, height: 1080 },
      { width: 390, height: 700 },
      { width: 288, height: 128 }
    );
    expect(crop.sw / crop.sh).toBeCloseTo(288 / 128, 6);
  });
});
