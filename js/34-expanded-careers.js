"use strict";
/* Threadbare · content module: 34-expanded-careers.js — PART 5: CAREER-TRACK DEPTH
   ============================================================
   One major, career-specific decision roughly every few years inside a given
   job. These ADD to the existing career system; they don't replace it.
   All are track:'career' so the picker only ever surfaces them while employed,
   and only one career-track decision can appear per quarter. Each carries a
   cat: so the cooldown (module 29) keeps them from clustering.

   Gating: we lean on p.job (the career key) + p.jobYears for "career stage,"
   since that's robust across both ladder careers (cop, corporate, lawyer,
   doctor, soldier, firefighter) and staged careers (tech, the entertainment
   set, crimelord, superhero, villain, madsci). Where a precise rung matters we
   read p._rung / p._stage, guarding for undefined.
   ============================================================ */

// --- local helpers (lean, prefixed to avoid collisions) ---
function xcStage(p){ // a rough 0..1 "how deep into this career" signal
  if(p._rung!=null && typeof CAREER==='function'){ const c=CAREER(p.job); if(c&&c.ladder) return p._rung/Math.max(1,c.ladder.length-1); }
  if(p._stage!=null && typeof CAREER==='function'){ const c=CAREER(p.job); if(c&&c.stages) return p._stage/Math.max(1,c.stages.length-1); }
  return clamp((p.jobYears||0)/20,0,1);
}
function xcSenior(p){ return xcStage(p)>=0.5 || (p.jobYears||0)>=8; }
function xcColleague(p,kind){ // a coworker NPC: reuse a friend or mint one
  let f=(p.rels||[]).find(r=>r.kind==='Friend'&&r.alive&&r._work);
  if(!f){ f=addFriend(p,'Friend'); f._work=true; f._role=kind||'colleague'; }
  return f;
}
function xcFirst(r){ return r? r.name.split(' ')[0] : 'someone'; }

