import { tv } from 'tailwind-variants'

import { motionStyles } from '@/theme/motion/styles'
import { floatingSurface } from '@/theme/overlay'

export const menu = tv({
  slots: {
    content: ['z-50 p-1.5', floatingSurface, motionStyles.floating],
    item: 'flex min-h-7 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1 text-xs outline-none select-none data-[disabled]:cursor-default data-[disabled]:text-muted/50',
    separator: 'mx-1.5 my-1 h-px bg-hairline',
    label: 'px-2.5 pt-1.5 pb-1 text-[11px] text-muted select-none',
    shortcut: 'text-[11px] text-muted',
    icon: 'size-3 text-muted',
    subTrigger:
      'flex min-h-7 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1 text-xs outline-none select-none'
  },
  variants: {
    tone: {
      default: {
        item: 'text-surface',
        subTrigger: 'text-surface'
      },
      component: {
        item: 'text-component data-[disabled]:text-component/40 data-[highlighted]:bg-component/12',
        shortcut: 'text-component/60',
        subTrigger: 'text-component'
      }
    },
    justify: {
      between: {
        item: 'justify-between gap-6'
      },
      start: {
        item: 'justify-start'
      }
    }
  },
  defaultVariants: {
    tone: 'default',
    justify: 'between'
  }
})

interface MenuUI {
  content?: string
  item?: string
  separator?: string
  label?: string
  shortcut?: string
  icon?: string
  subTrigger?: string
}

export function useMenuUI(ui?: MenuUI) {
  const cls = menu()
  return {
    content: cls.content({ class: ui?.content }),
    item: cls.item({ class: ui?.item }),
    separator: cls.separator({ class: ui?.separator }),
    label: cls.label({ class: ui?.label }),
    shortcut: cls.shortcut({ class: ui?.shortcut }),
    icon: cls.icon({ class: ui?.icon }),
    subTrigger: cls.subTrigger({ class: ui?.subTrigger })
  }
}

export function menuContent(options?: { class?: string }) {
  return menu().content({ class: options?.class })
}

export function menuItem(options?: {
  tone?: 'default' | 'component'
  justify?: 'between' | 'start'
  class?: string
}) {
  return menu(options).item({ class: options?.class })
}

export function menuSeparator(options?: { class?: string }) {
  return menu().separator({ class: options?.class })
}
