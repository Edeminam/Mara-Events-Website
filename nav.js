/* =============================================
   Mara Events — nav.js
   Shared navbar behaviour for all pages
   (navbar scroll-shadow + mobile menu toggle)
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Add / remove the glassmorphism scroll class
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Mobile hamburger toggle
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when any link inside it is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
