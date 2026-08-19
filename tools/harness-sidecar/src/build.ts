import { execFileSync } from 'node:child_process'
import { chmod, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const hostTarget = (): string => {
  if (process.platform === 'darwin')
    return process.arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin'
  if (process.platform === 'linux' && process.arch === 'x64') return 'x86_64-unknown-linux-gnu'
  if (process.platform === 'win32') {
    return process.arch === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc'
  }
  throw new Error(`Unsupported Harness sidecar host: ${process.platform}/${process.arch}`)
}

const target = process.argv[2] ?? process.env.TAURI_ENV_TARGET_TRIPLE ?? hostTarget()
const bunTargetByRustTarget: Record<string, string> = {
  'aarch64-apple-darwin': 'bun-darwin-arm64',
  'x86_64-apple-darwin': 'bun-darwin-x64',
  'x86_64-unknown-linux-gnu': 'bun-linux-x64',
  'x86_64-pc-windows-msvc': 'bun-windows-x64',
  'aarch64-pc-windows-msvc': 'bun-windows-arm64'
}
const bunTarget = bunTargetByRustTarget[target]
if (!bunTarget) throw new Error(`Unsupported Harness sidecar target: ${target}`)

const extension = target.includes('windows') ? '.exe' : ''
const output = join('desktop', 'binaries', `openpencil-harness-${target}${extension}`)
await mkdir(join('desktop', 'binaries'), { recursive: true })
execFileSync(
  'bun',
  [
    'build',
    '--compile',
    `--target=${bunTarget}`,
    'packages/harness/src/stdio.ts',
    '--outfile',
    output
  ],
  { stdio: 'inherit' }
)
if (!extension) await chmod(output, 0o755)
