/*!
 * EasyCalculatorSmart — D9 / Navamsa engine (calculation version d9-1.0.0).
 *
 * No DOM, no network. Two layers:
 *  1. Pure Navamsa / sign / nakshatra arithmetic on exact integer milliarcseconds,
 *     so the 3°20' boundaries can never be blurred by floating-point error.
 *  2. Astronomy: apparent geocentric tropical longitudes from Astronomy Engine
 *     (MIT, VSOP87 / NOVAS-derived, © Don Cross), the Lahiri (Chitrapaksha) ayanamsha,
 *     the mean lunar node (Rahu) and the Ascendant from apparent sidereal time.
 *     In the browser the library is loaded as the global `Astronomy`; in Node it is required.
 *
 * Nothing here is interpretation. Interpretation text lives in app/config/d9-navamsa.php.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../vendor/astronomy-engine-2.1.19.min.js'));
  } else root.D9Navamsa = factory(root.Astronomy);
})(typeof self !== 'undefined' ? self : this, function (Astronomy) {
  'use strict';

  var VERSION = 'd9-1.0.0';
  var ENGINE = 'Astronomy Engine 2.1.19 (MIT)';

  /* ------------------------------------------------------------------
   * Constants — sign order is the only "table"; everything else is derived.
   * ------------------------------------------------------------------ */
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
    'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  // Modality of each sign: 0 movable (chara), 1 fixed (sthira), 2 dual (dvisvabhava).
  var MODALITY_NAMES = ['movable', 'fixed', 'dual'];
  // Parashara: movable signs start their Navamsas from the sign itself,
  // fixed signs from the 9th sign from it, dual signs from the 5th.
  var START_OFFSET = [0, 8, 4];

  var MAS_PER_DEG = 3600000;                  // milliarcseconds per degree
  var MAS_SIGN = 30 * MAS_PER_DEG;            // 108 000 000
  var MAS_NAVAMSA = MAS_SIGN / 9;             // 12 000 000 = exactly 3°20'
  var MAS_NAKSHATRA = MAS_NAVAMSA * 4;        // 48 000 000 = exactly 13°20'
  var MAS_CIRCLE = 360 * MAS_PER_DEG;

  var MIN_YEAR = 1800, MAX_YEAR = 2100;

  /* ---------- exact angle handling ---------- */

  /** Degrees → integer milliarcseconds in [0, 360°). Rounding to 1 mas removes float noise such as 3.3333…×3600. */
  function toMas(deg) {
    if (typeof deg !== 'number' || !isFinite(deg)) throw new RangeError('longitude must be a finite number');
    var m = Math.round(deg * MAS_PER_DEG) % MAS_CIRCLE;
    return m < 0 ? m + MAS_CIRCLE : m;
  }
  /** Exact d° m′ s″ (+ optional mas) → milliarcseconds. */
  function dmsToMas(d, m, s, mas) {
    return ((((d || 0) * 60 + (m || 0)) * 60 + (s || 0)) * 1000 + (mas || 0)) % MAS_CIRCLE;
  }
  function norm360(x) { x %= 360; return x < 0 ? x + 360 : x; }

  function modality(signIndex) { return signIndex % 3; }

  /**
   * Navamsa of a sidereal longitude. Accepts {mas} or degrees.
   * Uses the classical start-sign rule explicitly; tests prove it equals floor(lon / 3°20′) mod 12.
   */
  function navamsa(lon) {
    var mas = (lon && typeof lon === 'object') ? ((lon.mas % MAS_CIRCLE) + MAS_CIRCLE) % MAS_CIRCLE : toMas(lon);
    var sign = Math.floor(mas / MAS_SIGN);
    var inSign = mas - sign * MAS_SIGN;
    var part = Math.floor(inSign / MAS_NAVAMSA);               // 0..8
    var mod = modality(sign);
    var d9 = (sign + START_OFFSET[mod] + part) % 12;
    // Position inside the D9 sign: the offset inside the 3°20′ part, expanded ×9 (standard varga longitude).
    var d9Mas = (inSign - part * MAS_NAVAMSA) * 9;
    return {
      sign: sign, part: part + 1, modality: MODALITY_NAMES[mod],
      startSign: (sign + START_OFFSET[mod]) % 12,
      d9Sign: d9, d9InSignMas: d9Mas, d9InSignDeg: d9Mas / MAS_PER_DEG,
      absoluteIndex: Math.floor(mas / MAS_NAVAMSA),            // 0..107
      vargottama: d9 === sign
    };
  }

  function nakshatra(lon) {
    var mas = (lon && typeof lon === 'object') ? lon.mas : toMas(lon);
    var n = Math.floor(mas / MAS_NAKSHATRA);
    var pada = Math.floor((mas - n * MAS_NAKSHATRA) / MAS_NAVAMSA) + 1;
    return { index: n, name: NAKSHATRAS[n], pada: pada };
  }

  /** Degrees within the sign → "12°34′56″". Truncates (never rounds up into the next sign). */
  function formatDms(masInSign) {
    var s = Math.floor(masInSign / 1000);
    var d = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return d + '°' + (m < 10 ? '0' : '') + m + '′' + (sec < 10 ? '0' : '') + sec + '″';
  }

  function wholeSignHouse(signIndex, lagnaSign) { return ((signIndex - lagnaSign + 12) % 12) + 1; }

  /* ------------------------------------------------------------------
   * Time zones — exact to the second (historic LMT offsets have seconds).
   * ------------------------------------------------------------------ */
  function daysFromCivil(y, m, d) {
    y -= m <= 2 ? 1 : 0;
    var era = Math.floor(y / 400), yoe = y - era * 400;
    var doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
  }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function validDate(y, m, d) {
    return [y, m, d].every(function (n) { return typeof n === 'number' && Math.floor(n) === n; }) &&
      m >= 1 && m <= 12 && d >= 1 && d <= [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  }

  var fmtCache = {};
  /** 'UTC+05:30' style fixed offsets (for records kept in a non-IANA local time), else null. */
  function fixedOffset(zone) {
    var m = /^UTC([+-])(\d{2}):(\d{2})$/.exec(zone || '');
    if (!m || +m[2] > 14 || +m[3] > 59) return null;
    return (m[1] === '-' ? -1 : 1) * (+m[2] * 3600 + +m[3] * 60);
  }
  function zoneOffsetSeconds(zone, utcMs) {
    if (zone === 'UTC') return 0;
    var fx = fixedOffset(zone); if (fx !== null) return fx;
    var f = fmtCache[zone] || (fmtCache[zone] = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    }));
    var p = {};
    f.formatToParts(new Date(utcMs)).forEach(function (x) { p[x.type] = x.value; });
    var wall = daysFromCivil(+p.year, +p.month, +p.day) * 86400000 + ((+p.hour % 24) * 3600 + +p.minute * 60 + +p.second) * 1000;
    return Math.round((wall - Math.floor(utcMs / 1000) * 1000) / 1000);
  }
  function isValidZone(zone) {
    if (typeof zone !== 'string' || !zone) return false;
    if (fixedOffset(zone) !== null) return true;
    try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return true; } catch (e) { return false; }
  }

  /**
   * Local wall time in an IANA zone → UTC.
   * Returns {status:'ok'|'ambiguous'|'nonexistent', utcMs, candidates, offsetSeconds}.
   * Ambiguous (DST fall-back) and non-existent (spring-forward) times are reported, never guessed.
   */
  function localToUtc(p, zone) {
    var wall = daysFromCivil(p.y, p.m, p.d) * 86400000 + ((p.h * 3600) + p.mi * 60 + (p.s || 0)) * 1000;
    var offs = {};
    [-2, -1, 0, 1, 2].forEach(function (k) { offs[zoneOffsetSeconds(zone, wall + k * 43200000)] = 1; });
    var cands = Object.keys(offs).map(Number).map(function (o) { return wall - o * 1000; })
      .filter(function (c) { return wall - zoneOffsetSeconds(zone, c) * 1000 === c; })
      .sort(function (a, b) { return a - b; })
      .filter(function (c, i, a) { return i === 0 || c !== a[i - 1]; });
    if (!cands.length) return { status: 'nonexistent', candidates: [] };
    var res = { status: cands.length > 1 ? 'ambiguous' : 'ok', candidates: cands, utcMs: cands[0] };
    res.offsetSeconds = (wall - res.utcMs) / 1000;
    return res;
  }

  function formatOffset(sec) {
    var sgn = sec < 0 ? '−' : '+'; sec = Math.abs(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return 'UTC' + sgn + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + (s ? ':' + (s < 10 ? '0' : '') + s : '');
  }

  /* ------------------------------------------------------------------
   * Astronomy
   * ------------------------------------------------------------------ */
  var LAHIRI_T0_JD = 2435553.5;               // 1956-03-21, Indian Calendar Reform Committee reference epoch
  var LAHIRI_AT_T0 = 23.24556085;             // degrees (mean), matching Swiss Ephemeris SE_SIDM_LAHIRI to < 0.3″

  // IAU 2006 general precession in longitude p_A (arcseconds), T = Julian centuries TT from J2000.
  function precessionPA(T) { return ((((-0.0000238570 * T + 0.0000796400) * T + 1.1054348) * T + 5028.796195) * T); }

  function astroTime(utcMs) {
    if (!Astronomy) throw new Error('ephemeris library not loaded');
    return Astronomy.MakeTime(new Date(utcMs));
  }

  /** Lahiri ayanamsha in degrees: mean value and true value (mean + nutation in longitude). */
  function lahiriAyanamsha(time) {
    var T = time.tt / 36525, T0 = (LAHIRI_T0_JD - 2451545.0) / 36525;
    var mean = LAHIRI_AT_T0 + (precessionPA(T) - precessionPA(T0)) / 3600;
    var et = Astronomy.e_tilt(time);
    return { mean: mean, true: mean + et.dpsi / 3600, dpsiDeg: et.dpsi / 3600, trueObliquity: et.tobl };
  }

  /** Apparent geocentric tropical ecliptic longitude of date (light-time + aberration + nutation). */
  function tropicalLongitude(body, time) {
    if (body === 'Sun') return Astronomy.SunPosition(time).elon;
    if (body === 'Moon') {
      // EclipticGeoMoon is ecliptic of date (mean equinox + nutation); geometric Moon (light-time ~1.3 s, negligible here).
      return Astronomy.EclipticGeoMoon(time).lon;
    }
    return Astronomy.Ecliptic(Astronomy.GeoVector(body, time, true)).elon;
  }

  /** Mean ascending lunar node (Meeus, Astronomical Algorithms 2nd ed., eq. 47.7), referred to the true equinox. */
  function meanNodeTropical(time, dpsiDeg) {
    var T = time.tt / 36525;
    var om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000;
    return norm360(om + dpsiDeg);
  }

  /** Tropical Ascendant: intersection of the ecliptic with the eastern horizon. */
  function ascendantTropical(time, latDeg, lonDeg, trueObliquityDeg) {
    var gast = Astronomy.SiderealTime(time);                   // apparent Greenwich sidereal time, hours
    var ramc = norm360(gast * 15 + lonDeg) * Math.PI / 180;
    var eps = trueObliquityDeg * Math.PI / 180, phi = latDeg * Math.PI / 180;
    var asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
    return norm360(asc * 180 / Math.PI);
  }

  var BODIES = [
    { key: 'Sun', abbr: 'Su', body: 'Sun' }, { key: 'Moon', abbr: 'Mo', body: 'Moon' },
    { key: 'Mars', abbr: 'Ma', body: 'Mars' }, { key: 'Mercury', abbr: 'Me', body: 'Mercury' },
    { key: 'Jupiter', abbr: 'Ju', body: 'Jupiter' }, { key: 'Venus', abbr: 'Ve', body: 'Venus' },
    { key: 'Saturn', abbr: 'Sa', body: 'Saturn' }, { key: 'Rahu', abbr: 'Ra' }, { key: 'Ketu', abbr: 'Ke' }
  ];

  function isRetrograde(body, time) {
    if (body === 'Sun' || body === 'Moon') return false;
    var a = tropicalLongitude(body, Astronomy.MakeTime(new Date(time.date.getTime() - 43200000)));
    var b = tropicalLongitude(body, Astronomy.MakeTime(new Date(time.date.getTime() + 43200000)));
    var d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360;
    return d < 0;
  }

  function placement(key, abbr, siderealDeg, lagnaD1, extra) {
    var mas = toMas(siderealDeg);
    var nv = navamsa({ mas: mas });
    var nk = nakshatra({ mas: mas });
    var o = {
      key: key, abbr: abbr, longitude: mas / MAS_PER_DEG, mas: mas,
      d1Sign: nv.sign, d1SignName: SIGNS[nv.sign], d1InSignMas: mas - nv.sign * MAS_SIGN,
      d1Dms: formatDms(mas - nv.sign * MAS_SIGN), modality: nv.modality, navamsaPart: nv.part,
      d9Sign: nv.d9Sign, d9SignName: SIGNS[nv.d9Sign], d9InSignMas: nv.d9InSignMas, d9Dms: formatDms(nv.d9InSignMas),
      vargottama: nv.vargottama, nakshatra: nk.name, nakshatraIndex: nk.index, pada: nk.pada,
      absoluteNavamsa: nv.absoluteIndex
    };
    if (lagnaD1 !== undefined) o.d1House = wholeSignHouse(nv.sign, lagnaD1);
    // Distance to the nearest Navamsa boundary, used to warn that a small time error could change the result.
    var into = mas % MAS_NAVAMSA;
    o.boundaryMarginMas = Math.min(into, MAS_NAVAMSA - into);
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  /**
   * Full D1 + D9 chart for a UTC instant and a place.
   * @param {{utcMs:number, lat:number, lon:number}} input
   */
  function calculateChart(input) {
    var utcMs = input.utcMs, lat = input.lat, lon = input.lon;
    if (typeof utcMs !== 'number' || !isFinite(utcMs)) return fail('time');
    if (typeof lat !== 'number' || !isFinite(lat) || lat < -90 || lat > 90) return fail('lat');
    if (typeof lon !== 'number' || !isFinite(lon) || lon < -180 || lon > 180) return fail('lon');
    if (Math.abs(lat) > 66) return fail('polar');       // Ascendant is unstable/undefined near the polar circles
    var y = new Date(utcMs).getUTCFullYear();
    if (y < MIN_YEAR || y > MAX_YEAR) return fail('range');

    var time = astroTime(utcMs);
    var ay = lahiriAyanamsha(time);
    var ascTrop = ascendantTropical(time, lat, lon, ay.trueObliquity);
    var ascSid = norm360(ascTrop - ay.true);
    var lagna = placement('Ascendant', 'As', ascSid);
    var lagnaD1 = lagna.d1Sign, lagnaD9 = lagna.d9Sign;
    lagna.d1House = 1; lagna.d9House = 1;

    var planets = BODIES.map(function (b) {
      var trop, retro;
      if (b.key === 'Rahu' || b.key === 'Ketu') {
        var rahu = meanNodeTropical(time, ay.dpsiDeg);
        trop = b.key === 'Rahu' ? rahu : norm360(rahu + 180);
        retro = true;                                 // the mean node always moves backwards
      } else {
        trop = tropicalLongitude(b.body, time);
        retro = isRetrograde(b.body, time);
      }
      var p = placement(b.key, b.abbr, norm360(trop - ay.true), lagnaD1, { retrograde: retro, tropical: trop });
      p.d9House = wholeSignHouse(p.d9Sign, lagnaD9);
      return p;
    });

    // Chara Atmakaraka (7-karaka scheme, Sun..Saturn): highest degree within its sign. Karakamsha = its D9 sign.
    var seven = planets.filter(function (p) { return ['Rahu', 'Ketu'].indexOf(p.key) < 0; });
    var ak = seven.reduce(function (a, b) { return b.d1InSignMas > a.d1InSignMas ? b : a; });
    var tie = seven.filter(function (p) { return p !== ak && Math.abs(p.d1InSignMas - ak.d1InSignMas) < 1000; }).length > 0;

    return {
      ok: true, version: VERSION, engine: ENGINE, utcMs: utcMs,
      jdUt: utcMs / 86400000 + 2440587.5, jdTt: time.tt + 2451545.0, deltaTSeconds: (time.tt - time.ut) * 86400,
      ayanamsha: { name: 'Lahiri (Chitrapaksha)', meanDeg: ay.mean, trueDeg: ay.true, dms: formatDms(toMas(ay.true)) },
      obliquityDeg: ay.trueObliquity,
      lagna: lagna, planets: planets,
      d9Lagna: { sign: lagnaD9, name: SIGNS[lagnaD9] },
      vargottama: [lagna].concat(planets).filter(function (p) { return p.vargottama; }).map(function (p) { return p.key; }),
      karakamsha: { atmakaraka: ak.key, sign: ak.d9Sign, name: SIGNS[ak.d9Sign], houseFromD9Lagna: wholeSignHouse(ak.d9Sign, lagnaD9), tie: tie }
    };
  }

  function fail(code) { return { ok: false, error: code }; }

  /** Group placements by sign for chart drawing: {signIndex: [abbr...]} for D1 or D9. */
  function occupants(chart, which) {
    var out = {}; for (var i = 0; i < 12; i++) out[i] = [];
    chart.planets.forEach(function (p) { out[which === 'd1' ? p.d1Sign : p.d9Sign].push(p); });
    return out;
  }

  return {
    VERSION: VERSION, ENGINE: ENGINE, SIGNS: SIGNS, NAKSHATRAS: NAKSHATRAS, MODALITY_NAMES: MODALITY_NAMES,
    MAS_NAVAMSA: MAS_NAVAMSA, MAS_SIGN: MAS_SIGN, MAS_PER_DEG: MAS_PER_DEG, MIN_YEAR: MIN_YEAR, MAX_YEAR: MAX_YEAR,
    toMas: toMas, dmsToMas: dmsToMas, navamsa: navamsa, nakshatra: nakshatra, formatDms: formatDms,
    wholeSignHouse: wholeSignHouse, modality: modality,
    validDate: validDate, isValidZone: isValidZone, localToUtc: localToUtc, zoneOffsetSeconds: zoneOffsetSeconds,
    formatOffset: formatOffset, lahiriAyanamsha: lahiriAyanamsha, calculateChart: calculateChart, occupants: occupants,
    _internal: { tropicalLongitude: tropicalLongitude, meanNodeTropical: meanNodeTropical, ascendantTropical: ascendantTropical, astroTime: astroTime }
  };
});
