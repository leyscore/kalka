---
title: Scripting
description: Execute JavaScript with a Figma-compatible Plugin API to query, batch-modify, and generate designs.
---

# Scripting

`kalka eval` runs JavaScript against a Kalka document with a Figma-compatible `figma` global. Use it for headless batch edits, inspection, fixture setup, and automation without opening the editor UI.

## Basic usage

```sh
kalka eval design.fig -c "return figma.currentPage.children.length"
```

The `-c` flag accepts JavaScript. Its last expression is the result, so `return` is optional; `await` works at the top level. A script whose last statement is not an expression, such as a declaration, has no result and prints nothing.

```sh
kalka eval design.fig -c "
  const frame = figma.createFrame()
  frame.name = 'Card'
  frame.resize(300, 200)
  frame.layoutMode = 'VERTICAL'
  frame.itemSpacing = 12
  return { id: frame.id, name: frame.name }
"
```

## Query nodes

```sh
kalka eval design.fig -c "
  return figma.currentPage
    .findAll((node) => node.type === 'FRAME' && node.name.includes('Button'))
    .map((button) => ({
      id: button.id,
      name: button.name,
      width: button.width,
      height: button.height
    }))
"
```

## Modify and save

Use `--write` / `-w` to write changes back to the input file:

```sh
kalka eval design.fig -c "
  figma.currentPage.children.forEach((node) => {
    node.opacity = 0.5
  })
" --write
```

Use `--output` / `-o` to write to a new file:

```sh
kalka eval design.fig -c "figma.currentPage.name = 'Updated'" -o updated.fig
```

## Read scripts from stdin

```sh
cat transform.js | kalka eval design.fig --stdin --write
```

## Live app mode

Omit the file path to run against the currently open document in the desktop app:

```sh
kalka eval -c "return figma.currentPage.name"
```

The desktop app must be running with a document open.

## Output

By default, non-TTY output is JSON. Use `--json` to force JSON output:

```sh
kalka eval design.fig -c "return figma.currentPage.children.map((n) => n.name)" --json
```

Use `--quiet` / `-q` to suppress output when only writing a file.

## The `kalka` API

Next to `figma`, scripts get `kalka`: what Kalka adds to the Figma Plugin API, in the same style. The same global is available to the `eval` tool and the running app's automation.

A main component or component set can [behave as a Reka UI control](/development/behaviours-and-preview). Bind it by its own property and slot names:

```sh
kalka eval design.fig -w -c '
  const set = figma.currentPage.findOne((n) => n.type === "COMPONENT_SET" && n.name === "Switch")
  const behaviour = kalka.setBehaviour(set, "switch")
    .bindValue("value", "State")                          // On and Off guessed from the variants
    .bindPart("thumb", set.findOne((n) => n.name === "Thumb")) // the frame becomes a slot
  behaviour.states = "Interaction"
  behaviour.missing
'
```

- `kalka.setBehaviour(node, kindOrSpec)` replaces a component's behaviour: a kind alone, or a spec such as `{ kind: "slider", parts: { track: "Track", thumb: "Thumb" }, numbers: { value: { min: 0, max: 10 } } }`. It returns the behaviour.
- `kalka.getBehaviour(node)` reads one, or `null`; a variant reads its set's.
- A behaviour has `kind`, `spec` (by name), `missing` (required values and parts still unbound), and `states`, and `bindValue(valueId, property, { on, off })`, `bindPart(partId, slotNameOrFrame)`, `setNumber(valueId, { min, max, step, default })`, and `remove()`.
- `kalka.behaviourKinds` lists every kind with the values and parts it binds.
- `kalka.createSlot(frame)` makes a frame of a main component a slot and returns its name.

Names the component does not have fail with an error that lists the ones it has.

## Supported API surface

The API is intentionally close to Figma's Plugin API, but it maps to Kalka's scene graph and file format.

### Document and pages

- `figma.root`
- `figma.currentPage`
- `figma.currentPage.selection`
- `figma.getNodeById(id)`
- `figma.createPage()`
- `await figma.setCurrentPageAsync(page)` and `await figma.loadAllPagesAsync()`; every page is already loaded

### Node creation

- `figma.createFrame()`
- `figma.createRectangle()`
- `figma.createEllipse()`
- `figma.createText()`
- `figma.createLine()`
- `figma.createPolygon()`
- `figma.createStar()`
- `figma.createVector()`
- `figma.createNodeFromSvg(svg)`
- `figma.createComponent()`
- `figma.createSection()`

### Tree operations

- `node.children`
- `node.parent`
- `node.appendChild(child)`
- `node.insertChild(index, child)`
- `node.clone()`
- `node.remove()`
- `node.findAll(callback?)`
- `node.findOne(callback)`
- `node.findChild(callback)`
- `node.findChildren(callback?)`
- `figma.group(nodes, parent)`
- `figma.ungroup(node)`

### Components

- `figma.createComponentFromNode(node)`
- `figma.combineAsVariants(components, parent)` — properties come from names such as `State=On, Size=Large`
- `component.createInstance()`
- `instance.mainComponent`

### Variables

