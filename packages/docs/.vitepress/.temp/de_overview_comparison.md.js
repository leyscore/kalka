import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil und Penpot im Vergleich\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil und Penpot im Vergleich — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil und Penpot im Vergleich — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"de/overview/comparison.md\",\"filePath\":\"de/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-und-penpot-im-vergleich" tabindex="-1">OpenPencil und Penpot im Vergleich <a class="header-anchor" href="#openpencil-und-penpot-im-vergleich" aria-label="Permalink to “OpenPencil und Penpot im Vergleich”">​</a></h1><p>OpenPencil und Penpot sind Open-Source-Designwerkzeuge mit unterschiedlichen Zielen und Architekturen.</p><div class="info custom-block"><p class="custom-block-title">WASM-Renderer in Penpot</p><p>Penpot 2.x enthält den Rust/Skia-WASM-Renderer <code>render-wasm/v1</code>. Er wird über Serveroptionen oder <code>?wasm=true</code> aktiviert; standardmäßig kommt weiterhin der SVG-Renderer zum Einsatz. Der Vergleich berücksichtigt beide Varianten.</p></div><h2 id="_1-umfang-der-codebasis" tabindex="-1">1. Umfang der Codebasis <a class="header-anchor" href="#_1-umfang-der-codebasis" aria-label="Permalink to “1. Umfang der Codebasis”">​</a></h2><table tabindex="0"><thead><tr><th>Metrik</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Lines of code</td><td><strong>rund 26.000</strong></td><td><strong>rund 299.000</strong></td></tr><tr><td>Quelldateien</td><td>rund 143</td><td>rund 2.900</td></tr><tr><td>Sprachen</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Renderer</td><td>rund 3.200 Zeilen, TypeScript</td><td>22.000 Zeilen, Rust/Skia WASM</td></tr><tr><td>Oberfläche</td><td>rund 4.500 Zeilen</td><td>rund 175.000 Zeilen, CLJS und SCSS</td></tr><tr><td>Serverseite</td><td>Keine, lokale Architektur</td><td>32.600 Zeilen und 151 SQL-Dateien</td></tr><tr><td>Verhältnis</td><td><strong>1×</strong></td><td><strong>rund 11×</strong></td></tr></tbody></table><p>OpenPencil ist ungefähr elfmal kleiner. Der Unterschied entsteht vor allem durch die Architektur, nicht nur durch den Funktionsumfang.</p><h2 id="_2-architektur" tabindex="-1">2. Architektur <a class="header-anchor" href="#_2-architektur" aria-label="Permalink to “2. Architektur”">​</a></h2><h3 id="openpencil-ein-clientprozess" tabindex="-1">OpenPencil: ein Clientprozess <a class="header-anchor" href="#openpencil-ein-clientprozess" aria-label="Permalink to “OpenPencil: ein Clientprozess”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>Editor, SceneGraph, Dateicodec und Renderer laufen in einem Prozess. Ein separater Server, eine Datenbank und Docker sind nicht erforderlich. Der SceneGraph liegt als <code>Map&lt;string, SceneNode&gt;</code> vor. TypeScript ruft CanvasKit direkt auf, Yoga WASM berechnet die Anordnung synchron.</p><h3 id="penpot-client-server-plattform" tabindex="-1">Penpot: Client-Server-Plattform <a class="header-anchor" href="#penpot-client-server-plattform" aria-label="Permalink to “Penpot: Client-Server-Plattform”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Ein vollständiger Penpot-Betrieb umfasst Oberfläche, JVM-Serverseite, PostgreSQL, Valkey, MinIO und einen Exportdienst auf Grundlage von Chromium ohne Oberfläche. Die Entwicklungsumgebung benötigt Docker Compose, JVM, Node und Rust-Werkzeuge.</p><p>OpenPencil vermeidet Netzwerklatenz, Serialisierung zwischen Diensten, Containerverwaltung und Datenbankabfragen für gewöhnliche Editorvorgänge. Penpot ist auf eine zentral gehostete Mehrbenutzerplattform ausgerichtet; OpenPencil auf lokale Bearbeitung mit geringer Latenz.</p><h2 id="_3-renderablauf" tabindex="-1">3. Renderablauf <a class="header-anchor" href="#_3-renderablauf" aria-label="Permalink to “3. Renderablauf”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil: TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil: TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">}</span></span></code></pre></div><ul><li>Ein direkter Übergang von TypeScript zu WASM.</li><li>Der SceneGraph bleibt im JavaScript heap und wird vor dem Rendering nicht serialisiert.</li><li>Der Renderer umfasst rund 3.200 Zeilen in spezialisierten Modulen.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot: ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: ClojureScript → Rust WASM → Skia”">​</a></h3><p>Mit aktiviertem WASM-Renderer:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → Zerlegung und Binary packing in WASM linear memory</span></span>
<span class="line"><span>  → Rust WASM über Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Ohne WASM wird jedes Shape als SVG DOM element über React/Reagent gerendert.</p><p>Im WASM-Modus wird eine UUID in vier <code>u32</code> zerlegt, eine Transformation in sechs <code>f32</code>, Füllungen und Konturen werden binär codiert und grundlegende Formeigenschaften in einer 104-Byte-Struktur gespeichert. Der Renderer verwendet Kachelcache, Interessenbereiche, elf Renderflächen und globalen veränderlichen Zustand über <code>unsafe { STATE.as_mut() }</code>.</p><p>Das Tile system bereitet Bereiche um den Viewport vor und hält bis zu 1.024 Textures im Cache. OpenPencil rendert dagegen den sichtbaren Bereich vollständig neu.</p><table tabindex="0"><thead><tr><th>Aspekt</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Direkte Calls mit TypeScript objects</td><td>Binär gepackte Structures</td></tr><tr><td>Rendering model</td><td>Vollständiger sichtbarer Viewport</td><td>Tile cache</td></tr><tr><td>Surfaces</td><td>1</td><td>11</td></tr><tr><td>Zusätzlicher Cache</td><td>Kein Tile cache</td><td>Bis zu 1.024 Tiles</td></tr><tr><td>Renderer size</td><td>rund 3.200 LOC</td><td>22.000 LOC</td></tr><tr><td>Unsicherer Code</td><td>Keiner</td><td>Globaler Zustand über <code>unsafe</code></td></tr></tbody></table><p>Für kleine und mittlere Dokumente benötigt der direkte CanvasKit path weniger Zwischenverarbeitung. Bei Dokumenten mit mehr als 100.000 Shapes kann Penpots Tile system vorteilhaft sein, wenn nur ein kleiner Ausschnitt sichtbar ist.</p><h2 id="_4-scenegraph-und-datenmodell" tabindex="-1">4. SceneGraph und Datenmodell <a class="header-anchor" href="#_4-scenegraph-und-datenmodell" aria-label="Permalink to “4. SceneGraph und Datenmodell”">​</a></h2><h3 id="openpencil" tabindex="-1">OpenPencil <a class="header-anchor" href="#openpencil" aria-label="Permalink to “OpenPencil”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><ul><li>Lookup nach ID in O(1).</li><li>29 Object types aus Figmas Kiwi schema.</li><li>Rund 390 Fields in <code>NodeChange</code>.</li><li>Strict TypeScript types.</li><li>GUID im Figma format <code>sessionID:localID</code>.</li></ul><p>Penpot pflegt eigene Type definitions in Clojure/ClojureScript und Rust. Separate Modules behandeln Colors, Components, Containers, Fills, Grid, Modifiers, Pages und Paths. Malli validiert Schemas zur Runtime, während Rendering data die Grenze von CLJS zu Rust überschreiten.</p><p>OpenPencil verwendet das Kiwi schema direkt. Penpot muss sein eigenes Datenmodell zwischen mehreren Sprachen synchron halten.</p><h2 id="_5-anordnungs-engine" tabindex="-1">5. Anordnungs-Engine <a class="header-anchor" href="#_5-anordnungs-engine" aria-label="Permalink to “5. Anordnungs-Engine”">​</a></h2><p>OpenPencil verwendet Yoga WASM synchron:</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">(graph, frame, yogaRoot)</span></span></code></pre></div><p>Penpot pflegt eigene Flex- und Grid-Implementations in ClojureScript und Rust WASM. Beide Engines müssen dasselbe Ergebnis liefern.</p><p>OpenPencil nutzt die etablierte Bibliothek Yoga einschließlich einer Variante mit Grid. Penpot wartet mehrere Tausend Zeilen eigenen Anordnungscode in zwei Sprachen.</p><h2 id="_6-dateiformate-und-figma" tabindex="-1">6. Dateiformate und Figma <a class="header-anchor" href="#_6-dateiformate-und-figma" aria-label="Permalink to “6. Dateiformate und Figma”">​</a></h2><h3 id="openpencil-1" tabindex="-1">OpenPencil <a class="header-anchor" href="#openpencil-1" aria-label="Permalink to “OpenPencil”">​</a></h3><ul><li>Native Kiwi binary format von Figma.</li><li>Direkter Import von <code>.fig</code>.</li><li>Paste von Kiwi binary data aus Figmas Clipboard.</li><li>Wire compatibility mit Figmas Multiplayer protocol.</li></ul><h3 id="penpot" tabindex="-1">Penpot <a class="header-anchor" href="#penpot" aria-label="Permalink to “Penpot”">​</a></h3><ul><li><code>.penpot</code> ist ein ZIP mit JSON manifests, Dokumentdaten, Binary assets und Thumbnails.</li><li>Standardmäßig SVG renderer und SVG export; optionaler WASM renderer.</li><li>Kein nativer <code>.fig</code>-Import.</li><li>Mehrere Format generations mit Migration system.</li></ul><p>OpenPencil liest <code>.fig</code> und Figmas Clipboard direkt. Penpot benötigt einen getrennten Import- oder Exportweg.</p><h2 id="_7-zustand-und-ruckgangig" tabindex="-1">7. Zustand und Rückgängig <a class="header-anchor" href="#_7-zustand-und-ruckgangig" aria-label="Permalink to “7. Zustand und Rückgängig”">​</a></h2><p>OpenPencil verwendet inverse Befehle. Vorwärts- und Rückwärtsfunktionen speichern nur den benötigten Zustand; Stapel fassen mehrere Vorgänge zusammen.</p><p>Penpot verwendet Potok. <code>UpdateEvent</code> ändert den Zustand, <code>WatchEvent</code> führt Nebenwirkungen über RxJS aus. Rückgängig speichert inverse Änderungsvektoren, begrenzt die Historie auf 50 Einträge und gruppiert schnelle Änderungen in Transaktionen.</p><p>Serialisierbare Änderungen passen gut zu Penpots serverbasierter Zusammenarbeit, erhöhen jedoch die Komplexität. OpenPencils Ansatz ist für den Editor in einem Prozess direkter.</p><h2 id="_8-development" tabindex="-1">8. Development <a class="header-anchor" href="#_8-development" aria-label="Permalink to “8. Development”">​</a></h2><table tabindex="0"><thead><tr><th>Metrik</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Setup</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node und Rust</td></tr><tr><td>HMR</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Types</td><td>Strict TypeScript</td><td>Malli runtime schemas</td></tr><tr><td>Desktop</td><td>Tauri v2</td><td>Browser</td></tr><tr><td>Zentrale Technologien</td><td>TypeScript und Vue</td><td>Clojure, ClojureScript, Rust und Docker</td></tr></tbody></table><h2 id="_9-performance-characteristics" tabindex="-1">9. Performance characteristics <a class="header-anchor" href="#_9-performance-characteristics" aria-label="Permalink to “9. Performance characteristics”">​</a></h2><table tabindex="0"><thead><tr><th>Szenario</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Kaltstart</td><td>unter 2 s einschließlich WASM</td><td>über 10 s für Server, Client und WASM</td></tr><tr><td>Gewöhnliche Operation</td><td>Innerhalb eines Process</td><td>Möglicher Network round trip</td></tr><tr><td>Render frame</td><td>Direkter Skia call</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Grundbedarf an Memory</td><td>rund 50 MB im Browser tab</td><td>JVM, Database, Cache und Browser</td></tr><tr><td>Offline</td><td>Vollständiger local-first mode</td><td>Server erforderlich</td></tr><tr><td>10K Shapes</td><td>Ein Rendering pass</td><td>Tile renderer mit elf Surfaces</td></tr></tbody></table><h2 id="_10-starken-von-penpot" tabindex="-1">10. Stärken von Penpot <a class="header-anchor" href="#_10-starken-von-penpot" aria-label="Permalink to “10. Stärken von Penpot”">​</a></h2><ol><li><strong>Serverbasierte Zusammenarbeit:</strong> Konten, Zugriffskontrolle und zentrale Speicherung über WebSockets.</li><li><strong>PDF export:</strong> eigener Chromium exporter.</li><li><strong>Plugin system:</strong> Sandboxed execution und Plugin API.</li><li><strong>Design tokens:</strong> integrierte Unterstützung.</li><li><strong>CSS Grid:</strong> eigene Implementation; OpenPencil verwendet einen Yoga fork mit Grid.</li><li><strong>Self-hosting:</strong> Team platform über Docker deploybar.</li><li><strong>Reife:</strong> mehrjährige Verwendung in Production.</li></ol><h2 id="_11-scripts-und-erweiterbarkeit" tabindex="-1">11. Scripts und Erweiterbarkeit <a class="header-anchor" href="#_11-scripts-und-erweiterbarkeit" aria-label="Permalink to “11. Scripts und Erweiterbarkeit”">​</a></h2><p>Der Befehl <a href="/programmable/cli/scripting"><code>eval</code></a> stellt eine Figma-kompatible Plugin API für Skripte ohne Oberfläche, Stapelvorgänge und automatisierte Tests bereit. Außerdem sind 90 AI-Werkzeuge über AI-Chat, MCP-Server und CLI verfügbar. Sie decken Lesen, Erstellen, Ändern, Struktur, Variablen, Vektorpfade, Analyse, Vergleiche, boolesche Operationen und Anordnung ab.</p><p>Penpot besitzt isoliert ausgeführte Plugins, aber keine vergleichbare Skript-API ohne Oberfläche oder MCP-Integration.</p><h2 id="zusammenfassung" tabindex="-1">Zusammenfassung <a class="header-anchor" href="#zusammenfassung" aria-label="Permalink to “Zusammenfassung”">​</a></h2><table tabindex="0"><thead><tr><th>Bereich</th><th>Vorteil</th><th>Grund</th></tr></thead><tbody><tr><td>Einfachheit</td><td>OpenPencil</td><td>Ein Prozess statt mehrerer Dienste</td></tr><tr><td>Darstellung</td><td>OpenPencil</td><td>Direkter CanvasKit-Pfad</td></tr><tr><td>Codebasis</td><td>OpenPencil</td><td>Rund 26.000 statt 299.000 Zeilen</td></tr><tr><td>Figma compatibility</td><td>OpenPencil</td><td>Native Kiwi und <code>.fig</code></td></tr><tr><td>Development setup</td><td>OpenPencil</td><td>TypeScript und Vue statt Clojure, Rust und Docker</td></tr><tr><td>Desktop app</td><td>OpenPencil</td><td>Native Tauri application</td></tr><tr><td>Layout</td><td>OpenPencil</td><td>Yoga statt zwei eigener Implementations</td></tr><tr><td>Collaboration</td><td>Unterschiedliche Stärken</td><td>Penpot: Server und Access control; OpenPencil: P2P ohne Hosting</td></tr><tr><td>Selbsthosting</td><td>Penpot</td><td>Docker-Bereitstellung</td></tr><tr><td>Ökosystemreife</td><td>Penpot</td><td>Mehrjährige Produktionserfahrung</td></tr></tbody></table><p>OpenPencil ist ein kompakter Editor in einem Prozess mit CanvasKit-Renderer und nativer <code>.fig</code>-Unterstützung. Penpot ist eine vollständige Client-Server-Plattform mit Clojure, ClojureScript, Rust, Datenbanken und Docker-Diensten. Beide unterstützen Zusammenarbeit mit unterschiedlichen Modellen. Penpot bietet ein Plugin-Ökosystem und PDF-Export; OpenPencil eine Figma-kompatible API ohne Oberfläche, 90 AI/MCP-Werkzeuge, SVG-Export und eine Desktop-App.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
