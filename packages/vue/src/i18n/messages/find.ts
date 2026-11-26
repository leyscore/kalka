import { count, params } from '@nanostores/i18n'

import { i18n } from '#vue/i18n/create'

export const findMessageDefaults = {
  title: 'Find and replace',
  search: 'Find',
  searchPlaceholder: 'Find…',
  replacement: 'Replace with',
  replacementPlaceholder: 'Replace with…',
  toggleReplace: 'Replace',
  replace: 'Replace',
  replaceAll: 'Replace all',
  previous: 'Previous result',
  next: 'Next result',
  filters: 'Filters',
  scope: 'Search in',
  currentPage: 'This page',
  allPages: 'All pages',
  lookIn: 'Look in',
  textContent: 'Text content',
  layerNames: 'Layer names',
  matchCase: 'Match case',
  wholeWord: 'Whole words',
  layerTypes: 'Layer types',
  kindText: 'Text',
  kindFrame: 'Frames',
  kindSection: 'Sections',
  kindComponent: 'Components',
  kindInstance: 'Instances',
  kindGroup: 'Groups',
  kindShape: 'Shapes',
  kindImage: 'Images',
  position: params('{current} of {total}'),
  results: count({ one: '{count} result', many: '{count} results' }),
  noResults: 'No results',
  hint: 'Find text and layer names. Enter goes to the next result, Shift+Enter to the previous one.',
  layerName: 'Layer name',
  replaced: count({ one: 'Replaced {count} match', many: 'Replaced {count} matches' })
} as const

export const findMessages = i18n('find', findMessageDefaults)
