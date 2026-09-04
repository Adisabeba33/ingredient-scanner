# Weruva — Post-30 Research Index

This file is a visibility/index companion to `research/deep-research-weruva.json`.

- Canonical strict ledger currently contains **120** complete schema-v2 records: the original 30, 20 TruLuxe, 18 Cat Stew, 8 Senior, 4 Freeze Dried, 20 early post-30 recheck records, and 20 promoted Kitten/Wx/Freeze Dried/Cat Paté records.
- This index now describes only work that has not yet been consumed into the strict ledger, plus explicit conflict/pending notes.
- **Do not treat this file as a substitute for the schema-v2 ledger.** A product may be promoted into `deep-research-weruva.json` only after its full schema-v2 record is assembled with complete ingredient statement, guaranteed analysis, calories, life stage/adequacy where printed, exact unit-barcode proof, source URLs, access date, conflicts, and verification notes required by `research/AGENTS.md`.

## Early validation batch after first 30 — consumed

All 20 formerly `RECHECK_BATCH_STATUS` rows were individually re-researched, passed a fresh exclusion/check-digit/formula-generation gate, and were promoted into the canonical strict ledger. Pumpkin Lickin’ Chicken uses the current Weruva 59 kcal/3 oz and 696 kcal/kg panel; the older 60/701 evidence is retained as a generation conflict.

## TruLuxe — consumed

All 20 TruLuxe rows previously listed here were promoted in full to `research/deep-research-weruva.json` in the same commit as this index update. The strict ledger now holds the exact UPC/size mapping, complete current ingredient statement, complete displayed guaranteed analysis, printed calories, source URLs, barcode proof and verification notes for each of those 20 records. No TruLuxe index-only row remains.

## Cat Stew — consumed

All 18 Cat Stew rows were promoted into `research/deep-research-weruva.json` as complete `source_verified` schema-v2 individual-unit records after a fresh repository exclusion pass. No Cat Stew index-only row remains.

## Senior / Freeze Dried / Puddy Pops / Wx treats — consumed

Promoted to strict ledger: **8 Senior individual units + 4 Freeze Dried individual units**.

The six retail five-pack UPCs below are **non-promotable as individual sticks** because the barcode identifies the outer five-pack and no separate individual-stick barcode is proven:

- `810028246782` — retail UPC identifies five-pack; no proven individual-stick barcode
- `810028246805` — retail UPC identifies five-pack; no proven individual-stick barcode
- `810028246799` — retail UPC identifies five-pack; no proven individual-stick barcode
- `810028246874` — retail UPC identifies five-pack; no proven individual-stick barcode
- `810028246881` — retail UPC identifies five-pack; no proven individual-stick barcode
- `810028246898` — retail UPC identifies five-pack; no proven individual-stick barcode

## Kitten / Wx / Freeze Dried / Cat Paté — consumed

All **20** rows in this prepared block were promoted into `research/deep-research-weruva.json` as complete `source_verified` individual-unit records after a fresh exclusion/check-digit/current-formula pass. For Wx, the printed `Adult, Senior` dual lifestage is preserved in verification notes with scalar `life_stage: null`; Freeze Dried Mideast Feast 7 oz keeps `kcal_per_unit: null` because no bag-total calorie value is printed.

## Slide N' Serve / Classic / Pantry Pours batch — awaiting strict promotion

