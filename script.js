/* =============================================
   MARA EVENTS — script.js
   ============================================= */

"use strict";

// document.addEventListener('DOMContentLoaded', () => {

//   // ─── NAVBAR ───────────────────────────────────
//   const navbar   = document.getElementById('navbar');
//   const navToggle = document.getElementById('navToggle');
//   const mobileMenu = document.getElementById('mobileMenu');

//   window.addEventListener('scroll', () => {
//     navbar.classList.toggle('scrolled', window.scrollY > 20);
//   }, { passive: true });

//   navToggle.addEventListener('click', () => {
//     const isOpen = mobileMenu.classList.toggle('open');
//     navToggle.classList.toggle('open', isOpen);
//     navToggle.setAttribute('aria-expanded', isOpen);
//   });

//   // Close mobile menu on link click
//   mobileMenu.querySelectorAll('a').forEach(link => {
//     link.addEventListener('click', () => {
//       mobileMenu.classList.remove('open');
//       navToggle.classList.remove('open');
//     });
//   });

//   /* ── 1. NAVBAR — scroll-aware style + mobile toggle ────────── */
//   (function initNavbar () {
//     const navbar     = $('#navbar');
//     const navToggle  = $('#navToggle');
//     const mobileMenu = $('#mobileMenu');
//     if (!navbar) return;
 
//     // Scrolled class
//     const onScroll = () => {
//       navbar.classList.toggle('scrolled', window.scrollY > 60);
//     };
//     window.addEventListener('scroll', onScroll, { passive: true });
//     onScroll();
 
//     // Mobile toggle
//     navToggle?.addEventListener('click', () => {
//       const open = mobileMenu.classList.toggle('open');
//       navToggle.setAttribute('aria-expanded', open);
//       // Animate hamburger → X
//       const spans = $$('span', navToggle);
//       if (open) {
//         spans[0].style.transform = 'translateY(7px) rotate(45deg)';
//         spans[1].style.opacity = '0';
//         spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
//       } else {
//         spans.forEach(s => (s.style.transform = s.style.opacity = ''));
//       }
//     });
 
//     // Close mobile menu on link click
//     $$('a', mobileMenu).forEach(a => {
//       a.addEventListener('click', () => {
//         mobileMenu.classList.remove('open');
//         navToggle.setAttribute('aria-expanded', 'false');
//         const spans = $$('span', navToggle);
//         spans.forEach(s => (s.style.transform = s.style.opacity = ''));
//       });
//     });
//   })();

//   // ─── TESTIMONIAL SLIDER ───────────────────────
//   const track    = document.getElementById('testimonialTrack');
//   const dots     = document.querySelectorAll('.t-dot');
//   const prevBtn  = document.getElementById('prevBtn');
//   const nextBtn  = document.getElementById('nextBtn');
//   const cards    = track ? track.querySelectorAll('.testimonial-card') : [];
//   let current    = 0;
//   let autoSlide;

//   function goTo(index) {
//     current = (index + cards.length) % cards.length;
//     track.style.transform = `translateX(-${current * 100}%)`;
//     dots.forEach((d, i) => d.classList.toggle('active', i === current));
//   }

//   if (track && cards.length) {
//     prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
//     nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
//     dots.forEach(d => {
//       d.addEventListener('click', () => { goTo(+d.dataset.index); resetAuto(); });
//     });

//     function startAuto() {
//       autoSlide = setInterval(() => goTo(current + 1), 5000);
//     }
//     function resetAuto() {
//       clearInterval(autoSlide);
//       startAuto();
//     }
//     startAuto();

//     // Touch / swipe support
//     let startX = 0;
//     track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
//     track.addEventListener('touchend', e => {
//       const diff = startX - e.changedTouches[0].clientX;
//       if (Math.abs(diff) > 40) {
//         diff > 0 ? goTo(current + 1) : goTo(current - 1);
//         resetAuto();
//       }
//     });
//   }

//   // ─── SCROLL REVEAL ────────────────────────────
//   const revealEls = document.querySelectorAll(
//     'section > .container, .hero-content, .mission-inner, .partners-scroll, .pricing-grid, .team-grid, .book-inner, .footer-top'
//   );

