import json
from pathlib import Path

TARGET=Path('research/deep-research-royal-canin.json')
data=json.loads(TARGET.read_text(encoding='utf-8'))
records=data['records']
expected=[
'030111977649','030111477682','030111582911','030111582928','030111582935',
'030111930118','030111488831','030111927828','030111584021','030111583826'
]
assert len(records)==151, len(records)
upcs=[r['upc'] for r in records]
gtins=[r['canonical_gtin14'] for r in records]
assert len(upcs)==len(set(upcs))
assert len(gtins)==len(set(gtins))
for code in expected:
    assert upcs.count(code)==1, (code,upcs.count(code))
    row=next(r for r in records if r['upc']==code)
    assert row['brand']=='Royal Canin' and row['species']=='cat'
    assert row['barcode_scope']=='individual_unit'
    assert row['research_status']=='source_verified'
    assert row['ingredients_verbatim'].strip()
    assert row['ingredients_ordered_normalized']
    assert row['guaranteed_analysis'] and row['calorie_content'] and row['source_urls']
status={}
for r in records: status[r.get('research_status')]=status.get(r.get('research_status'),0)+1
assert status=={'source_verified':150,'needs_physical_label':1},status
print('REMOTE LEDGER VERIFIED')
print('Total records: 151')
print('Batch UPCs present exactly once: '+', '.join(expected))
print('Status counts: '+json.dumps(status,sort_keys=True))
