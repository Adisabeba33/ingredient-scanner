import json
from pathlib import Path

TARGET = Path('research/deep-research-royal-canin.json')
PRICE = 'https://cdn.flowpage.com/images/1fe6d1c7-08d6-417a-9643-de4c5aacd6fa-pdf?m=1648228212'
DATE = '2026-08-26'

def top_level(s):
    out=[]; buf=[]; depth=0
    for ch in s.strip().rstrip('.'):
        if ch=='[': depth += 1
        elif ch==']': depth=max(0,depth-1)
        if ch==',' and depth==0:
            item=''.join(buf).strip()
            if item: out.append(item)
            buf=[]
        else: buf.append(ch)
    item=''.join(buf).strip()
    if item: out.append(item)
    return out

def extra(n,b,v,u): return {'nutrient':n,'basis':b,'value':v,'unit':u}
def ga(p,f,fi,m,extras): return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':None,'other_printed_guarantees':extras}

def row(upc,name,variant,size,ingredients,analysis,kkg,kcup,url,recipe,life='adult',conflicts=None):
    return {
      'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit',
      'brand':'Royal Canin','manufacturer':'Royal Canin USA, Inc.','species':'cat','product_line':'Veterinary Diet',
      'product_name':name,'variant':variant,'recipe':recipe,'life_stage':life,'food_form':'dry','texture':'kibble','presentation':'plain','package_type':'bag','size':size,
      'ingredients_verbatim':ingredients,'ingredients_ordered_normalized':top_level(ingredients),'guaranteed_analysis':analysis,
      'calorie_content':{'kcal_per_kg':kkg,'kcal_per_unit':kcup,'unit_name':'cup'},'label_deck_code':None,
      'formula_source':'Current Royal Canin USA veterinary product page supplies the current formula, complete Guaranteed Analysis, calories, adequacy/life-stage identity and marketed size; Royal Canin USA Veterinary Health Nutrition price list supplies the exact individual-bag UPC and unit size.',
      'source_urls':[url,PRICE],'source_accessed_at':DATE,
      'barcode_notes':'Royal Canin manufacturer price list prints the UPC without its standard leading zero; restoring that zero yields the stored 12-digit UPC-A. The same exact unit size remains listed on the current Royal Canin product page.',
      'conflicts':conflicts or [],
      'verification_notes':['UPC-A check digit independently validated.','Canonical GTIN-14 validated.','Royal Canin manufacturer price list proves UPC-to-individual-bag-size identity; no case, tray, or multipack code was substituted.','Current Royal Canin product page was used for the current formula generation and confirms the marketed size.'],
      'research_status':'source_verified'
    }

CALM_I='Chicken by-product meal, corn, brewers rice, corn gluten meal, wheat, wheat gluten, natural flavors, dried plain beet pulp, chicken fat, pea fiber, powdered cellulose, calcium sulfate, fish oil, salt, potassium chloride, DL-methionine, sodium pyrophosphate, vegetable oil, powdered psyllium seed husk, fructooligosaccharides, monocalcium phosphate, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, L-ascorbyl-2-polyphosphate (source of vitamin C), D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, vitamin B12 supplement, folic acid, vitamin D3 supplement], choline chloride, L-lysine, taurine, dried hydrolyzed casein, trace minerals [zinc proteinate, manganese proteinate, zinc oxide, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], L-tryptophan, GLA safflower oil, marigold extract (Tagetes erecta L.), L-carnitine, rosemary extract, preserved with mixed tocopherols and citric acid.'
CALM_G=ga(34,9,5.6,8,[extra('Tryptophan','min',0.27,'percent'),extra('Calcium','max',1.44,'percent'),extra('Phosphorus','max',1.4,'percent'),extra('Magnesium','max',0.14,'percent')])
CALM_U='https://www.royalcanin.com/us/cats/products/vet-products/calm-3955'

