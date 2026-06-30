"use strict";
/* Threadbare · split module: 02-data-careers-world.js  (lines 306–926 of the original single-file build; see CODEBASE_STRUCTURE.md) */
// ---------------- addictions ----------------
// p.addictions is an array of {k, sev} (severity 1-3). Old saves used a single p.addiction string.
const ADDICTIONS=[
  {k:'alcohol',   l:'alcohol',        e:'🍺', health:-2.5, happy:-1.0, quit:8,  rehab:'$8,000'},
  {k:'cocaine',   l:'cocaine',        e:'❄️', health:-4.5, happy:-1.5, quit:5,  rehab:'$15,000'},
  {k:'party_drugs',l:'party drugs',   e:'💊', health:-3.5, happy:-1.0, quit:7,  rehab:'$12,000'},
  {k:'painkillers',l:'painkillers',   e:'💉', health:-5.0, happy:-1.8, quit:4,  rehab:'$18,000'},
  {k:'gambling',  l:'a gambling habit',e:'🎰', health:-1.0, happy:-2.0, quit:9,  rehab:'$10,000'},
  {k:'nicotine',  l:'nicotine',       e:'🚬', health:-2.0, happy:-0.5, quit:10, rehab:'$5,000'},
];
const ADDICT=k=>ADDICTIONS.find(a=>a.k===k);
function hasAddiction(p,k){ return (p.addictions||[]).some(a=>a.k===k); }
function addAddiction(p,k,silent){
  if(!p.addictions) p.addictions=[];
  const a=ADDICT(k); if(!a) return false;
  const existing=p.addictions.find(x=>x.k===k);
  if(existing){ existing.sev=Math.min(3, existing.sev+1); if(!silent)log(`${p.first}'s ${a.l} habit is getting worse.`,'bad'); return false; }
  p.addictions.push({k, sev:1});
  if(!silent) log(`${p.first} developed a dependence on ${a.l}.`,'bad');
  return true;
}
function clearAddiction(p,k){ if(p.addictions) p.addictions=p.addictions.filter(a=>a.k!==k); }

/* ---------------- careers ----------------
   tier gates by education; pay grows with years */
