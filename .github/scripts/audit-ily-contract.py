import json,re
from pathlib import Path
p=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(p.read_text())
req=['catalog_number','upc','canonical_gtin14','barcode_scope','multipack_contents','brand','manufacturer','species','product_line','product_name','variant','recipe','life_stage','food_form','texture','presentation','package_type','size','ingredients_verbatim','ingredients_ordered_normalized','guaranteed_analysis','calorie_content','label_deck_code','formula_source','source_urls','source_accessed_at','barcode_notes','conflicts','verification_notes','research_status']
scopes={'individual_unit','multipack','case','tray','unknown'}
statuses={'candidate','source_verified','needs_physical_label','rejected','promoted_to_seed'}

def chk(code):
 s=str(code)
 if not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); total=sum(x*(3 if i%2==0 else 1) for i,x in enumerate(reversed(ds[:-1])))
 return (10-total%10)%10==ds[-1]
issues=[]; clean=[]; counters={}
for i,r in enumerate(d['records'],1):
 ri=[]
 for k in req:
  if k not in r: ri.append('missing:'+k)
 if r.get('upc') and not chk(r['upc']): ri.append('invalid_upc')
 if r.get('canonical_gtin14') != str(r.get('upc','')).zfill(14): ri.append('bad_gtin14')
 if r.get('barcode_scope') not in scopes: ri.append('bad_scope')
 if r.get('research_status') not in statuses: ri.append('bad_status')
 if r.get('brand')!='I and love and you': ri.append('bad_brand')
 if not isinstance(r.get('source_urls'),list) or not r.get('source_urls'): ri.append('source_urls_empty')
 if not isinstance(r.get('conflicts'),list): ri.append('conflicts_not_list')
 if not isinstance(r.get('verification_notes'),list) or not r.get('verification_notes'): ri.append('verification_notes_empty')
 if not isinstance(r.get('ingredients_ordered_normalized'),list) or not r.get('ingredients_ordered_normalized'): ri.append('ingredients_normalized_empty')
 if not isinstance(r.get('ingredients_verbatim'),str) or not r.get('ingredients_verbatim').strip(): ri.append('ingredients_verbatim_empty')
 ga=r.get('guaranteed_analysis') or {}
 for k in ['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent','ash_max_percent','taurine_min_percent','other_printed_guarantees']:
  if k not in ga: ri.append('ga_missing:'+k)
 cal=r.get('calorie_content') or {}
 for k in ['kcal_per_kg','kcal_per_unit','unit_name']:
  if k not in cal: ri.append('cal_missing:'+k)
 # source_verified strict evidence gate approximations
 if r.get('research_status')=='source_verified':
  if not r.get('formula_source'): ri.append('sv_formula_source_empty')
  if not r.get('source_accessed_at'): ri.append('sv_access_date_empty')
  if r.get('life_stage') is None: ri.append('sv_life_stage_null')
  # contract says complete printed GA and calories captured; null may be legitimate only if label truly lacks value and omission explained.
  essential=['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent']
  for k in essential:
   if ga.get(k) is None: ri.append('sv_ga_null:'+k)
  if cal.get('kcal_per_kg') is None and cal.get('kcal_per_unit') is None: ri.append('sv_calories_all_null')
  if r.get('barcode_scope') in {'multipack','case','tray'}:
   mc=r.get('multipack_contents')
   if not isinstance(mc,list) or not mc: ri.append('sv_multipack_contents_empty')
   else:
    for j,c in enumerate(mc,1):
     for k in ['upc','canonical_gtin14','standalone_upc','product_name','size','quantity','evidence_status','source_urls']:
      if k not in c: ri.append(f'child{j}_missing:{k}')
     if c.get('evidence_status') not in {'verified_inner_barcode','matched_standalone_sku','unresolved'}: ri.append(f'child{j}_bad_evidence_status')
     if not c.get('product_name'): ri.append(f'child{j}_name_empty')
     if not isinstance(c.get('quantity'),int) or c.get('quantity',0)<1: ri.append(f'child{j}_quantity_bad')
     if not isinstance(c.get('source_urls'),list) or not c.get('source_urls'): ri.append(f'child{j}_sources_empty')
     if c.get('upc') is not None:
      if not chk(c['upc']): ri.append(f'child{j}_invalid_upc')
      if c.get('canonical_gtin14') != str(c['upc']).zfill(14): ri.append(f'child{j}_bad_gtin14')
     elif c.get('canonical_gtin14') is not None: ri.append(f'child{j}_gtin_without_upc')
  elif r.get('barcode_scope')=='individual_unit':
   if r.get('multipack_contents')!=[]: ri.append('individual_multipack_contents_not_empty')
 if ri:
  issues.append((i,r.get('upc'),r.get('product_name'),ri))
  for x in ri:counters[x]=counters.get(x,0)+1
 else: clean.append(i)
print('TOTAL',len(d['records']))
print('STATUS_COUNTS', {s:sum(1 for r in d['records'] if r.get('research_status')==s) for s in statuses})
print('CLEAN_STRICT',len(clean))
print('ISSUE_RECORDS',len(issues))
print('ISSUE_COUNTS',json.dumps(counters,sort_keys=True))
for row in issues:
 print('ISSUE',json.dumps({'index':row[0],'upc':row[1],'name':row[2],'issues':row[3]},ensure_ascii=False))
