# Undo and history

**Story:** as a designer who just made a mistake, I want to undo and redo freely, so that I can try things without fear.

**Start:** `/?test`, an artboard with a few layers.

## Missions

### Undo a run of edits

Move, recolor, rename and delete a layer, then undo four times and redo twice.

- **In Figma:** Cmd/Ctrl+Z undoes each step, Cmd/Ctrl+Shift+Z redoes; selection follows.
- **In Kalka, watch for:** Each step undoes on its own, in order, and the selection comes back with it.

### Undo a typing session

Type a paragraph in a text layer, leave it, and undo.

- **In Figma:** The typing undoes as one step or a few, not letter by letter.
- **In Kalka, watch for:** Undo removes the text in reasonable chunks.

### Go back in time

Restore the document as it was ten minutes ago.

- **In Figma:** File > Show version history lists autosaved versions to restore or duplicate.
- **In Kalka, watch for:** A version or history panel exists and restoring does not lose the current state without asking.
