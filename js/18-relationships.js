"use strict";
/* Threadbare · split module: 18-relationships.js  (lines 5309–5852 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   RELATIONSHIPS PANEL
   ============================================================ */
let _nid=-100;
function nid(){ return _nid--; }

function relTick(p){
  // structured per-relationship decay / repair bookkeeping (module 36).
  // Replaces the old flat random drift with type-based decay that only applies
  // to relationships the player didn't meaningfully tend this year.
  if(typeof relYearProcess==='function') relYearProcess(p);
  // kin mortality
  p.rels.forEach(r=>{
    if(!r.alive) return;
    // parents/elders age out
    if((r.kind==='Mother'||r.kind==='Father') && chance(p.age>40?9:1.2)){ r.alive=false; log(`${p.first}'s ${r.kind.toLowerCase()} passed away.`,'death'); p.stats.happy=clamp(p.stats.happy-12);}
    else if(chance(0.5+ (p.age>60?2:0))){ r.alive=false; if(r.kind==='Spouse'){p.married=false;recordPartner(p,r,'Late spouse');log(`${r.name.split(' ')[0]} passed away. ${p.first} is a widow${p.sex==='m'?'er':''} now.`,'death');p.stats.happy=clamp(p.stats.happy-20);} }
  });
  // spouse can drift to divorce
  if(p.married && chance(3)){
    const sp=p.rels.find(r=>r.kind==='Spouse'&&r.alive);
    if(sp && sp.bond<35){ p.married=false; sp.kind='Ex-spouse'; recordPartner(p,sp,'Ex-spouse'); log(`${p.first} and ${sp.name.split(' ')[0]} divorced.`,'bad'); p.money-=Math.floor(p.money*0.3); p.stats.happy=clamp(p.stats.happy-15); }
  }
}

