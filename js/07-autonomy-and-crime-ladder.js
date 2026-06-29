"use strict";
/* Threadbare · split module: 07-autonomy-and-crime-ladder.js  (lines 1640–1960 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   AUTONOMY — offscreen relatives live their own quiet lives:
   they get jobs, partner up, have kids, build a little wealth.
   Kept lightweight (no logging) but produces real, inheritable people.
   ============================================================ */
function autonomousLife(o){
  o.autonomous=true;
  // pick up a job in their 20s, scaled to their smarts
  if(o.job==='none' && o.age>=20 && o.age<=55 && chance(28)){
    const pool=CAREERS.filter(c=>c.k!=='none'&&!c.wild&&!c.staged&&!c.athGate&&!c.looksGate&&(c.edu||0)<= (o.smartsEdu||(o.stats.smarts>70?3:o.stats.smarts>55?2:o.stats.smarts>40?1:0)));
    if(pool.length){ const j=pick(pool); o.job=j.k; o.salary=j.base; o.jobYears=0; }
  }
  // earn / spend
  if(o.job!=='none'){
    const c=CAREER(o.job); o.jobYears=(o.jobYears||0)+1;
    o.salary=Math.round((c.base||30000)+(o.jobYears*(c.grow||1000)));
    const costs=12000+(o.married?7000:0)+o.childrenIds.length*9000;
    o.money=(o.money||0)+(o.salary-costs);
    // occasional retirement
    if(o.age>64 && chance(30)){ o.job='none'; o.salary=0; }
  }
  // partner up
  if(!o.married && o.age>=22 && o.age<=60 && chance(14)){
    const sx=makeSex();
    const sp={name:newFirst(sx)+' '+pick(LAST),kind:'Spouse',sex:sx,bond:55+rnd(30),alive:true,id:nid()};
    o.rels.push(sp); o.married=true; o.partnerName=sp.name;
    if(!o.partnerHistory) o.partnerHistory=[];
    o.partnerHistory.push({id:sp.id,name:sp.name,sex:sx,from:G.year,to:null,status:'Spouse',kids:0});
  }
  // have kids (these become real people in the tree, inheritable)
  if(o.married && o.age>=22 && o.age<=46 && o.childrenIds.length<4 && chance(20)){
    const csx=makeSex();
    const kid=blankPerson({first:newFirst(csx),last:o.last,sex:csx,gen:o.gen+1,born:G.year,age:0,parentIds:[o.id]});
    kid.stats.smarts=clamp((o.stats.smarts+(50+rnd(30)))/2);
    if(o.traits.length) kid.traits=[pick(o.traits),pick(TRAITS).k].filter((v,i,a)=>a.indexOf(v)===i);
    G.people.push(kid);
    o.childrenIds.push(kid.id);
    o.rels.push({name:kid.first+' '+kid.last,kind:'Child',sex:csx,bond:80,alive:true,id:kid.id});
    const h=(o.partnerHistory||[]).find(x=>x.status==='Spouse'&&!x.to); if(h)h.kids=(h.kids||0)+1;
  }
  // small chance of divorce/widowhood offscreen
  if(o.married && chance(2)){
    const sp=o.rels.find(r=>r.kind==='Spouse'&&r.alive);
    if(sp){ sp.kind='Ex-spouse'; o.married=false; const h=(o.partnerHistory||[]).find(x=>x.id===sp.id); if(h){h.status='Ex-spouse';h.to=G.year;} }
  }
}

