# ZIWI Peak Deep Research Handoff

Last updated: 2026-08-28

## Scope and workflow

Continue ZIWI Peak only. Read `research/AGENTS.md` first and treat it as binding. Active campaign branch: `agent/deep-research-barcode-ledger`. Review surface: draft PR #1.

Do not infer neighboring EANs, strip digits, substitute case codes, or combine formula generations. Barcode proof and formula proof may come from different sources, but every `source_verified` record must have an exact individual-unit barcode, valid check digit, complete current ingredient order, complete printed GA/calories, and resolved formula generation.

## Physical ledger layout

The ZIWI work is NOT yet merged into one canonical JSON. Do not assume `research/deep-research-ziwi-peak.json` contains everything.

Current files:

- `research/deep-research-ziwi-peak.json` — original 10 cat records.
- `research/.ziwi-peak-cats-append-2026-08-27-b1.json` — 20 cat records, all source-verified.
- `research/.ziwi-peak-cats-append-2026-08-27-b2.json` — 20 cat records: 17 source-verified, 3 needs physical label.
- `research/.ziwi-peak-append-2026-08-27-b3.json` — 20 dog Original Air-Dried records, all source-verified.
- `research/.ziwi-peak-append-2026-08-27-b4.json` — 20 dog wet / Steam & Dried records, all source-verified.
- `research/.ziwi-peak-append-2026-08-27-b5.json` — 20 dog treats / chews / Provenance records: 13 source-verified, 7 needs physical label.
- `research/.ziwi-peak-append-2026-08-28-b6.json` — 6 dog Raw Superboost / booster records, all `needs_physical_label` because exact barcode identity is proven but formula generation is unresolved.

Conceptual total across these files: **116 records**. Stored-status arithmetic at handoff: **100 `source_verified` + 16 `needs_physical_label`**.

Before adding anything else, build the exclusion set from the canonical file PLUS every append file above PLUS `data/known-products.ts`, `data/known-formulas.ts`, `data/wrong-barcodes.ts`, `docs/CATALOG-CONFLICTS.md`, and every other `research/deep-research-*.json` ledger.

## Batch 6 just added

All six EAN-13 check digits passed and all six were absent from the repository before the B6 write:

- `9421016590179` — Dog Gut & Immune Support, 114 g
- `9421016590162` — Dog Gut & Immune Support, 320 g
- `9421016590032` — Dog Raw Superboost Lamb, 114 g
- `9421016590049` — Dog Raw Superboost Lamb, 320 g
- `9421016590186` — Dog Skin & Coat Health, 320 g
- `9421016590100` — Dog Raw Superboost Venison, 320 g

Why all six are `needs_physical_label`: exact older SKU pages preserve an ingredient tail with both `Dried Bacillus subtilis Fermentation Product` and `Dried Enterococcus faecium Fermentation Product`, while newer formula copies for the same ranges usually list only `Dried Bacillus subtilis Fermentation Product`. Do not merge those generations. The Venison 320 g record also lacks a recoverable complete current GA/calorie panel; missing values were deliberately left null rather than borrowing the Air-Dried Venison panel.

## Important known traps

1. **Mackerel & Lamb vs Lamb wet:** some retailers assign Lamb sibling EANs to Mackerel & Lamb. Keep the independently proven mappings from B4; do not trust flavor-adjacent retailer copies.
2. **Tripe & Lamb wet:** a ZIWI renderer contains a gram/ounce typo. Preserve the conflict and use the internally consistent size/calorie evidence already documented in B4.
3. **Provenance:** historical/discontinued products have multiple formula generations. Never present Provenance as current without explicit evidence, and do not merge differing taurine/protein/calorie panels.
4. **Superboost:** older two-probiotic ingredient tails conflict with newer Bacillus-only copies. A physical pack or authoritative generation-specific label is needed before upgrading those records.
5. **Case/multipack codes:** individual-unit EAN only. Never use a carton/tray/case identifier for a single can or bag.

## Strong next leads

These were discovered but were not added to B6; re-check the live exclusion set before using them:

- `9421016590193` — Dog Skin & Coat Health, 114 g.
- `9421016590056` — Dog Raw Superboost Beef, 114 g.
- `9421016590087` — Dog Raw Superboost Beef, 320 g.
- `9421016590124` — Cat Raw Superboost Beef, 85 g; verify exact current label before filing.
- `9421016590117` — Cat Raw Superboost Venison, 85 g; exact barcode/ingredient identity has a strong retailer lead.

ZIWI also publicly announced several 2026 cat/kitten UPCs. Treat them as leads until a complete current formula/label deck is available: `9421038211243`, `9421038211212`, `9421038211267`, `9421038211564`, `9421038211571`, `9421038211595`, `9421038211588`. Do not mark them source-verified from UPC announcement alone.

## Merge note

The safest future cleanup is to programmatically merge canonical + B1–B6 into `research/deep-research-ziwi-peak.json`, parse and deduplicate the combined document, re-run global UPC/GTIN checks, commit it, re-fetch and parse it again, and only then delete staged append files. Until that happens, **do not delete or ignore any append file**.

## Recent commits

- B5 recovery commit: `c8c0d0c98a15c5fec8808077e793d281954f96ca`.
- B6 commit: `f056e42e41bba3e03dfa61775de31956039fd653`.

If continuing with another batch, use `catalog_number: null` unless a global range has explicitly been reserved.