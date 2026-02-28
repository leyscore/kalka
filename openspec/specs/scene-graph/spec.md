# scene-graph Specification

## Purpose
Hierarchical data structure managing all design nodes. Provides flat Map<GUID, Node> storage with parent-child tree via parentIndex, CRUD operations, hit testing, and spatial queries.
## Requirements
### Requirement: Flat node storage with GUID keys
The scene graph SHALL store all nodes in a flat `Map<string, SceneNode>` keyed by GUID string. Tree structure SHALL be maintained via `parentIndex` references on each node. Each SceneNode SHALL include `componentId` (nullable reference to main component for instances) and `overrides` (record of instance-level property overrides).

#### Scenario: Create and retrieve a node
- **WHEN** a node is created with type RECTANGLE and a parent GUID
- **THEN** the node is stored in the map and retrievable by its GUID

#### Scenario: Parent-child relationship
- **WHEN** a child node references a parent via parentIndex
- **THEN** `getChildren(parentId)` returns the child sorted by position string

#### Scenario: Node has component fields
- **WHEN** a SceneNode is created
- **THEN** it has `componentId: null` and `overrides: {}` by default

### Requirement: Node types
The scene graph SHALL support node types: FRAME, RECTANGLE, ELLIPSE, LINE, TEXT, VECTOR, STAR, POLYGON, GROUP, BOOLEAN_OPERATION, DOCUMENT, CANVAS.

#### Scenario: Create each supported node type
- **WHEN** a node of each supported type is created
- **THEN** the node is stored with the correct type enum value

### Requirement: CRUD operations
The scene graph SHALL support create, read, update, and delete operations on nodes.

#### Scenario: Delete a node
- **WHEN** a node is deleted by GUID
- **THEN** the node is removed from the map and no longer returned by queries

#### Scenario: Update node properties
- **WHEN** a node's properties (size, fill, rotation) are updated
- **THEN** subsequent reads return the updated values

### Requirement: Hit testing
The scene graph SHALL support hit testing — given a point in canvas coordinates, return the topmost visible node at that position.

#### Scenario: Hit test on overlapping nodes
- **WHEN** two rectangles overlap and a point inside the overlap area is tested
- **THEN** the node with higher z-order (later in position string sorting) is returned

### Requirement: Rectangular area query
The scene graph SHALL support querying all nodes that intersect a given rectangle (for marquee selection).

#### Scenario: Marquee selection
- **WHEN** a rectangle area query is performed
- **THEN** all nodes whose bounds intersect the rectangle are returned

### Requirement: Unit test coverage
The scene graph SHALL have bun:test unit tests covering CRUD, parent-child, z-ordering, and hit testing.

#### Scenario: Unit tests pass
- **WHEN** `bun test ./tests/engine` is run
- **THEN** all scene graph unit tests pass in <50ms

### Requirement: Multi-page document support
The scene graph SHALL support multiple CANVAS (page) nodes as children of the DOCUMENT root. Each page has its own child tree. Pages can be added, deleted, and renamed.

#### Scenario: Add a new page
- **WHEN** user adds a page
- **THEN** a new CANVAS node is created as a child of the DOCUMENT root and becomes the active page

#### Scenario: Delete a page
- **WHEN** user deletes a page and at least two pages exist
- **THEN** the page is removed and the adjacent page becomes active

#### Scenario: Rename a page
- **WHEN** user renames a page
- **THEN** the CANVAS node's name property updates

### Requirement: Section node type
The scene graph SHALL support SECTION nodes. Sections are top-level only (direct children of CANVAS), cannot nest inside frames or groups. Sections auto-adopt overlapping siblings on creation.

#### Scenario: Create section
- **WHEN** user draws a section on the canvas
- **THEN** a SECTION node is created as a direct child of the current page

#### Scenario: Section auto-adopt
- **WHEN** a section is created overlapping existing nodes
- **THEN** overlapping sibling nodes are reparented into the section

