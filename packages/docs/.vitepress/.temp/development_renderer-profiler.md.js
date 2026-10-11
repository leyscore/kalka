import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/renderer-profiler.md
var __pageData = JSON.parse("{\"title\":\"Renderer Profiler\",\"description\":\"Use the CanvasKit renderer profiler HUD and frame capture tools to investigate rendering performance.\",\"frontmatter\":{\"title\":\"Renderer Profiler\",\"description\":\"Use the CanvasKit renderer profiler HUD and frame capture tools to investigate rendering performance.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/renderer-profiler\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/renderer-profiler\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/renderer-profiler\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/renderer-profiler\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Renderer Profiler — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Renderer Profiler — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Use the CanvasKit renderer profiler HUD and frame capture tools to investigate rendering performance.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Use the CanvasKit renderer profiler HUD and frame capture tools to investigate rendering performance.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Use the CanvasKit renderer profiler HUD and frame capture tools to investigate rendering performance.\"}]]},\"headers\":[],\"relativePath\":\"development/renderer-profiler.md\",\"filePath\":\"development/renderer-profiler.md\",\"lastUpdated\":1778629689000}");
var _sfc_main = { name: "development/renderer-profiler.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="renderer-profiler" tabindex="-1">Renderer Profiler <a class="header-anchor" href="#renderer-profiler" aria-label="Permalink to “Renderer Profiler”">​</a></h1><p>OpenPencil includes a CanvasKit renderer profiler for debugging frame time, GPU timing, draw calls, cache behavior, and expensive render phases.</p><h2 id="enable-the-hud" tabindex="-1">Enable the HUD <a class="header-anchor" href="#enable-the-hud" aria-label="Permalink to “Enable the HUD”">​</a></h2><p>In the browser app, open the menu and choose:</p><div class="language-txt"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">txt</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>View → Profiler</span></span></code></pre></div><p>The app toggles <code>store.toggleProfiler()</code>, which maps to <code>editor.renderer.profiler.toggle()</code>.</p><p>The HUD is drawn directly on the Skia canvas so it measures the same rendering path as the document. It is not a DOM overlay.</p><h2 id="hud-metrics" tabindex="-1">HUD metrics <a class="header-anchor" href="#hud-metrics" aria-label="Permalink to “HUD metrics”">​</a></h2><p>The profiler HUD shows:</p><ul><li><strong>FPS / frame time</strong> — smoothed frame cadence.</li><li><strong>CPU</strong> — JavaScript/WASM render time for the frame.</li><li><strong>GPU</strong> — latest available <code>EXT_disjoint_timer_query_webgl2</code> result when the browser exposes it.</li><li><strong>Nodes / culled nodes</strong> — total visible scene work and viewport culling count.</li><li><strong>Draws</strong> — WebGL draw calls counted through the instrumented context.</li><li><strong>Cache</strong> — whether the scene picture cache was reused.</li><li><strong>Phases</strong> — timings for renderer phases such as scene draw, picture replay/record, volatile overlays, section labels, selection, rulers, and flush.</li><li><strong>Frame graph</strong> — rolling frame history with 60 fps / 30 fps / slow thresholds and GPU bars when available.</li></ul><p>GPU timing is asynchronous. The value shown is the latest completed GPU query, not necessarily the current frame.</p><h2 id="implementation-locations" tabindex="-1">Implementation locations <a class="header-anchor" href="#implementation-locations" aria-label="Permalink to “Implementation locations”">​</a></h2><p>Core profiler code lives in:</p><div class="language-txt"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">txt</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>packages/core/src/profiler/</span></span></code></pre></div><p>Main entry points:</p><ul><li><code>render-profiler.ts</code> — <code>RenderProfiler</code> facade used by <code>SkiaRenderer</code>.</li><li><code>frame/stats.ts</code> — rolling frame statistics.</li><li><code>gpu-timer.ts</code> — WebGL timer query wrapper.</li><li><code>draw-call-counter.ts</code> — WebGL draw-call instrumentation.</li><li><code>phase-timer.ts</code> — phase timing and User Timing integration.</li><li><code>hud-renderer.ts</code> — canvas HUD rendering.</li><li><code>frame/capture.ts</code> and <code>speedscope-export.ts</code> — detailed capture and Speedscope export.</li></ul><p>Renderer integration lives under:</p><div class="language-txt"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">txt</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>packages/core/src/canvas/renderer*.ts</span></span>
<span class="line"><span>packages/core/src/canvas/renderer/</span></span></code></pre></div><p>App wiring lives in:</p><div class="language-txt"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">txt</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>src/app/editor/profiler/index.ts</span></span>
<span class="line"><span>src/app/shell/menu/schema.ts</span></span>
<span class="line"><span>src/app/shell/menu/app-menu.ts</span></span></code></pre></div><h2 id="programmatic-use" tabindex="-1">Programmatic use <a class="header-anchor" href="#programmatic-use" aria-label="Permalink to “Programmatic use”">​</a></h2><p>From app/editor code:</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">store.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">toggleProfiler</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>From a renderer instance:</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">renderer.profiler.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">toggle</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">renderer.profiler.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">beginCapture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// render one or more frames</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> capture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> renderer.profiler.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">endCapture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> speedscopeJson</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> renderer.profiler.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">exportSpeedscope</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">renderer.profiler.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">downloadSpeedscope</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Detailed captures are for targeted debugging. Keep the normal HUD path lightweight and avoid enabling expensive capture work unless a user or developer explicitly asks for it.</p><h2 id="notes" tabindex="-1">Notes <a class="header-anchor" href="#notes" aria-label="Permalink to “Notes”">​</a></h2><ul><li>The profiler is designed to be safe when disabled: no timing calls or allocations should be added to hot paths unless <code>profiler.enabled</code> / <code>profiler.capturing</code> is active.</li><li>GPU timing depends on browser and hardware support for <code>EXT_disjoint_timer_query_webgl2</code>.</li><li>If GPU timing is unavailable, the HUD still reports CPU time, draw calls, phases, node counts, and cache status.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/renderer-profiler.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var renderer_profiler_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, renderer_profiler_default as default };
