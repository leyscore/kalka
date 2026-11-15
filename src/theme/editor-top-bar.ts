import { tv } from 'tailwind-variants'

/**
 * The bar across the top of the editor: the document and its menus on the left, the screens in
 * the middle, and the agent, zoom, preview and sharing on the right.
 */
export const editorTopBar = tv({
  slots: {
    root: 'grid h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 panel-float px-2',
    start: 'flex min-w-0 items-center',
    end: 'flex min-w-0 items-center justify-end gap-1',
    action: 'size-[30px] rounded-lg text-label'
  }
})
