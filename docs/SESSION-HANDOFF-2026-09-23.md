# Session handoff — brand curation, 2026-09-21 to 2026-09-23

Everything a new session needs to pick this up. Written because the work
spanned three days and 263 commits, and the parts worth carrying forward are
not the batches — they are the half-dozen things that went wrong and what was
changed so they stop going wrong.

**Branch:** `claude/brand-curation-database-geiqse`, and `main`. Both are at
the same commit; every batch is pushed to both, because the scanner app reads
the seed from `main` and a batch that stops on the feature branch does not
exist as far as the import panel is concerned. That cost a day once.

---

## 1. Where the catalog stands

```
1037 products   1607 barcodes   1549 formulas
```

Four brands were seeded this session, in batches 037–040:

| Brand | Barcodes | Compositions | Batch |
|---|---:|---:|---|
| Iams | 121 | 98 | 037 |
| Purina Cat Chow | 26 | 26 | 038 |
| Purina Dog Chow | 32 | 32 | 039 |
| Beneful | 61 | 35 | 040 |

Regenerate rather than trusting those numbers:

```bash
grep -oP '^\s*brand: "\K[^"]+' data/known-products.ts | sort | uniq -c | sort -rn
```

**Nothing is in the database yet.** The seed is TypeScript; the app reads it
from a build. The operator presses **Write N to the catalog** in the Seeded
formulas panel on the scanner's home page (`/`, component `SeedImport`, gated
by `ADMIN_TOKEN`) — and the deploy has to be rebuilt first or the panel is
reading an old bundle and says "Nothing to write".

The import writes only products that have a formula; identity-only barcodes
are stepped over and show on the coverage page as something to go and find.
That is why the button offered 35 for Beneful's 61 barcodes.

### A checker message that is not a failure

`node scripts/check-ledger.mjs research/deep-research-iams.json` now exits 1
with *"121 barcodes are already in the catalog"*. That is expected for a
seeded ledger and the message says so. All four ledgers above are in that
state. Do not "fix" it.

---

## 2. In flight

