import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import type { CatalogueFont } from '@kalka/core/text'

import FontCatalogueDialog from './FontCatalogueDialog.vue'

const CATALOGUE: CatalogueFont[] = [
  {
    id: 'fraunces',
    family: 'Fraunces',
    category: 'serif',
    license: 'OFL-1.1',
    weights: [100, 900],
    styles: ['normal', 'italic'],
    variable: true
  },
  {
    id: 'inter-tight',
    family: 'Inter Tight',
    category: 'sans-serif',
    license: 'OFL-1.1',
    weights: [100, 900],
    styles: ['normal', 'italic'],
    variable: true
  },
  {
    id: 'space-mono',
    family: 'Space Mono',
    category: 'monospace',
    license: 'OFL-1.1',
    weights: [400, 700],
    styles: ['normal', 'italic'],
    variable: false
  },
  {
    id: 'tinos',
    family: 'Tinos',
    category: 'serif',
    license: 'Apache-2.0',
    weights: [400, 700],
    styles: ['normal', 'italic'],
    variable: false
  }
]

function searchIn(query: string) {
  const wanted = query.toLowerCase()
  return Promise.resolve(CATALOGUE.filter((font) => font.family.toLowerCase().includes(wanted)))
}

function story(options: { canInstall?: boolean; unavailable?: boolean; added?: string[] } = {}) {
  return () => ({
    components: { FontCatalogueDialog },
    setup() {
      const open = ref(true)
      const added = ref(options.added ?? [])
      const search = options.unavailable
        ? () => Promise.reject(new Error('offline'))
        : (query: string) => searchIn(query)
      async function addFont(font: CatalogueFont) {
        added.value = [...added.value, font.family]
      }
      async function addFiles(files: File[]) {
        return {
          rejected: files
            .filter((file) => !/\.(?:woff2|ttf|otf)$/.test(file.name))
            .map((file) => file.name)
        }
      }
      return { open, added, search, addFont, addFiles, canInstall: options.canInstall ?? false }
    },
    template: `
      <FontCatalogueDialog
        v-model:open="open"
        :search="search"
        :add-font="addFont"
        :add-files="addFiles"
        :added-families="added"
        :can-install="canInstall"
        initial-preview="Spring collection, out now"
      />
    `
  })
}

const meta = {
  title: 'App/Fonts/Catalogue Dialog',
  component: FontCatalogueDialog
} satisfies Meta<Record<string, never>>

export default meta
type Story = StoryObj<typeof meta>

/** Free families listed with their licence, each previewed on the person's own text. */
export const Search: Story = { render: story({ added: ['Tinos'] }) }

/** The desktop app offers to install a font on the computer too. */
export const Desktop: Story = { render: story({ canInstall: true }) }

/** Without a connection the catalogue says so rather than listing nothing. */
export const Unavailable: Story = { render: story({ unavailable: true }) }

export const AddFamily: Story = {
  render: story(),
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'))
    await userEvent.click(await dialog.findByRole('button', { name: 'Add: Fraunces' }))
    await expect(await dialog.findByRole('button', { name: 'Added: Fraunces' })).toBeDisabled()
  }
}

export const NarrowSearch: Story = {
  render: story(),
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'))
    await userEvent.type(dialog.getByRole('searchbox', { name: 'Search free fonts' }), 'mono')
    await expect(await dialog.findByText('Space Mono')).toBeVisible()
    await expect(dialog.queryByText('Fraunces')).not.toBeInTheDocument()
  }
}
