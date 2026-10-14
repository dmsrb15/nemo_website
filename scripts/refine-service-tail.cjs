const fs=require('fs'),path=require('path'),dist=path.resolve(__dirname,'../dist');
for(const name of ['residential','commercial','office','popup','branding','styling']){
 const file=path.join(dist,name+'.html');let html=fs.readFileSync(file,'utf8');
 if(!html.includes('class="res-service-tail"'))html=html.replace(/<section class="res-ending"[\s\S]*?<nav class="service-other[\s\S]*?<\/nav>/,tail=>`<div class="res-service-tail">${tail}</div>`);
 fs.writeFileSync(file,html);
}
