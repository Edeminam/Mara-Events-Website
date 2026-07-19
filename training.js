/* =============================================
   MARA ACADEMY — training.js
   ============================================= */

"use strict";

document.addEventListener('DOMContentLoaded', () => {

  // ─── CURRICULUM ACCORDION ───────────────────────────────────────────
  const weeks = document.querySelectorAll('.curriculum-week');
  
  if (weeks.length > 0) {
    weeks[0].classList.add('expanded');
    weeks.forEach(week => {
      const header = week.querySelector('.week-header');
      if (header) {
        header.addEventListener('click', () => {
          const isExpanded = week.classList.contains('expanded');
          weeks.forEach(w => w.classList.remove('expanded'));
          if (!isExpanded) week.classList.add('expanded');
        });
      }
    });
  }

  // ─── FLUTTERWAVE REDIRECT CALLBACK HANDLER ──────────────────────────
  // After a successful payment, Flutterwave redirects back to:
  // training.html?status=successful&tx_ref=MARA-xxx&transaction_id=yyy
  // We detect those URL params here and show the receipt modal.
  (function handleFlutterwaveReturn() {
    const params        = new URLSearchParams(window.location.search);
    const status        = params.get('status');
    const transactionId = params.get('transaction_id');

    if (status === 'successful' && transactionId) {
      // Retrieve data saved before the redirect
      const storedEmail = sessionStorage.getItem('mara_reg_email') || '';
      const storedPhone = sessionStorage.getItem('mara_reg_phone') || '';

      // Populate receipt dialog
      const emailEl = document.getElementById('receipt-email');
      if (emailEl) emailEl.textContent = storedEmail;

      const phoneEl = document.getElementById('receipt-phone');
      if (phoneEl) phoneEl.textContent = storedPhone;

      const txEl = document.getElementById('receipt-tx-id');
      if (txEl) txEl.textContent = transactionId;

      // Show the confirmed-payment receipt modal
      const receiptDialog = document.getElementById('receiptDialog');
      if (receiptDialog) receiptDialog.showModal();

      // Clean up sessionStorage
      sessionStorage.removeItem('mara_reg_email');
      sessionStorage.removeItem('mara_reg_phone');
      sessionStorage.removeItem('mara_reg_txref');

      // Clean the URL so a page refresh does not re-trigger the modal
      window.history.replaceState({}, '', window.location.pathname);
    }
  })();

  // ─── FORM ELEMENTS ──────────────────────────────────────────────────
  const form                  = document.getElementById('registrationForm');
  const btnSubmitRegistration = document.getElementById('btnSubmitRegistration');
  const receiptDialog         = document.getElementById('receiptDialog');
  const closeReceiptBtn       = document.getElementById('closeReceiptBtn');
  const inpEmail              = document.getElementById('reg-email');
  const inpPhone              = document.getElementById('reg-phone');
  const errEmail              = document.getElementById('email-error');
  const errPhone              = document.getElementById('phone-error');

  // Real-time error clearing on input
  const registerInputReset = (input, errorSpan) => {
    if (input && errorSpan) {
      input.addEventListener('input', () => {
        errorSpan.textContent = '';
        input.setCustomValidity('');
      });
    }
  };

  registerInputReset(inpEmail, errEmail);
  registerInputReset(inpPhone, errPhone);

  // Email validation
  function validateEmail() {
    const val = inpEmail ? inpEmail.value.trim() : '';
    if (!val) {
      if (errEmail) errEmail.textContent = 'Email address is required.';
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      if (errEmail) errEmail.textContent = 'Please enter a valid email address.';
      return false;
    }
    if (errEmail) errEmail.textContent = '';
    return true;
  }

  // Phone validation
  function validatePhone() {
    const val = inpPhone ? inpPhone.value.trim() : '';
    if (!val) {
      if (errPhone) errPhone.textContent = 'Phone number is required.';
      return false;
    }
    const digits = val.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      if (errPhone) errPhone.textContent = 'Phone number must be between 10 and 13 digits.';
      return false;
    }
    if (errPhone) errPhone.textContent = '';
    return true;
  }

  if (inpEmail) inpEmail.addEventListener('blur', validateEmail);
  if (inpPhone) inpPhone.addEventListener('blur', validatePhone);

  function validateForm() {
    const emailOk = validateEmail();
    const phoneOk = validatePhone();
    return emailOk && phoneOk;
  }

  // ─── FORM SUBMIT: redirect to Flutterwave with redirect_url ─────────
  // Flutterwave payment links support ?redirect_url= out of the box.
  // On successful payment Flutterwave appends:
  //   ?status=successful&tx_ref=...&transaction_id=...
  // The handleFlutterwaveReturn() IIFE above reads those on page load.
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const studentEmail = inpEmail ? inpEmail.value.trim() : '';
      const studentPhone = inpPhone ? inpPhone.value.trim() : '';
      const txRef        = 'MARA-' + Date.now();

      // Persist data across the navigation to Flutterwave and back
      sessionStorage.setItem('mara_reg_email', studentEmail);
      sessionStorage.setItem('mara_reg_phone', studentPhone);
      sessionStorage.setItem('mara_reg_txref', txRef);

      // Build Flutterwave URL with this page as the redirect target
      const redirectUrl = window.location.origin + window.location.pathname;
      const paymentUrl  = 'https://flutterwave.com/pay/b6egox7yzyeu'
                        + '?redirect_url=' + encodeURIComponent(redirectUrl);

      // Show loading state and navigate
      btnSubmitRegistration.disabled    = true;
      btnSubmitRegistration.textContent = 'Redirecting to payment…';
      window.location.href = paymentUrl;
    });
  }

  // ─── RECEIPT DIALOG CLOSE ───────────────────────────────────────────
  if (receiptDialog && closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      receiptDialog.close();
      window.location.href = 'index.html';
    });
  }

  // ─── FAQ ACCORDION TOGGLERS ──────────────────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isExpanded = item.classList.contains('expanded');
          faqItems.forEach(i => i.classList.remove('expanded'));
          if (!isExpanded) item.classList.add('expanded');
        });
      }
    });
  }

});
