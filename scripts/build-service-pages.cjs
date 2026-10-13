const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const data=JSON.parse(fs.readFileSync(path.join(root,'service-content.json'),'utf8'));
const copy={
 residential:{intro:'집을 바꾸는 기준은,<br>그 안에서 보내는 하루.',focus:'동선부터 소재까지,<br>생활에 맞춰 하나씩.',checks:['현재 공간의 사진','함께 사는 사람과 생활 방식','유지하고 싶은 가구와 필요한 변화']},
 commercial:{intro:'처음의 인상부터,<br>다시 찾는 경험까지.',focus:'브랜드와 운영,<br>한 방향으로 연결해요.',checks:['업종과 주요 고객','매장의 운영 방식과 동선','오픈 일정과 브랜드 자료']},
 office:{intro:'좋은 업무 공간은,<br>일하는 방식에서 시작해요.',focus:'집중과 대화의 균형,<br>팀에 맞게 조율해요.',checks:['팀의 인원과 업무 방식','회의·집중·휴식 공간의 필요','기존 가구와 전원·통신 조건']},
 popup:{intro:'잠깐의 방문이,<br>선명한 기억이 되도록.',focus:'전시에서 체험까지,<br>경험을 한 흐름으로.',checks:['팝업의 목적과 제품','장소와 설치·철거 조건','오픈 예정일과 운영 기간']},
 branding:{intro:'전하고 싶은 이야기,<br>공간에서도 한결같이.',focus:'색과 소재, 작은 접점까지<br>브랜드의 방향으로.',checks:['기존 로고와 브랜드 자료','고객에게 전하고 싶은 인상','공간에 적용할 디자인 범위']},
 styling:{intro:'큰 공사 없이도,<br>일상의 분위기는 달라져요.',focus:'가구와 빛, 질감을<br>취향에 맞게 조합해요.',checks:['현재 공간과 가구의 사진','계속 사용할 가구의 크기','좋아하는 분위기와 필요한 변화']}
};
for(const [id,s] of Object.entries(data)){
 const file=path.join(dist,id+'.html');let html=fs.readFileSync(file,'utf8');const c=copy[id];
 const inquiry=id==='branding'?'inquiry.html?space='+encodeURIComponent('상업')+'&extra='+encodeURIComponent('브랜딩'):id==='styling'?'inquiry.html?space='+encodeURIComponent('주거')+'&extra='+encodeURIComponent('스타일링'):'inquiry.html?space='+encodeURIComponent(s.space),portfolio='portfolios.html?space='+encodeURIComponent(s.space);
 const main=`<main id="page-main" class="service-detail">
 <section class="service-detail-intro"><div class="service-shell"><span class="service-label">${s.label}</span><h1>${s.title}</h1><p>${s.lead}</p><a class="button yellow" href="${inquiry}">${s.label} 상담하기 <span aria-hidden="true">↗</span></a></div></section>
 <div class="service-shell"><figure class="service-hero-photo" data-service-reveal><img src="assets/services/${id}.png" width="1672" height="941" alt="${s.label} 디자인 콘셉트" fetchpriority="high" decoding="async"></figure>
 <section class="service-detail-story"><span class="service-index" data-service-reveal>01</span><h2 data-service-reveal>${c.intro}</h2><p data-service-reveal>${s.approach}</p></section>
 <section class="service-focus" aria-labelledby="focus-heading"><span class="service-index" data-service-reveal>02</span><h2 id="focus-heading" data-service-reveal>${c.focus}</h2><div class="focus-layout" data-service-reveal>
 <div class="focus-tabs" role="tablist" aria-label="${s.label} 설계의 기준" aria-orientation="vertical">${s.points.map((p,i)=>`<button type="button" id="focus-tab-${i}" role="tab" aria-selected="${i===0}" aria-controls="focus-panel-${i}" tabindex="${i===0?0:-1}"><span>0${i+1}</span><strong>${p[0]}</strong><span class="focus-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
 <div class="focus-panels">${s.points.map((p,i)=>`<section id="focus-panel-${i}" class="focus-panel" role="tabpanel" aria-labelledby="focus-tab-${i}" tabindex="0" ${i?'hidden':''}><div class="focus-photo"><img src="assets/services/${id}.png" width="1672" height="941" alt="${s.label} 콘셉트의 공간과 소재" loading="lazy" decoding="async" style="object-position:${[30,60,85][i]}% 50%"></div><span class="focus-panel-label">0${i+1} · ${p[0]}</span><h3>${p[0]}</h3><p>${p[1]}</p></section>`).join('')}</div></div></section>
 </div>
 <section class="service-ready"><div class="service-shell ready-layout"><div data-service-reveal><span class="service-index">03</span><h2>좋은 시작을 위해,<br>이야기할 내용을 정리해요.</h2><p>모든 것이 정해져 있지 않아도 괜찮아요.<br>지금 알고 있는 내용부터 편하게 알려주세요.</p></div><div class="ready-checks" data-service-reveal>${c.checks.map((v,i)=>`<div><span>0${i+1}</span><p>${v}</p></div>`).join('')}<a class="service-inline-link" href="${inquiry}">내 공간 이야기하기 <span aria-hidden="true">↗</span></a></div></div></section>
 <div class="service-shell"><section class="service-journey"><div class="journey-head" data-service-reveal><span class="service-label">함께하는 과정</span><h2>처음의 생각부터,<br>디테일까지 함께해요.</h2></div><ol>${[['먼저 들어요.','현재 공간과 원하는 변화, 일정과 예산을 함께 살펴봐요.'],['방향을 정해요.','현장의 조건과 필요한 범위를 확인하고, 선택의 기준을 정리해요.'],['공간으로 옮겨요.','협의한 범위에 맞춰 디자인을 구체화하고 적용할 디테일을 확인해요.']].map((v,i)=>`<li data-service-reveal><span>0${i+1}</span><h3>${v[0]}</h3><p>${v[1]}</p></li>`).join('')}</ol></section>
 <section class="service-faq"><h2 data-service-reveal>궁금한 점을 살펴보세요.</h2><div data-service-reveal>${s.faq.map(v=>`<details><summary>${v[0]}<span aria-hidden="true">+</span></summary><p>${v[1]}</p></details>`).join('')}</div></section>
 <section class="service-next" data-service-reveal><span class="service-label">다음 일상의 시작</span><h2>당신의 ${s.label==='브랜딩'?'브랜드':s.label==='스타일링'?'취향':'공간'},<br>어떤 변화를 바라나요?</h2><div><a class="button pale" href="${portfolio}">관련 공간 살펴보기 <span aria-hidden="true">↗</span></a><a class="button yellow" href="${inquiry}">네모와 이야기하기 <span aria-hidden="true">↗</span></a></div></section>
 <nav class="service-other" aria-label="다른 서비스"><span>다른 공간도 살펴보세요.</span><div>${Object.entries(data).filter(([key])=>key!==id).map(([key,d])=>`<a href="${key}.html">${d.label} <span aria-hidden="true">↗</span></a>`).join('')}</div></nav></div>
 </main>`;
 html=html.replace(/<main id="page-main"[\s\S]*?<\/main>/,main);
 html=html.replace(/<link rel="stylesheet" href="service-(?:pages|detail)\.css[^\"]*">/g,'').replace(/<script src="service-detail\.js[^\"]*" defer><\/script>/g,'');
 html=html.replace('</head>','<link rel="stylesheet" href="service-detail.css?v=20261013-service-detail-1"><script src="service-detail.js?v=20261013-service-detail-1" defer></script></head>');
 fs.writeFileSync(file,html);
}
console.log('Built '+Object.keys(data).length+' service pages.');
