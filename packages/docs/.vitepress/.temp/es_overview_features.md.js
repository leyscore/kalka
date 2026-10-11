import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/overview/features.md
var __pageData = JSON.parse("{\"title\":\"Características\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Características — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Características — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"es/overview/features.md\",\"filePath\":\"es/overview/features.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "es/overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="caracteristicas" tabindex="-1">Características <a class="header-anchor" href="#caracteristicas" aria-label="Permalink to “Características”">​</a></h1><h2 id="archivos-de-figma" tabindex="-1">Archivos de Figma <a class="header-anchor" href="#archivos-de-figma" aria-label="Permalink to “Archivos de Figma”">​</a></h2><p>OpenPencil abre y guarda archivos <code>.fig</code> directamente. La importación y exportación usan el mismo códec binario Kiwi que Figma: 194 definiciones de esquema y unos 390 campos por objeto. Guardar: <kbd>⌘</kbd><kbd>S</kbd>. Guardar como: <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Copiar y pegar con Figma:</strong> selecciona objetos en Figma, pulsa <kbd>⌘</kbd><kbd>C</kbd>, cambia a OpenPencil y usa <kbd>⌘</kbd><kbd>V</kbd>. Los rellenos, contornos, la disposición automática, el texto, los efectos, los radios de esquina y las redes vectoriales se conservan en ambas direcciones.</p><h2 id="dibujo-y-edicion" tabindex="-1">Dibujo y edición <a class="header-anchor" href="#dibujo-y-edicion" aria-label="Permalink to “Dibujo y edición”">​</a></h2><ul><li><strong>Formas:</strong> rectángulo (<kbd>R</kbd>), elipse (<kbd>O</kbd>), línea (<kbd>L</kbd>), polígono y estrella.</li><li><strong>Pluma:</strong> redes vectoriales, curvas de Bézier y tiradores tangentes.</li><li><strong>Texto:</strong> edición directa en el lienzo y soporte de IME.</li><li><strong>Texto enriquecido:</strong> negrita, cursiva, subrayado y tachado en rangos de caracteres.</li><li><strong>Disposición automática:</strong> Flexbox y CSS Grid mediante Yoga WASM, con dirección, separación, relleno, distribución, alineación, tamaño y pistas de cuadrícula.</li><li><strong>Componentes:</strong> creación de componentes y conjuntos, instancias, sustituciones y sincronización.</li><li><strong>Variables:</strong> valores de diseño con colecciones, modos claro/oscuro, tipos color/número/texto/booleano y enlaces.</li><li><strong>Secciones:</strong> contenedores de organización que incorporan automáticamente los objetos superpuestos.</li></ul><h2 id="panel-de-propiedades" tabindex="-1">Panel de propiedades <a class="header-anchor" href="#panel-de-propiedades" aria-label="Permalink to “Panel de propiedades”">​</a></h2><p>Las pestañas Diseño, Código, IA y Revisar se adaptan a la selección:</p><ul><li><strong>Apariencia:</strong> opacidad, radio uniforme o por esquina y visibilidad.</li><li><strong>Relleno:</strong> color sólido, degradados lineal, radial, angular y diamante, e imágenes.</li><li><strong>Contorno:</strong> color, grosor, alineación, grosor por lado, extremos, uniones y guiones.</li><li><strong>Efectos:</strong> sombra exterior e interior, desenfoque de capa, fondo y primer plano.</li><li><strong>Tipografía:</strong> selector de fuentes con búsqueda y desplazamiento virtual, estilo, tamaño, alineación y formato.</li><li><strong>Disposición:</strong> controles de la disposición automática.</li><li><strong>Exportación:</strong> escala, PNG/JPG/WEBP/SVG y vista previa.</li><li><strong>Código:</strong> Design JSX y Tailwind JSX de la selección, con edición bidireccional en vivo de Design JSX que actualiza tu código a medida que cambian las capas; el elemento bajo el cursor resalta su capa en el lienzo y los problemas de diseño se subrayan en la propiedad que los causa.</li><li><strong>Revisar:</strong> revisión de diseño en vivo de la página o la selección (bajo contraste, áreas táctiles pequeñas, colores sin variable, espaciados fuera de escala), con marcadores de problemas en el lienzo y enlace a variables con un clic (<a href="/user-guide/checking-designs">Revisar diseños</a>).</li></ul><h2 id="renderizado" tabindex="-1">Renderizado <a class="header-anchor" href="#renderizado" aria-label="Permalink to “Renderizado”">​</a></h2><p>OpenPencil usa Skia mediante CanvasKit WASM, el mismo motor gráfico de Figma:</p><ul><li>degradados lineales, radiales, angulares y diamante;</li><li>rellenos de imagen con varios modos de escala;</li><li>caché de efectos por objeto;</li><li>arcos, elipses parciales y anillos;</li><li>exclusión de objetos fuera de la vista y reutilización de herramientas de pintura;</li><li>guías de ajuste que tienen en cuenta la rotación;</li><li>reglas con el rango de la selección;</li><li>resaltado que sigue la geometría real.</li></ul><h2 id="deshacer-y-rehacer" tabindex="-1">Deshacer y rehacer <a class="header-anchor" href="#deshacer-y-rehacer" aria-label="Permalink to “Deshacer y rehacer”">​</a></h2><p>La creación, eliminación, movimiento, cambio de tamaño, propiedades y jerarquía, disposición y variables se pueden deshacer. Atajos: <kbd>⌘</kbd><kbd>Z</kbd> y <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="paginas-y-documentos" tabindex="-1">Páginas y documentos <a class="header-anchor" href="#paginas-y-documentos" aria-label="Permalink to “Páginas y documentos”">​</a></h2><p>Puedes crear, eliminar y renombrar páginas; cada una conserva su posición y escala de vista. Se pueden abrir varios documentos en pestañas.</p><h2 id="exportacion" tabindex="-1">Exportación <a class="header-anchor" href="#exportacion" aria-label="Permalink to “Exportación”">​</a></h2><ul><li><strong>Imágenes:</strong> PNG, JPG y WEBP con escala de 0,5× a 4×.</li><li><strong>SVG:</strong> formas, texto con rangos de estilo, degradados, efectos y modos de fusión.</li><li><strong>Tailwind JSX:</strong> HTML con clases Tailwind v4 para React o Vue.</li><li><strong>Copiar como:</strong> texto, SVG, PNG o JSX desde el menú contextual.</li></ul><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tailwind</span></span></code></pre></div><h2 id="chat-con-ai" tabindex="-1">Chat con AI <a class="header-anchor" href="#chat-con-ai" aria-label="Permalink to “Chat con AI”">​</a></h2><p><kbd>⌘</kbd><kbd>J</kbd> abre el asistente. Más de 90 herramientas crean formas, modifican estilos y disposiciones, trabajan con componentes y variables, ejecutan operaciones booleanas, analizan variables de diseño y exportan recursos. Admite Anthropic, OpenAI, Google AI, OpenRouter y extremos compatibles.</p><p>Las llamadas a herramientas aparecen en una cronología plegable. Para verificar visualmente los cambios, el asistente renderiza el resultado y lo compara con la solicitud. Todas las modificaciones realizadas por AI se pueden deshacer.</p><h2 id="servidor-mcp" tabindex="-1">Servidor MCP <a class="header-anchor" href="#servidor-mcp" aria-label="Permalink to “Servidor MCP”">​</a></h2><p>Claude Code, Cursor, Windsurf y otros clientes MCP pueden leer y modificar archivos <code>.fig</code> con más de 90 herramientas. Están disponibles stdio y HTTP.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><p>La CLI examina, exporta y analiza archivos <code>.fig</code>:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">              # Árbol del documento</span></span>
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
	})}">  # Búsqueda</span></span>
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
	})}">     # Exportación</span></span>
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
	})}">    # Análisis de colores</span></span>
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
	})}">  # Estructuras repetidas</span></span>
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
	})}">     # Figma Plugin API</span></span></code></pre></div><p>Todos los comandos admiten <code>--json</code>. Instalación: <code>npm install -g @open-pencil/cli</code> o <code>bun add -g @open-pencil/cli</code>.</p><h2 id="colaboracion-en-tiempo-real" tabindex="-1">Colaboración en tiempo real <a class="header-anchor" href="#colaboracion-en-tiempo-real" aria-label="Permalink to “Colaboración en tiempo real”">​</a></h2><p>La colaboración funciona directamente entre participantes mediante WebRTC y no necesita servidor central. Basta con compartir un enlace. Incluye cursores, presencia y seguimiento de la vista de otro participante.</p><h2 id="escritorio-y-web" tabindex="-1">Escritorio y web <a class="header-anchor" href="#escritorio-y-web" aria-label="Permalink to “Escritorio y web”">​</a></h2><p><strong>Escritorio:</strong> Tauri v2, unos 7 MB, para macOS, Windows y Linux, con menús nativos, uso sin conexión y guardado automático.</p><p><strong>Web:</strong> <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, instalable como PWA y adaptado a pantallas táctiles.</p><h2 id="carga-alternativa-desde-google-fonts" tabindex="-1">Carga alternativa desde Google Fonts <a class="header-anchor" href="#carga-alternativa-desde-google-fonts" aria-label="Permalink to “Carga alternativa desde Google Fonts”">​</a></h2><p>Si una fuente no está disponible localmente, OpenPencil la descarga automáticamente desde Google Fonts. No hace falta instalarla manualmente.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
