# Drawing and snapping

**Story:** as a Figma user, I want layers to snap to edges and to each other, so that I can line things up by hand.

**Start:** `/?test`, a 1440 artboard.

## Missions

### Edge to edge

Make a rectangle exactly as wide as the artboard by dragging only.

- **In Figma:** Edges snap to the artboard edges and center with red guides.
- **In Kalka, watch for:** The same snapping and guides.

### Line things up

Draw three buttons and line them up with equal gaps by dragging.

- **In Figma:** Snapping to other layers; pink equal-spacing marks.
- **In Kalka, watch for:** Snapping to siblings; equal spacing shown, if Kalka has it.

### Something too wide

Stretch a shape past the artboard edge.

- **In Figma:** Frames clip content by default ("Clip content" in the right panel).
- **In Kalka, watch for:** The part outside is hidden while "Clip content" is on, and the setting is easy to find.

### Draw outside, drop inside

Draw a shape on the empty canvas and drag it into the artboard.

- **In Figma:** It becomes the artboard child; the artboard highlights during the drag.
- **In Kalka, watch for:** Same result in the layers panel; the look does not change.
