import { tv } from 'tailwind-variants'

/**
 * The theme picker in Settings › Preferences: three small windows, light, dark and one split
 * between them for Auto, each a choice with its name under it.
 */
export const themePicker = tv({
  slots: {
    root: 'grid grid-cols-3 gap-3 p-4 sm:max-w-[520px]',
    option:
      'group flex cursor-pointer flex-col gap-2 rounded-[12px] border-0 bg-transparent p-0 text-left outline-none',
    window:
      'relative aspect-[16/10] overflow-hidden rounded-[10px] shadow-[0_0_0_1px_var(--color-hairline)] transition-shadow group-hover:shadow-[0_0_0_1px_var(--color-muted)] group-focus-visible:shadow-[0_0_0_2px_var(--color-accent)] group-data-[state=checked]:shadow-[0_0_0_2px_var(--color-accent)]',
    half: 'absolute inset-0 flex flex-col',
    bar: 'h-[14%] shrink-0',
    body: 'flex min-h-0 flex-1 gap-[6%] p-[6%]',
    side: 'w-[22%] rounded-[3px]',
    canvas: 'flex flex-1 items-center justify-center rounded-[3px]',
    frame: 'h-[46%] w-[52%] rounded-[2px]',
    label: 'flex items-center gap-1.5 text-xs text-muted group-data-[state=checked]:text-surface',
    dot: 'size-3 shrink-0 rounded-full border border-hairline group-data-[state=checked]:border-[4px] group-data-[state=checked]:border-accent'
  },
  variants: {
    tone: {
      light: {
        half: 'bg-[#EEF0F4]',
        bar: 'bg-white',
        side: 'bg-white',
        canvas: 'bg-[#E3E6EC]',
        frame: 'bg-white shadow-[0_1px_2px_rgb(0_0_0/0.12)]'
      },
      dark: {
        half: 'bg-[#141518]',
        bar: 'bg-[#1E1F23]',
        side: 'bg-[#1E1F23]',
        canvas: 'bg-[#0C0D0F]',
        frame: 'bg-[#2A2C31]'
      }
    }
  }
})

/**
 * The workflow rule in Settings › Preferences: a track with three notches, no AI on the left and
 * AI first on the right, and under each notch its name with an icon. The thumb snaps to a notch.
 */
export const workflowRule = tv({
  slots: {
    root: 'flex flex-col gap-2.5',
    slider: 'relative flex h-5 w-full touch-none items-center select-none',
    track: 'relative h-1.5 grow rounded-full bg-hover',
    range: 'absolute h-full rounded-full bg-accent',
    notches:
      'pointer-events-none absolute inset-x-[7px] inset-y-0 flex items-center justify-between',
    notch: 'size-1 rounded-full bg-muted/60 data-reached:bg-white/80',
    thumb:
      'block size-[18px] cursor-grab rounded-full border-2 border-accent bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)] outline-none focus-visible:ring-2 focus-visible:ring-panel-focus active:cursor-grabbing',
    stops: 'grid grid-cols-3',
    stop: 'group flex cursor-pointer items-center gap-1.5 justify-self-center rounded-md border-0 bg-transparent p-0 text-xs text-muted transition-colors outline-none first:justify-self-start last:justify-self-end hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-active:font-medium data-active:text-surface',
    icon: 'relative flex size-4 shrink-0 items-center justify-center group-data-active:text-accent',
    glyph: 'size-4',
    // The AI mark struck through, for the level that hides AI.
    strike:
      'after:absolute after:top-1/2 after:-inset-x-0.5 after:h-[1.5px] after:-translate-y-1/2 after:-rotate-45 after:rounded-full after:bg-current after:shadow-[0_0_0_1.5px_var(--color-panel)]'
  }
})
