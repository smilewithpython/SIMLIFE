"use strict";
/* Threadbare · split module: 26-boot.js  (lines 7658–7663 of the original single-file build; see CODEBASE_STRUCTURE.md) */
/* ============================================================
   GO
   ============================================================ */
window.addEventListener('load',()=>{ bootScreen(); });
// safety: re-render if returning
document.addEventListener('visibilitychange',()=>{ if(!document.hidden && G && me()) render(); });
