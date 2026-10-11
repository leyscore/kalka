import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/overview/features.md
var __pageData = JSON.parse("{\"title\":\"Fonctionnalités\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Fonctionnalités — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Fonctionnalités — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"fr/overview/features.md\",\"filePath\":\"fr/overview/features.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "fr/overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="fonctionnalites" tabindex="-1">Fonctionnalités <a class="header-anchor" href="#fonctionnalites" aria-label="Permalink to “Fonctionnalités”">​</a></h1><h2 id="fichiers-figma" tabindex="-1">Fichiers Figma <a class="header-anchor" href="#fichiers-figma" aria-label="Permalink to “Fichiers Figma”">​</a></h2><p>OpenPencil ouvre et enregistre directement les fichiers <code>.fig</code>. L’import et l’export utilisent le même codec binaire Kiwi que Figma : 194 définitions de schéma et environ 390 champs par objet. Enregistrer : <kbd>⌘</kbd><kbd>S</kbd>. Enregistrer sous : <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Copier et coller avec Figma :</strong> sélectionnez des objets dans Figma, appuyez sur <kbd>⌘</kbd><kbd>C</kbd>, passez à OpenPencil puis utilisez <kbd>⌘</kbd><kbd>V</kbd>. Remplissages, contours, disposition automatique, texte, effets, rayons des coins et réseaux vectoriels sont conservés dans les deux sens.</p><h2 id="dessin-et-edition" tabindex="-1">Dessin et édition <a class="header-anchor" href="#dessin-et-edition" aria-label="Permalink to “Dessin et édition”">​</a></h2><ul><li><strong>Formes :</strong> rectangle (<kbd>R</kbd>), ellipse (<kbd>O</kbd>), ligne (<kbd>L</kbd>), polygone et étoile.</li><li><strong>Plume :</strong> réseaux vectoriels, courbes de Bézier et poignées tangentes.</li><li><strong>Texte :</strong> édition directe sur le canevas et prise en charge des IME.</li><li><strong>Texte enrichi :</strong> gras, italique, souligné et barré sur des plages de caractères.</li><li><strong>Disposition automatique :</strong> Flexbox et CSS Grid via Yoga WASM, avec direction, espacement, marges internes, distribution, alignement, dimensionnement et pistes de grille.</li><li><strong>Composants :</strong> création de composants et d’ensembles, instances, substitutions et synchronisation.</li><li><strong>Variables :</strong> jetons de design organisés en collections et modes, avec les types Color, Float, String et Boolean et des liaisons.</li><li><strong>Sections :</strong> conteneurs d’organisation qui intègrent automatiquement les objets superposés.</li></ul><h2 id="panneau-de-proprietes" tabindex="-1">Panneau de propriétés <a class="header-anchor" href="#panneau-de-proprietes" aria-label="Permalink to “Panneau de propriétés”">​</a></h2><p>Les onglets Design, Code, IA et Vérifier s’adaptent à la sélection :</p><ul><li><strong>Apparence :</strong> opacité, rayon uniforme ou par coin et visibilité.</li><li><strong>Remplissage :</strong> couleur unie, dégradés linéaire, radial, angulaire et diamant, et images.</li><li><strong>Contour :</strong> couleur, épaisseur, alignement, épaisseur par côté, extrémités, jointures et tirets.</li><li><strong>Effets :</strong> ombre portée et intérieure, flou de calque, d’arrière-plan et de premier plan.</li><li><strong>Typographie :</strong> choix de police avec recherche et défilement virtuel, style, taille, alignement et mise en forme.</li><li><strong>Disposition :</strong> réglages de la disposition automatique.</li><li><strong>Export :</strong> échelle, PNG/JPG/WEBP/SVG et aperçu.</li><li><strong>Code :</strong> Design JSX et Tailwind JSX pour la sélection, avec édition bidirectionnelle en direct du Design JSX qui met à jour votre code à mesure que les calques changent ; l’élément situé sous le curseur met en évidence son calque sur la zone de travail, et les problèmes de design sont soulignés sur la propriété qui les cause.</li><li><strong>Vérifier :</strong> analyse de design en direct pour la page ou la sélection : contraste insuffisant, cibles tactiles trop petites, couleurs non liées, espacements hors échelle, avec des repères de problèmes sur la zone de travail et une liaison à une variable en un clic (<a href="/user-guide/checking-designs">Checking Designs</a>).</li></ul><h2 id="rendu" tabindex="-1">Rendu <a class="header-anchor" href="#rendu" aria-label="Permalink to “Rendu”">​</a></h2><p>OpenPencil utilise Skia via CanvasKit WASM, le même moteur graphique que Figma :</p><ul><li>dégradés linéaires, radiaux, angulaires et diamant ;</li><li>remplissages d’image avec plusieurs modes d’échelle ;</li><li>cache des effets par objet ;</li><li>arcs, ellipses partielles et anneaux ;</li><li>exclusion des objets hors champ et réutilisation des outils de peinture ;</li><li>guides d’accrochage tenant compte de la rotation ;</li><li>règles avec plage de sélection ;</li><li>surbrillance suivant la géométrie réelle.</li></ul><h2 id="annuler-et-retablir" tabindex="-1">Annuler et rétablir <a class="header-anchor" href="#annuler-et-retablir" aria-label="Permalink to “Annuler et rétablir”">​</a></h2><p>La création, la suppression, les déplacements, le redimensionnement, les propriétés et la hiérarchie, la disposition et les variables peuvent être annulés. Raccourcis : <kbd>⌘</kbd><kbd>Z</kbd> et <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="pages-et-documents" tabindex="-1">Pages et documents <a class="header-anchor" href="#pages-et-documents" aria-label="Permalink to “Pages et documents”">​</a></h2><p>Vous pouvez créer, supprimer et renommer des pages ; chacune conserve sa position et son échelle d’affichage. Plusieurs documents peuvent être ouverts dans des onglets.</p><h2 id="export" tabindex="-1">Export <a class="header-anchor" href="#export" aria-label="Permalink to “Export”">​</a></h2><ul><li><strong>Images :</strong> PNG, JPG et WEBP de 0,5× à 4×.</li><li><strong>SVG :</strong> formes, texte avec plages de style, dégradés, effets et modes de fusion.</li><li><strong>Tailwind JSX :</strong> HTML avec classes Tailwind v4 pour React ou Vue.</li><li><strong>Copier comme :</strong> texte, SVG, PNG ou JSX depuis le menu contextuel.</li></ul><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --style</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span></span></code></pre></div><h2 id="chat-ai" tabindex="-1">Chat AI <a class="header-anchor" href="#chat-ai" aria-label="Permalink to “Chat AI”">​</a></h2><p><kbd>⌘</kbd><kbd>J</kbd> ouvre l’assistant. Plus de 90 outils créent des formes, modifient styles et dispositions, travaillent avec les composants et variables, exécutent des opérations booléennes, analysent les jetons de design et exportent des ressources. Anthropic, OpenAI, Google AI, OpenRouter et les points d’accès compatibles sont pris en charge.</p><p>Les appels d’outils apparaissent sur une chronologie repliable. Pour vérifier les modifications, l’assistant rend le résultat et le compare à la demande. Toutes les modifications réalisées par l’AI peuvent être annulées.</p><h2 id="serveur-mcp" tabindex="-1">Serveur MCP <a class="header-anchor" href="#serveur-mcp" aria-label="Permalink to “Serveur MCP”">​</a></h2><p>Claude Code, Cursor, Windsurf et les autres clients MCP peuvent lire et modifier des fichiers <code>.fig</code> grâce à plus de 90 outils. stdio et HTTP sont disponibles.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -g</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/mcp</span></span></code></pre></div><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><p>La CLI examine, exporte et analyse les fichiers <code>.fig</code> :</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tree</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">              # Arbre du document</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> find</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> TEXT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # Recherche</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">     # Export</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> colors</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # Analyse des couleurs</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clusters</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # Structures répétées</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
	})}"> &quot;...&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">     # Figma Plugin API</span></span></code></pre></div><p>Toutes les commandes acceptent <code>--json</code>. Installation : <code>npm install -g @open-pencil/cli</code> ou <code>bun add -g @open-pencil/cli</code>.</p><h2 id="collaboration-en-temps-reel" tabindex="-1">Collaboration en temps réel <a class="header-anchor" href="#collaboration-en-temps-reel" aria-label="Permalink to “Collaboration en temps réel”">​</a></h2><p>La collaboration fonctionne directement entre participants via WebRTC et ne nécessite aucun serveur central. Il suffit de partager un lien. Elle comprend les curseurs, la présence et le suivi de la vue d’un autre participant.</p><h2 id="bureau-et-web" tabindex="-1">Bureau et Web <a class="header-anchor" href="#bureau-et-web" aria-label="Permalink to “Bureau et Web”">​</a></h2><p><strong>Bureau :</strong> Tauri v2, environ 7 Mo, pour macOS, Windows et Linux, avec menus natifs, fonctionnement hors ligne et enregistrement automatique.</p><p><strong>Web :</strong> <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, installable comme PWA et adapté aux écrans tactiles.</p><h2 id="chargement-de-secours-depuis-google-fonts" tabindex="-1">Chargement de secours depuis Google Fonts <a class="header-anchor" href="#chargement-de-secours-depuis-google-fonts" aria-label="Permalink to “Chargement de secours depuis Google Fonts”">​</a></h2><p>Si une police n’est pas disponible localement, OpenPencil la télécharge automatiquement depuis Google Fonts. Aucune installation manuelle n’est nécessaire.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
