import type { ProjectFont } from '@kalka/scene-graph'

import { fakeFontBytes } from './font-catalogue'

/** A family as a document keeps it after downloading it: two scripts of one variable file. */
export function sampleProjectFont(family = 'Inter Tight'): ProjectFont {
  return {
    family,
    source: 'fontsource',
    catalogueId: 'inter-tight',
    license: 'OFL-1.1',
    licenseText: 'SIL OPEN FONT LICENSE Version 1.1\n',
    faces: [
      {
        file: 'latin-wght-normal.woff2',
        weight: '100 900',
        style: 'normal',
        unicodeRange: 'U+0000-00FF',
        data: fakeFontBytes('latin')
      },
      {
        file: 'cyrillic-wght-normal.woff2',
        weight: '100 900',
        style: 'normal',
        unicodeRange: 'U+0400-045F',
        data: fakeFontBytes('cyrillic')
      }
    ]
  }
}
