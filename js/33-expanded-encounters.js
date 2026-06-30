"use strict";
/* Threadbare · content module: 33-expanded-encounters.js — EXPANDED PART 3: POWERED ENCOUNTERS
   The world holds ~60–80 unnamed powered individuals beyond Homelander and the
   named sub-bosses. Powered characters meet them more often; the unpowered meet
   them rarely, as bystanders. track:'world'. Each has a `cat` so they rotate.

   Frequency is shaped by gating, not a timer: powered encounters require
   p.powers.length>0; bystander versions fire for anyone but are weighted low and
   age-spread so they stay rare (~once a life), per the spec.
   ============================================================ */

function encHasPowers(p){ return p.powers && p.powers.length>0; }
function encName(){ return newFirst(makeSex())+' '+pick(LAST); }
// record a resolved powered encounter on the bloodline-ish person record
function encTally(p){ p._encResolved=(p._encResolved||0)+1; }

const EXP_ENCOUNTERS = [

  // ---------- The Vigilante ----------
  { id:'xe_vigilante', emoji:'🦸', title:'The vigilante', once:true, track:'world', cat:'enc_super', weight:6,
    when:p=>p.age>=18 && encHasPowers(p),
    body:p=>`Someone else with abilities is working ${p.first}'s city — masked, unsanctioned, doing their own version of right. Sooner or later, paths cross.`,
    choices:[
      {label:'Offer an alliance', sub:'two is stronger', effect:p=>{ const f={name:encName(),kind:'Ally',sex:makeSex(),bond:55,alive:true,id:nid(),powered:true}; p.rels.push(f); setFlag(p,'hasPoweredAlly',true); fx(p,{fame:3,happy:3}); markCat(p,'enc_super'); return `${p.first} reached out, and the vigilante — wary, then warmer — agreed. ${f.name.split(' ')[0]} would turn up again, more than once.`; }},
      {label:'Mark your territory', sub:'this city\'s taken', effect:p=>{ setFlag(p,'poweredRival',true); fx(p,{stress:6,fame:2}); markCat(p,'enc_super'); return `${p.first} made it clear whose streets these were. Friction now, and a name that would resurface with an edge to it.`; }},
      {label:'Stay out of their way', sub:'live and let live', effect:p=>{ fx(p,{smarts:2}); markCat(p,'enc_super'); return `${p.first} let them work and went home. The city's big enough — for now.`; }},
    ]},

  // ---------- The Vigilante (bystander) ----------
  { id:'xe_vigilante_by', emoji:'👀', title:'You saw one of them', once:true, track:'world', cat:'enc_bystander', weight:2,
    when:p=>p.age>=20 && p.age<=60 && !encHasPowers(p),
    body:p=>`${p.first} is just trying to get through the day when one of *them* blurs past — a powered individual mid-rescue, or mid-mistake. The wind of it ruffles ${p.first}'s coat.`,
    choices:[
      {label:'Film it', sub:'everyone does now', effect:p=>{ fx(p,{happy:2}); if(chance(30)){ fx(p,{fame:2}); markCat(p,'enc_bystander'); return `${p.first} caught it clean and the clip did numbers. Fifteen minutes of borrowed, secondhand fame.`;} markCat(p,'enc_bystander'); return `${p.first} got shaky footage and a story for the dinner table. The world has powers in it, even for those who don't.`; }},
      {label:'Just watch', sub:'be present for it', effect:p=>{ fx(p,{happy:3,smarts:1}); markCat(p,'enc_bystander'); return `${p.first} lowered the phone and simply watched something impossible happen, close enough to feel real.`; }},
      {label:'Help the people they left behind', sub:'+heart', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:4}); markCat(p,'enc_bystander'); return `${p.first} skipped the spectacle and went to the shaken bystanders, the ones the hero didn't stop for.`; }},
    ]},

  // ---------- The Powered Criminal ----------
  { id:'xe_criminal', emoji:'💰', title:'A powered robbery', once:true, track:'world', cat:'enc_super', weight:6,
    when:p=>p.age>=18 && encHasPowers(p),
    body:p=>`A mid-level powered individual is tearing through a bank — or an armored car, or a store — and ${p.first} happens to be right there.`,
    choices:[
      {label:'Intervene', sub:'risky', effect:p=>{ const win = (p.powers.length>=2) || chance(55); if(win){ encTally(p); fx(p,{fame:5,happy:4,stress:6}); setFlag(p,'stoppedPoweredCrim',true); markCat(p,'enc_super'); return `${p.first} stepped in and ended it. The criminal got dragged off swearing ${p.first}'s description into a memory. They'll be back, with a grudge.`;} fx(p,{health:-12,stress:12}); markCat(p,'enc_super'); return `${p.first} misjudged them — they were stronger than they looked. ${p.first} got hurt and they got away. A lesson in not assuming.`; }},
      {label:'Get civilians out instead', sub:'+heart, less risk', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:4,stress:5}); markCat(p,'enc_super'); return `${p.first} skipped the fight and pulled people to the exits. Less glory, more lives. ${p.first} could live with that math.`; }},
      {label:'Stay hidden', sub:'don\'t expose yourself', effect:p=>{ fx(p,{stress:6,happy:-2}); markCat(p,'enc_super'); return `${p.first} kept ${p.first}'s head down and ${p.first}'s secret intact, and watched, and hated watching.`; }},
    ]},

  // ---------- The Mercenary (paid to find you) ----------
  { id:'xe_mercenary', emoji:'🎯', title:'Someone was paid to find you', once:true, track:'world', cat:'enc_super', weight:5,
    when:p=>p.age>=22 && encHasPowers(p) && (p.stats.fame>45 || hasFlag(p,'poweredRival') || hasFlag(p,'stoppedPoweredCrim')),
    body:p=>`This one isn't random. Someone hired them, specifically, to deal with ${p.first} — and they've chosen powers built to counter ${p.first}'s.`,
    choices:[
      {label:'Beat them and find out who sent them', sub:'pull the thread', effect:p=>{ if(chance(55)){ encTally(p); setFlag(p,'mercWhoSentSeed',true); fx(p,{fame:3,stress:10,health:-5}); markCat(p,'enc_super'); return `${p.first} won — barely — and squeezed a name out of them before they fled. Someone, somewhere, wants ${p.first} gone. Now ${p.first} has a thread to pull.`;} fx(p,{health:-15,stress:14}); markCat(p,'enc_super'); return `${p.first} won the fight but they took their secret with them. The question — *who* — sits unanswered and cold.`; }},
      {label:'Negotiate — they\'re just hired', sub:'+smarts', effect:p=>{ fx(p,{smarts:3,stress:6,money:-(5000+rnd(20000))}); markCat(p,'enc_super'); return `${p.first} bought them off — mercenaries are loyal to money, not the client. Cheaper than a fight, in blood at least.`; }},
      {label:'Disappear for a while', sub:'go to ground', effect:p=>{ fx(p,{stress:8,happy:-3}); markCat(p,'enc_super'); return `${p.first} went quiet and hard to find until the contract lapsed. Safe. But knowing someone paid for ${p.first}'s name changes a person.`; }},
    ]},

  // ---------- The Unstable ----------
  { id:'xe_unstable', emoji:'⚠️', title:'Their power is hurting them', once:true, track:'world', cat:'enc_super', weight:6,
    when:p=>p.age>=18 && encHasPowers(p),
    body:p=>`${p.first} comes across a powered individual whose ability is tearing them apart — or spilling out and hurting others without their meaning to. They're terrified.`,
    choices:[
      {label:'Help them — talk them down', sub:'+heart', effect:p=>{ if(chance(65)){ const f={name:encName(),kind:'Ally',sex:makeSex(),bond:60,alive:true,id:nid(),powered:true}; p.rels.push(f); setFlag(p,'hasPoweredAlly',true); fx(p,{happy:5,stress:6}); markCat(p,'enc_super'); return `${p.first} got through to them, and the danger drained away. ${f.name.split(' ')[0]} owes ${p.first} a debt — and remembers it.`;} fx(p,{stress:10,happy:2}); markCat(p,'enc_super'); return `${p.first} tried, and it helped, and then they were gone before ${p.first} got a name. Grateful, briefly, and lost to the city.`; }},
      {label:'Call the authorities', sub:'safe, cold', effect:p=>{ fx(p,{stress:4}); markCat(p,'enc_super'); return `${p.first} made the call. People in vans came and took them somewhere. ${p.first} tries not to wonder where.`; }},
      {label:'Stay clear', sub:'not your problem', effect:p=>{ fx(p,{stress:6,happy:-3}); markCat(p,'enc_super'); return `${p.first} backed away. Self-preservation. The look on their face, though — that stayed.`; }},
      {label:'Use the chaos', sub:'cold opportunism', effect:p=>{ setFlag(p,'usedUnstable',true); fx(p,{money:5000+rnd(15000),happy:-4,stress:6}); markCat(p,'enc_super'); return `${p.first} turned someone's worst moment into ${p.first}'s gain. It worked. It says something about ${p.first} that ${p.first} would rather not hear.`; }},
    ]},

  // ---------- The Recluse ----------
  { id:'xe_recluse', emoji:'🚪', title:'The one who\'s been hiding', once:true, track:'world', cat:'enc_super', weight:5,
    when:p=>p.age>=25 && encHasPowers(p),
    body:p=>`${p.first} stumbles onto someone who's been hiding what they are for decades — quiet, careful, invisible. They have a whole life, and a whole story, behind the door.`,
    choices:[
      {label:'Keep their secret', sub:'+trust', effect:p=>{ setFlag(p,'keptReclusSecret',true); fx(p,{happy:4,smarts:2}); markCat(p,'enc_super'); return `${p.first} promised silence and meant it. In a world that hunts people like them, that promise was the kindest thing ${p.first} could offer.`; }},
      {label:'Ask them to teach you', sub:'rare gift', effect:p=>{ if(chance(8) && p.powers.length<TOTAL_POWERS){ const avail=POWERS.filter(x=>!p.powers.includes(x)); if(avail.length){ const np=pick(avail); p.powers.push(np); setFlag(p,'reclusTaught',np); fx(p,{happy:8,stress:4}); markCat(p,'enc_super'); return `Astonishingly, they said yes — and over months, drew a *new* ability out of ${p.first} that was sleeping there all along: ${np}. Almost no one gets a third gift in one life.`; } } fx(p,{smarts:4,happy:3}); markCat(p,'enc_super'); return `They taught ${p.first} not a power but a discipline — how to *hold* one. Worth more than ${p.first} expected.`; }},
      {label:'Just hear their story', sub:'witness a life', effect:p=>{ fx(p,{smarts:3,happy:3}); markCat(p,'enc_super'); return `${p.first} sat and listened to a whole hidden century of a person. Some encounters are gifts disguised as conversations.`; }},
      {label:'Leave them be', sub:'respect the door', effect:p=>{ fx(p,{smarts:2}); markCat(p,'enc_super'); return `${p.first} closed the door softly and never came back. Some lives are not for ${p.first} to enter.`; }},
    ]},

  // ---------- The Powered Child (long chain via then) ----------
  { id:'xe_poweredchild', emoji:'🧒', title:'A child, manifesting', once:true, track:'world', cat:'enc_super', weight:6,
    when:p=>p.age>=25 && encHasPowers(p),
    body:p=>`A kid — ten, maybe twelve — is manifesting powers and has no idea what's happening to them. They're frightened. The adults around them are more frightened. ${p.first} understands exactly what this is.`,
    choices:[
      {label:'Take responsibility for them', sub:'a long road', effect:p=>{ const f={name:encName(),kind:'Mentee',sex:makeSex(),bond:50,alive:true,id:nid(),powered:true,age:11}; p.rels.push(f); setFlag(p,'hasMentee',true); fx(p,{happy:5,stress:6}); markCat(p,'enc_super'); return `${p.first} stepped in as the one adult who *got it*. ${f.name.split(' ')[0]} would grow up in the orbit of ${p.first}'s bloodline — a relationship that outlasts ${p.first}.`; },
        then:p=>({ emoji:'🌱', title:'Teaching them', body:q=>`The mentee looks to ${q.first} for how to carry this. What does ${q.first} pass on?`,
          choices:[
            {label:'Control before everything', sub:'discipline', effect:q=>{ const m=q.rels.find(r=>r.kind==='Mentee'); if(m)m.bond=clamp(m.bond+10); fx(q,{happy:3}); return `${q.first} taught them control first, fear never. They steadied. ${q.first} did that.`; }},
            {label:'Hide it, always', sub:'safety in secrecy', effect:q=>{ const m=q.rels.find(r=>r.kind==='Mentee'); if(m)m.bond=clamp(m.bond+4); fx(q,{stress:4}); return `${q.first} taught them to hide — the way ${q.first} learned to. Safe, and a little sad, and maybe necessary.`; }},
          ]})},
      {label:'Alert their parents gently', sub:'guide the adults', effect:p=>{ fx(p,{happy:3,smarts:2}); markCat(p,'enc_super'); return `${p.first} found the parents and helped them understand instead of fear it. Sometimes the help a kid needs is aimed at the grown-ups.`; }},
      {label:'Let it unfold', sub:'don\'t interfere', effect:p=>{ fx(p,{smarts:1,happy:-2}); markCat(p,'enc_super'); return `${p.first} watched from a distance and didn't step in. They'd figure it out, or they wouldn't. ${p.first} hopes they did.`; }},
    ]},

  // ---------- The Rival (3-encounter arc, seeded) ----------
  { id:'xe_rival_early', emoji:'🔷', title:'Someone like you', once:true, track:'world', cat:'enc_rival', weight:6,
    when:p=>p.age>=22 && p.age<=32 && encHasPowers(p),
    body:p=>{ const nm=encName(); setFlag(p,'_rivalName',nm); return `${p.first} keeps crossing paths with one particular powered individual — similar abilities, similar ambitions, always *there*. Right now it's neutral. A nod across a room. But ${p.first} can feel it: this one's going to matter.`; },
    choices:[
      {label:'Extend a hand', sub:'set the tone friendly', effect:p=>{ setFlag(p,'rivalTone','warm'); fx(p,{happy:3}); markCat(p,'enc_rival'); return `${p.first} chose warmth. Where it goes from here is still open — but it started kind.`; }},
      {label:'Size them up coldly', sub:'set the tone wary', effect:p=>{ setFlag(p,'rivalTone','cold'); fx(p,{stress:4,smarts:2}); markCat(p,'enc_rival'); return `${p.first} kept it cool and watchful. Whatever this becomes, ${p.first} won't be caught off guard.`; }},
    ]},
  { id:'xe_rival_mid', emoji:'🔶', title:'The rival returns', once:true, track:'world', cat:'enc_rival', weight:7,
    when:p=>p.age>=33 && p.age<=48 && encHasPowers(p) && hasFlag(p,'rivalTone'),
    body:p=>`The one from years back is back — and now your goals are openly crossed. Friction, sharp and personal.`,
    choices:[
      {label:'Compete hard but clean', sub:'respect through rivalry', effect:p=>{ setFlag(p,'rivalMid','clean'); fx(p,{stress:8,fame:3}); markCat(p,'enc_rival'); return `${p.first} pushed against them at full strength, but never below the belt. The respect, oddly, grew.`; }},
      {label:'Play dirty to win', sub:'+advantage, -soul', effect:p=>{ setFlag(p,'rivalMid','dirty'); fx(p,{fame:4,happy:-3,stress:8}); markCat(p,'enc_rival'); return `${p.first} found the low road and took it. ${p.first} got ahead. The rival noticed exactly what ${p.first} was willing to do.`; }},
      {label:'Try to make peace', sub:'end the cycle', effect:p=>{ setFlag(p,'rivalMid','peace'); fx(p,{happy:4,stress:4}); markCat(p,'enc_rival'); return `${p.first} reached across the friction and offered an end to it. They didn't take it — yet. But ${p.first} meant it.`; }},
    ]},
  { id:'xe_rival_late', emoji:'🔺', title:'The rival, one last time', once:true, track:'world', cat:'enc_rival', weight:8,
    when:p=>p.age>=49 && encHasPowers(p) && hasFlag(p,'rivalMid'),
    body:p=>`After a lifetime of crossing paths, the rival stands in front of ${p.first} again — older, tired, the same. However this ends, it ends now.`,
    choices:[
      {label:'Reconcile', sub:'lay it down', effect:p=>{ setFlag(p,'rivalEndPeace',true); fx(p,{happy:8,stress:-6}); markCat(p,'enc_rival'); return `${p.first} and the rival laid the whole long thing to rest, two old powers who'd shaped each other more than anyone. Peace, at the end.`; }},
      {label:'Final confrontation', sub:'settle it', effect:p=>{ const win = (hasFlag(p,'rivalMid')&&p.flags.rivalMid==='dirty')?chance(50):chance(60); if(win){ encTally(p); setFlag(p,'rivalEndWon',true); fx(p,{fame:5,stress:10,health:-6}); markCat(p,'enc_rival'); return `${p.first} won the last one. Standing over a defeated rival ${p.first} had known for thirty years felt nothing like ${p.first} imagined it would.`;} fx(p,{health:-12,happy:-6,stress:12}); setFlag(p,'rivalEndLost',true); markCat(p,'enc_rival'); return `${p.first} lost the last one. The rival had grown while ${p.first} coasted. Some chapters don't close the way you wanted.`; }},
      {label:'Walk away for good', sub:'let it be unfinished', effect:p=>{ setFlag(p,'rivalEndOpen',true); fx(p,{smarts:3,happy:1}); markCat(p,'enc_rival'); return `${p.first} simply turned and left it unfinished, forever. Not every rivalry earns a final scene. Some just stop.`; }},
    ]},

  // ---------- The Experiment ----------
  { id:'xe_experiment', emoji:'🧪', title:'Made in a lab', once:true, track:'world', cat:'enc_super', weight:5,
    when:p=>p.age>=22 && encHasPowers(p),
    body:p=>`This one didn't get their powers from an accident — they were *made*, in a facility, and they're coming apart because of it. They know it, too.`,
    choices:[
      {label:'Use what you know (medical)', sub:'if you understand the science', need:p=>p.stats.smarts>62 || p.job==='doctor', effect:p=>{ fx(p,{smarts:3,happy:4,stress:6}); setFlag(p,'helpedExperiment',true); markCat(p,'enc_super'); return `${p.first} actually understood what was happening to them — the unstable compound, the failing cells — and bought them time, maybe more. A rare thing, to meet the lab's work with knowledge instead of fear.`; }},
      {label:'Help however you can', sub:'+heart', effect:p=>{ fx(p,{happy:3,stress:8}); markCat(p,'enc_super'); return `${p.first} couldn't fix the science but didn't leave them alone in it. Sometimes that's the whole gift.`; }},
      {label:'Step back — it\'s beyond you', sub:'honest limits', effect:p=>{ fx(p,{stress:6,happy:-2}); markCat(p,'enc_super'); return `${p.first} knew ${p.first} was out of depth and said so. They drifted off into the strange, unresolvable rest of their story.`; }},
    ]},

  // ---------- The Retired Hero ----------
  { id:'xe_retiredhero', emoji:'🎖', title:'Powerful once', once:true, track:'world', cat:'enc_super', weight:5,
    when:p=>p.age>=28 && encHasPowers(p),
    body:p=>`Old now, quiet now, living small — but ${p.first} can tell what they used to be. There's a weight to them, and an offer in the air.`,
    choices:[
      {label:'Ask for training', sub:'sharpen a power', effect:p=>{ const pw=p.powers[rnd(p.powers.length)]; setFlag(p,'powerTrained',pw); fx(p,{smarts:3,athletic:2,happy:3}); markCat(p,'enc_super'); return `They drilled ${p.first} for weeks on ${pw} until ${p.first} wielded it like an extension of thought. The old ones know things the young can't teach themselves.`; }},
      {label:'Ask what\'s coming', sub:'a warning', effect:p=>{ setFlag(p,'heroWarning',true); fx(p,{smarts:3,stress:5}); markCat(p,'enc_super'); return `They told ${p.first} something — vague, heavy, about what gathers on the horizon for people like them. ${p.first} didn't fully understand it. ${p.first} didn't forget it either.`; }},
      {label:'Just sit with them', sub:'see your future', effect:p=>{ fx(p,{smarts:2,happy:2,stress:3}); markCat(p,'enc_super'); return `${p.first} spent an afternoon looking at what ${p.first} might one day become: quiet, retired, holding a lifetime of impossible things. Sobering. Maybe comforting.`; }},
    ]},

  // ---------- The Government Asset ----------
  { id:'xe_govasset', emoji:'🕴', title:'They\'re not supposed to be visible', once:true, track:'world', cat:'enc_super', weight:5,
    when:p=>p.age>=25 && encHasPowers(p),
    body:p=>`${p.first} sees someone ${p.first} clearly wasn't meant to see — classified, off-books, the kind of powered asset that officially doesn't exist. They clock that ${p.first} clocked them.`,
    choices:[
      {label:'Stay quiet when the contact comes', sub:'don\'t make waves', effect:p=>{ fx(p,{smarts:2,stress:4}); markCat(p,'enc_super'); return `Within the year a polite, forgettable person reached out. ${p.first} said nothing, knew nothing, saw nothing. They went away satisfied. Probably.`; }},
      {label:'Cooperate', sub:'open a door', effect:p=>{ setFlag(p,'govContact',true); fx(p,{stress:5,money:5000+rnd(10000)}); markCat(p,'enc_super'); return `${p.first} played ball with the agency. It opened a door — to what, ${p.first} would find out later, for better or worse.`; }},
      {label:'Leverage it', sub:'risky power play', effect:p=>{ if(chance(50)){ setFlag(p,'govLeverage',true); fx(p,{smarts:3,fame:2,stress:8}); markCat(p,'enc_super'); return `${p.first} made it known ${p.first} could make this inconvenient — and got something for ${p.first}'s discretion. Dangerous game, well played.`;} fx(p,{stress:14,happy:-6}); markCat(p,'enc_super'); return `${p.first} tried to leverage people who do not get leveraged. The warning ${p.first} received was quiet, specific, and deeply unsettling.`; }},
    ]},

];

CHOICE_EVENTS.push(...EXP_ENCOUNTERS);
