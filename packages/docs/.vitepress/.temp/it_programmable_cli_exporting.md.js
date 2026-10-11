import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region it/programmable/cli/exporting.md
var __pageData = JSON.parse("{\"title\":\"Esportare dalla CLI\",\"description\":\"Generare immagini, SVG, HTML, storie Storybook e altri output senza aprire l’editor.\",\"frontmatter\":{\"title\":\"Esportare dalla CLI\",\"description\":\"Generare immagini, SVG, HTML, storie Storybook e altri output senza aprire l’editor.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Esportare dalla CLI — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Esportare dalla CLI — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Generare immagini, SVG, HTML, storie Storybook e altri output senza aprire l’editor.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Generare immagini, SVG, HTML, storie Storybook e altri output senza aprire l’editor.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Generare immagini, SVG, HTML, storie Storybook e altri output senza aprire l’editor.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/cli/exporting.md\",\"filePath\":\"it/programmable/cli/exporting.md\",\"lastUpdated\":1791454432000}");
var _sfc_main = { name: "it/programmable/cli/exporting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="esportare-dalla-cli" tabindex="-1">Esportare dalla CLI <a class="header-anchor" href="#esportare-dalla-cli" aria-label="Permalink to “Esportare dalla CLI”">​</a></h1><p><code>export</code> produce il rendering di una pagina o di un oggetto da un file supportato.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> preview.png</span></span></code></pre></div><h2 id="scegliere-il-contenuto" tabindex="-1">Scegliere il contenuto <a class="header-anchor" href="#scegliere-il-contenuto" aria-label="Permalink to “Scegliere il contenuto”">​</a></h2><p>Le opzioni del comando selezionano pagina, identificatore o oggetto trovato. Il formato viene dedotto dall’estensione o indicato esplicitamente.</p><h2 id="scala-e-dimensioni" tabindex="-1">Scala e dimensioni <a class="header-anchor" href="#scala-e-dimensioni" aria-label="Permalink to “Scala e dimensioni”">​</a></h2><p>La scala controlla la risoluzione. È possibile fissare larghezza o altezza; le proporzioni vengono mantenute quando è fornita una sola dimensione.</p><h2 id="svg-e-html" tabindex="-1">SVG e HTML <a class="header-anchor" href="#svg-e-html" aria-label="Permalink to “SVG e HTML”">​</a></h2><p>SVG conserva la geometria vettoriale ed è adatto a icone, revisione e modifiche successive.</p><p>L’esportazione HTML crea un documento autonomo con struttura e stili disponibili. È pensata per consegna, ispezione ed elaborazioni successive, non come sostituto identico del rendering CanvasKit. È disponibile solo lavorando su file.</p><h2 id="tailwind-jsx" tabindex="-1">Tailwind JSX <a class="header-anchor" href="#tailwind-jsx" aria-label="Permalink to “Tailwind JSX”">​</a></h2><p>Per esportare JSX con classi di utilità Tailwind:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tailwind-jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # oppure: -f jsx --style tailwind</span></span></code></pre></div><h2 id="esportazione-storybook" tabindex="-1">Esportazione Storybook <a class="header-anchor" href="#esportazione-storybook" aria-label="Permalink to “Esportazione Storybook”">​</a></h2><p>Il formato <code>-f storybook</code> genera un file CSF3 <code>.stories.ts</code> per ogni set di componenti o componente:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                      # storie React in ./design-stories/</span></span>
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> vue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span></span>
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
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.pen</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # riesporta a ogni salvataggio</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;src/**/*.pen&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --beside</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # storie accanto a ogni design</span></span></code></pre></div><h3 id="design-accanto-alle-storie" tabindex="-1">Design accanto alle storie <a class="header-anchor" href="#design-accanto-alle-storie" aria-label="Permalink to “Design accanto alle storie”">​</a></h3><p>Tieni il file di design di ogni componente nella cartella del componente ed esporta con <code>--beside</code>: storie, immagini del design e manifest <code>.openpencil-stories.json</code> di ciascun documento finiscono nella cartella del documento stesso, accanto al codice del componente. Un glob <code>stories</code> di Storybook come <code>../src/**/*.stories.ts</code> in <code>.storybook/main.ts</code> le raccoglie senza altra configurazione.</p><p>Puoi passare più documenti, oppure un glob tra apici come <code>&#39;src/**/*.pen&#39;</code> che OpenPencil espande da solo (Node.js 22 o successivo). Più documenti richiedono <code>--beside</code> oppure <code>--output</code>; <code>--page</code> funziona solo con un documento. I documenti vengono esportati uno dopo l’altro e, se uno fallisce, gli altri vengono comunque esportati prima che il comando termini con un errore. <code>--watch</code> osserva tutti i documenti trovati; un documento creato dopo l’avvio dell’osservazione richiede una nuova esecuzione.</p><p>Ogni variante di un set di componenti diventa una storia e le sue proprietà di variante diventano controlli <code>select</code>, quindi cambiando un controllo si vede la variante corrispondente. Un set con un comportamento riceve invece le prop del controllo: uno Switch o una Checkbox un booleano <code>checked</code>, un Toggle <code>pressed</code>, un Collapsible <code>open</code> e <code>disabled</code> quando il set disegna uno stato disabilitato; hover, pressed e focus restano storie a sé. I componenti singoli con nomi separati da barre, come <code>Button/Primary</code> e <code>Button/Secondary</code>, sono raggruppati in un unico file <code>Button</code> con un controllo <code>Variant</code>. Una combinazione per cui il design non ha una variante genera in Storybook un errore con nome invece di mostrare un’altra variante.</p><p>Le storie renderizzano il componente come HTML con stili inline, come <code>-f html</code>, quindi non richiedono il runtime di OpenPencil; <code>--framework</code> (<code>react</code>, <code>vue</code> o <code>html</code>) cambia solo il wrapper e l’import di <code>Meta</code>/<code>StoryObj</code> da <code>@storybook/react-vite</code>, <code>@storybook/vue3-vite</code> o <code>@storybook/html-vite</code>. Il testo usa le famiglie di font del documento, che Storybook deve caricare per conto proprio. Le proprietà di testo, booleane e di sostituzione dell’istanza non vengono ancora esportate.</p><p>Con <code>--framework vue</code> o <code>--framework react</code>, un set di componenti il cui comportamento è un Button, Switch, Checkbox, Toggle o Collapsible diventa invece un componente vero: <code>&lt;Name&gt;.vue</code> basato su Reka UI, oppure <code>&lt;Name&gt;.tsx</code> con <code>&lt;Name&gt;.module.css</code> basato sul pacchetto <code>radix-ui</code> di Radix UI. Le sue varianti sono compilate in un foglio di stile che segue gli stati impostati da Reka e Radix (<code>data-state</code>, <code>data-disabled</code>, hover e focus), e ogni altra proprietà di variante è una prop che il componente imposta come attributo <code>data-*</code>. In Vue il suo valore è un <code>v-model</code> come <code>checked</code> o <code>open</code>; in React il componente accetta le prop della radice di Radix, come <code>checked</code>, <code>defaultChecked</code> e <code>onCheckedChange</code>. Le sue storie renderizzano il componente e una funzione play fa clic sul controllo e ne verifica lo stato, quindi il progetto Storybook ha bisogno di <code>reka-ui</code> o <code>radix-ui</code>.</p><p>Le storie includono voci <code>parameters.design</code> per <a href="https://github.com/storybookjs/addon-designs" target="_blank" rel="noreferrer"><code>@storybook/addon-designs</code></a>:</p><ul><li><strong>OpenPencil:</strong> quando il percorso del documento è dentro la cartella corrente, un <a href="./../index#url-scheme">link <code>openpencil://</code></a> che apre il documento nell’app desktop e seleziona la variante, o il suo set di componenti se un altro livello ha lo stesso nome della variante. Lo schema indirizza i livelli per nome, quindi una storia i cui nomi di variante e di componente sono entrambi condivisi con altri livelli non ottiene alcun link.</li><li><strong>Design:</strong> un PNG 2× della variante, scritto in <code>&lt;Name&gt;.design/</code> accanto alla storia e referenziato con <code>new URL(…, import.meta.url)</code>, così Vite lo include nel bundle. Copia il parametro sulla storia del tuo componente per confrontare l’implementazione con il design. <code>--no-design-images</code> salta il rendering; la sostituzione dei font segue <code>--font-policy</code> come nell’esportazione raster.</li></ul><p><code>-o</code> indica la cartella di output. Un manifest <code>.openpencil-stories.json</code> registra, con un percorso relativo alla cartella di output, quale documento e quale pagina hanno generato ogni storia e immagine; includilo nel commit insieme alle storie. Un’esportazione sostituisce i file generati da una precedente esportazione dello stesso documento, compresi quelli di componenti nel frattempo eliminati o rinominati; con <code>--page</code>, solo quelli di quella pagina. Prima di modificare qualsiasi cosa, rifiuta di sovrascrivere qualunque altro file: una storia scritta a mano, quella di un altro documento o un’immagine estranea. Un’esportazione di una sola pagina i cui nomi di file sono slittati su storie di un’altra pagina richiede invece un’esportazione completa. Senza il manifest, le storie esistenti sono considerate di qualcun altro, quindi rimuovile prima di esportare di nuovo. <code>--watch</code> mantiene il comando in esecuzione e riesporta a ogni salvataggio del documento, così l’hot reload di Storybook segue il design; un salvataggio che non può essere letto viene segnalato e l’osservazione continua. Una <code>--page</code> mancante o una sostituzione con <code>--font-policy strict</code> terminano comunque il comando.</p><h2 id="modalita-app-in-esecuzione" tabindex="-1">Modalità app in esecuzione <a class="header-anchor" href="#modalita-app-in-esecuzione" aria-label="Permalink to “Modalità app in esecuzione”">​</a></h2><p>Ometti il file per esportare dall’app in esecuzione:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                       # esporta la selezione del documento attivo</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # esporta ogni livello di una pagina</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1:23</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">           # esporta un livello, in qualsiasi pagina</span></span></code></pre></div><p><code>--page</code> accetta il nome di una pagina e <code>--page-id</code> l’ID di una pagina da <code>openpencil documents list</code>; entrambi esportano quella pagina senza portare l’app su di essa. Aggiungi <code>--document-id</code> per esportare da un documento diverso da quello attivo.</p><p>La modalità app supporta PNG, JPG, WEBP, SVG e PDF. Le esportazioni PowerPoint, JSX, HTML, Storybook e <code>.fig</code> richiedono un file. L’esportazione di miniature in modalità file non è attualmente supportata.</p><h2 id="percorso-di-output" tabindex="-1">Percorso di output <a class="header-anchor" href="#percorso-di-output" aria-label="Permalink to “Percorso di output”">​</a></h2><p><code>-o</code> o <code>--output</code> definisce il percorso. La CLI segnala formati errati, oggetti mancanti e percorsi non validi invece di produrre risultati parziali in silenzio.</p><p>Consulta <code>bun open-pencil export --help</code> per formati e opzioni disponibili.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/cli/exporting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var exporting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, exporting_default as default };
