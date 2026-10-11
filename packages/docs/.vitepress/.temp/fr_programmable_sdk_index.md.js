import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region fr/programmable/sdk/index.md
var __pageData = JSON.parse("{\"title\":\"Vue SDK\",\"description\":\"Créez des éditeurs basés sur OpenPencil avec des composants sans styles et des composables Vue.\",\"frontmatter\":{\"title\":\"Vue SDK\",\"description\":\"Créez des éditeurs basés sur OpenPencil avec des composants sans styles et des composables Vue.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"fr_FR\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Vue SDK — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Créez des éditeurs basés sur OpenPencil avec des composants sans styles et des composables Vue.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Créez des éditeurs basés sur OpenPencil avec des composants sans styles et des composables Vue.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Créez des éditeurs basés sur OpenPencil avec des composants sans styles et des composables Vue.\"}]]},\"headers\":[],\"relativePath\":\"fr/programmable/sdk/index.md\",\"filePath\":\"fr/programmable/sdk/index.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "fr/programmable/sdk/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkCardGroup = resolveComponent("SdkCardGroup");
	const _component_SdkCard = resolveComponent("SdkCard");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="vue-sdk" tabindex="-1">Vue SDK <a class="header-anchor" href="#vue-sdk" aria-label="Permalink to “Vue SDK”">​</a></h1><p><code>@open-pencil/vue</code> permet d&#39;utiliser OpenPencil autrement que comme une application de design autonome.</p><p>Vous pouvez intégrer OpenPencil à un autre produit, à un outil interne ou à un éditeur spécialisé, sans reprendre l&#39;interface par défaut de l&#39;application.</p><p>L&#39;application OpenPencil n&#39;est qu&#39;une des interfaces créées avec cette boîte à outils. Le SDK vous permet de construire la vôtre.</p><p>Le SDK fournit :</p><ul><li>le contexte de l&#39;éditeur au moyen de la dependency injection de Vue ;</li><li>le rendu de la zone de travail avec CanvasKit ;</li><li>des composables pour la sélection, les commandes, les menus, les panneaux de propriétés et les variables ;</li><li>des composants structurels sans styles tels que <code>PageListRoot</code>, <code>PropertyListRoot</code> et <code>ToolbarRoot</code> ;</li><li>la localisation des menus, panneaux et boîtes de dialogue, ainsi que des composants de sélection de la langue.</li></ul><h2 id="par-ou-commencer" tabindex="-1">Par où commencer <a class="header-anchor" href="#par-ou-commencer" aria-label="Permalink to “Par où commencer”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkCardGroup, null, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Premiers pas",
					to: "/programmable/sdk/getting-started",
					description: "Installez le package, créez une instance de l'éditeur et connectez les composants principaux."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Architecture",
					to: "/programmable/sdk/architecture",
					description: "Découvrez comment les composables, les composants et le contexte de l'éditeur s'articulent."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Guides",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Créez une interface d'éditeur, des panneaux de propriétés et des panneaux de navigation sur mesure."
				}, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_SdkCard, {
					title: "Référence de l'API",
					to: "/programmable/sdk/api/",
					description: "Consultez les composants, les composables et les API de bas niveau."
				}, null, _parent, _scopeId));
			} else return [
				createVNode(_component_SdkCard, {
					title: "Premiers pas",
					to: "/programmable/sdk/getting-started",
					description: "Installez le package, créez une instance de l'éditeur et connectez les composants principaux."
				}),
				createVNode(_component_SdkCard, {
					title: "Architecture",
					to: "/programmable/sdk/architecture",
					description: "Découvrez comment les composables, les composants et le contexte de l'éditeur s'articulent."
				}),
				createVNode(_component_SdkCard, {
					title: "Guides",
					to: "/programmable/sdk/guides/custom-editor-shell",
					description: "Créez une interface d'éditeur, des panneaux de propriétés et des panneaux de navigation sur mesure."
				}),
				createVNode(_component_SdkCard, {
					title: "Référence de l'API",
					to: "/programmable/sdk/api/",
					description: "Consultez les composants, les composables et les API de bas niveau."
				})
			];
		}),
		_: 1
	}, _parent));
	_push(`<h2 id="a-quoi-sert-le-sdk" tabindex="-1">À quoi sert le SDK <a class="header-anchor" href="#a-quoi-sert-le-sdk" aria-label="Permalink to “À quoi sert le SDK”">​</a></h2><p>Chaque produit et chaque équipe a besoin d&#39;une expérience d&#39;édition différente.</p><p>Il peut s&#39;agir d&#39;un éditeur de design complet, d&#39;une zone de travail intégrée à une autre application, d&#39;un outil interne, d&#39;un éditeur de modèles ou d&#39;une interface spécialisée assistée par l&#39;IA.</p><h2 id="principes-de-conception" tabindex="-1">Principes de conception <a class="header-anchor" href="#principes-de-conception" aria-label="Permalink to “Principes de conception”">​</a></h2><ul><li><strong>Sans styles par conception :</strong> le SDK fournit la logique et la structure sans imposer l’apparence de l’application.</li><li><strong>Un composable plutôt qu&#39;un wrapper inutile :</strong> si aucune structure d&#39;interface ne doit être coordonnée, un composable suffit.</li><li><strong>Une API publique maîtrisée :</strong> les fonctionnalités stables sont exportées depuis <code>packages/vue/src/index.ts</code>.</li><li><strong>Une intégration étroite avec Vue :</strong> le SDK relie Vue aux fonctionnalités de <code>@open-pencil/core</code>.</li></ul><h2 id="deux-niveaux-d-api" tabindex="-1">Deux niveaux d&#39;API <a class="header-anchor" href="#deux-niveaux-d-api" aria-label="Permalink to “Deux niveaux d&#39;API”">​</a></h2><p>Le SDK se compose de deux niveaux principaux :</p><ol><li>Les <strong>composables</strong> fournissent l&#39;état de l&#39;éditeur et les opérations associées.</li><li>Les <strong>composants</strong> définissent une structure d&#39;interface pertinente.</li></ol><p>Si vous avez uniquement besoin de l&#39;état et des opérations de l&#39;éditeur, commencez par les composables. Si vous créez des éléments d&#39;interface réutilisables, commencez par les composants.</p><h2 id="sections-de-l-api" tabindex="-1">Sections de l&#39;API <a class="header-anchor" href="#sections-de-l-api" aria-label="Permalink to “Sections de l&#39;API”">​</a></h2><ul><li><a href="/programmable/sdk/api/components/">Composants</a></li><li><a href="/programmable/sdk/api/composables/">Composables</a></li><li><a href="/programmable/sdk/api/advanced/">API de bas niveau</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fr/programmable/sdk/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sdk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sdk_default as default };
