import { tv } from 'tailwind-variants'

/**
 * Settings in the app's shell: the section on a frosted panel beside the sidebar, its name as the
 * panel's title, and on a phone that name beside the menu button.
 */
export const settingsShell = tv({
  slots: {
    panel:
      'mx-[max(0.75rem,env(safe-area-inset-left))] mt-3 mb-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-float text-surface shadow-[0_0_0_1px_var(--color-float-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150 md:m-0',
    heading:
      'm-0 shrink-0 px-5 pt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-surface max-md:sr-only sm:px-6 sm:pt-6',
    phoneTitle: 'min-w-0 flex-1 truncate font-display text-lg font-semibold text-white',
    phoneClose:
      'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[11px] border border-white/30 bg-white/12 text-white transition-colors outline-none hover:bg-white/22 focus-visible:ring-2 focus-visible:ring-white/70'
  }
})
