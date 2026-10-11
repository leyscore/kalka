import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region overview/features.md
var __pageData = JSON.parse("{\"title\":\"Features\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Features — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Features — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"overview/features.md\",\"filePath\":\"overview/features.md\",\"lastUpdated\":1791292985000}");
var _sfc_main = { name: "overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="features" tabindex="-1">Features <a class="header-anchor" href="#features" aria-label="Permalink to “Features”">​</a></h1><h2 id="figma-fig-files" tabindex="-1">Figma .fig Files <a class="header-anchor" href="#figma-fig-files" aria-label="Permalink to “Figma .fig Files”">​</a></h2><p>Open and save native Figma files directly. The import/export pipeline uses the same Kiwi binary codec as Figma — 194 schema definitions, ~390 fields per node. Save with <kbd>⌘</kbd><kbd>S</kbd>, Save As with <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Copy &amp; paste with Figma</strong> — select nodes in Figma, <kbd>⌘</kbd><kbd>C</kbd>, switch to OpenPencil, <kbd>⌘</kbd><kbd>V</kbd>. Fills, strokes, auto-layout, text, effects, corner radii, and vector networks are preserved. Works both ways.</p><h2 id="drawing-editing" tabindex="-1">Drawing &amp; Editing <a class="header-anchor" href="#drawing-editing" aria-label="Permalink to “Drawing &amp; Editing”">​</a></h2><ul><li><strong>Shapes</strong> — Rectangle (<kbd>R</kbd>), Ellipse (<kbd>O</kbd>), Line (<kbd>L</kbd>), Polygon, Star</li><li><strong>Pen tool</strong> — vector networks (not simple paths), bezier curves with tangent handles</li><li><strong>Text</strong> — canvas-native editing with IME support, double-click to enter edit mode</li><li><strong>Rich text</strong> — per-character bold (<kbd>⌘</kbd><kbd>B</kbd>), italic (<kbd>⌘</kbd><kbd>I</kbd>), underline (<kbd>⌘</kbd><kbd>U</kbd>), strikethrough</li><li><strong>Auto-layout</strong> — flexbox and CSS Grid via Yoga WASM: direction, gap, padding, justify, align, child sizing, grid tracks. <kbd>⇧</kbd><kbd>A</kbd> to toggle</li><li><strong>Components</strong> — create (<kbd>⌥</kbd><kbd>⌘</kbd><kbd>K</kbd>), component sets (<kbd>⇧</kbd><kbd>⌘</kbd><kbd>K</kbd>), instances with override support, slots, live sync</li><li><strong>Behaviours and preview</strong> — make components work as Reka UI controls (switch, slider, tabs, text field, accordion, …) and try them live over the canvas with <kbd>⌥</kbd><kbd>⌘</kbd><kbd>↩</kbd> (<a href="/user-guide/components#behaviours-and-preview">Components</a>)</li><li><strong>Variables</strong> — design tokens with collections, modes (Light/Dark), color/float/string/boolean types, variable binding</li><li><strong>Sections</strong> — organizational containers with auto-adopting children and title pills</li></ul><h2 id="properties-panel" tabindex="-1">Properties Panel <a class="header-anchor" href="#properties-panel" aria-label="Permalink to “Properties Panel”">​</a></h2><p>Context-sensitive Design | Code | AI | Lint tabs:</p><ul><li><strong>Appearance</strong> — opacity, corner radius (uniform or per-corner), visibility</li><li><strong>Fill</strong> — solid, gradient (linear/radial/angular/diamond), image</li><li><strong>Stroke</strong> — color, weight, align (inside/center/outside), per-side weights, cap, join, dash</li><li><strong>Effects</strong> — drop shadow, inner shadow, layer blur, background blur, foreground blur</li><li><strong>Typography</strong> — font picker with virtual scroll and search, weight, size, alignment, style buttons</li><li><strong>Layout</strong> — auto-layout controls when enabled</li><li><strong>Export</strong> — scale, format (PNG/JPG/WEBP/SVG), live preview</li><li><strong>Code</strong> — Design JSX and Tailwind JSX for the selection, with live two-way Design JSX editing that patches your code as layers change; the element around the cursor outlines its layer on the canvas, and design issues are underlined on the property that causes them</li><li><strong>Lint</strong> — live design lint for the page or selection: low contrast, small touch targets, unbound colors, off-scale spacing, with issue markers on the canvas and one-click variable binding (<a href="/user-guide/checking-designs">Checking Designs</a>)</li></ul><h2 id="rendering" tabindex="-1">Rendering <a class="header-anchor" href="#rendering" aria-label="Permalink to “Rendering”">​</a></h2><p>Skia (CanvasKit WASM) — the same rendering engine as Figma:</p><ul><li>Gradient fills (linear, radial, angular, diamond)</li><li>Image fills with scale modes</li><li>Effects with per-node caching</li><li>Arc data (partial ellipses, donuts)</li><li>Viewport culling and paint reuse</li><li>Snap guides with rotation-aware alignment</li><li>Canvas rulers with selection badges</li><li>Hover highlight that follows actual geometry</li></ul><h2 id="undo-redo" tabindex="-1">Undo/Redo <a class="header-anchor" href="#undo-redo" aria-label="Permalink to “Undo/Redo”">​</a></h2><p>Every operation is undoable — creation, deletion, moves, resizes, property changes, reparenting, layout changes, variable operations. Uses an inverse-command pattern. <kbd>⌘</kbd><kbd>Z</kbd> / <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="multi-page-documents" tabindex="-1">Multi-Page Documents <a class="header-anchor" href="#multi-page-documents" aria-label="Permalink to “Multi-Page Documents”">​</a></h2><p>Add, delete, rename pages. Each page has independent viewport state. Double-click to rename inline.</p><h2 id="multi-file-tabs" tabindex="-1">Multi-File Tabs <a class="header-anchor" href="#multi-file-tabs" aria-label="Permalink to “Multi-File Tabs”">​</a></h2><p>Open multiple documents in tabs. <kbd>⌘</kbd><kbd>T</kbd> new tab, <kbd>⌘</kbd><kbd>W</kbd> close, <kbd>⌘</kbd><kbd>O</kbd> open file.</p><h2 id="export" tabindex="-1">Export <a class="header-anchor" href="#export" aria-label="Permalink to “Export”">​</a></h2><ul><li><strong>Image</strong> — PNG, JPG, WEBP at configurable scale (0.5×–4×). Via panel, context menu, or <kbd>⇧</kbd><kbd>⌘</kbd><kbd>E</kbd></li><li><strong>SVG</strong> — shapes, text with style runs, gradients, effects, blend modes</li><li><strong>Tailwind JSX</strong> — HTML with Tailwind v4 utility classes, ready for React or Vue</li><li><strong>Copy as</strong> — text, SVG, PNG (<kbd>⇧</kbd><kbd>⌘</kbd><kbd>C</kbd>), or JSX via context menu</li></ul><p>CLI: <code>openpencil export design.fig -f jsx --style tailwind</code></p><h2 id="ai-chat" tabindex="-1">AI Chat <a class="header-anchor" href="#ai-chat" aria-label="Permalink to “AI Chat”">​</a></h2><p>Press <kbd>⌘</kbd><kbd>J</kbd> to open the AI assistant. 90+ tools that can create shapes, set styles, manage layout, work with components and variables, run boolean operations, analyze design tokens, and export assets. Connect Anthropic, OpenAI, Google AI, OpenRouter, or any compatible endpoint.</p><p>Tool calls display as collapsible timeline entries. Visual verification — the assistant renders its work and checks it against your request. Full undo support for all AI mutations.</p><p>See <a href="/programmable/ai-chat">AI Chat</a> for setup and provider details.</p><h2 id="mcp-server" tabindex="-1">MCP Server <a class="header-anchor" href="#mcp-server" aria-label="Permalink to “MCP Server”">​</a></h2><p>Connect Claude Code, Cursor, Windsurf, or any MCP client to read and write <code>.fig</code> files headlessly. 90+ tools. Two transports: stdio and HTTP.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;mcpServers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;open-pencil&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;command&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;openpencil-mcp&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>See <a href="/programmable/mcp-server">MCP Tools reference</a> for the full tool list.</p><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><p>Inspect, export, and analyze <code>.fig</code> files from the terminal:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">          # Node tree</span></span>
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
	})}">  # Search</span></span>
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
	})}">     # Render</span></span>
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
	})}">    # Color audit</span></span>
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
	})}">  # Repeated patterns</span></span>
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
	})}">     # Figma Plugin API</span></span></code></pre></div><p>When the desktop app is running, omit the file to control the live editor via RPC:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                     # Live document</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
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
	})}">            # Screenshot canvas</span></span></code></pre></div><p>All commands support <code>--json</code>. Install: <code>npm install -g @open-pencil/cli</code> (or <code>bun add -g @open-pencil/cli</code>).</p><h2 id="real-time-collaboration" tabindex="-1">Real-Time Collaboration <a class="header-anchor" href="#real-time-collaboration" aria-label="Permalink to “Real-Time Collaboration”">​</a></h2><p>P2P via WebRTC — no server required. Share a link and edit together.</p><ul><li>Live cursors with colored arrows and name pills</li><li>Presence avatars</li><li>Follow mode — click a peer to follow their viewport</li><li>Local persistence via IndexedDB</li><li>Secure room IDs via <code>crypto.getRandomValues()</code></li></ul><h2 id="desktop-web" tabindex="-1">Desktop &amp; Web <a class="header-anchor" href="#desktop-web" aria-label="Permalink to “Desktop &amp; Web”">​</a></h2><p><strong>Desktop</strong> — Tauri v2, ~7 MB. macOS (signed &amp; notarized), Windows, Linux. Native menus, offline, autosave.</p><p><strong>Web</strong> — runs at <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, installable as a PWA on mobile with touch-optimized UI.</p><p><strong>Homebrew:</strong></p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><h2 id="google-fonts-fallback" tabindex="-1">Google Fonts Fallback <a class="header-anchor" href="#google-fonts-fallback" aria-label="Permalink to “Google Fonts Fallback”">​</a></h2><p>When a font isn&#39;t available locally, OpenPencil fetches it from Google Fonts automatically. No manual installation needed when opening .fig files with unfamiliar fonts.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
