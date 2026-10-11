import { inject, provide } from "vue";
//#region ../vue/src/internal/create-context.ts
function createContext(name) {
	const key = Symbol(name);
	const provideContext = (value) => {
		provide(key, value);
		return value;
	};
	const injectContext = () => {
		const value = inject(key);
		if (!value) throw new Error(`[open-pencil] Injection \`${name}\` not found. Component must be used within the corresponding Root.`);
		return value;
	};
	return [injectContext, provideContext];
}
//#endregion
export { createContext as t };
