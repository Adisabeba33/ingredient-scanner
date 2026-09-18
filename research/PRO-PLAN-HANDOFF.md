# Pro Plan Deep Research — handoff

## Campaign contract

- Brand scope: **Pro Plan** only.
- Working branch: `agent/deep-research-pro-plan` from current `main`.
- Keep the PR **DRAFT / OPEN**. Do not merge without the user's direct instruction.
- Allowed campaign files only:
  - `research/deep-research-pro-plan.json`
  - `research/INVENTORY-PRO-PLAN.md`
  - `research/PRO-PLAN-HANDOFF.md`
- Batch ceiling: 20 new records. Never pad a batch.
- Retail before Veterinary Diets. Veterinary Diets stay last.
- Canonical contract: `research/AGENTS.md`, plus `research/BRIEF-REVEAL.md` §§7–11 and `research/BRIEF-PURINA-ONE.md` §§4,6.

## Batch 1 — retail dry dog

Date: 2026-09-14

### Result

- Records added: **18**
- `source_verified`: **18**
- `needs_physical_label`: **0 added to the ledger**
- Barcode scope: **18 individual_unit**, 0 multipack/case/tray
- Channel: **18 retail**, 0 Veterinary Diets
- Species/form: **18 dog / dry**
- Current product lines represented:
  - **Complete Essentials** — 14 package UPCs
  - **Sensitive Skin & Stomach** — 4 package UPCs

### Verified package families

1. Complete Essentials Adult Shredded Blend Chicken & Rice with Probiotics
   - 15 lb — `038100101679`
   - 35 lb — `038100130594`
   - 47 lb — `038100177667`
2. Complete Essentials Adult Shredded Blend Beef & Rice with Probiotics
   - 6 lb — `038100130570`
   - 18 lb — `038100130525`
   - 35 lb — `038100130518`
   - 47 lb — `038100180537`
3. Complete Essentials Adult Shredded Blend Lamb & Rice Formula
   - 5 lb — `038100101365`
   - 15 lb — `038100101389`
   - 35 lb — `038100130631`
   - 47 lb — `038100177674`
4. Complete Essentials Adult Shredded Blend Salmon & Rice with Probiotics
   - 5 lb — `038100160515`
   - 17 lb — `038100160539`
   - 33 lb — `038100160546`
5. Sensitive Skin & Stomach Adult Salmon & Rice Formula
   - 4 lb — `038100100757`
   - 16 lb — `038100175458`
   - 30 lb — `038100175526`
   - 40 lb — `038100100771`

Every accepted record has a valid UPC-A check digit, canonical GTIN-14, current Purina formula/deck evidence, a concrete bag size, and separate evidence binding that size to the UPC.

## Evidence discipline / naming findings

### Current names vs legacy names

Several exact-UPC distributor and retailer rows still say **Savor** or **Focus**, while current Purina pages use **Complete Essentials** and **Sensitive Skin & Stomach**. For this campaign:

- current Purina manufacturer pages/decks control `product_line`, formula, ingredients, guarantees, calories, and adequacy;
- legacy Savor/Focus sources may be used only as package-identity evidence when they bind an exact UPC to an exact sellable bag size;
- do not write `Savor` or `Focus` as the current `product_line` for these five families solely because a distributor still uses the old shelf name.

Purina's current Sensitive Skin & Stomach retail copy explicitly says it was formerly known as Focus. Current Complete Essentials retailer pages likewise identify older Savor naming during the transition.

### `AdvantEDGE` is real and current

The baseline brand-range list is incomplete. Current Purina evidence confirms **AdvantEDGE** as a live Pro Plan retail line, including `AdvantEDGE Large Breed Adult 7+ Senior Support+ Shredded Blend Chicken & Rice`, with current manufacturer deck `A439025` (2025-12). It was not added to Batch 1 because the exact 12 lb / 22 lb UPC-size bindings were not yet proven to the same standard. Research it in a later dry-dog pass rather than inventing sequential UPCs.

### GS1 / company-prefix observation

All 18 independently proven Batch-1 retail UPCs begin `038100`. This is enough to record `038100` as an **observed recurring Pro Plan/Purina package prefix in this campaign**, but it is not permission to manufacture barcodes. Continue to require exact UPC evidence per package.

## Blockers deliberately NOT promoted into Batch 1

These are leads, not verified records:

- **Complete Essentials Chicken & Rice — smallest bag**: current size evidence and older distributor ladders disagree (5 lb vs legacy 6 lb, with different UPCs seen). Do not guess which UPC is on the current 5 lb bag without a current package/retailer binding.
- **Chicken & Rice intermediate size transition**: current official ladder includes 15 lb while older distributor tables also show an 18 lb legacy row. Batch 1 uses the directly evidenced current 15 lb code only.
- Any package whose retailer title, size and barcode cannot be tied to the same sellable unit stays out even if the UPC is numerically adjacent to a verified one.

## Tooling note / checker status

The GitHub connector available in this session exposes repository read/write operations but **does not expose a repository shell**, so these exact commands could not be executed inside the connected checkout:

```bash
node scripts/brand-inventory.mjs "Pro Plan" > research/INVENTORY-PRO-PLAN.md
node scripts/check-ledger.mjs research/deep-research-pro-plan.json
```

Do not reinterpret that as a passed official checker. Before Batch 2 (and before any merge), run both in a shell-enabled checkout.

What was checked in-session instead:

- `scripts/check-ledger.mjs` was read from current `main` and its schema/status/identity/calorie gates were mirrored locally against the Batch-1 JSON: **18 records, 18 unique UPCs, 0 local structural errors**;
- all 18 UPC-A check digits and GTIN-14 padding were validated;
- current `data/wrong-barcodes.ts` was inspected: no `038100…` collision;
- current `data/known-multipacks.ts` was inspected for `038100`: none;
- current `data/known-products.ts` contains no `Pro Plan` row at the pre-flight baseline;
- GitHub code search for `038100` on current default branch returned no indexed hit, but code search indexing is not strong enough to substitute for the official checker.

## Next research order

1. **Dry cat retail** next. Keep Pro Plan separate from Purina ONE; do not import Purina ONE LiveClear evidence into this ledger.
2. Continue dry dog gaps only where exact current size/UPC bindings can be proven (including AdvantEDGE).
3. Wet dog retail.
4. Wet cat retail.
5. Multipacks / variety packs with outer UPC and proven inner members.
6. **Pro Plan Veterinary Diets last**, with explicit channel proof and no assumption that a retail “sensitive”, “weight”, “kidney”, etc. health claim makes a product veterinary.

## Acceptance reminder for the next agent

`source_verified` means the exact sellable package is proven, not merely the recipe. Same recipe in a different bag size is a different barcode record. A large bag is not a case. A retail health formula is not Veterinary Diets. Prefer `needs_physical_label` or omission over a weak UPC claim.
