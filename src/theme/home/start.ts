import { tv } from 'tailwind-variants'

/** Lift on hover and a press that gives, shared by the cards on Home. */
const cardMotion =
  'transition-[background-color,translate,box-shadow,scale] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'

const cardFocus = 'outline-none focus-visible:ring-2 focus-visible:ring-accent/50'

/** The headings above each part of Home. */
export const homeHeading = 'text-sm font-semibold text-label'

/** Home's sidebar: a floating panel with the brand above the page's sections. */
export const homeNav = {
  root: 'panel-float hidden w-[200px] shrink-0 flex-col px-2.5 pt-[18px] pb-3 md:flex',
  brand: 'flex items-center gap-2.5 px-2 pb-6',
  name: 'font-display text-[19px] font-semibold tracking-[-0.02em] text-surface',
  item: 'flex min-h-[38px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-2.5 text-sm text-subtle transition-colors duration-150 outline-none hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50 aria-[current=true]:font-semibold aria-[current=true]:text-surface',
  icon: 'size-4 shrink-0'
} as const

/** The actions beside the greeting: quiet text buttons, then the one primary action. */
export const homeAction = {
  quiet: 'h-[38px] rounded-[9px] px-3 text-[13px] text-label hover:bg-(--pill-hover-bg)',
  primary: 'ms-1.5 h-[38px] gap-[7px] rounded-[9px] px-[15px] text-[13px] font-semibold shadow-none'
} as const

/** The file search: a quiet field on the backdrop, as soft as the cards around it. */
export const homeSearch = {
  input:
    'h-[34px] rounded-[9px] border-transparent bg-card pl-[34px] text-[13px] placeholder:text-muted hover:border-transparent hover:bg-card-hover focus:bg-card-hover',
  leading: 'left-3'
}

/** A size to start a design with: the device drawn in outline above its name and dimensions. */
export const presetCard = tv({
  slots: {
    root: [
      'group flex flex-col items-center gap-3.5 rounded-[14px] px-3 pt-[22px] pb-3.5 text-surface',
      cardMotion,
      cardFocus
    ],
    device: 'flex h-[46px] items-center justify-center',
    outline:
      'rounded-[4px] border-[1.5px] border-label transition-colors duration-200 group-hover:border-accent',
    body: 'flex flex-col items-center gap-0.5',
    name: 'text-[13px] font-semibold',
    detail: 'text-[11px] text-muted'
  },
  variants: {
    kind: {
      size: {
        root: 'bg-card hover:bg-card-hover',
        detail: 'font-mono tabular-nums'
      },
      custom: {
        root: 'border border-dashed border-dash hover:border-accent/60 hover:bg-card',
        outline: 'hidden',
        device: 'text-label transition-colors duration-200 group-hover:text-accent'
      }
    },
    /** Each device's outline, drawn to its proportions rather than to scale. */
    device: {
      desktop: { outline: 'h-[46px] w-[74px]' },
      laptop: { outline: 'mt-1 h-[42px] w-[66px]' },
      tablet: { outline: 'h-[46px] w-[34px] rounded-[5px]' },
      mobile: { outline: 'h-[46px] w-[22px] rounded-[6px]' },
      social: { outline: 'h-[46px] w-[37px]' }
    }
  },
  defaultVariants: { kind: 'size' }
})

/** An inline action inside a sentence, such as the import choices under the sizes. */
export const inlineLink =
  'cursor-pointer rounded-sm font-medium text-link transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none'

/** A row card with a square mark beside a title and a hint, as in Learn the basics. */
export const learnCard = tv({
  slots: {
    root: [
      'group flex min-w-0 items-center gap-[13px] rounded-[14px] bg-card p-3 text-left text-surface hover:bg-card-hover',
      cardMotion,
      cardFocus
    ],
    mark: 'grid size-10 shrink-0 place-items-center overflow-hidden rounded-[10px]',
    body: 'flex min-w-0 flex-col gap-0.5',
    title: 'truncate text-sm font-semibold',
    hint: 'truncate text-xs text-muted'
  },
  variants: {
    mark: {
      tour: { mark: 'grid-cols-2 place-items-stretch bg-brand-blue' },
      code: {
        mark: 'bg-brand-ink font-mono text-[13px] text-brand-sky ring-1 ring-white/10 ring-inset'
      },
      agent: { mark: 'bg-brand-sky text-brand-ink' }
    }
  }
})

/** The prompt that asks the AI agent for a page: one frosted field with its send button. */
export const homePrompt = tv({
  slots: {
    root: 'flex items-center gap-3 rounded-[14px] border border-glass-border bg-glass py-[7px] pr-[7px] pl-4 backdrop-blur-[24px] transition-[border-color,box-shadow] duration-200 focus-within:border-accent/50 focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]',
    icon: 'size-[17px] shrink-0 text-highlight',
    input:
      'min-w-0 flex-1 border-0 bg-transparent text-[15px] text-surface outline-none placeholder:text-muted',
    submit:
      'h-[38px] shrink-0 cursor-pointer rounded-[9px] bg-surface px-[15px] text-[13px] font-semibold text-inverted transition-[opacity,scale] duration-150 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:active:scale-100'
  }
})
