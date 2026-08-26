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
def ga(p,f,fi,m,extras):
    return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':None,'other_printed_guarantees':extras}

def make(upc,name,variant,size,texture,presentation,ingredients,analysis,kkg,kcan,murl,burl,recipe,conflicts=None):
    return {
      'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit',
      'brand':'Royal Canin','manufacturer':'Royal Canin Canada','species':'cat','product_line':'Feline Care Nutrition',
      'product_name':name,'variant':variant,'recipe':recipe,'life_stage':'adult','food_form':'wet','texture':texture,
      'presentation':presentation,'package_type':'can','size':size,'ingredients_verbatim':ingredients,
      'ingredients_ordered_normalized':split_top(ingredients),'guaranteed_analysis':analysis,
      'calorie_content':{'kcal_per_kg':kkg,'kcal_per_unit':kcan,'unit_name':'can'},'label_deck_code':None,
      'formula_source':'Current Royal Canin Canada product page supplies the current formula, Guaranteed Analysis, calories, nutritional adequacy and marketed unit size; current Canadian exact-unit retailer page supplies the individual-can UPC/size identity.',
      'source_urls':[murl,burl],'source_accessed_at':'2026-08-26',
      'barcode_notes':'Current Canadian retailer exposes this barcode on the exact individual can/weight variant; UPC-A check digit and canonical GTIN-14 were independently validated.',
      'conflicts':conflicts or [],
      'verification_notes':['UPC-A check digit independently validated.','Canonical GTIN-14 validated.','Current Royal Canin Canada formula and exact individual-unit UPC/size were matched.','Barcode is not a case, tray, boxset, or multipack code.'],
      'research_status':'source_verified'
    }

APP_T_ING='Water sufficient for processing, pork liver, chicken, pork by-products, brewers rice flour, chicken by-products, chicken liver, pork plasma, wheat gluten, powdered cellulose, modified corn starch, glycine, potassium chloride, calcium carbonate, sodium tripolyphosphate, calcium sulfate, guar gum, natural flavors, taurine, choline chloride, vitamins [DL-alpha tocopherol acetate (source of vitamin E), thiamine mononitrate (vitamin B1), niacin supplement, biotin, D-calcium pantothenate, riboflavin supplement, pyridoxine hydrochloride (vitamin B6), vitamin B12 supplement, folic acid, vitamin D3 supplement], sodium carbonate, L-carnitine, trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, copper sulfate, manganous oxide, sodium selenite, calcium iodate].'
APP_T_GA=ga(6.2,1.4,2.8,84.5,[ex('Crude Fat','max',4.4,'percent'),ex('L-Carnitine','min',25,'mg/kg')])

APP_L_ING='Water sufficient for processing, pork by-products, pork liver, chicken, chicken liver, brewers rice flour, wheat gluten, hydrolyzed chicken liver, pork plasma, powdered cellulose, calcium sulfate, carrageenan, guar gum, potassium chloride, calcium carbonate, natural flavors, carob bean gum, sodium tripolyphosphate, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), thiamine mononitrate (vitamin B1), niacin supplement, biotin, D-calcium pantothenate, riboflavin supplement, pyridoxine hydrochloride (vitamin B6), vitamin B12 supplement, folic acid, vitamin D3 supplement], choline chloride, glycine, sodium carbonate, L-carnitine, trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, copper sulfate, manganous oxide, sodium selenite, calcium iodate].'
APP_L_GA=ga(7.3,1.4,2.6,84.5,[ex('Crude Fat','max',4.9,'percent'),ex('L-Carnitine','min',25,'mg/kg')])

DIG_ING='Water sufficient for processing, pork by-products, chicken, chicken liver, salmon, wheat flour, pork plasma, modified corn starch, powdered cellulose, glycine, gelatin, wheat gluten, natural flavors, vegetable oil, sodium aluminosilicate, potassium chloride, carob bean gum, calcium sulfate, rice flour, taurine, choline chloride, sodium tripolyphosphate, vitamins [DL-alpha tocopherol acetate (source of vitamin E), thiamine mononitrate (vitamin B1), niacin supplement, biotin, D-calcium pantothenate, riboflavin supplement, pyridoxine hydrochloride (vitamin B6), vitamin B12 supplement, folic acid, vitamin D3 supplement], trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, copper sulfate, manganous oxide, sodium selenite, calcium iodate].'
DIG_GA=ga(7.2,1.6,2.5,82.5,[])

HS_ING='Water sufficient for processing, chicken, pork by-products, chicken liver, pork liver, wheat gluten, wheat flour, pork plasma, gelatin, vegetable oil, powdered cellulose, glycine, fish oil, modified corn starch, calcium sulfate, natural flavors, rice flour, potassium chloride, guar gum, sodium tripolyphosphate, choline chloride, taurine, citric acid, vitamins [niacin supplement, DL-alpha tocopherol acetate (source of vitamin E), thiamine mononitrate (vitamin B1), D-calcium pantothenate, biotin, riboflavin supplement, pyridoxine hydrochloride (vitamin B6), vitamin B12 supplement, folic acid, vitamin D3 supplement], carrageenan, magnesium oxide, trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, copper sulfate, manganous oxide, sodium selenite, calcium iodate].'
HS_GA=ga(10.0,2.2,2.7,80.0,[])

