import { tv } from 'tailwind-variants'

/**
 * The instructions panel: what agents know of this project, in three groups. Skills, then the
 * rules they always read, then the documents they are given on request.
 */
export const instructionsPanel = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col overflow-y-auto pb-3',
    title: 'shrink-0 px-4 pt-3 pb-2 text-[11px] font-semibold text-muted',
    group: 'flex flex-col px-2 pb-3',
    heading:
      'flex h-7 items-center gap-1 px-2 text-[10px] font-semibold tracking-wide text-muted uppercase',
    count: 'font-normal tabular-nums',
    add: '-me-1 ms-auto size-6 rounded-md',
    row: 'flex h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-xs text-surface outline-none transition-colors hover:bg-hover focus-visible:ring-1 focus-visible:ring-panel-focus data-active:bg-row-selected data-active:text-row-selected-text',
    name: 'min-w-0 flex-1 truncate',
    command: 'font-mono',
    tag: 'shrink-0 rounded bg-group px-1.5 py-0.5 text-[10px] text-muted',
    hint: 'px-2 pb-1 text-xs leading-relaxed text-muted',
    form: 'flex items-center gap-1.5 px-2 pb-1'
  }
})
