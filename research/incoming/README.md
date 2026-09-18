# `research/incoming/` — the drop box for a batch too big to commit

A research ledger runs about 6 KB per record, because every record carries a
full ingredient list. Forty records is 235 KB; the Blue Buffalo ledger is
1.27 MB. An agent working through a GitHub connector rather than a shell can
only write a file **whole**, so sooner or later the batch it has finished
researching is a file it cannot commit.

This directory is where that batch goes instead. One file, a bare JSON **array
of records** — no ledger wrapper:

```
research/incoming/<brand-slug>-batch-NN.json
```

A shell-enabled pass merges the records into the real ledger, runs
`scripts/check-ledger.mjs`, regenerates the brand's inventory, and deletes the
file. So this directory is normally empty, and a file sitting here means a
batch is waiting to be merged.

## Why a subdirectory

`scripts/check-ledger.mjs` and `scripts/brand-inventory.mjs` both scan
`research/` with a **non-recursive** `readdirSync` and read every `*.json` they
find — not only `deep-research-*.json`. A batch file directly in `research/`
would be read as a second ledger for the same brand: every barcode in it would
come back `already claimed`, and the inventory's exclusion list would count
each code twice. That has happened, on data that was entirely correct.

Neither script descends into a subdirectory. Verified by putting a complete
copy of a 40-record ledger here and watching the checker stay clean.

## What this is not

Not a second ledger. There is still exactly one ledger per brand and batches
still append to it — `research/AGENTS.md` §4. This is a delivery mechanism, and
§3a of that file is the rule it belongs to.
