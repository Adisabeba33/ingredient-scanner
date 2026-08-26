import json
from pathlib import Path

TARGET=Path('research/deep-research-royal-canin.json')

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
def ga(p,f,fi,m,extras,taurine=None):
    return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':taurine,'other_printed_guarantees':extras}

def make(upc,line,name,variant,size,ingredients,analysis,kkg,kcup,murl,burl,recipe,life='adult',manufacturer='Royal Canin USA, Inc.',conflicts=None,note=None,extra_urls=None,formula_source=None):
    return {
      'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit',
      'brand':'Royal Canin','manufacturer':manufacturer,'species':'cat','product_line':line,'product_name':name,'variant':variant,
      'recipe':recipe,'life_stage':life,'food_form':'dry','texture':'kibble','presentation':'plain','package_type':'bag','size':size,
      'ingredients_verbatim':ingredients,'ingredients_ordered_normalized':split_top(ingredients),'guaranteed_analysis':analysis,
      'calorie_content':{'kcal_per_kg':kkg,'kcal_per_unit':kcup,'unit_name':'cup'},'label_deck_code':None,
      'formula_source':formula_source or 'Current Royal Canin product page supplies current formula, Guaranteed Analysis, calories and marketed size; exact-unit retailer page supplies the individual-bag UPC/size identity.',
      'source_urls':[murl,burl]+(extra_urls or []),'source_accessed_at':'2026-08-26','barcode_notes':note or 'Exact-unit retailer option maps this UPC to one individual bag of the stated size.',
      'conflicts':conflicts or [],'verification_notes':['UPC-A check digit independently validated.','Canonical GTIN-14 validated.','Current manufacturer formula and exact individual-unit UPC/size were matched.'],
      'research_status':'source_verified'
    }

GIK_ING='Chicken by-product meal, corn, chicken fat, wheat gluten, brewers rice flour, natural flavors, chicken meal, egg product, dried plain beet pulp, vegetable oil, potassium chloride, fish oil, pea fiber, sodium aluminosilicate, salt, sodium pyrophosphate, choline chloride, powdered psyllium seed husk, calcium carbonate, fructooligosaccharides, hydrolyzed yeast, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], marine microalgae oil, L-lysine, taurine, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], marigold extract (Tagetes erecta L.), DL-methionine, magnesium oxide, L-threonine, carotene, rosemary extract, preserved with mixed tocopherols and citric acid.'
GIK_GA=ga(33,22,3.5,7.5,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.26,'percent'),ex('Potassium','min',0.62,'percent'),ex('Sodium','min',0.42,'percent'),ex('Vitamin E','min',385,'IU/kg'),ex('Ascorbic acid','min',248,'mg/kg')])
GIK_M='https://www.royalcanin.com/us/cats/products/vet-products/feline-gastrointestinal-kitten--1228'
GIK_B='https://www.petcarerx.com/royal-canin-feline-gastrointestinal-kitten-dry-cat-food/37474'

PD_ING='Peas, duck by product meal, pea protein, coconut oil, natural flavors, hydrolyzed soy protein, vegetable oil, calcium sulfate, sodium bisulfate, DL-methionine, fish oil, sodium pyrophosphate, choline chloride, salt, monocalcium phosphate, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, L-ascorbyl-2-polyphosphate (source of vitamin C), D-calcium pantothenate, biotin, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, thiamine mononitrate (vitamin B1), vitamin A acetate, folic acid, vitamin B12 supplement, vitamin D3 supplement], taurine, calcium carbonate, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], rosemary extract, preserved with mixed tocopherols and citric acid.'
PD_GA=ga(30,11,5.8,8,[ex('Eicosapentaenoic + Docosahexaenoic acid (EPA + DHA)','min',0.12,'percent'),ex('Omega-3 Fatty Acids','min',0.3,'percent')])
PD_M='https://www.royalcanin.com/us/cats/products/vet-products/selected-protein-pd-1280'
PD_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-selected-protein-adult-pd-dry-cat-food/24903'

