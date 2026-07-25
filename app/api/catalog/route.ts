import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Browse what's actually in the shared catalog.
 *
 * The capture flow is write-only, so when a row looks wrong in the consumer app
 * there's no way to tell whether a correction landed, went to a different
 * barcode, or never ran — you end up guessing. This lists the verified rows with
 * their stored ingredient text, so the truth is visible on the phone.
 *
 * Searches by product name / brand, or by barcode digits. Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

const LIMIT = 25;

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

  let body: { q?: unknown; countOnly?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  /** How many verified rows we hold, without transferring any of them. */
  const countVerified = async () => {
    const { count } = await admin
      .from("barcode_cache")
      .select("code", { count: "exact", head: true })
      .eq("source", "verified");
    return count ?? 0;
  };

  // The panel shows the catalog size before it's opened, so support asking for
  // just the number rather than pulling 25 rows of ingredient text for it.
  if (body.countOnly === true) {
    return Response.json({ totalCodes: await countVerified(), results: [] });
  }

  const raw = typeof body.q === "string" ? body.q.trim() : "";
  // PostgREST's or= grammar is comma/paren delimited and ilike treats % and _
  // as wildcards — strip both so a query can't break out or match everything.
  const q = raw.replace(/[,()'"\\%_]/g, " ").replace(/\s+/g, " ").trim();

  let query = admin
    .from("barcode_cache")
    .select("code, product_name, brands, ingredients_text, mode, created_at")
    .eq("source", "verified")
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (q.length >= 2) {
    const digits = q.replace(/\D+/g, "");
    query =
      digits.length >= 4
        ? query.ilike("code", `%${digits}%`)
        : query.or(`product_name.ilike.%${q}%,brands.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return Response.json(
      { error: "list_failed", message: error.message },
      { status: 500 }
    );
  }

  // The catalog size, independent of the current search. Counts BARCODES,
  // which is what a row is — one recipe legitimately has several (6/15/30 lb
  // bags), so it isn't the same as a count of distinct products.
  return Response.json({
    totalCodes: await countVerified(),
    results: (data ?? []).map((row) => ({
      code: row.code as string,
      productName: (row.product_name as string | null) ?? null,
      brands: (row.brands as string | null) ?? null,
      mode: (row.mode as string | null) ?? null,
      ingredientsText: (row.ingredients_text as string | null) ?? null,
    })),
  });
}
