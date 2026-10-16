/* =============================================
   Mara Events — service.js
   Enquiry form on the service landing pages. The page's service
   comes from data-service on the form; enquiries go through the same
   EmailJS account as the booking and contact forms.
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('serviceForm');
  if (!form) return;

  const EMAILJS_PUBLIC_KEY = 'djfFVv8ATRg9mo_1u';
  const EMAILJS_SERVICE = 'service_6vspc2j';
  const EMAILJS_TEMPLATE = 'template_87ahk4b';
  const BUSINESS_WHATSAPP = '2349011046473'; // international format, no +

  const service = form.dataset.service || 'Event enquiry';
  const page = window.location.pathname;
  const formError = document.getElementById('serviceError');
  const success = document.getElementById('serviceSuccess');
  const successName = document.getElementById('serviceSuccessName');
  const successWhatsApp = document.getElementById('serviceSuccessWhatsApp');
  const submitBtn = form.querySelector('.inq-submit');
  const submitLabel = submitBtn.querySelector('.inq-submit-label');

  if (typeof emailjs !== 'undefined') {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch (err) {}
  }

  const isoToday = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const longDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // No dates in the past
  const dateInput = form.elements.eventDate;
  if (dateInput) dateInput.min = isoToday();

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const isValidPhone = (v) => {
    const digits = v.replace(/[^\d]/g, '');
    return /^\+?[\d\s()-]+$/.test(v) && digits.length >= 10 && digits.length <= 15;
  };

  function clearInvalid(el) {
    if (!el || !el.closest) return;
    el.classList.remove('is-invalid');
    el.closest('.inq-chips, .inq-channels')?.classList.remove('is-invalid');
  }
  form.addEventListener('input', (e) => clearInvalid(e.target));
  form.addEventListener('change', (e) => clearInvalid(e.target));

  function validate() {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    const problems = [];
    const seenGroups = new Set();

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (!input.required) return;
      if (input.type === 'radio') {
        if (seenGroups.has(input.name)) return;
        seenGroups.add(input.name);
        if (!form.querySelector(`input[name="${input.name}"]:checked`)) {
          input.closest('.inq-chips, .inq-channels')?.classList.add('is-invalid');
          problems.push(input);
        }
      } else if (!input.value.trim()) {
        input.classList.add('is-invalid');
        problems.push(input);
      }
    });

    const { email, phone } = form.elements;
    if (email.value.trim() && !isValidEmail(email.value.trim())) { email.classList.add('is-invalid'); problems.push(email); }
    if (phone.value.trim() && !isValidPhone(phone.value.trim())) { phone.classList.add('is-invalid'); problems.push(phone); }
    if (dateInput && dateInput.value && dateInput.value < dateInput.min) { dateInput.classList.add('is-invalid'); problems.push(dateInput); }
    return problems;
  }

  function value(name) {
    const el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList) return [...el].filter((i) => i.checked).map((i) => i.value).join(', ');
    return el.value.trim();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.hidden = true;

    const problems = validate();
    if (problems.length) {
      formError.textContent = 'Please check the highlighted fields.';
      formError.hidden = false;
      problems[0].focus({ preventScroll: true });
      problems[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (typeof emailjs === 'undefined') {
      formError.textContent = 'Sorry, we could not send your enquiry right now. Please reach us on WhatsApp or at info@mara-events.com.';
      formError.hidden = false;
      return;
    }

    const data = {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      eventType: value('eventType'),
      eventDate: value('eventDate') ? longDate(value('eventDate')) : '',
      guests: value('guests'),
      location: value('location'),
      budget: value('budget'),
      channel: value('contactChannel'),
      note: value('message'),
    };

    const lines = [
      `New ${service} enquiry (${page})`,
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      data.eventType ? `Event type: ${data.eventType}` : null,
      data.eventDate ? `Event date: ${data.eventDate}` : null,
      data.guests ? `Guest count: ${data.guests}` : null,
      data.location ? `Location: ${data.location}` : null,
      `Budget range: ${data.budget}`,
      `Preferred contact channel: ${data.channel}`,
      data.note ? '' : null,
      data.note ? 'Message:' : null,
      data.note || null,
    ].filter((line) => line !== null);

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending...';

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      name: data.name,
      from_name: data.name,
      email: data.email,
      reply_to: data.email,
      phone: data.phone,
      service_type: service,
      event: data.eventType || service,
      event_type: data.eventType || service,
      event_date: data.eventDate,
      guest_count: data.guests,
      budget: data.budget,
      location: data.location,
      contact_channel: data.channel,
      subject: `${service} enquiry from ${data.name}`,
      message: lines.join('\n'),
    })
      .then(() => {
        successName.textContent = data.name.split(' ')[0];
        const waText = `Hi Mara Events, I just sent a ${service.toLowerCase()} enquiry on your website.\n\nName: ${data.name}${data.eventDate ? `\nDate: ${data.eventDate}` : ''}${data.guests ? `\nGuests: ${data.guests}` : ''}`;
        successWhatsApp.href = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(waText)}`;
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch((err) => {
        // Never report success when the message was not sent; the visitor's answers stay in the form
        console.error('EmailJS Error:', err);
        formError.textContent = 'Sorry, we could not send your enquiry. Please try again, or reach us on WhatsApp or at info@mara-events.com.';
        formError.hidden = false;
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Send Enquiry';
      });
  });
});
