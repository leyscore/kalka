import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'library/index': './src/library/index.ts',
    'render/layout': './src/render/layout.ts'
  },
  platform: 'node',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  outDir: './dist',
  treeshake: false,
  deps: {
    alwaysBundle: ['@kalka/mcp', /^@kalka\/mcp\//],
    neverBundle: ['@kalka/core', /^@kalka\/core\//, 'canvaskit-wasm', /^node:/],
    onlyBundle: false
  }
})
