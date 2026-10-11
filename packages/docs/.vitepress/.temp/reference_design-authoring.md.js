import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region reference/design-authoring.md
var __pageData = JSON.parse("{\"title\":\"Kalka design authoring\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/reference/design-authoring\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/reference/design-authoring\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/reference/design-authoring\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/reference/design-authoring\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Kalka design authoring — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Kalka design authoring — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"reference/design-authoring.md\",\"filePath\":\"reference/design-authoring.md\",\"lastUpdated\":1791558909000}");
var _sfc_main = { name: "reference/design-authoring.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="kalka-design-authoring" tabindex="-1">Kalka design authoring <a class="header-anchor" href="#kalka-design-authoring" aria-label="Permalink to “Kalka design authoring”">​</a></h1><p>This reference describes scene creation, not React DOM output. Use the <code>render</code> tool for JSX strings, or import <code>Frame</code>, <code>Text</code>, and other authoring exports from <code>@open-pencil/design-jsx</code> and render them with <code>renderTree</code> from <code>@open-pencil/core/design-jsx</code> in library code. Library exports are not automatically globals in agent <code>eval</code>; use only the bindings exposed by that execution environment.</p><h2 id="composition-and-layout" tabindex="-1">Composition and layout <a class="header-anchor" href="#composition-and-layout" aria-label="Permalink to “Composition and layout”">​</a></h2><ul><li><code>flex=&quot;row&quot;</code> / <code>flex=&quot;col&quot;</code> enables auto-layout. Use it for content; reserve explicit <code>x</code>/<code>y</code> or <code>position=&quot;absolute&quot;</code> for intentional overlays and artwork. Without layout, children share the origin unless positioned.</li><li><code>w</code> / <code>h</code> accept pixels, <code>&quot;hug&quot;</code> (content-sized), or <code>&quot;fill&quot;</code> (available space in a supported layout parent). Use Hug for notes, cards, and long pages instead of guessing heights. Fixed viewport sizes and artwork geometry are intentional exceptions.</li><li><code>gap</code> controls spacing. <code>p</code>, <code>px</code>, <code>py</code>, and <code>pt</code>/<code>pr</code>/<code>pb</code>/<code>pl</code> control padding; longhands override shorthands. There is no margin shorthand.</li><li><code>justify=&quot;start&quot;|&quot;end&quot;|&quot;center&quot;|&quot;between&quot;</code> controls the primary axis; <code>items=&quot;start&quot;|&quot;end&quot;|&quot;center&quot;|&quot;stretch&quot;</code> controls the cross axis. Distribution needs available space: <code>between</code> cannot create extra room in a Hug container.</li><li><code>grow</code> distributes available space. Avoid circular Hug/Fill dependencies and redundant fixed widths on growing children. Keep Fill sizing through intermediate containers that should stretch.</li><li>For wrapping text in a column, prefer <code>w=&quot;fill&quot;</code>; fixed-width text can use <code>textAutoResize=&quot;height&quot;</code>. <code>maxLines</code> / <code>truncate</code> are intentional truncation, not fixes for accidental overflow.</li><li><code>wrap</code> and <code>rowGap</code> enable wrapped flex rows. <code>grid</code>, <code>columns</code>, and <code>rows</code> enable grid (for example <code>columns=&quot;1fr 200px 1fr&quot;</code> or <code>columns=&quot;repeat(7, 1fr)&quot;</code>); tracks are <code>fr</code>, pixel lengths, <code>auto</code>, <code>repeat()</code>, and <code>minmax()</code>, which grows like its maximum. Grid children use <code>colStart</code>, <code>rowStart</code>, <code>colSpan</code>, and <code>rowSpan</code>. The current grid <code>gap</code> shorthand takes precedence over <code>columnGap</code> and <code>rowGap</code>.</li><li><code>flow=&quot;auto&quot;|&quot;ltr&quot;|&quot;rtl&quot;</code> controls container flow; text <code>dir</code> controls writing direction. Preserve these separately.</li><li>Outside auto-layout, and for <code>position=&quot;absolute&quot;</code> children, <code>constraints=${ssrInterpolate(_ctx.horizontal, _ctx.vertical)}</code> sets how a layer follows its parent&#39;s resizing, with Figma&#39;s values in lowercase: <code>&quot;min&quot;</code>, <code>&quot;center&quot;</code>, <code>&quot;max&quot;</code>, <code>&quot;stretch&quot;</code>, or <code>&quot;scale&quot;</code>. <code>minW</code>, <code>maxW</code>, <code>minH</code>, and <code>maxH</code> bound a layer&#39;s size. <code>visible={false}</code> hides a layer and <code>locked</code> locks it.</li><li>Use measured node bounds and the existing <code>arrange</code> tool for independent artboards. Prefer layout constraints to calculating child coordinates; ordinary JavaScript arithmetic is appropriate when real geometry calculations are needed.</li></ul><h2 id="paint-text-and-artwork" tabindex="-1">Paint, text, and artwork <a class="header-anchor" href="#paint-text-and-artwork" aria-label="Permalink to “Paint, text, and artwork”">​</a></h2><ul><li><code>bg</code> / <code>fill</code>, <code>stroke</code>, and text <code>color</code> accept colors and supported variable references. Set colors explicitly for predictable contrast. <code>fills</code> accepts structured paints; gradient helpers include <code>linearGradient</code>, <code>radialGradient</code>, <code>angularGradient</code>, and <code>diamondGradient</code>, each taking an array of stops and optional <code>{ opacity, transform }</code>: <code>fills={[linearGradient([[&#39;#3b82f6&#39;, 0], [&#39;#8b5cf6&#39;, 1]])]}</code>.</li><li><code>stroke</code> describes one stroke, refined by <code>strokeWidth</code>, <code>strokeAlign</code> (<code>&quot;inside&quot;</code>, <code>&quot;center&quot;</code>, <code>&quot;outside&quot;</code>), <code>strokeDash</code>, <code>strokeCap</code>, and <code>strokeJoin</code>. <code>strokes</code> takes several, as objects with <code>color</code>, <code>weight</code>, <code>align</code>, <code>dash</code>, <code>cap</code>, <code>join</code>, and <code>visible</code>; <code>strokeWeights=${ssrInterpolate(_ctx.top, _ctx.right, _ctx.bottom, _ctx.left)}</code> sets per-side widths. <code>dashPattern</code> sets the node&#39;s own dash pattern, separate from the per-stroke <code>strokeDash</code>.</li><li><code>rounded</code> and <code>roundedTL</code>/<code>roundedTR</code>/<code>roundedBL</code>/<code>roundedBR</code> control corners. <code>strokeWidth</code>, <code>opacity</code>, <code>rotate</code>, and <code>blendMode</code> control appearance. <code>overflow=&quot;hidden&quot;</code> clips content; do not hide accidental text overflow to make a broken layout appear correct.</li><li><code>effects</code> accepts structured effects such as <code>dropShadow</code>, <code>innerShadow</code>, and <code>layerBlur</code>. <code>shadow</code> takes a CSS <code>box-shadow</code> list, such as <code>shadow=&quot;0 4 8 #0002, inset 0 1 0 #fff&quot;</code>, and <code>blur</code> a layer blur radius; both are convenient shorthands. Effect helpers take <code>radius</code>, as Figma&#39;s effects do; when a JSX string is rendered, an option a paint or effect helper does not support is reported as a warning.</li><li>Text content belongs inside <code>Text</code>. Use <code>size</code>, <code>font</code>, <code>weight</code>, <code>italic</code>, <code>lineHeight</code>, <code>letterSpacing</code>, <code>textAlign</code>, <code>textAlignVertical</code>, <code>textDecoration</code>, and <code>textCase</code>. Verify fonts actually load before judging dimensions; do not assume every font is available.</li><li><code>Icon</code> uses an Iconify name, size, and color. Prefer icons to emoji when reliable vector output is needed. Image fills belong on appropriate leaf shapes, not containers whose children must remain visible.</li><li>Design JSX props are the portable authoring interface. Some CSS-style aliases are supported, but this is not a browser CSS engine; do not assume arbitrary HTML, classes, or styles work.</li></ul><h2 id="variables-and-components" tabindex="-1">Variables and components <a class="header-anchor" href="#variables-and-components" aria-label="Permalink to “Variables and components”">​</a></h2><ul><li>Create document variables before referencing them with <code>designVar(&#39;id-or-name&#39;)</code>. <code>defineVars</code> groups references; it does not create variable collections.</li><li>COLOR references work in paint props. FLOAT references work in <code>w</code>, <code>h</code>, <code>gap</code>, padding, corner radii, <code>strokeWidth</code>, <code>opacity</code>, text <code>size</code>/<code>fontSize</code>, <code>lineHeight</code>, and <code>letterSpacing</code>. Grid <code>columnGap</code>/<code>rowGap</code> and wrapped flex <code>rowGap</code> also support FLOAT references; grid <code>gap</code> overrides both axis-specific gaps. Use numbers or FLOAT references for these scalar props, not CSS unit strings.</li><li>References preserve real graph bindings, not just copied values. Set the intended collection mode on the parent before creating scalar-bound content: initial scalar layout resolves that inherited mode. This does not guarantee automatic scalar layout recomputation after a later mode switch. Verify resulting geometry as well as paint when changing modes. Missing or incorrectly typed scalar variables are errors.</li><li><code>bind</code> maps supported scene-field paths to variable IDs or references when no shorthand exists. Use semantic tokens consistently rather than declaring unused collections.</li><li>A reusable JavaScript function shares source code, not component identity. Use <code>Component</code>, <code>ComponentSet</code>, and <code>Instance</code> for editable main components and linked instances.</li><li><code>Instance</code> resolves an existing component through <code>of</code>, <code>component</code>, or <code>componentId</code>. Component-set children named <code>variant=Primary</code>, for example, define variants that can be selected when instantiating the set.</li><li><code>Component</code> and <code>ComponentSet</code> accept <code>properties</code>, an array of native property definitions (<code>id</code>, <code>name</code>, <code>type</code>, <code>defaultValue</code>). An <code>Instance</code> sets text, boolean, and swap properties by name, the way it picks a variant: <code>&lt;Instance of=&quot;Note&quot; State=&quot;Done&quot; Message=&quot;Updated review&quot; Pinned={false} /&gt;</code>. <code>properties</code> takes the same values keyed by property ID or name, for names that are not JSX identifiers or that design JSX already uses, such as <code>name</code>. Names survive a <code>.fig</code> save, which replaces authored IDs such as <code>message</code> with Figma IDs. Ordinary nodes do not accept <code>properties</code>.</li><li>Child <code>propertyRefs</code> connect fields to stable property IDs, for example <code>[{ propertyId: &#39;message&#39;, field: &#39;TEXT&#39; }]</code>. Supported fields are <code>TEXT</code>, <code>VISIBLE</code>, and <code>INSTANCE_SWAP</code>; text and swap references require text and instance nodes respectively. References do not depend on layer names.</li><li>Instance assignments use the native string values (<code>&#39;true&#39;</code> / <code>&#39;false&#39;</code> for BOOLEAN properties and component IDs for swaps), and a property set as a prop also takes <code>true</code> / <code>false</code>, as in <code>Pinned={false}</code>. Assignments persist through component synchronization; unknown IDs and invalid values fail rather than silently creating inert overrides. Select variants through component-set variant props, not through instance property assignments.</li><li>Reuse existing local or library components before recreating them. Keep meaningful text, visibility, and swap properties exposed rather than hand-editing cloned child nodes.</li><li>Explicit instance <code>w</code> / <code>h</code> replace the inherited sizing mode on that axis; omitted dimensions retain the main component&#39;s sizing. Authored overrides survive component synchronization. Distinguish those placement constraints from the main component&#39;s default size, and verify actual bounds in narrower parents. Do not compensate for a sizing mismatch with guessed heights, clipping, or manually positioned siblings.</li></ul><h2 id="controls" tabindex="-1">Controls <a class="header-anchor" href="#controls" aria-label="Permalink to “Controls”">​</a></h2><ul><li>A main component can behave as a Reka UI control in preview and code. Write it with Reka&#39;s names: <code>Switch.Root</code> is the component (a component set when its children are <code>Component</code> variants), and each Reka part is the slot that draws it, such as <code>Switch.Thumb</code>, <code>Slider.Track</code>, <code>Slider.Range</code>, <code>Slider.Thumb</code>, <code>Tabs.List</code>, <code>Collapsible.Trigger</code>, or <code>NumberField.Increment</code>. Parts in different variants share one slot.</li><li>The root names the properties that hold its values: <code>modelValue</code> (<code>open</code> on <code>Collapsible.Root</code>), <code>disabled</code>, and, for text fields, <code>filled</code>, as a variant or boolean property name, or <code>{ property, on, off }</code> when the variant values are not named like On and Off. <code>states</code> names the variant property that draws default, hover, pressed, focus, and disabled; a slider, progress bar, or number field takes <code>min</code>, <code>max</code>, <code>step</code>, and <code>defaultValue</code>.</li><li><code>TextField.Input</code>, <code>Textarea.Input</code>, and <code>NumberField.Input</code> are the text layers whose text becomes the field&#39;s text property. <code>Tabs.Trigger</code> goes in <code>Tabs.List</code>; <code>Tabs.Content</code> panels may sit directly under <code>Tabs.Root</code>, the first showing. A part with children and no <code>flex</code>, <code>display</code>, <code>w</code>, or <code>h</code> of its own stacks them in a column that hugs them.</li><li>A group&#39;s item component is written on its own (<code>RadioGroup.Item</code>, <code>ToggleGroup.Item</code>, <code>Accordion.Item</code> with its <code>Accordion.Trigger</code> and <code>Accordion.Content</code>); the group&#39;s root then lists items as <code>&lt;RadioGroup.Item of={radioId} /&gt;</code>.</li></ul><div class="language-tsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">tsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Switch.Root</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Switch&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> modelValue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;State&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> states</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Interaction&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Component</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;State=Off, Interaction=Default&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">44</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">24</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rounded</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#D0D4DA&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Switch.Thumb</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> x</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">y</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">20</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">20</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rounded</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#FFFFFF&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Component</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Component</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;State=On, Interaction=Default&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">44</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">24</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rounded</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#3B6CF6&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Switch.Thumb</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> x</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">22</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">y</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">20</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">20</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">rounded</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#FFFFFF&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> /&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Component</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Switch.Root</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="verification" tabindex="-1">Verification <a class="header-anchor" href="#verification" aria-label="Permalink to “Verification”">​</a></h2><p>Inspect structure and actual rendered output. Node counts and <code>describe</code> diagnostics do not establish visual fidelity. Check wrapping with longer content, narrower containers, component edits, and relevant modes. Resolve overflow and contrast problems at their source. Reuse IDs returned by creation tools rather than repeatedly searching for the same nodes.</p><p>The examples below are executed by the authoring-reference tests. Create the named variables before running a variable-bound example.</p><h2 id="content-sized-review-note" tabindex="-1">Content-sized review note <a class="header-anchor" href="#content-sized-review-note" aria-label="Permalink to “Content-sized review note”">​</a></h2><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Review note&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">280</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;hug&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> flex</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;col&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> gap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">8</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">16</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#FFFFFF&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Author&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">weight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;medium&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#252A31&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;June Lee&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Message&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;fill&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#6B7079&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Give the date a little more room at the bottom.&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="variable-bound-spacing-and-typography" tabindex="-1">Variable-bound spacing and typography <a class="header-anchor" href="#variable-bound-spacing-and-typography" aria-label="Permalink to “Variable-bound spacing and typography”">​</a></h2><div class="language-jsx"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">jsx</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Bound note&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">280</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">h</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;hug&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> flex</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;col&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> gap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">designVar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Space/small&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">designVar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Space/medium&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#FFFFFF&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Message&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> w</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;fill&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> size</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">designVar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Type/body&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">lineHeight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">designVar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Type/body-leading&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">letterSpacing</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">designVar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Type/body-tracking&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;#252A31&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;A note that grows with its content.&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Text</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Frame</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><h2 id="supported-syntax-inventory" tabindex="-1">Supported syntax inventory <a class="header-anchor" href="#supported-syntax-inventory" aria-label="Permalink to “Supported syntax inventory”">​</a></h2><p>Generated from the renderer metadata. This inventory lists accepted names, not arbitrary browser CSS support.</p><p><strong>Elements:</strong> <code>Frame</code>, <code>Text</code>, <code>Rectangle</code>, <code>Ellipse</code>, <code>Line</code>, <code>Star</code>, <code>Polygon</code>, <code>Vector</code>, <code>Group</code>, <code>Section</code>, <code>Component</code>, <code>ComponentSet</code>, <code>Instance</code>, <code>View</code>, <code>Rect</code>, <code>Icon</code>, <code>Button.Root</code>, <code>Toggle.Root</code>, <code>Switch.Root</code>, <code>Switch.Thumb</code>, <code>Checkbox.Root</code>, <code>Checkbox.Indicator</code>, <code>RadioGroup.Root</code>, <code>RadioGroup.Item</code>, <code>RadioGroup.Indicator</code>, <code>ToggleGroup.Root</code>, <code>ToggleGroup.Item</code>, <code>Slider.Root</code>, <code>Slider.Track</code>, <code>Slider.Range</code>, <code>Slider.Thumb</code>, <code>Progress.Root</code>, <code>Progress.Indicator</code>, <code>Tabs.Root</code>, <code>Tabs.List</code>, <code>Tabs.Trigger</code>, <code>Tabs.Content</code>, <code>Collapsible.Root</code>, <code>Collapsible.Trigger</code>, <code>Collapsible.Content</code>, <code>Accordion.Root</code>, <code>Accordion.Item</code>, <code>Accordion.Header</code>, <code>Accordion.Trigger</code>, <code>Accordion.Content</code>, <code>NumberField.Root</code>, <code>NumberField.Input</code>, <code>NumberField.Increment</code>, <code>NumberField.Decrement</code>, <code>TextField.Root</code>, <code>TextField.Input</code>, <code>Textarea.Root</code>, <code>Textarea.Input</code>.</p><p><strong>Helpers:</strong> <code>solid</code>, <code>gradient</code>, <code>linearGradient</code>, <code>radialGradient</code>, <code>angularGradient</code>, <code>diamondGradient</code>, <code>dropShadow</code>, <code>innerShadow</code>, <code>layerBlur</code>, <code>backgroundBlur</code>, <code>foregroundBlur</code>, <code>designVar</code>, <code>defineVars</code>.</p><p><strong>Properties:</strong> <code>name</code>, <code>key</code>, <code>flex</code>, <code>flow</code>, <code>dir</code>, <code>gap</code>, <code>wrap</code>, <code>rowGap</code>, <code>columnGap</code>, <code>justify</code>, <code>justifyContent</code>, <code>items</code>, <code>align</code>, <code>alignItems</code>, <code>grow</code>, <code>w</code>, <code>h</code>, <code>width</code>, <code>height</code>, <code>minW</code>, <code>maxW</code>, <code>minH</code>, <code>maxH</code>, <code>x</code>, <code>y</code>, <code>top</code>, <code>left</code>, <code>position</code>, <code>constraints</code>, <code>p</code>, <code>padding</code>, <code>px</code>, <code>py</code>, <code>pt</code>, <code>pr</code>, <code>pb</code>, <code>pl</code>, <code>bg</code>, <code>fill</code>, <code>fills</code>, <code>background</code>, <code>backgroundColor</code>, <code>stroke</code>, <code>border</code>, <code>borderColor</code>, <code>strokeWidth</code>, <code>borderWidth</code>, <code>strokeAlign</code>, <code>strokeDash</code>, <code>strokeCap</code>, <code>strokeJoin</code>, <code>dashPattern</code>, <code>strokes</code>, <code>strokeWeights</code>, <code>rounded</code>, <code>borderRadius</code>, <code>roundedTL</code>, <code>roundedTR</code>, <code>roundedBL</code>, <code>roundedBR</code>, <code>cornerRadius</code>, <code>cornerSmoothing</code>, <code>opacity</code>, <code>blendMode</code>, <code>rotate</code>, <code>rotation</code>, <code>overflow</code>, <code>mask</code>, <code>visible</code>, <code>locked</code>, <code>shadow</code>, <code>blur</code>, <code>effects</code>, <code>size</code>, <code>fontSize</code>, <code>font</code>, <code>fontFamily</code>, <code>weight</code>, <code>fontWeight</code>, <code>italic</code>, <code>color</code>, <code>text</code>, <code>characters</code>, <code>content</code>, <code>value</code>, <code>title</code>, <code>textAlign</code>, <code>textAlignHorizontal</code>, <code>textHorizontalAlignment</code>, <code>textAlignVertical</code>, <code>textVerticalAlignment</code>, <code>textAutoResize</code>, <code>lineHeight</code>, <code>letterSpacing</code>, <code>textDecoration</code>, <code>textCase</code>, <code>maxLines</code>, <code>truncate</code>, <code>grid</code>, <code>columns</code>, <code>rows</code>, <code>colStart</code>, <code>rowStart</code>, <code>col</code>, <code>row</code>, <code>colSpan</code>, <code>rowSpan</code>, <code>points</code>, <code>pointCount</code>, <code>innerRadius</code>, <code>label</code>, <code>style</code>, <code>bind</code>, <code>component</code>, <code>componentId</code>, <code>properties</code>, <code>propertyRefs</code>, <code>of</code>, <code>modelValue</code>, <code>open</code>, <code>disabled</code>, <code>filled</code>, <code>states</code>, <code>min</code>, <code>max</code>, <code>step</code>, <code>defaultValue</code>.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("reference/design-authoring.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var design_authoring_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, design_authoring_default as default };
