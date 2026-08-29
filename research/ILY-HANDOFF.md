# I and love and you — where the research reached, and what came into the catalog

## Seeded into the catalog — batch 023

The ledger beside this file (`research/deep-research-i-and-love-and-you.json`,
schema version 2) holds **189 source_verified records** under GS1 company
prefix 818336: **104 individual units** and **85 multipacks**. It is copied
onto `main` so the trail does not depend on the research branch surviving.

**101 of the 104 units are in the seed.** Three are held back — not rejected,
since every check digit passes, but their identity is contradicted by the
record's own contents. Section I of `docs/CATALOG-CONFLICTS.md` names each one
and why.

**All 85 boxes are in `data/known-multipacks.ts`**, which is new and exists for
this batch. A box is written to the catalog as `found = false`, `reason =
'multipack'`, `contains = [members]` and no composition — the shape migration
0022 defined in the consumer repository and `app/api/multipack/route.ts` has
been writing one box at a time since. This is the same fact arriving in bulk.

Of the 85, **72 carry proven member barcodes** — 37 distinct members, every one
of which exists in this ledger as an individual unit, none invented. The other
13 name no inner code, which is an honest answer and does not stop the box
being marked: the mark is what keeps somebody from photographing the back of a
carton, where every member's ingredient list is printed one after another and
parses like a real one.

Seventeen of the boxes are **variety packs** holding three different recipes.
Their ingredient, guarantee and calorie fields are null in the ledger, and
correctly so — there is no single formula a variety pack could carry even in
principle, which is the clearest argument for why boxes are a separate list
from products rather than a flag on one.

## What the catalog learned from this brand

Each of these was general, not a patch for one maker:

- **A GS1 prefix reads under the packaging indicator.** ILY is the first maker
  whose codes arrive at three levels: the can is `818336…`, the twelve-pack is
  `10818336…`, the case is `20818336…`. That leading digit is a GS1 packaging
  level, not a company. `gs1Body()` in `lib/known-products.ts` normalises it,
  and both askers — the batch checker and the seed test — use it.
- **A calorie figure has to be one its own panel can carry.** The bully-stick
  records print 7484 kcal/kg beside a panel whose modified-Atwater ceiling is
  about 3560. `lib/known-import.test.ts` now refuses anything above twice its
  ceiling; across the 749 seeded panels that state calories, the worst honest
  ratio is 1.69.
- **A treat is a role, and wet is a form.** The panel-bounds check had them
  flattened into one key, so Treat Meow — a lickable puree pouch at 84.5%
  moisture — failed for being wet. Role now raises the protein ceiling and form
  sets the moisture window.
- **Species is part of a product's identity.** "Naked Essentials Chicken +
  Duck" is printed on a cat bag and a dog bag, with different recipes and
  nothing but the species to tell them apart.
- **A guarantee can be printed as a range.** `withExtras` was keyed by nutrient
  and silently lost half of "Glucosamine HCl (Min) 14 / (Max) 22 mg per treat".
  It now also takes a list.

## Where the work stopped

- **Three units await evidence** (see `docs/CATALOG-CONFLICTS.md` §I). Two are
  4 oz Nice Jerky! bags carrying a kibble deck; one has a panel that sums past
  the whole pack. Each needs a photograph of the actual bag, not more retailer
  pages — the retailer pages are what disagree.
- **13 boxes have no proven member codes.** These are readable off the physical
  cartons in one pass and are the cheapest remaining work on this brand.
- **`Irresist-A-Bowls` has four boxes and no individual units.** The 9 oz bowl's
  own barcode was never proven.
- **The XOXOs presentation field is unreliable in the ledger** — two records
  carry "can", which is a package type. Both are seeded as `unknown` rather
  than `plain`, because `plain` asserts there is no sauce and both decks open
  with broth. A photograph settles it.

## Note on merging this branch

Do not merge `agent/deep-research-i-and-love-and-you` wholesale. Agent branches
carry stale copies of shared ledgers alongside their own work — this one held
Ziwi at 116 records while 156 was current on `main`. Take the one ledger file,
which is what was done here.
