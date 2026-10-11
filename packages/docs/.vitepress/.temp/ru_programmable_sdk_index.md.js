import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region ru/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Создавайте редакторы на базе OpenPencil с помощью компонентов без встроенного оформления и composables для Vue.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Создавайте редакторы на базе OpenPencil с помощью компонентов без встроенного оформления и composables для Vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Создавайте редакторы на базе OpenPencil с помощью компонентов без встроенного оформления и composables для Vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Создавайте редакторы на базе OpenPencil с помощью компонентов без встроенного оформления и composables для Vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Создавайте редакторы на базе OpenPencil с помощью компонентов без встроенного оформления и composables для Vue.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/index.md\",\"filePath\":\"ru/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p><code>@open-pencil/vue</code> позволяет использовать OpenPencil не только как самостоятельный графический редактор.</p><p>OpenPencil можно встроить в другой продукт, внутренний инструмент или специализированный редактор, а не ограничиваться готовым интерфейсом приложения.</p><p>Само приложение OpenPencil — лишь один из вариантов интерфейса, построенного с помощью этого набора инструментов. SDK позволяет создать собственный вариант.</p><p>В SDK входят:</p><ul><li>контекст редактора, передаваемый через механизм внедрения зависимостей Vue;</li><li>отрисовка холста с помощью CanvasKit;</li><li>composables для выделения, команд, меню, панелей свойств и переменных;</li><li>структурные компоненты без встроенного оформления, в том числе <code>PageListRoot</code>, <code>PropertyListRoot</code> и <code>ToolbarRoot</code>;</li><li>средства локализации меню, панелей и диалогов, а также компоненты для выбора языка.</li></ul><h2 id="с-чего-начать" tabindex="-1">С чего начать <a class="header-anchor" href="#с-чего-начать" aria-label="Permalink to “С чего начать”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Начало работы",
					to: "/programmable/sdk/getting-started",
					description: "Установите пакет, создайте экземпляр редактора и подключите основные компоненты."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Архитектура",
					to: "/programmable/sdk/architecture",
					description: "Узнайте, как связаны composables, компоненты и контекст редактора."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Руководства",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Создайте собственный интерфейс редактора, панель свойств и панели навигации."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Справочник API",
					to: "/programmable/sdk/api/",
					description: "Изучите компоненты, composables и низкоуровневые публичные API."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Начало работы",
					to: "/programmable/sdk/getting-started",
					description: "Установите пакет, создайте экземпляр редактора и подключите основные компоненты."
				}),
				createVNode(_component_SdkCard, {
					title: "Архитектура",
					to: "/programmable/sdk/architecture",
					description: "Узнайте, как связаны composables, компоненты и контекст редактора."
				}),
				createVNode(_component_SdkCard, {
					title: "Руководства",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Создайте собственный интерфейс редактора, панель свойств и панели навигации."
				}),
				createVNode(_component_SdkCard, {
					title: "Справочник API",
					to: "/programmable/sdk/api/",
					description: "Изучите компоненты, composables и низкоуровневые публичные API."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="для-чего-нужен-sdk" tabindex="-1">Для чего нужен SDK <a class="header-anchor" href="#для-чего-нужен-sdk" aria-label="Permalink to “Для чего нужен SDK”">​</a></h2><p>Разным продуктам и командам нужны разные интерфейсы редактирования.</p><p>Одним нужен полноценный графический редактор, другим — компактный холст внутри приложения. SDK также подходит для внутренних инструментов, редакторов шаблонов и узкоспециализированных интерфейсов с поддержкой ИИ.</p><h2 id="принципы-устроиства-sdk" tabindex="-1">Принципы устройства SDK <a class="header-anchor" href="#принципы-устроиства-sdk" aria-label="Permalink to “Принципы устройства SDK”">​</a></h2><ul><li><strong>Без навязанного оформления:</strong> SDK предоставляет логику и структуру, но не определяет внешний вид приложения.</li><li><strong>Composable вместо лишней обёртки:</strong> если компоненту нечем управлять в структуре интерфейса, достаточно composable.</li><li><strong>Продуманный публичный API:</strong> стабильные возможности экспортируются из <code>packages/vue/src/index.ts</code>.</li><li><strong>Полноценная интеграция с Vue:</strong> SDK связывает Vue с возможностями <code>@open-pencil/core</code>.</li></ul><h2 id="два-уровня-api" tabindex="-1">Два уровня API <a class="header-anchor" href="#два-уровня-api" aria-label="Permalink to “Два уровня API”">​</a></h2><p>SDK состоит из двух основных уровней:</p><ol><li><strong>Composables</strong> предоставляют состояние редактора и действия над ним.</li><li><strong>Компоненты</strong> задают значимую структуру интерфейса.</li></ol><p>Если нужны только состояние и действия редактора, начните с composables. Если вы создаёте переиспользуемые части интерфейса, начните с компонентов.</p><h2 id="разделы-api" tabindex="-1">Разделы API <a class="header-anchor" href="#разделы-api" aria-label="Permalink to “Разделы API”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Компоненты</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">Низкоуровневые API</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
