# Webflow iframe embed

Deze applicatie is bedoeld om embedded te worden in een Webflow-pagina via iframe.

## 1. HTML embed (Webflow Embed element)

Plaats dit in een **Embed**-element op je Webflow-pagina:

```html
<iframe
  id="kitchen-visualizer"
  src="https://visualizer.example.com"
  width="100%"
  frameborder="0"
  scrolling="no"
  title="Bekijk een nieuwe kleur op jouw keuken"
  style="border: 0; width: 100%; display: block;"
></iframe>
```

Vervang `https://visualizer.example.com` door je productie-URL (bijv. Vercel).

## 2. Automatische iframe-hoogte

Voeg dit script toe **onder** het iframe (zelfde pagina, bij voorkeur in Page Settings → Custom Code → Before `</body>`):

```html
<script>
(function () {
  var IFRAME_ID = 'kitchen-visualizer';
  var VISUALIZER_ORIGIN = 'https://visualizer.example.com';
  var PARENT_ORIGIN = window.location.origin;

  var iframe = document.getElementById(IFRAME_ID);
  if (!iframe) return;

  window.addEventListener('message', function (event) {
    if (event.origin !== VISUALIZER_ORIGIN) return;

    if (event.data && event.data.type === 'kitchen-visualizer-height') {
      var height = Number(event.data.height);
      if (height > 0) {
        iframe.style.height = height + 'px';
      }
    }

    if (event.data && event.data.type === 'kitchen-visualizer-event') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: event.data.event,
        visualizer: event.data.payload || {}
      });
    }
  });

  iframe.addEventListener('load', function () {
    iframe.contentWindow.postMessage(
      {
        type: 'kitchen-visualizer-attribution',
        attribution: getAttribution()
      },
      VISUALIZER_ORIGIN
    );
  });

  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    var keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'gclid',
      'fbclid'
    ];
    var attribution = {};
    keys.forEach(function (key) {
      var value = params.get(key);
      if (value) attribution[key] = value;
    });
    return attribution;
  }
})();
</script>
```

## 3. Environment variables (visualizer app)

Stel in je visualizer-app in:

```env
NEXT_PUBLIC_PARENT_ORIGIN=https://www.jouwwebsite.nl
NEXT_PUBLIC_PARENT_WEBSITE_URL=https://www.jouwwebsite.nl
```

- `NEXT_PUBLIC_PARENT_ORIGIN` — gebruikt voor veilige `postMessage`-communicatie
- `NEXT_PUBLIC_PARENT_WEBSITE_URL` — link op de succespagina ("Terug naar de website")

## 4. Tracking events

De visualizer stuurt deze events naar de parent via `postMessage`:

| Event | Wanneer |
|---|---|
| `visualizer_view` | Pagina geladen |
| `kitchen_photo_uploaded` | Foto geüpload |
| `material_selected` | Kleur gekozen |
| `visualization_started` | AI-generatie gestart |
| `visualization_completed` | AI-resultaat klaar |
| `visualization_failed` | AI mislukt |
| `sample_selected` | Sample toegevoegd |
| `sample_removed` | Sample verwijderd |
| `sample_form_view` | Formulier getoond |
| `sample_request_submitted` | Aanvraag verzonden |

Het bovenstaande script pusht deze naar `window.dataLayer` voor Google Tag Manager.

## 5. UTM-attributie

UTM-parameters en click-IDs uit de Webflow-URL worden automatisch doorgegeven aan de visualizer bij iframe load.

## 6. Privacy

Keukenfoto's zijn privébeelden van gebruikers. Er is geen publieke gallery. Stel later een retention policy in voor opgeslagen foto's in productie (Vercel Blob, S3, etc.).

## 7. Sample webhook (optioneel)

Stel `SAMPLE_WEBHOOK_URL` in om sample-aanvragen naar je CRM of e-mailtool te sturen:

```env
SAMPLE_WEBHOOK_URL=https://hooks.example.com/sample-request
```
