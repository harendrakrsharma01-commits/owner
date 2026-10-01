<?php
/** @var array $cfg @var array $t @var string $lang @var array $L @var FractionPage $view */
$e = [FractionPage::class, 'e'];
$ver = $e($cfg['site']['asset_ver']);
$client = $cfg['client'] + [
    'lang' => $lang,
    'decimalComma' => !empty($t['decimalComma']),
    'ui' => $t['ui'],
    'pageUrl' => $view->url(),
];
?><!doctype html>
<html lang="<?= $e($L['hreflang']) ?>" dir="<?= $e($L['dir']) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($t['title']) ?></title>
<meta name="description" content="<?= $e($t['meta']) ?>">
<link rel="canonical" href="<?= $e($view->url()) ?>">
<?php foreach ($view->alternates() as $alt): ?>
<link rel="alternate" hreflang="<?= $e($alt['hreflang']) ?>" href="<?= $e($alt['href']) ?>">
<?php endforeach; ?>
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="website">
<meta property="og:locale" content="<?= $e($L['locale']) ?>">
<meta property="og:title" content="<?= $e($t['title']) ?>">
<meta property="og:description" content="<?= $e($t['meta']) ?>">
<meta property="og:url" content="<?= $e($view->url()) ?>">
<meta property="og:site_name" content="<?= $e($cfg['site']['name']) ?>">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('ecs-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="/assets/css/fraction.css?v=<?= $ver ?>">
<script type="application/ld+json"><?= FractionPage::json($view->schema()) ?></script>
</head>
<body class="fr-body">
<a class="fr-skip" href="#fr-calc"><?= $e($t['ui']['skip']) ?></a>
<header class="fr-topbar">
  <a class="fr-brand" href="/"><?= $e($cfg['site']['name']) ?></a>
  <div class="fr-top-right">
    <nav class="fr-langs" aria-label="<?= $e($t['ui']['language']) ?>">
      <ul>
        <?php foreach ($cfg['langs'] as $code => $l): ?>
        <li><a href="<?= $e($view->path($code)) ?>" hreflang="<?= $e($l['hreflang']) ?>" lang="<?= $e($l['hreflang']) ?>"<?= $code === $lang ? ' aria-current="page"' : '' ?>><?= $e($l['native']) ?></a></li>
        <?php endforeach; ?>
      </ul>
    </nav>
    <button type="button" class="fr-theme" data-fr-theme aria-label="<?= $e($t['ui']['theme']) ?>">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>
    </button>
  </div>
</header>

<main class="fr">
  <nav class="fr-crumbs" aria-label="Breadcrumb">
    <ol>
      <li><a href="/"><?= $e($t['crumbHome']) ?></a></li>
      <li aria-current="page"><?= $e($t['h1']) ?></li>
    </ol>
  </nav>

  <section class="fr-hero">
    <div class="fr-hero-icon" aria-hidden="true"><span>a</span><i></i><span>b</span></div>
    <div>
      <p class="fr-kicker"><?= $e($t['kicker']) ?></p>
      <h1><?= $e($t['h1']) ?></h1>
      <p class="fr-lead"><?= $e($t['intro']) ?></p>
      <ul class="fr-badges">
        <?php foreach ($t['badges'] as $b): ?><li><?= $e($b) ?></li><?php endforeach; ?>
      </ul>
    </div>
  </section>

  <?php require __DIR__ . '/calculator.php'; ?>

  <article class="fr-article">
    <?php require __DIR__ . '/../../content/fraction/article-' . $lang . '.php'; ?>

    <section class="fr-faq" aria-labelledby="fr-faq-h">
      <h2 id="fr-faq-h"><?= $e($t['faqTitle']) ?></h2>
      <?php foreach ($t['faq'] as $i => $qa): ?>
      <details<?= $i === 0 ? ' open' : '' ?>>
        <summary><h3><?= $e($qa[0]) ?></h3></summary>
        <p><?= $e($qa[1]) ?></p>
      </details>
      <?php endforeach; ?>
    </section>
    <p class="fr-muted"><?= $e($t['privacy']) ?></p>
  </article>

  <aside class="fr-related" aria-labelledby="fr-rel-h">
    <h2 id="fr-rel-h"><?= $e($t['relatedTitle']) ?></h2>
    <ul>
      <?php foreach ($cfg['langs'] as $code => $l): if ($code === $lang) continue; ?>
      <li><a href="<?= $e($view->path($code)) ?>" hreflang="<?= $e($l['hreflang']) ?>"><strong lang="<?= $e($l['hreflang']) ?>"><?= $e($l['native']) ?></strong><span><?= $e($t['ui']['otherLang']) ?></span></a></li>
      <?php endforeach; ?>
      <?php foreach ($cfg['related'] as $key => $href): ?>
      <li><a href="<?= $e($href) ?>"><strong><?= $e($t['related'][$key][0]) ?></strong><span><?= $e($t['related'][$key][1]) ?></span></a></li>
      <?php endforeach; ?>
    </ul>
  </aside>
</main>

<footer class="fr-footer">
  <p>&copy; <?= $e(date('Y')) ?> <?= $e($cfg['site']['name']) ?>. <?= $e($t['ui']['footer']) ?></p>
</footer>

<script type="application/json" id="fr-config"><?= FractionPage::json($client) ?></script>
<script src="/assets/js/lib/fraction.js?v=<?= $ver ?>" defer></script>
<script src="/assets/js/fraction-ui.js?v=<?= $ver ?>" defer></script>
</body>
</html>
