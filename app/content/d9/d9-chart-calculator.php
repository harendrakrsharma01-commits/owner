<?php /* D9 / Navamsa Chart Calculator — article. Rule tables below are the fixed Navamsa arithmetic, not chart data. */ ?>
<section aria-labelledby="a-what">
  <h2 id="a-what">What is a D9 (Navamsa) chart?</h2>
  <p>In Vedic astrology (Jyotish) the main birth chart is the <strong>D1</strong> or <em>Rashi</em> chart: it shows which sidereal sign each planet occupied when you were born. Divisional charts (<em>vargas</em>) cut every sign into equal parts and build a new chart from those parts. The <strong>D9</strong>, called the <strong>Navamsa</strong> (“ninth part”, <em>Navmansh kundli</em> in Hindi), uses nine parts per sign. Tradition gives it more weight than any other divisional chart and reads it alongside the D1, never instead of it.</p>
  <p>This page does two separate jobs, and it helps to keep them apart:</p>
  <ul>
    <li><strong>Astronomy.</strong> Where the Sun, Moon, planets, lunar nodes and the rising degree actually were. That is measurable, and this calculator works it out from an ephemeris.</li>
    <li><strong>Tradition.</strong> What Jyotish says those placements mean. That is a cultural belief system, not a science. We summarise the usual readings and label them that way.</li>
  </ul>
</section>

<section aria-labelledby="a-how">
  <h2 id="a-how">How this D9 chart calculator works</h2>
  <ol>
    <li><strong>Birth moment.</strong> Your local date and time are converted to Universal Time with the IANA time-zone rules for your birthplace on that date, including daylight saving time and historic offsets. The UTC value used is shown under the result.</li>
    <li><strong>Tropical positions.</strong> Apparent geocentric longitudes of the Sun, Moon, Mercury, Venus, Mars, Jupiter and Saturn are calculated with Astronomy Engine, with light-time, aberration and nutation applied. The Ascendant comes from apparent sidereal time, the true obliquity of the ecliptic and your latitude and longitude. Rahu is the mean lunar node, and Ketu is exactly opposite it.</li>
    <li><strong>Sidereal conversion.</strong> The Lahiri (Chitrapaksha) ayanamsha is subtracted to get sidereal (<em>nirayana</em>) longitudes.</li>
    <li><strong>Navamsa mapping.</strong> Each longitude is converted to whole milliarcseconds, and its 3°20′ part within the sign is found by integer division. The D9 sign then follows from the classical rule below.</li>
    <li><strong>Houses.</strong> The Navamsa sign of the Ascendant becomes the D9 1st house. The following signs are the 2nd, 3rd and so on (whole-sign houses). The D1 houses are counted the same way from the D1 Ascendant.</li>
  </ol>
</section>

