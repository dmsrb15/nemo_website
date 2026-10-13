(() => {
  const root=document.querySelector('.nemo-about');
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs=[...root.querySelectorAll('[role="tab"]')];
  const panels=[...root.querySelectorAll('[role="tabpanel"]')];
  function selectTab(index,focus=false){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTab(index));
    tab.addEventListener('keydown',event=>{
      let target;
      if(event.key==='ArrowRight')target=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')target=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')target=0;
      if(event.key==='End')target=tabs.length-1;
      if(target!==undefined){event.preventDefault();selectTab(target,true);}
    });
  });
  const disclosures=[...root.querySelectorAll('.estimate-demo details')];
  disclosures.forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)disclosures.forEach(other=>{if(other!==detail)other.open=false;});}));
  if('IntersectionObserver' in window){
    const links=[...root.querySelectorAll('.about-nav a')];
    const sectionObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});});
    },{rootMargin:'-25% 0px -55% 0px',threshold:0});
    links.forEach(link=>{const section=root.querySelector(link.hash);if(section)sectionObserver.observe(section);});
    if(!reduced){
      const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.08});
      root.querySelectorAll('[data-reveal]').forEach(node=>{node.classList.add('reveal-ready');revealObserver.observe(node);});
    }
  }
})();