//   revealEls.forEach(el => el.classList.add('reveal'));

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry, i) => {
//       if (entry.isIntersecting) {
//         // Stagger children
//         const children = entry.target.querySelectorAll(':scope > *');
//         children.forEach((child, idx) => {
//           setTimeout(() => child.classList.add('visible'), idx * 60);
//         });
//         entry.target.classList.add('visible');
//         observer.unobserve(entry.target);
//       }
//     });
//   }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

//   revealEls.forEach(el => observer.observe(el));

//   // Also reveal individual cards
//   document.querySelectorAll('.event-card, .team-card, .pricing-card, .testimonial-card').forEach(el => {
//     el.classList.add('reveal');
//     observer.observe(el);
//   });

//   // ─── BOOKING FORM ─────────────────────────────
//   const form = document.getElementById('bookForm');
//   if (form) {
//     form.addEventListener('submit', e => {
//       e.preventDefault();
//       const btn = form.querySelector('.form-submit');
//       btn.textContent = '✓ Booking Confirmed!';
//       btn.style.background = '#4a8a54';
//       btn.style.color = '#fff';

//       setTimeout(() => {
//         btn.textContent = 'Book an Event';
//         btn.style.background = '';
//         btn.style.color = '';
//         form.reset();
//       }, 3500);
//     });
//   }

//   // ─── SMOOTH ANCHOR SCROLL ─────────────────────
//   document.querySelectorAll('a[href^="#"]').forEach(link => {
//     link.addEventListener('click', e => {
//       const targetId = link.getAttribute('href');
//       if (targetId === '#') return;
//       const target = document.querySelector(targetId);
//       if (target) {
//         e.preventDefault();
//         const offset = navbar.offsetHeight + 16;
//         const top = target.getBoundingClientRect().top + window.scrollY - offset;
//         window.scrollTo({ top, behavior: 'smooth' });
//       }
//     });
//   });

//   // ─── PARALLAX HERO ────────────────────────────
//   const heroBg = document.querySelector('.hero-bg');
//   if (heroBg) {
//     window.addEventListener('scroll', () => {
//       if (window.scrollY < window.innerHeight) {
//         heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
//       }
//     }, { passive: true });
//   }

// });


document.addEventListener('DOMContentLoaded', () => {

  // ─── NAVBAR ─────────────────────────────────────────────────────────
  // ⚠️ ERROR 1 FIXED: Removed the duplicate IIFE navbar block that used
  // an undefined $() helper — it threw a ReferenceError and crashed the
  // entire DOMContentLoaded callback, killing the slider and everything else.

  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── TESTIMONIAL SLIDER ─────────────────────────────────────────────
  const track   = document.getElementById('testimonialTrack');
  const dots    = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const cards   = track ? track.querySelectorAll('.testimonial-card') : [];
  let current   = 0;
  let autoSlide;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // ⚠️ ERROR 3 FIXED: Moved startAuto and resetAuto ABOVE the if-block
  // so they are fully defined before resetAuto references startAuto.
  function startAuto() {
    autoSlide = setInterval(() => goTo(current + 1), 2000);
  }

  function resetAuto() {
    clearInterval(autoSlide);
    startAuto();
  }

  if (track && cards.length) {
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    dots.forEach(d => {
      d.addEventListener('click', () => { goTo(parseInt(d.dataset.index, 10)); resetAuto(); });
    });

    startAuto(); // ✅ Now safely called after both functions are defined

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoSlide));
    track.addEventListener('mouseleave', () => startAuto());

    // Touch / swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });
  }

  // ─── SCROLL REVEAL ──────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    'section > .container, .hero-content, .mission-inner, .partners-scroll, .pricing-grid, .team-grid, .book-inner, .footer-top'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll(':scope > *');
        children.forEach((child, idx) => {
          setTimeout(() => child.classList.add('visible'), idx * 60);
        });
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));

  document.querySelectorAll('.event-card, .team-card, .pricing-card, .testimonial-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // ─── BOOKING FORM ───────────────────────────────────────────────────
  // const form = document.getElementById('bookForm');
  // if (form) {
  //   form.addEventListener('submit', e => {
  //     e.preventDefault();
  //     const btn = form.querySelector('.form-submit');
  //     btn.textContent = '✓ Booking Confirmed!';
  //     btn.style.background = '#4a8a54';
  //     btn.style.color = '#fff';
  //     setTimeout(() => {
  //       btn.textContent = 'Book an Event';
  //       btn.style.background = '';
  //       btn.style.color = '';
  //       form.reset();
  //     }, 3500);
  //   });
  // }


  // ─── BOOKING FORM NEW ───────────────────────────────────────────────────

  const form = document.getElementById('bookForm');
  const eventSelect = document.getElementById("event");
  const otherEventGroup = document.getElementById("otherEventGroup");
  const otherEventInput = document.getElementById("otherEvent");

  // Handle dropdown change
  eventSelect.addEventListener("change", function () {
    if (this.value === "other") {
      otherEventGroup.style.display = "block";
      otherEventInput.required = true;
    } else {
      otherEventGroup.style.display = "none";
      otherEventInput.required = false;
      otherEventInput.value = "";
    }
  });

  // Handle form submission
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // ✅ Validate "Others" input
      if (eventSelect.value === "other" && otherEventInput.value.trim() === "") {
        alert("Please specify your event type.");
        otherEventInput.focus();
        return;
      }

      const btn = form.querySelector('.form-submit');
      btn.textContent = '✓ Booking Confirmed!';
      btn.style.background = '#4a8a54';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = 'Book an Event';
        btn.style.background = '';
        btn.style.color = '';

        form.reset();

        // ✅ Reset "Others" field UI
        otherEventGroup.style.display = "none";
        otherEventInput.required = false;
        otherEventInput.value = "";
      }, 3500);
    });
  }

  // ─── SMOOTH ANCHOR SCROLL ───────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = (navbar ? navbar.offsetHeight : 0) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── PARALLAX HERO ──────────────────────────────────────────────────
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

});

