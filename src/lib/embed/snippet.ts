const IFRAME_ID = 'kitchen-visualizer';

export function getEmbedSnippet(slug: string, baseUrl: string): string {
  const embedUrl = getEmbedUrl(slug, baseUrl);

  return `<div class="kitchen-visualizer-embed" style="width:100%;max-width:100%;overflow:visible;">
  <iframe
    id="${IFRAME_ID}"
    src="${embedUrl}"
    width="100%"
    frameborder="0"
    scrolling="auto"
    title="Bekijk een nieuwe kleur op jouw keuken"
    style="border:0;width:100%;display:block;min-height:640px;height:640px;overflow:auto;"
    loading="lazy"
  ></iframe>
</div>
<script>
(function () {
  var iframe = document.getElementById('${IFRAME_ID}');
  if (!iframe) return;

  function setHeight(height) {
    if (typeof height !== 'number' || !Number.isFinite(height)) return;
    iframe.style.height = Math.max(480, Math.ceil(height)) + 'px';
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || data.type !== 'kitchen-visualizer-height') return;
    setHeight(data.height);
  });

  iframe.addEventListener('load', function () {
    try {
      iframe.contentWindow.postMessage({ type: 'kitchen-visualizer-resize' }, '*');
    } catch (e) {}
  });
})();
</script>`;
}

export function getEmbedUrl(slug: string, baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('client', slug);
  url.searchParams.set('embed', '1');
  return url.toString();
}
