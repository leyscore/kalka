import type { ProgrammableLabels, SidebarLabels } from './labels.ts'
import type { DefaultTheme } from 'vitepress'

export const programmableSidebar = (
  prefix: string,
  labels: ProgrammableLabels,
): DefaultTheme.SidebarItem[] => [
  {
    text: labels.overview,
    items: [
      { text: labels.overview, link: `${prefix}/programmable/` },
      { text: labels.cli, link: '/reference/cli' },
      { text: labels.inspecting, link: `${prefix}/programmable/cli/inspecting` },
      { text: labels.exporting, link: `${prefix}/programmable/cli/exporting` },
      { text: labels.analyzing, link: `${prefix}/programmable/cli/analyzing` },
      { text: labels.comparing, link: '/programmable/cli/comparing' },
      { text: labels.appControl, link: '/programmable/cli/app-control' },
      { text: labels.scripting, link: `${prefix}/programmable/cli/scripting` },
      { text: labels.jsxRenderer, link: `${prefix}/programmable/jsx-renderer` },
      { text: 'Native JavaScript APIs', link: '/programmable/native-api' },
      { text: 'Design authoring reference', link: '/reference/design-authoring' },
      { text: labels.mcpServer, link: '/programmable/mcp-server' },
      { text: labels.aiChat, link: `${prefix}/programmable/ai-chat` },
      ...(!prefix
        ? [
            { text: 'Coding agents', link: '/programmable/coding-agents' },
            {
              text: 'BYOK Compatibility',
              link: '/programmable/byok-provider-compatibility',
            },
          ]
        : []),
      { text: labels.collaboration, link: `${prefix}/programmable/collaboration` },
    ],
  },
]

export const referenceSidebar = (
  prefix: string,
  label: string,
  labels: SidebarLabels,
): DefaultTheme.SidebarItem[] => [
  {
    text: label,
    items: [
      { text: 'Keyboard Shortcuts', link: '/reference/keyboard-shortcuts' },
      { text: 'CLI', link: '/reference/cli' },
      { text: 'Node Types', link: '/reference/node-types' },
      { text: 'Scene Graph', link: '/reference/scene-graph' },
      { text: labels.figmaMatrix, link: `${prefix}/reference/figma-compatibility` },
      ...(!prefix ? [{ text: 'DOM/CSS Mapping', link: '/reference/dom-css-mapping' }] : []),
      { text: 'File Format', link: '/reference/file-format' },
    ],
  },
]

export const developmentSidebar = (
  prefix: string,
  label: string,
  labels: SidebarLabels,
): DefaultTheme.SidebarItem[] => [
  {
    text: label,
    items: [
      { text: 'Contributing', link: `${prefix}/development/contributing` },
      { text: 'Testing', link: `${prefix}/development/testing` },
      { text: labels.architecture, link: `${prefix}/development/architecture` },
      { text: '.fig Reader Architecture', link: '/development/fig-reader' },
      { text: labels.techStack, link: `${prefix}/development/tech-stack` },
      ...(!prefix
        ? [
            { text: 'Roadmap', link: '/development/roadmap' },
            { text: 'Behaviours and Preview', link: '/development/behaviours-and-preview' },
            { text: 'Navigation Performance', link: '/development/navigation-performance' },
            { text: 'Renderer Lifecycle', link: '/development/renderer-lifecycle' },
            { text: 'Renderer Profiler', link: '/development/renderer-profiler' },
            { text: 'Vector Conversion', link: '/development/vector-conversion' },
          ]
        : []),
    ],
  },
]
