import json,re,urllib.request

def getj(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())

products=[]
for page in range(1,8):
    try:d=getj(f'https://iandloveandyou.com/products.json?limit=250&page={page}')
    except Exception as e:
        print('PAGEFAIL',page,e);break
    ps=d.get('products',[])
    if not ps:break
    products.extend(ps)

for p in products:
    title=p.get('title') or ''
    handle=p.get('handle') or ''
    body=re.sub('<[^>]+>',' ',p.get('body_html') or '')
    body=re.sub(r'\s+',' ',body)
    vs=[]
    for v in p.get('variants',[]):
        vt=v.get('title') or ''
        b=str(v.get('barcode') or '')
        if re.search(r'pack|count|ct|case',vt,re.I) or re.search(r'pack|variety',title,re.I):
            vs.append({'title':vt,'barcode':b,'sku':v.get('sku'),'available':v.get('available')})
    if vs or re.search(r'pack|variety',title,re.I):
        print('PRODUCT',json.dumps({'title':title,'handle':handle,'variants':vs,'body':body[:1800]},ensure_ascii=False))
