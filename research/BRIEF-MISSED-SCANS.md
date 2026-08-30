# Assignment: six barcodes real shoppers scanned and did not get

These are not speculative leads. Every one came off the **"Looked for, not
found"** panel — a `barcode_cache` row with `found = false`, written when
somebody in a shop scanned the code and the app had nothing for them. They are
the highest-value records in the queue, because demand for them is measured
rather than guessed.

`research/AGENTS.md` is the binding contract. Read it first. Everything in
§7–§11 of `research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity
rules, multipack rules) applies here unchanged — read that file too rather than
having it repeated.

---

## 0. The checker

Before every commit, for whichever ledger you touched:

```bash
node scripts/check-ledger.mjs research/deep-research-<slug>.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.

---

## 1. What has ALREADY been verified — do not redo this

Done offline against the live repository. These results are definitive and you
can rely on them:

| UPC | Check digit | Held anywhere? | GS1 prefix |
|---|---|---|---|
| `050000577989` | **valid** | no | 050000 — Nestlé Purina, registered |
| `050000429349` | **valid** | no | 050000 — Nestlé Purina, registered |
| `050000153558` | **valid** | no | 050000 — Nestlé Purina, registered |
| `050000180721` | **valid** | no | 050000 — Nestlé Purina, registered |
| `071190478450` | **valid** | no | 071190 — **not registered**, establish the owner |
| `017800012638` | **valid** | no | 017800 — **not registered**, Nestlé Purina's second prefix |

"Held anywhere" was checked against `data/known-products.ts`,
`data/known-multipacks.ts`, `data/wrong-barcodes.ts` and all eight
`research/deep-research-*.json` ledgers. All six are new.

**What could NOT be established here, and why it is your job:** this
environment's network policy blocks manufacturer and retailer domains
(`purina.com`, Chewy, grocery sites — all `EGRESS_BLOCKED`). Only a search
index was reachable, and a search-engine summary is weaker than the "secondary
barcode database" that §6 of the contract already forbids as sole proof. So no
verbatim ingredient statement, no complete guaranteed analysis and no calorie
statement has been obtained for any of the six. **Every formula field is
yours to establish from primary sources.**

---

## 2. Where each record goes

`AGENTS.md` §1: one brand, one ledger. These six span four brands.

| UPC | Brand | Ledger |
|---|---|---|
| `050000577989` | Friskies | `research/deep-research-barcodes.json` (the legacy Fancy Feast + Friskies file — this is its documented exception) |
| `050000429349` | Fancy Feast | `research/deep-research-barcodes.json` |
| `050000153558` | Fancy Feast | `research/deep-research-barcodes.json` |
| `050000180721` | Fancy Feast | `research/deep-research-barcodes.json` |
| `071190478450` | 9Lives | `research/deep-research-9lives.json` (new — create it) |
| `017800012638` | Purina ONE | `research/deep-research-purina-one.json` (new — create it) |

Branch `agent/deep-research-missed-scans`, one draft PR, left unmerged.
Handoff: `research/MISSED-SCANS-HANDOFF.md`.

Touch nothing under `data/`, `app/`, `lib/`, `components/`, `tests/`,
`scripts/`. Registering the two GS1 prefixes and adding any missing range name
is the seeding pass's job — you say what they should be, in the handoff.

---

## 3. The identity questions, per code

The list this assignment came from carries a product name for each barcode.
**Treat every one of those names as a claim to be tested, not as given.** Three
of the six already have evidence pointing somewhere else.

### `050000577989` — claimed: Friskies Tasty Treasures Turkey & Cheese in Gravy, 5.5 oz can

Friskies sells **Tasty Treasures Turkey & Cheese** *and* **Savory Shreds Turkey
& Cheese Dinner in Gravy**, both at 5.5 oz, and search returns both against this
code. They are different ranges with different textures, so this decides `line`
and `texture`, not just wording. Settle it from the can.

A figure worth checking against, from a weak source, so verify it rather than
copy it: 11.0 / 2.0 / 1.0 / 80.0 / ash 3.0 / taurine 0.05, and 861 kcal/kg with
134 kcal/can. That pair is internally consistent — 861 × 0.156 kg = 134.2 —
which is a good sign and not proof.

**Do not** conclude the range from the neighbouring codes. The catalog already
holds Tasty Treasures 5.5 oz at `050000577958`, `050000577965` and
`050000577972`, and `577989` sits in the same block. §7 of the contract forbids
inferring identity from neighbouring UPCs, and this is that inference wearing a
friendly face.

### `050000429349` — claimed: Fancy Feast Classic Paté Seafood Feast, 3 oz can

