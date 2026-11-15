import { tv } from 'tailwind-variants'

import { floatingSurface } from '@/theme/overlay'

/** The row of screen sizes floating at the top of the canvas: one icon per breakpoint, and a plus. */
export const canvasBreakpoints = tv({
  slots: {
    root: [
      'absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 p-1',
      floatingSurface
    ],
    item: 'flex size-7 cursor-pointer items-center justify-center rounded-[7px] text-muted outline-none transition-colors duration-150 hover:bg-hover hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-active:bg-panel-selected data-active:text-white',
    icon: 'size-4',
    divider: 'mx-0.5 h-4 w-px bg-hairline'
  }
})
