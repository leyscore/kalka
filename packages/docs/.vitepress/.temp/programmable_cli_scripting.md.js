import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Scripting\",\"description\":\"Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.\",\"frontmatter\":{\"title\":\"Scripting\",\"description\":\"Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.\"}]]},\"headers\":[],\"relativePath\":\"programmable/cli/scripting.md\",\"filePath\":\"programmable/cli/scripting.md\",\"lastUpdated\":1791292985000}");
var _sfc_main = { name: "programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="scripting" tabindex="-1">Scripting <a class="header-anchor" href="#scripting" aria-label="Permalink to “Scripting”">​</a></h1><p><code>openpencil eval</code> runs JavaScript against an OpenPencil document with a Figma-compatible <code>figma</code> global. Use it for headless batch edits, inspection, fixture setup, and automation without opening the editor UI.</p><h2 id="basic-usage" tabindex="-1">Basic usage <a class="header-anchor" href="#basic-usage" aria-label="Permalink to “Basic usage”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p>The <code>-c</code> flag accepts JavaScript. Its last expression is the result, so <code>return</code> is optional; <code>await</code> works at the top level. A script whose last statement is not an expression, such as a declaration, has no result and prints nothing.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&quot;</span></span></code></pre></div><h2 id="query-nodes" tabindex="-1">Query nodes <a class="header-anchor" href="#query-nodes" aria-label="Permalink to “Query nodes”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">    .map((button) =&gt; ({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      id: button.id,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      name: button.name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      width: button.width,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      height: button.height</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="modify-and-save" tabindex="-1">Modify and save <a class="header-anchor" href="#modify-and-save" aria-label="Permalink to “Modify and save”">​</a></h2><p>Use <code>--write</code> / <code>-w</code> to write changes back to the input file:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">  figma.currentPage.children.forEach((node) =&gt; {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    node.opacity = 0.5</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --write</span></span></code></pre></div><p>Use <code>--output</code> / <code>-o</code> to write to a new file:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> updated.fig</span></span></code></pre></div><h2 id="read-scripts-from-stdin" tabindex="-1">Read scripts from stdin <a class="header-anchor" href="#read-scripts-from-stdin" aria-label="Permalink to “Read scripts from stdin”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> --write</span></span></code></pre></div><h2 id="live-app-mode" tabindex="-1">Live app mode <a class="header-anchor" href="#live-app-mode" aria-label="Permalink to “Live app mode”">​</a></h2><p>Omit the file path to run against the currently open document in the desktop app:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.name&quot;</span></span></code></pre></div><p>The desktop app must be running with a document open.</p><h2 id="output" tabindex="-1">Output <a class="header-anchor" href="#output" aria-label="Permalink to “Output”">​</a></h2><p>By default, non-TTY output is JSON. Use <code>--json</code> to force JSON output:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.map((n) =&gt; n.name)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --json</span></span></code></pre></div><p>Use <code>--quiet</code> / <code>-q</code> to suppress output when only writing a file.</p><h2 id="the-openpencil-api" tabindex="-1">The <code>openpencil</code> API <a class="header-anchor" href="#the-openpencil-api" aria-label="Permalink to “The openpencil API”">​</a></h2><p>Next to <code>figma</code>, scripts get <code>openpencil</code>: what OpenPencil adds to the Figma Plugin API, in the same style. The same global is available to the <code>eval</code> tool and the running app&#39;s automation.</p><p>A main component or component set can <a href="/user-guide/components#behaviours-and-preview">behave as a Reka UI control</a>. Bind it by its own property and slot names:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> -w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  const set = figma.currentPage.findOne((n) =&gt; n.type === &quot;COMPONENT_SET&quot; &amp;&amp; n.name === &quot;Switch&quot;)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  const behaviour = openpencil.setBehaviour(set, &quot;switch&quot;)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .bindValue(&quot;value&quot;, &quot;State&quot;)                          // On and Off guessed from the variants</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .bindPart(&quot;thumb&quot;, set.findOne((n) =&gt; n.name === &quot;Thumb&quot;)) // the frame becomes a slot</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  behaviour.states = &quot;Interaction&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  behaviour.missing</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;</span></span></code></pre></div><ul><li><code>openpencil.setBehaviour(node, kindOrSpec)</code> replaces a component&#39;s behaviour: a kind alone, or a spec such as <code>{ kind: &quot;slider&quot;, parts: { track: &quot;Track&quot;, thumb: &quot;Thumb&quot; }, numbers: { value: { min: 0, max: 10 } } }</code>. It returns the behaviour.</li><li><code>openpencil.getBehaviour(node)</code> reads one, or <code>null</code>; a variant reads its set&#39;s.</li><li>A behaviour has <code>kind</code>, <code>spec</code> (by name), <code>missing</code> (required values and parts still unbound), and <code>states</code>, and <code>bindValue(valueId, property, { on, off })</code>, <code>bindPart(partId, slotNameOrFrame)</code>, <code>setNumber(valueId, { min, max, step, default })</code>, and <code>remove()</code>.</li><li><code>openpencil.behaviourKinds</code> lists every kind with the values and parts it binds.</li><li><code>openpencil.createSlot(frame)</code> makes a frame of a main component a slot and returns its name.</li></ul><p>Names the component does not have fail with an error that lists the ones it has.</p><h2 id="supported-api-surface" tabindex="-1">Supported API surface <a class="header-anchor" href="#supported-api-surface" aria-label="Permalink to “Supported API surface”">​</a></h2><p>The API is intentionally close to Figma&#39;s Plugin API, but it maps to OpenPencil&#39;s scene graph and file format.</p><h3 id="document-and-pages" tabindex="-1">Document and pages <a class="header-anchor" href="#document-and-pages" aria-label="Permalink to “Document and pages”">​</a></h3><ul><li><code>figma.root</code></li><li><code>figma.currentPage</code></li><li><code>figma.currentPage.selection</code></li><li><code>figma.getNodeById(id)</code></li><li><code>figma.createPage()</code></li></ul><h3 id="node-creation" tabindex="-1">Node creation <a class="header-anchor" href="#node-creation" aria-label="Permalink to “Node creation”">​</a></h3><ul><li><code>figma.createFrame()</code></li><li><code>figma.createRectangle()</code></li><li><code>figma.createEllipse()</code></li><li><code>figma.createText()</code></li><li><code>figma.createLine()</code></li><li><code>figma.createPolygon()</code></li><li><code>figma.createStar()</code></li><li><code>figma.createVector()</code></li><li><code>figma.createComponent()</code></li><li><code>figma.createSection()</code></li></ul><h3 id="tree-operations" tabindex="-1">Tree operations <a class="header-anchor" href="#tree-operations" aria-label="Permalink to “Tree operations”">​</a></h3><ul><li><code>node.children</code></li><li><code>node.parent</code></li><li><code>node.appendChild(child)</code></li><li><code>node.insertChild(index, child)</code></li><li><code>node.clone()</code></li><li><code>node.remove()</code></li><li><code>node.findAll(callback?)</code></li><li><code>node.findOne(callback)</code></li><li><code>node.findChild(callback)</code></li><li><code>node.findChildren(callback?)</code></li><li><code>figma.group(nodes, parent)</code></li><li><code>figma.ungroup(node)</code></li></ul><h3 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to “Components”">​</a></h3><ul><li><code>figma.createComponentFromNode(node)</code></li><li><code>figma.combineAsVariants(components, parent)</code> — properties come from names such as <code>State=On, Size=Large</code></li><li><code>component.createInstance()</code></li><li><code>instance.mainComponent</code></li></ul><h3 id="variables" tabindex="-1">Variables <a class="header-anchor" href="#variables" aria-label="Permalink to “Variables”">​</a></h3><ul><li><code>figma.getLocalVariables(type?)</code></li><li><code>figma.getVariableById(id)</code></li><li><code>figma.getLocalVariableCollections()</code></li><li><code>figma.getVariableCollectionById(id)</code></li><li><code>figma.createVariable(name, type, collectionId, value?)</code></li><li><code>figma.setVariableValue(variableId, modeId, value)</code></li><li><code>figma.deleteVariable(id)</code></li><li><code>figma.createVariableCollection(name)</code></li><li><code>figma.deleteVariableCollection(id)</code></li><li><code>figma.bindVariable(nodeId, field, variableId)</code></li><li><code>figma.unbindVariable(nodeId, field)</code></li></ul><h3 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to “Properties”">​</a></h3><p>Common node properties are readable/writable through the proxy, including:</p><ul><li>Geometry: <code>x</code>, <code>y</code>, <code>width</code>, <code>height</code>, <code>rotation</code>, <code>resize(width, height)</code></li><li>Appearance: <code>fills</code>, <code>strokes</code>, <code>effects</code>, <code>opacity</code>, <code>visible</code>, <code>locked</code>, <code>blendMode</code>, <code>clipsContent</code></li><li>Radius: <code>cornerRadius</code>, <code>topLeftRadius</code>, <code>topRightRadius</code>, <code>bottomRightRadius</code>, <code>bottomLeftRadius</code></li><li>Text: <code>characters</code>, <code>fontSize</code>, <code>fontName</code>, <code>fontWeight</code>, alignment, line height, letter spacing, style-run helpers</li><li>Auto-layout: <code>layoutMode</code>, <code>primaryAxisAlignItems</code>, <code>counterAxisAlignItems</code>, <code>itemSpacing</code>, padding, sizing, and layout positioning fields</li><li>Stroke helpers: <code>strokeWeight</code>, <code>strokeAlign</code>, <code>dashPattern</code></li></ul><h3 id="utilities" tabindex="-1">Utilities <a class="header-anchor" href="#utilities" aria-label="Permalink to “Utilities”">​</a></h3><ul><li><code>figma.mixed</code></li><li><code>figma.createImage(data)</code></li><li><code>figma.loadFontAsync(fontName)</code> no-ops because OpenPencil does not gate text edits on plugin font loading</li><li><code>figma.listAvailableFontsAsync()</code> returns host-provided fonts when available</li><li><code>figma.getNodeByIdAsync(id)</code> and <code>instance.getMainComponentAsync()</code> resolve to the same nodes as <code>figma.getNodeById(id)</code> and <code>instance.mainComponent</code>, for scripts written for Figma&#39;s dynamic-page mode</li><li><code>figma.notify(message)</code> logs a warning in headless mode</li><li><code>instance.swapComponent(component)</code> points an instance at another component</li><li><code>component.createSlot()</code> adds a slot frame and its <code>SLOT</code> property; slot frames read <code>type: &#39;SLOT&#39;</code>, <code>resetSlot()</code> brings back an instance slot&#39;s component content, and <code>limitViolations</code> lists the limits an instance slot breaks. <code>addComponentProperty</code> and <code>editComponentProperty</code> take a <code>description</code> and, for slots, <code>slotSettings</code></li><li><code>figma.viewport</code></li></ul><h2 id="not-yet-figma-compatible" tabindex="-1">Not yet Figma-compatible <a class="header-anchor" href="#not-yet-figma-compatible" aria-label="Permalink to “Not yet Figma-compatible”">​</a></h2><p>These Figma APIs are not exposed as compatible helpers yet:</p><ul><li><code>node.exportAsync()</code></li><li><code>node.setBoundVariable(field, variable)</code></li><li><code>figma.combineAsVariants(components, parent)</code></li><li>Figma style APIs such as <code>figma.createPaintStyle()</code> / <code>figma.createTextStyle()</code></li><li>Full vector boolean operation parity</li></ul><p>Use OpenPencil CLI export commands, core tools, or direct scene-graph helpers where available.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
