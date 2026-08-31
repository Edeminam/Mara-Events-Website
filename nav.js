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

  // ─── MARA ACADEMY TRAINING SCROLL BANNER (ALL PAGES) ───────────────
  function initTrainingScrollBanner() {
    // Check if dismissed in this session
    if (sessionStorage.getItem('mara_training_banner_dismissed') === '1') {
      return;
    }

    let banner = document.getElementById('maraTrainingBanner');
    if (!banner) {
      banner = document.createElement('aside');
      banner.id = 'maraTrainingBanner';
      banner.className = 'mara-training-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Mara Academy Training Announcement');
      banner.innerHTML = `
        <div class="mtb-inner">
          <div class="mtb-icon-wrap" aria-hidden="true">
            <i class="fa-solid fa-bullhorn"></i>
            <span class="mtb-pulse-dot"></span>
          </div>
          <div class="mtb-content">
            <div class="mtb-eyebrow">
              <span class="mtb-badge"><i class="fa-solid fa-bullhorn"></i> Announcement</span>
              <span class="mtb-tag">Mara Academy</span>
            </div>
            <p class="mtb-title">Event Planning &amp; Management Training</p>
            <p class="mtb-sub">6-Week Physical Masterclass in Abuja • ₦80,000</p>
          </div>
          <div class="mtb-actions">
            <a href="https://flutterwave.com/pay/b6egox7yzyeu" target="_blank" rel="noopener noreferrer" class="mtb-btn-register" id="mtbRegisterBtn" aria-label="Register for Mara Events Training">
              <span>Register</span>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button type="button" class="mtb-btn-close" id="mtbCloseBtn" aria-label="Dismiss training announcement">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(banner);
    }

    const closeBtn = document.getElementById('mtbCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        banner.classList.remove('visible');
        sessionStorage.setItem('mara_training_banner_dismissed', '1');
      });
    }

    // Dynamic scroll detection
    let isVisible = false;
    let ticking = false;

    function updateBannerOnScroll() {
      ticking = false;
      if (sessionStorage.getItem('mara_training_banner_dismissed') === '1') {
        if (isVisible) {
          banner.classList.remove('visible');
          isVisible = false;
        }
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // Show after user scrolls down past 260px
      if (scrollY > 260) {
        if (!isVisible) {
          isVisible = true;
          banner.classList.add('visible');
        }
      } else if (scrollY < 80) {
        // Hide when returned to the top of page
        if (isVisible) {
          isVisible = false;
          banner.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateBannerOnScroll);
      }
    }, { passive: true });

    // Initial check in case user loaded page already scrolled
    updateBannerOnScroll();
  }

  // ─── UNIVERSAL TOP ANNOUNCEMENT BAR WITH SCROLL PROGRESS ────────────
  function initTopAnnouncementBar() {
    if (sessionStorage.getItem('mara_top_announcement_dismissed') === '1') {
      return;
    }

    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let topBar = document.getElementById('topAnnouncementBar');
    if (!topBar) {
      topBar = document.createElement('div');
      topBar.id = 'topAnnouncementBar';
      topBar.className = 'top-announcement-bar';
      topBar.setAttribute('role', 'banner');
      topBar.setAttribute('aria-label', 'Mara Academy Training Announcement');

      topBar.innerHTML = `
        <div class="tab-inner">
          <div class="tab-badge-wrap">
            <span class="tab-badge">
              <i class="fa-solid fa-graduation-cap"></i> Mara Academy
            </span>
            <span class="tab-pulse" title="Registration Live"></span>
          </div>
          <div class="tab-marquee-container">
            <div class="tab-marquee-track">
              <span class="tab-msg">
                <strong>📢 Training Announcement:</strong> Master Event Planning &amp; Management — 6-Week Physical Masterclass in Abuja <span class="tab-highlight">Tuition: ₦80,000</span> • Live Hands-on Venue Practice &amp; Certification • Register Now!
              </span>
              <span class="tab-msg" aria-hidden="true">
                <strong>📢 Training Announcement:</strong> Master Event Planning &amp; Management — 6-Week Physical Masterclass in Abuja <span class="tab-highlight">Tuition: ₦80,000</span> • Live Hands-on Venue Practice &amp; Certification • Register Now!
              </span>
            </div>
          </div>
          <div class="tab-actions">
            <a href="https://flutterwave.com/pay/b6egox7yzyeu" target="_blank" rel="noopener noreferrer" class="tab-btn-register" id="tabRegisterBtn" aria-label="Register for Mara Events Training">
              <span>Register</span>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button type="button" class="tab-btn-close" id="tabCloseBtn" aria-label="Close announcement">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="tab-scroll-progress" id="tabScrollProgress"></div>
      `;

      navbar.insertBefore(topBar, navbar.firstChild);
    }

    const progressBar = document.getElementById('tabScrollProgress');
    const closeBtn = document.getElementById('tabCloseBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        topBar.classList.add('dismissed');
        sessionStorage.setItem('mara_top_announcement_dismissed', '1');
      });
    }

    // Scroll Progress Update
    function updateScrollProgress() {
      if (!progressBar) return;
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        progressBar.style.width = scrollPercent + '%';
      }
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // Safe DOM ready execution
  function onReady() {
    initTopAnnouncementBar();
    initNavigation();
    initTrainingScrollBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


