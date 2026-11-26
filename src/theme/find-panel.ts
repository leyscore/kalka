import { tv } from 'tailwind-variants'

/** The find and replace panel in the left sidebar: Figma's ⌘F. */
export const findPanel = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col',
    header: 'flex shrink-0 items-center gap-1 px-4 pt-3 pb-1.5',
    title: 'min-w-0 flex-1 truncate text-[11px] font-semibold text-muted',
    controls: 'flex shrink-0 flex-col gap-1.5 border-b border-border px-3 pb-2',
    fieldRow: 'flex min-w-0 items-center gap-1',
    field:
      'flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-[7px] border border-transparent bg-panel-field px-2 text-xs text-surface hover:bg-panel-field-hover focus-within:border-panel-focus',
    fieldIcon: 'size-3.5 shrink-0 text-muted',
    input:
      'h-full min-w-0 flex-1 bg-transparent text-xs text-surface outline-none placeholder:text-muted',
    filters: 'flex flex-col gap-2 py-1',
    filterLabel: 'text-[11px] font-medium text-muted',
    check: 'flex items-center gap-2 text-[11px] text-surface',
    kinds: 'flex flex-wrap gap-1',
    kind: 'flex h-6 cursor-pointer items-center rounded-md px-2 text-[11px] text-muted outline-none hover:bg-hover hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=on]:bg-panel-selected-muted data-[state=on]:text-surface',
    replaceActions: 'flex items-center justify-end gap-1',
    status: 'flex min-h-6 items-center gap-1 text-[11px] text-muted tabular-nums',
    statusText: 'min-w-0 flex-1 truncate',
    list: 'scrollbar-thin min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-2',
    group: 'border-b border-border/60 pb-1 last:border-b-0',
    groupHeader:
      'flex h-7 min-w-0 items-center gap-1.5 px-3 text-[11px] font-semibold text-surface',
    groupPage: 'shrink-0 font-normal text-muted',
    groupTitle: 'min-w-0 truncate',
    row: 'flex h-7 w-full cursor-default items-center gap-2 pr-3 pl-6 text-left text-[11px] text-surface outline-none hover:bg-hover focus-visible:bg-hover data-[current]:bg-panel-selected-muted',
    rowIcon: 'size-3 shrink-0 text-muted',
    rowText: 'min-w-0 flex-1 truncate',
    mark: 'rounded-[2px] bg-accent/25 text-surface',
    rowTag: 'shrink-0 text-[10px] text-muted',
    empty: 'flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center',
    emptyIcon: 'size-5 text-surface/60',
    emptyText: 'max-w-56 text-xs text-surface/75'
  }
})
