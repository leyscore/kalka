# Features

## Figma .fig File Import & Export

Open and save native Figma files directly. Import decodes the full 194-definition Kiwi schema including NodeChange messages with ~390 fields. Export encodes the scene graph back to Kiwi binary with Zstd compression and thumbnail generation. Save (<kbd>⌘</kbd><kbd>S</kbd>) and Save As (<kbd>⇧</kbd><kbd>⌘</kbd><kbd>S</kbd>) use native OS dialogs on the desktop app. The import/export pipeline supports round-trip fidelity.

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

## Color Picker & Fill Types

HSV color selection with hue slider, alpha slider, hex input, and opacity control. The fill type picker provides tabs for Solid, Gradient (Linear, Radial, Angular, Diamond), and Image. Switching to a gradient type shows an editable gradient stop bar. Gradient transforms position the gradient within the shape. Connected to fill and stroke sections in the properties panel.

## Layers Panel

Tree view of the document hierarchy using Reka UI Tree component. Expand/collapse frames, drag to reorder (changes z-order), toggle visibility per node.

## Properties Panel

Context-sensitive panel with sections:

- **Appearance** — opacity, corner radius (uniform or per-corner with independent toggle), visibility
- **Fill** — solid/gradient/image type picker, gradient stop editor, hex input, opacity
- **Stroke** — color, weight, opacity, cap, join, dash pattern
- **Effects** — add/remove effects, type picker (drop shadow, inner shadow, layer blur, background blur, foreground blur), inline expanded controls (offset, blur, spread, color for shadows; blur radius for blurs), per-effect visibility toggle
- **Typography** — font family, weight, size, alignment
- **Layout** — auto-layout controls when enabled
- **Position** — alignment buttons, rotation, flip
- **Page** — canvas background color (shown when no nodes selected)

## Group/Ungroup

⌘G groups selected nodes. ⇧⌘G ungroups. Nodes are sorted by visual position when grouping to preserve reading order.

## Sections

Sections (<kbd>S</kbd>) are top-level organizational containers on the canvas. Each section displays a title pill with the section name. Title text color automatically inverts based on the pill's background luminance for readability. Creating a section auto-adopts overlapping sibling nodes. Frame name labels are shown for direct children of sections.

## Multi-Page Documents

Documents support multiple pages like Figma. The pages panel lets you add, delete, and rename pages. Each page maintains independent viewport state (pan, zoom, background color). Double-click a page name to rename inline.

## Hover Highlight

Nodes highlight on hover with a shape-aware outline that follows the actual geometry — ellipses get elliptical outlines, rounded rectangles get rounded outlines, vectors get path outlines. This provides visual feedback before clicking to select.

## Advanced Rendering (Tier 1)

The CanvasKit renderer supports full Tier 1 visual features for Figma rendering parity:

- **Gradient fills** — linear, radial, angular, diamond with gradient stops and transforms
- **Image fills** — decoded from blob data with scale modes (fill, fit, crop, tile)
- **Effects** — drop shadow, inner shadow, layer blur, background blur, foreground blur
- **Stroke properties** — cap (none, round, square, arrow), join (miter, bevel, round), dash patterns
- **Arc data** — partial ellipses with start/end angle and inner radius (donuts)
- **Viewport culling** — off-screen nodes are skipped during rendering
- **Paint reuse** — Skia Paint objects are recycled across frames instead of reallocated
- **RAF coalescing** — multiple render requests within one frame are batched into a single `requestAnimationFrame` call

## Components & Instances

Create reusable components from frames or selections (<kbd>⌥</kbd><kbd>⌘</kbd><kbd>K</kbd>). A single frame converts in-place to a COMPONENT; multiple nodes wrap in a new component. Combine multiple components into a COMPONENT_SET (<kbd>⇧</kbd><kbd>⌘</kbd><kbd>K</kbd>) with a dashed purple border. Create instances from components via context menu — instances copy the component's visual properties and deep-clone children with `componentId` mapping. Detach an instance back to a frame with <kbd>⌥</kbd><kbd>⌘</kbd><kbd>B</kbd>. "Go to main component" navigates to and selects the source component, switching pages if needed.

**Live sync:** Editing a main component propagates changes to all its instances automatically. The store triggers sync after property updates, moves, and resizes. Synced properties include size, fills, strokes, effects, opacity, corner radii, layout, and clipsContent. Instance children are matched to component children via `componentId`.

**Override support:** Instances maintain an overrides record. Properties marked as overridden are preserved during sync — if you customize an instance child's text, it won't be overwritten when the component changes. New children added to a component appear in all existing instances.

Components and instances display always-visible purple labels with a diamond icon showing the node name. They act as opaque containers for selection — clicking selects the component itself, double-clicking enters it to select children.

## Context Menu

Right-click on the canvas opens a Figma-style context menu. Actions adapt to the current selection:

- **Clipboard** — Copy, Cut, Paste here, Duplicate, Delete
- **Z-order** — Bring to front, Send to back
- **Grouping** — Group, Ungroup, Add auto layout
- **Components** — Create component, Create component set, Create instance, Go to main component, Detach instance (purple-styled items)
- **Visibility** — Hide/Show, Lock/Unlock
- **Move to page** — submenu with all other pages

Right-clicking a node selects it first. Right-clicking empty canvas clears selection.

## Z-Order, Visibility & Lock

<kbd>]</kbd> brings selected nodes to front, <kbd>[</kbd> sends to back within their parent. <kbd>⇧</kbd><kbd>⌘</kbd><kbd>H</kbd> toggles visibility — hidden nodes stay in the layers panel but don't render. <kbd>⇧</kbd><kbd>⌘</kbd><kbd>L</kbd> toggles lock — locked nodes can't be selected or moved from the canvas. Move nodes between pages via the context menu's "Move to page" submenu.

## Desktop App

Tauri v2 shell (~5MB vs Electron's ~100MB). Native menu bar with File/Edit/View/Object/Window/Help menus on all platforms. macOS gets an app-level submenu. Native Save/Open dialogs via Tauri plugin-dialog. Zstd compression offloaded to Rust for .fig export performance. Developer Tools accessible via <kbd>⌘</kbd><kbd>⌥</kbd><kbd>I</kbd>.

## ScrubInput

All numeric inputs in the properties panel use a drag-to-scrub interaction — drag horizontally to adjust the value, or click to type directly. Supports suffix display (°, px, %).

## CI/CD Builds

GitHub Actions workflow builds native Tauri desktop apps on version tags. The build matrix covers Windows (x64, arm64) and macOS (x64, arm64). Builds use `tauri-apps/tauri-action` and produce draft GitHub releases with platform-specific binaries.
