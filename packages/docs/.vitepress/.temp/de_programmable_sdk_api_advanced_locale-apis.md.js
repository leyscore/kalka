import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/sdk/api/advanced/locale-apis.md
var __pageData = JSON.parse("{\"title\":\"Locale API\",\"description\":\"Low-level Locale stores und Metadata aus @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Locale API\",\"description\":\"Low-level Locale stores und Metadata aus @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/locale-apis\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/locale-apis\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Locale API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Locale API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Low-level Locale stores und Metadata aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Low-level Locale stores und Metadata aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Low-level Locale stores und Metadata aus @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/api/advanced/locale-apis.md\",\"filePath\":\"de/programmable/sdk/api/advanced/locale-apis.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/api/advanced/locale-apis.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="locale-api" tabindex="-1">Locale API <a class="header-anchor" href="#locale-api" aria-label="Permalink to “Locale API”">​</a></h1><p>Zusätzlich zu <code>useI18n()</code> exportiert das Vue SDK ein low-level API für direkten Zugriff auf Locale state:</p><ul><li><code>locale</code></li><li><code>localeSetting</code></li><li><code>setLocale()</code></li><li><code>AVAILABLE_LOCALES</code></li><li><code>LOCALE_LABELS</code></li></ul><p>Diese Exports eignen sich, wenn Locale Teil eines umfassenderen Application state ist oder die Liste der verfügbaren Sprachen ohne das vollständige <code>useI18n()</code> API benötigt wird.</p><h2 id="verwendung" tabindex="-1">Verwendung <a class="header-anchor" href="#verwendung" aria-label="Permalink to “Verwendung”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  locale,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  localeSetting,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  setLocale,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  AVAILABLE_LOCALES,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  LOCALE_LABELS,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span></code></pre></div><h2 id="verhalten" tabindex="-1">Verhalten <a class="header-anchor" href="#verhalten" aria-label="Permalink to “Verhalten”">​</a></h2><ul><li><code>locale</code> enthält das nach Settings und Fallback tatsächlich verwendete Locale.</li><li><code>localeSetting</code> speichert die Preference des Benutzer.</li><li><code>setLocale()</code> aktualisiert Preference und aktives Locale.</li><li><code>AVAILABLE_LOCALES</code> und <code>LOCALE_LABELS</code> dienen zum Aufbau eines eigenen Locale picker.</li></ul><h2 id="siehe-auch" tabindex="-1">Siehe auch <a class="header-anchor" href="#siehe-auch" aria-label="Permalink to “Siehe auch”">​</a></h2><ul><li><a href="./../composables/use-i18n">useI18n</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/api/advanced/locale-apis.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var locale_apis_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, locale_apis_default as default };
