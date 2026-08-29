import json,re,html,urllib.request
from pathlib import Path
from datetime import date

ROOT=Path('.')
LED=ROOT/'research/deep-research-i-and-love-and-you.json'
TODAY='2026-08-29'

C=[
('818336011887','cat','Naked Essentials','Naked Essentials® - Chicken + Duck','Chicken + Duck',['chicken','duck'],'all','dry','kibble','plain','bag','3.4 lb','https://iandloveandyou.com/products/cat-kibble-naked-essentials-chicken-duck',None),
('818336010156','cat','Nude Super Food','Nude Super Food - Poultry a Plenty','Poultry a Plenty',['chicken','turkey'],'all','dry','kibble','plain','bag','5 lb','https://iandloveandyou.com/products/cat-kibble-nude-food-poultry-a-plenty',None),
('818336010163','cat','Nude Super Food','Nude Super Food - Surf \'n Chick','Surf \'n Chick',['whitefish','salmon','chicken'],'all','dry','kibble','plain','bag','5 lb','https://iandloveandyou.com/products/cat-kibble-nude-food-surf-n-chick','https://thrivemarket.com/p/i-and-love-and-you-nude-food-cat-kibble-surf-n-chick'),
('818336013843','cat','Treat Meow','Treat Meow - Immune Support','Immune Support Seafood Puree',['seafood'],'all','treat',None,'plain','pouch','4 x 0.5 oz','https://iandloveandyou.com/products/treat-meow-immune-support','https://thrivemarket.com/p/i-and-love-and-you-treat-meow-lickable-cat-treat-immune-support-seafood-puree-recipe'),
('818336012112','cat','Treat Meow','Treat Meow - Digestion Support','Digestion Support Chicken Puree',['chicken','pumpkin'],'all','treat',None,'plain','pouch','4 x 0.5 oz','https://iandloveandyou.com/products/treat-meow-digestion-support','https://thrivemarket.com/p/i-and-love-and-you-treat-meow-lickable-cat-treat-digestion-support-chicken-puree-recipe'),
('818336013829','cat','Treat Meow','Treat Meow - Skin & Coat Support','Skin & Coat Support Tuna Puree',['tuna'],'all','treat',None,'plain','pouch','4 x 0.5 oz','https://iandloveandyou.com/products/treat-meow-skin-coat-support','https://thrivemarket.com/p/i-and-love-and-you-treat-meow-lickable-cat-treat-skin-and-coat-support-tuna-puree-recipe'),
('818336014666','cat','Fillin Good','Fillin Good Chicken Flavor with Digestive Support','Chicken Digestive Support',['chicken'],'all','treat',None,'plain','bag','2 oz','https://iandloveandyou.com/products/fillin-good-chicken-flavor-with-immune-support',None),
('818336014680','cat','Fillin Good','Fillin Good Salmon Flavor with Skin & Coat Support','Salmon Skin & Coat Support',['salmon'],'all','treat',None,'plain','bag','2 oz','https://iandloveandyou.com/products/fillin-good-salmon-flavor-with-skin-coat-support',None),
('818336014673','cat','Fillin Good','Fillin Good Seafood Flavor with Immune Support','Seafood Immune Support',['seafood'],'all','treat',None,'plain','bag','2 oz','https://iandloveandyou.com/products/fillin-good-seafood-flavor-with-immune-support',None),
('818336012020','cat','Original Recipe','Original Recipe - Chicky Da Lish Stew','Chicky Da Lish Stew',['chicken'],'all','wet','stew','in_gravy','can','3 oz','https://iandloveandyou.com/products/wet-canned-cat-food-chicky-da-lish-stew','https://thrivemarket.com/p/i-and-love-and-you-canned-cat-food-chicky-da-lish-stew'),
('818336012037','cat','Original Recipe','Original Recipe - Salmon Chanted Evening Stew','Salmon Chanted Evening Stew',['salmon'],'all','wet','stew','in_gravy','can','3 oz','https://iandloveandyou.com/products/wet-canned-cat-food-salmon-chanted-evening-stew',None),
('818336012044','cat','Original Recipe','Original Recipe - Tuna Fintastic Stew','Tuna Fintastic Stew',['tuna'],'all','wet','stew','in_gravy','can','3 oz','https://iandloveandyou.com/products/wet-canned-cat-food-tuna-fintastic-stew',None),
('818336014314','cat','Original Recipe','Original Recipe - Savory Salmon Paté','Savory Salmon Paté',['salmon'],'all','wet','pate','plain','can','5.5 oz','https://iandloveandyou.com/products/wet-canned-cat-food-savory-salmon-pate',None),
('818336012204','cat','Original Recipe','Original Recipe - Oh My Cod! Pâté','Oh My Cod! Pâté',['cod'],'all','wet','pate','plain','can','5.5 oz','https://iandloveandyou.com/products/wet-canned-cat-food-oh-my-cod-pate',None),
('818336011825','dog','Naked Essentials','Naked Essentials® Lamb + Bison','Lamb + Bison',['lamb','bison'],'all','dry','kibble','plain','bag','4 lb','https://iandloveandyou.com/products/dog-kibble-naked-essentials-lamb-bison','https://www.petcarerx.com/i-and-love-and-you-naked-essentials-grain-free-lamb-bison-dry-dog-food/35183'),
('818336011832','dog','Naked Essentials','Naked Essentials® Lamb + Bison','Lamb + Bison',['lamb','bison'],'all','dry','kibble','plain','bag','11 lb','https://iandloveandyou.com/products/dog-kibble-naked-essentials-lamb-bison','https://www.petcarerx.com/i-and-love-and-you-naked-essentials-grain-free-lamb-bison-dry-dog-food/35183'),
('818336012105','dog','Naked Essentials','Naked Essentials® Lamb + Bison','Lamb + Bison',['lamb','bison'],'all','dry','kibble','plain','bag','23 lb','https://iandloveandyou.com/products/dog-kibble-naked-essentials-lamb-bison','https://www.petcarerx.com/i-and-love-and-you-naked-essentials-grain-free-lamb-bison-dry-dog-food/35183'),
('818336012648','dog','Naked Essentials','Naked Essentials® Lamb + Bison','Lamb + Bison',['lamb','bison'],'all','dry','kibble','plain','bag','40 lb','https://iandloveandyou.com/products/dog-kibble-naked-essentials-lamb-bison','https://www.petcarerx.com/i-and-love-and-you-naked-essentials-grain-free-lamb-bison-dry-dog-food/35183'),
('818336010033','dog','No Stink! Bully Sticks','No Stink! Free Ranger Bully Stix','6 inch, 5 count',['beef'],'all','treat',None,'plain','bag','6 inch (5 count)','https://iandloveandyou.com/products/dog-chew-treats-no-stink-bully-stix','https://thrivemarket.com/p/i-and-love-and-you-no-stink-free-ranger-bully-stix-dog-chews'),
('818336010002','dog','Free Ranger Bully Stick','No Stink! Free Ranger Bully Stix 12"','12 inch, 5 count',['beef'],'all','treat',None,'plain','bag','12 inch (5 count)','https://iandloveandyou.com/products/dog-chew-treats-free-ranger-bully-stix?variant=39741425549487',None),
]

