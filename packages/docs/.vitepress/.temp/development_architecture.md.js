import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/architecture.md
var __pageData = JSON.parse("{\"title\":\"Architecture\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/architecture\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/architecture\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/architecture\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/architecture\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Architecture — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Architecture — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"development/architecture.md\",\"filePath\":\"development/architecture.md\",\"lastUpdated\":1791292985000}");
var _sfc_main = { name: "development/architecture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to “Architecture”">​</a></h1><h2 id="system-overview" tabindex="-1">System Overview <a class="header-anchor" href="#system-overview" aria-label="Permalink to “System Overview”">​</a></h2><p>For source identity, override evaluation, page sessions, and export contracts, see <a href="./fig-reader">.fig Reader Architecture</a>.</p><div class="language-mermaid"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">graph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> TB</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">    subgraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Tauri v2 Shell&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">        subgraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Editor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">Editor </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Web</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&quot;]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">            UI</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Vue 3 UI&lt;br/&gt;Toolbar · Panels · Properties&lt;br/&gt;Layers · Color Picker&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">            Skia</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Skia CanvasKit (WASM, 7MB)&lt;br/&gt;Vector rendering · Text shaping&lt;br/&gt;Effects · Export&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">            subgraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Core</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">Core Engine </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">TS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&quot;]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                SG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">SceneGraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> ---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Layout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Layout </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">- </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Yoga</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                SG </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Selection</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                Undo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Undo/Redo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> ---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Constraints</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                Constraints </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> HitTest</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Hit Testing</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">            end</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">            subgraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> FileFormat</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;File Format Layer&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                FigIO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;.fig import/export&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> ---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Kiwi</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Kiwi codec</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">                Kiwi </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">---</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> SVG</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">SVG export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">            end</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">        end</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">        MCP</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;MCP Server (90 tools, stdio+HTTP)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">        Collab</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;P2P Collab (Trystero + Yjs)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">    end</span></span></code></pre></div><h2 id="editor-layout" tabindex="-1">Editor Layout <a class="header-anchor" href="#editor-layout" aria-label="Permalink to “Editor Layout”">​</a></h2><p>The UI follows Figma&#39;s UI3 layout — toolbar at the bottom, navigation on the left, properties on the right:</p><ul><li><strong>Navigation panel (left)</strong> — Layers tree, pages panel</li><li><strong>Canvas (center)</strong> — Infinite canvas with CanvasKit rendering, zoom/pan</li><li><strong>Properties panel (right)</strong> — Context-sensitive sections: Appearance, Fill, Stroke, Typography, Layout, Position</li><li><strong>Toolbar (bottom)</strong> — Tool selection: Select, Frame, Section, Rectangle, Ellipse, Line, Text, Pen, Hand</li></ul><h2 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to “Components”">​</a></h2><h3 id="rendering-canvaskit-wasm" tabindex="-1">Rendering (CanvasKit WASM) <a class="header-anchor" href="#rendering-canvaskit-wasm" aria-label="Permalink to “Rendering (CanvasKit WASM)”">​</a></h3><p>The same rendering engine as Figma. CanvasKit provides GPU-accelerated 2D drawing with vector shapes, text shaping via Paragraph API, effects (shadows, blurs, blend modes), and export (PNG, SVG). The 7MB WASM binary loads at startup and creates a GPU surface on the HTML canvas.</p><p>The renderer is split into focused modules in <code>packages/core/src/renderer/</code>: scene traversal, overlays, fills, strokes, shapes, effects, rulers, labels, and remote cursors.</p><h3 id="scene-graph" tabindex="-1">Scene Graph <a class="header-anchor" href="#scene-graph" aria-label="Permalink to “Scene Graph”">​</a></h3><p>Flat <code>Map&lt;string, Node&gt;</code> keyed by GUID strings. Tree structure via <code>parentIndex</code> references. Provides O(1) lookup, efficient traversal, hit testing, and rectangular area queries for marquee selection.</p><p>The graph emits typed events via nanoevents: <code>node:created</code>, <code>node:updated</code>, <code>node:deleted</code>, <code>node:reparented</code>, <code>node:reordered</code>. Subsystems subscribe to these instead of manual call-site wiring — the editor uses them for render invalidation and microtask-batched component instance sync, while the collab system uses them for Yjs propagation.</p><p>See <a href="/reference/scene-graph">Scene Graph Reference</a> for internals.</p><h3 id="layout-engine-yoga-wasm" tabindex="-1">Layout Engine (Yoga WASM) <a class="header-anchor" href="#layout-engine-yoga-wasm" aria-label="Permalink to “Layout Engine (Yoga WASM)”">​</a></h3><p>Meta&#39;s Yoga provides CSS flexbox and grid layout computation via a <a href="https://github.com/open-pencil/yoga/tree/grid" target="_blank" rel="noreferrer">fork</a> with CSS Grid support. A thin adapter maps Figma property names to Yoga equivalents:</p><table tabindex="0"><thead><tr><th>Figma Property</th><th>Yoga Equivalent</th></tr></thead><tbody><tr><td><code>stackMode: HORIZONTAL</code></td><td><code>flexDirection: row</code></td></tr><tr><td><code>stackMode: VERTICAL</code></td><td><code>flexDirection: column</code></td></tr><tr><td><code>stackSpacing</code></td><td><code>gap</code></td></tr><tr><td><code>stackPadding</code></td><td><code>padding</code></td></tr><tr><td><code>stackJustify</code></td><td><code>justifyContent</code></td></tr><tr><td><code>stackChildPrimaryGrow</code></td><td><code>flexGrow</code></td></tr></tbody></table><h3 id="file-format-kiwi-binary" tabindex="-1">File Format (Kiwi Binary) <a class="header-anchor" href="#file-format-kiwi-binary" aria-label="Permalink to “File Format (Kiwi Binary)”">​</a></h3><p>Reuses Figma&#39;s Kiwi binary codec with 194 message/enum/struct definitions. Import: parse header → Zstd decompress → Kiwi decode → <code>NodeChange</code>[] → scene graph. Export reverses the process with thumbnail generation.</p><p>See <a href="/reference/file-format">File Format Reference</a> for details.</p><h3 id="ai-tools" tabindex="-1">AI &amp; Tools <a class="header-anchor" href="#ai-tools" aria-label="Permalink to “AI &amp; Tools”">​</a></h3><p>Tools are defined once in <code>packages/core/src/tools/</code>, split by domain: read, create, modify, structure, variables, vector, analyze. Each tool has typed params and an <code>execute(figma, args)</code> function. Adapters convert them for:</p><ul><li><strong>AI chat</strong> — valibot schemas, multi-provider (Anthropic, OpenAI, Google AI, OpenRouter, compatible endpoints)</li><li><strong>MCP server</strong> — zod schemas, stdio + HTTP transports</li><li><strong>CLI</strong> — available via the <code>eval</code> command, whose scripts get the <code>figma</code> Plugin API and the <code>openpencil</code> API</li></ul><p>90+ core tools + 3 MCP file management tools. Includes XPath query (<code>query_nodes</code>), JSX inspection (<code>get_jsx</code>, <code>diff_jsx</code>), semantic description (<code>describe</code>), and vision-based verification (<code>export_image</code> returns images to the model).</p><h3 id="behaviours-and-preview" tabindex="-1">Behaviours and Preview <a class="header-anchor" href="#behaviours-and-preview" aria-label="Permalink to “Behaviours and Preview”">​</a></h3><p>A behaviour stored on a main component makes it work as a Reka UI control. Preview runs top-level layers holding controls as live islands: shadow-DOM projections laid over the canvas, with each control mounted as its Reka UI primitive and drawn by the component&#39;s variants. See <a href="./behaviours-and-preview">Behaviours and Preview</a>.</p><h3 id="undo-redo" tabindex="-1">Undo/Redo <a class="header-anchor" href="#undo-redo" aria-label="Permalink to “Undo/Redo”">​</a></h3><p>Inverse-command pattern. Before applying any change, affected fields are snapshotted. The snapshot becomes the inverse operation. Batching groups rapid changes (like drag) into single undo entries.</p><h3 id="clipboard" tabindex="-1">Clipboard <a class="header-anchor" href="#clipboard" aria-label="Permalink to “Clipboard”">​</a></h3><p>Figma-compatible bidirectional clipboard. Encodes/decodes Kiwi binary (same format as .fig files) via native browser copy/paste events. Handles vector path scaling, instance children, component set detection, and override application.</p><h3 id="p2p-collaboration" tabindex="-1">P2P Collaboration <a class="header-anchor" href="#p2p-collaboration" aria-label="Permalink to “P2P Collaboration”">​</a></h3><p>Real-time peer-to-peer collaboration via Trystero (WebRTC) + Yjs CRDT. No server relay — signaling over MQTT public brokers, STUN/TURN for NAT traversal. Awareness protocol provides live cursors, selections, and presence. Local persistence via y-indexeddb.</p><h3 id="cli-to-app-rpc-bridge" tabindex="-1">CLI-to-App RPC Bridge <a class="header-anchor" href="#cli-to-app-rpc-bridge" aria-label="Permalink to “CLI-to-App RPC Bridge”">​</a></h3><p>When the desktop app is running, CLI commands connect to it via WebSocket instead of requiring a .fig file. The automation server runs on <code>127.0.0.1:7600</code> (HTTP) and <code>127.0.0.1:7601</code> (WebSocket). Commands execute against the live editor state, enabling automation scripts and AI agents to interact with the running app.</p><h2 id="what-s-next" tabindex="-1">What&#39;s Next <a class="header-anchor" href="#what-s-next" aria-label="Permalink to “What&#39;s Next”">​</a></h2><h3 id="full-figma-use-tool-set" tabindex="-1">Full figma-use Tool Set <a class="header-anchor" href="#full-figma-use-tool-set" aria-label="Permalink to “Full figma-use Tool Set”">​</a></h3><p>The MCP server currently exposes 90 tools. The reference implementation in <a href="https://github.com/dannote/figma-use" target="_blank" rel="noreferrer">figma-use</a> has 118. The remaining tools cover advanced layout constraints, prototype connections, advanced component property editing, and bulk document operations.</p><h3 id="ci-design-tooling" tabindex="-1">CI Design Tooling <a class="header-anchor" href="#ci-design-tooling" aria-label="Permalink to “CI Design Tooling”">​</a></h3><p>The headless CLI already supports <code>analyze colors/typography/spacing/clusters</code>. Next: GitHub Actions integration for automated design linting and visual regression in PRs.</p><h3 id="prototyping" tabindex="-1">Prototyping <a class="header-anchor" href="#prototyping" aria-label="Permalink to “Prototyping”">​</a></h3><p>Preview already runs components with behaviours as live controls. Next: reactions and variables that let controls drive the rest of a design, frame-to-frame transitions, interaction triggers, and overlays.</p><h3 id="windows-code-signing" tabindex="-1">Windows Code Signing <a class="header-anchor" href="#windows-code-signing" aria-label="Permalink to “Windows Code Signing”">​</a></h3><p>macOS binaries are signed and notarized since v0.6.0. Windows Authenticode signing via Azure Code Signing is planned to remove the SmartScreen warning.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/architecture.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var architecture_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, architecture_default as default };
