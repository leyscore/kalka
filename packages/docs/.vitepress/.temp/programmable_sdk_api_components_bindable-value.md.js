import { r as useBindableValue } from "./context.C6SPR7xu.js";
import { t as BindableValueRoot_default } from "./BindableValueRoot.B6IwC5Zx.js";
import { n as NumberFieldRoot_default, r as NumberFieldInput_default, t as NumberFieldValue_default } from "./NumberFieldValue.BMbM5DpG.js";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, defineComponent, mergeProps, openBlock, ref, renderList, renderSlot, resolveComponent, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { ComboboxRoot, Primitive } from "reka-ui";
//#region ../vue/src/primitives/BindableValue/BindableValuePicker.vue?vue&type=script&setup=true&lang.ts
var BindableValuePicker_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BindableValuePicker",
	__ssrInlineRender: true,
	setup(__props) {
		const ctx = useBindableValue();
		function select(value) {
			if (typeof value !== "object" || value === null || !("id" in value)) return;
			if (typeof value.id !== "string") return;
			ctx.actions.bind(value.id);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(ComboboxRoot), mergeProps({
				open: unref(ctx).open.value,
				"model-value": unref(ctx).variable.value,
				"ignore-filter": true,
				"onUpdate:modelValue": select,
				"onUpdate:open": (open) => open ? unref(ctx).actions.openPicker() : unref(ctx).actions.closePicker()
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/BindableValue/BindableValuePicker.vue
var _sfc_setup$3 = BindableValuePicker_vue_vue_type_script_setup_true_lang_default.setup;
BindableValuePicker_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/BindableValue/BindableValuePicker.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var BindableValuePicker_default = BindableValuePicker_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/BindableValue/BindableValueTrigger.vue?vue&type=script&setup=true&lang.ts
var BindableValueTrigger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "BindableValueTrigger",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "button" }
	},
	setup(__props) {
		const ctx = useBindableValue();
		const semanticAttrs = computed(() => ({
			type: !__props.asChild && __props.as === "button" ? "button" : void 0,
			"aria-expanded": ctx.open.value,
			"aria-haspopup": "listbox"
		}));
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value,
				...semanticAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "trigger",
				onClick: unref(ctx).actions.togglePicker
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/BindableValue/BindableValueTrigger.vue
var _sfc_setup$2 = BindableValueTrigger_vue_vue_type_script_setup_true_lang_default.setup;
BindableValueTrigger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/BindableValue/BindableValueTrigger.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var BindableValueTrigger_default = BindableValueTrigger_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/BindableValue/examples/States.vue?vue&type=script&setup=true&lang.ts
var States_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "States",
	__ssrInlineRender: true,
	setup(__props) {
		const variables = [{
			id: "space/md",
			name: "Space/md",
			type: "FLOAT",
			collectionId: "example",
			valuesByMode: { default: 16 },
			description: "",
			hiddenFromPublishing: false
		}, {
			id: "space/lg",
			name: "Space/lg",
			type: "FLOAT",
			collectionId: "example",
			valuesByMode: { default: 24 },
			description: "",
			hiddenFromPublishing: false
		}];
		const revision = ref(0);
		const bindings = ref({
			"detach:width": "space/md",
			"readonly:width": "space/lg",
			"edit-variable:width": "space/md",
			"mixed-a:width": "space/md",
			"mixed-b:width": "space/lg"
		});
		const detachValue = ref(8);
		const readonlyValue = ref(8);
		const editVariableValue = ref(8);
		const pickerValue = ref(12);
		function key(target) {
			return `${target.nodeId}:${target.path}`;
		}
		const provider = {
			revision,
			listVariables: () => variables,
			filterVariables: (term) => variables.filter((variable) => variable.name.toLowerCase().includes(term.toLowerCase())),
			getBindingId: (target) => bindings.value[key(target)],
			getBound: (target) => variables.find((variable) => variable.id === bindings.value[key(target)]),
			getState(targets) {
				const ids = new Set(targets.map((target) => bindings.value[key(target)]));
				if (ids.size > 1) return "mixed";
				return ids.has(void 0) ? "unbound" : "bound";
			},
			resolve: (variableId) => {
				const value = variables.find((variable) => variable.id === variableId)?.valuesByMode.default;
				return typeof value === "number" ? value : void 0;
			},
			bind(target, variableId) {
				bindings.value[key(target)] = variableId;
				revision.value++;
			},
			unbind(target) {
				bindings.value[key(target)] = void 0;
				revision.value++;
			},
			prepareEdit(variableId) {
				const variable = variables.find((item) => item.id === variableId);
				const value = variable?.valuesByMode.default;
				if (!variable || typeof value !== "number") return void 0;
				return {
					key: variableId,
					value,
					set(next) {
						variable.valuesByMode.default = next;
						revision.value++;
					},
					restore() {
						variable.valuesByMode.default = value;
						revision.value++;
					}
				};
			},
			create(target, value, name) {
				const id = `created:${name}`;
				variables.push({
					id,
					name,
					type: "FLOAT",
					collectionId: "example",
					valuesByMode: { default: value },
					description: "",
					hiddenFromPublishing: false
				});
				bindings.value[key(target)] = id;
				revision.value++;
			}
		};
		const detachTarget = [{
			nodeId: "detach",
			path: "width"
		}];
		const readonlyTarget = [{
			nodeId: "readonly",
			path: "width"
		}];
		const editVariableTarget = [{
			nodeId: "edit-variable",
			path: "width"
		}];
		const mixedTargets = [{
			nodeId: "mixed-a",
			path: "width"
		}, {
			nodeId: "mixed-b",
			path: "width"
		}];
		const pickerTarget = [{
			nodeId: "picker",
			path: "width"
		}];
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-[560px] space-y-5 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-5 text-[var(--vp-c-text-1)]" }, _attrs))}><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Detach on edit</p>`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: detachTarget,
				value: detachValue.value
			}, {
				default: withCtx(({ stateAttrs }, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(NumberFieldRoot_default, {
						modelValue: detachValue.value,
						"onUpdate:modelValue": ($event) => detachValue.value = $event,
						"aria-label": "Detach bound value"
					}, {
						default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
							if (_push) {
								_push(`<div${ssrRenderAttrs(mergeProps({
									...attrs,
									...stateAttrs
								}, { class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
								_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }, null, _parent, _scopeId));
								_push(ssrRenderComponent(NumberFieldValue_default, null, null, _parent, _scopeId));
								_push(`</div>`);
							} else return [createVNode("div", mergeProps({
								...attrs,
								...stateAttrs
							}, {
								class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
								onPointerdown: ($event) => !editing && actions.startScrub($event)
							}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])];
						}),
						_: 2
					}, _parent, _scopeId));
					else return [createVNode(NumberFieldRoot_default, {
						modelValue: detachValue.value,
						"onUpdate:modelValue": ($event) => detachValue.value = $event,
						"aria-label": "Detach bound value"
					}, {
						default: withCtx(({ attrs, editing, actions }) => [createVNode("div", mergeProps({
							...attrs,
							...stateAttrs
						}, {
							class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
							onPointerdown: ($event) => !editing && actions.startScrub($event)
						}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])]),
						_: 2
					}, 1032, ["modelValue", "onUpdate:modelValue"])];
				}),
				_: 1
			}, _parent));
			_push(`</div><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Read-only bound</p>`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: readonlyTarget,
				value: readonlyValue.value,
				policy: "readonly-when-bound"
			}, {
				default: withCtx(({ stateAttrs }, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(NumberFieldRoot_default, {
						modelValue: readonlyValue.value,
						"onUpdate:modelValue": ($event) => readonlyValue.value = $event,
						"aria-label": "Readonly bound value"
					}, {
						default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
							if (_push) {
								_push(`<div${ssrRenderAttrs(mergeProps({
									...attrs,
									...stateAttrs
								}, { class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
								_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }, null, _parent, _scopeId));
								_push(ssrRenderComponent(NumberFieldValue_default, null, null, _parent, _scopeId));
								_push(`</div>`);
							} else return [createVNode("div", mergeProps({
								...attrs,
								...stateAttrs
							}, {
								class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
								onPointerdown: ($event) => !editing && actions.startScrub($event)
							}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])];
						}),
						_: 2
					}, _parent, _scopeId));
					else return [createVNode(NumberFieldRoot_default, {
						modelValue: readonlyValue.value,
						"onUpdate:modelValue": ($event) => readonlyValue.value = $event,
						"aria-label": "Readonly bound value"
					}, {
						default: withCtx(({ attrs, editing, actions }) => [createVNode("div", mergeProps({
							...attrs,
							...stateAttrs
						}, {
							class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
							onPointerdown: ($event) => !editing && actions.startScrub($event)
						}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])]),
						_: 2
					}, 1032, ["modelValue", "onUpdate:modelValue"])];
				}),
				_: 1
			}, _parent));
			_push(`</div><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Edit variable</p>`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: editVariableTarget,
				value: editVariableValue.value,
				policy: "edit-variable"
			}, {
				default: withCtx(({ stateAttrs }, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(NumberFieldRoot_default, {
						modelValue: editVariableValue.value,
						"onUpdate:modelValue": ($event) => editVariableValue.value = $event,
						"aria-label": "Edit bound variable"
					}, {
						default: withCtx(({ attrs, editing, actions }, _push, _parent, _scopeId) => {
							if (_push) {
								_push(`<div${ssrRenderAttrs(mergeProps({
									...attrs,
									...stateAttrs
								}, { class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]" }))}${_scopeId}>`);
								_push(ssrRenderComponent(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }, null, _parent, _scopeId));
								_push(ssrRenderComponent(NumberFieldValue_default, null, null, _parent, _scopeId));
								_push(`</div>`);
							} else return [createVNode("div", mergeProps({
								...attrs,
								...stateAttrs
							}, {
								class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
								onPointerdown: ($event) => !editing && actions.startScrub($event)
							}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])];
						}),
						_: 2
					}, _parent, _scopeId));
					else return [createVNode(NumberFieldRoot_default, {
						modelValue: editVariableValue.value,
						"onUpdate:modelValue": ($event) => editVariableValue.value = $event,
						"aria-label": "Edit bound variable"
					}, {
						default: withCtx(({ attrs, editing, actions }) => [createVNode("div", mergeProps({
							...attrs,
							...stateAttrs
						}, {
							class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs data-[bound]:text-[var(--vp-c-brand-1)]",
							onPointerdown: ($event) => !editing && actions.startScrub($event)
						}), [createVNode(NumberFieldInput_default, { class: "min-w-0 flex-1 bg-transparent outline-none" }), createVNode(NumberFieldValue_default)], 16, ["onPointerdown"])]),
						_: 2
					}, 1032, ["modelValue", "onUpdate:modelValue"])];
				}),
				_: 1
			}, _parent));
			_push(`</div><div><p class="mb-1 text-[11px] text-[var(--vp-c-text-2)]">Mixed bindings</p>`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: mixedTargets,
				value: 0
			}, {
				default: withCtx(({ state, stateAttrs }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div${ssrRenderAttrs(mergeProps(stateAttrs, {
						class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-text-2)]",
						"aria-label": "Mixed binding value"
					}))}${_scopeId}>${ssrInterpolate(state)}</div>`);
					else return [createVNode("div", mergeProps(stateAttrs, {
						class: "flex h-[26px] items-center rounded bg-[var(--vp-c-bg-alt)] px-2 text-xs text-[var(--vp-c-text-2)]",
						"aria-label": "Mixed binding value"
					}), toDisplayString(state), 17)];
				}),
				_: 1
			}, _parent));
			_push(`</div></div>`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: pickerTarget,
				value: pickerValue.value
			}, {
				default: withCtx(({ open, stateAttrs }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div${ssrRenderAttrs(mergeProps(stateAttrs, { class: "relative" }))}${_scopeId}>`);
						_push(ssrRenderComponent(BindableValueTrigger_default, {
							class: "rounded bg-[var(--vp-c-bg-alt)] px-2 py-1 text-xs",
							"aria-label": "Choose binding"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Choose variable `);
								else return [createTextVNode(" Choose variable ")];
							}),
							_: 2
						}, _parent, _scopeId));
						if (open) _push(ssrRenderComponent(BindableValuePicker_default, null, {
							default: withCtx(({ variables: options, actions }, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<div class="absolute top-full left-0 z-10 mt-1 w-40 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-1"${_scopeId}><!--[-->`);
									ssrRenderList(options, (option) => {
										_push(`<button class="block w-full rounded px-2 py-1 text-left text-xs hover:bg-[var(--vp-c-bg-alt)]" type="button"${_scopeId}>${ssrInterpolate(option.name)}</button>`);
									});
									_push(`<!--]--></div>`);
								} else return [createVNode("div", { class: "absolute top-full left-0 z-10 mt-1 w-40 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(options, (option) => {
									return openBlock(), createBlock("button", {
										key: option.id,
										class: "block w-full rounded px-2 py-1 text-left text-xs hover:bg-[var(--vp-c-bg-alt)]",
										type: "button",
										onClick: ($event) => actions.bind(option.id)
									}, toDisplayString(option.name), 9, ["onClick"]);
								}), 128))])];
							}),
							_: 2
						}, _parent, _scopeId));
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", mergeProps(stateAttrs, { class: "relative" }), [createVNode(BindableValueTrigger_default, {
						class: "rounded bg-[var(--vp-c-bg-alt)] px-2 py-1 text-xs",
						"aria-label": "Choose binding"
					}, {
						default: withCtx(() => [createTextVNode(" Choose variable ")]),
						_: 1
					}), open ? (openBlock(), createBlock(BindableValuePicker_default, { key: 0 }, {
						default: withCtx(({ variables: options, actions }) => [createVNode("div", { class: "absolute top-full left-0 z-10 mt-1 w-40 rounded border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(options, (option) => {
							return openBlock(), createBlock("button", {
								key: option.id,
								class: "block w-full rounded px-2 py-1 text-left text-xs hover:bg-[var(--vp-c-bg-alt)]",
								type: "button",
								onClick: ($event) => actions.bind(option.id)
							}, toDisplayString(option.name), 9, ["onClick"]);
						}), 128))])]),
						_: 1
					})) : createCommentVNode("", true)], 16)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/BindableValue/examples/States.vue