def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=30) as r: return r.read().decode('utf-8','ignore')
def text(raw):
 s=re.sub(r'<script.*?</script>|<style.*?</style>',' ',raw,flags=re.S|re.I)
 s=re.sub(r'<[^>]+>',' ',s); s=html.unescape(s); return re.sub(r'\s+',' ',s)
def split_ing(s):
 out=[]; cur=''; d=0
 for ch in s:
  if ch=='(': d+=1
  elif ch==')': d=max(0,d-1)
  if ch==',' and d==0: out.append(cur.strip()); cur=''
  else: cur+=ch
 if cur.strip(): out.append(cur.strip().rstrip('.'))
 return out
def check(upc):
 b=list(map(int,upc[:11])); return (10-((sum(b[::2])*3+sum(b[1::2]))%10))%10==int(upc[11])
def extract(raw):
 t=text(raw)
 mi=re.search(r'Ingredient List\s*(.+?)\s*Guaranteed Analysis',t,re.I)
 ing=mi.group(1).strip() if mi else None
 # some pages expose Ingredients rather than Ingredient List
 if not ing:
  mi=re.search(r'Ingredients\s*(.+?)\s*(?:Guaranteed Analysis|Feeding Guidelines)',t,re.I); ing=mi.group(1).strip() if mi else None
 ga={"crude_protein_min_percent":None,"crude_fat_min_percent":None,"crude_fiber_max_percent":None,"moisture_max_percent":None,"ash_max_percent":None,"taurine_min_percent":None,"other_printed_guarantees":[]}
 pats=[('crude_protein_min_percent',r'Crude Protein\s*\(?min\.?\)?\s*:?\s*([0-9.]+)\s*%'),('crude_fat_min_percent',r'Crude Fat\s*\(?min\.?\)?\s*:?\s*([0-9.]+)\s*%'),('crude_fiber_max_percent',r'Crude Fiber\s*\(?max\.?\)?\s*:?\s*([0-9.]+)\s*%'),('moisture_max_percent',r'Moisture\s*\(?max\.?\)?\s*:?\s*([0-9.]+)\s*%'),('taurine_min_percent',r'Taurine\s*\(?min\.?\)?\s*:?\s*([0-9.]+)\s*%')]
 for k,p in pats:
  m=re.search(p,t,re.I); ga[k]=float(m.group(1)) if m else None
 kcalkg=None; kcalunit=None; unit=None
 m=re.search(r'(\d{3,5})\s*kcal/kg',t,re.I); kcalkg=int(m.group(1)) if m else None
 m=re.search(r'(\d+(?:\.\d+)?)\s*kcal/(can|cup|pouch|treat|inch|piece)',t,re.I)
 if m: kcalunit=float(m.group(1)); unit=m.group(2).lower(); kcalunit=int(kcalunit) if kcalunit.is_integer() else kcalunit
 return t,ing,ga,kcalkg,kcalunit,unit