#### Scenario: Section nesting restriction
- **WHEN** user attempts to move a section inside a frame or group
- **THEN** the section remains at top-level (direct child of CANVAS)

### Requirement: Extended node type union
The NodeType union SHALL include: CANVAS, FRAME, RECTANGLE, ROUNDED_RECTANGLE, ELLIPSE, TEXT, LINE, STAR, POLYGON, VECTOR, GROUP, SECTION, COMPONENT, COMPONENT_SET, INSTANCE, CONNECTOR, SHAPE_WITH_TEXT.

#### Scenario: NodeType covers all Figma types used in import
- **WHEN** a .fig file containing ROUNDED_RECTANGLE, COMPONENT, INSTANCE, CONNECTOR, or SHAPE_WITH_TEXT nodes is imported
- **THEN** each node is created with its correct type in the scene graph

### Requirement: Hover state tracking
The scene graph state SHALL track a `hoveredNodeId` for the node currently under the cursor.

#### Scenario: Hover a node
- **WHEN** user moves the cursor over a node
- **THEN** `hoveredNodeId` updates to that node's ID and a render is requested

### Requirement: Extended fill types
The Fill interface SHALL support types: SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND, IMAGE. Gradient fills include `gradientStops` and `gradientTransform`. Image fills include `imageHash`, `imageScaleMode`, and `imageTransform`.

#### Scenario: Gradient fill on a node
- **WHEN** a node has a GRADIENT_LINEAR fill with two stops
- **THEN** the fill stores both gradient stops with position and color, plus a 2×3 gradient transform

### Requirement: Extended stroke properties
The Stroke interface SHALL support `cap` (NONE, ROUND, SQUARE, ARROW_LINES, ARROW_EQUILATERAL), `join` (MITER, BEVEL, ROUND), and `dashPattern` (array of dash/gap lengths).

#### Scenario: Dashed stroke
- **WHEN** a node has a stroke with dashPattern [10, 5]
- **THEN** the stroke renders as a dashed line with 10px dashes and 5px gaps

### Requirement: Per-page viewport state
Each page SHALL maintain independent viewport state (panX, panY, zoom, pageColor). Switching pages restores the viewport.

#### Scenario: Switch page restores viewport
- **WHEN** user switches from Page 1 (zoomed to 200%) to Page 2 and back
- **THEN** Page 1's viewport returns to 200% zoom at the previous pan position


### Requirement: Clone tree
The scene graph SHALL support deep-cloning a node subtree to a new parent via `cloneTree(sourceId, parentId)`, copying all properties and recursively cloning children.

#### Scenario: Clone subtree
- **WHEN** `cloneTree` is called on a frame with two children
- **THEN** a new frame with two new children is created under the target parent

### Requirement: Create instance from component
The scene graph SHALL support creating an INSTANCE node from a COMPONENT via `createInstance(componentId, parentId)`, copying visual properties and deep-cloning children.

#### Scenario: Instance copies component children
- **WHEN** `createInstance` is called for a component with three children
- **THEN** the instance has three cloned children matching the component's

### Requirement: Detach instance
The scene graph SHALL support converting an INSTANCE to FRAME via `detachInstance(instanceId)`, clearing `componentId` and `overrides`.

#### Scenario: Detach changes type
- **WHEN** `detachInstance` is called on an instance
- **THEN** its type becomes FRAME and componentId becomes null

### Requirement: Get main component
The scene graph SHALL support `getMainComponent(instanceId)` returning the source COMPONENT for an instance.

#### Scenario: Retrieve main component
- **WHEN** `getMainComponent` is called on an instance
- **THEN** the linked COMPONENT node is returned

### Requirement: Deep hit testing
The scene graph SHALL support `hitTestDeep(px, py)` that traverses into COMPONENT and INSTANCE containers, unlike standard `hitTest` which treats them as opaque.

#### Scenario: Deep hit test enters component
- **WHEN** `hitTestDeep` is called at a position inside a component's child
- **THEN** the child is returned, not the component
