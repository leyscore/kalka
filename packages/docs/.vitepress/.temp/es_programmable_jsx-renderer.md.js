import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"Renderizador JSX\",\"description\":\"Crear diseños desde JSX y exportar selecciones como JSX con Tailwind.\",\"frontmatter\":{\"title\":\"Renderizador JSX\",\"description\":\"Crear diseños desde JSX y exportar selecciones como JSX con Tailwind.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Renderizador JSX — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Renderizador JSX — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Crear diseños desde JSX y exportar selecciones como JSX con Tailwind.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Crear diseños desde JSX y exportar selecciones como JSX con Tailwind.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Crear diseños desde JSX y exportar selecciones como JSX con Tailwind.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/jsx-renderer.md\",\"filePath\":\"es/programmable/jsx-renderer.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "es/programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="renderizador-jsx" tabindex="-1">Renderizador JSX <a class="header-anchor" href="#renderizador-jsx" aria-label="Permalink to “Renderizador JSX”">​</a></h1><p>OpenPencil puede convertir JSX declarativo en un árbol de diseño. El mismo sistema está disponible en el chat con AI, MCP y <code>eval</code>.</p><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><h2 id="elementos" tabindex="-1">Elementos <a class="header-anchor" href="#elementos" aria-label="Permalink to “Elementos”">​</a></h2><table tabindex="0"><thead><tr><th>JSX</th><th>Resultado</th></tr></thead><tbody><tr><td><code>&lt;Frame&gt;</code></td><td>Marco, opcionalmente con disposición automática</td></tr><tr><td><code>&lt;Text&gt;</code></td><td>Objeto de texto</td></tr><tr><td><code>&lt;Rectangle&gt;</code></td><td>Rectángulo</td></tr><tr><td><code>&lt;Ellipse&gt;</code></td><td>Elipse</td></tr><tr><td><code>&lt;Image&gt;</code></td><td>Forma con relleno de imagen</td></tr><tr><td>Componente registrado</td><td>Árbol reutilizable definido por la aplicación</td></tr></tbody></table><h2 id="disposicion" tabindex="-1">Disposición <a class="header-anchor" href="#disposicion" aria-label="Permalink to “Disposición”">​</a></h2><ul><li><code>flex=&quot;row&quot;</code> o <code>flex=&quot;col&quot;</code> activa la disposición automática.</li><li><code>gap</code> establece la separación.</li><li><code>p</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code> y <code>pl</code> establecen el relleno.</li><li><code>align</code> y <code>justify</code> controlan la alineación.</li><li><code>wrap</code> permite saltos de línea.</li></ul><h2 id="tamano-y-posicion" tabindex="-1">Tamaño y posición <a class="header-anchor" href="#tamano-y-posicion" aria-label="Permalink to “Tamaño y posición”">​</a></h2><ul><li><code>w</code> y <code>h</code> aceptan números, <code>&quot;fill&quot;</code> o <code>&quot;hug&quot;</code>.</li><li><code>minW</code>, <code>maxW</code>, <code>minH</code> y <code>maxH</code> establecen límites.</li><li><code>x</code> e <code>y</code> fijan la posición cuando el objeto no participa en el flujo.</li></ul><h2 id="apariencia" tabindex="-1">Apariencia <a class="header-anchor" href="#apariencia" aria-label="Permalink to “Apariencia”">​</a></h2><ul><li><code>bg</code> o <code>fill</code> define el relleno.</li><li><code>color</code> define el color del texto.</li><li><code>stroke</code>, <code>strokeWidth</code>, <code>opacity</code> y <code>radius</code> controlan contorno, opacidad y esquinas.</li><li><code>shadow</code> añade una sombra.</li></ul><h2 id="tipografia" tabindex="-1">Tipografía <a class="header-anchor" href="#tipografia" aria-label="Permalink to “Tipografía”">​</a></h2><p><code>size</code>, <code>font</code>, <code>weight</code>, <code>lineHeight</code>, <code>letterSpacing</code> y <code>align</code> configuran el texto. Los nombres de propiedades se mantienen en inglés porque forman parte de la API JSX.</p><h2 id="eventos-y-metadatos" tabindex="-1">Eventos y metadatos <a class="header-anchor" href="#eventos-y-metadatos" aria-label="Permalink to “Eventos y metadatos”">​</a></h2><p>Las propiedades desconocidas se conservan cuando el tipo de objeto las admite. Los eventos DOM no se ejecutan: el resultado es un documento de diseño, no una aplicación web.</p><h2 id="importar-en-codigo" tabindex="-1">Importar en código <a class="header-anchor" href="#importar-en-codigo" aria-label="Permalink to “Importar en código”">​</a></h2><p>En código de aplicación o de biblioteca sin interfaz, importa <code>Frame</code>, <code>Text</code> y el resto de exportaciones de autoría desde <code>@open-pencil/design-jsx</code> y crea los nodos con <code>renderTree</code> o <code>renderJSX</code> de <code>@open-pencil/core/design-jsx</code>, que añaden iconos, conversión de SVG y disposición. Para escribir los árboles como TSX, define <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> con <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> en <code>tsconfig.json</code>, o añade al archivo el comentario <code>/** @jsxImportSource @open-pencil/design-jsx */</code>. El entorno de scripting determina qué API se exponen a <code>eval</code>; las exportaciones de los paquetes no son globales automáticamente.</p><h2 id="exportar-a-jsx" tabindex="-1">Exportar a JSX <a class="header-anchor" href="#exportar-a-jsx" aria-label="Permalink to “Exportar a JSX”">​</a></h2><p>El menú <strong>Copiar como → JSX</strong> convierte la selección en JSX y clases Tailwind. La salida intenta conservar jerarquía, disposición, tamaños, colores, tipografía y bordes, y sirve como punto de partida para implementar una interfaz. El JSX exportado se puede editar y volver a renderizar en el documento. La exportación incluye capas ocultas y bloqueadas, restricciones, límites de tamaño, rellenos apilados, de degradado y de imagen, contornos, efectos, máscaras y enlaces a variables, así que al renderizarla se reproducen y <code>diff_jsx</code> muestra los cambios en cualquiera de ellos. Aún no se escriben el texto enriquecido con estilos mixtos, los trazados vectoriales, las cuadrículas de disposición, los estilos compartidos ni las definiciones de propiedades de componentes. Las instancias se escriben como marcos con su contenido, de modo que el JSX exportado se sostiene por sí solo.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
