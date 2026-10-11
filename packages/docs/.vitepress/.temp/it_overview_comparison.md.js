import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil e Penpot: architettura e prestazioni\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil e Penpot: architettura e prestazioni — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil e Penpot: architettura e prestazioni — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"it/overview/comparison.md\",\"filePath\":\"it/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-e-penpot-architettura-e-prestazioni" tabindex="-1">OpenPencil e Penpot: architettura e prestazioni <a class="header-anchor" href="#openpencil-e-penpot-architettura-e-prestazioni" aria-label="Permalink to “OpenPencil e Penpot: architettura e prestazioni”">​</a></h1><p>OpenPencil e Penpot sono strumenti di design open source, ma adottano obiettivi e architetture differenti.</p><div class="info custom-block"><p class="custom-block-title">Motore WASM di Penpot</p><p>Penpot 2.x include il motore Rust/Skia WASM <code>render-wasm/v1</code>, attivabile tramite opzioni del server o <code>?wasm=true</code>. Il motore SVG rimane quello predefinito. Il confronto considera entrambe le modalità.</p></div><h2 id="_1-dimensione-del-codice" tabindex="-1">1. Dimensione del codice <a class="header-anchor" href="#_1-dimensione-del-codice" aria-label="Permalink to “1. Dimensione del codice”">​</a></h2><table tabindex="0"><thead><tr><th>Metrica</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Righe di codice</td><td><strong>circa 26.000</strong></td><td><strong>circa 299.000</strong></td></tr><tr><td>File sorgente</td><td>circa 143</td><td>circa 2.900</td></tr><tr><td>Linguaggi</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Motore di rendering</td><td>circa 3.200 righe, TypeScript</td><td>22.000 righe, Rust/Skia WASM</td></tr><tr><td>Interfaccia</td><td>circa 4.500 righe</td><td>circa 175.000 righe, CLJS e SCSS</td></tr><tr><td>Server</td><td>Nessuno, architettura locale</td><td>32.600 righe e 151 file SQL</td></tr><tr><td>Rapporto</td><td><strong>1×</strong></td><td><strong>circa 11×</strong></td></tr></tbody></table><p>OpenPencil è circa undici volte più piccolo. La differenza dipende soprattutto dall’architettura, non soltanto dal numero di funzioni.</p><h2 id="_2-architettura" tabindex="-1">2. Architettura <a class="header-anchor" href="#_2-architettura" aria-label="Permalink to “2. Architettura”">​</a></h2><h3 id="openpencil-un-solo-processo-client" tabindex="-1">OpenPencil: un solo processo client <a class="header-anchor" href="#openpencil-un-solo-processo-client" aria-label="Permalink to “OpenPencil: un solo processo client”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>Editor, SceneGraph, codec dei file e motore di rendering vengono eseguiti nello stesso processo. Non servono server, database o Docker. SceneGraph è una <code>Map&lt;string, SceneNode&gt;</code>. TypeScript chiama direttamente CanvasKit e Yoga WASM calcola la disposizione in modo sincrono.</p><h3 id="penpot-piattaforma-client-server" tabindex="-1">Penpot: piattaforma client-server <a class="header-anchor" href="#penpot-piattaforma-client-server" aria-label="Permalink to “Penpot: piattaforma client-server”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Un’installazione completa di Penpot comprende interfaccia, server JVM, PostgreSQL, Valkey, MinIO e un esportatore basato su Chromium senza interfaccia. L’ambiente di sviluppo richiede Docker Compose, JVM, Node e strumenti Rust.</p><p>OpenPencil evita latenza di rete, serializzazione tra servizi, orchestrazione dei contenitori e query al database per le normali operazioni. Penpot è pensato come piattaforma multiutente ospitata su server; OpenPencil privilegia l’editing locale a bassa latenza.</p><h2 id="_3-flusso-di-rendering" tabindex="-1">3. Flusso di rendering <a class="header-anchor" href="#_3-flusso-di-rendering" aria-label="Permalink to “3. Flusso di rendering”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil: TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil: TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">}</span></span></code></pre></div><ul><li>Passaggio diretto da TypeScript a WASM.</li><li>SceneGraph rimane nell’heap JavaScript e non viene serializzato prima del rendering.</li><li>Il motore comprende circa 3.200 righe distribuite in moduli specializzati.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot: ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: ClojureScript → Rust WASM → Skia”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → scomposizione e codifica binaria nella memoria WASM</span></span>
<span class="line"><span>  → Rust WASM tramite Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Senza WASM, ogni forma viene renderizzata come elemento SVG DOM tramite React/Reagent. Con WASM, UUID, trasformazioni, riempimenti e contorni vengono codificati in strutture binarie. Il motore usa cache a riquadri, aree di interesse, undici superfici e stato globale mutabile tramite <code>unsafe</code>.</p><p>La cache può conservare fino a 1.024 texture. OpenPencil ridisegna invece l’intera area visibile.</p><table tabindex="0"><thead><tr><th>Aspetto</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Chiamate dirette con oggetti TypeScript</td><td>Strutture binarie</td></tr><tr><td>Modello</td><td>Ridisegno del viewport visibile</td><td>Cache a riquadri</td></tr><tr><td>Superfici</td><td>1</td><td>11</td></tr><tr><td>Cache aggiuntiva</td><td>Nessuna</td><td>Fino a 1.024 riquadri</td></tr><tr><td>Dimensione del motore</td><td>circa 3.200 righe</td><td>22.000 righe</td></tr><tr><td>Codice non sicuro</td><td>Nessuno</td><td>Stato globale tramite <code>unsafe</code></td></tr></tbody></table><p>Il percorso diretto di CanvasKit richiede meno elaborazione intermedia nei documenti piccoli e medi. La cache di Penpot può essere vantaggiosa oltre 100.000 forme quando è visibile solo una piccola area.</p><h2 id="_4-scenegraph-e-modello-dati" tabindex="-1">4. SceneGraph e modello dati <a class="header-anchor" href="#_4-scenegraph-e-modello-dati" aria-label="Permalink to “4. SceneGraph e modello dati”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><p>OpenPencil offre ricerca per ID in O(1), 29 tipi di oggetto dallo schema Kiwi, circa 390 campi in <code>NodeChange</code>, tipi TypeScript rigorosi e GUID nel formato Figma <code>sessionID:localID</code>.</p><p>Penpot mantiene definizioni proprie in Clojure/ClojureScript e Rust. Moduli separati gestiscono colori, componenti, contenitori, riempimenti, griglia, modificatori, pagine e percorsi. Malli convalida gli schemi durante l’esecuzione e i dati di rendering attraversano il confine CLJS → Rust.</p><h2 id="_5-motore-di-disposizione" tabindex="-1">5. Motore di disposizione <a class="header-anchor" href="#_5-motore-di-disposizione" aria-label="Permalink to “5. Motore di disposizione”">​</a></h2><p>OpenPencil usa Yoga WASM in modo sincrono:</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><p>Penpot mantiene implementazioni proprie di Flex e Grid sia in ClojureScript sia in Rust WASM. OpenPencil usa Yoga, compresa una variante con supporto Grid; Penpot mantiene migliaia di righe di codice di disposizione in due linguaggi.</p><h2 id="_6-formati-e-figma" tabindex="-1">6. Formati e Figma <a class="header-anchor" href="#_6-formati-e-figma" aria-label="Permalink to “6. Formati e Figma”">​</a></h2><p>OpenPencil usa il formato binario Kiwi di Figma, importa direttamente <code>.fig</code>, legge i dati Kiwi dagli appunti ed è compatibile con il protocollo multiplayer di Figma.</p><p>Un file <code>.penpot</code> è invece un archivio ZIP con manifesti JSON, dati, risorse binarie e miniature. Penpot non importa <code>.fig</code> in modo nativo e gestisce diverse generazioni del formato tramite migrazioni.</p><h2 id="_7-stato-e-annullamento" tabindex="-1">7. Stato e annullamento <a class="header-anchor" href="#_7-stato-e-annullamento" aria-label="Permalink to “7. Stato e annullamento”">​</a></h2><p>OpenPencil usa comandi inversi: le funzioni di applicazione e annullamento conservano solo lo stato necessario e le operazioni possono essere raggruppate.</p><p>Penpot usa Potok. <code>UpdateEvent</code> cambia lo stato, <code>WatchEvent</code> esegue gli effetti tramite RxJS e la cronologia conserva vettori inversi, fino a 50 voci, raggruppando le modifiche rapide in transazioni.</p><h2 id="_8-sviluppo" tabindex="-1">8. Sviluppo <a class="header-anchor" href="#_8-sviluppo" aria-label="Permalink to “8. Sviluppo”">​</a></h2><table tabindex="0"><thead><tr><th>Metrica</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Preparazione</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node e Rust</td></tr><tr><td>Aggiornamento rapido</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Tipi</td><td>TypeScript rigoroso</td><td>Schemi Malli durante l’esecuzione</td></tr><tr><td>Desktop</td><td>Tauri v2</td><td>Browser</td></tr><tr><td>Tecnologie principali</td><td>TypeScript e Vue</td><td>Clojure, ClojureScript, Rust e Docker</td></tr></tbody></table><h2 id="_9-prestazioni" tabindex="-1">9. Prestazioni <a class="header-anchor" href="#_9-prestazioni" aria-label="Permalink to “9. Prestazioni”">​</a></h2><table tabindex="0"><thead><tr><th>Scenario</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Avvio</td><td>meno di 2 s con WASM</td><td>oltre 10 s per server, client e WASM</td></tr><tr><td>Operazione comune</td><td>Nello stesso processo</td><td>Possibile passaggio di rete</td></tr><tr><td>Fotogramma</td><td>Chiamata diretta a Skia</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Memoria di base</td><td>circa 50 MB nella scheda</td><td>JVM, database, cache e browser</td></tr><tr><td>Senza rete</td><td>Completo</td><td>Richiede il server</td></tr><tr><td>10.000 forme</td><td>Una passata</td><td>Renderer a riquadri con 11 superfici</td></tr></tbody></table><h2 id="_10-vantaggi-di-penpot" tabindex="-1">10. Vantaggi di Penpot <a class="header-anchor" href="#_10-vantaggi-di-penpot" aria-label="Permalink to “10. Vantaggi di Penpot”">​</a></h2><ol><li><strong>Collaborazione tramite server:</strong> account, controllo degli accessi e archiviazione centrale.</li><li><strong>Export PDF:</strong> esportatore Chromium dedicato.</li><li><strong>Sistema di plugin:</strong> esecuzione isolata e API dei plugin.</li><li><strong>Token di design:</strong> supporto integrato.</li><li><strong>CSS Grid:</strong> implementazione propria; OpenPencil usa una variante di Yoga con Grid.</li><li><strong>Installazione autonoma:</strong> piattaforma di gruppo distribuibile con Docker.</li><li><strong>Maturità:</strong> diversi anni di uso in produzione.</li></ol><h2 id="_11-script-ed-estensibilita" tabindex="-1">11. Script ed estensibilità <a class="header-anchor" href="#_11-script-ed-estensibilita" aria-label="Permalink to “11. Script ed estensibilità”">​</a></h2><p>Il comando <a href="/programmable/cli/scripting"><code>eval</code></a> fornisce un’API compatibile con i plugin Figma per script senza interfaccia, operazioni in serie e test automatizzati. Chat AI, server MCP e CLI offrono inoltre 90 strumenti per lettura, creazione, modifica, struttura, variabili, tracciati vettoriali, analisi, differenze, operazioni booleane e disposizione.</p><p>Penpot offre plugin isolati, ma non un’API equivalente per script senza interfaccia o integrazione MCP.</p><h2 id="riepilogo" tabindex="-1">Riepilogo <a class="header-anchor" href="#riepilogo" aria-label="Permalink to “Riepilogo”">​</a></h2><table tabindex="0"><thead><tr><th>Area</th><th>Vantaggio</th><th>Motivo</th></tr></thead><tbody><tr><td>Semplicità</td><td>OpenPencil</td><td>Un processo invece di più servizi</td></tr><tr><td>Rendering</td><td>OpenPencil</td><td>Percorso CanvasKit diretto</td></tr><tr><td>Codice</td><td>OpenPencil</td><td>Circa 26.000 contro 299.000 righe</td></tr><tr><td>Compatibilità Figma</td><td>OpenPencil</td><td>Kiwi e <code>.fig</code> nativi</td></tr><tr><td>Sviluppo</td><td>OpenPencil</td><td>TypeScript e Vue anziché Clojure, Rust e Docker</td></tr><tr><td>Applicazione desktop</td><td>OpenPencil</td><td>Tauri nativo</td></tr><tr><td>Disposizione</td><td>OpenPencil</td><td>Yoga anziché due implementazioni proprie</td></tr><tr><td>Collaborazione</td><td>Punti di forza diversi</td><td>Penpot: server e accessi; OpenPencil: P2P senza hosting</td></tr><tr><td>Installazione autonoma</td><td>Penpot</td><td>Distribuzione Docker</td></tr><tr><td>Maturità</td><td>Penpot</td><td>Anni di uso in produzione</td></tr></tbody></table><p>OpenPencil è un editor compatto in un solo processo con CanvasKit e supporto nativo <code>.fig</code>. Penpot è una piattaforma client-server completa con Clojure, ClojureScript, Rust, database e servizi Docker. Entrambi supportano la collaborazione con modelli diversi.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
