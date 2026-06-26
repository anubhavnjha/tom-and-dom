/* =============================================
   tom' and dom' — admin-script.js
   Protected Analytics Dashboard Panel
   ============================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

// Securely sign in behind the scenes
signInAnonymously(auth)
  .catch((error) => {
    console.error("Authentication failed:", error);
    document.getElementById('analyticsTable').innerHTML = `<tr><td colspan="3" style="text-align: center; color: #e74c3c;">Access Denied.</td></tr>`;
  });

// Only load data if the user is authenticated successfully
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Reveal layout container
    document.getElementById('adminPanel').style.display = "block";
    loadLiveStats(db);
  } else {
    window.location.href = "index.html";
  }
});

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
  }, (error) => {
    console.error("Database read blocked:", error);
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #e74c3c;">Permission denied by security rules.</td></tr>`;
  });
}
