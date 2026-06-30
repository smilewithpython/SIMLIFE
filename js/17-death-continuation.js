"use strict";
/* Threadbare · split module: 17-death-continuation.js  (lines 5121–5308 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   DEATH + CONTINUATION
   ============================================================ */
function deathRoll(p){
  let risk = 0.2;
  if(p.age>55) risk += (p.age-55)*0.45;
  if(p.age>80) risk += (p.age-80)*1.4;
  risk += (60 - p.stats.health)*0.06;
  if(p.traits.includes('tough')) risk*=0.8;
  if(p.traits.includes('lucky')) risk*=0.7;
  if(p.stats.health<=0) risk=100;
  if(chance(clamp(risk,0,100))){
    die(p); return true;
  }
  return false;
}
function die(p){
  p.alive=false; p.deathAge=p.age;
  // liquidate assets into the estate
  const assetVal = p.assets.reduce((s,a)=>s+(a.value||0),0);
  const portVal = p.portfolio? ((p.portfolio.low||0)+(p.portfolio.med||0)+(p.portfolio.high||0)):0;
  const bizVal = (p.businesses||[]).reduce((s,b)=>s+(b.value||0),0);
  p.estate = Math.max(0, p.money + assetVal + portVal + bizVal);
  const cause = p._causeOfDeath ? p._causeOfDeath
    : p.inPrison ? 'died behind bars'
    : p.stats.health<=0 ? 'failing health'
    : p.age>78 ? pick(['old age','a peaceful sleep','a long life well-lived'])
    : pick(['an accident','a sudden illness','a heart that simply stopped','bad luck on an ordinary day']);
  p.deathCause=cause;
  log(`${p.first} ${p.last} died at ${p.age}, of ${cause}.`,'death');
  const legacy = p.stats.fame>40?'Remembered far and wide.':p.childrenIds.length?'Survived by family.':p.pets.filter(x=>x.alive).length?'Survived only by a loyal pet.':'Mourned by few, missed by some.';
  log(legacy,'muted');
  G.cur=null;
  setTimeout(()=>deathScreen(p),700);
}

