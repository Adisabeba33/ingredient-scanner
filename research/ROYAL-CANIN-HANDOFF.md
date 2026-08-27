# Royal Canin Deep Research — pause / handoff

> Snapshot generated from the live files on branch `agent/deep-research-barcode-ledger` on 2026-08-26.
> Royal Canin research is intentionally PAUSED for both species. Do not start new Royal Canin research until explicitly requested.

## Critical file ownership

- **Dogs only:** `research/deep-research-royal-canin-dogs.json`
- **Cats only:** `research/deep-research-royal-canin.json`
- Do **not** merge the two ledgers. This project intentionally split Royal Canin by species to permit safe parallel work; this is the explicit exception to the generic one-brand/one-ledger example in `research/AGENTS.md`.
- `research/AGENTS.md` remains binding for evidence, duplicate checks, status gates, validation, concurrency safety, and promotion rules.
- These are **staging research ledgers**, not production catalog data. A developer may independently re-check and promote records into production. Future research must re-fetch all production and research exclusions before finding anything new.

## Royal Canin DOGS

- Ledger: `research/deep-research-royal-canin-dogs.json`
- Live record count: **180**
- Unique UPC count: **180**
- Unique canonical GTIN-14 count: **180**
- `updated_at`: `2026-08-26`
- Statuses: `source_verified` 180
- Food forms: `dry` 175, `wet` 5
- Package types: `bag` 175, `can` 5
- Life stages: `adult` 134, `puppy` 32, `senior` 11, `null` 3

### Product-line coverage

- Veterinary Health Nutrition: **70**
- Breed Health Nutrition: **56**
- Size Health Nutrition: **33**
- Canine Care Nutrition: **17**
- Canine Health Nutrition: **4**

### Evidence / review state

- Records with non-empty `conflicts`: **19**
- `needs_physical_label`: **0**
- `rejected`: **0**
- For `source_verified`, the intended standard is: proven individual-unit UPC + exact size + valid check digit + canonical GTIN-14 + current formula evidence + repository-wide duplicate check.
- Formula evidence and barcode evidence may come from different sources. Current Royal Canin USA is preferred as formula master when available; distributor/retailer evidence is used to prove exact UPC-to-unit-size identity.
- Do not combine old retailer ingredient panels with a newer Royal Canin USA formula generation. Preserve the current formula and record the disagreement in `conflicts`.

#### Records carrying conflicts

