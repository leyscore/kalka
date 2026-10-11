import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/cli/analyzing.md
var __pageData = JSON.parse("{\"title\":\"Designs analysieren\",\"description\":\"Farben, Typografie, Abstände und wiederkehrende Strukturen in `.fig`-Dateien untersuchen.\",\"frontmatter\":{\"title\":\"Designs analysieren\",\"description\":\"Farben, Typografie, Abstände und wiederkehrende Strukturen in `.fig`-Dateien untersuchen.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Designs analysieren — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Designs analysieren — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Farben, Typografie, Abstände und wiederkehrende Strukturen in `.fig`-Dateien untersuchen.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Farben, Typografie, Abstände und wiederkehrende Strukturen in `.fig`-Dateien untersuchen.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Farben, Typografie, Abstände und wiederkehrende Strukturen in `.fig`-Dateien untersuchen.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/cli/analyzing.md\",\"filePath\":\"de/programmable/cli/analyzing.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/cli/analyzing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="designs-analysieren" tabindex="-1">Designs analysieren <a class="header-anchor" href="#designs-analysieren" aria-label="Permalink to “Designs analysieren”">​</a></h1><p>Die <code>analyze</code>-Befehle prüfen ein vollständiges Dokument im Terminal. Sie zeigen Farben und Textstile, Abweichungen bei Abständen und wiederkehrende Strukturen, die sich als Komponenten eignen könnten.</p><h2 id="farben" tabindex="-1">Farben <a class="header-anchor" href="#farben" aria-label="Permalink to “Farben”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> colors</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Zählt jede Farbe und zeigt ein Histogramm.</p><h2 id="typografie" tabindex="-1">Typografie <a class="header-anchor" href="#typografie" aria-label="Permalink to “Typografie”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> typography</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Listet Kombinationen aus Schriftfamilie, Größe und Schnitt mit ihrer Häufigkeit auf.</p><h2 id="abstande" tabindex="-1">Abstände <a class="header-anchor" href="#abstande" aria-label="Permalink to “Abstände”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> spacing</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Prüft Abstände und Innenabstände in Rahmen mit automatischer Anordnung. So wird beispielsweise ein einzelner Wert von <code>13px</code> zwischen üblichen <code>8/16/24</code> sichtbar.</p><h2 id="wiederkehrende-strukturen" tabindex="-1">Wiederkehrende Strukturen <a class="header-anchor" href="#wiederkehrende-strukturen" aria-label="Permalink to “Wiederkehrende Strukturen”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clusters</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Sucht wiederkehrende Objektstrukturen, die als Komponenten zusammengefasst werden könnten.</p><h2 id="json-ausgabe" tabindex="-1">JSON-Ausgabe <a class="header-anchor" href="#json-ausgabe" aria-label="Permalink to “JSON-Ausgabe”">​</a></h2><p>Alle Analysebefehle unterstützen <code>--json</code>. Die Ausgabe kann mit <code>jq</code>, in CI oder in Skripten für Designtoken verarbeitet werden.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/cli/analyzing.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var analyzing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, analyzing_default as default };
