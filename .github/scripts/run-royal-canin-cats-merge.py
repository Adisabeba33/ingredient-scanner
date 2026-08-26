import json
from pathlib import Path

TARGET = Path('research/deep-research-royal-canin.json')

def split_top(s):
    out=[]; buf=[]; depth=0
    for ch in s.strip().rstrip('.'):
        if ch=='[': depth+=1
        elif ch==']': depth=max(0,depth-1)
        if ch==',' and depth==0:
            item=''.join(buf).strip()
            if item: out.append(item)
            buf=[]
        else: buf.append(ch)
    item=''.join(buf).strip()
    if item: out.append(item)
    return out

def valid_upca(code):
    if len(code)!=12 or not code.isdigit(): return False
    d=list(map(int,code)); s=sum(x*(3 if i%2==0 else 1) for i,x in enumerate(d[:11]))
    return (10-s%10)%10==d[-1]

def ex(n,b,v,u): return {'nutrient':n,'basis':b,'value':v,'unit':u}
def ga(p,f,fi,m,extras):
    return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':None,'other_printed_guarantees':extras}

def make(upc,name,variant,size,ingredients,analysis,kkg,kcup,murl,burl,recipe,conflicts=None,note=None,formula_source=None,extra_urls=None):
    return {
        'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit',
        'brand':'Royal Canin','manufacturer':'Royal Canin USA, Inc.','species':'cat','product_line':'Veterinary Diet',
        'product_name':name,'variant':variant,'recipe':recipe,'life_stage':'adult','food_form':'dry','texture':'kibble',
        'presentation':'plain','package_type':'bag','size':size,'ingredients_verbatim':ingredients,
        'ingredients_ordered_normalized':split_top(ingredients),'guaranteed_analysis':analysis,
        'calorie_content':{'kcal_per_kg':kkg,'kcal_per_unit':kcup,'unit_name':'cup'},'label_deck_code':None,
        'formula_source':formula_source or 'Current Royal Canin USA veterinary product page supplies the current formula, Guaranteed Analysis, calories and marketed size; current PetCareRx option table supplies exact individual-bag UPC/size identity.',
        'source_urls':[murl,burl]+(extra_urls or []),'source_accessed_at':'2026-08-26',
        'barcode_notes':note or 'PetCareRx exact option table maps this UPC to one individual bag of the stated size.',
        'conflicts':conflicts or [],
        'verification_notes':['UPC-A check digit independently validated.','Canonical GTIN-14 validated.','Current manufacturer formula and exact individual-unit UPC/size were matched.'],
        'research_status':'source_verified'
    }

GIH_ING='Hydrolyzed soy protein, brewers rice flour, chicken fat, pea fiber, brewers rice, natural flavors, dried plain beet pulp, calcium sulfate, fish oil, potassium chloride, sodium aluminosilicate, DL-methionine, sodium bisulfate, sodium pyrophosphate, choline chloride, powdered psyllium seed husk, fructooligosaccharides, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, vitamin B12 supplement, folic acid, vitamin D3 supplement], calcium carbonate, monocalcium phosphate, taurine, hydrolyzed yeast, marigold extract (Tagetes erecta L.), trace minerals [zinc proteinate, zinc oxide, manganese proteinate, manganous oxide, copper sulfate, ferrous sulfate, sodium selenite, copper proteinate, calcium iodate], rosemary extract, preserved with mixed tocopherols and citric acid.'
GIH_GA=ga(29,18,6.7,7.5,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.24,'percent'),ex('Potassium','min',0.6,'percent'),ex('Sodium','min',0.42,'percent'),ex('Vitamin E','min',420,'IU/kg'),ex('Ascorbic acid','min',160,'mg/kg')])
GIH_M='https://www.royalcanin.com/us/cats/products/vet-products/gastrointestinal-hydrolysed-protein-2735'
GIH_B='https://www.petcarerx.com/royal-canin-veterinary-diet-adult-feline-multifunction-gastrointestinal-hydrolyzed-protein-dry-cat-food/38732'

