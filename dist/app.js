const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, p) => a + (b - a) * p;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let chosenSpace = '주거';
let scrollQueued = false;
let previousScrollY = scrollY;
let upwardMenu = false;

const opening = $('.opening-story');
const portfolio = $('.portfolio');
let cards=[],cardDelays=[],cardOffsets=[];
function renderLandingProjects(category='전체'){
 window.NEMO_LANDING_VIEW.renderProjects(category);cards=$$('.project-card');cardDelays=cards.map(()=>.34+Math.random()*.07);cardOffsets=cards.map(()=>45+Math.random()*75);
 cards.filter(card=>card.dataset.project).forEach(card=>card.addEventListener('click',()=>{location.href='portfolio.html?project='+encodeURIComponent(card.dataset.project);}));
}
renderLandingProjects();
const serviceChoices=[["residential","주거","a-home","취향은 선명하게, 생활은 편안하게.","취향과 생활을 듣고, 동선과 수납을 편안하게 바꿔요.","02-01"],["commercial","상업","a-cafe","브랜드는 또렷하게, 쓰임은 효율적으로.","브랜드의 첫인상부터 손님의 경험과 동선까지 연결해요.","03-01"],["office","사무","office-art","집중은 깊게, 협업은 자연스럽게.","팀의 일하는 방식에 맞춰 집중·회의·휴식의 균형을 맞춰요.","03-03"],["popup","팝업","popup-art","짧은 만남에도, 오래 남는 브랜드.","전시와 체험, 판매의 흐름에 브랜드의 이야기를 담아요.","03-05"]];
let selectedService=0,manualServiceScene=null;
function selectService(index){
 if(selectedService===index&&document.querySelector('.selector-option.is-active'))return;
 selectedService=index;
 $$('.selector-option').forEach((item,i)=>{item.classList.toggle('is-active',i===index);$('[data-service-select]',item).setAttribute('aria-expanded',String(i===index));$('.selector-detail',item).hidden=i!==index;});
 const art=$('#selector-art');art.className='atlas '+serviceChoices[index][2];art.setAttribute('aria-label',serviceChoices[index][1]+' 공간 일러스트');
 $('#selector-image-caption').textContent=['취향과 생활을 담는 집','브랜드를 담는 공간','집중과 협업을 연결하는 오피스','짧은 만남을 오래 남기는 공간'][index];
}
function updateServiceSelector(scene){
 const section=$('.service-selector');if(reduce.matches){section.removeAttribute('style');section.inert=false;return;}
 setSceneVisibility(section,clamp((scene-3.35)/.35));
 if(manualServiceScene!==null&&Math.abs(scene-manualServiceScene)<.22)return;
 manualServiceScene=null;selectService(Math.min(3,Math.max(0,Math.floor((scene-3.65)/.42))));
}
$$('[data-service-select]').forEach(button=>button.addEventListener('click',()=>{manualServiceScene=openingProgress();selectService(Number(button.dataset.serviceSelect));}));
const typeLines = ['라이프스타일부터', '브랜드의 분위기까지.'];
function openingProgress() { return clamp(-opening.getBoundingClientRect().top / Math.max(1, opening.offsetHeight - innerHeight)) * 5.6; }
function setSceneVisibility(section, opacity) {
  section.style.opacity = opacity;
  section.style.visibility = opacity > .001 ? 'visible' : 'hidden';
  section.inert = opacity < .5;
}
function updateProcess() {
  const process = $('.process');
  const steps = $$('.process-step', process);
  const buttons = $$('[data-process]', process);
  const progress = clamp(-process.getBoundingClientRect().top / Math.max(1, process.offsetHeight - innerHeight));
  const position = Math.min(3, progress * 4.2);
  const active = Math.round(position);
  const overview = $('.process-overview', process);
  const overviewFade = reduce.matches ? 1 : clamp((progress - .82) / .12);
  const overviewActive = overviewFade > .5;
  overview.hidden = overviewFade === 0;
  overview.inert = !overviewActive;
  overview.style.opacity = overviewFade;
  overview.setAttribute('aria-hidden', String(!overviewActive));
  process.classList.toggle('showing-overview', overviewActive);
  $('.process-nav',process).inert = overviewActive;
  steps.forEach((step, index) => {
    const copy = $('.process-copy', step);
    if (reduce.matches) { step.removeAttribute('style'); copy.style.removeProperty('opacity'); step.inert = false; step.removeAttribute('aria-hidden'); return; }
    const delta = position - index;
    const opacity = clamp(1 - Math.abs(delta)) * (1 - overviewFade);
    step.style.opacity = opacity;
    copy.style.opacity = opacity > 0 ? clamp(1 - Math.abs(delta) * 2.2) / opacity : 0;
    step.style.visibility = opacity > .001 ? 'visible' : 'hidden';
    step.style.setProperty('--step-shift', (delta * -48) + 'px');
    step.style.setProperty('--art-scale', 1 - Math.min(1,Math.abs(delta)) * .12);
    step.inert = index !== active || overviewActive;
    step.setAttribute('aria-hidden', String(index !== active || overviewActive));
  });
  buttons.forEach((button,index) => {
    if (index === active) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
  });
  $('.process-progress i').style.transform = 'scaleX(' + progress + ')';
}
function updateStory() {
  updateProcess();
  const mobile = innerWidth <= 760;
  const scene = openingProgress();
  const photo = $('.hero-photo');
  if (!reduce.matches) {
    const expand = clamp(scene / .45);
    const shrink = clamp((scene - 2.05) / .7);
    const detail = clamp((scene - .6) / .35);
    const moreHint = $('.hero-more-hint');
    const moreHintOpacity = clamp((scene - .7) / .3) * (1 - clamp((scene - 1.95) / .3));
    moreHint.style.opacity = moreHintOpacity;
    moreHint.style.visibility = moreHintOpacity > .001 ? 'visible' : 'hidden';
    moreHint.setAttribute('aria-hidden', String(moreHintOpacity < .1));
    moreHint.classList.toggle('is-visible', moreHintOpacity > .001);
    const exit = clamp((scene - 2.6) / .8);
    const insetLeft = mobile ? 4 : 1.5;
    const insetTop = mobile ? 95 : 130;
    const expandedLeft = mix(insetLeft, 0, expand);
    const expandedWidth = mix(mobile ? 92 : 97, 100, expand);
    const expandedTop = mix(insetTop, 0, expand);
    const expandedHeight = mix(innerHeight - (mobile ? 115 : 148), innerHeight, expand);
    photo.style.left = mix(expandedLeft, mobile ? 6 : 9.3, shrink) + '%';
    photo.style.width = mix(expandedWidth, mobile ? 88 : 81.4, shrink) + '%';
    photo.style.top = mix(expandedTop, mobile ? 40 : 70, shrink) + 'px';
    photo.style.height = mix(expandedHeight, innerHeight * .82, shrink) + 'px';
    photo.style.borderRadius = mix(0, mobile ? 30 : 65, shrink) + 'px';

    photo.style.transform = `translateY(${-exit * innerHeight * 1.1}px)`;
    $('.hero-title').style.opacity = 1 - clamp((scene - .55) / .3);
    $('.hero-caption').style.opacity = 1 - detail;
    $('.estimate-copy').style.opacity = detail * (1 - clamp((scene - (mobile ? 1.05 : 2.65)) / .3));
    $('.estimate-copy').style.transform = `translateY(${32 * (1 - detail)}px)`;
    const cardReveal = clamp((scene - 1.15) / .35);
    const handoff = clamp((scene - 3.35) / .35);
    $('.estimate-card').style.opacity = cardReveal * (1 - handoff);
    const travel = clamp((scene - 2.05) / 1.1);
    const alignment = travel * travel * travel * (travel * (travel * 6 - 15) + 10);
    const stage = $('.opening-stage').getBoundingClientRect();
    const target = $('.service-visual').getBoundingClientRect();
    const card = $('.estimate-card');
    const cardContent = 1 - clamp((scene - 3.05) / .3);
    [...card.children].forEach(child => child.style.opacity = cardContent);
    const startWidth = mobile ? Math.min(stage.width * .84, 335) : Math.min(500, stage.width * .4);
    const startHeight = mobile ? Math.min(450, innerHeight * .58) : Math.min(560, innerHeight * .78);
    const startLeft = stage.width * (mobile ? .92 : .91) - startWidth;
    const startTop = mobile ? innerHeight * .2 : Math.max(65, (innerHeight - startHeight) / 2 - 20);
    card.style.right = 'auto';
    card.style.left = mix(startLeft, target.left - stage.left, alignment) + 'px';
    card.style.top = mix(startTop, target.top - stage.top, alignment) + 'px';
    card.style.width = mix(startWidth, target.width, alignment) + 'px';
    card.style.height = mix(startHeight, target.height, alignment) + 'px';
    card.style.setProperty('--card-alignment', alignment);
    card.style.transform = `translateY(${18 * (1 - cardReveal)}px)`;
    card.inert = cardReveal < .5 || handoff > .5;
    setSceneVisibility($('.hero-story'), 1 - clamp((scene - 3.7) / .25));
    $$('.service-story').forEach((section, index) => {
      const start = 3.35 + index * 2;
      const fade = clamp((scene - start) / (index === 0 ? .35 : .3)) * (1 - clamp((scene - start - 1.85) / .3));
      setSceneVisibility(section, fade);
      const lift = clamp((scene - start - .45) / .65);
      const reveal = clamp((scene - start - .9) / .4);
      const title = $('.service-intro', section);
      title.style.transform = mobile ? `translate(-50%, ${mix(90, 0, lift)}px)` : `translateY(${mix(140, 0, lift)}px)`;
      title.style.fontSize = mix(mobile ? 53 : 72, mobile ? 31 : 40, lift) + 'px';
      $('.title-tail', section).style.opacity = 1 - lift;
      $('.title-tail', section).style.maxWidth = mix(240, 0, lift) + 'px';
      $('.service-details', section).style.opacity = reveal;
      $('.service-details', section).style.transform = `translateY(${32 * (1 - reveal)}px)`;
    });
  }
  updateServiceSelector(scene);
  const progress = reduce.matches ? 1 : clamp(-portfolio.getBoundingClientRect().top / Math.max(1, portfolio.offsetHeight - innerHeight));
  const layout = reduce.matches ? 1 : clamp((progress - .12) / .27);
  const totalLetters = typeLines.join('').length;
  const letters = reduce.matches ? totalLetters : Math.floor(8 * clamp(progress / .12) + (totalLetters - 8) * layout);
  $('#typing-one').textContent = typeLines[0].slice(0, letters);
  $('#typing-two').textContent = typeLines[1].slice(0, Math.max(0, letters - typeLines[0].length));
  $('#caret-one').hidden = reduce.matches || letters >= typeLines[0].length;
  $('#caret-two').hidden = reduce.matches || letters < typeLines[0].length || letters >= totalLetters;
  $$('.typing-visible').forEach(line => line.style.color = layout > 0 ? '#20211f' : '#18b99b');
  $('.section-heading').style.top = mix(50, mobile ? 16 : 18, layout) + '%';
  $('.section-heading').style.transform = `translate(-50%, -50%) scale(${mix(mobile ? 1.08 : 1.5, .84, layout)})`;
  $$('.typing-reserve').forEach(line => line.style.opacity = mix(.23, 0, layout));
  const filterReveal = clamp((layout - .9) / .1);
  $('.filters').style.opacity = filterReveal;
  $('.filters').inert = filterReveal < .5;
  const strip = $('.portfolio-strip');
  const distance = Math.max(0, strip.scrollWidth - innerWidth);
  strip.style.transform = reduce.matches ? 'none' : `translateX(${-distance * clamp((progress - .5) / .46)}px)`;
  cards.forEach((card, index) => {
    const reveal = reduce.matches ? 1 : clamp((progress - cardDelays[index]) / .12);
    card.style.opacity = reveal;
    card.style.transform = `translateY(${cardOffsets[index] * (1 - reveal)}px)`;
    card.inert = reveal < .05;
  });
  let active = scene < 3.4 ? 'home' : 'residential';
  for (const id of ['portfolio', 'reviews', 'about', 'contact']) if ($('#' + id).getBoundingClientRect().top <= innerHeight * .45) active = id;
  $$('.section-rail a').forEach(link => {
    const selected = link.dataset.section === active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  $('.header').classList.toggle('at-end', scrollY > 100 && (upwardMenu || $('.header').classList.contains('menu-open') || document.documentElement.scrollHeight - scrollY - innerHeight < innerHeight * .35));
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
    $('.estimate-card').removeAttribute('style');
    $('.estimate-card').style.opacity = 1;
    $('.estimate-card').inert = false;
    [...$('.estimate-card').children].forEach(child => child.style.removeProperty('opacity'));
    $$('.hero-story,.service-selector').forEach(section => { section.removeAttribute('style'); section.inert = false; });
    $$('.service-intro,.title-tail,.chapter,.service-details').forEach(node => node.removeAttribute('style'));
  }
  requestStory();
}
addEventListener('scroll', () => {
  const delta = scrollY - previousScrollY;
  if (Math.abs(delta) > 6) { upwardMenu = delta < 0; previousScrollY = scrollY; }
  requestStory();
}, { passive: true });
addEventListener('resize', requestStory);
reduce.addEventListener('change', setMotionPreference);
setMotionPreference();

function jumpTo(id) {
  const scenes = { home: 0, services: 3.75, residential: 3.75, commercial: 4.25, office: 4.65, popup: 5.1 };
  const top = !reduce.matches && id in scenes ? opening.offsetTop + (opening.offsetHeight - innerHeight) * scenes[id] / 5.6 : $('#' + id).getBoundingClientRect().top + scrollY;
  scrollTo({ top, behavior: reduce.matches ? 'instant' : 'smooth' });
}
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const id = link.getAttribute('href').slice(1);
  if (!$('#' + id)) return;
  event.preventDefault(); jumpTo(id); history.replaceState(null, '', '#' + id);
}));
if (location.hash && $(location.hash)) requestAnimationFrame(() => jumpTo(location.hash.slice(1)));
// The marquee is initialized as one shared animated runner below.
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
function openConsult() { location.href = 'inquiry.html?space=' + encodeURIComponent(chosenSpace); }
$$('.consult').forEach(link => link.addEventListener('click', event => { event.preventDefault(); openConsult(); }));
$$('[data-space]').forEach(button => button.addEventListener('click', () => {
  chosenSpace = button.dataset.space;
  $$('[data-space]').forEach(item => item.classList.toggle('selected', item === button));
  const art = $('.mini-art');
  art.classList.toggle('a-home', chosenSpace === '주거');
  art.classList.toggle('office-art', chosenSpace === '사무');
  art.classList.toggle('a-cafe', chosenSpace === '상업');
  art.classList.toggle('popup-art', chosenSpace === '팝업');
  art.setAttribute('aria-label', chosenSpace + ' 공간 입체 일러스트');
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
    renderLandingProjects(category);
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
const koreanClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
function updateKoreanClock() {
  const now = new Date();
  $('#nemo-local-time').textContent = koreanClock.format(now) + ' KST';
  $('#nemo-local-time').dateTime = now.toISOString();
}
updateKoreanClock();
setInterval(() => { if (!document.hidden) updateKoreanClock(); }, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateKoreanClock(); });

const regionTabs = $$('.review-region-tabs [role="tab"]');
function selectReviewRegion(tab) {
  window.NEMO_LANDING_VIEW.hideReview();
  regionTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    $('#' + item.getAttribute('aria-controls')).hidden = !selected;
  });
}
regionTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectReviewRegion(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = regionTabs[(index + 1) % regionTabs.length];
    if (event.key === 'Home') next = regionTabs[0];
    if (event.key === 'End') next = regionTabs[regionTabs.length - 1];
    if (next) { event.preventDefault(); selectReviewRegion(next); next.focus(); }
  });
});

