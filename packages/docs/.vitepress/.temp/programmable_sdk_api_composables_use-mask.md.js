import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/sdk/api/composables/use-mask.md
var __pageData = JSON.parse("{\"title\":\"useMask\",\"description\":\"Read and update mask state for the selected node.\",\"frontmatter\":{\"title\":\"useMask\",\"description\":\"Read and update mask state for the selected node.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-mask\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/composables/use-mask\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-mask\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-mask\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useMask — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useMask — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Read and update mask state for the selected node.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Read and update mask state for the selected node.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Read and update mask state for the selected node.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/composables/use-mask.md\",\"filePath\":\"programmable/sdk/api/composables/use-mask.md\",\"lastUpdated\":1783692088000}");
var _sfc_main = { name: "programmable/sdk/api/composables/use-mask.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usemask" tabindex="-1">useMask <a class="header-anchor" href="#usemask" aria-label="Permalink to “useMask”">​</a></h1><p><code>useMask()</code> provides headless state and actions for mask controls in a property panel.</p><h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-label="Permalink to “Usage”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useMask } </span><span style="${ssrRenderStyle({
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
	})}">active</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">maskType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">setMaskType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useMask</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><ul><li><code>active</code> is <code>true</code> when exactly one selected node is being used as a mask.</li><li><code>maskType</code> is the selected node&#39;s <code>ALPHA</code>, <code>VECTOR</code>, or <code>LUMINANCE</code> mask type.</li><li><code>setMaskType(type)</code> updates the active mask with undo support.</li></ul><p>Use the <code>selection.toggleMask</code> editor command to turn masking on or off so toolbar, context-menu, and keyboard behavior stays consistent.</p><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./use-appearance">useAppearance</a></li><li><a href="./use-editor-commands">useEditorCommands</a></li><li><a href="./../">SDK API Overview</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/composables/use-mask.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_mask_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_mask_default as default };
