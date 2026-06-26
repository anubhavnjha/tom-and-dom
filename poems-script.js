/* =============================================
   tom' and dom' — poems-script.js
   Poems page: load, search, filter, modal + Live Analytics
   ============================================= */

'use strict';

// ── CONNECT TO FIREBASE ──────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

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

// Tracking variable for current open poem
let currentPoemId = null;
let currentPoemTitle = "";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Tracking variable for current open poem
let currentPoemId = null;
let currentPoemTitle = "";

// Footer year
const fy = document.getElementById('footerYear');
if (fy) fy.textContent = new Date().getFullYear();

// Hamburger
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileLinks = document.querySelectorAll('.mobile-link');
function toggleMenu(open) {
  hamburger.classList.toggle('open', open);
  mobileNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  mobileNav.setAttribute('aria-hidden', !open);
}
hamburger.addEventListener('click', () => toggleMenu(!mobileNav.classList.contains('open')));
mobileLinks.forEach(l => l.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) toggleMenu(false);
});

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Poem data ────────────────────────────────
let allPoems = [];

async function loadPoems() {
  try {
    const res  = await fetch('./data/poems.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return Array.isArray(data.poems) ? data.poems : [];
  } catch (err) {
    console.error('[Poems] Failed to load:', err);
    return [];
  }
}

// ── Render ────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year:'numeric', month:'long', day:'numeric'
    });
  } catch { return iso; }
}

function renderPoems(poems) {
  const grid  = document.getElementById('poemGrid');
  const count = document.getElementById('poemsCount');

  if (poems.length === 0) {
    grid.innerHTML = '<p class="poems-empty">no poems found.</p>';
    count.textContent = '';
    return;
  }

  count.textContent = `${poems.length} poem${poems.length !== 1 ? 's' : ''}`;

  grid.innerHTML = poems.map(p => `
    <article class="poem-card" data-id="${p.id}" tabindex="0" role="button"
             aria-label="Read poem: ${p.title}">
      ${p.date ? `<p class="poem-card-date">${formatDate(p.date)}</p>` : ''}
      <h3 class="poem-card-title">${p.title}</h3>
      <p class="poem-card-excerpt">${p.excerpt || p.content.slice(0, 120) + '…'}</p>
      ${p.tags && p.tags.length
        ? `<div class="poem-card-tags">${p.tags.map(t => `<span class="poem-tag">${t}</span>`).join('')}</div>`
        : ''}
    </article>
  `).join('');

  // Card click listeners
  grid.querySelectorAll('.poem-card').forEach(card => {
    const open = () => openModal(card.dataset.id);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

// ── Search ────────────────────────────────────
const searchInput = document.getElementById('pgSearchInput');
const searchBtn   = document.getElementById('pgSearchBtn');

function doSearch() {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { renderPoems(allPoems); return; }
  const filtered = allPoems.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );
  renderPoems(filtered);
}

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
searchInput.addEventListener('input', doSearch);

const urlQ = new URLSearchParams(window.location.search).get('q');
if (urlQ) {
  searchInput.value = urlQ;
}

document.getElementById('navSearchBtn').addEventListener('click', () => {
  document.getElementById('pgHero').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => searchInput.focus(), 350);
});

// ── Modal & Live Analytics ────────────────────
const modalOverlay = document.getElementById('poemModal');
const modalClose   = document.getElementById('modalClose');
const likeBtn      = document.getElementById('modalLikeBtn');
const likeCountEl  = document.getElementById('modalLikeCount');

function openModal(id) {
  const poem = allPoems.find(p => String(p.id) === String(id));
  if (!poem) return;

  currentPoemId = id;
  currentPoemTitle = poem.title;

  document.getElementById('modalDate').textContent  = poem.date ? formatDate(poem.date) : '';
  document.getElementById('modalTitle').textContent = poem.title;
  document.getElementById('modalBody').textContent  = poem.content;

  const tagsEl = document.getElementById('modalTags');
  tagsEl.innerHTML = (poem.tags || [])
    .map(t => `<span class="poem-tag">${t}</span>`).join('');

  // Update button UI state depending on if the user already clicked like
  if (localStorage.getItem('liked_poem_' + id)) {
    likeBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #e74c3c;"></i> Liked';
    likeBtn.style.borderColor = '#e74c3c';
  } else {
    likeBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Like';
    likeBtn.style.borderColor = '#fff';
  }

  // Live Track Analytics Database references
  const dbCleanKey = "poem_" + id; 
  
  // 1. Log view hit
  runTransaction(ref(db, 'analytics/' + dbCleanKey + '/views'), (currentViews) => {
    return (currentViews || 0) + 1;
  });
  
  // 2. Continuous real-time fetch for current likes string layout 
  onValue(ref(db, 'analytics/' + dbCleanKey + '/likes'), (snapshot) => {
    const totalLikes = snapshot.val() || 0;
    likeCountEl.textContent = `${totalLikes} like${totalLikes !== 1 ? 's' : ''}`;
  });

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

// Global click event logic handler attached to modal layout button
if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    if (!currentPoemId) return;
    
    // Prevent double clicking like exploitation
    if (localStorage.getItem('liked_poem_' + currentPoemId)) {
      return; 
    }

    localStorage.setItem('liked_poem_' + currentPoemId, 'true');
    likeBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #e74c3c;"></i> Liked';
    likeBtn.style.borderColor = '#e74c3c';

    const dbCleanKey = "poem_" + currentPoemId;
    runTransaction(ref(db, 'analytics/' + dbCleanKey + '/likes'), (currentLikes) => {
      return (currentLikes || 0) + 1;
    });
    
    // Save metadata tracking text reference fallback value record entry mapping help structure
    runTransaction(ref(db, 'analytics/' + dbCleanKey + '/title'), () => {
      return currentPoemTitle;
    });
  });
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Init ──────────────────────────────────────
(async () => {
  allPoems = await loadPoems();
  renderPoems(allPoems);
  if (urlQ) doSearch();

  try {
    localStorage.setItem('tom-dom-poems', JSON.stringify(allPoems));
  } catch (_) {}
})();

// Service Worker
// if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => console.log('[SW] Registered'))
      .catch(err => console.warn('[SW] Failed:', err));
  });
}
