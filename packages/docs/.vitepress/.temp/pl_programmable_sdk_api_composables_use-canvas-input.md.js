import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/sdk/api/composables/use-canvas-input.md
var __pageData = JSON.parse("{\"title\":\"useCanvasInput\",\"description\":\"Podłączenie wskaźnika, przeciągania, zaznaczenia, zmiany rozmiaru, obrotu i narzędzi do obszaru roboczego.\",\"frontmatter\":{\"title\":\"useCanvasInput\",\"description\":\"Podłączenie wskaźnika, przeciągania, zaznaczenia, zmiany rozmiaru, obrotu i narzędzi do obszaru roboczego.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-canvas-input\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-canvas-input\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useCanvasInput — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useCanvasInput — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Podłączenie wskaźnika, przeciągania, zaznaczenia, zmiany rozmiaru, obrotu i narzędzi do obszaru roboczego.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Podłączenie wskaźnika, przeciągania, zaznaczenia, zmiany rozmiaru, obrotu i narzędzi do obszaru roboczego.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Podłączenie wskaźnika, przeciągania, zaznaczenia, zmiany rozmiaru, obrotu i narzędzi do obszaru roboczego.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/composables/use-canvas-input.md\",\"filePath\":\"pl/programmable/sdk/api/composables/use-canvas-input.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/composables/use-canvas-input.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usecanvasinput" tabindex="-1">useCanvasInput <a class="header-anchor" href="#usecanvasinput" aria-label="Permalink to “useCanvasInput”">​</a></h1><p><code>useCanvasInput()</code> łączy zdarzenia wskaźnika i myszy z obszarem roboczym edytora.</p><p>Obsługuje zaznaczenie, przeciąganie, zmianę rozmiaru, obrót, przesuwanie widoku, rysowanie Piórem, edycję tekstu i wykrywanie obiektów z uwzględnieniem widoku.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">useCanvasInput</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  canvasRef,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  editor,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  hitTestSectionTitle,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  hitTestComponentLabel,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  hitTestFrameTitle,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./use-canvas">useCanvas</a></li><li><a href="./use-editor">useEditor</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/composables/use-canvas-input.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_canvas_input_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_canvas_input_default as default };
