import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/sdk/api/composables/use-text-edit.md
var __pageData = JSON.parse("{\"title\":\"useTextEdit\",\"description\":\"Gestire DOM text input, IME, Formatting e sincronizzazione degli oggetti di testo.\",\"frontmatter\":{\"title\":\"useTextEdit\",\"description\":\"Gestire DOM text input, IME, Formatting e sincronizzazione degli oggetti di testo.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-text-edit\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-text-edit\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-text-edit\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useTextEdit — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useTextEdit — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Gestire DOM text input, IME, Formatting e sincronizzazione degli oggetti di testo.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Gestire DOM text input, IME, Formatting e sincronizzazione degli oggetti di testo.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Gestire DOM text input, IME, Formatting e sincronizzazione degli oggetti di testo.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/api/composables/use-text-edit.md\",\"filePath\":\"it/programmable/sdk/api/composables/use-text-edit.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/api/composables/use-text-edit.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usetextedit" tabindex="-1">useTextEdit <a class="header-anchor" href="#usetextedit" aria-label="Permalink to “useTextEdit”">​</a></h1><p><code>useTextEdit()</code> collega il DOM input all’editing del testo nel canvas dell’Editor. Gestisce <code>textarea</code>, IME, Caret, Delete/Backspace, Commands Bold/Italic/Underline e scrittura delle modifiche in SceneGraph.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">(canvasRef, editor)</span></span></code></pre></div><p>Usalo nel Component che contiene il canvas, normalmente insieme a <code>useCanvas()</code> e <code>useCanvasInput()</code>.</p><p>Durante l’input, la Function aggiorna testo e Style runs in SceneGraph.</p><h2 id="vedi-anche" tabindex="-1">Vedi anche <a class="header-anchor" href="#vedi-anche" aria-label="Permalink to “Vedi anche”">​</a></h2><ul><li><a href="./use-canvas">useCanvas</a></li><li><a href="./use-canvas-input">useCanvasInput</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/api/composables/use-text-edit.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_text_edit_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_text_edit_default as default };
