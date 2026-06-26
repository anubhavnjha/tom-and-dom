/* =========================================================
   tom' and dom' — admin-script.js (GOD MODE ENGINE)
   ========================================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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
const auth = getAuth(app);

// Prompt for your secret password immediately
const passwordAttempt = prompt("Enter Admin Password:");

if (!passwordAttempt) {
  alert("Access Denied.");
  window.location.href = "index.html";
} else {
  signInAnonymously(auth)
    .then(() => { verifyAdminClearance(passwordAttempt); })
    .catch(() => { window.location.href = "index.html"; });
}

function verifyAdminClearance(secretKey) {
  const secureRef = ref(db, `secure_gateways/${secretKey}`);

  onValue(secureRef, (snapshot) => {
    const verification = snapshot.val();
    if (verification && verification.authenticated === true) {
      
      // Reveal Admin Interface
      document.getElementById('adminPanel').style.display = "block";
      
      // Initialize System Features
      initializeGodModeControls();
      initializeContentManagement();
      initializeLiveMetrics();

    } else {
      alert("Incorrect Password.");
      window.location.href = "index.html";
    }
  }, () => {
    alert("Incorrect Password.");
    window.location.href = "index.html";
  });
}

/* =========================================================
   CORE FEATURE 1: LIVE GOD-MODE CONTROL ROOM
   ========================================================= */
function initializeGodModeControls() {
  // Theme Switching Hooks
  document.querySelectorAll('.theme-toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
      const selectedTheme = button.getAttribute('data-theme');
      set(ref(db, 'live_status/current_theme'), selectedTheme)
        .then(() => alert(`Site-wide theme changed to: ${selectedTheme.toUpperCase()}`));
    });
  });

  // Flash Broadcast Hooks
  const broadcastInput = document.getElementById('flashMessageInput');
  
  document.getElementById('btnBroadcast').addEventListener('click', () => {
    const msg = broadcastInput.value.trim();
    if(msg !== "") {
      set(ref(db, 'live_status/flash_broadcast'), msg)
        .then(() => { alert("Message broadcasted live to all readers!"); });
    }
  });

  document.getElementById('btnClearBroadcast').addEventListener('click', () => {
    set(ref(db, 'live_status/flash_broadcast'), "")
      .then(() => { broadcastInput.value = ""; alert("Broadcast cleared."); });
  });
}

/* =========================================================
   CORE FEATURE 2: POEM CREATION & DRAFT ENGINE
   ========================================================= */
function initializeContentManagement() {
  const form = document.getElementById('poemCreatorForm');
  
  // Upgrade Submit Button Layout to accommodate draft saving choices
  const formActions = form.querySelector('.btn-submit').parentElement;
  form.querySelector('.btn-submit').remove(); // Clear old single button
  
  const dualButtonsRow = document.createElement('div');
  dualButtonsRow.style.display = "grid";
  dualButtonsRow.style.gridTemplateColumns = "1fr 1fr";
  dualButtonsRow.style.gap = "15px";
  dualButtonsRow.innerHTML = `
    <button type="button" id="btnSaveDraft" class="btn-submit" style="background: rgba(247,243,237,0.15); color: #fff;">Save as Private Draft</button>
    <button type="button" id="btnPublishLive" class="btn-submit">Publish Live Instantly</button>
  `;
  formActions.appendChild(dualButtonsRow);

  // Handle Submissions
  document.getElementById('btnSaveDraft').addEventListener('click', () => handlePoemSubmit('draft'));
  document.getElementById('btnPublishLive').addEventListener('click', () => handlePoemSubmit('published'));

  function handlePoemSubmit(targetStatus) {
    const title = document.getElementById('poemTitle').value.trim();
    const date = document.getElementById('poemDate').value.trim();
    const isPinned = document.getElementById('poemIsPinned').checked;
    const body = document.getElementById('poemBody').value.trim();

    if (!title || !date || !body) {
      alert("Please fill out all poem fields before saving.");
      return;
    }

    // Generate a web-safe ID identifier slug
    const poemId = "poem_" + title.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const poemData = {
      title: title,
      date: date,
      body: body,
      status: targetStatus,
      isPinned: isPinned,
      audio_url: "" // Placeholder for audio upload tracking
    };

    // Save to Content Library Node
    set(ref(db, `content_library/${poemId}`), poemData)
      .then(() => {
        // Create initial placeholder counter variables if new
        update(ref(db, `analytics/${poemId}`), { title: title });
        alert(`Verse successfully saved as [${targetStatus.toUpperCase()}]!`);
        form.reset();
        document.getElementById('poemIsPinned').checked = false;
      })
      .catch(err => alert("Error saving verse: " + err.message));
  }
}

