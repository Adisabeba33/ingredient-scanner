# Purina Dog Chow — research handoff

**Capabilities:** web research and GitHub connector were available; a shell/runtime capable of executing repository Node scripts was not available, so the campaign used the `research/incoming/` fallback required by `AGENTS.md` §3a. No checker exit code is claimed.

## Campaign result

- Staged records: **32** across **32** unique UPCs.
- `source_verified`: **27 / 32**.
- `needs_physical_label`: **5 / 32**.
- Incoming files: `research/incoming/purina-dog-chow-batch-01.json` (20) and `research/incoming/purina-dog-chow-batch-02.json` (12).
- Range counts in staged research: `Complete Adult` 18, `Little Bites` 4, `High Protein` 10.
- Additional unresolved leads are preserved in `research/PURINA-DOG-CHOW-CANDIDATES.json`.

## Evidence and label decks

Current Purina label decks were found and used where the exact formula matched. Current deck codes represented in the staged research include `H410123` (Complete Adult Chicken), `G412423` (Complete Adult Beef), `M412023` (Little Bites), `A410624` (High Protein Beef dry), `A410724` (High Protein Chicken dry), `C412822` (High Protein Chicken gravy), `C412722` (High Protein Beef gravy), `B412922` (High Protein Lamb gravy), and `B413022` (High Protein Turkey gravy).

Five staged records remain `needs_physical_label`: three Complete Adult Lamb sizes from batch 01, where a current exact formula deck was not established, plus High Protein Classic Ground Chicken `017800183529` and Beef `017800183499`, where exact manufacturer decks were found only on Purina's older `products/files` path and currentness was not overstated.

## Prefix

The proven Dog Chow package UPCs in this campaign overwhelmingly use Purina prefix **`017800`**. Do not infer unobserved UPCs from that prefix. One Healthy Weight lead, `654163977954`, is intentionally retained only as `candidate_low_confidence` because it falls outside the proven prefix and may be a reseller/bundle identifier.

## Puppy / Puppy Chow boundary

**Dog Chow Puppy records taken: 0. Puppy Chow-branded records taken: 0.** Current Purina surfaces encountered in this pass treat **Puppy Chow** separately from **Dog Chow**, and no sufficiently proven current front-of-pack `DOG CHOW` / Puppy-range package was established. Do not fill the seeded Dog Chow `Puppy` range from Puppy Chow packages. A future agent should require a front-of-pack DOG CHOW witness before adding that range.

## Little Bites

**Little Bites is supported as a real Dog Chow range, not merely a kibble-size descriptor.** Current manufacturer deck `M412023` is titled for DOG CHOW LITTLE BITES FOR SMALL DOGS. Four Little Bites package records are staged across the campaign, including the later verified 3.2 lb UPC `017800104067`.

## Healthy Weight and preserved dead ends

No Healthy Weight record was promoted. `017800153317` (4 lb) is retained as a credible follow-up candidate because exact product/size identity evidence was found but a current exact Purina formula deck was not established. `654163977954` (32 lb) is low-confidence and must not be filed without physical-package proof.

The candidate parking lot is deliberate: it prevents a later agent from repeating the same discovery work while keeping weak evidence out of the research ledger.

## Required next-agent procedure

1. Read `research/AGENTS.md`, `research/BRIEF-PURINA-DOG-CHOW.md`, this handoff, both incoming batch files, and `research/PURINA-DOG-CHOW-CANDIDATES.json`.
2. **Do not redo discovery first.** Start by integrating the two incoming arrays into `research/deep-research-purina-dog-chow.json` using a shell-capable checkout.
3. Re-check every UPC against the live ledgers/exclusions at that time and resolve any collision before integration.
4. Run `node scripts/brand-inventory.mjs "Purina Dog Chow" > research/INVENTORY-PURINA-DOG-CHOW.md`.
5. Run `node scripts/check-ledger.mjs research/deep-research-purina-dog-chow.json`.
6. The checker must really exit 0. Record the real exit code here; do not infer it from this handoff.
7. Investigate the candidate parking lot only after the staged records are integrated. Physical labels/current Purina decks are the useful next evidence, especially for Complete Adult Lamb, Classic Ground, and Healthy Weight.

## Checker / inventory status

**Checker: NOT RUN in this session — no shell. Exit code: unavailable.**

**Inventory: NOT regenerated in this session — no shell.** The checked-in inventory still describes the pre-campaign seed and must be regenerated after incoming integration.

## Deviations from the brief

The brief calls for the final records to live in `research/deep-research-purina-dog-chow.json`, a regenerated inventory, and a real checker run. Because this session did not have a repository shell, `AGENTS.md` §3a was followed instead: new records were staged under `research/incoming/`. No GitHub Actions workaround was created, and no checker result was fabricated.

Research stopped when additional discovery was producing repeats, weak historical identifiers, or Puppy Chow boundary violations rather than defensible new Dog Chow records.
