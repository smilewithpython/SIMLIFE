"use strict";
/* Threadbare · content module: 36-relationship-core.js
   ============================================================
   RELATIONSHIP SYSTEM CORE  (see RELATIONSHIPS_SYSTEM.md)
   Parts 2 + 4: bond states, decay, damage/repair, shared interests, the
   support-energy budget, and the once-a-year per-relationship processing.

   DESIGN / SAFETY NOTES
   - Purely additive to the person + rel objects. New per-rel fields are created
     lazily (relMeta) so old saves keep working without a migration; module 03's
     migrate() also backfills the person-level fields.
   - The yearly processing entry point is relYearProcess(p), which the existing
     relTick(p) (module 18) calls — we don't touch the heartbeat. A guard makes
     the call idempotent per year.
   - Bond stays the same 0..100 number the rest of the game reads; we only add
     a *named state* on top and structured decay/damage/repair around it.
   ============================================================ */

/* ---------------- Bond states (Part 2) ---------------- */
const BOND_STATES = [
  {min:90, name:'Unbreakable',       col:'--sage'},
  {min:75, name:'Deeply close',      col:'--sage'},
  {min:55, name:'Close',             col:'--sage'},
  {min:40, name:'Friendly',          col:'--gold'},
  {min:25, name:'Distant',          col:'--gold'},
  {min:10, name:'Strained',          col:'--blood'},
  {min:1,  name:'Estranged',         col:'--blood'},
  {min:0,  name:'Cut off',           col:'--blood'},
];
function bondState(bond){
  const b=Math.round(bond||0);
  for(const s of BOND_STATES){ if(b>=s.min) return s; }
  return BOND_STATES[BOND_STATES.length-1];
}
function bondStateName(bond){ return bondState(bond).name; }
function bondStateColor(bond){ return bondState(bond).col; }

/* ---------------- Per-rel metadata (lazy, save-safe) ---------------- */
// Stores decay/damage/repair bookkeeping without bloating every rel up front.
function relMeta(r){
  if(!r._m) r._m = {
    lastInteract: -999,  // year of last meaningful interaction (never, initially)
    floor: 0,            // permanent minimum the bond can't drop below growth-wise after repair
    cap: 100,            // permanent maximum after an unforgivable act
    damaged: null,       // {kind, year} the active damage needing a *specific* repair
    repaired: false,     // bondWasRepaired flag (Part 2 — earned/rebuilt trust)
    lastActs: [],        // last 3 activity ids, for flavor variety + cooldown
    standing: {},        // standing/passive actions in effect: {call:true, ...}
  };
  return r._m;
}

/* ---------------- Decay rates (Part 2) ---------------- */
// returns annual decay points for a given rel, before modifiers
function decayRate(p, r){
  const kid = r.id!=null ? findP(G, r.id) : null;
  switch(true){
    case r.kind==='Spouse':
    case r.kind==='Partner': {
      // long-distance if flagged on the rel
      return r._longDistance ? 8 : 3;
    }
    case r.kind==='Child': {
      const adult = kid ? kid.age>=18 : false;
      return adult ? 5 : 2;
    }
    case r.kind==='Mother':
    case r.kind==='Father':
    case /-in-law/.test(r.kind):
      return 4;
    case /Brother|Sister|Sibling/.test(r.kind):
      return 6;
    case r.kind==='Friend': {
      // close friends decay slower than casual ones
      return r.bond>=55 ? 8: 12;
    }
    default: return 6;
  }
}

