<p align="center">
  <a href="https://kalka.design">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/readme/hero-dark.webp">
      <img src="assets/readme/hero.webp" width="100%" alt="Kalka: design in real HTML. Your agent drafts it, you make it yours.">
    </picture>
  </a>
</p>

<p align="center">
  <strong>An open source design tool, an alternative to Figma, where every layer is real HTML and CSS.</strong><br />
  What you draw is already a web page: no export step, no rebuild in code.
</p>

<p align="center">
  <a href="https://kalka.design/api/download/mac-arm64"><img src="assets/readme/button-mac.webp" height="43" alt="Download for Mac"></a>
  <a href="https://kalka.design/api/download/windows"><img src="assets/readme/button-windows.webp" height="43" alt="Download for Windows"></a>
  <a href="https://kalka.design/api/download/linux"><img src="assets/readme/button-linux.webp" height="43" alt="Download for Linux"></a>
  <a href="https://kalka.design">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/readme/button-site-dark.webp">
      <img src="assets/readme/button-site.webp" height="45" alt="kalka.design">
    </picture>
  </a>
</p>

<p align="center">
  <sub>macOS (Apple silicon or <a href="https://kalka.design/api/download/mac-x64">Intel</a>), Windows and Linux. Free and open source, MIT. Beta: builds are not signed yet, see <a href="#install">Install</a>.</sub>
</p>

<p align="center">
  <a href="https://github.com/leyscore/kalka/releases"><img alt="Latest release" src="https://img.shields.io/github/v/release/leyscore/kalka?include_prereleases&style=flat-square&labelColor=121214&color=2F5BEA&label=release"></a>
  <a href="https://github.com/leyscore/kalka/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/leyscore/kalka?style=flat-square&labelColor=121214&color=2F5BEA&logo=github"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2F5BEA?style=flat-square&labelColor=121214"></a>
  <a href="https://x.com/bedleybuilds"><img alt="Follow on X" src="https://img.shields.io/badge/follow-@bedleybuilds-2F5BEA?style=flat-square&labelColor=121214&logo=x"></a>
  <img alt="Status: beta" src="https://img.shields.io/badge/status-beta-2F5BEA?style=flat-square&labelColor=121214">
</p>

<p align="center"><img src="assets/screenshots/demo.gif" width="480" alt="An agent drafts a landing page on the Kalka canvas, the layers are edited by hand, and the Code tab shows the HTML"></p>

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-canvas-dark.webp">
    <img src="assets/readme/heading-canvas.webp" width="422" alt="The canvas is the browser">
  </picture>
</p>

<p align="center">Every layer is an element the browser lays out and paints,<br />so flexbox, grid, fonts, shadows and blurs look on the canvas exactly as they will in production.</p>

<p align="center"><img src="assets/screenshots/editor.gif" width="100%" alt="The Kalka editor: the layers panel on the left, a landing page on the canvas with its heading selected, and its typography in the panel on the right"></p>

<table>
  <tr>
    <td width="50%"><strong>The layers panel is the DOM.</strong><br />A layer can be an <code>h1</code>, <code>nav</code>, <code>a</code> or <code>button</code> and carry class names; changing a class restyles every layer that has it.</td>
    <td width="50%"><strong>Breakpoints that share layers.</strong><br />Give an artboard a tablet or phone breakpoint; what you change there is exported as <code>@media</code> rules.</td>
  </tr>
  <tr>
    <td><strong>CSS as written.</strong><br />A layer keeps the CSS you, an import or an agent gave it, such as <code>width: 50%</code> or <code>padding: 1rem</code>.</td>
    <td><strong>Familiar tools.</strong><br />Components and variants, variables, auto layout, live shaders, icon search and real-time collaboration.</td>
  </tr>
</table>

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-agent-dark.webp">
    <img src="assets/readme/heading-agent.webp" width="462" alt="Your agent drafts. You finish.">
  </picture>
</p>

<p align="center">Kalka ships its own MCP server. Your coding agent writes HTML onto the canvas as editable layers,<br />checks its work with screenshots, and reads what you changed by hand before its next edit.</p>

- **One click to connect.** Settings → MCP connects Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Codex, Gemini CLI, Antigravity, Kiro, Zed, LM Studio or opencode, or copies the configuration for any other client.
- **Tools agents already understand.** They start with `get_selection` or `get_page_tree`, build with `write_html`, adjust with `update_styles`, and check with `get_screenshot`.
- **Real content, not placeholders.** The server asks agents to bring in specs, docs or data from the other servers the client has connected.
- **A built-in AI chat too,** with your own API key, including local models through LM Studio, Ollama or llama.cpp.

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-files-dark.webp">
    <img src="assets/readme/heading-files.webp" width="226" alt="Files you own">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/files-dark.webp">
    <img src="assets/readme/files.webp" width="100%" alt="A Kalka document is a folder: HTML pages, styles.css, tokens.json and assets, next to its stylesheet">
  </picture>
