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
  /**
   * `canister` is the rigid screw-top tub Party Mix is sold in at 20 and 30 oz,
   * beside the same recipe in a 2.1 and 6 oz foil pouch. Not a `tub`, which
   * here means the Petites twin-serve pot of wet food, and not a `bag`.
   */
  container: "can" | "pouch" | "tray" | "tub" | "bag" | "box" | "canister";
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
  /**
   * Who the pack is fed to, where the deck says.
   *
   * Absent means the deck did not state one, which is most of them — an
   * ordinary adult food usually just says "maintenance of adult cats" in the
   * AAFCO statement and nothing on the front, and inferring "adult" from
   * silence would turn an absence into a claim.
   *
   * ── Why this is a field and not part of the range name ────────────────
   *
   * Fancy Feast Kitten carries it in `line`, correctly: "Kitten" IS the range
   * on the front of the tin. Two other cases cannot be written that way, and
   * both were losing the information until this existed. Gourmet Naturals
   * sells a kitten paté INSIDE an otherwise adult range, so the range name
   * says nothing about it. And the Friskies Shreds Whitefish & Sardines deck
   * is approved for kitten growth AND adult maintenance in a range where
   * everything else is adult — a property of the formula, not of the shelf.
   *
   * Getting this wrong is not cosmetic. A kitten food fed as an adult food is
   * a real mistake, and it is the sort a catalog quietly causes by having
   * nowhere to put the distinction.
   *
   * `senior` arrived with Fancy Feast Senior 7+, which — like Fancy Feast
   * Kitten — puts the stage in the range name. It is a field value anyway: the
   * next senior formula to turn up inside an otherwise adult range will need
   * somewhere to go, and that is exactly how the kitten case went.
   */
  lifeStage?: "kitten" | "adult" | "senior" | "all";
  packages: KnownPackage[];
}

