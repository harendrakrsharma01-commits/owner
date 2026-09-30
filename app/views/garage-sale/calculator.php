<?php
/** @var array $cfg @var array $page @var GarageSalePage $view */
$e = [GarageSalePage::class, 'e'];
$c = $cfg['client'];
$select = function (string $id, string $attr, array $opts, string $default) use ($e) {
    echo '<select id="' . $e($id) . '" ' . $attr . '>';
    foreach ($opts as $code => $o) {
        echo '<option value="' . $e($code) . '"' . ($code === $default ? ' selected' : '') . '>' . $e($o['label']) . '</option>';
    }
    echo '</select>';
};
?>
<section class="gs-calc" id="gs-calc" aria-labelledby="gs-calc-h">
  <h2 id="gs-calc-h" class="gs-sr">Calculator</h2>
  <form class="gs-form" data-gs-form novalidate autocomplete="off">
    <div class="gs-row gs-row--main">
      <div class="gs-field">
        <label for="gs-original">What it cost new ($)</label>
        <div class="gs-money"><span aria-hidden="true">$</span><input id="gs-original" type="text" inputmode="decimal" data-gs-original placeholder="e.g. 40" aria-describedby="gs-original-help"></div>
        <small id="gs-original-help">Price you paid, or what the same item costs new today.</small>
      </div>
      <div class="gs-field">
        <label for="gs-category">Category</label>
        <?php $select('gs-category', 'data-gs-category', $c['categories'], $c['defaultCategory']); ?>
      </div>
      <div class="gs-field">
        <label for="gs-condition">Condition</label>
        <?php $select('gs-condition', 'data-gs-condition aria-describedby="gs-condition-help"', $c['conditions'], $c['defaultCondition']); ?>
        <small id="gs-condition-help" data-gs-condition-help></small>
      </div>
      <div class="gs-field">
        <label for="gs-age">Age</label>
        <?php $select('gs-age', 'data-gs-age', $c['ages'], $c['defaultAge']); ?>
      </div>
    </div>

    <fieldset class="gs-goal">
      <legend>Your goal</legend>
      <?php foreach ($c['goals'] as $code => $g): ?>
      <label class="gs-pill"><input type="radio" name="gs-goal" value="<?= $e($code) ?>" data-gs-goal<?= $code === $c['defaultGoal'] ? ' checked' : '' ?>> <span><?= $e($g['label']) ?></span></label>
      <?php endforeach; ?>
    </fieldset>

    <div class="gs-presets" role="group" aria-label="Examples">
      <button type="button" class="gs-chip" data-gs-example='{"original":"50","category":"clothing-adult","condition":"good","age":"1-3","name":"Jeans"}'>Jeans $50</button>
      <button type="button" class="gs-chip" data-gs-example='{"original":"100","category":"small-appliance","condition":"good","age":"1-3","name":"Air fryer"}'>Air fryer $100</button>
      <button type="button" class="gs-chip" data-gs-example='{"original":"500","category":"electronics","condition":"good","age":"3-5","name":"TV"}'>TV $500</button>
      <button type="button" class="gs-chip" data-gs-example='{"original":"800","category":"furniture-solid","condition":"good","age":"5-10","name":"Dresser"}'>Solid wood dresser $800</button>
      <button type="button" class="gs-chip" data-gs-example='{"original":"120","category":"tools","condition":"like-new","age":"1-3","name":"Cordless drill"}'>Drill $120</button>
    </div>
  </form>

  <div class="gs-error" role="alert" data-gs-error hidden></div>
  <div class="gs-sr" aria-live="polite" data-gs-announce></div>

  <div class="gs-results" data-gs-results hidden>
    <div class="gs-price">
      <div class="gs-price-main">
        <p class="gs-label">Sticker price</p>
        <p class="gs-big" data-r="sticker"></p>
        <p class="gs-sub" data-r="share"></p>
      </div>
      <div class="gs-price-floor">
        <p class="gs-label">Lowest to accept</p>
        <p class="gs-mid" data-r="floor"></p>
        <p class="gs-sub">Leave room to haggle</p>
      </div>
    </div>
    <p class="gs-note" data-r="typical"></p>
    <p class="gs-warn" data-r="warn" hidden></p>

    <details class="gs-work">
      <summary>How was this calculated?</summary>
      <ol data-r="work"></ol>
    </details>

    <div class="gs-add">
      <div class="gs-field gs-field--name">
        <label for="gs-name">Item name (for your list)</label>
        <input id="gs-name" type="text" maxlength="60" data-gs-name placeholder="e.g. Blue denim jacket">
      </div>
      <div class="gs-field gs-field--qty">
        <label for="gs-qty">Qty</label>
        <input id="gs-qty" type="text" inputmode="numeric" value="1" data-gs-qty>
      </div>
      <button type="button" class="gs-btn" data-gs-add>Add to price list</button>
    </div>
  </div>

  <section class="gs-list" aria-labelledby="gs-list-h">
    <h3 id="gs-list-h" class="gs-h3">Your price list</h3>
    <p class="gs-muted" data-gs-empty></p>
    <div class="gs-table-wrap" data-gs-table-wrap hidden>
      <table class="gs-table">
        <caption class="gs-sr">Items, quantities and prices</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Sticker</th><th scope="col">Lowest</th><th scope="col"><span class="gs-sr">Remove</span></th></tr></thead>
        <tbody data-gs-rows></tbody>
        <tfoot><tr><th scope="row">Total</th><td data-gs-count></td><td data-gs-total-sticker></td><td data-gs-total-floor></td><td></td></tr></tfoot>
      </table>
    </div>
    <p class="gs-summary" data-gs-summary hidden></p>
    <div class="gs-list-btns" data-gs-list-btns hidden>
      <button type="button" class="gs-btn" data-gs-print-tags>Print price tags</button>
      <button type="button" class="gs-btn gs-btn--ghost" data-gs-csv>Download CSV</button>
      <button type="button" class="gs-btn gs-btn--ghost" data-gs-copy>Copy list</button>
      <button type="button" class="gs-btn gs-btn--ghost" data-gs-clear>Clear list</button>
    </div>
    <p class="gs-muted">The list is saved only in this browser on this device.</p>
  </section>
</section>
