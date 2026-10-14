((root)=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const families=new Set(['inherit','sans','serif']);
 function merge(runs){const result=[];for(const r of runs){if(!r.text)continue;const font=families.has(r.font)?r.font:'inherit';if(result.at(-1)?.font===font)result.at(-1).text+=r.text;else result.push({text:r.text,font});}return result;}
 function validate(runs,plain,limit=2048){
  if(runs===undefined||runs===null)return [];
  if(!Array.isArray(runs)||runs.length>limit)throw Error('글자 서식은 최대 '+limit+'개입니다.');
  let result=runs.map(r=>{if(!r||typeof r.text!=='string'||!families.has(r.font||'inherit'))throw Error('글자 서식을 확인해주세요.');return {text:r.text,font:r.font||'inherit'};});
  const joined=result.map(r=>r.text).join('');if(joined.trim()!==String(plain).trim())throw Error('본문과 글자 서식이 일치하지 않습니다.');
  let start=joined.length-joined.trimStart().length,end=joined.trimEnd().length,offset=0;result=result.map(r=>{const left=Math.max(0,start-offset),right=Math.min(r.text.length,end-offset);offset+=r.text.length;return {text:r.text.slice(left,Math.max(left,right)),font:r.font};});return merge(result);
 }
 function mark(runs,start,end,font){
  if(!families.has(font))throw Error('글꼴을 선택해주세요.');const total=runs.map(r=>r.text).join('').length;if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>total||end<=start)throw Error('글자를 먼저 선택해주세요.');let offset=0,result=[];
  for(const r of runs){const from=Math.max(0,start-offset),to=Math.min(r.text.length,end-offset);if(to>from){if(from)result.push({text:r.text.slice(0,from),font:r.font});result.push({text:r.text.slice(from,to),font});if(to<r.text.length)result.push({text:r.text.slice(to),font:r.font});}else result.push({...r});offset+=r.text.length;}return merge(result);
 }
 function markup(runs,plain){if(!Array.isArray(runs)||runs.map(r=>r.text).join('')!==plain)return esc(plain);return runs.map(r=>r.font==='sans'||r.font==='serif'?'<span data-font="'+r.font+'" class="cms-inline-'+r.font+'">'+esc(r.text)+'</span>':esc(r.text)).join('');}
 function read(node){const result=[];const push=(text,font)=>{if(text)result.push({text,font});};function walk(el,font='inherit'){if(el.nodeType===3){push(el.nodeValue,font);return;}if(el.nodeType!==1&&el.nodeType!==11)return;const own=el.getAttribute?.('data-font');if(families.has(own))font=own;if(el.nodeName==='BR'){push('\n',font);return;}if(['DIV','P'].includes(el.nodeName)&&result.length&&!result.at(-1).text.endsWith('\n'))push('\n',font);for(const child of el.childNodes)walk(child,font);}for(const child of node.childNodes)walk(child);return {runs:merge(result),text:result.map(r=>r.text).join('')};}
 function offset(el,node,pos){const r=document.createRange();r.selectNodeContents(el);r.setEnd(node,pos);return read(r.cloneContents()).text.length;}
 function select(el,start,end){const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node,total=0,first=null,last=null;while(node=walker.nextNode()){const length=node.nodeValue.length;if(!first&&start<=total+length)first=[node,Math.max(0,start-total)];if(end<=total+length){last=[node,Math.max(0,end-total)];break;}total+=length;}if(!first||!last)return;const r=document.createRange();r.setStart(...first);r.setEnd(...last);const selection=getSelection();selection.removeAllRanges();selection.addRange(r);}
 root.NEMO_RICH={merge,validate,mark,markup,read,offset,select};if(typeof module!=='undefined')module.exports=root.NEMO_RICH;
})(typeof window==='undefined'?globalThis:window);
