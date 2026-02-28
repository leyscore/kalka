import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OpenPencil',
  description: 'Open-source, AI-native design editor. Figma alternative built from scratch with full .fig file compatibility.',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'OpenPencil' }],
    ['meta', { property: 'og:description', content: 'Open-source, AI-native design editor' }],
  ],

  themeConfig: {
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/keyboard-shortcuts' },
      { text: 'Development', link: '/development/contributing' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Features', link: '/guide/features' },
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'Tech Stack', link: '/guide/tech-stack' },
          { text: 'Comparison', link: '/guide/comparison' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Keyboard Shortcuts', link: '/reference/keyboard-shortcuts' },
          { text: 'Node Types', link: '/reference/node-types' },
          { text: 'MCP Tools', link: '/reference/mcp-tools' },
          { text: 'Scene Graph', link: '/reference/scene-graph' },
          { text: 'File Format', link: '/reference/file-format' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Contributing', link: '/development/contributing' },
          { text: 'Testing', link: '/development/testing' },
          { text: 'OpenSpec Workflow', link: '/development/openspec' },
          { text: 'Roadmap', link: '/development/roadmap' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dannote/open-pencil' },
    ],

    editLink: {
      pattern: 'https://github.com/dannote/open-pencil/edit/main/docs/:path',
    },

    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
