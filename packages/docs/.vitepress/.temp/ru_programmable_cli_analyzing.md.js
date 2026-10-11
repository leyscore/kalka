import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region ru/programmable/cli/analyzing.md
var __pageData = JSON.parse("{\"title\":\"Анализ дизайна\",\"description\":\"Проверка цветов, типографики, интервалов и повторяющихся структур в файлах .fig.\",\"frontmatter\":{\"title\":\"Анализ дизайна\",\"description\":\"Проверка цветов, типографики, интервалов и повторяющихся структур в файлах .fig.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/analyzing\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/analyzing\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Анализ дизайна — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Анализ дизайна — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Проверка цветов, типографики, интервалов и повторяющихся структур в файлах .fig.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Проверка цветов, типографики, интервалов и повторяющихся структур в файлах .fig.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Проверка цветов, типографики, интервалов и повторяющихся структур в файлах .fig.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/cli/analyzing.md\",\"filePath\":\"ru/programmable/cli/analyzing.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/cli/analyzing.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="анализ-дизаина" tabindex="-1">Анализ дизайна <a class="header-anchor" href="#анализ-дизаина" aria-label="Permalink to “Анализ дизайна”">​</a></h1><p>Команды <code>analyze</code> проверяют документ из терминала: находят несогласованные значения, извлекают фактическую палитру и обнаруживают повторяющиеся структуры, которые можно превратить в компоненты.</p><h2 id="цвета" tabindex="-1">Цвета <a class="header-anchor" href="#цвета" aria-label="Permalink to “Цвета”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> design.fig</span></span></code></pre></div><p>Команда находит все цвета, считает количество использований и строит гистограмму:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>#1d1b20  ██████████████████████████████ 17155×</span></span>
<span class="line"><span>#49454f  ██████████████████████████████ 9814×</span></span>
<span class="line"><span>#ffffff  ██████████████████████████████ 8620×</span></span>
<span class="line"><span>#6750a4  ██████████████████████████████ 3967×</span></span></code></pre></div><h2 id="типографика" tabindex="-1">Типографика <a class="header-anchor" href="#типографика" aria-label="Permalink to “Типографика”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> design.fig</span></span></code></pre></div><p>Результат содержит сочетания семейства, размера и начертания шрифта и количество использований каждого сочетания. Так можно найти случайные стили текста, которые стоит объединить.</p><h2 id="интервалы" tabindex="-1">Интервалы <a class="header-anchor" href="#интервалы" aria-label="Permalink to “Интервалы”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> design.fig</span></span></code></pre></div><p>Команда проверяет интервалы и внутренние отступы во фреймах с автоматической компоновкой. Например, она помогает заметить случайный интервал <code>13px</code> среди значений шкалы <code>8/16/24</code>.</p><h2 id="повторяющиеся-структуры" tabindex="-1">Повторяющиеся структуры <a class="header-anchor" href="#повторяющиеся-структуры" aria-label="Permalink to “Повторяющиеся структуры”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> design.fig</span></span></code></pre></div><p>Команда находит повторяющиеся структуры объектов, которые могут стать компонентами:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>3771× frame &quot;container&quot; (100% match)</span></span>
<span class="line"><span>     size: 40×40, structure: Frame &gt; [Frame]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2982× instance &quot;Checkboxes&quot; (100% match)</span></span>
<span class="line"><span>     size: 48×48, structure: Instance &gt; [Frame]</span></span></code></pre></div><h2 id="вывод-json" tabindex="-1">Вывод JSON <a class="header-anchor" href="#вывод-json" aria-label="Permalink to “Вывод JSON”">​</a></h2><p>Все подкоманды <code>analyze</code> поддерживают <code>--json</code>:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --json</span></span></code></pre></div><p>Результат можно передать <code>jq</code>, использовать в проверках CI или сценариях, контролирующих допустимое количество токенов дизайна.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/cli/analyzing.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var analyzing_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, analyzing_default as default };
