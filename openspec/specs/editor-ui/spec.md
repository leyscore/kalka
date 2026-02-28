# editor-ui Specification

## Purpose
Vue 3 + Reka UI editor interface. Bottom toolbar, layers panel with tree view and drag reorder, properties panel with sectioned layout (appearance, fill, stroke, typography, layout, position), color picker, and Lucide icons.
## Requirements
### Requirement: Vue 3 + Reka UI component architecture
The editor UI SHALL be built with Vue 3, VueUse composables, and Reka UI headless components. The UI framework was migrated from React to Vue 3.

#### Scenario: Editor loads
- **WHEN** user opens the editor at localhost:1420
- **THEN** the Vue 3 application renders with canvas, toolbar, layers panel, and properties panel

### Requirement: Bottom toolbar
The toolbar SHALL be positioned at the bottom of the screen (Figma UI3 style) with tool selection: Select (V), Frame (F), Section (S, in Frame flyout), Rectangle (R), Ellipse (O), Line (L), Text (T), Hand (H), Pen (P).

#### Scenario: Tool selection via keyboard
- **WHEN** user presses R
- **THEN** the rectangle tool is activated and the toolbar shows R as selected

#### Scenario: Frame flyout includes Section
- **WHEN** user opens the Frame tool flyout
- **THEN** both Frame and Section tools are available

### Requirement: Layers panel with tree view
The layers panel SHALL display a tree view of the document hierarchy using Reka UI Tree with expand/collapse and drag reordering.

#### Scenario: Expand/collapse frame children
- **WHEN** user clicks the chevron next to a frame in the layers panel
- **THEN** the frame's children are shown or hidden

#### Scenario: Drag reorder layers
- **WHEN** user drags a layer to a new position in the layers panel
- **THEN** the node's z-order in the scene graph changes accordingly

#### Scenario: Visibility toggle
- **WHEN** user clicks the visibility icon next to a layer
- **THEN** the node is hidden/shown on canvas

### Requirement: Properties panel with sections
The properties panel SHALL be split into sections: Appearance (size, position, rotation, opacity, corner radius, visibility), Fill, Stroke, Typography, Layout, Position.

#### Scenario: Properties panel shows fill section
- **WHEN** user selects a rectangle with a blue fill
- **THEN** the Fill section shows the hex color #3B82F6 with opacity and visibility controls

#### Scenario: Editable hex input
- **WHEN** user types a new hex value in the fill section
- **THEN** the node's fill updates to the entered color

### Requirement: Color picker
The color picker SHALL provide HSV color selection, hue slider, alpha slider, hex input, and opacity control.

#### Scenario: Change color via HSV
- **WHEN** user moves the color picker cursor in the HSV square
- **THEN** the selected node's fill updates in real time

### Requirement: Lucide icons via Iconify
UI icons SHALL use Lucide icons loaded via unplugin-icons with Iconify, replacing inline emoji/SVG.

#### Scenario: Icon rendering
- **WHEN** the toolbar renders tool icons
- **THEN** Lucide icons are displayed via the icon auto-import resolver

### Requirement: Tailwind CSS 4 styling
The editor SHALL use Tailwind CSS 4 for all styling.

#### Scenario: Dark theme
- **WHEN** the editor renders
- **THEN** the UI uses a dark theme styled with Tailwind CSS 4 utility classes

### Requirement: Pages panel
The editor SHALL display a PagesPanel component showing all pages in the document. Users can switch pages, add pages, delete pages, and rename pages inline (blur commits, Enter/Escape just blur).

#### Scenario: Switch page
- **WHEN** user clicks a page tab in the pages panel
- **THEN** the canvas switches to that page and viewport state is restored

#### Scenario: Add page
- **WHEN** user clicks the add page button
- **THEN** a new page is created and becomes active

#### Scenario: Inline page rename
- **WHEN** user double-clicks a page name
- **THEN** an inline text input appears, blur commits the rename

### Requirement: Section tool
The toolbar SHALL include a Section tool (shortcut <kbd>S</kbd>) in the Frame flyout. Drawing on canvas creates a SECTION node.

#### Scenario: Section tool activation
- **WHEN** user presses S
- **THEN** the section tool activates and the toolbar shows Section as selected

### Requirement: Fill type picker with gradient and image support
The fill section in the properties panel SHALL provide a type picker with tabs: Solid, Gradient (Linear, Radial, Angular, Diamond), and Image. Gradient fills show editable gradient stops. Image fills show image selection.

#### Scenario: Switch fill to linear gradient
- **WHEN** user selects "Linear Gradient" from the fill type picker
- **THEN** the selected node's fill changes to GRADIENT_LINEAR with default stops and the gradient stop editor appears

#### Scenario: Edit gradient stop
- **WHEN** user drags a gradient stop to position 50%
- **THEN** the stop position updates and the node re-renders with the adjusted gradient

### Requirement: Page background color
The properties panel SHALL show a page section with canvas background color picker when no nodes are selected.

#### Scenario: Change canvas background
- **WHEN** user selects no nodes and changes the page color
- **THEN** the canvas background updates to the chosen color

### Requirement: Hover highlight in canvas
The editor SHALL highlight nodes on hover with a shape-aware outline (follows actual geometry, not just bounding box).

#### Scenario: Hover feedback
- **WHEN** user moves cursor over a node without clicking
- **THEN** a highlight outline appears around the node shape

