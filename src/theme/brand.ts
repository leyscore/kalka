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
 * A word drawn as a selected layer on the pixel sky, as on kalka.design: a selection frame with handles and a size
 * badge, an agent's cursor drafting it and yours resizing it. Still with reduced motion.
 */
export const selectedWord = tv({
  slots: {
    root: 'relative mx-[0.14em] inline-block text-current',
    box: 'pointer-events-none absolute top-[0.05em] -right-[0.075em] bottom-[-0.05em] -left-[0.075em] border-2 border-white motion-safe:animate-frame-grow',
    handle: 'absolute size-2.5 border-2 border-white bg-accent',
    size: 'absolute bottom-[-34px] left-1/2 -translate-x-1/2 rounded-[5px] bg-white px-[9px] py-1.5 font-mono text-xs leading-none font-medium tracking-normal whitespace-nowrap text-[#1236B8]',
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
        arrow: 'text-[#0E1222] [&_path]:stroke-white',
        tag: 'bg-white text-[#0E1222]'
      }
    }
  }
})

/** The loader at the size of a line of text: the K filling with blue while something is at work. */
export const brandSpinner = tv({
  slots: {
    root: 'relative size-3.5 shrink-0',
    shell: 'absolute inset-0 bg-surface/20 mask-brand-k',
    vessel: 'absolute inset-0 overflow-hidden mask-brand-k',
    liquid:
      'absolute inset-x-0 bottom-0 h-full animate-liquid-fill bg-accent motion-reduce:animate-none'
  }
})

/**
 * The pixel sky of kalka.design behind a full screen such as the welcome: a deep blue that lightens
 * toward the bottom, a fine grain, and clouds drawn in dots that sway slowly. It is the brand's
 * own picture, the same in light and dark themes. Inside the clouds a few dots at a time double their brightness, at their own size, and
 * fade, so the sky feels alive; reduced motion holds the clouds still and the dots unlit.
 */
export const pixelSky = tv({
  slots: {
    root: 'pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#071B6B_0%,#1236B8_30%,#2F5BEA_58%,#7FA2F5_82%,#CFDCFC_100%)]',
    grain:
      'absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.1)_0_1px,transparent_1.4px)] bg-size-[6px_6px]',
    clouds:
      'absolute inset-y-0 -inset-x-40 bg-[radial-gradient(circle,rgb(255_255_255/0.5)_0_2.6px,transparent_3.1px)] bg-size-[9px_9px] [mask-image:radial-gradient(ellipse_20%_12%_at_14%_84%,#000_15%,transparent_70%),radial-gradient(ellipse_26%_12%_at_54%_96%,#000_15%,transparent_70%),radial-gradient(ellipse_18%_10%_at_88%_80%,#000_15%,transparent_70%),radial-gradient(ellipse_9%_5%_at_82%_22%,#000_15%,transparent_70%),radial-gradient(ellipse_8%_4%_at_16%_20%,#000_15%,transparent_70%)] motion-safe:animate-sky-drift',
    spark:
      'absolute bg-[radial-gradient(circle,rgb(255_255_255/0.5)_0_2.6px,transparent_3.1px)] bg-size-[9px_9px] opacity-0 motion-safe:animate-sky-twinkle'
  }
})
