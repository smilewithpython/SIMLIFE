"use strict";
/* Threadbare · split module: 20-career-tab.js  (lines 5892–6767 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   CAREER TAB — status, advancement, and per-profession choices
   ============================================================ */
// Per-profession interactive choices. Each builds option buttons via O().
// Keyed by career k; given (p, opts, push) where push(O(...)) appends.
const CAREER_CHOICES = {
  ufc: (p)=>[
    O('🥋','Learn from a legend','+athletic, +skill',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+6); setFlag(p,'trainedByLegend'); log(`${p.first} trained under a retired champion. Their technique leveled up.`,'good'); render(); }),
    O('💉','Take steroids','+athletic, risky',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+12);
      // smart fighters know how to beat the testing
      const caught = !(p.stats.smarts>65) && chance(40);
      if(caught){ p.stats.fame=clamp(p.stats.fame-15); p.record.push('Failed drug test'); p.salary=Math.round(p.salary*0.5); log(`${p.first} failed a drug test. Suspended, fined, and disgraced.`,'bad'); }
      else { setFlag(p,'juicing'); log(`${p.first} started a hidden PED cycle.${p.stats.smarts>65?' Smart enough to time it around the tests.':''} Stronger than ever.`,'muted'); }
      render(); }),
    O('🎤','Trash-talk to build hype','+fame, risk',0,()=>{ closeSheet(); if(chance(70)){ p.stats.fame=clamp(p.stats.fame+10); log(`${p.first}'s pre-fight trash talk went viral. The whole division wants a piece.`,'good'); } else { p.stats.fame=clamp(p.stats.fame+2); log(`${p.first} tried to start beef. It fell flat.`,'muted'); } render(); }),
  ],
  wwe: (p)=>[
    O('🎭','Develop a new gimmick','+fame',0,()=>{ closeSheet(); if(chance(60)){ p.stats.fame=clamp(p.stats.fame+12); log(`${p.first}'s new character is over with the crowd. Merch is flying.`,'good'); } else { p.stats.fame=clamp(p.stats.fame-2); log(`The new gimmick flopped. Back to the drawing board.`,'muted'); } render(); }),
    O('💉','Take steroids','+physique, risky',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+10); p.stats.looks=clamp(p.stats.looks+4); if(!(p.stats.smarts>65)&&chance(35)){ p.record.push('Wellness policy violation'); p.stats.fame=clamp(p.stats.fame-10); log(`${p.first} got popped for the wellness policy. Suspended.`,'bad'); } else { setFlag(p,'juicing'); log(`${p.first} bulked up fast on a quiet cycle.`,'muted'); } render(); }),
    O('🩹','Wrestle through an injury','+respect, −health',0,()=>{ closeSheet(); p.stats.health=clamp(p.stats.health-10); p.stats.fame=clamp(p.stats.fame+6); log(`${p.first} refused to miss the show, working hurt. The locker room respects it.`,'good'); render(); }),
  ],
  boxer: (p)=>[
    O('🥋','Hire an elite trainer','-$, +skill',0,()=>{ closeSheet(); const c=Math.min(p.money,20000); p.money-=c; p.stats.athletic=clamp(p.stats.athletic+7); log(`${p.first} brought in a world-class trainer. The footwork is crisp now.`,'good'); render(); }),
    O('💉','Take PEDs','+power, risky',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+11); if(!(p.stats.smarts>65)&&chance(40)){ p.record.push('Failed drug test'); p.stats.fame=clamp(p.stats.fame-12); log(`${p.first} failed the commission's test. The win was overturned.`,'bad'); } else { setFlag(p,'juicing'); log(`${p.first} quietly juiced for the next bout.`,'muted'); } render(); }),
    O('💰','Call out a big-name fighter','+fame, +purse',0,()=>{ closeSheet(); if(chance(55)){ p.stats.fame=clamp(p.stats.fame+14); const purse=50000+rnd(2000000); p.money+=purse; log(`${p.first} landed a megafight callout — ${money(purse)} payday and stardom.`,'big'); } else { log(`Nobody bit on ${p.first}'s callout. Yet.`,'muted'); } render(); }),
  ],
  professor: (p)=>[
    O('📚','Publish research','+reputation, +tenure odds',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+4); setFlag(p,'published'); if(chance(40)){ p.stats.fame=clamp(p.stats.fame+5); log(`${p.first}'s paper made waves in the field. Tenure looks closer.`,'good'); } else log(`${p.first} published another solid paper. The work compounds.`,'good'); render(); }),
    O('🎓','Campaign to become Dean','+power play',0,()=>{ closeSheet(); const odds=30+(p.stats.smarts>70?20:0)+(hasFlag(p,'published')?20:0)+(p.stats.charming>55?10:0); if(chance(odds)){ p.jobTitle='Dean'; p.salary=Math.round(p.salary*1.5); p.stats.fame=clamp(p.stats.fame+10); setFlag(p,'dean'); log(`${p.first} was appointed Dean of the faculty. A seat of real power.`,'big'); } else log(`${p.first}'s bid for Dean fell short this time. Keep building support.`,'muted'); render(); }),
    O('🍎','Mentor a star student','+joy, +legacy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); if(chance(30))setFlag(p,'mentor'); log(`${p.first} guided a brilliant student to greatness. Teaching at its best.`,'good'); render(); }),
    O('💸','Take a corporate consulting gig','+$, −focus',0,()=>{ closeSheet(); const fee=20000+rnd(80000); p.money+=fee; p.stats.fame=clamp(p.stats.fame-2); log(`${p.first} consulted on the side for ${money(fee)}. The department grumbles.`,'muted'); render(); }),
  ],
  doctor: (p)=>[
    O('🔬','Specialize in a lucrative field','+salary',0,()=>{ closeSheet(); p.salary=Math.round(p.salary*1.3); p.stats.smarts=clamp(p.stats.smarts+4); setFlag(p,'specialist'); log(`${p.first} completed a specialty fellowship. The income jumped.`,'big'); render(); }),
    O('🏥','Volunteer at a free clinic','+joy, +reputation',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); setFlag(p,'goodHeart'); log(`${p.first} gave their weekends to patients who had nowhere else. It matters.`,'good'); render(); }),
    O('💊','Overprescribe for kickbacks','+$, unethical, risky',0,()=>{ closeSheet(); if(chance(30)){ p.record.push('Medical fraud'); p.stats.fame=clamp(p.stats.fame-15); if(chance(40)){p.inPrison=true;p.prisonYears=2+rnd(3);endJob(p);} log(`${p.first} got investigated for fraud. Career-threatening.`,'bad'); } else { const kick=30000+rnd(120000); p.money+=kick; setFlag(p,'corrupt'); log(`${p.first} took ${money(kick)} in pharma kickbacks. Nobody's checking… yet.`,'muted'); } render(); }),
  ],
  lawyer: (p)=>[
    O('⚖️','Take on a high-profile case','+fame, +$',0,()=>{ closeSheet(); if(chance(60)){ const fee=50000+rnd(500000); p.money+=fee; p.stats.fame=clamp(p.stats.fame+10); log(`${p.first} won a headline case — ${money(fee)} and front-page fame.`,'big'); } else { p.stats.fame=clamp(p.stats.fame-5); log(`${p.first} lost a very public case. Ouch.`,'bad'); } render(); }),
    O('🤝','Make partner','+power, +salary',0,()=>{ closeSheet(); const odds=35+(p.jobYears>8?25:0)+(p.stats.charming>55?15:0); if(chance(odds)){ p.jobTitle='Partner'; p.salary=Math.round(p.salary*1.8); setFlag(p,'partner'); log(`${p.first} made partner at the firm. Name on the door.`,'big'); } else log(`${p.first} was passed over for partner this cycle.`,'muted'); render(); }),
    O('🕵️','Defend a guilty client for a fortune','+$, unethical',0,()=>{ closeSheet(); const fee=100000+rnd(900000); p.money+=fee; p.stats.happy=clamp(p.stats.happy-4); setFlag(p,'morallyGray'); log(`${p.first} got a guilty client off and pocketed ${money(fee)}. Justice is complicated.`,'muted'); render(); }),
  ],
  tech: (p)=>[
    O('🚀','Push for a promotion','+salary',0,()=>{ closeSheet(); if(chance(55)){ p.salary=Math.round(p.salary*1.25); p.stats.fame=clamp(p.stats.fame+2); log(`${p.first} got promoted. Bigger title, bigger paycheck.`,'good'); } else log(`${p.first}'s promotion case didn't land this cycle.`,'muted'); render(); }),
    O('💡','Build a side project','maybe strike gold',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+3); if(chance(20)){ const exit=100000+rnd(3000000); p.money+=exit; log(`${p.first}'s side project got acquired — ${money(exit)}!`,'big'); } else log(`${p.first} shipped a side project. Good for the résumé, if nothing else.`,'good'); render(); }),
    O('🏢','Jump to a rival for more pay','+salary, −stability',0,()=>{ closeSheet(); p.salary=Math.round(p.salary*1.35); p.stats.stress=clamp((p.stress||0)+8); log(`${p.first} job-hopped to a competitor for a fat raise.`,'good'); render(); }),
  ],
  popstar: (p)=>[
    O('🎬','Cross over into acting','+fame',0,()=>{ closeSheet(); if(chance(50)){ const deal=200000+rnd(3000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+12); log(`${p.first} crossed over to film — ${money(deal)} and new fans.`,'big'); } else log(`${p.first}'s acting debut got panned. Stick to music?`,'muted'); render(); }),
    O('🌍','Launch a world tour','-$ upfront, big payoff',0,()=>{ closeSheet(); const cost=Math.min(p.money,200000); p.money-=cost; if(chance(70)){ const gross=cost+1000000+rnd(20000000); p.money+=gross; p.stats.fame=clamp(p.stats.fame+15); p.stats.health=clamp(p.stats.health-8); log(`${p.first}'s world tour grossed ${money(gross)}. Exhausting and glorious.`,'big'); } else log(`The tour undersold and lost money. Brutal.`,'bad'); render(); }),
    O('🍾','Embrace the rockstar lifestyle','+joy, addiction risk',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); if(chance(40))addAddiction(p,pick(['alcohol','cocaine','party_drugs'])); log(`${p.first} lived the rockstar dream — all night, every night.`,'muted'); render(); }),
  ],
  politician: (p)=>[
    O('🗳','Run for higher office','+power',0,()=>{ closeSheet(); const odds=30+(p.stats.fame>40?25:0)+(p.stats.charming>60?20:0)+(p.money>500000?10:0); if(chance(odds)){ p.jobTitle='Senator'; p.salary=Math.round(p.salary*1.4); p.stats.fame=clamp(p.stats.fame+15); log(`${p.first} won the election and climbed to higher office.`,'big'); } else log(`${p.first} lost the race. Politics is brutal.`,'bad'); render(); }),
    O('🤝','Take corporate donations','+$, owes favors',0,()=>{ closeSheet(); const don=100000+rnd(900000); p.money+=don; setFlag(p,'boughtPolitician'); log(`${p.first} accepted ${money(don)} in "donations." Strings attached.`,'muted'); render(); }),
    O('📜','Champion a popular bill','+fame',0,()=>{ closeSheet(); p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'goodHeart'); worldEvent(p,`${p.first} passed landmark legislation that helped millions.`,{hope:true}); log(`${p.first}'s signature bill passed. A legacy in the making.`,'good'); render(); }),
  ],
  crimelord: (p)=>{
    const RACKETS=[['🎲','Illegal gambling den',60000],['💊','Drug distribution',120000],['💵','Money laundering',200000],['🔫','Arms trafficking',400000],['🏗','Construction shakedowns',150000]];
    const arr=[];
    arr.push(O('🗺',`Expand your territory (${Math.round(p.territory||0)}%)`,'seize turf from rivals',0,()=>{ closeSheet();
      const win=chance(55+(p.minions||0)*2+(p.traits.includes('sly')?10:0));
      if(win){ p.territory=clamp((p.territory||0)+8+rnd(10)); p.salary=Math.round(p.salary*1.1); log(`${p.first}'s crew took over more blocks. The territory grows.`,'big'); }
      else { p.stats.health=clamp(p.stats.health-10); log(`A turf war turned bloody — ${p.first} held the line but took losses.`,'bad'); }
      render(); }));
    // open a racket the player doesn't have
    const owned=(p.rackets||[]).map(r=>r.name);
    const avail=RACKETS.filter(r=>!owned.includes(r[1]));
    if(avail.length){ const r=avail[0];
      arr.push(O(r[0],`Open: ${r[1]}`,`${money(r[2])} · adds yearly income`,0,()=>{ closeSheet(); if(p.money<r[2]){log(`${p.first} needs ${money(r[2])} to set that up.`,'muted');render();return;} p.money-=r[2]; if(!p.rackets)p.rackets=[]; p.rackets.push({name:r[1],income:Math.round(r[2]*0.6)}); log(`${p.first} set up a ${r[1].toLowerCase()} operation. The money will flow.`,'big'); render(); }));
    }
    arr.push(O('🪙','Collect protection money','+$ from your turf',0,()=>{ closeSheet(); const take=Math.round((p.territory||0)*3000+(p.rackets||[]).length*15000+rnd(40000)); p.money+=take; p.heat=(p.heat||0)+5; log(`${p.first}'s enforcers collected ${money(take)} in tribute.`,'good'); render(); }));
    arr.push(O('🤵','Bribe officials','-$, lowers heat & bust risk',0,()=>{ closeSheet(); const c=Math.min(p.money,50000+rnd(150000)); p.money-=c; p.heat=Math.max(0,(p.heat||0)-30); setFlag(p,'ownsOfficials'); log(`${p.first} put cops and judges on the payroll. The law looks away.`,'muted'); render(); }));
    arr.push(O('🗡','Order a hit on a rival','ruthless, risky',0,()=>{ closeSheet(); if(chance(70)){ p.territory=clamp((p.territory||0)+6); setFlag(p,'ruthless'); log(`${p.first}'s rival was eliminated. The territory is quieter now.`,'big'); } else { p.heat=(p.heat||0)+25; p.record.push('Murder investigation'); log(`The hit went wrong and brought serious heat on ${p.first}.`,'bad'); } render(); }));
    return arr;
  },
  madsci: (p)=>[
    O('🧪','Run a dangerous experiment','+smarts, world consequences',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+5);
      if(chance(30)){ p.stats.health=clamp(p.stats.health-15); log(`The experiment exploded. ${p.first} barely survived.`,'bad'); }
      else { worldEvent(p, pick([`${p.first} created artificial life in the lab.`,`${p.first} reanimated dead tissue.`,`${p.first} built a weather machine.`,`${p.first} engineered a glowing new species.`]), {weird:true}); log(`${p.first}'s experiment succeeded — and changed what's possible.`,'big'); }
      render(); }),
    O('💰','Sell tech to the highest bidder','+$$, ethically grey',0,()=>{ closeSheet(); const sale=200000+rnd(3000000); p.money+=sale; setFlag(p,'soldDangerousTech'); log(`${p.first} sold cutting-edge tech for ${money(sale)}. Who's buying… and why?`,'muted'); render(); }),
    O('🤖','Build a loyal creation','an assistant or guardian',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+3); if(!p.henchman){ p.henchman={name:'Subject-'+(1+rnd(99)),loyalty:100}; log(`${p.first} created ${p.henchman.name}, a loyal artificial being.`,'big'); } else log(`${p.first} improved their creation.`,'good'); render(); }),
    O('🏆','Publish for a Nobel Prize','+fame, legitimacy',0,()=>{ closeSheet(); if(p.stats.smarts>80&&chance(35)){ p.stats.fame=clamp(p.stats.fame+25); setFlag(p,'nobelLaureate'); worldEvent(p,`${p.first} won the Nobel Prize for a stunning breakthrough.`,{hope:true}); log(`🏆 ${p.first} won the NOBEL PRIZE. From mad genius to celebrated mind.`,'big'); } else log(`${p.first}'s work was deemed too dangerous to honor. For now.`,'muted'); render(); }),
    ...(!G.transfusionUnlocked ? [O('🩸','Research power transfusion','unlock a way to pass powers',0,()=>{ closeSheet(); if(p.stats.smarts>62||chance(50)){ G.transfusionUnlocked=true; log(`${p.first} cracked it: a blood transfusion that can transfer superpowers into another body. Forbidden science — but it works. The knowledge passes to every future heir.`,'big'); } else { p.stats.health=clamp(p.stats.health-8); log(`${p.first}'s transfusion trials failed — and nearly killed a test subject. Back to the lab.`,'bad'); } render(); })] : []),
    ...(G.transfusionUnlocked && (p.powers&&p.powers.length>0) && p.rels.some(r=>r.kind==='Child'&&r.alive && (findP(G,r.id)||{}).adopted) ? [O('🧬','Transfuse powers to adopted heir','passes ~2/3 of your powers',0,()=>{ closeSheet(); doPowerTransfusion(p); })] : []),
  ],
  proathlete: (p)=>[
    O('🏋️','Hit the training facility','+athletic',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+5); p.stats.health=clamp(p.stats.health-2); log(`${p.first} put in brutal hours in the gym. Sharper than ever.`,'good'); render(); }),
    O('💪','Push for a max contract','+salary, depends on play',0,()=>{ closeSheet(); const odds=35+(p.stats.athletic>80?30:0)+(p.stats.fame>40?15:0); if(chance(odds)){ const raise=Math.round(p.salary*(0.5+Math.random()*1.5))+2000000; p.salary+=raise; p.stats.fame=clamp(p.stats.fame+8); log(`${p.first} signed a massive new contract — ${money(raise)} more a year.`,'big'); } else log(`The front office passed on a big extension. Prove it on the court first.`,'muted'); render(); }),
    O('💉','Take performance enhancers','+athletic, risky',0,()=>{ closeSheet(); p.stats.athletic=clamp(p.stats.athletic+12); if(!(p.stats.smarts>65)&&chance(40)){ p.stats.fame=clamp(p.stats.fame-15); p.record.push('PED suspension'); p.salary=Math.round(p.salary*0.6); log(`${p.first} failed a league drug test. Suspended and shamed.`,'bad'); } else { setFlag(p,'juicing'); log(`${p.first} quietly juiced to stay on top.${p.stats.smarts>65?' Smart enough to dodge the testing.':''}`,'muted'); } render(); }),
    O('👟','Chase a signature shoe deal','+$$$',0,()=>{ closeSheet(); if(p.stats.fame>30||chance(40)){ const deal=1000000+rnd(30000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+10); log(`${p.first} signed a signature shoe deal — ${money(deal)}.`,'big'); } else log(`${p.first} isn't quite marketable enough yet for a shoe line.`,'muted'); render(); }),
    O('🎙','Become the face of the league','+fame, leadership',0,()=>{ closeSheet(); p.stats.fame=clamp(p.stats.fame+12); setFlag(p,'leagueFace'); log(`${p.first} stepped up as the league's marquee star and locker-room leader.`,'good'); render(); }),
    O('🩹','Play through the pain','+respect, −health',0,()=>{ closeSheet(); p.stats.health=clamp(p.stats.health-12); p.stats.fame=clamp(p.stats.fame+6); log(`${p.first} gutted out games hurt. Teammates and fans respect the grit.`,'good'); render(); }),
  ],
  cop: (p)=>[
    O('🚔','Volunteer for dangerous duty','+rep, risk',0,()=>{ closeSheet(); if(chance(70)){ p.stats.fame=clamp(p.stats.fame+6); setFlag(p,'decoratedCop'); log(`${p.first} took down a dangerous suspect. A commendation follows.`,'good'); } else { p.stats.health=clamp(p.stats.health-15); log(`${p.first} was wounded in the line of duty.`,'bad'); } render(); }),
    O('🎖','Push for a promotion','climb to Detective → Chief',0,()=>{ closeSheet(); const odds=35+(p.jobYears>5?20:0)+(p.stats.smarts>55?15:0); if(chance(odds)){ p.jobTitle=p.jobTitle==='Officer'||!p.jobTitle?'Detective':p.jobTitle==='Detective'?'Sergeant':p.jobTitle==='Sergeant'?'Lieutenant':'Chief'; p.salary=Math.round(p.salary*1.3); log(`${p.first} was promoted to ${p.jobTitle}.`,'big'); } else log(`${p.first} was passed over for promotion this round.`,'muted'); render(); }),
    O('💵','Take dirty money','+$, corrupt, risky',0,()=>{ closeSheet(); if(chance(28)){ p.record.push('Police corruption'); p.stats.fame=clamp(p.stats.fame-12); if(chance(40)){p.inPrison=true;p.prisonYears=2+rnd(3);endJob(p);} log(`Internal Affairs caught ${p.first}. Disgraced.`,'bad'); } else { const bribe=20000+rnd(120000); p.money+=bribe; setFlag(p,'dirtyCop'); log(`${p.first} pocketed ${money(bribe)} to look the other way.`,'muted'); } render(); }),
    O('🤝','Serve the community','+joy, +trust',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+6); setFlag(p,'goodHeart'); log(`${p.first} built real trust in the neighborhood. Policing at its best.`,'good'); render(); }),
  ],
  soldier: (p)=>[
    O('🎖','Volunteer for a tour of duty','+rep, danger',0,()=>{ closeSheet(); if(chance(72)){ p.stats.fame=clamp(p.stats.fame+8); p.stats.athletic=clamp(p.stats.athletic+4); setFlag(p,'decoratedVet'); log(`${p.first} served with distinction and earned a medal.`,'big'); } else { p.stats.health=clamp(p.stats.health-20); seed(p,2,'thick_skin'); log(`${p.first} was wounded in combat. The scars run deep.`,'bad'); } render(); }),
    O('⬆️','Rise through the ranks','Private → General',0,()=>{ closeSheet(); const odds=35+(p.jobYears>6?20:0)+(p.stats.athletic>60?10:0); if(chance(odds)){ const ranks=['Private','Corporal','Sergeant','Lieutenant','Captain','Major','Colonel','General']; const cur=ranks.indexOf(p.jobTitle||'Private'); p.jobTitle=ranks[Math.min(ranks.length-1,cur+1)]; p.salary=Math.round(p.salary*1.25); log(`${p.first} was promoted to ${p.jobTitle}.`,'big'); } else log(`${p.first} held their rank this cycle.`,'muted'); render(); }),
    O('🦾','Join special forces','elite, high risk',0,()=>{ closeSheet(); if(p.stats.athletic>70&&chance(55)){ p.stats.athletic=clamp(p.stats.athletic+8); p.stats.fame=clamp(p.stats.fame+10); setFlag(p,'specialForces'); log(`${p.first} earned a place in the special forces. Elite.`,'big'); } else { p.stats.health=clamp(p.stats.health-10); log(`${p.first} washed out of selection. Brutal.`,'bad'); } render(); }),
    O('🏠','Transition to civilian life','-fame, +peace',0,()=>{ closeSheet(); endJob(p,`${p.first} left the service and returned home.`); p.stats.happy=clamp(p.stats.happy+6); log(`${p.first} hung up the uniform for a quieter life.`,'muted'); render(); }),
  ],
  firefighter: (p)=>[
    O('🔥','Run into the burning building','+rep, +lives, risk',0,()=>{ closeSheet(); if(chance(75)){ const saved=1+rnd(4); p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'heroFirefighter'); log(`${p.first} carried ${saved} ${saved===1?'person':'people'} out of the flames. A hero.`,'big'); } else { p.stats.health=clamp(p.stats.health-16); log(`${p.first} was badly burned in a collapse.`,'bad'); } render(); }),
    O('🎖','Make Captain','lead the firehouse',0,()=>{ closeSheet(); const odds=35+(p.jobYears>5?25:0); if(chance(odds)){ p.jobTitle='Captain'; p.salary=Math.round(p.salary*1.3); log(`${p.first} was promoted to Captain of the firehouse.`,'big'); } else log(`${p.first} wasn't promoted this time.`,'muted'); render(); }),
    O('🐾','The dramatic rescue','+fame',0,()=>{ closeSheet(); p.stats.fame=clamp(p.stats.fame+5); p.stats.happy=clamp(p.stats.happy+4); log(`${p.first} rescued a family's pet from a blaze — the photo went local-news viral.`,'good'); render(); }),
    O('📣','Teach fire safety','+joy, +community',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+5); setFlag(p,'goodHeart'); log(`${p.first} ran safety programs at schools. Quietly saving lives before they're at risk.`,'good'); render(); }),
  ],
  founder: (p)=>[
    O('💸','Raise venture capital','fuel growth, dilute',0,()=>{ closeSheet(); if(chance(55)){ const raise=500000+rnd(20000000); p.money+=Math.round(raise*0.3); setFlag(p,'vcBacked'); log(`${p.first} closed a funding round — ${money(raise)} raised (mostly for the company).`,'big'); } else log(`Investors passed on ${p.first}'s pitch. Back to the grind.`,'bad'); render(); }),
    O('🚀','Pivot the company','high risk, high reward',0,()=>{ closeSheet(); if(chance(45)){ p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'pivoted'); log(`${p.first}'s pivot found product-market fit. Growth is exploding.`,'big'); } else { p.stats.happy=clamp(p.stats.happy-8); log(`The pivot confused customers and burned cash. Rough.`,'bad'); } render(); }),
    O('💰','Sell the company','cash out big',0,()=>{ closeSheet(); const odds=35+(hasFlag(p,'vcBacked')?20:0)+(p.stats.smarts>70?15:0); if(chance(odds)){ const exit=1000000+rnd(200000000); p.money+=exit; p.stats.fame=clamp(p.stats.fame+20); worldEvent(p,`${p.first} sold their startup in a blockbuster acquisition.`,{hope:true}); log(`💰 ${p.first} sold the company for ${money(exit)}. Set for life.`,'big'); endJob(p,`${p.first} cashed out and retired from the company.`); } else log(`No acquirer bit at ${p.first}'s asking price. Keep building.`,'muted'); render(); }),
    O('🔥','Crunch toward a deadline','+progress, −health',0,()=>{ closeSheet(); p.stress=clamp((p.stress||0)+15); p.stats.health=clamp(p.stats.health-5); p.stats.smarts=clamp(p.stats.smarts+2); log(`${p.first} pulled all-nighters to ship. The team is fried but it's done.`,'muted'); render(); }),
  ],
  astronaut: (p)=>[
    O('🚀','Volunteer for a risky mission','+fame, danger',0,()=>{ closeSheet(); if(chance(70)){ p.stats.fame=clamp(p.stats.fame+15); setFlag(p,'spaceHero'); worldEvent(p,`${p.first} completed a historic, dangerous space mission.`,{hope:true}); log(`${p.first} pulled off a daring mission. A national hero.`,'big'); } else { p.stats.health=clamp(p.stats.health-18); log(`A malfunction nearly killed ${p.first} in orbit.`,'bad'); } render(); }),
    O('🌙','Train for a Moon/Mars landing','the history books',0,()=>{ closeSheet(); if(p.stats.smarts>65&&p.stats.athletic>55&&chance(45)){ p.stats.fame=clamp(p.stats.fame+30); setFlag(p,'firstOnMars'); worldEvent(p,`${p.first} walked on another world — a moment for all humankind.`,{hope:true}); log(`🌙 ${p.first} became one of the few to walk on another world. Immortal.`,'big'); } else log(`${p.first} trained hard but wasn't selected for the landing crew.`,'muted'); render(); }),
    O('🔬','Conduct groundbreaking research','+smarts',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+6); if(chance(30)){p.stats.fame=clamp(p.stats.fame+8);log(`${p.first}'s orbital experiments made a real scientific breakthrough.`,'good');} else log(`${p.first} logged valuable data from microgravity research.`,'good'); render(); }),
  ],
  director: (p)=>[
    O('🎬','Take a passion project','+acclaim, risky',0,()=>{ closeSheet(); if(chance(50)){ p.stats.fame=clamp(p.stats.fame+12); setFlag(p,'criticDarling'); log(`${p.first}'s passion film wowed the critics. A new respect.`,'big'); } else { p.stats.happy=clamp(p.stats.happy-6); log(`The passion project flopped — too weird for audiences.`,'bad'); } render(); }),
    O('💥','Direct a big-budget blockbuster','+$$$, +fame',0,()=>{ closeSheet(); if(chance(55)){ const gross=2000000+rnd(60000000); p.money+=Math.round(gross*0.1); p.stats.fame=clamp(p.stats.fame+15); log(`${p.first}'s blockbuster smashed the box office. ${money(Math.round(gross*0.1))} in backend.`,'big'); } else { p.stats.fame=clamp(p.stats.fame-8); log(`The blockbuster bombed. The studio is furious.`,'bad'); } render(); }),
    O('🏆','Campaign for an Oscar','+prestige',0,()=>{ closeSheet(); const odds=25+(hasFlag(p,'criticDarling')?25:0)+(p.stats.fame>50?15:0); if(chance(odds)){ p.stats.fame=clamp(p.stats.fame+20); setFlag(p,'oscarWinner'); worldEvent(p,`${p.first} won the Academy Award for Best Director.`,{hope:true}); log(`🏆 ${p.first} WON the Oscar for Best Director.`,'big'); } else log(`${p.first} was nominated but didn't win. The campaign continues.`,'muted'); render(); }),
    O('🎥','Mentor a rising filmmaker','+legacy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+6); setFlag(p,'mentor'); log(`${p.first} took a young director under their wing. Passing the torch.`,'good'); render(); }),
  ],
  esports: (p)=>[
    O('🎮','Grind ranked all night','+skill, −health',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+4); p.stats.health=clamp(p.stats.health-4); log(`${p.first} climbed the ladder into the small hours. Mechanics sharper than ever.`,'good'); render(); }),
    O('🏆','Compete in the world championship','+fame, +$',0,()=>{ closeSheet(); const odds=30+(p.stats.smarts>75?25:0); if(chance(odds)){ const prize=100000+rnd(2000000); p.money+=prize; p.stats.fame=clamp(p.stats.fame+18); setFlag(p,'esportsChamp'); worldEvent(p,`${p.first} won the world esports championship.`,{hope:true}); log(`🏆 ${p.first} WON the world championship — ${money(prize)} prize.`,'big'); } else log(`${p.first}'s team was eliminated in the bracket. So close.`,'muted'); render(); }),
    O('📺','Stream to build a fanbase','+followers, +$',0,()=>{ closeSheet(); if(!p.onSocial){p.onSocial=true;p.socialFollowers=startingFollowers(p);} const g=5000+rnd(60000); p.socialFollowers+=g; p.stats.fame=clamp(p.stats.fame+4); const sub=Math.round(g*0.5); p.money+=sub; log(`${p.first} streamed to ${g.toLocaleString()} new followers and ${money(sub)} in subs.`,'good'); render(); }),
    O('🪑','Get a team coaching role','longevity',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+3); setFlag(p,'esportsCoach'); log(`${p.first} moved into coaching — a way to stay in the game past their prime.`,'good'); render(); }),
  ],
  model: (p)=>[
    O('📸','Walk for a top fashion house','+fame',0,()=>{ closeSheet(); if(p.stats.looks>65||chance(45)){ const fee=20000+rnd(400000); p.money+=fee; p.stats.fame=clamp(p.stats.fame+12); setFlag(p,'runwayModel'); log(`${p.first} walked the runway for a major house — ${money(fee)} and serious buzz.`,'big'); } else log(`${p.first} didn't book the show. The industry is brutal on looks.`,'muted'); render(); }),
    O('🧴','Land a brand ambassador deal','+$$$',0,()=>{ closeSheet(); if(p.stats.fame>25||chance(40)){ const deal=100000+rnd(5000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+8); log(`${p.first} became the face of a brand — ${money(deal)}.`,'big'); } else log(`No brand bit on ${p.first} this time.`,'muted'); render(); }),
    O('💄','Launch your own beauty line','-$ upfront, big upside',0,()=>{ closeSheet(); const cost=Math.min(p.money,50000); p.money-=cost; if(p.stats.fame>30&&chance(55)){ const rev=cost+Math.round((p.stats.fame*10000)+rnd(2000000)); p.money+=rev; log(`${p.first}'s beauty line took off — ${money(rev)} in sales.`,'big'); } else log(`${p.first}'s beauty line struggled to find shelf space.`,'bad'); render(); }),
    O('🍽','Manage the industry pressure','+health',0,()=>{ closeSheet(); p.stats.health=clamp(p.stats.health+6); p.stats.happy=clamp(p.stats.happy+4); log(`${p.first} prioritized real health over industry expectations. Wise.`,'good'); render(); }),
  ],
  writer: (p)=>[
    O('📖','Write your magnum opus','+acclaim, risky',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+4); if(chance(45)){ const r=20000+rnd(800000); p.money+=r; p.stats.fame=clamp(p.stats.fame+10); setFlag(p,'acclaimedAuthor'); log(`${p.first}'s new novel was hailed as a masterpiece — ${money(r)} in royalties.`,'big'); } else log(`${p.first} poured a year into a book that barely sold. The writer's life.`,'muted'); render(); }),
    O('🎬','Sell the film rights','+$$$',0,()=>{ closeSheet(); if(hasFlag(p,'acclaimedAuthor')||p.stats.fame>30||chance(35)){ const deal=100000+rnd(4000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+10); log(`Hollywood optioned ${p.first}'s book — ${money(deal)}.`,'big'); } else log(`No studio bit on the film rights yet.`,'muted'); render(); }),
    O('🏆','Chase a literary prize','+prestige',0,()=>{ closeSheet(); const odds=20+(hasFlag(p,'acclaimedAuthor')?30:0)+(p.stats.smarts>75?15:0); if(chance(odds)){ p.stats.fame=clamp(p.stats.fame+18); setFlag(p,'prizeWinner'); worldEvent(p,`${p.first} won a major literary prize.`,{hope:true}); log(`🏆 ${p.first} won a prestigious literary award.`,'big'); } else log(`${p.first} was longlisted but didn't win. Next time.`,'muted'); render(); }),
    O('✍️','Write a commercial bestseller','+$, −prestige',0,()=>{ closeSheet(); const r=30000+rnd(600000); p.money+=r; p.stats.fame=clamp(p.stats.fame+6); log(`${p.first} churned out a crowd-pleaser that sold like crazy — ${money(r)}. Critics sniffed.`,'good'); render(); }),
  ],
  actor: (p)=>[
    O('🎭','Take a serious dramatic role','+acclaim',0,()=>{ closeSheet(); if(chance(50)){ p.stats.fame=clamp(p.stats.fame+12); setFlag(p,'seriousActor'); log(`${p.first}'s dramatic turn earned rave reviews. A real actor now.`,'big'); } else { p.stats.happy=clamp(p.stats.happy-5); log(`The role was panned. Maybe too ambitious.`,'muted'); } render(); }),
    O('💰','Chase a franchise blockbuster','+$$$, +fame',0,()=>{ closeSheet(); if(p.stats.looks>50||p.stats.fame>30||chance(40)){ const deal=500000+rnd(15000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+15); log(`${p.first} landed a franchise lead — ${money(deal)} a picture.`,'big'); } else log(`${p.first} lost the part to a bigger name.`,'muted'); render(); }),
    O('🏆','Campaign for an Oscar','+prestige',0,()=>{ closeSheet(); const odds=22+(hasFlag(p,'seriousActor')?28:0)+(p.stats.fame>50?15:0); if(chance(odds)){ p.stats.fame=clamp(p.stats.fame+22); setFlag(p,'oscarWinner'); worldEvent(p,`${p.first} won the Academy Award for acting.`,{hope:true}); log(`🏆 ${p.first} WON the Oscar. A career-defining night.`,'big'); } else log(`${p.first} was nominated — an honor, but no statue this year.`,'muted'); render(); }),
    O('🎬','Cross into directing','reinvent yourself',0,()=>{ closeSheet(); if(p.stats.fame>35&&chance(50)){ p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'actorDirector'); log(`${p.first} stepped behind the camera and earned respect as a director too.`,'good'); } else log(`${p.first}'s directorial debut was forgettable. Stick to acting?`,'muted'); render(); }),
  ],
  youtuber: (p)=>[
    O('🎬','Make a viral video','+followers, +$',0,()=>{ closeSheet(); if(!p.onSocial){p.onSocial=true;p.socialFollowers=startingFollowers(p);} const r=rnd(100); if(r<35){ const boom=50000+rnd(500000); p.socialFollowers+=boom; p.stats.fame=clamp(p.stats.fame+10); const ad=Math.round(boom*0.3); p.money+=ad; log(`${p.first}'s video EXPLODED — ${boom.toLocaleString()} subs and ${money(ad)} in ad revenue.`,'big'); } else { const g=rnd(15000); p.socialFollowers+=g; log(`${p.first}'s video did okay — ${g.toLocaleString()} new subs.`,'muted'); } render(); }),
    O('💰','Sign with a brand sponsor','+$$',0,()=>{ closeSheet(); if((p.socialFollowers||0)>10000||chance(40)){ const deal=Math.round((p.socialFollowers||10000)*(0.5+Math.random()*2)); p.money+=deal; log(`${p.first} signed a sponsorship — ${money(deal)}.`,'big'); } else log(`${p.first}'s channel is too small for sponsors yet.`,'muted'); render(); }),
    O('🛍','Sell channel merch','+$',0,()=>{ closeSheet(); const rev=Math.round((p.socialFollowers||5000)*(0.2+Math.random())); p.money+=rev; log(`${p.first}'s merch drop pulled in ${money(rev)}.`,'good'); render(); }),
    O('📉','Survive a controversy','reputation risk',0,()=>{ closeSheet(); if(chance(55)){ p.stats.fame=clamp(p.stats.fame+4); log(`${p.first} weathered some drama and came out fine.`,'muted'); } else { const loss=Math.round((p.socialFollowers||0)*0.2); p.socialFollowers=Math.max(0,(p.socialFollowers||0)-loss); log(`A controversy cost ${p.first} ${loss.toLocaleString()} subscribers.`,'bad'); } render(); }),
  ],
  restaurateur: (p)=>[
    O('⭐','Chase a Michelin star','+prestige',0,()=>{ closeSheet(); const odds=25+(p.stats.smarts>70?20:0)+(p.jobYears>5?15:0); if(chance(odds)){ p.stats.fame=clamp(p.stats.fame+15); setFlag(p,'michelinStar'); p.salary=Math.round(p.salary*1.4); worldEvent(p,`${p.first}'s restaurant earned a coveted Michelin star.`,{hope:true}); log(`⭐ ${p.first} earned a Michelin star. The reservations book is now impossible.`,'big'); } else log(`The inspector wasn't impressed this year. Keep refining.`,'muted'); render(); }),
    O('🍳','Open a new location','expand the empire',0,()=>{ closeSheet(); const cost=Math.min(p.money,200000); if(p.money<200000){log(`${p.first} needs $200,000 to open another location.`,'muted');render();return;} p.money-=cost; if(chance(60)){ p.salary=Math.round(p.salary*1.25); log(`${p.first}'s new location is packed every night. The empire grows.`,'big'); } else log(`The new spot struggled and drained cash. A hard lesson.`,'bad'); render(); }),
    O('📺','Become a celebrity chef','+fame, TV',0,()=>{ closeSheet(); if(p.stats.fame>20||chance(40)){ const deal=100000+rnd(2000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+15); setFlag(p,'celebChef'); log(`${p.first} landed a TV cooking show — ${money(deal)} and household-name fame.`,'big'); } else log(`No network bit on ${p.first}'s show idea yet.`,'muted'); render(); }),
    O('📕','Publish a cookbook','+$, +fame',0,()=>{ closeSheet(); const r=20000+rnd(500000); p.money+=r; p.stats.fame=clamp(p.stats.fame+6); log(`${p.first}'s cookbook sold well — ${money(r)} in royalties.`,'good'); render(); }),
  ],
  agent: (p)=>[
    O('🕵️','Take a deep-cover mission','+rep, high danger',0,()=>{ closeSheet(); if(chance(65)){ p.stats.fame=clamp(p.stats.fame+6); p.stats.smarts=clamp(p.stats.smarts+4); setFlag(p,'superspy'); log(`${p.first} pulled off an impossible op. The agency is impressed.`,'big'); } else { p.stats.health=clamp(p.stats.health-18); log(`The mission went sideways — ${p.first} barely made it out alive.`,'bad'); } render(); }),
    O('⬆️','Angle for promotion','Field Agent → Director',0,()=>{ closeSheet(); const odds=35+(hasFlag(p,'superspy')?20:0)+(p.stats.smarts>65?15:0); if(chance(odds)){ const ranks=['Recruit','Field Agent','Senior Agent','Station Chief','Director']; const cur=ranks.indexOf(p.jobTitle||'Recruit'); p.jobTitle=ranks[Math.min(ranks.length-1,cur+1)]; p.salary=Math.round(p.salary*1.3); log(`${p.first} was promoted to ${p.jobTitle}.`,'big'); } else log(`${p.first}'s promotion is still pending review.`,'muted'); render(); }),
    O('💼','Go private / freelance','+$$, no safety net',0,()=>{ closeSheet(); const fee=100000+rnd(2000000); p.money+=fee; p.stats.fame=clamp(p.stats.fame+4); log(`${p.first} took a lucrative private contract — ${money(fee)}.`,'good'); render(); }),
    O('🔓','Consider going rogue','dangerous path',0,()=>{ closeSheet(); if(chance(45)){ const score=1000000+rnd(10000000); p.money+=score; setFlag(p,'rogueAgent'); p.heat=(p.heat||0)+30; log(`${p.first} sold secrets and vanished with ${money(score)}. A wanted traitor now.`,'bad'); } else { p.inPrison=true; p.prisonYears=5+rnd(10); p.record.push('Treason'); endJob(p); log(`${p.first} was caught betraying the agency. Treason.`,'death'); } render(); }),
  ],
  nurse: (p)=>[
    O('🎓','Specialize (ICU, surgery)','+salary',0,()=>{ closeSheet(); p.salary=Math.round(p.salary*1.3); p.stats.smarts=clamp(p.stats.smarts+4); setFlag(p,'specializedNurse'); log(`${p.first} earned a specialty certification. The pay and respect grew.`,'big'); render(); }),
    O('💗','Go above and beyond for a patient','+joy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); setFlag(p,'goodHeart'); log(`${p.first} sat with a frightened patient long past their shift. This is why they do it.`,'good'); render(); }),
    O('🩺','Pick up overtime shifts','+$, −health',0,()=>{ closeSheet(); const bonus=Math.round(p.salary*0.15); p.money+=bonus; p.stats.health=clamp(p.stats.health-5); p.stress=clamp((p.stress||0)+10); log(`${p.first} worked grueling overtime — ${money(bonus)} extra, but exhausted.`,'muted'); render(); }),
    O('📋','Train toward nurse practitioner','career leap',0,()=>{ closeSheet(); if(p.stats.smarts>60&&chance(50)){ p.jobTitle='Nurse Practitioner'; p.salary=Math.round(p.salary*1.5); log(`${p.first} became a Nurse Practitioner — nearly a doctor's role.`,'big'); } else log(`${p.first} is still working toward the NP credential.`,'muted'); render(); }),
  ],
  teacher: (p)=>[
    O('🍎','Inspire a struggling student','+joy, +legacy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); setFlag(p,'belovedTeacher'); log(`${p.first} reached a kid everyone had given up on. Teaching at its finest.`,'good'); render(); }),
    O('📚','Pursue a master\'s & pay bump','+salary',0,()=>{ closeSheet(); const cost=Math.min(p.money,15000); p.money-=cost; p.salary=Math.round(p.salary*1.2); p.stats.smarts=clamp(p.stats.smarts+4); log(`${p.first} earned a master's degree and bumped up the pay scale.`,'good'); render(); }),
    O('🏫','Become department head / principal','+power',0,()=>{ closeSheet(); const odds=35+(p.jobYears>6?25:0); if(chance(odds)){ p.jobTitle='Principal'; p.salary=Math.round(p.salary*1.4); log(`${p.first} was promoted to Principal. Leading the whole school now.`,'big'); } else log(`${p.first} was passed over for the administrative role.`,'muted'); render(); }),
    O('☀️','Tutor or work over the summer','+$',0,()=>{ closeSheet(); const extra=3000+rnd(8000); p.money+=extra; log(`${p.first} tutored through the summer for ${money(extra)} extra.`,'good'); render(); }),
  ],
  engineer: (p)=>[
    O('💡','File a patent','+$$, +prestige',0,()=>{ closeSheet(); if(p.stats.smarts>60&&chance(45)){ const royalty=50000+rnd(2000000); p.money+=royalty; p.stats.fame=clamp(p.stats.fame+5); setFlag(p,'patentHolder'); log(`${p.first}'s invention got patented and licensed — ${money(royalty)}.`,'big'); } else log(`${p.first}'s patent application is still under review.`,'muted'); render(); }),
    O('🚀','Lead a flagship project','+salary, +stress',0,()=>{ closeSheet(); if(chance(60)){ p.salary=Math.round(p.salary*1.25); p.stats.fame=clamp(p.stats.fame+3); log(`${p.first} delivered a high-profile project. A raise and a reputation.`,'good'); } else { p.stress=clamp((p.stress||0)+12); log(`The project slipped and the stress piled on. ${p.first} is fried.`,'bad'); } render(); }),
    O('👔','Move into management','+salary',0,()=>{ closeSheet(); const odds=40+(p.jobYears>5?20:0); if(chance(odds)){ p.jobTitle='Engineering Manager'; p.salary=Math.round(p.salary*1.3); log(`${p.first} moved into engineering management.`,'big'); } else log(`${p.first} stayed on the technical track for now.`,'muted'); render(); }),
    O('🌙','Build a side project','maybe a windfall',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+3); if(chance(18)){ const exit=80000+rnd(2000000); p.money+=exit; log(`${p.first}'s side project found buyers — ${money(exit)}!`,'big'); } else log(`${p.first} tinkered on a side build. Good practice, if nothing else.`,'good'); render(); }),
  ],
  accountant: (p)=>[
    O('📊','Become a CPA','+salary, +prestige',0,()=>{ closeSheet(); if(p.stats.smarts>55&&chance(60)){ p.jobTitle='CPA'; p.salary=Math.round(p.salary*1.3); setFlag(p,'cpa'); log(`${p.first} passed the CPA exam. A serious credential.`,'big'); } else log(`${p.first} is still grinding through the CPA exams.`,'muted'); render(); }),
    O('🏦','Start your own practice','+$$, risk',0,()=>{ closeSheet(); if(hasFlag(p,'cpa')||chance(40)){ p.salary=Math.round(p.salary*1.5); setFlag(p,'ownPractice'); log(`${p.first} hung out their own shingle. Their own boss now.`,'big'); } else log(`${p.first} decided the timing wasn't right to go solo.`,'muted'); render(); }),
    O('🧾','Cook the books for a client','+$, very risky',0,()=>{ closeSheet(); if(chance(30)){ p.record.push('Accounting fraud'); p.stats.fame=clamp(p.stats.fame-10); if(chance(40)){p.inPrison=true;p.prisonYears=2+rnd(4);endJob(p);} log(`${p.first} got caught in a fraud investigation. Career over.`,'bad'); } else { const kick=30000+rnd(200000); p.money+=kick; setFlag(p,'corrupt'); log(`${p.first} fudged the numbers for a wealthy client — ${money(kick)} under the table.`,'muted'); } render(); }),
    O('💼','Specialize in high-net-worth clients','+salary',0,()=>{ closeSheet(); p.salary=Math.round(p.salary*1.2); log(`${p.first} built a book of wealthy clients. Steady, lucrative work.`,'good'); render(); }),
  ],
  realtor: (p)=>[
    O('🏡','Chase a luxury listing','big commission',0,()=>{ closeSheet(); if(p.stats.charming>55||chance(45)){ const comm=20000+rnd(400000); p.money+=comm; p.stats.fame=clamp(p.stats.fame+4); log(`${p.first} closed a luxury sale — ${money(comm)} commission.`,'big'); } else log(`The deal fell through at the last minute. Heartbreaking.`,'muted'); render(); }),
    O('📣','Build your personal brand','+future deals',0,()=>{ closeSheet(); if(!p.onSocial){p.onSocial=true;p.socialFollowers=startingFollowers(p);} p.socialFollowers+=rnd(8000); p.stats.fame=clamp(p.stats.fame+3); setFlag(p,'brandedRealtor'); log(`${p.first} put their face on benches and billboards. Leads are coming in.`,'good'); render(); }),
    O('🏘','Invest in a rental property','passive income',0,()=>{ closeSheet(); const cost=Math.min(p.money,120000); if(p.money<120000){log(`${p.first} needs $120,000 to buy an investment property.`,'muted');render();return;} p.money-=cost; p.businesses=p.businesses||[]; p.businesses.push({name:'Rental Property',value:130000,income:8400}); log(`${p.first} bought a rental, putting their expertise to work for themselves.`,'big'); render(); }),
    O('🏢','Open your own brokerage','+$$, ambitious',0,()=>{ closeSheet(); const odds=35+(p.jobYears>5?20:0); if(chance(odds)){ p.jobTitle='Broker/Owner'; p.salary=Math.round(p.salary*1.6); log(`${p.first} opened their own brokerage with agents under them.`,'big'); } else log(`${p.first} isn't quite ready to run their own shop.`,'muted'); render(); }),
  ],
  pilot: (p)=>[
    O('✈️','Upgrade to captain','+salary, +prestige',0,()=>{ closeSheet(); const odds=35+(p.jobYears>6?25:0); if(chance(odds)){ p.jobTitle='Captain'; p.salary=Math.round(p.salary*1.4); log(`${p.first} earned their fourth stripe — Captain now.`,'big'); } else log(`${p.first} is still building the hours for a captaincy.`,'muted'); render(); }),
    O('🌍','Fly international long-haul','+$, −health',0,()=>{ closeSheet(); const bonus=Math.round(p.salary*0.2); p.money+=bonus; p.stats.health=clamp(p.stats.health-4); p.stats.happy=clamp(p.stats.happy+4); log(`${p.first} flew the prestigious long-haul routes — ${money(bonus)} more, but jet-lagged.`,'muted'); render(); }),
    O('🛩','Handle an in-flight emergency','+rep, danger',0,()=>{ closeSheet(); if(p.stats.smarts>50||chance(70)){ p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'heroPilot'); log(`${p.first} landed a crippled jet safely. Passengers owe them their lives.`,'big'); } else { p.stats.health=clamp(p.stats.health-10); log(`A rough emergency landing shook ${p.first} to the core. Everyone survived.`,'muted'); } render(); }),
    O('🎓','Become a flight instructor','+legacy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+5); setFlag(p,'mentor'); log(`${p.first} began training the next generation of pilots.`,'good'); render(); }),
  ],
  vet: (p)=>[
    O('🐕','Open your own clinic','+$$, risk',0,()=>{ closeSheet(); const cost=Math.min(p.money,80000); if(p.money<80000){log(`${p.first} needs $80,000 to open a clinic.`,'muted');render();return;} p.money-=cost; if(chance(65)){ p.salary=Math.round(p.salary*1.4); setFlag(p,'ownClinic'); log(`${p.first} opened a thriving animal clinic. Their own practice at last.`,'big'); } else log(`The clinic struggled to attract clients at first. A tough start.`,'muted'); render(); }),
    O('💉','Save a beloved pet against the odds','+joy, +rep',0,()=>{ closeSheet(); if(chance(70)){ p.stats.happy=clamp(p.stats.happy+8); setFlag(p,'goodHeart'); log(`${p.first} pulled off a miracle surgery. A family's best friend lived.`,'good'); } else { p.stats.happy=clamp(p.stats.happy-6); log(`Despite ${p.first}'s best efforts, they couldn't save the animal. Heartbreaking.`,'bad'); } render(); }),
    O('🦁','Specialize in exotic animals','+niche income',0,()=>{ closeSheet(); p.stats.smarts=clamp(p.stats.smarts+4); p.salary=Math.round(p.salary*1.25); setFlag(p,'exoticVet'); log(`${p.first} became the go-to vet for zoos and exotic pets. A rare specialty.`,'good'); render(); }),
    O('🐾','Volunteer at an animal shelter','+joy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+6); setFlag(p,'goodHeart'); log(`${p.first} gave their weekends to shelter animals nobody else would help.`,'good'); render(); }),
  ],
};
// everyday careers that share a choice set
CAREER_CHOICES.analyst = CAREER_CHOICES.accountant;
CAREER_CHOICES.corporate = CAREER_CHOICES.engineer;
CAREER_CHOICES.chef = CAREER_CHOICES.restaurateur;
// careers that share a choice set
CAREER_CHOICES.judge = CAREER_CHOICES.lawyer;
CAREER_CHOICES.musician = CAREER_CHOICES.popstar;
CAREER_CHOICES.moviestar = CAREER_CHOICES.popstar;
CAREER_CHOICES.nba = CAREER_CHOICES.proathlete;
CAREER_CHOICES.nfl = CAREER_CHOICES.proathlete;
CAREER_CHOICES.soccer = CAREER_CHOICES.proathlete;
CAREER_CHOICES.aistartup = CAREER_CHOICES.founder;
CAREER_CHOICES.scientist = CAREER_CHOICES.professor;

