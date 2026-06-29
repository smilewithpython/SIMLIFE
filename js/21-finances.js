"use strict";
/* Threadbare · split module: 21-finances.js  (lines 6768–6861 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   FINANCES PANEL — portfolio, businesses, luxury
   ============================================================ */
function openFinances(){
  const p=me();
  if(p.age<18){
    sheet(`<div class="grab"></div><h3>Finances</h3><p class="hint">${p.first} is too young to manage money. Come back at 18.</p>`);
    return;
  }
  const port=p.portfolio||{low:0,med:0,high:0};
  const invested=(port.low||0)+(port.med||0)+(port.high||0);
  const assetVal=p.assets.reduce((s,a)=>s+(a.value||0),0);
  const bizVal=(p.businesses||[]).reduce((s,b)=>s+(b.value||0),0);
  const net=p.money+invested+assetVal+bizVal;
  let html=`<div class="grab"></div><h3>${p.first}'s finances</h3>
  <p class="hint">Cash ${money(p.money)} · Invested ${money(invested)} · Net worth ${money(net)}</p>`;
  const opts=[];

  // PORTFOLIO
  opts.push(OH('— Investment portfolio —'));
  const tiers=[
    ['low','🛡 Low risk · bonds','~4%/yr, steady',0.25],
    ['med','📊 Medium risk · index funds','~8%/yr, some swings',0.35],
    ['high','🚀 High risk · startups & crypto','~16%/yr, wild swings',0.5],
  ];
  tiers.forEach(([k,label,desc,frac])=>{
    const bal=port[k];
    opts.push(`<div style="padding:11px 20px;border-top:1px solid var(--line)">
      <div style="font-size:14px">${label} <span style="color:var(--gold);float:right">${money(bal)}</span></div>
      <div style="font-size:12px;color:var(--ink-dim);margin:3px 0 8px">${desc}</div>
      <div style="display:flex;gap:6px">
        <button class="act" style="flex:1;padding:8px;font-size:11px" data-buy="${k}">Invest ${money(Math.floor(p.money*frac))}</button>
        ${bal>0?`<button class="act" style="flex:1;padding:8px;font-size:11px" data-sell="${k}">Cash out</button>`:''}
      </div>
    </div>`);
  });

  // BUSINESSES (data-driven so it's easy to own a real portfolio)
  opts.push(OH('— Own a business —'));
  const BIZ=[
    {kind:'foodtruck', e:'🚚', name:'Food Truck',        cost:35000,  income:9000,  blurb:'small but scrappy'},
    {kind:'laundromat',e:'🧺', name:'Laundromat',        cost:60000,  income:13000, blurb:'quiet cash machine'},
    {kind:'restaurant',e:'🍽', name:'Restaurant',        cost:90000,  income:22000, blurb:'steady, reputation-driven'},
    {kind:'rental',    e:'🏢', name:'Rental Property',    cost:140000, income:14000, blurb:'passive rent'},
    {kind:'gym',       e:'🏋', name:'Gym Franchise',      cost:170000, income:30000, blurb:'memberships add up'},
    {kind:'carwash',   e:'🚗', name:'Car Wash Chain',     cost:210000, income:36000, blurb:'rain or shine'},
    {kind:'casino',    e:'🎰', name:'Online Casino',      cost:250000, income:60000, blurb:'big, risky income'},
    {kind:'brewery',   e:'🍺', name:'Craft Brewery',      cost:300000, income:48000, blurb:'trendy margins'},
    {kind:'hotel',     e:'🏨', name:'Boutique Hotel',     cost:600000, income:95000, blurb:'prestige and profit'},
    {kind:'techco',    e:'💻', name:'Tech Startup',       cost:500000, income:120000,blurb:'high risk, high reward'},
    {kind:'vineyard',  e:'🍷', name:'Vineyard',           cost:850000, income:110000,blurb:'old-money income'},
    {kind:'sportsteam',e:'🏟', name:'Pro Sports Team',    cost:5000000,income:700000,blurb:'a billionaire\'s toy'},
  ];
  BIZ.forEach(b=>{
    if(!(p.businesses||[]).some(x=>x.kind===b.kind)){
      opts.push(O(b.e,b.name,p.money>=b.cost?`${money(b.cost)} · ${b.blurb}`:`needs ${money(b.cost)}`,0,()=>{
        p.money-=b.cost; p.businesses.push({kind:b.kind,name:b.name,value:b.cost,income:b.income}); closeSheet();
        log(`${p.first} acquired ${b.name}. ${money(b.income)}/yr if it goes well.`,'big'); render();
      }, p.money<b.cost));
    }
  });
  (p.businesses||[]).forEach((b,i)=>{
    opts.push(O('💼',`Sell ${b.name}`,`worth ${money(b.value)}`,0,()=>{
      p.money+=(b.value||0); p.businesses.splice(i,1); closeSheet();
      log(`${p.first} sold ${b.name} for ${money(b.value)}.`,'good'); render();
    }));
  });

  // LUXURY
  opts.push(OH('— Luxury & lifestyle —'));
  [['🏝','Private island','luxury',2500000],['🛥','Yacht','luxury',900000],['🚁','Helicopter','luxury',1200000],
   ['🏎','Supercar','car',300000],['🚐','Luxury RV','luxury',180000],['💎','Fine jewelry','luxury',60000],
   ['🎨','Art collection','luxury',450000],['⌚','Luxury watch collection','luxury',120000],['🐎','Racehorse','luxury',350000],
   ['✈️','Private jet','luxury',8000000],['🏰','Countryside estate','luxury',3500000],['🏍','Custom motorcycle','car',90000]].forEach(([ic,nm,kind,price])=>{
    opts.push(O(ic,nm,p.money>=price?`${money(price)} · +joy, status`:`needs ${money(price)}`,0,()=>{
      p.money-=price; p.assets.push({kind,name:nm,value:Math.round(price*0.8),year:G.year}); p.stats.happy=clamp(p.stats.happy+10); closeSheet();
      log(`${p.first} acquired ${nm.toLowerCase().match(/^(a|an|the)\b/)?nm.toLowerCase():'a '+nm.toLowerCase()}. Pure indulgence.`,'big'); render();
    }, p.money<price));
  });

  sheet(html+opts.join(''), sh=>{
    bindOpts(sh);
    sh.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.buy; const frac={low:0.25,med:0.35,high:0.5}[k]; const amt=Math.floor(p.money*frac);
      if(amt<100){ closeSheet(); log(`${p.first} doesn't have enough to invest.`,'muted'); render(); return; }
      p.money-=amt; p.portfolio[k]+=amt; closeSheet(); log(`${p.first} invested ${money(amt)} in ${k==='low'?'bonds':k==='med'?'index funds':'high-risk bets'}.`,'good'); render();
    });
    sh.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.sell; const amt=p.portfolio[k]; p.money+=amt; p.portfolio[k]=0; closeSheet();
      log(`${p.first} cashed out ${money(amt)} from ${k} risk holdings.`,'good'); render();
    });
  });
}

