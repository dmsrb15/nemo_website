(() => {
 const root=document.querySelector('.service-detail');if(!root)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const tabs=[...root.querySelectorAll('[role="tab"]')],panels=[...root.querySelectorAll('[role="tabpanel"]')];
 const tablist=root.querySelector('[role="tablist"]');
 let animation;
 function select(index,focus=false){animation?.cancel();tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});if(!motion.matches)animation=panels[index].animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'});if(focus)tabs[index].focus();}
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();select(next,true);}});});
 function orientation(){tablist.setAttribute('aria-orientation',innerWidth<=760?'horizontal':'vertical');}orientation();addEventListener('resize',orientation);
 root.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open&&!motion.matches)detail.querySelector('p').animate([{opacity:0},{opacity:1}],{duration:300});}));
 const nodes=[...root.querySelectorAll('[data-service-reveal]')];let observer;
 if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-visible');else if(entry.boundingClientRect.top>=innerHeight||entry.boundingClientRect.bottom<=0)entry.target.classList.remove('is-visible');}),{threshold:[0,.1]});nodes.forEach((node,index)=>{node.style.setProperty('--service-reveal-delay',(index%3)*140+'ms');observer.observe(node);});}
 function configure(){nodes.forEach(node=>node.classList.toggle('service-reveal-ready',!!observer&&!motion.matches));if(motion.matches)animation?.cancel();}motion.addEventListener('change',configure);configure();
})();
