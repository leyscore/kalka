import { tv } from 'tailwind-variants'

export const tabs = tv({
  slots: {
    root: 'flex min-h-0 min-w-0 flex-1 flex-col data-[orientation=vertical]:flex-row',
    list: 'flex min-w-0 shrink-0 gap-1 overflow-x-auto p-2 data-[orientation=vertical]:w-48 data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:border-r data-[orientation=vertical]:border-hairline data-[orientation=vertical]:px-2.5 data-[orientation=vertical]:py-3',
    trigger:
      'flex shrink-0 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-left text-xs text-muted transition-colors duration-150 hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-default disabled:opacity-50 data-[state=active]:font-semibold data-[state=active]:text-surface data-[orientation=vertical]:min-h-[34px] data-[orientation=vertical]:gap-2.5 data-[orientation=vertical]:rounded-[9px] data-[orientation=vertical]:py-0 data-[orientation=vertical]:text-[13px] data-[orientation=vertical]:text-subtle data-[orientation=vertical]:hover:text-surface data-[orientation=vertical]:data-[state=active]:text-surface',
    icon: 'flex size-3.5 shrink-0 items-center justify-center in-data-[orientation=vertical]:size-4',
    label: 'min-w-0',
    trailing: 'ml-auto shrink-0',
    content:
      'min-h-0 min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50'
  }
})
