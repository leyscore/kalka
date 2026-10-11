import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Scripting\",\"description\":\"Ejecutar JavaScript con una API compatible con plugins de Figma para consultar, modificar y generar diseños.\",\"frontmatter\":{\"title\":\"Scripting\",\"description\":\"Ejecutar JavaScript con una API compatible con plugins de Figma para consultar, modificar y generar diseños.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Ejecutar JavaScript con una API compatible con plugins de Figma para consultar, modificar y generar diseños.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Ejecutar JavaScript con una API compatible con plugins de Figma para consultar, modificar y generar diseños.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Ejecutar JavaScript con una API compatible con plugins de Figma para consultar, modificar y generar diseños.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/cli/scripting.md\",\"filePath\":\"es/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "es/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="scripting" tabindex="-1">Scripting <a class="header-anchor" href="#scripting" aria-label="Permalink to “Scripting”">​</a></h1><p><code>openpencil eval</code> ejecuta JavaScript sobre un documento y proporciona un objeto global <code>figma</code>. Resulta útil para cambios por lotes, inspección, datos de prueba y automatización sin abrir la interfaz del editor.</p><h2 id="uso-basico" tabindex="-1">Uso básico <a class="header-anchor" href="#uso-basico" aria-label="Permalink to “Uso básico”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p><code>-c</code> acepta JavaScript. Si el código no empieza por <code>return</code>, OpenPencil lo ejecuta dentro de una función asíncrona y devuelve el resultado cuando existe.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">  const frame = figma.createFrame()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.name = &#39;Card&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.resize(300, 200)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.layoutMode = &#39;VERTICAL&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.itemSpacing = 12</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  return { id: frame.id, name: frame.name }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="consultar-objetos" tabindex="-1">Consultar objetos <a class="header-anchor" href="#consultar-objetos" aria-label="Permalink to “Consultar objetos”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">    .findAll((node) =&gt; node.type === &#39;FRAME&#39; &amp;&amp; node.name.includes(&#39;Button&#39;))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .map((button) =&gt; ({ id: button.id, name: button.name }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="modificar-y-guardar" tabindex="-1">Modificar y guardar <a class="header-anchor" href="#modificar-y-guardar" aria-label="Permalink to “Modificar y guardar”">​</a></h2><p><code>--write</code> o <code>-w</code> sobrescribe el archivo de entrada. <code>--output</code> o <code>-o</code> crea otro.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> updated.fig</span></span></code></pre></div><h2 id="leer-el-script-de-stdin" tabindex="-1">Leer el script de stdin <a class="header-anchor" href="#leer-el-script-de-stdin" aria-label="Permalink to “Leer el script de stdin”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> --write</span></span></code></pre></div><h2 id="documento-abierto" tabindex="-1">Documento abierto <a class="header-anchor" href="#documento-abierto" aria-label="Permalink to “Documento abierto”">​</a></h2><p>Omite la ruta para ejecutar el script sobre el documento activo en la aplicación de escritorio:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;return figma.currentPage.name&quot;</span></span></code></pre></div><h2 id="salida" tabindex="-1">Salida <a class="header-anchor" href="#salida" aria-label="Permalink to “Salida”">​</a></h2><p>En entornos no interactivos, <code>eval</code> usa JSON de forma predeterminada. <code>--json</code> lo solicita explícitamente y <code>--quiet</code> o <code>-q</code> oculta la salida cuando solo se escribe un archivo.</p><h2 id="api-compatible" tabindex="-1">API compatible <a class="header-anchor" href="#api-compatible" aria-label="Permalink to “API compatible”">​</a></h2><p>La API sigue el modelo de Figma Plugin API, pero actúa sobre SceneGraph y los formatos de OpenPencil.</p><h3 id="documento-y-paginas" tabindex="-1">Documento y páginas <a class="header-anchor" href="#documento-y-paginas" aria-label="Permalink to “Documento y páginas”">​</a></h3><ul><li><code>figma.root</code></li><li><code>figma.currentPage</code></li><li><code>figma.currentPage.selection</code></li><li><code>figma.getNodeById(id)</code></li><li><code>figma.createPage()</code></li></ul><h3 id="crear-objetos" tabindex="-1">Crear objetos <a class="header-anchor" href="#crear-objetos" aria-label="Permalink to “Crear objetos”">​</a></h3><ul><li><code>figma.createFrame()</code></li><li><code>figma.createRectangle()</code></li><li><code>figma.createEllipse()</code></li><li><code>figma.createText()</code></li><li><code>figma.createLine()</code></li><li><code>figma.createPolygon()</code></li><li><code>figma.createStar()</code></li><li><code>figma.createVector()</code></li><li><code>figma.createComponent()</code></li><li><code>figma.createSection()</code></li></ul><h3 id="operaciones-de-arbol" tabindex="-1">Operaciones de árbol <a class="header-anchor" href="#operaciones-de-arbol" aria-label="Permalink to “Operaciones de árbol”">​</a></h3><p><code>children</code>, <code>parent</code>, <code>appendChild</code>, <code>insertChild</code>, <code>clone</code>, <code>remove</code>, <code>findAll</code>, <code>findOne</code>, <code>findChild</code>, <code>findChildren</code>, <code>figma.group</code> y <code>figma.ungroup</code> funcionan como sus equivalentes de Figma.</p><h3 id="componentes-y-variables" tabindex="-1">Componentes y variables <a class="header-anchor" href="#componentes-y-variables" aria-label="Permalink to “Componentes y variables”">​</a></h3><p>Se admiten creación de componentes e instancias, consulta del componente principal, colecciones, modos, creación y eliminación de variables y enlaces mediante <code>bindVariable</code> y <code>unbindVariable</code>.</p><h3 id="propiedades" tabindex="-1">Propiedades <a class="header-anchor" href="#propiedades" aria-label="Permalink to “Propiedades”">​</a></h3><p>Las propiedades habituales se leen y modifican mediante el objeto correspondiente: geometría, apariencia, radios, texto, disposición automática y contornos. Se conservan nombres exactos como <code>fills</code>, <code>fontSize</code>, <code>layoutMode</code> y <code>strokeWeight</code>.</p><h3 id="utilidades" tabindex="-1">Utilidades <a class="header-anchor" href="#utilidades" aria-label="Permalink to “Utilidades”">​</a></h3><ul><li><code>figma.mixed</code></li><li><code>figma.createImage(data)</code></li><li><code>figma.loadFontAsync(fontName)</code> — no bloquea la edición de texto;</li><li><code>figma.listAvailableFontsAsync()</code> — devuelve las fuentes del sistema;</li><li><code>figma.notify(message)</code> — escribe un aviso cuando no hay interfaz;</li><li><code>figma.viewport</code>.</li></ul><h2 id="limitaciones" tabindex="-1">Limitaciones <a class="header-anchor" href="#limitaciones" aria-label="Permalink to “Limitaciones”">​</a></h2><p>Aún no hay equivalentes completos para <code>node.exportAsync()</code>, <code>node.setBoundVariable()</code>, <code>figma.combineAsVariants()</code>, estilos de pintura/texto y todas las operaciones booleanas vectoriales.</p><p>Según la tarea, pueden usarse el comando de exportación, las herramientas del núcleo o las operaciones directas de SceneGraph.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
