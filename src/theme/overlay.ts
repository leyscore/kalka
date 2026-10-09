/**
 * The surface of everything that floats above the editor: popovers, menus, lists, pickers,
 * and cards. Frosted glass: slightly transparent so the backdrop blur shows through. The ring,
 * unlike a border, outlines it in both themes without changing its size.
 */
export const floatingSurface =
  'rounded-xl bg-panel/82 text-surface shadow-[0_0_0_1px_var(--color-border),0_16px_48px_-8px_rgb(0_0_0/0.45),0_2px_8px_rgb(0_0_0/0.15)] backdrop-blur-2xl backdrop-saturate-150'

/** A one-line tooltip: the same edge and shadow on a compact shape. */
export const tooltipSurface =
  'rounded-md bg-panel/90 text-surface shadow-[0_0_0_1px_var(--color-border),0_8px_24px_-4px_rgb(0_0_0/0.4)] backdrop-blur-xl'