</p>

<p align="center">A Kalka document is a folder: one HTML page per page, <code>styles.css</code>, design tokens and assets.<br />Open it in a code editor, and keep its versions with Git from the Versions tab.</p>

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-figma-dark.webp">
    <img src="assets/readme/heading-figma.webp" width="355" alt="Bring your Figma files">
  </picture>
</p>

- **Open what you have.** Figma `.fig` and Pencil `.pen` files, HTML pasted from a web page or a code editor, or a file from a URL. The CSS a layer keeps survives `.fig` round trips.
- **Export what you drew.** Standalone HTML, Tailwind JSX, Storybook stories, PNG, JPG, SVG and PDF, drawn by the same browser engine as the canvas, from the app or the `kalka` command line.

<br />

## Install

Download the latest build for your system with the buttons above, or from [Releases](https://github.com/leyscore/kalka/releases): the `.dmg` on macOS, the `.exe` installer on Windows, the `.AppImage` on Linux. The app updates itself from the same page.

Beta builds are not signed yet, so the system warns before the first launch:

- **macOS:** open Kalka once; when macOS blocks it, open **System Settings › Privacy & Security**, click **Open Anyway** next to the message about Kalka, and confirm. If macOS says the app is damaged, run `xattr -dr com.apple.quarantine /Applications/Kalka.app` in Terminal.
- **Windows:** in the SmartScreen window, choose **More info**, then **Run anyway**.
- **Linux:** make the file executable (`chmod +x Kalka-*.AppImage`) and run it.

Open the sample document on the home screen to start from Kalka's own landing page. To build the app from source instead:

```sh
bun install
bun run package:desktop   # DMG and ZIP on macOS, installer on Windows, AppImage on Linux
```

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-hood-dark.webp">
    <img src="assets/readme/heading-hood.webp" width="256" alt="Under the hood">
  </picture>
</p>

| Layer         | Tech                                                         |
| ------------- | ------------------------------------------------------------ |
| Canvas        | Browser DOM and CSS; CanvasKit (Skia WASM) for raster export |
| UI            | Vue 3, Reka UI, Tailwind CSS 4                               |
| File formats  | Kalka folder (HTML, CSS, JSON), `.fig` (Kiwi + Zstd + ZIP)   |
| Collaboration | Trystero (WebRTC P2P) + Yjs (CRDT)                           |
| Desktop       | Electron                                                     |
| AI and MCP    | Vercel AI SDK (bring your own key), MCP SDK, Hono            |

```sh
bun install
bun run dev           # Web editor at http://localhost:1420
bun run dev:desktop   # Desktop app (Electron) with hot reload
bun run check         # Build, lint, types, architecture and docs checks
bun run test:unit     # Engine and unit tests
```

[CONTRIBUTING.md](CONTRIBUTING.md) covers setup, quality gates, pull requests and commits. [AGENTS.md](AGENTS.md) maps the repository and links the guide inside each package. The command line runs from a checkout with `bun kalka --help`.

<br />

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/heading-answers-dark.webp">
    <img src="assets/readme/heading-answers.webp" width="282" alt="Straight answers">
  </picture>
</p>

<details>
<summary><strong>Is it free?</strong></summary>
<br />
Yes. The desktop app and its local MCP server are free and MIT licensed. A paid hosted version for syncing and team sharing is planned; nothing in the app depends on it.
</details>

<details>
<summary><strong>Do I need Figma?</strong></summary>
<br />
No. Kalka is its own app. It opens <code>.fig</code> files if you want to bring existing work.
</details>

<details>
<summary><strong>Why not let the agent write the code directly?</strong></summary>
<br />
It does: what the agent writes is HTML and CSS. Kalka adds a canvas where you see it, fix the last details by hand, and hand your changes back to the agent, instead of prompting until it is right.
</details>

<details>
<summary><strong>Is my work locked in?</strong></summary>
<br />
No. A document is a folder of HTML, CSS and JSON on your disk, which any code editor opens and Git versions.
</details>

<details>
<summary><strong>Why Electron?</strong></summary>
<br />
The canvas is laid out by a real browser engine, and Electron ships the same engine on macOS, Windows and Linux, so a design looks the same everywhere.
</details>

<details>
<summary><strong>What is not there yet?</strong></summary>
<br />
Builds are not signed, macOS is the most tested platform, and complex <code>.fig</code> files can still import with differences. <a href="https://github.com/leyscore/kalka/issues">Tell us what breaks.</a>
</details>

<br />

## Credits

Kalka is a fork of [OpenPencil](https://github.com/open-pencil/open-pencil) by Danila Poyarkov and its contributors, whose editor, `.fig` support, tools and MCP server it builds on.

## License

Kalka's desktop app and local MCP server are licensed under the [MIT License](./LICENSE).
