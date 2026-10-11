import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/sdk/api/composables/use-canvas-input.md
var __pageData = JSON.parse("{\"title\":\"useCanvasInput\",\"description\":\"Zeigereingabe, Ziehen, Auswahl, Größenänderung, Drehung und Werkzeuge mit der Arbeitsfläche verbinden.\",\"frontmatter\":{\"title\":\"useCanvasInput\",\"description\":\"Zeigereingabe, Ziehen, Auswahl, Größenänderung, Drehung und Werkzeuge mit der Arbeitsfläche verbinden.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-canvas-input\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-canvas-input\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-canvas-input\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useCanvasInput — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useCanvasInput — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Zeigereingabe, Ziehen, Auswahl, Größenänderung, Drehung und Werkzeuge mit der Arbeitsfläche verbinden.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Zeigereingabe, Ziehen, Auswahl, Größenänderung, Drehung und Werkzeuge mit der Arbeitsfläche verbinden.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Zeigereingabe, Ziehen, Auswahl, Größenänderung, Drehung und Werkzeuge mit der Arbeitsfläche verbinden.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/api/composables/use-canvas-input.md\",\"filePath\":\"de/programmable/sdk/api/composables/use-canvas-input.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/api/composables/use-canvas-input.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usecanvasinput" tabindex="-1">useCanvasInput <a class="header-anchor" href="#usecanvasinput" aria-label="Permalink to “useCanvasInput”">​</a></h1><p><code>useCanvasInput()</code> verbindet Zeiger- und Mausereignisse mit der Arbeitsfläche des Editors.</p><p>Es behandelt Auswahl, Ziehen, Größenänderung, Drehung, Verschieben der Ansicht, Zeichnen mit dem Zeichenstift, Textbearbeitung und Trefferprüfung unter Berücksichtigung der Ansicht.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">)</span></span></code></pre></div><h2 id="siehe-auch" tabindex="-1">Siehe auch <a class="header-anchor" href="#siehe-auch" aria-label="Permalink to “Siehe auch”">​</a></h2><ul><li><a href="./use-canvas">useCanvas</a></li><li><a href="./use-editor">useEditor</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/api/composables/use-canvas-input.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_canvas_input_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_canvas_input_default as default };
