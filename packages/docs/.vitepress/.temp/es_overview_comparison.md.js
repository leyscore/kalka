import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil y Penpot: arquitectura y rendimiento\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil y Penpot: arquitectura y rendimiento — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil y Penpot: arquitectura y rendimiento — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"es/overview/comparison.md\",\"filePath\":\"es/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "es/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-y-penpot-arquitectura-y-rendimiento" tabindex="-1">OpenPencil y Penpot: arquitectura y rendimiento <a class="header-anchor" href="#openpencil-y-penpot-arquitectura-y-rendimiento" aria-label="Permalink to “OpenPencil y Penpot: arquitectura y rendimiento”">​</a></h1><p>OpenPencil y Penpot son herramientas de diseño de código abierto con objetivos y arquitecturas distintos.</p><div class="info custom-block"><p class="custom-block-title">Renderizador WASM de Penpot</p><p>Penpot 2.x incluye el renderizador Rust/Skia WASM <code>render-wasm/v1</code>, que se activa mediante opciones del servidor o <code>?wasm=true</code>. El renderizador SVG sigue siendo el predeterminado. La comparación tiene en cuenta ambas opciones.</p></div><h2 id="_1-tamano-del-codigo" tabindex="-1">1. Tamaño del código <a class="header-anchor" href="#_1-tamano-del-codigo" aria-label="Permalink to “1. Tamaño del código”">​</a></h2><table tabindex="0"><thead><tr><th>Métrica</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Lines of code</td><td><strong>unas 26.000</strong></td><td><strong>unas 299.000</strong></td></tr><tr><td>Archivos fuente</td><td>unos 143</td><td>unos 2.900</td></tr><tr><td>Lenguajes</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Renderizador</td><td>unas 3.200 líneas, TypeScript</td><td>22.000 líneas, Rust/Skia WASM</td></tr><tr><td>Interfaz</td><td>unas 4.500 líneas</td><td>unas 175.000 líneas, CLJS y SCSS</td></tr><tr><td>Servidor</td><td>Ninguno, arquitectura local</td><td>32.600 líneas y 151 archivos SQL</td></tr><tr><td>Proporción</td><td><strong>1×</strong></td><td><strong>unas 11×</strong></td></tr></tbody></table><p>OpenPencil es unas once veces más pequeño. La diferencia se debe sobre todo a la arquitectura, no únicamente al número de funciones.</p><h2 id="_2-arquitectura" tabindex="-1">2. Arquitectura <a class="header-anchor" href="#_2-arquitectura" aria-label="Permalink to “2. Arquitectura”">​</a></h2><h3 id="openpencil-un-solo-proceso-cliente" tabindex="-1">OpenPencil: un solo proceso cliente <a class="header-anchor" href="#openpencil-un-solo-proceso-cliente" aria-label="Permalink to “OpenPencil: un solo proceso cliente”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>Editor, SceneGraph, códec de archivos y renderizador se ejecutan en el mismo proceso. No se necesita servidor, base de datos ni Docker. SceneGraph se almacena como <code>Map&lt;string, SceneNode&gt;</code>. TypeScript llama directamente a CanvasKit y Yoga WASM calcula la disposición de forma síncrona.</p><h3 id="penpot-plataforma-client-server" tabindex="-1">Penpot: plataforma Client-Server <a class="header-anchor" href="#penpot-plataforma-client-server" aria-label="Permalink to “Penpot: plataforma Client-Server”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Un despliegue completo de Penpot incluye interfaz, servidor JVM, PostgreSQL, Valkey, MinIO y un exportador basado en Chromium sin interfaz. El entorno de desarrollo requiere Docker Compose, JVM, Node y las herramientas de Rust.</p><p>OpenPencil evita latencia de red, serialización entre servicios, coordinación de contenedores y consultas de base de datos en las operaciones habituales. Penpot está pensado como plataforma multiusuario alojada en un servidor; OpenPencil prioriza la edición local con baja latencia.</p><h2 id="_3-proceso-de-renderizado" tabindex="-1">3. Proceso de renderizado <a class="header-anchor" href="#_3-proceso-de-renderizado" aria-label="Permalink to “3. Proceso de renderizado”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil: TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil: TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">}</span></span></code></pre></div><ul><li>Paso directo de TypeScript a WASM.</li><li>SceneGraph permanece en el JavaScript heap y no se serializa antes del Rendering.</li><li>El renderizador contiene unas 3.200 líneas distribuidas en módulos especializados.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot: ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: ClojureScript → Rust WASM → Skia”">​</a></h3><p>Con el renderizador WASM activado:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → descomposición y Binary packing en WASM linear memory</span></span>
<span class="line"><span>  → Rust WASM mediante Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Sin WASM, cada Shape se renderiza como SVG DOM element mediante React/Reagent.</p><p>En modo WASM, cada UUID se divide en cuatro <code>u32</code>, cada transformación en seis <code>f32</code>, los rellenos y contornos se codifican en binario y las propiedades básicas de una forma ocupan una estructura de 104 bytes. El renderizador usa caché de teselas, áreas de interés, once superficies y estado global mutable mediante <code>unsafe { STATE.as_mut() }</code>.</p><p>El Tile system prepara zonas próximas al Viewport y almacena hasta 1.024 Textures. OpenPencil vuelve a renderizar toda la zona visible.</p><table tabindex="0"><thead><tr><th>Aspecto</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Calls directos con objetos TypeScript</td><td>Structures codificadas en Binary</td></tr><tr><td>Modelo</td><td>Render completo del Viewport visible</td><td>Tile cache</td></tr><tr><td>Surfaces</td><td>1</td><td>11</td></tr><tr><td>Caché adicional</td><td>Sin Tile cache</td><td>Hasta 1.024 Tiles</td></tr><tr><td>Tamaño del renderizador</td><td>unas 3.200 líneas</td><td>22.000 líneas</td></tr><tr><td>Código no seguro</td><td>Ninguno</td><td>Estado global mediante <code>unsafe</code></td></tr></tbody></table><p>El Path directo de CanvasKit necesita menos procesamiento intermedio en documentos pequeños y medianos. El Tile system de Penpot puede resultar ventajoso en documentos con más de 100.000 Shapes cuando solo se muestra una zona reducida.</p><h2 id="_4-scenegraph-y-modelo-de-datos" tabindex="-1">4. SceneGraph y modelo de datos <a class="header-anchor" href="#_4-scenegraph-y-modelo-de-datos" aria-label="Permalink to “4. SceneGraph y modelo de datos”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><p>OpenPencil ofrece:</p><ul><li>búsqueda por identificador en O(1);</li><li>29 tipos de objeto del esquema Kiwi de Figma;</li><li>unos 390 campos en <code>NodeChange</code>;</li><li>tipos estrictos de TypeScript;</li><li>GUID con formato <code>sessionID:localID</code> de Figma.</li></ul><p>Penpot mantiene definiciones de tipos propias en Clojure/ClojureScript y Rust. Módulos distintos gestionan colores, componentes, contenedores, rellenos, Grid, modificadores, páginas y rutas. Malli valida esquemas en tiempo de ejecución y los datos de renderizado cruzan el límite CLJS → Rust.</p><p>OpenPencil utiliza directamente el esquema Kiwi. Penpot debe mantener sincronizado su modelo entre varios lenguajes.</p><h2 id="_5-motor-de-disposicion" tabindex="-1">5. Motor de disposición <a class="header-anchor" href="#_5-motor-de-disposicion" aria-label="Permalink to “5. Motor de disposición”">​</a></h2><p>OpenPencil usa Yoga WASM de forma síncrona:</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">(graph, frame, yogaRoot)</span></span></code></pre></div><p>Penpot mantiene implementaciones propias de Flex y Grid en ClojureScript y Rust WASM. Ambos motores deben producir el mismo resultado.</p><p>OpenPencil utiliza Yoga, incluida una variante con Grid. Penpot mantiene varios miles de líneas de código propio de disposición en dos lenguajes.</p><h2 id="_6-formatos-y-figma" tabindex="-1">6. Formatos y Figma <a class="header-anchor" href="#_6-formatos-y-figma" aria-label="Permalink to “6. Formatos y Figma”">​</a></h2><h3 id="openpencil" tabindex="-1">OpenPencil <a class="header-anchor" href="#openpencil" aria-label="Permalink to “OpenPencil”">​</a></h3><ul><li>Formato Binary Kiwi nativo de Figma.</li><li>Import directo de <code>.fig</code>.</li><li>Paste de Kiwi binary data desde Figma Clipboard.</li><li>Wire compatibility con Figma Multiplayer protocol.</li></ul><h3 id="penpot" tabindex="-1">Penpot <a class="header-anchor" href="#penpot" aria-label="Permalink to “Penpot”">​</a></h3><ul><li><code>.penpot</code> es un ZIP con JSON manifests, Document data, Binary assets y Thumbnails.</li><li>SVG renderer y Export predeterminados; WASM renderer opcional.</li><li>Sin Import nativo de <code>.fig</code>.</li><li>Varias Generations del formato con Migration system.</li></ul><p>OpenPencil lee <code>.fig</code> y Figma Clipboard directamente. Penpot necesita una vía de Import o Export separada.</p><h2 id="_7-estado-y-deshacer" tabindex="-1">7. Estado y deshacer <a class="header-anchor" href="#_7-estado-y-deshacer" aria-label="Permalink to “7. Estado y deshacer”">​</a></h2><p>OpenPencil usa comandos inversos. Las funciones de avance y retroceso guardan solo el estado necesario; los lotes agrupan varias operaciones.</p><p>Penpot usa Potok. <code>UpdateEvent</code> modifica el estado y <code>WatchEvent</code> ejecuta efectos secundarios mediante RxJS. Deshacer almacena vectores de cambios inversos, limita el historial a 50 entradas y agrupa cambios rápidos en transacciones.</p><p>Los cambios serializables encajan con la colaboración basada en servidor, pero aumentan la complejidad. El enfoque de OpenPencil es más directo para un editor de un solo proceso.</p><h2 id="_8-desarrollo" tabindex="-1">8. Desarrollo <a class="header-anchor" href="#_8-desarrollo" aria-label="Permalink to “8. Desarrollo”">​</a></h2><table tabindex="0"><thead><tr><th>Métrica</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Setup</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node y Rust</td></tr><tr><td>HMR</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Types</td><td>Strict TypeScript</td><td>Malli runtime schemas</td></tr><tr><td>Desktop</td><td>Tauri v2</td><td>Browser</td></tr><tr><td>Tecnologías principales</td><td>TypeScript y Vue</td><td>Clojure, ClojureScript, Rust y Docker</td></tr></tbody></table><h2 id="_9-rendimiento" tabindex="-1">9. Rendimiento <a class="header-anchor" href="#_9-rendimiento" aria-label="Permalink to “9. Rendimiento”">​</a></h2><table tabindex="0"><thead><tr><th>Escenario</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Arranque en frío</td><td>menos de 2 s con WASM</td><td>más de 10 s para servidor, cliente y WASM</td></tr><tr><td>Operación habitual</td><td>Dentro de un proceso</td><td>Posible recorrido de red</td></tr><tr><td>Fotograma</td><td>Llamada directa a Skia</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Memoria base</td><td>unos 50 MB en la pestaña del navegador</td><td>JVM, base de datos, caché y navegador</td></tr><tr><td>Sin conexión</td><td>Funcionamiento local completo</td><td>Requiere servidor</td></tr><tr><td>10.000 formas</td><td>Una pasada</td><td>Renderizador por teselas con once superficies</td></tr></tbody></table><h2 id="_10-ventajas-de-penpot" tabindex="-1">10. Ventajas de Penpot <a class="header-anchor" href="#_10-ventajas-de-penpot" aria-label="Permalink to “10. Ventajas de Penpot”">​</a></h2><ol><li><strong>Colaboración mediante servidor:</strong> cuentas, control de acceso y almacenamiento central a través de WebSockets.</li><li><strong>Exportación PDF:</strong> exportador independiente basado en Chromium.</li><li><strong>Sistema de plugins:</strong> ejecución aislada y API de plugins.</li><li><strong>Variables de diseño:</strong> compatibilidad integrada.</li><li><strong>CSS Grid:</strong> implementación propia; OpenPencil usa una variante de Yoga con Grid.</li><li><strong>Alojamiento propio:</strong> despliegue de una plataforma de equipo mediante Docker.</li><li><strong>Madurez:</strong> varios años de uso en producción.</li></ol><h2 id="_11-scripts-y-extensibilidad" tabindex="-1">11. Scripts y extensibilidad <a class="header-anchor" href="#_11-scripts-y-extensibilidad" aria-label="Permalink to “11. Scripts y extensibilidad”">​</a></h2><p>El comando <a href="/programmable/cli/scripting"><code>eval</code></a> proporciona una API compatible con plugins de Figma para scripts sin interfaz, operaciones por lotes y pruebas automatizadas. Además, el chat con AI, el servidor MCP y la CLI ofrecen 90 herramientas para leer, crear, modificar, estructurar, gestionar variables, editar rutas vectoriales, analizar, comparar, ejecutar operaciones booleanas y ordenar.</p><p>Penpot ofrece plugins aislados, pero no una API equivalente para scripting sin interfaz ni integración MCP.</p><h2 id="resumen" tabindex="-1">Resumen <a class="header-anchor" href="#resumen" aria-label="Permalink to “Resumen”">​</a></h2><table tabindex="0"><thead><tr><th>Área</th><th>Ventaja</th><th>Motivo</th></tr></thead><tbody><tr><td>Simplicidad</td><td>OpenPencil</td><td>Un proceso en lugar de varios servicios</td></tr><tr><td>Renderizado</td><td>OpenPencil</td><td>Ruta directa a CanvasKit</td></tr><tr><td>Código</td><td>OpenPencil</td><td>Unas 26.000 frente a 299.000 líneas</td></tr><tr><td>Compatibilidad con Figma</td><td>OpenPencil</td><td>Kiwi y <code>.fig</code> nativos</td></tr><tr><td>Desarrollo</td><td>OpenPencil</td><td>TypeScript y Vue frente a Clojure, Rust y Docker</td></tr><tr><td>Aplicación de escritorio</td><td>OpenPencil</td><td>Tauri nativo</td></tr><tr><td>Disposición</td><td>OpenPencil</td><td>Yoga frente a dos implementaciones propias</td></tr><tr><td>Colaboración</td><td>Ventajas distintas</td><td>Penpot: servidor y control de acceso; OpenPencil: P2P sin alojamiento</td></tr><tr><td>Alojamiento propio</td><td>Penpot</td><td>Despliegue con Docker</td></tr><tr><td>Madurez del ecosistema</td><td>Penpot</td><td>Años de uso en producción</td></tr></tbody></table><p>OpenPencil es un editor compacto de un solo proceso con renderizador CanvasKit y compatibilidad nativa con <code>.fig</code>. Penpot es una plataforma cliente-servidor completa con Clojure, ClojureScript, Rust, bases de datos y servicios Docker. Ambos ofrecen colaboración con modelos diferentes. Penpot tiene un ecosistema de plugins y exportación PDF; OpenPencil ofrece scripting sin interfaz compatible con Figma, 90 herramientas AI/MCP, exportación SVG y una aplicación de escritorio.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
