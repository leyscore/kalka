import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/sdk/api/composables/use-menu-model.md
var __pageData = JSON.parse("{\"title\":\"useMenuModel\",\"description\":\"Modele menu aplikacji i obszaru roboczego zależne od aktualnego state edytora.\",\"frontmatter\":{\"title\":\"useMenuModel\",\"description\":\"Modele menu aplikacji i obszaru roboczego zależne od aktualnego state edytora.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Modele menu aplikacji i obszaru roboczego zależne od aktualnego state edytora.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Modele menu aplikacji i obszaru roboczego zależne od aktualnego state edytora.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Modele menu aplikacji i obszaru roboczego zależne od aktualnego state edytora.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/api/composables/use-menu-model.md\",\"filePath\":\"pl/programmable/sdk/api/composables/use-menu-model.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/api/composables/use-menu-model.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usemenumodel" tabindex="-1">useMenuModel <a class="header-anchor" href="#usemenumodel" aria-label="Permalink to “useMenuModel”">​</a></h1><p><code>useMenuModel()</code> tworzy gotowe do wyświetlenia menu na podstawie poleceń edytora i bieżącego selection.</p><p>Użyj go, jeśli nie chcesz samodzielnie składać menu z pojedynczych poleceń.</p><h2 id="uzycie" tabindex="-1">Użycie <a class="header-anchor" href="#uzycie" aria-label="Permalink to “Użycie”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useMenuModel } </span><span style="${ssrRenderStyle({
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
	})}">appMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">canvasMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">selectionLabelMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useMenuModel</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><h2 id="przykład" tabindex="-1">Przykład <a class="header-anchor" href="#przykład" aria-label="Permalink to “Przykład”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">canvasMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useMenuModel</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Przekaż <code>canvasMenu.value</code> do własnego komponentu menu kontekstowego.</p><h2 id="menu-aplikacji" tabindex="-1">Menu aplikacji <a class="header-anchor" href="#menu-aplikacji" aria-label="Permalink to “Menu aplikacji”">​</a></h2><p><code>appMenu</code> grupuje pozycje w menu:</p><ul><li>Edit;</li><li>View;</li><li>Object;</li><li>Arrange.</li></ul><h2 id="menu-kontekstowe" tabindex="-1">Menu kontekstowe <a class="header-anchor" href="#menu-kontekstowe" aria-label="Permalink to “Menu kontekstowe”">​</a></h2><p><code>canvasMenu</code> zawiera pozycje zależne od state, na przykład Move to page z listą dostępnych stron.</p><h2 id="etykiety-zalezne-od-selection" tabindex="-1">Etykiety zależne od selection <a class="header-anchor" href="#etykiety-zalezne-od-selection" aria-label="Permalink to “Etykiety zależne od selection”">​</a></h2><p><code>selectionLabelMenu</code> zwraca odpowiednią wersję etykiet:</p><ul><li>Hide albo Show;</li><li>Lock albo Unlock.</li></ul><h2 id="zobacz-tez" tabindex="-1">Zobacz też <a class="header-anchor" href="#zobacz-tez" aria-label="Permalink to “Zobacz też”">​</a></h2><ul><li><a href="./use-editor-commands">useEditorCommands</a></li><li><a href="./use-selection-state">useSelectionState</a></li><li><a href="./use-selection-capabilities">useSelectionCapabilities</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/api/composables/use-menu-model.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_menu_model_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_menu_model_default as default };
