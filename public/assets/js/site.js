/* =============================================
   Mara Events — site.js
   Behaviour shared by every page:
     1. Scroll-reveal animations
     2. Smooth scrolling for in-page links
     3. Floating WhatsApp button
     4. Image right-click / drag protection
   Page-specific code lives in its own file (home.js, gallery.js, ...).
   ============================================= */

'use strict';

(function () {
  const BUSINESS_WHATSAPP = '2349011046473'; // international format, no +
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ─── 1. SCROLL REVEAL ───────────────────────────────────────────────
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.about-us-inner, .event-card, .testimonial-slider, .book-inner, .footer-top'
    );
    if (!targets.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Stagger direct children so a block builds in rather than popping in at once
        entry.target.querySelectorAll(':scope > *').forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 60);
        });
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    targets.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // ─── 2. SMOOTH IN-PAGE SCROLLING ────────────────────────────────────
  // Offsets the fixed navbar (and the announcement bar when it is showing).
  function initSmoothAnchors() {
    const navbar = document.getElementById('navbar');

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        if (id === '#hero') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const topBar = document.getElementById('topAnnouncementBar');
        const topBarHeight = topBar && !topBar.classList.contains('dismissed') ? topBar.offsetHeight : 0;
        const offset = (navbar ? navbar.offsetHeight : 68) + topBarHeight + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    });
  }

  // ─── 3. FLOATING WHATSAPP BUTTON ────────────────────────────────────
  // On pages with a full-screen hero it appears once the hero is scrolled past.
  function initWhatsAppButton() {
    const message = encodeURIComponent("Hello! I'd like to book an event with Mara Events.");
    const btn = document.createElement('a');
    btn.href = `https://wa.me/${BUSINESS_WHATSAPP}?text=${message}`;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'wa-btn';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML = `
      <span class="wa-icon">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#fff" d="M16 3C8.832 3 3 8.832 3 16c0 2.34.636 4.614 1.842 6.596L3 29l6.587-1.83A12.94 12.94 0 0016 29c7.168 0 13-5.832 13-13S23.168 3 16 3z"/>
          <path fill="#25D366" d="M16 5c-6.065 0-11 4.935-11 11 0 2.13.614 4.18 1.778 5.943l.3.466-1.233 4.51 4.637-1.213.452.268A10.944 10.944 0 0016 27c6.065 0 11-4.935 11-11S22.065 5 16 5z"/>
          <path fill="#fff" d="M21.6 18.8c-.3-.15-1.763-.87-2.037-.968-.273-.1-.472-.15-.672.15-.198.3-.771.968-.945 1.168-.173.2-.347.224-.647.074-.3-.15-1.267-.467-2.413-1.489-.891-.795-1.493-1.776-1.668-2.076-.174-.3-.018-.462.132-.61.134-.132.3-.347.448-.52.148-.175.198-.3.298-.498.1-.2.05-.375-.025-.524-.075-.15-.672-1.62-.921-2.218-.242-.583-.488-.503-.672-.512l-.572-.01c-.2 0-.523.074-.797.374-.273.3-1.045 1.021-1.045 2.49s1.07 2.888 1.22 3.087c.149.2 2.105 3.212 5.1 4.502.713.307 1.27.49 1.703.628.716.228 1.368.195 1.883.118.575-.085 1.763-.72 2.012-1.415.248-.695.248-1.292.173-1.417-.074-.124-.273-.198-.572-.347z"/>
        </svg>
      </span>
      <span class="wa-label">Chat with us</span>`;
    document.body.appendChild(btn);

    const hero = document.getElementById('hero');
    if (!hero) {
      btn.classList.add('visible');
      return;
    }

    let visible = false;
    let ticking = false;
    const update = () => {
      ticking = false;
      const pastHero = hero.getBoundingClientRect().bottom <= 0;
      if (pastHero === visible) return;
      visible = pastHero;
      btn.classList.toggle('visible', visible);
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ─── 4. IMAGE PROTECTION ────────────────────────────────────────────
  // Discourages casual saving of event photos (right-click and drag).
  function initImageProtection() {
    const protectedArea = (el) =>
      el.tagName === 'IMG' || el.closest('.gallery-grid, .gallery-teaser-grid, .gallery-lightbox');

    document.addEventListener('contextmenu', (e) => {
      if (protectedArea(e.target)) e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
  }

  function init() {
    initScrollReveal();
    initSmoothAnchors();
    initWhatsAppButton();
    initImageProtection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
