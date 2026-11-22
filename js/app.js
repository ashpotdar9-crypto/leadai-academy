/* LeadAI Academy: a static, dependency-free learning app.
   All content ships in data/course.js; all progress lives in localStorage.
   No backend, no AI or network calls at runtime. */
(function () {
  'use strict';
  var C = window.COURSE;
  var KEY = 'leadai.v1';
  var main = document.getElementById('main');

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(key, n) { var p = key.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return dayKey(d); }
  function fmtMins(secs) { var m = Math.round(secs / 60); return m + ' min'; }
  function byId(id) { return LESSONS[id]; }
  function modOf(id) { return MODS[byId(id).module]; }
  function pct(n) { return Math.max(0, Math.min(100, Math.round(n))); }

  var LESSONS = {}, MODS = {}, ORDER = [];
  C.modules.forEach(function (m, i) { m.index = i + 1; MODS[m.id] = m; });
  C.lessons.forEach(function (l) { LESSONS[l.id] = l; ORDER.push(l.id); l.quiz.forEach(function (q, i) { q.id = l.id + '-' + i; q.lesson = l.id; }); l.cards.forEach(function (c, i) { c.id = l.id + '-' + i; c.lesson = l.id; }); });

  /* ---------- icons (original line icons) ---------- */
  var P = {
    logo: '<path d="M4 18 L10 6 L14 13 L16.5 9 L20 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16.5" cy="5" r="1.8" fill="currentColor"/>',
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14"/>',
    cards: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
    bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
    chart: '<path d="M4 20V10 M10 20V4 M16 20v-7 M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    flame: '<path d="M12 22c4 0 7-2.8 7-6.8 0-3.7-2.6-6-4-8.7-.6 2-1.6 3.2-3 3.9.3-3.2-1-6.3-3.6-8.4C8.6 5.6 5 8.6 5 14.6 5 19 8 22 12 22z" fill="currentColor" stroke="none"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" stroke="none"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5 M19 19v2H6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6 M12 17h.01"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h6"/>',
    list: '<path d="M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    arrowR: '<path d="M5 12h14 M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5 M11 6l-6 6 6 6"/>',
    trophy: '<path d="M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M17 5h3v2a3 3 0 0 1-3 3 M7 5H4v2a3 3 0 0 0 3 3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    redo: '<path d="M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3h8l-2 6h-4z M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
    graduate: '<path d="m2 9 10-5 10 5-10 5z M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5 M22 9v6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z M3 13l9 5 9-5 M3 17.5l9 5 9-5"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z M14 6l4 4"/>',
    download: '<path d="M12 4v12 M6 11l6 6 6-6 M4 21h16"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11"/>',
    x: '<path d="M6 6l12 12 M18 6 6 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  function ic(n, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + (P[n] || '') + '</svg>'; }
  document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = ic(el.getAttribute('data-icon')); });

  /* ---------- state ---------- */
  var defaults = { name: '', theme: 'system', goal: 50, sound: true, xp: 0, days: {}, lessons: {}, cards: {}, mistakes: {}, badges: {}, notes: {}, vpos: {}, last: null, welcomed: false, answered: 0, correct: 0, reviews: 0, challenges: 0 };
  var st = load();
  function load() {
    var s = {};
    try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
    var o = {}; for (var k in defaults) o[k] = (k in s) ? s[k] : JSON.parse(JSON.stringify(defaults[k]));
    return o;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function lp(id) { if (!st.lessons[id]) st.lessons[id] = { seen: [], learned: false, watched: false, quizBest: 0, quizTries: 0 }; return st.lessons[id]; }
  function lessonPct(id) {
    var l = byId(id), p = st.lessons[id]; if (!p) return 0;
    var learn = (p.seen.filter(Boolean).length / l.sections.length) * 50;
    var quiz = Math.min(p.quizBest, 100) / 100 * 35;
    var vid = p.watched ? 15 : 0;
    return pct(learn + quiz + vid);
  }
  function isDone(id) { var p = st.lessons[id]; return !!(p && p.learned && p.quizBest >= 70); }
  function modPct(m) { var t = 0; m.lessons.forEach(function (id) { t += lessonPct(id); }); return pct(t / m.lessons.length); }
  function doneCount() { return ORDER.filter(isDone).length; }

  /* ---------- XP, streak, levels ---------- */
  function today() { return dayKey(); }
  function todayXP() { return st.days[today()] || 0; }
  function streak() {
    var d = today(), n = 0;
    if (!st.days[d]) d = addDays(d, -1);
    while (st.days[d] > 0) { n++; d = addDays(d, -1); }
    return n;
  }
  function levelFor(xp) { var n = 1; while (50 * (n + 1) * n <= xp) n++; return n; }
  function levelBase(n) { return 50 * n * (n - 1); }
  function award(xp, reason, ev) {
    if (!xp) return;
    var lvl = levelFor(st.xp), before = todayXP();
    st.xp += xp; st.welcomed = true; st.days[today()] = before + xp; save();
    if (ev && ev.clientX) floatXP('+' + xp + ' XP', ev.clientX, ev.clientY);
    if (before < st.goal && before + xp >= st.goal) { toast('Daily goal reached! Keep the streak going.', 'target'); confetti(); }
    var nl = levelFor(st.xp); if (nl > lvl) { toast('Level up! You reached level ' + nl + '.', 'trophy'); confetti(); }
    checkBadges(); renderStats();
  }
  function floatXP(text, x, y) { var el = document.createElement('div'); el.className = 'xp-float'; el.textContent = text; el.style.left = (x - 20) + 'px'; el.style.top = (y - 20) + 'px'; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1000); }

  /* ---------- badges ---------- */
  var BADGES = [
    { id: 'first', name: 'First steps', desc: 'Finish your first lesson section', icon: 'book', test: function () { return Object.keys(st.lessons).some(function (k) { return st.lessons[k].seen.some(Boolean); }); } },
    { id: 'lesson1', name: 'Lesson complete', desc: 'Complete a whole lesson', icon: 'check', test: function () { return doneCount() >= 1; } },
    { id: 'ace', name: 'Quiz ace', desc: 'Score 100% on a lesson quiz', icon: 'target', test: function () { return Object.keys(st.lessons).some(function (k) { return st.lessons[k].quizBest >= 100; }); } },
    { id: 'streak3', name: 'On fire', desc: 'Reach a 3-day streak', icon: 'flame', test: function () { return streak() >= 3; } },
    { id: 'streak7', name: 'Week warrior', desc: 'Reach a 7-day streak', icon: 'flame', test: function () { return streak() >= 7; } },
    { id: 'cards50', name: 'Card sharp', desc: 'Review 50 flashcards', icon: 'cards', test: function () { return st.reviews >= 50; } },
    { id: 'module', name: 'Module master', desc: 'Complete every lesson in a module', icon: 'layers', test: function () { return C.modules.some(function (m) { return m.lessons.every(isDone); }); } },
    { id: 'challenge', name: 'Challenger', desc: 'Finish a daily challenge', icon: 'bolt', test: function () { return st.challenges >= 1; } },
    { id: 'xp1000', name: 'Scholar', desc: 'Earn 1,000 XP', icon: 'star', test: function () { return st.xp >= 1000; } },
    { id: 'half', name: 'Halfway there', desc: 'Complete 15 lessons', icon: 'medal', test: function () { return doneCount() >= 15; } },
    { id: 'grad', name: 'Graduate', desc: 'Complete all ' + ORDER.length + ' lessons', icon: 'graduate', test: function () { return doneCount() >= ORDER.length; } },
    { id: 'notes', name: 'Reflective leader', desc: 'Write a personal note on a lesson', icon: 'pen', test: function () { return Object.keys(st.notes).some(function (k) { return (st.notes[k] || '').trim().length > 20; }); } }
  ];
  function checkBadges() {
    BADGES.forEach(function (b) {
      if (!st.badges[b.id] && b.test()) { st.badges[b.id] = today(); save(); toast('Badge earned: ' + b.name, b.icon); }
    });
  }

  /* ---------- feedback: toast, sound, confetti ---------- */
  function toast(msg, icon) {
    var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icon || 'star') + '<span>' + esc(msg) + '</span>';
    document.getElementById('toasts').appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }
  var actx = null;
  function beep(good) {
    if (!st.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var notes = good ? [660, 880] : [300, 220];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + i * 0.09;
        o.type = good ? 'sine' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + 0.18);
      });
    } catch (e) {}
  }
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
    var cols = ['#3b4ee0', '#f2a93b', '#1f9d63', '#d9488b', '#0e9f8e', '#f26b1d'];
    var ps = []; for (var i = 0; i < 140; i++) ps.push({ x: W / 2 + (Math.random() - .5) * 200, y: H / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 3, c: cols[i % cols.length], a: Math.random() * 6 });
    var t = 0;
    (function frame() {
      ctx.clearRect(0, 0, W, H); t++;
      ps.forEach(function (p) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore(); });
      if (t < 120) requestAnimationFrame(frame); else cv.remove();
    })();
  }

  /* ---------- chrome ---------- */
  var NAV = [
    ['#/', 'home', 'Home'], ['#/learn', 'map', 'Learn'], ['#/practice', 'bolt', 'Practice'], ['#/review', 'cards', 'Review'], ['#/progress', 'chart', 'Progress'], ['#/settings', 'gear', 'Settings']
  ];
  function renderNav(active) {
    var html = NAV.map(function (n) { return '<a href="' + n[0] + '" class="' + (active === n[0] ? 'on' : '') + '"' + (active === n[0] ? ' aria-current="page"' : '') + '>' + ic(n[1]) + '<span>' + n[2] + '</span></a>'; }).join('');
    document.getElementById('nav').innerHTML = html;
    document.getElementById('tabbar').innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '" class="' + (active === n[0] ? 'on' : '') + '">' + ic(n[1]) + '<span>' + n[2] + '</span></a>'; }).join('');
  }
  function renderStats() {
    var s = streak(), dark = isDark();
    document.getElementById('stats').innerHTML =
      '<span class="chip flame" title="Day streak">' + ic('flame') + s + '<span class="lbl">&nbsp;day' + (s === 1 ? '' : 's') + '</span></span>' +
      '<span class="chip xp" title="Total XP">' + ic('star') + st.xp + '<span class="lbl">&nbsp;XP</span></span>' +
      '<button class="icon-btn" id="themeBtn" aria-label="Switch to ' + (dark ? 'light' : 'dark') + ' mode">' + ic(dark ? 'sun' : 'moon') + '</button>';
    document.getElementById('themeBtn').onclick = function () { setTheme(isDark() ? 'light' : 'dark'); };
  }
  function isDark() { return st.theme === 'dark' || (st.theme === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
  function setTheme(t) { st.theme = t; save(); if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); renderStats(); if (location.hash.indexOf('settings') > -1) route(); }

  document.getElementById('searchForm').addEventListener('submit', function (e) { e.preventDefault(); var q = document.getElementById('q').value.trim(); if (q) location.hash = '#/search/' + encodeURIComponent(q); });

  /* ---------- router ---------- */
  var cleanup = null;
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    var h = location.hash.replace(/^#/, '') || '/';
    var parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    var navKey = '#/' + (parts[0] && ['learn', 'practice', 'review', 'progress', 'settings'].indexOf(parts[0]) > -1 ? parts[0] : (parts[0] === 'lesson' || parts[0] === 'module' ? 'learn' : ''));
    renderNav(navKey); renderStats();
    var v;
    try {
      if (!parts.length) v = viewHome();
      else if (parts[0] === 'learn') v = viewLearn();
      else if (parts[0] === 'module' && MODS[parts[1]]) v = viewLearn(parts[1]);
      else if (parts[0] === 'lesson' && LESSONS[parts[1]]) v = viewLesson(parts[1], parts[2] || 'overview', parts[3]);
      else if (parts[0] === 'practice') v = viewPractice(parts[1]);
      else if (parts[0] === 'review') v = viewReview();
      else if (parts[0] === 'progress') v = viewProgress();
      else if (parts[0] === 'settings') v = viewSettings();
      else if (parts[0] === 'search') v = viewSearch(parts.slice(1).join('/'));
      else v = '<div class="empty"><h2>Page not found</h2><p><a href="#/">Go home</a></p></div>';
    } catch (err) { console.error(err); v = '<div class="empty"><h2>Something went wrong</h2><p>' + esc(err.message) + '</p></div>'; }
    if (typeof v === 'string') main.innerHTML = v;
    if (parts[0] !== 'search') document.getElementById('q').value = '';
    window.scrollTo(0, 0);
    bindCommon();
    setTimeout(function () { var t = main.querySelector('.tabs'), on = t && t.querySelector('a.on'); if (on) t.scrollLeft = on.offsetLeft - t.clientWidth / 2 + on.clientWidth / 2; });
  }
  window.addEventListener('hashchange', route);
  function bindCommon() {
    main.querySelectorAll('figure.fig img').forEach(function (img) {
      img.addEventListener('click', function () {
        var lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Enlarged diagram');
        lb.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="' + esc(img.alt) + '">';
        lb.onclick = function () { lb.remove(); }; document.body.appendChild(lb);
        document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', k); } });
      });
    });
  }

  /* ---------- views: home ---------- */
  function nextLesson() {
    if (st.last && !isDone(st.last)) return st.last;
    for (var i = 0; i < ORDER.length; i++) if (!isDone(ORDER[i])) return ORDER[i];
    return ORDER[0];
  }
  function weekStrip() {
    var out = '', d = addDays(today(), -6), names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (var i = 0; i < 7; i++) {
      var p = d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
      out += '<div class="d' + (st.days[d] ? ' on' : '') + (d === today() ? ' today' : '') + '" title="' + d + ': ' + (st.days[d] || 0) + ' XP"><i></i>' + names[dt.getDay()] + '</div>';
      d = addDays(d, 1);
    }
    return '<div class="week" aria-label="Activity in the last 7 days">' + out + '</div>';
  }
  function dueCards() { var t = today(); return Object.keys(st.cards).filter(function (k) { return st.cards[k].due <= t; }); }
  function viewHome() {
    var nx = byId(nextLesson()), m = MODS[nx.module], started = st.lessons[nx.id];
    var g = pct(todayXP() / st.goal * 100), due = dueCards().length, mist = Object.keys(st.mistakes).length;
    var hello = st.name ? 'Welcome back, ' + esc(st.name) : (st.welcomed ? 'Welcome back' : 'Welcome to LeadAI Academy');
    var html = '';
    if (!st.welcomed) {
      html += '<div class="card section-gap" style="margin-top:12px"><div class="row"><div style="flex:1;min-width:240px"><div class="eyebrow">Get started</div><h2 style="margin:4px 0 6px">Learn strategic leadership for the AI era, one bite at a time</h2><p class="muted" style="margin:0">' + ORDER.length + ' lessons across ' + C.modules.length + ' modules, each with short readings, the class video, a quiz and flashcards. Free and open to everyone, with no sign-up. Pick a daily goal to start your streak.</p></div></div>' +
        '<div class="row" style="margin-top:14px"><span class="seg" id="goalPick">' + [20, 50, 100].map(function (x) { return '<button data-g="' + x + '" class="' + (st.goal === x ? 'on' : '') + '">' + (x === 20 ? 'Casual' : x === 50 ? 'Regular' : 'Serious') + ' · ' + x + ' XP</button>'; }).join('') + '</span><button class="btn" id="startBtn">Start learning ' + ic('arrowR') + '</button></div></div>';
    }
    html += '<div class="hero"><div class="card hero-main"><span class="deco"></span><span class="deco2"></span><div class="eyebrow">' + (started ? 'Continue learning' : 'Up next') + ' · Module ' + m.index + '</div><h1>' + esc(nx.title) + '</h1><p>' + esc(nx.subtitle) + '</p>' +
      '<div class="row"><a class="btn" href="#/lesson/' + nx.id + (started ? '' : '/learn/0') + '">' + ic('play') + (started ? 'Resume lesson' : 'Start lesson') + '</a><span style="color:rgba(255,255,255,.85);font-weight:700">' + lessonPct(nx.id) + '% complete</span></div></div>' +
      '<div class="card"><div class="goal"><div class="ring" style="--p:' + g + ';--c:var(--accent)"><span>' + g + '%</span></div><div class="kpi"><b>' + todayXP() + ' / ' + st.goal + ' XP</b><span>' + hello + '. Today\'s goal</span></div></div>' + weekStrip() +
      '<div class="row" style="margin-top:14px;gap:18px"><div class="kpi"><b style="color:var(--flame)">' + streak() + '</b><span>day streak</span></div><div class="kpi"><b>' + levelFor(st.xp) + '</b><span>level</span></div><div class="kpi"><b>' + doneCount() + '/' + ORDER.length + '</b><span>lessons done</span></div></div></div></div>';
    html += '<div class="grid g3 section-gap">' +
      quick('#/practice/daily', 'bolt', 'Daily challenge', '10 mixed questions from what you have studied', '') +
      quick('#/review', 'cards', 'Review flashcards', due ? due + ' card' + (due === 1 ? '' : 's') + ' due today' : 'Spaced repetition keeps ideas fresh', due ? due : '') +
      quick('#/practice/mistakes', 'redo', 'Fix your mistakes', mist ? mist + ' question' + (mist === 1 ? '' : 's') + ' to retry' : 'Questions you miss will collect here', mist ? mist : '') + '</div>';
    html += '<div class="row section-gap"><h2>Modules</h2><span class="spacer"></span><a href="#/learn">View learning path</a></div><div class="grid g3" style="margin-top:14px">' + C.modules.map(modTile).join('') + '</div>';
    setTimeout(function () {
      var gp = document.getElementById('goalPick');
      if (gp) gp.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; st.goal = +b.dataset.g; save(); gp.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
      var sb = document.getElementById('startBtn'); if (sb) sb.onclick = function () { st.welcomed = true; save(); location.hash = '#/lesson/' + ORDER[0] + '/learn/0'; };
    });
    return html;
  }
  function quick(href, icon, t, d, count) {
    return '<a class="card activity" href="' + href + '"><span class="ic">' + ic(icon) + '</span><span><h3>' + t + '</h3><span class="muted" style="font-size:14px">' + d + '</span></span>' + (count ? '<span class="st" style="color:var(--brand);font-weight:800">' + count + '</span>' : '') + '</a>';
  }
  function modTile(m) {
    var p = modPct(m), done = m.lessons.filter(isDone).length;
    return '<a class="card mod" href="#/module/' + m.id + '" style="--mc:' + m.color + '"><span class="stripe"></span><span class="num">Module ' + m.index + ' · ' + m.lessons.length + ' lessons</span><h3>' + esc(m.title) + '</h3><p>' + esc(m.blurb) + '</p><div class="bar"><i style="width:' + p + '%"></i></div><span class="muted" style="font-size:13px">' + p + '% · ' + done + ' of ' + m.lessons.length + ' complete</span></a>';
  }

  /* ---------- views: learning path ---------- */
  function viewLearn(only) {
    var mods = only ? [MODS[only]] : C.modules;
    var html = only ? '<div class="crumbs"><a href="#/learn">Learning path</a><span>/</span><span>Module ' + MODS[only].index + '</span></div>' : '';
    html += '<div style="margin-top:12px"><div class="eyebrow">' + esc(C.programme) + '</div><h1 style="margin-top:4px">' + (only ? esc(MODS[only].title) : 'Your learning path') + '</h1><p class="lead" style="margin:6px 0 0">' + (only ? esc(MODS[only].blurb) : 'Work through the modules in order or jump to any lesson. Everything is open.') + '</p></div>';
    mods.forEach(function (m) {
      var p = modPct(m);
      html += '<section class="path-mod" style="--mc:' + m.color + '"><div class="path-head"><div class="ring" style="--p:' + p + '"><span>' + p + '%</span></div><div><div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.85">Module ' + m.index + '</div><h2 style="color:#fff;font-size:20px">' + esc(m.title) + '</h2><p>' + esc(m.blurb) + '</p></div></div><ol class="path">';
      m.lessons.forEach(function (id) {
        var l = byId(id), lpct = lessonPct(id), done = isDone(id);
        var node = done ? '<span class="node done" aria-label="Completed">' + ic('check') + '</span>' : lpct > 0 ? '<span class="node part" style="--p:' + lpct + '"><span>' + l.num + '</span></span>' : '<span class="node">' + l.num + '</span>';
        html += '<li><a class="item" href="#/lesson/' + id + '">' + node + '<span style="min-width:0"><span class="meta">Class ' + l.num + (l.workshop ? ' · Workshop' : '') + ' · ' + esc(l.date) + '</span><div class="t">' + esc(l.title) + '</div><span class="meta">' + l.readMins + ' min read · ' + (l.videoSecs ? fmtMins(l.videoSecs) + ' video · ' : '') + l.quiz.length + ' questions' + (lpct ? ' · ' + lpct + '%' : '') + '</span></span></a></li>';
      });
      html += '</ol></section>';
    });
    return html;
  }

  /* ---------- views: lesson ---------- */
  function lessonTabs(l, tab) {
    var p = st.lessons[l.id] || {};
    var T = [['overview', 'list', 'Overview'], ['learn', 'book', 'Learn', p.learned], ['watch', 'play', 'Watch', p.watched], ['takeaways', 'star', 'Takeaways'], ['quiz', 'quiz', 'Quiz', p.quizBest >= 70], ['cards', 'cards', 'Flashcards'], ['notes', 'doc', 'Notes']];
    return '<nav class="tabs" aria-label="Lesson sections">' + T.map(function (t) {
      var href = '#/lesson/' + l.id + (t[0] === 'overview' ? '' : '/' + t[0] + (t[0] === 'learn' ? '/0' : ''));
      return '<a href="' + href + '" class="' + (tab === t[0] ? 'on' : '') + '">' + ic(t[1]) + t[2] + (t[3] ? '<span class="ok">' + ic('check') + '</span>' : '') + '</a>';
    }).join('') + '</nav>';
  }
  function lessonHead(l, compact) {
    var m = MODS[l.module];
    var html = '<div class="crumbs"><a href="#/learn">Learning path</a><span>/</span><a href="#/module/' + m.id + '">Module ' + m.index + ': ' + esc(m.title) + '</a></div>';
    if (compact) return html + '<div class="row" style="gap:8px"><span class="eyebrow" style="color:' + m.color + '">Class ' + l.num + '</span></div><h2 style="margin:2px 0 0">' + esc(l.title) + '</h2>';
    return html;
  }
  function viewLesson(id, tab, arg) {
    var l = byId(id); st.last = id; save();
    var m = MODS[l.module];
    if (tab === 'learn') return viewReader(l, +arg || 0);
    if (tab === 'quiz') return startQuiz(l.quiz.map(function (q) { return q; }), { title: 'Lesson quiz', lesson: l, back: '#/lesson/' + id });
    if (tab === 'cards') return viewDeck(l.cards, { title: 'Flashcards', lesson: l });
    var html = lessonHead(l);
    html += '<div class="card lesson-hero" style="--mc:' + m.color + '"><div class="eyebrow" style="color:' + m.color + '">Class ' + l.num + (l.workshop ? ' · Workshop' : '') + ' · Module ' + m.index + '</div><h1>' + esc(l.title) + '</h1><p class="sub">' + esc(l.subtitle) + '</p>' +
      '<div class="bar good" style="max-width:420px"><i style="width:' + lessonPct(id) + '%"></i></div><span class="muted" style="font-size:13px">' + lessonPct(id) + '% complete' + (isDone(id) ? ' · Lesson complete' : '') + '</span>' +
      '<div class="tags"><span class="tag">' + ic('clock') + l.readMins + ' min read</span>' + (l.videoSecs ? '<span class="tag">' + ic('play') + fmtMins(l.videoSecs) + ' video</span>' : '') + '<span class="tag">' + ic('quiz') + l.quiz.length + ' questions</span><span class="tag">' + ic('cards') + l.cards.length + ' flashcards</span><span class="tag">' + esc(l.date) + '</span><span class="tag">' + esc(l.faculty) + '</span></div></div>';
    html += lessonTabs(l, tab);
    if (tab === 'overview') {
      var p = st.lessons[id] || { seen: [] };
      html += '<p class="hook">' + esc(l.hook) + '</p><div class="grid g2 section-gap">' +
        activity('#/lesson/' + id + '/learn/' + firstUnseen(l), 'book', 'Learn', l.sections.length + ' bite-sized steps · ' + l.readMins + ' min', p.learned) +
        activity('#/lesson/' + id + '/watch', 'play', 'Watch the class video', l.videoSecs ? fmtMins(l.videoSecs) + ' summary video' : 'Class video', p.watched) +
        activity('#/lesson/' + id + '/quiz', 'quiz', 'Take the quiz', l.quiz.length + ' questions · pass at 70%' + (p.quizBest ? ' · best ' + p.quizBest + '%' : ''), p.quizBest >= 70) +
        activity('#/lesson/' + id + '/cards', 'cards', 'Practise flashcards', l.cards.length + ' key concepts', false) + '</div>';
      html += '<h2 class="section-gap">What you will learn</h2><ol class="takeaways" style="margin-top:12px">' + l.sections.map(function (s, i) { return '<li><a href="#/lesson/' + id + '/learn/' + i + '" style="color:inherit">' + esc(s.h) + '</a></li>'; }).join('') + '</ol>';
      html += lessonPager(l);
    } else if (tab === 'watch') {
      html += '<div class="video-wrap"><video id="vid" controls preload="metadata" playsinline src="' + esc(l.video) + '"></video></div><div id="vidMsg"></div><p class="muted" style="margin-top:12px">Watch at least 80% of the video to earn 15 XP. Your position is remembered.</p>';
      setTimeout(function () { bindVideo(l); });
    } else if (tab === 'takeaways') {
      html += '<h2>Key takeaways</h2><ol class="takeaways" style="margin-top:12px">' + l.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
        (l.quote ? '<blockquote class="quote">“' + esc(l.quote) + '”' + (l.quoteBy ? '<cite>' + esc(l.quoteBy) + '</cite>' : '') + '</blockquote>' : '') +
        '<div class="row section-gap"><a class="btn" href="#/lesson/' + id + '/quiz">' + ic('quiz') + 'Test yourself</a><a class="btn ghost" href="#/lesson/' + id + '/cards">' + ic('cards') + 'Flashcards</a></div>';
    } else if (tab === 'notes') {
      html += '<div class="grid g2"><div class="card"><h3>My notes and reflections</h3><p class="muted" style="font-size:14px;margin:4px 0 10px">Reflection is where senior learning happens. Notes are saved automatically on this device.</p><textarea id="noteBox" placeholder="What will you apply from this class in your organisation?">' + esc(st.notes[id] || '') + '</textarea><div class="muted" id="noteSaved" style="font-size:13px;margin-top:6px">&nbsp;</div></div>' +
        '<div class="card"><h3>Original class summary</h3><p class="muted" style="font-size:14px;margin:4px 0 14px">The two-page summary PDF this lesson was built from, with all diagrams.</p><div class="row"><a class="btn" href="' + esc(l.notes) + '" target="_blank" rel="noopener">' + ic('doc') + 'Open PDF</a><a class="btn ghost" href="' + esc(l.notes) + '" download>' + ic('download') + 'Download</a></div></div></div>';
      setTimeout(function () {
        var tb = document.getElementById('noteBox'), t;
        tb.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.notes[id] = tb.value; save(); document.getElementById('noteSaved').textContent = 'Saved'; checkBadges(); }, 400); });
      });
    }
    return html;
  }
  function lessonPager(l) {
    var i = ORDER.indexOf(l.id), prev = ORDER[i - 1], next = ORDER[i + 1];
    return '<div class="step-nav section-gap">' + (prev ? '<a class="btn ghost" href="#/lesson/' + prev + '">' + ic('arrowL') + 'Class ' + byId(prev).num + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#/lesson/' + next + '">Class ' + byId(next).num + ic('arrowR') + '</a>' : '') + '</div>';
  }
  function firstUnseen(l) { var p = st.lessons[l.id]; if (!p) return 0; for (var i = 0; i < l.sections.length; i++) if (!p.seen[i]) return i; return 0; }
  function activity(href, icon, t, d, done) {
    return '<a class="card activity" href="' + href + '"><span class="ic">' + ic(icon) + '</span><span><h3>' + t + '</h3><span class="muted" style="font-size:14px">' + d + '</span></span>' + (done ? '<span class="st" title="Done">' + ic('check') + '</span>' : '') + '</a>';
  }
  function bindVideo(l) {
    var v = document.getElementById('vid'); if (!v) return;
    var p = lp(l.id);
    v.addEventListener('loadedmetadata', function () { var pos = st.vpos[l.id]; if (pos && pos < v.duration - 5) v.currentTime = pos; });
    var last = 0;
    v.addEventListener('timeupdate', function () {
      if (Math.abs(v.currentTime - last) > 5) { last = v.currentTime; st.vpos[l.id] = Math.floor(v.currentTime); save(); }
      if (!p.watched && v.duration && v.currentTime / v.duration > 0.8) { p.watched = true; save(); award(15); toast('Video watched: +15 XP', 'play'); }
    });
    v.addEventListener('error', function () {
      document.querySelector('.video-wrap').style.display = 'none';
      document.getElementById('vidMsg').innerHTML = '<div class="card empty">' + ic('play') + '<h3>Video not available here</h3><p>This copy of the app does not include the class video file. The reading, quiz and flashcards work without it.</p></div>';
    }, true);
  }

  /* reader: bite-sized steps */
  function viewReader(l, i) {
    var n = l.sections.length; if (i < 0 || i > n) i = 0;
    var p = lp(l.id), m = MODS[l.module];
    var html = lessonHead(l, true) + lessonTabs(l, 'learn') + '<div class="reader">';
    html += '<div class="step-top"><a class="icon-btn" href="#/lesson/' + l.id + '" aria-label="Close lesson">' + ic('x') + '</a><div class="bar good" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + Math.min(i, n) + '"><i style="width:' + (Math.min(i, n) / n * 100) + '%"></i></div><span class="muted" style="font-weight:700;font-size:14px">' + Math.min(i + 1, n) + '/' + n + '</span></div>';
    if (i === n) {
      if (!p.learned) { p.learned = true; save(); setTimeout(function () { award(20); confetti(); toast('Reading complete: +20 XP', 'book'); }, 50); }
      html += '<div class="card step-card" style="text-align:center"><div style="width:72px;height:72px;margin:0 auto 10px;border-radius:50%;background:var(--good-soft);color:var(--good);display:grid;place-items:center">' + ic('check', ' style="width:36px;height:36px"') + '</div><h2>Reading complete</h2><p class="muted">You worked through all ' + n + ' steps of Class ' + l.num + '. Lock it in with the takeaways and a quick quiz.</p></div>' +
        '<h2 class="section-gap">Key takeaways</h2><ol class="takeaways" style="margin-top:12px">' + l.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
        '<div class="step-nav"><a class="btn ghost" href="#/lesson/' + l.id + '/learn/' + (n - 1) + '">' + ic('arrowL') + 'Back</a><a class="btn" href="#/lesson/' + l.id + '/quiz">Take the quiz ' + ic('arrowR') + '</a></div></div>';
      return html;
    }
    var s = l.sections[i];
    html += '<article class="card step-card"><div class="eyebrow" style="color:' + m.color + '">Step ' + (i + 1) + ' of ' + n + '</div><h2 style="margin-top:6px">' + esc(s.h) + '</h2>';
    s.blocks.forEach(function (b) {
      if (b.p) html += '<p>' + b.p + '</p>';
      else if (b.img) html += '<figure class="fig"><img src="' + esc(b.img) + '" alt="' + esc(b.title + '. ' + b.alt) + '" loading="lazy"><figcaption>Diagram from the class summary. Tap to enlarge.</figcaption></figure>';
    });
    html += '</article><div class="step-nav">' + (i > 0 ? '<a class="btn ghost" href="#/lesson/' + l.id + '/learn/' + (i - 1) + '">' + ic('arrowL') + 'Back</a>' : '<span></span>') + '<button class="btn" id="nextStep">' + (i === n - 1 ? 'Finish' : 'Continue') + ' ' + ic('arrowR') + '</button></div></div>';
    setTimeout(function () {
      var b = document.getElementById('nextStep');
      function go(ev) { if (!p.seen[i]) { p.seen[i] = true; save(); award(5, null, ev); } location.hash = '#/lesson/' + l.id + '/learn/' + (i + 1); }
      b.onclick = go;
      var key = function (e) { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); go(); } if (e.key === 'ArrowLeft' && i > 0) location.hash = '#/lesson/' + l.id + '/learn/' + (i - 1); };
      document.addEventListener('keydown', key); cleanup = function () { document.removeEventListener('keydown', key); };
    });
    return html;
  }

  /* ---------- quiz engine ---------- */
  function startQuiz(questions, opts) {
    var qs = questions.map(function (q) { return { src: q, opts: shuffle([q.a].concat(q.w)) }; });
    if (opts.shuffle) qs = shuffle(qs);
    var i = 0, score = 0, combo = 0, answered = false, results = [];
    function head() {
      var l = opts.lesson;
      return (l ? lessonHead(l, true) + lessonTabs(l, 'quiz') : '<div style="margin-top:12px"><div class="eyebrow">Practice</div><h1 style="margin-top:4px">' + esc(opts.title) + '</h1></div>');
    }
    function render() {
      if (i >= qs.length) return finish();
      var q = qs[i];
      var html = head() + '<div class="quiz"><div class="step-top"><a class="icon-btn" href="' + (opts.back || '#/') + '" aria-label="Quit quiz">' + ic('x') + '</a><div class="bar good"><i style="width:' + (i / qs.length * 100) + '%"></i></div><span class="muted" style="font-weight:700;font-size:14px">' + (i + 1) + '/' + qs.length + '</span></div>';
      if (!opts.lesson) html += '<div class="eyebrow" style="color:' + modOf(q.src.lesson).color + '">Class ' + byId(q.src.lesson).num + ' · ' + esc(byId(q.src.lesson).title) + '</div>';
      html += (combo >= 2 ? '<div class="combo">' + ic('flame', ' style="width:14px;height:14px;vertical-align:-2px"') + ' ' + combo + ' in a row</div>' : '') + '<div class="q-text" id="qtext">' + esc(q.src.q) + '</div><div class="opts" role="group" aria-labelledby="qtext">' +
        q.opts.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><span class="k">' + (k + 1) + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div><div id="fb"></div></div>';
      main.innerHTML = html; answered = false;
      main.querySelectorAll('.opt').forEach(function (b) { b.onclick = function (e) { choose(+b.dataset.k, e); }; });
    }
    function choose(k, ev) {
      if (answered) return; answered = true;
      var q = qs[i], right = q.opts[k] === q.src.a;
      st.answered++; if (right) st.correct++;
      main.querySelectorAll('.opt').forEach(function (b, j) { b.disabled = true; if (q.opts[j] === q.src.a) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
      results.push({ q: q.src, right: right });
      if (right) { score++; combo++; delete st.mistakes[q.src.id]; beep(true); award(10 + (combo >= 3 ? 2 : 0), null, ev && ev.clientX ? ev : null); }
      else { combo = 0; st.mistakes[q.src.id] = (st.mistakes[q.src.id] || 0) + 1; beep(false); }
      save();
      var fb = document.getElementById('fb');
      fb.innerHTML = '<div class="feedback ' + (right ? 'good' : 'bad') + '" role="status"><div style="flex:1;min-width:220px"><h3>' + (right ? pick(['Nicely done!', 'Correct!', 'Spot on!', 'Exactly right!']) : 'Not quite') + '</h3><p>' + (right ? '' : '<strong>Answer:</strong> ' + esc(q.src.a) + '. ') + esc(q.src.x) + '</p></div><button class="btn ' + (right ? 'good' : 'bad') + '" id="nextQ">' + (i === qs.length - 1 ? 'See results' : 'Continue') + '</button></div>';
      var nb = document.getElementById('nextQ'); nb.focus(); nb.onclick = function () { i++; render(); };
    }
    function finish() {
      var p100 = Math.round(score / qs.length * 100), l = opts.lesson, bonus = 0, msg;
      if (l) {
        var p = lp(l.id); p.quizTries++;
        if (p100 > p.quizBest) p.quizBest = p100;
        if (p100 === 100) bonus = 20;
        save();
      }
      if (opts.onFinish) opts.onFinish(p100);
      if (bonus) award(bonus);
      if (p100 >= 70) confetti();
      msg = p100 === 100 ? 'Perfect score!' : p100 >= 70 ? 'Great work, you passed!' : 'Keep going. Review and try again.';
      var html = head() + '<div class="quiz"><div class="card result"><div class="medal" style="color:' + (p100 >= 70 ? 'var(--accent)' : 'var(--ink-3)') + '">' + ic(p100 >= 70 ? 'trophy' : 'target', ' style="width:96px;height:96px"') + '</div><div class="big">' + p100 + '%</div><h2>' + msg + '</h2><p class="muted">' + score + ' of ' + qs.length + ' correct' + (bonus ? ' · +20 XP perfect bonus' : '') + '</p>' +
        '<div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost" id="retry">' + ic('redo') + 'Try again</button>' + (l ? (p100 >= 70 ? nextBtn(l) : '<a class="btn" href="#/lesson/' + l.id + '/learn/0">' + ic('book') + 'Review lesson</a>') : '<a class="btn" href="#/">Done</a>') + '</div></div>';
      var wrong = results.filter(function (r) { return !r.right; });
      if (wrong.length) html += '<h3 class="section-gap">Review what you missed</h3><div class="list" style="margin-top:10px">' + wrong.map(function (r) { return '<div class="card"><b>' + esc(r.q.q) + '</b><p style="margin:6px 0 0;color:var(--good);font-weight:700">' + esc(r.q.a) + '</p><p class="muted" style="margin:4px 0 0;font-size:14px">' + esc(r.q.x) + '</p></div>'; }).join('') + '</div>';
      main.innerHTML = html + '</div>';
      document.getElementById('retry').onclick = function () { i = 0; score = 0; combo = 0; results = []; qs = qs.map(function (q) { return { src: q.src, opts: shuffle(q.opts) }; }); if (opts.shuffle) qs = shuffle(qs); render(); };
      checkBadges(); renderStats();
    }
    var key = function (e) {
      if (/^[1-4]$/.test(e.key) && !answered) { var b = main.querySelector('.opt[data-k="' + (+e.key - 1) + '"]'); if (b) b.click(); }
      else if (e.key === 'Enter' && answered) { var n = document.getElementById('nextQ'); if (n && document.activeElement !== n) { e.preventDefault(); n.click(); } }
    };
    document.addEventListener('keydown', key); cleanup = function () { document.removeEventListener('keydown', key); };
    setTimeout(render);
    return head();
  }
  function nextBtn(l) { var n = ORDER[ORDER.indexOf(l.id) + 1]; return n ? '<a class="btn" href="#/lesson/' + n + '">Next: Class ' + byId(n).num + ' ' + ic('arrowR') + '</a>' : '<a class="btn" href="#/progress">' + ic('trophy') + 'See progress</a>'; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- practice hub ---------- */
  function studiedLessons() { var s = ORDER.filter(function (id) { var p = st.lessons[id]; return p && (p.seen.some(Boolean) || p.quizTries); }); return s.length ? s : ORDER; }
  function viewPractice(mode) {
    if (mode === 'daily') {
      var pool = []; studiedLessons().forEach(function (id) { pool = pool.concat(byId(id).quiz); });
      return startQuiz(shuffle(pool).slice(0, 10), { title: 'Daily challenge', back: '#/practice', onFinish: function (p) { st.challenges++; save(); award(30); toast('Challenge complete: +30 XP', 'bolt'); } });
    }
    if (mode === 'mistakes') {
      var ids = Object.keys(st.mistakes), qs = [];
      ids.forEach(function (qid) { var parts = qid.split('-'); var l = byId(parts[0]); if (l && l.quiz[+parts[1]]) qs.push(l.quiz[+parts[1]]); });
      if (!qs.length) return '<div style="margin-top:12px"><h1>Fix your mistakes</h1></div><div class="card empty section-gap">' + ic('check') + '<h3>No mistakes to review</h3><p>Questions you answer wrong will collect here so you can master them.</p><a class="btn" href="#/practice/daily">Try the daily challenge</a></div>';
      return startQuiz(shuffle(qs).slice(0, 15), { title: 'Fix your mistakes', back: '#/practice' });
    }
    if (mode && mode.indexOf('module-') === 0) {
      var m = MODS[mode.slice(7)]; var pool2 = []; m.lessons.forEach(function (id) { pool2 = pool2.concat(byId(id).quiz); });
      return startQuiz(shuffle(pool2).slice(0, 15), { title: 'Module test: ' + m.title, back: '#/practice' });
    }
    if (mode === 'exam') {
      var pool3 = []; ORDER.forEach(function (id) { pool3 = pool3.concat(byId(id).quiz); });
      return startQuiz(shuffle(pool3).slice(0, 25), { title: 'Full course exam', back: '#/practice' });
    }
    var mist = Object.keys(st.mistakes).length, acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    var html = '<div style="margin-top:12px"><div class="eyebrow">Practice</div><h1 style="margin-top:4px">Sharpen what you know</h1><p class="lead" style="margin:6px 0 0">Mixed questions with instant feedback. You have answered ' + st.answered + ' questions so far' + (st.answered ? ' at ' + acc + '% accuracy' : '') + '.</p></div>';
    html += '<div class="grid g3 section-gap">' + quick('#/practice/daily', 'bolt', 'Daily challenge', '10 questions from lessons you have started · +30 XP', '') + quick('#/practice/mistakes', 'redo', 'Fix your mistakes', mist ? mist + ' to retry' : 'Nothing to fix yet', mist || '') + quick('#/practice/exam', 'graduate', 'Full course exam', '25 questions from all ' + ORDER.length + ' classes', '') + '</div>';
    html += '<h2 class="section-gap">Module tests</h2><div class="grid g3" style="margin-top:14px">' + C.modules.map(function (m) { var n = 0; m.lessons.forEach(function (id) { n += byId(id).quiz.length; }); return '<a class="card mod" href="#/practice/module-' + m.id + '" style="--mc:' + m.color + '"><span class="stripe"></span><span class="num">Module ' + m.index + '</span><h3>' + esc(m.title) + '</h3><p>' + Math.min(15, n) + ' questions from ' + m.lessons.length + ' lessons</p></a>'; }).join('') + '</div>';
    return html;
  }

  /* ---------- flashcards with spaced repetition ---------- */
  var INTERVALS = [0, 1, 2, 4, 8, 16, 32];
  function rateCard(c, r) {
    var s = st.cards[c.id] || { box: 0, due: today() };
    if (r === 0) s.box = 1; else s.box = Math.min(6, s.box + r);
    s.due = addDays(today(), r === 0 ? 0 : INTERVALS[s.box]);
    st.cards[c.id] = s; st.reviews++; save();
  }
  function viewDeck(cards, opts) {
    var deck = cards.slice(), i = 0, flipped = false, again = [];
    var l = opts.lesson;
    function head() { return l ? lessonHead(l, true) + lessonTabs(l, 'cards') : '<div style="margin-top:12px"><div class="eyebrow">Review</div><h1 style="margin-top:4px">' + esc(opts.title) + '</h1></div>'; }
    function render() {
      if (i >= deck.length) {
        if (again.length) { deck = again; again = []; i = 0; }
        else {
          main.innerHTML = head() + '<div class="deck"><div class="card result"><div class="medal" style="color:var(--accent)">' + ic('cards', ' style="width:96px;height:96px"') + '</div><h2>Deck complete</h2><p class="muted">These cards will come back in your review queue when they are due.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="btn ghost" id="again">' + ic('redo') + 'Go again</button>' + (l ? '<a class="btn" href="#/lesson/' + l.id + '/quiz">' + ic('quiz') + 'Take the quiz</a>' : '<a class="btn" href="#/">Done</a>') + '</div></div></div>';
          document.getElementById('again').onclick = function () { deck = cards.slice(); i = 0; render(); };
          checkBadges(); return;
        }
      }
      var c = deck[i]; flipped = false;
      var html = head() + '<div class="deck"><div class="step-top"><div class="bar"><i style="width:' + (i / deck.length * 100) + '%"></i></div><span class="muted" style="font-weight:700;font-size:14px">' + (i + 1) + '/' + deck.length + '</span></div>';
      if (!l) html += '<div class="eyebrow" style="color:' + modOf(c.lesson).color + '">Class ' + byId(c.lesson).num + ' · ' + esc(byId(c.lesson).title) + '</div>';
      html += '<div class="flash" id="flash" tabindex="0" role="button" aria-label="Flashcard. Press space to flip."><div class="inner"><div class="face front">' + esc(c.f) + '<span class="hint">Tap or press space to flip</span></div><div class="face back">' + esc(c.b) + '<span class="hint">How well did you know it?</span></div></div></div>' +
        '<div class="rate" id="rate" style="visibility:hidden"><button class="btn bad" data-r="0">Again</button><button class="btn" data-r="1">Good</button><button class="btn good" data-r="2">Easy</button></div><p class="muted" style="text-align:center;font-size:13px;margin-top:12px">Keys: space to flip, 1 again, 2 good, 3 easy</p></div>';
      main.innerHTML = html;
      var f = document.getElementById('flash');
      f.onclick = flip; f.focus();
      document.getElementById('rate').onclick = function (e) { var b = e.target.closest('button'); if (b) rate(+b.dataset.r, e); };
    }
    function flip() { flipped = !flipped; document.getElementById('flash').classList.toggle('flip', flipped); if (flipped) document.getElementById('rate').style.visibility = 'visible'; }
    function rate(r, ev) { var c = deck[i]; rateCard(c, r); if (r === 0) again.push(c); award(2, null, ev && ev.clientX ? ev : null); i++; render(); }
    var key = function (e) {
      if (!document.getElementById('flash')) return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      else if (flipped && /^[123]$/.test(e.key)) rate(+e.key - 1);
    };
    document.addEventListener('keydown', key); cleanup = function () { document.removeEventListener('keydown', key); };
    setTimeout(render);
    return head();
  }
  function viewReview() {
    var due = dueCards().map(function (id) { var p = id.split('-'); return byId(p[0]) && byId(p[0]).cards[+p[1]]; }).filter(Boolean);
    var fresh = []; studiedLessons().forEach(function (id) { byId(id).cards.forEach(function (c) { if (!st.cards[c.id]) fresh.push(c); }); });
    var learned = Object.keys(st.cards).length, mastered = Object.keys(st.cards).filter(function (k) { return st.cards[k].box >= 4; }).length;
    if (location.hash.indexOf('go') > -1) return viewDeck(due, { title: 'Due today' });
    var html = '<div style="margin-top:12px"><div class="eyebrow">Spaced repetition</div><h1 style="margin-top:4px">Review flashcards</h1><p class="lead" style="margin:6px 0 0">Cards you know well come back less often; cards you miss come back sooner.</p></div>' +
      '<div class="grid g3 section-gap"><div class="card kpi"><b>' + due.length + '</b><span>due today</span></div><div class="card kpi"><b>' + learned + '</b><span>cards in rotation</span></div><div class="card kpi"><b>' + mastered + '</b><span>mastered</span></div></div><div class="row section-gap">' +
      (due.length ? '<button class="btn" id="goDue">' + ic('cards') + 'Review ' + due.length + ' due card' + (due.length === 1 ? '' : 's') + '</button>' : '<span class="muted">Nothing due right now. Nice work.</span>') +
      (fresh.length ? '<button class="btn ghost" id="goNew">' + ic('star') + 'Learn ' + Math.min(10, fresh.length) + ' new cards</button>' : '') + '</div>';
    html += '<h2 class="section-gap">Decks by lesson</h2><div class="grid g3" style="margin-top:14px">' + ORDER.map(function (id) { var l = byId(id), n = l.cards.filter(function (c) { return st.cards[c.id]; }).length; return '<a class="card result-item" href="#/lesson/' + id + '/cards" style="border-left:5px solid ' + modOf(id).color + '"><span class="k" style="color:' + modOf(id).color + '">Class ' + l.num + '</span><h3 style="margin-top:2px">' + esc(l.title) + '</h3><p>' + n + ' of ' + l.cards.length + ' cards studied</p></a>'; }).join('') + '</div>';
    setTimeout(function () {
      var a = document.getElementById('goDue'); if (a) a.onclick = function () { main.innerHTML = viewDeck(shuffle(due), { title: 'Due today' }); };
      var b = document.getElementById('goNew'); if (b) b.onclick = function () { main.innerHTML = viewDeck(fresh.slice(0, 10), { title: 'New cards' }); };
    });
    return html;
  }

  /* ---------- search ---------- */
  var INDEX = null;
  function buildIndex() {
    INDEX = [];
    C.lessons.forEach(function (l) {
      INDEX.push({ kind: 'Lesson', l: l, title: 'Class ' + l.num + ': ' + l.title, text: l.subtitle + '. ' + l.hook, href: '#/lesson/' + l.id });
      l.sections.forEach(function (s, i) { INDEX.push({ kind: 'Step', l: l, title: s.h, text: s.blocks.map(function (b) { return b.p ? plain(b.p) : (b.title || ''); }).join(' '), href: '#/lesson/' + l.id + '/learn/' + i }); });
      l.takeaways.forEach(function (t) { INDEX.push({ kind: 'Takeaway', l: l, title: t, text: '', href: '#/lesson/' + l.id + '/takeaways' }); });
      l.cards.forEach(function (c) { INDEX.push({ kind: 'Flashcard', l: l, title: c.f, text: c.b, href: '#/lesson/' + l.id + '/cards' }); });
    });
    INDEX.forEach(function (e) { e.hay = (e.title + ' ' + e.text).toLowerCase(); });
  }
  function viewSearch(q) {
    document.getElementById('q').value = q;
    if (!INDEX) buildIndex();
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var res = INDEX.filter(function (e) { return terms.every(function (t) { return e.hay.indexOf(t) > -1; }); });
    res.sort(function (a, b) { var sa = terms.filter(function (t) { return a.title.toLowerCase().indexOf(t) > -1; }).length, sb = terms.filter(function (t) { return b.title.toLowerCase().indexOf(t) > -1; }).length; return sb - sa; });
    var re = new RegExp('(' + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    function hl(s) { return esc(s).replace(re, '<mark>$1</mark>'); }
    function snip(s) { if (!s) return ''; var lo = s.toLowerCase(), k = -1; terms.some(function (t) { k = lo.indexOf(t); return k > -1; }); var a = Math.max(0, k - 80); return (a ? '…' : '') + s.slice(a, a + 220) + (a + 220 < s.length ? '…' : ''); }
    var html = '<div style="margin-top:12px"><div class="eyebrow">Search</div><h1 style="margin-top:4px">Results for “' + esc(q) + '”</h1><p class="muted">' + res.length + ' match' + (res.length === 1 ? '' : 'es') + '</p></div>';
    if (!res.length) html += '<div class="card empty">' + ic('search') + '<h3>No matches</h3><p>Try a broader word, like “governance”, “platform” or “GDPR”.</p></div>';
    html += '<div class="list">' + res.slice(0, 60).map(function (e) { return '<a class="card result-item" href="' + e.href + '"><span class="k" style="color:' + modOf(e.l.id).color + '">' + e.kind + ' · Class ' + e.l.num + '</span><h3 style="margin-top:2px">' + hl(e.title) + '</h3>' + (e.text ? '<p>' + hl(snip(e.text)) + '</p>' : '') + '</a>'; }).join('') + '</div>';
    return html;
  }

  /* ---------- progress ---------- */
  function viewProgress() {
    var lvl = levelFor(st.xp), base = levelBase(lvl), nextB = levelBase(lvl + 1), acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    var html = '<div style="margin-top:12px"><div class="eyebrow">Your progress</div><h1 style="margin-top:4px">' + (st.name ? esc(st.name) + '\'s journey' : 'Your learning journey') + '</h1></div>';
    html += '<div class="card section-gap"><div class="row"><div class="ring" style="--p:' + pct((st.xp - base) / (nextB - base) * 100) + ';width:76px;height:76px"><span style="width:60px;height:60px;font-size:20px">' + lvl + '</span></div><div style="flex:1;min-width:200px"><h2>Level ' + lvl + '</h2><p class="muted" style="margin:2px 0 8px">' + (nextB - st.xp) + ' XP to level ' + (lvl + 1) + '</p><div class="bar"><i style="width:' + pct((st.xp - base) / (nextB - base) * 100) + '%"></i></div></div></div></div>';
    html += '<div class="grid g4 section-gap"><div class="card kpi"><b style="color:var(--accent)">' + st.xp + '</b><span>total XP</span></div><div class="card kpi"><b style="color:var(--flame)">' + streak() + '</b><span>day streak</span></div><div class="card kpi"><b>' + doneCount() + '/' + ORDER.length + '</b><span>lessons complete</span></div><div class="card kpi"><b>' + acc + '%</b><span>quiz accuracy (' + st.answered + ' answered)</span></div></div>';
    var days = [], max = 1, d = addDays(today(), -13);
    for (var i = 0; i < 14; i++) { var v = st.days[d] || 0; max = Math.max(max, v); days.push([d, v]); d = addDays(d, 1); }
    html += '<div class="card section-gap"><h3>XP in the last 14 days</h3><div class="chart" role="img" aria-label="Bar chart of XP per day">' + days.map(function (x) { return '<div class="c' + (x[0] === today() ? ' today' : '') + '" title="' + x[0] + ': ' + x[1] + ' XP">' + (x[1] ? '<em>' + x[1] + '</em>' : '') + '<i style="height:' + (x[1] / max * 100) + '%"></i><span>' + (+x[0].slice(8)) + '</span></div>'; }).join('') + '</div></div>';
    html += '<h2 class="section-gap">Badges</h2><div class="grid g4" style="margin-top:14px">' + BADGES.map(function (b) { var got = st.badges[b.id]; return '<div class="card badge' + (got ? ' got' : '') + '"><div class="b-ic">' + ic(got ? b.icon : 'lock') + '</div><b>' + b.name + '</b><span>' + (got ? 'Earned ' + got : b.desc) + '</span></div>'; }).join('') + '</div>';
    html += '<h2 class="section-gap">Module mastery</h2><div class="list" style="margin-top:14px">' + C.modules.map(function (m) { var p = modPct(m); return '<a class="card result-item" href="#/module/' + m.id + '" style="--mc:' + m.color + '"><div class="row"><span class="k" style="color:' + m.color + '">Module ' + m.index + '</span><span class="spacer"></span><b>' + p + '%</b></div><h3 style="margin:2px 0 8px">' + esc(m.title) + '</h3><div class="bar"><i style="width:' + p + '%;background:' + m.color + '"></i></div></a>'; }).join('') + '</div>';
    return html;
  }

  /* ---------- settings ---------- */
  function viewSettings() {
    var html = '<div style="margin-top:12px"><div class="eyebrow">Settings</div><h1 style="margin-top:4px">Make it yours</h1></div><div class="grid g2 section-gap"><div class="card">' +
      '<div class="field"><label for="nm">Your name (optional)</label><input id="nm" value="' + esc(st.name) + '" placeholder="Shown on your dashboard" maxlength="40"></div>' +
      '<div class="field"><label>Theme</label><span class="seg" id="th">' + ['system', 'light', 'dark'].map(function (t) { return '<button data-t="' + t + '" class="' + (st.theme === t ? 'on' : '') + '">' + t[0].toUpperCase() + t.slice(1) + '</button>'; }).join('') + '</span></div>' +
      '<div class="field"><label>Daily goal</label><span class="seg" id="gl">' + [20, 50, 100, 150].map(function (g) { return '<button data-g="' + g + '" class="' + (st.goal === g ? 'on' : '') + '">' + g + ' XP</button>'; }).join('') + '</span></div>' +
      '<div class="field"><label>Sound effects</label><span class="seg" id="snd"><button data-s="1" class="' + (st.sound ? 'on' : '') + '">On</button><button data-s="0" class="' + (!st.sound ? 'on' : '') + '">Off</button></span></div></div>' +
      '<div class="card"><h3>Your data</h3><p class="muted" style="font-size:14px">Progress is stored only in this browser. Export a backup to move it to another device.</p><div class="row"><button class="btn ghost sm" id="exp">' + ic('download') + 'Export progress</button><label class="btn ghost sm" style="cursor:pointer">' + ic('redo') + 'Import<input type="file" id="imp" accept="application/json" class="sr-only"></label><button class="btn bad sm" id="rst">Reset progress</button></div><p id="dataMsg" class="muted" style="font-size:13px"></p>' +
      '<h3 class="section-gap">About</h3><p class="muted" style="font-size:14px">LeadAI Academy turns the class summaries of the ' + esc(C.programme) + ' programme into an interactive course: ' + ORDER.length + ' lessons, ' + C.lessons.reduce(function (a, l) { return a + l.quiz.length; }, 0) + ' quiz questions and ' + C.lessons.reduce(function (a, l) { return a + l.cards.length; }, 0) + ' flashcards. It runs entirely in your browser with no accounts, no tracking and no AI calls, so it costs nothing to use and works offline once loaded.</p>' +
      '<p class="muted" style="font-size:14px">Keyboard: 1-4 to answer, Enter to continue, Space to flip a card, arrow keys to move through lesson steps.</p></div></div>';
    setTimeout(function () {
      document.getElementById('nm').oninput = function (e) { st.name = e.target.value.trim(); save(); };
      document.getElementById('th').onclick = function (e) { var b = e.target.closest('button'); if (b) setTheme(b.dataset.t); };
      document.getElementById('gl').onclick = function (e) { var b = e.target.closest('button'); if (b) { st.goal = +b.dataset.g; save(); route(); } };
      document.getElementById('snd').onclick = function (e) { var b = e.target.closest('button'); if (b) { st.sound = b.dataset.s === '1'; save(); route(); } };
      document.getElementById('exp').onclick = function () { var blob = new Blob([JSON.stringify(st, null, 1)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leadai-progress-' + today() + '.json'; a.click(); };
      document.getElementById('imp').onchange = function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { try { var o = JSON.parse(r.result); for (var k in defaults) if (k in o) st[k] = o[k]; save(); setTheme(st.theme); document.getElementById('dataMsg').textContent = 'Progress imported.'; } catch (err) { document.getElementById('dataMsg').textContent = 'That file could not be read.'; } }; r.readAsText(f); };
      var rb = document.getElementById('rst'), armed = false;
      rb.onclick = function () { if (!armed) { armed = true; rb.textContent = 'Tap again to erase everything'; setTimeout(function () { armed = false; if (rb.isConnected) rb.textContent = 'Reset progress'; }, 4000); return; } st = JSON.parse(JSON.stringify(defaults)); save(); setTheme('system'); location.hash = '#/'; };
    });
    return html;
  }

  /* ---------- boot ---------- */
  route();
  checkBadges();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (st.theme === 'system') renderStats(); });
})();
