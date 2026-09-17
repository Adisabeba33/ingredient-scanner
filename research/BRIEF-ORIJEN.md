# Assignment: Orijen

You are researching **one brand: Orijen.** Nothing else. Its sibling Acana is
made by the same company, in the same kitchens, under the same slogan, and is a
separate brand in this catalog — §2 is about why that sentence is most of the
job.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated here. `research/BRIEF-PURINA-ONE.md` §4 (size ladders, the two
opposite mistakes) applies to the dry bags.

---

## 0. Before anything: can you actually reach the sources?

Run this first. It costs ten seconds and it has already cost one campaign a
whole batch:

```bash
for h in www.orijenpetfoods.com championpetfoods.com www.chewy.com www.fda.gov web.archive.org; do
  printf '%-28s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

If those answer `000` with `CONNECT tunnel failed, response 403`, **stop and
report it.** Do not start researching. The Pedigree campaign ran against a
policy that allowed GitHub and nothing else: it could harvest barcodes out of
search-result URL strings but could not open one product page, so it produced
14 records, zero `source_verified`, and a **clean checker run** — which looks
like success and is not. See `docs/RESEARCH-EGRESS.md` and PR #15.

Do not route around a 403. `/root/.ccr/README.md` is explicit that a policy
denial is reported, never circumvented.

## 0.1 The two commands

```bash
node scripts/brand-inventory.mjs "Orijen" > research/INVENTORY-ORIJEN.md
node scripts/check-ledger.mjs research/deep-research-orijen.json
```

Actually run them, from a shell. The Pro Plan campaign ran in a session with no
shell and had to hand-reconstruct the inventory and simulate the checker; both
were disclosed honestly and both had to be redone. The inventory file must be
the generator's byte-for-byte output — its own header forbids working from a
pasted copy. ERROR blocks seeding and exits 1; WARN is a question to answer in
`conflicts`.

---

## 1. What the catalog holds

**Nothing, in either repository.** Checked file by file before this brief:

| File | Orijen |
|---|---|
| `data/known-products.ts` | 0 |
| `data/known-formulas.ts` | 0 |
| `data/known-multipacks.ts` | 0 |
| `data/wrong-barcodes.ts` | 0 |
| `data/gs1-prefixes.ts` | no Champion prefix of any kind |
| `docs/CATALOG-CONFLICTS.md` | 0 |
| `research/` | no ledger, no mention in any other brand's |
| `Ingredients.help` — **whole repo** | **0** — no Orijen, no Acana, no Champion anywhere |

The brand entry in `data/us-pet-brands.ts` names six ranges — Original, Six
Fish, Regional Red, Tundra, Amazing Grains, Guardian 8 — and all six are empty.
That entry is the only Orijen knowledge either repository has.

There is one incidental mention, and it is worth knowing because it is honest
about where this brand sits: `components/BrandCoverage.tsx` uses Acana in a
comment as an example of a brand with nothing under it, explaining why the
coverage page does not sort A–Z.

---

## 2. Acana is the boundary, and it is most of the job

Orijen and Acana are **one company's two brands**, and nearly every way this
campaign can go wrong is an Acana product written into the Orijen ledger. This
is the same shape as Pro Plan's collision with Purina ONE over `LiveClear`, and
it is worse here, because Orijen and Acana share more than a range name:

- the same maker, **Champion Petfoods**, now owned by Mars;
- the same kitchens — both brands come out of the same two plants (§3);
- the same front-of-pack language: *Biologically Appropriate*, *WholePrey*,
  *fresh regional ingredients*. None of that distinguishes them;
- the same shelf, usually adjacent, in the same shops;
- almost certainly the same GS1 company prefix (§4), so **the barcode will not
  tell you which brand it is**. On Pedigree the prefix caught a Kroger clone;
  here it will not help you at all.

`data/us-pet-brands.ts` holds them as two entries, adjacent in the file, both
with `owner: "Mars (Champion)"`, six ranges each and no overlap in range names.
The range name is therefore your strongest signal — which is exactly why §5's
warning about range names being wrong matters more than usual.

For every record: the pack's own front says **ORIJEN**. Not "Champion", not
"Biologically Appropriate", not Acana. If the evidence comes off a page that
does not say Orijen on the product itself, it is not evidence for this ledger.

`brand` is `"Orijen"` on every record, spelled as the seed spells it. Note the
maker writes it **ORIJEN** in capitals and the seed does not; that is a display
question, not a data one, and `lib/brand-key.ts` folds case.

**Anything you nearly filed that turned out to be Acana goes in the handoff**,
named. That list is the single most useful thing you can leave the next agent,
and unlike the Pedigree campaign — where no Cesar product ever had a route in,
so the risk went untested — here you will meet it on the first search.

---

## 3. Two countries, one brand: the split that will bite quietly

Champion makes Orijen in **two kitchens**: DogStar in Auburn, Kentucky, and a
plant in Alberta, Canada. Both are current, both make both brands.

This catalog is **US**. The problem is not that Canadian product is wrong — it
is that a Canadian pack and a US pack of what looks like the same recipe can
differ in formula, in printed guarantees, in bag sizes, and **in barcode**.
Writing a Canadian deck under a US barcode is a wrong `source_verified` of
exactly the kind that reaches a shopper holding the other bag.

Two precedents in this repository, both already solved this way:

- **Sheba.** `research/SHEBA-HANDOFF.md` §6 separates the US assortment from
  UK/EU explicitly: US barcodes and US evidence only, non-US pages not used to
  fill US gaps. Do the same here with Canada.
- **Ziwi Peak.** The first non-American maker seeded, and the first EAN-13
  rather than UPC-A codes — `9421016` and `9421038` are registered as
  "Ziwi (New Zealand)" in `data/gs1-prefixes.ts`.

So: prefer `.../en-US/` manufacturer pages and US retailers. When you cannot
tell which market a page serves, that is a reason to leave the record
`candidate`, not a reason to guess. Report in the handoff whether US and
Canadian Orijen share barcodes or not — nobody knows, and the answer changes
how the next batch works.

---

## 4. The GS1 prefix is unknown — and a lead is not a fact

`data/gs1-prefixes.ts` has **no Champion prefix at all**. Nineteen prefixes are
registered and not one belongs to this maker.

`064992` turns up against Champion in third-party listings. **This is a lead.**
An attempt to confirm it against GS1 while writing this brief did not succeed,
so it goes to you in exactly the state `038100` went to the Pro Plan agent —
unconfirmed, to be established from packs. That one turned out right, on 18
independently proven codes. This one may not.

Establish and report:

- which prefix Orijen packs actually carry, read off barcodes;
- whether Acana shares it. **Expect yes**, and say so explicitly either way,
  because if they share it the prefix is useless for telling the brands apart
  and §2 becomes entirely a names-and-pages problem;
- whether Canadian-made packs sit elsewhere (§3);
- anything outside. Blue Buffalo, 9Lives and Weruva each ran two or three
  prefixes at once.

Register nothing yourself. `data/gs1-prefixes.ts` is the seeding pass's file.

---

## 5. The range list, and why this brand's is less trustworthy than most

Six names are seeded: Original, Six Fish, Regional Red, Tundra, Amazing Grains,
Guardian 8. Several are certainly current. The list is also certainly
incomplete — Orijen sells puppy, senior, small-breed, cat-and-kitten and
freeze-dried ranges, and none of those six obviously covers them.

Champion also relaunches and renames: the brand's line-up has been reworked
more than once, so a name that was a range five years ago may be a recipe
inside a different range today, and a retailer will happily still print the old
one. This is the same failure Pro Plan's campaign found with `Savor` and
`Focus`, where distributors kept the retired name against a current UPC.

The rule from that campaign applies here unchanged and it works:

- **current manufacturer pages control `product_line`**, formula, guarantees,
  calories and adequacy;
- a legacy retailer or distributor name may be used **only** as package-identity
  evidence, binding an exact UPC to an exact printed bag size;
- never write a range name as current because a distributor still uses it.

Every range you find that the entry lacks is a handoff recommendation. Do not
edit `data/us-pet-brands.ts`.

---

## 6. Freeze-dried treats: the error this brand is shaped to cause

This is the section to read twice, because this repository has been burned by
this exact shape three times and has the scars in code to prove it.

Orijen sells **freeze-dried treats** — single-protein or near it, sold in
pouches beside the kibble, and **extremely high in protein** because they are
dehydrated meat and nothing else.

`lib/nutrition-role.ts` exists to stop the report judging a snack as dinner, and
its `KNOWN_TREAT_LINES` list carries the receipts:

- **Ziwi Peak's "Air-Dried Chews"** — "a lamb trachea is 81% protein on a
  dry-matter basis and would otherwise be judged, and praised, as an
  extraordinary complete diet";
- **I and love and you's** snack ranges — "a beef pizzle is 79% protein and a
  beef ear 83%, and both would be read as extraordinary complete foods";
- **Reveal's "Whole Loin"** — one salmon loin and nothing else, where the pack
  says treat and the range name does not.

**Orijen is not in that list.** Zero entries. And a freeze-dried Orijen treat
is the same object as a Ziwi chew: high-protein dried meat whose range name
contains no word meaning snack.

Two halves, and only one is already solved:

- **The texture is known.** `lib/presentation.ts` has `freeze_dried`, matching
  "freeze dried", "freeze-dried" and "freezedried". Use it; do not invent.
- **The role is not.** Record what each pack's own AAFCO sentence says —
  "complete and balanced" versus "for intermittent or supplemental feeding
  only" — verbatim and per pack. That sentence is the field. Where a range is a
  treat range, say so in the handoff with its exact printed name, so the
  seeding pass can add it to `KNOWN_TREAT_LINES`.

**Do a treat batch separately and late**, after the dry food. Mixing them is how
a food and a snack end up sharing a shape.

---

## 7. Three famous events, and not one of them is a recall

`data/recalls.ts` in the app repository holds Hill's, For All Tails and Royal
Canin. There is **no Orijen entry, and as far as this brief could establish
there should not be one**: no FDA or manufacturer recall of Orijen was found.

That is the finding. The risk is the opposite of Pedigree's — not a missing
recall, but three well-documented events that a diligent agent will find and be
tempted to file:

1. **The FDA's June 2019 DCM update named sixteen brands** most frequently
   reported in dilated-cardiomyopathy cases, and **both Acana and Orijen were
   on it.** It is an investigation naming reports, not a finding of causation
   and **not a recall.**
2. **Consumer class actions, roughly 2018–2022**, over grain-free and
   legume-heavy formulation and over marketing claims. Litigation is **not a
   recall.**
3. **Australia, 2008.** Cats died after eating Orijen that had been **irradiated
   to satisfy Australian import rules** — a treatment applied after the food
   left the maker, to product sold in a market Orijen then withdrew from
   entirely. Serious, real, and **neither American nor a recall.**

**Do not write any of these into `data/recalls.ts`, and do not invent a field
for them.** If you judge one of them worth surfacing to a reader, that is a
product-design question for the other repository, and it goes in the handoff as
a question with its sources — not as a row.

State the negative explicitly in your handoff: *no recall found, searched
where*. A confidently absent answer is worth writing down; the next agent
should not repeat the search.

---

## 8. Champion is in neither repository

`data/manufacturers.ts` in `Ingredients.help` holds eleven makers and **Champion
is not among them** — the whole repo has zero mentions of Champion, Orijen or
Acana. So an Orijen brand page is **blocked** until Champion has its own entry
with its own five criteria and sources.

Do not borrow Royal Canin's because Mars owns both. That file's header forbids
it in as many words, and documents Merrick as deliberately **not** given
Purina's answers for exactly this reason.

Champion is an unusually good candidate for this: it publishes kitchen,
sourcing and quality material on `championpetfoods.com` directly. If your
research turns up primary material on the five criteria — staff nutritionist,
feeding trials, owns its plants, quality programme, publishes research —
capture it with URLs and a checked-at date, in the shape that file's entries
use. `ownsPlants` in particular should be easy and is genuinely true here.

It is a by-product worth minutes, not the main job. Note that it unblocks
**two** brand pages, since Acana waits on the same entry.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-orijen` (from current `main`) |
| Ledger | `research/deep-research-orijen.json` (new — create it) |
| Inventory | `research/INVENTORY-ORIJEN.md` (generated, §0.1) |
| Handoff | `research/ORIJEN-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Orijen"]`.

