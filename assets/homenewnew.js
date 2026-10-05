'use strict';
// Tillaga að símavænni forsíðu (indexnewnew.html). Byggir á homenew.js.
(()=>{
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const behavior = () => reduced.matches ? 'instant' : 'smooth';
const store = {get(k,f){try{const v=localStorage.getItem(k);return v==null?f:JSON.parse(v);}catch{return f;}}};
function safeURL(value){
  try{const url = new URL(value,location.href);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
async function get(url){
  const response = await fetch(url,{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response;
}
function randomOther(list,previous){
  const choices=list.filter(x=>x!==previous);
  return (choices.length?choices:list)[Math.floor(Math.random()*(choices.length||list.length))];
}

/* ---------- Hillan ---------- */
// Bækurnar koma úr gagnagrunninum (assets/sogur.js) og opnast beint í lesaranum.
const DB = window.MYNDARSOGUR;
const books = DB.hilla().map(s => ({id:s.id,name:DB.titill(s,'is'),href:`lesa/?saga=${encodeURIComponent(s.id)}`,cover:DB.forsíða(s)}));

// „Halda áfram“: lesarinn þarf að geyma {saga, bls, mal} í localStorage undir 'myndarsogur-sidast'.
let start = 0;
const last = store.get('myndarsogur-sidast',null);
const lastStory = last && typeof last==='object' && DB.saga(last.saga);
if(lastStory && !lastStory.falin){
  start = Math.max(0,books.findIndex(b=>b.id===lastStory.id));
  const page = parseInt(last.bls,10)||1;
  if(page>1){
    const q = new URLSearchParams({saga:lastStory.id});
    if(DB.málSögu(lastStory).includes(last.mal))q.set('mal',last.mal);
    q.set('bls',page);
    $('continue').href = `lesa/?${q}`;
    $('continue-title').textContent = DB.titill(lastStory,q.get('mal')||'is');
    $('continue-page').textContent = `· bls. ${page}`;
    $('continue').hidden = false;
  }
}

const track = $('carousel'), dots = $('dots');
Array.from({length:books.length*3},(_,i)=>books[i%books.length]).forEach((book,i) => {
  const link = document.createElement('a');
  link.className = 'book'; link.href = book.href;
  link.setAttribute('aria-label',`Lesa ${book.name}`);
  if(i<books.length||i>=books.length*2){link.tabIndex=-1;link.setAttribute('aria-hidden','true');}
  link.style.setProperty('--tilt',`${i%2 ? 3 : -3}deg`);
  const img = new Image(); img.src = book.cover; img.alt = `${book.name} — forsíða`;
  img.width = 450; img.height = 600;
  // Bókin í miðjunni og nágrannar hennar sjást strax; hinar hlaðast þegar strokið er.
  const near = Math.abs(i-(books.length+start))<=1;
  img.loading = near ? 'eager' : 'lazy';
  if(i===books.length+start)img.fetchPriority = 'high';
  link.append(img); track.append(link);
});
books.forEach((book,i)=>{
  const dot = document.createElement('button');
  dot.type = 'button'; dot.className = 'dot';
  dot.setAttribute('aria-label',`${book.name} (${i+1} af ${books.length})`);
  dot.addEventListener('click',()=>go(books.length+i));
  dots.append(dot);
});
const cards = [...track.children];
let current = books.length+start, shown = -1, frame = 0, settle;
function highlight(){
  const center = track.getBoundingClientRect().left + track.clientWidth/2;
  let distance = Infinity;
  cards.forEach((c,i)=>{
    const rect = c.getBoundingClientRect(), d = Math.abs(rect.left+rect.width/2-center);
    if(d<distance){distance=d;current=i;}
  });
  cards.forEach((c,i)=>c.classList.toggle('is-active',i===current));
  const book = current%books.length;
  if(book!==shown){shown=book;[...dots.children].forEach((d,j)=>d.setAttribute('aria-current',String(j===book)));}
}
function go(i,instant=false){
  i = (i+cards.length)%cards.length;
  const c=cards[i];
  track.scrollTo({left:c.offsetLeft+c.offsetWidth/2-track.clientWidth/2,behavior:instant||reduced.matches?'instant':'smooth'});
}
track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(highlight);clearTimeout(settle);settle=setTimeout(()=>{if(current<books.length||current>=books.length*2)go(current%books.length+books.length,true);},180);},{passive:true});
$('prev').addEventListener('click',()=>go(current-1));
$('next').addEventListener('click',()=>go(current+1));
track.addEventListener('keydown',e=>{
  if(e.target!==track)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(current+(e.key==='ArrowRight'?1:-1));}
});
let width = innerWidth;
// Í síma kemur resize þegar vafrastikan felur sig; þá á hillan ekki að hoppa.
window.addEventListener('resize',()=>{if(innerWidth!==width){width=innerWidth;go(current,true);}});
requestAnimationFrame(()=>{go(books.length+start,true);highlight();});

/* ---------- Hlaðvarp ---------- */
const audio = $('audio'), play = $('play'), miniPlay = $('mini-play'), seek = $('seek'), mini = $('miniplayer');
const media = 'mediaSession' in navigator ? navigator.mediaSession : null;
let episodes=[], episode, started=false, dismissed=false, cardVisible=true, scrubbing=false;
const time = s => Number.isFinite(s) ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '--:--';
// Titlarnir eru á forminu „Nafn - Efni þáttarins“; nafnið fær að vera stórt.
function splitTitle(title){
  const m = title.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  return m ? {name:m[1],topic:m[2]} : {name:title,topic:''};
}

function selectEpisode(autoplay=!audio.paused){
  episode=randomOther(episodes,episode); if(!episode)return;
  audio.pause(); audio.src=episode.src;
  const {name,topic}=splitTitle(episode.title);
  $('episode-name').textContent=name;
  $('episode-topic').textContent=topic;
  $('mini-title').textContent=name;
  $('episode-image').hidden=!episode.image;
  if(episode.image)$('episode-image').src=episode.image;
  if(episode.image)$('mini-image').src=episode.image;else $('mini-image').removeAttribute('src');
  $('audio-status').textContent='';
  seek.value=0; seek.disabled=true; progress();
  for(const b of [play,$('back15'),$('fwd15')])b.disabled=false;
  if(media)media.metadata=new MediaMetadata({
    title:episode.title, artist:'Hlaðvarp Myndarsagna', album:'Myndarsögur',
    artwork:[episode.image?{src:episode.image,sizes:'512x512'}:{src:new URL('/favicon/favicon-512x512.png',location.href).href,sizes:'512x512',type:'image/png'}]
  });
  if(autoplay)audio.play().catch(()=>{});
}
function toggle(){
  if(!episode)return;
  if(audio.paused)audio.play().catch(()=>{$('audio-status').textContent='Hljóðið næst ekki núna. Prófaðu annan þátt.';});
  else audio.pause();
}
function skip(seconds){
  if(!episode)return;
  const end = Number.isFinite(audio.duration) ? audio.duration : Infinity;
  audio.currentTime = Math.min(Math.max(0,audio.currentTime+seconds),end);
}
function progress(){
  const d = audio.duration, t = audio.currentTime||0, ratio = Number.isFinite(d)&&d>0 ? t/d : 0;
  if(!scrubbing)seek.value = Math.round(ratio*1000);
  seek.style.setProperty('--p',`${seek.value/10}%`);
  $('time-current').textContent = time(t);
  $('time-total').textContent = time(d);
  $('mini-progress').style.width = `${ratio*100}%`;
}
function setPlaying(playing){
  for(const b of [play,miniPlay]){b.classList.toggle('is-playing',playing);b.setAttribute('aria-label',playing?'Gera hlé':'Spila');}
  if(media)media.playbackState = playing ? 'playing' : 'paused';
  updateMini();
}
// Smáspilarinn sést þegar þáttur er farinn af stað en spilarinn sjálfur er ekki á skjánum.
function updateMini(){mini.hidden = !(started && !dismissed && !cardVisible);}

play.addEventListener('click',toggle);
miniPlay.addEventListener('click',toggle);
$('back15').addEventListener('click',()=>skip(-15));
$('fwd15').addEventListener('click',()=>skip(15));
$('mini-title').addEventListener('click',()=>$('hlusta').scrollIntoView({behavior:behavior(),block:'center'}));
$('mini-close').addEventListener('click',()=>{audio.pause();dismissed=true;updateMini();});
$('shuffle-audio').addEventListener('click',()=>selectEpisode());
audio.addEventListener('play',()=>{started=true;dismissed=false;setPlaying(true);});
audio.addEventListener('pause',()=>setPlaying(false));
audio.addEventListener('ended',()=>setPlaying(false));
audio.addEventListener('loadedmetadata',()=>{seek.disabled=false;progress();});
audio.addEventListener('durationchange',progress);
audio.addEventListener('timeupdate',()=>{
  progress();
  if(media?.setPositionState&&Number.isFinite(audio.duration)){
    try{media.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)});}catch{}
  }
});
audio.addEventListener('error',()=>{if(episode)$('audio-status').textContent='Hljóðið næst ekki núna. Prófaðu annan þátt eða opnaðu alla þættina.';});
seek.addEventListener('pointerdown',()=>{scrubbing=true;});
seek.addEventListener('input',()=>{
  if(Number.isFinite(audio.duration))audio.currentTime=seek.value/1000*audio.duration;
  progress();
});
for(const type of ['pointerup','pointercancel','change'])seek.addEventListener(type,()=>{scrubbing=false;});
$('episode-image').addEventListener('error',()=>{$('episode-image').hidden=true;});
new IntersectionObserver(([entry])=>{cardVisible=entry.isIntersecting;updateMini();}).observe($('hlusta'));

