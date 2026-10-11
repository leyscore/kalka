import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/overview/features.md
var __pageData = JSON.parse("{\"title\":\"Возможности\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Возможности — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Возможности — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"ru/overview/features.md\",\"filePath\":\"ru/overview/features.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "ru/overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="возможности" tabindex="-1">Возможности <a class="header-anchor" href="#возможности" aria-label="Permalink to “Возможности”">​</a></h1><h2 id="фаилы-figma" tabindex="-1">Файлы Figma <a class="header-anchor" href="#фаилы-figma" aria-label="Permalink to “Файлы Figma”">​</a></h2><p>OpenPencil открывает и сохраняет <code>.fig</code> без предварительного преобразования. Импорт и экспорт используют бинарный кодек Kiwi из формата Figma: 194 определения схемы и около 390 полей для каждого объекта. Для сохранения нажмите <kbd>⌘</kbd><kbd>S</kbd>, для сохранения под новым именем — <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Копирование между Figma и OpenPencil:</strong> скопируйте объекты в одном редакторе и вставьте в другом. Сохраняются заливки, обводки, автоматическая компоновка, текст, эффекты, радиусы углов и векторные сети. Обмен работает в обе стороны.</p><h2 id="рисование-и-редактирование" tabindex="-1">Рисование и редактирование <a class="header-anchor" href="#рисование-и-редактирование" aria-label="Permalink to “Рисование и редактирование”">​</a></h2><ul><li><strong>Фигуры:</strong> прямоугольник (<kbd>R</kbd>), эллипс (<kbd>O</kbd>), линия (<kbd>L</kbd>), многоугольник и звезда.</li><li><strong>Перо:</strong> векторные сети, кривые Безье и касательные рычаги.</li><li><strong>Текст:</strong> редактирование непосредственно на холсте и поддержка IME.</li><li><strong>Форматированный текст:</strong> полужирное начертание, курсив, подчёркивание и зачёркивание для отдельных диапазонов.</li><li><strong>Автоматическая компоновка:</strong> Flexbox и CSS Grid через Yoga WASM; направление, интервалы, отступы, выравнивание, размеры и дорожки сетки. Включается сочетанием <kbd>⇧</kbd><kbd>A</kbd>.</li><li><strong>Компоненты:</strong> создание компонентов и наборов, экземпляры, переопределения и автоматическая синхронизация.</li><li><strong>Переменные:</strong> токены дизайна с коллекциями, режимами Light и Dark, типами Color, Float, String и Boolean и привязками.</li><li><strong>Секции:</strong> контейнеры верхнего уровня, принимающие пересекающиеся объекты и показывающие подпись.</li></ul><h2 id="панель-своиств" tabindex="-1">Панель свойств <a class="header-anchor" href="#панель-своиств" aria-label="Permalink to “Панель свойств”">​</a></h2><p>Содержимое вкладок «Дизайн», «Код», «AI» и «Проверка» зависит от выделения.</p><ul><li><strong>Внешний вид:</strong> прозрачность, общий или отдельный радиус углов и видимость.</li><li><strong>Заливка:</strong> сплошной цвет, линейный, радиальный, угловой и ромбический градиенты, а также изображения.</li><li><strong>Обводка:</strong> цвет, толщина, выравнивание внутри, по центру или снаружи, отдельная толщина сторон, концы, соединения и штрихи.</li><li><strong>Эффекты:</strong> внешняя и внутренняя тени, размытие слоя, фона и переднего плана.</li><li><strong>Типографика:</strong> выбор шрифта с поиском и виртуальной прокруткой, начертание, размер, выравнивание и кнопки форматирования.</li><li><strong>Компоновка:</strong> параметры автоматической компоновки.</li><li><strong>Экспорт:</strong> масштаб, форматы PNG/JPG/WEBP/SVG и предварительный просмотр.</li><li><strong>Код:</strong> Design JSX и Tailwind JSX для выделения; Design JSX можно редактировать с двусторонней синхронизацией — код обновляется при изменении слоёв. Элемент под курсором обводит свой слой на холсте, а проблемы дизайна подчёркиваются в том свойстве, которое их вызывает.</li><li><strong>Проверка:</strong> проверка дизайна страницы или выделения в реальном времени: низкий контраст, мелкие области нажатия, цвета без привязки к переменным, интервалы вне шкалы. Проблемы отмечаются на холсте, а переменную можно привязать одним щелчком (<a href="/user-guide/checking-designs">Checking Designs</a>).</li></ul><h2 id="отрисовка" tabindex="-1">Отрисовка <a class="header-anchor" href="#отрисовка" aria-label="Permalink to “Отрисовка”">​</a></h2><p>OpenPencil использует Skia через CanvasKit WASM — тот же графический движок, что и Figma:</p><ul><li>линейные, радиальные, угловые и ромбические градиенты;</li><li>заливки изображениями с разными режимами масштабирования;</li><li>кеширование эффектов отдельных объектов;</li><li>дуги, частичные эллипсы и кольца;</li><li>отсечение объектов за пределами видимой области и повторное использование кистей;</li><li>направляющие привязки с учётом поворота;</li><li>линейки с отметками выделения;</li><li>подсветка при наведении по фактической геометрии.</li></ul><h2 id="отмена-и-повтор" tabindex="-1">Отмена и повтор <a class="header-anchor" href="#отмена-и-повтор" aria-label="Permalink to “Отмена и повтор”">​</a></h2><p>Можно отменить создание и удаление, перемещение и изменение размера, изменение свойств и родителя, компоновку и операции с переменными. Сочетания: <kbd>⌘</kbd><kbd>Z</kbd> и <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="несколько-страниц" tabindex="-1">Несколько страниц <a class="header-anchor" href="#несколько-страниц" aria-label="Permalink to “Несколько страниц”">​</a></h2><p>Страницы можно добавлять, удалять и переименовывать. Для каждой сохраняются собственные положение и масштаб области просмотра.</p><h2 id="несколько-документов" tabindex="-1">Несколько документов <a class="header-anchor" href="#несколько-документов" aria-label="Permalink to “Несколько документов”">​</a></h2><p>Документы открываются во вкладках. <kbd>⌘</kbd><kbd>T</kbd> создаёт новую вкладку, <kbd>⌘</kbd><kbd>W</kbd> закрывает её, <kbd>⌘</kbd><kbd>O</kbd> открывает файл.</p><h2 id="экспорт" tabindex="-1">Экспорт <a class="header-anchor" href="#экспорт" aria-label="Permalink to “Экспорт”">​</a></h2><ul><li><strong>Изображения:</strong> PNG, JPG и WEBP в масштабе от 0,5× до 4× через панель, контекстное меню или <kbd>⇧</kbd><kbd>⌘</kbd><kbd>E</kbd>.</li><li><strong>SVG:</strong> фигуры, текст с диапазонами стилей, градиенты, эффекты и режимы наложения.</li><li><strong>Tailwind JSX:</strong> HTML с классами Tailwind v4 для React или Vue.</li><li><strong>Копировать как:</strong> текст, SVG, PNG или JSX через контекстное меню.</li></ul><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tailwind</span></span></code></pre></div><h2 id="чат-с-ии" tabindex="-1">Чат с ИИ <a class="header-anchor" href="#чат-с-ии" aria-label="Permalink to “Чат с ИИ”">​</a></h2><p>Нажмите <kbd>⌘</kbd><kbd>J</kbd>. Более 90 инструментов создают фигуры, меняют стили и компоновку, работают с компонентами и переменными, выполняют логические операции над фигурами, анализируют токены дизайна и экспортируют ресурсы. Можно подключить Anthropic, OpenAI, Google AI, OpenRouter или совместимую конечную точку.</p><p>Вызовы инструментов отображаются как сворачиваемые элементы временной шкалы. Для визуальной проверки помощник экспортирует результат и сопоставляет его с запросом. Все изменения ИИ можно отменить.</p><p>Настройка описана в разделе <a href="/programmable/ai-chat">Чат с ИИ</a>.</p><h2 id="сервер-mcp" tabindex="-1">Сервер MCP <a class="header-anchor" href="#сервер-mcp" aria-label="Permalink to “Сервер MCP”">​</a></h2><p>Claude Code, Cursor, Windsurf и другие клиенты MCP могут читать и изменять <code>.fig</code> без интерфейса. Доступно более 90 инструментов и два транспорта: stdio и HTTP.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div><p>Полный список находится в <a href="/programmable/mcp-server">справочнике инструментов MCP</a>.</p><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">              # Дерево объектов</span></span>
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
	})}">  # Поиск</span></span>
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
	})}">     # Экспорт</span></span>
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
	})}">    # Анализ цветов</span></span>
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
	})}">  # Повторяющиеся структуры</span></span>
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
	})}">     # Figma Plugin API</span></span></code></pre></div><p>Если настольное приложение запущено, файл можно не указывать: CLI подключится по RPC к открытому документу.</p><p>Все команды поддерживают <code>--json</code>. Установка: <code>npm install -g @open-pencil/cli</code> или <code>bun add -g @open-pencil/cli</code>.</p><h2 id="совместная-работа" tabindex="-1">Совместная работа <a class="header-anchor" href="#совместная-работа" aria-label="Permalink to “Совместная работа”">​</a></h2><p>Одноранговое соединение WebRTC не требует центрального сервера. Отправьте ссылку другим участникам и редактируйте документ вместе.</p><ul><li>Указатели участников с цветом и именем.</li><li>Значки присутствия.</li><li>Режим слежения за областью просмотра другого участника.</li><li>Локальное сохранение в IndexedDB.</li><li>Криптографически стойкие идентификаторы комнат через <code>crypto.getRandomValues()</code>.</li></ul><h2 id="настольная-и-веб-версии" tabindex="-1">Настольная и веб-версии <a class="header-anchor" href="#настольная-и-веб-версии" aria-label="Permalink to “Настольная и веб-версии”">​</a></h2><p><strong>Настольное приложение:</strong> Tauri v2, около 7 МБ, версии для macOS, Windows и Linux, системные меню, работа без сети и автосохранение.</p><p><strong>Веб-приложение:</strong> <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, установка как PWA и интерфейс для сенсорных экранов.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">brew</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --cask</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> openpencil</span></span></code></pre></div><h2 id="резервная-загрузка-google-fonts" tabindex="-1">Резервная загрузка Google Fonts <a class="header-anchor" href="#резервная-загрузка-google-fonts" aria-label="Permalink to “Резервная загрузка Google Fonts”">​</a></h2><p>Если нужного шрифта нет на компьютере, OpenPencil автоматически загружает его из Google Fonts. При открытии <code>.fig</code> с незнакомыми шрифтами вручную устанавливать их не нужно.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
