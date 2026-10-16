# @kalka/core

Editor engine for [OpenPencil](https://openpencil.dev): the CanvasKit (Skia WASM) renderer, Yoga layout, the framework-agnostic editor with undo and selection, the Figma Plugin API compatibility layer, the AI/MCP tool definitions, clipboard and vector conversion, and format-neutral document I/O.

It depends on `@kalka/scene-graph`, `@kalka/pen`, `@kalka/kiwi`, and `@kalka/fig`, and keeps browser DOM out so it runs in the app, the CLI, the MCP server, and headless scripts alike.

Import the root barrel or the targeted subpaths listed in `package.json` `exports`, for example `@kalka/core/io`, `@kalka/core/geometry`, and `@kalka/core/canvaskit`.

Scripts get two globals through `compileScript` from `@kalka/core/tools`: `figma`, the Figma Plugin API over a document, and `openpencil` (`OpenPencilAPI` from `@kalka/core/openpencil-api`), what OpenPencil adds to it in the same style, such as making a component behave as a Reka UI control:

```ts
import { FigmaAPI } from '@kalka/core/figma-api'
import { compileScript } from '@kalka/core/tools'

await compileScript(`
  const set = figma.currentPage.findOne((n) => n.name === 'Switch')
  openpencil.setBehaviour(set, { kind: 'switch', values: { value: 'State' } })
`)(new FigmaAPI(graph))
```

- Programmable overview and SDK docs: https://openpencil.dev/programmable/
- Source and issues: https://github.com/open-pencil/open-pencil

MIT License.
