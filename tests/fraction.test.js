'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const F = require('../assets/js/lib/fraction.js');

const P = (s) => F.parseText(s);
const s = (f) => F.str(f);
const bin = (a, op, b) => s(F.binary(P(a), P(b), op).value);
const code = (fn) => { try { fn(); return 'ok'; } catch (e) { return e.code; } };

test('required reference results', () => {
  assert.equal(bin('1/2', '+', '1/3'), '5/6');
  assert.equal(bin('3/4', '-', '1/6'), '7/12');
  assert.equal(bin('2/3', '*', '3/4'), '1/2');
  assert.equal(bin('2/3', '/', '4/5'), '5/6');
  assert.equal(s(F.simplify(P('24/36')).value), '2/3');
  assert.equal(F.mixedStr(P('7/3').value), '2 1/3');
  assert.equal(s(F.decimalToFraction('0.75').value), '3/4');
  assert.equal(F.fractionToPercent(P('3/4'), 6).percent.text, '75');
  assert.equal(F.compare(P('2/3'), P('3/5')).cmp, 1);
  assert.equal(s(F.fractionOf(P('3/4'), P('80')).value), '60');
});

test('sign normalisation and canonical form', () => {
  assert.equal(s(P('1/-2').value), '-1/2');
  assert.equal(s(P('-1/-2').value), '1/2');
  assert.equal(s(P('-1/2').value), '-1/2');
  assert.equal(s(P('0/5').value), '0');
  assert.equal(s(P('5/1').value), '5');
  assert.equal(s(P('1/1').value), '1');
  assert.equal(s(P('12/18').value), '2/3');
  assert.equal(s(P('100/400').value), '1/4');
  assert.equal(s(P('999999/1000000').value), '999999/1000000');
  assert.equal(s(P('-2 1/3').value), '-7/3');
  assert.equal(s(F.fromParts('2', '1', '3').value), '7/3');
  assert.equal(s(F.fromParts('-2', '1', '3').value), '-7/3');
  assert.equal(s(F.fromParts('4', '', '').value), '4');
});

test('input errors', () => {
  assert.equal(code(() => P('1/0')), 'zero-den');
  assert.equal(code(() => F.fromParts('', '1', '')), 'den-empty');
  assert.equal(code(() => F.fromParts('', '', '')), 'empty');
  assert.equal(code(() => F.fromParts('2', '-1', '3')), 'sign-mixed');
  assert.equal(code(() => F.fromParts('', '1a', '2')), 'invalid');
  assert.equal(code(() => F.fromParts('', '1'.repeat(31), '2')), 'too-long');
  assert.equal(code(() => F.binary(P('1/2'), P('0/3'), '/')), 'div-zero');
  assert.equal(code(() => F.binary(P('1/2'), P('0'), '/')), 'div-zero');
  assert.equal(bin('0', '/', '3/4'), '0');
  assert.equal(code(() => F.parseDecimal('0.333...')), 'ellipsis');
  assert.equal(code(() => F.parseDecimal('1.2.3')), 'invalid');
  assert.equal(code(() => F.whatFraction(P('5'), P('0'))), 'y-zero');
});

test('decimals: exact conversion both ways', () => {
  assert.equal(s(F.decimalToFraction('0.125').value), '1/8');
  assert.equal(s(F.decimalToFraction('-1,25').value), '-5/4');
  assert.equal(s(F.decimalToFraction('.5').value), '1/2');
  assert.equal(s(F.decimalToFraction('0.(3)').value), '1/3');
  assert.equal(s(F.decimalToFraction('0.1(6)').value), '1/6');
  assert.equal(s(F.decimalToFraction('2.(142857)').value), '15/7');
  assert.equal(s(F.decimalToFraction('0.333333').value), '333333/1000000'); // finite input stays finite
  const third = F.toDecimal(F.make(1n, 3n), 6);
  assert.deepEqual([third.text, third.exact, third.period], ['0.333333', false, '0.(3)']);
  assert.equal(F.toDecimal(F.make(1n, 8n), 2).text, '0.13');
  assert.equal(F.toDecimal(F.make(1n, 8n), 4).text, '0.125');
  assert.equal(F.toDecimal(F.make(1n, 8n), 4).exact, true);
  assert.equal(F.toDecimal(F.make(-2n, 3n), 4).text, '-0.6667');
  assert.equal(F.toDecimal(F.make(-1n, 1000n), 2).text, '0');
  assert.equal(F.repeating(F.make(1n, 7n)), '0.(142857)');
});

test('percent both ways', () => {
  assert.equal(F.fractionToPercent(P('1/2'), 6).percent.text, '50');
  assert.equal(F.fractionToPercent(P('1/8'), 6).percent.text, '12.5');
  assert.equal(F.fractionToPercent(P('1/3'), 4).percent.text, '33.3333');
  assert.equal(s(F.percentToFraction('12.5%').value), '1/8');
  assert.equal(s(F.percentToFraction('150').value), '3/2');
});