/* ---------------- Shared interests (Part 4) ---------------- */
const INTERESTS = [
  {k:'sports',   l:'Sports & outdoors', e:'⚽'},
  {k:'music',    l:'Music',             e:'🎵'},
  {k:'food',     l:'Food & cooking',    e:'🍳'},
  {k:'travel',   l:'Travel & adventure',e:'✈️'},
  {k:'reading',  l:'Reading & ideas',   e:'📚'},
  {k:'games',    l:'Games',             e:'🎲'},
  {k:'art',      l:'Art & creativity',  e:'🎨'},
  {k:'faith',    l:'Faith & spirit',    e:'🕯'},
  {k:'fitness',  l:'Fitness',           e:'💪'},
  {k:'film',     l:'Film & stories',    e:'🎬'},
  {k:'work',     l:'Work overlap',      e:'💼'},
];
function interestMeta(k){ return INTERESTS.find(i=>i.k===k); }
// assign 2 interests at birth/seed; safe to call repeatedly (no-op if set)
function ensureInterests(person){
  if(!person) return [];
  if(!person.interests){
    const pool=[...INTERESTS];
    const picks=[];
    for(let i=0;i<2 && pool.length;i++){ const idx=rnd(pool.length); picks.push(pool[idx].k); pool.splice(idx,1); }
    person.interests=picks;
  }
  return person.interests;
}
// interests stored on a rel: prefer the linked person's, else lazily seed onto the rel itself
function relInterests(r){
  const person = r.id!=null ? findP(G, r.id) : null;
  if(person) return ensureInterests(person);
  if(!r._interests){
    const pool=[...INTERESTS]; const picks=[];
    for(let i=0;i<2 && pool.length;i++){ const idx=rnd(pool.length); picks.push(pool[idx].k); pool.splice(idx,1); }
    r._interests=picks;
  }
  return r._interests;
}
function sharedInterests(p, r){
  const a=ensureInterests(p)||[], b=relInterests(r)||[];
  return a.filter(k=>b.includes(k));
}
// child inherits 1 interest from each parent (50% each) + 1 random — used by makeChild hook
function seedChildInterests(child, parent, mate){
  if(!child) return;
  const set=new Set();
  (ensureInterests(parent)||[]).forEach(k=>{ if(chance(50)) set.add(k); });
  if(mate){ (mate.interests||relInterests(mate)||[]).forEach(k=>{ if(chance(50)) set.add(k); }); }
  // top up to at least 2, with at least 1 random
  const pool=INTERESTS.map(i=>i.k).filter(k=>!set.has(k));
  set.add(pick(pool));
  while(set.size<2 && pool.length){ const k=pick(pool); set.add(k); }
  child.interests=[...set].slice(0,3);
}

/* ---------------- Support energy budget (Part 2 impl note) ---------------- */
// "Being everyone's support system is exhausting." 2 full-value support actions/year.
function supportEnergyLeft(p){
  if(p._supportYear!==G.year){ p._supportYear=G.year; p._supportUsed=0; }
  return Math.max(0, 2- (p._supportUsed||0));
}
function spendSupportEnergy(p){
  if(p._supportYear!==G.year){ p._supportYear=G.year; p._supportUsed=0; }
  p._supportUsed=(p._supportUsed||0)+1;
}
// bond return multiplier for a support action given remaining energy
function supportMultiplier(p){ return supportEnergyLeft(p)>0 ? 1 : 0.4; }

/* ---------------- Applying a bond change (respects floor/cap) ---------------- */
function applyBond(r, delta){
  const m=relMeta(r);
  let next = (r.bond||0) + delta;
  // cap from unforgivable acts; floor from repaired bonds (can't be knocked below once rebuilt)
  next = Math.min(next, m.cap);
  next = clamp(next);
  r.bond = next;
  return r.bond;
}
// mark that a meaningful interaction happened this year (stops decay this cycle, varies flavor)
function markInteract(r, actId){
  const m=relMeta(r);
  m.lastInteract = G.year;
  if(actId){ m.lastActs.unshift(actId); m.lastActs=m.lastActs.slice(0,3); }
}
function didRecently(r, actId){ return relMeta(r).lastActs.includes(actId); }

/* ---------------- Bond DAMAGE events (Part 2) ---------------- */
const BOND_DAMAGE = {
  missedMilestone:   {amt:15, kind:'missedMilestone',  repair:'acknowledge'},
  affair:            {amt:50, kind:'affair',           repair:'counsel'},
  brokenPromise:     {amt:20, kind:'brokenPromise',    repair:'repay'},
  publicHumiliation: {amt:25, kind:'publicHumiliation',repair:'apology'},
  careerOverThem:    {amt:10, kind:'careerOverThem',   repair:'makeItUp'},
  betrayedConfidence:{amt:20, kind:'betrayedConfidence',repair:'apology'},
  unforgivable:      {amt:30, kind:'unforgivable',     repair:'none', cap:70},
  absentInCrisis:    {amt:20, kind:'absentInCrisis',   repair:'makeItUp'},
  recordPublic:      {amt:10, kind:'recordPublic',     repair:'time'},
};
// inflict structured damage; sets the active 'damaged' marker that blocks generic repair
function damageBond(r, key, opts={}){
  const d=BOND_DAMAGE[key]; if(!d) return;
  const m=relMeta(r);
  const amt = opts.amt!=null ? opts.amt : d.amt;
  // repaired bonds are harder to break a second time (Part 2)
  const eff = m.repaired ? Math.round(amt*0.7) : amt;
  applyBond(r, -eff);
  if(d.cap!=null) m.cap = Math.min(m.cap, d.cap);
  if(d.repair!=='none') m.damaged = {kind:d.kind, year:G.year};
  return eff;
}
// repair the active damage with a matching action; sets bondWasRepaired
function repairBond(r, gain){
  const m=relMeta(r);
  applyBond(r, gain!=null?gain:18);
  if(m.damaged){ m.damaged=null; m.repaired=true; }
  else m.repaired = m.repaired || (r.bond>=55); // a tended bond counts as resilient too
  return r.bond;
}
function hasActiveDamage(r, kind){ const d=relMeta(r).damaged; return d && (!kind || d.kind===kind); }

