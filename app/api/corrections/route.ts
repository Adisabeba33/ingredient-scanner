import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allReportCacheKeys } from "@/lib/report-cache-key";

/**
 * The correction review queue.
 *
 * Users can't change a verified entry — a reading that disagrees with one is
 * filed as a proposal by the consumer app instead. This is where those are
 * decided, and approving is the only route from a shopper's photo into the
 * catalog.
 *
 * GET  — proposals awaiting a decision, most-reported first: several people
 *        reporting the same change is the strongest sign a recipe really moved.
 * POST — { id, action: "approve" | "reject" }.
 *
 * Reads the shared database directly, like the rest of this tool, rather than
 * calling the consumer app. Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

const LIMIT = 50;

export async function GET(req: Request) {
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

  const { data, error } = await admin
    .from("catalog_corrections")
    .select(
      "id, code, mode, current_text, proposed_text, product_name, verdict, verdict_note, reports, created_at"
    )
    .eq("status", "pending")
    .order("reports", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({ pending: data ?? [] });
}

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

  let body: { id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action =
    body.action === "approve"
      ? "approve"
      : body.action === "reject"
        ? "reject"
        : null;
  if (!id || !action) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data: row, error: readErr } = await admin
    .from("catalog_corrections")
    .select("id, code, proposed_text, status")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !row) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (row.status !== "pending") {
    return Response.json({ error: "already_reviewed" }, { status: 409 });
  }

  if (action === "approve") {
    // The recipe really changed, so the verified row is corrected in place —
    // the entry stays ours, it just now says the right thing.
    const { error: writeErr } = await admin
      .from("barcode_cache")
      .update({
        ingredients_text: row.proposed_text as string,
        created_at: new Date().toISOString(),
      })
      .eq("code", row.code as string)
      .eq("source", "verified");
    if (writeErr) {
      return Response.json(
        { error: "write_failed", message: writeErr.message },
        { status: 500 }
      );
    }

    // The stored report describes the OLD composition and lives under a
    // separate key, so it survives the update unless dropped here.
    try {
      await admin
        .from("report_cache")
        .delete()
        .in("cache_key", allReportCacheKeys(row.code as string));
    } catch {
      /* best-effort — the composition is corrected either way */
    }
  }

  const { error: markErr } = await admin
    .from("catalog_corrections")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (markErr) {
    return Response.json(
      { error: "update_failed", message: markErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, action, code: row.code });
}
