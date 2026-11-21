// electron-builder's afterPack: flips Electron's fuses, then signs the macOS bundle. Fuses change
// the Electron binary, so they must be flipped before anything signs it; electron-builder's own
// `electronFuses` runs after this hook and would break the signature `./mac-sign.cjs` makes.
//
// - RunAsNode stays on: the bundled MCP server runs as `Kalka` with ELECTRON_RUN_AS_NODE, and so
//   do the commands one-click setup writes into MCP clients (src/handlers/mcp/bundled.ts).
// - NODE_OPTIONS and --inspect are refused, so nothing else runs code as Kalka through them.
// - The app loads only from app.asar, and on macOS that archive must match the hash
//   electron-builder wrote into Info.plist.
// - Cookies on disk are encrypted with the system's keys.
const macSign = require('./mac-sign.cjs').default

exports.default = async function afterPack(context) {
  const fuses = await context.packager.generateFuseConfig({
    runAsNode: true,
    enableCookieEncryption: true,
    enableNodeOptionsEnvironmentVariable: false,
    enableNodeCliInspectArguments: false,
    enableEmbeddedAsarIntegrityValidation: context.electronPlatformName === 'darwin',
    onlyLoadAppFromAsar: true
  })
  await context.packager.addElectronFuses(context, fuses)
  await macSign(context)
}
