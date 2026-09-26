<?php
/** @var array $cfg @var array $page @var string $slug @var AgeDobPage $view */
$e = [AgeDobPage::class, 'e'];
$ver = $e($cfg['site']['asset_ver']);
$icons = [
    'calendar' => '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15.5" r="2"/>',
    'cake'     => '<path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0"/><path d="M12 12V8M12 5.5c-.8-.9-.8-1.8 0-2.5.8.7.8 1.6 0 2.5z"/>',
    'weekday'  => '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7 14h2M11 14h2M15 14h2M7 17.5h2"/><rect x="10.5" y="16.5" width="3" height="2.5" rx=".6"/>',
    'flag'     => '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/><path d="M3 21h6"/>',
];
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
<link rel="stylesheet" href="/assets/css/age-dob.css?v=<?= $ver ?>">
<script type="application/ld+json"><?= AgeDobPage::json($view->schema()) ?></script>
</head>
<body class="adob-body">
<a class="adob-skip" href="#adob-calc">Skip to calculator</a>
<header class="adob-topbar">
  <a class="adob-brand" href="/"><?= $e($cfg['site']['name']) ?></a>
  <button type="button" class="adob-theme" data-adob-theme aria-label="Toggle dark or light theme">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>
  </button>
</header>

<main class="adob" data-mode="<?= $e($page['mode']) ?>">
  <nav class="adob-crumbs" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/date-of-birth-calculator/">Date &amp; Time</a></li>
      <li aria-current="page"><?= $e($page['h1']) ?></li>
    </ol>
  </nav>

  <section class="adob-hero">
    <div class="adob-hero-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><?= $icons[$page['icon']] ?? $icons['calendar'] ?></svg>
    </div>
    <div>
      <p class="adob-kicker"><?= $e($page['kicker']) ?></p>
      <h1><?= $e($page['h1']) ?></h1>
      <p class="adob-lead"><?= $e($page['intro']) ?></p>
      <ul class="adob-badges" aria-label="Page features">
        <li>Instant calculation</li><li>Runs in your browser</li><li>No sign-up</li><li>Leap-year aware</li>
      </ul>
    </div>
  </section>

  <?php require __DIR__ . '/calculator.php'; ?>

  <article class="adob-article">
    <?php require __DIR__ . '/../../content/age-dob/' . basename($page['article']); ?>

    <?php if (!empty($page['faq'])): ?>
    <section class="adob-faq" aria-labelledby="adob-faq-h">
      <h2 id="adob-faq-h">Frequently asked questions</h2>
      <?php foreach ($page['faq'] as $i => $qa): ?>
      <details<?= $i === 0 ? ' open' : '' ?>>
        <summary><h3><?= $e($qa[0]) ?></h3></summary>
        <p><?= $e($qa[1]) ?></p>
      </details>
      <?php endforeach; ?>
    </section>
    <?php endif; ?>

    <section class="adob-sources" aria-labelledby="adob-src-h">
      <h2 id="adob-src-h">Sources</h2>
      <ol>
        <?php foreach ($view->sources() as [$label, $href]): ?>
        <li><a href="<?= $e($href) ?>" rel="noopener" target="_blank"><?= $e($label) ?></a></li>
        <?php endforeach; ?>
      </ol>
      <p class="adob-muted">Last reviewed <?= $e(date('j F Y', strtotime($cfg['site']['updated']))) ?>. This is a date-arithmetic tool; it does not verify identity or decide eligibility for any legal, medical, insurance, education or employment purpose.</p>
    </section>
  </article>

  <aside class="adob-related" aria-labelledby="adob-rel-h">
    <h2 id="adob-rel-h">Related calculators</h2>
    <ul>
      <?php foreach ($view->related() as $r): ?>
      <li><a href="<?= $e($r['url']) ?>"><strong><?= $e($r['title']) ?></strong><span><?= $e($r['desc']) ?></span></a></li>
      <?php endforeach; ?>
    </ul>
  </aside>
</main>

<footer class="adob-footer">
  <p>&copy; <?= $e(date('Y')) ?> <?= $e($cfg['site']['name']) ?>. Calculations run locally in your browser.</p>
</footer>

<script type="application/json" id="adob-config"><?= AgeDobPage::json($cfg['client']) ?></script>
<script src="/assets/js/lib/age-dob.js?v=<?= $ver ?>" defer></script>
<script src="/assets/js/age-dob-ui.js?v=<?= $ver ?>" defer></script>
</body>
</html>
