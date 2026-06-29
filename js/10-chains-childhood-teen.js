"use strict";
/* Threadbare · split module: 10-chains-childhood-teen.js  (lines 3373–3855 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   CHAINED & SEEDED EVENTS — Childhood + Adolescence arcs
   (added per EVENTS_AND_CHAINS spec; folds into CHOICE_EVENTS)
   ============================================================ */

/* ============================================================
   CHAINED DECISION TREES & SEEDED EVENTS
   (from the Random Events & Chained Decision Trees design spec)

   Architecture: a chain is just several ordinary CHOICE_EVENTS.
   Beat 1 records the decision with setFlag(p,'ch_xxx', value).
   Later beats are separate events whose when() checks that flag
   plus an age window, so the payoff arrives years later — never
   announced ("remember when…"), just a moment the world arrives at.
   Continuation beats use once:true and a high weight so that, once
   eligible, they reliably fire within their window.

   Flag registry (so beat 1 and its payoff always agree):
     ch_overhear, ch_overhearTopic     ch_break
     ch_firstDeath                      ch_newKid
     ch_riskTaker                       ch_hiddenSecret, ch_hiddenType
     ch_pressure                        ch_moved, ch_leftFriend, ch_oldFriendKept
     ch_champWound                      ch_musicLessons
     ch_triedSubstances                 ch_friendSecret
     ch_persona, ch_scrutiny            ch_crushName (Big Ask)
     ch_healthScare                     ch_leverageFamily
     ch_savedPay
   Existing flags reused: studiedAbroad, secretAffair
   ============================================================ */

// --- small family/relationship lookups used across the chains ---
function aliveParent(p){ return p.rels.find(r=>(r.kind==='Mother'||r.kind==='Father')&&r.alive); }
function aliveSibling(p){ return p.rels.find(r=>(r.kind==='Sister'||r.kind==='Brother'||r.kind==='Sibling')&&r.alive); }
function aliveSpouse(p){ return p.rels.find(r=>r.kind==='Spouse'&&r.alive); }
function anyFriend(p){ return bestFriend(p) || p.rels.find(r=>r.kind==='Friend'&&r.alive); }
function fname(r){ return r ? r.name.split(' ')[0] : 'they'; }
// add a named acquaintance who can resurface later in life
function addContact(p, name, kind='Friend', bond=50){ const sx=makeSex(); const f={name:(name||newFirst(sx))+' '+pick(LAST),kind,sex:sx,bond,alive:true,id:nid()}; p.rels.push(f); return f; }

