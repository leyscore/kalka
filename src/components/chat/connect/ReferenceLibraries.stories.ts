import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { ReferenceLibrary } from '@/app/integrations/mcp/libraries'

import ReferenceLibraries from './ReferenceLibraries.vue'

interface ReferenceLibrariesProps {
  agent: string
  color: string
  libraries: ReferenceLibrary[]
}

const LIBRARIES: ReferenceLibrary[] = [
  {
    key: 'inspo',
    name: 'Inspo',
    url: 'https://inspomcp.dev/api/mcp',
    authenticationType: 'none',
    paid: false,
    state: 'available',
    error: ''
  },
  {
    key: 'mobbin',
    name: 'Mobbin',
    url: 'https://api.mobbin.com/mcp',
    authenticationType: 'oauth',
    paid: true,
    state: 'available',
    error: ''
  },
  {
    key: 'refero',
    name: 'Refero',
    url: 'https://api.refero.design/mcp',
    authenticationType: 'oauth',
    paid: true,
    state: 'available',
    error: ''
  }
]

/** The offer to connect a design-reference library, at the bottom right of the window. */

const meta = {
  title: 'App/Chat/ReferenceLibraries',
  component: ReferenceLibraries,
  args: { agent: 'Pebble', color: 'rgb(217 119 87)', libraries: LIBRARIES }
} satisfies Meta<ReferenceLibrariesProps>

export default meta
type Story = StoryObj<ReferenceLibrariesProps>

export const Offer: Story = {}

export const OneConnected: Story = {
  args: {
    libraries: LIBRARIES.map((library) =>
      library.key === 'inspo' ? { ...library, state: 'connected' } : library
    )
  }
}

export const SignInFailed: Story = {
  args: {
    libraries: LIBRARIES.map((library) =>
      library.key === 'mobbin'
        ? { ...library, error: 'Sign-in to MCP servers needs the desktop app' }
        : library
    )
  }
}
