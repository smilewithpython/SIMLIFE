"use strict";
/* Threadbare · content module: 38-relationship-events.js — RELATIONSHIPS PART 5
   ============================================================
   New relationship events: friend, sibling, parenting, and partner.
   Delivered as interactive choice-events on the Life track so they surface
   organically through the four-track picker (same system as the expanded
   events). Bond changes route through the module-36 helpers (applyBond /
   damageBond / repairBond) so they respect decay, floors/caps and the
   repaired-bond system. Each carries a `cat` so the cooldown spaces them out.
   ============================================================ */

// ---- local finders (lean, prefixed rl* to avoid collisions) ----
function rlLiving(p, re){ return (p.rels||[]).filter(r=>r.alive && re.test(r.kind)); }
function rlFirst(r){ return r? r.name.split(' ')[0] : 'someone'; }
function rlCloseFriend(p){ const fs=rlLiving(p,/Friend/).filter(r=>r.bond>=55); return fs.length?fs.sort((a,b)=>b.bond-a.bond)[0]:null; }
function rlAnyFriend(p){ const fs=rlLiving(p,/Friend/); return fs.length?fs.sort((a,b)=>b.bond-a.bond)[0]:null; }
function rlSibling(p){ const s=rlLiving(p,/Brother|Sister|Sibling/); return s.length?s[rnd(s.length)]:null; }
function rlYoungChild(p){ const cs=rlLiving(p,/Child/).map(r=>({r,kid:findP(G,r.id)})).filter(o=>o.kid&&o.kid.age>=13&&o.kid.age<=19); return cs.length?cs[rnd(cs.length)]:null; }
function rlTeenChild(p, lo, hi){ const cs=rlLiving(p,/Child/).map(r=>({r,kid:findP(G,r.id)})).filter(o=>o.kid&&o.kid.age>=lo&&o.kid.age<=hi); return cs.length?cs[rnd(cs.length)]:null; }
function rlSpouse(p){ const s=rlLiving(p,/Spouse|Partner/); return s.length?s[0]:null; }
// safe bond apply that works even if module 36 isn't present (defensive)
function rlBond(r, d){ if(typeof applyBond==='function') applyBond(r,d); else if(r) r.bond=clamp((r.bond||0)+d); }
function rlDamage(r, key, opts){ if(typeof damageBond==='function') damageBond(r,key,opts||{}); else rlBond(r,-(opts&&opts.amt||20)); }
function rlRepair(r, g){ if(typeof repairBond==='function') repairBond(r,g); else rlBond(r,g||15); }
function rlMark(r, act){ if(typeof markInteract==='function') markInteract(r, act); }

