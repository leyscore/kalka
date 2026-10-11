import { i as useOptionalBindableValue } from "./context.C6SPR7xu.js";
import { t as BindableValueRoot_default } from "./BindableValueRoot.B6IwC5Zx.js";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { computed, createVNode, defineComponent, inject, mergeProps, provide, ref, renderSlot, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { Primitive, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";
import { converter, differenceEuclidean, formatRgb, inGamut, toGamut } from "culori";
//#region ../vue/src/primitives/ChannelSlider/context.ts
var CHANNEL_SLIDER_KEY = Symbol("ChannelSlider");
function provideChannelSlider(context) {
	provide(CHANNEL_SLIDER_KEY, context);
}
function useChannelSlider() {
	const context = inject(CHANNEL_SLIDER_KEY);
	if (!context) throw new Error("[open-pencil] ChannelSlider part must be used inside ChannelSliderRoot");
	return context;
}
//#endregion
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderRoot.vue?vue&type=script&setup=true&lang.ts
/**
* Scalar color-channel slider used for OkHCL until Reka supports that color space.
*
* @deprecated-when-upstream Replace with Reka ColorSlider after
* https://github.com/unovue/reka-ui/issues/2798 lands.
*/
var ChannelSliderRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "ChannelSliderRoot",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		label: {},
		min: { default: 0 },
		max: { default: 100 },
		step: { default: 1 },
		orientation: { default: "horizontal" },
		disabled: {
			type: Boolean,
			default: false
		},
		inverted: {
			type: Boolean,
			default: false
		},
		formatValueText: {
			type: Function,
			default: String
		},
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "span" }
	},
	emits: ["update:modelValue", "valueCommit"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const sliderValue = computed({
			get: () => [__props.modelValue],
			set: (values) => emit("update:modelValue", values[0] ?? __props.min)
		});
		const value = computed(() => __props.modelValue);
		const labelRef = computed(() => __props.label);
		const minRef = computed(() => __props.min);
		const maxRef = computed(() => __props.max);
		const stepRef = computed(() => __props.step);
		const disabledRef = computed(() => __props.disabled);
		const orientationRef = computed(() => __props.orientation);
		const valueText = computed(() => __props.formatValueText(__props.modelValue));
		const slotProps = computed(() => ({
			value: value.value,
			min: minRef.value,
			max: maxRef.value,
			step: stepRef.value,
			disabled: disabledRef.value,
			orientation: orientationRef.value
		}));
		provideChannelSlider({
			value,
			label: labelRef,
			valueText,
			min: minRef,
			max: maxRef,
			step: stepRef,
			disabled: disabledRef,
			orientation: orientationRef
		});
		function commit(values) {
			emit("valueCommit", values[0] ?? __props.min);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(SliderRoot), mergeProps(_ctx.$attrs, {
				modelValue: sliderValue.value,
				"onUpdate:modelValue": ($event) => sliderValue.value = $event,
				as: __props.as,
				"as-child": __props.asChild,
				min: __props.min,
				max: __props.max,
				step: __props.step,
				orientation: __props.orientation,
				disabled: __props.disabled,
				inverted: __props.inverted,
				"data-slot": "root",
				onValueCommit: commit
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
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderRoot.vue
var _sfc_setup$5 = ChannelSliderRoot_vue_vue_type_script_setup_true_lang_default.setup;
ChannelSliderRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/ChannelSlider/ChannelSliderRoot.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var ChannelSliderRoot_default = ChannelSliderRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderThumb.vue?vue&type=script&setup=true&lang.ts
var ChannelSliderThumb_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ChannelSliderThumb",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "span" }
	},
	setup(__props) {
		const context = useChannelSlider();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(SliderThumb), mergeProps({
				as: __props.as,
				"as-child": __props.asChild,
				"aria-label": unref(context).label.value,
				"aria-valuetext": unref(context).valueText.value,
				"data-slot": "thumb"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {
						value: unref(context).value.value,
						valueText: unref(context).valueText.value,
						label: unref(context).label.value
					}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {
						value: unref(context).value.value,
						valueText: unref(context).valueText.value,
						label: unref(context).label.value
					})];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderThumb.vue
var _sfc_setup$4 = ChannelSliderThumb_vue_vue_type_script_setup_true_lang_default.setup;
ChannelSliderThumb_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/ChannelSlider/ChannelSliderThumb.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var ChannelSliderThumb_default = ChannelSliderThumb_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderTrack.vue?vue&type=script&setup=true&lang.ts
var ChannelSliderTrack_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ChannelSliderTrack",
	__ssrInlineRender: true,
	props: {
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "span" }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(SliderTrack), mergeProps({
				as: __props.as,
				"as-child": __props.asChild,
				"data-slot": "track"
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
//#region ../vue/src/primitives/ChannelSlider/ChannelSliderTrack.vue
var _sfc_setup$3 = ChannelSliderTrack_vue_vue_type_script_setup_true_lang_default.setup;
ChannelSliderTrack_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/ChannelSlider/ChannelSliderTrack.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var ChannelSliderTrack_default = ChannelSliderTrack_vue_vue_type_script_setup_true_lang_default;
converter("rgb");
converter("p3");
converter("oklch");
toGamut("rgb", "oklch");
toGamut("p3", "oklch");
converter("rgb");
converter("p3");
toGamut("rgb", "oklch");
toGamut("p3", "oklch");
inGamut("rgb");
inGamut("p3");
converter("rgb");
function colorToCSS(color) {
	return formatRgb({
		mode: "rgb",
		r: color.r,
		g: color.g,
		b: color.b,
		alpha: color.a
	});
}
differenceEuclidean("rgb");
//#endregion
//#region ../vue/src/primitives/Fill/useFill.ts
var FILL_CATEGORY = {
	SOLID: "SOLID",
	GRADIENT_LINEAR: "GRADIENT",
	GRADIENT_RADIAL: "GRADIENT",
	GRADIENT_ANGULAR: "GRADIENT",
	GRADIENT_DIAMOND: "GRADIENT",
	IMAGE: "IMAGE"
};
function effectiveColor(color, opacity) {
	return {
		...color,
		a: color.a * opacity
	};
}
function gradientCSS(stops, opacity) {
	return stops.map((stop) => `${colorToCSS(effectiveColor(stop.color, opacity))} ${stop.position * 100}%`).join(", ");
}
function fillCategory(fill) {
	return FILL_CATEGORY[fill.type] ?? "SOLID";
}
function fillIsTransparent(fill) {
	if (fill.opacity < 1) return true;
	if (fillCategory(fill) === "GRADIENT") return fill.gradientStops?.some((stop) => stop.color.a < 1) ?? fill.color.a < 1;
	return fill.color.a < 1;
}
function fillSwatchBackground(fill) {
	if (fillCategory(fill) === "GRADIENT" && fill.gradientStops?.length) return `linear-gradient(to right, ${gradientCSS(fill.gradientStops, fill.opacity)})`;
	return colorToCSS(effectiveColor(fill.color, fill.opacity));
}
/** Fill category state and immutable conversion actions without picker or popover behavior. */
function useFill(fill, onUpdate) {
	const category = computed(() => fillCategory(fill.value));
	const swatchBackground = computed(() => fillSwatchBackground(fill.value));
	const transparent = computed(() => fillIsTransparent(fill.value));
	function toSolid() {
		if (category.value === "SOLID") return;
		const color = fill.value.gradientStops?.[0]?.color ?? fill.value.color;
		onUpdate({
			...fill.value,
			type: "SOLID",
			color: { ...color }
		});
	}
	function toGradient() {
		if (category.value === "GRADIENT") return;
		const gradientStops = fill.value.gradientStops?.length ? structuredClone(fill.value.gradientStops) : [{
			color: { ...fill.value.color },
			position: 0
		}, {
			color: {
				r: 1,
				g: 1,
				b: 1,
				a: 1
			},
			position: 1
		}];
		onUpdate({
			...fill.value,
			type: "GRADIENT_LINEAR",
			gradientStops,
			gradientTransform: {
				m00: 1,
				m01: 0,
				m02: 0,
				m10: 0,
				m11: 0,
				m12: .5
			}
		});
	}
	function toImage() {
		if (category.value === "IMAGE") return;
		onUpdate({
			...fill.value,
			type: "IMAGE"
		});
	}
	return {
		category,
		swatchBackground,
		transparent,
		actions: {
			toSolid,
			toGradient,
			toImage
		},
		toSolid,
		toGradient,
		toImage
	};
}
//#endregion
//#region ../vue/src/primitives/Fill/FillRoot.vue?vue&type=script&setup=true&lang.ts
var FillRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "FillRoot",
	__ssrInlineRender: true,
	props: { fill: {} },
	emits: ["update"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const model = useFill(computed(() => __props.fill), (updated) => emit("update", updated));
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSlot(_ctx.$slots, "default", {
				fill: __props.fill,
				category: unref(model).category.value,
				swatchBackground: unref(model).swatchBackground.value,
				transparent: unref(model).transparent.value,
				actions: unref(model).actions
			}, null, _push, _parent);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/Fill/FillRoot.vue
var _sfc_setup$2 = FillRoot_vue_vue_type_script_setup_true_lang_default.setup;
FillRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/Fill/FillRoot.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var FillRoot_default = FillRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/Fill/FillSwatch.vue?vue&type=script&setup=true&lang.ts
var FillSwatch_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "FillSwatch",
	__ssrInlineRender: true,
	props: {
		fill: {},
		label: {},
		asChild: {
			type: Boolean,
			default: false
		},
		as: { default: "span" }
	},
	setup(__props) {
		const binding = useOptionalBindableValue();
		const bindingState = computed(() => binding?.state.value);
		const boundColor = computed(() => bindingState.value === "bound" ? binding?.resolvedValue.value : void 0);
		const effectiveFill = computed(() => __props.fill.type === "SOLID" && boundColor.value ? {
			...__props.fill,
			color: boundColor.value
		} : __props.fill);
		const category = computed(() => fillCategory(effectiveFill.value));
		const background = computed(() => fillSwatchBackground(effectiveFill.value));
		const transparent = computed(() => fillIsTransparent(effectiveFill.value));
		const accessibleLabel = computed(() => __props.label ?? `${category.value.toLowerCase()} fill`);
		const stateAttrs = computed(() => binding?.stateAttrs.value);
		const slotProps = computed(() => ({
			fill: effectiveFill.value,
			color: effectiveFill.value.color,
			category: category.value,
			background: background.value,
			transparent: transparent.value,
			bindingState: bindingState.value,
			stateAttrs: stateAttrs.value
		}));
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Primitive), mergeProps({
				..._ctx.$attrs,
				...stateAttrs.value
			}, {
				as: __props.as,
				"as-child": __props.asChild,
				"aria-label": accessibleLabel.value,
				"data-fill-type": effectiveFill.value.type,
				"data-fill-category": category.value,
				"data-transparent": transparent.value ? "" : void 0,
				style: { "--open-pencil-fill-swatch-background": background.value },
				role: "img",
				"aria-roledescription": "fill swatch",
				"data-slot": "swatch"
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
//#region ../vue/src/primitives/Fill/FillSwatch.vue
var _sfc_setup$1 = FillSwatch_vue_vue_type_script_setup_true_lang_default.setup;
FillSwatch_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/Fill/FillSwatch.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var FillSwatch_default = FillSwatch_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/Fill/examples/States.vue?vue&type=script&setup=true&lang.ts
var States_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "States",
	__ssrInlineRender: true,
	setup(__props) {
		const solid = {
			type: "SOLID",
			color: {
				r: .22,
				g: .48,
				b: .96,
				a: 1
			},
			opacity: 1,
			visible: true
		};
		const transparent = {
			...solid,
			color: {
				...solid.color,
				a: .45
			}
		};
		const gradient = {
			...solid,
			type: "GRADIENT_LINEAR",
			gradientStops: [{
				color: {
					r: .55,
					g: .24,
					b: .98,
					a: 1
				},
				position: 0
			}, {
				color: {
					r: .08,
					g: .72,
					b: .65,
					a: .65
				},
				position: 1
			}]
		};
		const editableFill = ref(structuredClone(solid));
		const chroma = ref(.16);
		const target = [{
			nodeId: "example",
			path: "fills/0/color"
		}];
		const variable = {
			id: "color/brand",
			name: "Color/Brand",
			type: "COLOR",
			collectionId: "example",
			valuesByMode: { default: {
				r: .65,
				g: .3,
				b: .95,
				a: 1
			} },
			description: "",
			hiddenFromPublishing: false
		};
		const boundColor = {
			r: .65,
			g: .3,
			b: .95,
			a: 1
		};
		const provider = {
			listVariables: () => [variable],
			filterVariables: () => [variable],
			getBindingId: () => variable.id,
			getBound: () => variable,
			getState: () => "bound",
			resolve: (variableId) => variableId === variable.id ? boundColor : void 0,
			bind: () => void 0,
			unbind: () => void 0
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-[560px] space-y-5 rounded-lg border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] p-5 text-[var(--vp-c-text-1)]" }, _attrs))}><section><h3 class="mb-2 text-sm font-semibold">Fill swatches</h3><div class="flex flex-wrap gap-4"><!--[-->`);
			ssrRenderList({
				Solid: solid,
				Transparent: transparent,
				Gradient: gradient
			}, (item, name) => {
				_push(ssrRenderComponent(FillSwatch_default, {
					key: name,
					fill: item,
					label: `${name} fill`,
					class: "relative size-10 overflow-hidden rounded-md border border-[var(--vp-c-divider)] bg-[conic-gradient(#ddd_25%,#fff_0_50%,#ddd_0_75%,#fff_0)] bg-[size:10px_10px]"
				}, {
					default: withCtx((swatch, _push, _parent, _scopeId) => {
						if (_push) _push(`<span class="absolute inset-0" style="${ssrRenderStyle({ background: swatch.background })}"${_scopeId}></span>`);
						else return [createVNode("span", {
							class: "absolute inset-0",
							style: { background: swatch.background }
						}, null, 4)];
					}),
					_: 2
				}, _parent));
			});
			_push(`<!--]-->`);
			_push(ssrRenderComponent(BindableValueRoot_default, {
				provider,
				targets: target,
				value: solid.color
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(FillSwatch_default, {
						fill: solid,
						label: "Bound token fill",
						class: "relative size-10 overflow-hidden rounded-md border border-[var(--vp-c-divider)]"
					}, {
						default: withCtx((swatch, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="absolute inset-0" style="${ssrRenderStyle({ background: swatch.background })}"${_scopeId}></span>`);
							else return [createVNode("span", {
								class: "absolute inset-0",
								style: { background: swatch.background }
							}, null, 4)];
						}),
						_: 1
					}, _parent, _scopeId));
					else return [createVNode(FillSwatch_default, {
						fill: solid,
						label: "Bound token fill",
						class: "relative size-10 overflow-hidden rounded-md border border-[var(--vp-c-divider)]"
					}, {
						default: withCtx((swatch) => [createVNode("span", {
							class: "absolute inset-0",
							style: { background: swatch.background }
						}, null, 4)]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(`</div></section><section><h3 class="mb-2 text-sm font-semibold">Fill state</h3>`);
			_push(ssrRenderComponent(FillRoot_default, {
				fill: editableFill.value,
				onUpdate: ($event) => editableFill.value = $event
			}, {
				default: withCtx((fillModel, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="flex items-center gap-2"${_scopeId}>`);
						_push(ssrRenderComponent(FillSwatch_default, {
							fill: editableFill.value,
							label: "Editable fill",
							class: "relative size-8 overflow-hidden rounded border border-[var(--vp-c-divider)]"
						}, {
							default: withCtx((swatch, _push, _parent, _scopeId) => {
								if (_push) _push(`<span class="absolute inset-0" style="${ssrRenderStyle({ background: swatch.background })}"${_scopeId}></span>`);
								else return [createVNode("span", {
									class: "absolute inset-0",
									style: { background: swatch.background }
								}, null, 4)];
							}),
							_: 2
						}, _parent, _scopeId));
						_push(`<button class="rounded border px-2 py-1 text-xs"${_scopeId}> Solid </button><button class="rounded border px-2 py-1 text-xs"${_scopeId}> Gradient </button><button class="rounded border px-2 py-1 text-xs"${_scopeId}> Image </button></div>`);
					} else return [createVNode("div", { class: "flex items-center gap-2" }, [
						createVNode(FillSwatch_default, {
							fill: editableFill.value,
							label: "Editable fill",
							class: "relative size-8 overflow-hidden rounded border border-[var(--vp-c-divider)]"
						}, {
							default: withCtx((swatch) => [createVNode("span", {
								class: "absolute inset-0",
								style: { background: swatch.background }
							}, null, 4)]),
							_: 1
						}, 8, ["fill"]),
						createVNode("button", {
							class: "rounded border px-2 py-1 text-xs",
							onClick: fillModel.actions.toSolid
						}, " Solid ", 8, ["onClick"]),
						createVNode("button", {
							class: "rounded border px-2 py-1 text-xs",
							onClick: fillModel.actions.toGradient
						}, " Gradient ", 8, ["onClick"]),
						createVNode("button", {
							class: "rounded border px-2 py-1 text-xs",
							onClick: fillModel.actions.toImage
						}, " Image ", 8, ["onClick"])
					])];
				}),
				_: 1
			}, _parent));
			_push(`</section><section><h3 class="mb-2 text-sm font-semibold">OkHCL channel</h3>`);
			_push(ssrRenderComponent(ChannelSliderRoot_default, {
				modelValue: chroma.value,
				"onUpdate:modelValue": ($event) => chroma.value = $event,
				label: "Chroma",
				min: 0,
				max: .4,
				step: .001,
				"format-value-text": (value) => `${Math.round(value * 100)}%`,
				class: "relative flex h-4 touch-none items-center"
			}, {
				default: withCtx((slider, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(ChannelSliderTrack_default, { class: "absolute h-3 w-full rounded bg-[linear-gradient(to_right,#ddd,#7c3aed)]" }, null, _parent, _scopeId));
						_push(ssrRenderComponent(ChannelSliderThumb_default, { class: "block size-4 rounded-full border-2 border-white bg-violet-600 shadow outline-none focus-visible:ring-2" }, null, _parent, _scopeId));
						_push(`<output class="ml-auto pl-4 text-xs tabular-nums"${_scopeId}>${ssrInterpolate(Math.round(slider.value * 100))}%</output>`);
					} else return [
						createVNode(ChannelSliderTrack_default, { class: "absolute h-3 w-full rounded bg-[linear-gradient(to_right,#ddd,#7c3aed)]" }),
						createVNode(ChannelSliderThumb_default, { class: "block size-4 rounded-full border-2 border-white bg-violet-600 shadow outline-none focus-visible:ring-2" }),
						createVNode("output", { class: "ml-auto pl-4 text-xs tabular-nums" }, toDisplayString(Math.round(slider.value * 100)) + "%", 1)
					];
				}),
				_: 1
			}, _parent));
			_push(`</section></div>`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/Fill/examples/States.vue
var _sfc_setup = States_vue_vue_type_script_setup_true_lang_default.setup;
States_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/Fill/examples/States.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var States_default = States_vue_vue_type_script_setup_true_lang_default;
//#endregion
export { States_default as t };
