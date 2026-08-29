import json
from pathlib import Path
p=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(p.read_text())
rows=[r for r in d['records'] if r.get('barcode_scope')=='multipack']
print('TOTAL',len(d['records']))
print('MULTIPACKS',len(rows))
for i,r in enumerate(rows[:25],1):
    mp=r.get('multipack_contents') or []
    names=[c.get('product_name') for c in mp]
    sus=[]
    for c in mp:
        sus.append(c.get('standalone_upc') or c.get('upc'))
    print('---',i)
    print('UPC',r.get('upc'))
    print('NAME',r.get('product_name'))
    print('SIZE',r.get('size'))
    print('VARIANT',r.get('variant'))
    print('CHILD_COUNT',len(mp),'NAMES',names)
    print('MEMBERS',sus)
