import json,re,urllib.request
from pathlib import Path
led=json.loads(Path('research/deep-research-i-and-love-and-you.json').read_text())
seen={r['upc'] for r in led['records']}
def getj(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())
def ok(s):
 if not s or not s.isdigit() or len(s) not in (12,13,14): return False
 ds=list(map(int,s)); body=ds[:-1]; chk=ds[-1]
 total=sum(d*(3 if i%2==0 else 1) for i,d in enumerate(reversed(body)))
 return (10-total%10)%10==chk
products=[]
for page in range(1,8):
 d=getj(f'https://iandloveandyou.com/products.json?limit=250&page={page}'); ps=d.get('products',[])
 if not ps: break
 products+=ps
for p in products:
 h=p['handle']; title=p['title']
 try:d=getj('https://iandloveandyou.com/products/'+h+'.js')
 except: continue
 for v in d.get('variants',[]):
  b=str(v.get('barcode') or ''); vt=v.get('title') or ''
  if v.get('available') and b not in seen and ok(b) and re.search(r'PACK|COUNT|CT|CASE',vt,re.I):
   print('CAND',json.dumps({'handle':h,'product':title,'variant':vt,'barcode':b,'sku':v.get('sku')},ensure_ascii=False))
