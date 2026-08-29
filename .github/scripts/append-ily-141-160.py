import json,copy
from pathlib import Path
ROOT=Path('.'); LED=ROOT/'research/deep-research-i-and-love-and-you.json'; TODAY='2026-08-29'
data=json.loads(LED.read_text()); assert len(data['records'])==140,len(data['records']); by={r['upc']:r for r in data['records']}
ex=''
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
 if p!=LED and p.exists(): ex+=p.read_text(errors='ignore')+'\n'
def ok(s):
 if not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(ds[:-1]))); return (10-total%10)%10==ds[-1]
def pack(base,outer,variant,qty,url,child_size=None,child_name=None):
 assert base in by,(base,outer); r=copy.deepcopy(by[base]); r['catalog_number']=None; r['upc']=outer; r['canonical_gtin14']=outer if len(outer)==14 else outer.zfill(14); r['barcode_scope']='multipack'; r['variant']=variant; r['size']=variant; r['package_type']='box'; r['multipack_contents']=[{'upc':None,'canonical_gtin14':None,'standalone_upc':base,'product_name':child_name or by[base]['product_name'],'size':child_size or by[base]['size'],'quantity':qty,'evidence_status':'matched_standalone_sku','source_urls':[url,url+'.js']}]; r['source_urls']=list(dict.fromkeys([url,url+'.js']+list(r.get('source_urls') or []))); r['source_accessed_at']=TODAY; r['barcode_notes']=f'Current manufacturer Shopify .js maps outer barcode {outer} exactly to {variant}. Outer multipack barcode is not asserted as an inner-unit barcode.'; r['verification_notes']=list(r.get('verification_notes') or [])+[f'2026-08-29: current manufacturer Shopify variant proves {outer} = {variant}.',f'Pack contains {qty} matching child units; child physical barcode is not asserted. Matching standalone SKU {base} is retained only as standalone_upc.']; r['research_status']='source_verified'; return r
new=[]
# Feed Meow homogeneous can multipacks
for base,outer,var,qty,h in [
('818336013645','818336013676','3 OZ (12 PACK)',12,'feed-meow-boost'),('818336013645','10818336013673','3 OZ (24 PACK)',24,'feed-meow-boost'),
('818336013652','818336013683','3 OZ (12 PACK)',12,'feed-meow-shine'),('818336013652','10818336013680','3 OZ (24 PACK)',24,'feed-meow-shine'),
('818336013669','818336013690','3 OZ (12 PACK)',12,'feed-meow-tummy'),('818336013669','10818336013697','3 OZ (24 PACK)',24,'feed-meow-tummy'),
('818336013928','10818336013932','3 OZ (24 PACK)',24,'feed-meow-move'),('818336013898','10818336013901','3 OZ (24 Pack)',24,'feed-meow-indoor')]:
 new.append(pack(base,outer,var,qty,'https://iandloveandyou.com/products/'+h,child_size='3 oz'))
# XOXO homogeneous 24 packs
for base,outer,h in [('818336013584','10818336013581','xoxo-salmon-tuna-pate'),('818336013607','10818336013604','xoxo-beef-chicken-pate'),('818336013577','10818336013574','xoxo-whitefish-tuna-pate'),('818336013591','10818336013598','xoxo-chicken-tuna-pate')]:
 new.append(pack(base,outer,'3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/'+h,child_size='3 oz can'))
# Current bulk chew packs; child sticks are not claimed to carry standalone package UPCs.
def bulk(base,outer,var,qty,url,child_name):
 r=pack(base,outer,var,qty,url,child_size=child_name,child_name=child_name); c=r['multipack_contents'][0]; c['standalone_upc']=None; c['evidence_status']='unresolved'; r['verification_notes'][-1]=f'Pack count {qty} is proven by current manufacturer variant. No barcode is asserted for each loose chew inside the outer pack.'; return r
new.append(bulk('818336010002','10818336010009','12 INCH (30 COUNT)',30,'https://iandloveandyou.com/products/dog-chew-treats-free-ranger-bully-stix','No Stink! Free Ranger Bully Stix 12 inch chew'))
new.append(bulk('818336013911','10818336013918','6 INCH (18 COUNT)',18,'https://iandloveandyou.com/products/braided-bully-sticks','Free Ranger Braided Bully Stix 6 inch chew'))
# Dog stew homogeneous cases
for base,outer,h,name in [('818336011962','10818336011969','wet-canned-stew-dog-food-moo-moo-venison-stew','Moo Moo Venison Stew'),('818336010187','10818336010184','wet-canned-stew-dog-food-gobble-it-up-stew','Gobble It Up Stew'),('818336010194','10818336010191','wet-canned-stew-dog-food-cluckin-good-stew',"Cluckin' Good Stew"),('818336010170','10818336010177','wet-canned-stew-dog-food-booyah-stew','Beef Booyah Stew')]:
 new.append(pack(base,outer,'13 OZ CAN (12 PACK)',12,'https://iandloveandyou.com/products/'+h,child_size='13 oz can',child_name=name))
# Remaining current cat stew 24 packs
new.append(pack('818336012044','10818336012041','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-tuna-fintastic-stew',child_size='3 oz can'))
new.append(pack('818336012020','10818336012027','3 OZ CAN (24 PACK)',24,'https://iandloveandyou.com/products/wet-canned-cat-food-chicky-da-lish-stew',child_size='3 oz can'))
assert len(new)==20
codes=[r['upc'] for r in new]; assert len(set(codes))==20
for r in new:
 assert ok(r['upc']),r['upc']; assert r['upc'] not in by; assert r['upc'] not in ex,r['upc']; assert r['multipack_contents']; assert r['ingredients_verbatim']; assert r['ingredients_ordered_normalized']; assert r['source_urls']
data['records'].extend(new); data['updated_at']=TODAY
allc=[r['upc'] for r in data['records']]; assert len(allc)==160 and len(allc)==len(set(allc)); assert sum(r.get('research_status')=='source_verified' for r in data['records'])==160
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('ILY_141_160_OK before=140 added=20 total=160 source_verified=160')
print('ADDED',','.join(codes))
