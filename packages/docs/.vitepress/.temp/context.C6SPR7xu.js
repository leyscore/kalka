import { hasInjectionContext, inject, provide } from "vue";
//#region ../vue/src/primitives/BindableValue/context.ts
var BINDABLE_VALUE_KEY = Symbol("BindableValue");
function provideBindableValue(context) {
	provide(BINDABLE_VALUE_KEY, context);
}
function useBindableValue() {
	const context = inject(BINDABLE_VALUE_KEY);
	if (!context) throw new Error("[open-pencil] BindableValue part must be used inside BindableValueRoot");
	return context;
}
function useOptionalBindableValue() {
	return inject(BINDABLE_VALUE_KEY, void 0);
}
//#endregion
//#region ../vue/src/lifecycle/retention/context.ts
var RETAINED_ACTIVITY = Symbol("retained-activity");
function useRetainedActivity() {
	return hasInjectionContext() ? inject(RETAINED_ACTIVITY, void 0) : void 0;
}
//#endregion
export { useOptionalBindableValue as i, provideBindableValue as n, useBindableValue as r, useRetainedActivity as t };