HP_ING='Brewers rice, hydrolyzed soy protein, chicken fat, powdered cellulose, natural flavors, dried plain beet pulp, calcium sulfate, fish oil, potassium chloride, vegetable oil, DL-methionine, monocalcium phosphate, sodium pyrophosphate, salt, sodium aluminosilicate, fructooligosaccharides, calcium carbonate, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, L-ascorbyl-2-polyphosphate (source of vitamin C), D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, vitamin B12 supplement, folic acid, vitamin D3 supplement], taurine, GLA safflower oil, marigold extract (Tagetes erecta L.), trace minerals [zinc proteinate, zinc oxide, manganese proteinate, manganous oxide, copper sulfate, ferrous sulfate, sodium selenite, copper proteinate, calcium iodate], magnesium oxide, rosemary extract, preserved with mixed tocopherols and citric acid.'
HP_GA=ga(24.1,18,5.9,7.5,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.20,'percent'),ex('Omega-3 fatty acids','min',0.44,'percent')])
HP_M='https://www.royalcanin.com/us/cats/products/vet-products/hypoallergenic-3902'
HP_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-hydrolyzed-protein-adult-hp-dry-cat-food/24904'

GLY_ING='Chicken by-product meal, barley, wheat gluten, corn gluten meal, soy protein isolate, tapioca, powdered cellulose, chicken fat, natural flavors, dried chicory root, fish oil, psyllium seed husk, potassium chloride, sodium pyrophosphate, calcium sulfate, vegetable oil, fructooligosaccharides, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], potassium citrate, L-arginine, taurine, salt, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, calcium iodate, sodium selenite, copper proteinate], marigold extract (Tagetes erecta L.), L-carnitine, rosemary extract, preserved with mixed tocopherols and citric acid.'
GLY_GA=ga(44,10,6.7,8,[ex('Crude Fat','max',14,'percent'),ex('Dietary Starch','max',24,'percent'),ex('Sugars','max',5.4,'percent')])
GLY_M='https://www.royalcanin.com/us/es-us/cats/products/vet-products/glycobalance-3906'
GLY_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-glycobalance-dry-cat-food/24895'
GLY_PDF='https://catvets.com/wp-content/uploads/2025/09/Royal-Canin-Veterinary-Health-Nutrition-Product-Guide-April-2025-sml.pdf'

GI_ING='Chicken by-product meal, chicken fat, brown rice, brewers rice, corn protein meal, powdered cellulose, wheat gluten, natural flavors, egg product, dried plain beet pulp, potassium chloride, vegetable oil, sodium aluminosilicate, fish oil, sodium pyrophosphate, calcium sulfate, sodium bisulfate, monocalcium phosphate, powdered psyllium seed husk, salt, DL-methionine, fructooligosaccharides, choline chloride, marine microalgae oil, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], hydrolyzed yeast, taurine, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], magnesium oxide, marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid.'
GI_GA=ga(30,20,7.3,7.5,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.25,'percent'),ex('Potassium','min',0.6,'percent'),ex('Sodium','min',0.42,'percent'),ex('Vitamin E','min',350,'IU/kg'),ex('Ascorbic acid','min',160,'mg/kg')])
GI_M='https://www.royalcanin.com/us/cats/products/vet-products/gastrointestinal-3905'
GI_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-gastrointestinal-dry-cat-food/24899'

GIM_ING='Chicken by-product meal, brewers rice, brewers rice flour, wheat gluten, corn protein meal, powdered cellulose, natural flavors, egg product, chicken fat, vegetable oil, dried plain beet pulp, potassium chloride, calcium sulfate, sodium aluminosilicate, fish oil, sodium pyrophosphate, sodium bisulfate, powdered psyllium seed husk, monocalcium phosphate, fructooligosaccharides, DL-methionine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], marine microalgae oil, choline chloride, hydrolyzed yeast, taurine, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid.'
GIM_GA=ga(33,11,8,7.5,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.23,'percent'),ex('Potassium','min',0.56,'percent'),ex('Sodium','min',0.30,'percent'),ex('Vitamin E','min',350,'IU/kg'),ex('Ascorbic acid','min',160,'mg/kg')])
GIM_M='https://www.royalcanin.com/us/cats/products/vet-products/gastrointestinal-moderate-calorie-4008'
GIM_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-gastrointestinal-moderate-calorie-dry-cat-food/24900'

