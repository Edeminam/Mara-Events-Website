/* =============================================
   Mara Events — vendors.js
   Vendor Marketplace JavaScript
   ============================================= */

'use strict';

/* ─── Nav Toggle (shared pattern) ─────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (menu && menu.classList.contains('open') &&
        !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
})();

/* ─── Floating Particles ───────────────────────── */
(function () {
  const container = document.getElementById('vmParticles');
  if (!container) return;

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'vm-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 8}s;
      --delay: ${Math.random() * 4}s;
      opacity: ${0.2 + Math.random() * 0.6};
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
    `;
    container.appendChild(p);
  }
})();

/* ─── Vendor Directory Filter & Search ─────────── */
(function () {
  const catBtns     = document.querySelectorAll('.vm-cat-btn');
  const searchInput = document.getElementById('vendorSearch');
  const locationSel = document.getElementById('vendorLocation');
  const cards       = document.querySelectorAll('.vm-card[data-cat]');
  const emptyState  = document.getElementById('vmEmptyState');
  const loadMore    = document.getElementById('vmLoadMore');

  let activeCat = 'all';
  let visibleCount = 8;
  const INCREMENT = 4;

  function applyFilters() {
    const query    = (searchInput ? searchInput.value.toLowerCase().trim() : '');
    const location = (locationSel ? locationSel.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const cat   = card.dataset.cat || '';
      const loc   = card.dataset.location || '';
      const text  = card.innerText.toLowerCase();

      const catMatch  = activeCat === 'all' || cat === activeCat;
      const locMatch  = !location || loc === location;
      const textMatch = !query || text.includes(query);

      if (catMatch && locMatch && textMatch) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    }

    if (loadMore) {
      loadMore.style.display = visible > visibleCount ? 'flex' : 'none';
    }
  }

  // Category buttons
  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat || 'all';
      applyFilters();
    });
  });

  // Search input
  searchInput?.addEventListener('input', applyFilters);

  // Location filter
  locationSel?.addEventListener('change', applyFilters);

  // Load more
  loadMore?.addEventListener('click', () => {
    visibleCount += INCREMENT;
    applyFilters();
  });

  applyFilters();
})();

/* ─── Vendor Contact Modal ──────────────────────── */
function openContactModal(vendorName) {
  const modal  = document.getElementById('vendorContactModal');
  const nameEl = document.getElementById('vcModalVendorName');
  if (!modal) return;

  if (nameEl) nameEl.textContent = vendorName;
  modal.showModal();
  document.body.style.overflow = 'hidden';
}

(function () {
  const modal    = document.getElementById('vendorContactModal');
  const closeBtn = document.getElementById('vcModalClose');
  const form     = document.getElementById('vcModalForm');

  if (!modal) return;

  // Close button
  closeBtn?.addEventListener('click', closeContactModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) {
      closeContactModal();
    }
  });

  // Form submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you! Your inquiry has been sent to Mara Events. We will connect you shortly.');
    form.reset();
    closeContactModal();
  });

  function closeContactModal() {
    modal.close();
    document.body.style.overflow = '';
  }
})();

/* ─── Vendor Registration Form (Google Sheets / SheetDB ONLY) ─── */
(function () {
  const form       = document.getElementById('vendorRegForm');
  const submitBtn  = document.getElementById('vendorSubmitBtn');
  const successDlg = document.getElementById('vmSuccessDialog');
  const closeSucc  = document.getElementById('vmCloseSuccessBtn');

  if (!form) return;

  const SHEETDB_URL = 'https://sheetdb.io/api/v1/mdenhquvimfpq';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateVendorForm()) return;

    // Show loading state
    submitBtn.disabled = true;
    const btnText   = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    if (btnText)   btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-flex';

    // Helper to get selected dropdown option text
    const getSelectText = (selectEl) => {
      if (!selectEl || selectEl.selectedIndex < 0) return '';
      const opt = selectEl.options[selectEl.selectedIndex];
      return (opt && opt.value) ? opt.text.trim() : '';
    };

    // Collect form data
    const catEl  = document.getElementById('vCategory');
    const locEl  = document.getElementById('vLocation');
    const expEl  = document.getElementById('vYearsExp');

    const data = {
      bizName:      form.bizName.value.trim(),
      ownerName:    form.ownerName.value.trim(),
      email:        form.email.value.trim(),
      phone:        form.phone.value.trim(),
      category:     getSelectText(catEl) || form.category.value,
      location:     getSelectText(locEl) || form.location.value,
      website:      form.website.value.trim(),
      description:  form.description.value.trim(),
      yearsExp:     getSelectText(expEl) || form.yearsExp.value,
      referralCode: form.referralCode.value.trim(),
    };

    // Submit strictly to Google Sheets via SheetDB ONLY
    const success = await submitToSheetDB(data);

    // Reset loading UI
    submitBtn.disabled = false;
    if (btnText)   btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';

    if (!success) {
      alert('Unable to save application. Please check your network connection and try again.');
      return;
    }

    form.reset();

    // Show success dialog
    if (successDlg) successDlg.showModal();
  });

  closeSucc?.addEventListener('click', () => {
    successDlg?.close();
  });

  successDlg?.addEventListener('click', (e) => {
    const rect = successDlg.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) {
      successDlg.close();
    }
  });

  function validateVendorForm() {
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    const requiredFields = ['vBizName', 'vOwnerName', 'vEmail', 'vPhone', 'vCategory', 'vLocation', 'vDescription'];
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el?.classList.add('error');
        valid = false;
      }
    });

    // Email validation
    const emailEl = document.getElementById('vEmail');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      emailEl.classList.add('error');
      valid = false;
    }

    // Terms checkbox
    const terms = document.getElementById('vTerms');
    if (terms && !terms.checked) {
      terms.closest('.vm-checkbox-group')?.classList.add('error');
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector('.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  async function submitToSheetDB(data) {
    try {
      // Step 1: Fetch exact column keys from the Google Sheet
      let keys = [];
      try {
        const keyRes = await fetch(`${SHEETDB_URL}/keys`);
        if (keyRes.ok) {
          keys = await keyRes.json();
        }
      } catch (kErr) {
        console.warn('[Mara Vendors] Dynamic key fetch fallback:', kErr);
      }

      // Step 2: Build the exact row payload matching the Google Sheet columns
      const row = {};

      if (Array.isArray(keys) && keys.length > 0) {
        keys.forEach(k => {
          const trimmed = k.trim().toLowerCase();
          if (trimmed.includes('business')) {
            row[k] = data.bizName;
          } else if (trimmed.includes('owner') || trimmed.includes('contact name')) {
            row[k] = data.ownerName;
          } else if (trimmed.includes('email')) {
            row[k] = data.email;
          } else if (trimmed.includes('phone')) {
            row[k] = data.phone;
          } else if (trimmed.includes('category')) {
            row[k] = data.category;
          } else if (trimmed.includes('location') || trimmed.includes('city')) {
            row[k] = data.location;
          } else if (trimmed.includes('website') || trimmed.includes('social')) {
            row[k] = data.website;
          } else if (trimmed.includes('service') || trimmed.includes('describe') || trimmed.includes('description')) {
            row[k] = data.description;
          } else if (trimmed.includes('experience') || trimmed.includes('years')) {
            row[k] = data.yearsExp;
          } else if (trimmed.includes('referral')) {
            row[k] = data.referralCode || '';
          }
        });
      }

      // Fallback matching exact current sheet keys if keys API was unavailable
      if (Object.keys(row).length === 0) {
        row['Business Name ']            = data.bizName;
        row['Owner / Contact Name ']     = data.ownerName;
        row['Email Address ']            = data.email;
        row['Phone Number ']             = data.phone;
        row['Vendor Category ']          = data.category;
        row['Primary Location ']         = data.location;
        row['Website / Social Media Link'] = data.website;
        row['Describe Your Services ']   = data.description;
        row['Years of Experience']       = data.yearsExp;
        row['Referral Code (Optional)']  = data.referralCode || '';
      }

      // Step 3: POST data to SheetDB (Google Sheets)
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [row] }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Mara Vendors] SheetDB error:', response.status, errText);
        return false;
      }

      const result = await response.json();
      console.info('[Mara Vendors] SheetDB response:', result);
      return result && (result.created === 1 || result.created > 0);

    } catch (err) {
      console.error('[Mara Vendors] Submission error:', err);
      return false;
    }
  }

})();

/* ─── Referral Copy Button ─────────────────────── */
(function () {
  const copyBtn     = document.getElementById('refCopyBtn');
  const linkDisplay = document.getElementById('refLinkDisplay');

  if (!copyBtn || !linkDisplay) return;

  copyBtn.addEventListener('click', async () => {
    const text = linkDisplay.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      copyBtn.style.color = '#27ae60';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        copyBtn.style.color = '';
      }, 2000);
    } catch {
      // Fallback for non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  });
})();

/* ─── FAQ Accordion ─────────────────────────────── */
(function () {
  const faqItems = document.querySelectorAll('.vm-faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.vm-faq-q');

    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(fi => {
        fi.classList.remove('open');
        fi.querySelector('.vm-faq-q')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle this one
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ─── Scroll Reveal ─────────────────────────────── */
(function () {
  const targets = document.querySelectorAll(
    '.vm-why-card, .vm-card, .vm-tier, .vm-faq-item, .vm-referral-card'
  );

  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(t => observer.observe(t));
})();
