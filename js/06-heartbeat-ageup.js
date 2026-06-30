"use strict";
/* Threadbare · split module: 06-heartbeat-ageup.js  (lines 1225–1639 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   AGE UP  — the heartbeat
   ============================================================ */
$('#age').onclick=advanceQuarter;

// ============ QUARTERLY HEARTBEAT ============
// Each button press advances one quarter (3 months). The log window clears each
// press so it shows only what happened this quarter. The full yearly simulation
// (jobs, stats, big events, aging) runs on the 4th quarter, then the year ticks.
function advanceQuarter(){
  const p=me(); if(!p||!p.alive) return;
  if(p._busy) return;            // guard against double-press mid-modal
  // ===== HOMELANDER lives in this world, mostly indifferent to us =====
  // renewable loop: after a defeat, a new Homelander eventually rises
  if(G.homelanderDefeated && G.newHomelanderIn!=null){
    G.newHomelanderIn--;
    if(G.newHomelanderIn<=0){
      G.homelanderDefeated=false; G.newHomelanderIn=null;
      worldEvent(p, `A new Homelander has risen — another being with all the powers of a god and none of the conscience. The world holds its breath again.`, {fear:true});
      log(`⚡ A NEW HOMELANDER has risen. The bloodline's work is never truly done.`,'death');
    }
  }
  if(!G.homelanderDefeated){
    // 3% ambient news blurb of Homelander's latest atrocity (pure flavor)
    if(chance(3)){ log(`📰 ${anyHomelanderBlurb()}`,'muted'); }
    // 0.05% chance Homelander accidentally kills the current character
    if(Math.random()*100 < 0.05){
      p._causeOfDeath = `caught in the path of one of Homelander's careless rampages`;
      log(`☄️ Homelander, mid-tantrum, didn't even notice ${p.first} below. Wrong place, wrong time.`,'death');
      die(p); render(); return;
    }
  }
  // clear the visible window for a fresh quarter
  clearWindow();
  const season=SEASONS[p.q||0];
  logSeasonHeader(`${season} · Age ${p.age}`);
  if((p.q||0) < 3){
    // a "light" in-between quarter: minor drift + a chance of its own event/choice
    quarterTick(p, ()=>{ p.q=(p.q||0)+1; render(); });
  } else {
    // 4th quarter → run the full year, then roll over to Q1 and tick age
    p.q=0;
    runYear();   // this advances age/year and may end on a modal; it calls render itself
  }
}
function clearWindow(){
  const L=$('#log'); if(L){ L.innerHTML=''; }
  _logShownFor = me()?me().id:null; // mark as fresh so repaintLog won't rebuild full history
}
function logSeasonHeader(text){
  const L=$('#log'); if(!L) return;
  const div=document.createElement('div'); div.className='season-head';
  div.textContent=text; L.appendChild(div);
}
// a light quarter: small stat drift and a chance of a quarterly event or choice
function quarterTick(p, done){
  // gentle drift so quarters feel alive without double-counting the yearly sim
  p.stats.happy=clamp(p.stats.happy+rndDrift(1));
  // FIGHT CAREERS: quarterly prep-and-fight cadence (UFC = being "over", WWE = scripted)
  if((p.job==='ufc'||p.job==='wwe') && p.age<42 && !p.inPrison){
    // a fight roughly every other quarter (≈2 fights/year) — other quarters are training camp
    if((p.q===1 || p.q===3)){
      render(); showFightPrep(p, ()=>{ if(done)done(); }); return;
    }
  }
  // PRISON: a separate world of interactive events while locked up
  if(p.alive && p.inPrison){
    if(chance(55)){
      const ev=rollPrisonEvent(p);
      if(ev){ render(); showChoiceEvent(p, ev, ()=>{ if(done)done(); }, {quarter:true}); return; }
    }
    if(chance(40)){ prisonQuarterEvent(p); }
    if(done) done(); return;
  }
  // FOUR-TRACK EVENTS: free background flavor + up to FOREGROUND_MAX track decisions this quarter
  if(p.alive){
    fireBackgroundEvents(p);
    const evs = rollQuarterEvents(p);
    if(evs.length){ showEventQueue(p, evs, ()=>{ if(done)done(); }); return; }
  }
  // one-tap filler so empty quarters rarely feel dead
  if(p.alive && chance(55)){ quarterEvent(p); }
  if(done) done();
}
// fight career: prep this quarter, then fight
function showFightPrep(p, done){
  if(p.fightRecord==null){ p.fightRecord={w:0,l:0}; p.champion=false; }
  const isUFC=p.job==='ufc';
  const opts=[
    {l:'Train hard', sub:'+skill, −rest', kind:'train'},
    {l:'Study your opponent', sub:'+edge', kind:'study'},
    {l:'Cut weight & rest', sub:'safe prep', kind:'rest'},
    {l:isUFC?'Trash-talk to sell the fight':'Cut a promo', sub:'+hype/fame', kind:'promo'},
  ];
  const rec=p.fightRecord;
  let html=`<div class="grab"></div>
    <div style="text-align:center;font-size:40px;margin:4px 0">${isUFC?'🥊':'🤼'}</div>
    <h3 style="text-align:center">${p.champion?'Title Defense':'Fight Week'} — ${SEASONS[p.q||0]}</h3>
    <p style="padding:4px 22px 14px;color:var(--ink-dim);font-size:14.5px;line-height:1.55;text-align:center">Record ${rec.w}-${rec.l}${p.champion?' · CHAMPION':''}. ${p.first} has a fight coming up. How do they prepare?</p>`;
  opts.forEach((c,i)=>{ html+=`<button class="opt" data-i="${i}"><span class="oico">▸</span><span class="otxt">${c.l}<span class="osub">${c.sub}</span></span></button>`; });
  const s=document.createElement('div'); s.className='scrim'; s.innerHTML=`<div class="sheet">${html}</div>`; root.appendChild(s);
  s.querySelectorAll('.opt').forEach(b=>{ b.onclick=()=>{ const c=opts[+b.dataset.i]; s.remove(); resolveFight(p,c.kind,isUFC); render(); if(done)done(); }; });
}
function resolveFight(p, prep, isUFC){
  let edge=0;
  if(prep==='train'){ p.stats.athletic=clamp(p.stats.athletic+2); p.stats.health=clamp(p.stats.health-4); edge=12; }
  else if(prep==='study'){ edge=16; }
  else if(prep==='rest'){ p.stats.health=clamp(p.stats.health+3); edge=6; }
  else if(prep==='promo'){ p.stats.fame=clamp(p.stats.fame+6); edge=4; }
  if(hasFlag(p,'trainedByLegend')) edge+=6;
  // relevant superpowers make a fighter nearly unbeatable
  const fightPowerEdge = powerEdge(p);
  if(fightPowerEdge>0){ edge += 40 + fightPowerEdge*15; if(hasPower(p,'regeneration')) p.stats.health=clamp(p.stats.health+5); }
  if(hasFlag(p,'juicing')){
    edge+=10;
    // random in-competition drug test; smart fighters evade it
    if(!(p.stats.smarts>65) && chance(12)){
      clearFlag(p,'juicing'); p.stats.fame=clamp(p.stats.fame-15); p.record.push('Failed drug test'); p.salary=Math.round(p.salary*0.6);
      log(`${p.first} failed a post-fight drug test. Result overturned, suspended.`,'bad');
    }
  }
  if(!p.fightRecord) p.fightRecord={w:0,l:0};
  const rec=p.fightRecord;
  if(isUFC){
    // UFC: real competition — winning depends on skill + prep; injuries possible
    const winOdds = 42 + (p.stats.athletic-60)*0.6 + edge + (p.traits.includes('tough')?8:0);
    if(chance(winOdds)){
      rec.w++; const purse=30000+rnd(400000)+(p.champion?500000:0); p.money+=purse; p.stats.fame=clamp(p.stats.fame+(p.champion?8:5));
      log(`🥊 ${p.first} WON by ${pick(['decision','KO','submission','TKO'])}! Record ${rec.w}-${rec.l}. Purse ${money(purse)}.`,'big');
      if(chance(28)) p.stats.health=clamp(p.stats.health-(6+rnd(10)));
      // title shot after a win streak
      if(!p.champion && rec.w>=4 && rec.w-rec.l>=3 && chance(70)){ p.champion=true; p.stats.fame=clamp(p.stats.fame+25); worldEvent(p,`${p.first} won the UFC championship belt.`,{hope:true}); }
    } else {
      rec.l++; p.stats.health=clamp(p.stats.health-(6+rnd(10)));
      log(`🥊 ${p.first} LOST the fight. Record ${rec.w}-${rec.l}.`,'bad');
      if(p.champion && chance(60)){ p.champion=false; log(`${p.first} lost the title.`,'bad'); }
    }
    // in UFC, being "over" (famous/exciting) matters as much as the belt
    if(p.stats.fame>60 && chance(20)){ const bonus=100000+rnd(900000); p.money+=bonus; log(`${p.first}'s star power landed a ${money(bonus)} headline bonus — a true draw.`,'big'); }
  } else {
    // WWE: scripted — wins are booked toward stars who are "over"; fame drives everything
    const overness = p.stats.fame + edge + p.stats.athletic*0.3;
    if(chance(40+edge)){
      rec.w++; const pay=20000+rnd(150000)+(p.champion?200000:0); p.money+=pay; p.stats.fame=clamp(p.stats.fame+6);
      log(`🤼 ${p.first} was booked to go over in a huge match! The crowd is electric. Record ${rec.w}-${rec.l}.`,'big');
      if(!p.champion && p.stats.fame>45 && chance(55)){ p.champion=true; p.stats.fame=clamp(p.stats.fame+20); worldEvent(p,`${p.first} was crowned WWE Champion in a packed arena.`,{hope:true}); }
    } else {
      rec.l++; p.stats.fame=clamp(p.stats.fame+2);
      log(`🤼 ${p.first} put another wrestler over tonight. Record ${rec.w}-${rec.l}.`,'muted');
      if(p.champion && chance(40)){ p.champion=false; log(`${p.first} dropped the title in a scripted finish.`,'muted'); }
    }
    if(chance(14)){ p.stats.health=clamp(p.stats.health-(5+rnd(10))); log(`${p.first} took a real bump and got banged up.`,'bad'); }
  }
}
function ageUp(){ // kept as alias in case anything calls it
  runYear();
}
function runYear(){
  const p=me(); if(!p.alive){ return; }
  p.age++; G.year++;

  // bring any pregnancy to term
  if(p.pregnant) resolvePregnancy(p);

  // age every other living person in the bloodline (so heirs grow up off-screen)
  G.people.forEach(other=>{
    if(other.id===p.id || !other.alive) return;
    other.age++;
    // light passive development for off-screen kin
    if(other.age<=18){ other.stats.smarts=clamp(other.stats.smarts+0.8); other.stats.athletic=clamp(other.stats.athletic+0.5); }
    else if(other.age>55){ other.stats.health=clamp(other.stats.health-1.0-(other.age-55)*0.1); }
    // give offscreen adults their own unfolding lives — but only close kin, to keep the world bounded
    const closeKin = other.gen>=p.gen && other.gen<=p.gen+1 && isCloseRelative(p,other);
    if(other.age>=18 && closeKin) autonomousLife(other);
    // off-screen natural death for elderly kin (rare, avoids immortal ancestors)
    if(other.age>70 && chance((other.age-70)*0.8)){ other.alive=false; other.deathAge=other.age;
      const rc=p.rels.find(r=>r.id===other.id); if(rc) rc.alive=false;
    }
  });
  pruneTree(p);

  // natural drift
  p.stats.health = clamp(p.stats.health + (p.age>50? -1.2 - (p.age-50)*0.12 : (p.age<25? +0.4:0)) + (p.traits.includes('tough')?0.5:0) + rndDrift());
  p.stats.happy  = clamp(p.stats.happy + rndDrift(2) + (p.traits.includes('kind')?0.3:0));
  if(p.age<=18 && p.inSchool) p.stats.smarts=clamp(p.stats.smarts + (p.traits.includes('curious')?2.2:1.4));
  // high-school club training
  if(p.clubs && p.clubs.length && p.age>=13 && p.age<=18){
    p.clubs.forEach(ck=>{ const cl=CLUBS.find(x=>x.k===ck); if(cl){ p.stats[cl.stat]=clamp(p.stats[cl.stat]+cl.boost); setFlag(p,cl.flag); } });
  }
  if(p.age>=14&&p.age<=22) p.stats.athletic=clamp(p.stats.athletic+rndDrift(2));
  p.stats.looks = clamp(p.stats.looks + (p.age>35?-0.5:p.age<25?0.3:0) + rndDrift(1));
  if(p.stats.fame>0) p.stats.fame=clamp(p.stats.fame*0.94,0,100); // fame fades

  // acquired-trait nudges
  if(p.acqTraits && p.acqTraits.length){
    p.acqTraits.forEach(tk=>{ const t=ACQ(tk); if(t&&t.nudge){ for(const s in t.nudge){ p.stats[s]=clamp(p.stats[s]+t.nudge[s]); } } });
  }

  // income
  if(p.job!=='none' && p.alive){
    runJob(p);
    // track career stats for a future pension
    if(p.salary>p.peakSalary) p.peakSalary=p.salary;
    p.careerYears=(p.careerYears||0)+1;
  }
  // RETIREMENT INCOME: pension + Social Security once retired and of age
  if(p.retired && p.alive){
    let income=0;
    if(p.pension>0) income+=p.pension;
    // Social Security kicks in at 65 (or earlier if claimed); scales with career length
    if(p.age>=65 || p.claimedSS){
      const ss=Math.round(Math.min(45000, 12000+ (p.careerYears||0)*700) * (p.claimedSS&&p.age<65?0.7:1));
      income+=ss;
    }
    if(income>0){ p.money+=income; }
  }
  // part-time income
  if(p.partTime){ p.money += p.partTime.pay; p.stress=clamp(p.stress+3); if(p.age<18) p.stats.smarts=clamp(p.stats.smarts-0.5); }

  // schooling transitions
  schoolTick(p);

  // BLOODLINE POWERS: a descendant born with inherited powers may manifest a new latent ability
  // as they grow (automatic path toward the 2-per-generation cap). Events provide the rest.
  if(p.powers && p.powers.length>0 && (p.powersGained||0)<POWERS_PER_GEN && p.powers.length<TOTAL_POWERS && p.age>=8 && chance(8)){
    const pow=grantPower(p);
    if(pow) log(`${p.first}'s inherited bloodline awakened a new power: ${pow}.`,'big');
  }

  // pending delayed consequences from past choices come due
  resolvePending(p);

  // coming of age: discover orientation around 18 (player choice, once)
  if(p.age===18 && !p.orientation && !p._askedOrientation){
    p._askedOrientation=true;
    render();
    showOrientationPicker(p, ()=>{ lifeEvents(p); finishYear(p); });
    return;
  }

  // imprisoned crime boss / supervillain: offer an escape attempt this year
  if(p.inPrison && canAttemptEscape(p) && chance(70)){
    render();
    showEscapeChoice(p, ()=>finishYear(p));
    return;
  }

  // vault capstone: at a career peak, offer to store a vault item for the bloodline
  {
    const item=(p.alive&&p.job!=='none')?vaultItemForJob(p):null;
    if(item && !vaultHas(item.id) && !(p._vaultOffered||[]).includes(item.id) && atCareerPeak(p)){
      if(!p._vaultOffered)p._vaultOffered=[];
      p._vaultOffered.push(item.id);
      render();
      showVaultCapstone(p, item, ()=>finishYear(p));
      return;
    }
  }

  // FOUR-TRACK EVENTS for the year-closing quarter: if any fire, resolve them then finish the year
  fireBackgroundEvents(p);
  const evs = rollQuarterEvents(p);
  if(evs.length){
    render(); // refresh stats so far
    showEventQueue(p, evs, ()=>{ lifeEvents(p); finishYear(p); });
    return;
  }

  // age-banded random (one-tap) events
  lifeEvents(p);

  finishYear(p);
}
function finishYear(p){
  if(!p.alive) return;
  // relationship drift + deaths of kin
  relTick(p);
  // ongoing systems: insurance, assets, pets, prison, stress
  systemsTick(p);
  // health crisis / death roll
  if(deathRoll(p)) { return; } // handles death + continuation
  render();
}
function rndDrift(s=3){ return (Math.random()*2-1)*s*0.6; }

