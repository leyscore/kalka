import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/programmable/cli/analyzing.md
var __pageData = JSON.parse("{\"title\":\"Analyser des documents avec la CLI\",\"description\":\"Détecter couleurs, typographies, espacements et structures répétées.\",\"frontmatter\":{\"title\":\"Analyser des documents avec la CLI\",\"description\":\"Détecter couleurs, typographies, espacements et structures répétées.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Analyser des documents avec la CLI — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Analyser des documents avec la CLI — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Détecter couleurs, typographies, espacements et structures répétées.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Détecter couleurs, typographies, espacements et structures répétées.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Détecter couleurs, typographies, espacements et structures répétées.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/cli/analyzing.md\",\"filePath\":\"fr/programmable/cli/analyzing.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "fr/programmable/cli/analyzing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="analyser-des-documents-avec-la-cli" tabindex="-1">Analyser des documents avec la CLI <a class="header-anchor" href="#analyser-des-documents-avec-la-cli" aria-label="Permalink to “Analyser des documents avec la CLI”">​</a></h1><p>Les sous-commandes <code>analyze</code> examinent le document complet et aident à repérer les incohérences ou les structures qui pourraient devenir des composants.</p><h2 id="couleurs" tabindex="-1">Couleurs <a class="header-anchor" href="#couleurs" aria-label="Permalink to “Couleurs”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> colors</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Regroupe les couleurs des remplissages et contours, compte leurs utilisations et révèle les teintes presque identiques.</p><h2 id="typographie" tabindex="-1">Typographie <a class="header-anchor" href="#typographie" aria-label="Permalink to “Typographie”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> typography</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Énumère les combinaisons de famille, taille et style avec leur fréquence afin d’identifier les styles isolés.</p><h2 id="espacement" tabindex="-1">Espacement <a class="header-anchor" href="#espacement" aria-label="Permalink to “Espacement”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> spacing</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Examine espacements et marges intérieures des cadres à disposition automatique. Une valeur <code>13px</code> au milieu d’une échelle <code>8/16/24</code> devient ainsi visible.</p><h2 id="structures-repetees" tabindex="-1">Structures répétées <a class="header-anchor" href="#structures-repetees" aria-label="Permalink to “Structures répétées”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clusters</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Recherche des hiérarchies similaires susceptibles de devenir des composants et affiche leur correspondance, leur taille et leur structure.</p><h2 id="sortie-json" tabindex="-1">Sortie JSON <a class="header-anchor" href="#sortie-json" aria-label="Permalink to “Sortie JSON”">​</a></h2><p>Ajoutez <code>--json</code> pour traiter les résultats en CI, produire des rapports ou appliquer vos propres règles.</p><p>Ces analyses ne modifient pas le fichier. Pour les transformations, utilisez <a href="./scripting"><code>eval</code></a>.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/cli/analyzing.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var analyzing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, analyzing_default as default };
