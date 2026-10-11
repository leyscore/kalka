import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region it/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"Riferimento API\",\"description\":\"Componenti, composable e API avanzate di @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Riferimento API\",\"description\":\"Componenti, composable e API avanzate di @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Riferimento API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Riferimento API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Componenti, composable e API avanzate di @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Componenti, composable e API avanzate di @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Componenti, composable e API avanzate di @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/api/index.md\",\"filePath\":\"it/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="riferimento-api" tabindex="-1">Riferimento API <a class="header-anchor" href="#riferimento-api" aria-label="Permalink to “Riferimento API”">​</a></h1><p>Il riferimento del Vue SDK è diviso in tre aree.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Componenti",
					to: "/programmable/sdk/api/components/",
					description: "Componenti senza stile come CanvasRoot, ToolbarRoot, FontPickerRoot e NumberField."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composable",
					to: "/programmable/sdk/api/composables/",
					description: "Stato e azioni per editor, area di lavoro, selezione, comandi e proprietà."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "API avanzate",
					to: "/programmable/sdk/api/advanced/",
					description: "Contesti di basso livello e funzioni specializzate per integrazioni personalizzate."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Componenti",
					to: "/programmable/sdk/api/components/",
					description: "Componenti senza stile come CanvasRoot, ToolbarRoot, FontPickerRoot e NumberField."
				}),
				createVNode(_component_SdkCard, {
					title: "Composable",
					to: "/programmable/sdk/api/composables/",
					description: "Stato e azioni per editor, area di lavoro, selezione, comandi e proprietà."
				}),
				createVNode(_component_SdkCard, {
					title: "API avanzate",
					to: "/programmable/sdk/api/advanced/",
					description: "Contesti di basso livello e funzioni specializzate per integrazioni personalizzate."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="da-dove-iniziare" tabindex="-1">Da dove iniziare <a class="header-anchor" href="#da-dove-iniziare" aria-label="Permalink to “Da dove iniziare”">​</a></h2><ul><li><strong>Componenti</strong> per strutture e controlli riutilizzabili.</li><li><strong>Composable</strong> per stato e azioni dell’editor.</li><li><strong>API avanzate</strong> per accesso diretto a stato o contesto di basso livello.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
