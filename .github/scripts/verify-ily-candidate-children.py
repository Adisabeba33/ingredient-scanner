import json
from pathlib import Path
d=json.loads(Path('research/deep-research-i-and-love-and-you.json').read_text())
by={r['upc']:r for r in d['records']}
for r in [x for x in d['records'] if x.get('research_status')=='candidate']:
    print('OUTER',r['upc'],r['product_name'])
    good=True
    for c in r.get('multipack_contents',[]):
        u=c.get('standalone_upc'); ch=by.get(u)
        if not ch:
            print(' CHILD_MISSING',u,c.get('product_name')); good=False; continue
        ga=ch.get('guaranteed_analysis') or {}; cal=ch.get('calorie_content') or {}
        print(' CHILD',u,'status',ch.get('research_status'),'name',ch.get('product_name'),'ingredients',bool(ch.get('ingredients_verbatim')),'GA',json.dumps(ga,ensure_ascii=False),'CAL',json.dumps(cal,ensure_ascii=False))
        if ch.get('research_status')!='source_verified' or not ch.get('ingredients_verbatim') or not ch.get('source_urls'):
            good=False
    print(' ALL_CHILD_EVIDENCE_OK',good)
