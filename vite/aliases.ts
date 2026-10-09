import { resolve } from 'node:path'

export function createOpenPencilAliases(rootDir: string) {
  const emptyNodeModule = resolve(rootDir, 'vite/empty-node-module.ts')

  return [
    // The desktop app runs on Electron: Tauri's modules are stand-ins over its IPC bridge.
    {
      find: /^@tauri-apps\/(api\/(?:core|event|path|window|webviewWindow))$/,
      replacement: `${resolve(rootDir, 'src/app/platform/tauri')}/$1`
    },
    {
      find: /^@tauri-apps\/plugin-(fs|dialog|shell|clipboard-manager|opener|os|process|updater)$/,
      replacement: `${resolve(rootDir, 'src/app/platform/tauri/plugin')}/$1`
    },
    // cssom's `browser` build is a script global with no named exports; its CommonJS entry is plain JS.
    {
      find: /^@acemir\/cssom$/,
      replacement: resolve(rootDir, 'packages/dom-css/node_modules/@acemir/cssom/lib/index.js')
    },
    { find: /^fs$/, replacement: emptyNodeModule },
    { find: /^path$/, replacement: emptyNodeModule },
    { find: '@', replacement: resolve(rootDir, 'src') },
    { find: '#vue', replacement: resolve(rootDir, 'packages/vue/src') },
    { find: '#core', replacement: resolve(rootDir, 'packages/core/src') },
    { find: '#dom-css', replacement: resolve(rootDir, 'packages/dom-css/src') },
    {
      find: /^@open-pencil\/dom-css\/browser$/,
      replacement: resolve(rootDir, 'packages/dom-css/src/browser.ts')
    },
    {
      find: /^@open-pencil\/dom-css\/export$/,
      replacement: resolve(rootDir, 'packages/dom-css/src/export/index.ts')
    },
    {
      find: /^@open-pencil\/dom-css\/jsx-runtime$/,
      replacement: resolve(rootDir, 'packages/dom-css/src/import/jsx/runtime.ts')
    },
    {
      find: /^@open-pencil\/dom-css\/jsx-dev-runtime$/,
      replacement: resolve(rootDir, 'packages/dom-css/src/import/jsx/dev-runtime.ts')
    },
    {
      find: /^@open-pencil\/dom-css$/,
      replacement: resolve(rootDir, 'packages/dom-css/src/index.ts')
    },
    {
      find: /^@open-pencil\/scene-graph$/,
      replacement: resolve(rootDir, 'packages/scene-graph/src/index.ts')
    },
    { find: '@open-pencil/scene-graph', replacement: resolve(rootDir, 'packages/scene-graph/src') },
    { find: '#emit', replacement: resolve(rootDir, 'packages/emit/src') },
    {
      find: /^@open-pencil\/emit$/,
      replacement: resolve(rootDir, 'packages/emit/src/index.ts')
    },
    { find: '#design-jsx', replacement: resolve(rootDir, 'packages/design-jsx/src') },
    {
      find: /^@open-pencil\/design-jsx$/,
      replacement: resolve(rootDir, 'packages/design-jsx/src/index.ts')
    },
    { find: /^@open-pencil\/pen$/, replacement: resolve(rootDir, 'packages/pen/src/index.ts') },
    { find: '@open-pencil/pen', replacement: resolve(rootDir, 'packages/pen/src') },
    { find: /^@open-pencil\/kiwi$/, replacement: resolve(rootDir, 'packages/kiwi/src/index.ts') },
    { find: '@open-pencil/kiwi', replacement: resolve(rootDir, 'packages/kiwi/src') },
    { find: /^@open-pencil\/fig$/, replacement: resolve(rootDir, 'packages/fig/src/index.ts') },
    { find: '@open-pencil/fig', replacement: resolve(rootDir, 'packages/fig/src') },
    {
      find: /^@open-pencil\/mcp\/discovery$/,
      replacement: resolve(rootDir, 'packages/mcp/src/transport/discovery.ts')
    },
    {
      find: /^@open-pencil\/mcp\/transport$/,
      replacement: resolve(rootDir, 'packages/mcp/src/transport/paths.ts')
    },
    { find: /^@open-pencil\/vue$/, replacement: resolve(rootDir, 'packages/vue/src/index.ts') },
    { find: '@open-pencil/vue', replacement: resolve(rootDir, 'packages/vue/src') },
    { find: /^@open-pencil\/core$/, replacement: resolve(rootDir, 'packages/core/src/index.ts') },
    { find: '@open-pencil/core', replacement: resolve(rootDir, 'packages/core/src') },
    {
      find: 'opentype.js',
      replacement: resolve(rootDir, 'node_modules/opentype.js/dist/opentype.mjs')
    }
  ]
}
