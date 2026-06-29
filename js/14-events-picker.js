"use strict";
/* Threadbare · split module: 14-events-picker.js
   ============================================================
   FOUR-TRACK EVENT SYSTEM  (see EVENT_SYSTEM_ARCHITECTURE.md)
   The old design put ~190 base events + every arc/career chain in ONE
   weighted pool with one draw per quarter, so arcs almost never won the
   draw. This splits events into four independent tracks that each draw on
   their own, plus a guarantee so arc openers can't be starved out:

     • Arc track    — ch_* chain events (Parts 1–3) + guaranteed openers
     • Career track — cc_* chain events (Part 4); only while employed
     • Life track   — relationships, family, coming-of-age (base bank)
     • World track  — encounters, powers, hero/villain — every other quarter

   A pool only ever holds events whose when(p) is currently true (flag-based
   entry), so each pool is small and openers have real probability.
   At most FOREGROUND_MAX decisions are shown per quarter; background events
   fire for free as log lines with no decision.
   ============================================================ */

// ---- tunables (safe to adjust to taste) ----
const TRACK_P = { arc:0.50, career:0.50, life:0.45, world:0.55 }; // per-quarter fire chance when that track has eligible events
const FOREGROUND_MAX = 2;     // max decisions shown in a single quarter
const WORLD_EVERY    = 2;     // world track is eligible once every N quarters
const ARC_WEIGHT_BOOST = 9;   // extra weight an opener gains as its window closes (debt pressure)
const BG_QUARTER_CHANCE = 28; // % chance to surface one background flavor line per quarter

// base-bank events that read as "world" (encounters / powers / hero-villain);
// every other base event defaults to the Life track.
const WORLD_IDS = new Set(['villain_origin','hero_origin','hero_nemesis','hero_showdown','hero_dilemma','hero_recruit','hero_unmask','hero_disaster','hero_corruption','hero_sidekick_peril','hero_burnout','villain_scheme','villain_henchman','villain_crew_offer','villain_mutiny','villain_doomsday_test','villain_betrayal','villain_hero_offer','villain_takeover','club_night','lottery_lightning','stranger_inheritance','family_movein','bar_confront','mugging','talent_scout','sports_recruiter','academic_recruit','street_musician','fortune_teller','free_sample','pickup_charm','street_game','lost_tourist','wallet_found','protest_march','high_roller','door_to_door','open_audition','reunion_invite','wrong_place','inheritance_stranger','street_artist','gym_challenge','whirlwind_trip','viral_blame','street_preacher','power_accident','power_mentor','power_artifact']);

// arc openers → their valid age window. The guarantee only ever fires an
// opener while its own when(p) is also true, so a window can't force an
// event whose other conditions (dead parent, etc.) aren't met.
const ARC_OPENERS = {
  ch_oldfriend_b1:[24,27], ch_rival_b1:[22,28], ch_mentor_b1:[22,27],
  ch_hustle_b1:[27,32],    ch_fracture_b1:[35,50], ch_secret_b1:[28,34],
  ch_inherit_b1:[40,56],
};

// ---- track classification (computed once, cached on the event) ----
function trackOf(ev){
  if(ev._track) return ev._track;
  let t;
  if(ev.track) t=ev.track;                       // explicit override wins
  else { const id=ev.id||'';
    if(id.indexOf('cc_')===0)      t='career';   // Part 4 career chains
    else if(id.indexOf('ch_')===0) t='arc';      // Parts 1–3 life-arc chains
    else if(WORLD_IDS.has(id))     t='world';
    else                           t='life';
  }
  ev._track=t; return t;
}

// ---- eligibility (same contract as before) ----
function eventEligible(p, ev){
  if(ev.once && p.seenEvents.includes(ev.id)) return false;
  try{ return ev.when(p); }catch(e){ return false; }
}

// the eligible pool for one track (lean by construction)
function trackPool(p, track){
  return CHOICE_EVENTS.filter(ev=> trackOf(ev)===track && eventEligible(p,ev));
}

// weighted pick; arc openers get a debt boost the deeper they are into their window
function weightedPick(p, pool){
  if(!pool.length) return null;
  const w=[]; let total=0;
  for(const ev of pool){
    let wt=ev.weight||1;
    const win=ARC_OPENERS[ev.id];
    if(win){ const prog=clamp((p.age-win[0])/Math.max(1,(win[1]-win[0])),0,1); wt += prog*ARC_WEIGHT_BOOST; }
    w.push(wt); total+=wt;
  }
  let r=Math.random()*total;
  for(let i=0;i<pool.length;i++){ r-=w[i]; if(r<=0) return pool[i]; }
  return pool[pool.length-1];
}

// an arc opener past 70% of its window that still hasn't fired → guaranteed this quarter
function forcedArcOpener(p){
  for(const id in ARC_OPENERS){
    if(p.seenEvents.includes(id)) continue;
    const win=ARC_OPENERS[id];
    if(p.age < win[0] + 0.7*(win[1]-win[0])) continue;   // not yet at the guarantee threshold
    const ev=CHOICE_EVENTS.find(e=>e.id===id);
    if(ev && eventEligible(p,ev)) return ev;              // eligible now → force it
  }
  return null;
}

