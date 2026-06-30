"use strict";
/* Threadbare · content module: 32-expanded-powers.js — EXPANDED PART 4: PER-POWER EVENTS
   Personal (not tactical) events for every power in the 50-power pool. Each
   power fires 2–3 unique beats across an adult life: early ones are accidents
   and discoveries, later ones are controlled but morally heavier. track:'world'.
   These NEVER explain their own meaning.

   Built data-first: POWER_BEATS maps a canonical power name → an array of beats.
   A tiny factory turns each beat into a standard CHOICE_EVENTS object so the
   four-track picker + cooldown treat them like any other event. Power names
   must match the canonical POWERS list in module 02 exactly.
   ============================================================ */

// each beat: { id, emoji, title, minAge, maxAge, body, choices:[{label,sub,fx,flag}] }
//   fx   = stat bundle passed to fx()
//   flag = optional flag to set (string)
//   line = result text (uses ${name} for p.first)
// "early" beats (accident/discovery) get lower minAge; "late" beats are morally complex.

const PB = {}; // POWER_BEATS

function beat(power, b){ // b may be one beat or an array of beats
  const arr = Array.isArray(b) ? b : [b];
  (PB[power]=PB[power]||[]).push(...arr);
}
const N = '${name}'; // sugar for the character's first name in beat text

// ---- PHYSICAL ----
beat('super strength',[
  {id:'handshake', emoji:'💪', title:'Too hard', min:18, max:70, body:`A handshake with someone important — and ${N} squeezes a half-degree too hard. Their face does something. The flicker tells ${N} exactly what kind of person they are.`,
   choices:[{label:'Ease off and apologize',fx:{stress:3},line:`${N} caught it instantly and softened. The moment passed. ${N} filed away what that flicker revealed.`},
            {label:'Hold the grip a beat longer',fx:{stress:4,fame:1},flag:'usedStrengthEdge',line:`${N} let them feel it, just for a second. A small, private message sent. Risky. Effective.`}]},
  {id:'crane', emoji:'🏗', title:'It was going to fall', min:20, max:60, body:`A crane fails overhead. People below. ${N} is the only one who can stop it — but not without being seen doing the impossible.`,
   choices:[{label:'Stop it, let them see',fx:{fame:5,stress:8},flag:'strengthExposed',line:`${N} caught the impossible in front of everyone. Lives saved, secret spent. Phones were out.`},
            {label:'Stop it from the shadows',fx:{stress:10,health:-3},line:`${N} braced it from where no camera could see, and walked away before the dust settled. No one will ever know who.`},
            {label:'Can\'t reach it in time without exposure',fx:{stress:14,happy:-8},line:`${N} hesitated one half-second too long, weighing the secret against the fall. ${N} will replay that half-second for years.`}]},
  {id:'bet', emoji:'🎰', title:'Prove it', min:18, max:55, body:`Someone's put real money on ${N} not being able to lift the thing ${N} could lift with one hand. A crowd is gathering.`,
   choices:[{label:'Win the bet',fx:{money:5000,fame:3,stress:5},flag:'strengthRumor',line:`${N} won, and the win started a rumor that wouldn't quite die.`},
            {label:'Lose on purpose',fx:{money:-2000,happy:2},line:`${N} grunted, strained theatrically, and "failed." The secret stayed safe. The money didn't.`}]},
]);
beat('super speed',[
  {id:'slowmo', emoji:'⚡', title:'You had time', min:18, max:60, body:`An accident unfolds in front of ${N} — and to ${N} it's slow, almost gentle. There's time. There's always time, now. The only question is whether ${N} uses it.`,
   choices:[{label:'Prevent it',fx:{fame:3,stress:6},flag:'speedSaved',line:`${N} moved, and the accident simply didn't happen. The people involved never knew how close it came.`},
            {label:'Let it happen — too exposed',fx:{stress:12,happy:-8},line:`${N} stood still inside that long, slow second and chose not to. The weight of having had time is its own punishment.`}]},
  {id:'speedgun', emoji:'📡', title:'That number isn\'t possible', min:16, max:50, body:`A roadside speed check clocks ${N} — on foot, ${N} thought, casually. The number on the readout cannot exist. The officer is staring at it.`,
   choices:[{label:'Play dumb and leave',fx:{stress:6,smarts:2},line:`${N} shrugged like the machine was broken and walked off at a very ordinary pace.`},
            {label:'Disappear before they look up',fx:{stress:8},flag:'speedRumor',line:`${N} was simply gone between one blink and the next. Somewhere, a confused report got filed and ignored.`}]},
]);
beat('super endurance',[
  {id:'physical', emoji:'🩺', title:'They keep looking', min:25, max:60, body:`A routine health check turns strange. The doctors can't find anything wrong — and they can't find anything normal either. They keep ordering more tests.`,
   choices:[{label:'Decline further testing',fx:{stress:6},line:`${N} politely declined the follow-ups and walked out before the curiosity hardened into a file.`},
            {label:'Let them look',fx:{stress:8,smarts:2},flag:'enduranceFlagged',line:`${N} let them poke and scan. Somewhere now there's a chart with a question mark on it where a heart rate should be.`}]},
  {id:'nearmiss', emoji:'🧗', title:'You should be hurt', min:20, max:55, body:`${N} walks away from something — a fall, an exposure, a crash — that should have left a mark, and didn't. A witness is looking at ${N} like a puzzle.`,
   choices:[{label:'Limp convincingly',fx:{stress:5,smarts:2},line:`${N} faked the injury everyone expected and let the witness keep their tidy version of reality.`},
            {label:'Just walk away whole',fx:{stress:7},flag:'enduranceSeen',line:`${N} didn't bother pretending. The witness will tell that story for years and nobody will believe them.`}]},
]);
beat('regeneration',[
  {id:'heal_seen', emoji:'🩹', title:'It closed while they watched', min:18, max:65, body:`A visible wound on ${N} knits shut — in front of someone. Their face is the whole event now.`,
   choices:[{label:'Make them doubt what they saw',fx:{stress:6,smarts:3},line:`${N} laughed, "trick of the light," and somehow sold it. People want the ordinary explanation. ${N} gave them one.`},
            {label:'Let them know it\'s real',fx:{stress:10},flag:'regenShared',line:`${N} held their gaze and let the truth sit there. Now one other person carries it too.`}]},
  {id:'scan', emoji:'📋', title:'The scan won\'t match', min:30, max:60, body:`A doctor wants a follow-up scan. It won't match last year's chart — because last year's damage is simply gone.`,
   choices:[{label:'Skip the appointment',fx:{stress:5},line:`${N} cancelled and rescheduled into oblivion. Some questions are better never asked.`},
            {label:'Show up and improvise',fx:{stress:8,smarts:2},flag:'regenFlagged',line:`${N} went, smiled, and gave vague answers to very specific anomalies. The doctor's frown followed ${N} out the door.`}]},
]);
beat('invulnerability',[
  {id:'deflect', emoji:'🛡', title:'The bullet bounced', min:18, max:60, body:`A robbery. A gun. The round hits ${N} and pings off like a thrown pebble. The mugger runs. A bystander was filming.`,
   choices:[{label:'Find the bystander\'s phone',fx:{stress:8,smarts:2},flag:'invulnExposed',line:`${N} tried to get ahead of the footage. Some of it got out anyway. Grainy. Deniable. Mostly.`},
            {label:'Just leave',fx:{stress:6},line:`${N} walked off rubbing the spot out of habit, not pain, and let the clip become one more internet mystery.`}]},
  {id:'car', emoji:'🚗', title:'The driver is worse off', min:18, max:60, body:`A car clips ${N} at low speed. ${N} stands up annoyed. The driver, meanwhile, is shaking and apologizing and very much more damaged than ${N} is.`,
   choices:[{label:'Comfort them, downplay it',fx:{happy:2,stress:3},flag:'goodHeart',line:`${N} ended up consoling the person who hit them. The driver will tell that story wrong forever.`},
            {label:'Make a scene to seem normal',fx:{stress:4,smarts:2},line:`${N} performed an injury ${N} didn't have so the moment would look like every other fender-bender. Convincing. Exhausting.`}]},
]);
beat('size manipulation',[
  {id:'shift', emoji:'📐', title:'You slipped sizes', min:18, max:55, body:`Claustrophobia, or panic, and ${N} shifts without meaning to — too large for the room, or too small to reach the handle. A breath to fix it. A long breath.`,
   choices:[{label:'Recover before anyone notices',fx:{stress:6},line:`${N} caught it in time and clicked back to default, heart pounding, in an empty hallway.`},
            {label:'Someone saw',fx:{stress:10},flag:'sizeSeen',line:`Someone turned at exactly the wrong moment. ${N} watched them rewrite what's possible in real time.`}]},
  {id:'argument', emoji:'😤', title:'You grew', min:18, max:55, body:`Mid-argument, ${N} grows — slightly, unconsciously — and the other person takes a step back without quite knowing why.`,
   choices:[{label:'Shrink back, apologize',fx:{stress:4,happy:-1},line:`${N} caught it and folded back down, and the argument deflated into something gentler.`},
            {label:'Use the inch',fx:{stress:5},flag:'sizeIntimidate',line:`${N} let the inch do its work. Won the argument. Didn't love how it felt to win that way.`}]},
]);
beat('density control',[
  {id:'immovable', emoji:'🪨', title:'You couldn\'t be moved', min:18, max:60, body:`In a confrontation, ${N} goes heavy on instinct. The person trying to shove ${N} simply... can't. Their face cycles through confusion to something colder.`,
   choices:[{label:'Let them push you next time',fx:{stress:4,smarts:2},line:`${N} made sure the next shove "worked," restoring their sense of physics. Cheaper than the questions.`},
            {label:'Stay planted',fx:{stress:5,athletic:1},flag:'densitySeen',line:`${N} didn't budge an inch and watched them decide ${N} was something other than human.`}]},
  {id:'elevator', emoji:'🛗', title:'The cable went', min:20, max:60, body:`A falling elevator. ${N} lightens to almost nothing on pure instinct and drifts to the bottom like a leaf. The other passenger is screaming, then not, then staring.`,
   choices:[{label:'"We got lucky"',fx:{stress:6,smarts:2},line:`${N} sold it as a miracle of safety brakes. The passenger wanted to believe it, so they did.`},
            {label:'Say nothing at all',fx:{stress:8},flag:'densitySaved',line:`${N} just opened the doors and walked out into the lobby, leaving one witness to a thing with no explanation.`}]},
]);

