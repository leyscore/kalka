import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"Moteur JSX\",\"description\":\"Créer des designs à partir de JSX et exporter une sélection en JSX avec Tailwind.\",\"frontmatter\":{\"title\":\"Moteur JSX\",\"description\":\"Créer des designs à partir de JSX et exporter une sélection en JSX avec Tailwind.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Moteur JSX — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Moteur JSX — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Créer des designs à partir de JSX et exporter une sélection en JSX avec Tailwind.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Créer des designs à partir de JSX et exporter une sélection en JSX avec Tailwind.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Créer des designs à partir de JSX et exporter une sélection en JSX avec Tailwind.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/jsx-renderer.md\",\"filePath\":\"fr/programmable/jsx-renderer.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "fr/programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="moteur-jsx" tabindex="-1">Moteur JSX <a class="header-anchor" href="#moteur-jsx" aria-label="Permalink to “Moteur JSX”">​</a></h1><p>OpenPencil convertit du JSX déclaratif en arbre de design. Le même système est disponible dans le chat avec l’AI, MCP et <code>eval</code>.</p><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> flex</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;col&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> gap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">24</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">320</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#ffffff&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> radius</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">18</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">weight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bold&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Card Title&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#667085&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Description&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Button</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Continue&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Button</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="creer-des-designs" tabindex="-1">Créer des designs <a class="header-anchor" href="#creer-des-designs" aria-label="Permalink to “Créer des designs”">​</a></h2><p>L’outil <code>render</code> accepte des chaînes JSX dans le chat AI et MCP. Dans le code d’une application ou d’une bibliothèque sans interface, importez <code>Frame</code>, <code>Text</code> et les autres exports d’écriture depuis <code>@open-pencil/design-jsx</code>, puis créez les objets avec <code>renderTree</code> ou <code>renderJSX</code> depuis <code>@open-pencil/core/design-jsx</code>, qui ajoutent les icônes, la conversion SVG et la disposition. Pour écrire les arbres en TSX, définissez <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> avec <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> dans <code>tsconfig.json</code>, ou ajoutez au fichier un commentaire <code>/** @jsxImportSource @open-pencil/design-jsx */</code>. L’environnement de script détermine les API exposées à <code>eval</code> ; les exports des paquets n’y sont pas automatiquement des variables globales.</p><h2 id="elements" tabindex="-1">Éléments <a class="header-anchor" href="#elements" aria-label="Permalink to “Éléments”">​</a></h2><table tabindex="0"><thead><tr><th>JSX</th><th>Résultat</th></tr></thead><tbody><tr><td><code>&lt;Frame&gt;</code></td><td>Cadre, éventuellement avec disposition automatique</td></tr><tr><td><code>&lt;Text&gt;</code></td><td>Objet texte</td></tr><tr><td><code>&lt;Rectangle&gt;</code></td><td>Rectangle</td></tr><tr><td><code>&lt;Ellipse&gt;</code></td><td>Ellipse</td></tr><tr><td><code>&lt;Image&gt;</code></td><td>Forme avec remplissage d’image</td></tr><tr><td>Composant enregistré</td><td>Arbre réutilisable défini par l’application</td></tr></tbody></table><h2 id="disposition" tabindex="-1">Disposition <a class="header-anchor" href="#disposition" aria-label="Permalink to “Disposition”">​</a></h2><ul><li><code>flex=&quot;row&quot;</code> ou <code>flex=&quot;col&quot;</code> active la disposition automatique.</li><li><code>gap</code> règle l’espacement.</li><li><code>p</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code> et <code>pl</code> règlent les marges intérieures.</li><li><code>align</code> et <code>justify</code> règlent l’alignement.</li><li><code>wrap</code> autorise le retour à la ligne.</li></ul><h2 id="taille-et-position" tabindex="-1">Taille et position <a class="header-anchor" href="#taille-et-position" aria-label="Permalink to “Taille et position”">​</a></h2><ul><li><code>w</code> et <code>h</code> acceptent des nombres, <code>&quot;fill&quot;</code> ou <code>&quot;hug&quot;</code>.</li><li><code>minW</code>, <code>maxW</code>, <code>minH</code> et <code>maxH</code> posent des limites.</li><li><code>x</code> et <code>y</code> définissent la position hors du flux.</li></ul><h2 id="apparence-et-typographie" tabindex="-1">Apparence et typographie <a class="header-anchor" href="#apparence-et-typographie" aria-label="Permalink to “Apparence et typographie”">​</a></h2><p><code>bg</code>, <code>fill</code>, <code>color</code>, <code>stroke</code>, <code>strokeWidth</code>, <code>opacity</code>, <code>radius</code> et <code>shadow</code> contrôlent l’apparence. <code>size</code>, <code>font</code>, <code>weight</code>, <code>lineHeight</code>, <code>letterSpacing</code> et <code>align</code> contrôlent le texte. Ces noms restent en anglais car ils font partie de l’API JSX.</p><h2 id="exporter-vers-jsx" tabindex="-1">Exporter vers JSX <a class="header-anchor" href="#exporter-vers-jsx" aria-label="Permalink to “Exporter vers JSX”">​</a></h2><p><strong>Copier comme → JSX</strong> convertit la sélection en JSX et classes Tailwind. La sortie tente de préserver hiérarchie, disposition, dimensions, couleurs, typographie et bordures comme point de départ d’une implémentation.</p><p>Le JSX OpenPencil exporté peut être modifié puis rendu de nouveau dans le document. L’export écrit les calques masqués et verrouillés, les contraintes, les limites de taille, les remplissages multiples, en dégradé et en image, les contours, les effets, les masques et les liaisons de variables : le rendu d’un export les reproduit, et <code>diff_jsx</code> montre les changements de chacun d’eux. Le texte riche à styles mixtes, les tracés vectoriels, les grilles de disposition, les styles partagés et les définitions de propriétés de composant ne sont pas encore écrits. Les instances sont écrites sous forme de cadres avec leur contenu, si bien que le JSX exporté se suffit à lui-même. Voir <a href="./cli/exporting">Exports de la CLI</a>.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