// Stýring af læstum skjá, úr stjórnborði og frá heyrnartólum.
if(media){
  const actions = {
    play:()=>audio.play().catch(()=>{}), pause:()=>audio.pause(),
    seekbackward:d=>skip(-(d.seekOffset||15)), seekforward:d=>skip(d.seekOffset||15),
    seekto:d=>{if(Number.isFinite(d.seekTime))audio.currentTime=d.seekTime;},
    nexttrack:()=>selectEpisode(true)
  };
  for(const [action,handler] of Object.entries(actions)){try{media.setActionHandler(action,handler);}catch{/* Ekki stutt í þessum vafra. */}}
}

(async()=>{
  try{
    episodes=await (await get('assets/podcasts.json')).json();
    selectEpisode(false); $('shuffle-audio').disabled=false;
  }catch{$('episode-name').textContent='Hlaðvarp Myndarsagna';$('audio-status').textContent='Þættirnir eru aðgengilegir á hlaðvarpssíðunni.';}
  try{
    const xml=await (await get('https://anchor.fm/s/eb470ff4/podcast/rss')).text();
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    const fresh=[...doc.querySelectorAll('item')].map(item=>({
      title:item.querySelector('title')?.textContent||'Hlaðvarp Myndarsagna',
      src:safeURL(item.querySelector('enclosure')?.getAttribute('url')),
      image:safeURL(item.getElementsByTagNameNS('*','image')[0]?.getAttribute('href'))
    })).filter(e=>e.src);
    // Þáttur sem er í spilun eða þegar valinn helst óbreyttur þegar nýji listinn kemur.
    if(fresh.length){episodes=fresh;if(!episode)selectEpisode(false);$('shuffle-audio').disabled=false;}
  }catch{/* Staðbundni þáttalistinn dugar ef RSS/CORS bregst. */}
})();

