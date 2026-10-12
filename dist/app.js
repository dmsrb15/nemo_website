const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, p) => a + (b - a) * p;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let chosenSpace = '주거';
let scrollQueued = false;

const opening = $('.opening-story');
const portfolio = $('.portfolio');
const cards = $$('.project-card');
const cardDelays = cards.map(() => .34 + Math.random() * .07);
const cardOffsets = cards.map(() => 45 + Math.random() * 75);
const typeLines = ['라이프스타일부터', '브랜드의 분위기까지.'];
function openingProgress() { return clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - innerHeight)) * 6; }
function setSceneVisibility(section, opacity) {
  section.style.opacity = opacity;
  section.style.visibility = opacity > .001 ? 'visible' : 'hidden';
  section.inert = opacity < .5;
}
function updateStory() {
  const mobile = innerWidth <= 760;
  const scene = openingProgress();
  const photo = $('.hero-photo');
  if (!reduce.matches) {
    const shrink = clamp((scene - .2) / .7);
    const detail = clamp((scene - .8) / .5);
    const exit = clamp((scene - 1.65) / .65);
    photo.style.left = mix(mobile ? 4 : 1.5, mobile ? 6 : 9.3, shrink) + '%';
    photo.style.width = mix(mobile ? 92 : 97, mobile ? 88 : 81.4, shrink) + '%';
    photo.style.top = mix(mobile ? 95 : 130, mobile ? 40 : 70, shrink) + 'px';
    photo.style.height = mix(innerHeight - (mobile ? 115 : 148), innerHeight * .82, shrink) + 'px';
    photo.style.borderRadius = mix(0, mobile ? 30 : 65, shrink) + 'px';
    $('.scene-number').style.opacity = 1 - exit;
    photo.style.transform = `translateY(${-exit * innerHeight * 1.1}px)`;
    $('.hero-title').style.opacity = 1 - clamp(scene / .5);
    $('.hero-caption').style.opacity = 1 - shrink;
    $('.estimate-copy').style.opacity = detail;
    $('.estimate-copy').style.transform = `translateY(${32 * (1 - detail)}px)`;
    $('.estimate-card').style.opacity = detail * (1 - clamp((scene - 1.8) / .3));
    $('.estimate-card').style.transform = 'none';
    setSceneVisibility($('.hero-story'), 1 - clamp((scene - 2.1) / .3));
    $$('.service-story').forEach((section, index) => {
      const start = 1.85 + index * 2;
      const fade = clamp((scene - start) / .3) * (index === 0 ? 1 - clamp((scene - 3.7) / .3) : 1);
      setSceneVisibility(section, fade);
      const lift = clamp((scene - start - .45) / .65);
      const reveal = clamp((scene - start - .9) / .4);
      const title = $('.service-intro', section);
      title.style.transform = `translateY(${mix(mobile ? 90 : 140, 0, lift)}px)`;
      title.style.fontSize = mix(mobile ? 53 : Math.min(105, innerWidth * .075), mobile ? 31 : 46, lift) + 'px';
      $('.title-tail', section).style.opacity = 1 - lift;
      $('.title-tail', section).style.maxWidth = mix(240, 0, lift) + 'px';
      $('.chapter', section).style.opacity = reveal;
      $('.service-details', section).style.opacity = reveal;
      $('.service-details', section).style.transform = `translateY(${32 * (1 - reveal)}px)`;
    });
  }
  const progress = reduce.matches ? 1 : clamp(-portfolio.getBoundingClientRect().top / Math.max(1, portfolio.offsetHeight - innerHeight));
  const letters = Math.round(clamp(progress / .23) * typeLines.join('').length);
  $('#typing-one').textContent = typeLines[0].slice(0, letters);
  $('#typing-two').textContent = typeLines[1].slice(0, Math.max(0, letters - typeLines[0].length));
  $('.typing-caret').style.opacity = progress < .25 && !reduce.matches ? 1 : 0;
  const layout = reduce.matches ? 1 : clamp((progress - .23) / .16);
  $('.section-heading').style.top = mix(50, mobile ? 16 : 18, layout) + '%';
  $('.section-heading').style.transform = `translate(-50%, -50%) scale(${mix(1, .84, layout)})`;
  $('.filters').style.opacity = layout;
  $('.filters').inert = layout < .5;
  $('.portfolio-disclaimer').style.opacity = layout;
  const strip = $('.portfolio-strip');
  const distance = Math.max(0, strip.scrollWidth - innerWidth);
  strip.style.transform = reduce.matches ? 'none' : `translateX(${-distance * clamp((progress - .5) / .46)}px)`;
  cards.forEach((card, index) => {
    const reveal = reduce.matches ? 1 : clamp((progress - cardDelays[index]) / .12);
    card.style.opacity = reveal;
    card.style.transform = `translateY(${cardOffsets[index] * (1 - reveal)}px)`;
    card.inert = reveal < .05;
  });
  let active = scene < 1.9 ? 'home' : scene < 3.85 ? 'residential' : 'commercial';
  for (const id of ['portfolio', 'reviews', 'about', 'contact']) if ($('#' + id).getBoundingClientRect().top <= innerHeight * .45) active = id;
  $$('.section-rail a').forEach(link => {
    const selected = link.dataset.section === active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
function requestStory() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateStory); } }
function setMotionPreference() {
  document.body.classList.toggle('no-motion', reduce.matches);
  if (reduce.matches) {
    $('.hero-photo').removeAttribute('style');
    $('.hero-title').style.opacity = 1;
    $('.hero-caption').style.opacity = 1;
    $('.estimate-copy').style.opacity = 0;
    $('.estimate-card').style.opacity = 1;
    $$('.hero-story,.service-story').forEach(section => { section.removeAttribute('style'); section.inert = false; });
    $$('.service-intro,.title-tail,.chapter,.service-details').forEach(node => node.removeAttribute('style'));
  }
  requestStory();
}
addEventListener('scroll', requestStory, { passive: true });
addEventListener('resize', requestStory);
reduce.addEventListener('change', setMotionPreference);
setMotionPreference();

