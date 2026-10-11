import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/sdk/api/advanced/use-okhcl.md
var __pageData = JSON.parse("{\"title\":\"useOkHCL\",\"description\":\"Obsługa modeli kolorów RGBA i OkHCL dla zalewów oraz obwiedni.\",\"frontmatter\":{\"title\":\"useOkHCL\",\"description\":\"Obsługa modeli kolorów RGBA i OkHCL dla zalewów oraz obwiedni.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-okhcl\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-okhcl\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-okhcl\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useOkHCL — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useOkHCL — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Obsługa modeli kolorów RGBA i OkHCL dla zalewów oraz obwiedni.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Obsługa modeli kolorów RGBA i OkHCL dla zalewów oraz obwiedni.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Obsługa modeli kolorów RGBA i OkHCL dla zalewów oraz obwiedni.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/advanced/use-okhcl.md\",\"filePath\":\"pl/programmable/sdk/api/advanced/use-okhcl.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/advanced/use-okhcl.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="useokhcl" tabindex="-1">useOkHCL <a class="header-anchor" href="#useokhcl" aria-label="Permalink to “useOkHCL”">​</a></h1><p><code>useOkHCL()</code> odczytuje i zmienia model koloru używany przez zalewy oraz obwiednie. Pozwala włączyć albo wyłączyć OkHCL i aktualizować jego wartości.</p><p>Użyj composable w zaawansowanym selektorze koloru obsługującym zarówno RGBA, jak i percepcyjny model OkHCL.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><p>Zwracane API obejmuje odczyt modelu i koloru, włączanie, wyłączanie i aktualizację OkHCL oraz <code>modelOptions</code>.</p><h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./../composables/use-fill-controls">useFillControls</a></li><li><a href="./../composables/use-stroke-controls">useStrokeControls</a></li><li><a href="./../components/color-picker-root">ColorPickerRoot</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/advanced/use-okhcl.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_okhcl_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_okhcl_default as default };