function openCareer(){
  const p=me();
  const c=CAREER(p.job);
  let html=`<div class="grab"></div><h3>${p.first}'s career</h3>`;
  const opts=[];

  if(p.inPrison){
    html+=`<p class="hint">No career behind bars — see the Do tab for prison life.</p>`;
    sheet(html+opts.join(''), sh=>bindOpts(sh));
    return;
  }

  if(p.age<18 && !p._college){
    html+=`<p class="hint">Career options open up at 18. For now, focus on school and growing up.</p>`;
    // still allow part-time gigs from here for teens
    if(p.age>=13){
      if(!p.partTime){
        opts.push(OH('— Part-time gig —'));
        [['🍔','Fast food',9000],['🛒','Grocery bagger',8000],['📰','Paper route',5000],['🐕','Dog walker',6000],['💻','Online freelance',12000]].forEach(([ic,nm,pay])=>{
          opts.push(O(ic,nm,`~${money(pay)}/yr · builds savings`,0,()=>{p.partTime={name:nm,pay};closeSheet();log(`${p.first} picked up work as a ${nm.toLowerCase()}.`,'good');render();}));
        });
      } else {
        opts.push(O('🧺','Quit part-time job',p.partTime.name,0,()=>{closeSheet();log(`${p.first} quit the ${p.partTime.name.toLowerCase()} job.`,'muted');p.partTime=null;render();}));
      }
    }
    sheet(html+opts.join(''), sh=>bindOpts(sh));
    return;
  }

  if(p.job==='none'){
    // RETIRED — a distinct, dignified state with its own income and activities
    if(p.retired){
      const ssActive = p.age>=65||p.claimedSS;
      const ss = ssActive ? Math.round(Math.min(45000,12000+(p.careerYears||0)*700)*(p.claimedSS&&p.age<65?0.7:1)) : 0;
      html+=`<div style="padding:4px 20px 10px">
        <div style="font-size:13px;color:var(--ink-dim)">🌅 Retired</div>
        <div style="font-size:20px;font-weight:600;margin:2px 0">Enjoying the golden years</div>
        <div style="font-size:13px;color:var(--gold)">${p.pension>0?money(p.pension)+'/yr pension':'no pension'}${ss>0?' · '+money(ss)+'/yr Social Security':(p.age<65?' · Social Security at 65':'')}</div>
      </div>`;
      opts.push(OH('— Retirement life —'));
      if(!p.partTime){
        opts.push(O('🧑‍💼','Take an encore part-time job','+income, +purpose',0,()=>{ const pay=8000+rnd(25000); p.partTime={name:'Encore work',pay}; closeSheet(); p.stats.happy=clamp(p.stats.happy+6); log(`${p.first} took easygoing part-time work — ${money(pay)}/yr.`,'good'); render(); }));
      } else {
        opts.push(O('🧺','Stop the part-time work',p.partTime.name,0,()=>{ closeSheet(); p.partTime=null; log(`${p.first} hung up the part-time job for good.`,'muted'); render(); }));
      }
      if((p.peakSalary||0)>50000){
        opts.push(O('💼','Consult in your old field','+$$',0,()=>{ closeSheet(); const fee=Math.round((p.peakSalary||50000)*(0.3+Math.random()*0.5)); p.money+=fee; p.stats.happy=clamp(p.stats.happy+4); log(`${p.first} cashed in on decades of expertise — ${money(fee)} in consulting.`,'good'); render(); }));
      }
      opts.push(O('🤝','Volunteer','+joy, +legacy',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+8); p.stats.health=clamp(p.stats.health+2); setFlag(p,'goodHeart'); log(`${p.first} spent their days giving back. A meaningful retirement.`,'good'); render(); }));
      opts.push(O('🎣','Enjoy a hobby','+joy, +health',0,()=>{ closeSheet(); p.stats.happy=clamp(p.stats.happy+7); p.stats.health=clamp(p.stats.health+4); p.stress=clamp((p.stress||0)-10); log(`${p.first} lost a happy afternoon in a favorite pastime.`,'good'); render(); }));
      if(!p.claimedSS && p.age>=62 && p.age<65){
        opts.push(O('📋','Claim Social Security early','reduced, but now',0,()=>{ closeSheet(); p.claimedSS=true; log(`${p.first} began claiming Social Security early at a reduced rate.`,'muted'); render(); }));
      }
      opts.push(OH('— Back to work? —'));
      opts.push(O('🔄','Come out of retirement','find a new job',0,()=>{ closeSheet(); p.retired=false; openCareer(); }));
      sheet(html+opts.join(''), sh=>bindOpts(sh));
      return;
    }
    html+=`<p class="hint">${p.first} isn't working right now. Time to find a path.</p>`;
    // offer retirement instead of a job for older characters who've worked
    if(p.age>=60 && (p.careerYears||0)>=3){
      opts.push(OH('— A well-earned rest —'));
      const yrs=p.careerYears||0; const peak=Math.max(p.peakSalary||0,0); const est=Math.round(peak*Math.min(0.6,0.012*yrs));
      opts.push(O('🌅','Retire',`${est>0?money(est)+'/yr pension':'live off savings'} + Social Security`,0,()=>{ closeSheet(); doRetire(p); p.stats.happy=clamp(p.stats.happy+12); p.stress=clamp((p.stress||0)-20); render(); }));
    }
    opts.push(OH('— Find a career —'));
    CAREERS.filter(c=>c.k!=='none').forEach(c=>{
      const eduGate = p.edu < c.edu;
      const athGate = (c.k==='nba' && p.stats.athletic<82) || (c.k==='soccer' && p.stats.athletic<80) || (c.athGate && p.stats.athletic<c.athGate);
      const looksGate = c.looksGate && p.stats.looks < c.looksGate;
      const dis = eduGate || athGate || looksGate;
      let sub;
      if(athGate) sub='needs athleticism '+(c.athGate||80)+'+';
      else if(looksGate) sub=`needs looks ${c.looksGate}+`;
      else if(eduGate) sub=`needs ${EDU[c.edu]}`;
      else if(c.staged) sub=`climb from ${c.stages[0].t} to the top`;
      else sub = c.wild?'a long shot — high ceiling':`~${money(c.base)} to start`;
      opts.push(O(c.emoji,c.l,sub,0,()=>takeJob(p,c.k),dis));
    });
    sheet(html+opts.join(''), sh=>bindOpts(sh));
    return;
  }

  // EMPLOYED — show status + advancement + per-profession choices
  const title = p.jobTitle ? p.jobTitle : c.l;
  html+=`<div style="padding:4px 20px 10px">
    <div style="font-size:13px;color:var(--ink-dim)">${c.emoji} ${c.l}</div>
    <div style="font-size:20px;font-weight:600;margin:2px 0">${title}</div>
    <div style="font-size:13px;color:var(--gold)">${money(p.salary)}/yr · ${p.jobYears||0} yr${(p.jobYears||0)===1?'':'s'} in</div>
    ${c.staged && p._stage!=null && c.stages[p._stage+1] ? `<div style="font-size:11.5px;color:var(--ink-faint);margin-top:3px">Next: ${c.stages[p._stage+1].t}${c.stages[p._stage+1].req?` · needs ${c.keyStat||'smarts'} ${c.stages[p._stage+1].req}+ (you: ${Math.round(p.stats[c.keyStat||'smarts'])})`:''}</div>`:''}
  </div>`;

  // staged training / lay-low
  if(c.staged && p._stage!=null){
    if(c.crime){
      opts.push(OH('— The life —'));
      opts.push(O('🤫','Lay low this year','cut the heat, less income',0,()=>{ p.salary=Math.round(p.salary*0.4); p._layLow=true; closeSheet(); log(`${p.first} kept a low profile, taking fewer risks.`,'muted'); render(); }));
    } else {
      const key=c.keyStat||'smarts';
      opts.push(OH('— Advancement —'));
      opts.push(O('🔥','Train hard',`+${key}, costs health & joy`,0,()=>{ p.stats[key]=clamp(p.stats[key]+4+rnd(3)); p.stats.health=clamp(p.stats.health-3); p.stats.happy=clamp(p.stats.happy-3); p.stress=clamp((p.stress||0)+6); closeSheet(); log(`${p.first} trained relentlessly. ${capFirst(key)} is sharper.`,'good'); render(); }));
    }
  }

  // POWER-ASSISTED CAREER ACTION — when a power is relevant to this job
  const usefulPower = relevantPower(p);
  if(usefulPower){
    const m=POWER_CAREER[usefulPower];
    opts.push(OH(`— Your power: ${usefulPower} —`));
    opts.push(O('✨',`Use ${usefulPower} on the job`,`you ${m.line(p)} · big edge`,0,()=>{ closeSheet();
      // a near-guaranteed windfall/advancement using the power
      const gain=Math.round((p.salary||40000)*(0.5+Math.random()*1.5))+20000;
      p.money+=gain; p.stats.fame=clamp(p.stats.fame+4);
      // chance to leap a rung/stage or land a defining win
      const c2=CAREER(p.job);
      if(c2.ladder && (p._rung??0)<c2.ladder.length-1 && chance(70)){ p._rung=(p._rung??0)+1; p.jobTitle=c2.ladder[p._rung]; p.salary=Math.round(p.salary*1.3); log(`${p.first} used ${usefulPower} to vault ahead — now ${p.jobTitle}, ${money(gain)} richer.`,'big'); }
      else if(c2.staged && c2.stages[(p._stage??0)+1] && chance(60)){ p._stage=(p._stage??0)+1; p._stageYears=0; p.jobTitle=c2.stages[p._stage].t; log(`${p.first} leveraged ${usefulPower} into a breakthrough — now ${p.jobTitle}, ${money(gain)} earned.`,'big'); }
      else log(`${p.first} used ${usefulPower} to dominate the work — ${money(gain)} earned, and untouchable in their field.`,'big');
      render();
    }));
    // a flavored, profession-specific power flourish
    if(['lawyer','judge'].includes(p.job) && (hasPower(p,'telepathy')||hasPower(p,'mind control'))){
      opts.push(O('⚖️','Read the jury\'s minds','win the unwinnable case',0,()=>{ closeSheet(); const fee=50000+rnd(500000); p.money+=fee; p.stats.fame=clamp(p.stats.fame+8); setFlag(p,'undefeatedLawyer'); log(`${p.first} knew every juror's thoughts and won decisively — ${money(fee)}. They never lose now.`,'big'); render(); }));
    }
    if(['nba','nfl','soccer'].includes(p.job) && (hasPower(p,'super strength')||hasPower(p,'super speed')||hasPower(p,'time manipulation'))){
      opts.push(O('🏆','Dominate the championship','an unstoppable season',0,()=>{ closeSheet(); const bonus=2000000+rnd(20000000); p.money+=bonus; p.stats.fame=clamp(p.stats.fame+20); p.champion=true; setFlag(p,'sportsLegend'); worldEvent(p,`${p.first} had the greatest season in the sport's history.`,{hope:true}); log(`🏆 ${p.first} steamrolled to the title — superhuman, untouchable. ${money(bonus)}.`,'big'); render(); }));
    }
    if(hasPower(p,'technopathy') && ['tech','aistartup','founder','engineer'].includes(p.job)){
      opts.push(O('💻','Will the product into existence','ship the impossible',0,()=>{ closeSheet(); const val=1000000+rnd(50000000); p.money+=Math.round(val*0.2); p.stats.fame=clamp(p.stats.fame+12); log(`${p.first} spoke directly to the machines and shipped something miraculous — ${money(Math.round(val*0.2))}.`,'big'); render(); }));
    }
  }

  // PER-PROFESSION CHOICES
  const choiceFn = CAREER_CHOICES[p.job];
  if(choiceFn){
    opts.push(OH(`— ${c.l} decisions —`));
    choiceFn(p).forEach(o=>opts.push(o));
  }

  // generic work actions
  opts.push(OH('— On the job —'));
  opts.push(O('💼','Work harder this year','+pay odds, −health',0,()=>{p.stats.happy=clamp(p.stats.happy-4);p.stats.health=clamp(p.stats.health-3);if(chance(45)){const b=Math.round(p.salary*0.12);p.money+=b;closeSheet();log(`${p.first} grinded and pocketed a ${money(b)} bonus.`,'good');render();}else{closeSheet();log(`${p.first} worked hard. Nobody noticed.`,'muted');render();}}));
  opts.push(O('💬','Ask for a raise','+salary maybe',0,()=>{ closeSheet(); const odds=40+(p.jobYears>3?15:0)+(p.stats.charming>55?15:0); if(chance(odds)){ const r=Math.round(p.salary*(0.08+Math.random()*0.12)); p.salary+=r; log(`${p.first} negotiated a ${money(r)} raise.`,'good'); } else log(`The boss said "maybe next year." ${p.first} fumed.`,'muted'); render(); }));
  opts.push(O('🚪','Quit this job','walk away',0,()=>{closeSheet();endJob(p,`${p.first} quit. Free, for now.`);render();}));
  if(p.age>=60 && (p.careerYears||p.jobYears||0)>=3){
    const yrs=p.careerYears||p.jobYears||0; const peak=Math.max(p.peakSalary||0,p.salary||0); const est=Math.round(peak*Math.min(0.6,0.012*yrs));
    opts.push(O('🌅','Retire',`${est>0?money(est)+'/yr pension':'live off savings'} + Social Security`,0,()=>{ closeSheet(); doRetire(p); p.stats.happy=clamp(p.stats.happy+12); p.stress=clamp((p.stress||0)-20); render(); }));
  }

  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