USO_ING='Chicken by-product meal, brewers rice, corn, corn gluten meal, chicken fat, wheat gluten, natural flavors, wheat, salt, powdered cellulose, fish oil, potassium chloride, sodium bisulfate, calcium sulfate, sodium pyrophosphate, vegetable oil, fructooligosaccharides, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], DL-methionine, taurine, monocalcium phosphate, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, calcium iodate, sodium selenite, copper proteinate], marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid.'
USO_GA=ga(32.5,13,4,8,[ex('Calcium','max',1.26,'percent'),ex('Phosphorus','max',1.26,'percent'),ex('Magnesium','max',0.1,'percent')])
USO_M='https://www.royalcanin.com/us/cats/products/vet-products/feline-urinary-so-3901'
USO_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-urinary-so-dry-cat-food/24921'

ULT_ING='Corn starch, hydrolyzed poultry by-products aggregate, coconut oil, vegetable oil, powdered cellulose, dried chicory root, natural flavors, calcium sulfate, fish oil, sodium aluminosilicate, potassium chloride, fructooligosaccharides, sodium pyrophosphate, monocalcium phosphate, choline chloride, DL-methionine, L-lysine, L-tyrosine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, vitamin B12 supplement, D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, folic acid, vitamin D3 supplement], taurine, L-tryptophan, L-alanine, histidine, salt, trace minerals [zinc proteinate, ferrous sulfate, zinc oxide, manganese proteinate, manganous oxide, copper sulfate, sodium selenite, copper proteinate], marigold extract (Tagetes erecta L.), rosemary extract, preserved with mixed tocopherols and citric acid, glycine, magnesium oxide, potassium iodate.'
ULT_GA=ga(22.6,15,5.7,7.5,[])
ULT_M='https://www.royalcanin.com/us/cats/products/vet-products/ultamino-1950'
ULT_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-ultamino-dry-cat-food/34440'

rows=[
 make('030111440716','Royal Canin Veterinary Diet Feline Gastrointestinal Hydrolyzed Protein Dry Cat Food','Gastrointestinal Hydrolyzed Protein 6.6 lb','6.6 lb',GIH_ING,GIH_GA,3870,348,GIH_M,GIH_B,['hydrolyzed soy'],note='PetCareRx exposes zero-suppressed UPC/SKU 30111440716 for the individual 6.6 lb bag; restoring the standard leading zero gives valid UPC-A 030111440716.'),
 make('030111441812','Royal Canin Veterinary Diet Feline Gastrointestinal Hydrolyzed Protein Dry Cat Food','Gastrointestinal Hydrolyzed Protein 17.6 lb','17.6 lb',GIH_ING,GIH_GA,3870,348,GIH_M,GIH_B,['hydrolyzed soy'],note='PetCareRx exposes zero-suppressed UPC/SKU 30111441812 for the individual 17.6 lb bag; restoring the standard leading zero gives valid UPC-A 030111441812.'),
 make('030111427878','Royal Canin Veterinary Diet Feline Hydrolyzed Protein HP Dry Cat Food','Hydrolyzed Protein HP 7.7 lb','7.7 lb',HP_ING,HP_GA,3923,330,HP_M,HP_B,['hydrolyzed soy']),
 make('030111427816','Royal Canin Veterinary Diet Feline Hydrolyzed Protein HP Dry Cat Food','Hydrolyzed Protein HP 17.6 lb','17.6 lb',HP_ING,HP_GA,3923,330,HP_M,HP_B,['hydrolyzed soy']),
 make('030111488848','Royal Canin Veterinary Diet Feline Glycobalance Dry Cat Food','Glycobalance 4.4 lb','4.4 lb',GLY_ING,GLY_GA,3519,320,GLY_M,GLY_B,['chicken','soy','fish'],formula_source="Current Royal Canin USA page confirms the current 4.4 lb formula generation, Guaranteed Analysis and calories; Royal Canin's April 2025 Veterinary Health Nutrition Product Guide provides the English ingredient deck, and PetCareRx supplies the exact individual-bag UPC/size identity.",extra_urls=[GLY_PDF]),
 make('030111484086','Royal Canin Veterinary Diet Feline Gastrointestinal Dry Cat Food','Gastrointestinal 8.8 lb','8.8 lb',GI_ING,GI_GA,3886,439,GI_M,GI_B,['chicken','egg','fish'],conflicts=['PetCareRx still exposes an older calorie generation (3904 kcal/kg; 441 kcal/cup). Current Royal Canin USA lists 3886 kcal/kg and 439 kcal/cup; manufacturer values are stored.']),
 make('030111484185','Royal Canin Veterinary Diet Feline Gastrointestinal Moderate Calorie Dry Cat Food','Gastrointestinal Moderate Calorie 7.7 lb','7.7 lb',GIM_ING,GIM_GA,3436,313,GIM_M,GIM_B,['chicken','egg','fish']),
 make('030111470775','Royal Canin Veterinary Diet Feline Urinary SO Dry Cat Food','Urinary SO 7.7 lb','7.7 lb',USO_ING,USO_GA,3659,315,USO_M,USO_B,['chicken','fish']),
 make('030111470188','Royal Canin Veterinary Diet Feline Urinary SO Dry Cat Food','Urinary SO 17.6 lb','17.6 lb',USO_ING,USO_GA,3659,315,USO_M,USO_B,['chicken','fish']),
 make('030111584458','Royal Canin Veterinary Diet Feline Ultamino Dry Cat Food','Ultamino 5.5 lb','5.5 lb',ULT_ING,ULT_GA,3762,335,ULT_M,ULT_B,['hydrolyzed poultry'])
]

