# @open-pencil/fig

`.fig` file-format package for OpenPencil.

The package owns the outer `.fig` archive boundary and is the staged home for Figma-specific
SceneGraph conversion policy. Production SceneGraph read/write remains available through
`@open-pencil/core/io` while conversion modules move behind this package's public API.

Current ownership:

- Complete `.fig` archive parsing through `parseFigBuffer()`
- `.fig` archive assembly through `writeFigArchive()`
- Canvas payload and image resource handling
- `readFigContainer()` / `writeFigContainer()` helpers for raw `fig-kiwi` payloads
- `.fig` source and archive result types
- Dependency-free NodeChange policy helpers for styles, plugin metadata, text values, and font axes/features through `@open-pencil/fig/node-change`

Planned ownership:

- SceneGraph ⇄ Figma `NodeChange` conversion
- Raw Figma metadata precedence and invalidation policy
- Component and instance interpretation
- Oracle-backed `.fig` fixtures and package-local tests

Non-goals:

- Generic Kiwi schema/runtime internals — use `@open-pencil/kiwi`
- Format-neutral IO registration, export targeting, CanvasKit thumbnails, or browser workers — use
  `@open-pencil/core/io`
- Editor actions, renderer behavior, Vue/app UI, CLI formatting, or MCP transport

This follows the existing `@open-pencil/pen` pattern: a format package owns its source model/parser
and SceneGraph policy, while core registers it in the shared IO system.

## Checks

```sh
cd packages/fig
bun run check
```
