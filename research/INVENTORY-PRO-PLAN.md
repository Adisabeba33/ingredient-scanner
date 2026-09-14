# Pro Plan — what the catalog already holds

Generated from the current `main` inputs read by `node scripts/brand-inventory.mjs "Pro Plan"`. **Re-run it before you start** — it reads the live seed, so it is current the moment you generate it and stale the moment somebody seeds a batch.

> Execution note (2026-09-14): this connector session does not expose a repository shell, so the Node command itself could not be invoked. This snapshot reproduces the generator's output from the current `main` files inspected through GitHub before Batch 1. The official command remains a required pre-flight step in a shell-enabled session.

- Owner on record: **Nestlé Purina**
- Products: **0** under **0** barcodes
- Of those barcodes, **0** carry a full composition
- Variety packs and cases held as boxes: **0**
- Ranges the brand entry names: **12** — **0** hold products

## Ranges named but EMPTY — nothing seeded under them

These are the obvious baseline gaps from `data/us-pet-brands.ts`. The list is a starting hypothesis, not proof that every name is current.

- **Savor**
- **Sport**
- **Focus**
- **Complete Essentials**
- **Sensitive Skin & Stomach**
- **Bright Mind**
- **True Nature**
- **Development**
- **Grain Free**
- **Puppy Starter**
- **LiveClear**
- **Veterinary Diets**

## Every product held, by range

None at the pre-Batch-1 baseline.

## Codes on the do-not-file list

The brand had no seeded barcode at the pre-flight baseline, so the generator cannot narrow the repository-wide wrong-barcode list by Pro Plan's company prefix. The current wrong-barcode file contains only `050000…` Purina cat-food case/sibling hazards; none of the Batch-1 `038100…` candidates collide with it.

## Already claimed by a research ledger

None for brand `Pro Plan` at the pre-Batch-1 baseline.

## The exclusion list

Every barcode already seeded, boxed, or claimed by a Pro Plan research ledger before Batch 1. **0 codes.**

```
```

`scripts/check-ledger.mjs` is still the authoritative live collision check before commit in a shell-enabled environment.
