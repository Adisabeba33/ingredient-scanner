# Assignment: American Journey

You are researching **one brand: American Journey.** It is Chewy's own label,
and §2 is about the thing that makes this assignment different from every other
one in this folder: **the brand is being retired into another name while you
work on it.**

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged. `research/BRIEF-PURINA-ONE.md` §4 (size
ladders, the two opposite mistakes) applies to the dry bags, and its §6 note on
kcal per cup applies to every dry record.

---

## 0. Before anything

### 0.1 Can you reach the sources?

```bash
for h in www.chewy.com americanjourneyco.com www.fda.gov web.archive.org; do
  printf '%-26s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

If those answer `000` with `CONNECT tunnel failed, response 403`, **stop and
report it.** Do not start researching. A campaign run against a blocked policy
harvests barcodes out of search-result URLs, writes `candidate` records, passes
the checker, and produces nothing seedable — it looks like success and is not.
See `docs/RESEARCH-EGRESS.md` and PR #15. Never route around a 403.

This brand is worse than most on that point: it has essentially **one source**
(§3), so if that one host is blocked there is no fallback at all.

### 0.2 The ledger rule — read this even if you read nothing else

**One ledger per brand. Batches append to it. There is never a second file.**

`research/deep-research-american-journey.json` is the only ledger this campaign
creates. Not `-40.json`, not `-batch2.json`, not a copy with a suffix.

This is not style. The Orijen campaign lost most of a day to it:

- `scripts/check-ledger.mjs` looks for a barcode claimed by more than one
  ledger. Two files holding the same codes produced **20 ERRORs, every one
  reading "already claimed"**, on data that was perfectly correct.
- `scripts/brand-inventory.mjs` globs **every** `research/deep-research-*.json`.
  Two files for one brand double the brand's own barcodes in the exclusion
  list — the list that exists to stop the next agent re-researching what is
  done.

Also, from the same campaign: **deliver by committing to the branch.** Do not
hand the JSON back as a file or a link in a conversation; it had to be moved by
hand. And **do not create a GitHub Actions workflow** to upload anything — two
commits went to a temporary runner that never delivered the file. Three earlier
campaigns spent most of their commits on runners like it.

### 0.3 The two commands

```bash
node scripts/brand-inventory.mjs "American Journey" > research/INVENTORY-AMERICAN-JOURNEY.md
node scripts/check-ledger.mjs research/deep-research-american-journey.json
```

Run them from a real shell. The inventory must be the generator's byte-for-byte
output; its header forbids working from a pasted copy, and a campaign that
reconstructed it by hand had to redo the file. ERROR blocks seeding and exits 1.
WARN is a question to answer in `conflicts`.

---

## 1. What the catalog holds

**Nothing, in either repository.** Checked file by file:

| File | American Journey |
|---|---|
| `data/known-products.ts` | 0 |
| `data/known-formulas.ts` | 0 |
| `data/known-multipacks.ts` | 0 |
| `data/wrong-barcodes.ts` | 0 |
| `data/gs1-prefixes.ts` | no Chewy prefix of any kind |
| `docs/CATALOG-CONFLICTS.md` | 0 |
| `research/` | no ledger, no mention in any other brand's |
| `Ingredients.help` — whole repo | 0 |

The seed entry names four ranges — Grain Free, Landmark, Active Life, Protein
First — and all four are empty. That entry is everything the repository knows,
and §2 is about why it is probably describing a brand that no longer exists
under that name.

---

## 2. The brand is being folded into "Chewy Made", and that is the job

Chewy has **consolidated its private labels under one new brand, `Chewy Made`**.
American Journey, Tiny Tiger, True Acre Foods and Bones & Chews all go into it.
Reported consistently: **the recipes, ingredients and formulas do not change** —
the name and the packaging do. Chewy carried the old reviews across because it
is the same food.

Two of those names are separate rows in `data/us-pet-brands.ts` right now —
American Journey and Tiny Tiger — and two are not in the file at all.

This is the Savor/Focus problem from the Pro Plan campaign, one level up. There
it was a *range* that got renamed and distributors kept the old name against a
current UPC. Here it is **the brand on the front of the bag**.

What that means for your work, concretely:

- **Establish what current packs actually print**, and say so plainly. Is the
  brand line `Chewy`, `Chewy Made`, or is American Journey still printed on
  some packs while others have changed? Both can be true at once during a
  transition, and the answer may differ by product.
- **Watch for the URL that keeps the old name.** Chewy's own site has listings
  titled "Chewy Branded … Limited Ingredient" living at a path that still reads
  `/american-journey-limited-ingredient/`. The URL is not evidence of the
  current name; the pack is.
- **The barcode is the anchor, as always.** If a recipe kept its UPC through the
  rename, that is one product whose printed name changed — the ordinary case
  this catalog is built for. If the rename brought a **new** UPC, that is two
  barcodes for one recipe and both are real, because the old bag is in people's
  houses. Establish which happened, per recipe, and report it.
- **Do not decide what the catalog should call the brand.** `brand` stays
  `"American Journey"` in this ledger, spelled as `data/us-pet-brands.ts`
  spells it, so the campaign stays one brand as §1 of `AGENTS.md` requires.
  Whether the seed entry should be renamed, aliased to `Chewy Made`, or joined
  by a new entry is a **handoff recommendation** — `lib/brand-key.ts` folding
  and the coverage page both turn on it, and it is the seeding pass's call.

**This question comes first.** Answer it in the handoff from batch 1, before
volume. A hundred records filed under a brand name that is being retired is a
hundred records somebody has to revisit.

---

## 3. One source for everything, and what to do about it

American Journey is **Chewy-exclusive**. There is no Walmart listing, no PetSmart
page, no independent retailer to cross-check against. `AGENTS.md` §6 ranks
manufacturer evidence above retailer evidence; here **they are the same
company**, so that ladder collapses to a single rung.

There is one other primary source: **`americanjourneyco.com`**, the brand's own
site, separate from the shop. Use it, and say in each record which of the two a
figure came from — they can disagree, and a disagreement between a maker's shop
listing and its brand site is exactly what `conflicts` is for.

Consequences you must respect rather than work around:

- **A single source cannot corroborate itself.** Two pages on chewy.com agreeing
  is one source agreeing with itself, not two sources.
- **Web archive matters more here than usual.** `web.archive.org` is how you see
  what a listing said before the rename, which is the only way to tell a
  retired name from a wrong one.
- **Be slower with `source_verified`.** The status means the exact sellable
  package is proven. Where one listing is all you have and it does not bind an
  exact UPC to an exact printed size, the honest status is `candidate`. The
  Orijen campaign left Tundra 23.5 lb as `candidate` for precisely this and was
  right to.

---

## 4. The GS1 prefix is unknown

`data/gs1-prefixes.ts` holds twenty prefixes and **not one belongs to Chewy**.
Nothing is known about what American Journey packs carry. An attempt to confirm
a prefix while writing this brief did not succeed, so you get no lead at all —
establish it from barcodes you can actually read.

Report every prefix you find with what it was on, and specifically:

- whether American Journey sits on one prefix or several;
- whether the `Chewy Made` packs share it, or the rename brought new codes;
- whether Tiny Tiger, Frisco or Soulistic share it — if they do, the prefix
  proves "a Chewy own-brand" and **not which one**, exactly as `064992` proves
  Champion and not Orijen-versus-Acana.

Register nothing yourself. `data/gs1-prefixes.ts` belongs to the seeding pass.

---

## 5. The range list

Four names are seeded: **Grain Free, Landmark, Active Life, Protein First**.
Expect this to be both incomplete and partly stale, and expect the rename to
have moved things. Establish the current list from packs.

The rule that worked on Pro Plan and Orijen applies unchanged:

- current manufacturer pages control `product_line`, formula, guarantees,
  calories and adequacy;
- an older listing may be used **only** as package-identity evidence, binding an
  exact UPC to an exact printed size;
- never write a range name as current because an old page still uses it.

Every range the entry lacks goes in the handoff. **Do not edit
`data/us-pet-brands.ts`.**

---

## 6. Dry bags, size ladders, calories per cup

The volume here is dry, sold up a ladder of bag sizes — 4, 12, 14, 24, 28 lb are
shapes this brand uses — **each with its own UPC**. `BRIEF-PURINA-ONE.md` §4 has
the two opposite mistakes in full and they apply unchanged:

1. **Splitting one recipe into five products** because five listings had five codes.
2. **Merging two sizes' evidence** — bind every UPC to the exact printed size.

And the third: **a 28 lb bag is an individual unit.** Big is not a case.

Copy **both** printed calorie bases, kcal/kg and kcal per cup, with the basis the
pack states. Do not derive one from the other. If the two printed figures
disagree, record both and say so in `conflicts`.

One more, learned the hard way on Orijen: the ledger's `unit` enum in §9 of
`AGENTS.md` allows only `percent | IU/kg | other`. When a printed guarantee is
in mg/kg or CFU/lb — glucosamine, probiotics, L-carnitine — **put the unit in
the nutrient name**, e.g. `"Glucosamine (mg/kg)"`, and set `unit` to `"other"`.
The catalog can hold it: `data/known-formulas.ts` writes extras through
`withExtras` where `unit` is a free string. Dropping the unit loses the meaning
of the number.

---

## 7. Recalls: state the negative

`data/recalls.ts` in the app repository holds Hill's, For All Tails and Royal
Canin. As far as this brief could establish, **American Journey has never been
recalled**, and a search found no FDA or manufacturer notice.

Write that down as a finding, with where you searched, so the next agent does
not repeat it. If you do find a notice, it must come from **FDA or Chewy
itself** — not a blog aggregating one — and it goes in the handoff as a
`data/recalls.ts` recommendation, never as an edit.

Be careful about the shape of a private-label recall: a co-packer's recall can
cover several brands at once, so a notice naming the plant rather than the brand
may still be this brand's. Read what the notice actually lists.

---

## 8. Chewy in `manufacturers.ts`, which is genuinely hard

`data/manufacturers.ts` in `Ingredients.help` holds eleven makers. **Chewy is not
among them**, so an American Journey brand page is blocked until it is.

This one is harder than Champion or Mars, and the difficulty is the finding:
**Chewy is a retailer, not a manufacturer.** The food is made at partner
facilities — Kansas is named in public material — which Chewy does not own. So
of the five criteria, `ownsPlants` is probably a straight **no**, and
`feedingTrials`, `staffNutritionist` and `publishesResearch` need evidence that
may simply not exist for a private label.

**That is a legitimate answer, not a gap.** The file exists to say what is true
about a maker, and "this brand is made under contract by facilities its owner
does not run and does not name" is real information a reader deserves. Capture
whatever primary material you find with URLs and a checked-at date; where there
is none, say so explicitly. Do not soften a missing answer into a maybe.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-american-journey` (from current `main`) |
| Ledger | `research/deep-research-american-journey.json` (new — create it, and only it) |
| Inventory | `research/INVENTORY-AMERICAN-JOURNEY.md` (generated, §0.3) |
| Handoff | `research/AMERICAN-JOURNEY-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["American Journey"]`.

