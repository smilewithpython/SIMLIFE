"use strict";
/* Threadbare · split module: 24-family-tree.js  (lines 7602–7628 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   FAMILY TREE
   ============================================================ */
function openTree(){
  // build generations from people array (biological line)
  const byGen={};
  G.people.forEach(p=>{ (byGen[p.gen]=byGen[p.gen]||[]).push(p); });
  const gens=Object.keys(byGen).map(Number).sort((a,b)=>a-b);
  let html=`<div class="grab"></div><h3>The ${G.lineage} line</h3><p class="hint">Every life lived in this bloodline. ★ marks who you are now.</p><div id="tree">`;
  gens.forEach(g=>{
    html+=`<div class="gen"><span class="gen-lab">Gen ${g}</span>`;
    byGen[g].forEach(p=>{
      const isYou=p.id===G.cur;
      const f= p.sex==='m'?'👨':p.sex==='f'?'👩':'🧑';
      const yrs = p.alive? `b. ${p.born}` : `${p.born}–${p.born+(p.deathAge||p.age)}`;
      html+=`<div class="node ${isYou?'you':''} ${p.alive?'':'dead'}">
        <div class="nf">${p.alive?f:'🕯'}</div>
        <div class="nn">${p.first}<br>${p.last}</div>
        <div class="ny">${yrs}${isYou?' ★':''}</div>
      </div>`;
    });
    html+=`</div>`;
  });
  html+=`</div>`;
  sheet(html);
}

