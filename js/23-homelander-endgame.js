"use strict";
/* Threadbare · split module: 23-homelander-endgame.js  (lines 7062–7601 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   THE HOMELANDER TAB — everything about the endgame lives here
   ============================================================ */
function homelanderTabUnlocked(p){
  return (p.powers&&p.powers.length>0) || p.gen>=2 || (G.vault&&G.vault.length>0) || G.homelandersBeaten>0;
}
function openHomelander(){
  const p=me();
  const reqHave=vaultRequiredCount(), optHave=vaultOptionalCount();
  const aw=awarenessLevel();
  const awColor=['var(--sage)','var(--gold)','var(--rose)','var(--blood)'][aw];
  let html=`<div class="grab"></div><h3>☄️ Homelander</h3>
    <p class="hint">The god-tyrant who rules this world. Your bloodline's purpose, generation by generation.</p>
    <div style="padding:2px 20px">`;
  // progress
  html+=`<div style="background:var(--panel-2);border-radius:12px;padding:12px 14px;border:1px solid rgba(120,140,200,.25);margin-bottom:10px">
    <div style="font-size:13px;color:var(--sky)">Powers: <b>${p.powers.length}/${TOTAL_POWERS}</b> <span style="color:var(--ink-faint);font-size:11px">(this gen can gain ${Math.max(0,POWERS_PER_GEN-(p.powersGained||0))} more)</span></div>
    <div style="height:6px;background:rgba(255,255,255,.08);border-radius:5px;margin:6px 0;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(p.powers.length/TOTAL_POWERS*100)}%;background:linear-gradient(90deg,var(--sky),var(--gold))"></i></div>
    <div style="font-size:13px;color:var(--gold)">Vault: <b>${reqHave}/${REQUIRED_VAULT}</b> required${optHave?` · +${optHave} optional`:''}</div>
    <div style="height:6px;background:rgba(255,255,255,.08);border-radius:5px;margin:6px 0;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(reqHave/REQUIRED_VAULT*100)}%;background:linear-gradient(90deg,var(--blood),var(--gold))"></i></div>
    <div style="font-size:12px;margin-top:5px">Bloodline awareness: <b style="color:${awColor}">${AWARENESS_LEVELS[aw]}</b></div>
  </div>`;
  const opts=[];
  // VICTORY STATE
  if(G.homelanderDefeated){
    html+=`<div style="background:rgba(217,164,65,.12);border-radius:12px;padding:12px 14px;border:1px solid var(--gold);margin-bottom:10px">
      <div style="font-size:13px;color:var(--gold)">✅ This bloodline has defeated Homelander ${G.homelandersBeaten}× ${G.newHomelanderIn!=null?`<br><span style="color:var(--ink-dim);font-size:12px">A new Homelander rises in ~${G.newHomelanderIn} years. Rebuild.</span>`:''}</div></div>`;
  }
  // SUB-BOSSES
  opts.push(OH('— Vought\'s lieutenants —'));
  SUB_BOSSES.forEach(sb=>{
    const defeated=subBossDefeated(sb.id);
    const unlocked=p.powers.length>=sb.threshold;
    if(defeated){
      opts.push(O(sb.emoji, sb.name+' — defeated', 'a lieutenant down', 0, ()=>{}, true));
    } else if(unlocked){
      opts.push(O(sb.emoji, 'Confront '+sb.name, sb.blurb(p).slice(0,60)+'…', 0, ()=>{ closeSheet(); startSubBossFight(p, sb); }));
    } else {
      opts.push(O('🔒', sb.name+' — locked', `appears at ${sb.threshold} powers`, 0, ()=>{}, true));
    }
  });
  // THE FIGHT
  if(!G.homelanderDefeated){
    opts.push(OH('— The reckoning —'));
    const ready=bloodlineReady(p);
    opts.push(O(ready?'⚔️':'☄️', ready?'Confront Homelander':'Challenge Homelander', ready?'the bloodline is ready':'you are not ready — this means death', 0, ()=>{ closeSheet(); ready?fullConfrontation(p):prematureChallenge(p); }));
  }
  // VAULT + SYCOPHANT
  opts.push(OH('— Intel & influence —'));
  opts.push(O('🗝️','Open the vault',`${reqHave+optHave} items secured`,0,()=>{ closeSheet(); openVault(p); }));
  opts.push(O('🎭','Play the sycophant','curry favor — it has uses',0,()=>{ closeSheet(); openSycophant(p); }));
  html+='</div>';
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}
// ===== SYCOPHANT OPTIONS — lower awareness, occasional easter eggs =====
function openSycophant(p){
  const html=`<div class="grab"></div><h3>🎭 Curry favor</h3>
    <p class="hint">Publicly supporting Homelander makes the bloodline look harmless. He underestimates flatterers — and that can be used.</p>`;
  const opts=[];
  opts.push(O('💌','Send a letter of admiration','+sycophant',0,()=>{ closeSheet(); G.sycophant=(G.sycophant||0)+1;
    if(chance(12)){ log(`📬 A reply came back, signed: "Thank you so much for your continued support. It genuinely means a lot. — Kevin (The Deep)". Kevin. His name is Kevin.`,'big'); }
    else log(`${p.first} sent fawning fan mail to Homelander. Filed away somewhere.`,'muted'); render(); }));
  opts.push(O('💰','Donate to Vought Cares™','+sycophant, -$',0,()=>{ closeSheet(); const c=Math.min(p.money,5000); p.money-=c; G.sycophant=(G.sycophant||0)+1;
    if(chance(12)){ raiseAwareness(1); log(`🧨 Firecracker reposted your donation on FlameCast with a patriotic caption. Your face was briefly on her network. (Awareness rose.)`,'muted'); }
    else log(`${p.first} donated ${money(c)} to Vought Cares™. Good optics.`,'muted'); render(); }));
  opts.push(O('📱','Publicly defend him online','+sycophant, -awareness',0,()=>{ closeSheet(); G.sycophant=(G.sycophant||0)+1; lowerAwareness(1);
    if(chance(12)){ log(`💎 Translucent logged your post: "Subject publicly supportive of Vought interests. Possible low-threat designation. Monitor." (Awareness lowered.)`,'muted'); }
    else log(`${p.first} publicly defended Homelander. The bloodline looks harmless — exactly the point. (Awareness lowered.)`,'good'); render(); }));
  opts.push(O('🚪','Never mind','',0,()=>{ closeSheet(); openHomelander(); }));
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

/* ===== POWER INTERACTION BEATS ===== */
// Each beat: {need:[powers], text} for "you have it" success; the system also generates failure beats.
const FIGHT_BEATS_SUCCESS = [
  {need:['invisibility','x-ray vision'], t:`You vanish. His eyes sweep the block in an orange-red glow — but you can see him scanning, and you move before he locks on. He spins, one beat late.`},
  {need:['telepathy','psychic shielding'], t:`You reach into his mind. The psychic shielding bounces his counter-push back at him. For three seconds you're inside his head — and you find the crack.`},
  {need:['empathy'], t:`The empathy floods in. He's afraid — not of you, of losing, of being seen losing. You push it back at him, amplified. He pulls back. Just for a second. A second is everything.`},
  {need:['energy absorption'], t:`His laser vision blazes — the kind that cuts through aircraft. You drink it. The heat pours into you, converting, building. He stops firing. His expression: recalculation.`},
  {need:['time manipulation'], t:`Time slows to a crawl. You land eight clean hits in the stretched silence. Time snaps back. He staggers, bleeding from his lip. "You have time," he says, filing it away.`},
  {need:['gravity manipulation'], t:`You triple the gravity around him. His knees BUCKLE — four full seconds he's fighting just to stand, and you use all of them.`},
  {need:['duplication'], t:`You split into three. He's fast, but even he can only track so many of you at once. Two of you land hits while he chases the third.`},
  {need:['density control'], t:`You go diamond-hard. His full-force blow lands — and glances off. He's never hit something that didn't move. He hesitates.`},
  {need:['probability manipulation'], t:`His attacks go slightly wide. Not by much — just by the margin that matters. Yours keep finding the gap. Over the exchange, it compounds.`},
  {need:['biological mimicry'], t:`At the instant he uses his strength, you copy it exactly. For one impossible moment, you match him at his own peak — and he feels it.`},
  {need:['weather control'], t:`The sky answers you. Lightning arcs down, fog swallows the block. His laser vision in a storm is as dangerous to him as to you.`},
  {need:['precognition','super speed'], t:`Every attack arrives with a preview. You see the hit before he throws it, and you're already gone.`},
  {need:['cryokinesis'], t:`You flash-freeze the air around him. For three seconds he's locked in ice. Three seconds you spend well.`},
  {need:['sonic scream','super hearing'], t:`You tune the scream to his exact sensitivity. The sound that barely tickles you drops him to one knee.`},
  {need:['telekinesis'], t:`Debris, weapons, the man himself — all float at your command. He's strong, but he can't punch what won't let him reach the ground.`},
];
// counter pairs: if you lack the counter, his power wins the beat (used in premature fights)
const FIGHT_BEATS_FAIL = [
  {his:'x-ray vision', t:`You turn invisible. He tilts his head, his eyes sweep the block in an orange-red glow, and he finds you in under two seconds. "Cute trick," he says. "You're the third person who's tried that."`},
  {his:'laser vision', t:`You throw up a force field. His eyes blaze. Your field holds for 1.4 seconds before the laser cuts through. 1.4 seconds is not enough.`},
  {his:'psychic shielding', t:`You reach for his mind — and hit a wall. He shuts you out, and worse, he uses what he read in the instant before you were blocked.`},
  {his:'super speed', t:`He goes faster than anything — faster than you can track, a full-velocity blur. You needed one more second. You don't have it.`},
  {his:'super endurance', t:`You hit him with everything. He shrugs it off in a single second and keeps coming, tireless, while you tire.`},
];
function pickFightBeats(p, count){
  const have=new Set(p.powers||[]);
  const out=[];
  // success beats the character can actually perform
  const usable=FIGHT_BEATS_SUCCESS.filter(b=>b.need.every(n=>have.has(n)));
  const shuffled=[...usable].sort(()=>Math.random()-0.5);
  for(const b of shuffled){ if(out.length>=count) break; out.push({text:b.t, powers:b.need, ok:true}); }
  return out;
}
// helper: render a multi-paragraph cinematic screen with a single continue button
function cinemaScreen(title, emoji, paragraphs, btnLabel, onClose, accent){
  const body=paragraphs.map(t=>`<p style="color:var(--ink-dim);font-size:14px;line-height:1.65;margin:0 0 12px">${t}</p>`).join('');
  const scrim=document.createElement('div');
  scrim.className='scrim center';
  scrim.innerHTML=`<div class="cmodal">
    <div style="text-align:center;font-size:50px;margin:6px 0">${emoji}</div>
    <h2 style="text-align:center;color:${accent||'var(--gold)'};margin:0 0 12px">${title}</h2>
    ${body}
    <button class="btn" id="cinClose" style="margin-top:8px;${accent?`background:${accent};color:#1a1208`:''}">${btnLabel}</button>
  </div>`;
  root.appendChild(scrim);
  const btn=scrim.querySelector('#cinClose'); if(btn) btn.onclick=()=>{ scrim.remove(); if(onClose)onClose(); };
}
// ===== THE PREMATURE CHALLENGE — six tiers, always fatal, always informative =====
function prematureChallenge(p){
  const n=p.powers.length;
  const heirNote=`The powers ${p.first} carried pass to the next heir.`;
  let title='Challenge Homelander', emoji='☄️', paras=[], whNote='';
  if(n<=8){
    title='Vought Comes Instead'; emoji='📞';
    paras=[`${p.first} puts out the call. Publicly, loudly. And waits.`,
      `He doesn't come. A Vought International liaison calls forty minutes later. Very polite. Explains that drawing attention to yourself this way is not in your best interest.`,
      `Two days later, ${p.first} is found dead. No cause determined. The official report says natural causes. Vought calls it a tragedy.`];
    whNote=`${p.first} ${p.last} challenged Homelander's existence publicly and was silenced. No one connected the two events.`;
  } else if(n<=16){
    title='Eight Seconds'; emoji='💀';
    const fail=pick(FIGHT_BEATS_FAIL);
    paras=[`He shows up. He's briefly entertained.`, fail.t, `It's over in eight seconds. ${heirNote}`];
    whNote=`${p.first} ${p.last} faced Homelander and lasted seconds. No civilians were harmed. Vought issued no comment.`;
  } else if(n<=24){
    title='One Step Back'; emoji='👊';
    paras=[`${p.first} hits him. Actually hits him — the kind of blow that would end anyone else permanently.`,
      `He staggers one step. ONE step. Then he looks at ${p.first} with something closer to curiosity than rage. "Huh," he says.`,
      `Then he kills you. But he took a step back. ${heirNote}`];
    whNote=`${p.first} ${p.last} made Homelander take a step back — documented only once before, by a 2019 weapons test. This bloodline is the second.`;
  } else if(n<=34){
    title='First Blood'; emoji='🩸';
    const beats=pickFightBeats(p,2).map(b=>b.text);
    paras=[...beats, `He's bleeding. Not much — a cut above his eye. He touches it and looks at the blood like an object he's never seen. "You've been preparing," he says. It isn't a compliment. It's recognition.`,
      `He kills you the next second. But the footage spreads before Vought can contain it. ${heirNote}`];
    whNote=`${p.first} ${p.last} drew blood from Homelander. Footage circulated before suppression. A small movement begins online, questioning his invincibility.`;
    raiseAwareness(1);
  } else if(n<=44){
    title='Forty Seconds'; emoji='⏱️';
    const beats=pickFightBeats(p,4).map(b=>b.text);
    paras=[...beats, `For forty seconds, ${p.first} actually has him. Forty. Forty-one.`,
      `Then he breaks free through sheer will. He should not be able to do that. He does it anyway. "Not yet," he says — to himself, not to you. ${heirNote}`];
    whNote=`${p.first} ${p.last} came closer than anyone alive. The most-watched event of the age. Homelander gave no interviews for three years. Other powered individuals begin reaching out to the bloodline.`;
    raiseAwareness(2);
  } else {
    title='One Thing Short'; emoji='🥀';
    const beats=pickFightBeats(p,4).map(b=>b.text);
    const missing = !hasPower(p,'psychic shielding') ? `Then you feel him in your mind. You didn't know he had that. You do now. Too late.`
      : !hasPower(p,'time manipulation') ? `He goes faster than anything — faster than super speed — and you cannot track it. You needed one more second.`
      : `The one capability the bloodline never gathered becomes the one opening he needs.`;
    paras=[`${p.first} is winning. You know you're winning. You can feel it in every exchange.`, ...beats, missing,
      `One power short. One vault item missing. ${heirNote}`];
    whNote=`${p.first} ${p.last} fought Homelander to near-defeat and lost by a single missing element — the closest any individual has come in recorded history.`;
    G.awareness=3; // HUNTED permanently
  }
  if(whNote) worldEvent(p, whNote, {fear:true});
  p._causeOfDeath=`killed challenging Homelander before the bloodline was ready`;
  cinemaScreen(title, emoji, paras, 'The bloodline endures', ()=>{ die(p); render(); }, 'var(--blood)');
}
// ===== SUB-BOSS FIGHTS =====
function startSubBossFight(p, sb){
  if(!G.subBossesSeen) G.subBossesSeen=[];
  if(!G.subBossesSeen.includes(sb.id)) G.subBossesSeen.push(sb.id);
  if(sb.id==='deep') fightDeep(p);
  else if(sb.id==='translucent') fightTranslucent(p);
  else if(sb.id==='firecracker') fightFirecracker(p);
}
function recordSubBossWin(p, sb, rewardId){
  if(!G.subBossesDefeated) G.subBossesDefeated=[];
  if(!G.subBossesDefeated.includes(sb.id)) G.subBossesDefeated.push(sb.id);
  if(rewardId) storeInVault(rewardId);
  setFlag(p,'beat_'+sb.id);
}
function fightDeep(p){
  const have=new Set(p.powers||[]);
  if(p.powers.length<10){
    cinemaScreen('The Deep','🌊',[`He shows up and immediately senses you have less than he expected. "Okay," he says, visibly relieved. "This doesn't have to be a whole thing."`,
      `He defeats ${p.first} without breaking a sweat — bruised ribs, wounded pride, but alive. He files it as "resolved," describing you as "a minor nuisance."`],
      'Survive and learn', ()=>{ p.stats.health=clamp(p.stats.health-12); render(); }, 'var(--sky)');
    return;
  }
  // which approaches work
  const works=['electrokinesis','telepathy','hydrokinesis','empathy'].filter(x=>have.has(x));
  let beat;
  if(have.has('electrokinesis')) beat=`Water and electricity. He should have thought about the harbor. The arc jumps the salt water and he convulses, scrambling toward dry ground — the wrong direction for him.`;
  else if(have.has('hydrokinesis')) beat=`He commands the water. You command it better. He turns to call the tide and finds it coming the wrong way. He stares at the ocean like it betrayed him.`;
  else if(have.has('telepathy')) beat=`You reach into his mind: a man managing shame for decades. You don't even attack — you just hold the mirror up. "Stop that," he says. His voice cracks.`;
  else if(have.has('empathy')) beat=`The empathy floods in. Not cruelty — exhaustion. He's been doing this a very long time and he is so tired. He doesn't want to hurt you. He wants someone to tell him he doesn't have to.`;
  else beat=null;
  if(!beat){
    cinemaScreen('The Deep','🌊',[`"I was told to deal with you," he says. "I'd really rather not."`,
      `You don't have what it takes to corner him. He defeats you, almost apologetic. "I'm going to file this as a warning. You get one of those. Don't make me come back." He disappears into the water.`],
      'Survive', ()=>{ p.stats.health=clamp(p.stats.health-10); render(); }, 'var(--sky)');
    return;
  }
  // the negotiation choice
  cinemaScreen('The Deep','🌊',[`He shows up in civilian clothes — the first tell. "I was told to deal with you," he says. "I'd really rather not. You seem reasonable."`,
    beat,
    `He's bleeding now, not badly. "Okay. You're better than I was told. I don't actually want to kill you — this situation is not of my making." He looks genuinely miserable.`],
    'Decide his fate', ()=>{ deepNegotiation(p); }, 'var(--sky)');
}
function deepNegotiation(p){
  const html=`<div class="grab"></div><div style="text-align:center;font-size:42px">🌊</div><h3 style="text-align:center">The Deep is beaten</h3>
    <p style="padding:6px 22px 12px;color:var(--ink-dim);font-size:14px;line-height:1.6;text-align:center">He'd rather talk than fight. What do you do?</p>`;
  const opts=[];
  opts.push(O('🌊','Finish the fight','secure the aquatic network',0,()=>{ closeSheet(); recordSubBossWin(p, SUB_BOSSES[0], 'aquanet'); lowerAwareness(0);
    cinemaScreen('Victory','🌊',[`He retreats into deep water, not seen publicly for months. Vought issues a terse statement.`,`You've secured Vought's Aquatic Network — off-grid underwater routes that will get a coalition unit to the final fight undetected.`],'Continue',()=>render(),'var(--gold)'); }));
  opts.push(O('🤝','Hear him out','a better reward — his intel',0,()=>{ closeSheet(); setFlag(p,'deepAllianceFormed'); recordSubBossWin(p, SUB_BOSSES[0], 'deepfile');
    cinemaScreen('An Unlikely Ally','🤝',[`He's scared of Homelander too. Has been for years. He can't defect openly — Vought would end him — but he can leave things in places. Share what he sees.`,`He becomes an intelligence asset. You've secured The Deep's File: a daily-contact psychological profile of Homelander, more useful than any map. When the final fight comes, he'll be in the coalition.`],'Continue',()=>render(),'var(--gold)'); }));
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}
function fightTranslucent(p){
  const have=new Set(p.powers||[]);
  if(p.powers.length<20){
    cinemaScreen('Translucent','💎',[`You can't see him. He's been in your space for four minutes before you realize it. You swing and hit air.`,
      `"Interesting," he says. Then he breaks two of your ribs from an angle you never tracked, and leaves. No theatrics. He files a complete profile on your bloodline with Vought before you reach the hospital.`],
      'Survive', ()=>{ p.stats.health=clamp(p.stats.health-15); raiseAwareness(1); render(); }, 'var(--rose)');
    return;
  }
  // the puzzle: only certain powers penetrate his diamond skin
  const keys=['electrokinesis','phasing','telekinesis','sonic scream','pyrokinesis','gravity manipulation'];
  const usable=keys.filter(k=>have.has(k) && (k!=='sonic scream' || have.has('super hearing')));
  if(!usable.length){
    cinemaScreen('Translucent','💎',[`You know he's here. You can't see him. "You called this meeting," he says, bored.`,
      `Your hits bounce off something like concrete. "Interesting choice," he says from a new position. You never find the way in.`,
      `"Come back when you have something that works," he says. He's not mocking. He's sincere. Your character survives. Your pride doesn't.`],
      'Survive', ()=>{ p.stats.health=clamp(p.stats.health-8); render(); }, 'var(--rose)');
    return;
  }
  let beat;
  if(have.has('phasing')) beat=`You reach through the skin — and there's no carbon on the inside. Just a person. He goes still. No one has ever done this.`;
  else if(have.has('electrokinesis')) beat=`Carbon conducts electricity better than it should. He flickers visible in the arc, crackling blue-white, and makes a sound for the first time. "You did your research," he says. Not bored anymore.`;
  else if(have.has('telekinesis')) beat=`You find a gap — the mouth, the nostrils — and push. His skin is impervious. His lungs are not. He becomes visible immediately, hands up.`;
  else if(have.has('sonic scream')) beat=`You find the frequency by instinct honed over generations. The carbon lattice vibrates wrong. He becomes visible in pieces — arm, torso, all of him, crouching, not happy about it.`;
  else if(have.has('gravity manipulation')) beat=`You don't need to touch the skin at all. You just make him weigh ten tons. He sinks to his knees, visible, pinned.`;
  else beat=`Sustained heat builds inside the shell even as the outside holds. He breaks cover, smoking.`;
  cinemaScreen('Translucent','💎',[`You know he's here. You can't see him. "You called this meeting," he says from your left, almost bored.`,
    beat,
    `Without the invisibility he's just a man — capable, dangerous, but you've been building toward this for twenty generations. He's a test, not the test.`,
    `"Noted," he says when he's beaten, like he's logging it. Then: complete professionalism. He gives up.`],
    'Claim the advantage', ()=>{ recordSubBossWin(p, SUB_BOSSES[1], 'blindspot'); lowerAwareness(1);
      log(`💎 Translucent is down. Homelander has lost his primary surveillance asset — your bloodline can finally operate unwatched.`,'big');
      render(); }, 'var(--gold)');
}
function fightFirecracker(p){
  const have=new Set(p.powers||[]);
  if(p.powers.length<30){
    cinemaScreen('Firecracker','🧨',[`She opens FlameCast before the fight starts. "Ladies and gentlemen, I have located the individual Vought has been tracking. As you can see —"`,
      `She beats you. On camera. The blast radius is larger than you were prepared for. You survive with moderate injuries. The footage airs for three weeks. The world now has video of you losing.`],
      'Survive', ()=>{ p.stats.health=clamp(p.stats.health-14); raiseAwareness(1); render(); }, 'var(--blood)');
    return;
  }
  // physical beat
  let physBeat;
  if(have.has('energy absorption')) physBeat=`She detonates a full-radius blast. You drink the shockwave. She stares. "What did you just do?" Then, to the camera: "…technical difficulties."`;
  else if(have.has('force fields')) physBeat=`The detonation hits your field and dissipates. "Good field," she says, professionally, and adjusts the next one.`;
  else if(have.has('weather control')) physBeat=`A downdraft disperses each blast before it lands. She's been setting off explosions in a hurricane. "That's not — that's not fair."`;
  else if(have.has('probability manipulation')) physBeat=`Every blast goes slightly wide. She's never missed at this range. She checks the device. It's fine. She fires again. Wide.`;
  else physBeat=`Her explosions are real and they hurt, but you weather them and close the distance.`;
  // media battle
  const mediaWin = have.has('technopathy')||have.has('telepathy')||have.has('mind control')||(p.onSocial&&p.socialFollowers>200000&&p.stats.fame>50);
  let mediaBeat;
  if(have.has('technopathy')) mediaBeat=`You reach into the broadcast signal and reroute it. FlameCast suddenly shows your footage instead of hers. "Hey — cut the feed!" she shouts. No one can.`;
  else if(have.has('telepathy')||have.has('mind control')) mediaBeat=`You don't touch the camera. You touch the producer. The feed cuts. "What are you doing?" she demands. "Taking a break," he says, mildly.`;
  else if(p.onSocial&&p.socialFollowers>200000&&p.stats.fame>50) mediaBeat=`Your counter-stream goes live. Your following is bigger than hers. For the first time her viewer count drops in real time while she's broadcasting.`;
  else mediaBeat=`FlameCast runs the whole fight. You win physically — but the narrative is hers, and she's good at her job. The world sees a Vought hero defending herself.`;
  recordSubBossWin(p, SUB_BOSSES[2], 'counternarr');
  if(!mediaWin) setFlag(p,'firecrackerMediaLost');
  cinemaScreen('Firecracker','🧨',[`She's already broadcasting. "This is the individual responsible for the attacks on Vought personnel," she tells millions. She believes it. That's what makes her dangerous.`,
    physBeat, mediaBeat,
    `She's down. She looks at the camera and says the first genuine thing all fight: "He's going to lose." Not to you. To whoever's watching. Then she's done.`,
    mediaWin?`Her network is yours now — The Counter-Narrative will amplify the Broadcast when the real fight comes.`:`You took her network, but the story got away from you — the Counter-Narrative will work, just not at full strength.`],
    'Claim the network', ()=>{ log(`🧨 FlameCast is yours. The media front protecting Homelander is gone.`,'big'); render(); }, 'var(--gold)');
}
// ===== THE FULL CONFRONTATION — multi-phase, with a crisis choice =====
function fullConfrontation(p){
  const hunted=awarenessLevel()>=3;
  const sycophant=(G.sycophant||0)>=3;
  const allSubs=(G.subBossesDefeated||[]).length>=3;
  // PHASE 0 + 1
  const ancestor = bloodlineFirstVaultAncestor();
  let arrival = hunted
    ? `He already knows. He's known for years. He arrives angry instead of curious — which is worse; anger in him tends to be accurate. "I've been watching your family a long time. You want to know what I found? Impressive. And still not enough."`
    : `He lands across from you, taking in the scene — the coalition, the cameras, the setup. "You've been busy," he says. There's something in his voice just before respect, when someone won't admit what it is yet.`;
  if(allSubs) arrival+=` He surveys it all and — for the first time in this — he looks genuinely alone.`;
  if(sycophant) arrival+=` He almost smiles. "You used to send me fan mail." He's underestimating you. Good.`;
  const phase1=[`${ancestor}`, arrival, `The Broadcast cuts on. Every screen in the world shows this moment. He glances up, sees himself — and the performance begins to fracture.`];
  cinemaScreen('The Confrontation','☄️', phase1, 'The exchanges begin', ()=>confrontationPhase2(p), 'var(--gold)');
}
function bloodlineFirstVaultAncestor(){
  // find the earliest stored vault contributor name from history if tracked, else generic
  return `Generations ago, an ancestor stored the first piece of this. They never saw this moment coming. Neither did the dozens who followed. ${me().first} is here because of all of them.`;
}
function confrontationPhase2(p){
  const beats=pickFightBeats(p, 5).map(b=>b.text);
  if(vaultHas('blindspot')) beats.push(`He moves to counter — and can't. He didn't know about this one. Translucent isn't feeding him intel anymore.`);
  if(beats.length<3) beats.push(`You trade blows that would each kill an army. Neither of you falls.`);
  cinemaScreen('The Power Exchanges','⚔️', beats, 'The vault activates', ()=>confrontationPhase3(p), 'var(--sky)');
}
function confrontationPhase3(p){
  const beats=[];
  if(vaultHas('virus')||vaultHas('formula')) beats.push(`The compounds are working — his regeneration has slowed, his invulnerability dropped. The cut above his eye isn't closing. He's noticed too.`);
  if(vaultHas('underground')) beats.push(`From three directions, the coalition moves through tunnels an ancestor spent two decades mapping. He can't track them all.`);
  if(vaultHas('aquanet')) beats.push(`A unit arrives from the water — a route Vought never imagined anyone would use against them.`);
  if(vaultHas('combatai')) beats.push(`The AI feeds you his next move before he makes it. His weight shifts right — he'll blast left. You're already moving.`);
  if(vaultHas('broadcast')&&vaultHas('precedent')) beats.push(`Every screen is still on. The Precedent means Vought can't pull the feed. He can see himself considering defeat, live, and the world watching him consider it. The performance fractures.`);
  if(vaultHas('counternarr')) beats.push(`The Counter-Narrative runs on Firecracker's old network. His public support is dropping in real time — he can feel it.`);
  if(vaultHas('blackfile')) beats.push(`You know his break point: being made small in front of people. That's the lever. You use it.`);
  if(vaultHas('orbital')) beats.push(`Military assets are in position. You don't fire — you don't need to. He has to keep one eye on the sky.`);
  if(!beats.length) beats.push(`The vault items you carry turn the fight, piece by piece.`);
  beats.push(`He's hurt. He's been hurt before — but not like this. Not by someone ready for everything he did. You have him. The question is what you do with it.`);
  cinemaScreen('The Vault Activates','🗝️', beats, 'The crisis moment', ()=>confrontationCrisis(p), 'var(--gold)');
}
function confrontationCrisis(p){
  const html=`<div class="grab"></div><div style="text-align:center;font-size:42px">☄️</div><h3 style="text-align:center">You have him</h3>
    <p style="padding:6px 22px 12px;color:var(--ink-dim);font-size:14px;line-height:1.6;text-align:center">After ${G.gen} generations, the choice is yours. How does it end?</p>`;
  const opts=[];
  // Option A — End it (needs strength + gloves + invuln + regen)
  if(hasPower(p,'super strength')&&vaultHas('gloves')&&hasPower(p,'invulnerability')&&hasPower(p,'regeneration')){
    opts.push(O('💥','End it','kill him — the most complete victory',0,()=>{ closeSheet(); endHomelander(p,'kill'); }));
  }
  // Option B — The Vault (needs precedent + mandate + order)
  if(vaultHas('precedent')&&vaultHas('mandate')&&vaultHas('order')){
    opts.push(O('🔒','Imprison him','cage him — he lives, contained',0,()=>{ closeSheet(); endHomelander(p,'imprison'); }));
  }
  // Option C — Let the world see (needs broadcast + reel + documentary + manifesto)
  if(vaultHas('broadcast')&&vaultHas('reel')&&vaultHas('documentary')&&vaultHas('manifesto')){
    opts.push(O('📡','Let the world see','expose him — he retreats, weakened',0,()=>{ closeSheet(); endHomelander(p,'expose'); }));
  }
  // Option D — The Device (needs device + order) — last resort, always available if held
  if(vaultHas('device')&&vaultHas('order')){
    opts.push(O('☢️','The Device','end everything — you do not survive',0,()=>{ closeSheet(); endHomelander(p,'device'); }));
  }
  // fallback: if somehow no special combos, allow a basic finish
  if(!opts.length){
    opts.push(O('💥','Finish him','end the fight',0,()=>{ closeSheet(); endHomelander(p,'kill'); }));
  }
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}
function endHomelander(p, mode){
  G.homelanderDefeated=true;
  G.homelandersBeaten=(G.homelandersBeaten||0)+1;
  const optCount=vaultOptionalCount();
  const reward=50000000+rnd(200000000)+optCount*10000000;
  p.money+=reward; p.stats.fame=100; setFlag(p,'beatHomelander');
  const keepsVault=hasPower(p,'dimensional pocket');
  let burn, closeLine, surviving=true, countdown=10;
  if(mode==='kill'){ burn=20; countdown=10; p.stats.health=clamp(Math.min(p.stats.health,15)); setFlag(p,'killedHomelander');
    closeLine=`"He's gone. It took ${G.gen} generations. It took one world. Don't let anyone tell you it wasn't worth it."`;
    worldEvent(p,`${p.first} ${p.last} killed Homelander on a live global broadcast. The world will never be the same.`,{hope:true});
  } else if(mode==='imprison'){ burn=15; countdown=12;
    closeLine=`"He's in the Vault. The lock holds, for now. Your bloodline knows what to do if it doesn't."`;
    worldEvent(p,`${p.first} ${p.last} took Homelander alive and sealed him in the rebuilt Vault. The world watches the incarceration.`,{hope:true});
  } else if(mode==='expose'){ burn=10; countdown=15;
    closeLine=`"He's still out there. But so is the footage. The world is different now — not fixed, but different. Your family made it different."`;
    worldEvent(p,`${p.first} ${p.last} exposed Homelander to the entire world at once. A god who lost on camera, stripped of his corporate cover.`,{hope:true});
  } else { // device
    burn=50; countdown=14; surviving=false; setFlag(p,'usedDevice');
    closeLine=`"${p.first} did not survive. The bloodline continues. That was always the point."`;
    worldEvent(p,`${p.first} ${p.last} unleashed the Device. Homelander is gone. So is ${p.first}. The world is safe, and changed forever.`,{hope:true});
  }
  G.newHomelanderIn=countdown;
  // burn powers (never below what device demands)
  const lose=Math.min(burn, Math.max(0, p.powers.length-(mode==='device'?0:2)));
  for(let i=0;i<lose;i++){ if(p.powers.length>(mode==='device'?0:2)) p.powers.splice(rnd(p.powers.length),1); }
  p.powersGained=POWERS_PER_GEN;
  // vault fate
  if(!keepsVault && mode!=='device'){ G.vault=(G.vault||[]).filter(()=>chance(50)); }
  else if(mode==='device'){ G.vault=[]; }
  // build the ending screen
  const paras=[
    `It's over. ${G.gen} generations. Countless lives, each one living their own ordinary, extraordinary story — and quietly building toward this one.`,
    `The fight burned away ${lose} of the bloodline's accumulated powers. What remains passes on.`,
    closeLine,
  ];
  if(!surviving) paras.push(`In the epilogue, the heir continues the bloodline. The work begins again from near-nothing — but the world history carries the story forward.`);
  homelanderEndingScreen(p, mode, reward, paras, surviving);
}
function homelanderEndingScreen(p, mode, reward, paras, surviving){
  const accent=mode==='device'?'var(--blood)':'var(--gold)';
  const emoji=mode==='kill'?'🏆':mode==='imprison'?'🔒':mode==='expose'?'📡':'☢️';
  const body=paras.map(t=>`<p style="color:var(--ink-dim);font-size:14px;line-height:1.65;margin:0 0 12px">${t}</p>`).join('');
  const scrim=document.createElement('div');
  scrim.className='scrim center';
  scrim.innerHTML=`<div class="cmodal">
    <div style="text-align:center;font-size:54px;margin:6px 0">${emoji}</div>
    <h2 style="text-align:center;color:${accent};margin:0 0 4px">HOMELANDER ${mode==='kill'?'KILLED':mode==='imprison'?'IMPRISONED':mode==='expose'?'EXPOSED':'DESTROYED'}</h2>
    <p style="text-align:center;color:var(--ink-faint);font-size:12px;margin:0 0 14px">Reward: ${money(reward)} · Defeated ${G.homelandersBeaten}× by this bloodline</p>
    ${body}
    <button class="btn" id="endClose" style="margin-top:8px;background:${accent};color:#1a1208">Carry on the bloodline</button>
  </div>`;
  root.appendChild(scrim);
  const btn=scrim.querySelector('#endClose'); if(btn) btn.onclick=()=>{ scrim.remove();
    if(!surviving){ p._causeOfDeath='gave their life to destroy Homelander with the Device'; die(p); }
    render(); };
}
function homelanderVictoryScreen(p, reward, optCount){
  const scrim=document.createElement('div');
  scrim.className='scrim center';
  scrim.innerHTML=`<div class="cmodal" style="text-align:center">
    <div style="font-size:60px;margin:10px 0">🏆</div>
    <h2 style="color:var(--gold);margin:0 0 6px">HOMELANDER DEFEATED</h2>
    <p style="color:var(--ink-dim);font-size:15px;line-height:1.6;padding:0 10px">
      After <b>${G.gen} generations</b>, the bloodline of ${p.first} ${p.last} did what no one could:
      united all ${TOTAL_POWERS} powers and all ${REQUIRED_VAULT} vault items${optCount?` (plus ${optCount} more)`:''} — and ended the tyrant.<br><br>
      Reward: <b style="color:var(--gold)">${money(reward)}</b><br>
      Homelanders defeated by this line: <b>${G.homelandersBeaten}</b>
    </p>
    <p style="color:var(--ink-faint);font-size:13px;line-height:1.5;padding:8px 14px 0">
      But the fight burned away most of the powers — and the world never stays safe for long.
      A new Homelander will rise. ${p.first}'s descendants must gather the powers once more.
      Life goes on; there are still careers to build, families to raise, and a legacy to leave.
    </p>
    <button class="btn" id="vicClose" style="margin-top:14px;background:linear-gradient(90deg,var(--blood),var(--gold));color:#1a1208">Carry on the bloodline</button>
  </div>`;
  root.appendChild(scrim);
  const btn=scrim.querySelector('#vicClose'); if(btn) btn.onclick=()=>{ scrim.remove(); render(); };
}
function openHistory(p){
  closeSheet();
  let html=`<div class="grab"></div><h3>${p.first}'s life so far</h3><p class="hint">Everything that's happened, year by year.</p>`;
  const log=p.log||[];
  if(!log.length){ html+=`<p class="hint">Nothing recorded yet.</p>`; sheet(html); return; }
  // group by age, then show season-tagged entries within
  const byAge={};
  log.forEach(e=>{ const a=(e.age!=null?e.age:0); (byAge[a]=byAge[a]||[]).push(e); });
  const ages=Object.keys(byAge).map(Number).sort((a,b)=>b-a); // newest first
  html+=`<div style="padding:0 18px 8px">`;
  ages.forEach(a=>{
    html+=`<div style="font-variant:small-caps;letter-spacing:2px;color:var(--gold);font-size:13px;margin:14px 0 8px;border-bottom:1px solid rgba(217,164,65,.18);padding-bottom:5px">Age ${a}</div>`;
    byAge[a].forEach(e=>{
      const kindCol = e.k==='bad'||e.k==='death'?'var(--blood)':e.k==='big'||e.k==='birth'?'var(--gold)':'var(--ink)';
      const season = e.q!=null && SEASONS[e.q] ? `<span style="color:var(--ink-faint);font-size:10.5px">${SEASONS[e.q].slice(0,3)} · </span>`:'';
      html+=`<div style="font-size:13.5px;line-height:1.5;margin-bottom:7px;color:${kindCol}">${season}${e.t}</div>`;
    });
  });
  html+=`</div>`;
  sheet(html);
}
function openWorldHistory(){
  closeSheet();
  let html=`<div class="grab"></div><h3>The world your line has shaped</h3><p class="hint">Deeds remembered across the generations.</p><div style="padding:0 18px 10px">`;
  const w=(G.world||[]).slice().reverse();
  if(!w.length){ html+=`<p class="hint">The world is quiet, for now.</p>`; }
  w.forEach(e=>{ html+=`<div style="font-size:13.5px;line-height:1.5;margin-bottom:9px"><span style="color:var(--gold);font-size:11px">${e.year} · ${e.by}</span><br>${e.text}</div>`; });
  html+=`</div>`;
  sheet(html);
}
function openRename(p){
  closeSheet();
  root.innerHTML=`
  <div class="scrim center">
    <div class="cmodal">
      <h2>Change name</h2>
      <p>Legally change ${p.first}'s name. Children born after will take the new surname.</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input class="txt" id="rf" value="${p.first}" placeholder="First" style="margin-top:0">
        <input class="txt" id="rl" value="${p.last}" placeholder="Last" style="margin-top:0">
      </div>
      <button class="btn gold" id="rsave">Save</button>
      <button class="btn ghost" id="rcancel">Cancel</button>
    </div>
  </div>`;
  $('#rsave').onclick=()=>{
    const nf=($('#rf').value||'').trim()||p.first, nl=($('#rl').value||'').trim()||p.last;
    p.first=nf; p.last=nl; root.innerHTML=''; log(`Name changed to ${nf} ${nl}.`,'muted'); render();
  };
  $('#rcancel').onclick=()=>{ root.innerHTML=''; };
}
// Rename a relationship entry (partner, child, friend, sibling). Updates the linked person if any.
function openRenameRel(p, r){
  closeSheet();
  const parts=(r.name||'').split(' ');
  const cf=parts[0]||'', cl=parts.slice(1).join(' ')||'';
  root.innerHTML=`
  <div class="scrim center">
    <div class="cmodal">
      <h2>Rename ${r.kind.toLowerCase()}</h2>
      <p>Edit how this person is named in ${p.first}'s life.</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input class="txt" id="nf" value="${cf}" placeholder="First" style="margin-top:0">
        <input class="txt" id="nl" value="${cl}" placeholder="Last" style="margin-top:0">
      </div>
      <button class="btn gold" id="nsave">Save</button>
      <button class="btn ghost" id="ncancel">Cancel</button>
    </div>
  </div>`;
  $('#nsave').onclick=()=>{
    const nf=($('#nf').value||'').trim()||cf, nl=($('#nl').value||'').trim()||cl;
    const full=(nf+' '+nl).trim();
    r.name=full;
    // if this relationship links to a real person in the world, update them too
    if(r.id!=null){ const linked=findP(G,r.id); if(linked){ linked.first=nf; if(nl)linked.last=nl; } }
    root.innerHTML=''; render();
  };
  $('#ncancel').onclick=()=>{ root.innerHTML=''; render(); };
}
// When a child is born, let the player name them and pick a surname.
function openNameChild(parent, child, otherLast, cb){
  const sx=child.sex;
  const partnerLast = otherLast && otherLast!==parent.last ? otherLast : null;
  root.innerHTML=`
  <div class="scrim center">
    <div class="cmodal">
      <div style="text-align:center;font-size:38px;margin-bottom:4px">${sx==='f'?'👶':'👶'}</div>
      <h2 style="text-align:center">A child is born</h2>
      <p style="text-align:center">Name ${parent.first}'s ${sx==='f'?'daughter':'son'}.</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input class="txt" id="cf" value="${child.first}" placeholder="First name" style="margin-top:0">
      </div>
      <div style="margin-top:10px;font-size:12px;color:var(--ink-dim)">Surname</div>
      <div id="lastpick" style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
        <button class="btn ghost lastopt sel" data-l="${parent.last}" style="margin-top:0;flex:1;border-color:var(--gold)">${parent.last}<br><span style="font-size:10px;color:var(--ink-dim)">your name</span></button>
        ${partnerLast?`<button class="btn ghost lastopt" data-l="${partnerLast}" style="margin-top:0;flex:1">${partnerLast}<br><span style="font-size:10px;color:var(--ink-dim)">partner's name</span></button>`:''}
        ${partnerLast?`<button class="btn ghost lastopt" data-l="${parent.last}-${partnerLast}" style="margin-top:0;flex:1">${parent.last}-${partnerLast}<br><span style="font-size:10px;color:var(--ink-dim)">hyphenated</span></button>`:''}
      </div>
      <button class="btn gold" id="cdone" style="margin-top:12px">Welcome them</button>
    </div>
  </div>`;
  let chosenLast=parent.last;
  root.querySelectorAll('.lastopt').forEach(b=>{ b.onclick=()=>{ chosenLast=b.dataset.l; root.querySelectorAll('.lastopt').forEach(x=>{x.classList.remove('sel');x.style.borderColor='var(--line)';}); b.classList.add('sel'); b.style.borderColor='var(--gold)'; }; });
  $('#cdone').onclick=()=>{
    const nf=($('#cf').value||'').trim()||child.first;
    child.first=nf; child.last=chosenLast;
    // update the relationship entry on the parent
    const rel=parent.rels.find(r=>r.id===child.id); if(rel) rel.name=child.first+' '+child.last;
    root.innerHTML='';
    if(cb)cb();
    render();
  };
}

