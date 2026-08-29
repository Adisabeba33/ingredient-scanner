import json, subprocess, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
TARGET=ROOT/'research/deep-research-i-and-love-and-you.json'

def show(commit,path):
    return json.loads(subprocess.check_output(['git','show',f'{commit}:{path}'],cwd=ROOT,text=True))

def split_top(s):
    s=s.strip().rstrip('.')
    out=[]; cur=[]; depth=0
    for ch in s:
        if ch=='(': depth+=1
        elif ch==')' and depth: depth-=1
        if ch==',' and depth==0:
            v=''.join(cur).strip()
            if v: out.append(v)
            cur=[]
        else: cur.append(ch)
    v=''.join(cur).strip()
    if v: out.append(v)
    return out

def check_upc(u):
    if not re.fullmatch(r'\d{12}',u): return False
    s=sum(int(u[i])*(3 if i%2==0 else 1) for i in range(11))
    return (10-s%10)%10==int(u[-1])

def ga(p,f,fi,m,t=None,other=None):
    return {'crude_protein_min_percent':p,'crude_fat_min_percent':f,'crude_fiber_max_percent':fi,'moisture_max_percent':m,'ash_max_percent':None,'taurine_min_percent':t,'other_printed_guarantees':other or []}

def n(nutrient,basis,value,unit='percent'): return {'nutrient':nutrient,'basis':basis,'value':value,'unit':unit}

b2=show('80adf5f540a0c68b9c405243bd0b6fd37af546c8','research/deep-research-i-and-love-and-you-batch-02.json')
b3=show('a2bbcb250ccb01d73e65649696e4e48ccc78c6a2','research/deep-research-i-and-love-and-you-batch-03.json')
b4=show('0d6ecf2d43aa009409a9e5621df9bce9a3e069ff','research/deep-research-i-and-love-and-you-batch-04.json')
base=json.loads(TARGET.read_text())

UNFI='https://img1.wsimg.com/blobby/go/aa7b10cd-c46b-4154-9e6a-5baa0913363d/UNFI%20jan_jun%202025.pdf'
UNFI2='https://briarpatch.coop/wp-content/uploads/2023/04/UNFI-Catalog-Sep-MarC.pdf'

FORMULAS={}
def add(key, ingredients, guaranteed, kcal, adequacy, recipe, variant=None, texture=None, presentation='plain', form='dry'):
    FORMULAS[key]={'ingredients_verbatim':ingredients,'guaranteed_analysis':guaranteed,'calorie_content':kcal,'life_stage':adequacy,'recipe':recipe,'variant':variant or key,'texture':texture,'presentation':presentation,'food_form':form}