| UPC | Product | Size | Research note |
|---|---|---:|---|
| `813778018203` | Tic Tac Whoa! — Tuna & Salmon | 5.5 oz | reverify full gate |
| `813778018920` | Family Food — Chicken Breast & Tuna | 2.8 oz | reverify full gate |
| `813778018609` | Family Food — Chicken Breast & Tuna | 5.5 oz | reverify full gate |
| `813778018999` | Jeopurrdy Licious — Chicken Breast | 2.8 oz | reverify full gate |
| `813778018753` | Jeopurrdy Licious — Chicken Breast | 5.5 oz | reverify full gate |
| `813778018975` | Let's Make a Meal — Lamb & Mackerel | 2.8 oz | reverify full gate |
| `813778018982` | Love Connection — Chicken & Salmon | 2.8 oz | reverify full gate |
| `813778018951` | Meal of Fortune — Chicken & Chicken Liver | 2.8 oz | reverify full gate |
| `813778018944` | Name 'Dat Tuna — Tuna Dinner | 2.8 oz | reverify full gate |
| `813778018708` | Name 'Dat Tuna — Tuna Dinner | 5.5 oz | reverify full gate |
| `813778018968` | The Newly Feds — Beef & Salmon | 2.8 oz | reverify full gate |
| `813778018722` | The Newly Feds — Beef & Salmon | 5.5 oz | reverify full gate |
| `813778018937` | The Slice Is Right — Wild Caught Salmon | 2.8 oz | reverify full gate |
| `813778018692` | The Slice Is Right — Wild Caught Salmon | 5.5 oz | reverify full gate |
| `878408001031` | Classic Asian Fusion — Tuna & Shirasu | 3 oz | reverify full gate |
| `878408002038` | Classic Asian Fusion — Tuna & Shirasu | 5.5 oz | reverify full gate |
| `878408001123` | Classic Grandma's Chicken Soup | 3 oz | reverify full gate |
| `810192811335` | Pantry Pours Chicken & Pumpkin Bisque with Senior Support | 1.4 oz | reverify full gate |
| `878408001147` | Classic Amazon Livin' / Nine Liver | 3 oz | later research resolved earlier pending identity; still needs strict record |
| `810028246072` | Wx Chicken & Tilapia in Gravy | 5.5 oz | later research resolved earlier pending identity; still needs strict record |

## BFF PLAY / Originals — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `813778015615` | PLAY Chicken & Tuna Til' Then | 2.8 oz |
| `813778014588` | PLAY Chicken & Beef Best Buds | 2.8 oz |
| `813778015103` | PLAY Chicken, Duck & Turkey Take a Chance | 2.8 oz |
| `813778015127` | PLAY Chicken & Lamb Laugh Out Loud | 2.8 oz |
| `813778015004` | PLAY Chicken & Lamb Laugh Out Loud | 5.5 oz |
| `813778014755` | PLAY Chicken & Tuna Tubular | 3 oz pouch |
| `813778014816` | PLAY Chicken & Turkey Tiptoe | 3 oz pouch |
| `813778014540` | PLAY Chicken Cherish | 3 oz pouch |
| `813778014731` | PLAY Beef & Tuna Ta Da! | 3 oz pouch |
| `813778015608` | PLAY Salmon & Tuna Tuck Me In | 2.8 oz |
| `813778015486` | PLAY Salmon & Tuna Tuck Me In | 5.5 oz |
| `813778016056` | PLAY Tuna & Beef Bodacious | 2.8 oz |
| `813778016063` | PLAY Tuna & Salmon Oh Snap! | 2.8 oz |
| `813778015943` | PLAY Tuna & Salmon Oh Snap! | 5.5 oz |
| `813778015745` | PLAY Tuna & Salmon SHHH... | 3 oz pouch |
| `878408007040` | Originals Tuna & Bonito Be Mine | 3 oz |
| `878408007545` | Originals Tuna & Bonito Be Mine | 5.5 oz |
| `878408007071` | Originals Tuna & Chicken 4Eva | 3 oz |
| `878408007576` | Originals Tuna & Chicken 4Eva | 5.5 oz |
| `878408007675` | Originals Tuna & Chicken 4Eva | 10 oz |

## BFF OMG — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `878408003943` | Best Day Eva! Beef & Salmon | 2.8 oz |
| `878408004063` | Best Day Eva! Beef & Salmon | 5.5 oz |
| `878408000447` | Booya! Beef & Chicken | 2.8 oz pouch |
| `813778016506` | Dream Team Chicken & Duck | 2.8 oz |
| `813778016384` | Dream Team Chicken & Duck | 5.5 oz |
| `813778016209` | Shine Bright Chicken & Salmon | 2.8 oz pouch |
| `813778016520` | Stir It Up Chicken & Salmon | 2.8 oz |
| `813778016193` | Text Me Chicken & Turkey | 2.8 oz pouch |
| `813778016216` | Charge Me Up Chicken | 2.8 oz pouch |
| `813778016537` | Cloud 9 Chicken | 2.8 oz |
| `878408000409` | Ciao Baby! Chicken & Shrimp | 2.8 oz pouch |
| `878408003905` | Crazy 4 U! Chicken & Salmon | 2.8 oz |
| `878408004025` | Crazy 4 U! Chicken & Salmon | 5.5 oz |
| `878408000430` | Date Nite! Duck & Salmon | 2.8 oz pouch |
| `878408003936` | Lots-O-Luck! Duck & Tuna | 2.8 oz |
| `878408004056` | Lots-O-Luck! Duck & Tuna | 5.5 oz |
| `878408000423` | Purr-Fect Plannin'! Chicken, Turkey & Salmon | 2.8 oz pouch |
| `878408003912` | QT Patootie! Chicken & Turkey | 2.8 oz |
| `878408004032` | QT Patootie! Chicken & Turkey | 5.5 oz |
| `878408003929` | Selfie Cam! Chicken & Lamb | 2.8 oz |