**Exactly three files, all under `research/`.** Nothing under `data/`, `app/`,
`lib/`, `components/`, `tests/` or `scripts/`, and no other
`research/deep-research-*.json`. Registering a prefix, adding a range, renaming
or aliasing the brand, adding Chewy to `manufacturers.ts`, putting a code on the
wrong-barcodes list — all the seeding pass's job. You say what they should be,
in the handoff. Do not write a fourth file: an earlier agent wrote itself a
batch-2 brief, and the handoff's "next batch" section is where that goes.

---

## 10. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research up to 20 records.
4. **Append** to the same ledger. Update `updated_at`. Never rewrite an earlier
   record silently — §4 of `AGENTS.md` allows a correction only with the reason
   in `verification_notes` and in the commit message.
5. **Run the checker.** Zero ERRORs, every WARN answered.
6. One commit: `research: American Journey batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
American Journey batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  brand as printed: American Journey NN   Chewy / Chewy Made NN   unclear NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
```

Twenty is a limit, not a target. A campaign that stopped at five and said why
was doing the job correctly. On this brand, stopping early because the rename
is unresolved is a **good** outcome.

Order: **dry dog, then dry cat, then wet, then multipacks, treats last.**

---

## 11. The handoff

`research/AMERICAN-JOURNEY-HANDOFF.md`, written from the first batch and updated
as you go, not left to the end.