var _sfc_setup$1 = States_vue_vue_type_script_setup_true_lang_default.setup;
States_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/BindableValue/examples/States.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var States_default = States_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region programmable/sdk/api/components/bindable-value.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"BindableValueRoot\",\"source\":\"packages/vue/src/primitives/BindableValue/BindableValueRoot.vue\",\"props\":[{\"name\":\"provider\",\"type\":\"BindingProvider<V> | undefined\",\"description\":\"Binding implementation. Falls back to the nearest injected provider.\",\"required\":false},{\"name\":\"targets\",\"type\":\"BindingTarget[]\",\"description\":\"Node/property pairs participating in this binding.\",\"required\":true},{\"name\":\"value\",\"type\":\"V\",\"description\":\"Direct field value used when the targets are not consistently bound.\",\"required\":true},{\"name\":\"policy\",\"type\":\"BoundEditPolicy | undefined\",\"description\":\"Behavior when a consistently bound field is edited.\",\"required\":false},{\"name\":\"batchLabel\",\"type\":\"string | undefined\",\"description\":\"Undo label for a field interaction transaction.\",\"required\":false,\"default\":\"\\\"Edit bound value\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"BindableValueSlotProps<V>\",\"description\":\"Complete render contract for binding-aware controls.\"}],\"exposed\":[]},{\"name\":\"BindableValueTrigger\",\"source\":\"packages/vue/src/primitives/BindableValue/BindableValueTrigger.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"button\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ state: BindingState; bindingId: string | undefined; variable: Variable | undefined; resolvedValue: unknown; policy: BoundEditPolicy; open: boolean; searchTerm: string; variables: Variable[]; stateAttrs: BindableValueStateAttrs; actions: BindableValueActions<unknown>; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"BindableValuePicker\",\"source\":\"packages/vue/src/primitives/BindableValue/BindableValuePicker.vue\",\"props\":[],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ state: BindingState; bindingId: string | undefined; variable: Variable | undefined; resolvedValue: unknown; policy: BoundEditPolicy; open: boolean; searchTerm: string; variables: Variable[]; stateAttrs: BindableValueStateAttrs; actions: BindableValueActions<unknown>; }\",\"description\":\"\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/bindable-value.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"BindableValue\",\"description\":\"Provider-driven value binding primitives for custom editor controls.\",\"frontmatter\":{\"title\":\"BindableValue\",\"description\":\"Provider-driven value binding primitives for custom editor controls.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/bindable-value\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/bindable-value\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/bindable-value\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/bindable-value\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"BindableValue — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"BindableValue — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Provider-driven value binding primitives for custom editor controls.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Provider-driven value binding primitives for custom editor controls.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Provider-driven value binding primitives for custom editor controls.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/bindable-value.md\",\"filePath\":\"programmable/sdk/api/components/bindable-value.md\",\"lastUpdated\":1790363714000}");
var bindable_value_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/bindable-value.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="bindablevalue" tabindex="-1">BindableValue <a class="header-anchor" href="#bindablevalue" aria-label="Permalink to “BindableValue”">​</a></h1><p>BindableValue composes variable or token binding with fields without coupling the field to a specific editor store. Applications supply a <code>BindingProvider</code>; NumberField consumes the context automatically when nested beneath <code>BindableValueRoot</code>.</p>`);
			_push(ssrRenderComponent(States_default, null, null, _parent));
			_push(`<h2 id="anatomy" tabindex="-1">Anatomy <a class="header-anchor" href="#anatomy" aria-label="Permalink to “Anatomy”">​</a></h2><ul><li><code>BindableValueRoot</code> — binding state, policy, resolved value, picker state, and actions</li><li><code>BindableValueTrigger</code> — polymorphic bind-picker trigger</li><li><code>BindableValuePicker</code> — renderless Reka Combobox composition</li></ul><h2 id="policies" tabindex="-1">Policies <a class="header-anchor" href="#policies" aria-label="Permalink to “Policies”">​</a></h2><ul><li><code>detach-on-edit</code> unbinds targets on the first value mutation and keeps the complete interaction in one provider undo batch.</li><li><code>readonly-when-bound</code> blocks field editing, scrubbing, and keyboard stepping.</li><li><code>edit-variable</code> uses <code>provider.prepareEdit()</code> to capture a stable edit key, current value, setter, and restoration callback instead of changing the target value.</li></ul><p>Focusing a bound NumberField or opening its picker is non-destructive. The policy starts only when the user types a changed draft, steps the value, or crosses the pointer-scrub threshold. Committing an unchanged field creates no undo entry. Cancellation rolls back an open provider batch. Providers without undo support still receive binding changes, with binding snapshots restored where possible.</p><h2 id="provider-example" tabindex="-1">Provider example <a class="header-anchor" href="#provider-example" aria-label="Permalink to “Provider example”">​</a></h2><div class="language-ts"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
			})}">Variable</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>interface</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>V</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> =</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> unknown</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "interface"),
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
						} }, "V"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " ="),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " unknown"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>BindingProvider</span>`);
					else return [createVNode("span", null, "BindingProvider")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">, </span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
			})}">Variable</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.id: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.id: string")])])];
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
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;spacing/md&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.name: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.name: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>name</span>`);
					else return [createVNode("span", null, "name")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;Spacing / Medium&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.type: VariableType</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.type: VariableType")])])];
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
			})}">&#39;FLOAT&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.collectionId: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.collectionId: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>collectionId</span>`);
					else return [createVNode("span", null, "collectionId")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;spacing&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.valuesByMode: Record</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, VariableValue</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Variable.valuesByMode: Record"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string, VariableValue"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>valuesByMode</span>`);
					else return [createVNode("span", null, "valuesByMode")];
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
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>default</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: number</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "default"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": number")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>default</span>`);
					else return [createVNode("span", null, "default")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">16</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.description: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.description: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>description</span>`);
					else return [createVNode("span", null, "description")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;&#39;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Variable.hiddenFromPublishing: boolean</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.hiddenFromPublishing: boolean")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>hiddenFromPublishing</span>`);
					else return [createVNode("span", null, "hiddenFromPublishing")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">false</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">}</span></span>
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
					})}"${_scopeId}> values</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
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
						} }, " values"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>values</span>`);
					else return [createVNode("span", null, "values")];
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
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> MapConstructor</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> &lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>readonly</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> [</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>]&gt; </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>+</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>3</span><span style="${ssrRenderStyle({
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
							} }, " Map"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " MapConstructor")
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
							} }, " <"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "readonly"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ["),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "]> "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "|"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " null"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " Map"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "> ("),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "+"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "3"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " overloads)")
						])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>Map</span>`);
					else return [createVNode("span", null, "Map")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;([[</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
					})}"${_scopeId}>Variable.id: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.id: string")])])];
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
			})}">, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">16</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">]])</span></span>
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
					})}"${_scopeId}> bindings</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
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
						} }, " bindings"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>bindings</span>`);
					else return [createVNode("span", null, "bindings")];
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
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> MapConstructor</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> &lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>readonly</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> [</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>]&gt; </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>+</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>3</span><span style="${ssrRenderStyle({
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
							} }, " Map"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " MapConstructor")
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
							} }, " <"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "readonly"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ["),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "]> "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "|"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " null"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " Map"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "> ("),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "+"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "3"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " overloads)")
						])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>Map</span>`);
					else return [createVNode("span", null, "Map")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">string</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;()</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">const</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> getBindingId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " getBindingId"),
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
						} }, "target"),
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
						} }, " undefined")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>getBindingId</span>`);
					else return [createVNode("span", null, "getBindingId")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
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
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=&gt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> bindings</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
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
						} }, " bindings"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>bindings</span>`);
					else return [createVNode("span", null, "bindings")];
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
					})}"${_scopeId}>Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>get</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(key: string): string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "Map"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "string, string"),
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
							} }, "get"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "(key: string): string "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "|"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.")])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>get</span>`);
					else return [createVNode("span", null, "get")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">\`\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}:\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}\`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">const</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> resolve</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>variableId</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " resolve"),
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
						} }, "variableId"),
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
						} }, "target"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "?:"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " BindingTarget"),
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
						} }, " number"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>resolve</span>`);
					else return [createVNode("span", null, "resolve")];
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
					})}"${_scopeId}>interface</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>V</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> =</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> unknown</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "interface"),
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
						} }, "V"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " ="),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " unknown"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>BindingProvider</span>`);
					else return [createVNode("span", null, "BindingProvider")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;[</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">&#39;resolve&#39;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">] </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>id</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "id"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>id</span>`);
					else return [createVNode("span", null, "id")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =&gt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> values</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
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
						} }, " values"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>values</span>`);
					else return [createVNode("span", null, "values")];
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
					})}"${_scopeId}>Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>get</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(key: string): number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "Map"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "string, number"),
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
							} }, "get"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "(key: string): number "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "|"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.")])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>get</span>`);
					else return [createVNode("span", null, "get")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>id</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "id"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
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
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
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
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
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
			})}">:</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>interface</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>V</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> =</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> unknown</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "interface"),
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
						} }, "V"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " ="),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " unknown"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>BindingProvider</span>`);
					else return [createVNode("span", null, "BindingProvider")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&lt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}">number</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt; </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> {</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>listVariables</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(): Variable[]</span></code></span>`);
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
						} }, "number"),
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
						} }, "listVariables"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(): Variable[]")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>listVariables</span>`);
					else return [createVNode("span", null, "listVariables")];
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
			})}"> [</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">],</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>filterVariables</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(term: string): Variable[]</span></code></span>`);
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
						} }, "number"),
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
						} }, "filterVariables"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(term: string): Variable[]")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>filterVariables</span>`);
					else return [createVNode("span", null, "filterVariables")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>term</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "term"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>term</span>`);
					else return [createVNode("span", null, "term")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =&gt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
					})}"${_scopeId}>Variable.name: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.name: string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>name</span>`);
					else return [createVNode("span", null, "name")];
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
					})}"${_scopeId}>String.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>toLowerCase</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(): string</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Converts all the alphabetic characters in a string to lowercase.</p></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "String."),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "toLowerCase"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(): string")
					]), createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Converts all the alphabetic characters in a string to lowercase.")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>toLowerCase</span>`);
					else return [createVNode("span", null, "toLowerCase")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">().</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>String.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>includes</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(searchString: string, position</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> number): boolean</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Returns true if searchString appears as a substring of the result of converting this
object to a String, at one or more positions that are
greater than or equal to position; otherwise, returns false.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>searchString</code>  search string</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>position</code>  If position is undefined, 0 is assumed, so as to search all of the String.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "String."),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, "includes"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "(searchString: string, position"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " number): boolean")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Returns true if searchString appears as a substring of the result of converting this\nobject to a String, at one or more positions that are\ngreater than or equal to position; otherwise, returns false.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "searchString"), createTextVNode("  search string")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "position"), createTextVNode("  If position is undefined, 0 is assumed, so as to search all of the String.")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>includes</span>`);
					else return [createVNode("span", null, "includes")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>term</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "term"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>term</span>`);
					else return [createVNode("span", null, "term")];
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
					})}"${_scopeId}>String.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>toLowerCase</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(): string</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Converts all the alphabetic characters in a string to lowercase.</p></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "String."),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "toLowerCase"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(): string")
					]), createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Converts all the alphabetic characters in a string to lowercase.")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>toLowerCase</span>`);
					else return [createVNode("span", null, "toLowerCase")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">()) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">?</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> [</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">] </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">:</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> [],</span></span>
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
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>getBindingId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(target: BindingTarget): string </span><span style="${ssrRenderStyle({
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
						} }, "BindingProvider"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "number"),
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
						} }, "getBindingId"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(target: BindingTarget): string "),
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
					if (_push) _push(`<span${_scopeId}>getBindingId</span>`);
					else return [createVNode("span", null, "getBindingId")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">,</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>getBound</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(target: BindingTarget): Variable </span><span style="${ssrRenderStyle({
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
						} }, "BindingProvider"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "number"),
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
						} }, "getBound"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(target: BindingTarget): Variable "),
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
					if (_push) _push(`<span${_scopeId}>getBound</span>`);
					else return [createVNode("span", null, "getBound")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =&gt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> getBindingId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " getBindingId"),
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
						} }, "target"),
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
						} }, " undefined")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>getBindingId</span>`);
					else return [createVNode("span", null, "getBindingId")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">===</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
					})}"${_scopeId}>Variable.id: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.id: string")])])];
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
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">?</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">:</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>var</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "var"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " undefined")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>undefined</span>`);
					else return [createVNode("span", null, "undefined")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">,</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
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
						} }, "number"),
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
			})}">: </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>targets</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "targets"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget[]")])])];
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
			})}"> =&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    const</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> SetConstructor</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> &lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>+</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>1</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> overload)</span></span></code></pre></code></span>`);
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
							} }, " Set"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " SetConstructor")
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
							} }, " <"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " null"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " Set"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "> ("),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "+"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "1"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " overload)")
						])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>Set</span>`);
					else return [createVNode("span", null, "Set")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>targets</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "targets"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget[]")])])];
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
					})}"${_scopeId}>Array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(callbackfn: (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>value</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>index</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>[]) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, thisArg</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> any): (string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Calls a defined callback function on each element of an array, and returns an array that contains the results.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>callbackfn</code>  A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>thisArg</code>  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "Array"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "BindingTarget"),
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
							} }, "map"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "string"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">(callbackfn: ("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "value"),
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
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "index"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
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
							} }, "array"),
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
							} }, "[]) "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "=>"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " string "),
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
							} }, ", thisArg"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " any): (string "),
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
							} }, ")[]")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Calls a defined callback function on each element of an array, and returns an array that contains the results.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "callbackfn"), createTextVNode("  A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "thisArg"), createTextVNode("  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>map</span>`);
					else return [createVNode("span", null, "map")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> getBindingId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " getBindingId"),
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
						} }, "target"),
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
						} }, " undefined")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>getBindingId</span>`);
					else return [createVNode("span", null, "getBindingId")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">))</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    if</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> (</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.size: number</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>the number of (unique) elements in Set.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ".size: number")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "the number of (unique) elements in Set.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>size</span>`);
					else return [createVNode("span", null, "size")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">===</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"> 0</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> ||</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> (</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.size: number</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>the number of (unique) elements in Set.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ".size: number")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "the number of (unique) elements in Set.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>size</span>`);
					else return [createVNode("span", null, "size")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">===</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"> 1</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> &amp;&amp;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>has</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(value: string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>): boolean</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>a boolean indicating whether an element with the specified value exists in the Set or not.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
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
						} }, "has"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(value: string "),
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
						} }, "): boolean")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "a boolean indicating whether an element with the specified value exists in the Set or not.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>has</span>`);
					else return [createVNode("span", null, "has")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>var</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "var"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " undefined")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>undefined</span>`);
					else return [createVNode("span", null, "undefined")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">))) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">return</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;unbound&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    if</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> (</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.size: number</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>the number of (unique) elements in Set.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ".size: number")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "the number of (unique) elements in Set.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>size</span>`);
					else return [createVNode("span", null, "size")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"> 1</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">return</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;mixed&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    if</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> ids</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
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
						} }, " ids"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>ids</span>`);
					else return [createVNode("span", null, "ids")];
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>has</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(value: string </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>): boolean</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>a boolean indicating whether an element with the specified value exists in the Set or not.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "|"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
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
						} }, "has"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(value: string "),
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
						} }, "): boolean")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "a boolean indicating whether an element with the specified value exists in the Set or not.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>has</span>`);
					else return [createVNode("span", null, "has")];
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
					})}"${_scopeId}>Variable.id: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.id: string")])])];
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
			})}">)) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">return</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;unresolved&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    const</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> resolved</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " resolved"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " ("),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ")[]")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>resolved</span>`);
					else return [createVNode("span", null, "resolved")];
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>targets</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "targets"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget[]")])])];
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
					})}"${_scopeId}>Array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(callbackfn: (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>value</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>index</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>[]) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, thisArg</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> any): (number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Calls a defined callback function on each element of an array, and returns an array that contains the results.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>callbackfn</code>  A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>thisArg</code>  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "Array"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "BindingTarget"),
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
							} }, "map"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">(callbackfn: ("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "value"),
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
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "index"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
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
							} }, "array"),
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
							} }, "[]) "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "=>"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " number "),
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
							} }, ", thisArg"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " any): (number "),
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
							} }, ")[]")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Calls a defined callback function on each element of an array, and returns an array that contains the results.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "callbackfn"), createTextVNode("  A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "thisArg"), createTextVNode("  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>map</span>`);
					else return [createVNode("span", null, "map")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =&gt;</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> resolve</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>variableId</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> BindingTarget</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " resolve"),
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
						} }, "variableId"),
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
						} }, "target"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "?:"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " BindingTarget"),
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
						} }, " number"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined")
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
					})}"${_scopeId}> variable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Variable</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " variable"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Variable")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variable</span>`);
					else return [createVNode("span", null, "variable")];
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
					})}"${_scopeId}>Variable.id: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "Variable.id: string")])])];
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">))</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    if</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> (</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> resolved</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " resolved"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " ("),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ")[]")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>resolved</span>`);
					else return [createVNode("span", null, "resolved")];
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
					})}"${_scopeId}>Array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>some</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(predicate: (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>value</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>index</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>array</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> unknown, thisArg</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> any): boolean</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Determines whether the specified callback function returns true for any element of an array.</p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>predicate</code>  A function that accepts up to three arguments. The some method calls