const CAREERS=[
  {k:'none',     l:'Drifting',         emoji:'🍂', edu:0, base:0,    grow:0,    stat:'happy'},
  {k:'cashier',  l:'Cashier',          emoji:'🧾', edu:0, base:22000, grow:600,  stat:'happy'},
  {k:'barista',  l:'Barista',          emoji:'☕', edu:0, base:24000, grow:700,  stat:'happy'},
  {k:'janitor',  l:'Janitor',          emoji:'🧹', edu:0, base:26000, grow:800,  stat:'health'},
  {k:'trucker',  l:'Truck Driver',     emoji:'🚛', edu:0, base:42000, grow:1400, stat:'health'},
  {k:'mechanic', l:'Mechanic',         emoji:'🔧', edu:1, base:44000, grow:1700, stat:'smarts'},
  {k:'electrician',l:'Electrician',    emoji:'💡', edu:1, base:52000, grow:2100, stat:'smarts'},
  {k:'plumber',  l:'Plumber',          emoji:'🔩', edu:1, base:54000, grow:2200, stat:'health'},
  {k:'youtuber', l:'YouTuber',         emoji:'🎥', edu:0, base:5000,  grow:9000, stat:'fame', wild:true},
  {k:'cop',      l:'Police Officer',   emoji:'🚓', edu:1, base:48000, grow:1600, stat:'health', ladder:['Cadet','Officer','Detective','Sergeant','Chief']},
  {k:'firefighter',l:'Firefighter',    emoji:'🚒', edu:1, base:46000, grow:1700, stat:'health', ladder:['Recruit','Firefighter','Lieutenant','Captain','Fire Chief']},
  {k:'soldier',  l:'Military Officer', emoji:'🎖', edu:1, base:40000, grow:2000, stat:'athletic', ladder:['Private','Sergeant','Lieutenant','Major','General'], danger:true},
  {k:'teacher',  l:'Teacher',          emoji:'📐', edu:2, base:46000, grow:1500, stat:'smarts'},
  {k:'nurse',    l:'Nurse',            emoji:'🩺', edu:2, base:62000, grow:2200, stat:'health'},
  {k:'vet',      l:'Veterinarian',     emoji:'🐾', edu:3, base:90000, grow:3400, stat:'smarts'},
  {k:'engineer', l:'Engineer',         emoji:'⚙️', edu:2, base:78000, grow:3200, stat:'smarts'},
  {k:'realtor',  l:'Real Estate Agent',emoji:'🏠', edu:0, base:38000, grow:4000, stat:'charming', wild:true},
  {k:'accountant',l:'Accountant',      emoji:'🧮', edu:2, base:64000, grow:2600, stat:'smarts'},
  {k:'analyst',  l:'Financial Analyst',emoji:'📈', edu:2, base:82000, grow:3800, stat:'smarts'},
  {k:'corporate',l:'Corporate',        emoji:'🏢', edu:2, base:55000, grow:3000, stat:'smarts', ladder:['Intern','Associate','Manager','VP','CEO']},
  {k:'chef',     l:'Chef',             emoji:'🔪', edu:1, base:40000, grow:1800, stat:'happy', ladder:['Line Cook','Chef','Sous Chef','Head Chef','Executive Chef']},
  {k:'lawyer',   l:'Lawyer',           emoji:'⚖️', edu:3, base:95000, grow:4200, stat:'smarts', ladder:['Associate','Lawyer','Senior Partner','Judge']},
  {k:'doctor',   l:'Surgeon',          emoji:'🫀', edu:3, base:130000,grow:5500, stat:'smarts', ladder:['Resident','Doctor','Surgeon','Chief of Surgery']},
  {k:'nba',      l:'NBA Player',       emoji:'🏀', edu:0, base:900000,grow:120000,stat:'athletic', wild:true, short:true},
  {k:'nfl',      l:'NFL Player',       emoji:'🏈', edu:0, base:800000,grow:110000,stat:'athletic', wild:true, short:true},
  {k:'soccer',   l:'Pro Footballer',   emoji:'⚽', edu:0, base:600000,grow:90000, stat:'athletic', wild:true, short:true},
  {k:'musician', l:'Musician',         emoji:'🎸', edu:0, base:18000, grow:14000,stat:'fame', wild:true},
  {k:'founder',  l:'Founder',          emoji:'🚀', edu:1, base:0,     grow:0,    stat:'smarts', wild:true},
  {k:'pilot',    l:'Airline Pilot',    emoji:'✈️', edu:2, base:88000, grow:3600, stat:'health'},
  {k:'farmer',   l:'Farmer',           emoji:'🌾', edu:0, base:30000, grow:900,  stat:'health'},
  {k:'driver',   l:'Delivery Driver',  emoji:'📦', edu:0, base:38000, grow:1200, stat:'health'},
  {k:'professor',l:'Professor',        emoji:'🎓', edu:3, base:72000, grow:3000, stat:'smarts', uni:true, ladder:['Adjunct','Assistant Prof','Associate Prof','Tenured Prof','Department Dean']},
  {k:'actor',    l:'Actor',            emoji:'🎭', edu:0, base:26000, grow:16000,stat:'fame', wild:true},
  {k:'model',    l:'Model',            emoji:'📸', edu:0, base:30000, grow:12000,stat:'fame', wild:true, looksGate:70},
  {k:'writer',   l:'Author',           emoji:'✍️', edu:0, base:20000, grow:7000, stat:'smarts', wild:true},
  {k:'ufc',      l:'UFC Fighter',      emoji:'🥊', edu:0, base:120000,grow:60000, stat:'athletic', wild:true, short:true, athGate:78, danger:true},
  {k:'agent',    l:'Secret Agent',     emoji:'🕵️', edu:2, base:90000, grow:4000, stat:'smarts', danger:true, ladder:['Recruit','Field Agent','Senior Agent','Station Chief','Director']},
  {k:'politician',l:'Politician',      emoji:'🏛', edu:2, base:70000, grow:5000, stat:'charming', wild:true, ladder:['Candidate','Councilor','Mayor','Governor','President']},
  // ----- deep staged careers (progress through named stages with skill gates) -----
  {k:'wwe', l:'Pro Wrestler', emoji:'🤼', edu:0, base:24000, keyStat:'athletic', athGate:55, staged:true,
    stages:[
      {t:'Indie Circuit',   mult:1,   years:0, req:0,  fame:1},
      {t:'NXT Developmental',mult:2.5, years:2, req:62, fame:4},
      {t:'SmackDown Roster',mult:7,   years:3, req:72, fame:9},
      {t:'Raw Main Eventer',mult:16,  years:3, req:80, fame:16},
      {t:'World Champion',  mult:34,  years:3, req:88, fame:30},
      {t:'Hall of Famer',   mult:20,  years:5, req:90, fame:12},
    ]},
  {k:'moviestar', l:'Actor → Movie Star', emoji:'🎬', edu:0, base:18000, keyStat:'looks', staged:true,
    stages:[
      {t:'Background Extra', mult:1,   years:0, req:0,  fame:1},
      {t:'Commercial Actor', mult:2,   years:2, req:48, fame:3},
      {t:'TV Series Regular',mult:5,   years:3, req:58, fame:8},
      {t:'Supporting Film',  mult:12,  years:3, req:66, fame:15},
      {t:'Leading Role',     mult:28,  years:3, req:74, fame:26},
      {t:'A-List Movie Star',mult:60,  years:4, req:82, fame:45},
      {t:'Oscar Winner',     mult:75,  years:4, req:88, fame:60},
    ]},
  {k:'tech', l:'Tech / IT', emoji:'💻', edu:1, base:52000, keyStat:'smarts', staged:true,
    stages:[
      {t:'Help Desk',        mult:1,    years:0, req:0,  fame:0},
      {t:'IT Support',       mult:1.4,  years:2, req:50, fame:0},
      {t:'Junior Developer', mult:2.1,  years:2, req:58, fame:0},
      {t:'Software Engineer',mult:3.4,  years:3, req:66, fame:0},
      {t:'Senior Engineer',  mult:5.2,  years:3, req:74, fame:1},
      {t:'Engineering Lead', mult:7.5,  years:3, req:80, fame:2},
      {t:'CTO',              mult:13,   years:4, req:86, fame:5},
    ]},
  {k:'boxer', l:'Boxer', emoji:'🥊', edu:0, base:16000, keyStat:'athletic', athGate:60, staged:true, danger:true, short:true,
    stages:[
      {t:'Amateur',          mult:1,   years:0, req:0,  fame:1},
      {t:'Pro Debut',        mult:3,   years:2, req:66, fame:4},
      {t:'Ranked Contender', mult:9,   years:3, req:76, fame:10},
      {t:'Title Challenger', mult:22,  years:2, req:84, fame:22},
      {t:'World Champion',   mult:48,  years:3, req:90, fame:40},
    ]},
  {k:'mogul', l:'Media Mogul', emoji:'📺', edu:1, base:38000, keyStat:'smarts', staged:true,
    stages:[
      {t:'Intern Reporter', mult:1,   years:0, req:0,  fame:1},
      {t:'Field Reporter',  mult:2.2, years:2, req:54, fame:5},
      {t:'Anchor',          mult:5,   years:3, req:64, fame:16},
      {t:'Bureau Chief',    mult:12,  years:3, req:74, fame:30},
      {t:'Network President',mult:30, years:4, req:84, fame:50},
    ]},
  {k:'director', l:'Film Director', emoji:'🎥', edu:1, base:30000, keyStat:'smarts', staged:true,
    stages:[
      {t:'Film School Grad', mult:1,   years:0, req:0,  fame:0},
      {t:'Music Video Dir.', mult:2,   years:2, req:52, fame:3},
      {t:'Indie Director',   mult:4.5, years:3, req:62, fame:8},
      {t:'Studio Director',  mult:11,  years:3, req:72, fame:18},
      {t:'Blockbuster Dir.', mult:26,  years:4, req:82, fame:38},
      {t:'Legendary Auteur', mult:40,  years:5, req:88, fame:55},
    ]},
  {k:'popstar', l:'Pop Star', emoji:'🎤', edu:0, base:14000, keyStat:'fame', staged:true,
    stages:[
      {t:'Open Mic Singer',  mult:1,   years:0, req:0,  fame:2},
      {t:'Local Gigging',    mult:2,   years:2, req:20, fame:5},
      {t:'Signed Artist',    mult:6,   years:2, req:38, fame:12},
      {t:'Charting Single',  mult:16,  years:2, req:55, fame:24},
      {t:'Platinum Album',   mult:38,  years:3, req:72, fame:42},
      {t:'Global Pop Icon',  mult:70,  years:3, req:85, fame:60},
    ]},
  {k:'restaurateur', l:'Chef → Restaurateur', emoji:'👨‍🍳', edu:1, base:32000, keyStat:'smarts', staged:true,
    stages:[
      {t:'Line Cook',        mult:1,   years:0, req:0,  fame:0},
      {t:'Sous Chef',        mult:1.8, years:2, req:50, fame:1},
      {t:'Head Chef',        mult:3.2, years:3, req:60, fame:4},
      {t:'Restaurant Owner', mult:7,   years:3, req:70, fame:10},
      {t:'Restaurant Group', mult:16,  years:4, req:80, fame:20},
      {t:'Celebrity Chef',   mult:34,  years:4, req:88, fame:42},
    ]},
  {k:'esports', l:'Esports Pro', emoji:'🎮', edu:0, base:26000, keyStat:'smarts', staged:true, short:true,
    stages:[
      {t:'Ranked Grinder',   mult:1,   years:0, req:0,  fame:1},
      {t:'Semi-Pro',         mult:2.5, years:1, req:55, fame:4},
      {t:'Pro Team Sub',     mult:6,   years:2, req:66, fame:9},
      {t:'Starting Roster',  mult:14,  years:2, req:76, fame:18},
      {t:'World Finalist',   mult:30,  years:2, req:84, fame:32},
      {t:'Esports Legend',   mult:48,  years:3, req:90, fame:48},
    ]},
  {k:'astronaut', l:'Astronaut', emoji:'🚀', edu:3, base:80000, keyStat:'smarts', staged:true, danger:true,
    stages:[
      {t:'Candidate',        mult:1,   years:0, req:0,  fame:1},
      {t:'Mission Specialist',mult:1.6,years:3, req:70, fame:6},
      {t:'Shuttle Crew',     mult:2.6, years:3, req:80, fame:18},
      {t:'Mission Commander',mult:4,   years:3, req:88, fame:36},
      {t:'Moonwalker',       mult:6,   years:4, req:93, fame:60},
    ]},
  {k:'crimelord', l:'Organized Crime', emoji:'🕴', edu:0, base:30000, keyStat:'sly', crime:true, staged:true,
    stages:[
      {t:'Street Hustler',   mult:1,   years:0, req:0,  bust:8},
      {t:'Enforcer',         mult:3,   years:2, req:0,  bust:12},
      {t:'Crew Leader',      mult:8,   years:3, req:0,  bust:16},
      {t:'Underboss',        mult:20,  years:3, req:0,  bust:20},
      {t:'Kingpin',          mult:55,  years:4, req:0,  bust:26},
    ]},
  {k:'conductor', l:'Train Conductor', emoji:'🚆', edu:1, base:50000, grow:2000, stat:'health', ladder:['Brakeman','Conductor','Senior Conductor','Yardmaster']},
  {k:'scientist', l:'Scientist',       emoji:'🔬', edu:3, base:85000, grow:3800, stat:'smarts', ladder:['Lab Tech','Researcher','Senior Scientist','Lab Director','Nobel Laureate']},
  {k:'superhero', l:'Superhero', emoji:'🦸', edu:0, base:0, keyStat:'athletic', athGate:70, staged:true, danger:true, hero:true,
    stages:[
      {t:'Masked Vigilante', mult:0,   years:0, req:0,  fame:3},
      {t:'Local Hero',       mult:1,   years:2, req:74, fame:10},
      {t:'City Guardian',    mult:4,   years:3, req:80, fame:24},
      {t:'National Icon',    mult:10,  years:3, req:86, fame:42},
      {t:'Legendary Hero',   mult:22,  years:4, req:92, fame:65},
    ]},
  {k:'villain', l:'Supervillain', emoji:'🦹', edu:0, base:0, keyStat:'smarts', staged:true, danger:true, crime:true, evil:true,
    stages:[
      {t:'Petty Menace',     mult:1,   years:0, req:0,  bust:6},
      {t:'Costumed Criminal',mult:4,   years:2, req:0,  bust:11},
      {t:'Crime Syndicate',  mult:12,  years:3, req:0,  bust:15},
      {t:'Arch-Nemesis',     mult:30,  years:3, req:0,  bust:19},
      {t:'World Threat',     mult:70,  years:4, req:0,  bust:24},
    ]},
  {k:'madsci', l:'Mad Scientist', emoji:'🧪', edu:2, base:60000, keyStat:'smarts', staged:true, mad:true,
    stages:[
      {t:'Garage Tinkerer',  mult:1,   years:0, req:0,  fame:1},
      {t:'Fringe Researcher',mult:2,   years:2, req:60, fame:5},
      {t:'Renegade Genius',  mult:5,   years:3, req:72, fame:14},
      {t:'Dimension Bender', mult:14,  years:3, req:82, fame:30},
      {t:'Reality Architect',mult:30,  years:4, req:90, fame:55},
    ]},
  {k:'aistartup', l:'AI Startup', emoji:'🤖', edu:1, base:0, keyStat:'smarts', staged:true, company:true,
    stages:[
      {t:'Solo Founder',       mult:0,    years:0, req:0,  fame:1},
      {t:'Seed Stage',         mult:0.6,  years:1, req:55, fame:4},
      {t:'Series A',           mult:2,    years:2, req:64, fame:10},
      {t:'Scaling Startup',    mult:6,    years:2, req:72, fame:20},
      {t:'Unicorn',            mult:18,   years:3, req:82, fame:38},
      {t:'IPO — Public CEO',   mult:45,   years:3, req:90, fame:60},
    ]},
];
// Display careers alphabetically by title; 'none' (Drifting) stays first. Purely cosmetic —
// every lookup is by key via CAREER(k), and nothing indexes CAREERS by position.
CAREERS.sort((a,b)=> a.k==='none' ? -1 : b.k==='none' ? 1 : a.l.localeCompare(b.l));
const CAREER=k=>CAREERS.find(c=>c.k===k);