add('Poultry Palooza', b3['records'][0]['ingredients_verbatim'], ga(34,13,4,10,.1,[n('EPA','min',.02),n('DHA','min',.03),n('Omega 6 Fatty Acids','min',2.3),n('Omega 3 Fatty Acids','min',.5),n('Total Microorganisms','min',10000000,'other'),n('Fungal Amylase','min',400,'other'),n('Protease','min',40,'other'),n('Cellulase','min',20,'other'),n('Lipase','min',10,'other')]), {'kcal_per_kg':3431,'kcal_per_unit':387,'unit_name':'cup'}, 'all',['chicken','turkey'])
add('Red Meat Medley', b3['records'][2]['ingredients_verbatim'], ga(34,14,4,10,.1,[n('EPA','min',.04),n('DHA','min',.03),n('Omega 6 Fatty Acids','min',2.3),n('Omega 3 Fatty Acids','min',.5),n('Total Microorganisms','min',10000000,'other'),n('Fungal Amylase','min',400,'other'),n('Protease','min',40,'other'),n('Cellulase','min',20,'other'),n('Lipase','min',10,'other')]), {'kcal_per_kg':3450,'kcal_per_unit':419,'unit_name':'cup'}, 'all',['beef','bison'])
add('Simply Sea', b3['records'][4]['ingredients_verbatim'], ga(34,13,4,10,.1,[n('EPA','min',.04),n('DHA','min',.03),n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',.5),n('Total Microorganisms','min',10000000,'other'),n('Fungal Amylase','min',400,'other'),n('Protease','min',40,'other'),n('Cellulase','min',20,'other'),n('Lipase','min',10,'other')]), {'kcal_per_kg':3399,'kcal_per_unit':385,'unit_name':'cup'}, 'all',['whitefish','salmon'])
add('Beef + Sweet Potato', b3['records'][6]['ingredients_verbatim'], ga(28,16,5,10,.1,[n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',.7),n('Total Microorganisms','min',10000000,'other')]), {'kcal_per_kg':3533,'kcal_per_unit':551,'unit_name':'cup'}, 'all',['beef','sweet potato'])
add('Chicken + Sweet Potato', b3['records'][9]['ingredients_verbatim'], ga(28,17,5,10,.1,[n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',.7),n('Total Microorganisms','min',10000000,'other')]), {'kcal_per_kg':3554,'kcal_per_unit':565,'unit_name':'cup'}, 'all',['chicken','sweet potato'])
add('Beef + Lamb', b3['records'][11]['ingredients_verbatim'], ga(30,15,5,10,.1,[n('Methionine','min',.5),n('Vitamin E','min',50,'IU/kg'),n('Omega 6 Fatty Acids','min',2),n('Omega 3 Fatty Acids','min',.5),n('L-Carnitine','min',50,'other'),n('Total Microorganisms','min',50000000,'other')]), {'kcal_per_kg':3480,'kcal_per_unit':380,'unit_name':'cup'}, 'all',['beef','lamb'])
add('Chicken + Turkey', b3['records'][12]['ingredients_verbatim'], ga(30,15,5,10,.1,[n('Methionine','min',.5),n('Vitamin E','min',50,'IU/kg'),n('Omega 6 Fatty Acids','min',2),n('Omega 3 Fatty Acids','min',.5),n('L-Carnitine','min',50,'other'),n('Total Microorganisms','min',50000000,'other')]), {'kcal_per_kg':3480,'kcal_per_unit':380,'unit_name':'cup'}, 'all',['chicken','turkey'])
for idx,name,recipe,kcal,fat in [(13,'Beef Booyah Stew',['beef'],(824,304),2.5),(14,"Cluckin' Good Stew",['chicken'],(852,314),3),(15,'Gobble It Up Stew',['turkey'],(837,309),3),(16,'Moo Moo Venison Stew',['beef','venison'],(829,306),3)]:
    add(name,b3['records'][idx]['ingredients_verbatim'],ga(7.5,fat,1,82),{'kcal_per_kg':kcal[0],'kcal_per_unit':kcal[1],'unit_name':'can'},'all',recipe,texture='stew',presentation='in_gravy',form='wet')
add('Chicken + Duck', b3['records'][17]['ingredients_verbatim'], ga(30,14,4.5,10,.1,[n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',.65),n('Total Microorganisms (CFB/lb as printed)','min',10000000,'other')]), {'kcal_per_kg':3524,'kcal_per_unit':412,'unit_name':'cup'}, 'all',['chicken','duck'])
add('Top That Tummy - Chicken Recipe', b3['records'][19]['ingredients_verbatim'], ga(8,4,3.5,82,None,[n('Vitamin E','min',25,'IU/kg'),n('Ascorbic Acid (Vitamin C)','min',20,'other'),n('Omega 6 Fatty Acids','min',.4),n('Omega 3 Fatty Acids','min',.1),n('L-Carnitine','min',10,'other')]), {'kcal_per_kg':891,'kcal_per_unit':76,'unit_name':'pouch'}, None,['chicken'],'Tummy - Chicken Recipe',texture='stew',presentation='in_gravy',form='supplement')

LAMB='Lamb, Chicken Meal, Dried Peas, Turkey Meal, Dried Garbanzo Beans, Tapioca Starch, Dried Sweet Potatoes, Chicken Fat (Preserved With Mixed Tocopherols), Flaxseeds, Gelatin, Ground Miscanthus Grass, Dried Egg Product, Dicalcium Phosphate, Salt, Natural Flavor, Sodium Carboxymethylcellulose, Fish Oil, L-Threonine, Yucca Schidigera Extract, Dried Chicory Root, Dl-Methionine, Chicken Bone Broth, Taurine, Citric Acid (Preservative), Mixed Tocopherols (Preservative), Vitamin E Supplement, Ferrous Sulfate, Iron Amino Acid Chelate, Zinc Amino Acid Chelate, Zinc Oxide, Choline Chloride, Copper Sulfate, Sodium Selenite, Niacin Supplement, D-Calcium Pantothenate, Copper Amino Acid Chelate, Manganese Amino Acid Chelate, Riboflavin Supplement, Vitamin A Supplement, Manganous Oxide, Dried Bacillus Coagulans Fermentation Product, Thiamine Mononitrate, Vitamin D3 Supplement, Vitamin B12 Supplement, Pyridoxine Hydrochloride, Calcium Iodate, Folic Acid, Rosemary Extract.'
add('Lamb + Sweet Potato',LAMB,ga(28,16,5,10,.1,[n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',.7),n('Total Microorganisms','min',10000000,'other')]),{'kcal_per_kg':3506,'kcal_per_unit':547,'unit_name':'cup'},'all',['lamb','sweet potato'])
TURKEY=b4['records'][3]['ingredients_verbatim']
add('Raw Raw Turk Boom Ba',TURKEY,ga(26,10,4,12),{'kcal_per_kg':3433,'kcal_per_unit':400,'unit_name':'cup'},'adult',['turkey'],'Turkey',presentation='plain',form='dry')
CHICK='Chicken Hearts, Peas, Chickpea Flour, Dried Egg Product, Flaxseed, Carrots, Parsnip, Kale, Coconut, Cranberries, Tricalcium Phosphate, Dried Kelp, Ginger Root, Mixed Tocopherols added to preserve freshness, Taurine, Zinc Sulfate, Vitamin E Supplement, Ferrous Fumarate, Copper Sulfate, d-Calcium Pantothenate, Vitamin D3 Supplement, Riboflavin, Pyridoxine Hydrochloride, Folic Acid, Rosemary Extract, Green Tea Extract.'
add('Raw Raw Chick Boom Ba',CHICK,ga(26,10,5,12),{'kcal_per_kg':3576,'kcal_per_unit':447,'unit_name':'cup'},'adult',['chicken'],'Chicken',presentation='plain',form='dry')
BEEF='Beef, Sweet Potatoes, Chickpea Flour, Carrots, Cabbage, Dried Egg Product, Flaxseed, Cranberries, Tricalcium Phosphate, Parsley, Dried Kelp, Papaya, Pumpkin, Ginger Root, Mixed Tocopherols added to preserve freshness, Taurine, Zinc Sulfate, Vitamin E Supplement, Ferrous Fumarate, Copper Sulfate, d-Calcium Pantothenate, Vitamin D3 Supplement, Riboflavin, Pyridoxine Hydrochloride, Folic Acid, Rosemary Extract, Green Tea Extract.'
add('Raw Raw Beef Boom Ba',BEEF,ga(22,12,5.5,12),{'kcal_per_kg':3391,'kcal_per_unit':333,'unit_name':'cup'},'adult',['beef'],'Beef',presentation='plain',form='dry')
SHINE='Beef, Beef Broth, Lamb Broth, Beef Liver, Pea Flour, Dried Egg Whites, Chicken Fat, Ground Flaxseeds, Sunflower Oil, Salt, Sodium Phosphate, Guar Gum, Natural Flavor, Sodium Carbonate, Fructooligosaccharide, Fish Oil, Zinc Proteinate, Vitamin E Supplement, L-ascorbyl-2 polyphosphate (Source Of Vitamin C).'
SHINE_GA=ga(8,3,1.5,82,None,[n('Eicosapentaenoic Acid (EPA)','min',.025),n('Docosahexaenoic Acid (DHA)','min',.025),n('Zinc','min',50,'other'),n('Vitamin E','min',50,'IU/kg'),n('Ascorbic Acid (Vitamin C)','min',25,'other'),n('Omega 6 Fatty Acids','min',.70),n('Omega 3 Fatty Acids','min',.15)])
add('Shine - Beef Recipe',SHINE,SHINE_GA,{'kcal_per_kg':847,'kcal_per_unit':72,'unit_name':'pouch'},None,['beef'],'Shine - Beef Recipe',texture='stew',presentation='in_gravy',form='supplement')
BOOST='Duck, Duck Broth, Chicken Broth, Chicken, Chicken Liver, Dried Egg Whites, Pea Flour, Pumpkin, Cranberries, Guar Gum, Dried Egg Product, Salt, Sodium Phosphate, Natural Flavor, Sodium Carbonate.'
add('Boost - Duck Recipe',BOOST,ga(8,3,2,82),{'kcal_per_kg':863,'kcal_per_unit':73,'unit_name':'pouch'},None,['duck'],'Boost - Duck Recipe',texture='stew',presentation='in_gravy',form='supplement')
MOVE='Beef, Beef Broth, Lamb Broth, Beef Liver, Bison, Dried Peas, Natural Flavor, Dried Egg Product, Pea Fiber, Chicken Fat, Guar Gum, Salt, Ground Flaxseed, Sodium Phosphate, Fish Oil (Preserved With Mixed Tocopherols), Sodium Carbonate, Zinc Proteinate, L-Carnitine, L-ascorbyl-2-polyphosphate (Source Of Vitamin C).'
add('Move - Beef with Bison Recipe in Gravy',MOVE,SHINE_GA,{'kcal_per_kg':847,'kcal_per_unit':72,'unit_name':'pouch'},None,['beef','bison'],'Move - Beef with Bison Recipe in Gravy',texture='stew',presentation='in_gravy',form='supplement')
GAZE=b4['records'][12]['ingredients_verbatim']
add('Gaze - Salmon Recipe in Gravy',GAZE,SHINE_GA,{'kcal_per_kg':847,'kcal_per_unit':72,'unit_name':'pouch'},None,['salmon'],'Gaze - Salmon Recipe in Gravy',texture='stew',presentation='in_gravy',form='supplement')
THRIVE='Turkey, Turkey Broth, Chicken Broth, Chicken, Turkey Liver, Dried Peas, Natural Flavor, Dried Egg Product, Pea Fiber, Guar Gum, Salt, Sodium Phosphate, Marine Microalgae Oil, Sodium Carbonate, Taurine, L-Carnitine.'
add('Thrive - Turkey Recipe in Gravy',THRIVE,ga(8,4,1.5,82,.02,[n('L-Carnitine','min',25,'other')]),{'kcal_per_kg':878,'kcal_per_unit':75,'unit_name':'pouch'},None,['turkey'],'Thrive - Turkey Recipe in Gravy',texture='stew',presentation='in_gravy',form='supplement')
WIT='Lamb, Lamb Broth, Beef Broth, Chicken, Lamb Liver, Dried Peas, Natural Flavor, Dried Egg Product, Pea Fiber, Guar Gum, Salt, Marine Microalgae Oil, Sodium Phosphate, Sodium Carbonate.'
add('Wit - Lamb Recipe in Gravy',WIT,ga(8,5,1.5,82,None,[n('Docosahexaenoic Acid (DHA)','min',.02)]),{'kcal_per_kg':1037,'kcal_per_unit':88,'unit_name':'pouch'},None,['lamb'],'Wit - Lamb Recipe in Gravy',texture='stew',presentation='in_gravy',form='supplement')
add('Chicken + Duck Jerky',b4['records'][15]['ingredients_verbatim'],ga(26,12,2,82),{'kcal_per_kg':3352,'kcal_per_unit':96,'unit_name':'piece'},None,['chicken','duck'],'Chicken + Duck',form='treat')
add('Chicken + Salmon Jerky',b4['records'][16]['ingredients_verbatim'],ga(27,11,2,82),{'kcal_per_kg':3259,'kcal_per_unit':93,'unit_name':'piece'},None,['chicken','salmon'],'Chicken + Salmon',form='treat')
BL='Beef, lamb, pea flour, vegetable glycerin, cane molasses, salt, natural smoke flavor, rosemary extract.'
add('Beef + Lamb Jerky',BL,ga(22,15,2,82),{'kcal_per_kg':None,'kcal_per_unit':None,'unit_name':None},None,['beef','lamb'],'Beef + Lamb',form='treat')
PUP=b4['records'][18]['ingredients_verbatim']
add('Chicken + Lentil Puppy',PUP,ga(32,15,5,10,None,[n('DHA','min',.05),n('Calcium','min',1.2),n('Vitamin A','min',10000,'IU/kg'),n('Vitamin E','min',150,'IU/kg'),n('Omega 3 Fatty Acids','min',.5),n('Omega 6 Fatty Acids','min',2.2),n('Total Microorganisms','min',1000000,'other')]),{'kcal_per_kg':3554,'kcal_per_unit':462,'unit_name':'cup'},'puppy',['chicken','lentil'],'Chicken + Lentil')
LS=b4['records'][19]['ingredients_verbatim']
add('Lovingly Simple Lamb + Sweet Potato',LS,ga(30,13,5,10,.1,[n('Zinc','min',125,'other'),n('Vitamin A','min',5000,'IU/kg'),n('Vitamin E','min',150,'IU/kg'),n('Omega 6 Fatty Acids','min',2.5),n('Omega 3 Fatty Acids','min',1),n('Total Microorganisms','min',10000000,'other')]),{'kcal_per_kg':3414,'kcal_per_unit':331,'unit_name':'cup'},'all',['lamb','sweet potato'],'Lamb + Sweet Potato')

# Match historical records to canonical formula keys.
def fkey(r):
    pn=r['product_name']
    if pn in FORMULAS: return pn
    if r.get('product_line')=='Baked & Saucy': return pn
    if r.get('product_line')=='Nice Jerky!':
        if 'Beef + Lamb' in pn:return 'Beef + Lamb Jerky'
        if 'Chicken + Salmon' in pn:return 'Chicken + Salmon Jerky'
        return 'Chicken + Duck Jerky'
    if r.get('product_line')=='Naked Essentials Puppy': return 'Chicken + Lentil Puppy'
    if r.get('product_line')=='Lovingly Simple': return 'Lovingly Simple Lamb + Sweet Potato'
    return pn

# Web-resolved contradiction notes for two first-party Top That PDPs.
CONFLICTS={
 '818336014222':['Current manufacturer page title/marketing identifies Turkey, but its HTML ingredient module currently displays a Beef formula. Exact current Chewy listing for the Turkey SKU supplies the Turkey formula, matching the product identity and current calories/GA; retailer formula used to resolve the manufacturer HTML defect.'],
 '818336014581':['Current manufacturer page title/marketing identifies Lamb, but its HTML ingredient module currently displays a Beef formula. Exact current Chewy listing for the Lamb SKU supplies the Lamb formula, matching current calories/GA; retailer formula used to resolve the manufacturer HTML defect.']
}

records=[]
for r in b2['records']:
    x=dict(r); x['ingredients_ordered_normalized']=split_top(x['ingredients_verbatim']); x['catalog_number']=None
    records.append(x)

for src in (b3['records'],b4['records']):
  for r in src:
    key=fkey(r); f=FORMULAS.get(key)
    if not f: raise SystemExit(f'No formula mapping for {r["upc"]} {key}')
    x={
      'catalog_number':None,'upc':r['upc'],'canonical_gtin14':r['canonical_gtin14'],'barcode_scope':'individual_unit','brand':'I and love and you','manufacturer':None,
      'species':'dog','product_line':r.get('product_line'),'product_name':r['product_name'],'variant':f['variant'],'recipe':f['recipe'],'life_stage':f['life_stage'],'food_form':f['food_form'],'texture':f['texture'],'presentation':f['presentation'],'package_type':r['package_type'],'size':r['size'],
      'ingredients_verbatim':f['ingredients_verbatim'],'ingredients_ordered_normalized':split_top(f['ingredients_verbatim']),'guaranteed_analysis':f['guaranteed_analysis'],'calorie_content':f['calorie_content'],'label_deck_code':None,
      'formula_source':'Current first-party I and love and you exact product page supplies the current formula, complete guaranteed analysis, calories, and adequacy/feeding statement. Exact retailer/distributor evidence supplies or corroborates the individual UPC-to-size identity. For UPCs 818336014222 and 818336014581, a current exact Chewy SKU formula resolves a documented defect in the manufacturer HTML ingredient module.',
      'source_urls':list(dict.fromkeys((r.get('source_urls') or [])+[UNFI,UNFI2])),'source_accessed_at':'2026-08-29',
      'barcode_notes':'Historical distributor/retailer evidence maps this valid UPC-A to the exact individual sellable size; UPC-A check digit was independently recomputed during the 2026-08-29 repair pass.',
      'conflicts':CONFLICTS.get(r['upc'],[]),
      'verification_notes':['UPC-A check digit independently validated.','Canonical GTIN-14 is UPC-A left-padded with two zeros.','Record rebuilt to the full research/AGENTS.md contract; formula fields are expanded on this size rather than referenced by sibling UPC.','Repository code search for manufacturer prefix 818336 returned no pre-existing catalog/research collision outside this I and love and you campaign before consolidation.'],
      'research_status':'source_verified'
    }
    # Product-specific corroborating exact retailer pages for the two HTML-conflict toppers.
    if x['upc']=='818336014222': x['source_urls'].append('https://www.chewy.com/i-love-you-top-that-thrive-turkey/dp/3626006')
    if x['upc']=='818336014581': x['source_urls'].append('https://www.chewy.com/i-love-you-top-that-wit-lamb-recipe/dp/3625982')
    # Nice Jerky Beef+Lamb current manufacturer page does not print calorie content; missing is explicit, not invented.
    if x['upc']=='818336012051':
      x['source_urls'].append('https://iandloveandyou.com/products/dog-chew-treats-nice-jerky-beef-lamb')
      x['verification_notes'].append('Current manufacturer page prints ingredients and GA but exposes no calorie statement in retrieved label/PDP text; calorie fields remain null rather than inferred.')
    records.append(x)

existing={r['upc'] for r in base['records']}
assert len(existing)==10
assert len(records)==50 and len({r['upc'] for r in records})==50
assert not existing.intersection(r['upc'] for r in records)

required=['catalog_number','upc','canonical_gtin14','barcode_scope','brand','manufacturer','species','product_line','product_name','variant','recipe','life_stage','food_form','texture','presentation','package_type','size','ingredients_verbatim','ingredients_ordered_normalized','guaranteed_analysis','calorie_content','label_deck_code','formula_source','source_urls','source_accessed_at','barcode_notes','conflicts','verification_notes','research_status']
for x in records:
    miss=[k for k in required if k not in x]
    assert not miss,(x['upc'],miss)
    assert check_upc(x['upc']),x['upc']
    assert x['canonical_gtin14']==x['upc'].zfill(14)
    assert x['ingredients_verbatim'] and x['ingredients_ordered_normalized']
    assert x['source_urls'] and x['source_accessed_at']=='2026-08-29'
    assert x['food_form'] in {'wet','dry','treat','supplement','unknown'}
    assert x['life_stage'] in {'adult','senior','kitten','puppy','all',None}
    assert x['research_status']=='source_verified'

base['updated_at']='2026-08-29'
base['records'].extend(records)
assert len(base['records'])==60
TARGET.write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n')
print('ILY_REPAIR_OK total=60 added=50 source_verified=60')