- `030111517975` — Large Adult Dry Dog Food — 17 lb: Barcode retailer panel reflects an older Large Adult formula generation (including corn gluten meal and older fiber/moisture/EPA-DHA guarantees); current Royal Canin USA formula and analysis are stored.
- `030111179302` — Large Adult Dry Dog Food — 30 lb: Barcode retailer panel reflects an older Large Adult formula generation (including corn gluten meal and older fiber/moisture/EPA-DHA guarantees); current Royal Canin USA formula and analysis are stored.
- `030111449283` — Large Puppy Dry Dog Food — 30 lb: Barcode retailer panel reflects an older Large Puppy formula generation and 3667 kcal/kg / 352 kcal/cup; current Royal Canin USA page shows the newer formula and 3638 kcal/kg / 349 kcal/cup, which are stored.
- `030111512512` — Small Adult Dry Dog Food — 14 lb: Barcode retailer panel still exposes an older Small Adult guarantee set (including 3.4% max fiber and 10.0% max moisture); current Royal Canin USA page shows 3.2% max fiber, 10.5% max moisture, calcium 0.73%, and phosphorus 0.56%, which are stored.
- `030111447142` — Small Puppy Dry Dog Food — 14 lb: Barcode retailer panel reflects an older Small Puppy formula generation and 3891 kcal/kg / 354 kcal/cup; current Royal Canin USA page shows the newer formula and 3832 kcal/kg / 349 kcal/cup, which are stored.
- `030111512727` — Small Aging 12+ Dry Dog Food — 2.5 lb: A separate retailer formula panel for this UPC reflects an older generation (different ingredient order, 10.0% max moisture and 0.37% min phosphorus with EPA/DHA guarantees); the current Royal Canin USA page shows the newer formula, 10.5% max moisture, 0.36% min phosphorus and 0.13% min taurine, which are stored.
- `030111453037` — Medium Weight Care Dry Dog Food — 30 lb: Royal Canin USA English currently prints 3200 kcal/kg and 256 kcal/cup. The Spanish-localized US page prints the same 3200 kcal/kg but 230 kcal/cup. The English feeding table implies about 80 g per cup, for which 3200 kcal/kg × 0.080 kg = 256 kcal; 256 kcal/cup is therefore stored and the localization discrepancy is retained.
- `030111184306` — Giant Adult Dry Dog Food — 30 lb: The Spanish-localized Royal Canin US page currently exposes an older/different Giant Adult ingredient/GA panel (including 10.0% max moisture, 0.14% taurine and 446 mg/kg glucosamine). The current English Royal Canin US page and current Royal Canin Canada page agree on the stored 10.5% moisture, EPA+DHA, calcium, magnesium, 476 mg/kg glucosamine formula and 3958/427 kcal values; generations were not combined.
- `030111510303` — Cavalier King Charles Puppy Dry Dog Food — 3 lb: An older Royal Canin pre-production/cache page exposes the prior Cavalier King Charles Puppy deck (3.7% max fiber, 10.0% max moisture, separate EPA 0.17% and DHA 0.07%, taurine 0.14%). The current Royal Canin USA retail page exposes the stored 4.0% fiber, 10.5% moisture, EPA+DHA 0.24%, taurine 0.13% generation; generations were not combined.
- `030111505613` — Small Dental Care Dry Dog Food — 17 lb: Older distributor/product-guide material also lists a 3 lb Small Dental Care package; the current Royal Canin USA English product page exposes 17 lb, so only the 17 lb SKU is source-verified here.
- `030111460127` — Small Sensitive Skin Care Dry Dog Food — 3 lb: Some distributor material still exposes a legacy 13 lb Small Sensitive Skin Care SKU. The current Royal Canin USA English page exposes 3 lb, and the stored UPC is independently tied to the 3 lb bag; the legacy 13 lb SKU was not promoted.
- `030111512321` — X-Small Adult 8+ Dry Dog Food — 2.5 lb: The current Royal Canin Canada page exposes a different X-Small Adult 8+ formula generation (including 3.4% max fiber, 10.5% max moisture and 3858/363 kcal). The current Royal Canin USA English page is the stored formula master; country-specific generations were not combined.
- `030111416872` — Golden Retriever Adult Dry Dog Food — 17 lb: The Spanish-localized Royal Canin US page currently exposes an older/different Golden Retriever Adult formula generation (5.7% max fiber, 10.0% max moisture, separate EPA 0.17% and DHA 0.07%, taurine 0.20%, 891 mg/kg glucosamine, 9 mg/kg chondroitin, 3489 kcal/kg and 276 kcal/cup). The current English Royal Canin USA page is the stored formula master; generations were not combined.
- `030111691040` — Golden Retriever Adult Dry Dog Food — 5 lb: The Spanish-localized Royal Canin US page currently exposes an older/different Golden Retriever Adult formula generation (5.7% max fiber, 10.0% max moisture, separate EPA 0.17% and DHA 0.07%, taurine 0.20%, 891 mg/kg glucosamine, 9 mg/kg chondroitin, 3489 kcal/kg and 276 kcal/cup). The current English Royal Canin USA page is the stored formula master; generations were not combined.
- `030111177315` — Medium Adult 7+ Dry Dog Food — 30 lb: The Spanish-localized Royal Canin USA page exposes an older/different Medium Adult 7+ formula generation. The current English Royal Canin USA page is the stored formula master; generations were not combined.
- `030111427618` — Hydrolyzed Protein HP Dry Dog Food — 17.6 lb: PetCareRx currently shows an older ingredient/analysis generation for this UPC family; current Royal Canin manufacturer page was used for formula fields.
- `030111427625` — Hydrolyzed Protein HP Dry Dog Food — 25.3 lb: PetCareRx currently shows an older ingredient/analysis generation for this UPC family; current Royal Canin manufacturer page was used for formula fields.
- `030111472120` — Satiety Support Weight Management Dry Dog Food — 26.4 lb: PetCareRx displays an older formula generation (including 2880 kcal/kg and 245 kcal/cup and older ingredient/GA values). Current Royal Canin USA formula, guaranteed analysis and 2911 kcal/kg / 224 kcal/cup are stored; generations were not combined.
- `030111472175` — Satiety Support Weight Management Dry Dog Food — 7.7 lb: PetCareRx displays an older formula generation. Current Royal Canin USA formula, guaranteed analysis and 2911 kcal/kg / 224 kcal/cup are stored; generations were not combined.

