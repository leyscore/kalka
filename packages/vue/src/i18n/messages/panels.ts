import { i18n } from '#vue/i18n/create'

import { panelAppearanceMessages } from './panels/appearance'
import { panelAssetMessages } from './panels/assets'
import { panelDocumentMessages } from './panels/document'
import { panelLayoutMessages } from './panels/layout'

/** The panels' messages, one domain kept in files by the part of the panels they belong to. */
export const panelMessageDefaults = {
  ...panelDocumentMessages,
  ...panelAssetMessages,
  ...panelLayoutMessages,
  ...panelAppearanceMessages
} as const

export const panelMessages = i18n('panels', panelMessageDefaults)