Known corrections: Charge Me Up `813778016216` supersedes candidate `813778016285`; Purr-Fect Plannin' `878408000423` supersedes candidate `878408004094`.

## BFF OMG / Originals / Classic — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `878408004049` | OMG Selfie Cam! Chicken & Lamb | 5.5 oz |
| `878408000454` | OMG Shazaam! Lamb & Tuna | 2.8 oz pouch |
| `878408008986` | OMG Baby Cakes Tuna & Beef | 3 oz pouch |
| `878408008979` | OMG Charm Me Tuna & Chicken | 3 oz pouch |
| `878408008948` | OMG Devour Me Tuna & Duck | 3 oz pouch |
| `878408008009` | OMG Luv Ya Tuna & Lamb | 3 oz pouch |
| `878408008993` | OMG Sweet Cheeks Tuna & Salmon | 3 oz pouch |
| `878408008917` | OMG Tickles Tuna & Turkey | 3 oz pouch |
| `813778016360` | OMG Be Happy Chicken & Beef | 5.5 oz |
| `813778016407` | OMG Stir It Up Chicken & Salmon | 5.5 oz |
| `813778016414` | OMG Chicken Cloud 9 | 5.5 oz |
| `878408007026` | Originals Sweethearts Tuna & Shrimp | 3 oz |
| `878408007521` | Originals Sweethearts Tuna & Shrimp | 5.5 oz |
| `878408007057` | Originals Twosome Tuna & Tilapia | 3 oz |
| `878408007552` | Originals Twosome Tuna & Tilapia | 5.5 oz |
| `878408007019` | Originals Too Cool Tuna | 3 oz |
| `878408007514` | Originals Too Cool Tuna | 5.5 oz |
| `878408007088` | Originals Chuckles Tuna & Chicken | 3 oz |
| `878408007583` | Originals Chuckles Tuna & Chicken | 5.5 oz |
| `878408001147` | Classic Amazon Livin' / Nine Liver | 3 oz |

Rejected/conflict candidates retained for investigation only: `878408000393`, `878408008894`, `878408008924`, `878408008931`.

## PLAY / OMG / Originals / Classic — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `813778015660` | PLAY Tic Toc — Beef & Tuna | 2.8 oz |
| `813778015530` | PLAY Tic Toc — Beef & Tuna | 5.5 oz |
| `813778014656` | PLAY Topsy Turvy — Chicken & Turkey | 2.8 oz |
| `813778015073` | PLAY Topsy Turvy — Chicken & Turkey | 5.5 oz |
| `813778014670` | PLAY Checkmate — Chicken | 2.8 oz |
| `813778015097` | PLAY Checkmate — Chicken | 5.5 oz |
| `813778014984` | PLAY Take a Chance — Chicken, Duck & Turkey | 5.5 oz |
| `813778014724` | PLAY Tap Dance — Duck & Tuna | 3 oz pouch |
| `813778014120` | OMG Love Munchkin — Chicken & Pumpkin | 2.8 oz |
| `813778019125` | OMG Love Munchkin — Chicken & Pumpkin | 5.5 oz |
| `813778019170` | OMG Best Day Eva! — Beef & Salmon | 5.5 oz current |
| `878408007033` | Originals Soulmates — Tuna & Salmon | 3 oz |
| `878408007538` | Originals Soulmates — Tuna & Salmon | 5.5 oz |
| `878408007637` | Originals Soulmates — Tuna & Salmon | 10 oz |
| `878408007064` | Originals Valentine — Tuna & Pumpkin | 3 oz |
| `878408007569` | Originals Valentine — Tuna & Pumpkin | 5.5 oz |
| `878408007767` | Originals Valentine — Tuna & Pumpkin | 10 oz current |
| `878408001154` | Classic Green Eggs & Chicken | 3 oz |
| `878408002144` | Classic Amazon Livin' / Nine Liver | 5.5 oz |
| `878408001017` | Classic Outback Grill | 3 oz |

