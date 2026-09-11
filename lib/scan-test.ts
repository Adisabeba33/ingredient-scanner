import { printedForm } from "./miss-verdict";
import type { MissClassification } from "./miss-verdict";

/**
 * Test Mode — walking a shop aisle to find out what our hit rate actually is.
 *
 * ── The question nothing else in this tool answers ────────────────────────
 *
 * Every other surface here measures what we HAVE. The coverage page counts
 * products; the miss list counts the codes people looked for and did not get.
 * Both are shaped by what has already happened: the coverage page by what we
 * chose to research, the miss list by which shoppers happened to scan what.
 *
 * Neither can answer "if I walk into a dog-food aisle and scan everything on
 * the shelf, what fraction of it do we answer?" That number is the product,
 * from the only point of view that matters, and it is not derivable from a
 * catalog of 820 products because nobody knows how many products the shelf
 * holds or which ones.
 *
 * So it is measured instead: scan twenty cans, count the answers.
 *
 * ── Why this asks the consumer app rather than our own database ───────────
 *
 * Because "we have a row" and "the shopper gets an answer" are different
 * questions, and the gap between them is exactly what a hit-rate test is for.
 *
 * A row in `barcode_cache` can hold a name and no ingredient list, a negative
 * cache, a guaranteed analysis somebody deposited, or a decision that the code
 * is a box. None of those is a product, and the consumer app refuses to serve
 * them — its `isServableRow` requires a source AND text that parses as a real
 * ingredient list, using a parser and dictionaries that live in that repo and
 * cannot be sensibly copied here.
 *
 * And in the other direction: for a code we hold nothing for, the consumer app
 * falls back to the open databases by itself, so a shopper may well get an
 * answer we had no part in. Counting that as a miss would understate what the
 * app does; counting it as ours would overstate what we do. It is neither, and
 * so it gets its own bucket.
 *
 * The only honest way to ask both questions at once is to ask the shopper's
 * own endpoint, `/api/barcode`, and read what comes back. A second
 * implementation of "would this serve" would be two facts written twice, and
 * the one that went stale would be the one nobody was looking at.
 *
 * ── This module is the half that has no network in it ─────────────────────
 *
 * Mapping an answer to an outcome, keeping a run, and counting it up. The
 * asking is in app/api/scan-test/route.ts.
 */

/**
 * What the shopper got, in the five kinds that need different work.
 *
 * The split inside "hit" is the interesting one. Both halves are a shopper
 * walking away satisfied; only one of them is us.
 */
export type ScanOutcome =
  /** Our catalog answered — a verified or community row with a real list. */
  | "ours"
  /** An open database answered. The app works; we had nothing to do with it. */
  | "open"
  /**
   * A box. Not a product and not a failure: the app says "that's a variety
   * pack" and the shopper knows to scan a tin instead. Counted apart from both
   * because calling it either would be a lie in one direction.
   */
  | "multipack"
  /**
   * Known and unservable — a row exists carrying a name, a panel or nothing,
   * with no ingredient list. The worst kind of miss and the easiest to miss:
   * from the aisle it looks identical to a code nobody has ever heard of, and
   * it means somebody already touched this product and left it half-written.
   */
  | "no-ingredients"
  /** Nobody has it. Ours to research, or nobody's. */
  | "not-found";

/** Buckets in the order the review should read them. */
export const OUTCOME_ORDER: ScanOutcome[] = [
  "ours",
  "open",
  "multipack",
  "no-ingredients",
  "not-found",
];

export function outcomeLabel(outcome: ScanOutcome): string {
  if (outcome === "ours") return "ours — the catalog answered";
  if (outcome === "open") return "open databases — the app answered, we did not";
  if (outcome === "multipack") return "a variety pack — scan a tin instead";
  if (outcome === "no-ingredients") return "known, no ingredient list — half-written";
  return "nobody has it";
}

/**
 * Did the shopper walk away with something?
 *
 * A box counts. It is a real answer to the question asked — "this code is a
 * case of several products" is useful and true — and marking it a failure
 * would push the desk towards deleting box rows to improve a number.
 */
export function isHit(outcome: ScanOutcome): boolean {
  return outcome === "ours" || outcome === "open" || outcome === "multipack";
}

/** The sources the consumer app records for a row it holds itself. */
const OUR_SOURCES = new Set(["verified", "community"]);

/** The shape of the consumer's `/api/barcode` answer that this needs. */
export interface ConsumerAnswer {
  found?: boolean | null;
  source?: string | null;
  reason?: string | null;
}

