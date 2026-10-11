import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/sdk/api/composables/use-text-edit.md
var __pageData = JSON.parse("{\"title\":\"useTextEdit\",\"description\":\"Obsługa wejścia tekstowego DOM, IME, formatowania i synchronizacji obiektów tekstowych.\",\"frontmatter\":{\"title\":\"useTextEdit\",\"description\":\"Obsługa wejścia tekstowego DOM, IME, formatowania i synchronizacji obiektów tekstowych.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-text-edit\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-text-edit\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useTextEdit — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useTextEdit — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Obsługa wejścia tekstowego DOM, IME, formatowania i synchronizacji obiektów tekstowych.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Obsługa wejścia tekstowego DOM, IME, formatowania i synchronizacji obiektów tekstowych.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Obsługa wejścia tekstowego DOM, IME, formatowania i synchronizacji obiektów tekstowych.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/composables/use-text-edit.md\",\"filePath\":\"pl/programmable/sdk/api/composables/use-text-edit.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/composables/use-text-edit.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usetextedit" tabindex="-1">useTextEdit <a class="header-anchor" href="#usetextedit" aria-label="Permalink to “useTextEdit”">​</a></h1><p><code>useTextEdit()</code> łączy wejście DOM z edycją tekstu na obszarze roboczym. Zarządza <code>textarea</code>, IME, kursorem, Delete/Backspace, poleceniami pogrubienia, kursywy i podkreślenia oraz zapisem zmian w SceneGraph.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">useTextEdit</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvasRef, editor)</span></span></code></pre></div><p>Użyj go w komponencie zawierającym obszar roboczy, zwykle razem z <code>useCanvas()</code> i <code>useCanvasInput()</code>.</p><h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./use-canvas">useCanvas</a></li><li><a href="./use-canvas-input">useCanvasInput</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/composables/use-text-edit.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_text_edit_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_text_edit_default as default };
