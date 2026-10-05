'use strict';
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const books = [
  {name:'Myndar',href:'myndar/',cover:'myndar/Adal/mynd1.avif'},
  {name:'Ómyndar',href:'omyndar/',cover:'omyndar/Adal/mynd1.avif'},
  {name:'Jóla',href:'jola/',cover:'jola/Adal/mynd1.avif'},
  {name:'Stóra',href:'stora/',cover:'stora/forsida.avif'},
  {name:'Í skóinn',href:'iskoinn/',cover:'iskoinn/forsida.avif'},
  {name:'Meindarsögur',href:'Meindarsogur/',cover:'Meindarsogur/lesa/is/mynd1.avif'}
];
const track = $('carousel');
Array.from({length:books.length*3},(_,i)=>books[i%books.length]).forEach((book,i) => {
  const link = document.createElement('a');
  link.className = 'book'; link.href = book.href;
  link.setAttribute('aria-label',`Lesa ${book.name}`);
  if(i<books.length||i>=books.length*2){link.tabIndex=-1;link.setAttribute('aria-hidden','true');}
  link.style.setProperty('--tilt',`${i%2 ? 3 : -3}deg`);
  const img = new Image(); img.src = book.cover; img.alt = `${book.name} — forsíða`;
  img.width = 450; img.height = 600; img.loading = i < 3 ? 'eager' : 'lazy';
  const label = document.createElement('span'); label.className = 'book-label'; label.textContent = 'Lesa ↗';
  link.append(img,label); track.append(link);

});
const cards = [...track.children];
let current = books.length, frame = 0, settle;
function highlight(){
  const center = track.getBoundingClientRect().left + track.clientWidth/2;
  let distance = Infinity;
  cards.forEach((c,i)=>{
    const rect = c.getBoundingClientRect(), d = Math.abs(rect.left+rect.width/2-center);
    if(d<distance){distance=d;current=i;}
  });
  cards.forEach((c,i)=>c.classList.toggle('is-active',i===current));
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
window.addEventListener('resize',()=>go(current,true));
requestAnimationFrame(()=>{go(books.length,true);highlight();});

function randomOther(list,previous){
  const choices=list.filter(x=>x!==previous);
  return (choices.length?choices:list)[Math.floor(Math.random()*(choices.length||list.length))];
}
async function get(url){
  const response = await fetch(url,{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response;
}
function safeURL(value){
  try{const url = new URL(value,location.href);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}
}
let episodes=[],episode;
function selectEpisode(){
  episode=randomOther(episodes,episode); if(!episode)return;
  $('audio').pause(); $('audio').src=episode.src;
  $('episode-title').textContent=episode.title;
  $('episode-image').hidden=!episode.image;
  if(episode.image)$('episode-image').src=episode.image;
  $('audio-status').textContent='';
}
$('shuffle-audio').addEventListener('click',selectEpisode);
$('audio').addEventListener('error',()=>{$('audio-status').textContent='Hljóðið næst ekki núna. Prófaðu annan þátt eða opnaðu alla þættina.';});
$('episode-image').addEventListener('error',()=>{$('episode-image').hidden=true;});
(async()=>{
  try{
    episodes=await (await get('assets/podcasts.json')).json();
    selectEpisode(); $('shuffle-audio').disabled=false;
  }catch{$('episode-title').textContent='Hlaðvarp Myndarsagna';$('audio-status').textContent='Þættirnir eru aðgengilegir á hlaðvarpssíðunni.';}
  try{
    const xml=await (await get('https://anchor.fm/s/eb470ff4/podcast/rss')).text();
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    const fresh=[...doc.querySelectorAll('item')].map(item=>({
      title:item.querySelector('title')?.textContent||'Hlaðvarp Myndarsagna',
      src:safeURL(item.querySelector('enclosure')?.getAttribute('url')),
      image:safeURL(item.getElementsByTagNameNS('*','image')[0]?.getAttribute('href'))
    })).filter(e=>e.src);
    // Keep a playing or previously selected episode stable when the live feed arrives.
    if(fresh.length){episodes=fresh;if(!episode)selectEpisode();$('shuffle-audio').disabled=false;}
  }catch{/* The local episode catalog keeps playback available without RSS/CORS. */}
})();
let pictures=[],picture;
function selectPicture(){
  picture=randomOther(pictures,picture);if(!picture)return;
  $('random-image').src=picture.src.replace('https://imgur.com/','https://i.imgur.com/');
  $('random-image').alt=picture.alt||`Myndasaga eftir ${picture.name}`;
  $('random-link').href=safeURL(picture.link)||'Arid2024/';
  $('picture-credit').textContent=picture.name||picture.author||'';
}
$('shuffle-image').addEventListener('click',selectPicture);
$('random-image').addEventListener('error',()=>{
  if($('random-image').getAttribute('src')==='myndar/Adal/mynd1.avif')return;
  const book=books[Math.floor(Math.random()*books.length)];
  $('random-image').src=book.cover;$('random-image').alt=`${book.name} — forsíða`;
  $('random-link').href=book.href;$('picture-credit').textContent=`${book.name} · Úr bókahillunni`;
});
(async()=>{try{pictures=await (await get('assets/pictures.json')).json();selectPicture();$('shuffle-image').disabled=!pictures.length;}catch{$('picture-credit').textContent='Myndar · Íslenskar myndasögur';}})();

