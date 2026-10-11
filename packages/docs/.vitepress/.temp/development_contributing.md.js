import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/contributing.md
var __pageData = JSON.parse("{\"title\":\"Contributing\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/contributing\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/contributing\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/contributing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/contributing\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Contributing — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Contributing — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"development/contributing.md\",\"filePath\":\"development/contributing.md\",\"lastUpdated\":1790629326000}");
var _sfc_main = { name: "development/contributing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="contributing" tabindex="-1">Contributing <a class="header-anchor" href="#contributing" aria-label="Permalink to “Contributing”">​</a></h1><p>The root <a href="https://github.com/open-pencil/open-pencil/blob/master/CONTRIBUTING.md" target="_blank" rel="noreferrer"><code>CONTRIBUTING.md</code></a> is the source of truth for setup, pull-request requirements, validation, and commit expectations. The root <a href="https://github.com/open-pencil/open-pencil/blob/master/AGENTS.md" target="_blank" rel="noreferrer"><code>AGENTS.md</code></a> holds the repository map and cross-cutting conventions, and links the <code>AGENTS.md</code> guide inside each package or app domain. Read the root file and every guide on the path to the folder you change; coding agents pick them up the same way.</p><p>See <a href="/development/architecture">Architecture</a> for the system overview and <a href="/development/testing">Testing</a> for test ownership, fixtures, and commands. Use the root <code>AGENTS.md</code> map when exact package ownership or paths matter; do not infer ownership from an older copied tree.</p><h2 id="quick-start" tabindex="-1">Quick start <a class="header-anchor" href="#quick-start" aria-label="Permalink to “Quick start”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev:portless</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}"> # Editor at https://open-pencil.localhost</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> docs:dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">     # Docs at localhost:5173</span></span></code></pre></div><p>The complete gate before a pull request is <code>bun run check</code>, <code>bun run format</code>, <code>bun run test:unit</code>, and <code>bun run test</code>. Rendering and other pixel-affecting changes require targeted visual coverage.</p><h2 id="sdk-documentation" tabindex="-1">SDK documentation <a class="header-anchor" href="#sdk-documentation" aria-label="Permalink to “SDK documentation”">​</a></h2><p>VitePress is the canonical public documentation, while Storybook is the internal component-state workshop. Shared Vue demos live beside their SDK primitives and are embedded in both surfaces. The docs Tailwind entry scans these demos, so examples use the same utility-first styling in both environments.</p><p>Component API tables are extracted from Vue source and JSDoc with <code>vue-component-meta</code>. Keep descriptions next to public props, events, and slots instead of duplicating signatures in Markdown. VitePress processes SDK examples with Twoslash so imports and types stay aligned with the public package API.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/contributing.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var contributing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, contributing_default as default };
