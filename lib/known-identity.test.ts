import { describe, expect, it } from "vitest";
import {
  identityLabel,
  identityVerdict,
  importVerdict,
  isIdentityRow,
  isUnscannedIdentityRow,
  type ExistingIdentityRow,
  type IdentityFields,
  type IdentityVerdict,
} from "./known-import";
import { identityCandidates, identityRow, seededProductName } from "./known-identity";
import { seedButtonLabel } from "./seed-button-label";
import { KNOWN_PRODUCTS, type KnownProduct } from "../data/known-products";
import { KNOWN_FORMULAS } from "../data/known-formulas";
import { KNOWN_MULTIPACKS } from "../data/known-multipacks";
import { canonicalBarcode } from "./barcode";

const SEED: IdentityFields = {
  productName: "Classic Loaf in Sauce Chicken & Veal",
  brands: "Cesar",
  species: "dog",
  foodForm: "wet",
};

/** Our own identity row, as the import writes it. */
function ours(over: Partial<ExistingIdentityRow> = {}): ExistingIdentityRow {
  return {
    found: false,
    source: "community",
    reason: "no-ingredients",
    ingredients_text: null,
    mode: "pet",
    product_name: SEED.productName,
    brands: SEED.brands,
    species: SEED.species,
    food_form: SEED.foodForm,
    ...over,
  };
}

/** What the consumer app's lookup writes when nothing has a list. */
function lookupMiss(over: Partial<ExistingIdentityRow> = {}): ExistingIdentityRow {
  return {
    found: false,
    source: null,
    reason: "not-found",
    ingredients_text: null,
    mode: null,
    product_name: null,
    brands: null,
    ...over,
  };
}

const LIST = "Chicken, Chicken Broth, Liver, Meat By-Products, Fish, Salt";

describe("identityVerdict — where a name with no composition may go", () => {
  it("inserts under a code nothing is under", () => {
    expect(identityVerdict(null, SEED)).toBe("write");
    expect(identityVerdict(undefined, SEED)).toBe("write");
  });

  it("names a lookup miss, with or without an open database's name", () => {
    expect(identityVerdict(lookupMiss(), SEED)).toBe("replace");
    expect(
      identityVerdict(
        lookupMiss({ reason: "no-ingredients", product_name: "Cesar Loaf" }),
        SEED
      )
    ).toBe("replace");
  });

  it("does nothing when our identity row already says what the seed says", () => {
    expect(identityVerdict(ours(), SEED)).toBe("identical");
  });

  it("corrects our own identity row when the seed has changed", () => {
    expect(identityVerdict(ours({ product_name: "Old name" }), SEED)).toBe("replace");
    expect(identityVerdict(ours({ species: "cat" }), SEED)).toBe("replace");
    expect(identityVerdict(ours({ food_form: "dry" }), SEED)).toBe("replace");
    expect(identityVerdict(ours({ mode: null }), SEED)).toBe("replace");
  });

  // The rule the owner set: never overwrite or downgrade a row that has
  // ingredients, a higher source, or anybody's reading.
  it("never lands on a row holding ingredients, whoever wrote them", () => {
    for (const source of ["openpetfoodfacts", "openfoodfacts", "community", "verified", null]) {
      expect(
        identityVerdict({ ...lookupMiss(), found: true, source, ingredients_text: LIST }, SEED)
      ).toBe("held");
      // Even text on a row marked as a miss is somebody's.
      expect(identityVerdict({ ...lookupMiss(), source, ingredients_text: LIST }, SEED)).toBe(
        "held"
      );
    }
  });

  it("never lands on a product row, even one with no list yet", () => {
    // Our own photograph of a pack whose back is still to type.
    expect(
      identityVerdict({ ...lookupMiss(), found: true, source: "verified" }, SEED)
    ).toBe("held");
    expect(
      identityVerdict({ ...lookupMiss(), found: true, source: "community" }, SEED)
    ).toBe("held");
  });

  it("never lands on our own photograph, found or not", () => {
    expect(identityVerdict(lookupMiss({ source: "verified" }), SEED)).toBe("held");
    expect(
      identityVerdict(ours({ source: "verified" }), SEED)
    ).toBe("held");
  });

  it("never lands on a box", () => {
    expect(identityVerdict(lookupMiss({ reason: "multipack" }), SEED)).toBe("held");
  });

  it("leaves a community row alone unless it is one of ours", () => {
    expect(identityVerdict(ours({ reason: "not-found" }), SEED)).toBe("held");
  });

  it("has wording for every verdict", () => {
    for (const v of ["write", "replace", "identical", "held"] as IdentityVerdict[]) {
      expect(identityLabel(v).length).toBeGreaterThan(0);
    }
  });
});

