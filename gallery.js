/* =============================================
   gallery.js — Mara Events Gallery Page
   ============================================= */

'use strict';

(function () {

  /* ─── VIDEO OVERLAY ─────────────────────────── */
  const videoPlayer  = document.getElementById('galleryVideoPlayer');
  const videoOverlay = document.getElementById('galleryVideoOverlay');
  const playBtn      = document.getElementById('galleryPlayBtn');

  if (videoPlayer && videoOverlay && playBtn) {
    function hideOverlayAndPlay() {
      videoOverlay.classList.add('hidden');
      videoPlayer.play();
    }

    playBtn.addEventListener('click', hideOverlayAndPlay);
    videoOverlay.addEventListener('click', hideOverlayAndPlay);

    // Re-show overlay if paused / ended
    videoPlayer.addEventListener('pause', () => {
      if (videoPlayer.ended || videoPlayer.paused) {
        videoOverlay.classList.remove('hidden');
      }
    });

    videoPlayer.addEventListener('ended', () => {
      videoOverlay.classList.remove('hidden');
    });
  }

  /* ─── GALLERY FILTER ────────────────────────── */
  const grid       = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const countEl    = document.getElementById('galleryCount');
  const emptyEl    = document.getElementById('galleryEmpty');
  const lightbox   = document.getElementById('galleryLightbox');
  const lbImg      = document.getElementById('lightboxImg');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbCounter  = document.getElementById('lightboxCounter');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  const lbBackdrop = document.getElementById('lightboxBackdrop');

  if (!grid) return;

  let allItems     = Array.from(grid.querySelectorAll('.gallery-item'));
  let visibleItems = [...allItems];
  let currentIndex = 0;
  let touchStartX  = 0;

  // ── Filter Logic ─────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      let visible = 0;
      allItems.forEach((item, i) => {
        const cat  = item.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden');
          item.style.animationDelay = `${(i % 8) * 0.05}s`;
          item.classList.remove('fade-in');
          void item.offsetWidth; // force reflow for re-animation
          item.classList.add('fade-in');
          visible++;
        } else {
          item.classList.add('hidden');
          item.classList.remove('fade-in');
        }
      });

      visibleItems = allItems.filter(item => !item.classList.contains('hidden'));

      if (countEl) {
        countEl.innerHTML = `Showing <strong>${visible}</strong> moment${visible !== 1 ? 's' : ''}`;
      }

      if (emptyEl) {
        emptyEl.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  });

  // ── Lightbox Open ─────────────────────────────
  allItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = visibleItems.indexOf(item);
      openLightbox(idx === -1 ? 0 : idx);
    });
  });

  function openLightbox(idx) {
    currentIndex = idx;
    updateLightboxImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { if (lbImg) lbImg.src = ''; }, 360);
  }

  function updateLightboxImage(idx) {
    if (!visibleItems[idx]) return;
    const item    = visibleItems[idx];
    const img     = item.querySelector('img');
    const label   = (item.dataset.label || item.querySelector('.gallery-item-cat')?.textContent || '').trim();

    // Fade out image & caption in sync
    if (lbImg) {
      lbImg.style.opacity   = '0';
      lbImg.style.transform = 'scale(0.97)';
      lbImg.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }
    if (lbCaption) {
      lbCaption.style.opacity = '0';
      lbCaption.style.transition = 'opacity 0.15s ease';
    }

    setTimeout(() => {
      if (lbImg) {
        lbImg.src = img.src;
        lbImg.alt = img.alt || label;
        lbImg.style.opacity   = '1';
        lbImg.style.transform = 'scale(1)';
      }
      if (lbCaption) {
        lbCaption.textContent = label;
        lbCaption.style.opacity = '1';
      }
      if (lbCounter) {
        lbCounter.textContent = `${idx + 1} / ${visibleItems.length}`;
      }
    }, 140);
  }


  function prevImage() {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxImage(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightboxImage(currentIndex);
  }

  // ── Lightbox Controls ────────────────────────
  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev)     lbPrev.addEventListener('click', prevImage);
  if (lbNext)     lbNext.addEventListener('click', nextImage);

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  // Touch swipe support
  if (lightbox) {
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
    }, { passive: true });
  }

  // ── Entrance animation via IntersectionObserver ─
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    allItems.forEach(item => observer.observe(item));
  }

  // ── PREVENT IMAGE RIGHT-CLICK / COPY / DRAG ──────────────
  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery-grid') || e.target.closest('.gallery-teaser-grid') || e.target.closest('.gallery-lightbox')) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('copy', e => {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery-grid') || e.target.closest('.gallery-teaser-grid') || e.target.closest('.gallery-lightbox')) {
      e.preventDefault();
      return false;
    }
  });

})();

