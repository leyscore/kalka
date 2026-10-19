// Signs the packaged macOS app ad hoc when the build has no Apple certificate. Electron ships
// only its own binary signed by the linker; once electron-builder renames the bundle and edits
// its Info.plist, that signature no longer covers the bundle, and macOS on Apple Silicon calls
// a downloaded copy "damaged" with no way to open it. An ad-hoc signature over the whole bundle
// turns that into the usual unidentified-developer warning, which Privacy & Security can
// override. A build with a certificate (CSC_LINK) is signed by electron-builder right after.
const { execFileSync } = require('node:child_process')
const { join } = require('node:path')

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return
  if (process.env.CSC_LINK || process.env.CSC_NAME) return
  const app = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' })
}
