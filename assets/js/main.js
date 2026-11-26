/* Kelukis demo: bendri komponentai (antraštė, meniu, užklausos skydelis, atsiradimai, skaitikliai, video, žymeklis).
   Judesys: GSAP + ScrollTrigger + SplitText, sklandus slinkimas: Lenis.
   ?static=1 arba prefers-reduced-motion išjungia judesį ir video. */
(function () {
  'use strict';
  var H = document.documentElement, B = document.body;
  var STATIC = H.classList.contains('is-static');
  var REDUCED = H.classList.contains('is-reduced');
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var MOTION = !STATIC && !REDUCED && !!gsap && !!ST;
  var FINE = !!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  var noop = function () {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var KL = window.__kl = { motion: MOTION, isStatic: STATIC, reduced: REDUCED, fine: FINE, $: $, $$: $$, lenis: null, isReady: false };

  /* Ar pelė tikrai pajudėjo. Kai turinys slenka po nejudančia pele, naršyklės siunčia pointerenter / pointerover, o „Safari“ dar ir
     dirbtinį pointermove su tomis pačiomis ekrano koordinatėmis. Užvedimo efektai turi reaguoti tik į tikrą judesį, todėl
     pointermove apdorojimo funkcijos pirmiausia klausia KL.realMove(). (Šis klausytojas veikia capture fazėje, t. y. anksčiau už jas.) */
  var lastSX = null, lastSY = null, movedNow = true;
  window.addEventListener('pointermove', function (e) {
    movedNow = e.screenX !== lastSX || e.screenY !== lastSY;
    lastSX = e.screenX; lastSY = e.screenY;
  }, { capture: true, passive: true });
  KL.realMove = function () { return movedNow; };
  if (gsap && ST) gsap.registerPlugin(ST);
  if (gsap && window.SplitText) gsap.registerPlugin(window.SplitText);

  /* ---------- sklandus slinkimas ---------- */
  var lenis = null;
  if (MOTION && window.Lenis) {
    lenis = KL.lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var locks = 0;
  function lock(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    if (lenis) { if (locks) lenis.stop(); else lenis.start(); }
    H.style.overflow = locks ? 'hidden' : '';
  }
  KL.lock = lock;
  KL.scrollTo = function (target, now) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    var y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 88);
    if (lenis && !now) lenis.scrollTo(y, { duration: 1.5 }); else window.scrollTo(0, y);
  };

  /* ---------- pasiruošimo eilė (po įžangos) ---------- */
  var queue = [];
  KL.onReady = function (fn) { if (KL.isReady) fn(); else queue.push(fn); };
  function go() {
    if (KL.isReady) return;
    KL.isReady = true; H.classList.add('is-ready');
    queue.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }

  /* ---------- įžanga ---------- */
  var pre = $('[data-pre]');
  if (!pre || STATIC || REDUCED || H.classList.contains('no-intro')) {
    if (pre) pre.remove();
    setTimeout(go, H.classList.contains('from-nav') ? 480 : 0);
  } else {
    var preN = $('[data-pre-n]', pre), preBar = $('.pre__bar i', pre), t0 = performance.now(), DUR = 1300, done = false;
    lock(true);
    var finish = function () {
      if (done) return; done = true;
      try { sessionStorage.setItem('kl-intro', '1'); } catch (e) {}
      pre.classList.add('is-out'); lock(false);
      setTimeout(go, 360);
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 1300);
    };
    (function tick(t) {
      var p = Math.min(1, (t - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
      preBar.style.setProperty('--v', e.toFixed(3));
      preN.textContent = Math.round(e * 100) + ' %';
      if (p < 1) requestAnimationFrame(tick); else finish();
    })(t0);
    setTimeout(finish, 3600);
  }

  /* ---------- pranešimai ---------- */
  var toast = $('[data-toast]'), toastT;
  KL.toast = function (msg) {
    if (!toast) return;
    $('span', toast).textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 4200);
  };
  var DEMO = {
    lang: 'Demo versijoje rodoma tik lietuvių kalba. Tikroje svetainėje bus EN, DE ir RU versijos.',
    privacy: 'Šis puslapis demo versijoje nesukurtas.',
    social: 'Socialinių tinklų nuorodos bus pridėtos tikroje svetainėje.',
    cv: 'Demo versijoje failai neįkeliami.',
    'default': 'Ši nuoroda demo versijoje neaktyvi.'
  };

  /* ---------- antraštė ---------- */
  var hdr = $('[data-hdr]'), lastY = window.scrollY, ticking = false, megas = $$('.has-mega');
  KL.lastScroll = 0;                                      // paskutinio slinkimo laikas (pagal jį stabdomi fono perpiešimai)
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    hdr.classList.toggle('is-solid', y > 40);
    if (y > 700 && y > lastY + 6) { hdr.classList.add('is-hidden'); megas.forEach(function (li) { li.classList.remove('is-open'); }); }
    else if (y < lastY - 6 || y <= 700) hdr.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', function () { KL.lastScroll = performance.now(); }, { passive: true });
  if (hdr) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
  // Mega meniu atsidaro tik pelei tikrai pajudėjus virš punkto (pointermove), o ne nuo :hover:
  // kitaip, antraštei grįžtant į ekraną po nejudančia pele, meniu iššoktų pats.
  megas.forEach(function (li) {
    li.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' && KL.realMove()) li.classList.add('is-open'); });
    li.addEventListener('pointerleave', function () { li.classList.remove('is-open'); });
  });
  var lang = $('[data-lang]');
  if (lang) {
    var lb = $('.lang__btn', lang);
    lb.addEventListener('click', function (e) { e.stopPropagation(); var o = lang.classList.toggle('is-open'); lb.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function () { lang.classList.remove('is-open'); lb.setAttribute('aria-expanded', 'false'); });
  }

  /* ---------- mobilus meniu ---------- */
  var mnav = $('[data-mnav]'), burger = $('[data-menu]'), menuOpen = false;
  function menu(open) {
    if (!mnav || open === menuOpen) return;
    menuOpen = open;
    B.classList.toggle('menu-open', open); mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Uždaryti meniu' : 'Atidaryti meniu');
    lock(open);
  }
  if (burger) burger.addEventListener('click', function () { menu(!menuOpen); });

  /* ---------- užklausos skydelis ---------- */
  var qd = $('[data-qd]'), qdOpen = false, lastFocus = null;
  KL.quote = function (open, fill) {
    if (!qd || open === qdOpen) return;
    qdOpen = open;
    if (open) {
      menu(false);
      lastFocus = document.activeElement;
      if (fill) Object.keys(fill).forEach(function (k) {
        var f = qd.querySelector('[name="' + k + '"]');
        if (!f || !fill[k]) return;
        if (f.type === 'radio') { var r = qd.querySelector('[name="' + k + '"][value="' + fill[k] + '"]'); if (r) r.checked = true; }
        else f.value = fill[k];
      });
    }
    qd.classList.toggle('is-open', open);
    qd.setAttribute('aria-hidden', String(!open));
    lock(open);
    if (open) setTimeout(function () { var f = $('input:not([type=radio])', qd); if (f) f.focus({ preventScroll: true }); }, 420);
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  /* ---------- paspaudimai ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.addEventListener('click', function (e) {
    var t = e.target;
    var d = t.closest('[data-demo]');
    if (d) { e.preventDefault(); KL.toast(DEMO[d.getAttribute('data-demo')] || DEMO['default']); return; }
    if (t.closest('[data-qd-close]')) { KL.quote(false); return; }
    var q = t.closest('[data-quote]');
    if (q) { e.preventDefault(); KL.quote(true, q.dataset.type ? { type: q.dataset.type } : null); return; }
    var c = t.closest('[data-copy]');
    if (c) {
      var val = c.getAttribute('data-copy');
      var ok = function () { KL.toast('Nukopijuota: ' + val); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(val).then(ok, ok); else ok();
      return;
    }
    var pos = t.closest('[data-pos]');                    // karjera: pozicija perkeliama į formą
    if (pos) { var pf = $('[data-pos-field]'); if (pf) pf.value = pos.getAttribute('data-pos'); }
    var a = t.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^(mailto:|tel:|https?:|\/\/)/.test(href) || a.target || a.hasAttribute('download')) return;
    var file = href.charAt(0) === '#' ? here : (a.pathname.split('/').pop() || 'index.html');
    if (file === here) {                                  // tas pats puslapis: sklandus slinkimas
      if (a.hash && $(a.hash)) { e.preventDefault(); menu(false); KL.scrollTo(a.hash); if (history.replaceState) history.replaceState(null, '', a.hash); }
      else if (!a.hash) { e.preventDefault(); menu(false); if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo(0, 0); }
      return;
    }
    if (!MOTION || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();                                   // kitas puslapis: užuolaida
    try { sessionStorage.setItem('kl-nav', '1'); } catch (err) {}
    H.classList.add('is-leaving');
    var url = a.href;
    setTimeout(function () { location.href = url; }, 520);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) H.classList.remove('is-leaving'); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (qdOpen) KL.quote(false); else if (menuOpen) menu(false);
    if (lang) lang.classList.remove('is-open');
    megas.forEach(function (li) { li.classList.remove('is-open'); });
  });

  /* ---------- formos (demo: niekur nesiunčia) ---------- */
  $$('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', form).forEach(function (f) {
        var ok = f.type === 'checkbox' ? f.checked : (f.value.trim() !== '' && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())));
        var w = f.closest('.fld'); if (w) w.classList.toggle('is-err', !ok);
        if (!ok && !bad) bad = f;
      });
      if (bad) { KL.toast(bad.type === 'checkbox' ? 'Pažymėkite sutikimą, kad galėtume atsakyti.' : 'Užpildykite pažymėtus laukus.'); bad.focus({ preventScroll: false }); return; }
      form.classList.add('is-sent');
      KL.toast('Demo versija: užklausa neišsiųsta, bet forma veikia.');
      setTimeout(function () { form.reset(); form.classList.remove('is-sent'); }, 7000);
    });
    form.addEventListener('input', function (e) { var w = e.target.closest('.fld'); if (w) w.classList.remove('is-err'); });
  });

  /* ---------- atsiradimai ---------- */
  var rvEls = $$('[data-rv],[data-in]');
  var mainEl = $('#main'), ftrEl = $('[data-ftr]');
  if (STATIC || REDUCED || !('IntersectionObserver' in window)) rvEls.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var rvo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rvo.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -9% 0px' });
    // Poraštė prilipusi už turinio ir geometriškai visada yra ekrane, todėl jos elementai atsiranda ne pagal savo padėtį,
    // o tada, kai turinio pabaiga pakyla ir poraštė iš tikrųjų atsidengia.
    var ftrRv = ftrEl ? rvEls.filter(function (el) { return ftrEl.contains(el); }) : [];
    var ftrGate = !!(ftrRv.length && mainEl);
    var showFtr = function () { ftrRv.forEach(function (el) { el.classList.add('is-in'); }); };
    // Tikrinama pagal slinkimo padėtį, o ne IntersectionObserver: peršokus tiesiai į puslapio galą (End klavišas, slinkties juosta)
    // stebimas taškas ekrano gali ir nekirsti, o padėties tikrinimas suveikia visada.
    if (ftrGate) KL.onReady(function () {
      if (MOTION) ST.create({ trigger: mainEl, start: 'bottom 88%', once: true, onEnter: showFtr });
      else {
        var chk = function () {
          if (mainEl.getBoundingClientRect().bottom > window.innerHeight * 0.88) return;
          showFtr(); window.removeEventListener('scroll', chk);
        };
        window.addEventListener('scroll', chk, { passive: true }); chk();
      }
    });
    KL.onReady(function () { rvEls.forEach(function (el) { if (!ftrGate || ftrRv.indexOf(el) < 0) rvo.observe(el); }); });
  }

  /* ---------- antraštės eilutėmis ---------- */
  var splits = [];
  function splitAll() {
    var els = $$('[data-split]');
    if (!MOTION || !window.SplitText) { els.forEach(function (el) { el.classList.add('is-split'); }); return; }
    els.forEach(function (el) {
      try {
        var sp = new window.SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
        el.classList.add('is-split');
        var inFtr = ftrEl && mainEl && ftrEl.contains(el);     // poraštės antraštė: pagal turinio pabaigą, ne pagal savo padėtį
        // force3D: eilutė ir po animacijos lieka savo sluoksnyje. Kitaip, animacijai pasibaigus, naršyklė ją perkelia
        // į tėvo sluoksnį ir tą akimirką eilutė gali vienam kadrui dingti.
        var tw = gsap.from(sp.lines, { force3D: true, yPercent: 112, duration: 1.2, ease: 'power4.out', stagger: 0.09, delay: parseFloat(el.dataset.delay) || 0,
          scrollTrigger: inFtr ? { trigger: mainEl, start: 'bottom 88%', once: true } : { trigger: el, start: 'top 92%', once: true } });
        splits.push({ sp: sp, tw: tw });
      } catch (err) { el.classList.add('is-split'); }
    });
  }
  // Suskaidytos eilutės pačios nepersilaužia. Todėl pasikeitus lango pločiui antraštėms grąžinamas paprastas tekstas
  // (tik tada, o ne iškart po animacijos: DOM pakeitimas vidury slinkimo galėjo trumpam paslėpti antraštę).
  var splitW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (!splits.length || window.innerWidth === splitW) return;
    splitW = window.innerWidth;
    splits.forEach(function (s) {
      try { if (s.tw.scrollTrigger) s.tw.scrollTrigger.kill(); s.tw.kill(); s.sp.revert(); } catch (err) {}
    });
    splits = [];
    if (ST) ST.refresh();
  });
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  var fontsOrTimeout = Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1800); })]);
  KL.onReady(function () { fontsOrTimeout.then(function () { splitAll(); if (ST) ST.refresh(); }); });

  /* ---------- skaitikliai ---------- */
  function fmt(v, dec) { return v.toLocaleString('lt-LT', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  KL.countTo = function (el, to, dec, dur) {
    dec = dec || 0;
    if (!MOTION) { el.textContent = fmt(to, dec); return; }
    var from = parseFloat(String(el.textContent).replace(/\s/g, '').replace(',', '.')) || 0, o = { v: from };
    gsap.to(o, { v: to, duration: dur || 1.8, ease: 'power3.out', overwrite: true, onUpdate: function () { el.textContent = fmt(o.v, dec); } });
  };
  var counters = $$('[data-count]');
  if (MOTION && 'IntersectionObserver' in window) {
    counters.forEach(function (el) { el.textContent = fmt(0, parseInt(el.dataset.dec || '0', 10)); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        KL.countTo(e.target, parseFloat(e.target.dataset.count), parseInt(e.target.dataset.dec || '0', 10), 2);
      });
    }, { threshold: 0.4 });
    KL.onReady(function () { counters.forEach(function (el) { co.observe(el); }); });
  }

  /* ---------- video: pradedami krauti iš anksto (maždaug per ekraną iki jų), groja tik matomi ---------- */
  if (!STATIC && !REDUCED && 'IntersectionObserver' in window) {
    var vids = $$('video[data-autoplay]');
    var vload = new IntersectionObserver(function (es) {            // ankstyvas krovimas, kad paleidimas nestabdytų slinkimo
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var v = e.target;
        if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
        vload.unobserve(v);
      });
    }, { rootMargin: '1100px 0px' });
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.dataset.src;
          var p = v.play(); if (p && p.catch) p.catch(noop);
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '120px 0px' });
    vids.forEach(function (v) { vload.observe(v); vio.observe(v); });
  }

  /* ---------- paralaksas ---------- */
  if (MOTION) {
    $$('[data-plx]').forEach(function (el) {
      var p = parseFloat(el.dataset.plx) || 7;
      gsap.fromTo(el, { yPercent: -p }, { yPercent: p, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-float]').forEach(function (el) {
      var p = parseFloat(el.dataset.float) || 40;
      gsap.fromTo(el, { y: p }, { y: -p, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    $$('[data-band]').forEach(function (el) {
      gsap.fromTo(el, { scale: 0.9, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 105%', end: 'top 40%', scrub: 0.5 } });
    });
  }

  /* ---------- pakreipimas ir magnetiniai mygtukai ---------- */
  if (MOTION && FINE) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 6;
      el.addEventListener('pointermove', function (e) {
        if (!KL.realMove()) return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        el.classList.add('is-tilt');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilt'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
    $$('[data-magnet]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        if (!KL.realMove()) return;
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22); yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- žymeklis ---------- */
  var cur = $('[data-cur]');
  if (cur && MOTION && FINE) {
    var cx = -100, cy = -100, tx = -100, ty = -100, curLbl = $('span', cur);
    // Būsena pagal elementą po pele. grow = ar galima padidinti burbulą su užrašu (tik pelei tikrai pajudėjus).
    var syncCur = function (target, grow) {
      var c = target && target.closest ? target.closest('[data-cursor]') : null, lbl = c ? c.getAttribute('data-cursor') : '';
      if (c && grow) { curLbl.textContent = lbl; cur.classList.add('is-big'); }
      else if (!c || curLbl.textContent !== lbl) cur.classList.remove('is-big');
      cur.classList.toggle('is-hide', !c && !!(target && target.closest && target.closest('a,button,input,textarea,select,label,[data-pan]')));
    };
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('is-on');
      syncCur(e.target, KL.realMove());
    }, { passive: true });
    // Slenkant po nejudančia pele pointermove neateina, bet pointerover ateina. Pagal jį burbulas tik sumažinamas (niekada nedidinamas):
    // kitaip didelis raudonas burbulas su užrašu liktų kaboti virš kito turinio arba iššokinėtų pro šalį slenkant kiekvienam video.
    document.addEventListener('pointerover', function (e) { syncCur(e.target, false); }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
    gsap.ticker.add(function () {
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) return;
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.setProperty('--x', cx.toFixed(1) + 'px'); cur.style.setProperty('--y', cy.toFixed(1) + 'px');
    });
  }

  /* ---------- kinetinė juosta: greitis ir lengvas pasvirimas pagal slinkimą (tik transform, be išdėstymo perskaičiavimo) ---------- */
  $$('[data-kin]').forEach(function (kin) {
    if (!MOTION) return;
    var track = $('.kin__track', kin), p = 0, sk = 0, dir = 1, vis = false;
    if (!track) return;
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { rootMargin: '100px 0px' }).observe(kin);
    gsap.ticker.add(function (t, dt) {
      if (!vis) return;
      var v = lenis ? (lenis.velocity || 0) : 0, av = Math.min(Math.abs(v), 70);
      if (av > 0.4) dir = v > 0 ? 1 : -1;
      p += (0.00004 + av * 0.00003) * Math.min(dt, 50) * dir;
      p = ((p % 1) + 1) % 1;
      sk += (Math.max(-8, Math.min(8, -v * 0.16)) - sk) * 0.08;
      track.style.transform = 'translate3d(' + (-p * 50).toFixed(4) + '%,0,0) skewX(' + sk.toFixed(2) + 'deg)';
    });
  });

  /* ---------- akordeonas ---------- */
  $$('[data-acc]').forEach(function (row) {
    var btn = $('[data-acc-btn]', row);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = !row.classList.contains('is-open');
      $$('[data-acc]', row.parentNode).forEach(function (r) { r.classList.remove('is-open'); var b = $('[data-acc-btn]', r); if (b) b.setAttribute('aria-expanded', 'false'); });
      row.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open));
      if (ST) setTimeout(function () { ST.refresh(); }, 750);
    });
  });

  /* ---------- šokinėjimo juosta (paslaugų puslapis) ---------- */
  var jump = $('[data-jump]');
  if (jump && 'IntersectionObserver' in window) {
    var links = $$('a', jump), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var jo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-on'); });
        var a = map[e.target.id]; if (a) a.classList.add('is-on');
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) jo.observe(el); });
  }

  /* ---------- poraštė: atsidengia iš po turinio. Jei ji aukštesnė už ekraną, prilimpa taip, kad viršus būtų ties ekrano viršumi, o likutis praslenka įprastai ---------- */
  var ftr = $('[data-ftr]');
  function ftrCheck() {
    if (!ftr) return;
    var on = !STATIC && window.innerWidth > 820;
    ftr.classList.toggle('is-reveal', on);
    ftr.style.bottom = on ? Math.min(0, window.innerHeight - ftr.offsetHeight) + 'px' : '';
  }
  ftrCheck();
  window.addEventListener('resize', ftrCheck);
  window.addEventListener('load', function () { ftrCheck(); if (ST) ST.refresh(); });
  $$('.ftr__word .logo__l').forEach(function (l, i) { l.style.setProperty('--li', i); });
  $$('.pre .logo__l').forEach(function (l, i) { l.style.setProperty('--li', i); });

  /* ---------- nuoroda su # įkėlus puslapį ---------- */
  if (location.hash && $(location.hash)) KL.onReady(function () { setTimeout(function () { KL.scrollTo(location.hash, true); }, 60); });
})();
