import { tv } from 'tailwind-variants'

/**
 * The top of Home, on the shell's kalka.design pixel sky: the greeting, the request
 * to the agent, the sizes to start from and the ways to bring a file in. The sky is day in the
 * light theme and night in the dark one, so everything on it stays white.
 */
export const homeHero = {
  root: 'relative flex shrink-0 scroll-mt-14 flex-col items-center gap-6 px-4 pt-10 pb-16 text-center text-white sm:pt-16 sm:pb-20',
  title:
    'font-display text-[clamp(36px,5.4vw,64px)] leading-none font-semibold tracking-[-0.045em] text-balance',
  prompt: 'w-full max-w-[640px]',
  /**
   * The files on a frosted panel like the sidebar's: centered under the greeting on Home, or, on a
   * list page, filling the space beside the sidebar as Settings does.
   */
  files: tv({
    base: 'mx-auto flex w-full max-w-[1104px] flex-col rounded-[18px] bg-shell [--color-muted:var(--color-shell-muted)] px-4 pt-8 pb-12 text-surface shadow-[0_0_0_1px_var(--color-shell-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150 sm:px-8 sm:pt-10',
    variants: { list: { true: 'mx-0 mt-3 max-w-none flex-1 md:mt-0' } }
  })
} as const

/** The request to the agent: a frosted field on the sky with a white send button. */
export const homePrompt = tv({
  slots: {
    root: 'flex items-center gap-1.5 rounded-[16px] border border-white/30 bg-white/12 py-1.5 pr-1.5 pl-4 text-left backdrop-blur-[14px] transition-[border-color,background-color] duration-200 focus-within:border-white/55 focus-within:bg-white/16',
    icon: 'size-5 shrink-0 text-[#DCE6FF]',
    input:
      'h-11 min-w-0 flex-1 border-0 bg-transparent text-base text-white outline-none placeholder:text-[#B9C9F8]',
    submit:
      'h-11 shrink-0 cursor-pointer rounded-[11px] bg-white px-5 text-[15px] font-semibold text-[#0E1222] transition-[background-color,scale] duration-150 outline-none hover:bg-[#DCE6FF] focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:active:scale-100'
  }
})

/** The sizes under the request: frosted chips, each with its frame drawn to its proportions. */
export const sizeChip = tv({
  slots: {
    root: 'flex h-[52px] cursor-pointer items-center gap-2.5 rounded-[13px] border border-white/25 bg-white/10 ps-2.5 pe-3.5 text-[#DCE6FF] transition-[background-color,border-color,color] duration-200 outline-none hover:border-white/45 hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70',
    device: 'flex size-[26px] shrink-0 items-center justify-center',
    outline: 'rounded-[2px] border-[1.5px] border-current',
    body: 'flex flex-col items-start gap-px text-left',
    name: 'text-[13px] font-semibold text-white',
    detail: 'font-mono text-[11px] text-[#B9C9F8] tabular-nums'
  },
  variants: {
    custom: {
      true: {
        device: 'rounded-[4px] border-[1.5px] border-dashed border-current',
        detail: 'font-sans'
      }
    }
  }
})

/** The ways to bring something in, as quiet text buttons on the sky. */
export const homeAction =
  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-[11px] px-3.5 text-sm font-medium text-[#DCE6FF] transition-colors outline-none hover:bg-white/12 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70'

/** The title over the files: Recent on Home, or the place a list shows. */
export const filesHeading =
  'm-0 truncate font-display text-2xl font-semibold tracking-[-0.03em] text-surface'

/** The storage provider and bucket next to the tabs, with a dot for a configured workspace. */
export const storageChip =
  'inline-flex h-[26px] min-w-0 items-center gap-1.5 self-center rounded-full bg-card px-2.5 text-xs text-muted'

/** The file search: a quiet field, as soft as the files around it. */
export const homeSearch = {
  input:
    'h-[36px] rounded-[11px] border-transparent bg-card pl-[34px] text-[13px] placeholder:text-muted hover:border-transparent hover:bg-card-hover focus:bg-card-hover',
  leading: 'left-3'
}

/**
 * The sample file among the recent files: the brand's blue with its quarter shapes, listing the
 * first steps to take on it.
 */
export const sampleTile = {
  root: 'flex min-w-0 flex-col gap-[7px]',
  label:
    'flex cursor-pointer items-baseline gap-2 rounded-sm px-px text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
  name: 'min-w-0 flex-1 truncate text-[13px] font-medium text-surface',
  metadata: 'shrink-0 font-mono text-[11px] text-muted',
  panel:
    'relative flex aspect-[16/10] flex-col justify-end gap-px overflow-hidden rounded-[4px] bg-brand-blue p-2.5',
  shapes: 'absolute top-4 right-4 grid size-[54px] grid-cols-2 grid-rows-2 gap-[3px]',
  step: 'flex h-7 cursor-pointer items-center gap-2 rounded-[8px] px-2 text-left text-[13px] font-medium text-white transition-colors outline-none hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/70'
} as const
