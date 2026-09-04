# Reveal Deep Research Handoff

Updated: 2026-08-31  
Branch: `agent/deep-research-reveal`  
Ledger: `research/deep-research-reveal.json`  
Contract: `research/AGENTS.md` + `research/BRIEF-REVEAL.md`

## 1. Brand identity

**Pack spelling:** `Reveal`.

Reveal is a brand of **MPM Products Limited**. The current US site identifies **MPM Products USA Inc.** as the US entity. MPM owns Reveal, Applaws and Encore. 3i completed the sale of MPM in September 2025 to **Partners Group**.

Useful ownership chain for a later catalog-maintenance pass:

`Reveal → MPM Products Limited → Partners Group`

Current Reveal products encountered in this campaign are for cats. The existing repository brand metadata should be reviewed separately; this research branch does not edit production catalog files.

Reveal's current FAQ says its wet food is made in Thailand. Do not generalize that country to every historical/non-wet SKU without package-level evidence.

## 2. Repository knowledge established

- **GS1/company block:** `886817` belongs to the MPM Products product family. It is not Reveal-exclusive.
- **Confirmed range:** `Entrées`.
- **Owner:** MPM Products Limited; MPM is owned by Partners Group.
- **Species observed:** current Reveal catalog researched here is cat-only.
- **Rejected assignment lead:** `5060218988663` is not Reveal; do not register `5060218` to Reveal.
- **Vocabulary:** no new `texture` or `presentation` value is required by batches 1–2.

## 3. Market / formula-generation rule

Do **not** combine a US UPC identity with a non-US nutrition panel merely because the recipe name looks the same.

This campaign repeatedly found current Reveal pages that conflict with another current Reveal assortment page, a current exact-UPC retailer page, or an MPM page carrying a US-suffixed SKU. Common failures include fat/fiber values swapped, a kitten page printing 9% versus 89% moisture, and manufacturer panels whose printed minima/maxima sum above 100%.

Where exact UPC/size identity is established but the current US printed formula generation is not, the record remains `needs_physical_label` with formula fields null. No field is selected merely to make the checker happy.

## 4. Coverage after batch 2

### `source_verified`
- Entrées Chicken Breast Paté Recipe, 2.47 oz individual can.
- Entrées Fish Paté Selection, 12 × 2.47 oz outer pack.
- Entrées Chicken Selection in Broth, 12 × 2.47 oz outer pack.
- Fish Selection in Broth, 18 × 2.47 oz outer pack.
- Legacy broth assortment outer packs researched in batch 1.
- Chicken and Tuna lickable-treat four-pouch outer packs.
- Fish Bone Broth with Tuna Fillet, Chicken Bone Broth with Chicken Breast, Freeze Dried Tuna Bites, and Whole Salmon Loin individual treats.

### `needs_physical_label`
- Nine legacy 2.47 oz broth tins from batch 1 because current web evidence does not establish one reliable US printed GA generation.
- Adult Chicken dry 3 lb, Adult Whitefish dry 3 lb, and Kitten Chicken dry 2.5 lb because current manufacturer/retailer GA presentations conflict.
- Entrées Tuna Fillet, Tuna with Mackerel, and Tuna with Salmon pâté cans because current manufacturer pages swap the printed 1%/2% fat/fiber values.
- Four Entrées-in-Broth individual cans (Tuna with Crab, Chicken with Duck, Tuna with Shrimp, Chicken with Chicken Liver) because the current manufacturer GA fails the physical-consistency gate.
- Kitten Tuna Fillet in Broth and Kitten Chicken Breast in Broth; the latter includes the explicit 9% versus 89% moisture collision.
- Whole Tuna Filet Treat and Freeze Dried Chicken Breast treat.
- Three individual gravy cans: Chicken Breast, Tuna Fillet, and Tuna Fillet with Salmon.

## 5. Multipack rule

Outer multipacks with proven outer UPC/size identity may be `source_verified` even when `contains` is empty. `contains` is intentionally empty unless the barcodes physically printed on the inner units are independently proven. No neighboring-code inference is allowed.

## 6. Batch 2 identity notes

Two Entrées-in-Broth UPCs were reconstructed from retailer item bodies only by computing the UPC-A check digit, which `BRIEF-REVEAL.md` allows:
- item body `0088681701460` → `886817014603` (check digit 3), Tuna Fillet with Shrimp in Broth.
- item body `0088681701455` → `886817014559` (check digit 9), Chicken Breast with Chicken Liver in Broth.

These are checksum completions of retailer-provided item bodies, not neighboring-UPC guesses.

## 7. Running totals

After batch 2:
- records: 40
- source_verified: 14
- needs_physical_label: 26
- candidate: 0
- rejected: 0
- individual_unit: 31
- multipack: 9

Batch 2 itself:
- added: 20
- source_verified: 3
- needs_physical_label: 17
- individual_unit: 18
- multipack: 2

The low batch-2 verified count is intentional. Identity is established for all 20, but 17 current formula panels are not trustworthy enough to promote without a physical US label.

## 8. Checker

Immediately before the batch-2 write, the 40-record ledger was checked with:

`node scripts/check-ledger.mjs research/deep-research-reveal.json`

Expected result:
- 0 ERROR
- 3 WARN, all inherited from batch 1 and already answered:
  - `886817013552`: 95% moisture, liquid fish bone-broth treat.
  - `886817006905`: 28% protein, moist single-ingredient salmon loin treat.
  - `886817013545`: 95% moisture, liquid chicken bone-broth treat.

No new checker warning is introduced by batch 2.

## 9. Next research tail

Priority for the next pass:
- remaining current Entrées individual recipes and assortment packs;
- remaining dry bag sizes if exact sellable UPCs can be proven;
- remaining kitten products and kitten multipacks;
- remaining freeze-dried, loin, bone-broth and lickable treats;
- current pouches/cups and gravy/broth assortment configurations;
- historical/discontinued tail only when exact UPC + size + formula generation can be defended.

Do not spend the next batch re-researching the 26 physical-label blockers unless new primary/package evidence appears.
