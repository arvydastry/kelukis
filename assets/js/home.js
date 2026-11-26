/* Kelukis demo: pradžios puslapio sekcijos (hero, žodžių paryškinimas, paslaugų skydai, žemėlapis, vilkiko brėžinys, kelias). */
(function () {
  'use strict';
  var KL = window.__kl;
  if (!KL) return;
  var $ = KL.$, $$ = KL.$$, gsap = window.gsap, ST = window.ScrollTrigger, MOTION = KL.motion;
  var PLAY = !KL.isStatic && !KL.reduced;
  var noop = function () {};
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function fmt(v, dec) { return v.toLocaleString('lt-LT', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(noop); return p; }

  /* ================= hero ================= */
  var hero = $('[data-hero]');
  if (hero) {
    var hv = $('video', hero), vbtn = $('[data-vbtn]', hero);
    if (hv && PLAY) { hv.src = window.innerWidth < 760 ? hv.dataset.srcM : hv.dataset.src; play(hv); }
    else if (vbtn) vbtn.hidden = true;
    if (vbtn && hv) vbtn.addEventListener('click', function () {
      var wasPaused = hv.paused;
      if (wasPaused) play(hv); else hv.pause();
      hv.dataset.user = wasPaused ? '' : 'paused';
      vbtn.classList.toggle('is-paused', !wasPaused);
      vbtn.setAttribute('aria-label', wasPaused ? 'Sustabdyti foninį video' : 'Paleisti foninį video');
    });
    KL.onReady(function () {
      hero.classList.add('is-in');
      // Įžangai pasibaigus (ilgiausias perėjimas trunka apie 2 s) transition išjungiamas: toliau opacity slenkant valdo GSAP
      setTimeout(function () { hero.classList.add('is-settled'); }, 2400);
    });
    if (MOTION) {
      if (KL.fine) {                                   // gylio sluoksniai pagal pelę
        var mx = 0, my = 0, tx = 0, ty = 0;
        hero.addEventListener('pointermove', function (e) {
          // slenkant sluoksniai pagal pelę nejudinami: ratuką sukanti ranka pelę vis kiek pajudina, o tekstas tada dreba
          if (!KL.realMove() || performance.now() - KL.lastScroll < 250) return;
          var r = hero.getBoundingClientRect();
          tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
        });
        gsap.ticker.add(function () {
          if (Math.abs(tx - mx) < 0.0008 && Math.abs(ty - my) < 0.0008) return;
          mx += (tx - mx) * 0.07; my += (ty - my) * 0.07;
          hero.style.setProperty('--mx', mx.toFixed(4)); hero.style.setProperty('--my', my.toFixed(4));
        });
      }
      var whole = function () { return { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }; };
      gsap.to('.hero__stage', { yPercent: 24, ease: 'none', scrollTrigger: whole() });
      // --zoom rašomas ant paties medijos sluoksnio (ne ant viso hero), kad kas kadrą nereikėtų perskaičiuoti viso hero stilių
      gsap.fromTo('.hero__media', { '--zoom': 1 }, { '--zoom': 1.16, ease: 'none', scrollTrigger: whole() });
      // Hero tekstas slenkant NEanimuojamas (nei poslinkis, nei išblukimas): jis tiesiog nuslenka kartu su puslapiu.
      // Kas kadrą keičiamas teksto poslinkis trupmeniniais pikseliais ir skaidrumas versdavo naršyklę raides perpiešti
      // vis kitaip, todėl slenkant jos mirgėjo. Gylį kuria fonas: video juda lėčiau (.hero__stage) ir artėja (--zoom).
      ST.create({ trigger: hero, start: 'top top', end: 'bottom top',
        onLeave: function () { if (hv && !hv.paused) hv.pause(); },
        onEnterBack: function () { if (hv && PLAY && hv.dataset.user !== 'paused') play(hv); } });
    }
    var mini = $('[data-mini]', hero);
    if (mini) mini.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(mini);
      KL.quote(true, { from: fd.get('from'), to: fd.get('to'), type: fd.get('type') });
    });
  }

  /* ================= apie: žodžiai paryškėja slenkant ================= */
  var say = $('[data-words]');
  if (say) {
    say.innerHTML = say.textContent.trim().split(/[ \n\t]+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    var ws = $$('.w', say);
    if (MOTION) ST.create({ trigger: say, start: 'top 84%', end: 'bottom 48%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle('is-on', i < n); }); } });
    else ws.forEach(function (w) { w.classList.add('is-on'); });
  }

  /* ================= paslaugų skydai ================= */
  var pans = $$('[data-pan]');
  if (pans.length) {
    var pansVisible = false;
    var act = function (p) {
      pans.forEach(function (x) {
        var on = x === p, v = $('video', x);
        x.classList.toggle('is-active', on);
        if (!v) return;
        if (on && PLAY && pansVisible) {
          if (!v.getAttribute('src')) v.src = v.dataset.src;
          var pr = play(v);
          if (pr && pr.then) pr.then(function () { if (x.classList.contains('is-active')) x.classList.add('is-playing'); }, noop);
        } else { v.pause(); x.classList.remove('is-playing'); }
      });
    };
    pans.forEach(function (p) {
      // pointermove, ne pointerenter: slenkant puslapį po nejudančia pele naršyklė siunčia pointerenter, ir skydas išsiplėstų pats.
      // pointermove ateina tik pelei tikrai pajudėjus.
      p.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' && KL.realMove() && window.innerWidth > 900 && !p.classList.contains('is-active')) act(p); });
      p.addEventListener('click', function (e) { if (!p.classList.contains('is-active')) { e.preventDefault(); act(p); } });
      p.addEventListener('focus', function () { act(p); });
      p.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === p) { e.preventDefault(); act(p); } });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      pansVisible = es[0].isIntersecting;
      act($('.pan.is-active') || pans[0]);
    }, { threshold: 0.25 }).observe(pans[0].parentNode);
  }

  /* ================= taškinis žemėlapis ================= */
  var mapEl = $('[data-map]');
  if (mapEl && window.KMAP) (function () {
    var M = window.KMAP, cv = $('canvas', mapEl), ctx = cv.getContext('2d'), svg = $('svg', mapEl);
    var home = M.cities['Vilnius'], dots = [], maxD = 0;
    M.rows.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) {
        var v = row.charCodeAt(c) - 48;
        if (!v) continue;
        var x = M.dx / 2 + c * M.dx + (r % 2 ? M.dx / 2 : 0), y = M.dy / 2 + r * M.dy, d = Math.hypot(x - home[0], y - home[1]);
        if (d > maxD) maxD = d;
        dots.push({ x: x, y: y, v: v, d: d });
      }
    });
    var st = { rev: MOTION ? 0 : 1 }, hl = 0, px = -999, py = -999, s = 1, dpr = 1, vis = false, started = !MOTION, last = 0;
    var C_LAND = 'rgb(255,255,255)', C_ON = 'rgb(198,204,255)', C_HL = 'rgb(255,255,255)', C_HOME = 'rgb(255,106,99)';
    function draw(t) {
      ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
      ctx.clearRect(0, 0, M.w, M.h);
      var front = st.rev * (maxD + 170), time = t / 1000;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], k = clamp((front - d.d) / 150, 0, 1);
        if (k <= 0) continue;
        var a, r, col;
        if (d.v === 3) { a = 1; r = 2.6; col = C_HOME; }
        else if (d.v === 1) { a = 0.17; r = 1.6; col = C_LAND; }
        else {
          a = 0.76 + 0.18 * Math.sin(d.d * 0.045 - time * 1.7); r = 2.2; col = C_ON;
          if (hl) { if (d.v === hl) { a = 1; r = 2.8; col = C_HL; } else a *= 0.3; }
        }
        var pd = Math.abs(d.x - px) < 84 ? Math.hypot(d.x - px, d.y - py) : 99;
        if (pd < 84) { var f = 1 - pd / 84; r += f * 2; a = Math.min(1, a + f * 0.55); }
        ctx.globalAlpha = a * k;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(d.x, d.y, r * (0.35 + 0.65 * k), 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function size() {
      var w = mapEl.offsetWidth, h = mapEl.offsetHeight;      // išdėstymo dydis, nepriklausomas nuo transformacijų
      if (!w) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      s = w / M.w;
      draw(performance.now());
    }
    /* maršrutai: glodžios kreivės per miestus, tekantys brūkšniai ir judantys taškai */
    function spline(pts) {
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
             (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
      }
      return d;
    }
    var J = [
      ['Vilnius', 'Varšuva', 'Berlynas', 'Kelnas', 'Briuselis', 'Paryžius', 'Bordo'],
      ['Hamburgas', 'Kelnas', 'Frankfurtas', 'Strasbūras', 'Lionas', 'Marselis'],
      ['Berlynas', 'Frankfurtas', 'Miunchenas'],
      ['Antverpenas', 'Briuselis', 'Lilis', 'Paryžius', 'Lionas']
    ];
    var html = '';
    J.forEach(function (names, i) {
      var d = spline(names.map(function (n) { return M.cities[n]; }));
      html += '<path class="rt" d="' + d + '"/><path class="rt rt--flow" pathLength="1" d="' + d + '" style="animation-duration:' + (9 + i * 3) + 's"/>';
      if (MOTION) html += '<circle class="rt__t" r="4.6"><animateMotion dur="' + (12 + i * 4) + 's" begin="' + (i * 1.3) + 's" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" path="' + d + '"/></circle>';
    });
    svg.setAttribute('viewBox', '0 0 ' + M.w + ' ' + M.h);
    svg.innerHTML = html;
    /* miestai ir užrašai (HTML, kad šriftas nemažėtų kartu su žemėlapiu) */
    /* r / l: užrašo pusė, x: tik taškas, minor: slepiama planšetėje, m2: užrašas slepiamas telefone */
    var CITY = { 'Vilnius': 'home', 'Varšuva': 'r minor', 'Berlynas': 'r', 'Hamburgas': 'r m2', 'Kelnas': 'r m2', 'Frankfurtas': 'r minor', 'Miunchenas': 'r',
      'Briuselis': 'l m2', 'Antverpenas': 'x minor', 'Paryžius': 'l', 'Lionas': 'r m2', 'Marselis': 'r', 'Bordo': 'l m2', 'Lilis': 'x minor', 'Strasbūras': 'x minor' };
    var frag = document.createDocumentFragment();
    Object.keys(CITY).forEach(function (n) {
      var c = M.cities[n], f = CITY[n], minor = f.indexOf('minor') > -1, dot = document.createElement('i');
      dot.className = 'map__city' + (f === 'home' ? ' map__city--home' : '') + (minor ? ' map__city--minor' : '');
      dot.style.left = (c[0] / M.w * 100) + '%'; dot.style.top = (c[1] / M.h * 100) + '%';
      frag.appendChild(dot);
      if (f.charAt(0) === 'x') return;
      var l = document.createElement('span');
      l.className = 'map__lbl' + (f === 'home' ? ' map__lbl--home' : '') + (minor ? ' map__lbl--minor' : '') + (f.indexOf('m2') > -1 ? ' map__lbl--m2' : '');
      l.textContent = f === 'home' ? 'Bazė: Vilnius' : n;
      l.style.left = dot.style.left; l.style.top = dot.style.top;
      if (f.charAt(0) === 'l') l.style.setProperty('--tx', 'calc(-100% - 12px)');
      if (f === 'home') { l.style.setProperty('--tx', '-50%'); l.style.marginTop = '-30px'; }
      frag.appendChild(l);
    });
    mapEl.appendChild(frag);
    /* sąveika */
    $$('[data-land]').forEach(function (row) {
      var v = parseInt(row.dataset.land, 10) || 0;
      var on = function () { if (hl === v && row.classList.contains('is-on')) return; hl = v; row.classList.add('is-on'); if (!MOTION) draw(0); };
      var off = function () { if (hl === v) hl = 0; row.classList.remove('is-on'); if (!MOTION) draw(0); };
      // pointermove, ne pointerenter: kitaip slenkant po nejudančia pele šalys žemėlapyje mirksėtų viena po kitos
      row.addEventListener('pointermove', function () { if (KL.realMove()) on(); }); row.addEventListener('pointerleave', off);
      row.addEventListener('focus', on); row.addEventListener('blur', off);
    });
    if (KL.fine) {
      mapEl.addEventListener('pointermove', function (e) { if (!KL.realMove()) return; var r = mapEl.getBoundingClientRect(), k = r.width / M.w; px = (e.clientX - r.left) / k; py = (e.clientY - r.top) / k; });
      mapEl.addEventListener('pointerleave', function () { px = py = -999; });
    }
    window.addEventListener('resize', size);
    size();
    if (MOTION) {
      new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { rootMargin: '80px 0px' }).observe(mapEl);
      gsap.ticker.add(function (t) {
        if (!vis || t - last < 0.031) return;
        // Atsiskleidus žemėlapiui, slenkant jis neperpiešiamas (taškų mirgėjimo tada vis tiek nesimato), kad slinkimui liktų daugiau laiko
        if (started && st.rev >= 1 && performance.now() - (KL.lastScroll || 0) < 150) return;
        last = t;
        if (!started && mapEl.classList.contains('is-in')) { started = true; gsap.to(st, { rev: 1, duration: 2.6, ease: 'power2.out' }); }
        draw(t * 1000);
      });
    } else if (svg.pauseAnimations) svg.pauseAnimations();
  })();

  /* ================= autoparkas: vilkiko brėžinys ================= */
  var rig = $('[data-rig]');
  if (rig) (function () {
    var tabs = $$('.tabs__btn', rig), pill = $('.tabs__pill', rig), trailers = $$('.tr-trailer', rig), descs = $$('.rig__desc p', rig);
    var vals = $$('[data-spec-v]', rig), units = $$('[data-spec-u]', rig), labs = $$('[data-spec-l]', rig), cur = 'tent';
    var DATA = {
      tent:   [[13.6, 1, 'm', 'vidinis ilgis'], [92, 0, 'm³', 'tūris'], [24, 0, 't', 'keliamoji galia'], [33, 0, '', 'europaletės']],
      reefer: [[13.4, 1, 'm', 'vidinis ilgis'], [86, 0, 'm³', 'tūris'], [22, 0, 't', 'keliamoji galia'], [33, 0, '', 'europaletės']],
      box:    [[12.2, 1, 'm', '40′ konteinerio ilgis'], [76, 0, 'm³', '40′ HC tūris'], [26, 0, 't', 'krovinio masė'], [3, 0, '', 'dydžiai: 20′, 40′, 45′']]
    };
    function movePill() {
      var b = $('.tabs__btn.is-active', rig);
      if (b && pill) { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
    }
    function set(type, animate) {
      cur = type;
      tabs.forEach(function (b) { var on = b.dataset.type === type; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
      movePill();
      trailers.forEach(function (g) { g.classList.toggle('is-on', g.dataset.trailer === type); });
      descs.forEach(function (p) { p.classList.toggle('is-on', p.dataset.type === type); });
      DATA[type].forEach(function (sp, i) {
        if (!vals[i]) return;
        if (animate) KL.countTo(vals[i], sp[0], sp[1], 0.9); else vals[i].textContent = fmt(sp[0], sp[1]);
        units[i].textContent = sp[2]; labs[i].textContent = sp[3];
      });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.type !== cur) set(b.dataset.type, true); }); });
    set('tent', false);
    window.addEventListener('resize', movePill);
    window.addEventListener('load', movePill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);
    if (MOTION) {
      var svgEl = $('[data-rig-svg]', rig), truck = $('[data-rig-truck]', rig), wheels = $$('.tr-wheel', rig);
      // Ratai sukami tiesiogiai (CSS: transform-box: fill-box, todėl kiekvienas apie savo ašį) ir pagal tos pačios
      // animacijos eigą kaip vilkiko poslinkis, kad sukimasis ir važiavimas visada sutaptų.
      var spin = function () {
        var deg = 'rotate(' + ((this.progress() - 1) * 554).toFixed(1) + 'deg)';
        for (var i = 0; i < wheels.length; i++) wheels[i].style.transform = deg;
      };
      gsap.fromTo(truck, { x: -300 }, { x: 0, ease: 'none', onUpdate: spin,
        scrollTrigger: { trigger: svgEl, start: 'top 98%', end: 'top 34%', scrub: 0.7 } });
    }
  })();

  /* ================= procesas: vilkikas važiuoja keliu =================
     Vilkiką vertikaliai laiko bėgis su position: sticky (56 % ekrano aukščio), todėl jo nereikia kas kadrą „traukti atgal“
     prieš slinkimą: taip jis nedreba ir tada, kai slenkama klaviatūra, slinkties juosta ar pirštu.
     JS pagal bėgio vietą kelyje nustato tik poslinkį į šoną, pasukimą ir raudonos linijos ilgį. */
  var proc = $('[data-proc]');
  if (proc) (function () {
    var track = $('.proc__track', proc), rail = $('.proc__rail', proc), svg = $('.proc__svg', proc);
    if (!track || !rail || !svg) return;
    var paths = $$('path', svg), prog = $('.proc__prog', svg), truck = $('.proc__truck', proc), steps = $$('.pstep', track);
    var L = 0, n = 0, xs = [], ys = [], stopsY = [], raf = 0;
    function build() {
      var W = track.clientWidth, Ht = track.clientHeight, mob = window.innerWidth <= 860;
      if (!W || !Ht) return;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Ht);
      var cx = mob ? 30 : W / 2, amp = mob ? 0 : Math.min(70, W * 0.05), pts = [[cx, 0]];
      stopsY = steps.map(function (stp) { return stp.offsetTop + stp.offsetHeight / 2; });
      stopsY.forEach(function (y, i) { pts.push([cx + (i % 2 ? 1 : -1) * amp, y]); });
      pts.push([cx, Ht]);
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2;
        d += ' C' + a[0] + ' ' + my + ' ' + b[0] + ' ' + my + ' ' + b[0] + ' ' + b[1];
      }
      paths.forEach(function (p) { p.setAttribute('d', d); });
      L = prog.getTotalLength();
      prog.style.strokeDasharray = L + ' ' + L;
      // Kelio taškų lentelė (x pagal y; kelias visą laiką leidžiasi žemyn), kad slenkant nereikėtų klausti SVG geometrijos
      n = Math.max(2, Math.ceil(L / 4)); xs = new Array(n + 1); ys = new Array(n + 1);
      for (var k = 0; k <= n; k++) { var pt = prog.getPointAtLength(L * k / n); xs[k] = pt.x; ys[k] = pt.y; }
      update();
    }
    function update() {
      raf = 0;
      if (!n) return;
      var y = rail.getBoundingClientRect().top - track.getBoundingClientRect().top;      // bėgio vieta kelyje
      var lo = 0, hi = n;
      while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (ys[mid] <= y) lo = mid; else hi = mid; }
      var span = ys[hi] - ys[lo], f = span > 0 ? clamp((y - ys[lo]) / span, 0, 1) : 0;
      var x = xs[lo] + (xs[hi] - xs[lo]) * f;
      var i0 = Math.max(0, lo - 2), i1 = Math.min(n, hi + 2);
      var ang = Math.atan2(ys[i1] - ys[i0], xs[i1] - xs[i0]) * 180 / Math.PI - 90;
      truck.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) rotate(' + ang.toFixed(1) + 'deg)';
      prog.style.strokeDashoffset = (L - L * (lo + f) / n).toFixed(1);
      for (var s = 0; s < steps.length; s++) steps[s].classList.toggle('is-done', y >= stopsY[s] - 14);
    }
    function req() { if (!raf) raf = requestAnimationFrame(update); }
    // Su Lenis atnaujinama tame pačiame kadre, kuriame pasikeičia slinkimo padėtis; kitais atvejais (klaviatūra, pirštas) per scroll įvykį
    if (KL.lenis) KL.lenis.on('scroll', update);
    window.addEventListener('scroll', req, { passive: true });
    // puslapio aukščiui pasikeitus (šriftai, lango plotis) kelias perskaičiuojamas
    if ('ResizeObserver' in window) new ResizeObserver(function () { build(); }).observe(document.body);
    window.addEventListener('resize', build);
    window.addEventListener('load', build);
    KL.onReady(function () { setTimeout(build, 80); });
    build();
  })();
})();
