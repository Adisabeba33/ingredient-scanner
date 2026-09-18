import { canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { compositionKey } from "@/lib/composition-key";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { hasAnyFigure, readGuaranteedAnalysis } from "@/lib/guaranteed-analysis";
import { isUndefinedColumn, withoutColumns } from "@/lib/optional-columns";
import { deleteIn, selectIn } from "@/lib/chunked-in";
import { isVeterinaryDiet } from "@/lib/vet-diet";
import { detectNutritionRole } from "@/lib/nutrition-role";
import {
  importVerdict,
  multipackVerdict,
  type ExistingBoxRow,
  type ExistingRow,
  type ImportVerdict,
} from "@/lib/known-import";
import { KNOWN_PRODUCTS } from "@/data/known-products";
import { KNOWN_FORMULAS } from "@/data/known-formulas";
import { KNOWN_MULTIPACKS } from "@/data/known-multipacks";

/**
 * Put the seeded formulas into the catalog.
 *
 * ── Why these may now be written when the barcodes alone could not ────────
 *
 * A `barcode_cache` row without an ingredient list fails `servableRow()`, which
 * does not mean "ignored" — it means the code reads as a recent MISS and the
 * open databases are not asked again for a week. That is why the 27 barcodes
 * arrived as a shopping list and stayed out of the catalog.
 *
 * With a composition they are ordinary, servable products, and better than what
 * the open databases hold for most of them.
 *
 * ── `community`, not `verified` ───────────────────────────────────────────
 *
 * These lists come from manufacturer and retailer records, not from anybody
 * photographing a tin. `community` is exactly what that is: it outranks the
 * open databases, which is right, and it is outranked by our own capture, which
 * is also right — the moment somebody photographs the real pack, the pack wins.
 * Calling them `verified` would make a retailer record permanently
 * unoverwritable by a photograph, which is backwards.
 *
 * ── Nothing is overwritten silently ───────────────────────────────────────
 *
 * A barcode already holding a DIFFERENT composition is left alone and reported.
 * One barcode does carry two formulas over time — Friskies Pâté Ocean Whitefish
 * & Tuna has gone 11% protein to 9% under one UPC — and walking over the older
 * one destroys the only evidence that happened. The rule lives in
 * lib/known-import.ts, where it can be read and tested.
 *
 * GET previews. POST writes. Both gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

/** Added by ingredients.help migration 0024. See lib/optional-columns.ts. */
const NEW_COLUMNS = ["nutrition_role", "requires_vet"];

interface Candidate {
  code: string;
  printed: string;
  productName: string;
  brands: string;
  species: string;
  foodForm: string;
  ingredients: string;
  analysis: ReturnType<typeof analysisFor>;
  compositionKey: string | null;
  conflictNote: string | null;
  /**
   * Does this come from the veterinary channel?
   *
   * Read from the brand and range with `isVeterinaryDiet`, the same function
   * the capture route uses, rather than stored as a field on the seed. It needs
   * no data the catalog does not already have — "Hill's Prescription Diet r/d"
   * is the whole evidence — so a field would be a second copy of a fact, and
   * the copy is what goes stale.
   */
  requiresVet: boolean;
  /**
   * Meal, treat, topper — or unknown, which is most of them.
   *
   * Same shape as `requiresVet` and asked of the same evidence: the brand,
   * range and variant we already hold. `detectNutritionRole` fires only on
   * unambiguous wording and returns "unknown" otherwise, so this cannot quietly
   * excuse a real dinner — the failure it is built to avoid.
   */
  nutritionRole: ReturnType<typeof detectNutritionRole>;
}

function analysisFor(upc: string) {
  return KNOWN_FORMULAS[upc]?.analysis ?? null;
}

/**
 * Every seeded product that has a formula, flattened to a row-shaped thing.
 *
 * A product without a formula is skipped rather than written empty — an empty
 * row is the miss-shadowing problem this whole route exists to avoid.
 */
function candidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const product of KNOWN_PRODUCTS) {
    for (const pkg of product.packages) {
      const formula = KNOWN_FORMULAS[pkg.upc];
      if (!formula) continue;
      // Range, name and flavour joined the way the catalog stores them, so a
      // later capture of the same tin produces the same string.
      // `line` is null where the pack prints no range, so the name is built
      // from the parts that exist rather than around a hole.
      const productName = [product.line, product.variant]
        .filter(Boolean)
        .join(" ")
        .trim();
      out.push({
        code: canonicalBarcode(pkg.upc),
        printed: pkg.upc,
        productName,
        brands: product.brand,
        species: product.species,
        foodForm: product.foodForm,
        ingredients: formula.ingredients,
        analysis: formula.analysis,
        compositionKey: compositionKey(product.brand, formula.ingredients),
        conflictNote: formula.conflict ?? null,
        requiresVet: isVeterinaryDiet(product.brand, product.line, product.variant),
        nutritionRole: detectNutritionRole({
          parts: [product.brand, product.line, product.variant],
        }),
      });
    }
  }
  return out;
}