// // ─── HERO CAROUSEL ────────────────────────────

(function () {
 
  /* ── Config ─────────────────────────────── */
  const AUTO_DELAY      = 2000;  // ms between auto-advances
  const SWIPE_THRESHOLD = 48;    // px minimum swipe distance
  const DRAG_THRESHOLD  = 40;    // px minimum pointer drag
 
  /* ── Elements ───────────────────────────── */
  const section  = document.getElementById("hero");
  const track    = document.getElementById("heroSlides");
  const slides   = section ? section.querySelectorAll(".hero-slide") : [];
  const dots     = section ? section.querySelectorAll(".hero-dot")   : [];
  const prevBtn  = document.getElementById("heroPrev");
  const nextBtn  = document.getElementById("heroNext");
 
  if (!track || slides.length === 0) return;
 
  const total = slides.length;
  let current       = 0;
  let autoTimer     = null;
  let isPaused      = false;
  let isBusy        = false;   // blocks rapid successive calls mid-transition
  let dragStartX    = null;
  let dragStartY    = null;
  let isDragging    = false;
 
  /* ── Reduced motion (live) ───────────────── */
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  motionQuery.addEventListener("change", (e) => {
    reducedMotion = e.matches;
  });
 
  /* ── Touch-primary detection ─────────────── */
  const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
  let isTouchPrimary = touchQuery.matches;
  touchQuery.addEventListener("change", (e) => {
    isTouchPrimary = e.matches;
  });
 
  /* ── ARIA live region ────────────────────── */
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;";
  section.appendChild(liveRegion);
 
  /* ── Core: go to slide ───────────────────── */
  function goTo(index, { immediate = false } = {}) {
    if (isBusy && !immediate) return;
 
    // Infinite wrap
    index = ((index % total) + total) % total;
    if (index === current && !immediate) return;
 
    // Deactivate old
    slides[current].classList.remove("is-active");
    dots[current]?.classList.remove("active");
    dots[current]?.removeAttribute("aria-current");
 
    current = index;
 
    // Translate track
    const duration = immediate || reducedMotion ? 0 : 850;
    track.style.transition =
      duration === 0
        ? "none"
        : `transform ${duration}ms cubic-bezier(0.77, 0, 0.175, 1)`;
    track.style.transform = `translateX(-${current * 100}%)`;
 
    // Activate new
    slides[current].classList.add("is-active");
    dots[current]?.classList.add("active");
    dots[current]?.setAttribute("aria-current", "true");
 
    // Announce to screen readers
    const img = slides[current].querySelector(".hero-bg");
    const label = img?.getAttribute("alt") || `Slide ${current + 1}`;
    liveRegion.textContent = `${label} — slide ${current + 1} of ${total}`;
 
    // Busy guard
    if (!reducedMotion && !immediate) {
      isBusy = true;
      const done = () => {
        isBusy = false;
        track.removeEventListener("transitionend", done);
      };
      track.addEventListener("transitionend", done, { once: true });
      // Fallback in case transitionend doesn't fire
      setTimeout(() => { isBusy = false; }, duration + 100);
    }
  }
 
  /* ── Auto-advance ────────────────────────── */
  function startAuto() {
    if (reducedMotion) return;
    stopAuto();
    autoTimer = setInterval(() => {
      if (!isPaused) goTo(current + 1);
    }, AUTO_DELAY);
  }
 
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }
 
  function pauseAuto()  { isPaused = true; }
  function resumeAuto() { isPaused = false; }
 
  function resetAuto() {
    stopAuto();
    startAuto();
  }
 
  /* ── Arrow controls ──────────────────────── */
  prevBtn?.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener("click", () => { goTo(current + 1); resetAuto(); });
 
  /* ── Dot controls ────────────────────────── */
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { goTo(i); resetAuto(); });
  });
 
  /* ── Keyboard (section-scoped) ───────────── */
  section.setAttribute("tabindex", "0");
  section.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { goTo(current - 1); resetAuto(); e.preventDefault(); }
    if (e.key === "ArrowRight") { goTo(current + 1); resetAuto(); e.preventDefault(); }
  });
 
  /* ── Hover pause (mouse only) ────────────── */
  section.addEventListener("mouseenter", () => {
    if (!isTouchPrimary) pauseAuto();
  });
  section.addEventListener("mouseleave", () => {
    if (!isTouchPrimary) resumeAuto();
  });
 
  /* ── Focus pause ─────────────────────────── */
  section.addEventListener("focusin",  pauseAuto);
  section.addEventListener("focusout", (e) => {
    if (!section.contains(e.relatedTarget)) resumeAuto();
  });
 
  /* ── Visibility API (tab switch) ─────────── */
  document.addEventListener("visibilitychange", () => {
    document.hidden ? pauseAuto() : resumeAuto();
  });
 
  /* ── Touch / Swipe ───────────────────────── */
  let touchStartX = null;
  let touchStartY = null;
 
  section.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    pauseAuto();
  }, { passive: true });
 
  section.addEventListener("touchmove", (e) => {
    if (touchStartX === null) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    // If clearly horizontal, prevent page scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      e.preventDefault();
    }
  }, { passive: false });
 
  section.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
 
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      goTo(dx < 0 ? current + 1 : current - 1);
      resetAuto();
    } else {
      resumeAuto();
    }
    touchStartX = touchStartY = null;
  }, { passive: true });
 
  section.addEventListener("touchcancel", () => {
    touchStartX = touchStartY = null;
    resumeAuto();
  }, { passive: true });
 
  /* ── Pointer drag (mouse desktop) ───────── */
  section.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return; // handled by touch events
    dragStartX  = e.clientX;
    dragStartY  = e.clientY;
    isDragging  = false;
    section.setPointerCapture(e.pointerId);
    pauseAuto();
  });
 
  section.addEventListener("pointermove", (e) => {
    if (dragStartX === null || e.pointerType === "touch") return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!isDragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      isDragging = true;
    }
  });
 
  section.addEventListener("pointerup", (e) => {
    if (dragStartX === null || e.pointerType === "touch") return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (isDragging && Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      goTo(dx < 0 ? current + 1 : current - 1);
      resetAuto();
    } else {
      resumeAuto();
    }
    dragStartX = dragStartY = null;
    isDragging = false;
  });
 
  section.addEventListener("pointercancel", () => {
    dragStartX = dragStartY = null;
    isDragging = false;
    resumeAuto();
  });
 
  /* ── ResizeObserver ──────────────────────────
     Re-snaps translate if the viewport changes
     (orientation flip, split-screen, address bar
     appearing/hiding on mobile).
  ─────────────────────────────────────────── */
  let resizeTimer = null;
 
  const resizeObserver = new ResizeObserver(() => {
    // Debounce — only act after resize settles
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Snap to current slide without animation
      track.style.transition = "none";
      track.style.transform  = `translateX(-${current * 100}%)`;
      // Re-enable transitions after a paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.style.transition = "";
        });
      });
    }, 150);
  });
 
  resizeObserver.observe(section);
 
  /* ── Init ────────────────────────────────── */
  goTo(0, { immediate: true });
  startAuto();
 
})();
 
