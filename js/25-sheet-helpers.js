"use strict";
/* Threadbare · split module: 25-sheet-helpers.js  (lines 7629–7657 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   SHEET / OPTION HELPERS
   ============================================================ */
function O(ico,txt,sub,cost,fn,disabled=false){
  const id='o'+Math.random().toString(36).slice(2);
  window.__opts=window.__opts||{}; window.__opts[id]={fn,disabled};
  return `<button class="opt" data-id="${id}" ${disabled?'disabled':''}>
    <span class="oico">${ico}</span>
    <span class="otxt">${txt}<span class="osub">${sub}</span></span>
    ${cost?`<span class="ocost">${money(cost)}</span>`:''}</button>`;
}
function OH(label){ return `<div style="padding:14px 20px 4px;font-size:12px;color:var(--ink-faint);font-variant:small-caps;letter-spacing:1.5px">${label}</div>`; }
function bindOpts(sh){
  sh.querySelectorAll('.opt').forEach(b=>{
    const o=window.__opts[b.dataset.id];
    if(o && o.fn && !o.disabled) b.onclick=o.fn;
  });
}
function sheet(html, after){
  const s=document.createElement('div'); s.className='scrim';
  s.innerHTML=`<div class="sheet">${html}</div>`;
  root.appendChild(s);
  s.onclick=e=>{ if(e.target===s) closeSheet(); };
  if(after) after(s.querySelector('.sheet'));
}
function closeSheet(){ const s=root.querySelector('.scrim'); if(s)s.remove(); }

function toast(t){ const el=document.createElement('div'); el.className='toast'; el.textContent=t; document.body.appendChild(el); setTimeout(()=>el.remove(),1800); }

