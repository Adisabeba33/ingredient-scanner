import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * "Is this barcode already ours?" — a fast pre-capture check so several people
 * scanning in parallel don't all re-capture the same product. Given a scanned
 * code, look up the shared catalog under its canonical key and report whether a
 * row already exists (and whether it's a verified one).
 *
 * The client uses this to warn "already in the catalog — try another product"
 * the moment a code is read, before any photos are taken. Gated by ADMIN_TOKEN.
 *
 * Note: this only knows about rows already WRITTEN. A product still sitting in
 * someone else's pending queue (captured but not processed) isn't visible here —
 * that live case is out of scope for a stateless check.
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
    .select("code, source, product_name, brands")
    .eq("code", key)
    .maybeSingle();
  if (error) {
    return Response.json(
      { error: "lookup_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    code: key,
    exists: !!data,
    // "verified" = our own authoritative row. A bare open-DB/community row (if
    // any) is NOT a reason to skip — the whole point is to capture verified.
    verified: data?.source === "verified",
    source: data?.source ?? null,
    productName: data?.product_name ?? null,
    brands: data?.brands ?? null,
  });
}
