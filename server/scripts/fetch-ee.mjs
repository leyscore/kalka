// Adds the enterprise module (single sign-on, license) to the build, or a stub without it.
//   KALKA_EE_PATH       a local ee.js, for development
//   KALKA_LICENSE_KEY   downloads ee.js from the Kalka license service
// Without either, the server builds and runs without single sign-on.
import { copyFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../src/ee/', import.meta.url))
const service = process.env.KALKA_LICENSE_SERVICE ?? 'https://license.kalka.design'
const version = JSON.parse(
  await (await import('node:fs/promises')).readFile(new URL('../package.json', import.meta.url), 'utf8')
).version

const keyLine = (key) => `export const buildLicenseKey: string | null = ${JSON.stringify(key ?? null)}\n`
const withModule = `import type { EnterpriseModule } from './types'
// @ts-ignore: built from the private enterprise repository
import enterprise from './ee.js'
export default enterprise as EnterpriseModule
`
const stub = `import type { EnterpriseModule } from './types'
export default null as EnterpriseModule | null
`

async function main() {
  if (process.env.KALKA_EE_PATH) {
    await copyFile(process.env.KALKA_EE_PATH, `${dir}ee.js`)
    await writeFile(`${dir}module.ts`, withModule + keyLine(process.env.KALKA_LICENSE_KEY?.trim()))
    console.log('[kalka] Enterprise module added from KALKA_EE_PATH')
    return
  }
  const key = process.env.KALKA_LICENSE_KEY?.trim()
  if (!key) {
    await writeFile(`${dir}module.ts`, stub + keyLine(null))
    console.log('[kalka] No KALKA_LICENSE_KEY: building without single sign-on')
    return
  }
  const response = await fetch(`${service}/v1/ee/${version}.js`, {
    headers: { Authorization: `Bearer ${key}` }
  })
  if (!response.ok) {
    throw new Error(
      `[kalka] The license service refused the enterprise module (${response.status}): ${await response.text()}`
    )
  }
  await writeFile(`${dir}ee.js`, Buffer.from(await response.arrayBuffer()))
  await writeFile(`${dir}module.ts`, withModule + keyLine(key))
  console.log('[kalka] Enterprise module downloaded')
}

await main()