function isCloseRelative(p, other){
  // the player's own children, and the children of those children (grandchildren)
  if(p.childrenIds.includes(other.id)) return true;
  for(const cid of p.childrenIds){ const c=findP(G,cid); if(c && (c.childrenIds||[]).includes(other.id)) return true; }
  return false;
}
function pruneTree(p){
  // keep the tree from ballooning: cap total people, dropping the least-relevant dead ones first.
  const CAP=140;
  if(G.people.length<=CAP) return;
  // never remove: the player, anyone alive, the player's direct children & grandchildren,
  // or the player's ancestral line (parents chain via parentIds isn't stored as people, so just protect by gen<=player)
  const protectedIds=new Set([p.id]);
  p.childrenIds.forEach(id=>{ protectedIds.add(id); const c=findP(G,id); if(c)(c.childrenIds||[]).forEach(g=>protectedIds.add(g)); });
  // candidates to remove: dead, not protected, older generations far from the player
  const removable=G.people.filter(x=>!x.alive && !protectedIds.has(x.id))
    .sort((a,b)=> (a.gen-b.gen) || ((a.deathAge||0)-(b.deathAge||0)) ); // oldest gens first
  let toRemove=G.people.length-CAP;
  const removeIds=new Set();
  for(const x of removable){ if(toRemove<=0)break; removeIds.add(x.id); toRemove--; }
  if(removeIds.size){
    G.people = G.people.filter(x=>!removeIds.has(x.id));
    // clean up dangling child references
    G.people.forEach(x=>{ if(x.childrenIds) x.childrenIds=x.childrenIds.filter(id=>!removeIds.has(id)); });
  }
}
// Build a recap of a life's biggest moments, achievements, and choices
function lifeSummary(p){
  const items=[];
  // peak stats / character
  const peakJob = p.job!=='none'?CAREER(p.job).l:(p._everJob||null);
  // achievements derived from flags and state
  if(p.jobTitle && p.job!=='none') items.push(`Rose to ${p.jobTitle}`);
  else if(p.job!=='none') items.push(`Worked as a ${CAREER(p.job).l}`);
  if(p.champion) items.push('Became a champion');
  if(hasFlag(p,'nbaChamp')||hasFlag(p,'superbowlChamp')||hasFlag(p,'soccerChamp')) items.push('Won a pro sports title');
  if(hasFlag(p,'aListActor')) items.push('Became an A-list movie star');
  if(p.onSocial && p.socialFollowers>100000) items.push(`Amassed ${(p.socialFollowers).toLocaleString()} followers`);
  if(p.ruler) items.push(`Ruled ${p.ruler.country} as ${p.ruler.title}`);
  if((p.livesSaved||0)>0) items.push(`Saved ${p.livesSaved.toLocaleString()} lives as a hero`);
  if(p.nemesis && p.nemesis.defeated>0) items.push(`Battled the villain ${p.nemesis.name}`);
  if((p.minions||0)>0) items.push(`Commanded a crew of ${p.minions}`);
  if(p.doomsdayLevel>=2) items.push('Held the world to ransom');
  if(hasFlag(p,'beatHomelander')) items.unshift('⚔️ DEFEATED HOMELANDER — saved the world');
  if(p.powers && p.powers.length) items.push(`Wielded powers: ${p.powers.slice(0,3).join(', ')}${p.powers.length>3?` (+${p.powers.length-3} more)`:''}`);
  if(p.prisonRole==='shotcaller') items.push('Ran a prison from the inside');
  if(hasFlag(p,'tookTheThrone')||hasFlag(p,'wonGangWar')) items.push('Ruled the cellblock by force');
  if(hasFlag(p,'madeBones')||hasFlag(p,'coldBlooded')) items.push('Earned a fearsome underworld reputation');
  if(hasFlag(p,'kingpinProtege')) items.push('Trained under a legendary crime boss');
  if((p.businesses||[]).length) items.push(`Owned ${p.businesses.length} business${p.businesses.length===1?'':'es'}`);
  if(hasFlag(p,'philanthropist')) items.push('Gave generously to those in need');
  if(hasFlag(p,'lifetimeAward')) items.push('Received a lifetime achievement award');
  if(hasFlag(p,'wroteMemoir')) items.push('Wrote a memoir of their life');
  if(hasFlag(p,'retiredInParadise')) items.push('Retired to paradise');
  if(p.pension>50000) items.push('Retired on a generous pension');
  if(hasFlag(p,'worldTraveler')) items.push('Traveled the world in retirement');
  if(hasFlag(p,'belovedElder')||hasFlag(p,'familyHistorian')) items.push('A beloved grandparent');
  if(hasFlag(p,'dynastyBuilder')) items.push('Built a family dynasty');
  if(hasFlag(p,'lifelongLove')) items.push('Shared a lifelong love');
  if(hasFlag(p,'familyGlue')) items.push('The heart that held the family together');
  if(hasFlag(p,'caregiver')) items.push('Cared for an aging parent');
  if(hasFlag(p,'foundPeace')) items.push('Made peace before the end');
  if(hasFlag(p,'olympiadChamp')) items.push('Won an academic olympiad');
  if(hasFlag(p,'nobelLaureate')) items.push('Nobel laureate');
  if(hasFlag(p,'oscarWinner')) items.push('Academy Award winner');
  if(hasFlag(p,'whistleblower')) items.push('Blew the whistle on corruption');
  if(hasFlag(p,'corrupt')||hasFlag(p,'taxCheat')||hasFlag(p,'fraudster')) items.push('Bent the rules for personal gain');
  if(p.record && p.record.length) items.push(`Criminal record: ${[...new Set(p.record)].slice(0,3).join(', ')}`);
  if(p.addictions && p.addictions.length) items.push(`Struggled with ${p.addictions.map(a=>{const d=ADDICT(a.k);return d?d.l:a.k;}).join(', ')}`);
  if(p.acqTraits && p.acqTraits.length){ const goods=p.acqTraits.map(k=>ACQ(k)).filter(t=>t&&t.good); if(goods.length) items.push(`Known for being ${goods.slice(0,2).map(t=>t.l.toLowerCase()).join(' and ')}`); }
  // relationships
  const exes=(p.partnerHistory||[]).filter(h=>h.status==='Ex-spouse'||h.status==='Affair').length;
  const marriages=(p.partnerHistory||[]).filter(h=>h.status==='Spouse'||h.status==='Ex-spouse'||h.status==='Late spouse').length;
  if(marriages>0) items.push(`Married ${marriages} time${marriages===1?'':'s'}`);
  if(exes>1) items.push('A complicated love life');
  if(p.childrenIds.length) items.push(`Raised ${p.childrenIds.length} child${p.childrenIds.length===1?'':'ren'}`);
  // pull a few of the biggest logged moments (big/birth/world events)
  const bigMoments=(p.log||[]).filter(e=>e.k==='big').map(e=>e.t);
  return { achievements: items, moments: bigMoments };
}

