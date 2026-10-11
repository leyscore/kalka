import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/sdk/api/composables/use-component-properties.md
var __pageData = JSON.parse("{\"title\":\"useComponentProperties\",\"description\":\"Read and edit variant, text, boolean, and instance-swap properties on instances.\",\"frontmatter\":{\"title\":\"useComponentProperties\",\"description\":\"Read and edit variant, text, boolean, and instance-swap properties on instances.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-component-properties\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/composables/use-component-properties\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-component-properties\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-component-properties\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useComponentProperties — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useComponentProperties — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Read and edit variant, text, boolean, and instance-swap properties on instances.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Read and edit variant, text, boolean, and instance-swap properties on instances.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Read and edit variant, text, boolean, and instance-swap properties on instances.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/composables/use-component-properties.md\",\"filePath\":\"programmable/sdk/api/composables/use-component-properties.md\",\"lastUpdated\":1789681390000}");
var _sfc_main = { name: "programmable/sdk/api/composables/use-component-properties.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usecomponentproperties" tabindex="-1">useComponentProperties <a class="header-anchor" href="#usecomponentproperties" aria-label="Permalink to “useComponentProperties”">​</a></h1><p><code>useComponentProperties()</code> exposes compatible component properties for the selected instances and an undo-aware value action.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useComponentProperties } </span><span style="${ssrRenderStyle({
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
	})}">controls</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">setValue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useComponentProperties</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// Property IDs are stable Figma definition IDs when imported from .fig.</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">setValue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;12:34&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Enabled&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><p>Each item in <code>controls</code> contains:</p><ul><li><code>id</code> and <code>name</code> from the component property definition;</li><li><code>type</code>: <code>VARIANT</code>, <code>TEXT</code>, <code>BOOLEAN</code>, or <code>INSTANCE_SWAP</code>;</li><li><code>value</code>: a string or <code>MIXED</code>;</li><li><code>options</code> for variant and instance-swap controls.</li></ul><p><code>active</code> is true only when every selected node is an instance and each instance exposes the same ordered property IDs and types. Compatible multi-selection changes are grouped into one undo entry.</p><p>For live text inputs, call <code>setTextValue(propertyId, value)</code> on each model update and <code>flush()</code> on blur or Enter. Text appears immediately, while rapid changes share an undo entry. Batches also finish after an idle pause, a selection/page change, or scope disposal. <code>setValue()</code> remains a discrete edit.</p><p>Text and boolean properties update the referenced instance descendant. Instance-swap properties replace the referenced nested instance. Variant changes swap the main component and then reapply non-variant assignments, so custom labels, visibility, and nested swaps survive the change and its undo/redo cycle.</p><p>Imported <code>.fig</code> definitions retain typed defaults, property references, assignments, and preferred instance-swap values. Missing swap targets remain explicit rather than silently selecting another component.</p><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./use-selection-state">useSelectionState</a></li><li><a href="./use-shared-style-binding">useSharedStyleBinding</a></li><li><a href="./../../guides/property-panels">Property Panels guide</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/composables/use-component-properties.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_component_properties_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_component_properties_default as default };
