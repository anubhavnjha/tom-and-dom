/* =========================================================
   tom' and dom' — admin-script.js 
   ========================================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
// 1. IMPORT signInWithEmailAndPassword INSTEAD of signInAnonymously
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

// 2. Prompt for both Admin Email and Admin Password
const emailAttempt = prompt("Enter Admin Email:");
const passwordAttempt = prompt("Enter Admin Password:");

if (!emailAttempt || !passwordAttempt) {
  alert("Access Denied.");
  window.location.href = "index.html";
} else {
  // 3. Sign in securely using Firebase Auth
  signInWithEmailAndPassword(auth, emailAttempt, passwordAttempt)
    .then((userCredential) => {
      // If sign-in succeeds, reveal the Admin Panel immediately!
      document.getElementById('adminPanel').style.display = "block";
      
      // Initialize System Features
      initializeGodModeControls();
      initializeContentManagement();
      initializeLiveMetrics();
    })
    .catch((error) => {
      console.error("Auth Error:", error.message);
      alert("Incorrect admin credentials.");
      window.location.href = "index.html";
    });
}

// NOTE: You can completely delete the old verifyAdminClearance() function 
// since Firebase now handles verification natively through the login process!