// One runner and two identical units share a single animation phase.
$$('.review-board').forEach(board => {
  const unit = $('.review-track', board);
  const sourceQuotes = [...unit.children].map(quote => quote.cloneNode(true));
  const runner = document.createElement('div');
  runner.className = 'review-runner';
  board.replaceChildren(runner);
  runner.append(unit);
  function rebuildReviewLoop() {
    const currentTime = runner.getAnimations()[0]?.currentTime || 0;
    unit.replaceChildren(...sourceQuotes.map(quote => quote.cloneNode(true)));
    let repetitions = 0;
    while (unit.getBoundingClientRect().width < board.clientWidth + 360 && repetitions < 12) {
      const extras = sourceQuotes.map(quote => { const extra = quote.cloneNode(true); extra.setAttribute('aria-hidden', 'true'); return extra; });
      unit.append(...extras);
      repetitions++;
    }
    const duplicate = unit.cloneNode(true);
    duplicate.classList.add('review-duplicate');
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.inert = true;
    runner.replaceChildren(unit, duplicate);
    const loopWidth = unit.getBoundingClientRect().width;
    const duration = loopWidth / 43;
    runner.style.setProperty('--review-loop-duration', duration + 's');
    const animation = runner.getAnimations()[0];
    if (animation) animation.currentTime = Number(currentTime) % (duration * 1000);
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(rebuildReviewLoop, 150); });
  reduce.addEventListener('change', rebuildReviewLoop);
  rebuildReviewLoop();
});

// Scroll and direct selection share the same process timeline.
$$('[data-process]').forEach((button,index,buttons) => {
  function selectStep() {
    const process = $('.process');
    const top = reduce.matches ? $('.process-overview').getBoundingClientRect().top + scrollY : process.getBoundingClientRect().top + scrollY + (process.offsetHeight - innerHeight) * index / 4.2;
    scrollTo({top,behavior:reduce.matches ? 'instant':'smooth'});
  }
  button.addEventListener('click',selectStep);
  button.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 4) % 4;
    buttons[target].focus({preventScroll:true}); buttons[target].click();
  });
});
const processOverview=$('.process-overview');
processOverview.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{
 if(detail.open)processOverview.querySelectorAll('details').forEach(other=>{if(other!==detail)other.open=false;});
}));
$('[data-process-restart]').addEventListener('click',()=>{
 const top=$('.process').getBoundingClientRect().top+scrollY;
 scrollTo({top,behavior:reduce.matches?'instant':'smooth'});
});
