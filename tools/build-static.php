<?php
/**
 * Builds plain-HTML copies of the Age / DOB pages into public/ for hosts without PHP.
 * Usage: php tools/build-static.php   → public/<slug>/index.html + public/assets/...
 */
require __DIR__ . '/../app/lib/AgeDobPage.php';
$root = dirname(__DIR__);
$out = $root . '/public';
$cfg = require $root . '/app/config/age-dob.php';
foreach (array_keys($cfg['pages']) as $slug) {
    @mkdir("$out/$slug", 0755, true);
    file_put_contents("$out/$slug/index.html", (new AgeDobPage($slug, $cfg))->render());
    echo "public/$slug/index.html\n";
}
foreach (['assets/css/age-dob.css', 'assets/js/lib/age-dob.js', 'assets/js/age-dob-ui.js'] as $f) {
    @mkdir(dirname("$out/$f"), 0755, true);
    copy("$root/$f", "$out/$f");
    echo "public/$f\n";
}
file_put_contents("$out/index.html", '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/date-of-birth-calculator/"><link rel="canonical" href="/date-of-birth-calculator/"><a href="/date-of-birth-calculator/">Date of Birth Calculator</a>');
echo "public/index.html\n";
