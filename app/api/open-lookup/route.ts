import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import {
  OPEN_SOURCES,
  OPEN_SOURCE_HOST,
  assessOpenHit,
  pickOpenHit,
  type OpenHit,
  type OpenSource,
} from "@/lib/open-lookup";

/**
 * "Do the open databases already have this?" — asked in the shop, before any
 * photographs are taken.
 *
 * Reads only. Nothing here writes to our catalog, deliberately: the consumer
 * app already falls back to these databases on its own, so copying their answer
 * into our table would add no answer while freezing a stale snapshot at a trust
 * rank it hasn't earned. See lib/open-lookup.ts for the whole argument.
 *
 * What it buys is the decision to walk on. A product Open Food Facts already
 * describes properly is one the app can already answer, and photographing it
 * costs a capture, a model call and a minute of somebody's afternoon for
 * nothing. A product with a stub or nothing at all is exactly what this catalog
 * is for.
 *
 * Gated by ADMIN_TOKEN, like everything else in this tool.
 */

export const runtime = "nodejs";

const FIELDS = ["code", "product_name", "brands", "ingredients_text"].join(",");
const USER_AGENT = "ingredient.help catalog scanner - contact via github";

async function queryOne(
  source: OpenSource,
  code: string
): Promise<OpenHit | null> {
  const url = `https://${OPEN_SOURCE_HOST[source]}/api/v2/product/${code}.json?fields=${FIELDS}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      // Somebody is standing in an aisle waiting for this. A database that
      // hasn't answered in seven seconds has effectively answered "no".
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        brands?: string;
        ingredients_text?: string;
      };
    };
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    return {
      source,
      productName: p.product_name?.trim() || null,
      brands: p.brands?.trim() || null,
      ingredientsText: p.ingredients_text?.trim() || null,
    };
  } catch {
    // Timeout, network, bad JSON — all mean "this database doesn't have it",
    // which is the safe direction: the worst it costs is a capture we didn't
    // strictly need.
    return null;
  }
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const clean = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  if (!clean) return Response.json({ error: "bad-barcode" }, { status: 422 });
  const code = canonicalBarcode(clean);

  // All three at once: a product lives in one of them, so asking in sequence
  // would spend three timeouts to learn what one round trip can.
  const results = await Promise.all(
    OPEN_SOURCES.map((source) => queryOne(source, code))
  );
  const hits = results.filter((h): h is OpenHit => h !== null);
  const hit = pickOpenHit(hits);

  return Response.json({
    code,
    hit,
    // Which databases answered at all, so "not found" can be told apart from
    // "all three timed out on a bad connection".
    answered: hits.map((h) => h.source),
    ...assessOpenHit(hit),
  });
}
