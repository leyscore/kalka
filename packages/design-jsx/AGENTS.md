# Design JSX

OpenPencil's design JSX: the elements (`Frame`, `Text`, …) and the trees they build, paint and effect helpers, design variables, the prop schema and authoring reference, component transforms, the string renderer, and `sceneNodeToJSX`/`selectionToJSX` export.

Rules:

- Depend only on `@open-pencil/scene-graph`. Engine work the renderer needs — icon lookup, SVG path conversion, vector node creation, and layout — comes in through `DesignJSXServices` (`src/services.ts`). Core binds them in `packages/core/src/design-jsx/index.ts` and exports the bound `renderJSX` and `renderTree` from `@open-pencil/core/design-jsx`.
- `src/reference/authoring.md` is the source of the shared authoring reference. Run `bun run generate:authoring-reference` after changing it or the schema; never edit the generated copies.
- Tests that need icons, layout, or the bound renderer stay under `tests/engine/render/jsx`; tests of trees, schema, and export live in `packages/design-jsx/tests`.