function openRelations(){
  const p=me();
  let html=`<div class="grab"></div><h3>People in ${p.first}'s life</h3><p class="hint">Tap someone to spend time with them.</p>`;
  const order={'Spouse':0,'Partner':1,'Child':2,'Mother':3,'Father':3,'Sister':4,'Brother':4,'Sibling':4,'Mother-in-law':5,'Father-in-law':5,'Friend':6,'Ex-spouse':7};
  const rels=[...p.rels].sort((a,b)=>(order[a.kind]??9)-(order[b.kind]??9));
  if(!rels.length) html+=`<p class="hint">No one close right now.</p>`;
  rels.forEach((r,i)=>{
    const col = (typeof bondStateColor==='function') ? bondStateColor(r.bond) : (r.bond>66?'--sage':r.bond>33?'--gold':'--blood');
    const stateName = (typeof bondStateName==='function') ? bondStateName(r.bond) : '';
    const emoji=relEmoji(r);
    const isRomantic = (r.kind==='Spouse'||r.kind==='Partner') && r.alive;
    const isPeer = /Brother|Sister|Sibling|Friend|Spouse|Partner|Child/.test(r.kind) && r.alive;
    // shared-interest icons (max 3)
    let shareIcons='';
    if(r.alive && typeof sharedInterests==='function'){
      const sh=sharedInterests(p, r).slice(0,3).map(k=>{ const m=interestMeta(k); return m?m.e:''; }).join('');
      if(sh) shareIcons=`<span style="margin-left:6px;font-size:11px">${sh}</span>`;
    }
    html+=`<div class="rel ${r.alive?'':'dead'}">
      <div class="av">${emoji}</div>
      <div class="rinfo"><div class="rn">${r.name}${shareIcons}</div><div class="rd">${r.kind}${r.note?' · '+r.note:''}${r.alive?(stateName?' · '+stateName:''):' · passed'}</div>
      ${r.alive?`<div class="rbar"><i style="width:${r.bond}%;background:var(--${col.slice(2)})"></i></div>`:''}</div>
      ${r.alive?`<button class="act" style="width:auto;padding:8px 10px;font-size:11px" data-i="${i}" data-act="time">Spend<br>time</button>`:''}
      ${isPeer?`<button class="act" style="width:auto;padding:8px 10px;font-size:11px" data-i="${i}" data-act="interact">More…</button>`:''}
      ${isRomantic?`<button class="act" style="width:auto;padding:8px 10px;font-size:11px" data-i="${i}" data-act="leave">${r.kind==='Spouse'?'Divorce':'Break<br>up'}</button>`:''}
    </div>`;
  });
  // action footer
  html+=`<div style="padding:14px 20px 0">`;
  if(!p.married && p.age>=18){
    const hasPartner=p.rels.find(r=>r.kind==='Partner'&&r.alive);
    if(hasPartner) html+=`<button class="btn gold" data-do="marry">💍 Propose to ${hasPartner.name.split(' ')[0]}</button>`;
    else html+=`<button class="btn ghost" data-do="date">💘 Look for love</button>`;
  }
  const hasMate=p.married||p.rels.find(r=>r.kind==='Partner'&&r.alive);
  if(hasMate && p.age>=18){
    if(p.pregnant){
      html+=`<button class="btn ghost" data-do="prenatal" style="margin-top:8px">🤰 Pregnancy & prenatal care</button>`;
    } else {
      html+=`<button class="btn gold" data-do="intimacy" style="margin-top:8px">💞 Intimacy</button>`;
      if(p.age>55 && p.age<=60){
        html+=`<button class="btn ghost" data-do="ivf" style="margin-top:8px">🏥 Fertility clinic ($28,000)</button>`;
      }
    }
    // cheating is available to anyone in a committed relationship
    html+=`<button class="btn ghost" data-do="affair" style="margin-top:8px">🔥 Have an affair</button>`;
  }
  // adoption available at any adult age, with or without a partner
  if(p.age>=21){
    html+=`<button class="btn ghost" data-do="adopt" style="margin-top:8px">🤱 Adopt a child ($18,000)</button>`;
  }
  // casual fling — single, can lead to a child out of wedlock
  if(p.age>=18 && !p.married && !p.rels.find(r=>r.kind==='Partner'&&r.alive)){
    html+=`<button class="btn ghost" data-do="fling" style="margin-top:8px">🔥 Casual fling</button>`;
  }
  // partner history
  if(p.partnerHistory && p.partnerHistory.length){
    html+=`<button class="btn ghost" data-do="history" style="margin-top:8px">📜 Past loves (${p.partnerHistory.length})</button>`;
  }
  html+=`</div>`;
  sheet(html, sh=>{
    sh.querySelectorAll('[data-act="time"]').forEach(b=>b.onclick=()=>{
      const r=rels[+b.dataset.i];
      if(typeof applyBond==='function'){ applyBond(r, 8+rnd(8)); markInteract(r,'time'); }
      else { r.bond=clamp(r.bond+8+rnd(8)); }
      p.stats.happy=clamp(p.stats.happy+3);
      closeSheet(); log(`${p.first} spent time with ${r.name.split(' ')[0]}. They grew closer.`,'good'); render();
    });
    sh.querySelectorAll('[data-act="leave"]').forEach(b=>b.onclick=()=>{
      const r=rels[+b.dataset.i]; doBreakup(p, r);
    });
    sh.querySelectorAll('[data-act="interact"]').forEach(b=>b.onclick=()=>{
      const r=rels[+b.dataset.i]; openPeerActions(p, r);
    });
    const marry=sh.querySelector('[data-do="marry"]'); if(marry)marry.onclick=()=>doMarry(p);
    const date=sh.querySelector('[data-do="date"]'); if(date)date.onclick=()=>doDate(p);
    const intim=sh.querySelector('[data-do="intimacy"]'); if(intim)intim.onclick=()=>openIntimacy(p);
    const affair=sh.querySelector('[data-do="affair"]'); if(affair)affair.onclick=()=>doAffair(p);
    const prenatal=sh.querySelector('[data-do="prenatal"]'); if(prenatal)prenatal.onclick=()=>openPrenatalOptions(p);
    const ivf=sh.querySelector('[data-do="ivf"]'); if(ivf)ivf.onclick=()=>doBaby(p,true);
    const adopt=sh.querySelector('[data-do="adopt"]'); if(adopt)adopt.onclick=()=>doAdopt(p);
    const fling=sh.querySelector('[data-do="fling"]'); if(fling)fling.onclick=()=>doFling(p);
    const hist=sh.querySelector('[data-do="history"]'); if(hist)hist.onclick=()=>openPartnerHistory(p);
  });
}

