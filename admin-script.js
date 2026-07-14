/* =========================================================
   tom' and dom' — admin-script.js
   ========================================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXRNFclGzJdwkdhfDaP1zbsufdd_RkHBA",
  authDomain: "tom-and-dom.firebaseapp.com",
  databaseURL: "https://tom-and-dom-default-rtdb.firebaseio.com",
  projectId: "tom-and-dom",
  storageBucket: "tom-and-dom.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fetch admin verification code from Realtime Database Console
get(ref(db, 'admin_password')).then((snapshot) => {
  const secretKey = snapshot.val() || "StelaJha9229"; // fallback backup password
  
  const attempt = prompt("Enter Administrative Verification Code:");
  if (attempt === secretKey) {
    document.getElementById("adminBox").style.display = "block";
  } else {
    alert("Incorrect entry code! Return to homepage.");
    window.location.href = "index.html";
  }
}).catch(() => {
  // If connection parameters are slow, use secure local validation check
  const attempt = prompt("Database offline. Enter Administrative Verification Code:");
  if (attempt === "StelaJha9229") {
    document.getElementById("adminBox").style.display = "block";
  } else {
    alert("Access Denied.");
    window.location.href = "index.html";
  }
});

// Upload form submission parsing
document.getElementById('btnPublish').addEventListener('click', () => {
  const type = document.getElementById('contentType').value;
  const title = document.getElementById('postTitle').value.trim();
  const date = document.getElementById('postDate').value.trim();
  const body = document.getElementById('postBody').value.trim();

  if (!title || !body) {
    alert("Title and Body components are required to publish!");
    return;
  }

  const generatedId = "node_" + Date.now();

  set(ref(db, `${type}/${generatedId}`), {
    title: title,
    date: date,
    body: body,
    views: 0,
    likes: 0
  }).then(() => {
    alert("Published successfully!");
    document.getElementById('postTitle').value = "";
    document.getElementById('postDate').value = "";
    document.getElementById('postBody').value = "";
  }).catch((err) => {
    alert("Upload failed: " + err.message);
  });
});
