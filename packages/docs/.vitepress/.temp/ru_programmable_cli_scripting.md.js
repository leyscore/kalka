import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Сценарии\",\"description\":\"Выполнение JavaScript через совместимый с Figma Plugin API для поиска, массового изменения и создания дизайна.\",\"frontmatter\":{\"title\":\"Сценарии\",\"description\":\"Выполнение JavaScript через совместимый с Figma Plugin API для поиска, массового изменения и создания дизайна.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Сценарии — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Сценарии — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Выполнение JavaScript через совместимый с Figma Plugin API для поиска, массового изменения и создания дизайна.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Выполнение JavaScript через совместимый с Figma Plugin API для поиска, массового изменения и создания дизайна.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Выполнение JavaScript через совместимый с Figma Plugin API для поиска, массового изменения и создания дизайна.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/cli/scripting.md\",\"filePath\":\"ru/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "ru/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="сценарии" tabindex="-1">Сценарии <a class="header-anchor" href="#сценарии" aria-label="Permalink to “Сценарии”">​</a></h1><p><code>openpencil eval</code> выполняет JavaScript для документа OpenPencil и предоставляет глобальный объект <code>figma</code>, совместимый с Figma Plugin API. Команда подходит для пакетных изменений, проверки документов, подготовки тестовых данных и другой автоматизации без интерфейса редактора.</p><h2 id="первыи-вызов" tabindex="-1">Первый вызов <a class="header-anchor" href="#первыи-вызов" aria-label="Permalink to “Первый вызов”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p>Параметр <code>-c</code> принимает JavaScript. Если код не начинается с <code>return</code>, OpenPencil помещает его в асинхронную функцию и возвращает её результат, когда он есть.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  const frame = figma.createFrame()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.name = &#39;Card&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.resize(300, 200)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.layoutMode = &#39;VERTICAL&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  frame.itemSpacing = 12</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  return { id: frame.id, name: frame.name }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="поиск-объектов" tabindex="-1">Поиск объектов <a class="header-anchor" href="#поиск-объектов" aria-label="Permalink to “Поиск объектов”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  return figma.currentPage</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .findAll((node) =&gt; node.type === &#39;FRAME&#39; &amp;&amp; node.name.includes(&#39;Button&#39;))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    .map((button) =&gt; ({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      id: button.id,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      name: button.name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      width: button.width,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      height: button.height</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="изменение-и-сохранение" tabindex="-1">Изменение и сохранение <a class="header-anchor" href="#изменение-и-сохранение" aria-label="Permalink to “Изменение и сохранение”">​</a></h2><p><code>--write</code> или <code>-w</code> записывает изменения во входной файл. <code>--output</code> или <code>-o</code> создаёт новый файл.</p><h2 id="сценарии-из-стандартного-ввода" tabindex="-1">Сценарий из стандартного ввода <a class="header-anchor" href="#сценарии-из-стандартного-ввода" aria-label="Permalink to “Сценарий из стандартного ввода”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> --write</span></span></code></pre></div><h2 id="открытое-приложение" tabindex="-1">Открытое приложение <a class="header-anchor" href="#открытое-приложение" aria-label="Permalink to “Открытое приложение”">​</a></h2><p>Не указывайте файл, чтобы выполнить сценарий для текущего документа в настольном приложении:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;return figma.currentPage.name&quot;</span></span></code></pre></div><h2 id="вывод" tabindex="-1">Вывод <a class="header-anchor" href="#вывод" aria-label="Permalink to “Вывод”">​</a></h2><p>При перенаправлении вывода по умолчанию используется JSON. Параметр <code>--json</code> включает его явно, а <code>--quiet</code> или <code>-q</code> отключает вывод.</p><h2 id="доступныи-api" tabindex="-1">Доступный API <a class="header-anchor" href="#доступныи-api" aria-label="Permalink to “Доступный API”">​</a></h2><p>API намеренно близок к Figma Plugin API, но работает с SceneGraph и форматами OpenPencil.</p><h3 id="документ-и-страницы" tabindex="-1">Документ и страницы <a class="header-anchor" href="#документ-и-страницы" aria-label="Permalink to “Документ и страницы”">​</a></h3><ul><li><code>figma.root</code></li><li><code>figma.currentPage</code></li><li><code>figma.currentPage.selection</code></li><li><code>figma.getNodeById(id)</code></li><li><code>figma.createPage()</code></li></ul><h3 id="создание-объектов" tabindex="-1">Создание объектов <a class="header-anchor" href="#создание-объектов" aria-label="Permalink to “Создание объектов”">​</a></h3><ul><li><code>figma.createFrame()</code></li><li><code>figma.createRectangle()</code></li><li><code>figma.createEllipse()</code></li><li><code>figma.createText()</code></li><li><code>figma.createLine()</code></li><li><code>figma.createPolygon()</code></li><li><code>figma.createStar()</code></li><li><code>figma.createVector()</code></li><li><code>figma.createComponent()</code></li><li><code>figma.createSection()</code></li></ul><h3 id="дерево" tabindex="-1">Дерево <a class="header-anchor" href="#дерево" aria-label="Permalink to “Дерево”">​</a></h3><ul><li><code>node.children</code></li><li><code>node.parent</code></li><li><code>node.appendChild(child)</code></li><li><code>node.insertChild(index, child)</code></li><li><code>node.clone()</code></li><li><code>node.remove()</code></li><li><code>node.findAll(callback?)</code></li><li><code>node.findOne(callback)</code></li><li><code>node.findChild(callback)</code></li><li><code>node.findChildren(callback?)</code></li><li><code>figma.group(nodes, parent)</code></li><li><code>figma.ungroup(node)</code></li></ul><h3 id="компоненты" tabindex="-1">Компоненты <a class="header-anchor" href="#компоненты" aria-label="Permalink to “Компоненты”">​</a></h3><ul><li><code>figma.createComponentFromNode(node)</code></li><li><code>component.createInstance()</code></li><li><code>instance.mainComponent</code></li></ul><h3 id="переменные" tabindex="-1">Переменные <a class="header-anchor" href="#переменные" aria-label="Permalink to “Переменные”">​</a></h3><ul><li><code>figma.getLocalVariables(type?)</code></li><li><code>figma.getVariableById(id)</code></li><li><code>figma.getLocalVariableCollections()</code></li><li><code>figma.getVariableCollectionById(id)</code></li><li><code>figma.createVariable(name, type, collectionId, value?)</code></li><li><code>figma.setVariableValue(variableId, modeId, value)</code></li><li><code>figma.deleteVariable(id)</code></li><li><code>figma.createVariableCollection(name)</code></li><li><code>figma.deleteVariableCollection(id)</code></li><li><code>figma.bindVariable(nodeId, field, variableId)</code></li><li><code>figma.unbindVariable(nodeId, field)</code></li></ul><h3 id="своиства" tabindex="-1">Свойства <a class="header-anchor" href="#своиства" aria-label="Permalink to “Свойства”">​</a></h3><p>Распространённые свойства доступны для чтения и записи через прокси:</p><ul><li>геометрия: <code>x</code>, <code>y</code>, <code>width</code>, <code>height</code>, <code>rotation</code>, <code>resize(width, height)</code>;</li><li>внешний вид: <code>fills</code>, <code>strokes</code>, <code>effects</code>, <code>opacity</code>, <code>visible</code>, <code>locked</code>, <code>blendMode</code>, <code>clipsContent</code>;</li><li>радиусы: <code>cornerRadius</code>, <code>topLeftRadius</code>, <code>topRightRadius</code>, <code>bottomRightRadius</code>, <code>bottomLeftRadius</code>;</li><li>текст: <code>characters</code>, <code>fontSize</code>, <code>fontName</code>, <code>fontWeight</code>, выравнивание, интерлиньяж, межбуквенный интервал и функции для диапазонов стилей;</li><li>автоматическая компоновка: <code>layoutMode</code>, <code>primaryAxisAlignItems</code>, <code>counterAxisAlignItems</code>, <code>itemSpacing</code>, отступы, размеры и положение;</li><li>обводка: <code>strokeWeight</code>, <code>strokeAlign</code>, <code>dashPattern</code>.</li></ul><h3 id="служебные-возможности" tabindex="-1">Служебные возможности <a class="header-anchor" href="#служебные-возможности" aria-label="Permalink to “Служебные возможности”">​</a></h3><ul><li><code>figma.mixed</code></li><li><code>figma.createImage(data)</code></li><li><code>figma.loadFontAsync(fontName)</code> ничего не делает, поскольку OpenPencil не блокирует изменение текста до загрузки шрифта плагином</li><li><code>figma.listAvailableFontsAsync()</code> возвращает доступные системные шрифты</li><li><code>figma.notify(message)</code> записывает предупреждение в режиме без интерфейса</li><li><code>figma.viewport</code></li></ul><h2 id="пока-не-совместимо-с-figma" tabindex="-1">Пока не совместимо с Figma <a class="header-anchor" href="#пока-не-совместимо-с-figma" aria-label="Permalink to “Пока не совместимо с Figma”">​</a></h2><p>Следующие API пока не предоставляются в совместимом виде:</p><ul><li><code>node.exportAsync()</code></li><li><code>node.setBoundVariable(field, variable)</code></li><li><code>figma.combineAsVariants(components, parent)</code></li><li>API стилей Figma, например <code>figma.createPaintStyle()</code> и <code>figma.createTextStyle()</code></li><li>полная совместимость логических операций над векторами</li></ul><p>Вместо них используйте команды экспорта OpenPencil CLI, инструменты основного пакета или прямые вспомогательные функции SceneGraph, когда они доступны.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
