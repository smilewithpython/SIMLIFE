"use strict";
/* Threadbare · content module: 31-expanded-teen.js — EXPANDED PART 2: ADOLESCENCE (13–18)
   New events only. track:'life'; `cat` for cooldown rotation. Pushed onto CHOICE_EVENTS.
   ============================================================ */

const EXP_TEEN = [

  // ---------- The Thing You Did That Summer ----------
  { id:'xt_thatsummer', emoji:'☀️', title:'That summer', once:true, track:'life', cat:'teen_flavor', weight:3,
    when:p=>p.age>=14 && p.age<=16,
    body:p=>{ const thing=pick(['a secret relationship nobody knew about','a small crime ${f} got clean away with','something kind ${f} did anonymously','a place that became entirely ${f}\'s own','a fight ${f} won','a fight ${f} lost','one long stretch of pure, unsupervised freedom']); setFlag(p,'_thatSummer',thing.replace(/\$\{f\}/g,p.first)); return `Something happened that summer that no one else knows: ${thing.replace(/\$\{f\}/g,p.first)}.`; },
    choices:[
      {label:'Tell someone, eventually', sub:'let it out', effect:p=>{ fx(p,{happy:3}); markCat(p,'teen_flavor'); return `${p.first} would carry it a while, then one day tell the right person. Some weight is meant to be set down.`; }},
      {label:'Keep it forever', sub:'yours alone', effect:p=>{ setFlag(p,'summerSecret',true); fx(p,{smarts:2}); markCat(p,'teen_flavor'); return `${p.first} decided some things stay sealed. This one would surface only in the final telling of a life.`; }},
    ]},

  // ---------- Being Followed (family history gate) ----------
  { id:'xt_followed', emoji:'👁', title:'Someone\'s watching the house', once:true, track:'world', cat:'teen_danger', weight:5,
    when:p=>p.age>=14 && p.age<=17 && (hasFlag(p,'familySecretSeed') || (p.flags&&p.flags.crimeFamily) || (p.powers&&p.powers.length>0)),
    body:p=>`${p.first} keeps seeing the same car. The same figure at the end of the street. Following, at a distance, to school and back.`,
    choices:[
      {label:'Confront them', sub:'bold, risky', effect:p=>{ if(chance(50)){ const who=pick(['a tired-looking investigator','someone with an old grudge against the family','a person who knew a parent "before"']); setFlag(p,'_followerWas',who); fx(p,{stress:8,smarts:3}); markCat(p,'teen_danger'); return `${p.first} walked right up to them. It was ${who}. The conversation raised the floor of everything ${p.first} thought they knew.`;} fx(p,{stress:12,health:-4}); markCat(p,'teen_danger'); return `${p.first} confronted them and it went sideways — a scare, a shove, and then they were gone. ${p.first} didn't sleep well for weeks.`; }},
      {label:'Tell a parent', sub:'bring it home', effect:p=>{ const par=p.rels.find(r=>/Mother|Father/.test(r.kind)&&r.alive); if(par)par.bond=clamp(par.bond+4); fx(p,{stress:6}); markCat(p,'teen_danger'); return `${p.first} told a parent, whose face did something complicated before they said "don't worry about it." ${p.first} worried about it.`; }},
      {label:'Ignore it', sub:'maybe it\'s nothing', effect:p=>{ fx(p,{stress:5}); markCat(p,'teen_danger'); return `${p.first} told themselves it was nothing. The car stopped coming. The question never quite did.`; }},
      {label:'Follow them back', sub:'turn the tables', effect:p=>{ setFlag(p,'teenMysterySeed',true); fx(p,{stress:8,smarts:4,athletic:2}); markCat(p,'teen_danger'); return `${p.first} tailed the tail. What ${p.first} learned, ${p.first} kept — a thread to pull later, when older and braver.`; }},
    ]},

  // ---------- The Academic Cheating Ring ----------
  { id:'xt_cheatring', emoji:'📚', title:'The cheating ring', once:true, track:'life', cat:'teen_moral', weight:3,
    when:p=>p.age>=14 && p.age<=17 && p.inSchool,
    body:p=>`A classmate leans in with an offer: a whole network — shared answers, sold papers, advance copies of tests. In, or out?`,
    choices:[
      {label:'Join', sub:'grades up, risk on', effect:p=>{ if(chance(22)){ fx(p,{smarts:-2,happy:-8}); p.record.push('Academic dishonesty'); markCat(p,'teen_moral'); return `${p.first} got caught. Suspension, a stain on the record, a very bad phone call home.`;} fx(p,{smarts:4,stress:4}); setFlag(p,'gotAwayWithIt',true); markCat(p,'teen_moral'); return `The grades climbed and nobody ever knew. ${p.first} learned, dangerously young, that some things you just get away with.`; }},
      {label:'Decline', sub:'stay clean', effect:p=>{ fx(p,{smarts:2,happy:1}); markCat(p,'teen_moral'); return `${p.first} passed. Harder road, clean conscience.`; }},
      {label:'Report it', sub:'+conscience, -social', effect:p=>{ setFlag(p,'spokeUpYoung',true); fx(p,{happy:-3,smarts:2}); markCat(p,'teen_moral'); return `${p.first} told a teacher. The ring collapsed. So did a few friendships. ${p.first} isn't sure, even now, if it was worth it.`; }},
      {label:'Use it once and stop', sub:'a taste', effect:p=>{ fx(p,{smarts:2,stress:3}); markCat(p,'teen_moral'); return `${p.first} dipped in exactly once, aced one test, and got out clean. The guilt was small but it had a long memory.`; }},
    ]},

  // ---------- Running for Something ----------
  { id:'xt_running', emoji:'🗳', title:'Running for something', once:true, track:'life', cat:'teen_social', weight:3,
    when:p=>p.age>=14 && p.age<=17 && p.inSchool,
    body:p=>`Class president. Team captain. Club lead. A real contest, with real winners and losers. ${p.first} could throw their hat in.`,
    choices:[
      {label:'Run an honest campaign', sub:'who you are', effect:p=>{ const win=(p.stats.fame+p.stats.smarts)>90||chance(45); if(win){ fx(p,{fame:5,happy:6}); setFlag(p,'teenLeader',true); markCat(p,'teen_social'); return `${p.first} ran clean and won. Leadership, it turns out, suits them.`;} fx(p,{happy:-2,smarts:2}); setFlag(p,'lostWithGrace',true); markCat(p,'teen_social'); return `${p.first} ran honest and lost — and shook the winner's hand and meant it. That's a kind of winning too.`; }},
      {label:'Run a populist campaign', sub:'tell them what they want', effect:p=>{ const win=p.stats.fame>50||chance(55); if(win){ fx(p,{fame:6,happy:4,smarts:-1}); setFlag(p,'teenLeader',true); markCat(p,'teen_social'); return `${p.first} promised the moon and won in a landslide. Delivering it was someone else's problem.`;} fx(p,{happy:-3}); markCat(p,'teen_social'); return `${p.first} pandered hard and still lost. Worst of both — no win, no dignity.`; }},
      {label:'Don\'t run — manage someone else\'s', sub:'power behind the throne', effect:p=>{ fx(p,{smarts:5,happy:2}); setFlag(p,'strategist',true); markCat(p,'teen_social'); return `${p.first} ran the campaign instead of the candidate, and found they liked the strings better than the spotlight.`; }},
    ]},

  // ---------- Help Someone You Don't Like ----------
  { id:'xt_helpenemy', emoji:'🤝', title:'They need help. You don\'t like them.', once:true, track:'life', cat:'teen_moral', weight:3,
    when:p=>p.age>=13 && p.age<=17,
    body:p=>`Someone ${p.first} genuinely can't stand is in real trouble — not danger, just trouble — and ${p.first} is the only one who can help.`,
    choices:[
      {label:'Help them', sub:'be bigger than it', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:4,smarts:2}); markCat(p,'teen_moral'); return `${p.first} helped, gritted teeth and all. The dislike didn't vanish, but ${p.first} grew a size that day.`; }},
      {label:'Don\'t', sub:'let them sort it out', effect:p=>{ fx(p,{happy:-2}); markCat(p,'teen_moral'); return `${p.first} walked past. Fair, maybe. It sat oddly for a long time after.`; }},
      {label:'Help anonymously', sub:'they never know', effect:p=>{ setFlag(p,'anonKindness',true); setFlag(p,'goodHeart'); fx(p,{happy:5}); markCat(p,'teen_moral'); return `${p.first} fixed it from the shadows and let them never know who. The quietest kind of good. It made the obituary, eventually.`; }},
    ]},

  // ---------- Religious / Spiritual Crisis ----------
  { id:'xt_faith', emoji:'🕯', title:'The question of faith', once:true, track:'life', cat:'teen_emotion', weight:3,
    when:p=>p.age>=13 && p.age<=17,
    body:p=>`The faith ${p.first} was raised in — or the absence of one — stops being a given and becomes, suddenly, a real and open question.`,
    choices:[
      {label:'Lean in deeper', sub:'find meaning', effect:p=>{ setFlag(p,'faithPath','devout'); fx(p,{happy:4,stress:-3}); markCat(p,'teen_emotion'); return `${p.first} went toward it, not away, and found something steadying there. It would shape how ${p.first} meets grief, and death, for life.`; }},
      {label:'Walk away from it', sub:'on your own terms', effect:p=>{ setFlag(p,'faithPath','secular'); fx(p,{smarts:3}); markCat(p,'teen_emotion'); return `${p.first} set it down, gently or not. The world got a little colder and a little more honest.`; }},
      {label:'Question from inside', sub:'stay, but doubt', effect:p=>{ setFlag(p,'faithPath','doubting'); fx(p,{smarts:2,stress:2}); markCat(p,'teen_emotion'); return `${p.first} stayed but stopped pretending the answers were easy. Faith with the doubt left in is its own kind of strong.`; }},
      {label:'Find your own version', sub:'build something', effect:p=>{ setFlag(p,'faithPath','seeker'); fx(p,{happy:3,smarts:2}); markCat(p,'teen_emotion'); return `${p.first} stitched together a private belief from a dozen sources. Nobody else could follow it, and that was fine.`; }},
    ]},

  // ---------- The Party That Went Too Far ----------
  { id:'xt_party', emoji:'🎉', title:'The party that went too far', once:true, track:'life', cat:'teen_danger', weight:3,
    when:p=>p.age>=15 && p.age<=17,
    body:p=>{ const trouble=pick(['a fight breaking out','someone getting hurt','property getting wrecked','a situation that needed an adult and had none']); setFlag(p,'_partyTrouble',trouble); return `It started fine. Then ${trouble} — and the whole night tilted into something nobody planned.`; },
    choices:[
      {label:'Intervene', sub:'step up', effect:p=>{ setFlag(p,'standsUp'); fx(p,{happy:3,stress:6,athletic:1}); markCat(p,'teen_danger'); return `${p.first} stepped into the middle of it and made it stop. Scary, and exactly the right thing.`; }},
      {label:'Leave', sub:'get clear', effect:p=>{ fx(p,{smarts:2}); markCat(p,'teen_danger'); return `${p.first} walked out before it got worse. Self-preservation isn't nothing.`; }},
      {label:'Stay quiet', sub:'don\'t get involved', effect:p=>{ fx(p,{stress:5,happy:-2}); markCat(p,'teen_danger'); return `${p.first} froze on the edge of it and did nothing. The not-doing stuck around.`; }},
      {label:'Become part of the problem', sub:'get swept up', effect:p=>{ if(chance(35))p.record.push('Minor incident'); fx(p,{stress:6,happy:-3}); setFlag(p,'earlyTrouble'); markCat(p,'teen_danger'); return `${p.first} got swept into it instead of out of it. There were consequences, and a lesson in them.`; }},
    ]},

  // ---------- Sneaking In ----------
  { id:'xt_sneakin', emoji:'🎟', title:'You weren\'t supposed to be there', once:true, track:'life', cat:'teen_flavor', weight:3,
    when:p=>p.age>=14 && p.age<=17,
    body:p=>{ const place=pick(['a concert','a 21+ club','a closed building','a restricted backstage']); setFlag(p,'_sneakPlace',place); return `${place[0].toUpperCase()+place.slice(1)}. ${p.first} technically can't be in there. The door is right there, unwatched.`; },
    choices:[
      {label:'Go for it', sub:'make the memory', effect:p=>{ if(chance(5)){ fx(p,{stress:8,happy:-2}); p.record.push('Trespassing'); markCat(p,'teen_flavor'); return `${p.first} got caught. A scare, a warning, a story that wasn't fun yet.`;} setFlag(p,'riskTolerant',true); fx(p,{happy:7}); markCat(p,'teen_flavor'); return `${p.first} walked in like they belonged, and it worked. The night burned itself permanently into memory.`; }},
      {label:'Decide against it', sub:'last second', effect:p=>{ fx(p,{smarts:2,happy:-1}); markCat(p,'teen_flavor'); return `${p.first} stood at the door, then turned around. Safe. A little wistful about it for years.`; }},
    ]},

  // ---------- Online Relationship ----------
  { id:'xt_online', emoji:'💬', title:'Someone online', once:true, track:'life', cat:'teen_social', weight:3,
    when:p=>p.age>=14 && p.age<=17,
    body:p=>`${p.first} has been talking to someone for months. Late nights, real conversations, a whole connection — and they've never once met in person.`,
    choices:[
      {label:'Meet in person', sub:'cross the line', effect:p=>{ const out=pick(['exactly who they said — a rare, good thing','more complicated than the screen let on','not who they claimed at all']); if(out.startsWith('exactly')){ const f=addFriend(p,'Friend'); f.bond=70; fx(p,{happy:8}); markCat(p,'teen_social'); return `${p.first} met them and it was real, and good. ${f.name.split(' ')[0]} would matter for years.`;} if(out.startsWith('more')){ fx(p,{happy:1,smarts:3,stress:4}); markCat(p,'teen_social'); return `${p.first} met them and it was... complicated. Real, but not simple. ${p.first} grew up a little in an afternoon.`;} fx(p,{stress:10,happy:-6,smarts:3}); markCat(p,'teen_social'); return `It wasn't who they said. ${p.first} got out safe, shaken, and far more careful about screens.`; }},
      {label:'Keep it online', sub:'safe distance', effect:p=>{ fx(p,{happy:2}); markCat(p,'teen_social'); return `${p.first} kept it where it lived. Some connections are exactly as deep as the wire allows.`; }},
      {label:'Let it fade', sub:'no ending', effect:p=>{ setFlag(p,'mightHaveBeen',true); fx(p,{happy:-2}); markCat(p,'teen_social'); return `It didn't end so much as go quiet. Years later it'd surface as a "something that might have been."`; }},
    ]},

  // ---------- A Teacher Who Was Wrong ----------
  { id:'xt_badteacher', emoji:'🧑‍🏫', title:'A teacher who was wrong', once:true, track:'life', cat:'teen_moral', weight:3,
    when:p=>p.age>=13 && p.age<=17 && p.inSchool,
    body:p=>`A teacher is misusing their authority — over ${p.first}, or over a classmate who can't push back. It's not imagined. It's real.`,
    choices:[
      {label:'Confront them directly', sub:'face it', effect:p=>{ setFlag(p,'authorityResponse','confront'); if(chance(45)){ fx(p,{happy:3,smarts:2}); markCat(p,'teen_moral'); return `${p.first} stood up to them, and somehow it landed. The teacher backed off. Word got around.`;} fx(p,{stress:8,happy:-4}); markCat(p,'teen_moral'); return `${p.first} pushed back and paid for it — a worse grade, a target on their back. Right doesn't always win.`; }},
      {label:'Report them', sub:'go over their head', effect:p=>{ setFlag(p,'authorityResponse','report'); setFlag(p,'spokeUpYoung',true); if(chance(50)){ fx(p,{happy:2}); markCat(p,'teen_moral'); return `${p.first} reported it and was believed. Something actually changed. Rare and worth it.`;} fx(p,{happy:-5,stress:6}); setFlag(p,'authorityDistrust',true); markCat(p,'teen_moral'); return `${p.first} reported it and wasn't believed. A hard early lesson in how institutions protect themselves.`; }},
      {label:'Say nothing', sub:'keep your head down', effect:p=>{ setFlag(p,'authorityResponse','silent'); fx(p,{stress:5,happy:-2}); markCat(p,'teen_moral'); return `${p.first} stayed quiet and got through. The staying-quiet became a small private shame.`; }},
      {label:'Work around them', sub:'quiet resistance', effect:p=>{ setFlag(p,'authorityResponse','subvert'); fx(p,{smarts:4}); markCat(p,'teen_moral'); return `${p.first} didn't fight and didn't fold — just quietly routed around the problem. A skill that'd come back useful.`; }},
    ]},

  // ---------- First Real Power Over Someone ----------
  { id:'xt_socialpower', emoji:'🎭', title:'You could destroy them', once:true, track:'life', cat:'teen_moral', weight:3,
    when:p=>p.age>=15 && p.age<=17,
    body:p=>`${p.first} is holding something — a secret, a screenshot, a truth — that could ruin someone's reputation, or make someone's year. Real social power, for the first time, and it's entirely ${p.first}'s to use.`,
    choices:[
      {label:'Use it', sub:'wield it', effect:p=>{ setFlag(p,'usedPowerYoung',true); fx(p,{fame:4,happy:-3,stress:5}); markCat(p,'teen_moral'); return `${p.first} used it, and it worked, and that was the problem. Knowing you can is different from knowing you should.`; }},
      {label:'Don\'t use it', sub:'set it down', effect:p=>{ setFlag(p,'restraintYoung',true); fx(p,{happy:4,smarts:3}); markCat(p,'teen_moral'); return `${p.first} held the power and chose not to spend it. The choosing not to is the whole character, right there.`; }},
      {label:'Use it carefully', sub:'a scalpel, not a hammer', effect:p=>{ fx(p,{smarts:4,fame:2,stress:3}); markCat(p,'teen_moral'); return `${p.first} used just enough, precisely, and let the rest go. Frightening, how natural it felt.`; }},
      {label:'Give the power away', sub:'hand it to them', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:5}); markCat(p,'teen_moral'); return `${p.first} handed the secret back to the person it could hurt and said "this is yours, not mine." They never forgot it.`; }},
    ]},

  // ---------- The Gap Year (flavor) ----------
  { id:'xt_gapyear', emoji:'🌍', title:'The open summer', once:true, track:'life', cat:'teen_flavor', weight:3,
    when:p=>p.age>=17 && p.age<=18,
    body:p=>{ const did=pick(['travelled on almost no money','worked a strange, wonderful job','volunteered for something that mattered','did nothing but read for three months','fell briefly, completely in love','learned something gloriously impractical']); setFlag(p,'_gapYear',did); return `Before whatever came next, ${p.first} had one stretch of genuine openness. ${p.first} ${did}.`; },
    choices:[ {label:'Live it', sub:'pure texture', effect:p=>{ fx(p,{happy:6,smarts:2}); markCat(p,'teen_flavor'); return `No grand consequence. Just a season that ${p.first} would return to, in memory, for the rest of their life.`; }} ]},

  // ---------- Graduation ----------
  { id:'xt_graduation', emoji:'🎓', title:'Graduation', once:true, track:'life', cat:'teen_flavor', weight:4,
    when:p=>p.age>=17 && p.age<=18 && p.inSchool,
    body:p=>{ const parentThere = p.rels.some(r=>/Mother|Father/.test(r.kind)&&r.alive); setFlag(p,'_gradParent',parentThere); return `Caps in the air, names called, a folding chair under a hot sky. ${p.first} scans the crowd for the faces that matter.`; },
    choices:[
      {label:'Give the speech', sub:'if they\'ll have you', need:p=>p.stats.smarts>62, effect:p=>{ const kind=pick(['earnest','funny','quietly defiant','unexpectedly moving']); setFlag(p,'gaveGradSpeech',kind); fx(p,{fame:4,happy:6,smarts:2}); markCat(p,'teen_flavor'); return `${p.first} stood up and gave an ${kind} speech. Public speaking, leadership — that door cracked open here.`; }},
      {label:'Just take it in', sub:'be present', effect:p=>{ const par=p.rels.find(r=>/Mother|Father/.test(r.kind)&&r.alive); if(par)par.bond=clamp(par.bond+4); fx(p,{happy:7}); setFlag(p,'gradPhoto',true); markCat(p,'teen_flavor'); return `${p.first} didn't speak — just felt it all, and found the faces in the crowd. The photo from that day would outlive everyone in it.`; }},
      {label:'Slip out early', sub:'not your scene', effect:p=>{ fx(p,{happy:1,smarts:1}); markCat(p,'teen_flavor'); return `${p.first} ducked the whole ceremony and felt free instead of sentimental. To each their own ending.`; }},
    ]},

];

CHOICE_EVENTS.push(...EXP_TEEN);
