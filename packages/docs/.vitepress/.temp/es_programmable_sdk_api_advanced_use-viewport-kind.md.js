import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/programmable/sdk/api/advanced/use-viewport-kind.md
var __pageData = JSON.parse("{\"title\":\"useViewportKind\",\"description\":\"Flags reactivos Mobile y Desktop para una interfaz de edición propia.\",\"frontmatter\":{\"title\":\"useViewportKind\",\"description\":\"Flags reactivos Mobile y Desktop para una interfaz de edición propia.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-viewport-kind\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useViewportKind — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useViewportKind — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Flags reactivos Mobile y Desktop para una interfaz de edición propia.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Flags reactivos Mobile y Desktop para una interfaz de edición propia.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Flags reactivos Mobile y Desktop para una interfaz de edición propia.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/sdk/api/advanced/use-viewport-kind.md\",\"filePath\":\"es/programmable/sdk/api/advanced/use-viewport-kind.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "es/programmable/sdk/api/advanced/use-viewport-kind.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="useviewportkind" tabindex="-1">useViewportKind <a class="header-anchor" href="#useviewportkind" aria-label="Permalink to “useViewportKind”">​</a></h1><p><code>useViewportKind()</code> devuelve una clasificación simplificada del Viewport size utilizada por la UI responsive de OpenPencil.</p><p>Usa el composable cuando solo necesites distinguir entre Mobile y Desktop sin configurar <code>useBreakpoints()</code> directamente.</p><h2 id="uso" tabindex="-1">Uso <a class="header-anchor" href="#uso" aria-label="Permalink to “Uso”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useViewportKind } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><h2 id="values" tabindex="-1">Values <a class="header-anchor" href="#values" aria-label="Permalink to “Values”">​</a></h2><ul><li><code>isMobile</code></li><li><code>isDesktop</code></li></ul><h2 id="consulta-tambien" tabindex="-1">Consulta también <a class="header-anchor" href="#consulta-tambien" aria-label="Permalink to “Consulta también”">​</a></h2><ul><li><a href="./../composables/use-canvas">useCanvas</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/sdk/api/advanced/use-viewport-kind.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_viewport_kind_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_viewport_kind_default as default };
