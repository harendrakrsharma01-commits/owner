<?php
/** @var array $cfg @var array $page @var GarageSalePage $view */
$e = [GarageSalePage::class, 'e'];
$ver = $e($cfg['site']['asset_ver']);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($page['title']) ?></title>
<meta name="description" content="<?= $e($page['meta']) ?>">
<link rel="canonical" href="<?= $e($view->url()) ?>">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= $e($page['title']) ?>">
<meta property="og:description" content="<?= $e($page['meta']) ?>">
<meta property="og:url" content="<?= $e($view->url()) ?>">
<meta property="og:site_name" content="<?= $e($cfg['site']['name']) ?>">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('ecs-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="/assets/css/garage-sale.css?v=<?= $ver ?>">
<script type="application/ld+json"><?= GarageSalePage::json($view->schema()) ?></script>
</head>
<body class="gs-body">
<a class="gs-skip" href="#gs-calc">Skip to calculator</a>
<header class="gs-topbar">
  <a class="gs-brand" href="/"><?= $e($cfg['site']['name']) ?></a>
  <button type="button" class="gs-theme" data-gs-theme aria-label="Toggle dark or light theme">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>
  </button>
</header>

<main class="gs">
  <nav class="gs-crumbs" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li aria-current="page"><?= $e($page['h1']) ?></li>
    </ol>
  </nav>

  <section class="gs-hero">
    <div class="gs-hero-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z"/><circle cx="7.5" cy="7.5" r="1.6"/></svg>
    </div>
    <div>
      <p class="gs-kicker"><?= $e($page['kicker']) ?></p>
      <h1><?= $e($page['h1']) ?></h1>
      <p class="gs-lead"><?= $e($page['intro']) ?></p>
      <ul class="gs-badges" aria-label="Page features">
        <li>Instant price</li><li>Haggle floor</li><li>Price list &amp; totals</li><li>Printable tags</li>
      </ul>
    </div>
  </section>

  <?php require __DIR__ . '/calculator.php'; ?>

  <article class="gs-article">
    <?php require __DIR__ . '/../../content/garage-sale/garage-sale-pricing-calculator.php'; ?>

    <section class="gs-faq" aria-labelledby="gs-faq-h">
      <h2 id="gs-faq-h">Frequently asked questions</h2>
      <?php foreach ($page['faq'] as $i => $qa): ?>
      <details<?= $i === 0 ? ' open' : '' ?>>
        <summary><h3><?= $e($qa[0]) ?></h3></summary>
        <p><?= $e($qa[1]) ?></p>
      </details>
      <?php endforeach; ?>
    </section>

    <section class="gs-sources" aria-labelledby="gs-src-h">
      <h2 id="gs-src-h">Sources</h2>
      <ol>
        <?php foreach ($view->sources() as [$label, $href]): ?>
        <li><a href="<?= $e($href) ?>" rel="noopener" target="_blank"><?= $e($label) ?></a></li>
        <?php endforeach; ?>
      </ol>
      <p class="gs-muted">Last reviewed <?= $e(date('j F Y', strtotime($cfg['site']['updated']))) ?>. Suggested prices are estimates for typical U.S. garage and yard sales; local demand, brand and rarity can move real prices either way.</p>
    </section>
  </article>

  <aside class="gs-related" aria-labelledby="gs-rel-h">
    <h2 id="gs-rel-h">Related calculators</h2>
    <ul>
      <?php foreach ($cfg['related'] as $r): ?>
      <li><a href="<?= $e($r['url']) ?>"><strong><?= $e($r['title']) ?></strong><span><?= $e($r['desc']) ?></span></a></li>
      <?php endforeach; ?>
    </ul>
  </aside>
</main>

<footer class="gs-footer">
  <p>&copy; <?= $e(date('Y')) ?> <?= $e($cfg['site']['name']) ?>. Calculations run locally in your browser.</p>
</footer>

<div class="gs-tags" data-gs-tags aria-hidden="true"></div>

<script type="application/json" id="gs-config"><?= GarageSalePage::json($cfg['client']) ?></script>
<script src="/assets/js/lib/garage-sale.js?v=<?= $ver ?>" defer></script>
<script src="/assets/js/garage-sale-ui.js?v=<?= $ver ?>" defer></script>
</body>
</html>
