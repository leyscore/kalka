# Selecting and moving

**Story:** as a Figma user, I want to select exactly the layer I mean and move it precisely, so that I never fight the selection.

**Start:** `/?test`, an artboard with a card (frame) holding an image, a title and a button.

## Missions

### Reach a nested layer

Select the button inside the card directly on the canvas.

- **In Figma:** Click selects the card; double-click or Cmd/Ctrl+click reaches the button; Enter selects children, Shift+Enter the parent, Tab the next sibling.
- **In Kalka, watch for:** Same clicks and keys; the hover outline shows what a click will select.

### Nudge

Move the title 1 px and then 10 px with the keyboard.

- **In Figma:** Arrow keys move 1 px, Shift+arrows 10 px.
- **In Kalka, watch for:** Same steps; the value in the right panel changes accordingly.

### Measure

Find the distance between the title and the button.

- **In Figma:** Select one, hold Alt/Option and hover the other: red distance lines.
- **In Kalka, watch for:** Holding Alt/Option shows the distances.

### Select several

Select the title and the button with a drag rectangle and with Shift+click.

- **In Figma:** Marquee from empty canvas, Shift+click adds or removes; a marquee starting on a frame inside an artboard selects inside it.
- **In Kalka, watch for:** Same behavior, including inside an artboard.