UMC_ING='Chicken by-product meal, brewers rice, corn, pea fiber, wheat gluten, corn protein meal, natural flavors, chicken fat, salt, fish oil, potassium chloride, sodium bisulfate, calcium sulfate, egg product, vegetable oil, sodium pyrophosphate, DL-methionine, fructooligosaccharides, choline chloride, monosodium phosphate, rosemary extract, preserved with mixed tocopherols and citric acid, vitamins [DL-alpha tocopherol acetate (source of vitamin E), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], taurine, trace minerals [zinc proteinate, zinc oxide, manganese proteinate, ferrous sulfate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], L-carnitine, marigold extract (Tagetes erecta L.).'
UMC_GA=ga(32,9,8,7.5,[ex('Crude Fat','max',13,'percent'),ex('Calcium','max',1.3,'percent'),ex('Phosphorus','max',1.2,'percent'),ex('Magnesium','max',0.1,'percent')])
UMC_M='https://www.royalcanin.com/us/cats/products/vet-products/feline-urinary-so-moderate-calorie-3954'
UMC_B='https://www.petcarerx.com/royal-canin-veterinary-diet-feline-urinary-so-moderate-calorie-dry-cat-food/24922'

APP_ING='Chicken meal, pea fiber, corn, wheat gluten, wheat, corn gluten meal, natural flavors, brewers rice, chicken fat, dried plain beet pulp, vegetable oil, sodium aluminosilicate, sodium pyrophosphate, fish oil, calcium sulfate, choline chloride, potassium chloride, powdered psyllium seed husk, salt, rice flour, fructooligosaccharides, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), niacin supplement, biotin, riboflavin supplement, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), vitamin A acetate, thiamine mononitrate (vitamin B1), vitamin B12 supplement, folic acid, vitamin D3 supplement], taurine, DL-methionine, monosodium phosphate, trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, manganese proteinate, manganous oxide, copper sulfate, sodium selenite, calcium iodate, copper proteinate], L-carnitine, rosemary extract, preserved with mixed tocopherols and citric acid.'
APP_GA=ga(32,10,10.8,7.5,[ex('Crude Fat','max',14,'percent'),ex('L-carnitine','min',140,'mg/kg')])
APP_M='https://www.royalcanin.com/ca/cats/products/retail-products/appetite-control-care-2563'
APP_B='https://www.petscience.ca/royal-canin-feline-care-nutrition-appetite-control-care-adult-cat-3lbs-121-55303'
APP_B2='https://www.pattesgriffes.com/products/royal-canin-chat-soin-controle-de-lappetit-nourriture-seche-pour-chats'

