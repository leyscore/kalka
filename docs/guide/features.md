# Features

## Figma .fig File Import

Open native Figma files directly. The Kiwi binary codec decodes the full 194-definition schema including NodeChange messages with ~390 fields. The pipeline: parse header → decompress Zstd → decode Kiwi schema → extract NodeChange[] → build scene graph.

## Figma Clipboard

Copy/paste between OpenPencil and Figma. When you copy in Figma, OpenPencil decodes the fig-kiwi binary from the clipboard. When you copy in OpenPencil, it encodes fig-kiwi binary that Figma can read. Also works between OpenPencil instances.

## Vector Networks

The pen tool uses Figma's vector network model — not simple paths. Click to place corner points, click+drag for bezier curves with tangent handles. Supports open and closed paths. Vector data uses the same `vectorNetworkBlob` binary format as Figma.

## Auto-Layout

Yoga WASM provides CSS flexbox layout. Frames support:

- **Direction** — horizontal, vertical, wrap
- **Gap** — spacing between children
- **Padding** — uniform or per-side
- **Justify** — start, center, end, space-between
- **Align** — start, center, end, stretch
- **Child sizing** — fixed, fill, hug

Shift+A toggles auto-layout on a frame or wraps selected nodes.

## Inline Text Editing

Text nodes use CanvasKit's Paragraph API for rendering with proper text shaping and line breaking. Double-click to edit inline with a textarea overlay. Supports font families, weights, sizes, and line height. System fonts are available via the Local Font Access API.

## Undo/Redo

Every operation is undoable. The system uses an inverse-command pattern — before applying any change, it snapshots affected fields. The snapshot becomes the inverse. ⌘Z undoes, ⇧⌘Z redoes.

## Snap Guides

Edge and center snapping with red guide lines when nodes align. Rotation-aware — snap calculations use actual visual bounds of rotated nodes. Coordinates are computed in absolute canvas space.

## Canvas Rulers

Rulers at the top and left edges show coordinate scales. When you select a node, rulers highlight its position with a translucent band and show coordinate badges at the start/end points.

## Color Picker

HSV color selection with hue slider, alpha slider, hex input, and opacity control. Connected to fill and stroke sections in the properties panel.

## Layers Panel

Tree view of the document hierarchy using Reka UI Tree component. Expand/collapse frames, drag to reorder (changes z-order), toggle visibility per node.

## Properties Panel

Context-sensitive panel with sections:

- **Appearance** — size, position, rotation, opacity, corner radius, visibility
- **Fill** — color with hex input, opacity, visibility toggle
- **Stroke** — color, weight, opacity
- **Typography** — font family, weight, size, alignment
- **Layout** — auto-layout controls when enabled
- **Position** — alignment buttons, rotation, flip

## Group/Ungroup

⌘G groups selected nodes. ⇧⌘G ungroups. Nodes are sorted by visual position when grouping to preserve reading order.

## Desktop App

Tauri v2 shell (~5MB vs Electron's ~100MB). Native macOS menu bar with File/Edit/View/Window menus. Menu events are wired to the Vue frontend. Developer Tools accessible via ⌘⌥I.

## ScrubInput

All numeric inputs in the properties panel use a drag-to-scrub interaction — drag horizontally to adjust the value, or click to type directly. Supports suffix display (°, px, %).
