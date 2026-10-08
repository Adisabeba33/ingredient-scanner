import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_PRODUCTS } from "../data/known-products";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { canonicalBarcode } from "./barcode";
import { identityCandidates } from "./known-identity";

/**
 * The import route against an in-memory catalog.
 *
 * The verdicts are tested on their own in known-identity.test.ts. This is the
 * wiring: that the press writes what the preview promised, reports the two
 * kinds of write apart, and that the WRITES themselves — not only the
 * decisions before them — cannot land on a reading. The guard that matters
 * most is the one that holds when the catalog changes between the read and
 * the write, and only a fake that applies the filters can show it.
 *
 * Nothing here talks to a database.
 */

type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

/** `a.is.null,b.neq.x,c.not.is.null` — the subset of PostgREST `or` the route uses. */
function parseOr(expr: string): Filter {
  const preds = expr.split(",").map((part) => {
    const m = part.match(/^([a-z_]+)\.(not\.)?(is|eq|neq)\.(.*)$/);
    if (!m) throw new Error(`fake catalog: unsupported or() term ${part}`);
    const [, col, not, op, val] = m;
    const base: Filter =
      op === "is"
        ? (r) => (val === "null" ? r[col] == null : String(r[col]) === val)
        : op === "eq"
          ? (r) => r[col] != null && String(r[col]) === val
          : (r) => r[col] != null && String(r[col]) !== val;
    return not ? (r: Row) => !base(r) : base;
  });
  return (r) => preds.some((p) => p(r));
}

class FakeDb {
  tables = new Map<string, Map<string, Row>>();
  /** Called just before any write runs — how a race is staged. */
  beforeWrite:
    | ((w: { table: string; op: string; payload?: Row | Row[]; opts?: unknown }) => void)
    | null = null;
  writes: { table: string; op: string; opts?: unknown }[] = [];

  table(name: string) {
    let t = this.tables.get(name);
    if (!t) {
      t = new Map();
      this.tables.set(name, t);
    }
    return t;
  }

  from(name: string) {
    return {
      select: (_cols?: string) => new Query(this, name, "select"),
      update: (patch: Row) => new Query(this, name, "update", patch),
      upsert: (payload: Row | Row[], opts?: { ignoreDuplicates?: boolean }) =>
        new Query(this, name, "upsert", payload, opts),
      delete: () => new Query(this, name, "delete"),
    };
  }
}

class Query implements PromiseLike<{ data: Row[] | null; error: null }> {
  private filters: Filter[] = [];
  constructor(
    private db: FakeDb,
    private name: string,
    private op: "select" | "update" | "upsert" | "delete",
    private payload?: Row | Row[],
    private opts?: { ignoreDuplicates?: boolean }
  ) {}
  select() {
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] != null && r[col] === val);
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push((r) => r[col] != null && r[col] !== val);
    return this;
  }
  is(col: string, val: null) {
    this.filters.push((r) => (val === null ? r[col] == null : r[col] === val));
    return this;
  }
  in(col: string, vals: unknown[]) {
    const set = new Set(vals);
    this.filters.push((r) => set.has(r[col]));
    return this;
  }
  or(expr: string) {
    this.filters.push(parseOr(expr));
    return this;
  }
  order() {
    return this;
  }
  limit() {
    return this;
  }
  private run(): { data: Row[] | null; error: null } {
    const t = this.db.table(this.name);
    const match = (r: Row) => this.filters.every((f) => f(r));
    if (this.op === "select") {
      return { data: [...t.values()].filter(match).map((r) => ({ ...r })), error: null };
    }
    this.db.beforeWrite?.({
      table: this.name,
      op: this.op,
      payload: this.payload,
      opts: this.opts,
    });
    this.db.writes.push({ table: this.name, op: this.op, opts: this.opts });
    if (this.op === "delete") {
      const gone = [...t.values()].filter(match);
      for (const r of gone) t.delete(r.code as string);
      return { data: gone, error: null };
    }
    if (this.op === "update") {
      const hit = [...t.values()].filter(match);
      for (const r of hit) Object.assign(r, this.payload);
      return { data: hit.map((r) => ({ ...r })), error: null };
    }
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload!];
    const touched: Row[] = [];
    for (const incoming of rows) {
      const key = (incoming.code ?? incoming.cache_key) as string;
      const held = t.get(key);
      if (held) {
        if (this.opts?.ignoreDuplicates) continue;
        Object.assign(held, incoming);
        touched.push({ ...held });
      } else {
        const fresh = { hits: 0, created_at: "now", ...incoming };
        t.set(key, fresh);
        touched.push({ ...fresh });
      }
    }
    return { data: touched, error: null };
  }
  then<A = { data: Row[] | null; error: null }, B = never>(
    ok?: ((v: { data: Row[] | null; error: null }) => A | PromiseLike<A>) | null,
    fail?: ((e: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return Promise.resolve().then(() => this.run()).then(ok, fail);
  }
}

let db: FakeDb;
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => db,
}));

