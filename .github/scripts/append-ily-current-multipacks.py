import json,copy,re
from pathlib import Path
ROOT=Path('.')
LED=ROOT/'research/deep-research-i-and-love-and-you.json'
TODAY='2026-08-29'
data=json.loads(LED.read_text())
assert len(data['records'])==100, len(data['records'])
by={r['upc']:r for r in data['records']}
# Updated multipack contract: every record carries multipack_contents.
for r in data['records']:
    r.setdefault('multipack_contents',[])
    if r['barcode_scope']=='individual_unit':
        assert r['multipack_contents']==[]

# live exclusion corpus, excluding this owned ledger
ex=''
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
    if p==LED: continue
    if p.exists(): ex+=p.read_text(errors='ignore')+'\n'

def gtin_ok(s):
    if not s.isdigit() or len(s) not in (12,13,14): return False
    ds=list(map(int,s)); chk=ds[-1]; body=ds[:-1]
    total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(body)))
    return (10-total%10)%10==chk

def child(standalone,name,size,qty,url,status='matched_standalone_sku'):
    assert standalone is None or gtin_ok(standalone)
    return {'upc':None,'canonical_gtin14':None,'standalone_upc':standalone,'product_name':name,'size':size,'quantity':qty,'evidence_status':status,'source_urls':[url]}

def clone_pack(base,outer,variant,size,qty,url,scope='multipack',child_name=None,child_size=None):
    assert base in by, base
    r=copy.deepcopy(by[base])
    r['catalog_number']=None
    r['upc']=outer
    r['canonical_gtin14']=outer if len(outer)==14 else outer.zfill(14)
    r['barcode_scope']=scope
    r['multipack_contents']=[child(base,child_name or r['product_name'],child_size or by[base]['size'],qty,url)]
    r['variant']=variant
    r['size']=size
    r['package_type']='box'
    r['source_urls']=list(dict.fromkeys([url,url+'.js']+list(r.get('source_urls') or [])))
    r['source_accessed_at']=TODAY
    r['barcode_notes']=f'Current manufacturer Shopify variant data maps outer barcode {outer} to {variant}. This is an outer {scope} barcode, never an inner-unit UPC.'
    r['verification_notes']=list(r.get('verification_notes') or [])+[
      f'2026-08-29 multipack contract: outer {scope} barcode check digit validated.',
      f'Current manufacturer .js maps {outer} exactly to {variant}.',
      f'Pack contains {qty} matching child units; child physical barcode is not asserted. Proven matching standalone SKU {base} is stored only in standalone_upc.'
    ]
    r['research_status']='source_verified'
    return r

new=[]
# Current consumer 4-packs of identical 3 oz cat cans: manufacturer .js proves exact outer UPC and pack count.
catpacks=[
('818336010200','818336014413','Whascally Wabbit Pâté','https://iandloveandyou.com/products/wet-canned-cat-food-whascally-wabbit-pate'),
('818336010224','818336014420','Chicken Me Out Pâté','https://iandloveandyou.com/products/wet-canned-cat-food-chicken-me-out-pate'),
('818336010217','818336014437','Beef Right Meow! Pâté','https://iandloveandyou.com/products/wet-canned-cat-food-beef-right-meow-pate'),
('818336010231','818336014444','Oh My Cod! Pâté','https://iandloveandyou.com/products/wet-canned-cat-food-oh-my-cod-pate'),
('818336011689','818336014451','Purrky Turkey Pâté','https://iandloveandyou.com/products/wet-canned-cat-food-purrky-turkey-pate'),
('818336011900','818336014468','Savory Salmon Paté','https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate'),
('818336012037','818336014789','Salmon Chanted Evening Stew','https://iandloveandyou.com/products/wet-canned-cat-food-salmon-chanted-evening-stew'),
('818336012044','818336014796','Tuna Fintastic Stew','https://iandloveandyou.com/products/wet-canned-cat-food-tuna-fintastic-stew')]
for base,outer,name,url in catpacks:
    new.append(clone_pack(base,outer,'3 OZ CAN (4 PACK)','3 OZ CAN (4 PACK)',4,url,child_name=name,child_size='3 oz'))