1. **The rename answer** — §2, and put it first. What current packs print, per
   product where it differs; whether UPCs changed; and your recommendation for
   `data/us-pet-brands.ts`: rename, alias, or a new entry beside it.
2. **The range answer** — every `product_line` you used, spelled as the packs
   spell them; which of the four are current; every range the entry lacks.
3. **GS1 prefixes** — §4, including whether the prefix separates Chewy's own
   brands from each other or only identifies Chewy.
4. **Single-source notes** — §3. Where chewy.com and americanjourneyco.com
   disagreed, and which you took.
5. **Size ladders** — sizes and the UPC of each, so the seeding pass builds
   `packages[]` without re-deriving it.
6. **Multipacks** — box codes proved, with counts and unit sizes.
7. **Wrong-barcode recommendations** — any case code sold as a single unit.
8. **Recalls** — the explicit negative and where you searched. §7.
9. **Chewy for `manufacturers.ts`** — §8, including the honest nos.
10. **The unresolved tail, by REASON** — blockers, not a list of barcodes:
    rename unresolved, exact-size binding missing, no printed calorie statement,
    one source only. The next agent works by gap, not from record 1.
11. Where you stopped and why.

---

## 12. Done

- Egress checked **before** research, per §0.1.
- Exactly one ledger, appended to, never duplicated. §0.2.
- Inventory genuinely generated, not reconstructed.
- Every batch committed to the branch, checker clean, remote fetched back.
- Handoff complete, with the rename answer first.
- Draft PR open, unmerged, one report per batch.
- Exactly three files changed, all under `research/`.

`needs_physical_label` is a result, not a failure. A wrong `source_verified` is
not: it reaches a shopper standing in front of the actual pack.

On this brand the most likely wrong answer is quiet and structural: a recipe
filed once under a brand name that is being retired, while the bag in the
shopper's kitchen and the listing they would find say two different things. The
second is a figure taken from one page and treated as confirmed because a second
page on the same site repeated it.
