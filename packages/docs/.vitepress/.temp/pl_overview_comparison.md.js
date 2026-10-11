import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/overview/comparison.md
var __pageData = JSON.parse("{\"title\":\"OpenPencil i Penpot: architektura oraz wydajność\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/comparison\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/comparison\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/comparison\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"OpenPencil i Penpot: architektura oraz wydajność — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"OpenPencil i Penpot: architektura oraz wydajność — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"pl/overview/comparison.md\",\"filePath\":\"pl/overview/comparison.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/overview/comparison.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="openpencil-i-penpot-architektura-oraz-wydajnosc" tabindex="-1">OpenPencil i Penpot: architektura oraz wydajność <a class="header-anchor" href="#openpencil-i-penpot-architektura-oraz-wydajnosc" aria-label="Permalink to “OpenPencil i Penpot: architektura oraz wydajność”">​</a></h1><p>OpenPencil i Penpot to narzędzia projektowe o otwartym kodzie źródłowym, ale różnią się przeznaczeniem i architekturą.</p><div class="info custom-block"><p class="custom-block-title">Renderer WASM w Penpot</p><p>Penpot 2.x zawiera renderer Rust/Skia WASM <code>render-wasm/v1</code>, włączany opcjami serwera albo parametrem <code>?wasm=true</code>. Domyślnie nadal działa renderer SVG. Poniżej uwzględniono oba warianty.</p></div><h2 id="_1-rozmiar-bazy-kodu" tabindex="-1">1. Rozmiar bazy kodu <a class="header-anchor" href="#_1-rozmiar-bazy-kodu" aria-label="Permalink to “1. Rozmiar bazy kodu”">​</a></h2><table tabindex="0"><thead><tr><th>Wskaźnik</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Wiersze kodu</td><td><strong>około 26 000</strong></td><td><strong>około 299 000</strong></td></tr><tr><td>Pliki źródłowe</td><td>około 143</td><td>około 2 900</td></tr><tr><td>Języki</td><td>TypeScript, Vue</td><td>Clojure, ClojureScript, Rust, JavaScript, SQL, SCSS</td></tr><tr><td>Kod renderera</td><td>około 3 200 wierszy, TypeScript</td><td>22 000 wierszy, Rust/Skia WASM</td></tr><tr><td>Interfejs</td><td>około 4 500 wierszy</td><td>około 175 000 wierszy, CLJS i SCSS</td></tr><tr><td>Część serwerowa</td><td>Brak, architektura lokalna</td><td>32 600 wierszy i 151 plików SQL</td></tr><tr><td>Stosunek</td><td><strong>1×</strong></td><td><strong>około 11×</strong></td></tr></tbody></table><p>OpenPencil jest około jedenaście razy mniejszy. Wynika to przede wszystkim z innej architektury, a nie tylko z mniejszej liczby funkcji.</p><h2 id="_2-architektura" tabindex="-1">2. Architektura <a class="header-anchor" href="#_2-architektura" aria-label="Permalink to “2. Architektura”">​</a></h2><h3 id="openpencil-jeden-proces-klienta" tabindex="-1">OpenPencil: jeden proces klienta <a class="header-anchor" href="#openpencil-jeden-proces-klienta" aria-label="Permalink to “OpenPencil: jeden proces klienta”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
<span class="line"><span>└─────────────────────────────────┘</span></span></code></pre></div><p>Edytor, SceneGraph, kodek plików i renderer działają w jednym procesie. Oddzielny serwer, baza danych i Docker nie są potrzebne. SceneGraph jest przechowywany jako <code>Map&lt;string, SceneNode&gt;</code>. TypeScript wywołuje CanvasKit bezpośrednio, a Yoga WASM synchronicznie oblicza układ.</p><h3 id="penpot-platforma-klient-serwer" tabindex="-1">Penpot: platforma klient-serwer <a class="header-anchor" href="#penpot-platforma-klient-serwer" aria-label="Permalink to “Penpot: platforma klient-serwer”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Docker Compose                     │</span></span>
<span class="line"><span>│  ClojureScript frontend │ Clojure/JVM backend        │</span></span>
<span class="line"><span>│  Rust/Skia WASM         │ PostgreSQL, Valkey, MinIO  │</span></span>
<span class="line"><span>│  Chromium exporter      │ MCP server                 │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span></code></pre></div><p>Pełna instalacja Penpota obejmuje interfejs, część serwerową JVM, PostgreSQL, Valkey, MinIO i eksporter oparty na Chromium bez interfejsu. Środowisko programistyczne wymaga Docker Compose, JVM, Node i zestawu narzędzi Rust.</p><p>OpenPencil unika opóźnień sieciowych, serializacji między usługami, zarządzania kontenerami i zapytań do bazy danych podczas zwykłych operacji. Penpot jest przeznaczony do wieloosobowej pracy na serwerze, a OpenPencil — do lokalnej edycji z małym opóźnieniem.</p><h2 id="_3-potok-renderowania" tabindex="-1">3. Potok renderowania <a class="header-anchor" href="#_3-potok-renderowania" aria-label="Permalink to “3. Potok renderowania”">​</a></h2><h3 id="openpencil-typescript-→-canvaskit-wasm" tabindex="-1">OpenPencil: TypeScript → CanvasKit WASM <a class="header-anchor" href="#openpencil-typescript-→-canvaskit-wasm" aria-label="Permalink to “OpenPencil: TypeScript → CanvasKit WASM”">​</a></h3><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">}</span></span></code></pre></div><ul><li>Bezpośrednie przejście z TypeScript do WASM.</li><li>SceneGraph pozostaje w pamięci JavaScript i nie jest serializowany przed renderowaniem.</li><li>Renderer liczy około 3 200 wierszy podzielonych na wyspecjalizowane moduły.</li></ul><h3 id="penpot-clojurescript-→-rust-wasm-→-skia" tabindex="-1">Penpot: ClojureScript → Rust WASM → Skia <a class="header-anchor" href="#penpot-clojurescript-→-rust-wasm-→-skia" aria-label="Permalink to “Penpot: ClojureScript → Rust WASM → Skia”">​</a></h3><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>ClojureScript → JavaScript</span></span>
<span class="line"><span>  → rozłożenie i pakowanie binarne w pamięci WASM</span></span>
<span class="line"><span>  → Rust WASM przez Emscripten C FFI</span></span>
<span class="line"><span>  → skia-safe</span></span>
<span class="line"><span>  → Skia/WebGL</span></span></code></pre></div><p>Bez WASM każdy kształt jest renderowany jako element SVG DOM przez React/Reagent. W trybie WASM identyfikatory UUID, transformacje, zalewy i obwiednie są pakowane do struktur binarnych. Renderer używa pamięci podręcznej kafelków, obszarów zainteresowania, jedenastu powierzchni i globalnego zmiennego stanu przez <code>unsafe</code>.</p><p>Pamięć podręczna może przechowywać do 1024 tekstur. OpenPencil przerysowuje całą widoczną część dokumentu.</p><table tabindex="0"><thead><tr><th>Aspekt</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>JavaScript → WASM</td><td>Bezpośrednie wywołania z obiektami TypeScript</td><td>Struktury binarne</td></tr><tr><td>Model</td><td>Pełne przerysowanie widoku</td><td>Pamięć podręczna kafelków</td></tr><tr><td>Powierzchnie</td><td>1</td><td>11</td></tr><tr><td>Dodatkowa pamięć</td><td>Brak kafelków</td><td>Do 1024 kafelków</td></tr><tr><td>Rozmiar renderera</td><td>około 3 200 wierszy</td><td>22 000 wierszy</td></tr><tr><td>Kod niebezpieczny</td><td>Brak</td><td>Stan globalny przez <code>unsafe</code></td></tr></tbody></table><p>Bezpośredni potok CanvasKit wymaga mniej przetwarzania pośredniego w małych i średnich dokumentach. Kafelki Penpota mogą być korzystne przy ponad 100 000 kształtów, gdy widoczny jest tylko niewielki obszar.</p><h2 id="_4-scenegraph-i-model-danych" tabindex="-1">4. SceneGraph i model danych <a class="header-anchor" href="#_4-scenegraph-i-model-danych" aria-label="Permalink to “4. SceneGraph i model danych”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><p>OpenPencil zapewnia wyszukiwanie po identyfikatorze w O(1), 29 typów obiektów ze schematu Kiwi, około 390 pól w <code>NodeChange</code>, ścisłe typy TypeScript i identyfikatory GUID w formacie Figma <code>sessionID:localID</code>.</p><p>Penpot utrzymuje własne definicje typów w Clojure/ClojureScript i Rust. Oddzielne moduły odpowiadają za kolory, komponenty, kontenery, zalewy, siatkę, modyfikatory, strony i ścieżki. Malli sprawdza schematy podczas działania, a dane renderowania przekraczają granicę CLJS → Rust.</p><h2 id="_5-silnik-układu" tabindex="-1">5. Silnik układu <a class="header-anchor" href="#_5-silnik-układu" aria-label="Permalink to “5. Silnik układu”">​</a></h2><p>OpenPencil synchronicznie korzysta z Yoga WASM:</p><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">()</span></span></code></pre></div><p>Penpot utrzymuje własne implementacje Flex i Grid w ClojureScript i Rust WASM. Oba silniki muszą zwracać ten sam wynik. OpenPencil używa Yoga, w tym odmiany z obsługą Grid; Penpot utrzymuje tysiące wierszy własnego kodu układu w dwóch językach.</p><h2 id="_6-formaty-i-figma" tabindex="-1">6. Formaty i Figma <a class="header-anchor" href="#_6-formaty-i-figma" aria-label="Permalink to “6. Formaty i Figma”">​</a></h2><p>OpenPencil używa binarnego formatu Kiwi Figma, bezpośrednio importuje <code>.fig</code>, odczytuje dane Kiwi ze schowka i jest zgodny z protokołem współpracy Figma.</p><p>Plik <code>.penpot</code> to archiwum ZIP z manifestami JSON, danymi dokumentu, zasobami binarnymi i miniaturami. Penpot nie importuje <code>.fig</code> bezpośrednio i obsługuje kilka generacji formatu przez migracje.</p><h2 id="_7-stan-i-cofanie" tabindex="-1">7. Stan i cofanie <a class="header-anchor" href="#_7-stan-i-cofanie" aria-label="Permalink to “7. Stan i cofanie”">​</a></h2><p>OpenPencil używa poleceń odwrotnych: funkcje wykonania i cofania przechowują tylko niezbędny stan, a kilka operacji można grupować.</p><p>Penpot korzysta z Potok. <code>UpdateEvent</code> zmienia stan, <code>WatchEvent</code> wykonuje skutki uboczne przez RxJS, a historia przechowuje odwrotne zestawy zmian, ogranicza się do 50 wpisów i grupuje szybkie zmiany w transakcje.</p><h2 id="_8-programowanie" tabindex="-1">8. Programowanie <a class="header-anchor" href="#_8-programowanie" aria-label="Permalink to “8. Programowanie”">​</a></h2><table tabindex="0"><thead><tr><th>Wskaźnik</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Przygotowanie</td><td><code>bun install &amp;&amp; bun dev</code></td><td>Docker Compose, JVM, Node i Rust</td></tr><tr><td>Szybkie odświeżanie</td><td>Vite</td><td>shadow-cljs</td></tr><tr><td>Typy</td><td>Ścisły TypeScript</td><td>Schematy Malli podczas działania</td></tr><tr><td>Wersja komputerowa</td><td>Tauri v2</td><td>Przeglądarka</td></tr><tr><td>Główne technologie</td><td>TypeScript i Vue</td><td>Clojure, ClojureScript, Rust i Docker</td></tr></tbody></table><h2 id="_9-wydajnosc" tabindex="-1">9. Wydajność <a class="header-anchor" href="#_9-wydajnosc" aria-label="Permalink to “9. Wydajność”">​</a></h2><table tabindex="0"><thead><tr><th>Scenariusz</th><th>OpenPencil</th><th>Penpot</th></tr></thead><tbody><tr><td>Zimny start</td><td>poniżej 2 s z WASM</td><td>ponad 10 s dla serwera, klienta i WASM</td></tr><tr><td>Zwykła operacja</td><td>W jednym procesie</td><td>Możliwa wymiana sieciowa</td></tr><tr><td>Klatka</td><td>Bezpośrednie wywołanie Skia</td><td>CLJS → JS → WASM FFI → Skia</td></tr><tr><td>Pamięć bazowa</td><td>około 50 MB w karcie</td><td>JVM, baza danych, pamięć podręczna i przeglądarka</td></tr><tr><td>Praca bez sieci</td><td>Pełna</td><td>Wymaga serwera</td></tr><tr><td>10 000 kształtów</td><td>Jedno przejście</td><td>Renderer kafelkowy z 11 powierzchniami</td></tr></tbody></table><h2 id="_10-zalety-penpota" tabindex="-1">10. Zalety Penpota <a class="header-anchor" href="#_10-zalety-penpota" aria-label="Permalink to “10. Zalety Penpota”">​</a></h2><ol><li><strong>Współpraca przez serwer:</strong> konta, kontrola dostępu i centralne przechowywanie.</li><li><strong>Eksport PDF:</strong> oddzielny eksporter Chromium.</li><li><strong>System wtyczek:</strong> wykonanie w izolacji i API wtyczek.</li><li><strong>Tokeny projektu:</strong> wbudowana obsługa.</li><li><strong>CSS Grid:</strong> własna implementacja; OpenPencil używa odmiany Yoga z Grid.</li><li><strong>Samodzielne wdrożenie:</strong> platforma zespołowa uruchamiana przez Docker.</li><li><strong>Dojrzałość:</strong> wiele lat użycia produkcyjnego.</li></ol><h2 id="_11-skrypty-i-rozszerzanie" tabindex="-1">11. Skrypty i rozszerzanie <a class="header-anchor" href="#_11-skrypty-i-rozszerzanie" aria-label="Permalink to “11. Skrypty i rozszerzanie”">​</a></h2><p>Polecenie <a href="/programmable/cli/scripting"><code>eval</code></a> udostępnia API zgodne z Figma Plugin API dla skryptów bez interfejsu, operacji grupowych i automatycznych testów. AI Chat, serwer MCP i CLI oferują również 90 narzędzi do odczytu, tworzenia, modyfikacji, pracy ze strukturą, zmiennymi, ścieżkami wektorowymi, analizą, różnicami, operacjami logicznymi i rozmieszczaniem.</p><p>Penpot oferuje wtyczki wykonywane w izolacji, ale nie ma porównywalnego API dla skryptów bez interfejsu ani integracji MCP.</p><h2 id="podsumowanie" tabindex="-1">Podsumowanie <a class="header-anchor" href="#podsumowanie" aria-label="Permalink to “Podsumowanie”">​</a></h2><table tabindex="0"><thead><tr><th>Obszar</th><th>Przewaga</th><th>Powód</th></tr></thead><tbody><tr><td>Prostota</td><td>OpenPencil</td><td>Jeden proces zamiast wielu usług</td></tr><tr><td>Renderowanie</td><td>OpenPencil</td><td>Bezpośredni potok CanvasKit</td></tr><tr><td>Kod</td><td>OpenPencil</td><td>Około 26 000 wobec 299 000 wierszy</td></tr><tr><td>Zgodność z Figmą</td><td>OpenPencil</td><td>Natywne Kiwi i <code>.fig</code></td></tr><tr><td>Programowanie</td><td>OpenPencil</td><td>TypeScript i Vue zamiast Clojure, Rust i Docker</td></tr><tr><td>Aplikacja komputerowa</td><td>OpenPencil</td><td>Tauri</td></tr><tr><td>Układ</td><td>OpenPencil</td><td>Yoga zamiast dwóch własnych implementacji</td></tr><tr><td>Współpraca</td><td>Różne mocne strony</td><td>Penpot: serwer i kontrola dostępu; OpenPencil: P2P bez hostingu</td></tr><tr><td>Samodzielne wdrożenie</td><td>Penpot</td><td>Docker</td></tr><tr><td>Dojrzałość</td><td>Penpot</td><td>Wieloletnie użycie produkcyjne</td></tr></tbody></table><p>OpenPencil to zwarty edytor działający w jednym procesie, z CanvasKit i natywną obsługą <code>.fig</code>. Penpot to pełna platforma klient-serwer wykorzystująca Clojure, ClojureScript, Rust, bazy danych i usługi Docker. Oba narzędzia obsługują współpracę, ale korzystają z innych modeli.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/overview/comparison.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var comparison_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, comparison_default as default };
