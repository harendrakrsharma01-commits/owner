/*!
 * EasyCalculatorSmart — Garage sale pricing calculator UI.
 * All maths lives in assets/js/lib/garage-sale.js (window.GarageSale).
 * Nothing is sent over the network; the price list lives in this browser's localStorage only.
 * All output is written with textContent / createElement (no innerHTML with data).
 */
(function () {
  'use strict';
  var G = window.GarageSale;
  var root = document.querySelector('.gs');
  var cfgEl = document.getElementById('gs-config');
  if (!G || !root || !cfgEl) return;

  var C = JSON.parse(cfgEl.textContent);
  var L = C.labels;
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };
  var R = function (name) { return $('[data-r="' + name + '"]'); };
  var usd = G.formatUSD;

  var els = {
    original: $('[data-gs-original]'), category: $('[data-gs-category]'), condition: $('[data-gs-condition]'),
    conditionHelp: $('[data-gs-condition-help]'), age: $('[data-gs-age]'),
    results: $('[data-gs-results]'), error: $('[data-gs-error]'), announce: $('[data-gs-announce]'),
    name: $('[data-gs-name]'), qty: $('[data-gs-qty]'),
    rows: $('[data-gs-rows]'), tableWrap: $('[data-gs-table-wrap]'), empty: $('[data-gs-empty]'),
    summary: $('[data-gs-summary]'), listBtns: $('[data-gs-list-btns]'), clear: $('[data-gs-clear]'),
    tags: document.querySelector('[data-gs-tags]')
  };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
  function goal() { var g = $('[data-gs-goal]:checked'); return g ? g.value : C.defaultGoal; }
  function showError(msg) { els.error.textContent = msg || ''; els.error.hidden = !msg; }

  /* ---------- pricing ---------- */

  var current = null;

  function run() {
    els.conditionHelp.textContent = C.conditions[els.condition.value].hint;
    var raw = els.original.value.trim();
    var original = G.parseMoney(raw);
    if (!raw) { els.results.hidden = true; current = null; showError(''); els.original.setAttribute('aria-invalid', 'false'); return; }
    var r = original === null ? { ok: false, error: 'price' } : G.priceItem({
      original: original, category: els.category.value, condition: els.condition.value, age: els.age.value, goal: goal()
    }, C);
    els.original.setAttribute('aria-invalid', r.ok ? 'false' : 'true');
    if (!r.ok) { els.results.hidden = true; current = null; showError(L.errPrice); return; }
    showError('');

    var cat = C.categories[els.category.value];
    R('sticker').textContent = usd(r.sticker);
    R('floor').textContent = usd(r.floor);
    R('share').textContent = r.share + '% of the new price';
    R('typical').textContent = 'Typical for ' + cat.label.toLowerCase() + ': ' + r.typical + '.';
    R('warn').hidden = !r.warn;
    R('warn').textContent = r.warn || '';

    var f = r.factors;
    var work = clear(R('work'));
    [
      'Cost new: ' + usd(original),
      '× ' + Math.round(f.pct * 100) + '% for ' + cat.label.toLowerCase() + ' in good condition',
      '× ' + f.condition + ' for condition “' + C.conditions[els.condition.value].label + '”',
      '× ' + f.age + ' for age ' + C.ages[els.age.value].label.toLowerCase(),
      '× ' + f.goal + ' for goal “' + C.goals[goal()].label + '” = ' + usd(r.raw),
      r.capped ? 'Capped at half the new price: ' + usd(original * C.maxShare) : null,
      r.atMin ? 'Raised to the category minimum of ' + usd(Math.max(C.minPrice, cat.min)) : null,
      'Rounded to a friendly amount: ' + usd(r.sticker),
      'Lowest to accept: ' + usd(r.sticker) + ' × ' + C.floorShare + ', rounded down = ' + usd(r.floor)
    ].forEach(function (t) { if (t) work.appendChild(el('li', null, t)); });

    els.results.hidden = false;
    current = r;
    els.announce.textContent = 'Sticker price ' + usd(r.sticker) + ', lowest to accept ' + usd(r.floor);
  }

  /* ---------- price list ---------- */

  var list = load();

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(C.storageKey) || '[]');
      return Array.isArray(v) ? v.filter(function (r) { return r && typeof r.sticker === 'number' && typeof r.floor === 'number'; }) : [];
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(C.storageKey, JSON.stringify(list)); } catch (e) { /* storage blocked: list lasts for this visit */ } }

  function renderList() {
    clear(els.rows);
    list.forEach(function (row, i) {
      var tr = el('tr');
      var name = el('th', null, row.name); name.scope = 'row';
      name.appendChild(el('small', null, row.categoryLabel + ' · ' + row.conditionLabel));
      tr.appendChild(name);
      tr.appendChild(el('td', null, String(row.qty)));
      tr.appendChild(el('td', null, usd(row.sticker)));
      tr.appendChild(el('td', null, usd(row.floor)));
      var td = el('td');
      var btn = el('button', 'gs-x', '×');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Remove ' + row.name);
      btn.addEventListener('click', function () { list.splice(i, 1); save(); renderList(); });
      td.appendChild(btn);
      tr.appendChild(td);
      els.rows.appendChild(tr);
    });
    var s = G.summarize(list);
    var has = list.length > 0;
    els.tableWrap.hidden = !has;
    els.listBtns.hidden = !has;
    els.summary.hidden = !has;
    els.empty.textContent = has ? '' : L.empty;
    $('[data-gs-count]').textContent = String(s.count);
    $('[data-gs-total-sticker]').textContent = usd(s.sticker);
    $('[data-gs-total-floor]').textContent = usd(s.floor);
    els.summary.textContent = has ? s.count + (s.count === 1 ? ' item' : ' items') + ' — expect roughly ' + usd(s.floor) + ' to ' + usd(s.sticker) + ' if everything sells.' : '';
  }

  $('[data-gs-add]').addEventListener('click', function () {
    if (!current) return;
    var q = els.qty.value.trim();
    if (!/^\d{1,3}$/.test(q) || +q < 1) { showError(L.errQty); els.qty.setAttribute('aria-invalid', 'true'); return; }
    els.qty.setAttribute('aria-invalid', 'false');
    showError('');
    var cat = C.categories[els.category.value], cond = C.conditions[els.condition.value];
    list.push({
      name: els.name.value.trim().slice(0, 60) || cat.label,
      category: els.category.value, categoryLabel: cat.label,
      condition: els.condition.value, conditionLabel: cond.label,
      qty: +q, sticker: current.sticker, floor: current.floor
    });
    save(); renderList();
    els.name.value = ''; els.qty.value = '1';
    els.announce.textContent = L.added;
  });

  function listText() {
    var s = G.summarize(list);
    return list.map(function (r) { return r.name + (r.qty > 1 ? ' ×' + r.qty : '') + ' — ' + usd(r.sticker) + ' (lowest ' + usd(r.floor) + ')'; })
      .concat(['Total: ' + usd(s.floor) + '–' + usd(s.sticker) + ' for ' + s.count + ' items']).join('\n');
  }

  $('[data-gs-copy]').addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(listText()).then(function () { els.announce.textContent = L.copied; }, function () {});
  });

  $('[data-gs-csv]').addEventListener('click', function () {
    var blob = new Blob(['﻿' + G.toCSV(list)], { type: 'text/csv;charset=utf-8' });
    var a = el('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'garage-sale-price-list.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // Two taps to clear, so one stray tap can't wipe a long list (no blocking dialog).
  var clearTimer = null;
  els.clear.addEventListener('click', function () {
    if (!clearTimer) {
      els.clear.textContent = 'Tap again to clear';
      clearTimer = setTimeout(function () { clearTimer = null; els.clear.textContent = 'Clear list'; }, 3000);
      return;
    }
    clearTimeout(clearTimer); clearTimer = null;
    els.clear.textContent = 'Clear list';
    list = []; save(); renderList();
  });

  /* ---------- price tags ---------- */

  function buildTags() {
    clear(els.tags);
    var n = 0;
    list.forEach(function (r) {
      for (var i = 0; i < r.qty && n < 200; i++, n++) {
        var t = el('div', 'gs-tag');
        t.appendChild(el('span', 'gs-tag-p', usd(r.sticker)));
        t.appendChild(el('span', 'gs-tag-n', r.name));
        els.tags.appendChild(t);
      }
    });
  }
  $('[data-gs-print-tags]').addEventListener('click', function () {
    buildTags();
    document.body.classList.add('gs-print-tags');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('gs-print-tags'); });

  /* ---------- wiring ---------- */

  els.original.addEventListener('input', run);
  [els.category, els.condition, els.age].forEach(function (s) { s.addEventListener('change', run); });
  $$('[data-gs-goal]').forEach(function (g) { g.addEventListener('change', run); });
  $$('[data-gs-example]').forEach(function (b) {
    b.addEventListener('click', function () {
      var x = JSON.parse(b.getAttribute('data-gs-example'));
      els.original.value = x.original; els.category.value = x.category; els.condition.value = x.condition; els.age.value = x.age;
      els.name.value = x.name || '';
      run();
    });
  });

  var themeBtn = document.querySelector('[data-gs-theme]');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var d = document.documentElement;
    var cur = d.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    d.setAttribute('data-theme', next);
    try { localStorage.setItem('ecs-theme', next); } catch (e) { /* storage blocked */ }
  });

  run();
  renderList();
})();
