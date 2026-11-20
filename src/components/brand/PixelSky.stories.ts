import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PixelSky from './PixelSky.vue'

/**
 * The kalka.design sky: day in the light theme, the night of the site's footer in the dark one.
 * Switch the toolbar theme to watch the night fall over it like a veil.
 */
const meta = {
  title: 'App/Brand/Pixel Sky',
  component: PixelSky
} satisfies Meta<typeof PixelSky>

export default meta
type Story = StoryObj<typeof meta>

/** The band at the top of Home, its clouds along the bottom edge. */
export const Band: Story = {
  render: () => ({
    components: { PixelSky },
    template: `
      <div class="relative isolate h-[320px] w-full max-w-[960px] overflow-hidden rounded-[28px]">
        <PixelSky place="band" class="-z-10" />
        <p class="m-0 p-10 font-display text-4xl font-semibold text-white">Hello, Baurice</p>
      </div>`
  })
}

/**
 * Behind a whole screen, as on the welcome. The transformed frame keeps the fixed sky inside the
 * story instead of the whole page.
 */
export const Screen: Story = {
  render: () => ({
    components: { PixelSky },
    template: `
      <div class="relative isolate h-[480px] w-full max-w-[960px] overflow-hidden rounded-[16px] [transform:translateZ(0)]">
        <PixelSky />
      </div>`
  })
}
