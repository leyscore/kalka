import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/sdk/api/composables/use-menu-model.md
var __pageData = JSON.parse("{\"title\":\"useMenuModel\",\"description\":\"Создание моделей меню приложения и холста на основе текущего состояния редактора.\",\"frontmatter\":{\"title\":\"useMenuModel\",\"description\":\"Создание моделей меню приложения и холста на основе текущего состояния редактора.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-menu-model\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-menu-model\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useMenuModel — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Создание моделей меню приложения и холста на основе текущего состояния редактора.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Создание моделей меню приложения и холста на основе текущего состояния редактора.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Создание моделей меню приложения и холста на основе текущего состояния редактора.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/composables/use-menu-model.md\",\"filePath\":\"ru/programmable/sdk/api/composables/use-menu-model.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/composables/use-menu-model.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usemenumodel" tabindex="-1">useMenuModel <a class="header-anchor" href="#usemenumodel" aria-label="Permalink to “useMenuModel”">​</a></h1><p><code>useMenuModel()</code> создаёт готовые структуры меню на основе команд редактора и текущего выделения.</p><p>Используйте его, если компоненту меню удобнее получить уже сгруппированные пункты, чем собирать их из отдельных команд.</p><h2 id="использование" tabindex="-1">Использование <a class="header-anchor" href="#использование" aria-label="Permalink to “Использование”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useMenuModel } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">appMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">canvasMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">selectionLabelMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useMenuModel</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><h2 id="базовыи-пример" tabindex="-1">Базовый пример <a class="header-anchor" href="#базовыи-пример" aria-label="Permalink to “Базовый пример”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">canvasMenu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useMenuModel</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Передайте <code>canvasMenu.value</code> своему компоненту контекстного меню.</p><h2 id="практические-примеры" tabindex="-1">Практические примеры <a class="header-anchor" href="#практические-примеры" aria-label="Permalink to “Практические примеры”">​</a></h2><h3 id="главное-меню-приложения" tabindex="-1">Главное меню приложения <a class="header-anchor" href="#главное-меню-приложения" aria-label="Permalink to “Главное меню приложения”">​</a></h3><p><code>appMenu</code> группирует пункты в:</p><ul><li>Правка</li><li>Вид</li><li>Объект</li><li>Расположение</li></ul><h3 id="контекстное-меню-с-перемещением-между-страницами" tabindex="-1">Контекстное меню с перемещением между страницами <a class="header-anchor" href="#контекстное-меню-с-перемещением-между-страницами" aria-label="Permalink to “Контекстное меню с перемещением между страницами”">​</a></h3><p><code>canvasMenu</code> включает динамические пункты, например «Переместить на страницу», исходя из текущего выделения и доступных страниц.</p><h3 id="метки-выделения" tabindex="-1">Метки выделения <a class="header-anchor" href="#метки-выделения" aria-label="Permalink to “Метки выделения”">​</a></h3><p><code>selectionLabelMenu</code> предоставляет контекстно-зависимые метки:</p><ul><li><code>Скрыть</code> / <code>Показать</code></li><li><code>Заблокировать</code> / <code>Разблокировать</code></li></ul><h2 id="связанные-api" tabindex="-1">Связанные API <a class="header-anchor" href="#связанные-api" aria-label="Permalink to “Связанные API”">​</a></h2><ul><li><a href="./use-editor-commands">useEditorCommands</a></li><li><a href="./use-selection-state">useSelectionState</a></li><li><a href="./use-selection-capabilities">useSelectionCapabilities</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/composables/use-menu-model.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_menu_model_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_menu_model_default as default };