function openPeerActions(p, r){
  closeSheet();
  const isSib=/Brother|Sister|Sibling/.test(r.kind);
  const isRomance=/Spouse|Partner/.test(r.kind);
  const isChild=r.kind==='Child';
  const name=r.name.split(' ')[0];
  const opts=[];
  if(isRomance||isChild){
    // gentler menu for spouse/partner/child
    opts.push(O('💞','Spend quality time','+bond, +joy',0,()=>{ r.bond=clamp(r.bond+10); p.stats.happy=clamp(p.stats.happy+5); closeSheet(); log(`${p.first} spent meaningful time with ${name}.`,'good'); render(); }));
    if(isChild && r.id!=null){ const kid=findP(G,r.id); if(kid&&kid.alive&&kid.age<18){ opts.push(O('📖','Teach them something','+their smarts, +bond',0,()=>{ kid.stats.smarts=clamp(kid.stats.smarts+3); r.bond=clamp(r.bond+6); closeSheet(); log(`${p.first} taught ${name} a thing or two about life.`,'good'); render(); })); } }
    if(isChild){ opts.push(O('🎁','Spoil them','-$, +bond',0,()=>{ const c=Math.min(p.money,200+rnd(800)); p.money-=c; r.bond=clamp(r.bond+8); p.stats.happy=clamp(p.stats.happy+3); closeSheet(); log(`${p.first} spoiled ${name} a little. Worth every penny.`,'good'); render(); })); }
    if(isRomance){ opts.push(O('🌹','Plan a romantic surprise','-$, +bond',0,()=>{ const c=Math.min(p.money,300+rnd(1200)); p.money-=c; r.bond=clamp(r.bond+12); p.stats.happy=clamp(p.stats.happy+6); closeSheet(); log(`${p.first} surprised ${name}. The spark is alive.`,'good'); render(); })); }
    opts.push(O('✏️','Rename them','edit their name',0,()=>{ openRenameRel(p, r); }));
    let html=`<div class="grab"></div><h3>${name}</h3><p class="hint">${r.kind} · bond ${Math.round(r.bond)}/100</p>`;
    sheet(html+opts.join(''), sh=>{ bindOpts(sh); });
    return;
  }
  opts.push(O('🤝','Team up','+bond, +joy',0,()=>{ r.bond=clamp(r.bond+10); p.stats.happy=clamp(p.stats.happy+4); closeSheet(); log(`${p.first} and ${name} took on the world together for a while. Closer than ever.`,'good'); render(); }));
  if(p.age<=18){
    opts.push(O('🃏','Play a prank','risky fun',0,()=>{ if(chance(60)){ r.bond=clamp(r.bond+4); p.stats.happy=clamp(p.stats.happy+5); closeSheet(); log(`${p.first} pulled a harmless prank on ${name}. They both laughed.`,'good'); } else { r.bond=clamp(r.bond-8); closeSheet(); log(`The prank on ${name} went too far. They're mad at ${p.first}.`,'bad'); } render(); }));
    opts.push(O('🛡','Stick up for them','+bond',0,()=>{ r.bond=clamp(r.bond+12); p.stats.happy=clamp(p.stats.happy+3); if(chance(40))setFlag(p,'standsUp'); closeSheet(); log(`${p.first} stood up for ${name} when it counted.`,'good'); render(); }));
  }
  if(isSib){
    opts.push(O('😈','Torment them','−bond, sneaky joy',0,()=>{ r.bond=clamp(r.bond-12); p.stats.happy=clamp(p.stats.happy+2); setFlag(p,'prankster'); closeSheet(); log(`${p.first} made ${name}'s life a little miserable, sibling-style.`,'muted'); render(); }));
    opts.push(O('💰','Ask for a favor','depends on bond',0,()=>{ if(r.bond>55){ const amt=50+rnd(400); p.money+=amt; r.bond=clamp(r.bond-4); closeSheet(); log(`${name} spotted ${p.first} ${money(amt)}. That's what siblings are for.`,'good'); } else { r.bond=clamp(r.bond-6); closeSheet(); log(`${name} said no. Things are a little frosty.`,'muted'); } render(); }));
  } else {
    opts.push(O('🎮','Hang out','+bond',0,()=>{ r.bond=clamp(r.bond+8); p.stats.happy=clamp(p.stats.happy+5); closeSheet(); log(`${p.first} and ${name} spent the day hanging out. Good times.`,'good'); render(); }));
    opts.push(O('💢','Pick a fight','−bond',0,()=>{ r.bond=clamp(r.bond-14); p.stats.happy=clamp(p.stats.happy-3); closeSheet(); log(`${p.first} fell out with ${name}. The friendship cooled.`,'muted'); render(); }));
  }
  if(r.bond>=88) opts.push(OH(`You and ${name} are inseparable.`));
  else if(r.bond<=12) opts.push(OH(`You and ${name} can barely stand each other.`));
  opts.push(O('✏️','Rename them','edit their name',0,()=>{ openRenameRel(p, r); }));
  let html=`<div class="grab"></div><h3>${name}</h3><p class="hint">${r.kind} · bond ${Math.round(r.bond)}/100</p>`;
  sheet(html+opts.join(''), sh=>{ bindOpts(sh); });
}

function doBreakup(p, r){
  closeSheet();
  if(r.kind==='Spouse'){
    p.married=false; r.kind='Ex-spouse'; recordPartner(p,r,'Ex-spouse');
    // a prenup sharply reduces what the wealthier partner loses in the split
    const rate = p.prenup ? (0.05+Math.random()*0.07) : (0.25+Math.random()*0.2);
    const split=Math.floor(p.money*rate);
    p.money-=split;
    p.prenup=false;
    p.stats.happy=clamp(p.stats.happy-12);
    log(`${p.first} divorced ${r.name.split(' ')[0]}.${p.prenup?'':''} The split cost ${money(split)}${rate<0.15?' — the prenup held':''}.`,'bad');
  } else {
    // partner breakup
    r.kind='Ex'; r.alive=true;
    // remove ex partners from the active list after a moment — keep as a faded entry
    p.rels = p.rels.filter(x=>x!==r);
    p.stats.happy=clamp(p.stats.happy-6);
    log(`${p.first} broke up with ${r.name.split(' ')[0]}.`,'muted');
  }
  render();
}
function doFling(p){
  closeSheet();
  const sx=partnerSex(p); const otherName=newFirst(sx)+' '+pick(LAST);
  p.stats.happy=clamp(p.stats.happy+6);
  // chance of a child depends on age, lower than a committed couple
  const fertile = p.age<=47;
  if(fertile && chance(p.age<35?22:p.age<42?12:5)){
    const child=makeChild(p,{fling:true, otherParent:otherName});
    p.partnerHistory.push({id:nid(), name:otherName, sex:sx, from:G.year, to:G.year, status:'Fling', kids:1});
    log(`${p.first} had a fling with ${otherName.split(' ')[0]} — and months later, a surprise: a child, ${child.first}.`,'birth');
  } else {
    p.partnerHistory.push({id:nid(), name:otherName, sex:sx, from:G.year, to:G.year, status:'Fling', kids:0});
    log(`${p.first} had a brief fling with ${otherName.split(' ')[0]}. No strings.`,'good');
  }
  render();
}

