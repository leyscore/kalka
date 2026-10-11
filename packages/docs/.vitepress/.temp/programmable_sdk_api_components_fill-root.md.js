import { t as States_default } from "./States.DPVMCSgD.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, defineComponent, resolveComponent, unref, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/components/fill-root.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"FillRoot\",\"source\":\"packages/vue/src/primitives/Fill/FillRoot.vue\",\"props\":[{\"name\":\"fill\",\"type\":\"Fill\",\"description\":\"\",\"required\":true}],\"events\":[{\"name\":\"update\",\"payload\":\"[fill: Fill]\",\"description\":\"\"}],\"slots\":[{\"name\":\"default\",\"props\":\"FillRootSlotProps\",\"description\":\"\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/fill-root.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"FillRoot\",\"description\":\"Headless fill category state and conversion actions.\",\"frontmatter\":{\"title\":\"FillRoot\",\"description\":\"Headless fill category state and conversion actions.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/fill-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/fill-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/fill-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/fill-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"FillRoot — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"FillRoot — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Headless fill category state and conversion actions.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Headless fill category state and conversion actions.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Headless fill category state and conversion actions.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/fill-root.md\",\"filePath\":\"programmable/sdk/api/components/fill-root.md\",\"lastUpdated\":1790363714000}");
var fill_root_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/fill-root.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="fillroot" tabindex="-1">FillRoot <a class="header-anchor" href="#fillroot" aria-label="Permalink to “FillRoot”">​</a></h1><p><code>FillRoot</code> owns solid, gradient, and image category state without owning a popover or visual swatch. Compose it around the picker surface appropriate for your application.</p>`);
			_push(ssrRenderComponent(States_default, null, null, _parent));
			_push(`<p>Its default slot exposes the current fill, category, transparency, swatch background, and grouped conversion actions. Category changes emit immutable <code>Fill</code> values and are no-ops when the requested category is already active.</p><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
					})}"${_scopeId}>function ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(value: T): [T] extends [Ref] ? IfAny&lt;T, Ref&lt;T&gt;, T&gt; : Ref&lt;UnwrapRef&lt;T&gt;, UnwrapRef&lt;T&gt; | T&gt; (+1 overload)</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Takes an inner value and returns a reactive and mutable ref object, which
