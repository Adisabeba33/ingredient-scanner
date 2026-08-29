import json,copy
from pathlib import Path
ROOT=Path('.'); LED=ROOT/'research/deep-research-i-and-love-and-you.json'; TODAY='2026-08-29'
data=json.loads(LED.read_text()); assert len(data['records'])==180,len(data['records']); by={r['upc']:r for r in data['records']}
ex=''
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
    if p!=LED and p.exists(): ex += p.read_text(errors='ignore')+'\n'
def ok(s):
    ds=list(map(int,s)); total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(ds[:-1]))); return (10-total%10)%10==ds[-1]
def base_record(outer,name,variant,line,texture,url):
    return {'catalog_number':None,'upc':outer,'canonical_gtin14':outer.zfill(14),'barcode_scope':'multipack','multipack_contents':[],'brand':'I and love and you','manufacturer':'I and love and you','species':'cat','product_line':line,'product_name':name,'variant':variant,'recipe':[],'life_stage':'all','food_form':'wet','texture':texture,'presentation':'plain','package_type':'box','size':variant,'ingredients_verbatim':'','ingredients_ordered_normalized':[],'guaranteed_analysis':{'crude_protein_min_percent':None,'crude_fat_min_percent':None,'crude_fiber_max_percent':None,'moisture_max_percent':None,'ash_max_percent':None,'taurine_min_percent':None,'other_printed_guarantees':[]},'calorie_content':{'kcal_per_kg':None,'kcal_per_unit':None,'unit_name':'can'},'label_deck_code':None,'formula_source':'Current manufacturer product page for exact variety pack; current manufacturer Shopify .js for exact outer barcode/variant.','source_urls':[url,url+'.js'],'source_accessed_at':TODAY,'barcode_notes':f'Current manufacturer Shopify .js maps outer barcode {outer} exactly to {variant}. Outer barcode is not asserted as any child-can barcode.','conflicts':[],'verification_notes':[f'2026-08-29: outer barcode {outer} check digit validated and exact current variant confirmed from manufacturer Shopify .js.'],'research_status':'source_verified'}
def child(r,qty,url):
    return {'upc':None,'canonical_gtin14':None,'standalone_upc':r['upc'],'product_name':r['product_name'],'size':r['size'],'quantity':qty,'evidence_status':'matched_standalone_sku','source_urls':[url]+list(r.get('source_urls') or [])}