const EXP_CAREER_EVENTS = [

  /* ============ POLICE (cop) ============ */
  { id:'xcc_cop_undercover', emoji:'🕶', title:'The Undercover Assignment', once:true, track:'career', cat:'cc_cop', weight:7,
    when:p=>p.job==='cop' && xcSenior(p) && p.age>=28,
    body:p=>`They want ${p.first} to go under — a new name, months away, no contact with the people who keep ${p.first} human. The case needs it. The marriage might not survive it.`,
    choices:[
      {label:'Go all the way in', sub:'the case over everything', effect:p=>{ const sp=(p.rels||[]).find(r=>/Spouse|Partner/.test(r.kind)&&r.alive); if(sp)sp.bond=clamp(sp.bond-12); fx(p,{stress:16,smarts:4,fame:3}); setFlag(p,'wasUndercover'); markCat(p,'cc_cop'); return `${p.first} disappeared into the other life for the better part of a year. When it ended, the case was made — and the person who came back wasn't quite the one who left.`; }},
      {label:'Set hard limits', sub:'protect the home front', effect:p=>{ fx(p,{stress:8,smarts:2}); markCat(p,'cc_cop'); return `${p.first} took it but drew lines — weekends home, a code word, an exit date. Slower, riskier for the op, but ${p.first} stayed whole.`; }},
      {label:'Turn it down', sub:'put family first', effect:p=>{ fx(p,{happy:4,fame:-2}); setFlag(p,'turnedDownBig'); markCat(p,'cc_cop'); return `${p.first} passed. Someone else went under. ${p.first} will wonder, on the slow nights, who they'd have become if they'd said yes.`; }},
    ]},
  { id:'xcc_cop_partner', emoji:'🚓', title:'Your Partner Is Shot', once:true, track:'career', cat:'cc_cop', weight:8,
    when:p=>p.job==='cop' && p.age>=26,
    body:p=>{ const f=xcColleague(p,'partner'); setFlag(p,'_copPartner',f.id); return `It happens in the time it takes to blink — ${xcFirst(f)} goes down beside ${p.first}, and the world narrows to the sound of ${p.first}'s own voice calling it in.`; },
    choices:[
      {label:'Stay with them', sub:'don\'t let go', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._copPartner); if(chance(60)){ if(f)f.bond=clamp(f.bond+20); fx(p,{stress:14,happy:-4}); markCat(p,'cc_cop'); return `${f?xcFirst(f):'They'} pulled through. Something is different between them now — the kind of bond that doesn't need words. ${p.first} carries the near-miss for years.`; } if(f){f.alive=false;} fx(p,{stress:22,happy:-16}); setFlag(p,'lostPartner'); markCat(p,'cc_cop'); return `${f?xcFirst(f):'They'} didn't make it. There were no good choices and no good outcomes — only the ones ${p.first} will replay forever. (A therapist, down the line, might help carry it.)`; }},
    ]},
  { id:'xcc_cop_arrest_known', emoji:'⛓', title:'You Arrest Someone You Know', once:true, track:'career', cat:'cc_cop', weight:6,
    when:p=>p.job==='cop' && p.age>=27,
    body:p=>`The name on the warrant is one ${p.first} knows — a neighbor, an old friend, someone who waved hello a hundred times. The law doesn't care about the history. ${p.first} has to decide if ${p.first} does.`,
    choices:[
      {label:'Make the arrest yourself', sub:'the badge over the bond', effect:p=>{ fx(p,{stress:12,happy:-6}); setFlag(p,'badgeOverBond'); markCat(p,'cc_cop'); return `${p.first} did it by the book, looked them in the eye, read the rights. It cost ${p.first} a piece of something. But the job means nothing if it bends for the people you like.`; }},
      {label:'Hand it to another officer', sub:'recuse, quietly', effect:p=>{ fx(p,{stress:6}); markCat(p,'cc_cop'); return `${p.first} stepped back and let someone else cuff them. Not cowardice — just the honest admission that ${p.first} couldn't be the one. The arrest still happened.`; }},
      {label:'Give them one hour', sub:'a dangerous mercy', effect:p=>{ if(chance(45)){ fx(p,{stress:18,happy:-8}); p.record.push('Tipped off a suspect'); setFlag(p,'compromisedBadge'); markCat(p,'cc_cop'); return `${p.first} let a warning slip — and it came back around. The kind of mercy that ends careers, and nearly ended this one.`; } fx(p,{stress:14}); setFlag(p,'quietMercy'); markCat(p,'cc_cop'); return `${p.first} gave them the hour. They used it to say goodbye to their kids before turning themselves in. No one ever knew, and ${p.first} isn't sorry.`; }},
    ]},
  { id:'xcc_cop_bodycam', emoji:'📹', title:'The Footage Goes Public', once:true, track:'career', cat:'cc_cop', weight:6,
    when:p=>p.job==='cop' && p.age>=26,
    body:p=>`A few seconds of ${p.first} on duty — a hard call, made in real time — is now on every screen in the country. The public is deciding what it meant. ${p.first} doesn't get a vote.`,
    choices:[
      {label:'Stand by what you did', sub:'no apology', effect:p=>{ if(chance(55)){ fx(p,{fame:6,stress:8}); setFlag(p,'stoodByIt'); markCat(p,'cc_cop'); return `${p.first} didn't flinch, didn't walk it back. Half the country hated ${p.first} for a month. The other half made ${p.first} a symbol. Neither felt like ${p.first}.`; } fx(p,{fame:-6,stress:14,happy:-6}); markCat(p,'cc_cop'); return `${p.first} held the line and the line did not hold. The clip outlived the context, the way clips do.`; }},
      {label:'Apologize publicly', sub:'take the air out of it', effect:p=>{ fx(p,{fame:-3,stress:6,happy:2}); markCat(p,'cc_cop'); return `${p.first} owned the part worth owning and said so plainly. It cost ${p.first} something with the rank-and-file, but the storm passed faster.`; }},
      {label:'Say nothing, let it pass', sub:'wait it out', effect:p=>{ fx(p,{stress:10}); markCat(p,'cc_cop'); return `${p.first} went quiet and let the next outrage arrive on schedule. It did. The silence was its own kind of answer to the people watching.`; }},
    ]},

  /* ============ FIREFIGHTER ============ */
  { id:'xcc_fire_couldnt_save', emoji:'🔥', title:"The One You Couldn't Save", once:true, track:'career', cat:'cc_fire', weight:8,
    when:p=>p.job==='firefighter' && p.age>=25,
    body:p=>`${p.first} had them. Hand on the door, seconds from out — and then ${p.first} didn't. It wasn't the job that failed. ${p.first} will spend a long time deciding whether it was ${p.first}.`,
    choices:[
      {label:'Carry it in silence', sub:'the way the old hands do', effect:p=>{ fx(p,{stress:18,happy:-10}); setFlag(p,'fireGuilt'); markCat(p,'cc_fire'); return `${p.first} packed it down with all the others and went back on shift. It works, mostly, until it doesn't.`; }},
      {label:'Talk to someone', sub:'let it out', effect:p=>{ fx(p,{stress:8,happy:-2}); setFlag(p,'soughtHelp'); markCat(p,'cc_fire'); return `${p.first} sat with a counselor the department keeps on call and said the thing out loud. It didn't fix it. It made it carryable, which is different and enough.`; }},
      {label:"Find the family, say you're sorry", sub:'face them', effect:p=>{ if(chance(60)){ fx(p,{stress:10,happy:4}); setFlag(p,'facedTheFamily'); markCat(p,'cc_fire'); return `${p.first} found them and said the unsayable. They didn't blame ${p.first} — they thanked ${p.first} for trying. ${p.first} didn't expect grace and got it anyway.`; } fx(p,{stress:16,happy:-6}); markCat(p,'cc_fire'); return `${p.first} found them, and their grief had nowhere to go but at ${p.first}. ${p.first} took it, because someone had to, and walked away heavier.`; }},
    ]},
  { id:'xcc_fire_offduty', emoji:'🧯', title:"Off-Duty, and There's a Fire", once:true, track:'career', cat:'cc_fire', weight:6,
    when:p=>p.job==='firefighter' && p.age>=24,
    body:p=>`No gear, no truck, no backup — just ${p.first} in street clothes, and smoke pouring from a window with someone screaming behind it.`,
    choices:[
      {label:'Go in anyway', sub:'instinct over protocol', effect:p=>{ if(p.stats.athletic>50||chance(60)){ fx(p,{health:-8,fame:8,happy:6,stress:8}); setFlag(p,'offDutyHero'); markCat(p,'cc_fire'); return `${p.first} went in with a wet shirt over ${p.first}'s face and came out with a stranger over ${p.first}'s shoulder. The neighborhood will tell the story for years.`; } fx(p,{health:-20,stress:14}); markCat(p,'cc_fire'); return `${p.first} went in and the fire didn't care about ${p.first}'s training. ${p.first} got them out — barely — and spent a week in a hospital bed deciding it was worth it.`; }},
      {label:'Direct the rescue from outside', sub:'do it smart', effect:p=>{ fx(p,{smarts:4,fame:3,stress:6}); markCat(p,'cc_fire'); return `${p.first} couldn't be the hero alone, so ${p.first} became the one who made the rescue work — bystanders organized, the exit found, the engine waved in. No one filmed that part. It still saved a life.`; }},
    ]},
  { id:'xcc_fire_collapse', emoji:'🏚', title:'The Structural Collapse', once:true, track:'career', cat:'cc_fire', weight:7,
    when:p=>p.job==='firefighter' && xcSenior(p),
    body:p=>`Two of ${p.first}'s people are still inside, and the building is coming down by the minute. The book says hold. ${p.first}'s gut says move.`,
    choices:[
      {label:'Order everyone to wait', sub:'the book exists for a reason', effect:p=>{ if(chance(55)){ fx(p,{stress:14}); markCat(p,'cc_fire'); return `${p.first} held them back, and the structure held just long enough for ${p.first}'s people to find their own way out. The right call. It didn't feel like one until they walked out.`; } fx(p,{stress:20,happy:-12}); setFlag(p,'fireGuilt'); markCat(p,'cc_fire'); return `${p.first} followed the book and the book was wrong this time. ${p.first} will never be sure, and that not-being-sure is the job's real weight.`; }},
      {label:'Go in for them', sub:'break the rule', effect:p=>{ if(chance(50)){ fx(p,{health:-10,fame:6,stress:12}); setFlag(p,'brokeProtocolWon'); markCat(p,'cc_fire'); return `${p.first} went against every protocol and dragged both of them clear as the roof came in behind. A reprimand on paper. A legend in the firehouse.`; } fx(p,{health:-18,stress:22,happy:-10}); markCat(p,'cc_fire'); return `${p.first} went in and the building took its due. Everyone got out alive, barely, and ${p.first} learned why the rule is the rule — the hard way.`; }},
    ]},

  /* ============ MILITARY (soldier) ============ */
  { id:'xcc_mil_kia', emoji:'🎖', title:'Friend Killed in Action', once:true, track:'career', cat:'cc_mil', weight:8,
    when:p=>p.job==='soldier' && p.age>=22,
    body:p=>{ const f=xcColleague(p,'brother-in-arms'); setFlag(p,'_milFriend',f.id); return `${xcFirst(f)} had been beside ${p.first} since basic — the kind of friend ${p.first} never had to explain anything to. The letter home is ${p.first}'s to write.`; },
    choices:[
      {label:'Write the letter yourself', sub:'they deserve your words', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._milFriend); if(f)f.alive=false; fx(p,{stress:14,happy:-10}); setFlag(p,'survivorGuilt'); markCat(p,'cc_mil'); return `${p.first} sat with a pen for three hours and wrote the truest thing ${p.first} could to a family ${p.first} had never met. The guilt isn't loud. It just never fully leaves.`; }},
      {label:'Bury it and keep moving', sub:'grieve later, or never', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._milFriend); if(f)f.alive=false; fx(p,{stress:18,happy:-8}); setFlag(p,'survivorGuilt'); markCat(p,'cc_mil'); return `${p.first} put it in the box with everything else and finished the tour. The box has a weight limit. ${p.first} is finding it.`; }},
    ]},
  { id:'xcc_mil_mercy_enemy', emoji:'🤝', title:'The Enemy Who Let You Go', once:true, track:'career', cat:'cc_mil', weight:6,
    when:p=>p.job==='soldier' && p.age>=24 && (p.jobYears||0)>=3,
    body:p=>`Years ago, on the other side of a war, someone had ${p.first} dead to rights — and chose not to. Now ${p.first} sees them again, in a world with different rules, and the debt is ${p.first}'s to settle.`,
    choices:[
      {label:'Repay the mercy', sub:'a debt is a debt', effect:p=>{ fx(p,{happy:8,stress:4}); setFlag(p,'repaidMercy'); markCat(p,'cc_mil'); return `${p.first} let them walk, the way they once let ${p.first} walk. Some accounts can only be settled in kind. ${p.first} slept better than ${p.first} had in a while.`; }},
      {label:'Do your duty', sub:'the war doesn\'t forgive', effect:p=>{ fx(p,{stress:16,happy:-8}); setFlag(p,'dutyOverDebt'); markCat(p,'cc_mil'); return `${p.first} did what the uniform required and lived with the math of it. They'd shown ${p.first} mercy. ${p.first} returned a different kind of answer, and it sits where mercy used to.`; }},
    ]},

  /* ============ CORPORATE / CEO ============ */
  { id:'xcc_corp_layoffs', emoji:'📉', title:'The Layoffs', once:true, track:'career', cat:'cc_corp', weight:6,
    when:p=>p.job==='corporate' && (p._rung==null || p._rung>=2) && p.age>=28,
    body:p=>`The number came down from above and now ${p.first} has to turn it into names — real people, some of whom ${p.first} hired, trained, knows the kids of. The whether isn't ${p.first}'s. Only the how.`,
    choices:[
      {label:'Do it with full dignity', sub:'severance, references, honesty', effect:p=>{ fx(p,{money:-4000,stress:12,happy:-2}); setFlag(p,'humaneLayoffs'); markCat(p,'cc_corp'); return `${p.first} fought for real severance, made the calls personally, wrote references that meant something. It didn't make ${p.first} popular upstairs. It let ${p.first} keep looking in the mirror.`; }},
      {label:'Follow the script exactly', sub:'protect yourself', effect:p=>{ fx(p,{stress:8,happy:-6}); setFlag(p,'cleanHands'); markCat(p,'cc_corp'); return `${p.first} did it the company way — efficient, legally airtight, cold. ${p.first} kept ${p.first}'s job and a little less of ${p.first}'s self-respect.`; }},
      {label:'Refuse to deliver them', sub:'put yourself on the list', effect:p=>{ if(chance(40)){ fx(p,{fame:4,happy:6,stress:10}); setFlag(p,'refusedLayoffs'); markCat(p,'cc_corp'); return `${p.first} said no — and somehow it stuck. The number got revisited, a few names came off the list. ${p.first} spent capital ${p.first} can't get back, on purpose.`; } fx(p,{money:-2000,stress:14,happy:2}); setFlag(p,'refusedLayoffs'); markCat(p,'cc_corp'); return `${p.first} refused, and the layoffs happened anyway — with ${p.first}'s name added quietly to the bottom of the list. ${p.first} doesn't regret it.`; }},
    ]},
  { id:'xcc_corp_protege', emoji:'📊', title:'Your Protégé Beats You', once:true, track:'career', cat:'cc_corp', weight:5,
    when:p=>p.job==='corporate' && xcSenior(p),
    body:p=>{ const f=xcColleague(p,'protégé'); setFlag(p,'_corpProtege',f.id); return `${p.first} taught ${xcFirst(f)} everything — and ${xcFirst(f)} just took the role that should have been ${p.first}'s. The next year is going to define who ${p.first} actually is.`; },
    choices:[
      {label:'Champion them anyway', sub:'mentor over ego', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._corpProtege); if(f)f.bond=clamp(f.bond+18); fx(p,{happy:6,smarts:2}); setFlag(p,'gracefulMentor'); markCat(p,'cc_corp'); return `${p.first} swallowed the sting and stood behind them publicly. It turned out the legacy ${p.first} was building was always going to be a person, not a title.`; }},
      {label:'Compete hard to win it back', sub:'no surrender', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._corpProtege); if(f)f.bond=clamp(f.bond-14); if(chance(50)){ fx(p,{fame:5,stress:12}); markCat(p,'cc_corp'); return `${p.first} out-hustled the student ${p.first} made, and clawed the ground back. A win that tasted faintly of something lost.`; } fx(p,{stress:16,happy:-6}); markCat(p,'cc_corp'); return `${p.first} fought and lost twice over — the role and the protégé both. Pride is an expensive thing to be right about.`; }},
      {label:'Leave for something new', sub:'close the chapter', effect:p=>{ fx(p,{stress:8,happy:4}); setFlag(p,'leftOnOwnTerms'); markCat(p,'cc_corp'); return `${p.first} decided the room had gotten too small and walked toward a bigger one. Sometimes the protégé passing you is just the universe telling you to grow.`; }},
    ]},

  /* ============ ORGANIZED CRIME (crimelord) ============ */
  { id:'xcc_crime_hit', emoji:'🩸', title:'The Hit Request', once:true, track:'career', cat:'cc_crime', weight:7,
    when:p=>p.job==='crimelord' && xcSenior(p),
    body:p=>`One of ${p.first}'s people wants the green light to make a problem disappear — permanently. ${p.first} can authorize it, kill the idea, find a third way, or start asking the questions ${p.first} is not supposed to ask.`,
    choices:[
      {label:'Authorize it', sub:'this is the life you chose', effect:p=>{ fx(p,{stress:14}); p.record.push('Ordered a hit'); setFlag(p,'orderedHit'); markCat(p,'cc_crime'); return `${p.first} gave the nod and the problem went away. So did a little more of whatever ${p.first} used to be before all this. The org respects ${p.first} more now. That's the trade.`; }},
      {label:'Find another way', sub:'leverage, not blood', effect:p=>{ if(chance(60)){ fx(p,{smarts:4,stress:8}); setFlag(p,'bloodlessBoss'); markCat(p,'cc_crime'); return `${p.first} solved it with money and pressure instead of a body. Cleaner, smarter, and it kept a reputation ${p.first} is quietly proud of — the boss who didn't have to.`; } fx(p,{stress:16,money:-50000}); markCat(p,'cc_crime'); return `${p.first} tried to do it without blood, and it cost — money, time, a debt owed sideways. The problem's handled. Some of ${p.first}'s people think ${p.first} went soft.`; }},
      {label:'Refuse and ask who wants it', sub:'dangerous curiosity', effect:p=>{ fx(p,{stress:18,smarts:3}); setFlag(p,'pulledThread'); markCat(p,'cc_crime'); return `${p.first} said no and started pulling the thread — who really wanted this, and why. What ${p.first} found was worse than a hit, and now ${p.first} knows it.`; }},
    ]},
  { id:'xcc_crime_cover', emoji:'🍸', title:'The Legitimate Cover', once:true, track:'career', cat:'cc_crime', weight:5,
    when:p=>p.job==='crimelord' && (p.jobYears||0)>=4,
    body:p=>{ const f=xcColleague(p,'employee'); setFlag(p,'_crimeWorker',f.id); return `The bar — or the laundromat, or the restaurant — that washes ${p.first}'s money has a real employee, ${xcFirst(f)}, who has no idea, and who is genuinely, movingly good at the honest job. A customer just thanked them, glowing.`; },
    choices:[
      {label:'Protect their innocence', sub:'keep them clean', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._crimeWorker); if(f)f.bond=clamp(f.bond+10); fx(p,{happy:4,stress:4}); setFlag(p,'keptThemClean'); markCat(p,'cc_crime'); return `${p.first} made a quiet rule: ${xcFirst(f)} never finds out, never gets touched, never gets used. One clean thing in a dirty operation. ${p.first} needs it more than ${xcFirst(f)} does.`; }},
      {label:'Pull them into the real business', sub:'they\'re too good to waste', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._crimeWorker); if(f){f.bond=clamp(f.bond-4); f._dirty=true;} fx(p,{stress:8}); markCat(p,'cc_crime'); return `${p.first} brought ${xcFirst(f)} in. They were a natural — that was the sad part. ${p.first} took someone clean and made them ${p.first}'s, and the glow went out of them by inches.`; }},
    ]},

  /* ============ MEDICINE (doctor) ============ */
  { id:'xcc_med_offduty', emoji:'🚑', title:'Off-Duty Medical Emergency', once:true, track:'career', cat:'cc_med', weight:6,
    when:p=>p.job==='doctor' && p.age>=27,
    body:p=>`A plane at altitude, a restaurant, a parking lot — and someone goes down. No chart, no team, no equipment. Just ${p.first}, ${p.first}'s hands, and what ${p.first} knows.`,
    choices:[
      {label:'Step in immediately', sub:'this is who you are', effect:p=>{ if(chance(70)){ fx(p,{fame:5,happy:8,stress:6}); setFlag(p,'savedAStranger'); markCat(p,'cc_med'); return `${p.first} was on the floor beside them before anyone else moved, improvising with belts and a borrowed phone flashlight, and ${p.first} held the line until the paramedics arrived. They lived. ${p.first} remembered why ${p.first} started.`; } fx(p,{stress:16,happy:-6}); markCat(p,'cc_med'); return `${p.first} did everything right and it wasn't enough — sometimes it isn't. ${p.first} knelt there knowing more than anyone present and still losing. That knowledge is its own burden.`; }},
      {label:'Wait for the professionals', sub:'liability, exhaustion, doubt', effect:p=>{ fx(p,{stress:10,happy:-4}); markCat(p,'cc_med'); return `${p.first} hesitated — the lawsuits, the no-equipment, the long shift already behind ${p.first} — and someone else stepped up first. ${p.first} will think about the hesitation longer than ${p.first} expects.`; }},
    ]},
  { id:'xcc_med_malpractice', emoji:'🩺', title:"Malpractice That Isn't Yours", once:true, track:'career', cat:'cc_med', weight:6,
    when:p=>p.job==='doctor' && xcSenior(p),
    body:p=>{ const f=xcColleague(p,'colleague'); setFlag(p,'_medColleague',f.id); return `${p.first} sees it plainly: ${xcFirst(f)} made an error — a real one, with a real cost. The patient's family doesn't know. ${xcFirst(f)} is hoping it stays that way. ${p.first} is the only other person who can read the chart.`; },
    choices:[
      {label:'Report it', sub:'the patient comes first', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._medColleague); if(f)f.bond=clamp(f.bond-20); fx(p,{stress:14,happy:2}); setFlag(p,'reportedColleague'); markCat(p,'cc_med'); return `${p.first} filed it. ${xcFirst(f)}'s career took the hit it earned, and the friendship died with it. The family got the truth. ${p.first} chose the patient and would again.`; }},
      {label:'Confront them privately first', sub:'a chance to do right', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._medColleague); if(chance(55)){ if(f)f.bond=clamp(f.bond+6); fx(p,{stress:8,happy:2}); markCat(p,'cc_med'); return `${p.first} put it to ${xcFirst(f)} directly, and ${xcFirst(f)} did the hard right thing — disclosed it, owned it. ${p.first} gave them the chance to be better, and they took it.`; } if(f)f.bond=clamp(f.bond-10); fx(p,{stress:14}); setFlag(p,'reportedColleague'); markCat(p,'cc_med'); return `${p.first} gave them the chance and they tried to bury it deeper. So ${p.first} reported it after all — slower, sadder, but done.`; }},
      {label:'Say nothing', sub:'protect a colleague', effect:p=>{ fx(p,{stress:16,happy:-8}); setFlag(p,'medSilence'); markCat(p,'cc_med'); return `${p.first} closed the chart and said nothing. Loyalty, ${p.first} called it. It will feel like that on the good days and like complicity on the others.`; }},
    ]},

  /* ============ LAW (lawyer) ============ */
  { id:'xcc_law_deathrow', emoji:'⚖️', title:'The Death Row Case', once:true, track:'career', cat:'cc_law', weight:7,
    when:p=>p.job==='lawyer' && xcSenior(p),
    body:p=>`The client might be innocent. The evidence won't say for sure. And the one thing ${p.first} doesn't have is the one thing the client is running out of: time.`,
    choices:[
      {label:'Pour everything into it', sub:'mortgage your life to the case', effect:p=>{ if(chance(50)){ fx(p,{fame:8,happy:10,stress:18,money:-20000}); setFlag(p,'savedInnocent'); markCat(p,'cc_law'); return `${p.first} didn't sleep for a season — and found the thread that unraveled it. A life walked free because ${p.first} refused to stop pulling. Nothing ${p.first} ever does will feel bigger.`; } fx(p,{stress:24,happy:-14,money:-20000}); setFlag(p,'lostThatOne'); markCat(p,'cc_law'); return `${p.first} gave everything and the clock won anyway. ${p.first} was holding the phone when the call came. ${p.first} will carry that client for the rest of ${p.first}'s life.`; }},
      {label:'Do solid work within limits', sub:'you can\'t save everyone', effect:p=>{ fx(p,{stress:12,happy:-4}); markCat(p,'cc_law'); return `${p.first} did good, competent work and kept ${p.first}'s life intact doing it. Maybe that was wisdom. On some nights it feels like the other thing.`; }},
    ]},
  { id:'xcc_law_witness', emoji:'🕯', title:'The Witness in Danger', once:true, track:'career', cat:'cc_law', weight:6,
    when:p=>p.job==='lawyer' && (p.jobYears||0)>=4,
    body:p=>`${p.first}'s whole case rests on one frightened person — and their fear is well-founded. Keeping them safe might mean stepping outside the lines ${p.first} swore to stay inside.`,
    choices:[
      {label:'Bend the rules to protect them', sub:'person over procedure', effect:p=>{ if(chance(55)){ fx(p,{stress:12,happy:4}); setFlag(p,'protectedWitness'); markCat(p,'cc_law'); return `${p.first} did some quiet, unofficial things to keep them breathing, and it held. The witness testified. ${p.first} won't write down how.`; } fx(p,{stress:18,money:-10000}); p.record.push('Bar inquiry'); markCat(p,'cc_law'); return `${p.first} crossed a line for the right reason and it got noticed. An inquiry, a scare, a lesson in how good intentions are graded.`; }},
      {label:'Keep it strictly by the book', sub:'protect the case and yourself', effect:p=>{ fx(p,{stress:10}); markCat(p,'cc_law'); return `${p.first} stayed inside every rule and hoped the system would hold up its end. It mostly did. ${p.first} tries not to think about the 'mostly.'`; }},
    ]},

  /* ============ TECH ============ */
  { id:'xcc_tech_govreq', emoji:'🔐', title:'The Government Wants the Data', once:true, track:'career', cat:'cc_tech', weight:6,
    when:p=>p.job==='tech' && xcSenior(p),
    body:p=>`The request is legally clean — signatures, a real order, the works. The purpose is anything but clear. ${p.first} is the one with the keys.`,
    choices:[
      {label:'Comply', sub:'it\'s legal, it\'s their call', effect:p=>{ fx(p,{stress:8,money:0}); setFlag(p,'complied'); markCat(p,'cc_tech'); return `${p.first} handed it over, because the law said to and it wasn't ${p.first}'s job to second-guess. ${p.first} hopes ${p.first} was right. ${p.first} doesn't get to find out.`; }},
      {label:'Push back legally', sub:'make them work for it', effect:p=>{ fx(p,{smarts:4,stress:12}); setFlag(p,'pushedBack'); markCat(p,'cc_tech'); return `${p.first} lawyered up and made them justify every byte. Some of the request quietly evaporated under the pressure. The rest ${p.first} could live with.`; }},
      {label:'Leak the request itself', sub:'sunlight, and consequences', effect:p=>{ if(chance(45)){ fx(p,{fame:10,stress:18}); p.record.push('Leaked a federal request'); setFlag(p,'whistleblower'); markCat(p,'cc_tech'); return `${p.first} made the request itself public. ${p.first} became a name people argued about — hero or criminal, depending on the room. ${p.first}'s career as it was, ended. Something else began.`; } fx(p,{stress:22,money:-5000}); markCat(p,'cc_tech'); return `${p.first} tried to blow the whistle and it got caught in ${p.first}'s throat — traced, contained, quietly punished. ${p.first} learned how thick the walls really are.`; }},
    ]},
  { id:'xcc_tech_misused', emoji:'💻', title:'Something You Built Is Being Used Wrong', once:true, track:'career', cat:'cc_tech', weight:5,
    when:p=>p.job==='tech' && (p.jobYears||0)>=4,
    body:p=>`The code does exactly what ${p.first} designed it to do. The problem is what people are doing with it. ${p.first} could patch the harm out — but the same patch would break it for everyone using it honestly.`,
    choices:[
      {label:'Ship the patch anyway', sub:'harm reduction over convenience', effect:p=>{ fx(p,{smarts:3,happy:4,stress:8}); setFlag(p,'choseHarmReduction'); markCat(p,'cc_tech'); return `${p.first} pushed the fix and ate the angry support tickets. Legitimate users grumbled. The bad actors lost a tool. ${p.first} decided which group ${p.first} owed more, and acted on it.`; }},
      {label:'Leave it, document your warning', sub:'cover yourself, keep it working', effect:p=>{ fx(p,{stress:10,happy:-4}); markCat(p,'cc_tech'); return `${p.first} wrote a very clear memo about the risk and shipped nothing. The memo will be useful to exactly one person later: ${p.first}, proving ${p.first} knew.`; }},
    ]},

  /* ============ SPORTS (nba/nfl/ufc/boxer) ============ */
  { id:'xcc_sport_throw', emoji:'🥊', title:'The Throw Request', once:true, track:'career', cat:'cc_sport', weight:7,
    when:p=>/^(ufc|boxer|nba|nfl|soccer|wwe)$/.test(p.job) && xcSenior(p),
    body:p=>`Someone with money and leverage wants ${p.first} to lose on purpose. The payout is real. So is the leverage — they've made sure ${p.first} understands exactly what 'no' costs.`,
    choices:[
      {label:'Refuse, and report it', sub:'the sport is sacred', effect:p=>{ if(chance(55)){ fx(p,{fame:8,happy:6,stress:14}); setFlag(p,'cleanAthlete'); markCat(p,'cc_sport'); return `${p.first} said no and took it to the people who could act. It got ugly for a while, but ${p.first}'s name stayed clean — and in this game, that's the only thing that outlasts you.`; } fx(p,{stress:20,health:-8}); markCat(p,'cc_sport'); return `${p.first} refused and they made good on the threat — an 'accident,' a smear, a hard season. ${p.first} doesn't regret it. ${p.first} just paid for it.`; }},
      {label:'Take the money, throw the fight', sub:'one bad night for a fortune', effect:p=>{ fx(p,{money:500000,stress:18,happy:-10,fame:-4}); p.record.push('Threw a fight'); setFlag(p,'threwIt'); markCat(p,'cc_sport'); return `${p.first} went down in the round they paid for. The money cleared. So did something in ${p.first}'s chest that doesn't come back. ${p.first} knows what ${p.first} is now, even if no one else ever proves it.`; }},
      {label:'Refuse quietly, tell no one', sub:'win clean, stay silent', effect:p=>{ fx(p,{stress:12,happy:2}); setFlag(p,'quietlyClean'); markCat(p,'cc_sport'); return `${p.first} just... won, the way ${p.first} always meant to, and never said a word about the offer. The cleanest answer is sometimes the one nobody hears.`; }},
    ]},
  { id:'xcc_sport_younger', emoji:'⏱', title:'The Younger Version of You', once:true, track:'career', cat:'cc_sport', weight:6,
    when:p=>/^(ufc|boxer|nba|nfl|soccer|wwe)$/.test(p.job) && p.age>=30 && xcSenior(p),
    body:p=>`There's a kid coming up now who's better than ${p.first} ever was — faster, hungrier, with the years ${p.first} no longer has. It's the truth of every sport, and now it's ${p.first}'s truth. Accepting it is the event.`,
    choices:[
      {label:'Mentor them', sub:'pass the torch on purpose', effect:p=>{ const f=addFriend(p,'Mentee'); fx(p,{happy:8,fame:3}); setFlag(p,'hasMentee'); markCat(p,'cc_sport'); return `${p.first} took the kid under ${p.first}'s wing instead of resenting them. ${p.first}'s body is leaving the sport. ${p.first}'s knowledge gets to stay in it, through ${f.name.split(' ')[0]}.`; }},
      {label:'Fight to hold your spot', sub:'rage against the clock', effect:p=>{ if(chance(35)){ fx(p,{fame:6,health:-6,stress:14}); markCat(p,'cc_sport'); return `${p.first} held them off one more season through sheer refusal. Glorious, and borrowed. The clock doesn't lose. It waits.`; } fx(p,{health:-10,happy:-6,stress:12}); markCat(p,'cc_sport'); return `${p.first} tried to out-will time and time won, the way it always does, a little more painfully for the fighting.`; }},
      {label:'Retire on your own terms', sub:'leave before you\'re pushed', effect:p=>{ fx(p,{happy:6,fame:4}); setFlag(p,'retiredProud'); markCat(p,'cc_sport'); return `${p.first} walked away with the choice still ${p.first}'s to make. There's a dignity in leaving the party before the lights come up, and ${p.first} found it.`; }},
    ]},

  /* ============ ENTERTAINMENT (moviestar/popstar/director/writer/mogul) ============ */
  { id:'xcc_ent_oldcontent', emoji:'🎞', title:'The Old Content Resurfaces', once:true, track:'career', cat:'cc_ent', weight:5,
    when:p=>/^(moviestar|popstar|director|writer|mogul|youtuber)$/.test(p.job) && p.stats.fame>40,
    body:p=>`Something ${p.first} made or said a decade ago is circulating again, stripped of its context. ${p.first} was a different person then. The question the internet is asking is whether that counts for anything.`,
    choices:[
      {label:'Address it head-on', sub:'own the growth', effect:p=>{ if(chance(60)){ fx(p,{fame:4,happy:4,stress:8}); setFlag(p,'ownedThePast'); markCat(p,'cc_ent'); return `${p.first} spoke to it plainly — here's who I was, here's what I learned, here's why I'm not sorry I changed. People mostly respected it. People mostly can tell the real thing.`; } fx(p,{fame:-4,stress:12}); markCat(p,'cc_ent'); return `${p.first} addressed it and the response was a fresh argument about whether ${p.first} was allowed to. The discourse ate itself, as it does. ${p.first} stepped back from the table.`; }},
      {label:'Stay silent', sub:'don\'t feed it', effect:p=>{ fx(p,{stress:8}); markCat(p,'cc_ent'); return `${p.first} said nothing and let the cycle spin without fuel. It took longer to die that way, but it died without ${p.first}'s help, which felt like the only kind of win available.`; }},
    ]},
  { id:'xcc_ent_legend', emoji:'🌟', title:'Working With a Legend', once:true, track:'career', cat:'cc_ent', weight:5,
    when:p=>/^(moviestar|popstar|director|writer|wwe)$/.test(p.job) && (p.jobYears||0)>=4,
    body:p=>`Someone ${p.first} grew up worshipping is now in the room as a collaborator. Up close, they're... difficult. Brilliant and difficult. The whole project is going to live or die on how ${p.first} handles them.`,
    choices:[
      {label:'Stand up to them', sub:'the work needs honesty', effect:p=>{ if(chance(55)){ fx(p,{fame:6,smarts:3,happy:6}); setFlag(p,'earnedRespect'); markCat(p,'cc_ent'); return `${p.first} pushed back, respectfully and firmly, and something shifted — the legend started treating ${p.first} as a peer. The work got better. So did ${p.first}.`; } fx(p,{fame:-3,stress:12}); markCat(p,'cc_ent'); return `${p.first} stood up and the legend did not take it well. The project survived, barely, on a worse footing. Some heroes should stay at a distance.`; }},
      {label:'Defer and absorb', sub:'learn at the feet of', effect:p=>{ fx(p,{smarts:5,happy:4,stress:6}); markCat(p,'cc_ent'); return `${p.first} bit ${p.first}'s tongue and watched and learned. The project bore the legend's stamp more than ${p.first}'s — but ${p.first} walked away knowing things no class teaches.`; }},
    ]},

  /* ============ SUPERHERO ============ */
  { id:'xcc_hero_cityturns', emoji:'🦸', title:'The City Turns on You', once:true, track:'career', cat:'cc_hero', weight:7,
    when:p=>p.job==='superhero' && xcSenior(p),
    body:p=>`Something ${p.first} did — or was accused of, which the public rarely distinguishes — has flipped the city against ${p.first}. Being a hero where they cheer you is a job. Being one where they jeer is a calling.`,
    choices:[
      {label:'Keep protecting them anyway', sub:'the work, not the applause', effect:p=>{ fx(p,{happy:4,stress:14,fame:-4}); setFlag(p,'heroWithoutApplause'); markCat(p,'cc_hero'); return `${p.first} kept showing up to save people who spat ${p.first}'s name, because that was the whole point all along. Slowly, one rescue at a time, some of them remembered. Some never will. ${p.first} saved them anyway.`; }},
      {label:'Clear your name first', sub:'truth before service', effect:p=>{ if(chance(55)){ fx(p,{fame:8,stress:12}); setFlag(p,'clearedName'); markCat(p,'cc_hero'); return `${p.first} went to war for the truth and dragged it into the light. The city turned back, a little ashamed. ${p.first} let them feel it before forgiving them.`; } fx(p,{fame:-4,stress:18}); markCat(p,'cc_hero'); return `${p.first} fought to clear ${p.first}'s name and the proof wouldn't come together. The cloud stayed. ${p.first} had to learn to work under it.`; }},
      {label:'Hang up the cape', sub:'maybe they don\'t deserve you', effect:p=>{ fx(p,{happy:-6,stress:8,fame:-10}); setFlag(p,'quitHeroing'); markCat(p,'cc_hero'); return `${p.first} decided a city that hated ${p.first} could save itself for a while. The cape went in a drawer. The quiet was a relief and an ache in equal measure.`; }},
    ]},
  { id:'xcc_hero_madevillain', emoji:'💢', title:'You Accidentally Created a Villain', once:true, track:'career', cat:'cc_hero', weight:6,
    when:p=>p.job==='superhero' && (p.jobYears||0)>=5,
    body:p=>`The thing in front of ${p.first} — the one hurting people now — exists partly because of something ${p.first} did, or failed to do, years ago. ${p.first} can see ${p.first}'s own fingerprints on what they became. The reckoning is here.`,
    choices:[
      {label:'Try to reach them', sub:'you owe them that', effect:p=>{ if(chance(45)){ fx(p,{happy:8,stress:14}); setFlag(p,'redeemedThem'); markCat(p,'cc_hero'); return `${p.first} went to them not as a hero but as the person who'd helped break them — and somehow, against every odds, got through. Not everyone ${p.first} saves wears handcuffs. Some just put theirs down.`; } fx(p,{stress:18,happy:-8}); markCat(p,'cc_hero'); return `${p.first} reached out and they threw it back in ${p.first}'s face. Some breaks don't mend just because the one who caused them is sorry. ${p.first} stays sorry anyway.`; }},
      {label:'Stop them by force, carry the guilt', sub:'clean up your own mess', effect:p=>{ fx(p,{stress:16,health:-6,happy:-6}); setFlag(p,'stoppedOwnCreation'); markCat(p,'cc_hero'); return `${p.first} did what had to be done and did it knowing ${p.first} was, in part, fighting ${p.first}'s own past. There was no version of this with clean hands. ${p.first} stopped them. ${p.first} grieves them too.`; }},
    ]},

  /* ============ SUPERVILLAIN ============ */
  { id:'xcc_villain_thanked', emoji:'🦹', title:'Someone Thanks You', once:true, track:'career', cat:'cc_villain', weight:6,
    when:p=>p.job==='villain' && (p.jobYears||0)>=3,
    body:p=>`Something ${p.first} did for selfish reasons happened to help a stranger — really help them — and now they're standing in front of ${p.first}, eyes wet, thanking ${p.first} like ${p.first} is the hero ${p.first} spent a lifetime not being. ${p.first} wasn't ready for this.`,
    choices:[
      {label:'Let it land', sub:'feel the thing you avoid', effect:p=>{ fx(p,{happy:6,stress:8}); setFlag(p,'crackInTheArmor'); markCat(p,'cc_villain'); return `${p.first} let it in, just this once, and it ached in a place ${p.first} keeps walled off. ${p.first} is still what ${p.first} is. But ${p.first} drove home different that night.`; }},
      {label:'Deflect it coldly', sub:'don\'t let it touch you', effect:p=>{ fx(p,{stress:6}); setFlag(p,'stayedCold'); markCat(p,'cc_villain'); return `${p.first} brushed past the gratitude like it was an insult. Letting it matter is how people like ${p.first} get soft, and soft is how people like ${p.first} end up dead. ${p.first} keeps the wall.`; }},
      {label:'Use them now that they trust you', sub:'gratitude is leverage', effect:p=>{ fx(p,{smarts:3,happy:-4,stress:6}); setFlag(p,'usedTheirTrust'); markCat(p,'cc_villain'); return `${p.first} filed the trust away as an asset, because that's what ${p.first} does with everything. They'll learn what ${p.first} is eventually. By then ${p.first} will have what ${p.first} needs.`; }},
    ]},
  { id:'xcc_villain_legit', emoji:'🏛', title:'Legitimacy Offered', once:true, track:'career', cat:'cc_villain', weight:6,
    when:p=>p.job==='villain' && xcSenior(p),
    body:p=>`A government, a corporation, someone with real institutional power, is offering ${p.first} the thing ${p.first} maybe always wanted under all the chaos: legitimate power, sanctioned and clean. The price is the identity ${p.first} built in the dark.`,
    choices:[
      {label:'Take the legitimacy', sub:'become the thing you fought', effect:p=>{ fx(p,{money:1000000,fame:10,stress:10,happy:2}); setFlag(p,'wentLegit'); markCat(p,'cc_villain'); return `${p.first} put on the suit and took the title. The chaos that made ${p.first} got folded into a system, the way chaos always eventually does. ${p.first} won. ${p.first} thinks. It's quieter at the top than ${p.first} imagined.`; }},
      {label:'Refuse — stay what you are', sub:'they don\'t get to own you', effect:p=>{ fx(p,{happy:4,stress:8,fame:3}); setFlag(p,'stayedRogue'); markCat(p,'cc_villain'); return `${p.first} laughed in their faces. ${p.first} didn't claw out of every cage just to walk into a nicer one. Whatever ${p.first} is, it's ${p.first}'s — not theirs to license.`; }},
    ]},

  /* ============ MAD SCIENTIST ============ */
  { id:'xcc_madsci_ethics', emoji:'🧪', title:'The Ethics Board', once:true, track:'career', cat:'cc_madsci', weight:6,
    when:p=>p.job==='madsci' && (p.jobYears||0)>=3,
    body:p=>`They found some of ${p.first}'s work — enough to convene a hearing, not enough to understand it. ${p.first} can confine the damage, deflect, discredit the whole panel, or do the thing no one expects and simply tell them everything.`,
    choices:[
      {label:'Reveal everything', sub:'let them see the real scope', effect:p=>{ if(chance(40)){ fx(p,{fame:8,smarts:4,stress:12}); setFlag(p,'cameClean'); markCat(p,'cc_madsci'); return `${p.first} laid it all on the table — every implication, every line crossed. It was a gamble on their imagination, and they rose to it. ${p.first} got oversight ${p.first} didn't want and funding ${p.first} did.`; } fx(p,{stress:18,money:-50000}); p.record.push('Research suspended'); markCat(p,'cc_madsci'); return `${p.first} showed them the truth and they did what frightened institutions do: shut it down, sealed it, ended it. ${p.first} learned that some minds can't hold what ${p.first}'s holds.`; }},
      {label:'Discredit the panel', sub:'attack the inquiry itself', effect:p=>{ if(chance(55)){ fx(p,{smarts:4,stress:14}); setFlag(p,'discreditedThem'); markCat(p,'cc_madsci'); return `${p.first} took the hearing apart from the inside — its biases, its incompetence, its own buried compromises. The inquiry collapsed under ${p.first}'s scrutiny. ${p.first} bought ${p.first}'s freedom with someone else's reputation.`; } fx(p,{stress:18,fame:-6}); markCat(p,'cc_madsci'); return `${p.first} went after the panel and it backfired — ${p.first} looked exactly as dangerous as they feared. The thing ${p.first} tried to dodge arrived with interest.`; }},
      {label:'Confine and deflect', sub:'give them a smaller truth', effect:p=>{ fx(p,{smarts:3,stress:8}); markCat(p,'cc_madsci'); return `${p.first} fed them a contained, survivable version — enough to satisfy, not enough to alarm. They closed the file. The real work continued where they'd never think to look.`; }},
    ]},
  { id:'xcc_madsci_toowell', emoji:'⚗️', title:'The Experiment That Works Too Well', once:true, track:'career', cat:'cc_madsci', weight:7,
    when:p=>p.job==='madsci' && xcSenior(p),
    body:p=>`It worked. Not partially, not in theory — all the way, beyond what ${p.first} dared to model. And now ${p.first} is watching the consequences move outward in rings, and the part ${p.first} didn't plan for is that they don't stop.`,
    choices:[
      {label:'Contain it — destroy your own work', sub:'unmake the thing', effect:p=>{ fx(p,{stress:18,happy:-4,money:-30000}); setFlag(p,'destroyedOwnWork'); markCat(p,'cc_madsci'); return `${p.first} burned a lifetime's breakthrough to its foundations to stop what it was becoming. The greatest thing ${p.first} ever made, ended by the only hand that could. ${p.first} did the right thing and will mourn it forever.`; }},
      {label:'Let it run, study what happens', sub:'the data is irreplaceable', effect:p=>{ fx(p,{smarts:8,stress:16,happy:-8}); p.record.push('Lost control of an experiment'); setFlag(p,'letItRun'); markCat(p,'cc_madsci'); return `${p.first} couldn't bring ${p.first}'s self to end it — not with this much to learn. ${p.first} watched, and recorded, and told ${p.first}'s self the knowledge justified it. The rings kept widening. ${p.first} is still telling ${p.first}'s self that.`; }},
    ]},

];

CHOICE_EVENTS.push(...EXP_CAREER_EVENTS);
