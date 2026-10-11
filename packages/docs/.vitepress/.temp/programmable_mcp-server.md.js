import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/mcp-server.md
var __pageData = JSON.parse("{\"title\":\"MCP Server\",\"description\":\"Connect Claude Code, Cursor, Windsurf, and other MCP clients to OpenPencil for AI-assisted design inspection and editing.\",\"frontmatter\":{\"title\":\"MCP Server\",\"description\":\"Connect Claude Code, Cursor, Windsurf, and other MCP clients to OpenPencil for AI-assisted design inspection and editing.\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/mcp-server\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/mcp-server\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/mcp-server\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/mcp-server\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"MCP Server — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"MCP Server — OpenPencil\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"Connect Claude Code, Cursor, Windsurf, and other MCP clients to OpenPencil for AI-assisted design inspection and editing.\"}],[\"meta\",{\"name\":\"twitter:description\",\"content\":\"Connect Claude Code, Cursor, Windsurf, and other MCP clients to OpenPencil for AI-assisted design inspection and editing.\"}],[\"meta\",{\"name\":\"description\",\"content\":\"Connect Claude Code, Cursor, Windsurf, and other MCP clients to OpenPencil for AI-assisted design inspection and editing.\"}]]},\"headers\":[],\"relativePath\":\"programmable/mcp-server.md\",\"filePath\":\"programmable/mcp-server.md\",\"lastUpdated\":1791378088000}");
var _sfc_main = { name: "programmable/mcp-server.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="mcp-server" tabindex="-1">MCP Server <a class="header-anchor" href="#mcp-server" aria-label="Permalink to “MCP Server”">​</a></h1><p>OpenPencil includes an MCP (Model Context Protocol) server that lets AI coding tools — Claude Code, Cursor, Windsurf, etc. — read and modify designs through the running app.</p><p>Two transports: <strong>stdio</strong> for MCP clients, and <strong>Streamable HTTP</strong> for browser extensions and scripts. On macOS and Linux, local clients prefer a private Unix domain socket; Windows and unavailable sockets fall back to localhost TCP.</p><p>Tool definitions own native Valibot input schemas, execution/mutation metadata, capabilities, and optional interface exposure exclusions. Tools are included by default; <code>exposure: { mcp: false, ai: false, webmcp: false }</code> can exclude them independently from each adapter. Exposure does not bypass execution support or user permissions: WebMCP still requires supported execution and explicit Off, Inspect, or Edit access. AI and MCP consume the same schema through Standard Schema; WebMCP derives its JSON Schema from that input. Numeric strings are accepted consistently across adapters, while non-finite values are rejected. Programmatic integrations use MCP SDK v2; custom tools replace the former <code>params</code>/<code>ParamDef</code> contract with <code>input</code> and execution metadata.</p><h2 id="tool-access-settings" tabindex="-1">Tool access settings <a class="header-anchor" href="#tool-access-settings" aria-label="Permalink to “Tool access settings”">​</a></h2><p>Use <strong>Settings → Tool access</strong> (select <strong>Local MCP</strong>) to search and toggle the local server&#39;s tools, individually or by read-only/side-effect group. Group switches affect all group members, even during search. <strong>Restore defaults</strong> enables the configurable MCP tools again. Existing MCP preferences are preserved separately from the <strong>Built-in AI</strong> settings.</p><p>Restart the MCP server, then reconnect stdio clients, to apply changes. For an externally managed server, restart its owning process. The list reflects the tools discovered from the server; disabling a dedicated tool does not prevent an enabled script tool from performing the same operation. These switches are not a sandbox and do not configure remote MCP servers or WebMCP.</p><h2 id="selection-scope" tabindex="-1">Share only the selection <a class="header-anchor" href="#selection-scope" aria-label="Permalink to “Share only the selection”">​</a></h2><p>Turn on <strong>Share only the selection</strong> in <strong>Settings → MCP → Local server</strong> to let MCP clients read only the layers you select. Clients then get <code>get_selection</code>, <code>get_node</code>, <code>get_page_tree</code>, <code>describe</code>, and <code>export_image</code>, and no tools that edit, open files, list documents, or change settings. Every node a call names must be a selected layer or inside one; <code>describe</code> and <code>export_image</code> read the selection when given no IDs, and <code>get_page_tree</code> needs a <code>root_id</code> from the selection. <code>export_image</code> returns the image but cannot write it to a file. With nothing selected, calls fail and ask the user to select layers.</p><p>The server enforces this on every call it sends to the app, including <code>POST /rpc</code> and stdio clients, so a client cannot widen it. Restart the MCP server to apply the change. For a server you start yourself, set <code>OPENPENCIL_MCP_SCOPE=selection</code>; a stdio client can also set it to limit itself while the server shares the whole document.</p><h2 id="webmcp" tabindex="-1">Browser-native WebMCP (experimental) <a class="header-anchor" href="#webmcp" aria-label="Permalink to “Browser-native WebMCP (experimental)”">​</a></h2><p>WebMCP is <strong>off by default</strong>. Open <strong>Settings → MCP → WebMCP</strong> and choose <strong>Inspect</strong> for read-only access or <strong>Edit</strong> to also allow scoped, undoable changes. <strong>Off</strong> unregisters all browser tools; changing modes revokes the previous registrations immediately. This preference is independent of local MCP authentication, tool switches, and outbound connections.</p><p>For local testing, use a Chrome version exposing <code>document.modelContext</code>, enable <code>chrome://flags/#enable-webmcp-testing</code>, and relaunch the browser. Open a document, enable access in Settings, and connect a WebMCP-capable browser agent or the <a href="https://developer.chrome.com/docs/ai/webmcp" target="_blank" rel="noreferrer">Model Context Tool Inspector</a>. Settings shows browser support and registration status. See the <a href="https://developer.chrome.com/docs/ai/webmcp" target="_blank" rel="noreferrer">Chrome WebMCP guide</a> for current availability.</p><p>In supported browsers, OpenPencil registers the selected reviewed set of tools directly in the workspace. Browser agents can inspect nodes, JSX, variables, components, and design patterns, and edit existing layer properties and variable values without installing or connecting an MCP server.</p><p>Tools target the document and page active when the call starts. Switching tabs does not redirect an in-flight call. Closing the workspace unregisters the tools. Tool inputs are validated and large inspection results require a narrower query. Oversized editing results are omitted with a committed-edit notice rather than reporting a successful edit as failed.</p><p>Edits to geometry, paints, layout, text, and variable bindings/values commit synchronously as individual undoable operations. Failed edits roll back, and undo targets the original document/page even after a page switch. Cancellation prevents an edit from starting; cancellation after commit does not reverse it. Font loading finishes separately without holding a mutation transaction open. Atomic editing currently requires a document with at most 10,000 nodes and variables combined; this shared limit also applies when the same editing tools run through app AI/MCP.</p><p>This surface does <strong>not</strong> expose structural creation/deletion, arbitrary JavaScript/JSX execution, image loading, filesystem operations, or credentials. Those tools retain their existing AI/MCP paths. WebMCP is an evolving browser proposal, not universally available; unsupported browsers continue to use OpenPencil normally. The stdio and HTTP integrations below remain independent.</p><h2 id="install" tabindex="-1">Install <a class="header-anchor" href="#install" aria-label="Permalink to “Install”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -g</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/mcp</span></span></code></pre></div><h2 id="stdio-claude-code-cursor-etc" tabindex="-1">Stdio (Claude Code, Cursor, etc.) <a class="header-anchor" href="#stdio-claude-code-cursor-etc" aria-label="Permalink to “Stdio (Claude Code, Cursor, etc.)”">​</a></h2><p>The stdio server discovers the running OpenPencil app automatically. It prefers the app&#39;s Unix domain socket on macOS and Linux and falls back to localhost TCP when needed. Make sure the desktop app is open with a document loaded.</p><h3 id="claude-code" tabindex="-1">Claude Code <a class="header-anchor" href="#claude-code" aria-label="Permalink to “Claude Code”">​</a></h3><p>Install the MCP package and register it with Claude Code:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> install</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -g</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> @open-pencil/mcp</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">claude</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> mcp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> add</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --scope</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> user</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> openpencil-mcp</span></span></code></pre></div><p>Check the connection:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">claude</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> mcp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> list</span></span></code></pre></div><p>Claude Code asks before using each MCP tool unless you allow the server&#39;s tools. To auto-approve OpenPencil tools only, add this to <code>~/.claude/settings.json</code>:</p><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;permissions&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;allow&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;mcp__open-pencil__*&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>This is narrower than <code>--permission-mode bypassPermissions</code>, which skips prompts for every tool. You can also approve tools interactively from Claude&#39;s prompt by choosing “Yes, and don&#39;t ask again”.</p><p>Example prompt:</p><div class="language-text"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>Use the open-pencil MCP server to inspect the current page and create a small hero section on the canvas.</span></span></code></pre></div><h3 id="other-mcp-clients" tabindex="-1">Other MCP clients <a class="header-anchor" href="#other-mcp-clients" aria-label="Permalink to “Other MCP clients”">​</a></h3><p>Add to your MCP config (for example <code>.cursor/mcp.json</code>):</p><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;mcpServers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;open-pencil&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;command&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;openpencil-mcp&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p>Or run from source without installing:</p><div class="vp-code-group"><div class="tabs"><input type="radio" name="group-93" id="tab-94" checked><label data-title="Bun" for="tab-94">Bun</label><input type="radio" name="group-93" id="tab-95"><label data-title="Node.js" for="tab-95">Node.js</label></div><div class="blocks"><div class="language-json active"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;mcpServers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;open-pencil&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;command&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bun&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;args&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;/path/to/open-pencil/packages/mcp/src/stdio.ts&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><div class="language-json"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;mcpServers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;open-pencil&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;command&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;npx&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;args&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;tsx&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;/path/to/open-pencil/packages/mcp/src/stdio.ts&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div></div></div><h2 id="http" tabindex="-1">HTTP <a class="header-anchor" href="#http" aria-label="Permalink to “HTTP”">​</a></h2><p>For browser extensions, scripts, CI, or any HTTP client:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">openpencil-mcp-http</span></span></code></pre></div><p>Or from source: <code>bun packages/mcp/src/index.ts</code> / <code>npx tsx packages/mcp/src/index.ts</code></p><p>Security defaults:</p><ul><li>Unix socket and discovery files are created with owner-only permissions on macOS and Linux.</li><li>TCP binds to <code>127.0.0.1</code> and uses port 7600 by default.</li><li>Authentication is enabled by default with a generated token stored in the private discovery file.</li><li><code>eval</code> is disabled.</li><li>File operations are limited to <code>OPENPENCIL_MCP_ROOT</code> (defaults to the current working directory) and reject symlink escapes.</li><li>Only the desktop app&#39;s own origin (<code>tauri://localhost</code> and its <code>http(s)://tauri.localhost</code> variants) is allowed by default, so a server you start yourself works from the app without extra configuration. Set <code>OPENPENCIL_MCP_CORS_ORIGIN</code> to a comma-separated list to allow other origins, such as a worktree dev server.</li></ul><p>Set <code>PORT=0</code> to disable TCP on macOS and Linux. Windows requires TCP. Set <code>OPENPENCIL_MCP_SOCKET</code> to override the Unix socket path, or <code>OPENPENCIL_MCP_DISCOVERY_PATH</code> to override the discovery file location. To provide a stable token, set <code>OPENPENCIL_MCP_AUTH_TOKEN</code>; an explicitly empty value disables authentication and should only be used with a trusted local socket.</p><p>Endpoints are available over both active transports:</p><ul><li><code>GET /health</code> — server and app connection status; never returns the auth token.</li><li><code>POST /rpc</code> — authenticated live-app automation.</li><li><code>POST /mcp</code> — MCP Streamable HTTP. Sessions use the <code>mcp-session-id</code> header.</li></ul><h2 id="workflow" tabindex="-1">Workflow <a class="header-anchor" href="#workflow" aria-label="Permalink to “Workflow”">​</a></h2><ol><li><strong>Discover targets</strong> — call <code>list_documents</code> first when more than one document or page may be open. It returns stable <code>document_id</code> and page IDs.</li><li><strong>Open</strong> — <code>open_file</code> to load an existing <code>.fig</code>, or <code>new_document</code> for a blank canvas. These return target metadata for the opened or created document.</li><li><strong>Read</strong> — <code>get_page_tree</code>, <code>find_nodes</code>, <code>get_node</code>, <code>list_pages</code></li><li><strong>Create</strong> — <code>create_shape</code>, <code>render</code> (JSX)</li><li><strong>Modify</strong> — <code>set_fill</code>, <code>set_stroke</code>, <code>set_layout</code>, <code>update_node</code>, <code>set_effects</code></li><li><strong>Structure</strong> — <code>reparent_node</code>, <code>group_nodes</code>, <code>clone_node</code>, <code>delete_node</code></li><li><strong>Save</strong> — <code>save_file</code> to write back to <code>.fig</code></li><li><strong>Close</strong> — <code>close_file</code> to close an open document tab. With unsaved changes it fails unless <code>unsaved</code> is <code>&quot;save&quot;</code> or <code>&quot;discard&quot;</code>; it never prompts in the app.</li></ol><p><code>undo</code> and <code>redo</code> step back through the agent&#39;s own changes, and <code>activate_document</code> brings a tab to the front when the user should see it.</p><p>Each MCP session shows in the app as an agent with a callsign, like the built-in chat: its cursor and outline sit on the layers each tool reads or changes, it rests after a quiet spell and leaves when the session ends, and people can follow it from their avatar. Collaborators in a shared room see it too.</p><p>Most tools accept optional <code>document_id</code> and <code>page_id</code> fields. Pass them explicitly for agent workflows instead of relying on the visible active tab/page. <code>create_page</code> only creates a page; call <code>switch_page</code> separately when the workflow should change the active page.</p><h2 id="ai-agent-skill" tabindex="-1">AI Agent Skill <a class="header-anchor" href="#ai-agent-skill" aria-label="Permalink to “AI Agent Skill”">​</a></h2><p>Teach your AI coding agent to use OpenPencil tools:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> skills</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> add</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> open-pencil/open-pencil</span></span></code></pre></div><p>Works with Claude Code, Cursor, Windsurf, Codex, and any agent that supports <a href="https://skills.sh" target="_blank" rel="noreferrer">skills</a>. The skill covers the CLI, MCP tools, JSX rendering, eval, and the running app&#39;s automation bridge.</p><h2 id="tools" tabindex="-1">Tools <a class="header-anchor" href="#tools" aria-label="Permalink to “Tools”">​</a></h2><p>OpenPencil currently registers 100+ shared design tools, plus MCP-only document and prompt operations when applicable.</p><h3 id="document" tabindex="-1">Document <a class="header-anchor" href="#document" aria-label="Permalink to “Document”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>open_file</code></td><td>Open a <code>.fig</code> file for editing</td></tr><tr><td><code>close_file</code></td><td>Close an open document tab; <code>unsaved: &quot;save&quot;</code> or <code>&quot;discard&quot;</code> decides what happens to unsaved changes</td></tr><tr><td><code>save_file</code></td><td>Save the current document to a <code>.fig</code> file</td></tr><tr><td><code>new_document</code></td><td>Create a new empty document</td></tr><tr><td><code>list_documents</code></td><td>List open app documents/tabs and their pages</td></tr><tr><td><code>activate_document</code></td><td>Bring a document tab to the front, optionally on a given page</td></tr></tbody></table><h3 id="history" tabindex="-1">History <a class="header-anchor" href="#history" aria-label="Permalink to “History”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>undo</code></td><td>Undo the newest change made through MCP or the CLI</td></tr><tr><td><code>redo</code></td><td>Redo the newest change undone through MCP or the CLI</td></tr></tbody></table><p>The history is shared with the person in the editor. <code>undo</code> and <code>redo</code> refuse when the newest step was made in the editor, so an agent never reverts the user&#39;s work. Each editing tool call is one undo step. An <code>eval</code> script is recorded against its target page, so edits it makes after switching <code>figma.currentPage</code> are not undoable.</p><h3 id="settings" tabindex="-1">Settings <a class="header-anchor" href="#settings" aria-label="Permalink to “Settings”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>get_settings</code></td><td>Read editor settings: appearance, snapping, canvas rendering, recovery, AI chat, and design check preferences</td></tr><tr><td><code>update_settings</code></td><td>Change settings with a partial object shaped like <code>get_settings</code> output; invalid keys and values are rejected</td></tr></tbody></table><p>Settings tools never expose credentials, AI models, MCP connections, storage, or tool access. The available keys are listed in <a href="/programmable/cli/app-control#settings">Controlling the App</a>.</p><h3 id="read" tabindex="-1">Read <a class="header-anchor" href="#read" aria-label="Permalink to “Read”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>get_selection</code></td><td>Get the selected nodes, with their direct children by default; <code>depth</code> sets how many levels</td></tr><tr><td><code>get_page_tree</code></td><td>Get the full node tree of the current page</td></tr><tr><td><code>get_current_page</code></td><td>Get the current page name and ID</td></tr><tr><td><code>get_node</code></td><td>Get detailed properties of a node by ID</td></tr><tr><td><code>find_nodes</code></td><td>Find nodes by name pattern and/or type</td></tr><tr><td><code>get_components</code></td><td>List all components in the document</td></tr><tr><td><code>list_pages</code></td><td>List all pages</td></tr><tr><td><code>list_variables</code></td><td>List design variables</td></tr><tr><td><code>list_collections</code></td><td>List variable collections</td></tr><tr><td><code>list_fonts</code></td><td>List fonts used in the current page</td></tr><tr><td><code>list_available_fonts</code></td><td>List font families the current host can render</td></tr><tr><td><code>get_font_status</code></td><td>Report requested faces, loaded sources, active substitutions, why an installed face could not be loaded, and affected nodes</td></tr><tr><td><code>page_bounds</code></td><td>Get bounding box of all objects on the current page</td></tr><tr><td><code>node_bounds</code></td><td>Get bounding box of a node</td></tr><tr><td><code>node_ancestors</code></td><td>Get ancestor chain of a node</td></tr><tr><td><code>node_children</code></td><td>Get direct children of a node</td></tr><tr><td><code>node_tree</code></td><td>Get the subtree rooted at a node</td></tr><tr><td><code>node_bindings</code></td><td>Get variable bindings on a node</td></tr></tbody></table><h3 id="create" tabindex="-1">Create <a class="header-anchor" href="#create" aria-label="Permalink to “Create”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>create_shape</code></td><td>Create a shape (<code>FRAME</code>, <code>RECTANGLE</code>, <code>ELLIPSE</code>, <code>TEXT</code>, <code>LINE</code>, <code>STAR</code>, <code>POLYGON</code>, <code>SECTION</code>)</td></tr><tr><td><code>create_vector</code></td><td>Create a vector node from a path string</td></tr><tr><td><code>create_slice</code></td><td>Create an export slice</td></tr><tr><td><code>create_page</code></td><td>Create a new page</td></tr><tr><td><code>render</code></td><td>Render JSX to design nodes — create entire component trees in one call</td></tr><tr><td><code>create_component</code></td><td>Convert a frame/group into a component</td></tr><tr><td><code>create_instance</code></td><td>Create an instance of a component</td></tr><tr><td><code>create_slot</code></td><td>Make a frame inside a main component a slot</td></tr><tr><td><code>set_behaviour</code></td><td>Make a component behave as a Reka UI control, by its property and slot names; <code>null</code> removes it</td></tr><tr><td><code>get_behaviour</code></td><td>Read a component&#39;s behaviour and what it still misses; without an ID, list every kind</td></tr><tr><td><code>node_to_component</code></td><td>Convert an existing node into a component in-place</td></tr></tbody></table><h3 id="modify" tabindex="-1">Modify <a class="header-anchor" href="#modify" aria-label="Permalink to “Modify”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>set_fill</code></td><td>Set fill color (hex)</td></tr><tr><td><code>set_stroke</code></td><td>Set stroke color, weight, alignment</td></tr><tr><td><code>set_effects</code></td><td>Add shadow or blur effects</td></tr><tr><td><code>update_node</code></td><td>Update position, size, opacity, corner radius, text, font</td></tr><tr><td><code>set_layout</code></td><td>Set auto-layout (flexbox) — direction, spacing, padding, alignment</td></tr><tr><td><code>set_constraints</code></td><td>Set resize constraints</td></tr><tr><td><code>set_rotation</code></td><td>Set rotation angle in degrees</td></tr><tr><td><code>set_opacity</code></td><td>Set opacity (0–1)</td></tr><tr><td><code>set_radius</code></td><td>Set corner radius (uniform or per-corner)</td></tr><tr><td><code>set_minmax</code></td><td>Set min/max width and height constraints</td></tr><tr><td><code>set_text</code></td><td>Set text content of a <code>TEXT</code> node</td></tr><tr><td><code>set_font</code></td><td>Set font family and weight</td></tr><tr><td><code>set_font_range</code></td><td>Set font properties on a character range</td></tr><tr><td><code>set_text_resize</code></td><td>Set text auto-resize mode (fixed/auto-width/auto-height)</td></tr><tr><td><code>set_visible</code></td><td>Show or hide a node</td></tr><tr><td><code>set_blend</code></td><td>Set blend mode</td></tr><tr><td><code>set_locked</code></td><td>Lock or unlock a node</td></tr><tr><td><code>set_stroke_align</code></td><td>Set stroke alignment (inside/center/outside)</td></tr><tr><td><code>set_text_properties</code></td><td>Set text layout: alignment, auto-resize, text case, decoration, truncation</td></tr><tr><td><code>set_layout_child</code></td><td>Configure auto-layout child: sizing, grow, alignment, absolute positioning</td></tr><tr><td><code>node_move</code></td><td>Move a node to a new position</td></tr><tr><td><code>node_resize</code></td><td>Resize a node</td></tr><tr><td><code>node_replace_with</code></td><td>Replace a node with another node</td></tr><tr><td><code>arrange</code></td><td>Align or distribute selected nodes</td></tr></tbody></table><h3 id="structure" tabindex="-1">Structure <a class="header-anchor" href="#structure" aria-label="Permalink to “Structure”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>delete_node</code></td><td>Delete a node</td></tr><tr><td><code>clone_node</code></td><td>Duplicate a node</td></tr><tr><td><code>rename_node</code></td><td>Rename a node</td></tr><tr><td><code>reparent_node</code></td><td>Move a node into a different parent</td></tr><tr><td><code>select_nodes</code></td><td>Select nodes by ID</td></tr><tr><td><code>group_nodes</code></td><td>Group nodes</td></tr><tr><td><code>ungroup_node</code></td><td>Ungroup a group</td></tr><tr><td><code>flatten_nodes</code></td><td>Flatten nodes into a single vector</td></tr><tr><td><code>boolean_union</code></td><td>Boolean union of two or more nodes</td></tr><tr><td><code>boolean_subtract</code></td><td>Boolean subtraction</td></tr><tr><td><code>boolean_intersect</code></td><td>Boolean intersection</td></tr><tr><td><code>boolean_exclude</code></td><td>Boolean exclusion</td></tr></tbody></table><h3 id="vector-path" tabindex="-1">Vector Path <a class="header-anchor" href="#vector-path" aria-label="Permalink to “Vector Path”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>path_get</code></td><td>Get the path data of a vector node</td></tr><tr><td><code>path_set</code></td><td>Set the path data of a vector node</td></tr><tr><td><code>path_scale</code></td><td>Scale a vector path</td></tr><tr><td><code>path_flip</code></td><td>Flip a vector path horizontally or vertically</td></tr><tr><td><code>path_move</code></td><td>Translate a vector path</td></tr></tbody></table><h3 id="export" tabindex="-1">Export <a class="header-anchor" href="#export" aria-label="Permalink to “Export”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>export_image</code></td><td>Export nodes as PNG, JPG, or WEBP. Returns base64-encoded image data</td></tr><tr><td><code>export_svg</code></td><td>Export nodes as SVG markup</td></tr></tbody></table><h3 id="viewport" tabindex="-1">Viewport <a class="header-anchor" href="#viewport" aria-label="Permalink to “Viewport”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>viewport_get</code></td><td>Get current viewport position and zoom level</td></tr><tr><td><code>viewport_set</code></td><td>Set viewport position and zoom</td></tr><tr><td><code>viewport_zoom_to_fit</code></td><td>Zoom viewport to fit specified nodes</td></tr></tbody></table><h3 id="variables" tabindex="-1">Variables <a class="header-anchor" href="#variables" aria-label="Permalink to “Variables”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>get_variable</code></td><td>Get a variable by ID or name</td></tr><tr><td><code>find_variables</code></td><td>Find variables by name pattern or type</td></tr><tr><td><code>create_variable</code></td><td>Create a new variable in a collection</td></tr><tr><td><code>set_variable</code></td><td>Set a variable value in a mode</td></tr><tr><td><code>delete_variable</code></td><td>Delete a variable</td></tr><tr><td><code>bind_variable</code></td><td>Bind a variable to a node property</td></tr><tr><td><code>get_collection</code></td><td>Get a variable collection by ID or name</td></tr><tr><td><code>create_collection</code></td><td>Create a new variable collection</td></tr><tr><td><code>delete_collection</code></td><td>Delete a variable collection</td></tr></tbody></table><h3 id="analyze" tabindex="-1">Analyze <a class="header-anchor" href="#analyze" aria-label="Permalink to “Analyze”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>analyze_colors</code></td><td>Analyze color palette usage across the document</td></tr><tr><td><code>analyze_typography</code></td><td>Analyze font/size/weight distribution</td></tr><tr><td><code>analyze_spacing</code></td><td>Analyze gap and padding values</td></tr><tr><td><code>analyze_clusters</code></td><td>Detect repeated patterns (potential components)</td></tr><tr><td><code>lint</code></td><td>Check accessibility and consistency issues, with fixes and suggestions</td></tr><tr><td><code>lint_fix</code></td><td>Apply safe lint fixes, and optionally the first suggestion of each finding</td></tr></tbody></table><h3 id="diff" tabindex="-1">Diff <a class="header-anchor" href="#diff" aria-label="Permalink to “Diff”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>diff_create</code></td><td>Patch that turns one node tree into another, as JSX attribute changes</td></tr><tr><td><code>diff_jsx</code></td><td>Structural diff between two nodes as design JSX</td></tr><tr><td><code>diff_show</code></td><td>Preview the patch that setting JSX attributes on a node would produce</td></tr><tr><td><code>diff_apply</code></td><td>Apply a patch after checking the nodes still match its old values</td></tr><tr><td><code>diff_visual</code></td><td>Pixel diff between two rendered nodes, returned as an image</td></tr></tbody></table><h3 id="navigation" tabindex="-1">Navigation <a class="header-anchor" href="#navigation" aria-label="Permalink to “Navigation”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>switch_page</code></td><td>Switch to a page by name or ID</td></tr></tbody></table><h3 id="escape-hatch" tabindex="-1">Escape Hatch <a class="header-anchor" href="#escape-hatch" aria-label="Permalink to “Escape Hatch”">​</a></h3><table tabindex="0"><thead><tr><th>Tool</th><th>Description</th></tr></thead><tbody><tr><td><code>eval</code></td><td>Execute JavaScript with full Figma Plugin API access</td></tr></tbody></table><p>Note: <code>eval</code> is available over stdio, but disabled in HTTP mode for security.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/mcp-server.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var mcp_server_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, mcp_server_default as default };
