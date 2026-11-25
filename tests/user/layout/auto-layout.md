# Auto layout

**Story:** as a Figma user, I want layers to arrange themselves in rows and columns, so that my layout keeps its spacing when content changes.

**Start:** `/?test`, three buttons side by side.

## Missions

### Make a row

Turn the three buttons into an auto layout row.

- **In Figma:** Shift+A; the gap is guessed from the current spacing.
- **In Kalka, watch for:** Same shortcut; the gap matches.

### Gap and padding

Set a 16 gap and 24 padding, then change the gap by dragging on the canvas.

- **In Figma:** Fields in the right panel; pink handles on the canvas.
- **In Kalka, watch for:** The fields are where a Figma user looks; handles if Kalka has them.

### Hug and fill

Make the middle button fill the remaining width, then the row fill the artboard.

- **In Figma:** Hug, Fill and Fixed in the width and height menus.
- **In Kalka, watch for:** The same three choices.

### Reorder in the flow

Move the first button to the end by dragging it on the canvas, then in the layers panel.

- **In Figma:** On the canvas a blue line shows the drop place; in the panel the last item in the flow is the first row.
- **In Kalka, watch for:** The same on both.