const REL_EVENTS = [

  /* ================= FRIEND EVENTS ================= */

  // Friend's Big News [SINGLE]
  { id:'rl_friend_news', emoji:'📰', title:"A friend's big news", once:true, track:'life', cat:'rl_friend', weight:5,
    when:p=>p.age>=25 && p.age<=45 && !!rlCloseFriend(p),
    body:p=>{ const f=rlCloseFriend(p); const news=pick(['getting married','getting divorced','landed the job of their life','moving across the country','facing a serious health diagnosis']); setFlag(p,'_friendNews',news); setFlag(p,'_friendNewsId',f.id); return `${rlFirst(f)} calls, voice tight with something big: they're ${news}.`; },
    choices:[
      {label:'Drop everything and be present', sub:'show up fully', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._friendNewsId)||rlCloseFriend(p); const news=p.flags._friendNews||''; if(f){ rlBond(f, 12); rlMark(f,'news'); if(/moving/.test(news)) f._longDistance=true; } fx(p,{happy:3,stress:3}); markCat(p,'rl_friend'); return `${p.first} showed up the way real friends do — no agenda, just there. ${f?rlFirst(f):'They'} won't forget it.${/moving/.test(news)?' The distance will test things now.':''}`; }},
      {label:'Offer support from a distance', sub:'a text, a card', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._friendNewsId)||rlCloseFriend(p); if(f){ rlBond(f, 3); } markCat(p,'rl_friend'); return `${p.first} sent something kind but kept a distance. It registered — as exactly that much and no more.`; }},
      {label:'Make it about your own life', sub:'deflect', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._friendNewsId)||rlCloseFriend(p); if(f){ rlBond(f, -8); } fx(p,{happy:-2}); markCat(p,'rl_friend'); return `${p.first} somehow turned ${f?rlFirst(f):'their friend'}'s big news into a story about ${p.first}. ${f?rlFirst(f):'They'} noticed, and went quieter after.`; }},
    ]},

  // Friend Going Through Divorce [CHAIN-SHORT]
  { id:'rl_friend_divorce', emoji:'💔', title:"A friend's marriage is ending", once:true, track:'life', cat:'rl_friend', weight:5,
    when:p=>p.age>=30 && p.age<=50 && !!rlCloseFriend(p),
    body:p=>{ const f=rlCloseFriend(p); setFlag(p,'_fdId',f.id); return `${rlFirst(f)}'s marriage is falling apart, and they've shown up at ${p.first}'s door needing... something. A friend, mostly.`; },
    choices:[
      {label:'Be fully present for them', sub:'the long haul', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fdId)||rlCloseFriend(p); if(f){ rlBond(f, 16); rlMark(f,'divorce'); setFlag(p,'stoodByFriend'); } fx(p,{stress:6,happy:2}); markCat(p,'rl_friend'); return `${p.first} sat with ${f?rlFirst(f):'them'} through the worst of it, week after week. It cost time and energy. It's also the kind of thing friendships are weighed by.`; }},
      {label:'Offer surface support', sub:'sympathy, then back to life', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fdId)||rlCloseFriend(p); if(f){ rlBond(f, 4); } markCat(p,'rl_friend'); return `${p.first} said the right things and then got on with the week. Fine. Not nothing. Not everything either.`; }},
      {label:'Make it about your own marriage', sub:'relate it back', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fdId)||rlCloseFriend(p); if(f){ rlBond(f, -4); } markCat(p,'rl_friend'); return `${p.first} kept comparing it to their own life. ${f?rlFirst(f):'Their friend'} didn't need a mirror right then. They needed an ear.`; }},
      {label:'Give unsolicited advice', sub:'tell them what to do', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fdId)||rlCloseFriend(p); if(f){ rlBond(f, -2); } markCat(p,'rl_friend'); return `${p.first} told ${f?rlFirst(f):'them'} exactly what they should do. It wasn't what they came for, and it landed flat.`; }},
    ]},

  // Friend in a Bad Relationship [CHAIN-SHORT]
  { id:'rl_friend_badrel', emoji:'🚩', title:"A friend's bad relationship", once:true, track:'life', cat:'rl_friend', weight:5,
    when:p=>p.age>=22 && p.age<=40 && !!rlCloseFriend(p),
    body:p=>{ const f=rlCloseFriend(p); setFlag(p,'_fbId',f.id); return `${p.first} can see it plainly: ${rlFirst(f)}'s partner isn't good for them. ${rlFirst(f)} hasn't asked what ${p.first} thinks.`; },
    choices:[
      {label:'Say something directly', sub:'risky honesty', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fbId)||rlCloseFriend(p); if(chance(45)){ if(f){ rlBond(f, 14); setFlag(p,'_toldFriendTruth'); } markCat(p,'rl_friend'); return `${p.first} said the hard thing, and ${f?rlFirst(f):'they'} actually heard it. A deeper trust, bought with a risk.`; } if(f){ rlDamage(f,'betrayedConfidence',{amt:14}); } markCat(p,'rl_friend'); return `${p.first} said it and ${f?rlFirst(f):'they'} got defensive — nobody wants to hear it before they're ready. A chill set in.`; }},
      {label:'Say something carefully', sub:'gentle, hedged', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fbId)||rlCloseFriend(p); if(f){ rlBond(f, 3); } markCat(p,'rl_friend'); return `${p.first} floated a careful worry, soft enough to deny later. Less risk, less impact. ${f?rlFirst(f):'They'} half-heard it.`; }},
      {label:'Wait until they ask', sub:'be ready', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fbId)||rlCloseFriend(p); setFlag(p,'_waitedForFriend'); markCat(p,'rl_friend'); return `${p.first} held their tongue and stayed close, ready for the day ${f?rlFirst(f):'they'} might ask. If that day comes, "I've been worried for a while" will mean a lot.`; }},
      {label:'Stay out of it', sub:'not your business', effect:p=>{ markCat(p,'rl_friend'); return `${p.first} decided it wasn't theirs to touch. Clean hands. If it goes badly, though, there'll be a small private weight of having seen it coming.`; }},
    ]},

  // Friend's Mental Health [CHAIN-SHORT]
  { id:'rl_friend_mental', emoji:'🕯', title:'Something is wrong with a friend', once:true, track:'life', cat:'rl_friend', weight:5,
    when:p=>p.age>=28 && p.age<=45 && !!rlAnyFriend(p),
    body:p=>{ const f=rlAnyFriend(p); setFlag(p,'_fmId',f.id); return `The signs are there if ${p.first} is paying attention — ${rlFirst(f)} has gone quiet, cancelled twice, laughs a half-beat late. They haven't said anything directly.`; },
    choices:[
      {label:'Notice, and reach out', sub:'+bond, better outcome', need:p=>p.stats.smarts>45, effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fmId)||rlAnyFriend(p); if(f){ rlBond(f, 14); rlMark(f,'reachout'); setFlag(p,'goodHeart'); } fx(p,{happy:2,stress:3}); markCat(p,'rl_friend'); return `${p.first} saw it, and reached out before being asked. Sometimes that's the whole difference. ${f?rlFirst(f):'They'} let ${p.first} in.`; }},
      {label:'Reach out anyway, unsure', sub:'might be nothing', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fmId)||rlAnyFriend(p); if(f){ rlBond(f, 10); rlMark(f,'reachout'); } markCat(p,'rl_friend'); return `${p.first} wasn't certain, but asked anyway — "you okay, really?" It turned out to matter.`; }},
      {label:"Notice but don't act", sub:'tell yourself it is fine', effect:p=>{ const f=(p.rels||[]).find(r=>r.id===p.flags._fmId)||rlAnyFriend(p); setFlag(p,'_missedFriendSignals'); markCat(p,'rl_friend'); return `${p.first} saw it and let it slide — too busy, too unsure, too something. If ${f?rlFirst(f):'they'} learns ${p.first} noticed and said nothing, that'll sting.`; }},
    ]},

  // Old Friend Returns [CHAIN-SHORT]
  { id:'rl_oldfriend', emoji:'📞', title:'An old friend resurfaces', once:true, track:'life', cat:'rl_friend', weight:4,
    when:p=>p.age>=35 && p.age<=50 && (hasFlag(p,'campFriend')||hasFlag(p,'childhoodFriend')||hasFlag(p,'goodHeart')),
    body:p=>`Out of nowhere, someone from ${p.first}'s childhood gets back in touch after twenty years. The name lands with a jolt of memory.`,
    choices:[
      {label:'Reconnect warmly', sub:'open the door', effect:p=>{ if(chance(55)){ const f=addFriend(p,'Friend'); f.bond=62; if(typeof relMeta==='function') relMeta(f).firstYear=G.year-20; fx(p,{happy:6}); markCat(p,'rl_friend'); return `${p.first} and the old friend picked up a thread twenty years frayed — and found it still held. A real friendship, reborn.`; } fx(p,{happy:2}); markCat(p,'rl_friend'); return `${p.first} reached back warmly, but the years had changed them both too much. A friendly closure: you've moved on, and that's okay.`; }},
      {label:'Reconnect cautiously', sub:'keep it light', effect:p=>{ fx(p,{happy:2}); markCat(p,'rl_friend'); return `${p.first} caught up over one careful coffee. Pleasant, contained — a once-a-year-card kind of thing now. Some friendships fit best at that size.`; }},
      {label:'Let it go', sub:'decline gently', effect:p=>{ markCat(p,'rl_friend'); return `${p.first} let the message sit, then fade. Whoever they'd been to each other belonged to a finished chapter, and ${p.first} chose to leave it closed.`; }},
    ]},

  /* ================= SIBLING EVENTS ================= */

  // Sibling Outpaces You [SINGLE]
  { id:'rl_sib_outpace', emoji:'🏆', title:'Your sibling outpaces you', once:true, track:'life', cat:'rl_sibling', weight:5,
    when:p=>p.age>=28 && p.age<=42 && !!rlSibling(p),
    body:p=>{ const s=rlSibling(p); setFlag(p,'_soId',s.id); return `${rlFirst(s)} just achieved something big — bigger than anything ${p.first} has. The feeling that rises up is not the simple one.`; },
    choices:[
      {label:'Genuine pride', sub:'be happy for them', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._soId)||rlSibling(p); if(s){ rlBond(s, 10); } setFlag(p,'modeledGrace'); fx(p,{happy:3}); markCat(p,'rl_sibling'); return `${p.first} felt the pride clean and whole, and said so. Your kids learn how to handle this from watching you. ${p.first} just taught them well.`; }},
      {label:'Complicated feelings, managed', sub:'human, handled', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._soId)||rlSibling(p); if(s){ rlBond(s, 4); } fx(p,{stress:4}); markCat(p,'rl_sibling'); return `${p.first} felt the tangle of it — pride knotted with envy — and chose to act on the better thread. That's most of maturity, right there.`; }},
      {label:"Jealousy you don't manage", sub:'let it show', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._soId)||rlSibling(p); if(s){ rlBond(s, -10); } setFlag(p,'modeledEnvy'); fx(p,{happy:-4,stress:6}); markCat(p,'rl_sibling'); return `${p.first} couldn't keep it off their face, out of their voice. ${s?rlFirst(s):'Their sibling'} felt the chill on what should've been their best day.`; }},
      {label:'Indifference', sub:'pretend not to care', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._soId)||rlSibling(p); if(s){ rlBond(s, -4); } markCat(p,'rl_sibling'); return `${p.first} shrugged it off a little too hard. The not-caring was its own kind of message, and ${s?rlFirst(s):'they'} received it.`; }},
    ]},

  // Sibling Asks for Money [CHAIN-SHORT]
  { id:'rl_sib_money', emoji:'💵', title:'Your sibling needs money', once:true, track:'life', cat:'rl_sibling', weight:5,
    when:p=>p.age>=30 && p.age<=55 && p.money>20000 && !!rlSibling(p),
    body:p=>{ const s=rlSibling(p); setFlag(p,'_smId',s.id); return `${rlFirst(s)} asks ${p.first} for a loan — and it's not a small one. There's pride and fear both in how they ask.`; },
    choices:[
      {label:'Give it', sub:'family is family', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._smId)||rlSibling(p); const amt=Math.min(p.money,8000+rnd(20000)); p.money-=amt; if(s){ rlBond(s, 10); } setFlag(p,'_lentSibling'); markCat(p,'rl_sibling'); return `${p.first} wrote the check, ${money(amt)}, no lecture attached. ${s?rlFirst(s):'They'} were flooded with relief. Whether it comes back is a question for later.`; }},
      {label:'Decline', sub:'protect yourself', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._smId)||rlSibling(p); if(s){ rlBond(s, -14); } fx(p,{stress:5}); markCat(p,'rl_sibling'); return `${p.first} said no. ${s?rlFirst(s):'They'} were hurt in that specific family way that can harden into something longer if it isn't tended.`; }},
      {label:'Give a smaller amount', sub:'meet halfway', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._smId)||rlSibling(p); const amt=Math.min(p.money,2000+rnd(4000)); p.money-=amt; if(s){ rlBond(s, 2); } markCat(p,'rl_sibling'); return `${p.first} gave what they were comfortable giving — ${money(amt)}, not the full ask. Neither a rescue nor a refusal. ${s?rlFirst(s):'They'} took it with mixed feelings.`; }},
    ]},

  // Sibling Health Crisis [CHAIN-LONG]
  { id:'rl_sib_health', emoji:'🏥', title:'Your sibling is seriously ill', once:true, track:'life', cat:'rl_sibling', weight:5,
    when:p=>p.age>=40 && p.age<=60 && !!rlSibling(p),
    body:p=>{ const s=rlSibling(p); setFlag(p,'_shId',s.id); return `The call comes the way these calls do — sudden, flat, impossible. ${rlFirst(s)} is gravely ill.`; },
    choices:[
      {label:'Drop everything', sub:'be there, whatever it costs', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._shId)||rlSibling(p); if(s){ rlBond(s, 18); rlMark(s,'crisis'); } fx(p,{stress:12,happy:-4}); setFlag(p,'_droppedAllForSib'); markCat(p,'rl_sibling'); return `${p.first} put their whole life on hold and went. Whatever happens next, ${s?rlFirst(s):'they'} won't face it alone — and the bond forged in that room runs deeper than blood usually manages.`; }},
      {label:'Manage from a distance', sub:'help, but keep your life', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._shId)||rlSibling(p); if(s){ rlBond(s, 6); } fx(p,{stress:8}); markCat(p,'rl_sibling'); return `${p.first} did what they could from where they were — calls, money, logistics. Real help, at arm's length. ${s?rlFirst(s):'They'} understood. Mostly.`; }},
      {label:'Wait and see', sub:'maybe it resolves', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._shId)||rlSibling(p); if(s){ rlBond(s, -8); } fx(p,{stress:6}); markCat(p,'rl_sibling'); return `${p.first} held back, hoping it'd resolve without upending everything. It might. But absence during a crisis is a thing that gets remembered.`; }},
    ]},

  /* ================= PARENTING EVENTS ================= */

  // Child Comes Out [SINGLE]
  { id:'rl_child_comesout', emoji:'🌈', title:'Your child tells you who they are', once:true, track:'life', cat:'rl_parent', weight:6,
    when:p=>!!rlTeenChild(p,13,19),
    body:p=>{ const o=rlTeenChild(p,13,19); setFlag(p,'_coId',o.r.id); return `${rlFirst(o.r)} sits ${p.first} down, nervous in a way ${p.first} hasn't seen before, and tells them something true about who they are.`; },
    choices:[
      {label:'Full acceptance', sub:'no hesitation', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._coId); if(r){ rlBond(r, 20); rlMark(r,'cameout'); setFlag(r,'_fullyAccepted'); } fx(p,{happy:4}); markCat(p,'rl_parent'); return `${p.first} pulled ${r?rlFirst(r):'them'} into a hug before they'd finished the sentence. "I love you. Nothing changes." Some moments define a whole relationship. This was one, in the best way.`; }},
      {label:'Acceptance, working through awkwardness', sub:'love first, learning after', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._coId); if(r){ rlBond(r, 10); rlMark(r,'cameout'); } markCat(p,'rl_parent'); return `${p.first} fumbled the words but got the important part right: love, first and clearly. The rest they'd figure out together. ${r?rlFirst(r):'The kid'} could tell ${p.first} was trying, and that mattered.`; }},
      {label:'A complicated response', sub:'needs repair', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._coId); if(r){ rlDamage(r,'unforgivable',{amt:15}); } fx(p,{stress:8}); markCat(p,'rl_parent'); return `${p.first} didn't handle it well — said something, or didn't say enough, and ${r?rlFirst(r):'the kid'}'s face closed. There's a repair to be made here, and the clock on it starts now.`; }},
    ]},

  // Child's First Heartbreak [SINGLE]
  { id:'rl_child_heartbreak', emoji:'💔', title:"Your child's first heartbreak", once:true, track:'life', cat:'rl_parent', weight:5,
    when:p=>!!rlTeenChild(p,14,18),
    body:p=>{ const o=rlTeenChild(p,14,18); setFlag(p,'_hbId',o.r.id); return `${rlFirst(o.r)} is devastated — first-love, end-of-the-world devastated. ${p.first} has been exactly here, a lifetime ago.`; },
    choices:[
      {label:'Comfort without advice', sub:'just be there', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._hbId); if(r){ rlBond(r, 10); rlMark(r,'comfort'); } markCat(p,'rl_parent'); return `${p.first} didn't try to fix it — just sat in it with ${r?rlFirst(r):'them'}, made the tea, let them be wrecked. Exactly the right thing.`; }},
      {label:'Share your own first heartbreak', sub:'rare and powerful', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._hbId); if(r){ rlBond(r, 12); rlMark(r,'comfort'); } fx(p,{happy:2}); markCat(p,'rl_parent'); return `${p.first} told ${r?rlFirst(r):'them'} about their own first heartbreak, all these years on. ${r?rlFirst(r):'The kid'} saw a person who'd survived this exact pain — and that was its own kind of hope.`; }},
      {label:'Give advice', sub:'mixed results', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._hbId); if(r){ rlBond(r, p.stats.smarts>65?6:3); } markCat(p,'rl_parent'); return `${p.first} offered counsel. ${p.stats.smarts>65?'Some of it even landed.':'Mostly it bounced off — advice isn\'t what a broken heart needs.'}`; }},
      {label:"Tell them they'll get over it", sub:'technically true', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._hbId); if(r){ rlBond(r, 2); setFlag(r,'_feltDismissed'); } markCat(p,'rl_parent'); return `${p.first} told ${r?rlFirst(r):'them'} they'd get over it. True. It also felt, to a heartbroken kid, like being waved off. A small distance opened.`; }},
    ]},

  // Child Fails at Something Important [SINGLE]
  { id:'rl_child_fails', emoji:'📉', title:'Your child fails at something they cared about', once:true, track:'life', cat:'rl_parent', weight:5,
    when:p=>!!rlTeenChild(p,10,17),
    body:p=>{ const o=rlTeenChild(p,10,17); setFlag(p,'_cfId',o.r.id); return `${rlFirst(o.r)} tried hard at something that mattered — and it didn't work out. How ${p.first} responds now will quietly shape how they meet failure for the rest of their life.`; },
    choices:[
      {label:'"I\'m proud of how you tried"', sub:'+resilience seed', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._cfId); const kid=r?findP(G,r.id):null; if(r){ rlBond(r, 10); } if(kid) setFlag(kid,'resilientSeed'); markCat(p,'rl_parent'); return `${p.first} made sure ${r?rlFirst(r):'they'} knew the effort was the point, not the outcome. A kid who hears that learns failure is survivable — a gift that pays out for decades.`; }},
      {label:'Help them analyze what went wrong', sub:'+a thinking seed', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._cfId); const kid=r?findP(G,r.id):null; if(r){ rlBond(r, 8); } if(kid){ kid.stats.smarts=clamp(kid.stats.smarts+1); } markCat(p,'rl_parent'); return `${p.first} sat with ${r?rlFirst(r):'them'} and broke down what happened, calmly. They learned that failure has information in it, if you can stand to look.`; }},
      {label:'"Try harder next time"', sub:'pressure risk', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._cfId); const kid=r?findP(G,r.id):null; if(r){ rlBond(r, 3); } if(kid) setFlag(kid,'_perfAnxiety'); markCat(p,'rl_parent'); return `${p.first} pushed them toward doing better next time. Well-meant. But ${r?rlFirst(r):'the kid'} heard "you weren't enough," and a little knot of performance-anxiety tied itself.`; }},
      {label:'Say nothing meaningful', sub:'missed moment', effect:p=>{ markCat(p,'rl_parent'); return `${p.first} let the moment pass with a distracted "that's too bad." A door that was open for a second, closed. They'll both forget this conversation. That's sort of the problem.`; }},
    ]},

  // Empty Nest [CHAIN-SHORT]
  { id:'rl_empty_nest', emoji:'🏠', title:'The last one leaves home', once:true, track:'life', cat:'rl_parent', weight:5,
    when:p=>p.age>=44 && rlLiving(p,/Child/).length>0 && rlLiving(p,/Child/).every(r=>{ const k=findP(G,r.id); return !k || k.age>=18; }),
    body:p=>`The house is suddenly, ringingly quiet. The last kid is gone, and ${p.first}${rlSpouse(p)?' and '+rlFirst(rlSpouse(p)):''} are looking at each other across a space that used to be full.`,
    choices:[
      {label:'Reconnect with your partner', sub:'fill it with each other', need:p=>!!rlSpouse(p), effect:p=>{ const s=rlSpouse(p); if(s){ rlBond(s, 14); rlMark(s,'emptynest'); setFlag(p,'reconnectedEmptyNest'); } fx(p,{happy:6}); markCat(p,'rl_parent'); return `${p.first} and ${s?rlFirst(s):'their partner'} used the quiet to find each other again. The marriage that comes out of an empty nest pointed inward is stronger for the rest of the road.`; }},
      {label:'Throw yourself into your own things', sub:'separate lives', effect:p=>{ const s=rlSpouse(p); if(s){ rlBond(s, -4); } fx(p,{happy:3,stress:3}); markCat(p,'rl_parent'); return `${p.first} filled the space with projects, work, friends — good things, mostly. ${s?'But '+rlFirst(s)+' filled theirs separately, and the two lives drifted a few degrees apart.':'A full life, lived a little solo.'}`; }},
      {label:'Sit with the loss a while', sub:'let it be sad', effect:p=>{ fx(p,{happy:-3,stress:4}); markCat(p,'rl_parent'); return `${p.first} let the quiet be as sad as it was. The kids were supposed to leave — that was the whole job — but knowing it and feeling it are different rooms.`; }},
    ]},

  // Child Surpasses You [SINGLE]
  { id:'rl_child_surpass', emoji:'🌟', title:'Your child goes further than you did', once:true, track:'life', cat:'rl_parent', weight:5,
    when:p=>{ const cs=rlLiving(p,/Child/).map(r=>findP(G,r.id)).filter(k=>k&&k.age>=24); return cs.some(k=>(k.stats.fame>(p.stats.fame+20))||(k.job!=='none'&&p.job==='none')); },
    body:p=>{ const cs=rlLiving(p,/Child/).map(r=>({r,k:findP(G,r.id)})).filter(o=>o.k&&o.k.age>=24); const o=cs.sort((a,b)=>(b.k.stats.fame)-(a.k.stats.fame))[0]; setFlag(p,'_csId',o.r.id); return `${rlFirst(o.r)} has gone further than ${p.first} ever did. There's a complicated joy in being passed by someone you made.`; },
    choices:[
      {label:'Pure pride', sub:'the clean response', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._csId); if(r){ rlBond(r, 8); } fx(p,{happy:5}); markCat(p,'rl_parent'); return `${p.first} felt nothing but pride, full and uncomplicated. To be surpassed by your own child is the entire point of the exercise. ${p.first} knew it, and glowed.`; }},
      {label:"Pride, and the thing you won't say", sub:'honest complexity', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._csId); if(r){ rlBond(r, 10); } fx(p,{happy:3}); markCat(p,'rl_parent'); return `${p.first} beamed and meant it — and underneath, a quiet, unspoken thing: a wish that their own road had run this far. ${p.first} never said it. ${p.first} just hugged ${r?rlFirst(r):'them'} tighter.`; }},
      {label:'Competitive response', sub:'they feel it', effect:p=>{ const r=(p.rels||[]).find(x=>x.id===p.flags._csId); if(r){ rlBond(r, -5); } markCat(p,'rl_parent'); return `${p.first} couldn't quite let it be theirs — a comparison here, a "when I was your age" there. ${r?rlFirst(r):'The kid'} felt the competition in it and deflated a little.`; }},
    ]},

  /* ================= PARTNER EVENTS ================= */

  // The Recurring Argument [CHAIN-LONG]
  { id:'rl_recurring_arg', emoji:'🔁', title:'The argument that keeps coming back', once:true, track:'life', cat:'rl_partner', weight:5,
    when:p=>p.age>=30 && p.age<=50 && !!rlSpouse(p),
    body:p=>{ const s=rlSpouse(p); setFlag(p,'_raId',s.id); return `Every couple has one — the fight that returns wearing different clothes. ${p.first} and ${rlFirst(s)} just had it again.`; },
    choices:[
      {label:'Identify it together', sub:'name the pattern', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._raId)||rlSpouse(p); if(s){ rlBond(s, 10); rlMark(s,'arg'); setFlag(p,'namedTheArgument'); } markCat(p,'rl_partner'); return `${p.first} and ${s?rlFirst(s):'their partner'} stepped back and named the thing under the thing. The argument didn't vanish — but now it has a name, and naming it is most of taming it.`; }},
      {label:'Win the argument', sub:'short-term satisfaction', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._raId)||rlSpouse(p); if(s){ rlBond(s, -8); } fx(p,{happy:-2}); markCat(p,'rl_partner'); return `${p.first} won. Got the last word, the conceded point. And felt the specific hollowness of winning against someone you love. The fight will be back, a little meaner.`; }},
      {label:'Avoid it again', sub:'change the subject', effect:p=>{ markCat(p,'rl_partner'); return `${p.first} let it drop, again. The thing is still there, just under the surface, where it'll wait until next time. Nothing solved. Nothing worse, yet.`; }},
    ]},

  // The Career That Pulls [CHAIN-SHORT]
  { id:'rl_career_pulls', emoji:'💼', title:'Your career is pulling you away', once:true, track:'life', cat:'rl_partner', weight:5,
    when:p=>p.job!=='none' && (p.stress>55 || atDemandingCareerStage(p)) && !!rlSpouse(p),
    body:p=>{ const s=rlSpouse(p); setFlag(p,'_cpId',s.id); return `The job is eating ${p.first} alive — late nights, missed dinners, a mind always half-elsewhere. ${rlFirst(s)} has started to notice. And to mention it.`; },
    choices:[
      {label:'Acknowledge it and adjust', sub:'+bond, career slows', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._cpId)||rlSpouse(p); if(s){ rlBond(s, 8); rlMark(s,'career'); } p.stress=clamp(p.stress-10); setFlag(p,'choseBalance'); markCat(p,'rl_partner'); return `${p.first} heard it, and actually changed something — pulled back, drew a line. The career took a small hit. The marriage took a gift.`; }},
      {label:'Promise to make it up later', sub:'a promise on credit', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._cpId)||rlSpouse(p); setFlag(p,'_owesPartnerTime'); markCat(p,'rl_partner'); return `${p.first} promised it'd ease up soon, that they'd make it up. ${s?rlFirst(s):'Their partner'} wanted to believe it. The promise is real now — and promises like this come due.`; }},
      {label:'Say nothing, hope they understand', sub:'slow erosion', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._cpId)||rlSpouse(p); if(s){ rlBond(s, -6); } markCat(p,'rl_partner'); return `${p.first} kept pushing and said nothing, trusting ${s?rlFirst(s):'them'} to get it. Understanding has limits, though, and ${p.first} is quietly spending it down.`; }},
    ]},

  // Long-Term Partner Boredom [SINGLE]
  { id:'rl_partner_boredom', emoji:'😶', title:'The quiet middle of a marriage', once:true, track:'life', cat:'rl_partner', weight:4,
    when:p=>p.age>=40 && p.age<=55 && !!rlSpouse(p) && (rlSpouse(p).bond>=45),
    body:p=>{ const s=rlSpouse(p); setFlag(p,'_pbId',s.id); return `Nothing is wrong with ${p.first} and ${rlFirst(s)}. That's almost the problem. Everything is fine, and fine isn't what it used to feel like.`; },
    choices:[
      {label:'Name it and act on it', sub:'do something', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._pbId)||rlSpouse(p); if(s){ rlBond(s, 10); rlMark(s,'boredom'); } setFlag(p,'addressedDrift'); markCat(p,'rl_partner'); return `${p.first} said the awkward quiet thing out loud, and together they did something about it. Couples who face the quiet middle rarely end up in the affair that grows out of ignoring it.`; }},
      {label:'Add some novelty', sub:'shake it up', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._pbId)||rlSpouse(p); if(s){ rlBond(s, 7); rlMark(s,'boredom'); } setFlag(p,'addressedDrift'); fx(p,{happy:3}); markCat(p,'rl_partner'); return `${p.first} brought something new into the routine — a trip, a project, a change. Not a cure, but a real spark in the grey. It helped.`; }},
      {label:'Accept this is also love', sub:'the quiet is okay', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._pbId)||rlSpouse(p); if(s){ rlBond(s, 4); } fx(p,{happy:2}); markCat(p,'rl_partner'); return `${p.first} decided the quiet wasn't a failure — that comfort, after all these years, is its own deep form of love. There's wisdom in that. And peace.`; }},
      {label:'Mistake it for a problem to solve', sub:'restless risk', effect:p=>{ setFlag(p,'_unaddressedDrift'); fx(p,{stress:5}); markCat(p,'rl_partner'); return `${p.first} took the restlessness as a sign something was broken, and went looking for what. Sometimes that search finds trouble that wasn't there until you went hunting for it.`; }},
    ]},

  // The Missed Anniversary [SINGLE]
  { id:'rl_missed_anniv', emoji:'📅', title:'The anniversary', once:true, track:'life', cat:'rl_partner', weight:4,
    when:p=>p.age>=30 && !!rlSpouse(p) && (rlSpouse(p)._yearsTogether==null || true),
    body:p=>{ const s=rlSpouse(p); setFlag(p,'_maId',s.id); return `It's a big anniversary with ${rlFirst(s)} — and ${p.first} realizes, with a cold drop, that the day is here and nothing is planned.`; },
    choices:[
      {label:'Do it big, late', sub:'+bond, $$', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._maId)||rlSpouse(p); const c=Math.min(p.money,1000+rnd(4000)); p.money-=c; if(s){ rlBond(s, 8); rlMark(s,'anniv'); } fx(p,{happy:4}); markCat(p,'rl_partner'); return `${p.first} scrambled and made it spectacular anyway — a save so good ${s?rlFirst(s):'their partner'} never knew it was a save. Crisis into romance.`; }},
      {label:'Full acknowledgment, honest', sub:'own the slip', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._maId)||rlSpouse(p); if(s){ rlBond(s, 3); } markCat(p,'rl_partner'); return `${p.first} came clean — "I dropped the ball, and you deserve better, and let me make today count anyway." Honest beats perfect, often. ${s?rlFirst(s):'They'} appreciated it.`; }},
      {label:'A quick, late acknowledgment', sub:'minimal effort', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._maId)||rlSpouse(p); if(s){ rlBond(s, -5); } markCat(p,'rl_partner'); return `${p.first} muttered a belated "happy anniversary" and a vague promise to celebrate later. ${s?rlFirst(s):'Their partner'} smiled thinly. It registered as exactly the small effort it was.`; }},
      {label:'Let it pass entirely', sub:'forget it', effect:p=>{ const s=(p.rels||[]).find(r=>r.id===p.flags._maId)||rlSpouse(p); if(s){ rlBond(s, -12); } markCat(p,'rl_partner'); return `${p.first} let the whole day go by. ${s?rlFirst(s):'Their partner'} noticed. Of course they noticed. The silence around the date said more than ${p.first} meant it to.`; }},
    ]},

];

CHOICE_EVENTS.push(...REL_EVENTS);