async function decide(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  force: boolean
) {
  const list = candidates();
  const codes = list.map((c) => c.code);

  // `guaranteed_analysis` comes along for a reason worth stating: when OUR OWN
  // capture wins, the seeded panel is not written — so a product photographed
  // before the scanner read that panel keeps a row without one, and its report
  // is poorer than the 25 beside it. That is invisible unless somebody says it.
  // Chunked, and this is the whole reason lib/chunked-in.ts exists: asking
  // about every seeded barcode in one `.in()` silently returned the first
  // thousand once the catalog passed a thousand products, and every row the
  // server dropped read as "not there" — verdict `write`, forever, over rows
  // that already held the formula and sometimes over our own photographs.
  const { rows: data, error } = await selectIn<
    ExistingRow & {
      code: string;
      guaranteed_analysis?: unknown;
      moisture_percent?: number | null;
    }
  >(
    admin,
    "barcode_cache",
    "code, source, composition_key, ingredients_text, guaranteed_analysis, moisture_percent",
    "code",
    codes
  );
  if (error) {
    return { error, decided: [] as Decided[] };
  }
  const existing = new Map<
    string,
    ExistingRow & { guaranteed_analysis?: unknown; moisture_percent?: number | null }
  >();
  for (const row of data) {
    existing.set(row.code, row);
  }

  return {
    error: null,
    decided: list.map((c) => {
      const held = existing.get(c.code);
      // Computed BEFORE the verdict, because the verdict now depends on it:
      // a photographed row with no panel can take the seeded one.
      const heldPanel = held
        ? hasAnyFigure(readGuaranteedAnalysis(held.guaranteed_analysis))
        : null;
      return {
        ...c,
        held: held ?? null,
        verdict: importVerdict(
          held ? { ...held, hasPanel: heldPanel } : held,
          c.compositionKey,
          force,
          c.ingredients
        ),
        // Only meaningful for a row we are leaving alone; null elsewhere.
        heldPanel,
      };
    }),
  };
}

type Decided = Candidate & {
  verdict: ImportVerdict;
  heldPanel: boolean | null;
  held: (ExistingRow & { moisture_percent?: number | null }) | null;
};

/**
 * Give a photographed row the panel its photograph never caught.
 *
 * Separate from the main write, and deliberately not an upsert: an upsert
 * sends a whole row, and a whole row is the one thing that must not happen
 * here. These rows are OURS — somebody stood in a shop and photographed the
 * pack — and everything they hold outranks the seed. Only two columns move,
 * and only in one direction: from absent to present.
 *
 * `guaranteed_analysis` is the point. `moisture_percent` comes along only
 * where it is null, because it is extracted separately from the panel and a
 * capture may well have caught it alone; overwriting a figure read off the
 * real pack with one from a manufacturer record is exactly the overwrite this
 * route refuses everywhere else.
 *
 * The `source` guard on the update is not decoration. The rows were read at
 * the start of the request, and between then and now somebody may have
 * re-photographed one. If the row is no longer ours, the update matches
 * nothing and the pass simply reports one fewer — which is the right outcome
 * and needs no branch anywhere else.
 */
async function writePanels(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  decided: Decided[]
) {
  const list = decided.filter(
    (d) => d.verdict === "panel-only" && d.analysis && hasAnyFigure(d.analysis)
  );
  if (list.length === 0) return { filled: 0, codes: [] as string[] };

  const filled: string[] = [];
  for (const c of list) {
    const patch: Record<string, unknown> = { guaranteed_analysis: c.analysis };
    if (c.held?.moisture_percent == null && c.analysis?.moistureMax != null) {
      patch.moisture_percent = c.analysis.moistureMax;
    }
    const { error } = await admin
      .from("barcode_cache")
      .update(patch)
      .eq("code", c.code)
      .eq("source", "verified");
    // One row failing is not a reason to abandon the other fifteen, and the
    // count below is what the operator reads — so a failure shows up as a
    // smaller number rather than as a silent success.
    if (!error) filled.push(c.code);
  }
  return { filled: filled.length, codes: filled };
}

