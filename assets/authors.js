'use strict';
(()=>{
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function safeURL(value){try{const u=new URL(value,location.origin+'/');return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('Could not load authors');return r;}
// A small physics playground, using local author portraits.
const world=$('authors'), colors=['#f6a5c9','#f7d44c','#8ccaf2','#8fd18b','#b9a3e8','#f07a63'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let heads=[],W=world.clientWidth,H=world.clientHeight;
let tiltX=0,tiltY=0,motionEnabled=false,animation=0,last=0,visible=false;
function paint(h){h.el.style.transform=`translate(${h.x-h.r}px,${h.y-h.r}px) rotate(${h.angle}deg)`;}
function bounds(h){
  if(h.x<h.r){h.x=h.r;h.vx=Math.abs(h.vx)*.82;}
  if(h.x>W-h.r){h.x=W-h.r;h.vx=-Math.abs(h.vx)*.82;}
  if(h.y<h.r){h.y=h.r;h.vy=Math.abs(h.vy)*.82;}
  if(h.y>H-h.r){h.y=H-h.r;h.vy=-Math.abs(h.vy)*.82;}
}
function animate(time){
  const dt=Math.min((time-last)/16.67||1,2);last=time;
  heads.forEach((h,i)=>{
    if(h.held||h.el===document.activeElement)return;
    const drift=Math.sin(time/3200+i)*.005;
    h.vx+=(motionEnabled?tiltX*.10:drift)*dt;
    h.vy+=(motionEnabled?tiltY*.08:Math.cos(time/4100+i)*.005)*dt;
    const speed=Math.hypot(h.vx,h.vy);
    if(speed>(motionEnabled?1.8:.6)){h.vx*=Math.pow(.983,dt);h.vy*=Math.pow(.983,dt);}
    h.vx=clamp(h.vx,-7,7);h.vy=clamp(h.vy,-7,7);
    h.x+=h.vx*dt;h.y+=h.vy*dt;h.angle+=h.vx*dt/h.r*180/Math.PI;
    bounds(h);
  });
  for(let i=0;i<heads.length;i++)for(let j=i+1;j<heads.length;j++){
    const a=heads[i],b=heads[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r+3;
    if(d>=min)continue;
    const nx=d?dx/d:1,ny=d?dy/d:0,push=(min-d)/2;
    const fixedA=a.held||a.el===document.activeElement,fixedB=b.held||b.el===document.activeElement;
    if(!fixedA){a.x-=nx*push*(fixedB?2:1);a.y-=ny*push*(fixedB?2:1);}
    if(!fixedB){b.x+=nx*push*(fixedA?2:1);b.y+=ny*push*(fixedA?2:1);}
    const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(relative<0){
      if(!fixedA){a.vx+=relative*nx*.9;a.vy+=relative*ny*.9;}
      if(!fixedB){b.vx-=relative*nx*.9;b.vy-=relative*ny*.9;}
    }
  }
  heads.forEach(h=>{if(!h.held&&h.el!==document.activeElement)bounds(h);paint(h);});
  animation=requestAnimationFrame(animate);
}
function startAnimation(){
  cancelAnimationFrame(animation);animation=0;last=0;
  world.classList.toggle('still',reduced.matches);
  if(reduced.matches)world.style.height='';
  if(reduced.matches){heads.forEach(h=>h.el.style.transform='');return;}
  heads.forEach(paint);
  if(visible&&!document.hidden&&heads.length)animation=requestAnimationFrame(animate);
}
function grab(e,h){
  if(e.button!==0||reduced.matches||h.held)return;
  e.preventDefault();
  const rect=world.getBoundingClientRect(),ox=e.clientX-rect.left-h.x,oy=e.clientY-rect.top-h.y;
  let samples=[{x:h.x,y:h.y,t:performance.now()}],moved=0;
  h.held=true;h.el.classList.add('held');h.el.setPointerCapture(e.pointerId);
  const move=ev=>{
    const rect=world.getBoundingClientRect();
    const x=clamp(ev.clientX-rect.left-ox,h.r,W-h.r),y=clamp(ev.clientY-rect.top-oy,h.r,H-h.r);
    moved+=Math.hypot(x-h.x,y-h.y);h.x=x;h.y=y;paint(h);
    samples.push({x,y,t:performance.now()});if(samples.length>5)samples.shift();
  };
  const up=ev=>{
    h.el.removeEventListener('pointermove',move);h.el.removeEventListener('pointerup',up);h.el.removeEventListener('pointercancel',up);
    h.held=false;h.el.classList.remove('held');
    if(h.el.hasPointerCapture(e.pointerId))h.el.releasePointerCapture(e.pointerId);
    if(moved>6){
      h.suppressUntil=performance.now()+500;
      const a=samples[0],b=samples.at(-1),dt=Math.max(16,b.t-a.t);
      h.vx=ev.type==='pointercancel'?0:clamp((b.x-a.x)/dt*16,-7,7);
      h.vy=ev.type==='pointercancel'?0:clamp((b.y-a.y)/dt*16,-7,7);
      h.el.blur();
    }
    if(ev.type==='pointerup'&&moved<=6){h.el.click();h.suppressUntil=performance.now()+500;}
  };
  h.el.addEventListener('pointermove',move);h.el.addEventListener('pointerup',up);h.el.addEventListener('pointercancel',up);
}
(async()=>{
  try{
    const authors=await (await get('/assets/authors.json')).json();
    const columns=Math.max(2,Math.min(7,Math.floor((world.clientWidth-32)/125)));
    world.style.height=`${Math.ceil(authors.length/columns)*160+50}px`;
    W=world.clientWidth;H=world.clientHeight;
    authors.filter(a=>a.img&&a.name).forEach((a,i)=>{
      const el=document.createElement('a');el.className='author';el.href=`/folk/#${a.slug}`;
      el.setAttribute('aria-label',a.name);el.dataset.slug=a.slug;el.title=a.name;el.dataset.name=a.name;
      const size=(innerWidth<650?66:80)+(i%3)*8;
      el.style.setProperty('--color',colors[i%colors.length]);el.style.setProperty('--size',`${size}px`);
      const img=new Image();img.src=safeURL(a.img);img.alt='';img.draggable=false;img.loading='lazy';
      const initial=document.createElement('span');initial.className='initial';initial.textContent=a.name[0];initial.setAttribute('aria-hidden','true');
      img.addEventListener('error',()=>img.remove());el.append(initial,img);world.append(el);
      const h={el,r:size/2,x:64+(i%columns)*(W-128)/Math.max(1,columns-1),y:95+Math.floor(i/columns)*160+(i%3)*10,vx:Math.cos(i*2.3)*.48,vy:Math.sin(i*2.3)*.38,angle:(i%5-2)*8,held:false,suppressUntil:0};
      heads.push(h);el.addEventListener('pointerdown',e=>grab(e,h));
      el.addEventListener('click',e=>{
        if(performance.now()<h.suppressUntil){e.preventDefault();return;}
        if(dialog){e.preventDefault();showAuthor(a,el);}
      });
      el.addEventListener('focus',()=>{if(!h.held)el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});});
    });
    if(dialog){
      authorCatalog=authors;
      openFromHash();
    }
    $('fish-author').disabled=!heads.length;
    startAnimation();
  }catch{world.textContent='Kynntu þér höfundana í höfundaskránni ↗';}
})();
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;startAnimation();},{rootMargin:'100px'}).observe(world);
new ResizeObserver(()=>{
  if(reduced.matches)return;
  const oldW=W,oldH=H;
  const columns=Math.max(2,Math.min(7,Math.floor((world.clientWidth-32)/125)));
  if(heads.length)world.style.height=`${Math.ceil(heads.length/columns)*160+50}px`;
  W=world.clientWidth;H=world.clientHeight;
  if(fishing&&(W!==oldW||H!==oldH))cancelFishing();
  if(!reduced.matches)heads.forEach(h=>{h.x=h.x/oldW*W;h.y=h.y/oldH*H;bounds(h);paint(h);});
}).observe(world);
reduced.addEventListener('change',()=>{if(reduced.matches){disableMotion();cancelFishing();}startAnimation();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelFishing();startAnimation();});
function onOrientation(e){
  if(!Number.isFinite(e.gamma)||!Number.isFinite(e.beta))return;
  let x=e.gamma,y=e.beta-35;
  const angle=screen.orientation?.angle??window.orientation??0;
  if(Math.abs(angle)===90){x=e.beta;y=e.gamma;}if(angle===90)x=-x;
  tiltX=clamp(x/35,-1,1);tiltY=clamp(y/45,-1,1);
}
let lastShake=0;
function onShake(e){
  if(!visible||document.hidden)return;
  const a=e.acceleration;if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y))return;
  const strength=Math.hypot(a.x,a.y,a.z||0),now=performance.now();
  if(strength<2.5||now-lastShake<180)return;lastShake=now;
  const angle=(screen.orientation?.angle??window.orientation??0)*Math.PI/180;
  const x=a.x*Math.cos(angle)-a.y*Math.sin(angle),y=a.x*Math.sin(angle)+a.y*Math.cos(angle);
  heads.forEach((h,i)=>{if(h.held)return;h.vx+=clamp(x*.35,-3,3);h.vy+=clamp(-y*.35,-3,3)+(i%2?.2:-.2);});
}
function disableMotion(){
  motionEnabled=false;tiltX=0;tiltY=0;
  window.removeEventListener('deviceorientation',onOrientation);window.removeEventListener('devicemotion',onShake);
}
let motionAttempted=false;
async function enableMotion(){
  if(motionEnabled||motionAttempted||reduced.matches)return;
  motionAttempted=true;
  const sensors=[['deviceorientation',window.DeviceOrientationEvent,onOrientation],['devicemotion',window.DeviceMotionEvent,onShake]].filter(s=>s[1]);
  try{
    const permissions=await Promise.all(sensors.map(async([event,type,handler])=>({event,handler,allowed:typeof type.requestPermission!=='function'||await type.requestPermission()==='granted'})));
    if(reduced.matches)return;
    const allowed=permissions.filter(p=>p.allowed);
    allowed.forEach(p=>window.addEventListener(p.event,p.handler));motionEnabled=allowed.length>0;
  }catch{/* Dragging and the pulley remain available without sensor permission. */}
}

