const fs=require('fs'),path=require('path');const dist=path.resolve(__dirname,'../dist'),file=path.join(dist,'index.html');
const residential=fs.readFileSync(path.join(dist,'residential.html'),'utf8');
const process=residential.match(/<section id="residential-process"[\s\S]*?<\/section>/)[0].replace('id="residential-process"','id="about"');
let html=fs.readFileSync(file,'utf8');
const replacement=`<div class="residential-detail home-process-detail">${process}</div>`;
html=html.includes('home-process-detail')?html.replace(/<div class="residential-detail home-process-detail">[\s\S]*?<\/section><\/div>/,replacement):html.replace(/<section class="process" id="about"[\s\S]*?<\/section>/,replacement);
html=html.replace(/<link rel="stylesheet" href="residential-detail\.css[^\"]*">/g,'').replace(/<script src="residential-detail\.js[^\"]*" defer><\/script>/g,'');
html=html.replace('</head>','<link rel="stylesheet" href="residential-detail.css?v=20261014-portrait-cards"><script src="residential-detail.js?v=20261014-portrait-cards" defer></script></head>');fs.writeFileSync(file,html);