- `figma.getLocalVariables(type?)`
- `figma.getVariableById(id)`
- `figma.getLocalVariableCollections()`
- `figma.getVariableCollectionById(id)`
- `figma.createVariable(name, type, collectionId, value?)`
- `figma.setVariableValue(variableId, modeId, value)`
- `figma.deleteVariable(id)`
- `figma.createVariableCollection(name)`
- `figma.deleteVariableCollection(id)`
- `figma.bindVariable(nodeId, field, variableId)`
- `figma.unbindVariable(nodeId, field)`

`figma.variables` is Figma's variables API, for scripts written for Figma:

- `createVariableCollection(name)`, `createVariable(name, collection, resolvedType)` for `COLOR`, `FLOAT`, `STRING`, and `BOOLEAN`
- `getLocalVariablesAsync(type?)`, `getLocalVariableCollectionsAsync()`, `getVariableByIdAsync(id)`, `getVariableCollectionByIdAsync(id)` and their synchronous forms
- `createVariableAlias(variable)`, `setBoundVariableForPaint(paint, 'color', variable)`
- A variable has `name`, `description`, `resolvedType`, `variableCollectionId`, `valuesByMode` (aliases as `{ type: 'VARIABLE_ALIAS', id }`), `scopes`, `codeSyntax`, `setValueForMode(modeId, value)`, `resolveForConsumer(node)`, and `remove()`; a value of the wrong type is refused
- A collection has `name`, `modes`, `defaultModeId`, `variableIds`, `addMode(name)`, `renameMode(modeId, name)`, `removeMode(modeId)`, and `remove()`
- On layers: `node.setBoundVariable(field, variable | null)` with Figma's field names, `node.boundVariables` (paints as `fills` and `strokes` lists), `setExplicitVariableModeForCollection(collection, modeId)`, and `clearExplicitVariableModeForCollection(collection)`. Assigning paints that carry `boundVariables.color` binds them; plain paints unbind

### Properties

Common node properties are readable/writable through the proxy, including:

- Geometry: `x`, `y`, `width`, `height`, `rotation`, `resize(width, height)`
- Appearance: `fills`, `strokes`, `effects`, `opacity`, `visible`, `locked`, `blendMode`, `clipsContent`
- Radius: `cornerRadius`, `topLeftRadius`, `topRightRadius`, `bottomRightRadius`, `bottomLeftRadius`
- Text: `characters`, `fontSize`, `fontName`, `fontWeight`, alignment, line height, letter spacing, style-run helpers. `lineHeight` and `letterSpacing` take Figma's `{ unit, value }` as well as pixels (a percentage is of the current font size) and read back in pixels; `getStyledTextSegments(fields)` splits the text by `fontName`, `fontSize`, `fontWeight`, `fills`, `letterSpacing`, `lineHeight`, `textDecoration`, or `textCase`
- Auto-layout: `layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `itemSpacing`, padding, sizing, and layout positioning fields
- Stroke helpers: `strokeWeight`, `strokeAlign`, `dashPattern`

### Utilities

- `figma.mixed`
- `figma.createImage(data)`
- `figma.loadFontAsync(fontName)` no-ops because Kalka does not gate text edits on plugin font loading
- `figma.listAvailableFontsAsync()` returns host-provided fonts when available
- `node.getCSSAsync()` resolves to the CSS the layer is drawn with, property to value, including CSS it keeps beside its fields such as `width: 50%` or `transition`; setting a field from a script replaces the CSS written for that field.
- `figma.getNodeByIdAsync(id)` and `instance.getMainComponentAsync()` resolve to the same nodes as `figma.getNodeById(id)` and `instance.mainComponent`, for scripts written for Figma's dynamic-page mode
- `figma.notify(message)` logs a warning in headless mode
- `instance.swapComponent(component)` points an instance at another component
- A layer inside an instance refuses `x`, `y`, `rotation`, `relativeTransform`, `constraints`, `isMask`, and `maskType` with Figma's error, such as `in set_x: This property cannot be overridden in an instance: relative-transform`; those always follow the component. Slot content keeps them, and setting one on a slot's default content makes the instance own the slot
- `component.createSlot()` adds a slot frame and its `SLOT` property; slot frames read `type: 'SLOT'`, `resetSlot()` brings back an instance slot's component content, and `limitViolations` lists the limits an instance slot breaks. `addComponentProperty` and `editComponentProperty` take a `description` and, for slots, `slotSettings`
- `figma.viewport`

## Not yet Figma-compatible

These Figma APIs are not exposed as compatible helpers yet:

- `node.exportAsync()`
- Figma style APIs such as `figma.createPaintStyle()` / `figma.createTextStyle()`
- `figma.createNodeFromJSXAsync()`; Kalka's `render` tool takes Kalka design JSX instead
- Full vector boolean operation parity

`UNSUPPORTED_PLUGIN_API` in `@kalka/core/figma-api` lists every Plugin API member of `figma` Kalka lacks, with the reason; the MCP `use_figma` tool throws it when a script reaches one. Use Kalka CLI export commands, core tools, or direct scene-graph helpers where available.
