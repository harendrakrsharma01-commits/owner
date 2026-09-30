/*!
 * EasyCalculatorSmart — Anganwadi salary calculator UI.
 * All maths lives in assets/js/lib/anganwadi.js (window.Anganwadi).
 * Nothing is sent over the network. All output is written with textContent / createElement.
 */
(function () {
  'use strict';
  var A = window.Anganwadi;
  var root = document.querySelector('.awc');
  var cfgEl = document.getElementById('awc-config');
  if (!A || !root || !cfgEl) return;

  var C = JSON.parse(cfgEl.textContent);
  var L = C.labels;
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var R = function (name) { return $('[data-r="' + name + '"]'); };

  var els = {
    state: $('[data-awc-state]'), post: $('[data-awc-post]'), monthly: $('[data-awc-monthly]'),
    rateNote: $('[data-awc-rate-note]'), seniorWrap: $('[data-awc-senior-wrap]'), senior: $('[data-awc-senior]'),
    seniorLabel: $('[data-awc-senior-label]'), sharingWrap: $('[data-awc-sharing-wrap]'), sharing: $('[data-awc-sharing]'),
    pli: $('[data-awc-pli]'), arrearWrap: $('[data-awc-arrear-wrap]'), old: $('[data-awc-old]'),
    from: $('[data-awc-from]'), to: $('[data-awc-to]'),
    results: $('[data-awc-results]'), error: $('[data-awc-error]'), announce: $('[data-awc-announce]'),
    wa: $('[data-awc-wa]')
  };

  /* ---------- helpers ---------- */

  function rs(n) { return '₹' + A.formatINR(n); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
  function state() { return C.states[els.state.value] || null; }
  function post() { return els.post.value; }
  function thisMonth() { var n = new Date(); return n.getFullYear() + '-' + (n.getMonth() < 9 ? '0' : '') + (n.getMonth() + 1); }
  function amountText(n) { return n == null ? '' : String(n); }
  function sourceLinks(keys) {
    return (keys || []).map(function (k) { return C.sourceList[k]; }).filter(Boolean);
  }

  /* ---------- month pickers ---------- */

  (function fillMonths() {
    var first = A.monthIndex(C.firstMonth), last = A.monthIndex(thisMonth()) + 12;
    [els.from, els.to].forEach(function (sel) {
      for (var i = last; i >= first; i--) {
        var ym = A.monthFromIndex(i);
        var o = el('option', null, A.hindiMonth(ym));
        o.value = ym;
        sel.appendChild(o);
      }
    });
  })();

  function setMonth(sel, ym) {
    if (ym && A.monthIndex(ym) !== null && sel.querySelector('option[value="' + ym + '"]')) sel.value = ym;
  }

  /* ---------- filling the form from the state data ---------- */

  function applyState() {
    var s = state(), p = post();
    var hasSenior = !!(s && s.rates && s.rates.workerSenior != null && p === 'worker');
    els.seniorWrap.hidden = !hasSenior;
    if (hasSenior && s.seniorLabel) els.seniorLabel.textContent = s.seniorLabel;
    if (!hasSenior) els.senior.checked = false;
    els.sharingWrap.hidden = !!s;

    var rate = A.resolveRate(s, p, els.senior.checked);
    els.monthly.value = amountText(rate.amount);
    els.old.value = amountText(rate.previous);
    var eff = s && s.effective ? s.effective : thisMonth();
    setMonth(els.from, eff);
    setMonth(els.to, eff);

    if (!s) els.rateNote.textContent = 'अपने आदेश या पासबुक से मासिक मानदेय डालें।';
    else if (rate.amount == null) els.rateNote.textContent = L.needAmount;
    else els.rateNote.textContent = s.name + ' सरकार की दर' + (s.effective ? ' (' + A.hindiMonth(s.effective) + ' से)' : '') + ' — बदलनी हो तो अपनी राशि डालें।';
    run();
  }

  /* ---------- calculation & rendering ---------- */

  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = !msg;
  }

  function card(label, value, note) {
    var c = el('div', 'awc-card');
    c.appendChild(el('span', 'awc-card-l', label));
    c.appendChild(el('span', 'awc-card-n', value));
    if (note) c.appendChild(el('small', null, note));
    return c;
  }

  var last = null;

  function run() {
    var s = state(), p = post();
    var raw = els.monthly.value.trim();
    var monthly = A.parseAmount(raw);
    els.monthly.setAttribute('aria-invalid', raw && (monthly === null || monthly <= 0 || monthly > A.MAX_MONTHLY) ? 'true' : 'false');

    if (!raw) {
      els.results.hidden = true; last = null;
      showError(s && A.resolveRate(s, p, els.senior.checked).amount == null ? L.needAmount : '');
      els.error.classList.add('is-info');
      return;
    }
    els.error.classList.remove('is-info');
    var sharing = s ? s.sharing : +els.sharing.value;
    var r = A.calculateSalary({ monthly: monthly, post: p, incentive: els.pli.checked, centre: C.centre, sharing: sharing });
    if (!r.ok) { els.results.hidden = true; last = null; showError(L.errAmount); return; }
    showError('');

    var rate = A.resolveRate(s, p, els.senior.checked);
    var isOfficial = rate.amount != null && Math.abs(rate.amount - monthly) < 0.005;
    var who = C.posts[p] + (s ? ', ' + s.name : '');

    R('heading').textContent = 'मासिक मानदेय — ' + who;
    R('monthly').textContent = rs(r.monthly);
    R('sub').textContent = 'सालाना ' + rs(r.yearly) + ' · रोज़ाना लगभग ' + rs(Math.round(r.daily)) +
      (r.incentive ? ' · इसमें ' + rs(r.incentive) + ' प्रोत्साहन राशि शामिल' : '');

    var cards = clear(R('cards'));
    cards.appendChild(card('सालाना कमाई', rs(r.yearly), '12 महीने × ' + rs(r.monthly)));
    cards.appendChild(card('केंद्र का हिस्सा (अनुमान)', rs(r.centreShare), 'नॉर्म ' + rs(r.norm) + ' का ' + r.sharing + '%'));
    cards.appendChild(card('राज्य का हिस्सा (अनुमान)', rs(r.stateShare), r.topUp ? 'नॉर्म से ऊपर ' + rs(r.topUp) + ' राज्य देता है' : null));

    // Hike vs previous official rate (only when the amount shown is the state's own figure).
    var hike = isOfficial && rate.previous != null ? A.calculateHike(rate.previous, rate.amount) : null;
    R('hikeBox').hidden = !hike;
    if (hike) {
      R('hike').textContent = 'पिछली दर ' + rs(rate.previous) + ' → अब ' + rs(rate.amount) + ': हर महीने +' + rs(hike.perMonth) +
        ' (+' + hike.percent + '%), यानी साल में +' + rs(hike.perYear) + '।';
    }

    // Arrear, only while its panel is open.
    var arrear = null;
    if (els.arrearWrap.open) {
      var oldAmt = A.parseAmount(els.old.value.trim());
      if (els.old.value.trim() && oldAmt === null) showError(L.errOld);
      else if (oldAmt !== null) {
        arrear = A.calculateArrear(oldAmt, monthly, els.from.value, els.to.value);
        if (!arrear.ok) { showError(arrear.error === 'lower' ? L.errLower : L.errOld); arrear = null; }
      }
    }
    R('arrearBox').hidden = !arrear;
    if (arrear) {
      R('arrearTotal').textContent = rs(arrear.total);
      R('arrear').textContent = arrear.months === 0
        ? 'चुना गया "पुरानी दर तक" महीना, नई दर लागू होने से पहले का है — कोई एरियर नहीं बनता।'
        : '(' + rs(monthly) + ' − ' + rs(A.parseAmount(els.old.value.trim())) + ') × ' + arrear.months + ' महीने (' +
          A.hindiMonth(els.from.value) + ' से ' + A.hindiMonth(els.to.value) + ') = ' + rs(arrear.total);
    }

    // Note + sources for the figure shown.
    R('note').textContent = s ? (isOfficial ? s.note : L.custom + ' से हिसाब। ' + s.note) : 'आपकी डाली हुई राशि से हिसाब।';
    var src = clear(R('source'));
    var links = isOfficial ? sourceLinks(s.sources) : [];
    if (links.length) {
      src.appendChild(document.createTextNode('स्रोत: '));
      links.forEach(function (l, i) {
        if (i) src.appendChild(document.createTextNode(' · '));
        var a = el('a', null, l.label); a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
        src.appendChild(a);
      });
    }

    var work = clear(R('work'));
    [
      'मासिक मानदेय: ' + rs(r.base) + (isOfficial ? ' (' + s.name + ' की दर)' : ' (आपकी राशि)'),
      r.incentive ? 'प्रोत्साहन राशि जोड़ी: + ' + rs(r.incentive) + ' = ' + rs(r.monthly) : null,
      'सालाना: ' + rs(r.monthly) + ' × 12 = ' + rs(r.yearly),
      'केंद्र का हिस्सा: केंद्र का नॉर्म ' + rs(r.norm) + (r.incentive ? ' + प्रोत्साहन ' + rs(r.incentive) : '') + ' का ' + r.sharing + '% = ' + rs(r.centreShare),
      'राज्य का हिस्सा: ' + rs(r.monthly) + ' − ' + rs(r.centreShare) + ' = ' + rs(r.stateShare),
      'रोज़ाना (सिर्फ अंदाज़े के लिए): ' + rs(r.monthly) + ' ÷ 30 ≈ ' + rs(Math.round(r.daily))
    ].forEach(function (t) { if (t) work.appendChild(el('li', null, t)); });

    els.results.hidden = false;
    last = { r: r, who: who, arrear: arrear };
    els.wa.href = 'https://wa.me/?text=' + encodeURIComponent(summary());
    els.announce.textContent = 'मासिक मानदेय ' + rs(r.monthly) + ', सालाना ' + rs(r.yearly);
  }

  function summary() {
    if (!last) return '';
    var lines = [
      'आंगनवाड़ी मानदेय — ' + last.who,
      'मासिक: ' + rs(last.r.monthly),
      'सालाना: ' + rs(last.r.yearly)
    ];
    if (last.arrear && last.arrear.months) lines.push('एरियर: ' + rs(last.arrear.total) + ' (' + last.arrear.months + ' महीने)');
    lines.push(location.href.split('#')[0].split('?')[0]);
    return lines.join('\n');
  }

  /* ---------- events ---------- */

  els.state.addEventListener('change', applyState);
  els.post.addEventListener('change', applyState);
  els.senior.addEventListener('change', applyState);
  [els.monthly, els.old].forEach(function (i) { i.addEventListener('input', run); });
  [els.pli, els.sharing, els.from, els.to].forEach(function (i) { i.addEventListener('change', run); });
  els.arrearWrap.addEventListener('toggle', run);

  $('[data-awc-reset]').addEventListener('click', function () {
    els.state.value = C.defaultState; els.post.value = C.defaultPost;
    els.pli.checked = false; els.senior.checked = false; els.sharing.selectedIndex = 0;
    els.arrearWrap.open = false;
    applyState();
  });

  $('[data-awc-copy]').addEventListener('click', function () {
    var text = summary();
    var done = function () { els.announce.textContent = L.copied; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  });
  $('[data-awc-print]').addEventListener('click', function () { window.print(); });

  var themeBtn = document.querySelector('[data-awc-theme]');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var d = document.documentElement;
    var cur = d.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    d.setAttribute('data-theme', next);
    try { localStorage.setItem('ecs-theme', next); } catch (e) { /* storage blocked */ }
  });

  applyState();
})();
