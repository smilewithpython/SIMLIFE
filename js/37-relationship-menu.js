"use strict";
/* Threadbare · content module: 37-relationship-menu.js
   ============================================================
   THE MORE MENU — activities by relationship type  (Part 3 of the spec)
   Reorganizes the flat peer-action list into Together / Talk / Support /
   Milestone categories, with named bond states, shared-interest bonuses,
   per-activity yearly cooldowns, and the support-energy budget.

   module 18's openPeerActions() delegates here (see the patch at the bottom).
   All bond changes route through applyBond/markInteract (module 36) so decay,
   floors/caps, and "tended this year" tracking stay consistent.
   ============================================================ */

// shared-interest bonus applied to "Together" activities
function togetherBonus(p, r){ return sharedInterests(p, r).length>0 ? 3 : 0; }

// defensive trait check (some synthetic/older person objects may lack traits[])
function hasCharm(p){ return !!(p.traits && p.traits.includes('charming')); }

// build one activity option that respects cooldown + interest bonus + logs nicely
// cfg: {emoji,label,sub,cat,base,cool(yrs),joy,cost,interest(bool),fn?,line(p,r,bonus)->str}
function relAct(p, r, cfg){
  const name=r.name.split(' ')[0];
  const onCool = cfg.cool && didRecently(r, cfg.id);
  const sub = onCool ? 'done recently — less impact' : cfg.sub;
  return O(cfg.emoji, cfg.label, sub, 0, ()=>{
    closeSheet();
    if(cfg.cost){ const c=Math.min(p.money, cfg.cost()); p.money-=c; }
    // diminishing return if repeated within a year
    const dim = onCool ? 0.4 : 1;
    const interestBonus = cfg.interest ? togetherBonus(p, r) : 0;
    const gain = Math.round((cfg.base + interestBonus) * dim);
    applyBond(r, gain);
    markInteract(r, cfg.id);
    if(cfg.joy) p.stats.happy=clamp(p.stats.happy + cfg.joy);
    if(cfg.effect) cfg.effect(p, r);
    // flavor: interest-enhanced line if a shared interest matched
    let line;
    if(cfg.interest && interestBonus>0 && cfg.lineShared) line=cfg.lineShared(p, r, name);
    else line = cfg.line ? cfg.line(p, r, name) : `${p.first} spent time with ${name}.`;
    const warm = relWarmthNote(r);
    log(line + (warm && chance(30)? ` ${warm}`:''), gain>0?'good':'muted');
    render();
  });
}

function relCategoryHeader(label){ return `<div style="font-size:10px;letter-spacing:1.6px;color:var(--gold);font-variant:small-caps;padding:10px 20px 4px">${label}</div>`; }

