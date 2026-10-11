import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/tech-stack.md
var __pageData = JSON.parse("{\"title\":\"Tech Stack\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/tech-stack\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/tech-stack\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/tech-stack\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/tech-stack\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Tech Stack — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Tech Stack — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"development/tech-stack.md\",\"filePath\":\"development/tech-stack.md\",\"lastUpdated\":1788335760000}");
var _sfc_main = { name: "development/tech-stack.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="tech-stack" tabindex="-1">Tech Stack <a class="header-anchor" href="#tech-stack" aria-label="Permalink to “Tech Stack”">​</a></h1><h2 id="core-technologies" tabindex="-1">Core Technologies <a class="header-anchor" href="#core-technologies" aria-label="Permalink to “Core Technologies”">​</a></h2><table tabindex="0"><thead><tr><th>Layer</th><th>Technology</th><th>Why</th></tr></thead><tbody><tr><td><strong>Rendering</strong></td><td>Skia CanvasKit WASM</td><td>Same engine as Figma — proven performance, GPU-accelerated, pixel-perfect</td></tr><tr><td><strong>UI Framework</strong></td><td>Vue 3 + VueUse</td><td>Reactive composition API, excellent TypeScript support</td></tr><tr><td><strong>Components</strong></td><td>Reka UI</td><td>Headless, accessible UI primitives (tree, slider, etc.)</td></tr><tr><td><strong>Styling</strong></td><td>Tailwind CSS 4</td><td>Utility-first, fast iteration, dark theme</td></tr><tr><td><strong>Layout</strong></td><td>Yoga WASM</td><td>CSS flexbox and grid engine from Meta, battle-tested in React Native</td></tr><tr><td><strong>File Format</strong></td><td>Kiwi binary + Zstd</td><td>Figma&#39;s own format — compact, fast parsing, .fig compatible</td></tr><tr><td><strong>Collaboration</strong></td><td>Trystero + Yjs</td><td>P2P WebRTC via MQTT signaling, CRDT sync, y-indexeddb persistence</td></tr><tr><td><strong>Color</strong></td><td>culori</td><td>Color space conversions (HSV, RGB, hex)</td></tr><tr><td><strong>AI/MCP</strong></td><td>MCP SDK + Hono</td><td>90+ tools for AI coding tools, stdio + HTTP transports</td></tr><tr><td><strong>JSX Transform</strong></td><td>Sucrase</td><td>Lightweight (201 KB) JSX → JS, synchronous, browser-compatible</td></tr><tr><td><strong>Events</strong></td><td>nanoevents</td><td>108 bytes, typed event emitter for SceneGraph mutations</td></tr><tr><td><strong>Desktop</strong></td><td>Tauri v2</td><td>~5MB native app (vs Electron&#39;s ~100MB), Rust backend</td></tr><tr><td><strong>Build</strong></td><td>Vite 7</td><td>Fast HMR, native ES modules</td></tr><tr><td><strong>Testing</strong></td><td>Playwright + bun:test</td><td>Visual regression (E2E) + fast unit tests</td></tr><tr><td><strong>Linting</strong></td><td>oxlint</td><td>Rust-based, orders of magnitude faster than ESLint</td></tr><tr><td><strong>Formatting</strong></td><td>oxfmt</td><td>Rust-based formatter</td></tr><tr><td><strong>Type Checking</strong></td><td>typescript-go (tsgo)</td><td>Native Go implementation of TypeScript type checker</td></tr></tbody></table><h2 id="key-dependencies" tabindex="-1">Key Dependencies <a class="header-anchor" href="#key-dependencies" aria-label="Permalink to “Key Dependencies”">​</a></h2><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">  &quot;canvaskit-wasm&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^0.41.1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;vue&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^3.5.41&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;yoga-layout&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;npm:@open-pencil/yoga-layout@3.3.0-grid.3&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;nanoevents&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^9.1.0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;sucrase&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^3.35.1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;reka-ui&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^2.10.3&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;tailwindcss&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^4.3.3&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;culori&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^4.0.2&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;fzstd&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^0.1.1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;fflate&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^0.8.3&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;trystero&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^0.22.0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;yjs&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^13.6.32&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;y-indexeddb&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;^9.0.12&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="why-not" tabindex="-1">Why Not... <a class="header-anchor" href="#why-not" aria-label="Permalink to “Why Not...”">​</a></h2><h3 id="why-not-svg-rendering" tabindex="-1">Why not SVG rendering? <a class="header-anchor" href="#why-not-svg-rendering" aria-label="Permalink to “Why not SVG rendering?”">​</a></h3><p>SVG is slow for complex documents. Every node is a DOM element — 10,000 nodes means 10,000 DOM nodes with layout, paint, and compositing overhead. CanvasKit draws everything to a single GPU surface. (Penpot still defaults to SVG rendering but has an opt-in Rust/Skia WASM renderer in development.)</p><h3 id="why-not-electron-like-figma-desktop" tabindex="-1">Why not Electron (like Figma desktop)? <a class="header-anchor" href="#why-not-electron-like-figma-desktop" aria-label="Permalink to “Why not Electron (like Figma desktop)?”">​</a></h3><p>Tauri v2 uses the system webview (~5MB) instead of bundling Chromium (~100MB). The Rust backend provides native performance for file I/O and system integration.</p><h3 id="why-not-react-like-the-original-plan" tabindex="-1">Why not React (like the original plan)? <a class="header-anchor" href="#why-not-react-like-the-original-plan" aria-label="Permalink to “Why not React (like the original plan)?”">​</a></h3><p>The project migrated from React to Vue 3 early in development. Vue&#39;s reactivity system and VueUse composables proved more ergonomic for the editor&#39;s state management needs.</p><h3 id="why-not-custom-layout-engine" tabindex="-1">Why not custom layout engine? <a class="header-anchor" href="#why-not-custom-layout-engine" aria-label="Permalink to “Why not custom layout engine?”">​</a></h3><p>Yoga is maintained by Meta, battle-tested across billions of React Native devices, and implements the CSS flexbox spec. Building a custom engine would be months of work to reach the same correctness level.</p><h2 id="additional-technologies" tabindex="-1">Additional Technologies <a class="header-anchor" href="#additional-technologies" aria-label="Permalink to “Additional Technologies”">​</a></h2><table tabindex="0"><thead><tr><th>Technology</th><th>Purpose</th><th>Status</th></tr></thead><tbody><tr><td>CSS Grid in Yoga</td><td>Grid-based auto layout</td><td>Shipped via <a href="https://github.com/open-pencil/yoga/tree/grid" target="_blank" rel="noreferrer">Yoga fork</a> (<code>@open-pencil/yoga-layout</code>)</td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/tech-stack.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var tech_stack_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, tech_stack_default as default };