/**
 * The boxes, decided the same way and written in the same pass.
 *
 * A box carries no composition and never will, so it goes nowhere near
 * `candidates()` — see the head of data/known-multipacks.ts for why that
 * separation is structural rather than a filter somebody has to maintain.
 */
interface BoxCandidate {
  code: string;
  printed: string;
  name: string;
  /** Members, canonicalised. The box is never its own member. */
  contains: string[];
}

function boxes(): BoxCandidate[] {
  return KNOWN_MULTIPACKS.map((box) => {
    const code = canonicalBarcode(box.upc);
    const contains: string[] = [];
    for (const member of box.contains) {
      const key = canonicalBarcode(member);
      // A carton listing itself would send the chooser straight back to the
      // screen the person is already looking at. Same rule as the route.
      if (!key || key === code) continue;
      if (!contains.includes(key)) contains.push(key);
    }
    return {
      code,
      printed: box.upc,
      name: `${box.brand} ${box.line} ${box.variant} — ${box.size}`.replace(/\s+/g, " "),
      contains,
    };
  });
}

async function decideBoxes(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
) {
  const list = boxes();
  if (list.length === 0) return { error: null, decided: [] as DecidedBox[] };

  const { rows: data, error } = await selectIn<ExistingBoxRow & { code: string }>(
    admin,
    "barcode_cache",
    "code, found, reason, ingredients_text, contains",
    "code",
    list.map((b) => b.code)
  );
  // A catalog that predates migration 0022 has no `contains` column, and the
  // whole point of these rows is that column — so this is reported rather than
  // worked around. `withoutColumns` would write boxes with no members, which
  // is a row saying "not a product" and nothing else.
  if (error) return { error, decided: [] as DecidedBox[] };

  const existing = new Map<string, ExistingBoxRow>();
  for (const row of data) {
    existing.set(row.code, row);
  }
  return {
    error: null,
    decided: list.map((b) => ({
      ...b,
      held: existing.get(b.code) ?? null,
      verdict: multipackVerdict(existing.get(b.code), b.contains),
    })),
  };
}

type DecidedBox = BoxCandidate & { held: ExistingBoxRow | null; verdict: ImportVerdict };

function summariseBoxes(decided: { verdict: ImportVerdict; contains: string[] }[]) {
  return {
    total: decided.length,
    write: decided.filter((d) => d.verdict === "write").length,
    identical: decided.filter((d) => d.verdict === "identical").length,
    conflict: decided.filter((d) => d.verdict === "conflict").length,
    // Boxes read with no member code proven. Not an error and not a failure —
    // marking the code still stops the app inviting a photograph of the
    // carton, which is the point of marking it. Worth a number, because it is
    // the queue somebody can shorten by reading one more box.
    withoutMembers: decided.filter((d) => d.contains.length === 0).length,
  };
}

function summarise(decided: { verdict: ImportVerdict }[]) {
  const counts: Record<ImportVerdict, number> = {
    write: 0,
    identical: 0,
    "ours-is-better": 0,
    "panel-only": 0,
    conflict: 0,
  };
  for (const d of decided) counts[d.verdict] += 1;
  return counts;
}

/**
 * Mark the boxes.
 *
 * The row asserts an absence, so almost every column is deliberately null: a
 * box has no composition, no mode and no source, and writing any of them would
 * be inventing the product this row exists to deny. Only `contains` and the
 * name carry anything.
 *
 * `contains` is written only when this pass actually has members. An upsert
 * sends every column, so passing an empty list through would let a later run —
 * one where the research had not proven an inner code — silently erase members
 * an earlier run recorded. Same guard as `app/api/multipack/route.ts`.
 */
