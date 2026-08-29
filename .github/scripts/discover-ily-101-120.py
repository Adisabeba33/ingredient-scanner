import urllib.request,re,html
urls=['https://furryfriendsnutrition.com/products/i-and-love-and-you-stir-mix-a-little-chicken-bone-broth-instant-home-made-dog-food','https://furryfriendsnutrition.com/products/i-and-love-and-you-stir-mix-a-little-turkey-bone-broth-instant-home-made-dog-food','https://furryfriendsnutrition.com/products/i-and-love-and-you-stir-mix-a-little-beef-bone-broth-instant-home-made-dog-food']
for u in urls:
  try:
    req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
    s=urllib.request.urlopen(req,timeout=30).read().decode(errors='ignore')
    s=re.sub(r'<script.*?</script>|<style.*?</style>',' ',s,flags=re.S|re.I);s=re.sub(r'<[^>]+>',' ',s);s=html.unescape(re.sub(r'\s+',' ',s))
    print('URL',u);print(s[:12000])
  except Exception as e:print('FAIL',u,e)
