import { tv } from 'tailwind-variants'

/**
 * The instructions panel: what agents know, in three groups. Skills, then the rules they always
 * read, then the documents they are given on request. A pill glides to the open row and follows
 * the pointer, as in the page list.
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
    row: 'group/row flex h-7 items-center gap-1 rounded-md pr-1 text-xs text-surface data-active:text-row-selected-text data-off:text-muted',
    open: 'flex h-7 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md pl-2 text-left outline-none focus-visible:ring-1 focus-visible:ring-panel-focus',
    name: 'min-w-0 flex-1 truncate group-data-off/row:line-through',
    command: 'font-mono',
    tag: 'shrink-0 rounded bg-group px-1.5 py-0.5 text-[10px] text-muted',
    action:
      'size-6 shrink-0 rounded-md opacity-0 focus-visible:opacity-100 group-hover/row:opacity-100 group-data-off/row:opacity-100 data-confirm:text-error data-confirm:opacity-100',
    hint: 'px-2 pb-1 text-xs leading-relaxed text-muted',
    form: 'flex items-center gap-1.5 px-2 pb-1'
  }
})
