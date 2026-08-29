import json,re,urllib.request

def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=30) as r:return r.read().decode('utf-8','ignore')
def getj(url): return json.loads(get(url))

handles=[
'feed-meow-variety-pack','treat-meow-variety-pack',
'xoxo-chicken-beef-pate-variety-pack','xoxo-salmon-whitefish-pate-variety-pack','xoxo-chicken-tuna-stew-variety-pack',
'wet-canned-cat-food-variety-pack-pate-all-day','wet-canned-cat-food-variety-pack-ninja-cat-jiu-jit-stew','wet-canned-cat-food-variety-pack-farm-to-sea',
'dog-can-variety-pack-stew-cluckin-good-stew-gobble-it-up-stew','dog-can-variety-pack-stew-beef-booyah-stew-moo-moo-venison-stew','dog-can-variety-pack-stew-beef-booyah-stew-lambarama-stew',
'wet-canned-cat-food-purrky-turkey-pate','wet-canned-cat-food-savory-salmon-pate','wet-canned-cat-food-oh-my-cod-pate','wet-canned-cat-food-chicken-me-out-pate','wet-canned-cat-food-beef-right-meow-pate','wet-canned-cat-food-whascally-wabbit-pate','wet-canned-cat-food-salmon-chanted-evening-stew','wet-canned-cat-food-tuna-fintastic-stew'
]
for h in handles:
    print('HANDLE',h)
    try:
        d=getj('https://iandloveandyou.com/products/'+h+'.js')
        print('JS',json.dumps([{'title':v.get('title'),'barcode':v.get('barcode'),'sku':v.get('sku'),'available':v.get('available')} for v in d.get('variants',[])],ensure_ascii=False))
    except Exception as e: print('JSFAIL',e)
    try:
        html=get('https://iandloveandyou.com/products/'+h)
        codes=sorted(set(re.findall(r'(?<!\d)(818336\d{6})(?!\d)',html)))
        print('CODES',codes)
        for c in codes:
            for m in re.finditer(c,html):
                s=max(0,m.start()-220);e=min(len(html),m.end()+220)
                ctx=re.sub(r'\s+',' ',html[s:e])
                print('CTX',c,ctx[:500])
                break
    except Exception as e: print('HTMLFAIL',e)
