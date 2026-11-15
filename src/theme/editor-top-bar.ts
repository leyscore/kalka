import { tv } from 'tailwind-variants'

/**
 * The bar across the top of the editor: the document and its menus on the left, the screens in
 * the middle, and the agent, zoom, preview and sharing on the right. Each part names its column:
 * a document without a frame has no screens, and the right part must not slide into the middle.
 */
export const editorTopBar = tv({
  slots: {
    root: 'grid h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 panel-float px-2',
    start: 'col-start-1 flex min-w-0 items-center',
    middle: 'col-start-2 flex items-center',
    end: 'col-start-3 flex min-w-0 items-center justify-end gap-1',
    action: 'size-[30px] rounded-lg text-label',
    agentStatus: 'absolute top-1 right-1 size-1.5 rounded-full bg-faint data-connected:bg-success'
  }
})
