import { tv } from 'tailwind-variants'

/**
 * A file on Home. In the grid it reads like a frame on the canvas: its name and date above, the
 * preview below, and on hover the accent selection with its corner handles. The `lead` file, the
 * last one opened, takes a double cell and offers to continue it.
 */
export const documentEntry = tv({
  slots: {
    root: 'group min-w-0',
    trigger:
      'w-full min-w-0 cursor-pointer text-left focus-visible:outline-none disabled:opacity-50',
    preview:
      'relative block aspect-[16/10] rounded-[4px] bg-white ring-1 ring-black/8 ring-inset transition-[outline-color] outline-2 outline-transparent group-hover:outline-accent group-focus-visible:outline-accent',
    image: 'absolute inset-0 size-full rounded-[4px] object-cover object-top',
    fallback: 'absolute inset-0 m-auto size-8 text-muted/40',
    handle:
      'absolute size-2 border-[1.5px] border-accent bg-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
    icon: 'size-4 shrink-0 text-primary',
    body: 'min-w-0 flex-1',
    name: 'block truncate text-[13px] font-medium text-surface transition-colors group-hover:text-accent',
    metadata: 'block shrink-0 truncate font-mono text-[11px] text-muted',
    trailingMetadata: 'hidden shrink-0 text-xs text-muted sm:inline',
    continueBar:
      'absolute inset-x-3.5 bottom-3.5 flex items-center gap-3 rounded-[14px] bg-white/90 py-2.5 ps-3.5 pe-2.5 text-[#121214] backdrop-blur-[10px]',
    continueText: 'min-w-0 flex-1 truncate text-[13px] font-medium',
    continueButton:
      'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[13px] font-semibold text-white',
    actions: 'flex shrink-0 items-center gap-1'
  },
  variants: {
    view: {
      grid: {
        root: 'relative',
        /** Over the preview's top corner, shown on hover or focus, as a frame's own controls. */
        actions:
          'absolute top-8 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100',
        trigger: 'flex h-full flex-col gap-[7px]',
        body: 'flex flex-none items-baseline gap-2 px-px',
        name: 'min-w-0 flex-1',
        trailingMetadata: 'hidden sm:hidden'
      },
      list: {
        root: 'flex items-center border-b border-hairline last:border-b-0 hover:bg-card',
        trigger:
          'flex min-h-14 items-center gap-3 rounded-none px-3 py-2 focus-visible:ring-2 focus-visible:ring-accent/50 sm:min-h-0 sm:px-4 sm:py-3',
        name: 'text-[13px] font-semibold group-hover:text-surface',
        metadata: 'mt-0.5 font-sans text-xs sm:hidden'
      }
    },
    lead: {
      true: {
        preview: 'aspect-auto min-h-[240px] flex-1 lg:min-h-0',
        name: 'text-[15px] font-semibold'
      }
    }
  },
  defaultVariants: { view: 'grid', lead: false }
})
