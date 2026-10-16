const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('../dist/landing-data.js');
test('landing selection is capped, category-specific, unique, and does not mutate the source',()=>{
 const pool=Array.from({length:20},(_,i)=>({id:String(i),category:i%2?'상업':'주거'})),before=JSON.stringify(pool);
 const a=L.pickProjects(pool,'전체',6,()=>.1),b=L.pickProjects(pool,'전체',6,()=>.8);
 assert.equal(a.length,6);assert.equal(new Set(a.map(x=>x.id)).size,6);assert.notDeepEqual(a,b);assert.equal(JSON.stringify(pool),before);
 assert.ok(L.pickProjects(pool,'주거').every(p=>p.category==='주거'));assert.deepEqual(L.pickProjects(pool,'팝업'),[]);
 assert.equal(L.pickProjects([pool[0],pool[0]]).length,1);
});
test('multiple reviews from one region share one map pin, preserving every review',()=>{
 const rows=[{id:'1',region:'seoul',mapLabel:'서울 · 경기'},{id:'2',region:'seoul'},{id:'3',region:'busan'}],groups=L.groupReviews(rows);
 assert.equal(groups.length,2);assert.equal(groups[0].reviews.length,2);assert.equal(groups[0].label,'서울 · 경기');assert.equal(groups.reduce((n,g)=>n+g.reviews.length,0),3);
 assert.deepEqual(L.groupReviews([{region:'unknown'}]),[]);
});
test('region selection uses known coordinates and automatically returns the region name',()=>{
 for(const region of L.regions){assert.equal(L.nearestRegion(region.x,region.y).label,region.label);assert.ok(region.x>=0&&region.x<=100&&region.y>=0&&region.y<=100);}
});
