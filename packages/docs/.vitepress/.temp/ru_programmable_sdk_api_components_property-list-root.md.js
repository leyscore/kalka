import { t as data } from "./property-list.data.DykXgY9h.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, defineComponent, resolveComponent, unref, useSSRContext, withCtx } from "vue";
//#region ru/programmable/sdk/api/components/property-list-root.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"PropertyList\",\"description\":\"Строго типизированная структура без встроенного оформления для списков заливок, обводок и эффектов.\",\"frontmatter\":{\"title\":\"PropertyList\",\"description\":\"Строго типизированная структура без встроенного оформления для списков заливок, обводок и эффектов.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/ru/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"ru_RU\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/sdk/api/components/property-list-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/sdk/api/components/property-list-root\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/property-list-root\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"PropertyList — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"PropertyList — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Строго типизированная структура без встроенного оформления для списков заливок, обводок и эффектов.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Строго типизированная структура без встроенного оформления для списков заливок, обводок и эффектов.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Строго типизированная структура без встроенного оформления для списков заливок, обводок и эффектов.\"}]]},\"headers\":[],\"relativePath\":\"ru/programmable/sdk/api/components/property-list-root.md\",\"filePath\":\"ru/programmable/sdk/api/components/property-list-root.md\",\"lastUpdated\":1787240210000}");
var property_list_root_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "ru/programmable/sdk/api/components/property-list-root.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="propertylist" tabindex="-1">PropertyList <a class="header-anchor" href="#propertylist" aria-label="Permalink to “PropertyList”">​</a></h1><p>PropertyList — управляемый компонент без встроенного оформления для списков заливок, обводок и эффектов. Параметр <code>propKey</code> задаёт точный тип <code>Fill</code>, <code>Stroke</code> или <code>Effect</code> для слотов и действий. Изменение состояния редактора и история отмены остаются в <code>useEditorPropertyList()</code> или адаптере приложения.</p><h2 id="состав" tabindex="-1">Состав <a class="header-anchor" href="#состав" aria-label="Permalink to “Состав”">​</a></h2><ul><li><code>PropertyListRoot</code> — управляемые элементы, их идентификация, смешанное состояние и смысловые события;</li><li><code>PropertyListItem</code> — точный тип элемента, а также <code>data-hidden</code> и <code>data-dragging</code>;</li><li><code>PropertyListAdd</code> — добавление типизированного элемента;</li><li><code>PropertyListRemove</code> — удаление элемента по индексу;</li><li><code>PropertyListVisibility</code> — изменение видимости по индексу и значение <code>aria-pressed</code>.</li></ul><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
			})}"> {</span></span>
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
					})}"${_scopeId}>import PropertyListItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListItem</span>`);
					else return [createVNode("span", null, "PropertyListItem")];
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
					})}"${_scopeId}>import PropertyListRemove</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListRemove")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListRemove</span>`);
					else return [createVNode("span", null, "PropertyListRemove")];
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
					})}"${_scopeId}>import PropertyListRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListRoot</span>`);
					else return [createVNode("span", null, "PropertyListRoot")];
				}),
				_: 1
			}, _parent));
			_push(`</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">} </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const fills: Ref&lt;{</span></span>
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
					})}"${_scopeId}>}[],</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill[]</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>}[]</span><span style="${ssrRenderStyle({
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
						} }, "const fills: Ref<{")]),
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
							} }, "}[],"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill[]"),
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
						} }, "}[]"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fills</span>`);
					else return [createVNode("span", null, "fills")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(value: Fill[]): Ref&lt;{</span></span>
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
					})}"${_scopeId}>}[], Fill[] | {</span></span>
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
					})}"${_scopeId}>}[]&gt; (+1 overload)</span></span></code></pre></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Takes an inner value and returns a reactive and mutable ref object, which
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
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, "[]"),
								createVNode("span", { style: {
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, ">(value: Fill[]): Ref<{")
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
							} }, "}[], Fill[] | {")]),
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
							} }, "}[]> (+1 overload)")])
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
			})}">[]&gt;([])</span></span>
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
					})}"${_scopeId}>import PropertyListRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListRoot</span>`);
					else return [createVNode("span", null, "PropertyListRoot")];
				}),
				_: 1
			}, _parent));
			_push(`</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">    </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>propKey: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "propKey: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>prop-key</span>`);
					else return [createVNode("span", null, "prop-key")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;fills&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>items: {</span></span>
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
					})}"${_scopeId}>}[]</span></span></code></pre></code></span>`);
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
						} }, "items: {")]),
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
						} }, "}[]")])
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
					})}"${_scopeId}>items: {</span></span>
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
					})}"${_scopeId}>}[]</span></span></code></pre></code></span>`);
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
						} }, "items: {")]),
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
						} }, "}[]")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>items</span>`);
					else return [createVNode("span", null, "items")];
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
					})}"${_scopeId}>const fills: Ref&lt;{</span></span>
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
					})}"${_scopeId}>}[],</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill[]</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>}[]</span><span style="${ssrRenderStyle({
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
						} }, "const fills: Ref<{")]),
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
							} }, "}[],"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill[]"),
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
						} }, "}[]"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fills</span>`);
					else return [createVNode("span", null, "fills")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    @</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>onRemove: (\$event: any) =&gt; {</span></span>
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
					})}"${_scopeId}>}[]</span></span></code></pre></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@type</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>{typeof __VLS_5.remove}</span></span></div></span>`);
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
						} }, "onRemove: ($event: any) => {")]),
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
						} }, "}[]")])
					])])]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@type"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "{typeof __VLS_5.remove}")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>remove</span>`);
					else return [createVNode("span", null, "remove")];
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
					})}"${_scopeId}>const fills: Ref&lt;{</span></span>
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
					})}"${_scopeId}>}[],</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Fill[]</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>}[]</span><span style="${ssrRenderStyle({
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
						} }, "const fills: Ref<{")]),
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
							} }, "}[],"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Fill[]"),
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
						} }, "}[]"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>fills</span>`);
					else return [createVNode("span", null, "fills")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>Array&lt;{ </span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>type:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> FillType;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> color:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> r:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> g:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> b:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> a:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> };</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> opacity:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> visible:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> boolean;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> blendMode?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BlendMode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> gradientStops?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ...</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> }[]</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> ... </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> customEffectId?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> undefined;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> }</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;.splice(start: number, deleteCount?: number): {</span></span>
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
					})}"${_scopeId}>}[] (+1 overload)</span></span></code></pre></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>start</code>  The zero-based location in the array from which to start removing elements.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>deleteCount</code>  The number of elements to remove.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>An array containing the elements that were deleted.</span></span></div></span>`);
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
								} }, "Array<{ "),
								createVNode("span", { style: {
									"--shiki-light": "#11782a",
									"--shiki-dark": "#85E89D"
								} }, "type:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " FillType;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " color:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " {"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " r:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " number;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " g:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " number;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " b:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " number;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " a:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " number;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " };"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " opacity:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " number;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " visible:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " boolean;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " blendMode?:"),
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
								} }, " undefined;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " gradientStops?:"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " {"),
								createVNode("span", { style: {
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, " ..."),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, ";"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " }[]"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " |"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " undefined;"),
								createVNode("span", { style: {
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, " ... "),
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
								} }, ";"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " customEffectId?:"),
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
								} }, " undefined;"),
								createVNode("span", { style: {
									"--shiki-light": "#6F42C1",
									"--shiki-dark": "#B392F0"
								} }, " }"),
								createVNode("span", { style: {
									"--shiki-light": "#24292E",
									"--shiki-dark": "#E1E4E8"
								} }, ">.splice(start: number, deleteCount?: number): {")
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
							} }, "}[] (+1 overload)")])
						])])]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [
							createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "start"), createTextVNode("  The zero-based location in the array from which to start removing elements.")])]),
							createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "deleteCount"), createTextVNode("  The number of elements to remove.")])]),
							createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "An array containing the elements that were deleted.")])
						])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>splice</span>`);
					else return [createVNode("span", null, "splice")];
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
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">1</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">)</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">    v-slot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">{ </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const items: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const items: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>items</span>`);
					else return [createVNode("span", null, "items")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> }</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &gt;</span></span>
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
					})}"${_scopeId}>import PropertyListItem</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListItem")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListItem</span>`);
					else return [createVNode("span", null, "PropertyListItem")];
				}),
				_: 1
			}, _parent));
			_push(`</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">      v-for</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const _: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const _: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>_</span>`);
					else return [createVNode("span", null, "_")];
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
					})}"${_scopeId}>const index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">in</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const items: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const items: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>items</span>`);
					else return [createVNode("span", null, "items")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">      </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>key: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "key: any")])])];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>key: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "key: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>key</span>`);
					else return [createVNode("span", null, "key")];
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
					})}"${_scopeId}>const index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">      </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>propKey: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "propKey: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>prop-key</span>`);
					else return [createVNode("span", null, "prop-key")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;fills&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">      </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "index: any")])])];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
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
					})}"${_scopeId}>const index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">      v-slot</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">{ </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const item: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const item: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>item</span>`);
					else return [createVNode("span", null, "item")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> }</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    &gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">      &lt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>span: HTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "span: HTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>span</span>`);
					else return [createVNode("span", null, "span")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;{{ </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const item: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const item: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>item</span>`);
					else return [createVNode("span", null, "item")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">?.type }}&lt;/</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>span: HTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "span: HTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>span</span>`);
					else return [createVNode("span", null, "span")];
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
			})}">      &lt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import PropertyListRemove</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertyListRemove")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertyListRemove</span>`);
					else return [createVNode("span", null, "PropertyListRemove")];
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
					})}"${_scopeId}>propKey: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "propKey: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>prop-key</span>`);
					else return [createVNode("span", null, "prop-key")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;fills&quot;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "index: any")])])];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
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
					})}"${_scopeId}>const index: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const index: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>index</span>`);
					else return [createVNode("span", null, "index")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Удалить&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertyListRemove</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertyListItem</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertyListRoot</span><span style="${ssrRenderStyle({
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
			})}">&gt;</span></span></code></pre></div><p>Общая матрица интерактивных состояний показана в <a href="/programmable/sdk/api/components/property-section">демонстрации PropertySection</a>.</p><h2 id="адаптер-редактора" tabindex="-1">Адаптер редактора <a class="header-anchor" href="#адаптер-редактора" aria-label="Permalink to “Адаптер редактора”">​</a></h2><p>Панели OpenPencil используют <code>useEditorPropertyList(propKey)</code>, чтобы связать управляемые события с выделением, изменением нескольких объектов, группировкой истории отмены и изменением порядка. Пользователи SDK могут предоставить собственный адаптер состояния без контекста редактора OpenPencil.</p><h2 id="сгенерированныи-справочник-api" tabindex="-1">Сгенерированный справочник API <a class="header-anchor" href="#сгенерированныи-справочник-api" aria-label="Permalink to “Сгенерированный справочник API”">​</a></h2>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ru/programmable/sdk/api/components/property-list-root.md
var _sfc_setup = property_list_root_md_vue_type_script_setup_true_lang_default.setup;
property_list_root_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/programmable/sdk/api/components/property-list-root.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var property_list_root_default = property_list_root_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, property_list_root_default as default };
