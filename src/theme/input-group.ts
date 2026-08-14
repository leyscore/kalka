import { controlHeight } from '@/theme/control'

export default {
  slots: {
    root: 'min-w-0 rounded-xl border border-border bg-input transition-colors hover:border-muted/60 focus-within:border-panel-focus focus-within:ring-1 focus-within:ring-accent/30',
    attachment: 'px-2 pt-2',
    control:
      'block min-h-12 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-xs leading-relaxed text-surface outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60',
    toolbar: 'flex min-w-0 items-center gap-1 px-1.5 pb-1.5',
    model: 'min-w-0 flex-1',
    actions: 'ml-auto flex shrink-0 items-center gap-1'
  },
  variants: {
    size: {
      xs: { toolbar: controlHeight.xs },
      sm: { toolbar: controlHeight.sm },
      md: { toolbar: controlHeight.md }
    },
    disabled: {
      true: { root: 'opacity-60' }
    }
  },
  defaultVariants: {
    size: 'sm' as const,
    disabled: false
  }
}
