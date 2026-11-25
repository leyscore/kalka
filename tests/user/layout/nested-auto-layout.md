# Nested auto layout

**Story:** as a UI designer building a card, I want to nest rows in columns, so that components grow with their content.

**Start:** `/?test`, an image, a title, a description and two buttons.

## Missions

### Build a card

Make a vertical card: image, title, description, then a row with the two buttons.

- **In Figma:** Shift+A on the buttons, then Shift+A on everything; set gaps per level.
- **In Kalka, watch for:** Each level keeps its own gap; the card hugs its content.

### Grow with text

Make the description three times longer.

- **In Figma:** The card grows taller.
- **In Kalka, watch for:** The card grows and nothing overlaps.

### Absolute inside

Put a "New" badge in the image corner without leaving auto layout.

- **In Figma:** Absolute position toggle on the child.
- **In Kalka, watch for:** An equivalent exists.
