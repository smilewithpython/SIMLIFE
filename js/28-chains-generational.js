"use strict";
/* Threadbare · content module: 28-chains-generational.js — PART 6: GENERATIONAL ECHOES
   Loads after the base bank + chain modules; pushes onto CHOICE_EVENTS.
   These fire when an ancestor's choices are still visible in the world. Each one
   reads the real forebear from the Tree (G.people) and names them — no generic
   "[ancestor]". They reward players who've built a deep, eventful bloodline.
   Tagged track:'arc'. Rare by construction: eligible only when a qualifying
   ancestor actually exists.
   ============================================================ */

// ---- lineage helpers ----
function lineAncestors(p){ return (G.people||[]).filter(a=>a && a.gen < p.gen); }
function ancBest(p, pred){
  const m = lineAncestors(p).filter(a=>{ try{ return pred(a); }catch(e){ return false; } });
  if(!m.length) return null;
  // deterministic pick so when()/body()/effect() all agree on the same ancestor
  m.sort((a,b)=>(((b.stats&&b.stats.fame)||0)-((a.stats&&a.stats.fame)||0)) || (a.id-b.id));
  return m[0];
}
function ancName(a){ return a? (a.first+' '+a.last) : 'your ancestor'; }
function ancFirst(a){ return a? a.first : 'they'; }
function ancRec(a, re){ return !!(a && a.record && a.record.some(r=>re.test(r))); }
function ancFamous(a){ return !!(a && ((a.stats && a.stats.fame>38) || ['politician','superhero','popstar','moviestar','musician','actor','director','mogul'].includes(a.job) || a.job==='crimelord')); }
// how an ancestor is remembered, as a short phrase
function ancLegacy(a){
  if(!a) return 'someone who mattered';
  if(a.job==='superhero') return 'a hero who saved lives';
  if(a.job==='crimelord' || ancRec(a,/crime|violen|racketeer|gang|murder/i)) return 'a criminal who left a mark on this place';
  if(a.job==='lawyer' && a.jobTitle==='Judge') return 'a judge who made a ruling people still cite';
  if(a.job==='politician') return (a.jobTitle==='President'?'a president':'a leader') + ' who shaped how things are done here';
  if(['popstar','moviestar','musician','actor','director','mogul'].includes(a.job)) return 'a star this place still claims as its own';
  return 'someone this place has not forgotten';
}

