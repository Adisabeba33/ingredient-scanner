# Weruva 129-candidate campaign — final disposition ledger

Finalized 2026-09-04 under `research/AGENTS.md`.

This is the authoritative completion counter for the 129 unique UPC candidates originally enumerated in `research/WERUVA-POST-30-INDEX.md`.

A candidate counts as **closed** once it has a final research disposition. `needs_physical_label` is a final disposition for this research pass: online evidence is insufficient to safely join the indexed UPC to the current individual-unit formula generation, so the next required evidence is a current physical package. It is not an open web-research task.

## Final counter

- Original unique candidates: **129**
- Closed: **129**
  - `source_verified` and appended to canonical Weruva ledger: **13**
  - historical/replaced current-generation dispositions finalized in the earlier pass: **8**
  - final `needs_physical_label` dispositions: **108**
- Remaining web-research candidates in this campaign: **0**
- Canonical Weruva ledger remains **133 `source_verified` records**

No additional candidate was promoted in this final pass. The strict gate forbids combining a historical/distributor UPC with a current manufacturer formula when the current individual-unit generation cannot be proven as the same package.

## Final-pass rationale

The manufacturer-catalog/evidence crawl found only 13 exact-same-UPC current matches strong enough for strict promotion; those 13 were already appended. For the rest, retailer/distributor evidence often proves that an indexed code has been a real sellable unit while current Weruva pages prove a current formula, but the sources do not consistently prove that both describe the same current barcode generation. Current storefront variant barcodes may also represent pack-level variants, so they are not substituted for an individual can/pouch without independent unit proof.

A 2026-09-04 recheck of Best Day Eva illustrates the problem: older UPCs `878408003943` / `878408004063` remain in retailer/distributor evidence while a newer Weruva-generation 5.5 oz UPC `813778019170` also exists. Those old codes are therefore kept at `needs_physical_label`, not guessed as current or silently rejected.

### Strongly corroborated but still label-gated

These UPCs have particularly strong exact-size retailer/distributor corroboration and current formula evidence, but the same-current-generation join is still not sufficiently proven for strict append: `813778015615`, `813778014588`, `813778015103`, `813778014755`, `813778014816`, `813778014540`.

`813778015127` has strong 2.8 oz unit corroboration but conflicting manufacturer/storefront barcode-generation evidence. `813778015004` has strong 5.5 oz unit corroboration but lacks a clean same-generation current calorie/barcode closure. `813778018609` remains a Family Food 5.5 oz conflict (`813778018609` vs `813778018685`).

## Final `needs_physical_label` list — 108 unique UPCs

Common disposition reason unless a stronger conflict is noted above: **current indexed UPC and current individual-unit formula generation are not proven together**.

### Slide N' Serve / Classic / Pantry Pours — 11

`813778018920`, `813778018609`, `813778018999`, `813778018753`, `813778018975`, `813778018982`, `813778018968`, `813778018722`, `878408001123`, `810192811335`, `878408001147`

### BFF PLAY / Originals — 20

`813778015615`, `813778014588`, `813778015103`, `813778015127`, `813778015004`, `813778014755`, `813778014816`, `813778014540`, `813778014731`, `813778015608`, `813778015486`, `813778016056`, `813778016063`, `813778015943`, `813778015745`, `878408007040`, `878408007545`, `878408007071`, `878408007576`, `878408007675`

### BFF OMG — 20

`878408003943`, `878408004063`, `878408000447`, `813778016506`, `813778016384`, `813778016209`, `813778016520`, `813778016193`, `813778016216`, `813778016537`, `878408000409`, `878408003905`, `878408004025`, `878408000430`, `878408003936`, `878408004056`, `878408000423`, `878408003912`, `878408004032`, `878408003929`

### BFF OMG / Originals / Classic — 19

`878408004049`, `878408000454`, `878408008986`, `878408008979`, `878408008948`, `878408008009`, `878408008993`, `878408008917`, `813778016360`, `813778016407`, `813778016414`, `878408007026`, `878408007521`, `878408007057`, `878408007552`, `878408007019`, `878408007514`, `878408007088`, `878408007583`

### PLAY / OMG / Originals / Classic — 11

`813778014984`, `813778014724`, `878408007033`, `878408007538`, `878408007637`, `878408007064`, `878408007569`, `878408007767`, `878408001154`, `878408002144`, `878408001017`

### Kitten / Cat Paté / Wx / Pantry Pours / Pumpkin / Pamper Like Paris — 15

`810028242807`, `813778018371`, `813778018234`, `813778018364`, `813778018227`, `810192811281`, `810192811250`, `810192811311`, `810192811366`, `810192811397`, `878408000607`, `878408000720`, `810028241176`, `810028241206`, `810028247123`

### Later PLAY / OMG — 12

`813778017145`, `813778017022`, `813778017121`, `813778017138`, `813778017046`, `813778016490`, `813778015646`, `813778016070`, `813778016018`, `813778016049`, `813778015325`, `813778014793`

## Previously closed — `source_verified` (13)

`810028246072`, `813778015660`, `813778015530`, `813778014656`, `813778015073`, `813778014670`, `813778015097`, `813778014120`, `813778019125`, `813778019170`, `810028246065`, `810028246133`, `813778015523`

## Previously closed — historical/replaced current-generation dispositions (8)

`813778018203`, `813778018951`, `813778018944`, `813778018708`, `813778018937`, `813778018692`, `878408001031`, `878408002038`

## Integrity / next-evidence rule

- Do not promote any of the 108 from retailer identity alone.
- Do not derive missing unit calories from `kcal/kg`.
- Do not treat a Shopify pack/case barcode as an individual-unit barcode without independent unit proof.
- A future physical-label pass may move a `needs_physical_label` item to `source_verified` only when the package proves the exact UPC, printed size, full ingredients, complete GA/calories, and adequacy/life-stage statement for that same generation.
- No production seed file is changed by this disposition pass.
- PR #3 remains DRAFT / OPEN and must not be merged without explicit user instruction.
