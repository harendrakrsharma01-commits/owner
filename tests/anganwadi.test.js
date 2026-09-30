'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const A = require('../assets/js/lib/anganwadi.js');

// The browser receives the PHP config as JSON; read it the same way so tests use the real data.
const CFG = JSON.parse(execFileSync('php', ['-r', 'echo json_encode(require $argv[1]);', path.join(__dirname, '../app/config/anganwadi.php')]));
const C = CFG.client;
const S = C.states;
const salary = (monthly, post, o = {}) => A.calculateSalary({ monthly, post, centre: C.centre, sharing: 60, ...o });

test('Indian digit grouping', () => {
  assert.equal(A.formatINR(0), '0');
  assert.equal(A.formatINR(999), '999');
  assert.equal(A.formatINR(4500), '4,500');
  assert.equal(A.formatINR(144000), '1,44,000');
  assert.equal(A.formatINR(12345678), '1,23,45,678');
  assert.equal(A.formatINR(1234.5), '1,234.50');
  assert.equal(A.formatINR(-2000), '−2,000');
});

test('amount parsing accepts commas, ₹ and Rs; rejects junk', () => {
  assert.equal(A.parseAmount('12000'), 12000);
  assert.equal(A.parseAmount('12,000'), 12000);
  assert.equal(A.parseAmount('₹ 1,44,000'), 144000);
  assert.equal(A.parseAmount('Rs. 9000'), 9000);
  assert.equal(A.parseAmount('9000.50'), 9000.5);
  assert.equal(A.parseAmount('12k'), null);
  assert.equal(A.parseAmount('-5'), null);
  assert.equal(A.parseAmount(''), null);
});

test('months: index, inclusive count, Hindi label', () => {
  assert.equal(A.monthsInclusive('2026-09', '2026-09'), 1);
  assert.equal(A.monthsInclusive('2025-10', '2025-12'), 3);
  assert.equal(A.monthsInclusive('2025-11', '2026-02'), 4);   // across a year end
  assert.equal(A.monthsInclusive('2026-09', '2026-08'), 0);   // "to" before "from"
  assert.equal(A.monthsInclusive('2026-13', '2026-12'), null);
  assert.equal(A.monthFromIndex(A.monthIndex('2018-10')), '2018-10');
  assert.equal(A.hindiMonth('2026-09'), 'सितंबर 2026');
  assert.equal(A.hindiMonth('2025-02'), 'फ़रवरी 2025');
});

test('state rates resolve from config; unconfirmed figures stay null', () => {
  assert.deepEqual(A.resolveRate(S.up, 'worker'), { amount: 12000, previous: 8000 });
  assert.deepEqual(A.resolveRate(S.up, 'helper'), { amount: 6000, previous: 4000 });
  assert.deepEqual(A.resolveRate(S.up, 'mini'), { amount: null, previous: null });
  assert.deepEqual(A.resolveRate(S.bihar, 'worker'), { amount: 9000, previous: 7000 });
  assert.deepEqual(A.resolveRate(S.mp, 'mini'), { amount: 6500, previous: 3500 });
  assert.deepEqual(A.resolveRate(S.rajasthan, 'worker'), { amount: null, previous: null });
  assert.deepEqual(A.resolveRate(null, 'worker'), { amount: null, previous: null });
});

test('Haryana pays workers by length of service', () => {
  assert.equal(A.resolveRate(S.haryana, 'worker', false).amount, 13250);
  assert.deepEqual(A.resolveRate(S.haryana, 'worker', true), { amount: 14750, previous: 14000 });
  assert.equal(A.resolveRate(S.haryana, 'helper', true).amount, 7900); // seniority only affects workers
});

test('every confirmed state has a source and at least one amount', () => {
  for (const [code, s] of Object.entries(S)) {
    assert.ok(s.sources.length > 0, code + ' has no source');
    for (const k of s.sources) assert.ok(CFG.sources[k], code + ' unknown source ' + k);
    if (s.status === 'confirmed') assert.ok(Object.values(s.rates).some((v) => v !== null), code + ' confirmed without amounts');
    else assert.ok(Object.values(s.rates).every((v) => v === null), code + ' unverified but shows an amount');
  }
});

test('UP worker ₹12,000: yearly, centre/state split', () => {
  const r = salary(12000, 'worker');
  assert.equal(r.ok, true);
  assert.equal(r.monthly, 12000);
  assert.equal(r.yearly, 144000);
  assert.equal(r.norm, 4500);
  assert.equal(r.centreShare, 2700);   // 60% of ₹4,500
  assert.equal(r.stateShare, 9300);
  assert.equal(r.topUp, 7500);
  assert.equal(r.daily, 400);
});

test('performance incentive is added and shared at the same ratio', () => {
  const w = salary(12000, 'worker', { incentive: true });
  assert.equal(w.incentive, 500); assert.equal(w.monthly, 12500); assert.equal(w.yearly, 150000);
  assert.equal(w.centreShare, 3000); assert.equal(w.stateShare, 9500);
  const h = salary(6000, 'helper', { incentive: true });
  assert.equal(h.incentive, 250); assert.equal(h.monthly, 6250);
});

test('sharing ratios 90:10 and 100:0; amount below the norm', () => {
  assert.equal(salary(10000, 'worker', { sharing: 90 }).centreShare, 4050);
  assert.equal(salary(4500, 'worker', { sharing: 100 }).stateShare, 0);
  const low = salary(2000, 'helper'); // below the ₹2,250 norm: centre share capped at the amount
  assert.equal(low.centreShare, 1200); assert.equal(low.stateShare, 800); assert.equal(low.topUp, 0);
});

test('invalid inputs are rejected, never NaN', () => {
  assert.equal(salary(0, 'worker').ok, false);
  assert.equal(salary(-100, 'worker').ok, false);
  assert.equal(salary(NaN, 'worker').ok, false);
  assert.equal(salary(250000, 'worker').ok, false);
  assert.equal(salary(9000, 'supervisor').ok, false);
});

test('hike: rupees and percent', () => {
  assert.deepEqual(A.calculateHike(8000, 12000), { perMonth: 4000, perYear: 48000, percent: 50 });
  assert.deepEqual(A.calculateHike(7000, 9000), { perMonth: 2000, perYear: 24000, percent: 28.6 });
  assert.deepEqual(A.calculateHike(14000, 14750), { perMonth: 750, perYear: 9000, percent: 5.4 });
  assert.equal(A.calculateHike(null, 9000), null);
});

test('arrear: Bihar Oct–Dec 2025 = ₹6,000; UP Sep 2026 = ₹4,000', () => {
  assert.deepEqual(A.calculateArrear(7000, 9000, '2025-10', '2025-12'), { ok: true, months: 3, perMonth: 2000, total: 6000 });
  assert.deepEqual(A.calculateArrear(8000, 12000, '2026-09', '2026-09'), { ok: true, months: 1, perMonth: 4000, total: 4000 });
  assert.deepEqual(A.calculateArrear(4000, 6000, '2026-09', '2026-09'), { ok: true, months: 1, perMonth: 2000, total: 2000 });
  assert.equal(A.calculateArrear(8000, 12000, '2026-09', '2026-08').total, 0);
  assert.equal(A.calculateArrear(9000, 7000, '2025-10', '2025-12').error, 'lower');
  assert.equal(A.calculateArrear(7000, 9000, 'Oct', '2025-12').error, 'month');
});
