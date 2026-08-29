import json
from pathlib import Path
P=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(P.read_text()); assert len(d['records'])==183
by={r['upc']:r for r in d['records']}
cands=[r for r in d['records'] if r.get('research_status')=='candidate']; assert len(cands)==13
CORE=['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent','ash_max_percent','taurine_min_percent']

def dedup(xs):
 out=[]
 for x in xs:
  if x not in out: out.append(x)
 return out

def fmt(v):
 return 'null' if v is None else str(v)

for r in cands:
 children=[]
 for c in r.get('multipack_contents',[]):
  u=c.get('standalone_upc'); ch=by.get(u) if u else None
  # A standalone_upc must point to a true individual-unit SKU. If it points to an outer case, remove it.
  if ch is not None and ch.get('barcode_scope')!='individual_unit':
   c['standalone_upc']=None; c['evidence_status']='unresolved'; u=None; ch=None
  if ch is None:
   # Resolve formula by exact child product name when barcode is not proven, without inventing child UPC.
   name=(c.get('product_name') or '').lower()
   matches=[x for x in d['records'] if x.get('research_status')=='source_verified' and x.get('ingredients_verbatim') and (x.get('product_name') or '').lower()==name]
   # Prefer an individual unit if available; otherwise exact recipe multipack is acceptable as formula source only.
   if matches:
    matches=sorted(matches,key=lambda x: 0 if x.get('barcode_scope')=='individual_unit' else 1)
    ch=matches[0]
  assert ch is not None,(r['upc'],c)
  assert ch.get('research_status')=='source_verified'
  assert ch.get('ingredients_verbatim') and ch.get('source_urls')
  children.append((c,ch))
  c['source_urls']=dedup((c.get('source_urls') or [])+(ch.get('source_urls') or []))

 # Full component ingredient statements, kept separately and in child order.
 r['ingredients_verbatim']=' '.join(f"{ch['product_name']}: {ch['ingredients_verbatim']}" for c,ch in children)
 r['ingredients_ordered_normalized']=[f"{ch['product_name']}: {ch['ingredients_verbatim']}" for c,ch in children]

 # Common core guarantees can be safely represented at pack level only when identical across all components.
 ga={'other_printed_guarantees':[]}
 for k in CORE:
  vals=[(ch.get('guaranteed_analysis') or {}).get(k) for c,ch in children]
  ga[k]=vals[0] if vals and all(v==vals[0] for v in vals) else None
  if vals and not all(v==vals[0] for v in vals):
   for c,ch in children:
    v=(ch.get('guaranteed_analysis') or {}).get(k)
    if v is not None:
     ga['other_printed_guarantees'].append({'nutrient':f"{ch['product_name']} {k}",'basis':'max' if 'max_' in k or '_max_' in k else 'min','value':v,'unit':'percent'})
 # Preserve child-specific non-core printed guarantees too.
 for c,ch in children:
  for x in (ch.get('guaranteed_analysis') or {}).get('other_printed_guarantees',[]):
   y=dict(x); y['nutrient']=f"{ch['product_name']} — {x.get('nutrient')}"; ga['other_printed_guarantees'].append(y)
 r['guaranteed_analysis']=ga

 # A variety pack has no invented aggregate calorie value. Use a common value only when every component prints the same basis/value.
 cals=[ch.get('calorie_content') or {} for c,ch in children]
 samekg=bool(cals) and all(x.get('kcal_per_kg')==cals[0].get('kcal_per_kg') for x in cals)
 sameunit=bool(cals) and all(x.get('kcal_per_unit')==cals[0].get('kcal_per_unit') and x.get('unit_name')==cals[0].get('unit_name') for x in cals)
 r['calorie_content']={'kcal_per_kg':cals[0].get('kcal_per_kg') if samekg else None,'kcal_per_unit':cals[0].get('kcal_per_unit') if sameunit else None,'unit_name':cals[0].get('unit_name') if sameunit else None}
 calnote='; '.join(f"{ch['product_name']}: {fmt((ch.get('calorie_content') or {}).get('kcal_per_kg'))} kcal/kg, {fmt((ch.get('calorie_content') or {}).get('kcal_per_unit'))} kcal/{(ch.get('calorie_content') or {}).get('unit_name') or 'unit'}" for c,ch in children)

 # Merge strongest direct sources from outer pack plus all child formulas.
 urls=list(r.get('source_urls') or [])
 for c,ch in children: urls += (ch.get('source_urls') or [])
 r['source_urls']=dedup(urls)
 r['formula_source']='Current manufacturer outer-pack page/Shopify variant proves pack identity and composition; each component formula, printed guaranteed analysis, calories, and adequacy are inherited only from its separately source-verified matching recipe record and cited direct sources.'
 notes=r.setdefault('verification_notes',[])
 notes.append('2026-08-29 candidate completion: every listed component recipe was cross-checked against a separately source-verified formula record before promotion; no child physical UPC was invented.')
 notes.append('2026-08-29 component calories: '+calnote+'. Where component calorie values differ, pack-level calorie fields remain null because no single aggregate calorie value is printed for the variety pack.')
 nulls=[k for k in CORE if ga.get(k) is None]
 if nulls:
  notes.append('2026-08-29 component-specific GA: pack-level '+', '.join(nulls)+' remain null where component recipes print different values or no common pack-wide value; all non-null component-specific printed values are preserved in other_printed_guarantees.')
 r['verification_notes']=dedup(notes)
 r['research_status']='source_verified'

# Final structural/evidence gates.
assert sum(x.get('research_status')=='source_verified' for x in d['records'])==183
assert sum(x.get('research_status')=='candidate' for x in d['records'])==0
for r in d['records']:
 assert r.get('upc') and r.get('canonical_gtin14')==str(r['upc']).zfill(14)
 assert r.get('source_urls') and r.get('ingredients_verbatim') and r.get('ingredients_ordered_normalized')
 assert r.get('formula_source') and r.get('verification_notes')
 if r.get('barcode_scope') in {'multipack','case','tray'}:
  assert r.get('multipack_contents')
  for c in r['multipack_contents']:
   for k in ['upc','canonical_gtin14','standalone_upc','product_name','size','quantity','evidence_status','source_urls']: assert k in c,(r['upc'],k)
   assert c['evidence_status'] in {'verified_inner_barcode','matched_standalone_sku','unresolved'}
   if c['upc'] is None: assert c['canonical_gtin14'] is None
   if c.get('standalone_upc'):
    assert by[c['standalone_upc']].get('barcode_scope')=='individual_unit',(r['upc'],c['standalone_upc'])
d['updated_at']='2026-08-29'
P.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('ILY_13_PROMOTED_OK total=183 source_verified=183 candidate=0')
print('PROMOTED',','.join(r['upc'] for r in cands))