function systemsTick(p){
  // insurance premium
  if(p.insured){ const prem=p.insurePremium||(2200+p.age*40); p.money-=prem; if(p.money<0&&chance(40)){p.insured=false;log(`${p.first} could no longer afford health insurance. Coverage lapsed.`,'bad');} }
  // chronic conditions erode health
  if(p.conditions.length){ p.stats.health=clamp(p.stats.health - p.conditions.length*1.5); }
  // stress bleeds into health
  if(p.stress>60){ p.stats.health=clamp(p.stats.health-(p.stress-60)*0.08); if(chance(6)){p.conditions.push('high blood pressure');log(`Years of stress caught up — ${p.first} was diagnosed with high blood pressure.`,'bad');p.stress=clamp(p.stress-20);} }
  p.stress=clamp(p.stress-3);
  // the quiet weight some characters carry never fully lifts — a small, persistent drag,
  // with a chance late in life to finally set it down (which the eulogy then reflects)
  if(hasFlag(p,'ch_carriesWeight') && !hasFlag(p,'foundPeace')){
    p.stats.happy=clamp(p.stats.happy-1.2); p.stress=clamp(p.stress+1);
    if(p.age>58 && chance(8)){ setFlag(p,'foundPeace',true); p.stats.happy=clamp(p.stats.happy+12); p.stress=clamp(p.stress-12); log(`After carrying it so long, ${p.first} finally made a quiet peace with the thing they'd never spoken of.`,'big'); }
  }
  // addictions (each drags stats; small yearly chance to beat one, severity makes it harder)
  if(p.addictions && p.addictions.length){
    p.addictions.slice().forEach(a=>{
      const d=ADDICT(a.k); if(!d) return;
      p.stats.health=clamp(p.stats.health + d.health*a.sev*0.5);
      p.stats.happy=clamp(p.stats.happy + d.happy*a.sev*0.5);
      // gambling bleeds money
      if(a.k==='gambling' && chance(40)){ const loss=Math.min(p.money, (1000+rnd(8000))*a.sev); p.money-=loss; }
      // chance to quit on their own
      if(chance(d.quit/a.sev)){ clearAddiction(p,a.k); log(`${p.first} finally beat their ${d.l} habit. Hard-won.`,'big'); p.stats.happy=clamp(p.stats.happy+10); }
      // small chance a severe addiction turns deadly
      else if(a.sev>=3 && p.stats.health<25 && chance(8)){ p.stats.health=clamp(p.stats.health-20); log(`${p.first}'s ${d.l} addiction nearly killed them — a terrifying overdose scare.`,'bad'); }
    });
  }
  // assets depreciate / appreciate
  p.assets.forEach(a=>{ if(a.kind==='car') a.value=Math.round(a.value*0.88); else if(a.kind==='house') a.value=Math.round(a.value*(1.01+Math.random()*0.06)); });
  // pets age + give comfort (health & happiness)
  let livePets=0;
  p.pets.forEach(pet=>{ if(!pet.alive)return; livePets++; pet.age++; const lifespan=pet.kind==='Dog'?15:pet.kind==='Cat'?18:pet.kind==='Parrot'?40:10;
    if(pet.age>lifespan && chance(35)){ pet.alive=false; livePets--; log(`${pet.name} the ${pet.kind.toLowerCase()} passed away. ${p.first} is heartbroken.`,'death'); p.stats.happy=clamp(p.stats.happy-12); }
    else if(chance(2)){ pet.bond=clamp(pet.bond+3); } });
  if(livePets){ p.stats.happy=clamp(p.stats.happy + Math.min(4,livePets*2)); p.stats.health=clamp(p.stats.health + Math.min(2,livePets)); }
  // prison
  if(p.inPrison){
    p.stats.happy=clamp(p.stats.happy-4); p.stats.health=clamp(p.stats.health-1);
    p._yearsServed=(p._yearsServed||0)+1;
    // appeal / case review — evidence can resurface and overturn a conviction
    if(p._yearsServed>=3 && chance(p.lifeSentence?1.8:4)){
      const kind=pick([
        {t:`A key witness recanted their testimony.`, win:55},
        {t:`${p.first}'s lawyer found evidence was mishandled.`, win:50},
        {t:`New DNA evidence came to light.`, win:60},
        {t:`A detective on the case was exposed for misconduct.`, win:65},
        {t:`An appeals court agreed to review the case.`, win:40},
      ]);
      log(kind.t+` An appeal is underway.`,'big');
      if(chance(kind.win)){
        p.inPrison=false; p.prisonYears=0; p.lifeSentence=false;
        p.record.push('Conviction overturned');
        p.stats.happy=clamp(p.stats.happy+20);
        log(`${p.first}'s conviction was overturned. A free ${sexWord(p.sex)} again.`,'big');
        return;
      } else {
        log(`The appeal was denied. ${p.first} stays inside.`,'bad');
      }
    }
    // parole for non-life sentences
    if(!p.lifeSentence){
      p.prisonYears--;
      // chance of early parole for good behavior
      if(p.prisonYears>1 && p._yearsServed>=2 && chance(12)){ p.prisonYears=0; log(`${p.first} was granted early parole for good behavior.`,'good'); }
      if(p.prisonYears<=0){
        // ===== RELEASE: prison shapes who walks out =====
        const wasBoss = p.prisonRole==='shotcaller';
        const repEarned = p.prisonRep||0;
        const criminalPath = p._wasCrime || p.job==='crimelord' || p.job==='villain' || hasFlag(p,'madeBones') || wasBoss;
        let outMsg = `${p.first} was released from prison. A second chance.`;
        if(criminalPath){
          // a criminal comes out harder and more connected — "better, by which I mean worse"
          const hardness = Math.round(repEarned/12) + (wasBoss?6:0) + (hasFlag(p,'madeBones')?4:0);
          p.stats.athletic=clamp(p.stats.athletic + Math.min(12, hardness));
          p.stats.smarts=clamp(p.stats.smarts + (hasFlag(p,'kingpinProtege')?6:2));
          // terrifying reputation translates to underworld standing
          if(p.job==='crimelord'||p.job==='villain'){
            p.minionPower=clamp((p.minionPower||0) + Math.min(20, hardness+ (hasFlag(p,'recruitedInside')?6:0)));
            if(hasFlag(p,'crewInside')) p.minions=(p.minions||0)+1;
            if(p.job==='crimelord') p.territory=clamp((p.territory||0) + (wasBoss?12:5));
            p.heat=Math.max(0,(p.heat||0)-15); // did the time, cooled some heat
          }
          // hardened traits earned inside
          if(hasFlag(p,'coldBlooded')||hasFlag(p,'madeBones')){ addTrait(p,'tough'); if(chance(60))addTrait(p,'sly',true); }
          if(repEarned>=60 && chance(60)) addTrait(p,'brave');
          // a prison-forged reputation precedes them on the street
          if(repEarned>=50 || wasBoss){ p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'exConHardened'); }
          outMsg = wasBoss
            ? `${p.first} walked out of prison a legend of the underworld — harder, sharper, and more feared than the day they went in.`
            : `${p.first} did their time and came out tougher and more connected. Prison was an education.`;
          // released boss may have a fresh enforcer waiting
          if(hasFlag(p,'recruitedInside')&&!p.henchman&&chance(50)){ p.henchman={name:villainName(),loyalty:75}; }
        } else {
          // non-criminals: rehabilitation or hardening depending on what they did inside
          if(hasFlag(p,'modelInmate')){ p.stats.happy=clamp(p.stats.happy+6); outMsg=`${p.first} was released, having turned the time into a fresh start.`; }
          else if(repEarned>40){ addTrait(p,'tough'); outMsg=`${p.first} walked out of prison a harder person than they went in.`; }
        }
        p.inPrison=false; p._yearsServed=0; p._wasCrime=false; p._villainJailed=false; p.securityLevel=0; p.escapeAttempts=0; p.prisonRep=0; p.prisonRole=null;
        clearFlag(p,'prisonNetwork'); clearFlag(p,'prisonGang'); clearFlag(p,'snitch'); clearFlag(p,'ownsGuard'); clearFlag(p,'crewInside'); clearFlag(p,'owesGang'); clearFlag(p,'holdsGrudge');
        log(outMsg,'big');
      }
    }
  }

  // investment portfolio — different risk/return profiles
  if(p.portfolio){
    const tiers=[['low',0.04,0.04],['med',0.08,0.16],['high',0.16,0.45]];
    let totalDelta=0;
    tiers.forEach(([k,meanR,vol])=>{
      if(p.portfolio[k]>0){
        const r = meanR + (Math.random()*2-1)*vol;
        const delta=Math.round(p.portfolio[k]*r);
        p.portfolio[k]=Math.max(0,p.portfolio[k]+delta);
        totalDelta+=delta;
      }
    });
    if(Math.abs(totalDelta)>500){ log(totalDelta>=0?`Investments grew by ${money(totalDelta)} this year.`:`Investments fell ${money(-totalDelta)} this year.`, totalDelta>=0?'good':'bad'); }
  }
  // business income (casino, etc.)
  if(p.businesses && p.businesses.length){
    p.businesses.forEach(b=>{
      const swing=0.5+Math.random();
      const profit=Math.round((b.income||0)*swing);
      p.money+=profit;
      b.value=Math.round((b.value||0)*(1.0+(Math.random()*0.1-0.03)));
      if((b.income||0)>0 && chance(4)){ const hit=Math.round((b.value||0)*0.2); p.money-=hit; log(`${b.name} had a rough year — ${money(hit)} in losses.`,'bad'); }
    });
  }
  // social media growth
  if(p.onSocial){
    const growth=Math.round(p.socialFollowers*0.12) + rnd(500) + (p.stats.fame>20?rnd(3000):0) + (p.traits.includes('charming')?rnd(800):0);
    p.socialFollowers+=growth;
    p.stats.fame=clamp(p.stats.fame + Math.min(3, p.socialFollowers/50000));
    if(p.socialFollowers>50000 && chance(20)){ const sponsor=Math.round(p.socialFollowers*(0.5+Math.random())); p.money+=sponsor; log(`A brand deal landed ${p.first} ${money(sponsor)} from their following.`,'good'); }
  }
}

