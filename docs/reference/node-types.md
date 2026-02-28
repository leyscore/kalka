# Node Types

The scene graph uses Figma's Kiwi schema with 28 node types. Each node is identified by a GUID (`sessionID:localID`) and has a parent reference via `parentIndex`.

## Type Table

| Type | ID | Description |
|------|----|-------------|
| DOCUMENT | 1 | Root node, one per file |
| CANVAS | 2 | Page |
| GROUP | 3 | Group container |
| FRAME | 4 | Primary container (artboard), supports auto-layout |
| BOOLEAN_OPERATION | 5 | Union/subtract/intersect/exclude result |
| VECTOR | 6 | Freeform vector path |
| STAR | 7 | Star shape |
| LINE | 8 | Line |
| ELLIPSE | 9 | Ellipse/circle, supports arc data |
| RECTANGLE | 10 | Rectangle |
| REGULAR_POLYGON | 11 | Regular polygon (3–12 sides) |
| ROUNDED_RECTANGLE | 12 | Rectangle with smooth corners |
| TEXT | 13 | Text with rich formatting |
| SLICE | 14 | Export region |
| SYMBOL | 15 | Component (main) |
| INSTANCE | 16 | Component instance |
| STICKY | 17 | FigJam sticky note |
| SHAPE_WITH_TEXT | 18 | FigJam shape |
| CONNECTOR | 19 | Connector line between nodes |
| CODE_BLOCK | 20 | FigJam code block |
| WIDGET | 21 | Plugin widget |
| STAMP | 22 | FigJam stamp |
| MEDIA | 23 | Video/GIF |
| HIGHLIGHT | 24 | FigJam highlight |
| SECTION | 25 | Canvas section (organizational) |
| SECTION_OVERLAY | 26 | Section overlay |
| WASHI_TAPE | 27 | FigJam washi tape |
| VARIABLE | 28 | Variable definition node |

## Node Hierarchy

```
Document
└── Canvas (page)
    ├── Frame
    │   ├── Rectangle
    │   ├── Text
    │   └── Frame (nested)
    │       ├── Ellipse
    │       └── Instance (→ references Component)
    ├── Component
    │   └── ...children
    ├── Section
    │   └── Frame
    ├── Group
    │   └── ...children
    └── BooleanOperation
        └── ...operand shapes
```

## Core Properties

Every node carries these fields (subset of NodeChange):

### Identity & Tree

- `guid` — unique identifier (`sessionID:localID`)
- `type` — node type enum
- `name` — display name
- `phase` — CREATED or REMOVED
- `parentIndex` — parent GUID + position string for z-ordering

### Transform

- `size` — width/height vector
- `transform` — 2×3 affine matrix
- `rotation` — degrees

### Appearance

- `fillPaints[]` — fill colors/gradients/images
- `strokePaints[]` — stroke colors
- `effects[]` — shadows, blurs
- `opacity` — 0–1
- `blendMode` — NORMAL, MULTIPLY, SCREEN, etc.

### Stroke

- `strokeWeight` — stroke thickness
- `strokeAlign` — inside / center / outside
- `strokeCap` — butt / round / square
- `strokeJoin` — miter / bevel / round
- `dashPattern[]` — dash/gap lengths

### Corners

- `cornerRadius` — uniform radius
- `cornerSmoothing` — squircle amount (0–1)
- Per-corner radii when `rectangleCornerRadiiIndependent` is true

### Visibility

- `visible` — show/hide
- `locked` — prevent editing

## Type-Specific Properties

### Text

`fontSize`, `fontName`, `lineHeight`, `letterSpacing`, `textAlignHorizontal`, `textAlignVertical`, `textAutoResize`, `textData` (characters, style overrides, baselines, glyphs)

### Vector

`vectorData` (vectorNetworkBlob, normalizedSize), `fillGeometry[]`, `strokeGeometry[]`, `handleMirroring`, `arcData`

### Layout (Frame)

`stackMode`, `stackSpacing`, `stackPadding`, `stackJustify`, `stackCounterAlign`, `stackPrimarySizing`, `stackCounterSizing`, `stackChildPrimaryGrow`, `stackChildAlignSelf`

### Component

`symbolData`, `componentKey`, `componentPropDefs[]`, `symbolDescription`

### Instance

`overriddenSymbolID`, `symbolData.symbolOverrides[]`, `componentPropRefs[]`, `componentPropAssignments[]`

## Paint

```
Paint {
  type:       SOLID | GRADIENT_LINEAR | GRADIENT_RADIAL |
              GRADIENT_ANGULAR | GRADIENT_DIAMOND | IMAGE
  color:      {r, g, b, a}  (0–1 floats)
  opacity:    0–1
  visible:    boolean
  blendMode:  BlendMode
  stops:      ColorStop[]    (for gradients)
  transform:  Matrix         (for gradient/image positioning)
}
```

## Effect

```
Effect {
  type:     INNER_SHADOW | DROP_SHADOW | FOREGROUND_BLUR | BACKGROUND_BLUR
  color:    {r, g, b, a}
  offset:   {x, y}
  radius:   float
  spread:   float
  visible:  boolean
}
```
