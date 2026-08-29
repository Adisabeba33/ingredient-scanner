import json
from pathlib import Path
P=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(P.read_text())
rows=[r for r in d['records'] if r.get('barcode_scope')=='multipack']
batch=rows[:20]
assert len(batch)==20
changed=[]
for r in batch:
    mp=r.get('multipack_contents') or []
    assert len(mp)==1,(r['upc'],'batch1 expected single-flavour')
    child=mp[0]
    qty=child.get('quantity')
    assert isinstance(qty,int) and qty>0,(r['upc'],'missing quantity')
    r['pack_count']=qty
    r['unit_size']=child.get('size')
    member=child.get('upc') or child.get('standalone_upc')
    r['contains']=[member] if member else []
    notes=r.setdefault('verification_notes',[])
    marker='2026-08-29 multipack clarification reissue: single-flavour multipack; top-level ingredients, guaranteed analysis and calories are retained because every contained unit is the same recipe.'
    if marker not in notes: notes.append(marker)
    if member:
        srcs=child.get('source_urls') or []
        n=f"2026-08-29 contains relation: outer UPC {r['upc']} contains individual/member UPC {member}; member identity is supported by multipack_contents evidence" + (f" including {srcs[0]}." if srcs else '.')
        if n not in notes: notes.append(n)
    else:
        n='2026-08-29 contains unresolved: no individual-unit UPC for the contained unit is proven in current evidence. Web recheck of Savory Salmon 5.5 oz found the current manufacturer 5.5 oz case listing and a secondary page exposing 00818336014314, which is the outer 12-pack GTIN itself, not a proven inner-can UPC; contains therefore remains empty rather than guessing.'
        if n not in notes: notes.append(n)
    changed.append(r['upc'])

# Validate new fields and non-destructive single-flavour behavior.
for r in batch:
    assert r['pack_count']>0
    assert 'unit_size' in r and 'contains' in r and isinstance(r['contains'],list)
    assert r.get('ingredients_verbatim') is not None
    assert r.get('guaranteed_analysis') is not None
    assert r.get('calorie_content') is not None
# Individual records untouched by this script.
assert len(d['records'])==189
assert len([r for r in d['records'] if r.get('barcode_scope')=='multipack'])==85
d['updated_at']='2026-08-29'
P.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('ILY_MULTIPACK_BATCH1_OK total=189 multipacks=85 reissued=20')
print('REISSUED',','.join(changed))
print('CONTAINS_EMPTY',','.join(r['upc'] for r in batch if not r['contains']))
