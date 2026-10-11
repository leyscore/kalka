import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { renderToString, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderVNode } from "vue/server-renderer";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import { Fragment, computed, createBlock, createCommentVNode, createSSRApp, createTextVNode, createVNode, defineAsyncComponent, defineComponent, h, inject, markRaw, mergeProps, nextTick, onBeforeUnmount, onMounted, onUnmounted, onUpdated, openBlock, provide, reactive, readonly, ref, renderList, renderSlot, resolveComponent, resolveDynamicComponent, shallowReadonly, shallowRef, toDisplayString, toHandlers, unref, useSSRContext, useSlots, useTemplateRef, watch, watchEffect, watchPostEffect, withCtx, withKeys } from "vue";
import { onKeyStroke, tryOnUnmounted, useDark, useMediaQuery, useNavigatorLanguage, usePreferredDark, useScrollLock, useWindowScroll, useWindowSize } from "@vueuse/core";
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue?vue&type=script&setup=true&lang.ts
var VPBadge_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPBadge",
	__ssrInlineRender: true,
	props: {
		text: {},
		type: { default: "tip" }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({ class: ["VPBadge", __props.type] }, _attrs))}>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, () => {
				_push(`${ssrInterpolate(__props.text)}`);
			}, _push, _parent);
			_push(`</span>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue
var _sfc_setup$81 = VPBadge_vue_vue_type_script_setup_true_lang_default.setup;
VPBadge_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue");
	return _sfc_setup$81 ? _sfc_setup$81(props, ctx) : void 0;
};
var VPBadge_default = VPBadge_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue?vue&type=script&setup=true&lang.ts
var VPBackdrop_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPBackdrop",
	__ssrInlineRender: true,
	props: { show: { type: Boolean } },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.show) _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPBackdrop" }, _attrs))} data-v-e2e34c2d></div>`);
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue
var _sfc_setup$80 = VPBackdrop_vue_vue_type_script_setup_true_lang_default.setup;
VPBackdrop_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue");
	return _sfc_setup$80 ? _sfc_setup$80(props, ctx) : void 0;
};
var VPBackdrop_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPBackdrop_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e2e34c2d"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/components/ClientOnly.js
var ClientOnly = defineComponent({ setup(_, { slots }) {
	const show = ref(false);
	onMounted(() => {
		show.value = true;
	});
	return () => show.value && slots.default ? slots.default() : null;
} });
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/shared.js
var EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
var APPEARANCE_KEY = "vitepress-theme-appearance";
var UnpackStackView = Symbol("stack-view:unpack");
var HASH_WITHOUT_FRAGMENT_RE = /#.*?(?=:~:|$)/;
var HASH_OR_QUERY_RE = /[?#].*$/;
var INDEX_OR_EXT_RE = /(?:(^|\/)index)?(?:\.(?:md|html))?$/;
var INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
var DRIVE_LETTER_REGEX = /^[a-z]:/i;
var KNOWN_EXTENSIONS = /* @__PURE__ */ new Set();
var shellLangs = [
	"shellscript",
	"shell",
	"bash",
	"sh",
	"zsh"
];
var inBrowser = typeof document !== "undefined";
var notFoundPageData = {
	relativePath: "404.md",
	filePath: "",
	title: "404",
	description: "Not Found",
	headers: [],
	frontmatter: {
		sidebar: false,
		layout: "page"
	},
	lastUpdated: 0,
	isNotFound: true
};
function isActive(currentPath, currentHash, matchPath, asRegex = false, skipHashCheck = false) {
	currentPath = normalize(`/${currentPath}`);
	if (asRegex) return new RegExp(matchPath).test(currentPath);
	if (normalize(matchPath) !== currentPath) return false;
	if (skipHashCheck) return true;
	const hashMatch = matchPath.match(HASH_WITHOUT_FRAGMENT_RE);
	if (hashMatch) return currentHash === hashMatch[0];
	return true;
}
function normalize(path) {
	return decodeURI(path).replace(HASH_OR_QUERY_RE, "").replace(INDEX_OR_EXT_RE, "$1");
}
function isExternal(path) {
	return EXTERNAL_URL_RE.test(path);
}
function getLocaleForPath(siteData, relativePath) {
	return Object.keys(siteData?.locales || {}).find((key) => key !== "root" && !isExternal(key) && isActive(relativePath, "", `^/${key}/`, true)) || "root";
}
/**
* this merges the locales data to the main data by the route
*/
function resolveSiteDataByRoute(siteData, relativePath, filePath) {
	const localeIndex = getLocaleForPath(siteData, relativePath);
	const { label, link, markdown, ...localeConfig } = siteData.locales[localeIndex] ?? {};
	Object.assign(localeConfig, { localeIndex });
	const additionalConfigs = resolveAdditionalConfig(siteData, filePath || relativePath);
	return stackView({ head: mergeHead(siteData.head ?? [], localeConfig.head ?? [], ...additionalConfigs.map((data) => data.head ?? []).reverse()) }, ...additionalConfigs, localeConfig, siteData);
}
/**
* Create the page title string based on config.
*/
function createTitle(siteData, pageData) {
	const title = pageData.title || siteData.title;
	const template = pageData.titleTemplate ?? siteData.titleTemplate;
	if (typeof template === "string" && template.includes(":title")) return template.replace(/:title/g, title);
	const templateString = createTitleTemplate(siteData.title, template);
	if (title === templateString.slice(3)) return title;
	return `${title}${templateString}`;
}
function createTitleTemplate(siteTitle, template) {
	if (template === false) return "";
	if (template === true || template === void 0) return ` | ${siteTitle}`;
	if (siteTitle === template) return "";
	return ` | ${template}`;
}
function mergeHead(...headArrays) {
	const merged = [];
	const metaKeyMap = /* @__PURE__ */ new Map();
	for (const current of headArrays) for (const tag of current) {
		const [type, attrs] = tag;
		const keyAttr = Object.entries(attrs)[0];
		if (type !== "meta" || !keyAttr) {
			merged.push(tag);
			continue;
		}
		const key = `${keyAttr[0]}=${keyAttr[1]}`;
		const existingIndex = metaKeyMap.get(key);
		if (existingIndex != null) merged[existingIndex] = tag;
		else {
			metaKeyMap.set(key, merged.length);
			merged.push(tag);
		}
	}
	return merged;
}
function sanitizeFileName(name) {
	const match = DRIVE_LETTER_REGEX.exec(name);
	const driveLetter = match ? match[0] : "";
	return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "_").replace(/(^|\/)_+(?=[^/]*$)/, "$1");
}
function treatAsHtml(filename) {
	if (KNOWN_EXTENSIONS.size === 0) {
		const extraExts = typeof process === "object" && process.env?.VITE_EXTRA_EXTENSIONS || "";
		("3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,yaml,yml,zip" + (extraExts && typeof extraExts === "string" ? "," + extraExts : "")).split(",").forEach((ext) => KNOWN_EXTENSIONS.add(ext));
	}
	const ext = filename.split(".").pop();
	return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}
