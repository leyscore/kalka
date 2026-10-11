import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/sdk/api/advanced/use-color-variable-binding.md
var __pageData = JSON.parse("{\"title\":\"useColorVariableBinding\",\"description\":\"Collegare il colore di un riempimento o contorno a una variabile.\",\"frontmatter\":{\"title\":\"useColorVariableBinding\",\"description\":\"Collegare il colore di un riempimento o contorno a una variabile.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-variable-binding\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useColorVariableBinding — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useColorVariableBinding — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Collegare il colore di un riempimento o contorno a una variabile.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Collegare il colore di un riempimento o contorno a una variabile.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Collegare il colore di un riempimento o contorno a una variabile.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/api/advanced/use-color-variable-binding.md\",\"filePath\":\"it/programmable/sdk/api/advanced/use-color-variable-binding.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/api/advanced/use-color-variable-binding.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usecolorvariablebinding" tabindex="-1">useColorVariableBinding <a class="header-anchor" href="#usecolorvariablebinding" aria-label="Permalink to “useColorVariableBinding”">​</a></h1><p><code>useColorVariableBinding(kind)</code> fornisce funzioni per cercare, impostare e rimuovere il collegamento di variabili colore nei riempimenti o contorni.</p><p>Usa il composable nei controlli colore compatibili con le variabili di design.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> fillBinding</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useColorVariableBinding</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;fills&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> strokeBinding</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useColorVariableBinding</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;strokes&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><h2 id="vedi-anche" tabindex="-1">Vedi anche <a class="header-anchor" href="#vedi-anche" aria-label="Permalink to “Vedi anche”">​</a></h2><ul><li><a href="./../composables/use-fill-controls">useFillControls</a></li><li><a href="./../composables/use-stroke-controls">useStrokeControls</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/api/advanced/use-color-variable-binding.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_color_variable_binding_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_color_variable_binding_default as default };
