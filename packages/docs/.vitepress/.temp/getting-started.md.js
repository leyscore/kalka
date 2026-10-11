import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region getting-started.md
var __pageData = JSON.parse("{\"title\":\"Getting Started\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Getting Started — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Getting Started — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"getting-started.md\",\"filePath\":\"getting-started.md\",\"lastUpdated\":1790073659000}");
var _sfc_main = { name: "getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="getting-started" tabindex="-1">Getting Started <a class="header-anchor" href="#getting-started" aria-label="Permalink to “Getting Started”">​</a></h1><h2 id="try-online" tabindex="-1">Try Online <a class="header-anchor" href="#try-online" aria-label="Permalink to “Try Online”">​</a></h2><p>OpenPencil runs in the browser — no installation required. Open <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a> to start designing.</p><p>If you want to build on top of it instead of only using the default app, see the <a href="/programmable/">Programmable</a> section and the <a href="/programmable/sdk/">Vue SDK</a>.</p><h2 id="download-desktop-app" tabindex="-1">Download Desktop App <a class="header-anchor" href="#download-desktop-app" aria-label="Permalink to “Download Desktop App”">​</a></h2><p>Pre-built binaries for macOS, Windows, and Linux are available on the <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">releases page</a>.</p><table tabindex="0"><thead><tr><th>Platform</th><th>Download</th></tr></thead><tbody><tr><td>macOS (Apple Silicon)</td><td><code>.dmg</code> (aarch64)</td></tr><tr><td>macOS (Intel)</td><td><code>.dmg</code> (x64)</td></tr><tr><td>Windows (x64)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Windows (ARM)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Linux (x64)</td><td><code>.AppImage</code> / <code>.deb</code></td></tr></tbody></table><h2 id="system-requirements" tabindex="-1">System Requirements <a class="header-anchor" href="#system-requirements" aria-label="Permalink to “System Requirements”">​</a></h2><p>OpenPencil renders with CanvasKit on WebGL and relies on current web platform features, so it needs a recent browser engine. The web app supports Chrome 111, Edge 111, Firefox 128, and Safari 16.4 or later; Chromium-based browsers such as Brave and Opera follow their Chrome version. The desktop app renders in the system WebView, so its floor is the operating system&#39;s engine:</p><table tabindex="0"><thead><tr><th>Platform</th><th>Requirement</th></tr></thead><tbody><tr><td>macOS</td><td>macOS 13 Ventura or later with the current Safari updates installed (Safari 16.4 shipped with macOS 13.3).</td></tr><tr><td>Windows</td><td>Windows 10 or later with the Microsoft Edge WebView2 Evergreen runtime, which updates itself.</td></tr><tr><td>Linux</td><td>WebKitGTK 2.40 or later (<code>webkit2gtk-4.1</code>).</td></tr></tbody></table><p>When the engine is too old, OpenPencil shows what to update instead of a blank window. If you see that notice on a system that meets the requirements, use its &quot;Report a problem&quot; link, which prefills the browser and engine details.</p><h2 id="macos-via-homebrew" tabindex="-1">macOS via Homebrew <a class="header-anchor" href="#macos-via-homebrew" aria-label="Permalink to “macOS via Homebrew”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><p>This installs the signed macOS app (Apple Silicon and Intel) from the <a href="https://formulae.brew.sh/cask/openpencil" target="_blank" rel="noreferrer">official Homebrew cask</a>. Homebrew updates are reviewed upstream and may lag behind GitHub releases. For a release not yet available through Homebrew, use the <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">direct download</a>.</p><p>The desktop cask does not install the CLI; install it separately with <code>npm install -g @open-pencil/cli</code>.</p><p>If you used the archived custom tap, migrate with:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><h2 id="building-from-source" tabindex="-1">Building from Source <a class="header-anchor" href="#building-from-source" aria-label="Permalink to “Building from Source”">​</a></h2><h3 id="prerequisites" tabindex="-1">Prerequisites <a class="header-anchor" href="#prerequisites" aria-label="Permalink to “Prerequisites”">​</a></h3><ul><li><a href="https://bun.sh/" target="_blank" rel="noreferrer">Bun</a> (package manager and runtime)</li><li><a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> (for desktop app only)</li></ul><h2 id="installation" tabindex="-1">Installation <a class="header-anchor" href="#installation" aria-label="Permalink to “Installation”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> install</span></span></code></pre></div><h2 id="development-server" tabindex="-1">Development Server <a class="header-anchor" href="#development-server" aria-label="Permalink to “Development Server”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><p>Opens the editor at <code>http://localhost:1420</code>.</p><h2 id="available-scripts" tabindex="-1">Available Scripts <a class="header-anchor" href="#available-scripts" aria-label="Permalink to “Available Scripts”">​</a></h2><table tabindex="0"><thead><tr><th>Command</th><th>Description</th></tr></thead><tbody><tr><td><code>bun run dev</code></td><td>Dev server with HMR</td></tr><tr><td><code>bun run build</code></td><td>Production build</td></tr><tr><td><code>bun run check</code></td><td>Lint (oxlint) + typecheck (tsgo)</td></tr><tr><td><code>bun run test</code></td><td>E2E visual regression (Playwright)</td></tr><tr><td><code>bun run test:update</code></td><td>Regenerate screenshot baselines</td></tr><tr><td><code>bun run test:unit</code></td><td>Unit tests (bun:test)</td></tr><tr><td><code>bun run docs:dev</code></td><td>Documentation dev server</td></tr><tr><td><code>bun run docs:build</code></td><td>Build documentation locally (fast validation build)</td></tr><tr><td><code>bun run docs:build:production</code></td><td>Build deployable documentation, including LLM files</td></tr></tbody></table><h2 id="desktop-app-tauri" tabindex="-1">Desktop App (Tauri) <a class="header-anchor" href="#desktop-app-tauri" aria-label="Permalink to “Desktop App (Tauri)”">​</a></h2><p>The desktop app requires Rust and platform-specific prerequisites.</p><h3 id="macos" tabindex="-1">macOS <a class="header-anchor" href="#macos" aria-label="Permalink to “macOS”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="windows" tabindex="-1">Windows <a class="header-anchor" href="#windows" aria-label="Permalink to “Windows”">​</a></h3><ol><li>Install <a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> with <code>stable-msvc</code> toolchain:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> stable-msvc</span></span></code></pre></div></li><li>Install <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual Studio Build Tools</a> with &quot;Desktop development with C++&quot; workload</li><li>WebView2 is pre-installed on Windows 10 (1803+) and Windows 11</li><li>Run:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div></li></ol><h3 id="linux" tabindex="-1">Linux <a class="header-anchor" href="#linux" aria-label="Permalink to “Linux”">​</a></h3><p>Install system dependencies (Debian/Ubuntu):</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> librsvg2-dev</span></span></code></pre></div><p>Then:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="build-for-distribution" tabindex="-1">Build for Distribution <a class="header-anchor" href="#build-for-distribution" aria-label="Permalink to “Build for Distribution”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                                    # Current platform</span></span>
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
	})}">    # macOS universal</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
