import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/overview/features.md
var __pageData = JSON.parse("{\"title\":\"Funkcje\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/overview/features\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/overview/features\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/overview/features\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Funkcje — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Funkcje — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"pl/overview/features.md\",\"filePath\":\"pl/overview/features.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "pl/overview/features.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="funkcje" tabindex="-1">Funkcje <a class="header-anchor" href="#funkcje" aria-label="Permalink to “Funkcje”">​</a></h1><h2 id="pliki-figma" tabindex="-1">Pliki Figma <a class="header-anchor" href="#pliki-figma" aria-label="Permalink to “Pliki Figma”">​</a></h2><p>OpenPencil otwiera i zapisuje pliki <code>.fig</code> bez wcześniejszej konwersji. Import i eksport korzystają z binarnego kodeka Kiwi używanego przez Figmę: 194 definicje schematu i około 390 pól dla każdego obiektu. Zapisz: <kbd>⌘</kbd><kbd>S</kbd>; Zapisz jako: <kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>.</p><p><strong>Kopiowanie między Figmą a OpenPencil:</strong> skopiuj obiekty w jednym edytorze i wklej w drugim. Zachowywane są zalewy, obwiednie, automatyczny układ, tekst, efekty, promienie narożników i sieci wektorowe. Wymiana działa w obie strony.</p><h2 id="rysowanie-i-edycja" tabindex="-1">Rysowanie i edycja <a class="header-anchor" href="#rysowanie-i-edycja" aria-label="Permalink to “Rysowanie i edycja”">​</a></h2><ul><li><strong>Figury:</strong> prostokąt, elipsa, linia, wielokąt i gwiazda.</li><li><strong>Pióro:</strong> sieci wektorowe, krzywe Béziera i uchwyty stycznych.</li><li><strong>Tekst:</strong> edycja bezpośrednio na obszarze roboczym i obsługa IME.</li><li><strong>Formatowanie tekstu:</strong> pogrubienie, kursywa, podkreślenie i przekreślenie wybranych zakresów.</li><li><strong>Automatyczny układ:</strong> Flexbox i CSS Grid przez Yoga WASM; kierunek, odstępy, wypełnienie, wyrównanie, rozmiary i ścieżki siatki.</li><li><strong>Komponenty:</strong> tworzenie komponentów i zestawów, egzemplarze, nadpisania oraz automatyczna synchronizacja.</li><li><strong>Zmienne:</strong> tokeny projektu z kolekcjami, trybami Light i Dark, typami Color, Float, String i Boolean oraz powiązaniami.</li><li><strong>Sekcje:</strong> kontenery najwyższego poziomu przejmujące przecinające się obiekty.</li></ul><h2 id="panel-własciwosci" tabindex="-1">Panel właściwości <a class="header-anchor" href="#panel-własciwosci" aria-label="Permalink to “Panel właściwości”">​</a></h2><p>Zawartość kart „Design”, „Kod”, „AI” i „Sprawdź” zależy od zaznaczenia.</p><ul><li><strong>Wygląd:</strong> przezroczystość, wspólny lub osobny promień narożników i widoczność.</li><li><strong>Zalew:</strong> kolor jednolity, gradient liniowy, radialny, kątowy lub diamentowy oraz obraz.</li><li><strong>Obwiednia:</strong> kolor, grubość, wyrównanie, osobna grubość boków, zakończenia, łączenia i kreskowanie.</li><li><strong>Efekty:</strong> cień zewnętrzny i wewnętrzny, rozmycie warstwy, tła i pierwszego planu.</li><li><strong>Typografia:</strong> wybór czcionki z wyszukiwaniem i wirtualnym przewijaniem, odmiana, rozmiar, wyrównanie i formatowanie.</li><li><strong>Układ:</strong> ustawienia automatycznego układu.</li><li><strong>Eksport:</strong> skala, format PNG/JPG/WEBP/SVG i podgląd.</li><li><strong>Kod:</strong> Design JSX i Tailwind JSX dla zaznaczenia; dwukierunkowa edycja Design JSX na żywo aktualizuje kod wraz ze zmianami warstw. Element pod kursorem obrysowuje swoją warstwę na obszarze roboczym, a problemy projektowe są podkreślone przy właściwości, która je powoduje.</li><li><strong>Sprawdź:</strong> lint projektu na żywo dla strony lub zaznaczenia: niski kontrast, małe obszary dotykowe, niepowiązane kolory, odstępy spoza skali. Znaczniki problemów widać na obszarze roboczym, a zmienną można powiązać jednym kliknięciem (<a href="/user-guide/checking-designs">Checking Designs</a>).</li></ul><h2 id="renderowanie" tabindex="-1">Renderowanie <a class="header-anchor" href="#renderowanie" aria-label="Permalink to “Renderowanie”">​</a></h2><p>OpenPencil używa Skia przez CanvasKit WASM — tego samego silnika graficznego co Figma:</p><ul><li>gradienty liniowe, radialne, kątowe i diamentowe;</li><li>zalewy obrazami z różnymi trybami skalowania;</li><li>pamięć podręczna efektów osobnych obiektów;</li><li>łuki, częściowe elipsy i pierścienie;</li><li>pomijanie obiektów poza widokiem i ponowne użycie pędzli;</li><li>prowadnice przyciągania z uwzględnieniem obrotu;</li><li>linijki z zakresem zaznaczenia;</li><li>podświetlenie zgodne z rzeczywistą geometrią.</li></ul><h2 id="cofanie-i-ponawianie" tabindex="-1">Cofanie i ponawianie <a class="header-anchor" href="#cofanie-i-ponawianie" aria-label="Permalink to “Cofanie i ponawianie”">​</a></h2><p>Można cofnąć tworzenie, usuwanie, przesuwanie, zmianę rozmiaru, właściwości i rodzica, układ oraz zmienne. Skróty: <kbd>⌘</kbd><kbd>Z</kbd> i <kbd>⇧</kbd><kbd>⌘</kbd><kbd>Z</kbd>.</p><h2 id="strony-i-dokumenty" tabindex="-1">Strony i dokumenty <a class="header-anchor" href="#strony-i-dokumenty" aria-label="Permalink to “Strony i dokumenty”">​</a></h2><p>Strony można dodawać, usuwać i przemianowywać; każda zachowuje własne położenie i skalę widoku. Wiele dokumentów można otworzyć w kartach.</p><h2 id="eksport" tabindex="-1">Eksport <a class="header-anchor" href="#eksport" aria-label="Permalink to “Eksport”">​</a></h2><ul><li><strong>Obrazy:</strong> PNG, JPG i WEBP w skali od 0,5× do 4×.</li><li><strong>SVG:</strong> figury, tekst z zakresami stylów, gradienty, efekty i tryby mieszania.</li><li><strong>Tailwind JSX:</strong> HTML z klasami Tailwind v4 dla React lub Vue.</li><li><strong>Kopiuj jako:</strong> tekst, SVG, PNG albo JSX przez menu kontekstowe.</li></ul><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> tailwind</span></span></code></pre></div><h2 id="czat-ai" tabindex="-1">Czat AI <a class="header-anchor" href="#czat-ai" aria-label="Permalink to “Czat AI”">​</a></h2><p>Naciśnij <kbd>⌘</kbd><kbd>J</kbd>. Ponad 90 narzędzi tworzy figury, zmienia style i układ, pracuje z komponentami i zmiennymi, wykonuje operacje logiczne, analizuje tokeny projektu i eksportuje zasoby. Można podłączyć Anthropic, OpenAI, Google AI, OpenRouter albo zgodny punkt końcowy.</p><p>Wywołania narzędzi pojawiają się na zwijanej osi czasu. Do kontroli wizualnej asystent eksportuje wynik i porównuje go z poleceniem. Wszystkie zmiany AI można cofnąć.</p><h2 id="serwer-mcp" tabindex="-1">Serwer MCP <a class="header-anchor" href="#serwer-mcp" aria-label="Permalink to “Serwer MCP”">​</a></h2><p>Claude Code, Cursor, Windsurf i inni klienci MCP mogą odczytywać i zmieniać <code>.fig</code> bez interfejsu. Dostępnych jest ponad 90 narzędzi oraz transporty stdio i HTTP.</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div><h2 id="cli" tabindex="-1">CLI <a class="header-anchor" href="#cli" aria-label="Permalink to “CLI”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">              # Drzewo obiektów</span></span>
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
	})}">  # Wyszukiwanie</span></span>
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
	})}">     # Eksport</span></span>
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
	})}">    # Analiza kolorów</span></span>
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
	})}">  # Powtarzające się struktury</span></span>
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
	})}">     # Figma Plugin API</span></span></code></pre></div><p>Wszystkie polecenia obsługują <code>--json</code>. Instalacja: <code>npm install -g @open-pencil/cli</code> albo <code>bun add -g @open-pencil/cli</code>.</p><h2 id="wspołpraca-w-czasie-rzeczywistym" tabindex="-1">Współpraca w czasie rzeczywistym <a class="header-anchor" href="#wspołpraca-w-czasie-rzeczywistym" aria-label="Permalink to “Współpraca w czasie rzeczywistym”">​</a></h2><p>Połączenie równorzędne WebRTC nie wymaga centralnego serwera. Udostępnij odnośnik i edytuj dokument wspólnie z innymi osobami, korzystając z kursorów, informacji o obecności i trybu śledzenia.</p><h2 id="wersja-komputerowa-i-internetowa" tabindex="-1">Wersja komputerowa i internetowa <a class="header-anchor" href="#wersja-komputerowa-i-internetowa" aria-label="Permalink to “Wersja komputerowa i internetowa”">​</a></h2><p><strong>Komputer:</strong> Tauri v2, około 7 MB, dla macOS, Windows i Linux, z menu systemowymi, pracą bez sieci i automatycznym zapisem.</p><p><strong>Internet:</strong> <a href="https://app.openpencil.dev" target="_blank" rel="noreferrer">app.openpencil.dev</a>, możliwość instalacji jako PWA i interfejs dotykowy.</p><h2 id="zastepcze-ładowanie-google-fonts" tabindex="-1">Zastępcze ładowanie Google Fonts <a class="header-anchor" href="#zastepcze-ładowanie-google-fonts" aria-label="Permalink to “Zastępcze ładowanie Google Fonts”">​</a></h2><p>Jeśli czcionka nie jest dostępna lokalnie, OpenPencil automatycznie pobiera ją z Google Fonts. Ręczna instalacja nie jest potrzebna.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/overview/features.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var features_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, features_default as default };
