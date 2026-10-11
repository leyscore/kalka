import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region pl/programmable/cli/analyzing.md
var __pageData = JSON.parse("{\"title\":\"Analiza projektu\",\"description\":\"Sprawdzanie kolorów, typografii, odstępów i powtarzających się struktur w plikach .fig.\",\"frontmatter\":{\"title\":\"Analiza projektu\",\"description\":\"Sprawdzanie kolorów, typografii, odstępów i powtarzających się struktur w plikach .fig.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"pl_PL\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Analiza projektu — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Analiza projektu — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Sprawdzanie kolorów, typografii, odstępów i powtarzających się struktur w plikach .fig.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Sprawdzanie kolorów, typografii, odstępów i powtarzających się struktur w plikach .fig.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Sprawdzanie kolorów, typografii, odstępów i powtarzających się struktur w plikach .fig.\"}]]},\"headers\":[],\"relativePath\":\"pl/programmable/cli/analyzing.md\",\"filePath\":\"pl/programmable/cli/analyzing.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "pl/programmable/cli/analyzing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="analiza-projektu" tabindex="-1">Analiza projektu <a class="header-anchor" href="#analiza-projektu" aria-label="Permalink to “Analiza projektu”">​</a></h1><p>Polecenia <code>analyze</code> sprawdzają dokument z terminala: znajdują niespójne wartości, wyodrębniają rzeczywistą paletę i wykrywają powtarzające się struktury, które można przekształcić w komponenty.</p><h2 id="kolory" tabindex="-1">Kolory <a class="header-anchor" href="#kolory" aria-label="Permalink to “Kolory”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> colors</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Polecenie znajduje wszystkie kolory, liczy ich użycia i buduje histogram.</p><h2 id="typografia" tabindex="-1">Typografia <a class="header-anchor" href="#typografia" aria-label="Permalink to “Typografia”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> typography</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Wynik zawiera kombinacje rodziny, rozmiaru i odmiany czcionki oraz liczbę użyć każdej z nich. Pozwala to znaleźć przypadkowe style tekstu, które warto ujednolicić.</p><h2 id="odstepy" tabindex="-1">Odstępy <a class="header-anchor" href="#odstepy" aria-label="Permalink to “Odstępy”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> spacing</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Polecenie sprawdza odstępy i wypełnienie w ramkach z automatycznym układem. Pomaga na przykład zauważyć przypadkowy odstęp <code>13px</code> pośród wartości skali <code>8/16/24</code>.</p><h2 id="powtarzajace-sie-struktury" tabindex="-1">Powtarzające się struktury <a class="header-anchor" href="#powtarzajace-sie-struktury" aria-label="Permalink to “Powtarzające się struktury”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> analyze</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> clusters</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span></span></code></pre></div><p>Polecenie znajduje powtarzające się struktury obiektów, które mogą stać się komponentami.</p><h2 id="wyjscie-json" tabindex="-1">Wyjście JSON <a class="header-anchor" href="#wyjscie-json" aria-label="Permalink to “Wyjście JSON”">​</a></h2><p>Wszystkie polecenia <code>analyze</code> obsługują <code>--json</code>. Wynik można przekazać do <code>jq</code>, użyć w CI albo w skryptach kontrolujących tokeny projektu.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pl/programmable/cli/analyzing.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var analyzing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, analyzing_default as default };
