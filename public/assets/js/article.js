/* =============================================
   Mara Events — article.js
   Blog article pages: reading progress, "On this page" contents, copy link
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('.article-body');
  if (!body) return;

  // ─── READING PROGRESS ───────────────────────────────────────────────
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const updateProgress = () => {
    const rect = body.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.5;
    const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.25, 0), total);
    bar.style.transform = `scaleX(${total > 0 ? read / total : 0})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ─── ON THIS PAGE (built from the article's h2s) ────────────────────
  const tocCard = document.querySelector('.sidebar-toc');
  const tocList = tocCard && tocCard.querySelector('.toc-list');
  const headings = [...body.querySelectorAll('h2')];

  if (tocList && headings.length >= 3) {
    const used = new Set();
    headings.forEach(h => {
      if (!h.id) {
        let id = h.textContent.toLowerCase()
          .replace(/^\d+\.\s*/, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60) || 'section';
        while (used.has(id) || document.getElementById(id)) id += '-2';
        h.id = id;
      }
      used.add(h.id);

      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.className = 'toc-item';
      // Drop price ranges after a colon so entries stay short ("Venue Rental", not "Venue Rental: ₦800,000 to …")
      a.textContent = h.textContent.replace(/:\s*₦.*$/, '').trim();
      tocList.appendChild(a);
    });

    const links = [...tocList.querySelectorAll('.toc-item')];
    const setActive = id => links.forEach(l => l.classList.toggle('active', l.hash === `#${id}`));

    // The section whose heading most recently crossed the top third of the screen is "current"
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '0px 0px -66% 0px' });
    headings.forEach(h => spy.observe(h));
  } else if (tocCard) {
    tocCard.remove();
  }

  // ─── COPY LINK ──────────────────────────────────────────────────────
  const share = document.querySelector('.article-share');
  if (share && navigator.clipboard) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-btn';
    btn.setAttribute('aria-label', 'Copy link');
    btn.innerHTML = '<i class="fa-solid fa-link"></i>';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href.split('#')[0]);
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i class="fa-solid fa-link"></i>';
        }, 1800);
      } catch (_) { /* clipboard blocked: leave the button as is */ }
    });
    share.appendChild(btn);
  }
});
