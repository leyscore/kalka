import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region programmable/coding-agents.md
var __pageData = JSON.parse("{\"title\":\"Coding agents\",\"description\":\"\",\"frontmatter\":{\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://openpencil.dev/programmable/coding-agents\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://openpencil.dev/programmable/coding-agents\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en_US\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"en\",\"href\":\"https://openpencil.dev/programmable/coding-agents\"}],[\"link\",{\"rel\":\"alternate\",\"hreflang\":\"x-default\",\"href\":\"https://openpencil.dev/programmable/coding-agents\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Coding agents — OpenPencil\"}],[\"meta\",{\"name\":\"twitter:title\",\"content\":\"Coding agents — OpenPencil\"}]]},\"headers\":[],\"relativePath\":\"programmable/coding-agents.md\",\"filePath\":\"programmable/coding-agents.md\",\"lastUpdated\":1791362817000}");
var _sfc_main = { name: "programmable/coding-agents.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="coding-agents" tabindex="-1">Coding agents <a class="header-anchor" href="#coding-agents" aria-label="Permalink to “Coding agents”">​</a></h1><p>The OpenPencil desktop app can use a coding agent you already have — Claude Code, Codex, Gemini CLI, or <a href="#pi">Pi</a> — as its design agent. The agent runs on your computer with your own subscription and chooses its own model; OpenPencil starts it when you send a message, through the <a href="https://agentclientprotocol.com/" target="_blank" rel="noreferrer">Agent Client Protocol</a> or, for Pi, its Harness companion, and gives it the canvas tools through OpenPencil&#39;s local <a href="./mcp-server">MCP server</a>.</p><p>Coding agents need the desktop app; the browser cannot start programs on your computer. They take only the <strong>Design agent</strong> role. Visual review, plan reviews, and fast background work need an API model, which guided setup can add for you.</p><h2 id="what-you-need" tabindex="-1">What you need <a class="header-anchor" href="#what-you-need" aria-label="Permalink to “What you need”">​</a></h2><ol><li><p>The <a href="https://github.com/open-pencil/open-pencil/releases/latest" target="_blank" rel="noreferrer">OpenPencil desktop app</a>.</p></li><li><p>The agent&#39;s ACP program, installed globally (see each agent below).</p></li><li><p>OpenPencil&#39;s MCP server, installed globally. Use the version that matches your app:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/mcp</span></span></code></pre></div></li><li><p>The agent signed in to your account with its own command-line tool.</p></li></ol><p>Then open <strong>Settings → AI &amp; agents → Run guided setup</strong>, choose the agent under <strong>Coding agents on this computer</strong>, and check that both the agent and the MCP server show as installed. <strong>Check again</strong> looks again after you install something.</p><h3 id="let-your-agent-set-itself-up" tabindex="-1">Let your agent set itself up <a class="header-anchor" href="#let-your-agent-set-itself-up" aria-label="Permalink to “Let your agent set itself up”">​</a></h3><p>If you already use one of these agents in a terminal, guided setup can do the typing for you: press <strong>Copy setup prompt</strong> on the agent&#39;s card and paste the prompt into the agent. It asks the agent to install its ACP program and the MCP server, confirm both are on your <code>PATH</code>, and make sure you are signed in.</p><h2 id="claude-code" tabindex="-1">Claude Code <a class="header-anchor" href="#claude-code" aria-label="Permalink to “Claude Code”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @agentclientprotocol/claude-agent-acp</span></span></code></pre></div><p>Sign in by running <code>claude</code> and using <code>/login</code>. The ACP program uses the same account as Claude Code.</p><h2 id="codex" tabindex="-1">Codex <a class="header-anchor" href="#codex" aria-label="Permalink to “Codex”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @agentclientprotocol/codex-acp</span></span></code></pre></div><p>Sign in with <code>codex login</code>.</p><h2 id="gemini-cli" tabindex="-1">Gemini CLI <a class="header-anchor" href="#gemini-cli" aria-label="Permalink to “Gemini CLI”">​</a></h2><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @google/gemini-cli</span></span></code></pre></div><p>Gemini CLI speaks ACP itself, so there is no separate program. Run <code>gemini</code> once and choose a sign-in method.</p><h2 id="pi" tabindex="-1">Pi <a class="header-anchor" href="#pi" aria-label="Permalink to “Pi”">​</a></h2><p>Pi runs through OpenPencil&#39;s Harness companion instead of ACP. It needs Node.js 22.15 or later, or Bun. Guided setup installs the companion with one click; to install it yourself, use the version that matches your app:</p><div class="language-sh"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> @open-pencil/harness</span></span></code></pre></div><p>OpenPencil uses the providers you signed in to in Pi and Pi&#39;s default model, so there is no key to paste. Sign in by running <code>pi</code> and using <code>/login</code>, and pick a default model with <code>/model</code>. To use another model in OpenPencil, enter it as <code>provider/model</code> in the Pi model&#39;s settings. An <a href="https://vercel.com/ai-gateway" target="_blank" rel="noreferrer">AI Gateway</a> key is optional; when you save one, Pi uses the gateway instead of your Pi sign-ins.</p><p>OpenPencil reads only Pi&#39;s <code>settings.json</code> for the default model; your credentials stay with Pi. Your Pi extensions, themes, and prompt templates are not loaded into OpenPencil&#39;s sessions. Pi keeps a conversation&#39;s context while it runs; after Pi or OpenPencil restarts, the conversation continues in a fresh Pi session, because Pi&#39;s workspace lives in memory.</p><h2 id="troubleshooting" tabindex="-1">Troubleshooting <a class="header-anchor" href="#troubleshooting" aria-label="Permalink to “Troubleshooting”">​</a></h2><ul><li><strong>Shown as not found after installing.</strong> Apps started from the Dock or Start menu do not see every folder your terminal adds to <code>PATH</code>. OpenPencil also looks in common global folders for npm, Bun, Volta, mise, and Homebrew; if your package manager installs elsewhere, add that folder to your login shell&#39;s <code>PATH</code> and restart OpenPencil.</li><li><strong>Shown as update needed.</strong> The MCP server or Pi&#39;s companion does not match the app version. Press the update button, or run the command guided setup shows with the package manager that installed it, then press <strong>Check again</strong>. A chat that needs it says so and offers <strong>Run guided setup</strong>.</li><li><strong>The agent starts but cannot edit the canvas.</strong> The MCP server is missing or not running. Install the matching <code>@open-pencil/mcp</code> version and restart OpenPencil.</li><li><strong>The agent asks you to sign in.</strong> Sign in with the agent&#39;s own command-line tool as described above, then send your message again.</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("programmable/coding-agents.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var coding_agents_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, coding_agents_default as default };
