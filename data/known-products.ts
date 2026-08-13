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
  /**
   * `tub` is the Fancy Feast Petites twin-serve pot — two 1.4 oz halves under
   * ONE retail barcode. The size below is the whole package, which is what the
   * code is on; the calorie statement in the formula is per half, which is what
   * the pack states. Neither is wrong and they are not the same number.
   */
  container: "can" | "pouch" | "tray" | "tub" | "bag" | "box";
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
const TUB = "tub" as const;
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

  // ══ Batch 002 — identity only, no formulas ═══════════════════════════════
  //
  // These arrived with ingredient lists that had been NORMALISED rather than
  // copied: "mineral premix [potassium, zinc, iron…]" where the tin prints
  // "Minerals [Potassium Chloride, Zinc Sulfate, Ferrous Sulfate…]", and
  // "vitamin premix [B1, E, B3…]" for the spelled-out vitamin block.
  //
  // Measured on one list written both ways, the paraphrase costs the report
  // half of what it can read: 4 recognised additives fall to 2 (Potassium
  // Chloride and Riboflavin disappear), 37 recognised foods fall to 15, and
  // unreadable tokens go from 1 to 7. It also breaks duplicate detection,
  // because `composition_key` is built from the words — a later photograph of
  // the real tin would not match its own seeded row.
  //
  // Expanding the premixes back would be writing lines onto somebody else's
  // label. So the IDENTITY is seeded — every field below is reliable, and it
  // extends the "go and find this" list from 27 products to 40, each with the
  // barcode to look for — and the compositions wait for verbatim text. The
  // import route skips a product with no formula by design.

  // ── Fancy Feast · Grilled ──────────────────────────────────────────────
  //
  // "Grilled" is the range, so the texture field carries what the tin holds —
  // pieces — rather than repeating the cooking method already in the line name.
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Chicken Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000040803", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Beef Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000040704", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Turkey Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000040605", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Salmon Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000503896", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Seafood Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    // "Ocean fish" as the source wrote it, not folded into "whitefish": they
    // are different words on different tins and guessing they mean one thing
    // is how two products become one.
    proteins: ["ocean fish", "shrimp"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000572168", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Chicken & Beef Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "beef"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000102167", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Salmon & Shrimp Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon", "shrimp"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000102068", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Grilled",
    variant: "Liver & Chicken Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["liver", "chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000100866", scope: UNIT }],
  },

  // ── Friskies · Prime Filets ────────────────────────────────────────────
  {
    brand: "Friskies",
    line: "Prime Filets",
    variant: "With Chicken in Gravy",
    species: "cat",
    texture: "filets",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000170180", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Prime Filets",
    variant: "Turkey Dinner in Gravy",
    species: "cat",
    texture: "filets",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000225224", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Prime Filets",
    variant: "Chicken & Tuna Dinner in Gravy",
    species: "cat",
    texture: "filets",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000100446", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Prime Filets",
    variant: "With Ocean Whitefish & Tuna in Sauce",
    species: "cat",
    texture: "filets",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000170166", scope: UNIT }],
  },

  // ── Friskies · Tasty Treasures ─────────────────────────────────────────
  //
  // The source notes retailers also shelve this one as "Tasty Treasures Prime
  // Filets". Filed under the range the pack prints; if the shelf turns out to
  // disagree, a scan will say so and the coverage page will show it under
  // whichever range it really carries.
  {
    brand: "Friskies",
    line: "Tasty Treasures",
    // The full printed name, with the liver in it. Two things ride on that:
    // Prime Filets also sells a "With Chicken in Gravy", and the source warns
    // this barcode is NOT the Chicken & Cheese variety it is sometimes listed as.
    variant: "With Chicken in Gravy (With Liver)",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "liver"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000577965", scope: UNIT }],
  },

  // ── Fancy Feast · Delights With Cheddar ────────────────────────────────
  //
  // Cheddar is named on the front and is in the deck, so it is listed among
  // the proteins: it is what the tin sells itself on beside the meat, and a
  // shopper looking for "the cheese ones" is looking for exactly this.
  {
    brand: "Fancy Feast",
    line: "Delights With Cheddar",
    variant: "Grilled Chicken & Cheddar Cheese Feast in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "cheddar cheese"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000579310", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Delights With Cheddar",
    variant: "Grilled Turkey & Cheddar Cheese Feast in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey", "cheddar cheese"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000579334", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Delights With Cheddar",
    variant: "Grilled Whitefish & Cheddar Cheese Feast in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["whitefish", "cheddar cheese"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000579358", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Delights With Cheddar",
    variant: "Grilled Tuna & Cheddar Cheese Feast in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna", "cheddar cheese"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000579280", scope: UNIT }],
  },

  // ── Fancy Feast · Savory Centers ───────────────────────────────────────
  //
  // A pâté with a pocket of gravy in the middle of it, which is why these
  // carry `gravy_center` rather than `in_gravy`: nothing is suspended in
  // anything, and a tin you would pour off is a different object on a shelf.
  {
    brand: "Fancy Feast",
    line: "Savory Centers",
    variant: "Pâté With Chicken and a Gourmet Gravy Center",
    species: "cat",
    texture: "pate",
    presentation: "gravy_center",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000172733", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Savory Centers",
    variant: "Pâté With Salmon and a Gourmet Gravy Center",
    species: "cat",
    texture: "pate",
    presentation: "gravy_center",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000172757", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Savory Centers",
    variant: "Pâté With Tuna and a Gourmet Gravy Center",
    species: "cat",
    texture: "pate",
    presentation: "gravy_center",
    foodForm: "wet",
    proteins: ["tuna"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000172771", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Savory Centers",
    variant: "Pâté With Beef and a Gourmet Gravy Center",
    species: "cat",
    texture: "pate",
    presentation: "gravy_center",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000172801", scope: UNIT }],
  },

  // ── Friskies · Meaty Bits ──────────────────────────────────────────────
  {
    brand: "Friskies",
    line: "Meaty Bits",
    variant: "With Beef in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000423149", scope: UNIT }],
  },

  // ── Friskies · Meaty Bits (continued) ──────────────────────────────────
  {
    brand: "Friskies",
    line: "Meaty Bits",
    variant: "Gourmet Grill in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    // The deck names "Poultry" and nothing more specific. Left as the pack
    // leaves it rather than resolved into chicken and turkey.
    proteins: ["poultry"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000420544", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Meaty Bits",
    variant: "Chicken Dinner in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000421947", scope: UNIT }],
  },

  // ── Friskies · Pâté (continued) ────────────────────────────────────────
  //
  // Two of these are named after the sea rather than after what is in them:
  // "Mariner's Catch" and "Sea Captain's Choice" both lead with meat
  // by-products and put fish third. The variant keeps the pack's own name —
  // that is what somebody is looking for on a shelf — and `proteins` keeps
  // what the deck actually lists.
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Poultry Platter",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["poultry"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000423644", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Chicken & Tuna Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000424443", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Mariner's Catch",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["fish"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000425044", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Sea Captain's Choice",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["fish"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000425648", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Pâté",
    variant: "Country Style Dinner",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000423248", scope: UNIT }],
  },

  // ── Friskies · Prime Filets (continued) ────────────────────────────────
  {
    brand: "Friskies",
    line: "Prime Filets",
    variant: "With Salmon & Beef in Sauce",
    species: "cat",
    texture: "filets",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "beef"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000100422", scope: UNIT }],
  },

  // ── Friskies · Tasty Treasures (continued) ─────────────────────────────
  //
  // Both carry a scallop flavouring that is named separately on the deck and
  // is not one of the proteins the pack sells itself on. It stays in the
  // ingredient list, where it is, and out of here.
  {
    brand: "Friskies",
    line: "Tasty Treasures",
    variant: "With Ocean Fish & Tuna in Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    // "Ocean fish" as the deck writes it, not folded into "whitefish".
    proteins: ["ocean fish", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000577972", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Tasty Treasures",
    variant: "With Chicken & Tuna in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000577958", scope: UNIT }],
  },

  // ── Friskies · Extra Gravy (continued) ─────────────────────────────────
  //
  // The source writes the range as "Extra Gravy Paté". Same range as the
  // Chunky above it — Extra Gravy is what the tin says, and paté is the
  // texture, which has its own column.
  {
    brand: "Friskies",
    line: "Extra Gravy",
    variant: "Paté With Tuna in Savory Gravy",
    species: "cat",
    texture: "pate",
    presentation: "extra_gravy",
    foodForm: "wet",
    proteins: ["tuna"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000168781", scope: UNIT }],
  },

  // ── Fancy Feast · Kitten ───────────────────────────────────────────────
  //
  // The only life-stage range in the seed so far. It lives in `line` because
  // that is where the shelf puts it — "Fancy Feast Kitten" is the range name
  // on the front — and because nothing else here has a life-stage column to
  // put it in. Both decks also guarantee a calcium minimum, which the panel
  // type has no field for; see the note in data/known-formulas.ts.
  {
    brand: "Fancy Feast",
    line: "Kitten",
    variant: "Tender Turkey Feast Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000575008", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Kitten",
    variant: "Tender Ocean Whitefish Feast Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["whitefish"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000574988", scope: UNIT }],
  },

  // ── Fancy Feast · Petites ──────────────────────────────────────────────
  //
  // Twin-serve tubs: 2.8 oz under one barcode, eaten as two 1.4 oz halves.
  // The size here is the package the code is on. Getting that backwards is
  // the same class of mistake as using a case code for a single tin — and one
  // of these has a case code circulating, noted below.
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Grilled Chicken Entrée With Rice in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002597", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Seared Salmon Entrée With Spinach in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002504", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Ocean Whitefish Entrée With Tomato in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["whitefish"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002528", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Roasted Turkey Entrée With Sweet Potato in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002610", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Tender Beef Entrée With Carrots in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    // NOT 050000504299. That code is a case of these tubs, it passes its own
    // check digit, and it is circulating on pack listings — which is exactly
    // what makes it dangerous: nothing about the number itself says it is the
    // wrong object.
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002603", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Braised Chicken Entrée Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000002580", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Petites",
    variant: "Ocean Whitefish & Tuna Entrée Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["whitefish", "tuna"],
    packages: [{ size: "2.8 oz", container: TUB, upc: "050000001590", scope: UNIT }],
  },

  // ── Fancy Feast · Flaked ───────────────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Flaked",
    variant: "Tuna & Mackerel Feast",
    species: "cat",
    texture: "flaked",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna", "mackerel"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000426249", scope: UNIT }],
  },
];
