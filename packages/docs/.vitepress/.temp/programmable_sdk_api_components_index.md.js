import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/components/index.md
var __pageData = JSON.parse("{\"title\":\"Components\",\"description\":\"Component reference for headless Vue primitives in @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Components\",\"description\":\"Component reference for headless Vue primitives in @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Components — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Components — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Component reference for headless Vue primitives in @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Component reference for headless Vue primitives in @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Component reference for headless Vue primitives in @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/index.md\",\"filePath\":\"programmable/sdk/api/components/index.md\",\"lastUpdated\":1785058970000}");
var _sfc_main = { name: "programmable/sdk/api/components/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to “Components”">​</a></h1><p><code>@open-pencil/vue</code> exposes headless structural primitives for canvas wiring, navigation UI, property panels, and focused input controls.</p><h2 id="core-editor-primitives" tabindex="-1">Core editor primitives <a class="header-anchor" href="#core-editor-primitives" aria-label="Permalink to “Core editor primitives”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Headless canvas structure and context."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Canvas element primitive bound to CanvasRoot context."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Headless layer tree primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Single layer-tree row primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Headless toolbar primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Single toolbar tool primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Headless page list primitive."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Headless canvas structure and context."
				}),
				createVNode(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Canvas element primitive bound to CanvasRoot context."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Headless layer tree primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Single layer-tree row primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Headless toolbar primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Single toolbar tool primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Headless page list primitive."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="property-panel-primitives" tabindex="-1">Property panel primitives <a class="header-anchor" href="#property-panel-primitives" aria-label="Permalink to “Property panel primitives”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertySection",
					to: "/programmable/sdk/api/components/property-section",
					description: "Collapsible property-section anatomy and empty states."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyGrid",
					to: "/programmable/sdk/api/components/property-grid",
					description: "Responsive field-grid and action-rail anatomy."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "SegmentedControl",
					to: "/programmable/sdk/api/components/segmented-control",
					description: "Accessible selection and action-only segment groups."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Headless property list primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Single fills, strokes, or effects row primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Position, size, and transform controls."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Auto-layout and sizing controls."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ConstraintsControlRoot",
					to: "/programmable/sdk/api/components/constraints-control-root",
					description: "Frame-child resize constraint state and actions."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Opacity, visibility, and corner-radius controls."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Font, alignment, and formatting controls."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "PropertySection",
					to: "/programmable/sdk/api/components/property-section",
					description: "Collapsible property-section anatomy and empty states."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyGrid",
					to: "/programmable/sdk/api/components/property-grid",
					description: "Responsive field-grid and action-rail anatomy."
				}),
				createVNode(_component_SdkCard, {
					title: "SegmentedControl",
					to: "/programmable/sdk/api/components/segmented-control",
					description: "Accessible selection and action-only segment groups."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Headless property list primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Single fills, strokes, or effects row primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Position, size, and transform controls."
				}),
				createVNode(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Auto-layout and sizing controls."
				}),
				createVNode(_component_SdkCard, {
					title: "ConstraintsControlRoot",
					to: "/programmable/sdk/api/components/constraints-control-root",
					description: "Frame-child resize constraint state and actions."
				}),
				createVNode(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Opacity, visibility, and corner-radius controls."
				}),
				createVNode(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Font, alignment, and formatting controls."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="pickers-and-inputs" tabindex="-1">Pickers and inputs <a class="header-anchor" href="#pickers-and-inputs" aria-label="Permalink to “Pickers and inputs”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Popover-based color picker primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Headless color input helper."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ChannelSlider",
					to: "/programmable/sdk/api/components/channel-slider",
					description: "Accessible scalar slider for OkHCL channels."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FillRoot",
					to: "/programmable/sdk/api/components/fill-root",
					description: "Fill category state and conversion actions."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FillSwatch",
					to: "/programmable/sdk/api/components/fill-swatch",
					description: "Binding-aware semantic fill preview."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Searchable font picker primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Root primitive for gradient editing."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Draggable gradient bar primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Single gradient stop primitive."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Numeric field anatomy with scrubbing, expressions, and keyboard stepping."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "BindableValue",
					to: "/programmable/sdk/api/components/bindable-value",
					description: "Provider-driven variable and token binding composition."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Popover-based color picker primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Headless color input helper."
				}),
				createVNode(_component_SdkCard, {
					title: "ChannelSlider",
					to: "/programmable/sdk/api/components/channel-slider",
					description: "Accessible scalar slider for OkHCL channels."
				}),
				createVNode(_component_SdkCard, {
					title: "FillRoot",
					to: "/programmable/sdk/api/components/fill-root",
					description: "Fill category state and conversion actions."
				}),
				createVNode(_component_SdkCard, {
					title: "FillSwatch",
					to: "/programmable/sdk/api/components/fill-swatch",
					description: "Binding-aware semantic fill preview."
				}),
				createVNode(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Searchable font picker primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Root primitive for gradient editing."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Draggable gradient bar primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Single gradient stop primitive."
				}),
				createVNode(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Numeric field anatomy with scrubbing, expressions, and keyboard stepping."
				}),
				createVNode(_component_SdkCard, {
					title: "BindableValue",
					to: "/programmable/sdk/api/components/bindable-value",
					description: "Provider-driven variable and token binding composition."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, components_default as default };
