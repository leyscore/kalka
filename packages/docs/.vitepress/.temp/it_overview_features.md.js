import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/overview/features.md
var __pageData = JSON.parse("{\"title\":\"Funzionalità\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Funzionalità — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Funzionalità — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"it/overview/features.md\",\"filePath\":\"it/overview/features.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "it/overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="funzionalita" tabindex="-1">Funzionalità <a class="header-anchor" href="#funzionalita" aria-label="Permalink to “Funzionalità”">​</a></h1><h2 id="file-figma" tabindex="-1">File Figma <a class="header-anchor" href="#file-figma" aria-label="Permalink to “File Figma”">​</a></h2><p>OpenPencil apre e salva direttamente i file <code>.fig</code>. Import ed export usano lo stesso codec binario Kiwi di Figma: 194 definizioni dello schema e circa 390 campi per ogni nodo. Salva con <kbd>⌘</kbd><kbd>S</kbd> e salva con nome con <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Copia e incolla con Figma:</strong> seleziona gli oggetti in Figma, premi <kbd>⌘</kbd><kbd>C</kbd>, passa a OpenPencil e premi <kbd>⌘</kbd><kbd>V</kbd>. Riempimenti, contorni, disposizione automatica, testo, effetti, raggi degli angoli e reti vettoriali vengono conservati in entrambe le direzioni.</p><h2 id="disegno-e-modifica" tabindex="-1">Disegno e modifica <a class="header-anchor" href="#disegno-e-modifica" aria-label="Permalink to “Disegno e modifica”">​</a></h2><ul><li><strong>Forme:</strong> rettangolo (<kbd>R</kbd>), ellisse (<kbd>O</kbd>), linea (<kbd>L</kbd>), poligono e stella.</li><li><strong>Penna:</strong> reti vettoriali, curve di Bézier e maniglie tangenti.</li><li><strong>Testo:</strong> modifica diretta nel canvas e supporto IME.</li><li><strong>Testo formattato:</strong> grassetto, corsivo, sottolineato e barrato su intervalli di caratteri.</li><li><strong>Disposizione automatica:</strong> Flexbox e CSS Grid tramite Yoga WASM, con direzione, intervallo, rientri, allineamento, dimensionamento e tracce della griglia.</li><li><strong>Componenti:</strong> creazione di componenti e set, istanze, override e sincronizzazione automatica.</li><li><strong>Variabili:</strong> token di design con collezioni, modalità Light/Dark, tipi Color/Float/String/Boolean e collegamenti.</li><li><strong>Sezioni:</strong> contenitori di primo livello che integrano gli oggetti sovrapposti.</li></ul><h2 id="pannello-proprieta" tabindex="-1">Pannello Proprietà <a class="header-anchor" href="#pannello-proprieta" aria-label="Permalink to “Pannello Proprietà”">​</a></h2><p>Le schede Design, Codice, AI e Verifica cambiano in base alla selezione.</p><ul><li><strong>Aspetto:</strong> opacità, raggio comune o per angolo e visibilità.</li><li><strong>Riempimento:</strong> colore solido, gradienti lineare, radiale, angolare e diamante, immagini.</li><li><strong>Contorno:</strong> colore, spessore, allineamento, spessore per lato, estremità, giunzioni e tratteggio.</li><li><strong>Effetti:</strong> ombra esterna e interna, sfocatura del livello, dello sfondo e del primo piano.</li><li><strong>Tipografia:</strong> scelta del font con ricerca e scorrimento virtuale, stile, dimensione, allineamento e formattazione.</li><li><strong>Layout:</strong> impostazioni della disposizione automatica.</li><li><strong>Export:</strong> scala, PNG/JPG/WEBP/SVG e anteprima.</li><li><strong>Codice:</strong> Design JSX e Tailwind JSX per la selezione, con modifica bidirezionale in tempo reale del Design JSX che aggiorna il codice al variare dei livelli; l’elemento sotto il cursore evidenzia il proprio livello nell’area di lavoro e i problemi di design sono sottolineati sulla proprietà che li causa.</li><li><strong>Verifica:</strong> controllo di design in tempo reale per la pagina o la selezione (contrasto basso, aree di tocco piccole, colori non collegati, spaziature fuori scala), con indicatori dei problemi nell’area di lavoro e collegamento alle variabili con un clic (<a href="/user-guide/checking-designs">Controllare i design</a>).</li></ul><h2 id="rendering" tabindex="-1">Rendering <a class="header-anchor" href="#rendering" aria-label="Permalink to “Rendering”">​</a></h2><p>OpenPencil usa Skia tramite CanvasKit WASM, lo stesso motore grafico di Figma:</p><ul><li>gradienti lineari, radiali, angolari e a diamante;</li><li>riempimenti immagine con diverse modalità di scala;</li><li>cache degli effetti per oggetto;</li><li>archi, ellissi parziali e anelli;</li><li>esclusione degli oggetti fuori dalla vista e riuso delle vernici;</li><li>guide di aggancio che considerano la rotazione;</li><li>righelli con intervallo della selezione;</li><li>evidenziazione al passaggio sulla geometria reale.</li></ul><h2 id="annulla-e-ripristina" tabindex="-1">Annulla e ripristina <a class="header-anchor" href="#annulla-e-ripristina" aria-label="Permalink to “Annulla e ripristina”">​</a></h2><p>È possibile annullare creazione, eliminazione, spostamento, ridimensionamento, modifica delle proprietà e del genitore, disposizione e variabili. Scorciatoie: <kbd>⌘</kbd><kbd>Z</kbd> e <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="piu-pagine-e-documenti" tabindex="-1">Più pagine e documenti <a class="header-anchor" href="#piu-pagine-e-documenti" aria-label="Permalink to “Più pagine e documenti”">​</a></h2><p>Le pagine possono essere create, eliminate e rinominate e conservano posizione e scala proprie. Più documenti possono essere aperti in schede.</p><h2 id="export" tabindex="-1">Export <a class="header-anchor" href="#export" aria-label="Permalink to “Export”">​</a></h2><ul><li><strong>Immagini:</strong> PNG, JPG e WEBP da 0,5× a 4×.</li><li><strong>SVG:</strong> forme, testo con intervalli di stile, gradienti, effetti e metodi di fusione.</li><li><strong>Tailwind JSX:</strong> HTML con classi Tailwind v4 per React o Vue.</li><li><strong>Copia come:</strong> testo, SVG, PNG o JSX dal menu contestuale.</li></ul><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --style</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span></span></code></pre></div><h2 id="chat-ai" tabindex="-1">Chat AI <a class="header-anchor" href="#chat-ai" aria-label="Permalink to “Chat AI”">​</a></h2><p>Premi <kbd>⌘</kbd><kbd>J</kbd>. Più di 90 strumenti creano forme, cambiano stili e disposizione, lavorano con componenti e variabili, eseguono operazioni booleane, analizzano token di design ed esportano risorse. Sono supportati Anthropic, OpenAI, Google AI, OpenRouter ed endpoint compatibili.</p><p>Le chiamate degli strumenti appaiono in una sequenza comprimibile. Per la verifica visiva, l’assistente renderizza il risultato e lo confronta con la richiesta. Tutte le modifiche AI possono essere annullate.</p><h2 id="server-mcp" tabindex="-1">Server MCP <a class="header-anchor" href="#server-mcp" aria-label="Permalink to “Server MCP”">​</a></h2><p>Claude Code, Cursor, Windsurf e altri client MCP possono leggere e modificare <code>.fig</code> senza interfaccia. Sono disponibili più di 90 strumenti e i trasporti stdio e HTTP.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">              # Albero degli oggetti</span></span>
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
	})}">  # Ricerca</span></span>
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
	})}">     # Esporta</span></span>
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
	})}">    # Analisi colori</span></span>
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
	})}">  # Strutture ripetute</span></span>
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
	})}">     # Figma Plugin API</span></span></code></pre></div><p>Tutti i comandi supportano <code>--json</code>. Installazione: <code>npm install -g @open-pencil/cli</code> oppure <code>bun add -g @open-pencil/cli</code>.</p><h2 id="collaborazione-in-tempo-reale" tabindex="-1">Collaborazione in tempo reale <a class="header-anchor" href="#collaborazione-in-tempo-reale" aria-label="Permalink to “Collaborazione in tempo reale”">​</a></h2><p>La connessione peer-to-peer WebRTC non richiede un server centrale. Condividi un link e modifica il documento insieme agli altri partecipanti, con cursori, presenza e modalità di seguito.</p><h2 id="desktop-e-web" tabindex="-1">Desktop e Web <a class="header-anchor" href="#desktop-e-web" aria-label="Permalink to “Desktop e Web”">​</a></h2><p><strong>Desktop:</strong> Tauri v2, circa 7 MB, per macOS, Windows e Linux, con menu nativi, uso senza rete e salvataggio automatico.</p><p><strong>Web:</strong> <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, installabile come PWA e adattato agli schermi touch.</p><h2 id="caricamento-alternativo-da-google-fonts" tabindex="-1">Caricamento alternativo da Google Fonts <a class="header-anchor" href="#caricamento-alternativo-da-google-fonts" aria-label="Permalink to “Caricamento alternativo da Google Fonts”">​</a></h2><p>Se un font non è disponibile localmente, OpenPencil lo scarica automaticamente da Google Fonts. Non è necessaria l’installazione manuale.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
