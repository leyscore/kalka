---
title: extractImageFilesFromClipboard
description: Clipboard utility for extracting accepted image and video files.
---

# extractImageFilesFromClipboard

`extractImageFilesFromClipboard(event)` filters clipboard files down to the raster images and videos (MP4, MOV, WebM) the canvas drop flow accepts.

Use it when implementing paste-from-clipboard workflows; pass the files to `placeCanvasFiles`, which places videos as layers with a video paint.

## Related APIs

- [useCanvasDrop](./use-canvas-drop)
- [useCanvas](../composables/use-canvas)
