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
    group: 'rounded-lg data-[state=open]:bg-group/60',
    groupTrigger:
      'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[11px] text-muted hover:bg-hover hover:text-surface',
    groupIcon: 'size-3.5 shrink-0 text-primary',
    groupNow: 'shrink-0 font-medium text-surface',
    groupNames: 'min-w-0 flex-1 truncate',
    groupFailed: 'bg-error/15 text-error',
    groupItems: 'space-y-1.5 px-1.5 pb-1.5'
  }
})
