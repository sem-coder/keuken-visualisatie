const IFRAME_ID = 'kitchen-visualizer';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

export function getEmbedUrl(slug: string, baseUrl: string): string {
  const url = new URL(normalizeBaseUrl(baseUrl));
  url.pathname = `/embed/${encodeURIComponent(slug)}`;
  url.search = '';
  return url.toString();
}

/** Legacy query URL — blijft werken voor bestaande embeds. */
export function getLegacyEmbedUrl(slug: string, baseUrl: string): string {
  const url = new URL(normalizeBaseUrl(baseUrl));
  url.pathname = '/';
  url.searchParams.set('client', slug);
  url.searchParams.set('embed', '1');
  return url.toString();
}

export function getEmbedSnippet(slug: string, baseUrl: string): string {
  const root = normalizeBaseUrl(baseUrl);
  const embedUrl = getEmbedUrl(slug, baseUrl);

  return `<iframe
  id="${IFRAME_ID}"
  data-kitchen-visualizer="1"
  src="${embedUrl}"
  title="Keuken visualisatie"
  width="100%"
  frameborder="0"
  scrolling="yes"
  allow="camera *; clipboard-read *; clipboard-write *"
  style="width:100%;border:0;display:block;min-height:720px;height:720px;"
></iframe>
<script src="${root}/embed.js" defer></script>`;
}