// ===== INTIMACY & PREGNANCY =====
// Can this character carry a pregnancy themselves? (females under 50). Otherwise their partner may.
function canCarry(p){ return p.sex==='f' && p.age<=80; }
function partnerCanCarry(p, mate){
  // mate is a rels entry; female partner under ~49 can carry
  return mate && mate.sex==='f';
}
function conceptionOdds(p){ return p.age<35?70:p.age<40?48:p.age<45?28:p.age<48?14:6; }

function openIntimacy(p){
  closeSheet();
  const mate=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
  if(!mate){ log(`${p.first} needs a partner first.`,'muted'); render(); return; }
  const name=mate.name.split(' ')[0];
  // who could end up pregnant?
  const selfCarry=canCarry(p);
  const mateCarry=partnerCanCarry(p,mate);
  const canConceive = (selfCarry||mateCarry) && !(p.pregnant) ;
  const opts=[];
  opts.push(O('🛡','Protected — just enjoy it','+joy, no risk',0,()=>{
    p.stats.happy=clamp(p.stats.happy+7); if(mate)mate.bond=clamp(mate.bond+4); closeSheet();
    log(`${p.first} and ${name} had a lovely, carefree night.`,'good'); render();
  }));
  if(canConceive){
    opts.push(O('🔥','Unprotected — leave it to chance','+joy, may conceive',0,()=>{
      p.stats.happy=clamp(p.stats.happy+8); if(mate)mate.bond=clamp(mate.bond+5); closeSheet();
      tryConceive(p, mate, false); render();
    }));
    opts.push(O('🍼','Try for a baby','actively trying',0,()=>{
      p.stats.happy=clamp(p.stats.happy+6); if(mate)mate.bond=clamp(mate.bond+4); closeSheet();
      tryConceive(p, mate, true); render();
    }));
  } else if(p.pregnant){
    opts.push(OH('Already expecting — see the doctor in Health for prenatal care.'));
  } else if(G.chromosomalMixing){
    // chromosomal mixing unlocked by a Mad Scientist ancestor — biological children for all couples
    opts.push(O('🧪','Chromosomal mixing — try for a biological child','$35,000 · full power inheritance',0,()=>{
      if(p.money<35000){ closeSheet(); log(`${p.first} can't afford the chromosomal mixing procedure right now.`,'muted'); render(); return; }
      p.money-=35000; p.stats.happy=clamp(p.stats.happy+5); if(mate)mate.bond=clamp(mate.bond+5); closeSheet();
      if(chance(55)){
        const child=makeChild(p,{});
        p.stats.happy=clamp(p.stats.happy+10);
        log(`The chromosomal mixing worked. A child was born — ${child.first} ${child.last}. Biological, carrying the full bloodline.`,'birth');
      } else {
        log(`The chromosomal mixing didn't take this cycle. The science is imperfect — but the door is still open.`,'muted');
      }
      render();
    }));
    opts.push(OH('Chromosomal mixing: a Mad Scientist breakthrough that lets any couple have biological children.'));
  } else {
    opts.push(OH('A natural pregnancy isn\'t in the cards — but adoption and fertility clinics are options.'));
  }
  let html=`<div class="grab"></div><h3>A night with ${name}</h3><p class="hint">${mate.kind} · bond ${Math.round(mate.bond)}/100</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

function tryConceive(p, mate, trying){
  const odds = conceptionOdds(p) * (trying?1:0.7);
  if(!chance(odds)){
    log(trying?`${p.first} and ${mate.name.split(' ')[0]} are trying, but no luck yet.`:`A passionate night with ${mate.name.split(' ')[0]}.`,'muted');
    return;
  }
  // someone is pregnant
  const whoCarries = canCarry(p) ? 'self' : 'partner';
  p.pregnant = { father: whoCarries==='self'?(mate.name):p.first, conceivedYear:G.year, carrier:whoCarries, otherParent: mate.name, fromAffair:false };
  if(whoCarries==='self') log(`${p.first} is pregnant! A baby is on the way.`,'birth');
  else log(`${mate.name.split(' ')[0]} is pregnant! ${p.first} is going to be a parent.`,'birth');
}

// resolve a pregnancy at year-end (called from runYear)
function resolvePregnancy(p){
  if(!p.pregnant) return;
  const preg=p.pregnant;
  // ~1 year gestation in game terms; born the year after conception
  if(G.year > preg.conceivedYear){
    // small miscarriage chance, higher with poor health/age/addiction
    const risk = 6 + (p.age>42?10:0) + (p.stats.health<35?12:0) + ((p.addictions||[]).length?8:0);
    if(chance(risk)){
      p.pregnant=null;
      log(`Sadly, ${p.first}${preg.carrier==='self'?'':' and their partner'} lost the pregnancy. A hard loss.`,'bad');
      p.stats.happy=clamp(p.stats.happy-12);
      return;
    }
    const child=makeChild(p,{ fling:preg.fromAffair, otherParent:preg.otherParent });
    p.pregnant=null;
    p.stats.happy=clamp(p.stats.happy+10);
    log(`A child was born — ${child.first} ${child.last}.`,'birth');
    if(child._synthesized&&child._synthesized.length) child._synthesized.forEach(pw=>log(`✨ The bloodline's powers combined — ${child.first} was born with ${pw}!`,'big'));
    // let the player name them
    const otherLast = preg.otherParent? (preg.otherParent.split(' ').slice(1).join(' ')||null):null;
    if(p.id===G.cur) openNameChild(p, child, otherLast);
  }
}

