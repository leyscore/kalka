import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/sdk/api/advanced/use-okhcl.md
var __pageData = JSON.parse("{\"title\":\"useOkHCL\",\"description\":\"Gestire i modelli di colore RGBA e OkHCL per riempimenti e contorni.\",\"frontmatter\":{\"title\":\"useOkHCL\",\"description\":\"Gestire i modelli di colore RGBA e OkHCL per riempimenti e contorni.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-okhcl\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-okhcl\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useOkHCL — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useOkHCL — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Gestire i modelli di colore RGBA e OkHCL per riempimenti e contorni.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Gestire i modelli di colore RGBA e OkHCL per riempimenti e contorni.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Gestire i modelli di colore RGBA e OkHCL per riempimenti e contorni.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/api/advanced/use-okhcl.md\",\"filePath\":\"it/programmable/sdk/api/advanced/use-okhcl.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/api/advanced/use-okhcl.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="useokhcl" tabindex="-1">useOkHCL <a class="header-anchor" href="#useokhcl" aria-label="Permalink to “useOkHCL”">​</a></h1><p><code>useOkHCL()</code> legge e cambia il modello di colore usato da riempimenti e contorni. L’API può attivare o disattivare OkHCL e aggiornarne i valori.</p><p>Usalo in un selettore colore avanzato compatibile con RGBA e con il modello percettivo OkHCL.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> okhcl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useOkHCL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>L’API espone lettura del modello, attivazione, disattivazione e aggiornamento di OkHCL per riempimenti e contorni, oltre a <code>modelOptions</code>.</p><h2 id="vedi-anche" tabindex="-1">Vedi anche <a class="header-anchor" href="#vedi-anche" aria-label="Permalink to “Vedi anche”">​</a></h2><ul><li><a href="./../composables/use-fill-controls">useFillControls</a></li><li><a href="./../composables/use-stroke-controls">useStrokeControls</a></li><li><a href="./../components/color-picker-root">ColorPickerRoot</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/api/advanced/use-okhcl.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_okhcl_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_okhcl_default as default };
