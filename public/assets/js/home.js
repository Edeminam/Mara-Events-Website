/* =============================================
   Mara Events — home.js
   Homepage only:
     1. Hero photo slideshow
     2. Testimonial slider
     3. Event enquiry form (EmailJS) and success dialog
     4. Promo video dialog
   ============================================= */

'use strict';

// Older browsers lack <dialog closedby="any">; close when the backdrop is clicked.
function closeOnBackdropClick(dialog) {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside = r.top <= event.clientY && event.clientY <= r.bottom &&
                   r.left <= event.clientX && event.clientX <= r.right;
    if (!inside) dialog.close();
  });
}

// ─── 1. HERO SLIDESHOW ───────────────────────────────────────────────
// Cross-fades the homepage hero photos. Each progress bar fills over one
// slide's duration (in CSS); when it finishes, the next photo shows.
(function () {
  const section  = document.getElementById('hero');
  const slides   = section ? [...section.querySelectorAll('.home-hero-slide')] : [];
  const bars     = section ? [...section.querySelectorAll('.home-hero-bar')] : [];
  if (slides.length < 2) return;

  const caption  = document.getElementById('heroCaption');
  const counter  = document.getElementById('heroCurrent');
  const prevBtn  = document.getElementById('heroPrev');
  const nextBtn  = document.getElementById('heroNext');
  const total    = slides.length;
  let current    = 0;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function goTo(index) {
    index = (index + total) % total;
    slides[current].classList.remove('is-active');
    bars[current].classList.remove('is-active');
    bars[current].removeAttribute('aria-current');

    current = index;
    slides[current].classList.add('is-active');
    // Restart the fill animation even when the same bar becomes active again
    const fill = bars[current].firstElementChild;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
    bars[current].classList.add('is-active');
    bars[current].setAttribute('aria-current', 'true');

    caption.textContent = slides[current].dataset.caption;
    counter.textContent = String(current + 1).padStart(2, '0');
  }

  // Advance when the active bar finishes filling
  bars.forEach((bar, i) => {
    bar.addEventListener('click', () => goTo(i));
    bar.firstElementChild.addEventListener('animationend', () => {
      if (i === current) goTo(current + 1);
    });
  });
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Pause while the visitor is reading, hovering or the tab is hidden
  const setPaused = (on) => section.classList.toggle('is-paused', on);
  section.addEventListener('mouseenter', () => setPaused(true));
  section.addEventListener('mouseleave', () => setPaused(false));
  section.addEventListener('focusin', () => setPaused(true));
  section.addEventListener('focusout', (e) => {
    if (!section.contains(e.relatedTarget)) setPaused(false);
  });
  document.addEventListener('visibilitychange', () => setPaused(document.hidden));

  // Arrow keys while focus is inside the hero
  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Swipe on touch screens
  let touchX = null;
  section.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  section.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  // No autoplay for visitors who prefer reduced motion
  const applyMotion = () => section.classList.toggle('is-static', motionQuery.matches);
  motionQuery.addEventListener('change', applyMotion);
  applyMotion();
})();

