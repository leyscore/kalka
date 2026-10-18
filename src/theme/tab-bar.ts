const tabBarTheme = {
  slots: {
    // The tabs are pills straight on the backdrop, clear of the floating panels below.
    // On the desktop the bar is the window's title bar: it comes first, above any banner, moves
    // the window and keeps clear of the window controls (`title-bar` in `src/app.css`).
    root: 'flex h-[40px] shrink-0 items-center px-2 data-title-bar:order-first data-title-bar:title-bar',
    // Sized by its tabs until the bar runs out of room; then it scrolls and fades the clipped side.
    scroller:
      'scrollbar-none h-full min-w-0 scroll-px-8 overflow-x-auto data-overflow-end:mask-r-from-[calc(100%-2rem)] data-overflow-start:mask-l-from-[calc(100%-2rem)]',
    list: 'flex h-full items-center gap-0.5',
    item: 'no-drag group/tab flex h-[30px] max-w-56 min-w-24 shrink-0 items-center rounded-lg pr-2 transition-colors duration-150',
    trigger:
      'flex h-full min-w-0 cursor-pointer touch-manipulation items-center gap-2 pl-3 text-[13px] transition-colors outline-none select-none focus-visible:ring-1 focus-visible:ring-panel-focus focus-visible:rounded-md',
    icon: 'size-3.5 shrink-0',
    label: 'min-w-0 flex-1 truncate',
    close:
      'ms-1 flex size-6 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-md text-muted transition-[opacity,background-color,color] group-hover/tab:opacity-100 hover:bg-(--pill-hover-bg) hover:text-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-panel-focus sm:size-5',
    closeIcon: 'size-3',
    dirtyDot: 'size-1.5 shrink-0 rounded-full bg-brand-blue',
    newTab:
      'no-drag flex size-[30px] shrink-0 cursor-pointer touch-manipulation items-center justify-center self-center rounded-lg text-muted transition-colors outline-none hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus active:scale-95 motion-reduce:active:scale-100',
    newIcon: 'size-4',
    scroll:
      'no-drag flex size-6 shrink-0 cursor-pointer touch-manipulation items-center justify-center self-center rounded text-muted transition-colors outline-none hover:bg-(--pill-hover-bg) hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus mx-0.5 data-start:order-first',
    scrollIcon: 'size-3.5'
  },
  variants: {
    active: {
      true: {
        item: 'bg-tab-active text-surface',
        trigger: 'text-surface',
        close: 'opacity-100'
      },
      false: {
        item: 'text-muted hover:bg-tab-active/50 hover:text-surface',
        trigger: 'text-muted hover:text-surface',
        close: 'opacity-0'
      }
    }
  },
  defaultVariants: {
    active: false
  }
}

export type TabBarTheme = typeof tabBarTheme
export default tabBarTheme
