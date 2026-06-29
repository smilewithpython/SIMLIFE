"use strict";
/* Threadbare · split module: 11-chains-adult.js  (lines 3856–4140 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   PART 3 — ADULT LIFE CHAINS (Non-Career)
   Appends to CHOICE_EVENTS. Reuses helpers from the Part 1-2 block
   (aliveParent, aliveSibling, aliveSpouse, anyFriend, fname, addContact).
   Flag namespace (all new, no collisions with Parts 1-2):
     Old Friend:     ch_ofReconnect, ch_ofName, ch_ofAsk, ch_ofHelped, ch_ofUsed, ch_ofFractured
     Rival:          ch_rivalMode, ch_rivalName, ch_rivalEnd
     Mentor:         ch_mentorMode, ch_mentorName, ch_mentorInnocent, ch_mentorStood, ch_mentorLegacy
     Long Hustle:    ch_hustleMode, ch_hustleName, ch_hustleHealth, ch_hustleDone
     Family Fracture:ch_fractureCare, ch_fractureSib, ch_fractureStage
     Secret Kept:    ch_secretMode, ch_secretType, ch_carriesWeight
     Temptation Arc: ch_affairProcessed, ch_affairEnded, ch_affairOngoing, ch_affairLeft, ch_affairConfessed
     Inheritance:    ch_inheritStage, ch_inheritFair
   ============================================================ */

// small local helpers (uniquely named so they don't collide)
function p3FriendByName(p, nm){ return nm ? p.rels.find(r=>r.alive&&r.kind==='Friend'&&r.name.split(' ')[0]===nm) : null; }
function p3Child(p){ return p.rels.find(r=>r.kind==='Child'&&r.alive); }
function p3DeadParent(p){ return p.rels.some(r=>(r.kind==='Mother'||r.kind==='Father')&&!r.alive); }