<section aria-labelledby="a-div">
  <h2 id="a-div">The nine divisions of a sign and the Navamsa rule</h2>
  <p>A sign is 30°. Divided by nine, each part is <strong>3°20′</strong> (3⅓°), so the zodiac holds 12 × 9 = <strong>108 Navamsas</strong>. The sign a part maps to depends on the sign’s modality:</p>
  <div class="d9-scroll">
  <table>
    <caption class="d9-sr">Starting Navamsa sign by modality</caption>
    <thead><tr><th scope="col">Modality</th><th scope="col">Signs</th><th scope="col">1st Navamsa starts from</th></tr></thead>
    <tbody>
      <tr><th scope="row">Movable (chara)</th><td>Aries, Cancer, Libra, Capricorn</td><td>the same sign</td></tr>
      <tr><th scope="row">Fixed (sthira)</th><td>Taurus, Leo, Scorpio, Aquarius</td><td>the 9th sign from it</td></tr>
      <tr><th scope="row">Dual (dvisvabhava)</th><td>Gemini, Virgo, Sagittarius, Pisces</td><td>the 5th sign from it</td></tr>
    </tbody>
  </table>
  </div>
  <p>Count forward one sign per 3°20′. Because the starting points are 0, 8 and 4 signs ahead, the sequence simply runs on around the zodiac: Aries holds Aries to Sagittarius, Taurus continues with Capricorn to Virgo, Gemini with Libra to Gemini, and so on. That is why the rule also works as <em>D9 sign = ⌊sidereal longitude ÷ 3°20′⌋ mod 12</em>. Our test suite checks that both formulations agree for all 108 Navamsas.</p>
  <div class="d9-scroll">
  <table>
    <caption>Navamsa sign for each 3°20′ part (rows: D1 sign; columns: part)</caption>
    <thead><tr><th scope="col">Sign</th><th scope="col">0°–3°20′</th><th scope="col">–6°40′</th><th scope="col">–10°</th><th scope="col">–13°20′</th><th scope="col">–16°40′</th><th scope="col">–20°</th><th scope="col">–23°20′</th><th scope="col">–26°40′</th><th scope="col">–30°</th></tr></thead>
    <tbody>
      <?php
      $s = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
      $full = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      for ($i = 0; $i < 12; $i++) {
          echo '<tr><th scope="row">' . $full[$i] . '</th>';
          for ($k = 0; $k < 9; $k++) {
              $d9 = ($i * 9 + $k) % 12;
              echo '<td>' . ($d9 === $i ? '<strong>' . $s[$d9] . ' ★</strong>' : $s[$d9]) . '</td>';
          }
          echo '</tr>';
      }
      ?>
    </tbody>
  </table>
  </div>
  <p class="d9-muted">★ = Vargottama part (the D9 sign is the same as the D1 sign). Abbreviations: Ar Aries, Ta Taurus, Ge Gemini, Cn Cancer, Le Leo, Vi Virgo, Li Libra, Sc Scorpio, Sg Sagittarius, Cp Capricorn, Aq Aquarius, Pi Pisces.</p>

  <h3>Worked arithmetic</h3>
  <p>Take a sidereal longitude of 17°45′ Leo, chosen only to show the arithmetic. Leo is a fixed sign, so its first Navamsa starts from the 9th sign from Leo, which is Aries. 17°45′ ÷ 3°20′ = 5.3, so the planet is in the 6th part (16°40′–20°). Counting six signs from Aries gives Aries, Taurus, Gemini, Cancer, Leo, <strong>Virgo</strong>. Its position inside the D9 sign is (17°45′ − 16°40′) × 9 = <strong>9°45′</strong> Virgo.</p>

  <h3>Exact boundaries</h3>
  <p>A part includes its starting degree and excludes its end. Exactly 3°20′ Aries is the 2nd Navamsa (Taurus), while 3°19′59.999″ is still the 1st. Every longitude is held as an integer number of milliarcseconds before the division, so floating-point rounding (3.3333…°) can never push a planet across a boundary. At exactly 30° a planet is at 0° of the next sign.</p>
  <p>A 3°20′ Navamsa is the same width as a Nakshatra pada, so the 108 Navamsas match the 108 padas one for one. The table therefore also shows each planet’s Nakshatra and pada. The correspondence is only positional. Nakshatra and Navamsa interpretation are separate traditions.</p>
</section>

<section aria-labelledby="a-time">
  <h2 id="a-time">Why exact birth time matters</h2>
  <p>The Ascendant turns through all twelve signs in about a day, so it crosses a 3°20′ Navamsa roughly every 10 to 20 minutes. Signs of short ascension cross faster, as do higher latitudes. The Navamsa Lagna, and with it every D9 house, can therefore change with a small difference in birth time, but only when the Ascendant is near a boundary. There is no rule that a fixed number of minutes always changes it. The Moon changes Navamsa every few hours. The other planets rarely change within a day.</p>
  <p>To make this visible, the calculator re-runs the chart 5 minutes before and after your entered time. Any placement that would change is marked with †. If your time is only approximate, choose “Approximate”. If you don’t know it at all, choose “Unknown” and you will get only the placements that are the same for the whole birth day. The calculator does not attempt birth-time rectification.</p>
</section>

<section aria-labelledby="a-lagna">
  <h2 id="a-lagna">Navamsa Lagna (D9 Ascendant)</h2>
  <p>The Navamsa Lagna is simply the Navamsa sign of the natal Ascendant degree. For example, an Ascendant at 2° of a movable sign has the same sign as its Navamsa Lagna (Vargottama Lagna), while one at 28° of the same sign falls in a different sign. Traditional readings of the D9 begin with this sign and its ruling planet. The result shows both the D1 Ascendant degree and the D9 Ascendant it maps to.</p>
</section>

