"use strict";
/* Threadbare · content module: 27-chains-powers.js — PART 5: POWER-SPECIFIC EVENTS
   Loads after the base bank + chain modules; pushes onto CHOICE_EVENTS.
   Fire only when the character holds the specific power. They are personal, not
   tactical: stat outcomes are roughly equal — the difference is who the character
   becomes. Tagged track:'world' so they surface as rare, weighted surprises.
   ============================================================ */

// power-event helpers (lean, local)
function pwSpouse(p){ return (p.rels||[]).find(r=>(r.kind==='Spouse'||r.kind==='Partner')&&r.alive) || null; }
function pwLivingParent(p){ return (p.rels||[]).find(r=>(r.kind==='Mother'||r.kind==='Father')&&r.alive) || null; }
function pwDeadLoved(p){ // a dead spouse or child — the emotional core of the time/heal events
  return (p.rels||[]).find(r=>(r.kind==='Spouse'||r.kind==='Child')&&!r.alive) || null; }
function pwName(r){ return r? r.name.split(' ')[0] : 'someone'; }
// bloodline-level once flags (survive across generations, unlike p.seenEvents)
function bloodOnce(k){ if(!G.echoFlags) G.echoFlags={}; return !G.echoFlags[k]; }
function bloodSet(k){ if(!G.echoFlags) G.echoFlags={}; G.echoFlags[k]=true; }

