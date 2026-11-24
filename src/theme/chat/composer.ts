import { tv } from 'tailwind-variants'

/** The chat's field: what the message is about on top, then the text, then who answers and how hard. */
export const chatComposerTheme = tv({
  slots: {
    about:
      '@container flex min-w-0 items-center gap-1.5 rounded-t-[11px] border-b border-hairline bg-linear-to-r from-accent/20 to-accent/5 p-1.5',
    aboutLabel: 'hidden shrink-0 pl-1 text-[10.5px] text-muted @[19rem]:inline',
    aboutChips: 'flex min-w-0 flex-1 items-center gap-1 overflow-hidden',
    aboutChip:
      'inline-flex h-[22px] max-w-40 min-w-10 items-center gap-1 rounded-md bg-accent/30 px-1.5 text-[11px] font-medium text-surface',
    aboutChipIcon: 'size-3 shrink-0',
    aboutChipLabel: 'truncate',
    aboutRemove:
      '-mr-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-hover',
    aboutRemoveIcon: 'size-2.5',
    point:
      'inline-flex h-[22px] shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[10.5px] whitespace-nowrap text-muted hover:bg-hover hover:text-surface disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted data-[state=on]:text-primary',
    pointIcon: 'size-3 shrink-0',
    pointLabel: 'hidden @[14rem]:inline',
    send: 'size-7 rounded-[9px] bg-accent text-white hover:bg-accent/90 hover:text-white',
    stop: 'size-7 rounded-[9px] bg-hover text-surface',
    stopMark: 'size-2 rounded-[2px] bg-current'
  }
})
