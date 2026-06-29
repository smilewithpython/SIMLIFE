"use strict";
/* Threadbare · split module: 22-health.js  (lines 6862–7061 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   HEALTH PANEL — insurance, doctor, therapy
   ============================================================ */
function openHealth(){
  const p=me();
  const prem = 2200 + p.age*40 + p.conditions.length*900;
  let html=`<div class="grab"></div><h3>${p.first}'s health</h3>
  <p class="hint">Health ${Math.round(p.stats.health)} · Stress ${Math.round(p.stress)} · ${p.insured?'✅ Insured':'⚠️ No insurance'}${p.conditions.length?' · '+p.conditions.join(', '):''}</p>`;
  const opts=[];

  // insurance
  if(!p.insured){
    opts.push(O('🛡','Buy health insurance',`${money(prem)}/yr · covers most medical bills`,0,()=>{
      p.insured=true; p.insurePremium=prem; closeSheet();
      log(`${p.first} signed up for health insurance — ${money(prem)}/yr.`,'good'); render();
    }, p.money<prem));
  } else {
    opts.push(O('🛡','Cancel insurance',`stop paying ${money(p.insurePremium)}/yr`,0,()=>{
      p.insured=false; closeSheet(); log(`${p.first} dropped health insurance. Risky.`,'muted'); render();
    }));
  }

  // doctor
  if(p.age>=1){
    const cost = p.insured? 200 : 1500+rnd(2000);
    opts.push(O('🩺','See a doctor',`+health · ${money(cost)}${p.insured?' (insured rate)':''}`,0,()=>{
      p.money-=cost; p.stats.health=clamp(p.stats.health+12+rnd(8));
      if(p.conditions.length && chance(40)){const cured=p.conditions.shift();log(`Treatment cleared up ${p.first}'s ${cured}.`,'big');}
      else log(`${p.first} got a checkup and a clean tune-up.`,'good');
      closeSheet(); render();
    }, p.money<cost));
  }

  // pregnancy care
  if(p.pregnant){
    opts.push(OH('— Expecting —'));
    opts.push(O('🤰','Pregnancy & prenatal care','prenatal care or other options',0,()=>{ closeSheet(); openPrenatalOptions(p); }));
  }

  // therapy / stress
  opts.push(O('🛋','Go to therapy','−stress, +joy · $1,200',0,()=>{
    p.money-=Math.min(p.money,1200); p.stress=clamp(p.stress-25); p.stats.happy=clamp(p.stats.happy+8);
    closeSheet(); log(`${p.first} started therapy. The weight lifted a little.`,'good'); render();
  }));

  // rehab — one option per active addiction
  if(p.addictions && p.addictions.length){
    opts.push(OH('— Recovery —'));
    p.addictions.forEach(a=>{ const d=ADDICT(a.k); if(!d) return;
      const cost = {alcohol:8000,cocaine:15000,party_drugs:12000,painkillers:18000,gambling:10000,nicotine:5000}[a.k]||8000;
      opts.push(O(d.e,`Rehab for ${d.l}`,`${d.rehab}${a.sev>1?' · severe':''}`,0,()=>{
        if(p.money<cost){closeSheet();log(`${p.first} can't afford this program right now.`,'muted');render();return;}
        p.money-=cost; closeSheet();
        const odds = 75 - (a.sev-1)*18;
        if(chance(odds)){ clearAddiction(p,a.k); p.stats.health=clamp(p.stats.health+10); p.stats.happy=clamp(p.stats.happy+12); log(`${p.first} came out of rehab clean of ${d.l}. A new start.`,'big'); }
        else { if(a.sev>1)a.sev--; log(`Rehab didn't fully take, but ${p.first} is fighting it.`,'bad'); }
        render();
      }));
    });
  }

  // plastic surgery
  if(p.age>=18){
    opts.push(O('💅','Cosmetic surgery','+looks · $12,000 · some risk',0,()=>{
      p.money-=Math.min(p.money,12000); closeSheet();
      if(chance(80)){p.stats.looks=clamp(p.stats.looks+12);log(`The surgery went well. ${p.first} loves the result.`,'good');}
      else{p.stats.looks=clamp(p.stats.looks-8);p.stats.health=clamp(p.stats.health-6);log(`The surgery was botched. ${p.first} regrets it.`,'bad');}
      render();
    }));
  }

  // meditate (free)
  opts.push(O('🧘','Meditate','−stress, free',0,()=>{
    p.stress=clamp(p.stress-12); p.stats.happy=clamp(p.stats.happy+3); closeSheet();
    log(`${p.first} sat with their breath a while. Calmer.`,'good'); render();
  }));

  // ----- TRAITS: psychologist removes a bad trait; specialist coaching adds a good one -----
  const badTraits=(p.acqTraits||[]).filter(k=>{const t=ACQ(k);return t&&!t.good;});
  if(badTraits.length){
    opts.push(OH('— Traits —'));
    badTraits.forEach(k=>{ const t=ACQ(k); const cost=8000;
      opts.push(O('🧠',`See a psychologist about "${t.l}"`,`work to overcome it · ${money(cost)}`,0,()=>{
        if(p.money<cost){closeSheet();log(`${p.first} can't afford the sessions right now.`,'muted');render();return;}
        p.money-=cost; closeSheet();
        if(chance(65)){ removeTrait(p,k); log(`After months of work, ${p.first} overcame being ${t.l.toLowerCase()}.`,'big'); }
        else log(`The sessions helped a little, but ${p.first} is still working through it.`,'muted');
        render();
      }));
    });
  }
  if(p.age>=12){
    const goodAvailable=ACQ_TRAITS.filter(t=>t.good&&!hasTrait(p,t.k));
    if(goodAvailable.length){
      const cost=15000;
      opts.push(OH(badTraits.length?'':'— Traits —'));
      opts.push(O('🌟','Hire a personal coach','train toward a positive trait · $15,000',0,()=>{
        if(p.money<cost){closeSheet();log(`${p.first} can't afford a coach right now.`,'muted');render();return;}
        p.money-=cost; closeSheet();
        if(chance(50)){ const t=pick(goodAvailable); addTrait(p,t.k); }
        else log(`${p.first} worked hard with the coach, but nothing quite clicked this time.`,'muted');
        render();
      }));
    }
  }

  sheet(html+opts.join(''), sh=>bindOpts(sh));
}


