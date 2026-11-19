(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- header ---------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-solid', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- מגירת תפריט (מובייל) ---------- */
  const burger = $('.burger');
  const scrim = $('.nav-scrim');
  if (burger) {
    const setOpen = open => {
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open);
      if (open) { scrim.hidden = false; requestAnimationFrame(() => $('.drawer-x').focus()); }
      else { setTimeout(() => { if (!document.body.classList.contains('nav-open')) scrim.hidden = true; }, 380); }
    };
    burger.addEventListener('click', () => setOpen(true));
    $('.drawer-x').addEventListener('click', () => { setOpen(false); burger.focus(); });
    scrim.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setOpen(false); burger.focus(); }
    });
    $$('.nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    window.matchMedia('(min-width: 1181px)').addEventListener('change', e => e.matches && setOpen(false));
  }

  /* ---------- שעות פתיחה: סימון היום (שעון ישראל) ---------- */
  try {
    const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short' }).format(new Date());
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
    $$(`.hours li[data-days~="${day}"]`).forEach(li => li.classList.add('today'));
  } catch (e) { /* ignore */ }

  /* ---------- lightbox: כל כפתור עם data-full ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const img = $('img', lb), cap = $('figcaption', lb), count = $('.lb-count', lb);
    let list = [], idx = 0, last = null;
    const visible = group => $$(`[data-full][data-group="${group}"]`).filter(b => !b.closest('[hidden]'));
    const show = i => {
      idx = (i + list.length) % list.length;
      const b = list[idx];
      img.src = b.dataset.full;
      img.alt = b.querySelector('img').alt;
      cap.textContent = b.querySelector('img').alt;
      count.textContent = `${idx + 1} / ${list.length}`;
    };
    const open = b => {
      last = document.activeElement; list = visible(b.dataset.group); show(list.indexOf(b));
      lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus();
    };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; img.src = ''; last && last.focus(); };
    $$('[data-full]').forEach(b => b.addEventListener('click', () => open(b)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx - 1);
      if (e.key === 'ArrowLeft') show(idx + 1);
    });
    let sx = null;
    lb.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx > 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- סינון בגלריה ---------- */
  const filters = $$('.filters button');
  if (filters.length) {
    filters.forEach(f => f.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-pressed', x === f));
      const cat = f.dataset.filter;
      $$('.gallery [data-cat]').forEach(b => { b.hidden = cat !== 'all' && b.dataset.cat !== cat; });
    }));
  }

  /* ---------- ניווט סדנאות: סימון הסדנה הנוכחית ---------- */
  const wsLinks = $$('.ws-nav a');
  if (wsLinks.length) {
    const mark = id => wsLinks.forEach(a => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.parentElement.scrollTo({ left: a.offsetLeft - a.parentElement.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
    });
    const spy = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && mark(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
    $$('.ws').forEach(s => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const rev = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => rev.observe(el));

  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
