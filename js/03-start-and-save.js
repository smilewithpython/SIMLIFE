"use strict";
/* Threadbare · split module: 03-start-and-save.js  (lines 927–1125 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   START / CHARACTER CREATION
   ============================================================ */
function bootScreen(){
  const saved = load();
  root.innerHTML = `
  <div class="scrim center">
    <div class="cmodal" style="text-align:center">
      <div class="big-emoji">🧵</div>
      <h2>Threadbare</h2>
      <p>One life, then the next. Live it, lose it, and pick up the thread through your children — and theirs.</p>
      ${saved?`<button class="btn gold" id="cont">Continue — ${saved.cur? '“'+findP(saved,saved.cur).first+'”':''}</button>`:''}
      <button class="btn ${saved?'ghost':'gold'}" id="fresh">Begin a New Bloodline</button>
    </div>
  </div>`;
  if(saved) $('#cont').onclick=()=>{ G=saved; ensureIdc(); migrate(); render(); root.innerHTML=''; };
  $('#fresh').onclick=()=>{ if(saved && !confirm('Start over? Your current bloodline will be lost.'))return; wipe(); creator(); };
}
function ensureIdc(){ if(!G.idc){ let m=0; G.people.forEach(p=>m=Math.max(m,p.id)); G.idc=m; } }
function migrate(){
  // backfill fields added in later versions so old saves keep working
  if(!G.hometown) G.hometown='Unknown';
  if(!G.world) G.world=[];
  if(!G.vault) G.vault=[];
  if(!G.subBossesSeen) G.subBossesSeen=[];
  if(!G.subBossesDefeated) G.subBossesDefeated=[];
  if(G.awareness==null) G.awareness=0;
  if(G.sycophant==null) G.sycophant=0;
  if(!G.country) G.country=(G.hometown||'').split(', ')[1]||null;
  G.people.forEach(p=>{
    if(!p.portfolio) p.portfolio={low:0,med:0,high:0};
    if(!p.businesses) p.businesses=[];
    if(!p.assets) p.assets=[];
    if(!p.pets) p.pets=[];
    if(!p.record) p.record=[];
    if(!p.conditions) p.conditions=[];
    if(!p.seeds) p.seeds=[];
    if(!p.flags) p.flags={};
    if(!p.seenEvents) p.seenEvents=[];
    if(!p.clubs) p.clubs=[];
    if(!p.partnerHistory) p.partnerHistory=[];
    if(p.autonomous==null) p.autonomous=false;
    if(p.orientation==null) p.orientation=null;
    if(p.lifeSentence==null) p.lifeSentence=false;
    if(p.citizenship==null) p.citizenship=(G.country||null);
    if(p.ruler==null) p.ruler=null;
    if(p.securityLevel==null) p.securityLevel=0;
    if(p.escapeAttempts==null) p.escapeAttempts=0;
    if(!p.powers) p.powers=[];
    if(p.powersGained==null) p.powersGained=0;
    if(p.nemesis===undefined) p.nemesis=null;
    if(p.sidekick===undefined) p.sidekick=null;
    if(p.heroRep==null) p.heroRep=0;
    if(p.gadgetLevel==null) p.gadgetLevel=0;
    if(p.livesSaved==null) p.livesSaved=0;
    if(p.henchman===undefined) p.henchman=null;
    if(p.minions==null) p.minions=0;
    if(p.territory==null) p.territory=0;
    if(!p.rackets) p.rackets=[];
    if(p.minionPower==null) p.minionPower=0;
    if(p.doomsdayLevel==null) p.doomsdayLevel = hasFlag(p,'hasDoomsday')?1:0;
    if(p.heat==null) p.heat=0;
    if(!p.acqTraits) p.acqTraits=[];
    if(p.prenup==null) p.prenup=false;
    if(p.q==null) p.q=0;
    if(p.greek==null) p.greek=null;
    if(p.collegeSport==null) p.collegeSport=null;
    if(p.fightRecord==null) p.fightRecord=null;
    if(p.champion==null) p.champion=false;
    if(p.stress==null) p.stress=0;
    if(p.socialFollowers==null) p.socialFollowers=0;
    if(p.onSocial==null) p.onSocial=false;
    if(p.pregnant===undefined) p.pregnant=null;
    if(!p.addictions){ p.addictions=[]; if(p.addiction){ const map={drinking:'alcohol',partying:'party_drugs','party drugs':'party_drugs'}; const k=map[p.addiction]||'alcohol'; if(ADDICT(k))p.addictions.push({k,sev:1}); } }
    if(p.insured==null) p.insured=false;
    if(p.inPrison==null) p.inPrison=false;
    if(p.prisonRep==null) p.prisonRep=0;
    if(p.retired==null) p.retired=false;
    if(p.pension==null) p.pension=0;
    if(p.peakSalary==null) p.peakSalary=p.salary||0;
    if(p.careerYears==null) p.careerYears=p.jobYears||0;
    if(p.claimedSS==null) p.claimedSS=false;
    if(p.prisonRole===undefined) p.prisonRole=null;
    if(p.prisonYears==null) p.prisonYears=0;
    if(!p.bday) p.bday={m:rnd(12),day:1+rnd(28)};
    // recover any balance corrupted to NaN/Infinity by older versions, and enforce the cap
    p.money = clampMoney(p.money);
    if(p.salary!=null && !Number.isFinite(Number(p.salary))) p.salary = 0;
    // older businesses (rentals, partnerships) were created without an income field, which used to
    // corrupt money; give them a sensible passive income (~6% of value/yr) so they work and stay safe
    (p.businesses||[]).forEach(b=>{ if(b.value!=null && !Number.isFinite(Number(b.value))) b.value=0; if(b.income==null) b.income=Math.max(0,Math.round((b.value||0)*0.06)); });
    (p.assets||[]).forEach(a=>{ if(a.value!=null && !Number.isFinite(Number(a.value))) a.value=0; });
  });
}
function findP(g,id){ return g.people.find(p=>p.id===id); }
function me(){ return findP(G,G.cur); }

