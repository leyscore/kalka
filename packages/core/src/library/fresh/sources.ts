import type { FreshSource } from './types'

const PAPER = {
  library: 'Paper Shaders',
  author: 'Paper',
  license: 'Apache-2.0'
} as const

const FANCY = {
  library: 'Fancy Components',
  author: 'Daniel Petho',
  license: 'MIT'
} as const

const CULT = {
  library: 'Cult UI',
  author: 'Jordan Gilliam (Nolly Studio)',
  license: 'MIT'
} as const

const CODROPS = {
  library: 'Codrops',
  author: 'Codrops',
  license: 'MIT'
} as const

export function paper(original: string): FreshSource {
  return { ...PAPER, original, url: `https://shaders.paper.design/${original}` }
}

export function fancy(original: string): FreshSource {
  return { ...FANCY, original, url: `https://www.fancycomponents.dev/docs/components/${original}` }
}

export function cult(original: string): FreshSource {
  return { ...CULT, original, url: `https://www.cult-ui.com/docs/components/${original}` }
}

export function codrops(original: string): FreshSource {
  return { ...CODROPS, original, url: `https://github.com/codrops/${original}` }
}
