import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import SegmentedControl from './SegmentedControl.vue'

const alignments = [
  { value: 'left', label: 'Align left' },
  { value: 'center', label: 'Align center' },
  { value: 'right', label: 'Align right' }
]

const meta = {
  title: 'Design System/Selection/Segmented Control',
  render: () => ({
    components: { SegmentedControl },
    setup() {
      const value = ref('left')
      return { value, alignments }
    },
    template: `
      <div class="flex w-64 flex-col gap-3">
        <SegmentedControl v-model="value" :options="alignments" label="Text alignment" />
        <p class="m-0 text-xs text-muted">Chosen: {{ value }}</p>
      </div>`
  })
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * With `preview`, hovering an option shows it before it is chosen: the control keeps showing the
 * chosen value while the pointer is over the others, and leaving gives the preview back.
 */
export const HoverPreview: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup() {
      const value = ref('left')
      const previewing = ref<string | null>(null)
      return {
        value,
        previewing,
        alignments,
        preview: (next: string | null) => (previewing.value = next)
      }
    },
    template: `
      <div class="flex w-64 flex-col gap-3">
        <SegmentedControl v-model="value" :options="alignments" label="Text alignment" :preview="preview" />
        <p class="m-0 text-xs text-muted">Chosen: {{ value }}, previewing: {{ previewing ?? 'nothing' }}</p>
      </div>`
  })
}
