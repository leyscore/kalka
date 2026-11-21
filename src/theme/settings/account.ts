import { tv } from 'tailwind-variants'

/**
 * The Account section's cards: the person, with their avatar, their name and a preview of how their
 * cursor looks to teammates; and the place their work is shared, a Kalka server or Cloud.
 */
export const accountCard = tv({
  slots: {
    root: 'overflow-hidden rounded-[16px] border border-hairline bg-group',
    header: 'flex items-start gap-3.5 px-5 py-4',
    icon: 'flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-accent/12 text-accent',
    heading: 'min-w-0 flex-1',
    title: 'm-0 text-[14px] font-semibold text-surface',
    description: 'm-0 mt-0.5 text-xs leading-relaxed text-muted',
    status:
      'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-medium text-success',
    body: 'border-t border-hairline px-5 py-4'
  }
})

export const accountProfile = tv({
  slots: {
    root: 'grid overflow-hidden rounded-[16px] border border-hairline bg-group md:grid-cols-[minmax(0,1fr)_280px]',
    person: 'flex items-start gap-4 p-5',
    avatar:
      'flex size-16 shrink-0 items-center justify-center rounded-full text-[22px] font-semibold tracking-[-0.02em] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]',
    fields: 'flex min-w-0 flex-1 flex-col gap-1.5',
    label: 'text-xs font-medium text-surface',
    hint: 'm-0 text-[11px] leading-relaxed text-muted',
    preview:
      'relative min-h-[148px] border-t border-hairline bg-canvas [background-image:radial-gradient(rgb(127_127_127/0.22)_1px,transparent_1px)] [background-size:14px_14px] md:border-t-0 md:border-l',
    previewLabel:
      'absolute top-3 left-4 font-mono text-[10px] font-medium tracking-[0.08em] text-muted uppercase',
    cursor: 'absolute top-[58px] left-[72px] flex items-start',
    pointer: 'relative size-[18px] shrink-0 drop-shadow-sm',
    /** The arrow drawn twice: white behind as its outline, the person's color inset over it. */
    pointerEdge: 'absolute inset-0 bg-white [clip-path:polygon(0_0,100%_44%,58%_56%,40%_100%)]',
    pointerFill: 'absolute inset-[2.5px] [clip-path:polygon(0_0,100%_44%,58%_56%,40%_100%)]',
    tag: 'mt-4 -ml-1 max-w-[180px] truncate rounded-[6px] rounded-tl-[2px] px-2 py-1 text-xs font-medium shadow-[0_2px_6px_rgb(0_0_0/0.18)]'
  }
})