/* ---------------- The yearly per-relationship pass (Part 2) ---------------- */
// called once per year from relTick (module 18). Idempotent per year via _relYear.
function relYearProcess(p){
  if(!p || !p.rels) return;
  if(p._relYear===G.year) return;   // already processed this year
  p._relYear=G.year;

  // reset the support-energy budget for the new year
  p._supportYear=G.year; p._supportUsed=0;

  // busy-career neglect modifier: high stress or a demanding stage this year
  const busy = (p.stress>60) || atDemandingCareerStage(p);
  const famous = (p.stats.fame||0) > 70;

  p.rels.forEach(r=>{
    if(!r.alive) return;
    const m=relMeta(r);
    // did a meaningful interaction happen this year? if so, no decay this cycle.
    const tended = (m.lastInteract === G.year);
    if(!tended){
      let dec = decayRate(p, r);
      if(busy) dec += 2;                       // busy-career neglect
      if(famous && !/Spouse|Partner/.test(r.kind)) dec -= 2; // ambient celebrity warmth
      // standing passive actions (e.g. regular calls to a parent) blunt decay
      if(m.standing.call) dec = Math.max(0, dec-5);
      if(dec>0) applyBond(r, -dec);
    }
    // a repaired bond that's also being neglected loses its "resilient" warmth slowly? No —
    // repaired status is permanent (they survived it once). We keep it.
  });
}

// Is the player's career in a demanding stage this year? (busy modifier)
function atDemandingCareerStage(p){
  if(!p || p.job==='none') return false;
  if(p.stress>60) return true;
  // staged/ladder peak years and fight-career active years read as demanding
  if(p.job==='ufc'||p.job==='villain'||p.job==='superhero'||p.job==='crimelord') return true;
  if(p._rung!=null && typeof CAREER==='function'){ const c=CAREER(p.job); if(c&&c.ladder && p._rung>=c.ladder.length-2) return true; }
  return false;
}

/* ---------------- Flavor: a line that reflects repaired/standing warmth ---------------- */
function relWarmthNote(r){
  const m=relMeta(r);
  if(m.repaired && r.bond>=55) return "You've been through worse than this together.";
  if(m.cap<100) return "There's a ceiling on this now — but what's left is real.";
  return null;
}

/* ---------------- Obituary support (Part 6) — consumed by module 17 ---------------- */
function relationshipObituary(p){
  const rels=(p.rels||[]);
  const close = rels.filter(r=>r.bond>=75).length;
  const estranged = rels.filter(r=>r.alive && r.bond>0 && r.bond<=24).length;
  const repaired = rels.filter(r=>r._m && r._m.repaired).length;
  const spouse = rels.find(r=>r.kind==='Spouse');
  const exSpouses = (p.partnerHistory||[]).filter(h=>h.status==='Ex-spouse').length;
  const longFriend = rels.find(r=>r.kind==='Friend' && r._m && (G.year - (r._m.firstYear|| (G.year-0))) >= 30);
  const lines=[];
  if(close>0) lines.push(`${close} deep and lasting relationship${close===1?'':'s'}`);
  if(spouse){
    const m=relMeta(spouse);
    if(m.repaired) lines.push('a marriage that survived a difficult period and was stronger for it');
    else if(spouse.bond>=75) lines.push('a long and loving marriage');
    else if(spouse.bond<40) lines.push('a marriage that had quietly cooled');
  } else if(exSpouses>0){
    lines.push(`${exSpouses} marriage${exSpouses===1?'':'s'} that did not last`);
  }
  if(estranged>0) lines.push(`${estranged} estrangement${estranged===1?'':'s'} never fully resolved`);
  if(repaired>0 && !(spouse&&relMeta(spouse).repaired)) lines.push('bonds broken and rebuilt');
  return lines;
}

/* ---------------- expose interest-seeding to makeChild (module 18) ---------------- */
// module 18's makeChild can call window-level seedChildInterests; we also patch it
// defensively here so a newly born child always gets interests even if 18 wasn't updated.
if(typeof makeChild==='function' && !makeChild._interestsWrapped){
  const _baseMakeChild = makeChild;
  makeChild = function(p, opts={}){
    const child=_baseMakeChild(p, opts);
    try{
      const mate=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
      seedChildInterests(child, p, mate);
      // tag the new child's rel entry with first-seen year for the obituary's long-friend math
      const rc=p.rels.find(r=>r.id===child.id); if(rc) relMeta(rc).firstYear=G.year;
    }catch(e){}
    return child;
  };
  makeChild._interestsWrapped = true;
}
