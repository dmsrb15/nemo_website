export function extensions({json,fail,readJSON,passwordHash,random,digest,cookie,createSession}){
 const RETENTION=30*86400000;
 async function actor(request,env){
  const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-nemo_admin='))?.slice(18);
  if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
  const row=await env.DB.prepare('SELECT a.id,a.username,a.role FROM cms_sessions s JOIN cms_admin a ON a.id=s.admin_id WHERE s.token=? AND s.expires>? AND a.active=1').bind(await digest(token),Date.now()).first();
  return row?{...row,role:row.id==='owner'?'master':'editor'}:null;
 }
 async function master(request,env){const user=await actor(request,env);if(!user)fail(401,'로그인이 필요합니다.');if(user.role!=='master')fail(403,'마스터 계정만 사용할 수 있습니다.');return user;}
 async function cleanup(env){
  const now=Date.now(),expired=await env.DB.prepare("SELECT id,payload,published FROM cms_posts WHERE status='archived' AND archived_at<=? LIMIT 50").bind(now-RETENTION).all();
  for(const row of expired.results){const ids=[...new Set(((row.payload||'')+(row.published||'')).match(/\/media\/[a-f0-9-]{36}/g)||[])].map(s=>s.slice(7));
   await env.DB.batch([...ids.map(id=>env.DB.prepare('INSERT OR IGNORE INTO cms_gc (id) SELECT ? WHERE EXISTS (SELECT 1 FROM cms_posts WHERE id=? AND status=? AND archived_at<=?)').bind(id,row.id,'archived',now-RETENTION)),env.DB.prepare('DELETE FROM cms_views WHERE post_id=?').bind(row.id),env.DB.prepare("DELETE FROM cms_posts WHERE id=? AND status='archived' AND archived_at<=?").bind(row.id,now-RETENTION)]);
  }
  const garbage=await env.DB.prepare('SELECT id FROM cms_gc LIMIT 50').all();
  for(const {id}of garbage.results){const referenced=await env.DB.prepare('SELECT id FROM cms_posts WHERE payload LIKE ? OR published LIKE ? LIMIT 1').bind('%/media/'+id+'%','%/media/'+id+'%').first();
   if(!referenced){await env.BUCKET.delete(id);await env.DB.prepare('DELETE FROM cms_media WHERE id=?').bind(id).run();}await env.DB.prepare('DELETE FROM cms_gc WHERE id=?').bind(id).run();
  }
  await env.DB.prepare('DELETE FROM cms_views WHERE expires<?').bind(now).run();
 }
 async function routes(path,request,env){
  if(path==='/api/admin/accounts'&&request.method==='GET'){await master(request,env);const rows=await env.DB.prepare('SELECT id,username,role,active,created,last_login FROM cms_admin ORDER BY created').all();return json({accounts:rows.results.map(r=>({...r,role:r.id==='owner'?'master':'editor'}))});}
  if(path==='/api/admin/accounts'&&request.method==='POST'){
   await master(request,env);const body=await readJSON(request);
   if(body.id){if(body.id==='owner')fail(403,'마스터 계정의 권한은 변경할 수 없습니다.');if(!['revoke','restore'].includes(body.action))fail(400,'권한 변경 방식을 확인해주세요.');const account=await env.DB.prepare('SELECT id FROM cms_admin WHERE id=?').bind(body.id).first();if(!account)fail(404,'계정을 찾지 못했습니다.');await env.DB.batch([env.DB.prepare('UPDATE cms_admin SET active=? WHERE id=?').bind(body.action==='restore'?1:0,body.id),env.DB.prepare('DELETE FROM cms_sessions WHERE admin_id=?').bind(body.id)]);return json({ok:true});}
   const username=String(body.username||'').trim().toLowerCase(),password=String(body.password||'');if(!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(username)||!password.length||password.length>128)fail(400,'아이디와 비밀번호를 입력해주세요.');
   const salt=random(),id=crypto.randomUUID(),hash=await passwordHash(password,salt,env.CMS_PASSWORD_PEPPER);
   const result=await env.DB.prepare("INSERT INTO cms_admin (id,email,username,password,salt,platform_id,role,active,created) SELECT ?,?,?,?,?,?,'editor',1,? WHERE NOT EXISTS (SELECT 1 FROM cms_admin WHERE username=?)").bind(id,'',username,hash,salt,'',Date.now(),username).run();if(!result.meta.changes)fail(409,'이미 사용 중인 아이디입니다.');return json({id},201);
  }
  if(path==='/api/admin/order'&&request.method==='POST'){
   if(!await actor(request,env))fail(401,'로그인이 필요합니다.');const {type,ids}=await readJSON(request);if(!['portfolio','news'].includes(type)||!Array.isArray(ids)||ids.length>1000||new Set(ids).size!==ids.length)fail(400,'글 순서를 확인해주세요.');
   const rows=await env.DB.prepare("SELECT id FROM cms_posts WHERE type=? AND status='published'").bind(type).all(),expected=new Set(rows.results.map(r=>r.id));if(ids.length!==expected.size||ids.some(id=>!expected.has(id)))fail(409,'게시글 목록이 변경되었습니다. 새로고침 후 다시 정렬해주세요.');
   if(ids.length)await env.DB.batch(ids.map((id,i)=>env.DB.prepare("UPDATE cms_posts SET sort_order=? WHERE id=? AND type=? AND status='published'").bind(i,id,type)));return json({ok:true});
  }
  if(path==='/api/public/view'&&request.method==='POST'){
   const {id,type}=await readJSON(request);if(!['portfolio','news'].includes(type)||typeof id!=='string'||id.length>100)fail(400,'글을 확인해주세요.');
   const rows=await env.DB.prepare("SELECT id,published,views FROM cms_posts WHERE type=? AND status='published'").bind(type).all(),post=rows.results.find(r=>JSON.parse(r.published).id===id);if(!post)fail(404,'게시된 글을 찾지 못했습니다.');
   if(await actor(request,env))return json({views:post.views});
   let reader=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-nemo_reader='))?.slice(19);if(!/^[A-Za-z0-9_-]{43}$/.test(reader||''))reader=random();
   const now=Date.now(),key=await digest(post.id+':'+reader+':'+Math.floor(now/86400000)),stamp=random();
   await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO cms_views (key,post_id,stamp,expires) VALUES (?,?,?,?)').bind(key,post.id,stamp,now+2*86400000),env.DB.prepare('UPDATE cms_posts SET views=views+1 WHERE id=? AND EXISTS (SELECT 1 FROM cms_views WHERE key=? AND stamp=?)').bind(post.id,key,stamp)]);
   const updated=await env.DB.prepare('SELECT views FROM cms_posts WHERE id=?').bind(post.id).first();return json({views:updated.views},200,{'Set-Cookie':'__Host-nemo_reader='+reader+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000'});
  }
  return null;
 }
 return {actor,master,cleanup,routes,RETENTION};
}
