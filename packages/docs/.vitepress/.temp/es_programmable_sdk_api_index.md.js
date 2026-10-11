import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region es/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"Referencia de la API\",\"description\":\"Componentes, composables y API avanzadas de @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Referencia de la API\",\"description\":\"Componentes, composables y API avanzadas de @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Referencia de la API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Referencia de la API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Componentes, composables y API avanzadas de @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Componentes, composables y API avanzadas de @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Componentes, composables y API avanzadas de @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/sdk/api/index.md\",\"filePath\":\"es/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "es/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="referencia-de-la-api" tabindex="-1">Referencia de la API <a class="header-anchor" href="#referencia-de-la-api" aria-label="Permalink to “Referencia de la API”">​</a></h1><p>La referencia del SDK de Vue se divide en tres áreas.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Componentes",
					to: "/programmable/sdk/api/components/",
					description: "Componentes sin estilos como CanvasRoot, ToolbarRoot, FontPickerRoot y NumberField."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Estado y acciones para editor, lienzo, selección, comandos y paneles de propiedades."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "API avanzadas",
					to: "/programmable/sdk/api/advanced/",
					description: "Contextos de bajo nivel y funciones especializadas para integraciones propias."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Componentes",
					to: "/programmable/sdk/api/components/",
					description: "Componentes sin estilos como CanvasRoot, ToolbarRoot, FontPickerRoot y NumberField."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Estado y acciones para editor, lienzo, selección, comandos y paneles de propiedades."
				}),
				createVNode(_component_SdkCard, {
					title: "API avanzadas",
					to: "/programmable/sdk/api/advanced/",
					description: "Contextos de bajo nivel y funciones especializadas para integraciones propias."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="por-donde-empezar" tabindex="-1">Por dónde empezar <a class="header-anchor" href="#por-donde-empezar" aria-label="Permalink to “Por dónde empezar”">​</a></h2><ul><li><strong>Componentes</strong> para estructuras y controles reutilizables de la interfaz.</li><li><strong>Composables</strong> para estado y acciones del editor.</li><li><strong>API avanzadas</strong> para integraciones que necesiten acceso directo a estado o contexto de bajo nivel.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
