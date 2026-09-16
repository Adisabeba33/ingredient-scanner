import { brandKey, brandMatchesQuery, seededIdentities } from "./brand-key";
import { knownItems } from "./known-products";
import { printedForm } from "./miss-verdict";
import { isHit, summarise, type RunSummary, type TestScan } from "./scan-test";

/**
 * Walking ONE brand's shelf, rather than a whole aisle.
 *
 * ── The question this answers that the aisle walk cannot ──────────────────
 *
 * Test Mode measures a shelf: scan everything in front of you, find out what
 * fraction the app answers. That number is the truth about the product and it
 * is the gate on the release.
 *
 * It is also nearly useless for deciding what to research next. A 40% aisle
 * says we are missing three cans in five; it does not say WHICH three, and the
 * misses it produces are scattered across every maker in the aisle — one
 * Friskies, two Orijen, a Sheba, four brands we have never seeded. Nothing in
 * that list is a batch, and the seeding process this repository is built
 * around (`docs/SEEDING-A-BATCH.md`) works in batches: one brand, its whole
 * range, all its pack sizes, in one pass.
 *
 * So there is a second walk. You stand in front of Fancy Feast, tell the tool
 * that is where you are, and scan that section end to end. What comes back is
 * not a rate to report — it is **the list of Fancy Feast barcodes that exist
 * in a real shop and are not in our catalog**, which is exactly the input a
 * research brief needs and the one thing nobody has been able to produce.
 *
 * ── Why the OPERATOR names the brand, and not the code ────────────────────
 *
 * This is the whole mechanism, and it is worth being explicit about.
 *
 * A miss has no brand. That is what a miss IS: nobody holds this code, so
 * nothing anywhere can say whose it is. `classifyMiss` can sometimes name the
 * MAKER from the GS1 prefix, which is a different and coarser fact — the
 * prefix under a Fancy Feast tin says "Nestlé Purina", the same as Friskies,
 * Pro Plan and Beneful.
 *
 * The person holding the tin knows. They are standing in front of a shelf
 * strip that says Fancy Feast, and that knowledge exists nowhere else in the
 * system and cannot be recovered afterwards from the digits. Recording it at
 * the moment of the scan is the only chance anyone gets.
 *
 * So the chosen brand is treated as EVIDENCE — a human observation, made in
 * the shop, stored with the code — and not as a guess to be second-guessed
 * later.
 *
 * ── The one way that evidence goes wrong, and the guard for it ────────────
 *
 * A tin in the wrong place. Somebody picked up a Friskies can, changed their
 * mind in the next aisle and put it down among the Fancy Feast. Scan it while
 * "Fancy Feast" is selected and, unguarded, it would be filed as a Fancy Feast
 * barcode to research — and a research brief that starts from a wrong barcode
 * wastes the whole batch.
 *
 * It cannot always be caught: a code nobody holds tells us nothing. But when
 * the app DOES answer and names a brand, the two can be compared, and that
 * catches the case that actually happens — a stray can of something already
 * in the catalog. `brandFit` does that comparison; the screen shows the
 * disagreement rather than resolving it, because the tin is in the operator's
 * hand and the screen is not.
 *
 * ── Why a brand walk accumulates and an aisle walk does not ───────────────
 *
 * An aisle run is one person, one shop, one afternoon: mixing two of them
 * averages two different shelves into a number that describes neither, which
 * is why `TestScanner` keeps it in the browser and clears it between walks.
 *
 * A brand walk is asking something else — "of every Fancy Feast barcode I have
 * ever met in a real shop, how many do we answer?" — and that question wants
 * every shop and every visit added together. Petco today, PetSmart next week,
 * the corner place after that: each adds barcodes the others did not carry,
 * and the deduplication by code in `addScan` makes the union correct rather
 * than double-counted.
 *
 * So brand walks are kept per brand and never cleared on their own.
 */

/** One brand as the picker offers it. */
export interface BrandChoice {
  /** Stable grouping key — the same one the coverage page groups by. */
  key: string;
  name: string;
  owner: string | null;
  species: "cat" | "dog" | "both" | null;
  /**
   * How many recipes we already hold a lead for under this brand
   * (`data/known-products.ts`), and how many barcodes those recipes carry.
   *
   * Shown in the picker because it answers "which shelf is worth my walk?"
   * before the walk. A brand at zero is a whole section nobody has touched;
   * a brand at ninety is one where the walk mostly confirms what we have.
   */
  seededProducts: number;
  seededCodes: number;
}

/**
 * Every seeded brand, with what we already hold under it.
 *
 * Built from the seed list rather than from the catalog on purpose: the
 * picker has to offer brands we have NOTHING for, because those are the ones
 * most worth walking. A list built from what we hold could never name them.
 */
