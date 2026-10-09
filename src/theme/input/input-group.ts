import { controlHeight } from '@/theme/control'

export default {
  slots: {
    root: 'min-w-0 rounded-[12px] border border-hairline bg-panel-field transition-[border-color,box-shadow] duration-200 focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]',
    attachment: 'm-2 mb-0',
    control: 'min-w-0',
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
