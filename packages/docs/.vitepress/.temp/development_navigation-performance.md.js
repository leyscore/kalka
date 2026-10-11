import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/navigation-performance.md
var __pageData = JSON.parse("{\"title\":\"Navigation performance benchmark\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/navigation-performance\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/navigation-performance\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/navigation-performance\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/navigation-performance\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Navigation performance benchmark — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Navigation performance benchmark — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"development/navigation-performance.md\",\"filePath\":\"development/navigation-performance.md\",\"lastUpdated\":1790730031000}");
var _sfc_main = { name: "development/navigation-performance.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="navigation-performance-benchmark" tabindex="-1">Navigation performance benchmark <a class="header-anchor" href="#navigation-performance-benchmark" aria-label="Permalink to “Navigation performance benchmark”">​</a></h1><p>The navigation benchmark measures the complete wheel/trackpad-to-render pipeline. It is intentionally separate from the synchronous microbenchmark in <code>tests/e2e/viewport/zoom-pan.spec.ts</code>: accepting JavaScript calls quickly does not prove smooth navigation.</p><h2 id="renderer-lifecycle-and-ownership" tabindex="-1">Renderer lifecycle and ownership <a class="header-anchor" href="#renderer-lifecycle-and-ownership" aria-label="Permalink to “Renderer lifecycle and ownership”">​</a></h2><p>The benchmark validates the retained and tiled renderer contracts documented in <a href="./renderer-lifecycle">Renderer lifecycle and ownership</a>. Structural renderer changes must preserve those generation, settlement, and CanvasKit ownership rules.</p><h2 id="what-it-captures" tabindex="-1">What it captures <a class="header-anchor" href="#what-it-captures" aria-label="Permalink to “What it captures”">​</a></h2><p>Every run writes <code>recording.json</code>, <code>metrics.json</code>, and <code>environment.json</code>. When tracing is enabled, it also writes <code>trace.json.gz</code>:</p><ul><li><code>trace.json.gz</code> (when tracing is enabled): Chromium tracing data for Perfetto or Chrome tracing tools.</li><li><code>recording.json</code>: wheel samples plus OpenPencil input, viewport, render, and retained-backing events.</li><li><code>metrics.json</code>: frame pacing, input latency, zoom-anchor drift, viewport jumps, exact active-renderer settlement, and tiled scheduler throughput/cancellation when enabled.</li><li><code>environment.json</code>: browser, runtime, replay mode, and source gesture information.</li></ul><p>OpenPencil emits User Timing marks under <code>openpencil:*</code>, including wheel receipt/flush, viewport mutation, render start/end, backing preview/build, crisp-backing completion, and exact tiled coverage. The recording also runs a continuous <code>requestAnimationFrame</code> heartbeat and observes browser Long Tasks, so display stalls remain visible even when OpenPencil does not render.</p><h2 id="record-a-physical-macos-trackpad-gesture" tabindex="-1">Record a physical macOS trackpad gesture <a class="header-anchor" href="#record-a-physical-macos-trackpad-gesture" aria-label="Permalink to “Record a physical macOS trackpad gesture”">​</a></h2><ol><li><p>Start a production preview (preferred) or development server:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> build</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> preview</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --port</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1420</span></span></code></pre></div></li><li><p>Open:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>http://localhost:1420/?test&amp;no-chrome&amp;no-rulers&amp;navigation-benchmark</span></span></code></pre></div></li><li><p>In DevTools, start recording:</p><div class="language-js"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">openPencil.test.navigation.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">startRecording</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;macbook-fast-pinch-reversal&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div></li><li><p>Perform exactly one gesture, allow the canvas to become crisp, then stop and copy the result:</p><div class="language-js"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">copy</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">JSON</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">stringify</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(openPencil.test.navigation.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">stopRecording</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(), </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">))</span></span></code></pre></div></li><li><p>Save the result under <code>tests/fixtures/navigation/gestures/</code>. Do not edit delta values or timestamps. Remove document names if they contain private information.</p></li></ol><p>Record at least slow pan, momentum pan, direction reversal, slow pinch, fast pinch in/out, pinch reversal, diagonal pan, and the personally observed failing gesture. Recordings from actual hardware must use <code>source: &quot;macos-trackpad&quot;</code>; generated fixtures use <code>source: &quot;synthetic&quot;</code>.</p><h2 id="benchmark-a-real-fig-fixture" tabindex="-1">Benchmark a real <code>.fig</code> fixture <a class="header-anchor" href="#benchmark-a-real-fig-fixture" aria-label="Permalink to “Benchmark a real .fig fixture”">​</a></h2><p>Use <code>current-document</code> with an explicit browser-served fixture path. The runner waits for loading and page population, applies layout through the normal document-open path, zooms to fit, and waits on the active renderer&#39;s explicit settlement contract before recording:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> benchmark:navigation</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --url</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:1420/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --gesture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tests/fixtures/navigation/gestures/synthetic-pinch-reversal.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --mode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dom</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --scenario</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> current-document</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --document</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tests/fixtures/gold-preview.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --no-trace</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --output</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/gold-preview</span></span></code></pre></div><p><code>environment.json</code> records the resolved local document path so reports cannot silently mix generated and real-document runs. The runner serves the exact local bytes through an isolated Playwright route, so production Vite preview does not return its SPA fallback for non-public test fixtures.</p><h2 id="replay-with-chromium-tracing" tabindex="-1">Replay with Chromium tracing <a class="header-anchor" href="#replay-with-chromium-tracing" aria-label="Permalink to “Replay with Chromium tracing”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> benchmark:navigation</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --url</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:1420/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --gesture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tests/fixtures/navigation/gestures/synthetic-pinch-reversal.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --mode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> cdp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --scenario</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> raster-stress</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --output</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/current</span></span></code></pre></div><p><code>--mode cdp</code> sends browser input through the Chrome DevTools Protocol. <code>--mode dom</code> deterministically dispatches events inside the page and is useful for scheduler/correctness debugging. Neither mode is represented as physical WKWebView input.</p><p>Use <code>--no-trace</code> for the lowest-overhead metrics pass. Run a separate diagnostic pass with tracing enabled, and add <code>--cpu-profile</code> only when stack sampling is needed: CPU profiling can perturb the timing being measured.</p><p>Performance runs require a hardware-accelerated Metal/ANGLE context and fail if Chromium falls back to SwiftShader. Use <code>--software-gpu</code> only for portable correctness and CI smoke runs; never compare its timings with hardware results. Every run records the unmasked GL renderer and vendor in <code>environment.json</code>.</p><p>Open the trace:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">open</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> https://ui.perfetto.dev</span></span></code></pre></div><p>Then load <code>trace.json.gz</code> and search for <code>openpencil:</code>.</p><h2 id="baseline-comparison" tabindex="-1">Baseline comparison <a class="header-anchor" href="#baseline-comparison" aria-label="Permalink to “Baseline comparison”">​</a></h2><p>Build and run the same gesture against <code>v0.14.0</code> and the candidate in separate clean worktrees, on the same machine and power state. Alternate baseline/candidate runs rather than completing every baseline run first. Use release builds, fixed 1280×800 CSS viewport and DPR 2, and at least five measured repetitions after one warmup.</p><p>Do not gate shared CI on absolute timing. Dedicated benchmark hardware may gate on same-run baseline ratios and correctness invariants. Always retain raw traces for regressions.</p><p>Compare two completed runs:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tools/dev/navigation-benchmark/src/cli.ts</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> compare</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --baseline</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/v0.14.0/metrics.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --candidate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/current/metrics.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --output</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/comparison.json</span></span></code></pre></div><h2 id="metrics" tabindex="-1">Metrics <a class="header-anchor" href="#metrics" aria-label="Permalink to “Metrics”">​</a></h2><p>The report includes:</p><ul><li>Frame interval median, p95, p99, maximum, and counts over 8.33/16.67/33.33/50 ms.</li><li>Render CPU interval and CanvasKit flush timing.</li><li>Wheel-to-viewport and wheel-to-render-end latency.</li><li>Maximum zoom focal-point drift in screen pixels.</li><li>Maximum presented viewport displacement between rendered frames.</li><li>Final input to exact active-renderer settlement: crisp retained backing for the existing renderer or exact visible tile coverage for tiled mode.</li><li>Tiled scheduler frame count, maximum jobs per frame, maximum measured job submission, over-budget jobs, deadline overrun, and cancelled obsolete jobs.</li></ul><p>The runner contains no warmup or settlement sleeps. <code>waitForSettlement()</code> requires an idle navigation lifecycle and renderer-owned exact coverage; its timeout rejects the benchmark and reports renderer state.</p><h3 id="benchmark-content-mutation-and-cancellation" tabindex="-1">Benchmark content mutation and cancellation <a class="header-anchor" href="#benchmark-content-mutation-and-cancellation" aria-label="Permalink to “Benchmark content mutation and cancellation”">​</a></h3><p>Use the exact imported node ID plus a deterministic property mutation to measure selective refresh:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> benchmark:navigation</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --url</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;http://localhost:1420/?renderer=tiled&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --gesture</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tests/fixtures/navigation/gestures/synthetic-repeated-pinch-reversal.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --mode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dom</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --scenario</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> current-document</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --document</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tests/fixtures/gold-preview.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --mutate-node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;0:5&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --mutate-opacity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0.11</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --no-trace</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  --output</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> artifacts/navigation-benchmark/gold-preview-mutation</span></span></code></pre></div><p>Add <code>--replay-after-mutation</code> to wait until refresh is observably pending and then replay the gesture before exact settlement. This measures generation cancellation and final-viewport prioritization without a fixed delay.</p><p>Mutation-only and combined runs record their mutation parameters in <code>environment.json</code>. For tiled runs, inspect <code>scheduler.cancelledJobs</code>, <code>maximumJobsPerFrame</code>, <code>maximumJobRenderMs</code>, <code>overBudgetJobs</code>, and <code>maximumDeadlineOverrunMs</code>.</p><p>Averages alone are not acceptance criteria. Inspect p95/p99, maximum stalls, contiguous missed frames, motion discontinuities, and crisp-settlement latency.</p><h2 id="required-fixture-matrix" tabindex="-1">Required fixture matrix <a class="header-anchor" href="#required-fixture-matrix" aria-label="Permalink to “Required fixture matrix”">​</a></h2><p>Permanent benchmark scenarios should cover:</p><ul><li><strong>Light:</strong> isolates input and scheduling overhead.</li><li><strong>Large flat:</strong> stresses culling and traversal.</li><li><strong>Realistic:</strong> nested frames, text, images, gradients, effects, masks, and instances.</li><li><strong>Raster stress:</strong> expensive retained-backing creation and coverage changes.</li><li><strong>Imported <code>.fig</code>:</strong> exercises imported-document rendering paths.</li></ul><p>Keep large or binary <code>.fig</code> fixtures in Git LFS. Synthetic fixture generation must be deterministic.</p><h2 id="native-macos-acceptance" tabindex="-1">Native macOS acceptance <a class="header-anchor" href="#native-macos-acceptance" aria-label="Permalink to “Native macOS acceptance”">​</a></h2><p>Chromium replay does not establish WKWebView or physical trackpad behavior. Before a release with navigation changes:</p><ol><li>Build a release-mode Tauri application.</li><li>Record the same gesture on physical target hardware.</li><li>Capture Instruments <strong>Time Profiler</strong> and <strong>Core Animation</strong> traces, including OpenPencil and WebKit processes.</li><li>Check input delivery, main-thread/WASM work, GPU/compositor stalls, viewport continuity, and final crisp settlement.</li><li>Store the recording, metrics, hardware/macOS metadata, and Instruments trace as release artifacts.</li></ol><p>Native automation may add OS-level scroll injection, but it must preserve continuous-scroll and momentum phases before being called trackpad-equivalent. Synthetic composition or DOM wheel events are not native acceptance evidence.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/navigation-performance.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var navigation_performance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, navigation_performance_default as default };
