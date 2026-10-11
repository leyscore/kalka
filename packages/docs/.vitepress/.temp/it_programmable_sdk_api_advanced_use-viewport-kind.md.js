import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/sdk/api/advanced/use-viewport-kind.md
var __pageData = JSON.parse("{\"title\":\"useViewportKind\",\"description\":\"Indicatori reattivi per viewport mobile e desktop in un’interfaccia personalizzata.\",\"frontmatter\":{\"title\":\"useViewportKind\",\"description\":\"Indicatori reattivi per viewport mobile e desktop in un’interfaccia personalizzata.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useViewportKind — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useViewportKind — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Indicatori reattivi per viewport mobile e desktop in un’interfaccia personalizzata.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Indicatori reattivi per viewport mobile e desktop in un’interfaccia personalizzata.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Indicatori reattivi per viewport mobile e desktop in un’interfaccia personalizzata.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/api/advanced/use-viewport-kind.md\",\"filePath\":\"it/programmable/sdk/api/advanced/use-viewport-kind.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/api/advanced/use-viewport-kind.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="useviewportkind" tabindex="-1">useViewportKind <a class="header-anchor" href="#useviewportkind" aria-label="Permalink to “useViewportKind”">​</a></h1><p><code>useViewportKind()</code> restituisce una classificazione semplificata della dimensione del viewport usata dall’interfaccia reattiva di OpenPencil.</p><p>Usalo quando basta distinguere mobile e desktop senza configurare direttamente <code>useBreakpoints()</code>.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">isMobile</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">isDesktop</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useViewportKind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><h2 id="vedi-anche" tabindex="-1">Vedi anche <a class="header-anchor" href="#vedi-anche" aria-label="Permalink to “Vedi anche”">​</a></h2><ul><li><a href="./../composables/use-canvas">useCanvas</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/api/advanced/use-viewport-kind.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_viewport_kind_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_viewport_kind_default as default };
