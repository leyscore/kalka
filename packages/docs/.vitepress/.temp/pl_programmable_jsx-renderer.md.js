import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/jsx-renderer.md
var __pageData = JSON.parse("{\"title\":\"Renderer JSX\",\"description\":\"Deklaratywne tworzenie projektu w JSX i eksport z powrotem do JSX lub HTML z Tailwind.\",\"frontmatter\":{\"title\":\"Renderer JSX\",\"description\":\"Deklaratywne tworzenie projektu w JSX i eksport z powrotem do JSX lub HTML z Tailwind.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/jsx-renderer\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/jsx-renderer\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Renderer JSX — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Renderer JSX — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Deklaratywne tworzenie projektu w JSX i eksport z powrotem do JSX lub HTML z Tailwind.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Deklaratywne tworzenie projektu w JSX i eksport z powrotem do JSX lub HTML z Tailwind.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Deklaratywne tworzenie projektu w JSX i eksport z powrotem do JSX lub HTML z Tailwind.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/jsx-renderer.md\",\"filePath\":\"pl/programmable/jsx-renderer.md\",\"lastUpdated\":1791131915000}");
var _sfc_main = { name: "pl/programmable/jsx-renderer.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="renderer-jsx" tabindex="-1">Renderer JSX <a class="header-anchor" href="#renderer-jsx" aria-label="Permalink to “Renderer JSX”">​</a></h1><p>OpenPencil używa JSX jako deklaratywnego języka tworzenia projektu. Nadaje się on do agentów AI, skryptów i powtarzalnego budowania interfejsów.</p><p>JSX służy też jako czytelna reprezentacja istniejącego projektu. Zmiany wyglądają jak zwykła różnica w kodzie, którą można sprawdzić i zachować w systemie kontroli wersji.</p><h2 id="tworzenie-projektu" tabindex="-1">Tworzenie projektu <a class="header-anchor" href="#tworzenie-projektu" aria-label="Permalink to “Tworzenie projektu”">​</a></h2><p>Narzędzie <code>render</code>, dostępne w czacie AI, MCP i <code>eval</code> CLI, przyjmuje JSX:</p><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><p>W MCP i czacie AI przekaż narzędziu <code>render</code> ciąg JSX. W kodzie aplikacji lub bibliotece działającej bez interfejsu zaimportuj <code>Frame</code>, <code>Text</code> i pozostałe elementy do tworzenia projektu z <code>@open-pencil/design-jsx</code>, a potem twórz obiekty przez <code>renderTree</code> lub <code>renderJSX</code> z <code>@open-pencil/core/design-jsx</code>, które dodają ikony, konwersję SVG i układ. Aby zapisywać drzewa jako TSX, ustaw w <code>tsconfig.json</code> <code>&quot;jsxImportSource&quot;: &quot;@open-pencil/design-jsx&quot;</code> wraz z <code>&quot;jsx&quot;: &quot;react-jsx&quot;</code> albo dodaj do pliku komentarz <code>/** @jsxImportSource @open-pencil/design-jsx */</code>. Środowisko skryptowe określa, które API są dostępne w <code>eval</code>; eksporty pakietów nie są tam automatycznie zmiennymi globalnymi. Do konwersji w drugą stronę użyj polecenia <code>export</code>.</p><h2 id="elementy" tabindex="-1">Elementy <a class="header-anchor" href="#elementy" aria-label="Permalink to “Elementy”">​</a></h2><table tabindex="0"><thead><tr><th>Element</th><th>Tworzy</th><th>Alias</th></tr></thead><tbody><tr><td><code>&lt;Frame&gt;</code></td><td>Ramkę z automatycznym układem</td><td><code>&lt;View&gt;</code></td></tr><tr><td><code>&lt;Rectangle&gt;</code></td><td>Prostokąt</td><td><code>&lt;Rect&gt;</code></td></tr><tr><td><code>&lt;Ellipse&gt;</code></td><td>Elipsę lub koło</td><td></td></tr><tr><td><code>&lt;Text&gt;</code></td><td>Obiekt tekstowy; elementy potomne stają się treścią</td><td></td></tr><tr><td><code>&lt;Line&gt;</code></td><td>Linię</td><td></td></tr><tr><td><code>&lt;Star&gt;</code></td><td>Gwiazdę</td><td></td></tr><tr><td><code>&lt;Polygon&gt;</code></td><td>Wielokąt</td><td></td></tr><tr><td><code>&lt;Vector&gt;</code></td><td>Ścieżkę wektorową</td><td></td></tr><tr><td><code>&lt;Group&gt;</code></td><td>Grupę</td><td></td></tr><tr><td><code>&lt;Section&gt;</code></td><td>Sekcję</td><td></td></tr></tbody></table><h2 id="własciwosci-stylu" tabindex="-1">Właściwości stylu <a class="header-anchor" href="#własciwosci-stylu" aria-label="Permalink to “Właściwości stylu”">​</a></h2><p>Nazwy właściwości pozostają zgodne z API JSX, natomiast ich znaczenie jest następujące:</p><ul><li><code>flex</code>, <code>gap</code>, <code>wrap</code>, <code>justify</code>, <code>items</code> i skróty <code>p*</code> sterują układem i odstępami;</li><li><code>w</code>, <code>h</code>, <code>minW</code>, <code>maxW</code>, <code>x</code> i <code>y</code> sterują rozmiarem i położeniem;</li><li><code>bg</code>, <code>stroke</code>, <code>rounded</code>, <code>opacity</code>, <code>shadow</code>, <code>blur</code> i <code>blendMode</code> sterują wyglądem;</li><li><code>fontFamily</code>, <code>fontSize</code>, <code>fontWeight</code>, <code>color</code> i <code>textAlign</code> sterują typografią.</li></ul><h2 id="eksport-do-jsx" tabindex="-1">Eksport do JSX <a class="header-anchor" href="#eksport-do-jsx" aria-label="Permalink to “Eksport do JSX”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">                   # Format OpenPencil</span></span>
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
	})}">  # Klasy Tailwind</span></span></code></pre></div><p>Wyeksportowany projekt można zmienić jak kod i ponownie wyrenderować. Eksport zapisuje ukryte i zablokowane warstwy, ograniczenia, limity rozmiaru, wielowarstwowe, gradientowe i obrazowe zalewy, obwiednie, efekty, maski oraz powiązania ze zmiennymi, więc renderowanie eksportu je odtwarza, a <code>diff_jsx</code> pokazuje zmiany każdego z nich. Tekst sformatowany wieloma stylami, ścieżki wektorowe, siatki układu, style współdzielone i definicje właściwości komponentów nie są jeszcze zapisywane. Egzemplarze są zapisywane jako ramki z zawartością, dzięki czemu wyeksportowany JSX jest samodzielny.</p><h2 id="porownanie-zmian" tabindex="-1">Porównanie zmian <a class="header-anchor" href="#porownanie-zmian" aria-label="Permalink to “Porównanie zmian”">​</a></h2><p>Różnica JSX może być sprawdzana w przeglądzie zmian i przechowywana w systemie kontroli wersji.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/jsx-renderer.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var jsx_renderer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, jsx_renderer_default as default };
