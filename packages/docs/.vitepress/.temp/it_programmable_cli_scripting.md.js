import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Scripting\",\"description\":\"Eseguire JavaScript con un’API compatibile con i plugin Figma per interrogare, modificare e generare design.\",\"frontmatter\":{\"title\":\"Scripting\",\"description\":\"Eseguire JavaScript con un’API compatibile con i plugin Figma per interrogare, modificare e generare design.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Scripting — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Eseguire JavaScript con un’API compatibile con i plugin Figma per interrogare, modificare e generare design.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Eseguire JavaScript con un’API compatibile con i plugin Figma per interrogare, modificare e generare design.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Eseguire JavaScript con un’API compatibile con i plugin Figma per interrogare, modificare e generare design.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/cli/scripting.md\",\"filePath\":\"it/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "it/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="scripting" tabindex="-1">Scripting <a class="header-anchor" href="#scripting" aria-label="Permalink to “Scripting”">​</a></h1><p><code>openpencil eval</code> esegue JavaScript su un documento e fornisce un oggetto globale <code>figma</code>. È utile per modifiche in serie, ispezione, dati di test e automazione senza aprire l’interfaccia dell’editor.</p><h2 id="uso-di-base" tabindex="-1">Uso di base <a class="header-anchor" href="#uso-di-base" aria-label="Permalink to “Uso di base”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p><code>-c</code> accetta JavaScript. Se il codice non inizia con <code>return</code>, OpenPencil lo esegue in una funzione asincrona e restituisce l’eventuale risultato.</p><h2 id="interrogare-oggetti" tabindex="-1">Interrogare oggetti <a class="header-anchor" href="#interrogare-oggetti" aria-label="Permalink to “Interrogare oggetti”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.findAll((n) =&gt; n.type === &#39;FRAME&#39;)&quot;</span></span></code></pre></div><h2 id="modificare-e-salvare" tabindex="-1">Modificare e salvare <a class="header-anchor" href="#modificare-e-salvare" aria-label="Permalink to “Modificare e salvare”">​</a></h2><p><code>--write</code> o <code>-w</code> sovrascrive il file di input. <code>--output</code> o <code>-o</code> crea un altro file.</p><h2 id="script-da-stdin" tabindex="-1">Script da stdin <a class="header-anchor" href="#script-da-stdin" aria-label="Permalink to “Script da stdin”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> --write</span></span></code></pre></div><h2 id="documento-aperto" tabindex="-1">Documento aperto <a class="header-anchor" href="#documento-aperto" aria-label="Permalink to “Documento aperto”">​</a></h2><p>Ometti il percorso per eseguire lo script sul documento attivo nell’app desktop.</p><h2 id="output" tabindex="-1">Output <a class="header-anchor" href="#output" aria-label="Permalink to “Output”">​</a></h2><p>In un ambiente non interattivo, <code>eval</code> usa JSON per impostazione predefinita. <code>--json</code> lo forza e <code>--quiet</code> o <code>-q</code> nasconde l’output quando viene scritto solo un file.</p><h2 id="api-compatibile" tabindex="-1">API compatibile <a class="header-anchor" href="#api-compatibile" aria-label="Permalink to “API compatibile”">​</a></h2><p>L’API segue il modello di Figma Plugin API, ma opera su SceneGraph e sui formati OpenPencil. Copre documento, pagine, creazione di oggetti, operazioni sull’albero, componenti, variabili e proprietà comuni.</p><p>Gli identificatori esatti come <code>figma.currentPage</code>, <code>createFrame</code>, <code>appendChild</code>, <code>fills</code>, <code>fontSize</code>, <code>layoutMode</code> e <code>strokeWeight</code> restano invariati.</p><h2 id="limiti" tabindex="-1">Limiti <a class="header-anchor" href="#limiti" aria-label="Permalink to “Limiti”">​</a></h2><p>Non esistono ancora equivalenti completi per <code>node.exportAsync()</code>, <code>node.setBoundVariable()</code>, <code>figma.combineAsVariants()</code>, gli stili e tutte le operazioni booleane vettoriali.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