function jumpTo(id) {
  const scenes = { home: 0, services: 2.25, residential: 2.25, commercial: 4.25 };
  const top = !reduce.matches && id in scenes ? opening.offsetTop + (opening.offsetHeight - innerHeight) * scenes[id] / 6 : $('#' + id).getBoundingClientRect().top + scrollY;
  scrollTo({ top, behavior: reduce.matches ? 'instant' : 'smooth' });
}
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const id = link.getAttribute('href').slice(1);
  if (!$('#' + id)) return;
  event.preventDefault(); jumpTo(id); history.replaceState(null, '', '#' + id);
}));
if (location.hash && $(location.hash)) requestAnimationFrame(() => jumpTo(location.hash.slice(1)));
$$('.review-track').forEach(track => { const duplicate = track.cloneNode(true); duplicate.classList.add('review-duplicate'); duplicate.setAttribute('aria-hidden', 'true'); track.parentElement.appendChild(duplicate); });
$('.reviews-pause').addEventListener('click', event => {
  const paused = $('.reviews').classList.toggle('paused');
  event.currentTarget.setAttribute('aria-pressed', String(paused));
  event.currentTarget.textContent = paused ? '흐르는 후기 다시 재생하기' : '흐르는 후기 잠시 멈추기';
});
function openDialog(dialog) {
  $$('.header')[0].classList.remove('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
function closeDialog(dialog) { dialog.close(); }
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
  });
});
function openConsult() {
  const openDetail = $('#detail-dialog');
  if (openDetail.open) openDetail.close();
  $$('input[name="space"]').forEach(input => input.checked = input.value === chosenSpace);
  $('#form-status').textContent = '';
  openDialog($('#consult-dialog'));
}
$$('.consult').forEach(button => button.addEventListener('click', openConsult));
$$('[data-space]').forEach(button => button.addEventListener('click', () => {
  chosenSpace = button.dataset.space;
  $$('[data-space]').forEach(item => item.classList.toggle('selected', item === button));
  const art = $('.mini-art');
  art.classList.toggle('a-home', chosenSpace === '주거');
  art.classList.toggle('a-cafe', chosenSpace === '상업');
}));
$('.menu-toggle').addEventListener('click', () => {
  const state = $('.header').classList.toggle('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', String(state));
  $('.menu-toggle').setAttribute('aria-label', state ? '메뉴 닫기' : '메뉴 열기');
});
$$('.header nav a').forEach(link => link.addEventListener('click', () => {
  $('.header').classList.remove('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
}));
let filterTimer;
function setFilter(category) {
  clearTimeout(filterTimer);
  $$('.filters button').forEach(button => {
    const selected = button.dataset.filter === category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
    if (selected) {
      $('.filter-pill').style.width = button.offsetWidth + 'px';
      $('.filter-pill').style.transform = `translateX(${button.offsetLeft - 5}px)`;
    }
  });
  const strip = $('.portfolio-strip');
  strip.classList.add('filter-changing');
  filterTimer = setTimeout(() => {
    cards.forEach(card => card.hidden = category !== '전체' && card.dataset.category !== category);
    strip.classList.toggle('filtered', category !== '전체');
    strip.scrollLeft = 0;
    updateStory();
    requestAnimationFrame(() => strip.classList.remove('filter-changing'));
  }, reduce.matches ? 0 : 220);
}
function alignFilterPill() {
  const active = $('.filters button.active');
  $('.filter-pill').style.width = active.offsetWidth + 'px';
  $('.filter-pill').style.transform = `translateX(${active.offsetLeft - 5}px)`;
}
addEventListener('resize', alignFilterPill);
alignFilterPill();
$$('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
const projects = {
  living: { title: '자연을 들이는 거실', type: '주거 / 공간 레퍼런스', photo: true, text: '큰 창으로 들어오는 빛, 따뜻한 원목, 편안한 소파. 자연을 가까이 두고 오래 머물고 싶은 공간의 분위기를 살펴보세요.' },
  home: { title: '취향이 머무는 집', type: '주거 / 3D 콘셉트', art: 'a-home', text: '둥근 소파와 노란 의자, 부드러운 소재의 조합. 당신의 취향을 담으면서 일상에 편안함을 더하는 주거 공간 콘셉트입니다.' },
  cafe: { title: '다시 찾고 싶은 카페', type: '상업 / 3D 콘셉트', art: 'a-cafe', text: '따뜻한 노란 카운터와 원목 테이블, 부드러운 조명. 브랜드의 분위기와 고객이 머무는 경험을 함께 생각한 카페 콘셉트입니다.' },
  materials: { title: '손끝으로 느끼는 취향', type: '주거 / 소재 콘셉트', art: 'a-material', text: '원목, 크림색 표면, 차분한 세이지 패브릭. 색과 질감이 조화롭게 이어지는 공간을 위한 소재 콘셉트입니다.' },
  brand: { title: '분위기가 되는 디테일', type: '상업 / 소재 레퍼런스', photo: true, text: '빛과 소재가 만드는 첫인상. 공간 사진을 통해 브랜드의 분위기에 어울리는 색감과 재료를 함께 살펴봅니다.' }
};
$$('[data-project]').forEach(card => card.addEventListener('click', () => {
  const project = projects[card.dataset.project];
  chosenSpace = card.dataset.category;
  $('#detail-content').innerHTML = `<span class="eyebrow">${project.type}</span><h2 id="detail-title">${project.title}</h2><div class="project-detail-image">${project.photo ? '<img src="assets/hero.png" alt="스토리보드의 공간 사진 레퍼런스">' : `<div class="atlas ${project.art}" role="img" aria-label="${project.title} 입체 콘셉트"></div>`}</div><p>${project.text}</p><p class="detail-note">디자인 시안용 레퍼런스입니다. 실제 NEMO 시공 사례로 소개하는 이미지가 아닙니다.</p><button class="button yellow" id="detail-consult">이런 공간 상담하기 ↗</button>`;
  $('#detail-consult').addEventListener('click', openConsult);
  openDialog($('#detail-dialog'));
}));
const information = {
  news: { title: '네모의 새로운 이야기', eyebrow: 'NEWSROOM', text: '공간과 디자인에 대한 이야기를 담을 자리입니다. 스토리보드에 뉴스룸 상세 콘텐츠가 아직 없어, 첫 시안에서는 이 안내 화면으로 연결했습니다.' },
  careers: { title: '함께 공간을 만들어갈 분들', eyebrow: 'CAREERS', text: '채용 공고는 아직 등록되지 않았습니다. 네모와의 협업이나 채용 관련 문의는 아래 이메일로 연락해주세요.' },
  privacy: { title: '개인정보 안내', eyebrow: 'PRIVACY · 시안 안내', text: '현재 시안은 상담 입력 내용을 서버나 브라우저 저장소에 저장하지 않습니다. 이메일 초안 열기를 선택하면 이름, 연락처, 공간 정보와 요청 내용이 사용자의 이메일 앱에 전달됩니다. 사용자가 직접 이메일을 전송해야 네모에 전달됩니다. 실제 서비스의 개인정보처리방침은 운영 전 별도로 확정해야 합니다.' },
  terms: { title: '이용 안내', eyebrow: 'TERMS · 시안 안내', text: '이 웹페이지는 NEMO 스토리보드를 바탕으로 만든 디자인 시안입니다. 표시된 공간 사진과 3D 이미지는 레퍼런스와 콘셉트이며 실제 시공 실적을 의미하지 않습니다. 상담 입력은 계약이나 예약을 확정하지 않습니다. 실제 서비스의 이용약관은 운영 전 별도로 확정해야 합니다.' }
};
$$('[data-info]').forEach(button => button.addEventListener('click', () => {
  const info = information[button.dataset.info];
  $('#detail-content').innerHTML = `<span class="eyebrow">${info.eyebrow}</span><h2 id="detail-title">${info.title}</h2><p>${info.text}</p><a class="button pale" href="mailto:nemo_interior_@naver.com">이메일 문의 ↗</a>`;
  openDialog($('#detail-dialog'));
}));
$('#consult-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const body = `NEMO 인테리어 상담 요청\n\n공간 유형: ${data.get('space')}\n이름: ${data.get('name')}\n연락처: ${data.get('phone')}\n공간 위치: ${data.get('location') || '미정'}\n면적: ${data.get('area')}\n예산: ${data.get('budget')}\n\n원하는 변화:\n${data.get('message') || '상담을 통해 이야기하고 싶습니다.'}`;
  const href = `mailto:nemo_interior_@naver.com?subject=${encodeURIComponent('[NEMO] 인테리어 상담 요청')}&body=${encodeURIComponent(body)}`;
  $('#form-status').textContent = '이메일 앱에서 초안을 확인하고 직접 전송해주세요. 자동 접수되지는 않습니다. 앱이 열리지 않으면 nemo_interior_@naver.com으로 문의해주세요.';
  location.href = href;
});
