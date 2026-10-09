const pageListTheme = {
  slots: {
    panel: 'flex min-h-0 flex-1 flex-col',
    header: 'flex shrink-0 items-center justify-between py-1 pr-2.5 pl-4',
    title: 'text-[11px] font-semibold text-muted',
    add: 'cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-panel-focus',
    body: 'min-h-0 flex-1 overflow-hidden',
    viewport:
      'scrollbar-thin flex h-full flex-col gap-px overflow-x-hidden overflow-y-auto px-2 pb-3',
    row: 'relative cursor-grab active:cursor-grabbing',
    dropIndicator: 'pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-accent',
    renameRow: 'flex h-7 w-full items-center gap-2 rounded-[7px] px-2',
    renameInput:
      'min-w-0 flex-1 rounded border border-accent bg-input px-1 py-0 text-xs text-surface outline-none',
    divider: 'my-1 flex cursor-pointer items-center px-2',
    dividerLine: 'h-px flex-1 bg-hairline',
    item: 'flex h-7 w-full cursor-pointer items-center gap-2 rounded-[7px] border-none px-2 text-left text-xs outline-none focus-visible:ring-1 focus-visible:ring-panel-focus',
    label: 'min-w-0 flex-1 truncate',
    /** Right-aligned page badges, such as who works on the page. */
    trailing: 'flex shrink-0 items-center gap-1.5'
  },
  variants: {
    active: {
      // Pills glide behind the current page and the hovered one (PagesPanel).
      true: { item: 'bg-transparent font-semibold text-surface' },
      false: {
        item: 'bg-transparent text-subtle transition-colors duration-150 hover:text-surface'
      }
    },
    dragging: {
      true: { row: 'opacity-60' },
      false: {}
    },
    dropPosition: {
      before: { dropIndicator: 'top-0' },
      after: { dropIndicator: 'bottom-0' }
    }
  },
  defaultVariants: {
    active: false,
    dragging: false
  }
}

export type PageListTheme = typeof pageListTheme
export default pageListTheme
