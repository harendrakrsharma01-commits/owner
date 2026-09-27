<?php
/** @var array $cfg @var array $c */
$e = [D9Page::class, 'e'];
?>
<section class="d9-calc" id="d9-calc" aria-labelledby="d9-calc-h">
  <h2 id="d9-calc-h">Your birth details</h2>
  <form class="d9-form" data-d9-form novalidate autocomplete="off">
    <div class="d9-row d9-row--2">
      <div class="d9-field">
        <label for="d9-name">Name <small>(optional)</small></label>
        <input id="d9-name" type="text" maxlength="60" data-d9-name placeholder="Shown on your chart only">
      </div>
      <div class="d9-field">
        <label for="d9-gender">Gender <small>(optional, not used in the calculation)</small></label>
        <select id="d9-gender" data-d9-gender>
          <option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
        </select>
      </div>
    </div>

    <div class="d9-row d9-row--2">
      <div class="d9-field">
        <label for="d9-date">Date of birth <span aria-hidden="true">*</span></label>
        <input id="d9-date" type="date" required data-d9-date min="1800-01-01">
      </div>
      <div class="d9-field">
        <label for="d9-time">Time of birth (24-hour, local time) <span aria-hidden="true">*</span></label>
        <input id="d9-time" type="time" step="60" required data-d9-time>
      </div>
    </div>

    <fieldset class="d9-field d9-accuracy">
      <legend>How accurate is the birth time?</legend>
      <label><input type="radio" name="d9-acc" value="exact" checked> Exact (birth certificate / hospital record)</label>
      <label><input type="radio" name="d9-acc" value="approx"> Approximate</label>
      <label><input type="radio" name="d9-acc" value="unknown"> Unknown</label>
    </fieldset>
    <p class="d9-note" data-d9-acc-note hidden></p>

    <div class="d9-row">
      <div class="d9-field">
        <label for="d9-place">Birthplace <span aria-hidden="true">*</span></label>
        <input id="d9-place" type="text" list="d9-places" data-d9-place placeholder="Start typing a city, e.g. Mumbai" aria-describedby="d9-place-echo">
        <datalist id="d9-places" data-d9-placelist></datalist>
        <output id="d9-place-echo" class="d9-echo" data-d9-place-echo aria-live="polite"></output>
      </div>
    </div>

    <details class="d9-adv" data-d9-adv>
      <summary>Advanced: coordinates, time zone &amp; system</summary>
      <label class="d9-check"><input type="checkbox" data-d9-manual> Enter coordinates and time zone manually</label>
      <div class="d9-row d9-row--3">
        <div class="d9-field"><label for="d9-lat">Latitude (° north +, south −)</label><input id="d9-lat" type="number" step="0.0001" min="-66" max="66" inputmode="decimal" data-d9-lat disabled></div>
        <div class="d9-field"><label for="d9-lon">Longitude (° east +, west −)</label><input id="d9-lon" type="number" step="0.0001" min="-180" max="180" inputmode="decimal" data-d9-lon disabled></div>
        <div class="d9-field"><label for="d9-tz">Time zone (IANA)</label><select id="d9-tz" data-d9-tz disabled></select></div>
      </div>
      <dl class="d9-sys">
        <dt>Zodiac</dt><dd><?= $e($c['system']['zodiac']) ?></dd>
        <dt>Ayanamsha</dt><dd><?= $e($c['system']['ayanamsha']) ?></dd>
        <dt>Houses</dt><dd><?= $e($c['system']['houses']) ?></dd>
        <dt>Rahu / Ketu</dt><dd><?= $e($c['system']['node']) ?></dd>
        <dt>Ephemeris</dt><dd><?= $e($c['system']['engineNote']) ?></dd>
      </dl>
      <p class="d9-muted">Only the Lahiri ayanamsha is offered because it is the only one this engine has been verified against. Historic time-zone and daylight-saving rules come from your browser’s IANA time-zone database.</p>
    </details>

    <div class="d9-ambig" data-d9-ambig hidden>
      <p data-d9-ambig-text></p>
      <div class="d9-ambig-btns" data-d9-ambig-btns></div>
    </div>

    <div class="d9-actions">
      <button type="submit" class="d9-btn">Calculate D9 chart</button>
      <button type="button" class="d9-btn d9-btn--ghost" data-d9-example>Load example chart</button>
      <button type="button" class="d9-btn d9-btn--ghost" data-d9-reset>Reset</button>
    </div>
  </form>

  <div class="d9-error" role="alert" data-d9-error hidden></div>
  <div class="d9-sr" aria-live="polite" data-d9-announce></div>

  <div class="d9-results" data-d9-results hidden tabindex="-1" aria-labelledby="d9-res-h">
    <p class="d9-example-tag" data-d9-example-tag hidden>Example birth details — for demonstration only.</p>
    <div class="d9-summary">
      <p class="d9-label">Navamsa / D9 chart<span data-r="who"></span></p>
      <h2 id="d9-res-h" class="d9-big">D9 Ascendant: <span data-r="d9lagna"></span></h2>
      <p class="d9-sub" data-r="summary"></p>
      <ul class="d9-pills"><li>Ayanamsha: Lahiri</li><li>Zodiac: Sidereal</li><li>Houses: whole sign</li></ul>
    </div>
    <p class="d9-note d9-note--warn" data-r="accWarn" hidden></p>

    <section class="d9-block" aria-labelledby="d9-chart-h">
      <div class="d9-block-head">
        <h3 id="d9-chart-h" data-r="chartTitle">D9 Navamsa chart</h3>
        <div class="d9-toggles">
          <div class="d9-seg" role="group" aria-label="Chart shown">
            <button type="button" data-d9-which="d9" aria-pressed="true">D9</button>
            <button type="button" data-d9-which="d1" aria-pressed="false">D1</button>
          </div>
          <div class="d9-seg" role="group" aria-label="Chart style">
            <?php foreach ($c['chartStyles'] as $k => $label): ?>
            <button type="button" data-d9-style="<?= $e($k) ?>" aria-pressed="<?= $k === $c['defaultChartStyle'] ? 'true' : 'false' ?>"><?= $e($label) ?></button>
            <?php endforeach; ?>
          </div>
        </div>
      </div>
      <figure class="d9-figure">
        <div class="d9-svg" data-r="chart"></div>
        <figcaption data-r="legend" class="d9-legend"></figcaption>
      </figure>
      <p class="d9-sr" data-r="chartText"></p>
    </section>

    <section class="d9-block" aria-labelledby="d9-tab-h">
      <h3 id="d9-tab-h">Planet placements (D1 and D9)</h3>
      <div class="d9-table-wrap" tabindex="0" role="region" aria-labelledby="d9-tab-h">
        <table class="d9-table" data-r="table"></table>
      </div>
      <p class="d9-muted">Degrees are sidereal (Lahiri). “D9 position” is the planet’s offset inside its 3°20′ Navamsa multiplied by 9 — the standard way of expressing a position within a divisional sign. ℞ = retrograde; Rahu and Ketu (mean node) are always retrograde. † = within 5 minutes of time of a Navamsa boundary.</p>
    </section>

    <section class="d9-block" aria-labelledby="d9-varg-h">
      <h3 id="d9-varg-h">Vargottama placements</h3>
      <div data-r="varg"></div>
    </section>

    <section class="d9-block" aria-labelledby="d9-cmp-h">
      <div class="d9-block-head">
        <h3 id="d9-cmp-h">D1 vs D9 comparison</h3>
        <div class="d9-seg" role="group" aria-label="Filter comparison">
          <button type="button" data-d9-filter="all" aria-pressed="true">All planets</button>
          <button type="button" data-d9-filter="varg" aria-pressed="false">Vargottama only</button>
        </div>
      </div>
      <div class="d9-cmp" data-r="cmp"></div>
    </section>

    <section class="d9-block" aria-labelledby="d9-int-h">
      <h3 id="d9-int-h">What tradition reads from this chart</h3>
      <div data-r="interp"></div>
    </section>

    <details class="d9-block d9-prov" open>
      <summary><h3>Calculation provenance</h3></summary>
      <dl class="d9-facts" data-r="prov"></dl>
    </details>

    <div class="d9-share">
      <label class="d9-check"><input type="checkbox" data-d9-share-birth> Include birth date, time and place when copying or sharing</label>
      <div class="d9-share-btns">
        <button type="button" class="d9-btn" data-d9-copy="summary">Copy chart summary</button>
        <button type="button" class="d9-btn" data-d9-copy="table">Copy placements table</button>
        <button type="button" class="d9-btn" data-d9-share>Share</button>
        <button type="button" class="d9-btn" data-d9-print>Print</button>
      </div>
    </div>
  </div>

  <div class="d9-results" data-d9-partial hidden>
    <h3>Placements that hold for the whole birth day</h3>
    <p class="d9-muted">Without a birth time, only planets whose Navamsa sign is the same from 00:00 to 23:59 local time on that date can be given. The D9 Ascendant and D9 houses are not shown because they depend on the time.</p>
    <div class="d9-table-wrap" tabindex="0" role="region" aria-label="Whole-day placements"><table class="d9-table" data-r="partial"></table></div>
  </div>
</section>
