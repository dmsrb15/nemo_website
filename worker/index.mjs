import render from '../dist/cms-render.js';
import rich from '../dist/cms-richtext.js';
import {extensions} from './extensions.mjs';
import legacy from './legacy.mjs';
const encoder=new TextEncoder(),COOKIE='__Host-nemo_admin',TTL=12*60*60*1000;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const random=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
const digest=async s=>b64(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function passwordHash(password,salt,pepper){
 const secret=await crypto.subtle.importKey('raw',encoder.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const material=await crypto.subtle.sign('HMAC',secret,encoder.encode(password));
 const key=await crypto.subtle.importKey('raw',material,'PBKDF2',false,['deriveBits']);
 return b64(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));
}
const equal=(a,b)=>{if(typeof a!=='string'||typeof b!=='string')return false;let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;};
const cookie=(token,expires=43200)=>COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+expires;
const adminRow=env=>env.DB.prepare('SELECT * FROM cms_admin WHERE id=?').bind('owner').first();
async function ensureBootstrap(env){
 const version='username-initial-v1';
 if(await env.DB.prepare('SELECT value FROM cms_settings WHERE key=?').bind(version).first())return;
 if(!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(env.CMS_INITIAL_USERNAME||'')||!/^[A-Za-z0-9_-]{43}$/.test(env.CMS_INITIAL_PASSWORD_HASH||'')||!/^[A-Za-z0-9_-]{43}$/.test(env.CMS_INITIAL_PASSWORD_SALT||''))fail(503,'관리자 계정을 준비 중입니다. 잠시 후 다시 접속해주세요.');
 const existed=await adminRow(env),now=Date.now();
 const statements=[env.DB.prepare('DELETE FROM cms_sessions WHERE NOT EXISTS (SELECT 1 FROM cms_settings WHERE key=?)').bind(version),env.DB.prepare('INSERT INTO cms_admin (id,email,username,password,salt,platform_id) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM cms_settings WHERE key=?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,password=excluded.password,salt=excluded.salt').bind('owner',env.CMS_SETUP_OWNER_EMAIL,env.CMS_INITIAL_USERNAME,env.CMS_INITIAL_PASSWORD_HASH,env.CMS_INITIAL_PASSWORD_SALT,'',version)];
 if(!existed){const seed=[...legacy.projects.map(p=>['portfolio',p]),...legacy.stories.map(p=>['news',p])];for(const [i,[type,p]]of seed.entries())statements.push(env.DB.prepare('INSERT OR IGNORE INTO cms_posts (id,type,status,title,payload,published,created,updated) SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM cms_settings WHERE key=?)').bind(type+':'+p.id,type,'published',p.title,JSON.stringify(p),JSON.stringify(p),now-i,now-i,version));}
 statements.push(env.DB.prepare('INSERT OR IGNORE INTO cms_settings (key,value) VALUES (?,?)').bind(version,String(now)));await env.DB.batch(statements);
}
const extra=extensions({json,fail,readJSON,passwordHash,random,digest,cookie,createSession});
async function authenticated(request,env){return !!await extra.actor(request,env);}
async function requireAdmin(request,env){const user=await extra.actor(request,env);if(!user)fail(401,'로그인이 필요합니다.');return user;}
function sameOrigin(request,env){
 const origin=request.headers.get('Origin');if(!origin||!([new URL(request.url).origin,env.CMS_SITE_ORIGIN].filter(Boolean)).includes(origin))fail(403,'허용되지 않은 요청입니다.');
}
async function readJSON(request){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'JSON 형식으로 보내주세요.');
 if(Number(request.headers.get('Content-Length')||0)>180000)fail(413,'글이 너무 깁니다.');
 const raw=new TextDecoder().decode(await readBytes(request,180000));
 try{const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))fail(400,'입력 내용을 확인해주세요.');return parsed;}catch{fail(400,'입력 내용을 확인해주세요.');}
}
async function readBytes(request,limit){const reader=request.body?.getReader();if(!reader)return new Uint8Array();let length=0,chunks=[];while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();fail(413,'파일 또는 글이 너무 큽니다.');}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;}
function credentials(body){const username=String(body.username||'').trim().toLowerCase(),password=String(body.password||'');if(!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(username)||!password.length||password.length>128)fail(400,'아이디와 비밀번호를 입력해주세요.');return {username,password};}
async function createSession(env,adminId='owner'){
 const token=random();await env.DB.batch([env.DB.prepare('DELETE FROM cms_sessions WHERE expires<?').bind(Date.now()),env.DB.prepare('INSERT INTO cms_sessions (token,expires,admin_id) VALUES (?,?,?)').bind(await digest(token),Date.now()+TTL,adminId)]);
 return token;
}
async function rateLimit(request,env){
 const key=await digest(request.headers.get('cf-connecting-ip')||'shared');
 const row=await env.DB.prepare('SELECT * FROM cms_attempts WHERE key=?').bind(key).first(),now=Date.now();
 if(row&&row.until>now&&row.count>=8)fail(429,'로그인 시도가 많습니다. 15분 후 다시 시도해주세요.');
 await env.DB.prepare('INSERT INTO cms_attempts (key,count,until) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<=? THEN 1 ELSE count+1 END,until=CASE WHEN until<=? THEN excluded.until ELSE until END').bind(key,now+15*60*1000,now,now).run();
 return key;
}
const visualKeys=new Set([...legacy.projects.flatMap(p=>[p.visual,...p.sections.map(s=>s[2])]),...legacy.stories.map(s=>s.visual)]);
function text(value,max=20000){const s=String(value??'').trim();if(s.length>max)fail(400,'입력 내용이 너무 깁니다.');return s;}
function image(value){const s=text(value,120);if(!s||visualKeys.has(s)||/^\/media\/[a-f0-9-]{36}$/.test(s))return s;fail(400,'업로드한 사진을 선택해주세요.');}
function payload(type,id,raw){
 const p={id,title:text(raw.title,160),category:text(raw.category,40),lead:text(raw.lead,600),visual:image(raw.visual),sections:[],images:[]};
 const categories=type==='portfolio'?['주거','상업','사무','팝업','브랜딩','스타일링']:['공간 이야기','디자인 노트','네모 가이드'];
 if(!categories.includes(p.category))fail(400,'분류를 선택해주세요.');
 if(!Array.isArray(raw.sections)||raw.sections.length>(Array.isArray(raw.blocks)?96:24))fail(400,'본문을 확인해주세요.');
 p.sections=raw.sections.map(s=>{if(!Array.isArray(s))fail(400,'본문 형식이 잘못됐습니다.');return [text(s[0],160),text(s[1],18000),image(s[2]||'')];});
 if(!Array.isArray(raw.images)||raw.images.length>24)fail(400,'사진은 최대 24장까지 등록할 수 있습니다.');
 p.images=raw.images.map(image);
 if(type==='portfolio'){p.style=text(raw.style,30);if(!p.style)fail(400,'스타일을 입력해주세요.');p.kind=text(raw.kind,80);p.intro=text(raw.intro,4000);p.points=(Array.isArray(raw.points)?raw.points:[]).slice(0,8).map(s=>text(s,120));p.isActual=raw.isActual===true;}
 else p.time=Math.max(1,Math.ceil(p.sections.map(s=>s[1]).join('').length/500))+'분';
 p.font=['sans','serif'].includes(raw.font)?raw.font:'sans';
 p.blocks=Array.isArray(raw.blocks)?raw.blocks:p.sections.flatMap(s=>[...(s[0]?[{type:'heading',text:s[0]}]:[]),...(s[1]?[{type:'paragraph',text:s[1]}]:[]),...(s[2]?[{type:'image',src:s[2],alt:s[0]}]:[])]);
 if(p.blocks.length>96)fail(400,'본문 요소는 최대 96개까지 넣을 수 있습니다.');
 p.blocks=p.blocks.map(b=>{if(!b||!['heading','paragraph','image','youtube'].includes(b.type))fail(400,'본문 요소를 확인해주세요.');if(b.type==='youtube'){const videoId=render.youtubeId(b.url||b.videoId);if(!videoId)fail(400,'유튜브 주소를 확인해주세요.');return {type:'youtube',videoId,url:'https://www.youtube.com/watch?v='+videoId,layout:b.layout==='half'?'half':'full'};}if(b.type==='image'){const alt=text(b.alt,200);let captionRuns;try{captionRuns=rich.validate(b.captionRuns,alt);}catch(error){fail(400,error.message);}return {layout:b.layout==='half'?'half':'full',type:'image',src:image(b.src),alt,captionRuns,font:'inherit',size:['small','medium','large','full'].includes(b.size)?b.size:'auto',align:['left','right'].includes(b.align)?b.align:'center',width:Math.min(30000,Math.max(0,Math.floor(Number(b.width)||0))),height:Math.min(30000,Math.max(0,Math.floor(Number(b.height)||0)))};}const copy=text(b.text,18000);let runs;try{runs=rich.validate(b.runs,copy);}catch(error){fail(400,error.message);}return {layout:b.layout==='half'?'half':'full',type:b.type,text:copy,runs,font:['sans','serif'].includes(b.font)?b.font:'inherit'};});
 if(new Set([p.visual,...p.images,...p.blocks.filter(b=>b.type==='image').map(b=>b.src),...p.sections.map(s=>s[2])].filter(Boolean)).size>24)fail(400,'사진은 최대 24장까지 등록할 수 있습니다.');
 p.relatedMode=['manual','random','none'].includes(raw.relatedMode)?raw.relatedMode:raw.relatedMode==='auto'?'none':'random';p.heroLayout=['image-top','text-top','image-right'].includes(raw.heroLayout)?raw.heroLayout:type==='news'?'text-top':'side';p.showToc=raw.showToc!==false;for(const flag of ['showIntro','showFlowTitle','showPoints','showMeta'])p[flag]=raw[flag]!==false;try{p.pointBackground=rich.color(raw.pointBackground);p.pointColor=rich.color(raw.pointColor);}catch(error){fail(400,error.message);}
 p.related=(Array.isArray(raw.related)?raw.related:[]).slice(0,6).map(v=>{const id=text(v,100);if(!/^[A-Za-z0-9:_-]+$/.test(id))fail(400,'관련 글을 확인해주세요.');return id;});p.relatedTitle=text(raw.relatedTitle|| (type==='portfolio'?'다른 공간도 살펴보세요.':'이런 이야기도 있어요.'),160);
 if(type==='portfolio'){p.introTitle=text(raw.introTitle||'공간 소개',160);p.flowTitle=text(raw.flowTitle||'경험의 흐름',160);p.noteTitle=text(raw.noteTitle||'디자인 노트',160);p.note=text(raw.note??[p.lead,p.intro].filter(Boolean).join(' '),12000);p.showNote=raw.showNote!==false;
 const price=raw.price||{};p.price={mode:['none','unit','total','both'].includes(price.mode)?price.mode:'none',unit:text(price.unit,100),total:text(price.total,100)};
 }else p.time=Math.max(1,Math.ceil(p.blocks.filter(b=>b.type!=='image').map(b=>b.text).join('').length/500))+'분';
 p.richText={};for(const key of ['title','lead','intro','introTitle','flowTitle','noteTitle','note','relatedTitle']){if(raw.richText?.[key]!==undefined){try{p.richText[key]=rich.validate(raw.richText[key],p[key]||'');}catch(error){fail(400,error.message);}}}
 return p;
}
function publicPayload(value){const p=JSON.parse(value);delete p.isActual;return p;}
async function publicContent(env){
 await extra.cleanup(env);const admin=await adminRow(env);if(!admin)return legacy;
 const rows=await env.DB.prepare("SELECT type,published FROM cms_posts WHERE status='published' AND published IS NOT NULL ORDER BY sort_order ASC,created DESC").all();
 return {projects:rows.results.filter(p=>p.type==='portfolio').map(p=>publicPayload(p.published)),stories:rows.results.filter(p=>p.type==='news').map(p=>publicPayload(p.published))};
}
function safeData(value){if(typeof value==='string')return escape(value).replace(/\n/g,'<br>');if(Array.isArray(value))return value.map(safeData);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,safeData(v)]));return value;}
const visual=(key,alt)=>key.startsWith('/media/')?'<img src="'+escape(key)+'" alt="'+escape(alt)+'" loading="lazy">':key==='photo'?'<img src="assets/hero.png" alt="'+escape(alt)+'" loading="lazy">':['office','popup'].includes(key)?'<img class="office-image" src="assets/'+key+'-3d.png" alt="'+escape(alt)+'" loading="lazy">':'<div class="cms-sprite '+escape(key)+'" role="img" aria-label="'+escape(alt)+'"></div>';
function projectCard(p){return '<a class="portfolio-item" data-id="'+escape(p.id)+'" data-category="'+escape(p.category)+'" data-style="'+escape(p.style)+'" data-search="'+escape([p.title,p.category,p.style,p.kind,p.lead,p.price?.unit,p.price?.total,...p.points].join(' ').toLowerCase())+'" href="portfolio.html?project='+encodeURIComponent(p.id)+'"><div class="portfolio-cover">'+visual(p.visual,p.title)+'</div><div class="portfolio-caption"><h2>'+escape(p.title)+'</h2><span aria-hidden="true">↗</span></div><p>'+escape([...new Set([p.category,p.style,p.kind].filter(Boolean))].join(' · '))+'</p></a>';}
function newsCard(p){return '<a class="news-card" data-news-category="'+escape(p.category)+'" href="story.html?article='+encodeURIComponent(p.id)+'"><div class="news-visual">'+visual(p.visual,p.title)+'</div><div class="news-card-copy"><span class="page-meta">'+escape(p.category+' · '+p.time+' 읽기')+'</span><h2>'+escape(p.title)+'</h2></div></a>';}
function featuredNews(content){return content.stories.slice(0,2).map((p,i)=>i===0?newsCard(p).replace('class="news-card"','class="news-feature"'):newsCard(p)).join('');}
export default {async fetch(request,env){
 try{
  const url=new URL(request.url);let path;try{path=decodeURIComponent(url.pathname).replace(/\/$/,'')||'/';}catch{fail(400,'주소를 확인해주세요.');}
  if(path.startsWith('/api/')||path==='/content.js'){
   if(!env.DB||!env.BUCKET||!env.CMS_PASSWORD_PEPPER||!env.CMS_SETUP_OWNER_EMAIL)fail(503,'관리자 저장소를 준비 중입니다. 잠시 후 다시 접속해주세요.');
  }
  if(path.startsWith('/api/')&&request.method!=='GET'&&request.method!=='HEAD')sameOrigin(request,env);
  if(path==='/api/admin/session'||path==='/api/admin/login')await ensureBootstrap(env);
  if(path==='/api/admin/session'&&request.method==='GET'){const admin=await adminRow(env),signed=await authenticated(request,env);const user=signed?await extra.actor(request,env):null;return json({configured:!!admin,authenticated:signed,username:user?.username,role:user?.role,registrationAvailable:false});}
  if(['/api/admin/setup','/api/admin/recover','/api/admin/register','/api/admin/request-code'].includes(path))fail(403,'추가 계정 등록과 이메일 인증은 아직 제공하지 않습니다.');
  if(path==='/api/admin/login'&&request.method==='POST'){
   const key=await rateLimit(request,env),{username,password}=credentials(await readJSON(request)),admin=await env.DB.prepare('SELECT * FROM cms_admin WHERE username=? AND active=1').bind(username).first();
   const hash=await passwordHash(password,admin?.salt||'not-configured',env.CMS_PASSWORD_PEPPER);
   if(!admin||!equal(hash,admin.password)||!equal(username,admin.username))fail(401,'아이디 또는 비밀번호가 맞지 않습니다.');
   await env.DB.prepare('DELETE FROM cms_attempts WHERE key=?').bind(key).run();await env.DB.prepare('UPDATE cms_admin SET last_login=? WHERE id=?').bind(Date.now(),admin.id).run();return json({ok:true},200,{'Set-Cookie':cookie(await createSession(env,admin.id))});
  }
  if(path==='/api/admin/logout'&&request.method==='POST'){const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(token)await env.DB.prepare('DELETE FROM cms_sessions WHERE token=?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
  const extended=await extra.routes(path,request,env);if(extended)return extended;
  if(path==='/api/admin/posts'&&request.method==='GET'){const user=await requireAdmin(request,env);await extra.cleanup(env);const rows=await env.DB.prepare('SELECT p.*,a.username AS author,e.username AS editor FROM cms_posts p LEFT JOIN cms_admin a ON a.id=p.author_id LEFT JOIN cms_admin e ON e.id=p.editor_id ORDER BY p.sort_order ASC,p.created DESC').all();return json({posts:rows.results.map(p=>({...p,author_id:user.role==='master'?p.author_id:undefined,editor_id:user.role==='master'?p.editor_id:undefined,author:p.author,editor:p.editor,payload:JSON.parse(p.payload),livePayload:p.published?JSON.parse(p.published):null,published:undefined,hasUnpublishedChanges:p.status==='published'&&p.payload!==p.published})),retentionDays:30});}
  if(/^\/api\/admin\/posts(?:\/[A-Za-z0-9:_-]+)?$/.test(path)&&request.method==='POST'){
   const user=await requireAdmin(request,env),data=await readJSON(request),existingId=path.split('/')[4],existing=existingId?await env.DB.prepare('SELECT * FROM cms_posts WHERE id=?').bind(existingId).first():null;
   if(existingId&&!existing)fail(404,'글을 찾지 못했습니다.');if(existing?.status==='archived'&&existing.archived_at<=Date.now()-extra.RETENTION)fail(410,'보관 기간이 만료된 글입니다.');
   if(existing&&data.expectedUpdated!==undefined&&data.expectedUpdated!==existing.updated)fail(409,'다른 관리자가 글을 수정했습니다. 목록에서 다시 열어주세요.');const type=existing?.type||data.type;if(!['portfolio','news'].includes(type))fail(400,'글 종류를 선택해주세요.');
   const id=existing?.id||type+'_'+crypto.randomUUID(),action=data.action||'draft';if(!['draft','publish','unpublish','archive','restore'].includes(action))fail(400,'저장 방식을 확인해주세요.');
   if(existing?.status==='archived'&&!['restore','archive'].includes(action))fail(409,'휴지통의 글은 먼저 복원해주세요.');
   const p=payload(type,existing?JSON.parse(existing.payload).id:id,data.payload||{}),raw=JSON.stringify(p);if(raw.length>160000)fail(413,'글이 너무 깁니다.');
   if(action==='publish'&&(!p.title||!p.visual||!p.blocks.some(b=>b.type!=='image'&&b.text)))fail(400,'제목, 대표 사진, 본문을 입력해주세요.');
   if(action==='publish'&&p.relatedMode==='manual'){const candidates=await env.DB.prepare("SELECT published FROM cms_posts WHERE type=? AND status='published' AND id<>?").bind(type,id).all(),ids=new Set(candidates.results.map(r=>JSON.parse(r.published).id));if(p.related.some(v=>!ids.has(v)))fail(400,'관련 글은 현재 게시된 글에서 선택해주세요.');}
   let status=existing?.status||'draft',published=existing?.published||null,archivedAt=existing?.archived_at||null;
   if(action==='publish'){status='published';published=raw;archivedAt=null;}else if(['unpublish','restore'].includes(action)){status='draft';published=null;archivedAt=null;}else if(action==='archive'){status='archived';published=null;archivedAt=existing?.status==='archived'?existing.archived_at:Date.now();}
   const now=Math.max(Date.now(),(existing?.updated||0)+1);const saved=await env.DB.prepare('INSERT INTO cms_posts (id,type,status,title,payload,published,created,updated,author_id,editor_id,archived_at,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,title=excluded.title,payload=excluded.payload,published=excluded.published,updated=excluded.updated,editor_id=excluded.editor_id,archived_at=excluded.archived_at WHERE cms_posts.updated=?').bind(id,type,status,p.title||'제목 없는 글',raw,published,existing?.created||now,now,existing?.author_id??(existing?null:user.id),user.id,archivedAt,existing?.sort_order||0,existing?.updated||0).run();if(!saved.meta.changes)fail(409,'다른 관리자가 글을 수정했습니다. 목록에서 다시 열어주세요.');return json({id,status,updated:now,hasUnpublishedChanges:status==='published'&&raw!==published},existing?200:201);
  }
  if(path==='/api/admin/media'&&request.method==='POST'){
   await requireAdmin(request,env);const mime=request.headers.get('Content-Type')?.split(';')[0];if(!['image/jpeg','image/png','image/webp'].includes(mime))fail(415,'JPG, PNG, WEBP 사진을 올려주세요.');
   if(Number(request.headers.get('Content-Length')||0)>12*1024*1024)fail(413,'사진은 12MB 이하로 올려주세요.');
   const bytes=await readBytes(request,12*1024*1024);if(bytes.length<12)fail(413,'사진 파일을 확인해주세요.');
   const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n):String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!valid)fail(415,'지원되는 사진 파일이 아닙니다.');
   const id=crypto.randomUUID();await env.BUCKET.put(id,bytes,{httpMetadata:{contentType:mime}});await env.DB.prepare('INSERT INTO cms_media (id,mime,size,created) VALUES (?,?,?,?)').bind(id,mime,bytes.length,Date.now()).run();return json({url:'/media/'+id},201);
  }
  if(/^\/media\/[a-f0-9-]{36}$/.test(path)&&request.method==='GET'){
   const id=path.split('/')[2];if(!await authenticated(request,env)&&!await env.DB.prepare("SELECT id FROM cms_posts WHERE status='published' AND published LIKE ? LIMIT 1").bind('%/media/'+id+'%').first())return new Response('Not found',{status:404});
   const file=await env.BUCKET.get(id);if(!file)return new Response('Not found',{status:404});return new Response(file.body,{headers:{'Content-Type':file.httpMetadata.contentType,'Cache-Control':'private,max-age=60','X-Content-Type-Options':'nosniff'}});
  }
  if(path==='/content.js'||path==='/api/public/content.js'){const content=await publicContent(env);let script='window.NEMO_CONTENT='+JSON.stringify(safeData(content))+';window.NEMO_RAW='+JSON.stringify(content)+';';
   script+='(()=>{const grid=document.querySelector(".portfolio-grid");if(grid)grid.innerHTML='+JSON.stringify(content.projects.map(projectCard).join(''))+';if(document.body.dataset.page==="newsroom"){const news=document.querySelector(".news-grid");if(news)news.innerHTML='+JSON.stringify(content.stories.map(newsCard).join(''))+';const featured=document.querySelector(".news-feature-grid");if(featured)featured.innerHTML='+JSON.stringify(featuredNews(content))+';const count=document.querySelector("#news-count");if(count)count.textContent='+JSON.stringify(content.stories.length+'개의 이야기')+';}})();';
   return new Response(script,{headers:{'Content-Type':'application/javascript;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
  if(path.startsWith('/api/'))return json({error:'찾을 수 없는 요청입니다.'},404);
  const assetURL=new URL(request.url);if(path==='/')assetURL.pathname='/index.html';else if(path==='/admin')assetURL.pathname='/admin.html';else if(['/admin-preview','/portfolios','/newsroom','/portfolio','/story','/about','/residential','/commercial','/office','/popup','/branding','/styling','/inquiry'].includes(path))assetURL.pathname=path+'.html';
  let response=await env.ASSETS.fetch(new Request(assetURL,request));
  if(['/admin','/admin.html','/admin-preview','/admin-preview.html'].includes(path)){response=new Response(response.body,response);response.headers.set('Cache-Control','no-store');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Content-Security-Policy',"default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; frame-src 'self' https://www.youtube-nocookie.com; connect-src 'self'; form-action 'self'; base-uri 'self'");return response;}
  if(['/portfolios','/portfolios.html','/newsroom','/newsroom.html'].includes(path)&&response.ok){
   const content=await publicContent(env),rewriter=new HTMLRewriter();
   if(path.startsWith('/portfolios')){rewriter.on('.portfolio-grid',{element:e=>e.setInnerContent(content.projects.map(projectCard).join(''),{html:true})});rewriter.on('#portfolio-count',{element:e=>e.setInnerContent(content.projects.length+'개의 공간')});}
   else{rewriter.on('.news-grid',{element:e=>e.setInnerContent(content.stories.map(newsCard).join(''),{html:true})});rewriter.on('.news-feature-grid',{element:e=>e.setInnerContent(featuredNews(content),{html:true})});rewriter.on('#news-count',{element:e=>e.setInnerContent(content.stories.length+'개의 이야기')});}
   response=rewriter.transform(response);response=new Response(response.body,response);response.headers.set('Cache-Control','no-store');
  }
  return response;
 }catch(error){if(!error.status)console.error('CMS request failed:',error.message);return json({error:error.status?error.message:'처리하지 못했습니다. 잠시 후 다시 시도해주세요.'},error.status||500);}
}};
