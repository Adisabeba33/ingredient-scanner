import json,re,urllib.request
from pathlib import Path
ROOT=Path('.')
led=json.loads((ROOT/'research/deep-research-i-and-love-and-you.json').read_text())
seen={r['upc'] for r in led['records']}
# Mandatory global exclusion corpus
for p in [ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']+list((ROOT/'research').glob('deep-research-*.json')):
    if p.exists() and p.name!='deep-research-i-and-love-and-you.json':
        seen.update(re.findall(r'(?<!\d)(\d{12,14})(?!\d)',p.read_text(errors='ignore')))
def getj(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())
# Shopify products API: current catalog, paginated
found=[]
for page in range(1,8):
    try:d=getj(f'https://iandloveandyou.com/products.json?limit=250&page={page}')
    except Exception as e: print('PAGEFAIL',page,e);break
    ps=d.get('products',[])
    if not ps:break
    for p in ps:
      for v in p.get('variants',[]):
        b=str(v.get('barcode') or '').strip()
        if re.fullmatch(r'\d{12}',b) and b not in seen:
          found.append({'upc':b,'product':p.get('title'),'handle':p.get('handle'),'variant':v.get('title'),'sku':v.get('sku'),'available':v.get('available')})
print('CURRENT_NEW',len(found))
for x in found:print(json.dumps(x,ensure_ascii=False))
