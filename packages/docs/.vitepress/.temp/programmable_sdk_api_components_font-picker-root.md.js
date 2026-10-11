import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region programmable/sdk/api/components/font-picker-root.md
var __pageData = JSON.parse("{\"title\":\"FontPickerRoot\",\"description\":\"Headless searchable font picker built on Reka Combobox.\",\"frontmatter\":{\"title\":\"FontPickerRoot\",\"description\":\"Headless searchable font picker built on Reka Combobox.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/font-picker-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/font-picker-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"FontPickerRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"FontPickerRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Headless searchable font picker built on Reka Combobox.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Headless searchable font picker built on Reka Combobox.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Headless searchable font picker built on Reka Combobox.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/font-picker-root.md\",\"filePath\":\"programmable/sdk/api/components/font-picker-root.md\",\"lastUpdated\":1774383848000}");
var _sfc_main = { name: "programmable/sdk/api/components/font-picker-root.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_SdkPropsTable = resolveComponent("SdkPropsTable");
	const _component_SdkEventsTable = resolveComponent("SdkEventsTable");
	const _component_SdkSlotsTable = resolveComponent("SdkSlotsTable");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="fontpickerroot" tabindex="-1">FontPickerRoot <a class="header-anchor" href="#fontpickerroot" aria-label="Permalink to “FontPickerRoot”">​</a></h1><p><code>FontPickerRoot</code> is a headless searchable font picker built on Reka UI Combobox primitives.</p><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to “Props”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [
		{
			name: "listFamilies",
			type: "() => Promise<string[]>",
			description: "Async source for available font families.",
			required: true
		},
		{
			name: "triggerClass",
			type: "string | undefined",
			description: "Optional class for the default trigger."
		},
		{
			name: "contentClass",
			type: "string | undefined",
			description: "Optional class for dropdown content."
		},
		{
			name: "itemClass",
			type: "string | undefined",
			description: "Optional class for default items."
		},
		{
			name: "searchClass",
			type: "string | undefined",
			description: "Optional class for the search input."
		},
		{
			name: "viewportClass",
			type: "string | undefined",
			description: "Optional class for the scroll viewport."
		},
		{
			name: "emptyClass",
			type: "string | undefined",
			description: "Optional class for empty states."
		},
		{
			name: "emptySearchText",
			type: "string | undefined",
			description: "Text shown when search returns no fonts."
		},
		{
			name: "emptyFontsText",
			type: "string | undefined",
			description: "Text shown when no fonts are available."
		},
		{
			name: "emptyFontsHint",
			type: "string | undefined",
			description: "Optional helper text for the empty-fonts state."
		}
	] }, null, _parent));
	_push(`<h2 id="model" tabindex="-1">Model <a class="header-anchor" href="#model" aria-label="Permalink to “Model”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkPropsTable, { rows: [{
		name: "v-model",
		type: "string",
		description: "Selected font family.",
		required: true
	}] }, null, _parent));
	_push(`<h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to “Events”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkEventsTable, { rows: [{
		name: "select",
		payload: "family: string",
		description: "Emitted after a font family is selected."
	}] }, null, _parent));
	_push(`<h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to “Slots”">​</a></h2>`);
	_push(ssrRenderComponent(_component_SdkSlotsTable, { rows: [
		{
			name: "trigger",
			props: "{ value: string, open: boolean }",
			description: "Custom trigger content."
		},
		{
			name: "search",
			props: "{ searchTerm: string, setInputRef: (el: HTMLInputElement | null) => void }",
			description: "Custom search input slot."
		},
		{
			name: "item",
			props: "{ family: string, selected: boolean }",
			description: "Custom item renderer."
		},
		{
			name: "indicator",
			props: "{ selected: boolean }",
			description: "Custom selected indicator."
		},
		{
			name: "empty",
			description: "Shown when no fonts are available."
		}
	] }, null, _parent));
	_push(`<h2 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to “Example”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./../composables/use-typography">useTypography</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/font-picker-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var font_picker_root_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, font_picker_root_default as default };
