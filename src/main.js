import {createWebGPU, createWebGL} from './graphics.js';

const $ = selector => document.querySelector(selector);
const worlds = [
  {name:'Umbra',type:'Ringed giant',label:'Independent IT studio',lead:'Digital',italic:'frontiers',copy:'Web platforms, intelligent workflows, and immersive experiences. Engineered in Kerala.',alt:'Copper and sandstone cloud bands encircled by amber rings'},
  {name:'Pelagos',type:'Ocean world',label:'Intelligent workflows',lead:'Find your',italic:'flow',copy:'Connect the tools your team already uses. Make room for human judgment where the work needs it.',alt:'An ocean-blue planet with swirling jade clouds and inclined pale rings'},
  {name:'Cinder',type:'Mineral world',label:'Immersive experiences',lead:'Shape the',italic:'unseen',copy:'Turn complex ideas into interactive experiences people can see, touch, and explore.',alt:'A mineral world with rose and charcoal strata and narrow rings'}
];
const section=$('#expedition'), viewer=$('#instrument'), stage=$('.flight'), surface=$('#surface'), poster=$('#poster');
const choices=[...document.querySelectorAll('[data-stop]')], mode=$('#mode'), reduce=matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');
let progress=0, current=-1, yaw=0, pitch=0, elapsed=0, engine=null, canvas=null;
let ticket=0, anim=0, last=0, visible=true, unavailable=false, detail=1, average=16, samples=0;
let stored=null;
try {stored=localStorage.getItem('projectz.visual-mode')} catch {}
let still=stored==='still'||reduce.matches||navigator.connection?.saveData===true;
let imagePromise;
function loadAtlas(){
  if(!imagePromise)imagePromise=(async()=>{
    const image=new Image();image.src='/assets/surfaces.webp';await image.decode();return image;
  })().catch(e=>{imagePromise=null;throw e});
  return imagePromise;
}
function modeLabel(){
  mode.hidden=false;mode.setAttribute('aria-pressed',String(still||unavailable));
  mode.querySelector('span').textContent=unavailable?'Retry 3D':still?'Enable 3D':'Still mode';
  mode.title=unavailable?'Still artwork is active. Retry interactive graphics.':still?'Enable the interactive planet':'Switch to still artwork';
  $('#gesture').textContent=engine?'Drag to orbit · Scroll to travel':'Scroll to travel';
}
function switchWorld(i){
  if(i===current)return;current=i;
  const w=worlds[i];poster.src='/assets/world-'+i+'.webp';poster.alt=w.alt;
  $('#overline').textContent=w.label;$('#headline > span').textContent=w.lead;
  $('#headline em').firstChild.textContent=w.italic;$('#deck').textContent=w.copy;
  $('#figlabel').textContent=w.name;$('#classlabel').textContent=w.type;
  choices.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
}
function limits(){const top=scrollY+section.getBoundingClientRect().top-$('.site-head').offsetHeight;return [top,Math.max(1,section.offsetHeight-stage.offsetHeight)]}
function scrollUpdate(){
  const [top,span]=limits();progress=Math.max(0,Math.min(2,2*(scrollY-top)/span));switchWorld(Math.round(progress));
}
let scrollFrame=0;
function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;scrollUpdate()})}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);scrollUpdate();
choices.forEach((b,i)=>b.addEventListener('click',()=>{const [top,span]=limits();window.scrollTo({top:top+i*span/2,behavior:reduce.matches?'instant':'smooth'})}));
function cleanup(){
  cancelAnimationFrame(anim);anim=0;last=0;stage.classList.remove('live');
  const old=engine;engine=null;old?.release();surface.replaceChildren();canvas=null;stage.dataset.renderer='still';
}
function frame(now){
  anim=0;if(!engine||!visible||document.hidden)return;
  if(last){
    const dt=Math.min(90,now-last);elapsed+=dt*.001;
    average=average*.93+dt*.07;
    if(++samples>=45){
      if(average>27)detail=Math.max(.48,detail-.12);
      if(average<18)detail=Math.min(1,detail+.06);
      samples=0;
    }
  }
  last=now;
  const dpr=Math.min(devicePixelRatio||1,1.55)*detail;
  const w=Math.max(1,Math.round(viewer.clientWidth*dpr)),h=Math.max(1,Math.round(viewer.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  try{
    engine.draw(new Float32Array([w,h,yaw+elapsed*.029,pitch,progress,detail,elapsed,0]));
    stage.classList.add('live');anim=requestAnimationFrame(frame);
  }catch{unavailable=true;cleanup();modeLabel()}
}
function wake(){if(!anim&&engine&&visible&&!document.hidden){last=0;anim=requestAnimationFrame(frame)}}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(anim);anim=0;last=0}}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();else{cancelAnimationFrame(anim);anim=0;last=0}});
async function start(glOnly=false){
  const my=++ticket;cleanup();unavailable=false;modeLabel();if(still)return;
  try{
    const image=await loadAtlas();
    for(const factory of (glOnly?[createWebGL]:[createWebGPU,createWebGL])){
      if(my!==ticket)return;
      const c=document.createElement('canvas');
      try{
        const next=await factory(c,image,()=>{
          if(my!==ticket)return;
          if(factory===createWebGPU){void start(true);return}
          ++ticket;unavailable=true;cleanup();modeLabel();
        });
        if(my!==ticket){next.release();return}
        canvas=c;surface.replaceChildren(c);engine=next;stage.dataset.renderer=engine.name;modeLabel();wake();return;
      }catch{/* A fresh canvas is required when switching context types. */}
    }
  }catch{/* The poster stays visible on decoding or network failure. */}
  if(my===ticket){unavailable=true;modeLabel()}
}
mode.addEventListener('click',()=>{
  still=unavailable?false:!still;
  try{localStorage.setItem('projectz.visual-mode',still?'still':'live')}catch{}
  void start();
});
reduce.addEventListener('change',e=>{if(e.matches){still=true;void start()}});
let drag=null;
viewer.addEventListener('pointerdown',e=>{if(!engine||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};viewer.setPointerCapture(e.pointerId)});
viewer.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(-.7,Math.min(.7,pitch+(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY});
for(const event of ['pointerup','pointercancel','lostpointercapture']) viewer.addEventListener(event,()=>{drag=null});
viewer.addEventListener('keydown',e=>{if(!engine||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();yaw+=e.key==='ArrowRight'?.2:-.2});
document.querySelectorAll('.disciplines details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.disciplines details[open]').forEach(other=>{if(other!==item)other.open=false})}));
void start();
