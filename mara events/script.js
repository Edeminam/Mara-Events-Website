/* =============================================
   EVENTRY — script.js
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

  // ─── FAQ ACCORDION ────────────────────────────
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer   = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      document.querySelectorAll('.faq-q').forEach(b => {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          b.nextElementSibling.classList.remove('open');
        }
      });

      btn.setAttribute('aria-expanded', !expanded);
      answer.classList.toggle('open', !expanded);
    });
  });

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
