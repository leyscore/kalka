import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region reference/node-types.md
var __pageData = JSON.parse("{\"title\":\"Node Types\",\"description\":\"Reference for OpenPencil scene graph node types, Figma Kiwi schema mappings, and supported engine node behavior.\",\"frontmatter\":{\"title\":\"Node Types\",\"description\":\"Reference for OpenPencil scene graph node types, Figma Kiwi schema mappings, and supported engine node behavior.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/reference/node-types\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/reference/node-types\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/reference/node-types\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/reference/node-types\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Node Types — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Node Types — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Reference for OpenPencil scene graph node types, Figma Kiwi schema mappings, and supported engine node behavior.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Reference for OpenPencil scene graph node types, Figma Kiwi schema mappings, and supported engine node behavior.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Reference for OpenPencil scene graph node types, Figma Kiwi schema mappings, and supported engine node behavior.\"}]]},\"headers\":[],\"relativePath\":\"reference/node-types.md\",\"filePath\":\"reference/node-types.md\",\"lastUpdated\":1784314789000}");
var _sfc_main = { name: "reference/node-types.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="node-types" tabindex="-1">Node Types <a class="header-anchor" href="#node-types" aria-label="Permalink to “Node Types”">​</a></h1><p>The scene graph supports 28 node types from Figma&#39;s Kiwi schema. Each node is identified by a GUID (<code>sessionID:localID</code>) and has a parent reference via <code>parentIndex</code>. The OpenPencil engine&#39;s <code>NodeType</code> union currently uses 18 of these types.</p><h2 id="type-table" tabindex="-1">Type Table <a class="header-anchor" href="#type-table" aria-label="Permalink to “Type Table”">​</a></h2><p>28 Figma schema types + 1 synthetic engine type. Types marked ✅ are in the engine&#39;s <code>NodeType</code> union (18 total).</p><table tabindex="0"><thead><tr><th>Type</th><th>ID</th><th>Description</th><th>Engine</th></tr></thead><tbody><tr><td><code>DOCUMENT</code></td><td>1</td><td>Root node, one per file</td><td>—</td></tr><tr><td><code>CANVAS</code></td><td>2</td><td>Page</td><td>✅</td></tr><tr><td><code>GROUP</code></td><td>3</td><td>Group container</td><td>✅</td></tr><tr><td><code>FRAME</code></td><td>4</td><td>Primary container (artboard), supports auto-layout</td><td>✅</td></tr><tr><td><code>BOOLEAN_OPERATION</code></td><td>5</td><td>Union/subtract/intersect/exclude result</td><td>✅</td></tr><tr><td><code>VECTOR</code></td><td>6</td><td>Freeform vector path</td><td>✅</td></tr><tr><td><code>STAR</code></td><td>7</td><td>Star shape</td><td>✅</td></tr><tr><td><code>LINE</code></td><td>8</td><td>Line</td><td>✅</td></tr><tr><td><code>ELLIPSE</code></td><td>9</td><td>Ellipse/circle, supports arc data</td><td>✅</td></tr><tr><td><code>RECTANGLE</code></td><td>10</td><td>Rectangle</td><td>✅</td></tr><tr><td><code>REGULAR_POLYGON</code></td><td>11</td><td>Regular polygon (3–12 sides, engine uses <code>POLYGON</code>)</td><td>✅</td></tr><tr><td><code>ROUNDED_RECTANGLE</code></td><td>12</td><td>Rectangle with smooth corners</td><td>✅</td></tr><tr><td><code>TEXT</code></td><td>13</td><td>Text with rich formatting</td><td>✅</td></tr><tr><td><code>SLICE</code></td><td>14</td><td>Export region</td><td></td></tr><tr><td><code>SYMBOL</code></td><td>15</td><td>Component (main, engine uses <code>COMPONENT</code>)</td><td>✅</td></tr><tr><td><code>INSTANCE</code></td><td>16</td><td>Component instance</td><td>✅</td></tr><tr><td><code>STICKY</code></td><td>17</td><td>FigJam sticky note</td><td></td></tr><tr><td><code>SHAPE_WITH_TEXT</code></td><td>18</td><td>FigJam shape</td><td>✅</td></tr><tr><td><code>CONNECTOR</code></td><td>19</td><td>Connector line between nodes</td><td>✅</td></tr><tr><td><code>CODE_BLOCK</code></td><td>20</td><td>FigJam code block</td><td></td></tr><tr><td><code>WIDGET</code></td><td>21</td><td>Plugin widget</td><td></td></tr><tr><td><code>STAMP</code></td><td>22</td><td>FigJam stamp</td><td></td></tr><tr><td><code>MEDIA</code></td><td>23</td><td>Video/GIF</td><td></td></tr><tr><td><code>HIGHLIGHT</code></td><td>24</td><td>FigJam highlight</td><td></td></tr><tr><td><code>SECTION</code></td><td>25</td><td>Canvas section (organizational, top-level only)</td><td>✅</td></tr><tr><td><code>SECTION_OVERLAY</code></td><td>26</td><td>Section overlay</td><td></td></tr><tr><td><code>WASHI_TAPE</code></td><td>27</td><td>FigJam washi tape</td><td></td></tr><tr><td><code>VARIABLE</code></td><td>28</td><td>Variable definition node</td><td></td></tr><tr><td><code>COMPONENT_SET</code></td><td>—</td><td>Variant group container (synthetic, mapped from <code>SYMBOL</code>)</td><td>✅</td></tr></tbody></table><h3 id="engine-nodetype-union-18-types" tabindex="-1">Engine NodeType Union (18 types) <a class="header-anchor" href="#engine-nodetype-union-18-types" aria-label="Permalink to “Engine NodeType Union (18 types)”">​</a></h3><p>The engine&#39;s <code>NodeType</code> uses simplified names. Some differ from the Kiwi schema:</p><ul><li><code>COMPONENT</code> → Kiwi <code>SYMBOL</code> (ID 15)</li><li><code>COMPONENT_SET</code> → variant group container (no dedicated Kiwi ID, mapped from <code>SYMBOL</code> with variants)</li><li><code>POLYGON</code> → Kiwi <code>REGULAR_POLYGON</code> (ID 11)</li></ul><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> NodeType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> =</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">  |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;CANVAS&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;FRAME&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;RECTANGLE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ROUNDED_RECTANGLE&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">  |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ELLIPSE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;TEXT&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;LINE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;STAR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;POLYGON&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">  |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;VECTOR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;BOOLEAN_OPERATION&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;GROUP&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;SECTION&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">  |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;COMPONENT&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;COMPONENT_SET&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;INSTANCE&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">  |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;CONNECTOR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;SHAPE_WITH_TEXT&#39;</span></span></code></pre></div><h2 id="node-hierarchy" tabindex="-1">Node Hierarchy <a class="header-anchor" href="#node-hierarchy" aria-label="Permalink to “Node Hierarchy”">​</a></h2><div class="language-"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>Document</span></span>
<span class="line"><span>├── Canvas (Page 1)</span></span>
<span class="line"><span>│   ├── Section (top-level only, title pill, auto-adopts siblings)</span></span>
<span class="line"><span>│   │   ├── Frame</span></span>
<span class="line"><span>│   │   │   └── ...children</span></span>
<span class="line"><span>│   │   └── Rectangle</span></span>
<span class="line"><span>│   ├── Frame</span></span>
<span class="line"><span>│   │   ├── Rectangle</span></span>
<span class="line"><span>│   │   ├── Text</span></span>
<span class="line"><span>│   │   └── Frame (nested)</span></span>
<span class="line"><span>│   │       ├── Ellipse</span></span>
<span class="line"><span>│   │       └── Instance (→ references Component)</span></span>
<span class="line"><span>│   ├── Component</span></span>
<span class="line"><span>│   │   └── ...children</span></span>
<span class="line"><span>│   ├── Group</span></span>
<span class="line"><span>│   │   └── ...children</span></span>
<span class="line"><span>│   └── BooleanOperation</span></span>
<span class="line"><span>│       └── ...operand shapes</span></span>
<span class="line"><span>└── Canvas (Page 2)</span></span>
<span class="line"><span>    └── ...</span></span></code></pre></div><h2 id="core-properties" tabindex="-1">Core Properties <a class="header-anchor" href="#core-properties" aria-label="Permalink to “Core Properties”">​</a></h2><p>Every node carries these fields (subset of <code>NodeChange</code>):</p><h3 id="identity-tree" tabindex="-1">Identity &amp; Tree <a class="header-anchor" href="#identity-tree" aria-label="Permalink to “Identity &amp; Tree”">​</a></h3><ul><li><code>guid</code> — unique identifier (<code>sessionID:localID</code>)</li><li><code>type</code> — node type enum</li><li><code>name</code> — display name</li><li><code>phase</code> — <code>CREATED</code> or <code>REMOVED</code></li><li><code>parentIndex</code> — parent GUID + position string for z-ordering</li></ul><h3 id="transform" tabindex="-1">Transform <a class="header-anchor" href="#transform" aria-label="Permalink to “Transform”">​</a></h3><ul><li><code>size</code> — width/height vector</li><li><code>transform</code> — 2×3 affine matrix</li><li><code>rotation</code> — degrees</li></ul><h3 id="appearance" tabindex="-1">Appearance <a class="header-anchor" href="#appearance" aria-label="Permalink to “Appearance”">​</a></h3><ul><li><code>fillPaints[]</code> — fill colors/gradients/images</li><li><code>strokePaints[]</code> — stroke colors</li><li><code>effects[]</code> — shadows, blurs</li><li><code>opacity</code> — 0–1</li><li><code>blendMode</code> — <code>NORMAL</code>, <code>MULTIPLY</code>, <code>SCREEN</code>, etc.</li></ul><h3 id="shared-styles" tabindex="-1">Shared styles <a class="header-anchor" href="#shared-styles" aria-label="Permalink to “Shared styles”">​</a></h3><p>Scene nodes model <code>fillStyleId</code>, <code>strokeStyleId</code>, <code>textStyleId</code>, <code>effectStyleId</code>, and <code>gridStyleId</code> as nullable Figma GUID strings. Imported local definitions are internal nodes with a <code>sharedStyleType</code> of <code>FILL</code>, <code>TEXT</code>, <code>EFFECT</code>, or <code>GRID</code>; <code>layoutGrids[]</code> contains promoted grid geometry. Manual property edits detach only the matching reference.</p><h3 id="stroke" tabindex="-1">Stroke <a class="header-anchor" href="#stroke" aria-label="Permalink to “Stroke”">​</a></h3><ul><li><code>strokeWeight</code> — stroke thickness</li><li><code>strokeAlign</code> — <code>INSIDE</code> / <code>CENTER</code> / <code>OUTSIDE</code></li><li><code>strokeCap</code> — <code>NONE</code> / <code>ROUND</code> / <code>SQUARE</code> / <code>ARROW_LINES</code> / <code>ARROW_EQUILATERAL</code></li><li><code>strokeJoin</code> — <code>MITER</code> / <code>BEVEL</code> / <code>ROUND</code></li><li><code>dashPattern[]</code> — dash/gap lengths</li></ul><h3 id="corners" tabindex="-1">Corners <a class="header-anchor" href="#corners" aria-label="Permalink to “Corners”">​</a></h3><ul><li><code>cornerRadius</code> — uniform radius</li><li><code>cornerSmoothing</code> — squircle amount (0–1)</li><li>Per-corner radii when <code>rectangleCornerRadiiIndependent</code> is true</li></ul><h3 id="visibility" tabindex="-1">Visibility <a class="header-anchor" href="#visibility" aria-label="Permalink to “Visibility”">​</a></h3><ul><li><code>visible</code> — show/hide</li><li><code>locked</code> — prevent editing</li></ul><h2 id="type-specific-properties" tabindex="-1">Type-Specific Properties <a class="header-anchor" href="#type-specific-properties" aria-label="Permalink to “Type-Specific Properties”">​</a></h2><h3 id="text" tabindex="-1">Text <a class="header-anchor" href="#text" aria-label="Permalink to “Text”">​</a></h3><p><code>fontSize</code>, <code>fontName</code>, <code>lineHeight</code>, <code>letterSpacing</code>, <code>textAlignHorizontal</code>, <code>textAlignVertical</code>, <code>textAutoResize</code>, <code>textData</code> (characters, style overrides, baselines, glyphs)</p><h3 id="vector" tabindex="-1">Vector <a class="header-anchor" href="#vector" aria-label="Permalink to “Vector”">​</a></h3><p><code>vectorData</code> (vectorNetworkBlob, normalizedSize), <code>fillGeometry[]</code>, <code>strokeGeometry[]</code>, <code>handleMirroring</code>, <code>arcData</code></p><h3 id="layout-frame" tabindex="-1">Layout (Frame) <a class="header-anchor" href="#layout-frame" aria-label="Permalink to “Layout (Frame)”">​</a></h3><p><code>stackMode</code>, <code>stackSpacing</code>, <code>stackPadding</code>, <code>stackJustify</code>, <code>stackCounterAlign</code>, <code>stackPrimarySizing</code>, <code>stackCounterSizing</code>, <code>stackChildPrimaryGrow</code>, <code>stackChildAlignSelf</code></p><h3 id="component" tabindex="-1">Component <a class="header-anchor" href="#component" aria-label="Permalink to “Component”">​</a></h3><p><code>symbolData</code>, <code>componentKey</code>, <code>componentPropDefs[]</code>, <code>symbolDescription</code></p><h3 id="instance" tabindex="-1">Instance <a class="header-anchor" href="#instance" aria-label="Permalink to “Instance”">​</a></h3><p><code>overriddenSymbolID</code>, <code>symbolData.symbolOverrides[]</code>, <code>componentPropRefs[]</code>, <code>componentPropAssignments[]</code></p><p>In the SceneGraph, typed definitions live in <code>componentPropertyDefinitions</code>, descendant field links in <code>componentPropertyReferences</code>, and per-instance values in <code>componentPropertyAssignments</code>. Variant component values remain separate in <code>componentPropertyValues</code>.</p><h2 id="paint" tabindex="-1">Paint <a class="header-anchor" href="#paint" aria-label="Permalink to “Paint”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">interface</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Fill</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;SOLID&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;GRADIENT_LINEAR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;GRADIENT_RADIAL&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">        &#39;GRADIENT_ANGULAR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;GRADIENT_DIAMOND&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;IMAGE&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">              // {r, g, b, a} 0–1 floats</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  opacity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">           // 0–1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  visible</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  blendMode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BlendMode</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  gradientStops</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> GradientStop</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[]     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">// for gradients</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  gradientTransform</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> GradientTransform</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  // 2×3 matrix</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  imageHash</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">        // for image fills</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  imageScaleMode</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;FILL&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;FIT&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;CROP&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;TILE&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  imageTransform</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> GradientTransform</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="effect" tabindex="-1">Effect <a class="header-anchor" href="#effect" aria-label="Permalink to “Effect”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">interface</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Effect</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;DROP_SHADOW&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;INNER_SHADOW&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;LAYER_BLUR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">        &#39;BACKGROUND_BLUR&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;FOREGROUND_BLUR&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Color</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  offset</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">x</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">; </span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">y</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  radius</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  spread</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  visible</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="stroke-1" tabindex="-1">Stroke <a class="header-anchor" href="#stroke-1" aria-label="Permalink to “Stroke”">​</a></h2><div class="language-typescript"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">interface</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Stroke</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  color</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Color</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  weight</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  opacity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  visible</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  align</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;INSIDE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;CENTER&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;OUTSIDE&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  cap</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;NONE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ROUND&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;SQUARE&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ARROW_LINES&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ARROW_EQUILATERAL&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  join</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;MITER&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;BEVEL&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;ROUND&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  dashPattern</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("reference/node-types.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var node_types_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, node_types_default as default };