the predicate function for each element in the array until the predicate returns a value
which is coercible to the Boolean value true, or until the end of the array.</span></span><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@param</span><span class="twoslash-popup-docs-tag-value"${_scopeId}><code${_scopeId}>thisArg</code>  An object to which the this keyword can refer in the predicate function.
If thisArg is omitted, undefined is used as the this value.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [
						createVNode("code", { class: "twoslash-popup-code" }, [
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "Array"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "number "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "|"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, "some"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "(predicate: ("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "value"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ", "),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "index"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
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
							} }, "array"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " ("),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ")[]) "),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "=>"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " unknown, thisArg"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " any): boolean")
						]),
						createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Determines whether the specified callback function returns true for any element of an array.")]),
						createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "predicate"), createTextVNode("  A function that accepts up to three arguments. The some method calls\nthe predicate function for each element in the array until the predicate returns a value\nwhich is coercible to the Boolean value true, or until the end of the array.")])]), createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@param"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, [createVNode("code", null, "thisArg"), createTextVNode("  An object to which the this keyword can refer in the predicate function.\nIf thisArg is omitted, undefined is used as the this value.")])])])
					])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>some</span>`);
					else return [createVNode("span", null, "some")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>value</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "value"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ": number "),
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
					if (_push) _push(`<span${_scopeId}>value</span>`);
					else return [createVNode("span", null, "value")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> =&gt;</span><span style="${ssrRenderStyle({
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
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>value</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: number </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, "value"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ": number "),
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
					if (_push) _push(`<span${_scopeId}>value</span>`);
					else return [createVNode("span", null, "value")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">===</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>var</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> undefined</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					} }, "var"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, " undefined")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>undefined</span>`);
					else return [createVNode("span", null, "undefined")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">)) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">return</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;unresolved&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">    return</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> SetConstructor</span></span>
<span class="line"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>new</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> &lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt;(</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c13617",
						"--shiki-dark": "#FFAB70"
					})}"${_scopeId}>iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>?:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Iterable</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>|</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> null</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>) </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>=&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&gt; (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>+</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>1</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> overload)</span></span></code></pre></code></span>`);
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
							} }, " Set"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, ":"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " SetConstructor")
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
							} }, " <"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, ">("),
							createVNode("span", { style: {
								"--shiki-light": "#c13617",
								"--shiki-dark": "#FFAB70"
							} }, "iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "?:"),
							createVNode("span", { style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							} }, " Iterable"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " null"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
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
							} }, " Set"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "<"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "number"),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, " |"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, " undefined"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, "> ("),
							createVNode("span", { style: {
								"--shiki-light": "#c62739",
								"--shiki-dark": "#F97583"
							} }, "+"),
							createVNode("span", { style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							} }, "1"),
							createVNode("span", { style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							} }, " overload)")
						])
					])])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>Set</span>`);
					else return [createVNode("span", null, "Set")];
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
					})}"${_scopeId}> resolved</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}> (</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}> |</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> undefined</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>)[]</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "const"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " resolved"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, " ("),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "number"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, " |"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, " undefined"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ")[]")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>resolved</span>`);
					else return [createVNode("span", null, "resolved")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">).</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>Set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>T</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.size: number</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>the number of (unique) elements in Set.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Set"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "T"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ".size: number")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "the number of (unique) elements in Set.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>size</span>`);
					else return [createVNode("span", null, "size")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#005CC5",
				"--shiki-dark": "#79B8FF"
			})}"> 1</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> ?</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;mixed&#39;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}"> :</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}"> &#39;bound&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  },</span></span>
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
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}> BindingTarget): number </span><span style="${ssrRenderStyle({
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
						} }, "BindingProvider"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "number"),
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
						} }, " BindingTarget): number "),
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
					if (_push) _push(`<span${_scopeId}>resolve</span>`);
					else return [createVNode("span", null, "resolve")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">,</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>bind</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(target: BindingTarget, variableId: string): </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>void</span></code></span>`);
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
						} }, "number"),
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
						} }, "bind"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(target: BindingTarget, variableId: string): "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "void")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>bind</span>`);
					else return [createVNode("span", null, "bind")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
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
			})}">, </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>variableId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "variableId"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variableId</span>`);
					else return [createVNode("span", null, "variableId")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> {</span></span>
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
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> bindings</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
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
						} }, " bindings"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>bindings</span>`);
					else return [createVNode("span", null, "bindings")];
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
					})}"${_scopeId}>Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>set</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(key: string, value: string): Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span></code><div class="twoslash-popup-docs vp-doc"${_scopeId}><p${_scopeId}>Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.</p></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Map"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string, string"),
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
						} }, "set"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(key: string, value: string): Map"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string, string"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ">")
					]), createVNode("div", { class: "twoslash-popup-docs vp-doc" }, [createVNode("p", null, "Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>set</span>`);
					else return [createVNode("span", null, "set")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">\`\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}:\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}\`</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>variableId</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: string</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "variableId"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": string")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>variableId</span>`);
					else return [createVNode("span", null, "variableId")];
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
			})}">  },</span></span>
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
					if (_push) _push(`<span class="twoslash-popup-container vp-copy-ignore"${_scopeId}><code class="twoslash-popup-code"${_scopeId}><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>BindingProvider</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>number</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>unbind</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(target: BindingTarget): </span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>void</span></code></span>`);
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
						} }, "number"),
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
						} }, "unbind"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(target: BindingTarget): "),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "void")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>unbind</span>`);
					else return [createVNode("span", null, "unbind")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">: (</span><span style="${ssrRenderStyle({
				"--shiki-light": "#c13617",
				"--shiki-dark": "#FFAB70"
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
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
			})}">) </span><span style="${ssrRenderStyle({
				"--shiki-light": "#c62739",
				"--shiki-dark": "#F97583"
			})}">=&gt;</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}"> {</span></span>
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
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>const</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}> bindings</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>:</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}> Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>, </span><span style="${ssrRenderStyle({
						"--shiki-light": "#005CC5",
						"--shiki-dark": "#79B8FF"
					})}"${_scopeId}>string</span><span style="${ssrRenderStyle({
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
						} }, " bindings"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, ":"),
						createVNode("span", { style: {
							"--shiki-light": "#6F42C1",
							"--shiki-dark": "#B392F0"
						} }, " Map"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ", "),
						createVNode("span", { style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						} }, "string"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, ">")
					])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>bindings</span>`);
					else return [createVNode("span", null, "bindings")];
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
					})}"${_scopeId}>Map</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&lt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>string, string</span><span style="${ssrRenderStyle({
						"--shiki-light": "#c62739",
						"--shiki-dark": "#F97583"
					})}"${_scopeId}>&gt;</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>.</span><span style="${ssrRenderStyle({
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					})}"${_scopeId}>delete</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>(key: string): boolean</span></code><div class="twoslash-popup-docs twoslash-popup-docs-tags vp-doc"${_scopeId}><span class="twoslash-popup-docs-tag"${_scopeId}><span class="twoslash-popup-docs-tag-name"${_scopeId}>@returns</span><span class="twoslash-popup-docs-tag-value"${_scopeId}>true if an element in the Map existed and has been removed, or false if the element does not exist.</span></span></div></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "Map"),
						createVNode("span", { style: {
							"--shiki-light": "#c62739",
							"--shiki-dark": "#F97583"
						} }, "<"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "string, string"),
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
						} }, "delete"),
						createVNode("span", { style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						} }, "(key: string): boolean")
					]), createVNode("div", { class: "twoslash-popup-docs twoslash-popup-docs-tags vp-doc" }, [createVNode("span", { class: "twoslash-popup-docs-tag" }, [createVNode("span", { class: "twoslash-popup-docs-tag-name" }, "@returns"), createVNode("span", { class: "twoslash-popup-docs-tag-value" }, "true if an element in the Map existed and has been removed, or false if the element does not exist.")])])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>delete</span>`);
					else return [createVNode("span", null, "delete")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">(</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">\`\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}:\${</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>target</span><span style="${ssrRenderStyle({
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					})}"${_scopeId}>: BindingTarget</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#6F42C1",
						"--shiki-dark": "#B392F0"
					} }, "target"), createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, ": BindingTarget")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>target</span>`);
					else return [createVNode("span", null, "target")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
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
				"--shiki-light": "#032F62",
				"--shiki-dark": "#9ECBFF"
			})}">}\`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">}</span></span></code></pre></div><h2 id="generated-api-reference" tabindex="-1">Generated API reference <a class="header-anchor" href="#generated-api-reference" aria-label="Permalink to “Generated API reference”">​</a></h2><p>The following tables are extracted from the Vue source and JSDoc during the documentation build.</p>`);
			_push(ssrRenderComponent(_component_SdkComponentAPI, { components: unref(data).components }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/bindable-value.md
var _sfc_setup = bindable_value_md_vue_type_script_setup_true_lang_default.setup;
bindable_value_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/bindable-value.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var bindable_value_default = bindable_value_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, bindable_value_default as default };
