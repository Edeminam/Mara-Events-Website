/* =============================================
   MARA EVENTS — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAVBAR ───────────────────────────────────
  const navbar   = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  // /* ── 1. NAVBAR — scroll-aware style + mobile toggle ────────── */
  // (function initNavbar () {
  //   const navbar     = $('#navbar');
  //   const navToggle  = $('#navToggle');
  //   const mobileMenu = $('#mobileMenu');
  //   if (!navbar) return;
 
  //   // Scrolled class
  //   const onScroll = () => {
  //     navbar.classList.toggle('scrolled', window.scrollY > 60);
  //   };
  //   window.addEventListener('scroll', onScroll, { passive: true });
  //   onScroll();
 
  //   // Mobile toggle
  //   navToggle?.addEventListener('click', () => {
  //     const open = mobileMenu.classList.toggle('open');
  //     navToggle.setAttribute('aria-expanded', open);
  //     // Animate hamburger → X
  //     const spans = $$('span', navToggle);
  //     if (open) {
  //       spans[0].style.transform = 'translateY(7px) rotate(45deg)';
  //       spans[1].style.opacity = '0';
  //       spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  //     } else {
  //       spans.forEach(s => (s.style.transform = s.style.opacity = ''));
  //     }
  //   });
 
  //   // Close mobile menu on link click
  //   $$('a', mobileMenu).forEach(a => {
  //     a.addEventListener('click', () => {
  //       mobileMenu.classList.remove('open');
  //       navToggle.setAttribute('aria-expanded', 'false');
  //       const spans = $$('span', navToggle);
  //       spans.forEach(s => (s.style.transform = s.style.opacity = ''));
  //     });
  //   });
  // })();

  // ─── TESTIMONIAL SLIDER ───────────────────────
  const track    = document.getElementById('testimonialTrack');
  const dots     = document.querySelectorAll('.t-dot');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const cards    = track ? track.querySelectorAll('.testimonial-card') : [];
  let current    = 0;
  let autoSlide;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (track && cards.length) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    dots.forEach(d => {
      d.addEventListener('click', () => { goTo(+d.dataset.index); resetAuto(); });
    });

    function startAuto() {
      autoSlide = setInterval(() => goTo(current + 1), 5000);
    }
    function resetAuto() {
      clearInterval(autoSlide);
      startAuto();
    }
    startAuto();

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
  }

  // // ─── FAQ ACCORDION ────────────────────────────
  // document.querySelectorAll('.faq-q').forEach(btn => {
  //   btn.addEventListener('click', () => {
  //     const answer   = btn.nextElementSibling;
  //     const expanded = btn.getAttribute('aria-expanded') === 'true';

  //     // Close all others
  //     document.querySelectorAll('.faq-q').forEach(b => {
  //       if (b !== btn) {
  //         b.setAttribute('aria-expanded', 'false');
  //         b.nextElementSibling.classList.remove('open');
  //       }
  //     });

  //     btn.setAttribute('aria-expanded', !expanded);
  //     answer.classList.toggle('open', !expanded);
  //   });
  // });

  // ─── SCROLL REVEAL ────────────────────────────
  const revealEls = document.querySelectorAll(
    'section > .container, .hero-content, .mission-inner, .partners-scroll, .pricing-grid, .team-grid, .book-inner, .faq-list, .footer-top'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children
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

  // Also reveal individual cards
  document.querySelectorAll('.event-card, .team-card, .pricing-card, .testimonial-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // ─── BOOKING FORM ─────────────────────────────
  const form = document.getElementById('bookForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = '✓ Booking Confirmed!';
      btn.style.background = '#4a8a54';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = 'Book an Event';
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 3500);
    });
  }

  // ─── SMOOTH ANCHOR SCROLL ─────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── PARALLAX HERO ────────────────────────────
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

});


// ─── HERO CAROUSEL ────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.getElementById('heroSlides');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  
  let currentIndex = 0;
  const totalSlides = dots.length;
  
  function updateCarousel() {
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }
  
  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }
  
  // Auto-advance
  let autoAdvance = setInterval(nextSlide, 5000);
  
  // Controls
  nextBtn.addEventListener('click', () => {
    clearInterval(autoAdvance);
    nextSlide();
    autoAdvance = setInterval(nextSlide, 5000);
  });
  
  prevBtn.addEventListener('click', () => {
    clearInterval(autoAdvance);
    prevSlide();
    autoAdvance = setInterval(nextSlide, 5000);
  });
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(autoAdvance);
      currentIndex = index;
      updateCarousel();
      autoAdvance = setInterval(nextSlide, 5000);
    });
  });
});

// WhatsApp Button

/*
     * CONFIGURATION
     * Replace the values below with your own details.
     */
//     const WA_CONFIG = {
//       phone:   "2349011046473",            // ← your number (no +, no spaces)
//       message: "Hi! I'd like to chat 👋",  // ← pre-filled message (optional)
//       label:   "Chat with us!",            // ← tooltip text
//       badge:   0,                          // ← unread count (0 to hide)
//     };
 
//     /* ── Apply config ── */
//     const link   = document.querySelector(".wa-float");
//     const label  = document.querySelector(".wa-label");
//     const unread = document.querySelector(".wa-unread");
 
//     const encoded = encodeURIComponent(WA_CONFIG.message);
//     link.href = `https://wa.me/${WA_CONFIG.phone}?text=${encoded}`;
//     label.textContent = WA_CONFIG.label;
 
//     if (WA_CONFIG.badge > 0) {
//       unread.textContent = WA_CONFIG.badge > 9 ? "9+" : WA_CONFIG.badge;
//       unread.style.display = "flex";
//     } else {
//       unread.style.display = "none";
//     }
 
//     /* ── Dismiss badge on click ── */
//     link.addEventListener("click", () => {
//       unread.style.display = "none";
//     });

//     // WhatsApp Button scroll show
// let lastScrollY = window.scrollY;
// const waBtn = document.querySelector('.wa-float');

// window.addEventListener('scroll', () => {
//   const currentScrollY = window.scrollY;

//   if (currentScrollY < lastScrollY && currentScrollY > 100) {
//     // scrolling UP
//     waBtn.classList.add('show');
//   } else {
//     // scrolling DOWN
//     waBtn.classList.remove('show');
//   }

//   lastScrollY = currentScrollY;
// });

// if (currentScrollY > 200 && currentScrollY < lastScrollY) {
//   waBtn.classList.add('show');
// }

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
 
// })();