// ---- SENSORY ----
beat('laser vision',[
  {id:'glow', emoji:'👀', title:'Your eyes did the thing', min:13, max:50, body:`Watching something with someone, ${N}'s eyes briefly glow. They turn: "Hey — you okay?"`,
   choices:[{label:'Blame the light',fx:{stress:5,smarts:2},line:`"Just tired," ${N} said, and rubbed their eyes, and the moment closed. Barely.`},
            {label:'Make an excuse and leave',fx:{stress:6},line:`${N} found a reason to step out until the heat behind their eyes cooled. Close ones teach control fast.`}]},
  {id:'firstdeliberate', emoji:'🎯', title:'The first time on purpose, for someone', min:18, max:60, body:`An emergency. Someone asks ${N}, directly, to cut through something — to use it, on purpose, to help. ${N} has never aimed it deliberately for another person before.`,
   choices:[{label:'Do it — carefully',fx:{stress:6,fame:2},flag:'laserHelped',line:`${N} steadied, aimed, and used the thing ${N} feared as a tool, for good, for the first time. It changes how ${N} holds it forever after.`},
            {label:'Refuse — too dangerous',fx:{stress:8,happy:-3},line:`${N} couldn't risk it, and said so, and watched the emergency resolve some other slower way. Safe. It didn't feel like safety.`}]},
]);
beat('x-ray vision',[
  {id:'health', emoji:'🩻', title:'You saw something they don\'t know', min:20, max:65, body:`Looking at someone, ${N} sees it — a shadow, a mass, a thing in their body they don't know about yet. ${N} knows before they do.`,
   choices:[{label:'Find a way to nudge them to a doctor',fx:{stress:8,happy:2},flag:'goodHeart',line:`${N} engineered a reason for them to "just get checked out." Maybe it saved a life. ${N} will never be able to say how ${N} knew.`},
            {label:'Say nothing — it isn\'t yours to know',fx:{stress:10,happy:-4},line:`${N} carried it in silence. The not-telling is a specific, gnawing weight when you can see what others can't.`}]},
  {id:'armed', emoji:'🔫', title:'You know they\'re armed', min:20, max:60, body:`Before a tense moment turns, ${N} sees what's hidden on someone — a weapon. They don't know ${N} knows.`,
   choices:[{label:'Defuse it quietly',fx:{stress:8,smarts:3},flag:'xraySaved',line:`${N} steered everyone out of the danger before it bloomed, and no one ever understood the strange instinct that did it.`},
            {label:'Confront them with it',fx:{stress:12,health:-4},line:`${N} called it out — and now had to explain knowing the unknowable. It went tense, and strange, and ${N} got lucky.`}]},
]);
beat('telescopic vision',[
  {id:'fardistress', emoji:'🔭', title:'Miles away, something\'s wrong', min:18, max:60, body:`From a window, from a rooftop, ${N} sees something happening far too far away to be seen — and it needs help.`,
   choices:[{label:'Go',fx:{stress:7,fame:2},flag:'teleSaved',line:`${N} went, on knowledge ${N} couldn't possibly have, and got there in time. The how is unexplainable. The why isn't.`},
            {label:'Call it in anonymously',fx:{stress:5,smarts:2},line:`${N} phoned it in from a number that wouldn't trace, gave just enough, and let others arrive. Helping from behind the curtain.`}]},
]);
beat('microscopic vision',[
  {id:'food', emoji:'🔬', title:'You can see what\'s on it', min:18, max:65, body:`${N} looks at the food and sees, in vivid detail, exactly what's living on it. Now ${N} has to decide whether to eat it anyway.`,
   choices:[{label:'Eat it — you\'ll be fine',fx:{happy:1},line:`${N} ate it, knowing too much, and was fine, as ${N} knew ${N} would be. A curse, this clarity, at dinner.`},
            {label:'Quietly don\'t',fx:{stress:2,smarts:1},line:`${N} pushed the plate aside with a vague excuse. Try explaining you can see bacteria. ${N} didn't.`}]},
  {id:'wish', emoji:'🩺', title:'A doctor wishes for your eyes', min:25, max:65, body:`A medical professional, frustrated by a hard case, sighs that they wish they could just *see* inside. ${N} can. ${N} says nothing.`,
   choices:[{label:'Offer a "hunch"',fx:{stress:6,smarts:3},flag:'microHelped',line:`${N} floated a "weird guess" that happened to be exactly right. The doctor stared. ${N} shrugged.`},
            {label:'Stay silent',fx:{stress:4},line:`${N} swallowed the answer ${N} could see plainly. Some gifts can't be shared without becoming a different kind of problem.`}]},
]);
beat('super hearing',[
  {id:'aboutyou', emoji:'👂', title:'Three floors away, about you', min:16, max:60, body:`In a quiet room, ${N} hears a conversation from three floors off — and it's about ${N}.`,
   choices:[{label:'Listen to all of it',fx:{stress:8,smarts:2},flag:'overheardSelf',line:`${N} heard every word, the kind and the unkind. You can't un-hear what people say when they think you can't.`},
            {label:'Tune it out',fx:{stress:4,happy:1},line:`${N} pushed it back into the wall of noise, on purpose. Some peace has to be chosen, deliberately, by those who can hear everything.`}]},
  {id:'lie', emoji:'💓', title:'The heartbeat doesn\'t match', min:18, max:60, body:`Someone tells ${N} something — and underneath the words, ${N} hears the heartbeat skip and stutter. They're lying. ${N} now knows.`,
   choices:[{label:'Call it out',fx:{stress:6,smarts:2},flag:'hearingCaughtLie',line:`${N} named the lie, gently, and watched them realize they'd been read. The trust it built — and broke — was real.`},
            {label:'Let them think it worked',fx:{stress:5,smarts:3},line:`${N} nodded along to the lie, filing the truth away. Knowing and saying are very different powers.`}]},
]);
beat('echolocation',[
  {id:'blackout', emoji:'🦇', title:'When the lights died', min:18, max:60, body:`A total blackout. Everyone's frozen, blind. ${N} navigates it like noon.`,
   choices:[{label:'Lead them out',fx:{fame:3,happy:3,stress:4},flag:'echoSaved',line:`${N} guided a roomful of blind people to the door through pure sound. "How did you—" they started. ${N} didn't finish it for them.`},
            {label:'Slip out alone',fx:{stress:3,smarts:2},line:`${N} found the exit instantly and quietly, leaving the dark to everyone who couldn't read it.`}]},
]);
beat('precognition',[
  {id:'prevent', emoji:'🔮', title:'You moved before it happened', min:18, max:60, body:`A flash — and ${N} moves, and the accident that was about to happen doesn't. There's no way to explain why ${N} stepped left.`,
   choices:[{label:'Brush off the questions',fx:{stress:5,smarts:2},line:`"Lucky," ${N} said, to the people staring at the impossible timing. ${N} is getting good at "lucky."`},
            {label:'Sit with what you saw',fx:{stress:7},flag:'precogCarry',line:`${N} saved them, then went quiet for the rest of the day, turning over the thing about seeing the future: you're always a little bit somewhere else.`}]},
  {id:'loved', emoji:'⏳', title:'It\'s about someone you love', min:25, max:60, body:`Not an accident this time. A flash of something coming — for someone ${N} loves. Weeks away. Clear enough to fear, vague enough to feel helpless.`,
   choices:[{label:'Try to prevent it',fx:{stress:14,health:2},flag:'precogFighting',line:`${N} began, quietly and relentlessly, to rearrange the small things that might lead there. Whether the future bends, ${N} is about to learn.`},
            {label:'Stay close to them',fx:{happy:4,stress:8},line:`${N} couldn't change it, so ${N} did the only thing left: drew nearer, loved harder, was simply *there* in the weeks that might be the last.`},
            {label:'Tell them',fx:{stress:10,happy:-2},flag:'precogTold',line:`${N} handed them the terrible knowledge. A burden shared, or a peace stolen — ${N} won't know which until it's over.`}]},
]);
beat('cosmic awareness',[
  {id:'beforebreak', emoji:'🌌', title:'Before the news broke', min:25, max:65, body:`${N} knows something is wrong somewhere in the world — a real, heavy wrongness — hours before any headline confirms it.`,
   choices:[{label:'Wait for the world to catch up',fx:{stress:8,happy:-3},line:`${N} carried the knowing alone until the news made it real for everyone else. The gap between is a lonely place to stand.`},
            {label:'Try to warn someone',fx:{stress:10,smarts:2},flag:'cosmicWarned',line:`${N} tried to say something — and got the look reserved for people who claim to feel earthquakes coming. ${N} stopped trying after a while.`}]},
  {id:'homemood', emoji:'🦅', title:'A bad day for no reason', min:25, max:65, body:`${N} wakes wrong — a dread with no source. Hours later the news explains it: *he* had a bad day, thousands of miles away, and ${N} felt it before anyone knew.`,
   choices:[{label:'Learn to filter it',fx:{stress:6,smarts:3},flag:'cosmicFilter',line:`${N} slowly learned to tell *his* moods from ${N}'s own. A survival skill, for whoever carries the whole sky.`},
            {label:'Let it wash through',fx:{stress:9,happy:-4},line:`${N} stopped fighting it and let the world's weather move through them. It costs something, being that open.`}]},
]);

