import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"Open Pencil vs Penpot: Architecture & Performance Comparison\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Open Pencil vs Penpot: Architecture & Performance Comparison — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Open Pencil vs Penpot: Architecture & Performance Comparison — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"overview/comparison.md\",\"filePath\":\"overview/comparison.md\",\"lastUpdated\":1786618228000}");
var _sfc_main = { name: "overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="open-pencil-vs-penpot-architecture-performance-comparison" tabindex="-1">Open Pencil vs Penpot: Architecture &amp; Performance Comparison <a class="header-anchor" href="#open-pencil-vs-penpot-architecture-performance-comparison" aria-label="Permalink to “Open Pencil vs Penpot: Architecture &amp; Performance Comparison”">​</a></h1><p>Why compare? OpenPencil exists because closed design platforms control what&#39;s possible. Understanding architectural differences shows what an open, local-first alternative can do differently.</p><div class="info custom-block"><p class="custom-block-title">Penpot&#39;s WASM renderer</p><p>Penpot 2.x includes a Rust/Skia WASM renderer (<code>render-wasm/v1</code>) that can be enabled via server flags or the <code>?wasm=true</code> URL parameter. The old SVG renderer remains the default. This page covers both.</p></div><h2 id="_1-scale-codebase-size" tabindex="-1">1. Scale &amp; Codebase Size <a class="header-anchor" href="#_1-scale-codebase-size" aria-label="Permalink to “1. Scale &amp; Codebase Size”">​</a></h2><table tabindex="0"><thead><tr><th>Metric</th><th>Open Pencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Total LOC</td><td><strong>~26,000</strong></td><td><strong>~299,000</strong></td></tr><tr><td>Source files</td><td>~143</td><td>~2,900</td></tr><tr><td>Languages</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JS, SQL, SCSS</td></tr><tr><td>Rendering engine</td><td>~3,200 LOC (TS, 10 files)</td><td>22,000 LOC (Rust/Skia WASM)</td></tr><tr><td>UI code</td><td>~4,500 LOC</td><td>~175,000 LOC (CLJS + SCSS)</td></tr><tr><td>Backend</td><td>None (local-first)</td><td>32,600 LOC + 151 SQL files</td></tr><tr><td>LOC ratio</td><td><strong>1×</strong></td><td><strong>~11×</strong></td></tr></tbody></table><p>Open Pencil is <strong>~11× smaller</strong> — and that&#39;s the whole point. It&#39;s not a simplification; it&#39;s a fundamentally different architecture.</p><h2 id="_2-architecture" tabindex="-1">2. Architecture <a class="header-anchor" href="#_2-architecture" aria-label="Permalink to “2. Architecture”">​</a></h2><h3 id="open-pencil-monolithic-client" tabindex="-1">Open Pencil: Monolithic Client <a class="header-anchor" href="#open-pencil-monolithic-client" aria-label="Permalink to “Open Pencil: Monolithic Client”">​</a></h3><div class="language-"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌─────────────────────────────────┐</span></span>
<span class="line"><span>│         Tauri (native shell)    │</span></span>
<span class="line"><span>│  ┌───────────────────────────┐  │</span></span>
<span class="line"><span>│  │  Vue 3 + TypeScript       │  │</span></span>
<span class="line"><span>│  │  ┌─────────┐ ┌──────────┐│  │</span></span>
<span class="line"><span>│  │  │  Editor  │ │  Kiwi    ││  │</span></span>
<span class="line"><span>│  │  │  Store   │ │  Codec   ││  │</span></span>
<span class="line"><span>│  │  └────┬─────┘ └──────────┘│  │</span></span>
<span class="line"><span>│  │       │                    │  │</span></span>
<span class="line"><span>│  │  ┌────▼────────────────┐  │  │</span></span>
<span class="line"><span>│  │  │  Scene Graph (TS)    │  │  │</span></span>
<span class="line"><span>│  │  │  Map&lt;string, Node&gt;   │  │  │</span></span>
<span class="line"><span>│  │  └────┬────────────────┘  │  │</span></span>
<span class="line"><span>│  │       │                    │  │</span></span>
<span class="line"><span>│  │  ┌────▼────┐ ┌──────────┐│  │</span></span>
<span class="line"><span>│  │  │  Skia   │ │  Yoga    ││  │</span></span>
<span class="line"><span>│  │  │CanvasKit│ │  Layout  ││  │</span></span>
<span class="line"><span>│  │  │  (WASM) │ │  (WASM)  ││  │</span></span>
<span class="line"><span>│  │  └─────────┘ └──────────┘│  │</span></span>
<span class="line"><span>│  └───────────────────────────┘  │</span></span>
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p><strong>Everything in one process.</strong> No server, no database, no Docker. The scene graph is a flat <code>Map&lt;string, SceneNode&gt;</code> in TypeScript. Rendering calls Skia CanvasKit directly from TS. Layout is Yoga WASM called synchronously.</p><h3 id="penpot-distributed-client-server" tabindex="-1">Penpot: Distributed Client-Server <a class="header-anchor" href="#penpot-distributed-client-server" aria-label="Permalink to “Penpot: Distributed Client-Server”">​</a></h3><div class="language-"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                      │</span></span>
<span class="line"><span>│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │</span></span>
<span class="line"><span>│  │   Frontend    │  │   Backend   │  │   Exporter   │ │</span></span>
<span class="line"><span>│  │  ClojureScript│  │   Clojure   │  │  (Chromium)  │ │</span></span>
<span class="line"><span>│  │  shadow-cljs  │  │   JVM       │  │              │ │</span></span>
<span class="line"><span>│  │  ┌─────────┐ │  │  ┌────────┐ │  └──────────────┘ │</span></span>
<span class="line"><span>│  │  │render-  │ │  │  │Postgres│ │                    │</span></span>
<span class="line"><span>│  │  │wasm     │ │  │  │Valkey  │ │  ┌──────────────┐ │</span></span>
<span class="line"><span>│  │  │(Rust→   │ │  │  │ MinIO  │ │  │   MCP        │ │</span></span>
<span class="line"><span>│  │  │ Skia    │ │  │  └────────┘ │  │   Server     │ │</span></span>
<span class="line"><span>│  │  │ WASM)   │ │  │             │  └──────────────┘ │</span></span>
<span class="line"><span>│  │  └─────────┘ │  │             │                    │</span></span>
<span class="line"><span>│  └──────────────┘  └─────────────┘                    │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>5+ services minimum.</strong> PostgreSQL for persistence, Redis (Valkey) for pub/sub and caching, MinIO for asset storage, a JVM backend, a Node.js exporter (headless Chromium for server-side rendering), plus the ClojureScript frontend. Dev setup requires Docker Compose with custom networking.</p><h3 id="verdict-architecture" tabindex="-1">Verdict: Architecture <a class="header-anchor" href="#verdict-architecture" aria-label="Permalink to “Verdict: Architecture”">​</a></h3><p>Open Pencil&#39;s single-process architecture eliminates:</p><ul><li>Network latency between frontend and backend</li><li>Serialization/deserialization overhead at service boundaries</li><li>Container orchestration complexity</li><li>Database query overhead for every operation</li></ul><p>Penpot&#39;s architecture is optimized for <strong>multi-user server-hosted deployments</strong>. Open Pencil is optimized for <strong>instant local performance</strong>.</p><h2 id="_3-rendering-pipeline" tabindex="-1">3. Rendering Pipeline <a class="header-anchor" href="#_3-rendering-pipeline" aria-label="Permalink to “3. Rendering Pipeline”">​</a></h2><h3 id="open-pencil-ts-→-canvaskit-wasm-direct" tabindex="-1">Open Pencil: TS → CanvasKit WASM (direct) <a class="header-anchor" href="#open-pencil-ts-→-canvaskit-wasm-direct" aria-label="Permalink to “Open Pencil: TS → CanvasKit WASM (direct)”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// renderer.ts — direct CanvasKit calls from TypeScript</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">renderSceneToCanvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvas, graph, pageId) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  // Iterate nodes, build Skia paths/paints, draw</span></span>
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
	})}">}</span></span></code></pre></div><ul><li><strong>1 boundary crossing:</strong> TS → WASM (CanvasKit)</li><li>Scene graph lives in JS heap — no serialization to render</li><li>~3,200 LOC renderer (split into 10 focused files: scene, overlays, fills, strokes, shapes, effects, rulers, labels)</li></ul><h3 id="penpot-js-compiled-from-cljs-→-rust-wasm-→-skia" tabindex="-1">Penpot: JS (compiled from CLJS) → Rust WASM → Skia <a class="header-anchor" href="#penpot-js-compiled-from-cljs-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: JS (compiled from CLJS) → Rust WASM → Skia”">​</a></h3><p>Penpot 2.x includes a Rust/Skia WASM renderer (<code>render-wasm/v1</code>), opt-in via server flags or <code>?wasm=true</code>. When enabled, shapes are rendered through:</p><div class="language-"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript (compiled to JS)</span></span>
