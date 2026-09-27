<?php
/** @var array $cfg @var D9Page $view */
$e = [D9Page::class, 'e'];
$p = $cfg['page'];
$c = $cfg['client'];
$ver = $e($cfg['site']['asset_ver']);
$clientJson = $c + ['places' => D9Page::places()];
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($p['title']) ?></title>
<meta name="description" content="<?= $e($p['meta']) ?>">
<link rel="canonical" href="<?= $e($view->url()) ?>">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= $e($p['title']) ?>">
<meta property="og:description" content="<?= $e($p['meta']) ?>">
<meta property="og:url" content="<?= $e($view->url()) ?>">
<meta property="og:site_name" content="<?= $e($cfg['site']['name']) ?>">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('ecs-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="/assets/css/d9-chart.css?v=<?= $ver ?>">
<script type="application/ld+json"><?= D9Page::json($view->schema()) ?></script>
</head>
<body class="d9-body">
<a class="d9-skip" href="#d9-calc">Skip to calculator</a>
<header class="d9-topbar">
  <a class="d9-brand" href="/"><?= $e($cfg['site']['name']) ?></a>
  <button type="button" class="d9-theme" data-d9-theme aria-label="Toggle dark or light theme">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>
  </button>
</header>

<main class="d9">
  <nav class="d9-crumbs" aria-label="Breadcrumb">
    <ol>
      <?php foreach ($p['breadcrumb'] as [$name, $href]): ?>
      <li><a href="<?= $e($href) ?>"><?= $e($name) ?></a></li>
      <?php endforeach; ?>
      <li aria-current="page"><?= $e($p['h1']) ?></li>
    </ol>
  </nav>

  <section class="d9-hero">
    <div class="d9-hero-icon" aria-hidden="true">
      <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="3"/><path d="M4 4l40 40M44 4L4 44M24 4L4 24l20 20 20-20z"/></svg>
    </div>
    <div>
      <p class="d9-kicker"><?= $e($p['kicker']) ?></p>
      <h1><?= $e($p['h1']) ?></h1>
      <p class="d9-lead"><?= $e($p['intro']) ?></p>
      <ul class="d9-badges" aria-label="Calculation settings">
        <li>Sidereal zodiac</li><li>Lahiri ayanamsha</li><li>Whole-sign houses</li><li>Runs in your browser</li><li>No sign-up</li>
      </ul>
    </div>
  </section>

  <?php require __DIR__ . '/calculator.php'; ?>

  <article class="d9-article">
    <?php require __DIR__ . '/../../content/d9/d9-chart-calculator.php'; ?>

    <section class="d9-faq" aria-labelledby="d9-faq-h">
      <h2 id="d9-faq-h">Frequently asked questions</h2>
      <?php foreach ($cfg['faq'] as $i => $qa): ?>
      <details<?= $i === 0 ? ' open' : '' ?>>
        <summary><h3><?= $e($qa[0]) ?></h3></summary>
        <p><?= $e($qa[1]) ?></p>
      </details>
      <?php endforeach; ?>
    </section>

    <section class="d9-sources" aria-labelledby="d9-src-h">
      <h2 id="d9-src-h">Sources</h2>
      <ol>
        <?php foreach ($cfg['sources'] as [$label, $href]): ?>
        <li><a href="<?= $e($href) ?>" rel="noopener" target="_blank"><?= $e($label) ?></a></li>
        <?php endforeach; ?>
      </ol>
      <p class="d9-muted">Last reviewed <?= $e(date('j F Y', strtotime($cfg['site']['updated']))) ?>. Planet positions are astronomical calculations. Astrological meanings are traditional interpretations, not scientific findings, and nothing on this page is a prediction or professional advice.</p>
    </section>
  </article>

  <aside class="d9-related" aria-labelledby="d9-rel-h">
    <h2 id="d9-rel-h">Related calculators</h2>
    <ul>
      <?php foreach ($view->related() as [$title, $url, $desc]): ?>
      <li><a href="<?= $e($url) ?>"><strong><?= $e($title) ?></strong><span><?= $e($desc) ?></span></a></li>
      <?php endforeach; ?>
    </ul>
  </aside>
</main>

<footer class="d9-footer">
  <p>&copy; <?= $e(date('Y')) ?> <?= $e($cfg['site']['name']) ?>. Charts are calculated locally in your browser; birth details are not sent to our server.</p>
</footer>

<script type="application/json" id="d9-config"><?= D9Page::json($clientJson) ?></script>
<script src="/assets/js/vendor/astronomy-engine-2.1.19.min.js" defer></script>
<script src="/assets/js/lib/d9-navamsa.js?v=<?= $ver ?>" defer></script>
<script src="/assets/js/calculators/d9-chart.js?v=<?= $ver ?>" defer></script>
</body>
</html>
