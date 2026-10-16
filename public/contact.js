/* =============================================
   Mara Events — contact.js
   Enquiry form: shows the fields for the chosen enquiry type,
   validates, and sends through the same EmailJS account as the booking form.
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const EMAILJS_PUBLIC_KEY = 'djfFVv8ATRg9mo_1u';
  const EMAILJS_SERVICE = 'service_6vspc2j';
  const EMAILJS_TEMPLATE = 'template_87ahk4b';
  const BUSINESS_WHATSAPP = '2349011046473'; // international format, no +

  const TYPE_LABELS = {
    consultation: 'Event consultation',
    training: 'Corporate training',
    partnership: 'Partnership',
    retainership: 'Retainership',
    other: 'General enquiry',
  };

  const typeError = document.getElementById('typeError');
  const formError = document.getElementById('formError');
  const success = document.getElementById('contactSuccess');
  const successName = document.getElementById('successName');
  const successText = document.getElementById('successText');
  const successWhatsApp = document.getElementById('successWhatsApp');
  const resetBtn = document.getElementById('contactReset');
  const submitBtn = form.querySelector('.inq-submit');
  const submitLabel = submitBtn.querySelector('.inq-submit-label');

  if (typeof emailjs !== 'undefined') {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch (err) {}
  }

  // yyyy-mm-dd for a date `days` from today, in the visitor's own time zone
  const isoDaysFromToday = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const longDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Don't allow dates that have already passed
  const eventDate = document.getElementById('cEventDate');
  if (eventDate) eventDate.min = isoDaysFromToday(0);

  // Training needs lead time: the earliest date is five days after today
  const TRAINING_LEAD_DAYS = 5;
  const trainingDate = document.getElementById('cTrainingWhen');
  const trainingEarliest = document.getElementById('trainingEarliest');
  if (trainingDate) {
    trainingDate.min = isoDaysFromToday(TRAINING_LEAD_DAYS);
    if (trainingEarliest) trainingEarliest.textContent = longDate(trainingDate.min);
  }

  const currentType = () => form.querySelector('input[name="enquiryType"]:checked')?.value || '';
  const listHas = (attr, type) => (attr || '').split(/\s+/).includes(type);

  /* ─── Show the fields for the chosen type ─────── */
  function applyType(type) {
    form.querySelectorAll('[data-show]').forEach((el) => {
      const show = !!type && listHas(el.dataset.show, type);
      el.hidden = !show;
      // Hidden fields are disabled so they are neither validated nor sent
      el.querySelectorAll('input, select, textarea').forEach((input) => { input.disabled = !show; });
    });
    form.querySelectorAll('[data-required-for]').forEach((input) => {
      input.required = listHas(input.dataset.requiredFor, type);
    });
    form.querySelectorAll('[data-optional-for]').forEach((el) => {
      el.hidden = !listHas(el.dataset.optionalFor, type);
    });
    if (type) typeError.hidden = true;
  }

  function selectType(type) {
    const radio = form.querySelector(`input[name="enquiryType"][value="${type}"]`);
    if (!radio) return;
    radio.checked = true;
    applyType(type);
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'enquiryType') applyType(e.target.value);
    if (e.target.classList.contains('is-invalid') || e.target.closest('.is-invalid')) clearInvalid(e.target);
  });
  form.addEventListener('input', (e) => clearInvalid(e.target));

  // Topic cards pick the matching type before the page scrolls to the form
  document.querySelectorAll('.contact-topic[data-topic]').forEach((card) => {
    card.addEventListener('click', () => selectType(card.dataset.topic));
  });

  // Other pages can link straight to a type, e.g. /contact?type=training#enquiry
  const linkedType = new URLSearchParams(window.location.search).get('type');
  if (linkedType && TYPE_LABELS[linkedType]) selectType(linkedType);
  else applyType(currentType());

  /* ─── Validation ──────────────────────────────── */
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const isValidPhone = (v) => {
    const digits = v.replace(/[^\d]/g, '');
    return /^\+?[\d\s()-]+$/.test(v) && digits.length >= 10 && digits.length <= 15;
  };

  function markInvalid(input) {
    const target = input.type === 'radio' || input.type === 'checkbox'
      ? input.closest('.inq-chips, .inq-channels')
      : input;
    target?.classList.add('is-invalid');
  }

  function clearInvalid(input) {
    if (!input || !input.closest) return;
    input.classList.remove('is-invalid');
    input.closest('.inq-chips, .inq-channels')?.classList.remove('is-invalid');
  }

  function validate() {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    const problems = [];

    if (!currentType()) {
      typeError.hidden = false;
      problems.push(form.querySelector('input[name="enquiryType"]'));
    }

    const checkedGroups = new Set();
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (input.disabled || !input.required) return;
      if (input.type === 'radio') {
        if (checkedGroups.has(input.name)) return;
        checkedGroups.add(input.name);
        if (!form.querySelector(`input[name="${input.name}"]:checked`)) {
          markInvalid(input);
          problems.push(input);
        }
        return;
      }
      if (!input.value.trim()) {
        markInvalid(input);
        problems.push(input);
      }
    });

    const email = form.email.value.trim();
    if (email && !isValidEmail(email)) { markInvalid(form.email); problems.push(form.email); }
    const phone = form.phone.value.trim();
    if (phone && !isValidPhone(phone)) { markInvalid(form.phone); problems.push(form.phone); }

    // The date picker enforces `min`, but a typed-in date can still be earlier
    [eventDate, trainingDate].forEach((input) => {
      if (input && !input.disabled && input.value && input.value < input.min) {
        markInvalid(input);
        problems.push(input);
      }
    });

    return problems;
  }

  /* ─── Build the email ─────────────────────────── */
  function collect() {
    const value = (name) => {
      const el = form.elements[name];
      if (!el) return '';
      if (el instanceof RadioNodeList) {
        const checked = [...el].filter((i) => i.checked && !i.disabled).map((i) => i.value);
        return checked.join(', ');
      }
      return el.disabled ? '' : el.value.trim();
    };

    const type = currentType();
    const details = {
      consultation: [
        ['Event type', value('eventType')],
        ['Event date', value('eventDate') && longDate(value('eventDate'))],
        ['Guest count', value('guests')],
        ['Location', value('location')],
      ],
      training: [
        ['Participants', value('participants')],
        ['Preferred date', value('trainingWhen') && longDate(value('trainingWhen'))],
        ['Format', value('trainingFormat')],
      ],
      partnership: [
        ['Partnership type', value('partnerType')],
        ['Website', value('website')],
      ],
      retainership: [
        ['Events per year', value('eventsPerYear')],
        ['Services needed', value('services')],
      ],
      other: [['Subject', value('subject')]],
    }[type].filter(([, v]) => v);

    const data = {
      type,
      typeLabel: TYPE_LABELS[type],
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      organisation: value('organisation'),
      channel: value('contactChannel'),
      note: value('message'),
      details,
    };

    const lines = [
      `New ${data.typeLabel} enquiry (contact page)`,
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      data.organisation ? `Organisation: ${data.organisation}` : null,
      ...details.map(([k, v]) => `${k}: ${v}`),
      `Preferred contact channel: ${data.channel}`,
      '',
      'Message:',
      data.note,
    ].filter((line) => line !== null);

    return {
      data,
      params: {
        name: data.name,
        from_name: data.name,
        email: data.email,
        reply_to: data.email,
        phone: data.phone,
        organisation: data.organisation,
        service_type: data.typeLabel,
        event: data.typeLabel,
        event_type: data.typeLabel,
        contact_channel: data.channel,
        subject: `${data.typeLabel} enquiry from ${data.name}`,
        message: lines.join('\n'),
      },
    };
  }

  function showError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  /* ─── Submit ──────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.hidden = true;

    const problems = validate();
    if (problems.length) {
      showError('Please check the highlighted fields.');
      const first = problems[0];
      first.focus({ preventScroll: true });
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (typeof emailjs === 'undefined') {
      showError('Sorry, we could not send your enquiry right now. Please reach us on WhatsApp or at info@mara-events.com.');
      return;
    }

    const { data, params } = collect();
    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending...';

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params)
      .then(() => {
        successName.textContent = data.name.split(' ')[0];
        successText.textContent = `Your ${data.typeLabel.toLowerCase()} enquiry has reached our team. We'll get back to you by ${data.channel.toLowerCase()}.`;
        const waText = `Hi Mara Events, I just sent a ${data.typeLabel.toLowerCase()} enquiry on your website.\n\nName: ${data.name}${data.organisation ? `\nOrganisation: ${data.organisation}` : ''}`;
        successWhatsApp.href = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(waText)}`;
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch((err) => {
        // Never report success when the message was not sent; the visitor's text stays in the form
        console.error('EmailJS Error:', err);
        showError('Sorry, we could not send your enquiry. Please try again, or reach us on WhatsApp or at info@mara-events.com.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Send Enquiry';
      });
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    applyType('');
    success.hidden = true;
    form.hidden = false;
    form.querySelector('input[name="enquiryType"]').focus();
  });
});