/* =========================================================
   CORE FEATURE 3: LIVE ANALYTICS, COUNTERS & LIFECYCLES
   ========================================================= */
function initializeLiveMetrics() {
  const tableBody = document.getElementById('analyticsTable');

  // Watch Content Library + Analytics Combined
  onValue(ref(db), (snapshot) => {
    const masterData = snapshot.val() || {};
    const content = masterData.content_library || {};
    const stats = masterData.analytics || {};

    // Render Global Platform Cards
    let totalViews = 0;
    let totalLikes = 0;
    let totalPoemsCount = Object.keys(content).filter(k => content[k].status === 'published').length;

    Object.keys(stats).forEach(key => {
      totalViews += (stats[key].views || 0);
      totalLikes += (stats[key].likes || 0);
    });

    document.getElementById('totalViewsCard').innerText = totalViews;
    document.getElementById('totalLikesCard').innerText = totalLikes;
    document.getElementById('totalPoemsCard').innerText = totalPoemsCount;

    // Render Data Administration Lines Table
    tableBody.innerHTML = "";
    const unifiedKeys = Array.from(new Set([...Object.keys(content), ...Object.keys(stats)]));

    if (unifiedKeys.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #bbb;">No records found inside your system architecture.</td></tr>`;
      return;
    }

    unifiedKeys.forEach(id => {
      const info = content[id] || {};
      const stat = stats[id] || {};
      
      const title = info.title || stat.title || id.replace("poem_", "").replace(/_/g, " ");
      const statusLabel = info.status === "draft" ? `<span style="color: #f1c40f; margin-left:10px;">[Draft]</span>` : `<span style="color: #2ecc71; margin-left:10px;">[Live]</span>`;
      const pinLabel = info.isPinned ? ` <i class="fa-solid fa-thumbtack" style="color: #3498db; margin-left:5px;" title="Pinned to Home"></i>` : '';

      const viewCount = stat.views || 0;
      const likeCount = stat.likes || 0;
      const progressCount = stat.completed_reads || 0;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <strong>${title}</strong> ${statusLabel} ${pinLabel}
          <div style="font-size:0.8rem; color:#888; margin-top:4px;">ID: ${id}</div>
        </td>
        <td>
          <div style="display:flex; gap:10px; flex-direction:column;">
            <span class="stat-badge"><i class="fa-regular fa-eye"></i> ${viewCount} views</span>
            <span class="stat-badge" style="color: #e74c3c;"><i class="fa-solid fa-heart"></i> ${likeCount} likes</span>
            <span class="stat-badge" style="color: #3498db;"><i class="fa-solid fa-book-open"></i> ${progressCount} reads complete</span>
          </div>
        </td>
        <td>
          <div class="actions-cell">
            <button class="action-btn toggle-pin-btn" data-id="${id}">${info.isPinned ? 'Unpin' : 'Pin to Home'}</button>
            <button class="action-btn toggle-status-btn" data-id="${id}">${info.status === 'draft' ? 'Go Live' : 'Make Draft'}</button>
            <button class="action-btn btn-delete delete-poem-btn" data-id="${id}">Delete Forever</button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Attach Dynamic Actions to Generated Rows
    attachTableEventInterceptors();
  });
}

function attachTableEventInterceptors() {
  document.querySelectorAll('.toggle-pin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      // Read current state once to flip it safely
      const pinRef = ref(db, `content_library/${id}/isPinned`);
      onValue(pinRef, (snap) => {
        const currentPin = snap.val();
        update(ref(db, `content_library/${id}`), { isPinned: !currentPin });
      }, { onlyOnce: true });
    });
  });

  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const statusRef = ref(db, `content_library/${id}/status`);
      onValue(statusRef, (snap) => {
        const currentStatus = snap.val();
        const nextStatus = currentStatus === 'draft' ? 'published' : 'draft';
        update(ref(db, `content_library/${id}`), { status: nextStatus });
      }, { onlyOnce: true });
    });
  });

  document.querySelectorAll('.delete-poem-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm("Are you absolutely sure you want to permanently erase this poem and all historical analytics attached to it?")) {
        remove(ref(db, `content_library/${id}`));
        remove(ref(db, `analytics/${id}`));
        alert("Verse purged from database library storage.");
      }
    });
  });
}