function escapeRegExp(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function resolveAdditionalConfig({ additionalConfig }, path) {
	if (additionalConfig === void 0) return [];
	if (typeof additionalConfig === "function") return additionalConfig(path) ?? [];
	const configs = [];
	const segments = path.split("/").slice(0, -1);
	while (segments.length) {
		const key = `/${segments.join("/")}/`;
		configs.push(additionalConfig[key]);
		segments.pop();
	}
	configs.push(additionalConfig["/"]);
	return configs.filter((config) => config !== void 0);
}
/**
* Creates a deep, merged view of multiple objects without mutating originals.
* Returns a readonly proxy behaving like a merged object of the input objects.
* Layers are merged in descending precedence, i.e. earlier layer is on top.
*/
function stackView(..._layers) {
	const layers = _layers.filter((layer) => isObject(layer));
	if (layers.length <= 1) return _layers[0];
	const allKeys = new Set(layers.flatMap((layer) => Reflect.ownKeys(layer)));
	const allKeysArray = [...allKeys];
	return new Proxy({}, {
		get(_, prop) {
			if (prop === UnpackStackView) return layers;
			return stackView(...layers.map((layer) => layer[prop]).filter((v) => v !== void 0));
		},
		set() {
			throw new Error("StackView is read-only and cannot be mutated.");
		},
		has(_, prop) {
			return allKeys.has(prop);
		},
		ownKeys() {
			return allKeysArray;
		},
		getOwnPropertyDescriptor(_, prop) {
			for (const layer of layers) {
				const descriptor = Object.getOwnPropertyDescriptor(layer, prop);
				if (descriptor) return descriptor;
			}
		}
	});
}
stackView.unpack = function(obj) {
	return obj?.[UnpackStackView];
};
function isObject(value) {
	return Object.prototype.toString.call(value) === "[object Object]";
}
function isShell(lang) {
	return shellLangs.includes(lang);
}
//#endregion
//#region ../../../../../@siteData
function deserializeFunctions(r) {
	return Array.isArray(r) ? r.map(deserializeFunctions) : typeof r == "object" && r !== null ? Object.keys(r).reduce((t, n) => (t[n] = deserializeFunctions(r[n]), t), {}) : typeof r == "string" && r.startsWith("_vp-fn_") ? new Function(`return ${r.slice(7)}`)() : r;
}
var _siteData_default = deserializeFunctions(JSON.parse("{\"lang\":\"en-US\",\"dir\":\"ltr\",\"title\":\"OpenPencil\",\"description\":\"Open-source, AI-native design editor. Figma alternative built from scratch with full .fig file compatibility.\",\"base\":\"/\",\"head\":[],\"router\":{\"prefetchLinks\":true},\"appearance\":\"dark\",\"themeConfig\":{\"logo\":{\"light\":\"/brand/mark.svg\",\"dark\":\"/brand/mark-dark.svg\",\"alt\":\"OpenPencil\"},\"search\":{\"provider\":\"local\"},\"nav\":[{\"text\":\"Overview\",\"link\":\"/getting-started\"},{\"text\":\"User Guide\",\"link\":\"/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/programmable/\"},{\"text\":\"SDK\",\"link\":\"/programmable/sdk/\"},{\"text\":\"Reference\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"Development\",\"link\":\"/development/contributing\"},{\"text\":\"Open App\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/user-guide/\":[{\"text\":\"Getting Around\",\"items\":[{\"text\":\"Canvas Navigation\",\"link\":\"/user-guide/canvas-navigation\"},{\"text\":\"Selection & Manipulation\",\"link\":\"/user-guide/selection-and-manipulation\"},{\"text\":\"Context Menu\",\"link\":\"/user-guide/context-menu\"}]},{\"text\":\"Creating Content\",\"items\":[{\"text\":\"Drawing Shapes\",\"link\":\"/user-guide/drawing-shapes\"},{\"text\":\"Text Editing\",\"link\":\"/user-guide/text-editing\"},{\"text\":\"Pen Tool\",\"link\":\"/user-guide/pen-tool\"},{\"text\":\"Vector Editing\",\"link\":\"/user-guide/vector-edit\"},{\"text\":\"Icons\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organizing & Managing\",\"items\":[{\"text\":\"Layers & Pages\",\"link\":\"/user-guide/layers-and-pages\"},{\"text\":\"Exporting\",\"link\":\"/user-guide/exporting\"},{\"text\":\"Cloud Storage\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Advanced Features\",\"items\":[{\"text\":\"Auto Layout\",\"link\":\"/user-guide/auto-layout\"},{\"text\":\"Components\",\"link\":\"/user-guide/components\"},{\"text\":\"Variables\",\"link\":\"/user-guide/variables\"},{\"text\":\"Checking Designs\",\"link\":\"/user-guide/checking-designs\"}]}],\"/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/programmable/\":[{\"text\":\"Overview\",\"items\":[{\"text\":\"Overview\",\"link\":\"/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Inspecting Files\",\"link\":\"/programmable/cli/inspecting\"},{\"text\":\"Exporting\",\"link\":\"/programmable/cli/exporting\"},{\"text\":\"Analyzing Designs\",\"link\":\"/programmable/cli/analyzing\"},{\"text\":\"Comparing Designs\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Controlling the App\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Scripting\",\"link\":\"/programmable/cli/scripting\"},{\"text\":\"JSX Renderer\",\"link\":\"/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"MCP Server\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"AI Chat\",\"link\":\"/programmable/ai-chat\"},{\"text\":\"Coding agents\",\"link\":\"/programmable/coding-agents\"},{\"text\":\"BYOK Compatibility\",\"link\":\"/programmable/byok-provider-compatibility\"},{\"text\":\"Collaboration\",\"link\":\"/programmable/collaboration\"}]}],\"/reference/\":[{\"text\":\"Reference\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Figma Feature Matrix\",\"link\":\"/reference/figma-compatibility\"},{\"text\":\"DOM/CSS Mapping\",\"link\":\"/reference/dom-css-mapping\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/development/\":[{\"text\":\"Development\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Architecture\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Tech Stack\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/\":[{\"text\":\"Overview\",\"items\":[{\"text\":\"Getting Started\",\"link\":\"/getting-started\"},{\"text\":\"Features\",\"link\":\"/overview/features\"},{\"text\":\"Comparison\",\"link\":\"/overview/comparison\"}]}]},\"socialLinks\":[{\"icon\":\"github\",\"link\":\"https://github.com/open-pencil/open-pencil\"},{\"icon\":\"discord\",\"link\":\"https://discord.gg/4wXc9fuZfm\",\"ariaLabel\":\"Discord\"}],\"editLink\":{\"pattern\":\"https://github.com/open-pencil/open-pencil/edit/master/packages/docs/:path\"},\"footer\":{\"message\":\"Released under the MIT License.\"}},\"locales\":{\"root\":{\"label\":\"English\",\"lang\":\"en\"},\"de\":{\"label\":\"Deutsch\",\"lang\":\"de\",\"description\":\"Open-Source, KI-nativer Design-Editor. Figma-Alternative.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Überblick\",\"link\":\"/de/getting-started\"},{\"text\":\"Benutzerhandbuch\",\"link\":\"/de/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/de/programmable/\"},{\"text\":\"SDK\",\"link\":\"/de/programmable/sdk/\"},{\"text\":\"Referenz\",\"link\":\"/de/reference/keyboard-shortcuts\"},{\"text\":\"Entwicklung\",\"link\":\"/development/contributing\"},{\"text\":\"App öffnen\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/de/user-guide/\":[{\"text\":\"Erste Schritte\",\"items\":[{\"text\":\"Canvas-Navigation\",\"link\":\"/de/user-guide/canvas-navigation\"},{\"text\":\"Auswahl & Bearbeitung\",\"link\":\"/de/user-guide/selection-and-manipulation\"},{\"text\":\"Kontextmenü\",\"link\":\"/de/user-guide/context-menu\"}]},{\"text\":\"Inhalte erstellen\",\"items\":[{\"text\":\"Formen zeichnen\",\"link\":\"/de/user-guide/drawing-shapes\"},{\"text\":\"Textbearbeitung\",\"link\":\"/de/user-guide/text-editing\"},{\"text\":\"Stiftwerkzeug\",\"link\":\"/de/user-guide/pen-tool\"},{\"text\":\"Vektorbearbeitung\",\"link\":\"/de/user-guide/vector-edit\"},{\"text\":\"Symbole\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organisieren\",\"items\":[{\"text\":\"Ebenen & Seiten\",\"link\":\"/de/user-guide/layers-and-pages\"},{\"text\":\"Exportieren\",\"link\":\"/de/user-guide/exporting\"},{\"text\":\"Cloud-Speicher\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Erweitert\",\"items\":[{\"text\":\"Auto-Layout\",\"link\":\"/de/user-guide/auto-layout\"},{\"text\":\"Komponenten\",\"link\":\"/de/user-guide/components\"},{\"text\":\"Variablen\",\"link\":\"/de/user-guide/variables\"},{\"text\":\"Designs prüfen\",\"link\":\"/user-guide/checking-designs\"}]}],\"/de/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/de/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/de/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/de/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/de/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/de/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/de/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/de/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/de/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/de/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/de/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/de/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/de/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/de/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/de/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/de/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/de/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/de/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/de/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/de/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/de/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/de/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/de/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/de/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/de/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/de/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/de/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/de/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/de/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/de/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/de/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/de/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/de/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/de/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/de/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/de/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/de/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/de/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/de/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/de/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/de/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/de/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/de/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/de/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/de/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/de/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/de/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/de/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/de/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/de/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/de/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/de/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/de/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/de/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/de/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/de/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/de/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/de/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/de/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/de/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/de/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/de/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/de/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/de/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/de/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/de/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/de/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/de/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/de/programmable/\":[{\"text\":\"Überblick\",\"items\":[{\"text\":\"Überblick\",\"link\":\"/de/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Dateien inspizieren\",\"link\":\"/de/programmable/cli/inspecting\"},{\"text\":\"Exportieren\",\"link\":\"/de/programmable/cli/exporting\"},{\"text\":\"Designs analysieren\",\"link\":\"/de/programmable/cli/analyzing\"},{\"text\":\"Designs vergleichen\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"App steuern\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Skripte\",\"link\":\"/de/programmable/cli/scripting\"},{\"text\":\"JSX-Renderer\",\"link\":\"/de/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"MCP-Server\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"KI-Chat\",\"link\":\"/de/programmable/ai-chat\"},{\"text\":\"Zusammenarbeit\",\"link\":\"/de/programmable/collaboration\"}]}],\"/de/reference/\":[{\"text\":\"Referenz\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Figma-Funktionsmatrix\",\"link\":\"/de/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/de/development/\":[{\"text\":\"Entwicklung\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Architektur\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Tech-Stack\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/de/\":[{\"text\":\"Überblick\",\"items\":[{\"text\":\"Erste Schritte\",\"link\":\"/de/getting-started\"},{\"text\":\"Funktionen\",\"link\":\"/de/overview/features\"},{\"text\":\"Vergleich\",\"link\":\"/de/overview/comparison\"}]}]}}},\"it\":{\"label\":\"Italiano\",\"lang\":\"it\",\"description\":\"Editor di design open-source, IA-nativo. Alternativa a Figma.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Panoramica\",\"link\":\"/it/getting-started\"},{\"text\":\"Guida utente\",\"link\":\"/it/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/it/programmable/\"},{\"text\":\"SDK\",\"link\":\"/it/programmable/sdk/\"},{\"text\":\"Riferimento\",\"link\":\"/it/reference/keyboard-shortcuts\"},{\"text\":\"Sviluppo\",\"link\":\"/development/contributing\"},{\"text\":\"Apri app\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/it/user-guide/\":[{\"text\":\"Orientamento\",\"items\":[{\"text\":\"Navigazione canvas\",\"link\":\"/it/user-guide/canvas-navigation\"},{\"text\":\"Selezione e manipolazione\",\"link\":\"/it/user-guide/selection-and-manipulation\"},{\"text\":\"Menu contestuale\",\"link\":\"/it/user-guide/context-menu\"}]},{\"text\":\"Creazione contenuti\",\"items\":[{\"text\":\"Disegno forme\",\"link\":\"/it/user-guide/drawing-shapes\"},{\"text\":\"Modifica testo\",\"link\":\"/it/user-guide/text-editing\"},{\"text\":\"Strumento penna\",\"link\":\"/it/user-guide/pen-tool\"},{\"text\":\"Modifica vettoriale\",\"link\":\"/it/user-guide/vector-edit\"},{\"text\":\"Icone\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organizzazione\",\"items\":[{\"text\":\"Livelli e pagine\",\"link\":\"/it/user-guide/layers-and-pages\"},{\"text\":\"Esportazione\",\"link\":\"/it/user-guide/exporting\"},{\"text\":\"Archiviazione cloud\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Avanzate\",\"items\":[{\"text\":\"Auto-layout\",\"link\":\"/it/user-guide/auto-layout\"},{\"text\":\"Componenti\",\"link\":\"/it/user-guide/components\"},{\"text\":\"Variabili\",\"link\":\"/it/user-guide/variables\"},{\"text\":\"Verificare i design\",\"link\":\"/user-guide/checking-designs\"}]}],\"/it/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/it/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/it/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/it/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/it/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/it/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/it/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/it/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/it/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/it/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/it/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/it/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/it/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/it/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/it/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/it/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/it/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/it/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/it/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/it/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/it/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/it/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/it/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/it/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/it/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/it/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/it/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/it/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/it/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/it/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/it/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/it/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/it/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/it/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/it/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/it/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/it/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/it/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/it/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/it/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/it/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/it/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/it/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/it/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/it/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/it/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/it/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/it/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/it/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/it/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/it/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/it/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/it/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/it/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/it/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/it/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/it/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/it/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/it/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/it/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/it/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/it/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/it/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/it/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/it/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/it/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/it/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/it/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/it/programmable/\":[{\"text\":\"Panoramica\",\"items\":[{\"text\":\"Panoramica\",\"link\":\"/it/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Ispezione file\",\"link\":\"/it/programmable/cli/inspecting\"},{\"text\":\"Esportazione\",\"link\":\"/it/programmable/cli/exporting\"},{\"text\":\"Analisi design\",\"link\":\"/it/programmable/cli/analyzing\"},{\"text\":\"Confronto dei design\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Controllare l’app\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Scripting\",\"link\":\"/it/programmable/cli/scripting\"},{\"text\":\"Renderer JSX\",\"link\":\"/it/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"Server MCP\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"Chat IA\",\"link\":\"/it/programmable/ai-chat\"},{\"text\":\"Collaborazione\",\"link\":\"/it/programmable/collaboration\"}]}],\"/it/reference/\":[{\"text\":\"Riferimento\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Matrice funzionalità Figma\",\"link\":\"/it/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/it/development/\":[{\"text\":\"Sviluppo\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Architettura\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Stack tecnologico\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/it/\":[{\"text\":\"Panoramica\",\"items\":[{\"text\":\"Per iniziare\",\"link\":\"/it/getting-started\"},{\"text\":\"Funzionalità\",\"link\":\"/it/overview/features\"},{\"text\":\"Confronto\",\"link\":\"/it/overview/comparison\"}]}]}}},\"fr\":{\"label\":\"Français\",\"lang\":\"fr\",\"description\":\"Éditeur de design open-source, IA-natif. Alternative à Figma.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Vue d’ensemble\",\"link\":\"/fr/getting-started\"},{\"text\":\"Guide utilisateur\",\"link\":\"/fr/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/fr/programmable/\"},{\"text\":\"SDK\",\"link\":\"/fr/programmable/sdk/\"},{\"text\":\"Référence\",\"link\":\"/fr/reference/keyboard-shortcuts\"},{\"text\":\"Développement\",\"link\":\"/development/contributing\"},{\"text\":\"Ouvrir l'app\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/fr/user-guide/\":[{\"text\":\"Prise en main\",\"items\":[{\"text\":\"Navigation sur le canevas\",\"link\":\"/fr/user-guide/canvas-navigation\"},{\"text\":\"Sélection et manipulation\",\"link\":\"/fr/user-guide/selection-and-manipulation\"},{\"text\":\"Menu contextuel\",\"link\":\"/fr/user-guide/context-menu\"}]},{\"text\":\"Création de contenu\",\"items\":[{\"text\":\"Dessiner des formes\",\"link\":\"/fr/user-guide/drawing-shapes\"},{\"text\":\"Édition de texte\",\"link\":\"/fr/user-guide/text-editing\"},{\"text\":\"Outil plume\",\"link\":\"/fr/user-guide/pen-tool\"},{\"text\":\"Édition vectorielle\",\"link\":\"/fr/user-guide/vector-edit\"},{\"text\":\"Icônes\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organisation\",\"items\":[{\"text\":\"Calques et pages\",\"link\":\"/fr/user-guide/layers-and-pages\"},{\"text\":\"Exportation\",\"link\":\"/fr/user-guide/exporting\"},{\"text\":\"Stockage cloud\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Avancé\",\"items\":[{\"text\":\"Mise en page auto\",\"link\":\"/fr/user-guide/auto-layout\"},{\"text\":\"Composants\",\"link\":\"/fr/user-guide/components\"},{\"text\":\"Variables\",\"link\":\"/fr/user-guide/variables\"},{\"text\":\"Vérifier les designs\",\"link\":\"/user-guide/checking-designs\"}]}],\"/fr/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/fr/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/fr/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/fr/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/fr/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/fr/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/fr/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/fr/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/fr/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/fr/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/fr/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/fr/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/fr/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/fr/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/fr/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/fr/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/fr/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/fr/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/fr/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/fr/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/fr/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/fr/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/fr/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/fr/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/fr/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/fr/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/fr/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/fr/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/fr/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/fr/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/fr/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/fr/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/fr/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/fr/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/fr/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/fr/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/fr/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/fr/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/fr/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/fr/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/fr/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/fr/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/fr/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/fr/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/fr/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/fr/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/fr/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/fr/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/fr/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/fr/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/fr/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/fr/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/fr/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/fr/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/fr/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/fr/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/fr/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/fr/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/fr/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/fr/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/fr/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/fr/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/fr/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/fr/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/fr/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/fr/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/fr/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/fr/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/fr/programmable/\":[{\"text\":\"Vue d’ensemble\",\"items\":[{\"text\":\"Vue d’ensemble\",\"link\":\"/fr/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Inspecter les fichiers\",\"link\":\"/fr/programmable/cli/inspecting\"},{\"text\":\"Exporter\",\"link\":\"/fr/programmable/cli/exporting\"},{\"text\":\"Analyser les designs\",\"link\":\"/fr/programmable/cli/analyzing\"},{\"text\":\"Comparer des designs\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Piloter l’application\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Scripts\",\"link\":\"/fr/programmable/cli/scripting\"},{\"text\":\"Moteur JSX\",\"link\":\"/fr/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"Serveur MCP\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"Chat IA\",\"link\":\"/fr/programmable/ai-chat\"},{\"text\":\"Collaboration\",\"link\":\"/fr/programmable/collaboration\"}]}],\"/fr/reference/\":[{\"text\":\"Référence\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Matrice des fonctionnalités Figma\",\"link\":\"/fr/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/fr/development/\":[{\"text\":\"Développement\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Architecture\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Stack technique\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/fr/\":[{\"text\":\"Vue d’ensemble\",\"items\":[{\"text\":\"Premiers pas\",\"link\":\"/fr/getting-started\"},{\"text\":\"Fonctionnalités\",\"link\":\"/fr/overview/features\"},{\"text\":\"Comparaison\",\"link\":\"/fr/overview/comparison\"}]}]}}},\"es\":{\"label\":\"Español\",\"lang\":\"es\",\"description\":\"Editor de diseño open-source, IA-nativo. Alternativa a Figma.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Resumen\",\"link\":\"/es/getting-started\"},{\"text\":\"Guía del usuario\",\"link\":\"/es/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/es/programmable/\"},{\"text\":\"SDK\",\"link\":\"/es/programmable/sdk/\"},{\"text\":\"Referencia\",\"link\":\"/es/reference/keyboard-shortcuts\"},{\"text\":\"Desarrollo\",\"link\":\"/development/contributing\"},{\"text\":\"Abrir app\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/es/user-guide/\":[{\"text\":\"Orientación\",\"items\":[{\"text\":\"Navegación del lienzo\",\"link\":\"/es/user-guide/canvas-navigation\"},{\"text\":\"Selección y manipulación\",\"link\":\"/es/user-guide/selection-and-manipulation\"},{\"text\":\"Menú contextual\",\"link\":\"/es/user-guide/context-menu\"}]},{\"text\":\"Crear contenido\",\"items\":[{\"text\":\"Dibujar formas\",\"link\":\"/es/user-guide/drawing-shapes\"},{\"text\":\"Edición de texto\",\"link\":\"/es/user-guide/text-editing\"},{\"text\":\"Herramienta pluma\",\"link\":\"/es/user-guide/pen-tool\"},{\"text\":\"Edición vectorial\",\"link\":\"/es/user-guide/vector-edit\"},{\"text\":\"Iconos\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organizar\",\"items\":[{\"text\":\"Capas y páginas\",\"link\":\"/es/user-guide/layers-and-pages\"},{\"text\":\"Exportar\",\"link\":\"/es/user-guide/exporting\"},{\"text\":\"Almacenamiento en la nube\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Avanzado\",\"items\":[{\"text\":\"Auto-layout\",\"link\":\"/es/user-guide/auto-layout\"},{\"text\":\"Componentes\",\"link\":\"/es/user-guide/components\"},{\"text\":\"Variables\",\"link\":\"/es/user-guide/variables\"},{\"text\":\"Revisar diseños\",\"link\":\"/user-guide/checking-designs\"}]}],\"/es/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/es/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/es/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/es/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/es/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/es/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/es/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/es/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/es/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/es/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/es/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/es/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/es/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/es/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/es/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/es/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/es/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/es/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/es/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/es/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/es/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/es/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/es/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/es/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/es/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/es/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/es/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/es/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/es/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/es/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/es/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/es/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/es/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/es/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/es/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/es/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/es/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/es/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/es/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/es/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/es/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/es/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/es/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/es/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/es/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/es/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/es/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/es/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/es/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/es/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/es/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/es/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/es/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/es/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/es/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/es/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/es/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/es/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/es/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/es/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/es/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/es/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/es/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/es/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/es/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/es/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/es/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/es/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/es/programmable/\":[{\"text\":\"Resumen\",\"items\":[{\"text\":\"Resumen\",\"link\":\"/es/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Inspeccionar archivos\",\"link\":\"/es/programmable/cli/inspecting\"},{\"text\":\"Exportar\",\"link\":\"/es/programmable/cli/exporting\"},{\"text\":\"Analizar diseños\",\"link\":\"/es/programmable/cli/analyzing\"},{\"text\":\"Comparar diseños\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Controlar la app\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Scripts\",\"link\":\"/es/programmable/cli/scripting\"},{\"text\":\"Renderizador JSX\",\"link\":\"/es/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"Servidor MCP\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"Chat IA\",\"link\":\"/es/programmable/ai-chat\"},{\"text\":\"Colaboración\",\"link\":\"/es/programmable/collaboration\"}]}],\"/es/reference/\":[{\"text\":\"Referencia\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Matriz de funcionalidades Figma\",\"link\":\"/es/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/es/development/\":[{\"text\":\"Desarrollo\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Arquitectura\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Stack tecnológico\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/es/\":[{\"text\":\"Resumen\",\"items\":[{\"text\":\"Primeros pasos\",\"link\":\"/es/getting-started\"},{\"text\":\"Características\",\"link\":\"/es/overview/features\"},{\"text\":\"Comparación\",\"link\":\"/es/overview/comparison\"}]}]}}},\"pl\":{\"label\":\"Polski\",\"lang\":\"pl\",\"description\":\"Open-source'owy edytor graficzny z natywnym AI. Alternatywa dla Figmy.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Przegląd\",\"link\":\"/pl/getting-started\"},{\"text\":\"Podręcznik\",\"link\":\"/pl/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/pl/programmable/\"},{\"text\":\"SDK\",\"link\":\"/pl/programmable/sdk/\"},{\"text\":\"Referencja\",\"link\":\"/pl/reference/keyboard-shortcuts\"},{\"text\":\"Rozwój\",\"link\":\"/development/contributing\"},{\"text\":\"Otwórz app\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/pl/user-guide/\":[{\"text\":\"Nawigacja\",\"items\":[{\"text\":\"Nawigacja po płótnie\",\"link\":\"/pl/user-guide/canvas-navigation\"},{\"text\":\"Zaznaczanie i edycja\",\"link\":\"/pl/user-guide/selection-and-manipulation\"},{\"text\":\"Menu kontekstowe\",\"link\":\"/pl/user-guide/context-menu\"}]},{\"text\":\"Tworzenie treści\",\"items\":[{\"text\":\"Rysowanie kształtów\",\"link\":\"/pl/user-guide/drawing-shapes\"},{\"text\":\"Edycja tekstu\",\"link\":\"/pl/user-guide/text-editing\"},{\"text\":\"Narzędzie pióro\",\"link\":\"/pl/user-guide/pen-tool\"},{\"text\":\"Edycja wektorów\",\"link\":\"/pl/user-guide/vector-edit\"},{\"text\":\"Ikony\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Organizacja\",\"items\":[{\"text\":\"Warstwy i strony\",\"link\":\"/pl/user-guide/layers-and-pages\"},{\"text\":\"Eksportowanie\",\"link\":\"/pl/user-guide/exporting\"},{\"text\":\"Przechowywanie w chmurze\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Zaawansowane\",\"items\":[{\"text\":\"Auto-layout\",\"link\":\"/pl/user-guide/auto-layout\"},{\"text\":\"Komponenty\",\"link\":\"/pl/user-guide/components\"},{\"text\":\"Zmienne\",\"link\":\"/pl/user-guide/variables\"},{\"text\":\"Sprawdzanie projektów\",\"link\":\"/user-guide/checking-designs\"}]}],\"/pl/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/pl/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/pl/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/pl/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/pl/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/pl/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/pl/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/pl/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/pl/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/pl/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/pl/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/pl/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/pl/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/pl/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/pl/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/pl/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/pl/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/pl/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/pl/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/pl/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/pl/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/pl/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/pl/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/pl/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/pl/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/pl/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/pl/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/pl/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/pl/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/pl/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/pl/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/pl/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/pl/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/pl/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/pl/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/pl/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/pl/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/pl/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/pl/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/pl/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/pl/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/pl/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/pl/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/pl/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/pl/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/pl/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/pl/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/pl/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/pl/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/pl/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/pl/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/pl/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/pl/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/pl/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/pl/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/pl/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/pl/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/pl/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/pl/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/pl/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/pl/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/pl/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/pl/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/pl/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/pl/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/pl/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/pl/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/pl/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/pl/programmable/\":[{\"text\":\"Przegląd\",\"items\":[{\"text\":\"Przegląd\",\"link\":\"/pl/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Inspekcja plików\",\"link\":\"/pl/programmable/cli/inspecting\"},{\"text\":\"Eksportowanie\",\"link\":\"/pl/programmable/cli/exporting\"},{\"text\":\"Analiza projektów\",\"link\":\"/pl/programmable/cli/analyzing\"},{\"text\":\"Porównywanie projektów\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Sterowanie aplikacją\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Skrypty\",\"link\":\"/pl/programmable/cli/scripting\"},{\"text\":\"Renderer JSX\",\"link\":\"/pl/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"Serwer MCP\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"Czat AI\",\"link\":\"/pl/programmable/ai-chat\"},{\"text\":\"Współpraca\",\"link\":\"/pl/programmable/collaboration\"}]}],\"/pl/reference/\":[{\"text\":\"Referencja\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Matryca funkcji Figma\",\"link\":\"/pl/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/pl/development/\":[{\"text\":\"Rozwój\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Architektura\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Stack technologiczny\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/pl/\":[{\"text\":\"Przegląd\",\"items\":[{\"text\":\"Rozpoczęcie pracy\",\"link\":\"/pl/getting-started\"},{\"text\":\"Funkcje\",\"link\":\"/pl/overview/features\"},{\"text\":\"Porównanie\",\"link\":\"/pl/overview/comparison\"}]}]}}},\"ru\":{\"label\":\"Русский\",\"lang\":\"ru\",\"description\":\"Дизайн-редактор с открытым исходным кодом. Альтернатива Figma с встроенным ИИ.\",\"themeConfig\":{\"i18nRouting\":false,\"nav\":[{\"text\":\"Обзор\",\"link\":\"/ru/getting-started\"},{\"text\":\"Руководство\",\"link\":\"/ru/user-guide/\"},{\"text\":\"Automation\",\"link\":\"/ru/programmable/\"},{\"text\":\"SDK\",\"link\":\"/ru/programmable/sdk/\"},{\"text\":\"Справочник\",\"link\":\"/ru/reference/keyboard-shortcuts\"},{\"text\":\"Разработка\",\"link\":\"/development/contributing\"},{\"text\":\"Открыть приложение\",\"link\":\"https://app.openpencil.dev\"}],\"sidebar\":{\"/ru/user-guide/\":[{\"text\":\"Навигация\",\"items\":[{\"text\":\"Навигация по холсту\",\"link\":\"/ru/user-guide/canvas-navigation\"},{\"text\":\"Выделение и редактирование\",\"link\":\"/ru/user-guide/selection-and-manipulation\"},{\"text\":\"Контекстное меню\",\"link\":\"/ru/user-guide/context-menu\"}]},{\"text\":\"Создание контента\",\"items\":[{\"text\":\"Рисование фигур\",\"link\":\"/ru/user-guide/drawing-shapes\"},{\"text\":\"Редактирование текста\",\"link\":\"/ru/user-guide/text-editing\"},{\"text\":\"Инструмент «Перо»\",\"link\":\"/ru/user-guide/pen-tool\"},{\"text\":\"Редактирование векторов\",\"link\":\"/ru/user-guide/vector-edit\"},{\"text\":\"Иконки\",\"link\":\"/user-guide/icons\"}]},{\"text\":\"Организация\",\"items\":[{\"text\":\"Слои и страницы\",\"link\":\"/ru/user-guide/layers-and-pages\"},{\"text\":\"Экспорт\",\"link\":\"/ru/user-guide/exporting\"},{\"text\":\"Облачное хранилище\",\"link\":\"/user-guide/cloud-storage\"}]},{\"text\":\"Продвинутые функции\",\"items\":[{\"text\":\"Авто-раскладка\",\"link\":\"/ru/user-guide/auto-layout\"},{\"text\":\"Компоненты\",\"link\":\"/ru/user-guide/components\"},{\"text\":\"Переменные\",\"link\":\"/ru/user-guide/variables\"},{\"text\":\"Проверка дизайна\",\"link\":\"/user-guide/checking-designs\"}]}],\"/ru/programmable/sdk/\":[{\"text\":\"Vue SDK\",\"items\":[{\"text\":\"Overview\",\"link\":\"/ru/programmable/sdk/\"},{\"text\":\"Getting Started\",\"link\":\"/ru/programmable/sdk/getting-started\"},{\"text\":\"Architecture\",\"link\":\"/ru/programmable/sdk/architecture\"},{\"text\":\"Custom Shell\",\"link\":\"/ru/programmable/sdk/guides/custom-editor-shell\"},{\"text\":\"Property Panels\",\"link\":\"/ru/programmable/sdk/guides/property-panels\"},{\"text\":\"Navigation Panels\",\"link\":\"/ru/programmable/sdk/guides/navigation-panels\"},{\"text\":\"API Reference\",\"items\":[{\"text\":\"Overview\",\"link\":\"/ru/programmable/sdk/api/\"},{\"text\":\"Components\",\"items\":[{\"text\":\"Overview\",\"link\":\"/ru/programmable/sdk/api/components/\"},{\"text\":\"CanvasRoot\",\"link\":\"/ru/programmable/sdk/api/components/canvas-root\"},{\"text\":\"CanvasSurface\",\"link\":\"/ru/programmable/sdk/api/components/canvas-surface\"},{\"text\":\"LayerTreeRoot\",\"link\":\"/ru/programmable/sdk/api/components/layer-tree-root\"},{\"text\":\"LayerTreeItem\",\"link\":\"/ru/programmable/sdk/api/components/layer-tree-item\"},{\"text\":\"ToolbarRoot\",\"link\":\"/ru/programmable/sdk/api/components/toolbar-root\"},{\"text\":\"ToolbarItem\",\"link\":\"/ru/programmable/sdk/api/components/toolbar-item\"},{\"text\":\"PageListRoot\",\"link\":\"/ru/programmable/sdk/api/components/page-list-root\"},{\"text\":\"PropertySection\",\"link\":\"/programmable/sdk/api/components/property-section\"},{\"text\":\"PropertyGrid\",\"link\":\"/programmable/sdk/api/components/property-grid\"},{\"text\":\"SegmentedControl\",\"link\":\"/programmable/sdk/api/components/segmented-control\"},{\"text\":\"PropertyListRoot\",\"link\":\"/ru/programmable/sdk/api/components/property-list-root\"},{\"text\":\"PropertyListItem\",\"link\":\"/ru/programmable/sdk/api/components/property-list-item\"},{\"text\":\"ColorPickerRoot\",\"link\":\"/programmable/sdk/api/components/color-picker-root\"},{\"text\":\"ColorInputRoot\",\"link\":\"/ru/programmable/sdk/api/components/color-input-root\"},{\"text\":\"ChannelSlider\",\"link\":\"/programmable/sdk/api/components/channel-slider\"},{\"text\":\"FillRoot\",\"link\":\"/programmable/sdk/api/components/fill-root\"},{\"text\":\"FillSwatch\",\"link\":\"/programmable/sdk/api/components/fill-swatch\"},{\"text\":\"FontPickerRoot\",\"link\":\"/ru/programmable/sdk/api/components/font-picker-root\"},{\"text\":\"GradientEditorRoot\",\"link\":\"/ru/programmable/sdk/api/components/gradient-editor-root\"},{\"text\":\"GradientEditorBar\",\"link\":\"/ru/programmable/sdk/api/components/gradient-editor-bar\"},{\"text\":\"GradientEditorStop\",\"link\":\"/programmable/sdk/api/components/gradient-editor-stop\"},{\"text\":\"NumberField\",\"link\":\"/programmable/sdk/api/components/number-field\"},{\"text\":\"BindableValue\",\"link\":\"/programmable/sdk/api/components/bindable-value\"},{\"text\":\"LayoutControlsRoot\",\"link\":\"/ru/programmable/sdk/api/components/layout-controls-root\"},{\"text\":\"ConstraintsControlRoot\",\"link\":\"/programmable/sdk/api/components/constraints-control-root\"},{\"text\":\"AppearanceControlsRoot\",\"link\":\"/ru/programmable/sdk/api/components/appearance-controls-root\"},{\"text\":\"PositionControlsRoot\",\"link\":\"/ru/programmable/sdk/api/components/position-controls-root\"},{\"text\":\"TypographyControlsRoot\",\"link\":\"/ru/programmable/sdk/api/components/typography-controls-root\"}]},{\"text\":\"Composables\",\"items\":[{\"text\":\"Overview\",\"link\":\"/ru/programmable/sdk/api/composables/\"},{\"text\":\"provideEditor\",\"link\":\"/ru/programmable/sdk/api/composables/provide-editor\"},{\"text\":\"useEditor\",\"link\":\"/ru/programmable/sdk/api/composables/use-editor\"},{\"text\":\"useCanvas\",\"link\":\"/ru/programmable/sdk/api/composables/use-canvas\"},{\"text\":\"useCanvasInput\",\"link\":\"/ru/programmable/sdk/api/composables/use-canvas-input\"},{\"text\":\"useTextEdit\",\"link\":\"/ru/programmable/sdk/api/composables/use-text-edit\"},{\"text\":\"useSelectionState\",\"link\":\"/ru/programmable/sdk/api/composables/use-selection-state\"},{\"text\":\"useSelectionCapabilities\",\"link\":\"/ru/programmable/sdk/api/composables/use-selection-capabilities\"},{\"text\":\"useEditorCommands\",\"link\":\"/ru/programmable/sdk/api/composables/use-editor-commands\"},{\"text\":\"useMenuModel\",\"link\":\"/ru/programmable/sdk/api/composables/use-menu-model\"},{\"text\":\"usePosition\",\"link\":\"/ru/programmable/sdk/api/composables/use-position\"},{\"text\":\"useLayout\",\"link\":\"/ru/programmable/sdk/api/composables/use-layout\"},{\"text\":\"useConstraints\",\"link\":\"/programmable/sdk/api/composables/use-constraints\"},{\"text\":\"useComponentProperties\",\"link\":\"/programmable/sdk/api/composables/use-component-properties\"},{\"text\":\"useAppearance\",\"link\":\"/ru/programmable/sdk/api/composables/use-appearance\"},{\"text\":\"useSharedStyleBinding\",\"link\":\"/programmable/sdk/api/composables/use-shared-style-binding\"},{\"text\":\"useColorModel\",\"link\":\"/programmable/sdk/api/composables/use-color-model\"},{\"text\":\"useTypography\",\"link\":\"/ru/programmable/sdk/api/composables/use-typography\"},{\"text\":\"useExport\",\"link\":\"/ru/programmable/sdk/api/composables/use-export\"},{\"text\":\"useFillControls\",\"link\":\"/ru/programmable/sdk/api/composables/use-fill-controls\"},{\"text\":\"useStrokeControls\",\"link\":\"/ru/programmable/sdk/api/composables/use-stroke-controls\"},{\"text\":\"useEffectsControls\",\"link\":\"/ru/programmable/sdk/api/composables/use-effects-controls\"},{\"text\":\"useMask\",\"link\":\"/programmable/sdk/api/composables/use-mask\"},{\"text\":\"useDocumentWorkspace\",\"link\":\"/programmable/sdk/api/composables/use-document-workspace\"},{\"text\":\"usePageList\",\"link\":\"/ru/programmable/sdk/api/composables/use-page-list\"},{\"text\":\"useI18n\",\"link\":\"/ru/programmable/sdk/api/composables/use-i18n\"}]},{\"text\":\"Advanced\",\"items\":[{\"text\":\"Overview\",\"link\":\"/ru/programmable/sdk/api/advanced/\"},{\"text\":\"useNodeProps\",\"link\":\"/ru/programmable/sdk/api/advanced/use-node-props\"},{\"text\":\"useSceneComputed\",\"link\":\"/ru/programmable/sdk/api/advanced/use-scene-computed\"},{\"text\":\"useColorVariableBinding\",\"link\":\"/ru/programmable/sdk/api/advanced/use-color-variable-binding\"},{\"text\":\"useColorBindingProvider\",\"link\":\"/programmable/sdk/api/advanced/use-color-binding-provider\"},{\"text\":\"useGradientStops\",\"link\":\"/ru/programmable/sdk/api/advanced/use-gradient-stops\"},{\"text\":\"useFontPicker\",\"link\":\"/ru/programmable/sdk/api/advanced/use-font-picker\"},{\"text\":\"usePropScrub\",\"link\":\"/ru/programmable/sdk/api/advanced/use-prop-scrub\"},{\"text\":\"useLayerDrag\",\"link\":\"/ru/programmable/sdk/api/advanced/use-layer-drag\"},{\"text\":\"useInlineRename\",\"link\":\"/ru/programmable/sdk/api/advanced/use-inline-rename\"},{\"text\":\"useToolbarState\",\"link\":\"/ru/programmable/sdk/api/advanced/use-toolbar-state\"},{\"text\":\"useNodeFontStatus\",\"link\":\"/ru/programmable/sdk/api/advanced/use-node-font-status\"},{\"text\":\"useCanvasDrop\",\"link\":\"/ru/programmable/sdk/api/advanced/use-canvas-drop\"},{\"text\":\"extractImageFilesFromClipboard\",\"link\":\"/ru/programmable/sdk/api/advanced/extract-image-files-from-clipboard\"},{\"text\":\"toolCursor\",\"link\":\"/ru/programmable/sdk/api/advanced/tool-cursor\"},{\"text\":\"useCanvasContext\",\"link\":\"/ru/programmable/sdk/api/advanced/use-canvas-context\"},{\"text\":\"useLayerTree\",\"link\":\"/ru/programmable/sdk/api/advanced/use-layer-tree\"},{\"text\":\"useToolbar\",\"link\":\"/ru/programmable/sdk/api/advanced/use-toolbar\"},{\"text\":\"usePropertyList\",\"link\":\"/ru/programmable/sdk/api/advanced/use-property-list\"},{\"text\":\"useNumberField\",\"link\":\"/programmable/sdk/api/advanced/use-number-field\"},{\"text\":\"useOkHCL\",\"link\":\"/ru/programmable/sdk/api/advanced/use-okhcl\"},{\"text\":\"useVariables\",\"link\":\"/ru/programmable/sdk/api/advanced/use-variables\"},{\"text\":\"Locale APIs\",\"link\":\"/ru/programmable/sdk/api/advanced/locale-apis\"},{\"text\":\"useViewportKind\",\"link\":\"/ru/programmable/sdk/api/advanced/use-viewport-kind\"}]}]}]}],\"/ru/programmable/\":[{\"text\":\"Обзор\",\"items\":[{\"text\":\"Обзор\",\"link\":\"/ru/programmable/\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Инспекция файлов\",\"link\":\"/ru/programmable/cli/inspecting\"},{\"text\":\"Экспорт\",\"link\":\"/ru/programmable/cli/exporting\"},{\"text\":\"Анализ дизайна\",\"link\":\"/ru/programmable/cli/analyzing\"},{\"text\":\"Сравнение дизайнов\",\"link\":\"/programmable/cli/comparing\"},{\"text\":\"Управление приложением\",\"link\":\"/programmable/cli/app-control\"},{\"text\":\"Скрипты\",\"link\":\"/ru/programmable/cli/scripting\"},{\"text\":\"JSX-рендерер\",\"link\":\"/ru/programmable/jsx-renderer\"},{\"text\":\"Native JavaScript APIs\",\"link\":\"/programmable/native-api\"},{\"text\":\"Design authoring reference\",\"link\":\"/reference/design-authoring\"},{\"text\":\"MCP-сервер\",\"link\":\"/programmable/mcp-server\"},{\"text\":\"ИИ-чат\",\"link\":\"/ru/programmable/ai-chat\"},{\"text\":\"Совместная работа\",\"link\":\"/ru/programmable/collaboration\"}]}],\"/ru/reference/\":[{\"text\":\"Справочник\",\"items\":[{\"text\":\"Keyboard Shortcuts\",\"link\":\"/reference/keyboard-shortcuts\"},{\"text\":\"CLI\",\"link\":\"/reference/cli\"},{\"text\":\"Node Types\",\"link\":\"/reference/node-types\"},{\"text\":\"Scene Graph\",\"link\":\"/reference/scene-graph\"},{\"text\":\"Матрица функций Figma\",\"link\":\"/ru/reference/figma-compatibility\"},{\"text\":\"File Format\",\"link\":\"/reference/file-format\"}]}],\"/ru/development/\":[{\"text\":\"Разработка\",\"items\":[{\"text\":\"Contributing\",\"link\":\"/development/contributing\"},{\"text\":\"Testing\",\"link\":\"/development/testing\"},{\"text\":\"Архитектура\",\"link\":\"/development/architecture\"},{\"text\":\".fig Reader Architecture\",\"link\":\"/development/fig-reader\"},{\"text\":\"Технологии\",\"link\":\"/development/tech-stack\"},{\"text\":\"Roadmap\",\"link\":\"/development/roadmap\"},{\"text\":\"Behaviours and Preview\",\"link\":\"/development/behaviours-and-preview\"},{\"text\":\"Navigation Performance\",\"link\":\"/development/navigation-performance\"},{\"text\":\"Renderer Lifecycle\",\"link\":\"/development/renderer-lifecycle\"},{\"text\":\"Renderer Profiler\",\"link\":\"/development/renderer-profiler\"},{\"text\":\"Vector Conversion\",\"link\":\"/development/vector-conversion\"}]}],\"/ru/\":[{\"text\":\"Обзор\",\"items\":[{\"text\":\"Начало работы\",\"link\":\"/ru/getting-started\"},{\"text\":\"Возможности\",\"link\":\"/ru/overview/features\"},{\"text\":\"Сравнение\",\"link\":\"/ru/overview/comparison\"}]}]}}}},\"cleanUrls\":true,\"additionalConfig\":{}}"));
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/data.js
var dataSymbol = Symbol();
var siteDataRef = shallowRef(readonly(_siteData_default));
function initData(route) {
	const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath, route.data.filePath));
	const appearance = site.value.appearance;
	const isDark = appearance === "force-dark" ? ref(true) : appearance === "force-auto" ? usePreferredDark() : appearance ? useDark({
		storageKey: APPEARANCE_KEY,
		initialValue: () => appearance === "dark" ? "dark" : "auto",
		...typeof appearance === "object" ? appearance : {}
	}) : ref(false);
	return {
		site,
		theme: computed(() => site.value.themeConfig),
		page: computed(() => route.data),
		frontmatter: computed(() => route.data.frontmatter),
		params: computed(() => route.data.params),
		lang: computed(() => site.value.lang),
		dir: computed(() => route.data.frontmatter.dir || site.value.dir),
		localeIndex: computed(() => site.value.localeIndex || "root"),
		title: computed(() => createTitle(site.value, route.data)),
		description: computed(() => route.data.description || site.value.description),
		isDark
	};
}
function useData$1() {
	const data = inject(dataSymbol);
	if (!data) throw new Error("vitepress data not properly injected in app");
	return data;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/utils.js
/**
* Join two paths by resolving the slash collision.
*/
function joinPath(base, path) {
	return `${base}${path}`.replace(/\/+/g, "/");
}
/**
* Prepend base to internal (non-relative) urls
*/
function withBase(path) {
	return EXTERNAL_URL_RE.test(path) || !path.startsWith("/") ? path : joinPath(siteDataRef.value.base, path);
}
/**
* Converts a url path to the corresponding js chunk filename.
*/
function pathToFile(path) {
	let pagePath = path.replace(/\.html$/, "");
	pagePath = decodeURIComponent(pagePath);
	pagePath = pagePath.replace(/\/$/, "/index");
	if (inBrowser) {
		const base = "/";
		pagePath = sanitizeFileName(pagePath.slice(1).replace(/\//g, "_") || "index") + ".md";
		let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		if (!pageHash) {
			pagePath = pagePath.endsWith("_index.md") ? pagePath.slice(0, -9) + ".md" : pagePath.slice(0, -3) + "_index.md";
			pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
		}
		if (!pageHash) return null;
		pagePath = `${base}assets/${pagePath}.${pageHash}.js`;
	} else pagePath = `./${sanitizeFileName(pagePath.slice(1).replace(/\//g, "_"))}.md.js`;
	return pagePath;
}
var contentUpdatedCallbacks = [];
/**
* Register callback that is called every time the markdown content is updated
* in the DOM.
*/
function onContentUpdated(fn) {
	contentUpdatedCallbacks.push(fn);
	tryOnUnmounted(() => {
		contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn);
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/components/Content.js
var runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn());
var Content = defineComponent({
	name: "VitePressContent",
	props: { as: {
		type: [Object, String],
		default: "div"
	} },
	setup(props) {
		const { frontmatter, site } = useData$1();
		const route = useRoute();
		watch(frontmatter, runCbs, {
			deep: true,
			flush: "post"
		});
		return () => h(props.as, site.value.contentProps ?? { style: { position: "relative" } }, [route.component ? h(route.component, {
			onVnodeMounted: runCbs,
			onVnodeUpdated: runCbs,
			onVnodeUnmounted: runCbs
		}) : "404 Page Not Found"]);
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/router.js
var RouterSymbol = Symbol();
var fakeHost = "http://a.com";
var getDefaultRoute = () => ({
	path: "/",
	hash: "",
	query: "",
	component: null,
	data: notFoundPageData
});
function createRouter(loadPageModule, fallbackComponent) {
	const route = reactive(getDefaultRoute());
	const router = {
		route,
		async go(href, options) {
			const { hash } = new URL(href, fakeHost);
			const hasTextFragment = inBrowser && document.fragmentDirective && hash.includes(":~:");
			href = normalizeHref(href);
			if (await router.onBeforeRouteChange?.(href) === false) return;
			if (!inBrowser || await changeRoute(href, {
				...options,
				hasTextFragment
			})) await loadPage(href, { initialLoad: !!options?.initialLoad });
			if (hasTextFragment) location.hash = hash;
			syncRouteQueryAndHash();
			await router.onAfterRouteChange?.(href);
		}
	};
	let latestPendingPath = null;
	async function loadPage(href, { scrollPosition = 0, isRetry = false, initialLoad = false } = {}) {
		if (await router.onBeforePageLoad?.(href) === false) return;
		const targetLoc = new URL(href, fakeHost);
		const pendingPath = latestPendingPath = targetLoc.pathname;
		try {
			let page = await loadPageModule(pendingPath);
			if (!page) throw new Error(`Page not found: ${pendingPath}`);
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				const { default: comp, __pageData } = page;
				if (!comp) throw new Error(`Invalid route component: ${comp}`);
				await router.onAfterPageLoad?.(href);
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = markRaw(comp);
				route.data = markRaw(__pageData);
				syncRouteQueryAndHash(targetLoc);
				if (inBrowser) nextTick(() => {
					let actualPathname = siteDataRef.value.base + __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, "$1");
					if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith("/")) actualPathname += ".html";
					if (actualPathname !== targetLoc.pathname) {
						targetLoc.pathname = actualPathname;
						href = actualPathname + targetLoc.search + targetLoc.hash;
						history.replaceState({}, "", href);
					}
					if (!initialLoad) scrollTo(targetLoc.hash, scrollPosition);
				});
			}
		} catch (err) {
			if (!/fetch|Page not found/.test(err.message) && !/^\/404(\.html|\/)?$/.test(href)) console.error(err);
			if (!isRetry) try {
				const res = await fetch(siteDataRef.value.base + "hashmap.json");
				window.__VP_HASH_MAP__ = await res.json();
				await loadPage(href, {
					scrollPosition,
					isRetry: true,
					initialLoad
				});
				return;
			} catch (e) {}
			if (latestPendingPath === pendingPath) {
				latestPendingPath = null;
				route.path = inBrowser ? pendingPath : withBase(pendingPath);
				route.component = fallbackComponent ? markRaw(fallbackComponent) : null;
				const relativePath = inBrowser ? route.path.replace(/(^|\/)$/, "$1index").replace(/(\.html)?$/, ".md").slice(siteDataRef.value.base.length) : "404.md";
				route.data = {
					...notFoundPageData,
					relativePath
				};
				syncRouteQueryAndHash(targetLoc);
			}
		}
	}
	function syncRouteQueryAndHash(loc = inBrowser ? location : {
		search: "",
		hash: ""
	}) {
		route.query = loc.search;
		route.hash = decodeURIComponent(loc.hash);
	}
	if (inBrowser) {
		if (history.state === null) history.replaceState({}, "");
		window.addEventListener("click", (e) => {
			if (e.defaultPrevented || !(e.target instanceof Element) || e.target.closest("button") || e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
			const link = e.target.closest("a");
			if (!link || link.closest(".vp-raw") || link.hasAttribute("download") || link.hasAttribute("target")) return;
			const linkHref = link.getAttribute("href") ?? (link instanceof SVGAElement ? link.getAttribute("xlink:href") : null);
			if (linkHref == null) return;
			const { href, origin, pathname } = new URL(linkHref, link.baseURI);
			if (origin === new URL(location.href).origin && treatAsHtml(pathname)) {
				e.preventDefault();
				router.go(href);
			}
		}, { capture: true });
		window.addEventListener("popstate", async (e) => {
			if (e.state === null) return;
			const href = normalizeHref(location.href);
			await loadPage(href, { scrollPosition: e.state.scrollPosition || 0 });
			syncRouteQueryAndHash();
			await router.onAfterRouteChange?.(href);
		});
		window.addEventListener("hashchange", (e) => {
			e.preventDefault();
			syncRouteQueryAndHash();
		});
	}
	return router;
}
function useRouter() {
	const router = inject(RouterSymbol);
	if (!router) throw new Error("useRouter() is called without provider.");
	return router;
}
function useRoute() {
	return useRouter().route;
}
function scrollTo(hash, scrollPosition = 0) {
	if (!hash || scrollPosition) {
		window.scrollTo(0, scrollPosition);
		return;
	}
	let target = null;
	try {
		target = document.getElementById(decodeURIComponent(hash).slice(1));
	} catch (e) {
		console.warn(e);
	}
	if (!target) return;
	const scrollToTarget = () => {
		target.scrollIntoView({ block: "start" });
		target.focus({ preventScroll: true });
		if (document.activeElement === target) return;
		if (target.hasAttribute("tabindex")) return;
		const restoreTabindex = () => {
			target.removeAttribute("tabindex");
			target.removeEventListener("blur", restoreTabindex);
		};
		target.setAttribute("tabindex", "-1");
		target.addEventListener("blur", restoreTabindex);
		target.focus({ preventScroll: true });
		if (document.activeElement !== target) restoreTabindex();
	};
	requestAnimationFrame(scrollToTarget);
}
function normalizeHref(href) {
	const url = new URL(href, fakeHost);
	url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, "$1");
	if (siteDataRef.value.cleanUrls) url.pathname = url.pathname.replace(/\.html$/, "");
	else if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) url.pathname += ".html";
	return url.pathname + url.search + url.hash.split(":~:")[0];
}
async function changeRoute(href, { initialLoad = false, replace = false, hasTextFragment = false } = {}) {
	const loc = normalizeHref(location.href);
	const nextUrl = new URL(href, location.origin);
	const currentUrl = new URL(loc, location.origin);
	if (href === loc) {
		if (!initialLoad) {
			if (!hasTextFragment) scrollTo(nextUrl.hash);
			return false;
		}
	} else {
		if (replace) history.replaceState({}, "", href);
		else {
			history.replaceState({ scrollPosition: window.scrollY }, "");
			history.pushState({}, "", href);
		}
		if (nextUrl.pathname === currentUrl.pathname) {
			if (nextUrl.hash !== currentUrl.hash) {
				window.dispatchEvent(new HashChangeEvent("hashchange", {
					oldURL: currentUrl.href,
					newURL: nextUrl.href
				}));
				if (!hasTextFragment) scrollTo(nextUrl.hash);
			}
			return false;
		}
	}
	return true;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/data.js
var useData = useData$1;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/support/utils.js
function throttleAndDebounce(fn, delay) {
	let timeoutId;
	let called = false;
	return () => {
		if (timeoutId) clearTimeout(timeoutId);
		if (!called) {
			fn();
			(called = true) && setTimeout(() => called = false, delay);
		} else timeoutId = setTimeout(fn, delay);
	};
}
function ensureStartingSlash(path) {
	return path.startsWith("/") ? path : `/${path}`;
}
function isLinkExternal(href, target, external) {
	if (external !== void 0) return external;
	return !!href && isExternal(href) || target === "_blank";
}
function normalizeLink$1(url) {
	const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
	if (isExternal(url) || url.startsWith("#") || !protocol.startsWith("http") || !treatAsHtml(pathname)) return url;
	const { site } = useData();
	return withBase(pathname.endsWith("/") || pathname.endsWith(".html") ? url : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")}${search}${hash}`));
}
function uniqBy(array, keyFn) {
	const seen = /* @__PURE__ */ new Set();
	return array.filter((item) => {
		const k = keyFn(item);
		return seen.has(k) ? false : seen.add(k);
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/langs.js
function useLangs({ linkToCorrespondingPage = false } = {}) {
	const data = useData();
	const route = useRoute();
	const { site, localeIndex } = data;
	const currentLang = computed(() => ({
		label: site.value.locales[localeIndex.value]?.label,
		link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === "root" ? "/" : `/${localeIndex.value}/`)
	}));
	return {
		currentLang,
		localeLinks: computed(() => Object.entries(site.value.locales).flatMap(([key, value]) => currentLang.value.label === value.label ? [] : {
			text: value.label,
			link: resolveLocaleLink(data, route, {
				targetLocale: key,
				targetLocaleLink: value.link || (key === "root" ? "/" : `/${key}/`),
				currentLocaleLink: currentLang.value.link,
				linkToCorrespondingPage
			}),
			lang: value.lang,
			dir: value.dir
		}))
	};
}
/**
* Resolves the link used for switching from the current page to
* `targetLocale`. Without `linkToCorrespondingPage`, this is simply the home
* of the target locale. With it, the current page's path is rewritten into
* the target locale (honoring `cleanUrls`) — unless
* `themeConfig.i18nRouting` is `false` (the locale home is used instead) or
* a function (which then fully controls the resolution).
*
* The current query and hash are carried over, except when a custom
* `i18nRouting` function is used.
*/
function resolveLocaleLink(data, route, { targetLocale, targetLocaleLink, currentLocaleLink, linkToCorrespondingPage }) {
	const { site, theme } = data;
	const i18nRouting = theme.value.i18nRouting;
	if (linkToCorrespondingPage && typeof i18nRouting === "function") return i18nRouting(data, route, targetLocale);
	return normalizeLink(targetLocaleLink, i18nRouting !== false && linkToCorrespondingPage, route.data.relativePath.slice(currentLocaleLink.length - 1), !site.value.cleanUrls) + route.query + route.hash;
}
function normalizeLink(localeLink, appendPagePath, pagePath, addHtmlExt) {
	return appendPagePath ? localeLink.replace(/\/$/, "") + ensureStartingSlash(pagePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, addHtmlExt ? ".html" : "")) : localeLink;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/NotFound.vue?vue&type=script&setup=true&lang.ts
var NotFound_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "NotFound",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { currentLang } = useLangs();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "NotFound" }, _attrs))} data-v-fe6804a0><p class="code" data-v-fe6804a0>${ssrInterpolate(unref(theme).notFound?.code ?? "404")}</p><h1 class="title" data-v-fe6804a0>${ssrInterpolate(unref(theme).notFound?.title ?? "PAGE NOT FOUND")}</h1><div class="divider" data-v-fe6804a0></div><blockquote class="quote" data-v-fe6804a0>${ssrInterpolate(unref(theme).notFound?.quote ?? "But if you don't change your direction, and if you keep looking, you may end up where you are heading.")}</blockquote><div class="action" data-v-fe6804a0><a class="link"${ssrRenderAttr("href", unref(withBase)(unref(theme).notFound?.link ?? unref(currentLang).link))}${ssrRenderAttr("aria-label", unref(theme).notFound?.linkLabel ?? "go to home")} data-v-fe6804a0>${ssrInterpolate(unref(theme).notFound?.linkText ?? "Take me home")}</a></div></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/NotFound.vue
var _sfc_setup$79 = NotFound_vue_vue_type_script_setup_true_lang_default.setup;
NotFound_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/NotFound.vue");
	return _sfc_setup$79 ? _sfc_setup$79(props, ctx) : void 0;
};
var NotFound_default = /*#__PURE__*/ _plugin_vue_export_helper_default(NotFound_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-fe6804a0"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/support/sidebar.js
/**
* Get the `Sidebar` from sidebar option. This method will ensure to get correct
* sidebar config from `MultiSideBarConfig` with various path combinations such
* as matching `guide/` and `/guide/`. If no matching config was found, it will
* return empty array.
*/
function getSidebar(_sidebar, path) {
	if (Array.isArray(_sidebar)) return addBase(_sidebar);
	if (_sidebar == null) return [];
	path = ensureStartingSlash(path);
	const dir = Object.keys(_sidebar).sort((a, b) => {
		return b.split("/").length - a.split("/").length;
	}).find((dir) => {
		return path.startsWith(ensureStartingSlash(dir));
	});
	const sidebar = dir ? _sidebar[dir] : [];
	return Array.isArray(sidebar) ? addBase(sidebar) : addBase(sidebar.items, sidebar.base);
}
/**
* Get or generate sidebar group from the given sidebar items.
*/
function getSidebarGroups(sidebar) {
	const groups = [];
	let lastGroupIndex = 0;
	for (const index in sidebar) {
		const item = sidebar[index];
		if (item.items) {
			lastGroupIndex = groups.push(item);
			continue;
		}
		if (!groups[lastGroupIndex]) groups.push({ items: [] });
		groups[lastGroupIndex].items.push(item);
	}
	return groups;
}
function getFlatSideBarLinks(sidebar) {
	const links = [];
	function recursivelyExtractLinks(items) {
		for (const item of items) {
			if (item.text && item.link) links.push({
				text: item.text,
				link: item.link,
				docFooterText: item.docFooterText,
				rel: item.rel,
				target: item.target
			});
			if (item.items) recursivelyExtractLinks(item.items);
		}
	}
	recursivelyExtractLinks(sidebar);
	return links;
}
/**
* Check if the given sidebar item contains any active link.
*/
function hasActiveLink(path, hash, items) {
	if (Array.isArray(items)) return items.some((item) => hasActiveLink(path, hash, item));
	if (items.link && isActive(path, hash, items.link)) return true;
	if (items.items) return hasActiveLink(path, hash, items.items);
	return false;
}
function addBase(items, _base) {
	return [...items].map((_item) => {
		const item = { ..._item };
		const base = item.base || _base;
		if (base && item.link && !isExternal(item.link)) item.link = base + item.link.replace(/^\//, base.endsWith("/") ? "" : "/");
		if (item.items) item.items = addBase(item.items, base);
		return item;
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/aside.js
function useAside() {
	const { hasSidebar } = useLayout();
	const is960 = useMediaQuery("(min-width: 960px)");
	const is1280 = useMediaQuery("(min-width: 1280px)");
	return { isAsideEnabled: computed(() => {
		if (!is1280.value && !is960.value) return false;
		return hasSidebar.value ? is1280.value : is960.value;
	}) };
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/outline.js
var ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;
var resolvedHeaders = [];
function resolveTitle(theme) {
	return typeof theme.outline === "object" && !Array.isArray(theme.outline) && theme.outline.label || "On this page";
}
function getHeaders(range) {
	return resolveHeaders([...document.querySelectorAll(".VPDoc h1, .VPDoc h2, .VPDoc h3, .VPDoc h4, .VPDoc h5, .VPDoc h6")].filter((el) => el.id && el.hasChildNodes()).map((el) => {
		const level = Number(el.tagName[1]);
		return {
			element: el,
			title: serializeHeader(el),
			link: "#" + el.id,
			level
		};
	}), range);
}
function serializeHeader(h) {
	let ret = "";
	for (const node of h.childNodes) if (node.nodeType === 1) {
		if (ignoreRE.test(node.className)) continue;
		ret += node.textContent;
	} else if (node.nodeType === 3) ret += node.textContent;
	return ret.trim();
}
function resolveHeaders(headers, range) {
	if (range === false) return [];
	const levelsRange = (typeof range === "object" && !Array.isArray(range) ? range.level : range) || 2;
	const [high, low] = typeof levelsRange === "number" ? [levelsRange, levelsRange] : levelsRange === "deep" ? [2, 6] : levelsRange;
	return buildTree(headers, high, low);
}
function useActiveAnchor(container, marker) {
	const { isAsideEnabled } = useAside();
	const onScroll = throttleAndDebounce(setActiveLink, 100);
	let prevActiveLink = null;
	let ignoreScrollOnce = false;
	onMounted(() => {
		requestAnimationFrame(setActiveLink);
		window.addEventListener("scroll", onScroll);
		container.value.addEventListener("click", onClick);
	});
	onUpdated(() => {
		activateLink(location.hash);
	});
	onUnmounted(() => {
		window.removeEventListener("scroll", onScroll);
	});
	function onClick(e) {
		if (!isAsideEnabled.value) return;
		const hash = e.target instanceof Element ? e.target.closest("a")?.hash : null;
		if (hash) {
			ignoreScrollOnce = true;
			activateLink(hash);
		}
	}
	function setActiveLink() {
		if (!isAsideEnabled.value) return;
		if (ignoreScrollOnce) {
			ignoreScrollOnce = false;
			return;
		}
		const scrollY = window.scrollY;
		const innerHeight = window.innerHeight;
		const offsetHeight = document.body.offsetHeight;
		const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1;
		const headers = resolvedHeaders.map(({ element, link }) => ({
			link,
			top: getAbsoluteTop(element),
			scrollMarginTop: Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
		})).filter(({ top }) => !Number.isNaN(top)).sort((a, b) => a.top - b.top);
		if (!headers.length) {
			activateLink(null);
			return;
		}
		if (scrollY < 1) {
			activateLink(null);
			return;
		}
		if (isBottom) {
			activateLink(headers[headers.length - 1].link);
			return;
		}
		let activeLink = null;
		for (const { link, top, scrollMarginTop } of headers) {
			if (top > scrollY + scrollMarginTop + 4) break;
			activeLink = link;
		}
		activateLink(activeLink);
	}
	function activateLink(hash) {
		if (prevActiveLink) prevActiveLink.classList.remove("active");
		if (hash == null) prevActiveLink = null;
		else prevActiveLink = container.value.querySelector(`a[href$="${decodeURIComponent(hash)}"]`);
		const activeLink = prevActiveLink;
		if (activeLink) {
			activeLink.classList.add("active");
			marker.value.style.top = activeLink.offsetTop + 39 + "px";
			marker.value.style.opacity = "1";
		} else {
			marker.value.style.top = "33px";
			marker.value.style.opacity = "0";
		}
	}
}
function getAbsoluteTop(element) {
	let offsetTop = 0;
	while (element !== document.body) {
		if (element === null) return NaN;
		offsetTop += element.offsetTop;
		element = element.offsetParent;
	}
	return offsetTop;
}
function buildTree(data, min, max) {
	resolvedHeaders.length = 0;
	const result = [];
	const stack = [];
	data.forEach((item) => {
		const node = {
			...item,
			children: []
		};
		let parent = stack[stack.length - 1];
		while (parent && parent.level >= node.level) {
			stack.pop();
			parent = stack[stack.length - 1];
		}
		if (node.element.classList.contains("ignore-header") || parent && "shouldIgnore" in parent) {
			stack.push({
				level: node.level,
				shouldIgnore: true
			});
			return;
		}
		if (node.level > max || node.level < min) return;
		resolvedHeaders.push({
			element: node.element,
			link: node.link
		});
		if (parent) parent.children.push(node);
		else result.push(node);
		stack.push(node);
	});
	return result;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/sidebar.js
var isOpen = ref(false);
/**
* a11y: cache the element that opened the Sidebar (the menu button) then
* focus that button again when Menu is closed with Escape key.
*/
function useCloseSidebarOnEscape(close) {
	let triggerElement;
	watchEffect(() => {
		triggerElement = isOpen.value ? document.activeElement : void 0;
	});
	onMounted(() => {
		window.addEventListener("keyup", onEscape);
	});
	onUnmounted(() => {
		window.removeEventListener("keyup", onEscape);
	});
	function onEscape(e) {
		if (e.key === "Escape" && isOpen.value) {
			close();
			triggerElement?.focus();
		}
	}
}
function useSidebarControl() {
	function open() {
		isOpen.value = true;
	}
	function close() {
		isOpen.value = false;
	}
	function toggle() {
		isOpen.value ? close() : open();
	}
	return {
		isOpen,
		open,
		close,
		toggle
	};
}
function useSidebarItemControl(item) {
	const route = useRoute();
	const collapsed = ref(false);
	const collapsible = computed(() => {
		return item.value.collapsed != null;
	});
	const isLink = computed(() => {
		return !!item.value.link;
	});
	const isActiveLink = ref(false);
	const hasActiveLink$1 = ref(false);
	function updateActiveLink() {
		if (item.value.link) isActiveLink.value = isActive(route.data.relativePath, route.hash, item.value.link);
		else isActiveLink.value = false;
		if (isActiveLink.value) {
			hasActiveLink$1.value = true;
			nextTick(() => collapsed.value = false);
			return;
		}
		if (!item.value.items) {
			hasActiveLink$1.value = false;
			return;
		}
		hasActiveLink$1.value = hasActiveLink(route.data.relativePath, route.hash, item.value.items);
		if (hasActiveLink$1.value) nextTick(() => collapsed.value = false);
	}
	watch([item, route], updateActiveLink);
	onMounted(updateActiveLink);
	const hasChildren = computed(() => {
		return !!(item.value.items && item.value.items.length);
	});
	watchEffect(() => {
		collapsed.value = !!(collapsible.value && item.value.collapsed);
	});
	function toggle() {
		if (collapsible.value) collapsed.value = !collapsed.value;
	}
	return {
		collapsed,
		collapsible,
		isLink,
		isActiveLink,
		hasActiveLink: hasActiveLink$1,
		hasChildren,
		toggle
	};
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/layout.js
var headers = shallowRef([]);
var sidebar = shallowRef([]);
var is960 = shallowRef(false);
function useLayout() {
	const { frontmatter, theme } = useData();
	const isHome = computed(() => {
		return !!(frontmatter.value.isHome ?? frontmatter.value.layout === "home");
	});
	const hasSidebar = computed(() => {
		return frontmatter.value.sidebar !== false && sidebar.value.length > 0 && !isHome.value;
	});
	const isSidebarEnabled = computed(() => hasSidebar.value && is960.value);
	const sidebarGroups = computed(() => {
		return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
	});
	const hasAside = computed(() => {
		if (isHome.value) return false;
		if (frontmatter.value.aside != null) return !!frontmatter.value.aside;
		return theme.value.aside !== false;
	});
	const leftAside = computed(() => {
		if (!hasAside.value) return false;
		return frontmatter.value.aside == null ? theme.value.aside === "left" : frontmatter.value.aside === "left";
	});
	const hasLocalNav = computed(() => {
		return headers.value.length > 0;
	});
	return {
		isHome,
		sidebar: shallowReadonly(sidebar),
		sidebarGroups,
		hasSidebar,
		isSidebarEnabled,
		hasAside,
		leftAside,
		headers: shallowReadonly(headers),
		hasLocalNav
	};
}
function registerWatchers({ closeSidebar }) {
	const { theme, page, frontmatter } = useData();
	watch(() => [page.value.relativePath, theme.value.sidebar], ([relativePath, sidebarConfig]) => {
		const newSidebar = sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
		if (JSON.stringify(newSidebar) !== JSON.stringify(sidebar.value)) sidebar.value = newSidebar;
	}, {
		immediate: true,
		deep: true,
		flush: "sync"
	});
	onContentUpdated(() => {
		headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
	});
	if (inBrowser) {
		is960.value = window.innerWidth >= 960;
		window.addEventListener("resize", () => {
			is960.value = window.innerWidth >= 960;
		}, { passive: true });
	}
	const route = useRoute();
	watch(() => route.path, closeSidebar);
	watch(is960, closeSidebar);
	useCloseSidebarOnEscape(closeSidebar);
}
var layoutInfoInjectionKey = Symbol("layout-info");
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideCarbonAds",
	__ssrInlineRender: true,
	props: { carbonAds: {} },
	setup(__props) {
		const VPCarbonAds = () => null;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideCarbonAds" }, _attrs))}>`);
			_push(ssrRenderComponent(unref(VPCarbonAds), { "carbon-ads": __props.carbonAds }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue
var _sfc_setup$78 = VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue");
	return _sfc_setup$78 ? _sfc_setup$78(props, ctx) : void 0;
};
var VPDocAsideCarbonAds_default = VPDocAsideCarbonAds_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue?vue&type=script&setup=true&lang.ts
var VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocOutlineItem",
	__ssrInlineRender: true,
	props: {
		headers: {},
		root: { type: Boolean }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPDocOutlineItem = resolveComponent("VPDocOutlineItem", true);
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: ["VPDocOutlineItem", __props.root ? "root" : "nested"] }, _attrs))} data-v-f6c3e83a><!--[-->`);
			ssrRenderList(__props.headers, ({ children, link, title }) => {
				_push(`<li data-v-f6c3e83a><a class="outline-link"${ssrRenderAttr("href", link)}${ssrRenderAttr("title", title)} data-v-f6c3e83a>${ssrInterpolate(title)}</a>`);
				if (children?.length) _push(ssrRenderComponent(_component_VPDocOutlineItem, { headers: children }, null, _parent));
				else _push(`<!---->`);
				_push(`</li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue
var _sfc_setup$77 = VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default.setup;
VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue");
	return _sfc_setup$77 ? _sfc_setup$77(props, ctx) : void 0;
};
var VPDocOutlineItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocOutlineItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f6c3e83a"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideOutline",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const container = ref();
		const marker = ref();
		const { headers, hasLocalNav } = useLayout();
		useActiveAnchor(container, marker);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<nav${ssrRenderAttrs(mergeProps({
				"aria-labelledby": "doc-outline-aria-label",
				class: ["VPDocAsideOutline", { "has-outline": unref(hasLocalNav) }],
				ref_key: "container",
				ref: container
			}, _attrs))} data-v-5cfdd280><div class="content" data-v-5cfdd280><div class="outline-marker" data-v-5cfdd280></div><div aria-level="2" class="outline-title" id="doc-outline-aria-label" role="heading" data-v-5cfdd280>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</div>`);
			_push(ssrRenderComponent(VPDocOutlineItem_default, {
				headers: unref(headers),
				root: true
			}, null, _parent));
			_push(`</div></nav>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue
var _sfc_setup$76 = VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue");
	return _sfc_setup$76 ? _sfc_setup$76(props, ctx) : void 0;
};
var VPDocAsideOutline_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocAsideOutline_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5cfdd280"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue?vue&type=script&setup=true&lang.ts
var VPDocAside_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAside",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAside" }, _attrs))} data-v-0b685dfb>`);
			ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPDocAsideOutline_default, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent);
			_push(`<div class="spacer" data-v-0b685dfb></div>`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent);
			if (unref(theme).carbonAds) _push(ssrRenderComponent(VPDocAsideCarbonAds_default, { "carbon-ads": unref(theme).carbonAds }, null, _parent));
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue
var _sfc_setup$75 = VPDocAside_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAside_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue");
	return _sfc_setup$75 ? _sfc_setup$75(props, ctx) : void 0;
};
var VPDocAside_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocAside_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0b685dfb"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/edit-link.js
function useEditLink() {
	const { theme, page } = useData();
	return computed(() => {
		const { text = "Edit this page", pattern = "" } = theme.value.editLink || {};
		let url;
		if (typeof pattern === "function") url = pattern(page.value);
		else url = pattern.replace(/:path/g, page.value.filePath);
		return {
			url,
			text
		};
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/prev-next.js
function usePrevNext() {
	const { theme, page, frontmatter } = useData();
	return computed(() => {
		const candidates = uniqBy(getFlatSideBarLinks(getSidebar(theme.value.sidebar, page.value.relativePath)), (link) => normalize(link.link));
		const index = candidates.findIndex((link) => {
			return isActive(page.value.relativePath, "", link.link, false, true);
		});
		const hidePrev = theme.value.docFooter?.prev === false && !frontmatter.value.prev || frontmatter.value.prev === false;
		const hideNext = theme.value.docFooter?.next === false && !frontmatter.value.next || frontmatter.value.next === false;
		return {
			prev: hidePrev ? void 0 : {
				text: (typeof frontmatter.value.prev === "string" ? frontmatter.value.prev : typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.text : void 0) ?? candidates[index - 1]?.docFooterText ?? candidates[index - 1]?.text,
				link: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.link : void 0) ?? candidates[index - 1]?.link,
				target: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.target : void 0) ?? candidates[index - 1]?.target,
				rel: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.rel : void 0) ?? candidates[index - 1]?.rel
			},
			next: hideNext ? void 0 : {
				text: (typeof frontmatter.value.next === "string" ? frontmatter.value.next : typeof frontmatter.value.next === "object" ? frontmatter.value.next.text : void 0) ?? candidates[index + 1]?.docFooterText ?? candidates[index + 1]?.text,
				link: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.link : void 0) ?? candidates[index + 1]?.link,
				target: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.target : void 0) ?? candidates[index + 1]?.target,
				rel: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.rel : void 0) ?? candidates[index + 1]?.rel
			}
		};
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue?vue&type=script&setup=true&lang.ts
var VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocFooterLastUpdated",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, lang: pageLang } = useData();
		const { language: browserLang } = useNavigatorLanguage();
		const timeRef = useTemplateRef("timeRef");
		const date = computed(() => new Date(page.value.lastUpdated));
		const isoDatetime = computed(() => date.value.toISOString());
		const datetime = shallowRef("");
		onMounted(() => {
			watchEffect(() => {
				const lang = theme.value.lastUpdated?.formatOptions?.forceLocale ? pageLang.value : browserLang.value;
				datetime.value = new Intl.DateTimeFormat(lang, theme.value.lastUpdated?.formatOptions ?? {
					dateStyle: "medium",
					timeStyle: "medium"
				}).format(date.value);
				if (lang && pageLang.value !== lang) timeRef.value?.setAttribute("lang", lang);
				else timeRef.value?.removeAttribute("lang");
			});
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<p${ssrRenderAttrs(mergeProps({ class: "VPLastUpdated" }, _attrs))} data-v-2bb7cc12>${ssrInterpolate(unref(theme).lastUpdated?.text || "Last updated")}: <time${ssrRenderAttr("datetime", isoDatetime.value)} data-v-2bb7cc12>${ssrInterpolate(datetime.value)}</time></p>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue
var _sfc_setup$74 = VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default.setup;
VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue");
	return _sfc_setup$74 ? _sfc_setup$74(props, ctx) : void 0;
};
var VPDocFooterLastUpdated_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocFooterLastUpdated_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-2bb7cc12"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue?vue&type=script&setup=true&lang.ts
var VPLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLink",
	__ssrInlineRender: true,
	props: {
		tag: {},
		href: {},
		noIcon: { type: Boolean },
		external: {
			type: Boolean,
			default: void 0
		},
		target: {},
		rel: {}
	},
	setup(__props) {
		const props = __props;
		const tag = computed(() => props.tag ?? (props.href ? "a" : "span"));
		const isExternal = computed(() => isLinkExternal(props.href, props.target, props.external));
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tag.value), mergeProps({
				class: ["VPLink", {
					link: __props.href,
					"vp-external-link-icon": isExternal.value,
					"no-icon": __props.noIcon
				}],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: __props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: __props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}), _parent);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue
var _sfc_setup$73 = VPLink_vue_vue_type_script_setup_true_lang_default.setup;
VPLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue");
	return _sfc_setup$73 ? _sfc_setup$73(props, ctx) : void 0;
};
var VPLink_default = VPLink_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue?vue&type=script&setup=true&lang.ts
var VPDocFooter_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, page, frontmatter } = useData();
		const editLink = useEditLink();
		const control = usePrevNext();
		const hasEditLink = computed(() => theme.value.editLink && frontmatter.value.editLink !== false);
		const hasLastUpdated = computed(() => page.value.lastUpdated);
		const showFooter = computed(() => hasEditLink.value || hasLastUpdated.value || control.value.prev || control.value.next);
		return (_ctx, _push, _parent, _attrs) => {
			if (showFooter.value) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: "VPDocFooter" }, _attrs))} data-v-1561af9f>`);
				ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent);
				if (hasEditLink.value || hasLastUpdated.value) {
					_push(`<div class="edit-info" data-v-1561af9f>`);
					if (hasEditLink.value) {
						_push(`<div class="edit-link" data-v-1561af9f>`);
						_push(ssrRenderComponent(VPLink_default, {
							class: "edit-link-button",
							href: unref(editLink).url,
							"no-icon": true
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<span class="vpi-square-pen edit-link-icon" data-v-1561af9f${_scopeId}></span> ${ssrInterpolate(unref(editLink).text)}`);
								else return [createVNode("span", { class: "vpi-square-pen edit-link-icon" }), createTextVNode(" " + toDisplayString(unref(editLink).text), 1)];
							}),
							_: 1
						}, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					if (hasLastUpdated.value) {
						_push(`<div class="last-updated" data-v-1561af9f>`);
						_push(ssrRenderComponent(VPDocFooterLastUpdated_default, null, null, _parent));
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				if (unref(control).prev?.link || unref(control).next?.link) {
					_push(`<nav class="prev-next" aria-labelledby="doc-footer-aria-label" data-v-1561af9f><span class="visually-hidden" id="doc-footer-aria-label" data-v-1561af9f>Pager</span><div class="pager" data-v-1561af9f>`);
					if (unref(control).prev?.link) _push(ssrRenderComponent(VPLink_default, {
						class: "pager-link prev",
						href: unref(control).prev.link,
						target: unref(control).prev.target,
						rel: unref(control).prev.rel
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-1561af9f${_scopeId}>${(unref(theme).docFooter?.prev || "Previous page") ?? ""}</span><span class="title" data-v-1561af9f${_scopeId}>${unref(control).prev.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.prev || "Previous page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).prev.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div><div class="pager" data-v-1561af9f>`);
					if (unref(control).next?.link) _push(ssrRenderComponent(VPLink_default, {
						class: "pager-link next",
						href: unref(control).next.link,
						target: unref(control).next.target,
						rel: unref(control).next.rel
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<span class="desc" data-v-1561af9f${_scopeId}>${(unref(theme).docFooter?.next || "Next page") ?? ""}</span><span class="title" data-v-1561af9f${_scopeId}>${unref(control).next.text ?? ""}</span>`);
							else return [createVNode("span", {
								class: "desc",
								innerHTML: unref(theme).docFooter?.next || "Next page"
							}, null, 8, ["innerHTML"]), createVNode("span", {
								class: "title",
								innerHTML: unref(control).next.text
							}, null, 8, ["innerHTML"])];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					_push(`</div></nav>`);
				} else _push(`<!---->`);
				_push(`</footer>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue
var _sfc_setup$72 = VPDocFooter_vue_vue_type_script_setup_true_lang_default.setup;
VPDocFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue");
	return _sfc_setup$72 ? _sfc_setup$72(props, ctx) : void 0;
};
var VPDocFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDocFooter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1561af9f"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue?vue&type=script&setup=true&lang.ts
var VPDoc_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDoc",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const { hasSidebar, hasAside, leftAside } = useLayout();
		const pageName = computed(() => route.path.replace(/[./]+/g, "_").replace(/_html$/, ""));
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPDoc", {
				"has-sidebar": unref(hasSidebar),
				"has-aside": unref(hasAside)
			}] }, _attrs))} data-v-2a7bd11b>`);
			ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent);
			_push(`<div class="container" data-v-2a7bd11b>`);
			if (unref(hasAside)) {
				_push(`<div class="${ssrRenderClass([{ "left-aside": unref(leftAside) }, "aside"])}" data-v-2a7bd11b><div class="aside-curtain" data-v-2a7bd11b></div><div class="aside-container" data-v-2a7bd11b><div class="aside-content" data-v-2a7bd11b>`);
				_push(ssrRenderComponent(VPDocAside_default, null, {
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="content" data-v-2a7bd11b><div class="content-container" data-v-2a7bd11b>`);
			ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent);
			_push(`<main class="main" data-v-2a7bd11b>`);
			_push(ssrRenderComponent(_component_Content, { class: ["vp-doc", [pageName.value, unref(theme).externalLinkIcon && "external-link-icon-enabled"]] }, null, _parent));
			_push(`</main>`);
			_push(ssrRenderComponent(VPDocFooter_default, null, {
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent);
			_push(`</div></div></div>`);
			ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue
var _sfc_setup$71 = VPDoc_vue_vue_type_script_setup_true_lang_default.setup;
VPDoc_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue");
	return _sfc_setup$71 ? _sfc_setup$71(props, ctx) : void 0;
};
var VPDoc_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPDoc_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-2a7bd11b"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue?vue&type=script&setup=true&lang.ts
var VPHomeContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeContent",
	__ssrInlineRender: true,
	setup(__props) {
		const { width: vw } = useWindowSize({
			initialWidth: 0,
			includeScrollbar: false
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "vp-doc container",
				style: unref(vw) ? { "--vp-offset": `calc(50% - ${unref(vw) / 2}px)` } : {},
				"data-allow-mismatch": "style"
			}, _attrs))} data-v-7be96227>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue
