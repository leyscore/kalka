import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/cli/exporting.md
var __pageData = JSON.parse("{\"title\":\"Export mit der CLI\",\"description\":\"PNG, JPG, WEBP, SVG, `.fig`, JSX, HTML und Storybook-Stories exportieren oder Dokumentformate umwandeln.\",\"frontmatter\":{\"title\":\"Export mit der CLI\",\"description\":\"PNG, JPG, WEBP, SVG, `.fig`, JSX, HTML und Storybook-Stories exportieren oder Dokumentformate umwandeln.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Export mit der CLI — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Export mit der CLI — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"PNG, JPG, WEBP, SVG, `.fig`, JSX, HTML und Storybook-Stories exportieren oder Dokumentformate umwandeln.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"PNG, JPG, WEBP, SVG, `.fig`, JSX, HTML und Storybook-Stories exportieren oder Dokumentformate umwandeln.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"PNG, JPG, WEBP, SVG, `.fig`, JSX, HTML und Storybook-Stories exportieren oder Dokumentformate umwandeln.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/cli/exporting.md\",\"filePath\":\"de/programmable/cli/exporting.md\",\"lastUpdated\":1791454432000}");
var _sfc_main = { name: "de/programmable/cli/exporting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="export-mit-der-cli" tabindex="-1">Export mit der CLI <a class="header-anchor" href="#export-mit-der-cli" aria-label="Permalink to “Export mit der CLI”">​</a></h1><p>Die CLI exportiert Rasterbilder, SVG, Teile eines Dokuments als <code>.fig</code>, JSX, HTML und Storybook-Stories.</p><h2 id="formate" tabindex="-1">Formate <a class="header-anchor" href="#formate" aria-label="Permalink to “Formate”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                           # PNG</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jpg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -s</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -q</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 90</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">        # JPG mit 2×</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> svg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                   # SVG</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Page 1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # Seite als .fig</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # HTML mit Tailwind-Klassen</span></span></code></pre></div><p><code>-f</code> wählt das Format (<code>png</code>, <code>jpg</code>, <code>webp</code>, <code>svg</code>, <code>pdf</code>, <code>pptx</code>, <code>jsx</code>, <code>html</code>, <code>fig</code>, <code>storybook</code>), <code>-s</code> den Maßstab, <code>-q</code> die Qualität und <code>-o</code> den Ausgabepfad. <code>--page</code> und <code>--node</code> begrenzen den Export.</p><h2 id="jsx" tabindex="-1">JSX <a class="header-anchor" href="#jsx" aria-label="Permalink to “JSX”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind-jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # oder: -f jsx --style tailwind</span></span></code></pre></div><p><code>--style openpencil</code> erzeugt das native JSX-Format des <a href="./../jsx-renderer">JSX-Renderers</a>.</p><h2 id="html" tabindex="-1">HTML <a class="header-anchor" href="#html" aria-label="Permalink to “HTML”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> standalone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --assets</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> external</span></span></code></pre></div><p>Der eigenständige HTML-Export wird sofort mit Tailwind kompiliert und benötigt keine Browser-Laufzeit. <code>--assets external</code> schreibt CSS und Bilder neben die HTML-Datei. <code>--fonts assets</code> speichert aufgelöste Webschriften als lokale <code>@font-face</code>-Dateien.</p><p>Der HTML-Export dient Übergabe und Weiterverarbeitung, nicht als pixelgenauer Ersatz für die Darstellung auf der Arbeitsfläche.</p><h2 id="storybook" tabindex="-1">Storybook <a class="header-anchor" href="#storybook" aria-label="Permalink to “Storybook”">​</a></h2><p>Erzeugt pro Komponentensatz oder Komponente eine CSF3-Datei <code>.stories.ts</code>:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                      # React-Stories in ./design-stories/</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> vue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.pen</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # bei jedem Speichern neu exportieren</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;src/**/*.pen&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --beside</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # Stories neben jedem Design</span></span></code></pre></div><h3 id="designs-neben-ihren-stories" tabindex="-1">Designs neben ihren Stories <a class="header-anchor" href="#designs-neben-ihren-stories" aria-label="Permalink to “Designs neben ihren Stories”">​</a></h3><p>Legen Sie die Designdatei jeder Komponente in den Ordner der Komponente und exportieren Sie mit <code>--beside</code>: Die Stories, Designbilder und das Manifest <code>.openpencil-stories.json</code> jedes Dokuments landen im eigenen Ordner dieses Dokuments, neben dem Code der Komponente. Ein Storybook-<code>stories</code>-Glob wie <code>../src/**/*.stories.ts</code> in <code>.storybook/main.ts</code> erfasst sie dann ohne weitere Konfiguration.</p><p>Sie können mehrere Dokumente übergeben oder einen Glob in Anführungszeichen wie <code>&#39;src/**/*.pen&#39;</code>, den OpenPencil selbst auflöst (Node.js 22 oder neuer). Mehrere Dokumente erfordern <code>--beside</code> oder <code>--output</code>; <code>--page</code> funktioniert nur mit einem Dokument. Die Dokumente werden nacheinander exportiert, und schlägt eines fehl, werden die übrigen trotzdem exportiert, bevor der Befehl mit einem Fehler endet. <code>--watch</code> beobachtet jedes passende Dokument; ein Dokument, das nach dem Start der Beobachtung entsteht, erfordert einen neuen Lauf.</p><p>Jede Variante eines Komponentensatzes wird zu einer Story, und ihre Variantenmerkmale werden zu <code>select</code>-Controls, sodass das Umschalten eines Controls die passende Variante zeigt. Ein Satz mit Verhalten erhält stattdessen die Props des Controls: ein Switch oder eine Checkbox ein boolesches <code>checked</code>, ein Toggle <code>pressed</code>, ein Collapsible <code>open</code> und <code>disabled</code>, wenn der Satz einen deaktivierten Zustand zeichnet; Hover, Pressed und Fokus bleiben eigene Storys. Eigenständige Komponenten mit Schrägstrich im Namen, etwa <code>Button/Primary</code> und <code>Button/Secondary</code>, werden in einer <code>Button</code>-Datei mit einem <code>Variant</code>-Control zusammengefasst. Eine Kombination, für die das Design keine Variante hat, löst in Storybook einen benannten Fehler aus, statt eine andere Variante zu zeigen.</p><p>Die Stories rendern die Komponente wie <code>-f html</code> als HTML mit Inline-Stilen und benötigen daher keine OpenPencil-Laufzeit; <code>--framework</code> (<code>react</code>, <code>vue</code> oder <code>html</code>) ändert nur den Wrapper und den Import von <code>Meta</code>/<code>StoryObj</code> aus <code>@storybook/react-vite</code>, <code>@storybook/vue3-vite</code> oder <code>@storybook/html-vite</code>. Text verwendet die Schriftfamilien des Dokuments, die Storybook selbst laden muss. Text-, Boolean- und Instanztausch-Eigenschaften werden noch nicht exportiert.</p><p>Mit <code>--framework vue</code> oder <code>--framework react</code> wird ein Komponentensatz, dessen Verhalten ein Button, Switch, Checkbox, Toggle oder Collapsible ist, stattdessen zu einer echten Komponente: <code>&lt;Name&gt;.vue</code> auf Basis von Reka UI oder <code>&lt;Name&gt;.tsx</code> mit <code>&lt;Name&gt;.module.css</code> auf Basis des Pakets <code>radix-ui</code> von Radix UI. Seine Varianten werden zu einem Stylesheet kompiliert, das auf die von Reka und Radix gesetzten Zustände reagiert (<code>data-state</code>, <code>data-disabled</code>, Hover und Fokus), und jedes weitere Variantenmerkmal ist ein Prop, das die Komponente als <code>data-*</code>-Attribut setzt. In Vue ist sein Wert ein <code>v-model</code> wie <code>checked</code> oder <code>open</code>; in React nimmt die Komponente die Props der Radix-Wurzel an, etwa <code>checked</code>, <code>defaultChecked</code> und <code>onCheckedChange</code>. Die Storys rendern die Komponente, und eine Play-Funktion klickt das Control an und prüft seinen Zustand; das Storybook-Projekt braucht daher <code>reka-ui</code> oder <code>radix-ui</code>.</p><p>Die Stories enthalten <code>parameters.design</code>-Einträge für <a href="https://github.com/storybookjs/addon-designs" target="_blank" rel="noreferrer"><code>@storybook/addon-designs</code></a>:</p><ul><li><strong>OpenPencil:</strong> Liegt der Dokumentpfad im aktuellen Verzeichnis, ein <a href="./../index#url-scheme"><code>openpencil://</code>-Link</a>, der das Dokument in der Desktop-Anwendung öffnet und die Variante auswählt, oder ihren Komponentensatz, wenn eine andere Ebene den Namen der Variante trägt. Das Schema adressiert Ebenen über ihren Namen; eine Story, deren Varianten- und Komponentenname beide von anderen Ebenen geteilt werden, erhält keinen Link.</li><li><strong>Design:</strong> ein PNG der Variante in 2×, das neben der Story in <code>&lt;Name&gt;.design/</code> abgelegt und mit <code>new URL(…, import.meta.url)</code> referenziert wird, sodass Vite es bündelt. Kopieren Sie den Parameter in die Story Ihrer eigenen Komponente, um die Implementierung mit dem Design zu vergleichen. <code>--no-design-images</code> überspringt das Rendern; die Schriftersetzung folgt wie beim Rasterexport <code>--font-policy</code>.</li></ul><p><code>-o</code> benennt das Ausgabeverzeichnis. Ein dortiges Manifest <code>.openpencil-stories.json</code> hält fest, welches Dokument (als Pfad relativ zum Ausgabeverzeichnis) und welche Seite jede Story und jedes Designbild erzeugt hat; checken Sie es zusammen mit den Stories ein. Ein Export ersetzt die Dateien, die ein früherer Export desselben Dokuments dort erzeugt hat, auch die inzwischen gelöschter oder umbenannter Komponenten; mit <code>--page</code> nur die dieser Seite. Er weigert sich, bevor etwas geändert wird, jede andere Datei zu überschreiben – eine handgeschriebene Story, die eines anderen Dokuments oder ein verirrtes Bild. Ein Export einer einzelnen Seite, dessen Dateinamen auf die Stories einer anderen Seite verschoben wurden, verlangt stattdessen einen vollständigen Export. Ohne das Manifest gelten vorhandene Stories als fremd, entfernen Sie sie daher vor einem erneuten Export. <code>--watch</code> hält den Befehl am Laufen und exportiert bei jedem Speichern des Dokuments neu, sodass das Hot Reload von Storybook dem Design folgt; ein Speicherstand, der nicht gelesen werden kann, wird gemeldet, und die Beobachtung läuft weiter. Ein fehlendes <code>--page</code> oder eine Ersetzung bei <code>--font-policy strict</code> beendet den Befehl dennoch.</p><h2 id="laufende-anwendung" tabindex="-1">Laufende Anwendung <a class="header-anchor" href="#laufende-anwendung" aria-label="Permalink to “Laufende Anwendung”">​</a></h2><p>Ohne Dateiargument exportiert die CLI aus der laufenden Anwendung:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                       # Auswahl im aktiven Dokument exportieren</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # alle Ebenen einer Seite exportieren</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1:23</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">           # eine Ebene auf einer beliebigen Seite exportieren</span></span></code></pre></div><p><code>--page</code> nimmt einen Seitennamen und <code>--page-id</code> eine Seiten-ID aus <code>openpencil documents list</code>; beide exportieren diese Seite, ohne die Anwendung zu ihr zu wechseln. Mit <code>--document-id</code> exportieren Sie aus einem anderen als dem aktiven Dokument.</p><p>Dieser Modus unterstützt PNG, JPG, WEBP, SVG und PDF. PowerPoint, JSX, HTML, Storybook und <code>.fig</code> erfordern ein Dateiargument.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/cli/exporting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var exporting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, exporting_default as default };
