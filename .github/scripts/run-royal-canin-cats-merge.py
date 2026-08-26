import json
from pathlib import Path

TARGET=Path('research/deep-research-royal-canin.json')
data=json.loads(TARGET.read_text(encoding='utf-8'))
records=data['records']
expected=[
'030111488848','030111584458','030111588005','030111588029','030111553034',
'030111735539','030111700919','030111715531','030111715289','030111716651'
]
assert len(records)==141, len(records)
upcs=[r['upc'] for r in records]
assert len(upcs)==len(set(upcs))
for code in expected:
    assert upcs.count(code)==1, (code,upcs.count(code))
    row=next(r for r in records if r['upc']==code)
    assert row['brand']=='Royal Canin' and row['species']=='cat'
    assert row['barcode_scope']=='individual_unit'
    assert row['research_status']=='source_verified'
    assert row['ingredients_verbatim'].strip()
    assert row['ingredients_ordered_normalized']
    assert row['source_urls']
status={}
for r in records: status[r.get('research_status')]=status.get(r.get('research_status'),0)+1
assert status=={'source_verified':140,'needs_physical_label':1},status
print('REMOTE LEDGER VERIFIED')
print('Total records: 141')
print('Batch UPCs present exactly once: '+', '.join(expected))
print('Status counts: '+json.dumps(status,sort_keys=True))
