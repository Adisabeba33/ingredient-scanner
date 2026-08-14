/**
 * The GS1 company prefixes the seed holds products under, and whose each is.
 *
 * ── Why this is a data file and not two constants ─────────────────────────
 *
 * A barcode's first six digits are assigned to one company. That makes the
 * prefix a cheap check on a barcode nobody has scanned yet: a digit typed into
 * the wrong column almost always lands on a prefix belonging to nobody, and
 * saying so before the row is written costs nothing.
 *
 * It was two hardcoded `"050000"` string literals — one in
 * `scripts/check-batch.mjs`, one in `lib/known-products.test.ts` — for fourteen
 * batches, because every product was Purina. The first Hill's batch made all
 * twenty of its rows read FAIL, for the sole reason of being Hill's.
 *
 * Twenty false failures is worse than no check at all. It is exactly how
 * somebody learns to read past the word FAIL, and the run that matters is the
 * one after they learned it. The same thing had already happened once in this
 * repository with the wrong-barcodes list, which is why that is a data file
 * too — see `data/wrong-barcodes.ts`.
 *
 * ── What a missing prefix means ───────────────────────────────────────────
 *
 * Not "wrong". A prefix that is not here is a maker we have not seeded before,
 * which is an ordinary thing that will keep happening. The check asks for a
 * human to look, and adding a line here is the answer when the look says the
 * maker is real.
 */

export interface Gs1Prefix {
  /** The first six digits of the UPC-A. */
  prefix: string;
  /** Who GS1 assigned it to. */
  maker: string;
}

export const GS1_PREFIXES: Gs1Prefix[] = [
  { prefix: "050000", maker: "Nestlé Purina" },
  { prefix: "052742", maker: "Hill's Pet Nutrition" },
];
