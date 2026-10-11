import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"API Reference\",\"description\":\"Reference documentation for @open-pencil/vue components, composables, and advanced APIs.\",\"frontmatter\":{\"title\":\"API Reference\",\"description\":\"Reference documentation for @open-pencil/vue components, composables, and advanced APIs.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"API Reference — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"API Reference — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Reference documentation for @open-pencil/vue components, composables, and advanced APIs.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Reference documentation for @open-pencil/vue components, composables, and advanced APIs.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Reference documentation for @open-pencil/vue components, composables, and advanced APIs.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/index.md\",\"filePath\":\"programmable/sdk/api/index.md\",\"lastUpdated\":1783711611000}");
var _sfc_main = { name: "programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="api-reference" tabindex="-1">API Reference <a class="header-anchor" href="#api-reference" aria-label="Permalink to “API Reference”">​</a></h1><p>The Vue SDK reference is organized into three sections.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Components",
					to: "/programmable/sdk/api/components/",
					description: "Headless structural primitives like CanvasRoot, ToolbarRoot, FontPickerRoot, and NumberFieldRoot."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Editor-facing composables for context, canvas wiring, selection, commands, and property panels."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Advanced",
					to: "/programmable/sdk/api/advanced/",
					description: "Lower-level helpers, primitive contexts, and specialized APIs for advanced integrations."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Components",
					to: "/programmable/sdk/api/components/",
					description: "Headless structural primitives like CanvasRoot, ToolbarRoot, FontPickerRoot, and NumberFieldRoot."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Editor-facing composables for context, canvas wiring, selection, commands, and property panels."
				}),
				createVNode(_component_SdkCard, {
					title: "Advanced",
					to: "/programmable/sdk/api/advanced/",
					description: "Lower-level helpers, primitive contexts, and specialized APIs for advanced integrations."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="suggested-path" tabindex="-1">Suggested path <a class="header-anchor" href="#suggested-path" aria-label="Permalink to “Suggested path”">​</a></h2><ul><li>Start with <strong>Components</strong> if you are building reusable editor UI primitives.</li><li>Start with <strong>Composables</strong> if you are wiring editor state and actions.</li><li>Use <strong>Advanced</strong> only when you need lower-level helpers or primitive contexts.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
