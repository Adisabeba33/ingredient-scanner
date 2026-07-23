import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-only writes into the SHARED catalog
 * (the same `barcode_cache` table ingredients.help reads). It bypasses
 * row-level security, so it must NEVER be imported into client code — only
 * used inside server routes.
 *
 * Returns null when the URL or service-role key isn't configured, so callers
 * can return a clean "not configured" instead of throwing.
 *
 * Copied from ingredients.help (`lib/supabase/admin.ts`).
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
