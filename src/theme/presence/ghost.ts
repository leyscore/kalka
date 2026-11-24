import { tv } from 'tailwind-variants'

/**
 * Sections an agent announced and has not built yet, as dashed outlines on the canvas. They live
 * in a layer scaled with the view, so `--ghost-scale` (one over the zoom) keeps strokes and
 * labels at screen size, and a section glides only when the plan or the page changes, never when
 * the person pans or zooms.
 */
export const agentGhostTheme = tv({
  slots: {
    layer: 'absolute top-0 left-0 size-0 origin-top-left',
    section:
      'absolute rounded-[calc(10px*var(--ghost-scale))] border-[length:calc(1.5px*var(--ghost-scale))] border-dashed border-accent/70 bg-accent/8 transition-[left,top,width,height,opacity] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] data-[state=next]:border-solid data-[state=next]:border-accent data-[state=next]:bg-accent/6',
    label:
      'absolute top-[calc(10px*var(--ghost-scale))] left-[calc(12px*var(--ghost-scale))] origin-top-left scale-(--ghost-scale) rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white',
    badge:
      'absolute flex origin-bottom-right scale-(--ghost-scale) gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white',
    badgeName: 'font-semibold',
    skeleton: 'absolute inset-[7%] flex gap-[5%] overflow-hidden',
    skeletonText: 'flex min-w-0 flex-1 flex-col justify-center gap-[6%]',
    bar: 'h-[4.5%] first:h-[8%] rounded-[calc(4px*var(--ghost-scale))] motion-safe:animate-shimmer motion-reduce:bg-accent/20',
    block:
      'h-full w-[38%] rounded-[calc(8px*var(--ghost-scale))] motion-safe:animate-shimmer motion-reduce:bg-accent/20',
    cursor:
      'absolute flex origin-top-left scale-(--ghost-scale) items-start transition-[left,top] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]',
    cursorBob: 'flex items-start motion-safe:animate-creature-bob',
    cursorArrow: 'size-4 shrink-0 drop-shadow-sm',
    cursorPill:
      'mt-2.5 -ml-0.5 flex items-center gap-1.5 rounded-full py-[3px] pr-2.5 pl-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-md',
    cursorTile: 'grid size-4 place-items-center rounded-full bg-[#1a1c26]',
    cursorCreature: 'size-[11px]',
    enter: 'opacity-0',
    leave: 'opacity-0'
  }
})
