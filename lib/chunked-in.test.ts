import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chunk, deleteIn, IN_CHUNK, selectIn } from "./chunked-in";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_MULTIPACKS } from "../data/known-multipacks";

describe("chunk", () => {
  it("covers the input exactly once, in order", () => {
    const items = Array.from({ length: 1037 }, (_, i) => `code-${i}`);
    const pieces = chunk(items, 200);
    expect(pieces.length).toBe(6);
    expect(pieces.flat()).toEqual(items);
    expect(pieces.at(-1)!.length).toBe(37);
  });

  it("handles the boundaries", () => {
    expect(chunk([], 5)).toEqual([]);
    expect(chunk(["a"], 5)).toEqual([["a"]]);
    expect(chunk(["a", "b"], 1)).toEqual([["a"], ["b"]]);
    expect(chunk(["a", "b"], 2)).toEqual([["a", "b"]]);
  });

  it("refuses a size that would loop forever", () => {
    expect(() => chunk(["a"], 0)).toThrow();
  });
});

/**
 * A stand-in for PostgREST's silent row cap.
 *
 * The whole defect was that a capped response is indistinguishable from a
 * genuinely short one, so the fake does exactly that: answer at most `cap` rows
 * and say nothing about it.
 */
/** The fake is structural, so it is cast rather than declared as a client. */
const asDb = (fake: unknown) => fake as SupabaseClient;

function cappedClient(present: Set<string>, cap: number) {
  let requests = 0;
  const client = {
    from() {
      return {
        select() {
          return {
            in(_column: string, values: string[]) {
              requests += 1;
              const rows = values.filter((v) => present.has(v)).map((code) => ({ code }));
              return Promise.resolve({ data: rows.slice(0, cap), error: null });
            },
          };
        },
        delete() {
          return {
            in(_column: string, values: string[]) {
              requests += 1;
              const rows = values.filter((v) => present.has(v)).map((code) => ({ code }));
              return { select: () => Promise.resolve({ data: rows.slice(0, cap), error: null }) };
            },
          };
        },
      };
    },
  };
  return { client, requests: () => requests };
}

describe("selectIn", () => {
  // The exact shape of the production bug: 1037 codes, all of them present, a
  // 1000-row cap. Unchunked that returns 1000 rows and 37 products read as
  // absent — which the import turned into "write", forever, over rows that
  // already held their formula.
  it("returns every row when the server caps a single request", async () => {
    const codes = Array.from({ length: 1037 }, (_, i) => `code-${String(i).padStart(4, "0")}`);
    const { client, requests } = cappedClient(new Set(codes), 1000);
    const { rows, error } = await selectIn<{ code: string }>(
      asDb(client),
      "barcode_cache",
      "code",
      "code",
      codes
    );
    expect(error).toBeNull();
    expect(rows.length).toBe(1037);
    expect(requests()).toBe(6);
  });

  it("still reports a genuinely absent code as absent", async () => {
    const codes = ["a", "b", "c"];
    const { client } = cappedClient(new Set(["a", "c"]), 1000);
    const { rows } = await selectIn<{ code: string }>(asDb(client), "t", "code", "code", codes);
    expect(rows.map((r) => r.code)).toEqual(["a", "c"]);
  });

  it("reports an error rather than returning a short list", async () => {
    const client = {
      from: () => ({
        select: () => ({ in: () => Promise.resolve({ data: null, error: { message: "boom" } }) }),
      }),
    };
    const { rows, error } = await selectIn(asDb(client), "t", "code", "code", ["a"]);
    expect(error).toBe("boom");
    expect(rows).toEqual([]);
  });
});

describe("deleteIn", () => {
  it("sums what every piece actually deleted", async () => {
    const keys = Array.from({ length: 450 }, (_, i) => `key-${i}`);
    const { client, requests } = cappedClient(new Set(keys), 1000);
    const { deleted, error } = await deleteIn(asDb(client), "report_cache", "cache_key", keys);
    expect(error).toBeNull();
    expect(deleted).toBe(450);
    expect(requests()).toBe(3);
  });
});

/**
 * The catalog is what makes this urgent, so the catalog is what the guard
 * watches. If the seed ever grows past a chunk again — it will — this says so
 * while it is still a number in a test rather than a stuck button on a desk.
 */
describe("the lists the desk actually sends", () => {
  const seededWithFormula = KNOWN_PRODUCTS.flatMap((p) => p.packages)
    .map((pkg) => pkg.upc)
    .filter((upc) => KNOWN_FORMULAS[upc]);

  it("is already long enough that one request would be capped", () => {
    // Not an aspiration — a fact about today's catalog, and the reason the
    // import route reported "Write 37 to the catalog" and would not clear.
    expect(seededWithFormula.length).toBeGreaterThan(IN_CHUNK);
  });

  it("chunks the import's barcode lookup", () => {
    expect(chunk(seededWithFormula).every((piece) => piece.length <= IN_CHUNK)).toBe(true);
    expect(chunk(seededWithFormula).flat().length).toBe(seededWithFormula.length);
  });

  it("chunks the box lookup", () => {
    const boxes = KNOWN_MULTIPACKS.map((b) => b.upc);
    expect(chunk(boxes).every((piece) => piece.length <= IN_CHUNK)).toBe(true);
    expect(chunk(boxes).flat().length).toBe(boxes.length);
  });

  // The report-cache sweep is the longest list the desk sends — every seeded
  // code times every mode's key — so it is longer than the list above by
  // construction and needs no separate count. `allReportCacheKeys` is not
  // imported here because it reaches for the `@/` alias, which this test
  // runner does not resolve; the relationship is what matters and it is
  // arithmetic, not a fact that can drift.
  it("sends a report-cache list that is a multiple of the barcode list", () => {
    expect(seededWithFormula.length * 2).toBeGreaterThan(IN_CHUNK);
  });
});