has a single property <code${_scopeId}>.value</code> that points to the inner value.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>value</code>  - The object to wrap in the ref.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@see</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><a href="https://vuejs.org/api/reactivity-core.html#ref"${_scopeId}>https://vuejs.org/api/reactivity-core.html#ref</a></span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "function ref<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "T"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">(value: T): [T] extends [Ref] ? IfAny<T, Ref<T>, T> : Ref<UnwrapRef<T>, UnwrapRef<T> | T> (+1 overload)")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, [
							createTextVNode("Takes an inner value and returns a reactive and mutable ref object, which\nhas a single property "),
							createVNode("code", null, ".value"),
							createTextVNode(" that points to the inner value.")
						])]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "value"), createTextVNode("  - The object to wrap in the ref.")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@see"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("a", { href: "https://vuejs.org/api/reactivity-core.html#ref" }, "https://vuejs.org/api/reactivity-core.html#ref")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ref</span>`);
					else return [createVNode("span", null, "ref")];
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
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> type</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> { </span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">Fill</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import FillRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import FillRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>FillRoot</span>`);
					else return [createVNode("span", null, "FillRoot")];
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const fill: Ref&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>},</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></span></code></pre></code></span>`);
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
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const fill: Ref<{")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "},"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fill</span>`);
					else return [createVNode("span", null, "fill")];
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>Fill</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(value: Fill): Ref&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    type: FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    color: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        r: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        g: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        b: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        a: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    opacity: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    visible: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    blendMode?: BlendMode | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... 15 more ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    customEffectId?: string | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>}, Fill | {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    type: FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    color: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        r: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        g: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        b: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        a: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    opacity: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    visible: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    blendMode?: BlendMode | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... 15 more ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    customEffectId?: string | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>}&gt; (+1 overload)</span></span></code></pre></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Takes an inner value and returns a reactive and mutable ref object, which
has a single property <code${_scopeId}>.value</code> that points to the inner value.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>value</code>  - The object to wrap in the ref.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@see</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><a href="https://vuejs.org/api/reactivity-core.html#ref"${_scopeId}>https://vuejs.org/api/reactivity-core.html#ref</a></span></span></div></span>`);
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
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, "ref<"),
								createVNode("span", { style: {
									"--shiki-light": "#11782a",
									"--shiki-dark": "#85E89D"
								} }, "Fill"),
								createVNode("span", { style: {
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, ">(value: Fill): Ref<{")
							]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    type: FillType;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    color: {")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        r: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        g: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        b: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        a: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    };")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    opacity: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    visible: boolean;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    blendMode?: BlendMode | undefined;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... 15 more ...;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    customEffectId?: string | undefined;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "}, Fill | {")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    type: FillType;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    color: {")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        r: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        g: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        b: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "        a: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    };")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    opacity: number;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    visible: boolean;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    blendMode?: BlendMode | undefined;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... 15 more ...;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    customEffectId?: string | undefined;")]),
							createTextVNode("\n"),
							createVNode("span", { class: "line" }, [createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "}> (+1 overload)")])
						])])]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, [
							createTextVNode("Takes an inner value and returns a reactive and mutable ref object, which\nhas a single property "),
							createVNode("code", null, ".value"),
							createTextVNode(" that points to the inner value.")
						])]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "value"), createTextVNode("  - The object to wrap in the ref.")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@see"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("a", { href: "https://vuejs.org/api/reactivity-core.html#ref" }, "https://vuejs.org/api/reactivity-core.html#ref")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ref</span>`);
					else return [createVNode("span", null, "ref")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">Fill</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;({</span></span>
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
					})}"${_scopeId}>Fill.type: FillType</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Fill.type: FillType")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>type</span>`);
					else return [createVNode("span", null, "type")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;SOLID&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Fill.color: Color</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Fill.color: Color")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>color</span>`);
					else return [createVNode("span", null, "color")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: { </span><span style="${ssrRenderStyle({
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
			})}"> },</span></span>
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
					})}"${_scopeId}>Fill.opacity: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Fill.opacity: number")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>opacity</span>`);
					else return [createVNode("span", null, "opacity")];
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
					})}"${_scopeId}>Fill.visible: boolean</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Fill.visible: boolean")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>visible</span>`);
					else return [createVNode("span", null, "visible")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">true</span></span>
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
					})}"${_scopeId}>import FillRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import FillRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>FillRoot</span>`);
					else return [createVNode("span", null, "FillRoot")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>fill: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    type: FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    color: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        r: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        g: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        b: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        a: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    opacity: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    visible: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    blendMode?: BlendMode | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    gradientStops?: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    }[] | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... 14 more ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    customEffectId?: string | undefined;</span></span>
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
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "fill: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    type: FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    color: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        r: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        g: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        b: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        a: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    opacity: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    visible: boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    blendMode?: BlendMode | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    gradientStops?: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ...;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    }[] | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    ... 14 more ...;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    customEffectId?: string | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "}")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>:</span>`);
					else return [createVNode("span", null, ":")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>fill: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    type: FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    color: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        r: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        g: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        b: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        a: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    opacity: number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    visible: boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    blendMode?: BlendMode | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    gradientStops?: {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    }[] | undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... 14 more ...;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    customEffectId?: string | undefined;</span></span>
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
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "fill: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    type: FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    color: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        r: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        g: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        b: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        a: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    opacity: number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    visible: boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    blendMode?: BlendMode | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    gradientStops?: {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ...;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    }[] | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    ... 14 more ...;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "    customEffectId?: string | undefined;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "}")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fill</span>`);
					else return [createVNode("span", null, "fill")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const fill: Ref&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>},</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></span></code></pre></code></span>`);
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
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const fill: Ref<{")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "},"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fill</span>`);
					else return [createVNode("span", null, "fill")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> @</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>onUpdate: (\$event: any) =&gt; any</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@type</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>{typeof __VLS_5.update}</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "onUpdate: ($event: any) => any")]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@type"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "{typeof __VLS_5.update}")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>update</span>`);
					else return [createVNode("span", null, "update")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const fill: Ref&lt;{</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>},</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>        a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    };</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>        ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>    ... </span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>14</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> more</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></span></code></pre></code></span>`);
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
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const fill: Ref<{")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "},"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    type:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " FillType;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    color:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        r:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        g:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        b:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "        a:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    };")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    opacity:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    visible:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " boolean;")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    blendMode?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " BlendMode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "    gradientStops?:"), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " {")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "        ..."), createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ";")]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    }[]"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "    ... "),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "14"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " more"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ..."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ";")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    customEffectId?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " undefined;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fill</span>`);
					else return [createVNode("span", null, "fill")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>\$event: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "$event: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>\$event</span>`);
					else return [createVNode("span", null, "$event")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const model: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const model: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>model</span>`);
					else return [createVNode("span", null, "model")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    &lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
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
					})}"${_scopeId}>button: ButtonHTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "button: ButtonHTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>button</span>`);
					else return [createVNode("span", null, "button")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"> @</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>onClick?: ((payload: PointerEvent) =&gt; void) | undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "onClick?: ((payload: PointerEvent) => void) | undefined")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>click</span>`);
					else return [createVNode("span", null, "click")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
					})}"${_scopeId}>const model: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const model: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>model</span>`);
					else return [createVNode("span", null, "model")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">.actions.toGradient&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Gradient&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
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
					})}"${_scopeId}>button: ButtonHTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "button: ButtonHTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>button</span>`);
					else return [createVNode("span", null, "button")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">FillRoot</span><span style="${ssrRenderStyle({
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
			})}">&gt;</span></span></code></pre></div><h2 id="generated-api-reference" tabindex="-1">Generated API reference <a class="header-anchor" href="#generated-api-reference" aria-label="Permalink to “Generated API reference”">​</a></h2>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`<h2 id="related-apis" tabindex="-1">Related APIs <a class="header-anchor" href="#related-apis" aria-label="Permalink to “Related APIs”">​</a></h2><ul><li><a href="./fill-swatch">FillSwatch</a></li><li><a href="./channel-slider">ChannelSlider</a></li><li><a href="./../composables/use-color-model">useColorModel</a></li></ul></div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/fill-root.md
var _sfc_setup = fill_root_md_vue_type_script_setup_true_lang_default.setup;
fill_root_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/fill-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var fill_root_default = fill_root_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, fill_root_default as default };
