import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { i18n, localeSetting, type TranslatedLocale } from '@kalka/vue'

import type { ClosePrompt } from '@/app/document/close/prompt'

import UnsavedChangesDialog from './UnsavedChangesDialog.vue'

type Args = { prompt: ClosePrompt | null; onAnswer: (choice: string) => void }
type Story = StoryObj<Args>

const meta = {
  title: 'App/Document/Unsaved Changes Dialog',
  component: UnsavedChangesDialog,
  parameters: { layout: 'fullscreen' },
  args: {
    prompt: { kind: 'document', documentName: 'Untitled' },
    onAnswer: fn()
  },
  render: (args) => ({
    components: { UnsavedChangesDialog },
    setup: () => ({ args }),
    template: '<UnsavedChangesDialog :prompt="args.prompt" @answer="args.onAnswer" />'
  })
} satisfies Meta<Args>

export default meta

const quitting: ClosePrompt = {
  kind: 'documents',
  documentNames: ['Untitled', 'Landing page — hero exploration', 'Mobile onboarding v3']
}

export const OneDocument: Story = {
  play: async ({ args }) => {
    const dialog = within(document.body).getByRole('alertdialog')
    const save = within(dialog).getByRole('button', { name: /^Save$/ })
    await expect(save).toHaveFocus()
    // Return answers Save, as the focused primary action.
    await userEvent.keyboard('{Enter}')
    await expect(args.onAnswer).toHaveBeenCalledWith('save')
  }
}

export const LongDocumentName: Story = {
  args: {
    prompt: {
      kind: 'document',
      documentName: 'Brand refresh — campaign key visuals, social cut-downs and print variants'
    }
  }
}

export const EscapeCancels: Story = {
  play: async ({ args }) => {
    await expect(within(document.body).getByRole('alertdialog')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expect(args.onAnswer).toHaveBeenCalledWith('cancel')
  }
}

export const SeveralDocuments: Story = {
  args: { prompt: quitting },
  play: async ({ args }) => {
    const dialog = within(within(document.body).getByRole('alertdialog'))
    await expect(dialog.getAllByRole('listitem')).toHaveLength(3)
    await expect(dialog.getByRole('button', { name: 'Save All' })).toHaveFocus()
    await userEvent.click(dialog.getByRole('button', { name: 'Review…' }))
    await expect(args.onAnswer).toHaveBeenCalledWith('review')
  }
}

/** Shows the Quit prompt, whose four answers are the longest copy, in another language. */
function inLocale(code: TranslatedLocale): Story {
  return {
    args: { prompt: quitting },
    beforeEach: async () => {
      const previous = localeSetting.get()
      localeSetting.set(code)
      while (i18n.loading.get()) {
        await new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
      }
      return () => localeSetting.set(previous)
    }
  }
}

export const German = inLocale('de')
export const Spanish = inLocale('es')
export const French = inLocale('fr')
export const Italian = inLocale('it')
export const Japanese = inLocale('ja')
export const Polish = inLocale('pl')
export const Russian = inLocale('ru')
export const SimplifiedChinese = inLocale('zh-CN')