// High-school clubs: joining gives yearly stat growth + a head-start flag for matching careers
// Superpowers — granted to heroes and villains, expanding as they rise
const POWERS=[
  // PHYSICAL (7)
  'super strength','super speed','super endurance','regeneration','invulnerability','size manipulation','density control',
  // SENSORY (7)
  'laser vision','x-ray vision','telescopic vision','microscopic vision','super hearing','echolocation','precognition',
  // ELEMENTAL (8)
  'elemental control','pyrokinesis','electrokinesis','cryokinesis','hydrokinesis','aerokinesis','geokinesis','weather control',
  // MENTAL / PSYCHIC (6)
  'telepathy','mind control','empathy','dream walking','memory manipulation','psychic shielding',
  // SPACE & REALITY (5)
  'flight','phasing','teleportation','gravity manipulation','probability manipulation',
  // ENERGY (6)
  'force fields','energy blasts','energy absorption','magnetism','light manipulation','sonic scream',
  // BODY & TRANSFORMATION (5)
  'shapeshifting','invisibility','duplication','biological mimicry','pheromone control',
  // UNIQUE / RARE (6)
  'telekinesis','technopathy','time manipulation','dimensional pocket','astral projection','cosmic awareness'
];
const TOTAL_POWERS = POWERS.length; // 50 — the bloodline must acquire them all to beat Homelander
const POWERS_PER_GEN = 3; // max new powers one character can gain in their lifetime
// Power rarity (affects how readily events grant them)
const POWER_RARITY = {
  'super strength':'common','super speed':'common','regeneration':'common','elemental control':'common',
  'telepathy':'common','empathy':'common','flight':'common','force fields':'common','energy blasts':'common',
  'invisibility':'common','telekinesis':'common',
  'super endurance':'uncommon','invulnerability':'uncommon','size manipulation':'uncommon','laser vision':'uncommon',
  'x-ray vision':'uncommon','telescopic vision':'uncommon','super hearing':'uncommon','pyrokinesis':'uncommon',
  'electrokinesis':'uncommon','cryokinesis':'uncommon','weather control':'uncommon','mind control':'uncommon',
  'psychic shielding':'uncommon','phasing':'uncommon','force fields ':'uncommon','energy absorption':'uncommon',
  'magnetism':'uncommon','sonic scream':'uncommon','shapeshifting':'uncommon','technopathy':'uncommon',
};
function powerRarity(name){ return POWER_RARITY[name]||'rare'; }
// ===== THE VAULT: items earned at career capstones, stored across generations to use against Homelander =====
// req: required for the final fight (15). career: the job whose peak unlocks it. alt: the tempting reward you give up to store it.
const VAULT_ITEMS = [
  // --- 15 REQUIRED ---
  {id:'virus', name:'The Virus', emoji:'🧬', req:true, career:'madsci', desc:'A compound that disrupts his regeneration for 72 hours.', alt:'a fortune from selling the research'},
  {id:'orbital', name:'Orbital Strike Authorization', emoji:'🛰️', req:true, career:'soldier', desc:'A classified orbital weapon, one activation code, one target.', alt:'a quiet, honored retirement'},
  {id:'blackfile', name:'The Black File', emoji:'🗄️', req:true, career:'agent', desc:'Every verified weakness intelligence ever gathered on him.', alt:'a lucrative private security contract'},
  {id:'order', name:'The Order', emoji:'📜', req:true, career:'politician', desc:'A sealed executive order authorizing all force against one enhanced individual.', alt:'a triumphant, scandal-free legacy'},
  {id:'underground', name:'The Underground', emoji:'🕳️', req:true, career:'crimelord', desc:'Tunnels and safe houses entirely off his surveillance grid.', alt:'liquidating the empire for a fortune'},
  {id:'formula', name:'The Formula', emoji:'💉', req:true, career:'doctor', desc:'A compound that drops his invulnerability to near-human for hours.', alt:'a Nobel-track medical breakthrough'},
  {id:'combatai', name:'The Combat AI', emoji:'🤖', req:true, career:'tech', desc:'Predicts his next move with 91% accuracy.', alt:'a record-breaking acquisition payout'},
  {id:'coalition', name:'The Coalition', emoji:'🦸', req:true, career:'superhero', desc:'A pledge from every hero your ancestor united.', alt:'cementing your own solo legend'},
  {id:'paper', name:'The Paper', emoji:'📑', req:true, career:'scientist', desc:'The one physiological process Compound V cannot repair.', alt:'the Nobel Prize and global acclaim'},
  {id:'precedent', name:'The Precedent', emoji:'⚖️', req:true, career:'lawyer', desc:'A ruling stripping enhanced individuals of legal immunity.', alt:'appointment to the highest court'},
  {id:'gloves', name:'The Gloves', emoji:'🥊', req:true, career:'ufc', desc:'An alloy that amplifies a super-strong strike past his invulnerability.', alt:'the richest title-defense purse ever'},
  {id:'compound', name:'The Compound', emoji:'🌑', req:true, career:'astronaut', desc:'A lunar substance that weakens his biology.', alt:'history as the most celebrated astronaut alive'},
  {id:'device', name:'The Device', emoji:'☢️', req:true, career:'villain', desc:'The doomsday weapon your ancestor built and never used — repurposed for one target.', alt:'ransoming the world for untold billions'},
  {id:'broadcast', name:'The Broadcast', emoji:'📡', req:true, career:'mogul', desc:'Decades of his atrocities, ready to hit every screen on earth at once.', alt:'becoming the most powerful person in media'},
  {id:'mandate', name:'The Mandate', emoji:'🚔', req:true, career:'cop', desc:'A legal framework authorizing engagement of a public enhanced threat.', alt:'retiring as a decorated, beloved chief'},
  // --- 15 OPTIONAL (improve odds + narration) ---
  {id:'shares', name:'The Shares', emoji:'📈', req:false, career:'corporate', desc:'A seat inside Vought — real-time intel on his schedule and mind.', alt:'the largest CEO payout in company history'},
  {id:'documentary', name:'The Documentary', emoji:'🎥', req:false, career:'director', desc:'The definitive filmed account of his crimes.', alt:'an Academy Award and a finished masterpiece'},
  {id:'manifesto', name:'The Manifesto', emoji:'📕', req:false, career:'writer', desc:'A book that turned opinion against superhuman authority.', alt:'a record-shattering bestseller deal'},
  {id:'algorithm', name:'The Algorithm', emoji:'🎯', req:false, career:'esports', desc:'A targeting model built from inhuman reaction-time data.', alt:'immortality as an esports legend'},
  {id:'archive', name:'The Archive', emoji:'🗃️', req:false, career:'youtuber', desc:'Millions of followers\' crowdsourced footage of his incidents.', alt:'the biggest creator payday ever'},
  {id:'song', name:'The Song', emoji:'🎵', req:false, career:'popstar', desc:'An anthem of quiet resistance embedded in the culture.', alt:'the best-selling record of all time'},
  {id:'reel', name:'The Exposé Reel', emoji:'🎞️', req:false, career:'moviestar', desc:'Raw on-set footage from Vought projects — undeniable.', alt:'an Oscar and untouchable stardom'},
  {id:'crowdwill', name:"The Crowd's Will", emoji:'🤼', req:false, career:'wwe', desc:'A Hall-of-Fame name the crowd instinctively rallies behind.', alt:'a clean Hall-of-Fame retirement'},
  {id:'engine', name:'The Exposure Engine', emoji:'🧠', req:false, career:'aistartup', desc:'An AI that synthesizes his most damaging narrative in real time.', alt:'the biggest tech IPO in history'},
  {id:'erp', name:'Emergency Response Protocol', emoji:'🚒', req:false, career:'firefighter', desc:'Infrastructure to manage collateral damage during the fight.', alt:'retiring as a legendary fire chief'},
  {id:'grid', name:'The Grid Override', emoji:'🔌', req:false, career:'electrician', desc:'One sequence blacks out every camera in a zone.', alt:'a comfortable master-electrician payout'},
  {id:'highway', name:'The Highway', emoji:'🚚', req:false, career:'trucker', desc:'Decades of routes on no map or satellite.', alt:'a full pension and the open road'},
  {id:'routemap', name:'The Route Map', emoji:'🗺️', req:false, career:'driver', desc:'A complete behavioral map of where he goes and when he\'s alone.', alt:'a quiet, steady retirement'},
  {id:'emergpowers', name:'The Emergency Powers', emoji:'🏛️', req:false, career:'governor', desc:'State emergency powers that activate the National Guard.', alt:'a clean path toward the presidency'},
  {id:'network', name:'The Network', emoji:'🍽️', req:false, career:'restaurateur', desc:'Blackmail on his handlers, gathered over decades of service.', alt:'a celebrated culinary empire'},
  // --- sub-boss rewards (earned by defeating sub-bosses, not careers) ---
  {id:'aquanet', name:"Vought's Aquatic Network", emoji:'🌊', req:false, career:null, subboss:true, desc:'Off-grid underwater routing — three new approaches to the final fight.', fightLine:'A coalition unit arrives via aquatic approach, undetected.'},
  {id:'deepfile', name:"The Deep's File", emoji:'📁', req:false, career:null, subboss:true, desc:"A daily-contact psychological profile of Homelander, from someone who fears him too.", fightLine:'You know his psychology from the inside.'},
  {id:'blindspot', name:'The Blind Spot', emoji:'🕶️', req:false, career:null, subboss:true, desc:"With Translucent gone, Homelander can't read your power set going in.", fightLine:'One power beat surprises him completely — "He didn\'t know about this one."'},
  {id:'counternarr', name:'The Counter-Narrative', emoji:'📺', req:false, career:null, subboss:true, desc:"Firecracker's media empire, repurposed to run your story.", fightLine:'The Broadcast is amplified; his support drops in real time.'},
];
const REQUIRED_VAULT = VAULT_ITEMS.filter(v=>v.req).length; // 15
function vaultHas(id){ return G.vault && G.vault.includes(id); }
function vaultItem(id){ return VAULT_ITEMS.find(v=>v.id===id); }
function vaultRequiredCount(){ return (G.vault||[]).filter(id=>{const v=vaultItem(id);return v&&v.req;}).length; }
function vaultOptionalCount(){ return (G.vault||[]).filter(id=>{const v=vaultItem(id);return v&&!v.req;}).length; }
function storeInVault(id){ if(!G.vault) G.vault=[]; if(!G.vault.includes(id)) G.vault.push(id); }
// Is this character at the absolute peak of their (vault-relevant) career?
function atCareerPeak(p){
  const c=CAREER(p.job); if(!c) return false;
  if(c.staged && c.stages){ return (p._stage!=null) && p._stage>=c.stages.length-1 && (p._stageYears||0)>=2; }
  if(c.ladder){ return (p._rung||0)>=c.ladder.length-1 && (p.jobYears||0)>=3; }
  // wild/simple careers: peak ~ long tenure + high relevant stat/fame
  if(c.wild){ return (p.jobYears||0)>=8 && (p.stats.fame>55 || p.champion); }
  return (p.jobYears||0)>=20; // simple careers (electrician, trucker, driver) — a long career
}
// map a job to the vault item it can yield (handles shared/governor special case)
function vaultItemForJob(p){
  // governor is the politician career below presidential peak
  if(p.job==='politician' && p._rung!=null){
    const c=CAREER('politician');
    if(c.ladder){ const top=c.ladder.length-1; if(p._rung===top) return vaultItem('order'); if(p._rung>=top-1) return vaultItem('emergpowers'); }
  }
  return VAULT_ITEMS.find(v=>v.career===p.job);
}
// Offer the vault capstone choice if eligible (called yearly). Returns true if a modal was shown.
function checkVaultCapstone(p, done){
  if(!p.alive || p.job==='none') return false;
  const item=vaultItemForJob(p);
  if(!item) return false;
  if(vaultHas(item.id)) return false;
  if(!p._vaultOffered) p._vaultOffered=[];
  if(p._vaultOffered.includes(item.id)) return false;
  if(!atCareerPeak(p)) return false;
  p._vaultOffered.push(item.id);
  showVaultCapstone(p, item, done);
  return true;
}
function showVaultCapstone(p, item, done){
  const reward = 200000 + rnd(3000000);
  const html=`<div class="grab"></div>
    <div style="text-align:center;font-size:46px;margin:6px 0">${item.emoji}</div>
    <h3 style="text-align:center">A capstone discovery</h3>
    <p style="padding:6px 22px 4px;color:var(--gold);font-size:14px;text-align:center;font-weight:600">${item.name}</p>
    <p style="padding:2px 22px 12px;color:var(--ink-dim);font-size:14px;line-height:1.6;text-align:center">At the very peak of their career, ${p.first} can secure something extraordinary: ${item.desc} ${item.req?'<b style="color:var(--rose)">The bloodline will need this to face Homelander.</b>':'<span style="color:var(--ink-faint)">(Would aid the final fight.)</span>'}</p>`;
  const opts=[];
  opts.push(O('🔒','Store it for the bloodline',`a sacrifice — you give up ${item.alt}`,0,()=>{ closeSheet(); storeInVault(item.id); setFlag(p,'vaultContributor'); log(`${p.first} secured ${item.name} for the vault. A gift to descendants who'll never know their sacrifice.`,'big'); if(done)done(); else render(); }));
  opts.push(O('💰','Take the reward instead',item.alt,0,()=>{ closeSheet(); p.money+=reward; p.stats.fame=clamp(p.stats.fame+8); log(`${p.first} chose ${item.alt} — ${money(reward)} and acclaim. The vault stays empty of ${item.name}.`,'good'); if(done)done(); else render(); }));
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}
// SYNTHESIS: holding both prerequisites auto-unlocks a third power at the next heir's birth (passive bonus)
const POWER_SYNTHESIS = [
  {a:'telepathy', b:'empathy', out:'dream walking'},
  {a:'force fields', b:'energy blasts', out:'energy absorption'},
  {a:'x-ray vision', b:'telescopic vision', out:'microscopic vision'},
  {a:'telepathy', b:'force fields', out:'psychic shielding'},
  {a:'pyrokinesis', b:'electrokinesis', out:'light manipulation'},
  {a:'hydrokinesis', b:'cryokinesis', out:'aerokinesis'},
  {a:'teleportation', b:'phasing', out:'dimensional pocket'},
  {a:'elemental control', b:'weather control', out:'geokinesis'},
  {a:'precognition', b:'cosmic awareness', out:'astral projection'},
  {a:'super endurance', b:'regeneration', out:'invulnerability'},
];
// ===== HOMELANDER: an all-powerful narcissist who exists in this world, mostly ignoring everyone =====
const HOMELANDER_DEEDS=[
  n=>`Homelander incinerated ${n} protesters who "looked at him wrong," then smiled for the cameras.`,
  n=>`Homelander accidentally sheared a passenger jet in half mid-flight. ${n} aboard. He called it "a tragedy, but not my fault."`,
  ()=>`Homelander sank a naval submarine after it "disrespected" him in a press conference.`,
  ()=>`Homelander dropped a ferry into the harbor when the captain didn't recognize him.`,
  n=>`Homelander laser-visioned a city bridge in half during a tantrum. ${n} cars went into the river.`,
  ()=>`Homelander demanded a national holiday in his honor — and vaporized the senator who objected.`,
  n=>`Homelander "saved" a hostage situation by killing everyone in the building. ${n} dead, including the hostages.`,
  ()=>`Homelander flew through a wind-turbine farm for fun, leveling the entire grid for a region.`,
  ()=>`Homelander gave a two-hour speech about his own greatness while a wildfire he could have stopped burned.`,
  n=>`Homelander crushed a luxury yacht like a soda can because the owner had a nicer one than his. ${n} missing.`,
  ()=>`Homelander demanded the news only show flattering footage — anchors who refused simply vanished.`,
  ()=>`Homelander punched a hole in a dam to "test his strength." The flooding is ongoing.`,
  n=>`Homelander melted a stadium scoreboard mid-game because it showed a rival's highlight. ${n} hurt in the panic.`,
  ()=>`Homelander adopted, then abandoned, an entire orphanage as a publicity stunt.`,
  ()=>`Homelander froze a river solid with his breath, just to watch a town's economy collapse.`,
  n=>`A building Homelander "inspected" mysteriously collapsed afterward. ${n} unaccounted for.`,
];
function homelanderBlurb(){
  const d=pick(HOMELANDER_DEEDS);
  const n=(10+rnd(900)).toLocaleString();
  return d(n);
}
// ===== VOUGHT PR BLURBS — upgrade in waves as the player encounters the sub-bosses =====
const VOUGHT_BLURBS = {
  1:[ // before any sub-boss is triggered
    `A Vought International spokesperson confirmed the aquatic response unit handled the pier incident professionally and without incident. No environmental impact recorded.`,
    `Vought International security services neutralized an ongoing surveillance breach at the Houston facility. The contracting officer responsible was placed on administrative leave.`,
    `Following last week's broadcast, Vought's media division thanked viewers for their continued support of the enhanced individual program and its community partners.`,
  ],
  2:[ // after at least one sub-boss encountered
    `The Deep issued a personal statement regarding the Pacific Coastal incident. Vought confirms his account is the authorized version of events.`,
    `Vought International acknowledges recent reporting regarding Translucent's operational status. The company has no comment on personnel matters.`,
    `Firecracker's media network, FlameCast, reached an agreement with Vought for expanded distribution into 14 additional markets.`,
  ],
  3:[ // after two sub-bosses defeated
    `Vought confirms The Deep is no longer available for public appearances pending an internal review. All scheduled events have been cancelled.`,
    `Vought declined to confirm or deny reports of an unauthorized incident involving security personnel in the greater Chicago area.`,
    `Firecracker's FlameCast network has suspended operations effective immediately. Vought cites "a strategic pivot in media partnerships."`,
    `Homelander has cancelled his appearance at the National Governors Association summit — the third public cancellation in four months.`,
  ],
  4:[ // after all three defeated
    `Vought's Q3 earnings call has been postponed amid an "ongoing strategic review." Several senior staff have announced departures this month.`,
    `Multiple enhanced individuals formerly contracted with Vought have declined to renew agreements this quarter.`,
    `Homelander has not made a confirmed public appearance in 47 days. Vought says he is "engaged in classified operations." Online speculation is at record volume.`,
  ],
};
function voughtBlurbWave(){
  const defeated=(G.subBossesDefeated||[]).length;
  const encountered=(G.subBossesSeen||[]).length;
  if(defeated>=3) return 4;
  if(defeated>=2) return 3;
  if(encountered>=1) return 2;
  return 1;
}
function anyHomelanderBlurb(){
  // mix Homelander's atrocities with Vought's PR spin (escalating by wave)
  if(chance(45)){ const w=voughtBlurbWave(); return pick(VOUGHT_BLURBS[w]); }
  return homelanderBlurb();
}
// ===== SUB-BOSSES =====
const SUB_BOSSES = [
  {id:'deep', name:'The Deep', emoji:'🌊', threshold:10, reward:'aquanet',
   blurb:p=>`The Deep has been linked to an incident near ${(p.birthplace||'your city').split(',')[0]}. He's acting on Vought's orders. You can confront him.`},
  {id:'translucent', name:'Translucent', emoji:'💎', threshold:20, reward:'blindspot',
   blurb:p=>`A figure with Translucent's profile has been surveilling your bloodline. He's found your location. You can confront him.`},
  {id:'firecracker', name:'Firecracker', emoji:'🧨', threshold:30, reward:'counternarr',
   blurb:p=>`Firecracker has identified your bloodline publicly. She's running the story. You can let her — or confront her.`},
];
// Awareness levels: how aware Vought/Homelander are of the bloodline
const AWARENESS_LEVELS=['Dormant','Noticed','Watched','HUNTED'];
function awarenessLevel(){ return Math.max(0,Math.min(3, G.awareness||0)); }
function raiseAwareness(n){ G.awareness=Math.max(0,Math.min(3,(G.awareness||0)+(n||1))); }
function lowerAwareness(n){ G.awareness=Math.max(0,(G.awareness||0)-(n||1)); }
function subBossDefeated(id){ return (G.subBossesDefeated||[]).includes(id); }
function subBossSeen(id){ return (G.subBossesSeen||[]).includes(id); }
function grantPower(p, force){
  if(!p.powers) p.powers=[];
  // a character can only acquire 2 NEW powers per generation (beyond what they inherited).
  // `force` bypasses the cap (used by the Homelander victory transfer, etc.)
  if(!force){
    if((p.powersGained||0) >= POWERS_PER_GEN) return null;
  }
  const avail=POWERS.filter(x=>!p.powers.includes(x));
  if(!avail.length) return null;
  const pow=pick(avail); p.powers.push(pow);
  if(!force) p.powersGained=(p.powersGained||0)+1;
  return pow;
}
function hasPower(p,name){ return p.powers && p.powers.includes(name); }
function hasAllPowers(p){ return p.powers && p.powers.length>=TOTAL_POWERS; }
function bloodlineReady(p){ return hasAllPowers(p) && vaultRequiredCount()>=REQUIRED_VAULT; }
// Which powers give a meaningful edge in which careers, and a short flavor line.
// Each entry: power -> { careers:[...], stat?:statToBoost, line:(p)=>flavor }
const POWER_CAREER = {
  'telepathy':       { careers:['lawyer','judge','politician','agent','tech','realtor','accountant','analyst','corporate','doctor','founder','aistartup','crimelord'], line:p=>`reads every room and never gets blindsided` },
  'mind control':    { careers:['lawyer','judge','politician','agent','realtor','model','actor','moviestar','crimelord','founder','aistartup'], line:p=>`bends others to their will when it counts` },
  'super strength':  { careers:['nba','nfl','soccer','ufc','boxer','wwe','soldier','cop','firefighter','farmer','mechanic'], line:p=>`overpowers any physical challenge` },
  'super speed':     { careers:['nba','nfl','soccer','ufc','boxer','wwe','soldier','cop','firefighter','driver','trucker','pilot'], line:p=>`moves faster than anyone can react` },
  'regeneration':    { careers:['ufc','boxer','wwe','nfl','soldier','cop','firefighter','astronaut','stuntman'], line:p=>`shrugs off injuries that would end careers` },
  'flight':          { careers:['pilot','soldier','cop','firefighter','astronaut','model','actor'], line:p=>`does the impossible in the air` },
  'telekinesis':     { careers:['engineer','tech','doctor','mechanic','electrician','plumber','chef','scientist','madsci','astronaut'], line:p=>`manipulates the physical world with a thought` },
  'technopathy':     { careers:['tech','aistartup','founder','engineer','esports','agent','scientist','accountant','analyst'], line:p=>`speaks to machines directly` },
  'time manipulation':{ careers:['tech','aistartup','founder','scientist','madsci','analyst','accountant','nba','nfl','soccer','ufc','esports','realtor'], line:p=>`always has all the time in the world` },
  'energy blasts':   { careers:['soldier','cop','ufc','boxer','wwe'], line:p=>`ends confrontations instantly` },
  'laser vision':    { careers:['soldier','cop','engineer','doctor','mechanic'], line:p=>`brings impossible precision` },
  'invisibility':    { careers:['agent','crimelord','cop','model'], line:p=>`goes anywhere unseen` },
  'shapeshifting':   { careers:['actor','moviestar','agent','model','crimelord','politician'], line:p=>`becomes anyone the role demands` },
  'elemental control':{ careers:['firefighter','farmer','soldier','scientist','madsci'], line:p=>`commands the elements` },
  'weather control': { careers:['farmer','pilot','soldier','scientist'], line:p=>`never loses to the conditions` },
  'force fields':    { careers:['soldier','cop','firefighter','astronaut','bodyguard'], line:p=>`is untouchable under fire` },
  'phasing':         { careers:['agent','crimelord','cop','firefighter'], line:p=>`walks through every barrier` },
  'duplication':     { careers:['tech','aistartup','founder','realtor','restaurateur','chef','farmer','corporate'], line:p=>`is everywhere at once, out-producing everyone` },
  'magnetism':       { careers:['engineer','mechanic','electrician','tech','soldier'], line:p=>`controls metal and machines effortlessly` },
  'sonic scream':    { careers:['musician','popstar','soldier','cop'], line:p=>`commands attention like nothing else` },
};
// Returns the strongest relevant power for this person's current job, or null.
function relevantPower(p){
  if(!p.powers || !p.powers.length || p.job==='none') return null;
  for(const pow of p.powers){ const m=POWER_CAREER[pow]; if(m && m.careers.includes(p.job)) return pow; }
  return null;
}
// How much of an edge powers give in the current career: 0 (none) .. ~1 per relevant power.
function powerEdge(p){
  if(!p.powers || !p.powers.length || p.job==='none') return 0;
  let edge=0;
  p.powers.forEach(pow=>{ const m=POWER_CAREER[pow]; if(m && m.careers.includes(p.job)) edge+=1; });
  return edge;
}
// How many followers a person starts with when they join social media, based on their
// existing fame and the public profile of their career. A famous athlete arrives with a
// built-in audience; a teacher starts near zero.
const CAREER_SOCIAL_BASE = {
  // huge public profile
  nba:400000, nfl:400000, soccer:350000, moviestar:500000, popstar:600000, musician:250000,
  actor:200000, model:300000, wwe:300000, ufc:250000, boxer:200000, esports:150000,
  // notable public profile
  politician:120000, director:90000, author:60000, writer:60000, restaurateur:50000,
  astronaut:80000, superhero:300000, villain:200000, agent:0,
  // modest professional profile
  lawyer:15000, judge:20000, doctor:18000, professor:20000, scientist:25000, ceo:60000,
  corporate:8000, founder:40000, aistartup:50000, tech:12000, realtor:18000, chef:25000,
  // everyday — little to no built-in audience
  teacher:3000, nurse:2000, engineer:4000, accountant:1500, analyst:2500, pilot:6000,
  vet:5000, mechanic:1500, electrician:1000, plumber:1000, farmer:3000, trucker:800,
  driver:800, barista:500, cashier:300, janitor:300,
};
function startingFollowers(p){
  // base from career profile
  let base = CAREER_SOCIAL_BASE[p.job] != null ? CAREER_SOCIAL_BASE[p.job] : 1000;
  // fame multiplies the reach hugely — a famous person in any field draws a crowd
  const fameMult = 1 + (p.stats.fame||0)/15;       // up to ~7.6x at 100 fame
  // championship/legend status and looks add a bonus
  let bonus = 0;
  if(p.champion) bonus += 100000;
  if(hasFlag(p,'sportsLegend')||hasFlag(p,'leagueFace')) bonus += 150000;
  if(p.stats.looks>75) bonus += Math.round(base*0.5);
  if(p.traits && p.traits.includes('charming')) bonus += Math.round(base*0.3);
  let total = Math.round(base*fameMult + bonus);
  // a little randomness so it isn't identical every time
  total = Math.round(total * (0.8 + Math.random()*0.4)) + rnd(500);
  return Math.max(50, total);
}
// generate a comic-book alias for villains and nemeses
const VILLAIN_PREFIX=['Doctor','Lord','The','Baron','Mister','Madame','Professor','Captain','King','Lady'];
const VILLAIN_CORE=['Venom','Shadow','Chaos','Inferno','Mortis','Riddle','Void','Vex','Carnage','Cipher','Dread','Sable','Hex','Onyx','Specter','Malice','Grim','Toxin','Pyre','Wraith','Vortex','Blight'];
const VILLAIN_SUFFIX=['','','','','the Cruel','the Mad','the Merciless','Prime','X','the Unbroken'];
function villainName(){ const a=chance(55)?pick(VILLAIN_PREFIX)+' ':''; const b=pick(VILLAIN_CORE); const c=pick(VILLAIN_SUFFIX); return (a+b+(c?' '+c:'')).trim(); }