// ─── WHATSAPP CONFIGURATION────────────────────────────

(function initWhatsApp () {
    /* ---- Config — update phone & message as needed ---- */
    const PHONE   = '2349011046473';           // international format, no +
    const MESSAGE = encodeURIComponent('Hello! I\'d like to book an event with Mara Events.');
    const WA_URL  = `https://wa.me/${PHONE}?text=${MESSAGE}`;
 
    /* ---- Build the button ---- */
    const btn = document.createElement('a');
    btn.href        = WA_URL;
    btn.target      = '_blank';
    btn.rel         = 'noopener noreferrer';
    btn.className   = 'wa-btn';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML   = `
      <span class="wa-icon">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#fff" d="
            M16 3C8.832 3 3 8.832 3 16c0 2.34.636 4.614 1.842 6.596L3 29l6.587-1.83A12.94 12.94 0 0016 29c7.168 0 13-5.832 13-13S23.168 3 16 3z
          "/>
          <path fill="#25D366" d="
            M16 5c-6.065 0-11 4.935-11 11 0 2.13.614 4.18 1.778 5.943l.3.466-1.233 4.51 4.637-1.213.452.268A10.944 10.944 0 0016 27c6.065 0 11-4.935 11-11S22.065 5 16 5z
          "/>
          <path fill="#fff" d="
            M21.6 18.8c-.3-.15-1.763-.87-2.037-.968-.273-.1-.472-.15-.672.15-.198.3-.771.968-.945 1.168-.173.2-.347.224-.647.074-.3-.15-1.267-.467-2.413-1.489-.891-.795-1.493-1.776-1.668-2.076-.174-.3-.018-.462.132-.61.134-.132.3-.347.448-.52.148-.175.198-.3.298-.498.1-.2.05-.375-.025-.524-.075-.15-.672-1.62-.921-2.218-.242-.583-.488-.503-.672-.512l-.572-.01c-.2 0-.523.074-.797.374-.273.3-1.045 1.021-1.045 2.49s1.07 2.888 1.22 3.087c.149.2 2.105 3.212 5.1 4.502.713.307 1.27.49 1.703.628.716.228 1.368.195 1.883.118.575-.085 1.763-.72 2.012-1.415.248-.695.248-1.292.173-1.417-.074-.124-.273-.198-.572-.347z
          "/>
        </svg>
      </span>
      <span class="wa-label">Chat with us</span>
    `;
 
    document.body.appendChild(btn);
 
    /* ---- Visibility logic ---- */
    const heroSection  = document.getElementById('hero');
    if (!heroSection) { btn.classList.add('visible'); return; }
 
    let   visible      = false;
    let   rafScheduled = false;
 
    const update = () => {
      rafScheduled = false;
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      // Show once user scrolls past hero bottom; hide if back in hero
      const shouldShow = heroBottom <= 0;
      if (shouldShow === visible) return;
      visible = shouldShow;
      btn.classList.toggle('visible', visible);
    };
 
    const onScroll = () => {
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(update);
      }
    };
 
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial check
  })();
 
  /* ── 7. INTERSECTION-based fade-in for cards / sections ────── */
  (function initFadeIn () {
    const targets = $$('.event-card, .testimonial-card, .mission-inner, .about-us-inner, .book-inner');
    if (!('IntersectionObserver' in window)) return;
 
    targets.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity .6s ${i * 0.07}s ease, transform .6s ${i * 0.07}s ease`;
    });
 
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
 
    targets.forEach(el => io.observe(el));
  })();