function openActivities(){
  const p=me();
  let html=`<div class="grab"></div><h3>What will ${p.first} do?</h3><p class="hint">Age ${p.age} · ${money(p.money)} in purse</p>`;
  const opts=[];

  // ===== PRISON MODE: a separate world of options while locked up =====
  if(p.inPrison){
    html=`<div class="grab"></div><h3>Life inside</h3><p class="hint">${SECURITY_NAMES[p.securityLevel||0]} · respect ${Math.round(p.prisonRep||0)}/100${p.prisonRole==='shotcaller'?' · YOU RUN THIS BLOCK':''}</p>`;
    opts.push(OH('— Doing time —'));
    opts.push(O('🏋️','Work out in the yard','+athletic, +rep',0,()=>{ p.stats.athletic=clamp(p.stats.athletic+4); p.stats.health=clamp(p.stats.health+2); p.prisonRep=clamp((p.prisonRep||0)+3); closeSheet(); log(`${p.first} put in serious work in the prison yard.`,'good'); render(); }));
    opts.push(O('📚','Use the prison library','+smarts',0,()=>{ p.stats.smarts=clamp(p.stats.smarts+4); closeSheet(); log(`${p.first} spent the day reading. The mind stays free.`,'good'); render(); }));
    opts.push(O('🤝','Build your reputation','+rep, risk',0,()=>{ closeSheet(); if(chance(70)){ p.prisonRep=clamp((p.prisonRep||0)+8); log(`${p.first} earned respect on the block.`,'good'); } else { p.stats.health=clamp(p.stats.health-8); p.prisonRep=clamp((p.prisonRep||0)+2); log(`${p.first} got into a scrap proving themselves. Bruised but tougher.`,'muted'); } render(); }));
    if((p.prisonRep||0)>=20){
      opts.push(OH('— The hustle —'));
      opts.push(O('📦','Run contraband','+money, risk',0,()=>{ closeSheet(); if(chance(22)){ p.prisonYears+=1; log(`${p.first} got caught smuggling — time added.`,'bad'); } else { const t=200+rnd(1500); p.money+=t; setFlag(p,'prisonNetwork'); log(`${p.first}'s smuggling cleared ${money(t)}.`,'good'); } render(); }));
      opts.push(O('💪','Throw your weight around','+rep, risk',0,()=>{ closeSheet(); if(p.stats.athletic>50||chance(55)){ p.prisonRep=clamp((p.prisonRep||0)+10); log(`${p.first} made an example of someone. The block fell in line.`,'good'); } else { p.stats.health=clamp(p.stats.health-12); log(`${p.first} picked the wrong target and took a beating.`,'bad'); } render(); }));
    }
    // boss-track: build a crew inside, climb toward running the block
    if((p.prisonRep||0)>=30 && p.prisonRole!=='shotcaller'){
      opts.push(OH('— Building power —'));
      opts.push(O('🧑‍🤝‍🧑','Recruit inmates to your crew','+future minions',0,()=>{ closeSheet(); if(chance(70)){ p.minions=(p.minions||0)+1; p.minionPower=clamp((p.minionPower||0)+4); p.prisonRep=clamp((p.prisonRep||0)+6); setFlag(p,'recruitedInside'); log(`${p.first} brought another soldier into the fold — they'll serve on the outside too.`,'good'); } else { log(`${p.first}'s recruitment pitch fell flat this time.`,'muted'); } render(); }));
      opts.push(O('👑','Make a play for the block','seize control, risky',0,()=>{ closeSheet(); if((p.prisonRep||0)>=70&&chance(55)){ p.prisonRole='shotcaller'; p.prisonRep=100; worldEvent(p,`${p.first} seized control of the entire prison.`,{fear:true}); log(`${p.first} took the block by force. The throne behind bars is theirs.`,'big'); } else if((p.prisonRep||0)>=70){ p.stats.health=clamp(p.stats.health-18); log(`${p.first}'s power play was crushed. They'll need to rebuild.`,'bad'); } else { log(`${p.first} isn't feared enough yet to make that move. Build more respect first.`,'muted'); } render(); }));
    }
    if(p.prisonRole==='shotcaller'){
      opts.push(OH('— Running the block —'));
      opts.push(O('👑','Collect tribute','+big money',0,()=>{ closeSheet(); const t=2000+rnd(8000); p.money+=t; log(`Tribute from the whole prison: ${money(t)}.`,'good'); render(); }));
      opts.push(O('🤝','Corrupt a guard','+freedom inside',0,()=>{ closeSheet(); const c=Math.min(p.money,3000); p.money-=c; setFlag(p,'ownsGuard'); log(`${p.first} put another guard on the payroll. The walls mean less every day.`,'muted'); render(); }));
      opts.push(O('📡','Run your empire from inside','+outside power',0,()=>{ closeSheet(); if(p.job==='crimelord'){ p.territory=clamp((p.territory||0)+3); log(`${p.first} kept the organization running through coded messages. The territory holds.`,'good'); } else { p.minionPower=clamp((p.minionPower||0)+4); log(`${p.first} kept the crew sharp and loyal from behind bars.`,'good'); } render(); }));
    }
    // model behavior toward parole
    if(!p.lifeSentence){
      opts.push(OH('— The long game —'));
      opts.push(O('😇','Be a model inmate','+parole odds',0,()=>{ setFlag(p,'modelInmate'); p.stats.happy=clamp(p.stats.happy+2); closeSheet(); log(`${p.first} kept their record spotless. The parole board notices.`,'good'); render(); }));
    }
    // escape (for crime bosses / villains) still available via the yearly choice, but offer a manual attempt
    if(canAttemptEscape(p)){
      opts.push(OH('— Desperate measures —'));
      opts.push(O('🪜','Plan an escape','very risky',0,()=>{ closeSheet(); showEscapeChoice(p, ()=>render()); }));
    }
    sheet(html+opts.join(''), sh=>bindOpts(sh));
    return;
  }

  // CORE FREE-TIME — always pinned to the very top (most-used actions)
  if(p.age>=4){
    opts.push(OH('— Free time —'));
    opts.push(O('🏋️','Hit the gym','+health, +athletic, +looks',0,()=>{p.stats.health=clamp(p.stats.health+5);p.stats.athletic=clamp(p.stats.athletic+4);p.stats.looks=clamp(p.stats.looks+2);closeSheet();log(`${p.first} put in work at the gym.`,'good');render();}));
    opts.push(O('📕','Study something','+smarts',0,()=>{p.stats.smarts=clamp(p.stats.smarts+5);closeSheet();log(`${p.first} read late into the night. Sharper for it.`,'good');render();}));
    opts.push(O('🎉','Go out','+joy, −a little money',-300,()=>{p.stats.happy=clamp(p.stats.happy+8);p.money-=Math.min(p.money,300);closeSheet();log(`${p.first} had a night to remember (mostly).`,'good');render();}));
    opts.push(O('🧘','Rest & reflect','+health, +joy',0,()=>{p.stats.health=clamp(p.stats.health+3);p.stats.happy=clamp(p.stats.happy+4);closeSheet();log(`A slow, restful stretch did ${p.first} good.`,'good');render();}));
  }

  // EDUCATION
  if(p.age>=18 && p.edu<3 && !p._college){
    if(p.edu<1) opts.push(O('🛠','Trade school / academy','2 years · opens skilled work',-6000,()=>enrollCollege(p,1,2)));
    if(p.edu<2 && p.stats.smarts>=45) opts.push(O('🎓','University','4 years · earn a degree',-30000,()=>enrollCollege(p,2,4)));
    if(p.edu>=2 && p.stats.smarts>=65) opts.push(O('📚','Graduate school','4 years · become a doctor/lawyer',-45000,()=>enrollCollege(p,3,4)));
    if(p.stats.smarts<45 && p.edu<2) opts.push(O('🚫','University','smarts too low to enroll',0,null,true));
  }
  if(p._college){ opts.push(O('📖','In school',`${p._college} year(s) of ${EDU[p._collegeTier]} left`,0,null,true)); }

  // HIGH-SCHOOL CLUBS (ages 13-18, in school)
  if(p.age>=13 && p.age<=18 && p.inSchool){
    opts.push(OH('— School clubs —'));
    CLUBS.forEach(cl=>{
      const joined=p.clubs.includes(cl.k);
      const helpsCareer=CAREER(cl.helps);
      opts.push(O(cl.emoji, cl.l, joined?'✓ member · building '+cl.blurb:`+${cl.stat} yearly · helps future ${helpsCareer?helpsCareer.l:cl.helps}`,0,()=>{
        if(joined){ p.clubs=p.clubs.filter(x=>x!==cl.k); closeSheet(); log(`${p.first} quit ${cl.l}.`,'muted'); render(); }
        else { p.clubs.push(cl.k); p.stats[cl.stat]=clamp(p.stats[cl.stat]+cl.boost); setFlag(p,cl.flag); closeSheet(); log(`${p.first} joined ${cl.l}.`,'good'); render(); }
      }));
    });
  }

  // COLLEGE LIFE — Greek life + sports, only while at university
  if(p._college && p._collegeTier>=2){
    opts.push(OH('— Greek life —'));
    if(!p.greek){
      GREEK.forEach(g=>{
        // sororities for women, fraternities for men; non-binary can pick either
        if((g.kind==='fraternity'&&p.sex==='f')||(g.kind==='sorority'&&p.sex==='m')) return;
        opts.push(O(g.emoji, g.l, `${g.kind} · ${g.vibe}`,0,()=>{
          p.greek=g.k; p.stats[g.stat]=clamp(p.stats[g.stat]+6); setFlag(p,'greek_'+g.perk);
          closeSheet(); log(`${p.first} pledged ${g.l} — ${g.vibe}.`,'big'); render();
        }));
      });
    } else {
      const g=GREEK.find(x=>x.k===p.greek);
      opts.push(O(g.emoji, g.l, '✓ member · '+g.vibe, 0, null, true));
    }
    opts.push(OH('— College sports —'));
    if(!p.collegeSport){
      COLLEGE_SPORTS.forEach(s=>{
        opts.push(O(s.emoji, s.l, p.stats.athletic>=55?`walk on · path to ${s.olympics?'the Olympics':CAREER(s.pro).l}`:'need more athletic ability',0,()=>{
          p.collegeSport=s.k; p.stats.athletic=clamp(p.stats.athletic+4);
          closeSheet(); log(`${p.first} made the ${s.l.toLowerCase()} team.`,'good'); render();
        }, p.stats.athletic<55));
      });
    } else {
      const s=COLLEGE_SPORTS.find(x=>x.k===p.collegeSport);
      opts.push(O(s.emoji, s.l, '✓ on the team · train in the gym to improve', 0, null, true));
    }
  }

  // PART-TIME (teens 13-17, or students)
  if((p.age>=13 && p.age<18) || p._college){
    if(!p.partTime){
      opts.push(OH('— Part-time gig —'));
      [['🍔','Fast food',9000],['🛒','Grocery bagger',8000],['📰','Paper route',5000],['🐕','Dog walker',6000],['💻','Online freelance',12000]].forEach(([ic,nm,pay])=>{
        opts.push(O(ic,nm,`~${money(pay)}/yr · builds savings`,0,()=>{p.partTime={name:nm,pay};closeSheet();log(`${p.first} picked up work as a ${nm.toLowerCase()}.`,'good');render();}));
      });
    } else {
      opts.push(O('🧺','Quit part-time job',p.partTime.name,0,()=>{closeSheet();log(`${p.first} quit the ${p.partTime.name.toLowerCase()} job.`,'muted');p.partTime=null;render();}));
    }
  }

  // WORK — now lives in the dedicated Career tab
  if(p.age>=18){
    opts.push(OH('— Work —'));
    if(p.job==='none'){
      opts.push(O('💼','Find a career','browse jobs in the Career tab',0,()=>{ closeSheet(); openCareer(); }));
    } else {
      const c=CAREER(p.job);
      opts.push(O('💼',`Manage your career`,`${p.jobTitle||c.l} · open the Career tab`,0,()=>{ closeSheet(); openCareer(); }));
    }
  }

  // CITIZENSHIP & POWER (adults)
  if(p.age>=18){
    opts.push(OH('— Country & power —'));
    const here = p.citizenship || G.country || 'your country';
    // emigrate
    opts.push(O('🛂','Emigrate abroad',`leave ${here} · $20,000`,0,()=>{
      if(p.money<20000){ closeSheet(); log(`${p.first} can't afford to emigrate.`,'muted'); render(); return; }
      const dest=pick(BIRTHPLACES.filter(b=>b[1]!==here)); p.money-=20000; p.citizenship=dest[1]; G.country=dest[1];
      closeSheet(); log(`${p.first} emigrated to ${dest[0]}, ${dest[1]} and began a new life.`,'big'); render();
    }, p.money<20000));
    // seek to rule (president/PM via politics, or monarchy via fame/wealth)
    if(!p.ruler){
      opts.push(O('👑','Seek to rule the nation',`run for power in ${here}`,0,()=>{
        closeSheet();
        const country=p.citizenship||G.country||'the nation';
        // odds based on fame, money, smarts, charming trait
        const odds = 8 + p.stats.fame*0.4 + (p.money>1000000?15:p.money>200000?6:0) + (p.traits.includes('charming')?12:0) + p.stats.looks*0.1;
        if(chance(odds)){
          const title=pick(['President','Prime Minister','Supreme Leader','Chancellor']);
          p.ruler={title,country}; p.salary=Math.max(p.salary,400000); p.stats.fame=clamp(p.stats.fame+30);
          log(`By will and fortune, ${p.first} became ${title} of ${country}. Power, at last.`,'big');
        } else {
          const cost=Math.min(p.money,20000+rnd(80000)); p.money-=cost;
          log(`${p.first}'s bid for power failed. The campaign cost ${money(cost)}.`,'bad');
        }
        render();
      }));
    } else {
      // ruling actions
      opts.push(O('📜','Pass a law',`as ${p.ruler.title} of ${p.ruler.country}`,0,()=>{
        closeSheet();
        const law=pick([
          {t:`${p.first} abolished income tax. The people rejoiced.`,f:{happy:8,fame:6}},
          {t:`${p.first} declared a national holiday in their own honor.`,f:{fame:10,happy:4}},
          {t:`${p.first} nationalized industry, filling the treasury.`,f:{money:500000,fame:-4}},
          {t:`${p.first} funded schools and hospitals nationwide.`,f:{fame:12,happy:6}},
          {t:`${p.first} cracked down on dissent. Feared, not loved.`,f:{fame:8,happy:-6}},
        ]);
        worldEvent(p, law.t, {}); fx(p, law.f); render();
      }));
      opts.push(O('🏛','Hold onto power','survive the next election/coup',0,()=>{
        closeSheet();
        if(chance(p.stats.fame>50?75:55)){ log(`${p.first} held onto power another term.`,'good'); }
        else { log(`${p.first} was overthrown and lost the ${p.ruler.title.toLowerCase()}ship.`,'bad'); p.ruler=null; p.stats.happy=clamp(p.stats.happy-15); if(chance(30)){p.inPrison=true;p.prisonYears=3+rnd(6);log(`${p.first} was imprisoned by the new regime.`,'bad');} }
        render();
      }));
    }
  }

  // HERO / VILLAIN ACTIONS (proactive deeds)
  if(p.job==='superhero' && !p.inPrison){
    opts.push(OH(`— Heroics — rep ${Math.round(p.heroRep||0)} · ${p.livesSaved||0} lives saved · gear lvl ${p.gadgetLevel||0} —`));
    // PATROL — scales with gadget level & powers; builds reputation and saves lives
    opts.push(O('🚨','Patrol the city','stop crime · +rep, +fame',0,()=>{ closeSheet();
      const skill = (p.stats.athletic*0.3) + (p.powers?p.powers.length*10:0) + (p.gadgetLevel||0)*6;
      if(chance(60+skill*0.2)){
        const saved=1+rnd(4); p.livesSaved=(p.livesSaved||0)+saved; p.heroRep=clamp((p.heroRep||0)+5); p.stats.fame=clamp(p.stats.fame+4);
        if(p.sidekick) p.sidekick.bond=clamp(p.sidekick.bond+3);
        log(`${p.first} foiled a crime on patrol and saved ${saved} ${saved===1?'life':'lives'}. The city feels safer.`,'good');
      } else {
        p.stats.health=clamp(p.stats.health-12);
        if((p.gadgetLevel||0)>0 || (p.powers&&p.powers.length)) log(`${p.first} got hurt in a brutal fight, but pulled through thanks to ${(p.powers&&p.powers.length)?'their powers':'their gear'}.`,'muted');
        else log(`${p.first} got badly hurt breaking up an armed robbery.`,'bad');
      }
      render();
    }));
    opts.push(O('🦾','Train your powers','+power chance, +athletic',0,()=>{ closeSheet(); if(chance(30)){ const pow=grantPower(p); if(pow){ log(`${p.first} unlocked a new ability: ${pow}!`,'big'); render(); return; } } p.stats.athletic=clamp(p.stats.athletic+4); log(`${p.first} honed their abilities in secret.`,'good'); render(); }));
    // GADGETS / BASE — upgradeable gear that boosts heroics
    const gl=p.gadgetLevel||0;
    const gnames=['','Workshop','Hi-tech Lab','Secret Lair','Hero Fortress','Orbital HQ'];
    if(gl<5){
      const cost=[50000,200000,800000,3000000,12000000][gl];
      opts.push(O('🛠',`Upgrade your gear → ${gnames[gl+1]}`,`${money(cost)} · stronger heroics`,0,()=>{ if(p.money<cost){closeSheet();log(`${p.first} needs ${money(cost)} for that upgrade.`,'muted');render();return;} p.money-=cost; p.gadgetLevel=gl+1; setFlag(p,'hasLair'); closeSheet(); log(`${p.first} upgraded to a ${gnames[gl+1]}. The fight against crime just got an edge.`,'big'); render(); }));
    }
    // SIDEKICK
    if(!p.sidekick){
      opts.push(O('🧑‍🚀','Take on a sidekick','a partner in the fight',0,()=>{ closeSheet(); p.sidekick={name:newFirst(makeSex())+' '+pick(LAST), bond:60}; log(`${p.first} took on a sidekick: ${p.sidekick.name.split(' ')[0]}. The duo begins.`,'good'); render(); }));
    } else {
      opts.push(O('🤝','Train your sidekick','+their bond & skill',0,()=>{ closeSheet(); p.sidekick.bond=clamp(p.sidekick.bond+8); p.heroRep=clamp((p.heroRep||0)+2); log(`${p.first} mentored ${p.sidekick.name.split(' ')[0]}. A formidable team.`,'good'); render(); }));
    }
    // FUND THE FIGHT — heroes can monetize their fame
    opts.push(O('💰','Endorsements & merch','turn fame into funding',0,()=>{ closeSheet(); if(p.stats.fame<15){log(`${p.first} isn't famous enough yet for big deals.`,'muted');render();return;} const deal=Math.round((p.stats.fame*1000)+(p.heroRep||0)*2000+rnd(200000)); p.money+=deal; log(`${p.first} signed endorsements worth ${money(deal)} to fund the mission.`,'good'); render(); }));
    // CONFRONT NEMESIS proactively
    if(p.nemesis){
      opts.push(O('💥',`Hunt down ${p.nemesis.name}`,'take the fight to your nemesis',0,()=>{ closeSheet();
        const skill=(p.stats.athletic*0.3)+(p.powers?p.powers.length*10:0)+(p.gadgetLevel||0)*8+(p.sidekick?10:0);
        if(chance(45+skill*0.2)){ p.nemesis.defeated=(p.nemesis.defeated||0)+1; p.heroRep=clamp((p.heroRep||0)+10); p.stats.fame=clamp(p.stats.fame+12);
          if(p.nemesis.defeated>=3){ const beaten=p.nemesis.name; worldEvent(p,`${p.first} put ${beaten} behind bars for good.`,{hope:true}); p.nemesis=null; log(`${p.first} finally defeated ${beaten} for good. The city is safer.`,'big'); }
          else log(`${p.first} bested ${p.nemesis.name} again (${p.nemesis.defeated}/3). They'll be back.`,'big');
        } else { p.stats.health=clamp(p.stats.health-20); log(`${p.nemesis.name} got the better of ${p.first} this time. A painful defeat.`,'bad'); }
        render();
      }));
    }
  }
  if(p.job==='villain' && !p.inPrison){
    opts.push(OH(`— Villainy — ${p.minions||0} minions · crew power ${Math.round(p.minionPower||0)} · heat ${p.heat||0} 🔥`));
    // CRIME SPREE — scales with net worth so big-time villains pull big-time scores
    opts.push(O('💣','Commit a crime spree','+money (scales with your empire), +heat',0,()=>{ closeSheet();
      const net=Math.max(0, p.money);
      // base minimum $1M; if you're already rich, the score is a % of net worth
      const pct = 0.08 + Math.random()*0.12 + (p.minionPower||0)/500; // 8-20% + crew bonus
      let take = Math.max(1000000, Math.round(net*pct));
      // a doomsday device or big crew lets you attempt truly massive scores
      if(p.doomsdayLevel>=2) take = Math.round(take*2.5);
      // crew reduces the chance things go wrong
      const botched = chance(Math.max(5, 30 - (p.minionPower||0)/3));
      if(botched){ p.heat=(p.heat||0)+30; p.stats.health=clamp(p.stats.health-8); take=Math.round(take*0.3); log(`${p.first}'s heist went loud — escaped with only ${money(take)}, and the heat is rising fast.`,'bad'); }
      else { p.heat=(p.heat||0)+12; p.stats.fame=clamp(p.stats.fame+3); log(`${p.first} pulled off a ${money(take)} score. ${p.minions>0?`The crew handled it clean.`:''}`,'big'); }
      p.money+=take; render();
    }));
    // pick a specific target heist
    opts.push(O('🏦','Plan a specific heist','choose your target',0,()=>{ openHeistMenu(p); }));
    // MINIONS
    opts.push(O('🦹','Recruit minions',`grow your crew (${p.minions||0})`,0,()=>{ closeSheet();
      const batch=2+rnd(4); p.minions=(p.minions||0)+batch;
      p.minionPower=clamp((p.minionPower||0)+batch*1.5+rnd(4));
      // a named lieutenant emerges once you have a crew
      if(!p.henchman && p.minions>=4){ p.henchman={name:villainName(),loyalty:65}; log(`${p.first} recruited ${batch} more to the crew — and ${p.henchman.name} rose up as right-hand enforcer.`,'good'); }
      else log(`${p.first} recruited ${batch} more minions. The crew is ${p.minions} strong now.`,'good');
      render();
    }));
    if(p.minions>0){
      opts.push(O('🎯','Train your crew','-$, +crew power',0,()=>{ closeSheet();
        const cost=Math.min(p.money, 20000+p.minions*2000); p.money-=cost; p.minionPower=clamp((p.minionPower||0)+8+rnd(6));
        log(`${p.first} drilled the crew into a sharper, deadlier outfit.`,'good'); render();
      }));
      opts.push(O('🛡','Send minions to cool the heat','crew takes the fall',0,()=>{ closeSheet();
        const drop=15+Math.round((p.minionPower||0)/5); p.heat=Math.max(0,(p.heat||0)-drop);
        if(chance(25)){ p.minions=Math.max(0,p.minions-1); log(`A minion took the fall for ${p.first} — heat dropped, but the crew lost one.`,'muted'); }
        else log(`${p.first}'s crew muddied the trail. Heat down ${drop}.`,'good');
        render();
      }));
    }
    opts.push(O('🌡','Lay low','cool the heat yourself',0,()=>{ closeSheet(); p.heat=Math.max(0,(p.heat||0)-25); p.stats.happy=clamp(p.stats.happy+2); log(`${p.first} went quiet for a while. The authorities lost the trail.`,'muted'); render(); }));
    // DOOMSDAY DEVICE — now a multi-stage project that pays off
    opts.push(OH(`— Doomsday device ${['(none)','(built)','(armed)','(WORLD THREAT)'][p.doomsdayLevel||0]} —`));
    if((p.doomsdayLevel||0)===0){
      opts.push(O('🔬','Build a doomsday device','$250,000 · begin the project',0,()=>{ if(p.money<250000){closeSheet();log(`${p.first} lacks the funds (needs $250,000).`,'muted');render();return;} p.money-=250000; p.doomsdayLevel=1; setFlag(p,'hasDoomsday'); closeSheet(); worldEvent(p,`${p.first} began constructing a doomsday device.`,{fear:true}); log(`${p.first} built the core of a doomsday device. It needs to be armed.`,'big'); render(); }));
    } else if((p.doomsdayLevel||0)===1){
      opts.push(O('⚙️','Arm the device','$500,000 · make it operational',0,()=>{ if(p.money<500000){closeSheet();log(`${p.first} needs $500,000 to arm it.`,'muted');render();return;} p.money-=500000; p.doomsdayLevel=2; closeSheet(); worldEvent(p,`${p.first}'s doomsday device is now operational. The world is afraid.`,{fear:true}); log(`The device is ARMED. ${p.first} can now hold the world to ransom.`,'big'); render(); }));
    } else if((p.doomsdayLevel||0)>=2){
      opts.push(O('🌍','Ransom the world','demand a fortune · +huge heat',0,()=>{ closeSheet();
        const ransom = Math.max(50000000, Math.round(Math.max(p.money,10000000)*(0.5+Math.random())));
        p.money+=ransom; p.heat=(p.heat||0)+40; p.stats.fame=clamp(p.stats.fame+15);
        worldEvent(p,`${p.first} held the world hostage and extorted ${money(ransom)}.`,{fear:true});
        log(`The nations of Earth paid ${p.first} ${money(ransom)} to stand down. For now.`,'big'); render();
      }));
      if((p.doomsdayLevel||0)===2){
        opts.push(O('☢️','Threaten total annihilation','escalate to world-domination bid',0,()=>{ closeSheet(); p.doomsdayLevel=3; worldEvent(p,`${p.first} threatened to end the world unless crowned its ruler.`,{fear:true}); log(`${p.first} escalated to an outright bid for world domination. The heroes are coming.`,'big'); render(); }));
      }
    }
  }

  // FREE TIME EXTRAS (nightlife, social, gambling, crime, etc.)
  opts.push(OH('— More to do —'));
  if(p.age>=18){
    opts.push(O('🌃','Hit the nightlife','clubs & bars · +joy, meet people',0,()=>{
      p.money-=Math.min(p.money,200+rnd(400)); p.stats.happy=clamp(p.stats.happy+9); closeSheet();
      const roll=rnd(100);
      if(roll<30 && !p.married){ const sx=partnerSex(p); const fr={name:newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:40+rnd(25),alive:true,id:nid()}; p.rels.push(fr); log(`${p.first} hit it off with ${fr.name.split(' ')[0]} at the bar.`,'good'); }
      else if(roll<55){ const sx=makeSex(); const fr={name:newFirst(sx)+' '+pick(LAST),kind:'Friend',sex:sx,bond:45+rnd(25),alive:true,id:nid()}; p.rels.push(fr); log(`${p.first} made a new friend out on the town.`,'good'); }
      else if(roll<70){ p.stats.health=clamp(p.stats.health-5); log(`${p.first} partied too hard and felt it for days.`,'bad'); if(chance(25))addAddiction(p,'alcohol',true); }
      else log(`${p.first} had a great night out.`,'good');
      render();
    }));
    if(!p.onSocial){
      const preview = startingFollowers(p);
      const fameNote = preview>50000 ? 'your fame brings a built-in audience' : preview>5000 ? 'you have a modest head start' : 'build a following, meet people';
      opts.push(O('📱','Join social media',fameNote,0,()=>{
        p.onSocial=true; p.socialFollowers=startingFollowers(p); closeSheet();
        if(p.socialFollowers>50000) log(`${p.first} joined social media and instantly drew ${p.socialFollowers.toLocaleString()} followers — fame has its perks.`,'big');
        else if(p.socialFollowers>5000) log(`${p.first} joined social media, starting with ${p.socialFollowers.toLocaleString()} followers.`,'good');
        else log(`${p.first} joined social media with ${p.socialFollowers.toLocaleString()} followers. The feed begins.`,'good');
        render();
      }));
    } else {
      const F=p.socialFollowers;
      opts.push(OH(`— Influencing (${F.toLocaleString()} followers) —`));
      opts.push(O('📱','Post content','grow your following',0,()=>{
        const g=rnd(2000)+(p.stats.looks>60?rnd(3000):0)+(p.traits.includes('charming')?rnd(2000):0);
        p.socialFollowers+=g; closeSheet();
        if(chance(12)){ p.socialFollowers+=20000+rnd(80000); p.stats.fame=clamp(p.stats.fame+8); log(`A post of ${p.first}'s blew up — followers poured in.`,'big'); }
        else log(`${p.first} posted and gained ${g.toLocaleString()} followers.`,'good');
        render();
      }));
      opts.push(O('🎬','Make a viral video','high risk, high reward',0,()=>{
        closeSheet();
        const r=rnd(100);
        if(r<35){ const boom=50000+rnd(400000); p.socialFollowers+=boom; p.stats.fame=clamp(p.stats.fame+12); log(`${p.first}'s video EXPLODED — ${boom.toLocaleString()} new followers.`,'big'); }
        else if(r<55){ p.stats.happy=clamp(p.stats.happy-8); p.socialFollowers=Math.max(0,p.socialFollowers-rnd(15000)); log(`${p.first}'s attempt flopped and aged badly. Some unfollowed.`,'bad'); }
        else { const g=rnd(8000); p.socialFollowers+=g; log(`${p.first}'s video did okay — ${g.toLocaleString()} followers.`,'muted'); }
        render();
      }));
      if(F>=10000){
        opts.push(O('🤝','Collab with another creator','+followers, +connections',0,()=>{
          closeSheet(); const g=Math.round(F*(0.1+Math.random()*0.3))+rnd(5000); p.socialFollowers+=g;
          if(chance(40)){ const fr={name:newFirst(makeSex())+' '+pick(LAST),kind:'Friend',sex:makeSex(),bond:50+rnd(20),alive:true,id:nid(),note:'fellow creator'}; p.rels.push(fr); log(`${p.first} collabed with ${fr.name.split(' ')[0]} — ${g.toLocaleString()} followers and a new connection.`,'good'); }
          else log(`${p.first} collabed with another creator — ${g.toLocaleString()} followers.`,'good');
          render();
        }));
      }
      if(F>=25000){
        opts.push(O('💰','Chase a sponsorship','cash in on your reach',0,()=>{
          closeSheet();
          if(chance(70)){ const deal=Math.round(F*(0.4+Math.random()*1.2)); p.money+=deal; log(`${p.first} landed a brand deal worth ${money(deal)}.`,'big'); }
          else log(`${p.first} pitched brands all week — no bites this time.`,'muted');
          render();
        }));
        opts.push(O('🛍','Launch a merch line','-$ upfront, maybe big',0,()=>{
          closeSheet(); const cost=Math.min(p.money,10000); p.money-=cost;
          if(chance(55)){ const rev=cost+Math.round(F*(0.3+Math.random())); p.money+=rev; log(`${p.first}'s merch sold out — ${money(rev)} in sales.`,'big'); }
          else log(`${p.first}'s merch line barely moved. Live and learn.`,'bad');
          render();
        }));
      }
      if(F>=50000){
        opts.push(O('🎙','Start a podcast','steady fame + income',0,()=>{
          closeSheet(); setFlag(p,'hasPodcast'); p.stats.fame=clamp(p.stats.fame+6); const g=rnd(20000); p.socialFollowers+=g;
          log(`${p.first} launched a podcast. ${g.toLocaleString()} followers tuned in.`,'good'); render();
        }));
        opts.push(O('🔥','Stir up some drama','+followers, -reputation',0,()=>{
          closeSheet();
          if(chance(55)){ const g=Math.round(F*(0.15+Math.random()*0.4)); p.socialFollowers+=g; p.stats.happy=clamp(p.stats.happy-4); log(`${p.first} started beef online — ${g.toLocaleString()} followers, but it's exhausting.`,'muted'); }
          else { const loss=Math.round(F*(0.1+Math.random()*0.2)); p.socialFollowers=Math.max(0,p.socialFollowers-loss); p.stats.fame=clamp(p.stats.fame-6); log(`The drama backfired on ${p.first} — a wave of unfollows and a canceling.`,'bad'); }
          render();
        }));
      }
      // ENTERTAINMENT CROSSOVER — turn clout into screen deals
      if(F>=80000){
        opts.push(OH('— Hollywood comes calling —'));
        opts.push(O('📺','Pursue a TV deal',F>=150000?'reality or hosting gig':'build more reach first',0,()=>{
          closeSheet();
          if(F<150000){ log(`${p.first} isn't quite big enough for TV yet. Keep growing.`,'muted'); render(); return; }
          if(chance(55)){ const deal=80000+rnd(600000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+12); setFlag(p,'tvStar'); log(`${p.first} landed a TV deal — ${money(deal)} and a new audience.`,'big'); }
          else log(`The network passed on ${p.first}. For now.`,'muted');
          render();
        }, F<150000));
        opts.push(O('🎞','Audition for a B-list movie','indie & genre films',0,()=>{
          closeSheet();
          if(chance(50)){ const deal=50000+rnd(400000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+10); setFlag(p,'bListActor'); log(`${p.first} booked a B-list movie role — ${money(deal)}. Not Oscar bait, but it pays.`,'big'); }
          else log(`${p.first} bombed the audition. Acting is harder than it looks.`,'bad');
          render();
        }));
        if(F>=400000 || hasFlag(p,'bListActor')){
          opts.push(O('🌟','Chase an A-list movie role','the big leagues',0,()=>{
            closeSheet();
            const odds = 25 + (p.stats.looks>65?12:0) + (hasFlag(p,'bListActor')?15:0) + (F>800000?10:0);
            if(chance(odds)){ const deal=1000000+rnd(15000000); p.money+=deal; p.stats.fame=clamp(p.stats.fame+25); setFlag(p,'aListActor'); worldEvent(p,`${p.first} became a bona fide A-list movie star.`,{hope:true}); log(`🌟 ${p.first} LANDED AN A-LIST ROLE — ${money(deal)}. A real movie star now.`,'big'); }
            else log(`${p.first} didn't get the part. The A-list is a brutal climb.`,'bad');
            render();
          }));
        }
        opts.push(O('🥂','Network with movie stars','make A-list connections',0,()=>{
          closeSheet();
          if(chance(60)){ const sx=makeSex(); const star={name:newFirst(sx)+' '+pick(LAST),kind:'Friend',sex:sx,bond:45+rnd(25),alive:true,id:nid(),note:'movie star'}; p.rels.push(star); p.stats.fame=clamp(p.stats.fame+5); log(`${p.first} hit it off with ${star.name.split(' ')[0]}, a movie star, at an exclusive party.`,'good'); }
          else { p.money-=Math.min(p.money,5000); log(`${p.first} schmoozed at a celebrity event but didn't click with anyone.`,'muted'); }
          render();
        }));
      }
      opts.push(OH('— Other —'));
      opts.push(O('💬','Meet someone online','social media dating',0,()=>{
        closeSheet();
        if(p.married){ log(`${p.first} is already spoken for.`,'muted'); render(); return; }
        if(chance(55)){ const sx=partnerSex(p); const fr={name:newFirst(sx)+' '+pick(LAST),kind:'Partner',sex:sx,bond:40+rnd(30),alive:true,id:nid()}; p.rels.push(fr); p.stats.happy=clamp(p.stats.happy+6); log(`${p.first} matched with ${fr.name.split(' ')[0]} online.`,'good'); }
        else log(`${p.first} swiped for hours. Nothing stuck.`,'muted');
        render();
      }));
    }
    opts.push(O('🎰','Gamble','risk it all on a number',0,()=>{
      const stake=Math.min(p.money,500+rnd(2000)); if(stake<50){closeSheet();log(`${p.first} has nothing to bet.`,'muted');render();return;}
      closeSheet();
      if(chance(p.traits.includes('lucky')?48:38)){p.money+=stake;log(`${p.first} gambled ${money(stake)} — and doubled it.`,'big');}
      else{p.money-=stake;log(`${p.first} gambled ${money(stake)} and lost it all.`,'bad');}
      render();
    }));
    opts.push(O('🎭','Try something risky','crime — fast money, real danger',0,()=>{
      closeSheet();
      if(chance(p.traits.includes('sly')?58:42)){const take=2000+rnd(15000);p.money+=take;p.stats.happy=clamp(p.stats.happy+4);log(`It worked. ${p.first} came away with ${money(take)} and a racing heart.`,'big');}
      else{
        p.stats.happy=clamp(p.stats.happy-10);
        if(chance(45)){const yrs=1+rnd(4);p.inPrison=true;p.prisonYears=yrs;p.record.push('Convicted of theft');if(p.job!=='none')endJob(p);log(`${p.first} was caught and sentenced to ${yrs} year${yrs>1?'s':''} in prison.`,'bad');}
        else{const fine=1000+rnd(6000);p.money-=Math.min(p.money,fine);p.stats.health=clamp(p.stats.health-8);p.record.push('Arrested');log(`It went wrong. ${p.first} got caught — ${money(fine)} fine and a mark on the record.`,'bad');}
      }
      render();
    }));
  }
  if(p.money>5000){
    opts.push(O('💸','Invest savings','let money grow (or shrink)',0,()=>{
      const amt=Math.floor(p.money*0.4); closeSheet();
      const r=(Math.random()*0.5)-0.18; const delta=Math.round(amt*r); p.money+=delta;
      log(delta>=0?`Investments paid off. ${money(delta)} gained.`:`The market turned. ${money(-delta)} lost.`,delta>=0?'good':'bad'); render();
    }));
  }

  // SHOP — assets & pets
  if(p.age>=18){
    opts.push(OH('— Buy things —'));
    [['🚗','Used car','car',8000],['🚙','New car','car',32000],['🏎','Sports car','car',95000]].forEach(([ic,nm,kind,price])=>{
      opts.push(O(ic,nm,p.money>=price?`${money(price)} · depreciates`:`can't afford (${money(price)})`,0,()=>{
        p.money-=price; p.assets.push({kind,name:nm,value:price,year:G.year}); closeSheet();
        log(`${p.first} bought a ${nm.toLowerCase()} for ${money(price)}.`,'big'); render();
      }, p.money<price));
    });
    // HOUSES — tiered, with size (bedrooms) that gates who can move in
    const houses=[
      ['🏚','Tiny apartment','house',70000,1],
      ['🏠','Starter home','house',180000,2],
      ['🏡','Family house','house',420000,4],
      ['🏘','Big suburban home','house',780000,6],
      ['🏰','Sprawling estate','house',1500000,9],
      ['🏯','Lavish mansion','house',4500000,14],
    ];
    const curHouse=p.assets.find(a=>a.kind==='house');
    houses.forEach(([ic,nm,kind,price,beds])=>{
      const owned=curHouse&&curHouse.name===nm;
      const label = curHouse? (owned?'current home':`upgrade · ${beds} bed`) : `${money(price)} · ${beds} bed`;
      opts.push(O(ic,nm,owned?'✓ '+label:(p.money>=price?label:`can't afford (${money(price)})`),0,()=>{
        // selling old house recoups its value toward the new one
        if(curHouse){ p.money+=(curHouse.value||0); p.assets=p.assets.filter(a=>a!==curHouse); }
        p.money-=price; p.assets.push({kind,name:nm,value:price,year:G.year,beds}); closeSheet();
        log(`${p.first} ${curHouse?'moved into':'bought'} a ${nm.toLowerCase()}.`,'big'); p.stats.happy=clamp(p.stats.happy+6); render();
      }, owned || p.money<price));
    });
    [['🐕','Adopt a dog','Dog',400],['🐈','Adopt a cat','Cat',250],['🦜','Buy a parrot','Parrot',1200]].forEach(([ic,nm,kind,price])=>{
      opts.push(O(ic,nm,`${money(price)} · a loyal companion`,0,()=>{
        p.money-=price; const pname=pick(['Biscuit','Shadow','Pepper','Mochi','Rex','Luna','Olive','Cosmo','Daisy','Bandit']);
        p.pets.push({name:pname,kind,emoji:ic,bond:70,age:0,alive:true}); closeSheet();
        log(`${p.first} brought home ${pname} the ${kind.toLowerCase()}.`,'good'); p.stats.happy=clamp(p.stats.happy+8); render();
      }, p.money<price));
    });
  }

  sheet(html+opts.join(''), sh=>{ bindOpts(sh); });
}

