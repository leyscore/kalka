import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/getting-started.md
var __pageData = JSON.parse("{\"title\":\"Erste Schritte\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Erste Schritte — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Erste Schritte — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"de/getting-started.md\",\"filePath\":\"de/getting-started.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "de/getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="erste-schritte" tabindex="-1">Erste Schritte <a class="header-anchor" href="#erste-schritte" aria-label="Permalink to “Erste Schritte”">​</a></h1><h2 id="webversion" tabindex="-1">Webversion <a class="header-anchor" href="#webversion" aria-label="Permalink to “Webversion”">​</a></h2><p>OpenPencil läuft direkt im Browser und muss nicht installiert werden. Öffnen Sie <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, um mit der Gestaltung zu beginnen.</p><p>Wenn Sie ein eigenes Produkt auf OpenPencil aufbauen möchten, lesen Sie den Bereich <a href="/programmable/">Automatisierung</a> und die Dokumentation zum <a href="/programmable/sdk/">Vue SDK</a>.</p><h2 id="desktop-anwendung" tabindex="-1">Desktop-Anwendung <a class="header-anchor" href="#desktop-anwendung" aria-label="Permalink to “Desktop-Anwendung”">​</a></h2><p>Fertige Versionen für macOS, Windows und Linux finden Sie auf der <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">Release-Seite</a>.</p><table tabindex="0"><thead><tr><th>Plattform</th><th>Datei</th></tr></thead><tbody><tr><td>macOS (Apple Silicon)</td><td><code>.dmg</code> (aarch64)</td></tr><tr><td>macOS (Intel)</td><td><code>.dmg</code> (x64)</td></tr><tr><td>Windows (x64)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Windows (ARM)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Linux (x64)</td><td><code>.AppImage</code> / <code>.deb</code></td></tr></tbody></table><h2 id="systemvoraussetzungen" tabindex="-1">Systemvoraussetzungen <a class="header-anchor" href="#systemvoraussetzungen" aria-label="Permalink to “Systemvoraussetzungen”">​</a></h2><p>OpenPencil rendert mit CanvasKit über WebGL und nutzt aktuelle Webplattform-Funktionen, daher ist eine neuere Browser-Engine erforderlich. Die Webversion unterstützt Chrome 111, Edge 111, Firefox 128 und Safari 16.4 oder neuer; Chromium-basierte Browser wie Brave und Opera richten sich nach ihrer Chrome-Version. Die Desktop-Anwendung rendert im WebView des Systems, daher bestimmt die Engine des Betriebssystems die Untergrenze:</p><table tabindex="0"><thead><tr><th>Plattform</th><th>Voraussetzung</th></tr></thead><tbody><tr><td>macOS</td><td>macOS 13 Ventura oder neuer mit den aktuellen Safari-Updates (Safari 16.4 wurde mit macOS 13.3 ausgeliefert).</td></tr><tr><td>Windows</td><td>Windows 10 oder neuer mit der Laufzeitumgebung Microsoft Edge WebView2 Evergreen, die sich selbst aktualisiert.</td></tr><tr><td>Linux</td><td>WebKitGTK 2.40 oder neuer (<code>webkit2gtk-4.1</code>).</td></tr></tbody></table><p>Ist die Engine zu alt, zeigt OpenPencil an, was aktualisiert werden muss, statt ein leeres Fenster darzustellen. Erscheint dieser Hinweis auf einem System, das die Voraussetzungen erfüllt, verwenden Sie den Link „Report a problem“, der die Angaben zu Browser und Engine vorausfüllt.</p><h2 id="installation-unter-macos-mit-homebrew" tabindex="-1">Installation unter macOS mit Homebrew <a class="header-anchor" href="#installation-unter-macos-mit-homebrew" aria-label="Permalink to “Installation unter macOS mit Homebrew”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><p>Der Befehl installiert die signierte App für Macs mit Apple Silicon oder Intel-Prozessor aus dem <a href="https://formulae.brew.sh/cask/openpencil" target="_blank" rel="noreferrer">offiziellen Homebrew-Katalog</a>. Updates werden von Homebrew geprüft und können später als GitHub-Releases erscheinen. Bis dahin steht der <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">direkte Download</a> bereit. Die CLI wird separat installiert: <code>npm install -g @open-pencil/cli</code>.</p><p>Wenn du den archivierten eigenen Tap verwendet hast, wechsle so:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><h2 id="aus-dem-quellcode-erstellen" tabindex="-1">Aus dem Quellcode erstellen <a class="header-anchor" href="#aus-dem-quellcode-erstellen" aria-label="Permalink to “Aus dem Quellcode erstellen”">​</a></h2><h3 id="voraussetzungen" tabindex="-1">Voraussetzungen <a class="header-anchor" href="#voraussetzungen" aria-label="Permalink to “Voraussetzungen”">​</a></h3><ul><li><a href="https://bun.sh/" target="_blank" rel="noreferrer">Bun</a> als Runtime und Package Manager;</li><li><a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> nur für die Tauri-Anwendung.</li></ul><h3 id="installation" tabindex="-1">Installation <a class="header-anchor" href="#installation" aria-label="Permalink to “Installation”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> install</span></span></code></pre></div><h3 id="entwicklungsserver" tabindex="-1">Entwicklungsserver <a class="header-anchor" href="#entwicklungsserver" aria-label="Permalink to “Entwicklungsserver”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><p>Der Editor ist anschließend unter <code>http://localhost:1420</code> erreichbar.</p><h3 id="befehle" tabindex="-1">Befehle <a class="header-anchor" href="#befehle" aria-label="Permalink to “Befehle”">​</a></h3><table tabindex="0"><thead><tr><th>Befehl</th><th>Zweck</th></tr></thead><tbody><tr><td><code>bun run dev</code></td><td>Entwicklungsserver mit HMR starten</td></tr><tr><td><code>bun run build</code></td><td>Produktionsversion erstellen</td></tr><tr><td><code>bun run check</code></td><td>oxlint und Typprüfung mit tsgo ausführen</td></tr><tr><td><code>bun run test</code></td><td>E2E- und visuelle Regressionstests mit Playwright ausführen</td></tr><tr><td><code>bun run test:update</code></td><td>Referenz-Screenshots aktualisieren</td></tr><tr><td><code>bun run test:unit</code></td><td>Unit-Tests mit bun:test ausführen</td></tr><tr><td><code>bun run docs:dev</code></td><td>Entwicklungsserver der Dokumentation starten</td></tr><tr><td><code>bun run docs:build</code></td><td>Dokumentation schnell zur lokalen Prüfung erstellen</td></tr><tr><td><code>bun run docs:build:production</code></td><td>Vollständige veröffentlichungsfähige Dokumentation einschließlich LLM-Dateien erstellen</td></tr></tbody></table><h2 id="tauri-anwendung" tabindex="-1">Tauri-Anwendung <a class="header-anchor" href="#tauri-anwendung" aria-label="Permalink to “Tauri-Anwendung”">​</a></h2><p>Zum Erstellen der Tauri-Anwendung werden Rust und plattformspezifische Systemkomponenten benötigt.</p><h3 id="macos" tabindex="-1">macOS <a class="header-anchor" href="#macos" aria-label="Permalink to “macOS”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="windows" tabindex="-1">Windows <a class="header-anchor" href="#windows" aria-label="Permalink to “Windows”">​</a></h3><ol><li>Installieren Sie <a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> mit der Toolchain <code>stable-msvc</code>:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> stable-msvc</span></span></code></pre></div></li><li>Installieren Sie die <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual Studio Build Tools</a> mit der Workload <strong>Desktop development with C++</strong>.</li><li>WebView2 ist in Windows 10 ab Version 1803 und in Windows 11 bereits enthalten.</li><li>Führen Sie Folgendes aus:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div></li></ol><h3 id="linux" tabindex="-1">Linux <a class="header-anchor" href="#linux" aria-label="Permalink to “Linux”">​</a></h3><p>Installieren Sie unter Debian oder Ubuntu die Systemabhängigkeiten:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> librsvg2-dev</span></span></code></pre></div><p>Führen Sie anschließend aus:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="installationspaket-erstellen" tabindex="-1">Installationspaket erstellen <a class="header-anchor" href="#installationspaket-erstellen" aria-label="Permalink to “Installationspaket erstellen”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                                    # Aktuelle Plattform</span></span>
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
	})}">    # Universal Binary für macOS</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
