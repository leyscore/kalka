---
title: useFillPicker
description: Low-level fill-category and conversion helper.
---

# useFillPicker

::: warning Deprecated
Use `useFill()` or the [FillRoot](../components/fill-root) primitive. `useFillPicker()` remains as a
migration wrapper until the picker cleanup slice.
:::

`useFillPicker(fill, onUpdate)` returns legacy fill category state plus conversion helpers for
switching between solid, gradient, and image fills.

## Related APIs

- [FillPickerRoot](../components/fill-picker-root)
- [useFillControls](../composables/use-fill-controls)
- [useGradientStops](./use-gradient-stops)
