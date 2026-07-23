import {
  sanitizeBarcode,
  canonicalBarcode,
  type ScanMode,
} from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractLabel } from "@/lib/extract";

/**
 * Process ONE captured product: read its label photos with Claude vision and
 * write the composition into the SHARED catalog (spec §6).
 *
 * The browser drives "Process all" by POSTing pending products here one at a
 * time (photos as data URLs). For each product we:
 *   1. Send the ingredients photo (+ brand photo) to Claude vision → the exact
 *      `ingredients_text`, plus product_name / brands.
 *   2. If the ingredients photo didn't read cleanly, return a FAILURE so the
 *      owner re-shoots only that one — we never write a partial/invented list.
 *   3. Otherwise write ONE `verified` row per barcode (all pack sizes of the
 *      recipe) under `canonicalBarcode(code)`, upserting on `code`.
 *
 * On a 200 { ok: true } the browser deletes the product's photos from its
 * queue. Photos are never stored server-side — they exist only in the request.
 *
 * Gated by ADMIN_TOKEN (x-admin-token), same as ingredients.help's admin routes.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MODES: ScanMode[] = ["human", "pet", "cosmetics"];

interface VerifiedRow {
  code: string;
  found: true;
  source: "verified";
  mode: ScanMode;
  ingredients_text: string;
  product_name: string | null;
  brands: string | null;
  image_url: null;
  reason: null;
  created_at: string;
}

export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return Response.json({ error: "admin_not_configured" }, { status: 501 });
  }
  if ((req.headers.get("x-admin-token") ?? "") !== adminToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "extractor_not_configured" }, { status: 501 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    barcodes?: unknown;
    mode?: unknown;
    photos?: { brand?: unknown; ingredients?: unknown };
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Canonicalize + dedupe the barcodes. Each valid code becomes one verified row.
  const rawCodes = Array.isArray(body.barcodes) ? body.barcodes : [];
  const bad: string[] = [];
  const codes: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawCodes) {
    const clean = sanitizeBarcode(typeof raw === "string" ? raw : "");
    if (!clean) {
      bad.push(String(raw ?? ""));
      continue;
    }
    const key = canonicalBarcode(clean);
    if (!seen.has(key)) {
      seen.add(key);
      codes.push(key);
    }
  }
  if (codes.length === 0) {
    return Response.json(
      { ok: false, reason: "no-valid-barcode", bad },
      { status: 422 }
    );
  }

  const ingredientsImage =
    typeof body.photos?.ingredients === "string" ? body.photos.ingredients : "";
  if (!ingredientsImage) {
    return Response.json(
      { ok: false, reason: "no-ingredients-photo" },
      { status: 422 }
    );
  }
  const brandImage =
    typeof body.photos?.brand === "string" ? body.photos.brand : null;

  const mode: ScanMode = MODES.includes(body.mode as ScanMode)
    ? (body.mode as ScanMode)
    : "pet";

  const model = process.env.EXTRACT_MODEL || "claude-haiku-4-5";

  // ── Read the label ────────────────────────────────────────────────────────
  let extraction;
  let usage;
  try {
    const result = await extractLabel({
      apiKey,
      model,
      ingredientsImage,
      brandImage,
    });
    extraction = result.extraction;
    usage = result.usage;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, reason: "llm_error", message }, { status: 502 });
  }

  // The ingredients photo didn't read cleanly → report it, write nothing.
  if (!extraction.ingredients_readable || extraction.ingredients_text.length < 12) {
    return Response.json({
      ok: false,
      reason: "unreadable-ingredients",
      product_name: extraction.product_name,
      usage,
    });
  }

  // ── One verified row per pack-size code ──────────────────────────────────
  const now = new Date().toISOString();
  const rows: VerifiedRow[] = codes.map((code) => ({
    code,
    found: true,
    source: "verified",
    mode,
    ingredients_text: extraction.ingredients_text,
    product_name: extraction.product_name,
    brands: extraction.brands,
    image_url: null,
    reason: null,
    created_at: now,
  }));

  // verified is the top-ranked source, so upserting on `code` always wins and a
  // re-run is an idempotent refresh — never buries a better row.
  const { error } = await admin
    .from("barcode_cache")
    .upsert(rows, { onConflict: "code" });
  if (error) {
    return Response.json(
      { ok: false, reason: "write_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    codes,
    product_name: extraction.product_name,
    brands: extraction.brands,
    ingredients_text: extraction.ingredients_text,
    usage,
  });
}
