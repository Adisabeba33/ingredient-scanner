import json
from pathlib import Path
P=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(P.read_text())
by={r.get('upc'):r for r in d['records'] if r.get('upc')}
rows=[r for r in d['records'] if r.get('barcode_scope')=='multipack' and 'pack_count' not in r]
batch=rows[:20]
assert batch, 'no unprocessed multipacks'
CORE=['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent','ash_max_percent','taurine_min_percent']
changed=[]; varieties=[]; singles=[]; unresolved=[]
for r in batch:
    mp=r.get('multipack_contents') or []
    qtys=[c.get('quantity') for c in mp if isinstance(c.get('quantity'),int) and c.get('quantity')>0]
    r['pack_count']=sum(qtys) if qtys and len(qtys)==len(mp) else None
    sizes=[c.get('size') for c in mp if c.get('size')]
    r['unit_size']=sizes[0] if sizes and all(s==sizes[0] for s in sizes) else None
    # classify by distinct member recipe identity, not by barcode availability
    identities=[]
    for c in mp:
        ident=(c.get('product_name'),c.get('size'))
        if ident not in identities: identities.append(ident)
    variety=len(identities)>1
    member_codes=[]; missing=[]; proof_bits=[]
    for c in mp:
        code=c.get('upc') or c.get('standalone_upc')
        if code:
            existing=by.get(code)
            if existing is not None and existing.get('barcode_scope')!='individual_unit':
                code=None
        if code:
            if code not in member_codes: member_codes.append(code)
            srcs=c.get('source_urls') or []
            proof_bits.append(f"{c.get('product_name')} -> {code}" + (f" ({srcs[0]})" if srcs else ''))
        else:
            missing.append(c.get('product_name') or 'unnamed member')
    # clarification says if member UPCs cannot be proven, contains must be empty, not partial
    r['contains']=member_codes if not missing else []
    notes=r.setdefault('verification_notes',[])
    if variety:
        varieties.append(r['upc'])
        r['ingredients_verbatim']=None
        r['ingredients_ordered_normalized']=None
        r['guaranteed_analysis']={
            'crude_protein_min_percent':None,
            'crude_fat_min_percent':None,
            'crude_fiber_max_percent':None,
            'moisture_max_percent':None,
            'ash_max_percent':None,
            'taurine_min_percent':None,
            'other_printed_guarantees':[]
        }
        r['calorie_content']={'kcal_per_kg':None,'kcal_per_unit':None,'unit_name':None}
        r['formula_source']='Variety-pack barcode identity and member relationships only. This outer pack is not treated as a food formula; member formulas belong to the individual member products.'
        notes.append('2026-08-29 multipack clarification reissue: variety pack. Top-level ingredients, normalized ingredients, guaranteed analysis and calories were intentionally nulled because the outer box is not one food and must never be fingerprinted or scored as a formula.')
        names=', '.join(c.get('product_name') or 'unnamed member' for c in mp)
        notes.append(f'2026-08-29 variety members: {names}.')
    else:
        singles.append(r['upc'])
        notes.append('2026-08-29 multipack clarification reissue: single-flavour multipack. Top-level ingredients, guaranteed analysis and calories are retained because every contained unit is the same recipe.')
    if missing:
        unresolved.append(r['upc'])
        notes.append('2026-08-29 contains unresolved: one or more member UPCs are not proven, so contains is intentionally empty. Missing member UPC proof for: '+', '.join(missing)+'.')
    elif member_codes:
        notes.append('2026-08-29 contains relation proven: '+'; '.join(proof_bits)+'.')
    else:
        unresolved.append(r['upc'])
        notes.append('2026-08-29 contains unresolved: no member UPC could be proven from current evidence, so contains is intentionally empty.')
    # deduplicate notes preserving order
    ded=[]
    for n in notes:
        if n not in ded: ded.append(n)
    r['verification_notes']=ded
    changed.append(r['upc'])

# Validation for this batch
for r in batch:
    assert 'pack_count' in r and 'unit_size' in r and isinstance(r.get('contains'),list)
    mp=r.get('multipack_contents') or []
    identities=[]
    for c in mp:
        ident=(c.get('product_name'),c.get('size'))
        if ident not in identities: identities.append(ident)
    variety=len(identities)>1
    if variety:
        assert r['ingredients_verbatim'] is None
        assert r['ingredients_ordered_normalized'] is None
        assert all(r['guaranteed_analysis'][k] is None for k in CORE)
        assert r['guaranteed_analysis']['other_printed_guarantees']==[]
        assert all(r['calorie_content'][k] is None for k in ['kcal_per_kg','kcal_per_unit','unit_name'])
    else:
        assert r.get('ingredients_verbatim') is not None
        assert r.get('guaranteed_analysis') is not None
        assert r.get('calorie_content') is not None
assert len(d['records'])==189
assert len([r for r in d['records'] if r.get('barcode_scope')=='multipack'])==85
d['updated_at']='2026-08-29'
P.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(f'ILY_MULTIPACK_NEXT_OK processed={len(batch)} remaining={len(rows)-len(batch)} singles={len(singles)} varieties={len(varieties)} unresolved_contains={len(unresolved)}')
print('REISSUED',','.join(changed))
print('SINGLES',','.join(singles))
print('VARIETIES',','.join(varieties))
print('UNRESOLVED',','.join(unresolved))
