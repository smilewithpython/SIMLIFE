"use strict";
/* Threadbare · split module: 12-chains-career.js  (lines 4141–4484 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   PART 4 — CAREER-SPECIFIC CHAINS
   Appends to CHOICE_EVENTS. Reuses helpers from earlier blocks.
   Gating: ladder & staged careers both expose the current stage as p.jobTitle.
   Flag prefix: cc_  (career chain). No collisions with ch_ flags.
   ============================================================ */

function inCareer(p,k){ return p.alive && p.job===k; }
function atStage(p){ const titles=[].slice.call(arguments,1); return titles.includes(p.jobTitle); }
function statCheck(p,stat,base){ base=base==null?50:base; const v=(p.stats&&p.stats[stat]!=null)?p.stats[stat]:50; return chance(clamp(base+(v-50)*0.8,5,92)); }

const CHAIN_EVENTS_P4 = [

  // ============================================================
  // POLICE OFFICER
  // ============================================================
  // The Partner Problem (CHAIN-LONG)
  { id:'cc_cop_partner_b1', emoji:'🚓', title:'The Partner Problem', once:true,
    when:p=>inCareer(p,'cop')&&atStage(p,'Detective','Sergeant','Lieutenant')&&!hasFlag(p,'cc_partner'), weight:3.5,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); setFlag(p,'cc_partnerName',nm); return `${p.first}'s partner, ${nm}, crosses a line on duty — plants something, pockets something, uses a fist that wasn't needed. ${p.first} sees it. Clearly. No ambiguity to hide behind.`; },
    choices:[
      {label:'Report it through channels', sub:'by the book', effect:p=>{ setFlag(p,'cc_partner','reported'); fx(p,{stress:12}); return `${p.first} filed it. Internal affairs is involved now, and the precinct already feels colder. The right thing rarely feels good.`; }},
      {label:'Confront them privately first', sub:'give a chance', effect:p=>{ setFlag(p,'cc_partner','confronted'); fx(p,{stress:8}); return `${p.first} pulled ${p.flags.cc_partnerName} aside. A promise to stop, eyes that wouldn't quite meet. Whether it holds is another day's question.`; }},
      {label:'Look the other way', sub:'loyalty over law', effect:p=>{ setFlag(p,'cc_partner','ignored'); fx(p,{happy:-4,stress:6}); return `${p.first} saw nothing, said nothing. The blue wall holds — and a small weight settles in that doesn't lift. You've looked away once now. That changes the next time.`; }},
    ]},
  // Beat 2 — branches on what was chosen
  { id:'cc_cop_partner_b2', emoji:'🚔', title:'The Partner Problem Deepens', once:true,
    when:p=>inCareer(p,'cop')&&hasFlag(p,'cc_partner')&&!hasFlag(p,'cc_partnerResolved'), weight:5,
    body:p=>{ const m=p.flags.cc_partner; const nm=p.flags.cc_partnerName||'your partner'; return m==='reported'?`The investigation into ${nm} reaches its verdict — and the precinct is watching to see what it does to ${p.first}, the one who talked.`: m==='confronted'?`${capFirst(nm)} either kept the promise or didn't. ${p.first} is about to find out which.`:`It happened again. Worse this time. And ${p.first} already looked away once — so silence now isn't a first choice, it's a pattern.`; },
    choices:[
      {label:'Stand by the decision', sub:'hold the line', effect:p=>{ const m=p.flags.cc_partner; setFlag(p,'cc_partnerResolved',true); if(m==='reported'){ if(chance(55)){ setFlag(p,'cc_partnerFate','ended'); fx(p,{fame:3,stress:6}); return `${p.flags.cc_partnerName} was forced out. Some colleagues respect ${p.first} for it; others will never trust a rat. ${p.first}'s career survived, marked but intact.`;} fx(p,{happy:-6,stress:10}); setFlag(p,'cc_partnerFate','protected'); return `The case collapsed and ${p.flags.cc_partnerName} walked. Now ${p.first} is the one who looks bad for trying. The system protected its own.`; } if(m==='confronted'){ if(chance(50)){ setFlag(p,'cc_partnerFate','reformed'); fx(p,{happy:6}); return `${p.flags.cc_partnerName} actually straightened out. ${p.first}'s quiet faith paid off — a partner saved instead of burned.`;} setFlag(p,'cc_partnerFate','betrayed'); fx(p,{stress:12,happy:-6}); return `The promise was a lie. ${capFirst(p.flags.cc_partnerName)} did it again and ${p.first}'s silence now makes them part of it.`; } setFlag(p,'cc_partnerFate','complicit'); fx(p,{stress:14,happy:-8}); addTrait(p,'pessimist',true); return `${p.first} stayed quiet a second time. The wall holds, the weight doubles, and something in ${p.first} hardens to carry it.`; }},
      {label:'Change course now', sub:'too costly to continue', effect:p=>{ setFlag(p,'cc_partnerResolved',true); setFlag(p,'cc_partnerFate','ended'); fx(p,{stress:10,happy:-2}); return `${p.first} reversed course — reported what they'd buried, or pulled support they'd given. ${capFirst(p.flags.cc_partnerName||'The partner')} is gone now, and the betrayal between them is permanent. But ${p.first} can sleep.`; }},
    ]},
  // Echo — at Chief stage, what you lived shapes your policy
  { id:'cc_cop_chief_policy', emoji:'🎖️', title:'The Kind of Chief You Are', once:true,
    when:p=>inCareer(p,'cop')&&atStage(p,'Chief')&&hasFlag(p,'cc_partnerFate'), weight:4,
    body:p=>`${p.first} runs the department now, and a policy lands on the desk — oversight, accountability, how hard to police your own. What ${p.first} lived through as a younger cop is suddenly not abstract.`,
    choices:[
      {label:'Build real accountability', sub:'+integrity, -loyalty', effect:p=>{ const f=p.flags.cc_partnerFate; fx(p,{fame:6,stress:6}); if(f==='complicit'||f==='protected'){ fx(p,{happy:8}); return `${p.first} built the oversight they once wished had existed — the kind that might have saved them from looking away. The rank and file grumble; ${p.first} sleeps better than they have in decades.`;} return `${p.first} made accountability real. Some call it betrayal of the badge; ${p.first} calls it the badge meaning something.`; }},
      {label:'Protect the rank and file', sub:'+loyalty, -reform', effect:p=>{ fx(p,{happy:4,fame:-2}); return `${p.first} shielded their officers, the way the wall once shielded them. The department is fiercely loyal — and exactly as it always was, for better and worse.`; }},
    ]},
  // The Corruption Offer (CHAIN-SHORT)
  { id:'cc_cop_corrupt_b1', emoji:'💰', title:'The Corruption Offer', once:true,
    when:p=>inCareer(p,'cop')&&!hasFlag(p,'cc_corrupt'), weight:3,
    body:p=>`Someone with money and a problem finds ${p.first} off the clock. A clean solution, a thick envelope, a quiet understanding. Nobody would ever know. The first one's always the easiest to take.`,
    choices:[
      {label:'Take it', sub:'+$, +heat', effect:p=>{ setFlag(p,'cc_corrupt','took'); const amt=15000+rnd(40000); fx(p,{money:amt,stress:8,happy:2}); p.heat=(p.heat||0)+8; return `${p.first} took the envelope — ${money(amt)} for looking the other way. Easy money. The kind that asks for a second favor later.`; }},
      {label:'Refuse it', sub:'clean', effect:p=>{ setFlag(p,'cc_corrupt','refused'); fx(p,{stress:4,happy:2}); return `${p.first} turned it down flat. They didn't like being told no — and people like that don't ask just once.`; }},
      {label:'Report it', sub:'gamble', effect:p=>{ setFlag(p,'cc_corrupt','reported'); if(chance(55)){ fx(p,{fame:5,happy:4}); return `${p.first} reported the approach and helped build a case. Commendation, and the right people noticed.`;} fx(p,{stress:12,happy:-4}); return `${p.first} reported it — but the wrong people were watching, and the wrong people are now annoyed. This may cost more than it earned.`; }},
    ]},
  // Beat 2 — the second offer / retaliation
  { id:'cc_cop_corrupt_b2', emoji:'🩻', title:'They Come Back', once:true,
    when:p=>inCareer(p,'cop')&&(p.flags.cc_corrupt==='took'||p.flags.cc_corrupt==='refused')&&!hasFlag(p,'cc_corruptResolved'), weight:4.5,
    body:p=>p.flags.cc_corrupt==='took'?`The envelope people are back, and the ask is bigger — more money, more compromised. Each yes makes the next one harder to refuse. ${p.first} is in deeper than the first envelope looked.`:`${p.first} said no, and now there's a price for it. A rumor, a complaint, a sudden problem at work. They're trying to make refusing hurt.`,
    choices:[
      {label:'Take the bigger deal', sub:'in too deep', need:p=>p.flags.cc_corrupt==='took', effect:p=>{ setFlag(p,'cc_corruptResolved',true); setFlag(p,'cc_dirty',true); const amt=40000+rnd(120000); fx(p,{money:amt,stress:14}); p.heat=(p.heat||0)+18; if(chance(25)){ p.record.push('Corruption (under investigation)'); } return `${p.first} took the bigger envelope — ${money(amt)} — and crossed from a cop who slipped to a cop who's bought. There's no clean way back from here.`; }},
      {label:'Cut it off now', sub:'pull out, -$', need:p=>p.flags.cc_corrupt==='took', effect:p=>{ setFlag(p,'cc_corruptResolved',true); fx(p,{stress:16,money:-(5000+rnd(15000))}); if(chance(40)){ p.heat=(p.heat||0)+10; return `${p.first} tried to walk away — and people who buy cops don't like loose ends. The threat of exposure now hangs over everything. But ${p.first} stopped.`;} return `${p.first} got out before it swallowed them whole. A frightening few months, a debt paid in fear, and a hard line finally held.`; }},
      {label:'Stand firm against the pressure', sub:'endure', need:p=>p.flags.cc_corrupt==='refused', effect:p=>{ setFlag(p,'cc_corruptResolved',true); if(chance(55)){ fx(p,{fame:4,happy:6}); return `${p.first} weathered the campaign against them and came out clean. The pressure broke before ${p.first} did.`;} fx(p,{stress:14,happy:-6,fame:-3}); return `The trouble they stirred up stuck. ${capFirst(p.first)} kept their integrity and paid for it with their reputation. Sometimes that's the actual price of no.`; }},
      {label:'Report the whole thing now', sub:'blow it open', effect:p=>{ setFlag(p,'cc_corruptResolved',true); if(chance(50)){ fx(p,{fame:8,stress:8}); return `${p.first} took it all to the people who could act. It got ugly and public — but the arrangement came apart, and ${p.first} was on the right side of it.`;} fx(p,{stress:16,happy:-6}); return `${p.first} blew the whistle and it rebounded — they protect their own, these networks. The truth's out but so is ${p.first}, exposed and alone with it.`; }},
    ]},

  // ============================================================
  // MILITARY
  // ============================================================
  // The Order (CHAIN-SHORT)
  { id:'cc_mil_order', emoji:'🎖', title:'The Order', once:true,
    when:p=>inCareer(p,'soldier')&&atStage(p,'Lieutenant','Major','Captain','Colonel')&&!hasFlag(p,'cc_order'), weight:3.5,
    body:p=>`An order comes down that ${p.first} believes is wrong. Not illegal — wrong. The cost of carrying it out will fall on people ${p.first} will never meet, in a place ${p.first} will never see.`,
    choices:[
      {label:'Follow the order', sub:'duty, and a weight', effect:p=>{ setFlag(p,'cc_order','followed'); fx(p,{stress:14,happy:-4}); return `${p.first} followed the order. The career is safe and the chain of command intact. The weight of it rides home with ${p.first} and unpacks slowly, over years.`; }},
      {label:'Refuse it', sub:'reprimand, principle', effect:p=>{ setFlag(p,'cc_order','refused'); fx(p,{happy:2,stress:10,fame:-3}); addTrait(p,'brave',true); return `${p.first} refused. A formal reprimand, a career suddenly moving uphill against the wind. But ${p.first} can name the thing they wouldn't do — and that's worth something the army can't take back.`; }},
      {label:'Find a third way', sub:'smarts check', effect:p=>{ setFlag(p,'cc_order','thirdway'); if(statCheck(p,'smarts',48)){ fx(p,{smarts:5,fame:4,happy:4}); return `${p.first} threaded the needle — carried out the letter of the order while quietly gutting the part that would have done the harm. Nobody could prove it. Everybody half-knew.`;} fx(p,{stress:16,happy:-6}); return `${p.first} tried to be clever and it backfired — neither obeyed nor refused, just exposed. Now both the brass and ${p.first}'s conscience are unsatisfied.`; }},
    ]},
  // Coming Home (CHAIN-LONG)
  { id:'cc_mil_home_b1', emoji:'🏡', title:'Coming Home', once:true,
    when:p=>inCareer(p,'soldier')&&p.age>=24&&p.age<=42&&!hasFlag(p,'cc_home'), weight:3,
    body:p=>{ const sp=aliveSpouse(p); return `${p.first} comes back from a deployment. ${sp?`${fname(sp)} is at the gate, but the homecoming feels stranger than expected — `:`The house is quiet, and `}home doesn't quite fit the way it did. Something shifted over there.`; },
    choices:[
      {label:'Lean on the people who waited', sub:'+connection', effect:p=>{ setFlag(p,'cc_home','connected'); const sp=aliveSpouse(p); if(sp)sp.bond=clamp(sp.bond+12); fx(p,{happy:8,stress:-6}); return `${p.first} let the people who waited carry some of the weight. It didn't fix everything, but it kept ${p.first} tethered to the life they came back to.`; }},
      {label:'Throw yourself into work', sub:'avoid the gap', effect:p=>{ setFlag(p,'cc_home','buried'); fx(p,{stress:8,happy:-2}); return `${p.first} buried the strangeness under work and routine. Functional. The gap between who left and who came back just sat there, patient, unaddressed.`; }},
      {label:'Try to talk about what changed', sub:'hard, honest', effect:p=>{ setFlag(p,'cc_home','processing'); if(chance(55)){ fx(p,{happy:6,stress:-4}); return `${p.first} found the words, or some of them, and someone who could hear them. The thing that changed got a little lighter for being named.`;} fx(p,{happy:-3,stress:4}); return `${p.first} tried to explain and watched it not land. Some things you bring back can't be handed to anyone who wasn't there.`; }},
    ]},
  // Beat 3 — cumulative weight, PTSD at 40-50
  { id:'cc_mil_ptsd', emoji:'🌫️', title:'The Weight of the Tours', once:true,
    when:p=>p.age>=40&&p.age<=52&&hasFlag(p,'cc_home')&&(p.flags.cc_home==='buried'||p.flags.cc_order==='followed')&&!hasFlag(p,'cc_ptsdDone'), weight:4.5,
    body:p=>`Years of it have stacked up in ${p.first} — the tours, the orders, the things carried home and never set down. It's surfacing now in the sleep, the startle, the distance. This is the moment it asks to be dealt with.`,
    choices:[
      {label:'Get real help', sub:'+late-life health', effect:p=>{ setFlag(p,'cc_ptsdDone',true); fx(p,{health:8,happy:10,stress:-16}); return `${p.first} finally got help — therapy, the hard work of unpacking it. It didn't erase anything, but it changed the trajectory of the years ahead. ${capFirst(p.first)} gets to grow old, not just get old.`; }},
      {label:'Carry it like always', sub:'-late-life health', effect:p=>{ setFlag(p,'cc_ptsdDone',true); setFlag(p,'ch_carriesWeight',true); fx(p,{health:-10,happy:-8,stress:12}); addTrait(p,'anxious',true); return `${p.first} did what soldiers do and carried it. The body keeps the score, though — and the late years will be harder for everything that never got set down.`; }},
    ]},

  // ============================================================
  // CORPORATE / CEO
  // ============================================================
  // The Whistleblower (CHAIN-LONG)
  { id:'cc_corp_whistle_b1', emoji:'🏢', title:'The Whistleblower', once:true,
    when:p=>inCareer(p,'corporate')&&atStage(p,'Manager','VP')&&!hasFlag(p,'cc_whistle'), weight:3.5,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); setFlag(p,'cc_whistleName',nm); const t=pick(['fraud in the numbers','a safety violation they buried','a pattern of discrimination']); setFlag(p,'cc_whistleType',t); return `${nm}, someone on ${p.first}'s team, comes in pale and quiet with evidence of something serious — ${t}. It's real, it's documented, and now ${p.first} is holding it.`; },
    choices:[
      {label:'Protect them and report it up', sub:'career risk', effect:p=>{ setFlag(p,'cc_whistle','reported'); fx(p,{stress:14,happy:2}); return `${p.first} took it up the chain and shielded ${p.flags.cc_whistleName} doing it. The company is now deciding what to do about both of them. Doing right just painted a target on ${p.first}'s back.`; }},
      {label:'Protect them, but bury it', sub:'they trusted you', effect:p=>{ setFlag(p,'cc_whistle','buried'); fx(p,{stress:10,happy:-4}); return `${p.first} kept ${p.flags.cc_whistleName} safe but made the evidence disappear. They trusted ${p.first} with it. That trust is now a quiet thing ${p.first} carries and they'll eventually leave, knowing.`; }},
      {label:'Sacrifice them', sub:'career safe, for now', effect:p=>{ setFlag(p,'cc_whistle','sacrificed'); fx(p,{happy:-8,fame:2}); return `${p.first} let ${p.flags.cc_whistleName} take the fall and the problem stay buried. The career is preserved. The thing itself is still in there, growing, waiting for a worse day.`; }},
      {label:'Go public together', sub:'destroyed or defined', effect:p=>{ setFlag(p,'cc_whistle','public'); if(chance(45)){ fx(p,{fame:12,money:-(10000+rnd(30000)),stress:14}); setFlag(p,'cc_whistleHero',true); return `${p.first} and ${p.flags.cc_whistleName} took it to the press. The career as ${p.first} knew it is over — and a different, harder-won reputation begins. History will call this brave.`;} fx(p,{fame:-6,happy:-10,stress:16}); return `They went public and the company's machine ground them both down — discredited, sidelined, the story spun. Sometimes the truth loses the first round badly.`; }},
    ]},
  // Beat 2 — at CEO stage, a buried thing explodes
  { id:'cc_corp_whistle_explode', emoji:'💥', title:'It Surfaces at the Top', once:true,
    when:p=>inCareer(p,'corporate')&&atStage(p,'CEO')&&(p.flags.cc_whistle==='sacrificed'||p.flags.cc_whistle==='buried')&&!hasFlag(p,'cc_whistleBoom'), weight:5,
    body:p=>`${p.first} made it to the top — and the thing buried years ago has clawed its way to the surface at the worst possible moment, now with ${p.first}'s name on the chain of command that hid it.`,
    choices:[
      {label:'Take responsibility now', sub:'+integrity, -position', effect:p=>{ setFlag(p,'cc_whistleBoom',true); fx(p,{happy:6,fame:-4,money:-(20000+rnd(80000)),stress:12}); return `${p.first} owned it from the top chair — a late, costly honesty. The position may not survive it, but ${p.first} stopped running from a decision made decades ago.`; }},
      {label:'Bury it again, harder', sub:'cold, risky', effect:p=>{ setFlag(p,'cc_whistleBoom',true); if(chance(50)){ fx(p,{stress:16,money:-(30000+rnd(100000))}); return `${p.first} spent money and power to make it vanish a second time. It worked. The weight of two burials, though, doesn't divide — it multiplies.`;} fx(p,{fame:-15,happy:-12,stress:18}); p.record.push('Corporate cover-up'); return `The second burial collapsed and took ${p.first}'s name with it. The cover-up is the story now, bigger than the original sin ever was.`; }},
    ]},
  // The Merger (CHAIN-SHORT)
  { id:'cc_corp_merger', emoji:'🤝', title:'The Merger', once:true,
    when:p=>inCareer(p,'corporate')&&atStage(p,'CEO')&&!hasFlag(p,'cc_merger'), weight:3.5,
    body:p=>`A hostile takeover bid lands on ${p.first}'s desk. ${p.first} can fight it, facilitate it for a fortune, or try to find a third path that protects the people who built this place.`,
    choices:[
      {label:'Fight it', sub:'-health, +loyalty', effect:p=>{ if(chance(55)){ setFlag(p,'cc_merger','fought_won'); fx(p,{health:-8,stress:16,fame:6}); return `${p.first} fought the raid off. The company survives, independent — and ${p.first} paid for it in sleep, stress, and a few years off the back end of life.`;} setFlag(p,'cc_merger','fought_lost'); fx(p,{health:-6,stress:14,happy:-6}); return `${p.first} fought and lost. The company changes hands and changes shape; some of the people ${p.first} tried to protect are already clearing their desks.`; }},
      {label:'Facilitate it', sub:'+fortune, -people', effect:p=>{ setFlag(p,'cc_merger','facilitated'); const amt=2000000+rnd(20000000); fx(p,{money:amt,happy:-4,fame:-2}); setFlag(p,'cc_mergerSoldout',true); return `${p.first} greased the deal and walked away ${money(amt)} richer. Hundreds of jobs went with it. That tradeoff will follow ${p.first}'s name.`; }},
      {label:'Find a third option', sub:'smarts + charm check', effect:p=>{ if(statCheck(p,'smarts',40)&&statCheck(p,'charming',42)){ setFlag(p,'cc_merger','restructured'); const amt=500000+rnd(4000000); fx(p,{money:amt,fame:8,happy:8}); return `${p.first} engineered a restructuring that protected the key people and still generated fair value — ${money(amt)} and the rare clean conscience of a CEO. The hardest path, walked well.`;} setFlag(p,'cc_merger','fought_lost'); fx(p,{stress:14,happy:-6}); return `${p.first} reached for the elegant solution and couldn't quite close it. The deal slipped into a worse shape than if ${p.first} had simply picked a side.`; }},
    ]},

  // ============================================================
  // ORGANIZED CRIME
  // ============================================================
  // The Snitch (CHAIN-LONG)
  { id:'cc_crime_snitch_b1', emoji:'🕴', title:'The Snitch', once:true,
    when:p=>inCareer(p,'crimelord')&&atStage(p,'Crew Leader','Underboss')&&!hasFlag(p,'cc_snitch'), weight:3.5,
    body:p=>`There's a leak in ${p.first}'s organization. Someone is talking to law enforcement. The crew is nervous, the walls feel thin, and the wrong move now — in either direction — gets people hurt.`,
    choices:[
      {label:'Find out who, for certain', sub:'patient, costly', effect:p=>{ setFlag(p,'cc_snitch','investigate'); setFlag(p,'cc_snitchRight',true); fx(p,{stress:12,smarts:3}); return `${p.first} worked it quietly and carefully until the truth was solid. It took time and nerve, but ${p.first} knows exactly who — no guessing, no innocent blood.`; }},
      {label:'Act on suspicion now', sub:'fast, dangerous', effect:p=>{ setFlag(p,'cc_snitch','suspicion'); setFlag(p,'cc_snitchRight', chance(50)); fx(p,{stress:14}); p.heat=(p.heat||0)+10; return `${p.first} moved on a hunch rather than wait. Decisive — and a coin-flip on whether the hunch was right. The crew watches to see what kind of boss ${p.first} is.`; }},
      {label:'Assume it\'s one specific person', sub:'may be wrong', effect:p=>{ setFlag(p,'cc_snitch','assumed'); setFlag(p,'cc_snitchRight', chance(35)); fx(p,{stress:10}); return `${p.first} fixed on a name and committed to it. Conviction without proof is its own kind of dangerous — for ${p.first}, and for whoever's name it landed on.`; }},
    ]},
  // Beat 2 — right person vs wrong person
  { id:'cc_crime_snitch_b2', emoji:'🎯', title:'The Leak, Confronted', once:true,
    when:p=>inCareer(p,'crimelord')&&hasFlag(p,'cc_snitch')&&!hasFlag(p,'cc_snitchResolved'), weight:5,
    body:p=>p.flags.cc_snitchRight?`${p.first} has the right person — the actual leak, cornered. Now comes the question of what to do with that, and there are more options here than the obvious, ugly one.`:`${p.first} moved on the wrong person. An innocent member of ${p.first}'s own crew now has reason to hate — or fear — ${p.first}. And the real leak is still out there, listening, learning.`,
    choices:[
      {label:'Handle it the quiet way', sub:'no blood', need:p=>p.flags.cc_snitchRight, effect:p=>{ setFlag(p,'cc_snitchResolved',true); setFlag(p,'cc_snitchClean',true); fx(p,{smarts:4,stress:6}); return `${p.first} fed the leak false information and turned them into a tool against the people they were feeding. Smarter than a body, and far quieter. The threat is neutralized.`; }},
      {label:'Make an example', sub:'brutal, effective', need:p=>p.flags.cc_snitchRight, effect:p=>{ setFlag(p,'cc_snitchResolved',true); p.record.push('Violent crime'); fx(p,{happy:-8,stress:10}); p.heat=(p.heat||0)+20; addTrait(p,'hot_temper',true); return `${p.first} made it loud and final. The crew falls into line out of fear now, not loyalty — and the heat from it will linger. A line crossed that doesn't uncross.`; }},
      {label:'Try to fix the wrong you did', sub:'damage control', need:p=>!p.flags.cc_snitchRight, effect:p=>{ setFlag(p,'cc_snitchResolved',true); if(chance(45)){ fx(p,{happy:2,stress:8}); return `${p.first} made amends to the one they'd wrongly accused — bought back some trust, barely. But the real leak used the chaos and is still bleeding ${p.first}'s crew.`;} fx(p,{stress:16,happy:-8}); p.heat=(p.heat||0)+14; return `The wronged member didn't forgive, and now ${p.first} has an enemy inside the walls AND an informant still loose. The worst of both.`; }},
      {label:'Double down on the wrong target', sub:'dig deeper', need:p=>!p.flags.cc_snitchRight, effect:p=>{ setFlag(p,'cc_snitchResolved',true); p.record.push('Violent crime'); fx(p,{happy:-12,stress:14}); p.heat=(p.heat||0)+24; return `${p.first} committed to the wrong call and made it permanent. An innocent paid, the real leak walked, and the crew learned that being right doesn't protect you around ${p.first}. Rot sets in.`; }},
    ]},
  // Beat 3 — the leak's consequences → arrest or Kingpin
  { id:'cc_crime_snitch_b3', emoji:'⛓️', title:'What the Leak Cost', once:true,
    when:p=>inCareer(p,'crimelord')&&hasFlag(p,'cc_snitchResolved')&&!hasFlag(p,'cc_snitchEnd'), weight:4.5,
    body:p=>`The dust settles on the leak. Either the damage was contained, or it reached far enough to put a target on ${p.first} — the kind law enforcement builds a case around.`,
    choices:[
      {label:'See where it lands', sub:'the reckoning', effect:p=>{ setFlag(p,'cc_snitchEnd',true); const exposed = !p.flags.cc_snitchClean && ((p.heat||0)>30 || chance(40)); if(exposed){ fx(p,{stress:18,happy:-10}); p.inPrison=true; p.record.push('Racketeering'); return `The leak reached far enough. The indictment comes down and the cuffs follow — ${p.first} is going away, and the empire will have to run itself or crumble. The cost is paid in years.`;} fx(p,{fame:6,happy:4,stress:-6}); setFlag(p,'cc_kingpinReady',true); return `${p.first} contained it — barely, and not cleanly, but contained. The path to the top is open now, with this on the ledger. Kingpins are made by exactly these nights.`; }},
    ]},
  // The Out (CHAIN-LONG)
  { id:'cc_crime_out_b1', emoji:'🚪', title:'The Out', once:true,
    when:p=>inCareer(p,'crimelord')&&!hasFlag(p,'cc_out'), weight:1.6,
    body:p=>`A real one comes along — a legitimate business, a clean buyout, an actual door out of the life. ${p.first} could walk into a normal life from here. The only catch is that nobody just walks out.`,
    choices:[
      {label:'Take the out', sub:'freedom isn\'t free', effect:p=>{ setFlag(p,'cc_out','taking'); fx(p,{happy:8,stress:10}); return `${p.first} reached for the clean life. It felt like air. But former associates already have opinions, and the past doesn't sign release forms. The hard part starts now.`; }},
      {label:'Refuse — this is who you are', sub:'the door closes', effect:p=>{ setFlag(p,'cc_out','refused'); fx(p,{happy:-2,fame:2}); return `${p.first} let the door close. This is the life ${p.first} chose, eyes open. The chance won't come knocking twice.`; }},
      {label:'Negotiate — money AND protection', sub:'harder than it sounds', effect:p=>{ if(statCheck(p,'smarts',38)&&statCheck(p,'charming',40)){ setFlag(p,'cc_out','negotiated'); const amt=200000+rnd(2000000); fx(p,{money:amt,happy:6,stress:6}); return `${p.first} threaded it — took the buyout AND the assurances, walking out rich and shielded. ${money(amt)} and a life. Almost nobody pulls this off.`;} setFlag(p,'cc_out','taking'); fx(p,{stress:14}); return `${p.first} tried to have it both ways and tipped their hand instead. Now ${p.first} is leaving without the protection they wanted — exposed on the way out.`; }},
    ]},
  // Beat 2 — leaving has consequences
  { id:'cc_crime_out_b2', emoji:'🩸', title:'Nobody Just Walks Out', once:true,
    when:p=>hasFlag(p,'cc_out')&&p.flags.cc_out==='taking'&&!hasFlag(p,'cc_outDone'), weight:5,
    body:p=>`The life ${p.first} is trying to leave isn't done with ${p.first}. The pressure comes — a threat, a debt called in, old eyes watching the new clean office a little too closely.`,
    choices:[
      {label:'Stand firm and stay out', sub:'survive it', effect:p=>{ setFlag(p,'cc_outDone',true); if(chance(55)){ fx(p,{happy:10,stress:-8}); return `${p.first} held the line, took the threats without flinching, and slowly the old life lost interest. The clean life is real now, earned the hard way.`;} fx(p,{health:-12,stress:16,happy:-6}); return `${p.first} got out, but not unmarked — an attempt on their life, a frightening close call, a scar to carry into the quiet years. Free, and reminded what freedom cost.`; }},
      {label:'Get pulled back in', sub:'one last time', effect:p=>{ setFlag(p,'cc_outDone',true); clearFlag(p,'cc_out'); setFlag(p,'cc_out','refused'); fx(p,{happy:-8,fame:2,stress:8}); return `${p.first} couldn't make the break stick — one favor, one job, and the door swung shut behind them again. The life has ${p.first} back. Maybe it always would.`; }},
    ]},

  // ============================================================
  // SURGEON / CHIEF OF SURGERY
  // ============================================================
  // The Error (CHAIN-LONG)
  { id:'cc_surg_error_b1', emoji:'🫀', title:'The Error', once:true,
    when:p=>inCareer(p,'doctor')&&atStage(p,'Doctor','Surgeon')&&!hasFlag(p,'cc_error'), weight:3.5,
    body:p=>`A patient died on ${p.first}'s table — or was badly harmed — and there's no comfortable place to put the blame. It was ${p.first}'s error. A real one. The kind that wakes you at 3am for the rest of your life.`,
    choices:[
      {label:'Report it immediately', sub:'honest, costly', effect:p=>{ setFlag(p,'cc_error','reported'); fx(p,{stress:16,happy:-4}); return `${p.first} reported it the same day, in full. The hospital review is coming and a lawsuit likely — but the family will hear the truth from the person responsible. That matters, even when it costs everything.`; }},
      {label:'Discuss with colleagues first', sub:'complicated', effect:p=>{ setFlag(p,'cc_error','discussed'); fx(p,{stress:12}); return `${p.first} talked to colleagues before deciding. Now the story has other hands on it — some will cover for ${p.first}, some won't, and the truth has gotten more complicated than it was an hour ago.`; }},
      {label:'Document it your way', sub:'spin the record', effect:p=>{ setFlag(p,'cc_error','documented'); fx(p,{stress:14,happy:-2}); return `${p.first} wrote the record to soften the edges. It reads cleaner than it was. Records like that have a way of not surviving a careful second look.`; }},
      {label:'Say nothing', sub:'bury it', effect:p=>{ setFlag(p,'cc_error','silent'); fx(p,{stress:10,happy:-6}); return `${p.first} said nothing and let it pass as one of those things. It's quiet now. The quiet of a thing waiting years to come back and ask why you never spoke.`; }},
    ]},
  // Beat 2 — the review / the reckoning
  { id:'cc_surg_error_b2', emoji:'⚖️', title:'The Error Comes Due', once:true,
    when:p=>inCareer(p,'doctor')&&hasFlag(p,'cc_error')&&!hasFlag(p,'cc_errorDone'), weight:5,
    body:p=>{ const m=p.flags.cc_error; return m==='reported'?`The review and the civil suit land. ${p.first} told the truth, and now lives the consequences of having told it.`: m==='discussed'?`The mixed loyalties of that first conversation come home — some colleagues stood by ${p.first}, some quietly stepped back. The relationships will never be quite the same.`: m==='documented'?`The investigation found the inconsistencies in ${p.first}'s record. The cover is worse than the error now.`:`Years on, the patient's family came back asking questions, and the civil investigation has reopened. The silence is breaking on its own schedule.`; },
    choices:[
      {label:'Face it with full honesty now', sub:'+peace, -career', effect:p=>{ setFlag(p,'cc_errorDone',true); setFlag(p,'cc_errorLegacy','owned'); fx(p,{happy:6,stress:-4,money:-(20000+rnd(60000)),fame:-3}); return `${p.first} stopped managing it and simply told the whole truth. The career took the hit it was always going to take. ${capFirst(p.first)} can finally meet their own eyes in the mirror.`; }},
      {label:'Fight to protect your career', sub:'-peace, maybe -career', effect:p=>{ setFlag(p,'cc_errorDone',true); const m=p.flags.cc_error; if(m==='reported'&&chance(55)){ setFlag(p,'cc_errorLegacy','survived'); fx(p,{stress:12}); return `${p.first} fought the suit and the honest early disclosure helped — a settlement, a sanction, but the career survives. Bruised, standing, watched.`;} setFlag(p,'cc_errorLegacy','stained'); fx(p,{happy:-10,stress:16,money:-(40000+rnd(120000))}); if(m==='documented'||m==='silent') p.record.push('Medical misconduct'); return `${p.first} fought and the fight exposed more than it saved. The error, plus the effort to escape it, is now the permanent shape of ${p.first}'s name in medicine.`; }},
    ]},
  // The Dependency (CHAIN-LONG)
  { id:'cc_surg_depend_b1', emoji:'💊', title:'The Dependency', once:true,
    when:p=>inCareer(p,'doctor')&&atStage(p,'Surgeon','Chief of Surgery')&&!hasFlag(p,'cc_depend'), weight:2.4,
    body:p=>`The hours are inhuman and the access is right there, in a locked cabinet ${p.first} has the key to. It started as just getting through a brutal stretch. It hasn't stayed that.`,
    choices:[
      {label:'Get ahead of it now', sub:'+control', effect:p=>{ setFlag(p,'cc_depend','caught_early'); fx(p,{stress:-6,happy:4,health:4}); return `${p.first} saw the edge before going over it and pulled back — quietly got help, reset the boundaries. A bullet dodged that most don't even see coming.`; }},
      {label:'Tell yourself it\'s under control', sub:'denial', effect:p=>{ setFlag(p,'cc_depend','denial'); if(!p.addictions)p.addictions=[]; fx(p,{stress:6,happy:-2}); return `${p.first} decided it was manageable, a surgeon's prerogative, nothing to worry about. That's the sentence everyone says right before it stops being true.`; }},
    ]},
  // Beat 2 — it affects the work
  { id:'cc_surg_depend_b2', emoji:'🩺', title:'It Reaches the Table', once:true,
    when:p=>inCareer(p,'doctor')&&p.flags.cc_depend==='denial'&&!hasFlag(p,'cc_dependDone'), weight:5,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); p._depColleague=nm; return `It's affecting ${p.first}'s work now — a shaky morning, a missed detail, a patient outcome that shouldn't have happened. A colleague, ${nm}, has noticed. ${p.first} can see them deciding what to do about it.`; },
    choices:[
      {label:'Come clean and seek treatment', sub:'collapse, then recovery', effect:p=>{ setFlag(p,'cc_dependDone',true); setFlag(p,'cc_dependRecovered',true); if(!p.addictions)p.addictions=[]; fx(p,{health:-8,happy:6,stress:-6}); return `${p.first} broke before a patient did — admitted it, went to treatment, faced the suspension. The career nearly ended. But ${p.first} got to keep being a person, and maybe, eventually, a surgeon again.`; }},
      {label:'Hide it harder', sub:'toward collapse', effect:p=>{ setFlag(p,'cc_dependDone',true); if(chance(45)){ fx(p,{health:-14,happy:-12,stress:18}); p.record.push('Lost medical license'); endJob(p,`${p.first} was stripped of their license after a patient was harmed. The fall was total.`); return `${p.first} hid it until a patient paid the price, and then everything came down at once — license, career, the self ${p.first} had built. Rock bottom, arrived at full speed.`;} fx(p,{health:-10,stress:16,happy:-8}); return `${p.first} kept it hidden a while longer through sheer will and luck. The reprieve is temporary; this road has only one destination if nothing changes.`; }},
    ]},

  // ============================================================
  // LAWYER / JUDGE
  // ============================================================
  // The Guilty Client (CHAIN-SHORT)
  { id:'cc_law_guilty', emoji:'⚖️', title:'The Guilty Client', once:true,
    when:p=>inCareer(p,'lawyer')&&atStage(p,'Lawyer','Senior Partner','Partner')&&!hasFlag(p,'cc_guilty'), weight:3.5,
    body:p=>`${p.first} knows this client is guilty. Not "probably" — knows it, cold and certain. They're also paying ${p.first} more than anyone ever has. The defense is ${p.first}'s to mount.`,
    choices:[
      {label:'Defend them fully', sub:'+$, -conscience', effect:p=>{ setFlag(p,'cc_guilty','defended'); const amt=80000+rnd(300000); fx(p,{money:amt,stress:10,happy:-4}); return `${p.first} mounted the full defense, and they walked. ${money(amt)} in the bank and a knowledge ${p.first} can't un-know. Next time the line will be even easier to step over.`; }},
      {label:'Drop the case', sub:'-reputation, +integrity', effect:p=>{ setFlag(p,'cc_guilty','dropped'); fx(p,{happy:4,fame:-3}); return `${p.first} walked away from the money and the client. In certain rooms ${p.first}'s name dimmed for it. ${capFirst(p.first)} can live with those rooms.`; }},
      {label:'Find an ethical path through', sub:'smarts check', effect:p=>{ if(statCheck(p,'smarts',42)){ setFlag(p,'cc_guilty','threaded'); const amt=40000+rnd(120000); fx(p,{money:amt,smarts:5,happy:4}); return `${p.first} gave a zealous defense that stayed inside what's defensible — no active deception, just the system working as designed. The hardest path. ${p.first} walked it clean.`;} fx(p,{stress:14,happy:-4}); setFlag(p,'cc_guilty','defended'); return `${p.first} reached for the principled middle and couldn't find footing — ended up defending fully anyway, just with more anguish along the way.`; }},
      {label:'Expose them', sub:'career risk', effect:p=>{ setFlag(p,'cc_guilty','exposed'); if(chance(45)){ fx(p,{fame:6,happy:2}); return `${p.first} found a clean way to let the truth out, and over time it built a different kind of name — the lawyer who wouldn't bury it. Costly, and worth it.`;} fx(p,{fame:-8,happy:-6,stress:12}); p.record.push('Ethics complaint'); return `${p.first} crossed the client and it came back hard — privilege, ethics boards, a career-threatening complaint. Doing the unthinkable thing is unthinkable for reasons.`; }},
    ]},
  // The Compromised Judge (CHAIN-SHORT)
  { id:'cc_law_judge', emoji:'👨‍⚖️', title:'The Compromised Judge', once:true,
    when:p=>inCareer(p,'lawyer')&&atStage(p,'Judge')&&!hasFlag(p,'cc_cjudge'), weight:3.5,
    body:p=>`Evidence reaches ${p.first} that the judge on a major case has been bought. ${p.first} sits on the bench now too — which makes this a question about what kind of justice ${p.first} actually serves.`,
    choices:[
      {label:'Report it', sub:'+integrity, uncertain', effect:p=>{ setFlag(p,'cc_cjudge','reported'); if(chance(55)){ fx(p,{fame:6,stress:8}); return `${p.first} reported it and the inquiry vindicated the instinct. Everything that judge touched is now in question — and ${p.first}'s name is on the right side of the cleanup.`;} fx(p,{stress:14,happy:-4}); return `${p.first} reported it, but the people doing the buying had longer reach than expected. The inquiry curdled, and now ${p.first} is the one under a cloud.`; }},
      {label:'Use it for your client', sub:'+win, -soul', effect:p=>{ setFlag(p,'cc_cjudge','used'); fx(p,{money:60000+rnd(200000),happy:-6,stress:8}); setFlag(p,'cc_judgeDirty',true); return `${p.first} quietly leveraged the corruption to swing the case. ${p.first}'s client won. And ${p.first} is now part of the exact rot they claimed to stand against. The robe feels heavier.`; }},
      {label:'Ignore it', sub:'look away', effect:p=>{ setFlag(p,'cc_cjudge','ignored'); fx(p,{happy:-4,stress:6}); return `${p.first} let the case proceed and the knowledge sit. Maybe the result was just anyway. Maybe it wasn't, and ${p.first} will never let themselves count the cost.`; }},
    ]},

  // ============================================================
  // MUSICIAN / POP STAR  (the popstar career carries the spec's stages)
  // ============================================================
  // The Sound (CHAIN-LONG)
  { id:'cc_music_sound_b1', emoji:'🎤', title:'The Sound', once:true,
    when:p=>inCareer(p,'popstar')&&atStage(p,'Signed Artist','Charting Single')&&!hasFlag(p,'cc_sound'), weight:3.5,
    body:p=>`${p.first}'s label wants to change the sound — smoother, safer, built for the charts. Commercially it's obvious. Artistically it's a piece of ${p.first} sanded off. The contract says they can push. The choice is how hard ${p.first} pushes back.`,
    choices:[
      {label:'Go with it', sub:'fame now, backlash later', effect:p=>{ setFlag(p,'cc_sound','sold'); fx(p,{fame:14,money:50000+rnd(200000),happy:-2}); return `${p.first} took the label's sound and it worked — a fame spike, money, doors opening. Somewhere a truer version of ${p.first} got quieter. The fans will feel the shift eventually.`; }},
      {label:'Refuse', sub:'slower, yours', effect:p=>{ setFlag(p,'cc_sound','kept'); fx(p,{fame:-3,happy:8,stress:6}); addTrait(p,'creative',true); return `${p.first} held the line on the sound. The label sulked, the rise slowed — but every note still belongs to ${p.first}. That's the kind of thing that defines an icon, if ${p.first} gets there.`; }},
      {label:'Negotiate a partial compromise', sub:'middle road', effect:p=>{ setFlag(p,'cc_sound','compromise'); fx(p,{fame:5,money:20000+rnd(60000)}); return `${p.first} gave a little to keep a lot — a few singles their way, a few the label's way. No disaster, no triumph. The safe middle of an artist's hardest question.`; }},
    ]},
  // Beat 2 — backlash at platinum (if sold) OR identity at icon (if kept)
  { id:'cc_music_sound_b2', emoji:'🎶', title:'The Sound, Years Later', once:true,
    when:p=>inCareer(p,'popstar')&&hasFlag(p,'cc_sound')&&atStage(p,'Platinum Album','Global Pop Icon')&&!hasFlag(p,'cc_soundDone'), weight:5,
    body:p=>p.flags.cc_sound==='sold'?`${p.first} is huge now — and a backlash is brewing. The fans who were there early feel the manufactured shift, and the word "sellout" is in the air. The thing that made ${p.first} big is now the thing fans throw back.`:`${p.first} made it to the top without bending, and the story of that — the artist who wouldn't be sanded down — is now the whole brand. People don't just like the music; they respect the spine behind it.`,
    choices:[
      {label:'Answer the moment honestly', sub:'reckon with it', effect:p=>{ setFlag(p,'cc_soundDone',true); if(p.flags.cc_sound==='sold'){ if(chance(50)){ fx(p,{fame:6,happy:6}); return `${p.first} owned the journey — made a record that reclaimed the early sound, and the fans came home. Redemption arcs sell too, when they're real.`;} fx(p,{fame:-10,happy:-6}); return `${p.first} tried to answer the backlash and it read as more calculation. The authenticity ${p.first} traded away doesn't come back at retail price.`; } fx(p,{fame:10,happy:10}); return `${p.first} leaned all the way into the integrity that built them — and became, for a generation, the proof that you can win without selling the center of yourself. That's a legacy.`; }},
      {label:'Cash in while it lasts', sub:'+$, -respect', effect:p=>{ setFlag(p,'cc_soundDone',true); const amt=200000+rnd(2000000); fx(p,{money:amt,fame:-4,happy:-2}); return `${p.first} stopped fighting the narrative and monetized the fame while it burned bright — ${money(amt)} in the door. The bank account swelled, the respect cooled. ${capFirst(p.first)} made peace with that trade, mostly.`; }},
    ]},
  // The Beef (CHAIN-SHORT) — any fame stage, popstar or musician
  { id:'cc_music_beef', emoji:'🔥', title:'The Beef', once:true,
    when:p=>(inCareer(p,'popstar')&&atStage(p,'Signed Artist','Charting Single','Platinum Album','Global Pop Icon'))||(inCareer(p,'musician')&&(p.stats.fame||0)>35), weight:3,
    body:p=>{ const sx=makeSex(); const nm=newFirst(sx); setFlag(p,'cc_beefName',nm); return `A conflict with another artist, ${nm}, spills into public view — a subtweet, a diss, a rumor, however it started. The internet has its popcorn out. Whatever ${p.first} does next is the story.`; },
    choices:[
      {label:'Engage — go to war', sub:'high variance fame', effect:p=>{ setFlag(p,'cc_beef','engaged'); if(chance(50)){ fx(p,{fame:16,happy:2}); return `${p.first} fired back and won the narrative — the better lines, the crowd's roar. A massive fame spike off ${p.flags.cc_beefName}'s name. Drama is fuel when you come out on top.`;} fx(p,{fame:-12,happy:-8,stress:10}); return `${p.first} swung and missed the read of the room. ${capFirst(p.flags.cc_beefName)} landed the better blows and ${p.first} wore the loss publicly. Beef cuts both ways.`; }},
      {label:'Ignore it', sub:'50/50', effect:p=>{ setFlag(p,'cc_beef','ignored'); if(chance(50)){ fx(p,{happy:4}); return `${p.first} rose above it and it evaporated, the way most noise does when you don't feed it. Dignity intact.`;} fx(p,{fame:-4,happy:-2}); return `${p.first} stayed silent and it festered instead — read as weakness, or guilt. Sometimes the high road just looks like you had nothing to say.`; }},
      {label:'Squash it privately', sub:'+relationship, -spectacle', effect:p=>{ setFlag(p,'cc_beef','squashed'); const f=addContact(p,p.flags.cc_beefName,'Friend',55); fx(p,{fame:-3,happy:6}); return `${p.first} reached out behind the scenes and turned the rival into something like a friend. The fans feel robbed of the bloodsport — but ${p.first} gained a real one in the industry.`; }},
    ]},

  // ============================================================
  // POLITICIAN
  // ============================================================
  // The Vote (CHAIN-SHORT)
  { id:'cc_pol_vote', emoji:'🗳', title:'The Vote', once:true,
    when:p=>inCareer(p,'politician')&&atStage(p,'Councilor','Mayor','Governor','President','Senator')&&!hasFlag(p,'cc_vote'), weight:3.5,
    body:p=>`A major vote is coming. The party wants one thing; ${p.first}'s conscience — and a lot of the people who elected ${p.first} — want the other. There's no abstaining from the consequences, only from the vote itself.`,
    choices:[
      {label:'Vote with the party', sub:'safe, +debt paid', effect:p=>{ setFlag(p,'cc_vote','party'); setFlag(p,'cc_voteAgainstConscience',true); fx(p,{happy:-4,fame:2}); return `${p.first} voted the party line. The leadership owes ${p.first} now, and the career is safe — but the vote sits crosswise to what ${p.first} believes, and those add up on a record that outlives a term.`; }},
      {label:'Vote your conscience', sub:'risk, maybe reward', effect:p=>{ setFlag(p,'cc_vote','conscience'); if(chance(50)){ fx(p,{fame:8,happy:8}); return `${p.first} broke ranks and it landed — the public rallied behind the stand, and ${p.first}'s name grew for having a spine. Independence, rewarded.`;} fx(p,{fame:-5,happy:4,stress:8}); return `${p.first} voted their conscience and the party made ${p.first} pay — committee seats, cold shoulders, a harder road. ${capFirst(p.first)} can name what they stood for. The machine remembers too.`; }},
      {label:'Abstain', sub:'everyone\'s annoyed', effect:p=>{ setFlag(p,'cc_vote','abstain'); fx(p,{happy:-4,fame:-4,stress:6}); return `${p.first} abstained, and managed to disappoint absolutely everyone — the party, the base, the press. The one position with no constituency is the fence.`; }},
    ]},
  // The Assassination Attempt (CHAIN-SHORT)
  { id:'cc_pol_assassin_b1', emoji:'🎯', title:'The Assassination Attempt', once:true,
    when:p=>inCareer(p,'politician')&&atStage(p,'Governor','President')&&!hasFlag(p,'cc_assassin'), weight:2.2,
    body:p=>`Someone tries to kill ${p.first}. It fails — a deflected shot, a tackled attacker, a few inches of pure luck. But it happened, and the world watched it happen, and ${p.first} is still shaking under the steadiness they have to project.`,
    choices:[
      {label:'Project strength', sub:'+fame', effect:p=>{ setFlag(p,'cc_assassin','strong'); fx(p,{fame:14,stress:10,happy:-2}); return `${p.first} stood up, bloodied or not, and projected absolute resolve. The image goes around the world. A nation that watched ${p.first} survive now sees something larger in them.`; }},
      {label:'Be honest about the fear', sub:'+humanity', effect:p=>{ setFlag(p,'cc_assassin','human'); fx(p,{fame:6,happy:4,stress:8}); return `${p.first} let the country see a human being who'd just been through something terrible. Some called it weak. Far more saw themselves in it, and loved ${p.first} for it.`; }},
      {label:'Use it politically', sub:'cold calculus', effect:p=>{ setFlag(p,'cc_assassin','used'); fx(p,{fame:10,happy:-4,stress:6}); return `${p.first} turned the attempt into leverage before the adrenaline had even faded — a rallying cry, a cudgel against opponents. Effective. A little chilling, even to ${p.first}.`; }},
    ]},
  // Beat 2 — investigation + permanent security
  { id:'cc_pol_assassin_b2', emoji:'🔍', title:'After the Attempt', once:true,
    when:p=>inCareer(p,'politician')&&hasFlag(p,'cc_assassin')&&!hasFlag(p,'cc_assassinDone'), weight:5,
    body:p=>`The investigation into who tried to kill ${p.first}, and why, comes back. And whatever the answer, ${p.first}'s life has a permanent new shape now: security, distance, a glass wall between ${p.first} and the ordinary world.`,
    choices:[
      {label:'Accept the new life behind glass', sub:'safe, sealed off', effect:p=>{ setFlag(p,'cc_assassinDone',true); p.securityLevel=Math.max(p.securityLevel||0,3); fx(p,{stress:6,happy:-4,fame:2}); return `${p.first} accepted the cordon — the motorcades, the cleared rooms, the friends who can't just drop by. Safer, and lonelier. The price of mattering enough to kill.`; }},
      {label:'Refuse to live in a bubble', sub:'+connection, +risk', effect:p=>{ setFlag(p,'cc_assassinDone',true); p.securityLevel=Math.max(p.securityLevel||0,1); fx(p,{happy:8,stress:8}); return `${p.first} pushed back against the bubble, kept shaking hands, kept being among people. The security detail despairs. ${capFirst(p.first)} would rather be in danger than in a cage.`; }},
    ]},

  // ============================================================
  // STARTUP FOUNDER
  // ============================================================
  // The Acquisition Offer (CHAIN-SHORT)
  { id:'cc_startup_acq', emoji:'🚀', title:'The Acquisition Offer', once:true,
    when:p=>inCareer(p,'founder')&&p.jobYears>=3&&!hasFlag(p,'cc_acq'), weight:3.5,
    body:p=>`A major corporation wants to buy ${p.first} out. The number is real — life-changing, generational. The catch is everything that isn't the number: the product, the team, the thing ${p.first} actually built.`,
    choices:[
      {label:'Sell early', sub:'+windfall, -control', effect:p=>{ setFlag(p,'cc_acq','sold'); const amt=2000000+rnd(40000000); fx(p,{money:amt,happy:6,stress:-6}); setFlag(p,'cc_acqRegret',chance(60)); return `${p.first} took the deal — ${money(amt)}, set for life and then some. The product passes into the corporation's hands now, to keep or kill as they see fit. ${p.first} tries not to think about which.`; }},
      {label:'Hold and keep building', sub:'higher risk, higher ceiling', effect:p=>{ setFlag(p,'cc_acq','held'); fx(p,{stress:14,happy:2}); return `${p.first} turned down the money to keep the dream whole. The road just got harder and the stakes higher — but if this thing makes it to IPO, the story is ${p.first}'s alone. No going back to that offer.`; }},
      {label:'Negotiate terms', sub:'smarts check', effect:p=>{ if(statCheck(p,'smarts',44)){ setFlag(p,'cc_acq','negotiated'); const amt=4000000+rnd(30000000); fx(p,{money:amt,fame:5,happy:8}); return `${p.first} negotiated hard and protected what mattered — the team kept on, the product's soul written into the terms, and still ${money(amt)} in hand. The rare deal where everybody actually wins.`;} setFlag(p,'cc_acq','sold'); setFlag(p,'cc_acqRegret',true); const amt=1500000+rnd(10000000); fx(p,{money:amt,stress:8}); return `${p.first} pushed for better terms and the buyer simply pulled them — took the standard deal or nothing. ${p.first} sold for ${money(amt)}, with none of the protections they'd wanted for the team.`; }},
    ]},
  // Echo — the legacy of what you sold, at 50-60
  { id:'cc_startup_legacy', emoji:'🏚️', title:'What Became of What You Built', once:true,
    when:p=>p.age>=50&&p.age<=62&&hasFlag(p,'cc_acqRegret')&&!hasFlag(p,'cc_acqLegacyDone'), weight:4,
    body:p=>`Decades on, ${p.first} sees what the corporation did with the thing ${p.first} built and sold — gutted, rebranded, or quietly killed. The money was real and is long since spent into a comfortable life. The question that surfaces is quieter: was it worth it?`,
    choices:[
      {label:'Make peace with the trade', sub:'+wisdom', effect:p=>{ setFlag(p,'cc_acqLegacyDone',true); fx(p,{happy:8,stress:-6}); return `${p.first} decided the security it bought — for family, for a whole life — was a fair price for a thing that was always going to be someone else's eventually. Peace, chosen on purpose.`; }},
      {label:'Build something new from the ache', sub:'+drive, +stress', effect:p=>{ setFlag(p,'cc_acqLegacyDone',true); fx(p,{happy:6,stress:8,smarts:3}); addTrait(p,'creative',true); return `${p.first} let the regret become fuel and started something new, late — to build one more thing and this time keep it. The fire never really went out; it was just waiting.`; }},
    ]},

  // ============================================================
  // FILM DIRECTOR
  // ============================================================
  // The Difficult Film (CHAIN-SHORT)
  { id:'cc_dir_film', emoji:'🎥', title:'The Difficult Film', once:true,
    when:p=>inCareer(p,'director')&&atStage(p,'Studio Director','Blockbuster Dir.')&&!hasFlag(p,'cc_film'), weight:3.5,
    body:p=>`The project ${p.first} has been waiting a whole career for — the one that could define everything — is finally in ${p.first}'s hands. And the studio wants changes. Big ones. The kind that turn the film ${p.first} means to make into a film the studio can sell.`,
    choices:[
      {label:'Give them what they want', sub:'safe, compromised', effect:p=>{ setFlag(p,'cc_film','compromised'); fx(p,{money:200000+rnd(800000),fame:6,happy:-6}); return `${p.first} made the changes. It opened well, it made money, it was fine. It just wasn't the film ${p.first} had in their chest. That one stays unmade, behind the one that got made.`; }},
      {label:'Fight for your cut', sub:'production war', effect:p=>{ setFlag(p,'cc_film','fought'); if(chance(50)){ fx(p,{fame:14,happy:10,stress:14}); setFlag(p,'cc_filmProtected',true); return `${p.first} fought through the budget fights and the studio's panic and got the film made — really made, ${p.first}'s way. It's the work of a lifetime, and everyone can tell.`;} fx(p,{fame:-6,happy:-8,stress:16,money:-(20000+rnd(60000))}); return `${p.first} fought and the production tore itself apart — overbudget, delayed, shelved. The film ${p.first} believed in may never see a screen. Belief isn't always enough.`; }},
      {label:'Walk away from it', sub:'someone else makes it', effect:p=>{ setFlag(p,'cc_film','walked'); fx(p,{happy:-4,stress:-4}); return `${p.first} let it go rather than mangle it. Someone else directed it, their way, and ${p.first} watched from a theater seat — wondering forever what it would have been in the right hands. ${p.first}'s hands.`; }},
    ]},

  // ============================================================
  // ASTRONAUT  — the one choice that can truly kill a character
  // ============================================================
  { id:'cc_astro_decision', emoji:'🚀', title:'The Decision', once:true,
    when:p=>inCareer(p,'astronaut')&&atStage(p,'Mission Commander','Moonwalker')&&!hasFlag(p,'cc_astro'), weight:3.5,
    body:p=>`Something goes wrong, far from home, with ${p.first} in command. An abort is on the table — the mission fails, but everyone comes home. Or ${p.first} pushes forward into the fault and risks everything for the thing they came all this way to do.`,
    choices:[
      {label:'Abort — bring everyone home', sub:'mission lost, lives safe', effect:p=>{ setFlag(p,'cc_astro','aborted'); fx(p,{stress:12,happy:-4,fame:-3}); return `${p.first} called the abort. The mission is a failure and the career stalls, maybe for good — but every soul aboard came home to their families. The hardest kind of right call.`; }},
      {label:'Push forward', sub:'glory or death', effect:p=>{ setFlag(p,'cc_astro','pushed'); if(chance(55)){ fx(p,{fame:34,happy:18,health:-6}); setFlag(p,'cc_astroGlory',true); return `${p.first} pushed past the abort and pulled off the impossible. The defining achievement of the entire bloodline — ${p.first}'s name is etched into history now, permanent, untouchable.`;} log(`${p.first} pushed forward when the abort was right there. The fault won. The mission was lost, and so was ${p.first} — somewhere far from home, doing the thing they were born to do.`,'death'); p._causeOfDeath='lost on a mission, pushing past the abort call'; die(p); return ''; }},
    ]},

];

// fold Part 4 into the main event pool
CHOICE_EVENTS.push(...CHAIN_EVENTS_P4);



function takeJobSilent(p,k){ const c=CAREER(k); p.job=k; p.jobYears=0; p.salary=c.base; p._stage=0; p._stageYears=0; p.jobTitle=c.stages?c.stages[0].t:null; if((c.hero||c.evil)){ const pow=grantPower(p); if(pow) log(`${p.first} discovered a power: ${pow}.`,'big'); } }

