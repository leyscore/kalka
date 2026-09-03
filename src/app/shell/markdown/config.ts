import { code } from '@stream-markdown/code'

export const markdownExtensions = {
  code: code({
    theme: ['github-light', 'github-dark'],
    langs: [
      'bash',
      'css',
      'html',
      'javascript',
      'json',
      'markdown',
      'tsx',
      'typescript',
      'vue',
      'yaml'
    ]
  })
}

export const markdownHardenOptions = {
  allowedLinkPrefixes: ['*'],
  allowedImagePrefixes: ['https://'],
  allowedProtocols: ['http', 'https', 'mailto'],
  allowDataImages: false
}