new=[]
# XOXOs Chicken & Tuna Stew Variety Pack 12-pack: manufacturer page explicitly says 6 + 6.
u='https://iandloveandyou.com/products/xoxo-chicken-tuna-stew-variety-pack'
r=base_record('818336013553','XOXOs Chicken & Tuna Stew Variety Pack','3 OZ (12 PACK)','XOXOs','stew',u)
ct='CHICKEN BROTH, CHICKEN, DRIED EGG PRODUCT, TUNA, TAPIOCA STARCH, TRICALCIUM PHOSPHATE, SALT, GUAR GUM, MINERALS (ZINC OXIDE, REDUCED IRON, SODIUM SELENITE, MANGANESE SULFATE, COPPER AMINO ACID COMPLEX, POTASSIUM IODIDE), POTASSIUM CHLORIDE, MAGNESIUM SULFATE, TAURINE, VITAMINS (VITAMIN E SUPPLEMENT, NIACIN SUPPLEMENT, THIAMINE MONONITRATE, VITAMIN A SUPPLEMENT, VITAMIN B12 SUPPLEMENT, PYRIDOXINE HYDROCHLORIDE, D-CALCIUM PANTOTHENATE, RIBOFLAVIN SUPPLEMENT, BIOTIN, VITAMIN D3 SUPPLEMENT, FOLIC ACID, MENADIONE SODIUM BISULFITE COMPLEX (SOURCE OF VITAMIN K ACTIVITY)), CHOLINE CHLORIDE.'
te='FISH BROTH, TUNA, DRIED EGG PRODUCT, TAPIOCA STARCH, SUNFLOWER OIL, TRICALCIUM PHOSPHATE, SALT, GUAR GUM, MINERALS (ZINC OXIDE, REDUCED IRON, SODIUM SELENITE, MANGANESE SULFATE, COPPER AMINO ACID COMPLEX, POTASSIUM IODIDE), POTASSIUM CHLORIDE, MAGNESIUM SULFATE, TAURINE, VITAMINS (VITAMIN E SUPPLEMENT, NIACIN SUPPLEMENT, THIAMINE MONONITRATE, VITAMIN A SUPPLEMENT, VITAMIN B12 SUPPLEMENT, PYRIDOXINE HYDROCHLORIDE, D-CALCIUM PANTOTHENATE, RIBOFLAVIN SUPPLEMENT, BIOTIN, VITAMIN D3 SUPPLEMENT, FOLIC ACID, MENADIONE SODIUM BISULFITE COMPLEX (SOURCE OF VITAMIN K ACTIVITY)), CHOLINE CHLORIDE.'
r['ingredients_verbatim']='Chicken and Tuna Stew: '+ct+' Tuna and Egg Stew: '+te
r['ingredients_ordered_normalized']=['Chicken and Tuna Stew: '+ct,'Tuna and Egg Stew: '+te]
r['guaranteed_analysis']={'crude_protein_min_percent':7.5,'crude_fat_min_percent':None,'crude_fiber_max_percent':1.5,'moisture_max_percent':82.0,'ash_max_percent':None,'taurine_min_percent':0.07,'other_printed_guarantees':[{'nutrient':'Chicken and Tuna Stew crude fat','basis':'min','value':3.0,'unit':'percent'},{'nutrient':'Tuna and Egg Stew crude fat','basis':'min','value':2.5,'unit':'percent'}]}
r['calorie_content']={'kcal_per_kg':1046,'kcal_per_unit':88,'unit_name':'can'}
r['multipack_contents']=[{'upc':None,'canonical_gtin14':None,'standalone_upc':None,'product_name':'XOXOs Chicken and Tuna Stew','size':'3 oz can','quantity':6,'evidence_status':'unresolved','source_urls':[u]},{'upc':None,'canonical_gtin14':None,'standalone_upc':None,'product_name':'XOXOs Tuna and Egg Stew','size':'3 oz can','quantity':6,'evidence_status':'unresolved','source_urls':[u]}]
r['verification_notes'] += ['Manufacturer page explicitly states Chicken & Tuna (6 cans) + Tuna & Egg (6 cans) for the 12-pack. Child physical UPCs are not proven and remain null.','Structured calorie fields carry Chicken & Tuna Stew 1046 kcal/kg and 88 kcal/can; Tuna & Egg Stew is also printed on the same source at 938 kcal/kg and 79 kcal/can and is preserved here in this verification note.']
new.append(r)
# Ninja Cat Jiu Jit 12-pack: 4 cans each, all matching standalone SKUs already verified.
u='https://iandloveandyou.com/products/wet-canned-cat-food-variety-pack-ninja-cat-jiu-jit-stew'
r=base_record('818336012310','Original Recipe - Cat Can Variety Pack - Ninja Cat Jiu Jit Stew','3 OZ CAN (12 PACK)','Original Recipe','stew',u)
children=[by['818336012020'],by['818336012037'],by['818336012044']]
r['multipack_contents']=[child(x,4,u) for x in children]
r['ingredients_verbatim']='CHICKY-DA-LISH: '+children[0]['ingredients_verbatim']+' SALMON CHANTED EVENING: '+children[1]['ingredients_verbatim']+' TUNA FINTASTIC: '+children[2]['ingredients_verbatim']
r['ingredients_ordered_normalized']=['CHICKY-DA-LISH: '+children[0]['ingredients_verbatim'],'SALMON CHANTED EVENING: '+children[1]['ingredients_verbatim'],'TUNA FINTASTIC: '+children[2]['ingredients_verbatim']]
r['guaranteed_analysis']={'crude_protein_min_percent':9.0,'crude_fat_min_percent':None,'crude_fiber_max_percent':0.75,'moisture_max_percent':82.0,'ash_max_percent':None,'taurine_min_percent':0.10,'other_printed_guarantees':[{'nutrient':'Chicky-Da-Lish crude fat','basis':'min','value':3.5,'unit':'percent'},{'nutrient':'Salmon Chanted Evening crude fat','basis':'min','value':2.5,'unit':'percent'},{'nutrient':'Tuna Fintastic crude fat','basis':'min','value':2.0,'unit':'percent'}]}
r['calorie_content']={'kcal_per_kg':918,'kcal_per_unit':78,'unit_name':'can'}
r['verification_notes'] += ['Manufacturer page explicitly states Chicky-Da-Lish 4 cans + Salmon Chanted Evening 4 cans + Tuna Fintastic 4 cans.','Structured calorie fields carry Chicky-Da-Lish 918 kcal/kg and 78 kcal/can; same manufacturer page also prints Salmon Chanted Evening 888/75 and Tuna Fintastic 844/72, preserved in this note.']
new.append(r)
# Farm To Sea 12-pack: 4 cans each.
u='https://iandloveandyou.com/products/wet-canned-cat-food-variety-pack-farm-to-sea'
r=base_record('818336012303','Original Recipe - Cat Can Variety Pack - Farm To Sea','3 OZ CAN (12 PACK)','Original Recipe','pate',u)
children=[by['818336010217'],by['818336011900'],by['818336011689']]
r['multipack_contents']=[child(x,4,u) for x in children]
r['ingredients_verbatim']='BEEF RIGHT MEOW: '+children[0]['ingredients_verbatim']+' SAVORY SALMON: '+children[1]['ingredients_verbatim']+' PURRKY TURKEY: '+children[2]['ingredients_verbatim']
r['ingredients_ordered_normalized']=['BEEF RIGHT MEOW: '+children[0]['ingredients_verbatim'],'SAVORY SALMON: '+children[1]['ingredients_verbatim'],'PURRKY TURKEY: '+children[2]['ingredients_verbatim']]
r['guaranteed_analysis']={'crude_protein_min_percent':10.0,'crude_fat_min_percent':None,'crude_fiber_max_percent':0.75,'moisture_max_percent':78.0,'ash_max_percent':None,'taurine_min_percent':0.10,'other_printed_guarantees':[{'nutrient':'Beef Right Meow crude fat','basis':'min','value':4.0,'unit':'percent'},{'nutrient':'Savory Salmon crude fat','basis':'min','value':5.5,'unit':'percent'},{'nutrient':'Purrky Turkey crude fat','basis':'min','value':5.0,'unit':'percent'}]}
r['calorie_content']={'kcal_per_kg':1082,'kcal_per_unit':92,'unit_name':'can'}
r['verification_notes'] += ['Manufacturer page explicitly states Beef Right Meow 4 cans + Savory Salmon 4 cans + Purrky Turkey 4 cans.','Structured calorie fields carry Beef Right Meow 1082 kcal/kg and 92 kcal/can; same manufacturer page also prints Savory Salmon 1128/96 and Purrky Turkey 1181/100, preserved in this note.']
new.append(r)
assert len(new)==3
for r in new:
    assert ok(r['upc']),r['upc']; assert r['upc'] not in by; assert r['upc'] not in ex; assert r['multipack_contents']; assert r['ingredients_verbatim']; assert r['source_urls']
data['records'].extend(new); data['updated_at']=TODAY
codes=[r['upc'] for r in data['records']]; assert len(codes)==183 and len(codes)==len(set(codes)); assert sum(r.get('research_status')=='source_verified' for r in data['records'])==183
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('ILY_CURRENT_REMAINDER_OK before=180 added=3 total=183 source_verified=183')
print('ADDED',','.join(r['upc'] for r in new))
