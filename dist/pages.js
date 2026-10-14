(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const content=window.NEMO_CONTENT;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visual=(key,alt,lazy=true)=>key?.startsWith('/media/')?`<img src="${key}" alt="${alt}" ${lazy?'loading="lazy"':''}>`:(key==='office'||key==='popup')?`<img class="office-image" src="assets/${key}-3d.png" alt="${alt}" ${lazy?'loading="lazy"':''}>`:key==='photo'?`<img src="assets/hero.png" alt="${alt}" ${lazy?'loading="lazy"':''}>`:`<div class="atlas ${key}" role="img" aria-label="${alt}"></div>`;
  const mode=document.body.dataset.page;
  $$('.page-header nav a').forEach(a=>{if(a.getAttribute('href') === (mode==='portfolio'?'portfolios.html':mode==='story'?'newsroom.html':mode+'.html'))a.setAttribute('aria-current','page');});
  const toggle=$('.page-menu-toggle');
  toggle.addEventListener('click',()=>{const open=$('.page-header').classList.toggle('menu-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('.page-header').classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');}});
  $$('dialog').forEach(dialog=>{
    $('.page-dialog-close',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  });
  if(mode==='newsroom'){
    $$('[data-news-filter]').forEach(button=>button.addEventListener('click',()=>{
      $$('[data-news-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      $$('.news-grid .news-card').forEach(card=>card.hidden=button.dataset.newsFilter!=='전체'&&card.dataset.newsCategory!==button.dataset.newsFilter);
      $('#news-count').textContent=$$('.news-grid .news-card').filter(c=>!c.hidden).length+'개의 이야기';
    }));
  }
  if(mode==='portfolios'){
    const tools=$('.portfolio-tools');
    const filterToggle=document.createElement('button');filterToggle.className='portfolio-filter-toggle';filterToggle.type='button';filterToggle.setAttribute('aria-expanded','true');filterToggle.setAttribute('aria-controls','portfolio-filters');filterToggle.innerHTML='<span>분류해서 찾아보기</span><span aria-hidden="true">−</span>';
    const filters=document.createElement('div');filters.id='portfolio-filters';
    $$('.portfolio-filter-row,#filter-reset',tools).forEach(row=>filters.append(row));tools.append(filterToggle,filters);
    filterToggle.addEventListener('click',()=>{const open=filterToggle.getAttribute('aria-expanded')!=='true';filterToggle.setAttribute('aria-expanded',String(open));filters.hidden=!open;filterToggle.lastElementChild.textContent=open?'−':'+';});
    const params=new URLSearchParams(location.search);
    let category=['전체','주거','상업','사무','팝업','브랜딩','스타일링'].includes(params.get('space'))?params.get('space'):'전체';
    let style=['전체','내추럴','모던','미니멀'].includes(params.get('style'))?params.get('style'):'전체';
    $('#portfolio-search').value=params.get('q')||'';
    function render(){
      const query=$('#portfolio-search').value.trim().toLocaleLowerCase();
      let count=0;
      $$('.portfolio-item').forEach(card=>{card.hidden=(category!=='전체'&&card.dataset.category!==category)||(style!=='전체'&&card.dataset.style!==style)||!card.dataset.search.toLocaleLowerCase().includes(query);if(!card.hidden)count++;});
      $('#portfolio-count').textContent=count+'개의 공간';$('.portfolio-empty').hidden=count!==0;
      $('#search-clear').hidden=!query;
      $$('[data-project-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.projectFilter===category)));
      $$('[data-style-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.styleFilter===style)));
      const next=new URLSearchParams();if(category!=='전체')next.set('space',category);if(style!=='전체')next.set('style',style);if(query)next.set('q',$('#portfolio-search').value.trim());
      history.replaceState(null,'',location.pathname+(next.size?'?'+next:''));
    }
    function reset(){category='전체';style='전체';$('#portfolio-search').value='';render();}
    $$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.projectFilter;render();}));
    $$('[data-style-filter]').forEach(b=>b.addEventListener('click',()=>{style=b.dataset.styleFilter;render();}));
    $('#portfolio-search').addEventListener('input',render);
    $('#search-clear').addEventListener('click',()=>{$('#portfolio-search').value='';render();$('#portfolio-search').focus();});
    $('#filter-reset').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
    $('#portfolio-sort').addEventListener('change',()=>{
      const cards=$$('.portfolio-item');cards.sort((a,b)=>$('#portfolio-sort').value==='name'?$('h2',a).textContent.localeCompare($('h2',b).textContent,'ko'):content.projects.findIndex(p=>p.id===a.dataset.id)-content.projects.findIndex(p=>p.id===b.dataset.id));cards.forEach(c=>$('.portfolio-grid').append(c));
    });render();
  }
  if(mode==='portfolio'){
    const requested=new URLSearchParams(location.search).get('project');
    const p=content.projects.find(p=>p.id===requested)||(requested?null:content.projects[0]);
    if(!p){$('#project-detail').innerHTML='<div class="portfolio-empty"><h1>찾는 공간이 없어요.</h1><p>전체 포트폴리오에서 다른 공간을 살펴보세요.</p><a class="button yellow" href="portfolios.html">전체 포트폴리오 보기 ↗</a></div>';return;}
    document.title=p.title+' — NEMO';
    const gallery=[...new Set([p.visual,...(p.images||[]),...p.sections.map(s=>s[2])].filter(Boolean))];let image=0;
    $('#project-detail').innerHTML=`<div class="detail-hero"><div><div class="gallery-main"><div class="gallery-image" id="gallery-image"></div><button class="gallery-zoom" aria-label="이미지 크게 보기">⤢</button></div><div class="gallery-controls"><button data-gallery-prev aria-label="이전 이미지">←</button><span id="gallery-count" role="status"></span><button data-gallery-next aria-label="다음 이미지">→</button></div><div class="gallery-thumbs" role="group" aria-label="갤러리 이미지 선택">${gallery.map((v,i)=>`<button data-gallery-index="${i}" aria-label="${i+1}번째 이미지" aria-pressed="${i===0}">${visual(v,p.title+' '+(i+1))}</button>`).join('')}</div></div><div class="detail-intro"><span class="page-meta">${p.category} · ${p.style} · 공간 콘셉트</span><h1>${p.title}</h1><p class="detail-lead">${p.lead}</p><dl class="detail-info"><div><dt>공간 유형</dt><dd>${p.kind}</dd></div><div><dt>스타일</dt><dd>${p.style}</dd></div><div><dt>디자인 방향</dt><dd>${p.points[0]}</dd></div><div><dt>핵심 요소</dt><dd>${p.points.slice(1).join(' · ')}</dd></div></dl><a class="button yellow" href="inquiry.html?space=${encodeURIComponent(p.category)}&project=${p.id}">이런 공간 상담하기 ↗</a></div></div><nav class="detail-sticky-nav" aria-label="공간 이야기 목차"><a href="#project-intro">공간 소개</a>${p.sections.map((s,i)=>`<a href="#project-section-${i}">${s[0]}</a>`).join('')}</nav><p class="detail-description" id="project-intro">${p.intro}</p>${p.sections.map((s,i)=>`<section class="detail-section" id="project-section-${i}"><div class="detail-section-copy"><h2>${s[0]}</h2><p>${s[1]}</p></div><div class="detail-section-visual">${visual(s[2],s[0])}</div></section>`).join('')}<aside class="page-cta"><h2>의뢰인님의 공간에는<br>어떤 변화가 필요할까요?</h2><a class="button yellow" href="inquiry.html?space=${encodeURIComponent(p.category)}&project=${p.id}">내 공간 이야기하기 ↗</a></aside>`;
    const hero=$('.detail-hero'),intro=$('.detail-intro'),thumbs=$('.gallery-thumbs');
    hero.after(intro);hero.append(thumbs);
    const highlights=document.createElement('div');highlights.className='detail-highlights';highlights.innerHTML=`<span>이 공간의 포인트</span><div>${p.points.map(point=>`<span>${point}</span>`).join('')}</div>`;intro.append(highlights);
    const note=document.createElement('section');note.className='detail-design-note';note.id='project-note';note.innerHTML=`<span class="page-eyebrow">NEMO DESIGN NOTE</span><h2>작은 선택이 모여,<br>공간의 인상이 돼요.</h2><p>${p.lead} ${p.intro}</p><div>${p.points.map((point,i)=>`<span><small>0${i+1}</small>${point}</span>`).join('')}</div>`;
    $('.page-cta').before(note);$('.detail-sticky-nav').insertAdjacentHTML('beforeend','<a href="#project-note">디자인 노트</a>');
    const related=content.projects.filter(item=>item.id!==p.id).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)).slice(0,3);
    const relatedSection=document.createElement('section');relatedSection.className='related-projects';relatedSection.innerHTML=`<div class="related-projects-heading"><h2>다른 공간도 살펴보세요.</h2><a href="portfolios.html">전체 공간 보기 ↗</a></div><div class="portfolio-grid">${related.map(item=>`<a class="portfolio-item" href="portfolio.html?project=${item.id}"><div class="portfolio-cover">${visual(item.visual,item.title)}</div><div class="portfolio-caption"><h2>${item.title}</h2><span aria-hidden="true">↗</span></div><p>${item.category} · ${item.style}</p></a>`).join('')}</div>`;$('.page-cta').before(relatedSection);
    function showImage(index){image=(index+gallery.length)%gallery.length;$('#gallery-image').innerHTML=visual(gallery[image],p.title+' '+(image+1),false);$('#gallery-full').innerHTML=visual(gallery[image],p.title+' '+(image+1),false);$('#gallery-count').textContent=String(image+1).padStart(2,'0')+' / '+String(gallery.length).padStart(2,'0');$('#gallery-dialog-count').textContent=(image+1)+' / '+gallery.length;$$('[data-gallery-index]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.galleryIndex)===image)));}
    $$('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>showImage(Number(b.dataset.galleryIndex))));
    $$('[data-gallery-prev],.gallery-prev').forEach(b=>b.addEventListener('click',()=>showImage(image-1)));
    $$('[data-gallery-next],.gallery-next').forEach(b=>b.addEventListener('click',()=>showImage(image+1)));
    $('.gallery-zoom').addEventListener('click',()=>$('#gallery-dialog').showModal());
    $('#gallery-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showImage(image+(e.key==='ArrowRight'?1:-1));}});
    const links=$$('.detail-sticky-nav a');const sections=links.map(a=>$(a.getAttribute('href')));
    function updateContents(){let index=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.45)index=i;});links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
    addEventListener('scroll',updateContents,{passive:true});showImage(0);updateContents();
  }
  if(mode==='story'){
    const requested=new URLSearchParams(location.search).get('article');const s=content.stories.find(s=>s.id===requested)||(requested?null:content.stories[0]);
    if(!s){$('#story-detail').innerHTML='<div class="portfolio-empty"><h1>찾는 이야기가 없어요.</h1><a class="button yellow" href="newsroom.html">뉴스룸으로 ↗</a></div>';return;}
    document.title=s.title+' — NEMO';
    $('#story-detail').innerHTML=`<header class="article-header"><span class="page-meta">${s.category} · ${s.time} 읽기</span><h1>${s.title}</h1><p class="article-lead">${s.lead}</p></header><div class="article-cover">${visual(s.visual,s.title,false)}</div><div class="article-body">${s.sections.map(([title,copy])=>`<section><h2>${title}</h2><p>${copy}</p></section>`).join('')}<div class="article-end"><span>NEMO DESIGN NOTE</span><button class="text-button" id="story-copy">이야기 링크 복사 ↗</button></div></div><aside class="page-cta"><h2>생각한 공간을 함께 이야기해요.</h2><a class="button yellow" href="inquiry.html">상담 신청하기 ↗</a></aside><section class="related-stories"><h2>이런 이야기도 있어요.</h2><div class="news-grid">${content.stories.filter(x=>x.id!==s.id).slice(0,3).map(x=>`<a class="news-card" href="story.html?article=${x.id}"><div class="news-visual">${visual(x.visual,x.title)}</div><div class="news-card-copy"><span class="page-meta">${x.category} · ${x.time} 읽기</span><h3>${x.title}</h3></div></a>`).join('')}</div></section>`;
    $('#story-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('#story-copy').textContent='링크를 복사했어요 ✓';}catch{$('#story-copy').textContent='주소창의 링크를 복사해주세요';}});
  }
  if(mode==='inquiry'){
    const form=$('#inquiry-form'),panels=$$('.inquiry-panel');let step=0;
    const params=new URLSearchParams(location.search),space=params.get('space');
    if(['주거','상업','사무','팝업'].includes(space))$$('[name="space"]',form).forEach(x=>x.checked=x.value===space);
    function updateExtras(){const type=$('[name="space"]:checked',form)?.value||'주거';const showBrand=['상업','사무','팝업'].includes(type);$('#branding-option').hidden=!showBrand;$('[name="branding"]',form).disabled=!showBrand;if(!showBrand)$('[name="branding"]',form).checked=false;$('#extras-help').textContent=type==='주거'?'가구·조명·소품으로 분위기를 바꾸고 싶다면 스타일링을 선택해주세요. 선택하지 않아도 괜찮아요.':type==='사무'?'팀의 분위기를 담는 브랜딩과 가구·조명 스타일링이 필요하면 선택해주세요. 선택하지 않아도 괜찮아요.':'브랜드의 방향과 공간의 분위기도 함께 이야기하고 싶다면 선택해주세요. 선택하지 않아도 괜찮아요.';}
    $$('[name="space"]',form).forEach(input=>input.addEventListener('change',updateExtras));updateExtras();
    const extra=params.get('extra');
    if(extra==='브랜딩'&&!$('[name="branding"]',form).disabled)$('[name="branding"]',form).checked=true;
    if(extra==='스타일링')$('[name="styling"]',form).checked=true;
    const project=content.projects.find(p=>p.id===params.get('project'));
    if(project)$('[name="message"]',form).value=project.title+' 같은 분위기의 공간을 이야기하고 싶어요.';
    function values(){const d=new FormData(form);d.set('additionalServices',[d.get('branding'),d.get('styling')].filter(Boolean).join(', ')||'선택 안 함');if(d.has('areaCustom'))d.set('area',d.get('areaCustom')+' '+d.get('areaUnit'));if(d.has('budgetCustom'))d.set('budget',Number(d.get('budgetCustom')).toLocaleString('ko-KR')+'만 원');if(d.get('addressDetail'))d.set('location',d.get('location')+' '+d.get('addressDetail'));return d;}
    $$('[data-direct]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.direct,select=$('#'+key+'-select'),box=$('#'+key+'-direct'),direct=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(direct));button.textContent=direct?'범위로 선택할게요':'직접 입력할게요';select.hidden=direct;select.disabled=direct;box.hidden=!direct;$$('input,select',box).forEach(field=>{field.disabled=!direct;if(field.tagName==='INPUT')field.required=direct;});if(direct)$('input',box).focus();}));
    const requiredConsents=$$('[name="termsConsent"],[name="privacyConsent"]',form);
    $('#consent-required-all').addEventListener('change',e=>{requiredConsents.forEach(x=>x.checked=e.target.checked);});
    requiredConsents.forEach(x=>x.addEventListener('change',()=>{const count=requiredConsents.filter(x=>x.checked).length;$('#consent-required-all').checked=count===requiredConsents.length;$('#consent-required-all').indeterminate=count>0&&count<requiredConsents.length;}));
    let postcodeLoading;
    function postcodeAPI(){return new Promise((resolve,reject)=>{if(window.kakao?.Postcode||window.daum?.Postcode){resolve(window.kakao?.Postcode||window.daum.Postcode);return;}if(postcodeLoading){postcodeLoading.then(resolve,reject);return;}postcodeLoading=new Promise((ok,fail)=>{const script=document.createElement('script');script.src='https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';script.onload=()=>{const API=window.kakao?.Postcode||window.daum?.Postcode;API?ok(API):fail(new Error('unavailable'));};script.onerror=()=>fail(new Error('network'));document.head.append(script);});postcodeLoading.then(resolve,e=>{postcodeLoading=null;reject(e);});});}
    $('#address-search').addEventListener('click',async()=>{const panel=$('#address-search-panel'),status=$('#address-search-status');panel.hidden=false;status.textContent='주소 검색을 준비하고 있어요.';$('#address-search').disabled=true;try{const API=await postcodeAPI();$('#address-search-container').replaceChildren();new API({width:'100%',height:'100%',oncomplete:data=>{const address=data.userSelectedType==='R'?data.roadAddress:data.jibunAddress;$('#space-address').value=address||data.address;$('#space-address').setCustomValidity('');panel.hidden=true;$('[name="addressDetail"]',form).focus();},onresize:data=>{$('#address-search-container').style.height=data.height+'px';}}).embed($('#address-search-container'));status.textContent='';panel.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});}catch{status.textContent='주소 검색을 불러오지 못했어요. 주소를 직접 입력하거나 잠시 후 다시 검색해주세요.';}finally{$('#address-search').disabled=false;}});
    $('#address-search-close').addEventListener('click',()=>{$('#address-search-panel').hidden=true;$('#address-search').focus();});
    const labels={space:'공간 유형',additionalServices:'추가 서비스',location:'공간 위치',area:'면적',budget:'예산',timing:'공사 시기',name:'성함',phone:'연락처',message:'원하는 변화'};
    function summary(){const d=values();$('#inquiry-summary').replaceChildren();Object.entries(labels).forEach(([key,label])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=d.get(key)||'상담하며 이야기할게요';$('#inquiry-summary').append(dt,dd);});}
    function validate(index){const fields=$$('input,select,textarea',panels[index]);fields.forEach(field=>{if(field.name==='phone'){const phone=field.value.trim(),digits=phone.replace(/\D/g,'');field.setCustomValidity(/^[+0-9 ()-]{8,25}$/.test(phone)&&digits.length>=8&&digits.length<=15?'':'숫자로 된 연락처를 입력해주세요.');}else if(field.required&&['name','location'].includes(field.name)){field.setCustomValidity(field.value.trim()?'':'필수 항목을 입력해주세요.');}});const invalid=fields.find(x=>!x.checkValidity());if(invalid){$('#inquiry-error').textContent=invalid.name==='confirm'?'이메일 발송 방식을 확인해주세요.':invalid.name==='phone'?'연락처를 다시 확인해주세요.':'필수 항목을 입력해주세요.';invalid.reportValidity();invalid.focus();return false;}$('#inquiry-error').textContent='';return true;}
    function go(index){step=index;panels.forEach((p,i)=>p.hidden=i!==step);$$('.inquiry-steps li').forEach((li,i)=>{if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});$('#inquiry-back').hidden=step===0;$('#inquiry-next').hidden=step===2;$('#inquiry-submit').hidden=step!==2;$('#inquiry-error').textContent='';if(step===2)summary();const h=$('h3',panels[step]);h.tabIndex=-1;h.focus({preventScroll:true});panels[step].scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
    $('#inquiry-next').addEventListener('click',()=>{if(validate(step))go(step+1);});$('#inquiry-back').addEventListener('click',()=>go(step-1));
    function emailBody(){const d=values();return 'NEMO 인테리어 상담 요청\n\n'+Object.entries(labels).map(([key,label])=>label+': '+(d.get(key)||'상담하며 이야기할게요')).join('\n')+'\n\n동의 기록 (안내문 버전: 2026-10-12)\n이용약관: '+(d.has('termsConsent')?'동의':'미동의')+'\n개인정보 수집·이용: '+(d.has('privacyConsent')?'동의':'미동의')+'\n마케팅 정보 활용: '+(d.has('marketingUse')?'동의':'미동의')+'\n마케팅 정보 수신: '+(d.has('marketingReceive')?'동의':'미동의')+'\n동의 기록 작성 시각: '+new Date().toISOString();}
    form.addEventListener('submit',e=>{e.preventDefault();if(step<2){if(validate(step))go(step+1);return;}if(!validate(0)){go(0);return;}if(!validate(1)){go(1);return;}if(!validate(2))return;$('.inquiry-fallback').hidden=false;location.href='mailto:nemo_interior_@naver.com?subject='+encodeURIComponent('[NEMO] 인테리어 상담 요청')+'&body='+encodeURIComponent(emailBody());});
    $('#copy-inquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(emailBody());$('#copy-inquiry').textContent='작성 내용을 복사했어요 ✓';}catch{$('#inquiry-error').textContent='내용 확인 화면에서 작성 내용을 선택해 복사해주세요.';}});
  }
})();