const CHAIN_EVENTS_P6 = [

  // ---------- The Name ----------
  { id:'ge_the_name', emoji:'📛', title:'The Name', once:true, track:'arc', weight:5,
    when:p=>p.age>=18 && !!ancBest(p, ancFamous),
    body:p=>{ const a=ancBest(p,ancFamous); return `Someone catches ${p.first}'s surname and stops short. "${a.last}? You're not related to ${ancName(a)}, are you?" They knew the name long before they met ${p.first} — ${ancFirst(a)} was ${ancLegacy(a)}.`; },
    choices:[
      {label:'Claim it proudly', sub:'lean into the legacy', effect:p=>{ const a=ancBest(p,ancFamous); const good=!(a.job==='crimelord'||ancRec(a,/crime|violen/i)); fx(p, good?{fame:6,happy:4}:{fame:3,happy:-2}); return good? `${p.first} owned the connection, and a door opened that ${p.first} hadn't knocked on. ${ancFirst(a)}'s good name still carries weight here.` : `${p.first} claimed it anyway — the notoriety opens some doors and slams others. ${ancFirst(a)}'s shadow is long, and not always kind.`; }},
      {label:'Distance yourself from it', sub:'be your own person', effect:p=>{ fx(p,{happy:2,stress:4}); return `${p.first} waved it off — "distant relative, never met them." Better, sometimes, to be no one's descendant and only your own self. But the name follows ${p.first} out the door regardless.`; }},
    ]},

  // ---------- The Ancestor's Enemy ----------
  { id:'ge_enemy', emoji:'🗡', title:"The Ancestor's Enemy", once:true, track:'arc', weight:5,
    when:p=>p.age>=20 && !!ancBest(p, a=>a.job==='crimelord' || a.job==='villain' || ancRec(a,/crime|violen|racketeer|gang|assault/i)),
    body:p=>{ const a=ancBest(p, x=>x.job==='crimelord'||x.job==='villain'||ancRec(x,/crime|violen|racketeer|gang|assault/i)); return `A stranger finds ${p.first} — older, hard-eyed, carrying something that has waited two generations. "Your blood, ${ancName(a)}, took something from my family. You're what's left of them." The debt isn't ${p.first}'s. The face in front of ${p.first} doesn't care.`; },
    choices:[
      {label:'Claim the debt and answer for it', sub:'shoulder the past', effect:p=>{ fx(p,{money:-(10000+rnd(50000)),happy:4,stress:8}); return `${p.first} took responsibility for a wrong they never committed — paid something, said something, closed a wound that wasn't theirs to open. The stranger left lighter. So, strangely, did ${p.first}.`; }},
      {label:'Deny the connection', sub:'refuse the inheritance of it', effect:p=>{ if(chance(55)){ fx(p,{stress:6}); return `${p.first} denied it flatly and the stranger, after a long look, walked away. Some debts die for lack of anyone willing to claim them.`;} fx(p,{stress:14,happy:-6}); return `${p.first} denied it — and the stranger took the denial as proof. This isn't over. The past has a long memory and a longer reach.`; }},
      {label:'Try to resolve it', sub:'make a real peace', effect:p=>{ if(chance(60)){ fx(p,{happy:8,stress:-2}); return `${p.first} sat with them, heard the whole old story, and found a way to lay it down together. Two bloodlines stopped bleeding into each other in a single afternoon.`;} fx(p,{stress:10}); return `${p.first} tried to make peace and found the wound too deep for one conversation. It eased, but it didn't close.`; }},
      {label:'Ignore it', sub:'walk away', effect:p=>{ if(chance(50)){ fx(p,{stress:6}); return `${p.first} turned and left it in the street. It dissipated, the way old grudges sometimes do when no one feeds them.`;} fx(p,{stress:12,happy:-4}); return `${p.first} ignored it, and it festered. Ancestral grudges don't always wait politely to be addressed.`; }},
    ]},

  // ---------- The Archive ----------
  { id:'ge_archive', emoji:'🎞', title:'The Archive', once:true, track:'arc', weight:5,
    when:p=>p.age>=24 && !!ancBest(p, a=>ancFamous(a) && (a.job!=='none')),
    body:p=>{ const a=ancBest(p, x=>ancFamous(x)&&x.job!=='none'); return `A documentary filmmaker reaches out: they're making something about ${ancName(a)}, ${ancLegacy(a)}, and they'd like ${p.first}'s cooperation. The family knows where the bodies are — and the filmmaker suspects ${p.first} does too.`; },
    choices:[
      {label:'Cooperate fully', sub:'let the truth out', effect:p=>{ const a=ancBest(p, x=>ancFamous(x)&&x.job!=='none'); const dirty=a.job==='crimelord'||ancRec(a,/crime|violen|misconduct|cover|fraud/i); if(dirty){ fx(p,{fame:6,happy:-4}); return `${p.first} opened up, and the film found what was buried — ${ancFirst(a)} was more complicated than the legend. The truth stung, but it was the truth, and ${p.first} chose it.`;} fx(p,{fame:8,happy:6}); return `${p.first} told it all, and the film became a fitting monument. ${ancFirst(a)}'s story, properly remembered, is now part of the world the bloodline lives in.`; }},
      {label:'Help shape the narrative', sub:'curate the legacy', effect:p=>{ fx(p,{fame:5,stress:6}); return `${p.first} cooperated selectively — guiding the light toward the good, away from the rest. The film flatters. Whether that's protection or a lie depends on who's asking.`; }},
      {label:'Decline', sub:'leave the past alone', effect:p=>{ fx(p,{happy:2}); return `${p.first} declined. Some stories belong to the people who lived them, not to a camera. The film got made anyway, thinner for ${p.first}'s absence.`; }},
      {label:'Let them find what they find', sub:'no hand on the scale', effect:p=>{ const a=ancBest(p, x=>ancFamous(x)&&x.job!=='none'); const dirty=a.job==='crimelord'||ancRec(a,/crime|violen|misconduct|cover|fraud/i); fx(p, dirty?{fame:4,happy:-6}:{fame:6,happy:2}); return dirty? `${p.first} stayed out of it — and the film dug up everything. ${ancFirst(a)}'s secrets are public now, with the family name attached.` : `${p.first} let the truth find its own level. It turned out ${ancFirst(a)}'s record held up to the light just fine.`; }},
    ]},

  // ---------- The Law Your Ancestor Made ----------
  { id:'ge_the_law', emoji:'⚖️', title:'The Law Your Ancestor Made', once:true, track:'arc', weight:5,
    when:p=>p.age>=25 && !!ancBest(p, a=>(a.job==='politician'&&a.jobTitle==='President')||(a.job==='lawyer'&&a.jobTitle==='Judge')),
    body:p=>{ const a=ancBest(p, x=>(x.job==='politician'&&x.jobTitle==='President')||(x.job==='lawyer'&&x.jobTitle==='Judge')); return `Something in ${p.first}'s life lands in front of the law — and the rule that decides it traces straight back to ${ancName(a)}, who as ${a.jobTitle} wrote the very thing now being applied to their own descendant. ${p.first} is in the room when ${ancFirst(a)}'s hand reaches across the years.`; },
    choices:[
      {label:'Let the law work', sub:'accept the inheritance', effect:p=>{ if(chance(60)){ fx(p,{happy:6,money:20000+rnd(80000)}); return `${ancFirst(ancBest(p,x=>(x.job==='politician'&&x.jobTitle==='President')||(x.job==='lawyer'&&x.jobTitle==='Judge')))}'s rule fell in ${p.first}'s favor. The dead can still protect the living, it turns out.`;} fx(p,{happy:-6,money:-(10000+rnd(40000))}); return `The law their own ancestor built came down against ${p.first}. There's a bitter symmetry in being bound by a rule with your name on it.`; }},
      {label:'Challenge the law itself', sub:'lawyers & politicians only', need:p=>['lawyer','politician'].includes(p.job), effect:p=>{ const a=ancBest(p, x=>(x.job==='politician'&&x.jobTitle==='President')||(x.job==='lawyer'&&x.jobTitle==='Judge')); if(chance(45)){ fx(p,{fame:10,smarts:4,happy:4}); return `${p.first} stood up and argued against the very law ${ancFirst(a)} built — and won. Overturning your own blood's monument is a strange kind of triumph, half pride and half grief.`;} fx(p,{fame:4,stress:10}); return `${p.first} challenged ${ancFirst(a)}'s law and lost. The thing their ancestor built outlasted the descendant who tried to unmake it. Maybe that's how it should be.`; }},
    ]},

  // ---------- The Portal (2-beat) ----------
  { id:'ge_portal_b1', emoji:'🌌', title:'The Fragments', once:true, track:'arc', weight:4,
    when:p=>p.age>=16 && !!ancBest(p, a=>(a.doomsdayLevel>0) || (a.powers&&a.powers.some(pw=>['dimensional pocket','teleportation','probability manipulation','astral projection'].includes(pw))) || (a.job==='scientist'&&a.jobTitle==='Nobel Laureate')),
    body:p=>{ const a=ancBest(p, x=>(x.doomsdayLevel>0)||(x.powers&&x.powers.some(pw=>['dimensional pocket','teleportation','probability manipulation','astral projection'].includes(pw)))||(x.job==='scientist'&&x.jobTitle==='Nobel Laureate')); setFlag(p,'ge_portalAnc',ancName(a)); return `Objects keep turning up near ${p.first}'s home — geometry that hurts to look at, metals that aren't on any table, a hum with no source. They started the year ${p.first} moved in. They trace back, somehow, to ${ancName(a)} and whatever ${ancFirst(a)} once tore open.`; },
    choices:[
      {label:'Investigate', sub:'follow the fragments back', effect:p=>{ setFlag(p,'ge_portalChase',true); fx(p,{smarts:5,stress:8}); return `${p.first} started pulling the thread — coordinates, old patents, a storage unit no one had opened in decades. Something is at the end of this, waiting where ${(p.flags.ge_portalAnc||'their ancestor')} left it.`; }},
      {label:'Ignore it', sub:"it doesn't ignore you", effect:p=>{ setFlag(p,'ge_portalIgnore',true); fx(p,{stress:10}); return `${p.first} chose not to look. The fragments kept coming anyway — stranger each season, less and less willing to be unseen. Some doors stay open until someone closes them.`; }},
    ]},
  { id:'ge_portal_b2', emoji:'🚪', title:"The Ancestor's Door", once:true, track:'arc', weight:8,
    when:p=>hasFlag(p,'ge_portalChase') && !hasFlag(p,'ge_portalDone'),
    body:p=>`The thread runs out at a sealed lab — ${(p.flags.ge_portalAnc||'an ancestor')}'s real work, hidden all this time. Notes in a careful hand. A device, still faintly humming. A door that is, unmistakably, ajar. ${p.first} is the first of the blood to stand here since it was made.`,
    choices:[
      {label:'Close it for good', sub:'end what they started', effect:p=>{ setFlag(p,'ge_portalDone',true); fx(p,{happy:8,stress:-4,smarts:3}); return `${p.first} did what their ancestor never could — shut it, sealed it, ended it. The fragments stopped that night. Some inheritances are best refused, gently and completely.`; }},
      {label:'Use it', sub:'pick up the work', effect:p=>{ setFlag(p,'ge_portalDone',true); setFlag(p,'ge_portalUsed',true); if(chance(50)){ fx(p,{fame:14,smarts:8,money:200000+rnd(2000000)}); return `${p.first} learned to work the door, and the world changed shape around them. ${(p.flags.ge_portalAnc||'Their ancestor')}'s genius, finished at last by their blood — for better, mostly.`;} fx(p,{health:-16,stress:18}); return `${p.first} reached through, and something reached back. The work that broke their ancestor nearly broke ${p.first} too. The door is open now, and open things attract attention.`; }},
    ]},

  // ---------- The Heir to a Criminal Empire ----------
  { id:'ge_crime_heir', emoji:'👑', title:'The Heir to an Empire', once:true, track:'arc', weight:5,
    when:p=>p.age>=20 && p.job!=='crimelord' && !!ancBest(p, a=>a.job==='crimelord' && (a.jobTitle==='Kingpin' || (a.territory||0)>0)),
    body:p=>{ const a=ancBest(p, x=>x.job==='crimelord'&&(x.jobTitle==='Kingpin'||(x.territory||0)>0)); return `Quiet, well-dressed people approach ${p.first} with an offer that isn't really an offer. ${ancName(a)}'s organization never died — the money still moves, the territory still answers to the old name. It's ${p.first}'s by blood, if ${p.first} reaches out a hand.`; },
    choices:[
      {label:'Take it', sub:'inherit the empire', effect:p=>{ if(typeof takeJobSilent==='function'){ takeJobSilent(p,'crimelord'); } else { p.job='crimelord'; } p.jobTitle='Underboss'; p._stage=3; p._stageYears=0; p.salary=Math.max(p.salary||0, 180000); fx(p,{money:300000+rnd(700000),fame:6,stress:10}); p._wasCrime=true; return `${p.first} took the hand they were offered and stepped into a throne built by blood they never met. No street years, no climb — ${p.first} starts near the top of ${ancFirst(ancBest(p,x=>x.job==='crimelord'))||'the family'}'s old empire, with all the danger that implies.`; }},
      {label:'Walk away', sub:'refuse the inheritance', effect:p=>{ setFlag(p,'ge_crimeRefused',true); fx(p,{happy:4,stress:6}); return `${p.first} declined, and the organization passed to other hands. Clean — mostly. The old name still brushes against ${p.first} now and then, an association that never fully lets go.`; }},
      {label:'Dismantle it', sub:'dangerous, but possible', effect:p=>{ if(chance(45)){ fx(p,{fame:10,happy:8,stress:16,health:-6}); p.record.push('Brought down a crime syndicate'); return `${p.first} spent years and nerve taking apart what their ancestor built — feeding it to investigators, turning its own people, ending it from the inside. The bloodline's darkest chapter, closed by its own descendant. The people who profited will never forgive it.`;} fx(p,{health:-18,stress:20,happy:-8}); return `${p.first} tried to dismantle the empire and learned why no one had. The people who don't want it gone made that very clear. ${p.first} survived — barely — and the machine grinds on.`; }},
    ]},

  // ---------- The Photograph (a moment) ----------
  { id:'ge_photograph', emoji:'🖼', title:'The Photograph', once:true, track:'arc', weight:4,
    when:p=>p.gen>=3 && !!ancBest(p, ancFamous),
    body:p=>{ const a=ancBest(p,ancFamous); return `A child runs up to ${p.first} in a public place, clutching a creased old photograph. It's ${ancName(a)}, young and unmistakable, caught mid-stride in their prime. "My grandmother said they were the bravest person she ever met." The child waits, beaming, for ${p.first} to say something.`; },
    choices:[
      {label:'Stand in it for a second', sub:'just a moment', effect:p=>{ const a=ancBest(p,ancFamous); return `${p.first} looked at the photo of ${ancFirst(a)} — gone long before ${p.first} was born — and at the child holding the whole weight of what came before, and said something kind. Then the child ran off, and ${p.first} stood there a while longer than they meant to.`; }},
    ]},

];

// fold Part 6 into the main pool (Arc track)
CHOICE_EVENTS.push(...CHAIN_EVENTS_P6);
