import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/getting-started.md
var __pageData = JSON.parse("{\"title\":\"Начало работы\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Начало работы — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Начало работы — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"ru/getting-started.md\",\"filePath\":\"ru/getting-started.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "ru/getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="начало-работы" tabindex="-1">Начало работы <a class="header-anchor" href="#начало-работы" aria-label="Permalink to “Начало работы”">​</a></h1><h2 id="веб-версия" tabindex="-1">Веб-версия <a class="header-anchor" href="#веб-версия" aria-label="Permalink to “Веб-версия”">​</a></h2><p>OpenPencil работает прямо в браузере и не требует установки. Чтобы начать работу, откройте <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>.</p><p>Если вы хотите создать на основе OpenPencil собственный продукт, а не только пользоваться готовым приложением, перейдите в раздел <a href="/programmable/">Программирование и автоматизация</a> или прочитайте документацию <a href="/programmable/sdk/">Vue SDK</a>.</p><h2 id="приложение-для-компьютера" tabindex="-1">Приложение для компьютера <a class="header-anchor" href="#приложение-для-компьютера" aria-label="Permalink to “Приложение для компьютера”">​</a></h2><p>Готовые версии для macOS, Windows и Linux опубликованы на <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">странице релизов</a>.</p><table tabindex="0"><thead><tr><th>Платформа</th><th>Файл</th></tr></thead><tbody><tr><td>macOS (Apple Silicon)</td><td><code>.dmg</code> (aarch64)</td></tr><tr><td>macOS (Intel)</td><td><code>.dmg</code> (x64)</td></tr><tr><td>Windows (x64)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Windows (ARM)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Linux (x64)</td><td><code>.AppImage</code> / <code>.deb</code></td></tr></tbody></table><h2 id="системные-требования" tabindex="-1">Системные требования <a class="header-anchor" href="#системные-требования" aria-label="Permalink to “Системные требования”">​</a></h2><p>OpenPencil отрисовывает графику через CanvasKit на WebGL и использует современные возможности веб-платформы, поэтому нужен свежий движок браузера. Веб-версия работает в Chrome 111, Edge 111, Firefox 128 и Safari 16.4 или новее; браузеры на основе Chromium, например Brave и Opera, ориентируются на версию своего Chrome. Приложение для компьютера отрисовывает интерфейс в системном WebView, поэтому нижняя граница определяется движком операционной системы:</p><table tabindex="0"><thead><tr><th>Платформа</th><th>Требование</th></tr></thead><tbody><tr><td>macOS</td><td>macOS 13 Ventura или новее с актуальными обновлениями Safari (Safari 16.4 вышел вместе с macOS 13.3).</td></tr><tr><td>Windows</td><td>Windows 10 или новее со средой Microsoft Edge WebView2 Evergreen, которая обновляется сама.</td></tr><tr><td>Linux</td><td>WebKitGTK 2.40 или новее (<code>webkit2gtk-4.1</code>).</td></tr></tbody></table><p>Если движок слишком старый, OpenPencil вместо пустого окна показывает, что нужно обновить. Если вы видите такое уведомление в системе, которая подходит под требования, воспользуйтесь ссылкой «Report a problem»: в ней уже указаны сведения о браузере и движке.</p><h2 id="установка-в-macos-через-homebrew" tabindex="-1">Установка в macOS через Homebrew <a class="header-anchor" href="#установка-в-macos-через-homebrew" aria-label="Permalink to “Установка в macOS через Homebrew”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><p>Команда устанавливает подписанное приложение для Mac с Apple Silicon или Intel из <a href="https://formulae.brew.sh/cask/openpencil" target="_blank" rel="noreferrer">официального каталога Homebrew</a>. Обновления проходят проверку в Homebrew и могут появляться позже релизов на GitHub. До обновления каталога используйте <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">прямую загрузку</a>. CLI устанавливается отдельно: <code>npm install -g @open-pencil/cli</code>.</p><p>Если вы использовали архивный собственный tap, перейдите так:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> uninstall</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil/tap/open-pencil</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><h2 id="сборка-из-исходного-кода" tabindex="-1">Сборка из исходного кода <a class="header-anchor" href="#сборка-из-исходного-кода" aria-label="Permalink to “Сборка из исходного кода”">​</a></h2><h3 id="что-потребуется" tabindex="-1">Что потребуется <a class="header-anchor" href="#что-потребуется" aria-label="Permalink to “Что потребуется”">​</a></h3><ul><li><a href="https://bun.sh/" target="_blank" rel="noreferrer">Bun</a> — среда выполнения и менеджер пакетов;</li><li><a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> — только для приложения Tauri.</li></ul><h3 id="установка" tabindex="-1">Установка <a class="header-anchor" href="#установка" aria-label="Permalink to “Установка”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">git</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> https://github.com/open-pencil/open-pencil.git</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">cd</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span></span></code></pre></div><h3 id="сервер-для-разработки" tabindex="-1">Сервер для разработки <a class="header-anchor" href="#сервер-для-разработки" aria-label="Permalink to “Сервер для разработки”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><p>Редактор будет доступен по адресу <code>http://localhost:1420</code>.</p><h3 id="команды" tabindex="-1">Команды <a class="header-anchor" href="#команды" aria-label="Permalink to “Команды”">​</a></h3><table tabindex="0"><thead><tr><th>Команда</th><th>Назначение</th></tr></thead><tbody><tr><td><code>bun run dev</code></td><td>Запустить сервер разработки с HMR</td></tr><tr><td><code>bun run build</code></td><td>Собрать версию для публикации</td></tr><tr><td><code>bun run check</code></td><td>Запустить oxlint и проверку типов с помощью tsgo</td></tr><tr><td><code>bun run test</code></td><td>Запустить сквозные тесты и сравнение внешнего вида в Playwright</td></tr><tr><td><code>bun run test:update</code></td><td>Обновить эталонные снимки экрана</td></tr><tr><td><code>bun run test:unit</code></td><td>Запустить модульные тесты с помощью bun:test</td></tr><tr><td><code>bun run docs:dev</code></td><td>Запустить сервер разработки документации</td></tr><tr><td><code>bun run docs:build</code></td><td>Быстро собрать документацию для локальной проверки</td></tr><tr><td><code>bun run docs:build:production</code></td><td>Полностью собрать документацию для публикации, включая файлы для LLM</td></tr></tbody></table><h2 id="приложение-tauri" tabindex="-1">Приложение Tauri <a class="header-anchor" href="#приложение-tauri" aria-label="Permalink to “Приложение Tauri”">​</a></h2><p>Для сборки приложения Tauri нужны Rust и системные компоненты выбранной платформы.</p><h3 id="macos" tabindex="-1">macOS <a class="header-anchor" href="#macos" aria-label="Permalink to “macOS”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">xcode-select</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --install</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">cargo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --version</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;^2&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><h3 id="windows" tabindex="-1">Windows <a class="header-anchor" href="#windows" aria-label="Permalink to “Windows”">​</a></h3><ol><li>Установите <a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> с toolchain <code>stable-msvc</code>:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rustup</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> default</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> stable-msvc</span></span></code></pre></div></li><li>Установите <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual Studio Build Tools</a> и выберите workload <strong>Desktop development with C++</strong>.</li><li>WebView2 уже входит в Windows 10 версии 1803 и новее, а также в Windows 11.</li><li>Выполните:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div></li></ol><h3 id="linux" tabindex="-1">Linux <a class="header-anchor" href="#linux" aria-label="Permalink to “Linux”">​</a></h3><p>В Debian или Ubuntu установите системные зависимости:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">sudo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> apt</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libwebkit2gtk-4.1-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build-essential</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> wget</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> file</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  libxdo-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libssl-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> libayatana-appindicator3-dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> librsvg2-dev</span></span></code></pre></div><p>Затем выполните:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dev</span></span></code></pre></div><h3 id="сборка-установочного-пакета" tabindex="-1">Сборка установочного пакета <a class="header-anchor" href="#сборка-установочного-пакета" aria-label="Permalink to “Сборка установочного пакета”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                                    # Текущая платформа</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tauri</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --target</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> universal-apple-darwin</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # Universal binary для macOS</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
