import { tv } from 'tailwind-variants'

import type { DialogUI } from '@/components/ui/dialog/ui'

export const documentCloseUI = {
  header: 'border-b-0 px-5 pt-5 pb-4',
  title: 'mb-1 text-pretty break-words',
  description: 'leading-relaxed',
  footer: 'flex-wrap border-t-0 px-5 pt-0 pb-5'
} satisfies DialogUI

export const documentCloseButtonUI = { base: 'min-w-18 justify-center' }

/** The unsaved documents a Quit would close, listed between the question and its answers. */
export const documentCloseListStyles = tv({
  slots: {
    list: 'mx-5 mb-4 flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-hairline bg-group p-1',
    item: 'flex min-w-0 items-center gap-2 rounded-[7px] px-2 py-1.5 text-xs text-surface'
  }
})()
