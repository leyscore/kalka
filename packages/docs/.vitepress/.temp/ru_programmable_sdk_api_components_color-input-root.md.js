import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region ru/programmable/sdk/api/components/color-input-root.md
var __pageData = JSON.parse("{\"title\":\"ColorInputRoot\",\"description\":\"Разбор шестнадцатеричного цвета и обновление значения в собственном поле ввода.\",\"frontmatter\":{\"title\":\"ColorInputRoot\",\"description\":\"Разбор шестнадцатеричного цвета и обновление значения в собственном поле ввода.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/color-input-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/color-input-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/color-input-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"ColorInputRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"ColorInputRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Разбор шестнадцатеричного цвета и обновление значения в собственном поле ввода.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Разбор шестнадцатеричного цвета и обновление значения в собственном поле ввода.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Разбор шестнадцатеричного цвета и обновление значения в собственном поле ввода.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/components/color-input-root.md\",\"filePath\":\"ru/programmable/sdk/api/components/color-input-root.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/components/color-input-root.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkPropsTable = resolveComponent("SdkPropsTable");
	const _component_SdkEventsTable = resolveComponent("SdkEventsTable");
	const _component_SdkSlotsTable = resolveComponent("SdkSlotsTable");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="colorinputroot" tabindex="-1">ColorInputRoot <a class="header-anchor" href="#colorinputroot" aria-label="Permalink to “ColorInputRoot”">​</a></h1><p><code>ColorInputRoot</code> преобразует текущее значение <code>Color</code> в шестнадцатеричную строку и предоставляет функции обновления из строки или полного объекта <code>Color</code>.</p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to “Props”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [{
		name: "color",
		type: "Color",
		description: "Текущее значение цвета.",
		required: true
	}, {
		name: "editable",
		type: "boolean | undefined",
		description: "Следует ли показывать значение как доступное для редактирования."
	}] }, null, _parent));
	_push(`<h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to “Events”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkEventsTable, { rows: [{
		name: "update",
		payload: "color: Color",
		description: "Вызывается после изменения цвета."
	}] }, null, _parent));
	_push(`<h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to “Slots”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkSlotsTable, { rows: [{
		name: "default",
		props: "{ color: Color, editable: boolean, hex: string, updateFromHex: (value: string) => void, updateColor: (color: Color) => void }",
		description: "Состояние и действия для отображения поля цвета."
	}] }, null, _parent));
	_push(`<h2 id="пример" tabindex="-1">Пример <a class="header-anchor" href="#пример" aria-label="Permalink to “Пример”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">ColorInputRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> @</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">color </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> \$event</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> v-slot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{ hex, updateFromHex }</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;input :value=&quot;hex&quot; @input=&quot;updateFromHex((\$event.target as HTMLInputElement).value)&quot; /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">ColorInputRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="см-также" tabindex="-1">См. также <a class="header-anchor" href="#см-также" aria-label="Permalink to “См. также”">​</a></h2><ul><li><a href="./color-picker-root">ColorPickerRoot</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/components/color-input-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var color_input_root_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, color_input_root_default as default };
