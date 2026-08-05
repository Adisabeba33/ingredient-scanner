import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";

/**
 * "Yes — all of these are one recipe."
 *
 * The answer to a group /api/pack-sizes proposed: several codes already in the
 * catalog carrying the same composition, which nobody has grouped because they
 * were captured before the fingerprint existed.
 *
 * Different from /api/link-size, which writes a NEW code by copying a sibling.
 * Every code here is already in the catalog with its own row; the only thing
 * missing is the statement that they belong together. So nothing is copied and
 * no composition is touched — this records a decision and nothing else.
 *
 * Linking is pairwise against the first code, because that is what `link_recipe`
 * takes, and it is also what makes the group converge: after (a,b) and (a,c),
 * all three share whatever recipe a ended up in, including when b and c already
 * belonged to different groups of their own.
 */

export const runtime = "nodejs";

/** More codes than this in one recipe is a mistake, not a product line. */
const MAX_CODES = 12;

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: { codes?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const raw = Array.isArray(body.codes) ? body.codes : [];
  const codes: string[] = [];
  for (const item of raw) {
    const clean = sanitizeBarcode(typeof item === "string" ? item : "");
    if (!clean) continue;
    const key = canonicalBarcode(clean);
    if (key && !codes.includes(key)) codes.push(key);
    if (codes.length >= MAX_CODES) break;
  }

  if (codes.length < 2) {
    return Response.json({ ok: false, reason: "need-two-codes" }, { status: 422 });
  }

  const [anchor, ...rest] = codes;
  let recipeId: string | null = null;
  const failed: string[] = [];

  for (const other of rest) {
    const { data, error } = await admin.rpc("link_recipe", {
      p_code_a: anchor,
      p_code_b: other,
    });
    if (error || !data) {
      failed.push(other);
      continue;
    }
    recipeId = data as string;
  }

  if (!recipeId) {
    return Response.json(
      { ok: false, reason: "link_failed", failed },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    recipeId,
    linked: codes.filter((c) => !failed.includes(c)),
    // Named rather than swallowed: a code that wouldn't link is usually one
    // that isn't in the catalog at all, and that is worth seeing.
    failed,
  });
}
