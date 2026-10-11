import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/getting-started.md
var __pageData = JSON.parse("{\"title\":\"Pierwsze kroki\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Pierwsze kroki — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Pierwsze kroki — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"pl/getting-started.md\",\"filePath\":\"pl/getting-started.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "pl/getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="pierwsze-kroki" tabindex="-1">Pierwsze kroki <a class="header-anchor" href="#pierwsze-kroki" aria-label="Permalink to “Pierwsze kroki”">​</a></h1><h2 id="wersja-internetowa" tabindex="-1">Wersja internetowa <a class="header-anchor" href="#wersja-internetowa" aria-label="Permalink to “Wersja internetowa”">​</a></h2><p>OpenPencil działa bezpośrednio w przeglądarce i nie wymaga instalacji. Otwórz <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, aby rozpocząć pracę.</p><p>Jeśli chcesz zbudować własny produkt na bazie OpenPencil, a nie tylko korzystać z gotowej aplikacji, przejdź do sekcji <a href="/programmable/">Automatyzacja</a> lub dokumentacji <a href="/programmable/sdk/">Vue SDK</a>.</p><h2 id="aplikacja-na-komputer" tabindex="-1">Aplikacja na komputer <a class="header-anchor" href="#aplikacja-na-komputer" aria-label="Permalink to “Aplikacja na komputer”">​</a></h2><p>Gotowe wersje dla macOS, Windows i Linux są dostępne na <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">stronie wydań</a>.</p><table tabindex="0"><thead><tr><th>Platforma</th><th>Plik</th></tr></thead><tbody><tr><td>macOS (Apple Silicon)</td><td><code>.dmg</code> (aarch64)</td></tr><tr><td>macOS (Intel)</td><td><code>.dmg</code> (x64)</td></tr><tr><td>Windows (x64)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Windows (ARM)</td><td><code>.msi</code> / <code>.exe</code></td></tr><tr><td>Linux (x64)</td><td><code>.AppImage</code> / <code>.deb</code></td></tr></tbody></table><h2 id="wymagania-systemowe" tabindex="-1">Wymagania systemowe <a class="header-anchor" href="#wymagania-systemowe" aria-label="Permalink to “Wymagania systemowe”">​</a></h2><p>OpenPencil renderuje przez CanvasKit na WebGL i korzysta z nowoczesnych funkcji platformy webowej, dlatego wymaga aktualnego silnika przeglądarki. Wersja internetowa działa w Chrome 111, Edge 111, Firefox 128 i Safari 16.4 lub nowszych; przeglądarki oparte na Chromium, takie jak Brave i Opera, odpowiadają wersji Chrome, na której bazują. Aplikacja na komputer renderuje w systemowym WebView, więc jej minimum wyznacza silnik systemu operacyjnego:</p><table tabindex="0"><thead><tr><th>Platforma</th><th>Wymaganie</th></tr></thead><tbody><tr><td>macOS</td><td>macOS 13 Ventura lub nowszy z zainstalowanymi bieżącymi aktualizacjami Safari (Safari 16.4 trafiło do systemu w macOS 13.3).</td></tr><tr><td>Windows</td><td>Windows 10 lub nowszy z środowiskiem Microsoft Edge WebView2 Evergreen, które aktualizuje się samo.</td></tr><tr><td>Linux</td><td>WebKitGTK 2.40 lub nowszy (<code>webkit2gtk-4.1</code>).</td></tr></tbody></table><p>Gdy silnik jest zbyt stary, OpenPencil zamiast pustego okna pokazuje, co należy zaktualizować. Jeśli widzisz to powiadomienie w systemie spełniającym wymagania, użyj odnośnika „Report a problem”, który uzupełnia dane przeglądarki i silnika.</p><h2 id="instalacja-w-macos-przez-homebrew" tabindex="-1">Instalacja w macOS przez Homebrew <a class="header-anchor" href="#instalacja-w-macos-przez-homebrew" aria-label="Permalink to “Instalacja w macOS przez Homebrew”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><p>Polecenie instaluje podpisaną aplikację dla komputerów Mac z Apple Silicon lub procesorem Intel z <a href="https://formulae.brew.sh/cask/openpencil" target="_blank" rel="noreferrer">oficjalnego katalogu Homebrew</a>. Aktualizacje są weryfikowane przez Homebrew i mogą pojawiać się później niż wydania na GitHubie. W tym czasie skorzystaj z <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">bezpośredniego pobierania</a>. CLI instaluje się osobno: <code>npm install -g @open-pencil/cli</code>.</p><p>Jeśli używałeś zarchiwizowanego własnego tapa, przeprowadź migrację:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> openpencil</span></span></code></pre></div><h2 id="budowanie-ze-zrodeł" tabindex="-1">Budowanie ze źródeł <a class="header-anchor" href="#budowanie-ze-zrodeł" aria-label="Permalink to “Budowanie ze źródeł”">​</a></h2><h3 id="wymagania" tabindex="-1">Wymagania <a class="header-anchor" href="#wymagania" aria-label="Permalink to “Wymagania”">​</a></h3><ul><li><a href="https://bun.sh/" target="_blank" rel="noreferrer">Bun</a> — runtime i package manager;</li><li><a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> — tylko do aplikacji Tauri.</li></ul><h3 id="instalacja" tabindex="-1">Instalacja <a class="header-anchor" href="#instalacja" aria-label="Permalink to “Instalacja”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> install</span></span></code></pre></div><h3 id="serwer-deweloperski" tabindex="-1">Serwer deweloperski <a class="header-anchor" href="#serwer-deweloperski" aria-label="Permalink to “Serwer deweloperski”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><p>Edytor będzie dostępny pod adresem <code>http://localhost:1420</code>.</p><h3 id="polecenia" tabindex="-1">Polecenia <a class="header-anchor" href="#polecenia" aria-label="Permalink to “Polecenia”">​</a></h3><table tabindex="0"><thead><tr><th>Polecenie</th><th>Zastosowanie</th></tr></thead><tbody><tr><td><code>bun run dev</code></td><td>Uruchamia serwer deweloperski z HMR</td></tr><tr><td><code>bun run build</code></td><td>Buduje wersję produkcyjną</td></tr><tr><td><code>bun run check</code></td><td>Uruchamia oxlint i sprawdzanie typów za pomocą tsgo</td></tr><tr><td><code>bun run test</code></td><td>Uruchamia testy E2E i testy wyglądu w Playwright</td></tr><tr><td><code>bun run test:update</code></td><td>Aktualizuje wzorcowe zrzuty ekranu</td></tr><tr><td><code>bun run test:unit</code></td><td>Uruchamia testy jednostkowe za pomocą bun:test</td></tr><tr><td><code>bun run docs:dev</code></td><td>Uruchamia serwer deweloperski dokumentacji</td></tr><tr><td><code>bun run docs:build</code></td><td>Szybko buduje dokumentację do lokalnej weryfikacji</td></tr><tr><td><code>bun run docs:build:production</code></td><td>Buduje pełną wersję dokumentacji do publikacji, w tym pliki dla LLM</td></tr></tbody></table><h2 id="aplikacja-tauri" tabindex="-1">Aplikacja Tauri <a class="header-anchor" href="#aplikacja-tauri" aria-label="Permalink to “Aplikacja Tauri”">​</a></h2><p>Do zbudowania aplikacji Tauri potrzebne są Rust i składniki systemowe właściwe dla danej platformy.</p><h3 id="macos" tabindex="-1">macOS <a class="header-anchor" href="#macos" aria-label="Permalink to “macOS”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="windows" tabindex="-1">Windows <a class="header-anchor" href="#windows" aria-label="Permalink to “Windows”">​</a></h3><ol><li>Zainstaluj <a href="https://rustup.rs/" target="_blank" rel="noreferrer">Rust</a> z toolchain <code>stable-msvc</code>:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> stable-msvc</span></span></code></pre></div></li><li>Zainstaluj <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual Studio Build Tools</a> i wybierz workload <strong>Desktop development with C++</strong>.</li><li>WebView2 jest już częścią Windows 10 w wersji 1803 lub nowszej oraz Windows 11.</li><li>Uruchom:<div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div></li></ol><h3 id="linux" tabindex="-1">Linux <a class="header-anchor" href="#linux" aria-label="Permalink to “Linux”">​</a></h3><p>W Debianie lub Ubuntu zainstaluj zależności systemowe:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> librsvg2-dev</span></span></code></pre></div><p>Następnie uruchom:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> dev</span></span></code></pre></div><h3 id="budowanie-pakietu-instalacyjnego" tabindex="-1">Budowanie pakietu instalacyjnego <a class="header-anchor" href="#budowanie-pakietu-instalacyjnego" aria-label="Permalink to “Budowanie pakietu instalacyjnego”">​</a></h3><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                                    # Bieżąca platforma</span></span>
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
	})}">    # Universal binary dla macOS</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
