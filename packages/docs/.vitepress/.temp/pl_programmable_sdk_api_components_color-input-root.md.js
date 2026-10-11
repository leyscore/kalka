import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/sdk/api/components/color-input-root.md
var __pageData = JSON.parse("{\"title\":\"ColorInputRoot\",\"description\":\"Odczyt wartości szesnastkowej i aktualizacja koloru we własnym polu.\",\"frontmatter\":{\"title\":\"ColorInputRoot\",\"description\":\"Odczyt wartości szesnastkowej i aktualizacja koloru we własnym polu.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/color-input-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/color-input-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"ColorInputRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"ColorInputRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Odczyt wartości szesnastkowej i aktualizacja koloru we własnym polu.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Odczyt wartości szesnastkowej i aktualizacja koloru we własnym polu.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Odczyt wartości szesnastkowej i aktualizacja koloru we własnym polu.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/components/color-input-root.md\",\"filePath\":\"pl/programmable/sdk/api/components/color-input-root.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/components/color-input-root.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="colorinputroot" tabindex="-1">ColorInputRoot <a class="header-anchor" href="#colorinputroot" aria-label="Permalink to “ColorInputRoot”">​</a></h1><p><code>ColorInputRoot</code> przekształca bieżący kolor na zapis szesnastkowy i udostępnia funkcje aktualizacji z ciągu tekstowego albo pełnego obiektu <code>Color</code>.</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">ColorInputRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> @</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">color </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> \$event</span><span style="${ssrRenderStyle({
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
	})}">{ hex, updateFromHex }</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;input :value=&quot;hex&quot; @input=&quot;updateFromHex((\$event.target as HTMLInputElement).value)&quot; /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">ColorInputRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./color-picker-root">ColorPickerRoot</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/components/color-input-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var color_input_root_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, color_input_root_default as default };