const CHAIN_EVENTS_P5 = [

  // ---------- TELEPATHY — What You Didn't Ask to Know ----------
  { id:'pw_tele_partner', emoji:'🧠', title:"What You Didn't Ask to Know", once:true, track:'world', weight:6,
    when:p=>hasPower(p,'telepathy') && p.age>=18 && !!pwSpouse(p),
    body:p=>{ const sp=pwSpouse(p); const heard=pick(['a fear they have never once said out loud','a small betrayal they have not acted on — yet','a tenderness toward you they have never found the words for','a resentment, quiet and old, with your name on it']); setFlag(p,'_pwHeard',heard); return `${p.first} wasn't trying to listen. But there it was, plain as speech in ${pwName(sp)}'s mind: ${heard}. The cost of the power is that you can't un-hear it.`; },
    choices:[
      {label:"Pretend you didn't hear it", sub:'protect the not-knowing', effect:p=>{ fx(p,{stress:8,happy:-2}); return `${p.first} folded it away and said nothing. Some things are kinder unspoken — and now ${p.first} carries them both, the secret and the silence.`; }},
      {label:'Act on it without explaining how', sub:'change things quietly', effect:p=>{ const sp=pwSpouse(p); if(sp)sp.bond=clamp(sp.bond+5); fx(p,{stress:6}); return `${p.first} moved to fix what they shouldn't have known was broken. ${pwName(sp)} felt cared for and couldn't say why. Love built on a thing you can't admit to.`; }},
      {label:'Tell them what you heard', sub:'honest, and dangerous', effect:p=>{ const sp=pwSpouse(p); if(chance(50)){ if(sp)sp.bond=clamp(sp.bond+8); fx(p,{happy:6,stress:4}); return `${p.first} confessed to the listening, and to what was heard. It was a hard night — but they came out the other side more honest than most couples ever get to be.`;} if(sp)sp.bond=clamp(sp.bond-14); fx(p,{happy:-8,stress:10}); return `${p.first} told the truth and ${pwName(sp)} couldn't forgive the violation of it. Knowing isn't the same as having the right to know.`; }},
      {label:'Carry it alone', sub:'the loneliest option', effect:p=>{ setFlag(p,'ch_carriesWeight',true); fx(p,{happy:-6,stress:10}); return `${p.first} said nothing, did nothing, and simply held it. This is what the power costs in the end — a lifetime of knowing more than anyone should, alone.`; }},
    ]},

  // ---------- TELEPATHY — The Dying Parent ----------
  { id:'pw_tele_dying', emoji:'🕯', title:'The Dying Parent', once:true, track:'world', weight:7,
    when:p=>hasPower(p,'telepathy') && p.age>=42 && !!pwLivingParent(p),
    body:p=>{ const par=pwLivingParent(p); return `Near the end, ${p.first} sits holding ${pwName(par)}'s hand — and can hear them. Not the labored breath, but underneath it, the mind still turning.`; },
    choices:[
      {label:'Stay, and listen', sub:'a moment you keep forever', effect:p=>{ const heard=pick([ 'a regret they never voiced, soft and decades old', 'love for you they never once knew how to say', 'only confusion and a child\'s fear of the dark', 'a deep, settled peace — they are not afraid' ]); const warm = /love|peace/.test(heard); fx(p, warm?{happy:4,stress:6}:{happy:-4,stress:10}); setFlag(p,'pw_carriedMoment',true); return `In their final hours ${p.first} heard ${heard}. There was nothing to do with it but witness. ${p.first} will carry that moment for the rest of their life.`; }},
    ]},

  // ---------- MIND CONTROL — The Temptation ----------
  { id:'pw_mind_tempt', emoji:'🌀', title:'The Temptation', once:true, track:'world', weight:6,
    when:p=>hasPower(p,'mind control') && (()=>{ const sp=pwSpouse(p); return sp && sp.bond<46; })(),
    body:p=>{ const sp=pwSpouse(p); return `Things with ${pwName(sp)} have gone cold and quiet. ${p.first} could fix it in a sentence — reach in and smooth the doubt away. The fix is right there. It would work.`; },
    choices:[
      {label:'Use it — make it right', sub:'it works, but it isn\'t real', effect:p=>{ const sp=pwSpouse(p); if(sp)sp.bond=clamp(sp.bond+30); setFlag(p,'pw_mindHollow',true); fx(p,{happy:2,stress:8}); return `${p.first} reached in and the warmth came back, instant and total. ${pwName(sp)} loves ${p.first} again. It isn't real, and ${p.first} is the only one who will ever know that — at every anniversary, every quiet morning, forever.`; }},
      {label:"Don't — let it be real or be nothing", sub:'the harder faith', effect:p=>{ const sp=pwSpouse(p); if(chance(55)){ if(sp)sp.bond=clamp(sp.bond+14); fx(p,{happy:8}); setFlag(p,'pw_choseReal',true); return `${p.first} kept their hands out of it, and slowly — on its own, the only way that counts — the warmth found its way back. ${p.first} knows it's real because they chose not to make it.`;} if(sp)sp.bond=clamp(sp.bond-6); fx(p,{happy:-4,stress:6}); setFlag(p,'pw_choseReal',true); return `${p.first} kept their hands out of it, and it didn't heal. The marriage cooled toward its end. But what was there was real, right up until it wasn't — and that has to be worth something.`; }},
    ]},

  // ---------- TIME MANIPULATION — The Accident (once per bloodline) ----------
  { id:'pw_time_rewind', emoji:'⏳', title:'Three Seconds', once:true, track:'world', weight:8,
    when:p=>hasPower(p,'time manipulation') && bloodOnce('timeRewound') && !!pwDeadLoved(p),
    body:p=>{ const r=pwDeadLoved(p); return `${pwName(r)} is gone — and ${p.first} has the one power that means gone might not be final. The window is three seconds, no more. Reach back, or let it close.`; },
    choices:[
      {label:'Rewind — pull them back', sub:'they live; the cost is yours', effect:p=>{ const r=pwDeadLoved(p); if(r){ r.alive=true; r.deathAge=undefined; } bloodSet('timeRewound'); fx(p,{health:-18,stress:20,happy:6}); setFlag(p,'pw_rewound',true); return `${p.first} tore the three seconds open and dragged ${pwName(r)} back through. They live — breathing, confused, alive. And ${p.first} is years older in a moment, hollowed out by it, the only person alive who remembers the world where they died.`; }},
      {label:"Don't — let it stand", sub:'live with the chance you had', effect:p=>{ bloodSet('timeRewound'); fx(p,{happy:-10,stress:14}); setFlag(p,'ch_carriesWeight',true); return `${p.first} let the window close. Maybe the fear of what changing it would cost; maybe a belief that some things are meant to stay broken. Either way ${p.first} will spend a lifetime knowing they could have, and didn't.`; }},
    ]},

  // ---------- LASER VISION — The Accident ----------
  { id:'pw_laser_accident', emoji:'⚡', title:'It Fired When You Didn\'t Mean It To', once:true, track:'world', weight:7,
    when:p=>hasPower(p,'laser vision') && p.age>=13 && p.age<=27 && (p.stress>40 || p.stats.happy<42),
    body:p=>`A bad moment, a spike of feeling, and ${p.first}'s eyes did the thing ${p.first} swore they'd never let happen — it fired. Someone is hurt now. Badly. It was no one's fault but ${p.first}'s, and ${p.first} is just a kid holding something that can kill.`,
    choices:[
      {label:'Cover it up', sub:'bury the truth', effect:p=>{ setFlag(p,'pw_laserGuilt',true); fx(p,{stress:14,happy:-6}); return `${p.first} hid what happened — the burns explained away, the truth buried. The person heals, mostly. The cover-up never quite does, and ${p.first} learns young what it is to carry something unspeakable.`; }},
      {label:'Come forward', sub:'face it honestly', effect:p=>{ setFlag(p,'pw_laserGuilt',true); fx(p,{happy:2,stress:10,fame:-3}); return `${p.first} admitted it — the power, the accident, all of it. The world doesn't quite know what to do with a teenager who can do that, and neither does ${p.first}. But the truth is out, and ${p.first} didn't run.`; }},
      {label:'Pay for it, without explaining how', sub:'quiet restitution', effect:p=>{ setFlag(p,'pw_laserGuilt',true); fx(p,{money:-(8000+rnd(20000)),stress:8}); return `${p.first} made it right the only way a kid can — covering the costs, the care, anonymously, never saying why. The debt is paid. The knowledge that ${p.first}'s body can hurt the innocent stays, and it changes how ${p.first} holds every power moment after.`; }},
    ]},

  // ---------- INVISIBILITY — What You Saw ----------
  { id:'pw_invis_saw', emoji:'👁', title:'What You Saw', once:true, track:'world', weight:6,
    when:p=>hasPower(p,'invisibility') && p.age>=18 && !!pwSpouse(p),
    body:p=>{ const sp=pwSpouse(p); const saw=pick([ 'nothing at all — they were just living, and the shame of having looked is yours alone', 'them struggling with something heavy, alone, that they never told you', 'them doing a thing they\'d have told you about eventually, in their own time', 'them doing a thing they would never, ever have told you' ]); setFlag(p,'_pwSaw',saw); return `${p.first} used it on ${pwName(sp)} — just to see, unseen. What ${p.first} saw: ${saw}. It can't be unseen now.`; },
    choices:[
      {label:'Tell them what you saw', sub:'confess the looking', effect:p=>{ const sp=pwSpouse(p); if(chance(45)){ if(sp)sp.bond=clamp(sp.bond+6); fx(p,{happy:4,stress:6}); return `${p.first} owned the spying and what it found. It cost them, but the air cleared. Some marriages can survive being seen all the way through.`;} if(sp)sp.bond=clamp(sp.bond-16); fx(p,{happy:-8,stress:10}); return `${p.first} confessed and ${pwName(sp)} couldn't forgive being watched without knowing. Trust, once it learns it can be invisible, is hard to rebuild.`; }},
      {label:'Use what you know', sub:'quietly act on it', effect:p=>{ fx(p,{stress:10,happy:-4}); setFlag(p,'pw_invisUsed',true); return `${p.first} let what they saw guide their hand without ever admitting the source. Power without accountability is its own slow poison, and ${p.first} just drank a little.`; }},
      {label:'Live with it silently', sub:'carry it alone', effect:p=>{ setFlag(p,'ch_carriesWeight',true); fx(p,{stress:8,happy:-3}); return `${p.first} put it away and said nothing. Whatever it was, it now lives only in ${p.first} — one more thing the power let them take without asking.`; }},
    ]},

  // ---------- HEALING (regeneration) — The One You Couldn't Save ----------
  { id:'pw_heal_limit', emoji:'🩹', title:"The One You Couldn't Save", once:true, track:'world', weight:6,
    when:p=>hasPower(p,'regeneration') && p.age>=40 && (!!pwDeadLoved(p) || (p.age>=52 && !!pwLivingParent(p))),
    body:p=>{ const r=pwDeadLoved(p)||pwLivingParent(p); return `${p.first}'s body knits itself whole from any wound — and someone ${p.first} loves, ${pwName(r)}, is dying of the one kind of thing it can't touch. Not a wound. The slow thing. The cells, the years, the heart simply wearing out.`; },
    choices:[
      {label:'Try anyway — give everything', sub:'and meet the limit', effect:p=>{ setFlag(p,'pw_healGrief',true); fx(p,{health:-8,stress:14,happy:-8}); return `${p.first} poured everything into them — every ounce of the power that has saved ${p.first} a hundred times. And it did nothing. ${p.first} can heal trauma, not mortality. The discovery of that limit is its own specific grief, and it settles in to stay. (A therapist, later, might help with this.)`; }},
    ]},

  // ---------- PRECOGNITION — Your Own Death ----------
  { id:'pw_precog_death', emoji:'🔮', title:'Your Own Death', once:true, track:'world', weight:7,
    when:p=>hasPower(p,'precognition') && p.age>=45 && p.age<=55 && bloodOnce('precogDeath'),
    body:p=>{ bloodSet('precogDeath'); return `It comes to ${p.first} not as a picture but as a fact, cold and certain: their own death. Not the how, not exactly when — just that it's coming, and it's not far off.`; },
    choices:[
      {label:'Try to change what leads there', sub:'the vision may be contingent', effect:p=>{ setFlag(p,'pw_precogFighting',true); fx(p,{stress:14,health:4}); return `${p.first} decided the future was a draft, not a verdict — and began, quietly and relentlessly, to rewrite the small things that might lead there. Whether a vision can be outrun, ${p.first} is about to find out.`; }},
      {label:'Accept it, and live differently', sub:'+intention, +weight', effect:p=>{ setFlag(p,'pw_precogAccepted',true); fx(p,{happy:8,stress:-6}); return `${p.first} stopped running from it and let it sharpen everything. Every choice from here carries more weight, every goodbye means more. There's a strange peace in knowing the shape of your own ending.`; }},
      {label:'Tell someone you love', sub:'share the weight', effect:p=>{ const sp=pwSpouse(p)||pwLivingParent(p); if(sp)sp.bond=clamp(sp.bond+10); fx(p,{happy:2,stress:4}); setFlag(p,'pw_precogTold',true); return `${p.first} told ${sp?pwName(sp):'the person closest to them'}. It was a terrible gift to hand someone — but ${p.first} didn't have to hold the future alone anymore.`; }},
      {label:'Tell no one', sub:'carry the knowing', effect:p=>{ setFlag(p,'pw_precogAccepted',true); setFlag(p,'ch_carriesWeight',true); fx(p,{stress:12,happy:-4}); return `${p.first} kept it sealed inside. The people around them noticed only that ${p.first} grew gentler, more present, a little far away — and never knew why.`; }},
    ]},

];

// fold Part 5 into the main pool (World track)
CHOICE_EVENTS.push(...CHAIN_EVENTS_P5);
