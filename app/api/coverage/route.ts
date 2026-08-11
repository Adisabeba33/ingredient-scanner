import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { isUsableIngredients } from "@/lib/ingredients-text";
import type { CoverageSource } from "@/lib/coverage";

/**
 * Everything we hold, flattened into rows the coverage page can group.
 *
 * ── Why it reads BOTH tables ──────────────────────────────────────────────
 *
 * A product photographed in a shop this morning is in `express_capture` and
 * not in the catalog yet. Standing in the same shop tomorrow, "have I done
 * this?" has to answer YES for it, or the trip gets repeated. So the worklist
 * counts as coverage — at a different stage, not at zero.
 *
 * ── Read-only, on purpose ─────────────────────────────────────────────────
 *
 * Nothing here writes, deletes or edits. It is still behind ADMIN_TOKEN
 * because it is the whole catalog and this tool is admin-only, but there is no
 * second confirmation on it: the password guards destruction, and looking at
 * your own work is not destruction.
 *
 * ── Rows, not products ────────────────────────────────────────────────────
 *
 * One recipe in three bag sizes is three rows here and one product on the
 * page. The merging happens in `buildCoverage`, where it can be tested —
 * see lib/coverage.ts.
 */

export const runtime = "nodejs";

/**
 * How many catalog rows to look at.
 *
 * The whole catalog, up to a ceiling, because a coverage page that quietly
 * stopped at the first thousand would say "untouched" about brands with
 * products in them — the exact lie the page exists to prevent. When the ceiling
 * IS hit, the page says so out loud rather than looking complete.
 */
const SCAN_CAP = 6000;

/** PostgREST caps a single response; walk the table rather than trusting one call. */
const PAGE = 1000;

/** Read a table in pages until it runs out or the cap is reached. */
async function readAll(
  admin: SupabaseClient,
  table: string,
  columns: string,
  order: string
): Promise<{ rows: Record<string, unknown>[]; truncated: boolean; error: string | null }> {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; from < SCAN_CAP; from += PAGE) {
    const { data, error } = await admin
      .from(table)
      .select(columns)
      .order(order, { ascending: false })
      .range(from, Math.min(from + PAGE, SCAN_CAP) - 1);
    if (error) return { rows, truncated: false, error: error.message };
    const page = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < PAGE) return { rows, truncated: false, error: null };
  }
  return { rows, truncated: true, error: null };
}

export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  // The columns added after the first release only exist once the matching
  // migration has been run by hand, and asking for one missing column fails the
  // WHOLE select. Same fallback as /api/catalog: come back with less rather
  // than reporting an empty catalog about a full one.
  const FULL =
    "code, brands, product_name, ingredients_text, found, species, food_form, source";
  const BASE = "code, brands, product_name, ingredients_text, found, source";
  let catalog = await readAll(admin, "barcode_cache", FULL, "created_at");
  let missingColumns = false;
  if (catalog.error) {
    const retry = await readAll(admin, "barcode_cache", BASE, "created_at");
    if (!retry.error) {
      catalog = retry;
      missingColumns = true;
    }
  }
  if (catalog.error) {
    return Response.json(
      { error: "list_failed", message: catalog.error },
      { status: 500 }
    );
  }

  // The worklist may not exist yet — supabase/express_capture.sql is applied by
  // hand. A missing table is not an error worth failing the page over; it means
  // Express hasn't been set up, and the catalog half is still worth showing.
  const express = await readAll(
    admin,
    "express_capture",
    "code, brands, product_name, product_line, variant, species, food_form",
    "captured_at"
  );

  const rows: CoverageSource[] = [];

  for (const row of catalog.rows) {
    // A miss — a barcode somebody looked up and nothing was found for. It is
    // not a product and must not read as one; the shelf still has it to do.
    if (row.found === false) continue;
    rows.push({
      code: row.code as string,
      brands: (row.brands as string | null) ?? null,
      productName: (row.product_name as string | null) ?? null,
      species: (row.species as string | null) ?? null,
      foodForm: (row.food_form as string | null) ?? null,
      origin: (row.source as string | null) ?? null,
      // The composition is what "done" means. A row without one is a row
      // somebody still has to finish, whoever supplied it.
      state: isUsableIngredients(row.ingredients_text as string | null)
        ? "filled"
        : "photo",
      place: "catalog",
    });
  }

  for (const row of express.rows) {
    rows.push({
      code: row.code as string,
      brands: (row.brands as string | null) ?? null,
      productName: (row.product_name as string | null) ?? null,
      productLine: (row.product_line as string | null) ?? null,
      variant: (row.variant as string | null) ?? null,
      species: (row.species as string | null) ?? null,
      foodForm: (row.food_form as string | null) ?? null,
      origin: "express",
      state: "photo",
      place: "worklist",
    });
  }

  return Response.json({
    rows,
    // Said out loud rather than assumed: a page that silently stopped counting
    // would look like a finished map of an unfinished catalog.
    truncated: catalog.truncated || express.truncated,
    missingColumns,
    // Null when the worklist is there. A message means Express Mode's table
    // hasn't been created yet, which is worth showing once rather than being
    // read as "no captures pending".
    worklistUnavailable: express.error,
  });
}