UR_ING='Water sufficient for processing, pork by-products, chicken by-products, pork liver, chicken, wheat flour, wheat gluten, modified corn starch, powdered cellulose, pork plasma, natural flavors, calcium sulfate, potassium chloride, carob bean gum, taurine, vitamins [DL-alpha tocopherol acetate (source of vitamin E), L-ascorbyl-2-polyphosphate (source of vitamin C), thiamine mononitrate (vitamin B1), niacin supplement, biotin, D-calcium pantothenate, pyridoxine hydrochloride (vitamin B6), riboflavin supplement, folic acid, vitamin B12 supplement, vitamin D3 supplement], sodium tripolyphosphate, choline chloride, salt, sodium carbonate, marigold extract (Tagetes erecta L.), trace minerals [zinc proteinate, zinc oxide, ferrous sulfate, copper sulfate, manganous oxide, sodium selenite, calcium iodate].'
UR_GA=ga(7.7,1.7,1.4,84.0,[])

rows=[
 make('030111735539','Royal Canin Feline Care Nutrition Appetite Control Care Thin Slices in Gravy Canned Cat Food','Appetite Control Care Thin Slices in Gravy','3 oz / 85 g','slices','in_gravy',APP_T_ING,APP_T_GA,652,55,'https://www.royalcanin.com/ca/cats/products/retail-products/appetite-control-care-thin-slices-in-gravy-1469','https://shop.petfinity.ca/206650/product/787381/30242517-Royal_Canin_Feline_Care_Nutrition_Appetite_Control_Care_Spayed_Neutered_Thin_Slices_in_Gravy_Wet_Cat_Food_85g',['pork','chicken']),
 make('030111700919','Royal Canin Feline Care Nutrition Appetite Control Care Loaf in Sauce Canned Cat Food','Appetite Control Care Loaf in Sauce','5.1 oz / 145 g','loaf','in_sauce',APP_L_ING,APP_L_GA,670,97,'https://www.royalcanin.com/ca/cats/products/retail-products/appetite-control-care-loaf-in-sauce-2569','https://www.domaineanimal.com/royal-canin-pate-controle-de-lappetit-145g.html',['pork','chicken']),
 make('030111715531','Royal Canin Feline Care Nutrition Digestive Care Thin Slices in Gravy Canned Cat Food','Digestive Care Thin Slices in Gravy','3 oz / 85 g','slices','in_gravy',DIG_ING,DIG_GA,789,67,'https://www.royalcanin.com/ca/cats/products/retail-products/digestive-care-thin-slices-in-gravy-1430/1','https://www.buckerfields.ca/product/royal-canin-fcn-digestive-care-thin-slices-in-gravy-cat-food-85g',['pork','chicken','salmon']),
 make('030111715289','Royal Canin Feline Care Nutrition Hair & Skin Care Thin Slices in Gravy Canned Cat Food','Hair & Skin Care Thin Slices in Gravy','3 oz / 85 g','slices','in_gravy',HS_ING,HS_GA,900,77,'https://www.royalcanin.com/ca/cats/products/retail-products/hair%26skin-care-thin-slices-in-gravy-1475','https://www.buckerfields.ca/product/royal-canin-fhn-hair-skin-care-thin-slices-in-gravy-cat-food-85g',['chicken','pork','fish']),
 make('030111716651','Royal Canin Feline Care Nutrition Urinary Care Thin Slices in Gravy Canned Cat Food','Urinary Care Thin Slices in Gravy','3 oz / 85 g','slices','in_gravy',UR_ING,UR_GA,714,61,'https://www.royalcanin.com/ca/cats/products/retail-products/urinary-care--thin-slices-in-gravy-1588','https://animoetc.com/en/products/royal-canin-chats-nourriture-humide-conserve-soin-urinaire-2',['pork','chicken'])
]

assert len(rows)==5 and len({r['upc'] for r in rows})==5
for r in rows:
    assert valid_upca(r['upc']),r['upc']
    assert r['canonical_gtin14']==r['upc'].zfill(14)
    assert split_top(r['ingredients_verbatim'])==r['ingredients_ordered_normalized']
    assert r['brand']=='Royal Canin' and r['species']=='cat' and r['barcode_scope']=='individual_unit'
    assert r['texture'] in {'slices','loaf'} and r['presentation'] in {'in_gravy','in_sauce'}

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
print(f'Target before: {initial}; requested final replacement batch: {len(rows)}; added: {len(rows_to_add)}; target after: {len(final)}')
print('Added UPCs: '+(', '.join(r['upc'] for r in rows_to_add) if rows_to_add else 'none'))
print('Status counts: '+json.dumps(status_counts,sort_keys=True))
