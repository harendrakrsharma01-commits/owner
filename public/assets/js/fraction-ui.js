/*!
 * EasyCalculatorSmart — Fraction Calculator UI (all languages).
 * All maths lives in assets/js/lib/fraction.js (window.Fraction). Nothing is sent over the network;
 * nothing is stored. Output is built with createElement / textContent only (no innerHTML with data).
 */
(function () {
  'use strict';
  var F = window.Fraction;
  var root = document.querySelector('.fr');
  var cfgEl = document.getElementById('fr-config');
  if (!F || !root || !cfgEl) return;

  var C = JSON.parse(cfgEl.textContent);
  var U = C.ui;
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };

  var out = {
    error: $('[data-fr-error]'), announce: $('[data-fr-announce]'), result: $('[data-fr-result]'),
    expr: $('[data-fr-expr]'), main: $('[data-fr-main]'), forms: $('[data-fr-forms]'), extra: $('[data-fr-extra]'),
    visual: $('[data-fr-visual]'), bars: $('[data-fr-bars]'), vcap: $('[data-fr-vcap]'), steps: $('[data-fr-steps]')
  };
  var digitsSel = $('[data-fr-digits]');
  var mode = 'calc';
  var last = null; // {text, steps[]} for copy/share

  /* ---------- small helpers ---------- */

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; }
  function num(s) { s = String(s); return C.decimalComma ? s.replace('.', ',') : s; }
  function digits() { return +digitsSel.value || C.defaultDigits; }
  function m(s) { var b = el('bdi', 'fr-m', num(s).replace(/-/g, '−')); b.dir = 'ltr'; return b; }

  /** Fill a template "… {a} … {b}" with LTR-isolated values, as DOM nodes. */
  function tpl(key, p) {
    var frag = document.createDocumentFragment(), s = U[key] || key, re = /\{(\w+)\}/g, at = 0, mt;
    while ((mt = re.exec(s))) {
      if (mt.index > at) frag.appendChild(document.createTextNode(s.slice(at, mt.index)));
      frag.appendChild(p && p[mt[1]] != null ? m(p[mt[1]]) : document.createTextNode(mt[0]));
      at = re.lastIndex;
    }
    if (at < s.length) frag.appendChild(document.createTextNode(s.slice(at)));
    return frag;
  }
  function tplText(key, p) { return (U[key] || key).replace(/\{(\w+)\}/g, function (x, k) { return p && p[k] != null ? num(p[k]).replace(/-/g, '−') : x; }); }

  /** Stacked fraction (with optional whole part) as DOM. */
  function fracEl(f, asMixed) {
    var wrap = el('span', 'fr-f'); wrap.dir = 'ltr';
    var label = asMixed ? F.mixedStr(f) : F.str(f);
    wrap.setAttribute('role', 'img'); wrap.setAttribute('aria-label', label.replace(/-/g, '−'));
    var neg = f.n < 0n, mx = F.toMixed(f);
    if (neg) wrap.appendChild(el('span', 'fr-f-sign', '−'));
    if (f.d === 1n) { wrap.appendChild(el('span', 'fr-f-whole', String(mx.whole))); return wrap; }
    if (asMixed && mx.whole > 0n) wrap.appendChild(el('span', 'fr-f-whole', String(mx.whole)));
    var st = el('span', 'fr-f-stack');
    st.appendChild(el('span', 'fr-f-n', String(asMixed ? mx.num : (neg ? -f.n : f.n))));
    st.appendChild(el('span', 'fr-f-d', String(f.d)));
    wrap.appendChild(st);
    return wrap;
  }

  /* ---------- tabs ---------- */

  var tabs = $$('[data-fr-tab]');
  function showMode(name, focus) {
    mode = name;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-fr-tab') === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $$('[data-fr-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-fr-panel') !== name; });
    clearOutput();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showMode(t.getAttribute('data-fr-tab')); run(); });
    t.addEventListener('keydown', function (ev) {
      var k = ev.key, j = null, rtl = document.documentElement.dir === 'rtl';
      if (k === 'ArrowRight') j = rtl ? i - 1 : i + 1; else if (k === 'ArrowLeft') j = rtl ? i + 1 : i - 1;
      else if (k === 'Home') j = 0; else if (k === 'End') j = tabs.length - 1;
      if (j === null) return;
      ev.preventDefault(); j = (j + tabs.length) % tabs.length;
      showMode(tabs[j].getAttribute('data-fr-tab'), true); run();
    });
  });

  /* ---------- inputs ---------- */

  function group(id) { return $('[data-fr-frac="' + id + '"]'); }
  function part(g, p) { var i = $('[data-part="' + p + '"]', g); return i ? i.value : ''; }
  function readGroup(g) { return F.fromParts(part(g, 'w'), part(g, 'n'), part(g, 'd')); }
  function setGroup(g, text) {
    var w = '', n = '', d = '', mt;
    text = String(text || '').trim();
    if ((mt = /^(-?\d+)\s+(\d+)\/(\d+)$/.exec(text))) { w = mt[1]; n = mt[2]; d = mt[3]; }
    else if ((mt = /^(-?\d+)\/(-?\d+)$/.exec(text))) { n = mt[1]; d = mt[2]; }
    else w = text;
    var iw = $('[data-part="w"]', g), inn = $('[data-part="n"]', g), id = $('[data-part="d"]', g);
    if (iw) iw.value = w; else if (w) { n = w; d = '1'; }
    inn.value = n; id.value = d;
  }
  function text(name) { var i = $('[data-fr-text="' + name + '"]'); return i ? i.value : ''; }
  function radio(name) { var r = $('input[name="' + name + '"]:checked'); return r ? r.value : ''; }

  /** Clone-free fraction group for dynamic rows. */
  function makeGroup(label, val) {
    var fs = el('fieldset', 'fr-in fr-in--row');
    fs.appendChild(el('legend', 'fr-sr', label));
    var row = el('div', 'fr-in-row'); row.dir = 'ltr';
    var mk = function (partName, ph, lbl) {
      var l = el('label'); l.appendChild(el('span', 'fr-sr', label + ' — ' + lbl));
      var i = el('input'); i.type = 'text'; i.inputMode = 'numeric'; i.autocomplete = 'off';
      i.setAttribute('data-part', partName); i.placeholder = ph; l.appendChild(i); return l;
    };
    var w = mk('w', U.wholeShort, U.whole); w.className = 'fr-in-whole'; row.appendChild(w);
    var st = el('span', 'fr-in-stack');
    st.appendChild(mk('n', U.numShort, U.num));
    var bar = el('span', 'fr-in-bar'); bar.setAttribute('aria-hidden', 'true'); st.appendChild(bar);
    st.appendChild(mk('d', U.denShort, U.den));
    row.appendChild(st); fs.appendChild(row);
    if (val) setGroup(fs, val);
    return fs;
  }

  var rowDefaults = { multi: [[null, '1/2'], ['+', '1/3'], ['-', '1/6'], ['+', '3/8']], order: [[null, '3/4'], [null, '2/3'], [null, '5/8']] };
  var opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function addRow(kind, op, val) {
    var list = $('[data-fr-rows="' + kind + '"]');
    if (list.children.length >= C.maxRows) return;
    var li = el('li', 'fr-row');
    var idx = list.children.length + 1;
    if (kind === 'multi') {
      var sel = el('select', 'fr-row-op'); sel.setAttribute('aria-label', U.operation);
      Object.keys(opSymbols).forEach(function (k) { var o = el('option', null, opSymbols[k]); o.value = k; if (k === (op || '+')) o.selected = true; sel.appendChild(o); });
      li.appendChild(sel);
    }
    li.appendChild(makeGroup(tplText('fractionN', { i: idx }), val));
    var rm = el('button', 'fr-row-rm', '×'); rm.type = 'button'; rm.setAttribute('aria-label', U.removeRow);
    rm.addEventListener('click', function () {
      var min = kind === 'order' ? 3 : 2;
      if (list.children.length <= min) { showError(tplText('e_min-rows', { n: min })); return; }
      list.removeChild(li); renumber(kind);
    });
    li.appendChild(rm);
    list.appendChild(li);
    renumber(kind);
  }
  function renumber(kind) {
    $$('[data-fr-rows="' + kind + '"] > li').forEach(function (li, i) {
      var s = $('.fr-row-op', li); if (s) s.hidden = i === 0;
      var lg = $('legend', li); if (lg) lg.textContent = tplText('fractionN', { i: i + 1 });
    });
  }
  function resetRows(kind, vals) {
    clear($('[data-fr-rows="' + kind + '"]'));
    (vals || rowDefaults[kind]).forEach(function (r) { addRow(kind, r[0], r[1]); });
  }
  $$('[data-fr-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-fr-add');
      if ($('[data-fr-rows="' + k + '"]').children.length >= C.maxRows) { showError(tplText('e_max-rows', { n: C.maxRows })); return; }
      addRow(k, '+', '');
      var li = $('[data-fr-rows="' + k + '"]').lastElementChild; $('[data-part="n"]', li).focus();
    });
  });
  function rows(kind) {
    return $$('[data-fr-rows="' + kind + '"] > li').map(function (li, i) {
      var s = $('.fr-row-op', li);
      return { op: i === 0 ? null : (s ? s.value : null), item: readGroup($('fieldset', li)) };
    });
  }

  // Show/hide direction-dependent inputs.
  $$('.fr-dir input').forEach(function (r) { r.addEventListener('change', function () { syncDir(r.closest('form')); run(); }); });
  function syncDir(form) {
    var d = $('.fr-dir input:checked', form); if (!d) return;
    $$('[data-fr-show]', form).forEach(function (x) { x.hidden = x.getAttribute('data-fr-show') !== d.value; });
    if (form.getAttribute('data-fr-panel') === 'mixed') {
      var g = group('mixed-a'), w = $('[data-part="w"]', g);
      if (d.value === 'toMixed' && w.value) { setGroup(g, '7/4'); }
      if (d.value === 'toImproper' && !w.value) { setGroup(g, '2 1/3'); }
    }
  }

  /* ---------- output ---------- */

  function clearOutput() {
    out.error.hidden = true; out.error.textContent = '';
    [out.expr, out.main, out.forms, out.extra, out.steps, out.bars, out.vcap].forEach(clear);
    out.visual.hidden = true; out.result.hidden = true; last = null;
  }
  function showError(msg) { clearOutput(); out.error.textContent = msg; out.error.hidden = false; out.announce.textContent = msg; }
  function errorText(e) { return e && e.code ? (U['e_' + e.code] || U.e_invalid) : U.e_invalid; }

  function decimalInfo(f) {
    var d = F.toDecimal(f, digits());
    return { text: d.text, exact: d.exact, period: d.period };
  }

  /** Standard block: big result + exact / mixed / decimal / percent rows (only meaningful ones). */
  function showValue(f, opts) {
    opts = opts || {};
    var main = clear(out.main);
    main.appendChild(fracEl(f, false));
    var mx = F.toMixed(f);
    if (mx.whole > 0n && mx.num > 0n) { main.appendChild(el('span', 'fr-eqsign', '=')); main.appendChild(fracEl(f, true)); }
    var rowsOut = [];
    rowsOut.push([U.exactFraction, F.str(f)]);
    if (mx.whole > 0n && mx.num > 0n) rowsOut.push([U.mixedNumber, F.mixedStr(f)]);
    var d = decimalInfo(f);
    rowsOut.push([U.decimal, (d.exact ? '' : '≈ ') + d.text, d.period ? { key: 'repeatingNote', p: { p: d.period } } : null]);
    if (!opts.noPercent) { var p = F.toDecimal(F.toPercentFraction(f), digits()); rowsOut.push([U.percent, (p.exact ? '' : '≈ ') + p.text + '%']); }
    (opts.more || []).forEach(function (r) { rowsOut.push(r); });
    var dl = clear(out.forms);
    rowsOut.forEach(function (r) { dl.appendChild(el('dt', null, r[0])); dl.appendChild(ddFor(r)); });
    visual(f);
    return rowsOut;
  }

  /** <dd> with the value isolated LTR and an optional localized note (e.g. the repeating period). */
  function ddFor(r) {
    var dd = el('dd'); dd.appendChild(m(r[1]));
    if (r[2]) { var n = el('span', 'fr-note'); n.appendChild(tpl(r[2].key, r[2].p)); dd.appendChild(n); }
    return dd;
  }
  function rowText(r) { return r[0] + ': ' + num(r[1]) + (r[2] ? ' (' + tplText(r[2].key, r[2].p) + ')' : ''); }

  function showSteps(steps) {
    var ol = clear(out.steps), lines = [];
    (steps || []).forEach(function (s) {
      var li = el('li');
      if (s.k === 'euclid') {
        li.appendChild(tpl('st_euclid', s.p));
        var sub = el('ul', 'fr-euclid');
        s.p.lines.forEach(function (l) { var x = el('li'); x.appendChild(m(l)); sub.appendChild(x); });
        li.appendChild(sub);
        lines.push(tplText('st_euclid', s.p) + ' ' + s.p.lines.join('; '));
      } else {
        var key = 'st_' + s.k;
        var p = s.p;
        if (s.k === 'pctResult') { key = p.approx ? 'st_pctApprox' : 'st_pctResult'; }
        li.appendChild(tpl(key, p));
        lines.push(tplText(key, p));
      }
      ol.appendChild(li);
    });
    return lines;
  }

  function chip(label, value) { var s = el('span', 'fr-chip-out'); s.appendChild(document.createTextNode(label + ': ')); s.appendChild(m(value)); return s; }

  function visual(f) {
    clear(out.bars); clear(out.vcap);
    if (f.n === 0n) { out.visual.hidden = true; return; }
    var mx = F.toMixed(f), d = Number(f.d), wholes = Number(mx.whole > 6n ? 6n : mx.whole), part = Number(mx.num);
    var segmented = d <= 24;
    out.visual.hidden = false;
    out.visual.classList.toggle('is-neg', f.n < 0n);
    var bar = function (filled) {
      var b = el('div', 'fr-bar');
      if (segmented) for (var i = 0; i < d; i++) b.appendChild(el('span', i < filled ? 'on' : ''));
      else { var x = el('span', 'on fr-bar-fill'); x.style.width = (filled / d * 100).toFixed(2) + '%'; b.appendChild(x); b.classList.add('is-cont'); }
      return b;
    };
    for (var w = 0; w < wholes; w++) out.bars.appendChild(bar(d));
    if (mx.whole > 6n) out.bars.appendChild(el('p', 'fr-more', tplText('visMore', { k: String(mx.whole - 6n) })));
    if (part > 0) out.bars.appendChild(bar(part));
    var cap = mx.whole > 0n ? tplText('visMixed', { w: String(mx.whole), n: String(mx.num), d: String(mx.den) }) : tplText('visParts', { n: String(mx.num), d: String(mx.den) });
    if (f.n < 0n) cap = tplText('visNeg', { v: cap });
    out.vcap.textContent = cap;
  }

  function finish(exprText, rowsOut, stepLines) {
    out.result.hidden = false;
    out.expr.textContent = num(exprText).replace(/-/g, '−');
    var summary = num(exprText) + ' → ' + rowsOut.map(rowText).join(' · ');
    last = { text: summary.replace(/-/g, '−'), steps: stepLines };
    out.announce.textContent = U.result + ': ' + rowsOut.map(rowText).join(', ');
  }

  /* ---------- modes ---------- */

  var runners = {
    calc: function () {
      var a = readGroup(group('calc-a')), b = readGroup(group('calc-b')), op = radio('fr-calc-op');
      var r = F.binary(a, b, op);
      var rowsOut = showValue(r.value, { more: [r.lcd ? [U.lcd, String(r.lcd)] : null, [U.gcd, String(r.gcd)]].filter(Boolean) });
      finish(a.text + ' ' + opSymbols[op] + ' ' + b.text, rowsOut, showSteps(r.steps));
    },
    multi: function () {
      var list = rows('multi'), r = F.expression(list);
      var expr = list.map(function (x, i) { return (i ? ' ' + opSymbols[x.op] + ' ' : '') + x.item.text; }).join('');
      var rowsOut = showValue(r.value, { more: r.lcd ? [[U.lcd, String(r.lcd)]] : [] });
      finish(expr, rowsOut, showSteps(r.steps));
    },
    simplify: function () {
      var a = readGroup(group('simplify-a')), r = F.simplify(a);
      var factor = r.gcd > 1n ? String(r.gcd) : '1';
      var rowsOut = showValue(r.value, { more: [[U.original, r.original.n + '/' + r.original.d], [U.gcd, String(r.gcd)], [U.factor, factor]] });
      finish(a.text, rowsOut, showSteps(r.steps));
    },
    mixed: function () {
      var a = readGroup(group('mixed-a')), dir = radio('fr-mixed-dir');
      var r = dir === 'toImproper' ? F.mixedToImproper(a) : F.improperToMixed(a);
      var rowsOut = showValue(r.value);
      finish(a.text, rowsOut, showSteps(r.steps));
    },
    decimal: function () {
      var dir = radio('fr-decimal-dir'), r, expr;
      if (dir === 'toFrac') { r = F.decimalToFraction(text('dec')); expr = text('dec').trim(); }
      else { var a = readGroup(group('decimal-a')); r = F.fractionToDecimal(a, digits()); expr = a.text; }
      var rowsOut = showValue(r.value);
      finish(expr, rowsOut, showSteps(r.steps));
    },
    percent: function () {
      var dir = radio('fr-percent-dir'), r, expr;
      if (dir === 'toFrac') { r = F.percentToFraction(text('pct')); expr = text('pct').trim().replace(/%?$/, '%'); }
      else { var a = readGroup(group('percent-a')); r = F.fractionToPercent(a, digits()); expr = a.text; }
      var rowsOut = showValue(r.value);
      finish(expr, rowsOut, showSteps(r.steps));
    },
    compare: function () {
      var a = readGroup(group('compare-a')), b = readGroup(group('compare-b')), r = F.compare(a, b);
      var sym = r.cmp < 0 ? '<' : r.cmp > 0 ? '>' : '=';
      var main = clear(out.main);
      main.appendChild(fracEl(r.a)); main.appendChild(el('span', 'fr-eqsign fr-cmp', sym)); main.appendChild(fracEl(r.b));
      var verdict = tplText(r.cmp < 0 ? 'cmpLess' : r.cmp > 0 ? 'cmpGreater' : 'cmpEqual', { a: F.str(r.a), b: F.str(r.b) });
      var rowsOut = [[U.comparison, F.str(r.a) + ' ' + sym + ' ' + F.str(r.b)], [U.lcd, String(r.lcd)],
        [U.decimal + ' A', decimalInfo(r.a).text], [U.decimal + ' B', decimalInfo(r.b).text]];
      var dl = clear(out.forms);
      rowsOut.forEach(function (x) { dl.appendChild(el('dt', null, x[0])); dl.appendChild(ddFor(x)); });
      clear(out.extra).appendChild(el('p', 'fr-verdict', verdict));
      out.visual.hidden = true;
      finish(a.text + ' ? ' + b.text, [[U.comparison, verdict]], showSteps(r.steps));
    },
    order: function () {
      var list = rows('order').map(function (x) { return x.item; });
      if (list.length < 3) throw new F.FracError('min-rows');
      var r = F.order(list);
      clear(out.main);
      var ex = clear(out.extra);
      var mk = function (title, arr, sep) {
        ex.appendChild(el('h4', 'fr-h4', title));
        var p = el('p', 'fr-order'); p.dir = 'ltr';
        arr.forEach(function (x, i) { if (i) p.appendChild(el('span', 'fr-order-sep', sep)); p.appendChild(fracEl(x.f)); });
        ex.appendChild(p);
      };
      mk(U.asc, r.asc, '<'); mk(U.desc, r.desc, '>');
      fixEquals(ex, r.asc);
      clear(out.forms); out.visual.hidden = true;
      var ascText = r.asc.map(function (x) { return F.str(x.f); }).join(' ≤ ');
      finish(list.map(function (x) { return x.text; }).join(', '), [[U.asc, ascText], [U.lcd, String(r.lcd)]], showSteps(r.steps));
    },
    of: function () {
      var a = readGroup(group('of-a')), x = F.parseText(text('ofx')), r = F.fractionOf(a, x);
      var rowsOut = showValue(r.value, { noPercent: true });
      finish(tplText('ofExpr', { f: a.text, x: x.text }), rowsOut, showSteps(r.steps));
    },
    what: function () {
      var x = F.parseText(text('wx')), y = F.parseText(text('wy')), r = F.whatFraction(x, y);
      var rowsOut = showValue(r.value);
      finish(tplText('whatExpr', { x: x.text, y: y.text }), rowsOut, showSteps(r.steps));
    },
    equiv: function () {
      var a = readGroup(group('equiv-a'));
      var start = parseInt(text('eqs'), 10), count = parseInt(text('eqc'), 10);
      if (!(start >= 1 && start <= 1000)) throw new F.FracError('mult');
      var r = F.equivalents(a, start, count);
      var rowsOut = showValue(r.value, { noPercent: true });
      var ex = clear(out.extra);
      ex.appendChild(el('h4', 'fr-h4', U.equivList));
      var ul = el('ul', 'fr-equiv'); ul.dir = 'ltr';
      r.list.forEach(function (q) {
        var li = el('li'); li.appendChild(fracEl({ n: q.n, d: q.d }));
        li.appendChild(el('small', null, '× ' + q.k)); ul.appendChild(li);
      });
      ex.appendChild(ul);
      finish(a.text, rowsOut.concat([[U.equivList, r.list.map(function (q) { return q.n + '/' + q.d; }).join(', ')]]), showSteps(r.steps));
    }
  };

  /** In an ordered list, equal neighbours get "=" instead of "<" / ">". */
  function fixEquals(container, asc) {
    var ps = $$('.fr-order', container);
    ps.forEach(function (p, idx) {
      var arr = idx === 0 ? asc : asc.slice().reverse();
      $$('.fr-order-sep', p).forEach(function (s, i) { if (F.cmp(arr[i].f, arr[i + 1].f) === 0) s.textContent = '='; });
    });
  }

  function run() {
    clearOutput();
    try { runners[mode](); }
    catch (e) {
      if (e instanceof F.FracError || (e && e.code)) showError(errorText(e));
      else { showError(U.e_invalid); if (window.console) console.warn(e); }
    }
  }

  /* ---------- events ---------- */

  $$('[data-fr-panel]').forEach(function (form) {
    form.addEventListener('submit', function (ev) { ev.preventDefault(); run(); });
    syncDir(form);
  });
  // Mark invalid characters as the user types (the engine still validates on calculate).
  root.addEventListener('input', function (ev) {
    var t = ev.target;
    if (!t.matches || !t.matches('input[data-part]')) return;
    t.setAttribute('aria-invalid', t.value.trim() && !/^\s*[+\-−]?\d*\s*$/.test(t.value) ? 'true' : 'false');
  });
  digitsSel.addEventListener('change', function () { if (!out.result.hidden) run(); });
  $$('.fr-ops input').forEach(function (r) { r.addEventListener('change', run); });

  if (C.decimalComma) ['dec', 'pct'].forEach(function (k) { var i = $('[data-fr-text="' + k + '"]'); i.value = num(i.value); });

  // Defaults for reset.
  var defaults = $$('[data-fr-panel] input[type="text"], [data-fr-panel] select').filter(function (i) { return !i.closest('[data-fr-rows]'); }).map(function (i) { return [i, i.value]; });
  $$('[data-fr-reset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var form = b.closest('form');
      defaults.forEach(function (d) { if (form.contains(d[0])) { d[0].value = d[1]; d[0].setAttribute('aria-invalid', 'false'); } });
      $$('.fr-ops input, .fr-dir input', form).forEach(function (r, i, all) { r.checked = r === all.filter(function (x) { return x.name === r.name; })[0]; });
      syncDir(form);
      var k = form.getAttribute('data-fr-panel'); if (rowDefaults[k]) resetRows(k);
      run();
    });
  });

  $('[data-fr-copy]').addEventListener('click', function () { copy(last && last.text); });
  $('[data-fr-copy-steps]').addEventListener('click', function () { copy(last && last.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n')); });
  $('[data-fr-print]').addEventListener('click', function () { window.print(); });
  $('[data-fr-share]').addEventListener('click', function () {
    if (!last) return;
    var data = { title: document.title, text: last.text, url: C.pageUrl };
    if (navigator.share) navigator.share(data).catch(function () {});
    else copy(last.text + '\n' + C.pageUrl);
  });
  function copy(t) {
    if (!t || !navigator.clipboard) return;
    navigator.clipboard.writeText(t).then(function () { out.announce.textContent = U.copied; flash(); }, function () {});
  }
  function flash() { var n = el('p', 'fr-toast', U.copied); out.result.appendChild(n); setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 1600); }

  // Quick examples.
  var exBox = $('[data-fr-examples]');
  C.examples.forEach(function (x) {
    var b = el('button', 'fr-chip'); b.type = 'button';
    if (x.lbl) b.appendChild(tpl(x.lbl, { f: x.a, a: x.a, b: x.b, v: x.v, x: x.x }));   // values isolated LTR inside localized text
    else { b.dir = 'ltr'; b.textContent = x.a + ' ' + opSymbols[x.op] + ' ' + x.b; }
    b.addEventListener('click', function () {
      showMode(x.mode);
      var form = $('[data-fr-panel="' + x.mode + '"]');
      if (x.mode === 'calc') { setGroup(group('calc-a'), x.a); setGroup(group('calc-b'), x.b); $('input[name="fr-calc-op"][value="' + x.op + '"]').checked = true; }
      if (x.mode === 'simplify') setGroup(group('simplify-a'), x.a);
      if (x.mode === 'mixed') { $('input[name="fr-mixed-dir"][value="' + x.dir + '"]').checked = true; syncDir(form); setGroup(group('mixed-a'), x.a); }
      if (x.mode === 'decimal') { $('input[name="fr-decimal-dir"][value="' + x.dir + '"]').checked = true; syncDir(form); $('[data-fr-text="dec"]').value = num(x.v); }
      if (x.mode === 'percent') { $('input[name="fr-percent-dir"][value="' + x.dir + '"]').checked = true; syncDir(form); setGroup(group('percent-a'), x.a); }
      if (x.mode === 'compare') { setGroup(group('compare-a'), x.a); setGroup(group('compare-b'), x.b); }
      if (x.mode === 'of') { setGroup(group('of-a'), x.a); $('[data-fr-text="ofx"]').value = x.x; }
      run();
      var o = $('.fr-out'); if (o && o.getBoundingClientRect().top > window.innerHeight) o.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    exBox.appendChild(b);
  });

  var themeBtn = document.querySelector('[data-fr-theme]');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var d = document.documentElement;
    var cur = d.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    d.setAttribute('data-theme', next);
    try { localStorage.setItem('ecs-theme', next); } catch (e) { /* storage blocked */ }
  });

  resetRows('multi'); resetRows('order');
  run();
})();
