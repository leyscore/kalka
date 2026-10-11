import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region pl/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"Dokumentacja API\",\"description\":\"Komponenty, composables i niskopoziomowe API pakietu @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Dokumentacja API\",\"description\":\"Komponenty, composables i niskopoziomowe API pakietu @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Dokumentacja API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Dokumentacja API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponenty, composables i niskopoziomowe API pakietu @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponenty, composables i niskopoziomowe API pakietu @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponenty, composables i niskopoziomowe API pakietu @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/index.md\",\"filePath\":\"pl/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="dokumentacja-api" tabindex="-1">Dokumentacja API <a class="header-anchor" href="#dokumentacja-api" aria-label="Permalink to “Dokumentacja API”">​</a></h1><p>Dokumentacja Vue SDK składa się z trzech sekcji.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Komponenty",
					to: "/programmable/sdk/api/components/",
					description: "Strukturalne komponenty bez narzuconego wyglądu, takie jak CanvasRoot, ToolbarRoot, FontPickerRoot i NumberFieldRoot."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Composables zapewniające dostęp do edytora, obszaru roboczego, zaznaczenia, poleceń i paneli właściwości."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Niskopoziomowe API",
					to: "/programmable/sdk/api/advanced/",
					description: "Funkcje pomocnicze, konteksty komponentów i wyspecjalizowane API do niestandardowych integracji."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Komponenty",
					to: "/programmable/sdk/api/components/",
					description: "Strukturalne komponenty bez narzuconego wyglądu, takie jak CanvasRoot, ToolbarRoot, FontPickerRoot i NumberFieldRoot."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Composables zapewniające dostęp do edytora, obszaru roboczego, zaznaczenia, poleceń i paneli właściwości."
				}),
				createVNode(_component_SdkCard, {
					title: "Niskopoziomowe API",
					to: "/programmable/sdk/api/advanced/",
					description: "Funkcje pomocnicze, konteksty komponentów i wyspecjalizowane API do niestandardowych integracji."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="od-czego-zaczac" tabindex="-1">Od czego zacząć <a class="header-anchor" href="#od-czego-zaczac" aria-label="Permalink to “Od czego zacząć”">​</a></h2><ul><li>Wybierz <strong>Komponenty</strong>, jeśli tworzysz elementy interfejsu edytora przeznaczone do ponownego użycia.</li><li>Wybierz <strong>Composables</strong>, jeśli podłączasz stan edytora i operacje na nim.</li><li>Sięgaj po <strong>Niskopoziomowe API</strong> tylko wtedy, gdy możliwości dwóch pierwszych sekcji nie wystarczają.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