// ---- ELEMENTAL ----
beat('elemental control',[
  {id:'flood', emoji:'🌊', title:'You redirected it', min:18, max:60, body:`A flood, fast and rising. ${N} moves a hand without deciding to and the water *turns*. A small group of strangers live because of it. None of them know how.`,
   choices:[{label:'Slip away',fx:{stress:6,happy:3},flag:'elemSaved',line:`${N} faded into the chaos before anyone connected the saved with the savior.`},
            {label:'Stay and help openly',fx:{fame:3,stress:8},line:`${N} stayed in it, hands working, and a few people saw something they'll never quite be able to describe.`}]},
]);
beat('pyrokinesis',[
  {id:'kitchen', emoji:'🔥', title:'A kitchen fire', min:18, max:60, body:`A grease fire climbs the wall. ${N} could snuff it in a heartbeat — the trouble is doing it without explaining how a fire just *stopped*.`,
   choices:[{label:'Put it out in front of them',fx:{stress:8,fame:1},flag:'pyroSeen',line:`${N} killed the fire with a gesture and an extinguisher held very obviously, hoping the eye chooses the can over the truth.`},
            {label:'Fake the extinguisher, do it quietly',fx:{stress:6,smarts:2},line:`${N} let the canister take the credit while the real work happened underneath it. Misdirection: the powered person's oldest friend.`}]},
]);
beat('electrokinesis',[
  {id:'flicker', emoji:'💡', title:'The lights answer you', min:16, max:55, body:`Every light in the building flickers when ${N}'s stress spikes. People glance up. ${N} breathes.`,
   choices:[{label:'Get the stress down',fx:{stress:-4,smarts:2},line:`${N} steadied, and the lights steadied with them. The body and the building, learning to share a nervous system.`},
            {label:'Storm out before it worsens',fx:{stress:6},flag:'electroSeen',line:`${N} left fast, but not before the lights did something no faulty wiring explains. A few people will remember.`}]},
]);
beat('cryokinesis',[
  {id:'froze', emoji:'❄️', title:'The drink froze', min:16, max:55, body:`Distracted by something painful, ${N} doesn't notice the glass in their hand has gone solid with frost.`,
   choices:[{label:'Hide it, warm it fast',fx:{stress:5,smarts:2},line:`${N} palmed the frost away before anyone looked twice, grief and ice both tucked back out of sight.`},
            {label:'Let them wonder',fx:{stress:4},flag:'cryoSeen',line:`${N} set the frozen glass down in plain view, too tired to hide it, and let the table puzzle over the impossible.`}]},
]);
beat('hydrokinesis',[
  {id:'flashflood', emoji:'💧', title:'You held the river', min:18, max:60, body:`A flash flood, no time to think — ${N} just *holds* it, an instinct older than thought, and a wall of water leans away from people who'd have drowned.`,
   choices:[{label:'Release it slowly, vanish',fx:{stress:8,happy:3},flag:'hydroSaved',line:`${N} eased the water down and was gone before the rescued could find the one to thank.`},
            {label:'Hold until everyone\'s clear',fx:{stress:12,health:-3,fame:2},line:`${N} held it, shaking, until the last person reached high ground — and a handful of them saw exactly what kept them alive.`}]},
]);
beat('aerokinesis',[
  {id:'gust', emoji:'🌬', title:'The wind moved the car', min:18, max:60, body:`A vehicle comes at ${N} too fast — and an instinctive gust nudges it just enough. Inches. Enough.`,
   choices:[{label:'Act as shaken as you look',fx:{stress:6},line:`${N} sat down hard on the curb and let everyone assume it was a near miss, not a saved life.`},
            {label:'Note that you can do that now',fx:{stress:4,smarts:3},flag:'aeroAware',line:`${N} walked away cataloguing it: *I can do that. On instinct. Without deciding.* Both reassuring and not.`}]},
]);
beat('geokinesis',[
  {id:'quake', emoji:'🌋', title:'You felt where it came from', min:18, max:60, body:`An earthquake — and ${N} feels it differently than everyone else, reads it, knows where it's radiating from and where it'll hit next.`,
   choices:[{label:'Steer people to safety',fx:{stress:8,fame:2},flag:'geoSaved',line:`${N} moved people away from exactly the wrong walls, on knowledge that came from the ground itself.`},
            {label:'Just brace and say nothing',fx:{stress:6},line:`${N} rode it out in silence, the earth's intentions clear as a map only ${N} could read.`}]},
]);
beat('weather control',[
  {id:'funeral', emoji:'🌧', title:'It rained at the funeral', min:25, max:70, body:`Clear skies all week. Then, at the graveside, rain — and ${N} knows, with a sick certainty, that ${N} didn't decide to make it.`,
   choices:[{label:'Let it fall',fx:{stress:8,happy:-4},flag:'weatherGrief',line:`${N} let the sky grieve along, and never told a soul that the weather had been ${N}'s heart, leaking out.`},
            {label:'Force it to stop',fx:{stress:12,health:-2},line:`${N} clamped down hard and dragged the clouds back, controlling the one thing ${N} could on a day ${N} controlled nothing else.`}]},
  {id:'drought', emoji:'🌦', title:'They asked you to make it rain', min:25, max:70, body:`Someone in a dying-dry place has figured out enough to ask ${N}, quietly, for rain. The whole ethical weight of yes — and of no — lands at once.`,
   choices:[{label:'Help them',fx:{stress:10,happy:4,fame:2},flag:'weatherHelped',line:`${N} brought the rain. Crops lived. And ${N} learned how it feels to be asked to play god, and to say yes.`},
            {label:'Refuse — that line can\'t be crossed',fx:{stress:10,happy:-4},line:`${N} said no, because where does it stop once it starts. The drought went on. ${N} isn't sure ${N} was right.`}]},
]);

