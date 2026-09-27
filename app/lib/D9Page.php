<?php
/**
 * Renders the D9 / Navamsa Chart Calculator from app/config/d9-navamsa.php.
 * Same conventions as AgeDobPage: every user-visible string goes through e();
 * JSON is emitted with JSON_HEX_* flags so it cannot break out of <script>.
 */
final class D9Page
{
    private array $cfg;

    public function __construct(?array $cfg = null)
    {
        $this->cfg = $cfg ?? require __DIR__ . '/../config/d9-navamsa.php';
    }

    public static function e(?string $s): string
    {
        return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json($data): string
    {
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function config(): array
    {
        return $this->cfg;
    }

    public function url(): string
    {
        return rtrim($this->cfg['site']['base_url'], '/') . '/' . $this->cfg['page']['slug'] . '/';
    }

    /** Places as {id, label, lat, lon, tz}; the id is stable so the UI can reference entries. */
    public static function places(): array
    {
        $out = [];
        foreach (require __DIR__ . '/../config/d9-places.php' as [$name, $region, $country, $lat, $lon, $tz]) {
            $out[] = ['id' => $name . '|' . $region . '|' . $country, 'name' => $name, 'region' => $region,
                      'country' => $country, 'lat' => $lat, 'lon' => $lon, 'tz' => $tz];
        }
        return $out;
    }

    public function related(): array
    {
        return array_values(array_filter($this->cfg['related'], fn ($r) => $r[3]));
    }

    public function schema(): array
    {
        $p = $this->cfg['page'];
        $site = $this->cfg['site'];
        $url = $this->url();
        $crumbs = [];
        foreach ($p['breadcrumb'] as $i => [$name, $href]) {
            $crumbs[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $name, 'item' => $site['base_url'] . $href];
        }
        $crumbs[] = ['@type' => 'ListItem', 'position' => count($crumbs) + 1, 'name' => $p['h1'], 'item' => $url];
        return ['@context' => 'https://schema.org', '@graph' => [
            [
                '@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url, 'name' => $p['title'],
                'description' => $p['meta'], 'dateModified' => $site['updated'], 'inLanguage' => 'en',
                'isPartOf' => ['@type' => 'WebSite', 'name' => $site['name'], 'url' => $site['base_url'] . '/'],
            ],
            [
                '@type' => 'SoftwareApplication', 'name' => $p['h1'], 'url' => $url,
                'applicationCategory' => 'UtilitiesApplication', 'operatingSystem' => 'Any (web browser)',
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
                'description' => $p['meta'],
            ],
            ['@type' => 'BreadcrumbList', 'itemListElement' => $crumbs],
            [
                '@type' => 'FAQPage',
                'mainEntity' => array_map(fn ($qa) => [
                    '@type' => 'Question', 'name' => $qa[0],
                    'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
                ], $this->cfg['faq']),
            ],
        ]];
    }

    public function render(): string
    {
        $cfg = $this->cfg;
        $view = $this;
        ob_start();
        require __DIR__ . '/../views/d9/layout.php';
        return (string) ob_get_clean();
    }
}