describe("a seeded formula still replaces an identity row", () => {
  // Same rank, and that is fine: an identity row holds no reading, so a
  // formula over it is filling a shelf, not settling a disagreement.
  it("reads an identity row as a name with no composition", () => {
    const held = { ...ours(), composition_key: null };
    expect(importVerdict(held, "some-key", false, LIST)).toBe("write");
    expect(importVerdict(held, null, false, LIST)).toBe("write");
  });
});

describe("isIdentityRow / isUnscannedIdentityRow", () => {
  it("recognises our identity row and nothing else", () => {
    expect(isIdentityRow(ours())).toBe(true);
    // The misses list has already filtered on found and does not select it.
    expect(isIdentityRow({ ...ours(), found: undefined })).toBe(true);
    expect(isIdentityRow(lookupMiss())).toBe(false);
    expect(isIdentityRow(lookupMiss({ reason: "no-ingredients", product_name: "X" }))).toBe(
      false
    );
    expect(isIdentityRow(ours({ found: true }))).toBe(false);
    expect(isIdentityRow(ours({ ingredients_text: LIST }))).toBe(false);
    expect(isIdentityRow(ours({ reason: "multipack" }))).toBe(false);
    expect(isIdentityRow(null)).toBe(false);
  });

  it("keeps an identity row a shopper scanned on the misses list", () => {
    const scanned = { ...ours(), last_hit_at: "2026-10-08T10:00:00Z" };
    expect(isUnscannedIdentityRow(scanned, true)).toBe(false);
    expect(isUnscannedIdentityRow({ ...ours(), last_hit_at: null }, true)).toBe(true);
  });

  it("leaves identity rows to the coverage page on a catalog with no hit stamp", () => {
    expect(
      isUnscannedIdentityRow({ ...ours(), last_hit_at: "2026-10-08T10:00:00Z" }, false)
    ).toBe(true);
  });

  it("never hides a real miss", () => {
    expect(isUnscannedIdentityRow({ ...lookupMiss(), last_hit_at: null }, true)).toBe(false);
    expect(isUnscannedIdentityRow({ ...lookupMiss(), last_hit_at: null }, false)).toBe(false);
  });
});

describe("identityCandidates — the seed's identity-only packages", () => {
  const hasFormula = (upc: string) => !!KNOWN_FORMULAS[upc];
  const list = identityCandidates(KNOWN_PRODUCTS, hasFormula);

  it("takes every package without a formula and none with one", () => {
    const expected = KNOWN_PRODUCTS.flatMap((p) => p.packages).filter(
      (pkg) => !KNOWN_FORMULAS[pkg.upc]
    );
    expect(list.length).toBe(expected.length);
    expect(list.length).toBeGreaterThan(0);
    for (const c of list) expect(KNOWN_FORMULAS[c.printed]).toBeUndefined();
  });

  it("stores every code canonically, once, and never a box's code", () => {
    const boxes = new Set(KNOWN_MULTIPACKS.map((b) => canonicalBarcode(b.upc)));
    const codes = list.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of list) {
      expect(c.code).toBe(canonicalBarcode(c.printed));
      expect(boxes.has(c.code)).toBe(false);
    }
  });

  it("names a product exactly as the formula rows would", () => {
    for (const product of KNOWN_PRODUCTS) {
      for (const pkg of product.packages) {
        const c = list.find((x) => x.printed === pkg.upc);
        if (!c) continue;
        expect(c.productName).toBe(seededProductName(product));
        expect(c.brands).toBe(product.brand);
        expect(c.species).toBe(product.species);
      }
    }
    expect(seededProductName({ line: null, variant: "Lamb Trachea" })).toBe("Lamb Trachea");
    expect(seededProductName({ line: "Gravy Lovers", variant: "Chicken" })).toBe(
      "Gravy Lovers Chicken"
    );
  });

  it("passes the seed's food form through, whatever its vocabulary", () => {
    // Another branch widens the vocabulary (frozen raw, freeze-dried). This
    // module must carry whatever the seed says, not a wet/dry guess of its own.
    const product = {
      ...KNOWN_PRODUCTS[0],
      foodForm: "freeze-dried",
      packages: [{ size: "3 oz", container: "bag", upc: "000000000000", scope: "individual_unit" }],
    } as unknown as KnownProduct;
    const [c] = identityCandidates([product], () => false);
    expect(c.foodForm).toBe("freeze-dried");
    expect(identityRow(c).food_form).toBe("freeze-dried");
  });

  it("reads the vet channel and the treat ranges the way the formula rows do", () => {
    const vet = {
      ...KNOWN_PRODUCTS[0],
      brand: "Hill's Prescription Diet",
      line: null,
      variant: "k/d Kidney Care",
      packages: [{ size: "5.5 oz", container: "can", upc: "000000000001", scope: "individual_unit" }],
    } as unknown as KnownProduct;
    expect(identityCandidates([vet], () => false)[0].requiresVet).toBe(true);
    const plain = { ...vet, brand: "Cesar", variant: "Chicken & Veal" } as KnownProduct;
    expect(identityCandidates([plain], () => false)[0].requiresVet).toBe(false);
  });
});