EARLY_I='Corn, brewers rice, wheat gluten, corn gluten meal, wheat, chicken by-product meal, pea fiber, chicken fat, natural flavors, fish oil, dried chicory root, vegetable oil, dried tomato pomace, calcium sulfate, sodium pyrophosphate, potassium chloride, powdered psyllium seed husk, calcium carbonate, DL-methionine, L-lysine, fructooligosaccharides, potassium citrate, New Zealand Green Mussel, salt, choline chloride, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], hydrolyzed yeast, L-tryptophan, lecithin, glucosamine hydrochloride, trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, manganese proteinate, manganous oxide, copper sulfate, calcium iodate, sodium selenite, copper proteinate], L-tyrosine, marigold extract (Tagetes erecta L.), chondroitin sulfate, L-carnitine, rosemary extract, preserved with mixed tocopherols and citric acid.'
EARLY_G=ga(26,12,6.4,8,[extra('Phosphorus','max',0.7,'percent'),extra('EPA + DHA','min',0.45,'percent'),extra('Vitamin E','min',420,'IU/kg'),extra('Ascorbic acid','min',240,'other'),extra('Glucosamine','min',727,'other'),extra('Chondroitin sulfate','min',76,'other')])
EARLY_U='https://www.royalcanin.com/us/cats/products/vet-products/early-renal-1242'

DENT_I='Chicken by-product meal, corn, brewers rice, corn gluten meal, brown rice, chicken fat, wheat gluten, pea fiber, powdered cellulose, dried plain beet pulp, natural flavors, calcium sulfate, sodium bisulfate, potassium chloride, fish oil, L-lysine, DL-methionine, vegetable oil, powdered psyllium seed husk, sodium silico aluminate, calcium carbonate, fructooligosaccharides, choline chloride, salt, sodium tripolyphosphate, sodium pyrophosphate, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), biotin, niacin supplement, pyridoxine hydrochloride (vitamin B6), D-calcium pantothenate, riboflavin supplement, vitamin A acetate, thiamine mononitrate (vitamin B1), folic acid, vitamin B12 supplement, vitamin D3 supplement], hydrolyzed yeast, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid.'
DENT_G=ga(27,13,7.2,10.5,[extra('Calcium','min',0.65,'percent'),extra('Phosphorus','min',0.46,'percent')])
DENT_U='https://www.royalcanin.com/us/cats/products/vet-products/dental-cat-dry-2971'

HP_I='brewers rice, hydrolyzed soy protein, chicken fat, powdered cellulose, natural flavors (ONLY FOR MEXICO: including poultry), dried plain beet pulp, calcium sulfate, fish oil, potassium chloride, vegetable oil, DL-methionine, monocalcium phosphate, sodium pyrophosphate, salt, sodium aluminosilicate, fructooligosaccharides, calcium carbonate, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, L-ascorbyl-2-polyphosphate (source of vitamin C), D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, vitamin B12 supplement, folic acid, vitamin D3 supplement], taurine, GLA safflower oil, marigold extract (Tagetes erecta L.), trace minerals [zinc proteinate, zinc oxide, manganese proteinate, manganous oxide, copper sulfate, ferrous sulfate, sodium selenite, copper proteinate, calcium iodate], magnesium oxide, rosemary extract, preserved with mixed tocopherols and citric acid.'
HP_G=ga(24.1,18,5.9,7.5,[extra('EPA + DHA','min',0.20,'percent'),extra('Omega-3 fatty acids','min',0.44,'percent')])
HP_U='https://www.royalcanin.com/us/cats/products/vet-products/hypoallergenic-3902'

UC_I='Chicken by-product meal, corn gluten meal, brewers rice, wheat, corn, pea fiber, natural flavors, dried chicory root, wheat gluten, fish oil, chicken fat, salt, calcium sulfate, sodium bisulfate, potassium chloride, sodium pyrophosphate, DL-methionine, vegetable oil, psyllium seed husk, monocalcium phosphate, fructooligosaccharides, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, folic acid, vitamin B12 supplement, vitamin D3 supplement], taurine, L-tryptophan, dried hydrolyzed casein, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, calcium iodate, sodium selenite, copper proteinate], L-carnitine, marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid.'
UC_G=ga(32,9,6.8,8,[extra('Tryptophan','min',0.31,'percent'),extra('Calcium','max',1.4,'percent'),extra('Phosphorus','max',1.3,'percent'),extra('Magnesium','max',0.08,'percent')])
UC_U='https://www.royalcanin.com/us/cats/products/vet-products/urinary-so-%2B-calm-6533'

