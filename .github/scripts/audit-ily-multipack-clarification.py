import json
from pathlib import Path
P=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(P.read_text())
by={r.get('upc'):r for r in d['records'] if r.get('upc')}
rows=[r for r in d['records'] if r.get('barcode_scope')=='multipack']
CORE=['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent','ash_max_percent','taurine_min_percent']
issues=[]; varieties=[]; singles=[]; empty=[]
for r in rows:
    for k in ('pack_count','unit_size','contains'):
        if k not in r: issues.append((r['upc'],'missing '+k))
    if not isinstance(r.get('contains'),list): issues.append((r['upc'],'contains not list'))
    mp=r.get('multipack_contents') or []
    identities=[]
    for c in mp:
        ident=(c.get('product_name'),c.get('size'))
        if ident not in identities: identities.append(ident)
    variety=len(identities)>1
    if variety:
        varieties.append(r['upc'])
        if r.get('ingredients_verbatim') is not None: issues.append((r['upc'],'variety ingredients_verbatim not null'))
        if r.get('ingredients_ordered_normalized') is not None: issues.append((r['upc'],'variety normalized not null'))
        ga=r.get('guaranteed_analysis') or {}
        for k in CORE:
            if ga.get(k) is not None: issues.append((r['upc'],'variety GA '+k+' not null'))
        if ga.get('other_printed_guarantees') not in ([],None): issues.append((r['upc'],'variety other GA not empty'))
        cal=r.get('calorie_content') or {}
        for k in ('kcal_per_kg','kcal_per_unit','unit_name'):
            if cal.get(k) is not None: issues.append((r['upc'],'variety calorie '+k+' not null'))
    else:
        singles.append(r['upc'])
        if r.get('ingredients_verbatim') is None: issues.append((r['upc'],'single ingredients null'))
        if r.get('guaranteed_analysis') is None: issues.append((r['upc'],'single GA missing'))
        if r.get('calorie_content') is None: issues.append((r['upc'],'single calorie missing'))
    if not r.get('contains'): empty.append(r['upc'])
    for code in r.get('contains') or []:
        if code==r.get('upc'): issues.append((r['upc'],'contains outer UPC'))
        target=by.get(code)
        if target and target.get('barcode_scope')!='individual_unit': issues.append((r['upc'],'contains non-individual '+code))
print('TOTAL',len(d['records']))
print('MULTIPACKS',len(rows))
print('SINGLES',len(singles))
print('VARIETIES',len(varieties))
print('EMPTY_CONTAINS',len(empty),','.join(empty))
print('ISSUES',len(issues))
for x in issues: print('ISSUE',x[0],x[1])
assert len(d['records'])==189
assert len(rows)==85
assert len(singles)==68
assert len(varieties)==17
assert not issues
print('ILY_MULTIPACK_CLARIFICATION_AUDIT_OK')
