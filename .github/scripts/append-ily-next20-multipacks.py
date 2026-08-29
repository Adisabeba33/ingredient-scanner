import json,copy
from pathlib import Path
ROOT=Path('.'); LED=ROOT/'research/deep-research-i-and-love-and-you.json'; TODAY='2026-08-29'
data=json.loads(LED.read_text()); assert len(data['records'])==120,len(data['records']); by={r['upc']:r for r in data['records']}
ex=''
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
 if p!=LED and p.exists(): ex+=p.read_text(errors='ignore')+'\n'
def ok(s):
 if not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(ds[:-1]))); return (10-total%10)%10==ds[-1]
def pack(base,outer,variant,qty,url,childsize):
 r=copy.deepcopy(by[base]); r['catalog_number']=None; r['upc']=outer; r['canonical_gtin14']=outer if len(outer)==14 else outer.zfill(14); r['barcode_scope']='multipack'; r['multipack_contents']=[{'upc':None,'canonical_gtin14':None,'standalone_upc':base,'product_name':by[base]['product_name'],'size':childsize,'quantity':qty,'evidence_status':'matched_standalone_sku','source_urls':[url,url+'.js']}]; r['variant']=variant; r['size']=variant; r['package_type']='box'; r['source_urls']=list(dict.fromkeys([url,url+'.js']+list(r.get('source_urls') or []))); r['source_accessed_at']=TODAY; r['barcode_notes']=f'Current manufacturer Shopify .js maps outer barcode {outer} exactly to {variant}. Outer multipack code is not an inner-unit UPC.'; r['verification_notes']=list(r.get('verification_notes') or [])+[f'2026-08-29: current first-party Shopify variant proves outer {variant} barcode {outer}.',f'Pack contains {qty} matching child units; child physical barcode is not asserted. Separately proven standalone UPC {base} is stored only as standalone_upc.']; r['research_status']='source_verified'; return r
spec=[
('818336012075','10818336012072','24 OZ BAG (6 PACK)',6,'https://iandloveandyou.com/products/dog-chew-treats-nice-jerky-chicken-salmon','4 oz bag'),
('818336014666','10818336014670','12 OZ BAG (6 PACK)',6,'https://iandloveandyou.com/products/fillin-good-chicken-flavor-with-immune-support','2 oz bag'),
('818336014673','20818336014677','12 OZ BAG (6 PACK)',6,'https://iandloveandyou.com/products/fillin-good-seafood-flavor-with-immune-support','2 oz bag'),
('818336012112','10818336013819','24 POUCHES (96 Treats)',24,'https://iandloveandyou.com/products/treat-meow-digestion-support','1 pouch (4 treats)'),
('818336013843','10818336013857','24 POUCHES (96 Treats)',24,'https://iandloveandyou.com/products/treat-meow-immune-support','1 pouch (4 treats)'),
('818336013829','10818336013833','24 POUCHES (96 Treats)',24,'https://iandloveandyou.com/products/treat-meow-skin-coat-support','1 pouch (4 treats)'),
('818336012723','10818336012850','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/dog-meal-enhancers-top-that-tummy-chicken-recipe','3 oz pouch'),
('818336012709','10818336012867','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/dog-meal-enhancers-top-that-shine-beef-recipe','3 oz pouch'),
('818336012716','10818336012713','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/dog-meal-enhancers-top-that-boost-duck-recipe','3 oz pouch'),
('818336014215','10818336014601','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/top-that-move-beef-with-bison-recipe-in-gravy','3 oz pouch'),
('818336014222','10818336014618','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/top-that-thrive-turkey-september-2025','3 oz pouch'),
('818336014581','10818336014595','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/top-that-wit-lamb-recipe-in-gravy','3 oz pouch'),
('818336014628','10818336014632','3 OZ POUCH (24 PACK)',24,'https://iandloveandyou.com/products/top-that-gaze-salmon-recipe-in-gravy','3 oz pouch'),
('818336011689','10818336011686','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-purrky-turkey-pate','3 oz can'),
('818336011900','10818336011907','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate','3 oz can'),
('818336010231','10818336010238','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-oh-my-cod-pate','3 oz can'),
('818336010224','10818336010221','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-chicken-me-out-pate','3 oz can'),
('818336010217','10818336010214','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-beef-right-meow-pate','3 oz can'),
('818336010200','10818336010207','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-whascally-wabbit-pate','3 oz can'),
('818336012037','10818336012034','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-salmon-chanted-evening-stew','3 oz can')]
new=[pack(*x) for x in spec]; assert len(new)==20
for r in new:
 assert ok(r['upc']),r['upc']; assert r['upc'] not in by,r['upc']; assert r['upc'] not in ex,r['upc']; assert r['ingredients_verbatim'] and r['ingredients_ordered_normalized']; assert r['source_urls']; assert r['multipack_contents']
data['records'].extend(new); data['updated_at']=TODAY; ups=[r['upc'] for r in data['records']]; assert len(ups)==140 and len(set(ups))==140
for r in data['records']:
 assert ok(r['upc']); assert 'multipack_contents' in r; assert r['canonical_gtin14']==(r['upc'] if len(r['upc'])==14 else r['upc'].zfill(14))
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('ILY_NEXT20_OK before=120 added=20 total=140 source_verified='+str(sum(r['research_status']=='source_verified' for r in data['records'])))
print('ADDED',','.join(r['upc'] for r in new))
