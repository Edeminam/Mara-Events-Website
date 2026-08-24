/* =============================================
   Mara Events — nav.js
   Universal Navbar & Dynamic Mobile Menu Controller
   Works across all pages seamlessly
   ============================================= */

'use strict';

(function () {
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navbar || !navToggle || !mobileMenu) return;

    // Create or find backdrop element
    let backdrop = document.getElementById('navBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'navBackdrop';
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    let isMenuOpen = false;

    // --- Dynamic Scroll Glassmorphism Controller ---
    function updateScrollState() {
      if (!isMenuOpen) {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          // If page has a static scrolled class in HTML on subpages, check if we keep or remove
          // On non-home pages, we can keep scrolled or toggle based on scroll
          navbar.classList.remove('scrolled');
        }
      }
    }

    // Initialize scroll state
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    }
    window.addEventListener('scroll', updateScrollState, { passive: true });

    // --- Open / Close Menu Handlers ---
    function openMenu() {
      isMenuOpen = true;
      navbar.classList.add('menu-open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      backdrop.classList.add('active');
      document.body.classList.add('nav-open');
    }

    function closeMenu() {
      if (!isMenuOpen) return;
      isMenuOpen = false;
      navbar.classList.remove('menu-open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('active');
      document.body.classList.remove('nav-open');
      updateScrollState();
    }

    function toggleMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Toggle button click
    navToggle.addEventListener('click', toggleMenu);

    // Close when tapping backdrop
    backdrop.addEventListener('click', closeMenu);

    // Close when clicking any link inside mobile menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        // Small timeout so anchor jump or navigation starts smoothly
        setTimeout(closeMenu, 150);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Close on window resize to desktop breakpoint (>768px)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && isMenuOpen) {
          closeMenu();
        }
      }, 100);
    }, { passive: true });

    // Close when clicking outside of navbar & menu
    document.addEventListener('click', (e) => {
      if (isMenuOpen && !navbar.contains(e.target) && !backdrop.contains(e.target)) {
        closeMenu();
      }
    });

    // --- Active Link Indicator ---
    try {
      const currentPath = window.location.pathname.toLowerCase();
      const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
      
      const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const cleanHref = href.split('#')[0].split('?')[0].toLowerCase();
        const hrefFile = cleanHref.substring(cleanHref.lastIndexOf('/') + 1);

        if (hrefFile && (hrefFile === currentFile || (currentFile === '' && hrefFile === 'index.html'))) {
          // If it's not a CTA button or in-page hash
          if (!link.classList.contains('nav-cta') && !link.classList.contains('mobile-cta') && !href.startsWith('#')) {
            link.classList.add('active');
          }
        }
      });
    } catch (err) {
      // Non-critical active link detection
    }
  }

  // Safe DOM ready execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
