import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { defineComponent, resolveComponent, unref, useSSRContext } from "vue";
//#region programmable/sdk/api/components/constraints-control-root.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"ConstraintsControlRoot\",\"source\":\"packages/vue/src/primitives/ConstraintsControl/ConstraintsControlRoot.vue\",\"props\":[],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"ConstraintsControlRootSlotProps\",\"description\":\"Constraint state and undo-aware actions for the current eligible selection.\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/constraints-control-root.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"ConstraintsControlRoot\",\"description\":\"Headless constraint state and actions for frame children.\",\"frontmatter\":{\"title\":\"ConstraintsControlRoot\",\"description\":\"Headless constraint state and actions for frame children.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/constraints-control-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/constraints-control-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/constraints-control-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/constraints-control-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"ConstraintsControlRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"ConstraintsControlRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Headless constraint state and actions for frame children.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Headless constraint state and actions for frame children.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Headless constraint state and actions for frame children.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/constraints-control-root.md\",\"filePath\":\"programmable/sdk/api/components/constraints-control-root.md\",\"lastUpdated\":1784302378000}");
var constraints_control_root_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/constraints-control-root.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="constraintscontrolroot" tabindex="-1">ConstraintsControlRoot <a class="header-anchor" href="#constraintscontrolroot" aria-label="Permalink to “ConstraintsControlRoot”">​</a></h1><p><code>ConstraintsControlRoot</code> exposes horizontal and vertical resize constraints for the current eligible selection. It is active for children of frames, components, component sets, and instances. Normal auto-layout children and top-level page layers are excluded; absolutely positioned auto-layout children remain eligible.</p><p>The default slot provides concrete or mixed axis values and undo-aware actions for setting modes or building an interactive pin control. Multi-selection changes are grouped into one undo entry.</p><p>Constraint values match the Figma Plugin API: <code>MIN</code>, <code>CENTER</code>, <code>MAX</code>, <code>STRETCH</code>, and <code>SCALE</code>.</p><h2 id="generated-api-reference" tabindex="-1">Generated API reference <a class="header-anchor" href="#generated-api-reference" aria-label="Permalink to “Generated API reference”">​</a></h2><p>The following tables are extracted from the Vue source and JSDoc during the documentation build.</p>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`<h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./position-controls-root">PositionControlsRoot</a></li><li><a href="./layout-controls-root">LayoutControlsRoot</a></li><li><a href="./../../guides/property-panels">Property Panels guide</a></li></ul></div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/constraints-control-root.md
var _sfc_setup = constraints_control_root_md_vue_type_script_setup_true_lang_default.setup;
constraints_control_root_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/constraints-control-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var constraints_control_root_default = constraints_control_root_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, constraints_control_root_default as default };
