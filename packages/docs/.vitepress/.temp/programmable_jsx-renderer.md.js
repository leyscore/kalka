import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"JSX Renderer\",\"description\":\"Create editable designs using the same declarative authoring library as OpenPencil agents.\",\"frontmatter\":{\"title\":\"JSX Renderer\",\"description\":\"Create editable designs using the same declarative authoring library as OpenPencil agents.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"JSX Renderer — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"JSX Renderer — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Create editable designs using the same declarative authoring library as OpenPencil agents.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Create editable designs using the same declarative authoring library as OpenPencil agents.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Create editable designs using the same declarative authoring library as OpenPencil agents.\"}]]},\"headers\":[],\"relativePath\":\"programmable/jsx-renderer.md\",\"filePath\":\"programmable/jsx-renderer.md\",\"lastUpdated\":1791027621000}");
var _sfc_main = { name: "programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="jsx-renderer" tabindex="-1">JSX Renderer <a class="header-anchor" href="#jsx-renderer" aria-label="Permalink to “JSX Renderer”">​</a></h1><p>OpenPencil&#39;s design JSX creates scene nodes, not browser DOM. You can use readable component trees, JavaScript expressions, and reusable functions to construct editable designs.</p><h2 id="creating-designs" tabindex="-1">Creating Designs <a class="header-anchor" href="#creating-designs" aria-label="Permalink to “Creating Designs”">​</a></h2><p>The <code>render</code> tool accepts JSX strings in AI chat and MCP. In application or headless library code, import <code>Frame</code>, <code>Text</code>, and other authoring exports from <code>@open-pencil/design-jsx</code>, then create nodes with <code>renderTree</code> or <code>renderJSX</code> from <code>@open-pencil/core/design-jsx</code>, which add icons, SVG conversion, and layout. To write the trees as TSX, set <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> with <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> in <code>tsconfig.json</code>, or add a <code>/** @jsxImportSource @open-pencil/design-jsx */</code> comment to the file. The scripting environment determines which APIs are exposed to <code>eval</code>; package exports are not automatically globals there.</p><p>The <a href="./../reference/design-authoring">shared design-authoring reference</a> contains executable examples, layout guidance, and the supported syntax inventory. It is generated from the same source used by chat, ACP, codegen prompts, and the installable agent skill.</p><h2 id="elements" tabindex="-1">Elements <a class="header-anchor" href="#elements" aria-label="Permalink to “Elements”">​</a></h2><p>Use frames and text for composition, shape nodes for artwork, and real components and instances for reusable editor content. A JavaScript function alone does not create component identity. See the <a href="./../reference/design-authoring#supported-syntax-inventory">element inventory</a>.</p><h2 id="style-props" tabindex="-1">Style Props <a class="header-anchor" href="#style-props" aria-label="Permalink to “Style Props”">​</a></h2><p>Use Hug/Fill and flex or grid for content-driven sizing. Bind semantic variables instead of copying values. See <a href="./../reference/design-authoring#composition-and-layout">composition and layout</a>, <a href="./../reference/design-authoring#paint-text-and-artwork">paint and text</a>, and <a href="./../reference/design-authoring#variables-and-components">variables and components</a>.</p><h2 id="exporting-to-jsx" tabindex="-1">Exporting to JSX <a class="header-anchor" href="#exporting-to-jsx" aria-label="Permalink to “Exporting to JSX”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                   # OpenPencil format</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --style</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # Tailwind classes</span></span></code></pre></div><p>Exported OpenPencil JSX can be edited and rendered back into the document. The export writes hidden and locked layers, constraints, size limits, stacked, gradient, and image fills, strokes, effects, masks, and variable bindings, so rendering an export reproduces them and <code>diff_jsx</code> shows changes to any of them. Rich text with mixed styles, vector paths, layout grids, shared styles, and component property definitions are not written yet. Instances are written as frames with their content, so exported JSX stands on its own. See <a href="./cli/exporting">CLI exports</a>.</p><h2 id="visual-diffing" tabindex="-1">Visual Diffing <a class="header-anchor" href="#visual-diffing" aria-label="Permalink to “Visual Diffing”">​</a></h2><p>JSX makes structural design changes reviewable as code. Use <code>get_jsx</code> and <code>diff_jsx</code> to inspect changes, then verify the actual rendered result; a clean structural diff does not prove visual equivalence.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
