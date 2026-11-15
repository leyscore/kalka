import { tv } from 'tailwind-variants'

/**
 * The welcome: one screen on the brand backdrop with the mark, a greeting, the name and the agent,
 * centered like Home. Connecting an agent over MCP is a wider second screen.
 */
export const welcomeScreen = tv({
  slots: {
    root: 'fixed inset-0 z-[45] isolate flex overflow-y-auto text-surface outline-none animate-in fade-in duration-300',
    column:
      'mx-auto flex min-h-dvh w-full flex-col justify-center px-6 py-10 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:px-12',
    mark: 'size-14 overflow-hidden rounded-[14px] shadow-[0_12px_40px_-12px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]',
    title:
      'font-display text-[clamp(30px,3.6vw,42px)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-surface',
    intro: 'max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted',
    field: 'flex w-full max-w-[440px] flex-col gap-2 text-left',
    label: 'text-[13px] font-semibold text-surface',
    input:
      'h-12 w-full rounded-[14px] border border-glass-border bg-glass px-4 text-[15px] text-surface backdrop-blur-[24px] transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-muted focus:border-accent/50 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]',
    hint: 'text-xs text-muted',
    actions: 'flex w-full max-w-[440px] flex-col gap-2.5',
    buttons: 'flex w-full flex-wrap gap-2.5',
    primary: 'h-12 flex-1 gap-2 rounded-[14px] px-5 text-sm font-semibold whitespace-nowrap',
    secondary: 'h-12 rounded-[14px] px-5 text-sm font-semibold whitespace-nowrap',
    skip: 'absolute top-5 right-6 z-10',
    footer: 'flex items-center gap-3'
  },
  variants: {
    step: {
      start: { column: 'max-w-[520px] items-center gap-6 text-center' },
      claude: { column: 'max-w-[1180px] gap-5' }
    }
  }
})
