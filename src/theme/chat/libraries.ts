import { tv } from 'tailwind-variants'

/**
 * The offer to connect a design-reference library, floating at the bottom right of the window:
 * a strip of the chat's sky where the agent's creature reaches the libraries, then one row per
 * library with its button.
 */
export const referenceLibrariesTheme = tv({
  slots: {
    root: 'fixed right-4 bottom-4 z-30 flex w-[372px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[16px] bg-float text-surface shadow-[0_0_0_1px_var(--color-float-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150 duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
    sky: 'relative h-24 shrink-0 overflow-hidden chat-sky',
    close:
      'absolute top-2 right-2 grid size-[26px] cursor-pointer place-items-center rounded-[7px] text-label outline-none transition-colors hover:bg-surface/10 hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus',
    reach: 'absolute bottom-1.5 left-4 flex items-center gap-2',
    tile: 'grid size-[46px] shrink-0 place-items-center rounded-[13px] border border-(--chat-tile-edge) glass shadow-(--chat-tile-shadow)',
    creature: 'size-7',
    thread: 'w-7 border-t border-dotted border-label/70',
    badges: 'flex gap-1.5',
    badge:
      'grid size-[30px] place-items-center overflow-hidden rounded-[9px] border border-(--chat-tile-edge) shadow-(--chat-tile-shadow) data-[library=inspo]:bg-[#F4F1EC] data-[library=mobbin]:bg-black data-[library=mobbin]:p-1 data-[library=refero]:bg-white data-[library=refero]:p-1',
    rowLogo:
      'grid size-8 shrink-0 place-items-center overflow-hidden rounded-[9px] shadow-[0_0_0_1px_var(--color-float-border)] data-[library=inspo]:bg-[#F4F1EC] data-[library=mobbin]:bg-black data-[library=mobbin]:p-1 data-[library=refero]:bg-white data-[library=refero]:p-1',
    logo: 'size-full object-contain',
    body: 'flex flex-col gap-3 px-4 pt-3 pb-4',
    title:
      'font-display text-[19px] leading-tight font-semibold tracking-[-0.01em] text-balance text-surface',
    text: 'text-xs leading-relaxed text-label',
    list: 'flex flex-col gap-1.5',
    row: 'flex items-center gap-3 rounded-[12px] bg-group px-3 py-2.5',
    rowBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
    rowName: 'text-xs font-semibold text-surface',
    rowHint: 'text-[11px] leading-snug text-muted',
    rowError: 'text-[11px] leading-snug text-error',
    connected: 'flex shrink-0 items-center gap-1 text-[11px] font-medium text-success',
    footer: 'flex items-center justify-between gap-3',
    footerText: 'min-w-0 text-[11px] leading-snug text-muted'
  }
})