# Current Treat Meow 12-pouch multipacks (48 treats); exact outer UPCs from manufacturer .js.
treatpacks=[
('818336012112','818336013812','Treat Meow Digestion Support','https://iandloveandyou.com/products/treat-meow-digestion-support'),
('818336013843','818336013850','Treat Meow Immune Support','https://iandloveandyou.com/products/treat-meow-immune-support'),
('818336013829','818336013836','Treat Meow Skin & Coat Support','https://iandloveandyou.com/products/treat-meow-skin-coat-support')]
for base,outer,name,url in treatpacks:
    new.append(clone_pack(base,outer,'12 POUCHES (48 Treats)','12 POUCHES (48 Treats)',12,url,child_name=name,child_size='1 pouch (4 treats)'))

# Current Top That 12-pouch multipacks; each outer pack contains twelve identical 3 oz pouches.
toppacks=[
('818336012723','818336012853','Top That Tummy - Chicken Recipe','https://iandloveandyou.com/products/dog-meal-enhancers-top-that-tummy-chicken-recipe'),
('818336012709','818336012860','Top That Shine - Beef Recipe','https://iandloveandyou.com/products/dog-meal-enhancers-top-that-shine-beef-recipe'),
('818336012716','818336012877','Top That Boost - Duck Recipe','https://iandloveandyou.com/products/dog-meal-enhancers-top-that-boost-duck-recipe'),
('818336014215','818336014604','Top That Move - Beef with Bison Recipe in Gravy','https://iandloveandyou.com/products/top-that-move-beef-with-bison-recipe-in-gravy'),
('818336014222','818336014611','Top That Thrive - Turkey Recipe in Gravy','https://iandloveandyou.com/products/top-that-thrive-turkey-september-2025'),
('818336014581','818336014598','Top That Wit Lamb Recipe in Gravy','https://iandloveandyou.com/products/top-that-wit-lamb-recipe-in-gravy'),
('818336014628','818336014635','Top That Gaze - Salmon Recipe in Gravy','https://iandloveandyou.com/products/top-that-gaze-salmon-recipe-in-gravy')]
for base,outer,name,url in toppacks:
    new.append(clone_pack(base,outer,'3 OZ POUCH (12 PACK)','3 OZ POUCH (12 PACK)',12,url,child_name=name,child_size='3 oz pouch'))

# Two current homogeneous Nice Jerky six-packs. Manufacturer .js supplies packaging-level GTIN-14 and exact 6-pack identity.
def make_jerky(outer,standalone,name,ingredients,p,f,fi,m,kg,kcal,url):
    return {
      'catalog_number':None,'upc':outer,'canonical_gtin14':outer,'barcode_scope':'multipack',
      'multipack_contents':[child(standalone,name,'4 oz bag',6,url)],
      'brand':'I and love and you','manufacturer':None,'species':'dog','product_line':'Nice Jerky!','product_name':name,
      'variant':'24 OZ BAG (6 PACK)','recipe':name.replace('Nice Jerky! - ','').split(' + '),'life_stage':None,'food_form':'treat','texture':None,'presentation':'plain','package_type':'box','size':'24 OZ BAG (6 PACK)',
      'ingredients_verbatim':ingredients,'ingredients_ordered_normalized':[x.strip() for x in ingredients.rstrip('.').split(',')],
      'guaranteed_analysis':{'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':None,'other_printed_guarantees':[]},
      'calorie_content':{'kcal_per_kg':kg,'kcal_per_unit':kcal,'unit_name':'piece'},'label_deck_code':None,
      'formula_source':'Current manufacturer product page supplies the complete ingredient statement, printed guaranteed analysis, calorie declaration and supplemental-treat context; current Shopify .js supplies exact outer six-pack GTIN.',
      'source_urls':[url,url+'.js'],'source_accessed_at':TODAY,
      'barcode_notes':f'Current manufacturer Shopify .js maps outer GTIN-14 {outer} to 24 OZ BAG (6 PACK). This outer trade-item code is not represented as the child UPC.',
      'conflicts':[],
      'verification_notes':['GTIN-14 outer barcode check digit independently validated.','Six 4 oz child bags reconcile to the printed 24 oz / 6 pack outer variant.','Child physical barcode is not asserted from the outer pack; current manufacturer standalone barcode is stored as standalone_upc only.','Manufacturer calorie values are preserved as printed without repairing apparent label anomalies.'],
      'research_status':'source_verified'}