// ---- MENTAL / PSYCHIC ----  (telepathy/mind control have deep arcs in module 27; here are the *discovery* beats)
beat('telepathy',[
  {id:'dinner', emoji:'🧠', title:'The noise of a room', min:16, max:45, body:`A dinner party, and the surface-thoughts of everyone present hit ${N} all at once — a physical roar. ${N} has to learn, fast, how to stand inside it.`,
   choices:[{label:'Build the wall',fx:{stress:6,smarts:3},flag:'teleControl',line:`${N} learned to mute it, like turning down a radio with a muscle ${N} didn't have yesterday. The first real skill of the gift.`},
            {label:'Leave — it\'s too much',fx:{stress:10,happy:-3},line:`${N} made an excuse and fled to a quiet street. Some nights the world is simply too loud for the one who can hear it think.`}]},
  {id:'politician', emoji:'🤝', title:'What they\'re actually thinking', min:20, max:60, body:`A handshake with someone powerful, and ${N} feels the precise calculation running behind their warm smile. What they're thinking is nothing like what they're saying.`,
   choices:[{label:'Use what you felt',fx:{stress:6,smarts:3,fame:1},flag:'teleEdge',line:`${N} adjusted, played the real game under the spoken one, and came out ahead. It works. It always works. That's the unsettling part.`},
            {label:'Pretend you felt nothing',fx:{stress:5},line:`${N} smiled back and gave away nothing, holding the gap between their words and their mind like a coin under the tongue.`}]},
]);
beat('mind control',[
  {id:'clerk', emoji:'🌀', title:'You used it on a small thing', min:18, max:55, body:`A rude clerk, a stuck situation — and ${N} reaches in and *adjusts* them, just like that. The wrongness of it arrives a half-second after it works.`,
   choices:[{label:'Never again for something this small',fx:{stress:8,happy:-3},flag:'mindRestraint',line:`${N} got what ${N} wanted and felt sick about it, and swore off using a sledgehammer on a thumbtack. A line, drawn.`},
            {label:'...that was efficient, actually',fx:{stress:6},flag:'mindSlippery',line:`${N} noticed how easy it was, how clean, how tempting. That noticing is the first step down a particular hill.`}]},
  {id:'resisted', emoji:'🛑', title:'Someone resisted', min:20, max:60, body:`${N} reaches into someone's mind, the way ${N} always can — and hits a wall. They didn't bend. This has never happened. They're looking at ${N} differently now.`,
   choices:[{label:'Back off fast',fx:{stress:10,smarts:2},flag:'mindMetEqual',line:`${N} retreated, rattled. Somewhere out there is at least one mind ${N} can't touch — and it just learned what ${N} tried to do.`},
            {label:'Push harder',fx:{stress:14,health:-3},line:`${N} pushed, and the wall held, and the headache was blinding. Whatever they are, they're now an enemy who knows exactly what ${N} is.`}]},
]);
beat('empathy',[
  {id:'funeralgrief', emoji:'❤️‍🩹', title:'All of it, at once', min:18, max:60, body:`At a funeral, the grief of the whole room pours into ${N} — every person's, simultaneously, undiluted.`,
   choices:[{label:'Let it move through you',fx:{stress:10,happy:-3},flag:'empathFeels',line:`${N} stood in the center of a hundred sorrows and let them pass through like weather. Drained. Connected. Both.`},
            {label:'Shield, just this once',fx:{stress:6,smarts:2},line:`${N} pulled the walls up to survive the hour, and felt a little guilty for not feeling enough on a day made of feeling.`}]},
  {id:'underanger', emoji:'🕊', title:'What\'s under the anger', min:18, max:60, body:`Someone's raging at ${N} — and ${N} feels, clear as a bell, the fear and hurt sitting underneath the fury. The anger stops being frightening and becomes legible.`,
   choices:[{label:'Speak to what\'s underneath',fx:{happy:4,smarts:2},flag:'goodHeart',line:`${N} answered the pain instead of the shouting, and watched the whole storm collapse into something human.`},
            {label:'Just weather it',fx:{stress:5},line:`${N} let them rage, understanding it completely, and that understanding was its own quiet shield.`}]},
]);
beat('dream walking',[
  {id:'accident', emoji:'🌙', title:'You were in their dream', min:18, max:60, body:`${N} drifts, asleep, into someone else's dream by accident. They'll never know. But ${N} saw something in there.`,
   choices:[{label:'Forget you saw it',fx:{stress:6},line:`${N} chose to let it dissolve like dreams do, refusing to use what was never offered. Decency, in a place with no witnesses.`},
            {label:'Carry what you saw',fx:{stress:8,smarts:2},flag:'dreamSaw',line:`${N} woke holding a piece of someone's secret self. Now ${N} sees them differently, and they'll never understand why.`}]},
]);
beat('memory manipulation',[
  {id:'kindremoval', emoji:'🧽', title:'You told yourself it was kind', min:20, max:65, body:`Someone is suffering under a single bad memory. ${N} could lift it out, clean, painless. ${N} tells themselves it would be a mercy.`,
   choices:[{label:'Remove it',fx:{stress:8,happy:1},flag:'memoryPlayedGod',line:`${N} took the memory and the suffering with it. They woke lighter, and ${N} woke heavier, holding a thing about ${N}'s own power that won't go away.`},
            {label:'Leave it — even pain is theirs',fx:{stress:6,smarts:3},line:`${N} kept ${N}'s hands out of their head. Their pain stayed theirs. ${N} decided that's what respect actually means.`}]},
]);
beat('psychic shielding',[
  {id:'doesntwork', emoji:'🪖', title:'It doesn\'t work on you', min:18, max:60, body:`${N} meets someone who realizes, with visible surprise, that their telepathy slides right off ${N}. Their reaction is the whole event.`,
   choices:[{label:'Play innocent',fx:{stress:5,smarts:2},line:`${N} feigned ignorance of why they looked so unsettled, and let them wonder what ${N} is.`},
            {label:'Acknowledge it',fx:{stress:6},flag:'shieldKnown',line:`${N} met their look with a small nod. Two strange people, recognizing each other across a crowded room.`}]},
]);

