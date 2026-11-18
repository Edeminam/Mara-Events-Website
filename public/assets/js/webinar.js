/* =============================================
   Mara Events — webinar.js
   Replay players, share button and scroll reveal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── REPLAY PLAYERS ─────────────────────────────────────────────────
  // Each poster is a real YouTube link, so it still works without JS.
  // With JS we swap in the embed on click, and only one video plays at a time.
  let active = null; // { player, poster, iframe }

  const restore = () => {
    if (!active) return;
    active.iframe.replaceWith(active.poster);
    active = null;
  };

  document.querySelectorAll('.wb-player[data-youtube-id]').forEach((player) => {
    const poster = player.querySelector('.wb-player-poster');
    if (!poster) return;

    poster.addEventListener('click', (event) => {
      // Let modified clicks (new tab, etc.) behave like a normal link
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      restore();

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${player.dataset.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = poster.dataset.title || 'Webinar replay';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      poster.replaceWith(iframe);
      iframe.focus();
      active = { player, poster, iframe };
    });
  });

  // ─── SHARE ──────────────────────────────────────────────────────────
  const shareBtn = document.querySelector('[data-share]');
  const shareLabel = document.querySelector('[data-share-label]');
  const shareStatus = document.querySelector('[data-share-status]');
  if (shareBtn) {
    const url = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
    const title = 'Free event planning webinar replay: Will AI Replace Event Planners?';
    let resetTimer;

    const flash = (text) => {
      if (shareLabel) shareLabel.textContent = text;
      if (shareStatus) shareStatus.textContent = text;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (shareLabel) shareLabel.textContent = 'Share this webinar';
        if (shareStatus) shareStatus.textContent = '';
      }, 2200);
    };

    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
        } catch (_) { /* user cancelled */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        flash('Link copied');
      } catch (_) {
        window.prompt('Copy this link:', url);
      }
    });
  }

  // ─── SCROLL REVEAL ──────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && !reduceMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('wb-js');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
});