### Last 20 records currently in ledger

- **161** — `030111426062` — Urinary SO Dry Dog Food — 6.6 lb — `source_verified`
- **162** — `030111420619` — Urinary SO Dry Dog Food — 17.6 lb — `source_verified`
- **163** — `030111426024` — Urinary SO Dry Dog Food — 25.3 lb — `source_verified`
- **164** — `030111644664` — Urinary SO Aging 7+ Dry Dog Food — 6.6 lb — `source_verified`
- **165** — `030111488275` — Urinary SO Moderate Calorie Dry Dog Food — 7.7 lb — `source_verified`
- **166** — `030111488213` — Urinary SO Moderate Calorie Dry Dog Food — 17.6 lb — `source_verified`
- **167** — `030111488480` — Urinary SO Small Dog Dry Dog Food — 8.8 lb — `source_verified`
- **168** — `030111479419` — Urinary UC Dry Dog Food — 18 lb — `source_verified`
- **169** — `030111562258` — Urinary SO + Hydrolyzed Protein Dry Dog Food — 7.7 lb — `source_verified`
- **170** — `030111562289` — Urinary SO + Hydrolyzed Protein Dry Dog Food — 17.6 lb — `source_verified`
- **171** — `030111498359` — Canine Dental Medium and Large Dog Dry Dog Food — 7.7 lb — `source_verified`
- **172** — `030111498304` — Canine Dental Medium and Large Dog Dry Dog Food — 17.6 lb — `source_verified`
- **173** — `030111460431` — Canine Hepatic Dry Dog Food — 7.7 lb — `source_verified`
- **174** — `030111460462` — Canine Hepatic Dry Dog Food — 26.4 lb — `source_verified`
- **175** — `030111428271` — Canine Early Cardiac Dry Dog Food — 7.7 lb — `source_verified`
- **176** — `030111428219` — Canine Early Cardiac Dry Dog Food — 17.6 lb — `source_verified`
- **177** — `030111482501` — Canine Weight Control Medium Dog Dry Dog Food — 17.6 lb — `source_verified`
- **178** — `030111498403` — Canine Dental Small Dog Dry Dog Food — 8.8 lb — `source_verified`
- **179** — `030111560667` — Canine Satiety Support Weight Management Small Dog Dry Dog Food — 6.6 lb — `source_verified`
- **180** — `030111482525` — Canine Gastrointestinal Moderate Calorie Dry Dog Food — 22 lb — `source_verified`

### Resume point

- If this file has not changed, next ordinal would be **181**.
- **Do not trust that ordinal later.** On resume, fetch the live ledger again and recompute count, blob SHA, last UPCs, status counts, and repository-wide exclusions.
- Before every append, check UPC and canonical GTIN-14 against `data/known-products.ts`, `data/known-formulas.ts`, `data/wrong-barcodes.ts`, `docs/CATALOG-CONFLICTS.md`, and every `research/deep-research-*.json` file.
- Do not rely only on GitHub code search: during this campaign it repeatedly missed UPCs that were present inside the large minified JSON. Read/parse the raw ledger itself or use a guard script.
- Batch size target remains ~10 clean new `source_verified` SKU, but never pad a batch with weak UPCs.

## Royal Canin CATS

- Ledger: `research/deep-research-royal-canin.json`
- Live record count: **151**
- Unique UPC count: **151**
- Unique canonical GTIN-14 count: **151**
- `updated_at`: `2026-08-26`
- Statuses: `source_verified` 150, `needs_physical_label` 1
- Food forms: `dry` 106, `wet` 45
- Package types: `bag` 106, `can` 41, `pouch` 4
- Life stages: `adult` 122, `kitten` 15, `senior` 12, `all_life_stages` 1, `mature adult 7+` 1

