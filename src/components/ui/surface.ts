import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

const surface = tv({
  base: 'border border-border/80 bg-panel',
  variants: {
    elevation: {
      md: 'shadow-[0_4px_12px_-2px_rgb(0_0_0/0.18),0_1px_3px_rgb(0_0_0/0.1)]',
      lg: 'shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35),0_2px_6px_rgb(0_0_0/0.12)]',
      xl: 'shadow-[0_24px_56px_-12px_rgb(0_0_0/0.45),0_4px_10px_rgb(0_0_0/0.14)]',
      overlay: 'shadow-[0_16px_48px_-8px_rgb(0_0_0/0.45),0_2px_8px_rgb(0_0_0/0.15)]'
    },
    radius: {
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl'
    },
    padding: {
      none: '',
      sm: 'p-1',
      md: 'p-2',
      lg: 'p-3'
    }
  },
  defaultVariants: {
    elevation: 'lg',
    radius: 'lg',
    padding: 'sm'
  }
})

export function useSurfaceUI(options?: {
  elevation?: 'md' | 'lg' | 'xl' | 'overlay'
  radius?: 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  ui?: { base?: string }
}) {
  return {
    base: twMerge(surface(options), options?.ui?.base)
  }
}
