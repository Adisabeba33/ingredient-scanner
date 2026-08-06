import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";

/**
 * "That code is a box, not a product."
 *
 * A variety pack carries one barcode outside and a different one on each item
 * inside — a cat food box of three recipes is four codes, and only three of
 * them name something anybody eats. The box has no ingredient list of its own
 * and never will.
 *
 * ── Why marking it beats leaving it unknown ───────────────────────────────
 *
 * Leaving the code out of the catalog is not neutral. An unknown code opens the
 * discovery screen in the app — "photograph the ingredients and this product
 * exists" — and somebody does exactly that, photographing the back of the box,
 * where every member's ingredients are printed one after another. What comes
 * back parses like an ordinary list, fingerprints like one and scores like one,
 * and describes no product on earth. Nothing downstream can catch it, because
 * by every test available it IS an ingredient list.
 *
 * So the row is written on purpose: found = false, reason = multipack. The app
 * answers "that's the box, scan the item inside", the discovery invitation
 * never appears, and the open databases — which do carry variety packs as
 * ordinary products, often with one member's list attached — cannot re-establish
 * it as a product on the next lookup.
 *
 * ── What it refuses ───────────────────────────────────────────────────────
 *
 * A code that already holds a real reading. If a composition is stored under
 * this code, either it is genuinely a product or somebody put the wrong list
 * there, and the second is a correction rather than a re-labelling. Overwriting
 * would silently discard a reading somebody photographed.
 */

export const runtime = "nodejs";

/** More recipes than this in one box is a mistranscription, not a product. */
const MAX_MEMBERS = 24;

interface ExistingRow {
  code: string;
  found: boolean | null;
  source: string | null;
  reason: string | null;
  product_name: string | null;
  ingredients_text: string | null;
  contains: string[] | null;
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: { code?: unknown; productName?: unknown; contains?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const clean = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  if (!clean) {
    return Response.json({ ok: false, reason: "invalid-code" }, { status: 400 });
  }
  const key = canonicalBarcode(clean);
  if (!key) {
    return Response.json({ ok: false, reason: "invalid-code" }, { status: 400 });
  }

  // The box's own name, when the operator has it. Worth storing: the app can
  // then say "Ninja Cat Variety Pack holds several recipes" rather than reciting
  // a barcode back at somebody holding the box.
  const productName =
    typeof body.productName === "string"
      ? body.productName.trim().replace(/\s+/g, " ").slice(0, 120) || null
      : null;

  // What the box holds. Not required — a code marked with no members still
  // stops the app inviting a photograph of the carton, which is the whole point
  // of marking it. With them, the app can offer the three recipes instead of
  // just refusing, which is the point of coming back and adding them.
  //
  // Members are NOT required to exist in the catalog. The operator reads all
  // four codes off the box in one pass, long before the tins are captured, and
  // recording the relation early is what lets the app tell the next person
  // which member is still unread — the person holding that tin.
  const contains: string[] = [];
  for (const raw of Array.isArray(body.contains) ? body.contains : []) {
    const member = sanitizeBarcode(typeof raw === "string" ? raw : "");
    const memberKey = member ? canonicalBarcode(member) : null;
    // The box is never its own member: a carton listing itself would send the
    // chooser straight back to the screen the person is already looking at.
    if (!memberKey || memberKey === key) continue;
    if (!contains.includes(memberKey)) contains.push(memberKey);
    if (contains.length >= MAX_MEMBERS) break;
  }

  let existing: ExistingRow | null = null;
  try {
    const { data, error } = await admin
      .from("barcode_cache")
      .select("code, found, source, reason, product_name, ingredients_text, contains")
      .eq("code", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    existing = data as ExistingRow | null;
  } catch {
    // Never guess on a failed read: writing here without knowing what is under
    // the code is how a real reading gets thrown away.
    return Response.json({ ok: false, reason: "load-failed" }, { status: 503 });
  }

  // An already-marked box is not a no-op: coming back to add the member codes,
  // once the tins have been scanned, is the normal second visit. Only the name
  // and the contents can change, and neither is required.
  const already = existing?.reason === "multipack";

  if (!already && existing?.found && existing.ingredients_text?.trim()) {
    return Response.json(
      {
        ok: false,
        reason: "holds-a-reading",
        // Named so the operator can see what they were about to erase and file
        // a correction instead if it is wrong.
        productName: existing.product_name,
        source: existing.source,
      },
      { status: 409 }
    );
  }

  try {
    const { error } = await admin.from("barcode_cache").upsert(
      {
        code: key,
        found: false,
        reason: "multipack",
        // A box has no composition, no mode and no source — writing any of them
        // would be inventing the product this row exists to deny.
        mode: null,
        source: null,
        ingredients_text: null,
        product_name: productName ?? existing?.product_name ?? null,
        // Written only when this request actually carried members. An upsert
        // always sends every column, so passing the empty list through would
        // let a second visit that adds nothing silently erase what the first
        // one recorded.
        contains: contains.length > 0 ? contains : (existing?.contains ?? null),
        created_at: new Date().toISOString(),
      },
      { onConflict: "code" }
    );
    if (error) throw new Error(error.message);
  } catch (e) {
    return Response.json(
      { ok: false, reason: "save-failed", message: e instanceof Error ? e.message : "" },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    code: key,
    already,
    productName: productName ?? existing?.product_name ?? null,
    contains: contains.length > 0 ? contains : (existing?.contains ?? []),
  });
}

/**
 * Undo the marking.
 *
 * Here because a mark with no way back is a trap: scanning the tin instead of
 * the carton is an easy slip, and a product wrongly declared a box is one the
 * capture route now refuses to write — so without this the mistake would be
 * permanent and the operator would have no idea why the code kept bouncing.
 *
 * Deleting the row rather than editing it returns the code to plain unknown,
 * which is exactly what it was before somebody said otherwise. Only ever
 * touches a row we ourselves marked.
 */
export async function DELETE(req: Request) {
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
  const key = clean ? canonicalBarcode(clean) : null;
  if (!key) {
    return Response.json({ ok: false, reason: "invalid-code" }, { status: 400 });
  }

  const { error } = await admin
    .from("barcode_cache")
    .delete()
    .eq("code", key)
    .eq("reason", "multipack");

  if (error) {
    return Response.json(
      { ok: false, reason: "delete-failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, code: key });
}
