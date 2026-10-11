import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region de/programmable/cli/scripting.md
var __pageData = JSON.parse("{\"title\":\"Skripte\",\"description\":\"JavaScript mit einer Figma-kompatiblen Plugin API ausführen, um Designs zu lesen, zu verändern und zu erzeugen.\",\"frontmatter\":{\"title\":\"Skripte\",\"description\":\"JavaScript mit einer Figma-kompatiblen Plugin API ausführen, um Designs zu lesen, zu verändern und zu erzeugen.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"de_DE\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"de\",\"href\":\"https://openpencil.dev/de/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"fr_FR\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"fr\",\"href\":\"https://openpencil.dev/fr/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"es_ES\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"es\",\"href\":\"https://openpencil.dev/es/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"it_IT\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"it\",\"href\":\"https://openpencil.dev/it/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"pl_PL\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"pl\",\"href\":\"https://openpencil.dev/pl/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:locale:alternate\",\"content\":\"ru_RU\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"ru\",\"href\":\"https://openpencil.dev/ru/programmable/cli/scripting\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/cli/scripting\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Skripte — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Skripte — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"JavaScript mit einer Figma-kompatiblen Plugin API ausführen, um Designs zu lesen, zu verändern und zu erzeugen.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"JavaScript mit einer Figma-kompatiblen Plugin API ausführen, um Designs zu lesen, zu verändern und zu erzeugen.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"JavaScript mit einer Figma-kompatiblen Plugin API ausführen, um Designs zu lesen, zu verändern und zu erzeugen.\"}]]},\"headers\":[],\"relativePath\":\"de/programmable/cli/scripting.md\",\"filePath\":\"de/programmable/cli/scripting.md\",\"lastUpdated\":1790731151000}");
var _sfc_main = { name: "de/programmable/cli/scripting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="skripte" tabindex="-1">Skripte <a class="header-anchor" href="#skripte" aria-label="Permalink to “Skripte”">​</a></h1><p><code>openpencil eval</code> führt JavaScript für ein OpenPencil-Dokument aus und stellt das globale Objekt <code>figma</code> bereit. Der Befehl eignet sich für Massenänderungen, Prüfungen, Testdaten und Automatisierung ohne Editoroberfläche.</p><h2 id="grundlagen" tabindex="-1">Grundlagen <a class="header-anchor" href="#grundlagen" aria-label="Permalink to “Grundlagen”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> eval</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> design.fig</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;return figma.currentPage.children.length&quot;</span></span></code></pre></div><p>Beginnt der Code nicht mit <code>return</code>, führt OpenPencil ihn in einer asynchronen Funktion aus.</p><h2 id="andern-und-speichern" tabindex="-1">Ändern und speichern <a class="header-anchor" href="#andern-und-speichern" aria-label="Permalink to “Ändern und speichern”">​</a></h2><p><code>--write</code> schreibt in die Eingabedatei, <code>--output</code> in eine neue Datei. Längere Skripte können über die Standardeingabe gelesen werden.</p><h2 id="geoffnetes-dokument" tabindex="-1">Geöffnetes Dokument <a class="header-anchor" href="#geoffnetes-dokument" aria-label="Permalink to “Geöffnetes Dokument”">​</a></h2><p>Ohne Dateipfad wird das aktuelle Dokument der Desktop-App verwendet.</p><h2 id="ausgabe" tabindex="-1">Ausgabe <a class="header-anchor" href="#ausgabe" aria-label="Permalink to “Ausgabe”">​</a></h2><p>Nicht interaktive Ausgabe verwendet standardmäßig JSON. <code>--quiet</code> unterdrückt die Ausgabe.</p><h2 id="unterstutzte-api" tabindex="-1">Unterstützte API <a class="header-anchor" href="#unterstutzte-api" aria-label="Permalink to “Unterstützte API”">​</a></h2><p>Die API orientiert sich an Figma Plugin API und arbeitet mit SceneGraph und dem OpenPencil-Dateiformat.</p><p>Sie umfasst Dokumente und Seiten, Objekterstellung, Baumoperationen, Komponenten, Variablen sowie häufige Eigenschaften für Geometrie, Darstellung, Text, automatische Anordnung und Konturen.</p><p>Exakte Namen wie <code>figma.createFrame()</code>, <code>node.appendChild()</code>, <code>fontSize</code> und <code>layoutMode</code> bleiben mit Figma kompatibel.</p><h2 id="noch-nicht-kompatibel" tabindex="-1">Noch nicht kompatibel <a class="header-anchor" href="#noch-nicht-kompatibel" aria-label="Permalink to “Noch nicht kompatibel”">​</a></h2><p>Noch nicht angeboten werden unter anderem <code>node.exportAsync()</code>, <code>node.setBoundVariable()</code>, <code>figma.combineAsVariants()</code> und die Stil-APIs von Figma.</p><p>Dafür stehen je nach Aufgabe CLI-Export, Werkzeuge des Kernpakets oder direkte SceneGraph-Hilfsfunktionen zur Verfügung.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("de/programmable/cli/scripting.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var scripting_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, scripting_default as default };