async function writeBoxes(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
) {
  const { error, decided } = await decideBoxes(admin);
  if (error) return { error, written: 0 };

  const toWrite = decided.filter((d) => d.verdict === "write");
  const counts = summariseBoxes(decided);
  if (toWrite.length === 0) return { ...counts, written: 0 };

  const now = new Date().toISOString();
  const { error: writeError } = await admin.from("barcode_cache").upsert(
    toWrite.map((b) => ({
      code: b.code,
      found: false,
      reason: "multipack",
      mode: null,
      source: null,
      ingredients_text: null,
      product_name: b.name,
      contains: b.contains.length > 0 ? b.contains : (b.held?.contains ?? null),
      created_at: now,
    })),
    { onConflict: "code" }
  );
  if (writeError) return { ...counts, written: 0, error: writeError.message };

  return {
    ...counts,
    written: toWrite.length,
    // Named, because a box the catalog now refuses to treat as a product is
    // exactly the thing somebody will want to check if a scan starts bouncing.
    marked: toWrite.map((b) => ({ code: b.printed, name: b.name, members: b.contains.length })),
    conflicts: decided
      .filter((d) => d.verdict === "conflict")
      .map((d) => ({ code: d.printed, name: d.name })),
  };
}

/**
 * Retire every stored report for these codes, in every mode.
 *
 * Any report written before the row had a composition — or, for a panel fill,
 * before it had any figures to do dry-matter arithmetic with — is now stale.
 * Best-effort on purpose: the catalog rows are correct either way, and a
 * report that fails to clear is a stale page, not a wrong one.
 */
async function clearReports(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  codes: string[]
): Promise<number> {
  if (codes.length === 0) return 0;
  try {
    // Chunked for the same reason as the reads above, and here the list is the
    // longest in the route: every code times every mode's key.
    const { deleted } = await deleteIn(
      admin,
      "report_cache",
      "cache_key",
      codes.flatMap((code) => allReportCacheKeys(code))
    );
    return deleted;
  } catch {
    return 0;
  }
}