export function brandChoices(): BrandChoice[] {
  const products = new Map<string, { products: number; codes: number }>();
  for (const item of knownItems()) {
    const key = brandKey(item.brand);
    if (!key) continue;
    const at = products.get(key) ?? { products: 0, codes: 0 };
    at.products += 1;
    at.codes += item.codes.length;
    products.set(key, at);
  }

  return seededIdentities()
    .map((brand) => {
      const held = products.get(brand.key) ?? { products: 0, codes: 0 };
      return {
        key: brand.key,
        name: brand.name,
        owner: brand.owner,
        species: brand.species,
        seededProducts: held.products,
        seededCodes: held.codes,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The picker's filter.
 *
 * Delegates to `brandMatchesQuery`, so typing the parent company finds its
 * brands — "purina" reaches Fancy Feast, which is what a thumb in a shop
 * actually types.
 */
export function searchBrandChoices(
  choices: BrandChoice[],
  query: string
): BrandChoice[] {
  return choices.filter((choice) => brandMatchesQuery(choice, query));
}

/** Whether the app's answer agrees with the shelf the operator says they are at. */
export type BrandFit =
  /** The app named this brand. The observation is confirmed. */
  | "match"
  /** The app named a DIFFERENT brand — a stray tin, or the wrong shelf. */
  | "different"
  /** Nothing named a brand, which is the ordinary case for a miss. */
  | "unnamed";

/**
 * Compare the chosen brand with whatever the app called this code.
 *
 * Folded through `brandKey` on both sides, so "Purina Fancy Feast" off a pack
 * and "Fancy Feast" in the picker are one brand rather than two.
 */
export function brandFit(
  chosenKey: string,
  answeredBrands: string | null | undefined
): BrandFit {
  if (!chosenKey) return "unnamed";
  const answered = brandKey(answeredBrands);
  if (!answered) return "unnamed";
  return answered === chosenKey ? "match" : "different";
}

/**
 * The misses worth putting in a research brief, most actionable first.
 *
 * Two kinds are dropped rather than ranked low:
 *
 * · `not-a-barcode` — a misread. Padding a research queue with digits that
 *   are not a product is how a queue stops being read.
 * · `known-wrong-barcode` — `data/wrong-barcodes.ts` has already decided what
 *   this code is. Re-researching a question we answered is the one kind of
 *   work this whole tool exists to prevent.
 *
 * Everything else stays, including the ones that need no research at all
 * (`seeded-not-imported` is one button on this desk) — because a list that
 * silently dropped those would have the operator walk back to a shelf for a
 * product that was already sitting in the seed.
 */
export function researchQueue(scans: TestScan[]): TestScan[] {
  const RANK: Record<string, number> = {
    "seeded-not-imported": 0,
    "seeded-no-formula": 1,
    "absent-known-maker": 2,
    "absent-unknown-maker": 3,
    "known-multipack": 4,
  };
  return scans
    .filter((scan) => !isHit(scan.outcome))
    .filter(
      (scan) =>
        scan.miss?.verdict !== "not-a-barcode" &&
        scan.miss?.verdict !== "known-wrong-barcode"
    )
    .sort((a, b) => {
      const byRank =
        (RANK[a.miss?.verdict ?? ""] ?? 9) - (RANK[b.miss?.verdict ?? ""] ?? 9);
      return byRank !== 0 ? byRank : a.at - b.at;
    });
}

export interface BrandWalkSummary extends RunSummary {
  /** Codes seen on this brand's shelf that are worth researching. */
  toFind: number;
  /** Scans whose answer named some other brand — a stray tin, or a wrong shelf. */
  strays: number;
}

/**
 * A brand walk, counted.
 *
 * The same rates as an aisle walk, because they still mean something for one
 * brand — but the number this screen leads with is `toFind`, not the rate. A
 * brand walk is not run to produce a percentage; it is run to come home with a
 * list.
 */
export function summariseBrandWalk(
  scans: TestScan[],
  chosenKey: string
): BrandWalkSummary {
  return {
    ...summarise(scans),
    toFind: researchQueue(scans).length,
    strays: scans.filter(
      (scan) => brandFit(chosenKey, scan.answeredBrand) === "different"
    ).length,
  };
}

/**
 * The walk as a spreadsheet, ready to paste into a research brief.
 *
 * The brand column is the reason this exists rather than reusing `toTsv`: the
 * operator's observation is the one fact in the row that cannot be recovered
 * from anything else, and a file that dropped it on the way out would throw
 * away the only thing the walk added.
 *
 * Codes are printed rather than canonical, for the same reason as in
 * `toTsv` — they are going into a retailer's search box, where two leading
 * zeros decide whether the product is found.
 */
export function brandWalkTsv(brandName: string, scans: TestScan[]): string {
  const chosenKey = brandKey(brandName);
  const rows = [
    [
      "barcode",
      "brand (observed on the shelf)",
      "outcome",
      "brand the app named",
      "agrees",
      "seed verdict",
      "name",
      "reads",
    ].join("\t"),
  ];
  for (const scan of [...scans].sort((a, b) => a.at - b.at)) {
    const fit = brandFit(chosenKey, scan.answeredBrand);
    rows.push(
      [
        printedForm(scan.code),
        brandName,
        scan.outcome,
        scan.answeredBrand ?? "",
        fit === "unnamed" ? "" : fit === "match" ? "yes" : "NO",
        scan.miss?.verdict ?? "",
        scan.name ?? "",
        String(scan.times),
      ].join("\t")
    );
  }
  return rows.join("\n");
}