const BIRTHPLACES=[
  ['Seattle','United States'],['Brooklyn','United States'],['Austin','United States'],['New Orleans','United States'],
  ['Chicago','United States'],['Miami','United States'],['Denver','United States'],['Portland','United States'],
  ['Toronto','Canada'],['Vancouver','Canada'],['London','United Kingdom'],['Manchester','United Kingdom'],
  ['Dublin','Ireland'],['Sydney','Australia'],['Melbourne','Australia'],['Auckland','New Zealand'],
  ['Cape Town','South Africa'],['Lagos','Nigeria'],['Nairobi','Kenya'],['Mumbai','India'],
  ['Tokyo','Japan'],['Seoul','South Korea'],['Berlin','Germany'],['Paris','France'],
  ['Barcelona','Spain'],['Rome','Italy'],['São Paulo','Brazil'],['Mexico City','Mexico'],
  ['Stockholm','Sweden'],['Copenhagen','Denmark'],['Amsterdam','Netherlands'],['Reykjavík','Iceland'],
];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function makeBirthday(){ const m=rnd(12); const day=1+rnd([31,28,31,30,31,30,31,31,30,31,30,31][m]); return {m,day}; }

function creator(){
  let sex=makeSex();
  let pend;
  const draw=()=>{
    const fn = newFirst(sex), ln=pick(LAST);
    const t1=pick(TRAITS), t2=pick(TRAITS.filter(t=>t.k!==t1.k));
    const place=pick(BIRTHPLACES);
    const origin = pick([
      {l:'to a fisherman and a nurse, in a house that always smelled of salt.',m:2000},
      {l:'third of four kids, in a loud apartment above a laundromat.',m:600},
      {l:'on a quiet farm at the edge of the county.',m:1200},
      {l:'to a single mother who worked two jobs and never complained.',m:200},
      {l:'into old money, big rooms, and colder silences.',m:90000},
      {l:'backstage at a theatre, during a storm, two weeks early.',m:4000},
      {l:'in the back of a taxi that didn\'t make it to the hospital.',m:900},
      {l:'to immigrant parents chasing a better life.',m:1500},
    ]);
    pend={fn,ln,t1,t2,origin,place,bday:makeBirthday()};
    paint();
  };
  const paint=()=>{
    const sexLab = sex==='m'?'♂ Boy':sex==='f'?'♀ Girl':'⬡ Child';
    const [city,country]=pend.place;
    root.innerHTML=`
    <div class="scrim center">
      <div class="cmodal">
        <div style="font-size:11px;color:var(--gold);font-variant:small-caps;letter-spacing:2px;margin-bottom:8px">A new thread begins</div>
        <p style="font-size:15px;line-height:1.6;margin-bottom:14px">On a ${pick(['cold','bright','grey','rain-soaked','ordinary','restless'])} ${MONTHS[pend.bday.m]} morning in <b>${city}, ${country}</b>, a child was born ${pend.origin.l}</p>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input class="txt" id="ef" value="${pend.fn}" placeholder="First name" style="margin-top:0">
          <input class="txt" id="el" value="${pend.ln}" placeholder="Last name" style="margin-top:0">
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input class="txt" id="ecity" value="${city}" placeholder="City" style="margin-top:0">
          <input class="txt" id="ecountry" value="${country}" placeholder="Country" style="margin-top:0">
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <span class="page-flag" style="background:var(--panel-2);padding:6px 11px;border-radius:20px">${pend.t1.e} ${pend.t1.l}</span>
          <span class="page-flag" style="background:var(--panel-2);padding:6px 11px;border-radius:20px">${pend.t2.e} ${pend.t2.l}</span>
          <span class="page-flag" style="background:var(--panel-2);padding:6px 11px;border-radius:20px">🎂 ${MONTHS[pend.bday.m]} ${pend.bday.day}</span>
          <span class="page-flag" style="background:var(--panel-2);padding:6px 11px;border-radius:20px">${sexLab}</span>
        </div>
        <p class="muted" style="color:var(--ink-faint);font-style:italic;margin-bottom:12px">Family standing: ${money(pend.origin.m)}</p>
        <div style="display:flex;gap:8px">
          <button class="btn ghost" id="reroll" style="margin-top:0">↻ Reroll</button>
          <button class="btn ghost" id="place" style="margin-top:0">🎲 Random city</button>
          <button class="btn ghost" id="sx" style="margin-top:0">${sexLab}</button>
        </div>
        <button class="btn gold" id="go" style="margin-top:10px">Live this life →</button>
      </div>
    </div>`;
    $('#ef').oninput=e=>pend.fn=e.target.value;
    $('#el').oninput=e=>pend.ln=e.target.value;
    $('#ecity').oninput=e=>{ pend.place=[e.target.value, pend.place[1]]; };
    $('#ecountry').oninput=e=>{ pend.place=[pend.place[0], e.target.value]; };
    $('#reroll').onclick=draw;
    $('#place').onclick=()=>{ pend.place=pick(BIRTHPLACES); paint(); };
    $('#sx').onclick=()=>{ sex = sex==='m'?'f':sex==='f'?'n':'m'; pend.fn=newFirst(sex); paint(); };
    $('#go').onclick=()=>{ pend.fn=(pend.fn||'').trim()||newFirst(sex); pend.ln=(pend.ln||'').trim()||pick(LAST);
      pend.place=[ (pend.place[0]||'').trim()||'Seattle', (pend.place[1]||'').trim()||'United States' ];
      startLife(pend,sex); };
  };
  draw();
}

