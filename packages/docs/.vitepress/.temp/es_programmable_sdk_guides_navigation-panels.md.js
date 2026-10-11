import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/programmable/sdk/guides/navigation-panels.md
var __pageData = JSON.parse("{\"title\":\"Paneles de navegación\",\"description\":\"Paneles laterales de páginas y capas con PageListRoot, LayerTreeRoot y estado de selección.\",\"frontmatter\":{\"title\":\"Paneles de navegación\",\"description\":\"Paneles laterales de páginas y capas con PageListRoot, LayerTreeRoot y estado de selección.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/guides/navigation-panels\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/guides/navigation-panels\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Paneles de navegación — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Paneles de navegación — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Paneles laterales de páginas y capas con PageListRoot, LayerTreeRoot y estado de selección.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Paneles laterales de páginas y capas con PageListRoot, LayerTreeRoot y estado de selección.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Paneles laterales de páginas y capas con PageListRoot, LayerTreeRoot y estado de selección.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/sdk/guides/navigation-panels.md\",\"filePath\":\"es/programmable/sdk/guides/navigation-panels.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "es/programmable/sdk/guides/navigation-panels.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="paneles-de-navegacion" tabindex="-1">Paneles de navegación <a class="header-anchor" href="#paneles-de-navegacion" aria-label="Permalink to “Paneles de navegación”">​</a></h1><p>Un panel lateral suele incluir una lista de páginas y el árbol de capas. El SDK de Vue ofrece componentes sin estilos para ambas áreas.</p><h2 id="pages" tabindex="-1">Pages <a class="header-anchor" href="#pages" aria-label="Permalink to “Pages”">​</a></h2><p>Usa <code>PageListRoot</code> o <code>usePageList()</code>:</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">PageListRoot</span><span style="${ssrRenderStyle({
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
	})}">{ pages, currentPageId, switchPage, addPage }</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;div&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;button v-for=&quot;page in pages&quot; :key=&quot;page.id&quot; @click=&quot;switchPage(page.id)&quot;&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {{ page.name }}</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;/button&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;button @click=&quot;addPage()&quot;&gt;Nueva Page&lt;/button&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/div&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">PageListRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="layers" tabindex="-1">Layers <a class="header-anchor" href="#layers" aria-label="Permalink to “Layers”">​</a></h2><p>Usa <code>LayerTreeRoot</code> si quieres que el SDK gestione Tree structure e Interactions y que la aplicación defina el Markup y los Styles:</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">LayerTreeRoot</span><span style="${ssrRenderStyle({
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
	})}">{ items, selectedIds, select, toggleExpand, getKey, getChildren }</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;TreeView</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    :items=&quot;items&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    :selected-ids=&quot;selectedIds&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    :get-key=&quot;getKey&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    :get-children=&quot;getChildren&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    @select=&quot;select&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    @toggle-expand=&quot;toggleExpand&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">LayerTreeRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="disposicion-habitual" tabindex="-1">Disposición habitual <a class="header-anchor" href="#disposicion-habitual" aria-label="Permalink to “Disposición habitual”">​</a></h2><ul><li>Pages en la parte superior del panel;</li><li>Layers debajo;</li><li>detalles y cambio de nombre directo dentro de los componentes de fila.</li></ul><h2 id="consulta-tambien" tabindex="-1">Consulta también <a class="header-anchor" href="#consulta-tambien" aria-label="Permalink to “Consulta también”">​</a></h2><ul><li><a href="./../api/composables/use-page-list">usePageList</a></li><li><a href="./../api/components/page-list-root">PageListRoot</a></li><li><a href="./../api/components/layer-tree-root">LayerTreeRoot</a></li><li><a href="./../api/composables/use-selection-state">useSelectionState</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/sdk/guides/navigation-panels.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var navigation_panels_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, navigation_panels_default as default };
