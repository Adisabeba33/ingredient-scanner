import json,urllib.request

def getj(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return json.loads(r.read().decode())
handles=[
'dog-chew-treats-nice-jerky-beef-lamb','dog-chew-treats-nice-jerky-chicken-duck','dog-chew-treats-nice-jerky-chicken-salmon',
'fillin-good-chicken-flavor-with-immune-support','fillin-good-seafood-flavor-with-immune-support','fillin-good-salmon-flavor-with-skin-coat-support',
'treat-meow-digestion-support','treat-meow-immune-support','treat-meow-skin-coat-support',
'dog-meal-enhancers-top-that-tummy-chicken-recipe','dog-meal-enhancers-top-that-shine-beef-recipe','dog-meal-enhancers-top-that-boost-duck-recipe',
'top-that-move-beef-with-bison-recipe-in-gravy','top-that-thrive-turkey-september-2025','top-that-wit-lamb-recipe-in-gravy','top-that-gaze-salmon-recipe-in-gravy',
'irresist-a-bowls-chicken-duck-recipe-1','irresist-a-bowls-chicken-beef-recipe'
]
for h in handles:
    print('HANDLE',h)
    try:
        d=getj('https://iandloveandyou.com/products/'+h+'.js')
        print(json.dumps([{'title':v.get('title'),'barcode':v.get('barcode'),'sku':v.get('sku'),'available':v.get('available')} for v in d.get('variants',[])],ensure_ascii=False))
    except Exception as e: print('FAIL',e)