new.append(make_jerky('10818336012058','818336012051','Nice Jerky! - Beef + Lamb','Beef, lamb, pea flour, vegetable glycerin, cane molasses, salt, natural smoke flavor, rosemary extract.',22.0,15.0,2.0,82.0,3389,96,'https://iandloveandyou.com/products/dog-chew-treats-nice-jerky-beef-lamb'))
new.append(make_jerky('10818336012065','818336012068','Nice Jerky! - Chicken + Duck','Chicken, pea flour, vegetable glycerin, duck, cane molasses, salt, natural maple smoke flavor, rosemary extract.',26.0,12.0,2.0,82.0,3352,96,'https://iandloveandyou.com/products/dog-chew-treats-nice-jerky-chicken-duck'))

assert len(new)==20, len(new)
newcodes=[r['upc'] for r in new]
assert len(set(newcodes))==20
for r in new:
    assert gtin_ok(r['upc']),r['upc']
    assert r['upc'] not in by,r['upc']
    assert r['upc'] not in ex,r['upc']
    assert r['barcode_scope'] in ('multipack','case','tray')
    assert isinstance(r['multipack_contents'],list) and r['multipack_contents']
    for c in r['multipack_contents']:
        assert c['quantity']>0
        assert c['evidence_status'] in ('verified_inner_barcode','matched_standalone_sku','unresolved')
        if c['upc'] is not None:
            assert gtin_ok(c['upc']) and c['canonical_gtin14']
        if c['standalone_upc'] is not None: assert gtin_ok(c['standalone_upc'])
    assert r['ingredients_verbatim'] and r['ingredients_ordered_normalized']
    assert r['source_urls'] and r['source_accessed_at']==TODAY

# Correct a previously mis-scoped current item discovered during multipack sweep:
# current manufacturer .js maps 818336014314 to Savory Salmon 5.5 OZ CAN (12 PACK), not one 5.5 oz can.
wrong=by['818336014314']
wrong['barcode_scope']='multipack'
wrong['multipack_contents']=[child(None,'Savory Salmon Paté','5.5 oz can',12,'https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate',status='unresolved')]
wrong['variant']='5.5 OZ CAN (12 PACK)'
wrong['size']='5.5 OZ CAN (12 PACK)'
wrong['package_type']='box'
wrong['source_urls']=list(dict.fromkeys(['https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate','https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate.js']+list(wrong.get('source_urls') or [])))
wrong['barcode_notes']='Corrected 2026-08-29: current manufacturer Shopify .js maps 818336014314 to the outer 5.5 OZ CAN (12 PACK), not an individual can. Inner 5.5 oz can barcode remains unproven and is therefore null in multipack_contents.'
wrong['verification_notes']=list(wrong.get('verification_notes') or [])+['2026-08-29 contract correction: prior individual_unit scope was wrong; current first-party Shopify variant evidence proves outer 12-pack identity. Child 5.5 oz can barcode is unresolved and not inferred from the 3 oz standalone SKU.']
wrong['source_accessed_at']=TODAY
wrong['research_status']='source_verified'

# whole-ledger append and validation
data['records'].extend(new); data['updated_at']=TODAY
ups=[r['upc'] for r in data['records']]
assert len(ups)==120 and len(ups)==len(set(ups))
for r in data['records']:
    assert 'multipack_contents' in r and isinstance(r['multipack_contents'],list)
    if r['barcode_scope']=='individual_unit': assert r['multipack_contents']==[]
    assert gtin_ok(r['upc']),r['upc']
    assert r['canonical_gtin14']==(r['upc'] if len(r['upc'])==14 else r['upc'].zfill(14))
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('ILY_MULTIPACK_OK before=100 added=20 total=120 source_verified='+str(sum(r['research_status']=='source_verified' for r in data['records'])))
print('ADDED',','.join(newcodes))
print('CORRECTED 818336014314 individual_unit -> multipack 5.5 OZ CAN (12 PACK)')
