import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region pl/programmable/sdk/api/components/index.md
var __pageData = JSON.parse("{\"title\":\"Komponenty\",\"description\":\"Komponenty pakietu @open-pencil/vue bez narzuconego wyglądu.\",\"frontmatter\":{\"title\":\"Komponenty\",\"description\":\"Komponenty pakietu @open-pencil/vue bez narzuconego wyglądu.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Komponenty — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Komponenty — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Komponenty pakietu @open-pencil/vue bez narzuconego wyglądu.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Komponenty pakietu @open-pencil/vue bez narzuconego wyglądu.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Komponenty pakietu @open-pencil/vue bez narzuconego wyglądu.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/components/index.md\",\"filePath\":\"pl/programmable/sdk/api/components/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/components/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="komponenty" tabindex="-1">Komponenty <a class="header-anchor" href="#komponenty" aria-label="Permalink to “Komponenty”">​</a></h1><p><code>@open-pencil/vue</code> udostępnia komponenty bez narzuconego wyglądu dla obszaru roboczego, nawigacji, paneli właściwości i wyspecjalizowanych pól.</p><h2 id="edytor" tabindex="-1">Edytor <a class="header-anchor" href="#edytor" aria-label="Permalink to “Edytor”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Kontekst i struktura obszaru roboczego."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Element canvas wewnątrz CanvasRoot."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Drzewo warstw zarządzane przez SDK."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Jeden element drzewa warstw."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Stan i działania paska narzędzi."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Jedno narzędzie na pasku."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Lista stron zarządzana przez SDK."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Kontekst i struktura obszaru roboczego."
				}),
				createVNode(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Element canvas wewnątrz CanvasRoot."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Drzewo warstw zarządzane przez SDK."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Jeden element drzewa warstw."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Stan i działania paska narzędzi."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Jedno narzędzie na pasku."
				}),
				createVNode(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Lista stron zarządzana przez SDK."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="panele-własciwosci" tabindex="-1">Panele właściwości <a class="header-anchor" href="#panele-własciwosci" aria-label="Permalink to “Panele właściwości”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Kontrolowana lista właściwości tablicowych."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Zalew, obwiednia albo efekt."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Położenie, rozmiar i przekształcenia."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Automatyczny układ i tryby rozmiaru."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Przezroczystość, widoczność i promień narożników."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Czcionka, wyrównanie i formatowanie."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Kontrolowana lista właściwości tablicowych."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Zalew, obwiednia albo efekt."
				}),
				createVNode(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Położenie, rozmiar i przekształcenia."
				}),
				createVNode(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Automatyczny układ i tryby rozmiaru."
				}),
				createVNode(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Przezroczystość, widoczność i promień narożników."
				}),
				createVNode(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Czcionka, wyrównanie i formatowanie."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="wybor-wartosci-i-pola" tabindex="-1">Wybór wartości i pola <a class="header-anchor" href="#wybor-wartosci-i-pola" aria-label="Permalink to “Wybór wartości i pola”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Wybór koloru bez narzuconego wyglądu."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Stan i działania pola koloru."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Wybór czcionki z wyszukiwaniem."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Kontekst edytora gradientu."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Interaktywny pasek gradientu."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Jeden punkt gradientu."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Pole liczbowe z przeciąganiem, wyrażeniami i obsługą klawiatury."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Wybór koloru bez narzuconego wyglądu."
				}),
				createVNode(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Stan i działania pola koloru."
				}),
				createVNode(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Wybór czcionki z wyszukiwaniem."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Kontekst edytora gradientu."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Interaktywny pasek gradientu."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Jeden punkt gradientu."
				}),
				createVNode(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Pole liczbowe z przeciąganiem, wyrażeniami i obsługą klawiatury."
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/components/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, components_default as default };
