"use strict";
/* Threadbare · split module: 13-prison-events.js  (lines 4485–4651 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   PRISON WORLD — a separate set of interactive events that only
   fire while locked up. Build a rep, run rackets, even run the yard.
   ============================================================ */
const PRISON_EVENTS=[
  { id:'pr_firstday', emoji:'⛓️', title:'First day inside', once:true,
    when:p=>true, weight:5,
    body:p=>`The gates close behind ${p.first}. The whole yard is watching the new arrival.`,
    choices:[
      {label:'Keep your head down', sub:'safe, low rep', effect:p=>{ fx(p,{happy:-4}); return `${p.first} stayed quiet and out of the way. Survival mode.`;}},
      {label:'Stand tall, show no fear', sub:'+rep, risky', effect:p=>{ if(p.stats.athletic>50||chance(50)){ p.prisonRep=clamp((p.prisonRep||0)+15); fx(p,{happy:2}); return `${p.first} met every stare head-on. The yard took note.`;} fx(p,{health:-10}); return `${p.first} got tested immediately and beaten. A hard welcome.`;}},
      {label:'Find the toughest crew', sub:'seek protection', effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)+6); setFlag(p,'prisonGang'); return `${p.first} aligned with a crew for protection. Nothing's free in here.`;}},
    ]},
  { id:'pr_shakedown', emoji:'💰', title:'Protection money', 
    when:p=>(p.prisonRep||0)<60, weight:3,
    body:p=>`A hulking inmate corners ${p.first}: pay up for "protection," or else.`,
    choices:[
      {label:'Pay them off', sub:'-commissary', effect:p=>{ fx(p,{money:-200,happy:-3}); return `${p.first} paid. Safe for now, but marked as a target.`;}},
      {label:'Refuse and fight', sub:'+rep, risk', effect:p=>{ if(p.stats.athletic>55||chance(45)||(p.powers&&p.powers.length)){ p.prisonRep=clamp((p.prisonRep||0)+20); fx(p,{happy:4}); return `${p.first} dropped them in front of everyone. Nobody shakes ${p.first} down now.`;} fx(p,{health:-16}); return `${p.first} lost the fight badly. The whole block saw.`;}},
      {label:'Report to a guard', sub:'-rep, snitch', effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)-15); setFlag(p,'snitch'); return `${p.first} told a guard. The label "snitch" is dangerous currency in here.`;}},
    ]},
  { id:'pr_contraband', emoji:'📦', title:'A smuggling chance', 
    when:p=>(p.prisonRep||0)>=15, weight:3,
    body:p=>`${p.first} is offered a cut to help move contraband through the block.`,
    choices:[
      {label:'Run a smuggling network', sub:'+money, +rep, risk', effect:p=>{ if(chance(25)){ p.prisonYears+=1+rnd(2); fx(p,{happy:-6}); return `${p.first} got caught. Time added, thrown in solitary.`;} const take=300+rnd(2000); fx(p,{money:take}); p.prisonRep=clamp((p.prisonRep||0)+12); setFlag(p,'prisonNetwork'); return `${p.first} now runs goods through the block — ${money(take)} and rising influence.`;}},
      {label:'Just be a customer', sub:'small comfort', effect:p=>{ fx(p,{money:-100,happy:4}); return `${p.first} bought a few comforts to make the time easier.`;}},
      {label:'Stay clean', sub:'+parole odds', effect:p=>{ setFlag(p,'modelInmate'); fx(p,{happy:1}); return `${p.first} kept their nose clean. The parole board likes that.`;}},
    ]},
  { id:'pr_education', emoji:'📚', title:'Prison education program', 
    when:p=>true, weight:2.5,
    body:p=>`The prison offers a chance to study — earn a degree, learn a trade, better yourself.`,
    choices:[
      {label:'Get your degree', sub:'+smarts, +parole', effect:p=>{ fx(p,{smarts:8}); setFlag(p,'modelInmate'); if(p.edu<2)p.edu=2; return `${p.first} hit the books hard and earned a real education inside.`;}},
      {label:'Learn a trade', sub:'+a skill', effect:p=>{ fx(p,{smarts:4,health:2}); setFlag(p,'prisonTrade'); return `${p.first} learned a trade that'll mean a job on the outside.`;}},
      {label:'Hit the weights instead', sub:'+athletic', effect:p=>{ fx(p,{athletic:7,health:3}); p.prisonRep=clamp((p.prisonRep||0)+5); return `${p.first} got seriously strong in the yard.`;}},
    ]},
  { id:'pr_riot', emoji:'🔥', title:'The yard erupts', 
    when:p=>(p.prisonRep||0)>=10, weight:2,
    body:p=>`A full-scale riot breaks out. Chaos everywhere. ${capFirst(p.first)} has to choose fast.`,
    choices:[
      {label:'Lead the riot', sub:'+big rep, +big risk', effect:p=>{ if(chance(40)){ p.prisonYears+=2+rnd(4); fx(p,{health:-12}); p.record.push('Prison riot'); return `${p.first} led the charge — and paid for it. More years, more scars.`;} p.prisonRep=clamp((p.prisonRep||0)+30); fx(p,{fame:4}); return `${p.first} led the riot and emerged a legend of the block.`;}},
      {label:'Protect a weaker inmate', sub:'+rep, +honor', effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)+12); fx(p,{health:-6}); setFlag(p,'prisonHonor'); return `${p.first} shielded someone who couldn't defend themselves. Respect earned the right way.`;}},
      {label:'Hide until it blows over', sub:'safe', effect:p=>{ fx(p,{happy:-4}); return `${p.first} waited it out in a supply closet. Smart, if not glorious.`;}},
    ]},
  { id:'pr_takeover', emoji:'👑', title:'Run the whole prison', once:true,
    when:p=>(p.prisonRep||0)>=70&&p.prisonRole!=='shotcaller', weight:4,
    body:p=>`${p.first}'s reputation is now towering. The old shot-caller is gone. The block could be ${p.first}'s to rule.`,
    choices:[
      {label:'Seize control of the yard', sub:'become the boss', effect:p=>{ p.prisonRole='shotcaller'; p.prisonRep=100; fx(p,{fame:6}); worldEvent(p,`${p.first} became the undisputed boss of the prison.`,{fear:true}); return `${p.first} runs this place now. Guards included. The throne behind bars.`;}},
      {label:'Stay a respected loner', sub:'+peace', effect:p=>{ fx(p,{happy:4}); return `${p.first} earned respect but wanted no crown. Left alone, finally.`;}},
    ]},
  { id:'pr_boss_racket', emoji:'🤝', title:'Empire behind bars', 
    when:p=>p.prisonRole==='shotcaller', weight:3,
    body:p=>`As the one who runs the block, ${p.first} can expand the operation.`,
    choices:[
      {label:'Run the whole prison economy', sub:'+big money', effect:p=>{ const take=2000+rnd(8000); fx(p,{money:take}); return `${p.first}'s rackets cleared ${money(take)} this quarter. The block pays tribute.`;}},
      {label:'Order a hit on a rival', sub:'ruthless, risk', effect:p=>{ if(chance(30)){ p.prisonYears+=5+rnd(5); p.record.push('Murder (prison)'); fx(p,{happy:-6}); return `It was traced back to ${p.first}. The sentence just got much longer.`;} p.prisonRep=100; setFlag(p,'ruthless'); return `${p.first}'s rival vanished. No one questions the boss now.`;}},
      {label:'Corrupt a guard', sub:'+freedom inside', effect:p=>{ const c=Math.min(p.money,3000); fx(p,{money:-c}); setFlag(p,'ownsGuard'); return `${p.first} has a guard on payroll now. Cell phone, better food, looking the other way.`;}},
    ]},
  { id:'pr_visitor', emoji:'👨‍👩‍👧', title:'A visitor', 
    when:p=>p.rels.some(r=>(r.kind==='Spouse'||r.kind==='Child'||r.kind==='Partner'||/Mother|Father/.test(r.kind))&&r.alive), weight:2.5,
    body:p=>{const v=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Child'||r.kind==='Partner'||/Mother|Father/.test(r.kind))&&r.alive); return `${v.name.split(' ')[0]} has come to visit ${p.first} behind the glass.`;},
    choices:[
      {label:'Pour your heart out', sub:'+bond, +joy', effect:p=>{ const v=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Child'||r.kind==='Partner'||/Mother|Father/.test(r.kind))&&r.alive); if(v)v.bond=clamp(v.bond+12); fx(p,{happy:8}); return `${p.first} and ${v?v.name.split(' ')[0]:'they'} had a real moment. It helps, in here.`;}},
      {label:'Push them away to protect them', sub:'-bond, +noble', effect:p=>{ const v=p.rels.find(r=>(r.kind==='Spouse'||r.kind==='Child'||r.kind==='Partner'||/Mother|Father/.test(r.kind))&&r.alive); if(v)v.bond=clamp(v.bond-10); fx(p,{happy:-6}); return `${p.first} told them not to come back. Better they move on, ${p.first} thinks.`;}},
    ]},
  { id:'pr_parole_prep', emoji:'⚖️', title:'Parole hearing approaches', 
    when:p=>!p.lifeSentence&&p.prisonYears<=3&&p.prisonYears>0, weight:3,
    body:p=>`${p.first} has a parole hearing coming up. How they present themselves matters.`,
    choices:[
      {label:'Show genuine remorse', sub:'+parole odds', effect:p=>{ if(hasFlag(p,'modelInmate')||chance(55)){ p.prisonYears=Math.max(0,p.prisonYears-2); fx(p,{happy:6}); return `The board was moved. ${p.first}'s sentence was shortened.`;} fx(p,{happy:-3}); return `The board wasn't convinced this time.`;}},
      {label:'Stay defiant', sub:'-parole, +rep', effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)+8); fx(p,{happy:1}); return `${p.first} refused to grovel. The block respects it; the board doesn't.`;}},
    ]},
  // ===== DANGER & VIOLENCE =====
  { id:'pr_shanking', emoji:'🔪', title:'A shank in the dark', 
    when:p=>(p.prisonRep||0)>=10, weight:2.5,
    body:p=>`${p.first} is jumped in a blind spot — a sharpened blade flashing toward them.`,
    choices:[
      {label:'Fight for your life', sub:'survival', effect:p=>{ const survive = p.stats.athletic>55 || p.traits.includes('tough') || (p.powers&&p.powers.length) || chance(55); if(survive){ p.prisonRep=clamp((p.prisonRep||0)+22); seed(p,2,'thick_skin'); if(chance(40))addTrait(p,'brave'); return `${p.first} turned the blade on their attacker and walked away bloodied but alive. The block is terrified now.`;} fx(p,{health:-35}); seed(p,1,'near_death'); return `${p.first} was stabbed and nearly bled out in the yard. They survived — barely.`;}},
      {label:'Take the hit and remember the face', sub:'+vengeance', effect:p=>{ fx(p,{health:-20}); setFlag(p,'holdsGrudge'); seed(p,3,'prison_revenge'); return `${p.first} took the wound and said nothing — but they know exactly who did it. Revenge will come.`;}},
      {label:'Call in your crew for protection', sub:'+gang debt', need:p=>hasFlag(p,'prisonGang')||p.minions>0, effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)+10); setFlag(p,'owesGang'); return `${p.first}'s people closed ranks around them. Safe — but the debt will be called in.`;}},
    ]},
  { id:'pr_witness', emoji:'🤐', title:'A witness problem', 
    when:p=>(p._wasCrime||p.job==='crimelord'||p.job==='villain'||(p.prisonRep||0)>=25), weight:2,
    body:p=>`Word comes down: an inmate on the block is a witness set to testify against ${p.first}'s organization. The boss outside wants it handled.`,
    choices:[
      {label:'Order them silenced', sub:'ruthless, risk', effect:p=>{ if(chance(28)){ p.prisonYears+=6+rnd(6); p.record.push('Murder (prison)'); fx(p,{happy:-6}); return `It got traced back. ${p.first}'s sentence ballooned — but the witness is gone.`;} p.prisonRep=clamp((p.prisonRep||0)+25); setFlag(p,'ruthless'); setFlag(p,'madeBones'); addTrait(p,'hot_temper',true); return `The witness never made it to the stand. ${p.first}'s name now carries real weight in the underworld.`;}},
      {label:'Do it yourself', sub:'+terrifying rep, +risk', effect:p=>{ if(chance(35)){ p.prisonYears+=8+rnd(8); p.lifeSentence=p.lifeSentence||chance(30); p.record.push('Murder (prison)'); return `${p.first} was caught red-handed. The walls just got a lot more permanent.`;} p.prisonRep=100; setFlag(p,'madeBones'); setFlag(p,'coldBlooded'); addTrait(p,'brave'); return `${p.first} handled it personally. After this, even the lifers step aside when they pass.`;}},
      {label:'Refuse — you\'re no killer', sub:'+conscience, -underworld rep', effect:p=>{ fx(p,{happy:4}); p.prisonRep=clamp((p.prisonRep||0)-10); clearFlag(p,'madeBones'); setFlag(p,'hasLimits'); return `${p.first} wouldn't cross that line. The organization noted it — weakness, to them.`;}},
    ]},
  { id:'pr_guard_turn', emoji:'👮', title:'A guard who can be bought', 
    when:p=>(p.prisonRep||0)>=20||p.money>=5000, weight:2,
    body:p=>`A guard has money troubles, and ${p.first} can smell it. The right approach could turn them.`,
    choices:[
      {label:'Bribe them onto your payroll', sub:'-$, +control', effect:p=>{ const c=Math.min(p.money,5000); if(p.money<2000){fx(p,{happy:-2});return `${p.first} couldn't put together enough to make it worth the guard's risk.`;} fx(p,{money:-c}); setFlag(p,'ownsGuard'); p.prisonRep=clamp((p.prisonRep||0)+10); return `The guard works for ${p.first} now — phones, contraband, blind eyes, and intel on every transfer.`;}},
      {label:'Blackmail them', sub:'leverage, risk', effect:p=>{ if(p.stats.smarts>55||chance(50)){ setFlag(p,'ownsGuard'); setFlag(p,'blackmailer'); p.prisonRep=clamp((p.prisonRep||0)+14); return `${p.first} dug up the guard's secret and owns them completely now. Cheaper than a bribe.`;} fx(p,{health:-8}); p.prisonYears+=1; return `The guard called the bluff and ${p.first} caught a beating and a write-up.`;}},
      {label:'Recruit them for the outside', sub:'+future asset', effect:p=>{ if(chance(45)){ setFlag(p,'ownsGuard'); setFlag(p,'corruptContact'); return `${p.first} convinced the guard to join the organization for good. A loyal man on the outside, waiting.`;} return `The guard wasn't ready to go that far. Yet.`;}},
    ]},
  { id:'pr_crew_arrives', emoji:'🚐', title:'One of your own gets sent up', once:true,
    when:p=>(p.job==='crimelord'||p.job==='villain'||p.minions>0||p.henchman)&&(p.prisonRep||0)>=15, weight:2.5,
    body:p=>{ const who=p.henchman?p.henchman.name.split(' ')[0]:'one of the crew'; return `A fresh transfer walks onto the block — it's ${who}, busted on a separate charge. Now they're inside with ${p.first}.`;},
    choices:[
      {label:'Reunite and run the block together', sub:'+power inside', effect:p=>{ p.prisonRep=clamp((p.prisonRep||0)+20); p.minions=(p.minions||0)+1; p.minionPower=clamp((p.minionPower||0)+6); setFlag(p,'crewInside'); return `With muscle ${p.first} trusts inside, the two of them start carving up the prison economy.`;}},
      {label:'Use them to send a message outside', sub:'+reach', effect:p=>{ setFlag(p,'crewInside'); p.prisonRep=clamp((p.prisonRep||0)+10); return `${p.first} now has a courier between the block and the streets. The operation never stopped running.`;}},
      {label:'Keep your distance — too much heat', sub:'+caution', effect:p=>{ fx(p,{happy:-1}); return `${p.first} kept it cool. Two known associates together draws the wrong attention.`;}},
    ]},
  { id:'pr_recruit_inside', emoji:'🧑‍🤝‍🧑', title:'Talent on the inside', 
    when:p=>(p.prisonRep||0)>=35, weight:2,
    body:p=>`A sharp, dangerous young inmate is getting out soon and looking for a future. ${capFirst(p.first)} could put them to work.`,
    choices:[
      {label:'Recruit them to your crew', sub:'+minion on release', effect:p=>{ p.minions=(p.minions||0)+1; p.minionPower=clamp((p.minionPower||0)+5); setFlag(p,'recruitedInside'); return `${p.first} brought them into the fold. When they walk free, they'll be working for ${p.first}.`;}},
      {label:'Groom them as a lieutenant', sub:'+loyal enforcer', effect:p=>{ if(!p.henchman){ p.henchman={name:villainName(),loyalty:80}; return `${p.first} forged a hardened loyalist in ${p.henchman.name}. A right hand made in hell.`;} p.minionPower=clamp((p.minionPower||0)+8); return `${p.first} sharpened a promising soldier into a true enforcer.`;}},
      {label:'Pass — trust no one', sub:'+caution', effect:p=>{ return `${p.first} keeps their circle small. Trust gets you killed in here.`;}},
    ]},
  { id:'pr_revenge', emoji:'🩸', title:'Settling a score', 
    when:p=>hasFlag(p,'holdsGrudge'), weight:3,
    body:p=>`The inmate who came at ${p.first} before is alone in the laundry. No cameras. No witnesses.`,
    choices:[
      {label:'Take your revenge', sub:'+fearsome rep', effect:p=>{ clearFlag(p,'holdsGrudge'); if(chance(20)){ p.prisonYears+=4+rnd(4); p.record.push('Assault (prison)'); return `${p.first} got their payback but caught the charge. Worth it, some would say.`;} p.prisonRep=clamp((p.prisonRep||0)+25); setFlag(p,'coldBlooded'); addTrait(p,'hot_temper',true); return `${p.first} repaid the debt in full. The whole block learned what happens when you cross them.`;}},
      {label:'Let it go', sub:'+wisdom', effect:p=>{ clearFlag(p,'holdsGrudge'); fx(p,{happy:4,stress:-8}); return `${p.first} chose to let the grudge die. Some weights aren't worth carrying.`;}},
    ]},
  { id:'pr_solitary', emoji:'🕳️', title:'Thrown in solitary', 
    when:p=>(p.prisonRep||0)>=30, weight:1.6,
    body:p=>`After an incident, ${p.first} is dragged to solitary confinement. Weeks of silence and concrete await.`,
    choices:[
      {label:'Harden your mind', sub:'+resolve', effect:p=>{ fx(p,{happy:-8,health:-4}); p.prisonRep=clamp((p.prisonRep||0)+12); if(chance(45))addTrait(p,'tough'); seed(p,2,'thick_skin'); return `${p.first} came out of the hole colder and harder than they went in. Nothing rattles them now.`;}},
      {label:'It nearly breaks you', sub:'-health', effect:p=>{ fx(p,{health:-10,happy:-15,stress:20}); if(chance(30))addTrait(p,'anxious',true); return `The isolation gnawed at ${p.first}'s mind. They were never quite the same.`;}},
    ]},
  { id:'pr_kingpin_summons', emoji:'🚬', title:'The old kingpin\'s offer', once:true,
    when:p=>(p.prisonRep||0)>=45&&p.prisonRole!=='shotcaller', weight:2.5,
    body:p=>`A legendary aging crime boss, decades into a life sentence, summons ${p.first} to his table. He sees potential.`,
    choices:[
      {label:'Become his protégé', sub:'+underworld mastery', effect:p=>{ fx(p,{smarts:6}); p.prisonRep=clamp((p.prisonRep||0)+20); setFlag(p,'kingpinProtege'); addTrait(p,'sly',true); seed(p,3,'underworld_connections'); return `The old boss taught ${p.first} everything — the contacts, the codes, the cold arithmetic of power. A master's education in crime.`;}},
      {label:'Challenge his authority', sub:'bold, dangerous', effect:p=>{ if((p.prisonRep||0)>60&&chance(50)){ p.prisonRole='shotcaller'; p.prisonRep=100; setFlag(p,'tookTheThrone'); return `${p.first} faced the old lion down and took everything he had. A new boss is crowned in blood and nerve.`;} fx(p,{health:-20}); p.prisonRep=clamp((p.prisonRep||0)-15); return `${p.first} overreached. The old man's people made an example of them.`;}},
      {label:'Decline respectfully', sub:'+safe', effect:p=>{ fx(p,{happy:2}); return `${p.first} bowed out gracefully. The old boss respected the honesty, at least.`;}},
    ]},
  { id:'pr_gang_war', emoji:'⚔️', title:'Gang war on the block', 
    when:p=>(hasFlag(p,'prisonGang')||p.prisonRole==='shotcaller')&&(p.prisonRep||0)>=25, weight:2,
    body:p=>`Two factions are about to go to war across the whole prison. ${capFirst(p.first)} is deep enough in to shape what happens.`,
    choices:[
      {label:'Lead your side to victory', sub:'+control, +risk', effect:p=>{ if(chance(55)){ p.prisonRep=clamp((p.prisonRep||0)+30); setFlag(p,'wonGangWar'); if(p.prisonRole!=='shotcaller'&&(p.prisonRep||0)>=80){p.prisonRole='shotcaller';} return `${p.first} led their faction to total victory. The block has one master now.`;} fx(p,{health:-25}); p.prisonYears+=2+rnd(3); return `The war went badly. ${p.first} survived, but bloodied, with time added.`;}},
      {label:'Broker a truce', sub:'+respect, +smarts', effect:p=>{ if(p.stats.smarts>50||chance(50)){ p.prisonRep=clamp((p.prisonRep||0)+18); setFlag(p,'powerBroker'); fx(p,{smarts:4}); return `${p.first} sat both sides down and brokered peace. The kind of power that outlasts muscle.`;} return `The truce talks collapsed. At least ${p.first} stayed out of the worst of it.`;}},
      {label:'Stay out of it', sub:'safe', effect:p=>{ fx(p,{happy:-2}); return `${p.first} kept clear of the bloodshed. Survival over glory.`;}},
    ]},
];
function rollPrisonEvent(p){
  if(!p.alive || !p.inPrison) return null;
  const pool=PRISON_EVENTS.filter(ev=>{ if(ev.once&&p.seenEvents.includes(ev.id))return false; try{return ev.when(p);}catch(e){return false;} });
  if(!pool.length) return null;
  let total=pool.reduce((s,e)=>s+(e.weight||1),0), r=Math.random()*total;
  for(const ev of pool){ r-=(ev.weight||1); if(r<=0) return ev; }
  return pool[0];
}
function prisonQuarterEvent(p){
  const pool=[
    ()=>log(`${p.first} marked another quiet day off the calendar.`,'muted'),
    ()=>{p.stats.health=clamp(p.stats.health-2);log(`The food in here is taking its toll on ${p.first}.`,'muted');},
    ()=>{p.stats.athletic=clamp(p.stats.athletic+3);log(`${p.first} spent the season in the weight pile.`,'good');},
    ()=>{p.stats.happy=clamp(p.stats.happy-3);log(`The monotony wore on ${p.first} this season.`,'muted');},
    ()=>{p.stats.smarts=clamp(p.stats.smarts+2);log(`${p.first} read everything in the prison library.`,'good');},
  ];
  if((p.prisonRep||0)>40) pool.push(()=>{log(`${p.first} commands real respect in the yard now.`,'good');});
  if(hasFlag(p,'prisonNetwork')) pool.push(()=>{const t=100+rnd(600);p.money+=t;log(`${p.first}'s prison hustle brought in ${money(t)}.`,'good');});
  pick(pool)();
}

