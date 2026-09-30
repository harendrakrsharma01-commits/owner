/*!
 * EasyCalculatorSmart — Garage sale pricing engine.
 * Pure, dependency-free arithmetic. No DOM, no network. Money is in dollars; results are
 * rounded to amounts that are easy to write on a sticker and make change for.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GarageSale = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isNum(n) { return typeof n === 'number' && isFinite(n); }
  function cents(n) { return Math.round(n * 100) / 100; }

  /* ---------- rounding ---------- */

  /** Price step shoppers are used to at this level: quarters, halves, dollars, fives, tens. */
  function stepFor(x) {
    if (x < 1) return 0.25;
    if (x < 5) return 0.5;
    if (x < 20) return 1;
    if (x < 100) return 5;
    return 10;
  }

  /**
   * Round to a garage-sale-friendly amount. `dir` is 'nearest' (default), 'down' or 'up'.
   * The step is chosen from the value itself, so 4.75 → 5 but 5.4 → 5 (dollar steps above $5).
   */
  function roundFriendly(x, dir) {
    if (!isNum(x) || x <= 0) return 0;
    var step = stepFor(x);
    var q = x / step, e = 1e-9;
    var n = dir === 'down' ? Math.floor(q + e) : dir === 'up' ? Math.ceil(q - e) : Math.round(q);
    return cents(n * step);
  }

  /* ---------- money ---------- */

  /** "$1,234.50", "$0.75", "$5" (cents only when needed). */
  function formatUSD(n) {
    if (!isNum(n)) return '';
    var v = cents(Math.abs(n));
    var whole = Math.floor(v), c = Math.round((v - whole) * 100);
    var s = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? '−' : '') + '$' + s + (c ? '.' + (c < 10 ? '0' : '') + c : '');
  }

  /** Accepts "40", "39.99", "$1,200", "1200.5". Returns a number or null. */
  function parseMoney(str) {
    if (isNum(str)) return str;
    if (typeof str !== 'string') return null;
    var s = str.replace(/[$,\s]/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s) && !/^\.\d{1,2}$/.test(s)) return null;
    return +s;
  }

  /* ---------- pricing ---------- */

  /** Age multiplier after category sensitivity: 0 = age never matters, 1 = table value, 1.5 = dates faster. */
  function ageFactor(base, sensitivity) {
    if (!isNum(base)) return 1;
    var s = isNum(sensitivity) ? sensitivity : 1;
    return Math.max(0.2, 1 - s * (1 - base));
  }

  /**
   * @param {object} item  {original, category, condition, age, goal}
   * @param {object} cfg   the 'client' config (categories, conditions, ages, goals, maxShare, floorShare, minPrice)
   */
  function priceItem(item, cfg) {
    if (!item || !cfg) return { ok: false, error: 'input' };
    var original = item.original;
    if (!isNum(original) || original <= 0 || original > (cfg.maxOriginal || 1e6)) return { ok: false, error: 'price' };
    var cat = cfg.categories[item.category];
    var cond = cfg.conditions[item.condition];
    var age = cfg.ages[item.age];
    var goal = cfg.goals[item.goal];
    if (!cat) return { ok: false, error: 'category' };
    if (!cond || !age || !goal) return { ok: false, error: 'option' };

    var af = ageFactor(age.factor, cat.ageSens);
    var raw = original * cat.pct * cond.factor * af * goal.factor;
    var cap = original * cfg.maxShare;
    var capped = raw > cap;
    var value = Math.min(raw, cap);
    var minPrice = Math.max(cfg.minPrice, cat.min);
    var atMin = value < minPrice;
    if (atMin) value = minPrice;
    var sticker = roundFriendly(value, 'nearest');
    if (sticker > original) sticker = roundFriendly(original, 'down') || cfg.minPrice; // never above the new price
    if (sticker < cfg.minPrice) sticker = cfg.minPrice;
    var floor = roundFriendly(sticker * cfg.floorShare, 'down');
    if (floor < cfg.minPrice) floor = cfg.minPrice;
    if (floor > sticker) floor = sticker;

    return {
      ok: true,
      sticker: sticker,
      floor: floor,
      raw: cents(raw),
      share: Math.round((sticker / original) * 1000) / 10,
      factors: { pct: cat.pct, condition: cond.factor, age: Math.round(af * 1000) / 1000, goal: goal.factor },
      capped: capped,
      atMin: atMin,
      typical: cat.typical,
      warn: cat.warn || null
    };
  }

  /** Totals for a price list: rows are {sticker, floor, qty}. */
  function summarize(rows) {
    var count = 0, sticker = 0, floor = 0;
    (rows || []).forEach(function (r) {
      var q = isNum(r.qty) && r.qty > 0 ? Math.floor(r.qty) : 1;
      if (!isNum(r.sticker) || !isNum(r.floor)) return;
      count += q; sticker += r.sticker * q; floor += r.floor * q;
    });
    return { count: count, sticker: cents(sticker), floor: cents(floor) };
  }

  /** CSV with a header row; every field quoted so names with commas or quotes survive. */
  function toCSV(rows) {
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var lines = [['Item', 'Category', 'Condition', 'Qty', 'Sticker price', 'Lowest to accept', 'Line total'].map(q).join(',')];
    (rows || []).forEach(function (r) {
      lines.push([r.name, r.categoryLabel, r.conditionLabel, r.qty, r.sticker.toFixed(2), r.floor.toFixed(2), (r.sticker * r.qty).toFixed(2)].map(q).join(','));
    });
    return lines.join('\r\n');
  }

  return {
    stepFor: stepFor,
    roundFriendly: roundFriendly,
    formatUSD: formatUSD,
    parseMoney: parseMoney,
    ageFactor: ageFactor,
    priceItem: priceItem,
    summarize: summarize,
    toCSV: toCSV
  };
});
