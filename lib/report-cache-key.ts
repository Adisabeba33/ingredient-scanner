import { createHash } from "node:crypto";
import { canonicalBarcode } from "@/lib/barcode";

/**
 * Report-cache key — MUST match ingredients.help's `app/api/report/route.ts`:
 *
 *   sha256(`barcode:v2:${mode}:${canonicalBarcode(code)}`)
 *
 * The consumer app caches a generated report under this key, keyed by the
 * barcode so a repeat scan reuses it for free. That cache is INDEPENDENT of
 * `barcode_cache`: rewriting a product's ingredients does not invalidate the
 * report built from the OLD ingredients, so a correction would keep serving the
 * stale analysis forever unless we clear it here too.
 *
 * Keep in sync with that route (same small, stable contract as the barcode
 * helpers in lib/barcode.ts). The version moved to v2 when the report's shape
 * changed — clearing a v1 key would delete nothing, because nothing reads it.
 */
export type ReportMode = "human" | "pet" | "cosmetics";

export const REPORT_MODES: ReportMode[] = ["human", "pet", "cosmetics"];

export function reportCacheKey(code: string, mode: ReportMode): string {
  const keySource = `barcode:v2:${mode}:${canonicalBarcode(code)}`;
  return createHash("sha256").update(keySource).digest("hex");
}

/** Every mode's key for a code — used when the mode isn't known (deletion). */
export function allReportCacheKeys(code: string): string[] {
  return REPORT_MODES.map((m) => reportCacheKey(code, m));
}