### Product-line coverage

- Veterinary Diet: **56**
- Feline Care Nutrition: **42**
- Feline Health Nutrition: **38**
- Feline Breed Nutrition: **15**

### Evidence / review state

- Records with non-empty `conflicts`: **42**
- `needs_physical_label`: **1**
- `rejected`: **0**
- For `source_verified`, the intended standard is: proven individual-unit UPC + exact size + valid check digit + canonical GTIN-14 + current formula evidence + repository-wide duplicate check.
- Formula evidence and barcode evidence may come from different sources. Current Royal Canin USA is preferred as formula master when available; distributor/retailer evidence is used to prove exact UPC-to-unit-size identity.
- Do not combine old retailer ingredient panels with a newer Royal Canin USA formula generation. Preserve the current formula and record the disagreement in `conflicts`.

#### Records carrying conflicts

- `030111843579` — Royal Canin Persian Adult Dry Cat Food — 7 lb: Regional barcode difference: Canadian retailers expose 030111543578 for Persian Adult 7 lb; current U.S. distributor and U.S. retailers use 030111843579. U.S. UPC retained.
- `030111626035` — Royal Canin Hair & Skin Care Dry Cat Food — 3 lb: An older U.S. distributor listing maps UPC 030111626035 to a 3.5 lb Hair & Skin Care bag, while Royal Canin USA currently sells this formula as 3 lb and current 2026 sellable-unit listings map the same UPC to 3 lb/48 oz. The current 3 lb identity is stored; the older 3.5 lb generation is retained here as provenance.
- `030111543561` — Royal Canin Persian Adult Dry Cat Food — 15 lb: {'field': 'package_metadata', 'sources': ['PetScience', 'Toronto Pets / Pan Pacific'], 'values': ['PetScience product title identifies 15 lb but some distributor net-weight metadata may round/normalize differently.', 'Toronto Pets and Pan Pacific explicitly identify the retail variant as 15 lb.'], 'resolution': 'Store the marketed package size as 15 lb.'}
- `030111630131` — Royal Canin Indoor Long Hair Dry Cat Food — 6 lb: {'field': 'regional_formula', 'sources': ['Royal Canin USA', 'PetScience Canada'], 'values': ['U.S.: fiber max 6.5%, moisture max 7.5%, EPA+DHA min 0.19%.', 'Canada distributor: fiber max 6.4%, moisture max 8.0%, EPA 0.13%, DHA 0.05%, with a different ingredient order.'], 'resolution': 'Store current U.S. manufacturer formula for the U.S.-market record; preserve Canadian discrepancy here.'}
- `030111547552` — Royal Canin Indoor 7+ Dry Cat Food — 13 lb: {'field': 'market_availability', 'sources': ['Royal Canin USA', 'Canadian retailers/distributors'], 'values': ['Current U.S. retail assortment may list only smaller Indoor 7+ bags.', 'Canadian current sources actively list the 13 lb bag under UPC 030111547552.'], 'resolution': 'Retain as source-verified Canada-market individual unit.'}
- `030111646149` — Royal Canin Dental Care Adult Dry Cat Food — 14 lb: {'field': 'regional_calorie_statement', 'sources': ['Current Canadian 14 lb listing', 'Current U.S. smaller-bag formula'], 'values': ['Canada 14 lb: 3536 kcal/kg; 311 kcal/cup.', 'U.S. 3/6 lb product generation in the ledger has a slightly different calorie statement.'], 'resolution': 'Keep the exact current Canadian 14 lb declaration for this regional UPC.'}
- `030111716859` — Royal Canin Maine Coon Adult Thin Slices in Gravy Wet Cat Food — 3 oz / 85 g: {'field': 'distributor_unit_weight_metadata', 'sources': ['PetScience product title', 'PetScience unit metadata'], 'values': ['Product title and current retailer identify 3 oz / 85 g.', 'Distributor unit net weight metadata shows 0.24 lb, which is inconsistent with the marketed 85 g can.'], 'resolution': 'Use marketed printed size 3 oz / 85 g; retain metadata discrepancy as a conflict.'}
- `030111411556` — Royal Canin Digestive Care Loaf in Sauce Wet Cat Food — 3 oz: Distributor nomenclature is Digest Sensitive Loaf; current manufacturer nomenclature is Digestive Care Loaf in Sauce.
- `030111471550` — Royal Canin Digestive Care Thin Slices in Gravy Wet Cat Food — 3 oz: Distributor nomenclature is Digest Sensitive; current manufacturer nomenclature is Digestive Care.
- `030111604422` — Royal Canin Hair & Skin Care Thin Slices in Gravy Wet Cat Food — 3 oz: Former name Intense Beauty remains in distributor/legacy retailer metadata; current Royal Canin branding is Hair & Skin Care.
- `030111604446` — Royal Canin Weight Care Thin Slices in Gravy Wet Cat Food — 3 oz: Former product name Ultra Light appears in distributor metadata; current Royal Canin USA branding is Weight Care.
- `030111710314` — Royal Canin Hair & Skin Care Loaf in Sauce Wet Cat Food — 5.1 oz: Retail barcode sources retain the former Intense Beauty name; Royal Canin now markets the formula as Hair & Skin Care Loaf in Sauce. Current manufacturer naming/formula are stored.
- `030111710987` — Royal Canin Hair & Skin Care Loaf in Sauce Wet Cat Food — 3 oz: Retail barcode sources retain the former Intense Beauty name; Royal Canin now markets the formula as Hair & Skin Care Loaf in Sauce. Current manufacturer naming/formula are stored.
- `030111715388` — Royal Canin Weight Care Thin Slices in Gravy Wet Cat Food — 3 oz: Some retailer/distributor copies still show the former Ultra Light naming and an older 9.0% protein / 1.6% fat / 635 kcal/kg formula. Current Royal Canin USA shows Weight Care with 8.4% protein / 1.41% fat / 644 kcal/kg; current manufacturer formula is stored.
- `030111496317` — Royal Canin American Shorthair Adult Dry Cat Food — 5.5 lb: Some marketplace copies expose a secondary UPC 030111549600 for American Shorthair 5.5 lb. The canonical Royal Canin-prefixed GTIN-14 00030111496317 / UPC 030111496317 is retained; the secondary code is not filed as a second formula.
- `030111151858` — Royal Canin Adult Instinctive Chunks in Gravy Pouch Cat Food — 3 oz / 85 g: Current North American manufacturer copy and some English retailer label copies differ in ingredient wording/order for this pouch generation. Manufacturer order is stored, but a current physical pouch would be the strongest way to settle the label-language discrepancy.
- `030111153852` — Royal Canin Weight Care Chunks in Gravy Pouch Cat Food — 3 oz / 85 g: Older retailer/distributor copies can retain former naming or prior formula values. The current Royal Canin manufacturer formula is stored.
- `030111790644` — Royal Canin Aging 11+ Ultra Soft Mousse in Sauce Wet Cat Food — 5.1 oz / 145 g: Royal Canin page/market copies may use both 'Ultra Soft Mousse in Sauce' and 'Loaf in Sauce' wording during the current naming transition. The UPC is retained with the Ultra Soft Mousse identity used by the current product URL/distributor generation.
- `030111543493` — Royal Canin Sphynx Adult Dry Cat Food — 7 lb: Current U.S. retail assortment may not carry Sphynx Adult; current Canadian manufacturer/distributor sources do.
- `030111983527` — Royal Canin Veterinary Diet Feline Renal Support A Dry Cat Food — 12 oz: The exact-unit retailer page carries an older formula/calorie copy (including approximately 3790 kcal/kg / 345 kcal/cup and slightly different fiber). Current Royal Canin USA manufacturer data is stored; retailer data is used only for UPC-to-size identity.
- `030111583536` — Royal Canin Veterinary Diet Feline Renal Support A Dry Cat Food — 3 lb: The exact-unit retailer page carries an older formula/calorie copy (including approximately 3790 kcal/kg / 345 kcal/cup and slightly different fiber). Current Royal Canin USA manufacturer data is stored; retailer data is used only for UPC-to-size identity.
- `030111583567` — Royal Canin Veterinary Diet Feline Renal Support A Dry Cat Food — 6.6 lb: The exact-unit retailer page carries an older formula/calorie copy (including approximately 3790 kcal/kg / 345 kcal/cup and slightly different fiber). Current Royal Canin USA manufacturer data is stored; retailer data is used only for UPC-to-size identity.
- `030111583024` — Royal Canin Veterinary Diet Feline Renal Support F Dry Cat Food — 12 oz: The exact-unit retailer page can retain an older Royal Canin formula/analysis generation. Current manufacturer data is stored and retailer metadata is used only for exact UPC-to-size identity.
- `030111583031` — Royal Canin Veterinary Diet Feline Renal Support F Dry Cat Food — 3 lb: The exact-unit retailer page can retain an older Royal Canin formula/analysis generation. Current manufacturer data is stored and retailer metadata is used only for exact UPC-to-size identity.
- `030111583062` — Royal Canin Veterinary Diet Feline Renal Support F Dry Cat Food — 6.6 lb: The exact-unit retailer page can retain an older Royal Canin formula/analysis generation. Current manufacturer data is stored and retailer metadata is used only for exact UPC-to-size identity.
- `030111582638` — Royal Canin Veterinary Diet Feline Renal Support S Dry Cat Food — 3 lb: The exact-unit retailer page may carry an older formula/analysis generation. Current manufacturer data is stored; retailer metadata is used only for exact UPC-to-size identity.
- `030111582669` — Royal Canin Veterinary Diet Feline Renal Support S Dry Cat Food — 6.6 lb: The exact-unit retailer page may carry an older formula/analysis generation. Current manufacturer data is stored; retailer metadata is used only for exact UPC-to-size identity.
- `030111484338` — Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food — 3.3 lb: The exact-unit retailer page retains an older formula/calorie generation (about 3277 kcal/kg / 275 kcal/cup and higher fiber). Current Royal Canin USA manufacturer formula and 3319 kcal/kg / 299 kcal/cup are stored.
- `030111484369` — Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food — 6.6 lb: The exact-unit retailer page retains an older formula/calorie generation (about 3277 kcal/kg / 275 kcal/cup and higher fiber). Current Royal Canin USA manufacturer formula and 3319 kcal/kg / 299 kcal/cup are stored.
- `030111484376` — Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food — 17.6 lb: The exact-unit retailer page retains an older formula/calorie generation (about 3277 kcal/kg / 275 kcal/cup and higher fiber). Current Royal Canin USA manufacturer formula and 3319 kcal/kg / 299 kcal/cup are stored.
- … plus 12 more; inspect the JSON directly before promotion/resume.

