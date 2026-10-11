import { t as data } from "./appearance-controls-root.data.CMKsaq0y.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { defineComponent, resolveComponent, unref, useSSRContext } from "vue";
//#region pl/programmable/sdk/api/components/appearance-controls-root.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"AppearanceControlsRoot\",\"description\":\"Komponent bez narzuconego wyglądu dla przezroczystości, widoczności i promienia narożników.\",\"frontmatter\":{\"title\":\"AppearanceControlsRoot\",\"description\":\"Komponent bez narzuconego wyglądu dla przezroczystości, widoczności i promienia narożników.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/appearance-controls-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/appearance-controls-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/appearance-controls-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"AppearanceControlsRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"AppearanceControlsRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponent bez narzuconego wyglądu dla przezroczystości, widoczności i promienia narożników.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponent bez narzuconego wyglądu dla przezroczystości, widoczności i promienia narożników.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponent bez narzuconego wyglądu dla przezroczystości, widoczności i promienia narożników.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/components/appearance-controls-root.md\",\"filePath\":\"pl/programmable/sdk/api/components/appearance-controls-root.md\",\"lastUpdated\":1787240210000}");
var appearance_controls_root_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "pl/programmable/sdk/api/components/appearance-controls-root.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="appearancecontrolsroot" tabindex="-1">AppearanceControlsRoot <a class="header-anchor" href="#appearancecontrolsroot" aria-label="Permalink to “AppearanceControlsRoot”">​</a></h1><p><code>AppearanceControlsRoot</code> przekazuje przez slot stan i działania <code>useAppearance()</code>.</p><p>Aplikacja może zbudować własne pola przezroczystości, widoczności i promienia narożników bez ponownego implementowania logiki edytora.</p>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`<h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./../composables/use-appearance">useAppearance</a></li><li><a href="./../../guides/property-panels">Panele właściwości</a></li></ul></div>`);
		};
	}
});
//#endregion
//#region pl/programmable/sdk/api/components/appearance-controls-root.md
var _sfc_setup = appearance_controls_root_md_vue_type_script_setup_true_lang_default.setup;
appearance_controls_root_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/components/appearance-controls-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var appearance_controls_root_default = appearance_controls_root_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, appearance_controls_root_default as default };
