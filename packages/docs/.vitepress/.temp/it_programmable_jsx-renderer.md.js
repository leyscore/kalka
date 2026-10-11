import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"Motore JSX\",\"description\":\"Creare design da JSX ed esportare una selezione in JSX con Tailwind.\",\"frontmatter\":{\"title\":\"Motore JSX\",\"description\":\"Creare design da JSX ed esportare una selezione in JSX con Tailwind.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Motore JSX — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Motore JSX — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Creare design da JSX ed esportare una selezione in JSX con Tailwind.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Creare design da JSX ed esportare una selezione in JSX con Tailwind.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Creare design da JSX ed esportare una selezione in JSX con Tailwind.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/jsx-renderer.md\",\"filePath\":\"it/programmable/jsx-renderer.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "it/programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="motore-jsx" tabindex="-1">Motore JSX <a class="header-anchor" href="#motore-jsx" aria-label="Permalink to “Motore JSX”">​</a></h1><p>OpenPencil converte JSX dichiarativo in un albero di design. Lo stesso sistema è disponibile nella chat AI, in MCP e in <code>eval</code>.</p><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> flex</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;col&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> gap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">24</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">320</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#ffffff&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> radius</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">18</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">weight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bold&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Card Title&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#667085&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Description&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><p>Nel codice dell’applicazione o nelle librerie headless, importa <code>Frame</code>, <code>Text</code> e gli altri export di scrittura da <code>@open-pencil/design-jsx</code>, poi crea i nodi con <code>renderTree</code> o <code>renderJSX</code> da <code>@open-pencil/core/design-jsx</code>, che aggiungono icone, conversione SVG e disposizione. Per scrivere gli alberi come TSX, imposta <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> con <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> in <code>tsconfig.json</code>, oppure aggiungi al file il commento <code>/** @jsxImportSource @open-pencil/design-jsx */</code>. L’ambiente di scripting determina quali API sono esposte a <code>eval</code>: gli export dei pacchetti non diventano automaticamente globali.</p><h2 id="elementi" tabindex="-1">Elementi <a class="header-anchor" href="#elementi" aria-label="Permalink to “Elementi”">​</a></h2><p><code>Frame</code>, <code>Text</code>, <code>Rectangle</code>, <code>Ellipse</code> e <code>Image</code> creano i rispettivi oggetti. I componenti registrati possono generare alberi riutilizzabili definiti dall’applicazione.</p><h2 id="disposizione" tabindex="-1">Disposizione <a class="header-anchor" href="#disposizione" aria-label="Permalink to “Disposizione”">​</a></h2><ul><li><code>flex=&quot;row&quot;</code> o <code>flex=&quot;col&quot;</code> attiva la disposizione automatica.</li><li><code>gap</code> regola la spaziatura.</li><li><code>p</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code> e <code>pl</code> regolano i margini interni.</li><li><code>align</code>, <code>justify</code> e <code>wrap</code> controllano allineamento e ritorno a capo.</li></ul><h2 id="dimensioni-e-aspetto" tabindex="-1">Dimensioni e aspetto <a class="header-anchor" href="#dimensioni-e-aspetto" aria-label="Permalink to “Dimensioni e aspetto”">​</a></h2><p><code>w</code> e <code>h</code> accettano numeri, <code>&quot;fill&quot;</code> o <code>&quot;hug&quot;</code>; <code>x</code> e <code>y</code> definiscono la posizione fuori dal flusso. <code>bg</code>, <code>fill</code>, <code>color</code>, <code>stroke</code>, <code>opacity</code>, <code>radius</code> e <code>shadow</code> controllano l’aspetto.</p><p>Le proprietà tipografiche come <code>size</code>, <code>font</code>, <code>weight</code>, <code>lineHeight</code> e <code>letterSpacing</code> mantengono il nome inglese perché fanno parte dell’API JSX.</p><h2 id="esportare-in-jsx" tabindex="-1">Esportare in JSX <a class="header-anchor" href="#esportare-in-jsx" aria-label="Permalink to “Esportare in JSX”">​</a></h2><p><strong>Copia come → JSX</strong> converte la selezione in JSX e classi Tailwind. L’output prova a conservare gerarchia, disposizione, dimensioni, colori, tipografia e bordi come punto di partenza per l’implementazione.</p><p>Il JSX esportato può essere modificato e renderizzato di nuovo nel documento. L’esportazione scrive livelli nascosti e bloccati, vincoli, limiti di dimensione, riempimenti multipli, sfumati e immagine, contorni, effetti, maschere e collegamenti alle variabili, quindi renderizzare un export li riproduce e <code>diff_jsx</code> mostra le modifiche a ciascuno di essi. Testo formattato con stili misti, tracciati vettoriali, griglie di layout, stili condivisi e definizioni delle proprietà dei componenti non vengono ancora scritti. Le istanze sono scritte come frame con il loro contenuto, così il JSX esportato è autonomo. Vedi <a href="./cli/exporting">esportazioni dalla CLI</a>.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