<section aria-labelledby="a-varg">
  <h2 id="a-varg">Vargottama planets</h2>
  <p>A planet is <strong>Vargottama</strong> when its D1 and D9 signs are the same. Mathematically this only happens in three places: the 1st Navamsa of a movable sign (0°–3°20′), the 5th of a fixed sign (13°20′–16°40′) and the 9th of a dual sign (26°40′–30°). In traditional Vedic astrology, Vargottama is read as consistency and added strength. The calculator lists each Vargottama placement with the reason it qualifies, and the D1 vs D9 table can be filtered to show only them.</p>
</section>

<section aria-labelledby="a-d1d9">
  <h2 id="a-d1d9">D1 vs D9: reading the two charts together</h2>
  <p>Tradition compares the two charts rather than reading the D9 alone. Common comparisons are:</p>
  <ul>
    <li>whether a planet changes sign between D1 and D9, and whether it gains or loses dignity (own, exalted or debilitated sign);</li>
    <li>whether it is Vargottama;</li>
    <li>where the D1 7th-house lord falls in the D9;</li>
    <li>the D9 house each planet occupies, counted from the Navamsa Lagna.</li>
  </ul>
  <p>The comparison table and the “What tradition reads from this chart” panel give you these facts from your own chart, in plain sentences. They are built from the calculated placements and a fixed list of traditional meanings, and every sentence is generated deterministically, so the same chart always produces the same text.</p>
</section>

<section aria-labelledby="a-marriage">
  <h2 id="a-marriage">What is the D9 chart used for? Marriage, dharma and strength</h2>
  <p>In traditional Jyotish the Navamsa is associated with:</p>
  <ul>
    <li><strong>marriage and partnership</strong>: the 7th house of the D9 and its lord, Venus, and, in older texts for a woman’s chart, Jupiter;</li>
    <li><strong>dharma</strong>: the 9th-house themes that give the chart its name (the 9th part);</li>
    <li><strong>planetary strength</strong>: a planet that is well placed in the D9 is said to deliver its D1 promise more fully;</li>
    <li><strong>later life</strong>: many teachers describe the Navamsa as the “fruit” of the birth chart.</li>
  </ul>
  <p class="d9-callout">This calculator does not predict when or whom anyone will marry, and no astrological chart can do that reliably. Statements such as “you will marry at 27” or “your spouse will be a doctor” are not supported by evidence, and you won’t find them here. Please don’t base relationship, medical, financial or legal decisions on astrology.</p>
</section>

<section aria-labelledby="a-lahiri">
  <h2 id="a-lahiri">Sidereal zodiac and the Lahiri ayanamsha</h2>
  <p>Western astrology mostly uses the <strong>tropical</strong> zodiac, which starts at the March equinox. Vedic astrology uses the <strong>sidereal</strong> zodiac, which is tied to the background stars. Because of the precession of the equinoxes, the two drift apart by about 50 arcseconds a year. The gap is the <strong>ayanamsha</strong>. The <strong>Lahiri</strong> (Chitrapaksha) ayanamsha was adopted by India’s Calendar Reform Committee in the 1950s and is the standard in most Indian software and almanacs. It was about 24°13′ in 2026. We use its standard definition, the value at the 1956 reference epoch advanced by IAU 2006 precession plus nutation, and it matches the Swiss Ephemeris Lahiri value to better than one arcsecond.</p>
  <p>Other ayanamshas (Raman, Krishnamurti and others) differ by minutes to more than a degree and can move planets into different Navamsas. We offer only Lahiri because it is the one we have verified.</p>
</section>