// ---- the per-quarter resolver: returns up to FOREGROUND_MAX events to show ----
function rollQuarterEvents(p){
  if(!p || !p.alive || p.inPrison || p.age<2) return [];
  p._qtick = (p._qtick||0) + 1;
  const out=[];

  // ARC TRACK — guarantee first, otherwise a (debt-boosted) weighted draw
  const forced = forcedArcOpener(p);
  if(forced) out.push(forced);
  else {
    const pool=trackPool(p,'arc');
    if(pool.length && chance(TRACK_P.arc*100)){ const e=weightedPick(p,pool); if(e) out.push(e); }
  }

  // CAREER TRACK — only while employed
  if(p.job && p.job!=='none'){
    const pool=trackPool(p,'career');
    if(pool.length && chance(TRACK_P.career*100)){ const e=weightedPick(p,pool); if(e) out.push(e); }
  }

  // LIFE TRACK
  { const pool=trackPool(p,'life');
    if(pool.length && chance(TRACK_P.life*100)){ const e=weightedPick(p,pool); if(e) out.push(e); } }

  // WORLD TRACK — every other quarter, lower-frequency by design
  if(p._qtick % WORLD_EVERY === 0){
    const pool=trackPool(p,'world');
    if(pool.length && chance(TRACK_P.world*100)){ const e=weightedPick(p,pool); if(e) out.push(e); }
  }

  // dedupe + cap to FOREGROUND_MAX (arc/career keep priority since they're pushed first)
  const seen=new Set(); const res=[];
  for(const e of out){
    if(e && !seen.has(e.id)){ seen.add(e.id); res.push(e); }
    if(res.length>=FOREGROUND_MAX) break;
  }
  return res;
}

// back-compat: a single-event picker for any legacy caller
function rollInteractiveEvent(p){ const evs=rollQuarterEvents(p); return evs.length?evs[0]:null; }

// ---- show a list of events one after another, then call done() ----
function showEventQueue(p, evs, done){
  let i=0;
  (function next(){
    if(!p || !p.alive || i>=evs.length){ if(done) done(); return; }
    const ev=evs[i++];
    if(!eventEligible(p,ev)){ next(); return; }   // a prior choice this quarter may have changed state
    render();
    showChoiceEvent(p, ev, next, {quarter:true});
  })();
}

/* ============================================================
   BACKGROUND EVENTS — free, log-only flavor (no decision).
   They make the world feel dense without spending a foreground slot.
   ============================================================ */
function bgRel(p, re){ const a=(p.rels||[]).filter(r=>r.alive && re.test(r.kind)); return a.length? a[Math.floor(Math.random()*a.length)] : null; }
function bgName(r){ return r? r.name.split(' ')[0] : ''; }

const BACKGROUND_EVENTS = [
  { when:p=>!!bgRel(p,/Spouse|Partner/) , line:p=>{ const r=bgRel(p,/Spouse|Partner/); return r.bond>62 ? `${bgName(r)} left ${p.first} a note that made the whole day lighter.` : `${p.first} and ${bgName(r)} passed like roommates this season — busy, distracted.`; } },
  { when:p=>!!bgRel(p,/Child/), line:p=>{ const r=bgRel(p,/Child/); return `${bgName(r)} is growing up faster than ${p.first} is ready for.`; } },
  { when:p=>!!bgRel(p,/Brother|Sister|Sibling/), line:p=>{ const r=bgRel(p,/Brother|Sister|Sibling/); return `${bgName(r)} sent a photo from a life lived a few time zones away.`; } },
  { when:p=>{ const r=bgRel(p,/Mother|Father/); return r && p.age<48; }, line:p=>{ const r=bgRel(p,/Mother|Father/); return `${bgName(r)} called to check in, the way they always have.`; } },
  { when:p=>{ const r=bgRel(p,/Friend/); return r && r.bond<48; }, line:p=>{ const r=bgRel(p,/Friend/); return `${bgName(r)} hasn't been in touch in a while. The thread frays a little.`; } },
  { when:p=>(p.pets||[]).some(x=>x.alive), line:p=>{ const pt=p.pets.filter(x=>x.alive)[0]; return `${pt.name||'The dog'} spent the whole afternoon following a sunbeam across the floor.`; } },
  { when:p=>(p.businesses||[]).length>0, line:p=>{ const b=p.businesses[0]; return `Word from ${b.name}: a steady, unremarkable quarter. The good kind.`; } },
  { when:p=>p.portfolio && ((p.portfolio.low||0)+(p.portfolio.med||0)+(p.portfolio.high||0))>5000, line:p=>chance(50)? `${p.first}'s investments drifted up a little this quarter.` : `${p.first}'s portfolio dipped, then mostly recovered. Markets do that.` },
  { when:p=>p.onSocial && (p.socialFollowers||0)>1000, line:p=>`${p.first}'s following ticked up by a few hundred while they weren't looking.` },
  { when:p=>(p.stats.fame||0)>45, line:p=>`A tabloid ran a small, mostly-wrong blurb about ${p.first} this week.` },
  { when:p=>p.money>500000000, line:p=>`${p.first}'s accountant called, just to confirm that everything is fine. It is very, very fine.` },
  { when:p=>p.age>58, line:p=>`${p.first}'s knees announced the change of season a day before the calendar did.` },
  { when:p=>(p.addictions||[]).length>0, line:p=>`${p.first} got through the week without slipping. Quiet weeks count too.`, cls:'good' },
  { when:p=>typeof G!=='undefined' && G && !G.homelanderDefeated, line:p=>`📰 ${typeof anyHomelanderBlurb==='function'?anyHomelanderBlurb():'The news cycle churned on, loud and far away.'}` },
];

function fireBackgroundEvents(p){
  if(!p || !p.alive) return;
  if(!chance(BG_QUARTER_CHANCE)) return;
  const pool = BACKGROUND_EVENTS.filter(b=>{ try{ return b.when(p); }catch(e){ return false; } });
  if(!pool.length) return;
  const b = pool[Math.floor(Math.random()*pool.length)];
  try{ const line=b.line(p); if(line) log(line, b.cls||'muted'); }catch(e){}
}