describe("identityRow — the shape written", () => {
  const [c] = identityCandidates(KNOWN_PRODUCTS, (upc) => !!KNOWN_FORMULAS[upc]);
  const row = identityRow(c);

  it("says: a known product, composition pending", () => {
    expect(row.code).toBe(c.code);
    expect(row.found).toBe(false);
    expect(row.reason).toBe("no-ingredients");
    expect(row.source).toBe("community");
    expect(row.mode).toBe("pet");
    expect(row.product_name).toBe(c.productName);
    expect(row.brands).toBe(c.brands);
    expect(row.species).toBe(c.species);
    expect(row.food_form).toBe(c.foodForm);
    expect(row.ingredients_text).toBeNull();
    expect(row.composition_key).toBeNull();
    // A shape the import itself recognises as its own.
    expect(isIdentityRow(row)).toBe(true);
  });

  it("stores an unknown nutrition role as null, the column's 'not established'", () => {
    const unknown = identityCandidates(KNOWN_PRODUCTS, (upc) => !!KNOWN_FORMULAS[upc]).find(
      (x) => x.nutritionRole === "unknown"
    )!;
    expect(identityRow(unknown).nutrition_role).toBeNull();
    const treat = identityCandidates(KNOWN_PRODUCTS, (upc) => !!KNOWN_FORMULAS[upc]).find(
      (x) => x.nutritionRole !== "unknown"
    );
    if (treat) expect(identityRow(treat).nutrition_role).toBe(treat.nutritionRole);
  });

  it("sends nothing it did not establish, so an update erases nothing", () => {
    for (const column of [
      "guaranteed_analysis",
      "moisture_percent",
      "nutrition",
      "image_url",
      "hits",
      "last_hit_at",
      "created_at",
      "food_form_confirmed",
      "net_weight_g",
    ]) {
      expect(Object.keys(row)).not.toContain(column);
    }
  });
});

describe("seedButtonLabel with identity-only rows", () => {
  const label = (toWrite: number, identitiesToWrite: number, panels = 0, boxes = 0) =>
    seedButtonLabel({ toWrite, boxesToMark: boxes, panelsToFill: panels, identitiesToWrite });

  it("says both counts when both are written", () => {
    expect(label(92, 150)).toBe("Write 92 compositions + 150 identity-only to the catalog");
    expect(label(1, 150)).toBe("Write 1 composition + 150 identity-only to the catalog");
  });

  it("says identity-only alone when there is nothing else", () => {
    expect(label(0, 150)).toBe("Write 150 identity-only to the catalog");
  });

  it("keeps the old wording when there are no identity rows", () => {
    expect(label(20, 0)).toBe("Write 20 to the catalog");
    expect(seedButtonLabel({ toWrite: 20, boxesToMark: 0, panelsToFill: 0 })).toBe(
      "Write 20 to the catalog"
    );
  });

  it("joins with the other kinds of work", () => {
    expect(label(92, 150, 3, 2)).toBe(
      "Write 92 compositions + 150 identity-only, fill 3 panels and mark 2 variety packs"
    );
    expect(label(0, 150, 1)).toBe("Write 150 identity-only and fill 1 panel");
  });

  it("is never 'Nothing to write' while identity rows wait", () => {
    expect(label(0, 1)).not.toBe("Nothing to write");
  });
});
