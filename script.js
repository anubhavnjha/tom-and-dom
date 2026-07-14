/* =========================================================
   tom' and dom' — script.js (Landing Actions)
   ========================================================= */

'use strict';

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const heroInput = document.getElementById('heroInput');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const navSearchBtn = document.getElementById('navSearchBtn');

  // Year dynamic update
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Scroll effect on background legibility overlay
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      document.body.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
      document.body.classList.remove('scrolled');
    }
  });

  // Toggle mobile navigation
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav when clicking any nav link
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Search trigger bridge
  const runSearchBridge = (term) => {
    if (term.trim() !== '') {
      window.location.href = `poems.html?search=${encodeURIComponent(term.trim())}`;
    }
  };

  if (heroSearchBtn && heroInput) {
    heroSearchBtn.addEventListener('click', () => runSearchBridge(heroInput.value));
    heroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runSearchBridge(heroInput.value);
    });
  }

  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => {
      window.location.href = "poems.html?focus=search";
    });
  }
});