// ---- SPACE & REALITY ----
beat('flight',[
  {id:'firstcloud', emoji:'☁️', title:'Above the clouds, just you', min:16, max:50, body:`The first time ${N} breaks above the cloud layer — alone, silent, the world a soft floor below — is a thing words will fail at for the rest of ${N}'s life.`,
   choices:[{label:'Stay up there a while',fx:{happy:10,stress:-6},flag:'flewAboveClouds',line:`${N} hung in that impossible quiet until the cold drove them down, changed in a way ${N} could never fully say. It made the obituary.`}]},
  {id:'balloon', emoji:'🎈', title:'A child\'s balloon', min:18, max:60, body:`A kid lets go of a balloon. ${N} is close enough that catching it is nothing — the event is the look on the child's face when it comes back down to their hands.`,
   choices:[{label:'Return it, quietly',fx:{happy:6},flag:'goodHeart',line:`${N} fetched it back without fuss. The child's face — pure, uncomplicated wonder — was worth more than ${N} expected.`}]},
]);
beat('phasing',[
  {id:'panic', emoji:'👻', title:'You slipped through the floor', min:18, max:55, body:`A spike of panic, and ${N} sinks through the floor — one full second in the apartment below — before snapping back up, heart hammering.`,
   choices:[{label:'Pretend it didn\'t happen',fx:{stress:7},line:`${N} stood very still and decided the downstairs neighbor's startled face was a problem for never.`},
            {label:'Test it on purpose later',fx:{stress:5,smarts:3},flag:'phaseControl',line:`${N} went home and, carefully, did it again — on purpose this time. Fear into skill, the powered person's whole journey.`}]},
  {id:'crash', emoji:'💥', title:'Standing outside the wreck', min:18, max:60, body:`A car crash — except ${N} phased clean through the impact and is standing, untouched, beside the wreck. The other driver is staring at where ${N} should have been.`,
   choices:[{label:'"I jumped clear"',fx:{stress:6,smarts:2},line:`${N} sold a story about lightning reflexes. The driver wanted to believe it more than ${N} needed them to.`},
            {label:'Just check they\'re okay',fx:{happy:2,stress:5},flag:'phaseSeen',line:`${N} skipped the lie and went to help, leaving the driver with a memory that doesn't obey physics.`}]},
]);
beat('teleportation',[
  {id:'argument', emoji:'✨', title:'You blinked out', min:18, max:60, body:`Mid-argument at home, overwhelmed, ${N} simply *isn't there* anymore — somewhere else entirely. The walk back is its own event.`,
   choices:[{label:'Come straight back and own it',fx:{stress:6,happy:1},line:`${N} returned within the minute and faced the very confused, very hurt person ${N} had vanished on. Apologized. Meant it.`},
            {label:'Take the long way back to cool off',fx:{stress:4,smarts:2},flag:'teleportCool',line:`${N} took an hour, on foot, from wherever ${N} landed. By the time ${N} got home the heat was gone — but so was some trust.`}]},
  {id:'protect', emoji:'🛡', title:'You were there before you knew', min:18, max:60, body:`Someone ${N} loves is in danger across town — and ${N} is suddenly *there*, having teleported on pure protective instinct, before the decision finished forming.`,
   choices:[{label:'Get them clear',fx:{stress:8,fame:1},flag:'teleportSaved',line:`${N} pulled them out of it and only afterward thought: *how did I — when did I decide?* The body protects what it loves faster than thought.`}]},
]);
beat('gravity manipulation',[
  {id:'float', emoji:'🪐', title:'It floated', min:18, max:55, body:`In a moment of fierce concentration, something heavy near ${N} lifts off the ground and hangs there. ${N} didn't mean to. Someone might have seen.`,
   choices:[{label:'Set it down fast',fx:{stress:6},line:`${N} dropped it back with a clang and looked around. Nobody, ${N} hopes. Probably.`},
            {label:'Hold it, marvel a second',fx:{stress:5,smarts:2},flag:'gravityAware',line:`${N} let it hover one extra second, just to feel the impossible obey, then set it gently down. Power says hello.`}]},
  {id:'falling', emoji:'⬇️', title:'You didn\'t step aside', min:18, max:60, body:`Something heavy falls toward ${N}. Instead of moving, ${N} pushes — and it stops, mid-air, against nothing.`,
   choices:[{label:'Let it drop past you, vanish',fx:{stress:6},line:`${N} released it to crash harmlessly and stepped away before the witnesses finished blinking.`},
            {label:'Lower it safely',fx:{stress:7,fame:1},flag:'gravitySaved',line:`${N} guided it down soft as a feather. A couple of people will swear, forever, that they saw a thing stop falling.`}]},
]);
beat('probability manipulation',[
  {id:'smallwins', emoji:'🍀', title:'Everything goes slightly right', min:18, max:60, body:`Not lottery wins — smaller. Every day, something tips ${N}'s way. The green light. The last seat. The coin landing right. It's starting to feel like a pattern.`,
   choices:[{label:'Enjoy it, don\'t poke it',fx:{happy:5},line:`${N} stopped questioning the run of small mercies and just rode it, grateful and a little spooked.`},
            {label:'Test it deliberately',fx:{stress:5,smarts:3},flag:'probTest',line:`${N} tried to *aim* it, on purpose, at something that mattered — and it worked, mostly, in a way that raised the hairs on ${N}'s neck.`}]},
]);

