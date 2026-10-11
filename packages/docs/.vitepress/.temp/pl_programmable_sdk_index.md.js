import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region pl/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Twórz edytory oparte na OpenPencil za pomocą komponentów bez narzuconego wyglądu i composables dla Vue.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Twórz edytory oparte na OpenPencil za pomocą komponentów bez narzuconego wyglądu i composables dla Vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Twórz edytory oparte na OpenPencil za pomocą komponentów bez narzuconego wyglądu i composables dla Vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Twórz edytory oparte na OpenPencil za pomocą komponentów bez narzuconego wyglądu i composables dla Vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Twórz edytory oparte na OpenPencil za pomocą komponentów bez narzuconego wyglądu i composables dla Vue.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/sdk/index.md\",\"filePath\":\"pl/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p>Pakiet <code>@open-pencil/vue</code> pozwala korzystać z OpenPencil nie tylko jako z samodzielnej aplikacji do projektowania.</p><p>OpenPencil można osadzić w innym produkcie, narzędziu wewnętrznym albo edytorze przeznaczonym do konkretnego zadania. Nie trzeba przy tym korzystać z domyślnego interfejsu aplikacji.</p><p>Aplikacja OpenPencil jest tylko jednym z interfejsów zbudowanych za pomocą tego zestawu narzędzi. SDK umożliwia stworzenie własnego.</p><p>SDK udostępnia:</p><ul><li>kontekst edytora przekazywany przez dependency injection w Vue;</li><li>renderowanie obszaru roboczego za pomocą CanvasKit;</li><li>composables do obsługi zaznaczenia, poleceń, menu, paneli właściwości i zmiennych;</li><li>strukturalne komponenty bez narzuconego wyglądu, między innymi <code>PageListRoot</code>, <code>PropertyListRoot</code> i <code>ToolbarRoot</code>;</li><li>obsługę lokalizacji menu, paneli i okien dialogowych oraz elementy do wyboru języka.</li></ul><h2 id="od-czego-zaczac" tabindex="-1">Od czego zacząć <a class="header-anchor" href="#od-czego-zaczac" aria-label="Permalink to “Od czego zacząć”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Pierwsze kroki",
					to: "/programmable/sdk/getting-started",
					description: "Zainstaluj pakiet, utwórz instancję edytora i podłącz podstawowe komponenty."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Architektura",
					to: "/programmable/sdk/architecture",
					description: "Dowiedz się, jak współpracują composables, komponenty i kontekst edytora."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Przewodniki",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Twórz własne interfejsy edytora, panele właściwości i panele nawigacyjne."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Dokumentacja API",
					to: "/programmable/sdk/api/",
					description: "Poznaj komponenty, composables i niskopoziomowe publiczne API."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Pierwsze kroki",
					to: "/programmable/sdk/getting-started",
					description: "Zainstaluj pakiet, utwórz instancję edytora i podłącz podstawowe komponenty."
				}),
				createVNode(_component_SdkCard, {
					title: "Architektura",
					to: "/programmable/sdk/architecture",
					description: "Dowiedz się, jak współpracują composables, komponenty i kontekst edytora."
				}),
				createVNode(_component_SdkCard, {
					title: "Przewodniki",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Twórz własne interfejsy edytora, panele właściwości i panele nawigacyjne."
				}),
				createVNode(_component_SdkCard, {
					title: "Dokumentacja API",
					to: "/programmable/sdk/api/",
					description: "Poznaj komponenty, composables i niskopoziomowe publiczne API."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="do-czego-słuzy-sdk" tabindex="-1">Do czego służy SDK <a class="header-anchor" href="#do-czego-słuzy-sdk" aria-label="Permalink to “Do czego służy SDK”">​</a></h2><p>Różne produkty i zespoły potrzebują różnych interfejsów do edycji.</p><p>Może to być pełny edytor graficzny, niewielki obszar roboczy osadzony w innej aplikacji, narzędzie wewnętrzne, edytor szablonów albo wyspecjalizowany interfejs wspomagany przez AI.</p><h2 id="zasady-projektowe" tabindex="-1">Zasady projektowe <a class="header-anchor" href="#zasady-projektowe" aria-label="Permalink to “Zasady projektowe”">​</a></h2><ul><li><strong>Bez narzuconego wyglądu:</strong> SDK zapewnia logikę i strukturę, ale nie określa wyglądu aplikacji.</li><li><strong>Composable zamiast zbędnego wrappera:</strong> jeśli nie trzeba koordynować struktury interfejsu, wystarczy composable.</li><li><strong>Przemyślane publiczne API:</strong> stabilne funkcje są eksportowane z <code>packages/vue/src/index.ts</code>.</li><li><strong>Pełna integracja z Vue:</strong> SDK łączy Vue z możliwościami <code>@open-pencil/core</code>.</li></ul><h2 id="dwie-warstwy-api" tabindex="-1">Dwie warstwy API <a class="header-anchor" href="#dwie-warstwy-api" aria-label="Permalink to “Dwie warstwy API”">​</a></h2><p>SDK składa się z dwóch głównych warstw:</p><ol><li><strong>Composables</strong> udostępniają stan edytora i operacje na nim.</li><li><strong>Komponenty</strong> definiują istotną strukturę interfejsu.</li></ol><p>Jeśli potrzebujesz tylko stanu edytora i operacji, zacznij od composables. Jeśli tworzysz elementy interfejsu edytora przeznaczone do ponownego użycia, zacznij od komponentów.</p><h2 id="sekcje-api" tabindex="-1">Sekcje API <a class="header-anchor" href="#sekcje-api" aria-label="Permalink to “Sekcje API”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Komponenty</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">Niskopoziomowe API</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
