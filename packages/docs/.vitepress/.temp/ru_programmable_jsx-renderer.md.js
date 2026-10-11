import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"Рендерер JSX\",\"description\":\"Декларативное создание дизайна с помощью JSX и обратный экспорт в JSX или HTML с Tailwind.\",\"frontmatter\":{\"title\":\"Рендерер JSX\",\"description\":\"Декларативное создание дизайна с помощью JSX и обратный экспорт в JSX или HTML с Tailwind.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Рендерер JSX — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Рендерер JSX — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Декларативное создание дизайна с помощью JSX и обратный экспорт в JSX или HTML с Tailwind.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Декларативное создание дизайна с помощью JSX и обратный экспорт в JSX или HTML с Tailwind.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Декларативное создание дизайна с помощью JSX и обратный экспорт в JSX или HTML с Tailwind.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/jsx-renderer.md\",\"filePath\":\"ru/programmable/jsx-renderer.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "ru/programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="рендерер-jsx" tabindex="-1">Рендерер JSX <a class="header-anchor" href="#рендерер-jsx" aria-label="Permalink to “Рендерер JSX”">​</a></h1><p>OpenPencil использует JSX как декларативный язык создания дизайна. Он подходит для агентов ИИ, сценариев и воспроизводимого построения интерфейсов.</p><p>JSX также служит читаемым представлением существующего дизайна. Изменения выглядят как обычная разница в коде, которую удобно проверять и хранить в системе управления версиями.</p><h2 id="создание-дизаина" tabindex="-1">Создание дизайна <a class="header-anchor" href="#создание-дизаина" aria-label="Permalink to “Создание дизайна”">​</a></h2><p>Инструмент <code>render</code>, доступный в чате с ИИ, MCP и <code>eval</code> CLI, принимает JSX:</p><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Card&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">320</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;hug&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> flex</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;col&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> gap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">24</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#FFF&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> rounded</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">18</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">weight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bold&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Card Title&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">14</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#666&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Description text&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><p>В MCP и чате с ИИ передайте инструменту <code>render</code> строку JSX. В коде приложения или библиотеки без интерфейса импортируйте <code>Frame</code>, <code>Text</code> и другие элементы для описания дизайна из <code>@open-pencil/design-jsx</code>, а узлы создавайте через <code>renderTree</code> или <code>renderJSX</code> из <code>@open-pencil/core/design-jsx</code>: они добавляют значки, преобразование SVG и компоновку. Чтобы писать такие деревья в TSX, укажите в <code>tsconfig.json</code> <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> вместе с <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> или добавьте в файл комментарий <code>/** @jsxImportSource @open-pencil/design-jsx */</code>. Для обратного преобразования используйте команду <code>export</code> — подробнее в разделе <a href="./cli/exporting">Экспорт дизайна в JSX</a>.</p><h2 id="элементы" tabindex="-1">Элементы <a class="header-anchor" href="#элементы" aria-label="Permalink to “Элементы”">​</a></h2><table tabindex="0"><thead><tr><th>Элемент</th><th>Создаёт</th><th>Псевдоним</th></tr></thead><tbody><tr><td><code>&lt;Frame&gt;</code></td><td>Фрейм с автоматической компоновкой</td><td><code>&lt;View&gt;</code></td></tr><tr><td><code>&lt;Rectangle&gt;</code></td><td>Прямоугольник</td><td><code>&lt;Rect&gt;</code></td></tr><tr><td><code>&lt;Ellipse&gt;</code></td><td>Эллипс или круг</td><td></td></tr><tr><td><code>&lt;Text&gt;</code></td><td>Текстовый объект; дочерние элементы становятся содержимым</td><td></td></tr><tr><td><code>&lt;Line&gt;</code></td><td>Линия</td><td></td></tr><tr><td><code>&lt;Star&gt;</code></td><td>Звезда</td><td></td></tr><tr><td><code>&lt;Polygon&gt;</code></td><td>Многоугольник</td><td></td></tr><tr><td><code>&lt;Vector&gt;</code></td><td>Векторный контур</td><td></td></tr><tr><td><code>&lt;Group&gt;</code></td><td>Группа</td><td></td></tr><tr><td><code>&lt;Section&gt;</code></td><td>Секция</td><td></td></tr></tbody></table><h2 id="своиства-оформления" tabindex="-1">Свойства оформления <a class="header-anchor" href="#своиства-оформления" aria-label="Permalink to “Свойства оформления”">​</a></h2><p>Для краткости свойства используют имена, близкие к Tailwind.</p><h3 id="компоновка" tabindex="-1">Компоновка <a class="header-anchor" href="#компоновка" aria-label="Permalink to “Компоновка”">​</a></h3><table tabindex="0"><thead><tr><th>Свойство</th><th>Назначение</th></tr></thead><tbody><tr><td><code>flex</code></td><td><code>&quot;row&quot;</code> или <code>&quot;col&quot;</code>; включает автоматическую компоновку</td></tr><tr><td><code>gap</code></td><td>Расстояние между дочерними элементами</td></tr><tr><td><code>wrap</code></td><td>Перенос дочерних элементов на следующую строку</td></tr><tr><td><code>rowGap</code></td><td>Расстояние между строками при переносе</td></tr><tr><td><code>justify</code></td><td><code>&quot;start&quot;</code>, <code>&quot;end&quot;</code>, <code>&quot;center&quot;</code> или <code>&quot;between&quot;</code></td></tr><tr><td><code>items</code></td><td><code>&quot;start&quot;</code>, <code>&quot;end&quot;</code>, <code>&quot;center&quot;</code> или <code>&quot;stretch&quot;</code></td></tr><tr><td><code>p</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code>, <code>pl</code></td><td>Внутренние отступы</td></tr></tbody></table><h3 id="размер-и-положение" tabindex="-1">Размер и положение <a class="header-anchor" href="#размер-и-положение" aria-label="Permalink to “Размер и положение”">​</a></h3><table tabindex="0"><thead><tr><th>Свойство</th><th>Назначение</th></tr></thead><tbody><tr><td><code>w</code>, <code>h</code></td><td>Ширина и высота: число, <code>&quot;fill&quot;</code> или <code>&quot;hug&quot;</code></td></tr><tr><td><code>minW</code>, <code>maxW</code>, <code>minH</code>, <code>maxH</code></td><td>Ограничения размера</td></tr><tr><td><code>x</code>, <code>y</code></td><td>Положение</td></tr></tbody></table><h3 id="внешнии-вид" tabindex="-1">Внешний вид <a class="header-anchor" href="#внешнии-вид" aria-label="Permalink to “Внешний вид”">​</a></h3><table tabindex="0"><thead><tr><th>Свойство</th><th>Назначение</th></tr></thead><tbody><tr><td><code>bg</code></td><td>Цвет фоновой заливки в шестнадцатеричном формате</td></tr><tr><td><code>fill</code></td><td>Псевдоним для <code>bg</code></td></tr><tr><td><code>stroke</code></td><td>Цвет обводки</td></tr><tr><td><code>strokeWidth</code></td><td>Толщина обводки; по умолчанию 1</td></tr><tr><td><code>rounded</code></td><td>Радиус углов; отдельные углы: <code>roundedTL</code>, <code>roundedTR</code>, <code>roundedBL</code>, <code>roundedBR</code></td></tr><tr><td><code>cornerSmoothing</code></td><td>Сглаживание углов от 0 до 1</td></tr><tr><td><code>opacity</code></td><td>Прозрачность от 0 до 1</td></tr><tr><td><code>shadow</code></td><td>Внешняя тень, например <code>&quot;0 4 8 #00000040&quot;</code></td></tr><tr><td><code>blur</code></td><td>Радиус размытия слоя</td></tr><tr><td><code>rotate</code></td><td>Угол поворота в градусах</td></tr><tr><td><code>blendMode</code></td><td>Режим наложения</td></tr><tr><td><code>overflow</code></td><td><code>&quot;hidden&quot;</code> или <code>&quot;visible&quot;</code></td></tr></tbody></table><h3 id="типографика" tabindex="-1">Типографика <a class="header-anchor" href="#типографика" aria-label="Permalink to “Типографика”">​</a></h3><table tabindex="0"><thead><tr><th>Свойство</th><th>Назначение</th></tr></thead><tbody><tr><td><code>size</code> / <code>fontSize</code></td><td>Размер шрифта</td></tr><tr><td><code>font</code> / <code>fontFamily</code></td><td>Семейство шрифта</td></tr><tr><td><code>weight</code> / <code>fontWeight</code></td><td><code>&quot;bold&quot;</code>, <code>&quot;medium&quot;</code>, <code>&quot;normal&quot;</code> или число</td></tr><tr><td><code>color</code></td><td>Цвет текста</td></tr><tr><td><code>textAlign</code></td><td><code>&quot;left&quot;</code>, <code>&quot;center&quot;</code>, <code>&quot;right&quot;</code> или <code>&quot;justified&quot;</code></td></tr></tbody></table><h2 id="экспорт-в-jsx" tabindex="-1">Экспорт в JSX <a class="header-anchor" href="#экспорт-в-jsx" aria-label="Permalink to “Экспорт в JSX”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                   # Формат OpenPencil</span></span>
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
	})}"> jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --style</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # Классы Tailwind</span></span></code></pre></div><p>Экспортированный дизайн можно изменить как код и снова отрисовать. Экспорт записывает скрытые и заблокированные слои, ограничения, ограничения размеров, многослойные, градиентные и изображённые заливки, обводки, эффекты, маски и привязки переменных, поэтому при повторной отрисовке они воспроизводятся, а <code>diff_jsx</code> показывает изменения любого из них. Форматированный текст со смешанными стилями, векторные контуры, сетки компоновки, общие стили и определения свойств компонентов пока не записываются. Экземпляры записываются как фреймы со своим содержимым, поэтому экспортированный JSX самодостаточен.</p><h2 id="сравнение-изменении" tabindex="-1">Сравнение изменений <a class="header-anchor" href="#сравнение-изменении" aria-label="Permalink to “Сравнение изменений”">​</a></h2><div class="language-diff"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">diff</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> &lt;Frame name=&quot;Card&quot; w={320} flex=&quot;col&quot; gap={16} p={24} bg=&quot;#FFF&quot;&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-dark": "#FDAEB7"
	})}">-  &lt;Text size={18} weight=&quot;bold&quot;&gt;Old Title&lt;/Text&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">+  &lt;Text size={24} weight=&quot;bold&quot; color=&quot;#1D1B20&quot;&gt;New Title&lt;/Text&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">   &lt;Text size={14} color=&quot;#666&quot;&gt;Description&lt;/Text&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> &lt;/Frame&gt;</span></span></code></pre></div><p>Такое сравнение можно проверить в запросе на включение изменений, сохранить в системе управления версиями и анализировать в CI.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
