/* =============================================
   Mara Events — webinar.js
   Countdown to the next session and the mobile
   sticky register bar
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─── COUNTDOWN ──────────────────────────────────────────────────────
  const countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    const start = new Date(countdown.dataset.countdown).getTime();
    const LIVE_WINDOW = 2 * 60 * 60 * 1000; // treat the session as live for two hours
    const grid = countdown.querySelector('.wb-countdown-grid');
    const label = countdown.querySelector('.wb-countdown-label');
    const done = countdown.querySelector('.wb-countdown-done');
    const units = {
      days: countdown.querySelector('[data-unit="days"]'),
      hours: countdown.querySelector('[data-unit="hours"]'),
      minutes: countdown.querySelector('[data-unit="minutes"]'),
      seconds: countdown.querySelector('[data-unit="seconds"]')
    };
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const diff = start - Date.now();
      if (diff <= 0) {
        grid.hidden = true;
        label.hidden = true;
        done.hidden = false;
        done.textContent = diff > -LIVE_WINDOW
          ? 'We are live now. Join with the Google Meet link shared at registration.'
          : 'This session has ended. Thank you to everyone who joined.';
        clearInterval(timer);
        return;
      }
      units.days.textContent = pad(Math.floor(diff / 86400000));
      units.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
      units.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
      units.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
    };

    const timer = setInterval(tick, 1000);
    tick();
  }

  // ─── REPLAY PLAYER ──────────────────────────────────────────────────
  // Show the cover image first and only load YouTube when someone presses play.
  document.querySelectorAll('.wb-player[data-youtube-id]').forEach((player) => {
    const poster = player.querySelector('.wb-player-poster');
    poster.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${player.dataset.youtubeId}?autoplay=1&rel=0`;
      iframe.title = poster.getAttribute('aria-label').replace('Play the replay: ', '');
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      poster.replaceWith(iframe);
      iframe.focus();
    });
  });

  // ─── STICKY REGISTER BAR (MOBILE) ───────────────────────────────────
  // Shown once the hero button scrolls away, hidden again at the final CTA.
  const sticky = document.getElementById('wbSticky');
  const heroCta = document.getElementById('heroRegister');
  const finalCta = document.getElementById('finalRegister');
  if (sticky && heroCta && finalCta && 'IntersectionObserver' in window) {
    const seen = { hero: true, final: false };
    const update = () => {
      const show = !seen.hero && !seen.final;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      sticky.querySelector('a').tabIndex = show ? 0 : -1;
      document.body.classList.toggle('wb-sticky-on', show);
    };
    new IntersectionObserver(([entry]) => { seen.hero = entry.isIntersecting; update(); }).observe(heroCta);
    new IntersectionObserver(([entry]) => { seen.final = entry.isIntersecting; update(); }).observe(finalCta);
  }
});