**Write only those three files.** Nothing under `data/`, `app/`, `lib/`,
`components/`, `tests/` or `scripts/`, and no other
`research/deep-research-*.json`. Registering a prefix, adding a range, teaching
`KNOWN_TREAT_LINES` a name, adding Champion to `manufacturers.ts` — all the
seeding pass's job. You say what they should be, in the handoff.

Do not write a fourth file either. The Pedigree agent wrote itself a
batch-2 brief; the handoff already has a "next batch" section and that is where
it goes.

**Do not create GitHub Actions workflows.** Two earlier campaigns spent 20 of 25
and 23 of 26 commits on temporary runners that staged and restored themselves.

---

## 10. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Orijen batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Orijen batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  market:           US NN   unclear NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range the brand entry lacks, a GS1 prefix, a size ladder
                    proven end to end, an Acana near-miss>
```

Twenty is a limit, not a target. A campaign that stopped at five records and
said why was doing the job correctly. On this brand, stopping early because the
US/Canada question is unresolved is a **good** outcome, not a failed batch.

Order: **dry dog, then dry cat, then freeze-dried treats last.** Dry is where
the volume and the size ladders are. Orijen's ladders are shorter than a
supermarket brand's — a few bag sizes per recipe, not eight — but the two
opposite mistakes in `BRIEF-PURINA-ONE.md` §4 are the same: do not split one
recipe into five products, and do not merge two sizes' evidence. Bind every UPC
to the exact printed size.

---

## 11. The handoff

`research/ORIJEN-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **The Acana boundary** — every product you nearly filed here that turned out
   to be Acana, named. §2. The most valuable section in the document.
