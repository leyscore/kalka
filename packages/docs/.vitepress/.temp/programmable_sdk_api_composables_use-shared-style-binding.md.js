import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/sdk/api/composables/use-shared-style-binding.md
var __pageData = JSON.parse("{\"title\":\"useSharedStyleBinding\",\"description\":\"Apply and detach local fill, stroke, text, effect, and grid styles.\",\"frontmatter\":{\"title\":\"useSharedStyleBinding\",\"description\":\"Apply and detach local fill, stroke, text, effect, and grid styles.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-shared-style-binding\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/composables/use-shared-style-binding\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-shared-style-binding\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-shared-style-binding\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useSharedStyleBinding — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useSharedStyleBinding — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Apply and detach local fill, stroke, text, effect, and grid styles.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Apply and detach local fill, stroke, text, effect, and grid styles.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Apply and detach local fill, stroke, text, effect, and grid styles.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/composables/use-shared-style-binding.md\",\"filePath\":\"programmable/sdk/api/composables/use-shared-style-binding.md\",\"lastUpdated\":1784309302000}");
var _sfc_main = { name: "programmable/sdk/api/composables/use-shared-style-binding.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usesharedstylebinding" tabindex="-1">useSharedStyleBinding <a class="header-anchor" href="#usesharedstylebinding" aria-label="Permalink to “useSharedStyleBinding”">​</a></h1><p><code>useSharedStyleBinding(kind)</code> exposes the selected nodes&#39; shared-style reference, compatible local style definitions, and undo-aware bind/detach actions.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useSharedStyleBinding } </span><span style="${ssrRenderStyle({
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
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> fillStyle</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useSharedStyleBinding</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;fill&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">fillStyle.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;1:120&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">fillStyle.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">unbind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Supported kinds are <code>fill</code>, <code>stroke</code>, <code>text</code>, <code>effect</code>, and <code>grid</code>.</p><ul><li><code>active</code> requires every selected node to support the requested style domain.</li><li><code>styleId</code> is the shared ID, <code>null</code>, or <code>MIXED</code>.</li><li><code>styles</code> lists compatible local definitions imported with the document.</li><li><code>bind(id)</code> applies supported style properties and the reference in one undo step.</li><li><code>unbind()</code> keeps the resolved properties and removes only the reference.</li><li>Multi-selection changes are grouped into one undo entry.</li></ul><p>Manual edits to fills, strokes, supported text properties, effects, or layout grids automatically detach the matching style reference. Other style domains remain bound.</p><p>OpenPencil currently consumes styles already present in a document. Creating, renaming, publishing, and synchronizing style libraries is outside this composable&#39;s scope.</p><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./use-fill-controls">useFillControls</a></li><li><a href="./use-stroke-controls">useStrokeControls</a></li><li><a href="./use-typography">useTypography</a></li><li><a href="./use-effects-controls">useEffectsControls</a></li><li><a href="./../../guides/property-panels">Property Panels guide</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/composables/use-shared-style-binding.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_shared_style_binding_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_shared_style_binding_default as default };
