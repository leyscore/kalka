import { tv } from 'tailwind-variants'

/**
 * The team's pages: a title and a sentence over a centered column, people as rows with their
 * picture, role and actions, and waiting invitations under them.
 */
export const teamPage = tv({
  slots: {
    root: 'mx-auto flex w-full max-w-[760px] flex-col gap-8',
    header: 'flex flex-wrap items-end justify-between gap-3',
    heading: 'm-0 font-display text-2xl font-semibold tracking-[-0.03em] text-surface',
    description: 'm-0 mt-1 text-[13px] leading-relaxed text-muted',
    row: 'flex min-h-14 items-center gap-3 px-4 py-2.5 max-sm:flex-wrap',
    picture:
      'size-9 shrink-0 rounded-full object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] [image-rendering:pixelated]',
    person: 'flex min-w-0 flex-1 flex-col',
    name: 'flex items-center gap-2 truncate text-[13px] font-medium text-surface',
    detail: 'truncate text-xs text-muted',
    badge: 'rounded-full bg-panel-field px-2 py-0.5 text-[11px] font-medium text-muted',
    notice: 'm-0 text-xs text-muted'
  }
})
