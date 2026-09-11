import { describe, expect, it } from "vitest";
import {
  addScan,
  isHit,
  outcomeOf,
  summarise,
  toTsv,
  type ScanOutcome,
  type TestScan,
} from "./scan-test";

const scan = (
  code: string,
  outcome: ScanOutcome,
  over: Partial<TestScan> = {}
): Omit<TestScan, "times"> => ({
  code,
  outcome,
  name: null,
  source: null,
  miss: null,
  at: 0,
  ...over,
});

describe("outcomeOf", () => {
  // The split that makes the whole exercise worth doing. Both are a shopper
  // walking away happy; only one of them is us.
  it("separates our answer from a borrowed one", () => {
    expect(outcomeOf({ found: true, source: "verified" })).toBe("ours");
    expect(outcomeOf({ found: true, source: "community" })).toBe("ours");
    expect(outcomeOf({ found: true, source: "openpetfoodfacts" })).toBe("open");
    expect(outcomeOf({ found: true, source: "openfoodfacts" })).toBe("open");
  });

  it("reads the three ways a lookup comes back empty", () => {
    expect(outcomeOf({ found: false, reason: "multipack" })).toBe("multipack");
    expect(outcomeOf({ found: false, reason: "no-ingredients" })).toBe("no-ingredients");
    expect(outcomeOf({ found: false, reason: "not-found" })).toBe("not-found");
  });

  // Pessimistic on purpose. A shape the consumer app does not produce must not
  // be guessed into the one bucket this test exists to count honestly.
  it("never guesses a hit out of a shape it does not know", () => {
    expect(outcomeOf({ found: true })).toBe("open");
    expect(outcomeOf({ found: true, source: null })).toBe("open");
    expect(outcomeOf({ found: false })).toBe("not-found");
    expect(outcomeOf(null)).toBe("not-found");
    expect(outcomeOf(undefined)).toBe("not-found");
  });
});

describe("isHit", () => {
  // A box is a real answer to the question asked. Calling it a failure would
  // push the desk towards deleting box rows to improve a number.
  it("counts a variety pack as an answer", () => {
    expect(isHit("multipack")).toBe(true);
    expect(isHit("ours")).toBe(true);
    expect(isHit("open")).toBe(true);
    expect(isHit("no-ingredients")).toBe(false);
    expect(isHit("not-found")).toBe(false);
  });
});

describe("addScan", () => {
  it("puts the newest scan first", () => {
    let run: TestScan[] = [];
    run = addScan(run, scan("1", "ours"));
    run = addScan(run, scan("2", "not-found"));
    expect(run.map((s) => s.code)).toEqual(["2", "1"]);
  });

  // The measurement, not tidiness: a reader fires twice on a good barcode more
  // often than not, and counting those again moves the hit rate by whichever
  // kind of product happened to stutter.
  it("folds a re-scan into the product instead of counting it twice", () => {
    let run: TestScan[] = [];
    run = addScan(run, scan("1", "ours"));
    run = addScan(run, scan("2", "not-found"));
    run = addScan(run, scan("1", "ours"));
    expect(run).toHaveLength(2);
    expect(run.find((s) => s.code === "1")?.times).toBe(2);
    // And it comes back to the top, because it is what was just scanned.
    expect(run[0].code).toBe("1");
  });

  // A re-scan carries the fresher answer. The catalog is editable and a code
  // can become a hit between two presses.
  it("takes the newer verdict on a re-scan", () => {
    let run: TestScan[] = [];
    run = addScan(run, scan("1", "not-found"));
    run = addScan(run, scan("1", "ours", { source: "verified" }));
    expect(run[0].outcome).toBe("ours");
    expect(run[0].source).toBe("verified");
    expect(run[0].times).toBe(2);
  });
});

describe("summarise", () => {
  it("says nothing rather than zero about an empty run", () => {
    const s = summarise([]);
    expect(s).toMatchObject({ total: 0, hits: 0, hitRate: null, ourRate: null });
  });

  // The two rates answer different questions, and the gap between them is the
  // argument for more research.
  it("separates what the app answers from what we answer", () => {
    let run: TestScan[] = [];
    for (const [code, outcome] of [
      ["1", "ours"],
      ["2", "ours"],
      ["3", "open"],
      ["4", "multipack"],
      ["5", "no-ingredients"],
      ["6", "not-found"],
      ["7", "not-found"],
      ["8", "not-found"],
      ["9", "not-found"],
      ["10", "not-found"],
    ] as [string, ScanOutcome][]) {
      run = addScan(run, scan(code, outcome));
    }
    const s = summarise(run);
    expect(s.total).toBe(10);
    // ours + open + multipack = 4 of 10.
    expect(s.hits).toBe(4);
    expect(s.hitRate).toBe(40);
    // Of which only two are ours.
    expect(s.ourRate).toBe(20);
    expect(s.byOutcome).toEqual({
      ours: 2,
      open: 1,
      multipack: 1,
      "no-ingredients": 1,
      "not-found": 5,
    });
  });

  it("counts reads apart from products, so reader stutter is visible", () => {
    let run: TestScan[] = [];
    run = addScan(run, scan("1", "ours"));
    run = addScan(run, scan("1", "ours"));
    run = addScan(run, scan("1", "ours"));
    run = addScan(run, scan("2", "not-found"));
    const s = summarise(run);
    expect(s.total).toBe(2);
    expect(s.reads).toBe(4);
    // Three reads of one can must not make it 3 of 4 rather than 1 of 2.
    expect(s.hitRate).toBe(50);
  });
});

describe("toTsv", () => {
  // Printed form, not the storage key. These codes are pasted into a
  // retailer's search box, where two leading zeros find nothing.
  it("exports printed barcodes in scan order", () => {
    let run: TestScan[] = [];
    run = addScan(run, scan("00050000577989", "not-found", { at: 1 }));
    run = addScan(run, scan("00886817011657", "ours", {
      at: 2,
      name: "Reveal Entrées Chicken Breast Paté",
      source: "verified",
    }));
    const lines = toTsv(run).split("\n");
    expect(lines[0]).toBe("barcode\toutcome\tname\tsource\tseed verdict\treads");
    expect(lines[1].split("\t")[0]).toBe("050000577989");
    expect(lines[2].split("\t")).toEqual([
      "886817011657",
      "ours",
      "Reveal Entrées Chicken Breast Paté",
      "verified",
      "",
      "1",
    ]);
  });
});
