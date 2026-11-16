// Signs the packaged macOS app as a whole when the build has no Apple certificate. Electron ships
// only its own binary signed by the linker; once electron-builder renames the bundle and edits
// its Info.plist, that signature no longer covers the bundle, and macOS on Apple Silicon calls
// a downloaded copy "damaged" with no way to open it. A signature over the whole bundle turns
// that into the usual unidentified-developer warning, which Privacy & Security can override.
//
// KALKA_MAC_SIGN_IDENTITY names a self-signed certificate (its SHA-1) that every release is signed
// with. Squirrel.Mac installs an update only when it meets the running app's designated
// requirement; an ad-hoc signature's names the build's own code hash, so an ad-hoc copy can never
// update itself, while one signed with the same certificate can. Without it the bundle is signed
// ad hoc. A build with an Apple certificate (CSC_LINK) is signed by electron-builder right after.
const { execFileSync } = require('node:child_process')
const { join } = require('node:path')

exports.default = async function macSign(context) {
  if (context.electronPlatformName !== 'darwin') return
  if (process.env.CSC_LINK || process.env.CSC_NAME) return
  const app = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  const identity = process.env.KALKA_MAC_SIGN_IDENTITY || '-'
  const keychain = process.env.KALKA_MAC_SIGN_KEYCHAIN
  const args = ['--force', '--deep', '--sign', identity, ...(keychain ? ['--keychain', keychain] : [])]
  execFileSync('codesign', [...args, app], { stdio: 'inherit' })
  if (identity !== '-') execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' })
}
