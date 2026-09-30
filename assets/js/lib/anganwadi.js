/*!
 * EasyCalculatorSmart — Anganwadi honorarium (maandey) engine.
 * Pure, dependency-free arithmetic. No DOM, no network.
 * Months are 'YYYY-MM' strings; money is whole or decimal rupees.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Anganwadi = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var POSTS = ['worker', 'mini', 'helper'];
  var MAX_MONTHLY = 100000; // sanity cap: no anganwadi honorarium is anywhere near ₹1 lakh a month
  var HINDI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई',
    'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  function isNum(n) { return typeof n === 'number' && isFinite(n); }
  function round2(n) { return Math.round(n * 100) / 100; }

  /* ---------- months ---------- */

  /** 'YYYY-MM' → month index (year × 12 + month − 1), or null when malformed. */
  function monthIndex(s) {
    var m = /^(\d{4})-(\d{2})$/.exec(typeof s === 'string' ? s : '');
    if (!m) return null;
    var y = +m[1], mo = +m[2];
    return mo >= 1 && mo <= 12 ? y * 12 + mo - 1 : null;
  }

  function monthFromIndex(i) {
    var y = Math.floor(i / 12), m = i - y * 12 + 1;
    return y + '-' + (m < 10 ? '0' : '') + m;
  }

  /** Calendar months from `from` to `to`, both included. 0 when `to` is before `from`. */
  function monthsInclusive(from, to) {
    var a = monthIndex(from), b = monthIndex(to);
    if (a === null || b === null) return null;
    return b < a ? 0 : b - a + 1;
  }

  function hindiMonth(s) {
    var i = monthIndex(s);
    if (i === null) return '';
    var y = Math.floor(i / 12);
    return HINDI_MONTHS[i - y * 12] + ' ' + y;
  }

  /* ---------- money ---------- */

  /** Indian digit grouping without relying on Intl: 144000 → "1,44,000", 1234.5 → "1,234.50". */
  function formatINR(n) {
    if (!isNum(n)) return '';
    var neg = n < 0, v = Math.abs(round2(n));
    var whole = Math.floor(v), paise = Math.round((v - whole) * 100);
    var s = String(whole), out;
    if (s.length <= 3) out = s;
    else {
      out = s.slice(-3);
      s = s.slice(0, -3);
      while (s.length > 2) { out = s.slice(-2) + ',' + out; s = s.slice(0, -2); }
      out = s + ',' + out;
    }
    if (paise) out += '.' + (paise < 10 ? '0' : '') + paise;
    return (neg ? '−' : '') + out;
  }

  /** Accepts "12000", "12,000", "₹ 12,000.50". Returns a number or null. */
  function parseAmount(str) {
    if (isNum(str)) return str;
    if (typeof str !== 'string') return null;
    var s = str.replace(/[₹,\s]/g, '').replace(/^rs\.?/i, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    return +s;
  }

  function validMonthly(n) { return isNum(n) && n > 0 && n <= MAX_MONTHLY; }

  /* ---------- rates ---------- */

  /**
   * Monthly honorarium for a post in a state record from the config.
   * `senior` picks the higher rate where a state pays by length of service (e.g. Haryana, 10+ years).
   * Returns {amount, previous} — either may be null when the figure is not confirmed.
   */
  function resolveRate(state, post, senior) {
    if (!state || POSTS.indexOf(post) < 0) return { amount: null, previous: null };
    var key = post === 'worker' && senior && state.rates && state.rates.workerSenior != null ? 'workerSenior' : post;
    var rates = state.rates || {}, prev = state.previous || {};
    return {
      amount: validMonthly(rates[key]) ? rates[key] : null,
      previous: validMonthly(prev[key]) ? prev[key] : null
    };
  }

  /* ---------- salary ---------- */

  /**
   * @param {object} o
   *   monthly   state honorarium per month (₹)
   *   post      'worker' | 'mini' | 'helper'
   *   incentive add the central performance-linked incentive (true/false)
   *   centre    central scheme settings: {norms:{worker,mini,helper}, pli:{worker,mini,helper}}
   *   sharing   centre's percentage of the central norm: 60, 90 or 100
   */
  function calculateSalary(o) {
    if (!o || !validMonthly(o.monthly)) return { ok: false, error: 'amount' };
    if (POSTS.indexOf(o.post) < 0) return { ok: false, error: 'post' };
    var centre = o.centre || { norms: {}, pli: {} };
    var incentive = o.incentive ? (centre.pli[o.post] || 0) : 0;
    var monthly = round2(o.monthly + incentive);
    var norm = centre.norms[o.post] || 0;
    var pct = [60, 90, 100].indexOf(o.sharing) >= 0 ? o.sharing : 60;
    // The centre funds its share of the central norm (and of the incentive); the state pays the rest,
    // including any top-up above the norm from its own budget.
    var centreShare = round2(Math.min(norm, o.monthly) * pct / 100 + incentive * pct / 100);
    return {
      ok: true,
      base: round2(o.monthly),
      incentive: incentive,
      monthly: monthly,
      yearly: round2(monthly * 12),
      daily: round2(monthly / 30),
      norm: norm,
      sharing: pct,
      centreShare: centreShare,
      stateShare: round2(monthly - centreShare),
      topUp: round2(Math.max(0, o.monthly - norm))
    };
  }

  /** Old → new honorarium: rupee and percentage change per month and per year. */
  function calculateHike(oldMonthly, newMonthly) {
    if (!validMonthly(oldMonthly) || !validMonthly(newMonthly)) return null;
    var diff = round2(newMonthly - oldMonthly);
    return {
      perMonth: diff,
      perYear: round2(diff * 12),
      percent: Math.round((diff / oldMonthly) * 1000) / 10
    };
  }

  /**
   * Arrear (baqaya) owed when the new rate applied from `from` but the old rate was paid up to `to`.
   * Both months are included: new rate from Sep 2026, old rate paid for Sep 2026 → 1 month owed.
   */
  function calculateArrear(oldMonthly, newMonthly, from, to) {
    if (!validMonthly(oldMonthly) || !validMonthly(newMonthly)) return { ok: false, error: 'amount' };
    if (newMonthly < oldMonthly) return { ok: false, error: 'lower' };
    var months = monthsInclusive(from, to);
    if (months === null) return { ok: false, error: 'month' };
    var diff = round2(newMonthly - oldMonthly);
    return { ok: true, months: months, perMonth: diff, total: round2(diff * months) };
  }

  return {
    POSTS: POSTS,
    MAX_MONTHLY: MAX_MONTHLY,
    monthIndex: monthIndex,
    monthFromIndex: monthFromIndex,
    monthsInclusive: monthsInclusive,
    hindiMonth: hindiMonth,
    formatINR: formatINR,
    parseAmount: parseAmount,
    resolveRate: resolveRate,
    calculateSalary: calculateSalary,
    calculateHike: calculateHike,
    calculateArrear: calculateArrear
  };
});