// The quieter ledger: the moral weight a life carried, surfaced as closing
// reflections on the death screen. These pay off the seeds planted by the
// Part 3–6 chains (rivalry, mentor, career reckonings, the cost of powers,
// the bloodline's echoes) — never announced in-life, only remembered at the end.
function lifeLegacy(p){
  const L=[], f=p.flags||{};
  // --- Part 3 — rivalry & mentor ---
  if(f.ch_rivalEnd==='peace') L.push('Made peace with their oldest rival before the end — the respect, it turned out, outlived the rivalry.');
  else if(f.ch_rivalEnd==='unresolved') L.push('Carried a rivalry all the way to the grave. Some scores are never settled, only set down.');
  if(f.ch_mentorLegacy==='protected') L.push('Guarded the memory of the mentor who shaped them — the good and the buried both — to the very last.');
  else if(f.ch_mentorLegacy==='exposed') L.push('Told the whole truth about the one who made them, gift and rot together, and let history sort it out.');
  // --- Part 4 — career reckonings ---
  if(f.cc_errorLegacy==='owned') L.push('When a life was lost on their table, chose the truth over the career — and could always meet their own eyes after.');
  else if(f.cc_errorLegacy==='stained'||f.cc_errorLegacy==='survived') L.push('A fatal error in the operating room, and the long fight to outrun it, shadowed an otherwise able career.');
  if(f.cc_mergerSoldout) L.push('Closed the deal that made a fortune and cost hundreds their livelihoods. That tradeoff followed the name to the end.');
  if(f.cc_voteAgainstConscience) L.push('Once cast a vote against their own conscience to keep a seat. The ledger of it outlived the term.');
  if(f.cc_filmProtected) L.push('Fought the studio and won — a body of work made exactly as intended, whatever it cost to protect.');
  if(f.cc_acqRegret) L.push('Sold the thing they built and watched it gutted, and wondered ever after what holding on might have meant.');
  if(f.cc_out==='clean'||f.cc_outDone&&f.cc_out!=='refused') L.push('Walked out of a life in organized crime and lived — a rarer ending than that world usually allows.');
  // --- Part 5 — the cost of power ---
  if(f.pw_mindHollow) L.push("Held a marriage together with a power instead of the truth — and knew, every quiet morning, that it wasn't real.");
  else if(f.pw_choseReal) L.push('Had the power to force a heart open and chose, instead, to let love be real or be nothing at all.');
  if(f.pw_laserGuilt) L.push("Learned young that what they carried could hurt people who'd done nothing to deserve it, and never fully set that knowledge down.");
  if(f.pw_healGrief) L.push('Could knit any wound whole but the one that mattered most. Carried that specific, private grief to the end.');
  if(f.pw_rewound) L.push('Once tore three seconds open to pull someone they loved back from death — and lived on as the only soul who remembered the world where they were gone.');
  if(f.pw_carriedMoment) L.push("Heard a dying parent's last unspoken thought, and kept it, wordless, forever.");
  if(f.pw_precogTold) L.push('Saw how their own story would end, and chose not to carry that knowing alone.');
  else if(f.pw_precogAccepted) L.push('Saw their own ending coming and met it with intention — gentler, more present, for the knowing.');
  if(f.pw_invisUsed) L.push('Used an unseen gift to learn what they should not have, and let it guide a hand that never once confessed the source.');
  // --- Part 6 — the bloodline's echoes ---
  if(f.ge_portalUsed) L.push("Picked up an ancestor's impossible, abandoned work — and finished it. For better, mostly.");
  else if(f.ge_portalDone) L.push('Closed a door an ancestor had left ajar for generations, and ended quietly what the bloodline began.');
  if(f.ge_crimeRefused) L.push('Turned down an empire that was theirs by blood, and stayed mostly clear of its long shadow.');
  // --- the recurring weight ---
  if(f.ch_carriesWeight && !f.foundPeace) L.push('Carried something heavy and unspoken for the better part of a lifetime, and told almost no one.');
  else if(f.ch_carriesWeight && f.foundPeace) L.push('Carried something heavy for most of a life — and, near the end, finally set it down.');
  return L;
}

