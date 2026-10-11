import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/sdk/api/advanced/locale-apis.md
var __pageData = JSON.parse("{\"title\":\"Locale API\",\"description\":\"Low-level locale stores и metadata из @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Locale API\",\"description\":\"Low-level locale stores и metadata из @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/locale-apis\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/locale-apis\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/locale-apis\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Locale API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Locale API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Low-level locale stores и metadata из @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Low-level locale stores и metadata из @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Low-level locale stores и metadata из @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/advanced/locale-apis.md\",\"filePath\":\"ru/programmable/sdk/api/advanced/locale-apis.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/advanced/locale-apis.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="locale-api" tabindex="-1">Locale API <a class="header-anchor" href="#locale-api" aria-label="Permalink to “Locale API”">​</a></h1><p>Помимо <code>useI18n()</code>, Vue SDK экспортирует API для прямой работы с locale:</p><ul><li><code>locale</code></li><li><code>localeSetting</code></li><li><code>setLocale()</code></li><li><code>AVAILABLE_LOCALES</code></li><li><code>LOCALE_LABELS</code></li></ul><p>Используйте их для прямого доступа к store, интеграции locale state с application shell или получения metadata без subscription на весь объект <code>useI18n()</code>.</p><h2 id="использование" tabindex="-1">Использование <a class="header-anchor" href="#использование" aria-label="Permalink to “Использование”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &#39;@open-pencil/vue&#39;</span></span></code></pre></div><h2 id="поведение" tabindex="-1">Поведение <a class="header-anchor" href="#поведение" aria-label="Permalink to “Поведение”">​</a></h2><ul><li><code>locale</code> — store фактически выбранного locale;</li><li><code>localeSetting</code> — сохранённая user preference;</li><li><code>setLocale()</code> одновременно обновляет preference и active locale;</li><li><code>AVAILABLE_LOCALES</code> и <code>LOCALE_LABELS</code> подходят для собственного locale picker.</li></ul><h2 id="см-также" tabindex="-1">См. также <a class="header-anchor" href="#см-также" aria-label="Permalink to “См. также”">​</a></h2><ul><li><a href="./../composables/use-i18n">useI18n</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/advanced/locale-apis.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var locale_apis_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, locale_apis_default as default };