// ---- ENERGY ----
beat('force fields',[
  {id:'shotat', emoji:'🔵', title:'The bullet stopped', min:18, max:60, body:`Someone shoots at ${N} — and the round stops, hanging, against a shimmer of nothing an inch from ${N}'s chest. The shooter runs.`,
   choices:[{label:'Stand there, stunned',fx:{stress:10},flag:'fieldSeen',line:`${N} watched the bullet drop and didn't move for a full minute. The reflex saved ${N}'s life and blew ${N}'s cover at once.`},
            {label:'Drop it before anyone looks',fx:{stress:7,smarts:2},line:`${N} killed the field and palmed the flattened round, leaving the scene a confusing, bloodless mystery.`}]},
  {id:'stranger', emoji:'🟦', title:'Around someone else', min:18, max:60, body:`A stranger's about to be hit — and ${N} throws the field around *them*, not ${N}. ${N} didn't know ${N} could do that. The ethics of it arrive slowly, afterward.`,
   choices:[{label:'Realize what this means',fx:{stress:6,smarts:3},flag:'fieldOthers',line:`${N} saved them and then sat with the new, enormous thought: *I can protect anyone, anywhere. So when don't I?*`}]},
]);
beat('energy blasts',[
  {id:'scorch', emoji:'💥', title:'A mark on the wall', min:18, max:55, body:`An argument peaks and a discharge slips out of ${N} — a scorch on the wall, smoke, a smell. ${N}'s partner saw it.`,
   choices:[{label:'Explain everything',fx:{stress:8,happy:2},flag:'blastTold',line:`${N} sat them down and told the truth, scorch mark and all. It was a long night. They stayed.`},
            {label:'"Electrical fault"',fx:{stress:6,smarts:2},line:`${N} blamed the wiring and called an electrician ${N} didn't need, papering over the truth with a receipt.`}]},
]);
beat('energy absorption',[
  {id:'surge', emoji:'🔋', title:'It has to go somewhere', min:18, max:60, body:`${N} absorbs something ${N} wasn't braced for — a surge, a strike — and now the excess is humming under ${N}'s skin with nowhere to go.`,
   choices:[{label:'Discharge it safely, alone',fx:{stress:6,smarts:2},line:`${N} found an empty place and let it out into the ground, hands shaking, before it found its own exit.`},
            {label:'Hold it, learn the ceiling',fx:{stress:10,health:-3},flag:'absorbLimit',line:`${N} held the overload to learn how much ${N} could take. ${N} found the edge. ${N} does not recommend finding the edge.`}]},
]);
beat('magnetism',[
  {id:'cluster', emoji:'🧲', title:'The keys slid toward you', min:16, max:55, body:`A hard, emotional day, and every small metal thing on the table drifts quietly toward ${N}. The salt shaker. The keys. A spoon, slowly.`,
   choices:[{label:'Still everything',fx:{stress:5,smarts:2},line:`${N} pulled the feeling — and the metal — back in, and the table went innocent again. Control, learned in public, on the fly.`},
            {label:'Disarm someone with it (later)',fx:{stress:6,athletic:1},flag:'magnetUsed',line:`Days later ${N} found a use for it: a metal threat tugged from a hand that didn't expect it. Frightening, how handy.`}]},
]);
beat('light manipulation',[
  {id:'partial', emoji:'🌟', title:'You half-vanished', min:18, max:55, body:`${N} bends the light wrong by accident and goes partly invisible in a crowded room. Someone walks straight through the space where ${N}'s edge should be.`,
   choices:[{label:'Snap back, look normal',fx:{stress:6},line:`${N} reassembled before anyone fully registered the gap, and laughed too loudly at nothing to cover it.`},
            {label:'Use it to slip out',fx:{stress:5,smarts:2},flag:'lightUsed',line:`${N} leaned into the blur and was simply, untraceably gone — the first time ${N} used the slip on purpose.`}]},
]);
beat('sonic scream',[
  {id:'window', emoji:'🔊', title:'The window cracked', min:18, max:55, body:`${N} raises their voice in an argument and a window spiderwebs across. The argument stops — but not the way arguments usually stop.`,
   choices:[{label:'Apologize, scared of yourself',fx:{stress:8,happy:-3},line:`${N} went quiet and small, frightened by the edge in ${N}'s own voice. They both were. Different fights, after that.`},
            {label:'Learn to keep it down',fx:{stress:5,smarts:3},flag:'sonicControl',line:`${N} took it as a warning and learned, deliberately, to hold the register below breaking. A muzzle of ${N}'s own design.`}]},
]);

