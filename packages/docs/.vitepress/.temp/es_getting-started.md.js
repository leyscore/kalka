import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region es/getting-started.md
var __pageData = JSON.parse("{\"title\":\"Primeros pasos\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"es_ES\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Primeros pasos — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Primeros pasos — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"es/getting-started.md\",\"filePath\":\"es/getting-started.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "es/getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="primeros-pasos" tabindex="-1">Primeros pasos <a class="header-anchor" href="#primeros-pasos" aria-label="Permalink to “Primeros pasos”">​</a></h1><h2 id="version-web" tabindex="-1">Versión web <a class="header-anchor" href="#version-web" aria-label="Permalink to “Versión web”">​</a></h2><p>OpenPencil funciona directamente en el navegador y no requiere instalación. Abre <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a> para empezar a diseñar.</p><p>Si quieres crear un producto basado en OpenPencil en lugar de limitarte a la aplicación predeterminada, consulta la sección <a href="/programmable/">Automatización</a> y la documentación del <a href="/programmable/sdk/">Vue SDK</a>.</p><h2 id="aplicacion-de-escritorio" tabindex="-1">Aplicación de escritorio <a class="header-anchor" href="#aplicacion-de-escritorio" aria-label="Permalink to “Aplicación de escritorio”">​</a></h2><p>Las versiones preparadas para macOS, Windows y Linux están disponibles en la <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">página de versiones</a>.</p><table tabindex="0"><thead><tr><th>Plataforma</th><th>Archivo</th></tr></thead><tbody><tr><td>macOS (Apple Silicon)</td><td><code>.dmg</code> (aarch64)</td></tr><tr><td>macOS (Intel)</td><td><code>.dmg</code> (x64)</td></tr><tr><td>Windows (x64)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Windows (ARM)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Linux (x64)</td><td><code>.AppImage</code> / <code>.deb</code></td></tr></tbody></table><h2 id="requisitos-del-sistema" tabindex="-1">Requisitos del sistema <a class="header-anchor" href="#requisitos-del-sistema" aria-label="Permalink to “Requisitos del sistema”">​</a></h2><p>OpenPencil dibuja con CanvasKit sobre WebGL y usa funciones recientes de la plataforma web, por lo que necesita un motor de navegador actual. La versión web admite Chrome 111, Edge 111, Firefox 128 y Safari 16.4 o posteriores; los navegadores basados en Chromium, como Brave u Opera, siguen la versión de Chrome en la que se basan. La aplicación de escritorio dibuja en el WebView del sistema, así que el mínimo depende del motor del sistema operativo:</p><table tabindex="0"><thead><tr><th>Plataforma</th><th>Requisito</th></tr></thead><tbody><tr><td>macOS</td><td>macOS 13 Ventura o posterior con las actualizaciones actuales de Safari instaladas (Safari 16.4 se incluyó con macOS 13.3).</td></tr><tr><td>Windows</td><td>Windows 10 o posterior con el runtime Evergreen de Microsoft Edge WebView2, que se actualiza solo.</td></tr><tr><td>Linux</td><td>WebKitGTK 2.40 o posterior (<code>webkit2gtk-4.1</code>).</td></tr></tbody></table><p>Si el motor es demasiado antiguo, OpenPencil muestra qué debes actualizar en lugar de una ventana en blanco. Si ves ese aviso en un sistema que cumple los requisitos, usa su enlace «Report a problem», que rellena de antemano los datos del navegador y del motor.</p><h2 id="instalacion-en-macos-con-homebrew" tabindex="-1">Instalación en macOS con Homebrew <a class="header-anchor" href="#instalacion-en-macos-con-homebrew" aria-label="Permalink to “Instalación en macOS con Homebrew”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">brew</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --cask</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> openpencil</span></span></code></pre></div><p>El comando instala la aplicación firmada para Mac con Apple Silicon o procesador Intel desde el <a href="https://formulae.brew.sh/cask/openpencil" target="_blank" rel="noreferrer">catálogo oficial de Homebrew</a>. Homebrew revisa las actualizaciones, que pueden aparecer después de las versiones en GitHub. Mientras tanto, utiliza la <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">descarga directa</a>. La CLI se instala por separado: <code>npm install -g @open-pencil/cli</code>.</p><p>Si usabas el tap propio archivado, migra con:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">brew</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> uninstall</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil/tap/open-pencil</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">brew</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --cask</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> openpencil</span></span></code></pre></div><h2 id="compilacion-desde-el-codigo-fuente" tabindex="-1">Compilación desde el código fuente <a class="header-anchor" href="#compilacion-desde-el-codigo-fuente" aria-label="Permalink to “Compilación desde el código fuente”">​</a></h2><h3 id="requisitos" tabindex="-1">Requisitos <a class="header-anchor" href="#requisitos" aria-label="Permalink to “Requisitos”">​</a></h3><ul><li><a href="https://bun.sh/" target="_blank" rel="noreferrer">Bun</a> como runtime y package manager;</li><li><a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> solo para la aplicación Tauri.</li></ul><h3 id="instalacion" tabindex="-1">Instalación <a class="header-anchor" href="#instalacion" aria-label="Permalink to “Instalación”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">git</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> https://github.com/open-pencil/open-pencil.git</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">cd</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span></span></code></pre></div><h3 id="servidor-de-desarrollo" tabindex="-1">Servidor de desarrollo <a class="header-anchor" href="#servidor-de-desarrollo" aria-label="Permalink to “Servidor de desarrollo”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><p>El editor estará disponible en <code>http://localhost:1420</code>.</p><h3 id="comandos" tabindex="-1">Comandos <a class="header-anchor" href="#comandos" aria-label="Permalink to “Comandos”">​</a></h3><table tabindex="0"><thead><tr><th>Comando</th><th>Finalidad</th></tr></thead><tbody><tr><td><code>bun run dev</code></td><td>Inicia el servidor de desarrollo con HMR</td></tr><tr><td><code>bun run build</code></td><td>Genera la versión de producción</td></tr><tr><td><code>bun run check</code></td><td>Ejecuta oxlint y comprueba los tipos con tsgo</td></tr><tr><td><code>bun run test</code></td><td>Ejecuta las pruebas E2E y de regresión visual con Playwright</td></tr><tr><td><code>bun run test:update</code></td><td>Actualiza las capturas de referencia</td></tr><tr><td><code>bun run test:unit</code></td><td>Ejecuta las pruebas unitarias con bun:test</td></tr><tr><td><code>bun run docs:dev</code></td><td>Inicia el servidor de desarrollo de la documentación</td></tr><tr><td><code>bun run docs:build</code></td><td>Genera rápidamente la documentación para verificarla en local</td></tr><tr><td><code>bun run docs:build:production</code></td><td>Genera la documentación completa para su publicación, incluidos los archivos para LLM</td></tr></tbody></table><h2 id="aplicacion-tauri" tabindex="-1">Aplicación Tauri <a class="header-anchor" href="#aplicacion-tauri" aria-label="Permalink to “Aplicación Tauri”">​</a></h2><p>Para compilar la aplicación Tauri se necesitan Rust y los componentes del sistema correspondientes a cada plataforma.</p><h3 id="macos" tabindex="-1">macOS <a class="header-anchor" href="#macos" aria-label="Permalink to “macOS”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">xcode-select</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --install</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">cargo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --version</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;^2&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><h3 id="windows" tabindex="-1">Windows <a class="header-anchor" href="#windows" aria-label="Permalink to “Windows”">​</a></h3><ol><li>Instala <a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> con el toolchain <code>stable-msvc</code>:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rustup</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> default</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> stable-msvc</span></span></code></pre></div></li><li>Instala <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual Studio Build Tools</a> y selecciona el workload <strong>Desktop development with C++</strong>.</li><li>WebView2 ya está incluido en Windows 10 a partir de la versión 1803 y en Windows 11.</li><li>Ejecuta:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div></li></ol><h3 id="linux" tabindex="-1">Linux <a class="header-anchor" href="#linux" aria-label="Permalink to “Linux”">​</a></h3><p>En Debian o Ubuntu, instala las dependencias del sistema:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">sudo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> apt</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libwebkit2gtk-4.1-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build-essential</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> wget</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> file</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  libxdo-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libssl-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libayatana-appindicator3-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> librsvg2-dev</span></span></code></pre></div><p>Después, ejecuta:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><h3 id="generar-un-paquete-de-instalacion" tabindex="-1">Generar un paquete de instalación <a class="header-anchor" href="#generar-un-paquete-de-instalacion" aria-label="Permalink to “Generar un paquete de instalación”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                                    # Plataforma actual</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --target</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> universal-apple-darwin</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # Universal Binary para macOS</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("es/getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
