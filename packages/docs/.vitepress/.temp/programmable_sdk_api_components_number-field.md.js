import { i as useNumberField, n as NumberFieldRoot_default, r as NumberFieldInput_default, t as NumberFieldValue_default } from "./NumberFieldValue.BMbM5DpG.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { createTextVNode, createVNode, defineComponent, h, mergeProps, ref, resolveComponent, unref, useSSRContext, withCtx } from "vue";
//#region ../vue/src/controls/node-props/helpers.ts
var MIXED = Symbol("mixed");
//#endregion
//#region ../vue/src/primitives/NumberField/parts.ts
function createNumberFieldPart(part) {
	return defineComponent({
		name: `NumberField${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`,
		inheritAttrs: false,
		setup(_props, { attrs, slots }) {
			const ctx = useNumberField();
			return () => h("span", {
				...attrs,
				...ctx.stateAttrs.value,
				"data-slot": part
			}, slots.default?.(ctx.slotProps.value));
		}
	});
}
var NumberFieldLeading = createNumberFieldPart("leading");
var NumberFieldUnit = createNumberFieldPart("unit");
var NumberFieldTrailing = createNumberFieldPart("trailing");
var NumberFieldMenu = createNumberFieldPart("menu");
//#endregion
//#region ../vue/src/primitives/NumberField/examples/States.vue?vue&type=script&setup=true&lang.ts
var States_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "States",
	__ssrInlineRender: true,
	setup(__props) {
		const value = ref(24);
		const mixed = ref(MIXED);
		const disabled = ref(16);
		const bound = ref(8);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-[520px] rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-5 text-[var(--vp-c-text-1)]" }, _attrs))}><div><p class="mb-1 text-xs font-semibold">Interactive anatomy</p><p class="mb-2 text-[11px] text-[var(--vp-c-text-2)]">Try +10, *2, 50%, or 12*8+4</p>`);
			_push(ssrRenderComponent(NumberFieldRoot_default, {
				modelValue: value.value,
				"onUpdate:modelValue": ($event) => value.value = $event,
				min: 0,
				max: 200,
				step: 2,
				"aria-label": "Interactive number field"
			}, {
				default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div${ssrRenderAttrs(mergeProps(attrs, { class: "flex h-[26px] w-56 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] text-xs outline-none focus-within:border-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
						_push(ssrRenderComponent(unref(NumberFieldLeading), { class: "px-2 text-[var(--vp-c-text-2)]" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`W`);
								else return [createTextVNode("W")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }, null, _parent, _scopeId));
						_push(ssrRenderComponent(NumberFieldValue_default, { class: "min-w-0 flex-1 truncate" }, null, _parent, _scopeId));
						_push(ssrRenderComponent(unref(NumberFieldUnit), { class: "pr-1 text-[var(--vp-c-text-2)]" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`px`);
								else return [createTextVNode("px")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(NumberFieldTrailing), { class: "flex size-[26px] items-center justify-center text-[var(--vp-c-text-2)]" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` R `);
								else return [createTextVNode(" R ")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(NumberFieldMenu), { class: "flex size-[26px] items-center justify-center text-[var(--vp-c-text-2)]" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` M `);
								else return [createTextVNode(" M ")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", mergeProps(attrs, {
						class: "flex h-[26px] w-56 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] text-xs outline-none focus-within:border-[var(--vp-c-brand-1)]",
						onPointerdown: ($event) => !editing && actions.startScrub($event)
					}), [
						createVNode(unref(NumberFieldLeading), { class: "px-2 text-[var(--vp-c-text-2)]" }, {
							default: withCtx(() => [createTextVNode("W")]),
							_: 1
						}),
						createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }),
						createVNode(NumberFieldValue_default, { class: "min-w-0 flex-1 truncate" }),
						createVNode(unref(NumberFieldUnit), { class: "pr-1 text-[var(--vp-c-text-2)]" }, {
							default: withCtx(() => [createTextVNode("px")]),
							_: 1
						}),
						createVNode(unref(NumberFieldTrailing), { class: "flex size-[26px] items-center justify-center text-[var(--vp-c-text-2)]" }, {
							default: withCtx(() => [createTextVNode(" R ")]),
							_: 1
						}),
						createVNode(unref(NumberFieldMenu), { class: "flex size-[26px] items-center justify-center text-[var(--vp-c-text-2)]" }, {
							default: withCtx(() => [createTextVNode(" M ")]),
							_: 1
						})
					], 16, ["onPointerdown"])];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-3"><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Mixed</p>`);
			_push(ssrRenderComponent(NumberFieldRoot_default, {
				modelValue: mixed.value,
				"onUpdate:modelValue": ($event) => mixed.value = $event,
				"aria-label": "Mixed number field"
			}, {
				default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div${ssrRenderAttrs(mergeProps(attrs, { class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs outline-none focus-within:border-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
						_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }, null, _parent, _scopeId));
						_push(ssrRenderComponent(NumberFieldValue_default, { class: "text-[var(--vp-c-text-2)]" }, null, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", mergeProps(attrs, {
						class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs outline-none focus-within:border-[var(--vp-c-brand-1)]",
						onPointerdown: ($event) => !editing && actions.startScrub($event)
					}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }), createVNode(NumberFieldValue_default, { class: "text-[var(--vp-c-text-2)]" })], 16, ["onPointerdown"])];
				}),
				_: 1
			}, _parent));
			_push(`</div><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Disabled</p>`);
			_push(ssrRenderComponent(NumberFieldRoot_default, {
				modelValue: disabled.value,
				"onUpdate:modelValue": ($event) => disabled.value = $event,
				"aria-label": "Disabled number field",
				disabled: ""
			}, {
				default: withCtx(({ attrs }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div${ssrRenderAttrs(mergeProps(attrs, { class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-text-2)] opacity-60" }))}${_scopeId}>`);
						_push(ssrRenderComponent(NumberFieldValue_default, null, null, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", mergeProps(attrs, { class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-text-2)] opacity-60" }), [createVNode(NumberFieldValue_default)], 16)];
				}),
				_: 1
			}, _parent));
			_push(`</div><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Bound</p>`);
			_push(ssrRenderComponent(NumberFieldRoot_default, {
				modelValue: bound.value,
				"onUpdate:modelValue": ($event) => bound.value = $event,
				"aria-label": "Bound number field",
				bound: ""
			}, {
				default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div${ssrRenderAttrs(mergeProps(attrs, { class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-brand-1)] outline-none focus-within:border-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
						_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }, null, _parent, _scopeId));
						_push(ssrRenderComponent(NumberFieldValue_default, null, null, _parent, _scopeId));
						_push(ssrRenderComponent(unref(NumberFieldUnit), { class: "ml-1" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`gap/md`);
								else return [createTextVNode("gap/md")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", mergeProps(attrs, {
						class: "flex h-[26px] min-w-0 items-center overflow-hidden rounded border border-transparent bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-brand-1)] outline-none focus-within:border-[var(--vp-c-brand-1)]",
						onPointerdown: ($event) => !editing && actions.startScrub($event)
					}), [
						createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 border-0 bg-transparent outline-none" }),
						createVNode(NumberFieldValue_default),
						createVNode(unref(NumberFieldUnit), { class: "ml-1" }, {
							default: withCtx(() => [createTextVNode("gap/md")]),
							_: 1
						})
					], 16, ["onPointerdown"])];
				}),
				_: 1
			}, _parent));
			_push(`</div></div></div>`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/NumberField/examples/States.vue
var _sfc_setup$1 = States_vue_vue_type_script_setup_true_lang_default.setup;
States_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/NumberField/examples/States.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var States_default = States_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region programmable/sdk/api/components/number-field.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"NumberFieldRoot\",\"source\":\"packages/vue/src/primitives/NumberField/NumberFieldRoot.vue\",\"props\":[{\"name\":\"modelValue\",\"type\":\"number | symbol\",\"description\":\"Current numeric value or the mixed-value sentinel.\",\"required\":true},{\"name\":\"min\",\"type\":\"number | undefined\",\"description\":\"Minimum allowed value.\",\"required\":false,\"default\":\"-Infinity\"},{\"name\":\"max\",\"type\":\"number | undefined\",\"description\":\"Maximum allowed value and percentage-expression basis.\",\"required\":false,\"default\":\"Infinity\"},{\"name\":\"step\",\"type\":\"number | undefined\",\"description\":\"Pointer-scrub and Arrow-key increment.\",\"required\":false,\"default\":\"1\"},{\"name\":\"sensitivity\",\"type\":\"number | undefined\",\"description\":\"Multiplier applied to pointer-scrub movement.\",\"required\":false,\"default\":\"1\"},{\"name\":\"placeholder\",\"type\":\"string | undefined\",\"description\":\"Text shown when modelValue is mixed.\",\"required\":false,\"default\":\"\\\"Mixed\\\"\"},{\"name\":\"ariaLabel\",\"type\":\"string | undefined\",\"description\":\"Accessible name for the spinbutton.\",\"required\":false},{\"name\":\"disabled\",\"type\":\"boolean | undefined\",\"description\":\"Prevents editing, scrubbing, and keyboard stepping.\",\"required\":false},{\"name\":\"inheritBinding\",\"type\":\"boolean | undefined\",\"description\":\"Consume the enclosing BindableValue context. Disable for independent sibling values.\",\"required\":false,\"default\":\"true\"},{\"name\":\"bound\",\"type\":\"boolean | undefined\",\"description\":\"\",\"required\":false},{\"name\":\"editPolicy\",\"type\":\"NumberFieldEditPolicy | undefined\",\"description\":\"Mutation policy used when the value is bound.\",\"required\":false,\"default\":\"\\\"editable\\\"\"}],\"events\":[{\"name\":\"cancel\",\"payload\":\"[]\",\"description\":\"\"},{\"name\":\"update:modelValue\",\"payload\":\"[value: number]\",\"description\":\"\"},{\"name\":\"editing-change\",\"payload\":\"[editing: boolean]\",\"description\":\"\"},{\"name\":\"commit\",\"payload\":\"[value: number, previous: number]\",\"description\":\"\"},{\"name\":\"invalid\",\"payload\":\"[expression: string, reason: NumberExpressionError]\",\"description\":\"\"},{\"name\":\"detach-request\",\"payload\":\"[source: NumberFieldMutationSource]\",\"description\":\"\"}],\"slots\":[{\"name\":\"default\",\"props\":\"NumberFieldSlotProps\",\"description\":\"Complete render contract for composing a numeric field.\"}],\"exposed\":[]},{\"name\":\"NumberFieldInput\",\"source\":\"packages/vue/src/primitives/NumberField/NumberFieldInput.vue\",\"props\":[],\"events\":[],\"slots\":[],\"exposed\":[]},{\"name\":\"NumberFieldValue\",\"source\":\"packages/vue/src/primitives/NumberField/NumberFieldValue.vue\",\"props\":[],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"NumberFieldSlotProps & { value: string; }\",\"description\":\"Non-editing display value plus the complete field render contract.\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/number-field.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"NumberField\",\"description\":\"Headless numeric field primitives with scrubbing, expressions, and keyboard stepping.\",\"frontmatter\":{\"title\":\"NumberField\",\"description\":\"Headless numeric field primitives with scrubbing, expressions, and keyboard stepping.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/number-field\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/number-field\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/number-field\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/number-field\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"NumberField — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"NumberField — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Headless numeric field primitives with scrubbing, expressions, and keyboard stepping.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Headless numeric field primitives with scrubbing, expressions, and keyboard stepping.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Headless numeric field primitives with scrubbing, expressions, and keyboard stepping.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/number-field.md\",\"filePath\":\"programmable/sdk/api/components/number-field.md\",\"lastUpdated\":1790363714000}");
var number_field_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/number-field.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="numberfield" tabindex="-1">NumberField <a class="header-anchor" href="#numberfield" aria-label="Permalink to “NumberField”">​</a></h1><p>The NumberField family provides a headless numeric control with pointer scrubbing, mixed values, keyboard stepping, safe arithmetic expressions, units, trailing actions, and binding-aware state.</p>`);
			_push(ssrRenderComponent(States_default, null, null, _parent));
			_push(`<h2 id="anatomy" tabindex="-1">Anatomy <a class="header-anchor" href="#anatomy" aria-label="Permalink to “Anatomy”">​</a></h2><ul><li><code>NumberFieldRoot</code> — renderless state and interaction owner</li><li><code>NumberFieldLeading</code> — leading label or icon</li><li><code>NumberFieldValue</code> — non-editing value</li><li><code>NumberFieldInput</code> — editing input with spinbutton semantics</li><li><code>NumberFieldUnit</code> — unit text</li><li><code>NumberFieldTrailing</code> — trailing action area</li><li><code>NumberFieldMenu</code> — field menu area</li></ul><h2 id="root-slot" tabindex="-1">Root slot <a class="header-anchor" href="#root-slot" aria-label="Permalink to “Root slot”">​</a></h2><p>The default slot receives <code>modelValue</code>, <code>displayValue</code>, <code>draftValue</code>, <code>placeholder</code>, all state booleans, <code>state</code>, <code>actions</code>, and <code>attrs</code>. Bind <code>attrs</code> to the focusable outer element. It contains the canonical spinbutton ARIA contract, keyboard/focus handlers, and <code>data-editing</code>, <code>data-scrubbing</code>, <code>data-mixed</code>, <code>data-disabled</code>, and <code>data-bound</code> attributes.</p><h2 id="expressions-and-keyboard" tabindex="-1">Expressions and keyboard <a class="header-anchor" href="#expressions-and-keyboard" aria-label="Permalink to “Expressions and keyboard”">​</a></h2><p>Committed input accepts absolute arithmetic such as <code>12*8+4</code>, relative operations such as <code>+10</code>, <code>-4</code>, <code>*2</code>, and <code>/3</code>, and percentages such as <code>50%</code> when <code>max</code> is finite. The parser only accepts numbers, parentheses, and <code>+ - * /</code>; it never evaluates JavaScript.</p><p>Arrow keys step by <code>step</code>. Shift multiplies the step by 10 and Alt multiplies it by 0.1. Enter commits and Escape restores the interaction-start value.</p><h2 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to “Example”">​</a></h2><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
					})}"${_scopeId}>import NumberFieldInput</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldInput")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldInput</span>`);
					else return [createVNode("span", null, "NumberFieldInput")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const NumberFieldLeading: DefineComponent&lt;{}, () =&gt; VNode&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>RendererNode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> RendererElement,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    [key:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string]:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> any;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any&gt;</span></span></code></pre></code></span>`);
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
							} }, "const NumberFieldLeading: DefineComponent<{}, () => VNode<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "RendererNode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ","),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " RendererElement,"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    [key:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string]:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " any;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any>")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldLeading</span>`);
					else return [createVNode("span", null, "NumberFieldLeading")];
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
					})}"${_scopeId}>import NumberFieldRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldRoot</span>`);
					else return [createVNode("span", null, "NumberFieldRoot")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const NumberFieldUnit: DefineComponent&lt;{}, () =&gt; VNode&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>RendererNode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> RendererElement,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    [key:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string]:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> any;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any&gt;</span></span></code></pre></code></span>`);
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
							} }, "const NumberFieldUnit: DefineComponent<{}, () => VNode<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "RendererNode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ","),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " RendererElement,"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    [key:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string]:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " any;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any>")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldUnit</span>`);
					else return [createVNode("span", null, "NumberFieldUnit")];
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
					})}"${_scopeId}>import NumberFieldValue</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldValue")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldValue</span>`);
					else return [createVNode("span", null, "NumberFieldValue")];
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
				theme: "twoslash-query",
				shown: true
			}, {
				popper: withCtx(({}, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><div class="twoslash-popup-arrow"${_scopeId}></div><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const width: Ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("div", { class: "twoslash-popup-arrow" }), createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const width: Ref<"),
						createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ","),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>width</span>`);
					else return [createVNode("span", null, "width")];
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
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(value: number): Ref&lt;number, number&gt; (+1 overload)</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Takes an inner value and returns a reactive and mutable ref object, which
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
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">(value: number): Ref<number, number> (+1 overload)")
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
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">120</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import NumberFieldRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldRoot</span>`);
					else return [createVNode("span", null, "NumberFieldRoot")];
				}),
				_: 1
			}, _parent));
			_push(`</span></span>
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
					})}"${_scopeId}>const attrs: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const attrs: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>attrs</span>`);
					else return [createVNode("span", null, "attrs")];
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
					})}"${_scopeId}>const editing: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const editing: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>editing</span>`);
					else return [createVNode("span", null, "editing")];
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
					})}"${_scopeId}>const actions: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const actions: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>actions</span>`);
					else return [createVNode("span", null, "actions")];
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
					})}"${_scopeId}>modelValue: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "modelValue: number")])])];
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
					})}"${_scopeId}>const width: Ref&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "const width: Ref<"),
						createVNode("span", { style: {
							"--shiki-light": "#11782a",
							"--shiki-dark": "#85E89D"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, ","),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " number"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>width</span>`);
					else return [createVNode("span", null, "width")];
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>min: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "min: number")])])];
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
					})}"${_scopeId}>min: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "min: number")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>min</span>`);
					else return [createVNode("span", null, "min")];
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
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">0</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>max: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "max: number")])])];
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
					})}"${_scopeId}>max: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "max: number")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>max</span>`);
					else return [createVNode("span", null, "max")];
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
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">1000</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}">    aria-label</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;Width&quot;</span></span>
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
					})}"${_scopeId}>div: HTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "div: HTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>div</span>`);
					else return [createVNode("span", null, "div")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#6F42C1",
				"--shiki-dark": "#B392F0"
			})}"> v-bind</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const attrs: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const attrs: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>attrs</span>`);
					else return [createVNode("span", null, "attrs")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>onPointerdown?: ((payload: PointerEvent) =&gt; void) | undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "onPointerdown?: ((payload: PointerEvent) => void) | undefined")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>pointerdown</span>`);
					else return [createVNode("span", null, "pointerdown")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&quot;!</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const editing: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const editing: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>editing</span>`);
					else return [createVNode("span", null, "editing")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &amp;&amp; </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const actions: any</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "const actions: any")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>actions</span>`);
					else return [createVNode("span", null, "actions")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">.startScrub(</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>\$event: PointerEvent</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "$event: PointerEvent")])])];
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
			})}">)&quot;</span><span style="${ssrRenderStyle({
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const NumberFieldLeading: DefineComponent&lt;{}, () =&gt; VNode&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>RendererNode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> RendererElement,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    [key:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string]:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> any;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any&gt;</span></span></code></pre></code></span>`);
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
							} }, "const NumberFieldLeading: DefineComponent<{}, () => VNode<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "RendererNode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ","),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " RendererElement,"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    [key:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string]:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " any;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any>")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldLeading</span>`);
					else return [createVNode("span", null, "NumberFieldLeading")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;W&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">NumberFieldLeading</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import NumberFieldInput</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldInput")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldInput</span>`);
					else return [createVNode("span", null, "NumberFieldInput")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> /&gt;</span></span>
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
					})}"${_scopeId}>import NumberFieldValue</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import NumberFieldValue")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldValue</span>`);
					else return [createVNode("span", null, "NumberFieldValue")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> /&gt;</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
						"--shiki-light": "#24292e",
						"--shiki-dark": "#e1e4e8",
						"--shiki-light-bg": "#fff",
						"--shiki-dark-bg": "#24292e"
					})}" tabindex="0"${_scopeId}><code${_scopeId}><span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>const NumberFieldUnit: DefineComponent&lt;{}, () =&gt; VNode&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#11782a",
						"--shiki-dark": "#85E89D"
					})}"${_scopeId}>RendererNode</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> RendererElement,</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> {</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>    [key:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> string]:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> any;</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>}</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any&gt;</span></span></code></pre></code></span>`);
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
							} }, "const NumberFieldUnit: DefineComponent<{}, () => VNode<"),
							createVNode("span", { style: {
								"--shiki-light": "#11782a",
								"--shiki-dark": "#85E89D"
							} }, "RendererNode"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, ","),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " RendererElement,"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " {")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "    [key:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " string]:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " any;")
						]),
						createTextVNode("\n"),
						createVNode("span", { class: "line" }, [createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "}"), createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">, {}, {}, {}, ComponentOptionsMixin, ... 13 more ..., any>")])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>NumberFieldUnit</span>`);
					else return [createVNode("span", null, "NumberFieldUnit")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;px&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">NumberFieldUnit</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    &lt;/</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>div: HTMLAttributes &amp; ReservedProps</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "div: HTMLAttributes & ReservedProps")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>div</span>`);
					else return [createVNode("span", null, "div")];
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
			})}">NumberFieldRoot</span><span style="${ssrRenderStyle({
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
			})}">&gt;</span></span></code></pre></div><h2 id="generated-api-reference" tabindex="-1">Generated API reference <a class="header-anchor" href="#generated-api-reference" aria-label="Permalink to “Generated API reference”">​</a></h2><p>The following tables are extracted from the Vue source and its JSDoc during the documentation build.</p>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/number-field.md
var _sfc_setup = number_field_md_vue_type_script_setup_true_lang_default.setup;
number_field_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/number-field.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var number_field_default = number_field_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, number_field_default as default };
