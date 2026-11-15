import { tv } from 'tailwind-variants'

/**
 * The folder panel: the document's files as a tree, each row marked with what Git says changed.
 * The history panel beside it shares its heading and notes.
 */
export const folderPanel = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col',
    heading: 'flex shrink-0 items-center px-4 pt-3 pb-1.5 text-[11px] font-semibold text-muted',
    refresh: '-my-1 ms-auto size-6 rounded-md',
    note: 'px-4 pb-3 text-xs leading-relaxed text-muted',
    tree: 'flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2',
    row: 'flex h-7 w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-md pr-2 text-left text-xs text-surface outline-none transition-colors hover:bg-hover focus-visible:ring-1 focus-visible:ring-panel-focus',
    chevron: 'size-3 shrink-0 text-muted transition-transform duration-150 data-open:rotate-90',
    icon: 'size-3.5 shrink-0',
    name: 'min-w-0 flex-1 truncate data-[change=added]:text-success data-[change=conflict]:text-error data-[change=deleted]:text-error data-[change=modified]:text-primary',
    mark: 'w-3 shrink-0 text-center font-mono text-[11px] font-semibold data-[change=added]:text-success data-[change=conflict]:text-error data-[change=deleted]:text-error data-[change=modified]:text-primary',
    dot: 'size-1.5 shrink-0 rounded-full bg-primary',
    selected: 'bg-row-selected text-row-selected-text hover:bg-row-selected'
  },
  variants: {
    /**
     * One color per part of the document, on the icon alone: the name keeps the color of what
     * Git says changed. Pages are the app's blue, the design system violet, pictures green,
     * what agents read their orange.
     */
    type: {
      pages: { icon: 'text-primary' },
      page: { icon: 'text-primary' },
      design: { icon: 'text-[#a78bfa]' },
      style: { icon: 'text-[#a78bfa]' },
      data: { icon: 'text-[#a78bfa]' },
      assets: { icon: 'text-success' },
      image: { icon: 'text-success' },
      instructions: { icon: 'text-[#d97757]' },
      skill: { icon: 'text-[#d97757]' },
      instruction: { icon: 'text-[#d97757]' },
      folder: { icon: 'text-muted' },
      text: { icon: 'text-muted' },
      file: { icon: 'text-muted' }
    }
  },
  defaultVariants: { type: 'file' }
})

/** Each level of the tree steps in by this much. */
export const FOLDER_INDENT = ['pl-2', 'pl-5', 'pl-8', 'pl-11', 'pl-14', 'pl-[68px]'] as const

/** A file of the folder open in place of the canvas: its code or its picture. */
export const folderFileView = tv({
  slots: {
    root: 'absolute inset-0 z-20 flex flex-col overflow-hidden bg-panel',
    editor:
      'min-h-0 flex-1 resize-none bg-transparent p-5 font-mono text-[13px] leading-relaxed text-surface outline-none',
    picture: 'grid min-h-0 flex-1 place-items-center overflow-auto p-6',
    image: 'max-h-full max-w-full object-contain',
    note: 'm-auto px-6 text-center text-xs text-muted'
  }
})

/** That file in the middle of the top bar, where the canvas's screens are while a design shows. */
export const folderFileBar = tv({
  slots: {
    root: 'flex max-w-[min(560px,44vw)] min-w-0 items-center gap-2',
    icon: 'size-3.5 shrink-0',
    path: 'min-w-0 truncate font-mono text-xs text-surface',
    close: 'size-7 shrink-0 rounded-md'
  }
})

/** The versions as a timeline: a point for each on one line, the latest filled. */
export const versionTimeline = tv({
  slots: {
    list: 'flex flex-col px-4 pb-4',
    item: 'relative pb-3 pl-5 before:absolute before:top-2 before:bottom-[-6px] before:left-[4.5px] before:w-px before:bg-hairline last:pb-0 last:before:hidden',
    point:
      'absolute top-1 left-0 size-2.5 rounded-full border-[1.5px] border-accent bg-panel data-latest:bg-accent',
    subject: 'truncate text-xs text-surface',
    detail: 'truncate text-[11px] text-muted'
  }
})