UH_I='Brewers rice, hydrolyzed soy protein, chicken fat, powdered cellulose, natural flavors, vegetable oil, dried chicory root, salt, fish oil, calcium sulfate, potassium chloride, sodium pyrophosphate, monocalcium phosphate, sodium silico aluminate, sodium bisulfate, calcium carbonate, DL methionine, fructooligosaccharides, choline chloride, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, vitamin B12 supplement, folic acid], trace minerals [zinc proteinate, zinc oxide, manganese proteinate, manganous oxide, copper sulfate, ferrous sulfate, sodium selenite, copper proteinate, calcium iodate], marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid'
UH_G=ga(25,14,6.9,8,[extra('Calcium','max',0.9,'percent'),extra('Phosphorus','max',0.9,'percent'),extra('Magnesium','max',0.06,'percent')])
UH_U='https://www.royalcanin.com/us/cats/products/vet-products/urinary-so-%2B-hydrolyzed-protein-6530'

USAT_I='Chicken by-product meal, pea fiber, tapioca, wheat gluten, corn gluten meal, powdered cellulose, rice hulls, natural flavors, brewers rice, chicken fat, dried chicory root, salt, potassium chloride, calcium sulfate, sodium bisulfate, sodium pyrophosphate, fish oil, powdered psyllium seed husk, monocalcium phosphate, DL-methionine, choline chloride, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, calcium iodate, sodium selenite, copper proteinate], glucosamine hydrochloride, L-carnitine, chondroitin sulfate, rosemary extract, preserved with mixed tocopherols and citric acid.'
USAT_G=ga(32,8.6,15,8,[extra('Crude Fat','max',10,'percent'),extra('Calcium','max',1.65,'percent'),extra('Phosphorus','max',1.4,'percent'),extra('Magnesium','max',0.15,'percent'),extra('Glucosamine','min',370,'other'),extra('Chondroitin sulfate','min',4,'other')])
USAT_U='https://www.royalcanin.com/us/cats/products/vet-products/urinary-so-%2B-satiety-6532'

GIK_I='Chicken by-product meal, corn, chicken fat, wheat gluten, brewers rice flour, natural flavors, chicken meal, egg product, dried plain beet pulp, vegetable oil, potassium chloride, fish oil, pea fiber, sodium aluminosilicate, salt, sodium pyrophosphate, choline chloride, powdered psyllium seed husk, calcium carbonate, fructooligosaccharides, hydrolyzed yeast, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], marine microalgae oil, L-lysine, taurine, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], marigold extract (Tagetes erecta L.), DL-methionine, magnesium oxide, L-threonine, carotene, rosemary extract, preserved with mixed tocopherols and citric acid.'
GIK_G=ga(33,22,3.5,7.5,[extra('EPA + DHA','min',0.26,'percent'),extra('Potassium','min',0.62,'percent'),extra('Sodium','min',0.42,'percent'),extra('Vitamin E','min',385,'IU/kg'),extra('Ascorbic acid','min',248,'other')])
GIK_U='https://www.royalcanin.com/us/cats/products/vet-products/feline-gastrointestinal-kitten--1228'

