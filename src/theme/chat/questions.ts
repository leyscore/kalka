import { tv } from 'tailwind-variants'

/**
 * The card the agent's questions arrive in, floating over the foot of the chat: who asks and how far
 * along, the question in display type, answers as wrapping pills, and reference pictures to pick.
 */
export const chatQuestionsTheme = tv({
  slots: {
    root: 'mx-2.5 mb-2 flex flex-col gap-3 rounded-[14px] border border-float-border bg-float p-3 shadow-(--float-shadow) motion-safe:animate-float-in',
    header: 'flex items-baseline justify-between gap-2 text-[11px] text-muted',
    heading: 'min-w-0 truncate font-medium',
    count: 'shrink-0 tabular-nums',
    progress: 'flex gap-1',
    segment:
      'h-[3px] flex-1 rounded-full bg-surface/10 transition-colors data-[state=current]:bg-accent data-[state=done]:bg-accent/50',
    question:
      'font-display text-[17px] leading-[1.25] font-semibold tracking-[-0.01em] text-balance text-surface',
    hint: '-mt-1.5 text-[11.5px] leading-snug text-muted',
    chips: 'flex flex-wrap gap-1.5',
    chip: 'inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full border border-hairline bg-hover px-2.5 py-[5px] text-left text-[11.5px] leading-tight text-surface transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-panel-focus data-[state=on]:border-accent data-[state=on]:bg-accent/30',
    chipCheck: 'size-3 shrink-0',
    tiles: 'grid grid-cols-2 gap-2',
    tile: 'relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[10px] border-[1.5px] border-hairline bg-panel-field text-left transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-panel-focus data-[state=on]:border-accent',
    tileImage: 'aspect-[4/3] w-full bg-canvas object-cover',
    tileBadge:
      'absolute top-1.5 right-1.5 grid size-[18px] place-items-center rounded-full bg-accent text-white',
    tileBadgeIcon: 'size-3',
    tileName: 'block truncate px-2 pt-1.5 text-[11px] leading-tight font-medium text-surface',
    tileSource: 'block truncate px-2 pb-1.5 text-[10px] leading-tight text-muted',
    own: 'flex min-w-0 flex-wrap items-center gap-1.5',
    ownImage: 'size-8 shrink-0 rounded-md border border-hairline object-cover',
    ownName: 'min-w-0 flex-1 truncate text-[11px] text-surface',
    error: 'text-[11px] text-error',
    footer: 'flex flex-wrap items-center justify-between gap-x-2 gap-y-1',
    picked: 'text-[11px] text-muted tabular-nums',
    actions: 'ml-auto flex gap-1.5'
  }
})
