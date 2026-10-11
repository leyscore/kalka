import { n as provideBindableValue, t as useRetainedActivity } from "./context.C6SPR7xu.js";
import { ssrRenderSlot } from "vue/server-renderer";
import { computed, defineComponent, inject, onBeforeUnmount, onDeactivated, ref, useSSRContext } from "vue";
import { watchImmediate } from "@vueuse/core";
//#region ../vue/src/controls/binding-provider/context.ts
var BINDING_PROVIDER_KEY = Symbol("open-pencil-binding-provider");
function useBindingProvider() {
	return inject(BINDING_PROVIDER_KEY, void 0);
}
//#endregion
//#region ../vue/src/controls/binding-provider/prepare-edits.ts
/** Capture and deduplicate edit destinations before an interaction starts. */
function prepareBindingEdits(provider, targets) {
	const edits = /* @__PURE__ */ new Map();
	for (const target of targets) {
		const captured = { ...target };
		const variable = provider.getBound(captured);
		if (!variable) return void 0;
		const edit = provider.prepareEdit?.(variable.id, captured);
		if (!edit) return void 0;
		edits.set(edit.key, edit);
	}
	return [...edits.values()];
}
//#endregion
//#region ../vue/src/primitives/BindableValue/BindableValueRoot.vue?vue&type=script&setup=true&lang.ts
var BindableValueRoot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BindableValueRoot",
	__ssrInlineRender: true,
	props: {
		provider: {},
		targets: {},
		value: {},
		policy: { default: "detach-on-edit" },
		batchLabel: { default: "Edit bound value" }
	},
	setup(__props) {
		const retainedActivity = useRetainedActivity();
		const injectedProvider = useBindingProvider();
		const resolvedProvider = __props.provider ?? injectedProvider;
		if (!resolvedProvider) throw new Error("[open-pencil] BindableValueRoot requires a provider prop or provideBindingProvider()");
		const provider = resolvedProvider;
		const beginProviderBatch = provider.beginBatch;
		const commitProviderBatch = provider.commitBatch;
		const rollbackProviderBatch = provider.rollbackBatch;
		const supportsInteractionBatch = beginProviderBatch !== void 0 && commitProviderBatch !== void 0 && rollbackProviderBatch !== void 0;
		const targets = computed(() => __props.targets);
		const value = computed(() => __props.value);
		const policy = computed(() => __props.policy);
		const open = ref(false);
		const searchTerm = ref("");
		const state = computed(() => {
			provider.revision?.value;
			return provider.getState(targets.value);
		});
		const variable = computed(() => {
			const target = targets.value[0];
			return state.value !== "mixed" && target ? provider.getBound(target) : void 0;
		});
		const resolvedValue = computed(() => {
			provider.revision?.value;
			if (state.value === "unresolved") return void 0;
			const current = variable.value;
			return current ? provider.resolve(current.id, targets.value[0]) : void 0;
		});
		const variables = computed(() => {
			provider.revision?.value;
			return provider.filterVariables(searchTerm.value);
		});
		const stateAttrs = computed(() => ({
			"data-unresolved": state.value === "unresolved" ? "" : void 0,
			"data-unbound": state.value === "unbound" ? "" : void 0,
			"data-bound": state.value === "bound" ? "" : void 0,
			"data-mixed": state.value === "mixed" ? "" : void 0,
			"data-picker-open": open.value ? "" : void 0,
			"data-policy": policy.value
		}));
		let interactionActive = false;
		let detachedForInteraction = false;
		let bindingSnapshot = /* @__PURE__ */ new Map();
		let valueEdits = [];
		let interactionPolicy = policy.value;
		function runImmediate(label, action) {
			if (provider.runBatch) provider.runBatch(label, action);
			else action();
		}
		function bind(variableId) {
			runImmediate("Bind variable", () => {
				for (const target of targets.value) provider.bind(target, variableId);
			});
			open.value = false;
		}
		function unbind() {
			runImmediate("Unbind variable", () => {
				for (const target of targets.value) provider.unbind(target);
			});
		}
		function create(name) {
			const target = targets.value[0];
			if (!target || !provider.create) return;
			runImmediate("Create and bind variable", () => provider.create?.(target, value.value, name));
			open.value = false;
		}
		function openPicker() {
			open.value = true;
		}
		function closePicker() {
			open.value = false;
		}
		function togglePicker() {
			open.value = !open.value;
		}
		function setSearchTerm(term) {
			searchTerm.value = term;
		}
		function snapshotBindings() {
			bindingSnapshot = /* @__PURE__ */ new Map();
			for (const target of targets.value) {
				const id = provider.getBindingId(target);
				if (id) bindingSnapshot.set({ ...target }, id);
			}
		}
		function beginMutation(source) {
			if (retainedActivity?.value === false) return false;
			if (interactionActive) return true;
			if (state.value === "unresolved") return false;
			const startedUnbound = state.value === "unbound";
			const startedMixed = state.value === "mixed";
			if (!startedUnbound && !startedMixed) {
				if (policy.value === "readonly-when-bound") return false;
				if (policy.value === "edit-variable" && !provider.prepareEdit) return false;
			}
			interactionPolicy = policy.value;
			valueEdits = [];
			if (interactionPolicy === "edit-variable" && !startedUnbound) {
				const edits = prepareBindingEdits(provider, targets.value);
				if (!edits) return false;
				valueEdits = edits;
			}
			interactionActive = true;
			if (!startedUnbound) snapshotBindings();
			if (supportsInteractionBatch) beginProviderBatch(__props.batchLabel);
			if (interactionPolicy !== "edit-variable" && (startedMixed || !startedUnbound && interactionPolicy === "detach-on-edit")) {
				detachedForInteraction = true;
				for (const target of targets.value) provider.unbind(target);
			}
			return true;
		}
		function applyValue(nextValue) {
			if (interactionPolicy !== "edit-variable" || !interactionActive || !valueEdits.length) return false;
			for (const edit of valueEdits) edit.set(nextValue);
			return true;
		}
		function resetInteraction() {
			interactionActive = false;
			detachedForInteraction = false;
			bindingSnapshot.clear();
			valueEdits = [];
		}
		function commitMutation() {
			if (!interactionActive) return;
			if (supportsInteractionBatch) commitProviderBatch();
			resetInteraction();
		}
		function restoreWithoutRollback() {
			if (detachedForInteraction) for (const [target, variableId] of bindingSnapshot) provider.bind(target, variableId);
			else if (interactionPolicy === "edit-variable") for (const edit of valueEdits) edit.restore();
		}
		function cancelMutation() {
			if (!interactionActive) return;
			if (supportsInteractionBatch) rollbackProviderBatch();
			else restoreWithoutRollback();
			resetInteraction();
		}
		const actions = {
			bind,
			unbind,
			create,
			openPicker,
			closePicker,
			togglePicker,
			setSearchTerm,
			beginMutation,
			applyValue,
			commitMutation,
			cancelMutation
		};
		const slotProps = computed(() => ({
			state: state.value,
			bindingId: targets.value[0] ? provider.getBindingId(targets.value[0]) : void 0,
			variable: variable.value,
			resolvedValue: resolvedValue.value,
			policy: policy.value,
			open: open.value,
			searchTerm: searchTerm.value,
			variables: variables.value,
			stateAttrs: stateAttrs.value,
			actions
		}));
		provideBindableValue({
			provider,
			targets,
			value,
			state,
			variable,
			resolvedValue,
			policy,
			open,
			searchTerm,
			variables,
			stateAttrs,
			slotProps,
			actions
		});
		function deactivate() {
			cancelMutation();
			closePicker();
		}
		watchImmediate(() => retainedActivity?.value ?? true, (active) => {
			if (!active) deactivate();
		}, { flush: "sync" });
		onBeforeUnmount(cancelMutation);
		onDeactivated(deactivate);
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSlot(_ctx.$slots, "default", slotProps.value, null, _push, _parent);
		};
	}
});
//#endregion
//#region ../vue/src/primitives/BindableValue/BindableValueRoot.vue
var _sfc_setup = BindableValueRoot_vue_vue_type_script_setup_true_lang_default.setup;
BindableValueRoot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../vue/src/primitives/BindableValue/BindableValueRoot.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var BindableValueRoot_default = BindableValueRoot_vue_vue_type_script_setup_true_lang_default;
//#endregion
export { BindableValueRoot_default as t };
