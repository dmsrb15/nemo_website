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
async function authenticated(request,env){
 const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return false;
 return !!await env.DB.prepare('SELECT token FROM cms_sessions WHERE token=? AND expires>?').bind(await digest(token),Date.now()).first();
}
async function requireAdmin(request,env){if(!await authenticated(request,env))fail(401,'로그인이 필요합니다.');}
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
async function createSession(env){
 const token=random();await env.DB.batch([env.DB.prepare('DELETE FROM cms_sessions WHERE expires<?').bind(Date.now()),env.DB.prepare('INSERT INTO cms_sessions (token,expires) VALUES (?,?)').bind(await digest(token),Date.now()+TTL)]);
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
 if(!Array.isArray(raw.sections)||raw.sections.length>24)fail(400,'본문을 확인해주세요.');
 p.sections=raw.sections.map(s=>{if(!Array.isArray(s))fail(400,'본문 형식이 잘못됐습니다.');return [text(s[0],160),text(s[1],18000),image(s[2]||'')];});
 if(!Array.isArray(raw.images)||raw.images.length>24)fail(400,'사진은 최대 24장까지 등록할 수 있습니다.');
 p.images=raw.images.map(image);
 if(type==='portfolio'){p.style=text(raw.style,30);if(!['내추럴','모던','미니멀'].includes(p.style))fail(400,'스타일을 선택해주세요.');p.kind=text(raw.kind,80);p.intro=text(raw.intro,4000);p.points=(Array.isArray(raw.points)?raw.points:[]).slice(0,8).map(s=>text(s,120));p.isActual=raw.isActual===true;}
 else p.time=Math.max(1,Math.ceil(p.sections.map(s=>s[1]).join('').length/500))+'분';
 return p;
}
async function publicContent(env){
 const admin=await adminRow(env);if(!admin)return legacy;
 const rows=await env.DB.prepare("SELECT type,published FROM cms_posts WHERE status='published' AND published IS NOT NULL ORDER BY created DESC").all();
 return {projects:rows.results.filter(p=>p.type==='portfolio').map(p=>JSON.parse(p.published)),stories:rows.results.filter(p=>p.type==='news').map(p=>JSON.parse(p.published))};
}
function safeData(value){if(typeof value==='string')return escape(value).replace(/\n/g,'<br>');if(Array.isArray(value))return value.map(safeData);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,safeData(v)]));return value;}
const visual=(key,alt)=>key.startsWith('/media/')?'<img src="'+escape(key)+'" alt="'+escape(alt)+'" loading="lazy">':key==='photo'?'<img src="assets/hero.png" alt="'+escape(alt)+'" loading="lazy">':['office','popup'].includes(key)?'<img class="office-image" src="assets/'+key+'-3d.png" alt="'+escape(alt)+'" loading="lazy">':'<div class="atlas '+escape(key)+'" role="img" aria-label="'+escape(alt)+'"></div>';
function projectCard(p){return '<a class="portfolio-item" data-id="'+escape(p.id)+'" data-category="'+escape(p.category)+'" data-style="'+escape(p.style)+'" data-search="'+escape([p.title,p.category,p.style,p.kind,...p.points].join(' ').toLowerCase())+'" href="portfolio.html?project='+encodeURIComponent(p.id)+'"><div class="portfolio-cover">'+visual(p.visual,p.title)+'<span>'+escape(p.category+' · '+p.style)+'</span></div><div class="portfolio-caption"><h2>'+escape(p.title)+'</h2><span aria-hidden="true">↗</span></div><p>'+escape(p.kind)+' · '+(p.isActual?'프로젝트':'공간 콘셉트')+'</p></a>';}
function newsCard(p){return '<a class="news-card" data-news-category="'+escape(p.category)+'" href="story.html?article='+encodeURIComponent(p.id)+'"><div class="news-visual">'+visual(p.visual,p.title)+'</div><div class="news-card-copy"><span class="page-meta">'+escape(p.category+' · '+p.time+' 읽기')+'</span><h2>'+escape(p.title)+'</h2><p>'+escape(p.lead)+'</p></div></a>';}
export default {async fetch(request,env){
 try{
  const url=new URL(request.url);let path;try{path=decodeURIComponent(url.pathname).replace(/\/$/,'')||'/';}catch{fail(400,'주소를 확인해주세요.');}
  if(path.startsWith('/api/')||path==='/content.js'){
   if(!env.DB||!env.BUCKET||!env.CMS_PASSWORD_PEPPER||!env.CMS_SETUP_OWNER_EMAIL)fail(503,'관리자 저장소를 준비 중입니다. 잠시 후 다시 접속해주세요.');
  }
  if(path.startsWith('/api/')&&request.method!=='GET'&&request.method!=='HEAD')sameOrigin(request,env);
  if(path==='/api/admin/session'||path==='/api/admin/login')await ensureBootstrap(env);
  if(path==='/api/admin/session'&&request.method==='GET'){const admin=await adminRow(env),signed=await authenticated(request,env);return json({configured:!!admin,authenticated:signed,username:signed?admin.username:undefined,registrationAvailable:false});}
  if(['/api/admin/setup','/api/admin/recover','/api/admin/register','/api/admin/request-code'].includes(path))fail(403,'추가 계정 등록과 이메일 인증은 아직 제공하지 않습니다.');
  if(path==='/api/admin/login'&&request.method==='POST'){
   const key=await rateLimit(request,env),{username,password}=credentials(await readJSON(request)),admin=await adminRow(env);
   const hash=await passwordHash(password,admin?.salt||'not-configured',env.CMS_PASSWORD_PEPPER);
   if(!admin||!equal(hash,admin.password)||!equal(username,admin.username))fail(401,'아이디 또는 비밀번호가 맞지 않습니다.');
   await env.DB.prepare('DELETE FROM cms_attempts WHERE key=?').bind(key).run();return json({ok:true},200,{'Set-Cookie':cookie(await createSession(env))});
  }
  if(path==='/api/admin/logout'&&request.method==='POST'){const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(token)await env.DB.prepare('DELETE FROM cms_sessions WHERE token=?').bind(await digest(token)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
  if(path==='/api/admin/posts'&&request.method==='GET'){await requireAdmin(request,env);const rows=await env.DB.prepare('SELECT * FROM cms_posts ORDER BY updated DESC').all();return json({posts:rows.results.map(p=>({...p,payload:JSON.parse(p.payload),published:undefined,hasUnpublishedChanges:p.status==='published'&&p.payload!==p.published}))});}
  if(/^\/api\/admin\/posts(?:\/[A-Za-z0-9:_-]+)?$/.test(path)&&request.method==='POST'){
   await requireAdmin(request,env);const data=await readJSON(request),existingId=path.split('/')[4],existing=existingId?await env.DB.prepare('SELECT * FROM cms_posts WHERE id=?').bind(existingId).first():null;
   if(existingId&&!existing)fail(404,'글을 찾지 못했습니다.');const type=existing?.type||data.type;if(!['portfolio','news'].includes(type))fail(400,'글 종류를 선택해주세요.');
   const id=existing?.id||type+'_'+crypto.randomUUID(),action=data.action||'draft';if(!['draft','publish','unpublish','archive','restore'].includes(action))fail(400,'저장 방식을 확인해주세요.');
   const p=payload(type,existing?JSON.parse(existing.payload).id:id,data.payload||{}),raw=JSON.stringify(p);if(raw.length>160000)fail(413,'글이 너무 깁니다.');
   if(action==='publish'&&(!p.title||!p.visual||!p.sections.some(s=>s[1])))fail(400,'제목, 대표 사진, 본문을 입력해주세요.');
   let status=existing?.status||'draft',published=existing?.published||null;
   if(action==='publish'){status='published';published=raw;}else if(['unpublish','restore'].includes(action)){status='draft';published=null;}else if(action==='archive'){status='archived';published=null;}
   const now=Date.now();await env.DB.prepare('INSERT INTO cms_posts (id,type,status,title,payload,published,created,updated) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,title=excluded.title,payload=excluded.payload,published=excluded.published,updated=excluded.updated').bind(id,type,status,p.title||'제목 없는 글',raw,published,existing?.created||now,now).run();return json({id,status,hasUnpublishedChanges:status==='published'&&raw!==published},existing?200:201);
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
  if(path==='/content.js'||path==='/api/public/content.js'){const content=await publicContent(env);let script='window.NEMO_CONTENT='+JSON.stringify(safeData(content))+';';
   script+='(()=>{const grid=document.querySelector(".portfolio-grid");if(grid)grid.innerHTML='+JSON.stringify(content.projects.map(projectCard).join(''))+';if(document.body.dataset.page==="newsroom"){const news=document.querySelector(".news-grid");if(news)news.innerHTML='+JSON.stringify(content.stories.map(newsCard).join(''))+';const feature=document.querySelector(".news-feature");if(feature){';
   const p=content.stories[0];script+=p?'feature.href='+JSON.stringify('story.html?article='+encodeURIComponent(p.id))+';feature.innerHTML='+JSON.stringify('<div class="news-visual">'+visual(p.visual,p.title)+'</div><div class="news-card-copy"><span class="page-meta">'+escape(p.category+' · '+p.time+' 읽기')+'</span><h2>'+escape(p.title)+'</h2><p>'+escape(p.lead)+'</p><span class="card-arrow">↗</span></div>')+';':'feature.remove();';script+='}const count=document.querySelector("#news-count");if(count)count.textContent='+JSON.stringify(content.stories.length+'개의 이야기')+';}})();';
   return new Response(script,{headers:{'Content-Type':'application/javascript;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
  if(path.startsWith('/api/'))return json({error:'찾을 수 없는 요청입니다.'},404);
  const assetURL=new URL(request.url);if(path==='/')assetURL.pathname='/index.html';else if(path==='/admin')assetURL.pathname='/admin.html';else if(['/portfolios','/newsroom','/portfolio','/story','/about','/residential','/commercial','/office','/popup','/branding','/styling','/inquiry'].includes(path))assetURL.pathname=path+'.html';
  let response=await env.ASSETS.fetch(new Request(assetURL,request));
  if(path==='/admin'||path==='/admin.html'){response=new Response(response.body,response);response.headers.set('Cache-Control','no-store');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Content-Security-Policy',"default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'");return response;}
  if(['/portfolios','/portfolios.html','/newsroom','/newsroom.html'].includes(path)&&response.ok){
   const content=await publicContent(env),rewriter=new HTMLRewriter();
   if(path.startsWith('/portfolios')){rewriter.on('.portfolio-grid',{element:e=>e.setInnerContent(content.projects.map(projectCard).join(''),{html:true})});rewriter.on('#portfolio-count',{element:e=>e.setInnerContent(content.projects.length+'개의 공간')});}
   else{rewriter.on('.news-grid',{element:e=>e.setInnerContent(content.stories.map(newsCard).join(''),{html:true})});rewriter.on('.news-feature',{element:e=>{const p=content.stories[0];if(!p){e.remove();return;}e.setAttribute('href','story.html?article='+encodeURIComponent(p.id));e.setInnerContent('<div class="news-visual">'+visual(p.visual,p.title)+'</div><div class="news-card-copy"><span class="page-meta">'+escape(p.category+' · '+p.time+' 읽기')+'</span><h2>'+escape(p.title)+'</h2><p>'+escape(p.lead)+'</p><span class="card-arrow">↗</span></div>',{html:true});}});rewriter.on('#news-count',{element:e=>e.setInnerContent(content.stories.length+'개의 이야기')});}
   response=rewriter.transform(response);response=new Response(response.body,response);response.headers.set('Cache-Control','no-store');
  }
  return response;
 }catch(error){if(!error.status)console.error('CMS request failed:',error.message);return json({error:error.status?error.message:'처리하지 못했습니다. 잠시 후 다시 시도해주세요.'},error.status||500);}
}};