const dialog=$('author-dialog');let authorCatalog=[],returnFocus;
function showAuthor(author,trigger){
  returnFocus=trigger;$('author-name').textContent=author.name;
  $('author-portrait').src=safeURL(author.img);$('author-portrait').alt=author.name;
  $('author-website').href=safeURL(author.href)||'/hofundar/';
  $('author-portrait').style.setProperty('--color',colors[authorCatalog.indexOf(author)%colors.length]||colors[0]);
  history.replaceState(null,'',`#${author.slug}`);
  if(!dialog.open)dialog.showModal();
}
function openFromHash(){const a=authorCatalog.find(a=>'#'+a.slug===location.hash);if(a)showAuthor(a,world.querySelector(`[data-slug="${a.slug}"]`));}
if(dialog){
  $('close-author').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{history.replaceState(null,'',location.pathname);returnFocus?.focus({preventScroll:true});});
  window.addEventListener('hashchange',openFromHash);
}

// A hand-drawn pulley lowers its hook, catches a random portrait and lifts it.
const fishButton=$('fish-author');
const crane=document.createElement('div');crane.className='author-crane';crane.hidden=true;
crane.setAttribute('aria-hidden','true');
crane.innerHTML='<span class="crane-wheel"></span><span class="crane-rope"></span><svg class="crane-hook" viewBox="0 0 60 55"><path d="M30 0v18M30 18 13 30 9 45 18 49M30 18l17 12 4 15-9 4"/></svg>';
world.append(crane);
let fishing=null,fishFrame=0,previousCatch=null;
function cancelFishing(){
  cancelAnimationFrame(fishFrame);fishFrame=0;
  if(fishing){const h=fishing.head;h.held=false;h.el.classList.remove('caught');h.el.removeAttribute('aria-busy');bounds(h);paint(h);}
  fishing=null;crane.hidden=true;fishButton.disabled=!heads.length;fishButton.removeAttribute('aria-busy');
}
fishButton.addEventListener('click',()=>{
  if(fishing||!heads.length)return;
  void enableMotion();
  const choices=heads.filter(h=>h!==previousCatch&&!h.held);
  const h=choices[Math.floor(Math.random()*choices.length)]||heads[0];previousCatch=h;
  const author=authorCatalog.find(a=>a.slug===h.el.dataset.slug);
  if(reduced.matches){showAuthor(author,h.el);return;}
  h.held=true;h.vx=0;h.vy=0;h.el.classList.add('caught');h.el.setAttribute('aria-busy','true');
  fishing={head:h,startY:h.y,endY:Math.max(h.r+65,h.y-180),angle:h.angle};fishButton.disabled=true;fishButton.setAttribute('aria-busy','true');
  h.el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
  crane.hidden=false;crane.style.left=`${h.x}px`;crane.classList.remove('gripping');
  $('fishing-status').textContent='Tallían leitar að höfundi…';
  const started=performance.now(),ease=t=>1-Math.pow(1-t,3);
  function step(now){
    if(!fishing)return;
    const elapsed=now-started,catchY=fishing.startY-h.r-8;
    let drop;
    if(elapsed<650){drop=Math.max(24,catchY)*ease(elapsed/650);}
    else{
      crane.classList.add('gripping');
      const t=ease(clamp((elapsed-650)/1000,0,1));
      h.y=fishing.startY+(fishing.endY-fishing.startY)*t;h.angle=fishing.angle*(1-t);
      drop=Math.max(24,h.y-h.r-8);paint(h);
    }
    crane.style.setProperty('--drop',`${Math.max(24,drop)}px`);
    if(elapsed<1850){fishFrame=requestAnimationFrame(step);return;}
    $('fishing-status').textContent=`Veiddum ${author.name}!`;
    cancelFishing();showAuthor(author,h.el);
  }
  fishFrame=requestAnimationFrame(step);
});

})();