function heirsOf(p){
  // direct children first
  const kids = p.childrenIds.map(id=>findP(G,id)).filter(k=>k&&k.alive);
  if(kids.length) return kids;
  // then grandchildren (children of the deceased's children)
  let grandkids=[];
  p.childrenIds.map(id=>findP(G,id)).filter(Boolean).forEach(child=>{
    (child.childrenIds||[]).map(gid=>findP(G,gid)).filter(g=>g&&g.alive).forEach(g=>grandkids.push(g));
  });
  if(grandkids.length) return grandkids;
  // finally, any living descendant in a later generation (nieces, cousins down the line)
  const descendants = G.people.filter(x=>x.alive && x.gen>p.gen && x.id!==p.id);
  return descendants.slice(0,6);
}
function deathScreen(deceased){
  const heirs = heirsOf(deceased);
  const estate = deceased.estate ?? deceased.money;
  const sum = lifeSummary(deceased);
  const cause = deceased._causeOfDeath || 'passed away';
  // children list (named) for the recap
  const kids = deceased.childrenIds.map(id=>findP(G,id)).filter(Boolean);
  const kidLine = kids.length? kids.map(k=>`${k.first}${k.alive?'':' (deceased)'}`).join(', ') : 'no children';

  const achHtml = sum.achievements.length
    ? `<div style="text-align:left;margin-top:14px">
         <div style="font-size:11px;color:var(--gold);letter-spacing:1.5px;font-variant:small-caps;margin-bottom:6px">A life lived</div>
         ${sum.achievements.map(a=>`<div style="font-size:13px;color:var(--ink);padding:3px 0;border-bottom:1px solid var(--line)">• ${a}</div>`).join('')}
       </div>` : '';
  const momentsHtml = sum.moments.length
    ? `<div style="text-align:left;margin-top:14px">
         <div style="font-size:11px;color:var(--gold);letter-spacing:1.5px;font-variant:small-caps;margin-bottom:6px">Defining moments</div>
         ${sum.moments.slice(-6).map(m=>`<div style="font-size:12.5px;color:var(--ink-dim);padding:3px 0;font-style:italic">${m}</div>`).join('')}
       </div>` : '';
  const leg = lifeLegacy(deceased);
  const legHtml = leg.length
    ? `<div style="text-align:left;margin-top:14px">
         <div style="font-size:11px;color:var(--gold);letter-spacing:1.5px;font-variant:small-caps;margin-bottom:6px">What they carried</div>
         ${leg.map(m=>`<div style="font-size:12.5px;color:var(--ink-dim);padding:4px 0;font-style:italic;border-bottom:1px solid var(--line)">${m}</div>`).join('')}
       </div>` : '';
  // relationships note (module 36) — the people side of the ledger
  let relHtml='';
  if(typeof relationshipObituary==='function'){
    const relLines = relationshipObituary(deceased);
    if(relLines.length){
      const joined = relLines.length>1
        ? relLines.slice(0,-1).join(', ')+', and '+relLines[relLines.length-1]
        : relLines[0];
      relHtml = `<div style="text-align:left;margin-top:14px">
         <div style="font-size:11px;color:var(--gold);letter-spacing:1.5px;font-variant:small-caps;margin-bottom:6px">Those they leave behind</div>
         <div style="font-size:12.5px;color:var(--ink-dim);padding:4px 0;font-style:italic">${deceased.first} died with ${joined}.</div>
       </div>`;
    }
  }

  root.innerHTML=`
  <div class="scrim center">
    <div class="cmodal" style="text-align:center">
      <div class="big-emoji">🕯</div>
      <h2>${deceased.first} ${deceased.last}</h2>
      <p>${deceased.born}–${G.year} · lived ${deceased.deathAge} years</p>
      <p style="color:var(--ink-dim);font-size:13px">${EDU[deceased.edu]}${deceased.job!=='none'?' · '+CAREER(deceased.job).l:''}</p>
      <p style="color:var(--ink-dim);font-size:13px">Children: ${kidLine}</p>
      <p style="color:var(--gold)">Estate worth ${money(estate)}${heirs.length?', and '+heirs.length+' to carry it on.':'.'}</p>
      ${achHtml}
      ${momentsHtml}
      ${relHtml}
      ${legHtml}
      <div id="heirpick"></div>
    </div>
  </div>`;
  const hp=$('#heirpick');
  if(heirs.length){
    hp.insertAdjacentHTML('beforeend',`<p style="margin-top:16px;color:var(--ink-dim)">Take up the thread as…</p><div class="choosecards" id="hc"></div>`);
    const inherit = Math.floor(estate/heirs.length);
    heirs.forEach(h=>{
      const c=document.createElement('button'); c.className='ccard';
      c.innerHTML=`<b>${h.first} ${h.last} · ${h.age}</b><span>${sexWord(h.sex)} · ${h.job!=='none'?CAREER(h.job).l:(h.inSchool?h.schoolLevel:'finding their way')} · inherits ${money(inherit)}</span>`;
      c.onclick=()=>{ h.money+=inherit; switchTo(h); };
      $('#hc').appendChild(c);
    });
  } else {
    hp.insertAdjacentHTML('beforeend',`<p style="margin-top:16px;color:var(--ink-dim)">The bloodline ends here. No heirs survive.</p>
    <button class="btn gold" id="ng">Begin a New Bloodline</button>`);
    $('#ng').onclick=()=>{ wipe(); creator(); };
  }
}
function switchTo(h){
  G.cur=h.id; G.gen=h.gen;
  _logShownFor=null; // force a fresh log for the new character
  log(`The thread passes to ${h.first}. ${pick(['A new chapter.','Life goes on.','The story continues.'])}`,'big');
  render(); root.innerHTML='';
}

