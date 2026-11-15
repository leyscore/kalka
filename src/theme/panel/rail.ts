import { tv } from 'tailwind-variants'

/**
 * The icon rail at the editor's left edge: what the document holds (layers, assets) above a divider,
 * what ships it (code, its folder and versions, the design check) below. Icons alone; each names itself in a tip.
 */
export const panelRail = tv({
  slots: {
    root: 'flex w-11 shrink-0 flex-col items-center gap-1 py-2',
    item: 'relative flex size-8 items-center justify-center rounded-lg text-muted outline-none transition-colors duration-150 hover:bg-hover hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-active:bg-row-selected data-active:text-row-selected-text',
    icon: 'size-4',
    divider: 'my-1 h-px w-5 bg-hairline',
    badge:
      'absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-issue-warning px-0.5 text-[9px] leading-none font-semibold text-white data-[severity=error]:bg-issue-error'
  }
})
