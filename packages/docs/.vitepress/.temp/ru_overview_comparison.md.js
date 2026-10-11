import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil и Penpot: архитектура и производительность\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil и Penpot: архитектура и производительность — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil и Penpot: архитектура и производительность — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"ru/overview/comparison.md\",\"filePath\":\"ru/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-и-penpot-архитектура-и-производительность" tabindex="-1">OpenPencil и Penpot: архитектура и производительность <a class="header-anchor" href="#openpencil-и-penpot-архитектура-и-производительность" aria-label="Permalink to “OpenPencil и Penpot: архитектура и производительность”">​</a></h1><p>OpenPencil и Penpot — открытые инструменты дизайна с разными задачами и архитектурой.</p><div class="info custom-block"><p class="custom-block-title">WASM-рендерер Penpot</p><p>Penpot 2.x включает Rust/Skia WASM-рендерер <code>render-wasm/v1</code>, который включается параметрами сервера или <code>?wasm=true</code>. По умолчанию по-прежнему используется SVG-рендерер. Ниже рассматриваются оба варианта.</p></div><h2 id="_1-размер-кодовои-базы" tabindex="-1">1. Размер кодовой базы <a class="header-anchor" href="#_1-размер-кодовои-базы" aria-label="Permalink to “1. Размер кодовой базы”">​</a></h2><table tabindex="0"><thead><tr><th>Показатель</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Строк кода</td><td><strong>около 26 000</strong></td><td><strong>около 299 000</strong></td></tr><tr><td>Исходных файлов</td><td>около 143</td><td>около 2 900</td></tr><tr><td>Языки</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Код отрисовки</td><td>около 3 200 строк, TypeScript</td><td>22 000 строк, Rust/Skia WASM</td></tr><tr><td>Интерфейс</td><td>около 4 500 строк</td><td>около 175 000 строк, CLJS и SCSS</td></tr><tr><td>Серверная часть</td><td>Нет, локальная архитектура</td><td>32 600 строк и 151 файл SQL</td></tr><tr><td>Соотношение</td><td><strong>1×</strong></td><td><strong>около 11×</strong></td></tr></tbody></table><p>OpenPencil примерно в 11 раз меньше. Это следствие другой архитектуры, а не только меньшего набора возможностей.</p><h2 id="_2-архитектура" tabindex="-1">2. Архитектура <a class="header-anchor" href="#_2-архитектура" aria-label="Permalink to “2. Архитектура”">​</a></h2><h3 id="openpencil-один-клиентскии-процесс" tabindex="-1">OpenPencil: один клиентский процесс <a class="header-anchor" href="#openpencil-один-клиентскии-процесс" aria-label="Permalink to “OpenPencil: один клиентский процесс”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌─────────────────────────────────┐</span></span>
<span class="line"><span>│         Tauri native shell      │</span></span>
<span class="line"><span>│  ┌───────────────────────────┐  │</span></span>
<span class="line"><span>│  │  Vue 3 + TypeScript       │  │</span></span>
<span class="line"><span>│  │  Editor + Kiwi codec      │  │</span></span>
<span class="line"><span>│  │  SceneGraph in TypeScript │  │</span></span>
<span class="line"><span>│  │  CanvasKit + Yoga WASM    │  │</span></span>
<span class="line"><span>│  └───────────────────────────┘  │</span></span>
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>Редактор, SceneGraph, кодек файлов и отрисовка работают в одном процессе. Отдельные сервер, база данных и Docker не нужны. SceneGraph хранится как <code>Map&lt;string, SceneNode&gt;</code>. TypeScript напрямую вызывает CanvasKit, а Yoga WASM синхронно рассчитывает компоновку.</p><h3 id="penpot-клиент-серверная-платформа" tabindex="-1">Penpot: клиент-серверная платформа <a class="header-anchor" href="#penpot-клиент-серверная-платформа" aria-label="Permalink to “Penpot: клиент-серверная платформа”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Для полной установки Penpot нужны интерфейс, серверная часть JVM, PostgreSQL, Valkey, MinIO и экспортёр на основе Chromium без интерфейса. Среда разработки требует Docker Compose, JVM, Node и инструменты Rust.</p><p>OpenPencil избегает сетевой задержки, сериализации между службами, управления контейнерами и запросов к базе данных для обычных операций. Penpot рассчитан на многопользовательскую платформу с серверным размещением, а OpenPencil — на локальную работу с минимальной задержкой.</p><h2 id="_3-конвеиер-отрисовки" tabindex="-1">3. Конвейер отрисовки <a class="header-anchor" href="#_3-конвеиер-отрисовки" aria-label="Permalink to “3. Конвейер отрисовки”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil: TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil: TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">renderSceneToCanvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvas, graph, pageId) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.fillPaint.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">setColor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  canvas.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">drawRRect</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(rrect, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.fillPaint)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><ul><li>Один прямой переход из TypeScript в WASM.</li><li>SceneGraph остаётся в памяти JavaScript и не сериализуется перед отрисовкой.</li><li>Код отрисовки занимает около 3 200 строк и разделён на специализированные модули.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot: ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: ClojureScript → Rust WASM → Skia”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → разложение и бинарная упаковка в память WASM</span></span>
<span class="line"><span>  → Rust WASM через Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Без WASM каждая фигура отображается как элемент SVG DOM через React/Reagent. В режиме WASM UUID разбивается на четыре <code>u32</code>, преобразование — на шесть <code>f32</code>, заливки и обводки кодируются в двоичном виде, а основные свойства фигуры занимают структуру размером 104 байта.</p><p>Система использует кеш плиток, области интереса, 11 поверхностей отрисовки и глобальное изменяемое состояние через <code>unsafe { STATE.as_mut() }</code>. Кеш может хранить до 1024 текстур. OpenPencil перерисовывает видимую область целиком.</p><table tabindex="0"><thead><tr><th>Аспект</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Прямые вызовы с объектами TypeScript</td><td>Двоичные структуры</td></tr><tr><td>Модель</td><td>Полная отрисовка видимой области</td><td>Кеш плиток</td></tr><tr><td>Поверхности</td><td>1</td><td>11</td></tr><tr><td>Дополнительный кеш</td><td>Нет</td><td>До 1024 плиток</td></tr><tr><td>Размер кода отрисовки</td><td>около 3 200 строк</td><td>22 000 строк</td></tr><tr><td>Небезопасный код</td><td>Нет</td><td>Глобальное состояние через <code>unsafe</code></td></tr></tbody></table><p>Прямой путь CanvasKit требует меньше промежуточной обработки для небольших и средних документов. Кеш Penpot может быть выгоднее для документов со 100 000 и более фигур, когда видна лишь малая часть холста.</p><h2 id="_4-scenegraph-и-модель-данных" tabindex="-1">4. SceneGraph и модель данных <a class="header-anchor" href="#_4-scenegraph-и-модель-данных" aria-label="Permalink to “4. SceneGraph и модель данных”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nodes</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: Map</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">string, SceneNode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">&gt;</span></span></code></pre></div><p>OpenPencil обеспечивает поиск по идентификатору за O(1), 29 типов объектов из схемы Kiwi, около 390 полей в <code>NodeChange</code>, строгие типы TypeScript и GUID в формате Figma <code>sessionID:localID</code>.</p><p>Penpot поддерживает собственные определения типов в Clojure/ClojureScript и Rust. Отдельные модули отвечают за цвета, компоненты, контейнеры, заливки, сетку, модификаторы, страницы и контуры. Malli проверяет схемы во время выполнения, а данные отрисовки пересекают границу CLJS → Rust.</p><h2 id="_5-движок-компоновки" tabindex="-1">5. Движок компоновки <a class="header-anchor" href="#_5-движок-компоновки" aria-label="Permalink to “5. Движок компоновки”">​</a></h2><p>OpenPencil синхронно использует Yoga WASM:</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> root</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> Yoga.Node.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">create</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">root.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">setFlexDirection</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(FlexDirection.Row)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">root.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">calculateLayout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Penpot поддерживает собственные реализации Flex и Grid в ClojureScript и Rust WASM. Оба движка должны выдавать одинаковый результат. OpenPencil использует Yoga, включая ответвление с поддержкой Grid; Penpot поддерживает несколько тысяч строк собственного кода компоновки на двух языках.</p><h2 id="_6-форматы-и-figma" tabindex="-1">6. Форматы и Figma <a class="header-anchor" href="#_6-форматы-и-figma" aria-label="Permalink to “6. Форматы и Figma”">​</a></h2><p>OpenPencil использует бинарный формат Kiwi Figma, напрямую импортирует <code>.fig</code>, читает данные Kiwi из буфера обмена и совместим с многопользовательским протоколом Figma.</p><p>Файл <code>.penpot</code> — ZIP-архив с манифестами JSON, данными документа, бинарными ресурсами и миниатюрами. Penpot не импортирует <code>.fig</code> напрямую и поддерживает несколько поколений формата через систему миграций.</p><h2 id="_7-состояние-и-отмена" tabindex="-1">7. Состояние и отмена <a class="header-anchor" href="#_7-состояние-и-отмена" aria-label="Permalink to “7. Состояние и отмена”">​</a></h2><p>OpenPencil использует обратные команды: функции применения и отмены сохраняют только необходимое состояние, а несколько операций можно объединить.</p><p>Penpot использует Potok. <code>UpdateEvent</code> меняет состояние, <code>WatchEvent</code> выполняет побочные эффекты через RxJS, а история хранит обратные наборы изменений, ограничивается 50 записями и объединяет быстрые изменения в транзакции.</p><h2 id="_8-разработка" tabindex="-1">8. Разработка <a class="header-anchor" href="#_8-разработка" aria-label="Permalink to “8. Разработка”">​</a></h2><table tabindex="0"><thead><tr><th>Показатель</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Подготовка</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node и Rust</td></tr><tr><td>Быстрое обновление</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Типы</td><td>Строгий TypeScript</td><td>Схемы Malli во время выполнения</td></tr><tr><td>Настольная версия</td><td>Tauri v2</td><td>Браузер</td></tr><tr><td>Основные технологии</td><td>TypeScript и Vue</td><td>Clojure, ClojureScript, Rust и Docker</td></tr></tbody></table><h2 id="_9-производительность" tabindex="-1">9. Производительность <a class="header-anchor" href="#_9-производительность" aria-label="Permalink to “9. Производительность”">​</a></h2><table tabindex="0"><thead><tr><th>Сценарий</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Холодный запуск</td><td>менее 2 секунд с WASM</td><td>более 10 секунд для сервера, клиента и WASM</td></tr><tr><td>Обычная операция</td><td>Внутри одного процесса</td><td>Возможен сетевой обмен</td></tr><tr><td>Кадр</td><td>Прямой вызов Skia</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Базовая память</td><td>около 50 МБ во вкладке браузера</td><td>JVM, база данных, кеш и браузер</td></tr><tr><td>Работа без сети</td><td>Полная</td><td>Требует сервера</td></tr><tr><td>10 000 фигур</td><td>Один проход</td><td>Плиточная отрисовка с 11 поверхностями</td></tr></tbody></table><h2 id="_10-преимущества-penpot" tabindex="-1">10. Преимущества Penpot <a class="header-anchor" href="#_10-преимущества-penpot" aria-label="Permalink to “10. Преимущества Penpot”">​</a></h2><ol><li><strong>Серверная совместная работа:</strong> учётные записи, контроль доступа и центральное хранение через WebSockets.</li><li><strong>Экспорт PDF:</strong> отдельный экспортёр Chromium.</li><li><strong>Система плагинов:</strong> изолированное выполнение и API плагинов.</li><li><strong>Токены дизайна:</strong> встроенная поддержка.</li><li><strong>CSS Grid:</strong> собственная реализация; OpenPencil использует ответвление Yoga с Grid.</li><li><strong>Самостоятельное размещение:</strong> развёртывание для команды через Docker.</li><li><strong>Зрелость:</strong> несколько лет эксплуатации.</li></ol><h2 id="_11-сценарии-и-расширяемость" tabindex="-1">11. Сценарии и расширяемость <a class="header-anchor" href="#_11-сценарии-и-расширяемость" aria-label="Permalink to “11. Сценарии и расширяемость”">​</a></h2><p>Команда <a href="/programmable/cli/scripting"><code>eval</code></a> предоставляет совместимый с Figma Plugin API для сценариев без интерфейса, пакетных операций и автоматизированных тестов. Чат с ИИ, сервер MCP и CLI также предлагают 90 инструментов для чтения, создания, изменения, работы со структурой, переменными, векторными контурами, анализа, сравнения, логических операций и расположения.</p><p>Penpot предлагает изолированные плагины, но не имеет сопоставимого API для сценариев без интерфейса или интеграции MCP.</p><h2 id="итоги" tabindex="-1">Итоги <a class="header-anchor" href="#итоги" aria-label="Permalink to “Итоги”">​</a></h2><table tabindex="0"><thead><tr><th>Область</th><th>Преимущество</th><th>Причина</th></tr></thead><tbody><tr><td>Простота</td><td>OpenPencil</td><td>Один процесс вместо нескольких служб</td></tr><tr><td>Отрисовка</td><td>OpenPencil</td><td>Прямой путь CanvasKit</td></tr><tr><td>Кодовая база</td><td>OpenPencil</td><td>Около 26 000 против 299 000 строк</td></tr><tr><td>Совместимость с Figma</td><td>OpenPencil</td><td>Нативные Kiwi и <code>.fig</code></td></tr><tr><td>Разработка</td><td>OpenPencil</td><td>TypeScript и Vue вместо Clojure, Rust и Docker</td></tr><tr><td>Настольное приложение</td><td>OpenPencil</td><td>Tauri</td></tr><tr><td>Компоновка</td><td>OpenPencil</td><td>Yoga вместо двух собственных реализаций</td></tr><tr><td>Совместная работа</td><td>Разные преимущества</td><td>Penpot: сервер и контроль доступа; OpenPencil: P2P без размещения</td></tr><tr><td>Самостоятельное размещение</td><td>Penpot</td><td>Развёртывание Docker</td></tr><tr><td>Зрелость</td><td>Penpot</td><td>Многолетняя эксплуатация</td></tr></tbody></table><p>OpenPencil — компактный редактор в одном процессе с CanvasKit и нативной поддержкой <code>.fig</code>. Penpot — полная клиент-серверная платформа на Clojure, ClojureScript, Rust, базах данных и службах Docker. Оба поддерживают совместную работу, но используют разные модели.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
