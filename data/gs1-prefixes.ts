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
  { prefix: "030111", maker: "Royal Canin (Mars Petcare)" },
  // New Zealand, and the first non-American maker here — so the first entries
  // that are EAN-13 rather than UPC-A. "942" is GS1 New Zealand; the seven
  // digits below are Ziwi's own two company prefixes under it, and matching is
  // by string prefix rather than by a fixed six digits precisely so that a
  // maker's prefix may be as long as GS1 made it.
  { prefix: "9421016", maker: "Ziwi (New Zealand)" },
  { prefix: "9421038", maker: "Ziwi (New Zealand)" },
  // Merrick keeps its own prefix under Nestlé Purina, which bought it in
  // 2015 — the packs still carry 022808 rather than Purina's 050000.
  { prefix: "022808", maker: "Merrick (Nestlé Purina)" },
  // The first maker whose codes arrive at more than one packaging level: the
  // single can is 818336…, the twelve-pack it sits in is 10818336… and the
  // case is 20818336…. That leading digit is a GS1 packaging indicator, not a
  // different company, so ONE entry covers all three — see `gs1Body` in
  // lib/known-products.ts for the normalisation both askers now do first.
  { prefix: "818336", maker: "I and love and you" },
  // Blue Buffalo runs two company prefixes side by side, and both are on the
  // shelf right now: the Weight Control 3 lb bag is 859610 and the 5 lb bag of
  // the same recipe is 840243. Neither is historical, so neither can be left
  // out — a maker having one prefix was an assumption, not a rule.
  { prefix: "840243", maker: "Blue Buffalo (General Mills)" },
  { prefix: "859610", maker: "Blue Buffalo (General Mills)" },
  // Both arrived from the "looked for, not found" list rather than from a
  // research campaign — real scans in a real shop, which is how a prefix ought
  // to reach this file.
  //
  // Purina's SECOND prefix, and the pattern is now established rather than
  // surprising: Purina ONE and Alpo carry 017800 while Fancy Feast and
  // Friskies carry 050000, exactly as Blue Buffalo runs 840243 beside 859610.
  { prefix: "017800", maker: "Nestlé Purina" },
  { prefix: "071190", maker: "9Lives (Post)" },
  // 9Lives' OTHER prefix, and the one that shows what a brand changing hands
  // does to its barcodes. 079100 is the Del Monte-era block, and it is not
  // historical: eight products under it are on shelves right now, including
  // every large Daily Essentials bag. Both prefixes are live at once, on the
  // same shelf, because a refreshed pack gets a new code and the old pack
  // keeps selling until it runs out.
  { prefix: "079100", maker: "9Lives (Post, Del Monte-era block)" },
  // Weruva runs THREE at once — the most any maker here has. 878408 carries
  // Classic Cat and TruLuxe, 813778 the Cat Stew and Paté ranges, and 810028
  // the newer Wx, Senior and Freeze Dried lines. Nothing is retired; all three
  // are on the shelf, which is what a small maker's barcode history looks like
  // after fifteen years of adding ranges.
  { prefix: "878408", maker: "Weruva" },
  { prefix: "813778", maker: "Weruva" },
  { prefix: "810028", maker: "Weruva" },
  // TheraDiet (Rayne Nutrition), and the first two entries here whose ownership
  // was NOT independently established. Every other line above was written from
  // a maker we could confirm; these two were read off the products themselves —
  // every code we have found under either belongs to a Rayne pack, and no code
  // under either belongs to anyone else — which is evidence, but of a weaker
  // kind. GEPIR was not reachable from where this was written.
  //
  // Registered anyway, because the alternative is worse: two of the three
  // seeded TheraDiet barcodes sit under 013189, and leaving it out makes the
  // checker warn on every one of them forever, which is how a person learns to
  // read past a warning. The cost is stated plainly instead: a digit mistyped
  // into either block passes a check it would otherwise have failed. If either
  // turns out to belong to somebody else, delete the line — the products stay.
  { prefix: "013189", maker: "TheraDiet / Rayne Nutrition (observed, not GEPIR-confirmed)" },
  // Not the older of the two. Rayne runs both at once: the 24 lb Low Fat
  // Kangaroo bag on sale today is 856361001541 while the stews beside it are
  // 013189…, the same shape as Blue Buffalo's pair and 9Lives' pair above.
  { prefix: "856361", maker: "TheraDiet / Rayne Nutrition (observed, not GEPIR-confirmed)" },
];
