import { tv } from 'tailwind-variants'

/**
 * The folder panel: the document's files as a tree, each row marked with what Git says changed,
 * above the versions the folder keeps.
 */
export const folderPanel = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col',
    heading: 'flex shrink-0 items-center px-4 pt-3 pb-1.5 text-[11px] font-semibold text-muted',
    refresh: '-my-1 ms-auto size-6 rounded-md',
    note: 'px-4 pb-3 text-xs leading-relaxed text-muted',
    tree: 'flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2',
    row: 'flex h-7 w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-md pr-2 text-left text-xs text-surface outline-none transition-colors hover:bg-hover focus-visible:ring-1 focus-visible:ring-panel-focus',
    chevron: 'size-3 shrink-0 text-muted transition-transform duration-150 data-open:rotate-90',
    icon: 'size-3.5 shrink-0 text-muted',
    name: 'min-w-0 flex-1 truncate data-[change=added]:text-success data-[change=conflict]:text-error data-[change=deleted]:text-error data-[change=modified]:text-primary',
    mark: 'w-3 shrink-0 text-center font-mono text-[11px] font-semibold data-[change=added]:text-success data-[change=conflict]:text-error data-[change=deleted]:text-error data-[change=modified]:text-primary',
    dot: 'size-1.5 shrink-0 rounded-full bg-primary',
    selected: 'bg-row-selected text-row-selected-text hover:bg-row-selected'
  }
})

/** Each level of the tree steps in by this much. */
export const FOLDER_INDENT = ['pl-2', 'pl-5', 'pl-8', 'pl-11', 'pl-14', 'pl-[68px]'] as const

/** A file of the folder open over the canvas: its path above its code or its picture. */
export const folderFileView = tv({
  slots: {
    root: 'absolute inset-3 bottom-[76px] z-20 flex flex-col overflow-hidden rounded-[14px] border border-border bg-panel shadow-(--toolbar-shadow)',
    header: 'flex h-10 shrink-0 items-center gap-2 border-b border-hairline pr-1.5 pl-4',
    path: 'min-w-0 flex-1 truncate font-mono text-xs text-surface',
    action: 'size-7 rounded-md',
    body: 'flex min-h-0 flex-1 flex-col',
    picture: 'grid min-h-0 flex-1 place-items-center overflow-auto p-6',
    image: 'max-h-full max-w-full object-contain',
    note: 'm-auto px-6 text-center text-xs text-muted'
  }
})