2. **The range answer** — every `product_line` you used, spelled as the packs
   spell them; which of the six are current; every range the entry lacks.
3. **US versus Canada** — do the two markets share barcodes? Which pages you
   trusted for which. §3.
4. **GS1 prefixes** — what Orijen carries, whether Acana shares it, whether
   `064992` is real. §4.
5. **Treat ranges** — exact printed names of any range that is a snack rather
   than a diet, for `KNOWN_TREAT_LINES`. §6.
6. **Size ladders** — sizes and the UPC of each, so the seeding pass builds
   `packages[]` without re-deriving it.
7. **Recalls** — the explicit negative, and where you searched. §7.
8. **Champion for `manufacturers.ts`** — §8, with URLs and dates, or an explicit
   "nothing primary found".
9. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: market unclear, formula generations colliding under one UPC,
   exact-size binding missing, no printed calorie statement. The next agent
   works by gap, not from record 1.
10. Where you stopped and why.

---

## 12. Done

- Egress checked **before** research, per §0.
- Inventory genuinely generated, not reconstructed.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including the Acana list and the US/Canada answer.
- Draft PR open, unmerged, one report per batch.
- Exactly three files changed, all under `research/`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
pack.

On this brand the most likely wrong answer is an Acana pack under an Orijen
name — same company, same kitchen, same slogan, same shelf, and probably the
same barcode prefix, so nothing catches it but the word on the front. The
second most likely is a Canadian deck under a US barcode, which nothing catches
at all.
