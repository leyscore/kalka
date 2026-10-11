import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region it/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Crea editor basati su OpenPencil con componenti senza stile e composable per Vue.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Crea editor basati su OpenPencil con componenti senza stile e composable per Vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"it_IT\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Crea editor basati su OpenPencil con componenti senza stile e composable per Vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Crea editor basati su OpenPencil con componenti senza stile e composable per Vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Crea editor basati su OpenPencil con componenti senza stile e composable per Vue.\"}]]},\"headers\":[],\"relativePath\":\"it/programmable/sdk/index.md\",\"filePath\":\"it/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "it/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p><code>@open-pencil/vue</code> permette di utilizzare OpenPencil non solo come applicazione di design autonoma.</p><p>Puoi integrare OpenPencil in altri prodotti, strumenti interni o editor specializzati senza adottare l&#39;interfaccia predefinita dell&#39;applicazione.</p><p>L’app OpenPencil è soltanto una delle interfacce realizzate con questo insieme di strumenti. L’SDK permette di crearne una personalizzata.</p><p>L&#39;SDK fornisce:</p><ul><li>il contesto dell&#39;editor tramite la dependency injection di Vue;</li><li>il rendering dell&#39;area di lavoro con CanvasKit;</li><li>composable per selezione, comandi, menu, pannelli delle proprietà e variabili;</li><li>componenti strutturali senza stile come <code>PageListRoot</code>, <code>PropertyListRoot</code> e <code>ToolbarRoot</code>;</li><li>la localizzazione di menu, pannelli e finestre di dialogo, oltre ai componenti per selezionare la lingua.</li></ul><h2 id="da-dove-iniziare" tabindex="-1">Da dove iniziare <a class="header-anchor" href="#da-dove-iniziare" aria-label="Permalink to “Da dove iniziare”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Primi passi",
					to: "/programmable/sdk/getting-started",
					description: "Installa il pacchetto, crea un'istanza dell'editor e collega i componenti principali."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Architettura",
					to: "/programmable/sdk/architecture",
					description: "Scopri come interagiscono composable, componenti e contesto dell'editor."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Guide",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Crea interfacce dell'editor, pannelli delle proprietà e pannelli di navigazione personalizzati."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Riferimento API",
					to: "/programmable/sdk/api/",
					description: "Consulta i componenti, i composable e le API di basso livello."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Primi passi",
					to: "/programmable/sdk/getting-started",
					description: "Installa il pacchetto, crea un'istanza dell'editor e collega i componenti principali."
				}),
				createVNode(_component_SdkCard, {
					title: "Architettura",
					to: "/programmable/sdk/architecture",
					description: "Scopri come interagiscono composable, componenti e contesto dell'editor."
				}),
				createVNode(_component_SdkCard, {
					title: "Guide",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Crea interfacce dell'editor, pannelli delle proprietà e pannelli di navigazione personalizzati."
				}),
				createVNode(_component_SdkCard, {
					title: "Riferimento API",
					to: "/programmable/sdk/api/",
					description: "Consulta i componenti, i composable e le API di basso livello."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="a-cosa-serve-l-sdk" tabindex="-1">A cosa serve l&#39;SDK <a class="header-anchor" href="#a-cosa-serve-l-sdk" aria-label="Permalink to “A cosa serve l&#39;SDK”">​</a></h2><p>Prodotti e team diversi richiedono esperienze di editing diverse.</p><p>Può trattarsi di un editor di design completo, di un&#39;area di lavoro integrata in un&#39;altra applicazione, di uno strumento interno, di un editor di template o di un&#39;interfaccia specializzata con funzionalità di AI.</p><h2 id="principi-di-progettazione" tabindex="-1">Principi di progettazione <a class="header-anchor" href="#principi-di-progettazione" aria-label="Permalink to “Principi di progettazione”">​</a></h2><ul><li><strong>Senza stile per scelta:</strong> l’SDK fornisce logica e struttura senza imporre l’aspetto dell’applicazione.</li><li><strong>Un composable invece di un wrapper superfluo:</strong> se non occorre coordinare una struttura dell&#39;interfaccia, è sufficiente un composable.</li><li><strong>Un&#39;API pubblica progettata con cura:</strong> le funzionalità stabili vengono esportate da <code>packages/vue/src/index.ts</code>.</li><li><strong>Una stretta integrazione con Vue:</strong> l&#39;SDK collega Vue alle funzionalità di <code>@open-pencil/core</code>.</li></ul><h2 id="due-livelli-di-api" tabindex="-1">Due livelli di API <a class="header-anchor" href="#due-livelli-di-api" aria-label="Permalink to “Due livelli di API”">​</a></h2><p>L&#39;SDK è composto da due livelli principali:</p><ol><li>I <strong>composable</strong> forniscono lo stato dell&#39;editor e le relative operazioni.</li><li>I <strong>componenti</strong> definiscono una struttura significativa dell&#39;interfaccia.</li></ol><p>Se ti servono soltanto lo stato e le operazioni dell&#39;editor, inizia dai composable. Se stai creando parti riutilizzabili dell&#39;interfaccia, inizia dai componenti.</p><h2 id="sezioni-dell-api" tabindex="-1">Sezioni dell&#39;API <a class="header-anchor" href="#sezioni-dell-api" aria-label="Permalink to “Sezioni dell&#39;API”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Componenti</a></li><li><a href="/programmable/sdk/api/composables/">Composable</a></li><li><a href="/programmable/sdk/api/advanced/">API di basso livello</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("it/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
