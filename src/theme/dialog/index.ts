import { motionStyles } from '@/theme/motion/styles'

export default {
  slots: {
    overlay: ['fixed inset-0 z-40 bg-scrim', motionStyles.overlay],
    content: [
      'fixed top-1/2 left-1/2 z-50 flex max-h-[min(90vh,48rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] bg-float text-surface shadow-[0_0_0_1px_var(--color-float-border),var(--float-shadow)] backdrop-blur-[28px] backdrop-saturate-150 outline-none data-[state=open]:zoom-in-98 data-[state=closed]:zoom-out-98',
      motionStyles.overlay
    ],
    header: 'flex shrink-0 items-start justify-between gap-3 border-b border-hairline px-5 pt-4 pb-3.5',
    heading: 'min-w-0',
    title:
      'font-display text-[15px] font-semibold tracking-[-0.01em] text-surface data-[visually-hidden=true]:sr-only',
    description: 'mt-0.5 text-xs text-muted',
    close:
      'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[7px] border-none bg-transparent text-muted transition-colors hover:bg-panel-field hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus focus-visible:outline-none',
    body: 'min-h-0 flex-1 overflow-y-auto p-5',
    footer: 'flex shrink-0 items-center justify-end gap-2 border-t border-hairline px-5 py-3'
  },
  variants: {
    size: {
      sm: { content: 'w-[min(24rem,92vw)]' },
      md: { content: 'w-[min(32rem,94vw)]' },
      lg: { content: 'w-[min(46rem,94vw)]' },
      xl: { content: 'w-[min(64rem,96vw)]' },
      /** Nearly the whole window, for editors such as the variables dialog when expanded. */
      screen: { content: 'w-[98vw]' }
    },
    height: {
      auto: {},
      tall: { content: 'h-[min(75vh,48rem)]' },
      full: { content: 'h-[min(90vh,56rem)]' },
      screen: { content: 'h-[96vh] max-h-[96vh]' }
    }
  }
} as const
