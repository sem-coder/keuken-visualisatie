# Webflow iframe embed (Uw Keuken Wrappen)

Gebruik **altijd** het `/embed/[slug]`-pad (niet de homepage fullscreen). Voor UKW:

**Visualizer-URL:** `https://keuken-visualisatie-tool.vercel.app/embed/ukw`

## 1. Embed-code (Webflow → Embed element)

Plak dit in één **Embed**-blok op de pagina (bijv. `/samples-aanvragen`):

```html
<link rel="stylesheet" href="https://keuken-visualisatie-tool.vercel.app/embed.css" />
<div class="kitchen-visualizer-embed">
  <iframe
    id="kitchen-visualizer"
    data-kitchen-visualizer="1"
    src="https://keuken-visualisatie-tool.vercel.app/embed/ukw"
    title="Keuken visualisatie"
    width="100%"
    frameborder="0"
    scrolling="yes"
    allow="camera *; clipboard-read *; clipboard-write *"
    style="width:100%;max-width:100%;min-width:0;border:0;display:block;min-height:520px;height:720px;"
  ></iframe>
</div>
<script src="https://keuken-visualisatie-tool.vercel.app/embed.js" defer></script>
```

De admin toont dezelfde code onder klant **ukw** → Embed.

## 2. Webflow layout (belangrijk)

- Zet het embed-blok in een **Container** of kolom met normale breedte — **niet** in een fullscreen 100vh-section.
- Geef de section **geen** vaste hoogte `100vh` op het iframe zelf.
- **`embed.js` is verplicht** — zonder script blijft de iframe te kort of te lang en scrollt het niet goed.

## 3. Automatische hoogte

`embed.js` luistert naar `kitchen-visualizer-height` en past de iframe-hoogte aan de inhoud aan.

## 4. Environment variables (visualizer app)

```env
NEXT_PUBLIC_PARENT_ORIGIN=https://www.uwkeukenwrappen.nl
NEXT_PUBLIC_PARENT_WEBSITE_URL=https://www.uwkeukenwrappen.nl
```

## 5. Veelgemaakte fouten

| Probleem | Oplossing |
|----------|-----------|
| Fullscreen / hele viewport | Gebruik `/embed/ukw`, wrapper `.kitchen-visualizer-embed`, geen 100vh iframe |
| Kan niet scrollen / knoppen weg | `embed.js` onder het iframe plaatsen |
| Te smalle layout | `embed.css` meenemen (max-width 72rem, gecentreerd) |
| Oude URL `/?client=ukw&embed=1` | Vervangen door `/embed/ukw` |

## 6. Tracking

Events gaan via `postMessage` (`kitchen-visualizer-event`). Optioneel GTM-script: zie eerdere versie van dit document of admin.