assert len(rows)==10 and len({r['upc'] for r in rows})==10
required=['upc','canonical_gtin14','barcode_scope','brand','species','product_name','size','ingredients_verbatim','ingredients_ordered_normalized','guaranteed_analysis','calorie_content','source_urls','research_status']
for r in rows:
    assert all(k in r for k in required)
    assert r['brand']=='Royal Canin' and r['species']=='cat' and r['barcode_scope']=='individual_unit'
    assert valid_upca(r['upc']),r['upc']
    assert r['canonical_gtin14']==r['upc'].zfill(14)
    assert split_top(r['ingredients_verbatim'])==r['ingredients_ordered_normalized']

target=json.loads(TARGET.read_text(encoding='utf-8'))
existing=target['records']; initial=len(existing)
existing_upcs=[r['upc'] for r in existing]
assert len(existing_upcs)==len(set(existing_upcs))
rows_to_add=[r for r in rows if r['upc'] not in set(existing_upcs)]

paths=[Path('data/known-products.ts'),Path('data/known-formulas.ts'),Path('data/wrong-barcodes.ts'),Path('docs/CATALOG-CONFLICTS.md')]
paths += [p for p in Path('research').glob('deep-research-*.json') if p != TARGET]
hits={}
for p in paths:
    if not p.exists(): continue
    text=p.read_text(encoding='utf-8',errors='replace')
    for r in rows_to_add:
        if r['upc'] in text or r['canonical_gtin14'] in text:
            hits.setdefault(r['upc'],[]).append(str(p))
assert not hits,hits

target['records'].extend(rows_to_add); target['updated_at']='2026-08-26'
final=[r['upc'] for r in target['records']]
assert len(final)==len(set(final))
TARGET.write_text(json.dumps(target,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
status_counts={}
for r in target['records']: status_counts[r.get('research_status')]=status_counts.get(r.get('research_status'),0)+1
print(f'Validated {len(paths)} mandatory exclusion files.')
print(f'Target before: {initial}; requested batch: {len(rows)}; added: {len(rows_to_add)}; target after: {len(final)}')
print('Added UPCs: '+(', '.join(r['upc'] for r in rows_to_add) if rows_to_add else 'none'))
print('Status counts: '+json.dumps(status_counts,sort_keys=True))
