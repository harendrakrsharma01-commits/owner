<?php
/**
 * Builds plain-HTML copies of the calculator pages into public/ for hosts without PHP.
 * Usage: php tools/build-static.php   → public/<slug>/index.html + public/assets/...
 */
require __DIR__ . '/../app/lib/AgeDobPage.php';
require __DIR__ . '/../app/lib/AnganwadiPage.php';
require __DIR__ . '/../app/lib/GarageSalePage.php';
require __DIR__ . '/../app/lib/FractionPage.php';
$root = dirname(__DIR__);
$out = $root . '/public';
$cfg = require $root . '/app/config/age-dob.php';
foreach (array_keys($cfg['pages']) as $slug) {
    @mkdir("$out/$slug", 0755, true);
    file_put_contents("$out/$slug/index.html", (new AgeDobPage($slug, $cfg))->render());
    echo "public/$slug/index.html\n";
}
foreach (['anganwadi' => AnganwadiPage::class, 'garage-sale' => GarageSalePage::class] as $conf => $class) {
    $slug = (require "$root/app/config/$conf.php")['page']['slug'];
    @mkdir("$out/$slug", 0755, true);
    file_put_contents("$out/$slug/index.html", (new $class())->render());
    echo "public/$slug/index.html\n";
}
// Fraction Calculator: one page per language.
$frCfg = require "$root/app/config/fraction.php";
foreach (array_keys($frCfg['langs']) as $code) {
    $page = new FractionPage($code, $frCfg);
    $dir = $out . rtrim($page->path(), '/');
    @mkdir($dir, 0755, true);
    file_put_contents("$dir/index.html", $page->render());
    echo 'public' . $page->path() . "index.html\n";
}
foreach (['assets/css/age-dob.css', 'assets/js/lib/age-dob.js', 'assets/js/age-dob-ui.js',
          'assets/css/anganwadi.css', 'assets/js/lib/anganwadi.js', 'assets/js/anganwadi-ui.js',
          'assets/css/garage-sale.css', 'assets/js/lib/garage-sale.js', 'assets/js/garage-sale-ui.js',
          'assets/css/fraction.css', 'assets/js/lib/fraction.js', 'assets/js/fraction-ui.js'] as $f) {
    @mkdir(dirname("$out/$f"), 0755, true);
    copy("$root/$f", "$out/$f");
    echo "public/$f\n";
}
file_put_contents("$out/index.html", '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/date-of-birth-calculator/"><link rel="canonical" href="/date-of-birth-calculator/"><a href="/date-of-birth-calculator/">Date of Birth Calculator</a>');
echo "public/index.html\n";

// sitemap.xml — every built page; lastmod is each page family's own 'updated' date from its config.
$ageCfg = $cfg;
$entries = [];
foreach (array_keys($ageCfg['pages']) as $slug) $entries[] = [$ageCfg['site']['base_url'] . "/$slug/", $ageCfg['site']['updated'], []];
foreach (['anganwadi', 'garage-sale'] as $conf) {
    $c = require "$root/app/config/$conf.php";
    $entries[] = [$c['site']['base_url'] . '/' . $c['page']['slug'] . '/', $c['site']['updated'], []];
}
foreach (array_keys($frCfg['langs']) as $code) {
    $p = new FractionPage($code, $frCfg);
    $entries[] = [$p->url(), $frCfg['site']['updated'], $p->alternates()];
}
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
     . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
foreach ($entries as [$loc, $lastmod, $alts]) {
    $xml .= "  <url>\n    <loc>" . htmlspecialchars($loc, ENT_XML1) . "</loc>\n    <lastmod>$lastmod</lastmod>\n";
    foreach ($alts as $a) $xml .= '    <xhtml:link rel="alternate" hreflang="' . $a['hreflang'] . '" href="' . htmlspecialchars($a['href'], ENT_XML1) . '"/>' . "\n";
    $xml .= "  </url>\n";
}
$xml .= "</urlset>\n";
file_put_contents("$out/sitemap.xml", $xml);
file_put_contents("$root/sitemap.xml", $xml);   // same file at the repo root for PHP hosting
echo "public/sitemap.xml\n";
