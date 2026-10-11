import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/cli/exporting.md
var __pageData = JSON.parse("{\"title\":\"Exporting\",\"description\":\"Export document content to images, PDF, PowerPoint, `.fig`, JSX, HTML, or Storybook stories, with font-substitution policies for raster and PDF output.\",\"frontmatter\":{\"title\":\"Exporting\",\"description\":\"Export document content to images, PDF, PowerPoint, `.fig`, JSX, HTML, or Storybook stories, with font-substitution policies for raster and PDF output.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"de_DE\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/exporting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/exporting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Exporting — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Exporting — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Export document content to images, PDF, PowerPoint, `.fig`, JSX, HTML, or Storybook stories, with font-substitution policies for raster and PDF output.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Export document content to images, PDF, PowerPoint, `.fig`, JSX, HTML, or Storybook stories, with font-substitution policies for raster and PDF output.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Export document content to images, PDF, PowerPoint, `.fig`, JSX, HTML, or Storybook stories, with font-substitution policies for raster and PDF output.\"}]]},\"headers\":[],\"relativePath\":\"programmable/cli/exporting.md\",\"filePath\":\"programmable/cli/exporting.md\",\"lastUpdated\":1791544423000}");
var _sfc_main = { name: "programmable/cli/exporting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="exporting" tabindex="-1">Exporting <a class="header-anchor" href="#exporting" aria-label="Permalink to “Exporting”">​</a></h1><p>Export designs from the terminal — raster images, vectors, PDF, editable PowerPoint, <code>.fig</code> subsets, JSX code, HTML, or Storybook stories.</p><h2 id="image-export" tabindex="-1">Image Export <a class="header-anchor" href="#image-export" aria-label="Permalink to “Image Export”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                           # PNG (default)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> jpg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -s</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -q</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 90</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">        # JPG at 2×, quality 90</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> webp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -s</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">             # WEBP at 3×</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> svg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                   # SVG vector</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> pdf</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                   # PDF</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> pptx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                  # editable PowerPoint</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Page 1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # export one page as .fig</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1:23</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">        # export one node as .fig</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # export an HTML fragment with Tailwind classes</span></span></code></pre></div><p>Options:</p><ul><li><code>-f</code> — format: <code>png</code>, <code>jpg</code>, <code>webp</code>, <code>svg</code>, <code>pdf</code>, <code>pptx</code>, <code>jsx</code>, <code>html</code>, <code>fig</code>, <code>storybook</code></li><li><code>-s</code> — export scale (default: <code>1</code>)</li><li><code>-q</code> — quality: <code>0</code>–<code>100</code> (JPG/WEBP only)</li><li><code>-o</code> — output path</li><li><code>--page</code> — page name</li><li><code>--node</code> — specific node ID</li></ul><h2 id="font-substitution-policy" tabindex="-1">Font Substitution Policy <a class="header-anchor" href="#font-substitution-policy" aria-label="Permalink to “Font Substitution Policy”">​</a></h2><p>For file-backed PNG, JPG, WEBP, and PDF exports, choose how missing or substituted fonts are handled:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> pdf</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --font-policy</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> strict</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --font-policy</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> warn</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> webp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --font-policy</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> allow</span></span></code></pre></div><ul><li><code>warn</code> (default) — report substitutions and continue exporting.</li><li><code>strict</code> — stop with a nonzero exit status if font preparation cannot faithfully resolve the requested faces.</li><li><code>allow</code> — export without the additional font-fidelity check.</li></ul><p>Run <a href="./inspecting#font-diagnostics"><code>openpencil fonts</code></a> first to inspect affected faces. Export preparation may use configured font providers, so its result can differ from the offline file diagnostic.</p><p>This policy does not apply to exports from the running app, or to SVG, PowerPoint, JSX, HTML, and <code>.fig</code> output. It checks font resolution, not complete visual equivalence with Figma.</p><h2 id="jsx-export" tabindex="-1">JSX Export <a class="header-anchor" href="#jsx-export" aria-label="Permalink to “JSX Export”">​</a></h2><p>Export as JSX with Tailwind utility classes:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind-jsx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # or: -f jsx --style tailwind</span></span></code></pre></div><p>Output:</p><div class="language-html"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">div</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> className</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;flex flex-col gap-4 p-6 bg-white rounded-xl&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> className</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;text-2xl font-bold text-[#1D1B20]&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Card Title&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> className</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;text-sm text-[#49454F]&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;Description text&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">p</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">div</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;</span></span></code></pre></div><p>Also supports <code>--style openpencil</code> for the native JSX format (see <a href="./../jsx-renderer">JSX Renderer</a>).</p><h2 id="html-export" tabindex="-1">HTML Export <a class="header-anchor" href="#html-export" aria-label="Permalink to “HTML Export”">​</a></h2><p>Export as an HTML fragment with inline styles by default, or Tailwind utility classes:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span></span></code></pre></div><p>Use <code>--html standalone</code> for a browser-openable HTML document with reset styles and a page wrapper. Standalone HTML is intended as a useful visual/code handoff, not a pixel-perfect renderer replacement:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> standalone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> inline</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> standalone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> standalone</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --css</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --assets</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> external</span></span></code></pre></div><p>Standalone Tailwind output is compiled during export; it does not depend on the Tailwind browser runtime. Use <code>--assets external</code> to write CSS and extracted image assets next to the HTML file. Use <code>--fonts assets</code> with external assets to resolve detected SceneGraph text fonts through OpenPencil&#39;s configured web-font providers and emit local <code>@font-face</code> files.</p><p>HTML export is available in file mode.</p><h3 id="tokens-in-exported-code" tabindex="-1">Tokens in exported code <a class="header-anchor" href="#tokens-in-exported-code" aria-label="Permalink to “Tokens in exported code”">​</a></h3><p>HTML and Tailwind JSX write variable-bound properties as the design tokens they come from: a fill bound to <code>Primary</code> is <code>background-color: var(--color-primary)</code>, and in Tailwind <code>bg-primary</code>, or <code>bg-(--name)</code> for a token outside Tailwind&#39;s namespaces. A layer set to another mode gets that mode&#39;s attribute, such as <code>data-theme=&quot;dark&quot;</code>, so the tokens resolve as the canvas draws them.</p><p>A value stays literal where CSS would not reproduce it: the layer no longer draws the variable&#39;s value, the token is unitless where a length is needed, or the layer sits in a mode that only its own condition, such as a <code>@media</code> query, can select. Standalone HTML includes the stylesheet for the tokens it uses; for fragments and JSX, generate it with <code>openpencil tokens</code> (below).</p><h2 id="design-tokens" tabindex="-1">Design Tokens <a class="header-anchor" href="#design-tokens" aria-label="Permalink to “Design Tokens”">​</a></h2><p>Write the document&#39;s variables as CSS custom properties:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> &gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens.css</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --format</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tailwind</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}"> &gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> theme.css</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --collection</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> Theme</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> COLOR</span></span></code></pre></div><p>Each collection&#39;s default mode goes in <code>:root</code>. Every other mode overrides the values that differ under its condition: <code>[data-theme=&quot;dark&quot;]</code> for a Theme collection&#39;s Dark mode, or the selector or <code>@media</code> query the mode names. Aliases stay <code>var()</code> references and are declared again in each mode that changes what they point to, so switching <code>data-theme</code> on any element restyles everything built on it.</p><div class="language-css"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">:root</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  --color-blue-500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">#3B82F5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  --color-primary</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">var</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">--color-blue-500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">/* Theme: Dark */</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">data-theme</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c62739",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;dark&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">] {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">  --color-primary</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">var</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#c13617",
		"--shiki-dark": "#FFAB70"
	})}">--color-blue-300</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><code>--format tailwind</code> puts tokens with a Tailwind v4 namespace (<code>--color-*</code>, <code>--spacing-*</code>, <code>--radius-*</code>, <code>--text-*</code>, …) in <code>@theme</code>, so <code>bg-primary</code> and <code>rounded-card</code> work, and adds a <code>@custom-variant</code> per mode, so <code>dark:bg-surface</code> follows the same condition. Import the file after <code>@import &quot;tailwindcss&quot;;</code>. Names come from the variable&#39;s code syntax when it names a custom property (<code>--x</code> or <code>var(--x)</code>), otherwise from its name and type: <code>Blue/500</code> as a color is <code>--color-blue-500</code>.</p><p>Tokens that cannot be written, such as boolean variables or a condition that is not a selector or query, are listed on stderr and left out. The command works in file mode and against the running app.</p><h3 id="w3c-design-tokens" tabindex="-1">W3C design tokens <a class="header-anchor" href="#w3c-design-tokens" aria-label="Permalink to “W3C design tokens”">​</a></h3><p><code>--format dtcg</code> writes the variables and styles as <a href="https://www.designtokens.org/tr/2025.10/format/" target="_blank" rel="noreferrer">W3C design tokens</a> into a folder:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --format</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> dtcg</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --out</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens</span></span></code></pre></div><p>Each collection mode is one file, <code>Theme/Light.tokens.json</code> and <code>Theme/Dark.tokens.json</code>, in the shape Figma imports as a mode: lengths in <code>px</code>, times in <code>s</code>, booleans as numbers marked <code>com.figma.type</code>, and aliases to another collection naming it in <code>com.figma.aliasData</code>. Text and effect styles become typography and shadow tokens in <code>styles.tokens.json</code>, kept apart because Figma&#39;s import refuses composite tokens. <code>tokens.resolver.json</code> is a DTCG resolver that switches each collection&#39;s modes and layers the rest, for tools such as Style Dictionary. OpenPencil&#39;s own fields, such as a token&#39;s <code>rem</code> unit, CSS name, scopes, or <code>clamp()</code> expression, and each mode&#39;s condition, ride in <code>\$extensions[&quot;dev.openpencil&quot;]</code>, so the export reads back exactly.</p><p>Import token files into a document with the <code>import_design_tokens</code> tool, passing each file&#39;s path and text:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tool</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> call</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> import_design_tokens</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --args-file</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> tokens.json</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --write</span></span></code></pre></div><p>It reads a file per mode grouped by folder, a resolver with the files it refers to, or a Tokens Studio file with <code>\$themes</code>. Collections and modes with existing names, and variables and styles by name, are updated; the rest is added, and nothing is deleted. The result lists what was added, updated, and skipped, with the reason for each skip.</p><h2 id="storybook-export" tabindex="-1">Storybook Export <a class="header-anchor" href="#storybook-export" aria-label="Permalink to “Storybook Export”">​</a></h2><p>Generate one CSF3 <code>.stories.ts</code> file per component set or component:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                      # React stories in ./design-stories/</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> vue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --framework</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> html</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.pen</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -o</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> src/stories</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">  # re-export on every save</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;src/**/*.pen&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> storybook</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --beside</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --watch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">    # stories next to each design</span></span></code></pre></div><h3 id="designs-next-to-their-stories" tabindex="-1">Designs next to their stories <a class="header-anchor" href="#designs-next-to-their-stories" aria-label="Permalink to “Designs next to their stories”">​</a></h3><p>Keep each component&#39;s design file in the component&#39;s folder and export with <code>--beside</code>: each document&#39;s stories, design images, and <code>.openpencil-stories.json</code> manifest go into that document&#39;s own folder, next to the component&#39;s code. A Storybook <code>stories</code> glob such as <code>../src/**/*.stories.ts</code> in <code>.storybook/main.ts</code> then picks them up without further configuration.</p><p>Pass several documents, or a quoted glob such as <code>&#39;src/**/*.pen&#39;</code> that OpenPencil expands itself (Node.js 22 or later). Several documents need <code>--beside</code> or <code>--output</code>; <code>--page</code> works with one document only. Documents are exported one after another, and when one fails the rest are still exported before the command exits with an error. <code>--watch</code> watches every matched document; a document created after the watch started needs another run.</p><p>Stories are titled by the document&#39;s file name, and then the page when more than one page has components: <code>pricing.fig</code> gives <code>pricing/Plan picker</code>, so documents exported together keep their stories apart. Each variant of a component set becomes a story, and its variant properties become <code>select</code> controls, so switching a control shows the matching variant. A set with a behaviour gets the control&#39;s own props instead: a Switch or Checkbox has a <code>checked</code> boolean, a Toggle <code>pressed</code>, a Collapsible <code>open</code>, and <code>disabled</code> when the set draws a disabled state; hover, pressed, and focus stay stories of their own. Standalone components named with slashes, such as <code>Button/Primary</code> and <code>Button/Secondary</code>, are grouped into one <code>Button</code> file with a <code>Variant</code> control. A combination the design has no variant for throws a named error in Storybook rather than showing a different variant.</p><p>Stories render the component as HTML with inline styles, like <code>-f html</code>, so they need no OpenPencil runtime; <code>--framework</code> (<code>react</code>, <code>vue</code>, or <code>html</code>) only changes the wrapper and the <code>Meta</code>/<code>StoryObj</code> import from <code>@storybook/react-vite</code>, <code>@storybook/vue3-vite</code>, or <code>@storybook/html-vite</code>. Text uses the document&#39;s font families, which Storybook has to load itself. Static stories don&#39;t export text, boolean, or instance-swap properties yet.</p><p>With <code>--framework vue</code> or <code>--framework react</code>, a component set or component whose behaviour is a Button, Switch, Checkbox, Toggle, Collapsible, Tabs, Radio group, Toggle group, or Accordion becomes a real component instead: <code>&lt;Name&gt;.vue</code> built on Reka UI, or <code>&lt;Name&gt;.tsx</code> with a <code>&lt;Name&gt;.module.css</code> built on Radix UI&#39;s <code>radix-ui</code> package. Its variants are compiled into a stylesheet keyed on the states Reka and Radix set (<code>data-state</code>, <code>data-disabled</code>, hover, and focus), and every other variant property is a prop the component sets as a <code>data-*</code> attribute. In Vue its value is a <code>v-model</code> such as <code>checked</code> or <code>open</code>; in React the component takes the Radix root&#39;s props, such as <code>checked</code>, <code>defaultChecked</code>, and <code>onCheckedChange</code>. Its text properties are string props, defaulting to the design&#39;s words, which the layers bound to them draw, with a text control in its stories.</p><p>Tabs take the open tab as <code>value</code> (<code>v-model:value</code>, or <code>defaultValue</code> and <code>onValueChange</code> in React), named by each trigger&#39;s words as a slug, such as <code>account</code> or <code>password</code>, and starting on the first; each trigger and its panel are Reka&#39;s or Radix&#39;s <code>Tabs</code> parts around the design&#39;s layers, every trigger drawn like the design&#39;s other triggers and taking the first trigger&#39;s look while its tab is active, and the stories get a <code>select</code> control and a story per tab. A Radio group, Toggle group, or Accordion writes two components: the group, which chooses one item the same way, starting on the item the design draws on, and <code>&lt;Group&gt;Item</code> from its items&#39; component set, built as the group&#39;s item primitive (<code>RadioGroupItem</code>, <code>ToggleGroupItem</code>, or <code>AccordionItem</code> with its trigger in a header) and taking the <code>value</code> it stands for. The group uses it once per item in its items slot, with each item&#39;s value, named by its label property or else its words, and its text values. A Radio is only generated as a group&#39;s item; a Toggle or Collapsible used on its own still becomes its own component.</p><p>Inside a generated component, an instance of another component generated in the same export uses that component rather than drawing its layers: <code>&lt;Switch&gt;</code> imported from <code>./Switch.vue</code> or <code>./Switch</code>, set to the variant, text, and <code>disabled</code> values the instance shows. A control the design draws on, such as a checked switch, starts on and stays operable: a local <code>ref</code> bound with <code>v-model</code> in Vue, <code>defaultChecked</code> in React. The parent only places it, so the control keeps its own look and state styles. Instances of components not exported, or exported only as static stories, are drawn as before. An icon placed from a set, unless its paths were edited, is Iconify&#39;s component, <code>&lt;Icon icon=&quot;lucide:bell&quot;&gt;</code> from <code>@iconify/vue</code> or <code>@iconify/react</code>, which loads the icon when shown.</p><p>Its stories render the component, and a play function clicks the control and checks its state, so the Storybook project needs <code>reka-ui</code> or <code>radix-ui</code> installed, and <code>@iconify/vue</code> or <code>@iconify/react</code> when components hold icons.</p><p>Stories carry <code>parameters.design</code> entries for <a href="https://github.com/storybookjs/addon-designs" target="_blank" rel="noreferrer"><code>@storybook/addon-designs</code></a>:</p><ul><li><strong>OpenPencil</strong> — when the document path is inside the current directory, an <a href="./../index#url-scheme"><code>openpencil://</code> link</a> that opens the document in the desktop app and selects the variant, or its component set when another layer shares the variant&#39;s name. The scheme addresses layers by name, so a story whose variant and component names are both shared by other layers gets no link.</li><li><strong>Design</strong> — a 2× PNG of the variant, written to <code>&lt;Name&gt;.design/</code> next to the story and referenced with <code>new URL(…, import.meta.url)</code>, so Vite bundles it. Copy the parameter onto the story of your own component to compare the implementation with the design. <code>--no-design-images</code> skips rendering; font substitution follows <code>--font-policy</code> as in raster export.</li></ul><p><code>-o</code> names the output directory. A <code>.openpencil-stories.json</code> manifest there records which document, as a path relative to the output directory, and which page generated each story and design image; commit it with the stories. An export replaces the files that a previous export of the same document generated there, including those of components since deleted or renamed; with <code>--page</code>, only that page&#39;s. It refuses, before changing anything, to overwrite any other file — a hand-written story, another document&#39;s, or a stray image. A one-page export whose file names shifted onto another page&#39;s stories asks for a full export instead. Without the manifest, existing stories count as someone else&#39;s, so remove them before exporting again. <code>--watch</code> keeps the command running and re-exports whenever the document is saved, so Storybook&#39;s hot reload follows the design; a save that cannot be read is reported and the watch continues. A missing <code>--page</code> or a <code>--font-policy strict</code> substitution still ends the command.</p><h2 id="live-app-mode" tabindex="-1">Live App Mode <a class="header-anchor" href="#live-app-mode" aria-label="Permalink to “Live App Mode”">​</a></h2><p>Omit the file to export from the running app:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">                       # export the selection in the active document</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --page</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Components&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # export every layer of a page</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --node</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1:23</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -f</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> png</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">           # export one layer, on any page</span></span></code></pre></div><p><code>--page</code> takes a page name and <code>--page-id</code> a page ID from <code>openpencil documents list</code>; either exports that page without switching the app to it. Add <code>--document-id</code> to export from a document other than the active one.</p><p>Live app mode supports PNG, JPG, WEBP, SVG, and PDF. PowerPoint, JSX, HTML, Storybook, and <code>.fig</code> exports require a file argument. File-mode thumbnail export is not currently supported.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/cli/exporting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var exporting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, exporting_default as default };