document.addEventListener('DOMContentLoaded', () => {

  // ─── 2. TESTIMONIAL SLIDER ──────────────────────────────────────────
  const slider    = document.getElementById('testimonialSlider');
  const track     = document.getElementById('testimonialTrack');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const currentEl = document.getElementById('testimonialCurrent');
  const totalEl   = document.getElementById('testimonialTotal');
  const progress  = document.getElementById('testimonialProgress');
  const cards     = track ? track.querySelectorAll('.testimonial-card') : [];
  const pad       = n => String(n).padStart(2, '0');
  let current     = 0;
  let autoSlide;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === current);
      c.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    if (currentEl) currentEl.textContent = pad(current + 1);
    if (progress) progress.style.width = `${((current + 1) / cards.length) * 100}%`;
  }

  function startAuto() {
    // Honour the "reduce motion" preference: no automatic advance (arrows still work)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goTo(current + 1), 7000);
  }

  function resetAuto() {
    clearInterval(autoSlide);
    startAuto();
  }

  if (track && cards.length) {
    if (totalEl) totalEl.textContent = pad(cards.length);
    goTo(0);

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    startAuto();

    // Pause while the reader is hovering or focused on the testimonials
    const section = document.getElementById('testimonials');
    section.addEventListener('mouseenter', () => clearInterval(autoSlide));
    section.addEventListener('mouseleave', () => startAuto());
    section.addEventListener('focusin', () => clearInterval(autoSlide));
    section.addEventListener('focusout', () => startAuto());

    // Touch / swipe support
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });

    // Arrow keys, only while focus is inside the testimonials (not site-wide)
    section.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });
  }

  // ─── 3. ENQUIRY FORM ────────────────────────────────────────────────
  const form = document.getElementById('bookForm');
  const eventSelect = document.getElementById("event");
  const otherEventGroup = document.getElementById("otherEventGroup");
  const otherEventInput = document.getElementById("otherEvent");
  const eventDateInput = document.getElementById("eventDate");
  const successDialog = document.getElementById('successDialog');
  const successMessage = document.getElementById('successMessage');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const successWhatsAppBtn = document.getElementById('successWhatsAppBtn');

  // EmailJS template that emails the client a confirmation of their inquiry
  const CONFIRMATION_TEMPLATE_ID = "template_38vu3hg";
  const BUSINESS_WHATSAPP = "2349011046473"; // international format, no +

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init("djfFVv8ATRg9mo_1u");
  }

  // Don't allow inquiries for dates that have already passed
  if (eventDateInput) {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    eventDateInput.min = today.toISOString().split("T")[0];
  }

  function toggleOtherEvent(show) {
    otherEventGroup.classList.toggle("hidden", !show);
    otherEventInput.required = show;
    if (!show) otherEventInput.value = "";
  }

  // Handle dropdown change
  if (eventSelect && otherEventGroup && otherEventInput) {
    eventSelect.addEventListener("change", function () {
      toggleOtherEvent(this.value === "other");
    });
  }

  // Completion bar: share of required answers filled in
  const progressBar = document.getElementById("inqProgressBar");
  const progressText = document.getElementById("inqProgressText");
  const progressFields = ["name", "email", "phone", "event", "eventDate", "guestCount", "location", "budget", "contactChannel"];

  function updateProgress() {
    if (!form || !progressBar) return;
    const done = progressFields.filter(field => {
      const el = form.elements[field];
      // Radio groups come back as a RadioNodeList whose value is the checked option
      return el instanceof RadioNodeList ? el.value !== "" : el.value.trim() !== "" && el.checkValidity();
    }).length;
    const pct = Math.round((done / progressFields.length) * 100);
    progressBar.style.width = pct + "%";
    if (progressText) progressText.textContent = pct === 100 ? "Ready to send ✓" : pct + "% complete";
  }

  if (form) {
    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);
  }

  // Shared checks, used both to unlock the next step and on submit
  const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = value => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  };
  const isValidGuestCount = value => Number.isInteger(Number(value)) && Number(value) >= 1;

  // ─── STEP-BY-STEP REVEAL ─────────────────────────────────────────────
  // Locked steps are hidden and disabled, so the browser skips their required fields
  const eventStage = document.getElementById("inqEventStage");
  const contactStage = document.getElementById("inqContactStage");
  const actionsStage = document.getElementById("inqActions");
  const submitBtn = form ? form.querySelector(".inq-submit") : null;

  function detailsComplete() {
    return form.name.value.trim() !== "" &&
      isValidEmail(form.email.value.trim()) &&
      isValidPhone(form.phone.value);
  }

  function eventComplete() {
    if (!eventSelect.value) return false;
    if (eventSelect.value === "other" && otherEventInput.value.trim() === "") return false;
    return form.eventDate.value !== "" && form.eventDate.checkValidity() &&
      isValidGuestCount(form.guestCount.value.trim()) &&
      form.location.value.trim() !== "";
  }

  function setStageLocked(stage, locked) {
    if (!stage) return;
    stage.classList.toggle("inq-locked", locked);
    stage.classList.toggle("inq-reveal", !locked);
    if (stage.tagName === "FIELDSET") stage.disabled = locked;
  }

  function updateStages() {
    if (!eventStage || !contactStage) return;
    // Once a step is open it stays open, even if an earlier answer is edited
    if (eventStage.classList.contains("inq-locked") && detailsComplete()) {
      setStageLocked(eventStage, false);
    }
    if (!eventStage.classList.contains("inq-locked") &&
        contactStage.classList.contains("inq-locked") && eventComplete()) {
      setStageLocked(contactStage, false);
      setStageLocked(actionsStage, false);
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function resetStages() {
    setStageLocked(eventStage, true);
    setStageLocked(contactStage, true);
    setStageLocked(actionsStage, true);
    if (submitBtn) submitBtn.disabled = true;
  }

  if (form && eventStage) {
    // Wait for a pause in typing so a step doesn't pop in mid-word
    let stageTimer;
    form.addEventListener("input", () => {
      clearTimeout(stageTimer);
      stageTimer = setTimeout(updateStages, 500);
    });
    form.addEventListener("change", updateStages);
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const eventDate = form.eventDate.value;
      const guestCount = form.guestCount.value.trim();
      const budget = form.budget.value;
      const location = form.location.value.trim();
      const contactChannel = form.contactChannel.value;

      // ✅ Email validation (simple & effective)
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // ✅ Phone validation (digits only, 10–13 length)
      if (!isValidPhone(phone)) {
        alert("The number is incorrect, check your phone number");
        return;
      }

      // ✅ Validate "Others" input
      if (eventSelect.value === "other" && otherEventInput.value.trim() === "") {
        alert("Please specify your event type.");
        otherEventInput.focus();
        return;
      }

      if (!isValidGuestCount(guestCount)) {
        alert("Please enter a valid guest count.");
        form.guestCount.focus();
        return;
      }

      const btn = form.querySelector('.inq-submit');
      const btnLabel = btn.querySelector('.inq-submit-label');
      const originalText = btnLabel.textContent;

      // Disable button & show processing
      btn.disabled = true;
      btnLabel.textContent = 'Sending...';

      const eventType = eventSelect.value === "other"
        ? otherEventInput.value.trim()
        : eventSelect.options[eventSelect.selectedIndex].text;

      // Human-readable date, e.g. "Saturday, 14 November 2026"
      const formattedDate = new Date(eventDate + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });

      const formData = {
        name: name,
        email: email,
        reply_to: email,
        phone: phone,
        event: eventType,
        event_type: eventType,
        event_date: formattedDate,
        guest_count: guestCount,
        budget: budget,
        location: location,
        contact_channel: contactChannel,
        // Full summary so the details arrive even if the EmailJS template only renders {{message}}
        message: `New Event Inquiry:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nEvent Type: ${eventType}\nEvent Date: ${formattedDate}\nGuest Count: ${guestCount}\nBudget Range: ${budget}\nLocation: ${location}\nPreferred Contact Channel: ${contactChannel}`
      };

      if (typeof emailjs !== 'undefined') {
        emailjs.send("service_6vspc2j", "template_87ahk4b", formData)
          .then(() => {
            // Re-enable button
            btn.disabled = false;
            btnLabel.textContent = originalText;

            // Email the client a confirmation. The inquiry itself already reached us,
            // so a failure here is logged rather than shown as a failed submission.
            emailjs.send("service_6vspc2j", CONFIRMATION_TEMPLATE_ID, formData)
              .catch((error) => console.error("Confirmation email failed:", error));

            // Click-to-chat link with the inquiry details pre-filled
            if (successWhatsAppBtn) {
              const waText = `Hi Mara Events, I just sent an event inquiry on your website.\n\nName: ${name}\nEvent Type: ${eventType}\nEvent Date: ${formattedDate}\nGuest Count: ${guestCount}\nBudget Range: ${budget}\nLocation: ${location}`;
              successWhatsAppBtn.href = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(waText)}`;
            }

            // Personalize and show Success Dialog
            if (successDialog) {
              if (successMessage) {
                // Build with DOM nodes so user-typed text is never parsed as HTML
                const nameEl = document.createElement('strong');
                nameEl.textContent = name;
                successMessage.replaceChildren(
                  'Thank you, ', nameEl,
                  `! We've received your event inquiry and sent a confirmation to ${email}. We'll reach out via ${contactChannel} shortly.`
                );
              }
              successDialog.showModal();
            }

            // Reset form
            form.reset();

            // Reset "Others" field UI
            if (otherEventGroup && otherEventInput) {
              toggleOtherEvent(false);
            }
            updateProgress();
            resetStages();
          })
          .catch((error) => {
            console.error("FAILED:", error);
            btn.disabled = false;
            btnLabel.textContent = originalText;
            alert("Failed to send your inquiry. Please try again.");
          });
      } else {
        console.error("EmailJS is not defined.");
        btn.disabled = false;
        btnLabel.textContent = originalText;
        alert("Failed to connect to the inquiry service. Please try again later.");
      }
    });
  }

  // Success Dialog close logic
  if (successDialog && closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      successDialog.close();
    });

    closeOnBackdropClick(successDialog);
  }

  // ─── 4. PROMO VIDEO DIALOG ───────────────────────────────────────────
  const videoDialog = document.getElementById('videoDialog');
  const videoIframe = document.getElementById('videoIframe');
  const playVideoBtn = document.getElementById('playVideoBtn');
  const closeVideoBtn = document.getElementById('closeVideoBtn');

  function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  if (videoDialog && videoIframe && playVideoBtn) {
    playVideoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoUrl = playVideoBtn.getAttribute('href');
      const videoId = getYouTubeId(videoUrl) || "9k1JPbEp_DE";
      videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      videoDialog.showModal();
    });

    videoDialog.addEventListener('close', () => {
      videoIframe.src = "";
    });

    if (closeVideoBtn) {
      closeVideoBtn.addEventListener('click', () => {
        videoDialog.close();
      });
    }

    closeOnBackdropClick(videoDialog);
  }

});
