"use strict";
/* Threadbare · split module: 04-log.js  (lines 1126–1169 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   LOG
   ============================================================ */
function worldEvent(p, text, flags){
  // a deed that marks the world; persists across generations
  if(!G.world) G.world=[];
  G.world.push({year:G.year, by:p.first+' '+p.last, text, flags:flags||{}});
  if(G.world.length>40) G.world=G.world.slice(-40);
  p.stats.fame=clamp(p.stats.fame + (flags&&flags.hope?10:flags&&flags.fear?8:6));
  log('🌍 '+text,'big');
  // some world effects ripple to the player
  if(flags){
    if(flags.fear){ p.stats.happy=clamp(p.stats.happy+4); p.money+=50000+rnd(200000); }
    if(flags.hope){ p.stats.happy=clamp(p.stats.happy+8); }
    if(flags.clones){ p.stats.happy=clamp(p.stats.happy-4); }
  }
}
const SEASONS=['Winter','Spring','Summer','Autumn'];
function log(text,kind='good'){
  const p=me();
  const yr = p? `Age ${p.age}` : '';
  const entry={t:text,k:kind,yr, age:p?p.age:0, q:p?(p.q||0):0, year:G?G.year:0};
  if(p) p.log.push(entry);
  paintLog(entry);
}
function paintLog(entry){
  const div=document.createElement('div');
  div.className='entry '+entry.k;
  if(entry.k==='muted'){ div.innerHTML=`<span class="muted">${entry.t}</span>`; }
  else div.innerHTML=`${entry.yr?`<span class="yr">${entry.yr}</span>`:''}<span class="body">${entry.t}</span>`;
  const L=$('#log'); L.appendChild(div); L.scrollTop=L.scrollHeight;
}
let _logShownFor=null;
function repaintLog(force){
  const p=me(); const L=$('#log');
  // only rebuild the whole log when we switch to a different character (new heir),
  // otherwise live log() appends keep it current and we avoid the scroll-through flicker
  if(!force && _logShownFor===(p&&p.id)) { L.scrollTop=L.scrollHeight; return; }
  _logShownFor = p && p.id;
  L.innerHTML='';
  (p?.log||[]).slice(-80).forEach(paintLog);
  L.scrollTop=L.scrollHeight;
}

