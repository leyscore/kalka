import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Skrypty\",\"description\":\"Wykonywanie JavaScript przez API zgodne z Figma Plugin API do wyszukiwania, masowych zmian i tworzenia projektu.\",\"frontmatter\":{\"title\":\"Skrypty\",\"description\":\"Wykonywanie JavaScript przez API zgodne z Figma Plugin API do wyszukiwania, masowych zmian i tworzenia projektu.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Skrypty — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Skrypty — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Wykonywanie JavaScript przez API zgodne z Figma Plugin API do wyszukiwania, masowych zmian i tworzenia projektu.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Wykonywanie JavaScript przez API zgodne z Figma Plugin API do wyszukiwania, masowych zmian i tworzenia projektu.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Wykonywanie JavaScript przez API zgodne z Figma Plugin API do wyszukiwania, masowych zmian i tworzenia projektu.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/cli/scripting.md\",\"filePath\":\"pl/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "pl/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="skrypty" tabindex="-1">Skrypty <a class="header-anchor" href="#skrypty" aria-label="Permalink to “Skrypty”">​</a></h1><p><code>openpencil eval</code> wykonuje JavaScript dla dokumentu OpenPencil i udostępnia globalny obiekt <code>figma</code> zgodny z Figma Plugin API. Polecenie nadaje się do zmian zbiorczych, sprawdzania dokumentów, przygotowywania danych testowych i automatyzacji bez interfejsu edytora.</p><h2 id="pierwsze-wywołanie" tabindex="-1">Pierwsze wywołanie <a class="header-anchor" href="#pierwsze-wywołanie" aria-label="Permalink to “Pierwsze wywołanie”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p>Opcja <code>-c</code> przyjmuje JavaScript. Jeśli kod nie zaczyna się od <code>return</code>, OpenPencil umieszcza go w funkcji asynchronicznej i zwraca jej wynik, jeśli istnieje.</p><h2 id="wyszukiwanie-obiektow" tabindex="-1">Wyszukiwanie obiektów <a class="header-anchor" href="#wyszukiwanie-obiektow" aria-label="Permalink to “Wyszukiwanie obiektów”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">    .map((button) =&gt; ({ id: button.id, name: button.name }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span></span></code></pre></div><h2 id="zmiana-i-zapis" tabindex="-1">Zmiana i zapis <a class="header-anchor" href="#zmiana-i-zapis" aria-label="Permalink to “Zmiana i zapis”">​</a></h2><p><code>--write</code> albo <code>-w</code> zapisuje zmiany w pliku wejściowym. <code>--output</code> albo <code>-o</code> tworzy nowy plik.</p><h2 id="skrypt-ze-standardowego-wejscia" tabindex="-1">Skrypt ze standardowego wejścia <a class="header-anchor" href="#skrypt-ze-standardowego-wejscia" aria-label="Permalink to “Skrypt ze standardowego wejścia”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> --write</span></span></code></pre></div><h2 id="otwarta-aplikacja" tabindex="-1">Otwarta aplikacja <a class="header-anchor" href="#otwarta-aplikacja" aria-label="Permalink to “Otwarta aplikacja”">​</a></h2><p>Nie podawaj pliku, aby wykonać skrypt dla bieżącego dokumentu w aplikacji komputerowej.</p><h2 id="wyjscie" tabindex="-1">Wyjście <a class="header-anchor" href="#wyjscie" aria-label="Permalink to “Wyjście”">​</a></h2><p>Po przekierowaniu wyjścia domyślnie używany jest JSON. Opcja <code>--json</code> włącza go jawnie, a <code>--quiet</code> wyłącza wyjście.</p><h2 id="dostepne-api" tabindex="-1">Dostępne API <a class="header-anchor" href="#dostepne-api" aria-label="Permalink to “Dostępne API”">​</a></h2><p>API jest celowo zbliżone do Figma Plugin API, ale pracuje z SceneGraph i formatami plików OpenPencil.</p><h3 id="dokument-i-strony" tabindex="-1">Dokument i strony <a class="header-anchor" href="#dokument-i-strony" aria-label="Permalink to “Dokument i strony”">​</a></h3><ul><li><code>figma.root</code></li><li><code>figma.currentPage</code></li><li><code>figma.currentPage.selection</code></li><li><code>figma.getNodeById(id)</code></li><li><code>figma.createPage()</code></li></ul><h3 id="tworzenie-obiektow" tabindex="-1">Tworzenie obiektów <a class="header-anchor" href="#tworzenie-obiektow" aria-label="Permalink to “Tworzenie obiektów”">​</a></h3><ul><li><code>figma.createFrame()</code></li><li><code>figma.createRectangle()</code></li><li><code>figma.createEllipse()</code></li><li><code>figma.createText()</code></li><li><code>figma.createLine()</code></li><li><code>figma.createPolygon()</code></li><li><code>figma.createStar()</code></li><li><code>figma.createVector()</code></li><li><code>figma.createComponent()</code></li><li><code>figma.createSection()</code></li></ul><h3 id="drzewo" tabindex="-1">Drzewo <a class="header-anchor" href="#drzewo" aria-label="Permalink to “Drzewo”">​</a></h3><ul><li><code>node.children</code></li><li><code>node.parent</code></li><li><code>node.appendChild(child)</code></li><li><code>node.insertChild(index, child)</code></li><li><code>node.clone()</code></li><li><code>node.remove()</code></li><li><code>node.findAll(callback?)</code></li><li><code>node.findOne(callback)</code></li><li><code>figma.group(nodes, parent)</code></li><li><code>figma.ungroup(node)</code></li></ul><h3 id="komponenty-i-zmienne" tabindex="-1">Komponenty i zmienne <a class="header-anchor" href="#komponenty-i-zmienne" aria-label="Permalink to “Komponenty i zmienne”">​</a></h3><p>Nazwy metod, takie jak <code>component.createInstance()</code>, <code>figma.getLocalVariables()</code> i <code>figma.bindVariable()</code>, pozostają zgodne z Figma Plugin API.</p><h3 id="własciwosci" tabindex="-1">Właściwości <a class="header-anchor" href="#własciwosci" aria-label="Permalink to “Właściwości”">​</a></h3><p>Najczęściej używane właściwości można odczytywać i zapisywać przez pośrednika:</p><ul><li>geometria: <code>x</code>, <code>y</code>, <code>width</code>, <code>height</code>, <code>rotation</code>, <code>resize(width, height)</code>;</li><li>wygląd: <code>fills</code>, <code>strokes</code>, <code>effects</code>, <code>opacity</code>, <code>visible</code>, <code>locked</code>, <code>blendMode</code>, <code>clipsContent</code>;</li><li>tekst: <code>characters</code>, <code>fontSize</code>, <code>fontName</code>, <code>fontWeight</code>, wyrównanie, interlinia, odstęp między znakami i funkcje zakresów stylów;</li><li>automatyczny układ: <code>layoutMode</code>, <code>primaryAxisAlignItems</code>, <code>counterAxisAlignItems</code>, <code>itemSpacing</code>, wypełnienie, rozmiary i położenie;</li><li>obwiednia: <code>strokeWeight</code>, <code>strokeAlign</code>, <code>dashPattern</code>.</li></ul><h3 id="narzedzia-pomocnicze" tabindex="-1">Narzędzia pomocnicze <a class="header-anchor" href="#narzedzia-pomocnicze" aria-label="Permalink to “Narzędzia pomocnicze”">​</a></h3><ul><li><code>figma.mixed</code></li><li><code>figma.createImage(data)</code></li><li><code>figma.loadFontAsync(fontName)</code> niczego nie wykonuje, ponieważ OpenPencil nie blokuje zmiany tekstu do czasu załadowania czcionki przez wtyczkę</li><li><code>figma.listAvailableFontsAsync()</code> zwraca dostępne czcionki systemowe</li><li><code>figma.notify(message)</code> zapisuje ostrzeżenie w trybie bez interfejsu</li><li><code>figma.viewport</code></li></ul><h2 id="brak-pełnej-zgodnosci-z-figma" tabindex="-1">Brak pełnej zgodności z Figmą <a class="header-anchor" href="#brak-pełnej-zgodnosci-z-figma" aria-label="Permalink to “Brak pełnej zgodności z Figmą”">​</a></h2><p>Nie są jeszcze dostępne między innymi <code>node.exportAsync()</code>, <code>node.setBoundVariable()</code>, <code>figma.combineAsVariants()</code> i API stylów Figmy.</p><p>Zamiast nich używaj poleceń eksportu CLI, narzędzi głównego pakietu albo bezpośrednich funkcji pomocniczych SceneGraph.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
