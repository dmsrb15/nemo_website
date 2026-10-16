// Produce dark counterparts from the existing stylesheet cascade. Images and
// authored article colors stay untouched; only CSS surface/text colors change.
const fs=require('fs'),path=require('path');
const dist=path.resolve(__dirname,'../dist');
const out=path.join(dist,'themes');fs.mkdirSync(out,{recursive:true});
function rgb(token){
 if(token[0]==='#'){let h=token.slice(1);if(h.length<5)h=h.split('').map(c=>c+c).join('');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),h.length===8?h.slice(6):''];}
 if(/^(white|black)$/i.test(token))return token.toLowerCase()==='white'?[255,255,255,'']:[0,0,0,''];
 const m=token.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);return m?[+m[1],+m[2],+m[3],m[4]===undefined?'':Math.round(+m[4]*255).toString(16).padStart(2,'0')]:null;
}
function shade(token,kind){
 const c=rgb(token);if(!c)return token;const [r,g,b,alpha]=c,max=Math.max(r,g,b),min=Math.min(r,g,b),light=(max+min)/510,sat=max?((max-min)/max):0;
 let hex;
 if(kind==='border')hex=light>.45?'#3c463f':token;
 else if(kind==='text'){
  if(light>.9)hex='#f1f4ef';
  else if(sat>.25&&g>r*1.1)hex='#86d6bb';
  else if(sat>.45&&r>g*1.2)hex='#ed9c8b';
  else if(light<.30)hex='#edf1eb';
  else hex='#b1bcb3';
 }else{
  if(light<.40)return token;
  // Keep brand yellow buttons and intentionally colored accents.
  if(r>210&&g>160&&b<165&&sat>.3)return token;
  hex=light>.89?'#1d231f':light>.7?'#252d27':'#38443b';
 }
 if(hex===token)return token;return hex+alpha;
}
function declarations(body){
 const result=[];
 for(const part of body.split(';')){const at=part.indexOf(':');if(at<0)continue;const key=part.slice(0,at).trim(),value=part.slice(at+1).trim();let kind;
  if(key==='color'||key==='fill'||key==='stroke')kind='text';
  else if(/^background(?:-color)?$/.test(key))kind='surface';
  else if(/^border(?:-(?:top|bottom|left|right))?(?:-color)?$/.test(key)||key==='outline-color')kind='border';
  else if(/^--(?:paper|ink|muted|line|(?:about|service|res)-(?:muted|line|soft))$/.test(key))kind=/ink|muted/.test(key)?'text':/line/.test(key)?'border':'surface';
  if(!kind)continue;
  const next=value.replace(/#[\da-f]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b/gi,t=>shade(t,kind));
  // Retain transparent/inherited later declarations as well, so the original
  // cascade can still cancel an earlier surface or foreground color.
  result.push(key+':'+next);
 }
 return result.join(';');
}
function darkRules(css){
 css=css.replace(/\/\*[\s\S]*?\*\//g,'');let i=0,result='';
 while(i<css.length){const open=css.indexOf('{',i);if(open<0)break;const head=css.slice(i,open).trim();let depth=1,j=open+1,quote='';
  for(;j<css.length&&depth;j++){const c=css[j];if(quote){if(c===quote&&css[j-1]!=='\\')quote='';continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;}
  const body=css.slice(open+1,j-1);i=j;
  if(head.startsWith('@')){if(/^@(media|supports|container|layer)\b/.test(head)){const inner=darkRules(body);if(inner)result+=head+'{'+inner+'}\n';}continue;}
  const ds=declarations(body);if(!ds)continue;
  const sels=head.split(/,(?![^()]*\))/).map(s=>{s=s.trim();return s===':root'?'html[data-theme="dark"]':s.startsWith('html')?s.replace(/^html/,'html[data-theme="dark"]'):'html[data-theme="dark"] '+s;});
  result+=sels.join(',')+'{'+ds+'}\n';
 }
 return result;
}
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.css')&&n!=='theme.css')){
 fs.writeFileSync(path.join(out,name),darkRules(fs.readFileSync(path.join(dist,name),'utf8')));
}
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.html'))){
 const file=path.join(dist,name);let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<link\b[^>]*data-nemo-theme[^>]*>/gi,'').replace(/<script\b[^>]*data-nemo-theme[^>]*>[\s\S]*?<\/script>/gi,'');
 html=html.replace(/(<meta charset="utf-8">)/i,'$1<script data-nemo-theme src="/theme.js?v=20261016-dark-1"></script>');
 html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi,tag=>{const href=tag.match(/href="([^"?]+)(?:\?[^" ]*)?"/i)?.[1],base=href&&path.basename(href);return base&&fs.existsSync(path.join(out,base))?tag+'<link data-nemo-theme rel="stylesheet" href="/themes/'+base+'?v=20261016-dark-1">':tag;});
 if(!/href="\/?cms-render\.css/.test(html))html=html.replace('</head>','<link data-nemo-theme rel="stylesheet" href="/themes/cms-render.css?v=20261016-dark-1"></head>');
 html=html.replace('</head>','<link data-nemo-theme rel="stylesheet" href="/theme.css?v=20261016-dark-1"></head>');
 fs.writeFileSync(file,html);
}
