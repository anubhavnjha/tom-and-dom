import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

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

// The simple password check you requested
const pass = prompt("Enter Admin Password:");
if (pass === "StelaJha9229") {
  document.getElementById("uploadForm").style.display = "block";
} else {
  alert("Incorrect password. Access denied.");
  window.location.href = "index.html";
}

// Upload Logic
document.getElementById('publishBtn').addEventListener('click', () => {
  const type = document.getElementById('contentType').value;
  const title = document.getElementById('postTitle').value.trim();
  const date = document.getElementById('postDate').value.trim();
  const body = document.getElementById('postBody').value.trim();

  if (!title || !body) {
    alert("Please fill out the title and body.");
    return;
  }

  const uniqueId = "doc_" + Date.now();
  
  set(ref(db, `${type}/${uniqueId}`), {
    title: title,
    date: date,
    body: body,
    views: 0,
    likes: 0
  }).then(() => {
    alert("Successfully published!");
    document.getElementById('postTitle').value = '';
    document.getElementById('postBody').value = '';
  }).catch((error) => {
    alert("Error saving to database: " + error.message);
  });
});
