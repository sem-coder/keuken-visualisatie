(function () {
  var SELECTOR = 'iframe[data-kitchen-visualizer], iframe[src*="/embed/"]';

  function isMobileViewport() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 767px)').matches
    );
  }

  function viewportIframeCap() {
    var h = window.innerHeight || document.documentElement.clientHeight || 640;
    return Math.max(380, Math.round(h * 0.88));
  }

  function findIframeBySource(source) {
    var iframes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow === source) return iframes[i];
    }
    return null;
  }

  function setHeight(iframe, height) {
    if (typeof height !== 'number' || !Number.isFinite(height)) return;
    var next = Math.ceil(height);
    if (next < 200 || next > 8000) return;

    if (isMobileViewport()) {
      next = Math.min(next, viewportIframeCap());
    }

    iframe.style.height = next + 'px';
    iframe.style.minHeight = '0';
    iframe.setAttribute('scrolling', 'yes');
  }

  function scrollEmbedIntoView(iframe) {
    if (!iframe) return;
    try {
      iframe.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    } catch (e) {
      iframe.scrollIntoView(true);
    }
  }

  function wire(iframe) {
    if (!iframe || iframe.dataset.kvWired === '1') return;
    iframe.dataset.kvWired = '1';

    iframe.addEventListener('load', function () {
      try {
        iframe.contentWindow.postMessage({ type: 'kitchen-visualizer-resize' }, '*');
      } catch (e) {}
    });
  }

  function onMessage(event) {
    var data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'kitchen-visualizer-height') {
      var iframe = findIframeBySource(event.source);
      if (iframe) setHeight(iframe, data.height);
      return;
    }

    if (data.type === 'kitchen-visualizer-scroll-into-view') {
      var target = findIframeBySource(event.source);
      if (target) scrollEmbedIntoView(target);
    }
  }

  function init() {
    window.addEventListener('message', onMessage);
    window.addEventListener('resize', function () {
      document.querySelectorAll(SELECTOR).forEach(function (iframe) {
        try {
          iframe.contentWindow.postMessage({ type: 'kitchen-visualizer-resize' }, '*');
        } catch (e) {}
      });
    });
    document.querySelectorAll(SELECTOR).forEach(wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  new MutationObserver(function () {
    document.querySelectorAll(SELECTOR).forEach(wire);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