const CLUBS=[
  {k:'choir',    l:'Choir',          emoji:'🎶', stat:'fame',     boost:2, helps:'musician', flag:'club_choir',   blurb:'singing chops'},
  {k:'drama',    l:'Drama Club',     emoji:'🎭', stat:'looks',    boost:2, helps:'moviestar', flag:'club_drama',   blurb:'stage presence'},
  {k:'film',     l:'Film Club',      emoji:'🎬', stat:'smarts',   boost:2, helps:'director',  flag:'club_film',    blurb:'an eye for shots'},
  {k:'wrestling',l:'Wrestling Team', emoji:'🤼', stat:'athletic', boost:3, helps:'wwe',       flag:'club_wrestling',blurb:'mat skills'},
  {k:'boxing',   l:'Boxing Club',    emoji:'🥊', stat:'athletic', boost:3, helps:'boxer',     flag:'club_boxing',  blurb:'a real jab'},
  {k:'coding',   l:'Coding Club',    emoji:'💻', stat:'smarts',   boost:3, helps:'tech',      flag:'club_coding',  blurb:'programming fundamentals'},
  {k:'debate',   l:'Debate Team',    emoji:'🗣', stat:'smarts',   boost:2, helps:'lawyer',    flag:'club_debate',  blurb:'a sharp tongue'},
  {k:'track',    l:'Track & Field',  emoji:'🏃', stat:'athletic', boost:3, helps:'nba',       flag:'club_track',   blurb:'speed and stamina'},
  {k:'science',  l:'Science Olympiad',emoji:'🔬',stat:'smarts',   boost:3, helps:'doctor',    flag:'club_science', blurb:'lab discipline'},
  {k:'band',     l:'School Band',     emoji:'🎺', stat:'fame',     boost:2, helps:'popstar',   flag:'club_band',    blurb:'stage confidence'},
  {k:'culinary', l:'Culinary Club',   emoji:'🍳', stat:'smarts',   boost:2, helps:'restaurateur',flag:'club_culinary',blurb:'kitchen instincts'},
  {k:'gaming',   l:'Esports Club',    emoji:'🕹', stat:'smarts',   boost:3, helps:'esports',   flag:'club_gaming',  blurb:'fast reflexes'},
];