### Last 20 records currently in ledger

- **132** — `030111488848` — Royal Canin Veterinary Diet Feline Glycobalance Dry Cat Food — 4.4 lb — `source_verified`
- **133** — `030111584458` — Royal Canin Veterinary Diet Feline Ultamino Dry Cat Food — 5.5 lb — `source_verified`
- **134** — `030111588005` — Royal Canin Veterinary Diet Feline Gastrointestinal Kitten Dry Cat Food — 4.4 lb — `source_verified`
- **135** — `030111588029` — Royal Canin Veterinary Diet Feline Gastrointestinal Kitten Dry Cat Food — 7.7 lb — `source_verified`
- **136** — `030111553034` — Royal Canin Feline Care Nutrition Appetite Control Care Dry Cat Food — 3 lb — `source_verified`
- **137** — `030111735539` — Royal Canin Feline Care Nutrition Appetite Control Care Thin Slices in Gravy Canned Cat Food — 3 oz / 85 g — `source_verified`
- **138** — `030111700919` — Royal Canin Feline Care Nutrition Appetite Control Care Loaf in Sauce Canned Cat Food — 5.1 oz / 145 g — `source_verified`
- **139** — `030111715531` — Royal Canin Feline Care Nutrition Digestive Care Thin Slices in Gravy Canned Cat Food — 3 oz / 85 g — `source_verified`
- **140** — `030111715289` — Royal Canin Feline Care Nutrition Hair & Skin Care Thin Slices in Gravy Canned Cat Food — 3 oz / 85 g — `source_verified`
- **141** — `030111716651` — Royal Canin Feline Care Nutrition Urinary Care Thin Slices in Gravy Canned Cat Food — 3 oz / 85 g — `source_verified`
- **142** — `030111977649` — Royal Canin Veterinary Diet Feline Calm Dry Cat Food — 4.4 lb — `source_verified`
- **143** — `030111477682` — Royal Canin Veterinary Diet Feline Calm Dry Cat Food — 8.8 lb — `source_verified`
- **144** — `030111582911` — Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food — 12 oz — `source_verified`
- **145** — `030111582928` — Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food — 4.4 lb — `source_verified`
- **146** — `030111582935` — Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food — 8.8 lb — `source_verified`
- **147** — `030111930118` — Royal Canin Veterinary Diet Feline Dental Dry Cat Food — 1.3 lb — `source_verified`
- **148** — `030111488831` — Royal Canin Veterinary Diet Feline Dental Dry Cat Food — 7.7 lb — `source_verified`
- **149** — `030111927828` — Royal Canin Veterinary Diet Feline Hydrolyzed Protein HP Dry Cat Food — 12 oz — `source_verified`
- **150** — `030111584021` — Royal Canin Veterinary Diet Feline Urinary SO + Calm Dry Cat Food — 12 oz — `source_verified`
- **151** — `030111583826` — Royal Canin Veterinary Diet Feline Urinary SO + Hydrolyzed Protein Dry Cat Food — 12 oz — `source_verified`

