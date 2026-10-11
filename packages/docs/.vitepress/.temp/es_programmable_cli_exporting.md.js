import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/programmable/cli/exporting.md
var __pageData = JSON.parse("{\"title\":\"Exportar desde la CLI\",\"description\":\"Generar imágenes, SVG, HTML, historias de Storybook y otros resultados sin abrir el editor.\",\"frontmatter\":{\"title\":\"Exportar desde la CLI\",\"description\":\"Generar imágenes, SVG, HTML, historias de Storybook y otros resultados sin abrir el editor.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Exportar desde la CLI — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Exportar desde la CLI — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Generar imágenes, SVG, HTML, historias de Storybook y otros resultados sin abrir el editor.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Generar imágenes, SVG, HTML, historias de Storybook y otros resultados sin abrir el editor.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Generar imágenes, SVG, HTML, historias de Storybook y otros resultados sin abrir el editor.\"}]]},\"headers\":[],\"relativePath\":\"es/programmable/cli/exporting.md\",\"filePath\":\"es/programmable/cli/exporting.md\",\"lastUpdated\":1791454432000}");
var _sfc_main = { name: "es/programmable/cli/exporting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="exportar-desde-la-cli" tabindex="-1">Exportar desde la CLI <a class="header-anchor" href="#exportar-desde-la-cli" aria-label="Permalink to “Exportar desde la CLI”">​</a></h1><p><code>export</code> renderiza una página u objeto desde un archivo compatible.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> preview.png</span></span></code></pre></div><h2 id="seleccionar-contenido" tabindex="-1">Seleccionar contenido <a class="header-anchor" href="#seleccionar-contenido" aria-label="Permalink to “Seleccionar contenido”">​</a></h2><p>Usa las opciones del comando para elegir página, identificador u objeto encontrado. El formato se deduce de la extensión o se indica explícitamente.</p><h2 id="escala-y-tamano" tabindex="-1">Escala y tamaño <a class="header-anchor" href="#escala-y-tamano" aria-label="Permalink to “Escala y tamaño”">​</a></h2><p>La escala controla la resolución de salida. También se pueden fijar anchura o altura, conservando las proporciones cuando solo se proporciona una dimensión.</p><h2 id="svg" tabindex="-1">SVG <a class="header-anchor" href="#svg" aria-label="Permalink to “SVG”">​</a></h2><p>SVG conserva geometría vectorial y resulta útil para iconos, revisión y edición posterior.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 12:34</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> icon.svg</span></span></code></pre></div><h2 id="html" tabindex="-1">HTML <a class="header-anchor" href="#html" aria-label="Permalink to “HTML”">​</a></h2><p>La exportación HTML genera un documento independiente con la estructura y los estilos disponibles. Está pensada para entrega, inspección y procesamiento posterior, no como sustituto exacto del renderizador CanvasKit. Solo está disponible al trabajar con archivos.</p><h2 id="jsx-con-tailwind" tabindex="-1">JSX con Tailwind <a class="header-anchor" href="#jsx-con-tailwind" aria-label="Permalink to “JSX con Tailwind”">​</a></h2><p>Exporta JSX con clases de utilidad Tailwind:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
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
	})}"> tailwind-jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # o: -f jsx --style tailwind</span></span></code></pre></div><h2 id="storybook" tabindex="-1">Storybook <a class="header-anchor" href="#storybook" aria-label="Permalink to “Storybook”">​</a></h2><p>Genera un archivo CSF3 <code>.stories.ts</code> por cada conjunto de componentes o componente:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                      # historias de React en ./design-stories/</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> vue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.pen</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # reexporta en cada guardado</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;src/**/*.pen&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --beside</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # historias junto a cada diseño</span></span></code></pre></div><h3 id="disenos-junto-a-sus-historias" tabindex="-1">Diseños junto a sus historias <a class="header-anchor" href="#disenos-junto-a-sus-historias" aria-label="Permalink to “Diseños junto a sus historias”">​</a></h3><p>Guarda el archivo de diseño de cada componente en la carpeta del componente y exporta con <code>--beside</code>: las historias, las imágenes de diseño y el manifiesto <code>.openpencil-stories.json</code> de cada documento van a la carpeta de ese documento, junto al código del componente. Un glob de <code>stories</code> de Storybook como <code>../src/**/*.stories.ts</code> en <code>.storybook/main.ts</code> las recoge sin más configuración.</p><p>Pasa varios documentos, o un glob entre comillas como <code>&#39;src/**/*.pen&#39;</code> que OpenPencil expande por sí mismo (Node.js 22 o posterior). Varios documentos requieren <code>--beside</code> o <code>--output</code>; <code>--page</code> solo funciona con un documento. Los documentos se exportan uno tras otro y, si uno falla, el resto se exporta igualmente antes de que el comando termine con un error. <code>--watch</code> vigila todos los documentos coincidentes; un documento creado después de iniciar la vigilancia requiere ejecutar el comando de nuevo.</p><p>Cada variante de un conjunto de componentes se convierte en una historia y sus propiedades de variante pasan a ser controles <code>select</code>, de modo que al cambiar un control se muestra la variante correspondiente. Un conjunto con comportamiento recibe en su lugar las props del control: un Switch o un Checkbox un booleano <code>checked</code>, un Toggle <code>pressed</code>, un Collapsible <code>open</code> y <code>disabled</code> cuando el conjunto dibuja un estado deshabilitado; hover, pressed y foco siguen siendo historias propias. Los componentes independientes con nombres separados por barras, como <code>Button/Primary</code> y <code>Button/Secondary</code>, se agrupan en un único archivo <code>Button</code> con un control <code>Variant</code>. Una combinación para la que el diseño no tiene variante lanza en Storybook un error con nombre en lugar de mostrar otra variante.</p><p>Las historias muestran el componente como HTML con estilos en línea, igual que <code>-f html</code>, así que no necesitan el runtime de OpenPencil; <code>--framework</code> (<code>react</code>, <code>vue</code> o <code>html</code>) solo cambia el contenedor y la importación de <code>Meta</code>/<code>StoryObj</code> desde <code>@storybook/react-vite</code>, <code>@storybook/vue3-vite</code> o <code>@storybook/html-vite</code>. El texto usa las familias tipográficas del documento, que Storybook debe cargar por su cuenta. Las propiedades de texto, booleanas y de intercambio de instancia aún no se exportan.</p><p>Con <code>--framework vue</code> o <code>--framework react</code>, un conjunto de componentes cuyo comportamiento es un Button, Switch, Checkbox, Toggle o Collapsible se convierte en un componente real: <code>&lt;Name&gt;.vue</code> construido sobre Reka UI, o <code>&lt;Name&gt;.tsx</code> con <code>&lt;Name&gt;.module.css</code> construido sobre el paquete <code>radix-ui</code> de Radix UI. Sus variantes se compilan en una hoja de estilos que responde a los estados que fijan Reka y Radix (<code>data-state</code>, <code>data-disabled</code>, hover y foco), y cada otra propiedad de variante es una prop que el componente fija como atributo <code>data-*</code>. En Vue su valor es un <code>v-model</code> como <code>checked</code> u <code>open</code>; en React el componente acepta las props de la raíz de Radix, como <code>checked</code>, <code>defaultChecked</code> y <code>onCheckedChange</code>. Sus historias renderizan el componente y una función play hace clic en el control y comprueba su estado, por lo que el proyecto de Storybook necesita <code>reka-ui</code> o <code>radix-ui</code>.</p><p>Las historias incluyen entradas <code>parameters.design</code> para <a href="https://github.com/storybookjs/addon-designs" target="_blank" rel="noreferrer"><code>@storybook/addon-designs</code></a>:</p><ul><li><strong>OpenPencil:</strong> cuando la ruta del documento está dentro del directorio actual, un <a href="./../index#url-scheme">enlace <code>openpencil://</code></a> que abre el documento en la aplicación de escritorio y selecciona la variante, o su conjunto de componentes cuando otra capa comparte el nombre de la variante. El esquema direcciona las capas por nombre, así que una historia cuyos nombres de variante y de componente comparten otras capas no recibe enlace.</li><li><strong>Design:</strong> un PNG a 2× de la variante, escrito en <code>&lt;Name&gt;.design/</code> junto a la historia y referenciado con <code>new URL(…, import.meta.url)</code>, de modo que Vite lo empaqueta. Copia el parámetro a la historia de tu propio componente para comparar la implementación con el diseño. <code>--no-design-images</code> omite el renderizado; la sustitución de fuentes sigue <code>--font-policy</code>, como en la exportación raster.</li></ul><p><code>-o</code> indica el directorio de salida. Allí, un manifiesto <code>.openpencil-stories.json</code> registra qué documento, como ruta relativa al directorio de salida, y qué página generó cada historia e imagen de diseño; súbelo al repositorio junto con las historias. Una exportación reemplaza los archivos que generó antes una exportación del mismo documento, incluidos los de componentes eliminados o renombrados desde entonces; con <code>--page</code>, solo los de esa página. Antes de cambiar nada, se niega a sobrescribir cualquier otro archivo: una historia escrita a mano, la de otro documento o una imagen suelta. Una exportación de una sola página cuyos nombres de archivo han pasado a historias de otra página pide una exportación completa. Sin el manifiesto, las historias existentes se consideran ajenas, así que elimínalas antes de volver a exportar. <code>--watch</code> mantiene el comando en ejecución y reexporta cada vez que se guarda el documento, de modo que la recarga en caliente de Storybook sigue al diseño; un guardado que no se puede leer se notifica y la vigilancia continúa. Un <code>--page</code> inexistente o una sustitución con <code>--font-policy strict</code> sí terminan el comando.</p><h2 id="modo-con-la-aplicacion-en-ejecucion" tabindex="-1">Modo con la aplicación en ejecución <a class="header-anchor" href="#modo-con-la-aplicacion-en-ejecucion" aria-label="Permalink to “Modo con la aplicación en ejecución”">​</a></h2><p>Omite el archivo para exportar desde la aplicación en ejecución:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                       # exporta la selección del documento activo</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # exporta todas las capas de una página</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1:23</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">           # exporta una capa, en cualquier página</span></span></code></pre></div><p><code>--page</code> toma el nombre de una página y <code>--page-id</code> el ID de una página de <code>openpencil documents list</code>; ambas exportan esa página sin cambiar la aplicación a ella. Añade <code>--document-id</code> para exportar desde un documento distinto del activo.</p><p>Este modo admite PNG, JPG, WEBP, SVG y PDF. PowerPoint, JSX, HTML, Storybook y <code>.fig</code> requieren un archivo como argumento. La exportación de miniaturas en modo archivo aún no es compatible.</p><h2 id="sobrescritura-y-rutas" tabindex="-1">Sobrescritura y rutas <a class="header-anchor" href="#sobrescritura-y-rutas" aria-label="Permalink to “Sobrescritura y rutas”">​</a></h2><p><code>-o</code> o <code>--output</code> define la ruta. La CLI informa de errores de formato, objetos inexistentes y rutas no válidas en lugar de producir resultados parciales silenciosamente.</p><p>Consulta <code>bun open-pencil export --help</code> para ver los formatos y opciones disponibles en la versión instalada.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/programmable/cli/exporting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var exporting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, exporting_default as default };
