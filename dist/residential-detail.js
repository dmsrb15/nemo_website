(() => {
 const root=document.querySelector('.residential-detail');if(!root)return;
 const nodes=[...root.querySelectorAll('[data-res-reveal]')],motion=matchMedia('(prefers-reduced-motion: reduce)');
 let observer;
 function configure(){
  observer?.disconnect();
  if(motion.matches||!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.remove('res-reveal-ready'));return;}
  nodes.forEach(n=>{const group=n.closest('[data-res-group]');const siblings=group?[...group.querySelectorAll('[data-res-reveal]')].filter(x=>x.closest('[data-res-group]')===group):[n];n.style.setProperty('--res-delay',(n.dataset.resDelay??Math.min(siblings.indexOf(n)*130,390))+'ms');n.classList.add('res-reveal-ready');});
  observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible');else if(e.boundingClientRect.top>innerHeight)e.target.classList.remove('is-visible');});},{threshold:0,rootMargin:'0px 0px -6% 0px'});
  nodes.forEach(n=>observer.observe(n));
 }
 configure();motion.addEventListener('change',configure);
 const stage=root.querySelector('.res-process-stage');
 if(stage){
  const title=stage.querySelector('.res-process-title'),cards=[...stage.querySelectorAll('[data-process-card]')],list=stage.querySelector('ol');let queued=false,cardHeight=300;
  const overview=document.createElement('section');overview.className='res-process res-process-stage res-process-overview';overview.setAttribute('aria-label','진행 과정 전체');
  const shell=document.createElement('div');shell.className='res-shell';const overviewTitle=document.createElement('h2');overviewTitle.className='res-overview-title';overviewTitle.textContent='한눈에 보는 진행 과정';const overviewList=list.cloneNode(true);overviewList.querySelectorAll('[data-process-card]').forEach(card=>card.removeAttribute('data-process-card'));overview.style.setProperty('--process-count',cards.length);overview.style.setProperty('--process-width',cards.length*360+(cards.length-1)*24+'px');shell.append(overviewTitle,overviewList);overview.append(shell);stage.after(overview);
  list.setAttribute('aria-hidden','true');
  const overviewObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('overview-visible');}),{threshold:.12});overviewList.querySelectorAll('li').forEach(card=>overviewObserver.observe(card));
  const clamp=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
  function measure(){
   cards.forEach(card=>card.style.minHeight='');
   cardHeight=Math.max(...cards.map(card=>card.offsetHeight));
   stage.style.height=motion.matches?'auto':(cards.length*.7+1.3)*100+'svh';list.style.height=motion.matches?'auto':(cardHeight+48)+'px';
   cards.forEach(card=>card.style.minHeight=motion.matches?'':cardHeight+'px');
  }
  function renderStage(){queued=false;const rect=stage.getBoundingClientRect(),travel=Math.max(1,stage.offsetHeight-innerHeight),progress=clamp(-rect.top/travel),shown=rect.top<=2;
   title.classList.toggle('stage-visible',motion.matches||shown);
   const rawTurn=clamp((progress-.09)/.8)*(cards.length-1),base=Math.floor(rawTurn),turn=base+ease(clamp((rawTurn-base-.65)/.35)),spread=0,center=0;
   cards.forEach((card,i)=>{
    const delta=i-turn,depth=Math.min(3,Math.max(0,delta)),opacity=delta<0?clamp(1+delta*2):delta<=3?1:0;
    const deckY=center+(delta<0?delta*110:depth*14),scale=delta<0?1:1-depth*.035,rotation=delta<0?delta*5:depth*1.3;
    card.classList.toggle('stage-visible',motion.matches||shown&&progress>=.04);
    card.style.opacity=motion.matches?'1':shown&&progress>=.04?String(mix(opacity,1,spread)):'0';
    card.style.transform=motion.matches?'none':`translateY(${deckY}px) scale(${scale}) rotate(${rotation}deg)`;
    card.style.zIndex=String(cards.length-i);
    const contentOpacity=motion.matches?1:mix(clamp(1-Math.abs(delta)*2),1,spread);
    [...card.children].forEach(child=>child.style.opacity=String(contentOpacity));
   });
  }
  function requestStage(){if(!queued){queued=true;requestAnimationFrame(renderStage);}}
  stage.classList.add('stage-motion-ready','process-deck-ready');measure();addEventListener('scroll',requestStage,{passive:true});addEventListener('resize',()=>{measure();requestStage();});motion.addEventListener('change',()=>{measure();requestStage();});renderStage();
 }
 root.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!motion.matches)d.querySelector('p').animate([{opacity:0},{opacity:1}],{duration:250});}));
})();
