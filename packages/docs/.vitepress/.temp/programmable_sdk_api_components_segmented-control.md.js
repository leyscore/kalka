import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, defineComponent, resolveComponent, unref, useSSRContext, withCtx } from "vue";
//#region programmable/sdk/api/components/segmented-control.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"SegmentedControlRoot\",\"source\":\"packages/vue/src/primitives/SegmentedControl/SegmentedControlRoot.vue\",\"props\":[{\"name\":\"mode\",\"type\":\"SegmentedControlMode | undefined\",\"description\":\"Selection behavior or stateless action behavior.\",\"required\":false},{\"name\":\"modelValue\",\"type\":\"string | string[] | undefined\",\"description\":\"Controlled selected value or values.\",\"required\":false},{\"name\":\"orientation\",\"type\":\"SegmentedControlOrientation | undefined\",\"description\":\"Arrow-key navigation axis.\",\"required\":false,\"default\":\"\\\"horizontal\\\"\"},{\"name\":\"disabled\",\"type\":\"boolean | undefined\",\"description\":\"Disable every item.\",\"required\":false},{\"name\":\"required\",\"type\":\"boolean | undefined\",\"description\":\"Require a value in single-selection mode.\",\"required\":false,\"default\":\"false\"},{\"name\":\"rovingFocus\",\"type\":\"boolean | undefined\",\"description\":\"Enable arrow-key roving focus.\",\"required\":false,\"default\":\"true\"},{\"name\":\"loop\",\"type\":\"boolean | undefined\",\"description\":\"Wrap keyboard focus at the first and last item.\",\"required\":false,\"default\":\"true\"}],\"events\":[{\"name\":\"update:modelValue\",\"payload\":\"[value: string | string[] | undefined]\",\"description\":\"\"},{\"name\":\"action\",\"payload\":\"[value: string]\",\"description\":\"\"}],\"slots\":[{\"name\":\"default\",\"props\":\"{ mode: SegmentedControlMode; modelValue: string | string[] | undefined; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"SegmentedControlItem\",\"source\":\"packages/vue/src/primitives/SegmentedControl/SegmentedControlItem.vue\",\"props\":[{\"name\":\"value\",\"type\":\"string\",\"description\":\"Stable selection or action identifier.\",\"required\":true},{\"name\":\"disabled\",\"type\":\"boolean | undefined\",\"description\":\"Disable this item.\",\"required\":false},{\"name\":\"as\",\"type\":\"string | Component | undefined\",\"description\":\"Element or component rendered by this item.\",\"required\":false,\"default\":\"\\\"button\\\"\"},{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Merge item behavior into the single child element.\",\"required\":false,\"default\":\"false\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"SegmentedControlItemSlotProps\",\"description\":\"\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/segmented-control.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"SegmentedControl\",\"description\":\"Accessible selection and action-only segmented controls.\",\"frontmatter\":{\"title\":\"SegmentedControl\",\"description\":\"Accessible selection and action-only segmented controls.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/segmented-control\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/segmented-control\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/segmented-control\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/segmented-control\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"SegmentedControl — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"SegmentedControl — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Accessible selection and action-only segmented controls.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Accessible selection and action-only segmented controls.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Accessible selection and action-only segmented controls.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/segmented-control.md\",\"filePath\":\"programmable/sdk/api/components/segmented-control.md\",\"lastUpdated\":1783935363000}");
var segmented_control_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/segmented-control.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="segmentedcontrol" tabindex="-1">SegmentedControl <a class="header-anchor" href="#segmentedcontrol" aria-label="Permalink to “SegmentedControl”">​</a></h1><p>SegmentedControl delegates selection, roving focus, and keyboard behavior to Reka UI. Single and multiple modes retain selection; action mode emits commands without toggle state.</p><h2 id="selection-mode" tabindex="-1">Selection mode <a class="header-anchor" href="#selection-mode" aria-label="Permalink to “Selection mode”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
					})}"${_scopeId}>import SegmentedControlItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlItem</span>`);
					else return [createVNode("span", null, "SegmentedControlItem")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>import SegmentedControlRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlRoot</span>`);
					else return [createVNode("span", null, "SegmentedControlRoot")];
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const alignment: Ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const alignment: Ref<"),
						createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ","),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>alignment</span>`);
					else return [createVNode("span", null, "alignment")];
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(value: string): Ref&lt;string, string&gt; (+1 overload)</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Takes an inner value and returns a reactive and mutable ref object, which
has a single property <code${_scopeId}>.value</code> that points to the inner value.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>value</code>  - The object to wrap in the ref.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@see</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><a href="https://vuejs.org/api/reactivity-core.html#ref"${_scopeId}>https://vuejs.org/api/reactivity-core.html#ref</a></span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "ref<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">(value: string): Ref<string, string> (+1 overload)")
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
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;left&#39;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">)</span></span>
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
					})}"${_scopeId}>import SegmentedControlRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlRoot</span>`);
					else return [createVNode("span", null, "SegmentedControlRoot")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>modelValue: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "modelValue: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>v-model</span>`);
					else return [createVNode("span", null, "v-model")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const alignment: Ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const alignment: Ref<"),
						createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ","),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>alignment</span>`);
					else return [createVNode("span", null, "alignment")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"> aria-label</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;Alignment&quot;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import SegmentedControlItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlItem</span>`);
					else return [createVNode("span", null, "SegmentedControlItem")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>value: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "value: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>value</span>`);
					else return [createVNode("span", null, "value")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;left&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Left&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">SegmentedControlItem</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import SegmentedControlItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlItem</span>`);
					else return [createVNode("span", null, "SegmentedControlItem")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>value: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "value: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>value</span>`);
					else return [createVNode("span", null, "value")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;center&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Center&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">SegmentedControlItem</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import SegmentedControlItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import SegmentedControlItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>SegmentedControlItem</span>`);
					else return [createVNode("span", null, "SegmentedControlItem")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>value: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "value: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>value</span>`);
					else return [createVNode("span", null, "value")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;right&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Right&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">SegmentedControlItem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">SegmentedControlRoot</span><span style="${ssrRenderStyle({
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
			})}">&gt;</span></span></code></pre></div><h2 id="action-mode" tabindex="-1">Action mode <a class="header-anchor" href="#action-mode" aria-label="Permalink to “Action mode”">​</a></h2><p>Use <code>mode=&quot;action&quot;</code> for grouped commands such as flip and rotate. Arrow keys move focus, while Space or Enter emits <code>action(value)</code> without leaving a selected segment.</p><p>The complete state matrix is shown in the <a href="./property-section">PropertySection demo</a>.</p><h2 id="generated-api-reference" tabindex="-1">Generated API reference <a class="header-anchor" href="#generated-api-reference" aria-label="Permalink to “Generated API reference”">​</a></h2>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/segmented-control.md
var _sfc_setup = segmented_control_md_vue_type_script_setup_true_lang_default.setup;
segmented_control_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/segmented-control.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var segmented_control_default = segmented_control_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, segmented_control_default as default };
