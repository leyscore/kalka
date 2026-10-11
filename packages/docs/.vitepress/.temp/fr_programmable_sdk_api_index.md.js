import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region fr/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"Référence de l’API\",\"description\":\"Composants, composables et API avancées de @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Référence de l’API\",\"description\":\"Composants, composables et API avancées de @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Référence de l’API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Référence de l’API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Composants, composables et API avancées de @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Composants, composables et API avancées de @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Composants, composables et API avancées de @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/sdk/api/index.md\",\"filePath\":\"fr/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "fr/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="reference-de-l-api" tabindex="-1">Référence de l’API <a class="header-anchor" href="#reference-de-l-api" aria-label="Permalink to “Référence de l’API”">​</a></h1><p>La référence du SDK Vue se divise en trois domaines.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composants",
					to: "/programmable/sdk/api/components/",
					description: "Composants sans styles comme CanvasRoot, ToolbarRoot, FontPickerRoot et NumberField."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "État et actions pour l’éditeur, la zone de travail, la sélection, les commandes et les propriétés."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "API avancées",
					to: "/programmable/sdk/api/advanced/",
					description: "Contextes de bas niveau et fonctions spécialisées pour les intégrations propres."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Composants",
					to: "/programmable/sdk/api/components/",
					description: "Composants sans styles comme CanvasRoot, ToolbarRoot, FontPickerRoot et NumberField."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "État et actions pour l’éditeur, la zone de travail, la sélection, les commandes et les propriétés."
				}),
				createVNode(_component_SdkCard, {
					title: "API avancées",
					to: "/programmable/sdk/api/advanced/",
					description: "Contextes de bas niveau et fonctions spécialisées pour les intégrations propres."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="par-ou-commencer" tabindex="-1">Par où commencer <a class="header-anchor" href="#par-ou-commencer" aria-label="Permalink to “Par où commencer”">​</a></h2><ul><li><strong>Composants</strong> pour les structures et contrôles réutilisables de l’interface.</li><li><strong>Composables</strong> pour l’état et les actions de l’éditeur.</li><li><strong>API avancées</strong> pour les intégrations qui nécessitent un accès direct à l’état ou au contexte de bas niveau.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
