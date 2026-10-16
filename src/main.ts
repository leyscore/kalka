import { reportBootFailure, runSupportGate } from '@/app/shell/support/gate'
import { migrateLegacyNames } from '@/app/storage/legacy-names'

// Keep this module free of the app bundle: it must evaluate on engines that
// cannot run the app so it can explain why (see src/app/shell/support/).
async function start(): Promise<void> {
  if (!(await runSupportGate())) return
  try {
    // Settings and data saved under the app's previous name move before the app reads them.
    await migrateLegacyNames()
    const { boot } = await import('./boot')
    await boot()
  } catch (error) {
    await reportBootFailure(error)
  }
}

void start()
