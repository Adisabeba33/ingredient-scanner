import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { extractIdentity } from "@/lib/extract-identity";
import { isScanMode, resolveCaptureMode } from "@/lib/capture-mode";
import { photoPathFor, decodeDataUrl } from "@/lib/express";
import type { ScanMode } from "@/lib/barcode";

/**
 * Process ONE express capture: a barcode and a photograph of the front, taken
 * in about two seconds in a shop.
 *
 * ── What it deliberately does not do ──────────────────────────────────────
 *
 * Write to `barcode_cache`. An express capture has no ingredient list, and a
 * row without one fails the consumer app's `servableRow()` — which does not
 * mean "skipped", it means the barcode is treated as a recent miss and the open
 * databases are not asked again for a week. Filing unfinished work in the
 * serving table would make those products worse than before anybody
 * photographed them. So it lands in `express_capture`, a worklist nothing but
 * this scanner reads, and MOVES across when the composition is typed in at a
 * desk (see /api/express/finish).
 *
 * ── Two copies of one photograph ──────────────────────────────────────────
 *
 * The browser sends the good copy (1600px) and a small one (900px). The model
 * reads the good copy — the net weight is the smallest print on a pack and the
 * first casualty of compression — and only the small one is stored. The good
 * copy never touches the bucket.
 *
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "product-photos";

/** The worklist, oldest first — the order somebody works through it. */
export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const { data, error } = await admin
    .from("express_capture")
    .select(
      "code, capture_group, mode, brands, product_name, variant, net_weight, container, photo_path, read_error, captured_at"
    )
    .order("captured_at", { ascending: true })
    .limit(200);
  if (error) {
    return Response.json(
      { error: "list_failed", message: error.message },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  return Response.json({
    rows: rows.map((r) => ({
      code: r.code as string,
      // Older rows predate the column; a row is its own group by default.
      captureGroup: (r.capture_group as string | null) ?? (r.code as string),
      mode: (r.mode as string | null) ?? null,
      brands: (r.brands as string | null) ?? null,
      productName: (r.product_name as string | null) ?? null,
      variant: (r.variant as string | null) ?? null,
      netWeight: (r.net_weight as string | null) ?? null,
      container: (r.container as string | null) ?? null,
      photoPath: (r.photo_path as string | null) ?? null,
      // Resolved here rather than in the browser: the bucket name is a server
      // detail, and it can change without touching the screen.
      photoUrl: r.photo_path
        ? admin.storage.from(BUCKET).getPublicUrl(r.photo_path as string).data
            .publicUrl
        : null,
      readError: (r.read_error as string | null) ?? null,
      capturedAt: (r.captured_at as string | null) ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "extractor_not_configured" }, { status: 501 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    /** Every pack-size code for this product. One photo, several shelf codes. */
    barcodes?: unknown;
    mode?: unknown;
    /** The copy the model reads. Not stored. */
    readPhoto?: unknown;
    /** The copy that is kept. */
    storePhoto?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Every code, canonicalised and deduped — a recipe sold as a 3 kg bag and a
  // 12 kg bag is one photograph and two shelf codes, and dropping the second
  // would silently lose half the trip.
  const rawCodes = Array.isArray(body.barcodes) ? body.barcodes : [];
  const codes: string[] = [];
  for (const raw of rawCodes) {
    const clean = sanitizeBarcode(typeof raw === "string" ? raw : "");
    if (!clean) continue;
    const key = canonicalBarcode(clean);
    if (!codes.includes(key)) codes.push(key);
  }
  if (codes.length === 0) {
    return Response.json({ ok: false, reason: "no-valid-barcode" }, { status: 422 });
  }
  // The first code names the group and the photograph. Arbitrary but stable,
  // and it means a product with one code needs no special case.
  const code = codes[0];

  const readPhoto = typeof body.readPhoto === "string" ? body.readPhoto : "";
  const storePhoto =
    typeof body.storePhoto === "string" ? body.storePhoto : readPhoto;
  if (!readPhoto) {
    return Response.json({ ok: false, reason: "no-photo" }, { status: 422 });
  }

  const picked: ScanMode = isScanMode(body.mode) ? body.mode : "pet";
  const model = process.env.EXTRACT_MODEL || "claude-haiku-4-5";

  // ── Read the front ────────────────────────────────────────────────────────
  let identity;
  let usage;
  try {
    const result = await extractIdentity({ apiKey, model, frontImage: readPhoto });
    identity = result.identity;
    usage = result.usage;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, reason: "llm_error", message }, { status: 502 });
  }

  // The pack decides what kind of product this is, exactly as it does for a
  // full capture — same rule, same module.
  const mode = resolveCaptureMode(picked, identity.category).mode;

  // ── Keep the small copy ───────────────────────────────────────────────────
  //
  // Before the row, so a row never points at a photograph that isn't there. A
  // failed upload is not fatal: the identity is the valuable part and the desk
  // can still finish the product from the name and the weight.
  let photoPath: string | null = null;
  let photoError: string | null = null;
  try {
    const decoded = decodeDataUrl(storePhoto);
    if (decoded) {
      const path = photoPathFor(code, decoded.extension);
      const { error } = await admin.storage
        .from(BUCKET)
        .upload(path, decoded.bytes, {
          contentType: decoded.contentType,
          // A re-capture of the same product replaces its picture rather than
          // leaving two, since the row can only point at one.
          upsert: true,
        });
      if (error) photoError = error.message;
      else photoPath = path;
    } else {
      photoError = "The photo wasn't a readable data URL.";
    }
  } catch (err) {
    photoError = err instanceof Error ? err.message : String(err);
  }

  // ── The worklist row ──────────────────────────────────────────────────────
  const readError = [
    identity.unreadable.length > 0
      ? `Couldn't read: ${identity.unreadable.join(", ")}.`
      : null,
    photoError ? `Photo not stored: ${photoError}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  // One row per code, all carrying the same reading and the same photograph.
  // That mirrors the catalog, which stores a row per barcode too — pack sizes
  // are separate products on a shelf even when they are one recipe.
  const now = new Date().toISOString();
  const { error } = await admin.from("express_capture").upsert(
    codes.map((c) => ({
      code: c,
      capture_group: code,
      mode,
      brands: identity.brands,
      product_name: identity.product_name,
      variant: identity.variant,
      net_weight: identity.net_weight,
      container: identity.container,
      photo_path: photoPath,
      read_error: readError || null,
      captured_at: now,
    })),
    { onConflict: "code" }
  );
  if (error) {
    return Response.json(
      { ok: false, reason: "write_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    code,
    codes,
    mode,
    ...identity,
    photoStored: photoPath !== null,
    usage,
  });
}
