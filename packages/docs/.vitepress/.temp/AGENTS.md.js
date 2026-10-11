import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region AGENTS.md
var __pageData = JSON.parse("{\"title\":\"Docs site\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/AGENTS\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/AGENTS\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/AGENTS\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/AGENTS\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Docs site — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Docs site — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"AGENTS.md\",\"filePath\":\"AGENTS.md\",\"lastUpdated\":1790730031000}");
var _sfc_main = { name: "AGENTS.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="docs-site" tabindex="-1">Docs site <a class="header-anchor" href="#docs-site" aria-label="Permalink to “Docs site”">​</a></h1><p>Published VitePress site. <code>bun run docs:dev</code>, <code>bun run docs:build</code> for fast checks, and <code>bun run docs:build:production</code> for deployment output. <code>bun run check:docs</code> runs the integrity checks in <code>tools/checks/docs/</code> plus <code>check:authoring-reference</code>.</p><ul><li>Keep routes under <code>/getting-started</code>, <code>/overview/**</code>, <code>/user-guide/**</code>, <code>/programmable/**</code>, <code>/reference/**</code>, and <code>/development/**</code>; do not recreate <code>/guide/**</code>. Preserve moves in <code>packages/docs/public/_redirects</code>.</li><li>Link untranslated locale navigation to canonical English pages rather than adding placeholders.</li><li><code>packages/docs/development/roadmap.md</code> tracks product direction, Figma compatibility gaps, raw metadata coverage, and the code map. <code>packages/docs/development/testing.md</code> is the canonical testing architecture. Explanations that would bloat an <code>AGENTS.md</code> belong under <code>packages/docs/development/</code>.</li><li>SDK pages embed the demos colocated with <code>packages/vue</code> primitives, derive API tables from source and JSDoc with <code>vue-component-meta</code>, and process examples with Twoslash so imports and types stay aligned with the public package API. The docs Tailwind entry scans those demos.</li><li>Generated authoring-reference copies under this site are checked, not edited; run <code>bun run generate:authoring-reference</code> (<code>packages/core/AGENTS.md</code>, Tools).</li><li>CI runs documentation integrity and the docs build for docs-only changes, not engine, browser, Storybook, or native suites (<code>tools/AGENTS.md</code>).</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("AGENTS.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AGENTS_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, AGENTS_default as default };
