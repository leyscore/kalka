import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region de/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"API-Referenz\",\"description\":\"Komponenten, Composables und erweiterte APIs aus @open-pencil/vue.\",\"frontmatter\":{\"title\":\"API-Referenz\",\"description\":\"Komponenten, Composables und erweiterte APIs aus @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"API-Referenz — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"API-Referenz — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponenten, Composables und erweiterte APIs aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponenten, Composables und erweiterte APIs aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponenten, Composables und erweiterte APIs aus @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/api/index.md\",\"filePath\":\"de/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="api-referenz" tabindex="-1">API-Referenz <a class="header-anchor" href="#api-referenz" aria-label="Permalink to “API-Referenz”">​</a></h1><p>Die Referenz des Vue SDK ist in drei Bereiche gegliedert.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Komponenten",
					to: "/programmable/sdk/api/components/",
					description: "Komponenten ohne vorgegebenes Erscheinungsbild wie CanvasRoot, ToolbarRoot, FontPickerRoot und NumberField."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Zustand und Aktionen für Editorkontext, Arbeitsfläche, Auswahl, Befehle und Eigenschaften-Panels."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Erweiterte API",
					to: "/programmable/sdk/api/advanced/",
					description: "Kontext-APIs auf niedriger Ebene und spezialisierte Funktionen für eigene Integrationen."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Komponenten",
					to: "/programmable/sdk/api/components/",
					description: "Komponenten ohne vorgegebenes Erscheinungsbild wie CanvasRoot, ToolbarRoot, FontPickerRoot und NumberField."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Zustand und Aktionen für Editorkontext, Arbeitsfläche, Auswahl, Befehle und Eigenschaften-Panels."
				}),
				createVNode(_component_SdkCard, {
					title: "Erweiterte API",
					to: "/programmable/sdk/api/advanced/",
					description: "Kontext-APIs auf niedriger Ebene und spezialisierte Funktionen für eigene Integrationen."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="einstieg" tabindex="-1">Einstieg <a class="header-anchor" href="#einstieg" aria-label="Permalink to “Einstieg”">​</a></h2><ul><li><strong>Komponenten</strong> für wiederverwendbare Strukturen und Steuerelemente.</li><li><strong>Composables</strong> für Editorzustand und Aktionen.</li><li><strong>Erweiterte API</strong> für Integrationen mit direktem Zugriff auf Zustand oder Kontext auf niedriger Ebene.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
