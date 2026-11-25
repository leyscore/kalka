const tabBarTheme = {
  slots: {
    // The tabs are pills straight on the backdrop, clear of the floating panels below.
    // On the desktop the bar on its own, as on the Dashboard, is the window's title bar: it comes
    // first, above any banner, moves the window and keeps clear of the window controls
    // (`title-bar` in `src/app.css`). Inside the editor's top bar, that bar is the title bar.
    // It stays above the sky a shell page paints across the whole window, and reads on that sky
    // in either theme: the sky is dark at the top by day too.
    root: 'relative z-10 in-data-[place=shell]:[--color-muted:rgb(255_255_255/0.72)] in-data-[place=shell]:[--color-surface:#fff] in-data-[place=shell]:[--color-tab-active:rgb(255_255_255/0.14)] flex h-[40px] shrink-0 items-center px-2 data-title-bar:order-first data-title-bar:h-11 data-title-bar:title-bar',
    // Sized by its tabs until the bar runs out of room; then it scrolls and fades the clipped side.
    scroller:
      'scrollbar-none h-full min-w-0 scroll-px-8 overflow-x-auto data-overflow-end:mask-r-from-[calc(100%-2rem)] data-overflow-start:mask-l-from-[calc(100%-2rem)]',
    // The Dashboard stays first and keeps the brand's blue, on it or away from it: it is the way back.
    dashboard:
      'no-drag me-1.5 flex h-[30px] shrink-0 cursor-pointer touch-manipulation items-center gap-2 rounded-lg bg-linear-to-b from-[#4d7af7] to-[#2448c4] ps-2.5 pe-3 text-[13px] font-medium text-white opacity-80 inset-ring inset-ring-white/15 transition-opacity outline-none select-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-panel-focus data-active:opacity-100',
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
    // The editor's top bar carries the tabs: one bar, and the canvas keeps the room.
    embedded: {
      true: { root: 'z-auto h-[30px] min-w-0 shrink px-0' }
    },
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
