import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  addScan,
  isHit,
  outcomeOf,
  reachProblem,
  resolveConsumerUrl,
  summarise,
  toTsv,
  DEFAULT_CONSUMER_URL,
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

describe("resolveConsumerUrl", () => {
  // The bug this function exists for. `??` falls through on null and undefined
  // only, so a dashboard entry left blank passes an empty string straight
  // through, fetch is handed a relative path, and the TypeError it throws
  // reads from an aisle exactly like the site being down.
  it("treats a variable that exists and is empty as unset", () => {
    expect(resolveConsumerUrl("").url).toBe(DEFAULT_CONSUMER_URL);
    expect(resolveConsumerUrl("   ").url).toBe(DEFAULT_CONSUMER_URL);
    expect(resolveConsumerUrl(undefined).url).toBe(DEFAULT_CONSUMER_URL);
    expect(resolveConsumerUrl(null).url).toBe(DEFAULT_CONSUMER_URL);
  });

  it("keeps a staging address, without its trailing slashes", () => {
    expect(resolveConsumerUrl("https://staging.example.com/").url).toBe(
      "https://staging.example.com"
    );
    expect(resolveConsumerUrl("  https://staging.example.com///  ").url).toBe(
      "https://staging.example.com"
    );
  });

  it("refuses an address with no scheme, and says what is missing", () => {
    const target = resolveConsumerUrl("ingredients.help");
    expect(target.url).toBeNull();
    // The message has to name the fix: this is read by somebody in a shop.
    expect(target.problem).toContain("https://");
  });

  it("refuses a scheme nothing can be fetched over", () => {
    expect(resolveConsumerUrl("ftp://ingredients.help").url).toBeNull();
    expect(resolveConsumerUrl("file:///etc/passwd").url).toBeNull();
  });
});

describe("reachProblem", () => {
  it("tells a dead address apart from a slow one", () => {
    // Opposite meanings, opposite fixes. The error name told neither.
    expect(reachProblem("TypeError", "https://x.test")).toContain("Could not connect");
    expect(reachProblem("TimeoutError", "https://x.test")).toContain("did not answer in time");
  });

  it("always names the address that was tried", () => {
    for (const name of ["TypeError", "TimeoutError", "AbortError", "SomethingElse"]) {
      expect(reachProblem(name, "https://x.test")).toContain("https://x.test");
    }
  });
});

/**
 * The guard for the failure that sent somebody home from a shop.
 *
 * `DEFAULT_CONSUMER_URL` was written in the plural, from this repository's
 * name — `ingredients.help` — and the deployed site is singular. That address
 * resolves to nothing, so every scan in Test Mode failed at DNS and reported
 * the shopper's app as unreachable, which is true and useless: the app was
 * fine and had never been asked.
 *
 * Nothing could have caught it here, because the fact lives in the other
 * repository. So this reads it from there, the same way
 * `Ingredients.help/tests/shared-modules.test.ts` reads this one, and skips
 * cleanly when the sibling is not checked out — CI without it loses the check,
 * not the build.
 */
describe("the consumer app's address", () => {
  const ENV_EXAMPLE = join(__dirname, "..", "..", "Ingredients.help", ".env.example");
  const present = existsSync(ENV_EXAMPLE);

  it.skipIf(!present)("matches the domain the app documents for itself", () => {
    const text = readFileSync(ENV_EXAMPLE, "utf8");
    // Commented out in that file — it is only set for a custom domain — so the
    // leading `#` is part of what is being read, not a reason to ignore it.
    const found = text.match(/^\s*#?\s*NEXT_PUBLIC_SITE_URL\s*=\s*(\S+)\s*$/m);
    expect(found, "NEXT_PUBLIC_SITE_URL is not documented in the app's .env.example").not.toBeNull();
    expect(DEFAULT_CONSUMER_URL).toBe(found![1].replace(/\/+$/, ""));
  });
});
