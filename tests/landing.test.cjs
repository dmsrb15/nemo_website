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
 assert.ok(L.regions.some(r=>r.label==='경기 북부'));assert.ok(L.regions.some(r=>r.label==='경기 남부'));
 for(const region of L.regions){assert.equal(L.nearestRegion(region.x,region.y).label,region.label);assert.ok(region.x>=0&&region.x<=100&&region.y>=0&&region.y<=100);}
});

const fs=require('node:fs'),vm=require('node:vm'),publicSource=fs.readFileSync(require.resolve('../dist/landing-public.js'),'utf8');
test('map preview opens on hover, closes on leave, and stays pinned after a click',()=>{
 class Element{
  constructor(text=''){this.textContent=text;this.children=[];this.events={};this.dataset={};this.style={setProperty(){}};this.classList={remove(){},toggle(){}};}
  setAttribute(){} append(...children){this.children.push(...children);} appendChild(n){this.append(n);} replaceChildren(...children){this.children=children;} addEventListener(type,fn){this.events[type]=fn;} blur(){} remove(){} contains(){return false;}
 }
 const map=new Element(),popup=new Element(),timers=new Map();map.querySelectorAll=()=>map.children;popup.hidden=true;
 const document={activeElement:null,querySelector:s=>s==='.review-map-canvas'?map:popup,addEventListener(){}};
 const context={L,config:L.defaults,document,window:{},renderProjects(){},el:(_tag,text)=>new Element(text),setTimeout:fn=>{const id={};timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(publicSource.slice(publicSource.indexOf(' const groups='),publicSource.lastIndexOf('})();')),context);
 const [first,second]=map.children,flush=()=>{for(const fn of timers.values())fn();timers.clear();};
 first.events.pointerenter({pointerType:'mouse'});assert.equal(popup.hidden,false);
 first.events.pointerleave();flush();assert.equal(popup.hidden,true);
 first.events.pointerenter({pointerType:'touch'});assert.equal(popup.hidden,true);
 first.events.pointerenter({pointerType:'mouse'});first.events.click();first.events.pointerleave();flush();assert.equal(popup.hidden,false);
 second.events.pointerenter({pointerType:'mouse'});assert.match(popup.children[0].textContent,/서울/);
 first.events.click();assert.equal(popup.hidden,true);
 second.events.click();assert.equal(popup.hidden,false);assert.match(popup.children[0].textContent,/강릉/);
});
test('project count animates upward and preserves the final number and plus sign',()=>{
 let frame;const context={performance:{now:()=>0},requestAnimationFrame:fn=>{frame=fn;}};
 const start=publicSource.indexOf(' function countUp('),end=publicSource.indexOf('\n if(!reducedMotion',start);
 vm.runInNewContext(publicSource.slice(start,end),context);
 const node={textContent:'1,200+'};context.countUp(node);assert.equal(node.textContent,'0+');frame(400);const middle=Number(node.textContent.replace(/[,\+]/g,''));assert.ok(middle>0&&middle<1200);frame(1400);assert.equal(node.textContent,'1,200+');
 const custom={textContent:'문의'};context.countUp(custom);assert.equal(custom.textContent,'문의');
});