// Greek life — 3 fraternities + 3 sororities, each with a vibe and perk
const GREEK=[
  {k:'fra_omega', l:'Omega Chi', emoji:'🏛', kind:'fraternity', vibe:'old-money power network', perk:'connections', stat:'charming'},
  {k:'fra_sig',   l:'Sigma Tau', emoji:'🍺', kind:'fraternity', vibe:'wild party house',        perk:'social',      stat:'happy'},
  {k:'fra_kap',   l:'Kappa Rho', emoji:'📚', kind:'fraternity', vibe:'scholar brotherhood',     perk:'smarts',      stat:'smarts'},
  {k:'sor_delta', l:'Delta Nu',  emoji:'👑', kind:'sorority',   vibe:'elite social circle',     perk:'connections', stat:'charming'},
  {k:'sor_pi',    l:'Pi Beta',   emoji:'🌸', kind:'sorority',   vibe:'spirited and social',     perk:'social',      stat:'happy'},
  {k:'sor_theta', l:'Theta Kai', emoji:'🔬', kind:'sorority',   vibe:'driven academic sisters', perk:'smarts',      stat:'smarts'},
];
// College sports — gateway to the pros or the Olympics
const COLLEGE_SPORTS=[
  {k:'cbb', l:'College Basketball', emoji:'🏀', stat:'athletic', pro:'nba',    proReq:84, olympics:false},
  {k:'cfb', l:'College Football',   emoji:'🏈', stat:'athletic', pro:'nfl',    proReq:84, olympics:false},
  {k:'ctf', l:'College Track',      emoji:'🏃', stat:'athletic', pro:null,     proReq:99, olympics:true},
];