The most consistently supported of the six: several listings name a Fancy Feast
Classic / Gourmet **Seafood Feast, 3 oz**, and the catalog holds no Classic Pâté
Seafood Feast, so there is no identity collision.

One caution: two of those listings describe it as "3-Ounce Can, **Pack of 24**".
That is usually a retailer selling a case *of* the single-can UPC, which is
harmless — but it is also exactly how a case code gets filed as a tin. Prove the
code is on the **single can**.

### `050000153558` — claimed: Fancy Feast Gravy Lovers Chicken Feast Paté in Gravy, 3 oz

**The claim and the evidence disagree, and this is the flag that matters most.**
Search associates this code with a **Fancy Feast Classic Seafood Feast Variety
Pack, case of 24** — a different range, a different flavour, and a *box* rather
than a can.

Two secondary signals point the same way: every one of the eight Gravy Lovers
products the catalog holds sits in the `050000578xxx`, `050000292xxx` or
`050000580xxx` blocks, and `153558` is nowhere near them.

Three possible outcomes, and all three are good results:

- it is a single 3 oz can of something → record it as that;
- it is a variety pack → `barcode_scope: "multipack"`, no composition, members
  in `contains` if their printed codes can be proven, **empty if not** — a box
  does not need inner barcodes to be `source_verified`;
- it is a case of an existing single tin → it belongs in
  `data/wrong-barcodes.ts` with `insteadUse` pointing at the tin. Say so in the
  handoff; the seeding pass makes that edit.

### `050000180721` — claimed: Fancy Feast Gravy Lovers Salmon Feast Paté in Gravy, 3 oz

**Nothing at all was found for this code.** Not a listing, not a database entry.
The claimed identity is unsupported by anything reachable from here. Start from
the barcode, not from the name — and if the name turns out to be wrong, the
name is what gives way.

Same block caution as above: the Gravy Lovers we hold are nowhere near
`050000180xxx`.

### `071190478450` — claimed: 9Lives Indoor Essentials Dry Cat Food, 3.15 lb bag

The catalog knows the brand (**9Lives**, owner recorded as **Post**) but its
ranges are `Daily Essentials`, `Meaty Pate`, `Tender Morsels`, `Protein Plus` —
**"Indoor Essentials" is not among them**, so this product would file under
"Other", and `lib/known-import.test.ts` now refuses to seed a product whose
range its brand entry does not name. Confirm the range as the bag prints it and
report it in the handoff.

Also confirm the owner: 9Lives has moved Del Monte → Big Heart → J.M. Smucker →
Post, and "Post" may or may not still be right.

GS1 prefix `071190` is not registered in `data/gs1-prefixes.ts`. Establish whose
it is.

This is the first dry 9Lives product for us, so the guaranteed analysis will be
an as-fed dry panel — roughly 10% moisture and 30%+ protein. That is normal and
the checker knows it; do not "correct" it toward canned figures.

### `017800012638` — claimed: Purina ONE +PLUS Hairball Formula Dry Cat Food, 3.5 lb bag

`+Plus` **is** an existing Purina ONE range in the brand entry, so this one
should file correctly if the claim holds.

GS1 prefix `017800` is not registered, though it is Nestlé Purina's second
company prefix (the one Alpo and much of Purina ONE carry) alongside the `050000`
the catalog already knows. Confirm and report it — a maker running two prefixes
at once is now an established pattern here, not a surprise.

---

## 4. Batches

Six records is one batch. Work them in the order above, run the checker on each
ledger you touched, and commit per ledger:

```
research: missed-scans — N records into <ledger>
```

Then post the batch report and fetch each file back to confirm.

---

## 5. What "done" looks like

For each of the six, exactly one of:

- **`source_verified`** — full record: individual-unit UPC proven on the pack or
  a single-unit page, verbatim ingredients in printed order, complete printed
  guaranteed analysis, calorie content in every printed basis, exact size and
  package type, life stage / adequacy statement where printed, direct source
  URLs and access date.
- **`source_verified` as a multipack** — outer identity proven, no composition,
  `contains` filled or empty.
- **`needs_physical_label`** — the code is real, the identity is not settled, and
  the label is what would settle it. Say which of the six gaps blocks it.
- **a wrong-barcodes recommendation** — it is a case or tray code for a tin we
  already hold. Name the tin.

`needs_physical_label` on all six is an acceptable outcome. A wrong
`source_verified` is not: these six reach shoppers who are already looking for
them, so an invented ingredient list would be served to somebody standing in
front of the actual can.

Never fill a gap with a guess. The list this came from is a set of claims, and
your job is to confirm or correct them from the label.