function runJob(p){
  const c=CAREER(p.job);
  p.jobYears++;
  let pay=p.salary;

  // ---- deep staged careers (WWE, movie star, tech, boxer, director) ----
  if(c.staged){
    const stages=c.stages;
    if(p._stage==null){ p._stage=0; p._stageYears=0; p.jobTitle=stages[0].t; }
    p._stageYears++;
    const st=stages[p._stage];

    // ----- ORGANIZED CRIME / VILLAIN: bust risk, advancement by years, prison on capture -----
    if(c.crime){
      // pay scales with stage; villains (base 0) earn through heists scaled to their stage
      const heistBase = c.base>0 ? c.base : 40000;
      pay=Math.round(heistBase*Math.max(0.4,st.mult)*(0.8+Math.random()*0.5));
      // crime-lord rackets and territory provide steady income on top of scores
      if(p.job==='crimelord'){
        const racketIncome=(p.rackets||[]).reduce((s,r)=>s+(r.income||0),0);
        const turfIncome=Math.round((p.territory||0)*4000);
        pay+=racketIncome+turfIncome;
      }
      // a crew of minions running rackets boosts the villain's take significantly
      if(p.minions>0){ const cut=Math.round(p.minions*(8000+(p.minionPower||0)*400)); pay+=cut; }
      p.salary=pay;
      // villain world-events: persistent mark on the world
      if(c.evil && p._stage>=2 && chance(20)){ worldEvent(p, pick([
        `${p.first} held a city hostage with a doomsday device.`,
        `${p.first}'s heist drained the national reserve.`,
        `${p.first} unleashed chaos across the capital.`]), {fear:true}); }
      // bust chance this year, reduced by sly trait, raised by stage and accumulated heat
      let bust=st.bust + (p.traits.includes('sly')?-4:0) - (p.traits.includes('lucky')?3:0) + Math.floor((p.heat||0)/10);
      // a capable crew helps the boss evade capture
      bust -= Math.round((p.minionPower||0)/12);
      if(c.evil) bust=Math.round(bust*0.55); // costumed villains evade capture more easily
      bust=Math.max(2,bust);
      // heat slowly cools each year
      if(p.heat>0) p.heat=Math.max(0, p.heat-5);
      if(chance(bust)){
        // caught — sentence scales with how deep they were
        const tier=p._stage;
        let sentence;
        if(tier>=4 && chance(40)){ sentence='life'; }
        else sentence = 2 + tier*2 + rnd(4);
        p.record.push(`Convicted (${st.t})`);
        p._wasCrime=true; p._villainJailed=!!c.evil; p.securityLevel=0; p.escapeAttempts=0;
        if(sentence==='life'){
          p.inPrison=true; p.prisonYears=999; p.lifeSentence=true;
          log(`${p.first} was caught and sentenced to LIFE in prison.`,'death');
        } else {
          p.inPrison=true; p.prisonYears=sentence; p.lifeSentence=false;
          log(`${p.first} got pinched — ${sentence} years in prison.`,'bad');
        }
        // seize a chunk of money
        p.money=Math.floor(p.money*0.5);
        endJob(p);
        // costs still apply this year
        p.money -= 11000 + (p.married?7000:0) + p.childrenIds.length*9000;
        return;
      }
      // advancement: by years served in the life + a little luck
      const next=stages[p._stage+1];
      if(next && p._stageYears>=next.years && chance(40+(p.traits.includes('sly')?15:0)+(p.traits.includes('driven')?10:0))){
        p._stage++; p._stageYears=0; p.jobTitle=next.t;
        log(`${p.first} moved up in the organization — now ${next.t}. The money's bigger, the heat's worse.`,'big');
      }
      const costs0 = 11000 + (p.married?7000:0) + p.childrenIds.length*9000 + p.age*120;
      p.money += pay - costs0;
      return;
    }

    const key=c.keyStat||'smarts';
    // training: working the craft slowly raises the key stat
    p.stats[key]=clamp(p.stats[key] + (p.traits.includes('driven')?1.6:1.0) + (chance(30)?1:0));
    // fame trickle by stage
    if(st.fame) p.stats.fame=clamp(p.stats.fame + st.fame*0.2 + (chance(25)?st.fame*0.1:0));
    // SUPERHERO: fight crime (take damage), earn from endorsements at higher stages, do heroic world-events
    if(c.hero){
      // reputation and endorsements provide a modest income; gear reduces injury risk
      const repIncome = Math.round((p.heroRep||0)*3000 + (p.stats.fame||0)*1500);
      if(repIncome>0){ p.salary=Math.max(p.salary, repIncome); }
      const injuryRisk = (p._stage>=2?40:25) - (p.gadgetLevel||0)*5 - (p.powers?p.powers.length*3:0);
      if(chance(Math.max(8,injuryRisk))){ p.stats.health=clamp(p.stats.health-(6+rnd(14))); log(`${p.first} was hurt stopping a crime in progress.`,'bad'); }
      if(p._stage>=2 && chance(18)){ const saved=50+rnd(500); p.livesSaved=(p.livesSaved||0)+saved; worldEvent(p, pick([
        `${p.first} saved the city from a catastrophe.`,
        `${p.first} foiled a supervillain's scheme.`,
        `${p.first} pulled hundreds from a collapsing bridge.`]), {hope:true}); }
    }
    // MAD SCIENTIST: reality-bending experiments with persistent world consequences
    if(c.mad && p._stage>=2 && chance(22)){
      const exp=pick([
        {t:`${p.first} opened a portal to another dimension.`, w:{portal:true}},
        {t:`${p.first} cloned themselves — there are two now.`, w:{clones:true}},
        {t:`${p.first} reversed gravity over a small town for a week.`, w:{gravity:true}},
        {t:`${p.first} invented a serum that turned pigeons sentient.`, w:{pigeons:true}},
        {t:`${p.first} accidentally aged every clock on Earth by a year.`, w:{clocks:true}},
      ]);
      worldEvent(p, exp.t, exp.w);
      if(chance(25)){ p.stats.health=clamp(p.stats.health-15); log(`The experiment backfired on ${p.first}.`,'bad'); }
    }
    // dangerous staged careers (boxer) take damage — powers soften it
    if(c.danger && !c.hero && chance(Math.max(3,(p._stage>=2?22:12) - powerEdge(p)*8))){ p.stats.health=clamp(p.stats.health-(8+rnd(12))*(hasPower(p,'regeneration')?0.3:1)); log(`${p.first} took a beating this season. Recovery will take time.`,'bad'); }
    // pay = base * stage multiplier, with a little variance
    pay=Math.round(c.base*st.mult*(0.85+Math.random()*0.4));
    // a power relevant to this career boosts earnings and reduces danger
    const pEdge = powerEdge(p);
    if(pEdge>0){ pay=Math.round(pay*(1+0.35*pEdge)); }
    p.salary=pay;
    // can we advance to the next stage?
    const next=stages[p._stage+1];
    if(next){
      const ready = p._stageYears>=next.years && (p.stats[key]>=next.req || pEdge>=1);
      if(ready && chance(55+p.stats[key]*0.3 + pEdge*25)){
        p._stage++; p._stageYears=0; p.jobTitle=next.t;
        p.stats.fame=clamp(p.stats.fame + (next.fame||0));
        const callup = pick(['got the call-up','earned the promotion','broke through','made the leap','signed the bigger deal']);
        log(`${p.first} ${callup} — now ${next.t}. Pay is ${money(Math.round(c.base*next.mult))}.`,'big');
        // heroes & villains unlock a new power as they rise
        if((c.hero||c.evil) && chance(70)){ const pow=grantPower(p); if(pow) log(`${p.first} unlocked a new power: ${pow}.`,'big'); }
        // AI STARTUP: funding rounds and the IPO windfall
        if(c.company){
          if(next.t==='Series A'){ const raise=2000000+rnd(8000000); log(`${p.first} closed a Series A — ${money(raise)} raised. (Equity, not cash yet.)`,'big'); }
          else if(next.t==='Unicorn'){ p.stats.fame=clamp(p.stats.fame+15); log(`${p.first}'s company hit a billion-dollar valuation. A unicorn.`,'big'); }
          else if(next.t==='IPO — Public CEO'){ const windfall=20000000+rnd(180000000); p.money+=windfall; p.stats.fame=clamp(p.stats.fame+30); worldEvent(p,`${p.first} took their AI company public in a blockbuster IPO.`,{hope:true}); log(`💰 The IPO made ${p.first} fabulously rich — ${money(windfall)} cashed out.`,'big'); }
        }
      } else if(p._stageYears>10 && p._stage<2 && chance(18)){
        // stuck at the bottom too long → wash out
        log(`${p.first} couldn't break through and left the ${c.l.toLowerCase()} world behind.`,'muted');
        endJob(p); return;
      }
    } else {
      // at the top: aging out for athletic careers
      if((c.short) && p.age>40 && chance(35)){ log(`${p.first} retired at the top of the game — a true legend.`,'big'); p.stats.fame=clamp(p.stats.fame+12); endJob(p,'Retired a champion'); return; }
    }
    // living costs
    const costs0 = 11000 + (p.married?7000:0) + p.childrenIds.length*9000 + p.age*120;
    p.money += pay - costs0;
    if(p.money<0 && chance(30)) log(`Money is tight. ${p.first} is in the red.`,'bad');
    return;
  }

  // wildcard careers fluctuate
  if(c.wild){
    if(c.k==='youtuber'||c.k==='musician'||c.k==='actor'){
      const buzz = (p.stats.fame/40) + (p.traits.includes('charming')?.3:0);
      pay = Math.round(c.base + p.jobYears*c.grow*(0.4+Math.random()*buzz));
      p.stats.fame=clamp(p.stats.fame + (chance(35)? 4+rnd(12):(-2+rnd(3))));
      if(chance(8)){ p.stats.fame=clamp(p.stats.fame+25); log(`Something ${p.first} made ${pick(['went viral','blew up overnight','got picked up everywhere'])}. ★ Fame surged.`,'big'); pay*=3; }
    } else if(c.k==='nba'||c.k==='soccer'){
      pay = c.base + p.jobYears*c.grow;
      // super strength/speed/regeneration etc. make a player dominant and extend their prime
      const pE=powerEdge(p);
      if(pE>0){ pay=Math.round(pay*(1+0.5*pE)); }
      const retireAge = (c.k==='nba'?34:33) + (hasPower(p,'regeneration')?12:0) + (pE>0?4:0);
      if(p.age>retireAge && chance(40)){ log(`The body gave out. ${p.first} retired from the game — a legend's run.`,'big'); p.stats.fame=clamp(p.stats.fame+10); endJob(p,'Retired from pro sports'); return; }
      // a powered athlete dominates: fame and the occasional record-breaking season
      if(pE>0 && chance(30)){ p.stats.fame=clamp(p.stats.fame+8); log(`${p.first} put up superhuman numbers this season. Records are falling.`,'big'); }
    } else if(c.k==='founder'){
      // startup: mostly nothing, sometimes everything
      if(chance(7)){ const exit=200000+rnd(4000000); p.money+=exit; log(`The company sold. ${p.first} cashed out for ${money(exit)}.`,'big'); p.stats.fame=clamp(p.stats.fame+15); }
      else if(chance(20)){ const raise=rnd(80000); p.money+=raise; if(raise>0)log(`Closed a small round. ${money(raise)} in the bank — for now.`,'good'); }
      else { p.money-=Math.min(p.money,4000+rnd(9000)); }
      pay=0;
    } else if(c.k==='realtor'){
      const sales = rnd(4)+(p.traits.includes('charming')?1:0);
      pay = c.base + sales*c.grow*(0.5+Math.random());
    } else if(c.k==='writer'){
      pay = c.base;
      if(chance(10)){ const royalties=20000+rnd(300000); pay+=royalties; p.stats.fame=clamp(p.stats.fame+12); log(`${p.first}'s book found readers. ${money(royalties)} in royalties.`,'big'); }
    } else if(c.k==='model'){
      const buzz=p.stats.looks/50;
      pay=Math.round(c.base+p.jobYears*c.grow*(0.4+Math.random()*buzz));
      p.stats.fame=clamp(p.stats.fame+(chance(30)?6:1));
    } else if(c.k==='ufc'){
      // fights now happen quarterly (prep-and-fight); yearly tick just settles base income
      pay = c.base + p.jobYears*c.grow;
      if(powerEdge(p)>0) pay=Math.round(pay*1.6);
      const ufcRetire = 38 + (hasPower(p,'regeneration')?12:0);
      if(p.age>ufcRetire && chance(35)){ log(`${p.first} hung up the gloves for good.`,'big'); endJob(p,'Retired from fighting'); return; }
    } else if(c.k==='politician'){
      pay = c.base + (p._rung??0)*c.grow;
      const steps=c.ladder, idx=p._rung??0;
      if(!p.jobTitle) p.jobTitle=steps[idx];
      if(idx<steps.length-1){
        if(p.jobYears>=2+idx && chance(28 + p.stats.looks*0.15 + p.stats.fame*0.2 + (p.traits.includes('charming')?12:0))){
          // campaign costs money
          if(p.money>20000){ p.money-=15000+rnd(40000);
            p._rung=idx+1; p.jobTitle=steps[p._rung]; p.stats.fame=clamp(p.stats.fame+12);
            log(`${p.first} won the election — now ${p.jobTitle}.`,'big');
          }
        } else if(chance(15)){ p.stats.fame=clamp(p.stats.fame-5); log(`${p.first} lost an election. The press was unkind.`,'bad'); }
      }
    }
    // powers like telepathy/mind control/shapeshifting boost any wild career's earnings
    const wildEdge=powerEdge(p);
    if(wildEdge>0 && pay>0){ pay=Math.round(pay*(1+0.3*wildEdge)); }
    p.salary=pay;
  } else {
    pay = c.base + p.jobYears*c.grow;
    p.stress=clamp(p.stress + rnd(4) - 1);
    const stdEdge = powerEdge(p);
    // a relevant power makes you a standout: faster promotions, better pay
    if(c.ladder){
      const steps=c.ladder, idx=p._rung??0;
      if(idx<steps.length-1 && p.jobYears>=3+idx*2 && chance(35+p.stats.smarts*0.2 + stdEdge*30)){
        p._rung=idx+1; p.jobTitle=steps[p._rung];
        p.salary=pay=Math.round(pay*(1.25+Math.random()*0.3));
        log(`${p.first} was promoted to ${p.jobTitle}. Pay is now ${money(pay)}.`,'big');
      } else if(!p.jobTitle){ p.jobTitle=steps[idx]; }
    }
    if(stdEdge>0){ pay=Math.round(pay*(1+0.3*stdEdge)); p.salary=pay; }
    // ordinary raise (powers make raises more frequent)
    if(chance(14 + stdEdge*15)){ pay=Math.round(pay*(1.05+Math.random()*0.06)); p.salary=pay; log(`${p.first} earned a raise. Pay is now ${money(pay)}.`,'good'); }
    // dangerous jobs (powers protect you)
    if(c.danger && chance(Math.max(1,4 - stdEdge*2))){ p.stats.health=clamp(p.stats.health-25*(hasPower(p,'regeneration')||hasPower(p,'force fields')?0.3:1)); log(`${p.first} was wounded in the line of duty.`,'bad'); }
  }
  // living costs scale a little with age/family
  const costs = 11000 + (p.married?7000:0) + p.childrenIds.length*9000 + p.age*120;
  const net = pay - costs;
  p.money += net;
  if(p.money<0 && chance(30)) log(`Money is tight. ${p.first} is in the red.`,'bad');
}
function endJob(p,reason){ p.job='none'; p.salary=0; p.jobYears=0; p.jobTitle=null; p._rung=0; p._stage=null; p._stageYears=0; if(reason)log(reason,'muted'); }
// Retire from a career: compute a pension from peak salary and years worked, set retired status.
function doRetire(p, quiet){
  const yrs=p.careerYears||p.jobYears||0;
  const peak=Math.max(p.peakSalary||0, p.salary||0);
  // pension: a fraction of peak pay, scaling with years served (longer career → better pension)
  const factor=Math.min(0.6, 0.012*yrs);     // up to 60% of peak after ~50 years
  p.pension=Math.round(peak*factor);
  p.retired=true;
  endJob(p);
  if(!quiet){
    if(p.pension>0) log(`${p.first} retired with a ${money(p.pension)}/yr pension after ${yrs} years of work.`,'big');
    else log(`${p.first} retired. Time is the new luxury.`,'big');
  }
}