const CHAIN_EVENTS = [

  /* ========================================================
     PART 1 — CHILDHOOD (0–12)
     ======================================================== */

  // --- The Overhear (CHAIN-LONG) ------------------------------------
  { id:'ch_overhear', emoji:'👂', title:'The Overhear', once:true,
    when:p=>p.age>=6&&p.age<=9, weight:2.2,
    body:p=>{
      const topics={
        money:`money — bills, something about not being able to pay for something`,
        health:`a doctor, and a word ${p.first} doesn't understand but that makes the grown-ups go quiet`,
        past:`something that happened a long time ago, before ${p.first} was born`,
        family:`one of the relatives, and a problem nobody talks about at dinner`
      };
      const k=pick(Object.keys(topics)); p._overTopic=k;
      return `Through a door left open a crack, ${p.first} hears the parents talking low. It's about ${topics[k]}. They don't know anyone's listening.`;
    },
    choices:[
      {label:'Pretend you never heard it', sub:'carry it quietly', effect:p=>{ setFlag(p,'ch_overhear','quiet'); setFlag(p,'ch_overhearTopic',p._overTopic||'family'); fx(p,{smarts:2}); return `${p.first} backed away from the door and said nothing. But they remember every word.`; }},
      {label:'Ask a parent about it', sub:'directly', effect:p=>{ setFlag(p,'ch_overhear','asked'); const par=aliveParent(p); const r=rnd(100); if(r<40){ if(par)par.bond=clamp(par.bond+8); fx(p,{happy:4}); return `${fname(par)} sat ${p.first} down and explained gently. It felt better to know.`;} if(r<75){ if(par)par.bond=clamp(par.bond-6); fx(p,{happy:-4,stress:6}); return `${fname(par)} snapped — "that's grown-up business." ${capFirst(p.first)} felt ashamed for asking.`;} fx(p,{stress:8}); return `The answer was evasive and strange. It only raised more questions.`; }},
      {label:'Tell your sibling', sub:'needs a sibling', need:p=>!!aliveSibling(p), effect:p=>{ setFlag(p,'ch_overhear','told'); const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+5); return `${p.first} whispered it to ${fname(sib)} that night. Now it's a secret the two of them share.`; }},
    ]},
  // payoff A — kept quiet: surfaces at 18–22
  { id:'ch_overhear_quiet', emoji:'🕯️', title:'What You Always Knew', once:true,
    when:p=>p.age>=18&&p.age<=22&&hasFlag(p,'ch_overhear')&&p.flags.ch_overhear==='quiet', weight:7,
    body:p=>`The thing ${p.first} overheard as a child — and never mentioned — has surfaced on its own. Now everyone's reacting like it's news. ${capFirst(p.first)} has had years to sit with it.`,
    choices:[
      {label:'Reveal you always knew', sub:'honest, jarring', effect:p=>{ const par=aliveParent(p); if(par)par.bond=clamp(par.bond+(chance(55)?12:-8)); fx(p,{happy:4}); return chance(55)?`The family was stunned — then strangely grateful ${p.first} had carried it so long.`:`It landed wrong. "You knew? And said nothing?" A new distance opened.`; }},
      {label:'Keep your head down', sub:'+composure', effect:p=>{ fx(p,{smarts:3}); addTrait(p,'disciplined',true); return `${p.first} moved through it calmly while everyone else reeled. Old practice.`; }},
    ]},
  // payoff C — told sibling: at 25+ the sibling used it differently
  { id:'ch_overhear_sibling', emoji:'🔁', title:'A Shared Secret, Spent', once:true,
    when:p=>p.age>=25&&hasFlag(p,'ch_overhear')&&p.flags.ch_overhear==='told'&&!!aliveSibling(p), weight:6,
    body:p=>{ const sib=aliveSibling(p); return `${fname(sib)} brings up the old secret — the one from behind the door all those years ago. They've decided to do something with it that ${p.first} never imagined.`; },
    choices:[
      {label:'Back them up', sub:'loyalty', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+15); fx(p,{stress:6}); return `${p.first} stood with ${fname(sib)}, for better or worse. Blood over comfort.`; }},
      {label:'Refuse — it\'s not yours to use', sub:'principled', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-18); fx(p,{happy:-4}); return `${p.first} wouldn't go along with it. ${capFirst(fname(sib))} felt betrayed by the one person who shared it.`; }},
    ]},

  // --- The Breaking (CHAIN-SHORT) ----------------------------------
  { id:'ch_breaking', emoji:'🏺', title:'The Breaking', once:true,
    when:p=>p.age>=5&&p.age<=10, weight:2.2,
    body:p=>`A crash. ${capFirst(p.first)} is standing over the pieces of something that can't be replaced — a family heirloom. It was an accident. Nobody saw.`,
    choices:[
      {label:'Confess right away', sub:'honest under pressure', effect:p=>{ fx(p,{happy:-6}); const par=aliveParent(p); if(chance(55)){ if(par)par.bond=clamp(par.bond+12); addTrait(p,'confident',true); return `${fname(par)} knelt down. "Thank you for telling me the truth." The hug mattered more than the heirloom.`;} fx(p,{stress:10}); addTrait(p,'anxious',true); return `${fname(par)} lost it. The punishment was harsh, and ${p.first} learned to fear getting caught more than to be honest.`; }},
      {label:'Hide it and hope', sub:'risky', effect:p=>{ setFlag(p,'ch_break','hid'); fx(p,{stress:6}); return `${p.first} swept the pieces into a shoebox and buried it in the closet. For now, nobody knows.`; }},
      {label:'Let your sibling take the blame', sub:'needs a sibling', need:p=>!!aliveSibling(p), effect:p=>{ setFlag(p,'ch_break','blamed'); const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-22); return `When the questions came, ${p.first} stayed quiet and let ${fname(sib)} wear it. ${capFirst(fname(sib))} got punished for nothing.`; }},
    ]},
  // payoff — hid it: comes up at 14–16
  { id:'ch_break_found', emoji:'📦', title:'The Box in the Closet', once:true,
    when:p=>p.age>=14&&p.age<=16&&hasFlag(p,'ch_break')&&p.flags.ch_break==='hid', weight:7,
    body:p=>`Someone finally went looking for the heirloom — and found the shoebox of pieces instead. The lie is years old now, which somehow makes it worse.`,
    choices:[
      {label:'Come clean at last', sub:'heavy relief', effect:p=>{ const par=aliveParent(p); if(par)par.bond=clamp(par.bond-12); fx(p,{happy:-6,stress:-4}); return `${p.first} admitted everything. The disappointment cut deep — not the breaking, the hiding.`; }},
      {label:'Blame it on time and bad luck', sub:'dig in', effect:p=>{ fx(p,{stress:8}); addTrait(p,'anxious',true); return `${p.first} shrugged it off with a half-story nobody quite believed. The unease never fully left.`; }},
    ]},
  // payoff — blamed sibling: at 25+ they bring it up
  { id:'ch_break_reckon', emoji:'⚖️', title:'The Thing You Pinned on Them', once:true,
    when:p=>p.age>=25&&hasFlag(p,'ch_break')&&p.flags.ch_break==='blamed'&&!!aliveSibling(p), weight:6,
    body:p=>{ const sib=aliveSibling(p); return `Out of nowhere, ${fname(sib)} brings up the heirloom — the one ${p.first} broke and let them take the blame for. They've carried it all this time.`; },
    choices:[
      {label:'Finally confess', sub:'+bond, costs pride', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+20); fx(p,{happy:6}); return `"It was me. It was always me." Decades late, but ${fname(sib)} finally got the truth they deserved.`; }},
      {label:'Double down — "you must be misremembering"', sub:'cold', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-20); addTrait(p,'pessimist',true); return `${p.first} denied it to their face. Something between them broke for good.`; }},
    ]},

  // --- Someone Dies (CHAIN-LONG) -----------------------------------
  { id:'ch_first_death', emoji:'🕊️', title:'Someone Dies', once:true,
    when:p=>p.age>=6&&p.age<=11, weight:2,
    body:p=>{ const who=pick(['a grandparent','an elderly neighbor who always waved','the old family dog']); p._deathWho=who; return `${capFirst(p.first)} learns what death is. ${capFirst(who)} is gone, and the house is full of a quiet ${p.first} has never felt before.`; },
    choices:[
      {label:'Cry openly', sub:'let it out', effect:p=>{ setFlag(p,'ch_firstDeath','open'); fx(p,{happy:-6,health:2}); return `${p.first} cried until there was nothing left, and felt lighter for it. Grief, met head-on.`; }},
      {label:'Be strong for the family', sub:'hold it together', effect:p=>{ setFlag(p,'ch_firstDeath','strong'); fx(p,{stress:8}); addTrait(p,'disciplined',true); return `${p.first} held it together so the grown-ups didn't have to. Young shoulders, heavy load.`; }},
      {label:'Avoid all of it', sub:'look away', effect:p=>{ setFlag(p,'ch_firstDeath','avoid'); fx(p,{stress:6}); return `${p.first} stayed in their room with the door shut and waited for it to be over. It never quite was.`; }},
      {label:'Ask hard questions about death', sub:'+smarts', effect:p=>{ setFlag(p,'ch_firstDeath','questions'); fx(p,{smarts:5}); addTrait(p,'creative',true); return `Where do people go? Why? ${capFirst(p.first)} asked the questions adults flinch from, and started building their own answers.`; }},
    ]},
  // payoff — childhood avoidance echoes in adult loss
  { id:'ch_grief_returns', emoji:'🌫️', title:'The Old Way of Grieving', once:true,
    when:p=>p.age>=38&&hasFlag(p,'ch_firstDeath')&&p.flags.ch_firstDeath==='avoid'&&p.rels.some(r=>!r.alive&&(r.kind==='Mother'||r.kind==='Father'||r.kind==='Spouse')), weight:5,
    body:p=>`A loss has landed, and ${p.first} is doing what they've always done — staying busy, staying away from it. It's starting to cost them.`,
    choices:[
      {label:'Finally sit with the grief', sub:'breaks the pattern', effect:p=>{ clearFlag(p,'ch_firstDeath'); fx(p,{happy:8,health:4,stress:-10}); return `${p.first} stopped running from it for the first time in their life. It hurt, and then it healed.`; }},
      {label:'Bury it deeper', sub:'-health', effect:p=>{ fx(p,{health:-10,stress:12}); addTrait(p,'pessimist',true); return `${p.first} packed it away with all the rest. The body keeps a tally the mind refuses to.`; }},
    ]},

  // --- The New Kid (CHAIN-LONG) ------------------------------------
  { id:'ch_new_kid', emoji:'🧒', title:'The New Kid', once:true,
    when:p=>p.age>=7&&p.age<=11, weight:2,
    body:p=>`There's a new kid — odd, quiet, wears the wrong things, says the wrong things. Nobody will go near them. ${capFirst(p.first)} could.`,
    choices:[
      {label:'Befriend them', sub:'+kindness', effect:p=>{ setFlag(p,'ch_newKid','befriended'); addContact(p, null, 'Friend', 60); fx(p,{happy:6}); addTrait(p,'optimist',true); return `${p.first} sat with them at lunch. An unlikely, real friendship began.`; }},
      {label:'Mock them with the crowd', sub:'fit in', effect:p=>{ setFlag(p,'ch_newKid','mocked'); fx(p,{happy:3}); return `${p.first} laughed along with everyone else. The new kid stopped looking up when people walked by.`; }},
      {label:'Ignore them', sub:'neutral', effect:p=>{ setFlag(p,'ch_newKid','ignored'); return `${p.first} kept to their own crowd. The new kid was just… there, then gone.`; }},
      {label:'Report their strangeness to a teacher', sub:'uncertain', effect:p=>{ setFlag(p,'ch_newKid','reported'); fx(p,{smarts:2}); return `${p.first} told a teacher something felt off. Whether that was wisdom or cruelty, only time would tell.`; }},
    ]},
  // payoff — they resurface at 28–35, having become *someone*
  { id:'ch_new_kid_return', emoji:'🌟', title:'The One Nobody Talked To', once:true,
    when:p=>p.age>=28&&p.age<=35&&hasFlag(p,'ch_newKid'), weight:6,
    body:p=>{ const became=pick(['a tech founder whose name is suddenly everywhere','a respected scientist','a celebrated artist','a quietly powerful figure in the city']); p._nkBecame=became; const c=p.flags.ch_newKid; if(c==='reported'){ const danger=chance(45); p._nkDanger=danger; return danger?`That strange new kid you reported? Turns out the adults should have listened harder. The full story is only now coming out, and ${p.first} was the only child who ever said anything.`:`The strange new kid you reported grew up perfectly ordinary — ${became}, in fact. They remember being singled out, and they remember who did it.`; } return `${capFirst(p.first)} freezes in a doorway: the new kid from grade school, all grown up — and now ${became}. They've recognized ${p.first} too.`; },
    choices:[
      {label:'Reconnect', sub:'see where it goes', effect:p=>{ const c=p.flags.ch_newKid; if(c==='befriended'){ const v=40000+rnd(400000); fx(p,{money:v,happy:10,fame:4}); return `They never forgot the kid who was kind first. An opportunity — ${money(v)} worth — falls into ${p.first}'s lap, no strings.`;} if(c==='mocked'){ fx(p,{happy:-8,stress:10}); return `They smiled, said all the right things, and then quietly made sure a door ${p.first} needed stayed shut. They remembered.`;} if(c==='reported'&&p._nkDanger){ fx(p,{fame:8,happy:4}); return `Investigators and reporters want to talk to the only person who saw it early. ${capFirst(p.first)} becomes a small, uneasy part of the story.`;} if(c==='reported'){ fx(p,{happy:-6}); return `They were never dangerous, just different — and they know exactly who reported them. The conversation is short and cold.`;} fx(p,{happy:4}); return `A pleasant, strange little reunion between two near-strangers.`; }},
      {label:'Pretend you don\'t recognize them', sub:'walk on', effect:p=>{ fx(p,{happy:-2}); return `${p.first} looked away and kept walking. Some threads you choose not to pick back up.`; }},
    ]},

  // --- The Dare (CHAIN-SHORT) --------------------------------------
  { id:'ch_dare', emoji:'🏚️', title:'The Dare', once:true,
    when:p=>p.age>=8&&p.age<=12, weight:2,
    body:p=>{ const spot=pick(['the abandoned house at the end of the street','the roof of the old factory','the storm drain that runs under the road']); p._dareSpot=spot; return `The other kids are daring each other to go into ${spot}. Everyone's watching to see if ${p.first} will.`; },
    choices:[
      {label:'Do it — impress them', sub:'risky', effect:p=>{ if(chance(55)){ setFlag(p,'ch_riskTaker',true); fx(p,{happy:8,athletic:2}); addTrait(p,'brave',true); return `${p.first} did it and came back grinning. Legend status on the block, and a taste for the edge.`;} const r=rnd(100); if(r<45){ fx(p,{health:-12}); return `${p.first} slipped and got hurt — a bad fall, a worse scar, and a story they'd tell for years.`;} if(r<75){ fx(p,{stress:10,happy:-4}); return `${p.first} got stuck and had to be rescued, sirens and all. Mortifying.`;} fx(p,{smarts:3,stress:6}); return `Inside, ${p.first} found something they weren't supposed to see — and backed out fast, heart pounding.`; }},
      {label:'Refuse, take the social hit', sub:'+sense', effect:p=>{ fx(p,{happy:-4,smarts:3}); addTrait(p,'disciplined',true); return `${p.first} said no and ate the laughter. Not every dare is worth your neck.`; }},
      {label:'Suggest something less crazy', sub:'+clever', effect:p=>{ fx(p,{smarts:4,happy:3}); addTrait(p,'creative',true); return `${p.first} talked the crowd into a tamer version — saved face and skin both.`; }},
    ]},

  // --- The Hidden Thing (CHAIN-SHORT) ------------------------------
  { id:'ch_hidden', emoji:'🗝️', title:'The Hidden Thing', once:true,
    when:p=>p.age>=7&&p.age<=11, weight:2,
    body:p=>{ const obj=pick([['a roll of cash','cash'],['a stack of old photographs of people you don\'t recognize','photos'],['a sealed, yellowed letter','letter'],['something small, metal, and frightening wrapped in a rag','weapon']]); p._hiddenObj=obj[0]; p._hiddenType=obj[1]; return `Pushed to the back of a drawer where it wasn't meant to be found, ${p.first} discovers ${obj[0]}.`; },
    choices:[
      {label:'Take it', sub:'risky', effect:p=>{ const t=p._hiddenType; if(t==='cash'){ const a=40+rnd(200); fx(p,{money:a,stress:6}); return `${p.first} pocketed ${money(a)}. It turned out to be the family's emergency fund — and now it's short.`;} if(t==='weapon'){ fx(p,{stress:12,health:-4}); return `${p.first} took it, and the weight of it scared them straight back to the drawer that night.`;} fx(p,{stress:6}); setFlag(p,'ch_hiddenSecret',true); setFlag(p,'ch_hiddenType',t); return `${p.first} took it and hid it somewhere of their own. A secret, kept.`; }},
      {label:'Leave it where you found it', sub:'safe', effect:p=>{ fx(p,{smarts:2}); return `${p.first} closed the drawer and walked away. Some doors are better left shut — for now.`; }},
      {label:'Ask a parent about it', sub:'+truth', effect:p=>{ const par=aliveParent(p); const t=p._hiddenType; if(t==='photos'||t==='letter'){ if(par)par.bond=clamp(par.bond+(chance(50)?8:-8)); fx(p,{smarts:3}); return chance(50)?`${fname(par)} went quiet, then told ${p.first} a story about who they used to be. It reframed everything.`:`${fname(par)} took it from ${p.first}'s hands without a word and never spoke of it again.`;} fx(p,{smarts:2}); return `${fname(par)} explained, more or less. The mystery shrank to something ordinary.`; }},
      {label:'Tell your sibling', sub:'needs a sibling', need:p=>!!aliveSibling(p), effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+6); if(p._hiddenType==='photos'||p._hiddenType==='letter'){ setFlag(p,'ch_hiddenSecret',true); setFlag(p,'ch_hiddenType',p._hiddenType);} return `${p.first} showed ${fname(sib)}. Now two kids are puzzling over the same family ghost.`; }},
    ]},
  // payoff — secret photos/letter resurface at 35–45
  { id:'ch_hidden_return', emoji:'📜', title:'The Story Behind the Drawer', once:true,
    when:p=>p.age>=35&&p.age<=45&&hasFlag(p,'ch_hiddenSecret'), weight:5,
    body:p=>`The thing from that drawer — the photographs, the letter ${p.first} kept all these years — has suddenly become relevant. A name from it has resurfaced in the family's life.`,
    choices:[
      {label:'Bring out what you kept', sub:'reveal it', effect:p=>{ clearFlag(p,'ch_hiddenSecret'); fx(p,{smarts:4,happy:4}); return `${p.first} produced the long-hidden proof. It answered a question the family had stopped asking out loud.`; }},
      {label:'Keep the secret a little longer', sub:'carry it', effect:p=>{ fx(p,{stress:8}); return `${p.first} decided the world wasn't ready. The drawer's secret stayed ${p.first}'s alone.`; }},
    ]},

  // --- The First Loss (SINGLE, sibling) ----------------------------
  { id:'ch_sib_first', emoji:'😤', title:'The First Loss', once:true,
    when:p=>p.age>=8&&p.age<=11&&!!aliveSibling(p), weight:1.8,
    body:p=>{ const sib=aliveSibling(p); const wrong=pick(['broke your favorite thing','took credit for something you made','told your parents a thing you swore them to secrecy on']); return `${capFirst(fname(sib))} ${wrong}. It's the kind of small betrayal that decides how you'll feel about each other for years.`; },
    choices:[
      {label:'Retaliate', sub:'evens the score', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-10); return `${p.first} got even. The feud was on — for a while, anyway.`; }},
      {label:'Forgive them', sub:'+bond', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+14); fx(p,{happy:4}); return `${p.first} let it go and meant it. ${capFirst(fname(sib))} never forgot the grace.`; }},
      {label:'Tell on them', sub:'safe', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-4); return `${p.first} reported it up the chain. Justice, of a kind.`; }},
      {label:'Let it go — they\'re younger', sub:'patient', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+6); addTrait(p,'optimist',true); return `${p.first} chalked it up to them being little. The bigger person, at a small age.`; }},
    ]},

  // --- Staying Home Alone (CHAIN-SHORT) ----------------------------
  { id:'ch_home_alone', emoji:'🏠', title:'Staying Home Alone', once:true,
    when:p=>p.age>=9&&p.age<=11, weight:2,
    body:p=>`The parents are out for the evening, and for the first time it's just ${p.first} and the quiet house. A milestone — and a test.`,
    choices:[
      {label:'Hold down the fort', sub:'+independence',
        effect:p=>{ if(chance(55)){ fx(p,{happy:6,smarts:3}); setFlag(p,'ch_pressure','handles'); p._haEmerg=null; return `An ordinary evening, handled like a pro. ${capFirst(p.first)} liked the feeling of being trusted.`;} p._haEmerg=pick(['a stranger knocked, insistent','the power cut out with a bang','a faint smell of smoke from the kitchen']); return ``; },
        then:p=>{ if(!p._haEmerg) return null; const e=p._haEmerg; p._haEmerg=null;
          return { id:'ch_home_alone_emerg', emoji:'⚠️', title:'Alone, and Something\'s Wrong', once:true, when:()=>true,
            body:q=>`${e[0].toUpperCase()+e.slice(1)}. Nobody's home but ${q.first}.`,
            choices:[
              {label:'Handle it yourself', sub:'rise to it', effect:q=>{ if(chance(60)){ fx(q,{smarts:4,happy:4}); setFlag(q,'ch_pressure','handles'); addTrait(q,'brave',true); return `${q.first} stayed cool, did the right thing, and had it sorted before the parents got home.`;} fx(q,{health:-6,stress:8}); return `${q.first} tried, fumbled it, and it got scary before it got better. A hard lesson.`; }},
              {label:'Call for help', sub:'smart', effect:q=>{ fx(q,{smarts:3,happy:2}); setFlag(q,'ch_pressure','handles'); return `${q.first} called the right people and let the grown-ups take it from there. Exactly right.`; }},
              {label:'Freeze', sub:'overwhelmed', effect:q=>{ fx(q,{stress:12,health:-4}); setFlag(q,'ch_pressure','freezes'); addTrait(q,'anxious',true); return `${q.first} locked up, heart hammering, until it passed on its own. The fear stuck around.`; }},
            ]}; }},
      {label:'Call a parent the second you\'re nervous', sub:'cautious', effect:p=>{ fx(p,{happy:2}); return `${p.first} called at the first creak of the house. There's no shame in knowing your limits.`; }},
    ]},

  // --- Moving Day (CHAIN-LONG, rare) -------------------------------
  { id:'ch_moving', emoji:'📦', title:'Moving Day', once:true,
    when:p=>p.age>=5&&p.age<=12&&!hasFlag(p,'ch_moved'), weight:0.8,
    body:p=>`It's official: the whole family is moving to a new city. ${capFirst(p.first)}'s entire world — the street, the school, the friends — is being left behind.`,
    choices:[
      {label:'Embrace it as an adventure', sub:'+resilience', effect:p=>{ setFlag(p,'ch_moved','embraced'); setFlag(p,'ch_leftFriend',true); fx(p,{happy:4,smarts:2}); addTrait(p,'optimist',true); return `${p.first} decided a new city meant a new everything. Bring it on.`; }},
      {label:'Rage against it', sub:'-joy now', effect:p=>{ setFlag(p,'ch_moved','raged'); setFlag(p,'ch_leftFriend',true); fx(p,{happy:-10,stress:10}); return `${p.first} fought it every mile. You can't argue with a moving truck, but ${p.first} tried.`; }},
      {label:'Quietly grieve what you\'re leaving', sub:'tender', effect:p=>{ setFlag(p,'ch_moved','grieved'); setFlag(p,'ch_leftFriend',true); fx(p,{happy:-6,smarts:3}); return `${p.first} said goodbye to each room in turn, and carried the old place inside them.`; }},
    ]},
  // beat — the friend left behind writes at 16
  { id:'ch_moving_letter', emoji:'✉️', title:'A Message From the Old City', once:true,
    when:p=>p.age>=15&&p.age<=17&&hasFlag(p,'ch_leftFriend'), weight:6,
    body:p=>`Out of nowhere, a message arrives from the friend ${p.first} left behind when the family moved, all those years ago. "Do you even remember me?"`,
    choices:[
      {label:'Reconnect', sub:'rekindle it', effect:p=>{ setFlag(p,'ch_oldFriendKept',true); clearFlag(p,'ch_leftFriend'); addContact(p, null, 'Friend', 55); fx(p,{happy:8}); return `${p.first} wrote back, and the old thread picked up like no time had passed at all.`; }},
      {label:'Let it fade', sub:'move on', effect:p=>{ clearFlag(p,'ch_leftFriend'); fx(p,{happy:-3}); return `${p.first} meant to reply, and then didn't. Some doors close softly.`; }},
    ]},
  // beat — the reconnected friend reappears at 30
  { id:'ch_moving_friend30', emoji:'🤝', title:'The Friend Who Came Back', once:true,
    when:p=>p.age>=29&&p.age<=33&&hasFlag(p,'ch_oldFriendKept'), weight:5,
    body:p=>`The childhood friend from the old city — the one ${p.first} reconnected with as a teen — is passing through town, fully grown, with a life of their own now.`,
    choices:[
      {label:'Spend real time together', sub:'+deep friendship', effect:p=>{ clearFlag(p,'ch_oldFriendKept'); const f=p.rels.find(r=>r.kind==='Friend'&&r.alive); if(f)f.bond=clamp(f.bond+20); fx(p,{happy:12}); return `Two lives that started on the same street, briefly side by side again. A friendship that survived a move and a lifetime.`; }},
      {label:'A quick coffee, then back to your life', sub:'+joy', effect:p=>{ fx(p,{happy:5}); return `An hour, a hug, and the comfortable knowledge that some bonds just hold.`; }},
    ]},
  // beat — chance to return to the birth city at 28–35
  { id:'ch_moving_return', emoji:'🧭', title:'A Reason to Go Back', once:true,
    when:p=>p.age>=28&&p.age<=35&&hasFlag(p,'ch_moved'), weight:5,
    body:p=>{ const feel=p.flags.ch_moved; const tone=feel==='raged'?`The city ${p.first} was dragged away from`:feel==='grieved'?`The city ${p.first} quietly mourned for years`:`The city of ${p.first}'s earliest memories`; const city=(p.birthplace||'the old city').split(',')[0]; return `An opportunity comes up to return to ${city} — to live, to work, to close a loop. ${tone} is calling.`; },
    choices:[
      {label:'Go back', sub:'full circle', effect:p=>{ clearFlag(p,'ch_moved'); fx(p,{happy:10,stress:-6}); return `${p.first} went home — really home. It was smaller than they remembered, and exactly as important.`; }},
      {label:'Stay where your life is now', sub:'forward', effect:p=>{ clearFlag(p,'ch_moved'); fx(p,{smarts:3}); return `${p.first} let the old city stay a memory. The life they built here is the real one now.`; }},
    ]},

  // --- The Championship (CHAIN-SHORT) ------------------------------
  { id:'ch_championship', emoji:'🏅', title:'The Championship', once:true,
    when:p=>p.age>=8&&p.age<=12&&p.stats.athletic>=48, weight:2.2,
    body:p=>`The whole season comes down to this — final game, final moment, and the play runs through ${p.first}. The stands are full. ${capFirst(p.first)} scans them for one face.`,
    choices:[
      {label:'Take the shot', sub:'glory or heartbreak', effect:p=>{ const par=aliveParent(p); const parThere = par && par.bond>45; if(!parThere && par) setFlag(p,'ch_champWound',true); if(chance(55)){ fx(p,{fame:8,happy:12,athletic:3}); addTrait(p,'confident',true); return parThere?`${p.first} buried it at the buzzer — and ${fname(par)} was on their feet screaming. A perfect memory.`:`${p.first} buried it at the buzzer. The crowd roared. But the one seat that mattered was empty.`;} fx(p,{happy:-10,stress:10}); if(chance(50)){ addTrait(p,'disciplined',true); return `${p.first} missed — and took it on the chin, already thinking about next season. Real composure.`;} addTrait(p,'anxious',true); return `${p.first} missed, and fell apart. The walk off the court felt a mile long.`; }},
      {label:'Pass to a teammate', sub:'+humility', effect:p=>{ fx(p,{happy:4,smarts:2}); addTrait(p,'optimist',true); return `${p.first} made the right basketball play and trusted a teammate. Win or lose, that's character.`; }},
    ]},

  // --- Free Music Lessons (CHAIN-LONG) -----------------------------
  { id:'ch_music', emoji:'🎻', title:'Free Music Lessons', once:true,
    when:p=>p.age>=7&&p.age<=10, weight:1.8,
    body:p=>`A kind neighbor who teaches music offers to give ${p.first} lessons for free. Just a chance — no pressure, no cost.`,
    choices:[
      {label:'Take the lessons', sub:'+a spark', effect:p=>{ setFlag(p,'ch_musicLessons',true); fx(p,{fame:3,happy:5,smarts:2}); return `${p.first} started learning. The first squeaky notes were terrible, and they loved every one.`; }},
      {label:'Politely decline', sub:'clean', effect:p=>{ fx(p,{happy:2}); return `${p.first} wasn't interested. No harm, no story.`; }},
    ]},
  // beat — practice follow-up (next year), strengthens the head start
  { id:'ch_music_practice', emoji:'🎶', title:'Keep Practicing?', once:true,
    when:p=>p.age>=9&&p.age<=13&&hasFlag(p,'ch_musicLessons'), weight:5,
    body:p=>`Two years in, the lessons have stopped being easy. Real progress now means real practice — the boring, daily kind.`,
    choices:[
      {label:'Put in the hours', sub:'head start on music', effect:p=>{ p.flags.ch_musicPractice=(p.flags.ch_musicPractice||0)+1; fx(p,{fame:5,smarts:3,happy:3}); addTrait(p,'disciplined',true); return `${p.first} practiced until the calluses came. Talent meeting work — the best kind of head start.`; }},
      {label:'Let it become a hobby', sub:'relaxed', effect:p=>{ fx(p,{happy:4}); return `${p.first} kept playing just for fun, no pressure. Music as joy, not a job.`; }},
    ]},
  // beat — the music teacher reaches out at ~22
  { id:'ch_music_teacher', emoji:'📻', title:'The Teacher Who Believed in You', once:true,
    when:p=>p.age>=21&&p.age<=24&&hasFlag(p,'ch_musicLessons'), weight:5,
    body:p=>{ const news=chance(50); p._mtStruggle=news; return news?`The old neighbor who gave ${p.first} free music lessons has fallen on hard times, and has quietly reached out — not asking, exactly, but ${p.first} can hear it.`:`The old neighbor who taught ${p.first} music has news: they've finally gotten their own break, late in life, and the first person they wanted to tell was ${p.first}.`; },
    choices:[
      {label:'Show up for them', sub:'+karma', effect:p=>{ clearFlag(p,'ch_musicLessons'); if(p._mtStruggle){ const give=Math.min(p.money,2000+rnd(4000)); fx(p,{money:-give,happy:10}); return `${p.first} helped however they could — money, time, presence. You don't forget the people who gave you a start for free.`;} fx(p,{happy:10,fame:3}); return `${p.first} drove out to celebrate with them. A full-circle joy.`; }},
      {label:'Send your best and move on', sub:'+joy', effect:p=>{ clearFlag(p,'ch_musicLessons'); fx(p,{happy:3}); return `${p.first} sent warm words and let it be. Kind enough.`; }},
    ]},

  /* ========================================================
     PART 2 — ADOLESCENCE (13–18)
     ======================================================== */

  // --- Substances at the Party (CHAIN-LONG) ------------------------
  { id:'ch_party_substance', emoji:'🥤', title:'At the Party', once:true,
    when:p=>p.age>=15&&p.age<=17, weight:2.2,
    body:p=>`The party's loud and the parents are gone. Someone presses a cup into ${p.first}'s hand with a grin. "Come on. Live a little." It's the first real offer.`,
    choices:[
      {label:'Try it', sub:'curious', effect:p=>{ setFlag(p,'ch_triedSubstances',true); addContact(p,null,'Friend',50); fx(p,{happy:5}); return `${p.first} tried it. The room got warmer and the night got blurrier. No big deal — that night, anyway.`; }},
      {label:'Decline', sub:'against the crowd', effect:p=>{ setFlag(p,'ch_wentAgainstCrowd',true); fx(p,{happy:-2,smarts:2}); addTrait(p,'disciplined',true); return `${p.first} handed the cup back. A few smirks, a little distance — and a spine that'll matter later.`; }},
      {label:'Pretend to drink', sub:'fit in safely', effect:p=>{ fx(p,{happy:2,smarts:3}); addTrait(p,'creative',true); return `${p.first} held the cup, played along, and quietly never sipped. Social camouflage, mastered.`; }},
      {label:'Leave', sub:'exit', effect:p=>{ fx(p,{happy:-3}); return `${p.first} slipped out and walked home under the streetlights. Not their scene.`; }},
    ]},
  // beat — the person who offered it, at 22–25
  { id:'ch_party_followup', emoji:'🍻', title:'The One Who Offered', once:true,
    when:p=>p.age>=22&&p.age<=25&&hasFlag(p,'ch_triedSubstances'), weight:4.5,
    body:p=>`The friend from that first party — the one who handed ${p.first} the cup — is back in the picture. The years have either been kind to them or very much not.`,
    choices:[
      {label:'Check in on them properly', sub:'+bond', effect:p=>{ clearFlag(p,'ch_triedSubstances'); const f=p.rels.find(r=>r.kind==='Friend'&&r.alive); const ok=chance(50); if(ok){ if(f)f.bond=clamp(f.bond+12); fx(p,{happy:6}); return `They're doing well — settled, happy. A good catch-up, no ghosts.`;} if(f)f.bond=clamp(f.bond+6); fx(p,{happy:-4,stress:6}); return `They're not okay. The same appetite that started a party years ago has them by the throat now. ${capFirst(p.first)} sees a version of a road they didn't take.`; }},
      {label:'Keep your distance', sub:'self-protective', effect:p=>{ clearFlag(p,'ch_triedSubstances'); fx(p,{smarts:2}); return `${p.first} kept it to a wave across the room. Some company you outgrow on purpose.`; }},
    ]},

  // --- Someone Tells You Something (CHAIN-LONG) --------------------
  { id:'ch_friend_confides', emoji:'🤫', title:'Someone Tells You Something', once:true,
    when:p=>p.age>=14&&p.age<=17&&!!anyFriend(p), weight:2,
    body:p=>{ const f=anyFriend(p); const sec=pick(['things are bad at home — really bad','they\'ve been using, and it\'s getting away from them','they\'re tangled up with someone dangerous','they\'re drowning in a way they can\'t say out loud to anyone else']); p._fcSec=sec; return `${capFirst(fname(f))} pulls ${p.first} aside, voice shaking. They confess that ${sec}. "You can't tell anyone."`; },
    choices:[
      {label:'Help them yourself', sub:'+loyalty, heavy', effect:p=>{ setFlag(p,'ch_friendSecret','helped'); const f=anyFriend(p); if(f)f.bond=clamp(f.bond+18); fx(p,{stress:8,happy:2}); return `${p.first} stepped in directly — over their head, maybe, but they didn't look away. ${capFirst(fname(f))} won't forget it.`; }},
      {label:'Tell a trusted adult', sub:'risky but real', effect:p=>{ setFlag(p,'ch_friendSecret','toldAdult'); const f=anyFriend(p); if(f)f.bond=clamp(f.bond-12); fx(p,{stress:6}); return `${p.first} broke the promise to get real help involved. ${capFirst(fname(f))} feels betrayed right now. Time will judge it.`; }},
      {label:'Keep the secret', sub:'loyal, dangerous', effect:p=>{ setFlag(p,'ch_friendSecret','kept'); const f=anyFriend(p); if(f)f.bond=clamp(f.bond+8); return `${p.first} kept their word and told no one. The weight of it settles onto two young shoulders.`; }},
      {label:'Distance yourself — it\'s too much', sub:'self-preserving', effect:p=>{ setFlag(p,'ch_friendSecret','distanced'); const f=anyFriend(p); if(f)f.bond=clamp(f.bond-20); fx(p,{happy:-4}); return `${p.first} pulled back. It was too big to carry, so they set the whole friendship down.`; }},
    ]},
  // beat — kept the secret and it got worse: 20–22
  { id:'ch_friend_worse', emoji:'📞', title:'The Secret You Carried', once:true,
    when:p=>p.age>=20&&p.age<=22&&hasFlag(p,'ch_friendSecret')&&p.flags.ch_friendSecret==='kept', weight:5,
    body:p=>`A call ${p.first} half-knew was coming. The friend whose secret they kept all those years ago — it caught up with them. Badly.`,
    choices:[
      {label:'Be there now, fully', sub:'+presence', effect:p=>{ clearFlag(p,'ch_friendSecret'); fx(p,{stress:10,happy:4}); return `${p.first} showed up and stayed through the worst of it. Late, maybe, but they came.`; }},
      {label:'Wonder if you should have told someone', sub:'guilt', effect:p=>{ clearFlag(p,'ch_friendSecret'); fx(p,{happy:-8,stress:10}); addTrait(p,'pessimist',true); return `${p.first} couldn't shake the thought: a word to the right adult, years ago, might have changed this. The loyalty cost something.`; }},
    ]},
  // beat — distanced: friend returns at 35
  { id:'ch_friend_return35', emoji:'🚪', title:'The One You Walked Away From', once:true,
    when:p=>p.age>=34&&p.age<=37&&hasFlag(p,'ch_friendSecret')&&p.flags.ch_friendSecret==='distanced', weight:4.5,
    body:p=>`Decades on, the friend ${p.first} backed away from as a teenager finds them again. They made it through — alone, no thanks to ${p.first} — and they want to talk.`,
    choices:[
      {label:'Own it and apologize', sub:'+repair', effect:p=>{ clearFlag(p,'ch_friendSecret'); fx(p,{happy:8,stress:-4}); return `${p.first} admitted they'd failed a friend who needed them. The apology, decades late, still landed.`; }},
      {label:'Stay polite but guarded', sub:'unresolved', effect:p=>{ clearFlag(p,'ch_friendSecret'); fx(p,{happy:-3}); return `${p.first} kept it surface-level. The old guilt stayed exactly where it had always been.`; }},
    ]},

  // --- The Online Persona (CHAIN-SHORT) ----------------------------
  { id:'ch_persona', emoji:'📱', title:'The Online Persona', once:true,
    when:p=>p.age>=13&&p.age<=15, weight:2,
    body:p=>`${capFirst(p.first)} is setting up their first real online presence. The first choice is the one that shapes all the rest: who are you going to be on here?`,
    choices:[
      {label:'Authentic — just yourself', sub:'real, vulnerable', effect:p=>{ setFlag(p,'ch_persona','authentic'); fx(p,{happy:4}); addTrait(p,'confident',true); return `${p.first} posted as themselves, warts and all. Honest — which is its own kind of brave online.`; }},
      {label:'Curated — the highlight reel', sub:'polished', effect:p=>{ setFlag(p,'ch_persona','curated'); fx(p,{looks:3,fame:3}); return `${p.first} built a clean, aspirational feed. Looks great. Costs a little something to maintain.`; }},
      {label:'Anonymous — hide behind a handle', sub:'free, hidden', effect:p=>{ setFlag(p,'ch_persona','anonymous'); fx(p,{smarts:3}); return `${p.first} stayed faceless and said what they really thought. Freedom, with no name attached.`; }},
      {label:'Don\'t participate', sub:'offline', effect:p=>{ setFlag(p,'ch_persona','none'); fx(p,{health:2,smarts:2}); return `${p.first} just… didn't. While everyone else performed, ${p.first} lived offline.`; }},
    ]},
  // beat — taken out of context at 16–17
  { id:'ch_persona_scrutiny', emoji:'🔥', title:'Taken Out of Context', once:true,
    when:p=>p.age>=16&&p.age<=17&&hasFlag(p,'ch_persona')&&p.flags.ch_persona!=='none', weight:5,
    body:p=>`Something ${p.first} posted is making the rounds, stripped of context and twisted into something it wasn't. The pile-on is fast and ugly.`,
    choices:[
      {label:'Delete it and lay low', sub:'retreat', effect:p=>{ fx(p,{happy:-4,stress:6}); setFlag(p,'ch_scrutiny','fragile'); return `${p.first} scrubbed it and went dark for a while. It blew over, but the flinch stayed.`; }},
      {label:'Calmly explain yourself', sub:'+poise', effect:p=>{ if(chance(55)){ fx(p,{fame:4,happy:4}); setFlag(p,'ch_scrutiny','handles'); addTrait(p,'confident',true); return `${p.first} addressed it head-on, no drama, and most people came around. Grace under fire.`;} fx(p,{stress:6}); setFlag(p,'ch_scrutiny','handles'); return `${p.first} explained, and some listened and some didn't. Either way, they didn't run.`; }},
      {label:'Ignore it completely', sub:'unbothered', effect:p=>{ fx(p,{smarts:3}); setFlag(p,'ch_scrutiny','handles'); return `${p.first} didn't dignify it with a response, and let it starve. It did.`; }},
      {label:'Double down', sub:'fan the flames', effect:p=>{ if(chance(45)){ fx(p,{fame:8,happy:4}); return `${p.first} leaned all the way in — and somehow turned the mob into an audience.`;} fx(p,{fame:-4,stress:8}); setFlag(p,'ch_scrutiny','fragile'); return `${p.first} poured fuel on it. It got bigger and meaner. A lesson learned the hard way.`; }},
    ]},

  // --- The Big Ask (CHAIN-SHORT, romance) --------------------------
  { id:'ch_bigask', emoji:'💐', title:'The Big Ask', once:true,
    when:p=>p.age>=17&&p.age<=18&&!p.rels.some(r=>(r.kind==='Partner'||r.kind==='Spouse')&&r.alive), weight:2,
    body:p=>`There's someone. ${capFirst(p.first)} has been quietly carrying a crush for months, and the big school dance is coming. It's now or never. How do you ask?`,
    choices:[
      {label:'Just ask, plainly', sub:'direct', effect:p=>{ p._askMode='direct'; return ``; }, then:p=>askResult(p)},
      {label:'A big, elaborate gesture', sub:'high-risk, high-reward', effect:p=>{ p._askMode='grand'; return ``; }, then:p=>askResult(p)},
      {label:'Send a friend to test the waters', sub:'cautious', effect:p=>{ p._askMode='friend'; return ``; }, then:p=>askResult(p)},
      {label:'Wait for the right casual moment', sub:'low-key', effect:p=>{ p._askMode='casual'; return ``; }, then:p=>askResult(p)},
    ]},
  // long beat — the crush reappears at 28–32
  { id:'ch_bigask_return', emoji:'🌆', title:'Someone From Before', once:true,
    when:p=>p.age>=28&&p.age<=32&&hasFlag(p,'ch_crushName'), weight:4,
    body:p=>`In the most ordinary way — a line, a waiting room, a mutual friend's thing — ${p.first} runs into ${p.flags.ch_crushName}, the crush from that school dance. Life has happened to both of them since.`,
    choices:[
      {label:'Catch up, no agenda', sub:'just a moment', effect:p=>{ clearFlag(p,'ch_crushName'); fx(p,{happy:6}); return `Twenty minutes of "whatever happened to" and "do you remember." No spark to chase, just a warm, closed loop.`; }},
      {label:'See if there\'s still something there', sub:'if you\'re single', need:p=>!p.rels.some(r=>(r.kind==='Partner'||r.kind==='Spouse')&&r.alive), effect:p=>{ clearFlag(p,'ch_crushName'); if(chance(45)){ const sx=partnerSex(p); p.rels.push({name:p.flags.ch_crushName?p.flags.ch_crushName+' '+pick(LAST):newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:55+rnd(20),alive:true,id:nid()}); fx(p,{happy:12}); return `The years had cleared away whatever stood in the way the first time. They exchanged numbers — and meant it.`;} fx(p,{happy:3}); return `The timing still wasn't right, but it was good to wonder out loud, just once.`; }},
    ]},

  // --- Parent Health Scare (CHAIN-LONG) ----------------------------
  { id:'ch_parent_scare', emoji:'🏥', title:'Parent Health Scare', once:true,
    when:p=>p.age>=14&&p.age<=17&&!!aliveParent(p), weight:2,
    body:p=>{ const par=aliveParent(p); return `${capFirst(fname(par))} is in the hospital. It's serious — surgery, an unfamiliar word, a long wait in a bright corridor. Not the end, but the first time ${p.first} truly understood it could be.`; },
    choices:[
      {label:'Step up and take responsibility', sub:'+maturity', effect:p=>{ setFlag(p,'ch_healthScare','stepped'); const par=aliveParent(p); if(par)par.bond=clamp(par.bond+12); fx(p,{stress:8,smarts:3}); addTrait(p,'disciplined',true); return `${p.first} took over what they could — the house, the siblings, the brave face. Years older in a week.`; }},
      {label:'Fall apart', sub:'human', effect:p=>{ setFlag(p,'ch_healthScare','fell'); fx(p,{happy:-10,stress:12}); return `${p.first} couldn't hold it together, and didn't pretend to. Sometimes there's nothing else to do.`; }},
      {label:'Pretend everything\'s fine', sub:'mask it', effect:p=>{ setFlag(p,'ch_healthScare','pretended'); fx(p,{stress:10}); return `${p.first} smiled and said "I'm okay" to everyone, including themselves. The fear went underground.`; }},
      {label:'Run from it emotionally', sub:'detach', effect:p=>{ setFlag(p,'ch_healthScare','ran'); fx(p,{happy:-4,stress:6}); return `${p.first} stayed at friends' houses and out of the hospital. If you don't look at it, maybe it isn't real.`; }},
    ]},
  // beat — own health scare in 40s–50s echoes the teen response
  { id:'ch_own_scare', emoji:'🩺', title:'Your Turn in the Bright Corridor', once:true,
    when:p=>p.age>=45&&p.age<=55&&hasFlag(p,'ch_healthScare'), weight:4.5,
    body:p=>`Now it's ${p.first} in the paper gown, waiting on results that matter. The old feeling comes back — and with it, the way they learned to handle this as a kid.`,
    choices:[
      {label:'Face it the way you wish you had then', sub:'+health', effect:p=>{ clearFlag(p,'ch_healthScare'); fx(p,{health:6,stress:-8,happy:4}); return `Whatever ${p.first} did at fifteen, this time they met it clear-eyed — got the care, told the truth, let people in. It made all the difference.`; }},
      {label:'Fall into the old pattern', sub:'-health', effect:p=>{ const f=p.flags.ch_healthScare; clearFlag(p,'ch_healthScare'); if(f==='stepped'){ fx(p,{health:4,stress:-4}); return `Decades of competence kicked in. ${capFirst(p.first)} handled it like they handle everything — and mostly that worked.`;} fx(p,{health:-10,stress:10}); return `${p.first} did exactly what they did as a teenager — pretended, ran, masked. The body doesn't accept excuses.`; }},
    ]},

  // --- Sibling in Trouble (CHAIN-SHORT) ----------------------------
  { id:'ch_sib_trouble', emoji:'🚨', title:'Sibling in Trouble', once:true,
    when:p=>p.age>=13&&p.age<=17&&!!aliveSibling(p), weight:2,
    body:p=>{ const sib=aliveSibling(p); const t=pick(['caught with something they shouldn\'t have','suspended and spiraling','running with a crowd that scares you','in real danger and in over their head']); return `${capFirst(fname(sib))} is ${t}. They came to ${p.first} first, before the parents, before anyone.`; },
    choices:[
      {label:'Help them yourself', sub:'risky loyalty', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond+16); if(chance(30)){ fx(p,{stress:8,happy:-2}); return `${p.first} dove in to help — and got splashed by it themselves. Guilt by association, but ${fname(sib)} knows who showed up.`;} fx(p,{happy:4}); return `${p.first} pulled their sibling back from the edge, quietly, before it got worse.`; }},
      {label:'Tell your parents', sub:'safe, costly', effect:p=>{ const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-12); return `${p.first} told. ${capFirst(fname(sib))} was furious — and maybe, someday, grateful. Maybe.`; }},
      {label:'Stay out of it', sub:'neutral', effect:p=>{ fx(p,{happy:-2}); return `${p.first} let their sibling sort it out alone. They did, more or less. A missed chance to be close.`; }},
      {label:'File it away to use later', sub:'cold', effect:p=>{ setFlag(p,'ch_leverageFamily',true); const sib=aliveSibling(p); if(sib)sib.bond=clamp(sib.bond-6); return `${p.first} filed it away. You never know when knowing something about family might come in handy.`; }},
    ]},

  // --- The Part-Time Job: What You Do With the Money (CHAIN-SHORT) --
  { id:'ch_firstpay', emoji:'💵', title:'The First Paycheck', once:true,
    when:p=>p.age>=14&&p.age<=16, weight:2,
    body:p=>`${capFirst(p.first)} is holding their first real paycheck — earned, not given. Small, but entirely theirs. What happens to it says a lot.`,
    choices:[
      {label:'Spend it all right now', sub:'+joy', effect:p=>{ fx(p,{happy:10,money:-Math.min(p.money,40)}); return `${p.first} blew the whole thing on something gloriously unnecessary. No regrets — that's what being sixteen is for.`; }},
      {label:'Save half', sub:'+future windfall', effect:p=>{ setFlag(p,'ch_savedPay',true); fx(p,{smarts:3,money:50}); return `${p.first} tucked half away without quite knowing why. Small habit, big idea.`; }},
      {label:'Give it to the family', sub:'+generosity', effect:p=>{ const par=aliveParent(p); if(par)par.bond=clamp(par.bond+14); fx(p,{happy:4}); addTrait(p,'optimist',true); return `${p.first} handed it over without being asked. If the family was stretched, it meant more than the money.`; }},
      {label:'Invest it in something', sub:'smarts check', effect:p=>{ if(p.stats.smarts>55||chance(40)){ const g=200+rnd(800); fx(p,{money:g,smarts:3}); return `${p.first} put it into something small and clever, and it actually grew. A spark of the investor to come.`;} fx(p,{money:-Math.min(p.money,30),smarts:2}); return `${p.first} put it into a "sure thing" that wasn't. Lesson learned cheap, at least.`; }},
    ]},
  // beat — the saved money becomes useful at ~22
  { id:'ch_firstpay_windfall', emoji:'🪙', title:'The Habit That Paid Off', once:true,
    when:p=>p.age>=21&&p.age<=23&&hasFlag(p,'ch_savedPay'), weight:4,
    body:p=>`A small cushion of money — the saving habit ${p.first} started as a teenager, quietly kept up — turns out to be exactly what's needed at exactly the right moment.`,
    choices:[
      {label:'Use it for something that matters', sub:'+stability', effect:p=>{ clearFlag(p,'ch_savedPay'); const v=2000+rnd(6000); fx(p,{money:v,happy:6,smarts:2}); return `Years of small deposits had become real money — ${money(v)} — right when ${p.first} needed a foothold.`; }},
      {label:'Keep building it', sub:'+discipline', effect:p=>{ clearFlag(p,'ch_savedPay'); fx(p,{smarts:4,money:1000}); addTrait(p,'disciplined',true); return `${p.first} left it to grow and kept the habit going. Compounding — of money and of character.`; }},
    ]},

  // --- The Academic Ethics Test (CHAIN-SHORT, college) -------------
  { id:'ch_ethics_test', emoji:'📚', title:'The Academic Ethics Test', once:true,
    when:p=>p.age>=18&&p.age<=23&&p.inSchool, weight:1.8,
    body:p=>{ const o=pick(['a classmate offers to sell ${p.first} a finished paper','${p.first} stumbles onto the exam answers, wide open','${p.first} could quietly take sole credit for a group project they barely touched']); return `Temptation, dressed as opportunity: ${o.replace(/\$\{p\.first\}/g,p.first)}. Nobody would have to know.`; },
    choices:[
      {label:'Do it', sub:'risky', effect:p=>{ p._ethDid=true; fx(p,{happy:3,smarts:-2}); return `${p.first} took the shortcut. The grade landed and nobody blinked — easy, almost too easy.`; }, then:p=>{ if(chance(15)){ return ethicsInvestigation(p); } return null; }},
      {label:'Don\'t do it', sub:'+integrity', effect:p=>{ fx(p,{smarts:5,stress:4}); addTrait(p,'disciplined',true); return `${p.first} earned it the slow way. Cost a few points and a few hours of sleep, bought a clean conscience.`; }},
      {label:'Report it', sub:'complicated', effect:p=>{ if(chance(50)){ fx(p,{smarts:3,happy:-2}); return `${p.first} reported it. The person on the other end took it… personally. Doing right made an enemy.`;} fx(p,{smarts:3,fame:2}); return `${p.first} reported it, and quietly earned a reputation with the right faculty.`; }},
    ]},

  // --- Study Abroad Aftermath (CHAIN-LONG) -------------------------
  // hooks into the existing 'studiedAbroad' flag set by the study_abroad event
  { id:'ch_abroad_gap', emoji:'🌍', title:'You Came Back Changed', once:true,
    when:p=>p.age>=19&&p.age<=24&&hasFlag(p,'studiedAbroad')&&!hasFlag(p,'ch_abroadProcessed'), weight:5,
    body:p=>`Back home after the semester abroad, ${p.first} keeps reaching for words that don't land. Friends nod politely. Something shifted over there that doesn't translate.`,
    choices:[
      {label:'Embrace the gap', sub:'+growth', effect:p=>{ setFlag(p,'ch_abroadProcessed',true); setFlag(p,'ch_abroadFriend',true); fx(p,{smarts:5,happy:4}); addTrait(p,'creative',true); return `${p.first} stopped trying to shrink the experience back down to fit. They'd grown, and that was allowed.`; }},
      {label:'Try to explain it to everyone', sub:'+connection or frustration', effect:p=>{ setFlag(p,'ch_abroadProcessed',true); setFlag(p,'ch_abroadFriend',true); if(chance(50)){ fx(p,{happy:6}); return `A couple of people really got it, and got closer to ${p.first} for it.`;} fx(p,{happy:-3}); return `Most eyes glazed over. ${capFirst(p.first)} learned some things you just have to hold by yourself.`; }},
      {label:'Pretend nothing changed', sub:'fit back in', effect:p=>{ setFlag(p,'ch_abroadProcessed',true); fx(p,{happy:-2,smarts:2}); return `${p.first} folded back into the old life and tucked the bigger self away. Easier. Smaller.`; }},
    ]},
  // beat — the person met abroad reaches out at ~28
  { id:'ch_abroad_person', emoji:'🛬', title:'Passing Through', once:true,
    when:p=>p.age>=27&&p.age<=30&&hasFlag(p,'ch_abroadFriend'), weight:4,
    body:p=>`Someone ${p.first} met abroad — a connection that stayed warm across the distance — is passing through the city for one night only.`,
    choices:[
      {label:'Make a night of it', sub:'one night, its own story', effect:p=>{ clearFlag(p,'ch_abroadFriend'); if(!p.rels.some(r=>(r.kind==='Partner'||r.kind==='Spouse')&&r.alive)&&chance(40)){ const sx=partnerSex(p); p.rels.push({name:newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:50+rnd(20),alive:true,id:nid()}); fx(p,{happy:12}); return `One night turned into something neither of them planned. Sometimes the connection that started a world away decides to be the real one.`;} fx(p,{happy:8}); const f=addContact(p,null,'Friend',60); return `A vivid, late, laughing night — and a friendship across borders confirmed.`; }},
      {label:'A brief hello — your life is here', sub:'+joy', effect:p=>{ clearFlag(p,'ch_abroadFriend'); fx(p,{happy:4}); return `An hour, a hug, a "next time you're in town." Some connections are perfect kept small.`; }},
    ]},
  // beat — return to the place at 35+
  { id:'ch_abroad_return', emoji:'🗺️', title:'Back to the Place That Changed You', once:true,
    when:p=>p.age>=35&&p.age<=50&&hasFlag(p,'ch_abroadProcessed')&&!hasFlag(p,'ch_abroadFriend'), weight:3.5,
    body:p=>`A chance to go back to the country where ${p.first} studied all those years ago. The place that reshaped them at twenty — what's left of it now, and of who they were there?`,
    choices:[
      {label:'Go back', sub:'then vs now', effect:p=>{ clearFlag(p,'ch_abroadProcessed'); fx(p,{happy:8,smarts:3}); return `${p.first} returned. The streets were the same and entirely different — or maybe that was ${p.first}. A quiet, complicated joy.`; }},
      {label:'Leave the memory intact', sub:'+peace', effect:p=>{ clearFlag(p,'ch_abroadProcessed'); fx(p,{happy:4}); return `${p.first} chose to leave it golden in memory rather than risk the real thing. Some places you only get to have once.`; }},
    ]},

];