function openSelf(){
  const p=me();
  const traitChips=p.traits.map(k=>{const t=TRAITS.find(x=>x.k===k);return `<span class="page-flag" style="background:var(--panel-2);padding:6px 11px;border-radius:20px;margin-right:6px;display:inline-block;margin-bottom:6px">${t.e} ${t.l}</span>`}).join('');
  const acqChips=(p.acqTraits||[]).map(k=>{const t=ACQ(k);if(!t)return '';return `<span class="page-flag" style="background:${t.good?'rgba(125,160,110,.18)':'rgba(180,90,80,.18)'};padding:6px 11px;border-radius:20px;margin-right:6px;display:inline-block;margin-bottom:6px">${t.e} ${t.l}</span>`}).join('');
  const allstats=[...STATMETA,{k:'athletic',l:'Athletic',c:'--sage'},{k:'fame',l:'Fame',c:'--gold'}];
  let bars=allstats.map(m=>{const v=Math.round(p.stats[m.k]);return `<div class="stat" style="margin:9px 0"><span class="lab" style="width:60px">${m.l}</span><span class="bar"><i class="fill" style="width:${v}%;background:var(--${m.c.slice(2)})"></i></span><span style="width:30px;text-align:right;font-size:12px;color:var(--ink-dim)">${v}</span></div>`}).join('');
  const netWorth = p.money + p.assets.reduce((s,a)=>s+(a.value||0),0) + (p.portfolio?(p.portfolio.low||0)+(p.portfolio.med||0)+(p.portfolio.high||0):0) + (p.businesses||[]).reduce((s,b)=>s+(b.value||0),0);
  const assetIco=a=>a.kind==='house'?'🏠':a.kind==='luxury'?'💎':'🚗';
  const assetLines = p.assets.length? p.assets.map(a=>`<div style="font-size:12.5px">${assetIco(a)} ${a.name} — ${money(a.value)}</div>`).join('') : '';
  const petLines = p.pets.filter(x=>x.alive).length? p.pets.filter(x=>x.alive).map(pt=>`<div style="font-size:12.5px">${pt.emoji} ${pt.name} the ${pt.kind.toLowerCase()}, age ${pt.age}</div>`).join('') : '';
  const bizLines = (p.businesses||[]).length? p.businesses.map(b=>`<div style="font-size:12.5px">💼 ${b.name} — ${money(b.value)}</div>`).join('') : '';
  const jobLine = p.job!=='none'? (p.jobTitle? p.jobTitle+' ('+CAREER(p.job).l+')' : CAREER(p.job).l) : (p.partTime? p.partTime.name+' (part-time)' : 'No job');
  const bdayStr = p.bday? `${MONTHS[p.bday.m]} ${p.bday.day}, ` : '';
  const html=`<div class="grab"></div><h3>${p.first} ${p.last}</h3>
  <p class="hint">${p.age} years old · born ${bdayStr}${p.born}${p.birthplace?' in '+p.birthplace:''}</p>
  <p class="hint" style="padding-top:0">${EDU[p.edu]} · ${jobLine}</p>
  <div style="padding:6px 20px 4px">${traitChips}</div>
  ${acqChips?`<div style="padding:0 20px 4px">${acqChips}</div>`:''}
  <div style="padding:8px 20px 4px">${bars}</div>
  <div style="padding:10px 20px 0;color:var(--ink-dim);font-size:13px;line-height:1.7">
    Purse: <b style="color:var(--gold)">${money(p.money)}</b>${p.salary?` · earning ${money(p.salary)}/yr`:''}<br>
    Net worth: <b style="color:var(--gold)">${money(netWorth)}</b> · ${p.insured?'Insured ✅':'Uninsured ⚠️'}<br>
    ${p.married?'Married':'Single'} · ${p.childrenIds.length} child${p.childrenIds.length===1?'':'ren'} · Generation ${p.gen}
    ${(p.partnerHistory&&p.partnerHistory.filter(h=>h.status==='Ex-spouse').length)?`<br>${p.partnerHistory.filter(h=>h.status==='Ex-spouse').length} ex-spouse(s) · ${p.partnerHistory.filter(h=>h.status==='Fling').length} past fling(s)`:''}
    ${p.onSocial?`<br>${p.socialFollowers.toLocaleString()} social followers`:''}
    ${p.addictions&&p.addictions.length?`<br><span style="color:var(--blood)">Struggling with: ${p.addictions.map(a=>{const d=ADDICT(a.k);return d?d.e+' '+d.l+(a.sev>1?' ('+(a.sev>2?'severe':'worsening')+')':''):a.k;}).join(', ')}</span>`:''}
    ${p.pregnant?`<br><span style="color:var(--rose)">🤰 Expecting${p.pregnant.fromAffair?' (from an affair)':''}</span>`:''}
    ${p.record.length?`<br>Record: ${p.record.join(', ')}`:''}
    ${p.ruler?`<br><span style="color:var(--gold)">${p.ruler.title} of ${p.ruler.country} 👑</span>`:''}
    ${p.fightRecord?`<br><span style="color:var(--sage)">Fight record: ${p.fightRecord.w}-${p.fightRecord.l}${p.champion?' · 🏆 CHAMPION':''}</span>`:''}
    ${p.greek?`<br>${GREEK.find(g=>g.k===p.greek)?GREEK.find(g=>g.k===p.greek).l:''} member`:''}
    ${p.powers&&p.powers.length?`<br><span style="color:var(--sky)">Powers: ${p.powers.join(', ')}</span>${relevantPower(p)?`<br><span style="color:var(--gold);font-size:12px">⚡ ${relevantPower(p)} gives a huge edge in your career</span>`:''}`:''}
    ${p.job==='superhero'&&(p.heroRep||p.livesSaved)?`<br><span style="color:var(--sky)">Hero reputation: ${Math.round(p.heroRep||0)} · ${(p.livesSaved||0).toLocaleString()} lives saved${p.gadgetLevel?` · ${['','Workshop','Hi-tech Lab','Secret Lair','Hero Fortress','Orbital HQ'][p.gadgetLevel]}`:''}</span>`:''}
    ${p.sidekick?`<br><span style="color:var(--sage)">Sidekick: ${p.sidekick.name} (bond ${Math.round(p.sidekick.bond)})</span>`:''}
    ${p.nemesis?`<br><span style="color:var(--blood)">Nemesis: ${p.nemesis.name} (defeated ${p.nemesis.defeated}×)</span>`:''}
    ${p.henchman?`<br><span style="color:var(--gold)">Henchman: ${p.henchman.name} (loyalty ${Math.round(p.henchman.loyalty)})</span>`:''}
    ${p.job==='crimelord'&&((p.territory||0)>0||(p.rackets||[]).length)?`<br><span style="color:var(--gold)">Turf: ${Math.round(p.territory||0)}% · ${(p.rackets||[]).length} racket${(p.rackets||[]).length===1?'':'s'}</span>`:''}
    ${p.minions>0?`<br><span style="color:var(--gold)">Crew: ${p.minions} minions · power ${Math.round(p.minionPower||0)}</span>`:''}
    ${p.doomsdayLevel>0?`<br><span style="color:var(--blood)">Doomsday device: ${['','built','ARMED','WORLD THREAT'][p.doomsdayLevel]}</span>`:''}
    ${p.job==='villain'&&p.heat?`<br><span style="color:var(--blood)">Heat: ${p.heat} 🔥</span>`:''}
    ${p.inPrison&&p.securityLevel?`<br><span style="color:var(--blood)">Held in ${SECURITY_NAMES[p.securityLevel]}</span>`:''}
    ${p.inPrison&&(p.prisonRep||0)>0?`<br><span style="color:var(--gold)">Prison respect: ${Math.round(p.prisonRep)}/100${p.prisonRole==='shotcaller'?' · runs the block 👑':''}</span>`:''}
    ${p.citizenship&&p.citizenship!==(G.hometown||'').split(', ')[1]?`<br>Citizen of ${p.citizenship}`:''}
    ${p.orientation&&p.orientation!=='straight'?`<br>Orientation: ${p.orientation==='gay'?(p.sex==='f'?'lesbian':'gay'):'bisexual'}`:''}
    ${p.inPrison?`<br><span style="color:var(--blood)">In prison — ${p.lifeSentence?'LIFE sentence':p.prisonYears+' year(s) left'}</span>`:''}
  </div>
  ${assetLines?`<div style="padding:10px 20px 0"><div style="font-size:11px;color:var(--ink-faint);font-variant:small-caps;letter-spacing:1.5px;margin-bottom:4px">Assets</div>${assetLines}</div>`:''}
  ${bizLines?`<div style="padding:10px 20px 0"><div style="font-size:11px;color:var(--ink-faint);font-variant:small-caps;letter-spacing:1.5px;margin-bottom:4px">Businesses</div>${bizLines}</div>`:''}
  ${petLines?`<div style="padding:10px 20px 0"><div style="font-size:11px;color:var(--ink-faint);font-variant:small-caps;letter-spacing:1.5px;margin-bottom:4px">Pets</div>${petLines}</div>`:''}
  ${(p.powers&&p.powers.length)||p.gen>=2||(G.vault&&G.vault.length)?`<div style="padding:14px 20px 0">
    <div style="font-size:11px;color:var(--ink-faint);font-variant:small-caps;letter-spacing:1.5px;margin-bottom:4px">The bloodline's burden</div>
    <div style="background:var(--panel-2);border-radius:12px;padding:12px 14px;border:1px solid rgba(120,140,200,.25)">
      <div style="font-size:13px;color:var(--sky)">Powers: <b>${p.powers.length}/${TOTAL_POWERS}</b> · <span style="color:var(--gold)">Vault: <b>${vaultRequiredCount()}/${REQUIRED_VAULT}</b></span></div>
      <div style="height:7px;background:rgba(255,255,255,.08);border-radius:5px;margin:7px 0;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(p.powers.length/TOTAL_POWERS*100)}%;background:linear-gradient(90deg,var(--sky),var(--gold))"></i></div>
      <div style="font-size:11.5px;color:var(--ink-faint);line-height:1.5">${bloodlineReady(p)?'<b style="color:var(--gold)">All powers AND the vault are ready.</b> ':''}Everything Homelander-related lives in the ☄️ tab.</div>
      <button class="btn ghost" id="hlTabBtn" style="margin-top:9px">☄️ Open the Homelander tab</button>
      ${G.homelanderDefeated?`<div style="font-size:12px;color:var(--gold);margin-top:8px">✅ Defeated ${G.homelandersBeaten}×.${G.newHomelanderIn!=null?` A new one rises in ~${G.newHomelanderIn} years.`:''}</div>`:''}
    </div>
  </div>`:''}
  <div style="padding:14px 20px 0"><button class="btn ghost" id="history" style="margin-top:0">📜 Life history</button></div>
  ${G.world&&G.world.length?`<div style="padding:8px 20px 0"><button class="btn ghost" id="worldhist" style="margin-top:0">🌍 World history</button></div>`:''}
  <div style="padding:8px 20px 0"><button class="btn ghost" id="rename" style="margin-top:0">✏️ Change name</button></div>`;
  sheet(html, sh=>{
    const rn=sh.querySelector('#rename');
    if(rn) rn.onclick=()=>openRename(p);
    const hb=sh.querySelector('#history'); if(hb) hb.onclick=()=>openHistory(p);
    const wb=sh.querySelector('#worldhist'); if(wb) wb.onclick=()=>openWorldHistory();
    const ht=sh.querySelector('#hlTabBtn'); if(ht) ht.onclick=()=>{ closeSheet(); openHomelander(); };
  });
}
function openVault(p){
  closeSheet();
  const reqList=VAULT_ITEMS.filter(v=>v.req);
  const optList=VAULT_ITEMS.filter(v=>!v.req);
  const row=v=>{ const have=vaultHas(v.id); return `<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;opacity:${have?1:0.5}">
    <div style="font-size:20px;width:26px;text-align:center">${have?v.emoji:'🔒'}</div>
    <div style="flex:1"><div style="font-size:13.5px;color:${have?'var(--gold)':'var(--ink-dim)'}">${v.name}${have?'':' <span style=\"font-size:11px;color:var(--ink-faint)\">— not yet secured</span>'}</div>
    <div style="font-size:11.5px;color:var(--ink-faint);line-height:1.45">${have?v.desc:'Earned at the peak of: '+careerLabel(v.career)}</div></div></div>`; };
  const html=`<div class="grab"></div><h3>🗝️ The Vault</h3>
    <p class="hint">Items your ancestors gathered to one day end Homelander. Secured at the peak of specific careers, across generations.</p>
    <div style="padding:4px 20px">
      <div style="font-size:12px;color:var(--gold);font-variant:small-caps;letter-spacing:1.5px;margin:6px 0">Required — ${vaultRequiredCount()}/${REQUIRED_VAULT}</div>
      ${reqList.map(row).join('')}
      <div style="font-size:12px;color:var(--sky);font-variant:small-caps;letter-spacing:1.5px;margin:14px 0 6px">Optional — ${vaultOptionalCount()}/${optList.length} <span style="color:var(--ink-faint)">(better odds & richer fight)</span></div>
      ${optList.map(row).join('')}
    </div>`;
  sheet(html);
}
function careerLabel(k){ if(k==='governor')return 'Politician (Governor)'; const c=CAREER(k); return c?c.l:k; }

