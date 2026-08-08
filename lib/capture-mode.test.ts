import { describe, expect, it } from "vitest";
import { resolveCaptureMode, wasReclassified } from "./capture-mode";

/**
 * The rule this file protects: a sticky picker must never again decide what a
 * product is when the pack itself says otherwise.
 */
describe("resolveCaptureMode", () => {
  it("files a human product as human even when pet was left selected", () => {
    const v = resolveCaptureMode("pet", "human");
    expect(v.mode).toBe("human");
    expect(v.fromLabel).toBe(true);
    expect(wasReclassified(v)).toBe(true);
  });

  it("files a shampoo as cosmetics from an afternoon of pet food", () => {
    expect(resolveCaptureMode("pet", "cosmetics").mode).toBe("cosmetics");
  });

  it("keeps the operator's pick when the pack doesn't say", () => {
    const v = resolveCaptureMode("pet", "unknown");
    expect(v.mode).toBe("pet");
    expect(v.fromLabel).toBe(false);
    expect(wasReclassified(v)).toBe(false);
  });

  // The picker is still the fallback, so an unreadable pack files where the
  // operator aimed — including into human or cosmetics.
  it("falls back to whichever mode was picked", () => {
    expect(resolveCaptureMode("human", "unknown").mode).toBe("human");
    expect(resolveCaptureMode("cosmetics", "unknown").mode).toBe("cosmetics");
  });

  it("reports no reclassification when the pack agrees with the pick", () => {
    const v = resolveCaptureMode("pet", "pet");
    expect(v.mode).toBe("pet");
    expect(v.fromLabel).toBe(true);
    expect(wasReclassified(v)).toBe(false);
  });

  it("always remembers what was picked", () => {
    expect(resolveCaptureMode("cosmetics", "human").picked).toBe("cosmetics");
  });
});