test('mixed numbers', () => {
  assert.equal(s(F.mixedToImproper(F.fromParts('2', '1', '3')).value), '7/3');
  assert.equal(F.mixedStr(F.improperToMixed(P('22/4')).value), '5 1/2');
  assert.equal(F.mixedStr(P('-7/3').value), '-2 1/3');
  assert.equal(F.mixedStr(P('3/4').value), '3/4');
  assert.equal(bin('1 1/2', '+', '2 2/3'), '25/6');
});

test('compare, order, equivalents, what fraction', () => {
  assert.equal(F.compare(P('1/2'), P('2/4')).cmp, 0);
  assert.equal(F.compare(P('-1/2'), P('1/3')).cmp, -1);
  // values a float could confuse: 10^17/(10^17+1) vs (10^17-1)/10^17
  assert.equal(F.compare(P('100000000000000000/100000000000000001'), P('99999999999999999/100000000000000000')).cmp, 1);
  const o = F.order(['3/4', '-1/2', '2/3', '0.7', '5/8'].map(P));
  assert.deepEqual(o.asc.map((x) => s(x.f)), ['-1/2', '5/8', '2/3', '7/10', '3/4']);
  assert.deepEqual(F.equivalents(P('1/2'), 2, 3).list.map((x) => x.n + '/' + x.d), ['2/4', '3/6', '4/8']);
  assert.equal(F.equivalents(P('1/2'), 1, 500).list.length, 20); // capped output
  assert.equal(s(F.whatFraction(P('15'), P('60')).value), '1/4');
});

test('steps follow the actual numbers', () => {
  const r = F.binary(P('1/2'), P('1/3'), '+');
  assert.deepEqual(r.steps.map((x) => x.k), ['lcd', 'convert', 'convert', 'addNum', 'lowest']);
  assert.equal(r.steps[0].p.lcd, '6');
  assert.equal(r.steps[1].p.to, '3/6');
  assert.equal(r.steps[3].p.res, '5/6');
  const d = F.binary(P('2/3'), P('4/5'), '/');
  assert.deepEqual(d.steps.map((x) => x.k), ['reciprocal', 'mulNum', 'mulDen', 'simplify']);
  assert.equal(d.steps[0].p.to, '5/4');
  assert.equal(d.steps[3].p.g, '2');
  const sm = F.simplify(P('18/24'));
  assert.equal(sm.steps[0].k, 'euclid');
  assert.equal(sm.steps[0].p.g, '6');
  assert.equal(sm.steps[1].p.rn, '3');
});

test('multiple fractions follow precedence', () => {
  const ex = (list) => s(F.expression(list.map(([op, t]) => ({ op, item: P(t) }))).value);
  assert.equal(ex([[null, '1/2'], ['+', '1/3'], ['-', '1/6'], ['+', '3/8']]), '25/24');
  assert.equal(ex([[null, '1/2'], ['+', '1/3'], ['*', '3/4']]), '3/4');      // 1/2 + 1/4
  assert.equal(ex([[null, '1'], ['/', '2'], ['/', '2']]), '1/4');            // left to right
  assert.equal(ex([[null, '3/4'], ['-', '3/4']]), '0');
  assert.equal(code(() => F.expression([{ op: null, item: P('1/2') }, { op: '/', item: P('0') }])), 'div-zero');
});

test('huge integers stay exact', () => {
  const big = '123456789012345678901234567890';
  assert.equal(bin(big + '/7', '*', '7/' + big), '1');
  assert.equal(bin('1/' + big, '-', '1/' + big), '0');
});

test('random values match Python fractions.Fraction (independent reference)', () => {
  const ops = ['+', '-', '*', '/'];
  const cases = [];
  let seed = 12345;
  const rnd = (m) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m; };
  for (let i = 0; i < 400; i++) {
    const big = i % 5 === 0 ? 1e9 : 60;
    const a = [rnd(2 * big) - big, rnd(big) + 1], b = [rnd(2 * big) - big, rnd(big) + 1];
    const op = ops[i % 4];
    if (op === '/' && b[0] === 0) b[0] = 1;
    cases.push([a, op, b]);
  }
  const py = 'import json,sys\nfrom fractions import Fraction as F\nout=[]\nfor a,op,b in json.load(sys.stdin):\n x=F(a[0],a[1]);y=F(b[0],b[1])\n r={"+":x+y,"-":x-y,"*":x*y,"/":x/y}[op]\n out.append([str(r.numerator),str(r.denominator),(x>y)-(x<y)])\nprint(json.dumps(out))';
  const ref = JSON.parse(execFileSync('python3', ['-c', py], { input: JSON.stringify(cases) }));
  cases.forEach(([a, op, b], i) => {
    const r = F.binary(P(a[0] + '/' + a[1]), P(b[0] + '/' + b[1]), op).value;
    assert.equal(r.n + '/' + r.d, ref[i][0] + '/' + ref[i][1], `${a} ${op} ${b}`);
    assert.equal(F.compare(P(a[0] + '/' + a[1]), P(b[0] + '/' + b[1])).cmp, ref[i][2]);
  });
});
