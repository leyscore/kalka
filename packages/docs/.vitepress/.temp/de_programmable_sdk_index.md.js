import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region de/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Erstellen Sie OpenPencil-basierte Editoren mit Komponenten ohne vorgegebenes Erscheinungsbild und Vue Composables.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Erstellen Sie OpenPencil-basierte Editoren mit Komponenten ohne vorgegebenes Erscheinungsbild und Vue Composables.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Erstellen Sie OpenPencil-basierte Editoren mit Komponenten ohne vorgegebenes Erscheinungsbild und Vue Composables.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Erstellen Sie OpenPencil-basierte Editoren mit Komponenten ohne vorgegebenes Erscheinungsbild und Vue Composables.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Erstellen Sie OpenPencil-basierte Editoren mit Komponenten ohne vorgegebenes Erscheinungsbild und Vue Composables.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/sdk/index.md\",\"filePath\":\"de/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "de/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p>Mit <code>@open-pencil/vue</code> lässt sich OpenPencil nicht nur als eigenständige Designanwendung verwenden.</p><p>OpenPencil kann in andere Produkte, interne Werkzeuge oder auf bestimmte Aufgaben zugeschnittene Editoren eingebettet werden. Dabei sind Sie nicht an die Benutzeroberfläche der OpenPencil-App gebunden.</p><p>Die OpenPencil-App ist lediglich eine mögliche Oberfläche, die mit diesem Toolkit erstellt wurde. Mit dem SDK können Sie eine eigene entwickeln.</p><p>Das SDK bietet:</p><ul><li>einen über Vue Dependency Injection bereitgestellten Editor-Kontext;</li><li>CanvasKit-basiertes Rendering der Arbeitsfläche;</li><li>Composables für Auswahl, Befehle, Menüs, Eigenschaften und Variablen;</li><li>strukturelle Komponenten ohne vorgegebenes Erscheinungsbild wie <code>PageListRoot</code>, <code>PropertyListRoot</code> und <code>ToolbarRoot</code>;</li><li>Lokalisierung für Menüs, Panels und Dialoge sowie Komponenten zur Sprachauswahl.</li></ul><h2 id="einstieg" tabindex="-1">Einstieg <a class="header-anchor" href="#einstieg" aria-label="Permalink to “Einstieg”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Erste Schritte",
					to: "/programmable/sdk/getting-started",
					description: "Installieren Sie das Paket, erstellen Sie eine Editor-Instanz und binden Sie die grundlegenden Komponenten ein."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Architektur",
					to: "/programmable/sdk/architecture",
					description: "Erfahren Sie, wie Composables, Komponenten und Editor-Kontext zusammenarbeiten."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Anleitungen",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Erstellen Sie eigene Editor-Oberflächen, Eigenschaften- und Navigationspanels."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "API-Referenz",
					to: "/programmable/sdk/api/",
					description: "Informieren Sie sich über Komponenten, Composables und Low-Level-APIs."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Erste Schritte",
					to: "/programmable/sdk/getting-started",
					description: "Installieren Sie das Paket, erstellen Sie eine Editor-Instanz und binden Sie die grundlegenden Komponenten ein."
				}),
				createVNode(_component_SdkCard, {
					title: "Architektur",
					to: "/programmable/sdk/architecture",
					description: "Erfahren Sie, wie Composables, Komponenten und Editor-Kontext zusammenarbeiten."
				}),
				createVNode(_component_SdkCard, {
					title: "Anleitungen",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Erstellen Sie eigene Editor-Oberflächen, Eigenschaften- und Navigationspanels."
				}),
				createVNode(_component_SdkCard, {
					title: "API-Referenz",
					to: "/programmable/sdk/api/",
					description: "Informieren Sie sich über Komponenten, Composables und Low-Level-APIs."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="wofur-das-sdk-gedacht-ist" tabindex="-1">Wofür das SDK gedacht ist <a class="header-anchor" href="#wofur-das-sdk-gedacht-ist" aria-label="Permalink to “Wofür das SDK gedacht ist”">​</a></h2><p>Produkte und Teams benötigen unterschiedliche Bearbeitungsoberflächen.</p><p>Das kann ein vollständiger Designeditor sein, eine kompakte Arbeitsfläche innerhalb einer anderen Anwendung, ein internes Werkzeug, ein Vorlageneditor oder eine spezialisierte, KI-gestützte Oberfläche.</p><h2 id="gestaltungsprinzipien" tabindex="-1">Gestaltungsprinzipien <a class="header-anchor" href="#gestaltungsprinzipien" aria-label="Permalink to “Gestaltungsprinzipien”">​</a></h2><ul><li><strong>Ohne vorgegebenes Erscheinungsbild:</strong> Das SDK stellt Logik und Struktur bereit, schreibt aber keine Gestaltung der Anwendung vor.</li><li><strong>Composable statt unnötiger Hülle:</strong> Wenn keine Oberflächenstruktur koordiniert werden muss, genügt ein Composable.</li><li><strong>Bewusst gestaltete öffentliche API:</strong> Stabile Funktionen werden aus <code>packages/vue/src/index.ts</code> exportiert.</li><li><strong>Enge Vue-Integration:</strong> Das SDK verbindet Vue mit den Funktionen von <code>@open-pencil/core</code>.</li></ul><h2 id="zwei-api-ebenen" tabindex="-1">Zwei API-Ebenen <a class="header-anchor" href="#zwei-api-ebenen" aria-label="Permalink to “Zwei API-Ebenen”">​</a></h2><p>Das SDK besteht aus zwei Hauptebenen:</p><ol><li><strong>Composables</strong> stellen den Editor-Zustand und zugehörige Aktionen bereit.</li><li><strong>Komponenten</strong> definieren eine sinnvolle UI-Struktur.</li></ol><p>Benötigen Sie lediglich Zustand und Aktionen, beginnen Sie mit den Composables. Entwickeln Sie wiederverwendbare Teile einer Editor-Oberfläche, beginnen Sie mit den Komponenten.</p><h2 id="api-bereiche" tabindex="-1">API-Bereiche <a class="header-anchor" href="#api-bereiche" aria-label="Permalink to “API-Bereiche”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Komponenten</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">Low-Level-APIs</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