candidates=[
 row('030111977649','Royal Canin Veterinary Diet Feline Calm Dry Cat Food','Calm 4.4 lb','4.4 lb',CALM_I,CALM_G,3448,331,CALM_U,['chicken']),
 row('030111477682','Royal Canin Veterinary Diet Feline Calm Dry Cat Food','Calm 8.8 lb','8.8 lb',CALM_I,CALM_G,3448,331,CALM_U,['chicken']),
 row('030111582911','Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food','Renal Support Early Consult 12 oz','12 oz',EARLY_I,EARLY_G,3647,299,EARLY_U,['chicken','fish']),
 row('030111582928','Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food','Renal Support Early Consult 4.4 lb','4.4 lb',EARLY_I,EARLY_G,3647,299,EARLY_U,['chicken','fish']),
 row('030111582935','Royal Canin Veterinary Diet Feline Renal Support Early Consult Dry Cat Food','Renal Support Early Consult 8.8 lb','8.8 lb',EARLY_I,EARLY_G,3647,299,EARLY_U,['chicken','fish']),
 row('030111930118','Royal Canin Veterinary Diet Feline Dental Dry Cat Food','Dental 1.3 lb','1.3 lb',DENT_I,DENT_G,3536,290,DENT_U,['chicken']),
 row('030111488831','Royal Canin Veterinary Diet Feline Dental Dry Cat Food','Dental 7.7 lb','7.7 lb',DENT_I,DENT_G,3536,290,DENT_U,['chicken']),
 row('030111927828','Royal Canin Veterinary Diet Feline Hydrolyzed Protein HP Dry Cat Food','Hydrolyzed Protein HP 12 oz','12 oz',HP_I,HP_G,3923,330,HP_U,['hydrolyzed soy']),
 row('030111584021','Royal Canin Veterinary Diet Feline Urinary SO + Calm Dry Cat Food','Urinary SO + Calm 12 oz','12 oz',UC_I,UC_G,3350,322,UC_U,['chicken']),
 row('030111583826','Royal Canin Veterinary Diet Feline Urinary SO + Hydrolyzed Protein Dry Cat Food','Urinary SO + Hydrolyzed Protein 12 oz','12 oz',UH_I,UH_G,3628,334,UH_U,['hydrolyzed soy']),
 row('030111583628','Royal Canin Veterinary Diet Feline Urinary SO + Satiety Dry Cat Food','Urinary SO + Satiety 12 oz','12 oz',USAT_I,USAT_G,2911,239,USAT_U,['chicken']),
 row('030111588012','Royal Canin Veterinary Diet Feline Gastrointestinal Kitten Dry Cat Food','Gastrointestinal Kitten 12 oz','12 oz',GIK_I,GIK_G,4130,475,GIK_U,['chicken','egg'],'kitten'),
]

def valid_upca(code):
    if len(code)!=12 or not code.isdigit(): return False
    d=list(map(int,code)); s=sum(x*(3 if i%2==0 else 1) for i,x in enumerate(d[:11])); return (10-s%10)%10==d[-1]

assert len(candidates)==12
assert len({r['upc'] for r in candidates})==12
for r in candidates:
    assert valid_upca(r['upc']), r['upc']
    assert r['canonical_gtin14']==r['upc'].zfill(14)
    assert r['ingredients_ordered_normalized'] and r['source_urls']

payload=json.loads(TARGET.read_text(encoding='utf-8'))
records=payload['records']; initial=len(records)
current_upcs={r['upc'] for r in records}; current_gtins={r['canonical_gtin14'] for r in records}
assert len(current_upcs)==len(records)

paths=[Path('data/known-products.ts'),Path('data/known-formulas.ts'),Path('data/wrong-barcodes.ts'),Path('docs/CATALOG-CONFLICTS.md')]
paths += [p for p in Path('research').glob('deep-research-*.json') if p != TARGET]
clean=[]; skipped=[]
for r in candidates:
    if r['upc'] in current_upcs or r['canonical_gtin14'] in current_gtins:
        skipped.append((r['upc'],'already in Royal Canin ledger')); continue
    collisions=[]
    for p in paths:
        if not p.exists(): continue
        text=p.read_text(encoding='utf-8',errors='replace')
        if r['upc'] in text or r['canonical_gtin14'] in text: collisions.append(str(p))
    if collisions:
        skipped.append((r['upc'],'collision: '+','.join(collisions))); continue
    clean.append(r)

assert len(clean)>=10, f'Only {len(clean)} clean new candidates; skipped={skipped}'
selected=clean[:10]
payload['records'].extend(selected); payload['updated_at']=DATE
all_upcs=[r['upc'] for r in payload['records']]; all_gtins=[r['canonical_gtin14'] for r in payload['records']]
assert len(all_upcs)==len(set(all_upcs)); assert len(all_gtins)==len(set(all_gtins))
assert len(payload['records'])==initial+10
TARGET.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
status={}
for r in payload['records']: status[r.get('research_status')]=status.get(r.get('research_status'),0)+1
print(f'Validated {len(paths)} mandatory exclusion files.')
print(f'Target before: {initial}; clean candidates: {len(clean)}; added: 10; target after: {len(payload["records"])}')
print('Added UPCs: '+', '.join(r['upc'] for r in selected))
print('Skipped candidates: '+json.dumps(skipped))
print('Status counts: '+json.dumps(status,sort_keys=True))