**Alpo (brand #5)** — `research/BRIEF-ALPO.md` is written and an agent is
mid-campaign. 80 records staged in `research/incoming/alpo-batch-0*.json`:

```
13 source_verified   — all 13 with a complete panel, no URLs in the
                       ingredients field
59 needs_physical_label
 8 rejected          — the 8 whose check digit fails
```

That is the first campaign where every promoted record is actually complete.
§3 explains why.

**Next in the queue** after Alpo: Cesar, Temptations, Greenies, Whiskas (all
Mars), then Meow Mix and Kibbles 'n Bits (Post). `docs/CURATION-QUEUE.md` is
the running order with a status per brand.

---

## 3. The two ways a campaign fails, and the fix

This is the most valuable thing the session produced. Read it before writing
another brief.

**Iams** captured 114 complete panels and promoted **zero**, because it
invented a gate stricter than the one this repository actually uses. Three
passes to undo.

**Beneful** promoted **85 of 89**, of which 42 had no ingredient list and ten
had a PDF's web address sitting in `ingredients_verbatim`. One correction
pass, 10 rejected barcodes, 42 demoted statuses.

Both read the same inherited brief section. The cause was a gate written in
prose and handed over to be weighed up — **a rule an agent has to interpret
will be interpreted, and the two interpretations available are those two
failures.**

`research/BRIEF-ALPO.md` §1 is the fix: a decision table walked in order with
a STOP at each step.

1. Check digit fails → `rejected`. Never repair one; patching a digit invents
   a barcode.
2. Six named fields captured, or `needs_physical_label`. It says explicitly
   that `ingredients_verbatim` is the list and **not a URL**.
3. The composition came from exactly one of two routes — **A**: the maker's
   own surface, where ONE source is enough; **B**: TWO INDEPENDENT retailers
   agreeing on the ingredient order, where independent means two different
   companies' own pages. Neither, or they disagree → `needs_physical_label`,
   with both readings in `conflicts`.
4. Only then, `source_verified`.

It also asks for the **step tally per batch** in the handoff. Beneful's
promotion rate fell from 19-of-19 complete to 0-of-8 across its batches and
nobody noticed until a shell pass counted.

**Copy §1 verbatim into the next brief.** Write what the rule IS, never what
the last campaign got wrong.

---

## 4. Three checker gaps closed, all the same family

`scripts/check-ledger.mjs` gained three rules this session. Each was found by
a campaign getting past it, and all three are one shape: **a field holding the
wrong KIND of thing while passing every test of whether it holds something.**

1. **An invalid barcode on a `rejected` record is a warning, not an error.**
   §10 names "invalid code" as a reason to reject and §12 requires exit 0, so
   the two rules together made an honest rejection unshippable — the only ways
   to green were deleting the evidence or inventing a check digit.
2. **`conflicts`, `source_urls` and `verification_notes` must hold strings.**
   Cat Chow put a real and useful calorie disagreement into a `{field, note}`
   object; `Array.isArray` passed and it would have printed as
   `[object Object]` everywhere anybody read it. Beneful put a literal `null`
   in `source_urls`.
3. **`ingredients_verbatim` must not be a URL and must contain a comma.**
   Beneful had the deck's address in the field on ten records, five of them
   promoted. A US label prints a comma-separated list in descending weight
   order; a link is a citation, not a composition.

Every other ledger reports identical counts before and after all three. The
pre-existing errors in `merrick` (55), `blue-buffalo` (45), `royal-canin` (9)
and `weruva` (5) are untouched and were there before this session.

---

## 5. Contract and tooling changes

**`research/AGENTS.md` §9 now carries both controlled vocabularies written
out** — 26 textures, 10 presentations. Three campaigns wrote the plain English
word where the vocabulary has a prefixed term (`"gravy"` for `in_gravy`,
`"cuts_in_gravy"` for `cuts` + `in_gravy`). The contract said "repository
vocabulary value" and pointed nowhere an agent without a shell could look.

**`scripts/formula-worklist.mjs`** is new. Composition is a property of the
RECIPE, not the bag size, so 133 Iams barcodes collapse to 63 recipes. It does
that collapse and splits the finished recipes into "needs a second witness"
and "corroborated". Told this, an agent fetches 58 panels; not told it, it
walks the barcode list and fetches 120.

**A brand is two campaigns** — barcodes, then formulas — **unless the maker
publishes readable label decks**, in which case they are one. Purina and
Hill's do; nobody else here does. Check for `label_deck_code` values in
`data/known-formulas.ts` before deciding. That single fact is why Iams cost
three passes and Cat Chow cost one.

**Sibling briefs inherit rather than repeat.** `BRIEF-PURINA-DOG-CHOW.md` is a
delta on the Cat Chow brief: it names the sections that carry over and then
says only what differs. A brief that repeats its sibling will disagree with it
in six months.

---

## 6. Findings that outlived their campaign

- **`research/PETCO-BRANDS.md`** — the first live shelf survey in this
  repository, 76 qualifying food brands off Petco's own facets. It disproved a
  load-bearing claim: `docs/SHELF-PRIORITY.md` had Pedigree, Iams, Beneful and
  both Chows down as absent from Petco on the strength of the 2019
  artificial-ingredient removal. Petco lists all of them.
  `research/BRIEF-PEDIGREE.md` §7 had been telling agents not to look there at
  all. Both corrected, with the mistake left visible.
- **`docs/SEED-GAP-PETCO.md`** — 15 brands that survey found missing from
  `data/us-pet-brands.ts`, and five modelling decisions to make first (is a
  Petco brand facet a brand or a range?). Not yet done.
- **`research/IAMS-CONTESTED-PANELS.md`** — 15 barcodes seeded as identity on
  purpose. Chewy and Petco publish different ingredient ORDERS for the same
  code, which on an American label is a different food. The conflict note
  never reaches `barcode_cache`, so a shopper would see a list with even odds
  of being the previous generation and no signal. Four recipes; one photograph
  closes a whole recipe. **The file is written to be deleted.**
- **Purina renames ranges under stable barcodes.** Beneful: Prepared Meals →
  Freshly Prepared Meals, Chopped Blends → Freshly Prepared Blends. Cat Chow
  gained `Healthy Aging`; Dog Chow's `Puppy` range is deliberately empty
  because every current puppy surface is PUPPY CHOW-branded, a different brand
  row. Iams lost `Minichunks`, which was a kibble size wearing a range's
  clothes.
- **`lib/nutrition-role.ts` gained `"baked delights"`.** Checked before
  seeding: `detectNutritionRole` returned `unknown` for Beneful's Hugs and
  Snackers, so the report would have judged a bag of biscuits for not being a
  balanced diet.

---

## 7. The blocker, and what changes when it lifts

**This environment's egress policy allows GitHub and nothing else.** Verified
repeatedly across all three days:

```
www.purina.com   000      www.chewy.com   000
www.petco.com    000      www.walmart.com 000
api.github.com   200
```

`WebFetch` returns `EGRESS_BLOCKED`. So agents launched from inside this
session cannot open a single product page, and a campaign run that way
produces `candidate` records and a clean checker run — which looks like
success and is not. `docs/RESEARCH-EGRESS.md` is the full account and carries
the host list to allow.

The division of labour this forced, which worked: **an outside agent with web
access finds the data; this session has the shell and does everything the
outside agent cannot** — run the checker for real, catch the defects above,
merge the ledger, seed, run tests and the build, push to both branches.

**With `Network access: Full` on the environment, that changes.** A new
session can launch its own research agents, and — this is the part that
matters — check each batch against `scripts/check-ledger.mjs` as it lands
rather than discovering 119 errors two days later. Set it on the environment
the session actually runs in; a new environment only applies to a session
started in it.

---

## 8. First moves for the next session

1. `for h in www.purina.com www.chewy.com www.petco.com; do curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 "https://$h/"; done`
   — if that prints `200`, launch agents directly. If `000`, the policy did
   not take and a fresh session is needed.
2. Finish Alpo: merge `research/incoming/alpo-batch-0*.json` into
   `research/deep-research-alpo.json`, run the checker to a real 0, regenerate
   the inventory, delete the incoming files, seed, push to both branches.
3. Then brand #6, Cesar — **copy `BRIEF-ALPO.md` §1 verbatim.** Cesar is Mars,
   which means no readable decks and therefore two campaigns, and it also
   means `Ingredients.help/data/manufacturers.ts` still has **no Mars entry**,
   which blocks the brand page for five queued brands.