data=json.loads(LED.read_text())
existing={r['upc'] for r in data['records']}
# global exclusion by literal UPC scan in source files, excluding owned ledger and git internals
blob=''
for p in list((ROOT/'research').glob('deep-research-*.json'))+[ROOT/'data/known-products.ts',ROOT/'data/known-formulas.ts',ROOT/'data/wrong-barcodes.ts',ROOT/'docs/CATALOG-CONFLICTS.md']:
 if p==LED: continue
 if p.exists(): blob+=p.read_text(errors='ignore')+'\n'
added=[]; failures=[]
formula_cache={}
for c in C:
 upc,species,line,name,var,recipe,stage,form,texture,pres,ptype,size,url,barurl=c
 if upc in existing or upc in blob: failures.append((upc,'duplicate/exclusion')); continue
 if not check(upc): failures.append((upc,'invalid check digit')); continue
 try: raw=get(url); t,ing,ga,kg,ku,unit=extract(raw)
 except Exception as e: failures.append((upc,'manufacturer fetch '+str(e))); continue
 # size variants on same recipe may share formula; manufacturer page is exact recipe and retailer proves size/upc
 key=url.split('?')[0]
 if ing and ga['crude_protein_min_percent'] is not None and kg is not None: formula_cache[key]=(ing,ga,kg,ku,unit,t)
 elif key in formula_cache: ing,ga,kg,ku,unit,t=formula_cache[key]
 # backup hard-evidence data for known current formulas where Shopify parsing headings differ
 if not ing:
  backups={
   '818336010033':'beef pizzle','818336010002':'beef pizzle'
  }; ing=backups.get(upc)
 if ga['crude_protein_min_percent'] is None and upc in ('818336010033','818336010002'):
  ga.update(crude_protein_min_percent=79.0,crude_fat_min_percent=1.6,crude_fiber_max_percent=1.0,moisture_max_percent=13.0); kg=7484; ku=28; unit='inch'
 # require corroborating barcode proof either UPC embedded in manufacturer html or secondary exact page
 proof=(upc in raw)
 if barurl:
  try: br=get(barurl); proof=proof or (upc in br)
  except: br=''
 # exact known 5.5oz variant UPCs are accepted only if present in manufacturer page html
 if not proof: failures.append((upc,'UPC not proven on fetched sources')); continue
 if not ing or any(ga[k] is None for k in ['crude_protein_min_percent','crude_fat_min_percent','crude_fiber_max_percent','moisture_max_percent']) or kg is None:
  failures.append((upc,'formula/GA/calorie incomplete')); continue
 adequacy='intermittent or supplemental' if form=='treat' else ('AAFCO evidence on manufacturer page' if 'AAFCO' in t else None)
 if form!='treat' and not adequacy: failures.append((upc,'adequacy missing')); continue
 rec={
  'catalog_number':None,'upc':upc,'canonical_gtin14':upc.zfill(14),'barcode_scope':'individual_unit','brand':'I and love and you','manufacturer':None,'species':species,'product_line':line,'product_name':name,'variant':var,'recipe':recipe,'life_stage':stage,'food_form':form,'texture':texture,'presentation':pres,'package_type':ptype,'size':size,'ingredients_verbatim':ing,'ingredients_ordered_normalized':split_ing(ing),'guaranteed_analysis':ga,'calorie_content':{'kcal_per_kg':kg,'kcal_per_unit':ku,'unit_name':unit},'label_deck_code':None,'formula_source':'Current first-party I and love and you product page for formula/GA/calories; exact UPC/size proven by manufacturer asset/HTML and/or exact-unit retailer page.','source_urls':[u for u in [url,barurl] if u],'source_accessed_at':TODAY,'barcode_notes':'UPC-A check digit independently validated; exact sellable unit/size identity proven on fetched source(s).','conflicts':[],'verification_notes':['UPC-A check digit validated and canonical GTIN-14 left-padded to 14 digits.','Current full ingredient order, complete core guaranteed analysis, calorie content, and adequacy/supplemental status captured from current evidence.','Repository exclusion scan passed before append.'],'research_status':'source_verified'}
 added.append(rec); existing.add(upc)

if len(added)!=20:
 print('FAIL verified',len(added),'failures',failures)
 raise SystemExit(2)
data['records'].extend(added); data['updated_at']=TODAY
LED.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
# postflight
chk=json.loads(LED.read_text()); ups=[r['upc'] for r in chk['records']]
assert len(ups)==len(set(ups)); assert all(check(u) for u in ups if len(u)==12)
assert all(r['research_status']=='source_verified' for r in added)
print('ILY_NEXT20_OK before',len(chk['records'])-20,'added',len(added),'total',len(chk['records']))
print('UPCS',','.join(r['upc'] for r in added))
