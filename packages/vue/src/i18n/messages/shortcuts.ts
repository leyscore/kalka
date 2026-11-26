import { i18n } from '#vue/i18n/create'

export const shortcutsMessageDefaults = {
  title: 'Keyboard shortcuts',
  description: 'Shortcuts you have already used are highlighted.',
  filter: 'Filter shortcuts',
  noMatches: 'No shortcut matches this search.',
  used: 'Already used',
  help: 'Help',
  categoryTools: 'Tools',
  categoryView: 'View',
  categoryZoom: 'Zoom',
  categoryText: 'Text',
  categoryShape: 'Shape',
  categorySelection: 'Selection',
  categoryEdit: 'Edit',
  categoryTransform: 'Transform',
  categoryArrange: 'Arrange',
  categoryComponents: 'Components',
  categoryFile: 'File',
  categoryAI: 'AI',
  handHold: 'Hand (hold)',
  nudge: 'Nudge',
  nudgeLarge: 'Nudge by 10',
  editSelection: 'Edit or enter the selection',
  selectParent: 'Select parent',
  selectNext: 'Select next layer',
  selectPrevious: 'Select previous layer',
  deselect: 'Deselect or leave',
  setOpacity: 'Set opacity',
  askAI: 'Ask AI about the selection',
  toggleAI: 'Show or hide AI',
  comment: 'Comment',
  commentPins: 'Show or hide comments',
  annotate: 'Annotate the selection'
}

export const shortcutsMessages = i18n('shortcuts', shortcutsMessageDefaults)
