"use strict";
/* Threadbare · split module: 08-events-effect-helpers.js  (lines 1961–1986 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   INTERACTIVE CHOICE EVENTS
   A choice event = { id, emoji, title, body(p), when(p)->bool,
     weight, once, choices:[ {label, sub?, need?(p), effect(p)} ] }
   effect returns optional string log; may set flags & plant seeds.
   ============================================================ */

// --- effect helpers usable inside choices ---
function fx(p, o){ // apply a bundle of stat/money changes, return summary
  if(o.health!=null) p.stats.health=clamp(p.stats.health+o.health);
  if(o.happy!=null)  p.stats.happy =clamp(p.stats.happy +o.happy);
  if(o.smarts!=null) p.stats.smarts=clamp(p.stats.smarts+o.smarts);
  if(o.looks!=null)  p.stats.looks =clamp(p.stats.looks +o.looks);
  if(o.athletic!=null)p.stats.athletic=clamp(p.stats.athletic+o.athletic);
  if(o.fame!=null)   p.stats.fame  =clamp(p.stats.fame  +o.fame);
  if(o.stress!=null) p.stress=clamp(p.stress+o.stress);
  if(o.money!=null)  p.money += o.money;
}
function seed(p, dueInYears, kind, data){ p.seeds.push({dueAge:p.age+dueInYears, kind, data:data||{}}); }
function setFlag(p,k,v=true){ p.flags[k]=v; }
function hasFlag(p,k){ return !!p.flags[k]; }
function clearFlag(p,k){ if(p.flags) delete p.flags[k]; }
function addFriend(p, kind='Friend'){ const sx=makeSex(); const f={name:newFirst(sx)+' '+pick(LAST),kind,sex:sx,bond:45+rnd(30),alive:true,id:nid()}; p.rels.push(f); return f; }
function bestFriend(p){ const fs=p.rels.filter(r=>r.kind==='Friend'&&r.alive); return fs.length?fs.sort((a,b)=>b.bond-a.bond)[0]:null; }

// --- the event bank ---
