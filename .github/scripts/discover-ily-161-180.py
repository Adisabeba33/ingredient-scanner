import json,re,urllib.request
from pathlib import Path
ROOT=Path('.')
LED=ROOT/'research/deep-research-i-and-love-and-you.json'
led=json.loads(LED.read_text())
seen={r['upc'] for r in led['records']}
ex=''
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
 if p!=LED and p.exists(): ex+=p.read_text(errors='ignore')+'\n'
def getj(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())
def ok(s):
 if not s or not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(ds[:-1]))); return (10-total%10)%10==ds[-1]
products=[]
for page in range(1,8):
 d=getj(f'https://iandloveandyou.com/products.json?limit=250&page={page}'); ps=d.get('products',[])
 if not ps: break
 products+=ps
print('LEDGER',len(led['records']),'PRODUCTS',len(products))
for p in products:
 h=p['handle']; title=p['title']
 try:d=getj('https://iandloveandyou.com/products/'+h+'.js')
 except: continue
 for v in d.get('variants',[]):
  b=str(v.get('barcode') or '')
  if v.get('available') and b not in seen and b not in ex and ok(b):
   print('CAND',json.dumps({'handle':h,'product':title,'variant':v.get('title'),'barcode':b,'sku':v.get('sku'),'grams':v.get('grams')},ensure_ascii=False))
