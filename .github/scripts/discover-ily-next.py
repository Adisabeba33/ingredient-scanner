import json,urllib.request

def getj(u):
    req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())
handles=['cat-kibble-naked-essentials-chicken-duck','cat-kibble-naked-essentials-salmon-trout','dog-kibble-baked-saucy-chicken-sweet-potato','dog-kibble-lovingly-simple-lamb-sweet-potato','dog-kibble-naked-essentials-ancient-grains-beef-lamb','dog-kibble-naked-essentials-ancient-grains-chicken-turkey','dog-kibble-naked-essentials-chicken-duck','braided-bully-sticks','dog-chew-treats-ear-candy-beef-ear-chews','dog-chew-treats-good-golly-gullet-stix']
for h in handles:
    try:
        d=getj('https://iandloveandyou.com/products/'+h+'.js')
        print('PRODUCT',h,d.get('title'))
        for v in d.get('variants',[]):
            print('VARIANT',json.dumps({'title':v.get('title'),'sku':v.get('sku'),'barcode':v.get('barcode'),'available':v.get('available'),'grams':v.get('grams')},ensure_ascii=False))
    except Exception as e: print('FAIL',h,e)
