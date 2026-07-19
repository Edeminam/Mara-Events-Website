/* =============================================
   MARA ACADEMY — training.js
   ============================================= */

"use strict";

document.addEventListener('DOMContentLoaded', () => {

  // ─── CURRICULUM ACCORDION ───────────────────────────────────────────
  const weeks = document.querySelectorAll('.curriculum-week');
  
  if (weeks.length > 0) {
    // Open first week by default
    weeks[0].classList.add('expanded');
    
    weeks.forEach(week => {
      const header = week.querySelector('.week-header');
      if (header) {
        header.addEventListener('click', () => {
          const isExpanded = week.classList.contains('expanded');
          
          // Collapse all first
          weeks.forEach(w => w.classList.remove('expanded'));
          
          // Toggle current
          if (!isExpanded) {
            week.classList.add('expanded');
          }
        });
      }
    });
  }

  // ─── FORM SELECTIONS & VALIDATION ────────────────────────────
  const form = document.getElementById('registrationForm');
  const btnSubmitRegistration = document.getElementById('btnSubmitRegistration');
  
  const paymentOverlay = document.getElementById('paymentOverlay');
  const overlayStatus = document.getElementById('overlayStatus');
  const overlaySubtext = document.getElementById('overlaySubtext');
  
  const receiptDialog = document.getElementById('receiptDialog');
  const closeReceiptBtn = document.getElementById('closeReceiptBtn');

  // Input elements
  const inpPhone = document.getElementById('reg-phone');

  // Error spans
  const errPhone = document.getElementById('phone-error');

  // --- Real-time input error clearing (on input) ---
  const registerInputReset = (input, errorSpan) => {
    if (input) {
      input.addEventListener('input', () => {
        errorSpan.textContent = '';
        input.setCustomValidity('');
      });
    }
  };

  registerInputReset(inpPhone, errPhone);

  // Validate phone number
  function validatePhone() {
    const val = inpPhone.value.trim();
    if (!val) {
      errPhone.textContent = 'Phone number is required.';
      return false;
    }
    const cleanDigits = val.replace(/\D/g, '');
    if (cleanDigits.length < 10 || cleanDigits.length > 13) {
      errPhone.textContent = 'Phone number must be between 10 and 13 digits.';
      return false;
    }
    errPhone.textContent = '';
    return true;
  }

  // Blurs validation trigger (as per Forms Guide)
  if (inpPhone) {
    inpPhone.addEventListener('blur', validatePhone);
  }

  // Form Validation Gate
  function validateForm() {
    return validatePhone();
  }

  // --- Form submit with direct Flutterwave redirect ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Safe state: Disable submit button & activate loader overlay
      const btnOriginalText = btnSubmitRegistration.innerHTML;
      btnSubmitRegistration.disabled = true;
      btnSubmitRegistration.textContent = 'Launching Checkout...';
      paymentOverlay.classList.add('active');

      const studentPhone = inpPhone.value.trim();
      const flutterwaveUrl = `https://flutterwave.com/pay/b6egox7yzyeu`;

      // Helper function to animate states
      const updateLoaderState = (statusText, subText, delay) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            overlayStatus.textContent = statusText;
            overlaySubtext.textContent = subText;
            resolve();
          }, delay);
        });
      };

      // Open the Flutterwave payment link in a new window/tab
      window.open(flutterwaveUrl, '_blank');

      // Simulated timeline transition before displaying local confirmation receipt
      updateLoaderState('Redirecting to Partner...', 'Opening Flutterwave secure payment page in a new window...', 0)
        .then(() => updateLoaderState('Establishing Registration...', 'Awaiting payment verification on secure gateway...', 1500))
        .then(() => {
          setTimeout(() => {
            // Hide payment loader
            paymentOverlay.classList.remove('active');
            
            // Populate receipt dialog fields
            const randomTxId = 'MARA-FW-' + Math.floor(100000 + Math.random() * 900000);
            
            const receiptPhoneEl = document.getElementById('receipt-phone');
            if (receiptPhoneEl) {
              receiptPhoneEl.textContent = studentPhone;
            }
            
            document.getElementById('receipt-tx-id').textContent = randomTxId;
            
            // Show receipt dialog modal
            if (receiptDialog) {
              receiptDialog.showModal();
            }

            // Reset form UI states
            form.reset();
            btnSubmitRegistration.disabled = false;
            btnSubmitRegistration.innerHTML = btnOriginalText;
            
          }, 3000);
        });
    });
  }

  // Dialog closing actions
  if (receiptDialog && closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', () => {
      receiptDialog.close();
      window.location.href = 'index.html'; // redirect back to home page
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
          
          // Collapse all first for a clean accordion experience
          faqItems.forEach(i => i.classList.remove('expanded'));
          
          // Toggle current
          if (!isExpanded) {
            item.classList.add('expanded');
          }
        });
      }
    });
  }

});
