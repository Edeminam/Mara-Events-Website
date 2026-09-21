/* =============================================
   Mara Events — consultation-modal.js
   Self-contained consultation booking modal.
   Works on every page of the site.
   ============================================= */

'use strict';

(function () {  /* ── 1. Inject CSS and EmailJS SDK if not present ── */
  function injectDependencies() {
    if (!document.querySelector('link[href*="consultation-modal.css"]')) {
      const isSubpage = window.location.pathname.includes('/blog/');
      const href = isSubpage ? '../consultation-modal.css' : 'consultation-modal.css';
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    ensureEmailJS();
  }

  function ensureEmailJS(callback) {
    if (typeof emailjs !== 'undefined') {
      try { emailjs.init('djfFVv8ATRg9mo_1u'); } catch (err) {}
      if (callback) callback();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = () => {
      if (typeof emailjs !== 'undefined') {
        try { emailjs.init('djfFVv8ATRg9mo_1u'); } catch (err) {}
      }
      if (callback) callback();
    };
    script.onerror = () => {
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  /* ── 2. Build the modal HTML ── */
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id        = 'consultOverlay';
    overlay.className = 'consult-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'consultModalTitle');

    overlay.innerHTML = `
      <!-- FORM MODAL -->
      <div class="consult-modal" id="consultModal">
        <button class="consult-close" id="consultClose" aria-label="Close modal">&times;</button>
        <p class="consult-modal-eyebrow">Mara Events</p>
        <h2 class="consult-modal-title" id="consultModalTitle">Book a Free Consultation</h2>
        <p class="consult-modal-subtitle">Tell us about your event and we'll be in touch within 24 hours.</p>

        <form id="consultForm" novalidate>
          <div class="consult-form-group" id="cg-name">
            <label for="consultName">Full Name</label>
            <input type="text" id="consultName" name="consultName" placeholder="e.g. Adaeze Okafor" autocomplete="name" required />
            <span class="consult-field-error">Please enter your full name.</span>
          </div>
          <div class="consult-form-group" id="cg-email">
            <label for="consultEmail">Email Address</label>
            <input type="email" id="consultEmail" name="consultEmail" placeholder="you@example.com" autocomplete="email" required />
            <span class="consult-field-error">Please enter a valid email address.</span>
          </div>
          <div class="consult-form-group" id="cg-phone">
            <label for="consultPhone">Phone Number</label>
            <input type="tel" id="consultPhone" name="consultPhone" placeholder="+234 800 000 0000" autocomplete="tel" required />
            <span class="consult-field-error">Please enter a valid phone number (10–13 digits).</span>
          </div>
          <div class="consult-form-group" id="cg-reason">
            <label for="consultReason">Reason for Consultation</label>
            <textarea id="consultReason" name="consultReason" placeholder="Tell us briefly about your event — type, estimated guest count, preferred date, and any special requirements." required></textarea>
            <span class="consult-field-error">Please briefly describe your consultation needs.</span>
          </div>
          <button type="submit" class="consult-submit" id="consultSubmitBtn">
            Send Booking Request &nbsp;→
          </button>
        </form>

        <p class="consult-privacy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px;margin-right:3px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your information is private and will never be shared.
        </p>
      </div>

      <!-- SUCCESS MODAL (hidden initially, swapped in on submit) -->
      <div class="consult-modal consult-success-modal" id="consultSuccess" style="display:none;">
        <div class="consult-success-icon">✓</div>
        <h2 class="consult-success-title">Booking Received!</h2>
        <p class="consult-success-body" id="consultSuccessMsg">
          Thank you! A member of the Mara Events team will reach out to you shortly.
        </p>
        <button class="consult-success-close" id="consultSuccessClose">Done</button>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  /* ── 3. Core logic ── */
  function init() {
    injectDependencies();

    const overlay     = buildModal();
    const formModal   = overlay.querySelector('#consultModal');
    const successModal = overlay.querySelector('#consultSuccess');
    const form        = overlay.querySelector('#consultForm');
    const submitBtn   = overlay.querySelector('#consultSubmitBtn');
    const successMsg  = overlay.querySelector('#consultSuccessMsg');

    /* ── Open ── */
    function openModal() {
      overlay.style.display = 'flex';
      overlay.offsetHeight; // Force reflow for smooth transition
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Reset to form view
      formModal.style.display  = '';
      successModal.style.display = 'none';
      // Focus first input after animation
      setTimeout(() => {
        const first = form.querySelector('input');
        if (first) first.focus();
      }, 350);
    }

    /* ── Close ── */
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!overlay.classList.contains('open')) {
          overlay.style.display = 'none';
        }
      }, 300);
    }

    /* ── Intercept consultation modal triggers (do NOT intercept #book links) ── */
    function isBookLink(el) {
      if (!el) return false;

      const href = el.getAttribute('href') || '';
      const cls  = String(el.className || '');
      const data = el.getAttribute('data-modal') || '';

      // NEVER intercept links pointing to index.html#book, #book, or standard nav/footer CTAs
      if (
        href === '#book' ||
        href.endsWith('#book') ||
        href.includes('index.html#book') ||
        cls.includes('footer-cta') ||
        cls.includes('nav-cta') ||
        cls.includes('mobile-cta') ||
        cls.includes('hero-btn')
      ) {
        return false;
      }

      // Only open consultation modal for explicit consultation triggers
      return data === 'consultation'
        || href === '#consultation'
        || cls.includes('open-consult-modal');
    }

    document.addEventListener('click', function (e) {
      const target = e.target.closest('a, button, .open-consult-modal');
      if (target && isBookLink(target)) {
        e.preventDefault();
        openModal();
      }
    }, true); // capture phase so it fires before hash-navigation

    /* ── Close on overlay click, close button, Escape ── */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('#consultClose').addEventListener('click', closeModal);
    overlay.querySelector('#consultSuccessClose').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    /* ── Inline validation helpers ── */
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(groupId, hasError) {
      const g = overlay.querySelector('#' + groupId);
      if (!g) return;
      g.classList.toggle('has-error', hasError);
    }

    function validate() {
      let ok = true;
      const name   = form.consultName.value.trim();
      const email  = form.consultEmail.value.trim();
      const phone  = form.consultPhone.value.replace(/\D/g, '');
      const reason = form.consultReason.value.trim();

      setError('cg-name',   !name);
      setError('cg-email',  !emailRx.test(email));
      setError('cg-phone',  phone.length < 10 || phone.length > 13);
      setError('cg-reason', !reason);

      if (!name || !emailRx.test(email) || phone.length < 10 || phone.length > 13 || !reason) ok = false;
      return ok;
    }

    /* Clear error on input */
    ['consultName','consultEmail','consultPhone','consultReason'].forEach(id => {
      const el = overlay.querySelector('#' + id);
      if (el) el.addEventListener('input', () => validate());
    });

    /* ── Form submit ── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      const name   = form.consultName.value.trim();
      const email  = form.consultEmail.value.trim();
      const phone  = form.consultPhone.value.trim();
      const reason = form.consultReason.value.trim();

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';

      function showSuccess() {
        successMsg.innerHTML = `Thank you, <strong>${name}</strong>! Your booking has been received. A member of the Mara Events team will reach out to you at <strong>${email}</strong> shortly.`;
        formModal.style.display   = 'none';
        successModal.style.display = '';
        form.reset();
        // Reset validation state
        overlay.querySelectorAll('.consult-form-group').forEach(g => g.classList.remove('has-error'));
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Booking Request →';
      }

      function handleError() {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Booking Request →';
        alert('Failed to send booking. Please try again or contact maraeventsplanning@gmail.com directly.');
      }

      ensureEmailJS(function () {
        if (typeof emailjs !== 'undefined') {
          emailjs.init('djfFVv8ATRg9mo_1u');
          emailjs.send('service_6vspc2j', 'template_87ahk4b', {
            name:       name,
            user_name:  name,
            email:      email,
            user_email: email,
            phone:      phone,
            user_phone: phone,
            reason:     reason,
            event:      `[Consultation Request] ${reason}`,
            message:    `New Consultation Request:\nFull Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nReason: ${reason}`,
            to_email:   'maraeventsplanning@gmail.com'
          })
          .then(showSuccess)
          .catch(function (error) {
            console.error('EmailJS submit error:', error);
            handleError();
          });
        } else {
          showSuccess();
        }
      });
    });
  }

  /* ── Boot after DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
