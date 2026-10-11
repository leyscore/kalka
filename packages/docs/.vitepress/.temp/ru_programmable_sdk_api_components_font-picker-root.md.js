import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region ru/programmable/sdk/api/components/font-picker-root.md
var __pageData = JSON.parse("{\"title\":\"FontPickerRoot\",\"description\":\"Компонент выбора шрифта с поиском на основе Reka UI Combobox.\",\"frontmatter\":{\"title\":\"FontPickerRoot\",\"description\":\"Компонент выбора шрифта с поиском на основе Reka UI Combobox.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/font-picker-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/font-picker-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"FontPickerRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"FontPickerRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Компонент выбора шрифта с поиском на основе Reka UI Combobox.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Компонент выбора шрифта с поиском на основе Reka UI Combobox.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Компонент выбора шрифта с поиском на основе Reka UI Combobox.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/components/font-picker-root.md\",\"filePath\":\"ru/programmable/sdk/api/components/font-picker-root.md\",\"lastUpdated\":1787240210000}");
var _sfc_main = { name: "ru/programmable/sdk/api/components/font-picker-root.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkPropsTable = resolveComponent("SdkPropsTable");
	const _component_SdkEventsTable = resolveComponent("SdkEventsTable");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="fontpickerroot" tabindex="-1">FontPickerRoot <a class="header-anchor" href="#fontpickerroot" aria-label="Permalink to “FontPickerRoot”">​</a></h1><p><code>FontPickerRoot</code> предоставляет поиск и асинхронный список семейств шрифтов без навязанного оформления. Компонент построен на Reka UI Combobox; приложение может заменить кнопку открытия, поле поиска, строки списка, отметку выбора и пустое состояние через слоты.</p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to “Props”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [
		{
			name: "listFamilies",
			type: "() => Promise<string[]>",
			description: "Асинхронный источник доступных семейств шрифтов.",
			required: true
		},
		{
			name: "triggerClass",
			type: "string | undefined",
			description: "Необязательный класс стандартной кнопки открытия."
		},
		{
			name: "contentClass",
			type: "string | undefined",
			description: "Необязательный класс содержимого списка."
		},
		{
			name: "itemClass",
			type: "string | undefined",
			description: "Необязательный класс строк списка."
		},
		{
			name: "searchClass",
			type: "string | undefined",
			description: "Необязательный класс поля поиска."
		},
		{
			name: "viewportClass",
			type: "string | undefined",
			description: "Необязательный класс прокручиваемой области."
		},
		{
			name: "emptyClass",
			type: "string | undefined",
			description: "Необязательный класс пустого состояния."
		},
		{
			name: "emptySearchText",
			type: "string | undefined",
			description: "Текст, когда поиск не дал результатов."
		},
		{
			name: "emptyFontsText",
			type: "string | undefined",
			description: "Текст, когда шрифты недоступны."
		},
		{
			name: "emptyFontsHint",
			type: "string | undefined",
			description: "Дополнительная подсказка при отсутствии шрифтов."
		}
	] }, null, _parent));
	_push(`<h2 id="model" tabindex="-1">Model <a class="header-anchor" href="#model" aria-label="Permalink to “Model”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [{
		name: "v-model",
		type: "string",
		description: "Выбранное семейство шрифта.",
		required: true
	}] }, null, _parent));
	_push(`<h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to “Events”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkEventsTable, { rows: [{
		name: "select",
		payload: "family: string",
		description: "Вызывается после выбора семейства."
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
	})}">FontPickerRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> v-model</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">fontFamily</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">list-families</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">listFamilies</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;template #trigger=&quot;{ value }&quot;&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;button class=&quot;w-full truncate&quot;&gt;{{ value }}&lt;/button&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/template&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">FontPickerRoot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="см-также" tabindex="-1">См. также <a class="header-anchor" href="#см-также" aria-label="Permalink to “См. также”">​</a></h2><ul><li><a href="./../composables/use-typography">useTypography</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/components/font-picker-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var font_picker_root_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, font_picker_root_default as default };
