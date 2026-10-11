import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/getting-started.md
var __pageData = JSON.parse("{\"title\":\"SDK Getting Started\",\"description\":\"Set up @open-pencil/vue with createEditor, provideEditor, and a canvas.\",\"frontmatter\":{\"title\":\"SDK Getting Started\",\"description\":\"Set up @open-pencil/vue with createEditor, provideEditor, and a canvas.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/getting-started\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/getting-started\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"SDK Getting Started — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"SDK Getting Started — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Set up @open-pencil/vue with createEditor, provideEditor, and a canvas.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Set up @open-pencil/vue with createEditor, provideEditor, and a canvas.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Set up @open-pencil/vue with createEditor, provideEditor, and a canvas.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/getting-started.md\",\"filePath\":\"programmable/sdk/getting-started.md\",\"lastUpdated\":1791500147000}");
var _sfc_main = { name: "programmable/sdk/getting-started.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_v_menu = resolveComponent("v-menu");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="sdk-getting-started" tabindex="-1">SDK Getting Started <a class="header-anchor" href="#sdk-getting-started" aria-label="Permalink to “SDK Getting Started”">​</a></h1><h2 id="installation" tabindex="-1">Installation <a class="header-anchor" href="#installation" aria-label="Permalink to “Installation”">​</a></h2><div class="language-bash"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> add</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/core</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/scene-graph</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/vue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> canvaskit-wasm</span></span></code></pre></div><p>The SDK lives in the monorepo and is published as <code>@open-pencil/vue</code>. The current development version requires Vue <code>^3.5.41</code> and, when using its optional CanvasKit peer, <code>canvaskit-wasm &gt;=0.41.1</code>. Check the installed package&#39;s peer requirements when using an older release.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { createEditor } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/core/editor&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { provideEditor, useCanvas } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span></code></pre></div><h2 id="mental-model" tabindex="-1">Mental model <a class="header-anchor" href="#mental-model" aria-label="Permalink to “Mental model”">​</a></h2><p>There are three layers:</p><ol><li><code>@open-pencil/core</code> — framework-agnostic editor engine</li><li><code>@open-pencil/vue</code> — Vue composables and headless primitives</li><li>your app — styling, routing, file flows, product-specific UI</li></ol><h2 id="minimal-setup" tabindex="-1">Minimal setup <a class="header-anchor" href="#minimal-setup" aria-label="Permalink to “Minimal setup”">​</a></h2><h3 id="_1-create-an-editor" tabindex="-1">1. Create an editor <a class="header-anchor" href="#_1-create-an-editor" aria-label="Permalink to “1. Create an editor”">​</a></h3><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> reactive</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> extends</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> object</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Reactive</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Returns a reactive proxy of the object.</p>
<p${_scopeId}>The reactive conversion is &quot;deep&quot;: it affects all nested properties. A
reactive object also deeply unwraps any properties that are refs while
maintaining reactivity.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@example</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> obj</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> =</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> reactive</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>({ count: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>0</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> })</span></code></span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>target</code>  - The source object.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@see</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><a href="https://vuejs.org/api/reactivity-core.html#reactive"${_scopeId}>https://vuejs.org/api/reactivity-core.html#reactive</a></span></span></div></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
				createVNode("code", { class: "twoslash-popup-code" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "function"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " reactive"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "T"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " extends"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " object"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "target"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Reactive"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">")
				]),
				createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [
					createVNode("p", null, "Returns a reactive proxy of the object."),
					createTextVNode("\n"),
					createVNode("p", null, "The reactive conversion is \"deep\": it affects all nested properties. A\nreactive object also deeply unwraps any properties that are refs while\nmaintaining reactivity.")
				]),
				createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@example"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " obj"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " ="),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " reactive"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "({ count: "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "0"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " })")
					])])]),
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "target"), createTextVNode("  - The source object.")])]),
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@see"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("a", { href: "https://vuejs.org/api/reactivity-core.html#reactive" }, "https://vuejs.org/api/reactivity-core.html#reactive")])])
				])
			])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>reactive</span>`);
			else return [createVNode("span", null, "reactive")];
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
	})}"> &#39;vue&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> createDefaultEditorState</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>pageId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> EditorState</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "function"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " createDefaultEditorState"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "("),
				createVNode("span", { style: {
					"--shiki-light": "#c13617",
					"--shiki-dark": "#FFAB70"
				} }, "pageId"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " string"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ")"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " EditorState")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>createDefaultEditorState</span>`);
			else return [createVNode("span", null, "createDefaultEditorState")];
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
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> createEditor</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>options</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> EditorOptions</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    applyLintFixes</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>requests</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> LintFixRequest</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[]) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    wrapInAutoLayout</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    groupSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    frameSelection</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    booleanOperationSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>operation</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;UNION&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;SUBTRACT&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;INTERSECT&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;EXCLUDE&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    flattenSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    outlineTextSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    outlineStrokeSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    ungroupSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createComponentFromSelection</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createComponentSetFromComponents</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createInstanceFromComponent</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>x</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>y</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>parentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    detachInstance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    focusComponent</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    goToMainComponent</span><span style="${ssrRenderStyle({
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
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    getComponentSetPropertyDefs</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentSetId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>ComponentPropertyDefinition</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[];</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    convertToSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>frameId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    updateSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>propertyId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>patch</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>SlotPropertyPatch</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    removeSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>propertyId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    setBehaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>behaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Behaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    addBehaviourText</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>valueId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>name</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    addBehaviourVariant</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>valueId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>name</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...</span></span></code></pre></code></span>`);
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
					} }, " createEditor"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "options"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " EditorOptions"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " {")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    applyLintFixes"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "requests"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " LintFixRequest"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "[]) "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    wrapInAutoLayout"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    groupSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    frameSelection"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    booleanOperationSelected"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "operation"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"UNION\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"SUBTRACT\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"INTERSECT\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"EXCLUDE\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    flattenSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    outlineTextSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    outlineStrokeSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    ungroupSelected"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createComponentFromSelection"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createComponentSetFromComponents"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createInstanceFromComponent"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "x"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "y"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "parentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    detachInstance"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    focusComponent"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    goToMainComponent"),
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
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    getComponentSetPropertyDefs"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentSetId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "ComponentPropertyDefinition"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "[];")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createSlot"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    convertToSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "frameId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    updateSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "propertyId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "patch"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "SlotPropertyPatch"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    removeSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "propertyId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    setBehaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "behaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "Behaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    addBehaviourText"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "valueId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "name"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    addBehaviourVariant"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "valueId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "name"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...")
				])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>createEditor</span>`);
			else return [createVNode("span", null, "createEditor")];
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
	})}"> &#39;@open-pencil/core/editor&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>class</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneGraph</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			} }, "class"), createVNode("span", { style: {
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			} }, " SceneGraph")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>SceneGraph</span>`);
			else return [createVNode("span", null, "SceneGraph")];
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
	})}"> &#39;@open-pencil/scene-graph&#39;</span></span>
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> graph</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneGraph</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " graph"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneGraph")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>graph</span>`);
			else return [createVNode("span", null, "graph")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneGraph</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(idGenerator</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> string): SceneGraph</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "new"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneGraph"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "(idGenerator"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "?:"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " () "),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "=>"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " string): SceneGraph")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>SceneGraph</span>`);
			else return [createVNode("span", null, "SceneGraph")];
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> page</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneNode</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " page"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneNode")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>page</span>`);
			else return [createVNode("span", null, "page")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> graph</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneGraph</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " graph"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneGraph")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>graph</span>`);
			else return [createVNode("span", null, "graph")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>SceneGraph.</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>getPages</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(includeInternal</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> boolean): SceneNode[]</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "SceneGraph."),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "getPages"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "(includeInternal"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "?:"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " boolean): SceneNode[]")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>getPages</span>`);
			else return [createVNode("span", null, "getPages")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> page</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneNode</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " page"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneNode")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>page</span>`);
			else return [createVNode("span", null, "page")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">throw</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
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
			})}"${_scopeId}>var</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> Error</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> ErrorConstructor</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>message</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>options</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> ErrorOptions</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Error</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>+</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>2</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> overloads)</span></span></code></pre></code></span>`);
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
					} }, "var"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " Error"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " ErrorConstructor")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "new"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "message"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "options"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " ErrorOptions"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Error"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "+"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "2"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " overloads)")
				])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>Error</span>`);
			else return [createVNode("span", null, "Error")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Expected an initial page&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
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
			})}"${_scopeId}> editor</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    applyLintFixes</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>requests</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> LintFixRequest</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[]) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    wrapInAutoLayout</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    groupSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 260</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    runMutationWithLayout</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> &lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>operation</span><span style="${ssrRenderStyle({
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
			})}"${_scopeId}> T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>fallbackId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>beforeLayout</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>result</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt; </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}</span></span></code></pre></code></span>`);
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
					} }, " editor"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " {")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    applyLintFixes"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "requests"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " LintFixRequest"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "[]) "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    wrapInAutoLayout"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    groupSelected"),
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
					} }, " null"),
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
					} }, " 260"),
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    runMutationWithLayout"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " <"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">("),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "operation"),
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
					} }, " T"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">, "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "fallbackId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "beforeLayout"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "result"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "> "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "|"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "T"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "}")])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>editor</span>`);
			else return [createVNode("span", null, "editor")];
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
			})}"${_scopeId}> createEditor</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>options</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> EditorOptions</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    applyLintFixes</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>requests</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> readonly</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> LintFixRequest</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[]) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    wrapInAutoLayout</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    groupSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    frameSelection</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    booleanOperationSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>operation</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;UNION&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;SUBTRACT&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;INTERSECT&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}> &quot;EXCLUDE&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    flattenSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    outlineTextSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    outlineStrokeSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    ungroupSelected</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createComponentFromSelection</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createComponentSetFromComponents</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createInstanceFromComponent</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>x</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>y</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>parentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    detachInstance</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    focusComponent</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    goToMainComponent</span><span style="${ssrRenderStyle({
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
			})}"${_scopeId}> Promise</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    getComponentSetPropertyDefs</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>componentSetId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>ComponentPropertyDefinition</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[];</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    createSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> () </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    convertToSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>frameId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    updateSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>propertyId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>patch</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>SlotPropertyPatch</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    removeSlot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>propertyId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    setBehaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>behaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> import</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"${_scopeId}>&quot;/Users/beleyd/kalka/packages/scene-graph/dist/types&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>).</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Behaviour</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> void</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    addBehaviourText</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>valueId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>name</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    addBehaviourVariant</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>ownerId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>valueId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>name</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> ...</span></span></code></pre></code></span>`);
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
					} }, " createEditor"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "options"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " EditorOptions"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " {")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    applyLintFixes"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "requests"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " readonly"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " LintFixRequest"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "[]) "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    wrapInAutoLayout"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    groupSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    frameSelection"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    booleanOperationSelected"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "operation"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"UNION\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"SUBTRACT\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"INTERSECT\""),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, " \"EXCLUDE\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    flattenSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    outlineTextSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    outlineStrokeSelected"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    ungroupSelected"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createComponentFromSelection"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createComponentSetFromComponents"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createInstanceFromComponent"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "x"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "y"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " number"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "parentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    detachInstance"),
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    focusComponent"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    goToMainComponent"),
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
					} }, " Promise"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "<"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, "void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ">;")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    getComponentSetPropertyDefs"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "componentSetId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "ComponentPropertyDefinition"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "[];")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    createSlot"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    convertToSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "frameId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    updateSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "propertyId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "patch"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "SlotPropertyPatch"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    removeSlot"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "propertyId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    setBehaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "behaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " import"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "("),
					createVNode("span", { style: {
						"--shiki-light": "#032F62",
						"--shiki-dark": "#9ECBFF"
					} }, "\"/Users/beleyd/kalka/packages/scene-graph/dist/types\""),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ")."),
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "Behaviour"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, " |"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " void"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    addBehaviourText"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "valueId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "name"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ") "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
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
					} }, " null"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "    addBehaviourVariant"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ("),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "ownerId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "valueId"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ", "),
					createVNode("span", { style: {
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					} }, "name"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, ":"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " string"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " ...")
				])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>createEditor</span>`);
			else return [createVNode("span", null, "createEditor")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>EditorOptions.graph</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> SceneGraph </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> undefined</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "EditorOptions.graph"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "?:"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " SceneGraph "),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "|"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " undefined")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>graph</span>`);
			else return [createVNode("span", null, "graph")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>EditorOptions.state</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> EditorState </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> undefined</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "EditorOptions.state"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "?:"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " EditorState "),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "|"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " undefined")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>state</span>`);
			else return [createVNode("span", null, "state")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>reactive</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>EditorState</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;(target: EditorState): {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    activeTool: Tool;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    snappingPreferences: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>        geometry: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>        objects: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>        pixelGrid: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    showPixelGrid</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> boolean </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>    ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> 34</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> more </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    play: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>    } </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}</span></span></code></pre></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Returns a reactive proxy of the object.</p>
