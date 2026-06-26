/* =========================================================
   tom' and dom' — script.js (LIVE BROADCAST & THEME CLIENT)
   ========================================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  "apiKey": "AIzaSyBXRNFclGzJdwkdhfDaP1zbsufdd_RkHBA",
  "authDomain": "tom-and-dom.firebaseapp.com",
  "databaseURL": "https://tom-and-dom-default-rtdb.firebaseio.com",
  "projectId": "tom-and-dom",
  "storageBucket": "tom-and-dom.firebasestorage.app",
  "messagingSenderId": "513490054798",
  "appId": "1:513490054798:web:ef02cfa2be9288fd61a3df",
  "measurementId": "G-F4BSZQ97JM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize listeners when DOM content is fully ready
document.addEventListener("DOMContentLoaded", () => {
  initializeGodModeListeners();
  initializePinnedPoemsSection();
});

/* =========================================================
   FEATURE 8 & 10: ATMOSPHERE & BROADCAST WATCHER
   ========================================================= */
function initializeGodModeListeners() {
  // 1. Watch for Theme Changes Live
  const themeRef = ref(db, 'live_status/current_theme');
  onValue(themeRef, (snapshot) => {
    const activeTheme = snapshot.val() || 'default';
    
    // Clear previous custom atmosphere classes
    document.body.classList.remove('theme-melancholy', 'theme-midnight', 'theme-parchment');
    
    if (activeTheme !== 'default') {
      document.body.classList.add(`theme-${activeTheme}`);
    }
  });

  // 2. Watch for Flash Broadcasts Live
  const broadcastRef = ref(db, 'live_status/flash_broadcast');
  onValue(broadcastRef, (snapshot) => {
    const msg = snapshot.val();
    let broadcastBanner = document.getElementById('globalBroadcastBanner');

    // If no banner element exists on page yet, create it dynamically
    if (!broadcastBanner && msg) {
      broadcastBanner = document.createElement('div');
      broadcastBanner.id = 'globalBroadcastBanner';
      broadcastBanner.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; background: #f1c40f; color: #0d0a09; text-align: center; padding: 12px; font-family: 'IM Fell English', serif; font-size: 1.1rem; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); letter-spacing: 0.05em; transition: all 0.3s ease;";
      document.body.prepend(broadcastBanner);
    }

    if (msg) {
      broadcastBanner.innerHTML = `<i class="fa-solid fa-bullhorn animate-pulse"></i> ${msg}`;
      broadcastBanner.style.display = "block";
      document.body.style.paddingTop = "45px"; // Displace content downwards cleanly
    } else if (broadcastBanner) {
      broadcastBanner.style.display = "none";
      document.body.style.paddingTop = "0px";
    }
  });
}

/* =========================================================
   FEATURE 5: ACCESSIBILITY PINNED POEMS LOADER
   ========================================================= */
function initializePinnedPoemsSection() {
  // Look for a landing spot container right under your introduction section
  // If your HTML container doesn't match this exactly, we'll append it gracefully
  let pinnedWrap = document.getElementById('pinnedPoemsContainer');
  
  if (!pinnedWrap) {
    const introSection = document.querySelector('.intro') || document.querySelector('header');
    if (introSection) {
      pinnedWrap = document.createElement('div');
      pinnedWrap.id = 'pinnedPoemsContainer';
      pinnedWrap.style.cssText = "max-width: 800px; margin: 40px auto; padding: 20px; border-top: 1px solid rgba(247,243,237,0.1);";
      introSection.after(pinnedWrap);
    }
  }

  if (!pinnedWrap) return;

  onValue(ref(db, 'content_library'), (snapshot) => {
    const library = snapshot.val() || {};
    pinnedWrap.innerHTML = ""; // Clear existing blocks

    // Filter down to active pinned assets
    const pinnedKeys = Object.keys(library).filter(key => library[key].isPinned && library[key].status === 'published');

    if (pinnedKeys.length > 0) {
      pinnedWrap.innerHTML = `<h2 style="font-family: 'IM Fell English', serif; margin-bottom: 20px; font-size: 1.5rem; text-align: center; letter-spacing:0.05em;"><i class="fa-solid fa-thumbtack"></i> Featured Verses</h2>`;
      
      const grid = document.createElement('div');
      grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;";

      pinnedKeys.forEach(key => {
        const item = library[key];
        const snippet = item.body.split('\n').slice(0, 3).join('<br>') + '...'; // Show first 3 lines max
        
        grid.innerHTML += `
          <div class="poem-card target-link" data-id="${key}" style="background: rgba(247,243,237,0.03); padding: 20px; border: 1px dashed rgba(247,243,237,0.15); border-radius: 8px; cursor: pointer;">
            <h3 style="font-family: 'IM Fell English', serif; margin-bottom: 5px;">${item.title}</h3>
            <span style="font-size:0.8rem; opacity:0.5; display:block; margin-bottom:12px;">${item.date}</span>
            <p style="font-size: 0.95rem; line-height: 1.6; font-style: italic; opacity: 0.8; margin-bottom: 15px;">${snippet}</p>
            <span style="font-size: 0.85rem; text-decoration: underline; opacity: 0.6;">Read full verse →</span>
          </div>
        `;
      });
      
      pinnedWrap.appendChild(grid);

      // Attach clicks to direct users seamlessly to the dedicated poem reader
      pinnedWrap.querySelectorAll('.poem-card').forEach(card => {
        card.addEventListener('click', () => {
          const targetId = card.getAttribute('data-id');
          window.location.href = `poems.html?id=${targetId}`;
        });
      });
    }
  });
}
