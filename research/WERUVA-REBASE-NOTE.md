# Weruva remaining-backlog rebase — 2026-08-29

The earlier conversational estimate of **109 remaining unique UPCs** was incomplete. A machine count of every Markdown table row under headings matching `awaiting strict promotion` in `research/WERUVA-POST-30-INDEX.md` found **131 rows / 129 unique UPC strings**. The two duplicates are index duplication, not extra products.

This is a scope/count correction only. It does not promote any row and does not change the canonical strict count of **120**.

A first-party Weruva Shopify variant probe also proved that some index UPCs are historical/replaced and therefore cannot be bulk-promoted as written. Example: current Weruva `Tic Tac Whoa!` variants expose `813778018418` for 3 oz and `813778018272` for 5.5 oz, while the index still lists historical candidate `813778018203` for 5.5 oz. Therefore the remaining queue must be treated as a **re-verification/replacement campaign**, not as 129 ready-to-append records.

Rules for continuation:

1. Re-resolve each indexed product against the current first-party Weruva product page and current first-party variant barcode where available.
2. Preserve old UPCs as historical/conflict evidence when a current replacement is proven; do not silently overwrite generations.
3. Re-run repository-wide exclusions for every accepted current UPC.
4. Promote only complete schema-v2 records that pass `research/AGENTS.md`.
5. Keep unresolved/historical/multipack/case identities out of `source_verified` until the exact unit is proven.

Temporary diagnostic workflows/files used to establish this rebase were removed after the count/probe; they are not research evidence and should not be treated as such.
