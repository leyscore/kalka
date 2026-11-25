import { tv } from 'tailwind-variants'

/**
 * The app's shell: the kalka.design sky behind everything, a frosted sidebar on the left with the
 * workspace, its places and the account, and the page itself beside it. The same frame holds Home,
 * the file lists and Settings, on the desktop app, the web editor and Kalka Cloud.
 */
export const shellFrame = tv({
  slots: {
    root: 'relative isolate flex min-h-0 flex-1 text-surface',
    frame: 'flex min-h-0 min-w-0 flex-1 gap-3 p-0 md:p-3',
    aside: 'hidden w-[236px] shrink-0 md:flex',
    main: 'relative flex min-h-0 min-w-0 flex-1 flex-col',
    phoneBar:
      'flex shrink-0 items-center gap-2 px-[max(0.75rem,env(safe-area-inset-left))] pt-3 text-white md:hidden',
    phoneMenu:
      'flex size-10 cursor-pointer items-center justify-center rounded-[11px] border border-white/30 bg-white/12 text-white transition-colors outline-none hover:bg-white/22 focus-visible:ring-2 focus-visible:ring-white/70',
    titleBar: 'hidden'
  },
  variants: {
    /** The desktop app's window controls sit in this strip; the page starts below it. */
    titleBar: { true: { root: 'flex-col', titleBar: 'title-bar block h-11 shrink-0' } },
    /** Under the tab bar the frame keeps the editor's margins, so the sidebar sits as its panels do. */
    underBar: { true: { frame: 'md:px-2 md:pt-0 md:pb-2' } }
  }
})

/**
 * The sidebar itself: a glass card on the sky, light or dark with the theme. Its places take no
 * background of their own: a hover pill and the accent pill of the current place glide between
 * them (`glidePills.shellHover` and `glidePills.shellActive`).
 */
export const shellSidebar = tv({
  slots: {
    root: 'flex min-h-0 w-full flex-col gap-3.5 overflow-y-auto rounded-[18px] bg-shell [--color-muted:var(--color-shell-muted)] px-2.5 py-3.5 text-surface shadow-[0_0_0_1px_var(--color-shell-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150',
    workspace: 'flex items-center gap-2.5 rounded-[12px] p-1.5',
    workspaceMark:
      'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-accent text-[13px] font-semibold text-white',
    workspaceText: 'flex min-w-0 flex-1 flex-col',
    workspaceName: 'truncate text-sm font-semibold',
    workspaceDetail: 'truncate text-[11px] text-muted',
    nav: 'flex flex-col gap-0.5',
    group:
      'px-2.5 pt-3 pb-1 font-mono text-[10px] font-medium tracking-[0.08em] text-muted uppercase',
    item: 'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-[13px] text-muted transition-colors outline-none hover:text-surface focus-visible:ring-2 focus-visible:ring-accent',
    itemIcon: 'size-4 shrink-0',
    itemLabel: 'min-w-0 flex-1 truncate',
    itemCount: 'font-mono text-xs opacity-70 tabular-nums',
    footer: 'mt-auto flex flex-col gap-0.5',
    account:
      'flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] border-0 bg-transparent p-2 text-left text-surface transition-colors outline-none hover:bg-panel-field focus-visible:ring-2 focus-visible:ring-accent',
    avatar:
      'flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C2410C] text-[11px] font-semibold text-white',
    accountText: 'flex min-w-0 flex-1 flex-col',
    accountName: 'truncate text-[13px] font-medium',
    accountDetail: 'truncate text-[11px] text-muted'
  },
  variants: {
    /** A picture instead of initials: pixel art stays crisp at any size. */
    image: { true: { avatar: 'bg-transparent object-cover [image-rendering:pixelated]' } },
    selected: {
      true: {
        item: 'text-white hover:text-white'
      }
    }
  }
})
