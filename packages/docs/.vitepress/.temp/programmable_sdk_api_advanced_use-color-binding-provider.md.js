import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createVNode, resolveComponent, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/advanced/use-color-binding-provider.md
var __pageData = JSON.parse("{\"title\":\"useColorBindingProvider\",\"description\":\"OpenPencil COLOR variable provider for BindableValue fields.\",\"frontmatter\":{\"title\":\"useColorBindingProvider\",\"description\":\"OpenPencil COLOR variable provider for BindableValue fields.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-binding-provider\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-binding-provider\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-binding-provider\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/advanced/use-color-binding-provider\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"useColorBindingProvider — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"useColorBindingProvider — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"OpenPencil COLOR variable provider for BindableValue fields.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"OpenPencil COLOR variable provider for BindableValue fields.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"OpenPencil COLOR variable provider for BindableValue fields.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/advanced/use-color-binding-provider.md\",\"filePath\":\"programmable/sdk/api/advanced/use-color-binding-provider.md\",\"lastUpdated\":1784037988000}");
var _sfc_main = { name: "programmable/sdk/api/advanced/use-color-binding-provider.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_v_menu = resolveComponent("v-menu");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="usecolorbindingprovider" tabindex="-1">useColorBindingProvider <a class="header-anchor" href="#usecolorbindingprovider" aria-label="Permalink to “useColorBindingProvider”">​</a></h1><p><code>useColorBindingProvider()</code> adapts OpenPencil COLOR variables to the generic <code>BindingProvider&lt;Color&gt;</code> contract. It resolves current-mode colors, binds indexed paint paths, creates variables in a Colors collection, updates all collection modes when requested, and exposes editor undo transactions.</p><p>Use it with <code>BindableValueRoot</code> and explicit targets such as <code>fills/0/color</code> or <code>strokes/0/color</code>. Picker focus and opening remain non-destructive; the consumer chooses when an actual color mutation begins and commits.</p><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/scene-graph&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">BindingTarget</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;@open-pencil/vue&#39;</span></span>
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
			})}"${_scopeId}> useColorBindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>()</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "function"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " useColorBindingProvider"),
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
				} }, " BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ">")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useColorBindingProvider</span>`);
			else return [createVNode("span", null, "useColorBindingProvider")];
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"${_scopeId}> provider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " provider"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ">")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>provider</span>`);
			else return [createVNode("span", null, "provider")];
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
			if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>function</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> useColorBindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>()</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "function"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " useColorBindingProvider"),
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
				} }, " BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ">")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>useColorBindingProvider</span>`);
			else return [createVNode("span", null, "useColorBindingProvider")];
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
			})}"${_scopeId}> targets</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[]</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " targets"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " BindingTarget"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "[]")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>targets</span>`);
			else return [createVNode("span", null, "targets")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">BindingTarget</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[] </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  { </span><span style="${ssrRenderStyle({
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
			})}"${_scopeId}>BindingTarget.nodeId: string</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "BindingTarget.nodeId: string")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>nodeId</span>`);
			else return [createVNode("span", null, "nodeId")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;rectangle-id&#39;</span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>BindingTarget.path: string</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "BindingTarget.path: string")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>path</span>`);
			else return [createVNode("span", null, "path")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;fills/0/color&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
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
			})}"${_scopeId}> value</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> Color</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " value"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " Color")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>value</span>`);
			else return [createVNode("span", null, "value")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color.r: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "Color.r: number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>r</span>`);
			else return [createVNode("span", null, "r")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0.2</span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color.g: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "Color.g: number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>g</span>`);
			else return [createVNode("span", null, "g")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0.5</span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color.b: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "Color.b: number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>b</span>`);
			else return [createVNode("span", null, "b")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0.9</span><span style="${ssrRenderStyle({
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color.a: number</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			} }, "Color.a: number")])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>a</span>`);
			else return [createVNode("span", null, "a")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
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
			})}"${_scopeId}> provider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " provider"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ">")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>provider</span>`);
			else return [createVNode("span", null, "provider")];
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
			})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>getState</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(targets: BindingTarget[]): BindingState</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ">"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "."),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "getState"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "(targets: BindingTarget[]): BindingState")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>getState</span>`);
			else return [createVNode("span", null, "getState")];
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
			})}"${_scopeId}> targets</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>[]</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " targets"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " BindingTarget"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "[]")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>targets</span>`);
			else return [createVNode("span", null, "targets")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
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
			})}"${_scopeId}> provider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>&gt;</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "const"),
				createVNode("span", { style: {
					"--shiki-light": "#005CC5",
					"--shiki-dark": "#79B8FF"
				} }, " provider"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ":"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, " BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, ">")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>provider</span>`);
			else return [createVNode("span", null, "provider")];
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
			})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>Color</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"${_scopeId}>resolve</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}>(variableId: string, target</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"${_scopeId}> BindingTarget): any</span></code></span>`);
			else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "BindingProvider"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "<"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "Color"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, ">"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "."),
				createVNode("span", { style: {
					"--shiki-light": "#6F42C1",
					"--shiki-dark": "#B392F0"
				} }, "resolve"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, "(variableId: string, target"),
				createVNode("span", { style: {
					"--shiki-light": "#c62739",
					"--shiki-dark": "#F97583"
				} }, "?:"),
				createVNode("span", { style: {
					"--shiki-light": "#24292E",
					"--shiki-dark": "#E1E4E8"
				} }, " BindingTarget): any")
			])])];
		}),
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`<span${_scopeId}>resolve</span>`);
			else return [createVNode("span", null, "resolve")];
		}),
		_: 1
	}, _parent));
	_push(`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;variable-id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><p>The composable requires an editor provided by <code>provideEditor()</code>.</p><h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./../components/bindable-value">BindableValue</a></li><li><a href="./../components/fill-swatch">FillSwatch</a></li><li><a href="./../composables/use-color-model">useColorModel</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/advanced/use-color-binding-provider.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var use_color_binding_provider_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, use_color_binding_provider_default as default };