/* ---------------- schooling ---------------- */
function schoolTick(p){
  if(p.age===6 && !p.inSchool){ p.inSchool=true; p.schoolLevel='Primary school'; log(`${p.first} started school.`,'muted'); }
  if(p.age===14){ p.schoolLevel='High school'; }
  if(p.age===18 && p.inSchool){ p.inSchool=false; p.schoolLevel=null;
    if(p.stats.smarts>=55) log(`${p.first} graduated high school with real promise.`,'good');
    else log(`${p.first} finished high school.`,'muted');
  }
  // college runs while flag set
  if(p._college){
    p._college--;
    if(p._college===0){ p.inSchool=false; p.schoolLevel=null; p.edu=Math.max(p.edu,p._collegeTier);
      log(`${p.first} graduated — ${EDU[p.edu]}. The doors are open now.`,'big'); p._collegeTier=null;
      // college athletes get a shot at the pros or the Olympics
      if(p.collegeSport){
        const s=COLLEGE_SPORTS.find(x=>x.k===p.collegeSport);
        if(s){
          if(s.olympics){
            // track → Olympic qualification, then pro/fame
            if(p.stats.athletic>=88 && chance(55)){ p.stats.fame=clamp(p.stats.fame+30); worldEvent(p,`${p.first} qualified for the Olympics and medaled in track.`,{hope:true}); p.money+=150000+rnd(500000); }
            else if(p.stats.athletic>=80){ p.stats.fame=clamp(p.stats.fame+12); log(`${p.first} competed at the national level in track. So close to the Olympics.`,'good'); }
            else { log(`${p.first}'s college sports days came to an end.`,'muted'); }
          } else if(s.pro){
            // basketball/football → draft chance
            const pc=CAREER(s.pro);
            if(p.stats.athletic>=s.proReq && chance(45)){ takeJobSilent(p,s.pro); log(`${p.first} was DRAFTED into the ${pc.l.replace(' Player','')}! A pro athlete now.`,'big'); p.stats.fame=clamp(p.stats.fame+20); }
            else { log(`${p.first} went undrafted. The dream of going pro fades.`,'muted'); }
          }
        }
        p.collegeSport=null;
      }
    }
  }
}

