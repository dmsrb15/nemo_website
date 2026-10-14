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
  const title=stage.querySelector('.res-process-title'),cards=[...stage.querySelectorAll('[data-process-card]')];let queued=false;
  function renderStage(){queued=false;const rect=stage.getBoundingClientRect(),travel=Math.max(1,stage.offsetHeight-innerHeight),progress=Math.max(0,Math.min(1,-rect.top/travel));
   title.classList.toggle('stage-visible',motion.matches||rect.top<=2);
   cards.forEach((card,i)=>card.classList.toggle('stage-visible',motion.matches||progress>=.12+i*(.54/Math.max(1,cards.length-1))));
  }
  function requestStage(){if(!queued){queued=true;requestAnimationFrame(renderStage);}}
  stage.classList.add('stage-motion-ready');addEventListener('scroll',requestStage,{passive:true});addEventListener('resize',requestStage);motion.addEventListener('change',requestStage);renderStage();
 }
 root.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!motion.matches)d.querySelector('p').animate([{opacity:0},{opacity:1}],{duration:250});}));
})();
