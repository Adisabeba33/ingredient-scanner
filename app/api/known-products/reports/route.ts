import { canonicalBarcode, sanitizeBarcode } from "@/lib/barcode";
import { deleteIn } from "@/lib/chunked-in";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { KNOWN_PRODUCTS } from "@/data/known-products";

/**
 * Throw away the stored reports for particular products.
 *
 * ── Why not the existing "clear them all" ─────────────────────────────────
 *
 * ingredients.help has an admin action that empties `report_cache` outright.
 * That is the right tool after a change to how every report is written; it is
 * the wrong one here, because emptying it makes every product anybody opens
 * rebuild from scratch, and rebuilding is what costs money.
 *
 * A change that affects a handful of products should clear a handful of rows.
 *
 * ── Clearing is not deleting a report ─────────────────────────────────────
 *
 * Nothing is lost. A report is a document generated FROM the stored
 * ingredients, and the ingredients stay where they are. The next reader waits
 * a few seconds and gets one written against whatever the catalog holds now —
 * which is the entire point when the catalog has just learned something the old
 * report was written without.
 *
 * Defaults to the seeded products, which is the batch whose reports go stale
 * whenever data/known-formulas.ts changes. Explicit codes override that.
 *
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

/** Every barcode in the seeded batch, canonicalised. */
function seededCodes(): string[] {
  const codes: string[] = [];
  for (const product of KNOWN_PRODUCTS) {
    for (const pkg of product.packages) {
      const key = canonicalBarcode(pkg.upc);
      if (!codes.includes(key)) codes.push(key);
    }
  }
  return codes;
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let requested: unknown = null;
  try {
    requested = ((await req.json()) as { codes?: unknown }).codes ?? null;
  } catch {
    /* no body means "the seeded batch" */
  }

  let codes: string[];
  if (Array.isArray(requested)) {
    codes = [];
    for (const raw of requested) {
      const clean = sanitizeBarcode(typeof raw === "string" ? raw : "");
      if (!clean) continue;
      const key = canonicalBarcode(clean);
      if (!codes.includes(key)) codes.push(key);
    }
    if (codes.length === 0) {
      return Response.json({ error: "no-valid-barcode" }, { status: 422 });
    }
  } else {
    codes = seededCodes();
  }

  // Every mode's key for each code: the report may have been generated while
  // the product was filed as something else, and a key we don't delete is a
  // stale report that keeps being served.
  const keys = codes.flatMap((c) => allReportCacheKeys(c));

  // Chunked. Asked in one request this is the longest list in the desk — every
  // seeded code times every mode — and PostgREST would have capped it silently,
  // reporting a smaller number cleared than it actually deleted. See
  // lib/chunked-in.ts.
  const { deleted, error } = await deleteIn(admin, "report_cache", "cache_key", keys);
  if (error) {
    return Response.json({ error: "clear_failed", message: error }, { status: 500 });
  }

  return Response.json({
    ok: true,
    products: codes.length,
    // Usually far fewer than `products`: only the ones somebody had opened.
    cleared: deleted,
  });
}