<section aria-labelledby="a-method">
  <h2 id="a-method">Calculation methodology</h2>
  <div class="d9-scroll">
  <table>
    <caption class="d9-sr">Calculation settings</caption>
    <tbody>
      <tr><th scope="row">Ephemeris</th><td>Astronomy Engine 2.1.19 by Don Cross (MIT licence): VSOP87-based planetary series and a lunar theory from NOVAS/Chapront-style series, with IAU 2000B nutation and its own ΔT model. It is loaded from this site (no external calls).</td></tr>
      <tr><th scope="row">Verification</th><td>67 charts from 1861 to 2084 compared with Swiss Ephemeris 2.10 (Lahiri, mean node). For births up to 2026 the maximum differences were Sun 3.4″, planets ≤ 13″, Moon ≤ 5″, Ascendant 2.8″ and nodes 0.13″, all far below the 3°20′ Navamsa width. No D9 sign differed. For future dates the Moon difference grows (up to 49″ in 2084) because the ΔT extrapolations differ.</td></tr>
      <tr><th scope="row">Zodiac / ayanamsha</th><td>Sidereal, Lahiri (Chitrapaksha): 23°14′44.0″ (mean) at JD 2435553.5, advanced by IAU 2006 general precession in longitude, plus nutation in longitude (true ayanamsha).</td></tr>
      <tr><th scope="row">Planets</th><td>Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn: apparent geocentric ecliptic longitude of date. Retrograde status comes from the change in longitude over ±12 hours.</td></tr>
      <tr><th scope="row">Rahu / Ketu</th><td>Mean ascending node (Meeus eq. 47.7) plus nutation; Ketu = Rahu + 180°. Some software uses the true node, which can differ by up to about 1.5°.</td></tr>
      <tr><th scope="row">Ascendant</th><td>From apparent Greenwich sidereal time, geographic longitude (east positive), latitude and true obliquity. Births above 66° latitude are refused, because the Ascendant becomes unstable there.</td></tr>
      <tr><th scope="row">Houses</th><td>Whole-sign houses from the Ascendant of each chart (D1 and D9).</td></tr>
      <tr><th scope="row">Navamsa</th><td>Integer milliarcsecond arithmetic; part = ⌊offset in sign ÷ 12 000 000 mas⌋; D9 sign = (sign + {0, 8, 4}[modality] + part) mod 12. Position inside the D9 sign = offset inside the part × 9.</td></tr>
      <tr><th scope="row">Vargottama</th><td>D1 sign = D9 sign (planets and Ascendant).</td></tr>
      <tr><th scope="row">Karakamsha</th><td>Jaimini seven-karaka scheme: the Atmakaraka is the planet from Sun to Saturn with the greatest longitude within its sign, and the Karakamsha is its D9 sign. Eight-karaka schools, which include Rahu, may differ.</td></tr>
      <tr><th scope="row">Time</th><td>Your browser’s IANA time-zone database, with offsets to the second. Clock times skipped by daylight saving are rejected. Repeated times ask you to choose which occurrence you mean.</td></tr>
      <tr><th scope="row">Range</th><td>Births from 1800 up to the present. Before standard time zones were introduced, the database uses local mean time for the zone’s reference city. Enter coordinates and a fixed offset zone manually if your record uses a different convention.</td></tr>
      <tr><th scope="row">Version</th><td>d9-1.0.0</td></tr>
    </tbody>
  </table>
  </div>
  <p>Accuracy statement: the positions are astronomical calculations accurate to a few arcseconds for modern dates. That is far finer than the Navamsa width, but it cannot correct a birth time that is wrong. Placements near a boundary can only be as good as the time you enter.</p>
</section>

<section aria-labelledby="a-privacy">
  <h2 id="a-privacy">Privacy</h2>
  <p>The whole chart, including the place lookup, is calculated in your browser. Your date, time and place of birth are not sent to our server or to any third party, not stored and not logged. No account, email or phone number is needed. The optional name only appears on your screen. “Copy” and “Share” leave out your birth details unless you tick the box to include them, and the page address never contains them.</p>
</section>

<section aria-labelledby="a-india">
  <h2 id="a-india">Terms used in India and elsewhere</h2>
  <p>In India the chart is also searched as <em>D9 kundli</em>, <em>Navamsa kundli</em>, <em>Navamsha</em> or <em>Navmansh kundli</em> (नवांश / नवमांश कुंडली). This calculator shows the same chart in the North Indian diamond style, common in the north and west, and the South Indian fixed-sign grid, used in Tamil Nadu, Kerala, Karnataka and Andhra Pradesh. Outside India the same chart is often called a “Vedic Navamsa chart” or “9th harmonic” chart. The harmonic chart used in Western astrology is calculated differently from the traditional Navamsa, so the two are not interchangeable.</p>
</section>

<section aria-labelledby="a-limits">
  <h2 id="a-limits">Limitations</h2>
  <ul>
    <li>Only the Lahiri ayanamsha, the mean node and whole-sign houses are offered.</li>
    <li>The built-in birthplace list covers major cities. For anywhere else, use manual coordinates. Place coordinates are rounded to 0.01°, which moves the Ascendant by well under 1′.</li>
    <li>Historic time-zone data is as accurate as your browser’s database. Some local wartime or regional clock practices, especially in India before 1955, may need a manual offset.</li>
    <li>Interpretation text is a summary of traditional readings, not a consultation, and it makes no predictions.</li>
  </ul>
</section>
