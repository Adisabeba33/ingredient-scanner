import type { Presentation, Texture } from "@/lib/presentation";

/**
 * Products we know exist, with the barcode they are sold under — before
 * anybody has scanned one.
 *
 * ── Why this is not in the catalog ────────────────────────────────────────
 *
 * These have no ingredient list, and a `barcode_cache` row without one fails
 * the consumer app's `servableRow()`. That does not mean "ignored": it means
 * the barcode is treated as a recent MISS, and the open databases are not asked
 * again for a week. Filing 27 real products there would make every one of them
 * WORSE than it is now — a shopper scanning a can we had "seeded" would get
 * nothing, where today they at least get whatever Open Food Facts holds.
 *
 * Nor do they belong in `express_capture`. That table means "photographed in a
 * shop, waiting for its composition", and nobody has been anywhere near these
 * tins. Putting them there would show 27 phantom jobs on the desk and make the
 * coverage page claim work that was never done.
 *
 * So they are what they actually are: a LIST OF THINGS TO GO AND FIND. The
 * coverage page shows them as a third state — known, never scanned — which is
 * the thing it could not honestly show before. Until today a brand's untouched
 * ranges were dashed outlines with nothing in them, because we had no idea what
 * was inside a range. Now the ones we know are named, and carry the barcode you
 * will meet on the shelf.
 *
 * ── What has actually been checked ────────────────────────────────────────
 *
 * Every barcode here passes the UPC-A check digit — 27 of 27, which is not
 * something a made-up number does by accident — and every one sits under GS1
 * company prefix 050000, which is Nestlé Purina's. Several were also read off
 * real cans in a shop and matched.
 *
 * That is strong evidence the NUMBERS are real. It is weaker evidence that each
 * number is attached to the exact recipe and size claimed beside it: the source
 * is retailer listings, not the manufacturer, and a listing can pair the right
 * UPC with the wrong flavour. So nothing here is ever written into the catalog
 * as fact. It is used to say "go and look for this", and to name a product the
 * moment its barcode is scanned — at which point the real pack settles it.
 *
 * ── Individual units only ─────────────────────────────────────────────────
 *
 * Every code below is a single can of the stated size. A 24-pack case carries a
 * DIFFERENT barcode and is a different thing on a shelf; giving a case's code to
 * a single tin is the mistake the source document warns about, and none of these
 * are cases. Pack sizes of one recipe live together under `packages`, which is
 * how the shelf works: one recipe, several barcodes.
 */

export interface KnownPackage {
  /** Net weight exactly as printed. */
  size: string;
  container: "can" | "pouch" | "tray" | "bag" | "box";
  /**
   * As printed under the bars — 12 digits for a UPC-A, kept as a STRING.
   * `canonicalBarcode()` pads it to GTIN-14 for storage, which is also what
   * makes the leading-zero question moot: "050000429943" and "0050000429943"
   * are the same key.
   */
  upc: string;
  /** A single retail unit, not a case or a variety pack. */
  scope: "individual_unit";
}

export interface KnownProduct {
  brand: string;
  /** The range within the brand, matching data/us-pet-brands.ts. */
  line: string;
  /** What distinguishes this pack from its siblings — the name minus the range. */
  variant: string;
  species: "cat" | "dog";
  /** What it is cut or shaped into. Never what it is suspended in. */
  texture: Texture;
  /** What it is suspended in. Never a texture. See lib/presentation.ts. */
  presentation: Presentation;
  foodForm: "wet" | "dry";
  /** The named protein(s), normalised: what the pack sells itself on. */
  proteins: string[];
  packages: KnownPackage[];
}

const CAN = "can" as const;
const UNIT = "individual_unit" as const;

export const KNOWN_PRODUCTS: KnownProduct[] = [
  // ── Fancy Feast · Classic Pâté ─────────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Chicken Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429943", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Tender Liver & Chicken Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["liver", "chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429042", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Turkey & Giblets Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey", "giblets"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429844", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Tender Beef & Liver Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef", "liver"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429141", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Tender Beef & Chicken Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef", "chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429745", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Tender Beef Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429547", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Ocean Whitefish & Tuna Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429646", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Savory Salmon Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000429448", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Salmon & Shrimp Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "shrimp"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000103867", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Classic Pâté",
    variant: "Cod, Sole & Shrimp Feast",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["cod", "sole", "shrimp"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000428946", scope: UNIT }],
  },

  // ── Fancy Feast · Gravy Lovers ─────────────────────────────────────────
  //
  // The source calls the texture "grilled / small bites"; recorded as chunks,
  // which is what the tin holds. The gravy is the PRESENTATION and is kept out
  // of the texture on purpose — that separation is the whole point of these two
  // columns (see lib/presentation.ts).
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Chicken Feast in Grilled Chicken Flavor Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000578450", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Beef Feast in Roasted Beef Flavor Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000578474", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Ocean Whitefish & Tuna Feast",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000578436", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Salmon Feast in Fish Flavor Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000578412", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Turkey Feast in Roasted Turkey Flavor Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000580040", scope: UNIT }],
  },

  // ── Friskies · Shreds ──────────────────────────────────────────────────
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Salmon in Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000572014", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Chicken in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000571987", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Beef in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000103645", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Ocean Whitefish & Tuna in Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000103683", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "Chicken & Salmon Dinner in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "salmon"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000445691", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "Turkey & Cheese Dinner in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey", "cheese"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000412204", scope: UNIT }],
  },

  // ── Friskies · Pâté ────────────────────────────────────────────────────
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Turkey & Giblets Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey", "giblets"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000421848", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Liver & Chicken Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["liver", "chicken"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000420445", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Mixed Grill",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: [],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000421541", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Salmon Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000423347", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Ocean Whitefish & Tuna Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000424948", scope: UNIT }],
  },

  // ── Friskies · Extra Gravy ─────────────────────────────────────────────
  //
  // Filed under "Extra Gravy", the range name in data/us-pet-brands.ts. The
  // source writes it "Extra Gravy Chunky", which is the range plus the texture
  // — and the texture has its own column.
  {
    brand: "Friskies",
    line: "Extra Gravy",
    variant: "Chunky With Beef in Savory Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "extra_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000293315", scope: UNIT }],
  },
];
