/* =============================================
   tom' and dom' — script.js
   Main page JavaScript
   ============================================= */

'use strict';

// ── Footer year ──────────────────────────────
const fy = document.getElementById('footerYear');
if (fy) fy.textContent = new Date().getFullYear();

// ── Hamburger / Mobile Nav ───────────────────
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu(open) {
  hamburger.classList.toggle('open', open);
  mobileNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  mobileNav.setAttribute('aria-hidden', !open);
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  toggleMenu(!isOpen);
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

// Close on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
    toggleMenu(false);
  }
});

// ── Navbar scroll styling ────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Hero darkening as you scroll ─────────────
// Hero starts at rgba(10,5,5,0.50). As you scroll through it,
// it progressively darkens to 0.88 (matching dark-section overlay).
const hero = document.getElementById('hero');

function updateHeroOverlay() {
  if (!hero) return;
  const heroH  = hero.offsetHeight;
  const scrollY = window.scrollY;
  // Darken from scroll start (0) to end of hero (heroH)
  const progress = Math.min(Math.max(scrollY / (heroH * 0.75), 0), 1);
  const opacity  = 0.50 + progress * 0.38;  // 0.50 → 0.88
  hero.style.background = `rgba(10,5,5,${opacity.toFixed(3)})`;
}

window.addEventListener('scroll', updateHeroOverlay, { passive: true });
updateHeroOverlay(); // run once on load

// ── Nav search → hero search focus ───────────
const navSearchBtn  = document.getElementById('navSearchBtn');
const heroInput     = document.getElementById('heroInput');

function focusHeroSearch() {
  if (!hero || !heroInput) return;
  hero.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => heroInput.focus(), 400);
}

navSearchBtn.addEventListener('click', focusHeroSearch);

// ── Hero search → poems page ──────────────────
const heroSearchBtn = document.getElementById('heroSearchBtn');

function doHeroSearch() {
  const q = heroInput.value.trim();
  window.location.href = q
    ? `poems.html?q=${encodeURIComponent(q)}`
    : 'poems.html';
}

heroSearchBtn.addEventListener('click', doHeroSearch);
heroInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') doHeroSearch();
});

// ── Contact form ──────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name').trim();
    if (!name) { alert('Please enter your name.'); return; }
    const email = data.get('email').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email.'); return;
    }
    const msg = data.get('message').trim();
    if (!msg) { alert('Please write a message.'); return; }

    // Mailto fallback (works without a backend)
    const mailto = `mailto:anubhavjha@proton.me`
      + `?subject=Message from ${encodeURIComponent(name)}`
      + `&body=${encodeURIComponent(msg + '\n\n— ' + name + ' <' + email + '>')}`;
    window.open(mailto);
    contactForm.reset();
  });
}

// ── Service Worker registration ───────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => console.log('[SW] Registered'))
      .catch(err => console.warn('[SW] Failed:', err));
  });
}
