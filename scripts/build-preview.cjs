const fs=require('fs'),path=require('path');
const dist=path.resolve(__dirname,'../dist');
let html=fs.readFileSync(path.join(dist,'portfolio.html'),'utf8');
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/gi,'');
html=html.replace('data-page="portfolio"','data-page="preview"').replace('<title>공간 이야기 — NEMO</title>','<title>게시 화면 미리보기 — NEMO</title>');
html=html.replace('id="project-detail"','id="preview-content"');
html=html.replace('</head>','<link rel="stylesheet" href="/admin-preview.css?v=20261014-colors-v1"><script src="/cms-richtext.js?v=20261014-colors-v1" defer></script><script src="/cms-render.js?v=20261014-colors-v1" defer></script><script src="/admin-preview.js?v=20261014-colors-v1" defer></script></head>');
fs.writeFileSync(path.join(dist,'admin-preview.html'),html);
