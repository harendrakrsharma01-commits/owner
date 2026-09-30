<?php
/** Main article — Garage Sale Pricing Calculator. The category table is rendered from app/config/garage-sale.php. */
/** @var array $cfg */
$e = [GarageSalePage::class, 'e'];
$c = $cfg['client'];
$pct = fn ($x) => rtrim(rtrim(number_format($x * 100, 1), '0'), '.') . '%';
?>
<section aria-labelledby="a-what">
  <h2 id="a-what">What this garage sale price calculator does</h2>
  <p>Pricing is the slowest part of getting ready for a garage sale. Guides agree on the rule of thumb — most used items sell for roughly <strong>10–30% of what they cost new</strong> — but applying it item by item, then adjusting for condition and age and rounding to something you can make change for, takes time.</p>
  <p>This calculator does those steps for you. Enter what an item cost new, choose its category, condition and age, and it returns:</p>
  <ul>
    <li><strong>a sticker price</strong>, rounded to amounts shoppers expect ($0.25, $0.50, $1, $5, $10 steps);</li>
    <li><strong>the lowest price to accept</strong> when someone haggles;</li>
    <li>the <strong>typical range</strong> buyers see for that category, so you can sanity-check the number.</li>
  </ul>
  <p>Add each item to the <strong>price list</strong> to see how much the whole sale could bring in, then print price tags or download the list as a spreadsheet. The same method works for a yard sale, moving sale, rummage sale or estate-style clear-out.</p>
</section>

<section aria-labelledby="a-how">
  <h2 id="a-how">How the price is worked out</h2>
  <p class="gs-formula">Sticker price = cost new × category % × condition × age × goal, rounded to a friendly amount</p>
  <ol>
    <li><strong>Category %</strong> — the starting share of the new price for an item in good condition (table below).</li>
    <li><strong>Condition</strong> — new with tags ×2, like new ×1.4, good ×1, fair ×0.6, poor / for parts ×0.3.</li>
    <li><strong>Age</strong> — less than a year ×1, 1–3 years ×0.9, 3–5 years ×0.8, 5–10 years ×0.65, over 10 years ×0.5. Electronics date faster (the age effect is 1.5 times stronger); books and costume jewelry don’t lose value with age; clothing, tools and solid furniture lose it at half the rate.</li>
    <li><strong>Goal</strong> — “sell fast” ×0.75, balanced ×1, “top dollar” ×1.25.</li>
    <li><strong>Limits</strong> — never more than half the new price, never less than the category minimum (or 25¢), and never above what the item cost new.</li>
    <li><strong>Rounding</strong> — under $1 to the nearest quarter, $1–$5 to the nearest 50¢, $5–$20 to the nearest dollar, $20–$100 to the nearest $5 and above that to the nearest $10.</li>
    <li><strong>Lowest to accept</strong> — 70% of the sticker price, rounded down. That matches the common advice to mark items 25–50% above your bottom line.</li>
  </ol>
  <div class="gs-callout">
    <p><strong>Worked example.</strong> A solid wood dresser bought for $800, good condition, 5–10 years old, balanced goal:</p>
    <ul>
      <li>$800 × 30% (solid furniture) = $240</li>
      <li>× 1 (good) × 0.825 (age 5–10 years at half sensitivity) × 1 (balanced) = $198</li>
      <li>Rounded to the nearest $10 → <strong>sticker price $200</strong>; lowest to accept $200 × 0.7 = $140</li>
    </ul>
  </div>
</section>

<section aria-labelledby="a-cats">
  <h2 id="a-cats">Garage sale pricing guide by category</h2>
  <p>The starting percentages come from published garage sale pricing guides (listed under Sources). “Typical” is what shoppers commonly expect to pay.</p>
  <div class="gs-scroll">
  <table>
    <caption class="gs-sr">Starting share of the new price and typical garage sale prices by category</caption>
    <thead><tr><th scope="col">Category</th><th scope="col">Good condition</th><th scope="col">Minimum</th><th scope="col">Typical price</th></tr></thead>
    <tbody>
      <?php foreach ($c['categories'] as $cat): ?>
      <tr><th scope="row"><?= $e($cat['label']) ?></th><td><?= $e($pct($cat['pct'])) ?> of new</td><td>$<?= $e(rtrim(rtrim(number_format($cat['min'], 2), '0'), '.')) ?></td><td><?= $e($cat['typical']) ?></td></tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  </div>
</section>

<section aria-labelledby="a-cond">
  <h2 id="a-cond">How to judge condition</h2>
  <ul>
    <?php foreach ($c['conditions'] as $cond): ?>
    <li><strong><?= $e($cond['label']) ?></strong> — <?= $e($cond['hint']) ?></li>
    <?php endforeach; ?>
  </ul>
  <p>Be honest: a shopper who finds a hidden stain or a missing part will walk away or offer far less. Test anything that plugs in and put batteries in toys so buyers can see them work — working electronics sell for much more than “untested” ones.</p>
</section>

<section aria-labelledby="a-tips">
  <h2 id="a-tips">Garage sale pricing tips</h2>
  <ul>
    <li><strong>Price everything.</strong> Many shoppers won’t ask. Stickers also make checkout faster when it gets busy.</li>
    <li><strong>Use round numbers.</strong> Quarters and whole dollars mean less change and quicker sales. Have plenty of $1 bills and quarters.</li>
    <li><strong>Bundle the small stuff.</strong> “Any book 50¢, 3 for $1”, “dishes $5 for the box” or a “fill a bag for $5” deal in the last hour clears low-value items.</li>
    <li><strong>Leave room to haggle</strong> on bigger items, and decide your lowest price before the sale starts — this calculator gives you both numbers.</li>
    <li><strong>Discount late in the day.</strong> Half price in the last hours beats hauling things back inside or to the donation center.</li>
    <li><strong>Look up anything that might be valuable.</strong> Vintage items, collectibles, designer goods and real jewelry can be worth far more than a percentage of their original price; check recently sold listings or get an appraisal.</li>
    <li><strong>Don’t sell unsafe items.</strong> Check the U.S. Consumer Product Safety Commission recall list at cpsc.gov/Recalls — selling recalled products is illegal, including at yard sales. Be cautious with used car seats (check nhtsa.gov/recalls), cribs and helmets.</li>
  </ul>
</section>

<section aria-labelledby="a-limits">
  <h2 id="a-limits">Limitations</h2>
  <p>Suggested prices are estimates for typical U.S. garage and yard sales. Neighborhood, season, brand and demand all move real prices: kids’ gear sells well in family areas, tools and outdoor equipment in spring, and popular brands above the average. Treat the result as a starting point and trust what your buyers tell you — if things fly off the table in the first hour, your prices were too low; if nothing moves by midday, drop them.</p>
  <p>Everything is calculated in your browser. The price list is stored only on this device, and nothing you type is sent to a server.</p>
</section>
