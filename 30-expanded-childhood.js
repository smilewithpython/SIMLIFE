"use strict";
/* Threadbare · content module: 30-expanded-childhood.js — EXPANDED PART 1: CHILDHOOD (0–12)
   New events only; none duplicate the base bank. Pushed onto CHOICE_EVENTS.
   Tagged track:'life' (childhood is the Life track) and given a `cat` so the
   cooldown patch (module 29) rotates them. None announce their own meaning.
   ============================================================ */

const EXP_CHILDHOOD = [

  // ---------- First Memory (flavor, no choice) ----------
  { id:'xc_firstmemory', emoji:'🌅', title:'A first memory', once:true, track:'life', cat:'child_flavor', weight:3,
    when:p=>p.age>=3 && p.age<=4,
    body:p=>{ const m=pick(['the smell of a grandparent\'s house — coffee, dust, and something sweet','a song playing in another room, just out of reach','a particular blue that the sky never quite is anymore','the exact feeling of being carried, half-asleep, and perfectly safe']); setFlag(p,'firstMemory',m); return `Years from now, ${p.first} won't remember being four. But this they'll keep: ${m}.`; },
    choices:[ {label:'Keep it', sub:'always', effect:p=>{ markCat(p,'child_flavor'); return `Some memories choose you. This one chose ${p.first}.`; }} ]},

  // ---------- The Imaginary Friend ----------
  { id:'xc_imaginary', emoji:'🫥', title:'The imaginary friend', once:true, track:'life', cat:'child_social', weight:3,
    when:p=>p.age>=3 && p.age<=6,
    body:p=>`${p.first} has a friend nobody else can see. They have a name, opinions, and a favorite chair that must be left empty. The parents can't decide if it's adorable or a little worrying.`,
    choices:[
      {label:'Insist they\'re real', sub:'hold on tight', effect:p=>{ fx(p,{happy:5}); if(chance(1)) setFlag(p,'_imaginaryDeep',true); markCat(p,'child_social'); return `${p.first} defended their friend fiercely. The empty chair stayed empty for years.`; }},
      {label:'Let them fade', sub:'growing up', effect:p=>{ fx(p,{smarts:2,happy:-1}); markCat(p,'child_social'); return `Slowly, without a goodbye, the friend stopped coming around. ${p.first} barely noticed when.`; }},
      {label:'Still there at seven', sub:'parents quietly worry', effect:p=>{ fx(p,{happy:2}); setFlag(p,'_imaginaryDeep',true); markCat(p,'child_social'); return `By seven the friend was still there, and the parents started using the careful voice. ${p.first} couldn't see the problem.`; }},
    ]},

  // ---------- Getting Lost ----------
  { id:'xc_lost', emoji:'🧭', title:'Lost', once:true, track:'life', cat:'child_world', weight:3,
    when:p=>p.age>=4 && p.age<=7,
    body:p=>`One turn of the head and the parents are gone — swallowed by a crowd, a store, a fair. ${p.first} is suddenly, completely alone in a world built for taller people.`,
    choices:[
      {label:'Stay put and wait', sub:'the careful choice', effect:p=>{ setFlag(p,'childCautious',true); fx(p,{smarts:2}); markCat(p,'child_world'); return `${p.first} planted both feet and waited, heart pounding, until a familiar face came running. Found in minutes.`; }},
      {label:'Go find them yourself', sub:'take charge', effect:p=>{ setFlag(p,'childInitiative',true); if(chance(60)){ fx(p,{happy:3,smarts:2}); markCat(p,'child_world'); return `${p.first} set off and actually found them. A small person, a big decision, made alone.`;} fx(p,{stress:8}); markCat(p,'child_world'); return `${p.first} wandered for twenty long minutes before anyone appeared. The aloneness left a mark.`; }},
      {label:'Ask a stranger for help', sub:'trust', effect:p=>{ fx(p,{smarts:3}); markCat(p,'child_world'); return `${p.first} found a kind-looking adult and asked. It worked — and taught ${p.first} that most people, mostly, are kind.`; }},
      {label:'Cry until found', sub:'just a kid', effect:p=>{ fx(p,{stress:6,happy:-2}); const ma=p.rels.find(r=>/Mother|Father/.test(r.kind)&&r.alive); if(ma)ma.bond=clamp(ma.bond+5); markCat(p,'child_world'); return `${p.first} cried, loudly, and was scooped up in a flood of relief. Held tighter than usual that night.`; }},
    ]},

  // ---------- Something in the Attic / Basement ----------
  { id:'xc_attic', emoji:'📦', title:'Something in the attic', once:true, track:'life', cat:'child_mystery', weight:3,
    when:p=>p.age>=5 && p.age<=9,
    body:p=>{ const thing=pick(['a box of photographs of people no one will name','a locked tin that rattles','a coat that belonged to someone who died before ${p.first} was born','a bundle of letters tied with string']); setFlag(p,'_atticThing',thing); return `Exploring where they shouldn't, ${p.first} finds ${thing.replace('${p.first}',p.first)}.`; },
    choices:[
      {label:'Tell a parent', sub:'bring it to light', effect:p=>{ fx(p,{happy:2}); if(chance(35)) setFlag(p,'familySecretSeed',true); markCat(p,'child_mystery'); return `${p.first} brought it downstairs. A parent went quiet, then told a story — or changed the subject too fast.`; }},
      {label:'Keep it secret', sub:'yours now', effect:p=>{ setFlag(p,'familySecretSeed',true); fx(p,{smarts:2}); markCat(p,'child_mystery'); return `${p.first} hid it back exactly where it was and told no one. A small private weight, carried quietly.`; }},
      {label:'Try to open it yourself', sub:'curiosity', effect:p=>{ fx(p,{smarts:3,happy:1}); if(chance(50)) setFlag(p,'familySecretSeed',true); markCat(p,'child_mystery'); return `${p.first} worked at it in secret for days. What was inside raised more questions than it answered.`; }},
    ]},

  // ---------- The Neighborhood Eccentric ----------
  { id:'xc_eccentric', emoji:'🏚', title:'The odd one on the street', once:true, track:'life', cat:'child_social', weight:3,
    when:p=>p.age>=6 && p.age<=10,
    body:p=>`There's a person on the street everyone steps around — too quiet, too strange, too alone. The other kids have a name for the house. ${p.first} is curious anyway.`,
    choices:[
      {label:'Befriend them', sub:'against the crowd', effect:p=>{ const was=pick(['a retired scientist','a painter who once showed in real galleries','an old athlete with a shelf of dull medals','a traveler who\'s been everywhere','someone the police used to know well']); setFlag(p,'eccentricGift',was); fx(p,{smarts:4,happy:4}); markCat(p,'child_social'); return `Turns out the odd one was ${was}. They gave ${p.first} something — a book, a story, a skill — that won't make sense for years.`; }},
      {label:'Avoid them with everyone else', sub:'safe', effect:p=>{ fx(p,{happy:1}); markCat(p,'child_social'); return `${p.first} kept their distance, like everyone did. The house stayed a mystery, and a missed one.`; }},
      {label:'Feel sorry for them', sub:'quiet kindness', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:2}); markCat(p,'child_social'); return `${p.first} didn't befriend them, exactly — but waved, once, and meant it. The wave was returned.`; }},
    ]},

  // ---------- Your First Real Win (flavor) ----------
  { id:'xc_firstwin', emoji:'🏅', title:'The first time you were good at something', once:true, track:'life', cat:'child_flavor', weight:3,
    when:p=>p.age>=7 && p.age<=11,
    body:p=>{ const w=pick(['won a race nobody expected ${f} to win','made an entire room laugh on purpose','solved the thing the older kids couldn\'t','made something genuinely beautiful out of nothing']); setFlag(p,'_firstWin',w.replace('${f}',p.first)); return `Not schoolwork — something realer. ${p.first} ${w.replace('${f}',p.first)}. The feeling is brand new.`; },
    choices:[ {label:'Feel it', sub:'+confidence', effect:p=>{ fx(p,{happy:8,athletic:2}); setFlag(p,'tastedWinning',true); markCat(p,'child_flavor'); return `${p.first} learned what it feels like to be good at a thing. It changes the shape of a person, that feeling.`; }} ]},

  // ---------- Your First Real Loss ----------
  { id:'xc_firstloss', emoji:'💔', title:'It didn\'t work, in front of everyone', once:true, track:'life', cat:'child_emotion', weight:3,
    when:p=>p.age>=7 && p.age<=11,
    body:p=>`${p.first} tried — really tried — at something, in front of people who mattered. And it didn't work. The silence after is its own kind of loud.`,
    choices:[
      {label:'Cry', sub:'let it out', effect:p=>{ setFlag(p,'failPattern','feel'); fx(p,{happy:-4,stress:4}); markCat(p,'child_emotion'); return `${p.first} cried, and felt every bit of it. Some people learn early that feelings are meant to be felt.`; }},
      {label:'Pretend it doesn\'t matter', sub:'armor up', effect:p=>{ setFlag(p,'failPattern','deflect'); fx(p,{happy:-2,stress:6}); markCat(p,'child_emotion'); return `${p.first} shrugged like it was nothing. The shrug would become a lifelong reflex.`; }},
      {label:'Get angry', sub:'turn it outward', effect:p=>{ setFlag(p,'failPattern','anger'); fx(p,{stress:8,athletic:2}); markCat(p,'child_emotion'); return `${p.first} got furious — at the loss, the room, themselves. Anger, for ${p.first}, would always be grief in a hurry.`; }},
      {label:'Accept it with strange grace', sub:'rare', effect:p=>{ setFlag(p,'failPattern','grace'); fx(p,{smarts:3,happy:1}); markCat(p,'child_emotion'); return `${p.first} took it with a calm that surprised the adults. Some children arrive already a little wise.`; }},
    ]},

  // ---------- Summer Camp (two-beat via then) ----------
  { id:'xc_camp', emoji:'🏕', title:'Summer camp', once:true, track:'life', cat:'child_world', weight:3,
    when:p=>p.age>=8 && p.age<=12,
    body:p=>`First time away from home for more than a night. The bus pulls out. Home gets small in the window.`,
    choices:[
      {label:'Homesick the whole time', sub:'count the days', effect:p=>{ fx(p,{happy:-3,stress:5}); markCat(p,'child_world'); return `${p.first} missed home like an ache and counted every sunset until pickup.`; },
        then:p=>({ emoji:'🔥', title:'Around the campfire', body:q=>`By the last night, something shifts.`,
          choices:[
            {label:'Find your people', sub:'+joy', effect:q=>{ const f=addFriend(q); setFlag(q,'campFriend',f.name.split(' ')[0]); fx(q,{happy:8}); return `${q.first} found a friend — ${f.name.split(' ')[0]} — the kind summer makes and life sometimes keeps.`; }},
            {label:'Stay a loner', sub:'and that\'s okay', effect:q=>{ fx(q,{smarts:3,happy:1}); return `${q.first} kept to the edges, watched the fire, and was strangely fine with it.`; }},
          ]})},
      {label:'Thrilled from day one', sub:'+joy', effect:p=>{ fx(p,{happy:7,athletic:2}); markCat(p,'child_world'); return `${p.first} took to camp like they'd been waiting for it their whole short life.`; },
        then:p=>({ emoji:'🔥', title:'Around the campfire', body:q=>`By the last night, something shifts.`,
          choices:[
            {label:'Find your people', sub:'+joy', effect:q=>{ const f=addFriend(q); setFlag(q,'campFriend',f.name.split(' ')[0]); fx(q,{happy:8}); return `${q.first} found a friend — ${f.name.split(' ')[0]} — the kind summer makes and life sometimes keeps.`; }},
            {label:'Become the popular one', sub:'+fame', effect:q=>{ fx(q,{fame:4,happy:5}); return `In a place where nobody knew them, ${q.first} got to be someone new. It suited them.`; }},
          ]})},
    ]},

  // ---------- The Drill That Went Real ----------
  { id:'xc_drill', emoji:'🚨', title:'Not a drill', once:true, track:'life', cat:'child_world', weight:3,
    when:p=>p.age>=6 && p.age<=11,
    body:p=>{ const ev=pick(['an earthquake that rattled the windows','a tornado warning that emptied the halls','a fire that wasn\'t a drill this time']); return `${ev[0].toUpperCase()+ev.slice(1)}. The grown-ups' faces are doing the thing where they pretend it's fine.`; },
    choices:[
      {label:'Follow instructions exactly', sub:'steady', effect:p=>{ fx(p,{smarts:2}); markCat(p,'child_world'); return `${p.first} did exactly as told, calm in the chaos. It ended fine. ${p.first} learned they don't panic.`; }},
      {label:'Panic quietly', sub:'inside only', effect:p=>{ fx(p,{stress:8}); markCat(p,'child_world'); return `${p.first} held it together on the outside and came apart on the inside. Nobody knew.`; }},
      {label:'Help a scared classmate', sub:'+heart', effect:p=>{ setFlag(p,'protectiveInstinct',true); setFlag(p,'goodHeart'); fx(p,{happy:4}); markCat(p,'child_world'); return `In the middle of being scared, ${p.first} turned to someone more scared, and helped. That instinct doesn't leave a person.`; }},
    ]},

  // ---------- A Teacher Who Believed In You ----------
  { id:'xc_teacher', emoji:'🍎', title:'A teacher who saw something', once:true, track:'life', cat:'child_emotion', weight:4,
    when:p=>p.age>=7 && p.age<=12 && p.inSchool,
    body:p=>`One teacher looks at ${p.first} a beat longer than the others do — like they see a thing ${p.first} can't see yet.`,
    choices:[
      {label:'Let them in', sub:'a lasting gift', effect:p=>{ const subj=pick([['reading','smarts'],['art','looks'],['gym','athletic'],['science','smarts'],['music','happy']]); fx(p,{[subj[1]]:3, happy:3}); setFlag(p,'believedTeacher',subj[0]); markCat(p,'child_emotion'); return `Through ${subj[0]}, the teacher gave ${p.first} a quiet, permanent push. Decades on, ${p.first} might still dedicate a win to them.`; }},
      {label:'Stay closed off', sub:'not ready', effect:p=>{ fx(p,{happy:-1}); markCat(p,'child_emotion'); return `${p.first} wasn't ready to be seen, and let it pass. Some doors open later, or not at all.`; }},
    ]},

  // ---------- Being Somewhere You Shouldn't ----------
  { id:'xc_offlimits', emoji:'🚪', title:'Where you weren\'t supposed to be', once:true, track:'life', cat:'child_mystery', weight:3,
    when:p=>p.age>=8 && p.age<=11,
    body:p=>`${p.first} ends up somewhere off-limits — an adult conversation behind a door, a room with a lock, the far edge of the allowed world.`,
    choices:[
      {label:'Leave immediately', sub:'good kid', effect:p=>{ fx(p,{happy:1}); markCat(p,'child_mystery'); return `${p.first} backed out quietly. Whatever was there stays unknown — and that's its own kind of safe.`; }},
      {label:'Stay and listen', sub:'learn something', effect:p=>{ const heard=pick(['a secret about a relative','money trouble the adults hide','a truth about why someone left','something ${f} won\'t understand for years']); setFlag(p,'_overheard',heard.replace('${f}',p.first)); if(chance(45)) setFlag(p,'familySecretSeed',true); fx(p,{smarts:3,stress:4}); markCat(p,'child_mystery'); return `${p.first} stayed and heard ${heard.replace('${f}',p.first)}. You can't un-know a thing once you know it.`; }},
      {label:'Get caught', sub:'consequences', effect:p=>{ fx(p,{stress:6,happy:-3}); markCat(p,'child_mystery'); return `${p.first} got caught where they shouldn't be. The trouble was small. The embarrassment, less so.`; }},
    ]},

  // ---------- The Injustice (witnessed) ----------
  { id:'xc_injustice', emoji:'⚖️', title:'It wasn\'t fair', once:true, track:'life', cat:'child_emotion', weight:3,
    when:p=>p.age>=7 && p.age<=11,
    body:p=>`${p.first} watches something genuinely unfair happen — not to them, to someone else. A kid blamed for what they didn't do. Someone treated badly for no reason at all.`,
    choices:[
      {label:'Speak up', sub:'+conscience', effect:p=>{ setFlag(p,'spokeUpYoung',true); setFlag(p,'goodHeart'); fx(p,{happy:3,stress:3}); markCat(p,'child_emotion'); return `${p.first} said something, voice shaking, when saying nothing would have been easier. The instinct to speak takes root young.`; }},
      {label:'Say nothing', sub:'and remember it', effect:p=>{ fx(p,{stress:5,happy:-3}); markCat(p,'child_emotion'); return `${p.first} stayed quiet, and the quiet sat heavy. They'd replay it for years, wishing they'd spoken.`; }},
      {label:'Help quietly, after', sub:'unseen kindness', effect:p=>{ setFlag(p,'goodHeart'); fx(p,{happy:4}); markCat(p,'child_emotion'); return `${p.first} didn't make a scene — just found the wronged kid after, and made it a little better. Quietly.`; }},
      {label:'Tell an adult who does nothing', sub:'first lesson in power', effect:p=>{ setFlag(p,'authorityDistrust',true); fx(p,{happy:-4,smarts:2}); markCat(p,'child_emotion'); return `${p.first} told a grown-up, who shrugged. A first hard lesson: the people in charge don't always fix things.`; }},
    ]},

  // ---------- Getting Glasses ----------
  { id:'xc_glasses', emoji:'👓', title:'Glasses', once:true, track:'life', cat:'child_flavor', weight:2,
    when:p=>p.age>=9 && p.age<=12 && p.stats.smarts>58 && p.stats.looks<=60,
    body:p=>`The world's been blurry at the edges and nobody noticed until now. ${p.first} needs glasses.`,
    choices:[
      {label:'Wear them proudly', sub:'+smarts', effect:p=>{ fx(p,{smarts:3,looks:-1}); markCat(p,'child_flavor'); return `${p.first} put them on and saw the leaves on trees for the first time. Worth it.`; }},
      {label:'Hate them', sub:'self-conscious', effect:p=>{ fx(p,{happy:-2}); markCat(p,'child_flavor'); return `${p.first} wore them, miserably, and counted the days till contacts were allowed.`; }},
      {label:'Refuse to wear them', sub:'-smarts', effect:p=>{ fx(p,{smarts:-2}); markCat(p,'child_flavor'); return `${p.first} left them in a drawer and squinted through school, missing half the board.`; }},
    ]},

  // ---------- The Fight You Didn't Start ----------
  { id:'xc_fightnotstart', emoji:'🥊', title:'You didn\'t start it', once:true, track:'life', cat:'child_world', weight:3,
    when:p=>p.age>=9 && p.age<=12,
    body:p=>`It found ${p.first} anyway — shoved into a corner, a circle forming, no teacher in sight. ${p.first} didn't want this.`,
    choices:[
      {label:'Fight back', sub:'depends on you', effect:p=>{ if(p.stats.athletic>52||chance(45)){ setFlag(p,'standsUp'); fx(p,{athletic:3,happy:5}); markCat(p,'child_world'); return `${p.first} held their own. Word got around. Nobody tried again for a long time.`;} fx(p,{health:-8,happy:-4}); setFlag(p,'childResilient',true); markCat(p,'child_world'); return `${p.first} lost, badly — but got back up. That's its own kind of winning.`; }},
      {label:'Run', sub:'live to tell it', effect:p=>{ fx(p,{happy:-2}); markCat(p,'child_world'); return `${p.first} ran, heart hammering. Smart, maybe. It didn't feel smart.`; }},
      {label:'Talk your way out', sub:'+smarts', effect:p=>{ fx(p,{smarts:4,happy:2}); setFlag(p,'silverTongue',true); markCat(p,'child_world'); return `${p.first} found the right words at the right second and the circle broke up, confused. A useful gift, that.`; }},
      {label:'Freeze', sub:'it happens', effect:p=>{ fx(p,{stress:8,happy:-3}); markCat(p,'child_world'); return `${p.first} froze, and it was over before they could move. The freezing is the part they'll remember.`; }},
    ]},

  // ---------- First Unfairness Directed At You ----------
  { id:'xc_unfairyou', emoji:'🪞', title:'Because of who you are', once:true, track:'life', cat:'child_emotion', weight:3,
    when:p=>p.age>=8 && p.age<=12,
    body:p=>`For the first time, someone treats ${p.first} badly for something ${p.first} can't change — how they look, where they're from, something about their family.`,
    choices:[
      {label:'React with anger', sub:'fight it', effect:p=>{ setFlag(p,'discrimResponse','fight'); fx(p,{stress:8,athletic:2}); markCat(p,'child_emotion'); return `${p.first} met it with fury. The fury would always be ready, after this.`; }},
      {label:'Internalize it', sub:'carry it inward', effect:p=>{ setFlag(p,'discrimResponse','internal'); fx(p,{happy:-6,stress:6}); markCat(p,'child_emotion'); return `${p.first} took it inside and turned it over, again and again. Some wounds go quiet, not away.`; }},
      {label:'Ask an adult for help', sub:'reach out', effect:p=>{ setFlag(p,'discrimResponse','seek'); fx(p,{happy:1}); markCat(p,'child_emotion'); return `${p.first} told someone who listened. It helped — and taught ${p.first} that help exists, if you ask.`; }},
      {label:'Pretend it didn\'t land', sub:'armor', effect:p=>{ setFlag(p,'discrimResponse','mask'); fx(p,{stress:5}); markCat(p,'child_emotion'); return `${p.first} laughed it off so well that even they almost believed it.`; }},
    ]},

  // ---------- The Local Legend ----------
  { id:'xc_locallegend', emoji:'🏚', title:'The place everyone\'s scared of', once:true, track:'life', cat:'child_world', weight:3,
    when:p=>p.age>=9 && p.age<=12,
    body:p=>`Every neighborhood has one — the warehouse, the empty house, the lot at the end of the road. The one with stories. The kids dare each other and nobody ever actually goes.`,
    choices:[
      {label:'Go investigate', sub:'brave or foolish', effect:p=>{ const found=pick(['absolutely nothing, which was its own letdown','old furniture and a smell of rain','something genuinely strange ${f} couldn\'t explain','a clue that would mean something years later']); if(/clue|strange/.test(found)) setFlag(p,'teenMysterySeed',true); fx(p,{happy:5,athletic:2}); setFlag(p,'childBrave',true); markCat(p,'child_world'); return `${p.first} actually went in. Inside: ${found.replace('${f}',p.first)}. ${p.first} came out a small local legend themselves.`; }},
      {label:'Chicken out', sub:'live to dare again', effect:p=>{ fx(p,{happy:-1}); markCat(p,'child_world'); return `${p.first} got to the threshold and turned back. The dare went unclaimed. There's no shame in it — but it felt like shame.`; }},
      {label:'Spread the legend instead', sub:'+story', effect:p=>{ fx(p,{happy:3,smarts:2}); setFlag(p,'storyteller',true); markCat(p,'child_world'); return `${p.first} never went in — but the version of the story ${p.first} told got better every year.`; }},
    ]},

  // ---------- You Built Something ----------
  { id:'xc_built', emoji:'🔧', title:'You made a thing', once:true, track:'life', cat:'child_flavor', weight:3,
    when:p=>p.age>=8 && p.age<=11,
    body:p=>{ const thing=pick(['a fort that actually held','a model that actually worked','a contraption out of junk and tape','something from a kit, finished alone']); setFlag(p,'_built',thing); return `It took real effort, real hours. But ${p.first} built ${thing} — and it works.`; },
    choices:[
      {label:'Show family', sub:'the reaction matters', effect:p=>{ const r=pick(['enthusiasm','dismissal','mild interest']); if(r==='enthusiasm'){ fx(p,{happy:8,smarts:3}); setFlag(p,'maker',true); markCat(p,'child_flavor'); return `${p.first} showed it off and a parent lit up. ${p.first} would chase that feeling for life.`;} if(r==='dismissal'){ fx(p,{happy:-5,smarts:2}); markCat(p,'child_flavor'); return `${p.first} held it up and got a distracted "that's nice." A small wound, quietly filed away.`;} fx(p,{happy:2,smarts:2}); markCat(p,'child_flavor'); return `${p.first} showed it; the family nodded, mildly. Fine. ${p.first} knew what it took.`; }},
      {label:'Keep it to yourself', sub:'private pride', effect:p=>{ fx(p,{smarts:4,happy:4}); setFlag(p,'maker',true); markCat(p,'child_flavor'); return `${p.first} didn't show anyone. The pride was complete and entirely their own.`; }},
    ]},

];

CHOICE_EVENTS.push(...EXP_CHILDHOOD);
