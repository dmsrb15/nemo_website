(() => {
 'use strict';
 const root=document.documentElement,key='nemo-color-theme',system=matchMedia('(prefers-color-scheme: dark)');
 let preference=null;try{preference=localStorage.getItem(key);}catch{}
 if(!['light','dark'].includes(preference))preference=null;
 const icons={dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.5 14A8.8 8.8 0 0 1 10 3.5 8.8 8.8 0 1 0 20.5 14Z"/></svg>',light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>'};
 function apply(){
  const dark=preference?preference==='dark':system.matches,theme=dark?'dark':'light';root.dataset.theme=theme;root.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#141a16':'#f8f8f5');
  document.querySelectorAll('.theme-toggle').forEach(b=>{b.innerHTML=icons[dark?'light':'dark']+'<span>'+(dark?'라이트 모드':'다크 모드')+'</span>';b.setAttribute('aria-label',(dark?'라이트':'다크')+' 모드로 전환');b.setAttribute('aria-pressed',String(dark));b.title=(dark?'라이트':'다크')+' 모드로 전환';});
 }
 function button(){const b=document.createElement('button');b.type='button';b.className='theme-toggle';b.addEventListener('click',()=>{preference=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,preference);}catch{}apply();});return b;}
 function init(){
  const header=document.querySelector('.header,.page-header');
  if(header){const actions=document.createElement('div');actions.className='theme-actions';const cta=header.querySelector(':scope > .button');if(cta){header.insertBefore(actions,cta);actions.appendChild(button());actions.appendChild(cta);}else header.appendChild(button());}
  const footer=document.querySelector('.footer-legal');if(footer)footer.appendChild(button());
  if(!header&&!footer){const b=button();b.classList.add('theme-toggle-fixed');document.body.appendChild(b);}
  apply();
 }
 apply();system.addEventListener('change',()=>{if(!preference)apply();});
 addEventListener('storage',e=>{if(e.key===key){preference=['light','dark'].includes(e.newValue)?e.newValue:null;apply();}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
