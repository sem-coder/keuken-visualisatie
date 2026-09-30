(function () {
  var SELECTOR = 'iframe[data-kitchen-visualizer], iframe[src*="/embed/"]';

  function setHeight(iframe, height) {
    if (typeof height !== 'number' || !Number.isFinite(height)) return;
    var next = Math.ceil(height);
    if (next < 200 || next > 8000) return;
    iframe.style.height = next + 'px';
    iframe.style.minHeight = '0';
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
    if (!data || data.type !== 'kitchen-visualizer-height') return;

    var iframes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.contentWindow === event.source) {
        setHeight(iframe, data.height);
        break;
      }
    }
  }

  function init() {
    window.addEventListener('message', onMessage);
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
