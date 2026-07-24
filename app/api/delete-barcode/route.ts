import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allReportCacheKeys } from "@/lib/report-cache-key";

/**
 * Remove a row from the shared catalog — the undo for a bad capture that already
 * made it in (e.g. the French ingredient column got photographed instead of the
 * English one, so the stored "composition" is unreadable to the app).
 *
 * Deliberately deletes only VERIFIED rows: those are ours to withdraw. An open
 * database / community row isn't the scanner's to remove, and deleting it would
 * just make the consumer app re-fetch it anyway.
 *
 * After deleting, re-capture the product normally and process it again.
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return Response.json({ error: "admin_not_configured" }, { status: 501 });
  }
  if ((req.headers.get("x-admin-token") ?? "") !== adminToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const clean = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  if (!clean) {
    return Response.json({ error: "bad-barcode" }, { status: 422 });
  }
  const key = canonicalBarcode(clean);

  const { data, error } = await admin
    .from("barcode_cache")
    .delete()
    .eq("code", key)
    .eq("source", "verified")
    .select("code");
  if (error) {
    return Response.json(
      { error: "delete_failed", message: error.message },
      { status: 500 }
    );
  }

  // Withdraw the cached report too — it was generated from the ingredients we
  // just removed, and lives under a separate key that nothing else clears. The
  // product's mode isn't known here, so clear every mode's key.
  let reportsCleared = 0;
  try {
    const { data: cleared } = await admin
      .from("report_cache")
      .delete()
      .in("cache_key", allReportCacheKeys(key))
      .select("cache_key");
    reportsCleared = cleared?.length ?? 0;
  } catch {
    /* best-effort */
  }

  return Response.json({
    code: key,
    deleted: (data?.length ?? 0) > 0,
    reports_cleared: reportsCleared,
  });
}