// ===== CHEATING / AFFAIRS =====
function doAffair(p){
  closeSheet();
  const spouse=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
  if(!spouse){ log(`${p.first} isn't committed to anyone — no one to cheat on.`,'muted'); render(); return; }
  const sx=partnerSex(p); const affairName=newFirst(sx)+' '+pick(LAST);
  p.stats.happy=clamp(p.stats.happy+5);
  // record the affair
  p.partnerHistory.push({id:nid(), name:affairName, sex:sx, from:G.year, to:G.year, status:'Affair', kids:0});
  // pregnancy from the affair?
  let affairPreg=false;
  if(canCarry(p) && !p.pregnant && chance(conceptionOdds(p)*0.7)){
    p.pregnant={ father:affairName, conceivedYear:G.year, carrier:'self', otherParent:affairName, fromAffair:true };
    affairPreg=true;
  }
  // chance of getting caught
  const caught = chance(35 - (p.traits.includes('sly')?12:0) + (p.stats.smarts>65?-8:0));
  if(caught){
    spouse.bond=clamp(spouse.bond-40);
    log(`${p.first} was caught having an affair with ${affairName.split(' ')[0]}. ${spouse.name.split(' ')[0]} is devastated.`,'bad');
    // offer to make amends or let it fall apart
    offerAffairFallout(p, spouse, affairPreg, affairName);
    return;
  }
  log(`${p.first} had a secret affair with ${affairName.split(' ')[0]}. No one knows… yet.`,'muted');
  if(affairPreg){
    // secret pregnancy — offer to hide it
    offerHideAffairPregnancy(p, spouse, affairName);
  } else {
    render();
  }
}

