import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region de/programmable/sdk/api/components/index.md
var __pageData = JSON.parse("{\"title\":\"Komponenten\",\"description\":\"Komponenten ohne vorgegebenes Erscheinungsbild aus @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Komponenten\",\"description\":\"Komponenten ohne vorgegebenes Erscheinungsbild aus @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Komponenten — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Komponenten — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponenten ohne vorgegebenes Erscheinungsbild aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponenten ohne vorgegebenes Erscheinungsbild aus @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponenten ohne vorgegebenes Erscheinungsbild aus @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/api/components/index.md\",\"filePath\":\"de/programmable/sdk/api/components/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/api/components/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="komponenten" tabindex="-1">Komponenten <a class="header-anchor" href="#komponenten" aria-label="Permalink to “Komponenten”">​</a></h1><p><code>@open-pencil/vue</code> stellt Komponenten für Arbeitsfläche, Navigation, Eigenschaften und spezialisierte Eingaben bereit, ohne deren Gestaltung vorzuschreiben.</p><h2 id="editor" tabindex="-1">Editor <a class="header-anchor" href="#editor" aria-label="Permalink to “Editor”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Kontext und Struktur der Arbeitsfläche."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Canvas-Element innerhalb von CanvasRoot."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Vom SDK verwalteter Ebenenbaum."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Ein Eintrag im Ebenenbaum."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Zustand und Aktionen der Werkzeugleiste."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Ein Werkzeug der Leiste."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Vom SDK verwaltete Seitenliste."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Kontext und Struktur der Arbeitsfläche."
				}),
				createVNode(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Canvas-Element innerhalb von CanvasRoot."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Vom SDK verwalteter Ebenenbaum."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Ein Eintrag im Ebenenbaum."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Zustand und Aktionen der Werkzeugleiste."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Ein Werkzeug der Leiste."
				}),
				createVNode(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Vom SDK verwaltete Seitenliste."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="eigenschaften" tabindex="-1">Eigenschaften <a class="header-anchor" href="#eigenschaften" aria-label="Permalink to “Eigenschaften”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Gesteuerte Liste von Array-Eigenschaften."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Füllung, Kontur oder Effekt."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Position, Größe und Transformation."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Automatische Anordnung und Größenmodi."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Deckkraft, Sichtbarkeit und Eckenradius."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Schrift, Ausrichtung und Textformatierung."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Gesteuerte Liste von Array-Eigenschaften."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Füllung, Kontur oder Effekt."
				}),
				createVNode(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Position, Größe und Transformation."
				}),
				createVNode(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Automatische Anordnung und Größenmodi."
				}),
				createVNode(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Deckkraft, Sichtbarkeit und Eckenradius."
				}),
				createVNode(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Schrift, Ausrichtung und Textformatierung."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="auswahl-und-eingabe" tabindex="-1">Auswahl und Eingabe <a class="header-anchor" href="#auswahl-und-eingabe" aria-label="Permalink to “Auswahl und Eingabe”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Farbauswahl ohne vorgegebene Gestaltung."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Zustand und Aktionen eines Farbfelds."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Schriftauswahl mit Suche."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Kontext des Verlaufseditors."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Interaktive Verlaufsleiste."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Ein Verlaufspunkt."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Zahlenfeld mit Ziehen, Ausdrücken und Tastatursteuerung."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Farbauswahl ohne vorgegebene Gestaltung."
				}),
				createVNode(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Zustand und Aktionen eines Farbfelds."
				}),
				createVNode(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Schriftauswahl mit Suche."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Kontext des Verlaufseditors."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Interaktive Verlaufsleiste."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Ein Verlaufspunkt."
				}),
				createVNode(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Zahlenfeld mit Ziehen, Ausdrücken und Tastatursteuerung."
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/api/components/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, components_default as default };