// --- resolver for The Big Ask (yes/no, weighted by looks & charming) ---
function askResult(p){
  const mode=p._askMode||'direct';
  const sx=partnerSex(p);
  const crush=newFirst(sx);
  setFlag(p,'ch_crushName',crush);
  let odds = 42 + (p.stats.looks-50)*0.4 + (p.stats.charming?(p.stats.charming-50)*0.3:0);
  if(mode==='grand') odds += 6; if(mode==='friend') odds -= 4; if(mode==='casual') odds -= 2;
  const yes = chance(clamp(odds,15,85));
  return { id:'ch_bigask_result', emoji: yes?'💞':'🥀', title: yes?'They Said Yes':'They Said No', once:true, when:()=>true,
    body:q=> yes?`${crush} said yes — actually yes. The dance, and everything around it, is suddenly very real.`:`${crush} let ${q.first} down gently, but it's still a no. And there's a whole school to walk through tomorrow.`,
    choices: yes? [
      {label:'A night that goes perfectly', sub:'+joy', effect:q=>{ q.rels.push({name:crush+' '+pick(LAST),kind:'Partner',sex:sx,bond:58+rnd(20),alive:true,id:nid()}); fx(q,{happy:16,fame:2}); return `It was the night ${q.first} had hoped for and then some. Young, electric, unforgettable.`; }},
      {label:'A night that goes sideways', sub:'bittersweet', effect:q=>{ if(chance(50)){ q.rels.push({name:crush+' '+pick(LAST),kind:'Partner',sex:sx,bond:48+rnd(15),alive:true,id:nid()}); fx(q,{happy:6}); return `Awkward, a little disastrous, weirdly sweet. They laughed about it for years.`;} fx(q,{happy:-2}); return `It fizzled — too much pressure on one night — but no harm done. Just a story now.`; }},
      {label:'Notice you click better with someone else entirely', sub:'plot twist', effect:q=>{ const sx2=partnerSex(q); const other=newFirst(sx2); if(chance(60)){ q.rels.push({name:other+' '+pick(LAST),kind:'Partner',sex:sx2,bond:55+rnd(20),alive:true,id:nid()}); fx(q,{happy:12}); return `Funny thing — ${q.first} spent the whole night talking to ${other} instead, and that turned into the real story.`;} fx(q,{happy:5}); return `${q.first} caught a spark with someone unexpected. Nothing came of it that night, but the night opened up.`; }},
    ] : [
      {label:'Hold your head up at school', sub:'+resilience', effect:q=>{ fx(q,{happy:-4,smarts:2}); addTrait(q,'confident',true); return `${q.first} walked the halls like it didn't sting — which, after a few days, made it true.`; }},
      {label:'Lick your wounds for a while', sub:'human', effect:q=>{ fx(q,{happy:-8,stress:6}); return `${q.first} took the hit hard and went quiet for a bit. First rejections cut the deepest.`; }},
    ]};
}

