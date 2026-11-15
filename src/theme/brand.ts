import { tv } from 'tailwind-variants'

export const brandMark = tv({ base: 'block size-4 shrink-0 object-contain' })

/** The page loader: a glass tile whose K fills with blue as the page gets ready. */
export const brandLoader = tv({
  slots: {
    tile: 'relative size-24 shrink-0 rounded-[22px] border border-(--loader-tile-border) bg-linear-145 from-white/30 to-white/5 shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_24px_60px_-18px_rgb(18_18_20/0.45),0_2px_8px_rgb(18_18_20/0.12)] backdrop-blur-xl backdrop-saturate-150 animate-in fade-in zoom-in-90 duration-500',
    glyph: 'absolute inset-[22%]',
    // The empty K: a faint cut in the glass.
    shell: 'absolute inset-0 bg-surface/12 mask-brand-k',
    vessel: 'absolute inset-0 overflow-hidden mask-brand-k',
    liquid:
      'absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-[#2448c4] to-[#4b74f0] shadow-[inset_0_2px_0_rgb(255_255_255/0.45)] transition-transform duration-500 ease-out motion-reduce:transition-none data-[indeterminate]:animate-liquid-fill motion-reduce:data-[indeterminate]:animate-none'
  }
})

/**
 * A word drawn as a selected layer, as on kalka.design: a selection frame with handles and a size
 * badge, an agent's cursor drafting it and yours resizing it. Still with reduced motion.
 */
export const selectedWord = tv({
  slots: {
    root: 'relative mx-[0.14em] inline-block text-surface',
    box: 'pointer-events-none absolute top-[0.05em] -right-[0.075em] bottom-[-0.05em] -left-[0.075em] border-2 border-accent motion-safe:animate-frame-grow',
    handle: 'absolute size-2.5 border-2 border-accent bg-white',
    size: 'absolute bottom-[-34px] left-1/2 -translate-x-1/2 rounded-[5px] bg-accent px-[9px] py-1.5 font-mono text-xs leading-none font-medium tracking-normal whitespace-nowrap text-white',
    cursor:
      'pointer-events-none absolute hidden font-sans text-[13px] leading-none font-medium tracking-normal motion-safe:block',
    arrow: 'block size-[22px] [&_path]:fill-current',
    tag: 'absolute rounded-lg px-[9px] py-[5px] whitespace-nowrap text-white shadow-[0_4px_12px_rgb(18_18_20/0.18)]'
  },
  variants: {
    corner: {
      tl: { handle: '-top-1.5 -left-1.5' },
      tr: { handle: '-top-1.5 -right-1.5' },
      bl: { handle: '-bottom-1.5 -left-1.5' },
      br: { handle: '-right-1.5 -bottom-1.5' }
    },
    state: {
      rest: { size: 'motion-safe:animate-frame-size-rest' },
      grown: { size: 'opacity-0 motion-safe:animate-frame-size-grown' }
    },
    who: {
      agent: {
        cursor: '-top-3 -left-3.5 z-[2] animate-frame-agent',
        arrow: 'text-[#d97757]',
        tag: 'right-[18px] bottom-[18px] bg-[#d97757]'
      },
      you: {
        cursor: '-right-[30px] -bottom-[26px] z-[3] animate-frame-you',
        arrow: 'text-accent',
        tag: 'bg-accent'
      }
    }
  }
})
