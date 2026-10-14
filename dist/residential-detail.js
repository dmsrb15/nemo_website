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
  const title=stage.querySelector('.res-process-title'),cards=[...stage.querySelectorAll('[data-process-card]')],list=stage.querySelector('ol'),shell=stage.querySelector('.res-shell');let queued=false,layout;
  const clamp=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
  function measure(){
   const mobile=innerWidth<=680,columns=innerWidth<1200?Math.min(2,cards.length):cards.length,rows=Math.ceil(cards.length/columns),gap=columns<cards.length?14:24,width=list.clientWidth;
   const shellStyle=getComputedStyle(shell),room=innerHeight-title.offsetHeight-parseFloat(getComputedStyle(title).marginBottom)-parseFloat(shellStyle.paddingTop)-parseFloat(shellStyle.paddingBottom)-28;
   const rowRoom=(room-gap*(rows-1))/rows,deckWidth=Math.min(width,mobile?320:innerHeight<650?290:360),deckHeight=deckWidth/ .9;
   const cardWidth=Math.min(360,(width-gap*(columns-1))/columns,rowRoom*.9),cardHeight=columns===cards.length?cardWidth/.9:Math.min(rowRoom,Math.max(cardWidth/.9,mobile?250:220));
   layout={mobile,columns,rows,gap,width,deckWidth,deckHeight,cardWidth,cardHeight,finalHeight:rows*cardHeight+(rows-1)*gap};
   stage.style.height=motion.matches?'auto':(cards.length*.7+2)*100+'svh';
   stage.classList.toggle('process-deck-ready',!motion.matches);
   if(motion.matches){list.style.height='';cards.forEach(card=>{card.removeAttribute('style');[...card.children,card.querySelector('img')].forEach(child=>child.removeAttribute('style'));});}
  }
  function renderStage(){queued=false;const rect=stage.getBoundingClientRect(),travel=Math.max(1,stage.offsetHeight-innerHeight),progress=clamp(-rect.top/travel),shown=rect.top<=2;
   title.classList.toggle('stage-visible',motion.matches||shown);
   if(motion.matches){cards.forEach(card=>card.classList.add('stage-visible'));return;}
   const rawTurn=clamp((progress-.08)/.56)*(cards.length-1),base=Math.floor(rawTurn),turn=base+ease(clamp((rawTurn-base-.65)/.35)),spread=ease(clamp((progress-.74)/.18));
   const l=layout;list.style.height=(mix(l.deckHeight+42,l.finalHeight,spread))+'px';stage.classList.toggle('process-spread',spread>0);
   cards.forEach((card,i)=>{
    const delta=i-turn,depth=Math.min(3,Math.max(0,delta)),opacity=delta<0?clamp(1+delta*2):delta<=3?1:0;
    const deckY=delta<0?delta*110:depth*14,scale=delta<0?1:1-depth*.035,rotation=delta<0?delta*5:depth*1.3,row=Math.floor(i/l.columns),column=i%l.columns,rowCount=Math.min(l.columns,cards.length-row*l.columns);
    const finalX=(l.width-(rowCount*l.cardWidth+(rowCount-1)*l.gap))/2+column*(l.cardWidth+l.gap),finalY=row*(l.cardHeight+l.gap);
    card.classList.toggle('stage-visible',motion.matches||shown&&progress>=.04);
    card.style.opacity=motion.matches?'1':shown&&progress>=.04?String(mix(opacity,1,spread)):'0';
    card.style.width=mix(l.deckWidth,l.cardWidth,spread)+'px';card.style.height=mix(l.deckHeight,l.cardHeight,spread)+'px';card.style.padding=mix(l.mobile?28:32,l.mobile?16:Math.min(32,Math.max(24,l.cardWidth*.085)),spread)+'px';
    card.style.transform=`translate(${mix((l.width-l.deckWidth)/2,finalX,spread)}px,${mix(deckY,finalY,spread)}px) scale(${mix(scale,1,spread)}) rotate(${mix(rotation,0,spread)}deg)`;
    card.style.zIndex=String(cards.length-i);
    const contentOpacity=motion.matches?1:mix(clamp(1-Math.abs(delta)*2),1,spread);
    [...card.children].forEach(child=>child.style.opacity=String(contentOpacity));
    const number=card.querySelector(':scope > span'),heading=card.querySelector('h3'),copy=card.querySelector('p'),icon=card.querySelector('.res-process-emoji');
    number.style.fontSize=mix(13,l.mobile?10:12,spread)+'px';number.style.marginBottom=mix(25,l.mobile?10:18,spread)+'px';heading.style.fontSize=mix(l.mobile?25:28,l.mobile?15:Math.max(l.columns<cards.length?18:20,Math.min(28,l.cardWidth*.075)),spread)+'px';heading.style.marginBottom=mix(16,l.mobile?10:12,spread)+'px';copy.style.fontSize=mix(l.mobile?15:16,l.mobile?12:Math.max(l.columns<cards.length?12:13,Math.min(l.columns<cards.length?15:16,l.cardWidth*.05)),spread)+'px';
    const iconSize=mix(l.mobile?120:135,l.mobile?56:l.columns<cards.length?Math.min(80,l.cardWidth*.32):Math.min(135,l.cardWidth*.36),spread);icon.style.width=iconSize+'px';icon.style.height=iconSize+'px';icon.style.right=mix(25,l.mobile?14:24,spread)+'px';icon.style.bottom=mix(25,l.mobile?14:24,spread)+'px';
   });
  }
  function requestStage(){if(!queued){queued=true;requestAnimationFrame(renderStage);}}
  stage.classList.add('stage-motion-ready','process-deck-ready');measure();addEventListener('scroll',requestStage,{passive:true});addEventListener('resize',()=>{measure();requestStage();});motion.addEventListener('change',()=>{measure();requestStage();});renderStage();
 }
 root.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!motion.matches)d.querySelector('p').animate([{opacity:0},{opacity:1}],{duration:250});}));
})();
