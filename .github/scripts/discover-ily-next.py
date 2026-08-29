import json,re,html,urllib.request
from pathlib import Path
ROOT=Path('.')
LED=ROOT/'research/deep-research-i-and-love-and-you.json'
ledger=json.loads(LED.read_text())
existing={r['upc'] for r in ledger['records']}
exblob=''
for p in list((ROOT/'research').glob('deep-research-*.json'))+[ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']:
    if p==LED: continue
    if p.exists(): exblob+=p.read_text(errors='ignore')+'\n'
def get(u):
    req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return r.read().decode('utf-8','ignore')
def check(u):
    if len(u)!=12 or not u.isdigit(): return False
    b=list(map(int,u[:11])); return (10-((sum(b[::2])*3+sum(b[1::2]))%10))%10==int(u[11])
handles=set()
for pg in range(1,6):
    try: raw=get('https://iandloveandyou.com/collections/shop-all?page='+str(pg))
    except Exception as e: print('COLLFAIL',pg,e); continue
    hs=set(re.findall(r'/products/([a-z0-9-]+)',raw))
    print('PAGE',pg,'HANDLES',len(hs)); handles |= hs
print('UNIQUE_HANDLES',len(handles))
rows=[]
for h in sorted(handles):
    u='https://iandloveandyou.com/products/'+h
    try:r=get(u)
    except Exception as e: print('FETCHFAIL',h,e);continue
    m=re.search(r'<h1[^>]*>(.*?)</h1>',r,re.S|re.I)
    title=re.sub('<[^>]+>',' ',html.unescape(m.group(1))).strip() if m else ''
    codes=sorted(set(re.findall(r'(?<!\d)(818336\d{6})(?!\d)',r)))
    flat=re.sub(r'\s+',' ',html.unescape(r))
    sizes=[]
    for x in re.findall(r'([0-9.]+\s*(?:LB|OZ)(?:\s+BAG|\s+CAN|\s+POUCH)?|[0-9]+\s*(?:COUNT|CT)|[0-9]+\s*INCH)',flat,re.I):
        if x.upper() not in [z.upper() for z in sizes]: sizes.append(x)
    for c in codes:
        if check(c) and c not in existing and c not in exblob:
            rows.append((c,title,h,sizes[:10]))
for row in rows: print('CAND',json.dumps(row,ensure_ascii=False))
print('NEW_CURRENT_CODES',len({r[0] for r in rows}))
