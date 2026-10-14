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
    let filter='전체',page=1;const nav=document.createElement('nav');nav.className='cms-pagination';nav.setAttribute('aria-label','뉴스룸 목록 페이지');$('.news-grid').after(nav);
    function newsRender(){const matches=$$('.news-grid .news-card').filter(c=>filter==='전체'||c.dataset.newsCategory===filter),pages=Math.max(1,Math.ceil(matches.length/9));page=Math.min(page,pages);$$('.news-grid .news-card').forEach(c=>c.hidden=true);matches.slice((page-1)*9,page*9).forEach(c=>c.hidden=false);$('#news-count').textContent=matches.length+'개의 이야기';nav.innerHTML=pages>1?Array.from({length:pages},(_,i)=>'<button type="button" data-page="'+(i+1)+'" aria-current="'+(page===i+1?'page':'false')+'">'+(i+1)+'</button>').join(''):'';}
    $$('[data-news-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.newsFilter;page=1;$$('[data-news-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));newsRender();}));nav.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);newsRender();$('.news-grid').scrollIntoView({block:'start'});}});newsRender();
  }
  if(mode==='portfolios'){
    const tools=$('.portfolio-tools');
    const filterToggle=document.createElement('button');filterToggle.className='portfolio-filter-toggle';filterToggle.type='button';filterToggle.setAttribute('aria-expanded','true');filterToggle.setAttribute('aria-controls','portfolio-filters');filterToggle.innerHTML='<span>분류해서 찾아보기</span><span aria-hidden="true">−</span>';
    const filters=document.createElement('div');filters.id='portfolio-filters';
    $$('.portfolio-filter-row,#filter-reset',tools).forEach(row=>filters.append(row));tools.append(filterToggle,filters);
    filterToggle.addEventListener('click',()=>{const open=filterToggle.getAttribute('aria-expanded')!=='true';filterToggle.setAttribute('aria-expanded',String(open));filters.hidden=!open;filterToggle.lastElementChild.textContent=open?'−':'+';});
    const styleGroup=$('[aria-label="공간 스타일"]');styleGroup.replaceChildren();for(const value of ['전체',...new Set((window.NEMO_RAW||content).projects.map(p=>p.style).filter(Boolean))]){const button=document.createElement('button');button.textContent=value;button.dataset.styleFilter=value;button.setAttribute('aria-pressed',String(value==='전체'));styleGroup.append(button);}
    const params=new URLSearchParams(location.search);
    let category=['전체','주거','상업','사무','팝업','브랜딩','스타일링'].includes(params.get('space'))?params.get('space'):'전체';
    let style=['전체',...(window.NEMO_RAW||content).projects.map(p=>p.style)].includes(params.get('style'))?params.get('style'):'전체';
    $('#portfolio-search').value=params.get('q')||'';
    let page=1;const pageNav=document.createElement('nav');pageNav.className='cms-pagination';pageNav.setAttribute('aria-label','포트폴리오 목록 페이지');$('.portfolio-grid').after(pageNav);
    function render(reset=true){if(reset)page=1;
      const query=$('#portfolio-search').value.trim().toLocaleLowerCase();
      let count=0;
      $$('.portfolio-item').forEach(card=>{card.hidden=(category!=='전체'&&card.dataset.category!==category)||(style!=='전체'&&card.dataset.style!==style)||!card.dataset.search.toLocaleLowerCase().includes(query);if(!card.hidden)count++;});
      const matches=$$('.portfolio-item').filter(c=>!c.hidden),pages=Math.max(1,Math.ceil(matches.length/9));page=Math.min(page,pages);matches.forEach((c,i)=>c.hidden=i<(page-1)*9||i>=page*9);pageNav.innerHTML=pages>1?Array.from({length:pages},(_,i)=>'<button type="button" data-page="'+(i+1)+'" aria-current="'+(page===i+1?'page':'false')+'">'+(i+1)+'</button>').join(''):'';
      $('#portfolio-count').textContent=count+'개의 공간';$('.portfolio-empty').hidden=count!==0;
      $('#search-clear').hidden=!query;
      $$('[data-project-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.projectFilter===category)));
      $$('[data-style-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.styleFilter===style)));
      const next=new URLSearchParams();if(category!=='전체')next.set('space',category);if(style!=='전체')next.set('style',style);if(query)next.set('q',$('#portfolio-search').value.trim());
      history.replaceState(null,'',location.pathname+(next.size?'?'+next:''));
    }
    pageNav.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);render(false);$('.portfolio-grid').scrollIntoView({block:'start'});}});
    function reset(){category='전체';style='전체';$('#portfolio-search').value='';render();}
    $$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.projectFilter;render();}));
    $$('[data-style-filter]').forEach(b=>b.addEventListener('click',()=>{style=b.dataset.styleFilter;render();}));
    $('#portfolio-search').addEventListener('input',render);
    $('#search-clear').addEventListener('click',()=>{$('#portfolio-search').value='';render();$('#portfolio-search').focus();});
    $('#filter-reset').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
    $('#portfolio-sort').addEventListener('change',()=>{
      const cards=$$('.portfolio-item');cards.sort((a,b)=>$('#portfolio-sort').value==='name'?$('h2',a).textContent.localeCompare($('h2',b).textContent,'ko'):content.projects.findIndex(p=>p.id===a.dataset.id)-content.projects.findIndex(p=>p.id===b.dataset.id));cards.forEach(c=>$('.portfolio-grid').append(c));render();
    });render();
  }
  if(mode==='portfolio'||mode==='story'){
    const type=mode==='portfolio'?'portfolio':'news',raw=window.NEMO_RAW||content,pool=type==='portfolio'?raw.projects:raw.stories,params=new URLSearchParams(location.search),key=type==='portfolio'?'project':'article',p=pool.find(p=>p.id===params.get(key))||(!params.has(key)?pool[0]:null),target=document.querySelector(type==='portfolio'?'#project-detail':'#story-detail');
    if(p){target.innerHTML=window.NEMO_RENDER.render(p,type,pool);document.title=p.title+' — NEMO';}else target.innerHTML='<div class="portfolio-empty"><h1>찾는 글이 없어요.</h1><a href="'+(type==='portfolio'?'portfolios.html':'newsroom.html')+'">전체 목록 보기 ↗</a></div>';
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
