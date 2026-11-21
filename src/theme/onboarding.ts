import { tv } from 'tailwind-variants'

/**
 * The welcome: one screen on the kalka.design pixel sky with the mark, a greeting, and the name and
 * agent in a framed card, as the site frames the app. Connecting an agent over MCP is a wider
 * second screen. The sky is day in the light theme and night in the dark one, so text on it stays white; the card follows the theme.
 */
export const welcomeScreen = tv({
  slots: {
    root: 'fixed inset-0 z-[45] isolate flex overflow-y-auto text-white outline-none animate-in fade-in duration-300',
    column:
      'mx-auto flex min-h-dvh w-full flex-col justify-start px-6 pt-16 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:px-12 sm:pt-[12vh] [&_h2]:outline-none',
    mark: 'size-14 overflow-hidden rounded-[14px] shadow-[0_12px_40px_-12px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]',
    title:
      'font-display text-[clamp(36px,4.4vw,60px)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-white',
    intro: 'max-w-[60ch] text-[16px] leading-relaxed text-balance text-[#DCE6FF]',
    // White glass on the day sky, night glass under the stars, changing at the pace of the sky.
    frame:
      'w-full rounded-[26px] border border-white/85 bg-white/40 p-2.5 transition-[background-color,border-color] duration-[1.8s] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none [[data-theme=dark]_&]:border-[#9DB7F5]/22 [[data-theme=dark]_&]:bg-[#0C1336]/60',
    card: 'flex w-full flex-col gap-5 rounded-[18px] bg-panel p-6 text-left text-surface',
    field: 'flex w-full max-w-[440px] flex-col gap-2 text-left',
    labelRow: 'flex items-center gap-1.5',
    label: 'text-[13px] font-semibold text-surface',
    info: 'grid size-5 cursor-help place-items-center rounded-full text-muted outline-none transition-colors hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50',
    input:
      'h-12 w-full rounded-[14px] border border-glass-border bg-glass px-4 text-[15px] text-surface backdrop-blur-[24px] transition-[border-color] duration-200 outline-none placeholder:text-muted focus:border-accent',
    hint: 'text-xs text-muted',
    actions: 'flex w-full max-w-[440px] flex-col gap-2.5',
    buttons: 'flex w-full flex-wrap gap-2.5',
    primary: 'h-12 flex-1 gap-2 rounded-[14px] px-5 text-sm font-semibold whitespace-nowrap',
    secondary: 'h-12 gap-2 rounded-[14px] px-5 text-sm font-semibold whitespace-nowrap',
    skip: 'absolute top-4 right-4 z-10 text-white hover:text-white/80 sm:top-5 sm:right-6',
    footer: 'flex items-center gap-3',
    // The questions after the name: a step count, choices as chips or cards, and the way on.
    progress: 'flex items-center gap-1.5',
    progressDot:
      'h-1 w-6 rounded-full bg-white/35 transition-colors duration-300 data-[done=true]:bg-white motion-reduce:transition-none',
    group: 'flex w-full flex-col gap-2 text-left',
    chips: 'flex flex-wrap gap-1.5',
    chip: 'h-8 cursor-pointer rounded-full border border-border bg-panel-field px-3 text-[13px] text-surface transition-colors outline-none hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 data-[selected=true]:border-accent data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent',
    choices: 'grid w-full grid-cols-1 gap-2 sm:grid-cols-2',
    choice:
      'flex cursor-pointer flex-col gap-0.5 rounded-[14px] border border-border bg-panel-field px-4 py-3 text-left transition-colors outline-none hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/50 data-[selected=true]:border-accent data-[selected=true]:bg-accent/10',
    choiceTitle: 'text-[13px] font-semibold text-surface',
    choiceHint: 'text-xs text-muted',
    fields: 'grid w-full grid-cols-1 gap-3 sm:grid-cols-2',
    nav: 'flex w-full flex-wrap items-center gap-2 pt-1'
  },
  variants: {
    step: {
      start: {
        column:
          'max-w-[540px] items-center gap-5 text-center [&_h2]:mt-2 [&_h2]:mb-4 sm:[&_h2]:whitespace-nowrap',
        intro: '-mt-1 mb-4'
      },
      claude: { column: 'max-w-[1180px] gap-5', footer: '[&_a]:text-white [&_button]:text-white' }
    }
  }
})
