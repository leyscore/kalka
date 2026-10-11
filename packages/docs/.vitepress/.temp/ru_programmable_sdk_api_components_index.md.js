import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region ru/programmable/sdk/api/components/index.md
var __pageData = JSON.parse("{\"title\":\"Компоненты\",\"description\":\"Справочник компонентов без встроенного оформления из пакета @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Компоненты\",\"description\":\"Справочник компонентов без встроенного оформления из пакета @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Компоненты — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Компоненты — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Справочник компонентов без встроенного оформления из пакета @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Справочник компонентов без встроенного оформления из пакета @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Справочник компонентов без встроенного оформления из пакета @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/components/index.md\",\"filePath\":\"ru/programmable/sdk/api/components/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/components/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="компоненты" tabindex="-1">Компоненты <a class="header-anchor" href="#компоненты" aria-label="Permalink to “Компоненты”">​</a></h1><p><code>@open-pencil/vue</code> предоставляет компоненты без встроенного оформления для холста, навигации, панелей свойств и специализированных полей ввода.</p><h2 id="основные-компоненты-редактора" tabindex="-1">Основные компоненты редактора <a class="header-anchor" href="#основные-компоненты-редактора" aria-label="Permalink to “Основные компоненты редактора”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Структура и контекст холста."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Элемент canvas, подключённый к CanvasRoot."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Дерево слоёв без встроенного оформления."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Одна строка дерева слоёв."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Состояние и действия панели инструментов."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Один инструмент на панели."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Список страниц без встроенного оформления."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "CanvasRoot",
					to: "/programmable/sdk/api/components/canvas-root",
					description: "Структура и контекст холста."
				}),
				createVNode(_component_SdkCard, {
					title: "CanvasSurface",
					to: "/programmable/sdk/api/components/canvas-surface",
					description: "Элемент canvas, подключённый к CanvasRoot."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeRoot",
					to: "/programmable/sdk/api/components/layer-tree-root",
					description: "Дерево слоёв без встроенного оформления."
				}),
				createVNode(_component_SdkCard, {
					title: "LayerTreeItem",
					to: "/programmable/sdk/api/components/layer-tree-item",
					description: "Одна строка дерева слоёв."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarRoot",
					to: "/programmable/sdk/api/components/toolbar-root",
					description: "Состояние и действия панели инструментов."
				}),
				createVNode(_component_SdkCard, {
					title: "ToolbarItem",
					to: "/programmable/sdk/api/components/toolbar-item",
					description: "Один инструмент на панели."
				}),
				createVNode(_component_SdkCard, {
					title: "PageListRoot",
					to: "/programmable/sdk/api/components/page-list-root",
					description: "Список страниц без встроенного оформления."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="панель-своиств" tabindex="-1">Панель свойств <a class="header-anchor" href="#панель-своиств" aria-label="Permalink to “Панель свойств”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertySection",
					to: "/programmable/sdk/api/components/property-section",
					description: "Сворачиваемый раздел свойств и пустые состояния."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyGrid",
					to: "/programmable/sdk/api/components/property-grid",
					description: "Адаптивная сетка полей и область действий."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "SegmentedControl",
					to: "/programmable/sdk/api/components/segmented-control",
					description: "Доступная группа для выбора значений или отдельных действий."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Список повторяющихся свойств без встроенного оформления."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Строка заливки, обводки или эффекта."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Положение, размер и преобразования."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Автоматическая компоновка и режимы размеров."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ConstraintsControlRoot",
					to: "/programmable/sdk/api/components/constraints-control-root",
					description: "Ограничения дочернего объекта фрейма и действия над ними."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Прозрачность, видимость и радиус углов."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Шрифт, выравнивание и форматирование."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "PropertySection",
					to: "/programmable/sdk/api/components/property-section",
					description: "Сворачиваемый раздел свойств и пустые состояния."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyGrid",
					to: "/programmable/sdk/api/components/property-grid",
					description: "Адаптивная сетка полей и область действий."
				}),
				createVNode(_component_SdkCard, {
					title: "SegmentedControl",
					to: "/programmable/sdk/api/components/segmented-control",
					description: "Доступная группа для выбора значений или отдельных действий."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListRoot",
					to: "/programmable/sdk/api/components/property-list-root",
					description: "Список повторяющихся свойств без встроенного оформления."
				}),
				createVNode(_component_SdkCard, {
					title: "PropertyListItem",
					to: "/programmable/sdk/api/components/property-list-item",
					description: "Строка заливки, обводки или эффекта."
				}),
				createVNode(_component_SdkCard, {
					title: "PositionControlsRoot",
					to: "/programmable/sdk/api/components/position-controls-root",
					description: "Положение, размер и преобразования."
				}),
				createVNode(_component_SdkCard, {
					title: "LayoutControlsRoot",
					to: "/programmable/sdk/api/components/layout-controls-root",
					description: "Автоматическая компоновка и режимы размеров."
				}),
				createVNode(_component_SdkCard, {
					title: "ConstraintsControlRoot",
					to: "/programmable/sdk/api/components/constraints-control-root",
					description: "Ограничения дочернего объекта фрейма и действия над ними."
				}),
				createVNode(_component_SdkCard, {
					title: "AppearanceControlsRoot",
					to: "/programmable/sdk/api/components/appearance-controls-root",
					description: "Прозрачность, видимость и радиус углов."
				}),
				createVNode(_component_SdkCard, {
					title: "TypographyControlsRoot",
					to: "/programmable/sdk/api/components/typography-controls-root",
					description: "Шрифт, выравнивание и форматирование."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="выбор-значении-и-поля-ввода" tabindex="-1">Выбор значений и поля ввода <a class="header-anchor" href="#выбор-значении-и-поля-ввода" aria-label="Permalink to “Выбор значений и поля ввода”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Выбор цвета для размещения во всплывающей панели."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Поле ввода цвета без встроенного оформления."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "ChannelSlider",
					to: "/programmable/sdk/api/components/channel-slider",
					description: "Доступный ползунок каналов OkHCL."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FillRoot",
					to: "/programmable/sdk/api/components/fill-root",
					description: "Тип заливки и действия преобразования."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FillSwatch",
					to: "/programmable/sdk/api/components/fill-swatch",
					description: "Образец заливки с поддержкой привязки."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Выбор шрифта с поиском."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Состояние редактора градиента."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Интерактивная полоса градиента."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Одна точка градиента."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Числовое поле с перетаскиванием, выражениями и изменением с клавиатуры."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "BindableValue",
					to: "/programmable/sdk/api/components/bindable-value",
					description: "Связь значений с переменными и внешними токенами через поставщика данных."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "ColorPickerRoot",
					to: "/programmable/sdk/api/components/color-picker-root",
					description: "Выбор цвета для размещения во всплывающей панели."
				}),
				createVNode(_component_SdkCard, {
					title: "ColorInputRoot",
					to: "/programmable/sdk/api/components/color-input-root",
					description: "Поле ввода цвета без встроенного оформления."
				}),
				createVNode(_component_SdkCard, {
					title: "ChannelSlider",
					to: "/programmable/sdk/api/components/channel-slider",
					description: "Доступный ползунок каналов OkHCL."
				}),
				createVNode(_component_SdkCard, {
					title: "FillRoot",
					to: "/programmable/sdk/api/components/fill-root",
					description: "Тип заливки и действия преобразования."
				}),
				createVNode(_component_SdkCard, {
					title: "FillSwatch",
					to: "/programmable/sdk/api/components/fill-swatch",
					description: "Образец заливки с поддержкой привязки."
				}),
				createVNode(_component_SdkCard, {
					title: "FontPickerRoot",
					to: "/programmable/sdk/api/components/font-picker-root",
					description: "Выбор шрифта с поиском."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorRoot",
					to: "/programmable/sdk/api/components/gradient-editor-root",
					description: "Состояние редактора градиента."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorBar",
					to: "/programmable/sdk/api/components/gradient-editor-bar",
					description: "Интерактивная полоса градиента."
				}),
				createVNode(_component_SdkCard, {
					title: "GradientEditorStop",
					to: "/programmable/sdk/api/components/gradient-editor-stop",
					description: "Одна точка градиента."
				}),
				createVNode(_component_SdkCard, {
					title: "NumberField",
					to: "/programmable/sdk/api/components/number-field",
					description: "Числовое поле с перетаскиванием, выражениями и изменением с клавиатуры."
				}),
				createVNode(_component_SdkCard, {
					title: "BindableValue",
					to: "/programmable/sdk/api/components/bindable-value",
					description: "Связь значений с переменными и внешними токенами через поставщика данных."
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/components/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, components_default as default };