function startLife(pend,sex){
  const dadLast = pend.ln;
  const dad = {name:newFirst('m')+' '+dadLast, kind:'Father', sex:'m', bond:60+rnd(30), alive:true, id:-1};
  const mom = {name:newFirst('f')+' '+pick(LAST), kind:'Mother', sex:'f', bond:65+rnd(30), alive:true, id:-2};
  const sibCount = rnd(3);
  const sibs=[]; for(let i=0;i<sibCount;i++){ const ss=makeSex(); sibs.push({name:newFirst(ss)+' '+dadLast, kind:ss==='m'?'Brother':ss==='f'?'Sister':'Sibling', sex:ss, bond:40+rnd(40), alive:true, id:-(10+i)}); }

  const [city,country]=pend.place;
  G = { lineage:pend.ln, gen:1, year:1995+rnd(20), idc:1, cur:1, people:[], hometown:`${city}, ${country}`, country, world:[] };
  const p = blankPerson({
    id:1, first:pend.fn, last:pend.ln, sex, gen:1, born:G.year,
    traits:[pend.t1.k,pend.t2.k], money:0, rels:[dad,mom,...sibs], parentIds:[-1,-2]
  });
  p.birthplace=`${city}, ${country}`;
  p.bday=pend.bday;
  p._familyMoney = pend.origin.m;
  G.people.push(p);
  log(`${pend.fn} ${pend.ln} was born on ${MONTHS[pend.bday.m]} ${pend.bday.day} in ${city}, ${country} — ${pend.origin.l}`,'birth');
  log(`${capFirst(pend.t1.l)} and ${pend.t2.l.toLowerCase()} from the very start.`,'muted');
  save(); render(); root.innerHTML='';
}
function capFirst(s){ return s.charAt(0).toUpperCase()+s.slice(1); }


