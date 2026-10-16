import { app } from 'electron'
import electronUpdater, { type ProgressInfo, type UpdateInfo } from 'electron-updater'

import { emit, registerAll, type CallContext } from '../ipc'
import { markExiting } from './windows'

const { autoUpdater } = electronUpdater

/** Set once an update is on disk; restarting then installs it instead of relaunching. */
let downloaded = false

/** The release's notes as Markdown: one text, or one per version skipped over. */
function releaseNotes(info: UpdateInfo): string {
  const notes = info.releaseNotes
  if (!notes) return ''
  if (typeof notes === 'string') return notes
  return notes.map((note) => note.note ?? '').join('\n\n')
}

/** Quits into the installer when an update is waiting; false when there is none. */
export function installDownloadedUpdate(): boolean {
  if (!downloaded) return false
  markExiting()
  autoUpdater.quitAndInstall(false, true)
  return true
}

/**
 * Updates from the release feed `electron-builder` writes into the app (`publish` in
 * `electron/package.json`). Checking and downloading wait for the Software Update window to ask;
 * a downloaded update installs when the app restarts or quits.
 */
export function registerUpdaterHandlers(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = null

  registerAll(
    {
      async check() {
        // A development build has no feed and no signature to check an update against.
        if (!app.isPackaged) return null
        const result = await autoUpdater.checkForUpdates()
        if (!result?.isUpdateAvailable) return null
        return {
          version: result.updateInfo.version,
          currentVersion: app.getVersion(),
          body: releaseNotes(result.updateInfo)
        }
      },
      async download({ sender }: CallContext) {
        const progress = ({ total, delta }: ProgressInfo) =>
          emit(sender, 'updater:progress', { total, delta })
        autoUpdater.on('download-progress', progress)
        try {
          await autoUpdater.downloadUpdate()
          downloaded = true
        } finally {
          autoUpdater.off('download-progress', progress)
        }
      },
      install() {
        // Windows installs by running the installer, which quits the app; elsewhere the update
        // waits on disk for the restart.
        if (process.platform === 'win32') installDownloadedUpdate()
      }
    },
    'updater'
  )
}
