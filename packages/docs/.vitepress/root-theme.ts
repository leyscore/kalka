import type { DefaultTheme } from 'vitepress'

import { EN, EN_PROG } from './labels.ts'
import { sdkSidebar } from './sdk-sidebar.ts'
import {
  developmentSidebar,
  guideSidebar,
  programmableSidebar,
  referenceSidebar,
  userGuideSidebar
} from './sidebars.ts'

export const rootThemeConfig = (): DefaultTheme.Config => ({
  logo: { light: '/brand/mark.svg', dark: '/brand/mark-dark.svg', alt: 'OpenPencil' },
  search: { provider: 'local' },

  nav: [
    { text: 'Overview', link: '/getting-started' },
    { text: 'User Guide', link: '/user-guide/' },
    { text: 'Automation', link: '/programmable/' },
    { text: 'SDK', link: '/programmable/sdk/' },
    { text: 'Reference', link: '/reference/keyboard-shortcuts' },
    { text: 'Development', link: '/development/contributing' },
    { text: 'Open App', link: 'https://app.openpencil.dev' }
  ],

  sidebar: {
    '/user-guide/': userGuideSidebar('', EN),
    '/programmable/sdk/': sdkSidebar(''),
    '/programmable/': programmableSidebar('', EN_PROG),
    '/reference/': referenceSidebar('', 'Reference', EN),
    '/development/': developmentSidebar('', 'Development', EN),
    '/': guideSidebar('', EN)
  },

  socialLinks: [
    { icon: 'github', link: 'https://github.com/open-pencil/open-pencil' },
    { icon: 'discord', link: 'https://discord.gg/4wXc9fuZfm', ariaLabel: 'Discord' },
    {
      // Octicon "comment-discussion": VitePress ships no icon for GitHub Discussions.
      icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1ZM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Zm13 2a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.458 1.458 0 0 1-2.487 1.03L9.22 12.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.22 2.22v-2.19a.75.75 0 0 1 .75-.75h1a.25.25 0 0 0 .25-.25Z"/></svg>'
      },
      link: 'https://github.com/open-pencil/open-pencil/discussions',
      ariaLabel: 'GitHub Discussions'
    }
  ],

  editLink: {
    pattern: 'https://github.com/open-pencil/open-pencil/edit/master/packages/docs/:path'
  },

  footer: {
    message: 'Released under the MIT License.'
  }
})
