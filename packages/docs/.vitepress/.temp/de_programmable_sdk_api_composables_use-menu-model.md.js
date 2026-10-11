import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/sdk/api/composables/use-menu-model.md
var __pageData = JSON.parse("{\"title\":\"useMenuModel\",\"description\":\"Menümodelle für Application und Canvas aus dem aktuellen Editor state erstellen.\",\"frontmatter\":{\"title\":\"useMenuModel\",\"description\":\"Menümodelle für Application und Canvas aus dem aktuellen Editor state erstellen.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Menümodelle für Application und Canvas aus dem aktuellen Editor state erstellen.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Menümodelle für Application und Canvas aus dem aktuellen Editor state erstellen.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Menümodelle für Application und Canvas aus dem aktuellen Editor state erstellen.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/api/composables/use-menu-model.md\",\"filePath\":\"de/programmable/sdk/api/composables/use-menu-model.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/api/composables/use-menu-model.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usemenumodel" tabindex="-1">useMenuModel <a class="header-anchor" href="#usemenumodel" aria-label="Permalink to “useMenuModel”">​</a></h1><p><code>useMenuModel()</code> erzeugt renderbereite Menüs aus Editor commands und der aktuellen Selection. Dadurch müssen einzelne Commands nicht für jedes Menü erneut zusammengesetzt werden.</p><h2 id="verwendung" tabindex="-1">Verwendung <a class="header-anchor" href="#verwendung" aria-label="Permalink to “Verwendung”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><h2 id="beispiel" tabindex="-1">Beispiel <a class="header-anchor" href="#beispiel" aria-label="Permalink to “Beispiel”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><p><code>canvasMenu.value</code> an einen eigenen Context-menu component übergeben.</p><h2 id="application-menu" tabindex="-1">Application menu <a class="header-anchor" href="#application-menu" aria-label="Permalink to “Application menu”">​</a></h2><p><code>appMenu</code> gruppiert Einträge in:</p><ul><li>Edit;</li><li>View;</li><li>Object;</li><li>Arrange.</li></ul><h2 id="kontextmenu" tabindex="-1">Kontextmenü <a class="header-anchor" href="#kontextmenu" aria-label="Permalink to “Kontextmenü”">​</a></h2><p><code>canvasMenu</code> enthält vom State abhängige Einträge, zum Beispiel Move to page mit den verfügbaren Pages.</p><h2 id="labels-fur-die-selection" tabindex="-1">Labels für die Selection <a class="header-anchor" href="#labels-fur-die-selection" aria-label="Permalink to “Labels für die Selection”">​</a></h2><p><code>selectionLabelMenu</code> liefert die passende Variante:</p><ul><li>Hide oder Show;</li><li>Lock oder Unlock.</li></ul><h2 id="siehe-auch" tabindex="-1">Siehe auch <a class="header-anchor" href="#siehe-auch" aria-label="Permalink to “Siehe auch”">​</a></h2><ul><li><a href="./use-editor-commands">useEditorCommands</a></li><li><a href="./use-selection-state">useSelectionState</a></li><li><a href="./use-selection-capabilities">useSelectionCapabilities</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/api/composables/use-menu-model.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_menu_model_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_menu_model_default as default };
