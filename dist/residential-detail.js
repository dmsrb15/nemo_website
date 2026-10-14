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
 root.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!motion.matches)d.querySelector('p').animate([{opacity:0},{opacity:1}],{duration:250});}));
})();
