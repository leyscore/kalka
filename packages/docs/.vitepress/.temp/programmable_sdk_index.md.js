import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Build OpenPencil-powered editors with headless Vue composables and primitives.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Build OpenPencil-powered editors with headless Vue composables and primitives.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Build OpenPencil-powered editors with headless Vue composables and primitives.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Build OpenPencil-powered editors with headless Vue composables and primitives.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Build OpenPencil-powered editors with headless Vue composables and primitives.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/index.md\",\"filePath\":\"programmable/sdk/index.md\",\"lastUpdated\":1774872691000}");
var _sfc_main = { name: "programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p><code>@open-pencil/vue</code> exists so OpenPencil can be more than a standalone design app.</p><p>The goal is to make OpenPencil a toolkit you can embed into other products, internal tools, and workflow-specific editors — not just a single default UI.</p><p>The OpenPencil app is one composition of that toolkit. The SDK is how you build a different one.</p><p>It gives you:</p><ul><li>injected editor context</li><li>CanvasKit-backed canvas rendering</li><li>selection, commands, menu, property-panel, and variables composables</li><li>headless structural primitives like <code>PageListRoot</code>, <code>PropertyListRoot</code>, and <code>ToolbarRoot</code></li><li>built-in i18n primitives for menus, panels, dialogs, and custom locale pickers</li></ul><h2 id="start-here" tabindex="-1">Start here <a class="header-anchor" href="#start-here" aria-label="Permalink to “Start here”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Getting Started",
					to: "/programmable/sdk/getting-started",
					description: "Install the package, create an editor instance, and mount the core primitives."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Architecture",
					to: "/programmable/sdk/architecture",
					description: "See how composables, primitives, and editor context fit together."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Guides",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Build custom shells, property panels, and navigation panels."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "API Reference",
					to: "/programmable/sdk/api/",
					description: "Browse components, composables, and advanced public APIs."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Getting Started",
					to: "/programmable/sdk/getting-started",
					description: "Install the package, create an editor instance, and mount the core primitives."
				}),
				createVNode(_component_SdkCard, {
					title: "Architecture",
					to: "/programmable/sdk/architecture",
					description: "See how composables, primitives, and editor context fit together."
				}),
				createVNode(_component_SdkCard, {
					title: "Guides",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Build custom shells, property panels, and navigation panels."
				}),
				createVNode(_component_SdkCard, {
					title: "API Reference",
					to: "/programmable/sdk/api/",
					description: "Browse components, composables, and advanced public APIs."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="why-the-sdk-exists" tabindex="-1">Why the SDK exists <a class="header-anchor" href="#why-the-sdk-exists" aria-label="Permalink to “Why the SDK exists”">​</a></h2><p>Different products and teams need different editing surfaces.</p><p>Sometimes you want a full design editor. Sometimes you want a focused canvas inside another app. Sometimes you want an internal workflow tool, a template editor, or an AI-assisted editing surface built around a narrow use case.</p><p>The SDK is the layer that makes those possible.</p><h2 id="design-principles" tabindex="-1">Design principles <a class="header-anchor" href="#design-principles" aria-label="Permalink to “Design principles”">​</a></h2><ul><li><strong>Headless first</strong>: logic and structure, not app styling</li><li><strong>Composable over wrapper</strong>: use composables when there is no meaningful structural coordination</li><li><strong>Intentional public API</strong>: stable exports from <code>packages/vue/src/index.ts</code></li><li><strong>Framework-aware</strong>: Vue integration over <code>@open-pencil/core</code></li></ul><h2 id="how-to-think-about-the-package" tabindex="-1">How to think about the package <a class="header-anchor" href="#how-to-think-about-the-package" aria-label="Permalink to “How to think about the package”">​</a></h2><p>The SDK has two main layers:</p><ol><li><strong>Composables</strong> for editor state and actions</li><li><strong>Primitives</strong> for meaningful UI structure</li></ol><p>If you only need editor state and actions, start with composables. If you are building reusable editor UI building blocks, start with primitives.</p><h2 id="api-sections" tabindex="-1">API sections <a class="header-anchor" href="#api-sections" aria-label="Permalink to “API sections”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Components</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">Advanced</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
