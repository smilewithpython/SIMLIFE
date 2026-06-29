"use strict";
/* Threadbare · split module: 01-config-and-helpers.js  (lines 210–305 of the original single-file build; see CODEBASE_STRUCTURE.md) */
"use strict";
/* ============================================================
   THREADBARE — a generational life simulator
   single file · runs offline · saves to your phone
   ============================================================ */

const $ = s => document.querySelector(s);
const root = $('#modal-root');
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
const chance = p => Math.random()*100 < p;
const clamp = (v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const money = n => { n = Number(n); if(!Number.isFinite(n)) n = 0; return (n<0?'-$':'$') + Math.abs(Math.round(n)).toLocaleString(); };
// Largest exactly-representable integer in JS (~9.007 quadrillion). Money is capped here so it
// can grow enormously without ever losing precision or overflowing into NaN/Infinity.
const MONEY_MAX = Number.MAX_SAFE_INTEGER;
// Keeps a money value finite and within the cap. A corrupted/NaN balance is recovered to ~1 trillion
// (the floor for a megawealthy save) rather than wiped to zero.
function clampMoney(n){ n = Number(n); if(Number.isNaN(n)) return 1e12; if(n > MONEY_MAX) return MONEY_MAX; if(n < -MONEY_MAX) return -MONEY_MAX; return n; }

/* ---------------- name banks ---------------- */
const FIRST_M=['Cole','Marcus','Theo','Jasper','Eli','Roman','Silas','Otis','Dario','Wendell','Felix','Amari','Quincy','Beau','Linus','Hugo','Dex','Roland','Ira','Cyrus','Nash','Emmett','Bruno','Caspian','Levi','Dashiell'];
const FIRST_F=['Maeve','Ines','Cleo','Rosa','Edda','Juno','Lena','Sloane','Talia','Ottilie','Bex','Marisol','Greta','Noor','Cora','Vivian','Imani','Esme','Dahlia','Romy','Mabel','Frida','Saoirse','Wren','Iris','Adaeze'];
const FIRST_N=['Sage','Rowan','Lux','Marlowe','Ari','Ellis','Onyx','Briar','Lennox','Reese','Sol','True'];
const LAST=['Ashford','Vance','Okoye','Delgado','Sørensen','Castellanos','Ng','Brackett','Larkin','Petrov','Abara','Fontaine','Whitlock','Reyes','Halloran','Marchetti','Osei','Kowalski','Sterling','Dunmore','Cho','Bauer','Salib','Quayle','Faroux'];

function newFirst(sex){ return sex==='m'?pick(FIRST_M):sex==='f'?pick(FIRST_F):pick(FIRST_N); }
function makeSex(){ const r=Math.random(); return r<.48?'m':r<.96?'f':'n'; }
// pick the sex of a romantic partner based on a person's orientation
function partnerSex(p){
  const o=p.orientation||defaultOrientation(p);
  const same=p.sex, opp=p.sex==='m'?'f':p.sex==='f'?'m':makeSex();
  if(o==='gay') return same;
  if(o==='bi')  return chance(50)?same:opp;
  return opp; // straight
}
function defaultOrientation(p){
  // most are straight; a realistic minority gay/bi. Set lazily if never chosen.
  if(p.orientation) return p.orientation;
  const r=Math.random();
  p.orientation = r<0.85?'straight': r<0.93?'gay':'bi';
  return p.orientation;
}

/* ---------------- traits ---------------- */
const TRAITS=[
  {k:'curious',  l:'Curious',   e:'🔭'},
  {k:'tough',    l:'Tough',     e:'🪨'},
  {k:'charming', l:'Charming',  e:'🗝'},
  {k:'restless', l:'Restless',  e:'🌀'},
  {k:'kind',     l:'Kind',      e:'🤍'},
  {k:'sly',      l:'Sly',       e:'🦊'},
  {k:'lucky',    l:'Lucky',     e:'🍀'},
  {k:'driven',   l:'Driven',    e:'🔥'},
];

// Acquirable traits — gained through life events, nudge main stats each year,
// can be inherited by children, and can be added/removed via doctors/therapy/activities.
// nudge: per-year drift applied to stats. under: which main stat it lives "under" in the UI.
const ACQ_TRAITS=[
  {k:'handsome',    l:'Strikingly Attractive', e:'😍', under:'looks',    good:true, nudge:{looks:1.2}, heritable:true},
  {k:'plain',       l:'Plain-Looking',         e:'😐', under:'looks',    good:false,nudge:{looks:-0.8}},
  {k:'confident',   l:'Confident',             e:'😎', under:'happy',    good:true, nudge:{happy:0.8}, heritable:true},
  {k:'anxious',     l:'Anxious',               e:'😰', under:'happy',    good:false,nudge:{happy:-0.9,health:-0.2}},
  {k:'fearful',     l:'Fearful',               e:'😱', under:'happy',    good:false,nudge:{happy:-0.7}},
  {k:'brave',       l:'Brave',                 e:'🦁', under:'athletic', good:true, nudge:{happy:0.3}, heritable:true},
  {k:'genius',      l:'Brilliant',             e:'🧠', under:'smarts',   good:true, nudge:{smarts:1.3}, heritable:true},
  {k:'slow_learner',l:'Slow Learner',          e:'🐢', under:'smarts',   good:false,nudge:{smarts:-0.7}},
  {k:'athletic_gift',l:'Natural Athlete',      e:'🏆', under:'athletic', good:true, nudge:{athletic:1.2}, heritable:true},
  {k:'frail',       l:'Frail',                 e:'🍂', under:'health',   good:false,nudge:{health:-0.9}},
  {k:'robust',      l:'Iron Constitution',     e:'💪', under:'health',   good:true, nudge:{health:0.9}, heritable:true},
  {k:'charismatic', l:'Charismatic',           e:'✨', under:'fame',     good:true, nudge:{fame:0.5,happy:0.3}, heritable:true},
  {k:'awkward',     l:'Socially Awkward',      e:'😬', under:'happy',    good:false,nudge:{happy:-0.5}},
  {k:'optimist',    l:'Optimist',              e:'🌅', under:'happy',    good:true, nudge:{happy:1.0,health:0.2}, heritable:true},
  {k:'pessimist',   l:'Pessimist',             e:'🌧', under:'happy',    good:false,nudge:{happy:-0.8}},
  {k:'disciplined', l:'Disciplined',           e:'🎯', under:'smarts',   good:true, nudge:{smarts:0.5,health:0.3}, heritable:true},
  {k:'reckless',    l:'Reckless',              e:'🎲', under:'health',   good:false,nudge:{health:-0.5,happy:0.3}},
  {k:'creative',    l:'Creative',              e:'🎨', under:'smarts',   good:true, nudge:{smarts:0.4,happy:0.4}, heritable:true},
  {k:'hot_temper',  l:'Hot-Tempered',          e:'🌋', under:'happy',    good:false,nudge:{happy:-0.4}},
  {k:'gifted_looks',l:'Aging Gracefully',      e:'🌹', under:'looks',    good:true, nudge:{looks:0.6}, heritable:true},
];
const ACQ=k=>ACQ_TRAITS.find(t=>t.k===k);
function hasTrait(p,k){ return p.acqTraits && p.acqTraits.includes(k); }
function addTrait(p,k,silent){
  if(!p.acqTraits) p.acqTraits=[];
  if(p.acqTraits.includes(k)) return false;
  // a new trait can cancel its opposite
  const opposites={confident:'anxious',anxious:'confident',optimist:'pessimist',pessimist:'optimist',brave:'fearful',fearful:'brave',handsome:'plain',plain:'handsome',robust:'frail',frail:'robust',genius:'slow_learner',slow_learner:'genius'};
  if(opposites[k] && p.acqTraits.includes(opposites[k])) p.acqTraits=p.acqTraits.filter(x=>x!==opposites[k]);
  p.acqTraits.push(k);
  const t=ACQ(k);
  if(!silent && t) log(`${p.first} ${t.good?'developed a wonderful trait':'picked up a difficult trait'}: ${t.l}.`, t.good?'good':'muted');
  return true;
}
function removeTrait(p,k){ if(p.acqTraits) p.acqTraits=p.acqTraits.filter(x=>x!==k); }

