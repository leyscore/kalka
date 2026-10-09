import { tv } from 'tailwind-variants'

export const actionRow = tv({
  slots: {
    root: 'group flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-hairline bg-group px-3 py-2.5 text-left whitespace-normal transition-colors enabled:hover:bg-panel-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50',
    leading: 'flex shrink-0 items-center justify-center text-muted',
    body: 'min-w-0 flex-1',
    label: 'block truncate text-xs font-medium text-surface',
    description: 'block text-[11px] break-words text-muted',
    trailing: 'flex shrink-0 items-center gap-1 text-muted'
  }
})