/** What WOULD happen, so the button can say it before anybody presses it. */
export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const { error, decided } = await decide(admin, false);
  if (error) {
    return Response.json({ error: "lookup_failed", message: error }, { status: 500 });
  }
  const boxResult = await decideBoxes(admin);
  return Response.json({
    total: decided.length,
    // Separate from `counts` on purpose: a box is not a formula waiting to be
    // written, and adding it to that tally would make "write 41 to the catalog"
    // mean two different kinds of thing at once.
    boxes: boxResult.error
      ? { error: boxResult.error }
      : summariseBoxes(boxResult.decided),
    // Seeded products WITHOUT a formula are not in `decided` at all — the
    // import has nothing to write for them. Said out loud so "27 of 40" reads
    // as a known state rather than as thirteen products having gone missing.
    seeded: KNOWN_PRODUCTS.reduce((n, p) => n + p.packages.length, 0),
    counts: summarise(decided),
    products: decided.map((d) => ({
      code: d.printed,
      name: `${d.brands} ${d.productName}`,
      verdict: d.verdict,
      // True when the row we are leaving alone already carries a guaranteed
      // analysis, false when it does not — the ones worth re-capturing.
      heldPanel: d.heldPanel,
      // Whether that row holds an ingredient list at all. Sent because it is
      // the difference between two reasons a photograph was left alone with no
      // panel — "your list and ours disagree, so the seeded figures may belong
      // to another formula" and "this capture read nothing at all" — and the
      // screen should not guess which one it is looking at.
      heldComposition: d.held ? !!(d.held.ingredients_text ?? "").trim() : null,
      // Surfaced in the preview because it changes how the consumer report
      // judges the product. A therapeutic diet written in as an everyday food
      // is the one mistake here that a reader cannot see and would not think
      // to question, so it should be visible BEFORE the write, not inferrable
      // afterwards from the range name.
      requiresVet: d.requiresVet,
      // Same reason as requiresVet: it changes the standard the report judges
      // by, and is worth seeing before the write rather than after.
      nutritionRole: d.nutritionRole,
    })),
  });
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let force = false;
  try {
    const body = (await req.json()) as { force?: unknown };
    force = body.force === true;
  } catch {
    /* no body is the ordinary case */
  }

  const { error, decided } = await decide(admin, force);
  if (error) {
    return Response.json({ error: "lookup_failed", message: error }, { status: 500 });
  }

  // Boxes first, and independently: they are a different kind of row and a
  // batch of formulas that is already all written is no reason to leave a
  // carton open to the discovery screen.
  const boxes = await writeBoxes(admin);

  // Also independent of the formula write, and for the same reason: these rows
  // are already ours and are not waiting on anything. A batch with nothing new
  // to write is no reason to leave sixteen photographs without a panel.
  const panels = await writePanels(admin, decided);

  const toWrite = decided.filter((d) => d.verdict === "write");
  if (toWrite.length === 0) {
    return Response.json({
      ok: true,
      written: 0,
      panelsFilled: panels.filled,
      reportsCleared: await clearReports(admin, panels.codes),
      boxes,
      counts: summarise(decided),
      conflicts: decided
        .filter((d) => d.verdict === "conflict")
        .map((d) => ({ code: d.printed, name: `${d.brands} ${d.productName}` })),
    });
  }

  const now = new Date().toISOString();
  const rows = toWrite.map((c) => ({
    code: c.code,
    found: true,
    // Not "verified": nobody photographed this pack. See the note above.
    source: "community",
    mode: "pet",
    brands: c.brands,
    product_name: c.productName,
    ingredients_text: c.ingredients,
    species: c.species,
    food_form: c.foodForm,
    // Two independent signals agree on every one of these — the pack's own
    // range name and a list that opens with broth or water.
    food_form_confirmed: true,
    moisture_percent: c.analysis?.moistureMax ?? null,
    guaranteed_analysis: c.analysis && hasAnyFigure(c.analysis) ? c.analysis : null,
    // `nutrition_role` was deliberately NOT set here while every seeded product
    // was a canned dinner: the AAFCO feeding statement was not in the source,
    // and guessing re-creates the error the field exists to remove.
    //
    // Batch 017 seeded Friskies Party Mix, which is a treat, and the reasoning
    // stopped holding. `detectNutritionRole` is not a guess — it is the same
    // conservative detector the capture route uses, it fires only on wording a
    // maker chose, and it answers "unknown" for everything else. Run across the
    // 190 products seeded before this change it returns unknown for all 190, so
    // nothing that was working changes; Party Mix returns "treat" because
    // "party mix" is in the module's own list of ranges that are not dinner.
    //
    // Writing null instead would tell the report to judge a bag of crunchy
    // snacks by whether it has real meat near the top, and report back that a
    // cat's treat is a poor food. Nothing on the page would look wrong.
    //
    // Stored as null when unknown, not as the string: null is the column's
    // "nothing was established", and it is what the 190 already hold.
    nutrition_role: c.nutritionRole === "unknown" ? null : c.nutritionRole,
    //
    // `requires_vet` is the opposite case, and used to be hardcoded `false`
    // here. That was not "unknown" — false is the assertion that a product is
    // NOT a therapeutic diet, and the consumer report reads it as one, dropping
    // back to judging by "is there real named meat near the top". Applied to a
    // renal or hydrolysed diet that is the exact category error lib/vet-diet.ts
    // was written to prevent, about a food a vet prescribed.
    //
    // It cost nothing to get right: the evidence is the range name, which is
    // already here.
    requires_vet: c.requiresVet,
    image_url: null,
    reason: null,
    created_at: now,
    composition_key: c.compositionKey,
  }));

  let { error: writeError } = await admin
    .from("barcode_cache")
    .upsert(rows, { onConflict: "code" });
  if (writeError && isUndefinedColumn(writeError)) {
    const retry = await admin
      .from("barcode_cache")
      .upsert(withoutColumns(rows, NEW_COLUMNS), { onConflict: "code" });
    if (!retry.error) writeError = null;
  }
  if (writeError) {
    return Response.json(
      { error: "write_failed", message: writeError.message },
      { status: 500 }
    );
  }

  const reportsCleared = await clearReports(admin, [
    ...toWrite.map((c) => c.code),
    // A panel-filled row needs this every bit as much: its stored report was
    // written when there were no figures to do dry-matter arithmetic with.
    ...panels.codes,
  ]);

  return Response.json({
    ok: true,
    written: toWrite.length,
    panelsFilled: panels.filled,
    reportsCleared,
    boxes,
    counts: summarise(decided),
    conflicts: decided
      .filter((d) => d.verdict === "conflict")
      .map((d) => ({ code: d.printed, name: `${d.brands} ${d.productName}` })),
    // Products whose formula the source itself flagged as having older records
    // under the same barcode. Written, and worth knowing about.
    flagged: toWrite
      .filter((d) => d.conflictNote)
      .map((d) => ({ code: d.printed, note: d.conflictNote })),
  });
}