Historical/replacement notes: older Topsy Turvy, Checkmate, Love Munchkin, Best Day Eva and Valentine codes require explicit version/conflict handling rather than silent overwrite.

## Kitten / Cat Paté / Wx / Pantry Pours / Pumpkin / Pamper Like Paris — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `810028242807` | Kitten Chicken & Tuna Formula in Gravy | 3 oz |
| `813778018371` | Cat Paté Jolly Good Fares — Chicken & Salmon | 3 oz |
| `813778018234` | Cat Paté Jolly Good Fares — Chicken & Salmon | 5.5 oz |
| `813778018364` | Cat Paté Meal or No Deal! — Chicken & Beef | 3 oz |
| `813778018227` | Cat Paté Meal or No Deal! — Chicken & Beef | 5.5 oz |
| `810028246065` | Wx Chicken Formula in Gravy | 5.5 oz |
| `810028246133` | Wx Chicken Formula in Hydrating Purée | 5.5 oz |
| `810028246072` | Wx Chicken & Tilapia Formula in Gravy | 5.5 oz |
| `810192811281` | Pantry Pours Chicken Bisque | 1.4 oz |
| `810192811250` | Pantry Pours Chicken & Tuna Bisque | 1.4 oz |
| `810192811311` | Pantry Pours Tuna Bisque | 1.4 oz |
| `810192811366` | Pantry Pours Salmon Bisque with Senior Support | 1.4 oz |
| `810192811397` | Pantry Pours Chicken & Salmon Bisque with Senior Support | 1.4 oz |
| `878408000607` | Pumpkin Patch Up! Pumpkin Purée | 1.05 oz |
| `878408000720` | Pumpkin Patch Up! Pumpkin Purée | 2.8 oz |
| `810028241176` | Pumpkin Patch Up! Pumpkin + Coconut Oil & Flaxseeds | 1.05 oz |
| `810028241206` | Pumpkin Patch Up! Pumpkin + Coconut Oil & Flaxseeds | 2.8 oz |
| `810028247123` | Pamper Like Paris Chicken Breast Dinner Paté | 2.47 oz |

## Latest BFF OMG / PLAY batch — awaiting strict promotion

| UPC | Product | Size |
|---|---|---:|
| `813778017145` | OMG Tuna & Salmon Start Me Up | 2.8 oz |
| `813778017022` | OMG Tuna & Salmon Start Me Up | 5.5 oz |
| `813778017121` | OMG Tuna & Turkey Tell Me | 2.8 oz |
| `813778017138` | OMG Tuna & Chicken Chase Me | 2.8 oz |
| `813778017046` | OMG Tuna & Lamb Lights Out | 5.5 oz |
| `813778016490` | OMG Chicken & Lamb Live N' Love | 2.8 oz |
| `813778015646` | PLAY Turkey & Tuna Tweet Me! | 2.8 oz |
| `813778016070` | PLAY Tuna & Chicken Check Please! | 2.8 oz |
| `813778016018` | PLAY Tuna & Chicken Check Please! | 5.5 oz |
| `813778016049` | PLAY Tuna & Duck Double Dare | 2.8 oz |
| `813778015523` | PLAY Duck & Tuna Trickster | 5.5 oz |
| `813778015325` | PLAY Turkey & Tuna Twinkles | 3 oz pouch |
| `813778014793` | PLAY Chicken & Duck Destiny | 3 oz pouch |

Pending from this family and not promotable until exact variant-level proof is complete: Tweet Me 5.5 oz, Tell Me 5.5 oz, Chase Me 5.5 oz, Lights Out 2.8 oz, Double Dare 5.5 oz and other PLAY variants.

## Promotion progress

Strict ledger: **50 complete records** after consuming TruLuxe. Remaining index rows are not considered strict records until their own promotion batch completes the full gate. Counts from the earlier conversational research are not inherited as proof.