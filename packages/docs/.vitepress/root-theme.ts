import type { DefaultTheme } from 'vitepress'

import { EN, EN_PROG } from './labels.ts'
import { sdkSidebar } from './sdk-sidebar.ts'
import { developmentSidebar, programmableSidebar, referenceSidebar } from './sidebars.ts'

export const rootThemeConfig = (): DefaultTheme.Config => ({
  logo: { light: '/brand/mark.svg', dark: '/brand/mark-dark.svg', alt: 'Kalka' },
  search: { provider: 'local' },

  nav: [
    { text: 'Automation', link: '/programmable/' },
    { text: 'SDK', link: '/programmable/sdk/' },
    { text: 'Reference', link: '/reference/cli' },
    { text: 'Development', link: '/development/contributing' },
    { text: 'kalka.design', link: 'https://kalka.design' }
  ],

  sidebar: {
    '/programmable/sdk/': sdkSidebar(''),
    '/programmable/': programmableSidebar('', EN_PROG),
    '/reference/': referenceSidebar('', 'Reference', EN),
    '/development/': developmentSidebar('', 'Development', EN)
  },

  socialLinks: [{ icon: 'github', link: 'https://github.com/leyscore/kalka' }],

  editLink: {
    pattern: 'https://github.com/leyscore/kalka/edit/main/packages/docs/:path'
  },

  footer: {
    message: 'Released under the MIT License.'
  }
})
