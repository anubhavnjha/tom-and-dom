/* =========================================================
   tom' and dom' — poems-script.js (Database Bridge)
   ========================================================= */

'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXRNFclGzJdwkdhfDaP1zbsufdd_RkHBA",
  authDomain: "tom-and-dom.firebaseapp.com",
  databaseURL: "https://tom-and-dom-default-rtdb.firebaseio.com",
  projectId: "tom-and-dom",
  storageBucket: "tom-and-dom.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let loadedPoems = {};
let activePoemKey = null;

const container = document.getElementById('poemsContainer');
const searchField = document.getElementById('poemsSearch');
const modal = document.getElementById('poemModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalBody = document.getElementById('modalBody');
const likeBtn = document.getElementById('likeBtn');
const likeCounter = document.getElementById('likeCounter');

// Fetch Live Realtime Database Content
onValue(ref(db, 'poems'), (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    container.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No verses published yet.</p>`;
    return;
  }
  loadedPoems = data;
  renderPoemsGrid("");
});

// Render the elements cleanly
function renderPoemsGrid(filterTerm) {
  container.innerHTML = "";
  const lowercaseFilter = filterTerm.toLowerCase();
  
  // Reverse sorting to show latest uploaded content first
  const keys = Object.keys(loadedPoems).reverse();
  let matches = 0;

  keys.forEach(key => {
    const item = loadedPoems[key];
    const matchesTitle = item.title.toLowerCase().includes(lowercaseFilter);
    const matchesBody = item.body.toLowerCase().includes(lowercaseFilter);

    if (matchesTitle || matchesBody) {
      matches++;
      const card = document.createElement('div');
      card.className = 'content-card';
      card.innerHTML = `
        <h3 class="card-title">${item.title}</h3>
        <span class="card-date">${item.date || 'Undated'}</span>
        <p class="card-snippet">${item.body.split('\n').slice(0, 3).join('<br>')}...</p>
        <div class="card-stats">
          <span><i class="fa-regular fa-eye"></i> ${item.views || 0} views</span>
          <span><i class="fa-regular fa-heart"></i> ${item.likes || 0} likes</span>
        </div>
      `;
      // Open viewer modal on click
      card.addEventListener('click', () => openReaderModal(key, item));
      container.appendChild(card);
    }
  });

  if (matches === 0) {
    container.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No matching verses found.</p>`;
  }
}

// Open Viewer Modal and record analytical views increment
function openReaderModal(key, item) {
  activePoemKey = key;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date || 'Undated';
  modalBody.textContent = item.body;
  likeCounter.textContent = `${item.likes || 0} likes`;
  
  // Track viewer view count increment
  const updatedViews = (item.views || 0) + 1;
  update(ref(db, `poems/${key}`), { views: updatedViews });

  modal.classList.add('open');
}

// Close Modal
closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('open');
  activePoemKey = null;
});

// Handle Like Interaction with immediate Database Update
likeBtn.addEventListener('click', () => {
  if (activePoemKey && loadedPoems[activePoemKey]) {
    const currentLikes = loadedPoems[activePoemKey].likes || 0;
    const incrementedLikes = currentLikes + 1;
    
    update(ref(db, `poems/${activePoemKey}`), { likes: incrementedLikes });
    
    // Disable action button styling after clicked once
    likeCounter.textContent = `${incrementedLikes} likes`;
    likeBtn.style.opacity = "0.5";
    likeBtn.style.pointerEvents = "none";
  }
});

// Live Search bridge execution
searchField.addEventListener('input', (e) => {
  renderPoemsGrid(e.target.value);
});

// Capture URL redirect query if sent from the Front Page Search
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchVal = urlParams.get('search');
  const focusParam = urlParams.get('focus');
  
  if (searchVal) {
    searchField.value = searchVal;
    renderPoemsGrid(searchVal);
  }
  if (focusParam === 'search') {
    searchField.focus();
  }
});
