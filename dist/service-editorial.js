(() => {
 const root=document.querySelector('.residential-detail');if(!root)return;
 const names={residential:'주거',commercial:'상업',office:'사무',popup:'팝업',branding:'브랜딩',styling:'스타일링'};
 const category=names[document.body.dataset.service],section=root.querySelector('.svc-projects');
 if(section){
  // Only published portfolio records from the public CMS response are eligible.
  const choices=(window.NEMO_RAW?.projects||[]).filter(p=>p.category===category&&p.visual);
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  const grid=section.querySelector('.svc-project-grid'),selected=choices.slice(0,3);
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
  grid.dataset.count=String(grid.children.length);section.hidden=!grid.children.length;
 }
 const panels=[...root.querySelectorAll('.svc-focus-panel')],counter=root.querySelector('.svc-focus-count b');
 let pending=false;
 function updateFocus(){pending=false;if(!panels.length)return;const center=innerHeight*.5;let nearest=0,distance=Infinity;panels.forEach((p,i)=>{const r=p.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-center);if(d<distance){distance=d;nearest=i;}});panels.forEach((p,i)=>p.classList.toggle('is-current',i===nearest));if(counter)counter.textContent=String(nearest+1).padStart(2,'0');}
 function requestFocus(){if(!pending){pending=true;requestAnimationFrame(updateFocus);}}
 if(panels.length){addEventListener('scroll',requestFocus,{passive:true});addEventListener('resize',requestFocus);updateFocus();}
})();
