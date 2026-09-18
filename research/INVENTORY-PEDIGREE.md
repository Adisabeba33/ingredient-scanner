# Pedigree — what the catalog already holds

Baseline for the Pedigree campaign, captured from the current `main` repository state before this batch was written. The binding brief requires the canonical command:

```bash
node scripts/brand-inventory.mjs "Pedigree" > research/INVENTORY-PEDIGREE.md
```

**Execution note for this session:** the connected GitHub environment exposes repository reads/writes but no shell command runner. I therefore did not claim that the command above was executed. This file records the equivalent pre-research snapshot confirmed from the live repository and the brief; the exact generator command remains a mandatory gate before commit.

- Owner on record: **Mars**
- Species: **dog**
- Products in `data/known-products.ts`: **0**
- Formula rows in `data/known-formulas.ts`: **0**
- Variety packs/cases in `data/known-multipacks.ts`: **0**
- Pedigree rows in `data/wrong-barcodes.ts`: **0**
- Existing Pedigree research ledgers before this campaign: **0**
- Pedigree entries in `docs/CATALOG-CONFLICTS.md`: **0**
- Ranges the brand entry names: **6** — **0** hold products

## Ranges named but EMPTY

- **Complete Nutrition**
- **Choice Cuts**
- **Chopped Ground Dinner**
- **High Protein**
- **Puppy**
- **DentaStix**

## Existing product/barcode inventory

None. The production catalog held no Pedigree barcode before this campaign.

## GS1 context already present in the repository

`data/gs1-prefixes.ts` already recognizes `023100` as a Mars Petcare US prefix shared by Sheba and sibling brands. This is a maker-level clue only, not brand proof. Every Pedigree record still requires pack/product evidence that the item itself is PEDIGREE.

## Live exclusion check for Batch 1 candidates

The 20 candidate UPCs prepared for Batch 1 were searched across the connected repository after selection. No exact matches were returned for any of the 20 codes. This is supporting evidence only; `scripts/check-ledger.mjs` remains the authoritative pre-commit collision gate.
