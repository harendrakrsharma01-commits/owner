<?php
/** @var array $cfg @var array $page @var AnganwadiPage $view */
$e = [AnganwadiPage::class, 'e'];
$c = $cfg['client'];
?>
<section class="awc-calc" id="awc-calc" aria-labelledby="awc-calc-h">
  <h2 id="awc-calc-h" class="awc-sr">कैलकुलेटर</h2>
  <form class="awc-form" data-awc-form novalidate autocomplete="off">
    <div class="awc-row awc-row--main">
      <div class="awc-field">
        <label for="awc-state">राज्य</label>
        <select id="awc-state" data-awc-state>
          <?php foreach ($c['states'] as $code => $s): ?>
          <option value="<?= $e($code) ?>"<?= $code === $c['defaultState'] ? ' selected' : '' ?>><?= $e($s['name'] . ' (' . $s['en'] . ')') ?></option>
          <?php endforeach; ?>
          <option value="other">अन्य राज्य — राशि खुद डालें</option>
        </select>
      </div>
      <div class="awc-field">
        <label for="awc-post">पद</label>
        <select id="awc-post" data-awc-post>
          <?php foreach ($c['posts'] as $code => $label): ?>
          <option value="<?= $e($code) ?>"<?= $code === $c['defaultPost'] ? ' selected' : '' ?>><?= $e($label) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="awc-field">
        <label for="awc-monthly">मासिक मानदेय (₹)</label>
        <div class="awc-money">
          <span aria-hidden="true">₹</span>
          <input id="awc-monthly" type="text" inputmode="decimal" data-awc-monthly aria-describedby="awc-rate-note" placeholder="जैसे 12000">
        </div>
        <small id="awc-rate-note" data-awc-rate-note aria-live="polite"></small>
      </div>
    </div>

    <div class="awc-row awc-row--opts">
      <label class="awc-check" data-awc-senior-wrap hidden><input type="checkbox" data-awc-senior> <span data-awc-senior-label>10 साल से ज़्यादा सेवा है</span></label>
      <div class="awc-field" data-awc-sharing-wrap hidden>
        <label for="awc-sharing">केंद्र : राज्य खर्च का अनुपात</label>
        <select id="awc-sharing" data-awc-sharing>
          <?php foreach ($c['sharing'] as $pct => $label): ?>
          <option value="<?= $e((string) $pct) ?>"><?= $e($label) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <label class="awc-check"><input type="checkbox" data-awc-pli> <span>केंद्र की प्रोत्साहन राशि (PLI) जोड़ें — कार्यकर्ता ₹<?= $e(AnganwadiPage::inr($c['centre']['pli']['worker'])) ?>, सहायिका ₹<?= $e(AnganwadiPage::inr($c['centre']['pli']['helper'])) ?></span></label>
    </div>

    <details class="awc-adv" data-awc-arrear-wrap>
      <summary><span>एरियर (बकाया) निकालें</span> <small>बढ़ा हुआ मानदेय देर से मिला हो तो</small></summary>
      <div class="awc-row awc-row--arrear">
        <div class="awc-field">
          <label for="awc-old">पुराना मासिक मानदेय (₹)</label>
          <div class="awc-money"><span aria-hidden="true">₹</span><input id="awc-old" type="text" inputmode="decimal" data-awc-old placeholder="जैसे 8000"></div>
        </div>
        <div class="awc-field">
          <label for="awc-from">नई दर किस महीने से लागू</label>
          <select id="awc-from" data-awc-from></select>
        </div>
        <div class="awc-field">
          <label for="awc-to">पुरानी दर किस महीने तक मिली</label>
          <select id="awc-to" data-awc-to></select>
        </div>
      </div>
      <p class="awc-muted">नया मानदेय ऊपर वाले "मासिक मानदेय" से लिया जाता है। दोनों महीने गिने जाते हैं — जैसे सितंबर से सितंबर = 1 महीना।</p>
    </details>

    <div class="awc-actions-row">
      <button type="button" class="awc-btn awc-btn--ghost" data-awc-reset>रीसेट</button>
    </div>
  </form>

  <div class="awc-error" role="alert" data-awc-error hidden></div>
  <div class="awc-sr" aria-live="polite" data-awc-announce></div>

  <div class="awc-results" data-awc-results hidden>
    <div class="awc-hero-result">
      <p class="awc-label" data-r="heading">मासिक मानदेय</p>
      <p class="awc-big" data-r="monthly"></p>
      <p class="awc-sub" data-r="sub"></p>
    </div>

    <div class="awc-grid" data-r="cards"></div>

    <div class="awc-box" data-r="hikeBox" hidden>
      <h3 class="awc-h3">बढ़ोतरी</h3>
      <p data-r="hike"></p>
    </div>

    <div class="awc-box awc-box--arrear" data-r="arrearBox" hidden>
      <h3 class="awc-h3">एरियर (बकाया)</h3>
      <p class="awc-arrear-n" data-r="arrearTotal"></p>
      <p data-r="arrear"></p>
    </div>

    <p class="awc-note" data-r="note"></p>
    <p class="awc-note" data-r="source"></p>

    <details class="awc-work">
      <summary>हिसाब कैसे लगा?</summary>
      <ol data-r="work"></ol>
    </details>

    <div class="awc-share">
      <button type="button" class="awc-btn" data-awc-copy>कॉपी करें</button>
      <a class="awc-btn awc-btn--wa" data-awc-wa href="https://wa.me/" target="_blank" rel="noopener">WhatsApp पर भेजें</a>
      <button type="button" class="awc-btn awc-btn--ghost" data-awc-print>प्रिंट</button>
    </div>
  </div>
</section>
