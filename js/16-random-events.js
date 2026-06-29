"use strict";
/* Threadbare · split module: 16-random-events.js  (lines 4870–5120 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   AGE-BANDED RANDOM EVENTS
   ============================================================ */
// quarterly one-tap flavor — small, seasonal, lots of variety
function quarterEvent(p){
  const season=SEASONS[p.q||0].toLowerCase();
  const pool=[
    ()=>log(`${p.first} enjoyed a quiet ${season} day.`,'muted'),
    ()=>{p.stats.happy=clamp(p.stats.happy+3);log(`${p.first} caught up with an old friend.`,'good');},
    ()=>{p.stats.health=clamp(p.stats.health+2);log(`${p.first} took some long walks this season.`,'good');},
    ()=>{const f=10+rnd(120);p.money=Math.max(0,p.money-f);log(`A small unexpected expense — ${money(f)}.`,'muted');},
    ()=>log(`A slow ${season} passed without much fuss.`,'muted'),
  ];
  // EARLY CHILDHOOD (0–6)
  if(p.age<=6){
    pool.push(
      ()=>{p.stats.happy=clamp(p.stats.happy+4);log(`${p.first} learned a new word and wouldn't stop saying it.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+3);log(`${p.first} had a great day at daycare.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-3);log(`${p.first} threw an epic tantrum in a grocery store.`,'muted');},
      ()=>{p.stats.health=clamp(p.stats.health-3);log(`${p.first} caught a ${season} cold.`,'muted');},
      ()=>{p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} spent the whole ${season} obsessed with dinosaurs.`,'good');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+2);log(`${p.first} learned to climb everything in sight.`,'good');}
    );
  }
  // CHILDHOOD (7–12)
  if(p.age>=7&&p.age<=12){
    pool.push(
      ()=>{p.stats.smarts=clamp(p.stats.smarts+3);log(`${p.first} got really into a new hobby this ${season}.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+4);log(`${p.first} had a sleepover that ended in a pillow-fort empire.`,'good');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+3);log(`${p.first} spent the ${season} biking around the neighborhood.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-4);log(`${p.first} got picked last in gym again.`,'muted');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+4);log(`${p.first} read an entire book series this ${season}.`,'good');},
      ()=>{const a=5+rnd(40);p.money+=a;log(`${p.first} earned ${money(a)} doing chores.`,'good');}
    );
  }
  // TEENS (13–18)
  if(p.age>=13&&p.age<=18){
    pool.push(
      ()=>{p.stats.happy=clamp(p.stats.happy+4);log(`${p.first} spent the ${season} glued to their phone and their friends.`,'good');},
      ()=>{p.stats.looks=clamp(p.stats.looks+3);log(`${p.first} figured out their personal style this ${season}.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts-2);p.stats.happy=clamp(p.stats.happy+4);log(`${p.first} procrastinated a whole ${season} away. Worth it?`,'muted');},
      ()=>{p.stress=clamp(p.stress+6);log(`Exams had ${p.first} stressed this ${season}.`,'muted');},
      ()=>{const a=200+rnd(1500);p.money+=a;log(`${p.first} worked a ${season} job and saved ${money(a)}.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} stayed out too late with friends and felt alive.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-5);log(`Some friend-group drama soured ${p.first}'s ${season}.`,'muted');}
    );
  }
  if(p.job!=='none') pool.push(()=>{p.stress=clamp(p.stress+4);log(`A busy season at work for ${p.first}.`,'muted');});
  if(p.rels.find(r=>r.kind==='Spouse'&&r.alive)) pool.push(()=>{p.stats.happy=clamp(p.stats.happy+4);log(`${p.first} and their spouse shared a lovely ${season}.`,'good');});
  if(p.pets&&p.pets.some(pt=>pt.alive)) pool.push(()=>{p.stats.happy=clamp(p.stats.happy+3);log(`${p.first}'s pet did something adorable.`,'good');});
  if(p.rels.some(r=>/Brother|Sister|Sibling/.test(r.kind)&&r.alive)) pool.push(()=>{const s=p.rels.find(r=>/Brother|Sister|Sibling/.test(r.kind)&&r.alive);s.bond=clamp(s.bond+rndDrift(3));p.stats.happy=clamp(p.stats.happy+2);log(`${p.first} and ${s.name.split(' ')[0]} spent a lot of the ${season} together.`,'good');});
  pick(pool)();
}
function lifeEvents(p){
  // childhood
  if(p.age>=2 && p.age<=12 && chance(34)){
    const e=pick([
      ()=>{p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} learned to ride a bike. Scraped knees, huge grin.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+5);log(`A teacher noticed ${p.first} reading far above grade level.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-7);log(`A nasty flu kept ${p.first} home for two weeks.`,'bad');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+7);log(`${p.first} joined a sports team and loved it.`,'good');},
      ()=>{const f={name:newFirst(makeSex())+' '+pick(LAST),kind:'Friend',sex:makeSex(),bond:55+rnd(30),alive:true,id:nid()};p.rels.push(f);log(`${p.first} made a best friend, ${f.name.split(' ')[0]}.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-6);log(`The family moved towns. ${p.first} left friends behind.`,'bad');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+4);p.stats.happy=clamp(p.stats.happy+3);log(`${p.first} fell in love with the library and never left.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+7);log(`${p.first} got the birthday party of their dreams.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-9);log(`A bully made ${p.first}'s year miserable.`,'bad');},
      ()=>{p.stats.looks=clamp(p.stats.looks-3);log(`Chicken pox. ${p.first} was covered head to toe.`,'bad');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+5);log(`${p.first} spent the whole summer outside, brown as a berry.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+6);log(`${p.first} won the school spelling bee.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} built an elaborate blanket fort and ruled it as king.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-5);log(`${p.first} broke a tooth on the playground.`,'bad');},
      ()=>{p.stats.looks=clamp(p.stats.looks+4);log(`A relative said ${p.first} would grow up beautiful. It stuck.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-7);log(`${p.first}'s favorite toy was lost in a move. Devastating.`,'bad');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+5);log(`${p.first} discovered a love of building things from scraps.`,'good');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+6);log(`${p.first} learned to swim like a fish this summer.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+8);log(`A trip to the fair gave ${p.first} a perfect day.`,'good');},
      ()=>{if(p.pets.filter(x=>x.alive).length){p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} and the family pet were inseparable this year.`,'good');}else log(`${p.first} begged for a pet all year long.`,'muted');},
    ]); e();
  }
  // teens
  if(p.age>=13 && p.age<=19 && chance(38)){
    const e=pick([
      ()=>{p.stats.looks=clamp(p.stats.looks+5);log(`Something clicked — ${p.first} grew into their looks this year.`,'good');},
      ()=>{p.money+=rnd(2500);log(`${p.first} took a summer job and saved up a little.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts-4);p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} skipped class to do something more fun. No regrets, mostly.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy-8);log(`A first heartbreak. It felt like the end of the world.`,'bad');},
      ()=>{if(chance(50)){p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} got cast in the school play and stole the show.`,'good');}else{p.stats.athletic=clamp(p.stats.athletic+8);log(`${p.first} made varsity.`,'good');}},
      ()=>{p.stats.health=clamp(p.stats.health-10);log(`A bad fall — broken arm. Months in a cast.`,'bad');},
      ()=>{p.stats.happy=clamp(p.stats.happy+9);log(`${p.first} got a driver's license and tasted freedom.`,'good');},
      ()=>{if(chance(40)){addAddiction(p,'party_drugs',true);p.stats.happy=clamp(p.stats.happy+6);p.stats.health=clamp(p.stats.health-6);log(`${p.first} started partying a little too hard.`,'bad');}else log(`${p.first} went to a wild party and lived to tell it.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+6);log(`${p.first} aced every exam this year.`,'good');},
      ()=>{p.stress=clamp(p.stress+15);log(`Exam season nearly broke ${p.first}.`,'bad');},
      ()=>{const f={name:newFirst(makeSex())+' '+pick(LAST),kind:'Friend',sex:makeSex(),bond:60+rnd(30),alive:true,id:nid()};p.rels.push(f);log(`${p.first} found a ride-or-die friend in ${f.name.split(' ')[0]}.`,'good');},
      ()=>{p.stats.fame=clamp(p.stats.fame+5);log(`${p.first} started a band in the garage. Loud, glorious noise.`,'good');},
      ()=>{p.money+=500+rnd(3000);log(`${p.first} flipped sneakers online for a tidy profit.`,'good');},
      ()=>{p.stats.looks=clamp(p.stats.looks-4);p.stats.happy=clamp(p.stats.happy-5);log(`A brutal acne breakout wrecked ${p.first}'s confidence.`,'bad');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+7);log(`${p.first} got into coding and built a little app.`,'good');},
      ()=>{p.stats.athletic=clamp(p.stats.athletic+7);log(`${p.first} trained all season and dropped their mile time.`,'good');},
      ()=>{p.stats.happy=clamp(p.stats.happy+10);log(`Prom night was everything ${p.first} hoped for.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-8);p.record.push('Underage drinking');log(`${p.first} got caught drinking. A scare and a citation.`,'bad');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+5);log(`A teacher took ${p.first} under their wing. It changed things.`,'good');},
      ()=>{if(p.rels.filter(r=>/Mother|Father/.test(r.kind)&&r.alive).length){const pa=pick(p.rels.filter(r=>/Mother|Father/.test(r.kind)&&r.alive));pa.bond=clamp(pa.bond-15);p.stats.happy=clamp(p.stats.happy-6);log(`${p.first} had a screaming fight with a parent.`,'bad');}else log(`${p.first} felt the absence of a parent keenly this year.`,'muted');},
    ]); e();
  }
  // adult
  if(p.age>=20 && chance(32)){
    const e=pick([
      ()=>{const w=rnd(900);if(w>40){p.money+=w;log(`${p.first} found ${money(w)} folded in an old coat.`,'good');}},
      ()=>{p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} took a trip and came back lighter.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-6);p.stress=clamp(p.stress+10);log(`Stress caught up. ${p.first} hasn't been sleeping.`,'bad');},
      ()=>{if(p.money>3000){const loss=Math.min(p.money,1000+rnd(9000));p.money-=loss;log(`A car broke down. ${money(loss)} gone in a weekend.`,'bad');}},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+4);log(`${p.first} got obsessed with a new subject and went deep.`,'good');},
      ()=>{if(p.traits.includes('lucky')&&chance(50)){const w=2000+rnd(40000);p.money+=w;log(`Pure luck. A small windfall of ${money(w)}.`,'big');}else log(`A quiet, ordinary year.`,'muted');},
      ()=>{const inh=5000+rnd(60000);p.money+=inh;log(`A distant relative left ${p.first} ${money(inh)} in their will.`,'big');},
      ()=>{p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} reconnected with an old friend over a long dinner.`,'good');},
      ()=>{if(chance(35)){p.stats.happy=clamp(p.stats.happy-10);p.stress=clamp(p.stress+20);log(`${p.first} got laid off. The job market is brutal.`,'bad');if(p.job!=='none'&&chance(60))endJob(p,`${p.first} lost their job.`);}else log(`A rumor of layoffs passed ${p.first} by.`,'muted');},
      ()=>{p.stats.looks=clamp(p.stats.looks+4);p.money-=Math.min(p.money,1500);log(`${p.first} got in shape and updated the whole wardrobe.`,'good');},
      ()=>{if(p.stats.fame>20){p.money+=10000+rnd(50000);log(`A brand paid ${p.first} for an endorsement.`,'good');}else log(`${p.first} had a slow, forgettable year.`,'muted');},
      ()=>{p.stress=clamp(p.stress-15);p.stats.happy=clamp(p.stats.happy+5);log(`${p.first} took up a hobby that quiets the mind.`,'good');},
      ()=>{const sx=makeSex();const f={name:newFirst(sx)+' '+pick(LAST),kind:'Friend',sex:sx,bond:50+rnd(30),alive:true,id:nid()};p.rels.push(f);log(`${p.first} clicked with a new coworker, ${f.name.split(' ')[0]}.`,'good');},
      ()=>{if(p.rels.filter(r=>r.kind==='Friend'&&r.alive).length){const fr=pick(p.rels.filter(r=>r.kind==='Friend'&&r.alive));fr.bond=clamp(fr.bond-30);p.stats.happy=clamp(p.stats.happy-8);log(`${p.first} had a falling-out with ${fr.name.split(' ')[0]}.`,'bad');}else log(`A lonely stretch for ${p.first}.`,'muted');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+6);log(`${p.first} went back to learning — a course, a craft, a language.`,'good');},
      ()=>{if(p.assets.some(a=>a.kind==='house')&&chance(40)){const dmg=8000+rnd(30000);p.money-=Math.min(p.money,dmg);log(`A storm damaged ${p.first}'s home — ${money(dmg)} in repairs.`,'bad');}else log(`The neighborhood had a quiet year.`,'muted');},
      ()=>{if(p.traits.includes('driven')){p.stats.fame=clamp(p.stats.fame+5);log(`${p.first}'s hard work got noticed in the community.`,'good');}else log(`${p.first} coasted through an easy year.`,'muted');},
      ()=>{p.stats.health=clamp(p.stats.health+7);log(`${p.first} got serious about sleep and food. It shows.`,'good');},
      ()=>{const w=rnd(100);if(w<3){const jackpot=100000+rnd(900000);p.money+=jackpot;log(`${p.first} won big on a lottery ticket — ${money(jackpot)}!`,'big');}else log(`${p.first} bought a lottery ticket. Nothing.`,'muted');},
      ()=>{if(p.onSocial&&p.socialFollowers>10000&&chance(40)){p.stats.happy=clamp(p.stats.happy-12);log(`${p.first} got dragged in an online pile-on. Brutal week.`,'bad');}else log(`${p.first}'s feed stayed calm.`,'muted');},
      ()=>{p.stats.happy=clamp(p.stats.happy+8);log(`${p.first} crossed something big off the bucket list.`,'good');},
      ()=>{if(p.married&&chance(30)){const sp=p.rels.find(r=>r.kind==='Spouse'&&r.alive);if(sp){sp.bond=clamp(sp.bond+18);p.stats.happy=clamp(p.stats.happy+10);log(`${p.first} and ${sp.name.split(' ')[0]} fell in love all over again.`,'good');}}else log(`A steady, unremarkable year.`,'muted');},
      ()=>{p.stress=clamp(p.stress+18);p.stats.health=clamp(p.stats.health-5);log(`A brutal stretch at work burned ${p.first} out.`,'bad');},
      ()=>{p.stats.happy=clamp(p.stats.happy+7);p.money-=Math.min(p.money,3000);log(`${p.first} took a dream vacation and unplugged completely.`,'good');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+5);log(`${p.first} got certified in a new skill. Doors opened.`,'good');},
      ()=>{if(p.assets.some(a=>a.kind==='car')){p.money-=Math.min(p.money,2000+rnd(4000));log(`${p.first}'s car needed major repairs.`,'bad');}else log(`${p.first} relied on a borrowed ride all year.`,'muted');},
      ()=>{const sx=makeSex();const f={name:newFirst(sx)+' '+pick(LAST),kind:'Friend',sex:sx,bond:50+rnd(30),alive:true,id:nid()};p.rels.push(f);log(`${p.first} bonded with a neighbor over a shared project.`,'good');},
      ()=>{p.stats.looks=clamp(p.stats.looks-4);log(`${p.first} found the first grey hairs. Time marches on.`,'muted');},
      ()=>{p.stats.happy=clamp(p.stats.happy+9);log(`${p.first} volunteered and rediscovered a sense of purpose.`,'good');},
      ()=>{if(p.money>20000&&chance(40)){const loss=Math.min(p.money,5000+rnd(20000));p.money-=loss;log(`${p.first} fell for a slick scam — ${money(loss)} gone.`,'bad');}else log(`${p.first} dodged a scammer's call.`,'muted');},
      ()=>{p.stats.health=clamp(p.stats.health+5);p.stats.athletic=clamp(p.stats.athletic+4);log(`${p.first} ran a half-marathon and finished strong.`,'good');},
      ()=>{if(p.childrenIds.length){const k=findP(G,pick(p.childrenIds));if(k&&k.alive){p.stats.happy=clamp(p.stats.happy+8);log(`${p.first} watched ${k.first} hit a milestone. Pure pride.`,'good');}}else log(`A calm year passed for ${p.first}.`,'muted');},
    ]); e();
  }
  // elder events
  if(p.age>=60 && chance(30)){
    const e=pick([
      ()=>{p.stats.happy=clamp(p.stats.happy+8);log(`${p.first} became a grandparent figure to the neighborhood kids.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-8);log(`${p.first}'s joints ache more than they used to.`,'bad');},
      ()=>{if(p.childrenIds.length){p.stats.happy=clamp(p.stats.happy+10);log(`${p.first} spent a golden afternoon with family.`,'good');}else{p.stats.happy=clamp(p.stats.happy-6);log(`${p.first} felt the quiet of an empty house.`,'bad');}},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+3);log(`${p.first} started writing memoirs. The stories pour out.`,'good');},
      ()=>{if(p.money>50000){p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} is enjoying a comfortable retirement.`,'good');}else log(`Money worries follow ${p.first} into old age.`,'bad');},
      ()=>{p.stats.happy=clamp(p.stats.happy+7);log(`${p.first} took up gardening and found deep peace in it.`,'good');},
      ()=>{p.stats.health=clamp(p.stats.health-10);log(`A fall put ${p.first} in the hospital for a spell.`,'bad');},
      ()=>{p.stats.happy=clamp(p.stats.happy+9);log(`Old friends gathered for ${p.first}. Laughter like the old days.`,'good');},
      ()=>{if(p.pets.filter(x=>x.alive).length){p.stats.happy=clamp(p.stats.happy+6);log(`${p.first}'s pet was the best company a quiet year could ask for.`,'good');}else log(`${p.first} considered getting a companion pet.`,'muted');},
      ()=>{p.stats.smarts=clamp(p.stats.smarts+4);log(`${p.first} took a class at the community center, sharp as ever.`,'good');},
    ]); e();
  }
  // family money unlock
  if(p.age===18 && p._familyMoney){ p.money += p._familyMoney; if(p._familyMoney>500)log(`${p.first} came into ${money(p._familyMoney)} of family standing.`,'good'); p._familyMoney=0; }

  // career-specific flavor events
  if(p.job!=='none' && chance(22)){
    const j=p.job;
    const careerEvents={
      professor:[()=>{p.stats.fame=clamp(p.stats.fame+4);log(`${p.first}'s lecture went viral among students. A campus favorite.`,'good');},
                 ()=>{const grant=20000+rnd(150000);p.money+=grant;log(`${p.first} secured a research grant — ${money(grant)}.`,'good');},
                 ()=>{
                   // a student expresses interest — strictly an adult university setting
                   if(p.age>=24){ p.stats.happy=clamp(p.stats.happy+2);
                     log(`A graduate student made it clear they were interested in ${p.first}. ${pick(['Flattering, but kept professional.','Office hours got a little awkward.','They politely kept it professional.'])}`,'muted'); }
                   else { p.stats.fame=clamp(p.stats.fame+2); log(`${p.first} earned strong teaching reviews this term.`,'good'); }
                 }],
      driver:[()=>{const tips=500+rnd(3000);p.money+=tips;log(`${p.first} crushed peak delivery season — ${money(tips)} in bonuses.`,'good');},
              ()=>{p.stats.health=clamp(p.stats.health-6);log(`${p.first} threw out their back hauling packages.`,'bad');},
              ()=>{p.stress=clamp(p.stress+8);log(`Endless routes and tight windows wore ${p.first} down.`,'muted');}],
      aistartup:[()=>{p.stats.fame=clamp(p.stats.fame+6);log(`${p.first}'s product got featured in the tech press.`,'good');},
                 ()=>{p.stress=clamp(p.stress+18);log(`A key engineer quit and ${p.first} scrambled to keep the company alive.`,'bad');},
                 ()=>{const r=10000+rnd(200000);p.money+=r;log(`A big enterprise contract landed — ${money(r)}.`,'good');}],
      cop:[()=>{p.stats.fame=clamp(p.stats.fame+5);log(`${p.first} made a high-profile arrest. The local news ran the story.`,'good');},
           ()=>{p.stats.health=clamp(p.stats.health-12);log(`${p.first} was injured chasing a suspect.`,'bad');}],
      doctor:[()=>{p.stats.fame=clamp(p.stats.fame+4);p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} saved a patient everyone else had given up on.`,'good');},
              ()=>{p.stress=clamp(p.stress+18);log(`${p.first} lost a patient on the table. It haunts them.`,'bad');}],
      lawyer:[()=>{const win=20000+rnd(120000);p.money+=win;log(`${p.first} won a big case — ${money(win)} in fees.`,'big');},
              ()=>{p.stats.happy=clamp(p.stats.happy-8);log(`${p.first} lost a case they should have won.`,'bad');}],
      teacher:[()=>{p.stats.happy=clamp(p.stats.happy+8);log(`A former student thanked ${p.first} for changing their life.`,'good');}],
      tech:[()=>{const bonus=8000+rnd(40000);p.money+=bonus;log(`${p.first} shipped a feature that earned a ${money(bonus)} bonus.`,'good');},
            ()=>{p.stress=clamp(p.stress+15);log(`A production outage had ${p.first} up for 36 hours straight.`,'bad');}],
      crimelord:[()=>{const score=20000+rnd(200000);p.money+=score;log(`A big score paid off — ${money(score)}, no questions asked.`,'big');},
                 ()=>{p.stats.health=clamp(p.stats.health-15);log(`A deal went bad. ${p.first} barely walked away.`,'bad');}],
      nurse:[()=>{p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} comforted a frightened family through a hard night.`,'good');}],
      pilot:[()=>{p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} flew through a storm and landed flawlessly.`,'good');}],
      firefighter:[()=>{p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} pulled a family from a burning building. A hero.`,'big');}],
      soldier:[()=>{p.stats.health=clamp(p.stats.health-18);p.stats.fame=clamp(p.stats.fame+6);log(`${p.first} was decorated for valor — at a cost.`,'bad');}],
      ufc:[()=>{p.stats.health=clamp(p.stats.health-14);log(`${p.first} took a knockout loss on the big card.`,'bad');},
           ()=>{const purse=50000+rnd(500000);p.money+=purse;p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} won by spectacular knockout — ${money(purse)} purse.`,'big');}],
      founder:[()=>{p.stress=clamp(p.stress+20);log(`${p.first} nearly burned out keeping the company alive.`,'bad');}],
      popstar:[()=>{p.stats.fame=clamp(p.stats.fame+12);const r=200000+rnd(2000000);p.money+=r;log(`${p.first}'s single went PLATINUM. ${money(r)} in royalties poured in.`,'big');},
               ()=>{p.stats.happy=clamp(p.stats.happy-10);log(`${p.first}'s new album flopped. The critics were merciless.`,'bad');}],
      moviestar:[()=>{p.stats.fame=clamp(p.stats.fame+14);const r=500000+rnd(8000000);p.money+=r;log(`${p.first}'s film was a box-office smash — ${money(r)} payday.`,'big');},
                 ()=>{p.stats.fame=clamp(p.stats.fame-8);log(`A tabloid scandal dragged ${p.first} through the mud.`,'bad');}],
      youtuber:[()=>{p.stats.fame=clamp(p.stats.fame+10);const r=10000+rnd(300000);p.money+=r;log(`A video of ${p.first}'s went viral — ${money(r)} ad revenue.`,'big');},
                ()=>{p.stats.happy=clamp(p.stats.happy-8);log(`${p.first} got demonetized and the channel stalled.`,'bad');}],
      musician:[()=>{p.stats.fame=clamp(p.stats.fame+10);const r=50000+rnd(900000);p.money+=r;log(`${p.first}'s track blew up on streaming — ${money(r)}.`,'big');}],
      scientist:[()=>{p.stats.fame=clamp(p.stats.fame+8);p.stats.smarts=clamp(p.stats.smarts+4);log(`${p.first} published a groundbreaking paper. Peers took notice.`,'good');},
                 ()=>{const grant=50000+rnd(400000);p.money+=grant;log(`${p.first} landed a major research grant — ${money(grant)}.`,'good');}],
      madsci:[()=>{p.stats.smarts=clamp(p.stats.smarts+5);log(`${p.first} made a breakthrough no sane lab would dare attempt.`,'good');}],
      superhero:[()=>{p.stats.fame=clamp(p.stats.fame+10);log(`The city threw ${p.first} a parade. A beloved hero.`,'big');},
                 ()=>{p.stats.health=clamp(p.stats.health-20);log(`${p.first} barely survived a brutal showdown with a villain.`,'bad');},
                 ()=>{const deal=50000+rnd(400000);p.money+=deal;log(`${p.first} signed a merchandising deal — ${money(deal)}.`,'good');}],
      villain:[()=>{const heist=100000+rnd(3000000);p.money+=heist;p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} pulled off a legendary heist — ${money(heist)}.`,'big');},
               ()=>{p.stats.health=clamp(p.stats.health-18);log(`A superhero foiled ${p.first}'s scheme and left them battered.`,'bad');}],
      pilot:[()=>{p.stats.happy=clamp(p.stats.happy+6);log(`${p.first} flew through a storm and landed flawlessly.`,'good');},
             ()=>{p.stats.health=clamp(p.stats.health-10);p.stress=clamp(p.stress+15);log(`${p.first} handled a mid-air emergency. Hailed as a hero, but shaken.`,'bad');}],
      astronaut:[()=>{p.stats.fame=clamp(p.stats.fame+18);worldEvent(p,`${p.first} walked in space on a historic mission.`,{hope:true});},
                 ()=>{p.stats.health=clamp(p.stats.health-15);log(`A spacewalk went wrong. ${p.first} nearly didn't make it back.`,'bad');}],
      nba:[()=>{p.stats.fame=clamp(p.stats.fame+10);log(`${p.first} dropped 50 points and went viral.`,'big');},
           ()=>{if(p.stats.athletic>80&&chance(40)){p.stats.fame=clamp(p.stats.fame+25);const bonus=2000000+rnd(15000000);p.money+=bonus;setFlag(p,'nbaChamp');worldEvent(p,`${p.first} won the NBA Championship and Finals MVP.`,{hope:true});log(`🏆 ${p.first} WON THE NBA CHAMPIONSHIP! ${money(bonus)} bonus and eternal glory.`,'big');}else{p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} made the All-Star team this season.`,'big');}},
           ()=>{p.stats.health=clamp(p.stats.health-18);log(`${p.first} tore a ligament. A long, grueling rehab ahead.`,'bad');},
           ()=>{const r=1000000+rnd(20000000);p.money+=r;log(`${p.first} signed a massive shoe deal — ${money(r)}.`,'big');}],
      nfl:[()=>{p.stats.fame=clamp(p.stats.fame+10);log(`${p.first} made a highlight-reel play on national TV.`,'big');},
           ()=>{if(p.stats.athletic>80&&chance(38)){p.stats.fame=clamp(p.stats.fame+25);const bonus=2000000+rnd(12000000);p.money+=bonus;setFlag(p,'superbowlChamp');worldEvent(p,`${p.first} won the Super Bowl.`,{hope:true});log(`🏆 ${p.first} WON THE SUPER BOWL! ${money(bonus)} and a ring.`,'big');}else{p.stats.fame=clamp(p.stats.fame+8);log(`${p.first} made the Pro Bowl this year.`,'big');}},
           ()=>{p.stats.health=clamp(p.stats.health-22);log(`${p.first} took a brutal hit — concussion protocol and worse.`,'bad');}],
      soccer:[()=>{p.stats.fame=clamp(p.stats.fame+12);log(`${p.first} scored a stunning goal seen around the world.`,'big');},
              ()=>{if(p.stats.athletic>80&&chance(35)){p.stats.fame=clamp(p.stats.fame+28);const bonus=3000000+rnd(20000000);p.money+=bonus;setFlag(p,'soccerChamp');worldEvent(p,`${p.first} lifted the championship trophy.`,{hope:true});log(`🏆 ${p.first} WON THE LEAGUE TITLE! ${money(bonus)} richer.`,'big');}else{p.stats.fame=clamp(p.stats.fame+10);log(`${p.first} was named to the league's best XI.`,'big');}},
              ()=>{const r=2000000+rnd(30000000);p.money+=r;log(`${p.first} transferred to a giant club — ${money(r)} signing bonus.`,'big');}],
      politician:[()=>{p.stats.fame=clamp(p.stats.fame+6);log(`${p.first} gave a speech that moved the nation.`,'good');},
                  ()=>{p.stats.fame=clamp(p.stats.fame-10);log(`A scandal rocked ${p.first}'s political career.`,'bad');}],
      restaurateur:[()=>{p.stats.fame=clamp(p.stats.fame+8);log(`${p.first}'s restaurant earned a coveted star.`,'big');}],
      lawyer:[()=>{const win=20000+rnd(120000);p.money+=win;log(`${p.first} won a big case — ${money(win)} in fees.`,'big');},
              ()=>{p.stats.happy=clamp(p.stats.happy-8);log(`${p.first} lost a case they should have won.`,'bad');}],
    };
    const evs=careerEvents[j];
    if(evs) pick(evs)();
  }

  // medical emergencies — insurance is the difference between a scare and ruin
  if(p.age>=25 && chance(2.5 + Math.max(0,(p.age-50))*0.18)){
    const ail=pick(['a heart scare','a bad accident','appendicitis','a tumor scare','pneumonia','a broken hip']);
    const billRaw=15000+rnd(140000);
    p.stats.health=clamp(p.stats.health-(8+rnd(14)));
    if(p.insured){
      const outOfPocket=Math.round(billRaw*0.12);
      p.money-=outOfPocket;
      log(`${p.first} survived ${ail}. Insurance covered most of it — ${money(outOfPocket)} out of pocket.`,'big');
    } else {
      p.money-=billRaw;
      log(`${p.first} survived ${ail}, but the ${money(billRaw)} bill was crushing. No insurance.`,'bad');
      if(p.money<-20000 && chance(50)) log(`Medical debt is drowning ${p.first}.`,'bad');
    }
  }
}

