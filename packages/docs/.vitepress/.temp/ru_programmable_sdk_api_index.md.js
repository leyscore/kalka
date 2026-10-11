import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region ru/programmable/sdk/api/index.md
var __pageData = JSON.parse("{\"title\":\"Справочник API\",\"description\":\"Компоненты, composables и низкоуровневые API пакета @open-pencil/vue.\",\"frontmatter\":{\"title\":\"Справочник API\",\"description\":\"Компоненты, composables и низкоуровневые API пакета @open-pencil/vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Справочник API — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Справочник API — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Компоненты, composables и низкоуровневые API пакета @open-pencil/vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Компоненты, composables и низкоуровневые API пакета @open-pencil/vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Компоненты, composables и низкоуровневые API пакета @open-pencil/vue.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/index.md\",\"filePath\":\"ru/programmable/sdk/api/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="справочник-api" tabindex="-1">Справочник API <a class="header-anchor" href="#справочник-api" aria-label="Permalink to “Справочник API”">​</a></h1><p>Справочник Vue SDK состоит из трёх разделов.</p>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Компоненты",
					to: "/programmable/sdk/api/components/",
					description: "Структурные компоненты без предустановленных стилей: CanvasRoot, ToolbarRoot, FontPickerRoot, NumberFieldRoot и другие."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Composables для доступа к редактору, подключения холста, выделения, команд и панелей свойств."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Низкоуровневые API",
					to: "/programmable/sdk/api/advanced/",
					description: "Вспомогательные функции, контексты компонентов и специализированные API для нестандартной интеграции."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Компоненты",
					to: "/programmable/sdk/api/components/",
					description: "Структурные компоненты без предустановленных стилей: CanvasRoot, ToolbarRoot, FontPickerRoot, NumberFieldRoot и другие."
				}),
				createVNode(_component_SdkCard, {
					title: "Composables",
					to: "/programmable/sdk/api/composables/",
					description: "Composables для доступа к редактору, подключения холста, выделения, команд и панелей свойств."
				}),
				createVNode(_component_SdkCard, {
					title: "Низкоуровневые API",
					to: "/programmable/sdk/api/advanced/",
					description: "Вспомогательные функции, контексты компонентов и специализированные API для нестандартной интеграции."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="с-чего-начать" tabindex="-1">С чего начать <a class="header-anchor" href="#с-чего-начать" aria-label="Permalink to “С чего начать”">​</a></h2><ul><li>Выберите <strong>Components</strong>, если создаёте переиспользуемые элементы интерфейса редактора.</li><li>Выберите <strong>Composables</strong>, если подключаете состояние редактора и действия над ним.</li><li>Обращайтесь к <strong>Низкоуровневым API</strong>, только если возможностей первых двух разделов недостаточно.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var api_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, api_default as default };
