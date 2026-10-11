import { t as createContext } from "./create-context.NNVNn8wM.js";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, defineComponent, getCurrentInstance, inject, mergeProps, openBlock, provide, ref, renderList, renderSlot, resolveComponent, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { CollapsibleContent, CollapsibleRoot, Primitive, RovingFocusGroup, RovingFocusItem, ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
//#region ../vue/src/primitives/PropertyList/context.ts
var PROPERTY_LIST_KEY = Symbol("PropertyList");
function providePropertyList(context) {
	provide(PROPERTY_LIST_KEY, context);
}
function usePropertyList() {
	const context = inject(PROPERTY_LIST_KEY);
	if (!context) throw new Error("[open-pencil] PropertyList part must be used inside PropertyListRoot");
	return context;
}
function usePropertyListPart(propKey) {
	const context = usePropertyList();
	if (context.propKey !== propKey) throw new Error(`[open-pencil] PropertyList part propKey must match PropertyListRoot (${propKey})`);
	return context;
}
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListAdd.vue?vue&type=script&setup=true&lang.ts
var PropertyListAdd_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertyListAdd",
	__ssrInlineRender: true,
	props: {
		propKey: {},
		as: { default: "button" },
		asChild: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		item: {}
	},
	emits: ["add"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const context = usePropertyListPart(__props.propKey);
		const disabled = computed(() => __props.disabled || context.disabled.value);
		function add() {
			if (disabled.value) return;
			emit("add", __props.item);
			context.actions.add(__props.item);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps(_ctx.$attrs, {
				as: __props.as,
				"as-child": __props.asChild,
				type: !__props.asChild && __props.as === "button" ? "button" : void 0,
				disabled: disabled.value,
				"data-slot": "add",
				onClick: add
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListAdd.vue
var _sfc_setup$14 = PropertyListAdd_vue_vue_type_script_setup_true_lang_default.setup;
PropertyListAdd_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertyList/PropertyListAdd.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var PropertyListAdd_default = PropertyListAdd_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListItem.vue?vue&type=script&setup=true&lang.ts
var PropertyListItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertyListItem",
	__ssrInlineRender: true,
	props: {
		propKey: {},
		index: {},
		dragging: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		as: { default: "div" },
		asChild: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update",
		"patch",
		"remove",
		"toggleVisibility"
	],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const context = usePropertyListPart(__props.propKey);
		const item = computed(() => context.items.value[__props.index]);
		const hidden = computed(() => item.value?.visible === false);
		const disabled = computed(() => __props.disabled || context.disabled.value);
		const actions = {
			update: (nextItem) => {
				if (disabled.value) return;
				emit("update", __props.index, nextItem);
				context.actions.update(__props.index, nextItem);
			},
			patch: (changes) => {
				if (disabled.value) return;
				emit("patch", __props.index, changes);
				context.actions.patch(__props.index, changes);
			},
			remove: () => {
				if (disabled.value) return;
				emit("remove", __props.index);
				context.actions.remove(__props.index);
			},
			toggleVisibility: () => {
				if (disabled.value) return;
				emit("toggleVisibility", __props.index);
				context.actions.toggleVisibility(__props.index);
			}
		};
		const slotProps = computed(() => ({
			item: item.value,
			index: __props.index,
			hidden: hidden.value,
			dragging: __props.dragging,
			disabled: disabled.value,
			actions
		}));
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps(_ctx.$attrs, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-hidden": hidden.value ? "" : void 0,
				"data-dragging": __props.dragging ? "" : void 0,
				"data-disabled": disabled.value ? "" : void 0,
				"data-slot": "item"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", slotProps.value)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListItem.vue
var _sfc_setup$13 = PropertyListItem_vue_vue_type_script_setup_true_lang_default.setup;
PropertyListItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertyList/PropertyListItem.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var PropertyListItem_default = PropertyListItem_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListRemove.vue?vue&type=script&setup=true&lang.ts
var PropertyListRemove_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertyListRemove",
	__ssrInlineRender: true,
	props: {
		propKey: {},
		as: { default: "button" },
		asChild: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		index: {}
	},
	emits: ["remove"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const context = usePropertyListPart(__props.propKey);
		const disabled = computed(() => __props.disabled || context.disabled.value);
		function remove() {
			if (disabled.value) return;
			emit("remove", __props.index);
			context.actions.remove(__props.index);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps(_ctx.$attrs, {
				as: __props.as,
				"as-child": __props.asChild,
				type: !__props.asChild && __props.as === "button" ? "button" : void 0,
				disabled: disabled.value,
				"data-slot": "remove",
				onClick: remove
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListRemove.vue
var _sfc_setup$12 = PropertyListRemove_vue_vue_type_script_setup_true_lang_default.setup;
PropertyListRemove_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertyList/PropertyListRemove.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var PropertyListRemove_default = PropertyListRemove_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListRoot.vue?vue&type=script&setup=true&lang.ts
var PropertyListRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PropertyListRoot",
	__ssrInlineRender: true,
	props: {
		propKey: {},
		items: {},
		mixed: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		getKey: { type: Function },
		label: {}
	},
	emits: [
		"add",
		"remove",
		"update",
		"patch",
		"toggleVisibility",
		"reorder"
	],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const items = computed(() => __props.items);
		const isMixed = computed(() => __props.mixed);
		const disabled = computed(() => __props.disabled);
		function keyOf(item, index) {
			return __props.getKey?.(item, index) ?? index;
		}
		const actions = {
			add: (item) => {
				if (!disabled.value) emit("add", item);
			},
			remove: (index) => {
				if (!disabled.value) emit("remove", index);
			},
			update: (index, item) => {
				if (!disabled.value) emit("update", index, item);
			},
			patch: (index, changes) => {
				if (!disabled.value) emit("patch", index, changes);
			},
			toggleVisibility: (index) => {
				if (!disabled.value) emit("toggleVisibility", index);
			},
			reorder: (fromIndex, toIndex) => {
				if (!disabled.value) emit("reorder", fromIndex, toIndex);
			}
		};
		providePropertyList({
			propKey: __props.propKey,
			items,
			isMixed,
			disabled,
			keyOf,
			actions
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSlot(_ctx.$slots, "default", {
				items: items.value,
				isMixed: isMixed.value,
				disabled: disabled.value,
				keyOf,
				actions
			}, null, _push, _parent);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListRoot.vue
var _sfc_setup$11 = PropertyListRoot_vue_vue_type_script_setup_true_lang_default.setup;
PropertyListRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertyList/PropertyListRoot.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var PropertyListRoot_default = PropertyListRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListVisibility.vue?vue&type=script&setup=true&lang.ts
var PropertyListVisibility_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertyListVisibility",
	__ssrInlineRender: true,
	props: {
		propKey: {},
		as: { default: "button" },
		asChild: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		index: {}
	},
	emits: ["toggle"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const context = usePropertyListPart(__props.propKey);
		const disabled = computed(() => __props.disabled || context.disabled.value);
		const visible = computed(() => context.items.value[__props.index]?.visible !== false);
		function toggle() {
			if (disabled.value) return;
			emit("toggle", __props.index);
			context.actions.toggleVisibility(__props.index);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps(_ctx.$attrs, {
				as: __props.as,
				"as-child": __props.asChild,
				type: !__props.asChild && __props.as === "button" ? "button" : void 0,
				disabled: disabled.value,
				"aria-pressed": visible.value,
				"data-hidden": visible.value ? void 0 : "",
				"data-slot": "visibility",
				onClick: toggle
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", { visible: visible.value }, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", { visible: visible.value })];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertyList/PropertyListVisibility.vue
var _sfc_setup$10 = PropertyListVisibility_vue_vue_type_script_setup_true_lang_default.setup;
PropertyListVisibility_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertyList/PropertyListVisibility.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var PropertyListVisibility_default = PropertyListVisibility_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/context.ts
var [usePropertySection, providePropertySection] = createContext("PropertySection");
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionActions.vue?vue&type=script&setup=true&lang.ts
var PropertySectionActions_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionActions",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "div" }
	},
	setup(__props) {
		const ctx = usePropertySection();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "actions"
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
//#region ../vue/src/primitives/PropertySection/PropertySectionActions.vue
var _sfc_setup$9 = PropertySectionActions_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionActions_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionActions.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var PropertySectionActions_default = PropertySectionActions_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionContent.vue?vue&type=script&setup=true&lang.ts
var PropertySectionContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionContent",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "div" }
	},
	setup(__props) {
		const ctx = usePropertySection();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(CollapsibleContent), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "content"
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
//#region ../vue/src/primitives/PropertySection/PropertySectionContent.vue
var _sfc_setup$8 = PropertySectionContent_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionContent.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var PropertySectionContent_default = PropertySectionContent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionEmptyAction.vue?vue&type=script&setup=true&lang.ts
var PropertySectionEmptyAction_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionEmptyAction",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "button" }
	},
	emits: ["activate"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const ctx = usePropertySection();
		function activate() {
			if (ctx.disabled.value) return;
			ctx.actions.open();
			emit("activate");
		}
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(ctx).empty.value) _push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				type: !__props.asChild && __props.as === "button" ? "button" : void 0,
				"data-slot": "empty-action",
				onClick: activate
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", unref(ctx).slotProps.value)];
				}),
				_: 3
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionEmptyAction.vue
var _sfc_setup$7 = PropertySectionEmptyAction_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionEmptyAction_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionEmptyAction.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var PropertySectionEmptyAction_default = PropertySectionEmptyAction_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionHeader.vue?vue&type=script&setup=true&lang.ts
var PropertySectionHeader_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionHeader",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "div" }
	},
	setup(__props) {
		const ctx = usePropertySection();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "header"
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
//#region ../vue/src/primitives/PropertySection/PropertySectionHeader.vue
var _sfc_setup$6 = PropertySectionHeader_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionHeader_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionHeader.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var PropertySectionHeader_default = PropertySectionHeader_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionRoot.vue?vue&type=script&setup=true&lang.ts
var PropertySectionRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionRoot",
	__ssrInlineRender: true,
	props: {
		open: { type: Boolean },
		defaultOpen: {
			type: Boolean,
			default: true
		},
		empty: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		unmountOnHide: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:open"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const vnodeProps = getCurrentInstance()?.vnode.props;
		const controlled = vnodeProps ? Object.hasOwn(vnodeProps, "open") : false;
		const uncontrolledOpen = ref(__props.defaultOpen);
		const open = computed({
			get: () => controlled ? __props.open : uncontrolledOpen.value,
			set: (value) => {
				if (!controlled) uncontrolledOpen.value = value;
				emit("update:open", value);
			}
		});
		const empty = computed(() => __props.empty);
		const disabled = computed(() => __props.disabled);
		const stateAttrs = computed(() => ({
			"data-state": open.value ? "open" : "closed",
			"data-empty": empty.value ? "" : void 0,
			"data-disabled": disabled.value ? "" : void 0
		}));
		const actions = {
			open: () => {
				if (!disabled.value) open.value = true;
			},
			close: () => {
				if (!disabled.value) open.value = false;
			},
			toggle: () => {
				if (!disabled.value) open.value = !open.value;
			}
		};
		const slotProps = computed(() => ({
			open: open.value,
			empty: empty.value,
			stateAttrs: stateAttrs.value,
			actions
		}));
		providePropertySection({
			open,
			empty,
			disabled,
			stateAttrs,
			slotProps,
			actions
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(CollapsibleRoot), mergeProps({
				..._ctx.$attrs,
				...stateAttrs.value
			}, {
				open: open.value,
				disabled: disabled.value,
				"unmount-on-hide": __props.unmountOnHide,
				"onUpdate:open": ($event) => open.value = $event
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", slotProps.value)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionRoot.vue
var _sfc_setup$5 = PropertySectionRoot_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionRoot.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var PropertySectionRoot_default = PropertySectionRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/PropertySectionTitle.vue?vue&type=script&setup=true&lang.ts
var PropertySectionTitle_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PropertySectionTitle",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "div" }
	},
	setup(__props) {
		const ctx = usePropertySection();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "title"
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
//#region ../vue/src/primitives/PropertySection/PropertySectionTitle.vue
var _sfc_setup$4 = PropertySectionTitle_vue_vue_type_script_setup_true_lang_default.setup;
PropertySectionTitle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/PropertySectionTitle.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var PropertySectionTitle_default = PropertySectionTitle_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/SegmentedControl/context.ts
var [useSegmentedControl, provideSegmentedControl] = createContext("SegmentedControl");
//#endregion
//#region ../vue/src/primitives/SegmentedControl/SegmentedControlItem.vue?vue&type=script&setup=true&lang.ts
var SegmentedControlItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "SegmentedControlItem",
	__ssrInlineRender: true,
	props: {
		value: {},
		disabled: {
			type: Boolean,
			default: false
		},
		as: { default: "button" },
		asChild: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const ctx = useSegmentedControl();
		const disabled = computed(() => __props.disabled || ctx.disabled.value);
		const selected = computed(() => ctx.selected(__props.value));
		const slotProps = computed(() => ({
			value: __props.value,
			selected: selected.value,
			disabled: disabled.value,
			mode: ctx.mode.value
		}));
		function activate() {
			if (!disabled.value) ctx.activate(__props.value);
		}
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(ctx).mode.value !== "action") _push(ssrRenderComponent(unref(ToggleGroupItem), mergeProps(_ctx.$attrs, {
				value: __props.value,
				disabled: disabled.value,
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "item"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", slotProps.value)];
				}),
				_: 3
			}, _parent));
			else _push(ssrRenderComponent(unref(RovingFocusItem), mergeProps({
				focusable: !disabled.value,
				"as-child": ""
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(Primitive), mergeProps(_ctx.$attrs, {
						as: __props.as,
						"as-child": __props.asChild,
						type: !__props.asChild && __props.as === "button" ? "button" : void 0,
						disabled: disabled.value,
						"data-slot": "item",
						"data-state": "off",
						onClick: activate
					}), {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent, _scopeId);
							else return [renderSlot(_ctx.$slots, "default", slotProps.value)];
						}),
						_: 3
					}, _parent, _scopeId));
					else return [createVNode(unref(Primitive), mergeProps(_ctx.$attrs, {
						as: __props.as,
						"as-child": __props.asChild,
						type: !__props.asChild && __props.as === "button" ? "button" : void 0,
						disabled: disabled.value,
						"data-slot": "item",
						"data-state": "off",
						onClick: activate
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default", slotProps.value)]),
						_: 3
					}, 16, [
						"as",
						"as-child",
						"type",
						"disabled"
					])];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/SegmentedControl/SegmentedControlItem.vue
var _sfc_setup$3 = SegmentedControlItem_vue_vue_type_script_setup_true_lang_default.setup;
SegmentedControlItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/SegmentedControl/SegmentedControlItem.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var SegmentedControlItem_default = SegmentedControlItem_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/SegmentedControl/SegmentedControlRoot.vue?vue&type=script&setup=true&lang.ts
var SegmentedControlRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "SegmentedControlRoot",
	__ssrInlineRender: true,
	props: {
		mode: { default: "single" },
		modelValue: {},
		orientation: { default: "horizontal" },
		disabled: {
			type: Boolean,
			default: false
		},
		required: {
			type: Boolean,
			default: false
		},
		rovingFocus: {
			type: Boolean,
			default: true
		},
		loop: {
			type: Boolean,
			default: true
		}
	},
	emits: ["update:modelValue", "action"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const mode = computed(() => __props.mode);
		const modelValue = computed(() => __props.modelValue);
		const disabled = computed(() => __props.disabled);
		function selected(value) {
			if (Array.isArray(modelValue.value)) return modelValue.value.includes(value);
			return modelValue.value === value;
		}
		function activate(value) {
			if (!disabled.value) emit("action", value);
		}
		function updateSingle(value) {
			if (__props.required && typeof value !== "string") return;
			emit("update:modelValue", typeof value === "string" ? value : void 0);
		}
		function updateMultiple(value) {
			if (!Array.isArray(value)) return;
			emit("update:modelValue", value.filter((item) => typeof item === "string"));
		}
		provideSegmentedControl({
			mode,
			modelValue,
			disabled,
			selected,
			activate
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (mode.value === "single") _push(ssrRenderComponent(unref(ToggleGroupRoot), mergeProps(_ctx.$attrs, {
				type: "single",
				"model-value": typeof modelValue.value === "string" ? modelValue.value : void 0,
				orientation: __props.orientation,
				disabled: disabled.value,
				required: __props.required,
				"roving-focus": __props.rovingFocus,
				loop: __props.loop,
				"data-slot": "root",
				"data-mode": "single",
				"onUpdate:modelValue": updateSingle
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					})];
				}),
				_: 3
			}, _parent));
			else if (mode.value === "multiple") _push(ssrRenderComponent(unref(ToggleGroupRoot), mergeProps(_ctx.$attrs, {
				type: "multiple",
				"model-value": Array.isArray(modelValue.value) ? modelValue.value : [],
				orientation: __props.orientation,
				disabled: disabled.value,
				"roving-focus": __props.rovingFocus,
				loop: __props.loop,
				"data-slot": "root",
				"data-mode": "multiple",
				"onUpdate:modelValue": updateMultiple
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					})];
				}),
				_: 3
			}, _parent));
			else _push(ssrRenderComponent(unref(RovingFocusGroup), mergeProps(_ctx.$attrs, {
				orientation: __props.orientation,
				loop: __props.loop,
				role: "group",
				"data-slot": "root",
				"data-mode": "action"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {
						mode: mode.value,
						modelValue: modelValue.value
					})];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/SegmentedControl/SegmentedControlRoot.vue
var _sfc_setup$2 = SegmentedControlRoot_vue_vue_type_script_setup_true_lang_default.setup;
SegmentedControlRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/SegmentedControl/SegmentedControlRoot.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var SegmentedControlRoot_default = SegmentedControlRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/PropertySection/examples/States.vue?vue&type=script&setup=true&lang.ts
var States_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "States",
	__ssrInlineRender: true,
	setup(__props) {
		const alignment = ref("left");
		const empty = ref(true);
		const lastAction = ref("None");
		const defaultFill = {
			type: "SOLID",
			color: {
				r: .4,
				g: .5,
				b: 1,
				a: 1
			},
			opacity: 1,
			visible: true,
			blendMode: "NORMAL"
		};
		const fills = ref([structuredClone(defaultFill), {
			...structuredClone(defaultFill),
			visible: false
		}]);
		function addFill(fill) {
			fills.value.push(structuredClone(fill));
		}
		function removeFill(index) {
			fills.value.splice(index, 1);
		}
		function toggleFill(index) {
			const fill = fills.value[index];
			fill.visible = !fill.visible;
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "grid w-full max-w-[620px] gap-4 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-5 text-xs text-[var(--vp-c-text-1)] sm:grid-cols-2" }, _attrs))}><div class="space-y-3">`);
			_push(ssrRenderComponent(PropertySectionRoot_default, {
				class: "rounded border border-[var(--vp-c-divider)]",
				"aria-label": "Layer section"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(PropertySectionHeader_default, { class: "flex items-center justify-between px-3 py-2" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(ssrRenderComponent(PropertySectionTitle_default, { class: "font-semibold" }, {
										default: withCtx((_, _push, _parent, _scopeId) => {
											if (_push) _push(`Layer`);
											else return [createTextVNode("Layer")];
										}),
										_: 1
									}, _parent, _scopeId));
									_push(ssrRenderComponent(PropertySectionActions_default, { class: "text-[var(--vp-c-text-2)]" }, {
										default: withCtx((_, _push, _parent, _scopeId) => {
											if (_push) _push(`⌘ L`);
											else return [createTextVNode("⌘ L")];
										}),
										_: 1
									}, _parent, _scopeId));
								} else return [createVNode(PropertySectionTitle_default, { class: "font-semibold" }, {
									default: withCtx(() => [createTextVNode("Layer")]),
									_: 1
								}), createVNode(PropertySectionActions_default, { class: "text-[var(--vp-c-text-2)]" }, {
									default: withCtx(() => [createTextVNode("⌘ L")]),
									_: 1
								})];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(PropertySectionContent_default, { class: "border-t border-[var(--vp-c-divider)] px-3 py-2" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Section content `);
								else return [createTextVNode(" Section content ")];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode(PropertySectionHeader_default, { class: "flex items-center justify-between px-3 py-2" }, {
						default: withCtx(() => [createVNode(PropertySectionTitle_default, { class: "font-semibold" }, {
							default: withCtx(() => [createTextVNode("Layer")]),
							_: 1
						}), createVNode(PropertySectionActions_default, { class: "text-[var(--vp-c-text-2)]" }, {
							default: withCtx(() => [createTextVNode("⌘ L")]),
							_: 1
						})]),
						_: 1
					}), createVNode(PropertySectionContent_default, { class: "border-t border-[var(--vp-c-divider)] px-3 py-2" }, {
						default: withCtx(() => [createTextVNode(" Section content ")]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(PropertySectionRoot_default, {
				empty: empty.value,
				class: "rounded border border-[var(--vp-c-divider)] px-3 py-2"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(PropertySectionHeader_default, null, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(ssrRenderComponent(PropertySectionTitle_default, { class: "font-semibold" }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`Effects`);
										else return [createTextVNode("Effects")];
									}),
									_: 1
								}, _parent, _scopeId));
								else return [createVNode(PropertySectionTitle_default, { class: "font-semibold" }, {
									default: withCtx(() => [createTextVNode("Effects")]),
									_: 1
								})];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(PropertySectionContent_default, null, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(ssrRenderComponent(PropertySectionEmptyAction_default, {
										class: "mt-2 rounded bg-[var(--vp-c-bg-alt)] px-2 py-1",
										onActivate: ($event) => empty.value = false
									}, {
										default: withCtx((_, _push, _parent, _scopeId) => {
											if (_push) _push(` Add first effect `);
											else return [createTextVNode(" Add first effect ")];
										}),
										_: 1
									}, _parent, _scopeId));
									if (!empty.value) _push(`<p class="mt-2 text-[var(--vp-c-text-2)]"${_scopeId}>Drop shadow</p>`);
									else _push(`<!---->`);
								} else return [createVNode(PropertySectionEmptyAction_default, {
									class: "mt-2 rounded bg-[var(--vp-c-bg-alt)] px-2 py-1",
									onActivate: ($event) => empty.value = false
								}, {
									default: withCtx(() => [createTextVNode(" Add first effect ")]),
									_: 1
								}, 8, ["onActivate"]), !empty.value ? (openBlock(), createBlock("p", {
									key: 0,
									class: "mt-2 text-[var(--vp-c-text-2)]"
								}, "Drop shadow")) : createCommentVNode("", true)];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode(PropertySectionHeader_default, null, {
						default: withCtx(() => [createVNode(PropertySectionTitle_default, { class: "font-semibold" }, {
							default: withCtx(() => [createTextVNode("Effects")]),
							_: 1
						})]),
						_: 1
					}), createVNode(PropertySectionContent_default, null, {
						default: withCtx(() => [createVNode(PropertySectionEmptyAction_default, {
							class: "mt-2 rounded bg-[var(--vp-c-bg-alt)] px-2 py-1",
							onActivate: ($event) => empty.value = false
						}, {
							default: withCtx(() => [createTextVNode(" Add first effect ")]),
							_: 1
						}, 8, ["onActivate"]), !empty.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "mt-2 text-[var(--vp-c-text-2)]"
						}, "Drop shadow")) : createCommentVNode("", true)]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="space-y-3">`);
			_push(ssrRenderComponent(SegmentedControlRoot_default, {
				modelValue: alignment.value,
				"onUpdate:modelValue": ($event) => alignment.value = $event,
				"aria-label": "Alignment",
				class: "grid grid-cols-3 rounded bg-[var(--vp-c-bg-alt)] p-0.5"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<!--[-->`);
						ssrRenderList([
							"left",
							"center",
							"right"
						], (value) => {
							_push(ssrRenderComponent(SegmentedControlItem_default, {
								key: value,
								value,
								class: "rounded px-2 py-1 capitalize data-[state=on]:bg-[var(--vp-c-bg-soft)]"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`${ssrInterpolate(value)}`);
									else return [createTextVNode(toDisplayString(value), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
						});
						_push(`<!--]-->`);
					} else return [(openBlock(), createBlock(Fragment, null, renderList([
						"left",
						"center",
						"right"
					], (value) => {
						return createVNode(SegmentedControlItem_default, {
							key: value,
							value,
							class: "rounded px-2 py-1 capitalize data-[state=on]:bg-[var(--vp-c-bg-soft)]"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(value), 1)]),
							_: 2
						}, 1032, ["value"]);
					}), 64))];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(SegmentedControlRoot_default, {
				mode: "action",
				"aria-label": "Transform actions",
				class: "grid grid-cols-3 rounded bg-[var(--vp-c-bg-alt)] p-0.5",
				onAction: ($event) => lastAction.value = $event
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<!--[-->`);
						ssrRenderList([
							"flip-x",
							"flip-y",
							"rotate-90"
						], (value) => {
							_push(ssrRenderComponent(SegmentedControlItem_default, {
								key: value,
								value,
								class: "rounded px-2 py-1"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`${ssrInterpolate(value)}`);
									else return [createTextVNode(toDisplayString(value), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
						});
						_push(`<!--]-->`);
					} else return [(openBlock(), createBlock(Fragment, null, renderList([
						"flip-x",
						"flip-y",
						"rotate-90"
					], (value) => {
						return createVNode(SegmentedControlItem_default, {
							key: value,
							value,
							class: "rounded px-2 py-1"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(value), 1)]),
							_: 2
						}, 1032, ["value"]);
					}), 64))];
				}),
				_: 1
			}, _parent));
			_push(`<p aria-live="polite" class="text-[var(--vp-c-text-2)]">Action: ${ssrInterpolate(lastAction.value)}</p></div>`);
			_push(ssrRenderComponent(PropertyListRoot_default, {
				"prop-key": "fills",
				items: fills.value,
				onAdd: addFill,
				onRemove: removeFill,
				onToggleVisibility: toggleFill
			}, {
				default: withCtx(({ items }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="space-y-1 rounded border border-[var(--vp-c-divider)] p-2 sm:col-span-2"${_scopeId}><!--[-->`);
						ssrRenderList(items, (_, index) => {
							_push(ssrRenderComponent(PropertyListItem_default, {
								key: index,
								"prop-key": "fills",
								index,
								class: "flex items-center gap-2 rounded bg-[var(--vp-c-bg-alt)] px-2 py-1 data-[hidden]:opacity-50"
							}, {
								default: withCtx(({ hidden }, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`<span class="min-w-0 flex-1 truncate"${_scopeId}>Fill ${ssrInterpolate(index + 1)}</span>`);
										_push(ssrRenderComponent(PropertyListVisibility_default, {
											"prop-key": "fills",
											index
										}, {
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`${ssrInterpolate(hidden ? "Show" : "Hide")}`);
												else return [createTextVNode(toDisplayString(hidden ? "Show" : "Hide"), 1)];
											}),
											_: 2
										}, _parent, _scopeId));
										_push(ssrRenderComponent(PropertyListRemove_default, {
											"prop-key": "fills",
											index
										}, {
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`Remove`);
												else return [createTextVNode("Remove")];
											}),
											_: 2
										}, _parent, _scopeId));
									} else return [
										createVNode("span", { class: "min-w-0 flex-1 truncate" }, "Fill " + toDisplayString(index + 1), 1),
										createVNode(PropertyListVisibility_default, {
											"prop-key": "fills",
											index
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(hidden ? "Show" : "Hide"), 1)]),
											_: 2
										}, 1032, ["index"]),
										createVNode(PropertyListRemove_default, {
											"prop-key": "fills",
											index
										}, {
											default: withCtx(() => [createTextVNode("Remove")]),
											_: 1
										}, 8, ["index"])
									];
								}),
								_: 2
							}, _parent, _scopeId));
						});
						_push(`<!--]-->`);
						_push(ssrRenderComponent(PropertyListAdd_default, {
							"prop-key": "fills",
							item: defaultFill,
							class: "rounded bg-[var(--vp-c-bg-alt)] px-2 py-1"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Add fill `);
								else return [createTextVNode(" Add fill ")];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(`</div>`);
					} else return [createVNode("div", { class: "space-y-1 rounded border border-[var(--vp-c-divider)] p-2 sm:col-span-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(items, (_, index) => {
						return openBlock(), createBlock(PropertyListItem_default, {
							key: index,
							"prop-key": "fills",
							index,
							class: "flex items-center gap-2 rounded bg-[var(--vp-c-bg-alt)] px-2 py-1 data-[hidden]:opacity-50"
						}, {
							default: withCtx(({ hidden }) => [
								createVNode("span", { class: "min-w-0 flex-1 truncate" }, "Fill " + toDisplayString(index + 1), 1),
								createVNode(PropertyListVisibility_default, {
									"prop-key": "fills",
									index
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(hidden ? "Show" : "Hide"), 1)]),
									_: 2
								}, 1032, ["index"]),
								createVNode(PropertyListRemove_default, {
									"prop-key": "fills",
									index
								}, {
									default: withCtx(() => [createTextVNode("Remove")]),
									_: 1
								}, 8, ["index"])
							]),
							_: 2
						}, 1032, ["index"]);
					}), 128)), createVNode(PropertyListAdd_default, {
						"prop-key": "fills",
						item: defaultFill,
						class: "rounded bg-[var(--vp-c-bg-alt)] px-2 py-1"
					}, {
						default: withCtx(() => [createTextVNode(" Add fill ")]),
						_: 1
					})])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/PropertySection/examples/States.vue
var _sfc_setup$1 = States_vue_vue_type_script_setup_true_lang_default.setup;
States_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/PropertySection/examples/States.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var States_default = States_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region programmable/sdk/api/components/property-section.data.ts
var data = JSON.parse("{\"components\":[{\"name\":\"PropertySectionRoot\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionRoot.vue\",\"props\":[{\"name\":\"open\",\"type\":\"boolean | undefined\",\"description\":\"Controlled expanded state.\",\"required\":false},{\"name\":\"defaultOpen\",\"type\":\"boolean | undefined\",\"description\":\"Initial expanded state when uncontrolled.\",\"required\":false,\"default\":\"true\"},{\"name\":\"empty\",\"type\":\"boolean | undefined\",\"description\":\"Marks the section as having no current items.\",\"required\":false},{\"name\":\"disabled\",\"type\":\"boolean | undefined\",\"description\":\"Prevents the section from being toggled.\",\"required\":false},{\"name\":\"unmountOnHide\",\"type\":\"boolean | undefined\",\"description\":\"Keep collapsed content mounted in the DOM.\",\"required\":false,\"default\":\"false\"}],\"events\":[{\"name\":\"update:open\",\"payload\":\"[open: boolean]\",\"description\":\"\"}],\"slots\":[{\"name\":\"default\",\"props\":\"PropertySectionSlotProps\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"PropertySectionHeader\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionHeader.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"div\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ open: boolean; empty: boolean; stateAttrs: PropertySectionStateAttrs; actions: PropertySectionActionAPI; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"PropertySectionTitle\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionTitle.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"div\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ open: boolean; empty: boolean; stateAttrs: PropertySectionStateAttrs; actions: PropertySectionActionAPI; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"PropertySectionActions\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionActions.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"div\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ open: boolean; empty: boolean; stateAttrs: PropertySectionStateAttrs; actions: PropertySectionActionAPI; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"PropertySectionContent\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionContent.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"div\\\"\"}],\"events\":[],\"slots\":[{\"name\":\"default\",\"props\":\"{ open: boolean; empty: boolean; stateAttrs: PropertySectionStateAttrs; actions: PropertySectionActionAPI; }\",\"description\":\"\"}],\"exposed\":[]},{\"name\":\"PropertySectionEmptyAction\",\"source\":\"packages/vue/src/primitives/PropertySection/PropertySectionEmptyAction.vue\",\"props\":[{\"name\":\"asChild\",\"type\":\"boolean | undefined\",\"description\":\"Change the default rendered element for the one passed as a child, merging their props and behavior.\\n\\nRead our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.\",\"required\":false,\"default\":\"false\"},{\"name\":\"as\",\"type\":\"AsTag | Component | undefined\",\"description\":\"The element or component this component should render as. Can be overwritten by `asChild`.\",\"required\":false,\"default\":\"\\\"button\\\"\"}],\"events\":[{\"name\":\"activate\",\"payload\":\"[]\",\"description\":\"\"}],\"slots\":[{\"name\":\"default\",\"props\":\"{ open: boolean; empty: boolean; stateAttrs: PropertySectionStateAttrs; actions: PropertySectionActionAPI; }\",\"description\":\"\"}],\"exposed\":[]}]}");
//#endregion
//#region programmable/sdk/api/components/property-section.md?vue&type=script&setup=true&lang.ts
var __pageData = JSON.parse("{\"title\":\"PropertySection\",\"description\":\"Headless collapsible anatomy for property-panel sections.\",\"frontmatter\":{\"title\":\"PropertySection\",\"description\":\"Headless collapsible anatomy for property-panel sections.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/property-section\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/sdk/api/components/property-section\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/property-section\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/sdk/api/components/property-section\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"PropertySection — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"PropertySection — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Headless collapsible anatomy for property-panel sections.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Headless collapsible anatomy for property-panel sections.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Headless collapsible anatomy for property-panel sections.\"}]]},\"headers\":[],\"relativePath\":\"programmable/sdk/api/components/property-section.md\",\"filePath\":\"programmable/sdk/api/components/property-section.md\",\"lastUpdated\":1790363714000}");
var property_section_md_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	name: "programmable/sdk/api/components/property-section.md",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_v_menu = resolveComponent("v-menu");
			const _component_SdkComponentAPI = resolveComponent("SdkComponentAPI");
			_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="propertysection" tabindex="-1">PropertySection <a class="header-anchor" href="#propertysection" aria-label="Permalink to “PropertySection”">​</a></h1><p>PropertySection supplies collapsible section anatomy and canonical open, empty, and disabled state attributes without imposing presentation.</p>`);
			_push(ssrRenderComponent(States_default, null, null, _parent));
			_push(`<h2 id="anatomy" tabindex="-1">Anatomy <a class="header-anchor" href="#anatomy" aria-label="Permalink to “Anatomy”">​</a></h2><ul><li><code>PropertySectionRoot</code> — controlled or uncontrolled Collapsible state</li><li><code>PropertySectionHeader</code> — structural header container</li><li><code>PropertySectionTitle</code> — accessible Collapsible trigger</li><li><code>PropertySectionActions</code> — sibling action area, avoiding nested buttons</li><li><code>PropertySectionContent</code> — collapsible content region</li><li><code>PropertySectionEmptyAction</code> — empty-only action that opens before emitting <code>activate</code></li></ul><div class="language-vue"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark twoslash lsp" style="${ssrRenderStyle({
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
					})}"${_scopeId}>import PropertySectionContent</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionContent")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionContent</span>`);
					else return [createVNode("span", null, "PropertySectionContent")];
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
					})}"${_scopeId}>import PropertySectionHeader</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionHeader")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionHeader</span>`);
					else return [createVNode("span", null, "PropertySectionHeader")];
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
					})}"${_scopeId}>import PropertySectionRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionRoot</span>`);
					else return [createVNode("span", null, "PropertySectionRoot")];
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
					})}"${_scopeId}>import PropertySectionTitle</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionTitle")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionTitle</span>`);
					else return [createVNode("span", null, "PropertySectionTitle")];
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
					})}"${_scopeId}>import PropertySectionRoot</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionRoot")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionRoot</span>`);
					else return [createVNode("span", null, "PropertySectionRoot")];
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
					})}"${_scopeId}>defaultOpen: boolean</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "defaultOpen: boolean")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>default-open</span>`);
					else return [createVNode("span", null, "default-open")];
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
					})}"${_scopeId}>import PropertySectionHeader</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionHeader")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionHeader</span>`);
					else return [createVNode("span", null, "PropertySectionHeader")];
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
					})}"${_scopeId}>import PropertySectionTitle</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionTitle")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionTitle</span>`);
					else return [createVNode("span", null, "PropertySectionTitle")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Layout&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertySectionTitle</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">    &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertySectionHeader</span><span style="${ssrRenderStyle({
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
					})}"${_scopeId}>import PropertySectionContent</span></code></span>`);
					else return [createVNode("span", { class: "twoslash-popup-container vp-copy-ignore" }, [createVNode("code", { class: "twoslash-popup-code" }, [createVNode("span", { style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					} }, "import PropertySectionContent")])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span${_scopeId}>PropertySectionContent</span>`);
					else return [createVNode("span", null, "PropertySectionContent")];
				}),
				_: 1
			}, _parent));
			_push(`</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;Panel fields&lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertySectionContent</span><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
				"--shiki-light": "#24292E",
				"--shiki-dark": "#E1E4E8"
			})}">  &lt;/</span><span style="${ssrRenderStyle({
				"--shiki-light": "#11782a",
				"--shiki-dark": "#85E89D"
			})}">PropertySectionRoot</span><span style="${ssrRenderStyle({
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
			_push(`</div>`);
		};
	}
});
//#endregion
//#region programmable/sdk/api/components/property-section.md
var _sfc_setup = property_section_md_vue_type_script_setup_true_lang_default.setup;
property_section_md_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/sdk/api/components/property-section.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var property_section_default = property_section_md_vue_type_script_setup_true_lang_default;
//#endregion
export { __pageData, property_section_default as default };