const TOKEN = "test-token";
const ORIGINAL_TOKEN = process.env.ADMIN_TOKEN;
beforeEach(() => {
  db = new FakeDb();
  process.env.ADMIN_TOKEN = TOKEN;
});
afterEach(() => {
  if (ORIGINAL_TOKEN === undefined) delete process.env.ADMIN_TOKEN;
  else process.env.ADMIN_TOKEN = ORIGINAL_TOKEN;
});

async function call(method: "GET" | "POST", body?: unknown) {
  const { GET, POST } = await import("../app/api/known-products/import/route");
  const req = new Request("http://test/api/known-products/import", {
    method,
    headers: { "x-admin-token": TOKEN, "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const res = await (method === "GET" ? GET(req) : POST(req));
  return { status: res.status, body: (await res.json()) as Record<string, any> };
}

const IDENTITY = identityCandidates(KNOWN_PRODUCTS, (upc) => !!KNOWN_FORMULAS[upc]);
const FORMULA_COUNT = KNOWN_PRODUCTS.flatMap((p) => p.packages).filter(
  (pkg) => !!KNOWN_FORMULAS[pkg.upc]
).length;
const LIST = "Chicken, Chicken Broth, Liver, Meat By-Products, Fish, Salt";

/** A code the seed knows only by name, and one it holds a formula for. */
const identityCode = (i: number) => IDENTITY[i].code;
const formulaCode = canonicalBarcode(
  KNOWN_PRODUCTS.flatMap((p) => p.packages).find((pkg) => !!KNOWN_FORMULAS[pkg.upc])!.upc
);
const catalog = () => db.table("barcode_cache");

describe("GET — the preview counts the two kinds apart", () => {
  it("offers every identity-only package beside the compositions", async () => {
    const { status, body } = await call("GET");
    expect(status).toBe(200);
    expect(body.counts.write).toBe(FORMULA_COUNT);
    expect(body.identity.total).toBe(IDENTITY.length);
    expect(body.identity.write).toBe(IDENTITY.length);
    expect(body.identity.replace).toBe(0);
    // `total` is still the formula count, so "N of M have a composition" holds.
    expect(body.total).toBe(FORMULA_COUNT);
    expect(body.seeded).toBe(FORMULA_COUNT + IDENTITY.length);
  });
});

describe("POST — writing identity-only rows", () => {
  it("writes them, reported apart from the compositions", async () => {
    const { status, body } = await call("POST");
    expect(status).toBe(200);
    expect(body.written).toBe(FORMULA_COUNT);
    expect(body.identity.written).toBe(IDENTITY.length);
    expect(body.identity.replaced).toBe(0);
    expect(body.identity.failed).toBe(0);

    const row = catalog().get(identityCode(0))!;
    expect(row).toMatchObject({
      found: false,
      source: "community",
      mode: "pet",
      reason: "no-ingredients",
      ingredients_text: null,
      composition_key: null,
      product_name: IDENTITY[0].productName,
      brands: IDENTITY[0].brands,
      species: IDENTITY[0].species,
      food_form: IDENTITY[0].foodForm,
    });
    // Inserted with ON CONFLICT DO NOTHING, never as an overwrite.
    expect(
      db.writes.some(
        (w) => w.op === "upsert" && (w.opts as { ignoreDuplicates?: boolean })?.ignoreDuplicates
      )
    ).toBe(true);
  });

  it("does nothing the second time", async () => {
    await call("POST");
    const { body } = await call("GET");
    expect(body.identity.identical).toBe(IDENTITY.length);
    expect(body.identity.write).toBe(0);
    const again = await call("POST");
    expect(again.body.identity.written).toBe(0);
    expect(again.body.identity.replaced).toBe(0);
  });

  it("names a lookup miss and keeps what a shopper left under it", async () => {
    const code = identityCode(1);
    const panel = { proteinMin: 10, fatMin: 5 };
    catalog().set(code, {
      code,
      found: false,
      source: null,
      reason: "no-ingredients",
      product_name: "An open database's name",
      ingredients_text: null,
      guaranteed_analysis: panel,
      hits: 7,
      last_hit_at: "2026-10-01T00:00:00Z",
    });
    const { body } = await call("POST");
    expect(body.identity.replaced).toBe(1);
    const row = catalog().get(code)!;
    expect(row.source).toBe("community");
    expect(row.product_name).toBe(IDENTITY[1].productName);
    expect(row.reason).toBe("no-ingredients");
    // The deposit and the demand survive.
    expect(row.guaranteed_analysis).toEqual(panel);
    expect(row.hits).toBe(7);
    expect(row.last_hit_at).toBe("2026-10-01T00:00:00Z");
  });

  it("never touches a reading, a product row, our photograph or a box", async () => {
    const held: Row[] = [
      { code: identityCode(2), found: true, source: "community", ingredients_text: LIST, product_name: "Shopper's" },
      { code: identityCode(3), found: true, source: "openpetfoodfacts", ingredients_text: LIST, product_name: "OPFF" },
      { code: identityCode(4), found: true, source: "verified", ingredients_text: null, product_name: "Photographed" },
      { code: identityCode(5), found: false, source: null, reason: "multipack", contains: ["1"] },
    ];
    for (const r of held) catalog().set(r.code as string, { ...r });
    const { body } = await call("POST");
    expect(body.identity.held).toBe(held.length);
    for (const r of held) expect(catalog().get(r.code as string)).toEqual(r);
  });

  it("leaves a row alone that gained a reading after it was read", async () => {
    // A lookup miss when the import reads it, somebody's label by the time
    // the update runs. The update's own filter must refuse it.
    const code = identityCode(6);
    catalog().set(code, {
      code,
      found: false,
      source: null,
      reason: "not-found",
      ingredients_text: null,
    });
    let raced = false;
    // Staged at the identity UPDATE itself, after the identity read.
    db.beforeWrite = (w) => {
      const patch = w.payload as Row | undefined;
      if (raced || w.op !== "update" || patch?.reason !== "no-ingredients") return;
      raced = true;
      catalog().set(code, {
        code,
        found: true,
        source: "community",
        reason: null,
        ingredients_text: LIST,
        product_name: "Shopper's reading",
      });
    };
    const { body } = await call("POST");
    expect(body.identity.skipped).toBeGreaterThanOrEqual(1);
    expect(catalog().get(code)).toMatchObject({
      found: true,
      ingredients_text: LIST,
      product_name: "Shopper's reading",
    });
  });

  it("leaves a NEW code alone when a label arrived there first", async () => {
    const code = identityCode(7);
    let raced = false;
    // Staged at the identity INSERT itself, after the identity read.
    db.beforeWrite = (w) => {
      const opts = w.opts as { ignoreDuplicates?: boolean } | undefined;
      if (raced || w.op !== "upsert" || !opts?.ignoreDuplicates) return;
      raced = true;
      catalog().set(code, {
        code,
        found: true,
        source: "community",
        ingredients_text: LIST,
        product_name: "Shopper's reading",
      });
    };
    const { body } = await call("POST");
    expect(body.identity.written).toBe(IDENTITY.length - 1);
    expect(body.identity.skipped).toBe(1);
    expect(catalog().get(code)).toMatchObject({ found: true, ingredients_text: LIST });
  });
});

describe("POST — a seeded formula replaces an identity row", () => {
  it("writes the composition over the name", async () => {
    // As if the code had been identity-only on an earlier press and its
    // formula arrived since.
    catalog().set(formulaCode, {
      code: formulaCode,
      found: false,
      source: "community",
      mode: "pet",
      reason: "no-ingredients",
      ingredients_text: null,
      composition_key: null,
      product_name: "Name only",
      brands: "Brand",
    });
    const { body } = await call("POST");
    expect(body.written).toBe(FORMULA_COUNT);
    const row = catalog().get(formulaCode)!;
    expect(row.found).toBe(true);
    expect(row.reason).toBeNull();
    expect(typeof row.ingredients_text).toBe("string");
    expect((row.ingredients_text as string).length).toBeGreaterThan(0);
  });
});