<p${_scopeId}>The reactive conversion is &quot;deep&quot;: it affects all nested properties. A
reactive object also deeply unwraps any properties that are refs while
maintaining reactivity.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@example</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> obj</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}> =</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> reactive</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>({ count: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}>0</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> })</span></code></span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>target</code>  - The source object.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@see</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><a href="https://vuejs.org/api/reactivity-core.html#reactive"${_scopeId}>https://vuejs.org/api/reactivity-core.html#reactive</a></span></span></div></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
				createVNode("code", { class: "twoslash-popup-code" }, [createVNode("pre", {
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
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "reactive"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "EditorState"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">(target: EditorState): {")
					]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    activeTool: Tool;")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    snappingPreferences: {")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "        geometry: boolean;")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "        objects: boolean;")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "        pixelGrid: boolean;")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    };")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    showPixelGrid"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "?:"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " boolean "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
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
						} }, " 34"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " more "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "..."),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ";")
					]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "    play: {")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "        ..."), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ";")]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    } "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " null"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ";")
					]),
					createTextVNode("\n"),
					createVNode("span", { class: "line" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "}")])
				])])]),
				createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [
					createVNode("p", null, "Returns a reactive proxy of the object."),
					createTextVNode("\n"),
					createVNode("p", null, "The reactive conversion is \"deep\": it affects all nested properties. A\nreactive object also deeply unwraps any properties that are refs while\nmaintaining reactivity.")
				]),
				createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@example"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " obj"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " ="),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " reactive"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "({ count: "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "0"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " })")
					])])]),
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "target"), createTextVNode("  - The source object.")])]),
					createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@see"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("a", { href: "https://vuejs.org/api/reactivity-core.html#reactive" }, "https://vuejs.org/api/reactivity-core.html#reactive")])])
				])
			])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>reactive</span>`);
			else return [createVNode("span", null, "reactive")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> createDefaultEditorState</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"${_scopeId}>pageId</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> EditorState</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "function"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " createDefaultEditorState"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "("),
				createVNode("span", { style: {
					"--shiki-light": "#c13617",
					"--shiki-dark": "#FFAB70"
				} }, "pageId"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " string"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ")"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " EditorState")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>createDefaultEditorState</span>`);
			else return [createVNode("span", null, "createDefaultEditorState")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> page</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> SceneNode</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " page"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " SceneNode")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>page</span>`);
			else return [createVNode("span", null, "page")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>SceneNode.id: string</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "SceneNode.id: string")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>id</span>`);
			else return [createVNode("span", null, "id")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  </span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>EditorOptions.getViewportSize</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> (() </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    width</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>    height</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>}) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> undefined</span></span></code></pre></code></span>`);
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "EditorOptions.getViewportSize"),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "?:"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " (() "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "=>"),
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " {")
				]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "    width"), createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ": number;")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "    height"), createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ": number;")]),
				createTextVNode("\n"),
				createVNode("span", { class: "line" }, [
					createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "}) "),
					createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "|"),
					createVNode("span", { style: {
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					} }, " undefined")
				])
			])])])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>getViewportSize</span>`);
			else return [createVNode("span", null, "getViewportSize")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: () </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ({ </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">`);
	_push(ssrRenderComponent(_component_v_menu, {
		class: "twoslash-hover",
		"popper-class": "shiki twoslash-floating vp-copy-ignore",
		theme: "twoslash"
	}, {
		popper: withCtx(({}, _push, _parent, _scopeId) => {
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>width</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			} }, "width"), createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, ": number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>width</span>`);
			else return [createVNode("span", null, "width")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1200</span><span style="${ssrRenderStyle({
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>height</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			} }, "height"), createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, ": number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>height</span>`);
			else return [createVNode("span", null, "height")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">800</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span></code></pre></div><p>Core state is framework-neutral; passing reactive state lets Vue controls observe editor changes. For a resizable editor, have <code>getViewportSize</code> return the current canvas container dimensions. <code>width</code> and <code>height</code> are not <code>EditorOptions</code> properties.</p><p>Icons come from Iconify by default. To serve them from elsewhere, such as a bundled or self-hosted set, pass an <code>IconProvider</code> from <code>@open-pencil/core/icons</code> as <code>icons</code>; the editor&#39;s commands, its icon picker, and its AI tools all use it.</p><h3 id="_2-provide-it-to-vue" tabindex="-1">2. Provide it to Vue <a class="header-anchor" href="#_2-provide-it-to-vue" aria-label="Permalink to “2. Provide it to Vue”">​</a></h3><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { provideEditor } </span><span style="${ssrRenderStyle({
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
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { Editor } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/core/editor&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> props</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> defineProps</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  editor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Editor</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}&gt;()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">provideEditor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(props.editor)</span></span>
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
	})}">slot</span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}"> /</span><span style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><p>You can think of this as the provider layer for the editor tree. The docs prefer <code>provideEditor()</code> directly because that is the current real API surface.</p><h3 id="_3-attach-a-canvas" tabindex="-1">3. Attach a canvas <a class="header-anchor" href="#_3-attach-a-canvas" aria-label="Permalink to “3. Attach a canvas”">​</a></h3><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { ref } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useCanvas, useEditor } </span><span style="${ssrRenderStyle({
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
	})}"> canvasRef</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> ref</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">HTMLCanvasElement</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> editor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useEditor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">useCanvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvasRef, editor)</span></span>
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
	})}">canvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> ref</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;canvasRef&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;size-full&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}"> /</span><span style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><h2 id="using-composables" tabindex="-1">Using composables <a class="header-anchor" href="#using-composables" aria-label="Permalink to “Using composables”">​</a></h2><p>Once the editor is provided, child components can read selection and issue commands:</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { useEditorCommands, useSelectionState } </span><span style="${ssrRenderStyle({
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
	})}"> selection</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useSelectionState</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> commands</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useEditorCommands</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><h2 id="basic-example" tabindex="-1">Basic example <a class="header-anchor" href="#basic-example" aria-label="Permalink to “Basic example”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> { ref } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { useCanvas, useEditor, useSelectionState } </span><span style="${ssrRenderStyle({
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
	})}"> canvasRef</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> ref</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">HTMLCanvasElement</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> editor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useEditor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">selectedCount</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> useSelectionState</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">useCanvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canvasRef, editor, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  onReady</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: () </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    console.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">log</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Canvas ready&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span>
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
	})}">div</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;grid h-full grid-rows-[1fr_auto]&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">canvas</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> ref</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;canvasRef&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;size-full&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#B31D28",
		"--shiki-light-font-style": "italic",
		"--shiki-dark": "#FDAEB7",
		"--shiki-dark-font-style": "italic"
	})}"> /</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">div</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;border-t px-3 py-2 text-xs text-muted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      Selected: {{ selectedCount }}</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">div</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">div</span><span style="${ssrRenderStyle({
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
	})}">&gt;</span></span></code></pre></div><h2 id="migrating-from-v0-14-0" tabindex="-1">Migrating from v0.14.0 <a class="header-anchor" href="#migrating-from-v0-14-0" aria-label="Permalink to “Migrating from v0.14.0”">​</a></h2><p>These changes describe the current development version; use them when upgrading beyond v0.14.0.</p><ul><li><strong>Scene Graph overrides:</strong> replace <code>SceneNode.overrides</code> records with <code>instanceOverrides</code>, whose <code>self</code> and <code>descendants</code> maps distinguish instance-level and descendant overrides. Use the public override helpers from <code>@open-pencil/scene-graph</code> rather than treating this as a simple field rename.</li><li><strong>Derived geometry:</strong> rename <code>figmaDerivedLayout</code> to <code>derivedLayout</code>, <code>figmaDerivedTextGlyphs</code> to <code>derivedTextGlyphs</code>, and the exported <code>FigmaDerivedTextGlyph</code> type to <code>DerivedTextGlyph</code>.</li><li><strong>Binding providers:</strong> implement <code>getBindingId()</code> and handle <code>unresolved</code>. For <code>edit-variable</code>, replace <code>setValue()</code> with <code>prepareEdit()</code>, which captures the edit key, value, setter, and restoration callback. See <a href="./api/components/bindable-value">BindableValue</a>.</li><li><strong>Translations:</strong> replace <code>useDialogMessages()</code> and <code>dialogMessages</code> with the relevant product-domain composables and catalogs, such as <code>useSettingsMessages()</code> or <code>useRenameMessages()</code>. Catalog keys have also moved; do not just rename the import. See <a href="./api/composables/use-i18n">useI18n</a>.</li><li><strong>CanvasKit:</strong> use <code>PathBuilder</code> for mutable construction and retain the returned paths from immutable <code>Path</code> operations instead of expecting in-place mutation.</li><li><strong>Custom tools:</strong> use native Valibot <code>input</code> schemas and execution metadata instead of <code>params</code>, <code>ParamDef</code>, or <code>paramToZod()</code>. Programmatic MCP integrations use MCP SDK v2 server/client types; see <a href="./../mcp-server">MCP</a>.</li></ul><h2 id="next-steps" tabindex="-1">Next steps <a class="header-anchor" href="#next-steps" aria-label="Permalink to “Next steps”">​</a></h2><ul><li><a href="./architecture">Architecture</a></li><li><a href="./api/">API Reference</a></li><li><a href="./api/composables/use-editor">useEditor</a></li><li><a href="./api/composables/use-canvas">useCanvas</a></li><li><a href="./api/composables/use-i18n">useI18n</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/getting-started.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var getting_started_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, getting_started_default as default };