const CAN = "can" as const;
const TUB = "tub" as const;
const BOX = "box" as const;
const BAG = "bag" as const;
const POUCH = "pouch" as const;
const CANISTER = "canister" as const;
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
    lifeStage: "kitten",
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
    lifeStage: "kitten",
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

  // ── Fancy Feast · Gems ─────────────────────────────────────────────────
  //
  // A 4 oz box holding two moulded 2 oz mousses, under one retail barcode.
  // The size is the box, because that is what the code is on; the calorie
  // statement in the formula is per GEM, because that is what the deck states.
  //
  // Target lists the Turkey as "4.9 oz/2pk". It is wrong, and the pack settles
  // it without needing a shop: at 930 kcal/kg a 2.45 oz gem would be 64.6 kcal
  // and the deck prints 52, which is a 2 oz gem to within a rounding. The
  // calorie statement is a second measurement of the net weight, and it agrees
  // with Purina rather than with the retailer.
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Beef and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    proteins: ["beef"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000544073", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Chicken and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    proteins: ["chicken"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000544035", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Salmon and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    proteins: ["salmon"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000544059", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Tuna and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    proteins: ["tuna"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000544097", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Turkey and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    proteins: ["turkey"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000589968", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gems",
    variant: "Mousse Pâté With Ocean Fish and a Halo of Savory Gravy",
    species: "cat",
    texture: "mousse",
    presentation: "gravy_halo",
    foodForm: "wet",
    // "Ocean fish" as the deck writes it, not folded into "whitefish".
    proteins: ["ocean fish"],
    packages: [{ size: "4 oz", container: BOX, upc: "050000593019", scope: UNIT }],
  },

  // ── Friskies · Farm Favorites ──────────────────────────────────────────
  //
  // Two of these are "Meaty Bits", which is ALSO a Friskies range of its own —
  // three products of it are above. Here it is the texture inside Farm
  // Favorites, and it goes in the texture column where it belongs; filing them
  // under the Meaty Bits range because the words match would merge two shelves.
  {
    brand: "Friskies",
    line: "Farm Favorites",
    variant: "Pâté With Chicken & Carrots",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "carrots"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000501335", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Farm Favorites",
    variant: "Pâté With Salmon & Spinach",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "spinach"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000501359", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Farm Favorites",
    variant: "Meaty Bits With Turkey & Carrots in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey", "carrots"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000501397", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Farm Favorites",
    variant: "Meaty Bits With Whitefish & Spinach in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["whitefish", "spinach"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000501373", scope: UNIT }],
  },

  // ── Friskies · Ocean Favorites ─────────────────────────────────────────
  {
    brand: "Friskies",
    line: "Ocean Favorites",
    variant: "Pâté With Salmon, Brown Rice & Peas",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "brown rice", "peas"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000503667", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Ocean Favorites",
    variant: "Pâté With Tuna, Brown Rice & Peas",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna", "brown rice", "peas"],
    // NOT 050000503650, which is the case. It passes its own check digit.
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000503636", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Ocean Favorites",
    variant: "Meaty Bits With Tuna, Crab & Brown Rice in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "crab", "brown rice"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000503612", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Ocean Favorites",
    variant: "Meaty Bits With Salmon, Shrimp & Brown Rice in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "shrimp", "brown rice"],
    // 5.5 oz, against the source's instruction to file this as 5.4 — and the
    // pack's own arithmetic is the reason. The deck we copied prints 967
    // kcal/kg and 150 kcal/can: 967 x 5.5 oz is 150.8, 967 x 5.4 oz is 148.0.
    // The calorie statement is a second measurement of the net weight and it
    // says 5.5. Purina's page saying 5.4 is a downsizing in progress, not a
    // correction to this deck, and storing 5.4 beside a 5.5 oz calorie line
    // would make our own record contradict itself. Named in the formula note
    // and flagged for a physical re-read.
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000503681", scope: UNIT }],
  },

  // ── Friskies · Wild Favorites ──────────────────────────────────────────
  //
  // "Mini Bites" is filed as `bits`, the same texture as Meaty Bits. They are
  // different sizes of the same idea and the vocabulary has one word for it;
  // inventing a second would split a shelf on the strength of an adjective.
  {
    brand: "Friskies",
    line: "Wild Favorites",
    variant: "Mini Bites With Wild Caught Cod & Kale in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["cod", "kale"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000543274", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Wild Favorites",
    variant: "Mini Bites With Wild Caught Tuna & Sweet Potato in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "sweet potato"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000543311", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Wild Favorites",
    variant: "Mini Bites With Wild Caught Haddock & Sweet Potato in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["haddock", "sweet potato"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000543250", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Wild Favorites",
    variant: "Mini Bites With Wild Caught Sardines & Kale in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["sardines", "kale"],
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000543298", scope: UNIT }],
  },

  // ── Friskies · Shreds (continued) ──────────────────────────────────────
  //
  // The Whitefish & Sardines deck covers kitten growth AND adult maintenance,
  // in a range where everything else is adult. `lifeStage: "all"` is what that
  // is; see the field's note above for why it is not in the range name.
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Whitefish & Sardines in Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["whitefish", "sardines"],
    lifeStage: "all",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000579907", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Shreds",
    variant: "With Turkey & Giblets in Gravy",
    species: "cat",
    texture: "shredded",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey", "giblets"],
    // NOT 050000579938 — that is the 24-can case, and it passes its own
    // check digit exactly as this one does.
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000579921", scope: UNIT }],
  },

  // ── Fancy Feast · Medleys ──────────────────────────────────────────────
  //
  // Three sub-ranges under one name — Florentine in a light broth, Tuscany in
  // a savory sauce, Primavera in a silky broth — filed under the range the
  // brand list knows, with the style in the variant. `presentation` keeps them
  // apart where it matters: a broth and a sauce predict different thickeners.
  //
  // The four Florentines carry a live disagreement about artificial colour.
  // See data/known-formulas.ts; the decks are stored as they read.
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken Florentine With Spinach in a Light Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["chicken", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000570188", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Turkey Florentine With Spinach in a Light Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["turkey", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000570348", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Tuna Florentine With Spinach in a Light Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["tuna", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000572199", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Wild Salmon Florentine With Spinach in a Light Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["salmon", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000570492", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken Tuscany With Long Grain Rice & Spinach in a Savory Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "long grain rice", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000573660", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Tender Turkey Tuscany With Long Grain Rice & Spinach in a Savory Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["turkey", "long grain rice", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000573646", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Tuna Tuscany With Long Grain Rice & Spinach in a Savory Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "long grain rice", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000573622", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken Primavera With Tomatoes, Carrots & Spinach in a Silky Broth",
    species: "cat",
    texture: "flaked",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["chicken", "tomatoes", "carrots", "spinach"],
    // The BROTH version. There is a separate White Meat Chicken Primavera
    // PATÉ under 050000962648 — a different texture, a different formula and a
    // different product record. It is not seeded here, and this code must
    // never be given to it or the other way round.
    packages: [{ size: "3 oz", container: CAN, upc: "050000574582", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Tuna Primavera With Tomatoes, Carrots & Spinach in a Silky Broth",
    species: "cat",
    texture: "flaked",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["tuna", "tomatoes", "carrots", "spinach"],
    packages: [{ size: "3 oz", container: CAN, upc: "050000574605", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Tender Turkey Primavera With Tomatoes, Carrots & Spinach in a Silky Broth",
    species: "cat",
    texture: "flaked",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["turkey", "tomatoes", "carrots", "spinach"],
    // NOT 050000574537, which turns up in case and multipack listings. Unlike
    // the other case codes here it has not been confirmed as one — the source
    // calls it a candidate — so it is kept off the single can either way.
    packages: [{ size: "3 oz", container: CAN, upc: "050000574520", scope: UNIT }],
  },

  // ── Fancy Feast · Gourmet Naturals ─────────────────────────────────────
  //
  // The range that made `lifeStage` necessary: a kitten paté sits inside it,
  // between nine adult recipes, and the range name says nothing about which is
  // which. Two textures share the range too — paté and cuts in gravy — so the
  // texture column carries the whole of that distinction.
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Wild Alaskan Salmon Recipe (Kitten)",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    lifeStage: "kitten",
    packages: [{ size: "3 oz", container: CAN, upc: "050000502585", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Wild Alaskan Salmon Recipe",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172108", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural White Meat Chicken Recipe in Gravy",
    species: "cat",
    texture: "cuts",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172832", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Beef Recipe",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172146", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural White Meat Chicken Recipe",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172085", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Trout & Tuna Recipe",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["trout", "tuna"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172122", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Beef Recipe in Gravy",
    species: "cat",
    texture: "cuts",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172887", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Wild Alaskan Salmon & Shrimp Recipe in Gravy",
    species: "cat",
    texture: "cuts",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon", "shrimp"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000172856", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural Ocean Whitefish Recipe",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["whitefish"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000502677", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Naturals",
    variant: "Natural White Meat Chicken & Beef Recipe in Gravy",
    species: "cat",
    texture: "cuts",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "beef"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000502622", scope: UNIT }],
  },

  // ── Fancy Feast · Medleys (continued) ──────────────────────────────────
  //
  // A fourth sub-range under Medleys, and the first pork in the seed. The
  // three "in savory juices" decks carry no gums at all, which is why they are
  // `in_water` and not `in_gravy` — see the note in lib/presentation.ts.
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Beef Ragú Recipe With Tomatoes & Pasta in a Savory Sauce",
    species: "cat",
    texture: "shredded",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["beef", "tomatoes", "pasta"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000659951", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Beef & Pork Milanese Recipe With Potatoes & Carrots in Savory Juices",
    species: "cat",
    texture: "shredded",
    presentation: "in_water",
    foodForm: "wet",
    proteins: ["beef", "pork", "potatoes", "carrots"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000660018", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    // PORK, not beef. Target's metadata says "Barbacoa Beef Flavor"; the deck
    // and Purina's own description say pork, and the list leads with pork
    // broth and pork. Filed under what the deck says.
    variant: "Pork Barbacoa Recipe With Rice, Tomatoes & Carrots in Savory Juices",
    species: "cat",
    texture: "minced",
    presentation: "in_water",
    foodForm: "wet",
    proteins: ["pork", "rice", "tomatoes", "carrots"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000191024", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Beef Carne Asada Recipe With Potatoes & Carrots in Savory Juices",
    species: "cat",
    texture: "minced",
    presentation: "in_water",
    foodForm: "wet",
    proteins: ["beef", "potatoes", "carrots"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000186341", scope: UNIT }],
  },

  // ── Friskies · Fully Load'd ────────────────────────────────────────────
  //
  // All three lead with water, chicken and wheat gluten — the flavour the pack
  // is named after arrives eighth, after the corn starch. That is not a
  // complaint, it is what the order says, and it is exactly the sort of thing
  // the printed list on the scan screen exists to show.
  {
    brand: "Friskies",
    line: "Fully Load'd",
    variant: "With Chicken, Carrots, Tomatoes & Spinach in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "carrots", "tomatoes", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000239726", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Fully Load'd",
    variant: "With Tuna, Rice, Spinach & Tomatoes in Sauce",
    species: "cat",
    texture: "chunks",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "rice", "spinach", "tomatoes"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000236091", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Fully Load'd",
    variant: "With Salmon, Wild Rice, Carrots & Spinach in Sauce",
    species: "cat",
    texture: "chunks",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "wild rice", "carrots", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000241200", scope: UNIT }],
  },

  // ── Friskies · Glaz'd & Infuz'd ────────────────────────────────────────
  //
  // Filed as `in_gravy`. A glaze is gravy on the outside of the pieces rather
  // than a bath they sit in, but unlike the Gems halo and the Savory Centers
  // filling — which are geometrically different objects — it predicts exactly
  // what a gravy predicts, and these decks prove it: xanthan gum AND locust
  // bean gum on all three. The range name carries the distinction; the
  // presentation vocabulary does not need a fourth kind of gravy for a
  // spelling.
  {
    brand: "Friskies",
    line: "Glaz'd & Infuz'd",
    variant: "With Gravy Glaz'd Chicken",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "carrots", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000351428", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Glaz'd & Infuz'd",
    variant: "With Gravy Glaz'd Crab",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["crab", "tomatoes", "carrots"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000348053", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Glaz'd & Infuz'd",
    variant: "With Gravy Glaz'd Shrimp",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["shrimp", "tomatoes", "carrots"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000342143", scope: UNIT }],
  },

  // ── Fancy Feast · Medleys · Shredded Fare ──────────────────────────────
  //
  // 14% minimum protein, the highest in the seed, on a 78% moisture can. Two
  // of the four are all-life-stages decks — a kitten formula sitting between
  // two adult ones under one range name, which is what `lifeStage` is for.
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Shredded Wild Salmon Fare With Spinach in a Savory Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["salmon", "chicken", "spinach"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000570515", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Shredded White Meat Chicken Fare With Spinach in a Savory Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["chicken", "turkey", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000570195", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Shredded Turkey Fare With Spinach in a Savory Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["turkey", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000570386", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Shredded Tuna Fare With Spinach in a Savory Broth",
    species: "cat",
    texture: "shredded",
    presentation: "in_broth",
    foodForm: "wet",
    proteins: ["tuna", "chicken", "spinach"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000570584", scope: UNIT }],
  },

  // ── Fancy Feast · Medleys · Paté ───────────────────────────────────────
  //
  // The Chicken Primavera Paté is the product that spent three batches on the
  // do-not-file list in data/wrong-barcodes.ts. It was correctly identified —
  // 050000962648 IS the paté and not the silky-broth version — and the right
  // conclusion was never "avoid this code", it was "these are two tins". Now
  // its deck has arrived and both are seeded, which is a stronger guarantee
  // than one of them being forbidden.
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken Florentine Pâté With Cheese & Spinach",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "whitefish", "cheese", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000962600", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken Primavera Pâté With Tomatoes, Carrots & Spinach",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "fish", "tomatoes", "carrots", "spinach"],
    lifeStage: "adult",
    // The paté. Its silky-broth namesake is 050000574582, seeded above.
    packages: [{ size: "3 oz", container: CAN, upc: "050000962648", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Wild Salmon Primavera Pâté With Tomatoes, Carrots & Spinach",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "turkey", "fish", "tomatoes", "carrots", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000962662", scope: UNIT }],
  },

  // ── Fancy Feast · Medleys · French sauces ──────────────────────────────
  //
  // Velouté, béchamel and demi-glace are three named French sauces and, for
  // this field, three sauces: `in_sauce` on all of them. Naming a value after
  // each would split a shelf on the strength of a menu.
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Wild Alaskan Salmon With Carrots & Spinach in a Creamy Velouté Sauce",
    species: "cat",
    texture: "cuts",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "chicken", "whitefish", "carrots", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000503285", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "Ocean Whitefish With Carrots & Spinach in a Creamy Béchamel Sauce",
    species: "cat",
    texture: "cuts",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["whitefish", "chicken", "carrots", "spinach", "cheese"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000503339", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Medleys",
    variant: "White Meat Chicken With Carrots & Spinach in a Demi-Glace",
    species: "cat",
    texture: "cuts",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "turkey", "carrots", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000503315", scope: UNIT }],
  },

  // ── Fancy Feast · Gravy Lovers (continued) ─────────────────────────────
  //
  // All three carry a case candidate a digit or two away from the single tin —
  // see data/wrong-barcodes.ts. That is now three ranges in a row where the
  // source has caught one, which is worth reading as the norm rather than as
  // an oddity.
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Chicken & Beef Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "beef"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000292639", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Chicken Hearts & Liver Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    // Chicken Hearts and Chicken Liver are named organs, distinct from the
    // generic "liver" that most of these decks list. Both are kept.
    proteins: ["chicken", "chicken hearts", "chicken liver"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000292615", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Gravy Lovers",
    variant: "Salmon & Sole Feast in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon", "sole", "chicken"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000292592", scope: UNIT }],
  },

  // ── Fancy Feast · Marinated Morsels ────────────────────────────────────
  //
  // Added Color on all five, and Red 3 named on two. No webpage contradicts
  // these, so they carry no conflict note — they are simply coloured foods.
  {
    brand: "Fancy Feast",
    line: "Marinated Morsels",
    variant: "Chicken Feast in Gravy",
    species: "cat",
    texture: "morsels",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "turkey"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000259007", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Marinated Morsels",
    variant: "Beef Feast in Gravy",
    species: "cat",
    texture: "morsels",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef", "fish"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000235100", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Marinated Morsels",
    variant: "Salmon Feast in Gravy",
    species: "cat",
    texture: "morsels",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["salmon", "chicken"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000513338", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Marinated Morsels",
    variant: "Tuna Feast in Gravy",
    species: "cat",
    texture: "morsels",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna", "chicken"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000397983", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Marinated Morsels",
    variant: "Turkey Feast in Gravy",
    species: "cat",
    texture: "morsels",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000405398", scope: UNIT }],
  },

  // ── Fancy Feast · Sliced ───────────────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Sliced",
    variant: "Chicken Hearts & Liver Feast in Gravy",
    species: "cat",
    texture: "slices",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "chicken hearts", "chicken liver"],
    lifeStage: "adult",
    // Shares its whole name with the Gravy Lovers tin above. Different range,
    // different texture, different deck — and a good reason to read the range
    // before assuming two products with one name are one product.
    packages: [{ size: "3 oz", container: CAN, upc: "050000434640", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Sliced",
    variant: "Beef Feast in Gravy",
    species: "cat",
    texture: "slices",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["beef", "fish", "poultry"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000426348", scope: UNIT }],
  },

  // ── Fancy Feast · Creamy Delights ──────────────────────────────────────
  //
  // The first ten products in this file that did not come from a batch pasted
  // into a chat. They were researched into research/deep-research-barcodes.json
  // on a separate branch, checked against the same rules, and promoted here.
  // Both of these carry milk, which is what the range is named for.
  {
    brand: "Fancy Feast",
    line: "Creamy Delights",
    variant: "Chicken Feast With a Touch of Real Milk in a Creamy Sauce",
    species: "cat",
    texture: "pate",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "milk"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000168248", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Creamy Delights",
    variant: "Tuna Feast With a Touch of Real Milk in a Creamy Sauce",
    species: "cat",
    texture: "morsels",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "chicken", "milk"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000168262", scope: UNIT }],
  },

  // ── Friskies · Indoor ──────────────────────────────────────────────────
  //
  // A range of its own, not the "Indoor Delights" or "Indoor Health" already in
  // the brand list. All four carry powdered cellulose high up — an insoluble
  // fibre for hairball control — which is why their maximum fibre runs 2.4 to
  // 2.75% where the rest of the file sits at 1 to 1.5.
  {
    brand: "Friskies",
    line: "Indoor",
    variant: "Pâté Chicken Dinner With Garden Greens",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "rice", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000574001", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Indoor",
    variant: "Chunky Chicken & Turkey Casserole With Garden Greens in Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken", "turkey", "rice", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000573950", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Indoor",
    variant: "Meaty Bits Saucy Seafood Bake With Garden Greens in Sauce",
    species: "cat",
    texture: "bits",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["ocean fish", "chicken", "rice", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000574100", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Indoor",
    variant: "Flaked Ocean Whitefish Dinner With Garden Greens in Sauce",
    species: "cat",
    texture: "flaked",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["ocean whitefish", "poultry", "rice", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000574124", scope: UNIT }],
  },

  // ── Friskies · Extra Gravy (continued) ─────────────────────────────────
  //
  // Three more Chunky, taking the range from two products to five. All three
  // barcodes come from Target pages that print the unit code beside a separate
  // 24-count code — the one case where a retailer distinguishes them for you.
  {
    brand: "Friskies",
    line: "Extra Gravy",
    variant: "Chunky With Salmon in Savory Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "extra_gravy",
    foodForm: "wet",
    proteins: ["salmon", "poultry"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000293339", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Extra Gravy",
    variant: "Chunky With Chicken in Savory Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "extra_gravy",
    foodForm: "wet",
    proteins: ["chicken", "turkey"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000293292", scope: UNIT }],
  },
  {
    brand: "Friskies",
    line: "Extra Gravy",
    variant: "Chunky With Turkey in Savory Gravy",
    species: "cat",
    texture: "chunks",
    presentation: "extra_gravy",
    foodForm: "wet",
    proteins: ["turkey", "chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000293353", scope: UNIT }],
  },

  // ── Friskies · Tasty Treasures (continued) ─────────────────────────────
  {
    brand: "Friskies",
    line: "Tasty Treasures",
    variant: "With Turkey and Chicken",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey", "chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000582334", scope: UNIT }],
  },

  // ── Fancy Feast · Flaked (continued) ───────────────────────────────────
  //
  // Four more, taking the range from one product to five. Three of the four are
  // all-life-stages decks at 14% minimum protein and 74% moisture — the driest
  // and most protein-dense wet panels in the file, which is what flaked fish
  // packed in broth actually is.
  {
    brand: "Fancy Feast",
    line: "Flaked",
    variant: "Chicken & Tuna Feast",
    species: "cat",
    texture: "flaked",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "tuna"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000427949", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Flaked",
    // The shortest deck in the seed: seven ingredients before the vitamins,
    // and the only one whose iron is ferric pyrophosphate rather than ferrous
    // sulfate.
    variant: "Fish & Shrimp Feast",
    species: "cat",
    texture: "flaked",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["ocean fish", "shrimp"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000428748", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Flaked",
    variant: "Trout Feast",
    species: "cat",
    texture: "flaked",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["trout"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000428847", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Flaked",
    variant: "Tuna Feast",
    species: "cat",
    texture: "flaked",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000001248", scope: UNIT }],
  },

  // ── Fancy Feast · Chunky ───────────────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Chunky",
    variant: "Chunky Chicken Feast",
    species: "cat",
    texture: "chunks",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "all",
    packages: [{ size: "3 oz", container: CAN, upc: "050000426942", scope: UNIT }],
  },

  // ── Fancy Feast · Sliced (continued) ───────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Sliced",
    variant: "Sliced Chicken Feast in Gravy",
    species: "cat",
    texture: "slices",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000032648", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Sliced",
    variant: "Sliced Turkey Feast in Gravy",
    species: "cat",
    texture: "slices",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey"],
    lifeStage: "adult",
    packages: [{ size: "3 oz", container: CAN, upc: "050000426447", scope: UNIT }],
  },

  // ── Fancy Feast · Senior 7+ ────────────────────────────────────────────
  //
  // The first senior range in the seed, and the reason `lifeStage` gained a
  // fourth value. Like Fancy Feast Kitten it carries the stage in its range
  // name — and like the kitten paté that turned up inside Gourmet Naturals,
  // the next senior formula in an ordinary range will need the field.
  //
  // Both decks guarantee 0.07% taurine, the kitten figure rather than the 0.05
  // the adult ranges state, and both add a minimum Vitamin E in IU/kg that the
  // panel type cannot hold. See the notes in data/known-formulas.ts.
  {
    brand: "Fancy Feast",
    line: "Senior 7+",
    variant: "Chicken Feast Classic Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "senior",
    packages: [{ size: "3 oz", container: CAN, upc: "050000503827", scope: UNIT }],
  },
  {
    brand: "Fancy Feast",
    line: "Senior 7+",
    variant: "Beef Feast Classic Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef"],
    lifeStage: "senior",
    packages: [{ size: "3 oz", container: CAN, upc: "050000503841", scope: UNIT }],
  },

  // ── Friskies · Indoor (continued) ──────────────────────────────────────
  {
    brand: "Friskies",
    line: "Indoor",
    variant: "Meaty Bits Homestyle Turkey Dinner With Garden Greens in Gravy",
    species: "cat",
    texture: "bits",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["turkey", "rice", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "050000574070", scope: UNIT }],
  },

  // ══ Batch 015 · Hill's ═══════════════════════════════════════════════════
  //
  // The first maker in the seed that is not Purina, and it arrives with its own
  // way of writing a label. Two things differ enough to matter here:
  //
  //   - Hill's prints NO ash and NO taurine guarantee. Not on one deck, on all
  //     twenty. See the note on `ga` in data/known-formulas.ts for what that
  //     costs the reader.
  //   - `brand` is the range Hill's sells under — Science Diet or Prescription
  //     Diet — not the company. Both are separate entries in
  //     data/us-pet-brands.ts, and a shopper reads them as separate brands,
  //     which is the reading the catalog should carry.
  //
  // The five Prescription Diet cans get their veterinary flag from
  // `lib/vet-diet.ts` at import time, off the range name. Nothing is stored on
  // the product for it — see app/api/known-products/import/route.ts.

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Savory Beef Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef"],
    lifeStage: "adult",
    packages: [{ size: "2.9 oz", container: CAN, upc: "052742068473", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Savory Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742453408", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Chicken Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742177007", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Liver & Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["liver", "chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742661001", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Savory Salmon Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742453606", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Savory Turkey Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742661308", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult Hairball Control ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Hairball Control",
    variant: "Ocean Fish Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["ocean fish", "tuna"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742453101", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult Indoor ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Indoor",
    variant: "Savory Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742610900", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Indoor",
    variant: "Ocean Fish Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["ocean fish"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742611105", scope: UNIT }],
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "Savory Turkey Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey"],
    lifeStage: "kitten",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742617404", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "with Salmon",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon"],
    lifeStage: "kitten",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742617305", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult 7+ ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Savory Beef Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["beef"],
    lifeStage: "senior",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742740003", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Tender Tuna Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna"],
    lifeStage: "senior",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742177908", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Savory Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "senior",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742454108", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Tender Chicken Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "senior",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742177601", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · r/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "r/d",
    variant: "Chicken Flavor",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742945408", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · y/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "y/d",
    variant: "with Chicken",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742149608", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · z/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "z/d",
    variant: "Hydrolyzed Chicken Flavor",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742523804", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · c/d Multicare ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "c/d Multicare",
    variant: "with Chicken",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742623801", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · i/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "i/d",
    variant: "Chicken Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742462806", scope: UNIT }],
  },

  // ══ Batch 016 · Hill's, continued ════════════════════════════════════════
  //
  // Six more Prescription Diet and four Science Diet. Two things new here:
  //
  //   - Three ranges name a condition rather than a life stage or a texture.
  //     "Adult Urinary Hairball Control" is NOT the "Adult Hairball Control"
  //     seeded in batch 015 — Hill's sells both, and they are different decks.
  //   - "k/d + z/d" is one product for two conditions, one deck, one barcode.
  //     It is its own range, not an entry filed under either letter.

  // ── Hill's Prescription Diet · c/d Multicare ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "c/d Multicare",
    variant: "with Ocean Fish",
    species: "cat",
    texture: "ground",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["ocean fish", "tuna"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742623900", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · c/d Multicare Stress ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "c/d Multicare Stress",
    variant: "with Chicken",
    species: "cat",
    texture: "ground",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742068138", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · i/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "i/d",
    variant: "Kitten Chicken Pâté",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "kitten",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742078205", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · k/d + z/d ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "k/d + z/d",
    variant: "Hydrolyzed Chicken Flavor",
    species: "cat",
    texture: "pate",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742086620", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · m/d GlucoSupport ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "m/d GlucoSupport",
    variant: "with Liver",
    species: "cat",
    texture: "ground",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["liver"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742428109", scope: UNIT }],
  },

  // ── Hill's Prescription Diet · w/d Multi-Benefit ─────────────────────────────────────
  {
    brand: "Hill's Prescription Diet",
    line: "w/d Multi-Benefit",
    variant: "with Chicken",
    species: "cat",
    texture: "ground",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "5.5 oz", container: CAN, upc: "052742945507", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult 7+ Senior Vitality ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+ Senior Vitality",
    variant: "Chicken & Vegetable Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "vegetables"],
    lifeStage: "senior",
    packages: [{ size: "2.9 oz", container: CAN, upc: "052742011974", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Healthy Cuisine",
    variant: "Poached Salmon & Spinach Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "spinach"],
    lifeStage: "adult",
    packages: [{ size: "2.8 oz", container: CAN, upc: "052742007199", scope: UNIT }],
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Urinary Hairball Control",
    variant: "Chicken Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [{ size: "2.9 oz", container: CAN, upc: "052742075556", scope: UNIT }],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Urinary Hairball Control",
    variant: "Turkey Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey"],
    lifeStage: "adult",
    packages: [{ size: "2.9 oz", container: CAN, upc: "052742075877", scope: UNIT }],
  },

  // ══ Batch 017 · Dry food and treats ══════════════════════════════════════
  //
  // Thirteen products under FORTY barcodes, and that ratio is the new thing.
  // Every product before this had one pack size; a bag of Friskies is sold in
  // five, and all five carry one recipe. `packages` was built for exactly this
  // and had never held more than one entry until now.
  //
  // Two consequences worth knowing before reading further:
  //
  //   - Two barcodes sharing a composition stopped being a paste error. The
  //     test that catches it now compares across products rather than across
  //     codes, with a second test that every size of ONE product agrees.
  //   - `line` is read off the deck title and the shop URL, not off the
  //     ledger's `product_line`, which said "Dry Cat Food" for twenty of them.
  //     The real ranges are Seafood Sensations, Surfin' & Turfin' Favorites,
  //     Gravy Swirlers, Indoor Delights, Land & Sea Adventures and Party
  //     Pack'd — all named in the deck filenames.
  //
  // `Party Pack'd` is a complete dry FOOD. `Party Mix` is treats. Purina sells
  // both, the names are one word apart, and only the second should ever be
  // excused from the everyday standard.

  // ── Fancy Feast · Gourmet Dry ─────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Gourmet Dry",
    variant: "With Savory Farm-Raised Chicken & Turkey",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "turkey"],
    lifeStage: "all",
    packages: [
      { size: "16 oz", container: BAG, upc: "050000462896", scope: UNIT },
      { size: "3 lb", container: BAG, upc: "050000463008", scope: UNIT },
      { size: "7 lb", container: BAG, upc: "050000463114", scope: UNIT },
      { size: "12 lb", container: BAG, upc: "050000576227", scope: UNIT },
    ],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Dry",
    variant: "Filet Mignon Flavor With Real Seafood & Shrimp",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["fish", "shrimp", "filet mignon flavor"],
    lifeStage: "all",
    packages: [
      { size: "16 oz", container: BAG, upc: "050000572908", scope: UNIT },
      { size: "3 lb", container: BAG, upc: "050000572830", scope: UNIT },
      { size: "7 lb", container: BAG, upc: "050000572854", scope: UNIT },
      { size: "12 lb", container: BAG, upc: "050000576241", scope: UNIT },
    ],
  },
  {
    brand: "Fancy Feast",
    line: "Gourmet Dry",
    variant: "With Ocean Fish & Salmon and Accents of Garden Greens",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["ocean fish", "salmon", "spinach", "parsley"],
    lifeStage: "all",
    packages: [
      { size: "3 lb", container: BAG, upc: "050000467150", scope: UNIT },
      { size: "7 lb", container: BAG, upc: "050000463916", scope: UNIT },
      { size: "12 lb", container: BAG, upc: "050000580743", scope: UNIT },
    ],
  },

  // ── Fancy Feast · Kitten ─────────────────────────────────────
  {
    brand: "Fancy Feast",
    line: "Kitten",
    variant: "With Savory Chicken & Turkey",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "turkey", "milk"],
    lifeStage: "kitten",
    packages: [
      { size: "3 lb", container: BAG, upc: "050000660681", scope: UNIT },
      { size: "7 lb", container: BAG, upc: "050000660667", scope: UNIT },
    ],
  },

  // ── Friskies · Seafood Sensations ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Seafood Sensations",
    variant: "Salmon, Tuna, Shrimp & Seaweed Flavors",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["salmon", "tuna", "shrimp", "seaweed", "ocean fish"],
    lifeStage: "all",
    packages: [
      { size: "3.15 lb", container: BAG, upc: "050000015474", scope: UNIT },
      { size: "16 lb", container: BAG, upc: "050000575770", scope: UNIT },
      { size: "17.6 lb", container: BAG, upc: "050000168866", scope: UNIT },
      { size: "22 lb", container: BAG, upc: "050000290833", scope: UNIT },
      { size: "30 lb", container: BAG, upc: "050000963584", scope: UNIT },
    ],
  },

  // ── Friskies · Surfin' & Turfin' Favorites ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Surfin' & Turfin' Favorites",
    variant: "Chicken, Ocean Whitefish, Salmon & Filet Mignon Flavors",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "ocean whitefish", "salmon", "filet mignon flavor"],
    lifeStage: "all",
    packages: [
      { size: "3.15 lb", container: BAG, upc: "050000100347", scope: UNIT },
      { size: "16 lb", container: BAG, upc: "050000576692", scope: UNIT },
      { size: "12 lb", container: BAG, upc: "050000294701", scope: UNIT },
      { size: "22 lb", container: BAG, upc: "050000290215", scope: UNIT },
    ],
  },

  // ── Friskies · Gravy Swirlers ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Gravy Swirlers",
    variant: "Flavors of Chicken, Salmon & Gravy",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "salmon", "gravy"],
    lifeStage: "all",
    packages: [
      { size: "3.15 lb", container: BAG, upc: "050000168583", scope: UNIT },
      { size: "16 lb", container: BAG, upc: "050000168620", scope: UNIT },
      { size: "22 lb", container: BAG, upc: "050000172559", scope: UNIT },
      { size: "12 lb", container: BAG, upc: "050000504121", scope: UNIT },
    ],
  },

  // ── Friskies · Tender & Crunchy Combo ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Tender & Crunchy Combo",
    variant: "Flavors of Chicken, Beef, Carrots & Green Beans",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "beef", "carrots", "green beans"],
    lifeStage: "adult",
    packages: [
      { size: "3.15 lb", container: BAG, upc: "050000084500", scope: UNIT },
      { size: "16 lb", container: BAG, upc: "050000575787", scope: UNIT },
    ],
  },

  // ── Friskies · Indoor Delights ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Indoor Delights",
    variant: "Flavors of Chicken, Salmon, Peas & Carrots",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "salmon", "peas", "carrots"],
    lifeStage: "adult",
    packages: [
      { size: "3.15 lb", container: BAG, upc: "050000051472", scope: UNIT },
      { size: "18.5 lb", container: BAG, upc: "050000376407", scope: UNIT },
    ],
  },

  // ── Friskies · Land & Sea Adventures ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Land & Sea Adventures",
    variant: "Flavors of Chicken & Ocean Fish",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "ocean fish"],
    lifeStage: "all",
    packages: [
      { size: "32 lb", container: BAG, upc: "050000259373", scope: UNIT },
    ],
  },

  // ── Friskies · Party Pack'd ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Party Pack'd",
    variant: "Flavors of Chicken, Liver & Turkey",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "liver", "turkey"],
    lifeStage: "adult",
    packages: [
      { size: "3 lb", container: BAG, upc: "050000618958", scope: UNIT },
      { size: "15 lb", container: BAG, upc: "050000619832", scope: UNIT },
    ],
  },

  // ── Friskies · Party Mix ─────────────────────────────────────
  {
    brand: "Friskies",
    line: "Party Mix",
    variant: "Original Crunch With Chicken & Flavors of Liver & Turkey",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "liver", "turkey"],
    lifeStage: "adult",
    packages: [
      { size: "2.1 oz", container: POUCH, upc: "050000238910", scope: UNIT },
      { size: "6 oz", container: POUCH, upc: "050000575848", scope: UNIT },
      { size: "20 oz", container: CANISTER, upc: "050000963089", scope: UNIT },
      { size: "30 oz", container: CANISTER, upc: "050000500413", scope: UNIT },
    ],
  },
  {
    brand: "Friskies",
    line: "Party Mix",
    variant: "Beachside Crunch With Ocean Whitefish & Flavors of Shrimp, Crab & Tuna",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["ocean whitefish", "shrimp", "crab", "tuna"],
    lifeStage: "adult",
    packages: [
      { size: "2.1 oz", container: POUCH, upc: "050000574438", scope: UNIT },
      { size: "6 oz", container: POUCH, upc: "050000576999", scope: UNIT },
      { size: "20 oz", container: CANISTER, upc: "050000963102", scope: UNIT },
    ],
  },

  // ══ Batch 018 · Hill's, wet pouches and dry bags ═════════════════════════
  //
  // Fifty-two barcodes, forty-four products, and one finding that decides how
  // they are filed: a Hill's 5.5 oz CAN and a 2.8 oz POUCH sold under the same
  // flavour name are not one recipe in two packages. They are two formulas.
  //
  //   Adult 7+ Tender Tuna Dinner   can 7.5% protein, 2.5% fat, 940 kcal/kg
  //                                 pouch 7.0%, 2.2%, 903 kcal/kg
  //   Kitten Tender Chicken Dinner  can lists Soy Protein Isolate
  //                                 pouch lists Modified Rice Starch instead
  //
  // Five independent signals disagree — protein, fat, calorie density,
  // ingredient order and, on the Kitten one, a substituted ingredient — so
  // this is rule 2, not a transcription difference. Merging them under one
  // product would hand a reader whichever formula happened to be stored first.
  //
  // Since our identity is brand + line + variant, every wet pouch carries
  // "(Pouch)" in its variant. Applied to all thirteen and not only to the six
  // that collide today, because a rule with exceptions is one somebody has to
  // look up, and the next can to arrive would silently create a seventh
  // collision. See docs/CATALOG-CONFLICTS.md E6.
  //
  // Hill's also crosses purpose with life stage on the front — Perfect
  // Digestion exists for Adult, for Adult 7+ and for Kitten as three separate
  // decks — so each combination is its own range.

  // ── Hill's Science Diet · Adult 7+ Senior Vitality ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+ Senior Vitality",
    variant: "Tuna & Vegetables Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna", "vegetables"],
    lifeStage: "senior",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742011998", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult 7+ ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Tender Chicken Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "senior",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742032269", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+",
    variant: "Tender Tuna Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna"],
    lifeStage: "senior",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742032283", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Ocean Fish Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["ocean fish"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742177502", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Tuna Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742177205", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Grain Free Salmon & Yellow Pea Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["salmon", "yellow pea"],
    lifeStage: "adult",
    packages: [
      { size: "13 lb", container: BAG, upc: "052742022086", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Healthy Cuisine",
    variant: "Roasted Chicken & Rice Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "rice"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742007137", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Indoor ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Indoor",
    variant: "Salmon & Vegetable Medley",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742068398", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Indoor",
    variant: "Salmon & Vegetables Stew (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742075815", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Perfect Digestion ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Digestion",
    variant: "Chicken & Barley Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "barley"],
    lifeStage: "adult",
    packages: [
      { size: "3.5 lb", container: BAG, upc: "052742038315", scope: UNIT },
      { size: "6 lb", container: BAG, upc: "052742038339", scope: UNIT },
      { size: "13 lb", container: BAG, upc: "052742038346", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Digestion",
    variant: "Chicken, Vegetable & Rice Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "vegetables", "rice"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742041605", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Digestion",
    variant: "Salmon & Brown Rice Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["salmon", "brown rice"],
    lifeStage: "adult",
    packages: [
      { size: "3.5 lb", container: BAG, upc: "052742041544", scope: UNIT },
      { size: "6 lb", container: BAG, upc: "052742041469", scope: UNIT },
      { size: "13 lb", container: BAG, upc: "052742041476", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Perfect Weight ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Weight",
    variant: "Salmon & Vegetables Stew (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742076546", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Weight",
    variant: "Salmon & Vegetable Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742068435", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Weight",
    variant: "Vegetable & Turkey Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["turkey", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742068459", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Perfect Weight",
    variant: "Vegetables & Chicken Stew (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742076539", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Chicken & Beef Dinner (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "beef"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742046365", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Chicken & Vegetable Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742010243", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Duck & Vegetable Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["duck", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742068411", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Pollock Meal & Barley Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["pollock", "barley"],
    lifeStage: "adult",
    packages: [
      { size: "3.5 lb", container: BAG, upc: "052742059150", scope: UNIT },
      { size: "6 lb", container: BAG, upc: "052742059167", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Salmon & Tuna Dinner (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "tuna"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742046341", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Salmon & Vegetable Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742070261", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Tuna & Vegetable Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742010267", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Chicken Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742032207", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Ocean Fish Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["ocean fish"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742032245", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Tender Tuna Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["tuna"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742032221", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Turkey & Liver Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["turkey", "liver"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742453804", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Urinary Hairball Control",
    variant: "Vegetables & Salmon Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742075891", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Adult Urinary Hairball Control",
    variant: "Vegetables & Tuna Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["tuna", "vegetables"],
    lifeStage: "adult",
    packages: [
      { size: "2.9 oz", container: CAN, upc: "052742075853", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Sensitive Stomach & Skin ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Sensitive Stomach & Skin",
    variant: "Salmon & Brown Rice Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["salmon", "brown rice"],
    lifeStage: "adult",
    packages: [
      { size: "3.5 lb", container: BAG, upc: "052742086484", scope: UNIT },
      { size: "6 lb", container: BAG, upc: "052742086408", scope: UNIT },
      { size: "13 lb", container: BAG, upc: "052742086446", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "Chicken & Vegetables Stew (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken", "vegetables"],
    lifeStage: "kitten",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742075839", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "Tender Chicken Dinner",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "kitten",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742176901", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Kitten Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten Healthy Cuisine",
    variant: "Tender Chicken & Rice Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "rice"],
    lifeStage: "kitten",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742007175", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "Liver & Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["liver", "chicken"],
    lifeStage: "kitten",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742660004", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Kitten Sensitive Stomach & Skin ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten Sensitive Stomach & Skin",
    variant: "Salmon & Vegetable Stew",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "kitten",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742069463", scope: UNIT },
    ],
  },
  {
    brand: "Hill's Science Diet",
    line: "Kitten Sensitive Stomach & Skin",
    variant: "Salmon & Vegetables Stew (Pouch)",
    species: "cat",
    texture: "stew",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["salmon", "vegetables"],
    lifeStage: "kitten",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742076553", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult 7+ Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+ Healthy Cuisine",
    variant: "Roasted Chicken & Rice Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["chicken", "rice"],
    lifeStage: "senior",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742007151", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult 7+ Perfect Digestion ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 7+ Perfect Digestion",
    variant: "Chicken & Barley Recipe",
    species: "cat",
    texture: "kibble",
    presentation: "plain",
    foodForm: "dry",
    proteins: ["chicken", "barley"],
    lifeStage: "senior",
    packages: [
      { size: "3.5 lb", container: BAG, upc: "052742041568", scope: UNIT },
      { size: "6 lb", container: BAG, upc: "052742041483", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Healthy Cuisine",
    variant: "Seared Tuna & Carrot Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "carrot"],
    lifeStage: "adult",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742007090", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Kitten ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Kitten",
    variant: "Tender Chicken Dinner (Pouch)",
    species: "cat",
    texture: "chunks",
    presentation: "in_gravy",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "kitten",
    packages: [
      { size: "2.8 oz", container: POUCH, upc: "052742034669", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult 11+ Healthy Cuisine ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult 11+ Healthy Cuisine",
    variant: "Seared Tuna & Carrot Medley",
    species: "cat",
    texture: "stew",
    presentation: "in_sauce",
    foodForm: "wet",
    proteins: ["tuna", "carrot"],
    lifeStage: "senior",
    packages: [
      { size: "2.8 oz", container: CAN, upc: "052742007113", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Hairball Control ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Hairball Control",
    variant: "Savory Chicken Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742452609", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult",
    variant: "Ocean Fish Entrée",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["ocean fish"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742661209", scope: UNIT },
    ],
  },

  // ── Hill's Science Diet · Adult Urinary Hairball Control ─────────────────────────────────────
  {
    brand: "Hill's Science Diet",
    line: "Adult Urinary Hairball Control",
    variant: "Canned",
    species: "cat",
    texture: "minced",
    presentation: "plain",
    foodForm: "wet",
    proteins: ["chicken"],
    lifeStage: "adult",
    packages: [
      { size: "5.5 oz", container: CAN, upc: "052742010229", scope: UNIT },
    ],
  },
];
