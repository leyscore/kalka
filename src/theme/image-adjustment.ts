import { tv } from 'tailwind-variants'

/** A row of the image fill's adjustments: a label, a slider centred on 0, and its value. */
export const imageAdjustment = tv({
  slots: {
    root: 'flex h-6 items-center gap-2',
    label: 'w-[72px] shrink-0 truncate text-[11px] text-muted',
    slider: 'relative flex h-4 min-w-0 flex-1 touch-none items-center select-none',
    track: 'relative h-1 grow rounded-full bg-hover',
    // The range runs from the centre to the value, as Figma's adjustment sliders draw it.
    range: 'absolute inset-y-0 rounded-full bg-accent',
    centre: 'pointer-events-none absolute top-1/2 left-1/2 h-2 w-px -translate-1/2 bg-muted/60',
    thumb:
      'block size-3 cursor-grab rounded-full border border-border bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-panel-focus active:cursor-grabbing',
    value: 'w-8 shrink-0 text-right font-mono text-[11px] text-surface tabular-nums'
  }
})
