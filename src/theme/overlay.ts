/**
 * The surface of everything that floats above the editor: popovers, menus, lists, pickers,
 * and cards. Frosted glass, like the app's panels but denser so text over the canvas stays
 * legible. The ring, unlike a border, outlines it in both themes without changing its size.
 */
export const floatingSurface =
  'rounded-xl bg-float text-surface shadow-[0_0_0_1px_var(--color-float-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150'

/** A one-line tooltip: the same glass and edge on a compact shape. */
export const tooltipSurface =
  'rounded-[7px] bg-float text-surface shadow-[0_0_0_1px_var(--color-float-border),0_8px_24px_-6px_rgb(0_0_0/0.3)] backdrop-blur-xl'