function openRelMenu(p, r){
  closeSheet();
  const name=r.name.split(' ')[0];
  const kid = r.id!=null ? findP(G, r.id) : null;
  const isRomance=/Spouse|Partner/.test(r.kind);
  const isChild=r.kind==='Child';
  const isAdultChild = isChild && kid && kid.age>=18;
  const isYoungChild = isChild && (!kid || kid.age<18);
  const isParent=/Mother|Father/.test(r.kind);
  const isSib=/Brother|Sister|Sibling/.test(r.kind);
  const isFriend=r.kind==='Friend';

  const shared = sharedInterests(p, r);
  const together=[], talk=[], support=[], milestone=[];

  /* ---------------- TOGETHER ---------------- */
  if(isRomance){
    together.push(relAct(p,r,{id:'cook',emoji:'🍳',label:'Cook dinner together',sub:'+bond, +joy',base:6,cool:1,joy:3,interest:true,
      line:(p,r,n)=>`${p.first} and ${n} made dinner together. Easy and warm.`,
      lineShared:(p,r,n)=>`${p.first} and ${n} cooked together and argued happily about the seasoning. Shared a kitchen and a laugh.`}));
    together.push(relAct(p,r,{id:'movie',emoji:'🎬',label:'Watch a movie',sub:'+bond',base:4,cool:1,joy:2,interest:true,
      line:(p,r,n)=>`${p.first} and ${n} curled up for a movie night.`}));
    together.push(relAct(p,r,{id:'event',emoji:'🎟',label:'Go to a live event',sub:'+bond, +joy',base:7,cool:1,joy:4,cost:()=>120+rnd(400),interest:true,
      effect:(p,r)=>{ if(p.stats.fame>50) p.stats.fame=clamp(p.stats.fame+1); },
      line:(p,r,n)=>`${p.first} and ${n} went out to a show. A night to remember.`}));
    together.push(relAct(p,r,{id:'weekend',emoji:'🧳',label:'Take a weekend away',sub:'+bond (high), $$',base:12,cool:1,joy:6,cost:()=>800+rnd(2500),
      effect:(p,r)=>{ if(r.bond<25 && chance(45)){ applyBond(r,-6); } },
      line:(p,r,n)=>`${p.first} and ${n} got away for a couple of days. ${r.bond<25?'It was a little tense — but they tried.':'Exactly what they needed.'}`}));
    together.push(relAct(p,r,{id:'hike',emoji:'🥾',label:'Exercise or hike together',sub:'+bond, +health',base:5,cool:1,joy:2,interest:true,
      effect:(p,r)=>{ p.stats.health=clamp(p.stats.health+2); },
      line:(p,r,n)=>`${p.first} and ${n} got moving together. Good for the body and the bond.`}));
    together.push(relAct(p,r,{id:'newthing',emoji:'🪩',label:'Try something new together',sub:'+bond',base:8,cool:1,joy:3,
      line:(p,r,n)=>`${p.first} and ${n} fumbled through a ${pick(['dance','cooking','pottery','painting'])} class. Being bad at it together was the fun part.`}));
    if((G.year - (relMeta(r).firstYear||G.year)) >= 10 || (r._yearsTogether||0)>=10){
      together.push(relAct(p,r,{id:'revisit',emoji:'📍',label:'Revisit where you met',sub:'+bond (10yr+)',base:10,cool:3,joy:5,
        line:(p,r,n)=>`${p.first} took ${n} back to where it all started. The years folded up small for an afternoon.`}));
    }
  }
  if(isYoungChild){
    const age = kid? kid.age : 8;
    if(age>=3&&age<=10) together.push(relAct(p,r,{id:'read',emoji:'📖',label:'Read together',sub:'+bond, +their smarts',base:8,cool:1,joy:2,interest:true,
      effect:(p,r)=>{ if(kid) kid.stats.smarts=clamp(kid.stats.smarts+2); },
      line:(p,r,n)=>`${p.first} read with ${n} until the words went soft. Small and perfect.`}));
    if(age>=5&&age<=17) together.push(relAct(p,r,{id:'sport',emoji:'⚽',label:'Play a sport or game',sub:'+bond',base:7,cool:1,joy:3,interest:true,
      effect:(p,r)=>{ if(kid) kid.stats.athletic=clamp(kid.stats.athletic+2); },
      line:(p,r,n)=>`${p.first} and ${n} ran around outside till dark.`}));
    if(age>=6&&age<=17) together.push(relAct(p,r,{id:'homework',emoji:'✏️',label:'Help with homework',sub:'+bond, +smarts',base:6,cool:1,
      effect:(p,r)=>{ if(kid){ const teach = p.stats.smarts>65?3:2; kid.stats.smarts=clamp(kid.stats.smarts+teach);} },
      line:(p,r,n)=>`${p.first} sat with ${n} over the homework. ${p.stats.smarts>65?'A real teaching moment landed.':'They got there together.'}`}));
    if(age>=8&&age<=16) together.push(relAct(p,r,{id:'teach',emoji:'🛠',label:'Teach them something you know',sub:'+bond, plants a skill',base:10,cool:2,
      effect:(p,r)=>{ if(kid){ kid._taughtBy=p.first; kid._taughtSkill = p.job!=='none'?p.job:(p.interests&&p.interests[0]); } },
      line:(p,r,n)=>`${p.first} passed something real on to ${n} — a skill that'll outlive the lesson.`}));
    together.push(relAct(p,r,{id:'attend',emoji:'🏆',label:'Go to their event',sub:'+bond, +their confidence',base:12,cool:1,joy:3,
      effect:(p,r)=>{ if(kid) setFlag(kid,'parentShowedUp'); },
      line:(p,r,n)=>`${p.first} was in the crowd for ${n}'s big moment. ${n} looked for that face and found it.`}));
    if(age>=9&&age<=16) together.push(relAct(p,r,{id:'stories',emoji:'📜',label:'Tell them family stories',sub:'+bond, bloodline echo',base:8,cool:2,
      effect:(p,r)=>{ if(kid) setFlag(kid,'knowsBloodline'); },
      line:(p,r,n)=>`${p.first} told ${n} where the family came from. The thread, handed down.`}));
    if(age>=16&&age<=17) together.push(relAct(p,r,{id:'drive',emoji:'🚗',label:'Teach them to drive',sub:'chain — nerve-wracking',base:8,cool:5,joy:2,
      effect:(p,r)=>{ if(kid) kid.stats.smarts=clamp(kid.stats.smarts+1); },
      line:(p,r,n)=>{ const o=pick(['white-knuckle','surprisingly calm','a near-disaster averted','a clean success']); return `${p.first} taught ${n} to drive — ${o}. They survived it together.`; }}));
  }
  if(isAdultChild){
    together.push(relAct(p,r,{id:'dinner',emoji:'🍽',label:'Have them over for dinner',sub:'+bond',base:8,cool:1,joy:3,interest:true,
      line:(p,r,n)=>`${n} came over for dinner. The house felt full again.`}));
    together.push(relAct(p,r,{id:'trip',emoji:'✈️',label:'Take a trip, just the two of you',sub:'+bond (high)',base:14,cool:2,joy:5,cost:()=>1000+rnd(3000),
      line:(p,r,n)=>`${p.first} and ${n} traveled together, parent and child as two adults now. Rare and precious.`}));
  }
  if(isParent){
    together.push(relAct(p,r,{id:'visit',emoji:'🏡',label:'Visit them',sub:'+bond',base:8,cool:1,joy:2,
      line:(p,r,n)=>`${p.first} spent the afternoon with ${n}. Nothing special. Everything important.`}));
    together.push(relAct(p,r,{id:'helphouse',emoji:'🔧',label:'Help around their house',sub:'+bond',base:7,cool:1,
      line:(p,r,n)=>`${p.first} fixed things around ${n}'s place. To a parent, that's love.`}));
    together.push(relAct(p,r,{id:'photos',emoji:'📷',label:'Look at old photos together',sub:'+bond, nostalgia',base:10,cool:3,joy:3,
      line:(p,r,n)=>`${p.first} and ${n} went through the old albums. Laughter, and a few quiet moments.`}));
  }
  if(isSib){
    together.push(relAct(p,r,{id:'out',emoji:'🍻',label:'Go out, just the two of you',sub:'+bond',base:8,cool:1,joy:3,interest:true,
      line:(p,r,n)=>`${p.first} and ${n} went out, no one else. The old shorthand came right back.`}));
    together.push(relAct(p,r,{id:'reminisce',emoji:'🕰',label:'Reminisce about childhood',sub:'+bond',base:10,cool:2,joy:2,
      line:(p,r,n)=>`${p.first} and ${n} dug up old stories — some funny, some complicated, all theirs.`}));
    together.push(relAct(p,r,{id:'tradition',emoji:'🎉',label:'Start a tradition',sub:'+bond, lasting',base:12,cool:3,joy:3,
      effect:(p,r)=>{ setFlag(p,'siblingTradition'); },
      line:(p,r,n)=>`${p.first} and ${n} started something they'd keep doing for years. A tradition is just love with a schedule.`}));
    together.push(relAct(p,r,{id:'travel',emoji:'✈️',label:'Travel together',sub:'+bond (high)',base:14,cool:2,joy:5,cost:()=>800+rnd(2500),interest:true,
      line:(p,r,n)=>`${p.first} and ${n} took a trip together. The kind of memory that holds a family.`}));
  }
  if(isFriend){
    together.push(relAct(p,r,{id:'drinks',emoji:'🍷',label:'Meet for dinner / drinks',sub:'+bond',base:6,cool:1,joy:3,interest:true,
      line:(p,r,n)=>`${p.first} and ${n} caught up over a long meal.`,
      lineShared:(p,r,n)=>`${p.first} and ${n} spent three hours arguing about ${pick(['the best album','that restaurant','the away game','the ending'])}. Neither backed down. Both loved it.`}));
    together.push(relAct(p,r,{id:'activity',emoji:'🎳',label:'Try an activity',sub:'+bond (novelty matters)',base:8,cool:2,joy:3,
      line:(p,r,n)=>`${p.first} and ${n} went ${pick(['bowling','golfing','to an escape room','to a cooking class'])}. Good, dumb fun.`}));
    together.push(relAct(p,r,{id:'ftravel',emoji:'🌍',label:'Travel together',sub:'+bond (high)',base:14,cool:3,joy:5,cost:()=>900+rnd(2500),interest:true,
      line:(p,r,n)=>`${p.first} and ${n} took a real trip. The kind of thing that seals a friendship for life.`}));
    if((G.year-(relMeta(r).firstYear||G.year))>=15){
      together.push(relAct(p,r,{id:'younger',emoji:'📼',label:'Do something from when you were young',sub:'+bond (15yr+)',base:10,cool:3,joy:4,
        line:(p,r,n)=>`${p.first} and ${n} did the old thing, the young thing. The years fell away for a night.`}));
    }
  }

  /* ---------------- TALK ---------------- */
  if(isRomance){
    talk.push(relAct(p,r,{id:'realtalk',emoji:'💬',label:'Have a real conversation',sub:'+bond',base:8,cool:1,
      effect:(p,r)=>{ if(p.stats.smarts>65||hasCharm(p)) applyBond(r,3); },
      line:(p,r,n)=>`${p.first} and ${n} actually talked — the real kind. ${(p.stats.smarts>65||hasCharm(p))?'It went somewhere deep.':'Halting, but honest.'}`}));
    if(!hasFlag(r,'_secretShared')) talk.push(relAct(p,r,{id:'secret',emoji:'🔓',label:'Share something never told',sub:'+bond (once)',base:12,cool:99,
      effect:(p,r)=>{ setFlag(r,'_secretShared'); },
      line:(p,r,n)=>`${p.first} told ${n} a thing no one else knows. ${n} held it gently. Something shifted, permanently.`}));
    talk.push(relAct(p,r,{id:'future',emoji:'🔭',label:'Talk about the future',sub:'+bond',base:7,cool:1,
      line:(p,r,n)=>`${p.first} and ${n} talked about what comes next. ${chance(70)?'Their visions lined up.':'A few gaps to work on — but better named than buried.'}`}));
    talk.push(relAct(p,r,{id:'meanto',emoji:'💗',label:'Tell them what they mean to you',sub:'+bond',base:10,cool:1,
      line:(p,r,n)=>`${p.first} said the thing out loud to ${n}. ${hasCharm(p)?'It landed like poetry.':'Awkward, and all the more real for it.'}`}));
  }
  if(isYoungChild){
    talk.push(relAct(p,r,{id:'theirworld',emoji:'🌍',label:'Ask about their world',sub:'+bond',base:8,cool:1,
      line:(p,r,n)=>`${p.first} asked ${n} about their life and actually listened. ${r.bond>60?'They opened right up.':'A few doors cracked.'}`}));
    talk.push(relAct(p,r,{id:'mychild',emoji:'👶',label:'Tell them about your childhood',sub:'+bond',base:7,cool:2,
      line:(p,r,n)=>`${p.first} told ${n} stories of being young once. ${n} saw a person, not just a parent.`}));
    if(kid&&kid.age>=12&&kid.age<=15) talk.push(relAct(p,r,{id:'thetalk',emoji:'🗣',label:'Have "the talk"',sub:'+bond, +awareness',base:8,cool:3,
      line:(p,r,n)=>`${p.first} had one of the awkward, necessary talks with ${n}. ${chance(60)?'Handled with grace.':'Clumsy — but the love came through.'}`}));
    talk.push(relAct(p,r,{id:'proud',emoji:'🌟',label:"Tell them you're proud",sub:'+bond (after an achievement)',base:10,cool:1,
      effect:(p,r)=>{ if(kid && !hasFlag(kid,'recentAchievement')) applyBond(r,-4); }, // rings hollow without one
      line:(p,r,n)=>{ const earned = kid && hasFlag(kid,'recentAchievement'); return earned? `${p.first} told ${n} they were proud — and ${n} had earned it. It landed deep.` : `${p.first} said they were proud, but ${n} couldn't think of why. It rang a little hollow.`; }}));
    if(kid&&kid.age>=10&&kid.age<=15) talk.push(relAct(p,r,{id:'wannabe',emoji:'🎯',label:'Ask what they want to be',sub:'+bond, seeds their path',base:7,cool:2,
      effect:(p,r)=>{ if(kid) setFlag(kid,'dreamsSeeded'); },
      line:(p,r,n)=>`${p.first} asked ${n} what they dreamed of being. The answer surprised them both.`}));
  }
  if(isAdultChild){
    talk.push(relAct(p,r,{id:'asequal',emoji:'🤝',label:'Ask about their life as an equal',sub:'+bond',base:8,cool:1,
      line:(p,r,n)=>`${p.first} talked to ${n} adult-to-adult. The dynamic had finally, quietly shifted.`}));
    talk.push(relAct(p,r,{id:'honest',emoji:'🫀',label:'Share something honest about yourself',sub:'+bond',base:10,cool:2,
      line:(p,r,n)=>`${p.first} let ${n} see the person behind the parent. A real moment.`}));
    talk.push(relAct(p,r,{id:'advice',emoji:'🧭',label:'Ask for their advice',sub:'+bond',base:10,cool:1,joy:2,
      line:(p,r,n)=>`${p.first} asked ${n} for advice — a reversal that meant the world to ${n}.`}));
    if(!hasFlag(r,'_childhoodApology')) talk.push(relAct(p,r,{id:'apolchild',emoji:'🙏',label:'Apologize for their childhood',sub:'+bond (once, big)',base:20,cool:99,
      effect:(p,r)=>{ setFlag(r,'_childhoodApology'); repairBond(r, 0); },
      line:(p,r,n)=>`${p.first} owned the ways they'd fallen short when ${n} was small. ${n} had waited a long time to hear it.`}));
  }
  if(isParent){
    talk.push(relAct(p,r,{id:'theirlife',emoji:'📖',label:'Ask about their life before you',sub:'+bond',base:10,cool:2,
      line:(p,r,n)=>`${p.first} asked ${n} about who they were before kids. A whole person ${p.first} had never quite met.`}));
    if(!hasFlag(r,'_thankedFor')) talk.push(relAct(p,r,{id:'thank',emoji:'🙏',label:'Thank them for something specific',sub:'+bond (once)',base:14,cool:99,
      effect:(p,r)=>{ setFlag(r,'_thankedFor'); },
      line:(p,r,n)=>`${p.first} thanked ${n} for one specific thing, by name. ${n}'s eyes said it mattered more than ${p.first} knew.`}));
    talk.push(relAct(p,r,{id:'cleartheair',emoji:'🌬',label:'Clear the air about something old',sub:'+bond, or risk',base:15,cool:3,
      effect:(p,r)=>{ if(chance(30)){ applyBond(r,-22); } },
      line:(p,r,n)=>{ return r.bond>40? `${p.first} and ${n} finally talked about the old thing. It cleared something that had sat for decades.` : `${p.first} reopened an old wound with ${n}. It didn't go how they hoped.`; }}));
  }
  if(isSib){
    talk.push(relAct(p,r,{id:'avoided',emoji:'💢',label:"Have the conversation you've avoided",sub:'+bond, or risk',base:15,cool:3,
      effect:(p,r)=>{ if(chance(25)) applyBond(r,-18); },
      line:(p,r,n)=>r.bond>35?`${p.first} and ${n} said the unsaid thing. It went better than either feared.`:`${p.first} pushed ${n} on the old tension. It got worse before it could get better.`}));
    talk.push(relAct(p,r,{id:'sibmeanto',emoji:'💗',label:'Tell them what they mean to you',sub:'+bond',base:10,cool:2,
      line:(p,r,n)=>`${p.first} told ${n} the thing siblings rarely say out loud.`}));
  }
  if(isFriend){
    talk.push(relAct(p,r,{id:'catchup',emoji:'☕',label:'Really catch up',sub:'+bond',base:8,cool:1,joy:2,
      line:(p,r,n)=>`${p.first} and ${n} got past the small talk to the real stuff.`}));
    talk.push(relAct(p,r,{id:'callout',emoji:'🪞',label:'Call them on their behavior',sub:'+bond if it lands',base:12,cool:2,
      effect:(p,r)=>{ if(!(hasCharm(p)||p.stats.smarts>60) && chance(50)){ applyBond(r,-17); } },
      line:(p,r,n)=>{ const ok=hasCharm(p)||p.stats.smarts>60||chance(50); return ok?`${p.first} told ${n} a hard truth, carefully. ${n} heard it. That's real friendship.`:`${p.first} pushed too hard and ${n} got defensive. It stung.`; }}));
  }

  /* ---------------- SUPPORT (costs energy) ---------------- */
  const energy=supportEnergyLeft(p);
  const energyNote = energy>0 ? `energy ${energy}/2 left` : 'drained — reduced impact';
  function supportAct(cfg){
    cfg.sub = (cfg.sub||'') + ` · ${energyNote}`;
    const baseFn=cfg.effect;
    cfg.effect=(p,r)=>{ const mult=supportMultiplier(p); spendSupportEnergy(p); if(mult<1) applyBond(r, -Math.round(cfg.base*(1-mult))); if(baseFn)baseFn(p,r); };
    return relAct(p,r,cfg);
  }
  if(isRomance){
    support.push(supportAct({id:'hardweek',emoji:'🫂',label:'Be there for a hard week',sub:'+bond',base:10,cool:1,
      line:(p,r,n)=>`${p.first} carried ${n} through a rough stretch. That's what it's for.`}));
    support.push(supportAct({id:'defend',emoji:'🛡',label:'Defend them publicly',sub:'+bond, costs standing',base:14,cool:2,
      effect:(p,r)=>{ p.stats.fame=clamp(p.stats.fame-2); },
      line:(p,r,n)=>`${p.first} stood up for ${n} in front of everyone. It cost something. Worth it.`}));
  }
  if(isYoungChild){
    support.push(supportAct({id:'comfort',emoji:'🤗',label:'Comfort them after a failure',sub:'+bond, seeds resilience',base:15,cool:1,
      effect:(p,r)=>{ if(kid) setFlag(kid,'resilientSeed'); },
      line:(p,r,n)=>`${p.first} held ${n} after it all fell apart, and taught them failure isn't the end.`}));
    support.push(supportAct({id:'standup',emoji:'⚖️',label:'Stand up for them',sub:'+bond',base:14,cool:1,
      line:(p,r,n)=>`Someone treated ${n} unfairly, and ${p.first} did not let it stand.`}));
  }
  if(isAdultChild){
    support.push(supportAct({id:'available',emoji:'🫂',label:"Be available when they're struggling",sub:'+bond',base:12,cool:1,
      line:(p,r,n)=>`${p.first} showed up for ${n} without being asked. Adult kids remember that.`}));
    support.push(supportAct({id:'helpmoney',emoji:'💵',label:'Help financially',sub:'+bond, $$',base:8,cool:1,cost:()=>Math.min(p.money,2000+rnd(8000)),
      effect:(p,r)=>{ p._helpedChildMoney=(p._helpedChildMoney||0)+1; if(p._helpedChildMoney>=3) setFlag(p,'childDependency'); },
      line:(p,r,n)=>`${p.first} helped ${n} out of a tight spot.`}));
  }
  if(isParent){
    support.push(supportAct({id:'medappt',emoji:'🏥',label:'Take them to an appointment',sub:'+bond',base:10,cool:1,
      line:(p,r,n)=>`${p.first} sat in the waiting room with ${n}. Practical love, the parent kind, returned.`}));
    if(!relMeta(r).standing.call) support.push(O('📞','Make regular calls a habit','standing +bond/yr',0,()=>{ closeSheet(); relMeta(r).standing.call=true; applyBond(r,5); markInteract(r,'call'); log(`${p.first} started calling ${name} regularly. The line stays warm now.`,'good'); render(); }));
    else support.push(OH('You call them regularly — the bond holds against time.'));
  }
  if(isSib){
    support.push(supportAct({id:'worstmoment',emoji:'🫂',label:'Be there during their worst moment',sub:'+bond (high)',base:18,cool:2,
      line:(p,r,n)=>`When ${n}'s world caved in, ${p.first} was there. That's the whole point of a sibling.`}));
  }
  if(isFriend){
    support.push(supportAct({id:'showup',emoji:'🤝',label:'Show up when they need you',sub:'+bond (high)',base:16,cool:2,
      line:(p,r,n)=>`${n} cancelled on everyone — except ${p.first}, who showed. That's the difference.`}));
    support.push(supportAct({id:'checkin',emoji:'📲',label:'Check in during a rough patch',sub:'+bond',base:10,cool:1,
      line:(p,r,n)=>`${p.first} reached out to ${n} unprompted, just to check. Sometimes that's everything.`}));
    support.push(relAct(p,r,{id:'lend',emoji:'💵',label:'Lend them money',sub:'+bond, may complicate',base:8,cool:2,cost:()=>Math.min(p.money,1000+rnd(5000)),
      effect:(p,r)=>{ setFlag(p,'lentToFriend'); },
      line:(p,r,n)=>`${p.first} lent ${n} money. A kindness — and a thread that might tug later.`}));
  }

  /* ---------------- MILESTONE ---------------- */
  if(isRomance){
    milestone.push(O('💢','Confront a serious problem','high risk / reward',0,()=>{ closeSheet();
      if(chance(55)){ applyBond(r,16); log(`${p.first} named the hard thing with ${name} and they faced it head-on. Stronger for it.`,'good'); }
      else { damageBond(r,'unforgivable',{amt:14}); log(`${p.first} forced the issue with ${name} and it blew up. Words were said.`,'bad'); }
      render(); }));
    if(relMeta(r).damaged && relMeta(r).damaged.kind==='affair'){
      milestone.push(O('💑','Suggest couples therapy','open repair chain',0,()=>{ closeSheet(); startCounselingChain(p, r); }));
    }
  }
  // Power transfusion to an adopted child (unlocked permanently by a Mad Scientist ancestor)
  if(isChild && kid && kid.adopted && G.transfusionUnlocked && p.powers && p.powers.length>0 && !hasFlag(p,'transfusedHeir')){
    milestone.push(O('🧬','Transfuse powers to this heir','passes ~2/3 of your powers',0,()=>{ closeSheet(); if(typeof doPowerTransfusion==='function') doPowerTransfusion(p); }));
  }
  // Rename is always available
  const renameOpt = O('✏️','Rename them','edit their name',0,()=>{ openRenameRel(p, r); });

  // ---- assemble ----
  let body=`<div class="grab"></div><h3>${name}</h3>`;
  const stateName=bondStateName(r.bond), col=bondStateColor(r.bond);
  body+=`<p class="hint">${r.kind}${kid?` · ${kid.age}`:''} · <b style="color:var(--${col.slice(2)})">${stateName}</b></p>`;
  if(shared.length){
    body+=`<div style="padding:0 20px 6px;font-size:12px;color:var(--ink-dim)">Shared: ${shared.map(k=>{const m=interestMeta(k);return m?m.e+' '+m.l:k;}).join(' · ')}</div>`;
  }
  const warm=relWarmthNote(r); if(warm) body+=`<div style="padding:0 20px 8px;font-size:12px;color:var(--sage);font-style:italic">${warm}</div>`;

  let html=body;
  if(together.length){ html+=relCategoryHeader('Together'); html+=together.join(''); }
  if(talk.length){ html+=relCategoryHeader('Talk'); html+=talk.join(''); }
  if(support.length){ html+=relCategoryHeader('Support'); html+=support.join(''); }
  if(milestone.length){ html+=relCategoryHeader('Milestone'); html+=milestone.join(''); }
  html+=relCategoryHeader(' '); html+=renameOpt;

  sheet(html, sh=>{ bindOpts(sh); });
}

