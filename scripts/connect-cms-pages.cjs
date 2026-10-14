const fs=require('fs'),path=require('path'),dist=path.resolve(__dirname,'../dist');
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.html')&&n!=='admin.html')){
 const file=path.join(dist,name);let html=fs.readFileSync(file,'utf8');
 html=html.replace(/src="content\.js[^"]*"/g,'src="/api/public/content.js"');
 html=html.replace(/pages\.js\?v=[^"]+/g,'pages.js?v=20261014-cms').replace(/pages\.css\?v=[^"]+/g,'pages.css?v=20261014-cms');
 if(html.includes('pages.js')&&!html.includes('cms-public.js'))html=html.replace('</head>','<script src="/cms-public.js?v=1" defer></script></head>');
 fs.writeFileSync(file,html);
}
