<?php
/** @var array $cfg @var array $page @var AgeDobPage $view */
$e = [AgeDobPage::class, 'e'];
$mode = $page['mode'];
$c = $cfg['client'];
$showTarget = $mode !== 'weekday';
?>
<section class="adob-calc" id="adob-calc" aria-labelledby="adob-calc-h">
  <h2 id="adob-calc-h" class="adob-sr">Calculator</h2>
  <form class="adob-form" data-adob-form novalidate autocomplete="off">
    <div class="adob-row adob-row--dates">
      <div class="adob-field adob-date" data-adob-date="dob">
        <label for="adob-dob">Date of birth</label>
        <div class="adob-date-wrap">
          <input id="adob-dob" type="text" inputmode="numeric" data-adob-text aria-describedby="adob-dob-echo" required>
          <span class="adob-picker">
            <input type="date" data-adob-picker min="0001-01-01" max="9999-12-31" aria-label="Pick date of birth from calendar" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          </span>
        </div>
        <output id="adob-dob-echo" class="adob-echo" data-adob-echo aria-live="polite"></output>
      </div>

      <?php if ($showTarget): ?>
      <div class="adob-field adob-date" data-adob-date="target">
        <label for="adob-target" data-adob-asof-label>Age as of</label>
        <div class="adob-date-wrap">
          <input id="adob-target" type="text" inputmode="numeric" data-adob-text aria-describedby="adob-target-echo">
          <span class="adob-picker">
            <input type="date" data-adob-picker min="0001-01-01" max="9999-12-31" aria-label="Pick the as-of date from calendar" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          </span>
        </div>
        <output id="adob-target-echo" class="adob-echo" data-adob-echo aria-live="polite"></output>
      </div>
      <?php endif; ?>
    </div>

    <div class="adob-row adob-row--settings">
      <div class="adob-field">
        <label for="adob-country">Country / region</label>
        <select id="adob-country" data-adob-country>
          <?php foreach ($c['countries'] as $code => $co): ?>
          <option value="<?= $e($code) ?>"<?= $code === $c['defaultCountry'] ? ' selected' : '' ?>><?= $e($co['label']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="adob-field">
        <label for="adob-format">Date format</label>
        <select id="adob-format" data-adob-format>
          <?php foreach ($c['formats'] as $code => $f): ?>
          <option value="<?= $e($code) ?>"<?= $code === $c['countries'][$c['defaultCountry']]['format'] ? ' selected' : '' ?>><?= $e($f['label']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="adob-field">
        <label for="adob-rule">29 Feb &amp; month-end rule</label>
        <select id="adob-rule" data-adob-rule aria-describedby="adob-rule-help">
          <option value="clamp"<?= $c['defaultRule'] === 'clamp' ? ' selected' : '' ?>>Last day of month (Feb 28)</option>
          <option value="rollover"<?= $c['defaultRule'] === 'rollover' ? ' selected' : '' ?>>Next day (Mar 1)</option>
        </select>
        <small id="adob-rule-help">Used only when a date does not exist in a month, e.g. a 29 Feb birthday in a common year.</small>
      </div>
    </div>

    <?php if ($showTarget): ?>
    <div class="adob-presets" role="group" aria-label="Quick dates and examples">
      <?php foreach ($c['presets'] as $p): ?>
      <button type="button" class="adob-chip" data-adob-preset="<?= $e($p['id']) ?>"><?= $e($p['label']) ?></button>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <div class="adob-presets" role="group" aria-label="Examples">
      <?php foreach ($c['presets'] as $p): if (empty($p['dob'])) continue; ?>
      <button type="button" class="adob-chip" data-adob-preset="<?= $e($p['id']) ?>"><?= $e($p['label']) ?></button>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if ($mode === 'full'): ?>
    <details class="adob-adv" data-adob-time-wrap>
      <summary><span>Include time of birth</span> <small>optional — for exact hours, minutes and seconds</small></summary>
      <label class="adob-check"><input type="checkbox" data-adob-time-on> Use birth time and time zone</label>
      <div class="adob-row adob-row--time">
        <div class="adob-field"><label for="adob-btime">Birth time (24-hour)</label><input id="adob-btime" type="time" step="1" value="00:00:00" data-adob-btime></div>
        <div class="adob-field"><label for="adob-bzone">Birth time zone</label><select id="adob-bzone" data-adob-bzone></select></div>
        <div class="adob-field"><label for="adob-ttime">As-of time (24-hour)</label><input id="adob-ttime" type="time" step="1" value="12:00:00" data-adob-ttime>
          <button type="button" class="adob-link" data-adob-now>Use current time</button></div>
        <div class="adob-field"><label for="adob-tzone">As-of time zone</label><select id="adob-tzone" data-adob-tzone></select></div>
      </div>
      <p class="adob-muted">If you only know the date of birth, leave this off: exact hours and seconds can’t be known without the time.</p>
    </details>
    <?php endif; ?>

    <?php if ($mode === 'milestone'): ?>
    <div class="adob-row adob-row--custom">
      <div class="adob-field">
        <label for="adob-custom">Custom milestone age</label>
        <input id="adob-custom" type="number" min="1" max="150" step="1" inputmode="numeric" data-adob-custom placeholder="e.g. 35">
      </div>
    </div>
    <?php endif; ?>

    <div class="adob-actions-row">
      <label class="adob-check"><input type="checkbox" data-adob-remember> Remember on this device</label>
      <button type="button" class="adob-btn adob-btn--ghost" data-adob-reset>Reset</button>
    </div>
  </form>

  <div class="adob-error" role="alert" data-adob-error hidden></div>
  <div class="adob-sr" aria-live="polite" data-adob-announce></div>

  <div class="adob-results" data-adob-results hidden>
    <?php if ($mode === 'full'): ?>
    <div class="adob-hero-result">
      <p class="adob-label">Exact age</p>
      <p class="adob-big" data-r="age"></p>
      <p class="adob-sub" data-r="ageLine"></p>
      <p class="adob-note" data-r="timeAge" hidden></p>
    </div>
    <h3 class="adob-h3">Total age in other units</h3>
    <div class="adob-grid" data-r="totals"></div>
    <p class="adob-note" data-r="totalsNote"></p>
    <?php endif; ?>

    <?php if ($mode === 'full' || $mode === 'birthday'): ?>
    <div class="adob-bday">
      <svg class="adob-ring" viewBox="0 0 120 120" role="img" data-r="ring" aria-label="">
        <circle cx="60" cy="60" r="52" class="adob-ring-bg"/>
        <circle cx="60" cy="60" r="52" class="adob-ring-fg" pathLength="100" stroke-dasharray="0 100" data-r="ringFg"/>
        <text x="60" y="58" text-anchor="middle" class="adob-ring-n" data-r="ringN"></text>
        <text x="60" y="76" text-anchor="middle" class="adob-ring-l" data-r="ringL"></text>
      </svg>
      <dl class="adob-facts" data-r="bday"></dl>
    </div>
    <?php endif; ?>

    <?php if ($mode === 'birthday'): ?>
    <div class="adob-table-wrap"><table class="adob-table" data-r="bdayTable"><caption>Your birthdays around the selected date</caption></table></div>
    <?php endif; ?>

    <?php if ($mode === 'full' || $mode === 'weekday'): ?>
    <div class="adob-born">
      <ol class="adob-week" data-r="week" aria-label="Weekday of birth"></ol>
      <dl class="adob-facts" data-r="born"></dl>
    </div>
    <?php endif; ?>

    <?php if ($mode === 'weekday'): ?>
    <div class="adob-table-wrap"><table class="adob-table" data-r="weekdayTable"><caption>The weekday of your next 10 birthdays</caption></table></div>
    <?php endif; ?>

    <?php if ($mode === 'full' || $mode === 'milestone'): ?>
    <h3 class="adob-h3">Age timeline</h3>
    <ol class="adob-timeline" data-r="timeline"></ol>
    <?php endif; ?>

    <?php if ($mode === 'milestone'): ?>
    <div class="adob-table-wrap"><table class="adob-table" data-r="milestoneTable"><caption>Milestone dates</caption></table></div>
    <?php endif; ?>

    <details class="adob-work">
      <summary>How was this calculated?</summary>
      <ol data-r="work"></ol>
    </details>

    <div class="adob-share">
      <label class="adob-check"><input type="checkbox" data-adob-share-dob> Include date of birth when copying or sharing</label>
      <div class="adob-share-btns">
        <button type="button" class="adob-btn" data-adob-copy>Copy result</button>
        <button type="button" class="adob-btn" data-adob-share>Share</button>
        <button type="button" class="adob-btn" data-adob-print>Print</button>
      </div>
    </div>
  </div>
</section>
