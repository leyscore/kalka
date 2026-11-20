import { tv } from 'tailwind-variants'

/**
 * The top of Home: the kalka.design pixel sky as a band, with the mark, the greeting, the request
 * to the agent, the sizes to start from and the ways to bring a file in. The sky is day in the
 * light theme and night in the dark one, so everything on it stays white.
 */
export const homeHero = {
  root: 'relative isolate mx-0 flex shrink-0 scroll-mt-14 flex-col items-center gap-6 overflow-hidden px-4 pt-16 pb-24 text-center text-white sm:mx-2 sm:rounded-b-[28px] sm:pt-[72px] sm:pb-28',
  mark: 'size-[52px] overflow-hidden rounded-[13px]',
  title:
    'font-display text-[clamp(40px,5.4vw,64px)] leading-none font-semibold tracking-[-0.045em] text-balance',
  prompt: 'w-full max-w-[640px]',
  corner: 'absolute top-3 right-3 z-10 flex gap-2 sm:top-[18px] sm:right-[18px]',
  cornerButton:
    'size-[38px] rounded-[11px] border border-white/30 bg-white/12 text-white hover:bg-white/22 hover:text-white'
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

/** Recent and Storage: two words set like headings, the one shown in full ink. */
export const filesTab = tv({
  base: 'cursor-pointer font-display text-2xl font-semibold tracking-[-0.03em] transition-colors outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent/50',
  variants: {
    selected: { true: 'text-surface', false: 'text-muted/70 hover:text-muted' }
  }
})

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
