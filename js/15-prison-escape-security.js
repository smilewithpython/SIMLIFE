"use strict";
/* Threadbare · split module: 15-prison-escape-security.js  (lines 4668–4869 of the original single-file build; see CODEBASE_STRUCTURE.md) */
// ----- crime-boss / supervillain escape & security escalation -----
const SECURITY_NAMES=['County Jail','Maximum Security','the Vault (super-prison)'];
function canAttemptEscape(p){
  // only organized crime & supervillains get the underworld-escape treatment
  const isBoss = p.record && p.record.length && (p._wasCrime || p.job==='crimelord' || p.job==='villain');
  const wasBoss = p._wasCrime; // set when they were jailed from a crime career
  if(!(isBoss||wasBoss)) return false;
  if(p.securityLevel>=2) return chance(30); // the Vault: escape is very hard but villains can still try
  return true;
}
function showEscapeChoice(p, done){
  const lvl=p.securityLevel||0;
  const villain = p._villainJailed;
  const sec=SECURITY_NAMES[lvl];
  const opts=[];
  // option set depends on security level and whether they have powers
  if(lvl<2){
    // tiered bribes — the more you offer, the better your odds. Higher security demands more.
    const secMult=lvl+1;
    const tiers=[
      {k:'bribe_s', l:'Bribe a guard — small', amt:Math.round(10000*secMult)},
      {k:'bribe_m', l:'Bribe a guard — medium', amt:Math.round(150000*secMult)},
      {k:'bribe_l', l:'Bribe a guard — large', amt:Math.round(1500000*secMult)},
    ];
    tiers.forEach(t=>{
      const afford = p.money>=t.amt;
      opts.push({l:t.l, sub:`${money(t.amt)}${afford?'':' · can\'t afford'} · bigger = better odds`, kind:t.k, amt:t.amt, disabled:!afford});
    });
    opts.push({l:villain?'Break out with brute force':'Stage a prison break', sub:'violent, can fail hard', kind:'force'});
  } else {
    opts.push({l:'Attempt the impossible escape', sub:'the Vault has never been beaten… almost', kind:'vault'});
    // even in the Vault, a colossal bribe can tempt someone
    if(p.money>=10000000) opts.push({l:'Bribe your way out of the Vault', sub:`${money(10000000)} · desperate, long odds`, kind:'bribe_vault', amt:10000000});
  }
  if(p.powers && p.powers.length){
    opts.push({l:`Use your powers (${p.powers[0]})`, sub:'best odds, escalates security', kind:'powers'});
  }
  // a loyal crew on the outside can break the boss out
  if((p.minions||0)>=3){
    opts.push({l:`Have your crew break you out (${p.minions} minions)`, sub:'they storm the prison for the boss', kind:'crew'});
  }
  opts.push({l:'Serve your time', sub:'wait it out', kind:'wait'});

  let html=`<div class="grab"></div>
    <div style="text-align:center;font-size:40px;margin:4px 0">⛓️</div>
    <h3 style="text-align:center">Locked up — ${sec}</h3>
    <p style="padding:4px 22px 14px;color:var(--ink-dim);font-size:14.5px;line-height:1.55;text-align:center">${p.first} is behind bars${p.lifeSentence?' for life':''}. The right move could mean freedom — or a transfer somewhere far worse.</p>`;
  opts.forEach((c,i)=>{ html+=`<button class="opt${c.disabled?' disabled':''}" data-i="${i}"${c.disabled?' disabled style="opacity:.5"':''}><span class="oico">▸</span><span class="otxt">${c.l}<span class="osub">${c.sub}</span></span></button>`; });
  const s=document.createElement('div'); s.className='scrim'; s.innerHTML=`<div class="sheet">${html}</div>`; root.appendChild(s);
  s.querySelectorAll('.opt').forEach(b=>{ b.onclick=()=>{ const c=opts[+b.dataset.i]; if(c.disabled)return; s.remove(); resolveEscape(p,c.kind,c.amt); done(); }; });
}
function escapeFree(p, how){
  p.inPrison=false; p.prisonYears=0; p.lifeSentence=false; p._yearsServed=0;
  p.prisonRep=0; p.prisonRole=null;
  p.securityLevel=0; p.escapeAttempts=0; p._villainJailed=false;
  p.record.push('Escaped custody');
  p.stats.happy=clamp(p.stats.happy+18); p.stats.fame=clamp(p.stats.fame+10);
  log(`${how} ${p.first} is FREE. A fugitive now, but free.`,'big');
}
function escapeFail(p, how){
  p.escapeAttempts=(p.escapeAttempts||0)+1;
  // escalate security on failure
  if(p.securityLevel<2){ p.securityLevel++; log(`${how} ${p.first} was caught and transferred to ${SECURITY_NAMES[p.securityLevel]}. Escape just got harder.`,'bad'); }
  else { log(`${how} The attempt failed. There is no escaping the Vault.`,'bad'); }
  if(!p.lifeSentence) p.prisonYears+=2+rnd(3); // added time
  p.stats.health=clamp(p.stats.health-6);
}
function resolveEscape(p, kind, amt){
  if(kind==='wait'){ log(`${p.first} kept their head down and served the time.`,'muted'); return; }
  const sly = p.traits.includes('sly')?10:0, lucky=p.traits.includes('lucky')?8:0;
  const crew = Math.round((p.minionPower||0)/8); // a capable crew improves any escape
  const lifePenalty = p.lifeSentence?18:0; // hardest crimes are harder to walk away from
  if(kind==='bribe_s' || kind==='bribe_m' || kind==='bribe_l' || kind==='bribe_vault'){
    const cost=amt||50000;
    if(p.money<cost){ log(`${p.first} couldn't raise the ${money(cost)} bribe.`,'muted'); return; }
    p.money-=cost;
    // base odds by tier — a bigger envelope buys a more cooperative guard
    const tierBase = kind==='bribe_s'?38 : kind==='bribe_m'?58 : kind==='bribe_l'?78 : 50;
    if(chance(tierBase+sly+lucky+crew-lifePenalty)) escapeFree(p,'The bribe worked.');
    else { p.money=Math.max(0,p.money); escapeFail(p,'The guard took the money and ratted.'); }
  } else if(kind==='force'){
    if(chance(30+sly+lucky+crew+(p.stats.athletic*0.2)-lifePenalty)) escapeFree(p,'A bloody breakout.'); else escapeFail(p,'The breakout was crushed.');
  } else if(kind==='powers'){
    if(chance(60+lucky+crew-lifePenalty)) escapeFree(p,'Your powers tore the cell apart.'); else escapeFail(p,'Even your powers weren\'t enough this time.');
  } else if(kind==='vault'){
    if(chance(10+lucky+crew+(p.powers.length?18:0))) escapeFree(p,'Against all odds, the Vault was beaten.'); else escapeFail(p,'The Vault held.');
  } else if(kind==='crew'){
    const odds = 25 + (p.minionPower||0)/2 + lucky - lifePenalty - (p.securityLevel||0)*10;
    if(chance(odds)){ escapeFree(p,`${p.first}'s crew stormed the walls and broke them out!`); }
    else { if((p.minions||0)>0){ const lost=1+rnd(2); p.minions=Math.max(0,p.minions-lost); } escapeFail(p,'The raid was repelled and the crew took losses.'); }
  }
}

