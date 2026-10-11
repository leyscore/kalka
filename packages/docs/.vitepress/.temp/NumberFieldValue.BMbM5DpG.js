import { i as useOptionalBindableValue, t as useRetainedActivity } from "./context.C6SPR7xu.js";
import { t as createContext } from "./create-context.NNVNn8wM.js";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
import { computed, defineComponent, mergeProps, nextTick, onBeforeUnmount, onDeactivated, ref, unref, useSSRContext, watch, watchEffect } from "vue";
import { templateRef, useEventListener, watchImmediate } from "@vueuse/core";
//#region ../vue/src/primitives/NumberField/context.ts
var [useNumberField, provideNumberField] = createContext("NumberField");
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldInput.vue?vue&type=script&setup=true&lang.ts
var NumberFieldInput_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "NumberFieldInput",
	__ssrInlineRender: true,
	setup(__props) {
		const ctx = useNumberField();
		const inputEl = templateRef("inputEl");
		const ariaAttrs = computed(() => ({
			role: "spinbutton",
			"aria-valuenow": ctx.isMixed.value ? void 0 : ctx.numericValue.value,
			"aria-valuemin": Number.isFinite(ctx.min.value) ? ctx.min.value : void 0,
			"aria-valuemax": Number.isFinite(ctx.max.value) ? ctx.max.value : void 0,
			"aria-disabled": ctx.disabled.value ? "true" : void 0,
			"aria-label": ctx.ariaLabel.value
		}));
		watchEffect(() => {
			ctx.inputRef.value = inputEl.value;
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(ctx).editing.value) _push(`<input${ssrRenderAttrs(mergeProps({
				ref_key: "inputEl",
				ref: inputEl
			}, {
				..._ctx.$attrs,
				...unref(ctx).stateAttrs.value,
				...ariaAttrs.value
			}, {
				"data-slot": "input",
				type: "text",
				inputmode: "decimal",
				autocomplete: "off",
				spellcheck: false,
				disabled: unref(ctx).disabled.value,
				value: unref(ctx).draftValue.value
			}, _attrs))}>`);
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldInput.vue
var _sfc_setup$2 = NumberFieldInput_vue_vue_type_script_setup_true_lang_default.setup;
NumberFieldInput_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/NumberField/NumberFieldInput.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var NumberFieldInput_default = NumberFieldInput_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/controls/number-expression/evaluate.ts
var ArithmeticParser = class {
	source;
	index = 0;
	constructor(source) {
		this.source = source;
	}
	parse() {
		const value = this.parseExpression();
		this.skipWhitespace();
		if (this.index !== this.source.length) throw new Error("Unexpected trailing input");
		return value;
	}
	parseExpression() {
		let value = this.parseTerm();
		this.skipWhitespace();
		let operator = this.source[this.index];
		while (operator === "+" || operator === "-") {
			this.index += 1;
			const right = this.parseTerm();
			value = operator === "+" ? value + right : value - right;
			this.skipWhitespace();
			operator = this.source[this.index];
		}
		return value;
	}
	parseTerm() {
		let value = this.parseUnary();
		this.skipWhitespace();
		let operator = this.source[this.index];
		while (operator === "*" || operator === "/") {
			this.index += 1;
			const right = this.parseUnary();
			value = operator === "*" ? value * right : value / right;
			this.skipWhitespace();
			operator = this.source[this.index];
		}
		return value;
	}
	parseUnary() {
		this.skipWhitespace();
		const operator = this.source[this.index];
		if (operator !== "+" && operator !== "-") return this.parsePrimary();
		this.index += 1;
		const value = this.parseUnary();
		return operator === "-" ? -value : value;
	}
	parsePrimary() {
		this.skipWhitespace();
		if (this.source[this.index] === "(") {
			this.index += 1;
			const value = this.parseExpression();
			this.skipWhitespace();
			if (this.source[this.index] !== ")") throw new Error("Missing closing parenthesis");
			this.index += 1;
			return value;
		}
		const match = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(this.source.slice(this.index));
		if (!match) throw new Error("Expected number");
		this.index += match[0].length;
		return Number(match[0]);
	}
	skipWhitespace() {
		while (/\s/.test(this.source[this.index] ?? "")) this.index += 1;
	}
};
function evaluateArithmetic(source) {
	try {
		const value = new ArithmeticParser(source).parse();
		return Number.isFinite(value) ? {
			ok: true,
			value,
			kind: "absolute"
		} : {
			ok: false,
			error: "non-finite"
		};
	} catch {
		return {
			ok: false,
			error: "syntax"
		};
	}
}
function evaluateNumberExpression(expression, { current, max = Infinity, mixed = false }) {
	const source = expression.trim();
	if (!source) return {
		ok: false,
		error: "empty"
	};
	if (source.endsWith("%")) {
		if (!Number.isFinite(max)) return {
			ok: false,
			error: "percent-requires-finite-max"
		};
		const percentage = evaluateArithmetic(source.slice(0, -1));
		if (!percentage.ok) return percentage;
		const value = max * percentage.value / 100;
		return Number.isFinite(value) ? {
			ok: true,
			value,
			kind: "percent"
		} : {
			ok: false,
			error: "non-finite"
		};
	}
	const relative = /^[+\-*/]/.test(source);
	if (relative && mixed) return {
		ok: false,
		error: "relative-requires-value"
	};
	if (relative && !Number.isFinite(current)) return {
		ok: false,
		error: "non-finite"
	};
	const result = evaluateArithmetic(relative ? `(${current})${source}` : source);
	return result.ok ? {
		...result,
		kind: relative ? "relative" : "absolute"
	} : result;
}
function clampNumberValue(value, min = -Infinity, max = Infinity) {
	return Math.min(max, Math.max(min, value));
}
function normalizeNumberValue(value) {
	return Number.isFinite(value) ? Number.parseFloat(value.toPrecision(14)) : value;
}
function stepNumberValue(value, direction, step, modifiers = {}, min = -Infinity, max = Infinity) {
	const multiplier = (modifiers.shiftKey ? 10 : 1) * (modifiers.altKey ? .1 : 1);
	return clampNumberValue(normalizeNumberValue(value + direction * step * multiplier), min, max);
}
//#endregion
//#region ../vue/src/shared/dom-events.ts
function inputValue(e) {
	return e.target instanceof HTMLInputElement ? e.target.value : "";
}
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldRoot.vue?vue&type=script&setup=true&lang.ts
var NumberFieldRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "NumberFieldRoot",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		min: { default: () => -Infinity },
		max: { default: () => Infinity },
		step: { default: 1 },
		sensitivity: { default: 1 },
		placeholder: { default: "Mixed" },
		ariaLabel: {},
		disabled: {
			type: Boolean,
			default: false
		},
		inheritBinding: {
			type: Boolean,
			default: true
		},
		bound: {
			type: Boolean,
			default: false
		},
		editPolicy: { default: "editable" }
	},
	emits: [
		"update:modelValue",
		"commit",
		"cancel",
		"editing-change",
		"invalid",
		"detach-request"
	],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const retainedActivity = useRetainedActivity();
		const enclosingBinding = useOptionalBindableValue();
		const binding = __props.inheritBinding ? enclosingBinding : void 0;
		const editing = ref(false);
		const scrubbing = ref(false);
		const draftValue = ref("");
		const inputRef = ref(null);
		const invalidReason = ref(null);
		const workingValue = ref(0);
		const isMixed = computed(() => binding?.state.value === "mixed" || typeof __props.modelValue === "symbol");
		const numericValue = computed(() => {
			const resolved = binding?.resolvedValue.value;
			if (binding?.state.value === "bound" && typeof resolved === "number") return resolved;
			return typeof __props.modelValue === "number" ? __props.modelValue : 0;
		});
		const displayValue = computed(() => {
			if (binding?.state.value === "unresolved") return "—";
			return isMixed.value ? "" : String(normalizeNumberValue(numericValue.value));
		});
		const disabled = computed(() => __props.disabled);
		const bound = computed(() => binding ? binding.state.value === "bound" || binding.state.value === "unresolved" : __props.bound);
		const effectiveEditPolicy = computed(() => {
			if (!binding) return __props.editPolicy;
			if (binding.policy.value === "readonly-when-bound") return "readonly";
			if (binding.policy.value === "detach-on-edit") return "detach-on-edit";
			return "editable";
		});
		const minValue = computed(() => __props.min);
		const maxValue = computed(() => __props.max);
		const stepValue = computed(() => Number.isFinite(__props.step) && __props.step > 0 ? __props.step : 1);
		const ariaLabelValue = computed(() => __props.ariaLabel);
		let interactionStartValue = 0;
		let interactionStartedMixed = false;
		let mutationRequested = false;
		let stopMove;
		let stopUp;
		let stopCancel;
		let scrubTarget;
		let scrubPointerId;
		function canMutate() {
			if (binding?.state.value === "unresolved") return false;
			return !disabled.value && !(bound.value && effectiveEditPolicy.value === "readonly");
		}
		function requestMutation(source) {
			if (mutationRequested) return true;
			if (!canMutate()) return false;
			if (binding && !binding.actions.beginMutation(source)) return false;
			if (!binding && bound.value && effectiveEditPolicy.value === "detach-on-edit") emit("detach-request", source);
			mutationRequested = true;
			return true;
		}
		function beginInteraction() {
			interactionStartValue = numericValue.value;
			interactionStartedMixed = isMixed.value;
			workingValue.value = numericValue.value;
			mutationRequested = false;
			invalidReason.value = null;
		}
		function updateValue(value) {
			const normalized = normalizeNumberValue(clampNumberValue(value, __props.min, __props.max));
			workingValue.value = normalized;
			if (binding?.actions.applyValue(normalized)) return;
			if (__props.modelValue !== normalized) emit("update:modelValue", normalized);
		}
		function restoreInteractionValue() {
			if (!mutationRequested) return;
			if (workingValue.value !== interactionStartValue || interactionStartedMixed !== isMixed.value) {
				workingValue.value = interactionStartValue;
				if (!binding?.actions.applyValue(interactionStartValue)) emit("update:modelValue", interactionStartValue);
			}
		}
		function finishCommit(value) {
			updateValue(value);
			editing.value = false;
			if (mutationRequested || workingValue.value !== interactionStartValue || interactionStartedMixed) emit("commit", workingValue.value, interactionStartValue);
			binding?.actions.commitMutation();
		}
		function startEdit() {
			if (editing.value || !canMutate()) return;
			beginInteraction();
			draftValue.value = interactionStartedMixed ? "" : String(interactionStartValue);
			editing.value = true;
			nextTick(() => {
				inputRef.value?.focus();
				inputRef.value?.select();
			});
		}
		function setDraft(value) {
			if (value !== draftValue.value && !requestMutation("edit")) return;
			draftValue.value = value;
			if (/^\s*(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?\s*$/i.test(value)) updateValue(Number(value));
		}
		function onInput(event) {
			setDraft(inputValue(event));
		}
		function commitEdit() {
			if (!editing.value) return;
			const expression = draftValue.value;
			const result = evaluateNumberExpression(expression, {
				current: interactionStartValue,
				max: __props.max,
				mixed: interactionStartedMixed
			});
			if (!result.ok) {
				invalidReason.value = result.error;
				restoreInteractionValue();
				editing.value = false;
				binding?.actions.cancelMutation();
				emit("cancel");
				emit("invalid", expression, result.error);
				return;
			}
			finishCommit(result.value);
		}
		function cancelEdit() {
			if (!editing.value) return;
			restoreInteractionValue();
			invalidReason.value = null;
			editing.value = false;
			binding?.actions.cancelMutation();
			emit("cancel");
		}
		function stopScrubListeners() {
			stopMove?.();
			stopUp?.();
			stopCancel?.();
			stopMove = void 0;
			stopUp = void 0;
			stopCancel = void 0;
			if (scrubTarget && scrubPointerId != null && scrubTarget.hasPointerCapture(scrubPointerId)) scrubTarget.releasePointerCapture(scrubPointerId);
			scrubTarget = void 0;
			scrubPointerId = void 0;
			if (typeof document !== "undefined") document.body.style.cursor = "";
		}
		function startScrub(event) {
			if (!canMutate()) return;
			event.preventDefault();
			beginInteraction();
			const startX = event.clientX;
			let lastX = startX;
			let accumulated = numericValue.value;
			let hasMoved = false;
			const target = event.currentTarget instanceof Element ? event.currentTarget : void 0;
			scrubTarget = target;
			scrubPointerId = event.pointerId;
			target?.setPointerCapture(event.pointerId);
			const listenerTarget = target ?? document;
			stopMove = useEventListener(listenerTarget, "pointermove", (moveEvent) => {
				if (moveEvent.pointerId !== event.pointerId) return;
				const dx = moveEvent.clientX - lastX;
				lastX = moveEvent.clientX;
				if (!hasMoved && Math.abs(moveEvent.clientX - startX) > 2) {
					if (!requestMutation("scrub")) return;
					hasMoved = true;
					scrubbing.value = true;
					document.body.style.cursor = "ew-resize";
				}
				if (!hasMoved) return;
				accumulated += dx * stepValue.value * __props.sensitivity;
				updateValue(accumulated);
			});
			const finish = (cancelled) => {
				stopScrubListeners();
				scrubbing.value = false;
				if (cancelled) {
					restoreInteractionValue();
					binding?.actions.cancelMutation();
					emit("cancel");
					return;
				}
				if (!hasMoved) {
					startEdit();
					return;
				}
				emit("commit", workingValue.value, interactionStartValue);
				binding?.actions.commitMutation();
			};
			stopUp = useEventListener(listenerTarget, "pointerup", (upEvent) => {
				if (upEvent.pointerId === event.pointerId) finish(false);
			});
			stopCancel = useEventListener(listenerTarget, "pointercancel", (cancelEvent) => {
				if (cancelEvent.pointerId === event.pointerId) finish(true);
			});
		}
		function stepValueFromKeyboard(event) {
			if (event.code !== "ArrowUp" && event.code !== "ArrowDown") return false;
			if (!editing.value) beginInteraction();
			if (!requestMutation("step")) return true;
			event.preventDefault();
			const draftResult = editing.value ? evaluateNumberExpression(draftValue.value, {
				current: interactionStartValue,
				max: __props.max,
				mixed: interactionStartedMixed
			}) : void 0;
			const next = stepNumberValue(draftResult?.ok ? draftResult.value : workingValue.value, event.code === "ArrowUp" ? 1 : -1, stepValue.value, event, __props.min, __props.max);
			updateValue(next);
			draftValue.value = String(next);
			if (!editing.value) {
				emit("commit", next, interactionStartValue);
				binding?.actions.commitMutation();
			}
			return true;
		}
		function onKeydown(event) {
			if (stepValueFromKeyboard(event)) return;
			if (event.code === "Enter") {
				event.preventDefault();
				commitEdit();
			} else if (event.code === "Escape") {
				event.preventDefault();
				cancelEdit();
			}
		}
		const state = computed(() => ({
			editing: editing.value,
			scrubbing: scrubbing.value,
			mixed: isMixed.value,
			disabled: disabled.value,
			bound: bound.value
		}));
		const stateAttrs = computed(() => ({
			"data-editing": editing.value ? "" : void 0,
			"data-scrubbing": scrubbing.value ? "" : void 0,
			"data-mixed": isMixed.value ? "" : void 0,
			"data-disabled": disabled.value ? "" : void 0,
			"data-bound": bound.value ? "" : void 0
		}));
		const rootTabindex = computed(() => {
			if (editing.value) return void 0;
			return disabled.value ? -1 : 0;
		});
		const rootAttrs = computed(() => ({
			...stateAttrs.value,
			role: editing.value ? void 0 : "spinbutton",
			tabindex: rootTabindex.value,
			"aria-valuenow": editing.value || isMixed.value || binding?.state.value === "unresolved" ? void 0 : numericValue.value,
			"aria-readonly": binding?.state.value === "unresolved" ? true : void 0,
			"aria-valuemin": !editing.value && Number.isFinite(__props.min) ? __props.min : void 0,
			"aria-valuemax": !editing.value && Number.isFinite(__props.max) ? __props.max : void 0,
			"aria-disabled": !editing.value && disabled.value ? "true" : void 0,
			"aria-label": editing.value ? void 0 : __props.ariaLabel,
			onFocus: startEdit,
			onKeydown
		}));
		const actions = {
			startScrub,
			startEdit,
			cancelEdit,
			commitEdit,
			setDraft,
			input: onInput,
			keydown: onKeydown
		};
		const slotProps = computed(() => ({
			modelValue: __props.modelValue,
			displayValue: displayValue.value,
			draftValue: draftValue.value,
			isMixed: isMixed.value,
			placeholder: __props.placeholder,
			...state.value,
			state: state.value,
			attrs: rootAttrs.value,
			actions
		}));
		provideNumberField({
			modelValue: computed(() => __props.modelValue),
			numericValue,
			displayValue,
			draftValue,
			isMixed,
			editing,
			scrubbing,
			disabled,
			bound,
			min: minValue,
			max: maxValue,
			step: stepValue,
			ariaLabel: ariaLabelValue,
			inputRef,
			state,
			stateAttrs,
			rootAttrs,
			slotProps,
			actions,
			invalidReason
		});
		watch(editing, (value) => emit("editing-change", value));
		watch(() => __props.modelValue, (value) => {
			if (!editing.value && !scrubbing.value && typeof value === "number") workingValue.value = value;
		}, { immediate: true });
		function cancelDetachedInteraction() {
			stopScrubListeners();
			if (editing.value || scrubbing.value) {
				restoreInteractionValue();
				editing.value = false;
				scrubbing.value = false;
				binding?.actions.cancelMutation();
				emit("cancel");
			}
		}
		watchImmediate(() => retainedActivity?.value ?? true, (active) => {
			if (!active) cancelDetachedInteraction();
		}, { flush: "sync" });
		onBeforeUnmount(cancelDetachedInteraction);
		onDeactivated(cancelDetachedInteraction);
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldRoot.vue
var _sfc_setup$1 = NumberFieldRoot_vue_vue_type_script_setup_true_lang_default.setup;
NumberFieldRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/NumberField/NumberFieldRoot.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var NumberFieldRoot_default = NumberFieldRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldValue.vue?vue&type=script&setup=true&lang.ts
var NumberFieldValue_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "NumberFieldValue",
	__ssrInlineRender: true,
	setup(__props) {
		const ctx = useNumberField();
		return (_ctx, _push, _parent, _attrs) => {
			if (!unref(ctx).editing.value) {
				_push(`<span${ssrRenderAttrs(mergeProps({
					..._ctx.$attrs,
					...unref(ctx).stateAttrs.value
				}, { "data-slot": "value" }, _attrs))}>`);
				ssrRenderSlot(_ctx.$slots, "default", mergeProps(unref(ctx).slotProps.value, { value: unref(ctx).displayValue.value }), () => {
					_push(`${ssrInterpolate(unref(ctx).isMixed.value ? unref(ctx).slotProps.value.placeholder : unref(ctx).displayValue.value)}`);
				}, _push, _parent);
				_push(`</span>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/NumberField/NumberFieldValue.vue
var _sfc_setup = NumberFieldValue_vue_vue_type_script_setup_true_lang_default.setup;
NumberFieldValue_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/NumberField/NumberFieldValue.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var NumberFieldValue_default = NumberFieldValue_vue_vue_type_script_setup_true_lang_default;
//#endregion
export { useNumberField as i, NumberFieldRoot_default as n, NumberFieldInput_default as r, NumberFieldValue_default as t };
