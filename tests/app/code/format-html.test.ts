import { expect, test } from 'bun:test'

import { formatHTML } from '@/app/code/format-html'

test('exported HTML reads one element per line, text kept with its element', () => {
  const html =
    '<style>.btn{padding:8px}.card{gap:4px}</style><section class="card"><h1>Hello</h1><img src="a.png"><p>Read <a href="#">more</a></p></section>'

  expect(formatHTML(html)).toBe(
    [
      '<style>',
      '  .btn{padding:8px}',
      '  .card{gap:4px}',
      '</style>',
      '<section class="card">',
      '  <h1>Hello</h1>',
      '  <img src="a.png">',
      '  <p>Read ',
      '    <a href="#">more</a>',
      '  </p>',
      '</section>'
    ].join('\n')
  )
})