/* ---------- Fyrir augun og myndaskoðarinn ---------- */
// Myndirnar koma úr assets/fyrir-augun.json: {name, link, src, litil}. Ný mynd = ný lína þar.
// „litil“ (valfrjálst) er minni útgáfa fyrir spjaldið; „src“ birtist í fullri stærð í skoðaranum.
const viewer = $('viewer'), card = $('random-image'), big = $('viewer-image');
let pictures=[], seen=[], at=-1, fallen=false, swipeDir=0, picture=null;
// Fyrir imgur-hlekki án „litil“ er minni útgáfan sótt beint frá imgur („l“ = 640px).
function sized(src,size){
  const url=src.replace('https://imgur.com/','https://i.imgur.com/');
  return size?url.replace(/^(https:\/\/i\.imgur\.com\/\w+)(\.\w+)$/,`$1${size}$2`):url;
}
function show(p){
  picture=p;
  card.src=p.thumb; card.alt=p.alt;
  for(const a of [$('picture-credit'),$('viewer-credit')]){a.textContent=p.name?`${p.name} ↗`:'';a.href=safeURL(p.link)||'Arid2024/';}
  if(viewer.open)showBig();
}
// Skoðarinn sýnir strax minni myndina og skiptir yfir í fulla stærð þegar hún hefur hlaðist.
function showBig(){
  const p=picture; if(!p)return;
  big.src=p.thumb; big.alt=p.alt;
  if(p.full===p.thumb)return;
  const full=new Image(); full.src=p.full;
  full.decode().then(()=>{if(picture===p&&viewer.open)big.src=p.full;}).catch(()=>{});
}
// Áfram = ný mynd af handahófi; til baka = myndin sem sást síðast.
function selectPicture(dir=1){
  if(!pictures.length)return;
  if(dir<0&&at>0)at--;
  else if(dir>0&&at<seen.length-1)at++;
  else if(dir>0){seen.push(randomOther(pictures,seen[at]));at=seen.length-1;}
  else return;
  const p=seen[at]; fallen=false; swipeDir=dir;
  show({thumb:p.litil||sized(p.src,'l'),full:sized(p.src),alt:p.alt||`Myndasaga eftir ${p.name}`,name:p.name||'',link:p.link});
  $('viewer-prev').disabled = at<=0;
}
function fallback(){
  if(fallen)return; fallen=true;
  const book=books[Math.floor(Math.random()*books.length)];
  show({thumb:book.cover,full:book.cover,alt:`${book.name} — forsíða`,name:`${book.name} · Úr bókahillunni`,link:book.href});
}
card.addEventListener('error',fallback);
big.addEventListener('error',fallback);
big.addEventListener('load',()=>{
  if(!viewer.open||!swipeDir||reduced.matches)return;
  big.animate([{transform:`translateX(${swipeDir*70}px)`,opacity:0},{transform:'none',opacity:1}],{duration:240,easing:'ease-out'});
  swipeDir=0;
});
$('shuffle-image').addEventListener('click',()=>selectPicture(1));
$('open-viewer').addEventListener('click',()=>{swipeDir=0;showBig();viewer.showModal();});
$('close-viewer').addEventListener('click',()=>viewer.close());
$('viewer-next').addEventListener('click',()=>selectPicture(1));
$('viewer-prev').addEventListener('click',()=>selectPicture(-1));
viewer.addEventListener('keydown',e=>{if(e.key==='ArrowRight')selectPicture(1);if(e.key==='ArrowLeft')selectPicture(-1);});
// Strokið til hliðar flettir, strokið niður lokar. Tveggja fingra súm er látið vafranum eftir.
let drag=null;
big.addEventListener('pointerdown',e=>{if(!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};big.setPointerCapture(e.pointerId);big.classList.add('dragging');});
big.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId)return;
  const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
  big.style.transform = Math.abs(dx)>Math.abs(dy) ? `translateX(${dx}px) rotate(${dx/40}deg)` : `translateY(${Math.max(0,dy)}px)`;
  big.style.opacity = Math.abs(dx)>Math.abs(dy) ? '' : String(1-Math.min(.6,Math.max(0,dy)/400));
});
function endDrag(e){
  if(drag?.id!==e.pointerId)return;
  const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag=null;
  big.classList.remove('dragging'); big.style.transform=''; big.style.opacity='';
  if(e.type!=='pointerup')return;
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))selectPicture(dx<0?1:-1);
  else if(dy>90&&dy>Math.abs(dx))viewer.close();
}
big.addEventListener('pointerup',endDrag);
big.addEventListener('pointercancel',endDrag);
(async()=>{try{pictures=await (await get('assets/fyrir-augun.json')).json();selectPicture(1);$('shuffle-image').disabled=!pictures.length;}catch{fallback();}})();

/* ---------- „Meira“-skúffan ---------- */
const sheet = $('more-sheet');
function closeOnBackdrop(dialog){
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
  });
}
$('open-more').addEventListener('click',()=>sheet.showModal());
$('close-more').addEventListener('click',()=>sheet.close());
closeOnBackdrop(sheet);

/* ---------- Flipastikan ---------- */
const tabs = [...document.querySelectorAll('.tabbar a[data-section]')];
function setTab(id){tabs.forEach(a=>a.dataset.section===id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));}
tabs.forEach(a=>a.addEventListener('click',e=>{
  const target=$(a.dataset.section); if(!target)return;
  e.preventDefault();
  if(a.dataset.section==='hilla')scrollTo({top:0,behavior:behavior()});
  else target.scrollIntoView({behavior:behavior(),block:'start'});
  setTab(a.dataset.section);
}));
const spy = new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setTab(e.target.id);},{rootMargin:'-40% 0px -55% 0px'});
tabs.forEach(a=>{const target=$(a.dataset.section);if(target)spy.observe(target);});
setTab('hilla');
})();