var _sfc_setup$70 = VPHomeContent_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue");
	return _sfc_setup$70 ? _sfc_setup$70(props, ctx) : void 0;
};
var VPHomeContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHomeContent_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7be96227"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue?vue&type=script&setup=true&lang.ts
var VPImage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "VPImage",
	__ssrInlineRender: true,
	props: {
		image: {},
		alt: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPImage = resolveComponent("VPImage", true);
			if (__props.image) {
				_push(`<!--[-->`);
				if (typeof __props.image === "string" || "src" in __props.image) _push(`<img${ssrRenderAttrs(mergeProps({ class: "VPImage" }, typeof __props.image === "string" ? _ctx.$attrs : {
					...__props.image,
					..._ctx.$attrs
				}, {
					src: unref(withBase)(typeof __props.image === "string" ? __props.image : __props.image.src),
					alt: __props.alt ?? (typeof __props.image === "string" ? "" : __props.image.alt || "")
				}))} data-v-b1920c31>`);
				else {
					_push(`<!--[-->`);
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "dark",
						image: __props.image.dark,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(ssrRenderComponent(_component_VPImage, mergeProps({
						class: "light",
						image: __props.image.light,
						alt: __props.image.alt
					}, _ctx.$attrs), null, _parent));
					_push(`<!--]-->`);
				}
				_push(`<!--]-->`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue
var _sfc_setup$69 = VPImage_vue_vue_type_script_setup_true_lang_default.setup;
VPImage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue");
	return _sfc_setup$69 ? _sfc_setup$69(props, ctx) : void 0;
};
var VPImage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPImage_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b1920c31"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue?vue&type=script&setup=true&lang.ts
var VPFeature_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFeature",
	__ssrInlineRender: true,
	props: {
		icon: {},
		title: {},
		details: {},
		link: {},
		linkText: {},
		rel: {},
		target: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: "VPFeature",
				href: __props.link,
				rel: __props.rel,
				target: __props.target,
				"no-icon": true,
				tag: __props.link ? "a" : "div"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<article class="box" data-v-919ec349${_scopeId}>`);
						if (typeof __props.icon === "object" && __props.icon.wrap) {
							_push(`<div class="icon" data-v-919ec349${_scopeId}>`);
							_push(ssrRenderComponent(VPImage_default, {
								image: __props.icon,
								alt: __props.icon.alt,
								height: __props.icon.height || 48,
								width: __props.icon.width || 48
							}, null, _parent, _scopeId));
							_push(`</div>`);
						} else if (typeof __props.icon === "object") _push(ssrRenderComponent(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, _parent, _scopeId));
						else if (__props.icon) _push(`<div class="icon" data-v-919ec349${_scopeId}>${__props.icon ?? ""}</div>`);
						else _push(`<!---->`);
						_push(`<h2 class="title" data-v-919ec349${_scopeId}>${__props.title ?? ""}</h2>`);
						if (Array.isArray(__props.details)) {
							_push(`<ul class="details" data-v-919ec349${_scopeId}><!--[-->`);
							ssrRenderList(__props.details, (item) => {
								_push(`<li data-v-919ec349${_scopeId}>${item ?? ""}</li>`);
							});
							_push(`<!--]--></ul>`);
						} else if (__props.details) _push(`<p class="details" data-v-919ec349${_scopeId}>${__props.details ?? ""}</p>`);
						else _push(`<!---->`);
						if (__props.linkText) _push(`<div class="link-text" data-v-919ec349${_scopeId}><p class="link-text-value" data-v-919ec349${_scopeId}>${ssrInterpolate(__props.linkText)} <span class="vpi-arrow-right link-text-icon" data-v-919ec349${_scopeId}></span></p></div>`);
						else _push(`<!---->`);
						_push(`</article>`);
					} else return [createVNode("article", { class: "box" }, [
						typeof __props.icon === "object" && __props.icon.wrap ? (openBlock(), createBlock("div", {
							key: 0,
							class: "icon"
						}, [createVNode(VPImage_default, {
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])])) : typeof __props.icon === "object" ? (openBlock(), createBlock(VPImage_default, {
							key: 1,
							image: __props.icon,
							alt: __props.icon.alt,
							height: __props.icon.height || 48,
							width: __props.icon.width || 48
						}, null, 8, [
							"image",
							"alt",
							"height",
							"width"
						])) : __props.icon ? (openBlock(), createBlock("div", {
							key: 2,
							class: "icon",
							innerHTML: __props.icon
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						createVNode("h2", {
							class: "title",
							innerHTML: __props.title
						}, null, 8, ["innerHTML"]),
						Array.isArray(__props.details) ? (openBlock(), createBlock("ul", {
							key: 3,
							class: "details"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.details, (item) => {
							return openBlock(), createBlock("li", {
								key: item,
								innerHTML: item
							}, null, 8, ["innerHTML"]);
						}), 128))])) : __props.details ? (openBlock(), createBlock("p", {
							key: 4,
							class: "details",
							innerHTML: __props.details
						}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
						__props.linkText ? (openBlock(), createBlock("div", {
							key: 5,
							class: "link-text"
						}, [createVNode("p", { class: "link-text-value" }, [createTextVNode(toDisplayString(__props.linkText) + " ", 1), createVNode("span", { class: "vpi-arrow-right link-text-icon" })])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue
var _sfc_setup$68 = VPFeature_vue_vue_type_script_setup_true_lang_default.setup;
VPFeature_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue");
	return _sfc_setup$68 ? _sfc_setup$68(props, ctx) : void 0;
};
var VPFeature_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFeature_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-919ec349"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue?vue&type=script&setup=true&lang.ts
var VPFeatures_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFeatures",
	__ssrInlineRender: true,
	props: { features: {} },
	setup(__props) {
		const props = __props;
		const grid = computed(() => {
			const length = props.features.length;
			if (!length) return;
			else if (length === 2) return "grid-2";
			else if (length === 3) return "grid-3";
			else if (length % 3 === 0) return "grid-6";
			else if (length > 3) return "grid-4";
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.features) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPFeatures" }, _attrs))} data-v-fd500336><div class="container" data-v-fd500336><ul class="items" data-v-fd500336><!--[-->`);
				ssrRenderList(__props.features, (feature) => {
					_push(`<li class="${ssrRenderClass([[grid.value], "item"])}" data-v-fd500336>`);
					_push(ssrRenderComponent(VPFeature_default, {
						icon: feature.icon,
						title: feature.title,
						details: feature.details,
						link: feature.link,
						"link-text": feature.linkText,
						rel: feature.rel,
						target: feature.target
					}, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue
var _sfc_setup$67 = VPFeatures_vue_vue_type_script_setup_true_lang_default.setup;
VPFeatures_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue");
	return _sfc_setup$67 ? _sfc_setup$67(props, ctx) : void 0;
};
var VPFeatures_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFeatures_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-fd500336"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue?vue&type=script&setup=true&lang.ts
var VPHomeFeatures_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeFeatures",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).features) _push(ssrRenderComponent(VPFeatures_default, mergeProps({
				class: "VPHomeFeatures",
				features: unref(fm).features
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue
var _sfc_setup$66 = VPHomeFeatures_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeFeatures_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue");
	return _sfc_setup$66 ? _sfc_setup$66(props, ctx) : void 0;
};
var VPHomeFeatures_default = VPHomeFeatures_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue?vue&type=script&setup=true&lang.ts
var VPButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPButton",
	__ssrInlineRender: true,
	props: {
		tag: {},
		size: { default: "medium" },
		theme: { default: "brand" },
		text: {},
		href: {},
		target: {},
		rel: {}
	},
	setup(__props) {
		const props = __props;
		const isExternal = computed(() => props.href && EXTERNAL_URL_RE.test(props.href));
		const component = computed(() => {
			return props.tag || (props.href ? "a" : "button");
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(component.value), mergeProps({
				class: ["VPButton", [__props.size, __props.theme]],
				href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
				target: props.target ?? (isExternal.value ? "_blank" : void 0),
				rel: props.rel ?? (isExternal.value ? "noreferrer" : void 0)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, () => {
						_push(`${ssrInterpolate(__props.text)}`);
					}, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.text), 1)], true)];
				}),
				_: 3
			}), _parent);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue
var _sfc_setup$65 = VPButton_vue_vue_type_script_setup_true_lang_default.setup;
VPButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue");
	return _sfc_setup$65 ? _sfc_setup$65(props, ctx) : void 0;
};
var VPButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-faee969d"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue?vue&type=script&setup=true&lang.ts
var VPHero_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHero",
	__ssrInlineRender: true,
	props: {
		name: {},
		text: {},
		tagline: {},
		image: {},
		actions: {}
	},
	setup(__props) {
		const { heroImageSlotExists } = inject(layoutInfoInjectionKey, { heroImageSlotExists: computed(() => false) });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHero", { "has-image": __props.image || unref(heroImageSlotExists) }] }, _attrs))} data-v-a732e522><div class="container" data-v-a732e522><div class="main" data-v-a732e522>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, () => {
				_push(`<h1 class="heading" data-v-a732e522>`);
				if (__props.name) _push(`<span class="name clip" data-v-a732e522>${__props.name ?? ""}</span>`);
				else _push(`<!---->`);
				if (__props.text) _push(`<span class="text" data-v-a732e522>${__props.text ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`</h1>`);
				if (__props.tagline) _push(`<p class="tagline" data-v-a732e522>${__props.tagline ?? ""}</p>`);
				else _push(`<!---->`);
			}, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent);
			if (__props.actions) {
				_push(`<div class="actions" data-v-a732e522>`);
				ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent);
				_push(`<!--[-->`);
				ssrRenderList(__props.actions, (action) => {
					_push(`<div class="action" data-v-a732e522>`);
					_push(ssrRenderComponent(VPButton_default, {
						tag: "a",
						size: "medium",
						theme: action.theme,
						text: action.text,
						href: action.link,
						target: action.target,
						rel: action.rel
					}, null, _parent));
					_push(`</div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent);
			_push(`</div>`);
			if (__props.image || unref(heroImageSlotExists)) {
				_push(`<div class="image" data-v-a732e522><div class="image-container" data-v-a732e522><div class="image-bg" data-v-a732e522></div>`);
				ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, () => {
					if (__props.image) _push(ssrRenderComponent(VPImage_default, {
						class: "image-src",
						image: __props.image
					}, null, _parent));
					else _push(`<!---->`);
				}, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue
var _sfc_setup$64 = VPHero_vue_vue_type_script_setup_true_lang_default.setup;
VPHero_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue");
	return _sfc_setup$64 ? _sfc_setup$64(props, ctx) : void 0;
};
var VPHero_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHero_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a732e522"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue?vue&type=script&setup=true&lang.ts
var VPHomeHero_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeHero",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter: fm } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(fm).hero) _push(ssrRenderComponent(VPHero_default, mergeProps({
				class: "VPHomeHero",
				name: unref(fm).hero.name,
				text: unref(fm).hero.text,
				tagline: unref(fm).hero.tagline,
				image: unref(fm).hero.image,
				actions: unref(fm).hero.actions
			}, _attrs), {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before")];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info")];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after")];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after")];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions")];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image")];
				}),
				_: 3
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue
var _sfc_setup$63 = VPHomeHero_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeHero_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue");
	return _sfc_setup$63 ? _sfc_setup$63(props, ctx) : void 0;
};
var VPHomeHero_default = VPHomeHero_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue?vue&type=script&setup=true&lang.ts
var VPHome_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHome",
	__ssrInlineRender: true,
	setup(__props) {
		const { frontmatter, theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPHome", { "external-link-icon-enabled": unref(theme).externalLinkIcon }] }, _attrs))} data-v-a0ca8433>`);
			ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPHomeHero_default, null, {
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent);
			ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPHomeFeatures_default, null, null, _parent));
			ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent);
			if (unref(frontmatter).markdownStyles !== false) _push(ssrRenderComponent(VPHomeContent_default, null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_Content, null, null, _parent, _scopeId));
					else return [createVNode(_component_Content)];
				}),
				_: 1
			}, _parent));
			else _push(ssrRenderComponent(_component_Content, null, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue
var _sfc_setup$62 = VPHome_vue_vue_type_script_setup_true_lang_default.setup;
VPHome_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue");
	return _sfc_setup$62 ? _sfc_setup$62(props, ctx) : void 0;
};
var VPHome_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPHome_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a0ca8433"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue
var _sfc_main$7 = {};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs) {
	const _component_Content = resolveComponent("Content");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPPage" }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent);
	_push(ssrRenderComponent(_component_Content, null, null, _parent));
	ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$61 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue");
	return _sfc_setup$61 ? _sfc_setup$61(props, ctx) : void 0;
};
var VPPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$7, [["ssrRender", _sfc_ssrRender$4]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue?vue&type=script&setup=true&lang.ts
var VPContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPContent",
	__ssrInlineRender: true,
	setup(__props) {
		const { page, frontmatter } = useData();
		const { isHome, hasSidebar } = useLayout();
		function isRegistered(component) {
			return typeof resolveDynamicComponent(component) !== "string";
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: ["VPContent", {
					"has-sidebar": unref(hasSidebar),
					"is-home": unref(isHome)
				}],
				id: "VPContent"
			}, _attrs))} data-v-eba896de>`);
			if (unref(page).isNotFound) ssrRenderSlot(_ctx.$slots, "not-found", {}, () => {
				_push(ssrRenderComponent(NotFound_default, null, null, _parent));
			}, _push, _parent);
			else if (unref(frontmatter).layout === "page" && !isRegistered("page")) _push(ssrRenderComponent(VPPage_default, null, {
				"page-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
				}),
				"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if (unref(frontmatter).layout === "home" && !isRegistered("home")) _push(ssrRenderComponent(VPHome_default, null, {
				"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
				}),
				"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
				}),
				"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
				}),
				"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
				}),
				"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
				}),
				"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
				}),
				"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
				}),
				"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
				}),
				"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
				}),
				"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else if ((!unref(frontmatter).layout || unref(frontmatter).layout === "doc") && !isRegistered("doc")) _push(ssrRenderComponent(VPDoc_default, null, {
				"doc-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
				}),
				"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
				}),
				"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
				}),
				"doc-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
				}),
				"doc-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
				}),
				"aside-top": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
				}),
				"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
				}),
				"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
				}),
				"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
				}),
				"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
				}),
				"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			else ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(frontmatter).layout || "doc"), null, null), _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue
var _sfc_setup$60 = VPContent_vue_vue_type_script_setup_true_lang_default.setup;
VPContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue");
	return _sfc_setup$60 ? _sfc_setup$60(props, ctx) : void 0;
};
var VPContent_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPContent_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-eba896de"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue?vue&type=script&setup=true&lang.ts
var VPFooter_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFooter",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme, frontmatter } = useData();
		const { hasSidebar } = useLayout();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).footer && unref(frontmatter).footer !== false) {
				_push(`<footer${ssrRenderAttrs(mergeProps({ class: ["VPFooter", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-b35862a6><div class="container" data-v-b35862a6>`);
				if (unref(theme).footer.message) _push(`<p class="message" data-v-b35862a6>${unref(theme).footer.message ?? ""}</p>`);
				else _push(`<!---->`);
				if (unref(theme).footer.copyright) _push(`<p class="copyright" data-v-b35862a6>${unref(theme).footer.copyright ?? ""}</p>`);
				else _push(`<!---->`);
				_push(`</div></footer>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue
var _sfc_setup$59 = VPFooter_vue_vue_type_script_setup_true_lang_default.setup;
VPFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue");
	return _sfc_setup$59 ? _sfc_setup$59(props, ctx) : void 0;
};
var VPFooter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFooter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b35862a6"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue?vue&type=script&setup=true&lang.ts
var VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLocalNavOutlineDropdown",
	__ssrInlineRender: true,
	props: {
		headers: {},
		navHeight: {}
	},
	setup(__props) {
		const { theme } = useData();
		const open = ref(false);
		const vh = ref(0);
		const main = ref();
		ref();
		function closeOnClickOutside(e) {
			if (!main.value?.contains(e.target)) open.value = false;
		}
		watch(open, (value) => {
			if (value) {
				document.addEventListener("click", closeOnClickOutside);
				return;
			}
			document.removeEventListener("click", closeOnClickOutside);
		});
		onKeyStroke("Escape", () => {
			open.value = false;
		});
		onContentUpdated(() => {
			open.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				ref_key: "main",
				ref: main,
				class: "VPLocalNavOutlineDropdown",
				style: { "--vp-vh": vh.value + "px" },
				"data-allow-mismatch": "style"
			}, _attrs))} data-v-13a8ef91>`);
			if (__props.headers.length > 0) _push(`<button class="${ssrRenderClass({ open: open.value })}" data-v-13a8ef91><span class="menu-text" data-v-13a8ef91>${ssrInterpolate(unref(resolveTitle)(unref(theme)))}</span><span class="vpi-chevron-right icon" data-v-13a8ef91></span></button>`);
			else _push(`<button data-v-13a8ef91>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</button>`);
			if (open.value) {
				_push(`<div class="items" data-v-13a8ef91><div class="header" data-v-13a8ef91><a class="top-link" href="#" data-v-13a8ef91>${ssrInterpolate(unref(theme).returnToTopLabel || "Return to top")}</a></div><div class="outline" data-v-13a8ef91>`);
				_push(ssrRenderComponent(VPDocOutlineItem_default, { headers: __props.headers }, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue
var _sfc_setup$58 = VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default.setup;
VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue");
	return _sfc_setup$58 ? _sfc_setup$58(props, ctx) : void 0;
};
var VPLocalNavOutlineDropdown_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPLocalNavOutlineDropdown_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-13a8ef91"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue?vue&type=script&setup=true&lang.ts
var VPLocalNav_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPLocalNav",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	emits: ["open-menu"],
	setup(__props) {
		const { theme } = useData();
		const { isHome, hasSidebar, headers, hasLocalNav } = useLayout();
		const { y } = useWindowScroll();
		const navHeight = ref(0);
		onMounted(() => {
			navHeight.value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--vp-nav-height"));
		});
		const classes = computed(() => {
			return {
				VPLocalNav: true,
				"has-sidebar": hasSidebar.value,
				empty: !hasLocalNav.value,
				fixed: !hasLocalNav.value && !hasSidebar.value
			};
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (!unref(isHome) && (unref(hasLocalNav) || unref(hasSidebar) || unref(y) >= navHeight.value)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: classes.value }, _attrs))} data-v-0f11bf3c><div class="container" data-v-0f11bf3c>`);
				if (unref(hasSidebar)) _push(`<button class="menu"${ssrRenderAttr("aria-expanded", __props.open)} aria-controls="VPSidebarNav" data-v-0f11bf3c><span class="vpi-align-left menu-icon" data-v-0f11bf3c></span><span class="menu-text" data-v-0f11bf3c>${ssrInterpolate(unref(theme).sidebarMenuLabel || "Menu")}</span></button>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPLocalNavOutlineDropdown_default, {
					headers: unref(headers),
					navHeight: navHeight.value
				}, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue
var _sfc_setup$57 = VPLocalNav_vue_vue_type_script_setup_true_lang_default.setup;
VPLocalNav_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue");
	return _sfc_setup$57 ? _sfc_setup$57(props, ctx) : void 0;
};
var VPLocalNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPLocalNav_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0f11bf3c"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/nav.js
function useNav() {
	const isScreenOpen = ref(false);
	function openScreen() {
		isScreenOpen.value = true;
		window.addEventListener("resize", closeScreenOnTabletWindow);
	}
	function closeScreen() {
		isScreenOpen.value = false;
		window.removeEventListener("resize", closeScreenOnTabletWindow);
	}
	function toggleScreen() {
		isScreenOpen.value ? closeScreen() : openScreen();
	}
	/**
	* Close screen when the user resizes the window wider than tablet size.
	*/
	function closeScreenOnTabletWindow() {
		window.outerWidth >= 768 && closeScreen();
	}
	const route = useRoute();
	watch(() => route.path, closeScreen);
	return {
		isScreenOpen,
		openScreen,
		closeScreen,
		toggleScreen
	};
}
var navInjectionKey = Symbol("nav");
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue
var _sfc_main$6 = {};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs) {
	_push(`<button${ssrRenderAttrs(mergeProps({
		class: "VPSwitch",
		type: "button",
		role: "switch"
	}, _attrs))} data-v-fb5f47cf><span class="check" data-v-fb5f47cf>`);
	if (_ctx.$slots.default) {
		_push(`<span class="icon" data-v-fb5f47cf>`);
		ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
		_push(`</span>`);
	} else _push(`<!---->`);
	_push(`</span></button>`);
}
var _sfc_setup$56 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue");
	return _sfc_setup$56 ? _sfc_setup$56(props, ctx) : void 0;
};
var VPSwitch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$6, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-fb5f47cf"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue?vue&type=script&setup=true&lang.ts
var VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSwitchAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { isDark, theme } = useData();
		const toggleAppearance = inject("toggle-appearance", () => {
			isDark.value = !isDark.value;
		});
		const switchTitle = ref("");
		watchPostEffect(() => {
			switchTitle.value = isDark.value ? theme.value.lightModeSwitchTitle || "Switch to light theme" : theme.value.darkModeSwitchTitle || "Switch to dark theme";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPSwitch_default, mergeProps({
				title: switchTitle.value,
				class: "VPSwitchAppearance",
				"aria-checked": unref(isDark),
				onClick: unref(toggleAppearance)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="vpi-sun sun" data-v-a33eeb68${_scopeId}></span><span class="vpi-moon moon" data-v-a33eeb68${_scopeId}></span>`);
					else return [createVNode("span", { class: "vpi-sun sun" }), createVNode("span", { class: "vpi-moon moon" })];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue
var _sfc_setup$55 = VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue");
	return _sfc_setup$55 ? _sfc_setup$55(props, ctx) : void 0;
};
var VPSwitchAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSwitchAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a33eeb68"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue?vue&type=script&setup=true&lang.ts
var VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { site } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarAppearance" }, _attrs))} data-v-247a9749>`);
				_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue
var _sfc_setup$54 = VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue");
	return _sfc_setup$54 ? _sfc_setup$54(props, ctx) : void 0;
};
var VPNavBarAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-247a9749"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/flyout.js
var focusedElement = ref();
var active = false;
var listeners = 0;
function useFlyout(options) {
	const focus = ref(false);
	if (inBrowser) {
		!active && activateFocusTracking();
		listeners++;
		const unwatch = watch(focusedElement, (el) => {
			if (el === options.el.value || options.el.value?.contains(el)) {
				focus.value = true;
				options.onFocus?.();
			} else {
				focus.value = false;
				options.onBlur?.();
			}
		});
		onUnmounted(() => {
			unwatch();
			listeners--;
			if (!listeners) deactivateFocusTracking();
		});
	}
	return readonly(focus);
}
function activateFocusTracking() {
	document.addEventListener("focusin", handleFocusIn);
	active = true;
	focusedElement.value = document.activeElement;
}
function deactivateFocusTracking() {
	document.removeEventListener("focusin", handleFocusIn);
}
function handleFocusIn() {
	focusedElement.value = document.activeElement;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "VPMenuLink",
	__ssrInlineRender: true,
	props: {
		item: {},
		rel: {}
	},
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const href = computed(() => typeof props.item.link === "function" ? props.item.link(route.data) : props.item.link);
		const isActiveLink = computed(() => {
			return isActive(route.data.relativePath, route.hash, props.item.activeMatch || href.value, !!props.item.activeMatch);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuLink" }, _attrs))} data-v-13e617e1>`);
			_push(ssrRenderComponent(VPLink_default, mergeProps(_ctx.$attrs, {
				class: { active: isActiveLink.value },
				href: href.value,
				target: __props.item.target,
				rel: props.rel ?? __props.item.rel,
				"no-icon": __props.item.noIcon
			}), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-13e617e1${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue
var _sfc_setup$53 = VPMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue");
	return _sfc_setup$53 ? _sfc_setup$53(props, ctx) : void 0;
};
var VPMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-13e617e1"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPMenuGroup",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuGroup" }, _attrs))} data-v-befe7fb4>`);
			if (__props.text) _push(`<p class="title" data-v-befe7fb4>${ssrInterpolate(__props.text)}</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<!--[-->`);
				if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue
var _sfc_setup$52 = VPMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue");
	return _sfc_setup$52 ? _sfc_setup$52(props, ctx) : void 0;
};
var VPMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenuGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-befe7fb4"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue?vue&type=script&setup=true&lang.ts
var VPMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPMenu",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenu" }, _attrs))} data-v-f21d4810>`);
			if (__props.items) {
				_push(`<ul class="items" data-v-f21d4810><!--[-->`);
				ssrRenderList(__props.items, (item) => {
					_push(`<li data-v-f21d4810>`);
					if ("link" in item) _push(ssrRenderComponent(VPMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
					else _push(ssrRenderComponent(VPMenuGroup_default, {
						text: item.text,
						items: item.items
					}, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul>`);
			} else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue
