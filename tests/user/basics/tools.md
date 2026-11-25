# Switching tools

**Story:** as a Figma user, I want to switch tools with one click or one key from anywhere, so that the toolbar never gets in my way.

**Start:** `/?test`, a document with one artboard.

## Missions

### Every tool

Pick each tool in the bottom toolbar, then with V, F, R, O, L, P, T, H.

- **In Figma:** One click or key switches from any tool to any other; Escape cancels the tool.
- **In Kalka, watch for:** The same, including from the comment tool; the pressed button is always the active tool.

### Comment, then design

Turn on comments, place one, then pick the rectangle tool and draw.

- **In Figma:** Picking another tool leaves comment mode.
- **In Kalka, watch for:** The next click draws a rectangle, not another comment.

### One shape at a time

Draw a rectangle, then click on the canvas again.

- **In Figma:** The tool returns to Move after one shape.
- **In Kalka, watch for:** Kalka returns to Move after one shape.
