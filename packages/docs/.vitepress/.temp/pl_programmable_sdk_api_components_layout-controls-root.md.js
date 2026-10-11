import { t as data } from "./layout-controls-root.data.DBsNv9Yx.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { defineComponent, resolveComponent, unref, useSSRContext } from "vue";
//#region pl/programmable/sdk/api/components/layout-controls-root.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"LayoutControlsRoot\",\"description\":\"Komponent bez narzuconego wyglądu dla automatycznego układu i trybów rozmiaru.\",\"frontmatter\":{\"title\":\"LayoutControlsRoot\",\"description\":\"Komponent bez narzuconego wyglądu dla automatycznego układu i trybów rozmiaru.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/layout-controls-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/layout-controls-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/layout-controls-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"LayoutControlsRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"LayoutControlsRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponent bez narzuconego wyglądu dla automatycznego układu i trybów rozmiaru.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponent bez narzuconego wyglądu dla automatycznego układu i trybów rozmiaru.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponent bez narzuconego wyglądu dla automatycznego układu i trybów rozmiaru.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/components/layout-controls-root.md\",\"filePath\":\"pl/programmable/sdk/api/components/layout-controls-root.md\",\"lastUpdated\":1787240210000}");
var layout_controls_root_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "pl/programmable/sdk/api/components/layout-controls-root.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="layoutcontrolsroot" tabindex="-1">LayoutControlsRoot <a class="header-anchor" href="#layoutcontrolsroot" aria-label="Permalink to “LayoutControlsRoot”">​</a></h1><p><code>LayoutControlsRoot</code> przekazuje przez slot API zwracane przez <code>useLayout()</code>.</p><p>Aplikacja może wyrenderować własny panel automatycznego układu i rozmiarów, korzystając ze stanu i działań SDK.</p>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`<h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./../composables/use-layout">useLayout</a></li><li><a href="./../../guides/property-panels">Panele właściwości</a></li></ul></div>`);
		};
	}
});
//#endregion
//#region pl/programmable/sdk/api/components/layout-controls-root.md
var _sfc_setup = layout_controls_root_md_vue_type_script_setup_true_lang_default.setup;
layout_controls_root_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/components/layout-controls-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var layout_controls_root_default = layout_controls_root_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, layout_controls_root_default as default };