function enrollCollege(p,tier,years){ p._college=years; p._collegeTier=tier; p.inSchool=true; p.schoolLevel=EDU[tier]+' (in progress)'; const cost=tier===1?6000:tier===2?30000:45000; p.money-=Math.min(p.money,cost); closeSheet(); log(`${p.first} enrolled — ${EDU[tier]}. ${years} years ahead.`,'good'); render(); }
function takeJob(p,k){ const c=CAREER(k); p.job=k; p.jobYears=0; p.salary=c.base; p._stage=null; p._stageYears=0; p._rung=0; p.retired=false; closeSheet();
  // if already on social media, a high-profile new career swells the following toward its new ceiling
  if(p.onSocial){ const ceiling=startingFollowers(p); if(ceiling>(p.socialFollowers||0)*1.5){ const jump=Math.round(((ceiling)-(p.socialFollowers||0))*0.6); if(jump>2000){ p.socialFollowers=(p.socialFollowers||0)+jump; log(`${p.first}'s new career drew ${jump.toLocaleString()} new followers to their socials.`,'good'); } } }
  if(c.staged){ p._stage=0; p._stageYears=0; p.jobTitle=c.stages[0].t;
    // a matching high-school club gives a head start
    const cl=CLUBS.find(x=>x.helps===c.k);
    let headstart='';
    if(cl && hasFlag(p,cl.flag) && c.stages.length>1){ p._stage=1; p.jobTitle=c.stages[1].t; p.stats.fame=clamp(p.stats.fame+3); headstart=` Their ${cl.l.toLowerCase()} background got them straight to ${c.stages[1].t}.`; }
    const intro={wwe:`${p.first} signed with an indie wrestling promotion. The road to the top starts here.`,
      moviestar:`${p.first} landed their first gig as a background extra. Hollywood, someday.`,
      tech:`${p.first} took a help desk job. Everyone starts somewhere.`,
      boxer:`${p.first} laced up as an amateur boxer.`,
      director:`${p.first} graduated film school, reel in hand and dreams bigger.`,
      popstar:`${p.first} played their first open mic to a half-empty room. It begins.`,
      restaurateur:`${p.first} started as a line cook, burning their hands and learning fast.`,
      esports:`${p.first} started grinding ranked ladders into the night.`,
      astronaut:`${p.first} was accepted into the astronaut candidate program. The stars await.`,
      crimelord:`${p.first} stepped into the underworld as a street hustler. There's money here, and danger.`,
      superhero:`${p.first} sewed a costume and became a masked vigilante. The city doesn't know their name — yet.`,
      villain:`${p.first} embraced villainy. The world will learn to fear them.`,
      madsci:`${p.first} set up a lab in the garage and started bending the rules of nature.`}[c.k]
      || `${p.first} began the long climb in ${c.l.toLowerCase()}.`;
    let powerLine='';
    if(c.hero||c.evil){ const pow=grantPower(p); if(pow) powerLine=` Their power: ${pow}.`; }
    log(intro+headstart+powerLine,'big'); render(); return;
  }
  if(c.k==='nba')log(`${p.first} got drafted into the NBA. A dream, realized.`,'big');
  else if(c.wild)log(`${p.first} took the leap into ${c.l.toLowerCase()} life.`,'big');
  else log(`${p.first} started work as a ${c.l.toLowerCase()}.`,'good');
  render();
}

