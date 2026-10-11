import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/composables/use-i18n.md
var __pageData = JSON.parse("{\"title\":\"useI18n\",\"description\":\"Read localized OpenPencil UI messages and switch the active SDK locale.\",\"frontmatter\":{\"title\":\"useI18n\",\"description\":\"Read localized OpenPencil UI messages and switch the active SDK locale.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/composables/use-i18n\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/composables/use-i18n\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useI18n — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useI18n — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Read localized OpenPencil UI messages and switch the active SDK locale.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Read localized OpenPencil UI messages and switch the active SDK locale.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Read localized OpenPencil UI messages and switch the active SDK locale.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/composables/use-i18n.md\",\"filePath\":\"programmable/sdk/api/composables/use-i18n.md\",\"lastUpdated\":1789501961000}");
var _sfc_main = { name: "programmable/sdk/api/composables/use-i18n.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_v_menu = resolveComponent("v-menu");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usei18n" tabindex="-1">useI18n <a class="header-anchor" href="#usei18n" aria-label="Permalink to “useI18n”">​</a></h1><p><code>useI18n()</code> is a compatibility aggregate returning reactive translation groups and locale controls. New components should import only the product-domain composables they need, rather than subscribe to every catalog.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> useSettingsMessages</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "const"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " useSettingsMessages"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " () "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useSettingsMessages</span>`);
			else return [createVNode("span", null, "useSettingsMessages")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> useRenameMessages</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "const"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " useRenameMessages"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " () "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useRenameMessages</span>`);
			else return [createVNode("span", null, "useRenameMessages")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> settings</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "const"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " settings"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>settings</span>`);
			else return [createVNode("span", null, "settings")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> useSettingsMessages</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>()</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> appearance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Appearance&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animations</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Animations&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsSystem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Follow system&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> animationsOff</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Off&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Settings&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 40</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> notifications</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Notifications&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "function"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " useSettingsMessages"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "()"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " appearance"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Appearance\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animations"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Animations\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsSystem"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Follow system\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " animationsOff"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Off\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Settings\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 40"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " notifications"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Notifications\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useSettingsMessages</span>`);
			else return [createVNode("span", null, "useSettingsMessages")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> rename</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "const"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " rename"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>rename</span>`);
			else return [createVNode("span", null, "rename")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> useRenameMessages</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>()</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Ref</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}, {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> title</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Rename&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> layers</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> TranslationFunction</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;[{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>        count</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&amp;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>], </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> preview</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Preview&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> match</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Match&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 7</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}> invalidPattern</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;Invalid regular expression&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}&gt;</span></span></code></pre></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
				class: "shiki shiki-themes github-light github-dark",
				style: {
					"--shiki-light": "#24292e",
					"--shiki-dark": "#e1e4e8",
					"--shiki-light-bg": "#fff",
					"--shiki-dark-bg": "#24292e"
				},
				tabindex: "0"
			}, [createVNode("code", null, [
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "function"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " useRenameMessages"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "()"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Ref"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}, {")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " title"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Rename\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " layers"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " TranslationFunction"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<[{")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "        count"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    } "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "&"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "], "),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " preview"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Preview\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " match"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Match\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    ..."),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " 7"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " more"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "    readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, " invalidPattern"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"Invalid regular expression\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}>")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useRenameMessages</span>`);
			else return [createVNode("span", null, "useRenameMessages")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Each domain composable returns a reactive ref. Read <code>.value</code> in script; Vue unwraps it in templates. See <a href="./../advanced/locale-apis">Locale APIs</a> for locale switching without the aggregate.</p><h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-label="Permalink to “Usage”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useI18n } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">menu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">commands</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">panels</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">locale</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">availableLocales</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">localeLabels</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">setLocale</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useI18n</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><h2 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to “Returns”">​</a></h2><p>Translation refs: <code>ai</code>, <code>automation</code>, <code>code</code>, <code>collaboration</code>, <code>commands</code>, <code>common</code>, <code>credentials</code>, <code>diagnostics</code>, <code>editor</code>, <code>files</code>, <code>fonts</code>, <code>media</code>, <code>menu</code>, <code>pages</code>, <code>panels</code>, <code>recovery</code>, <code>rendering</code>, <code>rename</code>, <code>settings</code>, <code>storage</code>, <code>tools</code>, <code>updates</code>, <code>variables</code>, and <code>variableTypes</code>.</p><p>Locale controls: <code>locale</code>, <code>availableLocales</code>, <code>localeLabels</code>, and <code>setLocale</code>.</p><p>The former <code>dialogs</code> group, <code>useDialogMessages()</code>, and <code>dialogMessages</code> are removed in the development version after v0.14.0. Use the owning domain, such as <code>settings</code>, <code>rename</code>, or <code>recovery</code>, and update the corresponding message keys.</p><h2 id="basic-example" tabindex="-1">Basic example <a class="header-anchor" href="#basic-example" aria-label="Permalink to “Basic example”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">script</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> setup</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> lang</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ts&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useI18n } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">menu</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">locale</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">availableLocales</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">localeLabels</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">setLocale</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useI18n</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">script</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">template</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">label</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;flex items-center gap-2&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">span</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;{{ menu.view }}&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">span</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">select</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> :value</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;locale&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> @change</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;setLocale((\$event.target as HTMLSelectElement).value as typeof locale)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">option</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> v-for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;code in availableLocales&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> :key</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;code&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> :value</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;code&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        {{ localeLabels[code] }}</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">option</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">select</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">label</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">template</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="notes" tabindex="-1">Notes <a class="header-anchor" href="#notes" aria-label="Permalink to “Notes”">​</a></h2><ul><li>locale changes are reactive across all SDK message groups</li><li>the SDK also exports lower-level locale primitives when you need direct store access</li></ul><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./use-menu-model">useMenuModel</a></li><li><a href="./../advanced/locale-apis">SDK Locale APIs</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/composables/use-i18n.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_i18n_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_i18n_default as default };