function offerAffairFallout(p, spouse, affairPreg, affairName){
  const opts=[];
  opts.push(O('🙏','Beg for forgiveness','try to save it',0,()=>{ closeSheet();
    if(spouse.bond>10 && chance(40)){ spouse.bond=clamp(spouse.bond+15); log(`${spouse.name.split(' ')[0]} agreed to work through it. A long road back to trust.`,'muted'); }
    else { doBreakup(p, spouse); log(`${spouse.name.split(' ')[0]} couldn't forgive ${p.first}. It's over.`,'bad'); }
    if(affairPreg) log(`To make matters worse, ${p.first} is now pregnant from the affair.`,'bad');
    render();
  }));
  opts.push(O('🚪','Leave for the new lover','blow it all up',0,()=>{ closeSheet();
    doBreakup(p, spouse);
    const fr={name:affairName,kind:'Partner',sex:partnerSex(p),bond:55+rnd(20),alive:true,id:nid()}; p.rels.push(fr);
    log(`${p.first} left ${spouse.name.split(' ')[0]} for ${affairName.split(' ')[0]}. A new chapter, messy as it is.`,'muted');
    render();
  }));
  let html=`<div class="grab"></div><h3>Caught cheating</h3><p class="hint">${spouse.name.split(' ')[0]} knows everything. What now?</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

function offerHideAffairPregnancy(p, spouse, affairName){
  const opts=[];
  opts.push(O('🤫','Pass it off as your partner\'s','risky deception',0,()=>{ closeSheet();
    setFlag(p,'hidingAffairChild'); log(`${p.first} decided to raise the child as ${spouse.name.split(' ')[0]}'s, burying the secret.`,'muted'); render();
  }));
  opts.push(O('🏥','See a doctor about options','your choice',0,()=>{ closeSheet(); openPrenatalOptions(p); }));
  opts.push(O('😶','Come clean to your partner','honest, painful',0,()=>{ closeSheet();
    spouse.bond=clamp(spouse.bond-45);
    if(chance(25)){ spouse.bond=clamp(spouse.bond+10); log(`${p.first} confessed everything. Miraculously, ${spouse.name.split(' ')[0]} is willing to try to stay.`,'muted'); }
    else { doBreakup(p, spouse); log(`${p.first} confessed the affair and the pregnancy. ${spouse.name.split(' ')[0]} walked out.`,'bad'); }
    render();
  }));
  let html=`<div class="grab"></div><h3>A secret pregnancy</h3><p class="hint">${p.first} is pregnant from the affair. ${spouse.name.split(' ')[0]} doesn't know.</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

// prenatal care / abortion options (from Health tab or affair flow)
function openPrenatalOptions(p){
  closeSheet();
  if(!p.pregnant){ log(`${p.first} isn't expecting.`,'muted'); render(); return; }
  const preg=p.pregnant;
  const withinWindow = G.year <= preg.conceivedYear; // first year only
  const opts=[];
  opts.push(O('💗','Prenatal care','-$, healthier baby',0,()=>{ closeSheet();
    const c=p.insured?500:Math.min(p.money,4000); p.money-=c; setFlag(p,'prenatalCare'); p.stats.health=clamp(p.stats.health+2);
    log(`${p.first} is getting good prenatal care. Giving the baby the best start.`,'good'); render();
  }));
  if(withinWindow){
    opts.push(O('⚕️','End the pregnancy','within the window',0,()=>{ closeSheet();
      const c=p.insured?600:Math.min(p.money,2000); p.money-=c;
      p.pregnant=null; clearFlag(p,'hidingAffairChild'); p.stats.happy=clamp(p.stats.happy-4);
      log(`${p.first} chose to end the pregnancy. A private, personal decision.`,'muted'); render();
    }));
  } else {
    opts.push(OH('Too far along now — the pregnancy will continue to term.'));
  }
  let html=`<div class="grab"></div><h3>Your pregnancy</h3><p class="hint">Conceived ${G.year-preg.conceivedYear===0?'this year':'last year'}${preg.fromAffair?' · from the affair':''}</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}


function openPartnerHistory(p){
  closeSheet();
  let html=`<div class="grab"></div><h3>${p.first}'s past loves</h3><p class="hint">Everyone who left a mark.</p>`;
  const icon={'Spouse':'❤️','Partner':'💕','Ex-spouse':'💔','Late spouse':'🕯','Fling':'🔥'};
  // include current spouse/partner from rels too
  const current=p.rels.filter(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
  current.forEach(r=>{
    html+=`<div class="rel"><div class="av">${icon[r.kind]||'💕'}</div>
      <div class="rinfo"><div class="rn">${r.name}</div><div class="rd">${r.kind==='Spouse'?'Married — current':'Together now'}</div></div></div>`;
  });
  [...p.partnerHistory].reverse().forEach(h=>{
    const span = h.to&&h.to!==h.from ? `${h.from}–${h.to}` : `${h.from}`;
    const kidStr = h.kids? ` · ${h.kids} child${h.kids>1?'ren':''}` : '';
    html+=`<div class="rel"><div class="av">${icon[h.status]||'💔'}</div>
      <div class="rinfo"><div class="rn">${h.name}</div><div class="rd">${h.status} · ${span}${kidStr}</div></div></div>`;
  });
  if(!current.length && !p.partnerHistory.length) html+=`<p class="hint">No history yet.</p>`;
  sheet(html);
}
function relEmoji(r){
  if(r.kind==='Spouse'||r.kind==='Partner')return '❤️';
  if(r.kind==='Child')return r.sex==='m'?'👦':r.sex==='f'?'👧':'🧒';
  if(r.kind==='Mother')return '👩';
  if(r.kind==='Father')return '👨';
  if(r.kind==='Ex-spouse')return '💔';
  if(/-in-law/.test(r.kind))return r.sex==='f'?'👵':'👴';
  if(r.kind==='Friend')return '🙋';
  if(/Sister|Brother|Sibling/.test(r.kind))return '🧑';
  return '🙂';
}

