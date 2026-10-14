const fs=require('fs'),path=require('path'),dist=path.resolve(__dirname,'../dist');
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.html')&&n!=='admin.html')){
 const file=path.join(dist,name);let html=fs.readFileSync(file,'utf8');
 html=html.replace(/src="content\.js[^"]*"/g,'src="/api/public/content.js"');
 html=html.replace(/pages\.js\?v=[^"]+/g,'pages.js?v=20261014-cms').replace(/pages\.css\?v=[^"]+/g,'pages.css?v=20261014-cms');
 if(html.includes('pages.js')&&!html.includes('cms-public.js'))html=html.replace('</head>','<script src="/cms-public.js?v=1" defer></script></head>');
 fs.writeFileSync(file,html);
}

for(const name of ['portfolio','story','portfolios','newsroom']){const file=path.join(dist,name+'.html');let html=fs.readFileSync(file,'utf8');if(!html.includes('/cms-render.js'))html=html.replace('<script src="pages.js','<link rel="stylesheet" href="/cms-render.css?v=20261014-editor"><script src="/cms-render.js?v=20261014-editor" defer></script><script src="pages.js');html=html.replaceAll('pages.js?v=20261014-cms','pages.js?v=20261014-editor').replaceAll('/cms-public.js?v=1','/cms-public.js?v=20261014-editor');fs.writeFileSync(file,html);}

for(const name of ['portfolio','story','portfolios','newsroom']){const file=path.join(dist,name+'.html');let page=fs.readFileSync(file,'utf8');if(!page.includes('cms-richtext.js'))page=page.replace('<script src="/cms-render.js','<script src="/cms-richtext.js?v=20261014-thumbnail-frames-v1" defer></script><script src="/cms-render.js');page=page.replaceAll('v=20261014-editor','v=20261014-thumbnail-frames-v1');fs.writeFileSync(file,page);}