// ---- TRANSFORMATION ----
beat('shapeshifting',[
  {id:'firsttime', emoji:'🔄', title:'You woke as someone else', min:18, max:55, body:`The first full shift — ${N} wakes wearing a stranger's face — and the slow part, the unsettling part, is changing *back*.`,
   choices:[{label:'Find your way home to yourself',fx:{stress:8,smarts:2},line:`${N} stared into a mirror and reached, by feel, for the original — and got there, eventually, shaken. The default is a place you can lose.`},
            {label:'Stay a while as someone new',fx:{stress:6,happy:1},flag:'shiftWandered',line:`${N} lived an afternoon as a stranger, free of being ${N}, and understood why this power is the dangerous one.`}]},
  {id:'identity', emoji:'🪞', title:'What do you look like, really?', min:25, max:65, body:`Someone who loves ${N} asks it gently: *what do you look like when you're not trying to look like anything at all?* ${N} realizes ${N} isn't sure anymore.`,
   choices:[{label:'Find the true face and show them',fx:{happy:4,stress:6},flag:'shiftTrueFace',line:`${N} let everything fall away down to the original, and showed them, and it was terrifying and it was love.`},
            {label:'Deflect — you don\'t know either',fx:{stress:8,happy:-3},flag:'shiftLost',line:`${N} couldn't answer, because ${N} had lost the thread of the default self somewhere back there. That's the real cost of every face fitting.`}]},
]);
beat('invisibility',[
  {id:'overheard', emoji:'🫥', title:'How they talk when you\'re gone', min:18, max:60, body:`${N} is invisible at a gathering and hears how people speak when they're certain ${N} isn't there.`,
   choices:[{label:'Reappear and say nothing',fx:{stress:7,smarts:2},flag:'invisHeard',line:`${N} faded back in across the room and carried what ${N} heard like a stone in a pocket. You can't return from invisible unchanged.`},
            {label:'Leave before you hear more',fx:{stress:5,happy:-2},line:`${N} slipped out the moment it turned, refusing the rest. Some knowledge isn't worth the price of having it.`}]},
  {id:'unconscious', emoji:'🌫', title:'You\'ve been vanishing without knowing', min:20, max:60, body:`${N} realizes ${N} has been invisible for stretches of the past week — without deciding to. Something is switching it on beneath ${N}'s awareness.`,
   choices:[{label:'Figure out the trigger',fx:{stress:8,smarts:3},flag:'invisTrigger',line:`${N} traced it back to a feeling — a wish not to be seen, firing the power on its own. The body grants the secret wishes. Unsettling, that.`},
            {label:'Try to ignore it',fx:{stress:10,happy:-3},line:`${N} pretended not to notice, which worked exactly as well as pretending ever does. The vanishing kept happening.`}]},
]);
beat('duplication',[
  {id:'different', emoji:'👥', title:'Your double chose differently', min:18, max:60, body:`${N}'s duplicate makes a call ${N} wouldn't have. It's the first time ${N} truly understands: the copy isn't fully ${N}.`,
   choices:[{label:'Reabsorb and sit with it',fx:{stress:8,smarts:3},flag:'dupeSeparate',line:`${N} took the duplicate back in, and the memory of it disagreeing — being its own slightly-other self — won't settle.`},
            {label:'Let the choice stand',fx:{stress:6,happy:1},line:`${N} decided the double's call was fair enough and let it ride. Trusting yourself is harder when there are two of you.`}]},
]);
beat('biological mimicry',[
  {id:'cantreverse', emoji:'🦅', title:'You can\'t change back yet', min:18, max:55, body:`${N} copies something small — a hawk's eyes, a hound's nose — and finds ${N} can't fully reverse it for a day. The world is suddenly, overwhelmingly *too much*.`,
   choices:[{label:'Ride it out, hidden',fx:{stress:8,smarts:2},line:`${N} holed up and waited for the borrowed sense to fade, drowning in detail no human is built to hold.`},
            {label:'Learn from the overload',fx:{stress:6,smarts:3},flag:'mimicLearned',line:`${N} spent the day mapping the edges of the new sense before it left. Knowledge, bought with a headache.`}]},
]);
beat('pheromone control',[
  {id:'passive', emoji:'🌸', title:'You\'ve been doing it for years', min:25, max:60, body:`${N} realizes the power has been running passively in social settings — for *years*. Every friendship, every romance, ${N} now has to look at sideways.`,
   choices:[{label:'Audit the relationships honestly',fx:{stress:12,happy:-5,smarts:3},flag:'pheroAudit',line:`${N} went back through every bond asking the terrible question: *was this real, or was this me?* Some answers ${N} will never get.`},
            {label:'Decide it doesn\'t change the love',fx:{stress:6,happy:2},line:`${N} chose to believe that what grew was still real, pheromones or not. Maybe a comfort. Maybe true. ${N} let it be both.`}]},
]);

