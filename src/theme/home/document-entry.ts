import { tv } from 'tailwind-variants'

export const documentEntry = tv({
  slots: {
    root: 'group min-w-0',
    trigger:
      'min-w-0 w-full cursor-pointer rounded-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50',
    preview:
      'flex h-[124px] items-center justify-center overflow-hidden rounded-[14px] bg-card transition-[translate] duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0',
    image: 'size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
    fallback: 'size-8 text-muted/40',
    icon: 'size-4 shrink-0 text-primary',
    body: 'min-w-0 flex-1',
    name: 'block truncate text-[13px] font-semibold text-surface',
    metadata: 'mt-0.5 block truncate text-xs text-muted',
    trailingMetadata: 'hidden shrink-0 text-xs text-muted sm:inline',
    actions: 'flex shrink-0 items-center gap-1'
  },
  variants: {
    view: {
      grid: { body: 'mt-2.5 block px-0.5', trailingMetadata: 'hidden sm:hidden' },
      list: {
        root: 'flex items-center border-b border-hairline last:border-b-0 hover:bg-card',
        trigger:
          'flex min-h-14 items-center gap-3 rounded-none px-3 py-2 sm:min-h-0 sm:px-4 sm:py-3',
        metadata: 'sm:hidden'
      }
    }
  },
  defaultVariants: { view: 'grid' }
})
