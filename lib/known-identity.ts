import { canonicalBarcode } from "./barcode";
import { isVeterinaryDiet } from "./vet-diet";
import { detectNutritionRole } from "./nutrition-role";
import type { IdentityFields } from "./known-import";
import type { KnownProduct } from "../data/known-products";

/**
 * The seeded packages that have NO formula, flattened to catalog rows that say
 * "known product, composition pending".
 *
 * Pure: the route hands it the seed, so a test can hand it a small one. The
 * rules about WHEN such a row may be written live in lib/known-import.ts
 * (`identityVerdict`); this file only says what the row is.
 */

/**
 * Range and flavour, joined the way the formula rows join them.
 *
 * Shared with the formula import rather than repeated, because the day the two
 * spell one tin differently is the day the formula that later replaces an
 * identity row renames the product under the shopper's feet.
 */
export function seededProductName(product: Pick<KnownProduct, "line" | "variant">): string {
  return [product.line, product.variant].filter(Boolean).join(" ").trim();
}

export interface IdentityCandidate extends IdentityFields {
  code: string;
  /** As printed under the bars, for the operator's screen. */
  printed: string;
  /** Same evidence and same function as the formula rows; see the route. */
  requiresVet: boolean;
  nutritionRole: ReturnType<typeof detectNutritionRole>;
}

/**
 * Every seeded package without a formula.
 *
 * `hasFormula` is asked with the code as printed, the way KNOWN_FORMULAS is
 * keyed. Boxes never reach here: they live in data/known-multipacks.ts and are
 * not packages of any product.
 */
export function identityCandidates(
  products: readonly KnownProduct[],
  hasFormula: (upc: string) => boolean
): IdentityCandidate[] {
  const out: IdentityCandidate[] = [];
  const seen = new Set<string>();
  for (const product of products) {
    for (const pkg of product.packages) {
      if (hasFormula(pkg.upc)) continue;
      const code = canonicalBarcode(pkg.upc);
      // One row per code. The seed holds no duplicates (a test says so), but
      // an upsert carrying one code twice fails the whole batch.
      if (!code || seen.has(code)) continue;
      seen.add(code);
      out.push({
        code,
        printed: pkg.upc,
        productName: seededProductName(product),
        brands: product.brand,
        species: product.species,
        // The seed's own value, whatever vocabulary it is in. This module
        // makes no food-form decision; it carries the one the seed made.
        foodForm: product.foodForm,
        requiresVet: isVeterinaryDiet(product.brand, product.line, product.variant),
        nutritionRole: detectNutritionRole({
          parts: [product.brand, product.line, product.variant],
        }),
      });
    }
  }
  return out;
}

/**
 * The row itself.
 *
 * ── What it carries ───────────────────────────────────────────────────────
 *
 * Everything a formula row carries that identity alone establishes: the name,
 * the brand, the species, the food form, and the two judgements read off the
 * range name (`requires_vet`, `nutrition_role`) — the consumer report reads
 * both the moment somebody contributes the label, and a renal diet should not
 * be judged as an everyday food for want of a column the seed could fill.
 *
 * ── What it deliberately does not ─────────────────────────────────────────
 *
 * No ingredients, no composition key, no panel, no moisture: nothing was read.
 * `food_form_confirmed` stays unset — "confirmed" means two independent signals
 * agreed, and the range name is one. `image_url`, `hits`, `nutrition`,
 * `guaranteed_analysis` and `created_at` are not sent at all, so an update
 * never erases a panel a shopper deposited under the code, or its search
 * history, and an insert takes the table's defaults.
 *
 * `found: false` and `reason: 'no-ingredients'` — see `IdentityVerdict` in
 * lib/known-import.ts for why that is the shape and not `found: true`.
 */
export function identityRow(c: IdentityCandidate) {
  return {
    code: c.code,
    found: false,
    // Same standing as the seeded formulas: a manufacturer's or retailer's
    // record, not our photograph. It is also the mark that says "ours".
    source: "community",
    mode: "pet",
    brands: c.brands,
    product_name: c.productName,
    species: c.species,
    food_form: c.foodForm,
    nutrition_role: c.nutritionRole === "unknown" ? null : c.nutritionRole,
    requires_vet: c.requiresVet,
    ingredients_text: null,
    composition_key: null,
    reason: "no-ingredients",
  };
}
