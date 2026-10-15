(() => {
  if(document.documentElement.dataset.nemoSharedReady)return;
  document.documentElement.dataset.nemoSharedReady="true";
  const section=(title,copy)=>`<section><h3>${title}</h3><p>${copy}</p></section>`;
  const contact='네모 · 대표자 및 개인정보 보호책임자 김은규<br>nemo_interior_@naver.com · 010-2634-6834<br>경기도 성남시 수정구 산성대로283번길 6-17, 2층 21115호';
  const retention='상담 및 AS 처리 종료 후 5년간 보관해요. 이후 지체 없이 삭제하거나 파기해요. 법령에 따른 별도 보존 의무가 있는 기록은 해당 법정 기간 동안 분리해서 보관해요.';
  const collection=section('수집·이용 목적','상담 연락, 공간 검토와 견적 안내, 계약 진행 시 확인 및 요청하신 사후관리·AS에 이용해요.')+section('수집하는 항목','필수: 성함, 연락처, 공간 유형, 공간 주소, 필수 동의 여부.<br>선택: 상세 주소, 면적, 예산, 공사 시기, 원하는 변화 및 선택 동의 여부. 이메일을 직접 발송하면 발신 이메일 주소와 이메일에 포함한 내용도 받아요.')+section('보유·이용 기간',retention)+section('동의 거부와 철회','동의를 거부할 수 있어요. 다만 필수 정보의 수집·이용에 동의하지 않으면 상담 접수가 어려울 수 있어요. 선택 항목을 입력하지 않거나 마케팅 동의를 하지 않아도 상담을 신청할 수 있어요. 열람·정정·삭제·처리 정지 및 동의 철회는 아래 연락처로 요청해주세요. 법령상 보관해야 하는 정보는 즉시 삭제가 제한될 수 있어요.')+section('현재 신청 방식','이 사이트는 신청 내용을 서버에 저장하거나 자동 접수하지 않아요. 이메일 초안을 열고 직접 보내면 네모의 이메일로 접수돼요. 보내기 전 작성 내용을 확인해주세요.')+section('문의',contact);
  const marketing=section('선택 동의예요','마케팅 정보 활용 동의와 정보 수신 동의는 각각 선택할 수 있어요. 모두 동의한 경우에만 마케팅 목적으로 연락처를 이용해 안내 문자를 보내요. 동의하지 않아도 상담과 AS에 영향을 주지 않아요.')+section('활용 항목과 목적','성함, 연락처와 동의 기록을 새로운 공간 소식, 서비스·프로모션 안내 목적으로 이용해요. 공간 주소와 상담 상세 내용은 마케팅 목적으로 이용하지 않아요.')+section('수신 방법','입력한 연락처로 문자(SMS·LMS)를 보내는 데 동의하는 항목이에요. 별도의 야간 광고 수신 동의를 받지 않으므로 오후 9시부터 다음 날 오전 8시까지는 광고성 안내를 보내지 않아요.')+section('보유기간과 철회','동의한 날부터 최대 5년간 보관하며, 동의를 철회하면 해당 마케팅 정보를 지체 없이 삭제해요. 이메일 또는 전화로 언제든 수신 거부와 활용 동의 철회를 요청할 수 있어요. 수신 거부는 상담·AS 안내에 영향을 주지 않아요.')+section('문의',contact);
  const pages={
    services:{eyebrow:'NEMO SERVICES',title:'공간의 쓰임부터 생각해요.',body:section('주거 공간','의뢰인님의 취향과 생활을 듣고, 동선·수납·소재를 함께 정리해요. 매일 머무는 공간을 편안하게 바꿔요.')+section('상업 공간','브랜드의 첫인상과 손님의 경험을 연결해요. 제품과 서비스에 맞는 분위기, 직원과 고객의 동선을 함께 살펴봐요.')+section('사무 공간','집중과 협업, 회의와 휴식이 자연스럽게 이어지는 오피스를 생각해요. 팀의 규모, 업무 방식, 전원·조명·수납을 함께 살펴봐요.')+section('함께하는 과정','상담 → 현장 실측 → 설계·디자인 → 공사·완성으로 이어져요. 구체적인 범위와 비용은 공간 조건을 확인한 뒤 안내해요.'),cta:['공간 이야기하기 ↗','inquiry.html']},
    about:{eyebrow:'ABOUT NEMO',title:'가능성을 담다, 공간을 바꾸다.',body:section('네모가 생각하는 공간','좋아하는 모습과 필요한 쓰임을 함께 담아요. 의뢰인님의 생활과 브랜드, 팀의 일하는 방식을 듣는 데서 시작해요.')+section('한 가지 답보다, 알맞은 방향','공간의 조건과 예산을 먼저 살펴보고 동선, 색, 소재를 연결해요. 처음 나눈 생각이 매일의 공간에서 이어지도록 디테일까지 함께 확인해요.')+section('네모',contact),cta:['포트폴리오 살펴보기 ↗','portfolios.html']},
    careers:{eyebrow:'WORK WITH NEMO',title:'함께 공간을 만들어갈 분들',body:section('함께 이야기해요','채용 공고는 아직 등록되지 않았어요. 협업이나 채용 관련 문의는 이메일로 이야기해주세요.'),cta:['이메일 문의 ↗','mailto:nemo_interior_@naver.com']},
    terms:{eyebrow:'TERMS OF USE',title:'이용약관',body:section('1. 목적과 운영자','이 약관은 네모가 운영하는 웹사이트의 공간 소개와 상담 신청 기능 이용에 관한 기준이에요. 운영자는 네모이며, 대표자는 김은규예요.')+section('2. 제공하는 서비스','주거·상업·사무·팝업 공간 및 브랜딩·스타일링 서비스 소개, 포트폴리오와 뉴스룸 열람, 상담을 위한 이메일 작성 기능을 제공해요. 포트폴리오의 공간 콘셉트는 실제 시공 실적과 구분해요. 사진·이미지와 설명만으로 결과나 비용을 보장하지 않아요.')+section('3. 상담과 계약','작성 내용을 이메일로 직접 보내면 상담을 요청할 수 있어요. 신청만으로 계약, 방문 일정, 견적 또는 공사 예약이 확정되지는 않아요. 실제 용역의 범위·비용·일정·AS 조건은 별도로 협의하고 계약서에서 정해요.')+section('4. 이용자의 약속','본인에게 연락 가능한 정보를 입력하고 상담에 필요한 내용만 보내주세요. 타인의 개인정보를 무단 입력하거나 불법 콘텐츠를 보내는 행위, 서비스 운영을 방해하는 행위는 제한할 수 있어요.')+section('5. 콘텐츠와 권리','웹사이트의 디자인·문구·이미지는 네모 또는 해당 권리자의 권리를 따라요. 허락 없는 복제·배포·상업적 사용은 하지 말아주세요. 외부 서비스와 링크의 콘텐츠는 해당 운영자의 정책을 따라요.')+section('6. 이용 제한과 변경','점검이나 외부 이메일·주소 검색 서비스의 장애로 기능이 일시 제한될 수 있어요. 약관이나 서비스에 중요한 변경이 있으면 웹사이트에 미리 안내해요. 법령에 따른 이용자의 권리와 네모의 책임은 이 약관으로 배제하지 않아요.')+section('7. 문의와 분쟁','이용 중 불편이나 상담 내용에 관한 문의는 아래 연락처로 알려주세요. 분쟁은 대한민국 법령에 따라 해결해요. 관할 법원은 관련 법령에서 정한 기준을 따라요.')+section('시행일','2026년 10월 12일부터 적용해요.')+section('운영자 연락처',contact)},
    collection:{eyebrow:'PERSONAL INFORMATION',title:'개인정보 수집·이용 동의',body:collection},
    marketing:{eyebrow:'OPTIONAL CONSENT',title:'마케팅 정보 활용·수신 안내',body:marketing},
    privacy:{eyebrow:'PRIVACY POLICY',title:'개인정보처리방침',body:section('1. 처리자와 목적','네모는 상담, 견적 안내, 계약 진행과 사후관리·AS를 위해 개인정보를 처리해요. 별도 선택 동의가 있는 경우에만 소식과 서비스 안내에 필요한 최소 정보를 마케팅에 이용해요.')+section('2. 항목과 수집 방법','상담 신청 시 성함, 연락처, 공간 유형, 주소, 동의 여부를 받아요. 선택한 면적·예산·시기·상세 주소·상담 내용도 함께 받아요. 사용자가 직접 보낸 이메일에는 발신 주소와 이메일 내용이 포함돼요. 웹 신청서 입력만으로는 네모 서버에 저장되거나 전송되지 않아요.')+section('3. 보유기간',retention+'<br>마케팅 정보는 동의한 날부터 최대 5년 또는 동의 철회 시까지 중 먼저 도래하는 때까지만 보관해요.')+section('4. 제공과 외부 서비스','네모는 별도 동의나 법령상 근거 없이 개인정보를 제3자에게 제공하지 않아요. 이메일 상담은 네이버 메일을 통해 받아요. 주소 검색 버튼을 누르면 카카오 우편번호 서비스를 이용하며 검색어와 접속 정보는 해당 서비스에서 처리돼요. 네모가 다른 신청 항목을 주소 검색 서비스에 보내지는 않아요. 사용자가 이용하는 이메일 앱과 외부 서비스의 정보 처리는 각 서비스의 정책도 적용돼요.')+section('5. 삭제와 안전한 관리','보유기간이 끝나거나 목적을 달성해 더 이상 필요하지 않은 정보는 지체 없이 파기해요. 전자 기록은 복구할 수 없도록 삭제하고 종이 문서는 분쇄해요. 법정 보존 정보는 구분해서 관리해요. 담당자의 접근 권한을 필요한 범위로 제한하고 계정과 기기의 보안을 관리해요.')+section('6. 이용자의 권리','본인 정보의 열람·정정·삭제·처리 정지 및 동의 철회를 요청할 수 있어요. 본인 확인 후 관련 법령에 따라 처리해요. 대리인을 통한 요청은 위임 여부를 확인할 수 있어요. 법령상 보존 의무가 있는 경우 등에는 일부 요청이 제한될 수 있으며 이유를 안내해요.')+section('7. 쿠키와 입력 정보','상담 입력값을 웹사이트의 로컬 저장소에 영구 저장하지 않아요. 현재 화면을 떠나면 입력 정보가 유지되지 않을 수 있어요. 사이트 호스팅의 접속·인증 정보와 외부 서비스의 쿠키는 해당 서비스의 정책에 따라 처리돼요. 웹사이트 자체에서 광고 추적 쿠키를 추가하지 않아요.')+section('8. 책임자와 문의',contact)+section('9. 변경 안내','시행일: 2026년 10월 12일. 처리 항목·목적·보유기간 등이 변경되면 웹사이트를 통해 안내하고 필요한 동의를 별도로 받아요.')}
  };
  pages.residential={eyebrow:'NEMO SERVICES',title:'주거 공간',body:section('주거 공간','취향과 생활을 담는 집')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
pages.commercial={eyebrow:'NEMO SERVICES',title:'상업 공간',body:section('상업 공간','브랜드의 경험을 담는 매장')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
pages.office={eyebrow:'NEMO SERVICES',title:'사무 공간',body:section('사무 공간','집중과 협업을 연결하는 오피스')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
pages.popup={eyebrow:'NEMO SERVICES',title:'팝업 공간',body:section('팝업 공간','짧은 만남을 오래 남기는 공간')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
pages.branding={eyebrow:'NEMO SERVICES',title:'브랜딩',body:section('브랜딩','브랜드의 이야기를 공간으로 연결해요.')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
pages.styling={eyebrow:'NEMO SERVICES',title:'스타일링',body:section('스타일링','가구와 조명, 소품으로 취향을 완성해요.')+section('함께 이야기해요','원하는 방향과 공간의 조건을 먼저 듣고, 필요한 범위와 예산을 함께 정리해요.'),cta:['상담 신청하기 ↗','inquiry.html']};
  pages.services.body=['residential','commercial','office','popup','branding','styling'].map(id=>section(pages[id].title,pages[id].body.match(/<p>(.*?)<\/p>/)[1])).join('');
  const dialog=document.createElement('dialog');dialog.id='nemo-info-dialog';dialog.className='shared-dialog';dialog.setAttribute('aria-labelledby','shared-dialog-title');dialog.innerHTML='<button type="button" class="shared-close" aria-label="닫기">×</button><header class="shared-dialog-heading"><span class="shared-eyebrow"></span><h2 id="shared-dialog-title"></h2></header><div class="shared-dialog-body"></div>';document.body.append(dialog);
  const header=document.querySelector('.header,.page-header');
  // Subpages share the landing page's scroll-direction navigation behavior.
  if(header?.classList.contains('page-header')){
    let lastY=Math.max(0,scrollY),travel=0,queued=false;
    function showHeader(show){
      const hidden=!show;
      const changed=header.classList.contains('is-scroll-hidden')!==hidden;
      header.classList.toggle('is-scroll-hidden',hidden);
      document.documentElement.style.setProperty('--nemo-header-offset',show?header.offsetHeight+'px':'0px');
      if(changed)dispatchEvent(new Event('nemo:header'));
    }
    function updateHeader(){
      queued=false;
      const y=Math.max(0,scrollY),delta=y-lastY;
      if(Math.sign(delta)!==Math.sign(travel))travel=0;
      travel+=delta;lastY=y;
      const occupied=!!header.querySelector(':focus-visible')||header.classList.contains('menu-open')||header.classList.contains('services-expanded');
      if(y<120||occupied){showHeader(true);travel=0;}
      else if(travel>12){showHeader(false);travel=0;}
      else if(travel<-8){showHeader(true);travel=0;}
    }
    addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateHeader);}},{passive:true});
    addEventListener('resize',()=>showHeader(!header.classList.contains('is-scroll-hidden')));
    header.addEventListener('focusin',()=>showHeader(true));
    header.addEventListener('pointerenter',()=>showHeader(true));
    showHeader(true);
  }
  const trigger=header?.querySelector('[data-info="services"]');
  if(document.body.dataset.page==='service')trigger?.setAttribute('aria-current','page');
  if(document.body.dataset.page==='about')header?.querySelector('a[href="about.html"]')?.setAttribute('aria-current','page');
  let menu,wrapper,timer;
  function setMenu(open){if(!menu)return;clearTimeout(timer);wrapper.classList.toggle('services-open',open);menu.classList.toggle('is-open',open);header.classList.toggle('services-expanded',open);trigger.setAttribute('aria-expanded',String(open));menu.inert=!open;menu.setAttribute('aria-hidden',String(!open));if(open){menu.style.top=header.getBoundingClientRect().bottom+'px';header.style.setProperty('--nemo-services-height',menu.offsetHeight+'px');}}
  addEventListener('resize',()=>{if(header?.classList.contains('services-expanded'))setMenu(true);});
  function closeMenu(){setMenu(false);header?.classList.remove('menu-open');const toggle=document.querySelector('.menu-toggle,.page-menu-toggle');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','메뉴 열기');}
  if(trigger){wrapper=document.createElement('div');wrapper.className='services-nav';trigger.before(wrapper);wrapper.append(trigger);trigger.removeAttribute('data-info');trigger.className='services-trigger';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','services-dropdown');menu=document.createElement('div');menu.id='services-dropdown';menu.className='services-dropdown';menu.setAttribute('aria-label','서비스 선택');menu.innerHTML='<div class="services-dropdown-grid">'+[["residential","주거 공간","취향과 생활을 담는 집"],["commercial","상업 공간","브랜드의 경험을 담는 매장"],["office","사무 공간","집중과 협업을 연결하는 오피스"],["popup","팝업 공간","짧은 만남을 오래 남기는 공간"],["branding","브랜딩","브랜드의 이야기를 공간으로 연결해요."],["styling","스타일링","가구와 조명, 소품으로 취향을 완성해요."]].map(([id,title,copy])=>'<a href="'+id+'.html"><strong>'+title+'</strong><span>'+copy+'</span></a>').join('')+'</div>';document.body.append(menu);menu.addEventListener('pointerenter',()=>clearTimeout(timer));menu.addEventListener('pointerleave',()=>{timer=setTimeout(()=>setMenu(false),150)});menu.addEventListener('focusout',e=>{if(!menu.contains(e.relatedTarget)&&!wrapper.contains(e.relatedTarget))setMenu(false)});setMenu(false);wrapper.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches)setMenu(true)});wrapper.addEventListener('pointerleave',()=>{timer=setTimeout(()=>setMenu(false),150)});wrapper.addEventListener('focusin',()=>setMenu(true));wrapper.addEventListener('focusout',e=>{if(!wrapper.contains(e.relatedTarget)&&!menu.contains(e.relatedTarget))setMenu(false)});trigger.addEventListener('click',()=>setMenu(true));document.addEventListener('click',e=>{if(!wrapper.contains(e.target)&&!menu.contains(e.target))setMenu(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&trigger.getAttribute('aria-expanded')==='true'){setMenu(false);trigger.focus();setMenu(false)}});addEventListener('scroll',()=>setMenu(false),{passive:true});}
  document.addEventListener('click',e=>{const button=e.target.closest('[data-info]');if(!button)return;const p=pages[button.dataset.info];if(!p)return;closeMenu();dialog.querySelector('.shared-eyebrow').textContent=p.eyebrow;dialog.querySelector('h2').textContent=p.title;const body=dialog.querySelector('.shared-dialog-body');body.innerHTML=p.body+(p.cta?'<a class="button yellow" href="'+p.cta[1]+'">'+p.cta[0]+'</a>':'');body.scrollTop=0;if(!dialog.open)dialog.showModal();document.body.classList.add('dialog-open');});
  dialog.querySelector('.shared-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
})();
