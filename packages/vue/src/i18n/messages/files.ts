import { params } from '@nanostores/i18n'

import { i18n } from '#vue/i18n/create'

export const filesMessageDefaults = {
  importLabel: 'Import',
  importHTMLCSS: 'Import HTML/CSS',
  importHTMLCSSDescription: 'Paste HTML plus optional CSS or compiled Tailwind CSS.',
  importFailed: 'Import failed. Check the HTML and CSS, then try again.',
  importReplacesDocument: 'Import replaces the current document.',
  importing: 'Importing…',
  importToCanvas: 'Import to canvas',
  newTab: 'New tab',
  closeTab: params('Close {name}'),
  unsavedChanges: 'Unsaved changes',
  saveBeforeClosing: params('Save changes to “{name}”?'),
  saveBeforeClosingDescription: 'Your changes will be discarded if you close without saving.',
  discard: 'Don’t Save',
  saveAllBeforeClosing: params('{count} documents have unsaved changes'),
  saveAllBeforeClosingDescription:
    'Save them all, review each one, or discard every change before closing.',
  saveAll: 'Save All',
  reviewChanges: 'Review…',
  discardAll: 'Discard All',
  unsavedDocuments: 'Unsaved documents',
  notRespondingTitle: 'Kalka is not responding',
  notRespondingDescription: 'Close anyway? Changes you have not saved may be lost.',
  closeAnyway: 'Close Anyway',
  clipboardImageUnavailableWeb:
    'Pasted design includes 1 image that cannot be loaded in the web app. Use the desktop app to include it.',
  clipboardImagesUnavailableWeb: params(
    'Pasted design includes {count} images that cannot be loaded in the web app. Use the desktop app to include them.'
  ),
  clipboardImageFetchFailed:
    'Failed to fetch 1 image from Figma. Check that the source file is accessible and try again.',
  clipboardImagesFetchFailed: params(
    'Failed to fetch {count} images from Figma. Check that the source file is accessible and try again.'
  ),
  recentFiles: 'Recent files',
  recentTab: 'Recent',
  homePlace: 'Home',
  dashboard: 'Dashboard',
  filesGroup: 'Files',
  accountAndSettings: 'Account and settings',
  openMenu: 'Open the menu',
  thisComputer: 'On this computer',
  localFiles: 'Local files',
  trashPlace: 'Trash',
  moveToTrash: 'Move to trash',
  movedToTrash: params('{name} is in the trash for 30 days.'),
  restoreFile: 'Restore',
  eraseFile: 'Delete for good',
  eraseFileConfirm: params('{name} will be erased for everyone. This cannot be undone.'),
  trashEmpty: 'The trash is empty. Deleted files wait here 30 days before they are erased.',
  trashedBy: params('Deleted by {name} on {date}'),
  trashedOn: params('Deleted on {date}'),
  erasedOn: params('Erased on {date}'),
  fileActions: params('Actions for {name}'),
  placesLabel: 'Places',
  continueFile: 'Continue',
  recentFilesDescription: 'Continue working on a design or start a new one.',
  noRecentFiles: 'No recent files yet',
  noRecentFilesDescription: 'Files you open in the desktop app will appear here.',
  draftBadge: 'Draft',
  deleteDraft: 'Delete draft',
  draftDeleted: params('Draft “{name}” deleted.'),
  draftsNotKeptRecoveryOff:
    'Drafts stay only while their tab is open. Turn on recovery in Settings to keep them after a reload.',
  draftsNotKeptStorage:
    'Drafts stay only while their tab is open: this browser does not let Kalka keep them after a reload.',
  searchFiles: 'Search files…',
  searchRecentAndStorageFiles: 'Search recent and storage files…',
  newDesign: 'New design',
  noMatchingFiles: params('No files match “{query}”.'),
  saveAsPrompt: 'Save as:',
  browserFileAPINotSupported:
    "Your browser doesn't support the local file API. Files will be downloaded instead of saved in place."
} as const

export const filesMessages = i18n('files', filesMessageDefaults)
