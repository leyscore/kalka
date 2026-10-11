import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region fr/programmable/cli/exporting.md
var __pageData = JSON.parse("{\"title\":\"Exporter avec la CLI\",\"description\":\"Générer images, SVG, HTML, stories Storybook et autres sorties sans ouvrir l’éditeur.\",\"frontmatter\":{\"title\":\"Exporter avec la CLI\",\"description\":\"Générer images, SVG, HTML, stories Storybook et autres sorties sans ouvrir l’éditeur.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Exporter avec la CLI — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Exporter avec la CLI — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Générer images, SVG, HTML, stories Storybook et autres sorties sans ouvrir l’éditeur.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Générer images, SVG, HTML, stories Storybook et autres sorties sans ouvrir l’éditeur.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Générer images, SVG, HTML, stories Storybook et autres sorties sans ouvrir l’éditeur.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/cli/exporting.md\",\"filePath\":\"fr/programmable/cli/exporting.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "fr/programmable/cli/exporting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="exporter-avec-la-cli" tabindex="-1">Exporter avec la CLI <a class="header-anchor" href="#exporter-avec-la-cli" aria-label="Permalink to “Exporter avec la CLI”">​</a></h1><p><code>export</code> produit le rendu d’une page ou d’un objet depuis un fichier compatible.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> preview.png</span></span></code></pre></div><h2 id="choisir-le-contenu" tabindex="-1">Choisir le contenu <a class="header-anchor" href="#choisir-le-contenu" aria-label="Permalink to “Choisir le contenu”">​</a></h2><p>Les options de la commande permettent de sélectionner une page, un identifiant ou un objet trouvé. Le format est déduit de l’extension ou indiqué explicitement.</p><h2 id="echelle-et-dimensions" tabindex="-1">Échelle et dimensions <a class="header-anchor" href="#echelle-et-dimensions" aria-label="Permalink to “Échelle et dimensions”">​</a></h2><p>L’échelle contrôle la résolution. Une largeur ou une hauteur peut aussi être fixée ; les proportions sont conservées lorsqu’une seule dimension est fournie.</p><h2 id="svg" tabindex="-1">SVG <a class="header-anchor" href="#svg" aria-label="Permalink to “SVG”">​</a></h2><p>SVG préserve la géométrie vectorielle et convient aux icônes, à la revue et aux modifications ultérieures.</p><h2 id="html" tabindex="-1">HTML <a class="header-anchor" href="#html" aria-label="Permalink to “HTML”">​</a></h2><p>L’exportation HTML crée un document autonome avec la structure et les styles disponibles. Elle vise la transmission, l’inspection et les traitements ultérieurs, pas le remplacement à l’identique du rendu CanvasKit. Elle n’est disponible qu’en mode fichier.</p><h2 id="jsx-tailwind" tabindex="-1">JSX Tailwind <a class="header-anchor" href="#jsx-tailwind" aria-label="Permalink to “JSX Tailwind”">​</a></h2><p>Exportez en JSX avec des classes utilitaires Tailwind :</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">    # or: -f jsx --style tailwind</span></span></code></pre></div><h2 id="export-storybook" tabindex="-1">Export Storybook <a class="header-anchor" href="#export-storybook" aria-label="Permalink to “Export Storybook”">​</a></h2><p>Génère un fichier CSF3 <code>.stories.ts</code> par ensemble de composants ou par composant :</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                      # React stories in ./design-stories/</span></span>
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
	})}">  # re-export on every save</span></span>
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
	})}">    # stories next to each design</span></span></code></pre></div><h3 id="designs-a-cote-de-leurs-stories" tabindex="-1">Designs à côté de leurs stories <a class="header-anchor" href="#designs-a-cote-de-leurs-stories" aria-label="Permalink to “Designs à côté de leurs stories”">​</a></h3><p>Gardez le fichier de design de chaque composant dans le dossier du composant et exportez avec <code>--beside</code> : les stories, les images de design et le manifeste <code>.openpencil-stories.json</code> de chaque document vont dans le dossier de ce document, à côté du code du composant. Un glob <code>stories</code> de Storybook tel que <code>../src/**/*.stories.ts</code> dans <code>.storybook/main.ts</code> les prend alors en compte sans autre configuration.</p><p>Passez plusieurs documents, ou un glob entre guillemets tel que <code>&#39;src/**/*.pen&#39;</code> que OpenPencil développe lui-même (Node.js 22 ou version ultérieure). Plusieurs documents nécessitent <code>--beside</code> ou <code>--output</code> ; <code>--page</code> ne fonctionne qu’avec un seul document. Les documents sont exportés l’un après l’autre, et lorsqu’un export échoue, les autres sont tout de même exportés avant que la commande ne se termine par une erreur. <code>--watch</code> surveille tous les documents correspondants ; un document créé après le début de la surveillance nécessite une nouvelle exécution.</p><p>Chaque variante d’un ensemble de composants devient une story, et ses propriétés de variante deviennent des contrôles <code>select</code> : changer un contrôle affiche la variante correspondante. Les composants autonomes dont le nom contient des barres obliques, comme <code>Button/Primary</code> et <code>Button/Secondary</code>, sont regroupés dans un seul fichier <code>Button</code> avec un contrôle <code>Variant</code>. Une combinaison pour laquelle le design n’a pas de variante déclenche dans Storybook une erreur nommée au lieu d’afficher une autre variante.</p><p>Les stories affichent le composant en HTML avec des styles en ligne, comme <code>-f html</code>, et n’ont donc besoin d’aucun runtime OpenPencil ; <code>--framework</code> (<code>react</code>, <code>vue</code> ou <code>html</code>) ne change que l’enveloppe et l’import de <code>Meta</code>/<code>StoryObj</code> depuis <code>@storybook/react-vite</code>, <code>@storybook/vue3-vite</code> ou <code>@storybook/html-vite</code>. Le texte utilise les familles de polices du document, que Storybook doit charger lui-même. Les propriétés de texte, booléennes et d’échange d’instance ne sont pas encore exportées.</p><p>Les stories comportent des entrées <code>parameters.design</code> pour <a href="https://github.com/storybookjs/addon-designs" target="_blank" rel="noreferrer"><code>@storybook/addon-designs</code></a> :</p><ul><li><strong>OpenPencil :</strong> lorsque le chemin du document se trouve dans le répertoire courant, un <a href="./../index#url-scheme">lien <code>openpencil://</code></a> qui ouvre le document dans l’application de bureau et sélectionne la variante, ou son ensemble de composants lorsqu’un autre calque porte le même nom que la variante. Le schéma adresse les calques par nom : une story dont les noms de variante et de composant sont tous deux partagés par d’autres calques n’a donc pas de lien.</li><li><strong>Design :</strong> un PNG 2× de la variante, écrit dans <code>&lt;Name&gt;.design/</code> à côté de la story et référencé avec <code>new URL(…, import.meta.url)</code>, de sorte que Vite l’intègre. Copiez le paramètre sur la story de votre propre composant pour comparer l’implémentation au design. <code>--no-design-images</code> ignore le rendu ; la substitution de polices suit <code>--font-policy</code> comme pour l’export raster.</li></ul><p><code>-o</code> désigne le répertoire de sortie. Un manifeste <code>.openpencil-stories.json</code> y indique quel document, sous forme de chemin relatif au répertoire de sortie, et quelle page ont généré chaque story et chaque image de design ; versionnez-le avec les stories. Un export remplace les fichiers générés là par un export précédent du même document, y compris ceux de composants supprimés ou renommés depuis ; avec <code>--page</code>, seulement ceux de cette page. Il refuse, avant toute modification, d’écraser un autre fichier — une story écrite à la main, celle d’un autre document ou une image isolée. Un export d’une seule page dont les noms de fichiers se sont décalés sur les stories d’une autre page demande à la place un export complet. Sans le manifeste, les stories existantes sont considérées comme appartenant à quelqu’un d’autre : supprimez-les avant d’exporter de nouveau. <code>--watch</code> garde la commande active et réexporte à chaque enregistrement du document, afin que le rechargement à chaud de Storybook suive le design ; un enregistrement illisible est signalé et la surveillance continue. Un <code>--page</code> introuvable ou une substitution <code>--font-policy strict</code> met toujours fin à la commande.</p><h2 id="mode-application-en-direct" tabindex="-1">Mode application en direct <a class="header-anchor" href="#mode-application-en-direct" aria-label="Permalink to “Mode application en direct”">​</a></h2><p>Omettez le fichier pour exporter depuis l’application en cours d’exécution :</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                       # export the selection in the active document</span></span>
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
	})}">   # export every layer of a page</span></span>
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
	})}">           # export one layer, on any page</span></span></code></pre></div><p><code>--page</code> prend un nom de page et <code>--page-id</code> un identifiant de page issu de <code>openpencil documents list</code> ; l’un comme l’autre exporte cette page sans y basculer l’application. Ajoutez <code>--document-id</code> pour exporter depuis un document autre que le document actif.</p><p>Le mode application en direct prend en charge PNG, JPG, WEBP, SVG et PDF. Les exports PowerPoint, JSX, HTML, Storybook et <code>.fig</code> nécessitent un fichier en argument. L’export de vignettes en mode fichier n’est pas pris en charge pour l’instant.</p><h2 id="chemin-de-sortie" tabindex="-1">Chemin de sortie <a class="header-anchor" href="#chemin-de-sortie" aria-label="Permalink to “Chemin de sortie”">​</a></h2><p><code>-o</code> ou <code>--output</code> définit le chemin. La CLI signale les erreurs de format, les objets introuvables et les chemins invalides au lieu de produire silencieusement un résultat incomplet.</p><p>Consultez <code>bun open-pencil export --help</code> pour les formats et options de la version installée.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/cli/exporting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var exporting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, exporting_default as default };
