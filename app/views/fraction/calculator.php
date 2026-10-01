<?php
/** @var array $cfg @var array $t @var string $lang @var FractionPage $view */
$e = [FractionPage::class, 'e'];
$u = $t['ui'];
$c = $cfg['client'];

/** One stacked fraction input: optional whole part, numerator over denominator. */
$frac = function (string $id, string $label, bool $whole = true, array $val = []) use ($e, $u) {
    ?>
    <fieldset class="fr-in" data-fr-frac="<?= $e($id) ?>">
      <legend><?= $e($label) ?></legend>
      <div class="fr-in-row" dir="ltr">
        <?php if ($whole): ?>
        <label class="fr-in-whole"><span class="fr-sr"><?= $e($label . ' — ' . $u['whole']) ?></span>
          <input type="text" inputmode="numeric" autocomplete="off" data-part="w" placeholder="<?= $e($u['wholeShort']) ?>" value="<?= $e($val['w'] ?? '') ?>"></label>
        <?php endif; ?>
        <span class="fr-in-stack">
          <label><span class="fr-sr"><?= $e($label . ' — ' . $u['num']) ?></span>
            <input type="text" inputmode="numeric" autocomplete="off" data-part="n" placeholder="<?= $e($u['numShort']) ?>" value="<?= $e($val['n'] ?? '') ?>"></label>
          <span class="fr-in-bar" aria-hidden="true"></span>
          <label><span class="fr-sr"><?= $e($label . ' — ' . $u['den']) ?></span>
            <input type="text" inputmode="numeric" autocomplete="off" data-part="d" placeholder="<?= $e($u['denShort']) ?>" value="<?= $e($val['d'] ?? '') ?>"></label>
        </span>
      </div>
    </fieldset>
    <?php
};
$ops = ['+' => ['+', $u['opAdd']], '-' => ['−', $u['opSub']], '*' => ['×', $u['opMul']], '/' => ['÷', $u['opDiv']]];
$opGroup = function (string $name, string $selected = '+') use ($e, $u, $ops) {
    ?>
    <div class="fr-ops" role="radiogroup" aria-label="<?= $e($u['operation']) ?>">
      <?php foreach ($ops as $v => [$sym, $lbl]): ?>
      <label class="fr-op"><input type="radio" name="<?= $e($name) ?>" value="<?= $e($v) ?>"<?= $v === $selected ? ' checked' : '' ?>><span aria-hidden="true"><?= $e($sym) ?></span><span class="fr-sr"><?= $e($lbl) ?></span></label>
      <?php endforeach; ?>
    </div>
    <?php
};
$dir = function (string $name, array $opts) use ($e) {
    ?>
    <div class="fr-dir" role="radiogroup">
      <?php $i = 0; foreach ($opts as $v => $lbl): ?>
      <label class="fr-pill"><input type="radio" name="<?= $e($name) ?>" value="<?= $e($v) ?>"<?= $i++ === 0 ? ' checked' : '' ?>><span><?= $e($lbl) ?></span></label>
      <?php endforeach; ?>
    </div>
    <?php
};
$calcBtn = fn () => print('<button type="submit" class="fr-btn fr-btn--go">' . $e($u['calculate']) . '</button>');
?>
<section class="fr-calc" id="fr-calc" aria-labelledby="fr-calc-h">
  <h2 id="fr-calc-h" class="fr-sr"><?= $e($u['calculator']) ?></h2>

  <div class="fr-tabs" role="tablist" aria-label="<?= $e($u['modes']) ?>">
    <?php foreach ($c['modes'] as $i => $m): ?>
    <button type="button" role="tab" id="fr-tab-<?= $e($m) ?>" aria-controls="fr-panel-<?= $e($m) ?>" aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" tabindex="<?= $i === 0 ? '0' : '-1' ?>" data-fr-tab="<?= $e($m) ?>"><?= $e($u['m_' . $m]) ?></button>
    <?php endforeach; ?>
  </div>

  <div class="fr-grid">
    <div class="fr-panels">

      <form class="fr-panel" id="fr-panel-calc" role="tabpanel" aria-labelledby="fr-tab-calc" data-fr-panel="calc" novalidate>
        <div class="fr-eq">
          <?php $frac('calc-a', $u['fracA'], true, ['n' => '1', 'd' => '2']); ?>
          <?php $opGroup('fr-calc-op'); ?>
          <?php $frac('calc-b', $u['fracB'], true, ['n' => '1', 'd' => '3']); ?>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-multi" role="tabpanel" aria-labelledby="fr-tab-multi" data-fr-panel="multi" hidden novalidate>
        <p class="fr-hint"><?= $e($u['multiHint']) ?></p>
        <ol class="fr-rows" data-fr-rows="multi"></ol>
        <div class="fr-actions">
          <button type="button" class="fr-btn fr-btn--ghost" data-fr-add="multi">+ <?= $e($u['addRow']) ?></button>
          <?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button>
        </div>
      </form>

      <form class="fr-panel" id="fr-panel-simplify" role="tabpanel" aria-labelledby="fr-tab-simplify" data-fr-panel="simplify" hidden novalidate>
        <?php $frac('simplify-a', $u['m_simplify'], false, ['n' => '24', 'd' => '36']); ?>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-mixed" role="tabpanel" aria-labelledby="fr-tab-mixed" data-fr-panel="mixed" hidden novalidate>
        <?php $dir('fr-mixed-dir', ['toImproper' => $u['dirToImproper'], 'toMixed' => $u['dirToMixed']]); ?>
        <?php $frac('mixed-a', $u['fraction'], true, ['w' => '2', 'n' => '1', 'd' => '3']); ?>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-decimal" role="tabpanel" aria-labelledby="fr-tab-decimal" data-fr-panel="decimal" hidden novalidate>
        <?php $dir('fr-decimal-dir', ['toDec' => $u['dirFracToDec'], 'toFrac' => $u['dirDecToFrac']]); ?>
        <div data-fr-show="toDec"><?php $frac('decimal-a', $u['fraction'], true, ['n' => '3', 'd' => '8']); ?></div>
        <div class="fr-field" data-fr-show="toFrac" hidden>
          <label for="fr-dec-in"><?= $e($u['decimalInput']) ?></label>
          <input id="fr-dec-in" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-fr-text="dec" value="0.75" aria-describedby="fr-dec-help">
          <small id="fr-dec-help"><?= $e($u['decHint']) ?></small>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-percent" role="tabpanel" aria-labelledby="fr-tab-percent" data-fr-panel="percent" hidden novalidate>
        <?php $dir('fr-percent-dir', ['toPct' => $u['dirFracToPct'], 'toFrac' => $u['dirPctToFrac']]); ?>
        <div data-fr-show="toPct"><?php $frac('percent-a', $u['fraction'], true, ['n' => '3', 'd' => '4']); ?></div>
        <div class="fr-field" data-fr-show="toFrac" hidden>
          <label for="fr-pct-in"><?= $e($u['percentInput']) ?></label>
          <input id="fr-pct-in" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-fr-text="pct" value="12.5">
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-compare" role="tabpanel" aria-labelledby="fr-tab-compare" data-fr-panel="compare" hidden novalidate>
        <div class="fr-eq">
          <?php $frac('compare-a', $u['fracA'], true, ['n' => '2', 'd' => '3']); ?>
          <span class="fr-vs" aria-hidden="true">?</span>
          <?php $frac('compare-b', $u['fracB'], true, ['n' => '3', 'd' => '5']); ?>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-order" role="tabpanel" aria-labelledby="fr-tab-order" data-fr-panel="order" hidden novalidate>
        <p class="fr-hint"><?= $e($u['orderHint']) ?></p>
        <ol class="fr-rows fr-rows--order" data-fr-rows="order"></ol>
        <div class="fr-actions">
          <button type="button" class="fr-btn fr-btn--ghost" data-fr-add="order">+ <?= $e($u['addRow']) ?></button>
          <?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button>
        </div>
      </form>

      <form class="fr-panel" id="fr-panel-of" role="tabpanel" aria-labelledby="fr-tab-of" data-fr-panel="of" hidden novalidate>
        <div class="fr-eq">
          <?php $frac('of-a', $u['fraction'], true, ['n' => '3', 'd' => '4']); ?>
          <span class="fr-word"><?= $e($u['ofWord']) ?></span>
          <div class="fr-field fr-field--num">
            <label for="fr-of-x"><?= $e($u['number']) ?></label>
            <input id="fr-of-x" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-fr-text="ofx" value="80">
          </div>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-what" role="tabpanel" aria-labelledby="fr-tab-what" data-fr-panel="what" hidden novalidate>
        <div class="fr-eq">
          <div class="fr-field fr-field--num"><label for="fr-what-x"><?= $e($u['xLabel']) ?></label>
            <input id="fr-what-x" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-fr-text="wx" value="15"></div>
          <span class="fr-word"><?= $e($u['whatOfWord']) ?></span>
          <div class="fr-field fr-field--num"><label for="fr-what-y"><?= $e($u['yLabel']) ?></label>
            <input id="fr-what-y" type="text" inputmode="decimal" autocomplete="off" dir="ltr" data-fr-text="wy" value="60"></div>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <form class="fr-panel" id="fr-panel-equiv" role="tabpanel" aria-labelledby="fr-tab-equiv" data-fr-panel="equiv" hidden novalidate>
        <div class="fr-eq">
          <?php $frac('equiv-a', $u['fraction'], false, ['n' => '1', 'd' => '2']); ?>
          <div class="fr-field fr-field--num"><label for="fr-eq-start"><?= $e($u['multStart']) ?></label>
            <input id="fr-eq-start" type="text" inputmode="numeric" autocomplete="off" dir="ltr" data-fr-text="eqs" value="1"></div>
          <div class="fr-field fr-field--num"><label for="fr-eq-count"><?= $e($u['count']) ?></label>
            <select id="fr-eq-count" data-fr-text="eqc"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div>
        </div>
        <div class="fr-actions"><?php $calcBtn(); ?><button type="button" class="fr-btn fr-btn--ghost" data-fr-reset><?= $e($u['reset']) ?></button></div>
      </form>

      <div class="fr-settings">
        <label for="fr-digits"><?= $e($u['digits']) ?></label>
        <select id="fr-digits" data-fr-digits>
          <?php foreach ($c['digits'] as $dg): ?><option value="<?= $dg ?>"<?= $dg === $c['defaultDigits'] ? ' selected' : '' ?>><?= $dg ?></option><?php endforeach; ?>
        </select>
      </div>

      <div class="fr-examples">
        <h3 class="fr-h3"><?= $e($u['examples']) ?></h3>
        <div class="fr-chips" data-fr-examples></div>
      </div>
    </div>

    <div class="fr-out" aria-labelledby="fr-out-h">
      <h3 id="fr-out-h" class="fr-h3"><?= $e($u['result']) ?></h3>
      <div class="fr-error" role="alert" data-fr-error hidden></div>
      <div class="fr-sr" aria-live="polite" data-fr-announce></div>
      <div class="fr-result" data-fr-result>
        <p class="fr-expr" data-fr-expr dir="ltr"></p>
        <div class="fr-main" data-fr-main></div>
        <dl class="fr-forms" data-fr-forms></dl>
        <div class="fr-extra" data-fr-extra></div>
        <figure class="fr-visual" data-fr-visual hidden><div class="fr-bars" data-fr-bars aria-hidden="true"></div><figcaption data-fr-vcap></figcaption></figure>
        <details class="fr-steps" open>
          <summary><?= $e($u['steps']) ?></summary>
          <ol data-fr-steps></ol>
        </details>
        <div class="fr-share">
          <button type="button" class="fr-btn" data-fr-copy><?= $e($u['copyResult']) ?></button>
          <button type="button" class="fr-btn fr-btn--ghost" data-fr-copy-steps><?= $e($u['copySteps']) ?></button>
          <button type="button" class="fr-btn fr-btn--ghost" data-fr-share><?= $e($u['share']) ?></button>
          <button type="button" class="fr-btn fr-btn--ghost" data-fr-print><?= $e($u['print']) ?></button>
        </div>
      </div>
    </div>
  </div>
</section>
