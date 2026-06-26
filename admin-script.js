/* =============================================
   tom' and dom' — admin-script.js
   Protected Analytics Dashboard Panel
   ============================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

// Connection config
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

// Custom Password
const SECRET_PASSWORD = "StelaJha@9229"; 

// Prompt right before rendering layouts
const userAttempt = prompt("Enter Administration Password:");

if (userAttempt === SECRET_PASSWORD) {
  // Reveal layout
  document.getElementById('adminPanel').style.display = "block";
  
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  
  loadLiveStats(db);
} else {
  alert("Invalid password. Access denied.");
  window.location.href = "index.html";
}

function loadLiveStats(db) {
  const tableBody = document.getElementById('analyticsTable');
  const analyticsRef = ref(db, 'analytics');

  onValue(analyticsRef, (snapshot) => {
    const data = snapshot.val();
    tableBody.innerHTML = ""; 

    if (!data) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #bbb;">No data records found yet.</td></tr>`;
      return;
    }

    Object.keys(data).forEach(poemKey => {
      const record = data[poemKey];
      const displayTitle = record.title || poemKey.replace("poem_", "").replace(/_/g, " ");
      const totalViews = record.views || 0;
      const totalLikes = record.likes || 0;

      const rowHTML = `
        <tr>
          <td><strong>${displayTitle}</strong></td>
          <td><span class="stat-badge">${totalViews} views</span></td>
          <td><span class="stat-badge" style="color: #e74c3c;">❤️ ${totalLikes} likes</span></td>
        </tr>
      `;
      tableBody.innerHTML += rowHTML;
    });
  });
}
