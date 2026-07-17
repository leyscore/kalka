export {}

const mod = await import('../dist/index.js')

if (mod.FIG_PACKAGE_STATUS !== 'archive-api' || typeof mod.parseFigBuffer !== 'function') {
  throw new Error('Expected @open-pencil/fig archive API exports')
}

const bytes = mod.writeFigContainer({
  schemaDeflated: new Uint8Array([1]),
  dataRaw: new Uint8Array([2])
})
const document = mod.readFigContainer(bytes)

if (document.dataRaw[0] !== 2) {
  throw new Error('Expected @open-pencil/fig container round-trip')
}
