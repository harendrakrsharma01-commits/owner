<?php
/**
 * Renders one language version of the Fraction Calculator from app/config/fraction.php and
 * app/content/fraction/<lang>.php. Everything user-visible is escaped with e(); JSON is emitted
 * with JSON_HEX_* flags so it cannot break out of <script> blocks.
 */
final class FractionPage
{
    private array $cfg;
    private array $t;
    private string $lang;

    public function __construct(string $lang, ?array $cfg = null)
    {
        $this->cfg = $cfg ?? require __DIR__ . '/../config/fraction.php';
        if (!isset($this->cfg['langs'][$lang])) {
            throw new InvalidArgumentException('Unknown fraction-calculator language: ' . $lang);
        }
        $this->lang = $lang;
        $this->t = require __DIR__ . '/../content/fraction/' . $lang . '.php';
    }

    public static function e(?string $s): string
    {
        return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json($data): string
    {
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function path(?string $lang = null): string
    {
        return '/' . $this->cfg['langs'][$lang ?? $this->lang]['prefix'] . $this->cfg['slug'] . '/';
    }

    public function url(?string $lang = null): string
    {
        return rtrim($this->cfg['site']['base_url'], '/') . $this->path($lang);
    }

    /** hreflang alternates for every language + x-default (self-referencing, reciprocal by construction). */
    public function alternates(): array
    {
        $out = [];
        foreach ($this->cfg['langs'] as $code => $l) {
            $out[] = ['hreflang' => $l['hreflang'], 'href' => $this->url($code)];
        }
        $out[] = ['hreflang' => 'x-default', 'href' => $this->url($this->cfg['default_lang'])];
        return $out;
    }

    /** UI strings: the step templates and messages the browser needs. */
    public function t(string $key): string
    {
        return $this->t['ui'][$key] ?? $key;
    }

    public function schema(): array
    {
        $url = $this->url();
        $base = $this->cfg['site']['base_url'];
        $l = $this->cfg['langs'][$this->lang];
        return ['@context' => 'https://schema.org', '@graph' => [
            [
                '@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url,
                'name' => $this->t['title'], 'description' => $this->t['meta'],
                'dateModified' => $this->cfg['site']['updated'], 'inLanguage' => $l['hreflang'],
                'isPartOf' => ['@type' => 'WebSite', 'name' => $this->cfg['site']['name'], 'url' => $base . '/'],
            ],
            [
                '@type' => 'WebApplication', 'name' => $this->t['h1'], 'url' => $url,
                'applicationCategory' => 'EducationalApplication', 'operatingSystem' => 'Any (web browser)',
                'browserRequirements' => 'Requires JavaScript',
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
                'description' => $this->t['meta'], 'inLanguage' => $l['hreflang'],
            ],
            [
                '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => $this->t['crumbHome'], 'item' => $base . '/'],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => $this->t['h1'], 'item' => $url],
                ],
            ],
            [
                '@type' => 'FAQPage',
                'mainEntity' => array_map(fn ($qa) => [
                    '@type' => 'Question', 'name' => $qa[0],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
                ], $this->t['faq']),
            ],
        ]];
    }

    public function render(): string
    {
        $cfg = $this->cfg;
        $t = $this->t;
        $lang = $this->lang;
        $L = $cfg['langs'][$lang];
        $view = $this;
        ob_start();
        require __DIR__ . '/../views/fraction/layout.php';
        return (string) ob_get_clean();
    }
}
