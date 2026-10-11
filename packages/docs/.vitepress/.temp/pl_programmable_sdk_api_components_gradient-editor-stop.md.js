import { t as data } from "./gradient-editor-stop.data.CUO--_ve.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { defineComponent, resolveComponent, unref, useSSRContext } from "vue";
//#region pl/programmable/sdk/api/components/gradient-editor-stop.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"GradientEditorStop\",\"description\":\"Stan i działania pojedynczego punktu gradientu.\",\"frontmatter\":{\"title\":\"GradientEditorStop\",\"description\":\"Stan i działania pojedynczego punktu gradientu.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/gradient-editor-stop\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/gradient-editor-stop\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/gradient-editor-stop\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"GradientEditorStop — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"GradientEditorStop — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Stan i działania pojedynczego punktu gradientu.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Stan i działania pojedynczego punktu gradientu.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Stan i działania pojedynczego punktu gradientu.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/components/gradient-editor-stop.md\",\"filePath\":\"pl/programmable/sdk/api/components/gradient-editor-stop.md\",\"lastUpdated\":1787240210000}");
var gradient_editor_stop_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "pl/programmable/sdk/api/components/gradient-editor-stop.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="gradienteditorstop" tabindex="-1">GradientEditorStop <a class="header-anchor" href="#gradienteditorstop" aria-label="Permalink to “GradientEditorStop”">​</a></h1><p><code>GradientEditorStop</code> udostępnia położenie, przezroczystość, kolor i stan aktywności punktu gradientu oraz działania aktualizacji i usuwania.</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">GradientEditorStop</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> :</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">stop</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">stop</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> :</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">index</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">index</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> :</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">active</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">active</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"> v-slot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">ctx</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &lt;MyGradientStopRow v-bind=&quot;ctx&quot; /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">GradientEditorStop</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span></code></pre></div>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`<h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./gradient-editor-root">GradientEditorRoot</a></li><li><a href="./gradient-editor-bar">GradientEditorBar</a></li></ul></div>`);
		};
	}
});
//#endregion
//#region pl/programmable/sdk/api/components/gradient-editor-stop.md
var _sfc_setup = gradient_editor_stop_md_vue_type_script_setup_true_lang_default.setup;
gradient_editor_stop_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/components/gradient-editor-stop.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var gradient_editor_stop_default = gradient_editor_stop_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, gradient_editor_stop_default as default };
