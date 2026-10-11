import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Scripting\",\"description\":\"Exécuter JavaScript avec une API compatible avec les plugins Figma pour interroger, modifier et générer des designs.\",\"frontmatter\":{\"title\":\"Scripting\",\"description\":\"Exécuter JavaScript avec une API compatible avec les plugins Figma pour interroger, modifier et générer des designs.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Exécuter JavaScript avec une API compatible avec les plugins Figma pour interroger, modifier et générer des designs.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Exécuter JavaScript avec une API compatible avec les plugins Figma pour interroger, modifier et générer des designs.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Exécuter JavaScript avec une API compatible avec les plugins Figma pour interroger, modifier et générer des designs.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/cli/scripting.md\",\"filePath\":\"fr/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "fr/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="scripting" tabindex="-1">Scripting <a class="header-anchor" href="#scripting" aria-label="Permalink to “Scripting”">​</a></h1><p><code>openpencil eval</code> exécute JavaScript sur un document et fournit un objet global <code>figma</code>. Cette commande convient aux modifications par lots, à l’inspection, aux données de test et à l’automatisation sans ouvrir l’interface de l’éditeur.</p><h2 id="utilisation-de-base" tabindex="-1">Utilisation de base <a class="header-anchor" href="#utilisation-de-base" aria-label="Permalink to “Utilisation de base”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p><code>-c</code> accepte JavaScript. Si le code ne commence pas par <code>return</code>, OpenPencil l’exécute dans une fonction asynchrone et renvoie le résultat éventuel.</p><h2 id="interroger-des-objets" tabindex="-1">Interroger des objets <a class="header-anchor" href="#interroger-des-objets" aria-label="Permalink to “Interroger des objets”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  return figma.currentPage</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .findAll((node) =&gt; node.type === &#39;FRAME&#39;)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .map((node) =&gt; ({ id: node.id, name: node.name }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="modifier-et-enregistrer" tabindex="-1">Modifier et enregistrer <a class="header-anchor" href="#modifier-et-enregistrer" aria-label="Permalink to “Modifier et enregistrer”">​</a></h2><p><code>--write</code> ou <code>-w</code> remplace le fichier d’entrée. <code>--output</code> ou <code>-o</code> crée un autre fichier.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;figma.currentPage.name = &#39;Updated&#39;&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> updated.fig</span></span></code></pre></div><h2 id="lire-le-script-depuis-stdin" tabindex="-1">Lire le script depuis stdin <a class="header-anchor" href="#lire-le-script-depuis-stdin" aria-label="Permalink to “Lire le script depuis stdin”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">cat</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> transform.js</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --stdin</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --write</span></span></code></pre></div><h2 id="document-ouvert" tabindex="-1">Document ouvert <a class="header-anchor" href="#document-ouvert" aria-label="Permalink to “Document ouvert”">​</a></h2><p>Omettez le chemin pour exécuter le script sur le document actif dans l’application de bureau.</p><h2 id="sortie" tabindex="-1">Sortie <a class="header-anchor" href="#sortie" aria-label="Permalink to “Sortie”">​</a></h2><p>Dans un environnement non interactif, <code>eval</code> utilise JSON par défaut. <code>--json</code> l’impose explicitement et <code>--quiet</code> ou <code>-q</code> masque la sortie lorsqu’un fichier seul est écrit.</p><h2 id="api-compatible" tabindex="-1">API compatible <a class="header-anchor" href="#api-compatible" aria-label="Permalink to “API compatible”">​</a></h2><p>L’API suit le modèle de Figma Plugin API, mais agit sur SceneGraph et les formats OpenPencil. Elle couvre document, pages, création d’objets, opérations d’arbre, composants, variables et propriétés courantes.</p><p>Les identifiants exacts comme <code>figma.currentPage</code>, <code>createFrame</code>, <code>appendChild</code>, <code>fills</code>, <code>fontSize</code>, <code>layoutMode</code> et <code>strokeWeight</code> restent inchangés.</p><h2 id="limites" tabindex="-1">Limites <a class="header-anchor" href="#limites" aria-label="Permalink to “Limites”">​</a></h2><p>Il n’existe pas encore d’équivalent complet pour <code>node.exportAsync()</code>, <code>node.setBoundVariable()</code>, <code>figma.combineAsVariants()</code>, les styles de peinture/texte et toutes les opérations booléennes vectorielles.</p><p>Selon le besoin, utilisez aussi la commande d’exportation, les outils du noyau ou les opérations directes de SceneGraph.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