/* education tiers */
const EDU={0:'No degree',1:'Trade / Academy',2:"Bachelor's",3:'Doctorate'};

/* ---------------- state ---------------- */
let G = null;          // current game (lineage + people)
const SAVE_KEY='threadbare_v1';

function blankPerson(opt={}){
  return {
    id: opt.id ?? (G? ++G.idc : 1),
    first: opt.first ?? newFirst(opt.sex),
    last: opt.last ?? pick(LAST),
    sex: opt.sex ?? makeSex(),
    born: opt.born ?? 0,
    age: opt.age ?? 0,
    alive: true,
    gen: opt.gen ?? 1,
    traits: opt.traits ?? [pick(TRAITS).k, pick(TRAITS).k].filter((v,i,a)=>a.indexOf(v)===i),
    stats: opt.stats ?? {
      health:clamp(60+rnd(35)), happy:clamp(55+rnd(35)),
      smarts:clamp(40+rnd(50)), looks:clamp(35+rnd(55)),
      athletic:clamp(30+rnd(60)), fame:0
    },
    edu: 0, major:null,
    job: 'none', jobYears:0, salary:0, jobTitle:null, partTime:null, stress:0,
    retired:false, pension:0, peakSalary:0, careerYears:0, claimedSS:false,
    money: opt.money ?? 0,
    insured:false, insurePremium:0,
    married:false, partnerName:null, partnerId:null,
    partnerHistory:[], // {name, sex, kind:'Spouse'|'Ex-spouse'|'Late spouse'|'Fling', from, to, kids}
    autonomous:false,  // once true, this person lives an offscreen life each year
    orientation:null,  // 'straight'|'gay'|'bi' — set at coming of age
    q:0,               // current quarter of the year (0=Q1 winter ... 3=Q4 autumn)
    citizenship:null,  // country of residence (defaults to birth country)
    ruler:null,        // if they rule a nation: {title, country}
    securityLevel:0,   // 0 normal, 1 max security, 2 superprison (the Vault)
    escapeAttempts:0,  // bribes/escapes tried at current incarceration
    powers:[],         // superpowers (hero/villain)
    powersGained:0,    // new powers acquired this generation (cap = POWERS_PER_GEN)
    nemesis:null,      // {name, defeated} — hero's archenemy
    sidekick:null,     // {name, bond} — hero's partner
    heroRep:0,         // hero reputation / public trust (0-100)
    gadgetLevel:0,     // hero gear/base level — boosts heroics
    livesSaved:0,      // running tally of people saved
    henchman:null,     // {name, loyalty} — villain's named lieutenant
    minions:0,         // size of the villain's crew
    territory:0,       // crime-lord turf controlled (0-100)
    rackets:[],        // active criminal enterprises
    minionPower:0,     // crew capability (0-100), boosts income/escape/evasion
    doomsdayLevel:0,   // 0 none, 1 built, 2 armed, 3 world-threatening
    heat:0,            // villain notoriety/police attention
    acqTraits:[],      // acquired traits (handsome, anxious, genius...) that nudge stats
    prenup:false,      // signed a prenuptial agreement
    rels: opt.rels ?? [],   // {name,kind,sex,bond,alive,id}
    childrenIds: [],
    parentIds: opt.parentIds ?? [],
    inSchool:false, schoolLevel:null,
    assets: [],  // {kind:'house'|'car'|'luxury', name, value, year}
    pets: [],    // {name, kind, emoji, bond, age, alive}
    portfolio: {low:0, med:0, high:0}, // invested balances by risk tier
    businesses: [], // {kind, name, value, income}
    socialFollowers: 0, onSocial:false,
    record: [],  // crimes/convictions
    inPrison:false, prisonYears:0,
    prisonRep:0,       // reputation/respect inside (0-100)
    prisonRole:null,   // 'network','shotcaller','warden-favored', etc.
    addiction:null,
    addictions:[],     // [{k,sev}] structured addictions
    pregnant:null,     // {father, conceivedYear, fromAffair, otherParent} while expecting
    conditions:[], // chronic health conditions
    seeds:[],      // delayed consequences {dueAge, kind, data}
    flags:{},      // memory of past choices for branching
    seenEvents:[], // event ids already shown (avoid repeats where desired)
    clubs:[],      // high-school clubs joined
    deathCause:null, deathAge:null,
    log:[],
  };
}

/* ---------------- save / load ---------------- */
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(G)); }catch(e){} }
function load(){ try{ const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

