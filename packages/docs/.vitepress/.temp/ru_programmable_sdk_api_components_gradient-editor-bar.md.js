import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region ru/programmable/sdk/api/components/gradient-editor-bar.md
var __pageData = JSON.parse("{\"title\":\"GradientEditorBar\",\"description\":\"Интерактивная полоса для выбора и перетаскивания точек градиента.\",\"frontmatter\":{\"title\":\"GradientEditorBar\",\"description\":\"Интерактивная полоса для выбора и перетаскивания точек градиента.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/gradient-editor-bar\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/gradient-editor-bar\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/gradient-editor-bar\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"GradientEditorBar — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"GradientEditorBar — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Интерактивная полоса для выбора и перетаскивания точек градиента.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Интерактивная полоса для выбора и перетаскивания точек градиента.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Интерактивная полоса для выбора и перетаскивания точек градиента.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/components/gradient-editor-bar.md\",\"filePath\":\"ru/programmable/sdk/api/components/gradient-editor-bar.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/components/gradient-editor-bar.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkPropsTable = resolveComponent("SdkPropsTable");
	const _component_SdkEventsTable = resolveComponent("SdkEventsTable");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="gradienteditorbar" tabindex="-1">GradientEditorBar <a class="header-anchor" href="#gradienteditorbar" aria-label="Permalink to “GradientEditorBar”">​</a></h1><p><code>GradientEditorBar</code> предоставляет состояние и обработчики указателя для отображения полосы градиента. Компонент управляет выбором и перетаскиванием точек.</p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to “Props”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [
		{
			name: "stops",
			type: "GradientStop[]",
			description: "Текущие точки градиента.",
			required: true
		},
		{
			name: "activeStopIndex",
			type: "number",
			description: "Индекс активной точки.",
			required: true
		},
		{
			name: "barBackground",
			type: "string",
			description: "CSS-фон полосы.",
			required: true
		}
	] }, null, _parent));
	_push(`<h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to “Events”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkEventsTable, { rows: [{
		name: "selectStop",
		payload: "index: number",
		description: "Вызывается при выборе точки."
	}, {
		name: "dragStop",
		payload: "index: number, position: number",
		description: "Вызывается во время перетаскивания точки."
	}] }, null, _parent));
	_push(`<h2 id="см-также" tabindex="-1">См. также <a class="header-anchor" href="#см-также" aria-label="Permalink to “См. также”">​</a></h2><ul><li><a href="./gradient-editor-root">GradientEditorRoot</a></li><li><a href="./gradient-editor-stop">GradientEditorStop</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/components/gradient-editor-bar.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var gradient_editor_bar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, gradient_editor_bar_default as default };