### Resume point

- If this file has not changed, next ordinal would be **152**.
- **Do not trust that ordinal later.** On resume, fetch the live ledger again and recompute count, blob SHA, last UPCs, status counts, and repository-wide exclusions.
- Before every append, check UPC and canonical GTIN-14 against `data/known-products.ts`, `data/known-formulas.ts`, `data/wrong-barcodes.ts`, `docs/CATALOG-CONFLICTS.md`, and every `research/deep-research-*.json` file.
- Do not rely only on GitHub code search: during this campaign it repeatedly missed UPCs that were present inside the large minified JSON. Read/parse the raw ledger itself or use a guard script.
- Batch size target remains ~10 clean new `source_verified` SKU, but never pad a batch with weak UPCs.

## Campaign lessons worth preserving

- Several plausible UPC candidate lists contained hidden duplicates. The repository guard, not GitHub Search, was the reliable final authority.
- A UPC printed in an old catalog is not automatically trustworthy; validate UPC-A check digit mathematically. Example encountered during this campaign: `030111425356` was invalid, while a newer catalog used `030111425256`.
- Distinguish individual retail unit UPC from case/shipping/multipack identifiers. A source showing `UNIT SIZE` plus `#/CS` can still prove the UPC belongs to one sellable unit if the mapping is explicit.
- For wet food, sanity-check printed kcal/can against kcal/kg × package kg; small label-rounding differences are acceptable and should be documented.
- For products serving both mother/gestation/lactation and puppy/kitten growth, do not invent a life-stage enum. Use the allowed `null`/controlled value and explain it.
- Do not invent texture/presentation synonyms such as treating “in gel” as gravy/sauce when the repository vocabulary does not support that mapping.
- Temporary guarded workflows used during research must not remain after a successful batch. At resume, inspect `.github/workflows/` and remove only clearly temporary Royal Canin research workflows if any were stranded by a failed run.

## Promotion / developer handoff

- The developer should independently re-check every record before production promotion. Research status `source_verified` means the research evidence gate passed; it is not a substitute for the developer’s own production validation.
- If records are promoted to `data/known-products.ts` / `data/known-formulas.ts`, future Royal Canin research must treat those promoted UPCs as occupied even if the research ledger still contains them.
- If the developer changes a research record during review, document the reason rather than silently rewriting history.
- Draft PR **#1** is the campaign review surface. Do not merge it without an explicit user request.

## Combined snapshot

- Royal Canin records across the two staging ledgers at this snapshot: **331**.
- Pause state: **Royal Canin cats and dogs research paused by user on 2026-08-26.**
- Resume instruction: start by re-reading this handoff, then `research/AGENTS.md`, then both live ledgers and the full repository exclusion set.

