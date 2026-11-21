import { params } from '@nanostores/i18n'

import { i18n } from '#vue/i18n/create'

export const fontsMessageDefaults = {
  settingsTitle: 'Font settings',
  issueFound: '1 font face is unavailable or substituted',
  issuesFound: params('{count} font faces are unavailable or substituted'),
  selectAffectedLayers: 'Select layers',
  retry: 'Retry fonts',
  retrying: 'Retrying…',
  expandIssues: 'Show font issues',
  collapseIssues: 'Hide font issues',
  noSubstitute: 'no substitute available',
  unsupportedFormatShort: 'unsupported format',
  unsupportedFormat: 'Installed, but in a format Kalka can’t draw yet',
  affectedLayer: '1 affected layer',
  affectedLayerCount: params('{count} affected layers'),
  settingsDesktopDescription:
    'Access system fonts, online providers, fallback packs, and cached downloads.',
  settingsBrowserDescription:
    'Allow browser access to local fonts and manage online font providers.',
  localFonts: 'Local fonts',
  onlineFonts: 'Online fonts',
  downloadedCache: 'Downloaded cache',
  systemFontAccess: 'System font access',
  systemFontsAvailable: 'System fonts are available.',
  allowBrowserFontAccess: 'Allow browser font access when system fonts are missing.',
  onlineFontProviders: 'Online font providers',
  downloadMissingWebFonts: 'Download missing web fonts through enabled providers.',
  webFontProvidersRequireDesktopApp:
    'Online font provider catalogs are unavailable in the web app. Download the desktop app to browse and load provider fonts.',
  fallbackPacks: 'Fallback packs',
  downloadFallbackPacksDescription:
    'Download CJK and Arabic fallbacks before opening files that need them.',
  localFontAccessEnabled: 'Local font access enabled.',
  localFontAccessNotGranted: 'Local font access was not granted.',
  onlineFontProvidersEnabled: 'Online font providers enabled.',
  onlineFontProvidersDisabled: 'Online font providers disabled.',
  providerEnabled: params('Enabled {provider}.'),
  providerDisabled: params('Disabled {provider}.'),
  fallbackDownloaded: 'Fallback fonts downloaded.',
  fallbackDownloadFailed: 'Could not download fallback fonts.',
  downloadedFontCacheCleared: 'Downloaded font cache cleared.',
  downloadedFontCacheClearFailed: 'Could not clear downloaded font cache.',
  clearCache: 'Clear cache',
  addFont: 'Add font…',
  addFontTitle: 'Add a font',
  addFontDescription:
    'Free, open-licence fonts are saved in your document with their licence, so it looks the same offline and for your team.',
  searchCatalogue: 'Search free fonts',
  searchCataloguePlaceholder: 'Search Google Fonts and Fontsource',
  searchCatalogueFor: params('Search free fonts for “{query}”'),
  previewText: 'Preview text',
  previewSample: 'The quick brown fox jumps over the lazy dog',
  addToDocument: 'Add',
  addedToDocument: 'Added',
  adding: 'Adding…',
  variable: 'Variable',
  weightCount: params('{count} weights'),
  oneWeight: '1 weight',
  installOnComputer: 'Also install on this computer',
  dropFonts: 'Drop .woff2, .ttf or .otf files here',
  chooseFiles: 'Choose files…',
  ownFontsLicense:
    'Fonts you add yourself are saved with the document. Check that their licence lets you share them.',
  catalogueUnavailable:
    'The free font catalogue can’t be reached. Check your connection and try again.',
  noCatalogueResults: 'No free font has that name.',
  fontAdded: params('{family} is saved with the document.'),
  fontAddFailed: params('Couldn’t add {family}: {error}'),
  filesRejected: params('Not a font Kalka can keep: {names}'),
  documentSource: 'Document',
  missingFontTitle: '1 font isn’t saved with this document',
  missingFontsTitle: params('{count} fonts aren’t saved with this document'),
  missingFontsDescription:
    'Add them so the design looks exactly as intended, offline and for your team.',
  addMissingFont: 'Add font',
  addMissingFonts: 'Add fonts',
  addingFonts: 'Adding fonts…',
  missingFontsAdded: 'The fonts are saved with the document.',
  replaceFontWith: params('Replace {family} with'),
  fontReplaced: params('{from} replaced with {to}.'),
  dismiss: 'Not now'
} as const

export const fontsMessages = i18n('fonts', fontsMessageDefaults)