<span class="line"><span>  → decompose to primitives + binary-pack into WASM linear memory</span></span>
<span class="line"><span>  → Rust WASM (via Emscripten C FFI)</span></span>
<span class="line"><span>  → skia-safe (Rust Skia bindings)</span></span>
<span class="line"><span>  → Skia (WebGL)</span></span></code></pre></div><p>When disabled (default), shapes render as an SVG DOM tree via React/Reagent — each shape is a DOM element.</p><ul><li><strong>1 boundary crossing</strong> (JS → WASM), same as Open Pencil — but with explicit serialization overhead: UUIDs split to 4×u32, transforms to 6×f32, fills/strokes binary-packed, base props batched into a 104-byte struct per shape</li><li>Tile-based rendering system with interest areas</li><li>11 separate render surfaces (fills, strokes, shadows, etc.)</li><li>Global mutable state via <code>unsafe { STATE.as_mut() }</code> pattern</li><li>22,000 LOC Rust render engine</li></ul><p>Penpot&#39;s tile system (<code>TileViewbox</code>, <code>TileTextureCache</code>, <code>TILE_SIZE_MULTIPLIER</code>) pre-renders tiles around the viewport and caches textures (up to 1024 entries).</p><p>Open Pencil re-renders the full viewport every frame because CanvasKit called directly from TS is fast enough to not need tiling.</p><h3 id="verdict-rendering" tabindex="-1">Verdict: Rendering <a class="header-anchor" href="#verdict-rendering" aria-label="Permalink to “Verdict: Rendering”">​</a></h3><table tabindex="0"><thead><tr><th>Aspect</th><th>Open Pencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JS→WASM boundary</td><td>Direct (TS objects)</td><td>Binary-packed (104-byte base props struct)</td></tr><tr><td>Rendering model</td><td>Immediate/full redraw</td><td>Tile-cached</td></tr><tr><td>Surface management</td><td>1 surface</td><td>11 surfaces</td></tr><tr><td>Memory overhead</td><td>Low (no tile cache)</td><td>High (1024 tile cache)</td></tr><tr><td>Code complexity</td><td>~3,200 LOC (10 files)</td><td>22,000 LOC</td></tr><tr><td>Unsafe code</td><td>None</td><td><code>unsafe</code> global state</td></tr></tbody></table><p>When Penpot&#39;s WASM renderer is enabled, both projects use Skia via JS→WASM. Open Pencil calls CanvasKit directly with TS objects. Penpot decomposes ClojureScript data into binary-packed structs, writes them to WASM linear memory, and renders through a 22,000 LOC Rust engine. When WASM is disabled (default), Penpot renders shapes as an SVG DOM tree. For small-to-medium documents, the direct CanvasKit path is faster. Penpot&#39;s tile system may win on extremely large canvases (100K+ shapes) where only a small viewport is visible — but the overhead is significant.</p><h2 id="_4-scene-graph-data-model" tabindex="-1">4. Scene Graph &amp; Data Model <a class="header-anchor" href="#_4-scene-graph-data-model" aria-label="Permalink to “4. Scene Graph &amp; Data Model”">​</a></h2><h3 id="open-pencil" tabindex="-1">Open Pencil <a class="header-anchor" href="#open-pencil" aria-label="Permalink to “Open Pencil”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// Flat map, O(1) lookup</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// 29 node types from Figma&#39;s Kiwi schema</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// ~390 fields per NodeChange (Figma-compatible)</span></span></code></pre></div><ul><li>TypeScript interfaces with strict types</li><li>GUIDs match Figma&#39;s <code>sessionID:localID</code> format</li><li>Direct property access — no indirection layers</li></ul><h3 id="penpot" tabindex="-1">Penpot <a class="header-anchor" href="#penpot" aria-label="Permalink to “Penpot”">​</a></h3><div class="language-clojure"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">clojure</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">;; 20+ type definition files in common/src/app/common/types/</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">;; shapes_builder.cljc, shapes_helpers.cljc</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">;; Separate type systems for: color, component, container, fills,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">;; grid, modifiers, objects_map, page, path, etc.</span></span></code></pre></div><ul><li>Data spread across <code>common/</code> (49,600 LOC of .cljc)</li><li>Separate geometry modules for flex layout (~6 files), grid layout (~5 files), constraints, bounds, corners, effects</li><li>Runtime schema validation (Malli)</li><li>Data must cross CLJS→Rust boundary for rendering</li></ul><h3 id="verdict-data-model" tabindex="-1">Verdict: Data Model <a class="header-anchor" href="#verdict-data-model" aria-label="Permalink to “Verdict: Data Model”">​</a></h3><p>Open Pencil reuses Figma&#39;s proven schema (194 Kiwi definitions) directly in TypeScript — zero translation. Penpot maintains its own type system across Clojure/ClojureScript/Rust, requiring manual sync between all three.</p><h2 id="_5-layout-engine" tabindex="-1">5. Layout Engine <a class="header-anchor" href="#_5-layout-engine" aria-label="Permalink to “5. Layout Engine”">​</a></h2><h3 id="open-pencil-yoga-wasm-314-loc" tabindex="-1">Open Pencil: Yoga WASM (314 LOC) <a class="header-anchor" href="#open-pencil-yoga-wasm-314-loc" aria-label="Permalink to “Open Pencil: Yoga WASM (314 LOC)”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// Direct mapping: Figma stack* fields → Yoga flex properties</span></span>
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
	})}">(graph, frame, yogaRoot)</span></span></code></pre></div><p>314 lines total. Synchronous, in-process.</p><h3 id="penpot-dual-implementation" tabindex="-1">Penpot: Dual Implementation <a class="header-anchor" href="#penpot-dual-implementation" aria-label="Permalink to “Penpot: Dual Implementation”">​</a></h3><ol><li><strong>ClojureScript</strong> (common): <code>flex_layout/</code> (6 files), <code>grid_layout/</code> (5+ files) — custom implementations</li><li><strong>Rust WASM</strong>: <code>flex_layout.rs</code> (741 LOC), <code>grid_layout.rs</code> (843 LOC) — reimplemented from scratch</li></ol><p>Penpot maintains <strong>two independent layout engines</strong> (CLJS and Rust) that must produce identical results.</p><h3 id="verdict-layout" tabindex="-1">Verdict: Layout <a class="header-anchor" href="#verdict-layout" aria-label="Permalink to “Verdict: Layout”">​</a></h3><p>Open Pencil delegates to a battle-tested library (Yoga, used by React Native on billions of devices) in 314 lines. Penpot maintains ~3,000+ LOC of custom layout code duplicated across two languages.</p><h2 id="_6-file-format-figma-compatibility" tabindex="-1">6. File Format &amp; Figma Compatibility <a class="header-anchor" href="#_6-file-format-figma-compatibility" aria-label="Permalink to “6. File Format &amp; Figma Compatibility”">​</a></h2><h3 id="open-pencil-1" tabindex="-1">Open Pencil <a class="header-anchor" href="#open-pencil-1" aria-label="Permalink to “Open Pencil”">​</a></h3><ul><li><strong>Native Kiwi binary format</strong> — same serialization as Figma uses internally</li><li>Direct <code>.fig</code> file import via extracted Kiwi codec (2,178 LOC schema + 551 LOC codec)</li><li>Figma clipboard paste support (reads Figma&#39;s Kiwi binary from the clipboard)</li><li>Wire-compatible with Figma&#39;s multiplayer protocol</li></ul><h3 id="penpot-1" tabindex="-1">Penpot <a class="header-anchor" href="#penpot-1" aria-label="Permalink to “Penpot”">​</a></h3><ul><li><strong>ZIP archive</strong> (<code>.penpot</code> files) containing JSON manifests, per-file JSON data, binary assets, and thumbnails (v3 format)</li><li>SVG used for default rendering and export (opt-in WASM renderer available)</li><li>No native <code>.fig</code> import</li><li>Three format versions (v1 legacy Transit, v2, v3 JSON-in-ZIP) with migration system</li></ul><h3 id="verdict-file-format" tabindex="-1">Verdict: File Format <a class="header-anchor" href="#verdict-file-format" aria-label="Permalink to “Verdict: File Format”">​</a></h3><p>Open Pencil has a significant advantage — it can read Figma files natively and even paste Figma clipboard data. Penpot requires manual export/import and cannot open <code>.fig</code> files.</p><h2 id="_7-state-management-undo" tabindex="-1">7. State Management &amp; Undo <a class="header-anchor" href="#_7-state-management-undo" aria-label="Permalink to “7. State Management &amp; Undo”">​</a></h2><h3 id="open-pencil-2" tabindex="-1">Open Pencil <a class="header-anchor" href="#open-pencil-2" aria-label="Permalink to “Open Pencil”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// 110 LOC — inverse command pattern</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UndoManager</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  apply</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">entry</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UndoEntry</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) { entry.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">forward</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(); </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.undoStack.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">push</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(entry) }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  undo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">() { entry.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">inverse</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(); </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.redoStack.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">push</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(entry) }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>110 lines. Forward/inverse closures that capture minimal state. Batch support for multi-step operations.</p><h3 id="penpot-2" tabindex="-1">Penpot <a class="header-anchor" href="#penpot-2" aria-label="Permalink to “Penpot”">​</a></h3><p>State management uses Potok (a Redux-like library for ClojureScript atoms). Events implement <code>UpdateEvent</code> (pure state→state) or <code>WatchEvent</code> (side effects via RxJS). Undo stores inverse change vectors (max 50 entries), with transactions to group rapid changes and auto-expiry after 20 seconds.</p><h3 id="verdict-state" tabindex="-1">Verdict: State <a class="header-anchor" href="#verdict-state" aria-label="Permalink to “Verdict: State”">​</a></h3><p>Open Pencil&#39;s approach is simpler and lower overhead. Penpot&#39;s approach is more suitable for collaboration (changes are serializable), but at the cost of complexity.</p><h2 id="_8-developer-experience" tabindex="-1">8. Developer Experience <a class="header-anchor" href="#_8-developer-experience" aria-label="Permalink to “8. Developer Experience”">​</a></h2><table tabindex="0"><thead><tr><th>Metric</th><th>Open Pencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Dev setup</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose + JVM + Node + Rust toolchain</td></tr><tr><td>Hot reload</td><td>Vite HMR (~50ms)</td><td>shadow-cljs (seconds)</td></tr><tr><td>Type checking</td><td>TypeScript (strict)</td><td>Runtime (Malli schemas)</td></tr><tr><td>Build time</td><td>&lt;5s (Vite)</td><td>Minutes (JVM startup + CLJS compile + Rust WASM)</td></tr><tr><td>First contribution barrier</td><td>Low (TS/Vue)</td><td>High (Clojure + Rust + Docker)</td></tr><tr><td>Desktop</td><td>Tauri v2 (~5MB)</td><td>N/A (browser-only)</td></tr><tr><td>Hiring pool</td><td>Massive (TS/Vue devs)</td><td>Tiny (ClojureScript + Rust)</td></tr></tbody></table><h2 id="_9-performance-characteristics" tabindex="-1">9. Performance Characteristics <a class="header-anchor" href="#_9-performance-characteristics" aria-label="Permalink to “9. Performance Characteristics”">​</a></h2><table tabindex="0"><thead><tr><th>Scenario</th><th>Open Pencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Cold start</td><td>&lt;2s (WASM load)</td><td>10s+ (server + client + WASM)</td></tr><tr><td>Operation latency</td><td>&lt;1ms (in-process)</td><td>10-50ms (network round-trip)</td></tr><tr><td>Render frame</td><td>Direct Skia call</td><td>CLJS→JS→WASM FFI→Skia</td></tr><tr><td>Memory baseline</td><td>~50MB (browser tab)</td><td>~300MB+ (JVM + Postgres + Valkey + browser)</td></tr><tr><td>Offline capability</td><td>Full (local-first)</td><td>None (server-dependent)</td></tr><tr><td>10K shapes render</td><td>One pass, no caching</td><td>Tile-based with 11 surfaces</td></tr></tbody></table><h2 id="_10-what-penpot-does-better" tabindex="-1">10. What Penpot Does Better <a class="header-anchor" href="#_10-what-penpot-does-better" aria-label="Permalink to “10. What Penpot Does Better”">​</a></h2><ol><li><strong>Server-side collaboration</strong> — centralized multi-user editing with WebSockets, user accounts, and access control (Open Pencil uses P2P via Trystero + Yjs — no server, but also no access control or persistence beyond the session)</li><li><strong>PDF export</strong> — headless Chromium export service for PDF rendering (OpenPencil exports SVG but not PDF yet)</li><li><strong>Plugin system</strong> — full plugin API with sandboxed execution</li><li><strong>Design tokens</strong> — native design token support</li><li><strong>CSS Grid layout</strong> — custom implementation (Open Pencil uses Yoga fork with grid support)</li><li><strong>Self-hosting</strong> — Docker-based deployment for teams</li><li><strong>Maturity</strong> — years of production usage, battle-tested at scale</li></ol><h2 id="_11-scripting-extensibility" tabindex="-1">11. Scripting &amp; Extensibility <a class="header-anchor" href="#_11-scripting-extensibility" aria-label="Permalink to “11. Scripting &amp; Extensibility”">​</a></h2><p>OpenPencil ships with an <a href="/programmable/cli/scripting"><code>eval</code> command</a> that provides a Figma-compatible Plugin API for headless scripting — batch operations, automated testing, and AI-driven modifications all run without the GUI. On top of that, <strong>90 AI tools</strong> are available via built-in chat, MCP server (stdio + HTTP), and the CLI — covering read, create, modify, structure, variables, vector path, analyze (color/typography/spacing/clusters), diff, boolean operations, and arrangement. Penpot has a plugin system with sandboxed execution but no headless scripting API or MCP integration.</p><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to “Summary”">​</a></h2><table tabindex="0"><thead><tr><th>Dimension</th><th>Winner</th><th>Why</th></tr></thead><tbody><tr><td><strong>Architecture simplicity</strong></td><td>Open Pencil</td><td>Single process vs 5+ services</td></tr><tr><td><strong>Rendering performance</strong></td><td>Open Pencil</td><td>Direct CanvasKit vs SVG DOM (default) or binary-packed WASM</td></tr><tr><td><strong>Code maintainability</strong></td><td>Open Pencil</td><td>~26K LOC in 1 language vs 299K in 4+ languages</td></tr><tr><td><strong>Figma compatibility</strong></td><td>Open Pencil</td><td>Native Kiwi codec vs no .fig support</td></tr><tr><td><strong>Developer onboarding</strong></td><td>Open Pencil</td><td>TS/Vue vs Clojure/Rust/Docker</td></tr><tr><td><strong>Desktop experience</strong></td><td>Open Pencil</td><td>Tauri native vs browser-only</td></tr><tr><td><strong>Layout engine</strong></td><td>Open Pencil</td><td>Yoga (proven) vs custom dual implementation</td></tr><tr><td><strong>Collaboration</strong></td><td>Tie</td><td>Penpot: server-based with access control; Open Pencil: P2P via Trystero + Yjs, zero hosting</td></tr><tr><td><strong>Self-hosting</strong></td><td>Penpot</td><td>Docker-ready vs desktop-only</td></tr><tr><td><strong>Ecosystem maturity</strong></td><td>Penpot</td><td>Years of production vs early stage</td></tr></tbody></table><p>Open Pencil is architecturally leaner — a single-process CanvasKit renderer in ~26K LOC of TypeScript, Figma-compatible by design. Penpot is a full-stack platform with ~299K LOC across Clojure, ClojureScript, Rust, and SCSS, plus a Docker service fleet. Both now offer real-time collaboration (different architectures: P2P vs server). Penpot has a plugin ecosystem and server-side PDF export; Open Pencil has Figma-compatible headless scripting, <strong>90 AI/MCP tools</strong>, SVG export, and a native desktop app.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
