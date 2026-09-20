import { describe, expect, it } from "vitest";
import { FLASH_FAILED, FLASH_MS, buzz, flashFor } from "./scan-flash";
import { OUTCOME_ORDER, type ScanOutcome } from "./scan-test";

describe("flashFor", () => {
  // The one the whole thing was built for: eleven correct reads in an aisle
  // looked exactly like eleven failures, because the answer was drawn behind
  // the camera. A hit has to read as a hit without being looked at.
  it("says yes to a tin we hold", () => {
    expect(flashFor("ours")).toMatchObject({ kind: "ok", headline: "IN THE CATALOG" });
  });

  it("says yes to one somebody else answered", () => {
    // Nothing to do in the aisle about a row that came from an open database:
    // it is already in the run. Same buzz, different word.
    expect(flashFor("open").kind).toBe("ok");
    expect(flashFor("multipack").kind).toBe("ok");
    expect(flashFor("open").headline).not.toBe(flashFor("ours").headline);
  });

  it("warns on the two that mean there is work", () => {
    expect(flashFor("not-found")).toMatchObject({ kind: "none" });
    expect(flashFor("no-ingredients")).toMatchObject({ kind: "odd" });
  });

  // A stray tin is the only thing on this screen that can only be fixed while
  // it is still in the hand — once it is scanned and put back down, nobody can
  // tell which of thirty cans it was. So it outranks a perfect catalogue hit.
  it("lets a stray brand outrank even a catalogue hit", () => {
    expect(flashFor("ours", "different")).toMatchObject({
      kind: "odd",
      headline: "ANOTHER BRAND",
    });
    expect(flashFor("ours", "match").kind).toBe("ok");
    expect(flashFor("ours", "unnamed").kind).toBe("ok");
  });

  it("answers for every outcome the run can hold", () => {
    for (const outcome of OUTCOME_ORDER as readonly ScanOutcome[]) {
      const flash = flashFor(outcome);
      expect({ outcome, headline: flash.headline.length > 0 }).toEqual({
        outcome,
        headline: true,
      });
      expect(flash.vibrate.length).toBeGreaterThan(0);
    }
  });

  // Carry on, or look at me. Anything in between is a pattern nobody can tell
  // apart through a coat pocket.
  it("buzzes once for carry on and more than once for look at me", () => {
    expect(flashFor("ours").vibrate).toHaveLength(1);
    expect(flashFor("open").vibrate).toHaveLength(1);
    for (const flash of [
      flashFor("not-found"),
      flashFor("no-ingredients"),
      flashFor("ours", "different"),
      FLASH_FAILED,
    ]) {
      expect(flash.vibrate.length).toBeGreaterThan(1);
    }
  });

  // A failed lookup records nothing, so the tin never appears in the run at
  // all. That is the one silence worse than the one this file is about, and it
  // must not read as an answer.
  it("keeps a failed lookup apart from every outcome", () => {
    expect(FLASH_FAILED.kind).not.toBe("ok");
    for (const outcome of OUTCOME_ORDER as readonly ScanOutcome[]) {
      expect(flashFor(outcome).headline).not.toBe(FLASH_FAILED.headline);
    }
  });

  it("stays up long enough to be seen and not long enough to wait for", () => {
    expect(FLASH_MS).toBeGreaterThanOrEqual(700);
    expect(FLASH_MS).toBeLessThanOrEqual(1500);
  });
});

describe("buzz", () => {
  it("asks the phone when it has a motor", () => {
    const asked: unknown[] = [];
    navigator.vibrate = ((pattern: VibratePattern | Iterable<number>) => {
      asked.push(pattern);
      return true;
    }) as Navigator["vibrate"];
    buzz([35]);
    expect(asked).toEqual([[35]]);
  });

  // iOS Safari has no `vibrate`, and some embedded browsers throw on it.
  // Neither is a broken screen: the flash is the signal, this is the bonus.
  it("says nothing when it does not", () => {
    Reflect.deleteProperty(navigator, "vibrate");
    expect(() => buzz([35])).not.toThrow();
    navigator.vibrate = (() => {
      throw new Error("not allowed here");
    }) as Navigator["vibrate"];
    expect(() => buzz([35])).not.toThrow();
  });
});
