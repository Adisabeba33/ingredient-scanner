import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";

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
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
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
    .select("code, source, product_name, brands, ingredients_text")
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
    // What is actually stored, so a wrong-language or wrong-product row is
    // visible on the phone instead of having to guess whether a correction
    // landed.
    //
    // This used to be cut to 120 characters — about one line of an ingredient
    // list, which is not enough to decide whether a product needs re-shooting.
    // The dialog that shows it now collapses it for display and can open it,
    // so the cut belongs there, not here. The ceiling is a guard against a
    // pathological row, not a display choice.
    ingredientsPreview:
      typeof data?.ingredients_text === "string"
        ? data.ingredients_text.replace(/\s+/g, " ").trim().slice(0, 4000)
        : null,
  });
}
