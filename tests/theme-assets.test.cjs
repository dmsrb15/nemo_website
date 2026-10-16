const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const dist=path.resolve(__dirname,'../dist'),themes=path.join(dist,'themes');
test('all dark stylesheet image URLs resolve to existing site assets from /themes/',()=>{
 let images=0;
 for(const file of fs.readdirSync(themes)){
  const css=fs.readFileSync(path.join(themes,file),'utf8');
  for(const match of css.matchAll(/url\(\s*['"]?([^'"()]+)['"]?\s*\)/g)){
   const href=match[1];if(/^(data:|https?:|blob:|#)/i.test(href))continue;
   const resolved=new URL(href,'https://nemo.test/themes/'+file);
   assert.ok(!resolved.pathname.startsWith('/themes/assets/'),file+': incorrect theme-relative image '+href);
   assert.ok(fs.existsSync(path.join(dist,decodeURIComponent(resolved.pathname))),file+': missing image '+resolved.pathname);
   images++;
  }
 }
 assert.ok(images>=3,'The regression check must cover the home, office and popup illustrations.');
});
