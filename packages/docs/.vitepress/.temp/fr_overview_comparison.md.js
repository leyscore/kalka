import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil et Penpot : architecture et performances\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil et Penpot : architecture et performances — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil et Penpot : architecture et performances — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"fr/overview/comparison.md\",\"filePath\":\"fr/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "fr/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-et-penpot-architecture-et-performances" tabindex="-1">OpenPencil et Penpot : architecture et performances <a class="header-anchor" href="#openpencil-et-penpot-architecture-et-performances" aria-label="Permalink to “OpenPencil et Penpot : architecture et performances”">​</a></h1><p>OpenPencil et Penpot sont des outils de design open source aux objectifs et architectures différents.</p><div class="info custom-block"><p class="custom-block-title">Moteur WASM de Penpot</p><p>Penpot 2.x inclut le moteur Rust/Skia WASM <code>render-wasm/v1</code>, activé par des options serveur ou <code>?wasm=true</code>. Le moteur SVG reste utilisé par défaut. Cette comparaison tient compte des deux options.</p></div><h2 id="_1-taille-du-code-source" tabindex="-1">1. Taille du code source <a class="header-anchor" href="#_1-taille-du-code-source" aria-label="Permalink to “1. Taille du code source”">​</a></h2><table tabindex="0"><thead><tr><th>Mesure</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Lines of code</td><td><strong>environ 26 000</strong></td><td><strong>environ 299 000</strong></td></tr><tr><td>Fichiers source</td><td>environ 143</td><td>environ 2 900</td></tr><tr><td>Langages</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Moteur de rendu</td><td>environ 3 200 lignes, TypeScript</td><td>22 000 lignes, Rust/Skia WASM</td></tr><tr><td>Interface</td><td>environ 4 500 lignes</td><td>environ 175 000 lignes, CLJS et SCSS</td></tr><tr><td>Serveur</td><td>Aucun, architecture locale</td><td>32 600 lignes et 151 fichiers SQL</td></tr><tr><td>Rapport</td><td><strong>1×</strong></td><td><strong>environ 11×</strong></td></tr></tbody></table><p>OpenPencil est environ onze fois plus petit. Cette différence vient surtout de l’architecture, pas uniquement du nombre de fonctionnalités.</p><h2 id="_2-architecture" tabindex="-1">2. Architecture <a class="header-anchor" href="#_2-architecture" aria-label="Permalink to “2. Architecture”">​</a></h2><h3 id="openpencil-un-seul-processus-client" tabindex="-1">OpenPencil : un seul processus client <a class="header-anchor" href="#openpencil-un-seul-processus-client" aria-label="Permalink to “OpenPencil : un seul processus client”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌─────────────────────────────────┐</span></span>
<span class="line"><span>│         Tauri native shell      │</span></span>
<span class="line"><span>│  ┌───────────────────────────┐  │</span></span>
<span class="line"><span>│  │  Vue 3 + TypeScript       │  │</span></span>
<span class="line"><span>│  │  Editor + Kiwi codec      │  │</span></span>
<span class="line"><span>│  │  SceneGraph in TypeScript │  │</span></span>
<span class="line"><span>│  │  CanvasKit + Yoga WASM    │  │</span></span>
<span class="line"><span>│  └───────────────────────────┘  │</span></span>
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>L’éditeur, SceneGraph, le codec de fichiers et le moteur de rendu s’exécutent dans le même processus. Aucun serveur, aucune base de données et aucun Docker ne sont nécessaires. SceneGraph est stocké dans <code>Map&lt;string, SceneNode&gt;</code>. TypeScript appelle directement CanvasKit et Yoga WASM calcule la disposition de manière synchrone.</p><h3 id="penpot-plateforme-client-server" tabindex="-1">Penpot : plateforme Client-Server <a class="header-anchor" href="#penpot-plateforme-client-server" aria-label="Permalink to “Penpot : plateforme Client-Server”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Un déploiement complet de Penpot comprend une interface, un serveur JVM, PostgreSQL, Valkey, MinIO et un exportateur basé sur Chromium sans interface. L’environnement de développement nécessite Docker Compose, JVM, Node et les outils Rust.</p><p>OpenPencil évite latence réseau, sérialisation entre services, orchestration de conteneurs et requêtes de base de données pour les opérations courantes. Penpot vise une plateforme multiutilisateur hébergée ; OpenPencil privilégie l’édition locale à faible latence.</p><h2 id="_3-chaine-de-rendu" tabindex="-1">3. Chaîne de rendu <a class="header-anchor" href="#_3-chaine-de-rendu" aria-label="Permalink to “3. Chaîne de rendu”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil : TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil : TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">renderSceneToCanvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvas, graph, pageId) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.fillPaint.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">setColor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  canvas.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">drawRRect</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(rrect, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.fillPaint)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><ul><li>Passage direct de TypeScript à WASM.</li><li>SceneGraph reste dans le JavaScript heap et n’est pas sérialisé avant Rendering.</li><li>Le moteur compte environ 3 200 lignes réparties en modules spécialisés.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot : ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot : ClojureScript → Rust WASM → Skia”">​</a></h3><p>Avec le moteur WASM :</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → décomposition et Binary packing dans WASM linear memory</span></span>
<span class="line"><span>  → Rust WASM via Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Sans WASM, chaque Shape devient un SVG DOM element rendu par React/Reagent.</p><p>En mode WASM, chaque UUID est divisée en quatre <code>u32</code>, chaque transformation en six <code>f32</code>, remplissages et contours sont encodés en binaire et les propriétés de base d’une forme occupent une structure de 104 octets. Le moteur utilise un cache de tuiles, des zones d’intérêt, onze surfaces de rendu et un état global mutable via <code>unsafe { STATE.as_mut() }</code>.</p><p>Le Tile system prépare les zones proches du Viewport et conserve jusqu’à 1 024 Textures. OpenPencil rend de nouveau toute la zone visible.</p><table tabindex="0"><thead><tr><th>Aspect</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Calls directs avec objets TypeScript</td><td>Structures encodées en Binary</td></tr><tr><td>Modèle</td><td>Rendu complet du Viewport visible</td><td>Tile cache</td></tr><tr><td>Surfaces</td><td>1</td><td>11</td></tr><tr><td>Cache supplémentaire</td><td>Aucun Tile cache</td><td>Jusqu’à 1 024 Tiles</td></tr><tr><td>Taille du moteur</td><td>environ 3 200 lignes</td><td>22 000 lignes</td></tr><tr><td>Code non sûr</td><td>Aucun</td><td>État global via <code>unsafe</code></td></tr></tbody></table><p>Le Path CanvasKit direct demande moins de traitement intermédiaire pour les documents petits et moyens. Le Tile system de Penpot peut être avantageux au-delà de 100 000 Shapes lorsqu’une faible portion seulement est visible.</p><h2 id="_4-scenegraph-et-modele-de-donnees" tabindex="-1">4. SceneGraph et modèle de données <a class="header-anchor" href="#_4-scenegraph-et-modele-de-donnees" aria-label="Permalink to “4. SceneGraph et modèle de données”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nodes</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: Map</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">string, SceneNode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">&gt;</span></span></code></pre></div><p>OpenPencil fournit :</p><ul><li>une recherche par identifiant en O(1) ;</li><li>29 types d’objet issus du schéma Kiwi de Figma ;</li><li>environ 390 champs dans <code>NodeChange</code> ;</li><li>des types TypeScript stricts ;</li><li>des GUID au format Figma <code>sessionID:localID</code>.</li></ul><p>Penpot maintient ses propres définitions de types en Clojure/ClojureScript et Rust. Des modules distincts gèrent couleurs, composants, conteneurs, remplissages, Grid, modificateurs, pages et tracés. Malli valide les schémas à l’exécution et les données de rendu franchissent la limite CLJS → Rust.</p><p>OpenPencil utilise directement le schéma Kiwi. Penpot doit synchroniser son modèle entre plusieurs langages.</p><h2 id="_5-moteur-de-disposition" tabindex="-1">5. Moteur de disposition <a class="header-anchor" href="#_5-moteur-de-disposition" aria-label="Permalink to “5. Moteur de disposition”">​</a></h2><p>OpenPencil utilise Yoga WASM de manière synchrone :</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> Yoga </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;yoga-layout&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> root</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> Yoga.Node.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">create</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">root.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">setFlexDirection</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(FlexDirection.Row)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">root.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">calculateLayout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">applyYogaLayout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(graph, frame, yogaRoot)</span></span></code></pre></div><p>Penpot maintient ses propres Implementations de Flex et Grid en ClojureScript et Rust WASM. Les deux Engines doivent produire le même résultat.</p><p>OpenPencil utilise Yoga, avec une variante prenant Grid en charge. Penpot maintient plusieurs milliers de lignes de code de disposition dans deux langages.</p><h2 id="_6-formats-et-figma" tabindex="-1">6. Formats et Figma <a class="header-anchor" href="#_6-formats-et-figma" aria-label="Permalink to “6. Formats et Figma”">​</a></h2><h3 id="openpencil" tabindex="-1">OpenPencil <a class="header-anchor" href="#openpencil" aria-label="Permalink to “OpenPencil”">​</a></h3><ul><li>Format Binary Kiwi natif de Figma.</li><li>Import direct de <code>.fig</code>.</li><li>Paste de Kiwi binary data depuis Figma Clipboard.</li><li>Wire compatibility avec Figma Multiplayer protocol.</li></ul><h3 id="penpot" tabindex="-1">Penpot <a class="header-anchor" href="#penpot" aria-label="Permalink to “Penpot”">​</a></h3><ul><li><code>.penpot</code> est un ZIP avec JSON manifests, Document data, Binary assets et Thumbnails.</li><li>SVG renderer et Export par défaut ; WASM renderer facultatif.</li><li>Aucun Import <code>.fig</code> natif.</li><li>Plusieurs Generations de format avec Migration system.</li></ul><p>OpenPencil lit <code>.fig</code> et Figma Clipboard directement. Penpot nécessite une voie Import ou Export distincte.</p><h2 id="_7-etat-et-annulation" tabindex="-1">7. État et annulation <a class="header-anchor" href="#_7-etat-et-annulation" aria-label="Permalink to “7. État et annulation”">​</a></h2><p>OpenPencil utilise des commandes inverses. Les fonctions d’avancement et de retour conservent seulement l’état nécessaire ; des lots regroupent plusieurs opérations.</p><p>Penpot utilise Potok. <code>UpdateEvent</code> modifie l’état et <code>WatchEvent</code> exécute les effets de bord avec RxJS. L’annulation stocke des vecteurs de changements inverses, limite l’historique à 50 entrées et regroupe les changements rapides en transactions.</p><p>Les changements sérialisables conviennent à la collaboration via serveur, mais augmentent la complexité. L’approche OpenPencil est plus directe pour un éditeur à processus unique.</p><h2 id="_8-developpement" tabindex="-1">8. Développement <a class="header-anchor" href="#_8-developpement" aria-label="Permalink to “8. Développement”">​</a></h2><table tabindex="0"><thead><tr><th>Mesure</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Setup</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node et Rust</td></tr><tr><td>HMR</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Types</td><td>Strict TypeScript</td><td>Malli runtime schemas</td></tr><tr><td>Desktop</td><td>Tauri v2</td><td>Browser</td></tr><tr><td>Technologies principales</td><td>TypeScript et Vue</td><td>Clojure, ClojureScript, Rust et Docker</td></tr></tbody></table><h2 id="_9-performances" tabindex="-1">9. Performances <a class="header-anchor" href="#_9-performances" aria-label="Permalink to “9. Performances”">​</a></h2><table tabindex="0"><thead><tr><th>Scénario</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Démarrage à froid</td><td>moins de 2 s avec WASM</td><td>plus de 10 s pour serveur, client et WASM</td></tr><tr><td>Opération courante</td><td>Dans un seul processus</td><td>Aller-retour réseau possible</td></tr><tr><td>Image rendue</td><td>Appel direct à Skia</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Mémoire de base</td><td>environ 50 Mo dans l’onglet</td><td>JVM, base de données, cache et navigateur</td></tr><tr><td>Hors ligne</td><td>Fonctionnement local complet</td><td>Serveur requis</td></tr><tr><td>10 000 formes</td><td>Une passe</td><td>Rendu par tuiles avec onze surfaces</td></tr></tbody></table><h2 id="_10-avantages-de-penpot" tabindex="-1">10. Avantages de Penpot <a class="header-anchor" href="#_10-avantages-de-penpot" aria-label="Permalink to “10. Avantages de Penpot”">​</a></h2><ol><li><strong>Collaboration via serveur :</strong> comptes, contrôle d’accès et stockage central avec WebSockets.</li><li><strong>Export PDF :</strong> exportateur Chromium dédié.</li><li><strong>Système de plugins :</strong> exécution isolée et API de plugins.</li><li><strong>Variables de design :</strong> prise en charge intégrée.</li><li><strong>CSS Grid :</strong> implémentation propre ; OpenPencil utilise une variante de Yoga avec Grid.</li><li><strong>Auto-hébergement :</strong> déploiement d’une plateforme d’équipe avec Docker.</li><li><strong>Maturité :</strong> plusieurs années d’utilisation en production.</li></ol><h2 id="_11-scripts-et-extensibilite" tabindex="-1">11. Scripts et extensibilité <a class="header-anchor" href="#_11-scripts-et-extensibilite" aria-label="Permalink to “11. Scripts et extensibilité”">​</a></h2><p>La commande <a href="/programmable/cli/scripting"><code>eval</code></a> fournit une API compatible avec les plugins Figma pour les scripts sans interface, les opérations par lots et les tests automatisés. Le chat AI, le serveur MCP et la CLI offrent aussi 90 outils pour lire, créer, modifier, structurer, gérer les variables, éditer les tracés, analyser, comparer, exécuter des opérations booléennes et organiser.</p><p>Penpot propose des plugins isolés, mais pas d’API équivalente pour les scripts sans interface ni d’intégration MCP.</p><h2 id="resume" tabindex="-1">Résumé <a class="header-anchor" href="#resume" aria-label="Permalink to “Résumé”">​</a></h2><table tabindex="0"><thead><tr><th>Domaine</th><th>Avantage</th><th>Motif</th></tr></thead><tbody><tr><td>Simplicité</td><td>OpenPencil</td><td>Un processus au lieu de plusieurs services</td></tr><tr><td>Rendu</td><td>OpenPencil</td><td>Accès direct à CanvasKit</td></tr><tr><td>Code source</td><td>OpenPencil</td><td>Environ 26 000 contre 299 000 lignes</td></tr><tr><td>Compatibilité Figma</td><td>OpenPencil</td><td>Kiwi et <code>.fig</code> natifs</td></tr><tr><td>Développement</td><td>OpenPencil</td><td>TypeScript et Vue plutôt que Clojure, Rust et Docker</td></tr><tr><td>Application de bureau</td><td>OpenPencil</td><td>Tauri natif</td></tr><tr><td>Disposition</td><td>OpenPencil</td><td>Yoga plutôt que deux implémentations propres</td></tr><tr><td>Collaboration</td><td>Forces différentes</td><td>Penpot : serveur et contrôle d’accès ; OpenPencil : P2P sans hébergement</td></tr><tr><td>Auto-hébergement</td><td>Penpot</td><td>Déploiement Docker</td></tr><tr><td>Maturité de l’écosystème</td><td>Penpot</td><td>Plusieurs années en production</td></tr></tbody></table><p>OpenPencil est un éditeur compact à processus unique avec moteur CanvasKit et prise en charge native de <code>.fig</code>. Penpot est une plateforme client-serveur complète utilisant Clojure, ClojureScript, Rust, des bases de données et des services Docker. Les deux offrent la collaboration selon des modèles différents. Penpot propose un écosystème de plugins et l’export PDF ; OpenPencil fournit des scripts sans interface compatibles Figma, 90 outils AI/MCP, l’export SVG et une application de bureau.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