const CHAIN_EVENTS_P3 = [

  // ============================================================
  // THE OLD FRIEND  (CHAIN-LONG)
  // ============================================================
  { id:'ch_oldfriend_b1', emoji:'📱', title:'The Old Friend', once:true,
    when:p=>p.age>=24&&p.age<=27&&!hasFlag(p,'ch_ofReconnect')&&!hasFlag(p,'ch_ofFractured'), weight:2.4,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); p._ofTmpName=nm; p._ofTmpSx=sx; return `A name lights up ${p.first}'s phone: ${nm}, close once — years ago — and then just… not. Life happened to you both. They want to catch up properly. It's been a long time.`; },
    choices:[
      {label:'Reconnect properly', sub:'+a person', effect:p=>{ const nm=p._ofTmpName||newFirst('M'); setFlag(p,'ch_ofReconnect',true); setFlag(p,'ch_ofName',nm); const f=addContact(p,nm,'Friend',62); f.note='old friend'; fx(p,{happy:8}); return `${p.first} let ${nm} back in. The old rhythm came back faster than expected — like no time had passed at all.`; }},
      {label:'A polite hello, nothing more', sub:'clean', effect:p=>{ fx(p,{happy:1}); return `${p.first} answered warmly, promised a coffee someday, and quietly let it drift again. Some chapters stay closed.`; }},
      {label:'Don\'t answer', sub:'-nothing', effect:p=>{ return `${p.first} watched it ring out. Whatever you were to each other, it lives in the past tense now.`; }},
    ]},
  // Beat 2 — they ask for something (only if reconnected)
  { id:'ch_oldfriend_b2', emoji:'🤝', title:'The Old Friend Needs Something', once:true,
    when:p=>p.age>=30&&p.age<=33&&hasFlag(p,'ch_ofReconnect')&&!hasFlag(p,'ch_ofHelped')&&!hasFlag(p,'ch_ofFractured'), weight:5,
    body:p=>{ const nm=p.flags.ch_ofName||'your old friend'; const ask=pick(['money','career','gray','crisis']); setFlag(p,'ch_ofAsk',ask); const line= ask==='money'?`a loan — real money, the kind you don't lend lightly`: ask==='career'?`a favor that only works because of who you've become — a word in the right ear, a door held open`: ask==='gray'?`help with something that lives in a legal gray zone. Nothing violent. Just… not clean`:`nothing but your time — they're in a crisis and you're the one they called`; return `${nm} finally asks. Not for nothing — for ${line}. The friendship is real. So is the ask.`; },
    choices:[
      {label:'Come through for them', sub:'cost varies', effect:p=>{ const ask=p.flags.ch_ofAsk; const nm=p.flags.ch_ofName||'them'; const f=p3FriendByName(p,nm); setFlag(p,'ch_ofHelped',true);
        if(ask==='money'){ const amt=4000+rnd(9000); fx(p,{money:-amt,happy:2}); }
        else if(ask==='career'){ fx(p,{stress:6,fame:-1}); }
        else if(ask==='gray'){ fx(p,{stress:12,happy:-2}); if(chance(18)){ p.record.push('Minor offense'); } }
        else { fx(p,{happy:-2,stress:8}); }
        // 30% they vanish once they got what they needed
        if(chance(30)){ setFlag(p,'ch_ofUsed',true); if(f){ f.bond=clamp(f.bond-30); f.note='faded'; } fx(p,{happy:-6}); return `${p.first} came through. ${nm} was grateful — and then slowly, completely, gone. You find out what some people wanted from you only after they have it.`; }
        if(f){ f.bond=clamp(f.bond+18); } fx(p,{happy:6}); return `${p.first} showed up the way real friends do. ${nm} won't forget it, and the bond between you went somewhere deeper than nostalgia.`; }},
      {label:'Tell them no', sub:'fractures it', effect:p=>{ const nm=p.flags.ch_ofName||'them'; const f=p3FriendByName(p,nm); clearFlag(p,'ch_ofReconnect'); setFlag(p,'ch_ofFractured',true); if(f){ f.bond=clamp(f.bond-22); f.note='distant'; } fx(p,{happy:-3,stress:-2}); return `${p.first} said no — maybe rightly. ${nm} took it quiet, said they understood, and never asked again. They also never quite came back.`; }},
    ]},
  // Beat 3 — their trajectory was shaped by yours (only if the bond survived)
  { id:'ch_oldfriend_b3', emoji:'🌗', title:'Where the Old Friend Ended Up', once:true,
    when:p=>p.age>=40&&p.age<=46&&hasFlag(p,'ch_ofHelped')&&!hasFlag(p,'ch_ofUsed'), weight:4,
    body:p=>{ const nm=p.flags.ch_ofName||'your old friend'; const up=chance(55); p._ofUp=up; return up?`${nm} is flying. The best stretch of their life — and they trace a straight line back to the day you came through for them years ago. They want to bring you in on it.`:`${nm} is at the bottom of something. They've spiraled, and somewhere in the telling it's clear your paths diverged at a choice you barely remember making. They're not asking for anything. They just came to you.`; },
    choices:[
      {label:'Step into it with them', sub:'shared fate', effect:p=>{ const nm=p.flags.ch_ofName||'them'; const f=p3FriendByName(p,nm); if(p._ofUp){ const win=20000+rnd(120000); fx(p,{money:win,happy:10}); if(f)f.bond=clamp(f.bond+12); return `${p.first} said yes, and rode ${nm}'s good fortune to a real windfall — ${money(win)} and a friendship that turned out to be the investment of a lifetime.`; } fx(p,{happy:-4,money:-(2000+rnd(8000)),stress:8}); if(f)f.bond=clamp(f.bond+16); return `${p.first} got down in it with ${nm} — gave money, time, and the kind of presence that doesn't fix anything but means everything. It cost you. You'd do it again.`; }},
      {label:'Keep a careful distance', sub:'self-protective', effect:p=>{ const nm=p.flags.ch_ofName||'them'; const f=p3FriendByName(p,nm); if(p._ofUp){ fx(p,{happy:2}); if(f)f.bond=clamp(f.bond-8); return `${p.first} wished ${nm} well and stayed out of it. Maybe wise, maybe a door that won't open twice. You'll never know which.`; } fx(p,{happy:-6,stress:4}); if(f){f.bond=clamp(f.bond-14);f.note='estranged';} return `${p.first} couldn't be the lifeline this time. ${nm} understood, or said they did. The guilt of the careful choice is its own quiet weight.`; }},
    ]},

  // ============================================================
  // THE RIVAL  (CHAIN-LONG) — personal/professional, NOT the hero nemesis
  // ============================================================
  { id:'ch_rival_b1', emoji:'⚔️', title:'The Rival', once:true,
    when:p=>p.age>=22&&p.age<=28&&!hasFlag(p,'ch_rivalMode'), weight:2.3,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); setFlag(p,'ch_rivalName',nm); return `There's someone your age — ${nm} — clearly going for exactly what ${p.first} wants. Not a villain. Just sharp, hungry, and always somehow one step into your light. The room keeps comparing you.`; },
    choices:[
      {label:'Compete, hard', sub:'sharpens you', effect:p=>{ setFlag(p,'ch_rivalMode','compete'); fx(p,{smarts:4,athletic:1,stress:6}); addTrait(p,'disciplined',true); return `${p.first} decided to win. Every comparison became fuel. It made you better — and it made the rivalry the realest relationship in your working life.`; }},
      {label:'Pay them no mind', sub:'+calm', effect:p=>{ setFlag(p,'ch_rivalMode','ignore'); fx(p,{happy:4,stress:-2}); return `${p.first} ran their own race and let ${p.flags.ch_rivalName} run theirs. Some of the air went out of it. Maybe some of the fire, too.`; }},
      {label:'Try to befriend them', sub:'risky warmth', effect:p=>{ if(chance(55)){ setFlag(p,'ch_rivalMode','ally'); fx(p,{happy:6}); return `${p.first} reached across the rivalry, and ${p.flags.ch_rivalName} met them halfway. The fiercest competition quietly became the steadiest alliance.`;} setFlag(p,'ch_rivalMode','compete'); fx(p,{happy:-3}); return `${p.first} offered a hand; ${p.flags.ch_rivalName} read it as weakness and pressed. So much for peace. Now it's war.`; }},
      {label:'Undermine them first', sub:'cold', effect:p=>{ setFlag(p,'ch_rivalMode','undermine'); if(chance(60)){ fx(p,{fame:3,stress:8}); return `${p.first} got ahead by getting under ${p.flags.ch_rivalName} — a quiet word, a withheld credit. It worked. It also started something that won't stay clean.`;} fx(p,{fame:-4,happy:-4,stress:12}); return `${p.first}'s undercut backfired and was seen for what it was. ${capFirst(p.flags.ch_rivalName)} now has a reason, and a grudge.`; }},
    ]},
  // Beat 2 — they get something you wanted
  { id:'ch_rival_b2', emoji:'🏆', title:'The Rival Wins One', once:true,
    when:p=>p.age>=32&&p.age<=38&&hasFlag(p,'ch_rivalMode'), weight:5,
    body:p=>{ const nm=p.flags.ch_rivalName||'your rival'; const prize=pick(['the promotion you were in line for','an award with your name half-whispered for it','the recognition, on the stage, with everyone watching','the thing you quietly wanted for years']); p._rivPrize=prize; return `${nm} got ${prize}. Earned or not, it's theirs now, and the comparison you've lived with for a decade just tilted hard.`; },
    choices:[
      {label:'Take it graciously', sub:'+respect', effect:p=>{ fx(p,{happy:-2,smarts:2}); addTrait(p,'confident',true); return `${p.first} congratulated ${p.flags.ch_rivalName} and meant most of it. Losing well is its own kind of strength — and people noticed who had it.`; }},
      {label:'Let it eat at you', sub:'-peace', effect:p=>{ fx(p,{happy:-8,stress:12}); return `${p.first} smiled in the room and seethed everywhere else. The bitterness didn't move the rivalry an inch — it just took up residence.`; }},
      {label:'Genuinely reach out', sub:'turns the corner', effect:p=>{ if(p.flags.ch_rivalMode==='undermine'&&chance(50)){ fx(p,{happy:-2}); return `${p.first} reached out sincerely, but ${p.flags.ch_rivalName} remembered the early knife and kept the door shut. Some debts compound.`;} setFlag(p,'ch_rivalMode','ally'); fx(p,{happy:6}); return `${p.first} crossed the room and meant it, and something thawed. Sometimes the rival becomes the only one who truly understands the climb.`; }},
      {label:'Try to claw it back', sub:'scorched earth', effect:p=>{ if(chance(40)){ fx(p,{fame:4,stress:14}); setFlag(p,'ch_rivalMode','undermine'); return `${p.first} maneuvered and actually clawed some of it back. The win cost a piece of your name and lit the rivalry to a blaze.`;} fx(p,{fame:-6,happy:-8,stress:14}); setFlag(p,'ch_rivalMode','undermine'); return `${p.first} overreached trying to undo it and looked small doing so. ${capFirst(p.flags.ch_rivalName)} won twice — the prize, and the high road.`; }},
    ]},
  // Beat 3 — both senior, one ahead; the resolution
  { id:'ch_rival_b3', emoji:'🕊️', title:'The Rival, Decades In', once:true,
    when:p=>p.age>=46&&p.age<=56&&hasFlag(p,'ch_rivalMode')&&!hasFlag(p,'ch_rivalEnd'), weight:4.5,
    body:p=>{ const nm=p.flags.ch_rivalName||'your old rival'; const ally=p.flags.ch_rivalMode==='ally'; return ally?`${nm} and ${p.first} are both elder statespeople of the field now — and somewhere along the way the rivalry became the longest friendship of your working life. There's a chance to do one last thing together.`:`${nm} is still there, decades on. One of you ended up clearly ahead. You're both near the end of the long race, and the thing between you is still unfinished.`; },
    choices:[
      {label:'Collaborate, at last', sub:'legacy', effect:p=>{ setFlag(p,'ch_rivalEnd','peace'); fx(p,{happy:10,fame:4}); return `${p.first} and ${p.flags.ch_rivalName} finally built something together instead of against. The work outlived the rivalry — and so, it turned out, did the respect.`; }},
      {label:'Make peace before it\'s too late', sub:'+peace', effect:p=>{ setFlag(p,'ch_rivalEnd','peace'); fx(p,{happy:8,stress:-6}); return `${p.first} reached out, no scoreboard this time. Two people who'd spent a lifetime measuring against each other finally just… shook hands. It was enough.`; }},
      {label:'One last confrontation', sub:'no closure', effect:p=>{ setFlag(p,'ch_rivalEnd','unresolved'); fx(p,{stress:10,happy:-4}); return `${p.first} said the things, finally, and ${p.flags.ch_rivalName} said theirs. Nothing was resolved. Some rivalries you carry all the way to the end.`; }},
      {label:'Let them have it and walk away', sub:'tired peace', effect:p=>{ setFlag(p,'ch_rivalEnd','unresolved'); fx(p,{happy:2,stress:-4}); return `${p.first} stopped keeping score, not from grace but from fatigue. The rivalry didn't end so much as ${p.first} set it down and walked off.`; }},
    ]},

  // ============================================================
  // THE MENTOR  (CHAIN-LONG)
  // ============================================================
  { id:'ch_mentor_b1', emoji:'🧭', title:'The Mentor', once:true,
    when:p=>p.age>=22&&p.age<=27&&!hasFlag(p,'ch_mentorMode'), weight:2.3,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); setFlag(p,'ch_mentorName',nm); setFlag(p,'ch_mentorInnocent', chance(55)); return `Someone older — ${nm}, accomplished, a little intimidating — takes a real interest in ${p.first}. Not an angle, not a predator. A genuine offer to open doors and pass things down. Rare, and worth something.`; },
    choices:[
      {label:'Trust them fully', sub:'+growth', effect:p=>{ setFlag(p,'ch_mentorMode','trust'); fx(p,{smarts:6,happy:4}); return `${p.first} leaned in and let ${p.flags.ch_mentorName} teach. Doors opened that ${p.first} didn't know existed. A real shaping hand on a young life.`; }},
      {label:'Keep a respectful distance', sub:'guarded', effect:p=>{ setFlag(p,'ch_mentorMode','distance'); fx(p,{smarts:3}); return `${p.first} took the guidance but kept a wall up. You learned plenty — maybe not everything you could have. Trust is a thing you ration.`; }},
      {label:'Use them for what you need', sub:'transactional', effect:p=>{ setFlag(p,'ch_mentorMode','use'); fx(p,{smarts:5,fame:2,happy:-1}); return `${p.first} took the contacts, the leverage, the leg up — and gave back the minimum. It worked. ${capFirst(p.flags.ch_mentorName)} may have noticed more than they let on.`; }},
    ]},
  // Beat 2 — their reputation comes into question
  { id:'ch_mentor_b2', emoji:'❓', title:'A Question About the Mentor', once:true,
    when:p=>p.age>=33&&p.age<=41&&hasFlag(p,'ch_mentorMode')&&!hasFlag(p,'ch_mentorStood'), weight:5,
    body:p=>{ const nm=p.flags.ch_mentorName||'your mentor'; return `Whispers about ${nm} — something in their past, their methods, their record. Nothing proven, nothing clean either. People are watching to see where ${p.first} stands. Including ${nm}.`; },
    choices:[
      {label:'Defend them publicly', sub:'loyalty, gambled', effect:p=>{ const nm=p.flags.ch_mentorName||'them'; setFlag(p,'ch_mentorStood','defended'); if(p.flags.ch_mentorInnocent){ fx(p,{fame:4,happy:6}); return `${p.first} stood up for ${nm}, and the cloud passed — they'd done nothing wrong. Loyalty offered at risk and repaid in full. That bond is steel now.`;} fx(p,{fame:-5,stress:10}); setFlag(p,'ch_mentorGuiltStain',true); return `${p.first} vouched for ${nm} — and the truth came out worse than the whispers. The defense is now part of ${p.first}'s record too. It follows you.`; }},
      {label:'Quietly distance yourself', sub:'safe, costly', effect:p=>{ const nm=p.flags.ch_mentorName||'them'; setFlag(p,'ch_mentorStood','distanced'); setFlag(p,'ch_mentorMode','distance'); fx(p,{happy:-4,stress:-2}); return `${p.first} stepped back and let ${nm} weather it alone. Prudent. ${capFirst(nm)} noticed the empty space where you'd been, and the relationship never fully recovered.`; }},
      {label:'Investigate it yourself', sub:'+truth', effect:p=>{ const nm=p.flags.ch_mentorName||'them'; setFlag(p,'ch_mentorStood','investigated'); fx(p,{smarts:5,stress:6}); if(p.flags.ch_mentorInnocent){ return `${p.first} dug until the truth was clear: ${nm} was clean. Now you know, and you can stand on solid ground.`;} return `${p.first} dug, and found the rot was real. Knowing changes everything — what you owe them, and what you don't.`; }},
      {label:'Confront them privately', sub:'honest', effect:p=>{ const nm=p.flags.ch_mentorName||'them'; setFlag(p,'ch_mentorStood','confronted'); fx(p,{stress:8}); if(p.flags.ch_mentorInnocent){ fx(p,{happy:4}); return `${p.first} asked ${nm} straight. They answered straight. The air cleared, and the respect ran deeper for the asking.`;} fx(p,{happy:-4}); return `${p.first} asked, and ${nm}'s face gave the answer before the words did. Some mentors teach you the last lesson by failing it.`; }},
    ]},
  // Beat 3 — you can define their legacy
  { id:'ch_mentor_b3', emoji:'📜', title:'The Mentor\'s Legacy', once:true,
    when:p=>p.age>=46&&p.age<=56&&hasFlag(p,'ch_mentorMode')&&p.flags.ch_mentorMode!=='distance'&&!hasFlag(p,'ch_mentorLegacy'), weight:4,
    body:p=>{ const nm=p.flags.ch_mentorName||'your mentor'; return `${nm} is old now, near the end of their story, and ${p.first} — once the student — holds the pen on how they're remembered. Protect the legacy, expose the truth of it, or step back and let history decide.`; },
    choices:[
      {label:'Protect their legacy', sub:'loyal to the end', effect:p=>{ setFlag(p,'ch_mentorLegacy','protected'); fx(p,{happy:8}); if(p.flags.ch_mentorInnocent===false){ fx(p,{stress:8}); return `${p.first} burnished the story and buried the rest. ${capFirst(p.flags.ch_mentorName)} is remembered well — and ${p.first} carries the part that didn't make it into the eulogy.`;} return `${p.first} made sure ${p.flags.ch_mentorName} got the remembrance they'd earned. A debt of gratitude, paid forward into history.`; }},
      {label:'Tell the whole truth', sub:'honest, costly', effect:p=>{ setFlag(p,'ch_mentorLegacy','exposed'); fx(p,{stress:6}); if(p.flags.ch_mentorInnocent){ fx(p,{happy:-6}); return `${p.first} laid it all bare — and most of it was good. But the airing felt to many like betrayal, and ${p.first} learned that even the truth has a temperature.`;} fx(p,{fame:3}); return `${p.first} told it straight, the gift and the rot together. ${capFirst(p.flags.ch_mentorName)}'s legacy is complicated now — and honest.`; }},
      {label:'Let history write it', sub:'+peace', effect:p=>{ setFlag(p,'ch_mentorLegacy','neutral'); fx(p,{happy:2}); return `${p.first} stepped back and let ${p.flags.ch_mentorName} be remembered by everyone and no one in particular. Not every legacy is yours to shape.`; }},
    ]},
  // Echo — your own protégé treats you as you treated your mentor (60+)
  { id:'ch_mentor_protege', emoji:'🌱', title:'Your Turn to Be the Mentor', once:true,
    when:p=>p.age>=60&&p.age<=70&&hasFlag(p,'ch_mentorMode'), weight:3.5,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); p._protName=nm; return `A young one — ${nm}, all promise and nerve — now looks at ${p.first} the way ${p.first} once looked at someone older. The wheel has come all the way around. What kind of mentor will you be?`; },
    choices:[
      {label:'Pour yourself into them', sub:'pass it down', effect:p=>{ const nm=p._protName||'them'; const mode=p.flags.ch_mentorMode; fx(p,{happy:10}); if(mode==='trust'){ fx(p,{happy:4}); return `${p.first} gave ${nm} everything, the way it was once given to ${p.first} — and ${nm} received it with the same open trust. What you plant in someone comes back around in kind.`;} if(mode==='use'){ fx(p,{happy:-4}); return `${p.first} tried to give freely — but ${nm} treated it as a transaction, took the leg up and little else. You taught the lesson you once lived. The student learned it well.`;} return `${p.first} mentored carefully, a little guarded, and ${nm} matched the distance. The shape of the thing you give is the shape of what returns.`; }},
      {label:'Keep them at arm\'s length', sub:'old habits', effect:p=>{ const nm=p._protName||'them'; fx(p,{happy:-2}); return `${p.first} kept the wall up, even now, even here. ${capFirst(nm)} drifted off to find a warmer teacher. Some patterns you carry to the very end.`; }},
    ]},

  // ============================================================
  // THE LONG HUSTLE  (CHAIN-LONG) — distinct from the 'business idea' single event
  // ============================================================
  { id:'ch_hustle_b1', emoji:'💡', title:'The Long Hustle', once:true,
    when:p=>p.age>=27&&p.age<=32&&!hasFlag(p,'ch_hustleMode'), weight:2.2,
    body:p=>{ const idea=pick(['a product you keep sketching','a service no one is doing quite right','a small thing you make that people keep asking to buy','an idea unrelated to your job that will not leave you alone']); p._huIdea=idea; return `It isn't ${p.first}'s career. It's the thing in the margins — ${idea}. You keep coming back to it. The question is whether to actually do something about it.`; },
    choices:[
      {label:'Start it properly', sub:'-time -money', effect:p=>{ setFlag(p,'ch_hustleMode','allin'); const cost=6000+rnd(14000); fx(p,{money:-cost,stress:10,happy:4}); setFlag(p,'ch_hustleName',pick(['the venture','the project','the company','the side build'])); return `${p.first} committed — real money, real hours, a real thing with a name. Terrifying and alive. Now it has to work.`; }},
      {label:'Nights and weekends', sub:'slow burn', effect:p=>{ setFlag(p,'ch_hustleMode','slow'); fx(p,{stress:6,smarts:2}); setFlag(p,'ch_hustleName',pick(['the side thing','the weekend project','the little build'])); return `${p.first} chipped at it after hours — slower, cheaper, lonelier, but moving. The dream kept on a low flame.`; }},
      {label:'Let it go', sub:'+calm', effect:p=>{ setFlag(p,'ch_hustleMode','dropped'); fx(p,{happy:2,stress:-4}); return `${p.first} closed the notebook and let the idea stay an idea. Maybe relief. Maybe a small ghost that visits now and then.`; }},
    ]},
  // Beat 2 — it's going; a crisis fires
  { id:'ch_hustle_b2', emoji:'📈', title:'The Hustle Hits a Wall', once:true,
    when:p=>p.age>=33&&p.age<=38&&hasFlag(p,'ch_hustleMode')&&p.flags.ch_hustleMode!=='dropped'&&!hasFlag(p,'ch_hustleHealth'), weight:5,
    body:p=>{ const nm=p.flags.ch_hustleName||'the thing'; const crisis=pick(['copy','partner','growth','sell']); p._huCrisis=crisis; const line= crisis==='copy'?`a bigger player has copied ${nm} outright`: crisis==='partner'?`the person you built ${nm} with wants out`: crisis==='growth'?`${nm} could grow fast — but only if you pour in money you'd feel`:`someone's offered to buy ${nm} outright for a modest, tempting sum`; return `${nm} is real now — not huge, but real. And then: ${line}. The fork in the road arrives whether you're ready or not.`; },
    choices:[
      {label:'Fight to keep it alive', sub:'all in again', effect:p=>{ const crisis=p._huCrisis; if(crisis==='sell'){ /* declined the sale */ } if(chance(58)){ setFlag(p,'ch_hustleHealth','strong'); fx(p,{happy:6,stress:8,money:-(2000+rnd(6000))}); return `${p.first} dug in — out-built the copycat, held the thing together, refused the easy exit. It cost more sleep and more money, and it survived.`; } setFlag(p,'ch_hustleHealth','weak'); fx(p,{stress:14,money:-(3000+rnd(8000)),happy:-6}); return `${p.first} fought and the wall won this round. The thing's still standing, but barely, and the toll is showing.`; }},
      {label:'Take the safe exit', sub:'cash, closure', effect:p=>{ setFlag(p,'ch_hustleHealth','sold'); const sum=p._huCrisis==='sell'?(8000+rnd(40000)):(3000+rnd(15000)); fx(p,{money:sum,happy:2,stress:-8}); return `${p.first} took the deal and walked away with ${money(sum)} and a clean conscience. Not the empire you pictured — but a real thing, finished on your terms.`; }},
      {label:'Let it quietly fade', sub:'let go', effect:p=>{ setFlag(p,'ch_hustleHealth','faded'); fx(p,{happy:-4,stress:-6}); return `${p.first} stopped feeding it and let it wind down. Some things you have to set down to carry everything else. It still aches a little.`; }},
    ]},
  // Beat 3 — the outcome
  { id:'ch_hustle_b3', emoji:'🎲', title:'What the Hustle Became', once:true,
    when:p=>p.age>=40&&p.age<=46&&hasFlag(p,'ch_hustleHealth')&&!hasFlag(p,'ch_hustleDone'), weight:4.5,
    body:p=>{ const nm=p.flags.ch_hustleName||'the thing you built'; const h=p.flags.ch_hustleHealth; setFlag(p,'ch_hustleDone',true); return h==='strong'?`Years on, ${nm} is a genuine second income — modest, durable, yours. There's a real asset here now, the kind a family can inherit.`: (h==='sold'||h==='faded')?`${nm} is behind ${p.first} now, one way or another. What's left is the question of what the years of trying taught you.`:`${nm} is still going — paying for itself, never more than that. A loyal little engine that runs and runs and never quite takes off.`; },
    choices:[
      {label:'Build it into the bloodline', sub:'legacy asset', need:p=>p.flags.ch_hustleHealth==='strong',
        effect:p=>{ p.businesses=p.businesses||[]; const nm=(p.flags.ch_hustleName||'The Venture'); const bval=40000+rnd(160000); p.businesses.push({name:capFirst(nm), kind:'side venture', value:bval, income:Math.round(bval*0.07), founded:p.age}); fx(p,{money:15000+rnd(40000),happy:10,fame:2}); return `${p.first} grew the hustle into something built to outlast them — an asset with a name, ready to pass down. The margin-doodle became a piece of the family story.`; }},
      {label:'Let it keep humming', sub:'steady', need:p=>p.flags.ch_hustleHealth==='strong'||p.flags.ch_hustleHealth==='weak',
        effect:p=>{ fx(p,{money:3000+rnd(8000),happy:4}); return `${p.first} let the little engine run. Not a fortune, just a faithful trickle and the quiet pride of a thing that works.`; }},
      {label:'Make peace with the failure', sub:'+wisdom or +caution', effect:p=>{ if(chance(50)){ addTrait(p,'brave',true); fx(p,{happy:4,smarts:3}); return `${p.first} looked the failure in the eye and took the lesson, not the wound. Next time the fear will be smaller. You tried, and trying changed you.`;} addTrait(p,'pessimist',true); fx(p,{happy:-4}); return `${p.first} took the failure to heart, and a little caution crept in to stay. The years you gave it left a mark on how far you'll reach again.`; }},
      {label:'Finally put it down', sub:'closure', need:p=>p.flags.ch_hustleHealth==='middle'||p.flags.ch_hustleHealth==='weak'||p.flags.ch_hustleHealth==='strong',
        effect:p=>{ fx(p,{happy:3,stress:-6}); return `${p.first} decided enough was enough and let the steady little thing rest. Not every dream needs to end in fireworks. Some just need an honest ending.`; }},
    ]},

  // ============================================================
  // THE FAMILY FRACTURE  (CHAIN-LONG)
  // ============================================================
  { id:'ch_fracture_b1', emoji:'🏥', title:'The Family Fracture', once:true,
    when:p=>p.age>=35&&p.age<=50&&aliveParent(p)&&!hasFlag(p,'ch_fractureCare'), weight:2.4,
    body:p=>{ const par=aliveParent(p); const sib=aliveSibling(p); p._frHasSib=!!sib; return `${fname(par)}, ${p.first}'s ${par.kind.toLowerCase()}, is declining — not dying, but no longer able to manage alone. They need real help, the kind that reorganizes a life. ${sib?`And ${p.first} isn't the only child in this.`:`And it falls to ${p.first}.`}`; },
    choices:[
      {label:'Move them in with you', sub:'all in', effect:p=>{ const par=aliveParent(p); setFlag(p,'ch_fractureCare','movedin'); if(par)par.bond=clamp(par.bond+18); fx(p,{happy:-2,stress:14,money:-(2000+rnd(5000))}); return `${p.first} brought ${fname(par)} home. The house got smaller and the days got heavier — and the closeness, in the hard hours, was real.`; }},
      {label:'Arrange paid care', sub:'-money', effect:p=>{ const par=aliveParent(p); setFlag(p,'ch_fractureCare','paid'); const cost=8000+rnd(22000); fx(p,{money:-cost,stress:6}); if(par)par.bond=clamp(par.bond+4); return `${p.first} set up proper care — the right call for some, a guilty relief for others. ${money(cost)} for distance and competence both.`; }},
      {label:'Share it with your siblings', sub:'+conflict?', need:p=>!!aliveSibling(p), effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_fractureCare','shared'); if(chance(60)){ setFlag(p,'ch_fractureSib','conflict'); if(sib)sib.bond=clamp(sib.bond-16); fx(p,{stress:12,happy:-4}); return `${p.first} tried to split the load with ${fname(sib)} — and the old scorecard came out fast. Who does more, who vanishes, who resents who. The fracture starts here.`;} setFlag(p,'ch_fractureSib','united'); if(sib)sib.bond=clamp(sib.bond+12); fx(p,{stress:6,happy:2}); return `${p.first} and ${fname(sib)} actually pulled together. Carrying a parent down is its own crucible, and you came through it closer.`; }},
      {label:'Keep your distance from it', sub:'-bond', effect:p=>{ const par=aliveParent(p); const sib=aliveSibling(p); setFlag(p,'ch_fractureCare','avoided'); if(par)par.bond=clamp(par.bond-18); if(sib){sib.bond=clamp(sib.bond-22);setFlag(p,'ch_fractureSib','conflict');} fx(p,{happy:-6,stress:-2}); return `${p.first} stayed away and let it be someone else's to carry. The relief was thin and the cost — with ${fname(par)}, with everyone watching — was not.`; }},
    ]},
  // Beat 2 — it changes; the hard decision + family meeting
  { id:'ch_fracture_b2', emoji:'🕯️', title:'The Family Meeting', once:true,
    when:p=>p.age>=37&&p.age<=54&&hasFlag(p,'ch_fractureCare')&&!hasFlag(p,'ch_fractureStage'), weight:5,
    body:p=>{ const par=aliveParent(p); const worse=chance(60); p._frWorse=worse; setFlag(p,'ch_fractureStage', worse?'worse':'stable'); return worse?`${par?fname(par):'Your parent'} has worsened. The decisions now are the heavy ones — long-term memory care, hospice, an intervention. ${p._frHasSib?`Everyone's in the room. Everything that's said in this room gets said.`:`And ${p.first} stands at the decision alone.`}`:`${par?fname(par):'Your parent'} has stabilized, for now. A reprieve — and a chance, if ${p.first} takes it, to set things right with whoever got hurt in the scramble.`; },
    choices:[
      {label:'Make the hard call yourself', sub:'weight', need:p=>p._frWorse, effect:p=>{ const sib=aliveSibling(p); fx(p,{stress:14,happy:-6}); if(sib&&p.flags.ch_fractureSib==='conflict'){ sib.bond=clamp(sib.bond-10); return `${p.first} made the decision no one wanted to own. ${capFirst(fname(sib))} disagreed loudly and will remember it differently forever. Someone had to. It was you.`;} addTrait(p,'brave',true); return `${p.first} carried the heaviest choice and carried it well. There's no version of this that doesn't cost something. You paid it with grace.`; }},
      {label:'Force a real family reckoning', sub:'everything said', need:p=>p._frWorse&&!!aliveSibling(p), effect:p=>{ const sib=aliveSibling(p); fx(p,{stress:16}); if(chance(50)){ if(sib)sib.bond=clamp(sib.bond+14); setFlag(p,'ch_fractureSib','mended'); fx(p,{happy:4}); return `${p.first} put it all on the table, and somehow the truth-telling healed instead of broke. ${capFirst(fname(sib))} and ${p.first} found each other again in the wreckage.`;} if(sib){sib.bond=clamp(sib.bond-24);sib.note='estranged';} fx(p,{happy:-10}); return `${p.first} said the unsayable things, and they couldn't be unsaid. The family fractured along the old fault lines, maybe for good.`; }},
      {label:'Use the reprieve to mend fences', sub:'+repair', need:p=>!p._frWorse, effect:p=>{ const sib=aliveSibling(p); const par=aliveParent(p); if(sib)sib.bond=clamp(sib.bond+16); if(par)par.bond=clamp(par.bond+8); setFlag(p,'ch_fractureSib','mended'); fx(p,{happy:8,stress:-6}); return `${p.first} used the calm to repair what the crisis had cracked — with ${sib?fname(sib):'the family'}, with ${par?fname(par):'a parent'}. The reprieve became a gift well spent.`; }},
      {label:'Just keep your head down', sub:'endure', effect:p=>{ fx(p,{stress:8,happy:-2}); return `${p.first} got through it the only way that felt survivable — one grim day at a time, saying as little as possible. It ended. That's the most that can be said.`; }},
    ]},
  // Echo — passing the torch: your children mirror how you handled your parent (60+)
  { id:'ch_fracture_torch', emoji:'🔥', title:'Passing the Torch', once:true,
    when:p=>p.age>=62&&p.age<=74&&hasFlag(p,'ch_fractureCare')&&!!p3Child(p), weight:3.5,
    body:p=>{ const kid=p3Child(p); return `Now it's ${p.first} who's slowing down, and ${fname(kid)} — grown, with a life of their own — is facing the same choice ${p.first} once faced about a parent. They learned how to do this by watching you do it.`; },
    choices:[
      {label:'See how they answer', sub:'the wheel turns', effect:p=>{ const kid=p3Child(p); const care=p.flags.ch_fractureCare; if(care==='movedin'||care==='shared'){ if(kid)kid.bond=clamp(kid.bond+14); fx(p,{happy:12}); return `${fname(kid)} stepped up without being asked — moved ${p.first} close, showed up, carried it. They are doing exactly what they once watched ${p.first} do. What you modeled, they became.`;} if(care==='avoided'){ if(kid)kid.bond=clamp(kid.bond-10); fx(p,{happy:-8,stress:8}); return `${fname(kid)} kept a careful distance from ${p.first}'s decline — the way ${p.first} once did. The lesson you taught without meaning to has come home.`;} if(kid)kid.bond=clamp(kid.bond+4); fx(p,{happy:4}); return `${fname(kid)} handled it competently, a little coolly — arranged what needed arranging, the way ${p.first} once did. The echo is unmistakable.`; }},
    ]},

  // ============================================================
  // THE SECRET KEPT  (CHAIN-LONG) — adult witness to wrongdoing
  // ============================================================
  { id:'ch_secret_b1', emoji:'👁️', title:'The Secret Kept', once:true,
    when:p=>p.age>=28&&p.age<=34&&!hasFlag(p,'ch_secretMode'), weight:2.3,
    body:p=>{ const t=pick(['fraud','affair','accident','power']); setFlag(p,'ch_secretType',t); const line= t==='fraud'?`money being moved that shouldn't be — a quiet fraud, and ${p.first} has seen the edge of it`: t==='affair'?`an affair involving someone ${p.first} knows, in a place ${p.first} wasn't supposed to be`: t==='accident'?`the truth of an accident someone caused and quietly buried`:`something a powerful person did, the kind of thing that stays hidden because of who they are`; return `${p.first} saw something. Not meant to, but did: ${line}. Now it lives in ${p.first}'s head, and it won't leave.`; },
    choices:[
      {label:'Report it now', sub:'+integrity, +risk', effect:p=>{ setFlag(p,'ch_secretMode','reported'); fx(p,{stress:10}); return `${p.first} took it to someone who could act. The right thing — and the dangerous thing. Now it's in motion, and so is whatever comes back.`; }},
      {label:'Record it and wait', sub:'leverage', effect:p=>{ setFlag(p,'ch_secretMode','waited'); fx(p,{stress:8,smarts:2}); return `${p.first} quietly gathered proof and sat on it. A card held face-down. The question is whether you'll ever have the nerve — or the moment — to play it.`; }},
      {label:'Keep quiet', sub:'self-preservation', effect:p=>{ setFlag(p,'ch_secretMode','quiet'); fx(p,{stress:6,happy:-2}); return `${p.first} swallowed it and walked away. Easier today. The thing you know doesn't stop being true just because you said nothing.`; }},
      {label:'Confront the person directly', sub:'bold', effect:p=>{ setFlag(p,'ch_secretMode','confronted'); fx(p,{stress:12}); if(chance(50)){ fx(p,{happy:2}); return `${p.first} went straight at them. Something shifted — a quiet acknowledgment, maybe even a stopping. Or maybe just a warning. Time will tell.`;} fx(p,{happy:-4}); return `${p.first} confronted them, and they smiled the smile of someone who isn't afraid of you. You've shown your hand to the wrong person.`; }},
    ]},
  // Beat 2 — it's bigger now
  { id:'ch_secret_b2', emoji:'🌊', title:'The Secret Resurfaces', once:true,
    when:p=>p.age>=33&&p.age<=42&&hasFlag(p,'ch_secretMode')&&!hasFlag(p,'ch_secretStage'), weight:5,
    body:p=>{ const m=p.flags.ch_secretMode; setFlag(p,'ch_secretStage','mid'); return m==='reported'?`The thing ${p.first} reported years ago has played out — and now ${p.first} learns how it really landed. Were you believed? Protected? Or quietly marked as a problem?`: m==='waited'?`The thing ${p.first} has been sitting on just got bigger, and the window to act is closing. It's now or maybe never.`: m==='quiet'?`The secret ${p.first} buried has found its way back to the surface, and this time ${p.first} can't pretend not to know. It's grown in the dark.`:`The person ${p.first} confronted years ago is back in ${p.first}'s orbit, and the unfinished thing between you has teeth now.`; },
    choices:[
      {label:'Act decisively now', sub:'finish it', effect:p=>{ fx(p,{stress:12}); if(chance(55)){ fx(p,{happy:4,fame:2}); setFlag(p,'ch_secretResolve','out'); return `${p.first} moved hard and the truth broke open. Messy, costly, but out in the light at last. The weight lifts, even if the dust hasn't settled.`;} fx(p,{happy:-6,stress:10}); setFlag(p,'ch_secretResolve','backfire'); return `${p.first} made the move and it rebounded — the powerful protect their own. The truth's still buried, and now ${p.first} is exposed.`; }},
      {label:'Hold the line, stay quiet', sub:'carry it', effect:p=>{ fx(p,{stress:10,happy:-4}); setFlag(p,'ch_secretResolve','buried'); return `${p.first} chose silence again. The thing sinks back down, heavier each time it's pushed under. Some weights you just decide to carry.`; }},
      {label:'Quietly protect yourself', sub:'survival', effect:p=>{ fx(p,{stress:6,smarts:3}); setFlag(p,'ch_secretResolve','buried'); return `${p.first} built a wall around their own part in it — documented, distanced, deniable. Not brave. Smart. The two aren't always the same.`; }},
    ]},
  // Beat 3 — final resolution
  { id:'ch_secret_b3', emoji:'⚖️', title:'The Secret, Settled', once:true,
    when:p=>p.age>=45&&p.age<=52&&hasFlag(p,'ch_secretStage')&&!hasFlag(p,'ch_secretFinal'), weight:4.5,
    body:p=>{ const r=p.flags.ch_secretResolve||'buried'; setFlag(p,'ch_secretFinal',true); return r==='out'?`The thing ${p.first} once saw is fully in the open now, and history is deciding what ${p.first}'s role in it was. Brave, or just lucky to be on the right side?`: r==='backfire'?`The truth ${p.first} tried to surface sank for good, and ${p.first} paid for the trying. One last chance to decide what this cost was worth.`:`The secret is buried, permanently now. No one's coming for it. The only thing left is what it did to the person who kept it.`; },
    choices:[
      {label:'Own your part in it, fully', sub:'+peace', effect:p=>{ const r=p.flags.ch_secretResolve; if(r==='out'){ fx(p,{happy:8,fame:3}); addTrait(p,'brave',true); return `${p.first} stood in the daylight and claimed their role without flinching. Whatever the record says, ${p.first} knows what they did, and can live with it.`;} fx(p,{happy:6,stress:-6}); return `${p.first} made peace with the whole tangled thing — what they did, what they didn't, what it cost. Honesty with oneself is the last and hardest kind.`; }},
      {label:'Let it stay buried with you', sub:'a weight to carry', effect:p=>{ setFlag(p,'ch_carriesWeight',true); fx(p,{stress:14,health:-8,happy:-4}); addTrait(p,'anxious',true); return `${p.first} sealed it away for good and became its only keeper. The secret is safe. ${capFirst(p.first)} carries it into the late years like a stone in the chest — it shows, in the sleep, in the health, in the quiet.`; }},
    ]},

  // ============================================================
  // THE TEMPTATION ARC  (CHAIN-LONG) — extends the existing affair (secretAffair flag)
  // ============================================================
  // Beat 2 — the affair is ongoing (Beat 1 is the engine's existing temptation event)
  { id:'ch_affair_b2', emoji:'🔥', title:'It\'s Becoming Real', once:true,
    when:p=>hasFlag(p,'secretAffair')&&aliveSpouse(p)&&p.age>=20&&!hasFlag(p,'ch_affairProcessed'), weight:6,
    body:p=>`What started as a moment hasn't stopped. The affair is ongoing now, and it's stopped feeling like a mistake and started feeling like a second life. ${p.first} can't keep living in both.`,
    choices:[
      {label:'End it', sub:'guilt, but clean', effect:p=>{ clearFlag(p,'secretAffair'); setFlag(p,'ch_affairProcessed',true); setFlag(p,'ch_affairEnded',true); fx(p,{stress:10,happy:-4}); return `${p.first} ended it. The right thing, and a quiet grief for the road not taken. The secret stays buried — but ${p.first} knows it's there.`; }},
      {label:'Keep it going', sub:'discovery risk rises', effect:p=>{ setFlag(p,'ch_affairProcessed',true); setFlag(p,'ch_affairOngoing',true); fx(p,{happy:4,stress:12}); return `${p.first} chose to keep both lives spinning. Thrilling, exhausting, and a little more likely to come crashing down with every passing year.`; }},
      {label:'Leave your marriage for it', sub:'burn it down', effect:p=>{ clearFlag(p,'secretAffair'); setFlag(p,'ch_affairProcessed',true); setFlag(p,'ch_affairLeft',true); const sp=aliveSpouse(p); if(sp){ sp.bond=clamp(sp.bond-50); } const sx=partnerSex(p); p.rels.push({name:newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:60+rnd(15),alive:true,id:nid()}); fx(p,{happy:6,stress:16}); return `${p.first} chose the new thing and blew up the old one. A new partner, an old marriage in ruins — you can formalize the divorce when you're ready. No going back now.`; }},
      {label:'Confess to your spouse', sub:'face it', effect:p=>{ clearFlag(p,'secretAffair'); setFlag(p,'ch_affairProcessed',true); setFlag(p,'ch_affairConfessed',true); const sp=aliveSpouse(p); fx(p,{stress:8}); if(chance(50)){ if(sp)sp.bond=clamp(sp.bond-20); fx(p,{happy:-2}); return `${p.first} confessed. It nearly ended the marriage — but in the therapy and the long hard talks, something honest was rebuilt. Scarred, but standing.`;} if(sp){sp.bond=clamp(sp.bond-45);} p.married=false; fx(p,{happy:-12}); return `${p.first} confessed, and it was the end. Some honesty arrives too late to save anything but your own conscience.`; }},
    ]},
  // Beat 3 — the guilt event (only if ended)
  { id:'ch_affair_guilt', emoji:'🌑', title:'The Thing You Ended', once:true,
    when:p=>hasFlag(p,'ch_affairEnded')&&p.age>=24&&!hasFlag(p,'ch_affairGuiltDone'), weight:4,
    body:p=>`Months on, the affair ${p.first} ended still surfaces in the quiet moments — not as temptation now, but as weight. A thing nobody knows, sitting just behind the everyday.`,
    choices:[
      {label:'Carry it and move on', sub:'+resolve', effect:p=>{ setFlag(p,'ch_affairGuiltDone',true); fx(p,{stress:6,happy:2}); return `${p.first} let it become a closed chapter — a private scar, a lesson held quietly. The marriage went on, a little wiser, a little sadder.`; }},
      {label:'Let it gnaw at you', sub:'-peace', effect:p=>{ setFlag(p,'ch_affairGuiltDone',true); setFlag(p,'ch_affairUnresolved',true); fx(p,{stress:12,happy:-6}); return `${p.first} couldn't quite set it down. The guilt took up a small permanent room, the kind that has a way of resurfacing years later.`; }},
    ]},
  // Echo — the old rift at 55-60 draws from an unresolved affair
  { id:'ch_affair_rift', emoji:'🍂', title:'The Unfinished Thing', once:true,
    when:p=>p.age>=55&&p.age<=61&&(hasFlag(p,'ch_affairUnresolved')||hasFlag(p,'ch_affairOngoing'))&&!hasFlag(p,'ch_affairRiftDone'), weight:4,
    body:p=>hasFlag(p,'ch_affairOngoing')?`All these years, ${p.first} kept the second life going in the shadows. Now, late in the day, it's exhausting to keep two stories straight — and the secret is heavier than it's ever been.`:`The affair ${p.first} ended decades ago was never really resolved inside. Now, in the late afternoon of life, it comes back asking to finally be put to rest.`,
    choices:[
      {label:'Finally lay it to rest', sub:'+peace', effect:p=>{ setFlag(p,'ch_affairRiftDone',true); clearFlag(p,'secretAffair'); clearFlag(p,'ch_affairOngoing'); fx(p,{stress:-10,happy:8}); return `${p.first} finally closed the oldest open door — whether by ending it, forgiving themselves, or simply letting the past be the past. The relief of an unburdened conscience, arriving late but real.`; }},
      {label:'Take it to the grave', sub:'sealed', effect:p=>{ setFlag(p,'ch_affairRiftDone',true); setFlag(p,'ch_carriesWeight',true); fx(p,{stress:10,health:-6}); return `${p.first} decided some things stay buried forever. The secret is safe. So is the weight of it, pressing quietly on the years that are left.`; }},
    ]},

  // ============================================================
  // THE INHERITANCE  (CHAIN-SHORT) — richer than the existing windfall event
  // ============================================================
  { id:'ch_inherit_b1', emoji:'📜', title:'The Will Is Read', once:true,
    when:p=>p.age>=40&&p.age<=56&&p3DeadParent(p)&&!hasFlag(p,'ch_inheritStage'), weight:3.5,
    body:p=>{ const sib=aliveSibling(p); p._inhHasSib=!!sib; const fair=pick(['fair','favor','against']); setFlag(p,'ch_inheritFair',fair); const line= fair==='fair'?`It's even, clean, exactly what you'd expect`: fair==='favor'?`It's tilted toward ${p.first} — more than a fair share, conspicuously so`:`It's tilted away from ${p.first} — less than you'd expect, and it stings in a way money shouldn't`; return `A parent's estate, and the will is read aloud. ${line}. ${sib?`And ${fname(sib)} is sitting right there, doing the same math you are.`:`A will reflects a relationship, whether you wanted it to or not.`}`; },
    choices:[
      // FAVOR branch
      {label:'Share it with your sibling', sub:'+repair', need:p=>p.flags.ch_inheritFair==='favor'&&!!aliveSibling(p), effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritStage','resolved'); const inh=20000+rnd(120000); const given=Math.round(inh*0.4); fx(p,{money:inh-given,happy:8}); if(sib)sib.bond=clamp(sib.bond+24); return `${p.first} split the windfall more evenly than the will demanded. ${money(given)} given away — and a relationship with ${fname(sib)} bought back. Worth more than the difference.`; }},
      {label:'Keep every cent', sub:'they\'ll remember', need:p=>p.flags.ch_inheritFair==='favor', effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritStage','resolved'); const inh=25000+rnd(140000); fx(p,{money:inh,happy:2}); if(sib){sib.bond=clamp(sib.bond-26);sib.note='resentful';} return `${p.first} took what the will gave, all of it. ${sib?`${capFirst(fname(sib))} said little and forgot nothing.`:'Legally clean.'} Money in the account, a coolness that never quite thaws.`; }},
      // AGAINST branch
      {label:'Accept it and let it lie', sub:'+grace', need:p=>p.flags.ch_inheritFair==='against', effect:p=>{ setFlag(p,'ch_inheritStage','resolved'); const inh=3000+rnd(20000); fx(p,{money:inh,happy:-2}); addTrait(p,'optimist',true); return `${p.first} took the smaller share without a fight. Maybe the will said something true, maybe it didn't. ${capFirst(p.first)} chose peace over the postmortem.`; }},
      {label:'Challenge it legally', sub:'contest', need:p=>p.flags.ch_inheritFair==='against'&&!!aliveSibling(p), effect:p=>{ setFlag(p,'ch_inheritStage','contested'); fx(p,{stress:12,happy:-4}); return `${p.first} lawyered up and contested the will. The estate is frozen, the family is choosing sides, and the real fight is just beginning.`; }},
      {label:'Find out why it was written this way', sub:'+truth', need:p=>p.flags.ch_inheritFair==='against', effect:p=>{ setFlag(p,'ch_inheritStage','resolved'); fx(p,{smarts:3,stress:4}); if(chance(50)){ fx(p,{happy:-6}); return `${p.first} dug, and the answer was a quiet wound: a slight, a misunderstanding, a coldness ${p.first} hadn't known was there. Knowing didn't fix it, but it explained it.`;} fx(p,{happy:4}); return `${p.first} learned the reason, and it was almost tender — a parent trying, clumsily, to balance something ${p.first} never saw. The smaller share meant more than it looked.`; }},
      // FAIR branch
      {label:'Take your share, grieve in peace', sub:'closure', need:p=>p.flags.ch_inheritFair==='fair', effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritStage','resolved'); const inh=10000+rnd(80000); fx(p,{money:inh,happy:2,stress:-4}); if(sib)sib.bond=clamp(sib.bond+6); return `${p.first} took an even share with an even heart. ${sib?`Nothing to fight about with ${fname(sib)} — just a shared loss, carried together.`:'A clean ending to a complicated love.'} The money was never the point.`; }},
    ]},
  // Beat 2/3 — only if contested: the fight reveals the family
  { id:'ch_inherit_fight', emoji:'⚖️', title:'What the Fight Revealed', once:true,
    when:p=>p.flags.ch_inheritStage==='contested'&&!hasFlag(p,'ch_inheritDone'), weight:6,
    body:p=>{ const sib=aliveSibling(p); return `Months into the inheritance fight with ${sib?fname(sib):'the family'}, the lawyers are rich and the grievances are airborne — decades of small wounds, finally said out loud. The money matters less now than what's being revealed.`; },
    choices:[
      {label:'Push it all the way through', sub:'win, lose the family', effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritDone',true); const fees=8000+rnd(20000); if(chance(55)){ const won=15000+rnd(60000); fx(p,{money:won-fees,happy:-6}); } else { fx(p,{money:-fees,happy:-10,stress:10}); } if(sib){sib.bond=clamp(sib.bond-34);sib.note='estranged';} return `${p.first} fought to the last filing. ${sib?`Whatever the judge decided, ${fname(sib)} is gone from ${p.first}'s life now — a sibling traded for a settlement.`:'The estate is settled and the family is in pieces.'} You can't appeal what it cost.`; }},
      {label:'Drop it and try to repair', sub:'+family', effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritDone',true); const inh=5000+rnd(30000); fx(p,{money:inh,happy:6,stress:-8}); if(sib){sib.bond=clamp(sib.bond+20);sib.note='reconciled';} return `${p.first} walked away from the fight before it took everything that mattered. Less money, a sibling kept. ${capFirst(fname(sib))} and ${p.first} are still rebuilding — but they're rebuilding.`; }},
      {label:'Settle quietly, both a little unhappy', sub:'+closure', effect:p=>{ const sib=aliveSibling(p); setFlag(p,'ch_inheritDone',true); const inh=8000+rnd(40000); fx(p,{money:inh,happy:2,stress:-4}); if(sib)sib.bond=clamp(sib.bond+4); return `${p.first} and ${sib?fname(sib):'the others'} took a middling deal nobody loved. The grievances didn't vanish, but the bleeding stopped, and the family limped on intact.`; }},
    ]},

];

// fold Part 3 into the main event pool
CHOICE_EVENTS.push(...CHAIN_EVENTS_P3);

