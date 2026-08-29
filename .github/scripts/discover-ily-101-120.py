import json,urllib.request
for h in ['wet-canned-cat-food-purrky-turkey-pate','wet-canned-cat-food-savory-salmon-pate','wet-canned-cat-food-oh-my-cod-pate']:
  try:
    req=urllib.request.Request('https://iandloveandyou.com/products/'+h+'.js',headers={'User-Agent':'Mozilla/5.0'})
    d=json.loads(urllib.request.urlopen(req,timeout=30).read().decode())
    print('PRODUCT',h)
    for v in d.get('variants',[]): print(json.dumps({'title':v.get('title'),'barcode':v.get('barcode'),'sku':v.get('sku')},ensure_ascii=False))
  except Exception as e: print('FAIL',h,e)
