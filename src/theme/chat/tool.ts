import { tv } from 'tailwind-variants'

export const chatToolTheme = tv({
  slots: {
    // An undone call's text dims to the muted color, which still reads at 4.5:1.
    // A quiet line of the agent's activity, not a card: the conversation stays about the design.
    root: 'rounded-lg data-[undone=true]:**:text-muted data-[state=open]:bg-group',
    trigger:
      'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-hover disabled:cursor-default disabled:hover:bg-transparent',
    status:
      'flex size-4 shrink-0 items-center justify-center rounded-full data-[state=done]:bg-success/20 data-[state=done]:text-success data-[state=error]:bg-error/15 data-[state=error]:text-error data-[state=pending]:bg-accent/20 data-[state=pending]:text-primary',
    statusIcon: 'size-3',
    name: 'shrink-0 text-[11px] font-medium text-label',
    summary: 'min-w-0 flex-1 truncate font-mono text-[10px] text-muted',
    undone: 'inline-flex shrink-0 items-center gap-1 text-[10px] text-muted',
    undoneIcon: 'size-3',
    chevron:
      'ml-auto size-3 shrink-0 text-muted transition-transform motion-reduce:transition-none [[data-state=open]>&]:rotate-180',
    body: 'space-y-2 px-2 pt-1 pb-2 text-[10px]',
    nodes: 'flex flex-wrap gap-1',
    node: 'inline-flex max-w-40 cursor-pointer items-center gap-1 rounded border border-border bg-input px-1.5 py-0.5 text-[10px] text-surface hover:border-accent hover:text-primary disabled:cursor-default disabled:opacity-50 disabled:hover:border-border disabled:hover:text-surface',
    nodeIcon: 'size-3 shrink-0 text-muted',
    nodeLabel: 'truncate',
    image:
      'max-h-56 w-auto max-w-full rounded border border-border bg-[repeating-conic-gradient(var(--color-hover)_0_25%,transparent_0_50%)] bg-size-[12px_12px] object-contain',
    compare:
      'relative w-full max-w-full overflow-hidden rounded border border-border bg-input select-none data-[mode=highlight]:[&>img:first-child]:opacity-40',
    compareImage: 'absolute inset-0 size-full object-contain',
    // `cqw` is the split's width, so each side draws the whole image and its panel crops it.
    compareSplit: '@container absolute inset-0',
    comparePanel: 'relative h-full overflow-hidden',
    compareBefore: 'absolute inset-y-0 left-0 h-full w-[100cqw] max-w-none object-contain',
    compareAfter: 'absolute inset-y-0 right-0 h-full w-[100cqw] max-w-none object-contain',
    compareDivider: 'bg-accent shadow-[0_0_0_1px_rgb(0_0_0/0.25)]',
    compareLabel:
      'pointer-events-none absolute top-1 rounded bg-black/55 px-1 py-px text-[9px] font-medium text-white',
    // A run of calls reads as a constellation: one star a step, joined by a dotted line.
    steps: 'flex flex-col',
    step: 'group/step relative flex min-w-0 gap-2 pb-2 last:pb-0 data-[undone=true]:**:text-muted',
    stepRail: 'relative flex w-4 shrink-0 justify-center pt-1.5',
    stepLine:
      'absolute top-5 -bottom-1 left-1/2 -translate-x-1/2 border-l border-dotted border-link/50 group-last/step:hidden group-data-[step=pending]/step:border-link/20',
    stepStar:
      'relative size-3 bg-link mask-sky-star data-[state=error]:bg-error data-[state=pending]:size-4 data-[state=pending]:-mt-0.5 data-[state=pending]:bg-surface motion-safe:data-[state=pending]:animate-star-glow',
    stepGlow:
      'absolute top-0 left-1/2 size-7 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)] opacity-60',
    stepBody: 'min-w-0 flex-1',
    stepTrigger:
      'flex w-full min-w-0 cursor-pointer items-baseline gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-hover',
    stepName: 'shrink-0 text-xs font-medium text-surface',
    stepSummary: 'min-w-0 truncate text-[11px] text-muted',
    stepFailed: 'shrink-0 text-[11px] text-error',
    // The page to come, a bar a section: filled once built, dashed until then.
    stepSections: 'flex items-end gap-1 px-1.5 pt-1 pb-1.5',
    stepSection:
      'block w-[26px] rounded-[3px] border border-dashed border-link/60 transition-colors duration-300 data-[state=done]:border-solid data-[state=done]:border-link data-[state=done]:bg-link/70',
    group: 'rounded-lg data-[state=open]:bg-group/60',
    groupTrigger:
      'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[11px] text-muted hover:bg-hover hover:text-surface',
    groupIcon: 'size-3.5 shrink-0 text-primary',
    groupNow: 'shrink-0 font-medium text-surface',
    groupNames: 'min-w-0 flex-1 truncate',
    groupFailed: 'bg-error/15 text-error',
    groupItems: 'space-y-1.5 px-1.5 pt-1 pb-1.5'
  }
})