function doDate(p){
  closeSheet();
  if(p.stats.looks+p.stats.happy < 40 && chance(50)){ log(`${p.first} tried to meet someone. It didn't click this time.`,'muted'); render(); return; }
  const sx=partnerSex(p); const partner={name:newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:45+rnd(30),alive:true,id:nid()};
  p.rels.push(partner); p.stats.happy=clamp(p.stats.happy+8);
  log(`${p.first} started seeing ${partner.name.split(' ')[0]}.`,'good'); render();
}
function recordPartner(p, rel, status, kids){
  // find existing history entry for this rel id, or create one
  let h=p.partnerHistory.find(x=>x.id===rel.id);
  if(!h){ h={id:rel.id, name:rel.name, sex:rel.sex, from:G.year, to:null, status, kids:kids||0}; p.partnerHistory.push(h); }
  else { h.status=status; if(status!=='Spouse'&&status!=='Partner') h.to=G.year; if(kids!=null) h.kids=kids; }
  return h;
}
function doMarry(p){
  closeSheet();
  const partner=p.rels.find(r=>r.kind==='Partner'&&r.alive);
  if(!partner)return;
  if(partner.bond<40 && chance(60)){ log(`${p.first} proposed. ${partner.name.split(' ')[0]} said no.`,'bad'); partner.bond=clamp(partner.bond-15); render(); return; }
  // partner's wealth/profession is implied; estimate if they "out-earn" the player for prenup framing
  const partnerWealthier = chance(40); // some partners come in with more
  const pf=partner.name.split(' ')[0], pl=partner.name.split(' ').slice(1).join(' ')||p.last;
  root.innerHTML=`
  <div class="scrim center">
    <div class="cmodal">
      <div style="text-align:center;font-size:38px;margin-bottom:2px">💍</div>
      <h2 style="text-align:center">Marrying ${pf}</h2>
      <p style="text-align:center;color:var(--ink-dim);font-size:13px">A few decisions before the big day.</p>
      <div style="margin-top:10px;font-size:12px;color:var(--ink-dim)">Surnames</div>
      <div id="snamepick" style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
        <button class="btn ghost snopt sel" data-s="keep" style="margin-top:0;border-color:var(--gold)">Both keep your own names</button>
        <button class="btn ghost snopt" data-s="theirs" style="margin-top:0">${p.first} takes "${pl}"</button>
        <button class="btn ghost snopt" data-s="mine" style="margin-top:0">${pf} takes "${p.last}"</button>
      </div>
      <div style="margin-top:12px;font-size:12px;color:var(--ink-dim)">Prenuptial agreement ${partnerWealthier?'· <span style="color:var(--gold)">'+pf+' appears to be the wealthier partner</span>':''}</div>
      <div id="prenuppick" style="display:flex;gap:6px;margin-top:6px">
        <button class="btn ghost propt sel" data-p="no" style="margin-top:0;flex:1;border-color:var(--gold)">No prenup</button>
        <button class="btn ghost propt" data-p="yes" style="margin-top:0;flex:1">Sign a prenup</button>
      </div>
      <p id="prenote" style="font-size:11px;color:var(--ink-faint);margin-top:6px">A prenup protects each person's assets if the marriage ends — but raising it can sting.</p>
      <button class="btn gold" id="domarry" style="margin-top:12px">Say "I do"</button>
      <button class="btn ghost" id="cancelmarry" style="margin-top:6px">Not yet</button>
    </div>
  </div>`;
  let surname='keep', prenup='no';
  root.querySelectorAll('.snopt').forEach(b=>{ b.onclick=()=>{ surname=b.dataset.s; root.querySelectorAll('.snopt').forEach(x=>{x.classList.remove('sel');x.style.borderColor='var(--line)';}); b.classList.add('sel'); b.style.borderColor='var(--gold)'; }; });
  root.querySelectorAll('.propt').forEach(b=>{ b.onclick=()=>{ prenup=b.dataset.p; root.querySelectorAll('.propt').forEach(x=>{x.classList.remove('sel');x.style.borderColor='var(--line)';}); b.classList.add('sel'); b.style.borderColor='var(--gold)'; }; });
  $('#cancelmarry').onclick=()=>{ root.innerHTML=''; render(); };
  $('#domarry').onclick=()=>{
    root.innerHTML='';
    partner.kind='Spouse'; partner.bond=clamp(partner.bond+15); p.married=true;
    // surname handling
    if(surname==='theirs'){ p.last=pl; }
    else if(surname==='mine'){ partner.name=pf+' '+p.last; }
    p.partnerName=partner.name;
    // prenup
    p.prenup = prenup==='yes';
    if(prenup==='yes'){ partner.bond=clamp(partner.bond-6); }
    recordPartner(p, partner, 'Spouse');
    const cost=4000+rnd(20000); p.money-=Math.min(p.money,cost);
    p.stats.happy=clamp(p.stats.happy+14);
    log(`${p.first} married ${pf}${p.prenup?' (prenup signed)':''}. A good day.`,'big'); render();
  };
}
function makeChild(p, opts={}){
  const csx=makeSex();
  const child=blankPerson({ first:newFirst(csx), last:p.last, sex:csx, gen:p.gen+1, born:G.year, age:opts.age||0, parentIds:[p.id] });
  if(opts.adopted){
    child.stats.smarts=clamp(45+rnd(45));
    child.stats.looks=clamp(40+rnd(45));
  } else {
    child.stats.smarts=clamp((p.stats.smarts+(50+rnd(30)))/2);
    child.stats.looks=clamp((p.stats.looks+(40+rnd(40)))/2);
    if(p.traits.length) child.traits=[pick(p.traits), pick(TRAITS).k].filter((v,i,a)=>a.indexOf(v)===i);
    // heritable acquired traits have a chance to pass down
    if(p.acqTraits && p.acqTraits.length){
      p.acqTraits.forEach(tk=>{ const t=ACQ(tk); if(t&&t.heritable&&chance(40)) addTrait(child,tk,true); });
    }
  }
  child.adopted=!!opts.adopted;
  child.fromFling=!!opts.fling;
  if(opts.otherParent) child.otherParent=opts.otherParent;
  // POWER INHERITANCE: a child inherits the COMBINED powers of both parents (the bloodline accumulates).
  // Adopted children don't inherit the bloodline's powers.
  if(!opts.adopted){
    const inherited=new Set(p.powers||[]);
    // the other parent (a partner rel) may carry powers too
    const mate=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
    if(mate && mate.powers) mate.powers.forEach(pw=>inherited.add(pw));
    if(opts.otherPowers) opts.otherPowers.forEach(pw=>inherited.add(pw));
    // SYNTHESIS: holding both prerequisites auto-unlocks a third power for the heir
    let synthesized=[];
    POWER_SYNTHESIS.forEach(s=>{ if(inherited.has(s.a)&&inherited.has(s.b)&&!inherited.has(s.out)){ inherited.add(s.out); synthesized.push(s.out); } });
    if(inherited.size){ child.powers=[...inherited]; child.powersGained=0; }
    child._synthesized=synthesized;
  }
  G.people.push(child);
  p.childrenIds.push(child.id);
  const kindLabel = opts.fling ? 'Child (out of wedlock)' : 'Child';
  p.rels.push({name:child.first+' '+child.last,kind:'Child',sex:csx,bond:opts.adopted?70:opts.fling?60:80,alive:true,id:child.id, note:opts.fling?'born from a fling':null});
  return child;
}
function doBaby(p, ivf){
  closeSheet();
  const sp=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
  if(!sp){ log(`${p.first} needs a partner first.`,'muted'); render(); return; }
  if(ivf){
    if(p.money<28000){ log(`${p.first} can't afford the fertility clinic.`,'muted'); render(); return; }
    p.money-=28000;
    if(chance(45)){ log(`The IVF cycle didn't take this time. Heartbreaking, and expensive.`,'bad'); render(); return; }
  } else {
    // conception odds fall with age
    const odds = p.age<35?72:p.age<40?52:p.age<45?32:18;
    if(!chance(odds)){ log(`They tried for a child. Not this year.`,'muted'); render(); return; }
  }
  const child=makeChild(p,{});
  p.stats.happy=clamp(p.stats.happy+10);
  const sp2=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive);
  const otherLast = sp2 ? (sp2.name.split(' ').slice(1).join(' ')||null) : null;
  log(`A child was born — ${child.first} ${child.last}.`,'birth');
  if(child._synthesized&&child._synthesized.length) child._synthesized.forEach(pw=>log(`✨ The bloodline's powers combined — ${child.first} was born with ${pw}!`,'big'));
  openNameChild(p, child, otherLast);
}
function doAdopt(p){
  closeSheet();
  if(p.money<18000){ log(`${p.first} can't cover the adoption costs right now.`,'muted'); render(); return; }
  p.money-=18000;
  if(chance(20)){ log(`The adoption fell through after months of waiting. The fee was refunded.`,'bad'); p.money+=18000; render(); return; }
  // adopted children can arrive at any age 0-10
  const child=makeChild(p,{adopted:true, age:rnd(11)});
  p.stats.happy=clamp(p.stats.happy+12);
  log(`${p.first} adopted ${child.first}${child.age>0?`, age ${child.age}`:''}. A family, chosen.`,'birth');
  openNameChild(p, child, null);
}
// Mad-science blood transfusion: pass ~2/3 of the donor's powers (randomly chosen) to an adopted heir.
// Adopted children normally inherit nothing — this is the bloodline's safety valve.
function doPowerTransfusion(p){
  const adoptedRels=p.rels.filter(r=>r.kind==='Child'&&r.alive&&(findP(G,r.id)||{}).adopted);
  if(!adoptedRels.length){ log(`${p.first} has no adopted heir to transfuse.`,'muted'); render(); return; }
  if(!p.powers||!p.powers.length){ log(`${p.first} has no powers to pass on.`,'muted'); render(); return; }
  // choose the adopted heir with the strongest bond
  const heirRel=adoptedRels.sort((a,b)=>b.bond-a.bond)[0];
  const heir=findP(G,heirRel.id);
  if(!heir){ render(); return; }
  // transfer two-thirds (rounded down), randomly selected, that the heir doesn't already have
  const donorPowers=[...p.powers];
  const transferCount=Math.floor(donorPowers.length*2/3);
  // shuffle donor powers
  for(let i=donorPowers.length-1;i>0;i--){ const j=rnd(i+1); [donorPowers[i],donorPowers[j]]=[donorPowers[j],donorPowers[i]]; }
  if(!heir.powers) heir.powers=[];
  const before=heir.powers.length;
  let added=[];
  for(const pw of donorPowers){
    if(added.length>=transferCount) break;
    if(!heir.powers.includes(pw)){ heir.powers.push(pw); added.push(pw); }
  }
  // synthesis can trigger on the heir from their new combined set
  let synth=[];
  POWER_SYNTHESIS.forEach(s=>{ if(heir.powers.includes(s.a)&&heir.powers.includes(s.b)&&!heir.powers.includes(s.out)){ heir.powers.push(s.out); synth.push(s.out); } });
  setFlag(p,'transfusedHeir');
  if(added.length){
    log(`🩸 ${p.first} transfused ${added.length} of their ${donorPowers.length} powers into ${heir.first} — the adopted heir now carries the bloodline's gifts.`,'big');
    synth.forEach(pw=>log(`✨ The transfused powers combined — ${heir.first} gained ${pw}!`,'big'));
  } else {
    log(`${heir.first} already carried everything ${p.first} could give.`,'muted');
  }
  render();
}

