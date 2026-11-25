# Booleans and masks

**Story:** as a designer making icons and image crops, I want to combine shapes and mask content, so that I can build complex shapes from simple ones.

**Start:** `/?test`, two overlapping circles and an image.

## Missions

### Combine shapes

Union, subtract, intersect and exclude the two circles.

- **In Figma:** Boolean buttons in the toolbar or the right panel; the result stays editable.
- **In Kalka, watch for:** All four operations, editable afterwards.

### Flatten

Turn the boolean into one plain vector.

- **In Figma:** Cmd/Ctrl+E flattens.
- **In Kalka, watch for:** An equivalent exists.

### Mask an image

Show the image only inside a circle.

- **In Figma:** Put the circle under the image, select both, "Use as mask" (Cmd+Ctrl+M on Mac).
- **In Kalka, watch for:** Masking works the same way, and the mask is clear in the layers panel.
