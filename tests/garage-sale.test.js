'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const G = require('../assets/js/lib/garage-sale.js');

// Use the real config the browser receives.
const CFG = JSON.parse(execFileSync('php', ['-r', 'echo json_encode(require $argv[1]);', path.join(__dirname, '../app/config/garage-sale.php')]));
const C = CFG.client;
const price = (original, category, o = {}) => G.priceItem({ original, category, condition: 'good', age: '1-3', goal: 'balanced', ...o }, C);

test('friendly rounding steps', () => {
  assert.equal(G.roundFriendly(0.6), 0.5);
  assert.equal(G.roundFriendly(0.64), 0.75);
  assert.equal(G.roundFriendly(1.2), 1);
  assert.equal(G.roundFriendly(4.75), 5);
  assert.equal(G.roundFriendly(5.4), 5);
  assert.equal(G.roundFriendly(9.6), 10);
  assert.equal(G.roundFriendly(28.5), 30);
  assert.equal(G.roundFriendly(87.5), 90);
  assert.equal(G.roundFriendly(198), 200);
  assert.equal(G.roundFriendly(3.9, 'down'), 3.5);
  assert.equal(G.roundFriendly(139.9, 'down'), 130);
  assert.equal(G.roundFriendly(1.01, 'up'), 1.5);
  assert.equal(G.roundFriendly(0), 0);
  assert.equal(G.roundFriendly(-3), 0);
});

test('USD formatting and parsing', () => {
  assert.equal(G.formatUSD(5), '$5');
  assert.equal(G.formatUSD(0.75), '$0.75');
  assert.equal(G.formatUSD(1234.5), '$1,234.50');
  assert.equal(G.parseMoney('39.99'), 39.99);
  assert.equal(G.parseMoney('$1,200'), 1200);
  assert.equal(G.parseMoney('.99'), 0.99);
  assert.equal(G.parseMoney('forty'), null);
  assert.equal(G.parseMoney('-5'), null);
  assert.equal(G.parseMoney('1.999'), null);
});

test('age sensitivity', () => {
  assert.equal(G.ageFactor(0.8, 0), 1);          // books: age does not matter
  assert.equal(G.ageFactor(0.8, 1), 0.8);
  assert.ok(Math.abs(G.ageFactor(0.8, 1.5) - 0.7) < 1e-9);
  assert.equal(G.ageFactor(0.5, 1.5), 0.25);
  assert.equal(G.ageFactor(0.1, 1.5), 0.2);       // never below 20%
});

test('every category, condition, age and goal produces a sane price', () => {
  for (const cat of Object.keys(C.categories)) for (const condition of Object.keys(C.conditions))
    for (const age of Object.keys(C.ages)) for (const goal of Object.keys(C.goals)) for (const original of [0.5, 3, 25, 400, 5000]) {
      const r = G.priceItem({ original, category: cat, condition, age, goal }, C);
      assert.equal(r.ok, true);
      assert.ok(r.sticker >= C.minPrice && r.floor >= C.minPrice, `${cat} ${original}: below min`);
      assert.ok(r.floor <= r.sticker, `${cat} ${original}: floor above sticker`);
      assert.ok(r.sticker <= Math.max(original, C.minPrice), `${cat} ${original}: sticker above new price`);
      assert.ok(Number.isFinite(r.share));
    }
});

test('reference items match the published guides', () => {
  assert.equal(price(50, 'clothing-adult').sticker, 5);                                  // guides: $2–$5
  assert.equal(price(20, 'clothing-kids').sticker, 2);                                   // $0.25–$3
  assert.equal(price(28, 'books', { age: '3-5' }).sticker, 1.5);                          // hardcover $1–$2
  assert.equal(price(100, 'small-appliance').sticker, 9);                                // $3–$15 if working
  assert.equal(price(500, 'electronics', { age: '3-5' }).sticker, 90);                    // 20–30% of retail, older
  assert.equal(price(800, 'furniture-solid', { age: '5-10' }).sticker, 200);              // ≤ one third
  assert.equal(price(80, 'furniture-basic', { age: '3-5' }).sticker, 10);
  assert.equal(price(100, 'tools').sticker, 30);
  assert.equal(price(5, 'kitchen').sticker, 0.5);                                        // $0.25–$1
});

test('condition and goal move the price the right way', () => {
  const good = price(60, 'toys').sticker;
  assert.ok(price(60, 'toys', { condition: 'like-new' }).sticker > good);
  assert.ok(price(60, 'toys', { condition: 'fair' }).sticker < good);
  assert.ok(price(60, 'toys', { goal: 'fast' }).sticker < good);
  assert.ok(price(60, 'toys', { goal: 'top' }).sticker > good);
});

test('cap at half the new price; minimum per category', () => {
  const r = price(1000, 'furniture-solid', { condition: 'new', age: '0-1', goal: 'top' }); // 1000 × .3 × 2 × 1.25 = 750
  assert.equal(r.capped, true);
  assert.equal(r.sticker, 500);
  const m = price(2, 'furniture-basic');   // $0.30 raw → $5 category minimum, but never above the new price
  assert.equal(m.sticker, 2);
  const b = price(4, 'books');              // $0.20 raw → $0.25 minimum
  assert.equal(b.atMin, true); assert.equal(b.sticker, 0.25); assert.equal(b.floor, 0.25);
});

test('lowest price to accept is about 30% under the sticker, rounded down', () => {
  assert.equal(price(100, 'tools').floor, 20);      // $30 × 0.7 = $21 → rounded down to $20
  assert.equal(price(50, 'clothing-adult').floor, 3.5);
  assert.equal(price(800, 'furniture-solid', { age: '5-10' }).floor, 140);
});

test('invalid input never yields NaN', () => {
  assert.equal(price(0, 'toys').error, 'price');
  assert.equal(price(-10, 'toys').error, 'price');
  assert.equal(price(NaN, 'toys').error, 'price');
  assert.equal(price(1e7, 'toys').error, 'price');
  assert.equal(price(10, 'spaceships').error, 'category');
  assert.equal(G.priceItem({ original: 10, category: 'toys', condition: 'mint', age: '1-3', goal: 'balanced' }, C).error, 'option');
});

test('price list totals and CSV', () => {
  const rows = [
    { name: 'Jeans, "501"', categoryLabel: 'Clothing — adult', conditionLabel: 'Good', qty: 3, sticker: 5, floor: 3.5 },
    { name: 'Drill', categoryLabel: 'Tools & garden', conditionLabel: 'Good', qty: 1, sticker: 30, floor: 20 },
  ];
  assert.deepEqual(G.summarize(rows), { count: 4, sticker: 45, floor: 30.5 });
  assert.deepEqual(G.summarize([]), { count: 0, sticker: 0, floor: 0 });
  const csv = G.toCSV(rows).split('\r\n');
  assert.equal(csv.length, 3);
  assert.equal(csv[1], '"Jeans, ""501""","Clothing — adult","Good","3","5.00","3.50","15.00"');
});
