"use strict";
/* Threadbare · patch module: 29-events-cooldown-patch.js
   ============================================================
   CATEGORY COOLDOWN  (implements the EXPANDED spec's rule:
   "Characters shouldn't see the same TYPE of event twice in 3 years.")

   The four-track picker (module 14) keeps tracks from crowding each other,
   but with ~150 new events now eligible at once, a single category (say,
   per-power events, or street encounters) could still fire back-to-back and
   drown out everything else. This adds a lightweight per-category memory:
   once an event of a given `cat` fires, other events sharing that `cat` are
   held back for COOLDOWN_YEARS.

   HOW IT HOOKS IN — without editing module 14:
   We wrap the existing `eventEligible(p, ev)` so the picker, the forced-arc
   check, and the queue all respect the cooldown for free. Events opt in by
   adding a `cat:'...'` field (the expanded modules 30–35 all do). Events with
   no `cat` are unaffected — old content behaves exactly as before.

   This module must load AFTER 14-events-picker.js (which defines
   eventEligible) and is safe to load before the expanded content modules.
   ============================================================ */

const COOLDOWN_YEARS = 3;   // spec: "not the same type twice in 3 years"

// Per-life memory of when each category last fired, stored on the person so it
// saves/loads and resets per character. { catName: ageItLastFired }
function _catLog(p){ if(!p._catSeen) p._catSeen={}; return p._catSeen; }

function categoryOnCooldown(p, ev){
  if(!ev || !ev.cat) return false;               // uncategorised → never blocked
  const last = _catLog(p)[ev.cat];
  if(last == null) return false;
  return (p.age - last) < COOLDOWN_YEARS;
}

// Call this right after an expanded event actually fires, to start its cooldown.
// The expanded content invokes it from inside effect() via markCat(p, 'cat').
function markCat(p, cat){ if(p && cat){ _catLog(p)[cat] = p.age; } }

// --- wrap the picker's eligibility so cooldown is enforced everywhere ---
// Guard against double-wrapping if this module is ever loaded twice.
if(typeof eventEligible === 'function' && !eventEligible._cooldownWrapped){
  const _baseEligible = eventEligible;
  // reassign the global (classic-script shared scope, same as module 14)
  eventEligible = function(p, ev){
    if(!_baseEligible(p, ev)) return false;
    if(categoryOnCooldown(p, ev)) return false;
    return true;
  };
  eventEligible._cooldownWrapped = true;
}
