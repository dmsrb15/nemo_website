import shared from '../dist/landing-data.js';
const KEY='landing-content-v1';
export const defaultLanding=shared.defaults;
export function validateLanding(raw){
 const invalid=()=>{throw Object.assign(new Error('홈페이지 입력 내용을 확인해주세요.'),{status:400});};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))invalid();
 const text=(value,max,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))invalid();return value.trim();};
 const list=(name,max,convert)=>{if(!Array.isArray(raw[name])||raw[name].length>max)invalid();return raw[name].map((row,i)=>{if(!row||typeof row!=='object'||Array.isArray(row))invalid();return convert(row,i);});};
 const ids=new Set();const id=(value)=>{const s=text(value,80,true);if(!/^[a-zA-Z0-9_-]+$/.test(s)||ids.has(s))invalid();ids.add(s);return s;};
 return {reviewEyebrow:text(raw.reviewEyebrow,80),reviewTitle:text(raw.reviewTitle,160,true),totalLabel:text(raw.totalLabel,50),totalProjects:text(raw.totalProjects,24),overseasLabel:text(raw.overseasLabel,50),overseasProjects:text(raw.overseasProjects,24),dataSource:text(raw.dataSource,80),
 marquee:list('marquee',30,r=>({text:text(r.text,300,true),label:text(r.label,60)})),
 domestic:list('domestic',100,r=>{if(!shared.regions.some(x=>x.id===r.region))invalid();return {id:id(r.id),region:r.region,mapLabel:text(r.mapLabel,30),kind:text(r.kind,60),person:text(r.person,60),quote:text(r.quote,1000,true)};}),
 overseas:list('overseas',50,r=>({id:id(r.id),country:text(r.country,60,true),title:text(r.title,160,true),description:text(r.description,600)}))};
}
export async function readLanding(env){const row=await env.DB.prepare('SELECT value FROM cms_settings WHERE key=?').bind(KEY).first();return row?JSON.parse(row.value):{revision:0,config:defaultLanding};}
export async function saveLanding(env,body,user){
 const current=await readLanding(env);if(!Number.isInteger(body.expectedRevision)||body.expectedRevision!==current.revision)throw Object.assign(new Error('다른 관리자가 수정했습니다. 새로 불러온 뒤 다시 수정해주세요.'),{status:409});
 const config=validateLanding(body.config),next={revision:current.revision+1,config,updated:Date.now(),editor:user.username},value=JSON.stringify(next);
 const result=current.revision===0?await env.DB.prepare('INSERT OR IGNORE INTO cms_settings (key,value) VALUES (?,?)').bind(KEY,value).run():await env.DB.prepare('UPDATE cms_settings SET value=? WHERE key=? AND value=?').bind(value,KEY,JSON.stringify(current)).run();
 if(!result.meta.changes)throw Object.assign(new Error('다른 관리자가 수정했습니다. 새로 불러온 뒤 다시 수정해주세요.'),{status:409});return next;
}