/**
 * Which bucket an answer from the consumer app falls in.
 *
 * Deliberately total and deliberately pessimistic about shapes it does not
 * recognise. An answer that says `found` with no source is not a shape the
 * consumer app produces, and guessing "ours" about it would inflate the one
 * number this whole exercise exists to measure honestly.
 */
export function outcomeOf(answer: ConsumerAnswer | null | undefined): ScanOutcome {
  if (!answer) return "not-found";
  if (answer.found) {
    return OUR_SOURCES.has(answer.source ?? "") ? "ours" : "open";
  }
  if (answer.reason === "multipack") return "multipack";
  if (answer.reason === "no-ingredients") return "no-ingredients";
  return "not-found";
}

/** One scanned code in a run. */
export interface TestScan {
  /** The storage key, as the catalog would hold it. */
  code: string;
  outcome: ScanOutcome;
  /** What the app called it, where it named anything. */
  name: string | null;
  /** Which database answered, for a hit. */
  source: string | null;
  /** What the seed says about a code the app could not serve. */
  miss: MissClassification | null;
  /** When it was scanned, so a run can be reviewed in order. */
  at: number;
  /** How many times this same code was scanned in this run. */
  times: number;
}

/**
 * Add a scan to a run, or fold it into the one that is already there.
 *
 * Deduplicating by code is not tidiness, it is the measurement. A shelf has
 * one of each product and an aisle walk scans each once — but a reader fires
 * twice on a good barcode more often than not, and a person re-scans a can
 * they are unsure registered. Counting those again would move the hit rate by
 * whichever kind of product happened to stutter.
 *
 * The repeat is kept as a count rather than discarded, because a code that
 * needed scanning four times is saying something about the reader.
 */
export function addScan(run: TestScan[], scan: Omit<TestScan, "times">): TestScan[] {
  const at = run.findIndex((s) => s.code === scan.code);
  if (at === -1) return [{ ...scan, times: 1 }, ...run];
  const existing = run[at];
  const merged: TestScan = { ...scan, times: existing.times + 1 };
  return [merged, ...run.slice(0, at), ...run.slice(at + 1)];
}

export interface RunSummary {
  /** Distinct products scanned. */
  total: number;
  /** Distinct products the app answered, boxes included. */
  hits: number;
  /** Hits as a percentage, rounded to a whole number. Null when nothing scanned. */
  hitRate: number | null;
  /** The share of everything scanned that OUR catalog answered. */
  ourRate: number | null;
  byOutcome: Record<ScanOutcome, number>;
  /** Reader stutter: scans made, against distinct products. */
  reads: number;
}

const EMPTY_BY_OUTCOME = (): Record<ScanOutcome, number> => ({
  ours: 0,
  open: 0,
  multipack: 0,
  "no-ingredients": 0,
  "not-found": 0,
});

/**
 * The run, counted.
 *
 * Two rates rather than one, because they answer different questions and the
 * difference between them is the whole argument for doing more research: the
 * hit rate is what the shopper experiences, and the "ours" rate is how much of
 * that we are responsible for. An app that scores 70% on somebody else's data
 * is one open database outage away from scoring nothing.
 */
export function summarise(run: TestScan[]): RunSummary {
  const byOutcome = EMPTY_BY_OUTCOME();
  let reads = 0;
  for (const scan of run) {
    byOutcome[scan.outcome] += 1;
    reads += scan.times;
  }
  const total = run.length;
  const hits = run.filter((s) => isHit(s.outcome)).length;
  return {
    total,
    hits,
    hitRate: total ? Math.round((hits / total) * 100) : null,
    ourRate: total ? Math.round((byOutcome.ours / total) * 100) : null,
    byOutcome,
    reads,
  };
}

/**
 * The run as a spreadsheet, in printed barcode form.
 *
 * Printed rather than canonical because the codes leave here to be pasted into
 * a retailer's search box or a research brief, where two leading zeros are the
 * difference between finding the product and finding nothing. See
 * `printedForm` in lib/miss-verdict.ts.
 */
export function toTsv(run: TestScan[]): string {
  const rows = [
    ["barcode", "outcome", "name", "source", "seed verdict", "reads"].join("\t"),
  ];
  for (const scan of [...run].sort((a, b) => a.at - b.at)) {
    rows.push(
      [
        printedForm(scan.code),
        scan.outcome,
        scan.name ?? "",
        scan.source ?? "",
        scan.miss?.verdict ?? "",
        String(scan.times),
      ].join("\t")
    );
  }
  return rows.join("\n");
}
