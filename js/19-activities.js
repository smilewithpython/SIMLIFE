"use strict";
/* Threadbare · split module: 19-activities.js  (lines 5853–5891 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   ACTIVITIES PANEL  (jobs, school, fun, crime, etc)
   ============================================================ */
// ===== VILLAIN: pick a specific heist target (payouts scale with net worth) =====
function openHeistMenu(p){
  closeSheet();
  const net=Math.max(0,p.money);
  const targets=[
    {e:'🏪',n:'Corner store',          min:1000000,  pct:0.05, heat:6,  diff:5,  need:0},
    {e:'🏦',n:'Bank vault',            min:1000000,  pct:0.10, heat:14, diff:14, need:0},
    {e:'💎',n:'Jewelry exchange',      min:2000000,  pct:0.14, heat:18, diff:18, need:0},
    {e:'🏛',n:'Federal reserve',       min:5000000,  pct:0.20, heat:28, diff:26, need:4},
    {e:'🚂',n:'Armored gold train',    min:8000000,  pct:0.25, heat:30, diff:30, need:6},
    {e:'🏝',n:'Offshore data-bank',    min:20000000, pct:0.35, heat:35, diff:34, need:10, smarts:75},
    {e:'🌐',n:'Global crypto exchange',min:40000000, pct:0.50, heat:40, diff:40, need:14, smarts:80},
  ];
  const opts=[];
  targets.forEach(t=>{
    const locked = (p.minions||0)<t.need || (t.smarts && p.stats.smarts<t.smarts);
    let take=Math.max(t.min, Math.round(net*t.pct));
    if(p.doomsdayLevel>=2) take=Math.round(take*1.8);
    const sub = locked ? (t.smarts&&p.stats.smarts<t.smarts?`needs smarts ${t.smarts}+`:`needs ${t.need}+ minions`) : `~${money(take)} · heat +${t.heat}`;
    opts.push(O(t.e,t.n,sub,0,()=>{ closeSheet();
      const botch=chance(Math.max(4, t.diff - (p.minionPower||0)/4));
      let got=take;
      if(botch){ got=Math.round(take*0.25); p.heat=(p.heat||0)+t.heat+15; p.stats.health=clamp(p.stats.health-10);
        if((p.minions||0)>0 && chance(40)){ p.minions--; log(`The ${t.n.toLowerCase()} job went sideways — ${p.first} escaped with ${money(got)}, lost a crew member, and drew serious heat.`,'bad'); }
        else log(`The ${t.n.toLowerCase()} job went loud — only ${money(got)} and a lot of heat.`,'bad');
      } else {
        p.heat=(p.heat||0)+t.heat; p.stats.fame=clamp(p.stats.fame+4);
        log(`${p.first} hit the ${t.n.toLowerCase()} for ${money(got)}.${(p.minions||0)>0?' The crew executed flawlessly.':''}`,'big');
      }
      p.money+=got; render();
    }, locked));
  });
  let html=`<div class="grab"></div><h3>Choose a target</h3><p class="hint">Bigger scores need a bigger crew. Payouts scale with your empire.</p>`;
  sheet(html+opts.join(''), sh=>bindOpts(sh));
}

