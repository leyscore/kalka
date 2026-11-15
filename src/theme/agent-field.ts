import { tv } from 'tailwind-variants'

/**
 * The agent's field at the end of the toolbar: a shortcut to its conversation in the left panel.
 * In a narrow canvas it keeps its icon alone, so the toolbar still fits between the side panels.
 */
export const agentField = tv({
  slots: {
    field:
      'flex size-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-track text-left text-xs text-muted outline-none transition-colors duration-150 hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-active:text-surface @[620px]/canvas:w-52 @[620px]/canvas:justify-start @[620px]/canvas:px-2.5',
    icon: 'size-4 shrink-0',
    label: 'hidden min-w-0 flex-1 truncate @[620px]/canvas:block'
  }
})
