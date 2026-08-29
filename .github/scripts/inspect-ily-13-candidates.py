import json
from pathlib import Path
p=Path('research/deep-research-i-and-love-and-you.json')
d=json.loads(p.read_text())
rows=[r for r in d['records'] if r.get('research_status')=='candidate']
print('CANDIDATES',len(rows))
for r in rows:
    print('---')
    print('UPC',r['upc'])
    print('NAME',r.get('product_name'))
    print('VARIANT',r.get('variant'))
    print('GA',json.dumps(r.get('guaranteed_analysis'),ensure_ascii=False))
    print('CAL',json.dumps(r.get('calorie_content'),ensure_ascii=False))
    print('CHILD',json.dumps(r.get('multipack_contents'),ensure_ascii=False))
    print('SOURCES',json.dumps(r.get('source_urls'),ensure_ascii=False))
    print('NOTES',json.dumps(r.get('verification_notes'),ensure_ascii=False))
