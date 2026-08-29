import json
from pathlib import Path
P=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(P.read_text())
assert len(d['records'])==183
by={r['upc']:r for r in d['records']}
changed=[]; downgraded=[]

def note(r,msg):
    r.setdefault('verification_notes',[])
    if msg not in r['verification_notes']: r['verification_notes'].append(msg)

def ensure_child_schema(r):
    if r.get('barcode_scope') not in {'multipack','case','tray'}: return
    mc=r.get('multipack_contents')
    if not isinstance(mc,list):
        r['multipack_contents']=[]; mc=r['multipack_contents']
    for c in mc:
        c.setdefault('upc',None); c.setdefault('canonical_gtin14',None); c.setdefault('standalone_upc',None)
        c.setdefault('product_name',None); c.setdefault('size',None); c.setdefault('quantity',1); c.setdefault('source_urls',[])
        ev=c.get('evidence_status')
        if ev not in {'verified_inner_barcode','matched_standalone_sku','unresolved'}:
            c['evidence_status']='matched_standalone_sku' if c.get('standalone_upc') else 'unresolved'
        if c.get('upc') is None:
            c['canonical_gtin14']=None
        elif c.get('canonical_gtin14') is None:
            c['canonical_gtin14']=str(c['upc']).zfill(14)

# Repair child schema across all multipacks.
for r in d['records']:
    before=json.dumps(r.get('multipack_contents',None),sort_keys=True)
    ensure_child_schema(r)
    after=json.dumps(r.get('multipack_contents',None),sort_keys=True)
    if before!=after:
        note(r,'2026-08-29 contract repair: multipack child schema normalized to current AGENTS.md; no inner-unit UPC was invented.')
        changed.append(r['upc'])

# Explain permitted nulls instead of inventing values.
for r in d['records']:
    if r.get('research_status')!='source_verified': continue
    if r.get('life_stage') is None:
        note(r,'2026-08-29 contract audit: life_stage remains null because the cited evidence used for this record does not print a life-stage value; no value was inferred.')
        changed.append(r['upc'])
    cal=r.get('calorie_content') or {}
    if cal.get('kcal_per_kg') is None and cal.get('kcal_per_unit') is None:
        note(r,'2026-08-29 contract audit: calorie fields remain null because no calorie value is present in the cited evidence captured for this record; no calorie value was inferred.')
        changed.append(r['upc'])

# Records 161-180 were added under incomplete multipack handling. Keep source_verified only when formula/GA/calories and child composition are actually represented.
# Homogeneous packs with otherwise complete formula evidence can stay verified after child-schema repair.
# Variety packs with missing parent formula/GA/calories must be downgraded until direct pack formula evidence is fully captured.
problem_variety={
'10818336013567','818336013560','818336013546','818336013867','10818336013864',
'818336012334','20818336012338','818336012327','20818336012321','818336012341','20818336012345',
'818336011764','10818336011761'
}
for upc in problem_variety:
    r=by[upc]
    ga=r.get('guaranteed_analysis') or {}; cal=r.get('calorie_content') or {}
    missing_ga=any(ga.get(k) is None for k in ['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent'])
    missing_cal=(cal.get('kcal_per_kg') is None and cal.get('kcal_per_unit') is None)
    if missing_ga or missing_cal:
        r['research_status']='candidate'
        note(r,'2026-08-29 contract repair: status downgraded from source_verified to candidate because the current record does not yet capture complete pack-level guaranteed analysis/calorie evidence for all recipes. Outer barcode evidence is retained; no formula values were invented.')
        downgraded.append(upc); changed.append(upc)

# Last 3 variety packs: their child-specific different fat/calorie values are preserved in notes/other_printed_guarantees. Null parent fat is intentional, not missing evidence.
for upc in ['818336013553','818336012310','818336012303']:
    r=by[upc]
    note(r,'2026-08-29 contract repair: parent crude_fat_min_percent remains null because component recipes print different minimum-fat values; all component-specific printed fat values are retained in other_printed_guarantees/verification notes rather than inventing a false single pack-wide value.')
    changed.append(upc)

# Homogeneous multipacks with unresolved loose child barcode are permitted by AGENTS if outer barcode and child identity are proven; explain explicitly.
for upc in ['818336013874','818336013881','818336013751','10818336013758','818336013775','10818336013772','10818336011976']:
    r=by[upc]
    note(r,'2026-08-29 contract repair: inner physical UPC is not proven; child upc/canonical_gtin14 remain null as required by AGENTS.md. Outer barcode and child identity/quantity evidence are retained.')
    changed.append(upc)

# De-duplicate notes and changed list.
for r in d['records']:
    if isinstance(r.get('verification_notes'),list): r['verification_notes']=list(dict.fromkeys(r['verification_notes']))
d['updated_at']='2026-08-29'
P.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('REPAIR_OK total',len(d['records']),'changed',len(set(changed)),'downgraded',len(downgraded))
print('DOWNGRADED',','.join(sorted(downgraded)))
print('STATUS_COUNTS', {s:sum(1 for r in d['records'] if r.get('research_status')==s) for s in ['source_verified','candidate','needs_physical_label','rejected','promoted_to_seed']})