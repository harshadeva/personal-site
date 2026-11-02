/* Progressive enhancement only: every word on the page is in the HTML without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- theme: Paper / Blueprint ---------- */
  var themeBtn = $('[data-theme-toggle]');
  var themeLabel = $('[data-theme-label]');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  }
  function syncThemeLabel() {
    var dark = currentTheme() === 'dark';
    themeLabel.textContent = dark ? 'Blueprint' : 'Paper';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to paper (light) theme' : 'Switch to blueprint (dark) theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeLabel();
  });
  systemDark.addEventListener && systemDark.addEventListener('change', syncThemeLabel);
  syncThemeLabel();

  /* ---------- mobile menu ---------- */
  var menuBtn = $('[data-menu]');
  var nav = $('#site-nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- scroll ruler ---------- */
  var progress = $('[data-progress]');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal, sheet indicator, counters ---------- */
  var revealTargets = $$('[data-reveal], .sheet-head');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealer.observe(el); });

    var sheetNo = $('[data-sheet-no]');
    var sheetTitle = $('[data-sheet-title]');
    var navLinks = $$('a', nav);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var s = entry.target;
        sheetNo.textContent = s.getAttribute('data-sheet');
        sheetTitle.textContent = s.getAttribute('data-title');
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + s.id));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-sheet]').forEach(function (s) { spy.observe(s); });

    var counted = false;
    var proof = $('.proof');
    var counterObs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      counterObs.disconnect();
      if (reduceMotion) return;
      $$('[data-count]', proof).forEach(function (el) {
        var target = +el.getAttribute('data-count');
        var comma = el.getAttribute('data-format') === 'comma';
        var start = performance.now();
        (function step(now) {
          var t = Math.min(1, (now - start) / 1400);
          var v = Math.round(target * (1 - Math.pow(1 - t, 3)));
          el.textContent = comma ? v.toLocaleString('en-US') : v;
          if (t < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.4 });
    counterObs.observe(proof);
  }

  /* ---------- hero crosshair (fine pointers only) ---------- */
  var hero = $('.hero');
  var cross = $('.crosshair');
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    var readout = $('.crosshair-readout');
    var pad = function (n) { return ('0000' + Math.max(0, Math.round(n))).slice(-4); };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      cross.style.setProperty('--cx', x + 'px');
      cross.style.setProperty('--cy', y + 'px');
      readout.textContent = 'X ' + pad(x) + ' · Y ' + pad(y);
      cross.classList.add('on');
    });
    hero.addEventListener('pointerleave', function () { cross.classList.remove('on'); });
  }

  /* ---------- portrait pins <-> legend ---------- */
  $$('[data-legend]').forEach(function (li) {
    var pin = $('[data-pin="' + li.getAttribute('data-legend') + '"]');
    var on = function () { li.classList.add('is-hot'); pin.classList.add('is-hot'); };
    var off = function () { li.classList.remove('is-hot'); pin.classList.remove('is-hot'); };
    li.addEventListener('mouseenter', on);
    li.addEventListener('mouseleave', off);
    pin.addEventListener('mouseenter', on);
    pin.addEventListener('mouseleave', off);
  });

  /* ---------- process stepper (tabs) ---------- */
  var processEl = $('[data-process]');
  if (processEl) {
    var tabs = $$('.process-tab', processEl);
    var panels = $$('.process-panel', processEl);
    var tabList = $('.process-steps', processEl);
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'My process, step by step');
    $$('li', tabList).forEach(function (li) { li.setAttribute('role', 'presentation'); });
    panels.forEach(function (p) { p.setAttribute('role', 'tabpanel'); p.setAttribute('tabindex', '0'); });
    function selectStep(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('role', 'tab');
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('aria-controls', panels[j].id);
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectStep(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); selectStep((i + 1) % n, true); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); selectStep((i - 1 + n) % n, true); }
        if (k === 'Home') { e.preventDefault(); selectStep(0, true); }
        if (k === 'End') { e.preventDefault(); selectStep(n - 1, true); }
      });
    });
    selectStep(0);
  }

  /* ---------- the 2 AM rule ---------- */
  var debt = $('[data-debt]');
  if (debt) {
    var range = $('#debt-weeks');
    // One night-time alert per week of shortcuts.
    var alerts = [
      ['02:04 AM', 'Checkout timing out for some customers'],
      ['02:17 AM', 'Duplicate invoices reported'],
      ['01:52 AM', 'Nightly report job stuck'],
      ['02:41 AM', 'Queue workers out of memory'],
      ['02:09 AM', 'Webhooks failing silently'],
      ['03:02 AM', 'Last hotfix broke login'],
      ['02:26 AM', 'Balances don’t add up'],
      ['02:55 AM', 'Nobody knows how this module works']
    ];
    var pager = $('[data-pager]', debt);
    var pagerList = $('[data-pager-list]', debt);
    var verdicts = [
      [0, 'No shortcuts. You sleep through the night.'],
      [1, 'Looks cheap now. It won’t be.'],
      [3, 'Your roadmap is now mostly bug fixes.'],
      [6, 'Welcome to the 2 AM incident call.']
    ];
    var updateDebt = function () {
      var w = +range.value;
      var cost = w * 4;
      $('[data-debt-weeks]', debt).textContent = w;
      $('[data-debt-saved]', debt).style.setProperty('--w', Math.max(0.02, w / 32));
      $('[data-debt-cost]', debt).style.setProperty('--w', Math.max(0.02, cost / 32));
      $('[data-debt-saved-label]', debt).textContent = w + (w === 1 ? ' wk' : ' wks');
      $('[data-debt-cost-label]', debt).textContent = cost + (cost === 1 ? ' wk' : ' wks');
      var verdict = verdicts[0][1];
      verdicts.forEach(function (v) { if (w >= v[0]) verdict = v[1]; });
      $('[data-debt-verdict]', debt).textContent = verdict;
      // Add or remove only the difference, so new alerts animate in and old ones stay put.
      while (pagerList.children.length > w) pagerList.removeChild(pagerList.lastElementChild);
      while (pagerList.children.length < w) {
        var a = alerts[pagerList.children.length];
        var li = document.createElement('li');
        var time = document.createElement('span');
        time.className = 'mono';
        time.textContent = a[0];
        li.appendChild(time);
        li.appendChild(document.createTextNode(a[1]));
        pagerList.appendChild(li);
      }
      $('[data-pager-count]', debt).textContent = w;
      pager.classList.toggle('has-alerts', w > 0);
      debt.classList.toggle('is-late', w >= 6);
    };
    range.addEventListener('input', updateDebt);
    updateDebt();
  }

  /* ---------- idempotency demo ---------- */
  var idem = $('[data-idem]');
  if (idem) {
    var log = $('[data-idem-log]', idem);
    var toggle = $('[data-idem-toggle]', idem);
    var st;
    var resetIdem = function (note) {
      st = { intended: 0, charged: 0, lastKey: null, nextCharge: 1041, seen: {} };
      log.innerHTML = '';
      addLine(note || 'Press a button to send a request.', 'dim');
      score();
    };
    var newKey = function () { return 'k_' + Math.random().toString(16).slice(2, 6); };
    var addLine = function (text, cls) {
      var li = document.createElement('li');
      li.textContent = text;
      if (cls) li.className = cls;
      if (log.firstElementChild && log.firstElementChild.classList.contains('dim') && cls !== 'dim') log.innerHTML = '';
      log.appendChild(li);
      while (log.children.length > 8) log.removeChild(log.firstElementChild);
    };
    var score = function () {
      $('[data-idem-intended]', idem).textContent = st.intended;
      var c = $('[data-idem-charged]', idem);
      c.textContent = st.charged;
      c.classList.toggle('is-bad', st.charged > st.intended);
    };
    var send = function (key) {
      var safe = toggle.checked;
      addLine('→ POST /payments ' + (safe ? 'Idempotency-Key: ' + key : '(no key)') + ' · $49.00');
      if (safe && st.seen[key]) {
        addLine('← 200 OK · replayed charge #' + st.seen[key] + ' · no new charge', 'ok');
      } else {
        var id = st.nextCharge++;
        var dup = !!st.seen[key];
        st.seen[key] = st.seen[key] || id;
        st.charged++;
        addLine('← 201 Created · charge #' + id + (dup ? ' · DUPLICATE CHARGE' : ''), dup ? 'warn' : 'ok');
      }
      score();
    };
    $$('[data-idem-act]', idem).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-idem-act');
        if (act === 'reset') return resetIdem();
        if (act === 'retry') {
          if (!st.lastKey) return addLine('Nothing to retry yet. Press “Pay $49” first.', 'dim');
          addLine('… response lost (timeout). Client retries the same payment.', 'dim');
          return send(st.lastKey);
        }
        st.lastKey = newKey();
        st.intended++;
        send(st.lastKey);
        if (act === 'double') {
          var k = st.lastKey;
          setTimeout(function () { send(k); }, 220);
        }
      });
    });
    toggle.addEventListener('change', function () {
      resetIdem(toggle.checked
        ? 'Idempotency keys ON. Retries and double-clicks are safe.'
        : 'Idempotency keys OFF. Try a retry or a double-click.');
    });
    resetIdem();
  }

  /* ---------- multi-tenant routing demo ---------- */
  var tenant = $('[data-tenant]');
  if (tenant) {
    var routes = {
      acme: { req: 'GET acme.app.com/invoices', conn: 'tenant_acme', mod: 'billing' },
      north: { req: 'GET northwind.app.com/reports/monthly', conn: 'tenant_northwind', mod: 'reports' },
      harbor: { req: 'GET blueharbor.app.com/stock', conn: 'tenant_blueharbor', mod: 'inventory' }
    };
    var pick = function (key) {
      var r = routes[key];
      $('[data-tenant-req]', tenant).textContent = r.req;
      var conn = $('[data-tenant-conn]', tenant);
      conn.textContent = 'Tenant resolver → connection ';
      var b = document.createElement('b'); b.textContent = r.conn; conn.appendChild(b);
      $$('[data-mod]', tenant).forEach(function (m) { m.classList.toggle('is-hot', m.getAttribute('data-mod') === r.mod); });
      $$('[data-db]', tenant).forEach(function (d) { d.classList.toggle('is-hot', d.getAttribute('data-db') === key); });
      $$('[data-tenant-pick]', tenant).forEach(function (c) {
        var on = c.getAttribute('data-tenant-pick') === key;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      });
    };
    $$('[data-tenant-pick]', tenant).forEach(function (c) {
      c.addEventListener('click', function () { pick(c.getAttribute('data-tenant-pick')); });
    });
    pick('acme');
  }

  /* ---------- performance race ---------- */
  var race = $('[data-race]');
  if (race) {
    var runBtn = $('[data-race-run]', race);
    var bFill = $('[data-race-before]', race), aFill = $('[data-race-after]', race);
    var bT = $('[data-race-before-t]', race), aT = $('[data-race-after-t]', race);
    var fmt = function (s) { return s >= 60 ? Math.floor(s / 60) + ' min ' + (s % 60 ? (s % 60) + ' s' : '') : s + ' s'; };
    var animate = function (fill, label, seconds, ms, done) {
      var start = performance.now();
      (function step(now) {
        var t = reduceMotion ? 1 : Math.min(1, (now - start) / ms);
        fill.style.transform = 'scaleX(' + t + ')';
        label.textContent = fmt(Math.round(seconds * t));
        if (t < 1) requestAnimationFrame(step); else if (done) done();
      })(start);
    };
    runBtn.addEventListener('click', function () {
      runBtn.disabled = true;
      runBtn.textContent = 'Running…';
      animate(aFill, aT, 2, 100);
      animate(bFill, bT, 120, 6000, function () {
        runBtn.disabled = false;
        runBtn.textContent = 'Run it again';
      });
    });
  }

  /* ---------- align-the-scope Venn ---------- */
  var venn = $('[data-venn]');
  if (venn) {
    var vBtn = $('[data-venn-btn]', venn), vCap = $('[data-venn-cap]', venn);
    vBtn.addEventListener('click', function () {
      var on = !venn.classList.contains('is-aligned');
      venn.classList.toggle('is-aligned', on);
      vBtn.setAttribute('aria-pressed', String(on));
      vBtn.textContent = on ? 'Reset' : 'Clarify the scope';
      vCap.textContent = on
        ? 'After: same facts, mostly the same project. What’s left is a real trade-off.'
        : 'Before: two people, two different projects in their heads.';
    });
  }

  /* ---------- copy email with a rubber stamp ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var stamp = btn.parentNode.querySelector('.stamp');
      var done = function () {
        btn.textContent = 'Copied to clipboard';
        stamp.classList.remove('is-on'); void stamp.offsetWidth; stamp.classList.add('is-on');
        setTimeout(function () { btn.textContent = 'Copy address'; }, 1800);
      };
      var legacyCopy = function () {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        if (ok) done(); else btn.textContent = text;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, legacyCopy);
      } else {
        legacyCopy();
      }
    });
  });

  /* ---------- time zones ---------- */
  var colomboEl = $('[data-clock-colombo]');
  if (colomboEl) {
    var localEl = $('[data-clock-local]'), diffEl = $('[data-clock-diff]');
    var COLOMBO_OFFSET = 330; // UTC+5:30, no daylight saving
    var fmtTime = function (d, tz) {
      var o = { hour: 'numeric', minute: '2-digit' };
      if (tz) o.timeZone = tz;
      return d.toLocaleTimeString('en-US', o);
    };
    var fmtMins = function (mins) {
      mins = ((mins % 1440) + 1440) % 1440;
      var h = Math.floor(mins / 60), m = mins % 60;
      return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h >= 12 ? ' PM' : ' AM');
    };
    var fmtSpan = function (mins) {
      var h = Math.floor(Math.abs(mins) / 60), m = Math.abs(mins) % 60;
      return h + 'h' + (m ? ' ' + m + 'm' : '');
    };
    var fmtOffset = function (mins) {
      var a = Math.abs(mins), h = Math.floor(a / 60), m = a % 60;
      return 'UTC' + (mins < 0 ? '−' : '+') + h + (m ? ':' + (m < 10 ? '0' : '') + m : '');
    };
    var zoneName = '';
    try { zoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var city = zoneName ? zoneName.split('/').pop().replace(/_/g, ' ') : '';
    $('[data-clock-city]').textContent = city ? 'You · ' + city : 'You';
    var zoneAbbr = function (now) {
      try {
        var part = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(now)
          .filter(function (p) { return p.type === 'timeZoneName'; })[0];
        return part && !/^(GMT|UTC)/.test(part.value) ? part.value : '';
      } catch (e) { return ''; }
    };
    // What the gap means for working together, from "same hours" to "follow the sun".
    // diff > 0 means Colombo is ahead of the visitor.
    var pitchFor = function (diff) {
      var hrs = Math.abs(diff) / 60;
      if (diff === 0) return ['Same hours', 'We share the whole working day, so you can reach me whenever you’re at your desk.'];
      if (hrs < 3) return ['Shared day', 'Our working days almost line up. Calls are easy to fit in, any day of the week.'];
      if (hrs < 6) return ['Long overlap', 'We share a good part of every working day: plenty of time for calls, and progress keeps going after you log off.'];
      if (hrs < 9) {
        return ['Overlap + handoff', diff > 0
          ? 'Your morning overlaps my afternoon, which is our window for calls. Work keeps moving for the rest of your day.'
          : 'Your afternoon overlaps my morning, which is our window for calls. Work keeps moving for the rest of your day.'];
      }
      return ['Follow the sun', 'While you sleep, I build. Send feedback at the end of your day and wake up to progress.'];
    };
    var pitchLabel = $('[data-clock-pitch-label]'), pitchText = $('[data-clock-pitch-text]');
    var tick = function () {
      var now = new Date();
      colomboEl.textContent = fmtTime(now, 'Asia/Colombo');
      localEl.textContent = fmtTime(now);
      var localOffset = -now.getTimezoneOffset();
      var abbr = zoneAbbr(now);
      $('[data-clock-zone]').textContent = (zoneName ? zoneName + ' · ' : '') + (abbr ? abbr + ' (' + fmtOffset(localOffset) + ')' : fmtOffset(localOffset));
      var diff = COLOMBO_OFFSET - localOffset;
      $('[data-clock-gap]').textContent = diff === 0 ? 'same time' : fmtSpan(diff) + ' apart';
      var pitch = pitchFor(diff);
      pitchLabel.textContent = pitch[0];
      pitchText.textContent = pitch[1];
      if (diff === 0) diffEl.textContent = 'We’re in the same time zone.';
      else diffEl.textContent = 'Colombo is ' + fmtSpan(diff) + (diff > 0 ? ' ahead of' : ' behind') + ' you. Your 9:00 AM is ' + fmtMins(9 * 60 + diff) + ' in Colombo.';
    };
    tick();
    setInterval(tick, 30000);
  }

  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
