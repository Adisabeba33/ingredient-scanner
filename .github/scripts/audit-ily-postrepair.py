import json
from pathlib import Path
p=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(p.read_text())
assert len(d['records'])==183
valid_status={'candidate','source_verified','needs_physical_label','rejected','promoted_to_seed'}
valid_scope={'individual_unit','multipack','case','tray','unknown'}
issues=[]

def chk(code):
 s=str(code)
 if not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); total=sum(x*(3 if i%2==0 else 1) for i,x in enumerate(reversed(ds[:-1])))
 return (10-total%10)%10==ds[-1]
for i,r in enumerate(d['records'],1):
 ri=[]
 for k in ['upc','canonical_gtin14','barcode_scope','multipack_contents','brand','product_name','variant','food_form','package_type','size','ingredients_verbatim','ingredients_ordered_normalized','guaranteed_analysis','calorie_content','formula_source','source_urls','source_accessed_at','conflicts','verification_notes','research_status']:
  if k not in r: ri.append('missing:'+k)
 if r.get('upc') and not chk(r['upc']): ri.append('invalid_upc')
 if r.get('canonical_gtin14') != str(r.get('upc','')).zfill(14): ri.append('bad_gtin14')
 if r.get('barcode_scope') not in valid_scope: ri.append('bad_scope')
 if r.get('research_status') not in valid_status: ri.append('bad_status')
 if r.get('brand')!='I and love and you': ri.append('bad_brand')
 if not isinstance(r.get('source_urls'),list) or not r.get('source_urls'): ri.append('sources_empty')
 if not isinstance(r.get('conflicts'),list): ri.append('conflicts_not_list')
 if not isinstance(r.get('verification_notes'),list) or not r.get('verification_notes'): ri.append('notes_empty')
 if r.get('barcode_scope')=='individual_unit' and r.get('multipack_contents')!=[]: ri.append('individual_has_children')
 if r.get('barcode_scope') in {'multipack','case','tray'}:
  mc=r.get('multipack_contents')
  if not isinstance(mc,list) or not mc: ri.append('outer_children_empty')
  else:
   for j,c in enumerate(mc,1):
    for k in ['upc','canonical_gtin14','standalone_upc','product_name','size','quantity','evidence_status','source_urls']:
     if k not in c: ri.append(f'child{j}_missing:{k}')
    if c.get('evidence_status') not in {'verified_inner_barcode','matched_standalone_sku','unresolved'}: ri.append(f'child{j}_bad_status')
    if not isinstance(c.get('quantity'),int) or c.get('quantity',0)<1: ri.append(f'child{j}_qty')
    if c.get('upc') is None:
     if c.get('canonical_gtin14') is not None: ri.append(f'child{j}_gtin_without_upc')
    else:
     if not chk(c['upc']): ri.append(f'child{j}_invalid_upc')
     if c.get('canonical_gtin14') != str(c['upc']).zfill(14): ri.append(f'child{j}_bad_gtin14')
 # source_verified gate: must have formula text, normalized order, formula source, access date, and enough evidence notes to explain any intentional nulls.
 if r.get('research_status')=='source_verified':
  if not isinstance(r.get('ingredients_verbatim'),str) or not r['ingredients_verbatim'].strip(): ri.append('sv_no_ingredients')
  if not isinstance(r.get('ingredients_ordered_normalized'),list) or not r['ingredients_ordered_normalized']: ri.append('sv_no_normalized')
  if not r.get('formula_source'): ri.append('sv_no_formula_source')
  if not r.get('source_accessed_at'): ri.append('sv_no_access_date')
  notes=' '.join(r.get('verification_notes') or []).lower()
  if r.get('life_stage') is None and 'life_stage remains null' not in notes: ri.append('sv_unexplained_life_stage_null')
  cal=r.get('calorie_content') or {}
  if cal.get('kcal_per_kg') is None and cal.get('kcal_per_unit') is None and 'calorie fields remain null' not in notes: ri.append('sv_unexplained_calorie_null')
  ga=r.get('guaranteed_analysis') or {}
  for k in ['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent']:
   if ga.get(k) is None:
    # permit component-specific values for multipacks only when explicitly documented
    if not ('parent crude_fat_min_percent remains null' in notes and k=='crude_fat_min_percent'):
     # treats/supplements may legitimately omit some GA values only if explicitly noted; otherwise fail
     if f'{k} remains null' not in notes:
      ri.append('sv_unexplained_ga_null:'+k)
 if ri: issues.append((i,r.get('upc'),r.get('research_status'),ri))
print('TOTAL',len(d['records']))
print('STATUS_COUNTS',{s:sum(1 for r in d['records'] if r.get('research_status')==s) for s in valid_status})
print('ISSUE_RECORDS',len(issues))
for x in issues: print('ISSUE',json.dumps({'index':x[0],'upc':x[1],'status':x[2],'issues':x[3]}))
if issues: raise SystemExit(1)
print('AUDIT_OK 183 records contract-consistent; source_verified gates pass under documented-null rules')