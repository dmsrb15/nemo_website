(() => {
 const root=document.querySelector('.residential-detail');if(!root)return;
 const names={residential:'주거',commercial:'상업',office:'사무',popup:'팝업',branding:'브랜딩',styling:'스타일링'};
 const category=names[document.body.dataset.service],section=root.querySelector('.svc-projects');
 if(section){
  // Only published portfolio records from the public CMS response are eligible.
  const choices=(window.NEMO_RAW?.projects||[]).filter(p=>p.category===category&&p.visual);
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  const grid=section.querySelector('.svc-project-grid'),selected=choices.slice(0,5);
  grid.id='svc-project-gallery';grid.tabIndex=0;grid.setAttribute('role','region');grid.setAttribute('aria-label',category+' 포트폴리오 갤러리');
  const spriteKeys=new Set(['a-home','a-cafe','a-estimate','a-measure','a-material','a-complete']);
  for(const p of selected){
   const a=document.createElement('a');a.className='svc-project';a.href='/portfolio.html?project='+encodeURIComponent(p.id);a.dataset.projectCategory=p.category;a.dataset.resReveal='';
   const visual=document.createElement('div');visual.className='svc-project-visual';
   if(spriteKeys.has(p.visual)){
    const sprite=document.createElement('div');sprite.className='svc-project-sprite';sprite.dataset.visual=p.visual;sprite.setAttribute('role','img');sprite.setAttribute('aria-label',p.title);visual.append(sprite);
   }else{
    const src=p.visual.startsWith('/media/')?p.visual:p.visual==='photo'?'/assets/hero.png':['office','popup'].includes(p.visual)?'/assets/'+p.visual+'-3d.png':null;
    if(!src)continue;
    const img=document.createElement('img');img.src=src;img.alt=p.title;img.loading='lazy';img.decoding='async';visual.append(img);
   }
   const meta=document.createElement('div');meta.className='svc-project-meta';meta.textContent=[p.category,p.style].filter(Boolean).join(' · ');
   const title=document.createElement('div');title.className='svc-project-title';const h=document.createElement('h3');h.textContent=p.title;const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');title.append(h,arrow);
   a.append(visual,meta,title);grid.append(a);
  }
  const count=grid.children.length;section.hidden=!count;
  if(count){
   const all=section.querySelector('.svc-projects-head .res-link');
   all.className='svc-project svc-project-all';all.removeAttribute('data-res-reveal');
   const tile=document.createElement('div');tile.className='svc-project-visual';
   const label=document.createElement('span');label.textContent='더 많은 공간을 만나보세요.';
   const heading=document.createElement('strong');heading.textContent=all.textContent.replace('↗','').trim();
   const arrow=document.createElement('span');arrow.className='svc-project-all-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
   tile.append(label,heading,arrow);all.replaceChildren(tile);grid.append(all);
   const controls=document.createElement('div');controls.className='svc-gallery-controls';

   const makeButton=(label,text)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',category+' 포트폴리오 '+label);b.setAttribute('aria-controls',grid.id);b.textContent=text;return b;};
   const prev=makeButton('이전','←'),next=makeButton('다음','→');controls.append(prev,next);section.querySelector('.svc-projects-head').append(controls);

   function sync(){const max=grid.scrollWidth-grid.clientWidth;prev.disabled=grid.scrollLeft<2;next.disabled=grid.scrollLeft>=max-2;}
   function move(direction){const step=grid.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(grid).gap);grid.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
   prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
   grid.addEventListener('keydown',e=>{if(e.target!==grid)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}if(e.key==='Home'||e.key==='End'){e.preventDefault();grid.scrollTo({left:e.key==='Home'?0:grid.scrollWidth,behavior:'instant'});}});
   grid.addEventListener('scroll',sync,{passive:true});new ResizeObserver(sync).observe(grid);sync();
  }
 }
 const panels=[...root.querySelectorAll('.svc-focus-panel')];
 let pending=false;
 function updateFocus(){pending=false;if(!panels.length)return;const center=innerHeight*.5;let nearest=0,distance=Infinity;panels.forEach((p,i)=>{const r=p.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-center);if(d<distance){distance=d;nearest=i;}});panels.forEach((p,i)=>p.classList.toggle('is-current',i===nearest));}
 function requestFocus(){if(!pending){pending=true;requestAnimationFrame(updateFocus);}}
 if(panels.length){addEventListener('scroll',requestFocus,{passive:true});addEventListener('resize',requestFocus);updateFocus();}
})();