var _sfc_setup$51 = VPMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue");
	return _sfc_setup$51 ? _sfc_setup$51(props, ctx) : void 0;
};
var VPMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPMenu_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f21d4810"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue?vue&type=script&setup=true&lang.ts
var VPFlyout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPFlyout",
	__ssrInlineRender: true,
	props: {
		icon: {},
		button: {},
		label: {},
		items: {}
	},
	setup(__props) {
		const open = ref(false);
		const el = ref();
		useFlyout({
			el,
			onBlur
		});
		function onBlur() {
			open.value = false;
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "VPFlyout",
				ref_key: "el",
				ref: el
			}, _attrs))} data-v-8bfe4cb3><button type="button" class="button" aria-haspopup="true"${ssrRenderAttr("aria-expanded", open.value)}${ssrRenderAttr("aria-label", __props.label)} data-v-8bfe4cb3>`);
			if (__props.button || __props.icon) {
				_push(`<span class="text" data-v-8bfe4cb3>`);
				if (__props.icon) _push(`<span class="${ssrRenderClass([__props.icon, "option-icon"])}" data-v-8bfe4cb3></span>`);
				else _push(`<!---->`);
				if (__props.button) _push(`<span data-v-8bfe4cb3>${__props.button ?? ""}</span>`);
				else _push(`<!---->`);
				_push(`<span class="vpi-chevron-down text-icon" data-v-8bfe4cb3></span></span>`);
			} else _push(`<span class="vpi-more-horizontal icon" data-v-8bfe4cb3></span>`);
			_push(`</button><div class="menu" data-v-8bfe4cb3>`);
			_push(ssrRenderComponent(VPMenu_default, { items: __props.items }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue
var _sfc_setup$50 = VPFlyout_vue_vue_type_script_setup_true_lang_default.setup;
VPFlyout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue");
	return _sfc_setup$50 ? _sfc_setup$50(props, ctx) : void 0;
};
var VPFlyout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPFlyout_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8bfe4cb3"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue?vue&type=script&setup=true&lang.ts
var VPSocialLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSocialLink",
	__ssrInlineRender: true,
	props: {
		icon: {},
		link: {},
		ariaLabel: {},
		target: {},
		me: { type: Boolean }
	},
	setup(__props) {
		const props = __props;
		const el = ref();
		onMounted(async () => {
			await nextTick();
			const span = el.value?.children[0];
			if (span instanceof HTMLElement && span.className.startsWith("vpi-social-") && (getComputedStyle(span).maskImage || getComputedStyle(span).webkitMaskImage) === "none") span.style.setProperty("--icon", `url('https://api.iconify.design/simple-icons/${props.icon}.svg')`);
		});
		const svg = computed(() => {
			if (typeof props.icon === "object") return props.icon.svg;
			return `<span class="vpi-social-${props.icon}"></span>`;
		});
		typeof props.icon === "string" && useSSRContext()?.vpSocialIcons.add(props.icon);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				ref_key: "el",
				ref: el,
				class: "VPSocialLink no-icon",
				href: __props.link,
				"aria-label": __props.ariaLabel ?? (typeof __props.icon === "string" ? __props.icon : ""),
				target: __props.target ?? (unref(isExternal)(__props.link) ? "_blank" : void 0),
				rel: __props.me ? "me noopener" : "noopener"
			}, _attrs))} data-v-ff071d51>${svg.value ?? ""}</a>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue
var _sfc_setup$49 = VPSocialLink_vue_vue_type_script_setup_true_lang_default.setup;
VPSocialLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue");
	return _sfc_setup$49 ? _sfc_setup$49(props, ctx) : void 0;
};
var VPSocialLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSocialLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ff071d51"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSocialLinks",
	__ssrInlineRender: true,
	props: {
		links: {},
		me: {
			type: Boolean,
			default: true
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: "VPSocialLinks" }, _attrs))} data-v-c6801392><!--[-->`);
			ssrRenderList(__props.links, ({ link, icon, ariaLabel, target }) => {
				_push(`<li class="item" data-v-c6801392>`);
				_push(ssrRenderComponent(VPSocialLink_default, {
					icon,
					link,
					ariaLabel,
					target,
					me: __props.me
				}, null, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue
var _sfc_setup$48 = VPSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue");
	return _sfc_setup$48 ? _sfc_setup$48(props, ctx) : void 0;
};
var VPSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSocialLinks_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c6801392"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue?vue&type=script&setup=true&lang.ts
var VPNavBarExtra_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarExtra",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const hasExtraContent = computed(() => localeLinks.value.length && currentLang.value.label || site.value.appearance || theme.value.socialLinks);
		return (_ctx, _push, _parent, _attrs) => {
			if (hasExtraContent.value) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: "VPNavBarExtra",
				label: "extra navigation"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(localeLinks).length && unref(currentLang).label) {
							_push(`<ul class="group translations" data-v-3651f0fc${_scopeId}><li class="trans-title" data-v-3651f0fc${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</li><!--[-->`);
							ssrRenderList(unref(localeLinks), (locale) => {
								_push(`<li data-v-3651f0fc${_scopeId}>`);
								_push(ssrRenderComponent(VPMenuLink_default, {
									item: locale,
									external: false,
									lang: locale.lang,
									hreflang: locale.lang,
									rel: "alternate",
									dir: locale.dir,
									"data-allow-mismatch": "attribute"
								}, null, _parent, _scopeId));
								_push(`</li>`);
							});
							_push(`<!--]--></ul>`);
						} else _push(`<!---->`);
						if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
							_push(`<div class="group" data-v-3651f0fc${_scopeId}><div class="item appearance" data-v-3651f0fc${_scopeId}><p class="label" data-v-3651f0fc${_scopeId}>${ssrInterpolate(unref(theme).darkModeSwitchLabel || "Appearance")}</p><div class="appearance-action" data-v-3651f0fc${_scopeId}>`);
							_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent, _scopeId));
							_push(`</div></div></div>`);
						} else _push(`<!---->`);
						if (unref(theme).socialLinks) {
							_push(`<div class="group" data-v-3651f0fc${_scopeId}><div class="item social-links" data-v-3651f0fc${_scopeId}>`);
							_push(ssrRenderComponent(VPSocialLinks_default, {
								class: "social-links-list",
								links: unref(theme).socialLinks
							}, null, _parent, _scopeId));
							_push(`</div></div>`);
						} else _push(`<!---->`);
					} else return [
						unref(localeLinks).length && unref(currentLang).label ? (openBlock(), createBlock("ul", {
							key: 0,
							class: "group translations"
						}, [createVNode("li", { class: "trans-title" }, toDisplayString(unref(currentLang).label), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
							return openBlock(), createBlock("li", { key: locale.link }, [createVNode(VPMenuLink_default, {
								item: locale,
								external: false,
								lang: locale.lang,
								hreflang: locale.lang,
								rel: "alternate",
								dir: locale.dir,
								"data-allow-mismatch": "attribute"
							}, null, 8, [
								"item",
								"lang",
								"hreflang",
								"dir"
							])]);
						}), 128))])) : createCommentVNode("", true),
						unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto" ? (openBlock(), createBlock("div", {
							key: 1,
							class: "group"
						}, [createVNode("div", { class: "item appearance" }, [createVNode("p", { class: "label" }, toDisplayString(unref(theme).darkModeSwitchLabel || "Appearance"), 1), createVNode("div", { class: "appearance-action" }, [createVNode(VPSwitchAppearance_default)])])])) : createCommentVNode("", true),
						unref(theme).socialLinks ? (openBlock(), createBlock("div", {
							key: 2,
							class: "group"
						}, [createVNode("div", { class: "item social-links" }, [createVNode(VPSocialLinks_default, {
							class: "social-links-list",
							links: unref(theme).socialLinks
						}, null, 8, ["links"])])])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue
var _sfc_setup$47 = VPNavBarExtra_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarExtra_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue");
	return _sfc_setup$47 ? _sfc_setup$47(props, ctx) : void 0;
};
var VPNavBarExtra_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarExtra_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3651f0fc"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue?vue&type=script&setup=true&lang.ts
var VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarHamburger",
	__ssrInlineRender: true,
	props: { active: { type: Boolean } },
	emits: ["click"],
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: ["VPNavBarHamburger", { active: __props.active }],
				"aria-label": "mobile navigation",
				"aria-expanded": __props.active,
				"aria-controls": "VPNavScreen"
			}, _attrs))} data-v-500c1132><span class="container" data-v-500c1132><span class="top" data-v-500c1132></span><span class="middle" data-v-500c1132></span><span class="bottom" data-v-500c1132></span></span></button>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue
var _sfc_setup$46 = VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue");
	return _sfc_setup$46 ? _sfc_setup$46(props, ctx) : void 0;
};
var VPNavBarHamburger_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarHamburger_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-500c1132"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenuGroup",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const isActiveGroup = computed(() => {
			if (props.item.activeMatch) return isActive(route.data.relativePath, route.hash, props.item.activeMatch, true);
			return isChildActive(props.item);
		});
		function isChildActive(navItem) {
			if ("component" in navItem) return false;
			if ("link" in navItem) {
				const href = typeof navItem.link === "function" ? navItem.link(route.data) : navItem.link;
				return isActive(route.data.relativePath, route.hash, navItem.activeMatch || href, !!navItem.activeMatch);
			}
			return navItem.items.some(isChildActive);
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: {
					VPNavBarMenuGroup: true,
					active: isActiveGroup.value
				},
				button: __props.item.text,
				items: __props.item.items
			}, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue
var _sfc_setup$45 = VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue");
	return _sfc_setup$45 ? _sfc_setup$45(props, ctx) : void 0;
};
var VPNavBarMenuGroup_default = VPNavBarMenuGroup_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenuLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const href = computed(() => typeof props.item.link === "function" ? props.item.link(route.data) : props.item.link);
		const isActiveLink = computed(() => {
			return isActive(route.data.relativePath, route.hash, props.item.activeMatch || href.value, !!props.item.activeMatch);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: {
					VPNavBarMenuLink: true,
					active: isActiveLink.value
				},
				href: href.value,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				tabindex: "0"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-6e9f052d${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue
var _sfc_setup$44 = VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue");
	return _sfc_setup$44 ? _sfc_setup$44(props, ctx) : void 0;
};
var VPNavBarMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6e9f052d"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue?vue&type=script&setup=true&lang.ts
var VPNavBarMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarMenu",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).nav) {
				_push(`<nav${ssrRenderAttrs(mergeProps({
					"aria-labelledby": "main-nav-aria-label",
					class: "VPNavBarMenu"
				}, _attrs))} data-v-e26f2404><span id="main-nav-aria-label" class="visually-hidden" data-v-e26f2404> Main Navigation </span><ul class="list" data-v-e26f2404><!--[-->`);
				ssrRenderList(unref(theme).nav, (item) => {
					_push(`<li data-v-e26f2404>`);
					if ("link" in item) _push(ssrRenderComponent(VPNavBarMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
					else _push(ssrRenderComponent(VPNavBarMenuGroup_default, { item }, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></nav>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue
var _sfc_setup$43 = VPNavBarMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue");
	return _sfc_setup$43 ? _sfc_setup$43(props, ctx) : void 0;
};
var VPNavBarMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarMenu_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e26f2404"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/support/docsearch.js
/**
* Resolves the effective mode based on config and available features.
*
* - 'auto': infer hybrid vs sidePanel-only from provided config
* - 'sidePanel': force sidePanel-only even if keyword search is configured
* - 'hybrid': force hybrid (error if keyword search is not configured)
* - 'modal': force modal even if sidePanel is configured
*/
function resolveMode(options) {
	const mode = options.mode ?? "auto";
	const hasKeyword = hasKeywordSearch(options);
	const askAi = options.askAi;
	const hasSidePanelConfig = Boolean(askAi && typeof askAi === "object" && askAi.sidePanel);
	switch (mode) {
		case "sidePanel": return {
			mode,
			showKeywordSearch: false,
			useSidePanel: true
		};
		case "hybrid":
			if (!hasKeyword) console.error("[vitepress] mode: \"hybrid\" requires keyword search credentials (appId, apiKey, indexName).");
			return {
				mode,
				showKeywordSearch: hasKeyword,
				useSidePanel: true
			};
		case "modal": return {
			mode,
			showKeywordSearch: hasKeyword,
			useSidePanel: false
		};
		default: return {
			mode: "auto",
			showKeywordSearch: hasKeyword,
			useSidePanel: hasSidePanelConfig
		};
	}
}
function hasKeywordSearch(options) {
	return Boolean(options.appId && options.apiKey && options.indexName);
}
/**
* Removes existing `lang:` filters and appends `lang:${lang}`.
* Handles both flat arrays and nested arrays (for OR conditions).
*/
function mergeLangFacetFilters(rawFacetFilters, lang) {
	return [...(Array.isArray(rawFacetFilters) ? rawFacetFilters : rawFacetFilters ? [rawFacetFilters] : []).map((filter) => {
		if (Array.isArray(filter)) return filter.filter((f) => typeof f === "string" && !f.startsWith("lang:"));
		return filter;
	}).filter((filter) => {
		if (typeof filter === "string") return !filter.startsWith("lang:");
		return Array.isArray(filter) && filter.length > 0;
	}), `lang:${lang}`];
}
/**
* Builds Ask AI configuration from various input formats.
*/
function buildAskAiConfig(askAiProp, options, lang) {
	const isAskAiString = typeof askAiProp === "string";
	const askAiSearchParameters = !isAskAiString && askAiProp.searchParameters ? { ...askAiProp.searchParameters } : void 0;
	const isAgentStudio = !isAskAiString && askAiProp.agentStudio === true;
	const askAiFacetFilters = mergeLangFacetFilters(askAiSearchParameters?.facetFilters ?? options.searchParameters?.facetFilters, lang);
	const mergedAskAiSearchParameters = isAgentStudio ? askAiSearchParameters : {
		...askAiSearchParameters,
		facetFilters: askAiFacetFilters.length ? askAiFacetFilters : void 0
	};
	const result = {
		...isAskAiString ? {} : askAiProp,
		indexName: isAskAiString ? options.indexName : askAiProp.indexName,
		apiKey: isAskAiString ? options.apiKey : askAiProp.apiKey,
		appId: isAskAiString ? options.appId : askAiProp.appId,
		assistantId: isAskAiString ? askAiProp : askAiProp.assistantId
	};
	if (mergedAskAiSearchParameters && Object.values(mergedAskAiSearchParameters).some((v) => v != null)) result.searchParameters = mergedAskAiSearchParameters;
	return result;
}
/**
* Resolves Algolia search options for the given language,
* merging in locale-specific overrides and language facet filters.
*/
function resolveOptionsForLanguage(options, localeIndex, lang) {
	options = deepMerge(options, options.locales?.[localeIndex] || {});
	const facetFilters = mergeLangFacetFilters(options.searchParameters?.facetFilters, lang);
	const askAi = options.askAi ? buildAskAiConfig(options.askAi, options, lang) : void 0;
	return {
		...options,
		searchParameters: {
			...options.searchParameters,
			facetFilters
		},
		askAi
	};
}
function deepMerge(target, source) {
	const result = { ...target };
	for (const key in source) {
		const value = source[key];
		if (value === void 0) continue;
		if (key === "searchParameters") {
			result[key] = value;
			continue;
		}
		if (isObject(value) && isObject(result[key])) result[key] = deepMerge(result[key], value);
		else result[key] = value;
	}
	delete result.locales;
	return result;
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/support/reactivity.js
function smartComputed(getter, comparator = (newValue, oldValue) => JSON.stringify(newValue) === JSON.stringify(oldValue)) {
	return computed((oldValue) => {
		const newValue = getter();
		return oldValue === void 0 || !comparator(newValue, oldValue) ? newValue : oldValue;
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAskAiButton.vue
var _sfc_main$5 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
	_push(`<button${ssrRenderAttrs(mergeProps({
		type: "button",
		class: "VPNavBarAskAiButton"
	}, _attrs))} data-v-3c204bf2><span class="vpi-sparkles" aria-hidden="true" data-v-3c204bf2></span></button>`);
}
var _sfc_setup$42 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAskAiButton.vue");
	return _sfc_setup$42 ? _sfc_setup$42(props, ctx) : void 0;
};
var VPNavBarAskAiButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$5, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-3c204bf2"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSearchButton",
	__ssrInlineRender: true,
	props: { text: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<button${ssrRenderAttrs(mergeProps({
				type: "button",
				class: "VPNavBarSearchButton"
			}, _attrs))} data-v-4b07264a><span class="vpi-search" aria-hidden="true" data-v-4b07264a></span><span class="text" data-v-4b07264a>${ssrInterpolate(__props.text)}</span><span class="keys" aria-hidden="true" data-v-4b07264a><kbd class="key-cmd" data-v-4b07264a>⌘</kbd><kbd class="key-ctrl" data-v-4b07264a>Ctrl</kbd><kbd data-v-4b07264a>K</kbd></span></button>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue
var _sfc_setup$41 = VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue");
	return _sfc_setup$41 ? _sfc_setup$41(props, ctx) : void 0;
};
var VPNavBarSearchButton_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarSearchButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4b07264a"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSearch_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSearch",
	__ssrInlineRender: true,
	setup(__props) {
		const VPLocalSearchBox = defineAsyncComponent(() => import("./VPLocalSearchBox.BrbOsRxE.js"));
		const VPAlgoliaSearchBox = () => null;
		const { theme, localeIndex, lang } = useData();
		const provider = "local";
		const algoliaOptions = smartComputed(() => {
			return resolveOptionsForLanguage(theme.value.search?.options || {}, localeIndex.value, lang.value);
		});
		const resolvedMode = computed(() => resolveMode(algoliaOptions.value));
		const askAiSidePanelConfig = computed(() => {
			if (!resolvedMode.value.useSidePanel) return null;
			const askAi = algoliaOptions.value.askAi;
			if (!askAi || typeof askAi === "string") return null;
			if (!askAi.sidePanel) return null;
			return askAi.sidePanel === true ? {} : askAi.sidePanel;
		});
		const askAiShortcutEnabled = computed(() => {
			return askAiSidePanelConfig.value?.keyboardShortcuts?.["Ctrl/Cmd+I"] !== false;
		});
		const openRequest = ref(null);
		let openNonce = 0;
		const loaded = ref(false);
		const actuallyLoaded = ref(false);
		onMounted(() => {});
		function loadAndOpen(target) {
			if (!loaded.value) loaded.value = true;
			openRequest.value = {
				target,
				nonce: ++openNonce
			};
		}
		const showSearch = ref(false);
		onKeyStroke("k", (event) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		onKeyStroke("/", (event) => {
			if (!isEditingContent(event)) {
				event.preventDefault();
				showSearch.value = true;
			}
		});
		function isEditingContent(event) {
			const element = event.target;
			const tagName = element.tagName;
			return element.isContentEditable || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarSearch" }, _attrs))} data-v-53cf23e4>`);
			if (unref(provider) === "algolia") {
				_push(`<!--[-->`);
				if (resolvedMode.value.showKeywordSearch) _push(ssrRenderComponent(VPNavBarSearchButton_default, {
					text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
					"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
					"aria-keyshortcuts": "/ control+k meta+k",
					onClick: ($event) => loadAndOpen("search")
				}, null, _parent));
				else _push(`<!---->`);
				if (askAiSidePanelConfig.value) _push(ssrRenderComponent(VPNavBarAskAiButton_default, {
					"aria-label": askAiSidePanelConfig.value.button?.translations?.buttonAriaLabel || "Ask AI",
					"aria-keyshortcuts": askAiShortcutEnabled.value ? "control+i meta+i" : void 0,
					onClick: ($event) => actuallyLoaded.value ? loadAndOpen("toggleAskAi") : loadAndOpen("askAi")
				}, null, _parent));
				else _push(`<!---->`);
				if (loaded.value) _push(ssrRenderComponent(unref(VPAlgoliaSearchBox), {
					"algolia-options": unref(algoliaOptions),
					"open-request": openRequest.value,
					onVnodeBeforeMount: ($event) => actuallyLoaded.value = true
				}, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			} else if (unref(provider) === "local") {
				_push(`<!--[-->`);
				_push(ssrRenderComponent(VPNavBarSearchButton_default, {
					text: unref(algoliaOptions).translations?.button?.buttonText || "Search",
					"aria-label": unref(algoliaOptions).translations?.button?.buttonAriaLabel || "Search",
					"aria-keyshortcuts": "/ control+k meta+k",
					onClick: ($event) => showSearch.value = true
				}, null, _parent));
				if (showSearch.value) _push(ssrRenderComponent(unref(VPLocalSearchBox), { onClose: ($event) => showSearch.value = false }, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue
var _sfc_setup$40 = VPNavBarSearch_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSearch_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue");
	return _sfc_setup$40 ? _sfc_setup$40(props, ctx) : void 0;
};
var VPNavBarSearch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarSearch_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-53cf23e4"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarSocialLinks",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).socialLinks) _push(ssrRenderComponent(VPSocialLinks_default, mergeProps({
				class: "VPNavBarSocialLinks",
				links: unref(theme).socialLinks
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue
var _sfc_setup$39 = VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue");
	return _sfc_setup$39 ? _sfc_setup$39(props, ctx) : void 0;
};
var VPNavBarSocialLinks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarSocialLinks_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-dcbae12f"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue?vue&type=script&setup=true&lang.ts
var VPNavBarTitle_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarTitle",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		const { hasSidebar } = useLayout();
		const { currentLang } = useLangs();
		const link = computed(() => typeof theme.value.logoLink === "string" ? theme.value.logoLink : theme.value.logoLink?.link);
		const rel = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.rel);
		const target = computed(() => typeof theme.value.logoLink === "string" ? void 0 : theme.value.logoLink?.target);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBarTitle", { "has-sidebar": unref(hasSidebar) }] }, _attrs))} data-v-c6ae2d2d><a class="title"${ssrRenderAttr("href", link.value ?? unref(normalizeLink$1)(unref(currentLang).link))}${ssrRenderAttr("rel", rel.value)}${ssrRenderAttr("target", target.value)} data-v-c6ae2d2d>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent);
			if (unref(theme).logo) _push(ssrRenderComponent(VPImage_default, {
				class: "logo",
				image: unref(theme).logo
			}, null, _parent));
			else _push(`<!---->`);
			if (unref(theme).siteTitle) _push(`<span data-v-c6ae2d2d>${unref(theme).siteTitle ?? ""}</span>`);
			else if (unref(theme).siteTitle === void 0) _push(`<span data-v-c6ae2d2d>${ssrInterpolate(unref(site).title)}</span>`);
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent);
			_push(`</a></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue
var _sfc_setup$38 = VPNavBarTitle_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarTitle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue");
	return _sfc_setup$38 ? _sfc_setup$38(props, ctx) : void 0;
};
var VPNavBarTitle_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarTitle_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c6ae2d2d"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue?vue&type=script&setup=true&lang.ts
var VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBarTranslations",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(localeLinks).length && unref(currentLang).label) _push(ssrRenderComponent(VPFlyout_default, mergeProps({
				class: "VPNavBarTranslations",
				icon: "vpi-languages",
				label: unref(theme).langMenuLabel || "Change language"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<ul class="items" data-v-c91170f6${_scopeId}><li class="title" data-v-c91170f6${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</li><!--[-->`);
						ssrRenderList(unref(localeLinks), (locale) => {
							_push(`<li data-v-c91170f6${_scopeId}>`);
							_push(ssrRenderComponent(VPMenuLink_default, {
								item: locale,
								external: false,
								lang: locale.lang,
								hreflang: locale.lang,
								rel: "alternate",
								dir: locale.dir,
								"data-allow-mismatch": "attribute"
							}, null, _parent, _scopeId));
							_push(`</li>`);
						});
						_push(`<!--]--></ul>`);
					} else return [createVNode("ul", { class: "items" }, [createVNode("li", { class: "title" }, toDisplayString(unref(currentLang).label), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
						return openBlock(), createBlock("li", { key: locale.link }, [createVNode(VPMenuLink_default, {
							item: locale,
							external: false,
							lang: locale.lang,
							hreflang: locale.lang,
							rel: "alternate",
							dir: locale.dir,
							"data-allow-mismatch": "attribute"
						}, null, 8, [
							"item",
							"lang",
							"hreflang",
							"dir"
						])]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue
var _sfc_setup$37 = VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue");
	return _sfc_setup$37 ? _sfc_setup$37(props, ctx) : void 0;
};
var VPNavBarTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBarTranslations_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c91170f6"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue?vue&type=script&setup=true&lang.ts
var VPNavBar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavBar",
	__ssrInlineRender: true,
	props: { isScreenOpen: { type: Boolean } },
	emits: ["toggle-screen"],
	setup(__props) {
		const { y } = useWindowScroll();
		const { isHome, hasSidebar } = useLayout();
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavBar", {
				"has-sidebar": unref(hasSidebar),
				"home": unref(isHome),
				"top": unref(y) === 0,
				"screen-open": __props.isScreenOpen
			}] }, _attrs))} data-v-46237fdd><div class="wrapper" data-v-46237fdd><div class="container" data-v-46237fdd><div class="title" data-v-46237fdd>`);
			_push(ssrRenderComponent(VPNavBarTitle_default, null, {
				"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
				}),
				"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
				}),
				_: 3
			}, _parent));
			_push(`</div><div class="content" data-v-46237fdd><div class="content-body" data-v-46237fdd>`);
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarSearch_default, { class: "search" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarMenu_default, { class: "menu" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarTranslations_default, { class: "translations" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarAppearance_default, { class: "appearance" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarSocialLinks_default, { class: "social-links" }, null, _parent));
			_push(ssrRenderComponent(VPNavBarExtra_default, { class: "extra" }, null, _parent));
			ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent);
			_push(ssrRenderComponent(VPNavBarHamburger_default, {
				class: "hamburger",
				active: __props.isScreenOpen,
				onClick: ($event) => _ctx.$emit("toggle-screen")
			}, null, _parent));
			_push(`</div></div></div></div><div class="divider" data-v-46237fdd><div class="divider-line" data-v-46237fdd></div></div></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue
var _sfc_setup$36 = VPNavBar_vue_vue_type_script_setup_true_lang_default.setup;
VPNavBar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue");
	return _sfc_setup$36 ? _sfc_setup$36(props, ctx) : void 0;
};
var VPNavBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavBar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-46237fdd"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenAppearance",
	__ssrInlineRender: true,
	setup(__props) {
		const { site, theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenAppearance" }, _attrs))} data-v-8c8308be><p class="text" data-v-8c8308be>${ssrInterpolate(unref(theme).darkModeSwitchLabel || "Appearance")}</p>`);
				_push(ssrRenderComponent(VPSwitchAppearance_default, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue
var _sfc_setup$35 = VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue");
	return _sfc_setup$35 ? _sfc_setup$35(props, ctx) : void 0;
};
var VPNavScreenAppearance_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenAppearance_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8c8308be"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroupLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const href = computed(() => typeof props.item.link === "function" ? props.item.link(route.data) : props.item.link);
		const isActiveLink = computed(() => {
			return isActive(route.data.relativePath, route.hash, props.item.activeMatch || href.value, !!props.item.activeMatch);
		});
		const { closeScreen } = inject(navInjectionKey);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: {
					VPNavScreenMenuGroupLink: true,
					active: isActiveLink.value
				},
				href: href.value,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick: unref(closeScreen)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-fd88926c${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue
var _sfc_setup$34 = VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue");
	return _sfc_setup$34 ? _sfc_setup$34(props, ctx) : void 0;
};
var VPNavScreenMenuGroupLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroupLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-fd88926c"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroupSection",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenuGroupSection" }, _attrs))} data-v-64525540>`);
			if (__props.text) _push(`<p class="title" data-v-64525540>${ssrInterpolate(__props.text)}</p>`);
			else _push(`<!---->`);
			_push(`<ul data-v-64525540><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<li data-v-64525540>`);
				_push(ssrRenderComponent(VPNavScreenMenuGroupLink_default, { item }, null, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue
var _sfc_setup$33 = VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue");
	return _sfc_setup$33 ? _sfc_setup$33(props, ctx) : void 0;
};
var VPNavScreenMenuGroupSection_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroupSection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-64525540"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuGroup",
	__ssrInlineRender: true,
	props: {
		text: {},
		items: {}
	},
	setup(__props) {
		const props = __props;
		const isOpen = ref(false);
		const groupId = computed(() => `NavScreenGroup-${props.text.replace(" ", "-").toLowerCase()}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavScreenMenuGroup", { open: isOpen.value }] }, _attrs))} data-v-88cd50e3><button class="button"${ssrRenderAttr("aria-controls", groupId.value)}${ssrRenderAttr("aria-expanded", isOpen.value)} data-v-88cd50e3><span class="button-text" data-v-88cd50e3>${__props.text ?? ""}</span><span class="vpi-plus button-icon" data-v-88cd50e3></span></button><ul${ssrRenderAttr("id", groupId.value)} class="items" data-v-88cd50e3><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<li data-v-88cd50e3>`);
				if ("link" in item) {
					_push(`<div class="item" data-v-88cd50e3>`);
					_push(ssrRenderComponent(VPNavScreenMenuGroupLink_default, { item }, null, _parent));
					_push(`</div>`);
				} else if ("component" in item) {
					_push(`<div class="item" data-v-88cd50e3>`);
					ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
					_push(`</div>`);
				} else {
					_push(`<div class="group" data-v-88cd50e3>`);
					_push(ssrRenderComponent(VPNavScreenMenuGroupSection_default, {
						text: item.text,
						items: item.items
					}, null, _parent));
					_push(`</div>`);
				}
				_push(`</li>`);
			});
			_push(`<!--]--></ul></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue
var _sfc_setup$32 = VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue");
	return _sfc_setup$32 ? _sfc_setup$32(props, ctx) : void 0;
};
var VPNavScreenMenuGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-88cd50e3"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenuLink",
	__ssrInlineRender: true,
	props: { item: {} },
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const href = computed(() => typeof props.item.link === "function" ? props.item.link(route.data) : props.item.link);
		const isActiveLink = computed(() => {
			return isActive(route.data.relativePath, route.hash, props.item.activeMatch || href.value, !!props.item.activeMatch);
		});
		const { closeScreen } = inject(navInjectionKey);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(VPLink_default, mergeProps({
				class: {
					VPNavScreenMenuLink: true,
					active: isActiveLink.value
				},
				href: href.value,
				target: __props.item.target,
				rel: __props.item.rel,
				"no-icon": __props.item.noIcon,
				onClick: unref(closeScreen)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-b55c914f${_scopeId}>${__props.item.text ?? ""}</span>`);
					else return [createVNode("span", { innerHTML: __props.item.text }, null, 8, ["innerHTML"])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue
var _sfc_setup$31 = VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue");
	return _sfc_setup$31 ? _sfc_setup$31(props, ctx) : void 0;
};
var VPNavScreenMenuLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenMenuLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b55c914f"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenMenu",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).nav) {
				_push(`<nav${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenu" }, _attrs))}><ul><!--[-->`);
				ssrRenderList(unref(theme).nav, (item) => {
					_push(`<li>`);
					if ("link" in item) _push(ssrRenderComponent(VPNavScreenMenuLink_default, { item }, null, _parent));
					else if ("component" in item) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
					else _push(ssrRenderComponent(VPNavScreenMenuGroup_default, {
						text: item.text || "",
						items: item.items
					}, null, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></nav>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue
var _sfc_setup$30 = VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue");
	return _sfc_setup$30 ? _sfc_setup$30(props, ctx) : void 0;
};
var VPNavScreenMenu_default = VPNavScreenMenu_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenSocialLinks",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(theme).socialLinks) _push(ssrRenderComponent(VPSocialLinks_default, mergeProps({
				class: "VPNavScreenSocialLinks",
				links: unref(theme).socialLinks
			}, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue
var _sfc_setup$29 = VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue");
	return _sfc_setup$29 ? _sfc_setup$29(props, ctx) : void 0;
};
var VPNavScreenSocialLinks_default = VPNavScreenSocialLinks_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue?vue&type=script&setup=true&lang.ts
var VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreenTranslations",
	__ssrInlineRender: true,
	setup(__props) {
		const { localeLinks, currentLang } = useLangs({ linkToCorrespondingPage: true });
		const isOpen = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(localeLinks).length && unref(currentLang).label) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPNavScreenTranslations", { open: isOpen.value }] }, _attrs))} data-v-04aeeb1d><button class="title" data-v-04aeeb1d><span class="vpi-languages icon lang" data-v-04aeeb1d></span> ${ssrInterpolate(unref(currentLang).label)} <span class="vpi-chevron-down icon chevron" data-v-04aeeb1d></span></button><ul class="list" data-v-04aeeb1d><!--[-->`);
				ssrRenderList(unref(localeLinks), (locale) => {
					_push(`<li class="item" data-v-04aeeb1d>`);
					_push(ssrRenderComponent(VPLink_default, {
						class: "link",
						href: locale.link,
						external: false,
						lang: locale.lang,
						hreflang: locale.lang,
						rel: "alternate",
						dir: locale.dir,
						"data-allow-mismatch": "attribute"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`${ssrInterpolate(locale.text)}`);
							else return [createTextVNode(toDisplayString(locale.text), 1)];
						}),
						_: 2
					}, _parent));
					_push(`</li>`);
				});
				_push(`<!--]--></ul></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue
var _sfc_setup$28 = VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue");
	return _sfc_setup$28 ? _sfc_setup$28(props, ctx) : void 0;
};
var VPNavScreenTranslations_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreenTranslations_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-04aeeb1d"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue?vue&type=script&setup=true&lang.ts
var VPNavScreen_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNavScreen",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	setup(__props) {
		useScrollLock(inBrowser ? document.body : null);
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.open) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					class: "VPNavScreen",
					id: "VPNavScreen"
				}, _attrs))} data-v-8740b945><div class="container" data-v-8740b945>`);
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPNavScreenMenu_default, { class: "menu" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenTranslations_default, { class: "translations" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenAppearance_default, { class: "appearance" }, null, _parent));
				_push(ssrRenderComponent(VPNavScreenSocialLinks_default, { class: "social-links" }, null, _parent));
				ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent);
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue
var _sfc_setup$27 = VPNavScreen_vue_vue_type_script_setup_true_lang_default.setup;
VPNavScreen_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue");
	return _sfc_setup$27 ? _sfc_setup$27(props, ctx) : void 0;
};
var VPNavScreen_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNavScreen_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8740b945"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue?vue&type=script&setup=true&lang.ts
var VPNav_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPNav",
	__ssrInlineRender: true,
	setup(__props) {
		const { isScreenOpen, closeScreen, toggleScreen } = useNav();
		const { frontmatter } = useData();
		const hasNavbar = computed(() => {
			return frontmatter.value.navbar !== false;
		});
		provide(navInjectionKey, { closeScreen });
		watchEffect(() => {
			if (inBrowser) document.documentElement.classList.toggle("hide-nav", !hasNavbar.value);
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (hasNavbar.value) {
				_push(`<header${ssrRenderAttrs(mergeProps({ class: "VPNav" }, _attrs))} data-v-451aa779>`);
				_push(ssrRenderComponent(VPNavBar_default, {
					"is-screen-open": unref(isScreenOpen),
					onToggleScreen: unref(toggleScreen)
				}, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPNavScreen_default, { open: unref(isScreenOpen) }, {
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(`</header>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue
var _sfc_setup$26 = VPNav_vue_vue_type_script_setup_true_lang_default.setup;
VPNav_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue");
	return _sfc_setup$26 ? _sfc_setup$26(props, ctx) : void 0;
};
var VPNav_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPNav_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-451aa779"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue?vue&type=script&setup=true&lang.ts
var VPSidebarItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebarItem",
	__ssrInlineRender: true,
	props: {
		item: {},
		depth: {}
	},
	setup(__props) {
		const props = __props;
		const { collapsed, collapsible, isLink, isActiveLink, hasActiveLink, hasChildren, toggle } = useSidebarItemControl(computed(() => props.item));
		const sectionTag = computed(() => hasChildren.value ? "section" : `div`);
		const linkTag = computed(() => isLink.value ? "a" : "div");
		const textTag = computed(() => {
			return !hasChildren.value ? "p" : props.depth + 2 === 7 ? "p" : `h${props.depth + 2}`;
		});
		const itemRole = computed(() => isLink.value ? void 0 : "button");
		const classes = computed(() => [
			[`level-${props.depth}`],
			{ collapsible: collapsible.value },
			{ collapsed: collapsed.value },
			{ "is-link": isLink.value },
			{ "is-active": isActiveLink.value },
			{ "has-active": hasActiveLink.value }
		]);
		function onItemInteraction(e) {
			if ("key" in e && e.key !== "Enter") return;
			!props.item.link && toggle();
		}
		function onCaretClick() {
			props.item.link && toggle();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_VPSidebarItem = resolveComponent("VPSidebarItem", true);
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(sectionTag.value), mergeProps({ class: ["VPSidebarItem", classes.value] }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.item.text) {
							_push(`<div class="item"${ssrRenderAttr("role", itemRole.value)}${ssrRenderAttr("tabindex", __props.item.items && 0)} data-v-a04142d1${_scopeId}><div class="indicator" data-v-a04142d1${_scopeId}></div>`);
							if (__props.item.link) _push(ssrRenderComponent(VPLink_default, {
								tag: linkTag.value,
								class: "link",
								href: __props.item.link,
								rel: __props.item.rel,
								target: __props.item.target
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
									else return [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
										class: "text",
										innerHTML: __props.item.text
									}, null, 8, ["innerHTML"]))];
								}),
								_: 1
							}, _parent, _scopeId));
							else ssrRenderVNode(_push, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent, _scopeId);
							if (__props.item.collapsed != null && __props.item.items && __props.item.items.length) _push(`<div class="caret" role="button" aria-label="toggle section" tabindex="0" data-v-a04142d1${_scopeId}><span class="vpi-chevron-right caret-icon" data-v-a04142d1${_scopeId}></span></div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (__props.item.items && __props.item.items.length) {
							_push(`<ul class="items" data-v-a04142d1${_scopeId}>`);
							if (__props.depth < 5) {
								_push(`<li data-v-a04142d1${_scopeId}><!--[-->`);
								ssrRenderList(__props.item.items, (i) => {
									_push(ssrRenderComponent(_component_VPSidebarItem, {
										key: i.text,
										item: i,
										depth: __props.depth + 1
									}, null, _parent, _scopeId));
								});
								_push(`<!--]--></li>`);
							} else _push(`<!---->`);
							_push(`</ul>`);
						} else _push(`<!---->`);
					} else return [__props.item.text ? (openBlock(), createBlock("div", mergeProps({
						key: 0,
						class: "item",
						role: itemRole.value
					}, toHandlers(__props.item.items ? {
						click: onItemInteraction,
						keydown: onItemInteraction
					} : {}, true), { tabindex: __props.item.items && 0 }), [
						createVNode("div", { class: "indicator" }),
						__props.item.link ? (openBlock(), createBlock(VPLink_default, {
							key: 0,
							tag: linkTag.value,
							class: "link",
							href: __props.item.link,
							rel: __props.item.rel,
							target: __props.item.target
						}, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
								class: "text",
								innerHTML: __props.item.text
							}, null, 8, ["innerHTML"]))]),
							_: 1
						}, 8, [
							"tag",
							"href",
							"rel",
							"target"
						])) : (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
							key: 1,
							class: "text",
							innerHTML: __props.item.text
						}, null, 8, ["innerHTML"])),
						__props.item.collapsed != null && __props.item.items && __props.item.items.length ? (openBlock(), createBlock("div", {
							key: 2,
							class: "caret",
							role: "button",
							"aria-label": "toggle section",
							onClick: onCaretClick,
							onKeydown: withKeys(onCaretClick, ["enter"]),
							tabindex: "0"
						}, [createVNode("span", { class: "vpi-chevron-right caret-icon" })], 32)) : createCommentVNode("", true)
					], 16, ["role", "tabindex"])) : createCommentVNode("", true), __props.item.items && __props.item.items.length ? (openBlock(), createBlock("ul", {
						key: 1,
						class: "items"
					}, [__props.depth < 5 ? (openBlock(), createBlock("li", { key: 0 }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.item.items, (i) => {
						return openBlock(), createBlock(_component_VPSidebarItem, {
							key: i.text,
							item: i,
							depth: __props.depth + 1
						}, null, 8, ["item", "depth"]);
					}), 128))])) : createCommentVNode("", true)])) : createCommentVNode("", true)];
				}),
				_: 1
			}), _parent);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue
var _sfc_setup$25 = VPSidebarItem_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebarItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue");
	return _sfc_setup$25 ? _sfc_setup$25(props, ctx) : void 0;
};
var VPSidebarItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebarItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a04142d1"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue?vue&type=script&setup=true&lang.ts
var VPSidebarGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebarGroup",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		const disableTransition = ref(true);
		let timer = null;
		onMounted(() => {
			timer = setTimeout(() => {
				timer = null;
				disableTransition.value = false;
			}, 300);
		});
		onBeforeUnmount(() => {
			if (timer != null) {
				clearTimeout(timer);
				timer = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<div class="${ssrRenderClass([{ "no-transition": disableTransition.value }, "group"])}" data-v-25b227b5>`);
				_push(ssrRenderComponent(VPSidebarItem_default, {
					item,
					depth: 0
				}, null, _parent));
				_push(`</div>`);
			});
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue
var _sfc_setup$24 = VPSidebarGroup_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebarGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue");
	return _sfc_setup$24 ? _sfc_setup$24(props, ctx) : void 0;
};
var VPSidebarGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebarGroup_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-25b227b5"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue?vue&type=script&setup=true&lang.ts
var VPSidebar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSidebar",
	__ssrInlineRender: true,
	props: { open: { type: Boolean } },
	setup(__props) {
		const { sidebarGroups, hasSidebar } = useLayout();
		const props = __props;
		const navEl = ref(null);
		const isLocked = useScrollLock(inBrowser ? document.body : null);
		watch([props, navEl], () => {
			if (props.open) {
				isLocked.value = true;
				navEl.value?.focus();
			} else isLocked.value = false;
		}, {
			immediate: true,
			flush: "post"
		});
		const key = ref(0);
		watch(sidebarGroups, () => {
			key.value += 1;
		}, { deep: true });
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(hasSidebar)) {
				_push(`<aside${ssrRenderAttrs(mergeProps({
					class: ["VPSidebar", { open: __props.open }],
					ref_key: "navEl",
					ref: navEl
				}, _attrs))} data-v-78e317fd><div class="curtain" data-v-78e317fd></div><nav class="nav" id="VPSidebarNav" aria-labelledby="sidebar-aria-label" tabindex="-1" data-v-78e317fd><span class="visually-hidden" id="sidebar-aria-label" data-v-78e317fd> Sidebar Navigation </span>`);
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSidebarGroup_default, {
					items: unref(sidebarGroups),
					key: key.value
				}, null, _parent));
				ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent);
				_push(`</nav></aside>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue
var _sfc_setup$23 = VPSidebar_vue_vue_type_script_setup_true_lang_default.setup;
VPSidebar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue");
	return _sfc_setup$23 ? _sfc_setup$23(props, ctx) : void 0;
};
var VPSidebar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSidebar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-78e317fd"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue?vue&type=script&setup=true&lang.ts
var VPSkipLink_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSkipLink",
	__ssrInlineRender: true,
	setup(__props) {
		const { theme } = useData();
		const route = useRoute();
		const backToTop = ref();
		watch(() => route.path, () => backToTop.value.focus());
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><span tabindex="-1" data-v-67cb78cd></span><a href="#VPContent" class="VPSkipLink visually-hidden" data-v-67cb78cd>${ssrInterpolate(unref(theme).skipToContentLabel || "Skip to content")}</a><!--]-->`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue
var _sfc_setup$22 = VPSkipLink_vue_vue_type_script_setup_true_lang_default.setup;
VPSkipLink_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
var VPSkipLink_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPSkipLink_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-67cb78cd"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/Layout.vue?vue&type=script&setup=true&lang.ts
var Layout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Layout",
	__ssrInlineRender: true,
	setup(__props) {
		const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebarControl();
		registerWatchers({ closeSidebar });
		const { frontmatter } = useData();
		const slots = useSlots();
		const heroImageSlotExists = computed(() => !!slots["home-hero-image"]);
		provide(layoutInfoInjectionKey, { heroImageSlotExists });
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Content = resolveComponent("Content");
			if (unref(frontmatter).layout !== false) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: ["Layout", unref(frontmatter).pageClass] }, _attrs))} data-v-c4cadabc>`);
				ssrRenderSlot(_ctx.$slots, "layout-top", {}, null, _push, _parent);
				_push(ssrRenderComponent(VPSkipLink_default, null, null, _parent));
				_push(ssrRenderComponent(VPBackdrop_default, {
					class: "backdrop",
					show: unref(isSidebarOpen),
					onClick: unref(closeSidebar)
				}, null, _parent));
				_push(ssrRenderComponent(VPNav_default, null, {
					"nav-bar-title-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)];
					}),
					"nav-bar-title-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)];
					}),
					"nav-bar-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)];
					}),
					"nav-bar-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)];
					}),
					"nav-screen-content-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)];
					}),
					"nav-screen-content-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPLocalNav_default, {
					open: unref(isSidebarOpen),
					onOpenMenu: unref(openSidebar)
				}, null, _parent));
				_push(ssrRenderComponent(VPSidebar_default, { open: unref(isSidebarOpen) }, {
					"sidebar-nav-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true)];
					}),
					"sidebar-nav-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPContent_default, null, {
					"page-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-top", {}, void 0, true)];
					}),
					"page-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)];
					}),
					"not-found": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "not-found", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "not-found", {}, void 0, true)];
					}),
					"home-hero-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)];
					}),
					"home-hero-info-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)];
					}),
					"home-hero-info": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)];
					}),
					"home-hero-info-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)];
					}),
					"home-hero-actions-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)];
					}),
					"home-hero-actions-before-actions": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-actions-before-actions", {}, void 0, true)];
					}),
					"home-hero-image": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)];
					}),
					"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)];
					}),
					"home-features-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)];
					}),
					"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)];
					}),
					"doc-footer-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)];
					}),
					"doc-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)];
					}),
					"doc-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)];
					}),
					"doc-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)];
					}),
					"doc-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)];
					}),
					"aside-top": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)];
					}),
					"aside-bottom": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)];
					}),
					"aside-outline-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)];
					}),
					"aside-outline-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)];
					}),
					"aside-ads-before": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)];
					}),
					"aside-ads-after": withCtx((_, _push, _parent, _scopeId) => {
						if (_push) ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent, _scopeId);
						else return [renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)];
					}),
					_: 3
				}, _parent));
				_push(ssrRenderComponent(VPFooter_default, null, null, _parent));
				ssrRenderSlot(_ctx.$slots, "layout-bottom", {}, null, _push, _parent);
				_push(`</div>`);
			} else _push(ssrRenderComponent(_component_Content, _attrs, null, _parent));
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/Layout.vue
var _sfc_setup$21 = Layout_vue_vue_type_script_setup_true_lang_default.setup;
Layout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/Layout.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var Layout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(Layout_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c4cadabc"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/composables/sponsor-grid.js
/**
* Defines grid configuration for each sponsor size in tuple.
*
* [Screen width, Column size]
*
* It sets grid size on matching screen size. For example, `[768, 5]` will
* set 5 columns when screen size is bigger or equal to 768px.
*
* Column will set only when item size is bigger than the column size. For
* example, even we define 5 columns, if we only have 1 sponsor yet, we would
* like to show it in 1 column to make it stand out.
*/
var GridSettings = {
	xmini: [[0, 2]],
	mini: [],
	small: [
		[920, 6],
		[768, 5],
		[640, 4],
		[480, 3],
		[0, 2]
	],
	medium: [
		[960, 5],
		[832, 4],
		[640, 3],
		[480, 2]
	],
	big: [[832, 3], [640, 2]]
};
function useSponsorsGrid({ el, size = "medium" }) {
	const onResize = throttleAndDebounce(manage, 100);
	onMounted(() => {
		manage();
		window.addEventListener("resize", onResize);
	});
	onUnmounted(() => {
		window.removeEventListener("resize", onResize);
	});
	function manage() {
		adjustSlots(el.value, size);
	}
}
function adjustSlots(el, size) {
	const tsize = el.children.length;
	const asize = el.querySelectorAll(".vp-sponsor-grid-item:not(.empty)").length;
	manageSlots(el, setGrid(el, size, asize), tsize, asize);
}
function setGrid(el, size, items) {
	const settings = GridSettings[size];
	const screen = window.innerWidth;
	let grid = 1;
	settings.some(([breakpoint, value]) => {
		if (screen >= breakpoint) {
			grid = items < value ? items : value;
			return true;
		}
	});
	setGridData(el, grid);
	return grid;
}
function setGridData(el, value) {
	el.dataset.vpGrid = String(value);
}
function manageSlots(el, grid, tsize, asize) {
	const diff = tsize - asize;
	const rem = asize % grid;
	neutralizeSlots(el, (rem === 0 ? rem : grid - rem) - diff);
}
function neutralizeSlots(el, count) {
	if (count === 0) return;
	count > 0 ? addSlots(el, count) : removeSlots(el, count * -1);
}
function addSlots(el, count) {
	for (let i = 0; i < count; i++) {
		const slot = document.createElement("div");
		slot.classList.add("vp-sponsor-grid-item", "empty");
		el.append(slot);
	}
}
function removeSlots(el, count) {
	for (let i = 0; i < count; i++) el.removeChild(el.lastElementChild);
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue?vue&type=script&setup=true&lang.ts
var VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSponsorsGrid",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		data: {}
	},
	setup(__props) {
		const props = __props;
		const el = ref(null);
		useSponsorsGrid({
			el,
			size: props.size
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<ul${ssrRenderAttrs(mergeProps({
				class: ["VPSponsorsGrid vp-sponsor-grid", [__props.size]],
				ref_key: "el",
				ref: el
			}, _attrs))}><!--[-->`);
			ssrRenderList(__props.data, (sponsor) => {
				_push(`<li class="vp-sponsor-grid-item"><a class="vp-sponsor-grid-link"${ssrRenderAttr("href", sponsor.url)} target="_blank" rel="sponsored noopener"><article class="vp-sponsor-grid-box"><img class="vp-sponsor-grid-image"${ssrRenderAttr("src", sponsor.img)}${ssrRenderAttr("alt", sponsor.name)}></article></a></li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue
var _sfc_setup$20 = VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default.setup;
VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var VPSponsorsGrid_default = VPSponsorsGrid_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue?vue&type=script&setup=true&lang.ts
var VPSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPSponsors",
	__ssrInlineRender: true,
	props: {
		mode: { default: "normal" },
		tier: {},
		size: {},
		data: {}
	},
	setup(__props) {
		const props = __props;
		const sponsors = computed(() => {
			if (props.data.some((s) => {
				return "items" in s;
			})) return props.data;
			return [{
				tier: props.tier,
				size: props.size,
				items: props.data
			}];
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPSponsors vp-sponsor", [__props.mode]] }, _attrs))}><!--[-->`);
			ssrRenderList(sponsors.value, (sponsor, index) => {
				_push(`<section class="vp-sponsor-section">`);
				if (sponsor.tier) _push(`<h3 class="vp-sponsor-tier">${ssrInterpolate(sponsor.tier)}</h3>`);
				else _push(`<!---->`);
				_push(ssrRenderComponent(VPSponsorsGrid_default, {
					size: sponsor.size,
					data: sponsor.items
				}, null, _parent));
				_push(`</section>`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue
var _sfc_setup$19 = VPSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var VPSponsors_default = VPSponsors_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue?vue&type=script&setup=true&lang.ts
var VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPDocAsideSponsors",
	__ssrInlineRender: true,
	props: {
		tier: {},
		size: {},
		data: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideSponsors" }, _attrs))}>`);
			_push(ssrRenderComponent(VPSponsors_default, {
				mode: "aside",
				tier: __props.tier,
				size: __props.size,
				data: __props.data
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue
var _sfc_setup$18 = VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPDocAsideSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue?vue&type=script&setup=true&lang.ts
var VPHomeSponsors_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPHomeSponsors",
	__ssrInlineRender: true,
	props: {
		message: {},
		actionText: { default: "Become a sponsor" },
		actionLink: {},
		data: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({ class: "VPHomeSponsors" }, _attrs))} data-v-bdf7305c><div class="container" data-v-bdf7305c><div class="header" data-v-bdf7305c><div class="love" data-v-bdf7305c><span class="vpi-heart icon" data-v-bdf7305c></span></div>`);
			if (__props.message) _push(`<h2 class="message" data-v-bdf7305c>${ssrInterpolate(__props.message)}</h2>`);
			else _push(`<!---->`);
			_push(`</div><div class="sponsors" data-v-bdf7305c>`);
			_push(ssrRenderComponent(VPSponsors_default, { data: __props.data }, null, _parent));
			_push(`</div>`);
			if (__props.actionLink) {
				_push(`<div class="action" data-v-bdf7305c>`);
				_push(ssrRenderComponent(VPButton_default, {
					theme: "sponsor",
					text: __props.actionText,
					href: __props.actionLink
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></section>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue
var _sfc_setup$17 = VPHomeSponsors_vue_vue_type_script_setup_true_lang_default.setup;
VPHomeSponsors_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue?vue&type=script&setup=true&lang.ts
var VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPTeamMembersItem",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		member: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<article${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembersItem", [__props.size]] }, _attrs))} data-v-3573dac8><div class="profile" data-v-3573dac8><figure class="avatar" data-v-3573dac8><img class="avatar-img"${ssrRenderAttr("src", __props.member.avatar)}${ssrRenderAttr("alt", __props.member.name)} data-v-3573dac8></figure><div class="data" data-v-3573dac8><h1 class="name" data-v-3573dac8>${ssrInterpolate(__props.member.name)}</h1>`);
			if (__props.member.title || __props.member.org) {
				_push(`<p class="affiliation" data-v-3573dac8>`);
				if (__props.member.title) _push(`<span class="title" data-v-3573dac8>${ssrInterpolate(__props.member.title)}</span>`);
				else _push(`<!---->`);
				if (__props.member.title && __props.member.org) _push(`<span class="at" data-v-3573dac8> @ </span>`);
				else _push(`<!---->`);
				if (__props.member.org) _push(ssrRenderComponent(VPLink_default, {
					class: ["org", { link: __props.member.orgLink }],
					href: __props.member.orgLink,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(__props.member.org)}`);
						else return [createTextVNode(toDisplayString(__props.member.org), 1)];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</p>`);
			} else _push(`<!---->`);
			if (__props.member.desc) _push(`<p class="desc" data-v-3573dac8>${__props.member.desc ?? ""}</p>`);
			else _push(`<!---->`);
			if (__props.member.links) {
				_push(`<div class="links" data-v-3573dac8>`);
				_push(ssrRenderComponent(VPSocialLinks_default, {
					links: __props.member.links,
					me: false
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (__props.member.sponsor) {
				_push(`<div class="sp" data-v-3573dac8>`);
				_push(ssrRenderComponent(VPLink_default, {
					class: "sp-link",
					href: __props.member.sponsor,
					"no-icon": ""
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<span class="vpi-heart sp-icon" data-v-3573dac8${_scopeId}></span> ${ssrInterpolate(__props.member.actionText || "Sponsor")}`);
						else return [createVNode("span", { class: "vpi-heart sp-icon" }), createTextVNode(" " + toDisplayString(__props.member.actionText || "Sponsor"), 1)];
					}),
					_: 1
				}, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</article>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue
var _sfc_setup$16 = VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default.setup;
VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var VPTeamMembersItem_default = /*#__PURE__*/ _plugin_vue_export_helper_default(VPTeamMembersItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3573dac8"]]);
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue?vue&type=script&setup=true&lang.ts
var VPTeamMembers_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "VPTeamMembers",
	__ssrInlineRender: true,
	props: {
		size: { default: "medium" },
		members: {}
	},
	setup(__props) {
		const props = __props;
		const classes = computed(() => [props.size, `count-${props.members.length}`]);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["VPTeamMembers", classes.value] }, _attrs))} data-v-a69f599f><ul class="container" data-v-a69f599f><!--[-->`);
			ssrRenderList(__props.members, (member) => {
				_push(`<li class="item" data-v-a69f599f>`);
				_push(ssrRenderComponent(VPTeamMembersItem_default, {
					size: __props.size,
					member
				}, null, _parent));
				_push(`</li>`);
			});
			_push(`<!--]--></ul></div>`);
		};
	}
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue
var _sfc_setup$15 = VPTeamMembers_vue_vue_type_script_setup_true_lang_default.setup;
VPTeamMembers_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue
var _sfc_main$4 = {};
var _sfc_setup$14 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue
var _sfc_main$3 = {};
var _sfc_setup$13 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue
var _sfc_main$2 = {};
var _sfc_setup$12 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/theme-default/without-fonts.js
var theme = {
	Layout: Layout_default,
	enhanceApp: ({ app }) => {
		app.component("Badge", VPBadge_default);
	}
};
//#endregion
//#region ../../../../../screenshot.png
var screenshot_default = "/screenshot.png";
//#endregion
//#region .vitepress/theme/SchemaOrg.vue?vue&type=script&setup=true&lang.ts
var SchemaOrg_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SchemaOrg",
	__ssrInlineRender: true,
	setup(__props) {
		const { page } = useData$1();
		const isEnHome = page.value.relativePath === "index.md";
		const schema = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "OpenPencil",
			applicationCategory: "DesignApplication",
			operatingSystem: "Windows, macOS, Linux, Web",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD"
			},
			url: "https://app.openpencil.dev",
			description: "Open-source, AI-native design editor. Figma-compatible with full .fig file support.",
			softwareVersion: "0.8.0",
			license: "https://opensource.org/licenses/MIT",
			screenshot: "https://openpencil.dev/screenshot.png",
			downloadUrl: "https://github.com/open-pencil/open-pencil/releases/latest",
			featureList: [
				"Open .fig files natively",
				"AI chat with 78 design tools",
				"MCP server for AI coding tools",
				"P2P real-time collaboration",
				"Headless CLI for automation",
				"Desktop app via Tauri"
			]
		});
		return (_ctx, _push, _parent, _attrs) => {
			if (isEnHome) ssrRenderVNode(_push, createVNode(resolveDynamicComponent("script"), mergeProps({ type: "application/ld+json" }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(unref(schema))}`);
					else return [createTextVNode(toDisplayString(unref(schema)), 1)];
				}),
				_: 1
			}), _parent);
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region .vitepress/theme/SchemaOrg.vue
var _sfc_setup$11 = SchemaOrg_vue_vue_type_script_setup_true_lang_default.setup;
SchemaOrg_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/SchemaOrg.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var SchemaOrg_default = SchemaOrg_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/HomeLayout.vue?vue&type=script&setup=true&lang.ts
var HomeLayout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "HomeLayout",
	__ssrInlineRender: true,
	setup(__props) {
		const { Layout } = theme;
		const { frontmatter } = useData$1();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Layout), _attrs, {
				"home-hero-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(frontmatter).layout === "home") _push(`<div class="screenshot" data-v-33ef95b5${_scopeId}><img${ssrRenderAttr("src", screenshot_default)} alt="OpenPencil editor with a Material 3 design file open" data-v-33ef95b5${_scopeId}></div>`);
						else _push(`<!---->`);
					} else return [unref(frontmatter).layout === "home" ? (openBlock(), createBlock("div", {
						key: 0,
						class: "screenshot"
					}, [createVNode("img", {
						src: screenshot_default,
						alt: "OpenPencil editor with a Material 3 design file open"
					})])) : createCommentVNode("", true)];
				}),
				"home-features-after": withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(SchemaOrg_default, null, null, _parent, _scopeId));
					else return [createVNode(SchemaOrg_default)];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region .vitepress/theme/HomeLayout.vue
var _sfc_setup$10 = HomeLayout_vue_vue_type_script_setup_true_lang_default.setup;
HomeLayout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/HomeLayout.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var HomeLayout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(HomeLayout_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-33ef95b5"]]);
//#endregion
//#region .vitepress/theme/components/SdkCard.vue?vue&type=script&setup=true&lang.ts
var SdkCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkCard",
	__ssrInlineRender: true,
	props: {
		title: {},
		to: {},
		description: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				href: __props.to,
				class: "sdk-card"
			}, _attrs))} data-v-a2401eda><div class="sdk-card__title" data-v-a2401eda>${ssrInterpolate(__props.title)}</div>`);
			if (__props.description) _push(`<div class="sdk-card__description" data-v-a2401eda>${ssrInterpolate(__props.description)}</div>`);
			else _push(`<!---->`);
			_push(`</a>`);
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkCard.vue
var _sfc_setup$9 = SdkCard_vue_vue_type_script_setup_true_lang_default.setup;
SdkCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkCard.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var SdkCard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(SdkCard_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a2401eda"]]);
//#endregion
//#region .vitepress/theme/components/SdkCardGroup.vue
var _sfc_main$1 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "sdk-card-group" }, _attrs))} data-v-4b4c9ebf>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$8 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkCardGroup.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var SdkCardGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-4b4c9ebf"]]);
//#endregion
//#region .vitepress/theme/components/SdkDataTable.vue?vue&type=script&setup=true&lang.ts
var SdkDataTable_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkDataTable",
	__ssrInlineRender: true,
	props: {
		columns: {},
		rows: {},
		rowKey: {}
	},
	setup(__props) {
		function cellValue(row, key) {
			const value = row[key];
			return typeof value === "string" ? value : "";
		}
		function isRequired(row) {
			return row.required === true;
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "sdk-table-wrap" }, _attrs))} data-v-e91ec107><table class="sdk-table" data-v-e91ec107><thead data-v-e91ec107><tr data-v-e91ec107><!--[-->`);
			ssrRenderList(__props.columns, (column) => {
				_push(`<th data-v-e91ec107>${ssrInterpolate(column.label)}</th>`);
			});
			_push(`<!--]--></tr></thead><tbody data-v-e91ec107><!--[-->`);
			ssrRenderList(__props.rows, (row) => {
				_push(`<tr data-v-e91ec107><!--[-->`);
				ssrRenderList(__props.columns, (column) => {
					_push(`<td data-v-e91ec107>`);
					if (column.kind === "code") {
						_push(`<!--[--><code class="sdk-table__code" data-v-e91ec107>${ssrInterpolate(cellValue(row, column.key))}`);
						if (column.key === "name" && isRequired(row)) _push(`<span data-v-e91ec107>*</span>`);
						else _push(`<!---->`);
						_push(`</code>`);
						if (row.description) _push(`<div class="sdk-table__description" data-v-e91ec107>${ssrInterpolate(row.description)}</div>`);
						else _push(`<!---->`);
						_push(`<!--]-->`);
					} else if (column.kind === "chip") {
						_push(`<!--[-->`);
						if (cellValue(row, column.key)) _push(`<code class="sdk-table__chip" data-v-e91ec107>${ssrInterpolate(cellValue(row, column.key))}</code>`);
						else _push(`<span data-v-e91ec107>—</span>`);
						_push(`<!--]-->`);
					} else if (column.kind === "description") _push(`<span class="sdk-table__description-cell" data-v-e91ec107>${ssrInterpolate(cellValue(row, column.key))}</span>`);
					else _push(`<!--[-->${ssrInterpolate(cellValue(row, column.key) || "—")}<!--]-->`);
					_push(`</td>`);
				});
				_push(`<!--]--></tr>`);
			});
			_push(`<!--]--></tbody></table></div>`);
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkDataTable.vue
var _sfc_setup$7 = SdkDataTable_vue_vue_type_script_setup_true_lang_default.setup;
SdkDataTable_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkDataTable.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var SdkDataTable_default = /*#__PURE__*/ _plugin_vue_export_helper_default(SdkDataTable_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e91ec107"]]);
//#endregion
//#region .vitepress/theme/components/SdkEventsTable.vue?vue&type=script&setup=true&lang.ts
var SdkEventsTable_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkEventsTable",
	__ssrInlineRender: true,
	props: { rows: {} },
	setup(__props) {
		const columns = [
			{
				key: "name",
				label: "Event",
				kind: "code"
			},
			{
				key: "payload",
				label: "Payload",
				kind: "chip"
			},
			{
				key: "description",
				label: "Description",
				kind: "description"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(SdkDataTable_default, mergeProps({
				columns,
				rows: __props.rows
			}, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkEventsTable.vue
var _sfc_setup$6 = SdkEventsTable_vue_vue_type_script_setup_true_lang_default.setup;
SdkEventsTable_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkEventsTable.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var SdkEventsTable_default = SdkEventsTable_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/components/SdkPropsTable.vue?vue&type=script&setup=true&lang.ts
var SdkPropsTable_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkPropsTable",
	__ssrInlineRender: true,
	props: { rows: {} },
	setup(__props) {
		const columns = [
			{
				key: "name",
				label: "Prop",
				kind: "code"
			},
			{
				key: "default",
				label: "Default",
				kind: "chip"
			},
			{
				key: "type",
				label: "Type",
				kind: "chip"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(SdkDataTable_default, mergeProps({
				columns,
				rows: __props.rows
			}, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkPropsTable.vue
var _sfc_setup$5 = SdkPropsTable_vue_vue_type_script_setup_true_lang_default.setup;
SdkPropsTable_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkPropsTable.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var SdkPropsTable_default = SdkPropsTable_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/components/SdkSlotsTable.vue?vue&type=script&setup=true&lang.ts
var SdkSlotsTable_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkSlotsTable",
	__ssrInlineRender: true,
	props: { rows: {} },
	setup(__props) {
		const columns = [
			{
				key: "name",
				label: "Slot",
				kind: "code"
			},
			{
				key: "props",
				label: "Props",
				kind: "chip"
			},
			{
				key: "description",
				label: "Description",
				kind: "description"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(SdkDataTable_default, mergeProps({
				columns,
				rows: __props.rows
			}, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkSlotsTable.vue
var _sfc_setup$4 = SdkSlotsTable_vue_vue_type_script_setup_true_lang_default.setup;
SdkSlotsTable_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkSlotsTable.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var SdkSlotsTable_default = SdkSlotsTable_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/components/SdkComponentAPI.vue?vue&type=script&setup=true&lang.ts
var SdkComponentAPI_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkComponentAPI",
	__ssrInlineRender: true,
	props: { components: {} },
	setup(__props) {
		const exposeColumns = [
			{
				key: "name",
				label: "Exposed",
				kind: "code"
			},
			{
				key: "type",
				label: "Type",
				kind: "chip"
			},
			{
				key: "description",
				label: "Description",
				kind: "description"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.components, (component) => {
				_push(`<section class="mt-8 first:mt-0"><h3${ssrRenderAttr("id", component.name.toLowerCase())}>${ssrInterpolate(component.name)}</h3><p class="text-sm text-[var(--vp-c-text-2)]"> Generated from <code>${ssrInterpolate(component.source)}</code></p>`);
				if (!component.props.length && !component.events.length && !component.slots.length && !component.exposed.length) _push(`<p class="text-sm text-[var(--vp-c-text-2)]"> No component-specific props, events, slots, or exposed members. </p>`);
				else _push(`<!---->`);
				if (component.props.length) {
					_push(`<!--[--><h4>Props</h4>`);
					_push(ssrRenderComponent(SdkPropsTable_default, { rows: component.props }, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (component.events.length) {
					_push(`<!--[--><h4>Events</h4>`);
					_push(ssrRenderComponent(SdkEventsTable_default, { rows: component.events }, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (component.slots.length) {
					_push(`<!--[--><h4>Slots</h4>`);
					_push(ssrRenderComponent(SdkSlotsTable_default, { rows: component.slots }, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (component.exposed.length) {
					_push(`<!--[--><h4>Exposed</h4>`);
					_push(ssrRenderComponent(SdkDataTable_default, {
						columns: exposeColumns,
						rows: component.exposed
					}, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				_push(`</section>`);
			});
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkComponentAPI.vue
var _sfc_setup$3 = SdkComponentAPI_vue_vue_type_script_setup_true_lang_default.setup;
SdkComponentAPI_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkComponentAPI.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var SdkComponentAPI_default = SdkComponentAPI_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/components/SdkField.vue?vue&type=script&setup=true&lang.ts
var SdkField_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkField",
	__ssrInlineRender: true,
	props: {
		name: {},
		type: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3" }, _attrs))}><div class="flex flex-wrap items-center gap-2"><code class="text-sm font-medium text-white">${ssrInterpolate(__props.name)}</code>`);
			if (__props.type) _push(`<code class="text-xs text-violet-300">${ssrInterpolate(__props.type)}</code>`);
			else _push(`<!---->`);
			_push(`</div><div class="mt-2 text-sm text-zinc-300">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkField.vue
var _sfc_setup$2 = SdkField_vue_vue_type_script_setup_true_lang_default.setup;
SdkField_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkField.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var SdkField_default = SdkField_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/components/SdkFieldGroup.vue
var _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "mt-6 space-y-3" }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$1 = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkFieldGroup.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var SdkFieldGroup_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region .vitepress/theme/components/SdkRelatedLinks.vue?vue&type=script&setup=true&lang.ts
var SdkRelatedLinks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SdkRelatedLinks",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<ul${ssrRenderAttrs(mergeProps({ class: "mt-4 space-y-2" }, _attrs))}><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<li><a${ssrRenderAttr("href", item.to)} class="text-sm text-violet-300 hover:text-violet-200">${ssrInterpolate(item.text)}</a></li>`);
			});
			_push(`<!--]--></ul>`);
		};
	}
});
//#endregion
//#region .vitepress/theme/components/SdkRelatedLinks.vue
var _sfc_setup = SdkRelatedLinks_vue_vue_type_script_setup_true_lang_default.setup;
SdkRelatedLinks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/SdkRelatedLinks.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var SdkRelatedLinks_default = SdkRelatedLinks_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region .vitepress/theme/index.ts
var theme_default = {
	extends: theme,
	Layout: HomeLayout_default,
	enhanceApp({ app }) {
		app.use(TwoslashFloatingVue);
		app.component("SdkCard", SdkCard_default);
		app.component("SdkCardGroup", SdkCardGroup_default);
		app.component("SdkComponentAPI", SdkComponentAPI_default);
		app.component("SdkDataTable", SdkDataTable_default);
		app.component("SdkEventsTable", SdkEventsTable_default);
		app.component("SdkField", SdkField_default);
		app.component("SdkFieldGroup", SdkFieldGroup_default);
		app.component("SdkPropsTable", SdkPropsTable_default);
		app.component("SdkRelatedLinks", SdkRelatedLinks_default);
		app.component("SdkSlotsTable", SdkSlotsTable_default);
	}
};
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/composables/codeGroups.js
function useCodeGroups() {
	if (inBrowser) window.addEventListener("click", (e) => {
		const el = e.target;
		if (el.matches(".vp-code-group input")) {
			const group = el.parentElement?.parentElement;
			if (!group) return;
			const i = Array.from(group.querySelectorAll("input")).indexOf(el);
			if (i < 0) return;
			const blocks = group.querySelector(".blocks");
			if (!blocks) return;
			const current = Array.from(blocks.children).find((child) => child.classList.contains("active"));
			if (!current) return;
			const next = blocks.children[i];
			if (!next || current === next) return;
			current.classList.remove("active");
			activate(next);
			(group?.querySelector(`label[for="${el.id}"]`))?.scrollIntoView({ block: "nearest" });
		}
	});
}
function activate(el) {
	el.classList.add("active");
	window.dispatchEvent(new CustomEvent("vitepress:codeGroupTabActivate", { detail: el }));
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/composables/copyCode.js
var ignoredNodes = [".vp-copy-ignore", ".diff.remove"].join(", ");
function useCopyCode() {
	if (inBrowser) {
		const timeoutIdMap = /* @__PURE__ */ new WeakMap();
		window.addEventListener("click", (e) => {
			const el = e.target;
			if (el.matches("div[class*=\"language-\"] > button.copy")) {
				const parent = el.parentElement;
				const sibling = el.nextElementSibling?.nextElementSibling;
				if (!parent || !sibling) return;
				const clone = sibling.cloneNode(true);
				clone.querySelectorAll(ignoredNodes).forEach((node) => node.remove());
				clone.innerHTML = clone.innerHTML.replace(/\n+/g, "\n");
				let text = clone.textContent || "";
				if (isShell(/language-(\w+)/.exec(parent.className)?.[1] || "")) text = text.replace(/^ *(\$|>) /gm, "").trim();
				copyToClipboard(text).then(() => {
					el.classList.add("copied");
					clearTimeout(timeoutIdMap.get(el));
					const timeoutId = setTimeout(() => {
						el.classList.remove("copied");
						el.blur();
						timeoutIdMap.delete(el);
					}, 2e3);
					timeoutIdMap.set(el, timeoutId);
				});
			}
		});
	}
}
async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const element = document.createElement("textarea");
		const previouslyFocusedElement = document.activeElement;
		element.value = text;
		element.setAttribute("readonly", "");
		element.style.contain = "strict";
		element.style.position = "absolute";
		element.style.left = "-9999px";
		element.style.fontSize = "12pt";
		const selection = document.getSelection();
		const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;
		document.body.appendChild(element);
		element.select();
		element.selectionStart = 0;
		element.selectionEnd = text.length;
		document.execCommand("copy");
		document.body.removeChild(element);
		if (originalRange) {
			selection.removeAllRanges();
			selection.addRange(originalRange);
		}
		if (previouslyFocusedElement) previouslyFocusedElement.focus();
	}
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/composables/head.js
function useUpdateHead(route, siteDataByRouteRef) {
	let isFirstUpdate = true;
	let managedHeadElements = [];
	const updateHeadTags = (newTags) => {
		if (isFirstUpdate) {
			isFirstUpdate = false;
			newTags.forEach((tag) => {
				const headEl = createHeadElement(tag);
				for (const el of document.head.children) if (el.isEqualNode(headEl)) {
					managedHeadElements.push(el);
					return;
				}
			});
			return;
		}
		const newElements = newTags.map(createHeadElement);
		managedHeadElements.forEach((oldEl, oldIndex) => {
			const matchedIndex = newElements.findIndex((newEl) => newEl?.isEqualNode(oldEl ?? null));
			if (matchedIndex !== -1) delete newElements[matchedIndex];
			else {
				oldEl?.remove();
				delete managedHeadElements[oldIndex];
			}
		});
		newElements.forEach((el) => el && document.head.appendChild(el));
		managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
	};
	watchEffect(() => {
		const pageData = route.data;
		const siteData = siteDataByRouteRef.value;
		const pageDescription = pageData && pageData.description;
		const frontmatterHead = pageData && pageData.frontmatter.head || [];
		const title = createTitle(siteData, pageData);
		if (title !== document.title) document.title = title;
		const description = pageDescription || siteData.description;
		let metaDescriptionElement = document.querySelector(`meta[name=description]`);
		if (metaDescriptionElement) {
			if (metaDescriptionElement.getAttribute("content") !== description) metaDescriptionElement.setAttribute("content", description);
		} else createHeadElement(["meta", {
			name: "description",
			content: description
		}]);
		updateHeadTags(mergeHead(siteData.head, filterOutHeadDescription(frontmatterHead)));
	});
}
function createHeadElement([tag, attrs, innerHTML]) {
	const el = document.createElement(tag);
	for (const key in attrs) el.setAttribute(key, attrs[key]);
	if (innerHTML) el.innerHTML = innerHTML;
	if (tag === "script" && attrs.async == null) el.async = false;
	return el;
}
function isMetaDescription(headConfig) {
	return headConfig[0] === "meta" && headConfig[1] && headConfig[1].name === "description";
}
function filterOutHeadDescription(head) {
	return head.filter((h) => !isMetaDescription(h));
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/composables/preFetch.js
var hasFetched = /* @__PURE__ */ new Set();
var createLink = () => document.createElement("link");
var viaDOM = (url) => {
	const link = createLink();
	link.rel = `prefetch`;
	link.href = url;
	document.head.appendChild(link);
};
var viaXHR = (url) => {
	const req = new XMLHttpRequest();
	req.open("GET", url, req.withCredentials = true);
	req.send();
};
var link;
var doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
	if (!inBrowser) return;
	if (!window.IntersectionObserver) return;
	let conn;
	if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) return;
	const rIC = window.requestIdleCallback || setTimeout;
	let observer = null;
	const observeLinks = () => {
		if (observer) observer.disconnect();
		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const link = entry.target;
					observer.unobserve(link);
					const { pathname } = link;
					if (!hasFetched.has(pathname)) {
						hasFetched.add(pathname);
						const pageChunkPath = pathToFile(pathname);
						if (pageChunkPath) doFetch(pageChunkPath);
					}
				}
			});
		});
		rIC(() => {
			document.querySelectorAll("#app a").forEach((link) => {
				const { hostname, pathname } = new URL(link.href instanceof SVGAnimatedString ? link.href.animVal : link.href, link.baseURI);
				const extMatch = pathname.match(/\.\w+$/);
				if (extMatch && extMatch[0] !== ".html") return;
				if (link.target !== "_blank" && hostname === location.hostname) {
					if (pathname !== location.pathname) observer.observe(link);
					else hasFetched.add(pathname);
				}
			});
		});
	};
	onMounted(observeLinks);
	const route = useRoute();
	watch(() => route.path, observeLinks);
	onUnmounted(() => {
		observer && observer.disconnect();
	});
}
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/index.js
function resolveThemeExtends(theme) {
	if (theme.extends) {
		const base = resolveThemeExtends(theme.extends);
		return {
			...base,
			...theme,
			async enhanceApp(ctx) {
				if (base.enhanceApp) await base.enhanceApp(ctx);
				if (theme.enhanceApp) await theme.enhanceApp(ctx);
			}
		};
	}
	return theme;
}
var Theme = resolveThemeExtends(theme_default);
var VitePressApp = defineComponent({
	name: "VitePressApp",
	setup() {
		const { site, lang, dir } = useData$1();
		onMounted(() => {
			watchEffect(() => {
				document.documentElement.lang = lang.value;
				document.documentElement.dir = dir.value;
			});
		});
		if (site.value.router.prefetchLinks) usePrefetch();
		useCopyCode();
		useCodeGroups();
		if (Theme.setup) Theme.setup();
		return () => h(Theme.Layout);
	}
});
async function createApp$1() {
	globalThis.__VITEPRESS__ = true;
	const router = newRouter();
	const app = newApp();
	app.provide(RouterSymbol, router);
	const data = initData(router.route);
	app.provide(dataSymbol, data);
	app.component("Content", Content);
	app.component("ClientOnly", ClientOnly);
	Object.defineProperties(app.config.globalProperties, {
		$frontmatter: { get() {
			return data.frontmatter.value;
		} },
		$params: { get() {
			return data.page.value.params;
		} }
	});
	if (Theme.enhanceApp) await Theme.enhanceApp({
		app,
		router,
		siteData: siteDataRef
	});
	return {
		app,
		router,
		data
	};
}
function newApp() {
	return createSSRApp(VitePressApp);
}
function newRouter() {
	let isInitialPageLoad = inBrowser;
	return createRouter((path) => {
		let pageFilePath = pathToFile(path);
		let pageModule = null;
		if (pageFilePath) {
			if (isInitialPageLoad) pageFilePath = pageFilePath.replace(/\.js$/, ".lean.js");
			pageModule = import(
				/*@vite-ignore*/
				pageFilePath
);
		}
		if (inBrowser) isInitialPageLoad = false;
		return pageModule;
	}, Theme.NotFound);
}
if (inBrowser) createApp$1().then(({ app, router, data }) => {
	router.go(location.href, { initialLoad: true }).then(() => {
		useUpdateHead(router.route, data.site);
		app.mount("#app");
	});
});
//#endregion
//#region ../../node_modules/.bun/vitepress@2.0.0-alpha.19+d2c112ea7b458e86/node_modules/vitepress/dist/client/app/ssr.js
async function render(path) {
	const { app, router } = await createApp$1();
	await router.go(path);
	const ctx = {
		content: "",
		vpSocialIcons: /* @__PURE__ */ new Set()
	};
	ctx.content = await renderToString(app, ctx);
	return ctx;
}
//#endregion
export { escapeRegExp as a, dataSymbol as i, useRouter as n, inBrowser as o, pathToFile as r, render, useData as t };