function showOrientationPicker(p, done){
  const opts=[
    {o:'straight', l:'Into the opposite sex', sub:'heterosexual'},
    {o:'gay',      l:'Into the same sex',     sub:p.sex==='m'?'gay':p.sex==='f'?'lesbian':'homosexual'},
    {o:'bi',       l:'Into both',             sub:'bisexual'},
    {o:'_pnts',    l:'Rather not say',        sub:'leave it to chance'},
  ];
  let html=`<div class="grab"></div>
    <div style="text-align:center;font-size:40px;margin:4px 0">💭</div>
    <h3 style="text-align:center">Coming of age</h3>
    <p style="padding:4px 22px 14px;color:var(--ink-dim);font-size:14.5px;line-height:1.55;text-align:center">${p.first} is figuring out who they are. Who are they drawn to?</p>`;
  opts.forEach((c,i)=>{
    html+=`<button class="opt" data-i="${i}"><span class="oico">▸</span><span class="otxt">${c.l}<span class="osub">${c.sub}</span></span></button>`;
  });
  const s=document.createElement('div'); s.className='scrim';
  s.innerHTML=`<div class="sheet">${html}</div>`;
  root.appendChild(s);
  s.querySelectorAll('.opt').forEach(b=>{
    b.onclick=()=>{
      const c=opts[+b.dataset.i];
      s.remove();
      if(c.o==='_pnts'){ defaultOrientation(p); log(`${p.first} kept it private for now.`,'muted'); }
      else { p.orientation=c.o; const word={straight:'straight',gay:p.sex==='f'?'a lesbian':'gay',bi:'bisexual'}[c.o]; log(`${p.first} understood themselves a little better — ${word}.`,'big'); }
      done();
    };
  });
}
function showChoiceEvent(p, ev, done, opts){
  opts=opts||{};
  if(ev.once && !p.seenEvents.includes(ev.id)) p.seenEvents.push(ev.id);
  const choices = ev.choices.filter(c=>!c.need || c.need(p));
  // if all choices gated out, fall back to ungated set
  const list = choices.length? choices : ev.choices;
  let html=`<div class="grab"></div>
    <div style="text-align:center;font-size:40px;margin:4px 0">${ev.emoji}</div>
    <h3 style="text-align:center">${ev.title}</h3>
    <p style="padding:4px 22px 14px;color:var(--ink-dim);font-size:14.5px;line-height:1.55;text-align:center">${ev.body(p)}</p>`;
  list.forEach((c,i)=>{
    const locked = c.need && !c.need(p);
    html+=`<button class="opt" data-i="${i}" ${locked?'disabled':''}>
      <span class="oico">▸</span>
      <span class="otxt">${c.label}${c.sub?`<span class="osub">${c.sub}</span>`:''}</span></button>`;
  });
  const s=document.createElement('div'); s.className='scrim';
  s.innerHTML=`<div class="sheet">${html}</div>`;
  root.appendChild(s);
  s.querySelectorAll('.opt').forEach(b=>{
    b.onclick=()=>{
      const c=list[+b.dataset.i];
      s.remove();
      const msg = c.effect(p);
      if(msg) log(msg, 'big');
      // CHAINED DECISION: a choice can trigger an immediate follow-up popup
      let next=null;
      if(typeof c.then==='function'){ try{ next=c.then(p); }catch(e){} }
      if(next){ render(); showChoiceEvent(p, next, done, {chained:true}); return; }
      // only run age-banded events when this came from the yearly sim, not a light quarter
      if(!opts.chained && !opts.quarter) lifeEvents(p);
      render();
      if(done) done();
    };
  });
}

