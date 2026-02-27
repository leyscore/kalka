# Figma UI3 Layout — CDP Inspection Findings

Inspected via CDP on Figma desktop app (Feb 2026). Window: 1487×901, DPR 2.

## Overall Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Left Panel (309px)    │  Canvas (936px CSS, 1872px WebGL)│ Right Panel (241px) │
│                       │                                  │                     │
│ File name header      │  Single <canvas> element         │ Tabs: Design │ Proto│
│ Tabs: File │ Assets   │  class="gpu-view-content"        │ Zoom: 100% button   │
│ Pages list            │  No WebGL context exposed        │                     │
│ Layers tree           │  (Figma uses own GPU renderer)   │ [Scroll container]  │
│ (309×804 scroll area) │                                  │ (240×820)           │
│                       │                                  │                     │
│                       │  ┌──────────────────────┐        │                     │
│                       │  │ Toolbar (floating)   │        │                     │
│                       │  │ centered at bottom   │        │                     │
│                       │  └──────────────────────┘        │                     │
└─────────────────────────────────────────────────────────────────┘
```

## Toolbar (Bottom, Floating)

Three rows discovered at different y-positions. The main design toolbar is at y≈849.

### Main Toolbar Row (y≈849) — Design Mode
| x   | Tool       | Flyout ▾ | Notes |
|-----|------------|----------|-------|
| 511 | Move       | ▾ Move tools | Scale nested inside |
| 568 | Frame      | ▾ Region tools | Section, Slice nested |
| 625 | Rectangle  | ▾ Shape tools | Ellipse, Line, Star, Polygon, Arrow |
| 682 | Pen        | ▾ Creation tools | Pencil nested |
| 739 | Text       | — | |
| 779 | Comment    | ▾ Comment tools | |
| 836 | Actions    | — | AI/search menu (⚡) |

### View Toolbar Row (y≈801) — DevMode/Inspect
| x   | Tool |
|-----|------|
| 511 | Move |
| 551 | Copy colors |
| 591 | Measurement |
| 631 | Annotation |
| 671 | Comment |

### Tool button specs
- Each button: 32×32px, class `toolbelt_button--topLevelButtonNew`
- Flyout chevrons: 16×32px, class `tool_group--flyoutChevron`
- Tool+chevron combined: 49×32px (32 icon + 16 chevron + 1px gap)
- All buttons are `<button>` with `aria-label`

## Left Panel (309px)

```
┌─ File name header (309×48) ──────────┐
│ [Figma logo] [File actions ⋯]       │
├─ File browser toggle (309×44) ───────┤
│                                      │
├─ File name bar (309×53) ─────────────┤
│ "Project name" + "File name"         │
├─ Tab strip (309×41) ─────────────────┤
│ [File] [Assets]                      │
├─ Pages section (309×234) ────────────┤
│ Collapsible list of pages            │
├─ Layers tree (309×529) ──────────────┤
│ Class: object_row--row               │
│ Each row: 309×32                     │
│ - 16×32 expand caret (if has children)│
│ - Icon (node type)                   │
│ - Name text                          │
│ Virtual-scrolled                     │
└──────────────────────────────────────┘
```

Layer row class: `object_row--row--RUzis object_row--topLevel--SXq9o`
Has `aria-label` on icons: Rectangle, Frame, Auto layout, Section, Instance

## Right Panel (241px)

### Header (above scroll, 240×48)
- Tab strip: **Design** | **Prototype** (tabs__tabButton)
- Zoom button: "100%" (60×24), clickable

### Properties Sections (with a Rectangle selected)
Panel scroll area: 240×820, class `properties_panel--scrollContainer`

| y offset | Section | Content |
|----------|---------|---------|
| 0 | **Node header** | Type "Rectangle" + "Use as mask" toggle |
| 49 | **Position** | Section label |
| 89 | Alignment | 9-grid alignment buttons |
| 121 | Position X/Y | Two number inputs (88px each) |
| 153 | Rotation | Number input |
| 198 | **Layout** | Section with "Dimensions" subsection |
| 238 | Dimensions W/H | Two number inputs + lock aspect ratio |
| 283 | **Appearance** | "Hide" toggle |
| 368 | **Fill** | Color swatch + opacity input + visibility toggle |
| 453 | **Stroke** | Section (collapsed when empty) |
| 494 | **Effects** | Section (collapsed when empty) |
| 535 | **Export** | Section |

### Section ordering (top to bottom)
1. Node type + name + mask toggle
2. Position (X, Y)
3. Alignment (9-grid)
4. Rotation
5. Layout / Dimensions (W, H)
6. Appearance (opacity, hide)
7. Fill
8. Stroke
9. Effects
10. Export

## Canvas

- Single `<canvas>` element, no id, class `(none)`
- Parent: `div.view.gpu-view-content` with `inset: 0` (positioned absolutely)
- Physical size: 1872×1802 (2× DPR)
- CSS size: 936×901
- WebGL context: **not exposed** (Figma uses its own GPU rendering, likely via CanvasKit/Skia internally but doesn't expose the GL context to JS)
- Canvas receives all mouse/keyboard events

## CSS Variables
- **18,395 CSS variables** defined (massive design system)
- Figma uses CSS Modules with hashed class names (e.g., `toolbar--horizontalButton--lp3qk`)

## Key Findings for OpenPencil

1. **Toolbar is floating**, not pinned to window bottom edge — sits above canvas
2. **Three toolbar rows** exist: view tools, design tools, devmode tools (context-dependent)
3. **Tool groups with flyouts** — Move▾, Frame▾, Rectangle▾, Pen▾, Comment▾
4. **Properties panel sections** are ordered differently than our plan: Position → Alignment → Rotation → Layout/Dimensions → Appearance → Fill → Stroke → Effects → Export
5. **Zoom control** is in the right panel header, not the toolbar
6. **Left panel** has File/Assets tabs, then Pages, then Layers
7. **Canvas has no accessible WebGL context** — Figma's renderer is fully internal
