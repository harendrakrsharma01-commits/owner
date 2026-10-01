/*!
 * EasyCalculatorSmart — exact fraction engine.
 * Rational arithmetic on BigInt: no floating point anywhere in the maths, no eval, no DOM, no network.
 * A fraction is {n, d} with BigInt parts and d > 0. "Raw" fractions keep the user's (unreduced)
 * numbers so the step-by-step output can show what was actually typed; results are reduced.
 * Steps are returned as data {k: key, p: {params}} so the UI can render them in any language.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Fraction = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_DIGITS = 30;          // per typed integer — far beyond school use, keeps output readable
  var MAX_REPEAT_SCAN = 2000;   // remainders tracked when looking for a repeating decimal period

  function FracError(code) { this.code = code; this.message = code; }
  FracError.prototype = Object.create(Error.prototype);
  function fail(code) { throw new FracError(code); }

  /* ---------- integers ---------- */

  function abs(a) { return a < 0n ? -a : a; }
  function gcd(a, b) { a = abs(a); b = abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { if (a === 0n || b === 0n) return 0n; return abs(a / gcd(a, b) * b); }
  function lcmAll(list) { return list.reduce(function (m, x) { return lcm(m, x); }, 1n); }
  function pow10(k) { var r = 1n; while (k-- > 0) r *= 10n; return r; }

  /** Euclid's algorithm as printable lines: [{a, q, b, r}] for a = q × b + r. */
  function euclid(a, b) {
    a = abs(a); b = abs(b);
    if (a < b) { var t = a; a = b; b = t; }
    var out = [];
    while (b !== 0n && out.length < 60) { var q = a / b, r = a % b; out.push({ a: a, q: q, b: b, r: r }); a = b; b = r; }
    return out;
  }

  function parseInteger(s) {
    s = String(s == null ? '' : s).trim().replace(/[−‒–]/g, '-');
    if (s === '') return null;
    if (!/^[+-]?\d+$/.test(s)) fail('invalid');
    if (s.replace(/^[+-]/, '').replace(/^0+(?=\d)/, '').length > MAX_DIGITS) fail('too-long');
    return BigInt(s);
  }

  /* ---------- fractions ---------- */

  /** Sign-normalised but NOT reduced. */
  function raw(n, d) {
    if (d === 0n) fail('zero-den');
    return d < 0n ? { n: -n, d: -d } : { n: n, d: d };
  }
  function reduce(f) { var g = gcd(f.n, f.d); return g > 1n ? { n: f.n / g, d: f.d / g } : { n: f.n, d: f.d }; }
  function make(n, d) { return reduce(raw(n, d)); }
  function fromInt(n) { return { n: n, d: 1n }; }
  function isZero(f) { return f.n === 0n; }
  function eq(a, b) { return a.n * b.d === b.n * a.d; }
  /** Exact comparison by cross multiplication (denominators are positive). */
  function cmp(a, b) { var l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : l > r ? 1 : 0; }

  function add(a, b) { return make(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return make(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return make(a.n * b.n, a.d * b.d); }
  function div(a, b) { if (b.n === 0n) fail('div-zero'); return make(a.n * b.d, a.d * b.n); }

  function toMixed(f) {
    var neg = f.n < 0n, n = abs(f.n);
    return { neg: neg, whole: n / f.d, num: n % f.d, den: f.d };
  }

  function str(f) { return f.d === 1n ? String(f.n) : f.n + '/' + f.d; }
  function mixedStr(f) {
    var m = toMixed(f);
    if (m.num === 0n) return (m.neg && m.whole ? '-' : '') + m.whole;
    if (m.whole === 0n) return (m.neg ? '-' : '') + m.num + '/' + m.den;
    return (m.neg ? '-' : '') + m.whole + ' ' + m.num + '/' + m.den;
  }

  /**
   * Build a fraction from separate whole / numerator / denominator fields (strings).
   * Mixed numbers take the sign from the whole part: "-2 1/3" = -(2 + 1/3) = -7/3.
   * Returns {value (reduced), raw (improper, unreduced), mixed: bool, text}.
   */
  function fromParts(wholeS, numS, denS) {
    var w = parseInteger(wholeS), n = parseInteger(numS), d = parseInteger(denS);
    if (w === null && n === null && d === null) fail('empty');
    if (n !== null && d === null) fail('den-empty');
    if (n === null && d !== null) fail('num-empty');
    if (d === 0n) fail('zero-den');
    if (n === null) { n = 0n; d = 1n; }
    var r, mixed = false;
    if (w !== null && w !== 0n && n !== 0n) {
      if (n < 0n || d < 0n) fail('sign-mixed');
      mixed = true;
      var mag = abs(w) * d + n;
      r = raw(w < 0n ? -mag : mag, d);
    } else if (w !== null && w !== 0n) {
      r = raw(w * d + n, d);          // whole only (n is 0)
    } else {
      r = raw(n, d);
    }
    var text = mixed ? w + ' ' + n + '/' + d : (w !== null && w !== 0n ? String(w) : n + '/' + d);
    if (!mixed && w !== null && w !== 0n && n === 0n) text = String(w);
    return { value: reduce(r), raw: r, mixed: mixed, text: text };
  }

  /**
   * Exact decimal → fraction. Accepts "0.75", "-1,25", ".5", "3", and repeating notation
   * "0.(3)" / "0.1(6)". A trailing "..." is rejected: an unspecified repeating tail is not exact.
   */
  function parseDecimal(s) {
    s = String(s == null ? '' : s).trim().replace(/[−–]/g, '-').replace(',', '.').replace(/\s+/g, '');
    if (s === '') fail('empty');
    if (/\.\.\.|…/.test(s)) fail('ellipsis');
    var m = /^([+-])?(\d*)(?:\.(\d*)(?:\((\d+)\))?)?$/.exec(s);
    if (!m || (!m[2] && !m[3] && !m[4])) fail('invalid');
    var ip = m[2] || '0', fp = m[3] || '', rp = m[4] || '';
    if ((ip + fp + rp).replace(/^0+/, '').length > MAX_DIGITS * 2) fail('too-long');
    var neg = m[1] === '-';
    var a = fp.length, r = rp.length;
    var n, d;
    if (!r) { n = BigInt(ip + fp); d = pow10(a); }
    else {
      // x = I.A(R):  x = (IAR − IA) / (10^a · (10^r − 1))
      n = BigInt(ip + fp + rp) - BigInt(ip + fp);
      d = pow10(a) * (pow10(r) - 1n);
    }
    var rw = raw(neg ? -n : n, d);
    return { value: reduce(rw), raw: rw, places: a, repeat: rp, text: s };
  }

  /** "12.5%" / "12,5" → fraction of 1. */
  function parsePercent(s) {
    var p = parseDecimal(String(s == null ? '' : s).replace(/%/g, ''));
    return { value: reduce(raw(p.raw.n, p.raw.d * 100n)), raw: raw(p.raw.n, p.raw.d * 100n), pct: p };
  }

  /** Fraction typed as text: "3/4", "-2 1/3", "5", "0.75", "0.(3)". */
  function parseText(s) {
    s = String(s == null ? '' : s).trim().replace(/[−–]/g, '-');
    if (s === '') fail('empty');
    var m = /^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
    if (m) return fromParts(m[1], m[2], m[3]);
    m = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(s);
    if (m) return fromParts('', m[1], m[2]);
    if (/^[+-]?\d+$/.test(s)) return fromParts(s, '', '');
    var p = parseDecimal(s);
    return { value: p.value, raw: p.raw, mixed: false, text: s };
  }

  /* ---------- decimals ---------- */

  /** Does 1/d terminate in base 10? (only prime factors 2 and 5) */
  function terminates(d) { while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; }

  /**
   * Exact decimal expansion.
   * Returns {text: rounded to `digits` (half away from zero, trailing zeros trimmed),
   *          exact: true when `text` equals the fraction exactly,
   *          period: repeating form like "0.1(6)" or null, terminating: bool}.
   */
  function toDecimal(f, digits) {
    digits = Math.max(0, Math.min(20, digits == null ? 6 : digits));
    var neg = f.n < 0n, n = abs(f.n), d = f.d;
    var scale = pow10(digits);
    var q = n * scale / d, rem = n * scale % d;
    if (rem * 2n >= d) q += 1n;                     // round half away from zero
    var s = q.toString();
    var ip, fp = '';
    if (digits) { while (s.length <= digits) s = '0' + s; ip = s.slice(0, -digits); fp = s.slice(-digits).replace(/0+$/, ''); }
    else ip = s;
    var text = (neg && q !== 0n ? '-' : '') + ip + (fp ? '.' + fp : '');
    var term = terminates(d);
    var exact = term && (n * scale) % d === 0n;
    return { text: text, exact: exact, terminating: term, period: term ? null : repeating(f) };
  }

  /** Repeating-decimal notation by long division with remainder tracking: 1/6 → "0.1(6)". */
  function repeating(f) {
    var neg = f.n < 0n, n = abs(f.n), d = f.d;
    var ip = n / d, r = n % d, seen = new Map(), digits = '';
    while (r !== 0n && !seen.has(r)) {
      if (digits.length >= MAX_REPEAT_SCAN) return null;
      seen.set(r, digits.length);
      r *= 10n; digits += (r / d).toString(); r %= d;
    }
    if (r === 0n) return null;
    var start = seen.get(r);
    return (neg ? '-' : '') + ip + '.' + digits.slice(0, start) + '(' + digits.slice(start) + ')';
  }

  function toPercentFraction(f) { return make(f.n * 100n, f.d); }

  /* ---------- step helpers ---------- */

  function S(k, p) { return { k: k, p: p || {} }; }
  function simplifySteps(f, steps) {
    var g = gcd(f.n, f.d);
    if (f.n === 0n) { if (f.d !== 1n) steps.push(S('zero', { from: str(f) })); return { n: 0n, d: 1n }; }
    if (g > 1n) { var r = { n: f.n / g, d: f.d / g }; steps.push(S('simplify', { from: f.n + '/' + f.d, g: String(g), to: str(r) })); return r; }
    steps.push(S('lowest', { f: str(f) }));
    return f;
  }
  function mixedStep(f, steps) {
    if (abs(f.n) > f.d && f.d !== 1n) steps.push(S('toMixed', { from: str(f), to: mixedStr(f), q: String(abs(f.n) / f.d), r: String(abs(f.n) % f.d), d: String(f.d) }));
  }
  function improperStep(item, steps) {
    if (item.mixed) {
      var m = toMixed(item.raw);
      steps.push(S('toImproper', { mixed: item.text, w: String(m.whole), n: String(m.num), d: String(m.den), top: String(abs(item.raw.n)), to: item.raw.n + '/' + item.raw.d }));
    }
  }

  /* ---------- operations with steps ---------- */

  /** a, b: results of fromParts/parseText. op: '+', '-', '*', '/'. */
  function binary(a, b, op) {
    var steps = [], x = a.raw, y = b.raw, res, extra = {};
    improperStep(a, steps); improperStep(b, steps);
    if (op === '+' || op === '-') {
      var L;
      if (x.d === y.d) { L = x.d; steps.push(S('sameDen', { d: String(L) })); }
      else {
        L = lcm(x.d, y.d);
        steps.push(S('lcd', { list: x.d + ', ' + y.d, lcd: String(L) }));
        [x, y].forEach(function (f) { if (f.d !== L) steps.push(S('convert', { from: f.n + '/' + f.d, k: String(L / f.d), to: (f.n * (L / f.d)) + '/' + L })); });
      }
      var xn = x.n * (L / x.d), yn = y.n * (L / y.d), top = op === '+' ? xn + yn : xn - yn;
      steps.push(S(op === '+' ? 'addNum' : 'subNum', { expr: xn + (op === '+' ? ' + ' : ' − ') + paren(yn), sum: String(top), res: top + '/' + L }));
      extra = { lcd: L, gcd: gcd(top, L) };
      res = simplifySteps({ n: top, d: L }, steps);
    } else if (op === '*' || op === '/') {
      if (op === '/') {
        if (y.n === 0n) fail('div-zero');
        var rec = raw(y.d, y.n);
        steps.push(S('reciprocal', { from: y.n + '/' + y.d, to: rec.n + '/' + rec.d }));
        y = rec;
      }
      var nn = x.n * y.n, dd = x.d * y.d;
      steps.push(S('mulNum', { expr: paren(x.n) + ' × ' + paren(y.n), r: String(nn) }));
      steps.push(S('mulDen', { expr: x.d + ' × ' + y.d, r: String(dd) }));
      extra = { gcd: gcd(nn, dd) };
      res = simplifySteps({ n: nn, d: dd }, steps);
    } else fail('op');
    mixedStep(res, steps);
    return { value: res, steps: steps, lcd: extra.lcd || null, gcd: extra.gcd };
  }
  function paren(n) { return n < 0n ? '(' + n + ')' : String(n); }

  /**
   * Several fractions with + − × ÷ and normal precedence (× and ÷ first, left to right).
   * items: [{item, op}] where op is the operator BEFORE the item (ignored for the first).
   */
  function expression(items) {
    if (!items || items.length < 2) fail('min-rows');
    var steps = [];
    items.forEach(function (it) { improperStep(it.item, steps); });
    // pass 1: × and ÷
    var terms = [{ f: items[0].item.raw, sign: 1 }];
    for (var i = 1; i < items.length; i++) {
      var op = items[i].op, f = items[i].item.raw;
      if (op === '*' || op === '/') {
        var last = terms[terms.length - 1];
        if (op === '/' && f.n === 0n) fail('div-zero');
        var r = op === '*' ? mul(last.f, f) : div(last.f, f);
        steps.push(S('opStep', { a: str(last.f), op: op === '*' ? '×' : '÷', b: str(f), r: str(r) }));
        last.f = r;
      } else if (op === '+' || op === '-') terms.push({ f: f, sign: op === '+' ? 1 : -1 });
      else fail('op');
    }
    var res;
    if (terms.length === 1) { res = reduce(terms[0].f); }
    else {
      var L = lcmAll(terms.map(function (t) { return t.f.d; }));
      steps.push(S('lcd', { list: terms.map(function (t) { return String(t.f.d); }).join(', '), lcd: String(L) }));
      var parts = [], total = 0n;
      terms.forEach(function (t, j) {
        var k = L / t.f.d, n = t.f.n * k;
        if (k !== 1n) steps.push(S('convert', { from: str(t.f), k: String(k), to: n + '/' + L }));
        total += t.sign > 0 ? n : -n;
        parts.push((j === 0 ? '' : t.sign < 0 ? ' − ' : ' + ') + paren(n));
      });
      steps.push(S('combine', { expr: parts.join(''), sum: String(total), res: total + '/' + L }));
      res = simplifySteps({ n: total, d: L }, steps);
      mixedStep(res, steps);
      return { value: res, steps: steps, lcd: L };
    }
    mixedStep(res, steps);
    return { value: res, steps: steps, lcd: null };
  }

  function simplify(item) {
    var f = item.raw, steps = [];
    improperStep(item, steps);
    var g = gcd(f.n, f.d);
    if (f.n !== 0n) steps.push(S('euclid', { lines: euclid(f.n, f.d).map(function (e) { return e.a + ' = ' + e.q + ' × ' + e.b + ' + ' + e.r; }), g: String(g) }));
    var r = f.n === 0n ? { n: 0n, d: 1n } : { n: f.n / g, d: f.d / g };
    if (f.n === 0n) steps.push(S('zero', { from: f.n + '/' + f.d }));
    else if (g > 1n) steps.push(S('divideBoth', { n: String(f.n), d: String(f.d), g: String(g), rn: String(r.n), rd: String(r.d) }));
    else steps.push(S('lowest', { f: str(r) }));
    mixedStep(r, steps);
    return { value: r, steps: steps, gcd: g, original: f };
  }

  function mixedToImproper(item) {
    var steps = [];
    var m = toMixed(item.raw);
    steps.push(S('toImproper', { mixed: item.text, w: String(m.whole), n: String(m.num), d: String(m.den), top: String(abs(item.raw.n)), to: item.raw.n + '/' + item.raw.d }));
    var r = simplifySteps(item.raw, steps);
    return { value: r, steps: steps };
  }

  function improperToMixed(item) {
    var steps = [], f = reduce(item.raw);
    if (gcd(item.raw.n, item.raw.d) > 1n) steps.push(S('simplify', { from: item.raw.n + '/' + item.raw.d, g: String(gcd(item.raw.n, item.raw.d)), to: str(f) }));
    var m = toMixed(f);
    steps.push(S('divide', { n: String(abs(f.n)), d: String(f.d), q: String(m.whole), r: String(m.num) }));
    steps.push(S('mixedResult', { res: mixedStr(f) }));
    return { value: f, steps: steps };
  }

  function decimalToFraction(s) {
    var p = parseDecimal(s), steps = [];
    if (p.repeat) steps.push(S('repeatDec', { dec: p.text, a: String(p.places), r: String(p.repeat.length), frac: p.raw.n + '/' + p.raw.d }));
    else steps.push(S('decPlaces', { dec: p.text, k: String(p.places), p10: String(pow10(p.places)), frac: p.raw.n + '/' + p.raw.d }));
    var r = simplifySteps(p.raw, steps);
    mixedStep(r, steps);
    return { value: r, steps: steps };
  }

  function fractionToDecimal(item, digits) {
    var f = item.value, steps = [];
    improperStep(item, steps);
    var d = toDecimal(f, digits);
    steps.push(S('longDiv', { n: String(f.n), d: String(f.d) }));
    steps.push(S(d.terminating ? 'terminates' : 'repeats', { d: String(f.d), period: d.period || '' }));
    return { value: f, steps: steps, decimal: d };
  }

  function percentToFraction(s) {
    var p = parsePercent(s), steps = [];
    steps.push(S('over100', { p: p.pct.text, frac: p.raw.n + '/' + p.raw.d }));
    var r = simplifySteps(p.raw, steps);
    return { value: r, steps: steps };
  }

  function fractionToPercent(item, digits) {
    var f = item.value, steps = [];
    improperStep(item, steps);
    var pf = toPercentFraction(f);
    steps.push(S('times100', { f: str(f), r: str(pf) }));
    var dec = toDecimal(pf, digits);
    steps.push(S('pctResult', { r: dec.period && !dec.exact ? dec.period : dec.text, approx: !dec.exact }));
    return { value: f, steps: steps, percent: dec, percentFraction: pf };
  }

  function compare(a, b) {
    var x = a.value, y = b.value, steps = [];
    var l = x.n * y.d, r = y.n * x.d;
    steps.push(S('cross', { a: str(x), b: str(y), l: paren(x.n) + ' × ' + y.d + ' = ' + l, r: paren(y.n) + ' × ' + x.d + ' = ' + r }));
    var c = l < r ? -1 : l > r ? 1 : 0;
    var L = lcm(x.d, y.d);
    steps.push(S('lcdCompare', { lcd: String(L), a: (x.n * (L / x.d)) + '/' + L, b: (y.n * (L / y.d)) + '/' + L }));
    steps.push(S(c < 0 ? 'less' : c > 0 ? 'greater' : 'equal', { a: str(x), b: str(y) }));
    return { cmp: c, a: x, b: y, lcd: L, steps: steps };
  }

  function order(items) {
    if (!items || items.length < 2) fail('min-rows');
    var list = items.map(function (it, i) { return { f: it.value, text: it.text, i: i }; });
    var asc = list.slice().sort(function (p, q) { return cmp(p.f, q.f) || p.i - q.i; });
    var L = lcmAll(list.map(function (x) { return x.f.d; }));
    var steps = [S('lcd', { list: list.map(function (x) { return String(x.f.d); }).join(', '), lcd: String(L) })];
    if (L.toString().length <= 24) list.forEach(function (x) { steps.push(S('convert', { from: str(x.f), k: String(L / x.f.d), to: (x.f.n * (L / x.f.d)) + '/' + L })); });
    steps.push(S('orderNums', {}));
    return { asc: asc, desc: asc.slice().reverse(), lcd: L, steps: steps };
  }

  /** f of x, where x is any rational (integer, decimal or fraction). */
  function fractionOf(item, x) {
    var steps = [], f = item.value, X = x.value;
    improperStep(item, steps);
    var nn = f.n * X.n, dd = f.d * X.d;
    steps.push(S('ofMul', { f: str(f), x: str(X), expr: paren(f.n) + ' × ' + paren(X.n) + (X.d !== 1n ? ' / (' + f.d + ' × ' + X.d + ')' : ' / ' + f.d), r: nn + '/' + dd }));
    var r = simplifySteps({ n: nn, d: dd }, steps);
    mixedStep(r, steps);
    return { value: r, steps: steps };
  }

  function whatFraction(x, y) {
    var X = x.value, Y = y.value, steps = [];
    if (Y.n === 0n) fail('y-zero');
    var q = div(X, Y);
    var rn = X.n * Y.d, rd = X.d * Y.n;
    steps.push(S('whatFrac', { x: str(X), y: str(Y), f: (X.d === 1n && Y.d === 1n ? X.n + '/' + Y.n : rn + '/' + rd) }));
    var r = simplifySteps(raw(rn, rd), steps);
    var pf = toPercentFraction(q);
    steps.push(S('times100', { f: str(q), r: str(pf) }));
    return { value: r, steps: steps };
  }

  function equivalents(item, start, count) {
    var f = item.value, out = [];
    start = Math.max(1, Math.min(1000, start | 0 || 1));
    count = Math.max(1, Math.min(20, count | 0 || 10));
    for (var k = 0; k < count; k++) { var m = BigInt(start + k); out.push({ k: m, n: f.n * m, d: f.d * m }); }
    return { value: f, list: out, steps: [S('equivRule', { f: str(f) })] };
  }

  return {
    MAX_DIGITS: MAX_DIGITS, FracError: FracError,
    gcd: gcd, lcm: lcm, lcmAll: lcmAll, euclid: euclid,
    parseInteger: parseInteger, fromParts: fromParts, parseDecimal: parseDecimal, parsePercent: parsePercent, parseText: parseText,
    raw: raw, make: make, reduce: reduce, fromInt: fromInt, isZero: isZero, eq: eq, cmp: cmp,
    add: add, sub: sub, mul: mul, div: div,
    toMixed: toMixed, str: str, mixedStr: mixedStr, toDecimal: toDecimal, repeating: repeating, terminates: terminates,
    toPercentFraction: toPercentFraction,
    binary: binary, expression: expression, simplify: simplify, mixedToImproper: mixedToImproper, improperToMixed: improperToMixed,
    decimalToFraction: decimalToFraction, fractionToDecimal: fractionToDecimal,
    percentToFraction: percentToFraction, fractionToPercent: fractionToPercent,
    compare: compare, order: order, fractionOf: fractionOf, whatFraction: whatFraction, equivalents: equivalents
  };
});
