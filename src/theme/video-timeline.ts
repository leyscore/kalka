import { tv } from 'tailwind-variants'

/**
 * A video fill's timeline: the preview, the trimmed part of the clip on a two-thumb slider, and
 * the frame shown as its poster on a scrubber.
 */
export const videoTimeline = tv({
  slots: {
    root: 'space-y-1.5',
    preview: 'flex h-24 items-center justify-center overflow-hidden rounded border border-border',
    video: 'max-h-full max-w-full object-contain',
    row: 'flex h-6 items-center gap-2',
    label: 'w-[72px] shrink-0 truncate text-[11px] text-muted',
    slider: 'relative flex h-4 min-w-0 flex-1 touch-none items-center select-none',
    track: 'relative h-1 grow rounded-full bg-hover',
    range: 'absolute inset-y-0 rounded-full bg-accent',
    thumb:
      'block size-3 cursor-grab rounded-full border border-border bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-panel-focus active:cursor-grabbing',
    value: 'shrink-0 text-right font-mono text-[11px] text-surface tabular-nums'
  }
})