// --- immediate investigation branch for the Academic Ethics Test ---
function ethicsInvestigation(p){
  return { id:'ch_ethics_invest', emoji:'🔎', title:'The Investigation', once:true, when:()=>true,
    body:q=>`It surfaced. The integrity office has flagged the work and called ${q.first} in. This is real now.`,
    choices:[
      {label:'Deny everything', sub:'gamble', effect:q=>{ if(q.stats.smarts>60&&chance(55)){ fx(q,{stress:10}); return `${q.first} held the line and the case fell apart for lack of proof. They walked — rattled, but clean on paper.`;} fx(q,{smarts:-4,happy:-10,stress:14}); q.record.push('Academic misconduct'); return `The denial collapsed under scrutiny. Now it's lying plus cheating, and it's on the record.`; }},
      {label:'Confess', sub:'+mercy', effect:q=>{ fx(q,{happy:-6,stress:-2}); if(chance(60)){ return `${q.first} owned it. The honesty bought leniency — a warning and a redo instead of expulsion.`;} q.record.push('Academic misconduct'); return `${q.first} confessed and took the formal penalty. A mark, but a clean conscience going forward.`; }},
      {label:'Try to implicate others', sub:'cold', effect:q=>{ if(chance(40)){ fx(q,{stress:10}); return `${q.first} spread the blame and slipped the worst of it. The people thrown under the bus won't forget.`;} fx(q,{happy:-12,stress:14}); q.record.push('Academic misconduct'); return `The deflection backfired spectacularly. ${capFirst(q.first)} ended up holding it all, plus a reputation for it.`; }},
    ]};
}

// fold the new chains into the main event pool
CHOICE_EVENTS.push(...CHAIN_EVENTS);

