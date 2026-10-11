import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region development/fig-reader.md
var __pageData = JSON.parse("{\"title\":\".fig Reader Architecture\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/development/fig-reader\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/development/fig-reader\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/development/fig-reader\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/development/fig-reader\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\".fig Reader Architecture — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\".fig Reader Architecture — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"development/fig-reader.md\",\"filePath\":\"development/fig-reader.md\",\"lastUpdated\":1790839227000}");
var _sfc_main = { name: "development/fig-reader.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="fig-reader-architecture" tabindex="-1">.fig Reader Architecture <a class="header-anchor" href="#fig-reader-architecture" aria-label="Permalink to “.fig Reader Architecture”">​</a></h1><p>The reader interprets Figma source records into independently editable scene occurrences. One reader serves the application, CLI, MCP, and worker paths; the earlier importer and its repair pipeline are gone.</p><div class="warning custom-block"><p class="custom-block-title">Implementation status</p><p>The reader is the only import path: synchronous parsing, the document worker, page population, recovery, export, and clipboard paste all use it, and the previous importer is removed. Corpus-wide fidelity (export still reassigns node identities and drops some raw text metadata) and performance acceptance remain unfinished. The diagram describes responsibilities, not a claim of complete Figma parity.</p></div><div class="language-mermaid"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">flowchart</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> TD</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Archive</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">FIG archive and resources</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> --&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Sources</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Indexed source records</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Sources </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Closure</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Selected pages and component dependencies</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Closure </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Evaluation</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Occurrence evaluation and provenance</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Evaluation </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Graph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Editable SceneGraph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Graph </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Sessions</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Page sessions and recovery</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Graph </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Editor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Editor actions and undo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Editor </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">FIG export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  Export </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">--&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}"> Oracle</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Figma reopen and visual validation</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">]</span></span></code></pre></div><h2 id="key-distinctions" tabindex="-1">Key distinctions <a class="header-anchor" href="#key-distinctions" aria-label="Permalink to “Key distinctions”">​</a></h2><ul><li>A <strong>source record</strong> identifies an archive node; an <strong>occurrence</strong> identifies one use of it.</li><li>An <strong>owner</strong> establishes the component scope for an override <strong>claim</strong>.</li><li>An effective value is not enough to determine whether it is inherited or overridden.</li><li>Saved appearance, editable layout, and exported-file fidelity are separate contracts.</li></ul><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>                         Inherited default       Explicit equal value</span></span>
<span class="line"><span>Initial text             &quot;Badge&quot;                 &quot;Badge&quot;</span></span>
<span class="line"><span>Component changes        &quot;Updated&quot;               &quot;Updated&quot;</span></span>
<span class="line"><span>Instance result          &quot;Updated&quot;               &quot;Badge&quot;</span></span></code></pre></div><h2 id="package-documentation" tabindex="-1">Package documentation <a class="header-anchor" href="#package-documentation" aria-label="Permalink to “Package documentation”">​</a></h2><p>The canonical implementation documentation lives alongside the package in <a href="https://github.com/open-pencil/open-pencil/tree/master/packages/fig/docs" target="_blank" rel="noreferrer"><code>packages/fig/docs</code></a>. This page is the development-site entry point, not a second copy of those contracts.</p><p>Read in order:</p><ol><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/architecture.md" target="_blank" rel="noreferrer">Architecture and ownership</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/source-model.md" target="_blank" rel="noreferrer">Source model and identities</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/instance-evaluation.md" target="_blank" rel="noreferrer">Instance evaluation and precedence</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/materialization.md" target="_blank" rel="noreferrer">SceneGraph materialization</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/document-sessions.md" target="_blank" rel="noreferrer">Document sessions, rollback, and recovery</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/export.md" target="_blank" rel="noreferrer">Export contracts</a></li><li><a href="https://github.com/open-pencil/open-pencil/blob/master/packages/fig/docs/validation.md" target="_blank" rel="noreferrer">Validation and oracle methodology</a></li></ol><p>See also <a href="./architecture">system architecture</a>, <a href="./testing">testing</a>, and the <a href="./roadmap">development roadmap</a>. Fixture provenance belongs next to fixtures; individual benchmark runs and temporary oracle results do not belong in architecture documentation.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("development/fig-reader.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var fig_reader_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, fig_reader_default as default };
