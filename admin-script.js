/* =============================================
   tom' and dom' — admin-script.js
   Password Protected Firebase Analytics Dashboard
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

// 1. Prompt for your secret password immediately
const passwordAttempt = prompt("Enter Admin Password:");

if (!passwordAttempt) {
  alert("Access Denied.");
  window.location.href = "index.html";
} else {
  // 2. Sign in anonymously first
  signInAnonymously(auth)
    .then(() => {
      // 3. Try to read data using the password as the route path
      verifyAndLoadData(passwordAttempt);
    })
    .catch((error) => {
      console.error("Auth failed:", error);
      window.location.href = "index.html";
    });
}

function verifyAndLoadData(secretKey) {
  const tableBody = document.getElementById('analyticsTable');
  
  // Look at the path named after the entered password
  const secureRef = ref(db, `secure_gateways/${secretKey}`);

  onValue(secureRef, (snapshot) => {
    const verificationData = snapshot.val();

    // Check if the validation structure exists and evaluates to true
    if (verificationData && verificationData.authenticated === true) {
      document.getElementById('adminPanel').style.display = "block";
      
      // Load real statistics
      const analyticsRef = ref(db, 'analytics');
      onValue(analyticsRef, (statsSnapshot) => {
        const data = statsSnapshot.val();
        tableBody.innerHTML = ""; 

        if (!data) {
          tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #bbb;">No data records found.</td></tr>`;
          return;
        }

        Object.keys(data).forEach(poemKey => {
          const record = data[poemKey];
          const displayTitle = record.title || poemKey.replace("poem_", "").replace(/_/g, " ");
          tableBody.innerHTML += `
            <tr>
              <td><strong>${displayTitle}</strong></td>
              <td><span class="stat-badge">${record.views || 0} views</span></td>
              <td><span class="stat-badge" style="color: #e74c3c;">❤️ ${record.likes || 0} likes</span></td>
            </tr>
          `;
        });
      });

    } else {
      alert("Incorrect Password.");
      window.location.href = "index.html";
    }
  }, (error) => {
    console.error("Access blocked:", error);
    alert("Incorrect Password.");
    window.location.href = "index.html";
  });
}
