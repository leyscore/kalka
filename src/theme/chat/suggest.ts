import { tv } from 'tailwind-variants'

import { floatingSurface } from '@/theme/overlay'

/** The list of skills after a slash, or of documents after an at sign, above the message field. */
export const chatSuggest = tv({
  slots: {
    root: [
      'absolute right-0 bottom-full left-0 z-20 mb-1.5 flex max-h-56 flex-col overflow-y-auto p-1',
      floatingSurface
    ],
    heading: 'px-2 pt-1 pb-1 text-[10px] font-semibold text-muted',
    option:
      'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-surface outline-none data-active:bg-row-selected data-active:text-row-selected-text',
    sign: 'w-3 shrink-0 text-center font-mono text-muted',
    name: 'min-w-0 flex-1 truncate font-mono'
  }
})
