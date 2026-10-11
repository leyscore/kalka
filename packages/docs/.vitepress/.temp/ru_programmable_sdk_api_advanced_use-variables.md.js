import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/sdk/api/advanced/use-variables.md
var __pageData = JSON.parse("{\"title\":\"useVariables\",\"description\":\"Чтение и изменение коллекций, переменных, режимов и значений.\",\"frontmatter\":{\"title\":\"useVariables\",\"description\":\"Чтение и изменение коллекций, переменных, режимов и значений.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-variables\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-variables\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-variables\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useVariables — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useVariables — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Чтение и изменение коллекций, переменных, режимов и значений.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Чтение и изменение коллекций, переменных, режимов и значений.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Чтение и изменение коллекций, переменных, режимов и значений.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/advanced/use-variables.md\",\"filePath\":\"ru/programmable/sdk/api/advanced/use-variables.md\",\"lastUpdated\":1791290141000}");
var _sfc_main = { name: "ru/programmable/sdk/api/advanced/use-variables.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usevariables" tabindex="-1">useVariables <a class="header-anchor" href="#usevariables" aria-label="Permalink to “useVariables”">​</a></h1><p><code>useVariables()</code> предоставляет низкоуровневое состояние и действия редактора переменных.</p><p>Используйте composable для прямого управления коллекциями, активными режимами, фильтрами и операциями создания, чтения, обновления и удаления без готовых таблицы или диалога.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> variables</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useVariables</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Среди возвращаемых значений — <code>collections</code>, <code>activeCollection</code>, <code>activeModes</code>, <code>variables</code>, <code>searchTerm</code> и действия для создания, переименования, удаления и обновления переменных и коллекций.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/advanced/use-variables.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_variables_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_variables_default as default };