// delayed consequences come due
function resolvePending(p){
  if(!p.seeds || !p.seeds.length) return;
  const due = p.seeds.filter(s=>s.dueAge<=p.age);
  p.seeds = p.seeds.filter(s=>s.dueAge>p.age);
  due.forEach(s=>{
    switch(s.kind){
      case 'startup_payoff':
        if(hasFlag(p,'tookRisk')){ const win=chance(45); if(win){ const v=80000+rnd(900000); p.money+=v; p.stats.fame=clamp(p.stats.fame+10); log(`The bet ${p.first} made years ago paid off — ${money(v)}.`,'big'); } else { log(`That startup ${p.first} joined years ago quietly folded. Lesson learned.`,'bad'); } }
        break;
      case 'loan_repay':{
        const amt=s.data.amt||5000;
        if(chance(70)){ p.money+=Math.round(amt*1.1); log(`An old friend repaid ${p.first}'s loan, with interest.`,'good'); }
        else log(`The friend ${p.first} lent money to vanished. The loan's gone.`,'bad');
        break;}
      case 'grounded': log(`${p.first}'s grounding finally ended.`,'muted'); break;
      case 'tough_skin': case 'thick_skin': case 'tough_skin8':
        p.stats.happy=clamp(p.stats.happy+4); log(`The hard times ${p.first} went through left them more resilient.`,'muted'); break;
      case 'affair_fallout':
        if(hasFlag(p,'secretAffair') && chance(45)){ const sp=p.rels.find(r=>r.kind==='Spouse'&&r.alive); if(sp)sp.bond=clamp(sp.bond-30); p.stats.happy=clamp(p.stats.happy-12); log(`${p.first}'s old secret finally surfaced. The fallout is real.`,'bad'); }
        break;
      case 'retaliation':
        if(chance(50)){ p.stats.health=clamp(p.stats.health-15); log(`${p.first} faced retaliation for testifying. A frightening year.`,'bad'); }
        break;
      case 'gang_trouble':
        if(hasFlag(p,'inGang')){
          const r=rnd(100);
          if(r<25){ p.stats.health=clamp(p.stats.health-18); p.record.push('Gang violence'); log(`${p.first} got caught in gang violence and was badly hurt.`,'bad'); }
          else if(r<45){ p.inPrison=true; p.prisonYears=1+rnd(3); p.record.push('Juvenile detention'); log(`${p.first} was arrested for gang activity — time in juvenile detention.`,'bad'); }
          else if(r<60){ const take=2000+rnd(20000); p.money+=take; log(`${p.first} made some fast, dangerous money with the crew — ${money(take)}.`,'bad'); seed(p,2,'gang_trouble'); }
          else { log(`${p.first} drifted away from the gang before things got worse.`,'muted'); clearFlag(p,'inGang'); }
        }
        break;
      case 'friend_invest':
        if(chance(40)){ const v=20000+rnd(120000); p.money+=v; log(`That investment ${p.first} made paid off big — ${money(v)}.`,'big'); }
        else if(chance(50)){ log(`The investment ${p.first} made trickled back about even. No harm done.`,'muted'); p.money+=10000; }
        else { log(`The "can't-miss" deal ${p.first} bought into collapsed. The money's gone.`,'bad'); }
        break;
      case 'health_neglect':
        if(chance(55)){ p.stats.health=clamp(p.stats.health-20); log(`The warning ${p.first} ignored caught up with them. A serious health crisis.`,'bad'); }
        break;
    }
  });
}

