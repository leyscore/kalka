import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region es/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Crea editores basados en OpenPencil con componentes sin estilos y composables para Vue.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Crea editores basados en OpenPencil con componentes sin estilos y composables para Vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Crea editores basados en OpenPencil con componentes sin estilos y composables para Vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Crea editores basados en OpenPencil con componentes sin estilos y composables para Vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Crea editores basados en OpenPencil con componentes sin estilos y composables para Vue.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/sdk/index.md\",\"filePath\":\"es/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "es/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p><code>@open-pencil/vue</code> permite utilizar OpenPencil más allá de la aplicación de diseño independiente.</p><p>Puedes integrar OpenPencil en otros productos, herramientas internas o editores especializados sin depender de la interfaz predeterminada de la aplicación.</p><p>La aplicación OpenPencil es solo una de las interfaces creadas con este conjunto de herramientas. El SDK te permite construir la tuya.</p><p>El SDK proporciona:</p><ul><li>el contexto del editor mediante dependency injection de Vue;</li><li>renderizado del lienzo con CanvasKit;</li><li>composables para la selección, los comandos, los menús, los paneles de propiedades y las variables;</li><li>componentes estructurales sin estilos como <code>PageListRoot</code>, <code>PropertyListRoot</code> y <code>ToolbarRoot</code>;</li><li>localización para menús, paneles y diálogos, además de componentes para seleccionar el idioma.</li></ul><h2 id="por-donde-empezar" tabindex="-1">Por dónde empezar <a class="header-anchor" href="#por-donde-empezar" aria-label="Permalink to “Por dónde empezar”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Primeros pasos",
					to: "/programmable/sdk/getting-started",
					description: "Instala el paquete, crea una instancia del editor y conecta los componentes principales."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Arquitectura",
					to: "/programmable/sdk/architecture",
					description: "Descubre cómo se relacionan los composables, los componentes y el contexto del editor."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Guías",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Crea interfaces de editor, paneles de propiedades y paneles de navegación personalizados."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Referencia de la API",
					to: "/programmable/sdk/api/",
					description: "Consulta los componentes, los composables y las API de bajo nivel."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Primeros pasos",
					to: "/programmable/sdk/getting-started",
					description: "Instala el paquete, crea una instancia del editor y conecta los componentes principales."
				}),
				createVNode(_component_SdkCard, {
					title: "Arquitectura",
					to: "/programmable/sdk/architecture",
					description: "Descubre cómo se relacionan los composables, los componentes y el contexto del editor."
				}),
				createVNode(_component_SdkCard, {
					title: "Guías",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Crea interfaces de editor, paneles de propiedades y paneles de navegación personalizados."
				}),
				createVNode(_component_SdkCard, {
					title: "Referencia de la API",
					to: "/programmable/sdk/api/",
					description: "Consulta los componentes, los composables y las API de bajo nivel."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="para-que-sirve-el-sdk" tabindex="-1">Para qué sirve el SDK <a class="header-anchor" href="#para-que-sirve-el-sdk" aria-label="Permalink to “Para qué sirve el SDK”">​</a></h2><p>Cada producto y cada equipo necesita una experiencia de edición diferente.</p><p>Puede tratarse de un editor de diseño completo, un lienzo integrado en otra aplicación, una herramienta interna, un editor de plantillas o una interfaz especializada con funciones de IA.</p><h2 id="principios-de-diseno" tabindex="-1">Principios de diseño <a class="header-anchor" href="#principios-de-diseno" aria-label="Permalink to “Principios de diseño”">​</a></h2><ul><li><strong>Sin estilos por diseño:</strong> el SDK proporciona lógica y estructura, pero no impone el aspecto de la aplicación.</li><li><strong>Composable en lugar de un wrapper innecesario:</strong> si no hay que coordinar la estructura de la interfaz, basta con un composable.</li><li><strong>API pública deliberada:</strong> las funciones estables se exportan desde <code>packages/vue/src/index.ts</code>.</li><li><strong>Integración estrecha con Vue:</strong> el SDK conecta Vue con las funciones de <code>@open-pencil/core</code>.</li></ul><h2 id="dos-niveles-de-api" tabindex="-1">Dos niveles de API <a class="header-anchor" href="#dos-niveles-de-api" aria-label="Permalink to “Dos niveles de API”">​</a></h2><p>El SDK consta de dos niveles principales:</p><ol><li>Los <strong>composables</strong> proporcionan el estado del editor y las operaciones relacionadas.</li><li>Los <strong>componentes</strong> definen una estructura de interfaz significativa.</li></ol><p>Si solo necesitas el estado y las operaciones del editor, empieza por los composables. Si estás creando partes reutilizables de la interfaz, empieza por los componentes.</p><h2 id="secciones-de-la-api" tabindex="-1">Secciones de la API <a class="header-anchor" href="#secciones-de-la-api" aria-label="Permalink to “Secciones de la API”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Componentes</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">API de bajo nivel</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
