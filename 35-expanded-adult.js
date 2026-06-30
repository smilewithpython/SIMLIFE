"use strict";
/* Threadbare · content module: 35-expanded-adult.js — PART 6: ADULT RANDOM EVENTS
   ============================================================
   Texture for adult life — small, strange, human moments that don't announce
   their own meaning. Mostly track:'life' (a few 'world'). Each carries a cat:
   so the cooldown spaces them out. Many leave a flag that an obituary/recap or
   later event could read, but none REQUIRE a payoff to be worth firing.
   ============================================================ */

const EXP_ADULT_EVENTS = [

  { id:'xa_elevator', emoji:'🛗', title:'Stuck in an Elevator', once:true, track:'life', cat:'adult_chance', weight:4,
    when:p=>p.age>=18 && p.age<=80,
    body:p=>`The elevator stops between floors with a stranger in it. The lights hold. There's nothing to do but wait — and, eventually, talk.`,
    choices:[
      {label:'Open up to them', sub:'say the true thing', effect:p=>{ if(chance(55)){ const f=addFriend(p); fx(p,{happy:8,stress:-4}); markCat(p,'adult_chance'); return `${p.first} and ${f.name.split(' ')[0]} said things to each other in that stalled hour that they'd never said to people they'd known for years. When the doors opened, they swapped numbers. Strangers make the best confessors.`; } fx(p,{happy:4,stress:-2}); markCat(p,'adult_chance'); return `${p.first} talked more honestly than usual, to someone ${p.first} would never see again. When the doors opened they nodded and went separate ways, a little lighter for it.`; }},
      {label:'Keep it light', sub:'small talk and patience', effect:p=>{ fx(p,{happy:3}); markCat(p,'adult_chance'); return `${p.first} kept it easy — weather, the absurdity of being stuck, a shared laugh when the lights flickered. A pleasant nothing. Sometimes that's the whole gift.`; }},
      {label:'Sit in silence', sub:'two strangers, no pressure', effect:p=>{ fx(p,{stress:2}); markCat(p,'adult_chance'); return `${p.first} and the stranger waited it out without a word, which was its own kind of fine. Not every shared moment needs filling.`; }},
    ]},

  { id:'xa_mistaken_famous', emoji:'😎', title:'Mistaken for Someone Famous', once:true, track:'life', cat:'adult_chance', weight:4,
    when:p=>p.age>=16 && p.age<=75,
    body:p=>`Someone is absolutely certain ${p.first} is somebody — they've got the wide eyes, the phone half-raised, the "oh my god, it's YOU." It is not, in fact, ${p.first}. But they're so sure.`,
    choices:[
      {label:'Play along, just briefly', sub:'give them the moment', effect:p=>{ fx(p,{happy:6}); markCat(p,'adult_chance'); return `${p.first} signed the napkin with a flourish and a name that wasn't ${p.first}'s, posed for the photo, and made somebody's whole week. Harmless theater. ${p.first} grinned about it for days.`; }},
      {label:'Gently correct them', sub:'honest, a little awkward', effect:p=>{ fx(p,{happy:2}); markCat(p,'adult_chance'); return `${p.first} let them down easy. The disappointment on their face was almost funny, almost sad. They apologized too much. ${p.first} told them it was a compliment.`; }},
      {label:'Ask who they think you are', sub:'curiosity', effect:p=>{ if(chance(20)){ setFlag(p,'mistakenForKin'); fx(p,{happy:2,stress:4}); markCat(p,'adult_chance'); return `${p.first} asked — and the name they gave landed strangely, like something half-remembered from ${p.first}'s own family stories. ${p.first} let it go. Mostly.`; } fx(p,{happy:3}); markCat(p,'adult_chance'); return `${p.first} asked who, and the answer meant nothing to ${p.first} at all. They were stunned ${p.first} didn't know. The world is full of fames that don't reach everyone.`; }},
    ]},

  { id:'xa_wrong_number', emoji:'📞', title:"The Wrong Number That Wasn't", once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=18,
    body:p=>`A call comes through clearly meant for someone else — but the voice on the other end keeps talking, and what they're saying is starting to matter.`,
    choices:[
      {label:'Hear them out', sub:'let it unfold', effect:p=>{ if(chance(50)){ fx(p,{happy:4,smarts:2}); markCat(p,'adult_chance'); return `${p.first} stayed on the line and a stranger's misdirected confession turned into the most interesting conversation of ${p.first}'s month. They never did sort out who'd been meant to answer.`; } fx(p,{stress:3}); markCat(p,'adult_chance'); return `${p.first} listened to something ${p.first} probably shouldn't have, then gently said they had the wrong number. The thing ${p.first} overheard stays, uninvited.`; }},
      {label:'Tell them right away', sub:'do the clean thing', effect:p=>{ fx(p,{happy:1}); markCat(p,'adult_chance'); return `${p.first} cut in kindly — wrong number — and they laughed, embarrassed, and hung up. A tiny crossed wire in a world full of them.`; }},
    ]},

  { id:'xa_package', emoji:'📦', title:"The Package That Isn't Yours", once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=18,
    body:p=>`A package arrives with ${p.first}'s address and someone else's name. It's heavier than it looks, and there's no return label.`,
    choices:[
      {label:'Track down the real recipient', sub:'the right thing', effect:p=>{ fx(p,{happy:4,smarts:2}); setFlag(p,'goodHeart'); markCat(p,'adult_chance'); return `${p.first} did the detective work and got it to the person it was meant for. They were touched ${p.first} bothered. ${p.first} never even looked inside, which felt like the point.`; }},
      {label:'Open it', sub:'curiosity wins', effect:p=>{ if(chance(50)){ fx(p,{happy:5}); markCat(p,'adult_chance'); return `${p.first} opened it. Inside was something charming and harmless and not ${p.first}'s — a stranger's small joy, glimpsed by accident. ${p.first} re-wrapped it and sent it on, oddly moved.`; } fx(p,{stress:6,happy:-2}); markCat(p,'adult_chance'); return `${p.first} opened it and immediately wished ${p.first} hadn't. Some things aren't ${p.first}'s to see. ${p.first} sealed it back up and got it gone.`; }},
      {label:'Return to sender', sub:'not my business', effect:p=>{ fx(p,{happy:1}); markCat(p,'adult_chance'); return `${p.first} scrawled "not at this address" and put it back in the mail stream. Whatever it was, it wasn't ${p.first}'s story.`; }},
    ]},

  { id:'xa_gameshow', emoji:'📺', title:"You're on a Game Show", once:true, track:'world', cat:'adult_chance', weight:3,
    when:p=>p.age>=18 && p.age<=75,
    body:p=>`Through some chain of events ${p.first} only half understands, ${p.first} is now under bright studio lights with a buzzer and a live audience, ${p.first}'s actual life reduced to a cheerful three-minute format.`,
    choices:[
      {label:'Go for it — play to win', sub:'all in', effect:p=>{ if(chance(45)){ const won=5000+rnd(45000); fx(p,{money:won,happy:10,fame:5}); markCat(p,'adult_chance'); return `${p.first} buzzed in fast, gambled big, and walked off with ${money(won)} and a clip ${p.first}'s family will replay at holidays forever. Absurd. Wonderful.`; } fx(p,{happy:4,fame:3}); markCat(p,'adult_chance'); return `${p.first} flamed out spectacularly in the final round, on camera, for a studio audience's delighted groan. No money. A great story. ${p.first} took the parting gift and a bow.`; }},
      {label:'Play it safe', sub:'take the sure thing', effect:p=>{ const won=1000+rnd(4000); fx(p,{money:won,happy:5}); markCat(p,'adult_chance'); return `${p.first} banked the modest sure thing and waved off the risky double-or-nothing. The host called ${p.first} sensible. ${p.first} took ${money(won)} and zero regrets.`; }},
      {label:'Ham it up for the crowd', sub:'the experience over the prize', effect:p=>{ fx(p,{happy:8,fame:4}); markCat(p,'adult_chance'); return `${p.first} forgot about winning and just performed — bantered with the host, played the crowd, had the time of ${p.first}'s life. ${p.first} lost the game and won the room.`; }},
    ]},

  { id:'xa_wildlife', emoji:'🦌', title:'A Wildlife Encounter', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=12,
    body:p=>`${p.first} comes face to face with something wild — close, unbothered, looking right back. Not dangerous. Just utterly, briefly, present.`,
    choices:[
      {label:'Stay perfectly still', sub:'let the moment be', effect:p=>{ fx(p,{happy:8,stress:-6}); markCat(p,'adult_chance'); return `${p.first} held still and so did it, the two of them caught in a long, wordless second that felt almost like an exchange. Then it was gone. ${p.first} thought about it for weeks.`; }},
      {label:'Grab your phone', sub:'capture it', effect:p=>{ if(chance(50)){ fx(p,{happy:4,fame:2}); markCat(p,'adult_chance'); return `${p.first} got the shot — improbable, beautiful, the kind people don't believe is real. It made the rounds. ${p.first} keeps it as the wallpaper.`; } fx(p,{happy:1}); markCat(p,'adult_chance'); return `${p.first} fumbled for the camera and of course it bolted. ${p.first} got a blur and a lesson about being where you are instead of filming it.`; }},
    ]},

  { id:'xa_note_in_book', emoji:'📖', title:'A Note in an Old Book', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=16,
    body:p=>`Tucked in the margins of a used book — a library discard, a thrift-shop find — is a note in a stranger's hand. And somehow, impossibly, it reads like it was meant for ${p.first} specifically.`,
    choices:[
      {label:'Keep it', sub:'a small private talisman', effect:p=>{ fx(p,{happy:6,smarts:2}); setFlag(p,'keptTheNote'); markCat(p,'adult_chance'); return `${p.first} kept the note pressed in a drawer like a pressed flower. ${p.first} doesn't fully know why it lands the way it does. ${p.first} just knows it does.`; }},
      {label:'Try to find who wrote it', sub:'chase the thread', effect:p=>{ if(chance(35)){ const f=addFriend(p); fx(p,{happy:8,smarts:3}); markCat(p,'adult_chance'); return `${p.first} actually tracked them down — ${f.name.split(' ')[0]}, years older now, stunned that the note had traveled so far to land so well. An unlikely friendship out of a margin.`; } fx(p,{happy:3,smarts:2}); markCat(p,'adult_chance'); return `${p.first} followed it as far as it went, which wasn't all the way. The writer stays a mystery. The note keeps meaning what it means regardless.`; }},
      {label:'Leave it for the next reader', sub:'pass it on', effect:p=>{ fx(p,{happy:5}); setFlag(p,'goodHeart'); markCat(p,'adult_chance'); return `${p.first} read it, let it land, and tucked it back exactly where ${p.first} found it — a message in a bottle, re-corked for whoever opens the book next.`; }},
    ]},

  { id:'xa_roadrage', emoji:'🚗', title:'Road Rage', once:true, track:'life', cat:'adult_conflict', weight:4,
    when:p=>p.age>=18 && p.age<=75,
    body:p=>`A cut-off, a horn, a gesture — and suddenly ${p.first}'s heart is pounding and another driver is matching ${p.first}'s anger, mile for furious mile. This can escalate or end, and that's up to ${p.first}.`,
    choices:[
      {label:'Breathe and let it go', sub:'de-escalate', effect:p=>{ fx(p,{stress:-4,smarts:2}); setFlag(p,'keepsCool'); markCat(p,'adult_conflict'); return `${p.first} eased off, let them roar ahead, and felt the adrenaline drain into something almost like pity. Whatever's eating that person, it isn't ${p.first}'s to fix at 60 miles an hour.`; }},
      {label:'Engage — don\'t back down', sub:'meet fire with fire', effect:p=>{ if(chance(35)){ fx(p,{stress:14,health:-6}); p.record.push('Road rage incident'); markCat(p,'adult_conflict'); return `${p.first} escalated and it got ugly — a stopped-car confrontation, shouting, a near-thing that could've been so much worse. ${p.first} drove home shaking, wondering who that was behind ${p.first}'s own wheel.`; } fx(p,{stress:8,happy:-2}); markCat(p,'adult_conflict'); return `${p.first} gave as good as ${p.first} got until they peeled off at an exit. ${p.first} won nothing, lost an hour to the jitters, and knew it.`; }},
    ]},

  { id:'xa_audit', emoji:'🧾', title:'The Audit', once:true, track:'life', cat:'adult_conflict', weight:4,
    when:p=>p.age>=25 && (p.money>30000 || p.job!=='none'),
    body:p=>`${p.first} has been flagged. The process is entirely legal and entirely nerve-wracking, and what it turns up depends on exactly how ${p.first} has been living.`,
    choices:[
      {label:'Cooperate fully', sub:'open the books', effect:p=>{ const clean = !hasFlag(p,'orderedHit') && !hasFlag(p,'threwIt') && (p.record||[]).length<3; if(clean){ fx(p,{stress:6,happy:2}); markCat(p,'adult_conflict'); return `${p.first} handed over everything and the everything was fine. A stressful few weeks that resolved into a clean letter and a strange, vindicated calm.`; } fx(p,{money:-(5000+rnd(30000)),stress:16}); markCat(p,'adult_conflict'); return `${p.first} opened the books and the books had stories in them. Penalties, back-payments, a long uncomfortable conversation. ${p.first}'s past caught up at the worst possible desk.`; }},
      {label:'Lawyer up and fight it', sub:'control the process', effect:p=>{ fx(p,{money:-8000,stress:10}); markCat(p,'adult_conflict'); return `${p.first} brought in someone sharp and made the auditors earn every inch. Expensive, but ${p.first} controlled what they saw and how. ${p.first} slept better paying for the buffer.`; }},
    ]},

  { id:'xa_viral', emoji:'📱', title:'Something Goes Viral About You', once:true, track:'world', cat:'adult_conflict', weight:4,
    when:p=>p.age>=15 && p.age<=75,
    body:p=>`Without ${p.first}'s knowledge or consent, a piece of ${p.first} — a clip, a photo, a quote, half a story — is suddenly everywhere. The thing itself is almost random. How ${p.first} responds is the event.`,
    choices:[
      {label:'Lean into it', sub:'ride the wave', effect:p=>{ if(chance(50)){ fx(p,{fame:10,happy:6,money:2000+rnd(8000)}); setFlag(p,'rodeTheWave'); markCat(p,'adult_conflict'); return `${p.first} grabbed the moment and steered it — a follow-up, a joke, a brand deal nobody saw coming. Fifteen minutes ${p.first} actually monetized. Surreal and a little thrilling.`; } fx(p,{fame:4,stress:8}); markCat(p,'adult_conflict'); return `${p.first} tried to ride it and the wave had its own ideas. The attention curdled as fast as it came. ${p.first} learned that virality steers you more than you steer it.`; }},
      {label:'Wait for it to pass', sub:'go quiet', effect:p=>{ fx(p,{stress:6}); markCat(p,'adult_conflict'); return `${p.first} went dark and let the internet's attention move on, which it did, with the speed of a thing that was never really about ${p.first} at all. By month's end, gone. ${p.first} exhaled.`; }},
      {label:'Set the record straight', sub:'correct the story', effect:p=>{ if(chance(55)){ fx(p,{happy:4,fame:2,stress:6}); markCat(p,'adult_conflict'); return `${p.first} put out the real version, calm and clear, and enough people heard it that the distortion lost its legs. A rare win against a rumor.`; } fx(p,{stress:10,happy:-2}); markCat(p,'adult_conflict'); return `${p.first} tried to correct it and the correction became its own story, smaller and stupider. ${p.first} stepped away before it could eat another week.`; }},
    ]},

  { id:'xa_storm', emoji:'⛈', title:'A Storm Traps You', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=16,
    body:p=>`A storm closes the roads and the doors, and ${p.first} is stuck for a day or two with whoever happens to be there — and that enforced closeness changes things, the way it always does.`,
    choices:[
      {label:'Use the time to connect', sub:'no screens, no exits', effect:p=>{ const r=(p.rels||[]).find(x=>x.alive&&/Spouse|Partner|Child|Friend|Mother|Father|Sibling|Brother|Sister/.test(x.kind)); if(r)r.bond=clamp(r.bond+12); fx(p,{happy:8,stress:-4}); markCat(p,'adult_chance'); return `${p.first} and ${r?r.name.split(' ')[0]:'the others'} talked by candlelight, played cards, said overdue things. When the roads cleared, something between them had quietly mended. Storms do that, if you let them.`; }},
      {label:'Endure it restlessly', sub:'just wait it out', effect:p=>{ fx(p,{stress:6}); markCat(p,'adult_chance'); return `${p.first} paced and checked the windows and counted the hours until it broke. Some forced closeness is just claustrophobia with weather. ${p.first} was glad when it ended.`; }},
    ]},

  { id:'xa_win_small', emoji:'🎟', title:'You Win Something Small', once:true, track:'life', cat:'adult_chance', weight:4,
    when:p=>p.age>=12,
    body:p=>`A raffle, a radio call-in, a meat tray at the local pub — ${p.first} wins something modest and gloriously pointless, and the joy of it is wildly out of proportion to the prize.`,
    choices:[
      {label:'Celebrate it fully', sub:'pure, silly joy', effect:p=>{ fx(p,{happy:12,money:50+rnd(200)}); markCat(p,'adult_chance'); return `${p.first} whooped like ${p.first}'d won the lottery, told everyone, rode the high for a week. The prize was nothing. The winning was everything. ${p.first} needed this more than ${p.first} knew.`; }},
      {label:'Give the prize away', sub:'pass the joy on', effect:p=>{ fx(p,{happy:9}); setFlag(p,'goodHeart'); markCat(p,'adult_chance'); return `${p.first} handed the prize to a kid whose face lit up brighter than any prize warranted. Turns out ${p.first} kept the best part — the watching.`; }},
    ]},

  { id:'xa_in_a_book', emoji:'📚', title:"You're Mentioned in Someone's Book", once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=30,
    body:p=>`${p.first} is reading — or someone points it out — and there ${p.first} is, in someone else's published book. Not the main character. But present, named, remembered. And what it says is either accurate, flattering, or interestingly wrong.`,
    choices:[
      {label:'Reach out to the author', sub:'close the loop', effect:p=>{ if(chance(55)){ const f=addFriend(p); fx(p,{happy:8,fame:2}); markCat(p,'adult_chance'); return `${p.first} wrote to them, and it reopened a door ${p.first} thought had closed for good — ${f.name.split(' ')[0]}, decades on, delighted to hear from the person they'd written about. Some bridges aren't burned, just waiting.`; } fx(p,{happy:4,smarts:2}); markCat(p,'adult_chance'); return `${p.first} reached out and got a warm, brief reply. The version of ${p.first} in their pages wasn't quite ${p.first} — but it was how ${p.first} was held in someone's memory, and that was its own strange gift.`; }},
      {label:'Just sit with it', sub:'see yourself through their eyes', effect:p=>{ fx(p,{happy:4,smarts:3}); markCat(p,'adult_chance'); return `${p.first} read the passage twice, three times. To be a paragraph in someone else's story — flattering, or wrong, or both — is to learn ${p.first} existed for people in ways ${p.first} never got to see. ${p.first} closed the book gently.`; }},
    ]},

  { id:'xa_protest', emoji:'📢', title:'Protest Outside Your Workplace', once:true, track:'life', cat:'adult_conflict', weight:4,
    when:p=>p.job!=='none' && p.age>=20,
    body:p=>`There's a crowd outside ${p.first}'s work, signs up, voices raised over an issue tangled right into what ${p.first} does for a living. ${p.first}'s response says something about ${p.first}.`,
    choices:[
      {label:'Go out and talk to them', sub:'engage honestly', effect:p=>{ fx(p,{smarts:3,happy:4,stress:6}); setFlag(p,'engagedProtest'); markCat(p,'adult_conflict'); return `${p.first} walked out and actually listened — no script, no security, just questions and a willingness to hear the answers. It changed nothing structural and everything personal. They saw a human. So did ${p.first}.`; }},
      {label:'Quietly agree with them', sub:'maybe they\'re right', effect:p=>{ fx(p,{happy:2,stress:8}); setFlag(p,'doubtsTheJob'); markCat(p,'adult_conflict'); return `${p.first} stood at the window and realized, uncomfortably, that the people outside had a point ${p.first} had been not-thinking-about for a while. The sign ${p.first} couldn't unread.`; }},
      {label:'Ignore it and work', sub:'not your circus', effect:p=>{ fx(p,{stress:4}); markCat(p,'adult_conflict'); return `${p.first} put ${p.first}'s head down and got through the day. The protest was there when ${p.first} arrived and gone when ${p.first} left. ${p.first} tells ${p.first}'s self that's just how it goes.`; }},
    ]},

  { id:'xa_old_photo', emoji:'🖼', title:'An Old Photograph', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=35,
    body:p=>`Someone pulls out a photo of ${p.first} from long ago — young, unguarded, mid-laugh at something ${p.first} can't even remember. ${p.first} was so different then. The conversation that follows goes somewhere ${p.first} didn't expect.`,
    choices:[
      {label:'Marvel at who you were', sub:'tenderness toward the kid', effect:p=>{ fx(p,{happy:6,stress:-2}); setFlag(p,'metPastSelf'); markCat(p,'adult_chance'); return `${p.first} looked at that younger face with a gentleness ${p.first} rarely turns on ${p.first}'s self. They didn't know what was coming, that kid. ${p.first} wanted to tell them it would mostly be okay.`; }},
      {label:'Feel the weight of the years', sub:'a quiet ache', effect:p=>{ fx(p,{happy:-2,smarts:3,stress:4}); markCat(p,'adult_chance'); return `${p.first} felt the whole distance between then and now land at once — everything gained, everything spent. Not sad exactly. Just heavy with how much living fits between two photographs.`; }},
      {label:'Ask to keep it', sub:'reclaim a piece', effect:p=>{ fx(p,{happy:5}); markCat(p,'adult_chance'); return `${p.first} asked for the photo and got it, and put it somewhere ${p.first} would see it. A small reunion with a self ${p.first} had half-forgotten ${p.first} used to be.`; }},
    ]},

  { id:'xa_plane', emoji:'✈️', title:'The Person on the Plane', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=18 && (p.money>5000),
    body:p=>`A long flight, and the person in the next seat turns out to be interesting — or irritating, or quietly transformative. Hours of forced proximity with someone ${p.first} will, in all likelihood, never see again.`,
    choices:[
      {label:'Really talk to them', sub:'the honesty of strangers', effect:p=>{ if(chance(55)){ fx(p,{happy:8,smarts:3}); setFlag(p,'planeConversation'); markCat(p,'adult_chance'); return `${p.first} and a stranger talked across an ocean of cloud about things ${p.first} doesn't say to people who'll still be in ${p.first}'s life tomorrow. They landed, wished each other well, and vanished — but the conversation stayed.`; } fx(p,{happy:4,smarts:2}); markCat(p,'adult_chance'); return `${p.first} struck up a conversation that wandered somewhere unexpectedly real before tapering into comfortable silence. A stranger ${p.first} learned from and let go of in the same afternoon.`; }},
      {label:'Keep to yourself', sub:'headphones in', effect:p=>{ fx(p,{stress:-2}); markCat(p,'adult_chance'); return `${p.first} put the headphones in and kept the world at one seat's distance. Restful. ${p.first} wonders, idly, somewhere over the next ocean, who that was.`; }},
    ]},

  { id:'xa_food_poisoning', emoji:'🤢', title:'Food Poisoning', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=14,
    body:p=>`Something ${p.first} ate has declared war. There is no dignity to be found here, only time and proximity to a bathroom. The indignity is total and deeply mundane.`,
    choices:[
      {label:'Suffer through it alone', sub:'just endure', effect:p=>{ fx(p,{health:-6,happy:-4,stress:4}); markCat(p,'adult_chance'); return `${p.first} rode it out on the bathroom floor making promises to a God ${p.first} doesn't pray to. It passed, as it does, leaving ${p.first} weak, grateful, and permanently suspicious of that one restaurant.`; }},
      {label:'Let someone take care of you', sub:'accept help', effect:p=>{ const r=(p.rels||[]).find(x=>x.alive&&/Spouse|Partner|Mother|Father|Child|Friend/.test(x.kind)); if(r)r.bond=clamp(r.bond+8); fx(p,{health:-5,happy:2}); markCat(p,'adult_chance'); return `${p.first} let ${r?r.name.split(' ')[0]:'someone'} bring the ginger ale and the cool cloth and the gentle teasing. Being sick is awful. Being cared for while sick is, weirdly, one of love's plainer proofs.`; }},
    ]},

  { id:'xa_witness', emoji:'👀', title:"You're a Witness", once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=16,
    body:p=>`Not to a crime — to something human and unguarded between other people. A proposal, a reconciliation, a small grace, an argument laid bare. ${p.first} happened to be there for a moment that wasn't ${p.first}'s, and it lands anyway.`,
    choices:[
      {label:'Witness it fully', sub:'be present for it', effect:p=>{ fx(p,{happy:6,smarts:2,stress:-2}); markCat(p,'adult_chance'); return `${p.first} let ${p.first}'s self be quietly moved by a moment ${p.first} had no part in. To witness others' lives — to be the stranger who saw and was glad — is its own small, underrated role. ${p.first} carried it home.`; }},
      {label:'Look away, give them privacy', sub:'let it be theirs', effect:p=>{ fx(p,{happy:3}); setFlag(p,'goodHeart'); markCat(p,'adult_chance'); return `${p.first} turned away and let the moment belong only to the people living it. Some things are made smaller by being watched. ${p.first} gave them the gift of going unseen.`; }},
    ]},

  { id:'xa_renovation_find', emoji:'🔨', title:'You Find Something While Renovating', once:true, track:'life', cat:'adult_chance', weight:3,
    when:p=>p.age>=25 && (p.money>20000),
    body:p=>`Behind a wall, under a floorboard, buried in the garden — ${p.first} uncovers something left by someone who lived here before. It has a weight to it that isn't only physical.`,
    choices:[
      {label:'Find out whose it was', sub:'honor the history', effect:p=>{ if(chance(45)){ fx(p,{happy:8,smarts:3}); setFlag(p,'returnedTheFind'); markCat(p,'adult_chance'); return `${p.first} traced it back to a family that had grieved its loss for years, and returned it. Their gratitude was the kind that doesn't fit in words. ${p.first} gave up a curiosity and gained something better.`; } fx(p,{happy:4,smarts:2}); markCat(p,'adult_chance'); return `${p.first} tried to find the owner and the trail went cold in the way old trails do. ${p.first} kept it respectfully, a custodian of a stranger's past.`; }},
      {label:'Keep it', sub:'finders keepers', effect:p=>{ if(chance(30)){ const v=2000+rnd(40000); fx(p,{money:v,happy:6}); markCat(p,'adult_chance'); return `${p.first} kept it — and it turned out to be worth real money, ${money(v)} worth. A windfall from inside ${p.first}'s own walls. ${p.first} doesn't think too hard about whose luck it used to be.`; } fx(p,{happy:4}); setFlag(p,'keptTheFind'); markCat(p,'adult_chance'); return `${p.first} kept it on a shelf where ${p.first} can see it — worth little in money, strangely heavy in meaning. A small mystery ${p.first} now owns.`; }},
      {label:'Leave it where it was', sub:'let it rest', effect:p=>{ fx(p,{happy:3,stress:-2}); markCat(p,'adult_chance'); return `${p.first} put it back exactly where it had waited and sealed the wall over it again. Some things are happier left where they were laid. ${p.first} liked knowing it was still there.`; }},
    ]},

];

CHOICE_EVENTS.push(...EXP_ADULT_EVENTS);
