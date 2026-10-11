import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/sdk/api/advanced/use-number-field.md
var __pageData = JSON.parse("{\"title\":\"useNumberField\",\"description\":\"Context helper for custom NumberField descendants.\",\"frontmatter\":{\"title\":\"useNumberField\",\"description\":\"Context helper for custom NumberField descendants.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-number-field\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-number-field\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-number-field\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-number-field\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useNumberField — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useNumberField — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Context helper for custom NumberField descendants.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Context helper for custom NumberField descendants.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Context helper for custom NumberField descendants.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/advanced/use-number-field.md\",\"filePath\":\"programmable/sdk/api/advanced/use-number-field.md\",\"lastUpdated\":1783927164000}");
var _sfc_main = { name: "programmable/sdk/api/advanced/use-number-field.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usenumberfield" tabindex="-1">useNumberField <a class="header-anchor" href="#usenumberfield" aria-label="Permalink to “useNumberField”">​</a></h1><p><code>useNumberField()</code> reads the context provided by <code>NumberFieldRoot</code>. Use it inside custom field parts that need the canonical value, draft, state attributes, ARIA attributes, or actions.</p><p>It throws when called outside a <code>NumberFieldRoot</code> subtree.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useNumberField } </span><span style="${ssrRenderStyle({
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
	})}"> field</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useNumberField</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">field.actions.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">startEdit</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>See <a href="./../components/number-field">NumberField</a> for the complete context and anatomy.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/advanced/use-number-field.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_number_field_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_number_field_default as default };
