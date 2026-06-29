"use strict";
/* Threadbare · split module: 05-render.js  (lines 1170–1224 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   RENDER HEADER + STATS + ACTIONS
   ============================================================ */
const STATMETA=[
  {k:'health',l:'Health',c:'--blood'},
  {k:'happy', l:'Joy',   c:'--gold'},
  {k:'smarts',l:'Smarts',c:'--sky'},
  {k:'looks', l:'Looks', c:'--rose'},
];
function render(){
  const p=me(); if(!p)return;
  p.money = clampMoney(p.money);   // recover any NaN/overflowed balance and enforce the cap
  $('#h-name').textContent = p.first+' '+p.last;
  $('#h-gen').textContent = 'Gen '+p.gen;
  const c=CAREER(p.job);
  let role = p.inSchool? p.schoolLevel : (p.job!=='none'? c.l : (p.retired?'Retired':(p.age<6?'A small child':p.age<18?'A student of life':'Between things')));
  $('#h-sub').textContent = `${p.age} yrs · ${sexWord(p.sex)} · ${role}`;
  const st=$('#h-stats'); st.innerHTML='';
  STATMETA.forEach(m=>{
    const v=Math.round(p.stats[m.k]);
    st.insertAdjacentHTML('beforeend',
      `<div class="stat"><span class="lab">${m.l}</span><span class="bar"><i class="fill" style="width:${v}%;background:var(--${m.c.slice(2)})"></i></span></div>`);
  });
  $('#h-money').innerHTML = `Purse <b>${money(p.money)}</b>${p.salary?` · earns ${money(p.salary)}/yr`:''}${p.stats.fame>5?` · ★ ${Math.round(p.stats.fame)} fame`:''}`;
  $('#age-sub').textContent = `· ${SEASONS[p.q||0]}`;
  const lbl=$('#age-label'); if(lbl) lbl.textContent = (p.q||0)===3 ? '＋ End of Year' : '＋ Next Season';
  buildActions();
  repaintLog();
  save();
}
function sexWord(s){ return s==='m'?'man':s==='f'?'woman':'person'; }
function sexWordYoung(p){ return p.age<13?(p.sex==='m'?'boy':p.sex==='f'?'girl':'child'):(p.sex==='m'?'young man':p.sex==='f'?'young woman':'youth'); }

/* ---------------- bottom action bar ---------------- */
function buildActions(){
  const p=me();
  const A=$('#actions'); A.innerHTML='';
  const acts=[
    {ico:'👪',l:'People',fn:openRelations},
    {ico:'🎯',l:'Do',fn:openActivities},
    {ico:'💼',l:'Career',fn:openCareer},
    {ico:'💰',l:'Money',fn:openFinances},
    {ico:'🩺',l:'Health',fn:openHealth},
    {ico:'🧠',l:'Self',fn:openSelf},
    {ico:'🌳',l:'Tree',fn:openTree},
  ];
  // The Homelander tab appears once the bloodline is on the path (has powers, or later generations)
  if(homelanderTabUnlocked(p)) acts.push({ico:'☄️',l:'Homelander',fn:openHomelander});
  acts.forEach(a=>{
    const b=document.createElement('button'); b.className='act';
    b.innerHTML=`<span class="ico">${a.ico}</span><span>${a.l}</span>`;
    b.onclick=a.fn; A.appendChild(b);
  });
}

