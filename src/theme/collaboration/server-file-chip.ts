import { tv } from 'tailwind-variants'

/** The mark beside a server document's name: where it lives, and whether it is view only. */
export const serverFileChip = tv({
  slots: {
    root: 'flex h-6 max-w-44 min-w-0 shrink-0 items-center gap-1 rounded-md border border-hairline px-1.5 text-[11px] text-muted',
    icon: 'size-3.5 shrink-0',
    label: 'truncate'
  },
  variants: {
    viewOnly: {
      true: { root: 'border-warning-border bg-warning-bg text-warning-text' }
    }
  }
})
