import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/programmable/sdk/guides/navigation-panels.md
var __pageData = JSON.parse("{\"title\":\"Panneaux de navigation\",\"description\":\"Panneaux latéraux de pages et de calques avec PageListRoot, LayerTreeRoot et état de sélection.\",\"frontmatter\":{\"title\":\"Panneaux de navigation\",\"description\":\"Panneaux latéraux de pages et de calques avec PageListRoot, LayerTreeRoot et état de sélection.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/guides/navigation-panels\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/guides/navigation-panels\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/guides/navigation-panels\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Panneaux de navigation — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Panneaux de navigation — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Panneaux latéraux de pages et de calques avec PageListRoot, LayerTreeRoot et état de sélection.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Panneaux latéraux de pages et de calques avec PageListRoot, LayerTreeRoot et état de sélection.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Panneaux latéraux de pages et de calques avec PageListRoot, LayerTreeRoot et état de sélection.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/sdk/guides/navigation-panels.md\",\"filePath\":\"fr/programmable/sdk/guides/navigation-panels.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "fr/programmable/sdk/guides/navigation-panels.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="panneaux-de-navigation" tabindex="-1">Panneaux de navigation <a class="header-anchor" href="#panneaux-de-navigation" aria-label="Permalink to “Panneaux de navigation”">​</a></h1><p>Un panneau latéral contient souvent une liste de pages et l’arbre des calques. Le SDK Vue fournit des composants sans styles pour ces deux zones.</p><h2 id="pages" tabindex="-1">Pages <a class="header-anchor" href="#pages" aria-label="Permalink to “Pages”">​</a></h2><p>Utilisez <code>PageListRoot</code> ou <code>usePageList()</code> :</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">    &lt;button @click=&quot;addPage()&quot;&gt;Nouvelle Page&lt;/button&gt;</span></span>
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
	})}">&gt;</span></span></code></pre></div><h2 id="calques" tabindex="-1">Calques <a class="header-anchor" href="#calques" aria-label="Permalink to “Calques”">​</a></h2><p>Utilisez <code>LayerTreeRoot</code> lorsque le SDK doit gérer la structure de l’arbre et les interactions tandis que l’application définit le balisage et les styles :</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><h2 id="disposition-courante" tabindex="-1">Disposition courante <a class="header-anchor" href="#disposition-courante" aria-label="Permalink to “Disposition courante”">​</a></h2><ul><li>pages en haut du panneau ;</li><li>calques en dessous ;</li><li>détails et changement de nom direct dans les composants de ligne.</li></ul><h2 id="voir-aussi" tabindex="-1">Voir aussi <a class="header-anchor" href="#voir-aussi" aria-label="Permalink to “Voir aussi”">​</a></h2><ul><li><a href="./../api/composables/use-page-list">usePageList</a></li><li><a href="./../api/components/page-list-root">PageListRoot</a></li><li><a href="./../api/components/layer-tree-root">LayerTreeRoot</a></li><li><a href="./../api/composables/use-selection-state">useSelectionState</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/sdk/guides/navigation-panels.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var navigation_panels_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, navigation_panels_default as default };
