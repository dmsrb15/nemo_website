import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {Miniflare} from 'miniflare';
const origin='https://cms.test',owner={'oai-authenticated-user-id':'owner-test','oai-authenticated-user-email':'owner@cms.test'},password='Test-password-only-2026',email='admin@cms.test';
const fixture=new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1sAAAAASUVORK5CYII=','base64'));
const basePayload={title:'테스트 포트폴리오',category:'주거',style:'모던',kind:'아파트',lead:'소개',intro:'공간 소개',points:['빛','동선'],isActual:true,sections:[['소제목','본문 내용입니다.','']],images:[],visual:''};
test('CMS authentication, draft isolation, uploads, escaping and recovery',async()=>{
 const mf=new Miniflare({modules:true,scriptPath:'dist/server/index.js',compatibilityDate:'2026-05-22',d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{CMS_PASSWORD_PEPPER:'LOCAL-TEST-PEPPER-ONLY',CMS_SETUP_OWNER_EMAIL:'owner@cms.test'},serviceBindings:{ASSETS:async()=>new Response('<html><head></head><body>asset</body></html>',{headers:{'Content-Type':'text/html'}})}});
 try{
  const db=await mf.getD1Database('DB');for(const file of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql'))){const statements=fs.readFileSync(path.join('drizzle',file),'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);for(const sql of statements)await db.prepare(sql).run();}
  const req=(url,method='GET',body,headers={})=>mf.dispatchFetch(origin+url,{method,headers:{...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  assert.equal((await req('/api/admin/posts')).status,401);
  assert.equal((await req('/api/admin/setup','POST',{email,password})).status,403);
  assert.equal((await req('/api/admin/setup','POST',{email,password},{...owner,Origin:'https://evil.test'})).status,403);
  let response=await req('/api/admin/setup','POST',{email,password},owner);assert.equal(response.status,201);let cookie=response.headers.get('Set-Cookie').split(';')[0],auth={Cookie:cookie};
  assert.ok(response.headers.get('Set-Cookie').includes('HttpOnly'));assert.ok(response.headers.get('Set-Cookie').includes('Secure'));
  assert.equal((await req('/api/admin/setup','POST',{email,password},owner)).status,409);
  assert.equal((await req('/api/admin/login','POST',{email,password:'wrong-password-long'})).status,401);
  response=await req('/api/admin/login','POST',{email,password});assert.equal(response.status,200);cookie=response.headers.get('Set-Cookie').split(';')[0];auth={Cookie:cookie};
  const list=await (await req('/api/admin/posts','GET',undefined,auth)).json();assert.ok(list.posts.length>10);
  const legacy=list.posts.find(p=>p.id.startsWith('portfolio:'));response=await req('/api/admin/posts/'+encodeURIComponent(legacy.id),'POST',{type:legacy.type,payload:{...legacy.payload,images:[]},action:'draft'},auth);assert.equal(response.status,200);
  response=await mf.dispatchFetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,'Content-Type':'image/png',...auth},body:fixture});assert.equal(response.status,201);const photo=(await response.json()).url;
  assert.equal((await req(photo)).status,404);assert.equal((await req(photo,'GET',undefined,auth)).status,200);
  response=await mf.dispatchFetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,'Content-Type':'image/png',...auth},body:'not an image at all'});assert.equal(response.status,415);
  const payload={...basePayload,visual:photo,images:[photo],title:'<img src=x onerror=alert(1)> 공간'};
  response=await req('/api/admin/posts','POST',{type:'portfolio',payload,action:'draft'},auth);assert.equal(response.status,201);const id=(await response.json()).id;
  const content=async()=>{const code=await (await req('/api/public/content.js')).text();const ctx={window:{},document:{querySelector:()=>null,body:{dataset:{page:'none'}}}};vm.runInNewContext(code,ctx);return ctx.window.NEMO_CONTENT;};
  assert.ok(!(await content()).projects.some(p=>p.id===id));
  response=await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload,action:'publish'},auth);assert.equal(response.status,200);
  assert.equal((await req(photo)).status,200);const published=(await content()).projects.find(p=>p.id===id);assert.ok(published.title.includes('&lt;img'));assert.ok(!published.title.includes('<img'));
  const changed={...payload,title:'수정 중인 제목'};await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload:changed,action:'draft'},auth);assert.equal((await content()).projects.find(p=>p.id===id).title,published.title);
  await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload:changed,action:'publish'},auth);assert.equal((await content()).projects.find(p=>p.id===id).title,changed.title);
  await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload:changed,action:'unpublish'},auth);assert.ok(!(await content()).projects.some(p=>p.id===id));assert.equal((await req(photo)).status,404);
  await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload:changed,action:'archive'},auth);let archived=(await (await req('/api/admin/posts','GET',undefined,auth)).json()).posts.find(p=>p.id===id);assert.equal(archived.status,'archived');
  await req('/api/admin/posts/'+id,'POST',{type:'portfolio',payload:changed,action:'restore'},auth);let restored=(await (await req('/api/admin/posts','GET',undefined,auth)).json()).posts.find(p=>p.id===id);assert.equal(restored.status,'draft');
  assert.equal((await req('/api/admin/recover','POST',{email,password:'replacement-password'},auth)).status,403);
  assert.equal((await req('/api/admin/recover','POST',{email,password:'replacement-password'},{...owner,'oai-authenticated-user-id':'different-owner'})).status,403);
  const news={title:'새로운 뉴스',category:'네모 가이드',lead:'뉴스 소개',sections:[['소제목','뉴스 본문',photo]],images:[photo],visual:photo};
  response=await req('/api/admin/posts','POST',{type:'news',payload:news,action:'publish'},auth);assert.equal(response.status,201);const newsId=(await response.json()).id;assert.equal((await content()).stories.find(p=>p.id===newsId).title,news.title);
  response=await req('/api/admin/recover','POST',{email,password:'replacement-password'},owner);assert.equal(response.status,200);assert.equal((await req('/api/admin/posts','GET',undefined,auth)).status,401);
  const newAuth={Cookie:response.headers.get('Set-Cookie').split(';')[0]};await req('/api/admin/logout','POST',undefined,newAuth);assert.equal((await req('/api/admin/posts','GET',undefined,newAuth)).status,401);
  for(let i=0;i<8;i++)await req('/api/admin/login','POST',{email,password});assert.equal((await req('/api/admin/login','POST',{email,password})).status,429);
 }finally{await mf.dispose();}
});
