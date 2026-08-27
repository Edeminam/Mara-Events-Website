/* =============================================
   gallery.js — Mara Events Gallery Page
   ============================================= */

'use strict';

(function () {

  /* ─── VIDEO POPUP MODAL ───────────────────────── */
  const videoModal         = document.getElementById('videoModal');
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const videoModalClose    = document.getElementById('videoModalClose');
  const videoModalBox      = document.getElementById('videoModalBox');
  const modalVideoPlayer   = document.getElementById('modalVideoPlayer');
  const videoModalTag      = document.getElementById('videoModalTag');
  const videoModalTitle    = document.getElementById('videoModalTitle');
  const videoModalDesc     = document.getElementById('videoModalDesc');

  function openVideoModal(videoSrc, orientation, tag, title, desc) {
    if (!videoModal || !modalVideoPlayer) return;

    if (videoModalBox) {
      videoModalBox.classList.remove('portrait-mode', 'landscape-mode');
      if (orientation === 'portrait') {
        videoModalBox.classList.add('portrait-mode');
      } else {
        videoModalBox.classList.add('landscape-mode');
      }
    }

    if (videoModalTag)   videoModalTag.innerHTML   = tag || '<i class="fa-solid fa-film"></i> Video';
    if (videoModalTitle) videoModalTitle.innerHTML = title || '';
    if (videoModalDesc)  videoModalDesc.innerHTML  = desc || '';

    modalVideoPlayer.src = videoSrc;
    modalVideoPlayer.currentTime = 0;
    modalVideoPlayer.controls = true;

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Play video with audio unmute handling
    const playPromise = modalVideoPlayer.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Video autoplay prevented, user can click play on controls:', err);
      });
    }

    if (videoModalClose) {
      videoModalClose.focus();
    }
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.removeAttribute('src');
      modalVideoPlayer.load();
    }
  }

  if (videoModalClose)    videoModalClose.addEventListener('click', closeVideoModal);
  if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);

  /* ─── FEATURED VIDEO BANNER CLICK ────────────── */
  const featuredVideoWrap = document.getElementById('galleryVideoWrap');
  const featuredPlayBtn   = document.getElementById('galleryPlayBtn');
  const featuredOverlay   = document.getElementById('galleryVideoOverlay');

  function playFeaturedVideoPopup() {
    openVideoModal(
      'images/Pictures/WhatsApp Video 2026-08-11 at 20.26.40.mp4',
      'landscape',
      '<i class="fa-solid fa-film"></i> Behind The Scenes &bull; Event Highlights',
      'See Us In Action &mdash; Mara Events Highlights',
      'Watch how we transform visions into extraordinary experiences through world-class planning and production.'
    );
  }

  if (featuredVideoWrap) {
    featuredVideoWrap.addEventListener('click', playFeaturedVideoPopup);
    featuredVideoWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playFeaturedVideoPopup();
      }
    });
  }
  if (featuredPlayBtn) {
    featuredPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playFeaturedVideoPopup();
    });
  }

  /* ─── GALLERY GRID & FILTER ──────────────────── */
  const grid       = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const countEl    = document.getElementById('galleryCount');
  const emptyEl    = document.getElementById('galleryEmpty');
  const lightbox   = document.getElementById('galleryLightbox');
  const lbImg      = document.getElementById('lightboxImg');
  const lbVideo    = document.getElementById('lightboxVideo');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbCounter  = document.getElementById('lightboxCounter');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  const lbBackdrop = document.getElementById('lightboxBackdrop');

  if (!grid) return;

  const allItems     = Array.from(grid.querySelectorAll('.gallery-item'));
  const videoCards   = Array.from(grid.querySelectorAll('.gallery-item--video-card'));
  let visibleItems = [...allItems];
  let currentIndex = 0;
  let touchStartX  = 0;

  // Initialize count badge on load
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${allItems.length}</strong> moments`;
  }

  // Hook all video cards to open dimension-optimized video popup
  videoCards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    function triggerCardVideo(e) {
      e.stopPropagation();
      const videoSrc    = card.dataset.video;
      const orientation = card.dataset.orientation || 'landscape';
      const tag         = card.dataset.tag || '<i class="fa-solid fa-film"></i> Video';
      const title       = card.dataset.title || card.dataset.label || '';
      const desc        = card.dataset.desc || '';
      if (videoSrc) {
        openVideoModal(videoSrc, orientation, tag, title, desc);
      }
    }

    card.addEventListener('click', triggerCardVideo);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerCardVideo(e);
      }
    });

    const playBtn = card.querySelector('.gallery-card-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', triggerCardVideo);
    }
  });

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
        const cat = (item.dataset.category || '').toLowerCase().trim();
        const catList = cat.split(/\s+/);
        const show = filter === 'all' || catList.includes(filter) || cat === filter;

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

  // ── Photo Lightbox Open ─────────────────────────────
  allItems.forEach(item => {
    // Video cards trigger the dedicated videoModal instead of photo lightbox
    if (item.classList.contains('gallery-item--video-card')) {
      return;
    }
    item.addEventListener('click', () => {
      const idx = visibleItems.indexOf(item);
      openLightbox(idx === -1 ? 0 : idx);
    });
  });

  function openLightbox(idx) {
    currentIndex = idx;
    updateLightboxImage(currentIndex);
    if (lightbox) {
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lbVideo) {
      lbVideo.pause();
      lbVideo.src = '';
      lbVideo.style.display = 'none';
    }
    setTimeout(() => { if (lbImg) lbImg.src = ''; }, 360);
  }

  function updateLightboxImage(idx) {
    if (!visibleItems[idx]) return;
    const item      = visibleItems[idx];
    const img       = item.querySelector('img');
    const videoSrc  = item.dataset.video;
    const label     = (item.dataset.label || item.querySelector('.gallery-item-cat')?.textContent || '').trim();

    if (lbVideo) {
      lbVideo.pause();
    }

    if (lbImg) {
      lbImg.style.opacity   = '0';
      lbImg.style.transform = 'scale(0.97)';
      lbImg.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }
    if (lbVideo) {
      lbVideo.style.opacity   = '0';
      lbVideo.style.transform = 'scale(0.97)';
      lbVideo.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }
    if (lbCaption) {
      lbCaption.style.opacity = '0';
      lbCaption.style.transition = 'opacity 0.15s ease';
    }

    setTimeout(() => {
      if (videoSrc && lbVideo) {
        if (lbImg) {
          lbImg.style.display = 'none';
          lbImg.src = '';
        }
        lbVideo.style.display = 'block';
        lbVideo.src = videoSrc;
        lbVideo.style.opacity   = '1';
        lbVideo.style.transform = 'scale(1)';
        lbVideo.play().catch(() => {});
      } else {
        if (lbVideo) {
          lbVideo.pause();
          lbVideo.src = '';
          lbVideo.style.display = 'none';
        }
        if (lbImg) {
          lbImg.style.display = 'block';
          if (img) {
            lbImg.src = img.src;
            lbImg.alt = img.alt || label;
          }
          lbImg.style.opacity   = '1';
          lbImg.style.transform = 'scale(1)';
        }
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

  // ── Global Keyboard Shortcuts ────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (videoModal && videoModal.classList.contains('active')) {
        closeVideoModal();
        return;
      }
      if (lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
        return;
      }
    }

    // Video modal keyboard shortcuts
    if (videoModal && videoModal.classList.contains('active') && modalVideoPlayer) {
      if (e.key === ' ' || e.code === 'Space') {
        if (document.activeElement !== videoModalClose) {
          e.preventDefault();
          if (modalVideoPlayer.paused) {
            modalVideoPlayer.play();
          } else {
            modalVideoPlayer.pause();
          }
        }
      } else if (e.key === 'ArrowLeft') {
        modalVideoPlayer.currentTime = Math.max(0, modalVideoPlayer.currentTime - 5);
      } else if (e.key === 'ArrowRight') {
        modalVideoPlayer.currentTime = Math.min(modalVideoPlayer.duration || 0, modalVideoPlayer.currentTime + 5);
      }
      return;
    }

    // Photo lightbox keyboard shortcuts
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft')  prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
  });

  // Touch swipe support for lightbox
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
