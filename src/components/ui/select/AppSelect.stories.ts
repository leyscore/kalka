import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'

import AppButton from '@/components/ui/button/AppButton.vue'

import AppSelect from './AppSelect.vue'

const meta = {
  title: 'Design System/Selection/Select',
  render: () => ({
    components: { AppSelect, AppButton },
    setup() {
      const russian = ref(false)
      const value = ref('dark')
      const options = computed(() => [
        { value: 'dark', label: russian.value ? 'Тёмная' : 'Dark' },
        { value: 'light', label: russian.value ? 'Светлая' : 'Light' }
      ])
      return { russian, value, options }
    },
    template: `
      <div class="flex w-64 flex-col gap-4">
        <AppSelect v-model="value" :options="options" label="Theme" />
        <AppButton variant="outline" @click="russian = !russian">Switch language</AppButton>
      </div>`
  })
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ReactiveLabels: Story = {}

/**
 * With `preview`, hovering or focusing an option in the open list shows it before it is chosen;
 * the check stays on the chosen value, and closing the list or choosing gives the preview back.
 */
export const HoverPreview: Story = {
  render: () => ({
    components: { AppSelect },
    setup() {
      const value = ref('normal')
      const previewing = ref<string | null>(null)
      const options = [
        { value: 'normal', label: 'Normal' },
        { value: 'multiply', label: 'Multiply' },
        { value: 'screen', label: 'Screen' }
      ]
      return {
        value,
        previewing,
        options,
        preview: (next: string | null) => (previewing.value = next)
      }
    },
    template: `
      <div class="flex w-64 flex-col gap-3">
        <AppSelect v-model="value" :options="options" label="Blend mode" :preview="preview" />
        <p class="m-0 text-xs text-muted">Chosen: {{ value }}, previewing: {{ previewing ?? 'nothing' }}</p>
      </div>`
  })
}
