<?php
/** @var array $cfg @var array $page @var AnganwadiPage $view */
$e = [AnganwadiPage::class, 'e'];
$ver = $e($cfg['site']['asset_ver']);
?><!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($page['title']) ?></title>
<meta name="description" content="<?= $e($page['meta']) ?>">
<link rel="canonical" href="<?= $e($view->url()) ?>">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:type" content="website">
<meta property="og:locale" content="hi_IN">
<meta property="og:title" content="<?= $e($page['title']) ?>">
<meta property="og:description" content="<?= $e($page['meta']) ?>">
<meta property="og:url" content="<?= $e($view->url()) ?>">
<meta property="og:site_name" content="<?= $e($cfg['site']['name']) ?>">
<meta name="twitter:card" content="summary">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('ecs-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
<link rel="stylesheet" href="/assets/css/anganwadi.css?v=<?= $ver ?>">
<script type="application/ld+json"><?= AnganwadiPage::json($view->schema()) ?></script>
</head>
<body class="awc-body">
<a class="awc-skip" href="#awc-calc">कैलकुलेटर पर जाएँ</a>
<header class="awc-topbar">
  <a class="awc-brand" href="/"><?= $e($cfg['site']['name']) ?></a>
  <button type="button" class="awc-theme" data-awc-theme aria-label="डार्क या लाइट थीम बदलें">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>
  </button>
</header>

<main class="awc">
  <nav class="awc-crumbs" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li aria-current="page">Anganwadi Salary Calculator</li>
    </ol>
  </nav>

  <section class="awc-hero">
    <div class="awc-hero-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/><circle cx="12" cy="9.5" r="1.3"/></svg>
    </div>
    <div>
      <p class="awc-kicker"><?= $e($page['kicker']) ?></p>
      <h1><?= $e($page['h1']) ?></h1>
      <p class="awc-lead"><?= $e($page['intro']) ?></p>
      <ul class="awc-badges" aria-label="पेज की खूबियाँ">
        <li>राज्यवार राशि</li><li>एरियर कैलकुलेटर</li><li>हर राशि का स्रोत</li><li>मुफ़्त, बिना लॉग-इन</li>
      </ul>
    </div>
  </section>

  <?php require __DIR__ . '/calculator.php'; ?>

  <article class="awc-article">
    <?php require __DIR__ . '/../../content/anganwadi/anganwadi-salary-calculator.php'; ?>

    <section class="awc-faq" aria-labelledby="awc-faq-h">
      <h2 id="awc-faq-h">अक्सर पूछे जाने वाले सवाल</h2>
      <?php foreach ($page['faq'] as $i => $qa): ?>
      <details<?= $i === 0 ? ' open' : '' ?>>
        <summary><h3><?= $e($qa[0]) ?></h3></summary>
        <p><?= $e($qa[1]) ?></p>
      </details>
      <?php endforeach; ?>
    </section>

    <section class="awc-sources" aria-labelledby="awc-src-h">
      <h2 id="awc-src-h">स्रोत</h2>
      <ol>
        <?php foreach ($view->sources() as [$label, $href]): ?>
        <li><a href="<?= $e($href) ?>" rel="noopener" target="_blank"><?= $e($label) ?></a></li>
        <?php endforeach; ?>
      </ol>
      <p class="awc-muted">राशियों की आख़िरी जाँच: <?= $e(AnganwadiPage::hindiMonth(substr($cfg['site']['updated'], 0, 7))) ?> (<?= $e($cfg['site']['updated']) ?>)। यह सरकारी वेबसाइट नहीं है; भुगतान आपके राज्य के महिला एवं बाल विकास विभाग के आदेश से तय होता है।</p>
    </section>
  </article>

  <aside class="awc-related" aria-labelledby="awc-rel-h">
    <h2 id="awc-rel-h">दूसरे कैलकुलेटर</h2>
    <ul>
      <?php foreach ($cfg['related'] as $r): ?>
      <li><a href="<?= $e($r['url']) ?>"><strong><?= $e($r['title']) ?></strong><span><?= $e($r['desc']) ?></span></a></li>
      <?php endforeach; ?>
    </ul>
  </aside>
</main>

<footer class="awc-footer">
  <p>&copy; <?= $e(date('Y')) ?> <?= $e($cfg['site']['name']) ?>. हिसाब आपके ब्राउज़र में ही होता है — कोई जानकारी सर्वर पर नहीं भेजी जाती।</p>
</footer>

<script type="application/json" id="awc-config"><?= AnganwadiPage::json($cfg['client'] + ['sourceList' => array_map(fn ($s) => ['label' => $s[0], 'url' => $s[1]], $cfg['sources'])]) ?></script>
<script src="/assets/js/lib/anganwadi.js?v=<?= $ver ?>" defer></script>
<script src="/assets/js/anganwadi-ui.js?v=<?= $ver ?>" defer></script>
</body>
</html>