// ---- a minimal counseling repair chain (affair) ----
function startCounselingChain(p, r){
  closeSheet();
  const name=r.name.split(' ')[0];
  const step = (p._counselStep||0);
  const opts=[];
  opts.push(O('💬','Go to the session','work on it',0,()=>{ closeSheet();
    p._counselStep=(p._counselStep||0)+1;
    applyBond(r, 8);
    if(p._counselStep>=3){
      repairBond(r, 6); p._counselStep=0;
      log(`After months of counseling, ${p.first} and ${name} found their way back. The marriage survived — and both know what that cost.`,'big');
    } else {
      log(`${p.first} and ${name} did the work in counseling. Session ${p._counselStep} of 3. Slow, real progress.`,'good');
    }
    render();
  }));
  opts.push(O('🚪','Give up — end it','divorce',0,()=>{ closeSheet(); doBreakup(p, r); }));
  let html=`<div class="grab"></div><h3>Counseling</h3><p class="hint">Rebuilding trust with ${name} after the affair. ${3-(p._counselStep||0)} session${3-(p._counselStep||0)===1?'':'s'} to go.</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

// ---- delegate module 18's flat menu to the categorized one ----
if(typeof openPeerActions==='function' && !openPeerActions._categorized){
  openPeerActions = function(p, r){ openRelMenu(p, r); };
  openPeerActions._categorized = true;
}
