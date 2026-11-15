import { tv } from 'tailwind-variants'

/** The row of screen sizes in the middle of the editor's top bar: one icon per breakpoint, and a plus. */
export const canvasBreakpoints = tv({
  slots: {
    root: 'flex items-center gap-0.5 rounded-[10px] bg-track p-0.5',
    item: 'flex size-7 cursor-pointer items-center justify-center rounded-[7px] text-muted outline-none transition-colors duration-150 hover:bg-hover hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-active:bg-panel-selected data-active:text-white',
    icon: 'size-4',
    divider: 'mx-0.5 h-4 w-px bg-hairline'
  }
})