// ---- UNIQUE / RARE ----
beat('telekinesis',[
  {id:'reach', emoji:'🌀', title:'It moved before your hand', min:16, max:55, body:`${N} reaches for something across the room and it slides toward ${N} before ${N}'s hand is anywhere near it.`,
   choices:[{label:'Cover it as a reach',fx:{stress:4,smarts:2},line:`${N} finished the reach as if ${N}'d meant to lean that far, and pocketed the object and the secret together.`},
            {label:'Practice it in private',fx:{stress:3,smarts:3},flag:'tkControl',line:`${N} went home and spent the night moving a pencil with ${N}'s mind, grinning like a kid. The good part of power.`}]},
  {id:'catchchild', emoji:'🧒', title:'You caught the falling child', min:18, max:60, body:`A child falls in a crowd — and stops, gently, a foot from the ground, held by nothing. Nobody's quite sure what they saw.`,
   choices:[{label:'Set them down and slip back',fx:{stress:6,happy:3},flag:'tkSaved',line:`${N} lowered the child into a confused parent's arms and melted into the crowd before the questions formed.`}]},
]);
beat('technopathy',[
  {id:'phone', emoji:'📱', title:'Your phone answered itself', min:16, max:55, body:`${N}'s phone lights up and starts relaying information to ${N} — unprompted, conversational, like it's been waiting to talk.`,
   choices:[{label:'Listen to what it tells you',fx:{stress:5,smarts:3},flag:'technoListen',line:`${N} let the machine speak in its not-quite-language, and learned things ${N} had no ordinary way to know.`},
            {label:'Shut it off, unnerved',fx:{stress:7},line:`${N} powered it down and sat in the silence. Some doors, once you know they open, are hard to walk back through.`}]},
  {id:'citynight', emoji:'🌃', title:'The city at night', min:18, max:60, body:`At night ${N} can hear it all — the grids, the servers, the traffic systems, the whole humming nervous system of the city — and it is beautiful and it is far, far too much.`,
   choices:[{label:'Learn to listen to one thing',fx:{stress:6,smarts:3},flag:'technoFilter',line:`${N} taught ${N}'s mind to pick a single thread from the roar. A survival skill, for whoever can hear machines dream.`},
            {label:'Let it overwhelm you once',fx:{stress:10,happy:-2},line:`${N} opened all the way up, just once, and nearly drowned in the city's electric chorus. Awe and terror, same sound.`}]},
]);
beat('time manipulation',[
  {id:'pause', emoji:'⏸', title:'Three borrowed seconds', min:18, max:60, body:`Mid-conversation, ${N} pauses time for three seconds and uses the silence to find the perfect response. To them, ${N} just paused a beat.`,
   choices:[{label:'Use it sparingly',fx:{smarts:2},flag:'timeRestraint',line:`${N} used the trick and then, uneasy, decided to save it for when it counts. Cheating time is still cheating.`},
            {label:'Lean on it more and more',fx:{stress:5,smarts:1},flag:'timeReliant',line:`${N} started reaching for the pause whenever a moment got hard. Smooth, always. And slowly, a little hollow.`}]},
  {id:'badday', emoji:'🔁', title:'The morning that wouldn\'t go right', min:18, max:60, body:`A day starts wrong, so ${N} rewinds the morning. Then again. Then a third time — before accepting that some days are just *going* to be this kind of day.`,
   choices:[{label:'Accept the day',fx:{happy:2,smarts:2},line:`${N} stopped fighting the morning and let it be bad, and there was an odd freedom in that surrender.`},
            {label:'Keep trying to fix it',fx:{stress:8,health:-2},flag:'timeLooped',line:`${N} ran it back too many times, and the repetition wore a groove in ${N}. Even power can't make every morning good.`}]},
]);
beat('dimensional pocket',[
  {id:'floating', emoji:'🎒', title:'It\'s floating in nowhere', min:18, max:55, body:`${N} loses something small and finds it drifting in a space that has no location — the pocket ${N} didn't fully know ${N} had.`,
   choices:[{label:'Explore the space',fx:{stress:5,smarts:3},flag:'pocketExplored',line:`${N} reached into the nowhere and felt around its impossible edges. Useful. Deeply strange. Both, forever.`},
            {label:'Just grab it and pull back',fx:{stress:3},line:`${N} snatched the keys back out and decided not to think too hard about where they'd been.`}]},
]);
beat('astral projection',[
  {id:'coma', emoji:'🌠', title:'They thought you were in a coma', min:18, max:60, body:`${N}'s body lies still while ${N} is elsewhere — and someone finds the body, unresponsive, and panics. ${N} has to get back, fast.`,
   choices:[{label:'Snap back instantly',fx:{stress:8},line:`${N} slammed back into ${N}'s body mid-panic and sat up too fast, inventing a story about deep sleep. Close one.`},
            {label:'Take the scare seriously',fx:{stress:6,smarts:3},flag:'astralCareful',line:`${N} returned shaken and made a rule: never project where someone might find the empty shell. A lesson with sharp edges.`}]},
  {id:'crisis', emoji:'🕯', title:'You could only witness', min:20, max:60, body:`${N} projects to be near someone ${N} loves in a moment of crisis — and can do nothing but watch, present and powerless at once. It matters more than ${N} expected.`,
   choices:[{label:'Stay with them, unseen',fx:{happy:3,stress:8},flag:'astralWitness',line:`${N} stayed through the worst of it, a silent witness they'd never know was there. Sometimes presence is the only gift available.`}]},
]);

// ---------- factory: turn beats into CHOICE_EVENTS ----------
function _mkPowerEvent(power, b){
  const fill = (s,p)=> (s||'').replace(/\$\{name\}/g, p.first);
  return {
    id: 'xp_'+power.replace(/[^a-z]/g,'')+'_'+b.id,
    emoji: b.emoji, title: b.title, once:true, track:'world', cat:'power_'+power.replace(/[^a-z]/g,''),
    weight: b.weight || 6,
    when: p => hasPower(p,power) && p.age>=(b.min||16) && p.age<=(b.max||70),
    body: p => fill(b.body, p),
    choices: b.choices.map(c=>({
      label: c.label, sub: c.sub,
      effect: p => {
        if(c.fx) fx(p, c.fx);
        if(c.flag) setFlag(p, c.flag, true);
        markCat(p, 'power_'+power.replace(/[^a-z]/g,''));
        return fill(c.line, p);
      }
    }))
  };
}

const EXP_POWER_EVENTS = [];
for(const power in PB){ for(const b of PB[power]){ EXP_POWER_EVENTS.push(_mkPowerEvent(power, b)); } }

CHOICE_EVENTS.push(...EXP_POWER_EVENTS);
