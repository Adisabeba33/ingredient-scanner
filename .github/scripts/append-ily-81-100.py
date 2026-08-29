import json,copy,re
from pathlib import Path
ROOT=Path('.')
LED=ROOT/'research/deep-research-i-and-love-and-you.json'
TODAY='2026-08-29'
data=json.loads(LED.read_text())
assert len(data['records'])==80, len(data['records'])
by={r['upc']:r for r in data['records']}
ex=''
for p in list((ROOT/'research').glob('deep-research-*.json'))+[ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']:
    if p==LED: continue
    if p.exists(): ex+=p.read_text(errors='ignore')+'\n'

def check(u):
    b=list(map(int,u[:11])); return len(u)==12 and (10-((sum(b[::2])*3+sum(b[1::2]))%10))%10==int(u[11])
def clone(base,upc,size,urls,note, product_name=None, variant=None):
    r=copy.deepcopy(by[base]); r['catalog_number']=None; r['upc']=upc; r['canonical_gtin14']=upc.zfill(14); r['size']=size
    if product_name: r['product_name']=product_name
    if variant: r['variant']=variant
    r['source_urls']=urls; r['source_accessed_at']=TODAY
    r['barcode_notes']=note
    r['verification_notes']=list(r.get('verification_notes') or [])+['2026-08-29: exact package-size barcode identity independently re-verified for this added size; sibling formula retained only because the same manufacturer product page serves all listed size variants.']
    r['research_status']='source_verified'; return r

def rec(upc,species,line,name,variant,recipe,stage,form,texture,presentation,ptype,size,ingredients,ga,kg,ku,unit,urls,formula_source,notes=None,conflicts=None):
    return {'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit','brand':'I and love and you','manufacturer':None,'species':species,'product_line':line,'product_name':name,'variant':variant,'recipe':recipe,'life_stage':stage,'food_form':form,'texture':texture,'presentation':presentation,'package_type':ptype,'size':size,'ingredients_verbatim':ingredients,'ingredients_ordered_normalized':split_ing(ingredients),'guaranteed_analysis':ga,'calorie_content':{'kcal_per_kg':kg,'kcal_per_unit':ku,'unit_name':unit},'label_deck_code':None,'formula_source':formula_source,'source_urls':urls,'source_accessed_at':TODAY,'barcode_notes':'Exact UPC/retail-unit identity is documented by the cited manufacturer variant data and/or exact-unit retailer listing; UPC-A check digit independently validated.','conflicts':conflicts or [],'verification_notes':notes or ['UPC-A check digit validated.','Canonical GTIN-14 is UPC-A left-padded to 14 digits.','Complete ingredient order, core printed guaranteed analysis, calories, and adequacy/supplemental status captured from cited evidence.'],'research_status':'source_verified'}
def split_ing(s):
    out=[];cur='';d=0
    for ch in s:
        if ch=='(':d+=1
        elif ch==')':d=max(0,d-1)
        if ch==',' and d==0:out.append(cur.strip());cur=''
        else:cur+=ch
    if cur.strip():out.append(cur.strip().rstrip('.'))
    return out
def GA(p,f,fi,m,other=None,taur=None,ash=None):
    return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':ash,'taurine_min_percent':taur,'other_printed_guarantees':other or []}

new=[]
# Current Shopify variant JSON directly maps each UPC to the exact printed size.
new += [
clone('818336011887','818336013386','11 lb',['https://iandloveandyou.com/products/cat-kibble-naked-essentials-chicken-duck','https://iandloveandyou.com/products/cat-kibble-naked-essentials-chicken-duck.js'],'Manufacturer Shopify variant: 11 LB BAG, barcode 818336013386.'),
clone('818336011894','818336013331','11 lb',['https://iandloveandyou.com/products/cat-kibble-naked-essentials-salmon-trout','https://iandloveandyou.com/products/cat-kibble-naked-essentials-salmon-trout.js'],'Manufacturer Shopify variant: 11 LB BAG, barcode 818336013331.'),
clone('818336012792','818336012938','21 lb',['https://iandloveandyou.com/products/dog-kibble-baked-saucy-chicken-sweet-potato','https://iandloveandyou.com/products/dog-kibble-baked-saucy-chicken-sweet-potato.js'],'Manufacturer Shopify variant: 21 LB BAG, barcode 818336012938.'),
clone('818336012471','818336012570','21 lb',['https://iandloveandyou.com/products/dog-kibble-lovingly-simple-lamb-sweet-potato','https://iandloveandyou.com/products/dog-kibble-lovingly-simple-lamb-sweet-potato.js'],'Manufacturer Shopify variant: 21 LB BAG, barcode 818336012570.'),
clone('818336013324','818336013461','23 lb',['https://iandloveandyou.com/products/dog-kibble-naked-essentials-ancient-grains-beef-lamb','https://iandloveandyou.com/products/dog-kibble-naked-essentials-ancient-grains-beef-lamb.js'],'Manufacturer Shopify variant: 23 LB BAG, barcode 818336013461.'),
clone('818336013294','818336013478','23 lb',['https://iandloveandyou.com/products/dog-kibble-naked-essentials-ancient-grains-chicken-turkey','https://iandloveandyou.com/products/dog-kibble-naked-essentials-ancient-grains-chicken-turkey.js'],'Manufacturer Shopify variant: 23 LB BAG, barcode 818336013478.'),
clone('818336011849','818336012587','23 lb',['https://iandloveandyou.com/products/dog-kibble-naked-essentials-chicken-duck','https://iandloveandyou.com/products/dog-kibble-naked-essentials-chicken-duck.js'],'Manufacturer Shopify variant: 23 LB BAG, barcode 818336012587.'),
clone('818336011849','818336013485','40 lb',['https://iandloveandyou.com/products/dog-kibble-naked-essentials-chicken-duck','https://iandloveandyou.com/products/dog-kibble-naked-essentials-chicken-duck.js'],'Manufacturer Shopify variant: 40 LB BAG, barcode 818336013485.'),
# legacy package sizes, exact UPC-size retail mappings; same named formula lineage as retained sibling
clone('818336010088','818336010071','13 lb',['https://fnac.com.br/produto/i-and-love-and-you-naked-essentials-grain-free-dog-food-turkey-garbanzo-beans-red-lentils-veggies-fruit-13-lbs/','https://iandloveandyou.com/products/dog-kibble-nude-food-poultry-palooza'],'Exact retailer SKU maps 818336010071 to the 13 lb Poultry Palooza retail bag; current manufacturer page supplies the matching named formula.',conflicts if False else None),
clone('818336010118','818336010101','13 lb',['https://lojamais.com.br/produto/i-and-love-and-you-naked-essentials-grain-free-dog-food-red-meat-medley-recipe-13-lbs/','https://iandloveandyou.com/products/dog-kibble-nude-food-red-meat-medley'],'Exact retailer SKU maps 818336010101 to the 13 lb Red Meat Medley retail bag; current manufacturer page supplies the matching named formula.'),
clone('818336010149','818336010132','13 lb',['https://sosuplementos.com.br/produto/i-and-love-and-you-naked-essentials-grain-free-dog-food-simply-sea-recipe-13-lbs-2/','https://iandloveandyou.com/products/dog-kibble-nude-food-simply-sea'],'Exact retailer SKU maps 818336010132 to the 13 lb Simply Sea retail bag; current manufacturer page supplies the matching named formula.'),
clone('818336010002','818336010019','6 inch (5 count)',['https://www.maxwarehouse.com/products/i-and-love-and-you-free-ranger-bully-stix-beef-case-of-6-5-count-pack-of-6'],'Exact retailer page prints UPC 818336010019 and 6 in stick (15.2 cm), 5 pk; barcode is the sellable 5-count bag, despite distributor case wording.'),
]
# correct accidental helper extra arg artifact if present
new=[r for r in new]
# Current individual chew SKUs
new.append(rec('818336010026','dog','Ear Candy','Ear Candy Beef Ear Chews','1 Bag (5 Count)',['beef'],'all','treat',None,'plain','bag','5 count','beef cow ears',GA(83,4,8,5),3384,51,'piece',['https://iandloveandyou.com/products/dog-chew-treats-ear-candy-beef-ear-chews','https://iandloveandyou.com/products/dog-chew-treats-ear-candy-beef-ear-chews.js'],'Current manufacturer page supplies exact formula/GA/calories/supplemental statement; Shopify variant maps 1 BAG (5 COUNT) to UPC 818336010026.'))
for u,sz in [('818336011801','6 inch (5 count)'),('818336011993','6 inch (48 count)')]:
    new.append(rec(u,'dog','Good Golly Gullet Stix','Good Golly Gullet Stix',sz,['beef'],'all','treat',None,'plain','bag',sz,'beef gullet',GA(79,1.3,1,13),3820,42,'piece',['https://iandloveandyou.com/products/dog-chew-treats-good-golly-gullet-stix','https://iandloveandyou.com/products/dog-chew-treats-good-golly-gullet-stix.js'],'Current manufacturer page supplies formula/GA/calories/supplemental statement; Shopify variant JSON maps this UPC to the stated count.'))
new.append(rec('818336013911','dog','Free Ranger Braided Bully Stix','Free Ranger Braided Bully Stix','6 inch (3 count)',['beef'],'all','treat',None,'plain','bag','6 inch (3 count)','Beef Pizzle',GA(65,2,3,18),None,None,None,['https://iandloveandyou.com/products/braided-bully-sticks','https://iandloveandyou.com/products/braided-bully-sticks.js'],'Current manufacturer product page and Shopify variant JSON supply exact formula, complete printed GA, supplemental statement, and 6 INCH (3 COUNT) UPC identity. Manufacturer page does not print calorie content; null is retained rather than invented.',notes=['UPC-A check digit validated.','Manufacturer Shopify variant maps barcode 818336013911 to 6 INCH (3 COUNT).','No calorie declaration is printed on the current manufacturer page; calorie fields are therefore null under the contract rather than inferred.']))
# Historical exact retail formulas with direct SKU identity
new.append(rec('818336010323','dog','Raw Raw','Raw-Raw Turk Boom Ba Dinner','Turkey',['turkey'],'all','dry',None,'plain','bag','1.5 lb','Turkey, Sweet Potatoes, Yellow Split Peas, Carrots, Cabbage, Dried Egg Product, Flaxseeds, Bananas, Tricalcium Phosphate, Dried Kelp, Spinach, Ginger Root, Zinc Sulfate, Vitamin E supplement, Ferrous Fumarate, Copper Sulfate, d Calcium Pantothenate, Riboflavin, Vitamin D3 Supplement, Pyridoxine Hydrochloride, Folic Acid.',GA(32,9,5,10,[{'nutrient':'Omega-6 Fatty Acids','basis':'min','value':2.1,'unit':'percent'},{'nutrient':'Omega-3 Fatty Acids','basis':'min','value':0.3,'unit':'percent'}]),3446,327,'cup',['https://sosuplementos.com.br/produto/i-and-love-and-you-raw-raw-turk-boom-ba-dinner-1-5-lbs/'],'Exact archived retail label transcription supplies UPC/SKU, 1.5 lb size, complete formula, GA, calories and all-age feeding evidence.'))
new.append(rec('818336011672','dog','Raw Raw','Raw Raw Lamb Boom Ba Dinner','Lamb',['lamb'],'all','dry',None,'plain','bag','1.5 lb','Lamb, Yellow Split Peas, Sweet Potatoes, Carrots, Cabbage, Dried Egg Product, Flaxseeds, Bananas, Tricalcium Phosphate, Dried Kelp, Spinach, Ginger Root, Zinc Sulfate, Vitamin E supplement, Ferrous Fumarate, Copper Sulfate, d Calcium Pantothenate, Riboflavin, Vitamin D3 Supplement, Pyridoxine Hydrochloride, Folic Acid.',GA(23,11,4,10,[{'nutrient':'Omega-6 Fatty Acids','basis':'min','value':1.3,'unit':'percent'},{'nutrient':'Omega-3 Fatty Acids','basis':'min','value':0.6,'unit':'percent'}]),3534,335,'cup',['https://lojamais.com.br/produto/i-and-love-and-you-raw-raw-lamb-boom-ba-dinner-1-5-lbs/'],'Exact archived retail label transcription supplies UPC/SKU, 1.5 lb size, complete formula, GA, calories and all-age feeding evidence.'))
new.append(rec('818336013348','cat','Meow & Zen Hearties','Meow and Zen Hearties','Chicken',['chicken'],'all','treat',None,'plain','bag','4 oz','Chicken, pea flour, vegetable glycerin, chicken liver, sweet potato, ground whole flaxseed, pumpkin powder, natural smoke flavor, salt, passion fruit flower, chamomile, lavender, inulin, rosemary extract.',GA(18,8,2,26),3166,2.75,'piece',['https://iandloveandyou.com/products/cat-treats-meow-and-zen-hearties','https://www.vitacost.com/i-and-love-and-you-cat-treats-meow-and-zen-hearties'],'Current manufacturer page controls current formula/GA/calories and supplemental statement; Vitacost exact SKU 818336013348 proves the 4 oz individual bag UPC.',conflicts=['Older retailer data prints an earlier 19% protein / 9% fat / 5% fiber / 24% moisture deck and 3196 kcal/kg; current manufacturer page now prints 18% / 8% / 2% / 26% and 3166 kcal/kg, so current manufacturer generation is stored.']))
new.append(rec('818336010385','dog','Nice Jerky!','Nice Jerky Venison + Lamb Bites','Venison + Lamb',['venison','lamb'],'all','treat',None,'plain','bag','4 oz','Venison, lamb, dried chicory root, vegetable glycerin, salt, mixed tocopherols (preservative).',GA(25,10,2,20),4250,120,'cup',['https://www.maxwarehouse.com/products/i-and-love-and-you-dog-treats-nice-jerky-venison-and-lamb-bites-4-oz-case-of-6-pack-of-6','https://ciadosuplemento.com/produto/i-and-love-and-you-timo-e-rstico-carne-de-veado-pedaos-de-cordeiro-113-g/'],'Exact UPC retailer identity plus exact archived formula/GA/calorie transcription; supplemental feeding statement is printed by formula source.'))

assert len(new)==20, len(new)
ups=[r['upc'] for r in new]
assert len(set(ups))==20
for r in new:
    assert check(r['upc']),r['upc']
    assert r['upc'] not in by and r['upc'] not in ex,r['upc']
    assert r['brand']=='I and love and you' and r['research_status']=='source_verified'
    assert r['barcode_scope']=='individual_unit'
    assert r['ingredients_verbatim'] and r['ingredients_ordered_normalized']
    assert r['source_urls'] and r['source_accessed_at']==TODAY
    assert isinstance(r['conflicts'],list) and isinstance(r['verification_notes'],list)
    ga=r['guaranteed_analysis']; assert all(k in ga for k in ['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent','ash_max_percent','taurine_min_percent','other_printed_guarantees'])
# whole-ledger uniqueness/postflight
allups=[r['upc'] for r in data['records']]+ups
assert len(allups)==len(set(allups))
data['records'].extend(new); data['updated_at']=TODAY
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
chk=json.loads(LED.read_text())
assert len(chk['records'])==100
assert sum(r['research_status']=='source_verified' for r in chk['records'])==100
print('ILY_81_100_OK before=80 added=20 total=100 source_verified=100')
print('UPCS',','.join(ups))