rows=[
 make('030111588005','Veterinary Diet','Royal Canin Veterinary Diet Feline Gastrointestinal Kitten Dry Cat Food','Gastrointestinal Kitten 4.4 lb','4.4 lb',GIK_ING,GIK_GA,4130,475,GIK_M,GIK_B,['chicken','egg','fish'],life='kitten'),
 make('030111588029','Veterinary Diet','Royal Canin Veterinary Diet Feline Gastrointestinal Kitten Dry Cat Food','Gastrointestinal Kitten 7.7 lb','7.7 lb',GIK_ING,GIK_GA,4130,475,GIK_M,GIK_B,['chicken','egg','fish'],life='kitten'),
 make('030111762085','Veterinary Diet','Royal Canin Veterinary Diet Feline Selected Protein PD Dry Cat Food','Selected Protein PD 8.8 lb','8.8 lb',PD_ING,PD_GA,3531,332,PD_M,PD_B,['duck','pea','hydrolyzed soy']),
 make('030111762016','Veterinary Diet','Royal Canin Veterinary Diet Feline Selected Protein PD Dry Cat Food','Selected Protein PD 17.6 lb','17.6 lb',PD_ING,PD_GA,3531,332,PD_M,PD_B,['duck','pea','hydrolyzed soy']),
 make('030111484338','Veterinary Diet','Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food','Urinary SO Moderate Calorie 3.3 lb','3.3 lb',UMC_ING,UMC_GA,3319,299,UMC_M,UMC_B,['chicken','egg','fish'],conflicts=['PetCareRx currently exposes an older formula/calorie generation (3277 kcal/kg; 275 kcal/cup). Current Royal Canin USA product page is stored as authoritative.']),
 make('030111484369','Veterinary Diet','Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food','Urinary SO Moderate Calorie 6.6 lb','6.6 lb',UMC_ING,UMC_GA,3319,299,UMC_M,UMC_B,['chicken','egg','fish'],conflicts=['PetCareRx currently exposes an older formula/calorie generation (3277 kcal/kg; 275 kcal/cup). Current Royal Canin USA product page is stored as authoritative.']),
 make('030111484376','Veterinary Diet','Royal Canin Veterinary Diet Feline Urinary SO Moderate Calorie Dry Cat Food','Urinary SO Moderate Calorie 17.6 lb','17.6 lb',UMC_ING,UMC_GA,3319,299,UMC_M,UMC_B,['chicken','egg','fish'],conflicts=['PetCareRx currently exposes an older formula/calorie generation (3277 kcal/kg; 275 kcal/cup). Current Royal Canin USA product page is stored as authoritative.']),
 make('030111553034','Feline Care Nutrition','Royal Canin Feline Care Nutrition Appetite Control Care Dry Cat Food','Appetite Control Care 3 lb','3 lb',APP_ING,APP_GA,3302,284,APP_M,APP_B,['chicken','fish'],manufacturer='Royal Canin Canada',extra_urls=[APP_B2],formula_source='Current Royal Canin Canada page proves the active 3 lb size and current formula, Guaranteed Analysis and calories; two current Canadian retailers independently map UPC 030111553034 to the individual 3 lb / 1.4 kg bag.')
]

assert len(rows)==8 and len({r['upc'] for r in rows})==8
for r in rows:
    assert valid_upca(r['upc']),r['upc']
    assert r['canonical_gtin14']==r['upc'].zfill(14)
    assert split_top(r['ingredients_verbatim'])==r['ingredients_ordered_normalized']
    assert r['brand']=='Royal Canin' and r['species']=='cat' and r['barcode_scope']=='individual_unit'

target=json.loads(TARGET.read_text(encoding='utf-8')); existing=target['records']; initial=len(existing)
existing_upcs=[r['upc'] for r in existing]; assert len(existing_upcs)==len(set(existing_upcs))
rows_to_add=[r for r in rows if r['upc'] not in set(existing_upcs)]
paths=[Path('data/known-products.ts'),Path('data/known-formulas.ts'),Path('data/wrong-barcodes.ts'),Path('docs/CATALOG-CONFLICTS.md')]
paths += [p for p in Path('research').glob('deep-research-*.json') if p != TARGET]
hits={}
for p in paths:
    if not p.exists(): continue
    text=p.read_text(encoding='utf-8',errors='replace')
    for r in rows_to_add:
        if r['upc'] in text or r['canonical_gtin14'] in text: hits.setdefault(r['upc'],[]).append(str(p))
assert not hits,hits

target['records'].extend(rows_to_add); target['updated_at']='2026-08-26'
final=[r['upc'] for r in target['records']]; assert len(final)==len(set(final))
TARGET.write_text(json.dumps(target,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
status_counts={}
for r in target['records']: status_counts[r.get('research_status')]=status_counts.get(r.get('research_status'),0)+1
print(f'Validated {len(paths)} mandatory exclusion files.')
print(f'Target before: {initial}; requested replacement batch: {len(rows)}; added: {len(rows_to_add)}; target after: {len(final)}')
print('Added UPCs: '+(', '.join(r['upc'] for r in rows_to_add) if rows_to_add else 'none'))
print('Status counts: '+json.dumps(status_counts,sort_keys=True))
