# @kalka/cli

Headless command line for [Kalka](https://kalka.design) and `.fig` files: inspect documents and layers, query with XPath, export to PNG, JPG, WEBP, SVG, PDF, PPTX, JSX, HTML, or `.fig`, import HTML/CSS/Tailwind, lint design files, analyze and extract design tokens, and script documents through `eval` with a Figma Plugin API-compatible `figma` global and an `kalka` global for what Kalka adds, such as component behaviours and slots.

```sh
npm install -g @kalka/cli   # or: bun add -g @kalka/cli
kalka --help
kalka eval design.fig -c "return figma.currentPage.children.length"
```

Inspection commands support `--json` for automation. The MCP server ships separately as `@kalka/mcp`.

- CLI reference: https://github.com/leyscore/kalka/blob/main/packages/docs/programmable/cli/inspecting.md
- Scripting with the Plugin API: https://github.com/leyscore/kalka/blob/main/packages/docs/programmable/cli/scripting.md
- Source and issues: https://github.com/leyscore/kalka

MIT License.
