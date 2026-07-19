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

  // ─── PAYMENT RETURN HANDLER (runs in the redirect tab) ──────────────
  // When Flutterwave redirects the payment tab back to:
  // training.html?status=successful&transaction_id=xxx
  // This IIFE detects it, signals the main tab via localStorage, then
  // closes the redirect tab so the user lands back on the main tab.
  (function handlePaymentReturn() {
    const params        = new URLSearchParams(window.location.search);
    const status        = params.get('status');
    const transactionId = params.get('transaction_id');

    if (!status) return; // not a payment-return load — do nothing

    if (status === 'successful' && transactionId) {
      // Signal the main tab
      localStorage.setItem('mara_payment_status', 'successful');
      localStorage.setItem('mara_payment_txid',   transactionId);
    } else {
      // Payment failed/cancelled — signal that too so main tab can reset
      localStorage.setItem('mara_payment_status', 'failed');
    }

    // Clean the URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    // Try to close this redirect tab (works because it was opened by window.open)
    window.close();

    // Fallback: if window.close() is blocked, show a minimal message
    // (browser replaces the Flutterwave content so blank-looking page is fine)
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

  // Waiting state flag — true while the Flutterwave tab is open
  let isWaitingForPayment = false;
  let paymentConfirmed    = false;

  // Save original button HTML so we can restore it
  const btnOriginalHTML = btnSubmitRegistration ? btnSubmitRegistration.innerHTML : '';

  // ─── REAL-TIME ERROR CLEARING ───────────────────────────────────────
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

  // ─── VALIDATION ─────────────────────────────────────────────────────
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

  // ─── RESET FORM TO DEFAULT ──────────────────────────────────────────
  function resetFormToDefault() {
    if (form) form.reset();
    if (errEmail) errEmail.textContent = '';
    if (errPhone) errPhone.textContent = '';
    if (btnSubmitRegistration) {
      btnSubmitRegistration.disabled  = false;
      btnSubmitRegistration.innerHTML = btnOriginalHTML;
    }
    sessionStorage.removeItem('mara_reg_email');
    sessionStorage.removeItem('mara_reg_phone');
    isWaitingForPayment = false;
    paymentConfirmed    = false;
  }

  // ─── SHOW RECEIPT MODAL (called after confirmed payment) ─────────────
  function showReceipt(email, phone, txId) {
    const emailEl = document.getElementById('receipt-email');
    if (emailEl) emailEl.textContent = email || '-';

    const phoneEl = document.getElementById('receipt-phone');
    if (phoneEl) phoneEl.textContent = phone || '-';

    const txEl = document.getElementById('receipt-tx-id');
    if (txEl) txEl.textContent = txId || '-';

    if (receiptDialog) receiptDialog.showModal();

    // Clean up
    localStorage.removeItem('mara_payment_status');
    localStorage.removeItem('mara_payment_txid');
    sessionStorage.removeItem('mara_reg_email');
    sessionStorage.removeItem('mara_reg_phone');
    isWaitingForPayment = false;
    paymentConfirmed    = true;
  }

  // ─── CROSS-TAB PAYMENT CONFIRMATION (storage event) ─────────────────
  // The redirect tab writes to localStorage after Flutterwave confirms.
  // The storage event fires in ALL OTHER tabs on the same origin.
  window.addEventListener('storage', (e) => {
    if (e.key !== 'mara_payment_status' || !isWaitingForPayment) return;

    if (e.newValue === 'successful') {
      paymentConfirmed = true;
      const email = sessionStorage.getItem('mara_reg_email') || '';
      const phone = sessionStorage.getItem('mara_reg_phone') || '';
      const txId  = localStorage.getItem('mara_payment_txid') || '';
      showReceipt(email, phone, txId);
    } else {
      // Payment failed / was cancelled in the other tab
      resetFormToDefault();
    }
  });

  // ─── VISIBILITY CHANGE — reset if user returns without paying ────────
  // When the user closes the Flutterwave tab or switches back to this tab
  // without completing payment, the page becomes visible again.
  // We wait ~700 ms for any pending storage event to fire first.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !isWaitingForPayment) return;

    setTimeout(() => {
      // If payment was NOT confirmed during the grace period, reset
      if (!paymentConfirmed && isWaitingForPayment) {
        resetFormToDefault();
      }
    }, 700);
  });

  // ─── GOOGLE SHEET LOGGING ─────────────────────────────────────────────
  // Paste your deployed Apps Script Web App URL below.
  // Leave blank ("") to disable sheet logging without breaking anything.
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxJG5nb2_qayB9yWV0qiT1_rTLgBnKAhkNSc0M3sMKMxxxfJrUeLrnR8DZNk-n0FnKu/exec';

  /**
   * Fire-and-forget POST to the Google Apps Script endpoint.
   * Uses no-cors so the request always succeeds even without CORS headers.
   * Errors are caught and logged silently — sheet logging never blocks payment.
   */
  async function sendToSheet(email, phone) {
    if (!SHEET_ENDPOINT) return; // not configured yet
    try {
      await fetch(SHEET_ENDPOINT, {
        method : 'POST',
        mode   : 'no-cors',   // avoids CORS pre-flight; response will be opaque
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ email, phone }),
      });
    } catch (err) {
      console.warn('[Mara] Sheet logging failed (non-blocking):', err);
    }
  }

  // ─── FORM SUBMIT ─────────────────────────────────────────────────────
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const studentEmail = inpEmail ? inpEmail.value.trim() : '';
      const studentPhone = inpPhone ? inpPhone.value.trim() : '';

      // Log to Google Sheet (fire-and-forget — does NOT block payment)
      sendToSheet(studentEmail, studentPhone);

      // Persist data so we can populate the receipt after the redirect
      sessionStorage.setItem('mara_reg_email', studentEmail);
      sessionStorage.setItem('mara_reg_phone', studentPhone);

      // Clear any leftover payment signal from a previous attempt
      localStorage.removeItem('mara_payment_status');
      localStorage.removeItem('mara_payment_txid');

      // Build Flutterwave URL — redirect_url brings the new tab back here
      const redirectUrl = window.location.origin + window.location.pathname;
      const paymentUrl  = 'https://flutterwave.com/pay/b6egox7yzyeu'
                        + '?redirect_url=' + encodeURIComponent(redirectUrl);

      // Open Flutterwave in a new tab
      window.open(paymentUrl, '_blank', 'noopener');

      // Enter "waiting" state
      isWaitingForPayment = true;
      paymentConfirmed    = false;
      btnSubmitRegistration.disabled  = true;
      btnSubmitRegistration.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Awaiting payment…';
    });
  }

  // ─── RECEIPT DIALOG CLOSE ────────────────────────────────────────────
  if (receiptDialog && closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      receiptDialog.close();
      window.location.href = 'index.html';
    });
  }

  // ─── FAQ ACCORDION ───────────────────────────────────────────────────
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
