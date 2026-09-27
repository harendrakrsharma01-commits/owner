/*!
 * EasyCalculatorSmart — D9 / Navamsa chart UI controller.
 * All positions come from D9Navamsa.calculateChart(); this file only validates input,
 * resolves the birthplace/time zone and renders. Nothing is sent over the network.
 */
(function () {
  'use strict';
  var N = window.D9Navamsa;
  var cfgEl = document.getElementById('d9-config');
  if (!N || !cfgEl) return;
  var C = JSON.parse(cfgEl.textContent);
  var L = C.labels, SIGNS = N.SIGNS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var form = $('[data-d9-form]'), errBox = $('[data-d9-error]'), results = $('[data-d9-results]'), partial = $('[data-d9-partial]');
  var R = function (k) { return $('[data-r="' + k + '"]'); };

  var state = { chart: null, input: null, style: C.defaultChartStyle, which: 'd9', filter: 'all', ambiguityChoice: 0, isExample: false };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; });
  }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function label(key) { return C.planets[key] ? C.planets[key].label : key; }
  function placeLabel(p) { return p.name + ', ' + p.region + ', ' + p.country; }
  function showError(msg) { errBox.textContent = msg; errBox.hidden = !msg; }
  function announce(msg) { $('[data-d9-announce]').textContent = msg; }

  /* ---------- theme (shared site preference) ---------- */
  $('[data-d9-theme]').addEventListener('click', function () {
    var root = document.documentElement;
    var dark = root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ecs-theme', next); } catch (e) { /* storage blocked */ }
  });

  /* ---------- places & time zones ---------- */
  var list = $('[data-d9-placelist]');
  C.places.forEach(function (p) { list.appendChild(el('option', { value: placeLabel(p) })); });
  var tzSel = $('[data-d9-tz]');
  var zones = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : []).slice();
  if (zones.indexOf('UTC') < 0) zones.unshift('UTC');
  C.places.forEach(function (p) { if (zones.indexOf(p.tz) < 0) zones.push(p.tz); });
  zones.sort().forEach(function (z) { tzSel.appendChild(el('option', { value: z }, z)); });
  // Fixed offsets for records kept in a local time the IANA database does not model (e.g. some pre-1955 Indian clocks).
  var fixed = el('optgroup', { label: 'Fixed UTC offset (no daylight saving)' });
  for (var q = -48; q <= 56; q++) {
    var sec = q * 900, a = Math.abs(sec), txt = 'UTC' + (sec < 0 ? '-' : '+') + pad(Math.floor(a / 3600)) + ':' + pad((a % 3600) / 60);
    if (q % 4 === 0 || [14, 18, 22, 23, 26, 35, 38, 39, 51, -14, -38].indexOf(q) >= 0) fixed.appendChild(el('option', { value: txt }, txt));
  }
  tzSel.appendChild(fixed);
  tzSel.value = 'Asia/Kolkata';

  var placeInput = $('[data-d9-place]'), placeEcho = $('[data-d9-place-echo]'), manual = $('[data-d9-manual]');

  /** Resolve the typed place: exact label, or a unique city name. Never guesses between same-named cities. */
  function resolvePlace(text) {
    var q = String(text || '').trim().toLowerCase();
    if (!q) return { error: L.errPlace };
    var exact = C.places.filter(function (p) { return placeLabel(p).toLowerCase() === q; });
    if (exact.length === 1) return { place: exact[0] };
    var byName = C.places.filter(function (p) { return p.name.toLowerCase() === q || p.name.toLowerCase().split(' (')[0] === q; });
    if (byName.length === 1) return { place: byName[0] };
    if (byName.length > 1) return { error: L.errPlaceAmbiguous + ' ' + byName.map(placeLabel).join(' · ') };
    return { error: L.errPlace };
  }
  function updatePlaceEcho() {
    if (manual.checked) { placeEcho.textContent = ''; return; }
    var r = resolvePlace(placeInput.value);
    placeEcho.classList.toggle('is-bad', !r.place && !!placeInput.value.trim());
    placeEcho.textContent = r.place
      ? r.place.lat.toFixed(2) + '°' + (r.place.lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(r.place.lon).toFixed(2) + '°' + (r.place.lon >= 0 ? 'E' : 'W') + ' · ' + r.place.tz
      : (placeInput.value.trim() && /Several/.test(r.error) ? r.error : '');
  }
  placeInput.addEventListener('input', updatePlaceEcho);
  manual.addEventListener('change', function () {
    ['[data-d9-lat]', '[data-d9-lon]', '[data-d9-tz]'].forEach(function (s) { $(s).disabled = !manual.checked; });
    placeInput.disabled = manual.checked;
    if (manual.checked) {
      var r = resolvePlace(placeInput.value);
      if (r.place) { $('[data-d9-lat]').value = r.place.lat; $('[data-d9-lon]').value = r.place.lon; tzSel.value = r.place.tz; }
    }
    updatePlaceEcho();
  });

  /* ---------- accuracy ---------- */
  function accuracy() { return ($('input[name="d9-acc"]:checked') || {}).value || 'exact'; }
  $$('input[name="d9-acc"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var a = accuracy(), note = $('[data-d9-acc-note]');
      note.hidden = a === 'exact';
      note.textContent = a === 'approx' ? L.approxNote : a === 'unknown' ? L.errTimeUnknown : '';
      $('[data-d9-time]').required = a !== 'unknown';
    });
  });

  /* ---------- input → instant ---------- */
  function readInput() {
    var dv = $('[data-d9-date]').value, tv = $('[data-d9-time]').value, acc = accuracy();
    var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dv);
    if (!dm || !N.validDate(+dm[1], +dm[2], +dm[3])) return { error: L.errDate, field: '[data-d9-date]' };
    var y = +dm[1], mo = +dm[2], d = +dm[3];
    if (y < C.minYear) return { error: L.errRange, field: '[data-d9-date]' };
    var tm = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(tv);
    if (acc !== 'unknown') {
      if (!tm || +tm[1] > 23 || +tm[2] > 59) return { error: L.errTime, field: '[data-d9-time]' };
    }
    var place;
    if (manual.checked) {
      var lat = parseFloat($('[data-d9-lat]').value), lon = parseFloat($('[data-d9-lon]').value), tz = tzSel.value;
      if (!isFinite(lat) || lat < -66 || lat > 66) return { error: L.errLat, field: '[data-d9-lat]' };
      if (!isFinite(lon) || lon < -180 || lon > 180) return { error: L.errLon, field: '[data-d9-lon]' };
      if (!N.isValidZone(tz)) return { error: L.errZone, field: '[data-d9-tz]' };
      place = { name: 'Custom location', region: '', country: '', lat: lat, lon: lon, tz: tz, manual: true };
    } else {
      var r = resolvePlace(placeInput.value);
      if (!r.place) return { error: r.error, field: '[data-d9-place]' };
      place = r.place;
    }
    return {
      y: y, m: mo, d: d, h: tm ? +tm[1] : 12, mi: tm ? +tm[2] : 0, s: tm && tm[3] ? +tm[3] : 0,
      accuracy: acc, place: place,
      name: $('[data-d9-name]').value.trim().slice(0, 60)
    };
  }

  function clearInvalid() { $$('[aria-invalid]', form).forEach(function (n) { n.removeAttribute('aria-invalid'); }); }

  function calculate(ev) {
    if (ev) ev.preventDefault();
    clearInvalid(); showError('');
    var inp = readInput();
    if (inp.error) {
      showError(inp.error);
      if (inp.field) { var f = $(inp.field); f.setAttribute('aria-invalid', 'true'); f.focus(); }
      results.hidden = true; partial.hidden = true; return;
    }
    try {
      if (inp.accuracy === 'unknown') return renderPartial(inp);
      var conv = N.localToUtc(inp, inp.place.tz);
      var amb = $('[data-d9-ambig]');
      if (conv.status === 'nonexistent') { amb.hidden = true; showError(L.errNonexistent); results.hidden = true; return; }
      if (conv.status === 'ambiguous') {
        amb.hidden = false;
        $('[data-d9-ambig-text]').textContent = L.ambiguousNote;
        var btns = $('[data-d9-ambig-btns]'); btns.textContent = '';
        conv.candidates.forEach(function (c, i) {
          var off = N.formatOffset(Math.round((Date.UTC(inp.y, inp.m - 1, inp.d, inp.h, inp.mi, inp.s) - c) / 1000));
          var b = el('button', { type: 'button', class: 'd9-chip', 'aria-pressed': String(i === state.ambiguityChoice) },
            (i === 0 ? 'First occurrence (' : 'Second occurrence (') + off + ')');
          b.addEventListener('click', function () { state.ambiguityChoice = i; calculate(); });
          btns.appendChild(b);
        });
        conv.utcMs = conv.candidates[Math.min(state.ambiguityChoice, conv.candidates.length - 1)];
      } else { amb.hidden = true; state.ambiguityChoice = 0; }
      if (conv.utcMs > Date.now()) { showError(L.errFuture); $('[data-d9-date]').setAttribute('aria-invalid', 'true'); results.hidden = true; return; }
      var wallMs = Date.UTC(inp.y, inp.m - 1, inp.d, inp.h, inp.mi, inp.s);
      var offsetSec = Math.round((wallMs - conv.utcMs) / 1000);
      var chart = N.calculateChart({ utcMs: conv.utcMs, lat: inp.place.lat, lon: inp.place.lon });
      if (!chart.ok) { showError(chart.error === 'range' ? L.errRange : chart.error === 'polar' ? L.errLat : L.errEphemeris); results.hidden = true; return; }
      // Sensitivity: recompute 5 minutes either side and flag anything whose D9 sign changes.
      var before = N.calculateChart({ utcMs: conv.utcMs - 300000, lat: inp.place.lat, lon: inp.place.lon });
      var after = N.calculateChart({ utcMs: conv.utcMs + 300000, lat: inp.place.lat, lon: inp.place.lon });
      var all = [chart.lagna].concat(chart.planets);
      var allB = [before.lagna].concat(before.planets), allA = [after.lagna].concat(after.planets);
      all.forEach(function (p, i) { p.sensitive = !!(before.ok && after.ok) && (allB[i].d9Sign !== p.d9Sign || allA[i].d9Sign !== p.d9Sign); });
      state.chart = chart; state.input = inp; state.offsetSec = offsetSec;
      partial.hidden = true;
      render();
    } catch (e) {
      showError(L.errEphemeris); results.hidden = true;
    }
  }

  /* ---------- rendering ---------- */
  function dignity(key, sign) {
    var d = C.dignities[key]; if (!d) return '';
    if (d.exalted === sign) return 'exalted';
    if (d.debilitated === sign) return 'debilitated';
    if (d.own.indexOf(sign) >= 0) return 'own';
    return '';
  }
  var DIG_SHORT = { exalted: 'Exalted', debilitated: 'Debilitated', own: 'Own sign' };

  function render() {
    var ch = state.chart, inp = state.input, all = [ch.lagna].concat(ch.planets);
    results.hidden = false;
    $('[data-d9-example-tag]').hidden = !state.isExample;
    R('who').textContent = inp.name ? ' · ' + inp.name : '';
    R('d9lagna').textContent = ch.d9Lagna.name;
    R('summary').textContent = 'D1 Ascendant ' + ch.lagna.d1SignName + ' ' + ch.lagna.d1Dms + ' → Navamsa ' + ch.lagna.navamsaPart + ' of 9 → D9 Ascendant ' + ch.d9Lagna.name +
      '. Vargottama: ' + (ch.vargottama.length ? ch.vargottama.join(', ') : 'none') + '.';
    var warn = R('accWarn'), sens = all.filter(function (p) { return p.sensitive; }).map(function (p) { return p.key; });
    warn.hidden = !(inp.accuracy === 'approx' || sens.length);
    warn.textContent = (inp.accuracy === 'approx' ? L.approxNote + ' ' : '') +
      (sens.length ? 'Would change within ±5 minutes of the entered time: ' + sens.join(', ') + '.' : 'No placement changes within ±5 minutes of the entered time.');
    drawChart(); renderTable(); renderVarg(); renderCmp(); renderInterp(); renderProv();
    announce('D9 chart calculated. D9 Ascendant ' + ch.d9Lagna.name + '.');
  }

  function occupantsBySign(which) {
    var ch = state.chart, occ = {};
    for (var i = 0; i < 12; i++) occ[i] = [];
    ch.planets.forEach(function (p) { occ[which === 'd1' ? p.d1Sign : p.d9Sign].push(p); });
    return occ;
  }

  var NORTH = { // house: [label x, y, layout, sign-number x, y]
    1: [200, 72, 'd', 200, 178], 2: [100, 20, 't', 100, 86], 3: [30, 105, 'v', 86, 100], 4: [100, 172, 'd', 176, 200],
    5: [30, 305, 'v', 86, 300], 6: [100, 390, 'b', 100, 316], 7: [200, 272, 'd', 200, 226], 8: [300, 390, 'b', 300, 316],
    9: [368, 305, 'v', 314, 300], 10: [300, 172, 'd', 224, 200], 11: [368, 105, 'v', 314, 100], 12: [300, 20, 't', 300, 86]
  };
  var SOUTH_CELL = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]]; // Aries..Pisces

  function drawChart() {
    var which = state.which, ch = state.chart;
    var lagnaSign = which === 'd9' ? ch.d9Lagna.sign : ch.lagna.d1Sign;
    var occ = occupantsBySign(which);
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 400'); svg.setAttribute('role', 'img');
    svg.setAttribute('class', 'd9-chart d9-chart--' + state.style);
    var title = which === 'd9' ? 'D9 Navamsa chart' : 'D1 Rashi (birth) chart';
    svg.setAttribute('aria-label', title + ', ' + (state.style === 'north' ? 'North' : 'South') + ' Indian style. Ascendant ' + SIGNS[lagnaSign] + '. Full details are in the table below.');
    function add(tag, attrs, text) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (text !== undefined) n.textContent = text;
      svg.appendChild(n); return n;
    }
    function tokens(list) {
      return list.map(function (p) {
        return { t: C.planets[p.key].abbr, r: p.retrograde && p.key !== 'Rahu' && p.key !== 'Ketu', sens: p.sensitive && which === 'd9' };
      });
    }
    function writeTokens(list, x, y, layout) {
      var perRow = layout === 'v' ? 1 : 3, dy = 18, w = 31;
      var rows = []; for (var i = 0; i < list.length; i += perRow) rows.push(list.slice(i, i + perRow));
      if (layout === 'v') y = y - (rows.length - 1) * dy / 2;          // centred vertically on the side triangle
      if (layout === 'b') y = y - (rows.length - 1) * dy;              // bottom triangles grow upwards from the base
      rows.forEach(function (row, r) {
        var x0 = x - (row.length - 1) * w / 2;
        row.forEach(function (tk, c) {
          var t = add('text', { x: x0 + c * w, y: y + r * dy, 'text-anchor': 'middle', class: 'd9-pl' + (tk.sens ? ' is-sens' : '') }, tk.t);
          if (tk.r || tk.sens) {
            var sup = document.createElementNS(NS, 'tspan');
            sup.setAttribute('class', 'd9-pl-mark'); sup.textContent = (tk.r ? '℞' : '') + (tk.sens ? '†' : '');
            t.appendChild(sup);
          }
        });
      });
    }
    if (state.style === 'north') {
      add('rect', { x: 2, y: 2, width: 396, height: 396, class: 'd9-frame' });
      add('path', { d: 'M200 2 L398 200 L200 398 L2 200 Z', class: 'd9-lagna-bg', 'clip-path': '' });
      add('path', { d: 'M200 2 L300 100 L200 200 L100 100 Z', class: 'd9-asc-cell' });
      add('path', { d: 'M2 2 L398 398 M398 2 L2 398 M200 2 L398 200 L200 398 L2 200 Z', class: 'd9-lines' });
      for (var h = 1; h <= 12; h++) {
        var sign = (lagnaSign + h - 1) % 12, pos = NORTH[h];
        add('text', { x: pos[3], y: pos[4] + 4, 'text-anchor': 'middle', class: 'd9-signno' }, String(sign + 1));
        var list = tokens(occ[sign]);
        if (h === 1) list.unshift({ t: 'As', asc: true });
        writeTokens(list, pos[0], pos[1], pos[2]);
      }
    } else {
      add('rect', { x: 2, y: 2, width: 396, height: 396, class: 'd9-frame' });
      for (var s = 0; s < 12; s++) {
        var cell = SOUTH_CELL[s], cx = cell[0] * 99 + 2, cy = cell[1] * 99 + 2;
        add('rect', { x: cx, y: cy, width: 99, height: 99, class: s === lagnaSign ? 'd9-cell d9-asc-cell' : 'd9-cell' });
        add('text', { x: cx + 6, y: cy + 15, class: 'd9-signno' }, C.signAbbr[s]);
        if (s === lagnaSign) add('path', { d: 'M' + (cx + 70) + ' ' + cy + ' L' + (cx + 99) + ' ' + (cy + 29), class: 'd9-asc-mark' });
        var lst = tokens(occ[s]);
        if (s === lagnaSign) lst.unshift({ t: 'As' });
        writeTokens(lst, cx + 50, cy + 40, 'd');
      }
      add('text', { x: 200, y: 192, 'text-anchor': 'middle', class: 'd9-center' }, which === 'd9' ? 'Navamsa (D9)' : 'Rashi (D1)');
      add('text', { x: 200, y: 214, 'text-anchor': 'middle', class: 'd9-center-sub' }, 'Lahiri · sidereal');
    }
    var host = R('chart'); host.textContent = ''; host.appendChild(svg);
    R('chartTitle').textContent = title;
    R('legend').textContent = 'As = Ascendant (Lagna) · Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu · ℞ retrograde' +
      (which === 'd9' ? ' · † within ±5 min of a boundary' : '') + (state.style === 'north' ? '. Numbers are signs (1 = Aries … 12 = Pisces); the top diamond is the 1st house.' : '. Signs are fixed; the shaded, marked cell holds the Ascendant.');
    // Text alternative for screen readers
    var parts = [];
    for (var hh = 1; hh <= 12; hh++) {
      var sg = (lagnaSign + hh - 1) % 12, names = occ[sg].map(function (p) { return p.key; });
      if (hh === 1) names.unshift('Ascendant');
      parts.push(ord(hh) + ' house ' + SIGNS[sg] + ': ' + (names.length ? names.join(', ') : 'empty'));
    }
    R('chartText').textContent = title + '. ' + parts.join('. ') + '.';
  }

  function renderTable() {
    var ch = state.chart, t = R('table'); t.textContent = '';
    t.appendChild(el('caption', { class: 'd9-sr' }, 'D1 and D9 placement of each planet and the Ascendant'));
    var head = ['Planet', 'D1 sign', 'D1 degree', 'Nakshatra (pada)', 'D1 house', 'Navamsa sign', 'D9 position', 'D9 house', 'Vargottama'];
    var tr = el('tr'); head.forEach(function (h) { tr.appendChild(el('th', { scope: 'col' }, h)); });
    var thead = el('thead'); thead.appendChild(tr); t.appendChild(thead);
    var tb = el('tbody');
    [ch.lagna].concat(ch.planets).forEach(function (p) {
      var row = el('tr');
      row.appendChild(el('th', { scope: 'row' }, label(p.key) + (p.retrograde && p.key !== 'Rahu' && p.key !== 'Ketu' ? ' ℞' : '')));
      var dig = dignity(p.key, p.d9Sign);
      [p.d1SignName, p.d1Dms, p.nakshatra + ' (' + p.pada + ')', String(p.d1House),
        p.d9SignName + (p.sensitive ? ' †' : '') + (dig ? ' · ' + DIG_SHORT[dig] : ''), p.d9Dms, String(p.d9House), p.vargottama ? 'Yes' : 'No']
        .forEach(function (v) { row.appendChild(el('td', null, v)); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
  }

  function renderVarg() {
    var ch = state.chart, box = R('varg'); box.textContent = '';
    var vs = [ch.lagna].concat(ch.planets).filter(function (p) { return p.vargottama; });
    if (!vs.length) {
      box.appendChild(el('p', null, 'No planet and not the Ascendant is Vargottama in this chart — none occupies the same sign in D1 and D9. This is common and has no special meaning by itself.'));
      return;
    }
    var ul = el('ul', { class: 'd9-varg' });
    vs.forEach(function (p) {
      var li = el('li');
      li.appendChild(el('strong', null, label(p.key) + ' — ' + p.d1SignName + ' in D1 and D9'));
      li.appendChild(el('span', null, 'Why: ' + p.d1Dms + ' ' + p.d1SignName + ' is Navamsa ' + p.navamsaPart + ' of a ' + p.modality +
        ' sign, which maps back to ' + p.d1SignName + ' itself.'));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    box.appendChild(el('p', { class: 'd9-muted' }, C.interpretation.vargottama));
  }

  function renderCmp() {
    var ch = state.chart, box = R('cmp'); box.textContent = '';
    var list = [ch.lagna].concat(ch.planets).filter(function (p) { return state.filter === 'all' || p.vargottama; });
    if (!list.length) { box.appendChild(el('p', null, 'No Vargottama placements in this chart.')); return; }
    var wrap = el('div', { class: 'd9-table-wrap', tabindex: '0', role: 'region', 'aria-label': 'D1 versus D9 comparison' });
    var t = el('table', { class: 'd9-table' });
    t.appendChild(el('caption', { class: 'd9-sr' }, 'D1 sign compared with D9 sign'));
    var tr = el('tr'); ['Planet', 'D1 sign', '', 'D9 sign', 'Same sign?', 'Vargottama?', 'D9 dignity'].forEach(function (h, i) {
      tr.appendChild(el('th', i === 2 ? { scope: 'col', 'aria-label': 'maps to' } : { scope: 'col' }, h));
    });
    var th = el('thead'); th.appendChild(tr); t.appendChild(th);
    var tb = el('tbody');
    list.forEach(function (p) {
      var row = el('tr', p.vargottama ? { class: 'is-varg' } : null);
      row.appendChild(el('th', { scope: 'row' }, label(p.key)));
      var dig = dignity(p.key, p.d9Sign);
      [p.d1SignName, '→', p.d9SignName, p.d1Sign === p.d9Sign ? 'Yes' : 'No', p.vargottama ? '★ Yes' : 'No', dig ? DIG_SHORT[dig] : '—']
        .forEach(function (v, i) { row.appendChild(el('td', i === 1 ? { 'aria-hidden': 'true' } : null, v)); });
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); box.appendChild(wrap);
  }

  function renderInterp() {
    var ch = state.chart, I = C.interpretation, box = R('interp'); box.textContent = '';
    var byKey = {}; ch.planets.forEach(function (p) { byKey[p.key] = p; });
    var lag = ch.d9Lagna.sign, lord = C.signLords[lag], lp = byKey[lord];

    box.appendChild(el('p', { class: 'd9-muted' }, I.disclaimer));
    var h = el('h4', null, 'Navamsa Lagna'); box.appendChild(h);
    box.appendChild(el('p', null, 'Your D9 Ascendant is ' + SIGNS[lag] + ', ruled by ' + lord + '. In the D9, ' + lord + ' is in ' + lp.d9SignName +
      ', the ' + ord(lp.d9House) + ' house from the Navamsa Lagna (' + I.houseThemes[lp.d9House] + '). Traditional readings start from the Navamsa Lagna and its lord.'));

    box.appendChild(el('h4', null, 'Marriage and partnership reading points'));
    box.appendChild(el('p', null, I.marriageIntro));
    var ul = el('ul');
    var s7 = (lag + 6) % 12, lord7 = C.signLords[s7], l7 = byKey[lord7];
    var in7 = ch.planets.filter(function (p) { return p.d9House === 7; }).map(function (p) { return p.key; });
    ul.appendChild(el('li', null, '7th house of the D9: ' + SIGNS[s7] + ', ruled by ' + lord7 + ' (placed in ' + l7.d9SignName + ', ' + ord(l7.d9House) + ' house). Occupied by: ' + (in7.length ? in7.join(', ') : 'no planet') + '.'));
    ['Venus', 'Jupiter'].forEach(function (k) {
      var p = byKey[k], dg = dignity(k, p.d9Sign);
      ul.appendChild(el('li', null, k + ' in the D9: ' + p.d9SignName + ', ' + ord(p.d9House) + ' house' + (dg ? ' — ' + I.dignityText[dg] : '') +
        '. Tradition associates ' + k + ' with ' + I.planetThemes[k] + '.'));
    });
    var d1s7 = (ch.lagna.d1Sign + 6) % 12, d1l7 = C.signLords[d1s7], pl = byKey[d1l7];
    ul.appendChild(el('li', null, 'Lord of the 7th house of the birth chart (' + SIGNS[d1s7] + ' → ' + d1l7 + ') falls in ' + pl.d9SignName + ' in the D9, the ' + ord(pl.d9House) + ' house from the Navamsa Lagna.'));
    box.appendChild(ul);

    box.appendChild(el('h4', null, 'Each planet in the Navamsa'));
    var dl = el('dl', { class: 'd9-interp' });
    ch.planets.forEach(function (p) {
      var dg = dignity(p.key, p.d9Sign);
      dl.appendChild(el('dt', null, label(p.key) + ' — ' + p.d9SignName + ', ' + ord(p.d9House) + ' house'));
      dl.appendChild(el('dd', null, 'Traditional Jyotish links ' + p.key + ' with ' + I.planetThemes[p.key] + ', and the ' + ord(p.d9House) + ' house with ' + I.houseThemes[p.d9House] + '.' +
        (dg ? ' It is ' + I.dignityText[dg] + '.' : '') + (p.vargottama ? ' It is Vargottama.' : '')));
    });
    box.appendChild(dl);

    box.appendChild(el('h4', null, 'Karakamsha (Jaimini)'));
    var k = ch.karakamsha;
    box.appendChild(el('p', null, 'Using the seven-karaka scheme (Sun to Saturn), the Atmakaraka — the planet with the highest degree within its sign — is ' + k.atmakaraka +
      '. Its Navamsa sign, the Karakamsha, is ' + k.name + ' (' + ord(k.houseFromD9Lagna) + ' from the Navamsa Lagna).' +
      (k.tie ? ' Note: another planet is within 1″ of the same degree, so this choice is not robust.' : '') +
      ' Schools that use eight karakas (including Rahu) can give a different Atmakaraka.'));
  }

  function renderProv() {
    var ch = state.chart, inp = state.input, dl = R('prov'); dl.textContent = '';
    var utc = new Date(ch.utcMs);
    var rows = [
      ['Birth date', inp.y + '-' + pad(inp.m) + '-' + pad(inp.d)],
      ['Birth time (local)', pad(inp.h) + ':' + pad(inp.mi) + (inp.s ? ':' + pad(inp.s) : '') + ' (' + ({ exact: 'exact', approx: 'approximate' })[inp.accuracy] + ')'],
      ['Birthplace', inp.place.manual ? 'Manual coordinates' : placeLabel(inp.place)],
      ['Local time zone', inp.place.tz + ' · ' + N.formatOffset(state.offsetSec) + ' on that date'],
      ['UTC used', utc.toISOString().replace('T', ' ').replace('.000Z', ' UTC')],
      ['Latitude', Math.abs(inp.place.lat).toFixed(4) + '° ' + (inp.place.lat >= 0 ? 'N' : 'S')],
      ['Longitude', Math.abs(inp.place.lon).toFixed(4) + '° ' + (inp.place.lon >= 0 ? 'E' : 'W')],
      ['Zodiac', 'Sidereal'],
      ['Ayanamsha', 'Lahiri / Chitrapaksha = ' + ch.ayanamsha.dms + ' (true, incl. nutation)'],
      ['Houses', 'Whole sign from each chart’s Ascendant'],
      ['Rahu / Ketu', 'Mean lunar node'],
      ['ΔT (TT − UT)', ch.deltaTSeconds.toFixed(1) + ' s'],
      ['Julian Day (UT)', ch.jdUt.toFixed(6)],
      ['Calculation engine', ch.engine],
      ['Calculation version', ch.version]
    ];
    rows.forEach(function (r) { dl.appendChild(el('dt', null, r[0])); dl.appendChild(el('dd', null, r[1])); });
  }

  /* ---------- unknown birth time: whole-day placements only ---------- */
  function renderPartial(inp) {
    var zone = inp.place.tz;
    var a = N.localToUtc({ y: inp.y, m: inp.m, d: inp.d, h: 0, mi: 0, s: 0 }, zone);
    var b = N.localToUtc({ y: inp.y, m: inp.m, d: inp.d, h: 23, mi: 59, s: 59 }, zone);
    var t0 = a.candidates && a.candidates.length ? a.candidates[0] : null, t1 = b.candidates && b.candidates.length ? b.candidates[b.candidates.length - 1] : null;
    if (t0 === null || t1 === null) { showError(L.errNonexistent); return; }
    if (t0 > Date.now()) { showError(L.errFuture); return; }
    var c0 = N.calculateChart({ utcMs: t0, lat: inp.place.lat, lon: inp.place.lon });
    var c1 = N.calculateChart({ utcMs: t1, lat: inp.place.lat, lon: inp.place.lon });
    if (!c0.ok || !c1.ok) { showError(c0.error === 'range' || c1.error === 'range' ? L.errRange : L.errEphemeris); return; }
    results.hidden = true; partial.hidden = false;
    var t = R('partial'); t.textContent = '';
    t.appendChild(el('caption', { class: 'd9-sr' }, 'Planet placements that do not change during the birth day'));
    var tr = el('tr'); ['Planet', 'D1 sign', 'Navamsa sign', 'Vargottama'].forEach(function (h) { tr.appendChild(el('th', { scope: 'col' }, h)); });
    var th = el('thead'); th.appendChild(tr); t.appendChild(th);
    var tb = el('tbody');
    c0.planets.forEach(function (p, i) {
      var q = c1.planets[i], stable = p.absoluteNavamsa === q.absoluteNavamsa;
      var row = el('tr'); row.appendChild(el('th', { scope: 'row' }, label(p.key)));
      [p.d1Sign === q.d1Sign ? p.d1SignName : p.d1SignName + ' / ' + q.d1SignName,
        stable ? p.d9SignName : 'Changes during the day (' + p.d9SignName + ' → ' + q.d9SignName + ')',
        stable ? (p.vargottama ? 'Yes' : 'No') : '—'].forEach(function (v) { row.appendChild(el('td', null, v)); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    announce('Birth time unknown: showing only placements that hold for the whole day.');
  }

  /* ---------- toggles ---------- */
  function seg(attr, key) {
    $$('[' + attr + ']').forEach(function (b) {
      b.addEventListener('click', function () {
        state[key] = b.getAttribute(attr);
        $$('[' + attr + ']').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        if (!state.chart) return;
        if (key === 'filter') renderCmp(); else drawChart();
      });
    });
  }
  seg('data-d9-style', 'style'); seg('data-d9-which', 'which'); seg('data-d9-filter', 'filter');

  /* ---------- copy / share / print (no birth data unless opted in) ---------- */
  function birthLine() {
    var i = state.input;
    return i.y + '-' + pad(i.m) + '-' + pad(i.d) + ' ' + pad(i.h) + ':' + pad(i.mi) + ' · ' + (i.place.manual ? i.place.lat + ', ' + i.place.lon : placeLabel(i.place)) + ' (' + i.place.tz + ')';
  }
  function summaryText() {
    var ch = state.chart, incl = $('[data-d9-share-birth]').checked;
    var lines = ['D9 / Navamsa chart' + (state.isExample ? ' (example chart)' : ''), 'D9 Ascendant: ' + ch.d9Lagna.name + ' · D1 Ascendant: ' + ch.lagna.d1SignName,
      'Vargottama: ' + (ch.vargottama.length ? ch.vargottama.join(', ') : 'none')];
    ch.planets.forEach(function (p) { lines.push(p.key + ': D1 ' + p.d1SignName + ' → D9 ' + p.d9SignName + ' (house ' + p.d9House + ')'); });
    if (incl) lines.push('Birth: ' + birthLine());
    lines.push('Sidereal · Lahiri ayanamsha · whole-sign houses · ' + ch.version);
    return lines.join('\n');
  }
  function tableText() {
    var ch = state.chart, incl = $('[data-d9-share-birth]').checked;
    var out = [['Planet', 'D1 sign', 'D1 degree', 'Nakshatra', 'Pada', 'D9 sign', 'D9 position', 'D9 house', 'Vargottama'].join('\t')];
    [ch.lagna].concat(ch.planets).forEach(function (p) {
      out.push([p.key, p.d1SignName, p.d1Dms, p.nakshatra, p.pada, p.d9SignName, p.d9Dms, p.d9House, p.vargottama ? 'Yes' : 'No'].join('\t'));
    });
    if (incl) out.push('Birth: ' + birthLine());
    return out.join('\n');
  }
  function copy(text) {
    var done = function () { announce(L.copied); flash(L.copied); }, fail = function () { flash(L.copyFail); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
    else fail();
  }
  function flash(msg) { var n = $('[data-d9-announce]'); n.textContent = msg; }
  $$('[data-d9-copy]').forEach(function (b) {
    b.addEventListener('click', function () { if (state.chart) copy(b.getAttribute('data-d9-copy') === 'table' ? tableText() : summaryText()); });
  });
  $('[data-d9-share]').addEventListener('click', function () {
    if (!state.chart) return;
    var url = location.origin + location.pathname;          // never carries birth data
    if (navigator.share) navigator.share({ title: document.title, text: summaryText(), url: url }).catch(function () {});
    else copy(summaryText() + '\n' + url);
  });
  $('[data-d9-print]').addEventListener('click', function () { window.print(); });

  /* ---------- example & reset ---------- */
  $('[data-d9-example]').addEventListener('click', function () {
    var ex = C.example, place = C.places.filter(function (p) { return p.id === ex.place; })[0];
    form.reset(); manual.dispatchEvent(new Event('change'));
    $('[data-d9-date]').value = ex.date; $('[data-d9-time]').value = ex.time;
    $('[data-d9-name]').value = ex.name; placeInput.value = placeLabel(place); updatePlaceEcho();
    state.isExample = true; calculate();
    results.focus();
  });
  $('[data-d9-reset]').addEventListener('click', function () {
    form.reset(); manual.dispatchEvent(new Event('change'));
    $$('input[name="d9-acc"]')[0].dispatchEvent(new Event('change'));
    state.chart = null; state.isExample = false;
    results.hidden = true; partial.hidden = true; $('[data-d9-ambig]').hidden = true; showError(''); clearInvalid(); updatePlaceEcho();
    $('[data-d9-date]').focus();
  });
  form.addEventListener('submit', function (e) { state.isExample = false; calculate(e); if (!results.hidden) results.focus(); });
  $('[data-d9-date]').max = new Date().toISOString().slice(0, 10);
})();
