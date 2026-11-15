import { tv } from 'tailwind-variants'

/**
 * Connecting an AI in the agent's panel, before there is a conversation: an agent already on this
 * computer or a provider's API, then the one to use.
 */
export const connectAgent = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3',
    heading: 'px-1 pt-1 text-xs leading-relaxed text-muted',
    back: 'flex cursor-pointer items-center gap-1 self-start rounded-md px-1 py-0.5 text-[11px] font-semibold text-muted outline-none transition-colors hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus',
    list: 'flex flex-col gap-2',
    card: 'group flex w-full cursor-pointer items-center gap-3 rounded-[12px] bg-group p-3 text-left outline-none transition-colors hover:bg-hover focus-visible:ring-1 focus-visible:ring-panel-focus disabled:cursor-default disabled:opacity-60 disabled:hover:bg-group',
    mark: 'grid size-9 shrink-0 place-items-center rounded-[9px] bg-accent/12 text-accent',
    logo: 'grid size-7 shrink-0 place-items-center text-surface',
    body: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'min-w-0 flex-1 text-xs font-semibold text-surface',
    hint: 'text-[11px] leading-snug text-muted',
    status: 'shrink-0 text-[11px] text-muted data-[state=installed]:text-success',
    chevron: 'size-3.5 shrink-0 text-muted',
    footer: 'mt-auto flex flex-col gap-2 pt-1',
    start: 'w-full',
    advanced: 'self-center'
  },
  variants: {
    placement: {
      panel: {},
      dialog: { root: 'max-h-[70vh] p-4' },
      settings: { root: 'flex-none overflow-visible p-0' }
    }
  }
})
